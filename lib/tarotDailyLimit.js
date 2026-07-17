// lib/tarotDailyLimit.js
// Temas "sérios" (Dinheiro, Saúde) liberam só 1 tiragem por dia — sem isso, a
// pessoa pode ficar re-tirando cartas até achar uma resposta que goste, o que
// esvazia a credibilidade de um assunto delicado (ninguém confia numa "resposta
// séria" que muda a cada toque). Os demais temas (Amor, Carreira, Energia)
// continuam sem limite. Reseta à meia-noite local, mesmo espírito do
// horóscopo diário.
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DAILY_LIMIT_THEMES = ['Dinheiro', 'Saúde'];

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function storageKey(themeKey) {
  return `tarot-daily-${themeKey}`;
}

// true quando o tema não tem limite, ou quando ainda não foi usado hoje.
// Nunca lança — uma falha de storage libera o uso (não trava o usuário por
// causa de um erro técnico que não é culpa dele).
export async function canDrawToday(themeKey) {
  if (!DAILY_LIMIT_THEMES.includes(themeKey)) return true;
  try {
    const lastDate = await AsyncStorage.getItem(storageKey(themeKey));
    return lastDate !== todayKey();
  } catch {
    return true;
  }
}

export async function recordDraw(themeKey) {
  if (!DAILY_LIMIT_THEMES.includes(themeKey)) return;
  try {
    await AsyncStorage.setItem(storageKey(themeKey), todayKey());
  } catch {}
}
