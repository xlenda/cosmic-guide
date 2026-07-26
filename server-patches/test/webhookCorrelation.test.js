// Correlação de webhook -> assinatura: os degraus novos (subscriber code,
// e-mail) e, principalmente, a REGRA de quem pode carimbar
// provider_subscription_id.
//
// Incidente que originou tudo (26/07/2026): a Hotmart NÃO devolve o xcod no
// Checkout Elements embutido, então 100% das compras aprovadas eram rejeitadas
// e o cliente pagante ficava sem acesso (caso real: Carlos Alberto, liberado à
// mão).
//
// Regressão que estes testes travam: ao criar a cascata de correlação, eventos
// que chegam ANTES do dinheiro entrar (PURCHASE_BILLET_PRINTED de boleto/PIX,
// PURCHASE_OUT_OF_SHOPPING_CART, PURCHASE_DELAYED) passaram a casar por e-mail
// — e, com o fallback `|| purchase.transaction`, carimbavam a linha com um id
// de TRANSAÇÃO. O PURCHASE_APPROVED real chega depois com o SUBSCRIBER CODE,
// não com a transação: a linha carimbada errado não seria mais encontrada por
// esse campo, recriando exatamente o "pagou e não tem acesso".
//
// Repositório e provedor são fakes em memória — nenhum teste toca no SQLite
// (nem precisa de better-sqlite3, que não compila na máquina do Lenda).
//
// Como rodar: no BACKEND (onde src/ existe), `npm test` já pega este arquivo —
// ele só depende de src/application, src/infrastructure e src/domain. O `npm
// test` do app RN NÃO roda este arquivo de propósito: lá não existe src/ de
// backend nenhum (o script do app está limitado a "test/*.test.js").
const test = require("node:test");
const assert = require("node:assert/strict");
const { ProcessWebhookUseCase } = require("../src/application/ProcessWebhookUseCase");
const { HotmartPaymentProvider } = require("../src/infrastructure/HotmartPaymentProvider");
const { Subscription } = require("../src/domain/Subscription");

const HOTTOK = "hottok-de-teste";

function makeProvider() {
  return new HotmartPaymentProvider({ hottok: HOTTOK, offerCodes: { trial: "oferta-trial" } });
}

// Fake com as MESMAS assinaturas de método do SubscriptionRepository real
// (inclusive a ordem "mais recente primeiro" de cada consulta).
function makeRepo(rows) {
  const subs = rows.map((r) => new Subscription(r));
  const events = [];
  const processed = new Set();
  const byRecency = (list) => [...list].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return {
    subs,
    events,
    findByCorrelationCode: (code) => subs.find((s) => s.correlationCode === code) || null,
    findByProviderSubscriptionId: (id) => {
      const clean = typeof id === "string" ? id.trim() : "";
      if (!clean) return null;
      return byRecency(subs.filter((s) => s.providerSubscriptionId === clean))[0] || null;
    },
    findLatestPendingByCustomerEmail: (email) =>
      byRecency(subs.filter((s) => s.customerEmail === email && s.status === "pending"))[0] || null,
    findLatestByCustomerEmail: (email) => byRecency(subs.filter((s) => s.customerEmail === email))[0] || null,
    save: () => {},
    logEvent: (e) => events.push(e),
    wasEventProcessed: (id) => (id ? processed.has(id) : false),
    markEventProcessed: (id) => {
      if (id) processed.add(id);
    },
  };
}

function pendingRow(overrides = {}) {
  return {
    id: "cc-pendente",
    correlationCode: "cc-pendente",
    status: "pending",
    provider: "hotmart",
    providerSubscriptionId: null,
    customerEmail: "carlos@gmail.com",
    createdAt: "2026-07-26T01:00:00Z",
    updatedAt: "2026-07-26T01:00:00Z",
    ...overrides,
  };
}

// Payload no formato REAL de produção (o mesmo shape do evento id=9 salvo em
// subscription_events), parametrizado pelo tipo de evento.
function payload({ event, id, subscriberCode, subscriptionStatus, transaction = "HP1260209174", email = "Carlos@Gmail.com " }) {
  return {
    id,
    event,
    data: {
      buyer: { email },
      purchase: {
        transaction,
        price: { value: 0, currency_value: "USD" },
        date_next_charge: 1785672000000,
      },
      subscription: subscriberCode || subscriptionStatus
        ? { status: subscriptionStatus, subscriber: subscriberCode ? { code: subscriberCode } : undefined }
        : undefined,
    },
  };
}

function run(useCase, p) {
  return useCase.execute({ rawBody: JSON.stringify(p), headers: { "x-hotmart-hottok": HOTTOK }, payload: p });
}

