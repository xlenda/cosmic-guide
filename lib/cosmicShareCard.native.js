import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { COSMIC_CARD_SIZE } from './cosmicShareCardContent';

export {
  COSMIC_CARD_SIZE,
  buildCosmicShareCardContent,
  cleanPublicCardText,
  cosmicCardStars,
  cosmicShareCardPack,
} from './cosmicShareCardContent';

export async function sharePremiumCosmicCard({ cardRef, dialogTitle }) {
  if (!cardRef?.current) throw new Error('share_card_not_ready');

  const available = await Sharing.isAvailableAsync();
  if (!available) throw new Error('native_sharing_unavailable');

  // react-native-view-shot 4.x defines width/height as the final image size,
  // not layout points. Keeping the values literal guarantees a 1080x1920 PNG.
  const uri = await captureRef(cardRef, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
    width: COSMIC_CARD_SIZE.width,
    height: COSMIC_CARD_SIZE.height,
  });
  const shareUri = /^[a-z][a-z0-9+.-]*:\/\//i.test(uri) ? uri : `file://${uri}`;

  await Sharing.shareAsync(shareUri, {
    dialogTitle,
    mimeType: 'image/png',
    UTI: 'public.png',
  });

  return { status: 'shared' };
}
