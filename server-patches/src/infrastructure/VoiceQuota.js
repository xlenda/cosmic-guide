const DEFAULT_REQUEST_LIMIT = 6;
const DEFAULT_CHARACTER_LIMIT = 12_000;
const DEFAULT_GLOBAL_REQUEST_LIMIT = 100;
const DEFAULT_GLOBAL_CHARACTER_LIMIT = 100_000;
const GLOBAL_USAGE_USER_ID = "__cosmic_voice_global_daily_cap__";

function limitFromEnv(name, fallback, max) {
  const parsed = Number.parseInt(String(process.env[name] ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 && parsed <= max ? parsed : fallback;
}

class VoiceQuota {
  constructor({ db } = {}) {
    if (!db) throw new Error("voice quota db ausente");
    this.db = db;
    this.lastPurgeAt = 0;
    this.reserveStmt = db.prepare(`
      INSERT INTO voice_usage_daily (user_id, day, requests, characters, updated_at)
      VALUES (@userId, @day, 1, @characters, @now)
      ON CONFLICT(user_id, day) DO UPDATE SET
        requests = requests + 1,
        characters = characters + excluded.characters,
        updated_at = @now
      WHERE requests < @requestLimit
        AND characters + excluded.characters <= @characterLimit
    `);
    this.readStmt = db.prepare(`
      SELECT requests, characters FROM voice_usage_daily
      WHERE user_id = ? AND day = ?
    `);
    this.purgeStmt = db.prepare("DELETE FROM voice_usage_daily WHERE day < ?");
    this.reserveBoth = db.transaction(({ account, global }) => {
      const accountResult = this.reserveStmt.run(account);
      if (accountResult.changes === 0) return { allowed: false, scope: "account" };

      const globalResult = this.reserveStmt.run(global);
      if (globalResult.changes === 0) {
        // Lançar é intencional: o better-sqlite3 desfaz também a reserva da
        // conta feita acima. Sem rollback, bater no teto global queimaria a
        // cota pessoal mesmo sem chamar a ElevenLabs.
        const error = new Error("voice_global_quota_exhausted");
        error.code = "voice_global_quota_exhausted";
        throw error;
      }
      return { allowed: true, scope: "both" };
    });
  }

  limits() {
    return {
      requests: limitFromEnv("VOICE_DAILY_REQUEST_LIMIT", DEFAULT_REQUEST_LIMIT, 100),
      characters: limitFromEnv("VOICE_DAILY_CHARACTER_LIMIT", DEFAULT_CHARACTER_LIMIT, 100_000),
    };
  }

  globalLimits() {
    return {
      requests: limitFromEnv("VOICE_GLOBAL_DAILY_REQUEST_LIMIT", DEFAULT_GLOBAL_REQUEST_LIMIT, 10_000),
      characters: limitFromEnv(
        "VOICE_GLOBAL_DAILY_CHARACTER_LIMIT",
        DEFAULT_GLOBAL_CHARACTER_LIMIT,
        10_000_000
      ),
    };
  }

  reserve({ userId, characters, day = new Date().toISOString().slice(0, 10) }) {
    const limits = this.limits();
    const globalLimits = this.globalLimits();
    if (!userId || !Number.isInteger(characters) || characters <= 0) {
      throw new Error("reserva de voz inválida");
    }
    if (characters > limits.characters) {
      return { allowed: false, reason: "characters", limits };
    }
    if (characters > globalLimits.characters) {
      return { allowed: false, reason: "global", limits: globalLimits };
    }

    const now = new Date().toISOString();
    let result;
    try {
      result = this.reserveBoth({
        account: {
          userId,
          day,
          characters,
          now,
          requestLimit: limits.requests,
          characterLimit: limits.characters,
        },
        global: {
          userId: GLOBAL_USAGE_USER_ID,
          day,
          characters,
          now,
          requestLimit: globalLimits.requests,
          characterLimit: globalLimits.characters,
        },
      });
    } catch (error) {
      if (!error || error.code !== "voice_global_quota_exhausted") throw error;
      this.#purgeOldRows();
      return { allowed: false, reason: "global", limits: globalLimits };
    }
    this.#purgeOldRows();
    if (result.allowed) return { allowed: true, limits };

    const used = this.readStmt.get(userId, day) || { requests: 0, characters: 0 };
    const reason = used.requests >= limits.requests ? "requests" : "characters";
    return { allowed: false, reason, limits };
  }

  #purgeOldRows() {
    const now = Date.now();
    if (now - this.lastPurgeAt < 60 * 60 * 1000) return;
    this.lastPurgeAt = now;
    try {
      const cutoff = new Date(now - 31 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      this.purgeStmt.run(cutoff);
    } catch {
      console.error("[voice-quota] falha de limpeza");
    }
  }
}

module.exports = {
  VoiceQuota,
  DEFAULT_REQUEST_LIMIT,
  DEFAULT_CHARACTER_LIMIT,
  DEFAULT_GLOBAL_REQUEST_LIMIT,
  DEFAULT_GLOBAL_CHARACTER_LIMIT,
  GLOBAL_USAGE_USER_ID,
};
