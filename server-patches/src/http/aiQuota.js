// COTA DE IA NO SERVIDOR — o paywall de verdade.
//
// ===========================================================================
// LINHAS DE MOUNT — JÁ ESTÃO NO server.js (não é um passo pendente):
//
//   const aiQuota = buildAiQuota({ getAccountSubscription, isExempt: ehCanary });
//   app.post("/api/chat", aiLimiter, optionalAuth, aiQuota.gate("chat"), ...)
//   ...e o mesmo par (optionalAuth + aiQuota.gate) nas outras 9 rotas de IA.
//
// A ORDEM faz parte do contrato: aiLimiter (freio por IP) → optionalAuth
// (descobre QUEM é, sem nunca devolver 401 por falta de token) → gate (decide
// se pode e cobra a cota). Sem o optionalAuth antes, req.userId nunca existe
// e TODO mundo cai no balde anônimo — inclusive o assinante.
// ===========================================================================
//
// O PROBLEMA (auditoria de 30/07/2026, antes de o dono divulgar o app):
// nenhuma das 10 rotas de IA checava autenticação OU assinatura. O único freio
// de pagamento era o AsyncStorage do aparelho (lib/featureUsage.js e
// lib/chatFreeMessages.js no app). Ou seja:
//
//   (a) localStorage.clear() no DevTools — ou simplesmente uma aba anônima —
//       devolvia as 9 leituras grátis, indefinidamente;
//   (b) curl sem token nenhum, ~60 chamadas/15min por IP (o aiLimiter) =
//       ~5.700 chamadas/dia POR IP, todas na conta Anthropic do dono. O canary
//       (scripts/canary-check.sh) só avisa DEPOIS que o crédito zerou.
//
// A CORREÇÃO, em uma frase: a cota grátis passa a ser contada no BANCO, por
// CONTA (o `sub` do JWT do Supabase, verificado via JWKS — mesmo mecanismo que
// /api/social e /api/subscription/me já usam em produção), e o assinante passa
// sem cota nenhuma.
//
// ---------------------------------------------------------------------------
// A DECISÃO SOBRE QUEM ESTÁ DESLOGADO (a parte que não é óbvia)
// ---------------------------------------------------------------------------
// Bloquear tudo pra quem não tem conta seria seguro e burro: hoje a pessoa
// entra no app SEM login (o app só exige conta na tela de Planos), usa UMA
// leitura grátis e é isso que a leva a criar conta e depois assinar. Matar
// essa experimentação mata o funil inteiro — e o funil já é o problema
// (~40 pessoas entraram, ZERO iniciaram checkout, ver migração 010).
//
// Então a linha não é "logado x deslogado", é CUSTO DA ROTA:
//
//   TEXTO   (chat, dream, enhance-insight, weekly-insight,
//            coffee-weekly-summary) — deslogado PODE, com uma cota pequena por
//            IP+dia (ANON_DAILY_LIMIT). Corpo pequeno, sem imagem, sem sharp:
//            ~1k-2k tokens de entrada + até 600 de saída no Haiku 4.5. O teto
//            de gasto de um IP anônimo por dia fica na casa de centavos, e é
//            esse "prova antes de criar conta" que traz cliente.
//
//   IMAGEM  (palm, face, foot, moles, coffee) — EXIGE CONTA (401
//            login_required). Três motivos, e nenhum é ideológico:
//              1. são as únicas rotas que aceitam corpo de até 10 MB;
//              2. cada chamada roda compressImage (sharp) — decodificar e
//                 redimensionar uma foto é CPU e RAM de verdade numa VPS de
//                 6 GB que roda, no MESMO processo, o SQLite síncrono onde
//                 mora a assinatura de quem paga. Marteladas aqui não custam
//                 só dinheiro: derrubam checkout e webhook junto;
//              3. são as mais caras por chamada — a imagem entra como ~1,5k
//                 tokens ANTES do prompt, e a resposta é a mais longa (600).
//            O custo de produto é baixo: quem chegou pra experimentar ainda
//            tem Chat e Sonhos de graça, e o 401 do app não vira "erro", vira
//            um convite explícito a criar conta (code: "login_required").
//
// ---------------------------------------------------------------------------
// FAIL-OPEN x FAIL-CLOSED
// ---------------------------------------------------------------------------
// Se ESTE módulo quebrar (banco fora, exceção inesperada):
//   - requisição AUTENTICADA → passa (fail-open). Quem está logado é
//     identificável, já passou pelo aiLimiter, e travar assinante por um erro
//     técnico nosso é pior que a chamada extra.
//   - requisição ANÔNIMA → 503 (fail-closed). É exatamente o perfil do ataque
//     (b); na dúvida, anônimo não gasta o cartão do dono.
const crypto = require("node:crypto");
const { ipKeyGenerator } = require("express-rate-limit");
const { db } = require("../infrastructure/db");
const { isEmailVerified } = require("./accountAuth");

