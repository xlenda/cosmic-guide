// Valida que o pensamento do dia usa dado astronômico REAL (mesmas datas de
// referência já validadas em test/lunarCalendar.test.js), não frase solta.
const test = require("node:test");
const assert = require("node:assert/strict");
const { getThoughtForDate, rulerOfDay } = require("../lib/dailyThought.js");

test("lua cheia conhecida (25/jan/2024) aparece de verdade no texto", () => {
  const thought = getThoughtForDate(new Date("2024-01-25T17:54:00Z"));
  assert.ok(thought.includes("Lua Cheia"), thought);
});

test("lua nova conhecida (11/jan/2024) aparece de verdade no texto", () => {
  const thought = getThoughtForDate(new Date("2024-01-11T11:57:00Z"));
  assert.ok(thought.includes("Lua Nova"), thought);
});

test("inclui o signo real da Lua quando disponível", () => {
  const thought = getThoughtForDate(new Date("2024-01-25T17:54:00Z"));
  assert.ok(/A Lua está em [A-ZÁÊÔÍÚ][a-záêôíúçã]+/.test(thought), thought);
});

test("é determinístico: mesma data sempre devolve o mesmo texto", () => {
  const a = getThoughtForDate(new Date("2024-03-10T12:00:00Z"));
  const b = getThoughtForDate(new Date("2024-03-10T12:00:00Z"));
  assert.equal(a, b);
});

test("datas diferentes tendem a gerar textos diferentes (fase/signo mudam de verdade)", () => {
  const d1 = getThoughtForDate(new Date("2024-01-11T12:00:00Z"));
  const d2 = getThoughtForDate(new Date("2024-01-25T12:00:00Z"));
  assert.notEqual(d1, d2);
});

test("signo pessoal (opcional) aparece no início do texto quando informado", () => {
  const date = new Date("2024-01-25T17:54:00Z");
  const thought = getThoughtForDate(date, { name: "Touro", icon: "♉" });
  assert.ok(thought.startsWith("♉ Touro,"), thought);
  assert.ok(thought.includes("Lua Cheia"), thought);
});

test("sem signo pessoal, o texto continua igual ao de antes (compatibilidade)", () => {
  const date = new Date("2024-01-25T17:54:00Z");
  const semSigno = getThoughtForDate(date);
  const comSignoNulo = getThoughtForDate(date, null);
  assert.equal(semSigno, comSignoNulo);
});

test("rulerOfDay bate com a regência tradicional real do dia da semana (calendário real, não chutado)", () => {
  assert.equal(rulerOfDay(new Date(2024, 0, 7)).planet, "Sol", "07/jan/2024 é domingo");
  assert.equal(rulerOfDay(new Date(2024, 0, 10)).planet, "Mercúrio", "10/jan/2024 é quarta");
  assert.equal(rulerOfDay(new Date(2024, 0, 12)).planet, "Vênus", "12/jan/2024 é sexta");
  assert.equal(rulerOfDay(new Date(2024, 0, 13)).planet, "Saturno", "13/jan/2024 é sábado");
});

test("o texto sempre inclui a frase do regente do dia", () => {
  const thought = getThoughtForDate(new Date(2024, 0, 12, 12, 0, 0));
  assert.ok(thought.includes("Hoje é dia de Vênus"), thought);
});

test("a ponte pro dia seguinte aponta pro regente real de amanhã (sexta -> sábado = Saturno)", () => {
  const thought = getThoughtForDate(new Date(2024, 0, 12, 12, 0, 0));
  assert.ok(thought.includes("Amanhã Saturno"), thought);
});

test("a ponte do sábado fecha o ciclo real da semana apontando pro Sol de domingo", () => {
  const thought = getThoughtForDate(new Date(2024, 0, 13, 12, 0, 0));
  assert.ok(thought.includes("Amanhã o ciclo recomeça com o Sol"), thought);
});

test("inclui aviso de Mercúrio retrógrado quando a data cai num período retrógrado real (15/abr/2024)", () => {
  const thought = getThoughtForDate(new Date(2024, 3, 15, 12, 0, 0));
  assert.ok(thought.includes("Mercúrio retrógrado"), thought);
});

test("não inclui aviso de Mercúrio retrógrado fora dos períodos reais (01/jun/2024)", () => {
  const thought = getThoughtForDate(new Date(2024, 5, 1, 12, 0, 0));
  assert.ok(!thought.includes("Mercúrio retrógrado"), thought);
});
