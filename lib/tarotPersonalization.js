// Modelo puro de personalizacao do Taro.
//
// Esta camada organiza contexto para a tela, mas nao interpreta cartas e nao
// escreve frases. Os significados canonicos continuam vindo de tarotThemes;
// mudar a pergunta ou o objetivo da pessoa nunca muda o que foi sorteado.
// Assim, a tela pode escolher chaves i18n diferentes sem atribuir ao app uma
// previsao que o codigo nao calculou.

export const TAROT_QUESTION_MAX_LENGTH = 220;

export const TAROT_PERSONALIZATION_OUTCOMES = Object.freeze([
  'clarity',
  'nextStep',
  'patterns',
  'timing',
]);

const VALID_OUTCOMES = new Set(TAROT_PERSONALIZATION_OUTCOMES);
const CARD_COUNT = 3;

function cleanDisplayValue(value) {
  if (typeof value !== 'string') return null;
  const clean = value.replace(/\s+/gu, ' ').trim();
  return clean || null;
}

// Array.from conta caracteres Unicode, evitando cortar um emoji ao meio no
// limite. O trim final impede que o corte termine em um espaco inutil.
export function normalizeTarotQuestion(value) {
  const clean = cleanDisplayValue(value);
  if (!clean) return null;
  return Array.from(clean).slice(0, TAROT_QUESTION_MAX_LENGTH).join('').trimEnd() || null;
}

// O chamador normalmente entrega o objeto retornado por getOnboardingProfile.
// Aceitar JSON torna o helper tolerante ao valor bruto do storage sem importar
// storage/React Native e mantem este modulo testavel em Node puro.
export function resolveTarotOutcome(profile) {
  let candidate = profile;
  if (typeof profile === 'string') {
    try {
      candidate = JSON.parse(profile);
    } catch {
      candidate = null;
    }
  }
  const outcome = candidate && typeof candidate === 'object' ? candidate.outcome : null;
  return VALID_OUTCOMES.has(outcome) ? outcome : 'clarity';
}

function valueAt(values, index, keys = []) {
  if (!Array.isArray(values)) return null;
  const value = values[index];
  if (typeof value === 'string') return cleanDisplayValue(value);
  if (!value || typeof value !== 'object') return null;
  for (const key of keys) {
    const clean = cleanDisplayValue(value[key]);
    if (clean) return clean;
  }
  return null;
}

function fixedThree(mapper) {
  return Object.freeze(Array.from({ length: CARD_COUNT }, (_, index) => mapper(index)));
}

/**
 * Constroi apenas o modelo de dados para a sintese visual.
 *
 * `cards` pode ser um array de nomes ou de cartas ({ name }). Os significados
 * podem vir em `canonicalMeanings` ou, por conveniencia, nas proprias cartas
 * ({ canonicalMeaning | meaning }). Nenhum deles e reescrito aqui.
 */
export function buildTarotSynthesisModel({
  question,
  themeLabel,
  profile,
  cards = [],
  canonicalMeanings = [],
} = {}) {
  const normalizedQuestion = normalizeTarotQuestion(question);
  const normalizedTheme = cleanDisplayValue(themeLabel);
  const outcome = resolveTarotOutcome(profile);
  const cardNames = fixedThree((index) => valueAt(cards, index, ['name', 'cardName']));
  const meanings = fixedThree((index) => (
    valueAt(canonicalMeanings, index) ||
    valueAt(cards, index, ['canonicalMeaning', 'meaning'])
  ));

  // Objetos separados para interpolacao i18n: contextVars alimenta a abertura
  // da sintese; bridgeVars amarra as tres casas sem duplicar nem alterar texto.
  const contextVars = Object.freeze({
    question: normalizedQuestion,
    themeLabel: normalizedTheme,
    outcome,
    hasQuestion: normalizedQuestion !== null,
  });
  const bridgeVars = Object.freeze({
    firstCardName: cardNames[0],
    secondCardName: cardNames[1],
    thirdCardName: cardNames[2],
  });

  return Object.freeze({
    question: normalizedQuestion,
    themeLabel: normalizedTheme,
    outcome,
    cardNames,
    canonicalMeanings: meanings,
    contextVars,
    bridgeVars,
  });
}

/**
 * Corpo seguro para comunidade.
 *
 * A assinatura usa uma lista branca: somente tema, nomes das cartas e trechos
 * canonicos entram. `question`, `reflection`, notas e quaisquer outros campos
 * que o objeto recebido contenha sao ignorados por construcao.
 *
 * Nao ha rotulo em nenhum idioma aqui; a tela fornece todo texto visivel.
 */
export function buildPublicTarotBody({
  themeLabel,
  cardNames = [],
  canonicalSnippets = [],
} = {}) {
  const sections = [];
  const theme = cleanDisplayValue(themeLabel);
  if (theme) sections.push(theme);

  for (let index = 0; index < CARD_COUNT; index += 1) {
    const name = valueAt(cardNames, index, ['name', 'cardName']);
    const snippet = valueAt(canonicalSnippets, index, ['text', 'canonicalMeaning', 'meaning']);
    const lines = [name, snippet].filter(Boolean);
    if (lines.length) sections.push(lines.join('\n'));
  }

  return sections.join('\n\n');
}
