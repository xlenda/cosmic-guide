// COTA DE IA — teste HTTP de ponta a ponta contra o app REAL (src/http/server.js)
// e o SQLite real (DATA_DIR isolado num diretório temporário).
//
// POR QUE ESTE ARQUIVO EXISTE: até 30/07/2026 as 10 rotas de IA não tinham
// autenticação NEM checagem de assinatura. O paywall inteiro morava no
// AsyncStorage do aparelho (lib/featureUsage.js no app), ou seja:
//   (a) localStorage.clear() devolvia as 9 leituras grátis, pra sempre;
//   (b) curl sem token nenhum torrava ~5.700 chamadas/dia por IP na conta
//       Anthropic do dono.
//
// O que está travado aqui é exatamente o que precisa continuar verdadeiro no
// dia em que o dono divulgar o app:
//   1. assinante passa sem cota;
//   2. quem não assina gasta a cota e é BARRADO;
//   3. a cota é da CONTA, não do aparelho/IP — trocar de rede (ou limpar o
//      navegador, que é o mesmo do ponto de vista do servidor) não devolve
//      nada;
//   4. curl sem token é barrado nas rotas com foto (as caras) e tem cota
//      minúscula nas de texto;
//   5. a resposta de cota esgotada é RECONHECÍVEL (code) — é isso que deixa o
//      app abrir o paywall em vez de servir uma leitura enlatada;
//   6. o gate está MONTADO nas 10 rotas (um gate perfeito que ninguém montou
//      não protege nada — foi exatamente o que já aconteceu com /api/track).
//
// Como rodar (dentro de /root/forja-backend ou de uma cópia):
//   node --experimental-test-module-mocks --test test/aiQuota.http.test.js
const { mock } = require("node:test");

// requireAuth (socialAuth.js) verifica o JWT contra o JWKS real do Supabase —
// mesmo mock de socialRoutes.http.test.js: token "user:<id>" vira um payload
// verificado. Tem que rodar ANTES de qualquer require que puxe socialAuth.
mock.module("jose", {
  namedExports: {
    createRemoteJWKSet: () => () => {},
    jwtVerify: async (token) => {
      if (typeof token !== "string" || !token.startsWith("user:")) {
        throw new Error("token de teste inválido");
      }
      const userId = token.slice("user:".length);
      return {
        payload: {
          sub: userId,
          email: `${userId}@example.com`,
          email_verified: true,
          app_metadata: { provider: "email" },
        },
      };
    },
  },
});

const path = require("node:path");

// A IA de verdade custa dinheiro e não pode ser chamada por teste nenhum.
let chamadasDeIa = 0;
const chamadasChat = [];
mock.module(path.join(__dirname, "..", "src", "infrastructure", "AnthropicChatProvider.js"), {
  namedExports: {
    AnthropicChatProvider: class {
      async chat(args) {
        chamadasDeIa += 1;
        chamadasChat.push(args);
        return "resposta de teste";
      }
      async analyzePalm() {
        chamadasDeIa += 1;
        return { title: "t", body: "b" };
      }
      async analyzeCoffee() {
        chamadasDeIa += 1;
        return { title: "t", body: "b" };
      }
      async analyzeMoles() {
        chamadasDeIa += 1;
        return { title: "t", body: "b" };
      }
      async analyzeFoot() {
        chamadasDeIa += 1;
        return { title: "t", body: "b" };
      }
      async analyzeFace() {
        chamadasDeIa += 1;
        return { title: "t", body: "b" };
      }
      async interpretDream() {
        chamadasDeIa += 1;
        return { title: "t", body: "b" };
      }
      async enhanceInsight() {
        chamadasDeIa += 1;
        return { enhanced: "texto organizado" };
      }
      async summarizeCoffeeWeek() {
        chamadasDeIa += 1;
        return { title: "t", body: "b" };
      }
      async summarizeWeeklyInsight() {
        chamadasDeIa += 1;
        return { title: "t", body: "b" };
      }
    },
  },
});

// compressImage roda sharp de verdade — nos testes a "foto" é uma string
// qualquer, então o compressor vira identidade.
mock.module(path.join(__dirname, "..", "src", "infrastructure", "imageProcessing.js"), {
  namedExports: {
    compressImage: async (imageBase64, mediaType) => ({ imageBase64, mediaType: mediaType || "image/jpeg" }),
  },
});

const fs = require("node:fs");
const os = require("node:os");

