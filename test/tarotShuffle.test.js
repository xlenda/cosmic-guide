const test = require('node:test');
const assert = require('node:assert/strict');
const { drawTarotCards } = require('../lib/tarotShuffle.js');

test('sorteio não altera o baralho e devolve cartas únicas', () => {
  const deck = Array.from({ length: 78 }, (_, id) => ({ id }));
  const before = deck.slice();
  const drawn = drawTarotCards(deck, 3, () => 0.42);

  assert.deepEqual(deck, before);
  assert.equal(drawn.length, 3);
  assert.equal(new Set(drawn.map((card) => card.id)).size, 3);
});

test('RNG injetado torna a ordem reproduzível e valores extremos são seguros', () => {
  const deck = ['a', 'b', 'c', 'd', 'e'];
  const sequence = [0, 0.99, 0.5, Number.NaN];
  let cursor = 0;
  const first = drawTarotCards(deck, 5, () => sequence[cursor++ % sequence.length]);
  cursor = 0;
  const second = drawTarotCards(deck, 5, () => sequence[cursor++ % sequence.length]);
  assert.deepEqual(first, second);
  assert.deepEqual([...first].sort(), deck);
});

test('contagem é limitada ao tamanho disponível', () => {
  assert.deepEqual(drawTarotCards([], 3), []);
  assert.equal(drawTarotCards(['a', 'b'], 99, () => 0.5).length, 2);
  assert.equal(drawTarotCards(['a', 'b'], -1, () => 0.5).length, 0);
});
