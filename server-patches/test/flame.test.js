// Teste HTTP da Chama do Casal contra o SQLite real (DATA_DIR isolado num
// diretório temporário, mesmo padrão de checkoutWebhook.http.test.js) — a
// migração 008 roda de verdade no require de db.js, então um erro de SQL real
// (coluna errada, bind de tipo errado) aparece aqui, não em produção.
//
// As rotas entram em server.js só na integração (bloco único colado pelo
// orquestrador) — este teste monta o MESMO bloco num app Express isolado pra
// provar o contrato HTTP antes da integração. Se o bloco divergir depois em
// server.js, os testes HTTP de lá é que pegam; aqui o objetivo é validar
// repositório + validações + regra do dia decidido pelo servidor.
//
// DATA_DIR precisa ser setado ANTES de qualquer require que puxe
// src/infrastructure/db.js — senão db.js já teria aberto o arquivo de produção.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const TEST_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "forja-test-flame-"));
process.env.DATA_DIR = TEST_DATA_DIR;

const test = require("node:test");
const assert = require("node:assert/strict");
const supertest = require("supertest");
const express = require("express");
const rateLimit = require("express-rate-limit");

const { db } = require("../src/infrastructure/db");
const { FlameRepository, todayUtc, addDaysUtc } = require("../src/infrastructure/FlameRepository");

const flameRepository = new FlameRepository();

// ── Bloco de rotas idêntico ao que vai pra server.js na integração ──────────
const COUPLE_KEY_RE = /^[a-f0-9]{64}$/;
const DEVICE_ID_RE = /^[a-f0-9-]{8,64}$/i;

const app = express();
app.use(express.json());

const flameLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições — tente novamente em alguns minutos." },
});

app.post("/api/flame/checkin", flameLimiter, (req, res) => {
  try {
    const { coupleKey, deviceId } = req.body || {};
    if (typeof coupleKey !== "string" || !COUPLE_KEY_RE.test(coupleKey)) {
      return res.status(400).json({ error: "coupleKey deve ser um SHA-256 em hex minúsculo (64 caracteres)" });
    }
    if (typeof deviceId !== "string" || !DEVICE_ID_RE.test(deviceId)) {
      return res.status(400).json({ error: "deviceId inválido" });
    }
    // O `day` do body é ignorado de propósito — o servidor decide o dia.
    flameRepository.checkin({ coupleKey, day: todayUtc(), deviceId });
    res.json(flameRepository.status(coupleKey));
  } catch (err) {
    console.error("[api/flame/checkin] erro:", err.message);
    res.status(500).json({ error: "falha ao registrar presença" });
  }
});

app.get("/api/flame/:coupleKey", flameLimiter, (req, res) => {
  try {
    const { coupleKey } = req.params;
    if (!COUPLE_KEY_RE.test(coupleKey)) {
      return res.status(400).json({ error: "coupleKey deve ser um SHA-256 em hex minúsculo (64 caracteres)" });
    }
    res.json(flameRepository.status(coupleKey));
  } catch (err) {
    console.error("[api/flame/status] erro:", err.message);
    res.status(500).json({ error: "falha ao consultar a chama" });
  }
});
// ── fim do bloco ────────────────────────────────────────────────────────────

// Chave sintética válida por teste (64 hex) — cada teste usa a sua pra nunca
// depender de ordem de execução.
function fakeCoupleKey(seed) {
  return String(seed).repeat(64).slice(0, 64);
}
const DEVICE_A = "11111111-1111-4111-8111-111111111111";
const DEVICE_B = "22222222-2222-4222-8222-222222222222";

test.after(() => {
  // Fecha o banco antes de apagar — no Windows, o arquivo aberto pelo
  // better-sqlite3 dá EPERM no rmSync (mesmo problema pré-existente dos
  // outros testes HTTP). O catch é só pro lixo temporário nunca falhar suíte.
  try {
    db.close();
  } catch {}
  try {
    fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  } catch {}
});

test("1 aparelho só não acende a chama do dia (nem repetindo o check-in)", async () => {
  const coupleKey = fakeCoupleKey("a");

  const first = await supertest(app).post("/api/flame/checkin").send({ coupleKey, deviceId: DEVICE_A });
  assert.equal(first.status, 200);
  assert.deepEqual(first.body, { todayDevices: 1, litToday: false, streak: 0 });

  // Reabrir o app no mesmo dia (mesmo deviceId) é idempotente — nunca conta 2.
  const again = await supertest(app).post("/api/flame/checkin").send({ coupleKey, deviceId: DEVICE_A });
  assert.equal(again.status, 200);
  assert.deepEqual(again.body, { todayDevices: 1, litToday: false, streak: 0 });
});

