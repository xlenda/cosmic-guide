// test/synastryIdiomas.test.js
// OS TRÊS IDIOMAS DA SINASTRIA — e a prova de que o PT não mudou um byte.
//
// Este arquivo guarda as quatro leis da internacionalização do motor:
//
//   1. O PT É OURO. test/golden/synastry.pt.golden.json foi capturado ANTES da
//      extração dos packs, rodando os 144 pares. O hash dos 144 e três pares
//      inteiros (Áries+Libra, Gêmeos+Câncer, Touro+Touro) são comparados byte
//      a byte. Refatoração que altera o texto PT é falha, não melhoria.
//   2. lang='pt' E lang ausente são a MESMA leitura — compatibilidade total
//      com toda chamada existente.
//   3. PARIDADE: os packs es/en têm exatamente a mesma FORMA do pt (mesmas
//      chaves, mesmos tipos — as funções são os "placeholders" daqui), nenhum
//      valor vazio, e os 144 pares saem inteiros nos três idiomas (a rodada
//      completa exercita TODA entrada de TODA tabela: 7 figuras, 10 pares de
//      elemento, 6 pares de modalidade, 7 planetas, 4 fechos).
//   4. LINHA VERMELHA nos três idiomas: as palavras proibidas têm primos —
//      PT cura/alivia/sara/trata..., ES aliviar/calmar/sanar/curar/tratar/
//      energizar, EN relieve/soothe/calm/heal/cure/treat/energize. Nenhuma
//      entra. Nada de veredito, promessa ou porcentagem em nenhum idioma. O
//      verbatim de Robbins é IDÊNTICO nos três packs (citação não se traduz);
//      locus mantém capítulo e edição.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const { SIGNS, compatibility } = require('../lib/signs.js');
const S = require('../lib/synastry.js');
const PT = require('../lib/traducoes/synastry.pt.js').PACK;
const ES = require('../lib/traducoes/synastry.es.js').PACK;
const EN = require('../lib/traducoes/synastry.en.js').PACK;

const LANGS = { pt: PT, es: ES, en: EN };
const DIMS = S.DIMENSOES_VIDA_REAL.map((d) => d.id);
const RELACOES = ['copresenca', 'aversao30', 'sextil', 'quadratura', 'trigono', 'aversao150', 'oposicao'];

// Os 144 pares, por idioma, calculados uma vez.
const PARES = { pt: [], es: [], en: [] };
for (const lang of Object.keys(PARES)) {
  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 12; j++) {
      PARES[lang].push({
        i,
        j,
        a: SIGNS[i].name,
        b: SIGNS[j].name,
        leitura: compatibility(SIGNS[i].name, SIGNS[j].name, lang),
      });
    }
  }
}

// Canonicalização idêntica à do script de captura: ordena chaves pra que o
// hash não dependa de ordem de inserção.
function canon(v) {
  if (Array.isArray(v)) return v.map(canon);
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v).sort()) o[k] = canon(v[k]);
    return o;
  }
  return v;
}

// Tudo que o usuário lê numa leitura, num idioma. O verbatim inglês entra
// também — a varredura de linha vermelha pode morder citação à vontade: se
// morder, ou a citação está errada ou a lista está larga demais, e os dois
// merecem quebrar o build.
function corpus(l) {
  return [
    l.aspecto, l.natureza, l.categoria, l.resumo, l.texto, l.forte, l.cuidado,
    // O caminho entra na varredura junto com o resto: ele é texto de tela, e
    // não ganha licença nenhuma por ser conselho. (`|| ''` porque ele é null nas
    // leituras não tensas — e um null virando "null" no join envenenaria as
    // buscas de "undefined"/"[object Object]" logo abaixo.)
    l.caminho || '',
    l.chamada, ...DIMS.map((d) => l.vidaReal[d]),
    l.grauNome, l.notaEscala, l.notaGrau, l.ressalvaSignoSolar, l.notaCaracterologia,
    ...l.verbatins.map((v) => v.parafrase),
    ...l.verbatins.map((v) => v.texto),
    ...l.verbatins.map((v) => v.locus),
    ...l.fontes,
  ].join(' \n ');
}

function frases(texto) {
  return (texto.match(/[.!?](\s|$)/g) || []).length;
}

const GOLDEN = JSON.parse(fs.readFileSync(path.join(__dirname, 'golden', 'synastry.pt.golden.json'), 'utf8'));

