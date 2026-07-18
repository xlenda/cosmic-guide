// Garante paridade de chaves entre PT/ES/EN — sem isso, uma chave esquecida
// num idioma cairia silenciosamente pro fallback em PT (translate() nunca
// lança), e ninguém notaria até ver o app em espanhol/inglês com texto em
// português no meio.
const test = require("node:test");
const assert = require("node:assert/strict");
const { translate, LANGUAGES, DEFAULT_LANGUAGE, _DICTS_FOR_TESTS } = require("../lib/i18n.js");

test("LANGUAGES inclui pt, es e en", () => {
  assert.deepEqual([...LANGUAGES].sort(), ["en", "es", "pt"]);
});

test("todas as chaves do PT existem em ES e EN também (nenhuma cai no fallback silencioso)", () => {
  const ptKeys = Object.keys(_DICTS_FOR_TESTS.pt);
  assert.ok(ptKeys.length > 0);
  for (const lang of LANGUAGES) {
    const dict = _DICTS_FOR_TESTS[lang];
    for (const key of ptKeys) {
      assert.ok(key in dict, `chave "${key}" existe em pt mas falta em "${lang}"`);
    }
  }
});

test("nenhum idioma tem chave a mais que não existe no PT (dicionários não divergem)", () => {
  const ptKeys = new Set(Object.keys(_DICTS_FOR_TESTS.pt));
  for (const lang of LANGUAGES) {
    for (const key of Object.keys(_DICTS_FOR_TESTS[lang])) {
      assert.ok(ptKeys.has(key), `chave "${key}" existe em "${lang}" mas não em pt`);
    }
  }
});

test("interpolação de variáveis funciona em todos os idiomas", () => {
  for (const lang of LANGUAGES) {
    const value = translate(lang, "home.greetingCouple", { voce: "Ana", amor: "Léo" });
    assert.ok(value.includes("Ana") && value.includes("Léo"), `${lang}: ${value}`);
  }
});

test("chave desconhecida nunca lança — devolve a própria chave", () => {
  assert.equal(translate(DEFAULT_LANGUAGE, "chave.que.nao.existe"), "chave.que.nao.existe");
});

test("idioma desconhecido cai pro DEFAULT_LANGUAGE sem lançar", () => {
  const value = translate("fr", "quiz.headerTitle");
  assert.equal(value, translate(DEFAULT_LANGUAGE, "quiz.headerTitle"));
});
