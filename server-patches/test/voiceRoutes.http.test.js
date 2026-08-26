const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const { once } = require("node:events");

const { buildVoiceRouter } = require("../src/http/voiceRoutes");
const { VoiceSynthesisError } = require("../src/application/VoiceSynthesisService");

let behavior = async () => ({ audio: Buffer.from([1, 2, 3]), source: "provider" });
let received = null;
const service = {
  maxTextCharacters: 20,
  status: () => ({
    available: true,
    languages: ["pt", "es", "en"],
    maxCharacters: 20,
    requiresLogin: true,
    requiresVerifiedEmail: true,
  }),
  synthesize: async (input) => {
    received = input;
    return behavior(input);
  },
};

function fakeAuth(req, res, next) {
  if (req.headers.authorization !== "Bearer valid") {
    return res.status(401).json({ error: "token ausente" });
  }
  req.userId = "user-verified";
  next();
}

function fakeVerified(req, res, next) {
  if (req.headers["x-email-verified"] !== "1") {
    return res.status(403).json({ error: "confirme seu e-mail" });
  }
  next();
}

const app = express();
app.use(express.json({ limit: "16kb" }));
app.use("/api/voice", buildVoiceRouter({ service, requireAuth: fakeAuth, requireVerifiedEmail: fakeVerified }));
const server = app.listen(0, "127.0.0.1");
let base = null;

test.before(async () => {
  if (!server.listening) await once(server, "listening");
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => {
  server.close();
  if (typeof server.closeAllConnections === "function") server.closeAllConnections();
});
test.beforeEach(() => {
  behavior = async () => ({ audio: Buffer.from([1, 2, 3]), source: "provider" });
  received = null;
});

function post(body, headers = {}) {
  return fetch(`${base}/api/voice/synthesize`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const auth = { Authorization: "Bearer valid", "X-Email-Verified": "1" };

test("status é público, honesto e não expõe chave nem voice IDs", async () => {
  const response = await fetch(`${base}/api/voice/status`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.available, true);
  assert.deepEqual(body.languages, ["pt", "es", "en"]);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.doesNotMatch(JSON.stringify(body), /api.?key|voice.?id|elevenlabs/i);
});

test("síntese exige conta e e-mail confirmado antes de chamar o serviço", async () => {
  assert.equal((await post({ text: "olá", lang: "pt" })).status, 401);
  assert.equal((await post({ text: "olá", lang: "pt" }, { Authorization: "Bearer valid" })).status, 403);
  assert.equal(received, null);
});

test("valida idioma, tamanho e recusa voz escolhida pelo cliente", async () => {
  assert.equal((await post({ text: "olá", lang: "fr" }, auth)).status, 400);
  const long = await post({ text: "x".repeat(21), lang: "pt" }, auth);
  assert.equal(long.status, 413);
  assert.equal((await long.json()).maxCharacters, 20);
  const override = await post({ text: "olá", lang: "pt", voiceId: "attacker" }, auth);
  assert.equal(override.status, 400);
  assert.equal((await override.json()).code, "voice_selection_server_only");
});

test("normaliza controles, usa userId verificado e devolve MP3 privado", async () => {
  const response = await post({ text: "  olá\u0000   mundo  ", lang: "pt" }, auth);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "audio/mpeg");
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [1, 2, 3]);
  assert.deepEqual(received, { userId: "user-verified", text: "olá mundo", lang: "pt" });
});

test("cota e timeout viram respostas estáveis sem detalhe do provedor", async () => {
  behavior = async () => { throw new VoiceSynthesisError("voice_quota_exhausted"); };
  const quota = await post({ text: "olá", lang: "pt" }, auth);
  assert.equal(quota.status, 429);
  assert.equal((await quota.json()).code, "voice_quota_exhausted");
  assert.ok(Number(quota.headers.get("retry-after")) > 0);

  behavior = async () => { throw new VoiceSynthesisError("voice_timeout", { retryable: true }); };
  const timeout = await post({ text: "olá", lang: "en" }, auth);
  assert.equal(timeout.status, 504);
  const body = await timeout.json();
  assert.equal(body.code, "voice_timeout");
  assert.doesNotMatch(JSON.stringify(body), /ElevenLabs|stack|conteúdo/i);
});
