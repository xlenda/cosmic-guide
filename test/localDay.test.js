// O "DIA" É O DIA LOCAL, NUNCA UTC — regressão do bug reproduzido ao vivo
// pelo tester (26/07/2026): lib/streak.js usava toISOString().slice(0,10)
// (data UTC), então no Brasil (UTC-3) usar o app depois das 21h gravava a
// data de AMANHÃ. Consequências reais:
//   - streak com buraco em dia USADO (seg 9h + ter 22h + qua 9h virava
//     {seg, qua}), consumindo Escudos COMPRADOS na Loja ou zerando a sequência;
//   - bolinhas da semana deslocadas depois das 21h (getWeekActivity);
//   - leitura de 31/07 21h30 caindo no Wrapped de AGOSTO (journal.date).
//
// Estes testes travam a convenção única (lib/localDay.js) + a janela de
// tolerância de migração de 1 dia (chaves antigas gravadas em UTC não podem
// zerar streak de ninguém na virada de convenção).
//
// TZ fixo em America/Sao_Paulo pro teste valer igual em qualquer máquina —
// precisa ser setado ANTES de qualquer uso de Date.
process.env.TZ = 'America/Sao_Paulo';

const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

// --- mocks de módulos nativos (mesmo padrão de accountAccess.test.js) -------
const mem = { async: new Map() };

const asyncStorageMock = {
  __esModule: true,
  default: {
    async getItem(k) {
      return mem.async.has(k) ? mem.async.get(k) : null;
    },
    async setItem(k, v) {
      mem.async.set(k, v);
    },
    async removeItem(k) {
      mem.async.delete(k);
    },
  },
};

// Platform.OS fora de 'web' => isWebPushSupported() false => syncs viram no-op.
const reactNativeMock = { __esModule: true, Platform: { OS: 'node' } };

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return asyncStorageMock;
  if (request === 'react-native') return reactNativeMock;
  return originalLoad.call(this, request, parent, isMain);
};

const { localDayStr, localISOString } = require('../lib/localDay.js');
const streak = require('../lib/streak.js');
const journal = require('../lib/journal.js');

// --- relógio congelável ------------------------------------------------------
// `new Date()` sem argumentos passa a devolver o instante fixado; com
// argumentos continua normal (o streak anda com cursor.setDate pra trás).
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

function reset() {
  mem.async.clear();
  restoreNow();
}

const ACTIVE_DAYS_KEY = 'cosmic-active-days';
const MIGRATION_KEY = 'cosmic-active-days-local-migrated';
const SHIELDS_KEY = 'cosmic-streak-shields';

function seedDays(days) {
  mem.async.set(ACTIVE_DAYS_KEY, JSON.stringify(days));
}
function storedDays() {
  return JSON.parse(mem.async.get(ACTIVE_DAYS_KEY) || '{}');
}

// === 1) helper: dia local diverge do dia UTC depois das 21h ===================

test('localDayStr devolve o dia LOCAL depois das 21h no Brasil (UTC já virou)', () => {
  reset();
  // 20/07 22h30 em São Paulo = 21/07 01h30 UTC.
  const d = new RealDate('2026-07-21T01:30:00Z');
  assert.equal(d.toISOString().slice(0, 10), '2026-07-21', 'sanidade: o dia UTC é amanhã');
  assert.equal(localDayStr(d), '2026-07-20', 'o dia do app tem que ser o dia que a pessoa está vivendo');
});

test('localISOString grava timestamp local (sem Z) que reparseia no mesmo dia/hora', () => {
  reset();
  const d = new RealDate('2026-07-21T01:30:00Z'); // 20/07 22h30 local
  const iso = localISOString(d);
  assert.ok(iso.startsWith('2026-07-20T22:30'), iso);
  const back = new RealDate(iso); // sem offset => parseado como hora LOCAL
  assert.equal(back.getDate(), 20);
  assert.equal(back.getHours(), 22);
});

// === 2) streak: usar o app à noite não abre buraco na sequência ==============

test('seg 9h + ter 22h + qua 9h = sequência de 3, sem buraco e sem gastar escudo', async () => {
  reset();
  mem.async.set(MIGRATION_KEY, '1'); // instalação já migrada — testa só o fluxo novo
  mem.async.set(SHIELDS_KEY, '2'); // escudos comprados que o bug antigo drenava

  setNow('2026-07-20T09:00:00-03:00'); // segunda de manhã
  await streak.recordActiveDay();
  setNow('2026-07-21T22:30:00-03:00'); // terça À NOITE (dia UTC já é quarta)
  await streak.recordActiveDay();
  setNow('2026-07-22T09:00:00-03:00'); // quarta de manhã
  const r = await streak.recordActiveDay();
  restoreNow();

  const days = storedDays();
  assert.equal(days['2026-07-21'], true, 'a terça usada às 22h tem que estar marcada como TERÇA');
  assert.equal(days['2026-07-23'], undefined, 'nada pode vazar pro dia UTC (quinta inexistente)');
  assert.equal(r.currentStreak, 3, 'era exatamente aqui que o buraco fantasma zerava a sequência');
  assert.equal(mem.async.get(SHIELDS_KEY), '2', 'nenhum escudo comprado pode ser drenado por dia que a pessoa USOU');
});

