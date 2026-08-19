-- REVOGAÇÃO DE TOKEN DE CONTA APAGADA (lida em src/http/socialAuth.js,
-- escrita em src/infrastructure/SubscriptionRepository.js:forgetAccount).
--
-- POR QUE EXISTE (auditoria de segurança, 19/08/2026): apagar a conta não
-- encerrava sessão nenhuma no backend próprio. O JWT do Supabase é verificado
-- só pela ASSINATURA contra o JWKS — nenhuma consulta ao usuário — então o
-- token de uma conta já apagada continuava valendo até o `exp` (1h no padrão
-- do Supabase). Isso dava dois defeitos, que são o MESMO problema visto de
-- dois lados:
--
--   (a) A EXCLUSÃO SE DESFAZIA SOZINHA. Um GET /api/subscription/me com o
--       token do morto rodava o backfill por e-mail
--       (linkUnclaimedByCustomerEmail) e REGRAVAVA o e-mail e o uuid da conta
--       apagada exatamente na linha que o DELETE tinha acabado de desvincular.
--       O app rechecava acesso de 5 em 5 minutos, então bastava a tela
--       demorar a fechar.
--
--   (b) public/excluir-conta.html promete, nos três idiomas, que a exclusão
--       encerra "todas as sessões abertas". O Supabase cumpre a parte dele —
--       auth.sessions e auth.refresh_tokens caem em cascata junto com
--       auth.users (supabase/001_delete_own_account.sql), então nenhum token
--       NOVO é emitido — mas o access token já na mão continuava aceito aqui,
--       postando no feed e gastando IA.
--
-- A lápide fecha os dois de uma vez: o DELETE /api/subscription/account grava
-- o uuid aqui, e o requireAuth passa a devolver 401 pra qualquer token cujo
-- `sub` esteja nesta tabela — ANTES de qualquer rota rodar. Sem token vivo não
-- existe caminho que reescreva dado de conta morta.
--
-- O QUE ENTRA AQUI: só o uuid (o `sub` do JWT) e a hora. Nada de e-mail, nome,
-- nem conteúdo — é lista de bloqueio, não arquivo de quem saiu.
--
-- RETENÇÃO: as linhas são podadas depois de 30 dias, na própria forgetAccount.
-- O teto de access token configurável no Supabase é 1 semana, então 30 dias
-- cobre com folga a única janela em que a lápide serve pra alguma coisa —
-- guardar o uuid pra sempre contradiria a página de exclusão.
CREATE TABLE IF NOT EXISTS revoked_accounts (
  user_id    TEXT PRIMARY KEY,
  revoked_at TEXT NOT NULL
);

-- Sem índice extra de propósito: a leitura quente é `WHERE user_id = ?`, que a
-- chave primária (índice único em TEXT no SQLite) já resolve, e a poda por data
-- varre uma tabela que nunca passa de algumas dezenas de linhas.
