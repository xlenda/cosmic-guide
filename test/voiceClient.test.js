const test = require('node:test');
const assert = require('node:assert/strict');

const {
  VoiceClientError,
  __resetVoiceClientForTests,
  fetchVoiceStatus,
  requestVoiceAudio,
  setVoiceAuthTokenProvider,
} = require('../lib/voiceClient');

const originalFetch = global.fetch;

test.afterEach(() => {
  global.fetch = originalFetch;
  __resetVoiceClientForTests();
});

test('status só habilita idiomas confirmados pelo backend', async () => {
  global.fetch = async () => new Response(JSON.stringify({
    available: true,
    languages: ['pt', 'es', 'en', 'fr'],
    maxCharacters: 4000,
    requiresLogin: true,
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  const status = await fetchVoiceStatus();
  assert.equal(status.available, true);
  assert.deepEqual(status.languages, ['pt', 'es', 'en']);
  assert.equal(status.maxCharacters, 4000);
});

test('sem sessão, não bate na rede nem oferece fallback local', async () => {
  let fetched = false;
  global.fetch = async () => {
    fetched = true;
    throw new Error('não deveria chamar');
  };
  setVoiceAuthTokenProvider(async () => null);
  await assert.rejects(
    () => requestVoiceAudio({ text: 'leitura', lang: 'pt' }),
    (error) => error instanceof VoiceClientError && error.code === 'login_required'
  );
  assert.equal(fetched, false);
});

test('envia JWT apenas ao nosso backend e aceita somente resposta de áudio', async () => {
  let request = null;
  setVoiceAuthTokenProvider(async () => 'jwt-de-teste');
  global.fetch = async (url, options) => {
    request = { url, options };
    return new Response(Uint8Array.from([0x49, 0x44, 0x33, 4]), {
      status: 200,
      headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': '4' },
    });
  };

  const result = await requestVoiceAudio({ text: 'minha leitura', lang: 'es' });
  assert.deepEqual([...result.bytes], [0x49, 0x44, 0x33, 4]);
  assert.equal(result.contentType, 'audio/mpeg');
  assert.equal(request.url, 'https://api.cosmicguide.cloud/api/voice/synthesize');
  assert.equal(request.options.headers.Authorization, 'Bearer jwt-de-teste');
  assert.deepEqual(JSON.parse(request.options.body), { text: 'minha leitura', lang: 'es' });
  assert.doesNotMatch(JSON.stringify(request), /ELEVENLABS|xi-api-key/i);
});

test('erros tipados do servidor chegam à UI sem fingir áudio', async () => {
  setVoiceAuthTokenProvider(async () => 'jwt-de-teste');
  global.fetch = async () => new Response(JSON.stringify({
    code: 'voice_quota_exhausted',
    retryAfter: 120,
  }), { status: 429, headers: { 'Content-Type': 'application/json' } });

  await assert.rejects(
    () => requestVoiceAudio({ text: 'leitura', lang: 'en' }),
    (error) => error instanceof VoiceClientError && error.code === 'voice_quota_exhausted' && error.status === 429
  );
});

test('cancelamento externo aborta e vira estado cancelado, não erro genérico', async () => {
  setVoiceAuthTokenProvider(async () => 'jwt-de-teste');
  global.fetch = (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => {
      const error = new Error('aborted');
      error.name = 'AbortError';
      reject(error);
    });
  });
  const controller = new AbortController();
  const request = requestVoiceAudio({ text: 'leitura', lang: 'pt', signal: controller.signal });
  controller.abort();
  await assert.rejects(
    () => request,
    (error) => error instanceof VoiceClientError && error.code === 'cancelled'
  );
});

test('cancelamento continua ativo enquanto o corpo MP3 está baixando', async () => {
  setVoiceAuthTokenProvider(async () => 'jwt-de-teste');
  global.fetch = async (_url, { signal }) => ({
    ok: true,
    status: 200,
    headers: new Headers({ 'Content-Type': 'audio/mpeg' }),
    arrayBuffer: () => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => {
        const error = new Error('body aborted');
        error.name = 'AbortError';
        reject(error);
      }, { once: true });
    }),
  });

  const controller = new AbortController();
  const request = requestVoiceAudio({ text: 'leitura longa', lang: 'pt', signal: controller.signal });
  await new Promise((resolve) => setTimeout(resolve, 0));
  controller.abort();
  await assert.rejects(
    () => request,
    (error) => error instanceof VoiceClientError && error.code === 'cancelled'
  );
});
