// Contrato puro das salas da Comunidade no servidor.
//
// O backend repete somente a geometria mínima porque `server-patches/` é
// publicado sozinho na VPS. Os testes do app comparam este contrato com
// lib/communityRooms.js para impedir que cliente e servidor classifiquem um
// mesmo par em salas diferentes.

const SIGN_IDS = Object.freeze([
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
]);

const ROOM_IDS = Object.freeze([
  "plaza", "mirrors", "bridges", "sparks", "poles", "between",
]);

const RELATION_BY_DISTANCE = Object.freeze([
  "copresenca", "alheio30", "sextil", "quadratura", "trigono", "alheio150", "oposicao",
]);

const ROOM_BY_RELATION = Object.freeze({
  copresenca: "mirrors",
  alheio30: "between",
  sextil: "bridges",
  quadratura: "sparks",
  trigono: "bridges",
  alheio150: "between",
  oposicao: "poles",
});

// A versão aceita é escolhida pelo servidor. O cliente nunca grava uma versão
// arbitrária; quando este valor mudar, todos precisam aceitar o texto novo.
const COMMUNITY_GUIDELINES_VERSION = "2026-08-24";

function normalizeSignId(value) {
  if (typeof value !== "string") return null;
  const clean = value.trim().toLowerCase();
  return SIGN_IDS.includes(clean) ? clean : null;
}

function normalizeRoomId(value) {
  if (typeof value !== "string") return null;
  const clean = value.trim().toLowerCase();
  return ROOM_IDS.includes(clean) ? clean : null;
}

function classifyPair(signAValue, signBValue) {
  const signA = normalizeSignId(signAValue);
  const signB = normalizeSignId(signBValue);
  if (!signA || !signB) return null;
  const indexA = SIGN_IDS.indexOf(signA);
  const indexB = SIGN_IDS.indexOf(signB);
  const rawDistance = Math.abs(indexA - indexB);
  const distance = Math.min(rawDistance, 12 - rawDistance);
  const relation = RELATION_BY_DISTANCE[distance];
  return {
    signA,
    signB,
    distance,
    degrees: distance * 30,
    relation,
    roomId: ROOM_BY_RELATION[relation],
  };
}

function hasCurrentGuidelines(profile) {
  return Boolean(
    profile &&
      profile.community_guidelines_version === COMMUNITY_GUIDELINES_VERSION &&
      profile.community_guidelines_accepted_at
  );
}

// Resolve os metadados de um NOVO post sem confiar em classificação enviada
// pelo cliente. Plaza não usa signo. Nas demais salas o signo A vem apenas do
// perfil público consentido; o cliente escolhe somente o signo B que quer
// conversar e o servidor calcula relação/sala.
function resolveCommunityPostMetadata({ roomId, targetSign, profile } = {}) {
  const requestedRoomId = normalizeRoomId(roomId);
  if (!requestedRoomId) return { ok: false, code: "invalid_room" };

  if (requestedRoomId === "plaza") {
    if (targetSign !== undefined && targetSign !== null && String(targetSign).trim()) {
      return { ok: false, code: "target_sign_not_allowed" };
    }
    return {
      ok: true,
      value: { roomId: "plaza", signA: null, signB: null, relation: null },
    };
  }

  const ownSign = normalizeSignId(profile && profile.zodiac_sign);
  if (!profile || profile.show_zodiac_sign !== 1 || !ownSign) {
    return { ok: false, code: "public_zodiac_sign_required" };
  }

  const cleanTargetSign = normalizeSignId(targetSign);
  if (!cleanTargetSign) return { ok: false, code: "invalid_target_sign" };

  const pair = classifyPair(ownSign, cleanTargetSign);
  if (!pair) return { ok: false, code: "invalid_target_sign" };
  if (pair.roomId !== requestedRoomId) {
    return {
      ok: false,
      code: "room_mismatch",
      expectedRoomId: pair.roomId,
    };
  }

  return {
    ok: true,
    value: {
      roomId: pair.roomId,
      signA: pair.signA,
      signB: pair.signB,
      relation: pair.relation,
    },
  };
}

module.exports = {
  COMMUNITY_GUIDELINES_VERSION,
  SIGN_IDS,
  ROOM_IDS,
  RELATION_BY_DISTANCE,
  normalizeSignId,
  normalizeRoomId,
  classifyPair,
  hasCurrentGuidelines,
  resolveCommunityPostMetadata,
};
