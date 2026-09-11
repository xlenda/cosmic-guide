// TIPO DA ATIVIDADE POR DIA — mapa PARALELO `cosmic-active-types` (11/09/2026).
// O calendário dos Relatórios passa a pintar cada dia com a cor da atividade
// (Tarô dourado, Sonho azul, Café laranja...). O tipo NÃO entra no
// `cosmic-active-days`: o formato { dia: true|'shield' } é lido por
// computeCurrentStreak, pelos Escudos, pelo Céu de Hoje e por
// test/coupleStreak.test.js — todos testam `days[key]` como verdadeiro/falso, e
// virar array ali quebraria a sequência inteira. Estes testes trancam:
//   - o mapa antigo continua byte a byte igual, com ou sem tipo;
//   - dedup por dia e ORDEM de gravação (o primeiro é o dominante);
//   - falha no mapa de tipos nunca derruba o dia ativo (é cosmético).
// TZ fixo pro teste valer igual em qualquer máquina — antes de qualquer Date.
process.env.TZ = 'America/Sao_Paulo';

const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

// --- mocks de módulos nativos (mesmo padrão de coupleStreak.test.js) ---------
// `failKeys`: chaves cujo setItem LANÇA — simula storage cheio/quebrado só no
// mapa de tipos, deixando o mapa de dias intacto (teste 6).
const mem = { async: new Map(), failKeys: new Set() };

const asyncStorageMock = {
  __esModule: true,
  default: {
    async getItem(k) {
      return mem.async.has(k) ? mem.async.get(k) : null;
    },
    async setItem(k, v) {
      if (mem.failKeys.has(k)) throw new Error(`setItem falhou: ${k}`);
      mem.async.set(k, v);
    },
    async removeItem(k) {
      mem.async.delete(k);
    },
    async multiRemove(keys) {
      keys.forEach((k) => mem.async.delete(k));
    },
  },
};

const secureStoreMock = {
  __esModule: true,
  async getItemAsync() {
    throw new Error('sem SecureStore');
  },
  async setItemAsync() {
    throw new Error('sem SecureStore');
  },
  async deleteItemAsync() {
    throw new Error('sem SecureStore');
  },
};

const reactNativeMock = { __esModule: true, Platform: { OS: 'node' } };

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return asyncStorageMock;
  if (request === 'expo-secure-store') return secureStoreMock;
  if (request === 'react-native') return reactNativeMock;
  return originalLoad.call(this, request, parent, isMain);
};

const streak = require('../lib/streak.js');
const streakDays = require('../lib/streakDays.js');

// --- relógio congelável (idêntico ao de coupleStreak.test.js) ----------------
const RealDate = Date;
function setNow(isoWithOffset) {
  const fixed = new RealDate(isoWithOffset).getTime();
  global.Date = class extends RealDate {
    constructor(...args) {
      if (args.length === 0) super(fixed);
      else super(...args);
    }
    static now() {
      return fixed;
    }
  };
}
function restoreNow() {
  global.Date = RealDate;
}

const ACTIVE_DAYS_KEY = 'cosmic-active-days';
const ACTIVE_TYPES_KEY = 'cosmic-active-types';

function reset() {
  mem.async.clear();
  mem.failKeys.clear();
  restoreNow();
}

function storedTypes() {
  return JSON.parse(mem.async.get(ACTIVE_TYPES_KEY) || '{}');
}

// === 1) dedup por dia ========================================================

test('recordActivityType duas vezes no mesmo dia grava o tipo UMA vez', async () => {
  reset();
  await streakDays.recordActivityType('tarot', '2026-09-11');
  await streakDays.recordActivityType('tarot', '2026-09-11');

  assert.deepEqual(storedTypes()['2026-09-11'], ['tarot']);
});

// === 2) ordem de gravação = dominante ========================================

test('dois tipos no mesmo dia preservam a ORDEM de gravação (primeiro = dominante)', async () => {
  reset();
  await streakDays.recordActivityType('dream', '2026-09-11');
  await streakDays.recordActivityType('tarot', '2026-09-11');
  await streakDays.recordActivityType('dream', '2026-09-11'); // repetido não reordena

  assert.deepEqual(storedTypes()['2026-09-11'], ['dream', 'tarot']);
});

// === 3) getMonthTypes filtra pelo mês ========================================