// ---------------------------------------------------------------------------
// O GOLDEN É ANTERIOR AO CAMPO `caminho` (04/08/2026) — e continua valendo
// ---------------------------------------------------------------------------
// A captura de test/golden/synastry.pt.golden.json foi feita antes de existir
// `caminho` (o caminho prático de convivência das leituras tensas). Havia duas
// saídas: recapturar o golden, ou tirar o campo novo antes de comparar.
//
// RECAPTURAR SERIA PERDER A PROVA. O golden existe pra travar UMA coisa: que o
// texto PT que já estava na tela não muda um byte. Recapturá-lo a cada campo
// novo transforma o portão num carimbo — quem mexer no `cuidado` do trígono
// junto com o campo novo passa verde, porque o golden já teria sido reescrito
// com o defeito dentro.
//
// Então a comparação TIRA `caminho` e mantém o hash antigo intacto. O que isso
// prova, e é exatamente o que se quer provar: a mudança de 04/08/2026 é
// PURAMENTE ADITIVA — nenhum dos 32 campos anteriores mudou em nenhum dos 144
// pares. O campo novo não fica sem rede: ele tem testes próprios (a seção 6
// deste arquivo e a seção 15 de test/synastry.test.js), e a lista abaixo é de
// UM item de propósito — quem quiser acrescentar um segundo campo aqui vai ter
// que justificar por escrito, que é o custo certo pra essa decisão.
const CAMPOS_POSTERIORES_AO_GOLDEN = ['caminho'];

function comoNoGolden(leitura) {
  const copia = { ...leitura };
  for (const campo of CAMPOS_POSTERIORES_AO_GOLDEN) {
    assert.ok(campo in copia, `o campo ${campo} sumiu do motor — a lista de campos pós-golden está desatualizada`);
    delete copia[campo];
  }
  return canon(copia);
}

// ===========================================================================
// 1. O PT É OURO — byte a byte contra a captura pré-refatoração
// ===========================================================================

test('GOLDEN: o hash dos 144 pares PT é idêntico ao capturado antes da extração', () => {
  const todos = {};
  for (const p of PARES.pt) todos[p.a + '+' + p.b] = comoNoGolden(p.leitura);
  const hash = crypto.createHash('sha256').update(JSON.stringify(todos)).digest('hex');
  assert.equal(
    hash,
    GOLDEN.hash144,
    'O TEXTO PT MUDOU. Isso é exatamente o que esta tarefa proíbe: o pack pt tem que reproduzir a saída antiga byte a byte. Rode o diff contra test/golden/synastry.pt.golden.json antes de qualquer outra coisa.'
  );
});

test('GOLDEN: os três pares de referência conferem inteiros, campo a campo', () => {
  for (const [chave, esperado] of Object.entries(GOLDEN.pares)) {
    const [a, b] = chave.split('+');
    assert.deepEqual(comoNoGolden(compatibility(a, b)), esperado, `par golden ${chave} divergiu`);
  }
});

test('GOLDEN: o campo novo é ADITIVO — o golden não tem nenhum campo que o motor perdeu', () => {
  // A contrapartida de tirar `caminho` antes de comparar: se um dia alguém
  // apagar um campo antigo E acrescentar um novo, o hash acima quebra — mas
  // este teste diz QUAL campo sumiu, que é a informação que o hash não dá.
  for (const [chave, esperado] of Object.entries(GOLDEN.pares)) {
    const [a, b] = chave.split('+');
    const atual = compatibility(a, b);
    for (const campo of Object.keys(esperado)) {
      assert.ok(campo in atual, `${chave}: o motor perdeu o campo ${campo}, que existia no golden`);
    }
    const novos = Object.keys(atual).filter((k) => !(k in esperado));
    assert.deepEqual(novos.sort(), [...CAMPOS_POSTERIORES_AO_GOLDEN].sort(), `${chave}: apareceu campo novo sem entrar na lista de campos pós-golden`);
  }
});

test('GOLDEN: fraseDeCama PT confere com a captura, nas 7 relações', () => {
  for (const id of RELACOES) {
    assert.equal(S.fraseDeCama(id), GOLDEN.fraseDeCama[id], id);
    assert.equal(S.fraseDeCama(id, 'pt'), GOLDEN.fraseDeCama[id], id);
  }
});

test("lang ausente e lang='pt' são a MESMA leitura, nos 144 pares", () => {
  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 12; j++) {
      const semLang = compatibility(SIGNS[i].name, SIGNS[j].name);
      const comPt = compatibility(SIGNS[i].name, SIGNS[j].name, 'pt');
      assert.deepEqual(semLang, comPt, `${SIGNS[i].name}+${SIGNS[j].name}`);
    }
  }
});

test('idioma desconhecido cai no PT — nunca numa leitura quebrada', () => {
  const pt = compatibility('Áries', 'Libra');
  assert.deepEqual(compatibility('Áries', 'Libra', 'fr'), pt);
  assert.deepEqual(compatibility('Áries', 'Libra', undefined), pt);
  assert.deepEqual(compatibility('Áries', 'Libra', null), pt);
});

// ===========================================================================
// 2. PARIDADE DOS PACKS — mesma forma, nenhum valor vazio
// ===========================================================================

// A "forma" de um pack: chaves ordenadas, tipo de cada folha. As funções dos
// packs são os placeholders daqui — mesma chave + mesma assinatura + a rodada
// dos 144 pares abaixo é o que garante que nenhum {x} sumiu na tradução.
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
  if (v && typeof v === 'object') {
    for (const k of Object.keys(v)) varrerStrings(v[k], `${caminho}.${k}`, cb);
  }
}

