// Testes do acesso pago resolvido pela CONTA (GET /api/subscription/me e
// POST /api/subscription/claim) — o conserto do bug que prendia a assinatura ao
// APARELHO: limpar o navegador, trocar de celular ou clicar "Assinar" de novo
// fazia o cliente pagante cair no paywall (caso real do Carlos, 26/07/2026).
//
// O router é montado com um repositório FAKE em memória de propósito: o SQL de
// verdade só roda no servidor (better-sqlite3 não compila na máquina do Lenda,
// Windows + Node 24 sem toolchain), e o que precisa ser travado aqui é a REGRA
// — quem enxerga o quê. O fake espelha exatamente a semântica das consultas de
// SubscriptionRepository (LOWER(TRIM(email)) dos dois lados, string vazia
// ignorada, vínculo só em linha sem dono).
//
// Como rodar:
//   no backend (deps já instaladas):  npm test
//   na máquina local:                 NODE_PATH=<node_modules com express+supertest+jose> \
//                                     node --test server-patches/test/
const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const supertest = require("supertest");

const { buildAccountRouter } = require("../src/http/accountRoutes");
const { GetAccountSubscriptionUseCase } = require("../src/application/GetAccountSubscriptionUseCase");
const { ClaimSubscriptionUseCase } = require("../src/application/ClaimSubscriptionUseCase");
const { requireAuth, requireVerifiedEmail, isEmailVerified } = require("../src/http/accountAuth");

const CODE_ATIVA = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1";
const CODE_OUTRO_DONO = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb2";
const CODE_ORFA_PAYPAL = "ccccccccccccccccccccccccccccccc3";
const CODE_ORFA_MESMO_EMAIL = "ddddddddddddddddddddddddddddddd4";

// Espelha Subscription.hasAccess() do domínio: past_due ainda tem acesso (é a
// janela de dunning antes de expirar de vez).
function makeSubscription(row) {
  return {
    correlationCode: row.correlationCode,
    coupleName: row.coupleName || null,
    status: row.status,
    plan: row.plan || "trial",
    scope: row.scope || "solo",
    provider: "hotmart",
    providerSubscriptionId: row.providerSubscriptionId || null,
    currentPeriodEnd: row.currentPeriodEnd || null,
    customerEmail: row.customerEmail || null,
    supabaseUserId: row.supabaseUserId || null,
    accountEmail: row.accountEmail || null,
    linkedBy: row.linkedBy || null,
    linkedAt: row.linkedAt || null,
    createdAt: row.createdAt || "2026-07-26T17:00:00.000Z",
    updatedAt: row.updatedAt || row.createdAt || "2026-07-26T17:00:00.000Z",
    hasAccess() {
      return this.status === "active" || this.status === "past_due";
    },
  };
}

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

class FakeSubscriptionRepository {
  constructor(rows) {
    this.rows = (rows || []).map(makeSubscription);
    this.events = [];
  }

  findByCorrelationCode(code) {
    return this.rows.find((r) => r.correlationCode === code) || null;
  }

