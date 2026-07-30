#!/usr/bin/env node
// =============================================================================
// IMPORTADOR DO GEONAMES -> data/cities.sqlite
//
// Gera o banco de REFERÊNCIA que src/http/citiesRoutes.js consulta. Ele NÃO
// roda sozinho: não há cron, não há require em lugar nenhum do servidor, não
// há efeito colateral em importar este arquivo. Só faz alguma coisa quando
// alguém digita o comando.
//
//   cd /root/forja-backend
//   node scripts/import-cities.js
//
// POR QUE ISTO EXISTE: um testador reportou (29/07/2026) "mapa astral ok mas
// sem minha cidade Junqueirópolis". A lista do app (lib/cities.js) tem 400
// municípios brasileiros escolhidos por população; Junqueirópolis tem ~20 mil
// habitantes e ficou de fora, como ficam outros 5.170 municípios. Nenhuma
// lista fixa resolve isso. cities1000 do GeoNames tem ~150 mil cidades do
// mundo inteiro com 1.000+ habitantes — cobre praticamente qualquer lugar
// onde alguém nasceu, nos três idiomas que o app fala.
//
// E TRAZ O CONSERTO DO ASCENDENTE JUNTO: lib/cities.js guarda um utcOffset
// FIXO por cidade. O Brasil teve horário de verão até 2019, então quem nasceu
// em janeiro de 2015 em São Paulo tem o Ascendente calculado com UMA HORA de
// erro — e o Ascendente troca de signo a cada ~2h, ou seja, meio signo errado.
// O GeoNames traz o fuso IANA ("America/Sao_Paulo"), que é o dado que resolve
// isso de verdade. Cada cidade sai daqui com o fuso, e a rota entrega o offset
// já resolvido pro instante do nascimento.
//
// -----------------------------------------------------------------------------
// GARANTIAS DESTE SCRIPT (nesta ordem de importância)
//
// 1. NUNCA ENCOSTA NO BANCO DO PRODUTO. Ele escreve exclusivamente em
//    data/cities.sqlite. Há uma trava explícita (ver assertDestinoSeguro)
//    que ABORTA se o caminho de saída for forja.sqlite ou qualquer coisa
//    parecida. Regenerar cidades é uma operação que não tem como perder uma
//    assinatura — é por isso que o banco é separado.
// 2. ATÔMICO. Constrói em cities.sqlite.tmp e só no fim renomeia por cima do
//    definitivo. Se cair a rede, faltar disco ou alguém der Ctrl-C no meio, o
//    banco antigo continua inteiro e a busca continua no ar.
// 3. IDEMPOTENTE. Rodar duas vezes seguidas dá o mesmo resultado. Os
//    downloads ficam num cache e são reusados quando o ETag/tamanho do
//    servidor do GeoNames bate com o que já está em disco.
//
// -----------------------------------------------------------------------------
// OPÇÕES
//   --sample            não usa rede: importa a amostra de scripts/fixtures/.
//                       É o que roda em teste e em máquina sem internet.
//   --no-download       usa o que já estiver no cache (falha se faltar).
//   --keep-cache        não apaga os .zip no fim (padrão: mantém, ver abaixo)
//   --clean-cache       apaga os .zip baixados depois de importar
//   --out=CAMINHO       destino (padrão: $DATA_DIR/cities.sqlite)
//   --cache=DIR         onde guardar os downloads (padrão: $DATA_DIR/_geonames)
//   --min-population=N  ignora cidades com menos de N habitantes (padrão 0)
//
// -----------------------------------------------------------------------------
// CUSTO EM DISCO (o dono perguntou; a VPS tem 28 GB livres)
//   downloads:  cities1000.zip ~10 MB + alternateNames.zip ~200 MB (cache)
//   temporário: o .tmp durante a construção
//   final:      data/cities.sqlite  (ver o relatório impresso no fim)
// Se o espaço apertar um dia, `--clean-cache` devolve os ~210 MB e o próximo
// import baixa de novo.
//
// LICENÇA DOS DADOS: GeoNames, CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).
// A atribuição precisa aparecer no app — a rota já devolve o texto pronto no
// campo `attribution`, é só mostrar no rodapé do seletor de cidade.
// =============================================================================
"use strict";

const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const zlib = require("node:zlib");
const readline = require("node:readline");
const { pipeline } = require("node:stream/promises");
const { Readable } = require("node:stream");
const Database = require("better-sqlite3");

const RAIZ = path.join(__dirname, "..");
const DATA_DIR = process.env.DATA_DIR || path.join(RAIZ, "data");

const BASE_URL = "https://download.geonames.org/export/dump/";
const ARQUIVOS = {
  cities: "cities1000.zip",
  alternates: "alternateNames.zip",
  admin1: "admin1CodesASCII.txt",
};

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const o = {
    sample: false,
    download: true,
    limparCache: false,
    out: null,
    cache: null,
    minPop: 0,
  };
  for (const a of argv) {
    if (a === "--sample") o.sample = true;
    else if (a === "--no-download") o.download = false;
    else if (a === "--clean-cache") o.limparCache = true;
    else if (a === "--keep-cache") o.limparCache = false;
    else if (a.startsWith("--out=")) o.out = a.slice(6);
    else if (a.startsWith("--cache=")) o.cache = a.slice(8);
    else if (a.startsWith("--min-population=")) o.minPop = Number(a.slice(17)) || 0;
    else if (a === "-h" || a === "--help") o.help = true;
    else throw new Error(`opção desconhecida: ${a}`);
  }
  return o;
}

function log(msg) {
  const t = new Date().toISOString().slice(11, 19);
  process.stdout.write(`[${t}] ${msg}\n`);
}

function mb(bytes) {
  return (bytes / 1048576).toFixed(1) + " MB";
}

// ---------------------------------------------------------------------------
// TRAVA DE SEGURANÇA — a mais importante do arquivo.
//
// Este script cria, apaga e sobrescreve arquivos SQLite. Um --out digitado
// errado (ou um DATA_DIR apontando pro lugar errado) poderia, sem esta
// checagem, escrever por cima do banco onde moram as assinaturas pagas. A
// regra é grosseira de propósito: o destino TEM que se chamar cities.sqlite.
// ---------------------------------------------------------------------------
// A checagem é feita SÓ no nome do arquivo, nunca no caminho inteiro. Parece
// detalhe e não é: a primeira versão disto também recusava qualquer caminho
// que contivesse "forja", e o caminho de PRODUÇÃO é
// /root/forja-backend/data/cities.sqlite — ou seja, a trava teria recusado
// exatamente o único destino correto que existe. (Foi um teste rodando num
// diretório temporário chamado "forja-test-cities-XXXX" que revelou isso.)
// O nome do arquivo sozinho já dá a garantia completa: "forja.sqlite" nunca é
// igual a "cities.sqlite".
function assertDestinoSeguro(destino) {
  const nome = path.basename(destino);
  if (nome !== "cities.sqlite") {
    throw new Error(
      `destino recusado: "${destino}". Este script só escreve em um arquivo chamado ` +
        `"cities.sqlite" — é a trava que impede ele de encostar no forja.sqlite (assinaturas). ` +
        `Se quer gerar em outro lugar, aponte --out pra <outro-diretório>/cities.sqlite.`
    );
  }
}