const TEST_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "forja-test-aiquota-"));
process.env.DATA_DIR = TEST_DATA_DIR;
process.env.ALLOWED_ORIGIN = "http://localhost";
process.env.HOTMART_HOTTOK = "test-hottok-secret";
process.env.HOTMART_OFFER_CODE = "test-offer-code";
process.env.ADMIN_TOKEN = "test-admin-token-1234";
// Sem isso o aiProvider é null e TODA rota de IA responde 503 antes de
// qualquer coisa — o teste passaria medindo a coisa errada.
process.env.ANTHROPIC_API_KEY = "test-key-nao-usada";
process.env.OWNER_EMAILS = "";

const test = require("node:test");
const assert = require("node:assert/strict");
const supertest = require("supertest");

const { app } = require("../src/http/server");
const { db } = require("../src/infrastructure/db");
const { limits } = require("../src/http/aiQuota");

test.after(() => {
  fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
});

// --- utilidades --------------------------------------------------------------

let ipContador = 0;
// Um IP novo por teste: o balde anônimo é por IP+dia e o aiLimiter é por IP —
// sem isolar, um teste envenena o seguinte. Com `trust proxy = 1` no server.js,
// o X-Forwarded-For é o que vira req.ip (é a topologia real: nginx na frente).
function novoIp() {
  ipContador += 1;
  return `203.0.113.${ipContador % 250}`;
}

let userContador = 0;
function novoUsuario() {
  userContador += 1;
  return `u-teste-${String(userContador).padStart(4, "0")}`;
}

function chat(ip, { token, mensagem = "oi", personaId = "luna", contexto, lang } = {}) {
  const req = supertest(app).post("/api/chat").set("X-Forwarded-For", ip);
  if (token) req.set("Authorization", `Bearer user:${token}`);
  return req.send({ personaId, message: mensagem, ...(contexto === undefined ? {} : { contexto }), ...(lang ? { lang } : {}) });
}

function assinaturaAtiva(userId, { status = "active" } = {}) {
  const agora = new Date().toISOString();
  db.prepare(
    `INSERT INTO subscriptions (correlation_code, couple_name, status, provider, plan, scope,
                                supabase_user_id, account_email, linked_at, linked_by, created_at, updated_at)
     VALUES (?, NULL, ?, 'hotmart', 'trial', 'solo', ?, ?, ?, 'checkout', ?, ?)`
  ).run(`code-${userId}`, status, userId, `${userId}@example.com`, agora, agora, agora);
}

function cotaUsada(userId, bucket) {
  const row = db
    .prepare(
      "SELECT used FROM ai_free_quota WHERE subject_type = 'account' AND subject_id = ? AND bucket = ? AND period = 'lifetime'"
    )
    .get(userId, bucket);
  return row ? row.used : 0;
}

// res.on("finish") (o estorno) roda logo depois de a resposta ser liberada;
// um tick é suficiente e evita teste piscante.
const respira = () => new Promise((r) => setTimeout(r, 20));

const ROTAS_COM_FOTO = ["/api/palm", "/api/face", "/api/foot", "/api/moles", "/api/coffee"];
const ROTAS_DE_TEXTO = [
  ["/api/chat", { personaId: "luna", message: "oi" }],
  ["/api/dream", { dreamText: "sonhei com o mar" }],
  ["/api/enhance-insight", { transcript: "falei isso", readingType: "tarot", readingTitle: "A Torre" }],
  ["/api/weekly-insight", { readings: [{ title: "a", body: "b" }] }],
  ["/api/coffee-weekly-summary", { readings: [{ title: "a", body: "b" }] }],
];

// =============================================================================
// 0) Contrato opcional de contexto do chat
// =============================================================================

test("chat antigo sem contexto continua compatível e mantém pt como idioma padrão", async () => {
  const resp = await chat(novoIp());
  assert.equal(resp.status, 200);
  const args = chamadasChat.at(-1);
  assert.equal(args.personaId, "luna");
  assert.equal(args.contexto, undefined);
  assert.equal(args.lang, "pt");
});

test("chat repassa para Órbi somente o contexto canônico saneado e preserva lang", async () => {
  const contexto = {
    sign: "Virgem",
    intent: "work",
    situation: "workBlock",
    outcome: "nextStep",
  };
  const resp = await chat(novoIp(), { personaId: "orbi", contexto, lang: "en" });
  assert.equal(resp.status, 200);
  const args = chamadasChat.at(-1);
  assert.equal(args.personaId, "orbi");
  assert.deepEqual({ ...args.contexto }, contexto);
  assert.equal(args.lang, "en");
});

