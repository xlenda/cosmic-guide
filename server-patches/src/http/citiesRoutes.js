// Busca de cidade de nascimento — o lado servidor.
//
// ===========================================================================
// LINHA DE MOUNT — JÁ ESTÁ NO server.js (não é mais um passo pendente):
//
//   app.use("/api/cities", require("./citiesRoutes").citiesRouter);
//
// Ela fica junto do mount de /api/track (logo depois do `cors()`, antes do
// `express.json` global de 10mb), embrulhada no MESMO try/catch: nenhuma das
// duas pode impedir a API de subir. Este router não lê corpo de requisição
// nenhum — só query string e path param —, então a posição em relação ao
// parser global é indiferente pra ele; ficar ali em cima é só pra manter os
// dois mounts "opcionais" no mesmo lugar, fáceis de achar.
// A rota /api/track já ficou pronta, testada e SEM a linha de mount uma vez:
// 15 testes verdes e 404 pra tudo que o app mandava. Não repetir.
// ===========================================================================
//
// POR QUE ISTO EXISTE (relato real de testador, 29/07/2026): "mapa astral ok
// mas sem minha cidade Junqueirópolis". A lista de cidades do app é um array
// estático (lib/cities.js) com 400 municípios brasileiros — Junqueirópolis
// (~20 mil habitantes) não está lá, e nunca vai estar: o Brasil tem 5.570
// municípios e uma lista fixa SEMPRE vai faltar alguma. Colocar os 5.570 no
// bundle custaria ~685 KB crus / ~143 KB gzip (+23% no JS gzip do app), e o
// mundo inteiro (o app quer rodar em PT/ES/EN) é impensável num import
// estático. Aqui no servidor o custo no bundle do app é ZERO.
//
// O GANHO QUE VEM JUNTO É MAIOR QUE AS CIDADES — HORÁRIO DE VERÃO.
// lib/cities.js guarda `utcOffset` FIXO por cidade (São Paulo = -3, sempre),
// ignorando que o Brasil teve horário de verão até 2019. Medido de verdade
// (node 22, tzdata do sistema):
//
//   new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo",
//     timeZoneName: "longOffset" }).format(new Date("2015-01-20T12:00:00Z"))
//   → "1/20/2015, GMT-02:00"      // e o app usa -03:00
//
// Uma hora de erro. O Ascendente anda ~30° por 2h, ou seja, UM SIGNO a cada
// 2h — 1h errada é meio signo errado pra QUALQUER pessoa nascida em janeiro
// entre 1985 e 2019 nas regiões Sul/Sudeste/Centro-Oeste. Indo pro mundo
// (EUA e Europa inteiros com DST ativo até hoje) isso deixa de ser um caso de
// borda e vira o caso comum. O GeoNames traz o fuso IANA
// (ex.: "America/Sao_Paulo"), que é a única forma de acertar isso: o campo
// `timezone` que estas rotas devolvem é a correção, e `utcOffsetAt` (com o
// parâmetro `at`, abaixo) entrega o offset já resolvido pro INSTANTE do
// nascimento, pra o app não precisar depender de Intl/tzdata do navegador.
//
// BANCO SEPARADO, DE PROPÓSITO: data/cities.sqlite, gerado por
// scripts/import-cities.js. NÃO é o forja.sqlite. Dado de REFERÊNCIA
// (imutável, regenerável, público, ~150 mil linhas do GeoNames) não divide
// arquivo com dado de PRODUTO (assinatura, pagamento, diário). Assim
// "regenerar as cidades" é `rm` + rodar o importador, uma operação que não
// tem como encostar em dinheiro de assinante; e o backup do forja.sqlite não
// engorda 90 MB por causa de uma tabela que se baixa de novo em 2 minutos.
// Aberto em READONLY (`readonly: true`) — este processo NUNCA escreve aqui,
// e é mais uma camada além do SQL parametrizado.
//
// SEM O BANCO A ROTA RESPONDE 503, NUNCA DERRUBA O PROCESSO: o `open` é
// PREGUIÇOSO (primeira requisição), pelo mesmo motivo do `db.prepare`
// preguiçoso do trackRoutes.js — se abrir o banco acontecesse no require,
// bastava o importador não ter rodado ainda (deploy novo, disco restaurado,
// arquivo movido) pra API INTEIRA — checkout, webhook de pagamento, tudo —
// morrer na inicialização por causa de uma lista de cidades.
//
// LICENÇA: os dados vêm do GeoNames (https://www.geonames.org), sob
// CC BY 4.0. A atribuição vai na resposta (campo `attribution` do envelope de
// busca) e precisa aparecer em algum lugar visível do app — o rodapé da tela
// de seleção de cidade é o lugar natural.
const express = require("express");
const rateLimit = require("express-rate-limit");
const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const router = express.Router();

