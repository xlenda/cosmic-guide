// lib/coffeeHistory.js
// Histórico local das leituras de café (Ritual do Café) — guarda cada leitura
// real que a pessoa recebeu, pra poder gerar uma "conclusão da semana" depois
// de 7 leituras novas. Só quem tem assinatura chega a 7 (quem não assina fica
// travado em 1 uso vitalício pelo OneTimeLock, então o contador nunca avança
// sozinho pra quem não paga).
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'coffee-reading-history';
const COUNTER_KEY = 'coffee-readings-since-summary';
const MAX_HISTORY = 100; // nunca cresce sem limite

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

// Chamado logo depois de uma leitura real (ou mock) ser exibida. Devolve
// `{ readyForSummary }` — true quando essa foi a 7ª leitura desde a última
// conclusão semanal (ou desde sempre, se nunca gerou uma).
export async function saveCoffeeReading({ title, body }) {
  const history = await readJson(HISTORY_KEY, []);
  history.push({ date: new Date().toISOString(), title, body });
  await writeJson(HISTORY_KEY, history.slice(-MAX_HISTORY));

  const counter = (await readJson(COUNTER_KEY, 0)) + 1;
  await writeJson(COUNTER_KEY, counter);

  return { readyForSummary: counter >= 7 };
}

// As últimas 7 leituras reais (pra mandar pro backend sintetizar) — nunca
// fabrica dado: se tiver menos que 7 no histórico, devolve o que existir.
export async function getReadingsForSummary() {
  const history = await readJson(HISTORY_KEY, []);
  return history.slice(-7);
}

export async function isReadyForWeeklySummary() {
  const counter = await readJson(COUNTER_KEY, 0);
  return counter >= 7;
}

// Chamado depois que a pessoa vê a conclusão da semana — zera o contador pra
// começar a contar as próximas 7 leituras do zero.
export async function markWeeklySummaryShown() {
  await writeJson(COUNTER_KEY, 0);
}

// Fallback honesto caso a IA real falhe (mesmo padrão de getMockCoffeeReading):
// nunca fabrica uma síntese nova, só lista os títulos reais já recebidos.
export function getFallbackWeeklySummary(readings) {
  const titles = readings.map((r) => r.title).join(', ');
  return {
    title: 'Sua semana em revisão',
    body: `Essa semana suas leituras trouxeram: ${titles}. Vale revisitar cada uma e notar o que se repete entre elas — às vezes o padrão só aparece quando se olha o conjunto.`,
  };
}
