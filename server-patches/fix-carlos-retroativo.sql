-- ============================================================================
-- LIBERAÇÃO RETROATIVA — Carlos Alberto Sanches (carlos.alberto.sanches09@gmail.com)
-- Compra APROVADA na Hotmart em 2026-07-26T17:28:33Z (transação HP1260209174,
-- subscriber 6QAE1D6J, oferta aqwv9uci "7 dias grátis") e REJEITADA pelo
-- backend por causa do bug do xcod. Evento salvo em subscription_events id=9.
--
-- COMO RODAR (no servidor, uma vez, depois do backup):
--   cp /root/forja-backend/data/forja.sqlite /root/forja-backend/data/forja.sqlite.bak-$(date +%s)
--   sqlite3 /root/forja-backend/data/forja.sqlite < fix-carlos-retroativo.sql
--
-- ALTERNATIVA (preferida): não rode este SQL — rode
-- `node scripts/replay-webhook-event.js 9` DEPOIS de subir o código corrigido.
-- O replay passa pelo mesmo caminho de produção e chega no mesmo resultado.
-- Rodar os DOIS é inofensivo (o replay vira "evento duplicado"), mas escolha um.
--
-- POR QUE a linha 7023e40f... (17:48:35Z) e não a 09ae328f... (17:14:46Z), que
-- é a que estava aberta na hora da compra:
--   o app grava o correlationCode numa ÚNICA chave por e-mail no AsyncStorage
--   (saveSoloCorrelationCode) e SOBRESCREVE a cada clique em "Assinar". O
--   Carlos clicou de novo às 17:48 depois de não receber acesso, então o
--   aparelho dele hoje só consegue consultar 7023e40f... Ativar qualquer outra
--   linha deixaria ele pagando e vendo o paywall. É a mesma regra que o código
--   corrigido usa ("pendência MAIS RECENTE do e-mail"), então SQL e código
--   concordam.
-- ============================================================================

BEGIN IMMEDIATE;

-- 1) Ativa a assinatura que o aparelho do Carlos realmente consulta.
--    date_next_charge do payload real = 1785672000000 (epoch ms) = 2026-08-02T12:00:00.000Z
--    amount_cents fica em 500 (preço do plano trial fixado pelo servidor) — a
--    Hotmart mandou price.value = 0 porque a primeira cobrança é o teste grátis.
UPDATE subscriptions
   SET status                   = 'active',
       provider_subscription_id = '6QAE1D6J',
       current_period_end       = '2026-08-02T12:00:00.000Z',
       currency                 = 'USD',
       updated_at               = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE correlation_code = '7023e40f3cde4ca876d0fe9cb4026784'
   AND status = 'pending';

-- 2) Registro de auditoria da liberação manual (mesmo formato do
--    ADMIN_OVERRIDE das rotas de suporte).
INSERT INTO subscription_events (correlation_code, from_status, to_status, raw_event, raw_payload, created_at)
SELECT '7023e40f3cde4ca876d0fe9cb4026784',
       'pending',
       'active',
       'ADMIN_OVERRIDE(liberacao retroativa da compra HP1260209174/subscriber 6QAE1D6J, aprovada na Hotmart em 2026-07-26T17:28:33Z e rejeitada pelo bug do xcod ausente — ver subscription_events id=9)',
       NULL,
       strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE EXISTS (SELECT 1 FROM subscriptions WHERE correlation_code = '7023e40f3cde4ca876d0fe9cb4026784' AND status = 'active')
   -- Idempotente: rodar o script duas vezes não duplica o registro de auditoria.
   AND NOT EXISTS (SELECT 1 FROM subscription_events
                    WHERE correlation_code = '7023e40f3cde4ca876d0fe9cb4026784'
                      AND raw_event LIKE 'ADMIN_OVERRIDE(liberacao retroativa%');

