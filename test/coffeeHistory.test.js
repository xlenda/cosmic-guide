// Só testa a parte pura de lib/coffeeHistory.js (sem AsyncStorage, que exige
// runtime nativo/RN e não está mockado neste harness — mesma limitação já
// aceita em lib/featureUsage.js, sem teste dedicado por esse motivo).
const test = require("node:test");
const assert = require("node:assert/strict");
const { getFallbackWeeklySummary } = require("../lib/coffeeHistory.js");

test("getFallbackWeeklySummary nunca fabrica: só lista os títulos reais recebidos", () => {
  const readings = [
    { title: "Caminhos se abrindo", body: "..." },
    { title: "Clareza depois da dúvida", body: "..." },
  ];
  const summary = getFallbackWeeklySummary(readings);
  assert.ok(summary.body.includes("Caminhos se abrindo"), summary.body);
  assert.ok(summary.body.includes("Clareza depois da dúvida"), summary.body);
  assert.equal(typeof summary.title, "string");
  assert.ok(summary.title.length > 0);
});
