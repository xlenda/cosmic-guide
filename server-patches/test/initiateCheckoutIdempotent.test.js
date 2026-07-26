// Testes da idempotência do checkout por CONTA.
//
// O bug que isto conserta: InitiateCheckoutUseCase.execute() SEMPRE chamava
// createPending(). Cada clique em "Assinar" criava uma pendência nova E o app
// sobrescrevia a chave única do aparelho com o código novo — então clicar
// "Assinar" DEPOIS de já ter pago fazia o acesso SUMIR (o aparelho passava a
// apontar pra uma pendência que nunca seria aprovada). Foi exatamente o laço que
// o cliente Carlos viveu em 26/07/2026: 4 pendências pra 1 compra.
//
// Repositório fake em memória (better-sqlite3 não compila na máquina local) —
// o fake espelha a semântica das consultas novas de SubscriptionRepository.
const test = require("node:test");
const assert = require("node:assert/strict");

const { InitiateCheckoutUseCase, PENDING_REUSE_WINDOW_MS } = require("../src/application/InitiateCheckoutUseCase");

let seq = 0;

function makeRow(row) {
  return {
    ...row,
    scope: row.scope || "solo",
    plan: row.plan || null,
    createdAt: row.createdAt || new Date().toISOString(),
    updatedAt: row.updatedAt || row.createdAt || new Date().toISOString(),
    hasAccess() {
      return this.status === "active" || this.status === "past_due";
    },
  };
}

class FakeSubscriptionRepository {
  constructor(rows) {
    this.rows = (rows || []).map(makeRow);
  }

  createPending(input) {
    seq += 1;
    const row = makeRow({
      correlationCode: `code${String(seq).padStart(28, "0")}`,
      status: "pending",
      ...input,
      supabaseUserId: input.supabaseUserId || null,
    });
    this.rows.push(row);
    return row;
  }

  findByCorrelationCode(code) {
    return this.rows.find((r) => r.correlationCode === code) || null;
  }

  findActiveForAccount({ supabaseUserId, scope }) {
    if (!supabaseUserId) return null;
    return (
      this.rows.find(
        (r) => r.supabaseUserId === supabaseUserId && (r.scope || "solo") === scope && r.hasAccess()
      ) || null
    );
  }

  findRecentPendingForAccount({ supabaseUserId, plan, scope, sinceIso }) {
    if (!supabaseUserId) return null;
    return (
      this.rows
        .filter(
          (r) =>
            r.supabaseUserId === supabaseUserId &&
            r.status === "pending" &&
            (r.scope || "solo") === scope &&
            (r.plan || "") === (plan || "") &&
            r.createdAt >= sinceIso
        )
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0] || null
    );
  }
}

// Espelha HotmartPaymentProvider.initiateCheckout no que importa aqui: o xcod
// mandado pro Checkout Elements e o e-mail que vai no prefilledInfo.
const paymentProvider = {
  calls: [],
  async initiateCheckout({ correlationCode, coupleName, customerEmail, plan }) {
    this.calls.push({ correlationCode, coupleName, customerEmail, plan });
    return { provider: "hotmart", offerCode: `offer-${plan}`, xcod: correlationCode, prefilledInfo: { email: customerEmail } };
  },
};

function build(rows) {
  paymentProvider.calls = [];
  const repository = new FakeSubscriptionRepository(rows);
  return { repository, useCase: new InitiateCheckoutUseCase(repository, paymentProvider) };
}

const ONTEM = new Date(Date.now() - PENDING_REUSE_WINDOW_MS - 60 * 60 * 1000).toISOString();

