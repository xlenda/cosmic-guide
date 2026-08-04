// Teste HTTP de ponta a ponta do rastreamento de funil (POST /api/track)
// contra o Express e o SQLite reais (DATA_DIR isolado num diretório
// temporário), no mesmo padrão de socialRoutes.http.test.js /
// adminRoutes.http.test.js.
//
// O que está sendo travado aqui é o par que faz uma rota PÚBLICA de telemetria
// ser segura de existir:
//   1) só evento da ALLOWLIST entra — sem isso a rota vira uma porta aberta
//      pra qualquer um encher a tabela (e o disco) com o que quiser;
//   2) todo teto é de verdade (tamanho do lote, tamanho/forma do props) e a
//      rota NUNCA lança — telemetria não pode derrubar nem atrasar o app.
// E o terceiro, que é o motivo do módulo existir: lote válido GRAVA, porque
// funil que não grava não responde "onde as 40 pessoas pararam".
//
// Como rodar (no servidor, dentro de /root/forja-backend):
//   node --test test/trackRoutes.http.test.js
//   (ou `npm test`, que já varre test/)
//
// A maior parte dos testes monta o router num app express mínimo, aqui dentro:
// isola a rota e deixa exercitar validação sem arrastar o server.js inteiro.
// Os DOIS ÚLTIMOS testes são diferentes de propósito — eles batem no app REAL
// (require("../src/http/server")) e FALHAM se a linha de mount não estiver lá
// ou se a ordem dos middlewares engolir o corpo do sendBeacon. Um router
// perfeito que ninguém montou não coleta nada, e essa é exatamente a falha que
// este arquivo já deixou passar uma vez.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

// DATA_DIR precisa ser setado ANTES de qualquer require que puxe
// src/infrastructure/db.js (é lá que o arquivo do SQLite é aberto).
const TEST_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "forja-test-track-"));
process.env.DATA_DIR = TEST_DATA_DIR;
process.env.ALLOWED_ORIGIN = "http://localhost";
process.env.HOTMART_HOTTOK = "test-hottok-secret";
process.env.HOTMART_OFFER_CODE = "test-offer-code";
process.env.ADMIN_TOKEN = "test-admin-token-1234";

const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const supertest = require("supertest");

const { trackRouter, EVENTS, MAX_BATCH, MAX_PROPS_JSON } = require("../src/http/trackRoutes");
const { db } = require("../src/infrastructure/db");

const app = express();
app.use("/api/track", trackRouter);
// Middleware de erro central igual ao do server.js — se algum dia a rota
// deixar de tratar um corpo malformado, o teste "nunca lança" vê o 500 daqui
// em vez de um erro silencioso.
app.use((err, _req, res, _next) => {
  console.error("[teste] erro não tratado:", err && err.message);
  res.status(500).json({ error: "erro interno" });
});

test.after(() => {
  fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
});

let contador = 0;
function novaSessao() {
  contador += 1;
  return `sessao-de-teste-${String(contador).padStart(4, "0")}`;
}

function contarNoBanco(sessionId) {
  return db.prepare("SELECT COUNT(*) AS c FROM funnel_events WHERE session_id = ?").get(sessionId).c;
}

function post(corpo, sessionId) {
  return supertest(app).post("/api/track").send({ sessionId, ...corpo });
}

// ---------------------------------------------------------------------------
// 1) ALLOWLIST — a trava principal de uma rota pública
// ---------------------------------------------------------------------------

test("evento FORA da allowlist é rejeitado e não grava nada", async () => {
  const sid = novaSessao();
  const res = await post({ events: [{ event: "evento_inventado" }] }, sid);
  assert.equal(res.status, 400);
  assert.equal(contarNoBanco(sid), 0);
});

test("nome de evento hostil (SQL, path, gigante, tipo errado) nunca entra", async () => {
  const sid = novaSessao();
  for (const event of [
    "'; DROP TABLE funnel_events; --",
    "app_open; DROP TABLE funnel_events",
    "APP_OPEN", // allowlist é sensível a caixa: nome estável é nome exato
    "app_open ", // com espaço até passa (trim), então o par abaixo é o que prova
    "app_open2",
    "../../etc/passwd",
    "x".repeat(500),
    "",
    42,
    null,
    { toString: () => "app_open" },
    ["app_open"],
  ]) {
    const res = await supertest(app).post("/api/track").send({ sessionId: sid, events: [{ event }] });
    const esperado = typeof event === "string" && event.trim() === "app_open" ? 204 : 400;
    assert.equal(res.status, esperado, `event=${JSON.stringify(event)}`);
  }
  // Só o "app_open " (com espaço) sobreviveu, e gravou o nome já normalizado.
  assert.equal(contarNoBanco(sid), 1);
  const row = db.prepare("SELECT event FROM funnel_events WHERE session_id = ?").get(sid);
  assert.equal(row.event, "app_open");
});

