// Homem Zodiacal — os testes que seguram a tela de história (iatromatemática).
//
// Dois trabalhos distintos aqui, e o segundo é o que importa de verdade:
//
// 1. INTEGRIDADE DOS DADOS. As famílias zodiacBody.sign.*, .planet.*,
//    .history.*, .culpeper.herb.*, .modern.* e .notVerified.* são montadas em
//    RUNTIME (helpers de lib/zodiacBody.js), então test/i18nKeysExist.test.js
//    não as enxerga — uma chave faltando sairia na tela como
//    "zodiacBody.sign.libra.gloss" pro visitante, sem erro nenhum. Aqui elas
//    são conferidas nos três idiomas, uma a uma.
//
// 2. A LINHA QUE NÃO SE ATRAVESSA (regra do dono). Descrever a tradição é
//    seguro; aplicá-la a uma pessoa é conselho médico. O teste varre TODOS os
//    valores zodiacBody.* nos três idiomas atrás de vocabulário de orientação
//    ("cuide", "evite", "fortaleça", "seu ponto fraco", "take care of",
//    "good time to"…) e atrás de regências que os antigos não podiam conhecer
//    (adrenais, endócrino, linfático, chakras, Urano/Netuno/Plutão) infiltradas
//    nas correspondências.
//
//    Isso existe porque o risco não é escrever a frase errada hoje: é alguém,
//    daqui a três meses, "melhorar" um verbete traduzindo do jeito que soa
//    melhor, e a tela virar conselho de saúde sem ninguém perceber. Falha aqui
//    = não pode publicar. É de propósito.

const test = require('node:test');
const assert = require('node:assert/strict');

const { _DICTS_FOR_TESTS, LANGUAGES } = require('../lib/i18n.js');
const { SIGNS } = require('../lib/signs.js');
const {
  ZODIAC_BODY,
  PLANET_RULERSHIP,
  HISTORY_BLOCKS,
  CULPEPER_HERBS,
  CULPEPER_QUOTES,
  MODERN_ADDITIONS,
  NOT_VERIFIED,
  SOURCES,
  coversAllSigns,
  entryForSign,
  entryById,
  moonSignAt,
  moonBodyTransit,
  signKey,
  planetKey,
  historyKey,
  herbKey,
  modernKey,
  notVerifiedKey,
} = require('../lib/zodiacBody.js');

// ---------------------------------------------------------------------------
// 1. Integridade dos dados
// ---------------------------------------------------------------------------

test('as doze correspondências cobrem os doze signos de lib/signs.js, na ordem', () => {
  assert.equal(ZODIAC_BODY.length, 12);
  assert.ok(
    coversAllSigns(),
    'ZODIAC_BODY divergiu de SIGNS — renomear um signo em lib/signs.js sem ' +
      'atualizar lib/zodiacBody.js deixaria a tela com buraco silencioso'
  );
  for (const s of SIGNS) {
    assert.ok(entryForSign(s.name), `sem entrada para o signo "${s.name}"`);
  }
});

test('toda entrada traz o latim verbatim e o locus em Manílio', () => {
  for (const e of ZODIAC_BODY) {
    assert.ok(e.latin && e.latin.length > 10, `${e.id}: latim ausente`);
    assert.match(
      e.locus,
      /^Astronomica II\./,
      `${e.id}: a lista dos doze signos é de MANÍLIO (Astronomica II), não de ` +
        `Ptolomeu — locus suspeito: "${e.locus}"`
    );
    assert.equal(entryById(e.id), e);
  }
});

test('nenhuma fonte da lista dos signos aponta para o Tetrabiblos', () => {
  // O erro mais difundido da bibliografia: creditar a lista Áries-cabeça a
  // Ptolomeu. Ele pressupõe a correspondência, mas nunca enumera os doze.
  for (const e of ZODIAC_BODY) {
    assert.doesNotMatch(e.locus, /Tetrabiblos/i, `${e.id}: locus errado`);
  }
});

// ---------------------------------------------------------------------------
// 2. Paridade das chaves montadas em runtime
// ---------------------------------------------------------------------------

function expectedKeys() {
  const keys = [];
  for (const e of ZODIAC_BODY) {
    for (const f of ['name', 'part', 'gloss', 'note']) keys.push(signKey(e.id, f));
  }
  for (const p of PLANET_RULERSHIP) {
    keys.push(planetKey(p.id, 'name'));
    keys.push(planetKey(p.id, 'parts'));
    if (p.hasNote) keys.push(planetKey(p.id, 'note'));
  }
  for (const b of HISTORY_BLOCKS) {
    keys.push(historyKey(b.id, 'title'));
    keys.push(historyKey(b.id, 'body'));
  }
  for (const h of CULPEPER_HERBS) keys.push(herbKey(h.id));
  for (const m of MODERN_ADDITIONS) keys.push(modernKey(m));
  for (const n of NOT_VERIFIED) keys.push(notVerifiedKey(n));
  return keys;
}

