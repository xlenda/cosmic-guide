// A SEQUÊNCIA DO CASAL É UMA SÓ — regressão do achado de auditoria
// (30/07/2026): a chave `gff-streak:${voce}:${amor}` era só LIDA e APAGADA,
// nenhum arquivo do app jamais escreveu nela. Consequências reais que estes
// testes trancam:
//   - Progresso mostrava o anel gigante em 0 no dia 1 e no dia 90;
//   - streak7/streak30 (lib/activity.js) NUNCA destravavam, então
//     "Conquistas (x/10)" jamais chegava a 10/10;
//   - Retrospectiva sempre dizia "0 — sequência mais longa";
//   - a pill do hero da Home ("Comecem hoje a sequência de vocês") contradizia
//     o card de sequência logo abaixo ("4 dias seguidos") na MESMA dobra.
//
// Agora tudo deriva de lib/streakDays.js (o mapa `cosmic-active-days`, o mesmo
// que lib/streak.js já usava e que FUNCIONA). TZ fixo pro teste valer igual em
// qualquer máquina — precisa ser setado ANTES de qualquer uso de Date.
process.env.TZ = 'America/Sao_Paulo';

const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

// --- mocks de módulos nativos (mesmo padrão de localDay.test.js) -------------
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
    async multiRemove(keys) {
      keys.forEach((k) => mem.async.delete(k));
    },
  },
};

// coupleData importa expo-secure-store (stub vazio na web) — aqui o mock lança,
// exatamente como o stub web faz, pra exercitar o caminho real do navegador.
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

const coupleData = require('../lib/coupleData.js');
const activity = require('../lib/activity.js');
const streak = require('../lib/streak.js');
const streakDays = require('../lib/streakDays.js');

// --- relógio congelável (idêntico ao de localDay.test.js) --------------------
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
const VOCE = 'Gi';
const AMOR = 'Lu';

function reset() {
  mem.async.clear();
  restoreNow();
}

// Sequência de N dias consecutivos terminando em `endIso` (YYYY-MM-DD).
function seedRun(endIso, n) {
  const days = {};
  let cursor = endIso;
  for (let i = 0; i < n; i++) {
    days[cursor] = true;
    cursor = streakDays.previousDayStr(cursor);
  }
  mem.async.set(ACTIVE_DAYS_KEY, JSON.stringify(days));
  return days;
}

// === 1) sequência de N dias reflete nas 3 telas ==============================

test('N dias seguidos aparecem no MESMO número em Home, Progresso e Retrospectiva', async () => {
  reset();
  seedRun('2026-07-21', 12);
  setNow('2026-07-21T10:00:00-03:00');

  // Home (card de sequência + pill do hero — ambos leem getStreakInfo).
  const home = await streak.getStreakInfo();
  // Progresso (anel gigante) e Retrospectiva ("sequência mais longa").
  const progresso = await coupleData.getStreak(VOCE, AMOR);
  // Conquistas/resumos.
  const dados = await activity.collectData(VOCE, AMOR);
  restoreNow();

  assert.equal(home.currentStreak, 12, 'a fonte que sempre funcionou');
  assert.equal(progresso.count, 12, 'o anel do Progresso ficava travado em 0 pra sempre');
  assert.equal(progresso.longest, 12, 'a Retrospectiva sempre dizia "0 — sequência mais longa"');
  assert.equal(dados.streakCount, 12);
  assert.equal(dados.streakLongest, 12);
});

test('o hero e o card da Home mostram exatamente o mesmo número (mesma fonte)', async () => {
  reset();
  seedRun('2026-07-21', 4);
  setNow('2026-07-21T10:00:00-03:00');

  // O card renderiza streakInfo.currentStreak (HomeScreen);
  // a pill do hero renderiza streak.count (HeroSection), agora alimentada
  // pelo MESMO streakInfo — e nunca mais por coupleData.streak.
  const info = await streak.getStreakInfo();
  const heroPillProp = { count: info.currentStreak }; // exatamente o que a Home passa
  const derivadoDoCasal = await coupleData.getStreak(VOCE, AMOR);
  restoreNow();

  assert.equal(heroPillProp.count, info.currentStreak);
  assert.equal(heroPillProp.count, 4);
  assert.equal(
    derivadoDoCasal.count,
    info.currentStreak,
    'era isto que se contradizia na primeira dobra: pill dizia 0, card dizia 4'
  );
  assert.ok(heroPillProp.count > 0, 'a pill não pode cair no texto "Comecem hoje" com sequência viva');
});

