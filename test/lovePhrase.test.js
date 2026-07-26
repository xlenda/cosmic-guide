// Paridade das frases do dia entre PT/ES/EN — os 3 arrays precisam ter o
// MESMO tamanho porque o índice do dia é o mesmo pros 3 idiomas (a frase do
// dia é a mesma ideia traduzida, não um sorteio separado por idioma). Um
// array desalinhado faria um casal com idiomas diferentes compartilhar
// frases diferentes no mesmo dia.
const test = require("node:test");
const assert = require("node:assert/strict");
const { getTodaysLovePhrase, _PHRASES_FOR_TESTS } = require("../lib/lovePhrase.js");

test("os 3 idiomas têm exatamente o mesmo número de frases", () => {
  const { pt, es, en } = _PHRASES_FOR_TESTS;
  assert.equal(es.length, pt.length, `es tem ${es.length}, pt tem ${pt.length}`);
  assert.equal(en.length, pt.length, `en tem ${en.length}, pt tem ${pt.length}`);
});

test("nenhuma frase é vazia ou duplicada dentro do mesmo idioma", () => {
  for (const [lang, phrases] of Object.entries(_PHRASES_FOR_TESTS)) {
    for (const p of phrases) {
      assert.ok(typeof p === "string" && p.trim().length > 10, `frase suspeita em ${lang}: "${p}"`);
    }
    assert.equal(new Set(phrases).size, phrases.length, `frase duplicada em ${lang}`);
  }
});

test("é determinístico no mesmo dia e cai pro PT em idioma desconhecido", () => {
  assert.equal(getTodaysLovePhrase("pt"), getTodaysLovePhrase("pt"));
  assert.equal(getTodaysLovePhrase("xx"), getTodaysLovePhrase("pt"));
  assert.equal(getTodaysLovePhrase(), getTodaysLovePhrase("pt"));
});

test("a frase do dia é o mesmo índice nos 3 idiomas", () => {
  const { pt, es, en } = _PHRASES_FOR_TESTS;
  const idx = pt.indexOf(getTodaysLovePhrase("pt"));
  assert.ok(idx >= 0);
  assert.equal(getTodaysLovePhrase("es"), es[idx]);
  assert.equal(getTodaysLovePhrase("en"), en[idx]);
});
