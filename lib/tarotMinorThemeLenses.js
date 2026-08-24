import pausPt from './traducoes/tarotMinorThemeLenses.paus.pt.js';
import pausEs from './traducoes/tarotMinorThemeLenses.paus.es.js';
import pausEn from './traducoes/tarotMinorThemeLenses.paus.en.js';
import copasPt from './traducoes/tarotMinorThemeLenses.copas.pt.js';
import copasEs from './traducoes/tarotMinorThemeLenses.copas.es.js';
import copasEn from './traducoes/tarotMinorThemeLenses.copas.en.js';
import espadasPt from './traducoes/tarotMinorThemeLenses.espadas.pt.js';
import espadasEs from './traducoes/tarotMinorThemeLenses.espadas.es.js';
import espadasEn from './traducoes/tarotMinorThemeLenses.espadas.en.js';
import ourosPt from './traducoes/tarotMinorThemeLenses.ouros.pt.js';
import ourosEs from './traducoes/tarotMinorThemeLenses.ouros.es.js';
import ourosEn from './traducoes/tarotMinorThemeLenses.ouros.en.js';
import {
  normalizeMajorThemeLensLanguage,
  normalizeMajorThemeLensTheme,
} from './tarotMajorThemeLenses';

const PACKS = Object.freeze({
  pt: Object.freeze({ paus: pausPt, copas: copasPt, espadas: espadasPt, ouros: ourosPt }),
  es: Object.freeze({ paus: pausEs, copas: copasEs, espadas: espadasEs, ouros: ourosEs }),
  en: Object.freeze({ paus: pausEn, copas: copasEn, espadas: espadasEn, ouros: ourosEn }),
});

export const MINOR_THEME_LENS_LANGUAGES = Object.freeze(['pt', 'es', 'en']);
export const MINOR_THEME_LENS_THEME_KEYS = Object.freeze([
  'Amor',
  'Carreira',
  'Dinheiro',
  'Energia',
  'Saúde',
]);
export const MINOR_THEME_LENS_SUITS = Object.freeze(['paus', 'copas', 'espadas', 'ouros']);
export const MINOR_THEME_LENS_CARD_IDS = Object.freeze(
  MINOR_THEME_LENS_SUITS.flatMap((suit) => Object.keys(PACKS.pt[suit])),
);

export const normalizeMinorThemeLensLanguage = normalizeMajorThemeLensLanguage;
export const normalizeMinorThemeLensTheme = normalizeMajorThemeLensTheme;

// Aceita a carta do deck ou o id puro. Maiores, tema invalido e id ausente
// devolvem null para que a tela possa compor esta camada com a dos Maiores.
export function getMinorThemeLens(cardOrId, theme, lang = 'pt') {
  const cardId = typeof cardOrId === 'string' ? cardOrId : cardOrId?.id;
  if (typeof cardId !== 'string') return null;
  const suit = cardId.split('-')[0];
  if (!MINOR_THEME_LENS_SUITS.includes(suit)) return null;

  const themeKey = normalizeMinorThemeLensTheme(theme);
  if (!themeKey) return null;

  const language = normalizeMinorThemeLensLanguage(lang);
  return PACKS[language][suit]?.[cardId]?.[themeKey] || null;
}

export default getMinorThemeLens;
