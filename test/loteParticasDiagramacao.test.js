// O LOTE DAS PRÁTICAS — as telas de ritual e passo a passo. (12/09/2026)
//
// Café, Palma (que é o hub de palma/rosto/pé/PINTAS), Assentar, Rituais e o
// Corpo do Zodíaco. São as telas em que a pessoa FAZ alguma coisa — vira a
// xícara, respira contando, acende a vela, toca a figura — e o concorrente
// resolve isso com uma ideia por dobra e progresso no topo. No Cosmic elas
// corriam todas no mesmo chão, com `gap: 12/14/16` da primeira palavra até a
// bibliografia: quinze blocos na mesma distância = lista.
//
// Mesmo padrão dos outros testes de diagramação (sem react-test-renderer no
// projeto, o que se guarda é o TEXTO das telas). As leis aqui são quatro, e
// todas já custaram caro quando quebradas em silêncio:
//
//   1. ESPAÇO PELA ESCALA. Número cru de espaçamento é a origem do aperto.
//   2. AS FAIXAS SEPARAM SEÇÃO, E SANGRAM. De 2 a 4 por tela, sementes
//      diferentes, e marginHorizontal negativo — faixa que não sangra é
//      cartão com onda em cima.
//   3. O TEXTO LONGO VIVE NUMA COLUNA. A leitura da IA e o parágrafo de
//      tradição eram os textos mais longos do app indo de borda a borda.
//   4. NÃO FABRICAR. Estas telas NÃO ganharam fileira de três nem
//      porcentagem: o Café não tem estatística, e o dono já recusou
//      "Amor 75%" duas vezes. Se alguém plantar uma, isto cai.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const ler = (rel) => fs.readFileSync(path.join(raiz, rel), 'utf8');

// Sem os comentários: eles CITAM os defeitos de propósito (é assim que a
// próxima pessoa entende por que a linha está do jeito que está), e contá-los
// como reincidência tornaria o teste impossível de satisfazer sem apagar a
// explicação. Mesma decisão de test/loteFormulariosDiagramacao.test.js.
const semComentario = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');

const LOTE = [
  ['CoffeeScreen', ler('screens/CoffeeScreen.js')],
  ['PalmScreen', ler('screens/PalmScreen.js')],
  ['GroundingScreen', ler('screens/GroundingScreen.js')],
  ['RituaisScreen', ler('screens/RituaisScreen.js')],
  ['ZodiacBodyScreen', ler('screens/ZodiacBodyScreen.js')],
];

// =====================================================================
// 1. ESPAÇO PELA ESCALA
// =====================================================================

test('as telas de prática pedem espaço pelo nome do uso, não por número cru', () => {
  for (const [nome, src] of LOTE) {
    assert.ok(/from '\.\.\/theme'/.test(src), `${nome} não importa do theme`);
    assert.ok(/\bspace\.\w+/.test(src), `${nome} não usa a escala de espaço`);
    assert.ok(
      /space\.(secao|entre|ar|respiro)/.test(src),
      `${nome} não usa nenhum degrau largo (entre/secao/ar) — é o aperto de sempre`
    );
  }
});

test('nenhum gap/padding cru sobrou dentro do StyleSheet das telas de prática', () => {
  // Só o BLOCO do StyleSheet: fora dele um número é size de ícone, largura de
  // imagem ou aspectRatio, e nada disso é relação entre elementos.
  //
  // AS DUAS EXCEÇÕES VIVAS, e as duas são o MESMO 20 do contentContainer:
  //   · `padding: 20` no scroll — o valor que a faixa anula com
  //     marginHorizontal:-20 (mesmo contrato de PlanosScreen.js).
  //   · `paddingHorizontal: 20` no corpo da faixa — devolve, DENTRO da faixa
  //     sangrada, o mesmo gutter que a tela tem fora dela.
  // Os três números são o mesmo número e têm que continuar sendo: trocar um
  // por space.tela (16) faria a faixa sangrar 4px a mais de um lado.
  const PROIBIDO = /\b(gap|marginTop|marginBottom|paddingVertical|paddingHorizontal):\s*\d+/g;
  for (const [nome, src] of LOTE) {
    const bloco = src.match(/const styles = StyleSheet\.create\(\{[\s\S]*\n\}\);/);
    assert.ok(bloco, `${nome}: o StyleSheet sumiu`);
    const semExcecao = semComentario(bloco[0]).replace(
      /faixaCorpo:\s*\{[^}]*\}/g,
      'faixaCorpo: {}'
    );
    const achados = semExcecao.match(PROIBIDO) || [];
    assert.deepEqual(
      achados,
      [],
      `${nome} voltou a ter espaçamento cru no StyleSheet: ${achados.join(', ')}`
    );

    // E o faixaCorpo que acabou de ser isentado não pode esconder OUTRO número
    // cru dentro dele: o único 20 permitido ali é o paddingHorizontal.
    const corpo = semComentario(bloco[0]).match(/faixaCorpo:\s*\{([^}]*)\}/);
    assert.ok(corpo, `${nome}: faixaCorpo sumiu — a faixa perdeu o gutter de volta`);
    const crusNoCorpo = (corpo[1].match(PROIBIDO) || []).filter(
      (m) => m !== 'paddingHorizontal: 20'
    );
    assert.deepEqual(
      crusNoCorpo,
      [],
      `${nome}: faixaCorpo escondeu espaçamento cru: ${crusNoCorpo.join(', ')}`
    );
  }
});

