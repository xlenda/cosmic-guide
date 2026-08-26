const DEFAULT_MODEL_ID = "eleven_multilingual_v2";
const DEFAULT_OUTPUT_FORMAT = "mp3_44100_128";
const DEFAULT_TIMEOUT_MS = 55_000;
const DEFAULT_MAX_AUDIO_BYTES = 12 * 1024 * 1024;
const SUPPORTED_LANGUAGES = Object.freeze(["pt", "es", "en"]);

// IDs públicos, não credenciais. Foram escolhidas somente vozes profissionais
// ou premade da própria biblioteca da conta — nunca os clones pessoais que
// também aparecem nela. Cada uma tem amostra e suporte ao multilingual_v2.
const DEFAULT_VOICE_IDS = Object.freeze({
  pt: "UZ8QqWVrz7tMdxiglcLh", // Livia — brasileira, calorosa e narrativa
  es: "MA970ZNagubdplnfHEiJ", // Melodie — calma, verificada também em espanhol
  en: "pFZP5JQG7iQjIQuC4Bku", // Lily — narrativa aveludada em inglês
});

const SAFE_ID = /^[A-Za-z0-9_-]{8,80}$/;
const SAFE_MODEL_ID = /^[A-Za-z0-9._-]{3,80}$/;

function boundedInteger(value, fallback, { min, max }) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

async function readAudioResponse(response, maxAudioBytes) {
  if (response.body && typeof response.body.getReader === "function") {
    const reader = response.body.getReader();
    const chunks = [];
    let total = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = Buffer.from(value || []);
        total += chunk.length;
        if (total > maxAudioBytes) {
          await reader.cancel().catch(() => {});
          throw new VoiceProviderError("voice_provider_audio_too_large", { requestStarted: true });
        }
        chunks.push(chunk);
      }
    } finally {
      try { reader.releaseLock(); } catch {}
    }
    return Buffer.concat(chunks, total);
  }
  return Buffer.from(await response.arrayBuffer());
}

function looksLikeMp3(audio) {
  if (!Buffer.isBuffer(audio) || audio.length < 3) return false;
  if (audio[0] === 0x49 && audio[1] === 0x44 && audio[2] === 0x33) return true; // ID3
  return audio[0] === 0xff && (audio[1] & 0xe0) === 0xe0; // MPEG frame sync
}

class VoiceProviderError extends Error {
  constructor(code, { providerStatus = null, requestStarted = false } = {}) {
    super(code);
    this.name = "VoiceProviderError";
    this.code = code;
    this.providerStatus = providerStatus;
    this.requestStarted = requestStarted;
  }
}

/**
 * Adaptador mínimo da ElevenLabs. A chave e os IDs de voz só são lidos do
 * ambiente do backend; nenhum deles entra em resposta, log ou código cliente.
 */
