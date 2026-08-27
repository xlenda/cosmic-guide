const test = require("node:test");
const assert = require("node:assert/strict");
const {
  assessCommunityContent,
  normalizeForSafety,
} = require("../src/application/communityContentSafety");

test("normaliza caixa e acentos sem modificar a entrada", () => {
  const original = "  VOCÊ está bem?  ";
  assert.equal(normalizeForSafety(original), "voce esta bem?");
  assert.equal(original, "  VOCÊ está bem?  ");
});

test("bloqueia ameaças diretas em pt, es e en", () => {
  for (const content of ["Eu vou te matar", "Te voy a matar", "I will hurt you"]) {
    const result = assessCommunityContent(content);
    assert.equal(result.allowed, false, content);
    assert.equal(result.reason, "credible_threat", content);
  }
});

test("bloqueia exploração sexual e solicitação explícita", () => {
  assert.equal(assessCommunityContent("manda nudes").allowed, false);
  assert.equal(assessCommunityContent("child pornography").allowed, false);
  assert.equal(assessCommunityContent("nudes de menor").allowed, false);
});

test("bloqueia rajadas de links e caracteres usadas como spam", () => {
  assert.equal(
    assessCommunityContent("https://a.test https://b.test https://c.test https://d.test").reason,
    "link_spam"
  );
  assert.equal(assessCommunityContent("olá!!!!!!!!!!!!!!!").reason, "character_spam");
});

test("não bloqueia conversa legítima sobre tarô, morte simbólica ou conflito", () => {
  for (const content of [
    "A carta da Morte fala de fim de ciclo, não de morte literal.",
    "Estou com raiva e preciso conversar sem machucar ninguém.",
    "Meu signo e o seu entram em conflito; como a gente conversa melhor?",
    "Fonte: https://cosmicguide.cloud/cosmic-guide/",
  ]) {
    assert.deepEqual(assessCommunityContent(content), { allowed: true }, content);
  }
});
