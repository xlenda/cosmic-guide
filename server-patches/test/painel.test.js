// O PAINEL DO DONO — o que não pode vazar e o que não pode quebrar.
//
// A casca (/painel) é pública DE PROPÓSITO e por isso o teste principal é
// negativo: nenhum número, nenhum e-mail, nenhum token embutido nela. Os
// dados moram em /api/admin/metrics atrás do X-Admin-Token — 503 sem
// configurar, 401 sem token, timing-safe com ele.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const TEST_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "forja-test-painel-"));
process.env.DATA_DIR = TEST_DATA_DIR;

const express = require("express");
const supertest = require("supertest");
const { buildPainelRouter, _paraTestes } = require("../src/http/painelRoutes");
const { db } = require("../src/infrastructure/db");

const TOKEN = "token-de-teste-bem-grande-1234567890";

function appCom(adminToken) {
  const app = express();
  app.use(buildPainelRouter({ adminToken }));
  return app;
}

test.after(() => {
  try {
    db.close();
  } catch {}
  try {
    fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  } catch {}
});

test("a casca é pública e VAZIA: sem número, sem e-mail, sem token", async () => {
  const res = await supertest(appCom(TOKEN)).get("/painel");
  assert.equal(res.status, 200);
  assert.match(res.headers["content-type"], /html/);
  assert.ok(res.text.includes("Painel do Cosmic Guide"));
  assert.ok(!res.text.includes(TOKEN), "o token nunca pode estar no HTML");
  assert.ok(!res.text.includes("@gmail"), "nenhum e-mail embutido");
  // E os robôs ficam de fora — painel de dono não é página de índice.
  assert.match(res.text, /noindex/);
});

test("métricas: 503 sem ADMIN_TOKEN configurado — a porta nem existe", async () => {
  const res = await supertest(appCom("")).get("/api/admin/metrics");
  assert.equal(res.status, 503);
});

test("métricas: 401 sem token e com token errado; 200 com o certo e os blocos esperados", async () => {
  const app = appCom(TOKEN);
  assert.equal((await supertest(app).get("/api/admin/metrics")).status, 401);
  assert.equal(
    (await supertest(app).get("/api/admin/metrics").set("X-Admin-Token", "errado")).status,
    401
  );

  const ok = await supertest(app).get("/api/admin/metrics").set("X-Admin-Token", TOKEN);
  assert.equal(ok.status, 200);
  for (const campo of ["hoje", "funil", "assinaturas", "ia", "push"]) {
    assert.ok(campo in ok.body, `resposta sem o bloco "${campo}"`);
  }
  // Banco recém-criado: funil vem como lista vazia, nunca como erro.
  assert.ok(Array.isArray(ok.body.funil));
});

test("um bloco quebrado NUNCA derruba o painel inteiro", async () => {
  // Derruba a tabela do funil de propósito: o bloco vira null, o resto vive.
  db.exec("DROP TABLE funnel_events");
  const ok = await supertest(appCom(TOKEN)).get("/api/admin/metrics").set("X-Admin-Token", TOKEN);
  assert.equal(ok.status, 200);
  assert.equal(ok.body.funil, null, "bloco quebrado vira null");
  assert.ok("assinaturas" in ok.body, "os outros blocos continuam");
});

test("e-mail sai sempre mascarado — reconhecível pro dono, inútil pra vazamento", () => {
  const { mascarar } = _paraTestes;
  assert.equal(mascarar("gustavo@gmail.com"), "g***o@gmail.com");
  assert.equal(mascarar("ab@x.com"), "a***@x.com");
  assert.equal(mascarar(null), "—");
  assert.equal(mascarar("sem-arroba"), "—");
  assert.ok(!mascarar("gustavo@gmail.com").includes("ustav"), "o miolo nunca aparece");
});
