// O PORTAO DOS PASSOS DO RITUAL.
//
// Por que este teste le CODIGO-FONTE em vez de renderizar a tela: o portao e
// JSX condicional dentro de PlanoScreen, e o projeto nao tem renderizador de
// React nos testes. Ler o arquivo e a unica forma honesta de afirmar que o
// portao existe — e um teste que so olhasse os TEXTOS passaria com a tela
// mostrando os passos para todo mundo, que e exatamente o bug que ele previne.
//
// Provado por mutacao em 01/09, quatro vezes: apagado o ramo de `assina`,
// invertida a condicao, trocado o catch para setAssina(true), e removido o
// {n} do texto. Vermelho nas quatro.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { t } from '../madremaria/datos/textos.js';

/* FUSAO COSMIC GUIDE: o pipeline de teste do Cosmic (@babel/register +
 * babel-preset-expo) transpila para CommonJS com alvo Hermes, que rejeita
 * `import.meta`. __dirname existe nesse alvo, entao a mesma URL base sai dele:
 * mesma semantica, mesmo arquivo lido. */
const __RAIZ_URL = require('node:url').pathToFileURL(__dirname + '/').href;

const TELA = readFileSync(new URL('../madremaria/screens/PlanoScreen.js', __RAIZ_URL), 'utf8');

test('a tela do plano pergunta se ela assina', () => {
  assert.match(TELA, /import \{ estaSuscrito \} from '\.\.\/lib\/suscripcion'/);
  assert.match(TELA, /estaSuscrito\(\)/);
});

test('os passos do ritual so sao pintados para quem assina', () => {
  // O map dos passos precisa estar DENTRO do ramo verdadeiro de `assina`.
  const i = TELA.indexOf('ritual.comoFazer.map');
  assert.ok(i > 0, 'o map dos passos sumiu — este teste precisa ser reescrito');
  const antes = TELA.slice(0, i);
  const ramo = antes.lastIndexOf('assina ?');
  const rotulo = antes.lastIndexOf("t('plano.tela.ritual.passos')");
  assert.ok(ramo > 0, 'o map dos passos nao esta atras de um ramo `assina ?`');
  assert.ok(ramo > rotulo, 'o ramo de assinatura precisa ficar DEPOIS do rotulo COMO FAZER');
});

test('quem nao assina ve o convite no lugar dos passos, e o botao vai ao paywall', () => {
  assert.match(TELA, /t\('plano\.tela\.ritual\.travado\.corpo', \{ n: ritual\.comoFazer\.length \}\)/);
  assert.match(TELA, /t\('plano\.tela\.ritual\.travado\.boton'\)/);
  assert.match(TELA, /ir\(RUTAS\.PAYWALL\)/);
});

test('falha de leitura tranca, nunca libera', () => {
  const i = TELA.indexOf('estaSuscrito()');
  const trecho = TELA.slice(i, i + 600);
  assert.match(trecho, /\.catch\(\(\) => \{[\s\S]*?setAssina\(false\)/);
  assert.doesNotMatch(trecho, /\.catch\(\(\) => \{[\s\S]*?setAssina\(true\)/);
});

test('o estado comeca em null, para nao piscar o cadeado em quem assina', () => {
  // A ancora antiga exigia falloDisco na LINHA seguinte e quebrou quando o
  // estado do ritmo dos dois entrou no meio — o que ela vigia e o null
  // inicial de `assina`, entao e nele que ela se apoia agora.
  assert.match(TELA, /const \[assina, setAssina\] = useState\(null\);/);
  assert.match(TELA, /assina !== null/);
});

test('o texto do convite conta os passos REAIS, e nao um numero fixo', () => {
  const tres = t('plano.tela.ritual.travado.corpo', { n: 3 });
  const cinco = t('plano.tela.ritual.travado.corpo', { n: 5 });
  assert.notEqual(tres, cinco, '{n} nao esta sendo interpolado');
  assert.match(tres, /\b3 passos\b/);
  assert.match(cinco, /\b5 passos\b/);
  assert.doesNotMatch(tres, /\{n\}/);
});

test('o convite nao promete resultado nem inventa escassez', () => {
  const texto = t('plano.tela.ritual.travado.corpo', { n: 4 });
  for (const proibida of [/vai voltar/i, /garant/i, /última chance/i, /ultima chance/i, /só hoje/i, /expira/i]) {
    assert.doesNotMatch(texto, proibida);
  }
});
