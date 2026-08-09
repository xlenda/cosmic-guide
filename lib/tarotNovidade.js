// lib/tarotNovidade.js
// A BOLINHA HONESTA da aba Tarô (dock do App.js). O concorrente acende um
// pontinho vermelho nas abas como isca de retenção — aceso sempre, mentindo
// novidade. A nossa só acende quando existe algo REAL não visto: a tiragem
// diária de HOJE ainda não foi feita E a pessoa realmente PODE fazê-la.
//
// Regras (todas na direção de apagar, nunca de acender à toa):
//   • já tirou QUALQUER tema hoje → apagada — a novidade do dia foi vista;
//   • não assina e a prévia grátis vitalícia (lib/featureUsage.js) já foi
//     gasta → apagada. Pra essa pessoa amanhã não tem carta nova, tem paywall
//     (doutrina no cabeçalho de lib/tarotDailyLimit.js: "volta amanhã" só pode
//     ser dito a quem assina). Acender aqui seria exatamente a mentira de
//     retenção que este app não faz;
//   • erro de storage → apagada. Na dúvida, não acende — o inverso proposital
//     de canDrawToday/hasUsedFeatureOnce, que na falha LIBERAM o uso: lá o
//     erro não pode travar a pessoa; aqui o erro não pode prometer novidade.
//
// COMO LÊ: o mesmo registro que TarotScreen grava em drawCards() →
// recordDraw(theme.key) → chave `tarot-daily-<tema>` com valor 'YYYY-MM-DD'
// local (prefixo e formato importados de lib/tarotDailyLimit.js, fonte única).
// A varredura é por getAllKeys + prefixo, sem lista paralela de temas — se um
// tema entrar ou sair do Tarô, isto aqui acompanha sozinho.
//
// POR QUE NÃO importa lib/tarotThemes.js nem screens/TarotScreen.js: este
// arquivo entra no bundle RAIZ (App.js importa direto). tarotThemes puxa os
// três packs de tradução do tarô (~118 KB) e a TarotScreen é chunk lazy —
// importar qualquer um dos dois arrastaria esse peso pro carregamento inicial
// do app inteiro só pra desenhar uma bolinha de 10px.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DAILY_KEY_PREFIX, todayKey } from './tarotDailyLimit';
import { hasUsedFeatureOnce } from './featureUsage';

// Espelha FEATURE_KEY de screens/TarotScreen.js (constante local de lá, não
// exportada — e importar a tela quebraria o lazy, ver cabeçalho).
const TAROT_FEATURE_KEY = 'tarot';

// true = existe carta do dia real ainda não revelada pra ESTA pessoa.
// `hasAccess` vem do useCouple() de quem chama (App.js) — storage local não
// sabe de assinatura. Nunca rejeita: qualquer falha devolve false.
export async function temNovidadeDeTaroHoje(hasAccess) {
  try {
    const chaves = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(DAILY_KEY_PREFIX));
    if (chaves.length > 0) {
      const hoje = todayKey();
      const pares = await AsyncStorage.multiGet(chaves);
      // Qualquer tema tirado hoje conta como "viu a carta de hoje": a bolinha
      // anuncia A novidade do dia, não uma checklist dos 5 temas — senão ela
      // viveria acesa pra todo assinante e viraria o pontinho mentiroso.
      if (pares.some(([, valor]) => valor === hoje)) return false;
    }
    if (hasAccess) return true;
    // Sem assinatura só existe carta de verdade enquanto a prévia vitalícia
    // não foi gasta. (Leitura Bônus comprada na Loja fica de fora de
    // propósito: é consumível sem validade que a pessoa guardou por escolha —
    // não é "novidade de hoje", e acender todo dia por causa dela é cobrança.)
    return !(await hasUsedFeatureOnce(TAROT_FEATURE_KEY));
  } catch {
    return false;
  }
}
