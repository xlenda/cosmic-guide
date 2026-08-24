// Organização astrológica da Comunidade.
//
// Este módulo NÃO calcula compatibilidade humana. Ele só transforma a distância
// por signo inteiro, já calculada e documentada em dailyHoroscope.js, em uma das
// cinco salas editoriais. A pessoa continua livre para entrar em qualquer sala.
// Nenhum dado natal passa por aqui: somente IDs públicos e opcionais de signo.
import { SIGNS } from './signs';
import { relacaoSignoInteiro } from './dailyHoroscope';

const SIGN_IDS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

export const COMMUNITY_SIGNS = SIGNS.map((sign, index) => ({
  id: SIGN_IDS[index],
  name: sign.name,
  emoji: sign.emoji,
  index,
  nameKey: `community.sign.${SIGN_IDS[index]}`,
}));

export const COMMUNITY_ROOMS = [
  { id: 'plaza', icon: 'sparkles-outline', titleKey: 'community.room.plaza.title', descriptionKey: 'community.room.plaza.desc' },
  { id: 'mirrors', icon: 'copy-outline', titleKey: 'community.room.mirrors.title', descriptionKey: 'community.room.mirrors.desc' },
  { id: 'bridges', icon: 'git-compare-outline', titleKey: 'community.room.bridges.title', descriptionKey: 'community.room.bridges.desc' },
  { id: 'sparks', icon: 'flash-outline', titleKey: 'community.room.sparks.title', descriptionKey: 'community.room.sparks.desc' },
  { id: 'poles', icon: 'swap-horizontal-outline', titleKey: 'community.room.poles.title', descriptionKey: 'community.room.poles.desc' },
  { id: 'between', icon: 'ellipsis-horizontal-circle-outline', titleKey: 'community.room.between.title', descriptionKey: 'community.room.between.desc' },
];

const ROOM_BY_RELATION = Object.freeze({
  copresenca: 'mirrors',
  alheio30: 'between',
  sextil: 'bridges',
  quadratura: 'sparks',
  trigono: 'bridges',
  alheio150: 'between',
  oposicao: 'poles',
});

const NORMALIZED_ALIASES = Object.freeze({
  aries: 'aries',
  touro: 'taurus',
  taurus: 'taurus',
  gemeos: 'gemini',
  gemini: 'gemini',
  cancer: 'cancer',
  leao: 'leo',
  leo: 'leo',
  virgem: 'virgo',
  virgo: 'virgo',
  libra: 'libra',
  escorpiao: 'scorpio',
  scorpio: 'scorpio',
  sagitario: 'sagittarius',
  sagittarius: 'sagittarius',
  capricornio: 'capricorn',
  capricorn: 'capricorn',
  aquario: 'aquarius',
  aquarius: 'aquarius',
  peixes: 'pisces',
  pisces: 'pisces',
});

function fold(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
export function normalizeCommunitySignId(value) {
  if (value && typeof value === 'object') {
    return normalizeCommunitySignId(value.id || value.name);
  }
  return NORMALIZED_ALIASES[fold(value)] || null;
}

export function getCommunitySign(value) {
  const id = normalizeCommunitySignId(value);
  return id ? COMMUNITY_SIGNS.find((sign) => sign.id === id) || null : null;
}

export function getCommunityRoom(roomId) {
  return COMMUNITY_ROOMS.find((room) => room.id === roomId) || null;
}

export function classifyCommunityPair(signAValue, signBValue) {
  const signA = getCommunitySign(signAValue);
  const signB = getCommunitySign(signBValue);
  if (!signA || !signB) return null;

  const relation = relacaoSignoInteiro(signA.name, signB.name);
  const roomId = ROOM_BY_RELATION[relation];
  if (!roomId) return null;

  const rawDistance = Math.abs(signA.index - signB.index);
  const distance = Math.min(rawDistance, 12 - rawDistance);

  return {
    signA,
    signB,
    distance,
    degrees: distance * 30,
    relation,
    relationKey: `community.relation.${relation}`,
    roomId,
    room: getCommunityRoom(roomId),
  };
}

// Sugestões são uma ordenação editorial, não ranking. Não há score e nenhum
// signo é excluído: a lista sempre contém os doze, inclusive o próprio.
export function communitySuggestionsFor(signValue) {
  const sign = getCommunitySign(signValue);
  if (!sign) return [];
  return COMMUNITY_SIGNS.map((other) => classifyCommunityPair(sign, other));
}
