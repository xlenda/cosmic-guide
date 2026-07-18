// lib/tokens.js
// Economia de tokens local (por aparelho, igual ao resto do app — sem
// backend, mesmo padrão do featureUsage.js/journal.js). Ganha-se token por
// leitura concluída e por manter a sequência diária viva; gasta-se na Loja
// por recompensas do próprio app (nunca dinheiro real, nunca promete algo
// físico que ainda não tem logística resolvida).
import AsyncStorage from '@react-native-async-storage/async-storage';

const BALANCE_KEY = 'cosmic-tokens-balance';
const HISTORY_KEY = 'cosmic-tokens-history';
const MAX_HISTORY = 100;

export const TOKEN_REWARDS = {
  reading: 10, // qualquer leitura concluída (tarô, palma, café, sonho, etc.)
  streakDay: 5, // manter a sequência viva num dia novo
};

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

export async function getTokenBalance() {
  return readJson(BALANCE_KEY, 0);
}

// reason: rótulo curto pro histórico ("Leitura de Tarô", "Sequência de 3 dias")
export async function awardTokens(amount, reason) {
  if (!amount || amount <= 0) return getTokenBalance();
  const balance = await getTokenBalance();
  const newBalance = balance + amount;
  await writeJson(BALANCE_KEY, newBalance);

  const history = await readJson(HISTORY_KEY, []);
  history.unshift({ amount, reason, date: new Date().toISOString() });
  await writeJson(HISTORY_KEY, history.slice(0, MAX_HISTORY));

  return newBalance;
}

// Gasta tokens numa recompensa da Loja — recusa se não tiver saldo (nunca
// deixa o saldo negativo).
export async function spendTokens(amount, reason) {
  const balance = await getTokenBalance();
  if (amount > balance) return { ok: false, balance };
  const newBalance = balance - amount;
  await writeJson(BALANCE_KEY, newBalance);

  const history = await readJson(HISTORY_KEY, []);
  history.unshift({ amount: -amount, reason, date: new Date().toISOString() });
  await writeJson(HISTORY_KEY, history.slice(0, MAX_HISTORY));

  return { ok: true, balance: newBalance };
}

export async function getTokenHistory() {
  return readJson(HISTORY_KEY, []);
}
