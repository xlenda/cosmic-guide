// lib/cosmeticRewards.js
// Efeitos reais das recompensas da Loja (lib/tokens.js só cuida do saldo em
// si) — sem isso, resgatar gastava o token de verdade mas não tinha nenhum
// efeito visível no resto do app (achado real de bug reportado pelo usuário,
// 25/07/2026: "resgata e não dá pra usar").
import AsyncStorage from '@react-native-async-storage/async-storage';

const SELO_KEY = 'cosmic-reward-selo-cosmico';
const BONUS_TAROT_KEY = 'cosmic-reward-bonus-tarot';
const GOLD_THEME_OWNED_KEY = 'cosmic-reward-gold-theme';

export async function hasSeloCosmico() {
  try {
    return (await AsyncStorage.getItem(SELO_KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function grantSeloCosmico() {
  try {
    await AsyncStorage.setItem(SELO_KEY, 'true');
  } catch {}
}

async function getBonusTarotCount() {
  try {
    const raw = await AsyncStorage.getItem(BONUS_TAROT_KEY);
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export async function addBonusTarotReading() {
  const next = (await getBonusTarotCount()) + 1;
  try {
    await AsyncStorage.setItem(BONUS_TAROT_KEY, String(next));
  } catch {}
  return next;
}

export async function getBonusTarotReadings() {
  return getBonusTarotCount();
}

// Tema Dourado — posse (comprou uma vez, é pra sempre); o LIGADO/DESLIGADO
// fica à parte, em theme.js (localStorage síncrono, ver comentário lá).
export async function hasGoldTheme() {
  try {
    return (await AsyncStorage.getItem(GOLD_THEME_OWNED_KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function grantGoldTheme() {
  try {
    await AsyncStorage.setItem(GOLD_THEME_OWNED_KEY, 'true');
  } catch {}
}

// Consome 1 leitura bônus se houver alguma disponível — devolve true se
// consumiu (TarotScreen deve liberar a tiragem mesmo com o limite diário do
// tema já batido), false se não tinha nenhuma guardada.
export async function consumeBonusTarotReading() {
  const count = await getBonusTarotCount();
  if (count <= 0) return false;
  try {
    await AsyncStorage.setItem(BONUS_TAROT_KEY, String(count - 1));
  } catch {}
  return true;
}
