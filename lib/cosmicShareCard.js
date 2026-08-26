export {
  COSMIC_CARD_SIZE,
  buildCosmicShareCardContent,
  cleanPublicCardText,
  cosmicCardStars,
  cosmicShareCardPack,
} from './cosmicShareCardContent';

// Node/test fallback. Metro selects .native.js and Expo Web selects .web.js.
export async function sharePremiumCosmicCard() {
  return { status: 'unsupported' };
}
