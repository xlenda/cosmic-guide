CREATE TABLE IF NOT EXISTS cosmic_memory_preferences (
  user_id TEXT PRIMARY KEY,
  enabled INTEGER NOT NULL DEFAULT 0 CHECK (enabled IN (0, 1)),
  consent_version TEXT,
  consented_at TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cosmic_memories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'orbi_statement',
  topic TEXT NOT NULL DEFAULT 'general',
  content TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'orbi_chat',
  fingerprint TEXT NOT NULL,
  occurrence_count INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_used_at TEXT,
  UNIQUE(user_id, fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_cosmic_memories_user_updated
  ON cosmic_memories(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_cosmic_memory_preferences_enabled
  ON cosmic_memory_preferences(enabled);
