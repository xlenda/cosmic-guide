const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizeSocialUserId } = require("../src/infrastructure/normalizeSocialUserId");

test("normaliza C0, C1 e caracteres invisíveis sem mudar a identidade", () => {
  assert.equal(normalizeSocialUserId(" \u0000\u200Buser-123\u0009 "), "user-123");
  assert.equal(normalizeSocialUserId("\u0085user-123\uFEFF"), "user-123");
});

test("rejeita vazio, espaço interno e IDs acima do limite em vez de truncar", () => {
  assert.equal(normalizeSocialUserId(null), null);
  assert.equal(normalizeSocialUserId("\u0000\u200B"), null);
  assert.equal(normalizeSocialUserId("duas pessoas"), null);
  assert.equal(normalizeSocialUserId("x".repeat(65)), null);
});