// ---------------------------------------------------------------------------
// Classificação das rotas
// ---------------------------------------------------------------------------
// tier: "text" (deslogado pode, com cota por IP+dia) | "vision" (exige conta).
// bucket: qual cota da CONTA a rota consome. Os baldes espelham o paywall que
// o app já mostra hoje, pra que a régua do servidor nunca seja mais apertada
// que a que a pessoa vê na tela:
//   - as 4 leituras com foto da PalmScreen (palma/rosto/pé/pintas) dividem UM
//     FEATURE_KEY no app, então dividem UM balde aqui;
//   - o chat tem FREE_MESSAGE_LIMIT = 2 no app, então 2 aqui;
//   - os três resumos de IA (insight de voz, insight da semana, semana do
//     café) são acessórios do Diário e dividem um balde só.
const ROUTE_CONFIG = {
  chat: { bucket: "chat", tier: "text" },
  dream: { bucket: "dream", tier: "text" },
  "enhance-insight": { bucket: "insight", tier: "text" },
  "weekly-insight": { bucket: "insight", tier: "text" },
  "coffee-weekly-summary": { bucket: "insight", tier: "text" },
  palm: { bucket: "vision", tier: "vision" },
  face: { bucket: "vision", tier: "vision" },
  foot: { bucket: "vision", tier: "vision" },
  moles: { bucket: "vision", tier: "vision" },
  coffee: { bucket: "coffee", tier: "vision" },
};

const TOTAL_BUCKET = "__total";
const ANON_BUCKET = "__anon";
const LIFETIME = "lifetime";

// Retenção das linhas ANÔNIMAS (as de conta são vitalícias — apagar devolveria
// a cota grátis, que é o buraco que este módulo fecha). 7 dias é folga
// suficiente pra investigar abuso recente sem guardar hash de IP pra sempre.
const ANON_RETENTION_DAYS = 7;

