// test/seita.test.js
// A SEITA — diurno × noturno, e as travas que impedem esta feature de virar
// invenção.
//
// Este arquivo guarda seis leis:
//
//   1. A CONTA ESTÁ CERTA, E O SINAL NÃO PODE INVERTER. O critério do eixo
//      Ascendente–Descendente é conferido contra a ALTITUDE GEOMÉTRICA do Sol,
//      calculada por outro caminho inteiro (astronomy-engine Equator+Horizon),
//      em milhares de instantes e em seis latitudes — incluindo Longyearbyen
//      (78°N), onde o Sol passa dias sem se pôr. Uma inversão de sinal aqui
//      seria invisível na tela e permanente no produto.
//   2. NUNCA FABRICAR CÉU. Sem data, sem hora, sem cidade ou sem efeméride, a
//      função declara indisponível, diz o que falta e diz ONDE informar. Não
//      existe "chuta meio-dia" nesta feature: meio-dia e meia-noite do mesmo
//      dia dão seitas opostas.
//   3. O PT É OURO. test/golden/seita.pt.golden.json foi capturado no
//      nascimento do módulo. Dois hashes: um só do texto (imune a atualização
//      de efeméride) e um do resultado inteiro.
//   4. PARIDADE DOS TRÊS PACKS. Mesma forma, mesmas chaves, nenhum valor
//      vazio, nenhum placeholder por interpolar, nenhum vazamento de PT em
//      es/en. E `lang` ausente é byte a byte o `lang='pt'`.
//   5. LINHA VERMELHA nos três idiomas: nada de saúde nem seus primos, nada de
//      veredito, nada de promessa, nada de porcentagem.
//   6. A FONTE, E SÓ A FONTE. A tabela de seita bate com Ptolomeu I.7 e Valente
//      I.1; as classes batem com I.5 (a Lua É benéfica, o Sol NÃO é); o
//      verbatim inglês é idêntico nos três packs; os modernos declaram que
//      seita não se aplica, com o ano; e — a trava mais importante desta
//      feature — nenhuma leitura afirma que maléfico FORA da seita é pior,
//      porque a base não achou a linha antiga que autorize isso.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const S = require('../lib/seita.js');
const { SIGNS, ascendantSign } = require('../lib/signs.js');
const PT = require('../lib/traducoes/seita.pt.js').PACK;
const ES = require('../lib/traducoes/seita.es.js').PACK;
const EN = require('../lib/traducoes/seita.en.js').PACK;
const A = require('astronomy-engine');

const LANGS = { pt: PT, es: ES, en: EN };

const SP = { id: 'sao-paulo-br', name: 'São Paulo', lat: -23.5505, lon: -46.6333, utcOffset: -3, timezone: 'America/Sao_Paulo' };
const NY = { id: 'nova-york-us', name: 'Nova York', lat: 40.7128, lon: -74.006, utcOffset: -5, timezone: 'America/New_York' };

const DIA = S.seitaDoMapa('1990-06-15', '14:30', SP);
const NOITE = S.seitaDoMapa('1990-06-15', '23:30', SP);
const TODOS_OS_PLANETAS = [...S.ORDEM_DOS_SETE, ...Object.keys(S.MODERNOS)];

// ===========================================================================
// 1. A CONTA — o sinal, conferido por outro caminho 📐
// ===========================================================================

// Altitude geométrica do Sol (sem refração): o caminho independente.
function altitudeDoSol(instante, lat, lon) {
  const obs = new A.Observer(lat, lon, 0);
  const eq = A.Equator(A.Body.Sun, instante, obs, true, true);
  return A.Horizon(instante, obs, eq.ra, eq.dec, null).altitude;
}

// O mesmo critério de lib/seita.js, escrito aqui em cima do grau exportado —
// se o módulo mudar o sinal, este teste vê.
function diurnoPeloEixo(instante, lat, lon) {
  const dataStr = instante.toISOString().slice(0, 10);
  const horaStr = instante.toISOString().slice(11, 16);
  const asc = S.ascendenteGrau(dataStr, horaStr, lat, lon, 0);
  const solLon = ((A.SunPosition(instante).elon % 360) + 360) % 360;
  const delta = ((solLon - asc) % 360 + 360) % 360;
  return { diurno: delta > 180, delta };
}

test('📐 o eixo Ascendente–Descendente concorda com a altitude real do Sol, de 78°N a 54°S', () => {
  const lugares = [
    ['Longyearbyen', 78.2232, 15.6469],
    ['Tromsø', 69.6492, 18.9553],
    ['Reiquiavique', 64.1466, -21.9426],
    ['São Paulo', -23.5505, -46.6333],
    ['Quito', -0.1807, -78.4678],
    ['Ushuaia', -54.8019, -68.303],
  ];
  const base = Date.UTC(2000, 0, 1, 0, 0, 0);
  const PASSO_MIN = 211; // primo: varre todas as fases do dia ao longo do ano
  let total = 0;
  let divergencias = 0;
  let piorAltitude = 0;

  for (const [nome, lat, lon] of lugares) {
    for (let t = 0; t < 365 * 24 * 60; t += PASSO_MIN) {
      const instante = new Date(base + t * 60000);
      const { diurno } = diurnoPeloEixo(instante, lat, lon);
      const alt = altitudeDoSol(instante, lat, lon);
      total++;
      if (diurno !== alt > 0) {
        divergencias++;
        piorAltitude = Math.max(piorAltitude, Math.abs(alt));
        assert.ok(
          Math.abs(alt) < 0.02,
          `${nome} ${instante.toISOString()}: o eixo diz ${diurno ? 'diurno' : 'noturno'} e o Sol está a ${alt.toFixed(4)}° do horizonte. Isso não é borda de cruzamento — é sinal invertido.`
        );
      }
    }
  }

  assert.ok(total > 12000, `varredura magra demais: ${total} instantes`);
  // As únicas divergências toleradas são as do instante EXATO do cruzamento,
  // onde os dois métodos diferem só por latitude eclíptica e paralaxe.
  assert.ok(
    divergencias / total < 0.001,
    `${divergencias} divergências em ${total} (pior altitude ${piorAltitude.toFixed(5)}°) — isso é sistemático, não borda`
  );
});

