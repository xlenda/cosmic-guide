const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const fs = require('node:fs');
const path = require('node:path');

const memory = new Map();
const asyncStorageMock = {
  __esModule: true,
  default: {
    async getItem(key) { return memory.has(key) ? memory.get(key) : null; },
    async setItem(key, value) { memory.set(key, String(value)); },
    async removeItem(key) { memory.delete(key); },
  },
};

const originalLoad = Module._load;
Module._load = function load(request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return asyncStorageMock;
  return originalLoad.call(this, request, parent, isMain);
};

const storage = require('../lib/storage.js');
const album = require('../lib/tarotCollection.js');
const { TAROT_DECK } = require('../lib/tarotDeck.js');
const { cardMatchesAlbumFilter, formatAlbumDate, tarotAlbum2Pack } = require('../lib/tarotAlbum2.js');

function resetStorage() {
  memory.clear();
  storage._reiniciarStorageParaTestes();
}

test('cada revelação cria um encontro idempotente com orientação e data', async () => {
  resetStorage();
  const cardId = TAROT_DECK[0].id;
  const first = await album.recordCardEncounter({
    cardId,
    reversed: false,
    occurredAt: '2026-08-25T10:00:00.000Z',
    occurrenceId: 'reading-1:card:0',
  });
  const duplicate = await album.recordCardEncounter({
    cardId,
    reversed: false,
    occurredAt: '2026-08-25T10:00:00.000Z',
    occurrenceId: 'reading-1:card:0',
  });
  await album.recordCardEncounter({
    cardId,
    reversed: true,
    occurredAt: '2026-08-26T10:00:00.000Z',
    occurrenceId: 'reading-2:card:1',
  });

  const state = await album.getAlbumState();
  assert.equal(first.created, true);
  assert.equal(duplicate.reason, 'duplicate');
  assert.equal(state.encounterStats[cardId].count, 2);
  assert.equal(state.encounterStats[cardId].uprightCount, 1);
  assert.equal(state.encounterStats[cardId].reversedCount, 1);
  assert.equal(state.encounterStats[cardId].firstSeenAt, '2026-08-25T10:00:00.000Z');
  assert.equal(state.encounterStats[cardId].lastSeenAt, '2026-08-26T10:00:00.000Z');
  assert.ok(state.seenIds.includes(cardId));
});

test('carta legada continua vista sem ganhar uma data histórica inventada', async () => {
  resetStorage();
  const cardId = TAROT_DECK[1].id;
  await album.recordCardsSeen([cardId]);
  const before = await album.getAlbumState();
  assert.equal(before.encounterStats[cardId], undefined);

  await album.recordCardEncounter({
    cardId,
    occurrenceId: 'new-reading:card:0',
    occurredAt: '2026-08-26T11:00:00.000Z',
  });
  const after = await album.getAlbumState();
  assert.equal(after.encounterStats[cardId].legacyBaseline, true);
  assert.equal(after.encounterStats[cardId].firstSeenAt, '2026-08-26T11:00:00.000Z');
});

test('retomada repara o índice seen se o app fechou entre as duas escritas', async () => {
  resetStorage();
  const cardId = TAROT_DECK[3].id;
  memory.set('cosmic-tarot-collection-encounters-v1', JSON.stringify({
    version: 1,
    occurrenceIds: ['interrupted-reading:card:0'],
    cards: {
      [cardId]: {
        count: 1,
        uprightCount: 1,
        reversedCount: 0,
        firstSeenAt: '2026-08-26T12:00:00.000Z',
        lastSeenAt: '2026-08-26T12:00:00.000Z',
        legacyBaseline: false,
      },
    },
  }));

  const duplicate = await album.recordCardEncounter({
    cardId,
    occurrenceId: 'interrupted-reading:card:0',
    occurredAt: '2026-08-26T12:00:00.000Z',
  });
  const state = await album.getAlbumState();
  assert.equal(duplicate.reason, 'duplicate');
  assert.equal(state.encounterStats[cardId].count, 1, 'a reparação não pode contar duas vezes');
  assert.ok(state.seenIds.includes(cardId), 'a carta precisa voltar a aparecer no álbum');
});

