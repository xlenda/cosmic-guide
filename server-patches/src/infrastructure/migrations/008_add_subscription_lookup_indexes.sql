-- Índices das novas formas de correlacionar um webhook a uma assinatura
-- (ProcessWebhookUseCase.resolveSubscription), criadas depois do incidente de
-- 26/07/2026: a Hotmart NÃO devolve o xcod no Checkout Elements embutido, então
-- 100% das compras aprovadas eram rejeitadas com "sem correlationCode no
-- payload" e o cliente pagante ficava sem acesso.
--
-- 1) provider_subscription_id = subscriber code da Hotmart (ex.: 6QAE1D6J).
--    É a chave estável usada em renovação, atraso, cancelamento e estorno.
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_sub_id
  ON subscriptions(provider_subscription_id);

-- 2) O índice antigo idx_subscriptions_customer_email é sobre a coluna crua e
--    NÃO serve pras consultas novas, que comparam LOWER(TRIM(customer_email))
--    dos dois lados (o e-mail salvo vem do login do Supabase, o do webhook vem
--    do que a pessoa digitou no checkout). Índice de expressão cobre a forma
--    exata usada em SubscriptionRepository.
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_email_norm
  ON subscriptions(LOWER(TRIM(customer_email)));

-- 3) A busca do fallback é "pendência mais recente daquele e-mail" — este
--    índice evita varrer a tabela inteira à medida que o volume de checkouts
--    iniciados (e nunca concluídos) cresce.
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_created
  ON subscriptions(status, created_at DESC);
