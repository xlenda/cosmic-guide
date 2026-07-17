// lib/featureUsage.js
// Controle de "1 uso grátis por vida" — aplicado às 9 features hoje
// ilimitadas (Horóscopo, Mapa Astral, Tarô, Compatibilidade, Chat, Palma,
// Café, Sonhos, Calendário Lunar) pra quem NÃO tem assinatura ativa
// (hasAccess === false, tanto solo quanto casal). Quem já é assinante nunca
// passa por essa checagem — ver uso de `hasAccess` em cada tela.
//
// "Uma vez na vida" = nunca reseta sozinho (ao contrário do limite diário do
// Tarô Dinheiro/Saúde, lib/tarotDailyLimit.js) — só reseta se a pessoa
// desinstalar o app ou limpar os dados manualmente.
import AsyncStorage from '@react-native-async-storage/async-storage';

function storageKey(featureKey) {
  return `feature-used-once-${featureKey}`;
}

// Nunca lança e nunca fabrica um "true" por engano — falha de storage sempre
// libera o uso (não trava a pessoa por causa de um erro técnico que não é
// culpa dela).
export async function hasUsedFeatureOnce(featureKey) {
  try {
    const raw = await AsyncStorage.getItem(storageKey(featureKey));
    return raw === 'true';
  } catch {
    return false;
  }
}

export async function markFeatureUsedOnce(featureKey) {
  try {
    await AsyncStorage.setItem(storageKey(featureKey), 'true');
  } catch {}
}
