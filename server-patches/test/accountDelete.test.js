// DELETE /api/subscription/account — a metade "backend próprio" da exclusão de
// conta exigida pelo Google Play.
//
// O que estes testes travam é a REGRA, não o SQL: o alvo do apagamento tem que
// sair SEMPRE do token verificado (nunca do corpo do pedido), e a rota nunca
// pode responder "ok" quando não apagou nada — foi exatamente essa mentira
// (clearAll local dizendo "conta apagada") que motivou toda a mudança.
//
// Repositório de verdade não entra aqui de propósito: o better-sqlite3 não
// compila na máquina do Lenda (Windows + Node 24 sem toolchain), então o SQL só
// roda no servidor. Mesmo padrão de test/accountSubscription.test.js.
//
// Como rodar:
//   no backend (deps já instaladas):  npm test
//   na máquina local:                 NODE_PATH=<node_modules com express+supertest> \
//                                     node --test server-patches/test/
const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const supertest = require("supertest");

const { buildAccountRouter } = require("../src/http/accountRoutes");
const { requireVerifiedEmail } = require("../src/http/accountAuth");

// Mesmo fake de test/accountSubscription.test.js: "Bearer user:<id>:<email>".
function fakeAuth(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer user:")) return res.status(401).json({ error: "token de autenticação ausente" });
  const [userId, email, verified] = header.slice("Bearer user:".length).split(":");
  req.userId = userId;
  req.userEmail = email || null;
  req.authPayload = { sub: userId, email, user_metadata: { email_verified: verified !== "unverified" } };
  next();
}

function authHeader(userId, email, verified = true) {
  return { Authorization: `Bearer user:${userId}:${email}${verified ? "" : ":unverified"}` };
}

function buildApp(deleteAccountData) {
  const app = express();
  app.use(express.json());
  app.use(
    "/api/subscription",
    buildAccountRouter({ requireAuth: fakeAuth, requireVerifiedEmail, deleteAccountData })
  );
  return app;
}

test("sem token: não apaga nada e responde 401", async () => {
  let chamou = false;
  const res = await supertest(buildApp(() => { chamou = true; })).delete("/api/subscription/account");
  assert.equal(res.status, 401);
  assert.equal(chamou, false);
});

test("e-mail não confirmado: não apaga nada e responde 403", async () => {
  let chamou = false;
  const res = await supertest(buildApp(() => { chamou = true; }))
    .delete("/api/subscription/account")
    .set(authHeader("user-x", "x@gmail.com", false));
  assert.equal(res.status, 403);
  assert.equal(chamou, false);
});

test("o alvo vem do TOKEN, nunca do corpo do pedido", async () => {
  const alvos = [];
  const res = await supertest(buildApp(({ userId }) => {
    alvos.push(userId);
    return { unlinkedSubscriptions: 1, clearedAiQuota: 3 };
  }))
    .delete("/api/subscription/account")
    .set(authHeader("user-dono", "dono@gmail.com"))
    // A tentativa de apagar a conta de outra pessoa: ignorada por completo.
    .send({ userId: "user-vitima", email: "vitima@gmail.com" });

  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
  assert.deepEqual(alvos, ["user-dono"]);
  assert.equal(res.body.unlinkedSubscriptions, 1);
  assert.equal(res.body.clearedAiQuota, 3);
});

test("falha no apagamento vira 500 — a rota nunca diz que apagou sem ter apagado", async () => {
  const res = await supertest(buildApp(() => {
    throw new Error("banco fora do ar");
  }))
    .delete("/api/subscription/account")
    .set(authHeader("user-dono", "dono@gmail.com"));

  assert.equal(res.status, 500);
  assert.equal(res.body.ok, undefined);
});

test("dependência não injetada (deploy pela metade) responde 500, não 200", async () => {
  const res = await supertest(buildApp(undefined))
    .delete("/api/subscription/account")
    .set(authHeader("user-dono", "dono@gmail.com"));

  assert.equal(res.status, 500);
  assert.equal(res.body.ok, undefined);
});
