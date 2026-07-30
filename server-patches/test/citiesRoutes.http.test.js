// Teste HTTP de ponta a ponta da busca de cidades (GET /api/cities/*) contra o
// Express e um SQLite REAIS, no mesmo padrão de trackRoutes.http.test.js.
//
// O banco usado aqui não é um mock: é gerado rodando o IMPORTADOR DE VERDADE
// (scripts/import-cities.js --sample) sobre uma amostra de 135 cidades
// recortada, sem alteração nenhuma, do dataset real do GeoNames — Junqueirópolis,
// São Paulo, Köln, Nova York, Tóquio e as 120 maiores cidades brasileiras, com
// os nomes em pt/es/en que o GeoNames publica pra elas. Ou seja: o teste
// exercita o parser do .txt, o esquema, o índice FTS5 e a rota, na mesma
// sequência que a produção. Um mock aqui só provaria que o mock funciona.
//
// O QUE ESTÁ SENDO TRAVADO:
//   1. o relato do testador: "Junqueirópolis" é encontrada, com e sem acento;
//   2. as 3 línguas (o app roda em pt/es/en) acham a MESMA cidade;
//   3. o 503 quando o banco de referência não existe — a rota tem que degradar
//      com uma mensagem clara, nunca derrubar o processo;
//   4. injeção de SQL/FTS não faz nada;
//   5. os tetos (limite de resultados, tamanho de q) são de verdade;
//   6. e o mais importante depois do 3: A LINHA DE MOUNT ESTÁ NO server.js.
//      A rota /api/track já ficou pronta, testada e sem mount uma vez — 15
//      testes verdes e 404 pra tudo. Os testes do bloco final batem no app
//      REAL pra isso não se repetir.
//
// Como rodar (no servidor, dentro de /root/forja-backend):
//   node --test test/citiesRoutes.http.test.js
//   (ou `npm test`, que já varre test/)
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

// DATA_DIR precisa ser setado ANTES de qualquer require que puxe
// src/infrastructure/db.js ou citiesRoutes.js (é onde os caminhos dos bancos
// são resolvidos).
const TEST_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "forja-test-cities-"));
process.env.DATA_DIR = TEST_DATA_DIR;
process.env.CITIES_DB_PATH = path.join(TEST_DATA_DIR, "cities.sqlite");
process.env.ALLOWED_ORIGIN = "http://localhost";
process.env.HOTMART_HOTTOK = "test-hottok-secret";
process.env.HOTMART_OFFER_CODE = "test-offer-code";
process.env.ADMIN_TOKEN = "test-admin-token-1234";

const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const supertest = require("supertest");

const { citiesRouter, MAX_LIMIT, MIN_QUERY_LEN, _resetCitiesDb } = require("../src/http/citiesRoutes");

const app = express();
app.use("/api/cities", citiesRouter);
// Middleware de erro central igual ao do server.js — se algum dia a rota
// deixar de tratar alguma coisa, o teste vê o 500 daqui em vez de um erro
// silencioso.
app.use((err, _req, res, _next) => {
  console.error("[teste] erro não tratado:", err && err.message);
  res.status(500).json({ error: "erro interno" });
});

function get(url) {
  return supertest(app).get(url);
}

test.after(() => {
  // Fecha o handle do SQLite ANTES de apagar o diretório: no Windows um
  // arquivo aberto não pode ser removido (EPERM) e a limpeza derrubaria a
  // suíte inteira no fim, mesmo com todos os testes verdes.
  try {
    _resetCitiesDb();
  } catch (_) {
    /* já fechado */
  }
  try {
    fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  } catch (err) {
    // Limpeza de temporário nunca deve reprovar um teste.
    console.error("[teste] não consegui limpar o diretório temporário:", err && err.message);
  }
});