test('es e en têm EXATAMENTE a mesma forma do pt — mesmas chaves, mesmos tipos', () => {
  const formaPt = forma(PT);
  assert.deepEqual(forma(ES), formaPt, 'o pack es divergiu da forma do pt');
  assert.deepEqual(forma(EN), formaPt, 'o pack en divergiu da forma do pt');
});

test('nenhum valor de nenhum pack é vazio', () => {
  for (const [lang, pack] of Object.entries(LANGS)) {
    varrerStrings(pack, lang, (caminho, s) => {
      assert.ok(s.trim().length > 0, `${caminho} está vazio`);
    });
  }
});

test('os 144 pares saem INTEIROS em es e en — todos os campos, as 5 dimensões, 2 a 4 frases', () => {
  const CAMPOS = [
    'aspecto', 'natureza', 'categoria', 'categoriaId', 'resumo', 'texto', 'forte', 'cuidado',
    'chamada', 'grau', 'grauNome', 'distancia', 'graus', 'elementoA', 'elementoB',
    'modalidadeA', 'modalidadeB', 'notaEscala', 'notaGrau', 'ressalvaSignoSolar', 'notaCaracterologia',
  ];
  for (const lang of ['es', 'en']) {
    for (const p of PARES[lang]) {
      for (const campo of CAMPOS) {
        const v = p.leitura[campo];
        assert.ok(v !== undefined && v !== null && v !== '', `${lang} ${p.a}+${p.b} perdeu o campo ${campo}`);
      }
      assert.ok(Array.isArray(p.leitura.verbatins) && p.leitura.verbatins.length >= 3, `${lang} ${p.a}+${p.b} sem verbatins`);
      assert.ok(Array.isArray(p.leitura.fontes) && p.leitura.fontes.length >= 3, `${lang} ${p.a}+${p.b} com bibliografia magra`);
      assert.deepEqual(Object.keys(p.leitura.vidaReal).sort(), [...DIMS].sort(), `${lang} ${p.a}+${p.b}`);
      for (const d of DIMS) {
        const t = p.leitura.vidaReal[d];
        assert.equal(typeof t, 'string', `${lang} ${p.a}+${p.b}/${d}`);
        assert.ok(t.trim().length >= 150, `${lang} ${p.a}+${p.b}/${d} com ${t.length} caracteres — curto demais pra ser leitura`);
        const n = frases(t);
        assert.ok(n >= 2 && n <= 4, `${lang} ${p.a}+${p.b}/${d} tem ${n} frases`);
      }
      const c = corpus(p.leitura);
      assert.ok(!c.includes('undefined'), `${lang} ${p.a}+${p.b} vazou "undefined"`);
      assert.ok(!c.includes('[object Object]'), `${lang} ${p.a}+${p.b} vazou objeto`);
      assert.ok(!/\{\w+\}/.test(c), `${lang} ${p.a}+${p.b} vazou placeholder sem interpolar`);
    }
  }
});

test('a variação entre pares sobrevive à tradução — es e en não colapsam os 144', () => {
  for (const lang of ['es', 'en']) {
    const blocos = new Set(PARES[lang].map((p) => [p.leitura.chamada, ...DIMS.map((d) => p.leitura.vidaReal[d])].join('\n')));
    assert.equal(blocos.size, 144, `${lang}: só ${blocos.size} blocos distintos em 144 pares`);
    const textos = new Set(PARES[lang].map((p) => p.leitura.texto));
    assert.ok(textos.size >= 100, `${lang}: só ${textos.size} textos distintos em 144 pares`);
  }
});

test('fraseDeCama existe nas 7 relações nos três idiomas, e não colapsa entre idiomas', () => {
  for (const id of RELACOES) {
    const pt = S.fraseDeCama(id, 'pt');
    const es = S.fraseDeCama(id, 'es');
    const en = S.fraseDeCama(id, 'en');
    for (const [lang, f] of [['pt', pt], ['es', es], ['en', en]]) {
      assert.ok(typeof f === 'string' && f.trim().length > 20, `${lang}/${id}`);
      assert.match(f, /\.$/, `${lang}/${id} sem ponto final`);
    }
    assert.notEqual(es, pt, `es/${id} ficou igual ao pt`);
    assert.notEqual(en, pt, `en/${id} ficou igual ao pt`);
    assert.notEqual(en, es, `en/${id} ficou igual ao es`);
  }
  assert.equal(S.fraseDeCama('inexistente', 'en'), null);
});

// ===========================================================================
// 3. O QUE NUNCA SE TRADUZ — verbatim, locus, números
// ===========================================================================