// data/cities.sqlite ao lado do forja.sqlite (mesma convenção de DATA_DIR de
// src/infrastructure/db.js, pra um DATA_DIR de teste isolar os DOIS bancos de
// uma vez). CITIES_DB_PATH existe pra apontar pro arquivo direto sem mexer no
// DATA_DIR — útil em teste e se um dia o arquivo for pra outro disco.
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "..", "data");
const CITIES_DB_PATH = process.env.CITIES_DB_PATH || path.join(DATA_DIR, "cities.sqlite");

const LANGS = new Set(["pt", "es", "en"]);
const DEFAULT_LANG = "pt";
const MIN_QUERY_LEN = 2; //   abaixo disso a busca devolve o mundo inteiro sem informar nada
const MAX_QUERY_LEN = 80; //  nome de cidade mais longo do mundo tem 85 chars, mas ninguém digita inteiro
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50; //      teto duro: o modal do app mostra ~6 linhas por vez
// Quantas linhas o SQL traz pra JS pontuar antes de cortar em `limit`. Precisa
// ser bem maior que MAX_LIMIT porque a ordenação FINAL (relevância textual) é
// feita aqui em cima, não no SQL — se o SQL cortasse em 20 por população, uma
// vila de 1.200 habitantes com o nome EXATO digitado ficaria de fora enquanto
// 20 cidades grandes com o nome só parecido entrariam. (O SQL já protege o
// caso mais grave disso sozinho — ver a cláusula ORDER BY do SELECT.)
const CANDIDATES = 400;

const ATTRIBUTION = "GeoNames (CC BY 4.0) — https://www.geonames.org";

// ---------------------------------------------------------------------------
// Rate limit GENEROSO de propósito: isto é busca-enquanto-digita. Uma pessoa
// escolhendo "Junqueirópolis" dispara uma requisição por tecla depois do 2º
// caractere — 13 requisições numa única escolha, e ela pode apagar e digitar
// de novo. O app deve fazer debounce (~250ms), mas o servidor não pode contar
// com isso. Some a NAT de operadora móvel (dezenas de pessoas no mesmo IP) e
// um limite "normal" de 60/15min transformaria o seletor de cidade em erro
// justo no onboarding, que é o degrau do funil que a gente está tentando
// consertar. 600/15min = 40/min por IP: sobra pra várias pessoas juntas e
// ainda barra quem quiser raspar as 150 mil cidades linha a linha (levaria
// ~78 horas nesse ritmo — e o dataset é público e baixável em 10 MB de
// qualquer jeito, então raspar daqui é o caminho mais burro possível).
// Consulta READONLY num banco de referência: não há o que estragar, só o que
// custar CPU.
// ---------------------------------------------------------------------------
const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições — tente novamente em alguns minutos." },
});

// Reidratação de uma cidade já escolhida (o app guarda o id e busca o resto ao
// abrir). Acontece 1-2x por sessão, não por tecla.
const lookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições — tente novamente em alguns minutos." },
});

// ---------------------------------------------------------------------------
// Abertura preguiçosa do banco de referência.
//
// `openState` guarda o resultado da ÚLTIMA tentativa. Sem isso, com o arquivo
// ausente, toda requisição tentaria abrir de novo (syscall + exceção) — e a
// rota que responde 503 viraria um jeito barato de gastar CPU do servidor.
// `checkedAt` deixa a rota se CURAR sozinha: se o dono rodar o importador com
// a API no ar, em até RECHECK_MS a rota volta a funcionar sem restart.
// ---------------------------------------------------------------------------
const RECHECK_MS = 60 * 1000;
let openState = null; // { db } | { error } , sempre com checkedAt