test("chat recusa contexto incompleto ou com qualquer campo extra antes de chamar a IA", async () => {
  const valido = {
    sign: "Virgem",
    intent: "work",
    situation: "workBlock",
    outcome: "nextStep",
  };
  const invalidos = [
    { sign: "Virgem", intent: "work", situation: "workBlock" },
    { ...valido, pergunta: "ele vai voltar?" },
    { ...valido, nota: "texto privado" },
    { ...valido, diario: [{ body: "texto privado" }] },
  ];

  for (const contexto of invalidos) {
    const antes = chamadasChat.length;
    const resp = await chat(novoIp(), { personaId: "orbi", contexto });
    assert.equal(resp.status, 400);
    assert.equal(resp.body.code, "invalid_chat_context");
    assert.equal(chamadasChat.length, antes, "contexto recusado não pode alcançar o provider");
  }
});

// =============================================================================
// 1) O ATAQUE (b): curl sem token nenhum
// =============================================================================

test("as 5 rotas com FOTO exigem conta — curl sem token é barrado e a IA nunca é chamada", async () => {
  const antes = chamadasDeIa;
  for (const rota of ROTAS_COM_FOTO) {
    const resp = await supertest(app)
      .post(rota)
      .set("X-Forwarded-For", novoIp())
      .send({ imageBase64: "Zm90bw==", mediaType: "image/jpeg" });
    assert.equal(resp.status, 401, `${rota} deveria exigir conta`);
    assert.equal(resp.body.code, "login_required", `${rota} precisa dizer POR QUE barrou`);
  }
  assert.equal(chamadasDeIa, antes, "nenhuma chamada paga pode ter acontecido");
});

test("rota de TEXTO deslogada funciona (é o que traz cliente) mas com cota pequena por IP+dia", async () => {
  const ip = novoIp();
  const teto = limits().anonDaily;
  for (let i = 0; i < teto; i += 1) {
    const resp = await chat(ip);
    assert.equal(resp.status, 200, `a ${i + 1}ª chamada anônima deveria passar`);
  }
  const barrada = await chat(ip);
  assert.equal(barrada.status, 402, "acabou a cota do IP");
  assert.equal(barrada.body.code, "quota_exhausted");
  assert.equal(barrada.body.scope, "ip");
  assert.equal(barrada.body.loginHelps, true, "criar conta ainda destrava — o app precisa saber disso");
});

test("cota anônima é por IP: outro IP começa do zero (e é justamente por isso que ela é pequena)", async () => {
  const ip1 = novoIp();
  for (let i = 0; i < limits().anonDaily; i += 1) await chat(ip1);
  assert.equal((await chat(ip1)).status, 402);
  assert.equal((await chat(novoIp())).status, 200);
});

// =============================================================================
// 2) O ATAQUE (a): a cota é da CONTA, não do aparelho
// =============================================================================

test("não-assinante logado gasta a cota grátis do chat e é barrado na seguinte", async () => {
  const user = novoUsuario();
  const ip = novoIp();
  const teto = limits().buckets.chat;
  for (let i = 0; i < teto; i += 1) {
    const resp = await chat(ip, { token: user });
    assert.equal(resp.status, 200, `a ${i + 1}ª mensagem grátis deveria passar`);
  }
  const barrada = await chat(ip, { token: user });
  assert.equal(barrada.status, 402);
  assert.equal(barrada.body.code, "quota_exhausted");
  assert.equal(barrada.body.scope, "account");
  assert.equal(barrada.body.bucket, "chat");
  assert.equal(barrada.body.upgrade, true);
});

test("LIMPAR O APARELHO NÃO DEVOLVE NADA: mesma conta, outro IP (= outro navegador, storage zerado) continua barrada", async () => {
  const user = novoUsuario();
  for (let i = 0; i < limits().buckets.chat; i += 1) await chat(novoIp(), { token: user });
  // Cada chamada acima saiu de um IP diferente de propósito: se a cota fosse
  // por IP (ou por aparelho, como era antes), nenhuma delas contaria junto.
  const barrada = await chat(novoIp(), { token: user });
  assert.equal(barrada.status, 402, "era exatamente isso que o localStorage.clear() burlava");
  assert.equal(barrada.body.scope, "account");
});

