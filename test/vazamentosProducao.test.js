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
  assert.match(
    appJs,
    /paddingBottom: mostraDock \? ESPACO_DO_DOCK : 0/,
    'o container do Tab.Navigator tem de encurtar quando o dock existe, senão ele volta a cobrir texto'
  );
  assert.match(appJs, /import CosmicSoundPlayer, \{ ESPACO_DO_DOCK \}/);
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
