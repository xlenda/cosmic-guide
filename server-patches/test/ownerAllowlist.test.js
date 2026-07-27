// Testes da ALLOWLIST DE DONO/TESTADOR (OWNER_EMAILS) — o e-mail do dono passa
// a ter acesso total ao app pra testar como cliente, sem pagar e SEM criar uma
// assinatura de mentira no banco.
//
// O que está sendo travado aqui é o par perigoso de toda allowlist:
//   1) quem NÃO está na lista nunca entra (inclusive nos casos degenerados —
//      lista ausente, lista vazia, e-mail vazio, token sem e-mail verificado);
//   2) quem está na lista não deixa rastro de receita (nenhuma linha em
//      subscriptions, nenhum evento de auditoria, nada escrito).
//
// Este arquivo NÃO precisa de express/supertest/jose de propósito: ele exercita
// o caso de uso e o módulo puro direto, então roda em qualquer máquina (as deps
// do backend não compilam no Windows do Lenda). A camada HTTP continua coberta
// por test/accountSubscription.test.js, que roda no servidor com `npm test`.
//
// Como rodar:
//   node --test server-patches/test/ownerAllowlist.test.js
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  parseOwnerEmails,
  isOwnerEmail,
  applyOwnerAccess,
  OWNER_ACCESS_SOURCE,
} = require("../src/application/ownerAllowlist");
const { GetAccountSubscriptionUseCase } = require("../src/application/GetAccountSubscriptionUseCase");
const { ClaimSubscriptionUseCase } = require("../src/application/ClaimSubscriptionUseCase");

const DONO = "sanches925@gmail.com";
const CODE_ATIVA = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1";

// Espelha Subscription.hasAccess() do domínio (past_due ainda tem acesso).
function makeSubscription(row) {
  return {
    correlationCode: row.correlationCode,
    coupleName: row.coupleName || null,
    status: row.status,
    plan: row.plan || "trial",
    scope: row.scope || "solo",
    providerSubscriptionId: row.providerSubscriptionId || null,
    currentPeriodEnd: row.currentPeriodEnd || null,
    customerEmail: row.customerEmail || null,
    supabaseUserId: row.supabaseUserId || null,
    linkedBy: row.linkedBy || null,
    createdAt: row.createdAt || "2026-07-26T17:00:00.000Z",
    updatedAt: row.updatedAt || row.createdAt || "2026-07-26T17:00:00.000Z",
    hasAccess() {
      return this.status === "active" || this.status === "past_due";
    },
  };
}

// Repositório fake que CONTA escritas: é o que prova que a allowlist é só
// leitura. Qualquer INSERT/UPDATE/logEvent aparece em `writes`.
class SpyRepository {
  constructor(rows) {
    this.rows = (rows || []).map(makeSubscription);
    this.events = [];
    this.writes = [];
  }

  findByUserId(userId) {
    const id = typeof userId === "string" ? userId.trim() : "";
    if (!id) return [];
    return this.rows.filter((r) => r.supabaseUserId === id);
  }

  linkUnclaimedByCustomerEmail({ supabaseUserId, email }) {
    const alvo = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!supabaseUserId || !alvo) return [];
    const linked = [];
    for (const row of this.rows) {
      if (row.supabaseUserId) continue;
      const dono = typeof row.customerEmail === "string" ? row.customerEmail.trim().toLowerCase() : "";
      if (dono !== alvo) continue;
      row.supabaseUserId = supabaseUserId;
      row.linkedBy = "email_match";
      this.writes.push({ tipo: "linkToAccount", correlationCode: row.correlationCode });
      linked.push(row.correlationCode);
    }
    return linked;
  }

  findByCorrelationCode(code) {
    return this.rows.find((r) => r.correlationCode === code) || null;
  }

  linkToAccount({ correlationCode, supabaseUserId, linkedBy }) {
    const row = this.rows.find((r) => r.correlationCode === correlationCode);
    if (!row || row.supabaseUserId) return false;
    row.supabaseUserId = supabaseUserId;
    row.linkedBy = linkedBy || "device_code";
    this.writes.push({ tipo: "linkToAccount", correlationCode });
    return true;
  }

  logEvent(event) {
    this.events.push(event);
    this.writes.push({ tipo: "logEvent", event });
  }
}