test('getMonthTypes devolve só as chaves do mês pedido (month 0-indexed)', async () => {
  reset();
  await streakDays.recordActivityType('tarot', '2026-08-31');
  await streakDays.recordActivityType('coffee', '2026-09-01');
  await streakDays.recordActivityType('dream', '2026-09-30');

  const setembro = await streakDays.getMonthTypes(2026, 8);
  assert.deepEqual(setembro, { '2026-09-01': ['coffee'], '2026-09-30': ['dream'] });

  const agosto = await streakDays.getMonthTypes(2026, 7);
  assert.deepEqual(agosto, { '2026-08-31': ['tarot'] });

  assert.deepEqual(await streakDays.getMonthTypes(2026, 9), {}, 'outubro vazio');
});

// === 4) tipo inválido ========================================================

test('tipo inválido (undefined, vazio, número) não grava e não lança', async () => {
  reset();
  await streakDays.recordActivityType(undefined, '2026-09-11');
  await streakDays.recordActivityType('', '2026-09-11');
  await streakDays.recordActivityType(42, '2026-09-11');

  assert.equal(mem.async.has(ACTIVE_TYPES_KEY), false, 'nada foi gravado');
});

// === 5) recordActiveDay(tipo) não muda o mapa de dias ========================

test('recordActiveDay("tarot") grava cosmic-active-days IGUAL a recordActiveDay() e o tipo à parte', async () => {
  reset();
  setNow('2026-09-11T10:00:00-03:00');
  const semTipo = await streak.recordActiveDay();
  const diasSemTipo = mem.async.get(ACTIVE_DAYS_KEY);
  assert.equal(semTipo.isNewDay, true);
  assert.equal(mem.async.has(ACTIVE_TYPES_KEY), false, 'sem tipo não cria o mapa de tipos');

  reset();
  setNow('2026-09-11T10:00:00-03:00');
  const comTipo = await streak.recordActiveDay('tarot');
  const diasComTipo = mem.async.get(ACTIVE_DAYS_KEY);
  restoreNow();

  assert.equal(comTipo.isNewDay, true);
  assert.equal(comTipo.currentStreak, semTipo.currentStreak);
  assert.equal(diasComTipo, diasSemTipo, 'o formato { dia: true } é o mesmo byte a byte');
  assert.deepEqual(JSON.parse(diasComTipo), { '2026-09-11': true });
  assert.deepEqual(storedTypes(), { '2026-09-11': ['tarot'] });
});

// === 6) falha no mapa de tipos não derruba o dia ativo =======================

test('storage falhando SÓ em cosmic-active-types: recordActiveDay("tarot") ainda marca o dia', async () => {
  reset();
  mem.failKeys.add(ACTIVE_TYPES_KEY);
  setNow('2026-09-11T10:00:00-03:00');
  const r = await streak.recordActiveDay('tarot');
  restoreNow();

  assert.equal(r.isNewDay, true);
  assert.equal(r.currentStreak, 1);
  assert.deepEqual(JSON.parse(mem.async.get(ACTIVE_DAYS_KEY)), { '2026-09-11': true });
  assert.equal(mem.async.has(ACTIVE_TYPES_KEY), false, 'o tipo não conseguiu gravar, e tudo bem');
});


// APAGAR MEUS DADOS LEVA O MAPA DE TIPOS (11/09/2026, revisor adversarial):
// sem isso o perfil seguinte no mesmo aparelho herdava "o que a pessoa anterior
// fez em cada dia" — vazamento, e cor fabricada pro perfil novo.
test('deleteAllCoupleData apaga cosmic-active-types junto com cosmic-active-days', async () => {
  const { deleteAllCoupleData } = require('../lib/coupleData.js');
  mem.async.clear();
  mem.failKeys.clear();
  await streak.recordActiveDay('dream');
  assert.ok(mem.async.has('cosmic-active-types'), 'pré-condição: o tipo foi gravado');
  await deleteAllCoupleData();
  assert.equal(mem.async.has('cosmic-active-types'), false, 'o mapa de tipos sobreviveu ao apagar-tudo');
  assert.equal(mem.async.has('cosmic-active-days'), false);
});

// DUAS GRAVAÇÕES SIMULTÂNEAS NO MESMO DIA (11/09/2026): sem a fila, a última
// escrita vencia e um tipo sumia — com ele, o dominante do dia.
test('recordActivityType concorrente não perde tipo', async () => {
  mem.async.clear();
  mem.failKeys.clear();
  await Promise.all([
    streakDays.recordActivityType('tarot', '2026-09-11'),
    streakDays.recordActivityType('dream', '2026-09-11'),
  ]);
  const map = JSON.parse(mem.async.get('cosmic-active-types'));
  assert.deepEqual(map['2026-09-11'], ['tarot', 'dream']);
});
