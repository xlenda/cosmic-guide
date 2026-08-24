// Feed de seguidores + salas públicas do Cosmic Guide. Conteúdo de casal,
// Diário e leituras continuam privados por padrão: só uma publicação criada
// explicitamente nestas rotas vira UGC. Uma pessoa escolhe compartilhar e
// outras podem seguir, curtir e comentar. Tudo autenticado via JWT do
// Supabase verificado por JWKS (ver socialAuth.js) — nunca confia num
// user_id vindo cru do corpo da requisição.
const express = require("express");
const rateLimit = require("express-rate-limit");
const { db } = require("../infrastructure/db");
const { requireAuth } = require("./socialAuth");
const { stripControlChars } = require("../infrastructure/textSanitize");
const { deleteSocialAccountData } = require("../infrastructure/SocialAccountCleanup");
const {
  COMMUNITY_GUIDELINES_VERSION,
  normalizeRoomId,
  normalizeSignId,
  hasCurrentGuidelines,
  resolveCommunityPostMetadata,
} = require("../application/communityRooms");

const router = express.Router();
router.use(requireAuth);
router.use((req, res, next) => {
  const suspension = db.prepare("SELECT 1 FROM social_suspensions WHERE user_id = ?").get(req.userId);
  if (suspension) {
    return res.status(403).json({
      code: "community_suspended",
      error: "perfil social suspenso pela moderação",
    });
  }
  next();
});

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
const COMMUNITY_POST_FIELDS = new Set(["roomId", "targetSign", "title", "body"]);

function nowIso() {
  return new Date().toISOString();
}

function profileRecordOrNull(userId) {
  return (
    db
      .prepare(
        `SELECT user_id, display_name, username, avatar_emoji,
                zodiac_sign, show_zodiac_sign,
                community_guidelines_version, community_guidelines_accepted_at
           FROM social_profiles
          WHERE user_id = ?`
      )
      .get(userId) || null
  );
}

function ownProfileOrNull(userId) {
  return profileRecordOrNull(userId);
}

function publicProfileOrNull(userId) {
  return (
    db
      .prepare(
        `SELECT user_id, display_name, username, avatar_emoji,
                CASE WHEN show_zodiac_sign = 1 THEN zodiac_sign ELSE NULL END AS zodiac_sign
           FROM social_profiles
          WHERE user_id = ?`
      )
      .get(userId) || null
  );
}

function profileOrNull(userId) {
  return publicProfileOrNull(userId);
}

