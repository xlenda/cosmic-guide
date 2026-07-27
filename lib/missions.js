// lib/missions.js
// Missões diárias — o motor do "faz as missões do dia, acumula token" pedido
// pelo dono (26/07/2026). 3 missões por dia, sorteadas DETERMINISTICAMENTE
// pela data LOCAL (mesmo padrão do "Pensamento cósmico" em lib/dailyThought.js
// e da frase em lib/lovePhrase.js — todo mundo vê as mesmas missões no mesmo
// dia, mudam sozinhas à meia-noite local, sem Math.random e sem rede).
//
// Honestidade e retenção saudável:
// - Toda missão usa SÓ ações que o app já registra de verdade (Diário Cósmico
//   pra leituras; um marcador leve de ação pras telas de conteúdo). Nunca
//   inventamos progresso nem damos token por algo que não aconteceu.
// - A recompensa entra pelo MESMO saldo que a Loja gasta (lib/tokens.js
//   awardTokens/spendTokens) — nada de moeda paralela.
// - Anti-farm: estado por dia local; missão concluída não reconclui; o flag
//   de conclusão é gravado JUNTO do crédito (numa única escrita, ANTES de
//   premiar — mesma filosofia de lib/tarotCollection.js: se algo falhar no
//   meio, preferimos deixar de premiar uma vez a arriscar premiar duas).
// - Teto próprio por dia (MISSIONS_DAILY_TOKEN_CAP): as missões nunca rendem
//   mais que 3×comum + bônus num dia, mesmo com estado corrompido. Não
//   consumimos o teto de LEITURAS (DAILY_READING_TOKEN_CAP em lib/tokens.js)
//   de propósito — aquele teto é exclusivo do fluxo de leituras
//   (awardReadingTokens é "chamado só por lib/readingCompletion.js"), e
//   misturar os dois faria missão "roubar" o teto de quem ainda vai ler.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { awardTokens, getTokenBalance, getTokenHistory } from './tokens';
import { getJournalEntries } from './journal';
import { localDayStr } from './localDay';

const STATE_KEY = 'cosmic-missions-daily';
// Trava síncrona cross-aba (só web) — ver webClaimOnce().
const CLAIMS_KEY = 'cosmic-missions-claims';

export const MISSION_REWARD = 5; // missão comum
export const ALL_DONE_BONUS = 10; // bônus por fechar as 3 do dia
// Teto absoluto do que missões podem render num dia (3 comuns + bônus) —
// cinto e suspensório por cima do anti-farm de estado.
export const MISSIONS_DAILY_TOKEN_CAP = 3 * MISSION_REWARD + ALL_DONE_BONUS;

// Ações que as TELAS marcam via recordMissionAction() — são as ações de
// "consumo de conteúdo" que o app ainda não persistia em lugar nenhum (as de
// leitura já ficam provadas pelo Diário Cósmico, ver verificadores abaixo).
// Plugs ativos: PENSAMENTO_LIDO (ponte na DailyMissionsCard via chave da
// Home), FRASE_COMPARTILHADA (HomeScreen, no share com sucesso) e
// CHAT_MENSAGEM_ENVIADA (ChatScreen, no envio).
export const MISSION_ACTIONS = {
  PENSAMENTO_LIDO: 'pensamento-lido',
  FRASE_COMPARTILHADA: 'frase-compartilhada',
  // Horóscopo e Calendário Lunar NÃO precisam mais de plug: essas telas já
  // criam entrada no Diário Cósmico ao serem abertas (1x/dia local — ver
  // HoroscopeScreen/LunarCalendarScreen, auditoria de retenção 25/07), e as
  // missões verificam por essa entrada (journal-type abaixo). As chaves ficam
  // só pra um eventual <MissionPing> plugado por outro time ser um no-op
  // inofensivo em vez de "chave desconhecida" nos logs de quem debugar.
  CALENDARIO_LUNAR_VISITADO: 'calendario-lunar-visitado',
  HOROSCOPO_LIDO: 'horoscopo-lido',
  CHAT_MENSAGEM_ENVIADA: 'chat-mensagem-enviada',
};

