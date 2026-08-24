import pt from './traducoes/tarotMajorThemeLenses.pt.js';
import es from './traducoes/tarotMajorThemeLenses.es.js';
import en from './traducoes/tarotMajorThemeLenses.en.js';

const PACKS = Object.freeze({ pt, es, en });

export const MAJOR_THEME_LENS_LANGUAGES = Object.freeze(['pt', 'es', 'en']);
export const MAJOR_THEME_LENS_THEME_KEYS = Object.freeze([
  'Amor',
  'Carreira',
  'Dinheiro',
  'Energia',
  'Saúde',
]);
export const MAJOR_THEME_LENS_CARD_IDS = Object.freeze(Object.keys(pt));

const THEME_ALIASES = Object.freeze({
  amor: 'Amor',
  love: 'Amor',
  carreira: 'Carreira',
  carrera: 'Carreira',
  career: 'Carreira',
  work: 'Carreira',
  dinheiro: 'Dinheiro',
  dinero: 'Dinheiro',
  money: 'Dinheiro',
  energia: 'Energia',
  energy: 'Energia',
  saude: 'Saúde',
  salud: 'Saúde',
  health: 'Saúde',
  wellbeing: 'Saúde',
  'well-being': 'Saúde',
  wellness: 'Saúde',
});

function fold(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function normalizeMajorThemeLensLanguage(lang) {
  const prefix = String(lang || 'pt').trim().toLowerCase().split(/[-_]/)[0];
  return MAJOR_THEME_LENS_LANGUAGES.includes(prefix) ? prefix : 'pt';
}

export function normalizeMajorThemeLensTheme(theme) {
  return THEME_ALIASES[fold(theme)] || null;
}

// Aceita tanto a carta do tarotDeck quanto o id puro. Menores e entradas
// incompletas retornam null de propósito: este lote cobre apenas os 22 Maiores.
export function getMajorThemeLens(cardOrId, theme, lang = 'pt') {
  const cardId = typeof cardOrId === 'string' ? cardOrId : cardOrId?.id;
  if (typeof cardId !== 'string' || !cardId.startsWith('major-')) return null;

  const themeKey = normalizeMajorThemeLensTheme(theme);
  if (!themeKey) return null;

  const pack = PACKS[normalizeMajorThemeLensLanguage(lang)];
  return pack[cardId]?.[themeKey] || null;
}

export default getMajorThemeLens;