// Sempre com a lista injetada (options.ownerEmails), exceto nos testes que
// verificam a leitura de process.env — assim um teste nunca vaza pro outro.
function useCase(repo, ownerEmails) {
  return new GetAccountSubscriptionUseCase(repo, ownerEmails === undefined ? {} : { ownerEmails });
}

function comToken(overrides = {}) {
  return { userId: "user-dono", email: DONO, emailVerified: true, ...overrides };
}

// ---------------------------------------------------------------------------
// 1) parseOwnerEmails — a leitura da env var, onde moram as armadilhas
// ---------------------------------------------------------------------------

test("parseOwnerEmails: normaliza (minúsculas, sem espaço) e não repete", () => {
  assert.deepEqual(parseOwnerEmails("  SANCHES925@Gmail.com , testador@x.com "), [DONO, "testador@x.com"]);
  assert.deepEqual(parseOwnerEmails("a@x.com,A@X.COM"), ["a@x.com"]);
  assert.deepEqual(parseOwnerEmails(["  Dono@X.com  "]), ["dono@x.com"]);
});

test("parseOwnerEmails: ''.split(',') === [''] NÃO pode virar uma entrada vazia na lista", () => {
  // A armadilha clássica: sem filtro, `"".split(",")` devolve [""] e
  // list.includes("") passa a ser true — qualquer e-mail vazio viraria dono.
  assert.deepEqual(parseOwnerEmails(""), []);
  assert.deepEqual(parseOwnerEmails(","), []);
  assert.deepEqual(parseOwnerEmails("  ,   ,"), []);
  assert.deepEqual(parseOwnerEmails(undefined), []);
  assert.deepEqual(parseOwnerEmails(null), []);
  assert.deepEqual(parseOwnerEmails(42), []);
});

test("parseOwnerEmails: não existe curinga — '*' e afins são descartados", () => {
  // Se alguém escrever OWNER_EMAILS=* achando que libera geral, a configuração
  // falha FECHADA (lista vazia = ninguém entra), nunca aberta.
  assert.deepEqual(parseOwnerEmails("*"), []);
  assert.deepEqual(parseOwnerEmails("all"), []);
  assert.deepEqual(parseOwnerEmails("true"), []);
  assert.deepEqual(parseOwnerEmails("*,dono@x.com"), ["dono@x.com"]);
});

// ---------------------------------------------------------------------------
// 2) isOwnerEmail — a decisão pura
// ---------------------------------------------------------------------------

test("isOwnerEmail: lista vazia/ausente nunca casa, nem com e-mail vazio", () => {
  assert.equal(isOwnerEmail({ email: DONO, emailVerified: true, allowlist: [] }), false);
  assert.equal(isOwnerEmail({ email: DONO, emailVerified: true, allowlist: undefined }), false);
  assert.equal(isOwnerEmail({ email: "", emailVerified: true, allowlist: [] }), false);
  assert.equal(isOwnerEmail({ email: "", emailVerified: true, allowlist: parseOwnerEmails("") }), false);
});

test("isOwnerEmail: e-mail vazio/nulo nunca casa, mesmo com lista preenchida", () => {
  const allowlist = parseOwnerEmails(DONO);
  for (const email of ["", "   ", null, undefined, 0, false, {}, []]) {
    assert.equal(isOwnerEmail({ email, emailVerified: true, allowlist }), false, `email=${JSON.stringify(email)}`);
  }
});

test("isOwnerEmail: sem e-mail VERIFICADO no token nunca casa", () => {
  const allowlist = parseOwnerEmails(DONO);
  for (const emailVerified of [false, undefined, null, "true", 1]) {
    assert.equal(
      isOwnerEmail({ email: DONO, emailVerified, allowlist }),
      false,
      `emailVerified=${JSON.stringify(emailVerified)}`
    );
  }
  assert.equal(isOwnerEmail({ email: DONO, emailVerified: true, allowlist }), true);
});

// ---------------------------------------------------------------------------
// 3) GET /me — o efeito real na resposta que o app consome
// ---------------------------------------------------------------------------

