// lib/cosmeticRewards.js
// Efeitos reais das recompensas da Loja (lib/tokens.js só cuida do saldo em
// si) — sem isso, resgatar gastava o token de verdade mas não tinha nenhum
// efeito visível no resto do app (achado real de bug reportado pelo usuário,
// 25/07/2026: "resgata e não dá pra usar").
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spendTokensForDelivery } from './tokens';

const SELO_KEY = 'cosmic-reward-selo-cosmico';
const BONUS_TAROT_KEY = 'cosmic-reward-bonus-tarot';
const GOLD_THEME_OWNED_KEY = 'cosmic-reward-gold-theme';
let bonusMutationQueue = Promise.resolve();

function serializeBonusMutation(operation) {
  const result = bonusMutationQueue.then(operation, operation);
  bonusMutationQueue = result.catch(() => undefined);
  return result;
}

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
  return serializeBonusMutation(async () => {
    const next = (await getBonusTarotCount()) + 1;
    try {
      await AsyncStorage.setItem(BONUS_TAROT_KEY, String(next));
      return next;
    } catch {
      return null;
    }
  });
}

export async function getBonusTarotReadings() {
  // Uma leitura iniciada enquanto add/consume ainda grava precisa observar o
  // estado DEPOIS da mutacao. Ler o AsyncStorage direto aqui devolvia o valor
  // antigo durante a janela assincrona da escrita.
  await bonusMutationQueue;
  return getBonusTarotCount();
}

// Compra atomica do ponto de vista da Loja: a cobranca so permanece quando a
// Leitura Bonus foi de fato persistida. Serve tanto para o item avulso quanto
// para a Tiragem da Lua Interior, que promete exatamente o mesmo credito.
export async function redeemBonusTarotReadingWithTokens({ cost, purchaseReason, refundReason }) {
  return spendTokensForDelivery(cost, purchaseReason, addBonusTarotReading, refundReason);
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
  return serializeBonusMutation(async () => {
    const count = await getBonusTarotCount();
    if (count <= 0) return false;
    try {
      await AsyncStorage.setItem(BONUS_TAROT_KEY, String(count - 1));
      return true;
    } catch {
      return false;
    }
  });
}

// ---------------------------------------------------------------------------
// Brindes da Loja (lib/brindes.js) — posse dos brindes de CONTEÚDO (guia de
// ritual, wallpapers, tiragem exclusiva): compra única, e quem já tem reabre
// o conteúdo de graça na própria Loja. Um eventual brinde repetível NÃO
// passaria por aqui — somaria contador próprio (ex.: lib/streakShield.js).
const BRINDES_KEY = 'cosmic-reward-brindes'; // { [brindeId]: true }

export async function getOwnedBrindes() {
  try {
    const raw = await AsyncStorage.getItem(BRINDES_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export async function hasBrinde(id) {
  const owned = await getOwnedBrindes();
  return !!owned[id];
}

export async function grantBrinde(id) {
  try {
    const owned = await getOwnedBrindes();
    owned[id] = true;
    await AsyncStorage.setItem(BRINDES_KEY, JSON.stringify(owned));
  } catch {}
}