-- 3) Fecha as 3 pendências duplicadas do MESMO checkout (mesmo e-mail, mesmo
--    dia). Sem isso elas continuam elegíveis ao e-mail de "checkout
--    abandonado" (scripts/send-abandoned-checkout-email.js — hoje inerte por
--    falta de RESEND_API_KEY, mas ligaria sozinho no dia em que a chave
--    existir) e poluem qualquer relatório de funil.
UPDATE subscriptions
   SET status        = 'canceled',
       reminder_sent_at = COALESCE(reminder_sent_at, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
       updated_at    = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE correlation_code IN (
         '09ae328fd7ed0573bd09c3278283ca27',
         '60c63c06d55e47f2135dbf3b1e85dba0',
         '8306949e73250c6cd607b8e672660de7'
       )
   AND status = 'pending';

INSERT INTO subscription_events (correlation_code, from_status, to_status, raw_event, raw_payload, created_at)
SELECT correlation_code,
       'pending',
       'canceled',
       'ADMIN_OVERRIDE(tentativa duplicada do mesmo checkout — compra real ativada em 7023e40f3cde4ca876d0fe9cb4026784)',
       NULL,
       strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  FROM subscriptions s
 WHERE s.correlation_code IN (
         '09ae328fd7ed0573bd09c3278283ca27',
         '60c63c06d55e47f2135dbf3b1e85dba0',
         '8306949e73250c6cd607b8e672660de7'
       )
   AND s.status = 'canceled'
   -- Idempotente pelo mesmo motivo do INSERT acima.
   AND NOT EXISTS (SELECT 1 FROM subscription_events e
                    WHERE e.correlation_code = s.correlation_code
                      AND e.raw_event LIKE 'ADMIN_OVERRIDE(tentativa duplicada%');

-- 4) Marca o evento original como processado: sem isso, uma reentrega da
--    Hotmart (ou um replay manual) depois do deploy da correção ativaria uma
--    SEGUNDA linha pra mesma compra.
INSERT OR IGNORE INTO webhook_events_processed (event_id, processed_at)
VALUES ('4b279cf7-07ae-41a5-a035-f0f7268ab095', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

COMMIT;

-- ============================================================================
-- CONFERÊNCIA (rode depois; esperado: 1 linha active + 3 canceled)
-- ============================================================================
SELECT correlation_code, status, plan, amount_cents, currency, provider_subscription_id, current_period_end, updated_at
  FROM subscriptions
 WHERE LOWER(TRIM(customer_email)) = 'carlos.alberto.sanches09@gmail.com'
 ORDER BY created_at DESC;

-- E, do lado do app (tem que responder hasAccess:true):
--   curl -s https://api.cosmicguide.cloud/api/subscription/7023e40f3cde4ca876d0fe9cb4026784

-- ============================================================================
-- CONTINGÊNCIA (só se o Carlos disser que AINDA está bloqueado)
-- ----------------------------------------------------------------------------
-- Único cenário em que isso acontece: ele iniciou o checkout de 17:48 num
-- aparelho/navegador DIFERENTE do que usa pra ler o app (o AsyncStorage é por
-- aparelho). Aí o aparelho dele guarda um dos outros 3 códigos. Peça o print da
-- tela ou rode o SQL abaixo pro código que faltar — 'canceled' -> 'active' é
-- transição VÁLIDA na máquina de estados (domain/Subscription.js), então dá pra
-- ativar mais um sem inventar estado impossível:
--
--   UPDATE subscriptions SET status='active', provider_subscription_id='6QAE1D6J',
--          current_period_end='2026-08-02T12:00:00.000Z',
--          updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')
--    WHERE correlation_code='<código do outro aparelho>';
--
-- NÃO ative os 4 de uma vez "por garantia": além de multiplicar por 4 a receita
-- em qualquer relatório, um estorno/cancelamento futuro casa por
-- provider_subscription_id e só atinge UMA linha — as outras 3 continuariam
-- 'active' e o cliente estornado ficaria com acesso vitalício.
-- ============================================================================
