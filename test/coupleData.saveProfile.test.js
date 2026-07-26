// Regressão do bug reportado pelo tester (26/07/2026):
// "Quiz do Casal — quando você termina de informar os dados e tenta salvar,
//  o sistema não permite: dá erro."
//
// Causa: saveCoupleProfile() gravava perfil (AsyncStorage) e nascimento
// (SecureStore) dentro do MESMO try/catch e devolvia false em qualquer throw.
// Na WEB o expo-secure-store é um stub vazio (ExpoSecureStore.web.js =
// `export default {}`), então setItemAsync SEMPRE lança — e o QuizScreen,
// que sempre manda birthA/birthB, sempre recebia false e mostrava
// "Não foi possível salvar. Tente novamente."
//
// Estes testes simulam os dois ambientes (web com SecureStore quebrado,
// nativo com SecureStore funcionando) trocando os módulos no require cache.
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
    if (secureThrows) throw new TypeError('setValueWithKeyAsync is not a function');
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

const coupleData = require('../lib/coupleData.js');

function reset(webMode) {
  mem.async.clear();
  mem.secure.clear();
  secureThrows = webMode;
}

const PERFIL = {
  voce: 'Lenda',
  amor: 'Sofia',
  sa: 'Áries',
  sb: 'Leão',
  birthA: { date: '1990-04-02', time: '14:30' },
  birthB: { date: '1992-08-11', time: null },
};

test('WEB (SecureStore quebrado): saveCoupleProfile devolve true — o quiz não pode falhar por causa do nascimento', async () => {
  reset(true);
  const ok = await coupleData.saveCoupleProfile(PERFIL);
  assert.strictEqual(ok, true, 'era exatamente isso que devolvia false e travava o Quiz do Casal na web');
});

test('WEB: perfil e nascimento continuam legíveis depois do save (espelho no AsyncStorage)', async () => {
  reset(true);
  await coupleData.saveCoupleProfile(PERFIL);

  const profile = await coupleData.getCoupleProfile();
  assert.deepStrictEqual(profile, { voce: 'Lenda', amor: 'Sofia', sa: 'Áries', sb: 'Leão' });

  const { birthA, birthB } = await coupleData.getBirthData();
  assert.deepStrictEqual(birthA, PERFIL.birthA, 'sem o espelho, o Ascendente/Mapa Astral ficaria vazio na web');
  assert.deepStrictEqual(birthB, PERFIL.birthB);
});

test('NATIVO (SecureStore ok): nascimento vai pro SecureStore e NÃO vaza pro AsyncStorage', async () => {
  reset(false);
  const ok = await coupleData.saveCoupleProfile(PERFIL);
  assert.strictEqual(ok, true);

  assert.strictEqual(mem.secure.size, 2, 'no celular as duas datas continuam no Keychain/Keystore');
  const espelhos = [...mem.async.keys()].filter((k) => k.includes('mirror'));
  assert.deepStrictEqual(espelhos, [], 'o espelho só existe quando o SecureStore falha de verdade');

  const { birthA } = await coupleData.getBirthData();
  assert.deepStrictEqual(birthA, PERFIL.birthA);
});

test('WEB: deleteAllCoupleData apaga também o espelho do nascimento', async () => {
  reset(true);
  await coupleData.saveCoupleProfile(PERFIL);
  await coupleData.deleteAllCoupleData();

  const { birthA, birthB } = await coupleData.getBirthData();
  assert.strictEqual(birthA, null, 'a data de nascimento não pode sobreviver a "apagar meus dados" na web');
  assert.strictEqual(birthB, null);
  assert.strictEqual(await coupleData.getCoupleProfile(), null);
});

// Regressão de privacidade (26/07/2026): deleteAllCoupleData só apagava o
// nascimento do CASAL. O nascimento do MODO SOLO (Mapa Astral) vive em outras
// três chaves, escritas por lib/birthData.js e screens/BirthChartScreen.js —
// e sobrevivia inteiro a "apagar meus dados", inclusive no localStorage da web.
const birthData = require('../lib/birthData.js');

test('WEB: deleteAllCoupleData apaga também o nascimento SOLO (espelho no AsyncStorage)', async () => {
  reset(true);
  await birthData.saveSoloBirthMirror({ date: '1988-12-25', time: '06:15' });
  assert.deepStrictEqual(await birthData.getAnyBirthData(), { date: '1988-12-25', time: '06:15' });

  await coupleData.deleteAllCoupleData();

  assert.strictEqual(
    await birthData.getAnyBirthData(),
    null,
    'a data de nascimento solo não pode sobreviver a "apagar meus dados" na web'
  );
  assert.deepStrictEqual([...mem.async.keys()], [], 'nenhuma chave local pode sobrar');
});

test('NATIVO: deleteAllCoupleData apaga birthChartSolo e birthChartCities do SecureStore', async () => {
  reset(false);
  // Mesmas chaves/escritas de screens/BirthChartScreen.js (writeSecureItem).
  await secureStoreMock.setItemAsync('birthChartSolo', JSON.stringify({ date: '1988-12-25', time: '06:15' }));
  await secureStoreMock.setItemAsync('birthChartCities', JSON.stringify([{ name: 'Porto Alegre', lat: -30, lon: -51 }]));
  await coupleData.saveCoupleProfile(PERFIL);

  await coupleData.deleteAllCoupleData();

  assert.deepStrictEqual([...mem.secure.keys()], [], 'nascimento e cidade de nascimento saem do Keychain/Keystore');
  assert.strictEqual(await birthData.getAnyBirthData(), null);
});

test('falha real do AsyncStorage (perfil não gravou) continua devolvendo false', async () => {
  reset(false);
  const original = asyncStorageMock.default.setItem;
  asyncStorageMock.default.setItem = async () => {
    throw new Error('quota exceeded');
  };
  try {
    const ok = await coupleData.saveCoupleProfile(PERFIL);
    assert.strictEqual(ok, false, 'sem perfil gravado o quiz DEVE mostrar erro e permitir retry');
  } finally {
    asyncStorageMock.default.setItem = original;
  }
});
