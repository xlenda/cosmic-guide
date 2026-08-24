const test = require('node:test');
const assert = require('node:assert');
const Module = require('node:module');

const mem = new Map();

const asyncStorageMock = {
  __esModule: true,
  default: {
    async getItem(key) {
      return mem.has(key) ? mem.get(key) : null;
    },
    async setItem(key, value) {
      mem.set(key, String(value));
    },
    async removeItem(key) {
      mem.delete(key);
    },
  },
};

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return asyncStorageMock;
  return originalLoad.call(this, request, parent, isMain);
};

const pending = require('../lib/tarotPendingReading.js');
const KEY = pending.PENDING_TAROT_READING_KEY;

function validSnapshot(extra = {}) {
  return {
    themeKey: 'Amor',
    cardIds: ['major-17', 'cups-03', 'wands-10'],
    orientations: [false, true, false],
    revealed: [true, false, false],
    question: 'O que merece a minha atenção agora?',
    outcome: 'clarity',
    lang: 'pt',
    createdAt: '2026-08-23T12:00:00.000Z',
    ...extra,
  };
}

test.beforeEach(async () => {
  mem.clear();
  await pending.clearPendingTarotReading();
});

test('salva um snapshot normalizado e restaura exatamente a mesma tiragem', async () => {
  const input = validSnapshot({ question: '  Minha pergunta  ', cardIds: [' major-17 ', 'cups-03', 'wands-10'] });

  assert.strictEqual(await pending.savePendingTarotReading(input), true);
  const restored = await pending.getPendingTarotReading();

  assert.deepStrictEqual(restored, {
    version: 1,
    themeKey: 'Amor',
    cardIds: ['major-17', 'cups-03', 'wands-10'],
    orientations: [false, true, false],
    revealed: [true, false, false],
    question: 'Minha pergunta',
    outcome: 'clarity',
    lang: 'pt',
    createdAt: '2026-08-23T12:00:00.000Z',
  });
  assert.deepStrictEqual(JSON.parse(mem.get(KEY)), restored, 'o registro no storage precisa ser versionado');
});

test('aceita os cinco temas, quatro outcomes, tres idiomas e createdAt numerico', async () => {
  const themes = ['Amor', 'Carreira', 'Dinheiro', 'Energia', 'Saúde'];
  const outcomes = ['clarity', 'nextStep', 'patterns', 'timing'];
  const languages = ['pt', 'es', 'en'];

  for (let i = 0; i < themes.length; i += 1) {
    const snapshot = validSnapshot({
      themeKey: themes[i],
      outcome: outcomes[i % outcomes.length],
      lang: languages[i % languages.length],
      createdAt: 1787486400000 + i,
      question: '',
    });
    assert.strictEqual(await pending.savePendingTarotReading(snapshot), true);
    assert.strictEqual((await pending.getPendingTarotReading()).themeKey, themes[i]);
  }
});

test('registro corrompido retorna null e e removido do storage', async () => {
  const corruptedValues = [
    '{nao-e-json',
    JSON.stringify(validSnapshot({ version: 2 })),
    JSON.stringify({ ...validSnapshot(), version: 1, cardIds: ['major-17', 'major-17', 'cups-03'] }),
    JSON.stringify({ ...validSnapshot(), version: 1, orientations: [false, 'false', true] }),
    JSON.stringify({ ...validSnapshot(), version: 1, question: 'x'.repeat(221) }),
    JSON.stringify({ ...validSnapshot(), version: 1, outcome: 'prediction' }),
  ];

  for (const raw of corruptedValues) {
    mem.set(KEY, raw);
    assert.strictEqual(await pending.getPendingTarotReading(), null);
    assert.strictEqual(mem.has(KEY), false, `registro corrompido nao removido: ${raw.slice(0, 40)}`);
  }
});

test('snapshot invalido nao substitui uma tiragem valida ja salva', async () => {
  await pending.savePendingTarotReading(validSnapshot());
  const before = mem.get(KEY);

  assert.strictEqual(await pending.savePendingTarotReading(validSnapshot({ themeKey: 'Futuro' })), false);
  assert.strictEqual(await pending.savePendingTarotReading(validSnapshot({ cardIds: ['ok', null, 'tambem-ok'] })), false);
  assert.strictEqual(mem.get(KEY), before);
});

test('update altera somente as reveladas, persiste e rejeita triplas invalidas', async () => {
  await pending.savePendingTarotReading(validSnapshot());

  const updated = await pending.updatePendingTarotRevealed([true, true, false]);
  assert.deepStrictEqual(updated.revealed, [true, true, false]);
  assert.deepStrictEqual(updated.orientations, [false, true, false]);
  assert.strictEqual(updated.question, 'O que merece a minha atenção agora?');
  assert.deepStrictEqual((await pending.getPendingTarotReading()).revealed, [true, true, false]);

  const before = mem.get(KEY);
  assert.strictEqual(await pending.updatePendingTarotRevealed([true, false]), null);
  assert.strictEqual(await pending.updatePendingTarotRevealed([true, 1, false]), null);
  assert.strictEqual(mem.get(KEY), before);
});

test('mutacoes concorrentes sao serializadas e nao ressuscitam estado antigo', async () => {
  await pending.savePendingTarotReading(validSnapshot({ revealed: [false, false, false] }));

  const first = pending.updatePendingTarotRevealed([true, false, false]);
  const second = pending.updatePendingTarotRevealed([true, true, false]);
  await Promise.all([first, second]);

  assert.deepStrictEqual((await pending.getPendingTarotReading()).revealed, [true, true, false]);
});

test('clear remove a tiragem e update sem snapshot e inofensivo', async () => {
  await pending.savePendingTarotReading(validSnapshot());
  assert.ok(mem.has(KEY));

  assert.strictEqual(await pending.clearPendingTarotReading(), true);
  assert.strictEqual(mem.has(KEY), false);
  assert.strictEqual(await pending.getPendingTarotReading(), null);
  assert.strictEqual(await pending.updatePendingTarotRevealed([true, true, true]), null);
});