// ===========================================================================
// LEITOR DE ZIP
//
// O GeoNames distribui .zip e o node não tem descompactador de zip embutido
// (só gzip/deflate). Adicionar uma dependência (adm-zip, yauzl) num backend
// que hoje tem 10 dependências, só pra ler DOIS arquivos por ano, não se
// paga — e cada dependência nova é superfície de supply chain num servidor
// que processa pagamento. São ~70 linhas: lê o diretório central no fim do
// arquivo, acha a entrada, e joga os bytes comprimidos num inflateRaw
// (que o node TEM). Streaming do início ao fim: o alternateNames.txt tem
// ~2 GB descompactado e nunca é materializado em memória nem em disco.
// ===========================================================================
const SIG_EOCD = 0x06054b50;
const SIG_CEN = 0x02014b50;

async function lerEntradasZip(arquivo) {
  const fd = await fsp.open(arquivo, "r");
  try {
    const { size } = await fd.stat();
    // O EOCD fica no fim; o comentário do zip pode ter até 64 KB.
    const janela = Math.min(size, 66 * 1024);
    const buf = Buffer.alloc(janela);
    await fd.read(buf, 0, janela, size - janela);
    let eocd = -1;
    for (let i = janela - 22; i >= 0; i--) {
      if (buf.readUInt32LE(i) === SIG_EOCD) {
        eocd = i;
        break;
      }
    }
    if (eocd < 0) throw new Error(`${path.basename(arquivo)}: não é um zip válido (EOCD ausente)`);
    const total = buf.readUInt16LE(eocd + 10);
    const tamCen = buf.readUInt32LE(eocd + 12);
    const offCen = buf.readUInt32LE(eocd + 16);

    const cen = Buffer.alloc(tamCen);
    await fd.read(cen, 0, tamCen, offCen);

    const entradas = [];
    let p = 0;
    for (let i = 0; i < total; i++) {
      if (cen.readUInt32LE(p) !== SIG_CEN) throw new Error("diretório central corrompido");
      const metodo = cen.readUInt16LE(p + 10);
      const compTam = cen.readUInt32LE(p + 20);
      const nomeTam = cen.readUInt16LE(p + 28);
      const extraTam = cen.readUInt16LE(p + 30);
      const comentTam = cen.readUInt16LE(p + 32);
      const offLocal = cen.readUInt32LE(p + 42);
      const nome = cen.toString("utf8", p + 46, p + 46 + nomeTam);
      entradas.push({ nome, metodo, compTam, offLocal });
      p += 46 + nomeTam + extraTam + comentTam;
    }
    return entradas;
  } finally {
    await fd.close();
  }
}

async function abrirEntradaZip(arquivo, entrada) {
  // O cabeçalho LOCAL tem os próprios campos de tamanho de nome/extra, que
  // podem diferir dos do diretório central — por isso relemos aqui em vez de
  // reaproveitar os de cima.
  const fd = await fsp.open(arquivo, "r");
  let inicio;
  try {
    const cab = Buffer.alloc(30);
    await fd.read(cab, 0, 30, entrada.offLocal);
    if (cab.readUInt32LE(0) !== 0x04034b50) throw new Error("cabeçalho local inválido");
    inicio = entrada.offLocal + 30 + cab.readUInt16LE(26) + cab.readUInt16LE(28);
  } finally {
    await fd.close();
  }
  const bruto = fs.createReadStream(arquivo, { start: inicio, end: inicio + entrada.compTam - 1 });
  if (entrada.metodo === 0) return bruto; // guardado sem compressão
  if (entrada.metodo === 8) return bruto.pipe(zlib.createInflateRaw());
  throw new Error(`método de compressão ${entrada.metodo} não suportado`);
}

// Percorre as LINHAS de uma entrada do zip (ou de um .txt solto) sem carregar
// o arquivo na memória.
async function* linhasDe(stream) {
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  for await (const linha of rl) yield linha;
}

// ===========================================================================
// DOWNLOAD com cache verificável
// ===========================================================================
async function baixarSeMudou(nomeArquivo, dirCache, permitirRede) {
  const destino = path.join(dirCache, nomeArquivo);
  const metaPath = destino + ".meta.json";
  const url = BASE_URL + nomeArquivo;

  let meta = null;
  if (fs.existsSync(metaPath)) {
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    } catch (_) {
      meta = null;
    }
  }

  if (!permitirRede) {
    if (!fs.existsSync(destino)) {
      throw new Error(`--no-download, mas ${destino} não existe. Rode sem --no-download uma vez.`);
    }
    log(`  ${nomeArquivo}: usando o cache (${mb(fs.statSync(destino).size)}) — --no-download`);
    return destino;
  }

  // HEAD antes de GET: é o que torna o script idempotente sem baixar 210 MB
  // toda vez. Se o HEAD falhar (proxy chato, servidor fora do ar), a gente NÃO
  // desiste — cai pro download normal, ou pro cache se ele existir.
  let remoto = null;
  try {
    const r = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (r.ok) {
      remoto = {
        etag: r.headers.get("etag") || null,
        tamanho: Number(r.headers.get("content-length") || 0) || null,
      };
    }
  } catch (err) {
    log(`  ${nomeArquivo}: HEAD falhou (${err.message}) — seguindo assim mesmo`);
  }

  if (
    remoto &&
    meta &&
    fs.existsSync(destino) &&
    meta.etag &&
    remoto.etag &&
    meta.etag === remoto.etag &&
    fs.statSync(destino).size === meta.tamanho
  ) {
    log(`  ${nomeArquivo}: já está no cache e não mudou (${mb(meta.tamanho)}) — pulando`);
    return destino;
  }

  const parcial = destino + ".part";
  log(`  ${nomeArquivo}: baixando${remoto && remoto.tamanho ? " (" + mb(remoto.tamanho) + ")" : ""}...`);
  const resp = await fetch(url, { redirect: "follow" });
  if (!resp.ok || !resp.body) throw new Error(`GET ${url} devolveu ${resp.status}`);

  let baixado = 0;
  let ultimoAviso = 0;
  const total = Number(resp.headers.get("content-length") || 0) || (remoto && remoto.tamanho) || 0;
  const origem = Readable.fromWeb(resp.body);
  origem.on("data", (c) => {
    baixado += c.length;
    if (baixado - ultimoAviso >= 20 * 1048576) {
      ultimoAviso = baixado;
      const pct = total ? ` (${((baixado / total) * 100).toFixed(0)}%)` : "";
      log(`    ...${mb(baixado)}${pct}`);
    }
  });
  await pipeline(origem, fs.createWriteStream(parcial));
  // Renomeia só no fim: um download interrompido nunca vira "cache válido".
  await fsp.rename(parcial, destino);
  const tamanho = fs.statSync(destino).size;
  fs.writeFileSync(
    metaPath,
    JSON.stringify({ etag: remoto ? remoto.etag : null, tamanho, baixadoEm: new Date().toISOString() })
  );
  log(`  ${nomeArquivo}: pronto (${mb(tamanho)})`);
  return destino;
}

