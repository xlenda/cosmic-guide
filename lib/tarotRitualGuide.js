import tarotRitualGuidePt from './traducoes/tarotRitualGuide.pt';
import tarotRitualGuideEs from './traducoes/tarotRitualGuide.es';
import tarotRitualGuideEn from './traducoes/tarotRitualGuide.en';

// Contrato editorial puro do ritual. A tela pode consumir este modulo sem
// storage, rede ou estado global. Os IDs abaixo sao os unicos valores que
// devem ser persistidos; labels e textos sempre vem do pacote de idioma.

export const TAROT_RITUAL_GUIDE_VERSION = 1;

export const TAROT_GUIDE_THEME_IDS = Object.freeze([
  'love',
  'career',
  'money',
  'energy',
  'wellbeing',
]);

export const TAROT_GUIDE_SPREAD_IDS = Object.freeze([
  'past-present-future',
  'situation-tension-next-step',
]);

export const TAROT_GUIDE_SIGN_IDS = Object.freeze([
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
]);

export const TAROT_GUIDE_FOCUS_IDS_BY_THEME = Object.freeze({
  love: Object.freeze(['new-bond', 'mutuality-boundaries', 'closure-renewal']),
  career: Object.freeze(['direction-purpose', 'visibility-growth', 'decision-transition']),
  money: Object.freeze(['stability-habits', 'opportunity-choice', 'value-boundaries']),
  energy: Object.freeze(['overload-drain', 'rhythm-recovery', 'motivation-focus']),
  wellbeing: Object.freeze(['emotional-balance', 'self-care-boundaries', 'support-next-step']),
});

const FOCUS_SPREAD_BY_ID = Object.freeze({
  'new-bond': 'past-present-future',
  'mutuality-boundaries': 'situation-tension-next-step',
  'closure-renewal': 'situation-tension-next-step',
  'direction-purpose': 'past-present-future',
  'visibility-growth': 'situation-tension-next-step',
  'decision-transition': 'situation-tension-next-step',
  'stability-habits': 'past-present-future',
  'opportunity-choice': 'situation-tension-next-step',
  'value-boundaries': 'situation-tension-next-step',
  'overload-drain': 'situation-tension-next-step',
  'rhythm-recovery': 'past-present-future',
  'motivation-focus': 'situation-tension-next-step',
  'emotional-balance': 'past-present-future',
  'self-care-boundaries': 'situation-tension-next-step',
  'support-next-step': 'situation-tension-next-step',
});

const PACKS = Object.freeze({
  pt: tarotRitualGuidePt,
  es: tarotRitualGuideEs,
  en: tarotRitualGuideEn,
});

function normalizedToken(value) {
  if (typeof value !== 'string') return null;
  const token = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/gu, '-')
    .replace(/[^a-z0-9-]/gu, '');
  return token || null;
}
const THEME_ALIASES = Object.freeze({
  love: 'love',
  amor: 'love',
  relationship: 'love',
  relationships: 'love',
  relacionamento: 'love',
  relacionamentos: 'love',
  relacion: 'love',
  relaciones: 'love',
  career: 'career',
  carreira: 'career',
  trabajo: 'career',
  money: 'money',
  dinheiro: 'money',
  dinero: 'money',
  finance: 'money',
  finances: 'money',
  financas: 'money',
  finanzas: 'money',
  energy: 'energy',
  energia: 'energy',
  wellbeing: 'wellbeing',
  'well-being': 'wellbeing',
  wellness: 'wellbeing',
  saude: 'wellbeing',
  salud: 'wellbeing',
  'bem-estar': 'wellbeing',
  bienestar: 'wellbeing',
});

const SIGN_ALIASES = Object.freeze({
  aries: 'aries',
  taurus: 'taurus',
  touro: 'taurus',
  tauro: 'taurus',
  gemini: 'gemini',
  gemeos: 'gemini',
  geminis: 'gemini',
  cancer: 'cancer',
  leo: 'leo',
  leao: 'leo',
  virgo: 'virgo',
  virgem: 'virgo',
  libra: 'libra',
  scorpio: 'scorpio',
  escorpiao: 'scorpio',
  escorpio: 'scorpio',
  sagittarius: 'sagittarius',
  sagitario: 'sagittarius',
  capricorn: 'capricorn',
  capricornio: 'capricorn',
  aquarius: 'aquarius',
  aquario: 'aquarius',
  acuario: 'aquarius',
  pisces: 'pisces',
  peixes: 'pisces',
  piscis: 'pisces',
});

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
}