// ===========================================================================
// 1) O 503 SEM O BANCO — precisa vir ANTES de tudo, porque é o único momento
//    em que o arquivo legitimamente não existe.
//
// Este é o teste que garante que um deploy novo (ou um disco restaurado, ou
// o importador simplesmente não ter rodado ainda) não derruba a API inteira
// por causa de uma lista de cidades. É o mesmo cuidado do preparo preguiçoso
// do trackRoutes com a migração ausente.
// ===========================================================================
test("sem data/cities.sqlite: 503 com instrução clara, e o processo continua de pé", async () => {
  assert.equal(fs.existsSync(process.env.CITIES_DB_PATH), false, "o banco não deveria existir ainda");

  const r = await get("/api/cities/search?q=junqueiropolis");
  assert.equal(r.status, 503);
  assert.match(r.body.error, /indispon/i);
  // A mensagem tem que dizer O QUE FAZER, não só "erro".
  assert.match(r.body.detail, /import-cities\.js/);
  assert.equal(r.headers["retry-after"], "300");
  assert.equal(r.headers["cache-control"], "no-store");

  // A rota por id também, e não só a busca.
  const r2 = await get("/api/cities/gn-3459452");
  assert.equal(r2.status, 503);

  // E chamar de novo continua respondendo 503 (não estoura, não vaza handle).
  const r3 = await get("/api/cities/search?q=sao paulo");
  assert.equal(r3.status, 503);
});

// ===========================================================================
// Gera o banco de referência rodando o IMPORTADOR DE VERDADE, em modo amostra
// (sem rede). Se o importador quebrar, todos os testes abaixo quebram junto —
// que é exatamente o que a gente quer saber.
// ===========================================================================
test("o importador gera o banco a partir da amostra (sem rede)", () => {
  const script = path.join(__dirname, "..", "scripts", "import-cities.js");
  const saida = execFileSync(process.execPath, [script, "--sample", `--out=${process.env.CITIES_DB_PATH}`], {
    encoding: "utf8",
    timeout: 120000,
  });
  assert.match(saida, /IMPORTAÇÃO CONCLUÍDA/);
  // O importador prova a si mesmo: ele roda a busca de "Junqueirópolis" com o
  // MESMO searchCities() da rota e falha (exit 1) se não achar.
  assert.match(saida, /Junqueirópolis EXISTE na busca/);
  assert.equal(fs.existsSync(process.env.CITIES_DB_PATH), true);

  // A rota tinha cacheado o "não existe"; força reabrir agora que existe.
  _resetCitiesDb();
});

// ===========================================================================
// 2) O RELATO DO TESTADOR — com e sem acento
// ===========================================================================
test("acha Junqueirópolis SEM acento (o jeito que se digita no celular)", async () => {
  const r = await get("/api/cities/search?q=junqueiropolis");
  assert.equal(r.status, 200);
  assert.ok(r.body.count >= 1);
  const c = r.body.items[0];
  assert.equal(c.name, "Junqueirópolis");
  assert.equal(c.admin, "SP");
  assert.equal(c.country, "Brasil");
  assert.equal(c.countryCode, "BR");
  // O motivo de tudo isto existir: o fuso IANA, não um número fixo.
  assert.equal(c.timezone, "America/Sao_Paulo");
});

test("acha Junqueirópolis COM acento", async () => {
  const r = await get("/api/cities/search?q=" + encodeURIComponent("Junqueirópolis"));
  assert.equal(r.status, 200);
  assert.equal(r.body.items[0].name, "Junqueirópolis");
});

test("acento é indiferente nos dois sentidos: 'sao paulo' e 'São Paulo' dão o mesmo topo", async () => {
  const semAcento = await get("/api/cities/search?q=sao paulo");
  const comAcento = await get("/api/cities/search?q=" + encodeURIComponent("São Paulo"));
  assert.equal(semAcento.status, 200);
  assert.equal(comAcento.status, 200);
  assert.equal(semAcento.body.items[0].geonameid, comAcento.body.items[0].geonameid);
  assert.equal(semAcento.body.items[0].name, "São Paulo");
});

