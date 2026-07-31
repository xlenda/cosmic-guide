// test/quizIdiomas.test.js
// OS TRÊS IDIOMAS DO QUIZ "VOCÊ SABIA?" — e a prova de que o PT não mudou um
// byte.
//
// Este arquivo guarda as quatro leis da internacionalização do motor, mais uma
// quinta que é só deste quiz:
//
//   1. O PT É OURO. test/golden/quizCosmico.pt.golden.json foi capturado ANTES
//      da extração dos packs — as 40 perguntas inteiras (enunciado, as 4
//      opções, explicação, fonte, base, certaIdx), as 4 faixas de placar, as 8
//      frases possíveis de 0 a 7 acertos, quatro rodadas de dias fixos e o
//      chrome que morava em screens/QuizCosmicoScreen.js. Tudo comparado byte a
//      byte. Refatoração que altera o texto PT é falha, não melhoria.
//   2. lang='pt' E lang ausente são a MESMA leitura — e mais forte: devolvem a
//      PRÓPRIA referência de PERGUNTAS, não uma cópia. Idioma desconhecido cai
//      em PT em vez de quebrar.
//   3. PARIDADE: es e en têm exatamente a mesma FORMA do pt (mesmas chaves,
//      mesmos tipos — as funções de chrome são os "placeholders" daqui),
//      nenhum valor vazio, as 40 perguntas inteiras nos três.
//   4. LINHA VERMELHA nos três idiomas: PT aliviar/acalmar/curar/tratar/
//      energizar; ES aliviar/calmar/sanar/curar/tratar/energizar; EN relieve/
//      soothe/calm/heal/cure/treat/energize. Nada de promessa, veredito sobre a
//      pessoa, mecanismo pseudocientífico, prova social inventada nem a palavra
//      banida por docs/tradicao/06 §2 — em nenhuma língua, nem na opção ERRADA
//      (opção errada com promessa continua sendo promessa na tela).
//   5. A ESTRUTURA NÃO É TEXTO. A ordem das 4 opções e o `certaIdx` são os
//      mesmos nos três idiomas: se a tradução reordenasse as alternativas, a
//      resposta certa passaria a apontar pra outra — o bug mais caro possível
//      aqui. E a rodada do dia NÃO depende do idioma: 2026-07-31 sorteia as
//      mesmas 7 perguntas em português, espanhol e inglês, senão duas pessoas
//      param de poder comparar o dia (a razão de produto do determinismo, no
//      cabeçalho de lib/quizCosmico.js).
//
// O QUE NUNCA SE TRADUZ, e é cobrado abaixo: locus (Tetrabiblos I.8,
// XVIII.321-322, De Agri Cultura 40.1), nome de obra em latim/inglês/francês,
// citação verbatim de Waite, números e datas. Nome consagrado TRADUZ
// (Ptolomeu/Ptolomeo/Ptolemy, Plínio, o Velho/Plinio el Viejo/Pliny the Elder).

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const Q = require('../lib/quizCosmico.js');
const {
  PERGUNTAS,
  TAMANHO_RODADA,
  TEMA_ROTULOS,
  CHROME_TELA,
  FAIXAS_PLACAR,
  packDeTextos,
  perguntasParaIdioma,
  perguntaPorId,
  temaRotulos,
  chromeDaTela,
  rodadaDoDia,
  fraseDoPlacar,
  frasesDePlacar,
  textosVisiveis,
} = Q;

const RAIZ = path.join(__dirname, '..');
const LANGS = ['pt', 'es', 'en'];
const PACKS = { pt: packDeTextos('pt'), es: packDeTextos('es'), en: packDeTextos('en') };
const IDS = PERGUNTAS.map((p) => p.id);
const GOLDEN = JSON.parse(fs.readFileSync(path.join(RAIZ, 'test', 'golden', 'quizCosmico.pt.golden.json'), 'utf8'));

// Todo texto de uma pergunta, num idioma, como uma string só.
function corpo(p) {
  return [p.pergunta, ...p.opcoes, p.explicacao, p.fonte].join(' \n ');
}

function porId(lang) {
  const mapa = {};
  for (const p of perguntasParaIdioma(lang)) mapa[p.id] = p;
  return mapa;
}
const P = { pt: porId('pt'), es: porId('es'), en: porId('en') };

// ===========================================================================
// 1. O PT É OURO — byte a byte contra a captura pré-refatoração
// ===========================================================================

test('GOLDEN: as 40 perguntas PT conferem inteiras, campo a campo', () => {
  assert.equal(PERGUNTAS.length, GOLDEN.PERGUNTAS.length, 'o banco mudou de tamanho');
  for (let i = 0; i < GOLDEN.PERGUNTAS.length; i += 1) {
    const esperado = GOLDEN.PERGUNTAS[i];
    const atual = PERGUNTAS[i];
    assert.deepEqual(
      JSON.parse(JSON.stringify(atual)),
      esperado,
      `O TEXTO PT DA PERGUNTA ${esperado.id} MUDOU. É exatamente o que esta tarefa proíbe: ` +
        'o caminho PT tem que reproduzir a saída antiga byte a byte. Compare com ' +
        'test/golden/quizCosmico.pt.golden.json antes de qualquer outra coisa.'
    );
  }
});