test('meio-dia é diurno e meia-noite é noturna, nos dois hemisférios e nas duas estações', () => {
  for (const cidade of [SP, NY]) {
    for (const data of ['1990-01-15', '1990-07-15']) {
      assert.equal(S.seitaDoMapa(data, '12:00', cidade).seita, 'diurno', `${cidade.name} ${data} 12:00`);
      assert.equal(S.seitaDoMapa(data, '00:00', cidade).seita, 'noturno', `${cidade.name} ${data} 00:00`);
    }
  }
});

test('o grau do Ascendente daqui bate com o signo de ascendantSign() de lib/signs.js', () => {
  for (const cidade of [SP, NY]) {
    for (const data of ['1950-01-15', '1972-02-29', '1990-06-15', '2011-11-11', '2024-07-07']) {
      for (const hora of ['00:10', '04:20', '08:30', '12:40', '16:50', '20:05']) {
        const grau = S.ascendenteGrau(data, hora, cidade.lat, cidade.lon, cidade);
        assert.equal(typeof grau, 'number');
        assert.ok(grau >= 0 && grau < 360);
        const daqui = SIGNS[Math.floor(grau / 30)].name;
        const deLa = ascendantSign(data, hora, cidade.lat, cidade.lon, cidade).name;
        assert.equal(daqui, deLa, `${cidade.name} ${data} ${hora}: a seita e o Mapa Astral discordariam na tela`);
      }
    }
  }
});

test('a distância ao horizonte é coerente com a seita e sempre cabe em 0–90°', () => {
  for (const cidade of [SP, NY]) {
    for (let h = 0; h < 24; h++) {
      const r = S.seitaDoMapa('1990-06-15', `${String(h).padStart(2, '0')}:07`, cidade);
      assert.ok(r.grausDoHorizonte >= 0 && r.grausDoHorizonte <= 90, `${h}h -> ${r.grausDoHorizonte}`);
      assert.equal(r.sol.acimaDoHorizonte, r.seita === 'diurno');
      assert.equal(r.limitrofe, r.grausDoHorizonte < S.LIMIAR_LIMITROFE_GRAUS);
      assert.equal(r.notaLimitrofe === null, !r.limitrofe);
    }
  }
});

test('a faixa limítrofe avisa, e o aviso diz que os 3 graus são escolha do app', () => {
  const perto = S.seitaDoMapa('1990-06-01', '06:45', SP);
  assert.equal(perto.limitrofe, true);
  assert.ok(perto.grausDoHorizonte < 1, `esperava chamada apertada, veio ${perto.grausDoHorizonte}`);
  assert.match(perto.notaLimitrofe, /3 graus/);
  assert.match(perto.notaLimitrofe, /escolha nossa|não regra antiga/);
  // E o mesmo caso, meia hora depois, já não é limítrofe.
  assert.equal(S.seitaDoMapa('1990-06-01', '08:45', SP).limitrofe, false);
});

// ===========================================================================
// 2. NUNCA FABRICAR CÉU
// ===========================================================================

const NOME_DA_TELA = { pt: 'Mapa Astral', es: 'Carta Astral', en: 'Birth Chart' };

test('sem data, sem hora ou sem cidade: declara indisponível, nunca chuta uma seita', () => {
  const casos = [
    [S.seitaDoMapa(null, '14:30', SP), 'data'],
    [S.seitaDoMapa('', '14:30', SP), 'data'],
    [S.seitaDoMapa('1990-02-30', '14:30', SP), 'data'],
    [S.seitaDoMapa('15/06/1990', '14:30', SP), 'data'],
    [S.seitaDoMapa('1990-06-15', null, SP), 'hora'],
    [S.seitaDoMapa('1990-06-15', '', SP), 'hora'],
    [S.seitaDoMapa('1990-06-15', '25:00', SP), 'hora'],
    [S.seitaDoMapa('1990-06-15', '14h30', SP), 'hora'],
    [S.seitaDoMapa('1990-06-15', '14:30', null), 'cidade'],
    [S.seitaDoMapa('1990-06-15', '14:30', {}), 'cidade'],
    [S.seitaDoMapa('1990-06-15', '14:30', { lat: -23.5, lon: null }), 'cidade'],
  ];
  for (const [r, motivo] of casos) {
    assert.equal(r.disponivel, false, motivo);
    assert.equal(r.seita, null);
    assert.equal(r.chamada, null);
    assert.deepEqual(r.falta, [motivo]);
    assert.deepEqual(r.planetasDaSeita, []);
    assert.equal(r.grausDoHorizonte, null);
    assert.ok(r.explicacao.length > 80, 'a explicação do que falta não pode ser um rótulo seco');
    assert.ok(r.comoResolver.length > 20);
    // A fonte continua junto: a doutrina não some porque falta um campo.
    assert.ok(r.fonte.length >= 5);
  }
});

test('o que falta vem sempre com ONDE resolver, e o nome da tela é o do idioma', () => {
  for (const lang of ['pt', 'es', 'en']) {
    for (const motivo of ['data', 'hora', 'cidade', 'efemeride']) {
      const f = LANGS[lang].falta[motivo];
      assert.ok(f.texto.trim().length > 60, `${lang}/${motivo}`);
      assert.ok(f.comoResolver.includes(NOME_DA_TELA[lang]), `${lang}/${motivo} não diz onde informar: ${f.comoResolver}`);
    }
  }
});

test('faltando a HORA, a mensagem explica por que não dá pra chutar', () => {
  const r = S.seitaDoMapa('1990-06-15', null, SP);
  assert.match(r.explicacao, /Meio-dia e meia-noite/);
  assert.match(r.comoResolver, /hora de nascimento/);
  assert.match(r.comoResolver, /Mapa Astral/);
});

