import pt from './traducoes/cosmicShareCard.pt';
import es from './traducoes/cosmicShareCard.es';
import en from './traducoes/cosmicShareCard.en';

const PACKS = Object.freeze({ pt, es, en });
const DEFAULTS = Object.freeze({
  brand: 'COSMIC GUIDE',
  edition: 'CELESTIAL NOTE',
  eyebrow: 'ALIGN YOUR SKY',
  glyph: '✦',
  title: 'Cosmic Guide',
  subtitle: '',
  detail: '',
  meta: '',
  footer: 'COSMIC GUIDE',
  shareText: 'Cosmic Guide',
  fileName: 'cosmic-guide-card',
});

const LIMITS = Object.freeze({
  brand: 32,
  edition: 32,
  eyebrow: 48,
  glyph: 4,
  title: 150,
  subtitle: 260,
  detail: 180,
  meta: 120,
  footer: 80,
  shareText: 560,
  fileName: 72,
});

export function cosmicShareCardPack(lang) {
  return PACKS[lang] || PACKS.pt;
}

export function cleanPublicCardText(value, maxLength = 180) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function cleanFileName(value) {
  const cleaned = cleanPublicCardText(value, LIMITS.fileName)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || DEFAULTS.fileName;
}

// Deliberately allow-listed: extra fields on `input` are never copied. Screens
// can only put the public result and its presentation labels into the artifact.
export function buildCosmicShareCardContent(input = {}) {
  const content = {
    brand: cleanPublicCardText(input.brand, LIMITS.brand) || DEFAULTS.brand,
    edition: cleanPublicCardText(input.edition, LIMITS.edition) || DEFAULTS.edition,
    eyebrow: cleanPublicCardText(input.eyebrow, LIMITS.eyebrow) || DEFAULTS.eyebrow,
    glyph: cleanPublicCardText(input.glyph, LIMITS.glyph) || DEFAULTS.glyph,
    title: cleanPublicCardText(input.title, LIMITS.title) || DEFAULTS.title,
    subtitle: cleanPublicCardText(input.subtitle, LIMITS.subtitle),
    detail: cleanPublicCardText(input.detail, LIMITS.detail),
    meta: cleanPublicCardText(input.meta, LIMITS.meta),
    footer: cleanPublicCardText(input.footer, LIMITS.footer) || DEFAULTS.footer,
    shareText: cleanPublicCardText(input.shareText, LIMITS.shareText) || DEFAULTS.shareText,
    fileName: cleanFileName(input.fileName),
  };
  return Object.freeze(content);
}

function seedFromText(value) {
  let seed = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    seed ^= value.charCodeAt(index);
    seed = Math.imul(seed, 16777619);
  }
  return seed >>> 0;
}

// Same small constellation on the preview and the exported PNG. It is based
// only on public card text, so rendering is stable and has no hidden profile ID.
export function cosmicCardStars(content, count = 30) {
  const safeCount = Math.max(8, Math.min(42, Math.round(Number(count) || 30)));
  let state = seedFromText(`${content?.title || ''}|${content?.detail || ''}`) || 1;
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  return Object.freeze(Array.from({ length: safeCount }, (_, index) => Object.freeze({
    id: `star-${index}`,
    x: 5 + next() * 90,
    y: 4 + next() * 91,
    size: 1 + next() * 2.5,
    opacity: 0.2 + next() * 0.62,
  })));
}

export const COSMIC_CARD_SIZE = Object.freeze({ width: 1080, height: 1920 });