function abrirBanco() {
  const agora = Date.now();
  if (openState && openState.db) return openState;
  if (openState && agora - openState.checkedAt < RECHECK_MS) return openState;

  if (!fs.existsSync(CITIES_DB_PATH)) {
    openState = { db: null, error: "arquivo-ausente", checkedAt: agora };
    return openState;
  }
  try {
    const db = new Database(CITIES_DB_PATH, { readonly: true, fileMustExist: true });
    // Se o arquivo existe mas está vazio/truncado/pela metade (importador
    // interrompido, cópia incompleta), é aqui que descobrimos — e não no meio
    // de uma consulta, com um 500 pro app.
    const linhas = db.prepare("SELECT COUNT(*) AS c FROM cities").get().c;
    if (!linhas) throw new Error("tabela cities vazia");
    const versao = db.prepare("SELECT value FROM meta WHERE key = 'built_at'").get();
    // NÃO montamos ETag aqui. A tentação era usar "versão do banco" como ETag
    // (muda quando o importador roda, e só então), mas isso dá o MESMO ETag
    // pra toda resposta desta rota — e o `req.fresh` do Express compara o
    // If-None-Match com o ETag da resposta sem olhar a URL. Um cliente que
    // reaproveitasse o ETag de uma busca em outra busca levaria um 304 com
    // corpo vazio. O ETag padrão do Express (hash fraco do CORPO, ligado por
    // default) é gerado por resposta, então é correto por construção — e
    // também muda sozinho quando o banco é regerado, que era o objetivo.
    openState = {
      db,
      error: null,
      checkedAt: agora,
      total: linhas,
      builtAt: versao ? versao.value : null,
    };
    console.log(`[api/cities] banco de referência aberto: ${linhas} cidades (${CITIES_DB_PATH})`);
    return openState;
  } catch (err) {
    console.error("[api/cities] falha ao abrir o banco de cidades:", err && err.message);
    openState = { db: null, error: "banco-invalido", checkedAt: agora, detalhe: err && err.message };
    return openState;
  }
}

// Só pra teste: força a próxima chamada a reabrir (o teste cria o banco DEPOIS
// de já ter provocado um 503 de propósito).
function _resetCitiesDb() {
  if (openState && openState.db) {
    try {
      openState.db.close();
    } catch (_) {
      /* já fechado */
    }
  }
  openState = null;
}

function responder503(res) {
  // 503 + Retry-After: é indisponibilidade TEMPORÁRIA de um recurso opcional,
  // não erro do cliente. A mensagem diz o que fazer — o dono lê isso no log do
  // app ou no DevTools e sabe exatamente qual comando falta rodar.
  res.set("Retry-After", "300");
  res.set("Cache-Control", "no-store");
  return res.status(503).json({
    error: "Busca de cidades indisponível no servidor.",
    detail:
      "O banco de referência (data/cities.sqlite) ainda não foi gerado. " +
      "Rode `node scripts/import-cities.js` no servidor para criá-lo.",
  });
}

