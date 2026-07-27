// Testes do motor de missões diárias (lib/missions.js):
// determinismo por data local, não-reconclusão, crédito único (inclusive em
// corrida de toque duplo), virada de dia zerando missões/evidências e bônus
// 3/3 único. Mesmo esquema de mock por require-cache dos outros testes
// (coupleData.saveProfile.test.js) — AsyncStorage em memória e um stub de
// react-native (lib/journal.js → lib/webPush.js importa Platform).
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
    async multiRemove(keys) {
      keys.forEach((k) => mem.delete(k));
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

const missions = require('../lib/missions.js');
const tokens = require('../lib/tokens.js');

// Dia A de propósito ÀS 22h LOCAL: em qualquer fuso a oeste de UTC (Brasil
// incluso) o dia UTC já é o seguinte — se alguém regredir pra toISOString(),
// os testes de "mesmo dia local" quebram na hora.
const DAY_A_NIGHT = new Date(2026, 0, 15, 22, 0, 0);
const DAY_A_MORNING = new Date(2026, 0, 15, 8, 0, 0);
const DAY_B = new Date(2026, 0, 16, 10, 0, 0);

function reset() {
  mem.clear();
}

// Fabrica a evidência que o verificador da missão exige — do MESMO jeito que
// o app real produz: marcador de ação via recordMissionAction, ou entrada no
// Diário Cósmico ('cosmic-journal', formato de lib/journal.js saveJournalEntry).
async function provideEvidence(mission, now) {
  const v = mission.verify;
  if (v.kind === 'action') {
    await missions.recordMissionAction(v.action, now);
    return;
  }
  const entry = {
    id: `t-${Math.random().toString(36).slice(2, 8)}`,
    type: v.kind === 'journal-type' ? v.type : 'tarot',
    typeLabel: 'Teste',
    title: 'Leitura de teste',
    body: 'corpo',
    date: new Date(now).toISOString(),
    voiceTranscript: v.kind === 'journal-voice' ? 'meu insight falado' : null,
    aiInsight: null,
  };
  const cur = JSON.parse(mem.get('cosmic-journal') || '[]');
  cur.unshift(entry);
  mem.set('cosmic-journal', JSON.stringify(cur));
}

async function completeAll(now) {
  const list = await missions.getTodaysMissions(now);
  for (const m of list) {
    await provideEvidence(m, now);
    const res = await missions.completeMission(m.id, now);
    assert.strictEqual(res.ok, true, `missão ${m.id} devia concluir com evidência`);
  }
  return list;
}

test('determinismo: mesma data local => mesmas 3 missões (mesmo com dia UTC diferente), sem Math.random', async () => {
  reset();
  const origRandom = Math.random;
  Math.random = () => {
    throw new Error('sorteio de missões não pode usar Math.random');
  };
  try {
    const a = await missions.getTodaysMissions(DAY_A_NIGHT);
    const b = await missions.getTodaysMissions(DAY_A_MORNING);
    assert.deepStrictEqual(
      a.map((m) => m.id),
      b.map((m) => m.id),
      '22h e 8h do mesmo dia LOCAL têm que sortear as mesmas missões (convenção local, não UTC)'
    );
    assert.strictEqual(a.length, 3);
    assert.strictEqual(new Set(a.map((m) => m.id)).size, 3, 'sem missão repetida no dia');
  } finally {
    Math.random = origRandom;
  }
});

test('determinismo: estável em chamadas repetidas ao longo de 60 dias e com variedade real', async () => {
  reset();
  const seen = new Set();
  for (let i = 0; i < 60; i++) {
    const day = new Date(2026, 2, 1 + i, 12, 0, 0);
    const first = (await missions.getTodaysMissions(day)).map((m) => m.id);
    const second = (await missions.getTodaysMissions(day)).map((m) => m.id);
    assert.deepStrictEqual(first, second, `sorteio de ${day.toDateString()} mudou entre duas chamadas`);
    first.forEach((id) => seen.add(id));
  }
  assert.ok(seen.size >= 6, `esperava rotação de tipos ao longo de 60 dias, só vieram ${seen.size}`);
});

test('composição saudável: sempre 1 universal + 1 explorar + 1 leitura (ninguém fica só com missão trancada)', async () => {
  reset();
  const byId = new Map(missions.MISSION_POOL.map((m) => [m.id, m]));
  for (let i = 0; i < 30; i++) {
    const day = new Date(2026, 5, 1 + i, 12, 0, 0);
    const groups = (await missions.getTodaysMissions(day)).map((m) => byId.get(m.id).group);
    assert.deepStrictEqual(groups, ['universal', 'explorar', 'leitura']);
  }
});

test('verificador plugável: sem evidência não conclui e não credita nada', async () => {
  reset();
  const [first] = await missions.getTodaysMissions(DAY_A_NIGHT);
  const res = await missions.completeMission(first.id, DAY_A_NIGHT);
  assert.strictEqual(res.ok, false);
  assert.strictEqual(res.reason, 'sem-evidencia');
  assert.strictEqual(await tokens.getTokenBalance(), 0, 'saldo não pode se mexer sem evidência');
});

test('missão fora do sorteio de hoje é recusada', async () => {
  reset();
  const res = await missions.completeMission('missao-inventada', DAY_A_NIGHT);
  assert.strictEqual(res.ok, false);
  assert.strictEqual(res.reason, 'nao-e-missao-de-hoje');
});

test('evidência de Diário: entrada de HOJE conclui; entrada de ontem não serve', async () => {
  reset();
  const list = await missions.getTodaysMissions(DAY_B);
  const reading = list[2]; // grupo leitura — sempre verificada pelo Diário

  // Evidência datada de ONTEM (dia A) não prova a missão de hoje (dia B).
  await provideEvidence(reading, DAY_A_NIGHT);
  const nope = await missions.completeMission(reading.id, DAY_B);
  assert.strictEqual(nope.ok, false, 'leitura de ontem não pode completar missão de hoje');
  assert.strictEqual(nope.reason, 'sem-evidencia');

  // Evidência de HOJE prova.
  await provideEvidence(reading, DAY_B);
  const yes = await missions.completeMission(reading.id, DAY_B);
  assert.strictEqual(yes.ok, true);
  assert.strictEqual(yes.awarded, missions.MISSION_REWARD);
});

test('não-reconclusão + crédito único: segunda conclusão falha e o saldo não cresce', async () => {
  reset();
  const [first] = await missions.getTodaysMissions(DAY_A_NIGHT);
  await provideEvidence(first, DAY_A_NIGHT);

  const one = await missions.completeMission(first.id, DAY_A_NIGHT);
  assert.strictEqual(one.ok, true);
  assert.strictEqual(one.awarded, missions.MISSION_REWARD);
  assert.strictEqual(await tokens.getTokenBalance(), missions.MISSION_REWARD);

  const two = await missions.completeMission(first.id, DAY_A_NIGHT);
  assert.strictEqual(two.ok, false);
  assert.strictEqual(two.reason, 'ja-concluida');
  assert.strictEqual(two.awarded, 0);
  assert.strictEqual(await tokens.getTokenBalance(), missions.MISSION_REWARD, 'reconcluir não pode recreditar');

  const history = await tokens.getTokenHistory();
  assert.strictEqual(history.length, 1, 'exatamente UM crédito no histórico da moeda');
});

test('anti-farm em corrida: dois toques simultâneos creditam UMA vez só', async () => {
  reset();
  const [first] = await missions.getTodaysMissions(DAY_A_NIGHT);
  await provideEvidence(first, DAY_A_NIGHT);

  const [r1, r2] = await Promise.all([
    missions.completeMission(first.id, DAY_A_NIGHT),
    missions.completeMission(first.id, DAY_A_NIGHT),
  ]);
  const oks = [r1, r2].filter((r) => r.ok);
  assert.strictEqual(oks.length, 1, 'só uma das chamadas concorrentes pode vencer');
  assert.strictEqual(await tokens.getTokenBalance(), missions.MISSION_REWARD);
});

test('flag atômica: conclusão e crédito do dia ficam gravados JUNTOS no estado', async () => {
  reset();
  const [first] = await missions.getTodaysMissions(DAY_A_NIGHT);
  await provideEvidence(first, DAY_A_NIGHT);
  await missions.completeMission(first.id, DAY_A_NIGHT);

  const state = JSON.parse(mem.get('cosmic-missions-daily'));
  assert.strictEqual(state.completed[first.id], true);
  assert.strictEqual(state.tokensEarned, missions.MISSION_REWARD);
  assert.strictEqual(state.date, '2026-01-15', 'estado datado pelo dia LOCAL (22h local ainda é dia 15)');
});

test('bônus 3/3: só com as três concluídas, e uma única vez', async () => {
  reset();

  const early = await missions.claimDailyBonus(DAY_A_NIGHT);
  assert.strictEqual(early.ok, false);
  assert.strictEqual(early.reason, 'missoes-pendentes');

  await completeAll(DAY_A_NIGHT);

  const progress = await missions.getMissionProgress(DAY_A_NIGHT);
  assert.strictEqual(progress.done, 3);
  assert.strictEqual(progress.allDone, true);
  assert.strictEqual(progress.bonusAvailable, true);

  const claim = await missions.claimDailyBonus(DAY_A_NIGHT);
  assert.strictEqual(claim.ok, true);
  assert.strictEqual(claim.awarded, missions.ALL_DONE_BONUS);

  const again = await missions.claimDailyBonus(DAY_A_NIGHT);
  assert.strictEqual(again.ok, false);
  assert.strictEqual(again.reason, 'ja-resgatado');

  const expected = 3 * missions.MISSION_REWARD + missions.ALL_DONE_BONUS;
  assert.strictEqual(await tokens.getTokenBalance(), expected);
  assert.strictEqual(expected, missions.MISSIONS_DAILY_TOKEN_CAP, 'dia perfeito rende exatamente o teto diário');
});

test('virada de dia (convenção LOCAL): missões zeram, evidências de ação não sobrevivem, bônus volta a exigir 3/3', async () => {
  reset();

  // Dia A completo: 3 missões + bônus.
  await completeAll(DAY_A_NIGHT);
  await missions.claimDailyBonus(DAY_A_NIGHT);
  const balanceAfterA = await tokens.getTokenBalance();

  // Dia B: tudo zerado.
  const listB = await missions.getTodaysMissions(DAY_B);
  assert.ok(listB.every((m) => m.done === false), 'nenhuma missão pode amanhecer concluída');
  const progressB = await missions.getMissionProgress(DAY_B);
  assert.strictEqual(progressB.done, 0);
  assert.strictEqual(progressB.bonusClaimed, false);
  assert.strictEqual(progressB.tokensEarnedToday, 0);

  // Marcador de ação gravado ONTEM não completa a missão de ação de hoje.
  const actionMission = listB.find((m) => m.verify.kind === 'action');
  const res = await missions.completeMission(actionMission.id, DAY_B);
  assert.strictEqual(res.ok, false, 'ação marcada ontem não pode valer hoje');

  // Com evidência de HOJE, volta a funcionar (e credita de novo, dia novo).
  await provideEvidence(actionMission, DAY_B);
  const ok = await missions.completeMission(actionMission.id, DAY_B);
  assert.strictEqual(ok.ok, true);
  assert.strictEqual(await tokens.getTokenBalance(), balanceAfterA + missions.MISSION_REWARD);
});

test('recordMissionAction: idempotente e recusa chave desconhecida (typo em tela não vira marcador fantasma)', async () => {
  reset();
  assert.strictEqual(await missions.recordMissionAction('acao-que-nao-existe', DAY_A_NIGHT), false);
  assert.strictEqual(mem.has('cosmic-missions-daily'), false, 'chave desconhecida não pode gravar estado');

  const key = missions.MISSION_ACTIONS.PENSAMENTO_LIDO;
  assert.strictEqual(await missions.recordMissionAction(key, DAY_A_NIGHT), true);
  assert.strictEqual(await missions.recordMissionAction(key, DAY_A_NIGHT), true);
  const state = JSON.parse(mem.get('cosmic-missions-daily'));
  assert.deepStrictEqual(state.actions, { [key]: true });
});

// ---------------------------------------------------------------------------
// Ataques da auditoria anti-farm (27/07/2026) — cada teste reproduz o golpe
// e prova que ele rende ZERO tokens.

test('ataque de relógio: voltar o aparelho pra ontem NÃO zera o estado nem recredita (flip rende 0)', async () => {
  reset();

  // Dia B (o "futuro"): dia perfeito, teto batido.
  await completeAll(DAY_B);
  await missions.claimDailyBonus(DAY_B);
  const balanceAfterB = await tokens.getTokenBalance();
  assert.strictEqual(balanceAfterB, missions.MISSIONS_DAILY_TOKEN_CAP);

  // Golpe: relógio volta pro dia A. Antes do fix, stored.date !== today
  // zerava tudo e o ciclo B→A→B rendia +25 por flip, sem limite.
  const listA = await missions.getTodaysMissions(DAY_A_MORNING);
  let farmed = 0;
  for (const m of listA) {
    await provideEvidence(m, DAY_A_MORNING);
    const res = await missions.completeMission(m.id, DAY_A_MORNING);
    farmed += res.awarded; // pode ser ok:true com 0, ou 'ja-concluida' — nunca > 0
  }
  const bonus = await missions.claimDailyBonus(DAY_A_MORNING);
  farmed += bonus.awarded;

  assert.strictEqual(farmed, 0, 'rollback de relógio não pode render nenhum token');
  assert.strictEqual(await tokens.getTokenBalance(), balanceAfterB, 'saldo intocado após o flip');

  // E voltando pro dia B (relógio "conserta"): também nada — já foi tudo pago.
  const listB = await missions.getTodaysMissions(DAY_B);
  for (const m of listB) {
    const res = await missions.completeMission(m.id, DAY_B);
    assert.strictEqual(res.awarded, 0);
  }
  assert.strictEqual(await tokens.getTokenBalance(), balanceAfterB);
});

test('ataque de wipe: apagar só cosmic-missions-daily mantendo o saldo não recredita (extrato segura o teto)', async () => {
  reset();

  await completeAll(DAY_A_NIGHT);
  await missions.claimDailyBonus(DAY_A_NIGHT);
  const balance = await tokens.getTokenBalance();
  assert.strictEqual(balance, missions.MISSIONS_DAILY_TOKEN_CAP);

  // Golpe: some só o estado do dia; saldo, histórico e Diário ficam.
  mem.delete('cosmic-missions-daily');

  const list = await missions.getTodaysMissions(DAY_A_NIGHT);
  assert.ok(list.every((m) => !m.done), 'wipe zera os flags — é exatamente o golpe');

  let farmed = 0;
  for (const m of list) {
    await provideEvidence(m, DAY_A_NIGHT); // refaz as evidências (trivial pro atacante)
    const res = await missions.completeMission(m.id, DAY_A_NIGHT);
    farmed += res.awarded;
  }
  const bonus = await missions.claimDailyBonus(DAY_A_NIGHT);
  farmed += bonus.awarded;

  assert.strictEqual(farmed, 0, 'com o extrato do dia batendo o teto, o wipe não pode render nada');
  assert.strictEqual(await tokens.getTokenBalance(), balance, 'saldo idêntico ao de antes do wipe');

  const missionCredits = (await tokens.getTokenHistory()).filter((h) => h.meta && h.meta.kind === 'mission');
  assert.strictEqual(missionCredits.length, 4, 'continuam exatamente os 4 créditos legítimos (3 missões + bônus)');
});

test('trava cross-aba (web): reivindicação síncrona em localStorage bloqueia crédito duplo entre abas', async () => {
  reset();

  // Simula o ambiente web: window.localStorage síncrono, compartilhado entre
  // "abas" (a fila serialized é por aba; a trava é o que cruza abas).
  const webStore = new Map();
  global.window = {
    localStorage: {
      getItem: (k) => (webStore.has(k) ? webStore.get(k) : null),
      setItem: (k, v) => webStore.set(k, String(v)),
      removeItem: (k) => webStore.delete(k),
    },
  };
  try {
    const [first] = await missions.getTodaysMissions(DAY_A_NIGHT);
    await provideEvidence(first, DAY_A_NIGHT);
    const one = await missions.completeMission(first.id, DAY_A_NIGHT);
    assert.strictEqual(one.ok, true);
    assert.strictEqual(one.awarded, missions.MISSION_REWARD);

    // "Aba B": enxerga um AsyncStorage onde a missão ainda parece pendente
    // (pior caso: estado E histórico ainda não sincronizados na visão dela).
    mem.delete('cosmic-missions-daily');
    mem.delete('cosmic-tokens-history');
    await provideEvidence(first, DAY_A_NIGHT);
    const two = await missions.completeMission(first.id, DAY_A_NIGHT);
    assert.strictEqual(two.ok, false, 'a reivindicação síncrona da aba A tem que barrar a aba B');
    assert.strictEqual(two.reason, 'ja-concluida');
    assert.strictEqual(two.awarded, 0);
    assert.strictEqual(await tokens.getTokenBalance(), missions.MISSION_REWARD, 'crédito único mesmo entre abas');
  } finally {
    delete global.window;
  }
});

test('crash no meio do claim: flag gravada antes do saldo — nunca duplica, no pior caso deixa de pagar', async () => {
  reset();
  await completeAll(DAY_A_NIGHT);

  // Simula "fechou o app" entre a gravação do estado e o crédito no saldo:
  // o awardTokens falha (storage do saldo morre), mas o estado já foi salvo.
  const balanceBefore = await tokens.getTokenBalance();
  const origSetItem = asyncStorageMock.default.setItem;
  asyncStorageMock.default.setItem = async (k, v) => {
    if (k === 'cosmic-tokens-balance') throw new Error('app fechado no meio');
    return origSetItem(k, v);
  };
  try {
    await missions.claimDailyBonus(DAY_A_NIGHT);
  } finally {
    asyncStorageMock.default.setItem = origSetItem;
  }

  // Direção de falha correta: bônus marcado como resgatado, saldo não subiu…
  assert.strictEqual(await tokens.getTokenBalance(), balanceBefore, 'crash não pode ter creditado');
  const again = await missions.claimDailyBonus(DAY_A_NIGHT);
  // …e reabrir o app NÃO permite farmar o bônus de novo.
  assert.strictEqual(again.ok, false);
  assert.strictEqual(again.reason, 'ja-resgatado');
});

test('pool: ~10 tipos, ids únicos e todo verificador é de um tipo conhecido', () => {
  const pool = missions.MISSION_POOL;
  assert.strictEqual(pool.length, 10);
  assert.strictEqual(new Set(pool.map((m) => m.id)).size, pool.length);
  const kinds = new Set(['action', 'journal-any', 'journal-type', 'journal-voice']);
  for (const m of pool) {
    assert.ok(kinds.has(m.verify.kind), `verificador desconhecido em ${m.id}: ${m.verify.kind}`);
    if (m.verify.kind === 'action') {
      assert.ok(Object.values(missions.MISSION_ACTIONS).includes(m.verify.action), `ação de ${m.id} fora de MISSION_ACTIONS`);
    }
  }
});