// ===========================================================================
// NORMALIZAÇÃO — precisa ser IDÊNTICA à de src/http/citiesRoutes.js e à de
// lib/cities.js no app. Se o índice for gravado com uma regra e consultado
// com outra, a busca falha em silêncio só pra alguns nomes (justamente os
// acentuados), que é o tipo de bug que ninguém acha.
// A faixa de combinantes vai como \u0300-\u036f (escape ASCII) de propósito:
// escritos literalmente eles são invisíveis no editor e colam no colchete
// anterior se o arquivo passar por normalização NFC.
// ===========================================================================
function normalize(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Variante que ELIMINA o apóstrofo em vez de virar espaço. É o que faz
// "Santa Bárbara d'Oeste" ser achada digitando "santa barbara doeste": o
// tokenizador do FTS5 quebra em "d" + "oeste", e ninguém digita "d oeste".
function semApostrofo(str) {
  return normalize(String(str || "").replace(/['’´`]/g, ""));
}

// ---------------------------------------------------------------------------
// UF do Brasil a partir do NOME do estado (e não do código admin1). Os códigos
// do GeoNames para o Brasil NÃO seguem a ordem alfabética que a intuição
// sugere (BR.21 é Rio de Janeiro, BR.30 é Pernambuco, BR.29 é Goiás) e podem
// ser reorganizados numa revisão do dataset; o nome é estável.
// O app mostra "Junqueirópolis, SP — Brasil", então a sigla é o que a UI quer.
// ---------------------------------------------------------------------------
const UF_POR_NOME = {
  acre: "AC",
  alagoas: "AL",
  amapa: "AP",
  amazonas: "AM",
  bahia: "BA",
  ceara: "CE",
  "distrito federal": "DF",
  "federal district": "DF", // é assim que o GeoNames chama o DF
  "espirito santo": "ES",
  goias: "GO",
  maranhao: "MA",
  "mato grosso": "MT",
  "mato grosso do sul": "MS",
  "minas gerais": "MG",
  para: "PA",
  paraiba: "PB",
  parana: "PR",
  pernambuco: "PE",
  piaui: "PI",
  "rio de janeiro": "RJ",
  "rio grande do norte": "RN",
  "rio grande do sul": "RS",
  rondonia: "RO",
  roraima: "RR",
  "santa catarina": "SC",
  "sao paulo": "SP",
  sergipe: "SE",
  tocantins: "TO",
};
// Nome por extenso a partir da sigla — só pra BUSCA (quem digita "minas" ou
// "rio grande do sul" acha as cidades daquele estado). Mesmo mapa de
// lib/cities.js.
const NOME_POR_UF = {};
for (const [nome, uf] of Object.entries(UF_POR_NOME)) {
  if (!NOME_POR_UF[uf] || NOME_POR_UF[uf].length < nome.length) NOME_POR_UF[uf] = nome;
}

// ---------------------------------------------------------------------------
// Offset PADRÃO (sem horário de verão) a partir do fuso IANA.
//
// "Padrão" é o offset que vale FORA do horário de verão. Ele é sempre o MENOR
// dos dois offsets do ano, com sinal: Nova York tem -5 (jan) e -4 (jul) → -5;
// Sydney tem +11 (jan, verão do sul) e +10 (jul) → +10. Pegar o menor acerta
// nos dois hemisférios, e por isso não há um "if hemisfério" aqui.
// Este campo existe só pra COMPATIBILIDADE: é o `utcOffset` que o app já
// consome hoje. O dado certo é o `timezone`.
// ---------------------------------------------------------------------------
const cacheFmt = new Map();
function offsetMinutos(tz, ms) {
  let f = cacheFmt.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "longOffset" });
    cacheFmt.set(tz, f);
  }
  const parte = f.formatToParts(new Date(ms)).find((p) => p.type === "timeZoneName");
  if (!parte) return null;
  const m = /^GMT([+-])(\d{2}):(\d{2})$/.exec(parte.value);
  if (!m) return parte.value === "GMT" ? 0 : null;
  return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]));
}
const cacheOffsetPadrao = new Map();
function offsetPadraoHoras(tz) {
  if (cacheOffsetPadrao.has(tz)) return cacheOffsetPadrao.get(tz);
  let valor = 0;
  try {
    const jan = offsetMinutos(tz, Date.UTC(2025, 0, 15, 12));
    const jul = offsetMinutos(tz, Date.UTC(2025, 6, 15, 12));
    if (jan === null && jul === null) valor = 0;
    else if (jan === null) valor = jul / 60;
    else if (jul === null) valor = jan / 60;
    else valor = Math.min(jan, jul) / 60;
  } catch (_) {
    // Fuso que o ICU deste node não conhece (dataset novo, tzdata velho).
    valor = 0;
  }
  cacheOffsetPadrao.set(tz, valor);
  return valor;
}

// ---------------------------------------------------------------------------
// Nomes de país nos 3 idiomas — via Intl.DisplayNames, que já vem no node 22
// com ICU completo (conferido no servidor: pt/BR → "Brasil", es/US →
// "Estados Unidos", en/DE → "Germany"). Evita carregar e manter uma tabela de
// 250 países traduzida à mão.
// ---------------------------------------------------------------------------
function nomesDePais(iso2) {
  const r = {};
  for (const lang of ["pt", "es", "en"]) {
    try {
      const dn = new Intl.DisplayNames([lang], { type: "region" });
      const nome = dn.of(iso2);
      r[lang] = nome && nome !== iso2 ? nome : null;
    } catch (_) {
      r[lang] = null;
    }
  }
  return r;
}

