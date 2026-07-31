// test/mitosIdiomas.test.js
// MITO × FONTE NOS TRÊS IDIOMAS — os packs es/en, o parâmetro `lang` e o
// chrome que saiu de screens/MitosScreen.js.
//
// Cinco trabalhos, na ordem de importância:
//
// (1) O OURO. O português é a fonte de verdade e NÃO PODE ter mudado um byte.
//     O golden não é escrito à mão aqui: ele mora em
//     test/golden/mitos.pt.golden.json, capturado RODANDO lib/mitos.js ANTES
//     da refatoração. Este teste prova que a chamada SEM `lang` e a chamada
//     com lang='pt' devolvem exatamente aquilo — os 25 mitos campo a campo, os
//     25 textos compartilháveis, o link, a chave de storage, a ordem do
//     catálogo e o índice do mito do dia em 366 datas. Se quebrar, o PT mudou:
//     isso é falha, não melhoria, e NÃO se conserta regenerando o golden.
//
// (2) A PARIDADE. Os packs es/en têm exatamente os mesmos 25 ids e os mesmos
//     campos, nenhum valor vazio, e o `tela` tem as chaves de CHROME_TELA com
//     os mesmos placeholders {n}/{total}. Pack capenga = tela meio traduzida
//     em silêncio, que é o pior dos mundos porque ninguém reclama.
//
// (3) A LINHA VERMELHA NOS TRÊS IDIOMAS. As palavras proibidas do PT têm
//     primos — es: aliviar/calmar/sanar/curar/tratar/energizar; en: relieve/
//     soothe/calm/heal/cure/treat/energize — e nenhum entra. Nem promessa de
//     resultado, nem veredito sobre a prática de quem acredita, nem aviso
//     defensivo, nem prova social inventada. E a palavra banida por
//     docs/tradicao/06 §2 continua banida nos três.
//
// (4) O QUE NUNCA SE TRADUZ. Locus (Tetrabiblos I.22, Astronomica II.453–465),
//     título de obra (Le Monde primitif, The Lunation Cycle, Sky & Telescope),
//     números, datas — e o link cosmicguide.cloud, que é o mesmo nos três.
//     Nome consagrado, ao contrário, TEM que traduzir: Ptolomeu vira Ptolemy /
//     Ptolomeo, e o teste cobra isso em vez de tolerar.
//
// (5) O TOM. Prende primeiro, fonte depois, em espanhol e em inglês também: os
//     primeiros 60 caracteres de todo `detalhe` não trazem ano de quatro
//     dígitos nem "siglo"/"century", e o detalhe tem 2–3 frases de card.
//     E a graça do rótulo: em inglês "they told you" é literal demais — o card
//     de um app americano diz THE MYTH e o recibo é RECEIPTS. O teste reprova
//     a tradução ao pé da letra explicitamente, porque ela é o erro que a
//     revisão humana deixa passar (está gramaticalmente certa).

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');

// --- fake do AsyncStorage, injetado ANTES do módulo sob teste ---------------
// Mesma armadilha documentada em test/mitos.test.js: lib/storage.js memoriza o
// módulo na primeira chamada.
const memStorage = new Map();
const asyncStorageMock = {
  __esModule: true,
  default: {
    async getItem(k) {
      return memStorage.has(k) ? memStorage.get(k) : null;
    },
    async setItem(k, v) {
      memStorage.set(k, String(v));
    },
    async removeItem(k) {
      memStorage.delete(k);
    },
  },
};
const carregarOriginal = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return asyncStorageMock;
  return carregarOriginal.call(this, request, parent, isMain);
};

const M = require('../lib/mitos.js');

const PACKS = {
  es: require('../lib/traducoes/mitos.es.js').default,
  en: require('../lib/traducoes/mitos.en.js').default,
};
const IDIOMAS_PACK = ['es', 'en'];

// A fotografia de ANTES. Ler do disco, nunca do motor.
const GOLDEN = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'golden', 'mitos.pt.golden.json'), 'utf8')
);

const CAMPOS_DE_TEXTO = ['oQueTeContaram', 'oQueAFonteDiz', 'fonte', 'detalhe'];