test("um único evento inválido derruba o LOTE INTEIRO (ou grava tudo, ou nada)", async () => {
  // Meio-lote gravado produziria um funil silenciosamente errado — e funil
  // errado é pior que funil nenhum, porque as decisões continuam sendo tomadas.
  const sid = novaSessao();
  const res = await post(
    { events: [{ event: "app_open" }, { event: "home_view" }, { event: "nao_existe" }] },
    sid
  );
  assert.equal(res.status, 400);
  assert.equal(contarNoBanco(sid), 0);
});

test("todos os eventos da allowlist exportada são aceitos", async () => {
  // Trava o contrato com o agente do app: o que está em EVENTS é exatamente o
  // que a rota aceita — nem um a mais (testes acima), nem um a menos.
  const sid = novaSessao();
  const res = await post({ events: EVENTS.map((event) => ({ event })) }, sid);
  assert.equal(res.status, 204);
  assert.equal(contarNoBanco(sid), EVENTS.length);
});

// ---------------------------------------------------------------------------
// 2) TETOS — lote e props
// ---------------------------------------------------------------------------

test("lote GRANDE DEMAIS é rejeitado (e o do tamanho exato passa)", async () => {
  const sidGrande = novaSessao();
  const grande = await post(
    { events: Array.from({ length: MAX_BATCH + 1 }, () => ({ event: "app_open" })) },
    sidGrande
  );
  assert.equal(grande.status, 400);
  assert.equal(contarNoBanco(sidGrande), 0);

  const sidLimite = novaSessao();
  const noLimite = await post(
    { events: Array.from({ length: MAX_BATCH }, () => ({ event: "app_open" })) },
    sidLimite
  );
  assert.equal(noLimite.status, 204);
  assert.equal(contarNoBanco(sidLimite), MAX_BATCH);
});

test("lote vazio, ausente ou que não é array é rejeitado", async () => {
  const sid = novaSessao();
  for (const events of [[], undefined, null, {}, "app_open", 7]) {
    const res = await supertest(app).post("/api/track").send({ sessionId: sid, events });
    assert.equal(res.status, 400, `events=${JSON.stringify(events)}`);
  }
  assert.equal(contarNoBanco(sid), 0);
});

test("props GIGANTE é rejeitada (valor longo, chaves demais, JSON estourado)", async () => {
  const sid = novaSessao();

  // valor único, longo demais
  const valorLongo = await post({ events: [{ event: "app_open", props: { screen: "x".repeat(500) } }] }, sid);
  assert.equal(valorLongo.status, 400);

  // muitas chaves conhecidas de uma vez
  const muitasChaves = await post(
    {
      events: [
        {
          event: "app_open",
          props: { screen: "a", kind: "b", plan: "c", mode: "d", source: "e", lang: "f", platform: "g" },
        },
      ],
    },
    sid
  );
  assert.equal(muitasChaves.status, 400);

  // soma dos valores estoura o teto do JSON final, mesmo com cada valor válido
  const somaEstoura = await post(
    {
      events: [
        {
          event: "app_open",
          props: {
            screen: "s".repeat(40),
            kind: "k".repeat(40),
            plan: "p".repeat(40),
            mode: "m".repeat(40),
            source: "o".repeat(40),
            lang: "l".repeat(40),
          },
        },
      ],
    },
    sid
  );
  assert.equal(somaEstoura.status, 400);

  assert.equal(contarNoBanco(sid), 0);
});

test("props com chave DESCONHECIDA é rejeitada — é assim que dado pessoal entraria sem querer", async () => {
  const sid = novaSessao();
  for (const props of [
    { email: "ana@example.com" },
    { nome: "Ana" },
    { birthDate: "1990-04-12" },
    { birthCity: "Recife" },
    { readingText: "O tarô disse que..." },
    { userId: "uuid-do-supabase" },
    { screen: "Planos", email: "ana@example.com" }, // metade válida não salva o lote
  ]) {
    const res = await post({ events: [{ event: "paywall_view", props }] }, sid);
    assert.equal(res.status, 400, `props=${JSON.stringify(props)}`);
  }
  assert.equal(contarNoBanco(sid), 0);
});

