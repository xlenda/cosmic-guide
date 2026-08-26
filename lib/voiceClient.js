const API_BASE = 'https://api.cosmicguide.cloud';
const STATUS_TTL_MS = 5 * 60 * 1000;
// O multilingual_v2 aceita leituras longas. O timeout cobre cabeçalhos E o
// download do MP3; encerrar o relógio nos cabeçalhos deixava Cancelar sem
// efeito se o corpo travasse no meio.
const REQUEST_TIMEOUT_MS = 65_000;
const STATUS_TIMEOUT_MS = 6_000;
const MAX_CLIENT_AUDIO_BYTES = 12 * 1024 * 1024;
const LANGUAGES = Object.freeze(['pt', 'es', 'en']);

let authTokenProvider = null;
let statusCache = null;

export class VoiceClientError extends Error {
  constructor(code, { status = null, maxCharacters = null } = {}) {
    super(code);
    this.name = 'VoiceClientError';
    this.code = code;
    this.status = status;
    this.maxCharacters = maxCharacters;
  }
}

export function setVoiceAuthTokenProvider(provider) {
  authTokenProvider = typeof provider === 'function' ? provider : null;
}

function abortError(externalSignal, timedOut) {
  if (externalSignal && externalSignal.aborted) return new VoiceClientError('cancelled');
  return new VoiceClientError(timedOut ? 'voice_timeout' : 'cancelled');
}

async function fetchTimed(
  url,
  options = {},
  { timeoutMs, signal: externalSignal } = {},
  consume = async (response) => response
) {
  const controller = new AbortController();
  let timedOut = false;
  const abortFromOutside = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) throw new VoiceClientError('cancelled');
    externalSignal.addEventListener('abort', abortFromOutside, { once: true });
  }
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return await consume(response);
  } catch (error) {
    if (error instanceof VoiceClientError) throw error;
    if (controller.signal.aborted || (error && error.name === 'AbortError')) {
      throw abortError(externalSignal, timedOut);
    }
    throw new VoiceClientError('network_error');
  } finally {
    clearTimeout(timer);
    if (externalSignal) externalSignal.removeEventListener('abort', abortFromOutside);
  }
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function normalizeStatus(data) {
  const languages = Array.isArray(data && data.languages)
    ? data.languages.filter((lang) => LANGUAGES.includes(lang))
    : [];
  const maxCharacters = Number.isInteger(data && data.maxCharacters)
    ? Math.max(200, Math.min(10_000, data.maxCharacters))
    : 10_000;
  return {
    available: Boolean(data && data.available) && languages.length > 0,
    languages,
    maxCharacters,
    requiresLogin: true,
    requiresVerifiedEmail: true,
  };
}

export async function fetchVoiceStatus({ force = false, signal } = {}) {
  const now = Date.now();
  if (!force && statusCache && now - statusCache.at < STATUS_TTL_MS) return statusCache.value;
  try {
    const value = await fetchTimed(
      `${API_BASE}/api/voice/status`,
      {},
      { timeoutMs: STATUS_TIMEOUT_MS, signal },
      async (response) => {
        if (!response.ok) return normalizeStatus(null);
        return normalizeStatus(await safeJson(response));
      }
    );
    statusCache = { at: now, value };
    return value;
  } catch (error) {
    if (error instanceof VoiceClientError && error.code === 'cancelled') throw error;
    return normalizeStatus(null);
  }
}

export async function requestVoiceAudio({ text, lang, signal }) {
  if (typeof text !== 'string' || !text.trim()) throw new VoiceClientError('voice_text_required');
  if (!LANGUAGES.includes(lang)) throw new VoiceClientError('voice_language_invalid');

  let token = null;
  try {
    token = authTokenProvider ? await authTokenProvider() : null;
  } catch {}
  if (!token) throw new VoiceClientError('login_required', { status: 401 });

  return fetchTimed(
    `${API_BASE}/api/voice/synthesize`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({ text, lang }),
    },
    { timeoutMs: REQUEST_TIMEOUT_MS, signal },
    async (response) => {
      if (!response.ok) {
        const data = await safeJson(response);
        let code = data && typeof data.code === 'string' ? data.code : null;
        if (response.status === 401 && code !== 'voice_quota_exhausted') code = 'login_required';
        if (!code && response.status === 403) code = 'email_unverified';
        if (!code && response.status === 429) code = 'voice_rate_limited';
        throw new VoiceClientError(code || 'voice_unavailable', {
          status: response.status,
          maxCharacters: data && Number.isInteger(data.maxCharacters) ? data.maxCharacters : null,
        });
      }

      const contentType = String(response.headers.get('content-type') || '').split(';', 1)[0].toLowerCase();
      if (contentType !== 'audio/mpeg' && contentType !== 'audio/mp3') {
        throw new VoiceClientError('voice_invalid_audio');
      }
      const declaredLength = Number.parseInt(response.headers.get('content-length') || '', 10);
      if (Number.isFinite(declaredLength) && declaredLength > MAX_CLIENT_AUDIO_BYTES) {
        throw new VoiceClientError('voice_invalid_audio');
      }
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (!bytes.length || bytes.byteLength > MAX_CLIENT_AUDIO_BYTES) {
        throw new VoiceClientError('voice_invalid_audio');
      }
      const hasId3 = bytes.length >= 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33;
      const hasFrameSync = bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0;
      if (!hasId3 && !hasFrameSync) throw new VoiceClientError('voice_invalid_audio');
      return { bytes, contentType };
    }
  );
}

export function __resetVoiceClientForTests() {
  statusCache = null;
  authTokenProvider = null;
}
