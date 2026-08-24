// MODERAÇÃO — denúncia e bloqueio (política de Conteúdo Gerado pelo Usuário
// do Google Play). O feed social vai pra Play Store, e a política exige três
// coisas que não existiam: denunciar conteúdo dentro do app, bloquear uma
// pessoa, e um caminho de moderação em que a denúncia CHEGA em alguém e é
// acionável. Até aqui o único controle era "o autor apaga o próprio post".
//
// Rotas (contrato compartilhado com o lote de denúncia de IA):
//   POST   /api/moderation/report  { kind, targetId?, reason, detail? } -> 200 { ok: true }
//   POST   /api/moderation/block   { blockedUserId }                    -> 200 { ok: true }
//   DELETE /api/moderation/block   { blockedUserId }                    -> 200 { ok: true }
//   GET    /api/moderation/blocks                                       -> 200 { blocked: [...] }
//
// AUTENTICAÇÃO: bloquear exige login sempre (o bloqueio pertence a uma conta;
// sem `sub` verificado não há quem bloqueie). Denunciar aceita anônimo de
// propósito — a superfície de IA existe antes do login (kind 'ai'), e exigir
// conta ali fecharia justamente o canal que a política manda abrir. A ÚNICA
// exceção é kind 'user': denunciar uma PESSOA sem estar logado é convite pra
// fila de denúncia virar arma de brigada.
//
// O QUE GUARDA: o conteúdo denunciado, num instantâneo tirado na hora
// (migração 016). Denúncia sem conteúdo é inacionável — o autor apaga o post
// e quem modera fica com um id órfão e um motivo, sem nada pra julgar.
const express = require("express");
const rateLimit = require("express-rate-limit");
const { db } = require("../infrastructure/db");
const { requireAuth } = require("./socialAuth");
const { optionalAuth } = require("./accountAuth");
const { stripControlChars } = require("../infrastructure/textSanitize");

const router = express.Router();

const KINDS = new Set(["ai", "post", "comment", "user"]);
const REASON_MAX = 40;
const DETAIL_MAX = 4000;
const CONTENT_MAX = 4000;

// Mais apertado que o writeLimiter do feed (60/15min): denúncia é ação
// pontual, e um balde generoso aqui é o caminho pra afogar a fila de moderação
// em ruído automatizado.
const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições — tente novamente em alguns minutos." },
});

const blockLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições — tente novamente em alguns minutos." },
});

function nowIso() {
  return new Date().toISOString();
}

function texto(valor, max) {
  if (typeof valor !== "string") return null;
  const limpo = stripControlChars(valor).trim().slice(0, max);
  return limpo || null;
}

// Instantâneo do que foi denunciado: quem escreveu e o quê. Conteúdo null
// quando o alvo não existe mais (post apagado entre o toque e a requisição) —
// a denúncia ainda é registrada, e o Painel mostra o buraco em vez de sumir
// com ela.
function instantaneo(kind, targetId) {
  if (kind === "post") {
    const p = db.prepare("SELECT user_id, title, body FROM social_posts WHERE id = ?").get(targetId);
    return p ? { autor: p.user_id, conteudo: `${p.title}\n\n${p.body}`.slice(0, CONTENT_MAX) } : null;
  }
  if (kind === "comment") {
    const c = db.prepare("SELECT user_id, body FROM social_comments WHERE id = ?").get(targetId);
    return c ? { autor: c.user_id, conteudo: c.body.slice(0, CONTENT_MAX) } : null;
  }
  if (kind === "user") {
    const u = db.prepare("SELECT display_name, username FROM social_profiles WHERE user_id = ?").get(targetId);
    return { autor: targetId, conteudo: u ? `${u.display_name} (@${u.username})` : null };
  }
  // 'ai' não tem linha em tabela nenhuma. O texto gerado, se a tela decidir
  // mandar, chega em `detail` — essa decisão é de quem denuncia (ver
  // components/ReportarIA.js), não desta rota.
  return null;
}