test("parseWebhookEvent: id de TRANSAÇÃO nunca vira providerSubscriptionId", () => {
  const parsed = makeProvider().parseWebhookEvent(
    payload({ event: "PURCHASE_BILLET_PRINTED", id: "evt-boleto", transaction: "HP1260209174" })
  );
  assert.equal(parsed.status, null, "boleto impresso não é estado de compra");
  assert.equal(parsed.providerSubscriptionId, null, "sem subscriber code, não existe identidade de assinatura");
  assert.equal(parsed.transactionId, "HP1260209174", "a transação continua exposta, só que em campo próprio");
});

test("parseWebhookEvent: com subscriber code, ele (e só ele) é a identidade da assinatura", () => {
  const parsed = makeProvider().parseWebhookEvent(
    payload({ event: "PURCHASE_APPROVED", id: "evt-1", subscriberCode: "6QAE1D6J", subscriptionStatus: "ACTIVE" })
  );
  assert.equal(parsed.providerSubscriptionId, "6QAE1D6J");
  assert.equal(parsed.transactionId, "HP1260209174");
  assert.equal(parsed.status, "active");
});

test("evento SEM status (boleto/PIX impresso) casa por e-mail mas NÃO carimba a assinatura", () => {
  const repo = makeRepo([pendingRow()]);
  const useCase = new ProcessWebhookUseCase(repo, makeProvider(), null);

  const r = run(useCase, payload({ event: "PURCHASE_BILLET_PRINTED", id: "evt-boleto" }));

  assert.equal(r.ok, true);
  assert.equal(repo.subs[0].status, "pending", "boleto impresso não libera acesso");
  assert.equal(
    repo.subs[0].providerSubscriptionId,
    null,
    "carimbar aqui era o que fazia o PURCHASE_APPROVED posterior não achar mais a linha"
  );
});

test("REGRESSÃO COMPLETA: boleto impresso e depois PURCHASE_APPROVED — o cliente TEM acesso", () => {
  const repo = makeRepo([pendingRow()]);
  const useCase = new ProcessWebhookUseCase(repo, makeProvider(), null);

  run(useCase, payload({ event: "PURCHASE_BILLET_PRINTED", id: "evt-boleto" }));
  const aprovado = run(
    useCase,
    payload({ event: "PURCHASE_APPROVED", id: "evt-aprovado", subscriberCode: "6QAE1D6J", subscriptionStatus: "ACTIVE" })
  );

  assert.equal(aprovado.ok, true);
  assert.equal(aprovado.status, "active", "é a compra paga de verdade — tem que liberar");
  assert.equal(repo.subs[0].providerSubscriptionId, "6QAE1D6J", "agora sim: identidade estável da assinatura");
  assert.equal(repo.subs[0].customerEmail, "carlos@gmail.com", "e-mail normalizado, nunca sobrescrito por outro");
});

// O caso que faz o "pagou e não tem acesso" voltar de verdade. Real: o Carlos
// tinha QUATRO pendências do mesmo e-mail — o app sobrescreve o correlationCode
// salvo no aparelho a cada clique em "Assinar", então só a MAIS RECENTE é
// consultável por /api/subscription/:code. Se o evento de boleto/PIX carimbar a
// pendência antiga com o id da TRANSAÇÃO, o PURCHASE_APPROVED (que traz a mesma
// transação) casa por transação com a linha VELHA e ativa a errada: o dinheiro
// entrou, uma linha ficou "active" e o aparelho continua vendo o paywall.
test("REGRESSÃO REAL: com 2 pendências do mesmo e-mail, a compra ativa a linha que o aparelho consulta", () => {
  const repo = makeRepo([pendingRow({ id: "cc-antiga", correlationCode: "cc-antiga", createdAt: "2026-07-26T01:00:00Z" })]);
  const useCase = new ProcessWebhookUseCase(repo, makeProvider(), null);

  // 1) Boleto/PIX impresso enquanto só existia a pendência antiga.
  run(useCase, payload({ event: "PURCHASE_BILLET_PRINTED", id: "evt-boleto", transaction: "HP1260209174" }));

  // 2) A pessoa volta ao app e clica "Assinar" de novo antes de pagar o boleto
  // — nasce uma pendência NOVA e o aparelho passa a consultar só ela.
  repo.subs.push(new Subscription(pendingRow({ id: "cc-nova", correlationCode: "cc-nova", createdAt: "2026-07-26T02:00:00Z" })));

  // 3) Pagamento aprovado — mesma transação, agora com o subscriber code.
  run(
    useCase,
    payload({
      event: "PURCHASE_APPROVED",
      id: "evt-aprovado",
      transaction: "HP1260209174",
      subscriberCode: "6QAE1D6J",
      subscriptionStatus: "ACTIVE",
    })
  );

  const nova = repo.subs.find((s) => s.correlationCode === "cc-nova");
  assert.equal(nova.status, "active", "é a única linha que o aparelho do cliente consegue consultar");
  assert.equal(nova.providerSubscriptionId, "6QAE1D6J");
});