test("2 aparelhos distintos no mesmo dia acendem a chama (streak 1)", async () => {
  const coupleKey = fakeCoupleKey("b");

  await supertest(app).post("/api/flame/checkin").send({ coupleKey, deviceId: DEVICE_A });
  const second = await supertest(app).post("/api/flame/checkin").send({ coupleKey, deviceId: DEVICE_B });
  assert.deepEqual(second.body, { todayDevices: 2, litToday: true, streak: 1 });

  const status = await supertest(app).get(`/api/flame/${coupleKey}`);
  assert.equal(status.status, 200);
  assert.deepEqual(status.body, { todayDevices: 2, litToday: true, streak: 1 });
});

test("chama acesa ontem e hoje = streak de 2 dias", async () => {
  const coupleKey = fakeCoupleKey("c");
  const yesterday = addDaysUtc(todayUtc(), -1);

  // Semeia ontem direto no repositório — só a rota é obrigada a usar o dia do
  // servidor; o repositório aceita o dia como parâmetro justamente pra
  // cenários assim (e pros crons futuros).
  flameRepository.checkin({ coupleKey, day: yesterday, deviceId: DEVICE_A });
  flameRepository.checkin({ coupleKey, day: yesterday, deviceId: DEVICE_B });

  // Antes de o segundo aparelho abrir hoje: a chama de hoje ainda não acendeu,
  // mas a sequência que termina ontem NÃO se perde antes de o dia acabar.
  const partial = await supertest(app).post("/api/flame/checkin").send({ coupleKey, deviceId: DEVICE_A });
  assert.deepEqual(partial.body, { todayDevices: 1, litToday: false, streak: 1 });

  const full = await supertest(app).post("/api/flame/checkin").send({ coupleKey, deviceId: DEVICE_B });
  assert.deepEqual(full.body, { todayDevices: 2, litToday: true, streak: 2 });
});

test("day mandado pelo client é ignorado — não dá pra fabricar streak retroativo", async () => {
  const coupleKey = fakeCoupleKey("d");
  const fakePastDay = "2020-01-01";

  // Client alterado tenta registrar check-ins no passado.
  await supertest(app).post("/api/flame/checkin").send({ coupleKey, deviceId: DEVICE_A, day: fakePastDay });
  await supertest(app).post("/api/flame/checkin").send({ coupleKey, deviceId: DEVICE_B, day: fakePastDay });

  // Nada foi parar no dia falso — tudo caiu no UTC de hoje do servidor.
  assert.equal(flameRepository.countDevices(coupleKey, fakePastDay), 0);
  assert.equal(flameRepository.countDevices(coupleKey, todayUtc()), 2);

  const status = await supertest(app).get(`/api/flame/${coupleKey}`);
  assert.deepEqual(status.body, { todayDevices: 2, litToday: true, streak: 1 });
});

test("mesmo aparelho em caixa diferente não conta como dois", async () => {
  const coupleKey = fakeCoupleKey("e");

  await supertest(app).post("/api/flame/checkin").send({ coupleKey, deviceId: DEVICE_A });
  const res = await supertest(app).post("/api/flame/checkin").send({ coupleKey, deviceId: DEVICE_A.toUpperCase() });
  assert.deepEqual(res.body, { todayDevices: 1, litToday: false, streak: 0 });
});

test("coupleKey ou deviceId fora do formato respondem 400", async () => {
  const bad1 = await supertest(app).post("/api/flame/checkin").send({ coupleKey: "não-é-hash", deviceId: DEVICE_A });
  assert.equal(bad1.status, 400);

  // 64 chars mas com maiúscula — o client normaliza pra minúsculo antes de
  // hashear, então maiúscula aqui é sempre chamada malformada.
  const bad2 = await supertest(app)
    .post("/api/flame/checkin")
    .send({ coupleKey: "A".repeat(64), deviceId: DEVICE_A });
  assert.equal(bad2.status, 400);

  const bad3 = await supertest(app)
    .post("/api/flame/checkin")
    .send({ coupleKey: fakeCoupleKey("f"), deviceId: "curto" });
  assert.equal(bad3.status, 400);

  const bad4 = await supertest(app).get("/api/flame/nao-e-hash");
  assert.equal(bad4.status, 400);
});

test("casal que nunca fez check-in responde zeros honestos (não 404)", async () => {
  const status = await supertest(app).get(`/api/flame/${fakeCoupleKey("0")}`);
  assert.equal(status.status, 200);
  assert.deepEqual(status.body, { todayDevices: 0, litToday: false, streak: 0 });
});
