"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const supertest = require("supertest");
const { buildMemoryRouter } = require("../src/http/memoryRoutes");

function auth(req, res, next) {
  const id = String(req.headers.authorization || "").replace(/^Bearer user:/, "");
  if (!id || id === req.headers.authorization) return res.status(401).json({ code: "unauthorized" });
  req.userId = id;
  req.userEmail = `${id}@example.com`;
  next();
}

function verified(_req, _res, next) { next(); }

function makeApp(repository) {
  const app = express();
  app.use(express.json());
  app.use("/api/memory", buildMemoryRouter({ repository, requireAuth: auth, requireVerifiedEmail: verified }));
  return app;
}

test("router exige autenticação e verificação na construção", () => {
  const repository = {};
  assert.throws(() => buildMemoryRouter({ repository }), /requireAuth/);
  assert.throws(() => buildMemoryRouter({ repository, requireAuth: auth }), /requireVerifiedEmail/);
});

test("GET é privado, sem cache e usa exclusivamente o id autenticado", async () => {
  let requestedUser = null;
  const app = makeApp({
    preference: (userId) => ({ enabled: userId === "ana" }),
    list: ({ userId }) => { requestedUser = userId; return []; },
  });
  await supertest(app).get("/api/memory").expect(401);
  const response = await supertest(app).get("/api/memory?userId=outra").set("Authorization", "Bearer user:ana").expect(200);
  assert.equal(requestedUser, "ana");
  assert.equal(response.body.enabled, true);
  assert.match(response.headers["cache-control"], /no-store/);
  assert.equal(response.headers.vary, "Authorization");
});

test("consentimento aceita somente boolean e exclusão respeita dono/404", async () => {
  let consent = null;
  const app = makeApp({
    setConsent: (payload) => { consent = payload; return { enabled: payload.enabled }; },
    deleteMemories: ({ userId }) => userId === "ana" ? 2 : 0,
    deleteOne: ({ userId, memoryId }) => userId === "ana" && memoryId === 7 ? 1 : 0,
  });
  await supertest(app).put("/api/memory/consent").set("Authorization", "Bearer user:ana").send({ enabled: "true" }).expect(400);
  await supertest(app).put("/api/memory/consent").set("Authorization", "Bearer user:ana").send({ enabled: true, userId: "outra" }).expect(200);
  assert.equal(consent.userId, "ana");
  await supertest(app).delete("/api/memory/inválida").set("Authorization", "Bearer user:ana").expect(400);
  await supertest(app).delete("/api/memory/8").set("Authorization", "Bearer user:ana").expect(404);
  await supertest(app).delete("/api/memory/7").set("Authorization", "Bearer user:ana").expect(200);
  const all = await supertest(app).delete("/api/memory").set("Authorization", "Bearer user:ana").expect(200);
  assert.equal(all.body.deleted, 2);
});