  findByUserId(userId) {
    const id = typeof userId === "string" ? userId.trim() : "";
    if (!id) return [];
    return this.rows.filter((r) => r.supabaseUserId === id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  // UPDATE condicional: só toca em linha SEM dono (é o que impede duas
  // requisições simultâneas de /me vincularem duas vezes).
  linkToAccount({ correlationCode, supabaseUserId, accountEmail, linkedBy }) {
    const row = this.findByCorrelationCode(correlationCode);
    if (!row || row.supabaseUserId) return false;
    row.supabaseUserId = supabaseUserId;
    row.accountEmail = normalizeEmail(accountEmail) || row.accountEmail;
    row.linkedBy = linkedBy;
    row.linkedAt = new Date().toISOString();
    return true;
  }

  linkUnclaimedByCustomerEmail({ supabaseUserId, email }) {
    const normalized = normalizeEmail(email);
    if (!supabaseUserId || !normalized) return [];
    const linked = [];
    for (const row of this.rows) {
      if (row.supabaseUserId) continue;
      if (normalizeEmail(row.customerEmail) !== normalized) continue;
      if (this.linkToAccount({ correlationCode: row.correlationCode, supabaseUserId, accountEmail: normalized, linkedBy: "email_match" })) {
        linked.push(row.correlationCode);
      }
    }
    return linked;
  }

  logEvent(event) {
    this.events.push(event);
  }
}

// Auth de teste: "Bearer user:<id>:<email>" vira uma sessão verificada.
// A verificação REAL (jwtVerify contra o JWKS do Supabase) é exercitada no
// último bloco deste arquivo, com o requireAuth de produção.
function fakeAuth(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer user:")) return res.status(401).json({ error: "token de autenticação ausente" });
  const [userId, email, verified] = header.slice("Bearer user:".length).split(":");
  req.userId = userId;
  req.userEmail = email || null;
  req.authPayload = { sub: userId, email, user_metadata: { email_verified: verified !== "unverified" } };
  next();
}

function buildApp(repository, { auth = fakeAuth } = {}) {
  const getAccountSubscription = new GetAccountSubscriptionUseCase(repository);
  const claimSubscription = new ClaimSubscriptionUseCase(repository, getAccountSubscription);
  const app = express();
  app.use(express.json());
  app.use(
    "/api/subscription",
    buildAccountRouter({ getAccountSubscription, claimSubscription, requireAuth: auth, requireVerifiedEmail })
  );
  return app;
}

function authHeader(userId, email, verified = true) {
  return { Authorization: `Bearer user:${userId}:${email}${verified ? "" : ":unverified"}` };
}

// ---------------------------------------------------------------------------
// 1) Conta COM assinatura ativa
// ---------------------------------------------------------------------------

test("conta com assinatura ativa: /me devolve acesso e o correlationCode pro auto-reparo do aparelho", async () => {
  const repo = new FakeSubscriptionRepository([
    {
      correlationCode: CODE_ATIVA,
      status: "active",
      plan: "annual",
      scope: "solo",
      currentPeriodEnd: "2027-07-26T12:00:00.000Z",
      customerEmail: "carlos@gmail.com",
      supabaseUserId: "user-carlos",
      providerSubscriptionId: "6QAE1D6J",
    },
  ]);
  const res = await supertest(buildApp(repo)).get("/api/subscription/me").set(authHeader("user-carlos", "carlos@gmail.com"));

  assert.equal(res.status, 200);
  assert.equal(res.body.hasAccess, true);
  assert.equal(res.body.status, "active");
  assert.equal(res.body.plan, "annual");
  assert.equal(res.body.source, "account");
  // É este código que o app regrava no AsyncStorage — conserta sozinho um
  // aparelho cujo ponteiro estava apontando pra pendência errada.
  assert.equal(res.body.correlationCode, CODE_ATIVA);
  assert.equal(res.body.currentPeriodEnd, "2027-07-26T12:00:00.000Z");
});

test("assinatura de CASAL marca hasCoupleAccess; assinatura solo não", async () => {
  const solo = new FakeSubscriptionRepository([
    { correlationCode: CODE_ATIVA, status: "active", scope: "solo", supabaseUserId: "u1" },
  ]);
  const soloRes = await supertest(buildApp(solo)).get("/api/subscription/me").set(authHeader("u1", "a@x.com"));
  assert.equal(soloRes.body.hasAccess, true);
  assert.equal(soloRes.body.hasCoupleAccess, false);

  const casal = new FakeSubscriptionRepository([
    { correlationCode: CODE_ATIVA, status: "active", scope: "couple", coupleName: "Ana & Léo", supabaseUserId: "u1" },
  ]);
  const casalRes = await supertest(buildApp(casal)).get("/api/subscription/me").set(authHeader("u1", "a@x.com"));
  assert.equal(casalRes.body.hasCoupleAccess, true);
});

test("past_due (janela de dunning) ainda concede acesso", async () => {
  const repo = new FakeSubscriptionRepository([
    { correlationCode: CODE_ATIVA, status: "past_due", supabaseUserId: "u1" },
  ]);
  const res = await supertest(buildApp(repo)).get("/api/subscription/me").set(authHeader("u1", "a@x.com"));
  assert.equal(res.body.hasAccess, true);
});

test("as 4 linhas 'active' do mesmo subscriber code viram UMA assinatura (não receita x4)", async () => {
  // Estado REAL de produção: liberar-carlos.js ativou as 4 pendências do
  // Carlos, todas com provider_subscription_id=6QAE1D6J.
  const rows = ["1", "2", "3", "4"].map((n, i) => ({
    correlationCode: `eeeeeeeeeeeeeeeeeeeeeeeeeeeeeee${n}`,
    status: "active",
    providerSubscriptionId: "6QAE1D6J",
    supabaseUserId: "user-carlos",
    createdAt: `2026-07-26T17:1${i}:00.000Z`,
  }));
  const repo = new FakeSubscriptionRepository(rows);
  const res = await supertest(buildApp(repo)).get("/api/subscription/me").set(authHeader("user-carlos", "carlos@gmail.com"));

  assert.equal(res.body.hasAccess, true);
  assert.equal(res.body.subscriptions.length, 1);
});

// ---------------------------------------------------------------------------
// 2) Conta SEM nada
// ---------------------------------------------------------------------------

test("conta sem nenhuma assinatura: 200 com hasAccess false (nunca 404, nunca 500)", async () => {
  const repo = new FakeSubscriptionRepository([]);
  const res = await supertest(buildApp(repo)).get("/api/subscription/me").set(authHeader("user-novo", "novo@x.com"));

  assert.equal(res.status, 200);
  assert.equal(res.body.hasAccess, false);
  assert.equal(res.body.hasCoupleAccess, false);
  assert.equal(res.body.correlationCode, null);
  assert.deepEqual(res.body.subscriptions, []);
});

test("auto-vínculo por e-mail verificado (email_match): assinante antigo recupera acesso só logando", async () => {
  const repo = new FakeSubscriptionRepository([
    {
      correlationCode: CODE_ORFA_MESMO_EMAIL,
      status: "active",
      // Como a Hotmart devolveu: maiúsculas e espaço. Sem LOWER(TRIM(...)) dos
      // dois lados isso nunca casaria com o e-mail do login.
      customerEmail: "  Carlos@Gmail.com ",
      supabaseUserId: null,
    },
  ]);
  const app = buildApp(repo);

  const res = await supertest(app).get("/api/subscription/me").set(authHeader("user-carlos", "carlos@gmail.com"));
  assert.equal(res.body.hasAccess, true);
  assert.equal(res.body.linkedNow, 1);
  assert.equal(repo.findByCorrelationCode(CODE_ORFA_MESMO_EMAIL).linkedBy, "email_match");
  assert.equal(repo.events.filter((e) => e.rawEvent.startsWith("ACCOUNT_LINK(email_match)")).length, 1);

  // Segunda chamada (o app rechecha no foco E a cada 5 min): não vincula de
  // novo nem duplica auditoria.
  const again = await supertest(app).get("/api/subscription/me").set(authHeader("user-carlos", "carlos@gmail.com"));
  assert.equal(again.body.linkedNow, 0);
  assert.equal(repo.events.filter((e) => e.rawEvent.startsWith("ACCOUNT_LINK(email_match)")).length, 1);
});

// ---------------------------------------------------------------------------
// 3) E-mail do CHECKOUT diferente do e-mail do LOGIN (PayPal / cartão de terceiro)
// ---------------------------------------------------------------------------

test("e-mail do pagamento != e-mail do login: /me não vincula sozinho, /claim com o código do aparelho resolve", async () => {
  const repo = new FakeSubscriptionRepository([
    {
      correlationCode: CODE_ORFA_PAYPAL,
      status: "active",
      // Pagou com o PayPal da esposa — o e-mail do pagamento não é o do login.
      customerEmail: "esposa@paypal.com",
      supabaseUserId: null,
    },
  ]);
  const app = buildApp(repo);

  const semVinculo = await supertest(app).get("/api/subscription/me").set(authHeader("user-joao", "joao@gmail.com"));
  assert.equal(semVinculo.body.hasAccess, false);
  assert.equal(semVinculo.body.linkedNow, 0);

  const claim = await supertest(app)
    .post("/api/subscription/claim")
    .set(authHeader("user-joao", "joao@gmail.com"))
    .send({ correlationCode: CODE_ORFA_PAYPAL });

  assert.equal(claim.status, 200);
  assert.equal(claim.body.hasAccess, true);
  assert.equal(repo.findByCorrelationCode(CODE_ORFA_PAYPAL).linkedBy, "device_code");
  assert.equal(repo.events.filter((e) => e.rawEvent.startsWith("ACCOUNT_LINK(device_code)")).length, 1);

  // /me agora enxerga sozinho — o aparelho deixou de ser necessário.
  const depois = await supertest(app).get("/api/subscription/me").set(authHeader("user-joao", "joao@gmail.com"));
  assert.equal(depois.body.hasAccess, true);
  // customer_email (e-mail do PAGAMENTO) nunca sai cru: só mascarado.
  assert.equal(depois.body.subscriptions[0].customerEmailMasked, "e***@paypal.com");
  assert.ok(!JSON.stringify(depois.body).includes("esposa@paypal.com"));
});

test("/claim de novo pela MESMA conta é no-op idempotente (retry do app não quebra)", async () => {
  const repo = new FakeSubscriptionRepository([
    { correlationCode: CODE_ATIVA, status: "active", supabaseUserId: "user-joao" },
  ]);
  const res = await supertest(buildApp(repo))
    .post("/api/subscription/claim")
    .set(authHeader("user-joao", "joao@gmail.com"))
    .send({ correlationCode: CODE_ATIVA });

  assert.equal(res.status, 200);
  assert.equal(res.body.hasAccess, true);
  assert.equal(repo.events.length, 0); // nada a auditar: já era dele
});

test("/claim com código malformado é 400, sem tocar no banco", async () => {
  const repo = new FakeSubscriptionRepository([]);
  const res = await supertest(buildApp(repo))
    .post("/api/subscription/claim")
    .set(authHeader("u1", "a@x.com"))
    .send({ correlationCode: "nao-e-um-codigo" });
  assert.equal(res.status, 400);
  assert.equal(repo.events.length, 0);
});

// ---------------------------------------------------------------------------
// 4) Token ausente / inválido (auth REAL de produção)
// ---------------------------------------------------------------------------

test("sem Authorization: 401 (o requireAuth real de socialAuth.js)", async () => {
  const app = buildApp(new FakeSubscriptionRepository([]), { auth: requireAuth });
  const me = await supertest(app).get("/api/subscription/me");
  assert.equal(me.status, 401);

  const claim = await supertest(app).post("/api/subscription/claim").send({ correlationCode: CODE_ATIVA });
  assert.equal(claim.status, 401);
});

test("token inválido (não é um JWT do Supabase): 401 — falha é FAIL-CLOSED", async () => {
  // Nunca vira "acesso liberado por precaução": o app não perde nada com isso
  // porque o fallback pelo código do aparelho continua valendo em paralelo
  // (união, não substituição).
  const app = buildApp(new FakeSubscriptionRepository([]), { auth: requireAuth });
  const res = await supertest(app).get("/api/subscription/me").set({ Authorization: "Bearer token-forjado.abc.123" });
  assert.equal(res.status, 401);
});

test("token válido mas e-mail NÃO verificado: 403 (senão dava pra herdar assinatura alheia)", async () => {
  // Se o "Confirm email" for desligado no painel do Supabase, sem esta trava
  // qualquer um cria conta com o e-mail do Carlos e leva a assinatura dele no
  // primeiro /me — o vínculo por e-mail é a única via SEM prova de posse.
  const repo = new FakeSubscriptionRepository([
    { correlationCode: CODE_ORFA_MESMO_EMAIL, status: "active", customerEmail: "carlos@gmail.com", supabaseUserId: null },
  ]);
  const res = await supertest(buildApp(repo))
    .get("/api/subscription/me")
    .set(authHeader("user-atacante", "carlos@gmail.com", false));

  assert.equal(res.status, 403);
  assert.equal(repo.findByCorrelationCode(CODE_ORFA_MESMO_EMAIL).supabaseUserId, null);
});

test("isEmailVerified: login social conta como verificado; e-mail sem confirmação não", () => {
  assert.equal(isEmailVerified({ app_metadata: { provider: "google" } }), true);
  assert.equal(isEmailVerified({ app_metadata: { provider: "email" }, user_metadata: { email_verified: true } }), true);
  assert.equal(isEmailVerified({ app_metadata: { provider: "email" }, user_metadata: { email_verified: false } }), false);
  assert.equal(isEmailVerified({}), false);
  assert.equal(isEmailVerified(null), false);
});

// ---------------------------------------------------------------------------
// 5) Assinatura de OUTRO e-mail / OUTRA conta — tem que ser negada
// ---------------------------------------------------------------------------

test("/me nunca devolve assinatura de outra conta, mesmo mandando o e-mail dela na query", async () => {
  const repo = new FakeSubscriptionRepository([
    {
      correlationCode: CODE_OUTRO_DONO,
      status: "active",
      customerEmail: "carlos@gmail.com",
      supabaseUserId: "user-carlos",
    },
  ]);
  // Query/body com o e-mail alheio é simplesmente ignorado: o e-mail usado é
  // SEMPRE req.userEmail, extraído do token verificado. Não existe (e não pode
  // existir) rota pública que aceite e-mail como parâmetro.
  const res = await supertest(buildApp(repo))
    .get("/api/subscription/me?email=carlos%40gmail.com")
    .set(authHeader("user-bisbilhoteiro", "bisbilhoteiro@x.com"));

  assert.equal(res.status, 200);
  assert.equal(res.body.hasAccess, false);
  assert.deepEqual(res.body.subscriptions, []);
  assert.equal(repo.findByCorrelationCode(CODE_OUTRO_DONO).supabaseUserId, "user-carlos");
});

test("/claim de assinatura que já tem OUTRO dono: 409 genérico, sem trocar o dono", async () => {
  const repo = new FakeSubscriptionRepository([
    { correlationCode: CODE_OUTRO_DONO, status: "active", supabaseUserId: "user-carlos" },
  ]);
  const res = await supertest(buildApp(repo))
    .post("/api/subscription/claim")
    .set(authHeader("user-bisbilhoteiro", "bisbilhoteiro@x.com"))
    .send({ correlationCode: CODE_OUTRO_DONO });

  assert.equal(res.status, 409);
  assert.equal(repo.findByCorrelationCode(CODE_OUTRO_DONO).supabaseUserId, "user-carlos");
  assert.equal(repo.events.length, 0);
});

test("/claim de código INEXISTENTE responde igualzinho ao de outro dono (não vira oráculo de códigos)", async () => {
  const repo = new FakeSubscriptionRepository([
    { correlationCode: CODE_OUTRO_DONO, status: "active", supabaseUserId: "user-carlos" },
  ]);
  const app = buildApp(repo);
  const inexistente = await supertest(app)
    .post("/api/subscription/claim")
    .set(authHeader("u9", "u9@x.com"))
    .send({ correlationCode: "0123456789abcdef0123456789abcdef" });
  const deOutro = await supertest(app)
    .post("/api/subscription/claim")
    .set(authHeader("u9", "u9@x.com"))
    .send({ correlationCode: CODE_OUTRO_DONO });

  assert.equal(inexistente.status, 409);
  assert.equal(deOutro.status, 409);
  assert.deepEqual(inexistente.body, deOutro.body);
});

test("e-mail de login igual ao customer_email de linha JÁ vinculada a outra conta não rouba o vínculo", async () => {
  // Vínculo é monotônico e de primeiro dono: só linha órfã é vinculável.
  const repo = new FakeSubscriptionRepository([
    { correlationCode: CODE_OUTRO_DONO, status: "active", customerEmail: "carlos@gmail.com", supabaseUserId: "user-carlos" },
  ]);
  const res = await supertest(buildApp(repo)).get("/api/subscription/me").set(authHeader("user-clone", "carlos@gmail.com"));

  assert.equal(res.body.hasAccess, false);
  assert.equal(res.body.linkedNow, 0);
  assert.equal(repo.findByCorrelationCode(CODE_OUTRO_DONO).supabaseUserId, "user-carlos");
});
