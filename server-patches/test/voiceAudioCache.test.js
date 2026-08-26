const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  VoiceAudioCache,
  DEFAULT_TTL_MS,
  TEMP_FILE_TTL_MS,
} = require("../src/infrastructure/VoiceAudioCache");

const tempRoot = process.env.COSMIC_TEST_TEMP || os.tmpdir();
const directory = fs.mkdtempSync(path.join(tempRoot, "cosmic-voice-cache-test-"));

test.after(() => fs.rmSync(directory, { recursive: true, force: true }));

test("cache usa somente hash no disco e devolve o MP3", async () => {
  const cache = new VoiceAudioCache({ directory, ttlMs: DEFAULT_TTL_MS });
  const text = "segredo que nunca pode virar nome de arquivo";
  const key = VoiceAudioCache.keyFor({ text, lang: "pt", identity: "voice-model" });
  assert.match(key, /^[a-f0-9]{64}$/);
  assert.doesNotMatch(key, /segredo|arquivo/);
  await cache.set(key, Buffer.from([7, 8, 9]));
  const names = fs.readdirSync(directory);
  assert.deepEqual(names, [`${key}.mp3`]);
  assert.doesNotMatch(names[0], /segredo|arquivo/);
  assert.deepEqual([...(await cache.get(key))], [7, 8, 9]);
});

test("arquivo acima de 24h expira e é removido", async () => {
  const cache = new VoiceAudioCache({ directory, ttlMs: DEFAULT_TTL_MS });
  const key = VoiceAudioCache.keyFor({ text: "antigo", lang: "en", identity: "voice-model" });
  await cache.set(key, Buffer.from([1]));
  const file = path.join(directory, `${key}.mp3`);
  const old = new Date(Date.now() - DEFAULT_TTL_MS - 1_000);
  fs.utimesSync(file, old, old);
  assert.equal(await cache.get(key), null);
  assert.equal(fs.existsSync(file), false);
});

test("env não consegue elevar retenção acima das 24h prometidas", () => {
  const cache = new VoiceAudioCache({ directory, ttlMs: 7 * DEFAULT_TTL_MS });
  assert.equal(cache.ttlMs, DEFAULT_TTL_MS);
});

test("áudio expira fisicamente mesmo sem outro get ou set", async () => {
  const idleDirectory = fs.mkdtempSync(path.join(tempRoot, "cosmic-voice-cache-idle-"));
  try {
    const cache = new VoiceAudioCache({ directory: idleDirectory, ttlMs: 30 });
    const key = VoiceAudioCache.keyFor({ text: "sem nova atividade", lang: "pt", identity: "voice-model" });
    const file = path.join(idleDirectory, `${key}.mp3`);
    await cache.set(key, Buffer.from([1, 2, 3]));
    assert.equal(fs.existsSync(file), true);
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(fs.existsSync(file), false);
  } finally {
    fs.rmSync(idleDirectory, { recursive: true, force: true });
  }
});

test("temporário deixado por queda do processo também expira e entra no timer", async () => {
  const tempDirectory = fs.mkdtempSync(path.join(tempRoot, "cosmic-voice-cache-crash-"));
  try {
    const key = VoiceAudioCache.keyFor({ text: "queda", lang: "es", identity: "voice-model" });
    const file = path.join(tempDirectory, `${key}.mp3.1234.abcdef123456.tmp`);
    fs.writeFileSync(file, Buffer.from([1, 2, 3]), { mode: 0o600 });
    const old = new Date(Date.now() - TEMP_FILE_TTL_MS - 1_000);
    fs.utimesSync(file, old, old);
    new VoiceAudioCache({ directory: tempDirectory, ttlMs: DEFAULT_TTL_MS });
    for (let attempt = 0; attempt < 40 && fs.existsSync(file); attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    assert.equal(fs.existsSync(file), false);
  } finally {
    fs.rmSync(tempDirectory, { recursive: true, force: true });
  }
});