test('sem nenhum dia ativo, tudo continua zerado (não inventa sequência)', async () => {
  reset();
  setNow('2026-07-21T10:00:00-03:00');
  const s = await coupleData.getStreak(VOCE, AMOR);
  const info = await streak.getStreakInfo();
  restoreNow();

  assert.equal(s.count, 0);
  assert.equal(s.longest, 0);
  assert.equal(s.lastDate, null);
  assert.equal(info.currentStreak, 0);
});

// === 2) conquistas destravam no limiar CERTO =================================

test('streak7 destrava em 7 e não em 6; streak30 em 30 e não em 29', async () => {
  for (const [n, esperaSete, espera30] of [
    [6, false, false],
    [7, true, false],
    [29, true, false],
    [30, true, true],
  ]) {
    reset();
    seedRun('2026-07-21', n);
    setNow('2026-07-21T10:00:00-03:00');
    const badges = await activity.computeBadges(VOCE, AMOR);
    restoreNow();

    const s7 = badges.find((b) => b.id === 'streak7');
    const s30 = badges.find((b) => b.id === 'streak30');
    assert.equal(s7.unlocked, esperaSete, `streak7 com ${n} dias`);
    assert.equal(s30.unlocked, espera30, `streak30 com ${n} dias`);
  }
});

test('as 10 conquistas voltam a ser alcançáveis: 10/10 com sequência de 30 + o resto feito', async () => {
  reset();
  seedRun('2026-07-21', 30);
  mem.async.set(
    `gff:${VOCE}:${AMOR}`,
    JSON.stringify({
      memories: Array.from({ length: 10 }, (_, i) => ({ id: String(i), date: '2026-07-10', title: `m${i}` })),
      capsules: [{ id: '1', message: 'oi', unlockAt: '2026-07-01', createdAt: '2026-07-01T00:00:00' }],
    })
  );
  const checks = {};
  for (let i = 0; i < 10; i++) checks[`t:${i}`] = true;
  mem.async.set(`gff-reconectar:${VOCE}:${AMOR}`, JSON.stringify(checks));
  mem.async.set(`gff-descobrir:${VOCE}:${AMOR}`, JSON.stringify({ linguagem: 'toque', apego: 'seguro' }));
  mem.async.set(
    `gff-agir:${VOCE}:${AMOR}`,
    JSON.stringify({ done: [1, 2, 3, 4, 5, 6, 7], favorites: [], goalSaved: 'x', goalDone: true })
  );

  setNow('2026-07-21T10:00:00-03:00');
  const badges = await activity.computeBadges(VOCE, AMOR);
  restoreNow();

  const travadas = badges.filter((b) => !b.unlocked).map((b) => b.id);
  assert.deepEqual(travadas, [], 'a celebração de 10/10 era inalcançável enquanto streak7/streak30 estavam mortas');
  assert.equal(badges.length, 10);
});

// === 3) o recorde é o recorde de VERDADE (Retrospectiva) =====================

test('longest é a MAIOR corrida do histórico, mesmo com a sequência atual quebrada', async () => {
  reset();
  // Corrida antiga de 9 dias (01→09/07), buraco, e 2 dias agora (20→21/07).
  const days = {};
  for (let d = 1; d <= 9; d++) days[`2026-07-${String(d).padStart(2, '0')}`] = true;
  days['2026-07-20'] = true;
  days['2026-07-21'] = true;
  mem.async.set(ACTIVE_DAYS_KEY, JSON.stringify(days));

  setNow('2026-07-21T10:00:00-03:00');
  const s = await coupleData.getStreak(VOCE, AMOR);
  restoreNow();

  assert.equal(s.count, 2, 'sequência atual');
  assert.equal(s.longest, 9, 'a Retrospectiva mostra o recorde real, não 0');
  assert.equal(s.lastDate, '2026-07-21');
});

