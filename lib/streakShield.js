// lib/streakShield.js
// "Escudo da Sequência" — comprado na Loja com tokens (screens/LojaScreen.js).
// Guarda só uma contagem simples em AsyncStorage; quem decide QUANDO gastar um
// escudo é computeCurrentStreak() (lib/streak.js), no dia em que encontra uma
// falha na sequência.
import AsyncStorage from '@react-native-async-storage/async-storage';

const SHIELD_COUNT_KEY = 'cosmic-streak-shields'; // número (contagem de escudos guardados)

export async function getShieldCount() {
  try {
    const raw = await AsyncStorage.getItem(SHIELD_COUNT_KEY);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

// Chamada depois de resgatar o escudo na Loja (spendTokens já validou o custo).
export async function addShield() {
  const count = await getShieldCount();
  const next = count + 1;
  try {
    await AsyncStorage.setItem(SHIELD_COUNT_KEY, String(next));
  } catch {}
  return next;
}

// Se houver ao menos 1 escudo guardado, consome 1 e retorna true (a sequência
// deve continuar contando pra trás como se aquele dia tivesse atividade). Se
// não houver nenhum, retorna false e não mexe no contador.
export async function consumeShieldIfAvailable() {
  const count = await getShieldCount();
  if (count <= 0) return false;
  try {
    await AsyncStorage.setItem(SHIELD_COUNT_KEY, String(count - 1));
  } catch {}
  return true;
}