class ElevenLabsVoiceProvider {
  constructor({
    apiKey = process.env.ELEVENLABS_API_KEY,
    defaultVoiceId = process.env.ELEVENLABS_VOICE_ID,
    voiceIds = {
      pt: process.env.ELEVENLABS_VOICE_ID_PT || DEFAULT_VOICE_IDS.pt,
      es: process.env.ELEVENLABS_VOICE_ID_ES || DEFAULT_VOICE_IDS.es,
      en: process.env.ELEVENLABS_VOICE_ID_EN || DEFAULT_VOICE_IDS.en,
    },
    modelId = process.env.ELEVENLABS_MODEL_ID || DEFAULT_MODEL_ID,
    timeoutMs = process.env.ELEVENLABS_TIMEOUT_MS,
    maxAudioBytes = process.env.ELEVENLABS_MAX_AUDIO_BYTES,
    fetchFn = globalThis.fetch,
  } = {}) {
    this.apiKey = typeof apiKey === "string" ? apiKey.trim() : "";
    this.defaultVoiceId = this.#validId(defaultVoiceId);
    this.voiceIds = Object.fromEntries(
      SUPPORTED_LANGUAGES.map((lang) => [lang, this.#validId(voiceIds && voiceIds[lang])])
    );
    this.modelId = SAFE_MODEL_ID.test(String(modelId || "")) ? String(modelId) : null;
    this.timeoutMs = boundedInteger(timeoutMs, DEFAULT_TIMEOUT_MS, { min: 5_000, max: 60_000 });
    this.maxAudioBytes = boundedInteger(maxAudioBytes, DEFAULT_MAX_AUDIO_BYTES, {
      min: 64 * 1024,
      max: 20 * 1024 * 1024,
    });
    this.fetchFn = fetchFn;
  }

  #validId(value) {
    const id = typeof value === "string" ? value.trim() : "";
    return SAFE_ID.test(id) ? id : null;
  }

  voiceIdFor(lang) {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return null;
    return this.voiceIds[lang] || this.defaultVoiceId || null;
  }

  availableLanguages() {
    if (!this.apiKey || !this.modelId || typeof this.fetchFn !== "function") return [];
    return SUPPORTED_LANGUAGES.filter((lang) => Boolean(this.voiceIdFor(lang)));
  }

  isConfigured(lang) {
    return this.availableLanguages().includes(lang);
  }

  cacheIdentity(lang) {
    const voiceId = this.voiceIdFor(lang);
    return voiceId && this.modelId
      ? `elevenlabs-v1|${voiceId}|${this.modelId}|${DEFAULT_OUTPUT_FORMAT}`
      : null;
  }

  async synthesize({ text, lang }) {
    const voiceId = this.voiceIdFor(lang);
    if (!this.apiKey || !voiceId || !this.modelId || typeof this.fetchFn !== "function") {
      throw new VoiceProviderError("voice_unconfigured");
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    let response;
    try {
      const url =
        `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}` +
        `?output_format=${DEFAULT_OUTPUT_FORMAT}`;
      response = await this.fetchFn(url, {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: this.modelId,
          apply_text_normalization: "auto",
        }),
        signal: controller.signal,
      });
      if (!response || !response.ok) {
        throw new VoiceProviderError("voice_provider_rejected", {
          providerStatus: response ? response.status : null,
          requestStarted: true,
        });
      }

      const contentType = String(response.headers && response.headers.get("content-type") || "")
        .split(";", 1)[0]
        .trim()
        .toLowerCase();
      if (contentType && !contentType.startsWith("audio/") && contentType !== "application/octet-stream") {
        throw new VoiceProviderError("voice_provider_invalid_audio", { requestStarted: true });
      }

      const declaredLength = Number.parseInt(
        String(response.headers && response.headers.get("content-length") || ""),
        10
      );
      if (Number.isFinite(declaredLength) && declaredLength > this.maxAudioBytes) {
        throw new VoiceProviderError("voice_provider_audio_too_large", { requestStarted: true });
      }

      // O teto é aplicado durante o streaming, não apenas depois de alocar
      // todo o corpo. O mesmo timeout cobre cabeçalhos E download do MP3.
      const audio = await readAudioResponse(response, this.maxAudioBytes);
      if (!audio.length || audio.length > this.maxAudioBytes) {
        throw new VoiceProviderError(
          audio.length ? "voice_provider_audio_too_large" : "voice_provider_empty_audio",
          { requestStarted: true }
        );
      }
      if (!looksLikeMp3(audio)) {
        throw new VoiceProviderError("voice_provider_invalid_audio", { requestStarted: true });
      }
      return audio;
    } catch (error) {
      if (error instanceof VoiceProviderError) throw error;
      if (controller.signal.aborted || (error && error.name === "AbortError")) {
        throw new VoiceProviderError("voice_provider_timeout", { requestStarted: true });
      }
      throw new VoiceProviderError("voice_provider_unreachable", { requestStarted: true });
    } finally {
      clearTimeout(timer);
    }
  }
}

module.exports = {
  ElevenLabsVoiceProvider,
  VoiceProviderError,
  SUPPORTED_LANGUAGES,
  DEFAULT_MODEL_ID,
  DEFAULT_OUTPUT_FORMAT,
  DEFAULT_VOICE_IDS,
  readAudioResponse,
  looksLikeMp3,
};
