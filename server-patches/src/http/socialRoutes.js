// Feed social entre leitores solo do Cosmic Guide (inspirado no app de
// leitura Ziggur, mas escopo bem menor: sem seguidores públicos de conteúdo
// de casal — Reconectar/Agir e o resto continuam privados). Uma pessoa
// escolhe compartilhar uma leitura já feita (do Diário Cósmico) no feed;
// outras podem seguir, curtir e comentar. Tudo autenticado via JWT do
// Supabase verificado por JWKS (ver socialAuth.js) — nunca confia num
// user_id vindo cru do corpo da requisição.
const express = require("express");
const rateLimit = require("express-rate-limit");
const { db } = require("../infrastructure/db");
const { requireAuth } = require("./socialAuth");
const { stripControlChars } = require("../infrastructure/textSanitize");

const router = express.Router();
router.use(requireAuth);

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições — tente novamente em alguns minutos." },
});

// GET /profile/me, GET /users/:userId, GET /feed e GET /posts/:id/comments
// eram as únicas rotas deste router sem limite nenhum — /feed roda 3
// subqueries por linha e /users/:userId roda 3 queries por chamada, então
// martelar qualquer uma delas sem limite pressiona o único processo
// Express/SQLite do servidor. Mais generoso que writeLimiter porque leitura
// é o uso normal da tela (ex.: pull-to-refresh do feed), não uma ação
// pontual. Achado real de auditoria (19/07/2026).
const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições — tente novamente em alguns minutos." },
});

// /search é a única rota que permite varrer o diretório inteiro de usuários
// (username, display_name, avatar) por prefixo — mais restrita que o
// writeLimiter genérico que usava antes, pra dificultar coletar a lista
// inteira de contas em massa (achado real de auditoria, 25/07/2026).
const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições — tente novamente em alguns minutos." },
});

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
const TITLE_MAX = 120;
const BODY_MAX = 2000;
const COMMENT_MAX = 500;

function nowIso() {
  return new Date().toISOString();
}

function profileOrNull(userId) {
  return db.prepare("SELECT user_id, display_name, username, avatar_emoji FROM social_profiles WHERE user_id = ?").get(userId) || null;
}

// Bloqueio vale nos DOIS sentidos (migração 016 / src/http/moderationRoutes.js):
// quem bloqueia deixa de ver E deixa de ser visto. Só um sentido faria o
// bloqueio esconder o incômodo de quem bloqueou e manter a pessoa exposta a
// quem ela bloqueou — que é o oposto do que a política de UGC do Google Play
// pede ("bloquear e não ver mais nada dele").
function isBlocked(a, b) {
  return !!db
    .prepare("SELECT 1 FROM social_blocks WHERE (user_id = ? AND blocked_user_id = ?) OR (user_id = ? AND blocked_user_id = ?)")
    .get(a, b, b, a);
}

// Mesma regra de visibilidade usada em GET /feed (dono ou quem segue) —
// achado real de auditoria de segurança (18/07/2026): GET /users/:userId
// devolvia os posts de qualquer pessoa pra qualquer usuário autenticado,
// mesmo sem seguir, inconsistente com o /feed que já filtrava por follow.
//
// O bloqueio entra AQUI, e não em cada rota, porque este é o funil por onde
// GET /users/:userId, curtir, ler comentários e comentar já passam — um
// guarda só cobre os quatro.
function canViewPosts(viewerId, authorId) {
  if (viewerId === authorId) return true;
  if (isBlocked(viewerId, authorId)) return false;
  return !!db.prepare("SELECT 1 FROM social_follows WHERE follower_id = ? AND followee_id = ?").get(viewerId, authorId);
}

// Toda rota abaixo assume req.userId já verificado por requireAuth.

router.get("/profile/me", readLimiter, (req, res) => {
  res.json({ profile: profileOrNull(req.userId) });
});

