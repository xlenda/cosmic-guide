// test/waiteRegras.test.js
// AS QUATRO REGRAS DE PRÁTICA DE WAITE — e as travas que impedem esta feature
// de virar invenção.
//
// Este arquivo guarda sete leis:
//
//   1. A API É ESTÁVEL E A ORDEM É DA FONTE. Quatro regras, nesta ordem, com
//      os ids em PT nos três idiomas. Id desconhecido devolve null; nunca uma
//      quinta regra inventada.
//   2. NÃO HÁ CÉU AQUI, LOGO NÃO HÁ CÉU A FABRICAR. O módulo não importa
//      efeméride, signs, birthData nem storage — e o teste lê as linhas de
//      import do próprio fonte para garantir que continue assim.
//   3. PARIDADE DOS TRÊS PACKS. Mesma forma, mesmas chaves, nenhum valor
//      vazio, nenhum placeholder por interpolar, nenhum vazamento de PT em
//      es/en, e `lang` ausente é byte a byte o `lang='pt'`.
//   4. LINHA VERMELHA nos três idiomas: nada de saúde nem seus primos, nada
//      de promessa, nada de porcentagem, nada de prova social, e — específico
//      desta base — NENHUM AVISO DEFENSIVO, que foram removidos de propósito.
//   5. PRENDE PRIMEIRO, FONTE DEPOIS. Nenhuma `chamada` e nenhum primeiro
//      parágrafo de `abertura` pode conter nome próprio, ano de quatro
//      dígitos, século ou "§". O recibo carrega obra, autor, ano e parte.
//   6. AS QUATRO NÃO VÃO ENTRE ASPAS. Esta base não tem o inglês literal das
//      quatro notas; tem só a frase do embaralho. Aspas em `recibo` seriam
//      citação inventada — e o teste reprova.
//   7. A DATAÇÃO PASSA POR datacao.js. A obra nunca traduz, o autor volta na
//      forma que a língua consagra (aqui, intacto e de propósito), e o
//      `quando` sai na forma de cada língua.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const W = require('../lib/waiteRegras.js');
const PT = require('../lib/traducoes/waiteRegras.pt.js').PACK;
const ES = require('../lib/traducoes/waiteRegras.es.js').PACK;
const EN = require('../lib/traducoes/waiteRegras.en.js').PACK;

const LANGS = { pt: PT, es: ES, en: EN };
const IDIOMAS = ['pt', 'es', 'en'];

// Uma amostra por idioma, nas duas variantes de destinatário — que é a única
// coisa que muda a saída desta feature.
const AMOSTRA = {};
for (const lang of IDIOMAS) {
  AMOSTRA[lang] = [
    W.preparoDaTiragem({}, lang),
    W.preparoDaTiragem({ paraQuem: 'outra' }, lang),
  ];
}

// Tudo que o usuário lê num preparo, num idioma.
function corpus(p) {
  return [
    p.titulo,
    p.abertura,
    p.notaSemTranca,
    p.notaLeituraDoApp,
    p.botao.antes,
    p.botao.depois,
    ...p.regras.map((r) => `${r.titulo} ${r.chamada} ${r.oQueVoceFaz} ${r.porQue} ${r.recibo}`),
    ...p.verbatins.map((v) => `${v.texto} ${v.parafrase} ${v.locus}`),
    ...p.datacao.map((d) => `${d.linha} ${d.grauNome} ${d.nota}`),
    ...p.fonte,
  ].join(' \n ');
}

function varrerStrings(v, caminho, cb) {
  if (typeof v === 'string') return cb(caminho, v);
  if (Array.isArray(v)) return v.forEach((x, i) => varrerStrings(x, `${caminho}[${i}]`, cb));
  if (v && typeof v === 'object') for (const k of Object.keys(v)) varrerStrings(v[k], `${caminho}.${k}`, cb);
}

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

// ===========================================================================
// 1. A API É ESTÁVEL E A ORDEM É DA FONTE
// ===========================================================================

test('são quatro regras, nesta ordem, e os ids são os mesmos do motor', () => {
  assert.deepEqual(W.ORDEM_DAS_REGRAS, ['pergunta', 'embaralhar', 'vies', 'estranho']);
  assert.deepEqual(Object.keys(W.REGRAS).sort(), [...W.ORDEM_DAS_REGRAS].sort());
  // A ordem declarada bate com o campo `ordem` de cada uma — 1 a 4, sem furo.
  assert.deepEqual(W.ORDEM_DAS_REGRAS.map((id) => W.REGRAS[id].ordem), [1, 2, 3, 4]);
  // Só a segunda tem contagem; só a primeira pede texto.
  assert.equal(W.REGRAS.embaralhar.segundos, W.SEGUNDOS_DO_EMBARALHO);
  assert.deepEqual(W.ORDEM_DAS_REGRAS.filter((id) => W.REGRAS[id].pedeTexto), ['pergunta']);
  assert.deepEqual(W.ORDEM_DAS_REGRAS.filter((id) => W.REGRAS[id].segundos !== null), ['embaralhar']);
});

test('os ids das quatro são as MESMAS chaves nos três packs — são dados, não texto', () => {
  for (const [lang, pack] of Object.entries(LANGS)) {
    assert.deepEqual(Object.keys(pack.regras).sort(), [...W.ORDEM_DAS_REGRAS].sort(), lang);
  }
});