test('lib/seita.js não fala com AsyncStorage — nem direto, nem por require', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'seita.js'), 'utf8');
  assert.ok(!/AsyncStorage/.test(src), 'storage aqui só via lib/storage.js — e esta feature não precisa de storage nenhum');
  assert.ok(!/@react-native-async-storage/.test(src));
});

// ===========================================================================
// 3. O PT É OURO
// ===========================================================================

const GOLDEN = JSON.parse(fs.readFileSync(path.join(__dirname, 'golden', 'seita.pt.golden.json'), 'utf8'));

function canon(v) {
  if (typeof v === 'number') return Number(v.toFixed(6));
  if (Array.isArray(v)) return v.map(canon);
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v).sort()) o[k] = canon(v[k]);
    return o;
  }
  return v;
}

function apenasTexto(v, saida) {
  if (typeof v === 'string') saida.push(v.replace(/\d+([.,]\d+)?/g, '<n>'));
  else if (Array.isArray(v)) v.forEach((x) => apenasTexto(x, saida));
  else if (v && typeof v === 'object') for (const k of Object.keys(v).sort()) apenasTexto(v[k], saida);
  return saida;
}

function sha(x) {
  return crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
}

// Reconstrói exatamente o que o script de captura montou.
function recapturar() {
  const CIDADES = { SP: GOLDEN.cidades.SP, NY: GOLDEN.cidades.NY };
  const pares = {};
  for (const [chave, [data, hora, cid]] of Object.entries(GOLDEN.casos)) {
    pares[chave] = canon(S.seitaDoMapa(data, hora, CIDADES[cid]));
  }
  const semDado = {
    'sem-data': canon(S.seitaDoMapa(null, '14:30', CIDADES.SP)),
    'sem-hora': canon(S.seitaDoMapa('1990-06-15', null, CIDADES.SP)),
    'sem-cidade': canon(S.seitaDoMapa('1990-06-15', '14:30', null)),
    'data-impossivel': canon(S.seitaDoMapa('1990-02-30', '14:30', CIDADES.SP)),
  };
  const varredura = {};
  for (const cid of ['SP', 'NY']) {
    for (const d of GOLDEN.varreduraDatas) {
      for (const h of GOLDEN.varreduraHoras) varredura[`${cid}|${d}|${h}`] = canon(S.seitaDoMapa(d, h, CIDADES[cid]));
    }
  }
  const mapaDia = S.seitaDoMapa('1990-06-15', '14:30', CIDADES.SP);
  const mapaNoite = S.seitaDoMapa('1990-06-15', '23:30', CIDADES.SP);
  const linhas = {};
  for (const nome of TODOS_OS_PLANETAS) {
    linhas[`${nome}|mapa-diurno`] = canon(S.linhaDeSeita(nome, mapaDia));
    linhas[`${nome}|mapa-noturno`] = canon(S.linhaDeSeita(nome, mapaNoite));
    linhas[`${nome}|so-diurno`] = canon(S.linhaDeSeita(nome, 'diurno'));
    linhas[`${nome}|so-noturno`] = canon(S.linhaDeSeita(nome, 'noturno'));
    linhas[`${nome}|sem-mapa`] = canon(S.linhaDeSeita(nome, null));
  }
  return { pares, semDado, varredura, linhas };
}

const RECAPTURA = recapturar();

test('GOLDEN: a PROSA em PT é byte a byte a capturada (hash imune a efeméride)', () => {
  assert.equal(
    sha(apenasTexto(RECAPTURA, [])),
    GOLDEN.hashTexto,
    'O TEXTO PT MUDOU. É exatamente o que o golden existe pra impedir: compare com test/golden/seita.pt.golden.json antes de qualquer outra coisa.'
  );
});

test('GOLDEN: o resultado inteiro em PT confere, números incluídos', () => {
  assert.equal(
    sha(RECAPTURA),
    GOLDEN.hashCompleto,
    'Se o hash de TEXTO passou e este falhou, quem mudou foi o número — provavelmente a efeméride. Confira antes de recapturar.'
  );
});

test('GOLDEN: os casos de referência conferem campo a campo', () => {
  const CIDADES = { SP: GOLDEN.cidades.SP, NY: GOLDEN.cidades.NY };
  for (const [chave, esperado] of Object.entries(GOLDEN.pares)) {
    const [data, hora, cid] = GOLDEN.casos[chave];
    assert.deepEqual(canon(S.seitaDoMapa(data, hora, CIDADES[cid])), esperado, `caso golden ${chave} divergiu`);
  }
  for (const [chave, esperado] of Object.entries(GOLDEN.linhas)) {
    assert.deepEqual(RECAPTURA.linhas[chave], esperado, `linha golden ${chave} divergiu`);
  }
  for (const [chave, esperado] of Object.entries(GOLDEN.semDado)) {
    assert.deepEqual(RECAPTURA.semDado[chave], esperado, `indisponível golden ${chave} divergiu`);
  }
});

test("lang ausente e lang='pt' são a MESMA leitura; idioma desconhecido cai no PT", () => {
  const semLang = canon(S.seitaDoMapa('1990-06-15', '14:30', SP));
  for (const lang of ['pt', undefined, null, 'fr', 'de-DE', 42]) {
    const esperado = lang === 'pt' || lang === undefined || lang === null || typeof lang !== 'string' || !LANGS[lang] ? semLang : null;
    if (esperado) assert.deepEqual(canon(S.seitaDoMapa('1990-06-15', '14:30', SP, lang)), semLang, String(lang));
  }
  assert.deepEqual(canon(S.linhaDeSeita('Saturno', DIA, 'fr')), canon(S.linhaDeSeita('Saturno', DIA)));
});

// ===========================================================================
// 4. PARIDADE DOS TRÊS PACKS
// ===========================================================================