test('a tipografia sai da escala — o corpo do texto não volta pro 13/19 apertado', () => {
  // O degrau do parágrafo longo é type.corpo (17/27), o "Casamentos de Áries"
  // do print. As duas telas de leitura de IA entregam o texto mais longo do
  // app e eram justamente as que o mostravam em 14/21.
  for (const nome of ['CoffeeScreen', 'PalmScreen']) {
    const src = LOTE.find(([n]) => n === nome)[1];
    const bloco = src.match(/resultBody:\s*\{[^}]*\}/);
    assert.ok(bloco, `${nome}: o estilo do corpo da leitura sumiu`);
    assert.ok(
      bloco[0].includes('...type.corpo'),
      `${nome}: a leitura da IA voltou a ter fontSize na mão em vez do degrau da escala`
    );
    assert.ok(
      !/fontSize:\s*\d/.test(bloco[0]),
      `${nome}: a leitura da IA ganhou fontSize cru de volta`
    );
  }
});

// =====================================================================
// 2. AS FAIXAS SEPARAM SEÇÃO, E SANGRAM
// =====================================================================

test('cada tela de prática tem de 2 a 4 faixas — 5+ vira textura', () => {
  for (const [nome, src] of LOTE) {
    const faixas = semComentario(src).match(/<FaixaCurva/g) || [];
    assert.ok(
      faixas.length >= 2,
      `${nome} tem ${faixas.length} faixa(s): a tela voltou a correr toda no mesmo chão`
    );
    assert.ok(
      faixas.length <= 4,
      `${nome} tem ${faixas.length} faixas: acima de 4 a faixa vira textura`
    );
  }
});

test('duas faixas nunca dividem a mesma semente — onda repetida é papel de parede', () => {
  for (const [nome, src] of LOTE) {
    const sementes = [...semComentario(src).matchAll(/<FaixaCurva[\s\S]{0,200}?semente="([^"]+)"/g)].map(
      (m) => m[1]
    );
    const faixas = (semComentario(src).match(/<FaixaCurva/g) || []).length;
    assert.equal(
      sementes.length,
      faixas,
      `${nome}: alguma faixa ficou sem semente — sem ela a onda é a do tom, e duas iguais desenham a mesma curva`
    );
    assert.equal(
      new Set(sementes).size,
      sementes.length,
      `${nome}: duas faixas com a MESMA semente, ondas gêmeas`
    );
  }
});

test('toda faixa do lote sangra pra fora do padding da tela', () => {
  for (const [nome, src] of LOTE) {
    assert.ok(
      /faixa:\s*\{[^}]*marginHorizontal:\s*-20/.test(src),
      `${nome}: a faixa não sangra, então ela é um cartão com onda em cima`
    );
  }
});

test('a PRIMEIRA faixa de cada tela larga o paddingTop — senão vira bloco de cor', () => {
  // MEDIDO NA FOTO (390x844, 12/09/2026), e é o defeito ALTO que o revisor já
  // tinha achado na Home: a caixa da onda tem ONDA_ALTURA (56px) e, logo
  // abaixo do cabeçalho — que já traz folga própria —, o space.secao (32) de
  // paddingTop da peça abria ~88px de chão liso antes da primeira palavra.
  // Faixa que abre com 88px de cor e nenhuma palavra não lê como seção: lê
  // como bloco de cor vazio.
  for (const [nome, src] of LOTE) {
    assert.ok(
      /faixaCorpoPrimeira:\s*\{[^}]*paddingTop:\s*0/.test(src),
      `${nome}: sumiu o estilo que tira o paddingTop da primeira faixa`
    );
    assert.ok(
      semComentario(src).includes('styles.faixaCorpoPrimeira'),
      `${nome}: o estilo existe mas nenhuma faixa o usa — a primeira voltou a abrir com chão morto`
    );
  }
});

