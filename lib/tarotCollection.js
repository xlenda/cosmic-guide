// lib/tarotCollection.js
// Álbum das 78 Cartas — registra quais cartas do baralho a pessoa JÁ VIU em
// tiragens reais (chamado por drawCards no TarotScreen). Só entra no álbum
// carta que apareceu de verdade numa leitura — nunca marcamos carta "de
// brinde" nem inventamos progresso, senão o álbum vira mentira e a graça de
// colecionar morre. Persistência local em AsyncStorage, mesmo padrão por
// aparelho de lib/tokens.js e lib/featureUsage.js (sem backend).
import { TAROT_DECK } from './tarotDeck';
import { awardTokens } from './tokens';
import { getItemSeguro, setItemSeguro } from './storage';
import { localISOString } from './localDay';

const SEEN_KEY = 'cosmic-tarot-collection-seen';
const REWARDED_KEY = 'cosmic-tarot-collection-rewarded';
const ENCOUNTERS_KEY = 'cosmic-tarot-collection-encounters-v1';
const FAVORITES_KEY = 'cosmic-tarot-collection-favorites-v1';
const MAX_OCCURRENCE_IDS = 1500;
const ALBUM_WEB_LOCK = 'cosmic-tarot-collection-mutation-v1';

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
    const raw = await getItemSeguro(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson(key, value) {
  await setItemSeguro(key, JSON.stringify(value));
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
async function recordCardsSeenUnlocked(cardIds) {
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

export function recordCardsSeen(cardIds) {
  return serializedAlbumMutation(() => recordCardsSeenUnlocked(cardIds));
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

// ---- Álbum 2.0 -----------------------------------------------------------
// O álbum antigo sabia apenas "já apareceu". A partir desta versão cada
// revelação registra um encontro real, com orientação e data, sem reescrever o
// passado. Cartas vistas antes desta métrica continuam vistas, mas a interface
// declara honestamente que o histórico detalhado começa no próximo encontro.

let albumMutationQueue = Promise.resolve();

function withAlbumWebLock(operation) {
  // Web Locks coordena abas/janelas. React Native não oferece esta API; nesse
  // caso a fila local continua protegendo as mutações dentro da instância.
  const locks = typeof globalThis !== 'undefined' ? globalThis.navigator?.locks : null;
  if (!locks || typeof locks.request !== 'function') return operation();
  return locks.request(ALBUM_WEB_LOCK, { mode: 'exclusive' }, operation);
}

function serializedAlbumMutation(operation) {
  const run = () => withAlbumWebLock(operation);
  const result = albumMutationQueue.then(run, run);
  albumMutationQueue = result.catch(() => undefined);
  return result;
}

function cleanOccurrenceId(value) {
  return typeof value === 'string' ? value.trim().slice(0, 180) : '';
}

function cleanTimestamp(value) {
  if (typeof value !== 'string' || !Number.isFinite(new Date(value).getTime())) return localISOString();
  return value;
}

function normalizeEncounterState(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const cards = source.cards && typeof source.cards === 'object' && !Array.isArray(source.cards)
    ? source.cards
    : {};
  const occurrenceIds = Array.isArray(source.occurrenceIds)
    ? source.occurrenceIds.filter((id) => typeof id === 'string').slice(-MAX_OCCURRENCE_IDS)
    : [];
  return { version: 1, cards, occurrenceIds };
}

export async function recordCardEncounter({ cardId, reversed = false, occurredAt, occurrenceId } = {}) {
  if (!VALID_IDS.has(cardId)) return { created: false, reason: 'invalid_card' };
  const cleanId = cleanOccurrenceId(occurrenceId);
  if (!cleanId) return { created: false, reason: 'missing_occurrence' };

  return serializedAlbumMutation(async () => {
    const state = normalizeEncounterState(await readJson(ENCOUNTERS_KEY, null));
    if (state.occurrenceIds.includes(cleanId)) {
      // O evento é gravado antes do índice legado de cartas vistas. Se o app
      // fechar exatamente entre essas duas escritas, a retomada cai neste ramo:
      // reparar o índice aqui mantém o evento idempotente sem deixar a carta
      // eternamente oculta no álbum.
      await recordCardsSeenUnlocked([cardId]);
      return { created: false, reason: 'duplicate', card: state.cards[cardId] || null };
    }

    const seenBefore = (await readSeenSet()).has(cardId);
    const previous = state.cards[cardId] && typeof state.cards[cardId] === 'object'
      ? state.cards[cardId]
      : null;
    const timestamp = cleanTimestamp(occurredAt);
    const card = {
      count: Math.max(0, Number(previous?.count) || 0) + 1,
      uprightCount: Math.max(0, Number(previous?.uprightCount) || 0) + (reversed ? 0 : 1),
      reversedCount: Math.max(0, Number(previous?.reversedCount) || 0) + (reversed ? 1 : 0),
      firstSeenAt: previous?.firstSeenAt || timestamp,
      lastSeenAt: timestamp,
      // Se a carta já estava no álbum antes do primeiro evento medido, sabemos
      // apenas que houve pelo menos um encontro anterior. Não fabricamos data.
      legacyBaseline: previous ? previous.legacyBaseline === true : seenBefore,
    };

    state.cards[cardId] = card;
    state.occurrenceIds.push(cleanId);
    // A idempotência cobre deliberadamente só os 1.500 encontros mais
    // recentes para manter o storage local limitado. Um occurrenceId que já
    // saiu dessa janela pode ser contabilizado novamente se for reapresentado.
    if (state.occurrenceIds.length > MAX_OCCURRENCE_IDS) {
      state.occurrenceIds = state.occurrenceIds.slice(-MAX_OCCURRENCE_IDS);
    }
    await writeJson(ENCOUNTERS_KEY, state);
    await recordCardsSeenUnlocked([cardId]);
    return { created: true, card };
  });
}

export async function getAlbumEncounterStats() {
  const state = normalizeEncounterState(await readJson(ENCOUNTERS_KEY, null));
  return { ...state.cards };
}

function normalizeFavorites(value) {
  return (Array.isArray(value) ? value : []).filter((id) => VALID_IDS.has(id));
}

export async function getAlbumFavoriteIds() {
  return normalizeFavorites(await readJson(FAVORITES_KEY, []));
}

export function toggleAlbumFavorite(cardId) {
  if (!VALID_IDS.has(cardId)) return Promise.resolve(null);
  return serializedAlbumMutation(async () => {
    const favorites = new Set(await getAlbumFavoriteIds());
    const next = !favorites.has(cardId);
    if (next) favorites.add(cardId);
    else favorites.delete(cardId);
    await writeJson(FAVORITES_KEY, [...favorites]);
    return next;
  });
}

export async function getAlbumState() {
  const [collection, encounterStats, favoriteIds] = await Promise.all([
    getCollection(),
    getAlbumEncounterStats(),
    getAlbumFavoriteIds(),
  ]);
  return { ...collection, encounterStats, favoriteIds };
}