function forma(v) {
  if (typeof v === 'function') return 'fn';
  if (Array.isArray(v)) return v.map(forma);
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v).sort()) o[k] = forma(v[k]);
    return o;
  }
  return typeof v;
}

function varrerStrings(v, caminho, cb) {
  if (typeof v === 'string') return cb(caminho, v);
  if (Array.isArray(v)) return v.forEach((x, i) => varrerStrings(x, `${caminho}[${i}]`, cb));
  if (v && typeof v === 'object') for (const k of Object.keys(v)) varrerStrings(v[k], `${caminho}.${k}`, cb);
}

test('es e en têm EXATAMENTE a mesma forma do pt — mesmas chaves, mesmos tipos', () => {
  const formaPt = forma(PT);
  assert.deepEqual(forma(ES), formaPt, 'o pack es divergiu da forma do pt');
  assert.deepEqual(forma(EN), formaPt, 'o pack en divergiu da forma do pt');
});

test('as CHAVES de planeta são as mesmas nos três packs, e são as do motor', () => {
  for (const [lang, pack] of Object.entries(LANGS)) {
    assert.deepEqual(Object.keys(pack.planetas).sort(), [...TODOS_OS_PLANETAS].sort(), lang);
    assert.deepEqual(Object.keys(pack.recibos).sort(), [...TODOS_OS_PLANETAS].sort(), lang);
    assert.deepEqual(Object.keys(pack.linhas).sort(), [...S.ORDEM_DOS_SETE].sort(), lang);
    assert.deepEqual(Object.keys(pack.linhaModerna).sort(), Object.keys(S.MODERNOS).sort(), lang);
  }
});

test('nenhum valor de nenhum pack é vazio', () => {
  for (const [lang, pack] of Object.entries(LANGS)) {
    varrerStrings(pack, lang, (caminho, s) => assert.ok(s.trim().length > 0, `${caminho} está vazio`));
  }
});

// Tudo que o usuário lê numa leitura, num idioma.
function corpus(r) {
  return [
    r.chamada, r.explicacao, r.seitaNome, r.seitaMapa, r.notaCondicao, r.notaLeituraDoApp,
    r.notaLimitrofe, r.mercurio.texto, r.comoResolver,
    ...r.planetas.map((p) => `${p.nome} ${p.linha} ${p.recibo}`),
    ...r.verbatins.map((v) => `${v.texto} ${v.parafrase} ${v.locus}`),
    ...r.verbatinsDasClasses.map((v) => `${v.texto} ${v.parafrase} ${v.locus}`),
    ...r.fonte,
  ]
    .filter(Boolean)
    .join(' \n ');
}

// Uma leitura por idioma para cada seita, e mais as duas variantes de Mercúrio.
const AMOSTRA = {};
for (const lang of ['pt', 'es', 'en']) {
  AMOSTRA[lang] = [
    S.seitaDoMapa('1990-06-15', '14:30', SP, lang),
    S.seitaDoMapa('1990-06-15', '23:30', SP, lang),
    S.seitaDoMapa('1990-09-05', '14:30', SP, lang),
    S.seitaDoMapa('1990-01-10', '23:30', SP, lang),
    S.seitaDoMapa('2005-12-31', '21:00', NY, lang),
    S.seitaDoMapa('1990-06-01', '06:45', SP, lang),
  ];
}

test('a leitura sai INTEIRA nos três idiomas — nenhum campo perdido, nada por interpolar', () => {
  const CAMPOS = ['seita', 'seitaNome', 'seitaMapa', 'chamada', 'explicacao', 'notaCondicao', 'notaLeituraDoApp'];
  for (const lang of ['pt', 'es', 'en']) {
    for (const r of AMOSTRA[lang]) {
      for (const campo of CAMPOS) assert.ok(r[campo], `${lang} perdeu ${campo}`);
      assert.equal(r.planetas.length, 10, lang);
      assert.equal(r.fonte.length, 6, lang);
      assert.equal(r.verbatins.length, 2, lang);
      assert.equal(r.verbatinsDasClasses.length, 3, lang);
      const c = corpus(r);
      assert.ok(!c.includes('undefined'), `${lang} vazou "undefined"`);
      assert.ok(!c.includes('[object Object]'), `${lang} vazou objeto`);
      assert.ok(!c.includes('NaN'), `${lang} vazou NaN`);
      assert.ok(!/\$\{|\{\w+\}/.test(c), `${lang} vazou placeholder sem interpolar`);
      assert.ok(r.explicacao.length > 700, `${lang} explicação curta demais: ${r.explicacao.length}`);
      assert.ok(r.chamada.length > 100 && r.chamada.length < 400, `${lang} chamada com ${r.chamada.length}`);
      for (const p of r.planetas) assert.ok(p.linha.length > 100, `${lang} ${p.planeta} com linha curta`);
    }
  }
});

test('es e en não vazam português, e não repetem o pt', () => {
  const PT_MARCADO = /\bvocê\b|\bnão\b|\bsão\b|\bseita\b|\bmapa\b|\bnoturno\b|Vênus|Lua|Mercúrio|Plutão|Netuno|Júpiter e Vênus/i;
  for (const lang of ['es', 'en']) {
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      // O verbatim inglês é o mesmo nos três — e não é português.
      assert.ok(!PT_MARCADO.test(s), `${caminho} vazou português: ${s.match(PT_MARCADO)}`);
    });
    for (let i = 0; i < AMOSTRA.pt.length; i++) {
      assert.notEqual(AMOSTRA[lang][i].chamada, AMOSTRA.pt[i].chamada, `${lang} chamada igual ao pt`);
      assert.notEqual(AMOSTRA[lang][i].explicacao, AMOSTRA.pt[i].explicacao, `${lang} explicação igual ao pt`);
    }
  }
});