test("a cota anônima do IP e a cota da conta são baldes SEPARADOS — logar não é castigo", async () => {
  const ip = novoIp();
  for (let i = 0; i < limits().anonDaily; i += 1) await chat(ip);
  assert.equal((await chat(ip)).status, 402, "anônimo esgotado");
  // Do MESMO IP, agora logado: ganha a cota da conta, inteira.
  const user = novoUsuario();
  assert.equal((await chat(ip, { token: user })).status, 200);
});

test("baldes por feature não se contaminam: estourar o chat não fecha o sonho", async () => {
  const user = novoUsuario();
  const ip = novoIp();
  for (let i = 0; i < limits().buckets.chat; i += 1) await chat(ip, { token: user });
  assert.equal((await chat(ip, { token: user })).status, 402);

  const sonho = await supertest(app)
    .post("/api/dream")
    .set("X-Forwarded-For", ip)
    .set("Authorization", `Bearer user:${user}`)
    .send({ dreamText: "sonhei com o mar" });
  assert.equal(sonho.status, 200);
});

// =============================================================================
// 3) Assinante passa
// =============================================================================

test("ASSINANTE passa sem cota — muito além do teto grátis — e não gasta linha nenhuma de cota", async () => {
  const user = novoUsuario();
  assinaturaAtiva(user);
  const ip = novoIp();
  const quantidade = limits().buckets.chat + limits().total + 3;
  for (let i = 0; i < quantidade; i += 1) {
    const resp = await chat(ip, { token: user });
    assert.equal(resp.status, 200, `assinante levou paywall na ${i + 1}ª chamada`);
  }
  assert.equal(cotaUsada(user, "chat"), 0, "assinante não consome cota grátis");
  assert.equal(cotaUsada(user, "__total"), 0);
});

test("assinante em past_due (janela de dunning) continua passando — mesma regra do /me", async () => {
  const user = novoUsuario();
  assinaturaAtiva(user, { status: "past_due" });
  const ip = novoIp();
  for (let i = 0; i < limits().buckets.chat + 2; i += 1) {
    assert.equal((await chat(ip, { token: user })).status, 200);
  }
});

test("assinante passa nas rotas com FOTO, que o deslogado nem alcança", async () => {
  const user = novoUsuario();
  assinaturaAtiva(user);
  const ip = novoIp();
  for (const rota of ROTAS_COM_FOTO) {
    const resp = await supertest(app)
      .post(rota)
      .set("X-Forwarded-For", ip)
      .set("Authorization", `Bearer user:${user}`)
      .send({ imageBase64: "Zm90bw==", mediaType: "image/jpeg" });
    assert.equal(resp.status, 200, `${rota} barrou um assinante`);
  }
});

test("cancelado NÃO é assinante: cai na cota grátis como qualquer um", async () => {
  const user = novoUsuario();
  assinaturaAtiva(user, { status: "cancelled" });
  const ip = novoIp();
  for (let i = 0; i < limits().buckets.chat; i += 1) {
    assert.equal((await chat(ip, { token: user })).status, 200);
  }
  assert.equal((await chat(ip, { token: user })).status, 402);
});

test("quem assina DEPOIS de estourar a cota entra na hora (o cache de acesso nunca segura um 402)", async () => {
  const user = novoUsuario();
  const ip = novoIp();
  for (let i = 0; i < limits().buckets.chat; i += 1) await chat(ip, { token: user });
  assert.equal((await chat(ip, { token: user })).status, 402, "sem assinatura, barrado");

  // A compra acontece agora — sem reiniciar o processo, sem esperar o TTL.
  assinaturaAtiva(user);
  assert.equal(
    (await chat(ip, { token: user })).status,
    200,
    "cache de 5min não pode fazer quem acabou de pagar levar paywall"
  );
});

// =============================================================================
// 4) Teto agregado e estorno
// =============================================================================

