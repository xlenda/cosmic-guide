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
const vm = require("node:vm");

const TEST_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "forja-test-painel-"));
process.env.DATA_DIR = TEST_DATA_DIR;

const express = require("express");
const supertest = require("supertest");
const { buildPainelRouter, _paraTestes } = require("../src/http/painelRoutes");
const { trackRouter } = require("../src/http/trackRoutes");
const { db } = require("../src/infrastructure/db");

const TOKEN = "token-de-teste-bem-grande-1234567890";

function appCom(adminToken) {
  const app = express();
  app.use(buildPainelRouter({ adminToken }));
  return app;
}

function appComTracking(adminToken) {
  const app = express();
  app.use("/api/track", trackRouter);
  app.use(buildPainelRouter({ adminToken }));
  return app;
}

async function executarPainelNoNavegador(casca, fetchImpl) {
  const script = casca.match(/<script>([\s\S]*)<\/script>/)?.[1];
  assert.ok(script, "casca sem script");
  const semCargaAutomatica = script.replace(/carregar\(\); setInterval\(carregar, 60000\);\s*$/, "");
  assert.notEqual(semCargaAutomatica, script, "não encontrou a carga automática da casca");

  const elementos = Object.fromEntries(
    ["login", "painel", "erro", "estado", "tok"].map((id) => [id, { id, style: {}, textContent: "", innerHTML: "", value: "" }])
  );
  const storage = new Map([["cg-painel-token", TOKEN]]);
  const contexto = vm.createContext({
    URL,
    URLSearchParams,
    location: { href: "https://cosmicguide.cloud/painel", reload() {} },
    history: { replaceState() {} },
    localStorage: {
      getItem(chave) { return storage.get(chave) || null; },
      setItem(chave, valor) { storage.set(chave, String(valor)); },
      removeItem(chave) { storage.delete(chave); },
    },
    document: { getElementById(id) { return elementos[id]; } },
    fetch: fetchImpl,
    AbortController,
    setTimeout,
    clearTimeout,
    setInterval() {},
    alert() {},
    prompt() { return ""; },
    confirm() { return false; },
    console,
  });

  new vm.Script(semCargaAutomatica).runInContext(contexto);
  await new vm.Script("carregar()").runInContext(contexto);
  return { elementos, contexto };
}