test("e-mail NA lista: acesso total, mesmo sem nenhuma assinatura no banco", () => {
  const repo = new SpyRepository([]);
  const res = useCase(repo, DONO).execute(comToken());

  assert.equal(res.hasAccess, true);
  // As 5 telas exclusivas de casal (FeatureGate) dependem deste campo — sem ele
  // o dono liberaria metade do produto e não conseguiria testar a outra metade.
  assert.equal(res.hasCoupleAccess, true);
  assert.equal(res.status, "active");
  assert.equal(res.plan, "owner");
  // Sem ciclo de cobrança não há data de renovação: null (a tela de Planos
  // simplesmente não mostra a linha "renova em ..."). Inventar 2099 seria
  // escrever ficção num campo que o usuário lê.
  assert.equal(res.currentPeriodEnd, null);
  // A marca: em log/curl fica óbvio que isso não é receita.
  assert.equal(res.source, OWNER_ACCESS_SOURCE);
  assert.equal(res.ownerAccess, true);
});

test("resposta do dono tem o MESMO formato de uma assinatura real (app não muda)", () => {
  // Contrato lido por normalizeAccountPayload em lib/accountSubscription.js.
  const res = useCase(new SpyRepository([]), DONO).execute(comToken());
  for (const campo of [
    "hasAccess",
    "hasCoupleAccess",
    "status",
    "plan",
    "scope",
    "currentPeriodEnd",
    "correlationCode",
    "linkedNow",
    "subscriptions",
    "source",
  ]) {
    assert.ok(campo in res, `campo ausente na resposta: ${campo}`);
  }
  assert.ok(Array.isArray(res.subscriptions));
  // correlationCode null é o correto: não existe código pra este acesso, e o
  // auto-reparo do aparelho (repairLocalCorrelationCodes) percorre `entries`,
  // que nasce vazia — nada de código falso gravado no AsyncStorage do dono.
  assert.equal(res.correlationCode, null);
  assert.equal(res.linkedNow, 0);
});

test("e-mail FORA da lista: nada muda (continua sem acesso)", () => {
  const repo = new SpyRepository([]);
  const res = useCase(repo, DONO).execute({ userId: "user-x", email: "outro@gmail.com", emailVerified: true });

  assert.equal(res.hasAccess, false);
  assert.equal(res.hasCoupleAccess, false);
  assert.equal(res.source, "account");
  assert.equal(res.ownerAccess, undefined);
  assert.deepEqual(res.subscriptions, []);
});

test("OWNER_EMAILS AUSENTE: ninguém tem acesso", () => {
  const anterior = process.env.OWNER_EMAILS;
  delete process.env.OWNER_EMAILS;
  try {
    // Sem injeção — é o process.env que vale, exatamente como em produção.
    const res = new GetAccountSubscriptionUseCase(new SpyRepository([])).execute(comToken());
    assert.equal(res.hasAccess, false);
    assert.equal(res.source, "account");
  } finally {
    if (anterior === undefined) delete process.env.OWNER_EMAILS;
    else process.env.OWNER_EMAILS = anterior;
  }
});

test("OWNER_EMAILS='' : ninguém tem acesso (nem quem chega com e-mail vazio)", () => {
  const anterior = process.env.OWNER_EMAILS;
  process.env.OWNER_EMAILS = "";
  try {
    const repo = new SpyRepository([]);
    const uc = new GetAccountSubscriptionUseCase(repo);
    assert.equal(uc.execute(comToken()).hasAccess, false);
    assert.equal(uc.execute({ userId: "u", email: "", emailVerified: true }).hasAccess, false);
    assert.equal(uc.execute({ userId: "u", email: null, emailVerified: true }).hasAccess, false);
  } finally {
    if (anterior === undefined) delete process.env.OWNER_EMAILS;
    else process.env.OWNER_EMAILS = anterior;
  }
});

