-- Vínculo assinatura <-> CONTA (Supabase), 26/07/2026.
--
-- POR QUÊ: até aqui o acesso pago estava preso ao APARELHO — o correlationCode
-- ficava só no AsyncStorage do navegador (soloCorrelationKey/correlationKey) e
-- era a ÚNICA forma de o app perguntar "essa pessoa pagou?". Limpar os dados do
-- navegador, trocar de celular ou abrir no PC = pagou e perdeu o acesso. Pior:
-- cada clique em "Assinar" criava uma pendência nova E sobrescrevia a chave
-- local, então clicar de novo DEPOIS de já ter pago fazia o acesso sumir (foi
-- exatamente o laço que o cliente Carlos viveu — 4 checkouts em 26/07).
--
-- A partir daqui a identidade do assinante é o `sub` (UUID) do JWT do Supabase,
-- verificado no servidor via JWKS (src/http/socialAuth.js — mesmo mecanismo já
-- em produção no feed social, sem service_role key). O correlationCode continua
-- existindo e continua funcionando: vira só um PONTEIRO local de fallback.
--
-- ORDEM: esta migração depende da 008 (índices de correlação do webhook), que
-- também ainda não foi aplicada — o servidor está em user_version=7. As duas
-- sobem juntas neste deploy, nesta ordem. O runner (src/infrastructure/db.js)
-- só compara o número do arquivo com user_version, então renumerar qualquer
-- uma delas quebra a sequência.

-- `sub` do JWT: identidade real e imutável do assinante. Nunca vem do body da
-- requisição — é sempre derivado do token verificado (req.userId).
ALTER TABLE subscriptions ADD COLUMN supabase_user_id TEXT;

-- E-mail do LOGIN (normalizado). Coluna SEPARADA de customer_email de
-- propósito: customer_email é o e-mail do PAGAMENTO (texto livre digitado no
-- checkout da Hotmart, pode ser o do PayPal/cartão de outra pessoa) e é o que
-- concilia com a Hotmart no webhook; account_email é o e-mail da conta que tem
-- o acesso. Misturar os dois quebraria a correlação do webhook ou o acesso —
-- por isso customer_email NUNCA é sobrescrito (ver COALESCE em
-- SubscriptionRepository.save).
ALTER TABLE subscriptions ADD COLUMN account_email TEXT;

ALTER TABLE subscriptions ADD COLUMN linked_at TEXT;

-- Como o vínculo foi feito: 'email_match' (auto, e-mail verificado do token bate
-- com customer_email), 'device_code' (prova de posse do correlationCode que
-- ainda está no aparelho), 'checkout' (nasceu vinculado) ou 'admin' (suporte).
-- Sem esse campo não dá pra responder "por que essa conta tem acesso a essa
-- assinatura?" numa disputa/estorno.
ALTER TABLE subscriptions ADD COLUMN linked_by TEXT;

-- 'couple' | 'solo'. Hoje isso é decidido no APARELHO, só por qual chave do
-- AsyncStorage guardou o código (correlationKey vs soloCorrelationKey) — o
-- servidor não tem ideia. Numa resolução por conta isso é insustentável: sem
-- escopo no servidor, um assinante SOLO que forma casal ou não conseguiria
-- comprar o plano de casal (idempotência cega) ou ganharia acesso de casal sem
-- pagar. Derivado deterministicamente de couple_name — não inventa dado.
ALTER TABLE subscriptions ADD COLUMN scope TEXT;

-- Toda leitura de acesso por conta passa por supabase_user_id; o segundo índice
-- cobre a forma exata da consulta de idempotência do checkout
-- (conta + escopo + status).
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON subscriptions(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_scope
  ON subscriptions(supabase_user_id, scope, status);

-- Backfill do escopo das linhas que já existem. NÃO existe backfill de
-- supabase_user_id: não há mapa e-mail -> uuid do Supabase acessível sem a
-- service_role key (que o Lenda proibiu neste projeto). O vínculo das linhas
-- antigas é PREGUIÇOSO e auto-serviço — acontece sozinho no primeiro
-- GET /api/subscription/me de cada assinante (email_match) ou via
-- POST /api/subscription/claim (device_code). Nenhum script de migração de
-- dados, nenhum cliente precisa ser avisado.
UPDATE subscriptions
   SET scope = CASE
                 WHEN couple_name IS NOT NULL AND TRIM(couple_name) <> '' THEN 'couple'
                 ELSE 'solo'
               END
 WHERE scope IS NULL;
