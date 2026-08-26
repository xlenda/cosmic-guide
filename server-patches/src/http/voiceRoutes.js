const express = require("express");
const { stripControlChars } = require("../infrastructure/textSanitize");
const { SUPPORTED_LANGUAGES } = require("../infrastructure/ElevenLabsVoiceProvider");
const { VoiceSynthesisError } = require("../application/VoiceSynthesisService");

function countCharacters(text) {
  return Array.from(text).length;
}

function normalizeVoiceRequest(body, maxCharacters) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: { status: 400, code: "voice_invalid_body" } };
  }
  // A voz é uma decisão do servidor. Aceitar um ID arbitrário do cliente
  // permitiria testar/consumir toda a biblioteca da conta ElevenLabs.
  if (body.voice !== undefined || body.voiceId !== undefined || body.voice_id !== undefined) {
    return { error: { status: 400, code: "voice_selection_server_only" } };
  }
  if (typeof body.text !== "string") {
    return { error: { status: 400, code: "voice_text_required" } };
  }
  if (!SUPPORTED_LANGUAGES.includes(body.lang)) {
    return { error: { status: 400, code: "voice_language_invalid" } };
  }

  let text = body.text.normalize("NFC");
  text = stripControlChars(text)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!text) return { error: { status: 400, code: "voice_text_required" } };
  const characters = countCharacters(text);
  if (characters > maxCharacters) {
    return {
      error: {
        status: 413,
        code: "voice_text_too_long",
        maxCharacters,
      },
    };
  }
  return { value: { text, lang: body.lang, characters } };
}

function secondsUntilUtcTomorrow(now = new Date()) {
  const tomorrow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(1, Math.ceil((tomorrow - now.getTime()) / 1000));
}

function errorPayload(code, extras = {}) {
  return { error: "voz neural indisponível", code, ...extras };
}

function buildVoiceRouter({
  service,
  requireAuth,
  requireVerifiedEmail,
  synthesisLimiter = (_req, _res, next) => next(),
  statusLimiter = (_req, _res, next) => next(),
} = {}) {
  if (!service || !requireAuth || !requireVerifiedEmail) {
    throw new Error("dependências da rota de voz ausentes");
  }
  const router = express.Router();

  router.get("/status", statusLimiter, (_req, res) => {
    res.set("Cache-Control", "no-store");
    res.json(service.status());
  });

  router.post(
    "/synthesize",
    synthesisLimiter,
    requireAuth,
    requireVerifiedEmail,
    async (req, res) => {
      const normalized = normalizeVoiceRequest(req.body, service.maxTextCharacters);
      if (normalized.error) {
        const { status, code, maxCharacters } = normalized.error;
        res.set("Cache-Control", "no-store");
        return res.status(status).json(errorPayload(code, maxCharacters ? { maxCharacters } : {}));
      }

      try {
        const result = await service.synthesize({
          userId: req.userId,
          text: normalized.value.text,
          lang: normalized.value.lang,
        });
        res.set({
          "Content-Type": "audio/mpeg",
          "Content-Length": String(result.audio.length),
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        });
        return res.status(200).send(result.audio);
      } catch (error) {
        res.set("Cache-Control", "no-store");
        if (error instanceof VoiceSynthesisError) {
          if (error.code === "voice_quota_exhausted" || error.code === "voice_global_quota_exhausted") {
            const retryAfter = secondsUntilUtcTomorrow();
            res.set("Retry-After", String(retryAfter));
            return res.status(429).json(errorPayload(error.code, { retryAfter }));
          }
          if (error.code === "voice_unavailable") {
            return res.status(503).json(errorPayload(error.code));
          }
          if (error.code === "voice_timeout") {
            return res.status(504).json(errorPayload(error.code));
          }
          return res.status(502).json(errorPayload("voice_provider_error"));
        }
        console.error("[api/voice] erro interno sem conteúdo do pedido");
        return res.status(500).json(errorPayload("voice_internal_error"));
      }
    }
  );

  return router;
}

module.exports = {
  buildVoiceRouter,
  normalizeVoiceRequest,
  countCharacters,
  secondsUntilUtcTomorrow,
};
