CREATE TABLE IF NOT EXISTS couple_invites (
  code TEXT PRIMARY KEY,
  inviter_endpoint TEXT NOT NULL,
  couple_name TEXT,
  created_at TEXT NOT NULL,
  accepted_at TEXT
);