// === 3) getWeekActivity: bolinha de hoje certa mesmo depois das 21h ==========

test('getWeekActivity depois das 21h marca HOJE na bolinha de hoje, não na de amanhã', async () => {
  reset();
  mem.async.set(MIGRATION_KEY, '1');
  seedDays({ '2026-07-21': true }); // terça, gravada pelo próprio uso das 22h

  setNow('2026-07-21T22:30:00-03:00'); // terça 22h30 local (quarta em UTC)
  const week = await streak.getWeekActivity();
  restoreNow();

  const tuesday = week[1]; // semana começa na segunda (20/07)
  const wednesday = week[2];
  assert.equal(tuesday.date, '2026-07-21');
  assert.equal(tuesday.isToday, true, 'a bolinha de "hoje" deslocava pra quarta depois das 21h');
  assert.equal(tuesday.active, true);
  assert.equal(wednesday.isToday, false);
  assert.equal(wednesday.active, false);
});

// === 4) migração UTC->local: ninguém perde streak na virada ==================

test('primeira leitura pós-update: buraco de ontem coberto pelo registro UTC-deslocado, sem gastar escudo', async () => {
  reset();
  mem.async.set(SHIELDS_KEY, '1');
  // Histórico gravado pelo código antigo (UTC): uso de dia 19 de manhã + uso
  // de dia 20 às 22h que foi gravado como dia 21 — buraco falso no dia 20.
  seedDays({ '2026-07-19': true, '2026-07-21': true });

  setNow('2026-07-21T12:00:00-03:00');
  const info = await streak.getStreakInfo();
  restoreNow();

  assert.equal(info.currentStreak, 3, 'a virada de convenção não pode zerar streak de quem usou todo dia');
  assert.equal(storedDays()['2026-07-20'], 'migrated', 'o dia coberto fica gravado permanente (como o shield)');
  assert.equal(mem.async.get(SHIELDS_KEY), '1', 'a tolerância de migração nunca consome escudo');
  assert.equal(mem.async.get(MIGRATION_KEY), '1', 'flag setado: a tolerância é de UMA vez só');
});

test('tolerância NÃO se aplica de novo depois da primeira leitura (flag já setado)', async () => {
  reset();
  mem.async.set(MIGRATION_KEY, '1');
  seedDays({ '2026-07-19': true, '2026-07-21': true }); // mesmo buraco, sem escudo

  setNow('2026-07-21T12:00:00-03:00');
  const info = await streak.getStreakInfo();
  restoreNow();

  assert.equal(info.currentStreak, 1, 'falta real depois da migração volta a contar como sempre contou');
  assert.notEqual(storedDays()['2026-07-20'], 'migrated');
});

test('tolerância NÃO inventa dia quando não há registro UTC-deslocado cobrindo (hoje vazio)', async () => {
  reset();
  // Última atividade há dias — não existe registro de "hoje" que possa ser a
  // versão UTC-deslocada de ontem, então não há o que perdoar.
  seedDays({ '2026-07-17': true });

  setNow('2026-07-21T12:00:00-03:00');
  const info = await streak.getStreakInfo();
  restoreNow();

  assert.equal(info.currentStreak, 0);
  assert.equal(storedDays()['2026-07-20'], undefined);
  assert.equal(mem.async.get(MIGRATION_KEY), '1', 'a janela é a PRIMEIRA leitura — usada ou não, fecha');
});

// === 5) journal: leitura noturna fica no mês local (Wrapped certo) ===========

test('leitura de 31/07 21h30 grava date de JULHO, não de agosto', async () => {
  reset();
  setNow('2026-07-31T21:30:00-03:00'); // 01/08 00h30 em UTC
  await journal.saveJournalEntry({ type: 'tarot', typeLabel: 'Tarô', title: 'Leitura da noite', body: '...' });
  restoreNow();

  const [entry] = await journal.getJournalEntries();
  assert.ok(entry.date.startsWith('2026-07-31T21:30'), entry.date);
  // Mesmo recorte por prefixo que computeMonthlyWrapped usa (lib/monthlyWrapped.js).
  assert.equal(entry.date.startsWith('2026-07'), true, 'a leitura noturna caía no Wrapped do mês seguinte');
  assert.equal(entry.date.startsWith('2026-08'), false);
});
