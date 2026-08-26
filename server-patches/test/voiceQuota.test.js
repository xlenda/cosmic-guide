const test = require("node:test");
const assert = require("node:assert/strict");

let Database = null;
try {
  Database = require("better-sqlite3");
} catch {}

const { VoiceQuota, GLOBAL_USAGE_USER_ID } = require("../src/infrastructure/VoiceQuota");

test("cota diária soma pedidos/caracteres atomicamente", { skip: !Database }, () => {
  const oldRequests = process.env.VOICE_DAILY_REQUEST_LIMIT;
  const oldCharacters = process.env.VOICE_DAILY_CHARACTER_LIMIT;
  process.env.VOICE_DAILY_REQUEST_LIMIT = "2";
  process.env.VOICE_DAILY_CHARACTER_LIMIT = "10";
  const db = new Database(":memory:");
  db.exec(`
    CREATE TABLE voice_usage_daily (
      user_id TEXT NOT NULL, day TEXT NOT NULL, requests INTEGER NOT NULL DEFAULT 0,
      characters INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL,
      PRIMARY KEY (user_id, day)
    );
  `);
  const quota = new VoiceQuota({ db });
  assert.equal(quota.reserve({ userId: "u1", characters: 4, day: "2026-08-26" }).allowed, true);
  assert.equal(quota.reserve({ userId: "u1", characters: 6, day: "2026-08-26" }).allowed, true);
  const blocked = quota.reserve({ userId: "u1", characters: 1, day: "2026-08-26" });
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.reason, "requests");
  const row = db.prepare("SELECT requests, characters FROM voice_usage_daily WHERE user_id='u1'").get();
  assert.deepEqual(row, { requests: 2, characters: 10 });
  db.close();
  if (oldRequests === undefined) delete process.env.VOICE_DAILY_REQUEST_LIMIT;
  else process.env.VOICE_DAILY_REQUEST_LIMIT = oldRequests;
  if (oldCharacters === undefined) delete process.env.VOICE_DAILY_CHARACTER_LIMIT;
  else process.env.VOICE_DAILY_CHARACTER_LIMIT = oldCharacters;
});

test("teto global bloqueia outra conta e reverte a reserva pessoal", { skip: !Database }, () => {
  const oldGlobalRequests = process.env.VOICE_GLOBAL_DAILY_REQUEST_LIMIT;
  const oldGlobalCharacters = process.env.VOICE_GLOBAL_DAILY_CHARACTER_LIMIT;
  process.env.VOICE_GLOBAL_DAILY_REQUEST_LIMIT = "1";
  process.env.VOICE_GLOBAL_DAILY_CHARACTER_LIMIT = "100";
  const db = new Database(":memory:");
  try {
    db.exec(`
      CREATE TABLE voice_usage_daily (
        user_id TEXT NOT NULL, day TEXT NOT NULL, requests INTEGER NOT NULL DEFAULT 0,
        characters INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL,
        PRIMARY KEY (user_id, day)
      );
    `);
    const quota = new VoiceQuota({ db });
    assert.equal(quota.reserve({ userId: "u1", characters: 10, day: "2026-08-26" }).allowed, true);
    const blocked = quota.reserve({ userId: "u2", characters: 10, day: "2026-08-26" });
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.reason, "global");
    assert.equal(db.prepare("SELECT COUNT(*) AS value FROM voice_usage_daily WHERE user_id='u2'").get().value, 0);
    assert.deepEqual(
      db.prepare("SELECT requests, characters FROM voice_usage_daily WHERE user_id=?").get(GLOBAL_USAGE_USER_ID),
      { requests: 1, characters: 10 }
    );
  } finally {
    db.close();
    if (oldGlobalRequests === undefined) delete process.env.VOICE_GLOBAL_DAILY_REQUEST_LIMIT;
    else process.env.VOICE_GLOBAL_DAILY_REQUEST_LIMIT = oldGlobalRequests;
    if (oldGlobalCharacters === undefined) delete process.env.VOICE_GLOBAL_DAILY_CHARACTER_LIMIT;
    else process.env.VOICE_GLOBAL_DAILY_CHARACTER_LIMIT = oldGlobalCharacters;
  }
});