test("props aninhada/array/tipo estranho é rejeitada", async () => {
  const sid = novaSessao();
  for (const props of [
    { screen: { a: { b: { c: "fundo" } } } },
    { screen: ["Planos"] },
    { screen: null },
    { screen: "" },
    { kind: Number.NaN },
    { kind: Number.POSITIVE_INFINITY },
    ["screen", "Planos"],
    "screen=Planos",
    42,
  ]) {
    const res = await post({ events: [{ event: "app_open", props }] }, sid);
    assert.equal(res.status, 400, `props=${JSON.stringify(props)}`);
  }
  assert.equal(contarNoBanco(sid), 0);
});

// ---------------------------------------------------------------------------
// 3) O CAMINHO FELIZ — grava, e grava só o que pode
// ---------------------------------------------------------------------------

test("lote VÁLIDO grava: 204, uma linha por evento, com props e hora do servidor", async () => {
  const sid = novaSessao();
  const antes = new Date().toISOString();
  const res = await post(
    {
      events: [
        { event: "app_open", props: { platform: "web", lang: "pt" } },
        { event: "onboarding_start" },
        { event: "paywall_view", props: { screen: "Planos", source: "gate" } },
      ],
    },
    sid
  );

  assert.equal(res.status, 204);
  assert.ok(!res.text); // 204 não tem corpo
  const rows = db
    .prepare("SELECT event, props, created_at FROM funnel_events WHERE session_id = ? ORDER BY id")
    .all(sid);
  assert.equal(rows.length, 3);
  assert.deepEqual(
    rows.map((r) => r.event),
    ["app_open", "onboarding_start", "paywall_view"]
  );
  assert.deepEqual(JSON.parse(rows[0].props), { platform: "web", lang: "pt" });
  assert.equal(rows[1].props, null); // sem props = NULL, não "{}"
  assert.deepEqual(JSON.parse(rows[2].props), { screen: "Planos", source: "gate" });
  // created_at é do SERVIDOR (o relógio do aparelho não decide nada aqui).
  assert.ok(rows[0].created_at >= antes);
  assert.ok(rows[0].created_at <= new Date().toISOString());
  assert.ok(rows[0].props.length <= MAX_PROPS_JSON);
});

test("nenhum campo extra do corpo vira coluna: só session_id, event, props e created_at existem", async () => {
  // A garantia de privacidade em forma de teste: mesmo que o app mande dado
  // pessoal no lugar errado do corpo, não existe onde guardar.
  const sid = novaSessao();
  const res = await post(
    {
      events: [{ event: "app_open" }],
      // tudo abaixo é o que NÃO pode ser aceito nem gravado
      email: "ana@example.com",
      userId: "uuid-do-supabase",
      birthDate: "1990-04-12",
      ip: "203.0.113.7",
      readingText: "conteúdo de leitura",
    },
    sid
  );
  assert.equal(res.status, 204);

  const colunas = db
    .prepare("PRAGMA table_info(funnel_events)")
    .all()
    .map((c) => c.name)
    .sort();
  // `country` entrou em 04/08/2026 (migração 015): a SIGLA de duas letras do
  // país, resolvida no ingest — o IP continua sem ter onde ser gravado, e é
  // isso que esta lista fechada segue garantindo.
  assert.deepEqual(colunas, ["country", "created_at", "event", "id", "props", "session_id"]);

  const row = db.prepare("SELECT * FROM funnel_events WHERE session_id = ?").get(sid);
  const gravado = JSON.stringify(row);
  for (const proibido of ["ana@example.com", "uuid-do-supabase", "1990-04-12", "203.0.113.7", "conteúdo"]) {
    assert.equal(gravado.includes(proibido), false, `vazou no banco: ${proibido}`);
  }
});

test("sessionId inválido é rejeitado (e nada é gravado sem sessão anônima válida)", async () => {
  for (const sessionId of [
    undefined,
    null,
    "",
    "curto",
    "x".repeat(200),
    "com espaço no meio 1234",
    "ana@example.com", // o formato barra e-mail: sessão é anônima, ponto
    "sessao/../../etc",
    42,
    { id: "x" },
    ["sessao-valida-1234567890"],
  ]) {
    const res = await supertest(app)
      .post("/api/track")
      .send({ sessionId, events: [{ event: "app_open" }] });
    assert.equal(res.status, 400, `sessionId=${JSON.stringify(sessionId)}`);
  }
});

