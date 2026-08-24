-- Localização de assinatura pelo suporte quando a pessoa não possui mais o correlationCode.
ALTER TABLE subscriptions ADD COLUMN customer_email TEXT;
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_email ON subscriptions(customer_email);
