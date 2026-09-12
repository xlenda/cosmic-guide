// O RITMO DE VOCES DOIS — o motor, os textos e as regras que os vigiam.
//
// Provado por mutacao em 01/09 (quatro vezes): invertida a tabela de distancia
// (trigono<->quadratura), colapsadas as duas aversoes, "quando houver" trocado
// por "va falar", e o bloco da tela solto do `travado`. Vermelho nas quatro.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  BRIGA_POR_ELEMENTOS,
  CAMA_POR_ASPECTO,
  CAMA_POR_ELEMENTOS,
  CONVERSA_POR_ELEMENTOS,
  FALAR_POR_ELEMENTO,
} from '../madremaria/datos/sinastria.js';
import {
  SIGNOS,
  aspectoEntre,
  distanciaEntre,
  elementoDoSigno,
  ritmoDoPar,
} from '../madremaria/lib/sinastria.js';

/* FUSAO COSMIC GUIDE: o pipeline de teste do Cosmic (@babel/register +
 * babel-preset-expo) transpila para CommonJS com alvo Hermes, que rejeita
 * `import.meta`. __dirname existe nesse alvo, entao a mesma URL base sai dele:
 * mesma semantica, mesmo arquivo lido. */
const __RAIZ_URL = require('node:url').pathToFileURL(__dirname + '/').href;

/* ===================================================================================
   O CALCULO — contra pares conhecidos, nao contra a propria tabela.
   =================================================================================== */

test('doze signos, na ordem zodiacal, e o elemento sai do indice', () => {
  assert.equal(SIGNOS.length, 12);
  assert.equal(SIGNOS[0], 'Áries');
  assert.equal(SIGNOS[11], 'Peixes');
  assert.equal(elementoDoSigno('Áries'), 'fogo');
  assert.equal(elementoDoSigno('Touro'), 'terra');
  assert.equal(elementoDoSigno('Gêmeos'), 'ar');
  assert.equal(elementoDoSigno('Câncer'), 'agua');
  assert.equal(elementoDoSigno('Peixes'), 'agua');
  assert.equal(elementoDoSigno('Ofiúco'), null);
});

test('a distancia e o caminho mais curto, sem direcao', () => {
  assert.equal(distanciaEntre('Áries', 'Áries'), 0);
  assert.equal(distanciaEntre('Áries', 'Touro'), 1);
  assert.equal(distanciaEntre('Touro', 'Áries'), 1); // sem direcao
  assert.equal(distanciaEntre('Áries', 'Peixes'), 1); // da volta pelo lado curto
  assert.equal(distanciaEntre('Áries', 'Libra'), 6);
  assert.equal(distanciaEntre('Batman', 'Leão'), null);
});

test('as figuras de Ptolomeu saem da distancia certa', () => {
  // Trigonos classicos: mesmos elementos, 4 signos de distancia.
  assert.equal(aspectoEntre('Áries', 'Leão'), 'trigono');
  assert.equal(aspectoEntre('Peixes', 'Escorpião'), 'trigono');
  // Oposicao: 6 de distancia.
  assert.equal(aspectoEntre('Câncer', 'Capricórnio'), 'oposicao');
  // Quadratura: 3.
  assert.equal(aspectoEntre('Gêmeos', 'Peixes'), 'quadratura');
  // Sextil: 2.
  assert.equal(aspectoEntre('Áries', 'Gêmeos'), 'sextil');
  // Copresenca NAO e conjuncao — o id da casa e outro de proposito.
  assert.equal(aspectoEntre('Leão', 'Leão'), 'copresenca');
  // As duas aversoes sao ids DIFERENTES (Tetrabiblos I.16) — colapsar e proibido.
  assert.equal(aspectoEntre('Áries', 'Touro'), 'aversao30');
  assert.equal(aspectoEntre('Áries', 'Virgem'), 'aversao150');
  assert.notEqual(CAMA_POR_ASPECTO.aversao30, CAMA_POR_ASPECTO.aversao150);
});