router.put("/profile", writeLimiter, (req, res) => {
  const { displayName, username, avatarEmoji } = req.body || {};
  if (!displayName || typeof displayName !== "string" || !displayName.trim()) {
    return res.status(400).json({ error: "displayName é obrigatório" });
  }
  const cleanUsername = String(username || "").trim().toLowerCase();
  if (!USERNAME_RE.test(cleanUsername)) {
    return res.status(400).json({ error: "username deve ter 3-20 caracteres (letras minúsculas, números, _)" });
  }
  const taken = db.prepare("SELECT user_id FROM social_profiles WHERE username = ? AND user_id != ?").get(cleanUsername, req.userId);
  if (taken) return res.status(409).json({ error: "username já está em uso" });

  const cleanDisplayName = stripControlChars(displayName.trim()).slice(0, 60);
  const existing = profileOrNull(req.userId);
  const ts = nowIso();
  if (existing) {
    db.prepare("UPDATE social_profiles SET display_name = ?, username = ?, avatar_emoji = ?, updated_at = ? WHERE user_id = ?")
      .run(cleanDisplayName, cleanUsername, avatarEmoji || null, ts, req.userId);
  } else {
    db.prepare(
      "INSERT INTO social_profiles (user_id, display_name, username, avatar_emoji, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(req.userId, cleanDisplayName, cleanUsername, avatarEmoji || null, ts, ts);
  }
  res.json({ profile: profileOrNull(req.userId) });
});

// Busca simples por username (prefixo) — não existe diretório público de
// usuários ainda, então é assim que uma pessoa acha outra pra seguir (ex.:
// combinar o @username por fora, tipo Ziggur "Compartilhar perfil").
// writeLimiter aqui não é sobre "escrita" — é a única rota de leitura em
// massa do router (permite varrer o diretório inteiro de usuários por
// prefixo) e por isso precisa de limite, achado real de auditoria (18/07/2026).
router.get("/search", searchLimiter, (req, res) => {
  const q = String(req.query.username || "").trim().toLowerCase();
  if (!q) return res.json({ profiles: [] });
  // Exige o mesmo mínimo de 3 caracteres que USERNAME_RE já exige pra CRIAR
  // um username — prefixo de 1-2 letras varria o diretório inteiro em poucas
  // chamadas (achado real de auditoria, 25/07/2026).
  if (!/^[a-z0-9_]{3,20}$/.test(q)) return res.json({ profiles: [] });
  // "%" e "_" são metacaracteres do LIKE mesmo dentro de parâmetro bindado —
  // "%" nunca aparece aqui (USERNAME_RE já barra, achado real de auditoria,
  // 18/07/2026), mas "_" É um caractere válido de username de verdade e
  // também é o coringa "1 caractere qualquer" do LIKE — sem escapar, buscar
  // "ana_" também batia em "anax", "anaz" etc. (achado real de auditoria,
  // 25/07/2026). Escapa o "_" do usuário antes de montar o padrão.
  const likePattern = `${q.replace(/_/g, "\\_")}%`;
  const rows = db
    .prepare(
      `SELECT user_id, display_name, username, avatar_emoji FROM social_profiles
       WHERE username LIKE ? ESCAPE '\\'
         AND user_id NOT IN (SELECT blocked_user_id FROM social_blocks WHERE user_id = ?)
         AND user_id NOT IN (SELECT user_id FROM social_blocks WHERE blocked_user_id = ?)
       ORDER BY username LIMIT 20`
    )
    .all(likePattern, req.userId, req.userId);
  res.json({ profiles: rows });
});

router.get("/users/:userId", readLimiter, (req, res) => {
  // Bloqueado some inteiro, não só os posts: sem isto a pessoa bloqueada
  // continuaria aparecendo com nome, avatar e contagens — "não ver mais nada
  // dele" com o perfil dele na tela não é bloqueio.
  if (req.params.userId !== req.userId && isBlocked(req.userId, req.params.userId)) {
    return res.status(404).json({ error: "perfil não encontrado" });
  }
  const profile = profileOrNull(req.params.userId);
  if (!profile) return res.status(404).json({ error: "perfil não encontrado" });
  const followers = db.prepare("SELECT COUNT(*) c FROM social_follows WHERE followee_id = ?").get(req.params.userId).c;
  const following = db.prepare("SELECT COUNT(*) c FROM social_follows WHERE follower_id = ?").get(req.params.userId).c;
  const isFollowing = !!db
    .prepare("SELECT 1 FROM social_follows WHERE follower_id = ? AND followee_id = ?")
    .get(req.userId, req.params.userId);
  // Contagens de seguidores/perfil continuam públicas (igual qualquer rede
  // social) — só o CONTEÚDO dos posts é restrito a dono ou quem segue.
  const posts = canViewPosts(req.userId, req.params.userId)
    ? db
        .prepare("SELECT id, reading_type, title, body, created_at FROM social_posts WHERE user_id = ? ORDER BY created_at DESC LIMIT 30")
        .all(req.params.userId)
    : [];
  res.json({ profile, followers, following, isFollowing: req.userId === req.params.userId ? null : isFollowing, posts });
});

router.post("/follow/:userId", writeLimiter, (req, res) => {
  if (req.params.userId === req.userId) return res.status(400).json({ error: "não pode seguir a si mesmo" });
  // Sem esta linha o bloqueio duraria até o próximo "seguir": o bloqueio
  // apaga os follows dos dois lados (moderationRoutes.js), e refazer um deles
  // devolveria o feed da pessoa bloqueada.
  if (isBlocked(req.userId, req.params.userId)) return res.status(403).json({ error: "perfil não encontrado" });
  if (!profileOrNull(req.params.userId)) return res.status(404).json({ error: "perfil não encontrado" });
  db.prepare("INSERT OR IGNORE INTO social_follows (follower_id, followee_id, created_at) VALUES (?, ?, ?)").run(
    req.userId,
    req.params.userId,
    nowIso()
  );
  res.json({ ok: true });
});

router.delete("/follow/:userId", writeLimiter, (req, res) => {
  db.prepare("DELETE FROM social_follows WHERE follower_id = ? AND followee_id = ?").run(req.userId, req.params.userId);
  res.status(204).send();
});

// Feed = posts de quem eu sigo + meus próprios posts, mais recentes primeiro.
// `before` (id de post) pagina pro passado — evita ORDER BY OFFSET caro à
// medida que o feed cresce.
router.get("/feed", readLimiter, (req, res) => {
  // `|| valorPadrão` não pega valor negativo (ex.: -1 é truthy em JS) — e o
  // SQLite trata LIMIT negativo como "sem limite nenhum", então
  // GET /feed?limit=-1 devolvia TODOS os posts visíveis, ignorando o teto de
  // 50. Achado real de auditoria (18/07/2026).
  let before = Number.parseInt(req.query.before, 10);
  if (!Number.isFinite(before) || before < 1) before = Number.MAX_SAFE_INTEGER;
  let limit = Number.parseInt(req.query.limit, 10);
  if (!Number.isFinite(limit) || limit < 1) limit = 20;
  limit = Math.min(limit, 50);

  // Busca limit+1 e corta o extra antes de responder — só assim dá pra saber
  // se existe próxima página sem o client precisar fazer uma chamada vazia
  // a mais só pra descobrir que acabou.
  //
  // As duas cláusulas de social_blocks são o filtro de bloqueio NO SERVIDOR.
  // O bloqueio já apaga os follows, então na prática elas raramente cortam
  // linha — e existem exatamente pro caso em que a limpeza de follow falhe ou
  // alguém apareça no feed por um caminho novo. Esconder só na tela não vale:
  // o conteúdo continuaria trafegando pro aparelho de quem bloqueou.
  const rows = db
    .prepare(
      `SELECT p.id, p.user_id, p.reading_type, p.title, p.body, p.created_at,
              sp.display_name, sp.username, sp.avatar_emoji,
              (SELECT COUNT(*) FROM social_likes l WHERE l.post_id = p.id) as like_count,
              (SELECT COUNT(*) FROM social_comments c WHERE c.post_id = p.id) as comment_count,
              EXISTS(SELECT 1 FROM social_likes l2 WHERE l2.post_id = p.id AND l2.user_id = ?) as liked_by_me
       FROM social_posts p
       JOIN social_profiles sp ON sp.user_id = p.user_id
       WHERE p.id < ?
         AND (p.user_id = ? OR p.user_id IN (SELECT followee_id FROM social_follows WHERE follower_id = ?))
         AND p.user_id NOT IN (SELECT blocked_user_id FROM social_blocks WHERE user_id = ?)
         AND p.user_id NOT IN (SELECT user_id FROM social_blocks WHERE blocked_user_id = ?)
       ORDER BY p.id DESC
       LIMIT ?`
    )
    .all(req.userId, before, req.userId, req.userId, req.userId, req.userId, limit + 1);

  const hasNext = rows.length > limit;
  const posts = rows.slice(0, limit).map((r) => ({ ...r, liked_by_me: !!r.liked_by_me }));
  res.json({ posts, meta: { has_next: hasNext, next_cursor: hasNext ? posts[posts.length - 1].id : null } });
});

router.post("/posts", writeLimiter, (req, res) => {
  if (!profileOrNull(req.userId)) return res.status(400).json({ error: "crie seu perfil social antes de compartilhar (PUT /api/social/profile)" });
  const { readingType, title, body } = req.body || {};
  if (!title || typeof title !== "string" || !body || typeof body !== "string") {
    return res.status(400).json({ error: "title e body são obrigatórios" });
  }
  if (title.length > TITLE_MAX || body.length > BODY_MAX) {
    return res.status(400).json({ error: `title deve ter no máximo ${TITLE_MAX} e body ${BODY_MAX} caracteres` });
  }
  const info = db
    .prepare("INSERT INTO social_posts (user_id, reading_type, title, body, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(req.userId, readingType || null, stripControlChars(title), stripControlChars(body), nowIso());
  res.status(201).json({ id: info.lastInsertRowid });
});

router.delete("/posts/:id", writeLimiter, (req, res) => {
  const post = db.prepare("SELECT user_id FROM social_posts WHERE id = ?").get(req.params.id);
  if (!post) return res.status(404).json({ error: "post não encontrado" });
  if (post.user_id !== req.userId) return res.status(403).json({ error: "só quem publicou pode apagar" });
  db.prepare("DELETE FROM social_posts WHERE id = ?").run(req.params.id);
  db.prepare("DELETE FROM social_likes WHERE post_id = ?").run(req.params.id);
  db.prepare("DELETE FROM social_comments WHERE post_id = ?").run(req.params.id);
  res.status(204).send();
});

router.post("/posts/:id/like", writeLimiter, (req, res) => {
  const post = db.prepare("SELECT user_id FROM social_posts WHERE id = ?").get(req.params.id);
  if (!post) return res.status(404).json({ error: "post não encontrado" });
  // Antes só checava se o post existia — dava pra curtir post de quem não se
  // segue, cujo conteúdo nem aparece pra quem curtiu (GET já usa
  // canViewPosts, esta rota de escrita tinha ficado pra trás). Achado real de
  // auditoria (25/07/2026).
  if (!canViewPosts(req.userId, post.user_id)) return res.status(403).json({ error: "sem acesso a este post" });
  db.prepare("INSERT OR IGNORE INTO social_likes (post_id, user_id, created_at) VALUES (?, ?, ?)").run(req.params.id, req.userId, nowIso());
  res.json({ ok: true });
});

router.delete("/posts/:id/like", writeLimiter, (req, res) => {
  db.prepare("DELETE FROM social_likes WHERE post_id = ? AND user_id = ?").run(req.params.id, req.userId);
  res.status(204).send();
});

router.get("/posts/:id/comments", readLimiter, (req, res) => {
  const post = db.prepare("SELECT user_id FROM social_posts WHERE id = ?").get(req.params.id);
  if (!post) return res.status(404).json({ error: "post não encontrado" });
  if (!canViewPosts(req.userId, post.user_id)) return res.status(403).json({ error: "sem acesso a este post" });
  const rows = db
    .prepare(
      // O comentário de quem eu bloqueei some inclusive dos MEUS posts — é o
      // reencontro mais provável depois do bloqueio, já que o feed em si o
      // filtro de follow/bloqueio já resolve.
      `SELECT c.id, c.user_id, c.body, c.created_at, sp.display_name, sp.username, sp.avatar_emoji
       FROM social_comments c JOIN social_profiles sp ON sp.user_id = c.user_id
       WHERE c.post_id = ?
         AND c.user_id NOT IN (SELECT blocked_user_id FROM social_blocks WHERE user_id = ?)
         AND c.user_id NOT IN (SELECT user_id FROM social_blocks WHERE blocked_user_id = ?)
       ORDER BY c.id ASC LIMIT 200`
    )
    .all(req.params.id, req.userId, req.userId);
  res.json({ comments: rows });
});

router.post("/posts/:id/comments", writeLimiter, (req, res) => {
  if (!profileOrNull(req.userId)) return res.status(400).json({ error: "crie seu perfil social antes de comentar" });
  const post = db.prepare("SELECT user_id FROM social_posts WHERE id = ?").get(req.params.id);
  if (!post) return res.status(404).json({ error: "post não encontrado" });
  // Mesmo achado da rota de like acima: só existência era checada, dando pra
  // comentar às cegas num post de quem não se segue (25/07/2026).
  if (!canViewPosts(req.userId, post.user_id)) return res.status(403).json({ error: "sem acesso a este post" });
  const { body } = req.body || {};
  if (!body || typeof body !== "string" || !body.trim()) return res.status(400).json({ error: "body é obrigatório" });
  if (body.length > COMMENT_MAX) return res.status(400).json({ error: `body deve ter no máximo ${COMMENT_MAX} caracteres` });
  const info = db
    .prepare("INSERT INTO social_comments (post_id, user_id, body, created_at) VALUES (?, ?, ?, ?)")
    .run(req.params.id, req.userId, stripControlChars(body.trim()), nowIso());
  res.status(201).json({ id: info.lastInsertRowid });
});

module.exports = { socialRouter: router };
