-- FUNDAÇÃO SOCIAL VERSIONADA — Comunidade V1.
--
-- As cinco tabelas básicas do feed nasceram diretamente no `db.js` que existe
-- na VPS e ficaram fora de `server-patches/`. Isso fazia uma instalação limpa
-- depender de estado residual do servidor: as rotas estavam versionadas, mas o
-- esquema que elas consultam não. Esta migração reproduz exatamente o contrato
-- observado em produção em 24/08/2026 (user_version 17), sem alterar linhas
-- existentes e sem adicionar dado natal.
--
-- Todo CREATE usa IF NOT EXISTS. No banco atual as tabelas já existem e esta
-- migração acrescenta apenas os índices ausentes para exclusão de conta e
-- moderação. Num banco limpo ela cria a mesma fundação que as rotas esperam.

CREATE TABLE IF NOT EXISTS social_profiles (
  user_id       TEXT PRIMARY KEY,
  display_name  TEXT NOT NULL,
  username      TEXT UNIQUE NOT NULL,
  avatar_emoji  TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS social_posts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       TEXT NOT NULL,
  reading_type  TEXT,
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS social_follows (
  follower_id   TEXT NOT NULL,
  followee_id   TEXT NOT NULL,
  created_at    TEXT NOT NULL,
  PRIMARY KEY (follower_id, followee_id)
);

CREATE TABLE IF NOT EXISTS social_likes (
  post_id       INTEGER NOT NULL,
  user_id       TEXT NOT NULL,
  created_at    TEXT NOT NULL,
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS social_comments (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id       INTEGER NOT NULL,
  user_id       TEXT NOT NULL,
  body          TEXT NOT NULL,
  created_at    TEXT NOT NULL
);

-- Suspensão é da presença na Comunidade, não da assinatura nem do login do
-- app. O perfil/UGC é removido na ação administrativa e esta lápide impede a
-- recriação imediata até o dono revisar e reverter explicitamente.
CREATE TABLE IF NOT EXISTS social_suspensions (
  user_id       TEXT PRIMARY KEY,
  report_id     INTEGER,
  reason        TEXT NOT NULL,
  created_at    TEXT NOT NULL
);

-- Índices já presentes no servidor, agora declarados na fonte de verdade.
CREATE INDEX IF NOT EXISTS idx_social_posts_created
  ON social_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_social_posts_user_created
  ON social_posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_follows_followee
  ON social_follows(followee_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_post
  ON social_comments(post_id);

-- Índices novos: a exclusão de conta percorre autoria/participação, não apenas
-- o caminho normal do feed. Sem eles, apagar uma conta varreria tabelas inteiras.
CREATE INDEX IF NOT EXISTS idx_social_likes_user
  ON social_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_user
  ON social_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_target_user
  ON moderation_reports(target_user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_reporter
  ON moderation_reports(reporter_id);
