// O LOTE DE ACAO E EXPLORACAO — o portao. (12/09/2026)
//
// Irmao de test/diagramacaoLoteTelas.test.js e test/loteParticasDiagramacao.js.
// Este guarda as quatro telas que fecham o buraco do "app com duas caras":
// Agir, Descobrir, Alinhe seu Ceu e o feed da Comunidade.
//
// POR QUE UM TESTE DE FONTE, E NAO DE RENDER. Nao ha react-test-renderer no
// projeto (mesma nota dos testes irmaos), e o que estas telas tem de testavel
// sem render e justamente o que volta sozinho: alguem reabre o arquivo, acha
// um numero "mais bonito" e repoe o 14/20/800 de sempre, e nenhum teste
// reclama ate o app ja estar no ar outra vez com duas caras.
//
// AS LEIS GUARDADAS AQUI
//   1. cada tela le a FUNDACAO (space e type) — sem isso e numero cru de novo;
//   2. cada tela usa ao menos UMA peca de diagramacao;
//   3. duas a quatro faixas por tela — cinco vira textura;
//   4. toda faixa tem SEMENTE, e sementes distintas dentro do mesmo arquivo
//      (semente repetida = a mesma onda duas vezes = papel de parede);
//   5. ZERO numero cru de espaco nas folhas de estilo destas quatro telas;
//   6. o ESTADO VAZIO nao vira bloco de cor: toda faixa que envolve so um
//      estado vazio pede `rasa` (o defeito ALTO que o revisor achou na Home);
//   7. o Recibo Cosmico nao perdeu os testID que ancoram claim de loja ao
//      trocar seis ReceiptRow por uma TabelaDados.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const leia = (rel) => fs.readFileSync(path.join(raiz, rel), 'utf8');

// Tira comentarios: o que vale e o que o arquivo FAZ, nao o que ele diz que
// faz. Sem isto, um comentario citando "FaixaCurva" passaria por uso.
function codigo(fonte) {
  return fonte.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

const LOTE = [
  'screens/AgirScreen.js',
  'screens/DescobrirScreen.js',
  'screens/SkyAlignmentScreen.js',
  'screens/SocialScreen.js',
];

test('toda tela do lote le a fundacao — escala de espaco e de tipografia', () => {
  for (const arq of LOTE) {
    const fonte = codigo(leia(arq));
    assert.match(
      fonte,
      /import \{[^}]*\bspace\b[^}]*\} from '\.\.\/theme'/,
      `${arq} nao importa a escala de espaco — diagramacao sem escala e numero cru de novo`
    );
    assert.match(
      fonte,
      /import \{[^}]*\btype\b[^}]*\} from '\.\.\/theme'/,
      `${arq} nao importa a escala tipografica`
    );
  }
});

test('toda tela do lote usa pelo menos uma peca de diagramacao', () => {
  for (const arq of LOTE) {
    const fonte = codigo(leia(arq));
    assert.match(
      fonte,
      /<(FaixaCurva|ColunaLeitura|TabelaDados|FileiraDeTres|HeroiDoTopo|ListaCheck)\b/,
      `${arq} nao usa nenhuma peca — nao recebeu diagramacao, so uma troca de numeros`
    );
  }
});

test('DUAS A QUATRO faixas por tela — cinco ou mais e a faixa vira textura', () => {
  for (const arq of LOTE) {
    const fonte = codigo(leia(arq));
    const usos = (fonte.match(/<FaixaCurva/g) || []).length;
    assert.ok(
      usos >= 2 && usos <= 4,
      `${arq} desenha ${usos} faixas — a regra do guia e duas a quatro por tela`
    );
    assert.match(
      fonte,
      /import FaixaCurva from '\.\.\/components\/FaixaCurva'/,
      `${arq} usa <FaixaCurva> sem importar a peca`
    );
  }
});

test('toda faixa tem semente, e nenhuma semente se repete dentro do mesmo arquivo', () => {
  for (const arq of LOTE) {
    const fonte = codigo(leia(arq));
    const faixas = fonte.match(/<FaixaCurva[^>]*>/g) || [];
    const sementes = [];
    for (const faixa of faixas) {
      const m = faixa.match(/semente="([^"]+)"/);
      assert.ok(m, `${arq}: uma faixa sem semente — duas faixas sem semente desenham a MESMA onda`);
      sementes.push(m[1]);
    }
    assert.strictEqual(
      new Set(sementes).size,
      sementes.length,
      `${arq}: semente repetida (${sementes.join(', ')}) — onda repetida e papel de parede`
    );
  }
});

// A LEI QUE MAIS VOLTA SOZINHA. O diagnostico do app inteiro foi 601 numeros
// crus de espacamento somados nas 19 telas sem tratamento; quatro delas sao
// estas. O zero literal continua valendo (`paddingTop: 0` e uma decisao, nao
// um degrau), e tamanho de emoji/glifo tambem — nao e espaco.
test('ZERO numero cru de espaco nas folhas de estilo do lote', () => {
  const PROPS = [
    'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
    'paddingVertical', 'paddingHorizontal',
    'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
    'marginVertical', 'marginHorizontal',
    'gap', 'rowGap', 'columnGap',
  ];
  const regex = new RegExp(`\\b(${PROPS.join('|')})\\s*:\\s*(-?\\d+)`, 'g');

  for (const arq of LOTE) {
    const fonte = codigo(leia(arq));
    const achados = [];
    let m;
    while ((m = regex.exec(fonte)) !== null) {
      if (Number(m[2]) === 0) continue; // zero deliberado nao e degrau
      achados.push(`${m[1]}: ${m[2]}`);
    }
    assert.deepStrictEqual(
      achados,
      [],
      `${arq} ainda tem numero cru de espaco (${achados.join(', ')}) — use space.grudado|junto|dentro|bloco|entre|secao|ar|respiro`
    );
  }
});

