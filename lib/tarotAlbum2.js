import { PACK as PT } from './traducoes/tarotAlbum2.pt';
import { PACK as ES } from './traducoes/tarotAlbum2.es';
import { PACK as EN } from './traducoes/tarotAlbum2.en';

const PACKS = { pt: PT, es: ES, en: EN };

export function tarotAlbum2Pack(lang = 'pt') {
  return PACKS[lang] || PACKS.pt;
}

export function normalizeAlbumSearch(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function cardMatchesAlbumFilter(card, { filter = 'all', search = '', seenIds, favoriteIds, stats, name } = {}) {
  if (!card) return false;
  const seen = seenIds instanceof Set ? seenIds.has(card.id) : false;
  const favorite = favoriteIds instanceof Set ? favoriteIds.has(card.id) : false;
  const encounters = Math.max(0, Number(stats?.[card.id]?.count) || 0);

  if (filter === 'seen' && !seen) return false;
  if (filter === 'unseen' && seen) return false;
  if (filter === 'favorites' && !favorite) return false;
  if (filter === 'repeated' && encounters < 2) return false;

  const needle = normalizeAlbumSearch(search);
  // A busca nunca entrega o nome nem a posição de uma carta ainda oculta.
  // Com texto digitado, só cartas já reveladas podem corresponder.
  if (needle && !seen) return false;
  return !needle || normalizeAlbumSearch(name).includes(needle);
}

export function formatAlbumDate(value, lang = 'pt') {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  const locale = lang === 'es' ? 'es-ES' : lang === 'en' ? 'en-US' : 'pt-BR';
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}