test('a conta não muda com o idioma — seita, graus e planetas são os mesmos', () => {
  for (let i = 0; i < AMOSTRA.pt.length; i++) {
    const pt = AMOSTRA.pt[i];
    for (const lang of ['es', 'en']) {
      const outro = AMOSTRA[lang][i];
      assert.equal(outro.seita, pt.seita);
      assert.equal(outro.grausDoHorizonte, pt.grausDoHorizonte);
      assert.equal(outro.limitrofe, pt.limitrofe);
      assert.equal(outro.mercurio.estrela, pt.mercurio.estrela);
      assert.deepEqual(outro.planetasDaSeita.map((p) => p.planeta), pt.planetasDaSeita.map((p) => p.planeta));
    }
  }
});

// ===========================================================================
// 5. A LINHA VERMELHA, NOS TRÊS IDIOMAS
// ===========================================================================
// Lista de PALAVRA, não de intenção: se a palavra passa hoje numa frase
// inocente, amanhã passa numa frase que promete tratamento.

const SAUDE = {
  pt: [
    /\b(alivi\w*|acalm\w*|cur(a|as|ar|am|ando)|sar(a|ar|am)|trat(a|am|ar|amento|amentos)|energiz\w*|terapia|terap[êe]utic\w*|rem[ée]dio)\b/i,
    /\bfertilidade\b|\bf[ée]rtil\b|engravidar|gravidez|ansiedade|depress[ãa]o|ins[ôo]nia/i,
  ],
  es: [
    /\b(alivi\w*|calm\w*|san(a|an|ar|aci[óo]n)|cur(a|an|ar|aci[óo]n)|trat(a|an|ar|amiento|amientos)|energiz\w*|terapia|terap[ée]utic\w*|remedio)\b/i,
    /\bfertilidad\b|\bf[ée]rtil\b|embarazo|embarazada|ansiedad|depresi[óo]n|insomnio/i,
  ],
  en: [
    /\b(relieve[sd]?|relief|sooth\w*|calm\w*|heal\w*|cure[sd]?|curing|treat(s|ed|ing|ment|ments)?|energiz\w*|therapy|therapeutic|remedy|remedies)\b/i,
    /\bfertility\b|\bfertile\b|pregnan\w*|anxiety|depression|insomnia/i,
  ],
};

const PROMESSA = {
  pt: [
    /\bvocê vai\b/i, /\bvai (ter|conseguir|ganhar|dar certo|acontecer)\b/i, /garant\w+/i,
    /com certeza você/i, /sorte grande/i, /destino selado/i, /\bcerteza de que\b/i,
  ],
  es: [
    /\bvas a (tener|lograr|conseguir|ganar)\b/i, /garantiz\w+/i, /suerte grande/i, /destino sellado/i,
  ],
  en: [
    /\byou will\b/i, /\byou'?re going to\b/i, /guarantee\w*/i, /destined to/i, /\bfated to\b/i,
  ],
};

test('nenhuma leitura, em nenhum idioma, usa linguagem de saúde ou seus primos', () => {
  for (const [lang, regexes] of Object.entries(SAUDE)) {
    for (const r of AMOSTRA[lang]) {
      const c = corpus(r);
      for (const re of regexes) assert.ok(!re.test(c), `${lang} — linha vermelha na leitura: ${c.match(re)}`);
    }
    // E o pack inteiro, inclusive o que nenhuma leitura exercita por acaso.
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      for (const re of regexes) assert.ok(!re.test(s), `${caminho} — linha vermelha: ${s.match(re)}`);
    });
  }
  // Contrapartida: varredura que não morde não protege ninguém.
  assert.ok(SAUDE.pt.some((re) => re.test('isso alivia a ansiedade')));
  assert.ok(SAUDE.es.some((re) => re.test('esto calma y sana')));
  assert.ok(SAUDE.en.some((re) => re.test('this will heal and soothe you')));
});

test('nenhuma leitura promete resultado nem decreta desfecho', () => {
  for (const [lang, regexes] of Object.entries(PROMESSA)) {
    for (const r of AMOSTRA[lang]) {
      const c = corpus(r);
      for (const re of regexes) assert.ok(!re.test(c), `${lang} — promessa: ${c.match(re)}`);
    }
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      for (const re of regexes) assert.ok(!re.test(s), `${caminho} — promessa: ${s.match(re)}`);
    });
  }
  assert.ok(PROMESSA.pt.some((re) => re.test('você vai conseguir tudo')));
  assert.ok(PROMESSA.en.some((re) => re.test('you will get the job')));
});

test('não existe porcentagem, nota nem score em lugar nenhum', () => {
  for (const lang of ['pt', 'es', 'en']) {
    for (const r of AMOSTRA[lang]) {
      assert.ok(!corpus(r).includes('%'), `${lang} mostra porcentagem`);
      assert.equal(r.pct, undefined);
      assert.equal(r.nota, undefined);
      assert.equal(r.score, undefined);
    }
  }
});

// ===========================================================================
// 6. PRENDE PRIMEIRO, FONTE DEPOIS
// ===========================================================================

const JARGAO = [
  /Ptolomeu|Ptolomeo|Ptolemy|Valente|Valens|Tetrabiblos|Anthologiae|Robbins|Riley|Greene/i,
  /\b[IVX]+\.\d+\b/,
  /\bhairesis\b/i,
  /\bseita\b|\bsecta\b|\bsect\b/i,
  /\bAscendente\b|\bAscendant\b|\bDescendente\b|\bDescendant\b|efem[ée]ride|ephemeris/i,
];

test('a CHAMADA abre na vida real: nenhum nome próprio, nenhum capítulo, nenhum termo técnico', () => {
  for (const lang of ['pt', 'es', 'en']) {
    for (const r of AMOSTRA[lang]) {
      for (const re of JARGAO) {
        assert.ok(!re.test(r.chamada), `${lang}: a chamada abriu com jargão — ${r.chamada.match(re)}`);
      }
    }
  }
});