test("caixa e espaços diferentes casam dos DOIS lados", () => {
  // Lista com espaço/maiúscula, token com espaço/maiúscula — o Supabase e o
  // .env não combinam formato entre si, então normalizar um lado só não basta.
  const lista = "  SANCHES925@GMAIL.COM  ";
  const token = "  Sanches925@Gmail.Com ";
  const res = useCase(new SpyRepository([]), lista).execute(comToken({ email: token }));
  assert.equal(res.hasAccess, true);
  assert.equal(res.ownerAccess, true);

  const inverso = useCase(new SpyRepository([]), DONO).execute(comToken({ email: " SANCHES925@gmail.com " }));
  assert.equal(inverso.hasAccess, true);
});

test("e-mail vazio/nulo no token nunca vira dono", () => {
  const repo = new SpyRepository([]);
  for (const email of ["", "   ", null, undefined]) {
    const res = useCase(repo, DONO).execute({ userId: "u", email, emailVerified: true });
    assert.equal(res.hasAccess, false, `email=${JSON.stringify(email)}`);
    assert.equal(res.source, "account");
  }
});

test("token sem e-mail VERIFICADO nunca vira dono (defesa em profundidade)", () => {
  // A rota já barra com 403 no requireVerifiedEmail — mas se alguém remover
  // esse middleware um dia, a allowlist continua fechada aqui. Sem isso,
  // qualquer um criaria uma conta com o e-mail do dono e ganhava o produto.
  const repo = new SpyRepository([]);
  for (const emailVerified of [false, undefined, null, "true"]) {
    const res = useCase(repo, DONO).execute({ userId: "u", email: DONO, emailVerified });
    assert.equal(res.hasAccess, false, `emailVerified=${JSON.stringify(emailVerified)}`);
    assert.equal(res.ownerAccess, undefined);
  }
});

// ---------------------------------------------------------------------------
// 4) A prova de que isto NÃO é receita
// ---------------------------------------------------------------------------

test("allowlist não cria nem altera NENHUMA linha em subscriptions", () => {
  const repo = new SpyRepository([
    // Uma linha órfã de OUTRA pessoa: nada aqui pode encostar nela.
    { correlationCode: CODE_ATIVA, status: "active", customerEmail: "cliente@pagante.com", supabaseUserId: null },
  ]);
  const antes = JSON.parse(JSON.stringify(repo.rows));

  const res = useCase(repo, DONO).execute(comToken());

  assert.equal(res.hasAccess, true);
  // Nenhuma escrita: nem linha nova, nem UPDATE, nem evento de auditoria.
  assert.deepEqual(repo.writes, []);
  assert.deepEqual(repo.events, []);
  assert.equal(repo.rows.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(repo.rows)), antes);
  assert.equal(repo.rows[0].supabaseUserId, null);
  // E a resposta não inventa assinatura nenhuma: a lista sai VAZIA, então nada
  // disso pode ser contado como venda por quem ler /me.
  assert.deepEqual(res.subscriptions, []);
  assert.equal(res.linkedNow, 0);
});

test("dono com assinatura REAL: os dados verdadeiros continuam valendo (é união, não substituição)", () => {
  const repo = new SpyRepository([
    {
      correlationCode: CODE_ATIVA,
      status: "active",
      plan: "annual",
      scope: "couple",
      currentPeriodEnd: "2027-07-26T12:00:00.000Z",
      supabaseUserId: "user-dono",
      providerSubscriptionId: "6QAE1D6J",
    },
  ]);
  const res = useCase(repo, DONO).execute(comToken());

  assert.equal(res.hasAccess, true);
  assert.equal(res.plan, "annual"); // não vira "owner": a compra real manda
  assert.equal(res.currentPeriodEnd, "2027-07-26T12:00:00.000Z");
  assert.equal(res.correlationCode, CODE_ATIVA);
  assert.equal(res.subscriptions.length, 1);
  assert.deepEqual(repo.writes, []);
});

test("cliente pagante de verdade não é afetado pela allowlist", () => {
  // Guarda contra a regressão mais cara possível: mexer no acesso de quem paga.
  const repo = new SpyRepository([
    { correlationCode: CODE_ATIVA, status: "active", plan: "trial", scope: "couple", supabaseUserId: "user-carlos" },
  ]);
  const res = useCase(repo, DONO).execute({
    userId: "user-carlos",
    email: "carlos@gmail.com",
    emailVerified: true,
  });

  assert.equal(res.hasAccess, true);
  assert.equal(res.hasCoupleAccess, true);
  assert.equal(res.source, "account");
  assert.equal(res.ownerAccess, undefined);
  assert.equal(res.subscriptions.length, 1);
});

