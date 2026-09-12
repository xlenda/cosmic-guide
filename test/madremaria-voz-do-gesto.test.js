// A VOZ NOS GESTOS (03/09) — "colocar a voz também nas tarefas" (o dono).
//
// O que se vigia: todo ritual do catálogo tem o seu áudio registrado E o
// arquivo de verdade nos assets (um require de .m4a ausente derruba o bundle
// inteiro no Metro — este teste pega antes do build); a tela liga o botão
// pela chave derivada ('ritual-' + id, nunca digitada à mão); e o botão de
// ouvir convida (pulsa) mas respeita o movimento reduzido e fica quieto
// enquanto toca.
//
// lib/audios.js é lido como TEXTO: importá-lo no node estouraria nos require
// de .m4a, que só o Metro resolve.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import { IDS_RITUAIS } from '../madremaria/datos/rituais.js';

/* FUSAO COSMIC GUIDE: o pipeline de teste do Cosmic (@babel/register +
 * babel-preset-expo) transpila para CommonJS com alvo Hermes, que rejeita
 * `import.meta`. __dirname existe nesse alvo, entao a mesma URL base sai dele:
 * mesma semantica, mesmo arquivo lido. */
const __RAIZ_URL = require('node:url').pathToFileURL(__dirname + '/').href;

const AUDIOS = readFileSync(new URL('../madremaria/lib/audios.js', __RAIZ_URL), 'utf8');
const TELA = readFileSync(new URL('../madremaria/screens/PlanoScreen.js', __RAIZ_URL), 'utf8');
const BOTAO = readFileSync(new URL('../madremaria/components/BotaoOuvir.js', __RAIZ_URL), 'utf8');

test('todo gesto do catalogo tem audio registrado e arquivo nos assets', () => {
  assert.ok(IDS_RITUAIS.length >= 5, 'o catalogo encolheu?');
  for (const id of IDS_RITUAIS) {
    assert.match(
      AUDIOS,
      new RegExp(`'ritual-${id}': require\\('\\.\\./\\.\\./assets/madremaria/audio/ritual-${id}\\.m4a'\\)`),
      `sem registro de audio para o gesto '${id}'`
    );
    const arquivo = new URL(`../assets/madremaria/audio/ritual-${id}.m4a`, __RAIZ_URL);
    assert.ok(existsSync(arquivo), `assets/madremaria/audio/ritual-${id}.m4a nao existe — o require vai derrubar o bundle`);
  }
});

test('o cartao do gesto liga o botao pela chave derivada', () => {
  assert.match(TELA, /audioId=\{'ritual-' \+ ritual\.id\}/);
  assert.match(TELA, /t\('plano\.tela\.ritual\.ouvir'\)/);
});

test('o botao de ouvir pulsa como convite, mas respeita quem pediu quietude', () => {
  // O pulso existe...
  assert.match(BOTAO, /Animated\.loop/);
  // ...e desliga com movimento reduzido (ou desconhecido) e enquanto toca.
  assert.match(BOTAO, /movimientoReducido !== false \|\| tocando/);
});