// O DEFEITO ALTO DA HOME, QUE NAO PODE VOLTAR. A caixa da onda tem 56px fixos
// e, acima da crista, e transparente — mas na borda da tela ela fica quase
// toda preenchida. Numa faixa que envolve SO um estado vazio (o portao de
// login, o feed sem post), isso e mais chao de cor do que conteudo: a faixa
// le como bloco de cor em vez de secao. O prop `rasa` corta a caixa pela
// metade sem redesenhar a curva.
test('a faixa que envolve so um estado vazio pede `rasa`', () => {
  const fonte = codigo(leia('screens/SocialScreen.js'));
  for (const semente of ['portao', 'vazio']) {
    const m = fonte.match(new RegExp(`<FaixaCurva[^>]*semente="${semente}"[^>]*>`));
    assert.ok(m, `SocialScreen: faixa "${semente}" sumiu`);
    assert.match(
      m[0],
      /\brasa\b/,
      `SocialScreen: a faixa "${semente}" envolve so um estado vazio e NAO e rasa — faixa cheia com pouco dentro vira bloco de cor, que e o defeito ALTO achado na Home`
    );
  }

  // Descobrir: enquanto o quiz carrega, so ha um spinner dentro da faixa.
  const descobrir = codigo(leia('screens/DescobrirScreen.js'));
  const quiz = descobrir.match(/<FaixaCurva[^>]*semente="quiz"[^>]*>/);
  assert.ok(quiz, 'DescobrirScreen: faixa "quiz" sumiu');
  assert.match(
    quiz[0],
    /rasa=\{!loaded\}/,
    'DescobrirScreen: a faixa do quiz precisa ficar rasa enquanto carrega — so um spinner dentro da caixa cheia da onda e bloco de cor'
  );

  // Alinhe seu Ceu: sem ceu, a faixa 1 abriga so um cartao de estado.
  const sky = codigo(leia('screens/SkyAlignmentScreen.js'));
  const convite = sky.match(/<FaixaCurva[\s\S]{0,220}?semente="convite"[\s\S]{0,220}?>/);
  assert.ok(convite, 'SkyAlignmentScreen: faixa "convite" sumiu');
  assert.match(
    convite[0],
    /rasa=\{!hasSky\}/,
    'SkyAlignmentScreen: sem ceu a faixa abriga so um cartao de estado — tem que ficar rasa'
  );
});

// A TROCA QUE MAIS PODIA QUEBRAR COISA. O recibo trocou seis ReceiptRow
// desenhados na mao por TabelaDados. Os testID das linhas nao sao decoracao:
// test/storeMetadata.test.js os exige NO CODIGO-FONTE pra liberar um claim ja
// publicado na ficha da Play Store, e tests/e2e/sky-alignment.spec.js aperta
// cada um deles. Um testID montado em runtime some de um grep de fonte.
test('o Recibo Cosmico virou TabelaDados SEM perder os testID que ancoram claim de loja', () => {
  const fonte = leia('screens/SkyAlignmentScreen.js');
  assert.match(fonte, /<TabelaDados/, 'o recibo deveria usar a peca TabelaDados');
  assert.match(
    fonte,
    /import TabelaDados from '\.\.\/components\/TabelaDados'/,
    'usa <TabelaDados> sem importar a peca'
  );
  for (const id of ['data', 'calculation', 'aspect', 'orb', 'source', 'limit']) {
    assert.match(
      fonte,
      new RegExp(`testID="sky-alignment-receipt-${id}"`),
      `sumiu o testID literal sky-alignment-receipt-${id} — e a evidencia de um claim da Play Store`
    );
  }
  // E o ReceiptRow desenhado na mao nao pode voltar: era ele que duplicava, em
  // seis copias, o `if (!value) return null` que a peca ja faz por lei.
  assert.doesNotMatch(
    codigo(fonte),
    /function ReceiptRow/,
    'ReceiptRow voltou — a lei de nao fabricar volta a ser copiada na mao em vez de sair de lib/filtroDado.js'
  );
});

// A SALA E PELA RELACAO ENTRE SIGNOS, NUNCA "POR SIGNO" (lib/communityRooms.js
// classifica PARES). Ja houve copy errada sobre isso, e o feed e a tela
// vizinha das salas — o lugar mais facil de escorregar.
test('o feed da Comunidade nao inventa sala por signo', () => {
  const fonte = leia('screens/SocialScreen.js');
  // "sala do seu signo", "sala de Escorpiao", "sala por signo" — todas dizem
  // a mesma coisa errada. A sala sai do PAR (classifyCommunityPair), nunca de
  // um signo sozinho. Regex literal de proposito: montada por template, a
  // barra invertida de \s some antes de virar RegExp e o portao passa a
  // aceitar exatamente a copy que ele existe pra barrar.
  assert.doesNotMatch(
    fonte,
    /sala\s+(d[eoa]s?|por|pro|para)\s+(seu|sua|o|a)?\s*(signo|Áries|Touro|Gêmeos|Câncer|Leão|Virgem|Libra|Escorpião|Sagitário|Capricórnio|Aquário|Peixes)/iu,
    'SocialScreen sugere sala POR SIGNO — as salas saem da RELACAO entre dois signos (lib/communityRooms.js), e ja houve copy errada sobre isso'
  );
});