test("busca por prefixo funciona (é isso que faz a busca-enquanto-digita)", async () => {
  const r = await get("/api/cities/search?q=junqueir");
  assert.equal(r.status, 200);
  const nomes = r.body.items.map((c) => c.name);
  assert.ok(nomes.includes("Junqueirópolis"), `esperava Junqueirópolis em ${JSON.stringify(nomes)}`);
});

// ===========================================================================
// 3) AS TRÊS LÍNGUAS — o app roda em pt/es/en
// ===========================================================================
test("as 3 línguas acham a MESMA cidade pelo nome de cada idioma (Köln)", async () => {
  const pt = await get("/api/cities/search?q=colonia&lang=pt");
  const es = await get("/api/cities/search?q=colonia&lang=es");
  const en = await get("/api/cities/search?q=cologne&lang=en");
  const de = await get("/api/cities/search?q=" + encodeURIComponent("Köln") + "&lang=pt");

  const alema = (r) => r.body.items.find((c) => c.countryCode === "DE");
  assert.ok(alema(pt), "pt não achou a cidade alemã");
  assert.ok(alema(es), "es não achou a cidade alemã");
  assert.ok(alema(en), "en não achou a cidade alemã");
  assert.ok(alema(de), "o nome local (Köln) não achou a cidade alemã");

  const id = alema(pt).geonameid;
  assert.equal(alema(es).geonameid, id);
  assert.equal(alema(en).geonameid, id);
  assert.equal(alema(de).geonameid, id);
});

test("o nome exibido muda com lang (Nova Iorque / Nueva York / New York)", async () => {
  const buscar = async (q, lang) => {
    const r = await get(`/api/cities/search?q=${encodeURIComponent(q)}&lang=${lang}`);
    return r.body.items.find((c) => c.countryCode === "US" && c.admin === "New York");
  };
  const pt = await buscar("nova york", "pt");
  const es = await buscar("nueva york", "es");
  const en = await buscar("new york", "en");
  assert.ok(pt && es && en, "alguma das 3 línguas não achou Nova York");
  assert.equal(pt.geonameid, en.geonameid);
  assert.equal(es.geonameid, en.geonameid);
  // Mesma cidade, rótulos diferentes — é o que o modal do app vai mostrar.
  assert.equal(en.name, "New York");
  assert.notEqual(pt.name, en.name);
  assert.notEqual(es.name, en.name);
});

test("o nome do PAÍS também é traduzido", async () => {
  const pt = await get("/api/cities/search?q=junqueiropolis&lang=pt");
  const es = await get("/api/cities/search?q=junqueiropolis&lang=es");
  const en = await get("/api/cities/search?q=junqueiropolis&lang=en");
  assert.equal(pt.body.items[0].country, "Brasil");
  assert.equal(es.body.items[0].country, "Brasil");
  assert.equal(en.body.items[0].country, "Brazil");
});

test("lang desconhecido cai no padrão (pt) em vez de dar erro", async () => {
  const r = await get("/api/cities/search?q=junqueiropolis&lang=klingon");
  assert.equal(r.status, 200);
  assert.equal(r.body.lang, "pt");
  assert.equal(r.body.items[0].country, "Brasil");
});

