const test = require("node:test");
const assert = require("node:assert/strict");

const {
  ElevenLabsVoiceProvider,
  VoiceProviderError,
  DEFAULT_VOICE_IDS,
} = require("../src/infrastructure/ElevenLabsVoiceProvider");

function headers(values) {
  const map = new Map(Object.entries(values || {}).map(([key, value]) => [key.toLowerCase(), String(value)]));
  return { get: (name) => map.get(String(name).toLowerCase()) || null };
}

test("sem chave: provider fecha e não anuncia idioma algum", () => {
  const provider = new ElevenLabsVoiceProvider({ apiKey: "", fetchFn: async () => null });
  assert.deepEqual(provider.availableLanguages(), []);
  assert.equal(provider.isConfigured("pt"), false);
});

test("os três defaults são IDs reais distintos e ficam só no servidor", () => {
  assert.match(DEFAULT_VOICE_IDS.pt, /^[A-Za-z0-9_-]{8,80}$/);
  assert.match(DEFAULT_VOICE_IDS.es, /^[A-Za-z0-9_-]{8,80}$/);
  assert.match(DEFAULT_VOICE_IDS.en, /^[A-Za-z0-9_-]{8,80}$/);
  assert.equal(new Set(Object.values(DEFAULT_VOICE_IDS)).size, 3);
});

test("pedido usa endpoint fixo, voz do servidor, modelo multilíngue e retorna MP3", async () => {
  let captured = null;
  const provider = new ElevenLabsVoiceProvider({
    apiKey: "test-key-never-real",
    voiceIds: { pt: "voicePT123", es: "voiceES123", en: "voiceEN123" },
    fetchFn: async (url, options) => {
      captured = { url, options };
      return {
        ok: true,
        status: 200,
        headers: headers({ "content-type": "audio/mpeg", "content-length": "4" }),
        arrayBuffer: async () => Uint8Array.from([0x49, 0x44, 0x33, 4]).buffer,
      };
    },
  });

  const audio = await provider.synthesize({ text: "Olá", lang: "pt" });
  assert.deepEqual([...audio], [0x49, 0x44, 0x33, 4]);
  assert.match(captured.url, /api\.elevenlabs\.io\/v1\/text-to-speech\/voicePT123/);
  assert.doesNotMatch(captured.url, /test-key-never-real/);
  const body = JSON.parse(captured.options.body);
  assert.equal(body.text, "Olá");
  assert.equal(body.model_id, "eleven_multilingual_v2");
  assert.equal(body.voice_id, undefined);
  assert.equal(captured.options.headers["xi-api-key"], "test-key-never-real");
});

test("resposta que não é áudio e áudio acima do teto são recusados", async () => {
  const badType = new ElevenLabsVoiceProvider({
    apiKey: "test-key-never-real",
    fetchFn: async () => ({
      ok: true,
      headers: headers({ "content-type": "application/json" }),
      arrayBuffer: async () => new ArrayBuffer(2),
    }),
  });
  await assert.rejects(
    () => badType.synthesize({ text: "x", lang: "pt" }),
    (error) => error instanceof VoiceProviderError && error.code === "voice_provider_invalid_audio"
  );

  const tooLarge = new ElevenLabsVoiceProvider({
    apiKey: "test-key-never-real",
    maxAudioBytes: 64 * 1024,
    fetchFn: async () => ({
      ok: true,
      headers: headers({ "content-type": "audio/mpeg", "content-length": String(70 * 1024) }),
      arrayBuffer: async () => new ArrayBuffer(0),
    }),
  });
  await assert.rejects(
    () => tooLarge.synthesize({ text: "x", lang: "en" }),
    (error) => error instanceof VoiceProviderError && error.code === "voice_provider_audio_too_large"
  );
});

test("stream sem Content-Length é interrompido ao ultrapassar o teto", async () => {
  let reads = 0;
  let cancelled = false;
  const chunks = [Buffer.alloc(40 * 1024), Buffer.alloc(30 * 1024)];
  const provider = new ElevenLabsVoiceProvider({
    apiKey: "test-key-never-real",
    maxAudioBytes: 64 * 1024,
    fetchFn: async () => ({
      ok: true,
      headers: headers({ "content-type": "audio/mpeg" }),
      body: {
        getReader: () => ({
          read: async () => reads < chunks.length
            ? { done: false, value: chunks[reads++] }
            : { done: true },
          cancel: async () => { cancelled = true; },
          releaseLock: () => {},
        }),
      },
    }),
  });

  await assert.rejects(
    () => provider.synthesize({ text: "x", lang: "pt" }),
    (error) => error instanceof VoiceProviderError && error.code === "voice_provider_audio_too_large"
  );
  assert.equal(cancelled, true);
});

test("timeout aborta o fetch e vira erro tipado sem conteúdo do pedido", async () => {
  const provider = new ElevenLabsVoiceProvider({
    apiKey: "test-key-never-real",
    timeoutMs: 5_000,
    fetchFn: (_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => {
        const error = new Error("aborted");
        error.name = "AbortError";
        reject(error);
      });
      // O teste não espera 5s: força o mesmo sinal que o timer usa.
      setImmediate(() => signal.dispatchEvent(new Event("abort")));
    }),
  });
  // dispatchEvent não muda signal.aborted; ainda assim AbortError é mapeado.
  await assert.rejects(
    () => provider.synthesize({ text: "conteúdo privado", lang: "pt" }),
    (error) => error instanceof VoiceProviderError && error.code === "voice_provider_timeout"
  );
});