// ===========================================================================
// ESQUEMA
// ===========================================================================
const ESQUEMA = `
PRAGMA journal_mode = OFF;      -- banco descartável, reconstruído do zero
PRAGMA synchronous = OFF;       -- se cair no meio, o .tmp é jogado fora
PRAGMA temp_store = MEMORY;

CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);

CREATE TABLE countries (
  iso2    TEXT PRIMARY KEY,
  name_pt TEXT,
  name_es TEXT,
  name_en TEXT
);

CREATE TABLE cities (
  geonameid   INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,      -- nome oficial em UTF-8 (col 1 do GeoNames)
  ascii       TEXT NOT NULL,      -- asciiname (col 2)
  name_pt     TEXT,               -- de alternateNames, isolanguage=pt
  name_es     TEXT,
  name_en     TEXT,
  country_code TEXT NOT NULL,     -- ISO 3166-1 alfa-2
  admin1      TEXT,               -- sigla da UF no Brasil, nome do estado fora
  admin1_code TEXT,
  lat         REAL NOT NULL,
  lon         REAL NOT NULL,
  timezone    TEXT NOT NULL,      -- IANA — O CAMPO QUE CONSERTA O ASCENDENTE
  utc_offset  REAL NOT NULL,      -- offset padrão, só pra compatibilidade
  population  INTEGER NOT NULL DEFAULT 0,
  -- Todos os nomes normalizados, cercados e separados por '|'. Serve pra UMA
  -- coisa: o LIKE '%|nome|%' da rota, que garante que um nome EXATO nunca
  -- perca a vaga pro corte por população. Ver o ORDER BY em citiesRoutes.js.
  norm        TEXT NOT NULL
);
CREATE INDEX idx_cities_pop ON cities(population DESC);

-- Índice de busca. contentless (content='') porque o texto pesquisável já
-- está em cities: duplicar 150 mil linhas de nomes dobraria o arquivo à toa.
-- remove_diacritics 2 é o que faz "junqueiropolis" achar "Junqueirópolis" —
-- a versão 2 (e não a 1) trata os acentos fora do Latin-1, o que importa pros
-- nomes em espanhol e pros diacríticos do resto do mundo.
-- prefix='2 3 4 5' constrói índice de prefixo pros tamanhos que a busca-
-- enquanto-digita usa de verdade; sem isso cada tecla vira varredura.
CREATE VIRTUAL TABLE cities_fts USING fts5(
  terms,
  content='',
  tokenize='unicode61 remove_diacritics 2',
  prefix='2 3 4 5'
);

-- PONTE DE COMPATIBILIDADE. Os 426 ids do lib/cities.js ("sao-paulo-br") estão
-- gravados no AsyncStorage de quem já usou o app. Sem esta tabela, a
-- atualização apagaria a cidade de nascimento de todo mundo — e com ela o
-- Ascendente, que é o campo mais valorizado da tela de Mapa Astral.
CREATE TABLE legacy_city_ids (
  old_id      TEXT PRIMARY KEY,
  geonameid   INTEGER NOT NULL,
  match_kind  TEXT NOT NULL,   -- 'exato' | 'proximo' | 'so-nome' | 'so-geo'
  distance_km REAL NOT NULL
);
`;