// ===========================================================================
// 4) O CONSERTO DO ASCENDENTE — horário de verão
//
// O bug que motivou metade deste trabalho: o app usa utcOffset FIXO (-3 pra
// São Paulo). Quem nasceu em 20/01/2015 em São Paulo estava em -2, porque o
// Brasil tinha horário de verão. Uma hora de erro = meio signo de Ascendente.
// ===========================================================================
test("com ?at=, o offset vem resolvido pro INSTANTE do nascimento (horário de verão)", async () => {
  const verao = await get("/api/cities/search?q=junqueiropolis&at=2015-01-20T14:30");
  const inverno = await get("/api/cities/search?q=junqueiropolis&at=2015-07-20T14:30");

  const a = verao.body.items[0];
  const b = inverno.body.items[0];

  // O offset PADRÃO é o mesmo nos dois (é a cidade, não a data) — é o campo de
  // compatibilidade que o app já consome.
  assert.equal(a.utcOffset, -3);
  assert.equal(b.utcOffset, -3);

  // O offset REAL não é: em janeiro de 2015 o Brasil estava em horário de verão.
  assert.equal(a.utcOffsetAt, -2, "janeiro/2015 em SP tinha horário de verão (-2)");
  assert.equal(a.utcOffsetAtMinutes, -120);
  assert.equal(a.dstAt, true);

  assert.equal(b.utcOffsetAt, -3, "julho/2015 em SP é horário padrão (-3)");
  assert.equal(b.dstAt, false);

  // E é exatamente esta diferença — 1 hora — que hoje sai errada no app.
  assert.equal(a.utcOffsetAt - b.utcOffsetAt, 1);
});

test("depois de 2019 o Brasil não tem mais horário de verão, e a rota sabe disso", async () => {
  const r = await get("/api/cities/search?q=junqueiropolis&at=2024-01-20T14:30");
  assert.equal(r.body.items[0].utcOffsetAt, -3);
  assert.equal(r.body.items[0].dstAt, false);
});

test("sem ?at=, os campos de instante não aparecem (nada é inventado)", async () => {
  const r = await get("/api/cities/search?q=junqueiropolis");
  const c = r.body.items[0];
  assert.equal(c.utcOffsetAt, undefined);
  assert.equal(c.dstAt, undefined);
  assert.equal(typeof c.utcOffset, "number");
  assert.equal(typeof c.timezone, "string");
});

test("?at= malformado é ignorado, não vira erro", async () => {
  for (const at of ["ontem", "2015-13-45", "1800-01-01", "'; DROP TABLE cities; --", ""]) {
    const r = await get("/api/cities/search?q=junqueiropolis&at=" + encodeURIComponent(at));
    assert.equal(r.status, 200, `at=${at} deveria ser ignorado`);
    assert.equal(r.body.items[0].utcOffsetAt, undefined);
  }
});

// ===========================================================================
// 5) CIDADE INEXISTENTE
// ===========================================================================
test("cidade que não existe devolve 200 com lista vazia (não 404, não 500)", async () => {
  const r = await get("/api/cities/search?q=xyzabcnaoexistecidadenenhuma");
  assert.equal(r.status, 200);
  assert.equal(r.body.count, 0);
  assert.deepEqual(r.body.items, []);
});

test("id inexistente devolve 404 limpo", async () => {
  const r = await get("/api/cities/gn-999999999");
  assert.equal(r.status, 404);
  assert.match(r.body.error, /não encontrada/);
});

test("id em formato inválido devolve 404, nunca 500", async () => {
  for (const id of ["../../etc/passwd", "gn-abc", "%00", "gn-", "a".repeat(200)]) {
    const r = await get("/api/cities/" + encodeURIComponent(id));
    assert.equal(r.status, 404, `id=${id} deveria dar 404`);
  }
});

// ===========================================================================
// 6) INJEÇÃO DE SQL / FTS
//
// A defesa não é escapar aspas: é que normalize() reduz `q` a [a-z0-9 ] antes
// de qualquer coisa, a string vai como PARÂMETRO ligado, e o banco está aberto
// em READONLY. Estes testes provam que os três continuam valendo — e, no fim,
// que a tabela ainda está lá.
// ===========================================================================
test("injeção de SQL não apaga, não vaza e não derruba", async () => {
  const ataques = [
    "'; DROP TABLE cities; --",
    "' OR '1'='1",
    "sao'; DELETE FROM cities WHERE '1'='1",
    "1' UNION SELECT * FROM meta --",
    "\" OR \"\"=\"",
    "%' --",
    "_%",
    "sao paulo' AND (SELECT COUNT(*) FROM cities)>0 --",
  ];
  for (const q of ataques) {
    const r = await get("/api/cities/search?q=" + encodeURIComponent(q));
    assert.ok(r.status === 200 || r.status === 400, `q=${q} devolveu ${r.status}`);
    if (r.status === 200) assert.ok(Array.isArray(r.body.items));
  }

  // A prova real: as tabelas continuam inteiras depois de tudo isso.
  const depois = await get("/api/cities/search?q=junqueiropolis");
  assert.equal(depois.status, 200);
  assert.equal(depois.body.items[0].name, "Junqueirópolis");
});