// ---------------------------------------------------------------------------
// 5) TENTATIVAS DE ARROMBAMENTO — cada teste aqui nasceu de uma tentativa real
//    de liberar quem não deveria, e falhou. Não apagar: eles são a prova.
// ---------------------------------------------------------------------------

test("Unicode: e-mail com SINAL DE KELVIN (U+212A) NÃO vira o e-mail da lista", () => {
  // toLowerCase() do JS não é ASCII. Varrendo U+0080..U+2FFFF existe exatamente
  // UM caractere não-ASCII cujo minúsculo é uma letra ASCII simples: U+212A.
  assert.equal("K".toLowerCase(), "k"); // trava a premissa
  const lista = "luke@x.com";
  const forjado = "luKe@x.com"; // OUTRO endereço, de outra pessoa
  assert.equal(forjado.trim().toLowerCase(), "luke@x.com"); // era isto que casava

  assert.equal(isOwnerEmail({ email: forjado, emailVerified: true, allowlist: parseOwnerEmails(lista) }), false);
  const res = useCase(new SpyRepository([]), lista).execute(comToken({ email: forjado }));
  assert.equal(res.hasAccess, false);
  assert.equal(res.ownerAccess, undefined);
});

test("Unicode: homoglifos e largura fixa também não casam, e lista não-ASCII é descartada", () => {
  const allowlist = parseOwnerEmails(DONO);
  // 'а' cirílico (U+0430) e 'ｓ' de largura fixa (U+FF53) parecem iguais na tela.
  assert.equal(isOwnerEmail({ email: "sаnches925@gmail.com", emailVerified: true, allowlist }), false);
  assert.equal(isOwnerEmail({ email: "ｓanches925@gmail.com", emailVerified: true, allowlist }), false);
  // Entrada não-ASCII no .env some da lista (falha FECHADA, nunca curinga).
  assert.deepEqual(parseOwnerEmails("donoK@x.com"), []);
  assert.deepEqual(parseOwnerEmails("dаno@x.com,ok@x.com"), ["ok@x.com"]);
});

test("e-mail parecido nunca passa: sufixo, subdomínio, ponto, plus e espaço interno", () => {
  const allowlist = parseOwnerEmails(DONO);
  for (const email of [
    "sanches925@gmail.com.br",
    "sanches925@gmail.co",
    "sanches925@gmail.com.evil.io",
    "sanches925@evil.com",
    "sanches925+admin@gmail.com",
    "sanches.925@gmail.com",
    "xsanches925@gmail.com",
    "sanches925@gmail.com ",       // trim resolve
    "sanches925@gmail.com\u0000",  // byte nulo pendurado (escapado: byte cru no fonte some numa normalizacao e o teste vira tautologia)
    "sanches925@gmail.com,outro@x.com",
    "sanches925@gmail.com\nsanches925@gmail.com",
  ]) {
    const esperado = email.trim() === DONO; // só o trim puro pode casar
    assert.equal(isOwnerEmail({ email, emailVerified: true, allowlist }), esperado, `email=${JSON.stringify(email)}`);
  }
});

test("valores hostis no lugar do e-mail não casam com nada", () => {
  const allowlist = parseOwnerEmails(DONO);
  for (const email of [
    { toString: () => DONO },        // objeto que "vira" o e-mail no template
    new String(DONO),                // eslint-disable-line no-new-wrappers
    [DONO],
    { email: DONO },
    Symbol.iterator,
    NaN,
    Infinity,
  ]) {
    assert.equal(isOwnerEmail({ email, emailVerified: true, allowlist }), false, `email=${String(email)}`);
  }
});

