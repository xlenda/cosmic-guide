// Garante que o novo tema Saúde (e os 4 já existentes) tem um template real
// pra cada categoria de carta (4 naipes + arcanos maiores), sem placeholder
// sobrando no texto final.
const test = require("node:test");
const assert = require("node:assert/strict");
const { getThemedMeaning, THEME_KEYS } = require("../lib/tarotThemes.js");
const { TAROT_DECK } = require("../lib/tarotDeck.js");

test("THEME_KEYS inclui Saúde além dos 4 temas originais", () => {
  assert.deepEqual(THEME_KEYS, ["Amor", "Carreira", "Dinheiro", "Energia", "Saúde"]);
});

test("getThemedMeaning nunca deixa placeholder {..} sobrando, pra nenhum tema x categoria de carta", () => {
  // Uma carta de cada categoria: maior, e uma de cada naipe.
  const sampleCards = [
    TAROT_DECK.find((c) => c.arcana === "maior"),
    TAROT_DECK.find((c) => c.suit === "paus"),
    TAROT_DECK.find((c) => c.suit === "copas"),
    TAROT_DECK.find((c) => c.suit === "espadas"),
    TAROT_DECK.find((c) => c.suit === "ouros"),
  ];
  for (const theme of THEME_KEYS) {
    for (const card of sampleCards) {
      const text = getThemedMeaning(card, theme, false);
      assert.ok(text.length > 20, `tema=${theme} carta=${card.name}: texto muito curto`);
      assert.ok(!/\{[a-z2]+\}/.test(text), `tema=${theme} carta=${card.name}: sobrou placeholder em "${text}"`);
    }
  }
});

test("getThemedMeaning(theme='Saúde') usa reversedMeaning quando isReversed=true", () => {
  const card = TAROT_DECK.find((c) => c.arcana === "maior");
  const upright = getThemedMeaning(card, "Saúde", false);
  const reversed = getThemedMeaning(card, "Saúde", true);
  assert.notEqual(upright, reversed);
});