test('o verbatim de Robbins é BYTE A BYTE o mesmo nos três packs', () => {
  for (const chave of Object.keys(PT.verbatim)) {
    assert.equal(ES.verbatim[chave].texto, PT.verbatim[chave].texto, `es/${chave} mexeu na citação`);
    assert.equal(EN.verbatim[chave].texto, PT.verbatim[chave].texto, `en/${chave} mexeu na citação`);
    // E a citação é inglês puro nos três — traduzir citação é falsificá-la.
    assert.match(PT.verbatim[chave].texto, /\b(the|and|of|are|which)\b/, `${chave} não parece inglês`);
  }
});

test('cada locus mantém o MESMO capítulo nos três idiomas, e a edição Robbins 1940', () => {
  for (const chave of Object.keys(PT.verbatim)) {
    const capitulo = PT.verbatim[chave].locus.match(/Tetrabiblos [IV]+\.\d+/);
    assert.ok(capitulo, `pt/${chave} sem capítulo no locus`);
    for (const [lang, pack] of [['es', ES], ['en', EN]]) {
      assert.ok(
        pack.verbatim[chave].locus.includes(capitulo[0]),
        `${lang}/${chave}: o locus trocou de capítulo — "${pack.verbatim[chave].locus}"`
      );
      assert.match(pack.verbatim[chave].locus, /Robbins, 1940/, `${lang}/${chave} perdeu a edição`);
    }
    // A paráfrase existe nos três e nunca é a própria citação.
    for (const [lang, pack] of Object.entries(LANGS)) {
      assert.ok(pack.verbatim[chave].parafrase.trim().length > 40, `${lang}/${chave} sem paráfrase`);
      assert.notEqual(pack.verbatim[chave].parafrase, pack.verbatim[chave].texto, `${lang}/${chave}`);
    }
  }
  // Ptolomeu é nome consagrado e TRADUZ: Ptolomeo em es, Ptolemy em en.
  assert.match(ES.verbatim.escala.locus, /^Ptolomeo/);
  assert.match(EN.verbatim.escala.locus, /^Ptolemy/);
});

test('a geometria não muda com o idioma — números, graus, escala e líder são os mesmos', () => {
  for (let k = 0; k < PARES.pt.length; k++) {
    const pt = PARES.pt[k].leitura;
    for (const lang of ['es', 'en']) {
      const outro = PARES[lang][k].leitura;
      assert.equal(outro.id, pt.id);
      assert.equal(outro.familia, pt.familia);
      assert.equal(outro.categoriaId, pt.categoriaId);
      assert.equal(outro.grau, pt.grau);
      assert.equal(outro.distancia, pt.distancia);
      assert.equal(outro.graus, pt.graus);
      assert.deepEqual(outro.qualidadesEmComum, pt.qualidadesEmComum);
    }
  }
});

test('os nomes dos signos são localizados — e o PT não vaza pra dentro de es/en', () => {
  const enOposicao = compatibility('Áries', 'Libra', 'en');
  assert.match(enOposicao.chamada, /Aries/);
  assert.match(enOposicao.chamada, /Libra/);
  assert.equal(enOposicao.aspecto, 'Opposition');
  assert.equal(enOposicao.categoria, 'disharmonious');

  const enAversao = compatibility('Gêmeos', 'Câncer', 'en');
  assert.equal(enAversao.id, 'aversao30');
  assert.match(enAversao.texto, /Gemini/);
  assert.match(enAversao.texto, /Cancer/);

  const esCopresenca = compatibility('Touro', 'Touro', 'es');
  assert.equal(esCopresenca.aspecto, 'Copresencia');
  assert.match(esCopresenca.texto, /Tauro/);

  // Quem puxa é o MESMO signo em todo idioma — só o nome muda de língua.
  // Câncer+Áries é quadratura e o décimo signo a partir de Câncer é Áries.
  assert.match(compatibility('Câncer', 'Áries').chamada, /Áries/);
  assert.match(compatibility('Câncer', 'Áries', 'es').chamada, /Aries/);
  assert.match(compatibility('Câncer', 'Áries', 'en').chamada, /Aries/);

  const NOMES_PT_MARCADOS = /Áries|Gêmeos|Câncer|Leão|Virgem|Escorpião|Sagitário|Capricórnio|Aquário|Peixes|\bTouro\b/;
  const PALAVRAS_PT = /\bvocês\b|\bnão\b|\bsão\b/;
  for (const lang of ['es', 'en']) {
    for (const p of PARES[lang]) {
      const c = corpus(p.leitura);
      assert.ok(!NOMES_PT_MARCADOS.test(c), `${lang} ${p.a}+${p.b} vazou nome PT de signo: ${c.match(NOMES_PT_MARCADOS)}`);
      assert.ok(!PALAVRAS_PT.test(c), `${lang} ${p.a}+${p.b} vazou português: ${c.match(PALAVRAS_PT)}`);
    }
  }
});

// ===========================================================================
// 4. A LINHA VERMELHA, NOS TRÊS IDIOMAS
// ===========================================================================
// Regra 4 de lib/synastry.js e seus primos. A lista é de PALAVRA, não de
// intenção: se a palavra passa hoje numa frase inocente, amanhã passa numa
// frase que promete tratamento.

