import { PACK as PT } from './traducoes/tarotReceipt.pt';
import { PACK as ES } from './traducoes/tarotReceipt.es';
import { PACK as EN } from './traducoes/tarotReceipt.en';

const PACKS = { pt: PT, es: ES, en: EN };

export function tarotReceiptPack(lang = 'pt') {
  return PACKS[lang] || PACKS.pt;
}

export function buildTarotReceipt(readingDetails, lang = 'pt') {
  const pack = tarotReceiptPack(lang);
  const details = readingDetails && typeof readingDetails === 'object' ? readingDetails : {};
  const cards = Array.isArray(details.cards)
    ? details.cards.map((card) => card?.name).filter(Boolean)
    : [];
  return {
    title: pack.title,
    privacy: pack.privacy,
    rows: [
      { id: 'theme', label: pack.theme, value: details.themeLabel },
      { id: 'focus', label: pack.focus, value: details.focusLabel },
      { id: 'spread', label: pack.spread, value: details.spreadLabel },
      { id: 'sign', label: pack.sign, value: details.signLabel || pack.noSign },
      { id: 'cards', label: pack.cards, value: cards.join(' · ') },
    ].filter((row) => typeof row.value === 'string' && row.value.trim()),
  };
}
