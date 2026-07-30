// lib/streakDays.js
// FONTE ÚNICA do mapa de dias ativos (`cosmic-active-days`) e de toda a
// matemática de sequência do app. Extraído de lib/streak.js em 30/07/2026 sem
// mudar uma vírgula das regras: computeCurrentStreak veio de lá inteiro
// (escudo incluído), o resto é leitura/escrita do mesmo blob.
//
// POR QUE ESTE ARQUIVO EXISTE (e não é só mais um módulo):
// lib/coupleData.js precisa DERIVAR a sequência do casal daqui (ver getStreak
// lá), mas não pode importar lib/streak.js: streak.js importa ./webPush, que
// importa `react-native`, e o test/setup.js roda com `ignore: node_modules` —
// arrastar react-native pro grafo do coupleData quebraria os testes que o
// exercitam em node puro (accountAccess, subscriptionStatus,
// coupleData.saveProfile). Mesmo motivo, já documentado no CoupleContext, pelo
// qual deleteAllCoupleData não pode importar lib/funnel.js.
//
// Este módulo importa SÓ AsyncStorage, ./streakShield (AsyncStorage) e
// ./localDay (puro) — nada de react-native.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { consumeShieldIfAvailable } from './streakShield';
import { localDayStr } from './localDay';

export const ACTIVE_DAYS_KEY = 'cosmic-active-days'; // { "2026-07-18": true, ... }

// Dia LOCAL do aparelho (lib/localDay.js) — antes era toISOString().slice(0,10)
// (UTC), que no Brasil depois das 21h gravava a data de AMANHÃ: a pessoa usava
// seg 9h + ter 22h + qua 9h e o mapa virava {seg, qua} com buraco na terça,
// consumindo Escudo comprado ou zerando a sequência (bug real reproduzido pelo
// tester, 26/07/2026).
export function todayStr(date = new Date()) {
  return localDayStr(date);
}

// Aritmética de dias sobre uma chave YYYY-MM-DD, sempre no calendário LOCAL.
// Constrói a data ao MEIO-DIA de propósito: em fusos que mudam o horário de
// verão à meia-noite (o Brasil fazia exatamente isso), `new Date(y, m-1, d)`
// pode cair numa hora que não existe e o ±1 dia escorregar.
function shiftDay(key, delta) {
  const [y, m, d] = String(key).split('-').map(Number);
  const dt = new Date(y, m - 1, d, 12);
  dt.setDate(dt.getDate() + delta);
  return localDayStr(dt);
}

export function previousDayStr(key) {
  return shiftDay(key, -1);
}

export function nextDayStr(key) {
  return shiftDay(key, 1);
}

export async function readDays() {
  try {
    const raw = await AsyncStorage.getItem(ACTIVE_DAYS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function writeDays(days) {
  try {
    await AsyncStorage.setItem(ACTIVE_DAYS_KEY, JSON.stringify(days));
  } catch {}
}

// Async porque, ao encontrar um dia sem atividade, pode consumir um "Escudo
// da Sequência" (lib/streakShield.js, comprado na Loja) — se houver escudo
// disponível, aquele dia conta como se tivesse tido atividade (consome só 1
// escudo) e a contagem continua normalmente pro dia anterior; sem escudo
// disponível, para de contar como sempre fez.
//
// O dia protegido é GRAVADO no mapa como 'shield' (permanente) — sem isso o
// escudo era consumido de novo a CADA recálculo (todo foco da Home chama
// getStreakInfo), drenando silenciosamente todos os escudos comprados sem
// proteger nada: quando acabavam, a sequência desmoronava no mesmo buraco de
// sempre. E o loop parava só quando os escudos acabavam — sem a trava do
// primeiro dia real de histórico, andava pra trás indefinidamente gastando
// escudos em dias de antes de a pessoa sequer conhecer o app (2 achados
// reais de auditoria adversarial, 26/07/2026).
export async function computeCurrentStreak(days) {
  const dayKeys = Object.keys(days);
  if (dayKeys.length === 0) return 0;
  // Nunca gasta escudo antes do primeiro dia real de atividade — não existe
  // sequência a proteger antes do histórico começar.
  const earliest = dayKeys.sort()[0];

  let streak = 0;
  let mutated = false;
  const cursor = new Date();
  // Se hoje ainda não teve atividade, a sequência conta a partir de ontem
  // (ainda "viva" até o dia acabar), então não zera cedo demais — e hoje
  // nunca consome escudo (o dia ainda não acabou, não há o que proteger).
  if (!days[todayStr(cursor)]) cursor.setDate(cursor.getDate() - 1);
  for (;;) {
    const key = todayStr(cursor);
    if (key < earliest) break;
    if (days[key]) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    const shielded = await consumeShieldIfAvailable();
    if (!shielded) break;
    days[key] = 'shield';
    mutated = true;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  if (mutated) await writeDays(days);
  return streak;
}

// RECORDE: a maior corrida de dias consecutivos que já existiu no histórico.
// 100% pura e 100% LEITURA — nunca consome escudo (escudo protege o presente,
// não reescreve o passado) e nunca grava nada. Dias já marcados como 'shield'
// contam como ativos, porque foi exatamente isso que o escudo comprado
// comprou: aquele dia PASSA a valer.
export function computeLongestStreak(days) {
  const active = Object.keys(days || {}).filter((k) => days[k]);
  if (active.length === 0) return 0;
  const set = new Set(active);

  let best = 0;
  for (const key of active) {
    // Só começa a contar no INÍCIO de uma corrida (o dia anterior está vazio),
    // senão cada dia da mesma corrida seria recontado do zero.
    if (set.has(previousDayStr(key))) continue;
    let run = 0;
    let cursor = key;
    while (set.has(cursor)) {
      run += 1;
      cursor = nextDayStr(cursor);
    }
    if (run > best) best = run;
  }
  return best;
}

// Resumo completo lido de UMA vez — é o que lib/streak.js (getStreakInfo) e
// lib/coupleData.js (getStreak) consomem, pra que Home, Progresso,
// Retrospectiva e conquistas nunca possam divergir: existe uma contagem só.
// `longest` nunca fica abaixo da sequência ATUAL (a corrida de hoje é, por
// definição, uma corrida do histórico).
export async function getStreakSummary() {
  const days = await readDays();
  const currentStreak = await computeCurrentStreak(days);
  const activeKeys = Object.keys(days).filter((k) => days[k]).sort();
  return {
    currentStreak,
    longest: Math.max(currentStreak, computeLongestStreak(days)),
    totalActiveDays: Object.keys(days).length,
    lastActiveDay: activeKeys.length ? activeKeys[activeKeys.length - 1] : null,
  };
}
