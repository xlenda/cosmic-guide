"use strict";

const express = require("express");
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

function memoryKey(req) {
  return req.userId ? `memory:${req.userId}` : ipKeyGenerator(req.ip);
}

function privateResponse(res) {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, private",
    Pragma: "no-cache",
    Expires: "0",
    Vary: "Authorization",
  });
}

function buildMemoryRouter({ repository, requireAuth, requireVerifiedEmail } = {}) {
  if (!repository) throw new TypeError("repository é obrigatório");
  if (typeof requireAuth !== "function") throw new TypeError("requireAuth é obrigatório");
  if (typeof requireVerifiedEmail !== "function") throw new TypeError("requireVerifiedEmail é obrigatório");
  const router = express.Router();
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: memoryKey,
    message: { error: "Muitas solicitações — tente novamente em alguns minutos.", code: "memory_rate_limited" },
  });
  const auth = [requireAuth, requireVerifiedEmail, limiter];

  router.get("/", ...auth, (req, res) => {
    privateResponse(res);
    res.json({ ...repository.preference(req.userId), memories: repository.list({ userId: req.userId }) });
  });

  router.put("/consent", ...auth, (req, res) => {
    if (!req.body || typeof req.body.enabled !== "boolean") {
      return res.status(400).json({ error: "enabled deve ser boolean", code: "memory_invalid_consent" });
    }
    privateResponse(res);
    res.json(repository.setConsent({ userId: req.userId, enabled: req.body.enabled }));
  });

  router.delete("/", ...auth, (req, res) => {
    privateResponse(res);
    res.json({ ok: true, deleted: repository.deleteMemories({ userId: req.userId }) });
  });

  router.delete("/:id", ...auth, (req, res) => {
    const memoryId = Number(req.params.id);
    if (!Number.isInteger(memoryId) || memoryId <= 0) {
      return res.status(400).json({ error: "memória inválida", code: "memory_invalid_id" });
    }
    const deleted = repository.deleteOne({ userId: req.userId, memoryId });
    if (!deleted) return res.status(404).json({ error: "memória não encontrada", code: "memory_not_found" });
    privateResponse(res);
    res.json({ ok: true });
  });

  return router;
}

module.exports = { buildMemoryRouter, privateResponse };