// ---------------------------------------------------------------------------
// Normalização — a MESMA de lib/cities.js (a busca local do app), de
// propósito: se as duas normalizassem diferente, "santa barbara doeste"
// acharia a cidade na lista de reserva e não acharia no servidor (ou o
// contrário), e o comportamento mudaria conforme a rede estivesse boa ou ruim.
// ATENÇÃO: a faixa de acentos vai escrita como \u0300-\u036f (escape ASCII) de
// propósito — os caracteres combinantes literais são invisíveis num editor e
// colam no colchete anterior se o arquivo passar por normalização NFC.
// ---------------------------------------------------------------------------
function normalize(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Expressão MATCH do FTS5 — e a defesa contra injeção.
//
// A defesa NÃO é "escapar aspas": é que depois de normalize() cada termo é
// garantidamente [a-z0-9]+ e nada mais. Aspas, asterisco, parênteses, `AND`,
// `NEAR`, `:` — tudo que tem significado na sintaxe de consulta do FTS5 — já
// virou espaço lá em cima, e o que sobra vira token separado. Um `q` de
// `x" OR cities_fts MATCH "y` chega aqui como os termos [x, or, cities, fts,
// match, y] e é procurado literalmente. Somando: (1) a string final vai como
// PARÂMETRO ligado, nunca concatenada no SQL; (2) o banco está aberto em
// READONLY, então nem uma injeção hipotética teria o que escrever.
// O `*` no fim de cada termo é busca por PREFIXO — sem ele, "junqueiro" não
// acharia "Junqueirópolis" e a busca-enquanto-digita não existiria.
// ---------------------------------------------------------------------------
function buildMatchExpr(terms) {
  return terms.map((t) => `"${t}"*`).join(" AND ");
}

// Offset padrão (sem horário de verão) a partir do fuso IANA — é o que o app
// já espera no campo `utcOffset`. Vem gravado no banco pelo importador; esta
// função existe só pro caminho do `at`, abaixo.
const formatterCache = new Map();
function offsetFormatter(timeZone) {
  let f = formatterCache.get(timeZone);
  if (!f) {
    // Construir um Intl.DateTimeFormat custa ~1ms; fazer isso por cidade, por
    // requisição, seria o custo dominante da rota. Um Map por fuso (o mundo
    // tem ~420 fusos IANA) resolve pra sempre.
    f = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" });
    formatterCache.set(timeZone, f);
  }
  return f;
}

// Offset (em MINUTOS) daquele fuso NAQUELE INSTANTE UTC.
function offsetMinutesAtInstant(timeZone, instanteMs) {
  const partes = offsetFormatter(timeZone).formatToParts(new Date(instanteMs));
  const nome = partes.find((p) => p.type === "timeZoneName");
  if (!nome) return null;
  // "GMT-03:00" | "GMT+05:30" | "GMT" (para UTC exato)
  const m = /^GMT([+-])(\d{2}):(\d{2})$/.exec(nome.value);
  if (!m) return nome.value === "GMT" ? 0 : null;
  const sinal = m[1] === "-" ? -1 : 1;
  return sinal * (Number(m[2]) * 60 + Number(m[3]));
}

// ---------------------------------------------------------------------------
// O CORAÇÃO DA CORREÇÃO DO ASCENDENTE: dado "nasci às 14:30 do dia 20/01/1995
// em São Paulo", qual era o offset em relação ao UTC NAQUELE momento?
//
// Isso NÃO é o offset padrão da cidade. É hora de PAREDE (o que estava escrito
// no relógio da maternidade) → instante UTC, e nesse caminho o horário de
// verão entra. Como o offset depende do instante e o instante depende do
// offset, resolve-se em duas passadas (o algoritmo clássico): chuta que a hora
// de parede é UTC, descobre o offset naquele ponto, corrige, e confere o
// offset no ponto corrigido. Duas passadas bastam porque nenhuma transição de
// fuso do mundo real é maior que a distância que a primeira passada erra.
//
// Casos de borda honestos: no "salto" da primavera existe hora de parede que
// NUNCA existiu (02:30 num dia em que o relógio pulou de 02:00 pra 03:00) e no
// outono existe hora que aconteceu DUAS vezes. Aqui a segunda passada escolhe
// uma delas em silêncio, sem inventar erro — para uma hora de nascimento
// informada pela pessoa (que quase nunca tem precisão de minuto), errar em 1h
// numa faixa de 1h por ano é infinitamente melhor que errar em 1h durante os
// 4 meses de horário de verão, que é o que acontece hoje.
// ---------------------------------------------------------------------------
function offsetMinutesAtWallTime(timeZone, ano, mes, dia, hora, minuto) {
  const chute = Date.UTC(ano, mes - 1, dia, hora, minuto, 0, 0);
  const o1 = offsetMinutesAtInstant(timeZone, chute);
  if (o1 === null) return null;
  const o2 = offsetMinutesAtInstant(timeZone, chute - o1 * 60000);
  return o2 === null ? o1 : o2;
}

// `at` aceita "YYYY-MM-DD" e "YYYY-MM-DDTHH:mm" (o formato que o app já usa
// pra data e hora de nascimento: date="1995-01-20", time="14:30"). Sem hora,
// assume meio-dia — o ponto do dia mais longe das duas transições possíveis,
// então é o palpite que erra menos quando a pessoa não sabe a hora.
const AT_RE = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?$/;
function parseAt(at) {
  if (typeof at !== "string") return null;
  const m = AT_RE.exec(at.trim());
  if (!m) return null;
  const ano = Number(m[1]);
  const mes = Number(m[2]);
  const dia = Number(m[3]);
  const hora = m[4] === undefined ? 12 : Number(m[4]);
  const minuto = m[5] === undefined ? 0 : Number(m[5]);
  // Ano 1900-2100: fora disso o tzdata não tem transição confiável (antes de
  // 1914 boa parte do mundo usava hora solar local, com offsets quebrados tipo
  // -3:06:28 que o IANA registra mas que ninguém quer num mapa astral).
  if (ano < 1900 || ano > 2100) return null;
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;
  if (hora > 23 || minuto > 59) return null;
  return { ano, mes, dia, hora, minuto };
}

// ---------------------------------------------------------------------------
// FORMATO DA RESPOSTA — superconjunto EXATO do que o app já consome hoje.
//
// components/CityPickerModal.js usa `item.id` (keyExtractor) e cityLabel(item),
// que lê `name`, `admin` e `country`. screens/BirthChartScreen.js e
// screens/QuizScreen.js leem `lat`, `lon` e `utcOffset`. Todos os seis campos
// saem daqui com a MESMA semântica, então uma cidade vinda do servidor passa
// por qualquer código que hoje recebe uma cidade de lib/cities.js sem uma
// linha de adaptação. O que é NOVO só acrescenta.
//
// `id`: "gn-3457204" — prefixo de propósito. Os ids antigos são slugs
// ("sao-paulo-br"), então `/^gn-\d+$/` diz pro app, sem ambiguidade nenhuma,
// "esta cidade veio do servidor, reidrate por /api/cities/<id>". Sem o
// prefixo, um id puramente numérico seria só mais uma string parecida com as
// outras no AsyncStorage.
//
// `utcOffset`: offset PADRÃO, sem horário de verão — a mesma semântica do
// campo atual de lib/cities.js (o comentário de lá já diz "sem horário de
// verão"). Mantido pra NÃO quebrar nada no dia do deploy.
// `timezone` + `utcOffsetAt`: o conserto. Ver o bloco do topo.
// ---------------------------------------------------------------------------
function serializar(row, lang, momento) {
  const nome =
    (lang === "pt" && row.name_pt) ||
    (lang === "es" && row.name_es) ||
    (lang === "en" && row.name_en) ||
    row.name ||
    row.ascii;

  const pais =
    (lang === "pt" && row.country_pt) ||
    (lang === "es" && row.country_es) ||
    (lang === "en" && row.country_en) ||
    row.country_code;

  const cidade = {
    id: `gn-${row.geonameid}`,
    geonameid: row.geonameid,
    name: nome,
    admin: row.admin1 || "",
    country: pais,
    countryCode: row.country_code,
    lat: row.lat,
    lon: row.lon,
    // Offset padrão da cidade (compatibilidade com o cálculo atual do app).
    utcOffset: row.utc_offset,
    // O FUSO DE VERDADE. É este campo que resolve o horário de verão.
    timezone: row.timezone,
    population: row.population,
  };

  if (momento && row.timezone) {
    const min = offsetMinutesAtWallTime(
      row.timezone,
      momento.ano,
      momento.mes,
      momento.dia,
      momento.hora,
      momento.minuto
    );
    if (min !== null) {
      // Em horas (o que ascendantSign/houses/astrocartographyCities esperam),
      // e em minutos pros fusos quebrados (Índia +5:30, Nepal +5:45, e o
      // Brasil de 1963, que teve -02:00 em Fernando de Noronha).
      cidade.utcOffsetAt = min / 60;
      cidade.utcOffsetAtMinutes = min;
      // Diz explicitamente se aquele nascimento caiu em horário de verão —
      // dá pra mostrar "horário de verão aplicado" na tela e é o que faz o
      // dono confiar no número em vez de achar que o app errou 1h.
      cidade.dstAt = min !== Math.round(row.utc_offset * 60);
    }
  }

  return cidade;
}

// SELECT único, usado pelas duas rotas. O join com `countries` é o que permite
// devolver "Brasil"/"Brasil"/"Brazil" sem gravar três nomes de país em cada
// uma das 150 mil linhas de `cities`.
const CAMPOS = `
  c.geonameid, c.name, c.ascii, c.name_pt, c.name_es, c.name_en,
  c.country_code, c.admin1, c.lat, c.lon, c.timezone, c.utc_offset, c.population,
  p.name_pt AS country_pt, p.name_es AS country_es, p.name_en AS country_en
`;

// Statements preparados uma vez por abertura do banco (better-sqlite3 cacheia
// o plano de execução; preparar a cada requisição jogaria isso fora).
const stmtCache = new WeakMap();
function statements(db) {
  let s = stmtCache.get(db);
  if (s) return s;
  s = {
    buscar: db.prepare(`
      SELECT ${CAMPOS}
      FROM cities_fts f
      JOIN cities c ON c.geonameid = f.rowid
      LEFT JOIN countries p ON p.iso2 = c.country_code
      WHERE cities_fts MATCH @expr
      -- Duas ordenações, e a primeira é a que impede um bug sutil: sem ela, o
      -- LIMIT de candidatos cortaria por POPULAÇÃO, e uma cidade pequena com o
      -- nome EXATO digitado (justamente o caso "Junqueirópolis") ficaria de
      -- fora se 400 cidades maiores casassem o prefixo. A coluna "norm" guarda
      -- todos os nomes normalizados entre barras, então |junqueiropolis| casa o
      -- nome INTEIRO e nunca um pedaço de outro nome.
      ORDER BY (CASE WHEN c.norm LIKE @exato THEN 0 ELSE 1 END), c.population DESC
      LIMIT @cand
    `),
    porId: db.prepare(`
      SELECT ${CAMPOS}
      FROM cities c
      LEFT JOIN countries p ON p.iso2 = c.country_code
      WHERE c.geonameid = ?
    `),
    // Ponte de compatibilidade: os ids antigos ("sao-paulo-br") estão salvos
    // no AsyncStorage de quem já usou o app. Sem esta tabela, atualizar o app
    // faria a cidade de nascimento de TODO MUNDO sumir — e com ela o
    // Ascendente, que é o campo mais valorizado da tela.
    legado: db.prepare("SELECT geonameid FROM legacy_city_ids WHERE old_id = ?"),
  };
  stmtCache.set(db, s);
  return s;
}

// ---------------------------------------------------------------------------
// Pontuação de relevância — a MESMA regra da searchCities() de lib/cities.js,
// pra ordem dos resultados não mudar quando a busca sai do aparelho e vai pro
// servidor. Nome exato primeiro, depois quem COMEÇA com o digitado, depois
// quem tem o termo no começo de uma palavra, depois o resto; empate resolve
// por população. Sem isso, digitar "sao" devolve "São Paulo" perdido no meio
// de centenas de "Santo/Santa/São ...".
// A diferença pro app é que aqui a pontuação olha os nomes nos TRÊS idiomas:
// quem digita "Cologne" (en) ou "Colonia" (es) tem o mesmo score de quem
// digita "Köln".
// ---------------------------------------------------------------------------
function pontuar(row, q) {
  let melhor = 4;
  const nomes = [row.name, row.ascii, row.name_pt, row.name_es, row.name_en];
  for (const bruto of nomes) {
    if (!bruto) continue;
    const n = normalize(bruto);
    let s;
    if (n === q) s = 0;
    else if (n.startsWith(q)) s = 1;
    else if ((" " + n).includes(" " + q)) s = 2;
    else if (n.includes(q)) s = 3;
    else continue;
    if (s < melhor) melhor = s;
    if (melhor === 0) break;
  }
  return melhor;
}

/**
 * Busca cidades. Exportada pra o importador poder provar, no fim da
 * importação, que a busca funciona no banco recém-gerado usando ESTE código e
 * não uma cópia parecida (uma cópia parecida é como um índice fica quebrado
 * sem ninguém perceber).
 *
 * @returns {{ok:true, items:Array}|{ok:false, status:number, error:string}}
 */
function searchCities(db, { q, lang = DEFAULT_LANG, limit = DEFAULT_LIMIT, at = null } = {}) {
  const idioma = LANGS.has(lang) ? lang : DEFAULT_LANG;

  const bruto = typeof q === "string" ? q.slice(0, MAX_QUERY_LEN) : "";
  const consulta = normalize(bruto);
  if (consulta.length < MIN_QUERY_LEN) {
    return { ok: false, status: 400, error: `q precisa de pelo menos ${MIN_QUERY_LEN} caracteres` };
  }
  const termos = consulta.split(" ").filter(Boolean);
  if (!termos.length) {
    return { ok: false, status: 400, error: `q precisa de pelo menos ${MIN_QUERY_LEN} caracteres` };
  }

  let teto = Number.parseInt(limit, 10);
  if (!Number.isFinite(teto) || teto < 1) teto = DEFAULT_LIMIT;
  teto = Math.min(teto, MAX_LIMIT);

  const st = statements(db);
  let linhas;
  try {
    linhas = st.buscar.all({
      expr: buildMatchExpr(termos),
      // `consulta` é [a-z0-9 ]+ depois de normalize(), então não tem como
      // conter `%` nem `_` — não existe curinga de LIKE pra injetar aqui.
      exato: `%|${consulta}|%`,
      cand: CANDIDATES,
    });
  } catch (err) {
    // Uma expressão MATCH inválida faz o SQLite lançar. Depois da
    // normalização isso não deveria ser possível, mas "não deveria" não é
    // garantia: melhor devolver lista vazia que 500 no seletor de cidade.
    console.error("[api/cities] consulta FTS falhou:", err && err.message);
    return { ok: true, items: [] };
  }

  const momento = at ? parseAt(at) : null;
  const pontuadas = linhas.map((row, i) => ({ row, score: pontuar(row, consulta), i }));
  pontuadas.sort((a, b) => a.score - b.score || b.row.population - a.row.population || a.i - b.i);

  return { ok: true, items: pontuadas.slice(0, teto).map((p) => serializar(p.row, idioma, momento)) };
}

function getCityByGeonameId(db, geonameid, { lang = DEFAULT_LANG, at = null } = {}) {
  const st = statements(db);
  const row = st.porId.get(geonameid);
  if (!row) return null;
  return serializar(row, LANGS.has(lang) ? lang : DEFAULT_LANG, at ? parseAt(at) : null);
}

// Aceita "gn-3457204", "3457204" e um id LEGADO ("sao-paulo-br"). O legado é o
// que faz o app de quem já usou continuar com a cidade dele depois da
// atualização — ver a tabela legacy_city_ids no importador.
function resolverId(db, bruto) {
  const texto = String(bruto || "").trim();
  if (!texto || texto.length > 64) return null;
  const m = /^(?:gn-)?(\d{1,12})$/.exec(texto);
  if (m) return { geonameid: Number(m[1]), viaLegado: false };
  if (!/^[a-z0-9-]{2,64}$/.test(texto)) return null;
  try {
    const linha = statements(db).legado.get(texto);
    if (linha) return { geonameid: linha.geonameid, viaLegado: true };
  } catch (err) {
    // Banco antigo, gerado antes da ponte existir: sem tabela, sem ponte.
    console.error("[api/cities] tabela legacy_city_ids indisponível:", err && err.message);
  }
  return null;
}

// ===========================================================================
// GET /api/cities/search?q=&lang=&limit=&at=
//
//   q     obrigatório, mínimo 2 caracteres (depois de tirar acento/pontuação)
//   lang  "pt" | "es" | "en"   (padrão "pt")
//   limit 1..50                (padrão 20)
//   at    "YYYY-MM-DD" ou "YYYY-MM-DDTHH:mm" — opcional. Com ele cada item vem
//         com utcOffsetAt/utcOffsetAtMinutes/dstAt, já resolvidos pro instante
//         do nascimento. É ISSO que conserta o Ascendente de quem nasceu em
//         horário de verão.
//
// 200 { query, lang, count, items: [...], attribution }
// 400 { error }   q curto demais
// 503 { error, detail }   banco de referência ausente
// ===========================================================================
router.get("/search", searchLimiter, (req, res) => {
  const estado = abrirBanco();
  if (!estado.db) return responder503(res);

  const r = searchCities(estado.db, {
    q: req.query.q,
    lang: req.query.lang,
    limit: req.query.limit,
    at: req.query.at,
  });
  if (!r.ok) {
    res.set("Cache-Control", "no-store");
    return res.status(r.status).json({ error: r.error });
  }

  // CACHE FORTE, e é honesto: o conteúdo desta resposta só muda quando o
  // importador roda de novo (o que acontece quando o dono quer, tipicamente
  // uma vez por ano quando o GeoNames publica dados novos). Um dia no
  // navegador + uma semana servindo obsoleto enquanto revalida significa que
  // apagar e redigitar a mesma busca não gera requisição nenhuma, e que a
  // Cloudflare/nginx na frente absorve o grosso do tráfego de digitação.
  // O ETag quem põe é o Express (hash fraco do corpo, ligado por default):
  // regenerar o banco muda o corpo e invalida o cache sozinho, sem ninguém
  // precisar lembrar de nada. Ver a nota em abrirBanco() sobre por que NÃO
  // usamos um ETag "de versão do banco" aqui.
  res.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");

  res.json({
    query: typeof req.query.q === "string" ? req.query.q.slice(0, MAX_QUERY_LEN) : "",
    lang: LANGS.has(req.query.lang) ? req.query.lang : DEFAULT_LANG,
    count: r.items.length,
    items: r.items,
    attribution: ATTRIBUTION,
  });
});

// ===========================================================================
// GET /api/cities/:id?lang=&at=
//
// :id aceita "gn-3457204", "3457204" ou um id ANTIGO de lib/cities.js
//     ("sao-paulo-br") — este último resolvido pela tabela de-para, que é o
//     que impede a cidade salva de sumir do aparelho de quem já usava o app.
//
// 200 { city, attribution }      (+ `resolvedFrom` quando veio de id legado)
// 404 { error }
// 503 { error, detail }
// ===========================================================================
router.get("/:id", lookupLimiter, (req, res) => {
  const estado = abrirBanco();
  if (!estado.db) return responder503(res);

  const alvo = resolverId(estado.db, req.params.id);
  if (!alvo) {
    res.set("Cache-Control", "no-store");
    return res.status(404).json({ error: "cidade não encontrada" });
  }

  const city = getCityByGeonameId(estado.db, alvo.geonameid, { lang: req.query.lang, at: req.query.at });
  if (!city) {
    res.set("Cache-Control", "no-store");
    return res.status(404).json({ error: "cidade não encontrada" });
  }

  // Uma cidade por id é o dado mais imutável que existe aqui: `immutable` diz
  // ao navegador pra nem revalidar dentro da semana.
  res.set("Cache-Control", "public, max-age=604800, immutable");

  const corpo = { city, attribution: ATTRIBUTION };
  // Sinaliza pro app que o id que ele tinha guardado é ANTIGO, pra ele
  // regravar o novo no AsyncStorage e não depender da ponte pra sempre.
  if (alvo.viaLegado) corpo.resolvedFrom = req.params.id;
  res.json(corpo);
});

// Rede de segurança: qualquer erro não previsto aqui dentro vira JSON e não
// sobe pro middleware de erro central do server.js.
router.use((err, _req, res, next) => {
  if (!err) return next();
  if (res.headersSent) return next(err);
  console.error("[api/cities] erro inesperado:", err && err.message);
  res.status(500).json({ error: "erro interno na busca de cidades" });
});

module.exports = {
  citiesRouter: router,
  // Exportados pro importador (que usa a MESMA busca pra provar o banco) e
  // pros testes.
  searchCities,
  getCityByGeonameId,
  resolverId,
  normalize,
  buildMatchExpr,
  offsetMinutesAtWallTime,
  parseAt,
  CITIES_DB_PATH,
  MAX_LIMIT,
  MIN_QUERY_LEN,
  ATTRIBUTION,
  _resetCitiesDb,
};
