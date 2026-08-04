const test = require("node:test");
const assert = require("node:assert/strict");
process.env.ANTHROPIC_API_KEY = "sk-fake-para-teste";
const mod = require("../src/infrastructure/AnthropicChatProvider");
const Provider = mod.AnthropicChatProvider || mod;

function texto(blocos) { return blocos.find((b) => b.type === "text").text; }

test("es e en carregam a diretriz; pt nao gasta um token com ela", () => {
  const es = texto(Provider.userContent({ instrucao: "Leia a mao.", lang: "es" }));
  assert.ok(es.includes("español"), "es precisa pedir espanhol");
  const en = texto(Provider.userContent({ instrucao: "Leia a mao.", lang: "en" }));
  assert.ok(en.includes("English"), "en precisa pedir ingles");
  const pt = texto(Provider.userContent({ instrucao: "Leia a mao.", lang: "pt" }));
  assert.equal(pt, "Leia a mao.", "pt fica identico ao de antes de 03/08/2026");
});

test("lang ausente ou invalido nao muda nada (o padrao continua sendo pt)", () => {
  assert.equal(texto(Provider.userContent({ instrucao: "X" })), "X");
  assert.equal(texto(Provider.userContent({ instrucao: "X", lang: "fr" })), "X");
  assert.equal(texto(Provider.userContent({ instrucao: "X", lang: "__proto__" })), "X");
});

test("a diretriz vem DEPOIS do contexto e da instrucao, nunca no meio", () => {
  const t = texto(Provider.userContent({ instrucao: "Interprete.", contexto: { nome: "Ana" }, lang: "en" }));
  assert.ok(t.indexOf("Interprete.") < t.indexOf("IMPORTANT"), "instrucao antes da diretriz");
});
