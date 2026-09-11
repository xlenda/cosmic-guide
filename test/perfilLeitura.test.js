// lib/perfilLeitura.js — o que a pessoa conta sobre si pra leitura de tarô.
// Estes testes travam:
//
//   1. "nunca fabricar": sem nada salvo → null, sem lançar;
//   2. enum fechado: genero/estadoCivil fora da lista viram null ao gravar
//      (o prompt da IA lê estes campos — valor livre seria porta de injeção);
//   3. idadeDeNascimento: sem data de nascimento → null; com data → anos
//      COMPLETOS, virando só no dia do aniversário (mês/dia, não só ano).
//
// Mesmo esquema de mocks de identidadeCeleste.test.js: AsyncStorage em
// memória e SecureStore lançando (modo WEB, que é como o app é publicado) —
// a data de nascimento vive em 'birthChartSolo-mirror' (lib/birthData.js).
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
    async removeItem(k) {
      mem.delete(k);
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

const { getPerfilLeitura, setPerfilLeitura, idadeDeNascimento } = require('../lib/perfilLeitura.js');

const CHAVE_PERFIL = 'gff-perfil-leitura';
const CHAVE_NASC = 'birthChartSolo-mirror';

test('perfil vazio: null, sem lançar — a tela mostra o convite', async () => {
  mem.clear();
  assert.equal(await getPerfilLeitura(), null);
});

test('JSON inválido salvo: não lança e não fabrica — todos os campos null', async () => {
  mem.clear();
  mem.set(CHAVE_PERFIL, '{isto nao e json');
  assert.equal(await getPerfilLeitura(), null);
});

test('setPerfilLeitura grava e getPerfilLeitura devolve o mesmo perfil', async () => {
  mem.clear();
  await setPerfilLeitura({ genero: 'masculino', idade: 24, profissao: '  Empreendedor ', estadoCivil: 'casado' });
  assert.deepEqual(await getPerfilLeitura(), {
    genero: 'masculino',
    idade: 24,
    profissao: 'Empreendedor',
    estadoCivil: 'casado',
  });
});

test('genero e estadoCivil fora do enum viram null; idade fora da régua também', async () => {
  mem.clear();
  const gravado = await setPerfilLeitura({ genero: 'dragao', idade: '0', profissao: '', estadoCivil: 'viuvo' });
  assert.deepEqual(gravado, { genero: null, idade: null, profissao: null, estadoCivil: null });
  assert.deepEqual(await getPerfilLeitura(), gravado, 'o que volta do disco é o mesmo objeto normalizado');
});

test('idade como string numérica vira número; profissão respeita 40 caracteres', async () => {
  mem.clear();
  const gravado = await setPerfilLeitura({ idade: '31', profissao: 'a'.repeat(60) });
  assert.equal(gravado.idade, 31);
  assert.equal(gravado.profissao.length, 40);
});

test('idadeDeNascimento sem data salva: null — nunca um chute', async () => {
  mem.clear();
  assert.equal(await idadeDeNascimento(new Date(2026, 8, 11)), null);
});

test('idadeDeNascimento com 1990-05-15 e hoje 11/09/2026 → 36', async () => {
  mem.clear();
  mem.set(CHAVE_NASC, JSON.stringify({ date: '1990-05-15' }));
  assert.equal(await idadeDeNascimento(new Date(2026, 8, 11)), 36);
});

test('idadeDeNascimento vira só no dia do aniversário (mês/dia contam)', async () => {
  mem.clear();
  mem.set(CHAVE_NASC, JSON.stringify({ date: '1990-05-15' }));
  assert.equal(await idadeDeNascimento(new Date(2026, 4, 14)), 35, 'véspera do aniversário ainda é 35');
  assert.equal(await idadeDeNascimento(new Date(2026, 4, 15)), 36, 'no dia já é 36');
});

test('idadeDeNascimento com data corrompida: null, sem lançar', async () => {
  mem.clear();
  mem.set(CHAVE_NASC, JSON.stringify({ date: 'ontem' }));
  assert.equal(await idadeDeNascimento(new Date(2026, 8, 11)), null);
});