test('o PRIMEIRO parágrafo da explicação também é vida real; a fonte vem DEPOIS', () => {
  for (const lang of ['pt', 'es', 'en']) {
    for (const r of AMOSTRA[lang]) {
      const paragrafos = r.explicacao.split('\n\n');
      assert.ok(paragrafos.length >= 4, `${lang}: a explicação tem ${paragrafos.length} parágrafos`);
      for (const re of JARGAO) {
        assert.ok(!re.test(paragrafos[0]), `${lang}: a abertura vazou jargão — ${paragrafos[0].match(re)}`);
      }
      // E o recibo está lá, mais adiante.
      assert.match(r.explicacao, /Tetrabiblos I\.7/);
      assert.match(r.explicacao, /Anthologiae I\.1/);
      assert.ok(r.explicacao.indexOf('Tetrabiblos') > paragrafos[0].length, `${lang}: a fonte abriu a leitura`);
    }
  }
});

test('o termo técnico ganha glosa na primeira aparição', () => {
  assert.match(AMOSTRA.pt[0].explicacao, /seita \(hairesis, no grego — o time a que cada planeta pertence\)/);
  assert.match(AMOSTRA.es[0].explicacao, /secta \(hairesis, en griego — el equipo al que pertenece cada planeta\)/);
  assert.match(AMOSTRA.en[0].explicacao, /sect \(hairesis, in Greek — the team each planet belongs to\)/);
});

// ===========================================================================
// 7. A FONTE, E SÓ A FONTE
// ===========================================================================

test('a tabela de seita é a de Ptolomeu I.7 e Valente I.1, planeta a planeta', () => {
  assert.deepEqual(Object.keys(S.SEITA_POR_PLANETA).sort(), [...S.ORDEM_DOS_SETE].sort());
  const diurnos = S.ORDEM_DOS_SETE.filter((n) => S.SEITA_POR_PLANETA[n].seita === 'diurno');
  const noturnos = S.ORDEM_DOS_SETE.filter((n) => S.SEITA_POR_PLANETA[n].seita === 'noturno');
  const comuns = S.ORDEM_DOS_SETE.filter((n) => S.SEITA_POR_PLANETA[n].comum);
  assert.deepEqual(diurnos.sort(), ['Júpiter', 'Saturno', 'Sol']);
  assert.deepEqual(noturnos.sort(), ['Lua', 'Marte', 'Vênus']);
  assert.deepEqual(comuns, ['Mercúrio']);
  // A etiqueta verbatim de Valente, e a ausência declarada de Mercúrio nela.
  assert.equal(S.SEITA_POR_PLANETA['Saturno'].valens, 'of the day sect');
  assert.equal(S.SEITA_POR_PLANETA['Marte'].valens, 'of the night sect');
  assert.equal(S.SEITA_POR_PLANETA['Mercúrio'].valens, null);
});

test('as classes são as de Tetrabiblos I.5 — a LUA é benéfica e o SOL não é', () => {
  const porClasse = (c) => S.ORDEM_DOS_SETE.filter((n) => S.SEITA_POR_PLANETA[n].classe === c).sort();
  assert.deepEqual(porClasse('benefico'), ['Júpiter', 'Lua', 'Vênus']);
  assert.deepEqual(porClasse('malefico'), ['Marte', 'Saturno']);
  assert.deepEqual(porClasse('comum'), ['Mercúrio', 'Sol']);
});

test('num mapa diurno quem joga em casa é o time do dia — e nunca o da noite', () => {
  const daSeita = DIA.planetasDaSeita.map((p) => p.planeta);
  for (const n of ['Sol', 'Júpiter', 'Saturno']) assert.ok(daSeita.includes(n), `${n} deveria estar na seita`);
  for (const n of ['Lua', 'Vênus', 'Marte']) assert.ok(!daSeita.includes(n), `${n} não pode estar na seita diurna`);
  const foraDaSeita = DIA.planetasForaDaSeita.map((p) => p.planeta);
  for (const n of ['Lua', 'Vênus', 'Marte']) assert.ok(foraDaSeita.includes(n), n);

  const daNoite = NOITE.planetasDaSeita.map((p) => p.planeta);
  for (const n of ['Lua', 'Vênus', 'Marte']) assert.ok(daNoite.includes(n), n);
  for (const n of ['Sol', 'Júpiter', 'Saturno']) assert.ok(!daNoite.includes(n), n);
});

test('os sete se distribuem sem sobra e sem falta, e os três modernos ficam de fora dos baldes', () => {
  for (const lang of ['pt', 'es', 'en']) {
    for (const r of AMOSTRA[lang]) {
      const baldes = [...r.planetasDaSeita, ...r.planetasForaDaSeita, ...r.planetasIndeterminados].map((p) => p.planeta);
      assert.deepEqual(baldes.sort(), [...S.ORDEM_DOS_SETE].sort(), lang);
      for (const p of r.planetas.filter((x) => x.moderno)) {
        assert.equal(p.naSeita, null);
        assert.equal(p.seitaDoPlaneta, null);
      }
    }
  }
});

test('Mercúrio troca de lado pelo critério da fonte: antes do Sol é dia, depois é noite', () => {
  for (const lang of ['pt', 'es', 'en']) {
    for (const r of AMOSTRA[lang]) {
      assert.ok(['manha', 'tarde'].includes(r.mercurio.estrela), `${lang}: estrela ${r.mercurio.estrela}`);
      assert.equal(r.mercurio.seita, r.mercurio.estrela === 'manha' ? 'diurno' : 'noturno');
      // Elongação máxima medida de Mercúrio: ~28°. Acima disso, a conta está errada.
      assert.ok(r.mercurio.elongacaoGraus >= 0 && r.mercurio.elongacaoGraus < 30, `elongação ${r.mercurio.elongacaoGraus}`);
      const merc = r.planetas.find((p) => p.planeta === 'Mercúrio');
      assert.equal(merc.seitaDoPlaneta, r.mercurio.seita);
      assert.equal(merc.naSeita, r.mercurio.seita === r.seita);
    }
  }
  // Um caso de cada, conferido contra a longitude crua.
  const tarde = S.seitaDoMapa('1990-09-05', '14:30', SP);
  assert.equal(tarde.mercurio.estrela, 'tarde');
  assert.equal(tarde.planetas.find((p) => p.planeta === 'Mercúrio').naSeita, false);
  const manha = S.seitaDoMapa('1990-06-15', '14:30', SP);
  assert.equal(manha.mercurio.estrela, 'manha');
  assert.equal(manha.planetas.find((p) => p.planeta === 'Mercúrio').naSeita, true);
});

