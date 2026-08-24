-- SALAS DA COMUNIDADE — consentimento, diretrizes e visibilidade explícita.
--
-- Esta migração parte da fundação social versionada na 018. As colunas novas
-- têm defaults conservadores: todo post preexistente nasce `followers` e todo
-- signo preexistente nasce oculto/nulo. Nada vira público por efeito do deploy.

ALTER TABLE social_profiles ADD COLUMN zodiac_sign TEXT;
ALTER TABLE social_profiles ADD COLUMN show_zodiac_sign INTEGER NOT NULL DEFAULT 0;
ALTER TABLE social_profiles ADD COLUMN community_guidelines_version TEXT;
ALTER TABLE social_profiles ADD COLUMN community_guidelines_accepted_at TEXT;

ALTER TABLE social_posts ADD COLUMN visibility TEXT NOT NULL DEFAULT 'followers';
ALTER TABLE social_posts ADD COLUMN room_id TEXT;
ALTER TABLE social_posts ADD COLUMN sign_a TEXT;
ALTER TABLE social_posts ADD COLUMN sign_b TEXT;
ALTER TABLE social_posts ADD COLUMN relation TEXT;

-- Defesa explícita para bancos legados: mesmo que o SQLite trate o DEFAULT ao
-- ler linhas antigas, materializamos a decisão antes de criar o índice público.
UPDATE social_posts
   SET visibility = 'followers'
 WHERE visibility IS NULL OR TRIM(visibility) = '';

CREATE INDEX IF NOT EXISTS idx_social_profiles_public_sign
  ON social_profiles(show_zodiac_sign, zodiac_sign);

CREATE INDEX IF NOT EXISTS idx_social_posts_community_room
  ON social_posts(visibility, room_id, id DESC);