test("sintaxe do FTS5 em q é tratada como texto, não como operador", async () => {
  // Sem a normalização, cada um destes seria uma expressão MATCH válida e o
  // SQLite lançaria (virando 500) ou devolveria coisa que não foi pedida.
  for (const q of ['sao* OR *', '"sao', "NEAR(sao paulo)", "sao AND NOT paulo", "col*:x", "((("]) {
    const r = await get("/api/cities/search?q=" + encodeURIComponent(q));
    assert.ok(r.status === 200 || r.status === 400, `q=${q} devolveu ${r.status}`);
  }
});

test("injeção pela rota de id também não faz nada", async () => {
  const r = await get("/api/cities/" + encodeURIComponent("1; DROP TABLE cities"));
  assert.equal(r.status, 404);
  const depois = await get("/api/cities/search?q=junqueiropolis");
  assert.equal(depois.body.count, 1);
});

// ===========================================================================
// 7) TETOS
// ===========================================================================
test("q com menos de 2 caracteres é recusado com 400", async () => {
  for (const q of ["", "a", " ", "-", "%"]) {
    const r = await get("/api/cities/search?q=" + encodeURIComponent(q));
    assert.equal(r.status, 400, `q=${JSON.stringify(q)} deveria dar 400`);
    assert.match(r.body.error, new RegExp(String(MIN_QUERY_LEN)));
  }
});

test("q ausente é recusado com 400", async () => {
  const r = await get("/api/cities/search");
  assert.equal(r.status, 400);
});

test("limit é respeitado", async () => {
  const r = await get("/api/cities/search?q=sa&limit=3");
  assert.equal(r.status, 200);
  assert.ok(r.body.items.length <= 3, `veio ${r.body.items.length}`);
  assert.equal(r.body.count, r.body.items.length);
});

test("limit acima do teto é cortado no teto, não obedecido", async () => {
  const r = await get("/api/cities/search?q=sa&limit=5000");
  assert.equal(r.status, 200);
  assert.ok(r.body.items.length <= MAX_LIMIT, `veio ${r.body.items.length}, teto é ${MAX_LIMIT}`);
});

test("limit inválido cai no padrão em vez de quebrar", async () => {
  for (const limit of ["abc", "-1", "0", "NaN", "1e9", ""]) {
    const r = await get("/api/cities/search?q=sa&limit=" + encodeURIComponent(limit));
    assert.equal(r.status, 200, `limit=${limit} devolveu ${r.status}`);
    assert.ok(r.body.items.length > 0 && r.body.items.length <= MAX_LIMIT);
  }
});

test("q gigantesco é cortado e não derruba nada", async () => {
  const r = await get("/api/cities/search?q=" + encodeURIComponent("sao ".repeat(500)));
  assert.ok(r.status === 200 || r.status === 400);
});