function codedError(res, status, code, error) {
  return res.status(status).json({ code, error });
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

function canViewPost(viewerId, post) {
  if (!post) return false;
  if (isBlocked(viewerId, post.user_id)) return false;
  if (post.visibility === "community") return true;
  return canViewPosts(viewerId, post.user_id);
}

// Toda rota abaixo assume req.userId já verificado por requireAuth.

router.get("/profile/me", readLimiter, (req, res) => {
  res.json({ profile: ownProfileOrNull(req.userId) });
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
  const existing = profileRecordOrNull(req.userId);
  const ts = nowIso();
  if (existing) {
    db.prepare("UPDATE social_profiles SET display_name = ?, username = ?, avatar_emoji = ?, updated_at = ? WHERE user_id = ?")
      .run(cleanDisplayName, cleanUsername, avatarEmoji || null, ts, req.userId);
  } else {
    db.prepare(
      "INSERT INTO social_profiles (user_id, display_name, username, avatar_emoji, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(req.userId, cleanDisplayName, cleanUsername, avatarEmoji || null, ts, ts);
  }
  res.json({ profile: ownProfileOrNull(req.userId) });
});

// Consentimento do signo social. O endpoint não recebe data/hora/cidade natal:
// somente um ID da allowlist. Desligar apaga o valor em vez de mantê-lo oculto.
router.put("/profile/community", writeLimiter, (req, res) => {
  const profile = profileRecordOrNull(req.userId);
  if (!profile) {
    return codedError(res, 409, "profile_required", "crie seu perfil social antes de configurar a Comunidade");
  }

  const payload = req.body && typeof req.body === "object" ? req.body : {};
  const unexpected = Object.keys(payload).filter((key) => key !== "showZodiacSign" && key !== "zodiacSign");
  if (unexpected.length) {
    return codedError(res, 400, "invalid_community_profile_payload", "o perfil da Comunidade aceita somente signo e consentimento");
  }
  if (typeof payload.showZodiacSign !== "boolean") {
    return codedError(res, 400, "invalid_zodiac_consent", "showZodiacSign deve ser booleano");
  }

  const ts = nowIso();
  if (!payload.showZodiacSign) {
    const revokeSignConsent = db.transaction(() => {
      db.prepare(
        "UPDATE social_profiles SET zodiac_sign = NULL, show_zodiac_sign = 0, updated_at = ? WHERE user_id = ?"
      ).run(ts, req.userId);
      // O signo também foi materializado nos posts relacionais publicados. Se
      // ficasse ali, "ocultar" no perfil continuaria expondo o mesmo dado pela
      // sala. Preservamos o texto, removemos os metadados e o movemos à praça.
      db.prepare(
        `UPDATE social_posts
            SET room_id = 'plaza', sign_a = NULL, sign_b = NULL, relation = NULL
          WHERE user_id = ? AND visibility = 'community' AND sign_a IS NOT NULL`
      ).run(req.userId);
    });
    revokeSignConsent();
  } else {
    const zodiacSign = normalizeSignId(payload.zodiacSign);
    if (!zodiacSign) {
      return codedError(res, 400, "invalid_zodiac_sign", "zodiacSign não pertence à allowlist");
    }
    db.prepare(
      "UPDATE social_profiles SET zodiac_sign = ?, show_zodiac_sign = 1, updated_at = ? WHERE user_id = ?"
    ).run(zodiacSign, ts, req.userId);
  }

  res.json({ profile: ownProfileOrNull(req.userId) });
});

// O corpo não escolhe versão. O servidor grava a versão vigente e a hora; uma
// mudança futura da constante invalida o aceite anterior automaticamente.
router.post("/community/guidelines", writeLimiter, (req, res) => {
  if (!profileRecordOrNull(req.userId)) {
    return codedError(res, 409, "profile_required", "crie seu perfil social antes de aceitar as diretrizes");
  }
  const acceptedAt = nowIso();
  db.prepare(
    `UPDATE social_profiles
        SET community_guidelines_version = ?,
            community_guidelines_accepted_at = ?,
            updated_at = ?
      WHERE user_id = ?`
  ).run(COMMUNITY_GUIDELINES_VERSION, acceptedAt, acceptedAt, req.userId);
  res.json({ ok: true, version: COMMUNITY_GUIDELINES_VERSION, acceptedAt });
});

// Conversas públicas da sala. A sala é allowlisted e só entram linhas criadas
// explicitamente como `community`; posts legados/followers nunca vazam aqui.
router.get("/community/:roomId", readLimiter, (req, res) => {
  const roomId = normalizeRoomId(req.params.roomId);
  if (!roomId) return codedError(res, 404, "community_room_not_found", "sala não encontrada");

  let before = Number.parseInt(req.query.before, 10);
  if (!Number.isFinite(before) || before < 1) before = Number.MAX_SAFE_INTEGER;
  let limit = Number.parseInt(req.query.limit, 10);
  if (!Number.isFinite(limit) || limit < 1) limit = 20;
  limit = Math.min(limit, 50);

  const rows = db
    .prepare(
      `SELECT p.id, p.user_id, p.reading_type, p.title, p.body, p.created_at,
              p.visibility, p.room_id, p.sign_a, p.sign_b, p.relation,
              sp.display_name, sp.username, sp.avatar_emoji,
              CASE WHEN sp.show_zodiac_sign = 1 THEN sp.zodiac_sign ELSE NULL END AS zodiac_sign,
              (SELECT COUNT(*) FROM social_likes l WHERE l.post_id = p.id) AS like_count,
              (SELECT COUNT(*) FROM social_comments c WHERE c.post_id = p.id) AS comment_count,
              EXISTS(SELECT 1 FROM social_likes l2 WHERE l2.post_id = p.id AND l2.user_id = ?) AS liked_by_me
         FROM social_posts p
         JOIN social_profiles sp ON sp.user_id = p.user_id
        WHERE p.visibility = 'community'
          AND p.room_id = ?
          AND p.id < ?
          AND p.user_id NOT IN (SELECT blocked_user_id FROM social_blocks WHERE user_id = ?)
          AND p.user_id NOT IN (SELECT user_id FROM social_blocks WHERE blocked_user_id = ?)
        ORDER BY p.id DESC
        LIMIT ?`
    )
    .all(req.userId, roomId, before, req.userId, req.userId, limit + 1);

  const hasNext = rows.length > limit;
  const posts = rows.slice(0, limit).map((row) => ({ ...row, liked_by_me: Boolean(row.liked_by_me) }));
  res.json({
    posts,
    meta: {
      room_id: roomId,
      has_next: hasNext,
      next_cursor: hasNext ? posts[posts.length - 1].id : null,
    },
  });
});

router.post("/community/posts", writeLimiter, (req, res) => {
  const profile = profileRecordOrNull(req.userId);
  if (!profile) {
    return codedError(res, 409, "profile_required", "crie seu perfil social antes de publicar");
  }
  if (!hasCurrentGuidelines(profile)) {
    return codedError(res, 403, "community_guidelines_required", "aceite as diretrizes vigentes antes de publicar");
  }

  const payload = req.body && typeof req.body === "object" ? req.body : {};
  const unexpected = Object.keys(payload).filter((key) => !COMMUNITY_POST_FIELDS.has(key));
  if (unexpected.length) {
    return codedError(res, 400, "invalid_community_post_payload", "o servidor não aceita classificação ou visibilidade do cliente");
  }

  const title = typeof payload.title === "string" ? stripControlChars(payload.title).trim() : "";
  const body = typeof payload.body === "string" ? stripControlChars(payload.body).trim() : "";
  if (!title || !body) {
    return codedError(res, 400, "invalid_post_content", "title e body são obrigatórios");
  }
  if (title.length > TITLE_MAX || body.length > BODY_MAX) {
    return codedError(res, 400, "post_too_long", `title deve ter no máximo ${TITLE_MAX} e body ${BODY_MAX} caracteres`);
  }

  const resolved = resolveCommunityPostMetadata({
    roomId: payload.roomId,
    targetSign: payload.targetSign,
    profile,
  });
  if (!resolved.ok) {
    const status = resolved.code === "public_zodiac_sign_required" ? 403 : 400;
    return res.status(status).json({
      code: resolved.code,
      error: "não foi possível classificar a conversa",
      ...(resolved.expectedRoomId ? { expectedRoomId: resolved.expectedRoomId } : {}),
    });
  }

  const metadata = resolved.value;
  const info = db
    .prepare(
      `INSERT INTO social_posts
         (user_id, reading_type, title, body, created_at, visibility, room_id, sign_a, sign_b, relation)
       VALUES (?, 'community', ?, ?, ?, 'community', ?, ?, ?, ?)`
    )
    .run(
      req.userId,
      title,
      body,
      nowIso(),
      metadata.roomId,
      metadata.signA,
      metadata.signB,
      metadata.relation
    );
  res.status(201).json({ id: info.lastInsertRowid, ...metadata });
});

// Apaga somente a presença na Comunidade; login, assinatura e demais dados do
// app continuam intactos. A mesma regra de limpeza é reutilizada pela exclusão
// da conta inteira, evitando que os dois botões prometam resultados diferentes.
// Idempotente: repetir depois de uma resposta perdida devolve zeros, sem erro.
router.delete("/profile", writeLimiter, (req, res) => {
  const deleted = deleteSocialAccountData(db, { userId: req.userId, now: nowIso() });
  res.json({ ok: true, deleted });
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
      `SELECT user_id, display_name, username, avatar_emoji,
              CASE WHEN show_zodiac_sign = 1 THEN zodiac_sign ELSE NULL END AS zodiac_sign
         FROM social_profiles
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
  const profile =
    req.params.userId === req.userId
      ? ownProfileOrNull(req.params.userId)
      : publicProfileOrNull(req.params.userId);
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
        .prepare(
          `SELECT id, reading_type, title, body, created_at
             FROM social_posts
            WHERE user_id = ? AND visibility = 'followers'
            ORDER BY created_at DESC LIMIT 30`
        )
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
              CASE WHEN sp.show_zodiac_sign = 1 THEN sp.zodiac_sign ELSE NULL END AS zodiac_sign,
              (SELECT COUNT(*) FROM social_likes l WHERE l.post_id = p.id) as like_count,
              (SELECT COUNT(*) FROM social_comments c WHERE c.post_id = p.id) as comment_count,
              EXISTS(SELECT 1 FROM social_likes l2 WHERE l2.post_id = p.id AND l2.user_id = ?) as liked_by_me
       FROM social_posts p
       JOIN social_profiles sp ON sp.user_id = p.user_id
       WHERE p.id < ?
         AND p.visibility = 'followers'
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
    .prepare(
      `INSERT INTO social_posts (user_id, reading_type, title, body, created_at, visibility)
       VALUES (?, ?, ?, ?, ?, 'followers')`
    )
    .run(req.userId, readingType || null, stripControlChars(title), stripControlChars(body), nowIso());
  res.status(201).json({ id: info.lastInsertRowid });
});

router.delete("/posts/:id", writeLimiter, (req, res) => {
  const post = db.prepare("SELECT user_id FROM social_posts WHERE id = ?").get(req.params.id);
  if (!post) return res.status(404).json({ error: "post não encontrado" });
  if (post.user_id !== req.userId) return res.status(403).json({ error: "só quem publicou pode apagar" });
  const removePost = db.transaction(() => {
    // O esquema social legado não tem FK/cascade. Interações vêm primeiro para
    // que uma falha nunca deixe curtida/comentário apontando para post ausente.
    db.prepare("DELETE FROM social_likes WHERE post_id = ?").run(req.params.id);
    db.prepare("DELETE FROM social_comments WHERE post_id = ?").run(req.params.id);
    db.prepare("DELETE FROM social_posts WHERE id = ?").run(req.params.id);
  });
  removePost();
  res.status(204).send();
});

router.post("/posts/:id/like", writeLimiter, (req, res) => {
  const post = db.prepare("SELECT user_id, visibility FROM social_posts WHERE id = ?").get(req.params.id);
  if (!post) return res.status(404).json({ error: "post não encontrado" });
  // Antes só checava se o post existia — dava pra curtir post de quem não se
  // segue, cujo conteúdo nem aparece pra quem curtiu (GET já usa
  // canViewPosts, esta rota de escrita tinha ficado pra trás). Achado real de
  // auditoria (25/07/2026).
  if (!canViewPost(req.userId, post)) {
    return post.visibility === "community"
      ? codedError(res, 403, "community_post_unavailable", "post da Comunidade indisponível")
      : res.status(403).json({ error: "sem acesso a este post" });
  }
  db.prepare("INSERT OR IGNORE INTO social_likes (post_id, user_id, created_at) VALUES (?, ?, ?)").run(req.params.id, req.userId, nowIso());
  res.json({ ok: true });
});

router.delete("/posts/:id/like", writeLimiter, (req, res) => {
  db.prepare("DELETE FROM social_likes WHERE post_id = ? AND user_id = ?").run(req.params.id, req.userId);
  res.status(204).send();
});

router.get("/posts/:id/comments", readLimiter, (req, res) => {
  const post = db.prepare("SELECT user_id, visibility FROM social_posts WHERE id = ?").get(req.params.id);
  if (!post) return res.status(404).json({ error: "post não encontrado" });
  if (!canViewPost(req.userId, post)) {
    return post.visibility === "community"
      ? codedError(res, 403, "community_post_unavailable", "post da Comunidade indisponível")
      : res.status(403).json({ error: "sem acesso a este post" });
  }
  const rows = db
    .prepare(
      // O comentário de quem eu bloqueei some inclusive dos MEUS posts — é o
      // reencontro mais provável depois do bloqueio, já que o feed em si o
      // filtro de follow/bloqueio já resolve.
      `SELECT c.id, c.user_id, c.body, c.created_at,
              sp.display_name, sp.username, sp.avatar_emoji,
              CASE WHEN sp.show_zodiac_sign = 1 THEN sp.zodiac_sign ELSE NULL END AS zodiac_sign
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
  const post = db.prepare("SELECT user_id, visibility FROM social_posts WHERE id = ?").get(req.params.id);
  if (!post) return res.status(404).json({ error: "post não encontrado" });
  const profile = profileRecordOrNull(req.userId);
  if (!profile) {
    return post.visibility === "community"
      ? codedError(res, 409, "profile_required", "crie seu perfil social antes de comentar")
      : res.status(400).json({ error: "crie seu perfil social antes de comentar" });
  }
  // Mesmo achado da rota de like acima: só existência era checada, dando pra
  // comentar às cegas num post de quem não se segue (25/07/2026).
  if (!canViewPost(req.userId, post)) {
    return post.visibility === "community"
      ? codedError(res, 403, "community_post_unavailable", "post da Comunidade indisponível")
      : res.status(403).json({ error: "sem acesso a este post" });
  }
  if (post.visibility === "community" && !hasCurrentGuidelines(profile)) {
    return codedError(res, 403, "community_guidelines_required", "aceite as diretrizes vigentes antes de comentar");
  }
  const { body } = req.body || {};
  if (!body || typeof body !== "string" || !body.trim()) {
    return post.visibility === "community"
      ? codedError(res, 400, "invalid_comment_content", "body é obrigatório")
      : res.status(400).json({ error: "body é obrigatório" });
  }
  if (body.length > COMMENT_MAX) {
    return post.visibility === "community"
      ? codedError(res, 400, "comment_too_long", `body deve ter no máximo ${COMMENT_MAX} caracteres`)
      : res.status(400).json({ error: `body deve ter no máximo ${COMMENT_MAX} caracteres` });
  }
  const info = db
    .prepare("INSERT INTO social_comments (post_id, user_id, body, created_at) VALUES (?, ?, ?, ?)")
    .run(req.params.id, req.userId, stripControlChars(body.trim()), nowIso());
  res.status(201).json({ id: info.lastInsertRowid });
});

// Apagar o próprio comentário não depende de ainda seguir/ver o autor do post:
// mesmo depois de um bloqueio a pessoa preserva o direito de remover o que
// escreveu. O dono do post usa denúncia/moderação; não recebe poder silencioso
// para apagar fala alheia por esta rota.
router.delete("/comments/:id", writeLimiter, (req, res) => {
  const comment = db.prepare("SELECT user_id FROM social_comments WHERE id = ?").get(req.params.id);
  if (!comment) return res.status(404).json({ error: "comentário não encontrado" });
  if (comment.user_id !== req.userId) {
    return res.status(403).json({ error: "só quem comentou pode apagar" });
  }
  db.prepare("DELETE FROM social_comments WHERE id = ?").run(req.params.id);
  res.status(204).send();
});

module.exports = { socialRouter: router };
