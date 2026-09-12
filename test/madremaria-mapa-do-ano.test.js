// O MAPA DO ANO e a memoria do veu — as regras do tabuleiro.
//
// Provado por mutacao em 01/09, tres vezes: o perdao de ontem removido de
// diaAindaAbre, o estado 'passado' virando 'aberto' no mapa, e a migracao do
// formato antigo apagada. Vermelho nas tres.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { t } from '../madremaria/datos/textos.js';
import { TOTAL_DIAS, mapaDoAno } from '../madremaria/lib/mapaDoAno.js';
import { diaAindaAbre, diaAnterior } from '../madremaria/lib/veuDoDia.js';

/* FUSAO COSMIC GUIDE: o pipeline de teste do Cosmic (@babel/register +
 * babel-preset-expo) transpila para CommonJS com alvo Hermes, que rejeita
 * `import.meta`. __dirname existe nesse alvo, entao a mesma URL base sai dele:
 * mesma semantica, mesmo arquivo lido. */
const __RAIZ_URL = require('node:url').pathToFileURL(__dirname + '/').href;

const INICIO = '2026-08-20T22:00:00.000Z';
const HOJE = '2026-09-01';

test('o tabuleiro tem 365 casas e cobre as treze luas', () => {
  const casas = mapaDoAno(INICIO, HOJE, []);
  assert.equal(casas.length, TOTAL_DIAS);
  assert.equal(TOTAL_DIAS, 365);
  const luas = new Set(casas.map((c) => c.lunacao).filter(Boolean));
  assert.equal(luas.size, 13, 'o ano medido nao fechou as treze luas');
});

test('hoje e ontem abrem; anteontem e o futuro nao', () => {
  const casas = mapaDoAno(INICIO, HOJE, []);
  const por = Object.fromEntries(casas.map((c) => [c.dia, c.estado]));
  assert.equal(por['2026-09-01'], 'aberto', 'hoje');
  assert.equal(por['2026-08-31'], 'aberto', 'ontem — o perdao de um dia');
  assert.equal(por['2026-08-30'], 'passado', 'anteontem fechou de vez');
  assert.equal(por['2026-09-02'], 'futuro', 'amanha nunca abre');
});

test('dia raspado e raspado, mesmo sendo hoje', () => {
  const casas = mapaDoAno(INICIO, HOJE, [HOJE, '2026-08-25']);
  const por = Object.fromEntries(casas.map((c) => [c.dia, c.estado]));
  assert.equal(por[HOJE], 'raspado');
  assert.equal(por['2026-08-25'], 'raspado', 'raspado antigo nao vira "passado"');
});

test('sem ancora nao ha tabuleiro — null, nunca um chute', () => {
  assert.equal(mapaDoAno(null, HOJE, []), null);
  assert.equal(mapaDoAno('lixo', HOJE, []), null);
  assert.equal(mapaDoAno(INICIO, 'nao-e-dia', []), null);
});

test('diaAindaAbre: so hoje e ontem, nunca futuro nem anteontem', () => {
  assert.equal(diaAindaAbre('2026-09-01', '2026-09-01'), true);
  assert.equal(diaAindaAbre('2026-08-31', '2026-09-01'), true);
  assert.equal(diaAindaAbre('2026-08-30', '2026-09-01'), false);
  assert.equal(diaAindaAbre('2026-09-02', '2026-09-01'), false);
  assert.equal(diaAindaAbre('lixo', '2026-09-01'), false);
});

test('diaAnterior atravessa mes e ano sem fuso', () => {
  assert.equal(diaAnterior('2026-09-01'), '2026-08-31');
  assert.equal(diaAnterior('2026-01-01'), '2025-12-31');
  assert.equal(diaAnterior('2026-03-01'), '2026-02-28');
});

test('o formato antigo do disco ({dia}) migra para a lista sem perder o raspado', async () => {
  // A migracao vive em normalizar(); provar pelo comportamento publico exigiria
  // mock de AsyncStorage — o que este teste faz e ler o codigo e garantir que o
  // ramo existe, como os outros portoes de tela.
  const LIB = readFileSync(new URL('../madremaria/lib/veuDoDia.js', __RAIZ_URL), 'utf8');
  assert.match(LIB, /dato\.dia/, 'o ramo do formato antigo sumiu');
  assert.match(LIB, /return \[dato\.dia\]/);
});

test('a tela do mapa nao desenha culpa nem progresso', () => {
  const BRUTO = readFileSync(new URL('../madremaria/screens/MapaDoAnoScreen.js', __RAIZ_URL), 'utf8');
  // Os COMENTARIOS da tela citam as palavras proibidas de proposito (e la que a
  // regra esta documentada); o que este teste vigia e o CODIGO que renderiza.
  const TELA = BRUTO.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  // '%' cru pegaria o operador modulo da serpentina (li % 2). O que se proibe
  // e percentual EXIBIDO: todo texto do mapa sai de t('mapa.*'), entao o
  // simbolo e vigiado LA (abaixo), e no codigo ficam so as palavras.
  assert.doesNotMatch(TELA, /percent|progresso|quanto falta/i);
  for (const chave of ['mapa.rotulo', 'mapa.como', 'mapa.pe', 'mapa.semAncora']) {
    const texto = t(chave);
    assert.doesNotMatch(texto, /%|por cento|progresso|quanto falta/i, chave);
    assert.doesNotMatch(texto, /perdeu|atras[oa]d|falhou|quebrou/i, `${chave} com culpa`);
  }
  // A casa passada e apagada por opacidade — nunca por cor de erro.
  assert.match(TELA, /casaPassada:[\s\S]*?opacity/);
  // E so a casa aberta ganha Pressable: 363 toques mortos ensinam a nao tocar.
  // A peca de hoje pulsa (Animated.View) com o Pressable DENTRO; as demais
  // abertas sao Pressable direto. O que se vigia continua o mesmo: so o
  // ramo `abre` monta toque.
  assert.match(TELA, /abre \? \(\s*ehHoje \? \(\s*<Animated\.View/);
  assert.ok(TELA.split('<Pressable').length - 1 >= 2, 'os dois ramos tocaveis sumiram');
});

test('o plano so aceita o dia do mapa se ele ainda abre', () => {
  const PLANO = readFileSync(new URL('../madremaria/screens/PlanoScreen.js', __RAIZ_URL), 'utf8');
  assert.match(PLANO, /diaAindaAbre\(pedido, real\)/, 'o parametro do mapa perdeu a guarda');
});