// ---------------------------------------------------------------------------
// (1) O OURO — o PT de hoje é byte a byte o PT de ontem
// ---------------------------------------------------------------------------
test('OURO: sem lang e com lang="pt", os 25 mitos são byte a byte os de antes', () => {
  assert.equal(M.LINK_COMPARTILHAR, GOLDEN.LINK_COMPARTILHAR, 'o link mudou');
  assert.equal(M.CHAVE_MITOS_VISTOS, GOLDEN.CHAVE_MITOS_VISTOS, 'a chave de storage mudou');
  assert.deepEqual(
    M.MITOS.map((m) => m.id),
    GOLDEN.ordemIds,
    'a ORDEM do catálogo mudou — o mito do dia de todo mundo mudaria junto'
  );

  for (const id of GOLDEN.ordemIds) {
    const g = GOLDEN.mitos[id];
    // Os dois caminhos da chamada antiga: sem o parâmetro e com 'pt'.
    for (const modo of [undefined, 'pt']) {
      const m = M.mitoPorId(id, modo);
      assert.ok(m, `${id} sumiu do catálogo`);
      for (const campo of CAMPOS_DE_TEXTO) {
        assert.equal(m[campo], g[campo], `${id}/${modo}: ${campo} mudou`);
      }
      assert.deepEqual(m.base, g.base, `${id}/${modo}: base mudou`);
      assert.equal(M.textoCompartilhavel(m, modo), g.compartilhar, `${id}/${modo}: compartilhar mudou`);
      assert.equal(M.textoCompartilhavel(id, modo), g.compartilhar, `${id}/${modo}: compartilhar por id mudou`);
    }
    // O caminho mais antigo de todos: textoCompartilhavel(objeto), sem lang.
    assert.equal(M.textoCompartilhavel(M.MITOS.find((x) => x.id === id)), g.compartilhar);
  }

  // Sem lang (e com 'pt'), mitoPorId devolve O MESMO objeto de MITOS — zero
  // cópia, zero chance de divergência silenciosa.
  const primeiro = M.MITOS[0];
  assert.equal(M.mitoPorId(primeiro.id), primeiro);
  assert.equal(M.mitoPorId(primeiro.id, 'pt'), primeiro);
  assert.deepEqual(M.mitosParaIdioma(), M.MITOS);
  assert.deepEqual(M.mitosParaIdioma('pt'), M.MITOS);
});

test('OURO: o mito do dia não se mexeu em nenhuma data de 2026', () => {
  const esperado = GOLDEN.indicesDoDia2026;
  const chaves = Object.keys(esperado);
  assert.ok(chaves.length >= 300, `golden com só ${chaves.length} datas — cobertura fraca demais`);
  for (const chave of chaves) {
    const [ano, mes, dia] = chave.split('-').map(Number);
    const d = new Date(ano, mes - 1, dia);
    assert.equal(M.indiceDoMitoDoDia(d), esperado[chave], `o mito do dia ${chave} mudou`);
    // E o objeto devolvido é o do índice, em PT, nos dois caminhos.
    assert.equal(M.mitoDoDia(d).id, M.MITOS[esperado[chave]].id);
    assert.equal(M.mitoDoDia(d, 'pt').id, M.MITOS[esperado[chave]].id);
  }
});

test('OURO: o chrome que saiu da tela chegou em lib/mitos.js sem mudar um caractere', () => {
  // Capturado de screens/MitosScreen.js ANTES da mudança. As duas linhas com
  // contagem eram funções lá; aqui viraram molde, e `preencher` tem que
  // devolver EXATAMENTE a mesma frase que o template literal devolvia.
  const CHROME_ANTES = {
    titulo: 'Mito × Fonte',
    subtitulo: 'O que te contaram × o que está escrito',
    mitoDoDia: 'MITO DO DIA',
    teContaram: 'TE CONTARAM',
    fonteDiz: 'A FONTE DIZ',
    recibo: 'RECIBO',
    anterior: 'Anterior',
    proximo: 'Próximo',
    compartilhar: 'Compartilhar',
    voltarAoDia: 'Voltar ao mito do dia',
    contador: '{n} de {total}',
    progresso: 'Você já conferiu {n} de {total} mitos.',
    copiado: 'Texto copiado — cola onde quiser.',
    naoCopiou: 'Não deu pra copiar aqui — seleciona o texto e copia.',
    marca: 'cosmicguide.cloud',
  };
  assert.deepEqual(M.CHROME_TELA, CHROME_ANTES);
  assert.deepEqual(M.chromeDaTela(), CHROME_ANTES);
  assert.deepEqual(M.chromeDaTela('pt'), CHROME_ANTES);
  // A saída das duas linhas com contagem, igual à das funções antigas.
  assert.equal(M.preencher(M.CHROME_TELA.contador, { n: 3, total: 25 }), '3 de 25');
  assert.equal(
    M.preencher(M.CHROME_TELA.progresso, { n: 7, total: 25 }),
    'Você já conferiu 7 de 25 mitos.'
  );
  // Chave que falta fica à vista no card, nunca vira "undefined" no meio da
  // frase — erro de moldura tem que parecer erro.
  assert.equal(M.preencher('{n} de {total}', { n: 3 }), '3 de {total}');
});