function intFromEnv(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || String(raw).trim() === "") return fallback;
  const n = Number.parseInt(String(raw), 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

// Lidos a CADA chamada (mesmo padrão do OWNER_EMAILS em
// GetAccountSubscriptionUseCase): o módulo é construído uma vez no arranque,
// mas a régua continua ajustável por env sem congelar no instante do require —
// e é isso que deixa o teste apertar/afrouxar cota sem recarregar o app.
function limits() {
  return {
    buckets: {
      chat: intFromEnv("AI_FREE_CHAT", 2),
      vision: intFromEnv("AI_FREE_VISION", 1),
      coffee: intFromEnv("AI_FREE_COFFEE", 1),
      dream: intFromEnv("AI_FREE_DREAM", 1),
      insight: intFromEnv("AI_FREE_INSIGHT", 2),
    },
    // Teto agregado da conta. Hoje é igual à soma dos baldes (2+1+1+1+2 = 7),
    // ou seja, não aperta nada — ele existe como rede: no dia em que alguém
    // acrescentar um balde novo aqui, o custo máximo por conta continua
    // limitado por ESTE número, não pela soma acidental dos baldes.
    total: intFromEnv("AI_FREE_TOTAL", 7),
    // Deslogado, por IP e por DIA, somando todas as rotas de texto. 5 chamadas
    // é "experimentar de verdade" (uma conversa curta + um sonho) e ao mesmo
    // tempo ~1/1000 do que o ataque (b) conseguia antes.
    anonDaily: intFromEnv("AI_FREE_ANON_DAILY", 5),
  };
}

// ---------------------------------------------------------------------------
// Persistência
// ---------------------------------------------------------------------------
// Preparados uma vez (better-sqlite3 é síncrono e o custo real está no
// prepare, não no run).
const takeStmt = db.prepare(`
  INSERT INTO ai_free_quota (subject_type, subject_id, bucket, period, used, created_at, updated_at)
  VALUES (@type, @id, @bucket, @period, 1, @now, @now)
  ON CONFLICT(subject_type, subject_id, bucket, period)
  DO UPDATE SET used = used + 1, updated_at = @now
  WHERE used < @limit
`);

const refundStmt = db.prepare(`
  UPDATE ai_free_quota SET used = MAX(used - 1, 0), updated_at = @now
  WHERE subject_type = @type AND subject_id = @id AND bucket = @bucket AND period = @period
`);

const readStmt = db.prepare(`
  SELECT used FROM ai_free_quota
  WHERE subject_type = @type AND subject_id = @id AND bucket = @bucket AND period = @period
`);

const purgeAnonStmt = db.prepare(`
  DELETE FROM ai_free_quota WHERE subject_type = 'ip' AND period < ?
`);

// Erro de controle de fluxo: é ele que aborta (e faz o SQLite reverter) a
// transação que consome balde + total, pra nunca sobrar meia cobrança.
class QuotaBlocked extends Error {
  constructor(bucket) {
    super(`cota esgotada (${bucket})`);
    this.name = "QuotaBlocked";
    this.bucket = bucket;
  }
}

// `changes === 0` = o UPDATE condicional não venceu, ou seja, `used` já estava
// no limite. É ATÔMICO de propósito: duas requisições simultâneas do mesmo
// usuário não conseguem as duas "ler 0, ver que cabe, gravar 1".
function take({ type, id, bucket, period, limit, now }) {
  if (!Number.isFinite(limit) || limit <= 0) return false;
  return takeStmt.run({ type, id, bucket, period, limit, now }).changes > 0;
}

function refund({ type, id, bucket, period }) {
  try {
    refundStmt.run({ type, id, bucket, period, now: new Date().toISOString() });
  } catch (err) {
    console.error("[aiQuota] falha ao estornar cota:", err && err.message);
  }
}

// Conta: consome o balde da rota E o teto agregado, tudo ou nada.
const consumeAccount = db.transaction(({ userId, bucket, bucketLimit, totalLimit, now }) => {
  if (!take({ type: "account", id: userId, bucket, period: LIFETIME, limit: bucketLimit, now })) {
    throw new QuotaBlocked(bucket);
  }
  if (!take({ type: "account", id: userId, bucket: TOTAL_BUCKET, period: LIFETIME, limit: totalLimit, now })) {
    throw new QuotaBlocked(TOTAL_BUCKET);
  }
});

// ---------------------------------------------------------------------------
// Hash do IP (nunca o IP em claro — mesma regra de funnel_events)
// ---------------------------------------------------------------------------
let saltCache = null;

function ipSalt() {
  if (saltCache) return saltCache;
  const row = db.prepare("SELECT value FROM app_secrets WHERE key = 'ai_quota_ip_salt'").get();
  if (row && row.value) {
    saltCache = row.value;
    return saltCache;
  }
  const value = crypto.randomBytes(32).toString("hex");
  db.prepare("INSERT OR IGNORE INTO app_secrets (key, value, created_at) VALUES (?, ?, ?)").run(
    "ai_quota_ip_salt",
    value,
    new Date().toISOString()
  );
  // Relê: se dois processos nascerem juntos, vale o que ficou gravado.
  saltCache = db.prepare("SELECT value FROM app_secrets WHERE key = 'ai_quota_ip_salt'").get().value;
  return saltCache;
}

// ipKeyGenerator é o da própria express-rate-limit (o mesmo já usado em
// accountRoutes.js): ele normaliza IPv6 por sub-rede /56. Sem isso, um
// abusador com um /64 residencial trocaria de endereço a cada requisição e a
// cota anônima não existiria na prática.
function hashIp(ip) {
  const normalized = ipKeyGenerator(ip || "");
  return crypto.createHash("sha256").update(`${ipSalt()}|${normalized}`).digest("hex").slice(0, 32);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// Limpeza preguiçosa das linhas anônimas velhas — no máximo uma vez por hora
// por processo, e nunca no caminho de quem está esperando resposta (é um
// DELETE por índice, mas ainda assim roda depois de a decisão ter sido tomada).
let lastPurgeAt = 0;
function purgeOldAnonRows() {
  const agora = Date.now();
  if (agora - lastPurgeAt < 60 * 60 * 1000) return;
  lastPurgeAt = agora;
  try {
    const corte = new Date(agora - ANON_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    purgeAnonStmt.run(corte);
  } catch (err) {
    console.error("[aiQuota] falha na limpeza de cota anônima:", err && err.message);
  }
}

// ---------------------------------------------------------------------------
// Respostas
// ---------------------------------------------------------------------------
// `code` é o contrato com o app (lib/aiClient.js). O app HOJE trata qualquer
// !resp.ok como "caiu, mostra o mock" — servir uma leitura enlatada bem no
// momento em que o paywall foi acionado é a pior resposta possível: entrega de
// graça exatamente o que acabou de ser negado E ensina a pessoa que o produto
// pago é aquele texto genérico. Por isso o corpo vem com um `code` estável,
// que o cliente usa pra distinguir "sem cota" de "sem rede".
const CODE_QUOTA = "quota_exhausted";
const CODE_LOGIN = "login_required";

function respostaSemCota(res, { scope, bucket, loginHelps }) {
  return res.status(402).json({
    error: "Sua cota gratuita acabou. Assine o Cosmic Guide para continuar.",
    code: CODE_QUOTA,
    scope,
    bucket: bucket || null,
    // Deslogado que estourou a cota do IP ainda ganha cota nova ao criar
    // conta — o app usa isto pra oferecer "criar conta" antes de "assinar".
    loginHelps: Boolean(loginHelps),
    upgrade: true,
  });
}

function respostaExigeLogin(res) {
  return res.status(401).json({
    error: "Entre na sua conta para usar as leituras com foto.",
    code: CODE_LOGIN,
    scope: "vision",
    upgrade: false,
  });
}

// ---------------------------------------------------------------------------
// buildAiQuota
// ---------------------------------------------------------------------------
// getAccountSubscription: o MESMO caso de uso que responde GET
//   /api/subscription/me. Reusar é o ponto — se um dia "ter acesso" mudar de
//   regra (allowlist de dono, past_due, escopo), as duas respostas mudam
//   juntas e nunca discordam.
// isExempt: escapatória pro canary (scripts/canary-check.sh chama /api/chat
//   de verdade, sem token, do loopback, 4x por hora — sem isenção ele torraria
//   a cota anônima do próprio servidor e o monitoramento morreria em silêncio).
function buildAiQuota({ getAccountSubscription, isExempt = () => false } = {}) {
  // Cache de acesso por conta. O caso de uso faz leitura no SQLite (e um
  // backfill preguiçoso por e-mail), e o app pode disparar várias chamadas de
  // IA em sequência — 5 min é a mesma janela que o app já usa pra rechecar
  // assinatura (CoupleContext).
  //
  // A ASSIMETRIA IMPORTANTE: o cache só é usado pra DEIXAR PASSAR ou pra
  // deixar consumir cota. Na hora de NEGAR (402), o acesso é resolvido de
  // novo, FRESCO — assim quem acabou de assinar nunca leva um paywall por
  // causa de um cache de 5 minutos.
  const ACCESS_TTL_MS = 5 * 60 * 1000;
  const ACCESS_CACHE_MAX = 5000;
  const accessCache = new Map();

  function resolveAccess(req, { fresh = false } = {}) {
    const userId = req.userId;
    if (!userId) return { hasAccess: false, known: true };
    if (fresh) accessCache.delete(userId);

    const cached = accessCache.get(userId);
    if (cached && Date.now() - cached.at < ACCESS_TTL_MS) return { hasAccess: cached.hasAccess, known: true };

    // emailVerified vem do payload JÁ VERIFICADO (nunca de body/query), e o
    // e-mail só é REPASSADO quando verificado: o backfill por email_match
    // dentro do caso de uso é a única via de vínculo sem prova de posse, e a
    // rota /me só o permite atrás do requireVerifiedEmail. Aqui não existe
    // esse middleware (a rota de IA não pode exigir e-mail confirmado), então
    // a mesma garantia é dada passando `email: null` quando não verificado —
    // sem isso, uma conta com e-mail não confirmado poderia herdar a
    // assinatura de um terceiro só chamando /api/chat.
    const emailVerified = isEmailVerified(req.authPayload);
    const email = emailVerified ? req.userEmail || null : null;

    try {
      const account = getAccountSubscription.execute({ userId, email, emailVerified });
      const hasAccess = Boolean(account && account.hasAccess);
      if (accessCache.size >= ACCESS_CACHE_MAX) accessCache.clear();
      accessCache.set(userId, { at: Date.now(), hasAccess });
      return { hasAccess, known: true };
    } catch (err) {
      // Erro aqui é banco/infra, não "não assina". known:false faz o gate
      // deixar passar SEM consumir cota — nunca acusar de caloteiro um
      // assinante por causa de uma falha nossa.
      console.error("[aiQuota] falha ao resolver acesso da conta:", err && err.message);
      return { hasAccess: false, known: false };
    }
  }

  // Estorno automático: a cota é reservada ANTES do provider (senão duas
  // chamadas simultâneas passam as duas), então toda resposta que NÃO for
  // sucesso devolve o crédito. Cobre de uma vez o 400 de validação, o 503 de
  // "IA não configurada" e o 500 do provider — sem ter que mexer no catch de
  // cada uma das 10 rotas.
  function armarEstorno(req, res, alvo) {
    req.aiQuotaCharged = alvo;
    res.on("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 400) return;
      refund(alvo);
    });
  }

  function gate(routeName) {
    const cfg = ROUTE_CONFIG[routeName];
    if (!cfg) throw new Error(`[aiQuota] rota desconhecida: ${routeName}`);

    return function aiQuotaGate(req, res, next) {
      let anonimo = true;
      try {
        if (isExempt(req)) return next();

        const now = new Date().toISOString();
        const lim = limits();
        const userId = req.userId || null;
        anonimo = !userId;

        // --- deslogado --------------------------------------------------
        if (!userId) {
          // AI_ANON_VISION=1 é a válvula do dono: se o relatório de funil
          // (scripts/funil.js, degrau 'login_wall') mostrar que a exigência de
          // conta nas leituras com foto está segurando gente demais, dá pra
          // abrir sem deploy — elas passam a valer contra a MESMA cota anônima
          // por IP+dia das rotas de texto, nunca sem cota. Fica DESLIGADA por
          // padrão porque são as rotas caras (10 MB de corpo + sharp + a
          // imagem entrando como ~1,5k tokens antes do prompt).
          if (cfg.tier === "vision" && process.env.AI_ANON_VISION !== "1") return respostaExigeLogin(res);
          const alvo = {
            type: "ip",
            id: hashIp(req.ip),
            bucket: ANON_BUCKET,
            period: today(),
          };
          if (!take({ ...alvo, limit: lim.anonDaily, now })) {
            purgeOldAnonRows();
            return respostaSemCota(res, { scope: "ip", bucket: null, loginHelps: true });
          }
          purgeOldAnonRows();
          armarEstorno(req, res, alvo);
          return next();
        }

        // --- logado -----------------------------------------------------
        const acesso = resolveAccess(req);
        // Assinante (ou dono na OWNER_EMAILS) passa sem cota nenhuma — é
        // exatamente o que ele comprou. `known:false` (banco falhou) também
        // passa, e de propósito não consome cota: ver fail-open no topo.
        if (acesso.hasAccess || !acesso.known) {
          req.aiSubscriber = acesso.hasAccess;
          return next();
        }

        try {
          consumeAccount({
            userId,
            bucket: cfg.bucket,
            bucketLimit: lim.buckets[cfg.bucket] ?? 0,
            totalLimit: lim.total,
            now,
          });
        } catch (err) {
          if (!(err instanceof QuotaBlocked)) throw err;
          // Última chance antes do muro: resolve o acesso de novo, sem cache.
          // Quem assinou nos últimos 5 minutos entra por aqui.
          if (resolveAccess(req, { fresh: true }).hasAccess) return next();
          return respostaSemCota(res, { scope: "account", bucket: err.bucket, loginHelps: false });
        }

        armarEstorno(req, res, { type: "account", id: userId, bucket: cfg.bucket, period: LIFETIME });
        // O estorno do balde da rota cobre o caso comum; o teto agregado
        // também precisa voltar, senão uma rota que falhou consome '__total'
        // pra sempre.
        res.on("finish", () => {
          if (res.statusCode >= 200 && res.statusCode < 400) return;
          refund({ type: "account", id: userId, bucket: TOTAL_BUCKET, period: LIFETIME });
        });
        return next();
      } catch (err) {
        console.error(`[aiQuota] erro inesperado em ${routeName}:`, err && err.message);
        // Fail-open pra quem está logado, fail-closed pra anônimo — ver o
        // bloco de comentário no topo do arquivo.
        if (anonimo) return res.status(503).json({ error: "cota indisponível no momento", code: "quota_unavailable" });
        return next();
      }
    };
  }

  // Só pra teste e pra rota admin: quanto já foi gasto.
  function used({ type, id, bucket, period }) {
    const row = readStmt.get({ type, id, bucket, period });
    return row ? row.used : 0;
  }

  return { gate, used, resolveAccess, _accessCache: accessCache };
}

module.exports = {
  buildAiQuota,
  ROUTE_CONFIG,
  TOTAL_BUCKET,
  ANON_BUCKET,
  LIFETIME,
  CODE_QUOTA,
  CODE_LOGIN,
  limits,
  hashIp,
};
