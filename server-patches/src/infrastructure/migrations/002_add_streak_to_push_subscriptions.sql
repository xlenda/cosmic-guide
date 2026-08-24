ALTER TABLE push_subscriptions ADD COLUMN last_active_date TEXT;
ALTER TABLE push_subscriptions ADD COLUMN current_streak INTEGER DEFAULT 0;