// Pool de tipos de missão. Cada tipo declara um verificador plugável
// (`verify`) apontando pro registro EXISTENTE que prova a ação:
// - { kind: 'action', action }        → marcador do dia gravado pela tela
//                                       (recordMissionAction), zera na virada.
// - { kind: 'journal-any' }           → qualquer entrada do Diário Cósmico com
//                                       data de HOJE (toda leitura concluída
//                                       passa por lib/readingCompletion.js →
//                                       saveJournalEntry, então o registro já
//                                       existe sem plug nenhum).
// - { kind: 'journal-type', type }    → entrada de hoje de um tipo específico
//                                       (mesmos `type` de lib/journal.js).
// - { kind: 'journal-voice' }         → entrada de hoje com insight de voz
//                                       gravado (voiceTranscript preenchido).
//
// `group` controla o sorteio (1 universal + 1 explorar + 1 leitura por dia):
// - universal: sempre completável por QUALQUER pessoa, assinante ou não
//   (Pensamento e Frase do Dia moram na Home, sem paywall) — garante que
//   ninguém abre as missões e encontra só coisa trancada.
// - explorar: telas de conteúdo (podem ter trava de 1 uso grátis pra quem
//   não assina — ver lib/featureUsage.js).
// - leitura: provadas pelo Diário Cósmico.
export const MISSION_POOL = [
  // ---- universal (2) — sorteia 1/dia
  {
    id: 'pensamento-do-dia',
    group: 'universal',
    emoji: '💭',
    title: 'Leia o Pensamento Cósmico de hoje',
    desc: 'Abra o card do Pensamento Cósmico na Home e leia com calma.',
    verify: { kind: 'action', action: MISSION_ACTIONS.PENSAMENTO_LIDO },
  },
  {
    id: 'compartilhar-frase',
    group: 'universal',
    emoji: '💌',
    title: 'Compartilhe a Frase do Dia',
    desc: 'Mande a frase de amor de hoje pra alguém especial.',
    verify: { kind: 'action', action: MISSION_ACTIONS.FRASE_COMPARTILHADA },
  },
  // ---- explorar (3) — sorteia 1/dia
  // Estas duas verificam pelo Diário Cósmico, NÃO por marcador de ação: as
  // telas (com outro time agora, proibidas de editar) JÁ criam uma entrada de
  // Diário com esses types ao serem abertas, 1x/dia local — evidência real
  // que existe hoje, sem depender de nenhum plug futuro. Antes verificavam
  // por ação que NENHUMA tela gravava = missão impossível de completar.
  {
    id: 'calendario-lunar',
    group: 'explorar',
    emoji: '🌙',
    title: 'Visite o Calendário Lunar',
    desc: 'Veja em que fase a Lua está hoje.',
    verify: { kind: 'journal-type', type: 'lunarCalendar' },
  },
  {
    id: 'horoscopo-do-dia',
    group: 'explorar',
    emoji: '✨',
    title: 'Leia seu horóscopo de hoje',
    desc: 'Confira o que o céu diz pro seu signo hoje.',
    verify: { kind: 'journal-type', type: 'horoscope' },
  },
  {
    id: 'conversa-mistica',
    group: 'explorar',
    emoji: '🔮',
    title: 'Converse com um guia místico',
    desc: 'Envie uma mensagem no Chat Místico.',
    verify: { kind: 'action', action: MISSION_ACTIONS.CHAT_MENSAGEM_ENVIADA },
  },
  // ---- leitura (5) — sorteia 1/dia (provadas pelo Diário, sem plug)
  {
    id: 'tiragem-tarot',
    group: 'leitura',
    emoji: '🃏',
    title: 'Tire suas cartas de Tarô',
    desc: 'Complete uma tiragem de Tarô hoje.',
    verify: { kind: 'journal-type', type: 'tarot' },
  },
  {
    id: 'leitura-do-dia',
    group: 'leitura',
    emoji: '📖',
    title: 'Complete uma leitura',
    desc: 'Qualquer oráculo vale: Tarô, Palma, Café, Sonhos…',
    verify: { kind: 'journal-any' },
  },
  {
    id: 'ritual-do-cafe',
    group: 'leitura',
    emoji: '☕',
    title: 'Faça o Ritual do Café',
    desc: 'Complete uma leitura de borra de café hoje.',
    verify: { kind: 'journal-type', type: 'coffee' },
  },
  {
    id: 'leitura-de-sonho',
    group: 'leitura',
    emoji: '😴',
    title: 'Interprete um sonho',
    desc: 'Registre um sonho e receba a interpretação hoje.',
    verify: { kind: 'journal-type', type: 'dream' },
  },
  {
    id: 'insight-no-diario',
    group: 'leitura',
    emoji: '🎙️',
    title: 'Grave um insight no Diário',
    desc: 'Grave um insight seu numa leitura de hoje no Diário Cósmico.',
    verify: { kind: 'journal-voice' },
  },
];

