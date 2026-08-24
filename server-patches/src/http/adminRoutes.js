// Rotas de suporte/administração — pra quando o webhook do Hotmart falhar,
// atrasar, ou o cliente contatar sem o correlationCode em mãos. Sem isso, a
// única forma de mexer numa assinatura era editar o SQLite direto via SSH
// (achado real de auditoria, 18/07/2026).
const express = require("express");
const rateLimit = require("express-rate-limit");
const { STATUSES } = require("../domain/Subscription");
const { timingSafeStringEqual } = require("../infrastructure/timingSafeCompare");

function buildAdminRouter({ repository, adminToken }) {
  const router = express.Router();

  // O que este balde existe pra impedir é adivinhação de token — ou seja,
  // tentativa QUE FALHA. Contar acerto quebrava o uso real desde que o Painel
  // ganhou a fila de moderação: ela lista até 30 denúncias, cada clique é um
  // POST /reports/:id mais um reload das métricas (que cai neste mesmo balde,
  // pela ordem de montagem no server.js), e o dono resolvendo a fila levava um
  // 429 no meio do trabalho. Com skipSuccessfulRequests o freio segue valendo
  // pra quem erra o token e some pra quem tem o token certo.
  const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Muitas requisições — tente novamente em alguns minutos." },
  });
  router.use(adminLimiter);

  router.use((req, res, next) => {
    if (!adminToken) return res.status(503).json({ error: "rotas admin não configuradas no servidor (ADMIN_TOKEN ausente)" });
    const received = req.headers["x-admin-token"];
    if (!received || !timingSafeStringEqual(received, adminToken)) {
      return res.status(401).json({ error: "token admin inválido" });
    }
    next();
  });

  // Custo de IA por dia/endpoint (tabela ai_usage, migração 006) — pra
  // acompanhar se o preço da assinatura cobre o uso real e decidir quando
  // vale oferecer pacote de tokens. Últimos 30 dias.
  //
  // Desde 29/07/2026 a resposta separa GENTE de ROBÔ. O canary de 15 em 15
  // minutos (scripts/canary-check.sh) chama /api/chat de verdade e respondia
  // por 96-97 dos ~97 "chats" de um dia — quem lesse `totalPorDia` concluiria
  // que o chat antigo é o recurso mais usado do app, quando o uso humano
  // era zero. As chamadas do canary agora chegam marcadas (endpoint terminado
  // em ":canary", ver ehCanary em src/http/server.js) e saem em campo próprio:
  //   totalHumanoPorDia -> o número pra decidir preço/pacote de tokens
  //   totalCanaryPorDia -> custo do monitoramento, real e visível
  //   totalPorDia       -> soma, como sempre foi (não quebra quem já lia)
  router.get("/ai-usage", (_req, res) => {
    const { db } = require("../infrastructure/db");
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const rows = db
      .prepare("SELECT day, endpoint, count FROM ai_usage WHERE day >= ? ORDER BY day DESC, count DESC")
      .all(cutoff);
    const totalPorDia = {};
    const totalHumanoPorDia = {};
    const totalCanaryPorDia = {};
    for (const r of rows) {
      const ehCanary = String(r.endpoint).endsWith(":canary");
      totalPorDia[r.day] = (totalPorDia[r.day] || 0) + r.count;
      const alvo = ehCanary ? totalCanaryPorDia : totalHumanoPorDia;
      alvo[r.day] = (alvo[r.day] || 0) + r.count;
    }
    res.json({ rows, totalPorDia, totalHumanoPorDia, totalCanaryPorDia });
  });

  // MODERAÇÃO — a ponta "acionável" da fila de denúncias (migração 016 e
  // src/http/moderationRoutes.js). A fila em si o dono VÊ no Painel
  // (GET /painel, que já lê /api/admin/metrics); aqui fica o verbo que
  // resolve cada linha, atrás do mesmo ADMIN_TOKEN. Sem isto a denúncia
  // chegaria e não teria o que fazer com ela, que é metade do que a política
  // de Conteúdo Gerado pelo Usuário do Google Play cobra.
  //
  //   action 'remove'   → apaga o post/comentário denunciado e fecha a linha
  //   action 'dismiss'  → fecha a linha sem apagar nada (denúncia sem razão)
  router.post("/reports/:id", (req, res) => {
    const { db } = require("../infrastructure/db");
    const { action } = req.body || {};
    if (action !== "remove" && action !== "dismiss") {
      return res.status(400).json({ error: "action deve ser 'remove' ou 'dismiss'" });
    }
    const denuncia = db.prepare("SELECT id, kind, target_id, status FROM moderation_reports WHERE id = ?").get(req.params.id);
    if (!denuncia) return res.status(404).json({ error: "denúncia não encontrada" });
    if (denuncia.status !== "open") return res.status(409).json({ error: `denúncia já resolvida (${denuncia.status})` });

    if (action === "remove") {
      if (denuncia.kind === "post") {
        // Mesmo conjunto de DELETEs de DELETE /api/social/posts/:id — apagar
        // só o post deixaria curtida e comentário órfãos no banco.
        db.prepare("DELETE FROM social_posts WHERE id = ?").run(denuncia.target_id);
        db.prepare("DELETE FROM social_likes WHERE post_id = ?").run(denuncia.target_id);
        db.prepare("DELETE FROM social_comments WHERE post_id = ?").run(denuncia.target_id);
      } else if (denuncia.kind === "comment") {
        db.prepare("DELETE FROM social_comments WHERE id = ?").run(denuncia.target_id);
      } else {
        return res.status(400).json({ error: "só denúncia de post ou comentário tem conteúdo pra remover" });
      }
    }
    db.prepare("UPDATE moderation_reports SET status = ?, reviewed_at = ? WHERE id = ?").run(
      action === "remove" ? "removed" : "dismissed",
      new Date().toISOString(),
      req.params.id
    );
    res.json({ ok: true });
  });

  // Suporte sem correlationCode em mãos — só o e-mail que o cliente lembra.
  // Por padrão devolve só o essencial pro atendimento decidir o que fazer
  // (status/plano/renovação) — histórico financeiro completo (valor pago,
  // ID do provedor) só sai com ?full=true explícito, reduzindo o que um
  // ADMIN_TOKEN vazado exporia numa chamada só (achado real de auditoria,
  // 25/07/2026).
  router.get("/subscriptions/search", (req, res) => {
    const email = String(req.query.email || "").trim();
    if (!email) return res.status(400).json({ error: "email é obrigatório" });
    const subs = repository.findByCustomerEmail(email);
    if (req.query.full === "true") return res.json({ subscriptions: subs });
    const reduced = subs.map((s) => ({
      correlationCode: s.correlationCode,
      status: s.status,
      plan: s.plan,
      currentPeriodEnd: s.currentPeriodEnd,
      createdAt: s.createdAt,
    }));
    res.json({ subscriptions: reduced });
  });

  router.get("/subscriptions/:correlationCode", (req, res) => {
    const sub = repository.findByCorrelationCode(req.params.correlationCode);
    if (!sub) return res.status(404).json({ error: "não encontrado" });
    res.json({ subscription: sub });
  });

  // Força uma transição de status manualmente — pra quando o webhook falhou/
  // atrasou/reentregou fora de ordem e o suporte precisa corrigir na hora.
  // NUNCA pula a máquina de estados (Subscription.transitionTo ainda valida
  // a transição) — evita um estado impossível mesmo com override manual.
  router.post("/subscriptions/:correlationCode/status", (req, res) => {
    const { status, reason } = req.body || {};
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ error: `status deve ser um de: ${STATUSES.join(", ")}` });
    }
    if (!reason || typeof reason !== "string" || !reason.trim()) {
      return res.status(400).json({ error: "reason é obrigatório (fica registrado no histórico da assinatura)" });
    }
    const subscription = repository.findByCorrelationCode(req.params.correlationCode);
    if (!subscription) return res.status(404).json({ error: "não encontrado" });

    const fromStatus = subscription.status;
    try {
      subscription.transitionTo(status);
    } catch (err) {
      return res.status(409).json({ error: err.message });
    }
    repository.save(subscription);
    repository.logEvent({
      correlationCode: subscription.correlationCode,
      fromStatus,
      toStatus: subscription.status,
      rawEvent: `ADMIN_OVERRIDE(${reason.trim()})`,
      rawPayload: null,
    });
    res.json({ ok: true, subscription });
  });

  // Último recurso do suporte pro acesso por conta: vincular (ou desvincular)
  // manualmente uma assinatura a uma conta do Supabase. É o ÚNICO caminho de
  // vínculo sem prova de posse nenhuma — nem e-mail verificado, nem o
  // correlationCode do aparelho — e por isso vive atrás do ADMIN_TOKEN.
  //
  // Quando é necessário: a pessoa perdeu o aparelho (não tem mais o código) E
  // pagou com um e-mail diferente do e-mail de login (PayPal, cartão de
  // terceiro). Nesse caso /me e /claim não alcançam, e sem esta rota a única
  // saída seria editar o SQLite via SSH.
  //
  // ATENÇÃO OPERACIONAL: ADMIN_TOKEN ainda não está configurado no servidor —
  // todas as rotas admin respondem 503. Configurar precisa entrar no MESMO
  // deploy, senão o último recurso de suporte não existe de fato.
  router.post("/subscriptions/:correlationCode/link", (req, res) => {
    const { supabaseUserId, accountEmail, reason } = req.body || {};
    if (!reason || typeof reason !== "string" || !reason.trim()) {
      return res.status(400).json({ error: "reason é obrigatório (fica registrado no histórico da assinatura)" });
    }
    // null/"" = desvincular (erro de suporte tem que ser reversível).
    const userId = supabaseUserId === null || supabaseUserId === undefined || supabaseUserId === "" ? null : supabaseUserId;
    if (userId !== null && (typeof userId !== "string" || !/^[0-9a-fA-F-]{10,64}$/.test(userId))) {
      return res.status(400).json({ error: "supabaseUserId deve ser o UUID da conta (ou null para desvincular)" });
    }

    const subscription = repository.findByCorrelationCode(req.params.correlationCode);
    if (!subscription) return res.status(404).json({ error: "não encontrado" });

    const previousOwner = subscription.supabaseUserId || null;
    const changed = repository.setAccountLink({
      correlationCode: subscription.correlationCode,
      supabaseUserId: userId,
      accountEmail,
    });
    if (!changed) return res.status(409).json({ error: "nada foi alterado" });

    repository.logEvent({
      correlationCode: subscription.correlationCode,
      fromStatus: null,
      toStatus: null,
      rawEvent: `ACCOUNT_LINK(admin: ${reason.trim()}) de=${previousOwner || "(sem dono)"} para=${userId || "(sem dono)"}`,
      rawPayload: null,
    });
    res.json({ ok: true, subscription: repository.findByCorrelationCode(subscription.correlationCode) });
  });

  return router;
}

module.exports = { buildAdminRouter };