test('proximaRegra encadeia as quatro e para na última', () => {
  assert.equal(W.proximaRegra('pergunta'), 'embaralhar');
  assert.equal(W.proximaRegra('embaralhar'), 'vies');
  assert.equal(W.proximaRegra('vies'), 'estranho');
  assert.equal(W.proximaRegra('estranho'), null);
  assert.equal(W.proximaRegra('cruzCelta'), null);
  assert.equal(W.proximaRegra(null), null);
  assert.equal(W.proximaRegra(undefined), null);
});

test('regra desconhecida devolve null — nunca uma quinta regra', () => {
  for (const lang of IDIOMAS) {
    assert.equal(W.regraDaTiragem('inexistente', {}, lang), null);
    assert.equal(W.regraDaTiragem(null, {}, lang), null);
    assert.equal(W.regraDaTiragem('', {}, lang), null);
    assert.equal(W.regraDaTiragem(42, {}, lang), null);
  }
  // E a que existe devolve a mesma coisa que o preparo inteiro monta.
  const inteiro = W.preparoDaTiragem();
  for (const id of W.ORDEM_DAS_REGRAS) {
    assert.deepEqual(W.regraDaTiragem(id), inteiro.regras.find((r) => r.id === id));
  }
});

test('só a quarta regra muda com paraQuem — e paraQuem inválido cai em "voce"', () => {
  const voce = W.preparoDaTiragem({ paraQuem: 'voce' });
  const outra = W.preparoDaTiragem({ paraQuem: 'outra' });
  for (const id of ['pergunta', 'embaralhar', 'vies']) {
    const a = voce.regras.find((r) => r.id === id);
    const b = outra.regras.find((r) => r.id === id);
    assert.equal(a.oQueVoceFaz, b.oQueVoceFaz, `${id} mudou sem motivo`);
    assert.equal(a.porQue, b.porQue, `${id} mudou sem motivo`);
  }
  const e1 = voce.regras.find((r) => r.id === 'estranho');
  const e2 = outra.regras.find((r) => r.id === 'estranho');
  assert.notEqual(e1.oQueVoceFaz, e2.oQueVoceFaz);
  assert.notEqual(e1.porQue, e2.porQue);

  for (const invalido of [{}, { paraQuem: 'sei-la' }, { paraQuem: null }, null, undefined, 'texto']) {
    assert.deepEqual(W.preparoDaTiragem(invalido), voce, JSON.stringify(invalido));
  }
});

// ===========================================================================
// 2. NÃO HÁ CÉU AQUI, LOGO NÃO HÁ CÉU A FABRICAR
// ===========================================================================

test('lib/waiteRegras.js não importa efeméride, signs, birthData nem storage', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'waiteRegras.js'), 'utf8');
  const linhasDeImport = src.split('\n').filter((l) => /^\s*import\s/.test(l) || /\brequire\s*\(/.test(l));
  assert.ok(linhasDeImport.length > 0, 'o teste precisa ver pelo menos os imports dos packs');
  for (const linha of linhasDeImport) {
    assert.ok(
      !/astronomy-engine|['./]signs|birthData|AsyncStorage|@react-native-async-storage|['./]storage/.test(linha),
      `esta feature não tem céu para fabricar e não pode passar a ter: ${linha.trim()}`
    );
  }
  // Os únicos imports são os três packs e a datação.
  assert.equal(linhasDeImport.length, 4, linhasDeImport.join(' | '));
});

test('o preparo nunca fica indisponível — ele não depende de dado nenhum da pessoa', () => {
  for (const lang of IDIOMAS) {
    const p = W.preparoDaTiragem({}, lang);
    assert.equal(p.regras.length, 4, lang);
    assert.equal(p.total, 4, lang);
    assert.equal(p.disponivel, undefined, 'não existe caso indisponível aqui, e inventar um seria confundir a tela');
  }
});

// ===========================================================================
// 3. PARIDADE DOS TRÊS PACKS
// ===========================================================================

test('es e en têm EXATAMENTE a mesma forma do pt — mesmas chaves, mesmos tipos', () => {
  const formaPt = forma(PT);
  assert.deepEqual(forma(ES), formaPt, 'o pack es divergiu da forma do pt');
  assert.deepEqual(forma(EN), formaPt, 'o pack en divergiu da forma do pt');
});

test('nenhum valor de nenhum pack é vazio', () => {
  for (const [lang, pack] of Object.entries(LANGS)) {
    varrerStrings(pack, lang, (caminho, s) => assert.ok(s.trim().length > 0, `${caminho} está vazio`));
  }
});