const SAUDE = {
  pt: [
    /\b(cura|curar|curam|sarar|sara|alivia|aliviar|al[íi]vio|tratamento|rem[ée]dio|terap[êe]utic\w*|terapia|energiz\w*)\b/i,
    /\bfertilidade\b|\bf[ée]rtil\b|engravidar|gravidez/i,
  ],
  es: [
    /\b(alivia|alivian|aliviar|alivio|calma|calman|calmar|calmante|sana|sanan|sanar|sanaci[óo]n|cura|curan|curar|curaci[óo]n|trata|tratan|tratar|tratamiento|tratamientos|energiza|energizan|energizar|energizante|terapia|terap[ée]utic\w*|remedio)\b/i,
    /\bfertilidad\b|\bf[ée]rtil\b|embarazo|embarazada/i,
  ],
  en: [
    /\b(relieve[sd]?|relief|sooth\w*|calm\w*|heal\w*|cure[sd]?|curing|treat(s|ed|ing|ment|ments)?|energiz\w*|therapy|therapeutic|remedy|remedies)\b/i,
    /\bfertility\b|\bfertile\b|pregnan\w*/i,
  ],
};

const FATALISMO = {
  pt: [
    /não d(ão|á|ao) certo/i, /não vai (dar|funcionar|durar)/i, /vai acabar|acaba mal|está condenad/i,
    /alma[s]? g[êe]mea/i, /feito[s]? um (pro|para o) outro/i, /vocês não combinam|incompatíveis/i,
    /garantia de|garantido|garantimos/i,
  ],
  es: [
    /almas gemelas/i, /hechos el uno para el otro/i, /media naranja/i, /pareja perfecta/i,
    /no van a (durar|funcionar|lograrlo)/i, /van a (terminar|separarse|fracasar)/i,
    /est[áa]n condenad/i, /\bincompatibles\b/i, /garantizad/i, /term[íi]nala|b[úu]scate otr/i,
  ],
  en: [
    /soul ?mates?/i, /meant (to be|for each other)/i, /made for each other/i,
    /perfect (match|couple|pair)/i, /\bdoomed\b/i, /will never (work|last)/i, /won'?t (work|last)/i,
    /you (two )?(don'?t|do not) match/i, /\bincompatible\b/i, /guaranteed?/i, /you should (leave|break ?up)/i,
  ],
};

test('nenhuma leitura, em nenhum idioma, usa linguagem de saúde ou seus primos', () => {
  for (const [lang, regexes] of Object.entries(SAUDE)) {
    for (const p of PARES[lang]) {
      const c = corpus(p.leitura);
      for (const re of regexes) {
        assert.ok(!re.test(c), `${lang} ${p.a}+${p.b} — linha vermelha: ${c.match(re)}`);
      }
    }
    // E o pack inteiro, incluindo o que nenhum par exercita por acaso.
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      for (const re of regexes) {
        assert.ok(!re.test(s), `${caminho} — linha vermelha: ${s.match(re)}`);
      }
    });
  }
});

test('nenhuma leitura, em nenhum idioma, decreta desfecho ou promete resultado', () => {
  for (const [lang, regexes] of Object.entries(FATALISMO)) {
    for (const p of PARES[lang]) {
      const c = corpus(p.leitura);
      for (const re of regexes) {
        assert.ok(!re.test(c), `${lang} ${p.a}+${p.b} — veredito: ${c.match(re)}`);
      }
    }
  }
  // Contrapartida: se a varredura não morde, ela não protege ninguém.
  assert.ok(FATALISMO.es.some((re) => re.test('ustedes son almas gemelas')));
  assert.ok(FATALISMO.en.some((re) => re.test('you two are soul mates')));
  assert.ok(FATALISMO.en.some((re) => re.test("this relationship won't last")));
});

test('a porcentagem não voltou por nenhuma das três portas', () => {
  // No PT, a bibliografia da quadratura carrega "% 3" desde antes (aritmética
  // de módulo, não nota — está no golden e test/synastry.test.js só varre
  // corpo+notas). O PT é ouro e não muda um byte, então a varredura PT segue o
  // recorte da suíte antiga; es/en nasceram escrevendo "módulo 3" e passam com
  // o corpus inteiro, fontes incluídas.
  for (const lang of ['pt', 'es', 'en']) {
    for (const p of PARES[lang]) {
      const c = lang === 'pt'
        ? [p.leitura.resumo, p.leitura.texto, p.leitura.forte, p.leitura.cuidado, p.leitura.chamada,
           ...DIMS.map((d) => p.leitura.vidaReal[d]),
           p.leitura.notaEscala, p.leitura.notaGrau, p.leitura.ressalvaSignoSolar, p.leitura.notaCaracterologia].join(' \n ')
        : corpus(p.leitura);
      assert.ok(!c.includes('%'), `${lang} ${p.a}+${p.b} mostra porcentagem`);
      assert.equal(p.leitura.pct, undefined);
      assert.equal(p.leitura.overall, undefined);
      assert.equal(p.leitura.indice, undefined);
    }
  }
});

