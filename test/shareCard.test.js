// O CARD DE COMPARTILHAR A FRASE — a parte testável em node.
//
// O desenho em si é canvas de navegador e não roda aqui; o que se trava é o
// que quebraria calado: a quebra de linhas (uma frase cortada no lugar errado
// vira card feio no WhatsApp de um desconhecido — a pior vitrine possível) e
// o contrato de degradação (em ambiente sem DOM a função TEM que devolver
// false rápido, porque é isso que faz o share de texto assumir no nativo).
import test from 'node:test';
import assert from 'node:assert/strict';
import { quebrarEmLinhas, compartilharFraseComoCard } from '../lib/shareCard.js';

// Régua falsa determinística: cada caractere mede 10.
const medir = (s) => s.length * 10;

test('quebra em linhas que cabem, sem perder nem duplicar palavra', () => {
  const frase = 'O amor de vocês merece um céu inteiro de estrelas douradas';
  const linhas = quebrarEmLinhas(frase, medir, 200); // 20 chars por linha
  for (const l of linhas) {
    assert.ok(medir(l) <= 200, `linha estourou: "${l}"`);
  }
  assert.equal(linhas.join(' '), frase, 'juntar as linhas tem que devolver a frase exata');
});

test('palavra maior que a linha fica sozinha, nunca é cortada ao meio', () => {
  const linhas = quebrarEmLinhas('amor extraordinariamente grande', medir, 150);
  assert.ok(linhas.includes('extraordinariamente'), 'a palavra gigante vira linha própria');
  assert.equal(linhas.join(' '), 'amor extraordinariamente grande');
});

test('entradas vazias e espaços não explodem nem geram linha fantasma', () => {
  assert.deepEqual(quebrarEmLinhas('', medir, 200), []);
  assert.deepEqual(quebrarEmLinhas('   ', medir, 200), []);
  assert.deepEqual(quebrarEmLinhas(null, medir, 200), []);
  assert.deepEqual(quebrarEmLinhas('  amor   e   paz  ', medir, 500), ['amor e paz']);
});

test('sem DOM (node/nativo), compartilhar devolve false rápido — o texto assume', async () => {
  assert.equal(typeof document, 'undefined', 'este teste só faz sentido fora do navegador');
  assert.equal(await compartilharFraseComoCard({ frase: 'qualquer frase' }), false);
  assert.equal(await compartilharFraseComoCard({ frase: '' }), false);
});