test('o preparo sai INTEIRO nos três idiomas — nada perdido, nada por interpolar', () => {
  for (const lang of IDIOMAS) {
    for (const p of AMOSTRA[lang]) {
      for (const campo of ['titulo', 'abertura', 'notaSemTranca', 'notaLeituraDoApp']) {
        assert.ok(p[campo], `${lang} perdeu ${campo}`);
      }
      assert.equal(p.fonte.length, 6, lang);
      assert.equal(p.verbatins.length, 1, lang);
      assert.equal(p.datacao.length, 4, lang);
      const c = corpus(p);
      assert.ok(!c.includes('undefined'), `${lang} vazou "undefined"`);
      assert.ok(!c.includes('[object Object]'), `${lang} vazou objeto`);
      assert.ok(!c.includes('NaN'), `${lang} vazou NaN`);
      assert.ok(!/\$\{|\{\w+\}/.test(c), `${lang} vazou placeholder sem interpolar`);
      assert.ok(p.abertura.length > 550, `${lang} abertura curta demais: ${p.abertura.length}`);
      for (const r of p.regras) {
        assert.ok(r.chamada.length > 150, `${lang}/${r.id} chamada com ${r.chamada.length}`);
        assert.ok(r.oQueVoceFaz.length > 100, `${lang}/${r.id} gesto com ${r.oQueVoceFaz.length}`);
        assert.ok(r.porQue.length > 100, `${lang}/${r.id} motivo com ${r.porQue.length}`);
        assert.ok(r.recibo.length > 130, `${lang}/${r.id} recibo com ${r.recibo.length}`);
      }
    }
  }
});

test('es e en não vazam português, e não repetem o pt', () => {
  // O verbatim inglês é o mesmo nos três e não é português — por isso a lista
  // marca palavras PT que não existem em es nem en.
  const PT_MARCADO = /\bvoc[êe]\b|\bn[ãa]o\b|\bs[ãa]o\b|\bpergunta\b|\bperguntas\b|\bbaralho\b|\bembaralh\w*|\bem voz alta\b|\btiragem\b|\bcabe[çc]a\b|\bmesmo\b|\bs[ée]c\.\s*XX\b/i;
  for (const lang of ['es', 'en']) {
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      assert.ok(!PT_MARCADO.test(s), `${caminho} vazou português: ${s.match(PT_MARCADO)}`);
    });
    for (let i = 0; i < AMOSTRA.pt.length; i++) {
      assert.notEqual(AMOSTRA[lang][i].abertura, AMOSTRA.pt[i].abertura, `${lang} abertura igual ao pt`);
      assert.notEqual(AMOSTRA[lang][i].titulo, AMOSTRA.pt[i].titulo, `${lang} título igual ao pt`);
      for (let j = 0; j < 4; j++) {
        assert.notEqual(AMOSTRA[lang][i].regras[j].chamada, AMOSTRA.pt[i].regras[j].chamada, `${lang} chamada ${j} igual ao pt`);
        assert.notEqual(AMOSTRA[lang][i].regras[j].recibo, AMOSTRA.pt[i].regras[j].recibo, `${lang} recibo ${j} igual ao pt`);
      }
    }
  }
  // Contrapartida: varredura que não morde não protege ninguém.
  assert.ok(PT_MARCADO.test('você não é a mesma pessoa'));
});

test("lang ausente e lang='pt' são o MESMO preparo; idioma desconhecido cai no PT", () => {
  const semLang = W.preparoDaTiragem();
  for (const lang of ['pt', undefined, null, 'fr', 'de-DE', 42, {}]) {
    assert.deepEqual(W.preparoDaTiragem({}, lang), semLang, String(lang));
  }
  assert.deepEqual(W.regraDaTiragem('vies', {}, 'fr'), W.regraDaTiragem('vies'));
  assert.deepEqual(W.avaliarPergunta('e aí?', 'fr'), W.avaliarPergunta('e aí?'));
  assert.deepEqual(W.progressoDoPreparo([], 'fr'), W.progressoDoPreparo([]));
  assert.deepEqual(W.fontesDatadas('fr'), W.fontesDatadas());
});

// ===========================================================================
// 4. A LINHA VERMELHA, NOS TRÊS IDIOMAS
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
  pt: [/\bvocê vai\b/i, /\bvai (ter|conseguir|ganhar|dar certo|acontecer)\b/i, /garant\w+/i, /sorte grande/i, /destino selado/i],
  es: [/\bvas a (tener|lograr|conseguir|ganar)\b/i, /garantiz\w+/i, /suerte grande/i, /destino sellado/i],
  en: [/\byou will\b/i, /\byou'?ll\b/i, /\byou'?re going to\b/i, /guarantee\w*/i, /destined to/i, /\bfated to\b/i],
};

// Removidos do app de propósito. Escrever um novo é bug, não zelo.
const AVISO_DEFENSIVO = [
  /apenas entretenimento|fins de entretenimento|n[ãa]o garante resultados|sem valor cient[íi]fico/i,
  /solo entretenimiento|fines de entretenimiento|no garantiza resultados/i,
  /entertainment purposes|does not guarantee results|for entertainment only/i,
];

const PROVA_SOCIAL = /\bmilhares de\b|\bmilh[õo]es de (usu|pesso)\w*|\bmiles de (usuari|person)\w*|\bthousands of (users|people|readers)\b/i;

test('nenhum texto, em nenhum idioma, usa linguagem de saúde ou seus primos', () => {
  for (const [lang, regexes] of Object.entries(SAUDE)) {
    for (const p of AMOSTRA[lang]) {
      const c = corpus(p);
      for (const re of regexes) assert.ok(!re.test(c), `${lang} — linha vermelha no preparo: ${c.match(re)}`);
    }
    // E o pack inteiro, inclusive o que nenhuma saída exercita por acaso.
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      for (const re of regexes) assert.ok(!re.test(s), `${caminho} — linha vermelha: ${s.match(re)}`);
    });
  }
  // Contrapartida: varredura que não morde não protege ninguém.
  assert.ok(SAUDE.pt.some((re) => re.test('embaralhe para acalmar a ansiedade')));
  assert.ok(SAUDE.es.some((re) => re.test('esto calma y sana')));
  assert.ok(SAUDE.en.some((re) => re.test('this will heal and soothe you')));
});

