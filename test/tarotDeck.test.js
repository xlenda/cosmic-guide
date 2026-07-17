// Garante que o baralho é o RWS completo de verdade (78 cartas), sem
// duplicatas — bug real que este teste teria pego: um naipe colado errado ou
// uma carta duplicada silenciosamente reduzindo o baralho.
const test = require("node:test");
const assert = require("node:assert/strict");
const { TAROT_DECK, MAJOR_ARCANA, MINOR_ARCANA } = require("../lib/tarotDeck.js");

test("baralho completo tem exatamente 78 cartas", () => {
  assert.equal(TAROT_DECK.length, 78);
});

test("22 arcanos maiores, numerados de 0 a 21 sem repetição", () => {
  assert.equal(MAJOR_ARCANA.length, 22);
  const numbers = MAJOR_ARCANA.map((c) => c.number).sort((a, b) => a - b);
  assert.deepEqual(numbers, Array.from({ length: 22 }, (_, i) => i));
});

test("56 arcanos menores: 4 naipes x 14 cartas cada", () => {
  assert.equal(MINOR_ARCANA.length, 56);
  const bySuit = {};
  for (const card of MINOR_ARCANA) {
    bySuit[card.suit] = (bySuit[card.suit] || 0) + 1;
  }
  assert.deepEqual(bySuit, { paus: 14, copas: 14, espadas: 14, ouros: 14 });
});

test("nenhum id ou nome se repete no baralho completo", () => {
  const ids = TAROT_DECK.map((c) => c.id);
  const names = TAROT_DECK.map((c) => c.name);
  assert.equal(new Set(ids).size, 78, "ids devem ser únicos");
  assert.equal(new Set(names).size, 78, "nomes devem ser únicos");
});

test("toda carta tem os campos obrigatórios preenchidos", () => {
  for (const card of TAROT_DECK) {
    assert.ok(card.name, card.id);
    assert.ok(card.uprightMeaning, card.id);
    assert.ok(card.reversedMeaning, card.id);
    assert.ok(Array.isArray(card.keywords) && card.keywords.length > 0, card.id);
    assert.ok(card.icon, card.id);
  }
});
