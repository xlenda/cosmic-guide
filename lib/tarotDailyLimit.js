// lib/tarotDailyLimit.js
// TODOS os temas liberam só 1 tiragem por dia, por tema — sem isso, a pessoa
// pode ficar re-tirando cartas até achar uma resposta que goste, o que
// esvazia a credibilidade da leitura (ninguém confia numa "resposta séria"
// que muda a cada toque). Reseta à meia-noite local, mesmo espírito do
// horóscopo diário. Isso vale inclusive pra quem assina (hasFullAccess) — o
// bloqueio vitalício de 1 uso grátis (lib/featureUsage.js, em TarotScreen.js)
// é quem trava de vez quem não assina; este limite diário é a régua à parte
// pra quem já tem acesso completo.
//
// Por isso "volta amanhã" só pode ser dito a quem ASSINA: pra quem não
// assina, quem manda é a prévia vitalícia e amanhã não tem tiragem nova.
// A precedência das duas frases vive em screens/TarotScreen.js
// (`previaVitaliciaGasta` / `limiteDiarioReal`) — não duplicar a decisão em
// outro lugar.
import AsyncStorage from '@react-native-async-storage/async-storage';

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function storageKey(themeKey) {
  return `tarot-daily-${themeKey}`;
}

// true quando o tema ainda não foi usado hoje. Nunca lança — uma falha de
// storage libera o uso (não trava o usuário por causa de um erro técnico que
// não é culpa dele).
export async function canDrawToday(themeKey) {
  try {
    const lastDate = await AsyncStorage.getItem(storageKey(themeKey));
    return lastDate !== todayKey();
  } catch {
    return true;
  }
}

export async function recordDraw(themeKey) {
  try {
    await AsyncStorage.setItem(storageKey(themeKey), todayKey());
  } catch {}
}