test('toda chave montada em runtime existe nos três idiomas', () => {
  const keys = expectedKeys();
  assert.ok(keys.length > 80, 'a lista de chaves esperadas encolheu demais');
  const faltando = [];
  for (const lang of LANGUAGES) {
    const dict = _DICTS_FOR_TESTS[lang];
    for (const k of keys) {
      const v = dict[k];
      if (typeof v !== 'string' || v.trim().length === 0) faltando.push(`${lang}: ${k}`);
    }
  }
  assert.equal(
    faltando.length,
    0,
    `${faltando.length} chave(s) montada(s) em runtime sem tradução — a tela ` +
      `mostraria o nome da chave:\n  ` + faltando.slice(0, 30).join('\n  ')
  );
});

// ---------------------------------------------------------------------------
// 3. A linha que não se atravessa
// ---------------------------------------------------------------------------

// Chaves dispensadas da varredura, cada uma com o motivo escrito. Só entra
// aqui o que é imperativo de INTERFACE ou o que NOMEIA a frase proibida
// justamente para rejeitá-la. Nunca acrescente uma chave de conteúdo aqui.
const ISENTAS = new Set([
  // O aviso de saúde PRECISA mandar procurar um médico — é o oposto do risco.
  'zodiacBody.notice.title',
  'zodiacBody.notice.body',
  'zodiacBody.notice.footer',
  // Imperativos de interface, sobre a tela e não sobre o corpo.
  'zodiacBody.figure.hint',
  'zodiacBody.sun.noneCta',
  'zodiacBody.expand',
  'zodiacBody.collapse',
]);

// Prefixos dispensados: as duas seções que CITAM as invenções modernas e as
// afirmações não verificadas para dizer que são falsas. Se elas não pudessem
// escrever "seu ponto fraco", não poderiam desmenti-lo.
const PREFIXOS_ISENTOS = ['zodiacBody.modern.', 'zodiacBody.notVerified.'];

// Vocabulário de orientação dirigida ao corpo de quem lê. Sempre com \b pra
// não pegar a forma no passado ("os médicos evitavam", "avoided", "cuidavam"),
// que é exatamente a forma PERMITIDA.
const ORIENTACAO = [
  // pt
  /\bcuide\b/i,
  /\bevite\b/i,
  /\bfortale(ç|c)a\b/i,
  /\bproteja\b/i,
  /\bprevina\b/i,
  /\bponto fraco\b/i,
  /\bbom momento para\b/i,
  /\btend(ê|e)ncia a (ter|sofrer|desenvolver)\b/i,
  // es — as formas de voseo ("cuidá", "evitá") terminam em vogal acentuada, e
  // \b em JS só conhece [A-Za-z0-9_]: um \b depois do "á" NUNCA casa. Por isso
  // elas são fechadas com um espaço em vez de \b.
  /\bcuida\b/i,
  /\bcuidá /i,
  /\bevita\b/i,
  /\bevitá /i,
  /\bfortalece\b/i,
  /\bprotege\b/i,
  /\bprotegé /i,
  /punto d(é|e)bil/i,
  /\bbuen momento para\b/i,
  // en
  /\btake care of\b/i,
  /\bwatch out for\b/i,
  /\bbe careful with\b/i,
  /\bgood time to\b/i,
  /\bweak (point|spot)\b/i,
  /\byou should\b/i,
  /\bavoid\b/i,
  /\bstrengthen\b/i,
];

// Regências que os antigos não podiam conhecer — conceitos dos séculos XIX e
// XX que entram na astrologia com Alan Leo, Heindel e Cornell. Não podem
// aparecer nas CORRESPONDÊNCIAS (zodiacBody.sign.*), só na seção que as
// nomeia como acréscimo recente.
const INVENCOES = [
  /adrenal/i,
  /(endócrin|endocrin)/i,
  /(linfát|linfat|lymphat)/i,
  /chakra/i,
  /schuessler/i,
  /\b(urano|uranus)\b/i,
  /\b(netuno|neptuno|neptune)\b/i,
  /\b(plut(ã|a)o|plut(ó|o)n|pluto)\b/i,
];

function entradasZodiacBody(lang) {
  const dict = _DICTS_FOR_TESTS[lang];
  return Object.keys(dict)
    .filter((k) => k.startsWith('zodiacBody.'))
    .map((k) => [k, dict[k]]);
}

