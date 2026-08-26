const test = require('node:test');
const assert = require('node:assert/strict');

const { buildCosmicMirror, cosmicMirrorPack } = require('../lib/cosmicMirror.js');

function tarotEntry({ date, themeKey = 'Amor', cards, question = 'SEGREDO', reflection = 'PRIVADO' }) {
  return {
    type: 'tarot',
    date,
    question,
    reflection,
    readingDetails: {
      themeKey,
      cards: cards.map(([id, reversed = false]) => ({ id, reversed })),
    },
  };
}

test('Espelho Cósmico mede apenas tiragens reais dentro do período', () => {
  const now = new Date('2026-08-26T12:00:00.000Z').getTime();
  const entries = [
    tarotEntry({ date: '2026-08-25T12:00:00.000Z', cards: [['major-00'], ['major-01', true], ['copas-01']] }),
    tarotEntry({ date: '2026-08-20T12:00:00.000Z', themeKey: 'Energia', cards: [['major-00'], ['copas-02'], ['copas-03']] }),
    tarotEntry({ date: '2026-07-01T12:00:00.000Z', cards: [['major-02']] }),
    { type: 'coffee', date: '2026-08-25T12:00:00.000Z', readingDetails: { cards: [{ id: 'major-00' }] } },
  ];

  const mirror = buildCosmicMirror(entries, { period: 7, now, lang: 'pt' });
  assert.equal(mirror.status, 'pattern');
  assert.equal(mirror.readingCount, 2);
  assert.equal(mirror.cardCount, 6);
  assert.equal(mirror.uniqueCardCount, 5);
  assert.equal(mirror.reversedCount, 1);
  assert.equal(mirror.topCard.key, 'major-00');
  assert.equal(mirror.topCard.count, 2);
});

test('pergunta e reflexão privadas nunca entram no recibo nem no compartilhamento', () => {
  const mirror = buildCosmicMirror(
    [tarotEntry({ date: '2026-08-25T12:00:00.000Z', cards: [['major-00']] })],
    { period: 30, now: new Date('2026-08-26T12:00:00.000Z').getTime(), lang: 'pt' }
  );

  assert.ok(mirror.shareText);
  assert.ok(!mirror.shareText.includes('SEGREDO'));
  assert.ok(!mirror.shareText.includes('PRIVADO'));
  assert.match(mirror.receipt, /não usa pergunta nem reflexão privada/i);
});

test('estado vazio não inventa padrão nem conteúdo compartilhável', () => {
  const mirror = buildCosmicMirror([], { period: 'all', lang: 'en' });
  assert.equal(mirror.status, 'empty');
  assert.equal(mirror.readingCount, 0);
  assert.equal(mirror.shareText, '');
  assert.equal(mirror.topCard, null);
});

test('empate e cartas vistas só uma vez não viram dominância ou recorrência inventada', () => {
  const now = new Date('2026-08-26T12:00:00.000Z').getTime();
  const mirror = buildCosmicMirror([
    tarotEntry({ date: '2026-08-25T12:00:00.000Z', themeKey: 'Amor', cards: [['major-00'], ['copas-01'], ['espadas-01']] }),
    tarotEntry({ date: '2026-08-24T12:00:00.000Z', themeKey: 'Energia', cards: [['major-01'], ['copas-02'], ['espadas-02']] }),
  ], { period: 7, now, lang: 'pt' });

  assert.equal(mirror.status, 'developing');
  assert.equal(mirror.topCard, null);
  assert.equal(mirror.topSuit, null);
  assert.equal(mirror.topTheme, null);
  assert.match(mirror.body, /nenhuma repetição lidera sem empate/i);
  assert.ok(!/mais voltou \(1×\)/.test(mirror.body));
});

test('packs PT/ES/EN têm o mesmo contrato e pluralização humana', () => {
  const keys = Object.keys(cosmicMirrorPack('pt')).sort();
  for (const lang of ['pt', 'es', 'en']) {
    const pack = cosmicMirrorPack(lang);
    assert.deepEqual(Object.keys(pack).sort(), keys);
    const receipt = pack.receiptBody({ readings: 1, cards: 1, period: pack.periods[7] });
    assert.ok(!/\(s\)|\(ns\)/i.test(receipt));
    assert.ok(receipt.length > 30);
  }
});

test('histórico total é rotulado como disponível e declara a retenção real', () => {
  for (const lang of ['pt', 'es', 'en']) {
    const pack = cosmicMirrorPack(lang);
    assert.ok(!/todo o período|todo el período|all time/i.test(pack.periods.all));
    const receipt = pack.receiptBody({ readings: 2, cards: 6, period: pack.periods.all });
    assert.match(receipt, /200/);
    assert.match(receipt, /favorit/i);
  }
});

test('Arcanos Maiores não são rotulados como naipe', () => {
  for (const lang of ['pt', 'es', 'en']) {
    const label = cosmicMirrorPack(lang).metrics.suit;
    assert.ok(!/naipe|palo|suit/i.test(label));
  }
});
