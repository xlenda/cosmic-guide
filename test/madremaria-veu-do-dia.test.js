// O VEU DO DIA — a orquestracao do plano no molde do Heat Game.
//
// O dia nasce coberto: o cartao do ritual esta atras da MESMA lamina do funil,
// e a reflexao, a frase, o encontro, o ritmo e o compartilhar so montam depois
// que ela raspou. O raspado vale para UM dia; no seguinte o veu volta.
//
// Codigo-fonte pela mesma razao dos outros portoes de tela (sem renderizador,
// ler o arquivo e a unica prova honesta). Provado por mutacao em 01/09, tres
// vezes: gate trocado por true, catch do disco abrindo em vez de cobrir, e
// revealed cravado em true. Vermelho nas tres.
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

test('o cartao do ritual nasce dentro da lamina, rearmada pelo dia', () => {
  const lamina = TELA.indexOf('<ScratchRevealCard');
  const cartao = TELA.indexOf('estilos.tarjetaRitual');
  const fecho = TELA.indexOf('</ScratchRevealCard>');
  assert.ok(lamina > 0, 'a lamina sumiu da tela');
  assert.ok(lamina < cartao && cartao < fecho, 'o cartao do ritual nao esta atras do veu');
  assert.match(TELA, /resetKey=\{dia\}/, 'sem resetKey={dia} o veu de ontem vale amanha');
  assert.match(TELA, /revealed=\{raspadoHoje === true\}/);
});

test('nada abaixo do veu monta antes de raspar — e null tambem esconde', () => {
  const gate = TELA.indexOf('{raspadoHoje === true ? (');
  assert.ok(gate > 0, 'o gate da ordem certa sumiu');
  // A reflexao, o encontro, o ritmo e o compartilhar vivem DEPOIS do gate.
  for (const marco of [
    "t('plano.tela.reflexao.rotulo')",
    'plano.encontro.titulo',
    "t('plano.ritmo.rotulo')",
    "t('plano.tela.compartir')",
  ]) {
    const i = TELA.indexOf(marco);
    assert.ok(i > gate, `${marco} esta fora (antes) do gate da ordem certa`);
  }
  // E o proprio veu vem antes do gate: raspa-se primeiro, o resto vem depois.
  assert.ok(TELA.indexOf('<ScratchRevealCard') < gate);
});

test('falha de disco cobre, nunca abre', () => {
  const i = TELA.indexOf('jaRaspou(dia)');
  assert.ok(i > 0);
  // O trecho PARA antes de aoRasparODia: logo depois do efeito vem o callback
  // de raspar, cujo setRaspadoHoje(true) e legitimo — um recorte por tamanho
  // fixo o engolia e acusava o codigo certo.
  const fim = TELA.indexOf('aoRasparODia', i);
  assert.ok(fim > i, 'aoRasparODia sumiu — reveja este recorte');
  const trecho = TELA.slice(i, fim);
  assert.match(trecho, /catch[\s\S]*?setRaspadoHoje\(false\)/);
  assert.doesNotMatch(trecho, /catch[\s\S]*?setRaspadoHoje\(true\)/);
});

test('raspar grava o DIA, e a chave esta no Apagar tudo', () => {
  // A gravacao migrou para lib/veuDoDia.marcarRaspado (a LISTA de dias — o
  // perdao de ontem nao pode apagar o raspado de hoje); o que o teste vigia
  // agora e a tela chamando a lib com o dia MOSTRADO.
  assert.match(TELA, /marcarRaspado\(dia\)/);
  const AJUSTES = readFileSync(new URL('../madremaria/screens/AjustesScreen.js', __RAIZ_URL), 'utf8');
  const lista = AJUSTES.slice(
    AJUSTES.indexOf('CLAVES_HILO_ROJO'),
    AJUSTES.indexOf(']);', AJUSTES.indexOf('CLAVES_HILO_ROJO'))
  );
  assert.match(lista, /'planoRaspado'/);
});

test('os textos do veu existem, dizem o gesto e nao prometem nada', () => {
  const raspe = t('plano.veu.raspe');
  const abrir = t('plano.veu.abrir');
  const anuncio = t('plano.veu.anuncio');
  assert.match(raspe, /Raspe/);
  assert.match(abrir, /sem raspar/, 'o fallback acessivel precisa existir com nome honesto');
  assert.ok(anuncio.length > 10);
  for (const texto of [raspe, abrir, anuncio]) {
    assert.doesNotMatch(texto, /sorte|vai voltar|garant/i);
  }
});
