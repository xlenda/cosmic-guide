import pt from './traducoes/voice.pt';
import es from './traducoes/voice.es';
import en from './traducoes/voice.en';

const PACKS = Object.freeze({ pt, es, en });

export function voiceCopy(lang) {
  return PACKS[lang] || PACKS.pt;
}

export function voicePrivacyCopy(lang) {
  return voiceCopy(lang).privacy;
}