// ===========================================================================
// 8) ORDENAÇÃO — a razão de existir da pontuação de relevância
// ===========================================================================
test("nome exato ganha de cidade grande com nome parecido", async () => {
  // "Junqueiro" (AL, 24 mil hab.) tem população MAIOR que "Junqueirópolis"
  // (SP, 20 mil). Buscando o nome exato, a menor tem que vir primeiro —
  // sem a pontuação, a ordenação por população inverteria isso.
  const r = await get("/api/cities/search?q=junqueiro");
  const nomes = r.body.items.map((c) => c.name);
  assert.equal(nomes[0], "Junqueiro", "prefixo exato deveria vir primeiro");

  const r2 = await get("/api/cities/search?q=junqueiropolis");
  assert.equal(r2.body.items[0].name, "Junqueirópolis");
});

test("busca por dois termos filtra pelos dois (cidade + estado)", async () => {
  const r = await get("/api/cities/search?q=" + encodeURIComponent("campinas sp"));
  assert.equal(r.status, 200);
  assert.ok(r.body.count >= 1);
  assert.equal(r.body.items[0].admin, "SP");
});

test("dá pra achar pelo nome do estado por extenso, não só pela sigla", async () => {
  const r = await get("/api/cities/search?q=" + encodeURIComponent("minas gerais"));
  assert.equal(r.status, 200);
  assert.ok(r.body.count >= 1);
  assert.ok(
    r.body.items.every((c) => c.admin === "MG"),
    "todos os resultados deveriam ser de MG"
  );
});

// ===========================================================================
// 9) ROTA POR ID + PONTE DE COMPATIBILIDADE
// ===========================================================================
test("GET /api/cities/:id reidrata uma cidade salva", async () => {
  const busca = await get("/api/cities/search?q=junqueiropolis");
  const id = busca.body.items[0].id;
  assert.match(id, /^gn-\d+$/);

  const r = await get("/api/cities/" + id);
  assert.equal(r.status, 200);
  assert.equal(r.body.city.name, "Junqueirópolis");
  assert.equal(r.body.city.id, id);
  assert.equal(r.body.city.timezone, "America/Sao_Paulo");
});

test("o id também aceita o número puro, sem o prefixo gn-", async () => {
  const r = await get("/api/cities/3459452");
  assert.equal(r.status, 200);
  assert.equal(r.body.city.name, "Junqueirópolis");
});

test("PONTE: um id ANTIGO do app ('sao-paulo-br') ainda resolve", async () => {
  // É isto que impede a cidade de nascimento de sumir do aparelho de quem já
  // usava o app antes desta mudança.
  const r = await get("/api/cities/sao-paulo-br");
  assert.equal(r.status, 200);
  assert.equal(r.body.city.name, "São Paulo");
  assert.equal(r.body.city.admin, "SP");
  // E avisa o app que o id era velho, pra ele regravar o novo.
  assert.equal(r.body.resolvedFrom, "sao-paulo-br");
  assert.match(r.body.city.id, /^gn-\d+$/);
});

test("PONTE: id antigo desconhecido dá 404 (e não uma cidade errada)", async () => {
  const r = await get("/api/cities/cidade-que-nunca-existiu-zz");
  assert.equal(r.status, 404);
});

// ===========================================================================
// 10) CACHE HTTP E ATRIBUIÇÃO
// ===========================================================================
test("busca vem com cache forte e ETag (dado de referência é imutável)", async () => {
  const r = await get("/api/cities/search?q=junqueiropolis");
  assert.match(r.headers["cache-control"], /public/);
  assert.match(r.headers["cache-control"], /max-age=86400/);
  assert.ok(r.headers.etag, "faltou ETag");
});

test("rota por id vem com cache ainda mais forte", async () => {
  const r = await get("/api/cities/3459452");
  assert.match(r.headers["cache-control"], /immutable/);
});

test("resposta de erro NÃO é cacheada", async () => {
  const r = await get("/api/cities/search?q=a");
  assert.equal(r.headers["cache-control"], "no-store");
});

test("a atribuição do GeoNames (CC BY 4.0) vai na resposta", async () => {
  // A licença exige crédito; o app precisa mostrar isso em algum lugar.
  const r = await get("/api/cities/search?q=junqueiropolis");
  assert.match(r.body.attribution, /GeoNames/);
  const r2 = await get("/api/cities/3459452");
  assert.match(r2.body.attribution, /GeoNames/);
});

