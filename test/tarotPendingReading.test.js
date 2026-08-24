const test = require('node:test');
const assert = require('node:assert');
const Module = require('node:module');

const mem = new Map();
let failWrites = false;
let failRemovals = false;

const asyncStorageMock = {
  __esModule: true,
  default: {
    async getItem(key) {
      return mem.has(key) ? mem.get(key) : null;
    },
    async setItem(key, value) {
      if (failWrites) throw new Error('disk unavailable');
      mem.set(key, String(value));
    },
    async removeItem(key) {
      if (failRemovals) throw new Error('disk unavailable');
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
const storage = require('../lib/storage.js');
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
  failWrites = false;
  failRemovals = false;
  storage._reiniciarStorageParaTestes();
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

test('persiste foco, estrutura e signo sem alterar snapshots legados', async () => {
  const enriched = validSnapshot({
    focusId: 'mutuality-boundaries',
    spreadKey: 'situation-tension-next-step',
    sign: 'Escorpião',
    guideVersion: 1,
  });
  assert.strictEqual(await pending.savePendingTarotReading(enriched), true);
  const restored = await pending.getPendingTarotReading();
  assert.equal(restored.focusId, 'mutuality-boundaries');
  assert.equal(restored.spreadKey, 'situation-tension-next-step');
  assert.equal(restored.sign, 'scorpio');
  assert.equal(restored.guideVersion, 1);

  assert.strictEqual(await pending.savePendingTarotReading(validSnapshot()), true);
  const legacy = await pending.getPendingTarotReading();
  assert.equal(Object.hasOwn(legacy, 'focusId'), false);
  assert.equal(Object.hasOwn(legacy, 'spreadKey'), false);
  assert.equal(Object.hasOwn(legacy, 'sign'), false);
  assert.equal(Object.hasOwn(legacy, 'guideVersion'), false);
});

test('rejeita campos de personalização desconhecidos sem apagar tiragem válida', async () => {
  await pending.savePendingTarotReading(validSnapshot({ spreadKey: 'past-present-future', sign: 'Áries' }));
  const before = mem.get(KEY);

  assert.strictEqual(await pending.savePendingTarotReading(validSnapshot({ focusId: 'fora do contrato' })), false);
  assert.strictEqual(await pending.savePendingTarotReading(validSnapshot({ spreadKey: 'cruz-celta' })), false);
  assert.strictEqual(await pending.savePendingTarotReading(validSnapshot({ sign: 'Ofiúco' })), false);
  assert.strictEqual(await pending.savePendingTarotReading(validSnapshot({ guideVersion: 2 })), false);
  assert.equal(mem.get(KEY), before);
});

test('os doze signos chegam ao snapshot sem cair no primeiro signo', async () => {
  const signs = [
    ['Áries', 'aries'], ['Touro', 'taurus'], ['Gêmeos', 'gemini'], ['Câncer', 'cancer'],
    ['Leão', 'leo'], ['Virgem', 'virgo'], ['Libra', 'libra'], ['Escorpião', 'scorpio'],
    ['Sagitário', 'sagittarius'], ['Capricórnio', 'capricorn'], ['Aquário', 'aquarius'], ['Peixes', 'pisces'],
  ];
  for (const [sign, expectedId] of signs) {
    assert.strictEqual(await pending.savePendingTarotReading(validSnapshot({
      focusId: 'new-bond',
      spreadKey: 'past-present-future',
      sign,
      guideVersion: 1,
    })), true);
    assert.equal((await pending.getPendingTarotReading()).sign, expectedId);
  }
});

test('foco precisa pertencer ao tema e nunca cai silenciosamente no primeiro', async () => {
  assert.strictEqual(await pending.savePendingTarotReading(validSnapshot({ focusId: 'direction-purpose' })), false);
  assert.strictEqual(await pending.savePendingTarotReading(validSnapshot({ focusId: 'foo' })), false);
  assert.strictEqual(await pending.savePendingTarotReading(validSnapshot({ focusId: 'new-bond' })), true);
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

test('limite da pergunta usa caracteres visiveis, inclusive emoji', async () => {
  const accepted = '🌙'.repeat(220);
  const rejected = '🌙'.repeat(221);
  assert.strictEqual(await pending.savePendingTarotReading(validSnapshot({ question: accepted })), true);
  assert.strictEqual((await pending.getPendingTarotReading()).question, accepted);
  assert.strictEqual(await pending.savePendingTarotReading(validSnapshot({ question: rejected })), false);
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

test('clear condicional nao apaga uma tiragem mais nova', async () => {
  const oldReading = validSnapshot();
  const newReading = validSnapshot({
    createdAt: '2026-08-23T12:01:00.000Z',
    cardIds: ['major-01', 'cups-04', 'wands-09'],
  });
  await pending.savePendingTarotReading(oldReading);
  await pending.savePendingTarotReading(newReading);

  assert.strictEqual(await pending.clearPendingTarotReadingIfMatches({
    createdAt: oldReading.createdAt,
    cardIds: oldReading.cardIds,
  }), false);
  assert.deepStrictEqual((await pending.getPendingTarotReading()).cardIds, newReading.cardIds);

  assert.strictEqual(await pending.clearPendingTarotReadingIfMatches({
    createdAt: newReading.createdAt,
    cardIds: newReading.cardIds,
  }), true);
  assert.strictEqual(await pending.getPendingTarotReading(), null);
});

test('save e clear nao informam persistencia quando ficaram apenas em memoria', async () => {
  failWrites = true;
  assert.strictEqual(await pending.savePendingTarotReading(validSnapshot()), false);
  assert.deepStrictEqual((await pending.getPendingTarotReading()).cardIds, validSnapshot().cardIds);

  // Reinicia o modo de disco para isolar a falha de remoção da falha anterior.
  storage._reiniciarStorageParaTestes();
  failWrites = false;
  await pending.savePendingTarotReading(validSnapshot());
  failRemovals = true;
  assert.strictEqual(await pending.clearPendingTarotReading(), false);
});

test('update nao informa sucesso quando a escrita duravel falha', async () => {
  await pending.savePendingTarotReading(validSnapshot({ revealed: [false, false, false] }));
  failWrites = true;
  assert.strictEqual(await pending.updatePendingTarotRevealed([true, false, false]), null);
});
