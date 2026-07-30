// lib/streak.js
// Sequência de dias ativos (qualquer leitura ou atividade conta) — mesmo
// espírito do "Calendário de sequência" do Ziggur, mas honesto: só marca um
// dia como ativo quando a pessoa realmente fez algo real no app, nunca infla
// artificialmente.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncStreakToServer } from './webPush';
import { awardTokens } from './tokens';
// O mapa de dias ativos e TODA a matemática de sequência (dia local, escudo,
// sequência atual, recorde) moraram aqui até 30/07/2026 e agora vivem em
// lib/streakDays.js — sem mudança de regra, só de endereço. O motivo está
// documentado lá: lib/coupleData.js precisa DERIVAR a sequência do casal da
// mesma fonte (era uma segunda contagem morta, sempre 0) e não pode importar
// este arquivo, que arrasta `react-native` via ./webPush.
import {
  readDays,
  writeDays,
  todayStr,
  computeCurrentStreak,
  getStreakSummary,
} from './streakDays';

const LAST_MILESTONE_KEY = 'cosmic-streak-last-milestone'; // maior marco (7/30/100) já premiado
const PENDING_CELEBRATION_KEY = 'cosmic-streak-pending-celebration'; // marco batido, aguardando a Home mostrar
// NÃO existe tolerância de migração para a virada UTC->local (tentada e
// removida em 27/07/2026): "ontem vazio + hoje marcado" é indistinguível
// entre o deslocamento de fuso e uma falta de verdade, então cobrir esse
// buraco de graça dava sequência 2 pra todo usuário no PRIMEIRO dia de uso e
// impedia o Escudo comprado de ser consumido no caso que ele existe pra
// cobrir (pego pela regressão E2E [2]). Quem perder um dia na virada tem o
// Escudo — que é exatamente o que ele foi feito pra fazer.

// Marcos de sequência com bônus de tokens — fecha o loop emocional do
// streak, que hoje só mostra bolinhas sem recompensa nenhuma quando bate um
// número redondo (achado real de auditoria de retenção, 25/07/2026).
export const STREAK_MILESTONES = [
  { days: 7, tokens: 30 },
  { days: 30, tokens: 100 },
  { days: 100, tokens: 300 },
];

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

// { currentStreak, totalActiveDays } — o shape que a Home e os Relatórios já
// consumiam; `longest`/`lastActiveDay` vêm de brinde no mesmo objeto desde que
// a sequência do CASAL passou a ser derivada daqui (lib/coupleData.getStreak),
// em vez de uma segunda contagem que ninguém nunca gravava.
export async function getStreakInfo() {
  return getStreakSummary();
}