test('sem mapa, Mercúrio DECLARA que depende do céu em vez de escolher um lado', () => {
  for (const lang of ['pt', 'es', 'en']) {
    const l = S.linhaDeSeita('Mercúrio', 'diurno', lang);
    assert.equal(l.naSeita, null);
    assert.equal(l.seitaDoPlaneta, null);
    assert.equal(l.linha, LANGS[lang].mercurio.indeterminado);
  }
});

test('os três modernos declaram que seita não se aplica, com o ano da descoberta', () => {
  assert.deepEqual(S.MODERNOS, { 'Urano': 1781, 'Netuno': 1846, 'Plutão': 1930 });
  for (const lang of ['pt', 'es', 'en']) {
    for (const [nome, ano] of Object.entries(S.MODERNOS)) {
      const l = S.linhaDeSeita(nome, null, lang);
      assert.equal(l.disponivel, true, `${lang}/${nome}: o moderno não depende do mapa pra responder`);
      assert.equal(l.seitaDoPlaneta, null);
      assert.equal(l.naSeita, null);
      assert.ok(l.linha.includes(String(ano)), `${lang}/${nome} não datou a descoberta`);
      assert.ok(l.recibo.includes(String(ano)), `${lang}/${nome} recibo sem data`);
    }
  }
});

test('NENHUMA leitura afirma que maléfico FORA da seita é pior — a lacuna fica declarada', () => {
  const MARCA = {
    pt: /Nenhum texto antigo desta base diz/,
    es: /Ningún texto antiguo de esta base dice/,
    en: /No ancient text in this research base says/,
  };
  for (const lang of ['pt', 'es', 'en']) {
    for (const malefico of ['Saturno', 'Marte']) {
      const seitaContraria = S.SEITA_POR_PLANETA[malefico].seita === 'diurno' ? 'noturno' : 'diurno';
      const l = S.linhaDeSeita(malefico, seitaContraria, lang);
      assert.equal(l.naSeita, false);
      assert.match(l.linha, MARCA[lang], `${lang}/${malefico} fora de seita não declarou a lacuna`);
    }
  }
  // E a lacuna está no registro de pesquisa, com o motivo inteiro.
  const registro = S.NAO_ACHADO.find((x) => x.id === 'maleficoForaDeSeita');
  assert.ok(registro, 'NAO_ACHADO perdeu a entrada mais importante desta feature');
  assert.match(registro.texto, /inoperante não é sinônimo de fora de seita/);
});

test('a condição dupla de Valente é dita em voz alta: o app calcula metade da regra', () => {
  const MARCA = { pt: /lugar apropriado, não/i, es: /lugar apropiado, no/i, en: /appropriate place is not/i };
  for (const lang of ['pt', 'es', 'en']) {
    for (const r of AMOSTRA[lang]) {
      assert.match(r.notaCondicao, MARCA[lang], lang);
    }
  }
  assert.ok(S.NAO_ACHADO.some((x) => x.id === 'lugarApropriado'));
});

test('o que é conta e o que é leitura vem separado, e a leitura tem dono', () => {
  for (const lang of ['pt', 'es', 'en']) {
    for (const r of AMOSTRA[lang]) {
      assert.match(r.notaLeituraDoApp, /Tetrabiblos I\.7/);
      assert.match(r.notaLeituraDoApp, /Anthologiae I\.1/);
      assert.ok(r.notaLeituraDoApp.length > 200, lang);
    }
  }
});

test('o verbatim é BYTE A BYTE o mesmo nos três packs — citação não se traduz', () => {
  for (const chave of Object.keys(PT.verbatim)) {
    assert.equal(ES.verbatim[chave].texto, PT.verbatim[chave].texto, `es/${chave} mexeu na citação`);
    assert.equal(EN.verbatim[chave].texto, PT.verbatim[chave].texto, `en/${chave} mexeu na citação`);
    assert.match(PT.verbatim[chave].texto, /\b(the|of|and|are|when|because)\b/, `${chave} não parece inglês`);
  }
  // A frase de Valente é a peça central desta feature: confere inteira.
  assert.equal(
    PT.verbatim.valensMaleficos.texto,
    'even the malefic stars, when they are operative in appropriate places in their own sect, are bestowers of good and indicative of the greatest positions and success; when they are inoperative, they bring about disasters and accusations.'
  );
  assert.equal(
    PT.verbatim.ptolomeuMercurio.texto,
    'common as before, diurnal when it is a morning star and nocturnal as an evening star'
  );
  assert.equal(PT.verbatim.valensDia.texto, 'of the day sect');
  assert.equal(PT.verbatim.valensNoite.texto, 'of the night sect');
});

