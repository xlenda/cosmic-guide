// Regressão do bug reproduzido AO VIVO pelo tester (26/07/2026):
// na WEB (que é como o app é publicado), o Mapa Astral perdia TUDO a cada
// reload — a pessoa preenchia data/hora/cidade, via Ascendente e casas, dava
// F5 e o formulário voltava vazio, pra sempre.
//
// Causa: screens/BirthChartScreen.js gravava 'birthChartSolo'/'birthChartCities'
// SÓ no SecureStore, que na web é um stub vazio (ExpoSecureStore.web.js =
// `export default {}`) — o TypeError era engolido por catch{} e nada persistia.
//
// Correção: readSecureItemWithMirror/writeSecureItemWithMirror em
// lib/birthData.js — SecureStore primeiro, espelho '<chave>-mirror' no
// AsyncStorage SÓ quando ele falha (mesmo padrão de writeSecureJSON em
// lib/coupleData.js). O sufixo '-mirror' é o que deleteAllCoupleData já apaga
// (mirrorKeyFor), então "apagar meus dados" cobre o espelho sem vazamento novo.
//
// Mesmo esquema de mocks do coupleData.saveProfile.test.js: simula web
// (SecureStore lançando) e nativo (SecureStore ok) trocando módulos no
// require cache.
const test = require('node:test');
const assert = require('node:assert');
const Module = require('node:module');

const mem = { async: new Map(), secure: new Map() };
let secureThrows = false;

const asyncStorageMock = {
  __esModule: true,
  default: {
    async getItem(k) {
      return mem.async.has(k) ? mem.async.get(k) : null;
    },
    async setItem(k, v) {
      mem.async.set(k, v);
    },
    async multiRemove(keys) {
      keys.forEach((k) => mem.async.delete(k));
    },
  },
};

const secureStoreMock = {
  __esModule: true,
  async getItemAsync(k) {
    if (secureThrows) throw new TypeError('getValueWithKeyAsync is not a function');
    return mem.secure.has(k) ? mem.secure.get(k) : null;
  },
  async setItemAsync(k, v) {
    if (secureThrows) throw new TypeError('setValueWithKeyAsync is not a function');
    mem.secure.set(k, v);
  },
  async deleteItemAsync(k) {
    if (secureThrows) throw new TypeError('deleteValueWithKeyAsync is not a function');
    mem.secure.delete(k);
  },
};

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return asyncStorageMock;
  if (request === 'expo-secure-store') return secureStoreMock;
  return originalLoad.call(this, request, parent, isMain);
};

const birthData = require('../lib/birthData.js');
const coupleData = require('../lib/coupleData.js');

function reset(webMode) {
  mem.async.clear();
  mem.secure.clear();
  secureThrows = webMode;
}

// Mesmos shapes que screens/BirthChartScreen.js grava (generateSolo/selectCity).
const SOLO = JSON.stringify({
  date: '1962-03-15',
  time: '21:00',
  city: { name: 'Porto Alegre', lat: -30.03, lon: -51.23, utcOffset: -3 },
});
const CITIES = JSON.stringify({ voce: { name: 'São Paulo', lat: -23.55, lon: -46.63, utcOffset: -3 }, amor: null });

test('WEB (SecureStore quebrado): birthChartSolo sobrevive ao F5 — era exatamente isso que sumia', async () => {
  reset(true);
  await birthData.writeSecureItemWithMirror('birthChartSolo', SOLO);
  await birthData.writeSecureItemWithMirror('birthChartCities', CITIES);

  // "F5": nada em memória, só o que persistiu — a tela relê pelas mesmas funções.
  assert.strictEqual(await birthData.readSecureItemWithMirror('birthChartSolo'), SOLO, 'data/hora/CIDADE precisam voltar inteiras depois do reload na web');
  assert.strictEqual(await birthData.readSecureItemWithMirror('birthChartCities'), CITIES);

  // O espelho usa exatamente o sufixo '-mirror' que deleteAllCoupleData apaga.
  assert.ok(mem.async.has('birthChartSolo-mirror'), 'espelho precisa se chamar birthChartSolo-mirror (mirrorKeyFor de lib/coupleData.js)');
  assert.ok(mem.async.has('birthChartCities-mirror'));
});

test('NATIVO (SecureStore ok): dado fica SÓ no Keychain/Keystore, espelho nem é escrito', async () => {
  reset(false);
  await birthData.writeSecureItemWithMirror('birthChartSolo', SOLO);

  assert.strictEqual(await birthData.readSecureItemWithMirror('birthChartSolo'), SOLO);
  const espelhos = [...mem.async.keys()].filter((k) => k.includes('mirror'));
  assert.deepStrictEqual(espelhos, [], 'o espelho só existe quando o SecureStore falha de verdade');
});

test('WEB: "apagar meus dados" (deleteAllCoupleData) mata os dois espelhos — sem vazamento novo', async () => {
  reset(true);
  await birthData.writeSecureItemWithMirror('birthChartSolo', SOLO);
  await birthData.writeSecureItemWithMirror('birthChartCities', CITIES);

  await coupleData.deleteAllCoupleData();

  assert.strictEqual(await birthData.readSecureItemWithMirror('birthChartSolo'), null, 'nascimento não pode sobreviver a "apagar meus dados" na web');
  assert.strictEqual(await birthData.readSecureItemWithMirror('birthChartCities'), null);
  assert.deepStrictEqual([...mem.async.keys()], [], 'nenhuma chave local pode sobrar');
});

test('WEB: getAnyBirthData (Céu de Hoje) enxerga o nascimento salvo pelo Mapa Astral via espelho', async () => {
  reset(true);
  await birthData.writeSecureItemWithMirror('birthChartSolo', SOLO);

  assert.deepStrictEqual(
    await birthData.getAnyBirthData(),
    {
      date: '1962-03-15',
      time: '21:00',
      // `city` entrou em 30/07/2026: sem ela, lib/personalSky.js lia "21:00"
      // como se fosse 21:00 UTC e o Céu de Hoje calculava a Lua natal num
      // instante 3h diferente do que o Mapa Astral mostra — duas telas do
      // mesmo app discordando sobre o mesmo nascimento.
      city: { name: 'Porto Alegre', lat: -30.03, lon: -51.23, utcOffset: -3 },
    },
    'antes o Céu de Hoje só via o SecureStore (morto na web) e o birth-solo-mirror'
  );
});

test('WEB: getAnyBirthData no modo CASAL traz a cidade de birthChartCities.voce', async () => {
  reset(true);
  await birthData.writeSecureItemWithMirror('birthChartCities', CITIES);
  // 'gff-birth-a-mirror' é onde lib/coupleData.js persiste birthA na web.
  mem.async.set('gff-birth-a-mirror', JSON.stringify({ date: '1990-07-15', time: '08:00' }));

  const b = await birthData.getAnyBirthData();
  assert.strictEqual(b.date, '1990-07-15');
  assert.strictEqual(b.time, '08:00');
  assert.deepStrictEqual(
    b.city,
    { name: 'São Paulo', lat: -23.55, lon: -46.63, utcOffset: -3 },
    'a cidade do casal mora em outra chave (birthChartCities) e precisa ser lida à parte'
  );
});
