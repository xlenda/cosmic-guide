// Testa o contrato "nunca fabricar" (funções sensíveis devolvem null sem dado
// real) e a estrutura das Casas/Aspectos — ver skills/new-app-playbook/
// sensitive-calculations.md. Roda via node:test + @babel/register (test/setup.js).
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  signoFromDate,
  moonSign,
  ascendantSign,
  houses,
  aspects,
  planetPositions,
  cosmicNumbers,
  SIGNS,
} = require("../lib/signs.js");

test("signoFromDate rejeita data impossível (round-trip de calendário)", () => {
  // 2023 não é bissexto — new Date('2023-02-29') rola silenciosamente pro dia
  // 1º de março em JS puro; parseStrictDate precisa recusar isso.
  assert.equal(signoFromDate("2023-02-29"), null);
});

test("signoFromDate aceita data real e devolve o nome de um signo válido", () => {
  // signoFromDate devolve o NOME (string) do signo, diferente de ascendantSign/
  // moonSign/houses() que devolvem o objeto de SIGNS — contrato pré-existente
  // do módulo, preservado aqui como está (outras telas já dependem de cada shape).
  const signo = signoFromDate("1990-05-15");
  assert.ok(SIGNS.some((s) => s.name === signo), `esperado um nome de SIGNS válido, veio "${signo}"`);
});

test("moonSign devolve null sem data ou com data inválida", () => {
  assert.equal(moonSign(null), null);
  assert.equal(moonSign("2023-02-30"), null);
});

test("ascendantSign nunca fabrica: exige hora, latitude e longitude reais", () => {
  assert.equal(ascendantSign("1990-05-15", null, -23.5, -46.6, -3), null, "sem hora");
  assert.equal(ascendantSign("1990-05-15", "08:00", null, -46.6, -3), null, "sem latitude");
  assert.equal(ascendantSign("1990-05-15", "08:00", -23.5, undefined, -3), null, "sem longitude");
  assert.equal(ascendantSign("2023-02-29", "08:00", -23.5, -46.6, -3), null, "data impossível");
});

test("ascendantSign devolve um signo válido quando todos os dados reais estão presentes", () => {
  // ascendantSign devolve o OBJETO de SIGNS (não só o nome) — ver nota em
  // signoFromDate acima sobre os dois contratos de retorno distintos.
  const signo = ascendantSign("1990-05-15", "08:00", -23.5, -46.6, -3);
  assert.ok(SIGNS.some((s) => s.name === signo.name), `esperado um SIGNS válido, veio "${JSON.stringify(signo)}"`);
});

test("houses() devolve null sem dado real (mesmo contrato de ascendantSign)", () => {
  assert.equal(houses("1990-05-15", null, -23.5, -46.6, -3), null);
});

test("houses() devolve exatamente 12 casas sequenciais a partir do signo ascendente", () => {
  const asc = ascendantSign("1990-05-15", "08:00", -23.5, -46.6, -3);
  const result = houses("1990-05-15", "08:00", -23.5, -46.6, -3);
  assert.equal(result.length, 12);
  assert.equal(result[0].houseNumber, 1);
  assert.equal(result[0].sign, asc, "Casa 1 tem que ser o próprio signo do Ascendente (Casas Inteiras)");
  // Sequência cíclica: cada casa é o próximo signo do zodíaco.
  const ascIdx = SIGNS.indexOf(asc);
  for (let i = 0; i < 12; i++) {
    assert.equal(result[i].sign, SIGNS[(ascIdx + i) % 12], `Casa ${i + 1}`);
  }
});

test("planetPositions() devolve null sem data, e as 10 posições clássicas com data real", () => {
  assert.equal(planetPositions(null), null);
  const result = planetPositions("1990-05-15", "08:00");
  assert.equal(result.length, 10);
  for (const p of result) {
    assert.ok(typeof p.longitude === "number" && p.longitude >= 0 && p.longitude < 360, p.name);
  }
});

test("aspects() devolve null sem data, e um array (possivelmente vazio) com data real", () => {
  assert.equal(aspects(null), null);
  const result = aspects("1990-05-15", "08:00");
  assert.ok(Array.isArray(result));
});

test("cosmicNumbers nunca devolve mais que 99 números (clamp)", () => {
  const result = cosmicNumbers("teste", 500);
  assert.ok(result.length <= 99, `esperado <= 99, veio ${result.length}`);
});

test("cosmicNumbers é determinístico pro mesmo seed (mesma leitura ao reabrir a tela)", () => {
  const a = cosmicNumbers("casal-x", 5);
  const b = cosmicNumbers("casal-x", 5);
  assert.deepEqual(a, b);
});