test('GOLDEN: constantes, faixas de placar e as 8 frases possíveis conferem', () => {
  assert.equal(TAMANHO_RODADA, GOLDEN.TAMANHO_RODADA);
  assert.equal(Q.CHAVE_QUIZ_COSMICO, GOLDEN.CHAVE_QUIZ_COSMICO, 'trocar a chave de storage apagaria o progresso de todo mundo');
  assert.deepEqual(TEMA_ROTULOS, GOLDEN.TEMA_ROTULOS);
  assert.deepEqual(JSON.parse(JSON.stringify(FAIXAS_PLACAR)), GOLDEN.FAIXAS_PLACAR, 'as faixas de placar PT mudaram');
  for (let acertos = 0; acertos <= TAMANHO_RODADA; acertos += 1) {
    assert.equal(fraseDoPlacar(acertos, TAMANHO_RODADA), GOLDEN.frasesDoPlacar[acertos], `placar ${acertos}/7`);
    assert.equal(fraseDoPlacar(acertos, TAMANHO_RODADA, 'pt'), GOLDEN.frasesDoPlacar[acertos], `placar ${acertos}/7 com lang='pt'`);
  }
});

test('GOLDEN: as rodadas dos dias capturados são as mesmas de antes', () => {
  for (const [dia, ids] of Object.entries(GOLDEN.rodadas)) {
    assert.deepEqual(rodadaDoDia(dia).map((p) => p.id), ids, `a rodada de ${dia} mudou`);
    assert.deepEqual(rodadaDoDia(dia, 'pt').map((p) => p.id), ids, `a rodada de ${dia} mudou com lang='pt'`);
  }
});

test('o chrome que veio da tela pro motor não perdeu um caractere', () => {
  // NÃO usa o golden de propósito. O bloco `chromeTela` de
  // test/golden/quizCosmico.pt.golden.json foi escrito DEPOIS de o chrome sair
  // da tela, a partir do próprio CHROME_TELA — comparar um com o outro é uma
  // guarda circular. As strings abaixo estão copiadas à mão do `TXT` que morava
  // em screens/QuizCosmicoScreen.js antes da mudança de casa, exatamente como
  // CHROME_ANTES em test/mitosIdiomas.test.js faz com o chrome do Mitos.
  const CHROME_ANTES = {
    titulo: 'Você sabia?',
    subtitulo: 'Sete perguntas por dia — o mito cai, a fonte fica',
    certo: 'Na fonte certa!',
    errado: 'Não foi dessa vez — a certa está marcada.',
    fontePrefixo: 'Fonte: ',
    proxima: 'Próxima pergunta',
    verPlacar: 'Ver placar',
    placarTitulo: 'Rodada de hoje',
    amanha: 'Amanhã tem sete novas. A rodada muda com o dia — e é a mesma pra todo mundo, então dá pra comparar.',
    rodadaFeitaAviso: 'Você já fez a rodada de hoje.',
  };
  for (const [chave, esperado] of Object.entries(CHROME_ANTES)) {
    assert.equal(CHROME_TELA[chave], esperado, `chrome.${chave} mudou na mudança de casa`);
    assert.equal(chromeDaTela('pt')[chave], esperado, `chromeDaTela('pt').${chave} divergiu`);
  }
  // As cinco que eram FUNÇÕES na tela: a saída tem que ser a mesma que o
  // template literal de lá devolvia, com os mesmos argumentos.
  assert.equal(CHROME_TELA.contador(3, 7), 'Pergunta 3 de 7');
  assert.equal(CHROME_TELA.placarDe(5, 7), '5 de 7');
  assert.equal(
    CHROME_TELA.acumulado(1, 1),
    'No total, você já respondeu 1 pergunta — 1 na fonte certa.',
    'o singular de "pergunta" se perdeu'
  );
  assert.equal(
    CHROME_TELA.acumulado(42, 30),
    'No total, você já respondeu 42 perguntas — 30 na fonte certa.'
  );
  assert.equal(CHROME_TELA.a11yOpcao(2), 'Alternativa 2');
});

test("lang ausente, lang='pt' e idioma desconhecido devolvem a MESMA referência de PERGUNTAS", () => {
  // Identidade, não cópia: a garantia mais forte de que o caminho PT não passou
  // pelo refactor. Qualquer .map() esquecido aqui quebraria este teste.
  assert.equal(perguntasParaIdioma(), PERGUNTAS);
  assert.equal(perguntasParaIdioma('pt'), PERGUNTAS);
  assert.equal(perguntasParaIdioma('fr'), PERGUNTAS, 'idioma desconhecido tem que cair no PT, nunca quebrar');
  assert.equal(perguntasParaIdioma(undefined), PERGUNTAS);
  assert.equal(perguntasParaIdioma(null), PERGUNTAS);
  assert.equal(temaRotulos('fr'), TEMA_ROTULOS);
  assert.equal(chromeDaTela('fr'), CHROME_TELA);
  assert.equal(fraseDoPlacar(4, 7, 'fr'), fraseDoPlacar(4, 7));
  assert.deepEqual(rodadaDoDia('2026-07-31', 'fr').map((p) => p.id), rodadaDoDia('2026-07-31').map((p) => p.id));
  assert.equal(perguntaPorId('taro-estrela'), perguntaPorId('taro-estrela', 'pt'));
  assert.equal(perguntaPorId('nao-existe', 'en'), null, 'perguntaPorId nunca pode chutar uma pergunta, em nenhum idioma');
});

// ===========================================================================
// 2. PARIDADE DOS PACKS — mesma forma, nada vazio, nada faltando
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
  if (v && typeof v === 'object') {
    for (const k of Object.keys(v)) varrerStrings(v[k], `${caminho}.${k}`, cb);
  }
}

