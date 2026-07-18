// lib/streak.js
// Sequência de dias ativos (qualquer leitura ou atividade conta) — mesmo
// espírito do "Calendário de sequência" do Ziggur, mas honesto: só marca um
// dia como ativo quando a pessoa realmente fez algo real no app, nunca infla
// artificialmente.
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVE_DAYS_KEY = 'cosmic-active-days'; // { "2026-07-18": true, ... }

function todayStr(date = new Date()) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

async function readDays() {
  try {
    const raw = await AsyncStorage.getItem(ACTIVE_DAYS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function writeDays(days) {
  try {
    await AsyncStorage.setItem(ACTIVE_DAYS_KEY, JSON.stringify(days));
  } catch {}
}

// Marca hoje como ativo. Retorna { isNewDay, currentStreak } — isNewDay=false
// se hoje já tinha sido marcado (pra quem chama saber se deve premiar tokens
// de sequência de novo ou não).
export async function recordActiveDay() {
  const days = await readDays();
  const today = todayStr();
  const isNewDay = !days[today];
  if (isNewDay) {
    days[today] = true;
    await writeDays(days);
  }
  const currentStreak = computeCurrentStreak(days);
  return { isNewDay, currentStreak };
}

function computeCurrentStreak(days) {
  let streak = 0;
  const cursor = new Date();
  // Se hoje ainda não teve atividade, a sequência conta a partir de ontem
  // (ainda "viva" até o dia acabar), então não zera cedo demais.
  if (!days[todayStr(cursor)]) cursor.setDate(cursor.getDate() - 1);
  while (days[todayStr(cursor)]) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// Tira segunda-feira como início da semana (S T Q Q S S D).
export async function getWeekActivity() {
  const days = await readDays();
  const today = new Date();
  const dayOfWeek = (today.getDay() + 6) % 7; // 0=segunda ... 6=domingo
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek);

  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week.push({ date: todayStr(d), active: !!days[todayStr(d)], isToday: todayStr(d) === todayStr(today) });
  }
  return week;
}

// Activity map do mês (pra calendário heatmap) — { "2026-07-18": true, ... }
// filtrado só pro mês/ano pedido.
export async function getMonthActivity(year, month) {
  const days = await readDays();
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const result = {};
  Object.keys(days).forEach((d) => {
    if (d.startsWith(prefix)) result[d] = true;
  });
  return result;
}

export async function getStreakInfo() {
  const days = await readDays();
  return { currentStreak: computeCurrentStreak(days), totalActiveDays: Object.keys(days).length };
}