test('OURO: os rótulos do compartilhável em PT são os do golden, montados na mesma ordem', () => {
  assert.deepEqual(M.ROTULOS_COMPARTILHAR, {
    teContaram: 'Te contaram:',
    fonteDiz: 'A fonte diz:',
    recibo: 'Recibo:',
  });
  const g = GOLDEN.mitos['taro-egito'].compartilhar;
  const linhas = g.split('\n');
  assert.equal(linhas.length, 4, 'o compartilhável deixou de ter quatro linhas');
  assert.ok(linhas[0].startsWith('Te contaram: '));
  assert.ok(linhas[1].startsWith('A fonte diz: '));
  assert.ok(linhas[2].startsWith('Recibo: '));
  assert.equal(linhas[3], M.LINK_COMPARTILHAR);
});

// ---------------------------------------------------------------------------
// (2) PARIDADE — mesma forma, sem valor vazio, mesmos placeholders
// ---------------------------------------------------------------------------
function placeholders(s) {
  return [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
}

test('PARIDADE: os packs es/en têm os 25 ids do motor e os quatro campos, sem vazio', () => {
  const idsPt = M.MITOS.map((m) => m.id).sort();
  for (const lang of IDIOMAS_PACK) {
    const pack = PACKS[lang];
    assert.ok(pack && typeof pack === 'object', `pack ${lang} não carregou`);

    assert.deepEqual(
      Object.keys(pack.mitos).sort(),
      idsPt,
      `${lang}: ids do pack ≠ ids do motor — mito novo entrou sem tradução`
    );
    for (const id of idsPt) {
      const tr = pack.mitos[id];
      assert.deepEqual(
        Object.keys(tr).sort(),
        [...CAMPOS_DE_TEXTO].sort(),
        `${lang}:${id}: campos do pack ≠ forma aprovada`
      );
      for (const campo of CAMPOS_DE_TEXTO) {
        assert.ok(
          typeof tr[campo] === 'string' && tr[campo].trim().length > 0,
          `${lang}:${id}.${campo} vazio`
        );
      }
      // O recibo continua sendo recibo: ano ou século, nunca etiqueta.
      assert.ok(
        /\d{3,4}|siglo|century/i.test(tr.fonte),
        `${lang}:${id}: fonte sem ano nem século: "${tr.fonte}"`
      );
    }

    // O chrome: mesmas chaves de CHROME_TELA, mesmos placeholders, nada vazio.
    assert.deepEqual(
      Object.keys(pack.tela).sort(),
      Object.keys(M.CHROME_TELA).sort(),
      `${lang}: chaves de tela ≠ CHROME_TELA`
    );
    for (const [chave, valor] of Object.entries(pack.tela)) {
      assert.ok(typeof valor === 'string' && valor.trim().length > 0, `${lang}: tela.${chave} vazio`);
      assert.deepEqual(
        placeholders(valor),
        placeholders(M.CHROME_TELA[chave]),
        `${lang}: tela.${chave} perdeu ou inventou placeholder`
      );
    }
    // O domínio não se traduz — é endereço, igual ao link.
    assert.equal(pack.tela.marca, M.CHROME_TELA.marca, `${lang}: a marca d'água virou tradução`);

    // Os três rótulos do compartilhável.
    assert.deepEqual(
      Object.keys(pack.compartilhar).sort(),
      Object.keys(M.ROTULOS_COMPARTILHAR).sort(),
      `${lang}: rótulos do compartilhável ≠ PT`
    );
    for (const [chave, valor] of Object.entries(pack.compartilhar)) {
      assert.ok(typeof valor === 'string' && valor.trim().length > 0, `${lang}: compartilhar.${chave} vazio`);
      assert.ok(valor.trim().endsWith(':'), `${lang}: compartilhar.${chave} sem os dois pontos`);
    }
  }
});

test('com lang, SÓ o texto troca: id e base ficam canônicos, e a ordem é a mesma', () => {
  for (const lang of IDIOMAS_PACK) {
    const lista = M.mitosParaIdioma(lang);
    assert.equal(lista.length, M.MITOS.length);
    lista.forEach((m, i) => {
      const base = M.MITOS[i];
      const tr = PACKS[lang].mitos[base.id];
      // O id é a chave do storage de vistos: traduzi-lo apagaria o progresso.
      assert.equal(m.id, base.id, `${lang}: o id foi traduzido — o progresso de quem trocar de idioma some`);
      assert.deepEqual(m.base, base.base, `${lang}:${base.id}: a base (docs/tradicao) foi traduzida`);
      for (const campo of CAMPOS_DE_TEXTO) {
        assert.equal(m[campo], tr[campo], `${lang}:${base.id}: ${campo} não veio do pack`);
      }
      assert.equal(M.mitoPorId(base.id, lang)[campoQualquer()], m[campoQualquer()]);
    });
    // Idioma desconhecido nunca inventa: cai no PT, com o objeto original.
    assert.equal(M.mitoPorId(M.MITOS[0].id, 'fr'), M.MITOS[0]);
    assert.equal(M.chromeDaTela('fr'), M.CHROME_TELA);
  }
  function campoQualquer() {
    return 'oQueAFonteDiz';
  }
});

test('o compartilhável sai inteiro no idioma, é idempotente e fecha no MESMO link', () => {
  for (const id of M.MITOS.map((m) => m.id)) {
    for (const lang of IDIOMAS_PACK) {
      const pack = PACKS[lang];
      const tr = pack.mitos[id];
      const txt = M.textoCompartilhavel(id, lang);
      const esperado = [
        `${pack.compartilhar.teContaram} ${tr.oQueTeContaram}`,
        `${pack.compartilhar.fonteDiz} ${tr.oQueAFonteDiz}`,
        `${pack.compartilhar.recibo} ${tr.fonte}.`,
        M.LINK_COMPARTILHAR,
      ].join('\n');
      assert.equal(txt, esperado, `${lang}:${id}: o compartilhável não saiu no idioma`);
      assert.ok(txt.endsWith(M.LINK_COMPARTILHAR), `${lang}:${id}: não termina no link`);
      assert.ok(!txt.includes('Te contaram:'), `${lang}:${id}: o rótulo saiu em português`);
      // Passar o mito JÁ LOCALIZADO dá o mesmo resultado — o id manda.
      assert.equal(M.textoCompartilhavel(M.mitoPorId(id, lang), lang), txt, `${lang}:${id}: não é idempotente`);
    }
  }
  // O link é literal e o mesmo nos três — endereço não se traduz.
  for (const lang of ['pt', ...IDIOMAS_PACK]) {
    assert.ok(
      M.textoCompartilhavel('taro-egito', lang).endsWith('https://cosmicguide.cloud/cosmic-guide/'),
      `${lang}: o link mudou`
    );
  }
});

// ---------------------------------------------------------------------------
// (3) A LINHA VERMELHA — saúde, promessa, veredito e prova social, nos TRÊS
// ---------------------------------------------------------------------------
// As listas es/en são as mesmas de test/rituaisIdiomas.test.js (a régua é do
// app, não da feature), mais o que é próprio desta tela: veredito sobre a
// prática de quem acredita e prova social inventada. Um catálogo que desmente
// mito não pode desmentir a pessoa.
const PROIBIDO = {
  pt: [
    /\balivi\w*/iu, /\bacalm\w*/iu, /\bcur(?:a|ar|am|ou|ando|ada?s?|ado?s?)\b/iu,
    /\btrat(?:a|ar|am|ou|ando|amentos?)\b/iu, /\benergiz\w*/iu, /\brelax\w*/iu,
    /\bequilibr\w*/iu, /\bharmoniz\w*/iu, /\bgarant\w*/iu, /\bdestrav\w*/iu,
    /\bproteg\w*/iu, /\bafast\w*/iu, /\benergia\b/iu, /\bvibra\w*/iu, /\bcigan\w*/iu,
    // veredito e deboche — o tom da tese não zomba de quem acreditou
    /\bfals[oa]\b/iu, /\bmentira\b/iu, /\bburr\w*/iu, /\bingênu\w*/iu, /\benganad\w*/iu,
    /\bcharlat\w*/iu, /\bpicaret\w*/iu, /\bgolpe\b/iu,
  ],
  es: [
    // saúde
    /\balivi/i, /\bcalm/i, /\bsana(r|s|n)?\b/i, /\bcur(a|ar|ación|ativ)/i,
    /\btrat(a|ar|e|en|amiento)\b/i, /\benergiz/i, /\brelaj/i, /\btranquiliz/i,
    /\bansiedad/i, /\bestr[eé]s\b/i, /\binsomnio\b/i, /\bsalud\b/i, /\bbienestar\b/i,
    /\bterap[eé]utic/i, /\bequilibr/i, /\barmoniz/i, /\bdesintoxic/i, /\bcortisol\b/i,
    /\bsistema nervioso\b/i,
    // promessa
    /\batra(e|er|iga|cci[óo]n)/i, /\bgarant/i, /\bpromet/i, /\bmanifest/i,
    /\babre camino/i, /\bdesbloque/i, /\bdestrab/i, /\bahuyent/i, /\bespant/i,
    /\bproteg/i, /\bblinda/i, /\bneutraliz/i, /\bpoderos/i, /\binfalible/i,
    /\b(da|trae) suerte\b/i, /\bcontrol(a|ar|e)\b/i,
    // mecanismo
    /\benerg[íi]a\b/i, /\benerg[ée]tic/i, /\bvibraci/i, /\baura\b/i, /\bchakra/i,
    /\bmagnetismo\b/i, /\bmal de ojo\b/i, /\bpurific/i,
    // veredito, deboche e prova social inventada
    /\bfals[oa]\b/i, /\bmentira\b/i, /\bengañad/i, /\bingenu/i, /\btont[oa]\b/i,
    /\bcharlat/i, /\bestaf/i, /\bmiles de personas\b/i, /\bmillones de (personas|usuarios)\b/i,
    /\bcigan/i, /\bgitan/i,
    // aviso defensivo
    /no garantiza/i, /sin (ninguna )?promesa/i, /no promete/i, /sin garant[íi]a/i,
    /aviso legal/i,
  ],
  en: [
    // saúde (heal pega health/healing; treat pega treatment)
    /\bheal/i, /\bcur(e|ing|ative)/i, /\btreat/i, /\brelie(f|ve|ving)/i, /\bsooth/i,
    /\bcalm/i, /\benergi[sz]e/i, /\brelax/i, /\banxiety\b/i, /\bstress\b/i,
    /\binsomnia\b/i, /\bwell-?being\b/i, /\btherapeutic/i, /\bdepress/i, /\bdetox/i,
    /\bcortisol\b/i, /\bnervous system\b/i, /\bimmun/i, /\binvigorat/i, /\bharmoniz/i,
    /\bbalanc/i,
    // promessa
    /\battract/i, /\bguarantee/i, /\bmanifest/i, /\bunblock/i, /\bunlock/i,
    /\bward(s|ing)? off/i, /\bbanish/i, /\brepel/i, /\bprotect/i,
    /\bopens? (the )?(path|road|way)/i, /\bpowerful\b/i, /\binfallible\b/i,
    /\bbrings? luck\b/i, /\bgood luck\b/i, /\bmakes? it happen\b/i, /\bdominate/i,
    // mecanismo
    /\benergy\b/i, /\benergetic/i, /\bvibration/i, /\bvibe\b/i, /\baura\b/i,
    /\bchakra/i, /\bmagnetism\b/i, /\bevil eye\b/i, /\bpurif/i, /\bcleans(e|ing)\b/i,
    // veredito, deboche e prova social inventada
    /\bfake\b/i, /\bbogus\b/i, /\bnonsense\b/i, /\bgullible\b/i, /\bstupid\b/i,
    /\bdumb\b/i, /\bsucker/i, /\bscam/i, /\bcharlatan/i, /\bhoax\b/i, /\bdebunk/i,
    /\bthousands of (people|readers|users)\b/i, /\bmillions of (people|readers|users)\b/i,
    /\bgypsy\b/i, /\bgypsies\b/i,
    // aviso defensivo
    /not? guarantee/i, /no promise/i, /does not promise/i, /disclaimer/i, /legal notice/i,
  ],
};

// Tudo que a pessoa pode ler num idioma: os quatro campos dos 25 mitos, os
// rótulos do compartilhável, o chrome da tela e o compartilhável montado.
function textosVisiveis(lang) {
  const saida = [];
  const pack = lang === 'pt' ? null : PACKS[lang];
  const chrome = pack ? pack.tela : M.CHROME_TELA;
  const rotulos = pack ? pack.compartilhar : M.ROTULOS_COMPARTILHAR;
  for (const [chave, valor] of Object.entries(chrome)) saida.push([`${lang}.tela.${chave}`, valor]);
  for (const [chave, valor] of Object.entries(rotulos)) saida.push([`${lang}.rotulo.${chave}`, valor]);
  for (const m of M.mitosParaIdioma(lang)) {
    for (const campo of CAMPOS_DE_TEXTO) saida.push([`${lang}.${m.id}.${campo}`, m[campo]]);
    saida.push([`${lang}.${m.id}.compartilhar`, M.textoCompartilhavel(m, lang)]);
  }
  return saida;
}

test('LINHA VERMELHA: nenhuma palavra proibida em NENHUM dos três idiomas', () => {
  const violacoes = [];
  for (const lang of ['pt', ...IDIOMAS_PACK]) {
    for (const [onde, texto] of textosVisiveis(lang)) {
      for (const re of PROIBIDO[lang]) {
        const achou = String(texto).match(re);
        if (achou) violacoes.push(`${onde}: "${achou[0]}" (${re})`);
      }
    }
  }
  assert.deepEqual(
    violacoes,
    [],
    'Palavra proibida (saúde, promessa, mecanismo, veredito ou prova social) em ' +
      'texto visível. Reescreva por SENTIDO, sem o vocabulário — a régua vale nos ' +
      'três idiomas:\n  ' + violacoes.join('\n  ')
  );
});

// ---------------------------------------------------------------------------
// (4) O QUE NUNCA SE TRADUZ — números, datas, locus, obras e o link
// ---------------------------------------------------------------------------
// Separador de milhar muda de idioma (2.450 → 2,450), então a comparação
// normaliza o separador antes de extrair. Locus com numeral romano
// (II.453–465, IV.7) e número simples têm que reaparecer LITERAIS.
function normalizarMilhar(texto) {
  return String(texto).replace(/(\d)[.,](\d{3})\b/g, '$1$2');
}

function tokensQueNaoTraduzem(texto) {
  const t = new Set();
  const limpo = normalizarMilhar(texto);
  for (const m of limpo.matchAll(/\b[IVXLCDM]+\.\d+(?:[.:–\-]\d+)*\b/g)) t.add(m[0]);
  for (const m of limpo.matchAll(/\b\d+(?:[.:]\d+)*\b/g)) t.add(m[0]);
  return [...t];
}

test('números, datas e locus do PT aparecem literais em cada campo traduzido', () => {
  const faltando = [];
  for (const lang of IDIOMAS_PACK) {
    for (const base of M.MITOS) {
      const tr = PACKS[lang].mitos[base.id];
      for (const campo of CAMPOS_DE_TEXTO) {
        const trVal = normalizarMilhar(tr[campo]);
        for (const token of tokensQueNaoTraduzem(base[campo])) {
          if (!trVal.includes(token)) faltando.push(`${lang}:${base.id}.${campo} perdeu "${token}"`);
        }
      }
    }
  }
  assert.deepEqual(faltando, [], `Número/data/locus sumiu na tradução:\n  ${faltando.join('\n  ')}`);
});

test('título de obra e locus ficam intactos nos dois packs', () => {
  // Obras que aparecem no PT e não podem virar tradução em lugar nenhum.
  const OBRAS = [
    ['taro-egito', 'Le Monde primitif'],
    ['oito-fases', 'The Lunation Cycle'],
    ['oito-fases', 'The Astrology of Personality'],
    ['quiromancia-milenar', 'La Chirognomonie'],
    ['lua-azul', 'Sky & Telescope'],
    ['lua-de-sangue', 'Four Blood Moons'],
    ['leao-coracao', 'Astronomica II.453–465'],
    ['ofiuco', 'Tetrabiblos I.22'],
    ['urano-aquario', 'Tetrabiblos I.17'],
    ['porcentagem-compatibilidade', 'Tetrabiblos IV.7'],
    ['signo-personalidade', 'Tetrabiblos III.13'],
    ['signo-personalidade', 'Sun Signs'],
    ['marselha-o-mais-antigo', 'Tarot de Marse'],
    ['estrela-esperanca', 'The Pictorial Key to the Tarot'],
    ['lua-nova-intencoes', 'De Agri Cultura 40.1'],
    ['lua-nova-intencoes', 'New Moon Astrology'],
    ['lua-nova-intencoes', 'luna silente'],
    ['karma-astrologia', 'Karmic Astrology'],
    ['horoscopo-de-jornal', 'Sunday Express'],
    ['horoscopo-de-jornal', '24/08/1930'],
    ['borra-de-cafe', 'Tea-Cup Reading'],
    ['quiromancia-milenar', 'The Laws of Scientific Hand Reading'],
  ];
  const faltando = [];
  for (const lang of IDIOMAS_PACK) {
    for (const [id, obra] of OBRAS) {
      const tudo = CAMPOS_DE_TEXTO.map((c) => PACKS[lang].mitos[id][c]).join(' | ');
      if (!tudo.includes(obra)) faltando.push(`${lang}:${id} perdeu "${obra}"`);
    }
  }
  assert.deepEqual(faltando, [], `Obra ou locus traduzido/sumido:\n  ${faltando.join('\n  ')}`);
});

test('nome consagrado TRADUZ — Ptolomeu vira Ptolemy e Ptolomeo, não fica em português', () => {
  // O outro lado da regra: o que não se traduz fica; o que se traduz TEM que
  // mudar. Nome consagrado em português dentro do pack em inglês é tradução
  // pela metade — e passa despercebido porque "Ptolomeu" parece nome próprio.
  const NOMES = [
    // [id, forma PT que NÃO pode sobrar, forma esperada em es, em en]
    ['ofiuco', 'Ptolomeu', 'Ptolomeo', 'Ptolemy'],
    ['leao-coracao', 'Manílio', 'Manilio', 'Manilius'],
    ['lua-nova-intencoes', 'Catão', 'Catón', 'Cato'],
    ['saturno-mestre', 'Vétio Valente', 'Vetio Valente', 'Vettius Valens'],
    ['karma-astrologia', 'Teosofia', 'Teosofía', 'Theosophy'],
    ['porcentagem-compatibilidade', 'Doroteu', 'Doroteo', 'Dorotheus'],
  ];
  const erros = [];
  for (const [id, formaPt, esperadoEs, esperadoEn] of NOMES) {
    const esperado = { es: esperadoEs, en: esperadoEn };
    for (const lang of IDIOMAS_PACK) {
      const doMito = CAMPOS_DE_TEXTO.map((c) => PACKS[lang].mitos[id][c]).join(' | ');
      if (!doMito.includes(esperado[lang])) erros.push(`${lang}:${id} não traz "${esperado[lang]}"`);
      // A forma portuguesa não pode sobrar em NENHUM mito do pack, não só neste:
      // o vazamento acontece justamente no card em que ninguém foi conferir.
      for (const [outroId, tr] of Object.entries(PACKS[lang].mitos)) {
        const tudo = CAMPOS_DE_TEXTO.map((c) => tr[c]).join(' | ');
        if (tudo.includes(formaPt)) {
          erros.push(`${lang}:${outroId} ficou com a forma portuguesa "${formaPt}"`);
        }
      }
    }
  }
  assert.deepEqual(erros, [], `Nome consagrado sem tradução:\n  ${erros.join('\n  ')}`);
});

test('o século sai no idioma: "séc." não sobrevive em es nem en', () => {
  for (const lang of IDIOMAS_PACK) {
    for (const base of M.MITOS) {
      const tr = PACKS[lang].mitos[base.id];
      for (const campo of CAMPOS_DE_TEXTO) {
        assert.ok(!/séc\./.test(tr[campo]), `${lang}:${base.id}.${campo} ficou com "séc."`);
        assert.ok(!/\banos\b/.test(tr[campo]), `${lang}:${base.id}.${campo} ficou com "anos"`);
      }
    }
    // E o idioma tem a sua própria palavra de século em algum lugar do pack.
    const tudo = Object.values(PACKS[lang].mitos)
      .map((tr) => CAMPOS_DE_TEXTO.map((c) => tr[c]).join(' '))
      .join(' ');
    assert.match(tudo, lang === 'es' ? /siglo/i : /century/i, `${lang}: nenhum século no idioma`);
  }
});

// ---------------------------------------------------------------------------
// (5) O TOM — prende primeiro, fonte depois, e o rótulo com graça
// ---------------------------------------------------------------------------
// Contagem de frases tolerante às abreviações de cada idioma: iniciais de autor
// (L. Dow Balliett, R. H. Naylor, A. E. Waite), "c." de circa, "vol.", e as
// eras. Sem isso "410 a.C." e "vol. 8" virariam frases novas.
function contarFrases(texto, lang) {
  let limpo = String(texto)
    .replace(/\ba\.C\./g, 'aC')
    .replace(/\bd\.C\./g, 'dC')
    .replace(/\bvol\./gi, 'vol')
    .replace(/\bc\.\s/g, 'c ')
    .replace(/\b[A-Z]\.\s?/g, 'X');
  if (lang === 'es') limpo = limpo.replace(/\bsiglo\b/g, 'siglo');
  return limpo.split(/[.!?…]+(?:\s+|$)/).filter((f) => f.trim().length > 0).length;
}

test('TOM: o detalhe traduzido abre na vida real — sem ano nem século nos 60 primeiros', () => {
  const erros = [];
  for (const lang of IDIOMAS_PACK) {
    const palavraSeculo = lang === 'es' ? /siglo/i : /century/i;
    for (const base of M.MITOS) {
      const abertura = PACKS[lang].mitos[base.id].detalhe.slice(0, 60);
      if (/\b1[0-9]{3}\b|\b20[0-2][0-9]\b/.test(abertura)) {
        erros.push(`${lang}:${base.id} abre com ano: "${abertura}…"`);
      }
      if (palavraSeculo.test(abertura)) {
        erros.push(`${lang}:${base.id} abre com século: "${abertura}…"`);
      }
    }
  }
  assert.deepEqual(erros, [], `Detalhe abrindo no recibo em vez da vida real:\n  ${erros.join('\n  ')}`);
});

test('TOM: o detalhe traduzido tem 2–3 frases e tamanho de card', () => {
  for (const lang of IDIOMAS_PACK) {
    for (const base of M.MITOS) {
      const d = PACKS[lang].mitos[base.id].detalhe;
      const n = contarFrases(d, lang);
      assert.ok(n >= 2 && n <= 3, `${lang}:${base.id}: detalhe com ${n} frase(s) — o card pede 2 a 3`);
      assert.ok(d.length <= 500, `${lang}:${base.id}: detalhe com ${d.length} chars — longo demais pra card`);
    }
  }
});

test('TOM: o rótulo em inglês NÃO é a tradução literal de "te contaram"', () => {
  // Este teste existe por causa de um erro específico e muito fácil de cometer:
  // "they told you" está gramaticalmente perfeito, passa em qualquer revisão, e
  // soa como legenda de tradução automática. O card de um app americano diz
  // THE MYTH, e a caixa de citação embaixo diz RECEIPTS — que é a palavra que
  // a internet em inglês já usa para "prova".
  const LITERAL_DEMAIS = [/they told you/i, /you were told/i, /what they told/i];
  const alvos = [
    ['tela.teContaram', PACKS.en.tela.teContaram],
    ['tela.fonteDiz', PACKS.en.tela.fonteDiz],
    ['tela.recibo', PACKS.en.tela.recibo],
    ['compartilhar.teContaram', PACKS.en.compartilhar.teContaram],
    ['compartilhar.fonteDiz', PACKS.en.compartilhar.fonteDiz],
    ['compartilhar.recibo', PACKS.en.compartilhar.recibo],
  ];
  for (const [onde, valor] of alvos) {
    for (const re of LITERAL_DEMAIS) {
      assert.ok(!re.test(valor), `en:${onde} caiu no literal (${re}): "${valor}"`);
    }
  }
  assert.match(PACKS.en.tela.teContaram, /myth/i, 'o rótulo em inglês perdeu a palavra que nomeia o card');
  assert.match(PACKS.en.tela.recibo, /receipt/i, 'o recibo em inglês perdeu "receipts"');
  assert.match(PACKS.en.compartilhar.recibo, /receipt/i, 'o rótulo do compartilhável perdeu "receipts"');
  // E o espanhol mantém a voz de conversa do PT — "te contaron" é o primo certo.
  assert.match(PACKS.es.tela.teContaram, /contaron/i);
  assert.match(PACKS.es.compartilhar.teContaram, /^Te contaron:/);
});

// ---------------------------------------------------------------------------
// (6) A TELA — varredura do fonte de screens/MitosScreen.js
// ---------------------------------------------------------------------------
// Mesma varredura que test/quizCosmico.test.js faz em QuizCosmicoScreen.js.
// Existe por causa de uma armadilha nova desta parcela: `contador` e
// `progresso` eram FUNÇÕES na tela e viraram MOLDE ('{n} de {total}'). Escrever
// {UI.contador} direto no JSX imprime a chave crua — "{n} de {total}" — na cara
// da pessoa, e nenhum teste de pack pega isso, porque o pack está certo.
const FONTE_MITOS_TELA = fs.readFileSync(
  path.join(__dirname, '..', 'screens', 'MitosScreen.js'),
  'utf8'
);

test('todo uso de UI.contador/UI.progresso na tela passa por preencher()', () => {
  const usos = FONTE_MITOS_TELA.match(/UI\.(contador|progresso)\b/g) || [];
  const preenchidos = FONTE_MITOS_TELA.match(/preencher\(\s*UI\.(contador|progresso)\b/g) || [];
  assert.ok(usos.length > 0, 'a tela deixou de usar o contador — o molde ficou órfão');
  assert.equal(
    usos.length,
    preenchidos.length,
    `screens/MitosScreen.js usa UI.contador/UI.progresso ${usos.length} vez(es) e só ` +
      `${preenchidos.length} passa(m) por preencher(). Molde renderizado direto imprime ` +
      '"{n} de {total}" na tela — chave crua é bug visível.'
  );
  assert.ok(
    /useLanguage/.test(FONTE_MITOS_TELA) && /chromeDaTela\(\s*lang\s*\)/.test(FONTE_MITOS_TELA),
    'o chrome da tela sai de chromeDaTela(lang) com o idioma do useLanguage()'
  );
});

test('TOM: nenhum idioma abre o mito com aspas de tradutor nem perde o × do título', () => {
  // O × do título é assinatura visual da tela (Mito × Fonte) — some fácil numa
  // tradução distraída, e a tela fica sem nome.
  for (const lang of IDIOMAS_PACK) {
    assert.ok(PACKS[lang].tela.titulo.includes('×'), `${lang}: o título perdeu o ×`);
    assert.ok(PACKS[lang].tela.subtitulo.includes('×'), `${lang}: o subtítulo perdeu o ×`);
  }
});