test('o bloco 1 de es/en continua sem jargão — quem abre não explica capítulo', () => {
  const JARGAO = {
    es: [
      /tr[íi]gono|sextil|cuadratura|oposici[óo]n|aversi[óo]n|copresencia|conjunci[óo]n/i,
      /Ptolomeo|Tetrabiblos|Robbins|Arist[óo]teles|Lilly|Manilio|Naylor|Goodman/i,
      /\b[IVX]+\.\d+\b/, /arm[óo]nic|disarm[óo]nic|disjunt/i, /modalidad|kathuperter|verbatim|par[áa]frasis/i,
      /\d+\s*grados|°/i,
    ],
    en: [
      /\btrine\b|\bsextile\b|\bquartile\b|\bopposition\b|\baversion\b|co-presence|\bconjunction\b/i,
      /Ptolemy|Tetrabiblos|Robbins|Aristotle|Lilly|Manilius|Naylor|Goodman/i,
      /\b[IVX]+\.\d+\b/, /harmonious|disharmonious|disjunct/i, /modality|kathuperter|verbatim|paraphrase/i,
      /\d+\s*degrees|°/i,
    ],
  };
  for (const [lang, regexes] of Object.entries(JARGAO)) {
    for (const p of PARES[lang]) {
      const bloco1 = [p.leitura.chamada, ...DIMS.map((d) => p.leitura.vidaReal[d])].join(' \n ');
      for (const re of regexes) {
        assert.ok(!re.test(bloco1), `${lang} ${p.a}+${p.b} vazou jargão no bloco 1: ${bloco1.match(re)}`);
      }
    }
  }
});

test('toda leitura dura, nos três idiomas, carrega no bloco 1 a nuance que impede a sentença', () => {
  const MARCA = {
    pt: [/atrito não é sentença/i, /não termina/i],
    es: [/la fricci[óo]n no es sentencia/i, /no se termina/i],
    en: [/friction is no sentence/i, /does not end/i],
  };
  for (const [lang, regexes] of Object.entries(MARCA)) {
    const duros = PARES[lang].filter((p) => p.leitura.categoriaId === 'desarmonico');
    assert.equal(duros.length, 36, lang);
    for (const p of duros) {
      for (const re of regexes) {
        assert.match(p.leitura.vidaReal.longoPrazo, re, `${lang} ${p.a}+${p.b}`);
      }
    }
  }
});

// ===========================================================================
// 5. O FIO DA TELA — a Compatibilidade passa o idioma que já tem
// ===========================================================================

test('a tela de Compatibilidade passa o lang do useLanguage() pro motor', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'screens', 'CompatibilityScreen.js'), 'utf8');
  assert.match(src, /const \{ t, lang \} = useLanguage\(\)/, 'a tela não pega o lang do contexto');
  assert.match(src, /compatibility\(signA\.name, signB\.name, lang\)/, 'a tela não passa o lang pro motor');
});

// ===========================================================================
// 6. O CAMINHO — todo par difícil sai com o que fazer, nas TRÊS línguas
// ===========================================================================
// Feedback do dono, 04/08/2026: "nos pares difíceis o app já fala a real
// (mantém!) — mas agora TODO par difícil precisa sair com um caminho prático de
// convivência". Um caminho que existe só em português é um caminho que não
// existe: o app é divulgado no mundo inteiro e 2/3 dos leitores ficariam com o
// diagnóstico sem a saída. Daí estes testes viverem AQUI, e não só na suíte PT.