test("teto agregado da conta limita o total, mesmo espalhando entre features diferentes", async () => {
  const anterior = process.env.AI_FREE_TOTAL;
  process.env.AI_FREE_TOTAL = "2";
  try {
    const user = novoUsuario();
    const ip = novoIp();
    assert.equal((await chat(ip, { token: user })).status, 200);
    const sonho = await supertest(app)
      .post("/api/dream")
      .set("X-Forwarded-For", ip)
      .set("Authorization", `Bearer user:${user}`)
      .send({ dreamText: "sonhei" });
    assert.equal(sonho.status, 200);
    // 3ª chamada: o balde do chat ainda teria vaga (limite 2), mas o total não.
    const terceira = await chat(ip, { token: user });
    assert.equal(terceira.status, 402);
    assert.equal(terceira.body.bucket, "__total");
    await respira();
    // A reserva é uma transação: o balde do chat ainda tinha vaga e chegou a
    // ser incrementado antes de o teto agregado negar — se o rollback não
    // funcionasse, a pessoa perderia uma leitura grátis por uma chamada que
    // nunca aconteceu.
    assert.equal(cotaUsada(user, "chat"), 1, "cobrança parcial: a transação da cota não reverteu");
    assert.equal(cotaUsada(user, "__total"), 2);
  } finally {
    if (anterior === undefined) delete process.env.AI_FREE_TOTAL;
    else process.env.AI_FREE_TOTAL = anterior;
  }
});

test("chamada que FALHA não gasta cota (a reserva é estornada) — nem o balde, nem o total", async () => {
  const user = novoUsuario();
  const ip = novoIp();
  // 400: message acima de CHAT_MESSAGE_MAX_LENGTH.
  const resp = await chat(ip, { token: user, mensagem: "x".repeat(501) });
  assert.equal(resp.status, 400);
  await respira();
  assert.equal(cotaUsada(user, "chat"), 0, "erro de validação não pode consumir leitura grátis");
  assert.equal(cotaUsada(user, "__total"), 0);
  // E a cota continua inteira de verdade:
  for (let i = 0; i < limits().buckets.chat; i += 1) {
    assert.equal((await chat(ip, { token: user })).status, 200);
  }
});

test("duas chamadas simultâneas da mesma conta não furam a cota (reserva atômica)", async () => {
  const user = novoUsuario();
  const ip = novoIp();
  const teto = limits().buckets.chat;
  const respostas = await Promise.all(
    Array.from({ length: teto + 4 }, () => chat(ip, { token: user }))
  );
  const ok = respostas.filter((r) => r.status === 200).length;
  const barradas = respostas.filter((r) => r.status === 402).length;
  assert.equal(ok, teto, "passou mais gente do que a cota permite");
  assert.equal(barradas, 4);
});

// =============================================================================
// 5) Allowlist de dono e canary
// =============================================================================

test("dono na OWNER_EMAILS passa sem cota (mesma allowlist que o /me já respeita)", async () => {
  const user = novoUsuario();
  const anterior = process.env.OWNER_EMAILS;
  process.env.OWNER_EMAILS = `${user}@example.com`;
  try {
    const ip = novoIp();
    for (let i = 0; i < limits().buckets.chat + 3; i += 1) {
      assert.equal((await chat(ip, { token: user })).status, 200);
    }
    assert.equal(cotaUsada(user, "chat"), 0);
  } finally {
    if (anterior === undefined) delete process.env.OWNER_EMAILS;
    else process.env.OWNER_EMAILS = anterior;
  }
});

test("o canary (loopback, sem X-Forwarded-For) é isento — senão o monitoramento morre em silêncio", async () => {
  // Esgota o balde do próprio loopback primeiro, SEM o header do canary.
  for (let i = 0; i < limits().anonDaily; i += 1) {
    await supertest(app).post("/api/chat").send({ personaId: "luna", message: "oi" });
  }
  const semCanary = await supertest(app).post("/api/chat").send({ personaId: "luna", message: "oi" });
  assert.equal(semCanary.status, 402, "loopback comum também tem cota");

  const canary = await supertest(app)
    .post("/api/chat")
    .set("X-Canary", "1")
    .send({ personaId: "luna", message: "oi" });
  assert.equal(canary.status, 200, "o canary precisa continuar fazendo uma chamada REAL");
});

// =============================================================================
// 6) Teto de corpo: 10 MB só faz sentido onde entra foto
// =============================================================================

test("corpo gigante é rejeitado nas rotas de TEXTO e aceito nas de foto", async () => {
  const grande = "x".repeat(400 * 1024);
  const user = novoUsuario();
  assinaturaAtiva(user);

  const texto = await supertest(app)
    .post("/api/chat")
    .set("X-Forwarded-For", novoIp())
    .set("Authorization", `Bearer user:${user}`)
    .send({ personaId: "luna", message: "oi", history: [{ role: "user", content: grande }] });
  assert.equal(texto.status, 413, "um corpo de 400kb numa rota de texto não tem uso legítimo");

  const foto = await supertest(app)
    .post("/api/palm")
    .set("X-Forwarded-For", novoIp())
    .set("Authorization", `Bearer user:${user}`)
    .send({ imageBase64: grande, mediaType: "image/jpeg" });
  assert.equal(foto.status, 200, "foto em base64 continua passando — é pra isso que o teto grande existe");
});