test("conta que JÁ assina no mesmo escopo: não cria pendência e não abre a Hotmart", async () => {
  const { repository, useCase } = build([
    {
      correlationCode: "ativa",
      status: "active",
      plan: "annual",
      scope: "solo",
      supabaseUserId: "user-carlos",
      currentPeriodEnd: "2027-07-26T12:00:00.000Z",
    },
  ]);

  const res = await useCase.execute({ plan: "trial", scope: "solo", supabaseUserId: "user-carlos", accountEmail: "carlos@gmail.com" });

  assert.equal(res.alreadyActive, true);
  assert.equal(res.correlationCode, "ativa"); // o app regrava ESTE código no aparelho
  assert.equal(res.status, "active");
  assert.equal(res.currentPeriodEnd, "2027-07-26T12:00:00.000Z");
  assert.equal(res.checkoutConfig, undefined); // sem checkout = o app mostra "você já assina"
  assert.equal(repository.rows.length, 1); // nada criado
  assert.equal(paymentProvider.calls.length, 0);
});

test("past_due também bloqueia novo checkout (ainda tem acesso)", async () => {
  const { repository, useCase } = build([
    { correlationCode: "atrasada", status: "past_due", scope: "solo", supabaseUserId: "u1" },
  ]);
  const res = await useCase.execute({ supabaseUserId: "u1", accountEmail: "a@x.com", scope: "solo" });
  assert.equal(res.alreadyActive, true);
  assert.equal(repository.rows.length, 1);
});

test("assinante SOLO consegue comprar o upgrade de CASAL (idempotência é por escopo)", async () => {
  // Sem escopo na checagem, o assinante solo que forma casal ficava num beco
  // sem saída: "você já assina" e nunca conseguia pagar o plano de casal.
  const { repository, useCase } = build([
    { correlationCode: "ativa-solo", status: "active", scope: "solo", supabaseUserId: "user-carlos" },
  ]);

  const res = await useCase.execute({
    coupleName: "Carlos & Ana",
    plan: "annual",
    scope: "couple",
    supabaseUserId: "user-carlos",
    accountEmail: "carlos@gmail.com",
  });

  assert.equal(res.alreadyActive, undefined);
  assert.ok(res.checkoutConfig);
  assert.equal(repository.rows.length, 2);
  assert.equal(repository.findByCorrelationCode(res.correlationCode).scope, "couple");
});

test("clicar 'Assinar' de novo em 24h reaproveita a MESMA pendência (1 compra = 1 linha)", async () => {
  const { repository, useCase } = build([]);

  const primeiro = await useCase.execute({ plan: "annual", scope: "solo", supabaseUserId: "u1", accountEmail: "a@x.com" });
  const segundo = await useCase.execute({ plan: "annual", scope: "solo", supabaseUserId: "u1", accountEmail: "a@x.com" });
  const terceiro = await useCase.execute({ plan: "annual", scope: "solo", supabaseUserId: "u1", accountEmail: "a@x.com" });

  assert.equal(segundo.correlationCode, primeiro.correlationCode);
  assert.equal(terceiro.correlationCode, primeiro.correlationCode);
  assert.equal(segundo.reused, true);
  // Checkout novo de verdade em cima do mesmo código (a pessoa precisa pagar).
  assert.equal(segundo.checkoutConfig.xcod, primeiro.correlationCode);
  assert.equal(repository.rows.length, 1); // era 4 linhas antes do conserto
});

test("pendência de OUTRO plano não é reaproveitada (a pessoa mudou de ideia)", async () => {
  const { repository, useCase } = build([]);
  const trial = await useCase.execute({ plan: "trial", scope: "solo", supabaseUserId: "u1", accountEmail: "a@x.com" });
  const anual = await useCase.execute({ plan: "annual", scope: "solo", supabaseUserId: "u1", accountEmail: "a@x.com" });

  assert.notEqual(anual.correlationCode, trial.correlationCode);
  assert.equal(repository.rows.length, 2);
});

test("pendência mais velha que a janela de reuso não é reaproveitada", async () => {
  const { repository, useCase } = build([
    { correlationCode: "velha", status: "pending", plan: "annual", scope: "solo", supabaseUserId: "u1", createdAt: ONTEM },
  ]);
  const res = await useCase.execute({ plan: "annual", scope: "solo", supabaseUserId: "u1", accountEmail: "a@x.com" });

  assert.notEqual(res.correlationCode, "velha");
  assert.equal(repository.rows.length, 2);
});

