// Testes dos Favoritos do Diário Cósmico (lib/journal.js):
// toggle liga/desliga E persiste no storage (não só no retorno), entrada
// antiga sem o campo `favorito` continua funcionando (retrocompat sem
// migração), filtro devolve só as favoritas, e toggle de id inexistente não
// reescreve nada. Mesmo esquema de mock por require-cache dos outros testes
// (missions.test.js) — AsyncStorage em memória e stub de react-native
// (lib/journal.js → lib/webPush.js importa Platform; com OS 'test' o
// syncDiaryToServer retorna cedo e nenhum teste tenta rede).
const test = require('node:test');
const assert = require('node:assert');
const Module = require('node:module');

const mem = new Map();

const asyncStorageMock = {
  __esModule: true,
  default: {
    async getItem(k) {
      return mem.has(k) ? mem.get(k) : null;
    },
    async setItem(k, v) {
      mem.set(k, String(v));
    },
    async removeItem(k) {
      mem.delete(k);
    },
  },
};

const reactNativeMock = { __esModule: true, Platform: { OS: 'test' } };

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return asyncStorageMock;
  if (request === 'react-native') return reactNativeMock;
  return originalLoad.call(this, request, parent, isMain);
};

const journal = require('../lib/journal.js');

const JOURNAL_KEY = 'cosmic-journal';

function reset() {
  mem.clear();
}

// O storage CRU, sem passar por nenhuma função do journal — é assim que os
// testes provam persistência de verdade, não só o estado em memória do módulo.
function rawEntries() {
  return JSON.parse(mem.get(JOURNAL_KEY) || '[]');
}

// Entrada no formato ANTIGO, anterior aos favoritos — sem o campo `favorito`,
// exatamente como está gravada no aparelho de quem já usava o app.
function seedOldEntry(id, extra = {}) {
  const entry = {
    id,
    type: 'tarot',
    typeLabel: 'Tarô',
    title: `Leitura ${id}`,
    body: 'corpo da leitura',
    date: new Date().toISOString(),
    voiceTranscript: null,
    aiInsight: null,
    ...extra,
  };
  const cur = rawEntries();
  cur.unshift(entry);
  mem.set(JOURNAL_KEY, JSON.stringify(cur));
  return entry;
}

test('toggle liga: devolve true, a entrada vira favorita e o estado PERSISTE no storage', async () => {
  reset();
  const id = await journal.saveJournalEntry({ type: 'tarot', typeLabel: 'Tarô', title: 'A Estrela', body: 'texto' });

  const ligou = await journal.toggleFavorito(id);
  assert.strictEqual(ligou, true, 'primeiro toggle numa entrada nova tem que ligar');

  const [viaApi] = await journal.getJournalEntries();
  assert.strictEqual(viaApi.favorito, true, 'getJournalEntries tem que refletir o favorito');

  // Persistência de verdade: o JSON gravado no storage carrega o campo —
  // fechar e reabrir o app não pode perder o coração.
  const [cru] = rawEntries();
  assert.strictEqual(cru.favorito, true, 'o campo tem que estar GRAVADO, não só no retorno');
});

test('toggle desliga: segundo toggle devolve false e a entrada volta a não-favorita (persistido)', async () => {
  reset();
  const id = await journal.saveJournalEntry({ type: 'coffee', typeLabel: 'Café', body: 'texto', title: 'Borra' });

  assert.strictEqual(await journal.toggleFavorito(id), true);
  assert.strictEqual(await journal.toggleFavorito(id), false, 'segundo toggle tem que desligar');

  const [cru] = rawEntries();
  assert.strictEqual(cru.favorito, false);
  assert.strictEqual(journal.isEntradaFavorita(cru), false);
  assert.deepStrictEqual(await journal.getFavoriteEntries(), [], 'desfavoritada não pode aparecer no filtro');
});

test('retrocompat: entrada antiga SEM o campo favorito é não-favorita e não quebra nada', async () => {
  reset();
  seedOldEntry('antiga-1');

  // Ler não quebra e não inventa favorito.
  assert.strictEqual(journal.isEntradaFavorita((await journal.getJournalEntries())[0]), false);
  assert.deepStrictEqual(await journal.getFavoriteEntries(), []);

  // E o primeiro toggle nela funciona como numa entrada nova: liga.
  assert.strictEqual(await journal.toggleFavorito('antiga-1'), true);
  const [cru] = rawEntries();
  assert.strictEqual(cru.favorito, true);
  // Os campos antigos continuam intactos — toggle não pode reescrever a entrada.
  assert.strictEqual(cru.title, 'Leitura antiga-1');
  assert.strictEqual(cru.type, 'tarot');
});

test('isEntradaFavorita: só true LITERAL vale — null/undefined/lixo são não-favorita', () => {
  assert.strictEqual(journal.isEntradaFavorita({ favorito: true }), true);
  assert.strictEqual(journal.isEntradaFavorita({}), false);
  assert.strictEqual(journal.isEntradaFavorita({ favorito: false }), false);
  assert.strictEqual(journal.isEntradaFavorita({ favorito: 'true' }), false, 'string não é boolean — dado corrompido não vira favorito');
  assert.strictEqual(journal.isEntradaFavorita(null), false, 'entrada nula não pode estourar');
  assert.strictEqual(journal.isEntradaFavorita(undefined), false);
});

test('filtro: getFavoriteEntries devolve SÓ as favoritas, na ordem do diário, misturando antigas e novas', async () => {
  reset();
  // Mistura real: duas antigas (sem campo) + duas novas (saveJournalEntry).
  seedOldEntry('antiga-a');
  seedOldEntry('antiga-b');
  const novaA = await journal.saveJournalEntry({ type: 'dream', typeLabel: 'Sonho', title: 'Voo', body: 'x' });
  const novaB = await journal.saveJournalEntry({ type: 'palma', typeLabel: 'Palma', title: 'Linha', body: 'y' });

  await journal.toggleFavorito('antiga-b');
  await journal.toggleFavorito(novaB);

  const favs = await journal.getFavoriteEntries();
  assert.deepStrictEqual(
    favs.map((e) => e.id),
    [novaB, 'antiga-b'],
    'só as duas favoritadas, mais recente primeiro (mesma ordem do diário)'
  );
  assert.ok(favs.every((e) => journal.isEntradaFavorita(e)));

  // O diário completo continua com as 4 — favoritar não filtra o histórico.
  assert.strictEqual((await journal.getJournalEntries()).length, 4);
});

test('toggle de id inexistente: devolve null e NÃO reescreve o storage', async () => {
  reset();
  seedOldEntry('unica');
  const antes = mem.get(JOURNAL_KEY);

  assert.strictEqual(await journal.toggleFavorito('id-fantasma'), null);
  assert.strictEqual(mem.get(JOURNAL_KEY), antes, 'lista não pode ser regravada por um toggle que não achou ninguém');
});

test('toggle só mexe na entrada alvo — as vizinhas ficam byte a byte iguais', async () => {
  reset();
  seedOldEntry('vizinha-1');
  seedOldEntry('alvo');
  seedOldEntry('vizinha-2');
  const antes = rawEntries();

  await journal.toggleFavorito('alvo');

  const depois = rawEntries();
  assert.deepStrictEqual(depois.find((e) => e.id === 'vizinha-1'), antes.find((e) => e.id === 'vizinha-1'));
  assert.deepStrictEqual(depois.find((e) => e.id === 'vizinha-2'), antes.find((e) => e.id === 'vizinha-2'));
  assert.strictEqual(depois.find((e) => e.id === 'alvo').favorito, true);
});
