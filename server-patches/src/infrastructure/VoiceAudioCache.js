const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;
const DEFAULT_MAX_TOTAL_BYTES = 128 * 1024 * 1024;
const TEMP_FILE_TTL_MS = 15 * 60 * 1000;
const CACHE_KEY = /^[a-f0-9]{64}$/;
const CACHE_FILE = /^[a-f0-9]{64}\.mp3$/;
const CACHE_TEMP_FILE = /^[a-f0-9]{64}\.mp3\.\d+\.[a-f0-9]{12}\.tmp$/;

function positiveInteger(value, fallback, maximum) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 && parsed <= maximum ? parsed : fallback;
}

class VoiceAudioCache {
  constructor({
    directory,
    ttlMs = process.env.VOICE_CACHE_TTL_MS,
    maxTotalBytes = process.env.VOICE_CACHE_MAX_BYTES,
    maxFileBytes = 12 * 1024 * 1024,
  } = {}) {
    if (!directory) throw new Error("voice cache directory ausente");
    this.directory = directory;
    // A política pública promete "até 24 horas"; nem uma env errada pode
    // transformar essa frase em mentira. Valores menores continuam aceitos.
    this.ttlMs = positiveInteger(ttlMs, DEFAULT_TTL_MS, DEFAULT_TTL_MS);
    this.maxTotalBytes = positiveInteger(maxTotalBytes, DEFAULT_MAX_TOTAL_BYTES, 1024 * 1024 * 1024);
    this.maxFileBytes = positiveInteger(maxFileBytes, 12 * 1024 * 1024, 20 * 1024 * 1024);
    this.lastPruneAt = 0;
    this.prunePromise = null;
    this.expiryTimer = null;
    this.nextExpiryAt = null;
    fs.mkdirSync(this.directory, { recursive: true, mode: 0o700 });
    // Limpa sobras vencidas no boot e arma a exclusão da próxima. Depender
    // apenas de um novo get/set deixava um MP3 físico sobreviver indefinidamente
    // numa instalação sem novos pedidos, contrariando o teto público de 24h.
    this.prune().catch(() => console.error("[voice-cache] falha de limpeza inicial"));
  }

  static keyFor({ text, lang, identity }) {
    return crypto
      .createHash("sha256")
      .update(`cosmic-voice-cache-v1\0${lang}\0${identity}\0${text}`, "utf8")
      .digest("hex");
  }

  #pathFor(key) {
    if (!CACHE_KEY.test(key)) throw new Error("voice cache key inválida");
    return path.join(this.directory, `${key}.mp3`);
  }

  async get(key) {
    const file = this.#pathFor(key);
    try {
      const stat = await fs.promises.stat(file);
      if (!stat.isFile() || stat.size <= 0 || stat.size > this.maxFileBytes || Date.now() - stat.mtimeMs > this.ttlMs) {
        await fs.promises.rm(file, { force: true });
        return null;
      }
      const audio = await fs.promises.readFile(file);
      this.#schedulePrune();
      return audio;
    } catch (error) {
      if (error && error.code !== "ENOENT") {
        console.error("[voice-cache] falha de leitura");
      }
      return null;
    }
  }

  async set(key, audio) {
    if (!Buffer.isBuffer(audio) || !audio.length || audio.length > this.maxFileBytes) {
      throw new Error("áudio inválido para cache");
    }
    const file = this.#pathFor(key);
    const temp = `${file}.${process.pid}.${crypto.randomBytes(6).toString("hex")}.tmp`;
    try {
      await fs.promises.writeFile(temp, audio, { flag: "wx", mode: 0o600 });
      await fs.promises.rename(temp, file);
      await fs.promises.chmod(file, 0o600).catch(() => {});
      this.#scheduleExpiry(Date.now() + this.ttlMs);
      this.#schedulePrune();
    } finally {
      await fs.promises.rm(temp, { force: true }).catch(() => {});
    }
  }

  #schedulePrune() {
    const now = Date.now();
    if (now - this.lastPruneAt < 60 * 60 * 1000 || this.prunePromise) return;
    this.lastPruneAt = now;
    this.prunePromise = this.prune()
      .catch(() => console.error("[voice-cache] falha de limpeza"))
      .finally(() => {
        this.prunePromise = null;
      });
  }

  #scheduleExpiry(expiresAt) {
    if (!Number.isFinite(expiresAt)) {
      // Um set pode ter criado um arquivo enquanto este prune lia o diretório.
      // Não cancelar um timer já armado evita perder a validade desse arquivo;
      // um disparo redundante depois que o cache esvaziou é inofensivo.
      if (!this.expiryTimer) this.nextExpiryAt = null;
      return;
    }
    if (this.expiryTimer && this.nextExpiryAt <= expiresAt) return;
    if (this.expiryTimer) clearTimeout(this.expiryTimer);
    this.nextExpiryAt = expiresAt;
    this.expiryTimer = setTimeout(() => {
      this.expiryTimer = null;
      this.nextExpiryAt = null;
      this.prune().catch(() => console.error("[voice-cache] falha de limpeza por validade"));
    }, Math.max(1, expiresAt - Date.now()));
    if (typeof this.expiryTimer.unref === "function") this.expiryTimer.unref();
  }

  async prune() {
    const entries = await fs.promises.readdir(this.directory, { withFileTypes: true });
    const files = [];
    let total = 0;
    const now = Date.now();

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const isCacheFile = CACHE_FILE.test(entry.name);
      const isTempFile = CACHE_TEMP_FILE.test(entry.name);
      if (!isCacheFile && !isTempFile) continue;
      const file = path.join(this.directory, entry.name);
      try {
        const stat = await fs.promises.stat(file);
        const entryTtlMs = isTempFile ? Math.min(this.ttlMs, TEMP_FILE_TTL_MS) : this.ttlMs;
        if (stat.size <= 0 || stat.size > this.maxFileBytes || now - stat.mtimeMs > entryTtlMs) {
          await fs.promises.rm(file, { force: true });
          continue;
        }
        files.push({ file, size: stat.size, mtimeMs: stat.mtimeMs, expiresAt: stat.mtimeMs + entryTtlMs });
        total += stat.size;
      } catch {}
    }

    const removed = new Set();
    if (total > this.maxTotalBytes) {
      files.sort((a, b) => a.mtimeMs - b.mtimeMs);
      for (const item of files) {
        await fs.promises.rm(item.file, { force: true }).catch(() => {});
        removed.add(item.file);
        total -= item.size;
        if (total <= this.maxTotalBytes) break;
      }
    }

    const remaining = files.filter((item) => !removed.has(item.file));
    const nextExpiry = remaining.length
      ? Math.min(...remaining.map((item) => item.expiresAt))
      : null;
    this.#scheduleExpiry(nextExpiry);
  }
}

module.exports = { VoiceAudioCache, DEFAULT_TTL_MS, DEFAULT_MAX_TOTAL_BYTES, TEMP_FILE_TTL_MS };