test("OWNER_EMAILS degenerada em toda forma: ninguém entra", () => {
  // Varredura das formas que um .env editado às pressas pode assumir.
  for (const raw of [
    "",
    " ",
    ",",
    ",,,",
    "  ,  ,  ",
    "\t\n",
    "*",
    "*@*",       // tem "@", mas é igualdade exata: só casa com o literal "*@*"
    "all",
    "true",
    "1",
    "%",
    "null",
    "undefined",
    "OWNER_EMAILS=sanches925@gmail.com", // colou a linha inteira do .env
  ]) {
    const lista = parseOwnerEmails(raw);
    assert.equal(
      isOwnerEmail({ email: DONO, emailVerified: true, allowlist: lista }),
      false,
      `OWNER_EMAILS=${JSON.stringify(raw)} liberou o dono`
    );
    // E, principalmente, não libera um terceiro qualquer.
    assert.equal(
      isOwnerEmail({ email: "qualquer@um.com", emailVerified: true, allowlist: lista }),
      false,
      `OWNER_EMAILS=${JSON.stringify(raw)} liberou terceiro`
    );
  }
});

test("nenhum campo do corpo/query pode virar o e-mail — execute só olha `email`", () => {
  // O handler passa email: req.userEmail (token verificado). Aqui se prova que,
  // mesmo que alguém adicione campos vindos do cliente, execute os ignora.
  const repo = new SpyRepository([]);
  const res = useCase(repo, DONO).execute({
    userId: "user-invasor",
    email: "invasor@evil.com",
    emailVerified: true,
    // tudo abaixo é lixo que um atacante mandaria no body/query/header
    userEmail: DONO,
    ownerEmail: DONO,
    owner: true,
    ownerAccess: true,
    hasAccess: true,
    source: "owner_allowlist",
    allowlist: [DONO],
    ownerEmails: DONO,
  });
  assert.equal(res.hasAccess, false);
  assert.equal(res.ownerAccess, undefined);
  assert.equal(res.source, "account");
});

test("resposta do dono é internamente COERENTE: nunca hasAccess:true com status que nega acesso", () => {
  // O caso que quebra na prática: o dono testa o checkout com o próprio e-mail,
  // a pendência nasce com customer_email = e-mail dele, o email_match do /me
  // vincula na conta dele, e `best` passa a ser uma linha 'pending'. Herdando
  // esse status, PlanosScreen.js cai no
  //   `relevantAccess && subscriptionStatus && subscriptionStatus !== 'pending'`
  // e volta a VENDER o produto pro dono — sendo que a allowlist promete o card
  // de assinante. (O banco de produção tem 17 pendências, 3 com e-mail.)
  const repo = new SpyRepository([
    {
      correlationCode: CODE_ATIVA,
      status: "pending",
      plan: "annual",
      scope: "couple",
      customerEmail: DONO,
      supabaseUserId: null,
    },
  ]);
  const res = useCase(repo, DONO).execute(comToken());

  assert.equal(res.hasAccess, true);
  assert.equal(res.status, "active", "status pendente não pode sobreviver a hasAccess:true");
  assert.equal(res.plan, "owner");
  assert.equal(res.scope, "couple");
  assert.equal(res.currentPeriodEnd, null);
});

test("assinatura EXPIRADA do dono não vaza data de renovação no passado", () => {
  const repo = new SpyRepository([
    {
      correlationCode: CODE_ATIVA,
      status: "expired",
      plan: "annual",
      scope: "couple",
      currentPeriodEnd: "2025-01-01T00:00:00.000Z",
      supabaseUserId: "user-dono",
    },
  ]);
  const res = useCase(repo, DONO).execute(comToken());
  assert.equal(res.hasAccess, true);
  assert.equal(res.status, "active");
  // Herdar a data mostraria "renova em 01/01/2025" numa tela que o usuário lê.
  assert.equal(res.currentPeriodEnd, null);
});

test("applyOwnerAccess: assinatura real que CONCEDE acesso continua mandando (é união)", () => {
  const real = {
    source: "account",
    hasAccess: true,
    hasCoupleAccess: false,
    status: "past_due",
    plan: "annual",
    scope: "solo",
    currentPeriodEnd: "2027-01-01T00:00:00.000Z",
  };
  const res = applyOwnerAccess(real, DONO);
  assert.equal(res.status, "past_due"); // past_due concede acesso: preservado
  assert.equal(res.plan, "annual");
  assert.equal(res.currentPeriodEnd, "2027-01-01T00:00:00.000Z");
  assert.equal(res.hasCoupleAccess, true); // só isto é forçado, pra testar tudo
});

