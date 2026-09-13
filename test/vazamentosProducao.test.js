// O QUE VAZAVA PRA PRODUÇÃO — o portão dos três consertos de 12/09/2026.
//
// Os três eram invisíveis em teste de unidade e só apareceram MEDINDO o app no
// navegador. Este arquivo guarda o que a medição concluiu, pra nenhum deles
// voltar em silêncio:
//
//   1. a vitrine das peças (/pecas) era rota PÚBLICA de produção;
//   2. o dock do "Som do céu" cobria texto e aparecia dentro da Madre Maria;
//   3. o título do FeatureCard era cortado na terceira linha.
//
// Não renderiza componente (não há react-test-renderer no projeto — mesma
// razão documentada em test/diagramacaoPecas.test.js): lê o FONTE e a i18n, e
// mede o texto pela mesma conta que o navegador confirmou.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const leia = (p) => fs.readFileSync(path.join(raiz, p), 'utf8');

const appJs = leia('App.js');
const featureCard = leia('components/FeatureCard.js');
const soundPlayer = leia('components/CosmicSoundPlayer.js');

// =====================================================================
// 1. A VITRINE DAS PEÇAS NÃO EXISTE EM PRODUÇÃO
// =====================================================================
// Ela entra no bundle por três portas — o import lazy, a <Stack.Screen> e o
// path 'pecas' do `linking`. Se QUALQUER uma ficar fora de __DEV__, /pecas
// volta a resolver em produção. Por isso as três são verificadas.

test('a vitrine /pecas só é importada em __DEV__', () => {
  const linha = appJs.split('\n').find((l) => l.includes('PecasDemoScreen = '));
  assert.ok(linha, 'a linha do import lazy da vitrine sumiu — este teste precisa ser reescrito');
  assert.match(
    linha,
    /__DEV__\s*\?/,
    'o import da vitrine precisa estar atrás de __DEV__, senão a tela vira chunk de produção'
  );
});

test('a <Stack.Screen> da vitrine só é registrada em __DEV__', () => {
  const linha = appJs.split('\n').find((l) => l.includes('component={PecasDemoScreen}'));
  assert.ok(linha, 'a <Stack.Screen> da vitrine sumiu — este teste precisa ser reescrito');
  assert.match(
    linha,
    /__DEV__\s*&&/,
    'sem a guarda __DEV__ a rota da vitrine volta a existir no roteador de produção'
  );
});

test('o path /pecas do linking só existe em __DEV__', () => {
  const linha = appJs.split('\n').find((l) => l.includes("[ROUTES.PECAS_DEMO]: 'pecas'"));
  assert.ok(linha, 'o path pecas sumiu do linking — este teste precisa ser reescrito');
  assert.match(
    linha,
    /__DEV__\s*\?/,
    'sem a guarda, /pecas continua sendo deep link público'
  );
});

// =====================================================================
// 2. O DOCK DO SOM NÃO COBRE TEXTO E NÃO ENTRA NA MADRE
// =====================================================================

test('o dock do som não é montado dentro da Madre Maria', () => {
  // A decisão mora em `mostraDock`, e ela tem de considerar a Madre.
  assert.match(
    appJs,
    /const mostraDock = audioDisponivel\(\) && !dentroDaMadre;/,
    'mostraDock precisa excluir a Madre — a pílula roxa do Cosmic sobre o fio vermelho dela é vazamento de identidade'
  );
  assert.match(
    appJs,
    /dentroDaMadre = rotasFocadas\.has\(ROUTES\.MADRE_MARIA\)/,
    'a detecção da Madre tem de olhar o CAMINHO focado, não a folha'
  );
  assert.match(
    appJs,
    /\{mostraDock && <CosmicSoundPlayer \/>\}/,
    'o dock tem de ser montado sob a mesma condição que reserva o espaço dele'
  );
});