test('es e en têm EXATAMENTE a mesma forma do pt — mesmas chaves, mesmos tipos', () => {
  const formaPt = forma(PACKS.pt);
  assert.deepEqual(forma(PACKS.es), formaPt, 'o pack es divergiu da forma do pt (chave a mais, a menos ou de outro tipo)');
  assert.deepEqual(forma(PACKS.en), formaPt, 'o pack en divergiu da forma do pt (chave a mais, a menos ou de outro tipo)');
});

test('nenhum valor de nenhum pack é vazio, e as 40 perguntas existem nos três', () => {
  for (const lang of LANGS) {
    varrerStrings(PACKS[lang], lang, (caminho, s) => {
      assert.ok(s.trim().length > 0, `${caminho} está vazio`);
    });
    assert.deepEqual(Object.keys(PACKS[lang].perguntas).sort(), [...IDS].sort(), `${lang}: o conjunto de ids divergiu`);
    assert.equal(PACKS[lang].placar.length, FAIXAS_PLACAR.length, `${lang}: número de frases de placar`);
    assert.deepEqual(Object.keys(PACKS[lang].temas).sort(), Object.keys(TEMA_ROTULOS).sort(), `${lang}: temas`);
  }
});

test('nenhum texto, em nenhum idioma, vaza placeholder, undefined ou objeto', () => {
  for (const lang of LANGS) {
    for (const [caminho, texto] of textosVisiveis(lang)) {
      assert.ok(!texto.includes('undefined'), `${lang} ${caminho} vazou "undefined"`);
      assert.ok(!texto.includes('[object Object]'), `${lang} ${caminho} vazou objeto`);
      assert.ok(!/\$\{|\{\w+\}/.test(texto), `${lang} ${caminho} vazou placeholder sem interpolar`);
    }
  }
});

// ===========================================================================
// 3. A ESTRUTURA NÃO É TEXTO — ordem das opções, certaIdx e rodada do dia
// ===========================================================================

test('id, tema, base e certaIdx são IDÊNTICOS nos três idiomas', () => {
  for (const lang of ['es', 'en']) {
    const lista = perguntasParaIdioma(lang);
    assert.equal(lista.length, PERGUNTAS.length, `${lang}: o banco mudou de tamanho`);
    lista.forEach((p, i) => {
      const pt = PERGUNTAS[i];
      assert.equal(p.id, pt.id, `${lang}: a ordem do banco mudou na posição ${i}`);
      assert.equal(p.tema, pt.tema, `${lang}/${p.id}: tema`);
      assert.equal(p.base, pt.base, `${lang}/${p.id}: base (o endereço na pesquisa não se traduz)`);
      assert.equal(
        p.certaIdx,
        pt.certaIdx,
        `${lang}/${p.id}: certaIdx mudou — a resposta certa passaria a apontar pra outra alternativa`
      );
    });
  }
});

test('toda pergunta tem 4 opções distintas em todo idioma, e a certa está no mesmo índice', () => {
  for (const lang of LANGS) {
    for (const p of perguntasParaIdioma(lang)) {
      assert.equal(p.opcoes.length, 4, `${lang}/${p.id}: precisa de exatamente 4 opções`);
      assert.equal(
        new Set(p.opcoes.map((o) => o.trim())).size,
        4,
        `${lang}/${p.id}: duas opções ficaram iguais na tradução — uma some na outra`
      );
      p.opcoes.forEach((o, i) => assert.ok(typeof o === 'string' && o.trim().length >= 3, `${lang}/${p.id}: opção ${i} vazia`));
      // A opção certa daqui é a tradução da opção certa do PT — mesma posição,
      // texto diferente (fora os invariantes legítimos, cobertos mais abaixo).
      assert.ok(p.opcoes[p.certaIdx].trim().length >= 3, `${lang}/${p.id}: a opção certa ficou vazia`);
    }
  }
});

test('a rodada do dia NÃO muda com o idioma — mesmo dia, mesmas 7, mesma ordem', () => {
  const dias = ['2026-07-31', '2026-01-01', '2026-08-15', '2027-12-31'];
  for (let d = 1; d <= 12; d += 1) dias.push(`2026-09-${String(d).padStart(2, '0')}`);
  for (const dia of dias) {
    const pt = rodadaDoDia(dia).map((p) => p.id);
    assert.equal(pt.length, TAMANHO_RODADA, `${dia}: rodada com ${pt.length} perguntas`);
    for (const lang of ['es', 'en']) {
      const outra = rodadaDoDia(dia, lang);
      assert.deepEqual(
        outra.map((p) => p.id),
        pt,
        `${lang}: a rodada de ${dia} mudou de idioma — duas pessoas em línguas diferentes param de poder comparar o dia`
      );
      // E cada pergunta sorteada sai INTEIRA no idioma pedido.
      for (const p of outra) {
        assert.equal(typeof p.pergunta, 'string');
        assert.equal(p.opcoes.length, 4);
        assert.ok(p.explicacao.length > 0 && p.fonte.length > 0, `${lang}/${p.id} saiu pela metade na rodada`);
      }
    }
  }
});

test('perguntaPorId devolve a pergunta traduzida, com a mesma identidade estrutural', () => {
  for (const lang of ['es', 'en']) {
    for (const id of IDS) {
      const p = perguntaPorId(id, lang);
      assert.equal(p.id, id);
      assert.equal(p.certaIdx, P.pt[id].certaIdx);
      assert.notEqual(p.pergunta, P.pt[id].pergunta, `${lang}/${id}: o enunciado não foi traduzido`);
    }
  }
});

// ===========================================================================
// 4. O QUE NUNCA SE TRADUZ — números, locus, obra, verbatim
// ===========================================================================

// Normaliza separador decimal/milhar: PT/ES escrevem 85,9% e 4.000; EN escreve
// 85.9% e 4,000. O VALOR é o mesmo e é isso que o teste compara.
function numeros(s) {
  const t = String(s).replace(/(\d)[.,](\d)/g, '$1·$2').replace(/(\d)[.,](\d)/g, '$1·$2');
  return (t.match(/\d+(?:·\d+)*/g) || []).sort();
}

test('os números são os mesmos nos três idiomas — nenhum se perde na tradução', () => {
  for (const id of IDS) {
    const pt = numeros(corpo(P.pt[id]));
    for (const lang of ['es', 'en']) {
      const outros = [...numeros(corpo(P[lang][id]))];
      const faltando = [];
      for (const n of pt) {
        const k = outros.indexOf(n);
        if (k >= 0) outros.splice(k, 1);
        else faltando.push(n);
      }
      assert.deepEqual(faltando, [], `${lang}/${id}: sumiram números do PT: ${faltando.join(', ')}`);
      if (lang === 'es') {
        // O espanhol usa a mesma convenção do português: a igualdade é exata.
        assert.deepEqual(outros, [], `es/${id}: apareceram números que o PT não tem: ${outros.join(', ')}`);
      } else {
        // O inglês pode ganhar ordinais de século ("2nd c.", "15th-century")
        // que o PT escreve em algarismo romano. Nada além disso.
        for (const extra of outros) {
          assert.match(
            extra,
            /^\d{1,2}$/,
            `en/${id}: apareceu o número "${extra}", que o PT não tem — só ordinal de século pode entrar`
          );
        }
      }
    }
  }
});

test('o locus não se traduz — capítulo, parágrafo e versículo idênticos nos três', () => {
  const PADROES = [
    /\b[IVXL]+\.[\dIVXL][\d.\-IVXL]*/g, // Tetrabiblos I.8 · XVIII.321-322 · II.4-II.9
    /§\s?[\d.]+/g, // §4 · §7 · §14.1
    /\b\d{1,3}\.\d{1,2}(?:-\d{1,3})?\b/g, // De Agri Cultura 40.1 · 31.2 · História Romana 37.18-19
    /\b\d+:\d+\b/g, // Joel 2:31
  ];
  for (const id of IDS) {
    const alvos = new Set();
    for (const re of PADROES) for (const m of P.pt[id].fonte.match(re) || []) alvos.add(m);
    for (const lang of ['es', 'en']) {
      for (const locus of alvos) {
        assert.ok(
          P[lang][id].fonte.includes(locus),
          `${lang}/${id}: o locus "${locus}" sumiu do recibo — "${P[lang][id].fonte}"`
        );
      }
    }
  }
});

test('nome de obra em latim, inglês ou francês atravessa os três idiomas intacto', () => {
  const OBRAS = [
    'Tetrabiblos', 'Naturalis Historia', 'De Re Rustica', 'De Agri Cultura', 'Astronomica',
    'The Pictorial Key to the Tarot', 'Pictorial Key', 'Le Monde primitif', 'Du Jeu des Tarots',
    'The Lunation Cycle', 'New Moon Astrology', 'Four Blood Moons', 'Carmen Astrologicum',
    'Babylonian Horoscopes', 'The Game of Tarot', 'Ancien Tarot de Marseille', 'Enūma Anu Enlil',
    'Sky & Telescope', 'Dell Horoscope', 'Sunday Express', "Maine Farmers' Almanac", "Old Farmer's Almanac",
    'American Philosophical Society', 'Merriam-Webster', 'British Museum', 'Trivial Pursuit',
    'Golden Dawn', 'Opening of the Key', 'Minchiate', 'Sola Busca', 'Tarocco Bolognese',
    'Visconti-Sforza', 'Rider-Waite-Smith', 'Phlox subulata', 'perigee syzygy', 'Luna silente',
    'Blue Moon', 'Harvest Moon', 'Thoth', 'Nechepso', 'Petosiris', 'šār',
    'What the Stars Foretell for the New Princess', "What's a Blue Moon?",
  ];
  let conferidas = 0;
  for (const id of IDS) {
    const pt = corpo(P.pt[id]);
    for (const obra of OBRAS) {
      if (!pt.includes(obra)) continue;
      conferidas += 1;
      for (const lang of ['es', 'en']) {
        assert.ok(
          corpo(P[lang][id]).includes(obra),
          `${lang}/${id}: "${obra}" foi traduzido — nome de obra não se traduz`
        );
      }
    }
  }
  assert.ok(conferidas >= 40, `a lista de obras só encostou em ${conferidas} textos — ela envelheceu junto com o banco`);
});

test('a citação verbatim de Waite é BYTE A BYTE a mesma nos três packs', () => {
  const VERBATINS = [
    ['taro-estrela', 'Loss, theft, privation, abandonment'],
    ['taro-morte', 'End, mortality, destruction, corruption'],
  ];
  for (const [id, citacao] of VERBATINS) {
    for (const lang of LANGS) {
      assert.ok(
        P[lang][id].explicacao.includes(citacao),
        `${lang}/${id}: a citação de Waite foi traduzida — traduzir citação é falsificá-la`
      );
    }
    // A OPÇÃO com o mesmo conteúdo, essa sim, é texto de tela e traduz.
    assert.notEqual(P.es[id].opcoes.join(), P.pt[id].opcoes.join(), `es/${id}: as opções não foram traduzidas`);
  }
});

test('nome consagrado TRADUZ, e o nome português não vaza pro pack de fora', () => {
  const CONSAGRADOS = [
    ['Ptolomeu', 'Ptolomeo', 'Ptolemy'],
    ['Plínio', 'Plinio', 'Pliny'],
    ['Catão', 'Catón', 'Cato'],
    ['Columela', 'Columela', 'Columella'],
    ['Dião Cássio', 'Dión Casio', 'Cassius Dio'],
    ['Vétio Valente', 'Vetio Valente', 'Vettius Valens'],
    ['Manílio', 'Manilio', 'Manilius'],
    ['Sexto Empírico', 'Sexto Empírico', 'Sextus Empiricus'],
    ['Doroteu', 'Doroteo', 'Dorotheus'],
  ];
  for (const [pt, es, en] of CONSAGRADOS) {
    const ondeAparece = IDS.filter((id) => corpo(P.pt[id]).includes(pt));
    assert.ok(ondeAparece.length > 0, `"${pt}" sumiu do banco PT — atualize esta lista junto com o conteúdo`);
    for (const id of ondeAparece) {
      assert.ok(corpo(P.es[id]).includes(es), `es/${id}: "${pt}" não virou "${es}"`);
      assert.ok(corpo(P.en[id]).includes(en), `en/${id}: "${pt}" não virou "${en}"`);
    }
  }
});

test('nenhum pack de fora vaza português', () => {
  const MARCAS = [/\bvoc[êe]\b/i, /\bn[ãa]o\b/i, /ç[ãõ]/i, /\bs[ãa]o\b/i, /\bpra\b/i, /\bs[ée]culo/i, /\bTar[ôo]\b/i, /\bPtolomeu\b/i, /\bfonte\b/i, /\bs[ée]c\./i];
  for (const lang of ['es', 'en']) {
    for (const [caminho, texto] of textosVisiveis(lang)) {
      for (const re of MARCAS) {
        assert.ok(!re.test(texto), `${lang} ${caminho} vazou português: "${texto.match(re)}"`);
      }
    }
    for (const [chave, valor] of Object.entries(chromeDaTela(lang))) {
      const s = typeof valor === 'function' ? String(valor(2, 7)) : valor;
      for (const re of MARCAS) assert.ok(!re.test(s), `${lang} chrome.${chave} vazou português: "${s.match(re)}"`);
    }
  }
});

// ===========================================================================
// 5. TRADUZIU DE VERDADE — e a lista fechada do que pode ficar igual
// ===========================================================================
// Uma string idêntica ao PT só é legítima quando é nome próprio, título de obra
// ou data pura. Toda outra igualdade é tradução esquecida, e a lista abaixo é
// fechada de propósito: quem adicionar pergunta nova tem que justificar aqui.
const IGUAIS_PERMITIDOS = {
  es: new Set([
    // Recibos que são só título + data: nada a traduzir.
    'taro-egito-autor.fonte', 'taro-waite-refuta.fonte', 'taro-morte.fonte', 'taro-cruz-celta.fonte',
    'taro-marselha.fonte', 'lua-superlua.fonte', 'hist-horoscopo-jornal.fonte', 'hist-horoscopo-antigo.fonte',
    // Nomes próprios e frases que o espanhol escreve igual ao português.
    'taro-quem-desenhou.opcao[1]', 'taro-invertidas.opcao[2]', 'lua-oito-fases.opcao[1]',
    'lua-oito-fases.opcao[2]', 'lua-minguante.opcao[2]', 'lua-sangue.opcao[2]', 'lua-intencoes.opcao[3]',
    // As quatro opções de datas puras (3000 a.C. / 410 a.C. / 150 d.C. / 1781).
    'hist-horoscopo-antigo.opcao[0]', 'hist-horoscopo-antigo.opcao[1]',
    'hist-horoscopo-antigo.opcao[2]', 'hist-horoscopo-antigo.opcao[3]',
  ]),
  en: new Set([
    'taro-egito-autor.fonte', 'taro-marselha.fonte', 'hist-horoscopo-jornal.fonte', 'hist-horoscopo-antigo.fonte',
    'taro-quem-desenhou.opcao[1]', 'lua-intencoes.opcao[3]', 'hist-horoscopo-antigo.opcao[3]',
  ]),
};

test('cada campo traduzido é diferente do PT — e as exceções são a lista fechada', () => {
  for (const lang of ['es', 'en']) {
    const inesperados = [];
    for (const id of IDS) {
      const pt = P.pt[id];
      const outro = P[lang][id];
      const campos = [
        ['pergunta', pt.pergunta, outro.pergunta],
        ...pt.opcoes.map((o, i) => [`opcao[${i}]`, o, outro.opcoes[i]]),
        ['explicacao', pt.explicacao, outro.explicacao],
        ['fonte', pt.fonte, outro.fonte],
      ];
      for (const [campo, a, b] of campos) {
        const caminho = `${id}.${campo}`;
        if (a === b && !IGUAIS_PERMITIDOS[lang].has(caminho)) inesperados.push(caminho);
      }
      assert.notEqual(outro.pergunta, pt.pergunta, `${lang}/${id}: enunciado não traduzido`);
      assert.notEqual(outro.explicacao, pt.explicacao, `${lang}/${id}: explicação não traduzida`);
    }
    assert.deepEqual(
      inesperados,
      [],
      `${lang}: campos idênticos ao PT fora da lista de exceções (tradução esquecida?):\n  ` + inesperados.join('\n  ')
    );
  }
});

test('as frases de placar, os temas e o chrome falam três línguas diferentes', () => {
  for (let i = 0; i < FAIXAS_PLACAR.length; i += 1) {
    const [pt, es, en] = LANGS.map((l) => frasesDePlacar(l)[i]);
    assert.notEqual(es, pt, `placar[${i}] es ficou igual ao pt`);
    assert.notEqual(en, pt, `placar[${i}] en ficou igual ao pt`);
    assert.notEqual(en, es, `placar[${i}] en ficou igual ao es`);
    for (const [lang, f] of [['pt', pt], ['es', es], ['en', en]]) {
      assert.ok(f.trim().length >= 60, `${lang} placar[${i}] curto demais`);
    }
  }
  assert.notEqual(temaRotulos('es').lua, TEMA_ROTULOS.lua);
  assert.notEqual(temaRotulos('en').lua, TEMA_ROTULOS.lua);
  for (const lang of ['es', 'en']) {
    const c = chromeDaTela(lang);
    assert.notEqual(c.titulo, CHROME_TELA.titulo, `${lang}: o título da tela não foi traduzido`);
    assert.notEqual(c.subtitulo, CHROME_TELA.subtitulo, `${lang}: o subtítulo não foi traduzido`);
    assert.notEqual(c.contador(3, 7), CHROME_TELA.contador(3, 7), `${lang}: o contador não foi traduzido`);
    // O plural do acumulado é lógica, não texto: tem que sobreviver à tradução.
    assert.notEqual(c.acumulado(1, 1), c.acumulado(2, 1), `${lang}: acumulado não distingue singular de plural`);
    assert.match(c.acumulado(42, 30), /42/, `${lang}: acumulado perdeu o número`);
    assert.match(c.acumulado(42, 30), /30/, `${lang}: acumulado perdeu os acertos`);
    assert.equal(c.placarDe(5, 7).replace(/\D+/g, ''), '57', `${lang}: placarDe perdeu número`);
    assert.match(c.a11yOpcao(3), /3/, `${lang}: a11yOpcao perdeu o número`);
  }
});

// ===========================================================================
// 6. PRENDE PRIMEIRO, FONTE DEPOIS — nos três idiomas
// ===========================================================================

test('a explicação abre em conversa em todo idioma — sem século abreviado nem ano nos primeiros 40 caracteres', () => {
  const ANO = /\b(1[0-9]{3}|20[0-2][0-9])\b/;
  const ABREVIACAO = {
    pt: /s[ée]c\./i,
    es: /\bs\.\s?[IVX]/i,
    en: /\b\d{1,2}(st|nd|rd|th)\s?c\.|\bc\.\s?\d{2,}/i,
  };
  const violacoes = [];
  for (const lang of LANGS) {
    for (const id of IDS) {
      const abertura = P[lang][id].explicacao.slice(0, 40);
      if (ANO.test(abertura) || ABREVIACAO[lang].test(abertura)) violacoes.push(`${lang}/${id} → "${abertura}..."`);
    }
  }
  assert.deepEqual(
    violacoes,
    [],
    'PRENDE PRIMEIRO, FONTE DEPOIS (docs/tradicao/00-tese.md): a explicação começa na história, ' +
      'o recibo mora no campo fonte:\n  ' + violacoes.join('\n  ')
  );
});

test('o recibo é datado nos três idiomas, e a explicação ensina sem virar aula', () => {
  const DATADO = { pt: /\d|s[ée]c\./i, es: /\d|siglos?\s+[IVXLC]/i, en: /\d|\bcentur/i };
  for (const lang of LANGS) {
    for (const id of IDS) {
      const p = P[lang][id];
      assert.ok(p.fonte.trim().length >= 10, `${lang}/${id}: recibo curto demais`);
      assert.ok(DATADO[lang].test(p.fonte), `${lang}/${id}: recibo sem data nem século: "${p.fonte}"`);
      assert.ok(p.explicacao.trim().length >= 100, `${lang}/${id}: explicação curta demais pra ensinar`);
      assert.ok(p.explicacao.trim().length <= 700, `${lang}/${id}: explicação virou aula — o formato é 2-3 frases`);
      assert.ok(
        p.explicacao.split('.').filter((s) => s.trim().length > 0).length >= 2,
        `${lang}/${id}: explicação com menos de 2 frases`
      );
      assert.ok(p.pergunta.trim().length >= 15, `${lang}/${id}: enunciado curto demais`);
    }
  }
});

// ===========================================================================
// 7. A LINHA VERMELHA, NOS TRÊS IDIOMAS
// ===========================================================================
// As listas PT são as mesmas de test/quizCosmico.test.js (recortadas no que
// pode aparecer aqui); es e en são as primas diretas — as palavras proibidas
// têm parentes em toda língua, e a regra é DE PALAVRA, não de intenção. Se um
// texto tropeça, reescreve-se o texto, nunca a lista.

const SAUDE = {
  pt: [
    /\bcur(a|ar|as|am|ativ)/i, /\btrata(r|mento)?\b/i, /\bacalma\b/i, /\balivi(a|ar|o)\b/i, /\bal[ií]vio\b/i,
    /\benergiza/i, /\bsa[uú]de\b/i, /\bdores?\b/i, /\bsono\b/i, /\bdormir\b/i, /\brelaxa/i, /\bansiedade\b/i,
    /\bterap[eê]utic/i, /\bbem-estar\b/i, /\bregenera/i,
  ],
  es: [
    /\b(alivia|alivian|aliviar|alivio|calma|calman|calmar|calmante|sana|sanan|sanar|sanaci[óo]n|cura|curan|curar|curaci[óo]n|trata|tratan|tratar|tratamiento|energiza|energizan|energizar|energizante|terapia|terap[ée]utic\w*|remedio)\b/i,
    /\bsalud\b/i, /\bdolor(es)?\b/i, /\bansiedad\b/i, /\binsomnio\b/i, /\brelaja\w*/i, /\bbienestar\b/i, /\bregenera/i,
  ],
  en: [
    /\b(relieve[sd]?|relief|sooth\w*|calm\w*|heal\w*|cure[sd]?|curing|treat(s|ed|ing|ment|ments)?|energiz\w*|therapy|therapeutic|remedy|remedies)\b/i,
    /\bhealth\b/i, /\bpain\b/i, /\banxiety\b/i, /\binsomnia\b/i, /\brelax\w*/i, /\bwell-?being\b/i, /\bsleep\b/i, /\bregenerat/i,
  ],
};

const PROMESSA = {
  pt: [
    /\batra(i|ir|em)\b/i, /\bgarant(e|ia|ido|ir)\b/i, /\bmanifesta(r|ção)?\b/i, /\bprotege\b/i, /\bafasta\b/i,
    /\bpoderoso\b/i, /\bd[áa] sorte\b/i, /\btraz sorte\b/i, /\bvai dar certo\b/i, /\bdestrava\b/i, /\babre caminhos?\b/i,
  ],
  es: [
    /\batrae(r|n)?\b/i, /\bgarantiza\w*/i, /\bmanifesta(r|ci[óo]n)\b/i, /\bprotege\w*/i, /\baleja\b/i,
    /\bpoderoso\b/i, /\bda suerte\b/i, /\bva a funcionar\b/i, /\basegurad\w*/i, /\babre caminos\b/i, /\bdesbloquea\b/i,
  ],
  en: [
    /\battracts?\b/i, /\bguarantee\w*/i, /\bmanifest(s|ing|ation)?\b/i, /\bprotects?\b/i, /\bwards? off\b/i,
    /\bpowerful\b/i, /\bbrings? luck\b/i, /\bwill work\b/i, /\bunlocks?\b/i, /\bopens? doors\b/i,
  ],
};

const MECANISMO = {
  pt: [/\benerg[ée]tic/i, /\benergia (negativa|positiva)\b/i, /\bvibra[çc][ãa]o\b/i, /\baura\b/i, /\bchakra/i, /\bpurifica/i, /\bmau-olhado\b/i, /\bdescarreg(a|ar)\b/i],
  es: [/\benerg[ée]tic/i, /\benerg[íi]a (negativa|positiva)\b/i, /\bvibraci[óo]n\b/i, /\baura\b/i, /\bchakra/i, /\bpurifica/i, /\bmal de ojo\b/i, /\bdescarga energ/i],
  en: [/\benergy (field|healing|flow|work)\b/i, /\b(negative|positive) energy\b/i, /\bvibrations?\b/i, /\baura\b/i, /\bchakra/i, /\bpurif(y|ies|ying)\b/i, /\bevil eye\b/i],
};

// A palavra banida por docs/tradicao/06 §2 e suas primas — regra literal, sem
// exceção nem pra opção errada nem pra citação do engano.
const BANIDA = { pt: [/\bcigan\w*/iu], es: [/\bgitan\w*/iu], en: [/\bg[iy]ps(y|ies|ie)\w*/iu] };

// Prova social inventada: o quiz cita fonte primária, nunca "todo mundo sabe".
const PROVA_SOCIAL = {
  pt: [/milh(ões|ares) de (pessoas|usu)/i, /\bcomprovad/i, /\bcientificamente\b/i, /todo mundo (sabe|usa)/i, /\bmilhares de pessoas\b/i],
  es: [/millones de (personas|usuarios)/i, /\bcomprobad/i, /\bcient[íi]ficamente\b/i, /todo el mundo (sabe|usa)/i],
  en: [/millions of (people|users)/i, /scientifically (proven|shown)/i, /\beveryone knows\b/i, /\bstudies show\b/i],
};

// Tudo que a pessoa pode ler num idioma: enunciados, as 4 opções (as ERRADAS
// inclusive), explicações, recibos, frases de placar, rótulos de tema e chrome.
function tudoQueSeLe(lang) {
  const saida = [...textosVisiveis(lang)];
  for (const [k, v] of Object.entries(temaRotulos(lang))) saida.push([`tema.${k}`, v]);
  for (const [k, v] of Object.entries(chromeDaTela(lang))) {
    saida.push([`chrome.${k}`, typeof v === 'function' ? String(v(2, 7)) : v]);
  }
  return saida;
}

function varrer(lang, listas, rotulo) {
  const violacoes = [];
  for (const [caminho, texto] of tudoQueSeLe(lang)) {
    for (const re of listas[lang]) {
      if (re.test(texto)) violacoes.push(`${lang} ${caminho} → ${re} (${rotulo}): "${texto.match(re)}"`);
    }
  }
  return violacoes;
}

test('NENHUM texto do quiz, em NENHUM idioma, faz alegação de saúde', () => {
  const violacoes = LANGS.flatMap((l) => varrer(l, SAUDE, 'saúde'));
  assert.deepEqual(violacoes, [],
    'Linha vermelha absoluta nos três idiomas — a regra é de palavra, não de intenção. Reescreva o texto:\n  ' +
      violacoes.join('\n  '));
});

test('NENHUM texto do quiz, em NENHUM idioma, promete resultado', () => {
  const violacoes = LANGS.flatMap((l) => varrer(l, PROMESSA, 'promessa'));
  assert.deepEqual(violacoes, [],
    'O quiz ensina história com fonte; não promete nada a ninguém, em língua nenhuma:\n  ' + violacoes.join('\n  '));
});

test('NENHUM texto do quiz, em NENHUM idioma, inventa mecanismo pseudocientífico', () => {
  const violacoes = LANGS.flatMap((l) => varrer(l, MECANISMO, 'mecanismo'));
  assert.deepEqual(violacoes, [], 'Nem como imagem poética:\n  ' + violacoes.join('\n  '));
});

test('NENHUM texto do quiz, em NENHUM idioma, usa a palavra banida nem suas primas', () => {
  const violacoes = LANGS.flatMap((l) => varrer(l, BANIDA, 'palavra banida'));
  assert.deepEqual(violacoes, [],
    'docs/tradicao/06 §2 não abre exceção pra distrator nem pra aspas, em nenhum idioma:\n  ' + violacoes.join('\n  '));
});

test('NENHUM texto do quiz, em NENHUM idioma, inventa prova social', () => {
  const violacoes = LANGS.flatMap((l) => varrer(l, PROVA_SOCIAL, 'prova social'));
  assert.deepEqual(violacoes, [],
    'O recibo do quiz é fonte primária, nunca "todo mundo sabe":\n  ' + violacoes.join('\n  '));
});

test('as varreduras têm dente — se não mordem, não protegem ninguém', () => {
  // Contrapartida das listas: um texto obviamente proibido tem que ser pego em
  // cada idioma. Sem isto, uma regex quebrada passaria despercebida pra sempre.
  assert.ok(SAUDE.pt.some((re) => re.test('esta carta acalma a ansiedade')));
  assert.ok(SAUDE.es.some((re) => re.test('esta carta calma la ansiedad')));
  assert.ok(SAUDE.en.some((re) => re.test('this card soothes anxiety')));
  assert.ok(PROMESSA.pt.some((re) => re.test('isso atrai dinheiro, garantido')));
  assert.ok(PROMESSA.es.some((re) => re.test('esto atrae dinero, garantizado')));
  assert.ok(PROMESSA.en.some((re) => re.test('this attracts money, guaranteed')));
  assert.ok(MECANISMO.es.some((re) => re.test('limpia el aura y la vibración')));
  assert.ok(MECANISMO.en.some((re) => re.test('cleans your aura and raises vibrations')));
  assert.ok(BANIDA.es.some((re) => re.test('una gitana lo dijo')));
  assert.ok(BANIDA.en.some((re) => re.test('an old gypsy told me')));
  assert.ok(PROVA_SOCIAL.en.some((re) => re.test('studies show it works')));
});

test('nenhuma frase de placar, em nenhum idioma, inventa medalha', () => {
  // O único sistema de medalhas do app é o da Jornada (lib/jornada.js).
  const MEDALHA = /medalha|medalla|\bmedals?\b|\bbadges?\b|\btroph(y|ies)\b|\binsignia\b/i;
  for (const lang of LANGS) {
    for (let acertos = 0; acertos <= TAMANHO_RODADA; acertos += 1) {
      const frase = fraseDoPlacar(acertos, TAMANHO_RODADA, lang);
      assert.ok(typeof frase === 'string' && frase.trim().length >= 20, `${lang}: placar ${acertos}/7 sem frase`);
      assert.ok(!MEDALHA.test(frase), `${lang}: placar ${acertos}/7 fala em medalha — esse sistema é da Jornada`);
    }
    const distintas = new Set([0, 3, 5, 7].map((a) => fraseDoPlacar(a, TAMANHO_RODADA, lang)));
    assert.ok(distintas.size >= 3, `${lang}: as faixas de placar colapsaram numa frase só`);
    assert.notEqual(
      fraseDoPlacar(0, TAMANHO_RODADA, lang),
      fraseDoPlacar(TAMANHO_RODADA, TAMANHO_RODADA, lang),
      `${lang}: zerar e gabaritar recebem a mesma frase`
    );
  }
});

// ===========================================================================
// 8. O FIO DA TELA — o idioma que ela já tem chega ao motor
// ===========================================================================

test('a tela do quiz passa o lang do useLanguage() pro motor, e não escreve texto nenhum', () => {
  const src = fs.readFileSync(path.join(RAIZ, 'screens', 'QuizCosmicoScreen.js'), 'utf8');
  assert.match(src, /import \{ useLanguage \} from '\.\.\/context\/LanguageContext'/, 'a tela não importa o contexto de idioma');
  assert.match(src, /const \{ lang \} = useLanguage\(\)/, 'a tela não pega o lang do contexto');
  assert.match(src, /chromeDaTela\(lang\)/, 'o chrome da tela tem que vir do motor, no idioma da pessoa');
  assert.match(src, /rodadaDoDia\(dia, lang\)/, 'a rodada tem que ser pedida no idioma da pessoa');
  assert.match(src, /temaRotulos\(lang\)/, 'o rótulo do tema tem que vir traduzido');
  assert.match(src, /fraseDoPlacar\(feita\.acertos, feita\.total, lang\)/, 'a frase de placar tem que sair no idioma da pessoa');
  // E o contrário: nada de dicionário, nada de constante de texto local.
  assert.ok(!/from\s+['"][^'"]*lib\/i18n['"]/.test(src), 'esta tela não usa lib/i18n — o texto mora nos packs');
  assert.ok(!/const TXT = \{/.test(src), 'o chrome voltou a ser constante literal na tela');
});