// A LINHA VERMELHA DO CAMPO — mesma disciplina de SAUDE e FATALISMO acima, e
// pelo mesmo motivo: conselho é onde a promessa entra sem pedir licença. Quem
// escreve "o que costuma ajudar" escreve "isso resolve" na revisão seguinte.
// A lista é de FORMA, não de palavra solta.
const PROMESSA = {
  pt: [
    [/\b(vai|vão|irá|irão) (resolver|consertar|salvar|acabar com|dar certo|funcionar|melhorar)\b/i, 'futuro garantido'],
    [/\bgarant(e|em|ido|ida|ia)\b|\bprometemos\b|\bcom certeza\b/i, 'garantia explícita'],
    [/\bbasta (fazer|dizer|combinar|marcar)\b|\bé só (fazer|dizer|combinar|marcar)\b/i, 'promessa de suficiência'],
    [/\bsempre funciona\b|\bnunca falha\b|\bresolve o problema\b/i, 'infalibilidade'],
    [/\bvale a pena (tentar|insistir|ficar|continuar)\b/i, 'conselho sobre a relação, não sobre o gesto'],
  ],
  es: [
    [/\b(va|van) a (resolver|arreglar|salvar|funcionar|mejorar|acabar con)\b/i, 'futuro garantido'],
    [/\bgarantiz\w+|\bprometemos\b|\bcon seguridad\b/i, 'garantia explícita'],
    [/\bbasta con\b|\bsolo tienen que\b|\bsólo tienen que\b/i, 'promessa de suficiência'],
    [/\bsiempre funciona\b|\bnunca falla\b|\bresuelve el problema\b/i, 'infalibilidade'],
    [/\bvale la pena (intentar|insistir|seguir|quedarse)\b/i, 'conselho sobre a relação, não sobre o gesto'],
  ],
  en: [
    [/\bwill (fix|solve|save|work|mend|sort (it|this) out)\b/i, 'futuro garantido'],
    [/\bguarantee\w*|\bwe promise\b|\bfor sure\b/i, 'garantia explícita'],
    [/\ball you (need|have) to do\b|\bjust (do|say|agree|book) \b/i, 'promessa de suficiência'],
    [/\balways works\b|\bnever fails\b|\bsolves the problem\b/i, 'infalibilidade'],
    [/\bworth (staying|trying to stay|holding on)\b/i, 'conselho sobre a relação, não sobre o gesto'],
  ],
};

// A CONTRAPARTIDA POSITIVA: sem hedge, a frase vira receita. Toda leitura tensa
// tem que RESSALVAR o gesto que propõe — "costuma", "suele", "tends to".
const HEDGE = {
  pt: /\bcostum(a|am)\b|\braramente\b|\bquase nunca\b/i,
  es: /\bsuele(n)?\b|\brara vez\b|\bcasi nunca\b/i,
  en: /\btends? to\b|\busually\b|\brarely\b|\balmost never\b/i,
};

test('TODO par tenso sai com caminho, nos três idiomas — e nenhum par fácil recebe conselho que não pediu', () => {
  for (const lang of ['pt', 'es', 'en']) {
    const tensos = PARES[lang].filter((p) => S.CATEGORIAS_COM_CAMINHO.includes(p.leitura.categoriaId));
    // 36 desarmônicos (quadratura 24 + oposição 12) + 48 sem aspecto (as duas
    // aversões) = 84. Se esta conta mudar, a definição de "difícil" mudou junto
    // e alguém precisa dizer por quê.
    assert.equal(tensos.length, 84, `${lang}: a contagem de pares tensos mudou`);
    for (const p of tensos) {
      const c = p.leitura.caminho;
      assert.equal(typeof c, 'string', `${lang} ${p.a}+${p.b} (${p.leitura.id}) sem caminho`);
      assert.ok(c.trim().length >= 200, `${lang} ${p.a}+${p.b} com caminho de ${c.length} caracteres — curto demais pra ser caminho`);
      const n = frases(c);
      assert.ok(n >= 2 && n <= 4, `${lang} ${p.a}+${p.b}: caminho com ${n} frases`);
      assert.ok(HEDGE[lang].test(c), `${lang} ${p.a}+${p.b}: caminho sem ressalva — vira receita`);
      assert.ok(!c.includes('%'), `${lang} ${p.a}+${p.b}: porcentagem no caminho`);
      assert.ok(!c.includes('undefined') && !c.includes('[object Object]'), `${lang} ${p.a}+${p.b}`);
    }
    // E o contrário: harmônico e co-presença NÃO recebem caminho. Escrever
    // "como conviver" onde não há atrito é encher linguiça com cara de conselho.
    for (const p of PARES[lang].filter((x) => !S.CATEGORIAS_COM_CAMINHO.includes(x.leitura.categoriaId))) {
      assert.equal(p.leitura.caminho, null, `${lang} ${p.a}+${p.b} (${p.leitura.categoriaId}) ganhou caminho sem ter atrito`);
    }
  }
});

test('nenhum caminho, em nenhum idioma, promete resultado', () => {
  for (const [lang, regexes] of Object.entries(PROMESSA)) {
    for (const p of PARES[lang]) {
      const c = p.leitura.caminho;
      if (!c) continue;
      for (const [re, motivo] of regexes) {
        assert.ok(!re.test(c), `${lang} ${p.a}+${p.b} — ${motivo}: ${c.match(re)}`);
      }
      // E o caminho passa pelas MESMAS listas do resto da leitura, sem desconto.
      for (const re of SAUDE[lang]) assert.ok(!re.test(c), `${lang} ${p.a}+${p.b} — saúde no caminho: ${c.match(re)}`);
      for (const re of FATALISMO[lang]) assert.ok(!re.test(c), `${lang} ${p.a}+${p.b} — veredito no caminho: ${c.match(re)}`);
    }
  }
  // Contrapartida: se a varredura não morde, ela não protege ninguém.
  assert.ok(PROMESSA.pt.some(([re]) => re.test('isso vai resolver o atrito de vocês')));
  assert.ok(PROMESSA.pt.some(([re]) => re.test('basta combinar antes e pronto')));
  assert.ok(PROMESSA.es.some(([re]) => re.test('esto va a arreglar la relación')));
  assert.ok(PROMESSA.en.some(([re]) => re.test('this will fix the fight')));
  assert.ok(PROMESSA.en.some(([re]) => re.test('all you need to do is talk')));
  // E não morde o que É permitido — o tom do app.
  assert.ok(!PROMESSA.pt.some(([re]) => re.test('combinar antes quem decide o quê costuma render mais')));
  assert.ok(!PROMESSA.en.some(([re]) => re.test('taking turns at leading tends to hold up better')));
});

