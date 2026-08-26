const test = require("node:test");
const assert = require("node:assert/strict");

const {
  VoiceSynthesisService,
  VoiceSynthesisError,
} = require("../src/application/VoiceSynthesisService");

function fixture({ cached = null, quotaAllowed = true, quotaReason = null } = {}) {
  const calls = { provider: 0, reserve: 0, set: 0 };
  const cache = {
    get: async () => cached,
    set: async (_key, audio) => {
      calls.set += 1;
      assert.ok(Buffer.isBuffer(audio));
    },
  };
  const quota = {
    reserve: () => {
      calls.reserve += 1;
      return { allowed: quotaAllowed, reason: quotaReason };
    },
  };
  const provider = {
    availableLanguages: () => ["pt", "es", "en"],
    isConfigured: (lang) => ["pt", "es", "en"].includes(lang),
    cacheIdentity: (lang) => `identity-${lang}`,
    synthesize: async () => {
      calls.provider += 1;
      return Buffer.from([9, 8, 7]);
    },
  };
  return { service: new VoiceSynthesisService({ provider, cache, quota }), calls };
}

test("cache hit não consome cota nem chama a ElevenLabs", async () => {
  const { service, calls } = fixture({ cached: Buffer.from([1, 2]) });
  const result = await service.synthesize({ userId: "u1", text: "mesmo texto", lang: "pt" });
  assert.deepEqual([...result.audio], [1, 2]);
  assert.equal(result.source, "cache");
  assert.deepEqual(calls, { provider: 0, reserve: 0, set: 0 });
});

test("cache miss reserva antes do provider e grava o áudio recebido", async () => {
  const { service, calls } = fixture();
  const result = await service.synthesize({ userId: "u1", text: "uma leitura", lang: "es" });
  assert.deepEqual([...result.audio], [9, 8, 7]);
  assert.equal(result.source, "provider");
  assert.deepEqual(calls, { provider: 1, reserve: 1, set: 1 });
});

test("cota esgotada fecha antes de qualquer chamada paga", async () => {
  const { service, calls } = fixture({ quotaAllowed: false });
  await assert.rejects(
    () => service.synthesize({ userId: "u1", text: "uma leitura", lang: "en" }),
    (error) => error instanceof VoiceSynthesisError && error.code === "voice_quota_exhausted"
  );
  assert.deepEqual(calls, { provider: 0, reserve: 1, set: 0 });
});

test("teto global usa erro honesto e fecha antes da chamada paga", async () => {
  const { service, calls } = fixture({ quotaAllowed: false, quotaReason: "global" });
  await assert.rejects(
    () => service.synthesize({ userId: "u2", text: "uma leitura", lang: "pt" }),
    (error) => error instanceof VoiceSynthesisError && error.code === "voice_global_quota_exhausted"
  );
  assert.deepEqual(calls, { provider: 0, reserve: 1, set: 0 });
});

test("pedidos idênticos simultâneos são deduplicados", async () => {
  const { service, calls } = fixture();
  const [a, b] = await Promise.all([
    service.synthesize({ userId: "u1", text: "igual", lang: "pt" }),
    service.synthesize({ userId: "u2", text: "igual", lang: "pt" }),
  ]);
  assert.deepEqual(a.audio, b.audio);
  assert.equal(calls.provider, 1);
  assert.equal(calls.reserve, 1);
});
