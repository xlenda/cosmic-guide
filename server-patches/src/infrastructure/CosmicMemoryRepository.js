"use strict";

const crypto = require("node:crypto");
const {
  MEMORY_CONSENT_VERSION,
  memoryCandidateFromMessage,
  normalizeForSearch,
  rankMemories,
} = require("../application/cosmicMemory");

const MAX_STORED_MEMORIES = 300;

function cleanUserId(value) {
  return typeof value === "string" ? value.trim() : "";
}

function publicMemory(row) {
  return {
    id: row.id,
    kind: row.kind,
    topic: row.topic,
    content: row.content,
    source: row.source,
    occurrenceCount: row.occurrence_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastUsedAt: row.last_used_at || null,
  };
}

class CosmicMemoryRepository {
  constructor({ database } = {}) {
    if (!database || typeof database.prepare !== "function") throw new TypeError("database é obrigatório");
    this.db = database;
  }

  preference(userId) {
    const id = cleanUserId(userId);
    const row = id
      ? this.db.prepare("SELECT enabled, consent_version, consented_at, updated_at FROM cosmic_memory_preferences WHERE user_id = ?").get(id)
      : null;
    return {
      enabled: Boolean(row && row.enabled === 1),
      consentVersion: row && row.consent_version || null,
      consentedAt: row && row.consented_at || null,
      updatedAt: row && row.updated_at || null,
    };
  }

  setConsent({ userId, enabled, now = new Date().toISOString() } = {}) {
    const id = cleanUserId(userId);
    if (!id) throw new TypeError("userId é obrigatório");
    const on = enabled === true;
    this.db.prepare(`
      INSERT INTO cosmic_memory_preferences (user_id, enabled, consent_version, consented_at, updated_at)
      VALUES (@userId, @enabled, @version, @consentedAt, @now)
      ON CONFLICT(user_id) DO UPDATE SET
        enabled = excluded.enabled,
        consent_version = CASE WHEN excluded.enabled = 1 THEN excluded.consent_version ELSE cosmic_memory_preferences.consent_version END,
        consented_at = CASE WHEN excluded.enabled = 1 THEN COALESCE(cosmic_memory_preferences.consented_at, excluded.consented_at) ELSE cosmic_memory_preferences.consented_at END,
        updated_at = excluded.updated_at
    `).run({ userId: id, enabled: on ? 1 : 0, version: MEMORY_CONSENT_VERSION, consentedAt: on ? now : null, now });
    return this.preference(id);
  }

  list({ userId, limit = MAX_STORED_MEMORIES } = {}) {
    const id = cleanUserId(userId);
    if (!id) return [];
    const safeLimit = Math.max(1, Math.min(MAX_STORED_MEMORIES, Number(limit) || MAX_STORED_MEMORIES));
    return this.db.prepare(`
      SELECT id, kind, topic, content, source, occurrence_count, created_at, updated_at, last_used_at
        FROM cosmic_memories
       WHERE user_id = ?
       ORDER BY updated_at DESC, id DESC
       LIMIT ?
    `).all(id, safeLimit).map(publicMemory);
  }

  rememberChatMessage({ userId, message, contexto, now = new Date().toISOString() } = {}) {
    const id = cleanUserId(userId);
    if (!id || !this.preference(id).enabled) return null;
    const candidate = memoryCandidateFromMessage({ message, contexto });
    if (!candidate) return null;
    const fingerprint = crypto
      .createHash("sha256")
      .update(`${candidate.topic}\0${normalizeForSearch(candidate.content)}`, "utf8")
      .digest("hex");
    this.db.prepare(`
      INSERT INTO cosmic_memories
        (user_id, kind, topic, content, source, fingerprint, occurrence_count, created_at, updated_at)
      VALUES
        (@userId, @kind, @topic, @content, @source, @fingerprint, 1, @now, @now)
      ON CONFLICT(user_id, fingerprint) DO UPDATE SET
        occurrence_count = cosmic_memories.occurrence_count + 1,
        updated_at = excluded.updated_at
    `).run({ userId: id, ...candidate, fingerprint, now });

    this.db.prepare(`
      DELETE FROM cosmic_memories
       WHERE user_id = ?
         AND id NOT IN (
           SELECT id FROM cosmic_memories WHERE user_id = ? ORDER BY updated_at DESC, id DESC LIMIT ?
         )
    `).run(id, id, MAX_STORED_MEMORIES);
    return this.db.prepare("SELECT * FROM cosmic_memories WHERE user_id = ? AND fingerprint = ?").get(id, fingerprint);
  }

  relevant({ userId, query, contexto, limit } = {}) {
    const id = cleanUserId(userId);
    if (!id || !this.preference(id).enabled) return [];
    const ranked = rankMemories(this.list({ userId: id, limit: MAX_STORED_MEMORIES }), { query, contexto, limit });
    if (ranked.length) {
      const ids = ranked.map((memory) => Number(memory.id)).filter(Number.isInteger);
      if (ids.length) {
        this.db.prepare(`UPDATE cosmic_memories SET last_used_at = ? WHERE user_id = ? AND id IN (${ids.map(() => "?").join(",")})`)
          .run(new Date().toISOString(), id, ...ids);
      }
    }
    return ranked;
  }

  deleteOne({ userId, memoryId } = {}) {
    const id = cleanUserId(userId);
    const itemId = Number(memoryId);
    if (!id || !Number.isInteger(itemId) || itemId <= 0) return 0;
    return this.db.prepare("DELETE FROM cosmic_memories WHERE user_id = ? AND id = ?").run(id, itemId).changes;
  }

  deleteMemories({ userId } = {}) {
    const id = cleanUserId(userId);
    return id ? this.db.prepare("DELETE FROM cosmic_memories WHERE user_id = ?").run(id).changes : 0;
  }

  deleteAccountRows({ userId } = {}) {
    const id = cleanUserId(userId);
    if (!id) return { memories: 0, preferences: 0 };
    const memories = this.db.prepare("DELETE FROM cosmic_memories WHERE user_id = ?").run(id).changes;
    const preferences = this.db.prepare("DELETE FROM cosmic_memory_preferences WHERE user_id = ?").run(id).changes;
    return { memories, preferences };
  }
}

module.exports = { CosmicMemoryRepository, MAX_STORED_MEMORIES, publicMemory };
