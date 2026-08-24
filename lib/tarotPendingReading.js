// Tiragem em andamento: permite fechar/reabrir a tela sem trocar as cartas que
// a pessoa ja recebeu. O snapshot guarda apenas estado deterministico (ids e
// orientacoes), nunca textos derivados do idioma nem objetos inteiros do deck.
//
// Nao importamos tarotDeck aqui de proposito. A tela do Taro ja depende de
// varios motores que dependem do deck; manter este modulo como uma folha evita
// um ciclo so para validar ids. O formato generico abaixo aceita os ids atuais
// (`major-17`, `cups-03` etc.) e continua seguro para futuros baralhos.
import { getItemSeguro, setItemSeguro, removeItemSeguro } from './storage';

export const PENDING_TAROT_READING_KEY = 'cosmic-tarot-pending-reading-v1';
export const PENDING_TAROT_READING_VERSION = 1;

const THEMES = new Set(['Amor', 'Carreira', 'Dinheiro', 'Energia', 'Saúde']);
const OUTCOMES = new Set(['clarity', 'nextStep', 'patterns', 'timing']);
const LANGUAGES = new Set(['pt', 'es', 'en']);
const CARD_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/;

// Todas as operacoes que podem observar ou alterar o snapshot passam pela
// mesma fila. Assim dois reveals disparados quase juntos leem o resultado da
// mutacao anterior, em vez de ambos regravarem copias antigas do array.
let mutationQueue = Promise.resolve();

function serialized(operation) {
  const result = mutationQueue.then(operation, operation);
  // Uma falha inesperada nao pode bloquear para sempre as proximas operacoes.
  mutationQueue = result.catch(() => undefined);
  return result;
}

function normalizeCardId(value) {
  if (typeof value !== 'string') return null;
  const id = value.trim();
  return CARD_ID.test(id) ? id : null;
}

function normalizeCreatedAt(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized && normalized.length <= 128 ? normalized : null;
}

function normalizeBooleanTriple(value) {
  if (!Array.isArray(value) || value.length !== 3 || !value.every((item) => typeof item === 'boolean')) {
    return null;
  }
  return value.slice();
}

function normalizeSnapshot(value, { requireVersion = true } = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  if (requireVersion && value.version !== PENDING_TAROT_READING_VERSION) return null;

  if (!THEMES.has(value.themeKey)) return null;
  if (!Array.isArray(value.cardIds) || value.cardIds.length !== 3) return null;
  const cardIds = value.cardIds.map(normalizeCardId);
  if (cardIds.some((id) => id === null) || new Set(cardIds).size !== 3) return null;

  const orientations = normalizeBooleanTriple(value.orientations);
  const revealed = normalizeBooleanTriple(value.revealed);
  if (!orientations || !revealed) return null;

  if (value.question !== undefined && typeof value.question !== 'string') return null;
  const question = (value.question || '').trim();
  if (question.length > 220) return null;
  if (!OUTCOMES.has(value.outcome) || !LANGUAGES.has(value.lang)) return null;

  const createdAt = normalizeCreatedAt(value.createdAt);
  if (createdAt === null) return null;

  return {
    version: PENDING_TAROT_READING_VERSION,
    themeKey: value.themeKey,
    cardIds,
    orientations,
    revealed,
    question,
    outcome: value.outcome,
    lang: value.lang,
    createdAt,
  };
}

async function readStoredSnapshot() {
  const raw = await getItemSeguro(PENDING_TAROT_READING_KEY);
  if (raw === null) return null;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    await removeItemSeguro(PENDING_TAROT_READING_KEY);
    return null;
  }

  const normalized = normalizeSnapshot(parsed);
  if (!normalized) {
    await removeItemSeguro(PENDING_TAROT_READING_KEY);
    return null;
  }
  return normalized;
}

export function savePendingTarotReading(snapshot) {
  // `version` e detalhe interno do armazenamento: quem cria uma tiragem pode
  // fornecer ou omitir o campo; o que vai ao disco sempre recebe a versao 1.
  const normalized = normalizeSnapshot(snapshot, { requireVersion: false });
  if (!normalized) return Promise.resolve(false);

  return serialized(async () => {
    await setItemSeguro(PENDING_TAROT_READING_KEY, JSON.stringify(normalized));
    return true;
  });
}

export function getPendingTarotReading() {
  return serialized(readStoredSnapshot);
}

export function updatePendingTarotRevealed(revealed) {
  const normalizedRevealed = normalizeBooleanTriple(revealed);
  if (!normalizedRevealed) return Promise.resolve(null);

  return serialized(async () => {
    const current = await readStoredSnapshot();
    if (!current) return null;
    const updated = { ...current, revealed: normalizedRevealed };
    await setItemSeguro(PENDING_TAROT_READING_KEY, JSON.stringify(updated));
    return updated;
  });
}

export function clearPendingTarotReading() {
  return serialized(async () => {
    await removeItemSeguro(PENDING_TAROT_READING_KEY);
    return true;
  });
}
