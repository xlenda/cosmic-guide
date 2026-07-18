// Confirma que toda carta do baralho real tem uma imagem mapeada, e que não
// sobra nenhuma imagem "órfã" sem carta correspondente. Não dá pra `require()`
// o módulo direto aqui (test/setup.js só transforma .js via Babel — requerer
// um .jpg puro no Node quebra, só funciona de verdade dentro do Metro/RN), então
// lê o arquivo como texto e extrai as chaves via regex — ainda pega o bug real
// que importa (id de carta sem imagem, ou digitado errado).
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { TAROT_DECK } = require("../lib/tarotDeck.js");

const source = fs.readFileSync(path.join(__dirname, "../lib/tarotImages.js"), "utf8");
const mappedIds = new Set([...source.matchAll(/'([a-z]+-\d{2})':\s*require\(/g)].map((m) => m[1]));

test("toda carta do baralho real tem uma imagem mapeada em lib/tarotImages.js", () => {
  for (const card of TAROT_DECK) {
    assert.ok(mappedIds.has(card.id), `carta ${card.id} (${card.name}) não tem imagem mapeada`);
  }
});

test("não sobra nenhuma imagem mapeada sem carta correspondente no baralho", () => {
  const deckIds = new Set(TAROT_DECK.map((c) => c.id));
  for (const id of mappedIds) {
    assert.ok(deckIds.has(id), `imagem '${id}' mapeada mas não existe carta com esse id no baralho`);
  }
});

test("são exatamente 78 imagens mapeadas, uma por carta", () => {
  assert.equal(mappedIds.size, 78);
});
