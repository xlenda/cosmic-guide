// lib/streak.js
// Sequência de dias ativos (qualquer leitura ou atividade conta) — mesmo
// espírito do "Calendário de sequência" do Ziggur, mas honesto: só marca um
// dia como ativo quando a pessoa realmente fez algo real no app, nunca infla
// artificialmente.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncStreakToServer } from './webPush';
import { awardTokens } from './tokens';
import { consumeShieldIfAvailable } from './streakShield';

const ACTIVE_DAYS_KEY = 'cosmic-active-days'; // { "2026-07-18": true, ... }
const LAST_MILESTONE_KEY = 'cosmic-streak-last-milestone'; // maior marco (7/30/100) já premiado
const PENDING_CELEBRATION_KEY = 'cosmic-streak-pending-celebration'; // marco batido, aguardando a Home mostrar

// Marcos de sequência com bônus de tokens — fecha o loop emocional do
// streak, que hoje só mostra bolinhas sem recompensa nenhuma quando bate um
// número redondo (achado real de auditoria de retenção, 25/07/2026).
export const STREAK_MILESTONES = [
  { days: 7, tokens: 30 },
  { days: 30, tokens: 100 },
  { days: 100, tokens: 300 },
];

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

// Marca hoje como ativo. Retorna { isNewDay, currentStreak, milestone } —
// isNewDay=false se hoje já tinha sido marcado (pra quem chama saber se deve
// premiar tokens de sequência de novo ou não); milestone é o marco (7/30/100)
// batido agora, ou null.
export async function recordActiveDay() {
  const days = await readDays();
  const today = todayStr();
  const isNewDay = !days[today];
  if (isNewDay) {
    days[today] = true;
    await writeDays(days);
  }
  const currentStreak = await computeCurrentStreak(days);
  // Só sincroniza no dia em que a sequência realmente muda — evita chamada de
  // rede redundante toda vez que uma leitura é concluída no mesmo dia. Nunca
  // bloqueia (fire-and-forget): a sequência local já foi salva de qualquer jeito.
  if (isNewDay) syncStreakToServer(currentStreak, today);

  let milestone = null;
  if (isNewDay) {
    const hit = STREAK_MILESTONES.find((m) => m.days === currentStreak);
    if (hit) {
      // Guarda o maior marco já premiado pra nunca pagar o mesmo marco duas
      // vezes (ex.: reabrir o app várias vezes no mesmo dia 7 não deveria
      // pagar 30 tokens de novo — isNewDay já cobre isso, mas esta segunda
      // trava é o que impede pagar em dobro se recordActiveDay for chamado
      // mais de uma vez antes do storage persistir, condição de corrida rara
      // mas barata de evitar).
      const lastMilestone = Number((await AsyncStorage.getItem(LAST_MILESTONE_KEY)) || 0);
      if (hit.days > lastMilestone) {
        await AsyncStorage.setItem(LAST_MILESTONE_KEY, String(hit.days));
        await awardTokens(hit.tokens, `Marco de ${hit.days} dias seguidos`);
        milestone = hit;
        // A leitura que bateu o marco pode ter acontecido em qualquer tela
        // (Tarô, Palma, Horóscopo...) — guarda pra Home celebrar assim que a
        // pessoa voltar pra lá (useFocusEffect), em vez de duplicar UI de
        // celebração em cada tela de leitura.
        await AsyncStorage.setItem(PENDING_CELEBRATION_KEY, JSON.stringify(hit));
      }
    }
  }
  return { isNewDay, currentStreak, milestone };
}

// Consome (lê e apaga) a celebração de marco pendente — chamada só pela Home.
export async function consumePendingMilestoneCelebration() {
  try {
    const raw = await AsyncStorage.getItem(PENDING_CELEBRATION_KEY);
    if (!raw) return null;
    await AsyncStorage.removeItem(PENDING_CELEBRATION_KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Async porque, ao encontrar um dia sem atividade, pode consumir um "Escudo
// da Sequência" (lib/streakShield.js, comprado na Loja) — se houver escudo
// disponível, aquele dia conta como se tivesse tido atividade (consome só 1
// escudo) e a contagem continua normalmente pro dia anterior; sem escudo
// disponível, para de contar como sempre fez.
async function computeCurrentStreak(days) {
  let streak = 0;
  const cursor = new Date();
  // Se hoje ainda não teve atividade, a sequência conta a partir de ontem
  // (ainda "viva" até o dia acabar), então não zera cedo demais.
  if (!days[todayStr(cursor)]) cursor.setDate(cursor.getDate() - 1);
  for (;;) {
    if (days[todayStr(cursor)]) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    const shielded = await consumeShieldIfAvailable();
    if (!shielded) break;
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
  const currentStreak = await computeCurrentStreak(days);
  return { currentStreak, totalActiveDays: Object.keys(days).length };
}
