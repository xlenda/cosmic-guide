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
      // Presença não basta: translate() só cai no fallback PT quando o valor é
      // null/undefined (operador ??). Valor '' ou '   ' passa direto e a tela
      // renderiza em branco — sem erro, sem teste vermelho.
      assert.equal(typeof dict[key], "string", `chave "${key}" em "${lang}" não é string`);
      assert.notEqual(dict[key].trim(), "", `chave "${key}" existe em "${lang}" mas está vazia`);
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

// PARIDADE DE PLACEHOLDER — o buraco que faltava entre os dois testes acima.
//
// Os de cima garantem que a CHAVE existe nos três idiomas e que o valor não é
// vazio. Nenhum olha DENTRO do valor. Um tradutor que escreva "Day {day} of
// {total}" onde o PT tem "{dia}" passa nos cinco testes deste arquivo, e a tela
// renderiza a chaveta literal — "{dia}" — na cara do usuário. É exatamente a
// classe de falha silenciosa que o cabeçalho deste arquivo diz querer impedir:
// nada quebra, nada dá erro, só fica ilegível pra quem não fala português.
//
// Hoje o dicionário está com ZERO divergências (conferido chave por chave), o
// que quer dizer que este teste entra verde e sem custo de correção — o valor
// dele é travar a regressão a partir de agora, mesmo espírito da asserção de
// valor vazio logo acima.
function placeholdersDe(valor) {
  return new Set([...String(valor).matchAll(/\{(\w+)\}/g)].map((m) => m[1]));
}

test("cada chave usa os MESMOS placeholders nos três idiomas", () => {
  const divergencias = [];
  for (const [chave, ptValor] of Object.entries(_DICTS_FOR_TESTS.pt)) {
    const esperados = placeholdersDe(ptValor);
    for (const lang of LANGUAGES) {
      if (lang === DEFAULT_LANGUAGE) continue;
      const achados = placeholdersDe(_DICTS_FOR_TESTS[lang][chave]);
      const faltando = [...esperados].filter((p) => !achados.has(p));
      const sobrando = [...achados].filter((p) => !esperados.has(p));
      if (faltando.length || sobrando.length) {
        divergencias.push(
          `${lang}/${chave}: falta {${faltando.join("}, {")}} · sobra {${sobrando.join("}, {")}}`
        );
      }
    }
  }
  assert.deepEqual(
    divergencias,
    [],
    `${divergencias.length} chave(s) com placeholder diferente do PT — a tela imprime a ` +
      `chaveta crua pro usuário:\n  ` + divergencias.join("\n  ")
  );
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
