// lib/checkoutIntent.js
// "Esta pessoa escolheu o plano X e foi pedir login pra assinar."
//
// POR QUE EXISTE: até 29/07/2026 quem estava deslogado batia num cartão de
// cadeado na tela de Planos e NUNCA via preço nenhum. Agora a oferta aparece
// antes do login e a conta só é pedida no toque do CTA — mas aí surge o
// problema oposto: no login com Google (e na confirmação de e-mail do
// Supabase) o navegador SAI da página e volta na raiz do app. Sem esta
// intenção guardada, a pessoa voltava logada... na Home, longe do plano que
// tinha acabado de escolher, e desistia. Com ela, o App.js devolve a pessoa
// pra tela de Planos com o MESMO plano já selecionado.
//
// Só guarda o id do plano ('trial' | 'quarterly' | 'annual') e o instante —
// nada de e-mail, nome ou qualquer dado pessoal. Nunca lança: falha de
// storage vira "não tem intenção nenhuma", e o app segue igual ao de hoje.
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CHECKOUT_INTENT_KEY = 'cg-checkout-intent';

// Meia hora: tempo de sobra pra criar conta e confirmar e-mail, e curto o
// bastante pra ninguém ser jogado na tela de Planos numa sessão de outro dia.
const TTL_MS = 30 * 60 * 1000;

export async function saveCheckoutIntent(plan) {
  if (!plan) return;
  try {
    await AsyncStorage.setItem(CHECKOUT_INTENT_KEY, JSON.stringify({ plan, at: Date.now() }));
  } catch {}
}

// Devolve { plan } ou null. Intenção vencida é apagada aqui mesmo, pra não
// ficar ressuscitando em toda abertura do app.
export async function readCheckoutIntent() {
  try {
    const raw = await AsyncStorage.getItem(CHECKOUT_INTENT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data.plan !== 'string' || typeof data.at !== 'number') {
      await clearCheckoutIntent();
      return null;
    }
    if (Date.now() - data.at > TTL_MS) {
      await clearCheckoutIntent();
      return null;
    }
    return { plan: data.plan };
  } catch {
    return null;
  }
}

export async function clearCheckoutIntent() {
  try {
    await AsyncStorage.removeItem(CHECKOUT_INTENT_KEY);
  } catch {}
}