test('nenhum texto promete resultado nem decreta desfecho', () => {
  for (const [lang, regexes] of Object.entries(PROMESSA)) {
    for (const p of AMOSTRA[lang]) {
      const c = corpus(p);
      for (const re of regexes) assert.ok(!re.test(c), `${lang} — promessa: ${c.match(re)}`);
    }
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      for (const re of regexes) assert.ok(!re.test(s), `${caminho} — promessa: ${s.match(re)}`);
    });
  }
  assert.ok(PROMESSA.pt.some((re) => re.test('você vai tirar a carta certa')));
  assert.ok(PROMESSA.en.some((re) => re.test('you will draw the right card')));
});

test('nenhum aviso defensivo, nenhuma prova social, nenhuma porcentagem', () => {
  for (const lang of IDIOMAS) {
    for (const p of AMOSTRA[lang]) {
      const c = corpus(p);
      assert.ok(!c.includes('%'), `${lang} mostra porcentagem`);
      assert.ok(!PROVA_SOCIAL.test(c), `${lang} inventou prova social: ${c.match(PROVA_SOCIAL)}`);
      for (const re of AVISO_DEFENSIVO) assert.ok(!re.test(c), `${lang} escreveu aviso defensivo: ${c.match(re)}`);
    }
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      for (const re of AVISO_DEFENSIVO) assert.ok(!re.test(s), `${caminho} — aviso defensivo: ${s.match(re)}`);
    });
  }
  assert.ok(AVISO_DEFENSIVO.some((re) => re.test('isto é apenas entretenimento')));
});

// ===========================================================================
// 5. PRENDE PRIMEIRO, FONTE DEPOIS
// ===========================================================================

const JARGAO = [
  /Waite|Pictorial|Etteilla|Golden Dawn|Colman Smith|Rider|Cruz Celta|Celtic Cross/i,
  /\b(1[5-9]\d{2}|20\d{2})\b/,
  /§/,
  /\bs[ée]c\.|\bsiglo\b|\bcentury\b|\bcenturies\b/i,
];

test('a CHAMADA de cada regra abre na vida real: sem nome próprio, sem ano, sem capítulo', () => {
  for (const lang of IDIOMAS) {
    for (const p of AMOSTRA[lang]) {
      for (const r of p.regras) {
        for (const re of JARGAO) {
          assert.ok(!re.test(r.chamada), `${lang}/${r.id}: a chamada abriu com erudição — ${r.chamada.match(re)}`);
        }
      }
    }
  }
});

test('o PRIMEIRO parágrafo da abertura também é vida real; a fonte vem DEPOIS', () => {
  for (const lang of IDIOMAS) {
    const p = AMOSTRA[lang][0];
    const paragrafos = p.abertura.split('\n\n');
    assert.ok(paragrafos.length >= 3, `${lang}: a abertura tem ${paragrafos.length} parágrafos`);
    for (const re of JARGAO) {
      assert.ok(!re.test(paragrafos[0]), `${lang}: a abertura vazou erudição — ${paragrafos[0].match(re)}`);
    }
    // E o recibo está lá, mais adiante.
    assert.match(p.abertura, /The Pictorial Key to the Tarot/);
    assert.match(p.abertura, /1911/);
    assert.ok(p.abertura.indexOf('Waite') > paragrafos[0].length, `${lang}: a fonte abriu o texto`);
  }
});

test('o gesto vem antes do recibo em toda regra — e o gesto é uma coisa de fazer agora', () => {
  // A ordem dos campos é contrato de tela: chamada → oQueVoceFaz → porQue →
  // recibo. Aqui a trava possível é a de conteúdo: o gesto não pode ser
  // erudição disfarçada de instrução.
  for (const lang of IDIOMAS) {
    for (const p of AMOSTRA[lang]) {
      for (const r of p.regras) {
        assert.ok(!/§/.test(r.oQueVoceFaz), `${lang}/${r.id}: o gesto virou citação`);
        assert.ok(!/Pictorial/i.test(r.oQueVoceFaz), `${lang}/${r.id}: o gesto virou citação`);
      }
    }
  }
});

// ===========================================================================
// 6. A FONTE, E SÓ A FONTE
// ===========================================================================

test('todo recibo carrega obra, autor, ano e parte', () => {
  for (const lang of IDIOMAS) {
    for (const p of AMOSTRA[lang]) {
      for (const r of p.regras) {
        assert.match(r.recibo, /A\. E\. Waite/, `${lang}/${r.id} sem autor`);
        assert.match(r.recibo, /The Pictorial Key to the Tarot/, `${lang}/${r.id} sem obra`);
        assert.match(r.recibo, /1911/, `${lang}/${r.id} sem ano`);
        assert.match(r.recibo, /§\s?8/, `${lang}/${r.id} sem o locus`);
      }
    }
  }
});

