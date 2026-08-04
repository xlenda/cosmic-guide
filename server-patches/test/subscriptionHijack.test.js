// O SEQUESTRO DE ASSINATURA que a auditoria de 02/08/2026 confirmou.
//
// O ataque: /api/checkout/initiate é público (o funil não tem login) e aceita
// `customerEmail` cru do body. Um anônimo cria uma pendência com o e-mail da
// VÍTIMA. Quando a vítima compra de verdade, o webhook da Hotmart chega sem
// xcod (o Checkout Elements embutido não devolve — está documentado em
// HotmartPaymentProvider) e cai na reconciliação por e-mail. Com o SQL antigo
// (`ORDER BY created_at DESC`), a linha do atacante vencia: a vítima pagava e
// via paywall, o atacante ficava com o código de uma assinatura ativa.
//
// A defesa testada aqui: linha ligada a uma CONTA cujo e-mail bate com o do
// comprador ganha de qualquer linha anônima, por mais nova que ela seja. Quem
// provou posse do e-mail (login) vence quem só digitou o e-mail num body.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const TEST_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "forja-test-hijack-"));
process.env.DATA_DIR = TEST_DATA_DIR;

const { SubscriptionRepository } = require("../src/infrastructure/SubscriptionRepository");
const { db } = require("../src/infrastructure/db");

const repo = new SubscriptionRepository();
const VITIMA = "vitima@example.com";

test.after(() => {
  try {
    db.close();
  } catch {}
  try {
    fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  } catch {}
});

test("linha de CONTA vence a anônima mais nova — o sequestro não acontece", () => {
  // 1. A vítima, logada, inicia o checkout: linha ligada à conta dela.
  const daVitima = repo.createPending({
    coupleName: null,
    provider: "hotmart",
    plan: "trial",
    amountCents: 500,
    currency: "USD",
    customerEmail: VITIMA,
  });
  repo.linkToAccount({
    correlationCode: daVitima.correlationCode,
    supabaseUserId: "uuid-da-vitima",
    accountEmail: VITIMA,
    linkedBy: "test",
  });

  // 2. O atacante, anônimo, cria DEPOIS uma pendência com o e-mail da vítima.
  //    (created_at mais recente — era exatamente isso que fazia ele ganhar.)
  const doAtacante = repo.createPending({
    coupleName: null,
    provider: "hotmart",
    plan: "trial",
    amountCents: 500,
    currency: "USD",
    customerEmail: VITIMA,
  });

  // 3. O webhook reconcilia por e-mail.
  const escolhida = repo.findLatestPendingByCustomerEmail(VITIMA);

  assert.equal(
    escolhida.correlationCode,
    daVitima.correlationCode,
    "o webhook deve ativar a assinatura da vítima, não a do atacante"
  );
  assert.notEqual(escolhida.correlationCode, doAtacante.correlationCode);
});

test("sem nenhuma linha de conta, a anônima mais recente ainda vence (funil sem login continua funcionando)", () => {
  const email = "funil@example.com";
  const antiga = repo.createPending({
    coupleName: null, provider: "hotmart", plan: "trial",
    amountCents: 500, currency: "USD", customerEmail: email,
  });
  const nova = repo.createPending({
    coupleName: null, provider: "hotmart", plan: "trial",
    amountCents: 500, currency: "USD", customerEmail: email,
  });

  const escolhida = repo.findLatestPendingByCustomerEmail(email);

  // A regra antiga continua valendo quando não há disputa de posse: o aparelho
  // só consegue consultar o código da ÚLTIMA tentativa (uma chave por e-mail
  // no AsyncStorage), então ativar outra deixaria o cliente pagando e vendo
  // paywall — o bug do Carlos, que a reconciliação por e-mail existe pra evitar.
  assert.equal(escolhida.correlationCode, nova.correlationCode);
  assert.notEqual(escolhida.correlationCode, antiga.correlationCode);
});

test("conta com e-mail DIFERENTE não sequestra a pendência de outro e-mail", () => {
  const email = "terceiro@example.com";
  const anonima = repo.createPending({
    coupleName: null, provider: "hotmart", plan: "trial",
    amountCents: 500, currency: "USD", customerEmail: email,
  });
  // Linha de conta cujo account_email NÃO é o do comprador: não pode ganhar
  // prioridade nenhuma (senão a defesa viraria o próprio vetor).
  const outra = repo.createPending({
    coupleName: null, provider: "hotmart", plan: "trial",
    amountCents: 500, currency: "USD", customerEmail: email,
  });
  repo.linkToAccount({
    correlationCode: outra.correlationCode,
    supabaseUserId: "uuid-de-outra-pessoa",
    accountEmail: "outra-pessoa@example.com",
    linkedBy: "test",
  });

  const escolhida = repo.findLatestPendingByCustomerEmail(email);
  assert.equal(
    escolhida.correlationCode,
    outra.correlationCode,
    "sem linha de conta com o e-mail do comprador, vale a data — e `outra` é a mais recente"
  );
  assert.ok(anonima.correlationCode);
});
