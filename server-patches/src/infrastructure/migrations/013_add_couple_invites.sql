-- Convites de casal com notificação (ver CoupleInviteRepository.js e as rotas
-- /api/invite/* em server.js).
--
-- IF NOT EXISTS de propósito: em produção esta tabela já existe — nasceu da
-- migração 005 da linhagem do repo OBSOLETO. Este arquivo re-declara a tabela
-- na linhagem que é fonte da verdade, para um banco reconstruído do zero não
-- subir sem ela (as rotas de convite quebrariam).
CREATE TABLE IF NOT EXISTS couple_invites (
  code TEXT PRIMARY KEY,
  inviter_endpoint TEXT NOT NULL,
  couple_name TEXT,
  created_at TEXT NOT NULL,
  accepted_at TEXT
);