test('as quatro notas NÃO vão entre aspas — esta base não tem o inglês literal delas', () => {
  for (const lang of IDIOMAS) {
    for (const p of AMOSTRA[lang]) {
      for (const r of p.regras) {
        assert.ok(!/["“”]/.test(r.recibo), `${lang}/${r.id}: aspas no recibo viram citação inventada — ${r.recibo}`);
        assert.ok(!/["“”]/.test(r.chamada) && !/["“”]/.test(r.porQue), `${lang}/${r.id}: aspas fora do verbatim`);
      }
    }
  }
  // E a lacuna está declarada, com o motivo.
  const ids = W.NAO_ACHADO.map((n) => n.id);
  assert.ok(ids.includes('verbatimDasQuatroNotas'));
  assert.ok(ids.includes('tiragemDeTresCartas'));
  assert.ok(ids.includes('duracaoDoEmbaralho'));
  assert.ok(ids.includes('criterioDePerguntaDefinida'));
  assert.ok(ids.includes('tecnicaParaLerParaSiMesmo'));
  for (const n of W.NAO_ACHADO) assert.ok(n.texto.length > 120, `${n.id} declarou a lacuna sem dizer o porquê`);
});

test('a ÚNICA citação verbatim é a que a base registra, e é idêntica nos três packs', () => {
  const esperado = 'Shuffle the entire pack and turn some of the cards round, so as to invert their tops.';
  for (const lang of IDIOMAS) {
    const v = AMOSTRA[lang][0].verbatins[0];
    assert.equal(v.texto, esperado, `${lang} mexeu no verbatim — traduzir citação é falsificá-la`);
    assert.match(v.locus, /A\. E\. Waite, The Pictorial Key to the Tarot, 1911/);
    assert.match(v.locus, /§\s?8/);
    // A paráfrase é assinada pelo app e muda por idioma; a citação não.
    assert.ok(v.parafrase.length > 80, lang);
  }
  assert.notEqual(AMOSTRA.es[0].verbatins[0].parafrase, AMOSTRA.pt[0].verbatins[0].parafrase);
  assert.notEqual(AMOSTRA.en[0].verbatins[0].parafrase, AMOSTRA.pt[0].verbatins[0].parafrase);
});

test('a tiragem de três cartas nunca é chamada de clássica nem de tradicional', () => {
  const PROIBIDO = /tiragem cl[áa]ssica|tiragem tradicional|tirada cl[áa]sica|tirada tradicional|classic (three[- ]card )?spread|traditional (three[- ]card )?spread/i;
  for (const lang of IDIOMAS) {
    for (const p of AMOSTRA[lang]) {
      assert.ok(!PROIBIDO.test(corpus(p)), `${lang}: doc 05 §3.6 — a de três não tem fonte datada`);
    }
  }
  // E a nota do app diz isso na cara, nos três.
  for (const lang of IDIOMAS) {
    assert.match(AMOSTRA[lang][0].notaLeituraDoApp, /The Pictorial Key/);
    assert.match(AMOSTRA[lang][0].notaLeituraDoApp, /1911/);
  }
});

test('o app não tranca o botão — completo troca o rótulo, e a nota explica por quê', () => {
  const cheio = W.progressoDoPreparo([...W.ORDEM_DAS_REGRAS]);
  assert.equal(cheio.completo, true);
  assert.equal(cheio.botao, PT.botao.depois);
  assert.equal(W.progressoDoPreparo([]).botao, PT.botao.antes);
  assert.equal(cheio.bloqueado, undefined, 'nada aqui pode sugerir gatear a tiragem');
  for (const lang of IDIOMAS) {
    assert.ok(AMOSTRA[lang][0].notaSemTranca.length > 100, lang);
  }
});

// ===========================================================================
// 7. A DATAÇÃO PASSA POR lib/traducoes/datacao.js
// ===========================================================================

test('a OBRA nunca traduz e o AUTOR volta na forma que a língua consagra', () => {
  const porLang = Object.fromEntries(IDIOMAS.map((l) => [l, W.fontesDatadas(l)]));
  for (let i = 0; i < W.ORDEM_DAS_DATACOES.length; i++) {
    const pt = porLang.pt[i];
    for (const lang of ['es', 'en']) {
      assert.equal(porLang[lang][i].obra, pt.obra, `${lang}: a obra traduziu, e obra não traduz`);
      // Nenhum destes quatro tem forma consagrada diferente por língua —
      // "A. E. Waite" é "A. E. Waite" nos três. O fallback devolvê-los
      // intactos é o comportamento certo, e é isto que está travado aqui.
      assert.equal(porLang[lang][i].autor, pt.autor, `${lang}: autor mudou sem forma consagrada`);
    }
  }
  assert.equal(porLang.pt[0].obra, 'The Pictorial Key to the Tarot');
  assert.equal(porLang.en[0].obra, 'The Pictorial Key to the Tarot');
  assert.equal(porLang.es[0].autor, 'A. E. Waite');
});

test('a DATAÇÃO ganha a forma de cada língua — e sai diferente nas três', () => {
  const porId = (lang) => Object.fromEntries(W.fontesDatadas(lang).map((d) => [d.id, d]));
  const pt = porId('pt');
  const es = porId('es');
  const en = porId('en');

  assert.equal(pt.baralhoRWS.quando, 'dezembro de 1909');
  assert.equal(es.baralhoRWS.quando, 'diciembre de 1909');
  assert.equal(en.baralhoRWS.quando, 'December 1909');

  assert.equal(pt.cruzCelta.quando, 'anos 1890');
  assert.equal(es.cruzCelta.quando, 'años 1890');
  assert.equal(en.cruzCelta.quando, '1890s');

  // Ano solto não se traduz — e não pode "virar" nada.
  for (const l of [pt, es, en]) {
    assert.equal(l.pictorialKey.quando, '1911');
    assert.equal(l.etteilla.quando, '1770');
  }

  // A linha montada junta autor, obra e quando, e pula a obra que não existe.
  assert.equal(en.baralhoRWS.linha, 'Pamela Colman Smith, Rider-Waite-Smith, December 1909');
  assert.equal(pt.etteilla.linha, 'Etteilla, 1770');
  assert.ok(!pt.etteilla.linha.includes('null'));
});

test('cada datação vem com grau, nome do grau no idioma, e nota', () => {
  for (const lang of IDIOMAS) {
    for (const d of W.fontesDatadas(lang)) {
      assert.ok(W.GRAUS.includes(d.grau), `${lang}/${d.id} com grau fora da lista`);
      assert.ok(d.grauNome && d.grauNome.length > 3, `${lang}/${d.id} sem nome de grau`);
      assert.ok(d.nota && d.nota.length > 60, `${lang}/${d.id} sem nota`);
    }
    // Só os graus usados existem no pack — rótulo morto vira erro depois.
    assert.deepEqual(Object.keys(LANGS[lang].graus).sort(), [...W.GRAUS].sort(), lang);
  }
  assert.notEqual(W.fontesDatadas('en')[0].grauNome, W.fontesDatadas('pt')[0].grauNome);
  assert.notEqual(W.fontesDatadas('es')[0].grauNome, W.fontesDatadas('pt')[0].grauNome);
});

// ===========================================================================
// 8. A PRIMEIRA REGRA, COM CAMPO DE TEXTO — mecânica, e só mecânica
// ===========================================================================

test('sem pergunta escrita o app diz que falta, e não inventa uma', () => {
  for (const lang of IDIOMAS) {
    for (const entrada of [null, undefined, '', '   ', 42, {}]) {
      const a = W.avaliarPergunta(entrada, lang);
      assert.equal(a.sinal, 'vazia', `${lang} / ${String(entrada)}`);
      assert.equal(a.definida, false);
      assert.equal(a.palavras, 0);
      assert.equal(a.texto, '');
      assert.ok(a.mensagem.length > 80, `${lang}: mensagem seca demais`);
    }
  }
});

test('a contagem é do TEXTO, e os limiares são os do app', () => {
  assert.equal(W.MINIMO_DE_PALAVRAS, 4);
  const curta = W.avaliarPergunta('e o amor?');
  assert.equal(curta.palavras, 3);
  assert.equal(curta.sinal, 'curta');
  assert.equal(curta.minimoDePalavras, 4);

  const duas = W.avaliarPergunta('Ele volta? E eu devo esperar por ele?');
  assert.equal(duas.interrogacoes, 2);
  assert.equal(duas.sinal, 'duasPerguntas');

  const boa = W.avaliarPergunta('  O que está me segurando nessa conversa?  ');
  assert.equal(boa.sinal, 'definida');
  assert.equal(boa.definida, true);
  assert.equal(boa.texto, 'O que está me segurando nessa conversa?');
  assert.equal(boa.palavras, 7);
  // Mesmo com a frase boa, falta o gesto — a regra é DIZER.
  assert.ok(boa.proximoPasso.length > 60);
  assert.match(boa.recibo, /A\. E\. Waite/);
});

test('a avaliação se declara leitura do app onde o critério é do app', () => {
  for (const lang of IDIOMAS) {
    const curta = W.avaliarPergunta('e aí?', lang);
    assert.match(curta.mensagem, /app/i, `${lang}: o critério de quatro palavras é nosso e tem que dizer isso`);
  }
});

test('os exemplos de pergunta de cada pack passam no próprio critério', () => {
  for (const lang of IDIOMAS) {
    const exemplos = LANGS[lang].pergunta.exemplos;
    assert.equal(exemplos.length, 3, lang);
    for (const ex of exemplos) {
      assert.equal(W.avaliarPergunta(ex, lang).sinal, 'definida', `${lang}: o exemplo reprova no próprio critério — ${ex}`);
    }
  }
});

// ===========================================================================
// 9. O PROGRESSO — o que a tela usa para o rótulo do botão
// ===========================================================================

test('o progresso conta as quatro, ignora id desconhecido e não conta repetido', () => {
  const nenhuma = W.progressoDoPreparo([]);
  assert.equal(nenhuma.quantas, 0);
  assert.equal(nenhuma.completo, false);
  assert.equal(nenhuma.texto, PT.progresso.nenhuma);
  assert.deepEqual(nenhuma.faltam, W.ORDEM_DAS_REGRAS);

  const uma = W.progressoDoPreparo(['pergunta', 'pergunta', 'inexistente']);
  assert.equal(uma.quantas, 1);
  assert.deepEqual(uma.feitas, ['pergunta']);
  assert.deepEqual(uma.faltam, ['embaralhar', 'vies', 'estranho']);
  assert.ok(uma.texto.includes(PT.regras.embaralhar.titulo), 'a linha de estado tem que dizer qual é a próxima');

  // Fora de ordem continua contando: as regras não são um funil.
  assert.equal(W.progressoDoPreparo(['estranho', 'vies']).quantas, 2);

  for (const entrada of [null, undefined, 'pergunta', 42]) {
    assert.equal(W.progressoDoPreparo(entrada).quantas, 0, String(entrada));
  }
});

test('o progresso sai nos três idiomas, e a linha parcial nomeia a próxima regra', () => {
  for (const lang of IDIOMAS) {
    const parcial = W.progressoDoPreparo(['pergunta', 'embaralhar'], lang);
    assert.equal(parcial.quantas, 2);
    assert.ok(parcial.texto.includes(LANGS[lang].regras.vies.titulo), `${lang}: ${parcial.texto}`);
    assert.ok(!/\{|\}/.test(parcial.texto), `${lang} vazou placeholder`);
    const cheio = W.progressoDoPreparo(W.ORDEM_DAS_REGRAS, lang);
    assert.equal(cheio.texto, LANGS[lang].progresso.completo);
    assert.equal(cheio.botao, LANGS[lang].botao.depois);
  }
  // E os três textos são de fato três textos.
  const t = IDIOMAS.map((l) => W.progressoDoPreparo(['pergunta'], l).texto);
  assert.equal(new Set(t).size, 3, 'algum idioma repetiu o texto de outro');
});

// ===========================================================================
// 10. O PT É REFERÊNCIA — âncoras byte a byte no que não pode mudar sem querer
// ===========================================================================

// ===========================================================================
// 11. O CHROME DA TELA — nasceu em 01/08/2026, quando o módulo foi ligado
// ===========================================================================
// screens/TarotScreen.js é VITRINE: ela mostra o que o motor exporta e não
// redige uma linha. Os rótulos de interface (abrir, fechar, marcar, contar,
// pular) moram no bloco `tela` dos três packs — não em lib/i18n.js e não dentro
// do componente. Estas leis são as mesmas do resto do arquivo, aplicadas ao
// chrome: paridade exata de chaves, mesmo molde, e a isca do cartão fechado
// obedecendo ao PRENDE PRIMEIRO como qualquer `chamada`.
//
// As varreduras de linha vermelha (saúde, promessa, aviso defensivo, vazamento
// de português) já pegam este bloco de graça: elas usam varrerStrings sobre o
// pack inteiro, e `tela` deixou de ser string solta para virar objeto.

const CHAVES_DE_TELA = [
  'nome',
  'convite',
  'conviteLinha',
  'abrir',
  'fechar',
  'pular',
  'paraQuemRotulo',
  'paraQuemVoce',
  'paraQuemOutra',
  'rotuloGesto',
  'rotuloPorQue',
  'rotuloRecibo',
  'rotuloExemplos',
  'contar',
  'contando',
  'contada',
  'marcar',
  'marcada',
  'rotuloVerbatim',
  'rotuloDatacao',
  'rotuloFontes',
  'verFontes',
  'ocultarFontes',
];

test('NENHUMA DATA INVENTADA: todo ano de quatro dígitos desta feature existe na base', () => {
  // Mesma trava de test/tarotHistoria.test.js, aplicada ao que ESTA feature põe
  // na tela. Data inventada não entra por má-fé, entra por descuido numa
  // revisão de texto — e o preparo cita quatro datações.
  const doc = (nome) => fs.readFileSync(path.join(__dirname, '..', 'docs', 'tradicao', nome), 'utf8');
  const base = doc('05-taro-historia-e-leitura.md') + '\n' + doc('00-tese.md');
  const forasteiros = [];
  for (const lang of IDIOMAS) {
    for (const p of AMOSTRA[lang]) {
      const visivel = [corpus(p), ...Object.values(LANGS[lang].tela)].join(' \n ');
      for (const m of visivel.matchAll(/\b\d{4}\b/g)) {
        if (!base.includes(m[0])) forasteiros.push(`${lang}: ${m[0]}`);
      }
    }
  }
  assert.deepEqual(forasteiros, [], `ano que não existe em docs/tradicao:\n  ${forasteiros.join('\n  ')}`);
});

test('o chrome da tela existe nos três packs, com as MESMAS chaves', () => {
  for (const [lang, pack] of Object.entries(LANGS)) {
    assert.equal(typeof pack.tela, 'object', `${lang}: o bloco tela sumiu`);
    assert.deepEqual(Object.keys(pack.tela).sort(), [...CHAVES_DE_TELA].sort(), `${lang}: chaves de tela ≠ PT`);
    for (const [chave, valor] of Object.entries(pack.tela)) {
      assert.equal(typeof valor, 'string', `${lang}/${chave} não é texto`);
      assert.ok(valor.trim().length > 0, `${lang}/${chave} está vazio`);
    }
  }
});

test('o único molde do chrome é {s}, e ele está nos três', () => {
  const moldes = (s) => (s.match(/\{\w+\}/g) || []).sort();
  for (const [lang, pack] of Object.entries(LANGS)) {
    for (const [chave, valor] of Object.entries(pack.tela)) {
      assert.deepEqual(moldes(valor), moldes(PT.tela[chave]), `${lang}/${chave}: molde diferente do pt`);
    }
    assert.deepEqual(moldes(pack.tela.contando), ['{s}'], `${lang}: a contagem perdeu o molde dos segundos`);
  }
});

test('a isca do cartão fechado é vida real — a fonte fica a um toque, dentro', () => {
  for (const [lang, pack] of Object.entries(LANGS)) {
    for (const campo of ['convite', 'conviteLinha']) {
      for (const re of JARGAO) {
        assert.ok(!re.test(pack.tela[campo]), `${lang}/${campo}: a isca abriu com erudição — ${pack.tela[campo].match(re)}`);
      }
    }
  }
});

test('o chrome sai nos três idiomas, e são três textos', () => {
  for (const chave of ['convite', 'conviteLinha', 'marcar', 'contar', 'pular']) {
    const t = IDIOMAS.map((l) => LANGS[l].tela[chave]);
    assert.equal(new Set(t).size, 3, `algum idioma repetiu ${chave} de outro`);
  }
});

// ===========================================================================
// 12. A TELA ESTÁ LIGADA — e liga sem trancar nada
// ===========================================================================
// Um motor perfeito que nenhuma tela chama não existe para o usuário. Este
// bloco é o que impede a feature de voltar a ser código morto — e o que impede
// a próxima edição de transformar o convite em pedágio.

const TELA_TARO = fs.readFileSync(path.join(__dirname, '..', 'screens', 'TarotScreen.js'), 'utf8');

test('screens/TarotScreen.js chama o motor e renderiza o preparo', () => {
  for (const chamada of ['preparoDaTiragem', 'progressoDoPreparo', 'avaliarPergunta']) {
    assert.ok(TELA_TARO.includes(chamada), `a tela não chama ${chamada}`);
  }
  assert.match(TELA_TARO, /<PreparoDeWaite/, 'o painel do preparo sumiu da tela');
  assert.match(TELA_TARO, /from '\.\.\/lib\/waiteRegras'/, 'o import do motor sumiu');
});

test('o preparo entra ANTES do botão de tirar — é o vão entre escolher o tema e apertar', () => {
  const iPreparo = TELA_TARO.indexOf('<PreparoDeWaite');
  const iBotao = TELA_TARO.indexOf("t('tarot.draw')");
  assert.ok(iPreparo > 0 && iBotao > iPreparo, 'o preparo tem que vir antes do botão de tirar');
});

test('o preparo NÃO tranca a tiragem: nada de disabled amarrado ao progresso', () => {
  // O botão de contar os vinte segundos pode (e deve) desabilitar enquanto
  // conta — o que não pode é qualquer `disabled` pendurado no progresso das
  // quatro, que é o que transformaria nota de prática em condição.
  assert.doesNotMatch(TELA_TARO, /disabled=\{[^}]*(completo|preparoFeitas|progressoDoWaite)/);
  // E o rótulo do botão é a única coisa que o `completo` move.
  assert.match(TELA_TARO, /progressoDoWaite\.completo \? progressoDoWaite\.botao/);
});

test('o chrome do preparo não passa por lib/i18n.js nem inventa AsyncStorage', () => {
  assert.match(TELA_TARO, /chromeDoPreparo/, 'o chrome tem que sair do pack do módulo');
  // A palavra aparece num comentário antigo da tela (o limite diário é
  // assíncrono porque lê disco) — o que não pode existir é o IMPORT.
  const linhasDeImport = TELA_TARO.split('\n').filter((l) => /^\s*import\s/.test(l) || /\brequire\s*\(/.test(l));
  for (const linha of linhasDeImport) {
    assert.ok(!/AsyncStorage|@react-native-async-storage/.test(linha), `tela nenhuma importa AsyncStorage direto: ${linha.trim()}`);
  }
  assert.ok(!/t\('waite|t\("waite|t\('preparo/.test(TELA_TARO), 'o chrome do preparo não é chave de i18n');
});

test('as travas de acesso da tela continuam de pé — o preparo não encostou nelas', () => {
  for (const trava of [
    'hasUsedFeatureOnce',
    'markFeatureUsedOnce',
    'canDrawToday',
    'recordDraw',
    'consumeBonusTarotReading',
    'previaVitaliciaGasta',
    'limiteDiarioReal',
    'OneTimeLock',
  ]) {
    assert.ok(TELA_TARO.includes(trava), `sumiu da tela: ${trava}`);
  }
});

test('as âncoras de texto PT continuam de pé', () => {
  const p = W.preparoDaTiragem();
  assert.equal(p.titulo, 'Quatro coisas antes de tirar');
  assert.equal(p.regras[0].titulo, 'Diga a pergunta em voz alta');
  assert.equal(p.regras[1].titulo, 'Embaralhe com a cabeça vazia');
  assert.equal(p.regras[2].titulo, 'Diga qual resposta você queria');
  assert.equal(p.regras[3].titulo, 'Leia como se fosse de outra pessoa');
  assert.ok(p.abertura.startsWith('Dá pra tocar no botão agora e ter três cartas na tela em dois segundos.'));
  // A quarta regra acusa o próprio app, e isso não pode sumir numa revisão.
  assert.match(p.regras[3].recibo, /este app faz justamente o caso que Waite chama de mais difícil/);
  // Os dois números do app aparecem declarados como do app.
  assert.match(p.regras[1].oQueVoceFaz, /os vinte são conta nossa, não dele/);
  assert.match(p.notaLeituraDoApp, /Duas medidas também são nossas/);
});