test("caractere de controle no valor é rejeitado (ANSI no relatório de terminal)", async () => {
  // scripts/funil.js é lido num TERMINAL. Um valor com ESC (0x1b) gravado aqui
  // vira sequência ANSI obedecida na hora de ler o funil — pintar, apagar a
  // tela, esconder linha. Valor legítimo é sempre slug curto ('tarot',
  // 'annual', 'Planos'), então controle nenhum passa.
  const sid = novaSessao();
  for (const valor of ["\u001b[31mtarot", "linha1\nlinha2", "com\ttab", "nulo\u0000dentro", "apc\u009f"]) {
    const res = await post({ events: [{ event: "reading_done", props: { kind: valor } }] }, sid);
    assert.equal(res.status, 400, `valor=${JSON.stringify(valor)}`);
  }
  assert.equal(contarNoBanco(sid), 0);
});

// ---------------------------------------------------------------------------
// 4) APAGAR MEUS DADOS — POST /api/track/forget
//
// A rota que faz o botão "Apagar todos os dados" (PrivacyScreen → clearAll →
// lib/funnel.js resetFunnelSession) valer também DESTE lado. Sem ela, o app
// apagava o uuid do aparelho e as linhas ficavam aqui até a retenção vencer:
// eliminação prometida e cumprida pela metade.
// ---------------------------------------------------------------------------

test("forget apaga TODAS as linhas daquela sessão — e só as dela", async () => {
  const alvo = novaSessao();
  const vizinho = novaSessao();
  await post({ events: [{ event: "app_open" }, { event: "home_view" }, { event: "paywall_view" }] }, alvo);
  await post({ events: [{ event: "app_open" }, { event: "home_view" }] }, vizinho);
  assert.equal(contarNoBanco(alvo), 3);
  assert.equal(contarNoBanco(vizinho), 2);

  const res = await supertest(app).post("/api/track/forget").send({ sessionId: alvo });

  assert.equal(res.status, 204);
  assert.equal(contarNoBanco(alvo), 0, "o rastro da sessão tem que sumir");
  assert.equal(contarNoBanco(vizinho), 2, "e o de mais ninguém pode ser tocado");
});

test("forget nunca conta quantas linhas apagou (não vira oráculo de 'esse uuid existiu?')", async () => {
  // Um contador na resposta deixaria qualquer um testar uuid por uuid pra
  // descobrir quais existiram. A resposta é sempre a mesma: 204, sem corpo.
  const existente = novaSessao();
  await post({ events: [{ event: "app_open" }] }, existente);

  const comDado = await supertest(app).post("/api/track/forget").send({ sessionId: existente });
  const semDado = await supertest(app).post("/api/track/forget").send({ sessionId: "sessao-que-nunca-existiu-01" });

  assert.equal(comDado.status, 204);
  assert.equal(semDado.status, 204);
  assert.equal(comDado.text, semDado.text);
  assert.ok(!comDado.text);
});

test("forget com sessionId inválido é 400 e não apaga nada", async () => {
  const vivo = novaSessao();
  await post({ events: [{ event: "app_open" }] }, vivo);

  for (const sessionId of [undefined, null, "", "curto", "x".repeat(200), "com espaço 1234567", "'; DELETE FROM funnel_events; --", 42, { id: "x" }, ["sessao-valida-1234567890"]]) {
    const res = await supertest(app).post("/api/track/forget").send({ sessionId });
    assert.equal(res.status, 400, `sessionId=${JSON.stringify(sessionId)}`);
  }
  assert.equal(contarNoBanco(vivo), 1, "nenhuma tentativa inválida pode ter apagado nada");
});

test("forget com corpo malformado não vira 500", async () => {
  for (const corpo of ["{não é json", "null", "[]", "123", '"texto"', ""]) {
    const res = await supertest(app).post("/api/track/forget").set("Content-Type", "application/json").send(corpo);
    assert.notEqual(res.status, 500, `corpo=${corpo}`);
    assert.ok(res.status === 400 || res.status === 204);
  }
});

// ---------------------------------------------------------------------------
// 5) A ROTA NUNCA LANÇA — telemetria não derruba nada
// ---------------------------------------------------------------------------

