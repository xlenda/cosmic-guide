// lib/identidadeCeleste.js — o cabeçalho da Home (Sol/Lua/Asc/elementos) lê o
// MESMO 'birthChartSolo' que o Mapa grava e faz a MESMA conta de
// BirthChartScreen.buildChart. Estes testes travam:
//
//   1. "nunca fabricar": sem dado salvo, ou JSON inválido → null, sem lançar;
//   2. só com data: Sol e Lua saem (Lua com a aproximação de meio-dia que o
//      motor já usa), Ascendente é null — hora e cidade são obrigatórias;
//   3. com data + hora + cidade: Ascendente sai como signo;
//   4. elementos é a distribuição real (pct soma 100), não um enfeite.
//
// Mesmo esquema de mocks de birthData.mirror.test.js: AsyncStorage em memória
// e SecureStore lançando (modo WEB, que é como o app é publicado) — o dado
// vive em 'birthChartSolo-mirror' (mirrorKeyFor de lib/birthData.js).
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const mem = new Map();

const asyncStorageMock = {
  __esModule: true,
  default: {
    async getItem(k) {
      return mem.has(k) ? mem.get(k) : null;
    },
    async setItem(k, v) {
      mem.set(k, v);
    },
    async multiRemove(keys) {
      keys.forEach((k) => mem.delete(k));
    },
  },
};

const secureStoreMock = {
  __esModule: true,
  async getItemAsync() {
    throw new TypeError('getValueWithKeyAsync is not a function');
  },
  async setItemAsync() {
    throw new TypeError('setValueWithKeyAsync is not a function');
  },
  async deleteItemAsync() {
    throw new TypeError('deleteValueWithKeyAsync is not a function');
  },
};

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return asyncStorageMock;
  if (request === 'expo-secure-store') return secureStoreMock;
  return originalLoad.call(this, request, parent, isMain);
};

const { carregarIdentidade } = require('../lib/identidadeCeleste.js');

const CHAVE = 'birthChartSolo-mirror';
// Mesma cidade de birthData.mirror.test.js (shape que BirthChartScreen.selectCity grava).
const PORTO_ALEGRE = { name: 'Porto Alegre', lat: -30.03, lon: -51.23, utcOffset: -3 };

test('sem nada salvo: null, sem lançar — a Home mostra o convite', async () => {
  mem.clear();
  assert.equal(await carregarIdentidade(), null);
});

test('JSON inválido salvo: null, sem lançar', async () => {
  mem.clear();
  mem.set(CHAVE, '{isto nao e json');
  assert.equal(await carregarIdentidade(), null);
});

test('só data: Sol e Lua saem, Ascendente é null, elementos somam 100', async () => {
  mem.clear();
  mem.set(CHAVE, JSON.stringify({ date: '1990-05-15' }));
  const id = await carregarIdentidade();
  assert.ok(id, 'com data válida salva não pode dar null');
  assert.equal(id.sun, 'Touro', '15/05/1990 é Touro — mesmo signoFromDate do Mapa');
  // VALOR PINADO, não typeof (11/09/2026, revisor adversarial): `typeof ===
  // 'string'` deixava passar um `moon: 'Áries'` fabricado. Capricórnio é o que
  // moonSign devolve pra 15/05/1990 ao meio-dia — o mesmo que o Mapa mostra.
  assert.equal(id.moon, 'Capricórnio', 'Lua só precisa de data (meio-dia como aproximação, igual ao Mapa)');
  assert.equal(id.asc, null, 'Ascendente sem hora+cidade é null — nunca um chute');
  assert.equal(id.time, null);
  assert.equal(id.city, null);
  assert.ok(id.elementos, 'elementos vem de distribuicaoDeElementos, não pode faltar com data válida');
  const soma = ['fogo', 'terra', 'ar', 'agua'].reduce((s, el) => s + id.elementos.pct[el], 0);
  assert.equal(soma, 100, '10 planetas × 10 pontos: a soma é 100 sem arredondar');
});

test('data + hora + cidade: Ascendente sai como signo', async () => {
  mem.clear();
  mem.set(CHAVE, JSON.stringify({ date: '1990-05-15', time: '08:30', city: PORTO_ALEGRE }));
  const id = await carregarIdentidade();
  assert.ok(id);
  assert.equal(id.sun, 'Touro');
  // Idem: Gêmeos é o Ascendente calculado pra 15/05/1990 08:30 em Porto
  // Alegre. Um `asc: 'Áries'` fabricado passaria no typeof; aqui falha.
  assert.equal(id.asc, 'Gêmeos', 'com hora e cidade reais o Ascendente é calculado');
  assert.equal(id.time, '08:30');
  assert.deepEqual(id.city, PORTO_ALEGRE);
});