test("POST /claim devolve a MESMA conta que o GET /me (emailVerified não se perde)", () => {
  // O /claim termina chamando GetAccountSubscriptionUseCase.execute. Se ele não
  // repassar emailVerified, a mesma conta sai "com acesso" no /me e "sem
  // acesso" no /claim — falha fechada, mas é deriva entre duas rotas que
  // deveriam concordar, e é assim que alguém acaba "consertando" pelo lado
  // errado (afrouxando a verificação).
  const repo = new SpyRepository([
    { correlationCode: CODE_ATIVA, status: "active", scope: "couple", supabaseUserId: null },
  ]);
  const get = useCase(repo, DONO);
  const claim = new ClaimSubscriptionUseCase(repo, get);

  const doClaim = claim.execute({
    userId: "user-dono",
    email: DONO,
    correlationCode: CODE_ATIVA,
    emailVerified: true,
  });
  assert.equal(doClaim.ok, true);
  assert.equal(doClaim.account.ownerAccess, true);
  assert.equal(doClaim.account.hasAccess, true);
  assert.equal(doClaim.account.source, OWNER_ACCESS_SOURCE);

  // E sem e-mail verificado o /claim continua FECHADO pra allowlist.
  const repo2 = new SpyRepository([
    { correlationCode: CODE_ATIVA, status: "active", scope: "couple", supabaseUserId: null },
  ]);
  const claim2 = new ClaimSubscriptionUseCase(repo2, useCase(repo2, DONO));
  const semVerificar = claim2.execute({ userId: "u2", email: DONO, correlationCode: CODE_ATIVA });
  assert.equal(semVerificar.ok, true);
  assert.equal(semVerificar.account.ownerAccess, undefined);
});

test("allowlist NÃO alcança a rota antiga por código nem o webhook", () => {
  // Prova estrutural: os dois caminhos que concedem acesso sem conta
  // (GetSubscriptionStatusUseCase e ProcessWebhookUseCase) não importam o
  // módulo. Se alguém acoplar um dia, este teste quebra e a pessoa lê o porquê:
  // a rota antiga é PÚBLICA (basta o código), então uma allowlist ali viraria
  // "qualquer um com um código qualquer vira dono"; e o webhook escreve no
  // banco, que é exatamente o que a allowlist existe pra nunca fazer.
  const fs = require("node:fs");
  const path = require("node:path");
  const raiz = path.join(__dirname, "..", "src");
  const proibidos = [
    path.join(raiz, "application", "GetSubscriptionStatusUseCase.js"),
    path.join(raiz, "application", "ProcessWebhookUseCase.js"),
    path.join(raiz, "application", "InitiateCheckoutUseCase.js"),
    path.join(raiz, "infrastructure", "SubscriptionRepository.js"),
  ];
  for (const arquivo of proibidos) {
    if (!fs.existsSync(arquivo)) continue; // não faz parte deste pacote de patch
    const src = fs.readFileSync(arquivo, "utf8");
    assert.equal(src.includes("ownerAllowlist"), false, `${path.basename(arquivo)} não pode conhecer a allowlist`);
    assert.equal(src.includes("OWNER_EMAILS"), false, `${path.basename(arquivo)} não pode ler OWNER_EMAILS`);
  }
});

test("com a allowlist LIGADA, um terceiro qualquer continua batendo no paywall", () => {
  // O teste que importa pro bolso: ligar a allowlist não pode afrouxar nada
  // pra mais ninguém. 200 contas aleatórias, lista ligada, todas sem acesso.
  const repo = new SpyRepository([]);
  const uc = useCase(repo, `${DONO},testador@exemplo.com`);
  for (let i = 0; i < 200; i++) {
    const res = uc.execute({ userId: `u-${i}`, email: `pessoa${i}@gmail.com`, emailVerified: true });
    assert.equal(res.hasAccess, false);
    assert.equal(res.ownerAccess, undefined);
  }
  assert.deepEqual(repo.writes, []);
});