test("corpo malformado nunca vira 500 nem exceção", async () => {
  const total = db.prepare("SELECT COUNT(*) AS c FROM funnel_events").get().c;

  const corpos = [
    "{isso não é json",
    "[]",
    "null",
    '"só uma string"',
    "123",
    "true",
    '{"events":[{"event":"app_open"}]}', // sem sessionId
    '{"sessionId":"sessao-valida-1234567890"}', // sem events
    '{"sessionId":"sessao-valida-1234567890","events":[null]}',
    '{"sessionId":"sessao-valida-1234567890","events":[[]]}',
    '{"sessionId":"sessao-valida-1234567890","events":["app_open"]}',
    '{"sessionId":"sessao-valida-1234567890","events":[{}]}',
    "",
  ];

  for (const corpo of corpos) {
    const res = await supertest(app)
      .post("/api/track")
      .set("Content-Type", "application/json")
      .send(corpo);
    assert.ok(res.status === 400 || res.status === 204, `corpo=${corpo} devolveu ${res.status}`);
    assert.notEqual(res.status, 500, `corpo=${corpo} virou 500`);
  }

  // text/plain É aceito de propósito: navigator.sendBeacon (o único jeito
  // confiável de mandar o último evento antes de a aba fechar) só escapa do
  // preflight de CORS com Content-Type da lista segura. Se este teste virar
  // 400 um dia, o funil perde justamente o evento de quem está indo embora.
  const beacon = await supertest(app)
    .post("/api/track")
    .set("Content-Type", "text/plain")
    .send('{"sessionId":"sessao-beacon-1234567890","events":[{"event":"checkout_click"}]}');
  assert.equal(beacon.status, 204);
  assert.equal(contarNoBanco("sessao-beacon-1234567890"), 1);

  // E dos corpos malformados, NENHUM escreveu (o +1 é só o beacon válido).
  assert.equal(db.prepare("SELECT COUNT(*) AS c FROM funnel_events").get().c, total + 1);
});

test("corpo gigante não derruba o processo", async () => {
  // 2 MB de lixo: com o router montado antes do express.json global (ver a
  // linha de mount no topo de trackRoutes.js) isso bate no teto de 16kb e
  // devolve 413/400; montado depois, cai na validação e devolve 400. Nos dois
  // casos: sem 500, sem exceção, sem processo derrubado.
  const res = await supertest(app)
    .post("/api/track")
    .set("Content-Type", "application/json")
    .send(JSON.stringify({ sessionId: "sessao-valida-1234567890", events: Array.from({ length: 20000 }, () => ({ event: "app_open", props: { screen: "x".repeat(40) } })) }));
  assert.notEqual(res.status, 500);
  assert.notEqual(res.status, 204);
});

// ---------------------------------------------------------------------------
// 6) O MERGE no server.js
// ---------------------------------------------------------------------------

// Este teste FALHA se a linha de mount não estiver no server.js. Ele já foi um
// aviso gentil (`if (res.status === 404) { console.log(...); return; }`) e o
// resultado foi o pior caso possível: os 14 testes acima ficaram verdes, o app
// passou a mandar lote pra /api/track, e a rota respondia 404 pra tudo —
// telemetria 100% perdida, em silêncio, com a suíte inteira dizendo "ok".
// A rota é o produto aqui; um teste que só avisa quando o produto não existe
// não é um teste. Se falhar, cole no server.js (logo depois do cors, antes do
// express.json global — ver o cabeçalho de trackRoutes.js):
//     app.use("/api/track", require("./trackRoutes").trackRouter);
test("a rota está MONTADA no server.js real (senão o app manda pro vazio)", async () => {
  const { app: appReal } = require("../src/http/server");
  const res = await supertest(appReal)
    .post("/api/track")
    .send({ sessionId: novaSessao(), events: [{ event: "app_open" }] });

  assert.notEqual(
    res.status,
    404,
    'a linha de mount não está no server.js — cole, depois do cors e antes do express.json global:\n' +
      '        app.use("/api/track", require("./trackRoutes").trackRouter);'
  );
  assert.equal(res.status, 204);
});

test("o app real aceita o lote de sendBeacon (text/plain) — o evento de quem está saindo", async () => {
  // O caminho de unload passa pelo app INTEIRO, não só pelo router isolado: se
  // um dia o express.json global de 10mb subir pra antes do mount, ele engole o
  // text/plain com o `type` padrão dele e o corpo chega vazio aqui. Este teste é
  // o que trava a ORDEM do middleware, que o teste do router sozinho não vê.
  const { app: appReal } = require("../src/http/server");
  const sid = "sessao-beacon-app-real-01";
  const res = await supertest(appReal)
    .post("/api/track")
    .set("Content-Type", "text/plain")
    .send(JSON.stringify({ sessionId: sid, events: [{ event: "checkout_click" }] }));

  assert.equal(res.status, 204);
  assert.equal(contarNoBanco(sid), 1);
});