// =============================================================================
// 7) O GATE ESTÁ MONTADO NAS 10 ROTAS
// (um gate perfeito que ninguém montou não protege nada — ver /api/track)
// =============================================================================

test("MOUNT: as 5 rotas de texto estão todas atrás da cota anônima", async () => {
  for (const [rota, corpo] of ROTAS_DE_TEXTO) {
    const ip = novoIp();
    for (let i = 0; i < limits().anonDaily; i += 1) {
      await supertest(app).post(rota).set("X-Forwarded-For", ip).send(corpo);
    }
    const resp = await supertest(app).post(rota).set("X-Forwarded-For", ip).send(corpo);
    assert.equal(resp.status, 402, `${rota} não está atrás da cota`);
    assert.equal(resp.body.code, "quota_exhausted", `${rota} não devolve um code reconhecível`);
  }
});

test("MOUNT: as 10 rotas de IA aplicam cota de conta (nenhuma ficou de fora)", async () => {
  const todas = [...ROTAS_DE_TEXTO, ...ROTAS_COM_FOTO.map((r) => [r, { imageBase64: "Zm90bw==", mediaType: "image/jpeg" }])];
  assert.equal(todas.length, 10, "se este número mudar, é porque uma rota de IA nasceu sem teste");

  const anterior = process.env.AI_FREE_TOTAL;
  process.env.AI_FREE_TOTAL = "0"; // ninguém tem cota grátis nenhuma
  try {
    for (const [rota, corpo] of todas) {
      const user = novoUsuario();
      const resp = await supertest(app)
        .post(rota)
        .set("X-Forwarded-For", novoIp())
        .set("Authorization", `Bearer user:${user}`)
        .send(corpo);
      assert.equal(resp.status, 402, `${rota} deixou passar sem cota e sem assinatura`);
      assert.equal(resp.body.code, "quota_exhausted");
    }
  } finally {
    if (anterior === undefined) delete process.env.AI_FREE_TOTAL;
    else process.env.AI_FREE_TOTAL = anterior;
  }
});

test("AI_ANON_VISION=1 abre as rotas com foto pro deslogado, mas SEMPRE dentro da cota anônima", async () => {
  const anterior = process.env.AI_ANON_VISION;
  process.env.AI_ANON_VISION = "1";
  try {
    const ip = novoIp();
    const foto = { imageBase64: "Zm90bw==", mediaType: "image/jpeg" };
    for (let i = 0; i < limits().anonDaily; i += 1) {
      const resp = await supertest(app).post("/api/palm").set("X-Forwarded-For", ip).send(foto);
      assert.equal(resp.status, 200, `a ${i + 1}ª deveria passar com a válvula aberta`);
    }
    const barrada = await supertest(app).post("/api/palm").set("X-Forwarded-For", ip).send(foto);
    assert.equal(barrada.status, 402, "abrir a rota nunca pode significar abrir SEM cota");
  } finally {
    if (anterior === undefined) delete process.env.AI_ANON_VISION;
    else process.env.AI_ANON_VISION = anterior;
  }
});

test("com a válvula fechada (padrão), a rota com foto volta a exigir conta", async () => {
  const resp = await supertest(app)
    .post("/api/palm")
    .set("X-Forwarded-For", novoIp())
    .send({ imageBase64: "Zm90bw==", mediaType: "image/jpeg" });
  assert.equal(resp.status, 401);
  assert.equal(resp.body.code, "login_required");
});

test("o IP nunca é gravado em claro na tabela de cota (mesma regra de funnel_events)", async () => {
  const ip = "198.51.100.77";
  await chat(ip);
  const linhas = db.prepare("SELECT subject_id FROM ai_free_quota WHERE subject_type = 'ip'").all();
  assert.ok(linhas.length > 0);
  for (const l of linhas) {
    assert.ok(!l.subject_id.includes(ip), "IP em claro no banco");
    assert.match(l.subject_id, /^[0-9a-f]{32}$/, "subject_id anônimo deve ser hash hex");
  }
});