test("depois de ativada, a renovação acha a linha pelo subscriber code (sem xcod, sem e-mail novo)", () => {
  const repo = makeRepo([pendingRow({ status: "active", providerSubscriptionId: "6QAE1D6J", customerEmail: null })]);
  const useCase = new ProcessWebhookUseCase(repo, makeProvider(), null);

  const r = run(
    useCase,
    payload({ event: "PURCHASE_APPROVED", id: "evt-renovacao", subscriberCode: "6QAE1D6J", subscriptionStatus: "ACTIVE", email: null })
  );

  assert.equal(r.matchedBy, "provider_subscription_id");
  assert.equal(repo.subs[0].currentPeriodEnd, new Date(1785672000000).toISOString());
});

test("cascata: xcod ganha do subscriber code, que ganha do e-mail", () => {
  const repo = makeRepo([
    pendingRow({ id: "cc-xcod", correlationCode: "a".repeat(32), createdAt: "2026-07-20T00:00:00Z" }),
    pendingRow({ id: "cc-sub", correlationCode: "cc-sub", providerSubscriptionId: "6QAE1D6J", createdAt: "2026-07-21T00:00:00Z" }),
    pendingRow({ id: "cc-email", correlationCode: "cc-email", createdAt: "2026-07-26T01:00:00Z" }),
  ]);
  const useCase = new ProcessWebhookUseCase(repo, makeProvider(), null);
  const provider = makeProvider();

  const comXcod = provider.parseWebhookEvent({
    event: "PURCHASE_APPROVED",
    data: { purchase: { origin: { xcod: "a".repeat(32) } }, subscription: { status: "ACTIVE", subscriber: { code: "6QAE1D6J" } }, buyer: { email: "carlos@gmail.com" } },
  });
  assert.equal(useCase.resolveSubscription(comXcod, "carlos@gmail.com").matchedBy, "xcod");

  const semXcod = provider.parseWebhookEvent(
    payload({ event: "PURCHASE_APPROVED", id: "x", subscriberCode: "6QAE1D6J", subscriptionStatus: "ACTIVE" })
  );
  assert.equal(useCase.resolveSubscription(semXcod, "carlos@gmail.com").matchedBy, "provider_subscription_id");

  const soEmail = provider.parseWebhookEvent(payload({ event: "PURCHASE_APPROVED", id: "y", subscriptionStatus: "ACTIVE" }));
  const porEmail = useCase.resolveSubscription(soEmail, "carlos@gmail.com");
  assert.equal(porEmail.matchedBy, "email(pendente mais recente)");
  assert.equal(porEmail.subscription.correlationCode, "cc-email", "a pendência MAIS RECENTE é a única que o aparelho consulta");
});

test("estorno acha a assinatura já ativa pelo e-mail e revoga o acesso", () => {
  const repo = makeRepo([pendingRow({ status: "active", providerSubscriptionId: null })]);
  const useCase = new ProcessWebhookUseCase(repo, makeProvider(), null);

  const r = run(useCase, payload({ event: "PURCHASE_REFUNDED", id: "evt-estorno", subscriptionStatus: "ACTIVE" }));

  assert.equal(r.matchedBy, "email(qualquer status)");
  assert.equal(repo.subs[0].status, "expired", "dinheiro devolvido tem precedência sobre subscription.status=ACTIVE");
});

test("nenhuma correlação possível: rejeita explicando o que foi tentado (e não inventa assinatura)", () => {
  const repo = makeRepo([]);
  const useCase = new ProcessWebhookUseCase(repo, makeProvider(), null);

  const r = run(useCase, payload({ event: "PURCHASE_APPROVED", id: "evt-orfao", subscriptionStatus: "ACTIVE", email: null }));

  assert.equal(r.ok, false);
  assert.match(repo.events.at(-1).rawEvent, /REJEITADO\(assinatura não localizada/);
  assert.match(repo.events.at(-1).rawEvent, /sem e-mail do comprador/);
});

test("assinatura HOTTOK inválida continua sendo rejeitada antes de qualquer correlação", () => {
  const repo = makeRepo([pendingRow()]);
  const useCase = new ProcessWebhookUseCase(repo, makeProvider(), null);

  const p = payload({ event: "PURCHASE_APPROVED", id: "evt-forjado", subscriberCode: "6QAE1D6J", subscriptionStatus: "ACTIVE" });
  const r = useCase.execute({ rawBody: JSON.stringify(p), headers: { "x-hotmart-hottok": "errado" }, payload: p });

  assert.equal(r.ok, false);
  assert.equal(r.reason, "assinatura inválida");
  assert.equal(repo.subs[0].status, "pending", "e-mail só correlaciona DEPOIS do hottok conferir");
});