test('a leitura sai inteira, com os placeholders resolvidos pelos NOMES', () => {
  const r = ritmoDoPar('Gêmeos', 'Áries'); // ar + fogo, sextil
  assert.equal(r.aspecto, 'sextil');
  for (const campo of ['cama', 'camaFigura', 'conversa', 'briga', 'comoFalar', 'nomeAspecto']) {
    assert.ok(r[campo] && r[campo].length > 10, `${campo} vazio`);
    assert.doesNotMatch(r[campo], /\{el:/, `${campo} com placeholder sem resolver`);
  }
  // O placeholder vira o nome do signo daquele lado — nao um rotulo generico.
  assert.match(r.conversa, /Gêmeos/);
  assert.match(r.conversa, /Áries/);
});

test('todo par de elementos tem os tres textos, e todo aspecto tem cama', () => {
  const pares = Object.keys(CAMA_POR_ELEMENTOS);
  assert.equal(pares.length, 10, '4 iguais + 6 mistos');
  for (const p of pares) {
    assert.ok(CONVERSA_POR_ELEMENTOS[p], `conversa sem o par ${p}`);
    assert.ok(BRIGA_POR_ELEMENTOS[p], `briga sem o par ${p}`);
  }
  assert.equal(Object.keys(CAMA_POR_ASPECTO).length, 7);
  assert.equal(Object.keys(FALAR_POR_ELEMENTO).length, 4);
  // A chave dos pares e SEM acento — 'agua', nunca 'água' (ver o cabecalho).
  for (const p of pares) assert.doesNotMatch(p, /á|é|í|ó|ú|ã|â/);
});

/* ===================================================================================
   A DOUTRINA — o que estes textos nunca podem dizer.
   =================================================================================== */

const TODOS_OS_TEXTOS = [
  ...Object.values(CAMA_POR_ASPECTO),
  ...Object.values(CAMA_POR_ELEMENTOS),
  ...Object.values(CONVERSA_POR_ELEMENTOS),
  ...Object.values(BRIGA_POR_ELEMENTOS),
  ...Object.values(FALAR_POR_ELEMENTO),
];

test('nenhum texto promete desfecho nem da nota ao par', () => {
  for (const texto of TODOS_OS_TEXTOS) {
    assert.doesNotMatch(texto, /vai voltar|garantid|com certeza/i, texto.slice(0, 50));
    assert.doesNotMatch(texto, /%|por cento|nota \d|pontua/i, texto.slice(0, 50));
    assert.doesNotMatch(texto, /alma gêmea|almas gêmeas|destinad/i, texto.slice(0, 50));
  }
});

test('nenhum texto poe genero na outra pessoa', () => {
  // Os textos falam de SIGNOS e de "um/o outro" (par generico masculino de
  // "um dos dois") — nunca de "ele fara" / "ela sente" apontando a pessoa amada.
  for (const texto of TODOS_OS_TEXTOS) {
    assert.doesNotMatch(texto, /\bela (vai|sente|quer|pensa)\b/i, texto.slice(0, 50));
    assert.doesNotMatch(texto, /\bele (vai|sente|quer|pensa)\b/i, texto.slice(0, 50));
  }
});

test('o passo pratico e condicional e ensina COMO falar, nunca manda procurar', () => {
  for (const texto of Object.values(FALAR_POR_ELEMENTO)) {
    assert.doesNotMatch(texto, /vá falar|va falar|procure|mande mensagem|escreva para/i);
  }
});

/* ===================================================================================
   A TELA — o bloco existe, so na sexta, e o passo pratico obedece ao contato.
   Codigo-fonte pela mesma razao de test/portao-ritual.test.js: sem renderizador,
   ler o arquivo e a unica forma honesta de afirmar que o portao esta la.
   =================================================================================== */

const TELA = readFileSync(new URL('../madremaria/screens/PlanoScreen.js', __RAIZ_URL), 'utf8');

test('o bloco do ritmo so nasce na sexta, com o signo dela, e por UTC', () => {
  assert.match(TELA, /getUTCDay\(\) === 5/);
  assert.match(TELA, /ehSexta && signoDela && !ritmoFechado/);
  assert.match(TELA, /Date\.UTC\(a, m - 1, d\)/);
});

test('o QUANDO HOUVER CONVERSA cala com o contato travado', () => {
  const i = TELA.indexOf("t('plano.ritmo.falar')");
  assert.ok(i > 0, 'o rotulo do passo pratico sumiu da tela');
  const antes = TELA.slice(Math.max(0, i - 600), i);
  assert.match(antes, /\{!travado \? \(/, 'o passo pratico nao esta atras de !travado');
});

test('a leitura na tela vem com limites e com recibo', () => {
  assert.match(TELA, /t\('plano\.ritmo\.limites'\)/);
  assert.match(TELA, /t\('plano\.ritmo\.fonte'\)/);
});

test('o signo entra no Apagar tudo', () => {
  const AJUSTES = readFileSync(new URL('../madremaria/screens/AjustesScreen.js', __RAIZ_URL), 'utf8');
  const lista = AJUSTES.slice(
    AJUSTES.indexOf('CLAVES_HILO_ROJO'),
    AJUSTES.indexOf(']);', AJUSTES.indexOf('CLAVES_HILO_ROJO'))
  );
  assert.match(lista, /'sinastria'/);
});

test('a privacidade nao nega mais o que o app agora pede', () => {
  const TEXTOS = readFileSync(new URL('../madremaria/datos/textos.js', __RAIZ_URL), 'utf8');
  assert.doesNotMatch(TEXTOS, /nem o signo, nem o gênero/, 'a linha antiga da privacidade voltou');
  assert.match(TEXTOS, /O signo da pessoa amada, se você quiser dar/);
});
