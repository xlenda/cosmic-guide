// A entrada automatica "1x por dia" (Calendario Lunar, Horoscopo, Mapa, Orbi)
// e guardada por um read-then-write no storage: getItem -> compara -> setItem.
// Duas passagens do efeito no mesmo tique leem as duas o valor de ONTEM e
// gravam as duas — duas entradas identicas no Diario, dois creditos de token e
// o saldo dobrado (reproduzido em producao 10/09/2026). A trava de verdade e o
// completionId de lib/journal.js. Este teste morde exatamente isso.
const test = require('node:test');
const assert = require('node:assert');
const Module = require('node:module');

const mem = new Map();
const asyncStorageMock = {
  __esModule: true,
  default: {
    async getItem(k) { return mem.has(k) ? mem.get(k) : null; },
    async setItem(k, v) { mem.set(k, String(v)); },
    async removeItem(k) { mem.delete(k); },
  },
};
const reactNativeMock = { __esModule: true, Platform: { OS: 'test' } };
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return asyncStorageMock;
  if (request === 'react-native') return reactNativeMock;
  return originalLoad.call(this, request, parent, isMain);
};

const { getItemSeguro, setItemSeguro } = require('../lib/storage.js');
const { recordReadingCompletion } = require('../lib/readingCompletion.js');
const { getJournalEntries } = require('../lib/journal.js');

const KEY = 'cosmic-lunar-diary-date';
const ISO = '2026-09-10';

// Copia fiel do efeito da LunarCalendarScreen: guarda no storage + gravacao.
function efeitoDaTela() {
  return getItemSeguro(KEY).then((lastDate) => {
    if (lastDate === ISO) return;
    const p = recordReadingCompletion({
      type: 'lunarCalendar',
      typeLabel: 'Calendario Lunar',
      title: 'Lua Nova',
      body: 'reflexao',
      completionId: `lunarCalendar:${ISO}`,
    });
    setItemSeguro(KEY, ISO);
    return p;
  });
}

test('duas montagens no mesmo tique gravam UMA entrada e UM credito', async () => {
  mem.clear();
  await Promise.all([efeitoDaTela(), efeitoDaTela()]);

  const lunares = (await getJournalEntries()).filter((e) => e.type === 'lunarCalendar');
  assert.strictEqual(lunares.length, 1, 'o Diario nao pode ganhar duas entradas identicas');

  const historico = JSON.parse(mem.get('cosmic-tokens-history') || '[]');
  assert.strictEqual(historico.length, 1, 'token e moeda: uma visita nunca paga dobrado');
  assert.strictEqual(mem.get('cosmic-tokens-balance'), '10', 'saldo tem que ser 10, nunca 20');
});