// ===========================================================================
// PASSO 1 — cities1000
// ===========================================================================
async function importarCidades(db, streamLinhas, minPop, admin1) {
  const inserir = db.prepare(`
    INSERT OR REPLACE INTO cities
      (geonameid, name, ascii, country_code, admin1, admin1_code, lat, lon, timezone, utc_offset, population, norm)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const paises = new Set();
  let lidas = 0;
  let gravadas = 0;
  let semFuso = 0;

  // Uma transação só: 150 mil inserts com autocommit levariam minutos.
  db.exec("BEGIN");
  for await (const linha of streamLinhas) {
    if (!linha) continue;
    lidas++;
    const c = linha.split("\t");
    if (c.length < 18) continue;
    const geonameid = Number(c[0]);
    const nome = c[1];
    const ascii = c[2] || c[1];
    const lat = Number(c[4]);
    const lon = Number(c[5]);
    const pais = c[8];
    const admin1Code = c[10] || "";
    const pop = Number(c[14]) || 0;
    const tz = c[17];
    if (!geonameid || !nome || !pais || !tz) continue;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (pop < minPop) continue;
    if (!tz.includes("/")) {
      semFuso++;
      continue;
    }

    const chaveAdmin = pais + "." + admin1Code;
    const nomeAdmin = admin1.get(chaveAdmin) || "";
    let admin;
    if (pais === "BR") admin = UF_POR_NOME[normalize(nomeAdmin)] || nomeAdmin;
    else admin = nomeAdmin;

    // `norm` guarda os nomes que existem AGORA (oficial + ascii). Os nomes
    // pt/es/en entram na segunda passada, quando o UPDATE recalcula esta
    // coluna — ver importarAlternativos.
    const formas = new Set([normalize(nome), normalize(ascii), semApostrofo(nome)]);
    formas.delete("");
    const norm = "|" + [...formas].join("|") + "|";

    inserir.run(
      geonameid,
      nome,
      ascii,
      pais,
      admin,
      admin1Code,
      lat,
      lon,
      tz,
      offsetPadraoHoras(tz),
      pop,
      norm
    );
    paises.add(pais);
    gravadas++;
    if (gravadas % 25000 === 0) log(`    ...${gravadas.toLocaleString("pt-BR")} cidades`);
  }
  db.exec("COMMIT");
  if (semFuso) log(`    (${semFuso} linhas sem fuso IANA válido foram ignoradas)`);
  return { lidas, gravadas, paises };
}

// ===========================================================================
// PASSO 2 — alternateNames (pt/es/en)
//
// O arquivo tem ~16 milhões de linhas e ~2 GB descompactado — de todos os
// lugares do GeoNames, não só cidades. Fazemos UMA passada, jogando fora tudo
// que não seja pt/es/en de uma cidade que já está na tabela.
//
// Os nomes filtrados vão pra uma tabela TEMPORÁRIA em disco em vez de ficarem
// num Map de memória. É de propósito: a VPS tem 4,4 GB livres e um Map com
// centenas de milhares de strings é justamente o tipo de coisa que faz o
// importador ser morto pelo OOM killer no meio (e derrubar outra coisa junto).
// Disco sobra (28 GB) e o SQLite ordena isso muito melhor que a gente.
// ===========================================================================
async function importarAlternativos(db, streamLinhas) {
  db.exec(`
    CREATE TABLE _alt (
      seq       INTEGER PRIMARY KEY AUTOINCREMENT,
      geonameid INTEGER NOT NULL,
      lang      TEXT NOT NULL,
      name      TEXT NOT NULL,
      pref      INTEGER NOT NULL DEFAULT 0,
      curto     INTEGER NOT NULL DEFAULT 0
    );
  `);
  const conhecidos = new Set(db.prepare("SELECT geonameid FROM cities").pluck().all());
  const inserir = db.prepare("INSERT INTO _alt (geonameid, lang, name, pref, curto) VALUES (?, ?, ?, ?, ?)");

  let lidas = 0;
  let guardadas = 0;
  db.exec("BEGIN");
  for await (const linha of streamLinhas) {
    lidas++;
    if (lidas % 2000000 === 0) {
      log(`    ...${(lidas / 1e6).toFixed(0)} milhões de linhas lidas, ${guardadas.toLocaleString("pt-BR")} nomes guardados`);
    }
    // Descarta o grosso ANTES do split: 16 milhões de split('\t') em 10
    // colunas é caro à toa quando 97% das linhas não interessam.
    const c = linha.split("\t");
    if (c.length < 4) continue;
    const lang = c[2];
    if (lang !== "pt" && lang !== "es" && lang !== "en") continue;
    const gid = Number(c[1]);
    if (!conhecidos.has(gid)) continue;
    const nome = c[3];
    if (!nome) continue;
    // isHistoric=1: nome que a cidade TINHA e não tem mais (Leningrado,
    // Bombaim). Fora do display; um seletor de cidade de nascimento que
    // sugere "Leningrado" para São Petersburgo confunde mais do que ajuda.
    if (c[7] === "1") continue;
    const pref = c[4] === "1" ? 1 : 0;
    const curto = c[5] === "1" ? 1 : 0;
    inserir.run(gid, lang, nome, pref, curto);
    guardadas++;
  }
  db.exec("COMMIT");

  log(`    ${lidas.toLocaleString("pt-BR")} linhas lidas, ${guardadas.toLocaleString("pt-BR")} nomes pt/es/en guardados`);
  log("    escolhendo o nome de exibição por idioma...");
  db.exec("CREATE INDEX idx_alt_lookup ON _alt(geonameid, lang, pref DESC, seq)");

  // Nome de EXIBIÇÃO por idioma: o marcado como preferencial vence; empatou,
  // vence quem apareceu primeiro no arquivo (ordem estável — rodar duas vezes
  // dá o mesmo nome, que é metade da promessa de idempotência).
  for (const lang of ["pt", "es", "en"]) {
    db.prepare(
      `UPDATE cities SET name_${lang} = (
         SELECT a.name FROM _alt a
         WHERE a.geonameid = cities.geonameid AND a.lang = ?
         ORDER BY a.pref DESC, a.curto DESC, a.seq ASC LIMIT 1
       )`
    ).run(lang);
  }
  return { lidas, guardadas };
}

// ===========================================================================
// PASSO 3 — recalcular `norm` e montar o índice FTS
//
// O blob de busca de cada cidade junta: nome oficial, ascii, os nomes pt/es/en
// de EXIBIÇÃO, TODOS os outros nomes alternativos nesses 3 idiomas (é isso que
// faz "Cologne" e "Colonia" acharem Köln), a sigla e o nome por extenso do
// estado, e o nome do país nos 3 idiomas.
// ===========================================================================
function construirIndice(db, nomesPais) {
  const alternativos = db.prepare(
    "SELECT name FROM _alt WHERE geonameid = ? ORDER BY pref DESC, seq ASC LIMIT 8"
  );
  const atualizarNorm = db.prepare("UPDATE cities SET norm = ? WHERE geonameid = ?");
  const inserirFts = db.prepare("INSERT INTO cities_fts (rowid, terms) VALUES (?, ?)");
  const linhas = db
    .prepare(
      "SELECT geonameid, name, ascii, name_pt, name_es, name_en, country_code, admin1 FROM cities"
    )
    .all();

  let n = 0;
  db.exec("BEGIN");
  for (const c of linhas) {
    const nomes = [c.name, c.ascii, c.name_pt, c.name_es, c.name_en].filter(Boolean);
    // As formas normalizadas dos NOMES (só nomes) — é sobre isso que a rota
    // faz o LIKE de "nome exato".
    const formas = new Set();
    for (const nome of nomes) {
      formas.add(normalize(nome));
      formas.add(semApostrofo(nome));
    }
    formas.delete("");
    atualizarNorm.run("|" + [...formas].join("|") + "|", c.geonameid);

    // O blob do FTS é mais largo que `norm`: entra também estado, país e os
    // apelidos alternativos.
    const termos = new Set(formas);
    for (const alt of alternativos.all(c.geonameid)) {
      termos.add(normalize(alt.name));
      termos.add(semApostrofo(alt.name));
    }
    if (c.admin1) {
      termos.add(normalize(c.admin1));
      const porExtenso = NOME_POR_UF[c.admin1];
      if (porExtenso) termos.add(porExtenso);
    }
    const p = nomesPais.get(c.country_code);
    if (p) {
      for (const lang of ["pt", "es", "en"]) if (p[lang]) termos.add(normalize(p[lang]));
    }
    termos.add(normalize(c.country_code));
    termos.delete("");
    inserirFts.run(c.geonameid, [...termos].join(" "));

    n++;
    if (n % 25000 === 0) log(`    ...${n.toLocaleString("pt-BR")} indexadas`);
  }
  db.exec("COMMIT");
  return n;
}

// ===========================================================================
// PASSO 4 — PONTE DE COMPATIBILIDADE (id antigo -> geonameid)
//
// Cruza os 426 ids de lib/cities.js com o GeoNames por NOME + PAÍS +
// PROXIMIDADE de lat/lon. O país sai do próprio id: eles terminam sempre com
// o ISO2 minúsculo ("sao-paulo-br", "bogota-co"), o que foi conferido nos 426.
//
// Por que não casar só por nome: "São Francisco" existe em 8 estados
// brasileiros, "Santa Maria" em dezenas de países. E por que não casar só por
// coordenada: municípios vizinhos ficam a 10-20 km um do outro. Nome + país
// filtra, e a distância desempata e ATESTA — se a cidade certa foi encontrada,
// a distância é de poucos km (as duas bases usam a sede do município).
//
// A distância vira parte do relatório de propósito: um "casou" a 300 km é um
// homônimo, não um acerto, e precisa aparecer como suspeito em vez de entrar
// mudo na tabela.
//
// E AQUI ESTÁ A DECISÃO QUE IMPORTA: um casamento ERRADO é MUITO pior que
// casamento nenhum. O app guarda o OBJETO INTEIRO da cidade no aparelho
// (screens/BirthChartScreen.js: `{ date, time, city }`, com lat/lon/utcOffset
// dentro), não só o id — então quando esta tabela não tem a entrada, a rota
// responde 404, o app continua com o que já tinha e ninguém perde nada. A
// ponte é um UPGRADE (ganhar o fuso IANA e o horário de verão), não um
// resgate. Já um id mapeado pra cidade errada substitui coordenada boa por
// coordenada ruim em silêncio e estraga o Ascendente de quem estava certo.
// Por isso homônimo distante é RECUSADO, e não gravado com um aviso.
//
// Caso real encontrado rodando isto: "mesquita-rj-br" (Mesquita/RJ, 168 mil
// habitantes, município desde 1999). O cities1000 não tem essa Mesquita —
// tem uma Mesquita em MINAS GERAIS com 5.040 habitantes, a 408 km. Casar por
// nome puro teria mandado todo mundo de Mesquita/RJ pra um vilarejo em MG.
// ===========================================================================
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function construirPonte(db, legado) {
  const porNomePais = db.prepare(
    "SELECT geonameid, lat, lon, population, norm FROM cities WHERE country_code = ? AND norm LIKE ?"
  );
  const porGeo = db.prepare(`
    SELECT geonameid, lat, lon, population FROM cities
    WHERE country_code = ? AND lat BETWEEN ? AND ? AND lon BETWEEN ? AND ?
  `);
  const inserir = db.prepare(
    "INSERT OR REPLACE INTO legacy_city_ids (old_id, geonameid, match_kind, distance_km) VALUES (?, ?, ?, ?)"
  );

  const RAIO_GEO_KM = 25; //     até onde a busca por coordenada procura
  const LIMITE_EXATO_KM = 15; // duas bases apontando a mesma sede de município
  const LIMITE_PROXIMO_KM = 60; // sede movida / precisão diferente, ainda é ela

  // Busca por COORDENADA, usada quando o nome não resolve.
  //
  // A regra não é "o mais perto" nem "o maior", porque medindo os dois nos
  // dados reais cada um erra num caso:
  //   - o mais PERTO de "Cidade do Panamá" é "Bella Vista" a 0,66 km, que é um
  //     BAIRRO da Cidade do Panamá (o cities1000 tem bairros como entrada, com
  //     população 0);
  //   - o mais POPULOSO perto de "Mesquita/RJ" é Duque de Caxias a 15,3 km,
  //     quando Nilópolis está a 4,8 km e serve melhor.
  // Então: primeiro joga fora o que é ruído perto do vizinho grande (menos de
  // 10% da maior população do raio — é o que elimina bairro de população 0 e
  // vilarejo), e só depois pega o MAIS PERTO do que sobrou. Isso acerta os
  // dois casos: Cidade do Panamá -> Panama City (1,25 km) e Mesquita/RJ ->
  // Nilópolis (4,8 km).
  function acharPorCoordenada(iso, lat, lon) {
    const grau = RAIO_GEO_KM / 111;
    const candidatos = [];
    for (const c of porGeo.all(iso, lat - grau, lat + grau, lon - grau, lon + grau)) {
      const d = haversineKm(lat, lon, c.lat, c.lon);
      if (d <= RAIO_GEO_KM) candidatos.push({ gid: c.geonameid, d, pop: c.population });
    }
    if (!candidatos.length) return null;
    const maiorPop = Math.max(...candidatos.map((c) => c.pop));
    const corte = maiorPop * 0.1;
    const relevantes = candidatos.filter((c) => c.pop >= corte && c.pop > 0);
    const conjunto = relevantes.length ? relevantes : candidatos;
    return conjunto.reduce((a, b) => (b.d < a.d ? b : a));
  }

  const relatorio = { exato: 0, proximo: 0, "so-geo": 0, recusados: [], semCasamento: [] };

  db.exec("BEGIN");
  for (const antiga of legado) {
    const iso = antiga.id.split("-").pop().toUpperCase();
    const alvo = normalize(antiga.name);

    let porNome = null;
    for (const cand of porNomePais.all(iso, `%|${alvo}|%`)) {
      const d = haversineKm(antiga.lat, antiga.lon, cand.lat, cand.lon);
      if (!porNome || d < porNome.d) porNome = { gid: cand.geonameid, d };
    }

    let escolhido = null;
    let tipo = null;

    if (porNome && porNome.d <= LIMITE_EXATO_KM) {
      escolhido = porNome;
      tipo = "exato";
    } else if (porNome && porNome.d <= LIMITE_PROXIMO_KM) {
      escolhido = porNome;
      tipo = "proximo";
    } else {
      // Ou o nome não bateu em nada (grafia diferente, exônimo em português:
      // "Cidade do México", "Assunção", "Montevidéu"), ou bateu longe demais
      // pra ser a mesma cidade. Nos DOIS casos a coordenada é o dado mais
      // confiável que a entrada antiga tem — é ela que decide agora.
      const geo = acharPorCoordenada(iso, antiga.lat, antiga.lon);
      if (geo) {
        escolhido = geo;
        tipo = "so-geo";
      } else if (porNome) {
        // Só existe um homônimo distante e nada na coordenada. NÃO grava:
        // ver o bloco de comentário do topo desta função.
        relatorio.recusados.push({ id: antiga.id, km: porNome.d.toFixed(0) });
        continue;
      } else {
        relatorio.semCasamento.push(antiga.id);
        continue;
      }
    }

    inserir.run(antiga.id, escolhido.gid, tipo, Number(escolhido.d.toFixed(2)));
    relatorio[tipo]++;
  }
  db.exec("COMMIT");
  return relatorio;
}

// ===========================================================================
// MAIN
// ===========================================================================
async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    process.stdout.write(fs.readFileSync(__filename, "utf8").split("\n").slice(1, 62).join("\n") + "\n");
    return;
  }

  const destino = path.resolve(opts.out || path.join(DATA_DIR, "cities.sqlite"));
  assertDestinoSeguro(destino);
  const dirCache = path.resolve(opts.cache || path.join(DATA_DIR, "_geonames"));
  const tmp = destino + ".tmp";

  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.mkdirSync(dirCache, { recursive: true });

  const t0 = Date.now();
  log("=".repeat(74));
  log("IMPORTADOR DE CIDADES — GeoNames (CC BY 4.0) -> " + destino);
  log("=".repeat(74));

  // ---- fontes -------------------------------------------------------------
  let fonteCidades;
  let fonteAlternativos;
  let fonteAdmin1;
  const amostra = opts.sample;

  if (amostra) {
    const dir = path.join(__dirname, "fixtures");
    log(`MODO AMOSTRA — lendo ${dir} (sem rede)`);
    fonteCidades = () => fs.createReadStream(path.join(dir, "cities-sample.txt"));
    fonteAlternativos = () => fs.createReadStream(path.join(dir, "alternateNames-sample.txt"));
    fonteAdmin1 = () => fs.createReadStream(path.join(dir, "admin1-sample.txt"));
  } else {
    log("1/6  Baixando o dataset do GeoNames");
    const zipCidades = await baixarSeMudou(ARQUIVOS.cities, dirCache, opts.download);
    const zipAlt = await baixarSeMudou(ARQUIVOS.alternates, dirCache, opts.download);
    const txtAdmin1 = await baixarSeMudou(ARQUIVOS.admin1, dirCache, opts.download);

    const entradasCidades = await lerEntradasZip(zipCidades);
    const eCidades = entradasCidades.find((e) => e.nome === "cities1000.txt");
    if (!eCidades) throw new Error("cities1000.txt não está dentro do zip");
    const entradasAlt = await lerEntradasZip(zipAlt);
    const eAlt = entradasAlt.find((e) => e.nome === "alternateNames.txt");
    if (!eAlt) throw new Error("alternateNames.txt não está dentro do zip");

    fonteCidades = () => abrirEntradaZip(zipCidades, eCidades);
    fonteAlternativos = () => abrirEntradaZip(zipAlt, eAlt);
    fonteAdmin1 = () => fs.createReadStream(txtAdmin1);
  }

  // ---- banco temporário ---------------------------------------------------
  if (fs.existsSync(tmp)) fs.rmSync(tmp, { force: true });
  const db = new Database(tmp);
  db.exec(ESQUEMA);

  // ---- admin1 -------------------------------------------------------------
  log("2/6  Lendo os códigos de estado (admin1)");
  const admin1 = new Map();
  for await (const linha of linhasDe(await fonteAdmin1())) {
    const c = linha.split("\t");
    if (c.length < 2) continue;
    // col 1 = nome em UTF-8 ("São Paulo", "Hyōgo"), col 2 = a versão ascii.
    // Guardamos o UTF-8 porque é o que tem acento certo no que interessa (as
    // 27 UFs do Brasil, o mercado principal). Fora do Brasil o GeoNames
    // publica esse campo majoritariamente em inglês ou na transliteração
    // local ("North Rhine-Westphalia", e não "Nordrhein-Westfalen") — não é
    // traduzido por idioma, e é assim que sai na resposta. Aceitável: o campo
    // `admin` é desempate visual entre homônimos, o peso da linha está no
    // nome da cidade e no país, que ESTÃO traduzidos.
    admin1.set(c[0], c[1]);
  }
  log(`     ${admin1.size} divisões administrativas`);

  // ---- cidades ------------------------------------------------------------
  log("3/6  Importando cidades (cities1000)");
  const rCidades = await importarCidades(db, linhasDe(await fonteCidades()), opts.minPop, admin1);
  log(`     ${rCidades.gravadas.toLocaleString("pt-BR")} cidades de ${rCidades.paises.size} países`);
  if (!rCidades.gravadas) throw new Error("nenhuma cidade importada — dataset vazio ou corrompido");

  // ---- países -------------------------------------------------------------
  log("4/6  Traduzindo nomes de país (pt/es/en)");
  const nomesPais = new Map();
  const inserirPais = db.prepare("INSERT OR REPLACE INTO countries (iso2, name_pt, name_es, name_en) VALUES (?, ?, ?, ?)");
  db.exec("BEGIN");
  for (const iso of rCidades.paises) {
    const n = nomesDePais(iso);
    nomesPais.set(iso, n);
    inserirPais.run(iso, n.pt, n.es, n.en);
  }
  db.exec("COMMIT");
  log(`     ${nomesPais.size} países`);

  // ---- nomes alternativos -------------------------------------------------
  log("5/6  Importando nomes em pt/es/en (alternateNames) — é o passo mais lento");
  const rAlt = await importarAlternativos(db, linhasDe(await fonteAlternativos()));
  const comPt = db.prepare("SELECT COUNT(*) c FROM cities WHERE name_pt IS NOT NULL").pluck().get();
  const comEs = db.prepare("SELECT COUNT(*) c FROM cities WHERE name_es IS NOT NULL").pluck().get();
  const comEn = db.prepare("SELECT COUNT(*) c FROM cities WHERE name_en IS NOT NULL").pluck().get();
  log(`     nome próprio em pt: ${comPt.toLocaleString("pt-BR")} | es: ${comEs.toLocaleString("pt-BR")} | en: ${comEn.toLocaleString("pt-BR")}`);

  // ---- índice -------------------------------------------------------------
  log("6/6  Montando o índice de busca (FTS5, sem acento, 3 idiomas)");
  const indexadas = construirIndice(db, nomesPais);
  log(`     ${indexadas.toLocaleString("pt-BR")} cidades indexadas`);

  // ---- ponte --------------------------------------------------------------
  let ponte = null;
  const arquivoLegado = path.join(__dirname, "legacy-cities.json");
  if (fs.existsSync(arquivoLegado)) {
    log("     Construindo a ponte de compatibilidade (ids antigos do app)");
    const legado = JSON.parse(fs.readFileSync(arquivoLegado, "utf8"));
    ponte = construirPonte(db, legado);
    ponte.total = legado.length;
  } else {
    log(`     AVISO: ${arquivoLegado} não existe — ponte de ids antigos NÃO foi construída.`);
    log("     Sem ela, quem já tinha cidade salva no app perde a seleção. Ver o README.");
  }

  // ---- fecha --------------------------------------------------------------
  const carimbo = new Date().toISOString();
  const gravarMeta = db.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)");
  gravarMeta.run("built_at", carimbo);
  gravarMeta.run("source", amostra ? "amostra (scripts/fixtures)" : BASE_URL + "cities1000.zip");
  gravarMeta.run("license", "GeoNames CC BY 4.0 — https://www.geonames.org");
  gravarMeta.run("cities", String(rCidades.gravadas));
  gravarMeta.run("min_population", String(opts.minPop));
  gravarMeta.run("importer_version", "1");

  db.exec("DROP TABLE _alt");
  db.exec("VACUUM"); // devolve o espaço da _alt e deixa o arquivo compacto

  // ---- PROVA: a busca funciona neste banco, com o CÓDIGO DA ROTA ----------
  // Não é uma consulta parecida escrita à mão aqui: é a mesma função
  // searchCities() que a rota HTTP chama. Se o índice estiver quebrado, isto
  // falha AGORA, e não semana que vem no celular de alguém.
  const { searchCities } = require("../src/http/citiesRoutes");
  const provas = [];
  for (const termo of ["junqueiropolis", "Junqueirópolis", "junqueiro"]) {
    const r = searchCities(db, { q: termo, lang: "pt", limit: 3, at: "2015-01-20T14:30" });
    provas.push({ termo, itens: r.ok ? r.items : [], erro: r.ok ? null : r.error });
  }

  db.close();

  // Renomeia por cima só depois de tudo dar certo.
  fs.renameSync(tmp, destino);
  const tamanho = fs.statSync(destino).size;

  // =========================================================================
  // RELATÓRIO
  // =========================================================================
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  const L = "-".repeat(74);
  process.stdout.write("\n" + "=".repeat(74) + "\n");
  process.stdout.write("IMPORTAÇÃO CONCLUÍDA\n");
  process.stdout.write("=".repeat(74) + "\n");
  process.stdout.write(`Arquivo .......... ${destino}\n`);
  process.stdout.write(`Tamanho .......... ${mb(tamanho)} (${tamanho.toLocaleString("pt-BR")} bytes)\n`);
  process.stdout.write(`Cidades .......... ${rCidades.gravadas.toLocaleString("pt-BR")}\n`);
  process.stdout.write(`Países ........... ${rCidades.paises.size}\n`);
  process.stdout.write(`Nomes pt/es/en ... ${comPt.toLocaleString("pt-BR")} / ${comEs.toLocaleString("pt-BR")} / ${comEn.toLocaleString("pt-BR")}\n`);
  process.stdout.write(`Linhas de alt .... ${rAlt.lidas.toLocaleString("pt-BR")} lidas, ${rAlt.guardadas.toLocaleString("pt-BR")} aproveitadas\n`);
  process.stdout.write(`Tempo ............ ${seg}s\n`);
  process.stdout.write(`Gerado em ........ ${carimbo}\n`);
  process.stdout.write(`Fonte ............ GeoNames, CC BY 4.0 — https://www.geonames.org\n`);

  if (ponte) {
    process.stdout.write(L + "\n");
    process.stdout.write("PONTE DE COMPATIBILIDADE (ids antigos de lib/cities.js -> geonameid)\n");
    if (amostra) {
      process.stdout.write(
        "  ATENÇÃO: rodou em MODO AMOSTRA. Estes números não valem nada — a amostra\n" +
          "  tem ~135 cidades, então quase tudo aqui é 'sem candidato' por falta de dado,\n" +
          "  não por falha do casamento. Os números reais só saem no import completo.\n"
      );
    }
    const casados = ponte.exato + ponte.proximo + ponte["so-geo"];
    const pct = ((casados / ponte.total) * 100).toFixed(1);
    process.stdout.write(`  casaram automaticamente ... ${casados} de ${ponte.total}  (${pct}%)\n`);
    process.stdout.write(`    nome + <=15 km .......... ${ponte.exato}\n`);
    process.stdout.write(`    nome + <=60 km .......... ${ponte.proximo}\n`);
    process.stdout.write(`    só coordenada (<=25 km) . ${ponte["so-geo"]}\n`);
    process.stdout.write(`  RECUSADOS (homônimo longe) ${ponte.recusados.length}\n`);
    process.stdout.write(`  sem nenhum candidato ...... ${ponte.semCasamento.length}\n`);
    if (ponte.recusados.length) {
      process.stdout.write(
        `    recusados: ${ponte.recusados.map((s) => `${s.id} (homônimo a ${s.km} km)`).join(", ")}\n`
      );
      process.stdout.write(
        "    (recusar é o certo: o app guarda o objeto inteiro da cidade no aparelho,\n" +
          "     então sem entrada na ponte ele fica com o que já tinha — nada se perde.)\n"
      );
    }
    if (ponte.semCasamento.length) {
      // Truncado: no import completo essa lista tem 0-3 itens, mas em amostra
      // ela tem centenas e afogaria o resto do relatório.
      const mostra = ponte.semCasamento.slice(0, 15).join(", ");
      const resto = ponte.semCasamento.length - 15;
      process.stdout.write(`    sem candidato: ${mostra}${resto > 0 ? ` ... (+${resto})` : ""}\n`);
    }
  }

  // -------------------------------------------------------------------------
  // A PROVA QUE O DONO PEDIU
  // -------------------------------------------------------------------------
  process.stdout.write(L + "\n");
  process.stdout.write('TESTE DE BUSCA — "Junqueirópolis" (a cidade do testador que faltava)\n');
  let achou = false;
  for (const p of provas) {
    process.stdout.write(`\n  q="${p.termo}"\n`);
    if (p.erro) {
      process.stdout.write(`    ERRO: ${p.erro}\n`);
      continue;
    }
    if (!p.itens.length) {
      process.stdout.write("    (nenhum resultado)\n");
      continue;
    }
    for (const c of p.itens) {
      if (/junqueiropolis/.test(normalize(c.name))) achou = true;
      const dst = c.dstAt ? "  [horário de verão aplicado]" : "";
      process.stdout.write(
        `    ${c.id}  ${c.name}, ${c.admin} — ${c.country}\n` +
          `      lat ${c.lat}  lon ${c.lon}  pop ${c.population.toLocaleString("pt-BR")}\n` +
          `      timezone ${c.timezone}  utcOffset(padrão) ${c.utcOffset}` +
          (c.utcOffsetAt !== undefined ? `  utcOffset em 20/01/2015 14:30 = ${c.utcOffsetAt}${dst}` : "") +
          "\n"
      );
    }
  }
  process.stdout.write("\n" + L + "\n");
  if (achou) {
    process.stdout.write("RESULTADO: Junqueirópolis EXISTE na busca. O relato do testador está resolvido.\n");
  } else {
    process.stdout.write("RESULTADO: Junqueirópolis NÃO foi encontrada — o índice não está certo.\n");
  }
  process.stdout.write("=".repeat(74) + "\n");

  if (opts.limparCache && !amostra) {
    fs.rmSync(dirCache, { recursive: true, force: true });
    log("cache de downloads apagado (--clean-cache)");
  }

  if (!achou) process.exitCode = 1;
}

// Só roda quando é CHAMADO. Importar este arquivo (o teste faz isso) não
// dispara download nenhum.
if (require.main === module) {
  main().catch((err) => {
    process.stderr.write("\nFALHOU: " + (err && err.stack ? err.stack : err) + "\n");
    process.exitCode = 1;
  });
}

module.exports = {
  normalize,
  semApostrofo,
  offsetPadraoHoras,
  haversineKm,
  construirPonte,
  construirIndice,
  importarCidades,
  importarAlternativos,
  lerEntradasZip,
  abrirEntradaZip,
  linhasDe,
  ESQUEMA,
  UF_POR_NOME,
  assertDestinoSeguro,
  nomesDePais,
};