test('dia coberto por Escudo comprado conta no recorde (foi pra isso que foi pago)', async () => {
  reset();
  // O 20/07 ficou marcado como 'shield' por computeCurrentStreak em outro dia.
  mem.async.set(
    ACTIVE_DAYS_KEY,
    JSON.stringify({ '2026-07-19': true, '2026-07-20': 'shield', '2026-07-21': true })
  );

  setNow('2026-07-21T10:00:00-03:00');
  const s = await coupleData.getStreak(VOCE, AMOR);
  restoreNow();

  assert.equal(s.count, 3);
  assert.equal(s.longest, 3);
});

test('computeLongestStreak atravessa a virada de mês e de ano sem quebrar a corrida', () => {
  const days = {};
  for (const d of ['2025-12-30', '2025-12-31', '2026-01-01', '2026-01-02']) days[d] = true;
  assert.equal(streakDays.computeLongestStreak(days), 4);
  // Corrida interrompida: 3 + buraco + 1.
  assert.equal(
    streakDays.computeLongestStreak({ '2026-02-27': true, '2026-02-28': true, '2026-03-01': true, '2026-03-05': true }),
    3
  );
});

// === 4) NINGUÉM PERDE SEQUÊNCIA POR CAUSA DA MUDANÇA =========================

test('sequência legada AINDA VIVA vira piso — o número nunca cai na atualização', async () => {
  reset();
  seedRun('2026-07-21', 2); // o que o app conseguiria derivar sozinho
  mem.async.set(
    `gff-streak:${VOCE}:${AMOR}`,
    JSON.stringify({ lastDate: '2026-07-21', count: 40, longest: 55 })
  );

  setNow('2026-07-21T10:00:00-03:00');
  const s = await coupleData.getStreak(VOCE, AMOR);
  restoreNow();

  assert.equal(s.count, 40, 'quem já tinha 40 dias gravados não pode acordar com 2');
  assert.equal(s.longest, 55, 'recorde histórico nunca regride');
});

test('sequência legada MORTA (último dia antigo) não ressuscita a contagem, mas o recorde fica', async () => {
  reset();
  seedRun('2026-07-21', 3);
  mem.async.set(
    `gff-streak:${VOCE}:${AMOR}`,
    JSON.stringify({ lastDate: '2026-06-01', count: 40, longest: 40 })
  );

  setNow('2026-07-21T10:00:00-03:00');
  const s = await coupleData.getStreak(VOCE, AMOR);
  restoreNow();

  assert.equal(s.count, 3, 'uma sequência de junho não pode ser exibida como sequência de hoje');
  assert.equal(s.longest, 40, 'mas o recorde de 40 continua sendo o recorde de vocês');
});

test('legado gravado ONTEM ainda está vivo (o dia de hoje não acabou)', async () => {
  reset();
  mem.async.set(
    `gff-streak:${VOCE}:${AMOR}`,
    JSON.stringify({ lastDate: '2026-07-20', count: 11, longest: 11 })
  );

  setNow('2026-07-21T10:00:00-03:00');
  const s = await coupleData.getStreak(VOCE, AMOR);
  restoreNow();

  assert.equal(s.count, 11);
  assert.equal(s.lastDate, '2026-07-20');
});

// === 5) getCoupleData (o que a Home recebe) carrega o número derivado ========

test('getCoupleData entrega a sequência derivada — a Home não precisa de outra leitura', async () => {
  reset();
  mem.async.set('gff-couple-profile', JSON.stringify({ voce: VOCE, amor: AMOR, sa: 'Áries', sb: 'Leão' }));
  seedRun('2026-07-21', 5);

  setNow('2026-07-21T10:00:00-03:00');
  const data = await coupleData.getCoupleData();
  restoreNow();

  assert.equal(data.streak.count, 5, 'era sempre 0 aqui — a origem da pill mentirosa do hero');
  assert.equal(data.streak.longest, 5);
});

// === 6) o dia LOCAL continua valendo (não regredir o fix de 26/07) ===========

test('uso às 22h30 conta no dia certo também na sequência do CASAL', async () => {
  reset();
  setNow('2026-07-20T09:00:00-03:00');
  await streak.recordActiveDay();
  setNow('2026-07-21T22:30:00-03:00'); // dia UTC já é 22/07
  await streak.recordActiveDay();

  const s = await coupleData.getStreak(VOCE, AMOR);
  restoreNow();

  assert.equal(s.count, 2, 'o buraco fantasma da virada UTC não pode reaparecer por aqui');
  assert.equal(s.lastDate, '2026-07-21');
});