function copyFocus(themeId, focusId, pack) {
  const copy = pack.themes[themeId]?.focuses?.[focusId];
  const spreadId = FOCUS_SPREAD_BY_ID[focusId];
  if (!copy || !spreadId) return null;
  return deepFreeze({ id: focusId, spreadId, ...copy });
}

function copySpread(spreadId, pack) {
  const spread = pack.spreads[spreadId];
  if (!spread) return null;
  return deepFreeze({
    id: spreadId,
    label: spread.label,
    description: spread.description,
    positions: spread.positions.map((position) => ({ ...position })),
  });
}

export function normalizeTarotGuideLanguage(value) {
  const token = normalizedToken(value);
  if (!token) return 'pt';
  const prefix = token.split('-')[0];
  if (prefix === 'es' || token === 'espanol') return 'es';
  if (prefix === 'en' || token === 'english') return 'en';
  if (prefix === 'pt' || token === 'portugues') return 'pt';
  return 'pt';
}

export function normalizeTarotGuideTheme(value) {
  return THEME_ALIASES[normalizedToken(value)] || null;
}

export function normalizeTarotGuideSign(value) {
  return SIGN_ALIASES[normalizedToken(value)] || null;
}

export function getTarotGuideFocuses(theme, lang = 'pt') {
  const themeId = normalizeTarotGuideTheme(theme);
  if (!themeId) return Object.freeze([]);
  const pack = PACKS[normalizeTarotGuideLanguage(lang)];
  return Object.freeze(
    TAROT_GUIDE_FOCUS_IDS_BY_THEME[themeId]
      .map((focusId) => copyFocus(themeId, focusId, pack))
      .filter(Boolean),
  );
}

export function getTarotGuideSpread(spreadId, lang = 'pt') {
  if (!TAROT_GUIDE_SPREAD_IDS.includes(spreadId)) return null;
  const pack = PACKS[normalizeTarotGuideLanguage(lang)];
  return copySpread(spreadId, pack);
}

export function getTarotGuideSignLens(sign, lang = 'pt') {
  const signId = normalizeTarotGuideSign(sign);
  if (!signId) return null;
  const pack = PACKS[normalizeTarotGuideLanguage(lang)];
  const lens = pack.signs[signId];
  return lens ? deepFreeze({ id: signId, ...lens }) : null;
}

export function getTarotGuideDisclosures(lang = 'pt') {
  const pack = PACKS[normalizeTarotGuideLanguage(lang)];
  return deepFreeze({ ...pack.disclosures });
}

/**
 * Resolve um roteiro editorial a partir de escolhas explicitas.
 *
 * O helper nao sorteia cartas, nao interpreta texto livre e nao persiste nada.
 * Tema/foco invalidos encerram a resolucao; signo ausente ou invalido apenas
 * remove a lente opcional, sem cair silenciosamente em Aries.
 */
export function buildTarotRitualGuide({ themeId, focusId, sign, lang = 'pt' } = {}) {
  const normalizedThemeId = normalizeTarotGuideTheme(themeId);
  if (!normalizedThemeId) return null;

  const validFocusIds = TAROT_GUIDE_FOCUS_IDS_BY_THEME[normalizedThemeId];
  if (!validFocusIds.includes(focusId)) return null;

  const normalizedLang = normalizeTarotGuideLanguage(lang);
  const pack = PACKS[normalizedLang];
  const focus = copyFocus(normalizedThemeId, focusId, pack);
  if (!focus) return null;

  const spread = copySpread(focus.spreadId, pack);
  if (!spread) return null;

  const requestedSign = typeof sign === 'string' && sign.trim() !== '';
  const signLens = requestedSign ? getTarotGuideSignLens(sign, normalizedLang) : null;

  return deepFreeze({
    version: TAROT_RITUAL_GUIDE_VERSION,
    lang: normalizedLang,
    selection: {
      themeId: normalizedThemeId,
      focusId,
      spreadId: spread.id,
      signId: signLens?.id || null,
    },
    theme: {
      id: normalizedThemeId,
      label: pack.themes[normalizedThemeId].label,
    },
    focus,
    spread,
    signLens,
    disclosures: { ...pack.disclosures },
  });
}
