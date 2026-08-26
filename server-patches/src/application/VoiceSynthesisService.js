const { VoiceAudioCache } = require("../infrastructure/VoiceAudioCache");
const { VoiceProviderError } = require("../infrastructure/ElevenLabsVoiceProvider");

// Limite do modelo eleven_multilingual_v2. O app envia a leitura inteira; 4k
// cortava respostas que o próprio contrato da Anthropic permite gerar.
const DEFAULT_MAX_TEXT_CHARACTERS = 10_000;

class VoiceSynthesisError extends Error {
  constructor(code, { retryable = false } = {}) {
    super(code);
    this.name = "VoiceSynthesisError";
    this.code = code;
    this.retryable = retryable;
  }
}

class VoiceSynthesisService {
  constructor({ provider, cache, quota, maxTextCharacters = process.env.VOICE_MAX_TEXT_CHARACTERS } = {}) {
    if (!provider || !cache || !quota) throw new Error("dependências de voz ausentes");
    this.provider = provider;
    this.cache = cache;
    this.quota = quota;
    const parsedMax = Number.parseInt(String(maxTextCharacters ?? ""), 10);
    this.maxTextCharacters =
      Number.isFinite(parsedMax) && parsedMax >= 200 && parsedMax <= 10_000
        ? parsedMax
        : DEFAULT_MAX_TEXT_CHARACTERS;
    this.inflight = new Map();
  }

  status() {
    const languages = this.provider.availableLanguages();
    return {
      available: languages.length > 0,
      languages,
      maxCharacters: this.maxTextCharacters,
      requiresLogin: true,
      requiresVerifiedEmail: true,
    };
  }

  async synthesize({ userId, text, lang }) {
    if (!this.provider.isConfigured(lang)) {
      throw new VoiceSynthesisError("voice_unavailable", { retryable: true });
    }

    const identity = this.provider.cacheIdentity(lang);
    const key = VoiceAudioCache.keyFor({ text, lang, identity });
    const cached = await this.cache.get(key);
    if (cached) return { audio: cached, source: "cache" };

    // Duas pessoas pedindo exatamente a mesma leitura ao mesmo tempo geram um
    // único áudio. O texto nunca vira chave do Map nem nome de arquivo: só o
    // hash acima circula fora da chamada ao provedor.
    if (this.inflight.has(key)) return this.inflight.get(key);

    const job = this.#generate({ userId, text, lang, key });
    this.inflight.set(key, job);
    try {
      return await job;
    } finally {
      this.inflight.delete(key);
    }
  }

  async #generate({ userId, text, lang, key }) {
    const characters = Array.from(text).length;
    const reservation = this.quota.reserve({ userId, characters });
    if (!reservation.allowed) {
      throw new VoiceSynthesisError(
        reservation.reason === "global" ? "voice_global_quota_exhausted" : "voice_quota_exhausted"
      );
    }

    let audio;
    try {
      audio = await this.provider.synthesize({ text, lang });
    } catch (error) {
      if (error instanceof VoiceProviderError) {
        if (error.code === "voice_unconfigured") {
          throw new VoiceSynthesisError("voice_unavailable", { retryable: true });
        }
        if (error.code === "voice_provider_timeout") {
          throw new VoiceSynthesisError("voice_timeout", { retryable: true });
        }
        throw new VoiceSynthesisError("voice_provider_error", { retryable: true });
      }
      throw new VoiceSynthesisError("voice_provider_error", { retryable: true });
    }

    // A reserva não é estornada depois que a chamada externa começou: num
    // timeout o provedor pode ter gerado/cobrado o áudio mesmo sem a resposta
    // chegar. Estornar abriria um loop barato de repetição e custo real.
    try {
      await this.cache.set(key, audio);
    } catch {
      // Cache é otimização e proteção de custo futuro, não condição para a
      // pessoa ouvir o áudio que já foi pago e recebido nesta chamada.
      console.error("[voice] áudio gerado, mas não foi possível gravar o cache");
    }
    return { audio, source: "provider" };
  }
}

module.exports = {
  VoiceSynthesisService,
  VoiceSynthesisError,
  DEFAULT_MAX_TEXT_CHARACTERS,
};
