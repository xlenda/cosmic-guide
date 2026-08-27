"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");
const { CosmicMemoryRepository, MAX_STORED_MEMORIES } = require("../src/infrastructure/CosmicMemoryRepository");

function makeRepository() {
  const database = new Database(":memory:");
  const migration = fs.readFileSync(
    path.join(__dirname, "..", "src", "infrastructure", "migrations", "022_add_cosmic_memory.sql"),
    "utf8"
  );
  database.exec(migration);
  return { database, repository: new CosmicMemoryRepository({ database }) };
}

test("começa desligada e não guarda nada sem consentimento", (t) => {
  const { database, repository } = makeRepository();
  t.after(() => database.close());
  assert.deepEqual(repository.preference("pessoa"), {
    enabled: false,
    consentVersion: null,
    consentedAt: null,
    updatedAt: null,
  });
  assert.equal(repository.rememberChatMessage({ userId: "pessoa", message: "Quero mudar a forma como tomo decisões." }), null);
  assert.deepEqual(repository.list({ userId: "pessoa" }), []);
});

test("consentimento permite guardar, deduplicar e recuperar só o próprio conteúdo", (t) => {
  const { database, repository } = makeRepository();
  t.after(() => database.close());
  repository.setConsent({ userId: "pessoa", enabled: true, now: "2026-08-27T10:00:00Z" });
  repository.setConsent({ userId: "outra", enabled: true, now: "2026-08-27T10:00:00Z" });
  const input = { userId: "pessoa", message: "Meu trabalho novo começou esta semana e estou animada.", contexto: { intent: "work" } };
  repository.rememberChatMessage({ ...input, now: "2026-08-27T10:01:00Z" });
  repository.rememberChatMessage({ ...input, now: "2026-08-27T10:02:00Z" });
  repository.rememberChatMessage({ userId: "outra", message: "Meu assunto privado pertence somente à outra conta.", now: "2026-08-27T10:03:00Z" });

  const list = repository.list({ userId: "pessoa" });
  assert.equal(list.length, 1);
  assert.equal(list[0].occurrenceCount, 2);
  const relevant = repository.relevant({ userId: "pessoa", query: "Como vai o trabalho?", contexto: { intent: "work" } });
  assert.equal(relevant.length, 1);
  assert.doesNotMatch(relevant[0].content, /outra conta/);
});

test("desativar interrompe gravação e recuperação sem apagar silenciosamente", (t) => {
  const { database, repository } = makeRepository();
  t.after(() => database.close());
  repository.setConsent({ userId: "pessoa", enabled: true });
  repository.rememberChatMessage({ userId: "pessoa", message: "Estou construindo uma rotina nova para cuidar de mim." });
  repository.setConsent({ userId: "pessoa", enabled: false });
  repository.rememberChatMessage({ userId: "pessoa", message: "Esta segunda frase não deve ser guardada na memória." });
  assert.equal(repository.list({ userId: "pessoa" }).length, 1);
  assert.deepEqual(repository.relevant({ userId: "pessoa", query: "rotina" }), []);
});

test("apaga item, apaga tudo e remove preferência junto com a conta", (t) => {
  const { database, repository } = makeRepository();
  t.after(() => database.close());
  repository.setConsent({ userId: "pessoa", enabled: true });
  const one = repository.rememberChatMessage({ userId: "pessoa", message: "Estou escolhendo um caminho profissional diferente." });
  repository.rememberChatMessage({ userId: "pessoa", message: "Quero preservar mais tempo livre nos próximos meses." });
  assert.equal(repository.deleteOne({ userId: "outra", memoryId: one.id }), 0);
  assert.equal(repository.deleteOne({ userId: "pessoa", memoryId: one.id }), 1);
  assert.equal(repository.deleteMemories({ userId: "pessoa" }), 1);
  assert.deepEqual(repository.deleteAccountRows({ userId: "pessoa" }), { memories: 0, preferences: 1 });
  assert.equal(repository.preference("pessoa").enabled, false);
});

test("lista todas as trezentas lembrancas permitidas", (t) => {
  const { database, repository } = makeRepository();
  t.after(() => database.close());
  repository.setConsent({ userId: "pessoa", enabled: true });
  for (let index = 0; index < MAX_STORED_MEMORIES + 5; index += 1) {
    repository.rememberChatMessage({
      userId: "pessoa",
      message: `Esta e a lembranca util e diferente de numero ${index} para testar o limite.`,
      now: new Date(Date.UTC(2026, 7, 27, 10, index)).toISOString(),
    });
  }
  const memories = repository.list({ userId: "pessoa" });
  assert.equal(memories.length, MAX_STORED_MEMORIES);
  assert.match(memories[0].content, /304/);
  assert.doesNotMatch(memories.at(-1).content, /numero [0-4]\b/);
});
