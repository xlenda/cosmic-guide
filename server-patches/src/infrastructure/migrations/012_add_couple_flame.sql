-- Chama do Casal: check-ins diários por aparelho; a chama acende com >= 2
-- deviceIds distintos no mesmo dia (ver FlameRepository.js).
--
-- IF NOT EXISTS de propósito: em produção esta tabela já existe — ela nasceu
-- de uma migração numerada 008 na linhagem do repo OBSOLETO
-- (C:\tmp\gilfforever\backend), que colidia com o 008 desta linhagem. Este
-- arquivo re-declara a tabela no repo que é fonte da verdade, sem quebrar o
-- banco que já a tem nem um banco novo que ainda não a tem.
CREATE TABLE IF NOT EXISTS flame_checkins (
  couple_key TEXT NOT NULL,
  day TEXT NOT NULL,
  device_id TEXT NOT NULL,
  PRIMARY KEY (couple_key, day, device_id)
);