test('favoritos alternam sem duplicar ids', async () => {
  resetStorage();
  const cardId = TAROT_DECK[2].id;
  assert.equal(await album.toggleAlbumFavorite(cardId), true);
  assert.equal(await album.toggleAlbumFavorite(cardId), false);
  assert.deepEqual(await album.getAlbumFavoriteIds(), []);
});

test('mutações do álbum usam um Web Lock exclusivo sem readquirir no encontro', async () => {
  resetStorage();
  const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const requests = [];
  let active = 0;
  let maxActive = 0;
  const locks = {
    async request(name, options, operation) {
      requests.push({ name, options });
      active += 1;
      maxActive = Math.max(maxActive, active);
      assert.equal(active, 1, 'helper interno não pode readquirir o mesmo lock');
      try {
        return await operation();
      } finally {
        active -= 1;
      }
    },
  };

  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { locks },
  });

  try {
    const [firstCard, secondCard] = TAROT_DECK;
    await album.recordCardsSeen([firstCard.id]);
    await album.recordCardEncounter({
      cardId: secondCard.id,
      occurrenceId: 'web-lock-reading:card:0',
      occurredAt: '2026-08-26T13:00:00.000Z',
    });
    await album.toggleAlbumFavorite(secondCard.id);

    assert.equal(requests.length, 3, 'cada mutação pública deve adquirir o lock uma única vez');
    assert.equal(maxActive, 1);
    assert.ok(requests.every(({ name }) => name === 'cosmic-tarot-collection-mutation-v1'));
    assert.ok(requests.every(({ options }) => options?.mode === 'exclusive'));
  } finally {
    if (originalNavigator) Object.defineProperty(globalThis, 'navigator', originalNavigator);
    else delete globalThis.navigator;
  }
});

test('busca não revela o nome de cartas ainda ocultas e filtros usam dados reais', () => {
  const card = TAROT_DECK[0];
  const seenIds = new Set();
  const favoriteIds = new Set();
  assert.equal(cardMatchesAlbumFilter(card, { search: card.name, seenIds, favoriteIds, name: card.name }), false);

  seenIds.add(card.id);
  favoriteIds.add(card.id);
  assert.equal(cardMatchesAlbumFilter(card, { filter: 'favorites', seenIds, favoriteIds, name: card.name }), true);
  assert.equal(cardMatchesAlbumFilter(card, { filter: 'repeated', seenIds, stats: { [card.id]: { count: 1 } }, name: card.name }), false);
  assert.equal(cardMatchesAlbumFilter(card, { filter: 'repeated', seenIds, stats: { [card.id]: { count: 2 } }, name: card.name }), true);
});

test('packs PT/ES/EN têm contrato igual e data localizada', () => {
  const keys = Object.keys(tarotAlbum2Pack('pt')).sort();
  for (const lang of ['pt', 'es', 'en']) {
    assert.deepEqual(Object.keys(tarotAlbum2Pack(lang)).sort(), keys);
    assert.ok(formatAlbumDate('2026-08-26T12:00:00.000Z', lang));
  }
});

test('grade não expõe slots canônicos das cartas ocultas e preserva o primeiro toque', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'screens', 'TarotAlbumScreen.js'), 'utf8');
  const gridStart = source.indexOf('{filteredGroups.map((group) => {');
  const gridEnd = source.indexOf('<Modal', gridStart);
  const grid = source.slice(gridStart, gridEnd);
  assert.ok(gridStart >= 0 && gridEnd > gridStart);
  assert.match(grid, /revealedCards = group\.cards\.filter/);
  assert.match(grid, /testID=\{`album-hidden-group-\$\{group\.key\}`\}/);
  assert.doesNotMatch(grid, /testID=\{seen \? 'album-card-seen' : 'album-card-hidden'\}/);
  assert.doesNotMatch(grid, /group\.cards\.map\(\(card\)/);
  assert.match(source, /keyboardShouldPersistTaps="handled"/);
});