// =====================================================================
// 3. O TEXTO LONGO VIVE NUMA COLUNA
// =====================================================================

test('o texto longo das telas de prática não vai mais de borda a borda', () => {
  for (const [nome, src] of LOTE) {
    assert.ok(
      src.includes('<ColunaLeitura'),
      `${nome}: o parágrafo voltou pra largura toda da tela`
    );
  }
});

test('a sanfona do Corpo do Zodíaco põe a coluna UMA vez, no corpo da seção', () => {
  // São dezenas de parágrafos (história, Culpeper, regência planetária) dentro
  // de duas sanfonas. A coluna mora no corpo da sanfona, não em cada <Text>:
  // uma peça cobre todos, e ninguém precisa lembrar de embrulhar o próximo.
  const src = LOTE.find(([n]) => n === 'ZodiacBodyScreen')[1];
  const corpos = semComentario(src).match(/<ColunaLeitura style=\{styles\.sectionBody\}>/g) || [];
  assert.equal(
    corpos.length,
    2,
    `as duas sanfonas (Section e SecaoDupla) deviam carregar a coluna no corpo; achei ${corpos.length}`
  );
  assert.ok(
    !/\{open \? <View style=\{styles\.sectionBody\}>/.test(semComentario(src)),
    'o corpo da sanfona voltou a ser uma View nua: os parágrafos de história voltaram pra largura toda'
  );
});

// =====================================================================
// 4. NÃO FABRICAR
// =====================================================================

test('nenhuma tela de prática ganhou porcentagem ou fileira de números inventados', () => {
  // A FileiraDeTres é a peça natural pra "3 rituais feitos | 12 dias seguidos",
  // e ela NÃO entra aqui porque o Café, a Palma e o Assentar não contam nada —
  // o Assentar de propósito (ver o cabeçalho de screens/GroundingScreen.js:
  // "o que esta tela NÃO tem, de propósito: contagem de progresso própria").
  // O dia em que existir contagem REAL, este teste muda junto, de propósito.
  //
  // A porcentagem é caçada só no TEXTO — dentro de aspas ou de uma frase —,
  // nunca em valor de estilo: `width: '100%'` é CSS e aparece em toda tela com
  // imagem. O que a lei proíbe é a porcentagem VISÍVEL ("Amor 82%" do print do
  // concorrente), e essa vem sempre acompanhada de palavra.
  const inventados = [
    /\d{1,3}\s*%\s*(de\s+)?[A-Za-zÀ-ú]/, // "75% de compatibilidade", "82% amor"
    /[A-Za-zÀ-ú]\s+\d{1,3}\s*%/, // "Amor 82%"
    /\b\d{1,3}\.\d{3}\+?\s*(leituras|rituais|pessoas)/i,
    /\b\d+[.,]\d\s*(de\s*5|estrelas|★)/i,
  ];
  for (const [nome, src] of LOTE) {
    const codigo = semComentario(src);
    assert.ok(
      !codigo.includes('FileiraDeTres'),
      `${nome} ganhou uma FileiraDeTres: só entra com número REAL, e estas telas não contam nada`
    );
    for (const re of inventados) {
      assert.ok(!re.test(codigo), `${nome} ganhou um número inventado: ${re}`);
    }
  }
});

test('o Assentar não ganhou contagem de progresso junto com a diagramação', () => {
  // A proteção de verdade desta tela é o DESENHO: sair no meio não custa nada.
  // Uma barra de progresso, um badge ou um "você completou X" reintroduz
  // exatamente o custo que o cabeçalho do arquivo proíbe — e diagramação é o
  // momento clássico de plantar um sem perceber, porque "fica bonito".
  const src = semComentario(LOTE.find(([n]) => n === 'GroundingScreen')[1]);
  for (const palavra of ['ProgressBar', 'streakCount', 'badge.completou', 'sequenciaDeDias']) {
    assert.ok(!src.includes(palavra), `o Assentar ganhou mecânica de retenção: ${palavra}`);
  }
});
