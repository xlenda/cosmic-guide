-- LEMBRETE DIÁRIO DO CHECK-IN (04/08/2026) — quem liga o toggle discreto dentro
-- do bloco de check-in (components/DailyMissionsCard.js) recebe UM Web Push por
-- dia. Quem envia é scripts/enviar-lembrete-checkin.js (cron); quem marca é a
-- rota POST /api/push/daily-reminder em src/http/server.js.
--
-- POR QUE UMA TABELA NOVA, E NÃO UMA COLUNA EM push_subscriptions — dois motivos,
-- os dois concretos:
--
--   1. IDEMPOTÊNCIA DE VERDADE. O SQLite não tem `ALTER TABLE ... ADD COLUMN IF
--      NOT EXISTS`. Se esta migração rodasse um ALTER e a coluna já existisse
--      (banco restaurado de backup mais novo, migração renumerada, coluna criada
--      à mão numa emergência), o db.exec estouraria DENTRO do require de
--      db.js — ou seja, o backend inteiro deixaria de subir por causa de um
--      lembrete de notificação. `CREATE TABLE IF NOT EXISTS` roda quantas vezes
--      for preciso e nunca derruba o boot. É o mesmo raciocínio já escrito nas
--      migrações 012 e 013.
--
--   2. O ARQUIVO DA COLUNA NÃO MORA NESTE REPO. PushSubscriptionRepository.js
--      não está em server-patches/ (que é a fonte da verdade do que sobe pro
--      servidor): ele vive só na VPS. Para acrescentar uma coluna eu teria que
--      trazer pra cá uma cópia vinda do repo OBSOLETO — e o deploy.sh sobrescreve
--      src/ inteiro com o que tem aqui. Foi exatamente assim que /api/cities caiu
--      em produção (01/08/2026) e que o bloco da Chama sumiu (02/08/2026): uma
--      cópia velha subindo por cima da versão viva. Tabela separada + repositório
--      NOVO (DailyReminderRepository.js) não encostam em nenhum arquivo que eu
--      não possa ver por inteiro.
--
-- O QUE ENTRA: só o endpoint (que já é a chave da inscrição de push) e o idioma
-- em que a pessoa lê o app, pro push sair na língua dela. Nada de conteúdo, nada
-- de humor, nada de resposta de check-in — o que a pessoa respondeu fica no
-- APARELHO dela (lib/checkin.js, AsyncStorage) e nunca sobe pro servidor. O
-- servidor sabe "essa inscrição quer ser lembrada, em espanhol", e mais nada.
--
-- SEM ÍNDICE EXTRA de propósito: a leitura do cron é um JOIN de endpoint com
-- push_subscriptions, e endpoint é PRIMARY KEY nas duas pontas. Todo índice a
-- mais é custo em toda escrita, e aqui não compraria nada.
CREATE TABLE IF NOT EXISTS push_daily_reminder (
  endpoint   TEXT PRIMARY KEY,
  lang       TEXT NOT NULL DEFAULT 'pt',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
