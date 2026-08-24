const test = require('node:test');
const assert = require('node:assert/strict');

const { commitTarotDrawSnapshot } = require('../lib/tarotDrawCommit.js');

const snapshot = Object.freeze({
  createdAt: '2026-08-24T12:00:00.000Z',
  cardIds: ['major-01', 'cups-02', 'wands-03'],
});
test('falha de persistencia nao consome bonus e limpa fallback em memoria', async () => {
  const events = [];
  const result = await commitTarotDrawSnapshot({
    snapshot,
    viaBonus: true,
    savePending: async () => { events.push('save'); return false; },
    consumeBonus: async () => { events.push('consume'); return true; },
    clearPendingIfMatches: async (identity) => { events.push(['clear', identity]); return true; },
  });
  assert.deepEqual(result, { ok: false, reason: 'persist_failed' });
  assert.equal(events[0], 'save');
  assert.equal(events.some((event) => event === 'consume'), false);
  assert.deepEqual(events[1], ['clear', { createdAt: snapshot.createdAt, cardIds: snapshot.cardIds }]);
});

test('mudanca durante o await aborta antes do consumo e remove so a tentativa', async () => {
  let current = true;
  let consumed = 0;
  const result = await commitTarotDrawSnapshot({
    snapshot,
    viaBonus: true,
    isSelectionCurrent: () => current,
    savePending: async () => { current = false; return true; },
    consumeBonus: async () => { consumed += 1; return true; },
    clearPendingIfMatches: async () => true,
  });
  assert.deepEqual(result, { ok: false, reason: 'selection_changed' });
  assert.equal(consumed, 0);
});

test('bonus e consumido somente depois do snapshot duravel', async () => {
  const events = [];
  const result = await commitTarotDrawSnapshot({
    snapshot,
    viaBonus: true,
    savePending: async () => { events.push('save'); return true; },
    consumeBonus: async () => { events.push('consume'); return true; },
    clearPendingIfMatches: async () => { events.push('clear'); return true; },
  });
  assert.deepEqual(result, { ok: true, bonusConsumed: true });
  assert.deepEqual(events, ['save', 'consume']);
});

test('saldo de bonus alterado desfaz snapshot e nao inicia leitura', async () => {
  const events = [];
  const result = await commitTarotDrawSnapshot({
    snapshot,
    viaBonus: true,
    savePending: async () => { events.push('save'); return true; },
    consumeBonus: async () => { events.push('consume'); return false; },
    clearPendingIfMatches: async () => { events.push('clear'); return true; },
  });
  assert.deepEqual(result, { ok: false, reason: 'bonus_unavailable' });
  assert.deepEqual(events, ['save', 'consume', 'clear']);
});