// ===========================================================================
// 11) COMPATIBILIDADE DE FORMATO COM O QUE O APP JÁ CONSOME
//
// components/CityPickerModal.js usa item.id (keyExtractor) e cityLabel(item),
// que lê name/admin/country. screens/BirthChartScreen.js e QuizScreen.js leem
// lat/lon/utcOffset. Se qualquer um destes campos mudar de nome ou de tipo, o
// app quebra em silêncio — daí o teste.
// ===========================================================================
test("todo item tem exatamente os campos que o app já usa hoje, com os tipos certos", async () => {
  const r = await get("/api/cities/search?q=sa&limit=25");
  assert.ok(r.body.items.length > 0);
  for (const c of r.body.items) {
    assert.equal(typeof c.id, "string", "id (keyExtractor do FlatList)");
    assert.ok(c.id.length > 0);
    assert.equal(typeof c.name, "string", "name (cityLabel)");
    assert.equal(typeof c.admin, "string", "admin (cityLabel)");
    assert.equal(typeof c.country, "string", "country (cityLabel)");
    assert.equal(typeof c.lat, "number", "lat (ascendantSign)");
    assert.equal(typeof c.lon, "number", "lon (ascendantSign)");
    assert.equal(typeof c.utcOffset, "number", "utcOffset (ascendantSign)");
    assert.ok(Number.isFinite(c.lat) && c.lat >= -90 && c.lat <= 90);
    assert.ok(Number.isFinite(c.lon) && c.lon >= -180 && c.lon <= 180);
    assert.ok(c.utcOffset >= -12 && c.utcOffset <= 14);
    // O que é novo:
    assert.equal(typeof c.timezone, "string");
    assert.match(c.timezone, /^[A-Za-z_]+\/[A-Za-z_+\-0-9/]+$/, `fuso estranho: ${c.timezone}`);
    assert.equal(typeof c.population, "number");
  }
});

test("ids são únicos dentro de uma resposta (senão o FlatList do app reclama)", async () => {
  const r = await get("/api/cities/search?q=sa&limit=50");
  const ids = r.body.items.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
});

// ===========================================================================
// 12) OS TESTES DA LINHA DE MOUNT — batem no app REAL.
//
// Um router perfeito que ninguém montou não responde nada. Foi exatamente
// isso que aconteceu com /api/track. Estes dois falham se a linha
// `app.use("/api/cities", ...)` sumir do server.js.
// ===========================================================================
test("MOUNT: o server.js REAL responde em /api/cities/search", async () => {
  const { app: appReal } = require("../src/http/server");
  const r = await supertest(appReal).get("/api/cities/search?q=junqueiropolis");
  assert.notEqual(r.status, 404, "404 aqui = a linha de mount não está no server.js");
  assert.equal(r.status, 200);
  assert.equal(r.body.items[0].name, "Junqueirópolis");
});

test("MOUNT: o server.js REAL responde em /api/cities/:id", async () => {
  const { app: appReal } = require("../src/http/server");
  const r = await supertest(appReal).get("/api/cities/sao-paulo-br");
  assert.notEqual(r.status, 404, "404 aqui = a linha de mount não está no server.js");
  assert.equal(r.status, 200);
  assert.equal(r.body.city.name, "São Paulo");
});

test("MOUNT: a busca de cidades não roubou nenhuma rota vizinha", async () => {
  // /api/cities é prefixo novo; nada de /api/chat, /api/subscription etc. pode
  // ter mudado de comportamento por causa da ordem do mount.
  const { app: appReal } = require("../src/http/server");
  const r = await supertest(appReal).get("/api/subscription/codigo-que-nao-existe");
  assert.equal(r.status, 404);
  assert.match(r.body.error, /não encontrado/);
});