test('quem mostra o dock é quem reserva o espaço dele — nunca um sem o outro', () => {
  // O bug era exatamente a falta desse par: o dock aparecia sem nada reservado
  // e pousava sobre os últimos 46px do conteúdo (medido no Horóscopo).
  // sceneContainerStyle e NÃO padding no <View> de fora: o dock é FILHO desse
  // View, então encurtá-lo descia o dock junto e ele seguia por cima da última
  // linha (medido: dock em 712–766 com a frase ainda por baixo). O container
  // das cenas é irmão mais interno — encurta só o conteúdo.
  assert.match(
    appJs,
    /sceneContainerStyle=\{\s*mostraDock/,
    'o espaço do dock tem de sair do container das CENAS; no View de fora o dock desce junto e volta a cobrir texto'
  );
  assert.match(
    appJs,
    /paddingBottom: ESPACO_DO_DOCK/,
    'sem reservar a altura, o dock volta a pousar sobre os últimos 46px do conteúdo'
  );
  // SEM backgroundColor aqui (12/09/2026, medido em foto). A cor repetida no
  // container das cenas virava um RETÂNGULO CHAPADO de #0B0712 por cima do
  // céu do CosmicScene e do chão das FaixaCurva — medido no Horóscopo: 62px
  // exatos de rgb(11,7,18) no pé contra rgb(14,8,29) do céu logo acima. Quem
  // cobre a tira branca é o <View> pai, que já pinta colors.background.
  assert.doesNotMatch(
    appJs,
    /paddingBottom: ESPACO_DO_DOCK, backgroundColor/,
    'a cor de volta no container das cenas achata o céu num retângulo chapado no pé de toda tela'
  );
  assert.match(appJs, /import CosmicSoundPlayer, \{ ESPACO_DO_DOCK, dockVisivel \}/);

  // A OUTRA METADE DO PAR (12/09/2026, medido fotografando a Home).
  //
  // `mostraDock` sozinho não era o par: ele só sabe de audioDisponivel() e da
  // Madre. O dock ainda se esconde por conta própria quando a tela mostra um
  // card de som embutido (dockVisivel, em CosmicSoundPlayer.js) — e a Home
  // SEMPRE mostra um. Resultado medido em 390x844: dock invisível e 62px de
  // #0B0712 reservados mesmo assim, de y=704 a y=765 na largura inteira, com
  // o cartão do Diário Cósmico cortado ao meio por causa deles. A área de
  // rolagem era 704px numa janela de 844.
  //
  // O par verdadeiro é `mostraDock && dockNaTela` — as DUAS perguntas que o
  // dock faz pra se desenhar, feitas também por quem reserva.
  assert.match(
    appJs,
    /mostraDock && dockNaTela/,
    'reservar só com mostraDock deixa 62px de faixa morta em toda tela com card de som embutido (a Home inclusive)'
  );
});

test('a regra de esconder o dock mora em UM lugar só', () => {
  // Se a condição voltar a ser escrita à mão dentro do render, os dois lados
  // (mostrar e reservar) podem divergir de novo — que foi o bug.
  assert.match(
    soundPlayer,
    /export function dockVisivel\(som\)/,
    'a regra precisa ser exportada pra App.js poder fazer a MESMA pergunta'
  );
  assert.match(
    soundPlayer,
    /if \(!dockVisivel\(som\)\) return null;/,
    'o render do dock tem de usar a função exportada, não uma cópia da condição'
  );
  assert.doesNotMatch(
    soundPlayer,
    /if \(som\.inlinesVisiveis > 0 && !som\.tocando\) return null;/,
    'a condição solta voltou pro render — é a cópia que faz os dois lados divergirem'
  );
});

test('o espaço reservado cobre de fato a altura da pílula do dock', () => {
  const reserva = Number(/export const ESPACO_DO_DOCK = (\d+);/.exec(soundPlayer)[1]);
  // A pílula: botão de 44 + 4 de padding em cima e embaixo = 52 (medido 54 no
  // Chrome, com a borda). Reservar menos que isso é deixar sobra do dock por
  // cima do texto de novo.
  assert.ok(
    reserva >= 54,
    `ESPACO_DO_DOCK = ${reserva} é menor que a altura medida da pílula (54) — o dock volta a cobrir conteúdo`
  );
});

test('a detecção de rota lê o caminho inteiro, não só a folha', () => {
  // getCurrentRoute() desce até a folha: dentro da Madre ele devolve
  // MadreAbas/Sintesis/..., NUNCA MadreMaria. Era por isso que a guarda
  // antiga da PillPremium nunca pegava a Madre.
  assert.match(appJs, /function caminhoFocado\(/, 'o helper do caminho focado sumiu');
  assert.doesNotMatch(
    appJs,
    /setRotaAtual\(navRef\.getCurrentRoute\(\)/,
    'voltar a guardar só a folha reintroduz o bug: a Madre nunca casa pelo nome do contêiner'
  );
});

// =====================================================================
// 3. O TÍTULO DO CARD CABE INTEIRO
// =====================================================================

test('o título do FeatureCard aceita três linhas', () => {
  assert.match(
    featureCard,
    /style=\{styles\.tituloBanner\} numberOfLines=\{3\}/,
    'com numberOfLines={2} o título em inglês era cortado (clientHeight 38 × scrollHeight 57)'
  );
});

test('nenhum título de card passa de três linhas em nenhum idioma', () => {
  // A mesma conta que o navegador confirmou: largura útil de 145px (medida no
  // build), 15px peso 800. A medição aqui é aproximada por largura média de
  // caractere, calibrada CONTRA a medição real do Chrome — o que o teste
  // guarda é a ordem de grandeza: um título bem maior acusa.
  const i18n = leia('lib/i18n.js');
  const re = /'((?:home|explore)\.card\.[a-zA-Z]+\.title|explore\.item\.[a-zA-Z]+\.title)':\s*'([^']+)'/g;
  const LARGURA = 145;
  // Calibrado contra o Chrome: 'That dream is trying to tell you something'
  // ocupa exatamente 3 linhas em 145px.
  const LARGURA_CHAR = 7.4;
  const CHARS_POR_LINHA = LARGURA / LARGURA_CHAR;
  const estourados = [];
  for (const m of i18n.matchAll(re)) {
    const texto = m[2];
    // Estimativa por palavras, como a quebra real faz.
    let linhas = 1;
    let atual = 0;
    for (const palavra of texto.split(' ')) {
      const custo = palavra.length + (atual ? 1 : 0);
      if (atual + custo > CHARS_POR_LINHA) {
        linhas += 1;
        atual = palavra.length;
      } else {
        atual += custo;
      }
    }
    if (linhas > 3) estourados.push(`${m[1]}: "${texto}" (~${linhas} linhas)`);
  }
  assert.deepEqual(
    estourados,
    [],
    'título de card passando de 3 linhas volta a ser cortado:\n' + estourados.join('\n')
  );
});