test('o caminho diz de onde vem — fonte citada, ou rótulo de leitura do app', () => {
  // Regra 5 do cabeçalho de lib/synastry.js aplicada ao campo novo: conselho sem
  // procedência é conselho de revista. Ou tem locus, ou está assinado como nosso.
  const MARCA = {
    pt: /Lilly|Tetrabiblos|Aristóteles|leitura deste app/,
    es: /Lilly|Tetrabiblos|Aristóteles|lectura de esta app/,
    en: /Lilly|Tetrabiblos|Aristotle|this app's reading/,
  };
  for (const [lang, re] of Object.entries(MARCA)) {
    for (const p of PARES[lang].filter((x) => x.leitura.caminho)) {
      assert.match(p.leitura.caminho, re, `${lang} ${p.a}+${p.b}: caminho sem fonte e sem rótulo`);
    }
  }
  // A citação de Lilly é a que sustenta a quadratura, e ela vai VERBATIM nos
  // três idiomas com a página — traduzir citação é falsificá-la (regra 1).
  for (const lang of ['pt', 'es', 'en']) {
    for (const p of PARES[lang].filter((x) => x.leitura.id === 'quadratura')) {
      assert.match(p.leitura.caminho, /imperfect enmity/, `${lang} ${p.a}+${p.b} traduziu a citação de Lilly`);
      assert.match(p.leitura.caminho, /1647, p\. 106/, `${lang} ${p.a}+${p.b} citou Lilly sem a página`);
    }
  }
});

test('o caminho não colapsa: quatro relações, textos distintos, e nenhum idioma copia o outro', () => {
  // A mesma disciplina que impede os 144 pares de virarem 10 textos vale pro
  // campo novo: a quadratura distingue contrários absolutos de fio em comum, as
  // duas aversões não se confundem, e nenhuma relação empresta o caminho de
  // outra. (Contar "formas" trocando nome de signo por curinga, como faz
  // test/synastry.test.js, não serve aqui: a lista de nomes é a PT, e em es/en
  // ela não casa com nada — a contagem sairia inflada e provaria o contrário
  // do que se quer. Então a medida é por RELAÇÃO, que é idêntica nos três.)
  for (const lang of ['pt', 'es', 'en']) {
    const porId = {};
    for (const p of PARES[lang].filter((x) => x.leitura.caminho)) {
      (porId[p.leitura.id] = porId[p.leitura.id] || new Set()).add(p.leitura.caminho);
    }
    assert.deepEqual(Object.keys(porId).sort(), ['aversao150', 'aversao30', 'oposicao', 'quadratura'], lang);
    assert.ok(porId.quadratura.size >= 2, `${lang}: a quadratura de contrários absolutos e a de fio em comum saem iguais`);
    // Nenhuma relação compartilha um caminho com outra.
    const ids = Object.keys(porId);
    for (const a of ids) {
      for (const b of ids) {
        if (a >= b) continue;
        for (const texto of porId[a]) {
          assert.ok(!porId[b].has(texto), `${lang}: ${a} e ${b} compartilham o mesmo caminho`);
        }
      }
    }
  }
  // E entre idiomas: se dois batem, um deles não foi traduzido.
  for (const id of ['quadratura', 'oposicao', 'aversao30', 'aversao150']) {
    const [pt, es, en] = ['pt', 'es', 'en'].map((l) => PARES[l].find((p) => p.leitura.id === id).leitura.caminho);
    assert.notEqual(es, pt, `es/${id} ficou igual ao pt`);
    assert.notEqual(en, pt, `en/${id} ficou igual ao pt`);
    assert.notEqual(en, es, `en/${id} ficou igual ao es`);
  }
});

test('a tela renderiza o caminho no idioma da leitura — o campo novo chega na tela', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'screens', 'CompatibilityScreen.js'), 'utf8');
  assert.match(src, /result\.caminho/, 'o caminho não chega na tela em idioma nenhum');
  // E ele NÃO pode ser escrito à mão na tela: o texto vive nos packs, senão
  // sai em português pro mundo inteiro — o defeito que a extração de 31/07/2026
  // corrigiu no resto da leitura.
  assert.ok(!src.includes('Por onde começar'), 'o caminho foi escrito à mão na tela, em português');
  assert.ok(!src.includes('Where to start, in practice'), 'o caminho foi escrito à mão na tela');
});
