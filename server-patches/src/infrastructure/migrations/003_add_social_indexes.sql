CREATE INDEX IF NOT EXISTS idx_social_posts_user_created ON social_posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_follows_followee ON social_follows(followee_id);
