// lib/nomeLocal.js — o nome de quem não tem login vive em AsyncStorage
// ('gff-nome'). Estes testes travam o contrato de 11/09/2026:
//
//   1. "nunca fabricar": sem nada salvo → null (a Home mostra o convite);
//   2. setNome faz trim — '  Ana ' vira 'Ana', e getNome devolve o mesmo;
//   3. setNome('') REMOVE a chave — apagar o nome volta ao estado "sem nome",
//      nunca grava '' e engana o getNome;
//   4. storage quebrado (getItem/setItem/removeItem lançando) → nada lança;
//      os wrappers de lib/storage.js caem em memória.
//
// Mesmo esquema de mock de identidadeCeleste.test.js: AsyncStorage em memória
// via Module._load. lib/storage.js faz o require preguiçoso e cacheia o
// módulo, então o mock recebe uma flag `quebrado` em vez de ser trocado.
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const mem = new Map();
let quebrado = false;

function falha() {
  throw new Error('storage quebrado (SecurityError simulado)');
}

const asyncStorageMock = {
  __esModule: true,
  default: {
    async getItem(k) {
      if (quebrado) falha();
      return mem.has(k) ? mem.get(k) : null;
    },
    async setItem(k, v) {
      if (quebrado) falha();
      mem.set(k, v);
    },
    async removeItem(k) {
      if (quebrado) falha();
      mem.delete(k);
    },
  },
};

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return asyncStorageMock;
  return originalLoad.call(this, request, parent, isMain);
};

const { getNome, setNome, NOME_KEY } = require('../lib/nomeLocal.js');
const { _reiniciarStorageParaTestes } = require('../lib/storage.js');

test.beforeEach(() => {
  mem.clear();
  quebrado = false;
  _reiniciarStorageParaTestes();
});

test('chave é a do contrato (gff-nome)', () => {
  assert.equal(NOME_KEY, 'gff-nome');
});

test('sem nada salvo: null, sem lançar', async () => {
  assert.equal(await getNome(), null);
});

test("setNome('  Ana ') grava 'Ana' e getNome devolve 'Ana'", async () => {
  await setNome('  Ana ');
  assert.equal(mem.get('gff-nome'), 'Ana', 'o trim acontece na gravação, não só na leitura');
  assert.equal(await getNome(), 'Ana');
});

test('valor salvo só com espaços: null, nunca uma string vazia', async () => {
  mem.set('gff-nome', '   ');
  assert.equal(await getNome(), null);
});

test("setNome('') remove a chave; não-string também", async () => {
  await setNome('Ana');
  await setNome('');
  assert.equal(mem.has('gff-nome'), false, "'' tem que apagar, não gravar ''");
  assert.equal(await getNome(), null);

  await setNome('Ana');
  await setNome(undefined);
  assert.equal(mem.has('gff-nome'), false);
  await setNome('Ana');
  await setNome(42);
  assert.equal(mem.has('gff-nome'), false);
});

test('storage quebrado: getNome e setNome não lançam', async () => {
  quebrado = true;
  assert.equal(await getNome(), null);
  await setNome('Ana'); // lib/storage.js cai em memória — não pode estourar o onboarding
  await setNome('');
  // A leitura que vier na mesma sessão continua sem lançar.
  assert.equal(await getNome(), null);
});