test('cada locus mantém o mesmo capítulo nos três idiomas, e a paráfrase é do app', () => {
  const CAPITULO = {
    valensMaleficos: /Anthologiae I\.1/,
    ptolomeuMercurio: /Tetrabiblos I\.7/,
    ptolomeuBeneficos: /Tetrabiblos I\.5/,
    ptolomeuMaleficos: /Tetrabiblos I\.5/,
    ptolomeuComuns: /Tetrabiblos I\.5/,
    valensDia: /Anthologiae I\.1/,
    valensNoite: /Anthologiae I\.1/,
  };
  for (const [chave, re] of Object.entries(CAPITULO)) {
    for (const [lang, pack] of Object.entries(LANGS)) {
      assert.match(pack.verbatim[chave].locus, re, `${lang}/${chave} trocou de capítulo`);
      assert.ok(pack.verbatim[chave].parafrase.trim().length > 40, `${lang}/${chave} sem paráfrase`);
      assert.notEqual(pack.verbatim[chave].parafrase, pack.verbatim[chave].texto, `${lang}/${chave}`);
    }
  }
  // Nome consagrado TRADUZ, e é assim que o locus fala a língua do leitor.
  assert.match(PT.verbatim.ptolomeuMercurio.locus, /^Ptolomeu/);
  assert.match(ES.verbatim.ptolomeuMercurio.locus, /^Ptolomeo/);
  assert.match(EN.verbatim.ptolomeuMercurio.locus, /^Ptolemy/);
  assert.match(PT.verbatim.valensMaleficos.locus, /^Vétio Valente/);
  assert.match(EN.verbatim.valensMaleficos.locus, /^Vettius Valens/);
  for (const pack of Object.values(LANGS)) {
    assert.match(pack.verbatim.ptolomeuMercurio.locus, /Robbins, 1940/);
    assert.match(pack.verbatim.valensMaleficos.locus, /Riley/);
  }
});

test('todo recibo de planeta carrega obra e capítulo — inclusive o dos modernos', () => {
  for (const [lang, pack] of Object.entries(LANGS)) {
    for (const nome of S.ORDEM_DOS_SETE) {
      assert.match(pack.recibos[nome], /I\.7/, `${lang}/${nome} sem o capítulo da seita`);
      assert.match(pack.recibos[nome], /I\.5|I\.8/, `${lang}/${nome} sem a classe nem a fase`);
    }
    for (const nome of Object.keys(S.MODERNOS)) {
      assert.match(pack.recibos[nome], /\b(1781|1846|1930)\b/, `${lang}/${nome} sem a data de descoberta`);
    }
  }
});

test('o que a pesquisa não achou continua não achado, e está escrito', () => {
  const ids = S.NAO_ACHADO.map((x) => x.id).sort();
  assert.deepEqual(ids, [
    'condicaoCompleta', 'lugarApropriado', 'maleficoForaDeSeita',
    'margemDoHorizonte', 'seitaDeMercurioEmValente', 'seitaDosModernos',
  ]);
  for (const x of S.NAO_ACHADO) assert.ok(x.texto.length > 120, `${x.id} declarado de qualquer jeito`);
  assert.match(S.NAO_ACHADO.find((x) => x.id === 'margemDoHorizonte').texto, /3 graus|LIMIAR_LIMITROFE_GRAUS/);
});

// ===========================================================================
// 8. linhaDeSeita — a porta que a tela de planeta usa
// ===========================================================================

test('linhaDeSeita aceita o mapa inteiro OU só a seita, e o nome com ou sem acento', () => {
  const comMapa = S.linhaDeSeita('Saturno', DIA);
  const soSeita = S.linhaDeSeita('saturno', 'diurno');
  assert.equal(comMapa.linha, soSeita.linha);
  assert.equal(S.linhaDeSeita('SATURNO', DIA).linha, comMapa.linha);
  assert.equal(S.linhaDeSeita('Mercurio', DIA).planeta, 'Mercúrio');
  assert.equal(S.linhaDeSeita('plutao', DIA).planeta, 'Plutão');
  assert.equal(S.linhaDeSeita('Quíron', DIA), null);
  assert.equal(S.linhaDeSeita('', DIA), null);
  assert.equal(S.linhaDeSeita(null, DIA), null);
});

test('sem mapa utilizável, linhaDeSeita dos sete diz o que falta em vez de inventar', () => {
  const semMapa = S.linhaDeSeita('Saturno', null);
  assert.equal(semMapa.disponivel, false);
  assert.equal(semMapa.naSeita, null);
  assert.match(semMapa.comoResolver, /Mapa Astral/);
  // Quando o mapa veio indisponível, o motivo dele é o motivo daqui.
  const semCidade = S.seitaDoMapa('1990-06-15', '14:30', null);
  const l = S.linhaDeSeita('Marte', semCidade);
  assert.equal(l.disponivel, false);
  assert.equal(l.linha, PT.falta.cidade.texto);
  assert.equal(l.comoResolver, PT.falta.cidade.comoResolver);
});

test('a linha de cada um dos sete muda quando a seita muda', () => {
  for (const lang of ['pt', 'es', 'en']) {
    for (const nome of S.ORDEM_DOS_SETE) {
      const dia = S.linhaDeSeita(nome, DIA, lang).linha;
      const noite = S.linhaDeSeita(nome, NOITE, lang).linha;
      assert.notEqual(dia, noite, `${lang}/${nome}: a linha não reagiu à seita`);
    }
  }
});

test('as 20 linhas dos sete (7 × 2 seitas, nos 3 idiomas) são todas distintas dentro do idioma', () => {
  for (const lang of ['pt', 'es', 'en']) {
    const vistas = new Set();
    for (const nome of S.ORDEM_DOS_SETE) {
      vistas.add(S.linhaDeSeita(nome, DIA, lang).linha);
      vistas.add(S.linhaDeSeita(nome, NOITE, lang).linha);
    }
    assert.equal(vistas.size, 14, `${lang}: só ${vistas.size} linhas distintas em 14`);
  }
});

test('cada entrada de planeta traz classe traduzida, recibo e a etiqueta de Valente', () => {
  for (const lang of ['pt', 'es', 'en']) {
    for (const p of AMOSTRA[lang][0].planetas) {
      assert.ok(p.recibo && p.recibo.length > 40, `${lang}/${p.planeta}`);
      if (p.moderno) {
        assert.equal(p.classeNome, null);
        assert.equal(p.verbatimSeita, null);
      } else {
        assert.equal(p.classeNome, LANGS[lang].classes[p.classe]);
        if (p.planeta === 'Mercúrio') assert.equal(p.verbatimSeita, null, 'Valente I.1 não registra Mercúrio nesta base');
        else assert.match(p.verbatimSeita.texto, /^of the (day|night) sect$/);
      }
    }
  }
});