test('nenhum texto da tela orienta o corpo de quem lê (pt, es, en)', () => {
  const violacoes = [];
  for (const lang of LANGUAGES) {
    for (const [k, v] of entradasZodiacBody(lang)) {
      if (ISENTAS.has(k)) continue;
      if (PREFIXOS_ISENTOS.some((p) => k.startsWith(p))) continue;
      for (const re of ORIENTACAO) {
        if (re.test(v)) violacoes.push(`${lang} ${k} → ${re}`);
      }
    }
  }
  assert.equal(
    violacoes.length,
    0,
    'A tela do Homem Zodiacal é REGISTRO HISTÓRICO. Estas frases orientam o ' +
      'corpo de quem lê e não podem existir — reescreva no passado, com a ' +
      `fonte, ou corte:\n  ${violacoes.join('\n  ')}`
  );
});

test('as correspondências não recebem regência que os antigos não conheciam', () => {
  const violacoes = [];
  for (const lang of LANGUAGES) {
    for (const [k, v] of entradasZodiacBody(lang)) {
      if (!k.startsWith('zodiacBody.sign.')) continue;
      for (const re of INVENCOES) {
        if (re.test(v)) violacoes.push(`${lang} ${k} → ${re}`);
      }
    }
  }
  assert.equal(
    violacoes.length,
    0,
    'Adrenais, sistema endócrino, sistema linfático, chakras, sais de ' +
      'Schuessler e Urano/Netuno/Plutão são acréscimos dos sécs. XIX-XX ' +
      '(Alan Leo 1917, Heindel 1929, Cornell 1933). Eles têm lugar na seção ' +
      `zodiacBody.modern.*, nunca dentro de uma correspondência:\n  ${violacoes.join('\n  ')}`
  );
});

test('as citações de Culpeper mantidas são de atribuição, não de terapêutica', () => {
  // O corte foi deliberado: de cada verbete ficaram a atribuição planetária e
  // o raciocínio. Se alguém colar de volta o trecho terapêutico do Gutenberg,
  // isto pega.
  const TERAPEUTICO = [
    /\bcures?\b/i,
    /\bremed(y|ies)\b/i,
    /\bheals?\b/i,
    /\bstrengthens?\b/i,
    /\beradicates?\b/i,
    /\bdiseases? in the\b/i,
  ];
  const textos = [...Object.values(CULPEPER_QUOTES), ...CULPEPER_HERBS.map((h) => h.quote)];
  for (const texto of textos) {
    for (const re of TERAPEUTICO) {
      assert.doesNotMatch(
        texto,
        re,
        `citação de Culpeper com trecho terapêutico (${re}) — manter só a ` +
          'atribuição planetária e o raciocínio'
      );
    }
  }
});

test('a bibliografia não sumiu', () => {
  assert.ok(SOURCES.length >= 8);
  assert.ok(SOURCES.some((s) => /Manílio/.test(s)));
  assert.ok(SOURCES.some((s) => /Centiloquium/.test(s)));
});

// ---------------------------------------------------------------------------
// 4. A Lua caminhando pelo corpo (astronomia real, não tabela inventada)
// ---------------------------------------------------------------------------

test('a Lua atravessa os signos na ordem do zodíaco, ~2,5 dias em cada', () => {
  const start = new Date(Date.UTC(2026, 0, 1, 0, 0, 0));
  let prev = moonSignAt(start);
  assert.ok(prev, 'astronomy-engine deveria estar disponível nos testes');

  let transicoes = 0;
  for (let h = 6; h <= 28 * 24; h += 6) {
    const s = moonSignAt(new Date(start.getTime() + h * 3600 * 1000));
    if (s.name === prev.name) continue;
    const i = SIGNS.findIndex((x) => x.name === prev.name);
    assert.equal(
      s.name,
      SIGNS[(i + 1) % 12].name,
      `a Lua pulou de ${prev.name} para ${s.name} — a sequência tem que ser zodiacal`
    );
    transicoes++;
    prev = s;
  }
  // 28 dias / ~2,3 dias por signo → entre 10 e 13 trocas.
  assert.ok(transicoes >= 10 && transicoes <= 13, `trocas em 28 dias: ${transicoes}`);
});

test('moonBodyTransit devolve a região de hoje e a próxima troca, dentro de ~3 dias', () => {
  const tr = moonBodyTransit(new Date());
  assert.ok(tr, 'astronomy-engine deveria estar disponível nos testes');
  assert.ok(tr.entry, 'a posição da Lua tem que casar com uma das doze entradas');
  assert.ok(tr.changesAt instanceof Date);
  assert.ok(tr.nextEntry);
  assert.notEqual(tr.nextSign.name, tr.sign.name);

  const dias = tr.msUntilChange / (24 * 3600 * 1000);
  assert.ok(dias > 0, 'a próxima troca não pode estar no passado');
  assert.ok(dias < 3.2, `a Lua não fica mais de ~3 dias num signo (achou ${dias})`);

  // A troca tem que ser para o signo SEGUINTE no zodíaco.
  const i = ZODIAC_BODY.findIndex((e) => e.id === tr.entry.id);
  assert.equal(tr.nextEntry.id, ZODIAC_BODY[(i + 1) % 12].id);
});
