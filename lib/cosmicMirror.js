import { getCardById } from './tarotDeck';
import { getCardName } from './tarotThemes';
import { PACK as PT } from './traducoes/cosmicMirror.pt';
import { PACK as ES } from './traducoes/cosmicMirror.es';
import { PACK as EN } from './traducoes/cosmicMirror.en';

const PACKS = { pt: PT, es: ES, en: EN };
const DAY_MS = 24 * 60 * 60 * 1000;

export function cosmicMirrorPack(lang = 'pt') {
  return PACKS[lang] || PACKS.pt;
}

function safeTimestamp(value) {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function increment(map, key) {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + 1);
}

function winner(map, minimumCount = 1) {
  let result = null;
  let tied = false;
  for (const [key, count] of map.entries()) {
    if (!result || count > result.count) {
      result = { key, count };
      tied = false;
    } else if (count === result.count) {
      tied = true;
    }
  }
  return result && result.count >= minimumCount && !tied ? result : null;
}

function readingCards(entry) {
  const cards = entry?.readingDetails?.cards;
  return Array.isArray(cards) ? cards.filter((card) => card && typeof card.id === 'string') : [];
}

function isTarotEntry(entry) {
  return entry?.type === 'tarot' && readingCards(entry).length > 0;
}

function inWindow(entry, start, end) {
  const timestamp = safeTimestamp(entry?.date);
  return timestamp !== null && timestamp >= start && timestamp < end;
}

function summarizeEntries(entries, lang) {
  const cardCounts = new Map();
  const suitCounts = new Map();
  const themeCounts = new Map();
  let reversedCount = 0;
  let cardCount = 0;
  let firstCardId = null;

  for (const entry of entries) {
    const themeKey = entry?.readingDetails?.themeKey;
    increment(themeCounts, themeKey);
    for (const item of readingCards(entry)) {
      const card = getCardById(item.id);
      if (!card) continue;
      if (!firstCardId) firstCardId = card.id;
      cardCount += 1;
      if (item.reversed === true) reversedCount += 1;
      increment(cardCounts, card.id);
      increment(suitCounts, card.arcana === 'maior' ? 'maiores' : card.suit);
    }
  }

  const topCardRaw = winner(cardCounts, 2);
  const topSuit = winner(suitCounts);
  const topTheme = winner(themeCounts);
  const topCard = topCardRaw
    ? { ...topCardRaw, name: getCardName(getCardById(topCardRaw.key), lang) }
    : null;
  const firstCard = firstCardId
    ? { key: firstCardId, name: getCardName(getCardById(firstCardId), lang) }
    : null;

  return {
    readingCount: entries.length,
    cardCount,
    uniqueCardCount: cardCounts.size,
    reversedCount,
    reversedPct: cardCount > 0 ? Math.round((reversedCount / cardCount) * 100) : 0,
    topCard,
    firstCard,
    topSuit,
    topTheme,
  };
}

export function buildCosmicMirror(entries, { period = 30, now = Date.now(), lang = 'pt' } = {}) {
  const pack = cosmicMirrorPack(lang);
  const source = (Array.isArray(entries) ? entries : []).filter(isTarotEntry);
  const normalizedPeriod = period === 'all' ? 'all' : period === 7 ? 7 : 30;
  const end = Number.isFinite(now) ? now : Date.now();
  const current = normalizedPeriod === 'all'
    ? source
    : source.filter((entry) => inWindow(entry, end - normalizedPeriod * DAY_MS, end + 1));
  const previous = normalizedPeriod === 'all'
    ? []
    : source.filter((entry) => inWindow(entry, end - normalizedPeriod * DAY_MS * 2, end - normalizedPeriod * DAY_MS));

  const summary = summarizeEntries(current, lang);
  const previousSummary = summarizeEntries(previous, lang);
  const suitLabel = summary.topSuit ? pack.suits[summary.topSuit.key] || summary.topSuit.key : pack.noDominant;
  const themeLabel = summary.topTheme ? pack.themes[summary.topTheme.key] || summary.topTheme.key : pack.noDominant;
  const periodLabel = pack.periods[normalizedPeriod];
  const trendDelta = summary.readingCount - previousSummary.readingCount;
  const trend = normalizedPeriod === 'all'
    ? null
    : trendDelta > 0
      ? pack.trendUp({ count: trendDelta })
      : trendDelta < 0
        ? pack.trendDown({ count: Math.abs(trendDelta) })
        : pack.trendSame;

  let status = 'empty';
  let body = pack.emptyBody;
  if (summary.readingCount === 1 && summary.firstCard) {
    status = 'first';
    body = pack.firstBody({ card: summary.firstCard.name });
  } else if (summary.readingCount > 1 && summary.topCard) {
    status = 'pattern';
    body = pack.patternBody({
      card: summary.topCard.name,
      count: summary.topCard.count,
      suit: summary.topSuit ? suitLabel : null,
      theme: summary.topTheme ? themeLabel : null,
    });
  } else if (summary.readingCount > 1) {
    status = 'developing';
    body = pack.developingBody({ readings: summary.readingCount, unique: summary.uniqueCardCount });
  }

  const receipt = pack.receiptBody({
    readings: summary.readingCount,
    cards: summary.cardCount,
    period: periodLabel,
  });
  const shareText = status === 'empty'
    ? ''
    : [pack.shareEyebrow, body, receipt, pack.shareFooter].join('\n\n');

  return {
    status,
    period: normalizedPeriod,
    periodLabel,
    body,
    trend,
    suitLabel,
    themeLabel,
    receipt,
    shareText,
    ...summary,
  };
}