router.post("/report", reportLimiter, optionalAuth, (req, res) => {
  const { kind, targetId, reason, detail } = req.body || {};
  if (!KINDS.has(kind)) return res.status(400).json({ error: "kind deve ser ai, post, comment ou user" });
  if (kind === "user" && !req.userId) return res.status(401).json({ error: "token de autenticação ausente" });

  const motivo = texto(reason, REASON_MAX);
  if (!motivo) return res.status(400).json({ error: "reason é obrigatório" });

  const alvo = targetId === undefined || targetId === null ? null : String(targetId).slice(0, 64) || null;
  if (kind !== "ai" && !alvo) return res.status(400).json({ error: "targetId é obrigatório" });

  const snap = alvo ? instantaneo(kind, alvo) : null;
  const info = db
    .prepare(
      `INSERT INTO moderation_reports
         (kind, target_id, target_user_id, reporter_id, reason, detail, content, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?)`
    )
    .run(
      kind,
      alvo,
      snap ? snap.autor : null,
      req.userId || null,
      motivo,
      texto(detail, DETAIL_MAX),
      snap ? snap.conteudo : null,
      nowIso()
    );

  // A fila mora no Painel do Dono, mas o log é o que aparece sem ninguém
  // abrir nada — é por onde a denúncia "chega" mesmo quando o painel fica
  // dias sem ser aberto. Sem conteúdo na linha: log não é lugar de UGC.
  console.warn(`[moderation] denúncia #${info.lastInsertRowid} kind=${kind} reason=${motivo} alvo=${alvo || "—"}`);
  res.json({ ok: true });
});

function alvoDoBloqueio(req, res) {
  const { blockedUserId } = req.body || {};
  const alvo = typeof blockedUserId === "string" ? blockedUserId.trim() : "";
  if (!alvo) {
    res.status(400).json({ error: "blockedUserId é obrigatório" });
    return null;
  }
  if (alvo === req.userId) {
    res.status(400).json({ error: "não dá pra bloquear a si mesmo" });
    return null;
  }
  return alvo;
}

// Lista somente os bloqueios feitos pela própria conta. Nunca revela quem
// bloqueou o usuário (isso viraria ferramenta de retaliação). LEFT JOIN mantém
// a ação reversível mesmo quando o perfil bloqueado foi apagado depois.
router.get("/blocks", blockLimiter, requireAuth, (req, res) => {
  const blocked = db
    .prepare(
      `SELECT b.blocked_user_id AS user_id,
              b.created_at,
              p.display_name,
              p.username,
              p.avatar_emoji
         FROM social_blocks b
         LEFT JOIN social_profiles p ON p.user_id = b.blocked_user_id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC, b.blocked_user_id
        LIMIT 500`
    )
    .all(req.userId);
  res.json({ blocked });
});

router.post("/block", blockLimiter, requireAuth, (req, res) => {
  const alvo = alvoDoBloqueio(req, res);
  if (!alvo) return;
  if (!db.prepare("SELECT 1 FROM social_profiles WHERE user_id = ?").get(alvo)) {
    return res.status(404).json({ error: "perfil não encontrado" });
  }

  const aplicar = db.transaction(() => {
    db.prepare("INSERT OR IGNORE INTO social_blocks (user_id, blocked_user_id, created_at) VALUES (?, ?, ?)").run(
      req.userId,
      alvo,
      nowIso()
    );
    // Desfaz o vínculo nos DOIS sentidos. O feed é "meus posts + os de quem eu
    // sigo": sem apagar o follow do outro lado, a pessoa bloqueada continuaria
    // recebendo os posts de quem a bloqueou, e o bloqueio seria meia proteção.
    // Seguir de novo fica barrado em POST /api/social/follow/:userId.
    db.prepare(
      "DELETE FROM social_follows WHERE (follower_id = ? AND followee_id = ?) OR (follower_id = ? AND followee_id = ?)"
    ).run(req.userId, alvo, alvo, req.userId);
  });
  aplicar();
  res.json({ ok: true });
});

router.delete("/block", blockLimiter, requireAuth, (req, res) => {
  const alvo = alvoDoBloqueio(req, res);
  if (!alvo) return;
  // Desbloquear NÃO refaz o follow que o bloqueio desfez — quem seguia precisa
  // seguir de novo. Recriar sozinho seria reconstruir um vínculo que a pessoa
  // mandou cortar. Por isso o botão do app é "Desbloquear" e não "Desfazer"
  // (screens/SocialScreen.js): o rótulo tem que caber no que esta rota faz.
  db.prepare("DELETE FROM social_blocks WHERE user_id = ? AND blocked_user_id = ?").run(req.userId, alvo);
  res.json({ ok: true });
});

module.exports = { moderationRouter: router };