const KNOWN_ACTIONS = new Set(Object.values(MISSION_ACTIONS));

// ---------------------------------------------------------------------------
// Dia LOCAL (YYYY-MM-DD) — convenção única do app, importada de lib/localDay.js
// (NUNCA toISOString(): à noite o dia UTC já virou e o local não). Alias local
// só pra manter os call sites curtos.
const localDayKey = localDayStr;

// Mesmo hash determinístico de lib/lovePhrase.js / screens/AgirScreen.js —
// nada de Math.random em nenhum caminho deste módulo.
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

async function readJson(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// Sorteio do dia: dentro de cada grupo, ranqueia por hash(dataLocal|id) e
// pega o menor — determinístico pela data, varia de um dia pro outro, e a
// composição 1 universal + 1 explorar + 1 leitura garante que sempre existe
// pelo menos uma missão completável por qualquer pessoa (sem paywall).
function pickFromGroup(group, dateStr) {
  return MISSION_POOL
    .filter((m) => m.group === group)
    .map((m) => ({ m, rank: hashStr(`${dateStr}|${m.id}`) }))
    .sort((a, b) => a.rank - b.rank || (a.m.id < b.m.id ? -1 : 1))[0].m;
}

function todaysMissionDefs(now = new Date()) {
  const dateStr = localDayKey(now);
  return [
    pickFromGroup('universal', dateStr),
    pickFromGroup('explorar', dateStr),
    pickFromGroup('leitura', dateStr),
  ];
}

// Estado do DIA em AsyncStorage — { date, completed, actions, tokensEarned,
// bonusClaimed }. Estado de um dia ANTERIOR = zerado na leitura (virada de
// dia pela mesma convenção local acima); nada de ontem sobrevive, nem os
// marcadores de ação (senão a evidência de ontem completaria a missão de
// hoje de graça).
//
// ANTI-FARM de relógio (auditoria 27/07/2026): a comparação é `<` e NÃO `!==`
// de propósito. Com `!==`, VOLTAR o relógio do aparelho também zerava o
// estado — aí o ciclo "volta 1 dia, faz as 3 + bônus (+25), adianta de volta
// (+25 de novo)" rendia ~25 tokens por flip de relógio, sem limite. Com `<`,
// estado datado de um dia FUTURO (só existe se o relógio andou pra frente e
// voltou) é MANTIDO como está: os flags de conclusão e o tokensEarned (já no
// teto) seguem valendo, então o rollback credita 0. Quem adiantou o relógio
// "consome" os dias adiantados — quando a data real alcançar, as missões já
// estarão feitas. Viajante legítimo cruzando fuso pra trás perde no máximo
// as missões de 1 dia — preço aceitável pra fechar farm infinito.
// (YYYY-MM-DD zero-padded compara certo como string.)
async function readDayState(now) {
  const today = localDayKey(now);
  const stored = await readJson(STATE_KEY, null);
  if (!stored || typeof stored.date !== 'string' || stored.date < today) {
    return { date: today, completed: {}, actions: {}, tokensEarned: 0, bonusClaimed: false };
  }
  return {
    date: stored.date, // hoje, ou um dia futuro preservado (relógio voltou)
    completed: stored.completed && typeof stored.completed === 'object' ? stored.completed : {},
    actions: stored.actions && typeof stored.actions === 'object' ? stored.actions : {},
    tokensEarned: Number.isFinite(Number(stored.tokensEarned)) ? Math.max(0, Number(stored.tokensEarned)) : 0,
    bonusClaimed: !!stored.bonusClaimed,
  };
}

// Quanto as missões JÁ renderam hoje segundo o EXTRATO da moeda (lançamentos
// com meta {kind:'mission', day} gravados por este módulo em awardTokens).
// É o cinto extra do teto diário: se alguém apagar só o estado do dia
// (cosmic-missions-daily) mantendo o saldo, o histórico ainda prova o que já
// foi pago hoje e o teto continua valendo. Quem apagar TAMBÉM o histórico já
// está editando o storage na mão — nesse ponto editaria o saldo direto, e
// isso só um backend resolveria (app é local-first por decisão).
async function missionTokensFromHistory(today) {
  try {
    const history = await getTokenHistory();
    return (Array.isArray(history) ? history : []).reduce(
      (sum, h) =>
        h && h.meta && h.meta.kind === 'mission' && h.meta.day === today && Number(h.amount) > 0
          ? sum + Number(h.amount)
          : sum,
      0
    );
  } catch {
    return 0;
  }
}

// Trava síncrona cross-aba (SÓ web): a fila `serialized` abaixo vale dentro
// de UMA aba (variável de módulo) — duas abas do navegador são dois runtimes
// e podiam creditar a mesma missão 2x correndo entre o read e o write do
// AsyncStorage. Aqui usamos window.localStorage DIRETO (síncrono, mesmo store
// que o AsyncStorage web usa por baixo) num bloco sem nenhum await: checar e
// gravar a reivindicação vira uma operação indivisível pro event loop da aba.
// Resta uma janela teórica de nanossegundos entre processos do navegador —
// registrada como risco residual aceito (fechar 100% exigiria backend).
// Em native/testes (sem window) devolve true e o resto das defesas segue.
function webClaimOnce(day, claimId) {
  if (typeof window === 'undefined' || !window.localStorage) return true;
  try {
    let data = null;
    try {
      const raw = window.localStorage.getItem(CLAIMS_KEY);
      data = raw ? JSON.parse(raw) : null;
    } catch {}
    if (!data || data.date !== day || !Array.isArray(data.ids)) data = { date: day, ids: [] };
    if (data.ids.includes(claimId)) return false;
    data.ids.push(claimId);
    window.localStorage.setItem(CLAIMS_KEY, JSON.stringify(data));
    return true;
  } catch {
    return true; // storage quebrado não pode travar o fluxo honesto
  }
}

// Verificador plugável — devolve true só quando o registro que prova a ação
// existe HOJE (dia local). Nunca lança: dado quebrado no Diário simplesmente
// não conta como evidência.
async function isMissionVerified(mission, state, now) {
  const v = mission.verify || {};
  if (v.kind === 'action') return !!state.actions[v.action];

  const today = localDayKey(now);
  const entries = await getJournalEntries();
  const todays = (Array.isArray(entries) ? entries : []).filter((e) => {
    if (!e || !e.date) return false;
    const d = new Date(e.date);
    return !Number.isNaN(d.getTime()) && localDayKey(d) === today;
  });
  if (v.kind === 'journal-any') return todays.length > 0;
  if (v.kind === 'journal-type') return todays.some((e) => e.type === v.type);
  if (v.kind === 'journal-voice') return todays.some((e) => !!e.voiceTranscript);
  return false;
}

// Fila de escrita: os 3 mutadores (recordMissionAction/completeMission/
// claimDailyBonus) rodam serializados — dois toques rápidos no mesmo botão
// não leem o mesmo estado "antes" e creditam duas vezes (AsyncStorage não tem
// transação; a fila faz o papel dela aqui dentro do módulo).
let opChain = Promise.resolve();
function serialized(fn) {
  const run = opChain.then(fn, fn);
  opChain = run.then(
    () => {},
    () => {}
  );
  return run;
}

// As 3 missões de hoje, com o status de conclusão — pronto pra tela listar.
// `verify` vai junto pra UI poder rotear ("Ir fazer") e pros testes provarem
// que o verificador é plugável, mas o crédito NUNCA passa por fora de
// completeMission().
export async function getTodaysMissions(now = new Date()) {
  const defs = todaysMissionDefs(now);
  const state = await readDayState(now);
  return defs.map((m) => ({
    id: m.id,
    group: m.group,
    emoji: m.emoji,
    title: m.title,
    desc: m.desc,
    reward: MISSION_REWARD,
    verify: { ...m.verify },
    done: !!state.completed[m.id],
  }));
}

// Marca que uma ação de conteúdo aconteceu AGORA (chamado pelas telas, uma
// linha cada). Só grava o marcador do dia — não conclui missão nem credita
// nada sozinho (o crédito é sempre de completeMission, que re-verifica).
// Chave desconhecida devolve false sem gravar (typo na tela não vira um
// marcador fantasma impossível de debugar).
export function recordMissionAction(actionKey, now = new Date()) {
  return serialized(async () => {
    if (!KNOWN_ACTIONS.has(actionKey)) return false;
    const state = await readDayState(now);
    if (state.actions[actionKey]) return true; // idempotente
    state.actions[actionKey] = true;
    await writeJson(STATE_KEY, state);
    return true;
  });
}

// Conclui uma missão de hoje: exige que ela esteja no sorteio de hoje, que
// ainda não tenha sido concluída e que o verificador encontre a evidência.
// O flag de conclusão + o total creditado do dia são gravados numa ÚNICA
// escrita, ANTES do crédito no saldo (se falhar no meio, ninguém farma; no
// pior caso a pessoa deixa de ganhar uma vez — mesma escolha consciente de
// lib/tarotCollection.js).
export function completeMission(missionId, now = new Date()) {
  return serialized(async () => {
    const defs = todaysMissionDefs(now);
    const mission = defs.find((m) => m.id === missionId);
    if (!mission) {
      return { ok: false, reason: 'nao-e-missao-de-hoje', awarded: 0 };
    }

    const state = await readDayState(now);
    if (state.completed[missionId]) {
      return { ok: false, reason: 'ja-concluida', alreadyDone: true, awarded: 0 };
    }

    const verified = await isMissionVerified(mission, state, now);
    if (!verified) {
      return { ok: false, reason: 'sem-evidencia', awarded: 0 };
    }

    // Trava cross-aba (web): se outra aba já reivindicou esta missão hoje,
    // esta chamada perde — sem crédito duplo por abas simultâneas.
    const today = localDayKey(now);
    if (!webClaimOnce(today, mission.id)) {
      return { ok: false, reason: 'ja-concluida', alreadyDone: true, awarded: 0 };
    }

    // Teto do dia contado pelo MAIOR entre o estado e o extrato da moeda —
    // apagar o estado do dia não devolve espaço no teto (ver
    // missionTokensFromHistory).
    const earnedSoFar = Math.max(state.tokensEarned, await missionTokensFromHistory(today));
    const granted = Math.max(0, Math.min(MISSION_REWARD, MISSIONS_DAILY_TOKEN_CAP - earnedSoFar));
    state.completed[missionId] = true;
    state.tokensEarned = earnedSoFar + granted;
    await writeJson(STATE_KEY, state); // flag + crédito do dia juntos, antes do saldo

    if (granted > 0) {
      await awardTokens(granted, `Missão diária: ${mission.title}`, { kind: 'mission', day: today });
    }

    const done = defs.filter((m) => state.completed[m.id]).length;
    return {
      ok: true,
      awarded: granted,
      newBalance: await getTokenBalance(),
      done,
      total: defs.length,
      allDone: done === defs.length,
    };
  });
}

// Bônus por fechar as 3 do dia — uma vez por dia, só com as 3 realmente
// concluídas (conta pelos ids do sorteio de HOJE, não por qualquer flag
// solta). Mesmo padrão atômico de completeMission.
export function claimDailyBonus(now = new Date()) {
  return serialized(async () => {
    const defs = todaysMissionDefs(now);
    const state = await readDayState(now);

    if (state.bonusClaimed) {
      return { ok: false, reason: 'ja-resgatado', awarded: 0 };
    }
    const done = defs.filter((m) => state.completed[m.id]).length;
    if (done < defs.length) {
      return { ok: false, reason: 'missoes-pendentes', awarded: 0, done, total: defs.length };
    }

    // Mesmas duas defesas de completeMission: trava cross-aba + teto contado
    // também pelo extrato (apagar o estado não re-libera o bônus).
    const today = localDayKey(now);
    if (!webClaimOnce(today, '__bonus__')) {
      return { ok: false, reason: 'ja-resgatado', awarded: 0 };
    }
    const earnedSoFar = Math.max(state.tokensEarned, await missionTokensFromHistory(today));
    const granted = Math.max(0, Math.min(ALL_DONE_BONUS, MISSIONS_DAILY_TOKEN_CAP - earnedSoFar));
    state.bonusClaimed = true;
    state.tokensEarned = earnedSoFar + granted;
    await writeJson(STATE_KEY, state);

    if (granted > 0) {
      await awardTokens(granted, 'Missões diárias: bônus 3 de 3', { kind: 'mission', day: today });
    }

    return { ok: true, awarded: granted, newBalance: await getTokenBalance() };
  });
}

// Resumo do dia pra tela (contador, bônus disponível, quanto já rendeu hoje).
export async function getMissionProgress(now = new Date()) {
  const defs = todaysMissionDefs(now);
  const state = await readDayState(now);
  const done = defs.filter((m) => state.completed[m.id]).length;
  const allDone = done === defs.length;
  return {
    date: state.date,
    total: defs.length,
    done,
    allDone,
    bonusClaimed: state.bonusClaimed,
    bonusAvailable: allDone && !state.bonusClaimed,
    bonusReward: ALL_DONE_BONUS,
    tokensEarnedToday: state.tokensEarned,
  };
}
