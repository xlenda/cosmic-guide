// lib/tarotCollection.js
// Álbum das 78 Cartas — registra quais cartas do baralho a pessoa JÁ VIU em
// tiragens reais (chamado por drawCards no TarotScreen). Só entra no álbum
// carta que apareceu de verdade numa leitura — nunca marcamos carta "de
// brinde" nem inventamos progresso, senão o álbum vira mentira e a graça de
// colecionar morre. Persistência local em AsyncStorage, mesmo padrão por
// aparelho de lib/tokens.js e lib/featureUsage.js (sem backend).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TAROT_DECK } from './tarotDeck';
import { awardTokens } from './tokens';

const SEEN_KEY = 'cosmic-tarot-collection-seen';
const REWARDED_KEY = 'cosmic-tarot-collection-rewarded';

export const COLLECTION_TOTAL = TAROT_DECK.length; // 78

// Ids válidos do baralho — qualquer id fora daqui é descartado ao gravar/ler,
// pra contagem nunca passar de 78 nem o progresso ficar "sujo" se um dado
// velho/corrompido sobrar no storage.
const VALID_IDS = new Set(TAROT_DECK.map((card) => card.id));

// Naipes derivados DO PRÓPRIO deck (ordem de aparição), não de uma lista
// paralela hardcoded — se o baralho mudar, o álbum acompanha sozinho em vez
// de divergir. O rótulo é o key capitalizado (funciona pros 4 nomes em pt-BR:
// Paus, Copas, Espadas, Ouros).
const SUIT_KEYS = [...new Set(TAROT_DECK.filter((c) => c.suit).map((c) => c.suit))];

// Grupos do álbum: Arcanos Maiores + os 4 naipes dos menores, com o bônus de
// conclusão de cada um. `cards` guarda as cartas reais do deck (na ordem do
// baralho) — é a fonte única usada tanto pra checar conclusão quanto pra
// montar as seções da tela do álbum.
export const COLLECTION_GROUPS = [
  {
    key: 'maiores',
    label: 'Arcanos Maiores',
    reward: 100,
    rewardReason: 'Álbum de Tarô: Arcanos Maiores completos',
    cards: TAROT_DECK.filter((c) => c.arcana === 'maior'),
  },
  ...SUIT_KEYS.map((suit) => ({
    key: suit,
    label: suit.charAt(0).toUpperCase() + suit.slice(1),
    reward: 50,
    rewardReason: `Álbum de Tarô: naipe de ${suit.charAt(0).toUpperCase() + suit.slice(1)} completo`,
    cards: TAROT_DECK.filter((c) => c.suit === suit),
  })),
];

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

async function readSeenSet() {
  const stored = await readJson(SEEN_KEY, []);
  // Filtra na leitura também (não só na escrita) — protege contra storage
  // gravado por versões antigas do app com ids que não existem mais.
  return new Set((Array.isArray(stored) ? stored : []).filter((id) => VALID_IDS.has(id)));
}

// Bônus de conclusão — checado só quando entra carta nova (se nada mudou, o
// estado de conclusão também não mudou). A flag é gravada ANTES de premiar de
// propósito: se algo falhar no meio, preferimos deixar de premiar uma vez a
// arriscar premiar duas — prêmio duplicado quebra a economia da Loja, prêmio
// perdido é só azar recuperável.
async function checkCompletionRewards(seenSet) {
  const rewarded = await readJson(REWARDED_KEY, {});
  for (const group of COLLECTION_GROUPS) {
    if (rewarded[group.key]) continue;
    const complete = group.cards.every((card) => seenSet.has(card.id));
    if (!complete) continue;
    rewarded[group.key] = true;
    await writeJson(REWARDED_KEY, rewarded);
    await awardTokens(group.reward, group.rewardReason);
  }
}

// Marca cartas como vistas. Idempotente: repetir os mesmos ids não regrava
// nada nem re-checa bônus. Devolve { added, seenCount } pra quem quiser dar
// feedback ("+2 cartas novas no álbum") — o chamador pode ignorar.
export async function recordCardsSeen(cardIds) {
  const ids = (Array.isArray(cardIds) ? cardIds : []).filter((id) => VALID_IDS.has(id));
  const seen = await readSeenSet();
  const before = seen.size;
  ids.forEach((id) => seen.add(id));
  const added = seen.size - before;
  if (added > 0) {
    await writeJson(SEEN_KEY, [...seen]);
    await checkCompletionRewards(seen);
  }
  return { added, seenCount: seen.size };
}

export async function getCollection() {
  const seen = await readSeenSet();
  return { seenIds: [...seen], total: COLLECTION_TOTAL };
}

// Contagens por grupo (Arcanos Maiores + cada naipe), na ordem do baralho —
// pronto pra tela do álbum renderizar as seções sem refazer a lógica de grupo.
export async function getCollectionProgress() {
  const seen = await readSeenSet();
  return {
    seenTotal: seen.size,
    total: COLLECTION_TOTAL,
    groups: COLLECTION_GROUPS.map((group) => ({
      key: group.key,
      label: group.label,
      seen: group.cards.filter((card) => seen.has(card.id)).length,
      total: group.cards.length,
    })),
  };
}