test("pendência de OUTRA conta nunca é reaproveitada", async () => {
  const { repository, useCase } = build([
    { correlationCode: "de-outro", status: "pending", plan: "annual", scope: "solo", supabaseUserId: "user-carlos" },
  ]);
  const res = await useCase.execute({ plan: "annual", scope: "solo", supabaseUserId: "user-outro", accountEmail: "outro@x.com" });

  assert.notEqual(res.correlationCode, "de-outro");
  assert.equal(repository.findByCorrelationCode(res.correlationCode).supabaseUserId, "user-outro");
});

test("assinatura ativa de OUTRA conta não bloqueia o checkout desta", async () => {
  const { useCase } = build([
    { correlationCode: "ativa-do-carlos", status: "active", scope: "solo", supabaseUserId: "user-carlos" },
  ]);
  const res = await useCase.execute({ scope: "solo", supabaseUserId: "user-ana", accountEmail: "ana@x.com" });
  assert.equal(res.alreadyActive, undefined);
  assert.ok(res.checkoutConfig);
});

test("com token, o customerEmail do BODY é ignorado — vale o e-mail da sessão", async () => {
  // Antes dava pra POSTar o e-mail de outra pessoa e criar uma pendência
  // "dela", que a cascata do webhook por e-mail poderia casar.
  const { repository, useCase } = build([]);
  const res = await useCase.execute({
    customerEmail: "vitima@gmail.com",
    plan: "trial",
    scope: "solo",
    supabaseUserId: "user-atacante",
    accountEmail: "atacante@x.com",
  });

  const criada = repository.findByCorrelationCode(res.correlationCode);
  assert.equal(criada.customerEmail, "atacante@x.com");
  assert.equal(criada.accountEmail, "atacante@x.com");
  // E é o e-mail da sessão que vai pro prefilledInfo da Hotmart — aumenta a
  // chance de o buyerEmail do webhook casar com a linha certa.
  assert.equal(paymentProvider.calls[0].customerEmail, "atacante@x.com");
});

test("checkout novo já nasce vinculado à conta (linked_by=checkout)", async () => {
  const { repository, useCase } = build([]);
  const res = await useCase.execute({ plan: "trial", scope: "solo", supabaseUserId: "u1", accountEmail: "a@x.com" });
  const criada = repository.findByCorrelationCode(res.correlationCode);
  assert.equal(criada.supabaseUserId, "u1");
  assert.equal(criada.scope, "solo");
});

test("SEM token (funil web antigo do oddpro.pro): comportamento idêntico ao de hoje", async () => {
  // Backend novo + app velho, e o funil que não tem Supabase nenhum: cria
  // pendência e devolve checkoutConfig, sem 401 e sem vínculo.
  const { repository, useCase } = build([]);
  const um = await useCase.execute({ coupleName: "Ana & Léo", customerEmail: "ana@x.com", plan: "quarterly" });
  const dois = await useCase.execute({ coupleName: "Ana & Léo", customerEmail: "ana@x.com", plan: "quarterly" });

  assert.ok(um.checkoutConfig);
  assert.notEqual(dois.correlationCode, um.correlationCode); // sem conta, não há como deduplicar
  assert.equal(repository.rows.length, 2);
  assert.equal(repository.findByCorrelationCode(um.correlationCode).supabaseUserId, null);
  // coupleName preenchido => escopo derivado 'couple' mesmo sem o app mandar.
  assert.equal(repository.findByCorrelationCode(um.correlationCode).scope, "couple");
  assert.equal(um.checkoutConfig.prefilledInfo.email, "ana@x.com");
});

test("preço continua sendo decidido só pelo servidor (plano desconhecido cai no trial)", async () => {
  const { repository, useCase } = build([]);
  const res = await useCase.execute({ plan: "plano-inventado-de-graca" });
  const criada = repository.findByCorrelationCode(res.correlationCode);
  assert.equal(criada.amountCents, 500);
  assert.equal(criada.currency, "USD");
});
