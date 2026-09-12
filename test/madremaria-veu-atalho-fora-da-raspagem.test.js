// O ATALHO NAO PODE MORAR DENTRO DA AREA RASPAVEL (bug de 10/09).
//
// O QUE ACONTECEU: o botao "Revelar sem raspar" — o caminho obrigatorio de
// acessibilidade — vivia DENTRO do veu, num rodape ancorado em `bottom: 8`.
// Com a carta em 334x557 (DIMENSION_CARTA), ele cobria os ultimos ~9% da
// propria area que o dedo raspa. Quem raspava ate a base — o gesto natural de
// quem quer limpar o metal todo — soltava o dedo em cima dele, o Pressable
// disparava `finish(ORIGEN_ATALHO)` e a carta abria pelo atalho. O sintoma que
// o dono viu: a carta EXTRA da variante B (A Ancora) aparecendo ja revelada,
// sem ninguem ter raspado. Reproduzido em producao antes da correcao.
//
// O QUE ESTE TESTE TRANCA: nada tocavel dentro do <Animated.View> do veu. O
// atalho continua existindo (acessibilidade nao e opcional), mas como IRMAO do
// veu, abaixo da carta, onde o gesto de raspar nao passa.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

/* FUSAO COSMIC GUIDE: o pipeline de teste do Cosmic (@babel/register +
 * babel-preset-expo) transpila para CommonJS com alvo Hermes, que rejeita
 * `import.meta`. __dirname existe nesse alvo, entao a mesma URL base sai dele:
 * mesma semantica, mesmo arquivo lido. */
const __RAIZ_URL = require('node:url').pathToFileURL(__dirname + '/').href;

const FONTE = readFileSync(new URL('../madremaria/components/ScratchRevealCard.js', __RAIZ_URL), 'utf8');

/** O corpo do veu: do <Animated.View ...> ate o </Animated.View>. */
function corpoDoVeu() {
  const ini = FONTE.indexOf('<Animated.View');
  const fim = FONTE.indexOf('</Animated.View>', ini);
  assert.ok(ini > 0 && fim > ini, 'nao achei o <Animated.View> do veu');
  return FONTE.slice(ini, fim);
}

test('nada tocavel dentro do veu: o atalho nao pode ficar sob o dedo que raspa', () => {
  const veu = corpoDoVeu();
  assert.doesNotMatch(veu, /<Pressable/, 'ha um Pressable DENTRO do veu — ele vai disparar com o dedo que raspa');
  assert.doesNotMatch(veu, /onPress=/, 'ha um onPress dentro do veu');
  assert.doesNotMatch(veu, /accessibilityRole="button"/, 'ha um botao dentro do veu');
  // O progressbar pode ficar la: e 1x1, invisivel e pointerEvents="none".
  assert.match(veu, /accessibilityRole="progressbar"/);
  assert.match(veu, /pointerEvents="none"[\s\S]{0,120}accessibilityRole="progressbar"/);
});

test('o atalho continua existindo, fora do veu, e some com a carta aberta', () => {
  const fimDoVeu = FONTE.indexOf('</Animated.View>');
  const depois = FONTE.slice(fimDoVeu);
  assert.match(depois, /<Pressable/, 'o atalho de acessibilidade sumiu — ele e obrigatorio');
  assert.match(depois, /finish\(ORIGEN_ATALHO\)/, 'o atalho nao abre mais a carta');
  assert.match(depois, /\{!revealed && \(/, 'o atalho deve sumir quando a carta ja esta aberta');
  // Alvo de toque minimo preservado.
  assert.match(FONTE, /tapFallback: \{[\s\S]*?minHeight: 44/);
});

test('o estilo do atalho nao volta a ser um rodape absoluto sobre a carta', () => {
  const estilo = FONTE.slice(FONTE.indexOf('tapFallback: {'));
  const bloco = estilo.slice(0, estilo.indexOf('},'));
  assert.doesNotMatch(bloco, /position: 'absolute'/, 'o atalho voltou a flutuar sobre a carta');
  assert.doesNotMatch(bloco, /bottom:/, 'o atalho voltou a ser ancorado na base da carta');
  assert.match(bloco, /marginTop/, 'o atalho deve ficar ABAIXO da carta, em fluxo normal');
});