async function renderizarPainelNoNavegador(casca, metricas) {
  const { elementos } = await executarPainelNoNavegador(
    casca,
    async () => ({ ok: true, status: 200, json: async () => metricas })
  );
  return elementos.painel.innerHTML;
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
  assert.match(res.text, /Suspender pessoa/);
  assert.match(res.text, /Reverter suspensão/);
  assert.match(res.text, /revisar de manhã e à noite/);

  // Compila o JavaScript que o navegador realmente recebe. O Painel já
  // quebrou por escape de aspas dentro da template literal do Node; node
  // --check no arquivo externo não enxerga erro dentro deste <script>.
  const script = res.text.match(/<script>([\s\S]*)<\/script>/)?.[1];
  assert.ok(script, "casca sem script");
  assert.doesNotThrow(() => new Function(script));
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

test("métricas expõem cadência, suspensões e histórico append-only", async () => {
  const antiga = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
  const report = db
    .prepare(
      `INSERT INTO moderation_reports
         (kind, target_id, target_user_id, reporter_id, reason, detail, content, status, created_at)
       VALUES ('post', '77', 'painel-user', 'reporter', 'assédio', NULL, 'conteúdo da prova', 'open', ?)`
    )
    .run(antiga);
  db.prepare(
    `INSERT INTO social_suspensions (user_id, report_id, reason, created_at)
     VALUES ('suspenso-painel', ?, 'revisão manual', ?)`
  ).run(report.lastInsertRowid, antiga);
  db.prepare(
    `INSERT INTO moderation_actions (report_id, action, reason, created_at)
     VALUES (?, 'suspend', 'revisão manual', ?)`
  ).run(report.lastInsertRowid, antiga);

  const ok = await supertest(appCom(TOKEN)).get("/api/admin/metrics").set("X-Admin-Token", TOKEN);
  assert.equal(ok.status, 200);
  assert.ok(ok.body.denuncias.abertas >= 1);
  assert.ok(ok.body.denuncias.vencidas24h >= 1);
  assert.equal(ok.body.denuncias.maisAntigaEm, antiga);
  assert.ok(ok.body.denuncias.fila.some((item) => item.target_user_id === "painel-user"));
  assert.ok(ok.body.suspensoes.some((item) => item.user_id === "suspenso-painel"));
  assert.ok(ok.body.acoesModeracao.some((item) => item.action === "suspend" && item.reason === "revisão manual"));
});

test("fila prioriza as denúncias mais antigas mesmo quando há mais de 30 abertas", async () => {
  const maisAntiga = "2001-01-01T00:00:00.000Z";
  db.prepare(
    `INSERT INTO moderation_reports
       (kind, target_id, target_user_id, reporter_id, reason, detail, content, status, created_at)
     VALUES ('ai', NULL, NULL, NULL, 'segurança', NULL, 'prioridade antiga', 'open', ?)`
  ).run(maisAntiga);

  const insert = db.prepare(
    `INSERT INTO moderation_reports
       (kind, target_id, target_user_id, reporter_id, reason, detail, content, status, created_at)
     VALUES ('ai', NULL, NULL, NULL, 'spam', NULL, ?, 'open', ?)`
  );
  for (let index = 0; index < 31; index += 1) {
    insert.run(`recente ${index}`, `2026-08-24T12:${String(index).padStart(2, "0")}:00.000Z`);
  }

  const ok = await supertest(appCom(TOKEN)).get("/api/admin/metrics").set("X-Admin-Token", TOKEN);
  assert.equal(ok.status, 200);
  assert.equal(ok.body.denuncias.fila.length, 30);
  assert.equal(ok.body.denuncias.fila[0].quando, "2001-01-01T00:00");
  assert.equal(ok.body.denuncias.fila[0].trecho, "prioridade antiga");
});

test("plan hostil vindo da rota pública é texto escapado no innerHTML do painel", async () => {
  const hostil = "<svg/onload=alert(1)>";
  const app = appComTracking(TOKEN);
  await supertest(app)
    .post("/api/track")
    .send({
      sessionId: "sessao-xss-painel-1234",
      events: [{ event: "plan_select", props: { plan: hostil } }],
    })
    .expect(204);

  const metricas = await supertest(app).get("/api/admin/metrics").set("X-Admin-Token", TOKEN).expect(200);
  assert.ok(
    metricas.body.planosClicados.some((item) => item.plano === hostil),
    "o payload precisa atravessar o caminho real /api/track → SQLite → métricas"
  );

  const casca = await supertest(app).get("/painel").expect(200);
  const renderizado = await renderizarPainelNoNavegador(casca.text, metricas.body);
  assert.ok(renderizado.includes("&lt;svg/onload=alert(1)&gt;"), "o plano deve continuar legível como texto");
  assert.equal(renderizado.includes(hostil), false, "a tag hostil não pode chegar crua ao innerHTML");
});

test("falha nas tabelas de moderação nunca pinta uma fila falsamente zerada", async () => {
  const app = appCom(TOKEN);
  db.exec("BEGIN");
  try {
    db.exec("ALTER TABLE moderation_reports RENAME TO moderation_reports_indisponivel");
    const metricas = await supertest(app).get("/api/admin/metrics").set("X-Admin-Token", TOKEN);
    assert.equal(metricas.status, 200);
    assert.equal(metricas.body.denuncias, null);
    assert.equal(metricas.body.suspensoes, null);
    assert.equal(metricas.body.acoesModeracao, null);

    const casca = await supertest(app).get("/painel").expect(200);
    const renderizado = await renderizarPainelNoNavegador(casca.text, metricas.body);
    assert.match(renderizado, /Fila de denúncias indisponível/);
    assert.match(renderizado, /Participações suspensas indisponíveis/);
    assert.match(renderizado, /Histórico de moderação indisponível/);
    assert.equal(renderizado.includes("Fila aberta zerada"), false);
  } finally {
    db.exec("ROLLBACK");
  }
});

test("refresh com erro mantém os dados anteriores, mas exibe alerta visível de desatualização", async () => {
  const casca = await supertest(appCom(TOKEN)).get("/painel").expect(200);
  const metricas = {
    geradoEm: "2026-08-24T15:30:00.000Z",
    hoje: "2026-08-24",
    denuncias: { abertas: 0, vencidas24h: 0, maisAntigaEm: null, fila: [] },
    suspensoes: [],
    acoesModeracao: [],
  };
  let chamada = 0;
  const { elementos, contexto } = await executarPainelNoNavegador(casca.text, async () => {
    chamada += 1;
    if (chamada === 1) return { ok: true, status: 200, json: async () => metricas };
    if (chamada === 2) return { ok: false, status: 500, json: async () => ({}) };
    throw new Error("rede fora");
  });

  assert.match(elementos.painel.innerHTML, /Fila aberta zerada/);
  assert.equal(elementos.estado.style.display, "none");

  await new vm.Script("carregar()").runInContext(contexto);
  assert.equal(elementos.estado.style.display, "block");
  assert.match(elementos.estado.textContent, /Dados desatualizados/);
  assert.match(elementos.estado.textContent, /não significa fila zero/);
  assert.match(elementos.painel.innerHTML, /Fila aberta zerada/, "dados anteriores ficam visíveis sob o alerta");

  await new vm.Script("carregar()").runInContext(contexto);
  assert.equal(elementos.estado.style.display, "block");
  assert.match(elementos.estado.textContent, /alcançar o servidor/);
});

test("resposta antiga de refresh não sobrescreve um carregamento mais novo", async () => {
  const casca = await supertest(appCom(TOKEN)).get("/painel").expect(200);
  const base = {
    geradoEm: "2026-08-24T15:30:00.000Z",
    hoje: "2026-08-24",
    denuncias: { abertas: 0, vencidas24h: 0, maisAntigaEm: null, fila: [] },
    suspensoes: [],
    acoesModeracao: [],
  };
  let chamada = 0;
  let resolverAntiga;
  const antiga = new Promise((resolve) => { resolverAntiga = resolve; });
  const resposta = (metricas) => ({ ok: true, status: 200, json: async () => metricas });
  const { elementos, contexto } = await executarPainelNoNavegador(casca.text, async () => {
    chamada += 1;
    if (chamada === 1) return resposta(base);
    if (chamada === 2) return antiga;
    return resposta({ ...base, hoje: "NOVO", geradoEm: "2026-08-24T16:00:00.000Z" });
  });

  const cargaAntiga = new vm.Script("carregar()").runInContext(contexto);
  const cargaNova = new vm.Script("carregar()").runInContext(contexto);
  await cargaNova;
  assert.match(elementos.painel.innerHTML, /NOVO/);

  resolverAntiga(resposta({ ...base, hoje: "ANTIGO", geradoEm: "2026-08-24T14:00:00.000Z" }));
  await cargaAntiga;
  assert.match(elementos.painel.innerHTML, /NOVO/);
  assert.doesNotMatch(elementos.painel.innerHTML, /ANTIGO/);
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
