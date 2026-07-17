// Valida getMoonPhase contra os mesmos casos de referência REAIS já
// documentados/spot-checados no cabeçalho de lib/lunarCalendar.js (lua cheia e
// lua nova conhecidas de 2024) — ver skills/new-app-playbook/sensitive-calculations.md,
// Regra 1: nunca confiar em "rodou sem erro", validar contra um caso conhecido.
const test = require("node:test");
const assert = require("node:assert/strict");
const { getMoonPhase } = require("../lib/lunarCalendar.js");

test("lua cheia conhecida (25/jan/2024 17:54 UTC) é classificada como Lua Cheia com iluminação alta", () => {
  const result = getMoonPhase(new Date("2024-01-25T17:54:00Z"));
  assert.ok(result, "astronomy-engine precisa estar disponível pro teste rodar");
  assert.equal(result.name, "Lua Cheia");
  assert.ok(result.illumination >= 95, `esperado >=95% de iluminação, veio ${result.illumination}`);
});

test("lua nova conhecida (11/jan/2024 11:57 UTC) é classificada como Lua Nova com iluminação baixa", () => {
  const result = getMoonPhase(new Date("2024-01-11T11:57:00Z"));
  assert.ok(result);
  assert.equal(result.name, "Lua Nova");
  assert.ok(result.illumination <= 5, `esperado <=5% de iluminação, veio ${result.illumination}`);
});

test("getMoonPhase devolve null pra data inválida (nunca fabrica)", () => {
  assert.equal(getMoonPhase(new Date("data-invalida")), null);
});

test("todas as 8 fases têm nome, emoji e reflexão", () => {
  // 8 instantes espaçados 1/8 do ciclo sinódico (~29.53 dias) a partir da lua
  // nova conhecida acima — cobre as 8 fatias de PHASES sem depender de outra
  // efeméride externa.
  const newMoon = new Date("2024-01-11T11:57:00Z").getTime();
  const synodicMs = 29.53 * 24 * 60 * 60 * 1000;
  const seen = new Set();
  for (let i = 0; i < 8; i++) {
    const d = new Date(newMoon + (i / 8) * synodicMs);
    const result = getMoonPhase(d);
    assert.ok(result.name, `fase ${i}`);
    assert.ok(result.emoji, `fase ${i}`);
    assert.ok(result.reflexao, `fase ${i}`);
    seen.add(result.name);
  }
  assert.equal(seen.size, 8, "as 8 fatias devem cobrir as 8 fases distintas");
});
