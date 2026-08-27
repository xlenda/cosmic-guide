// Primeira barreira pré-publicação para UGC. Ela bloqueia somente padrões de
// alta confiança; contexto ambíguo continua indo para denúncia + moderação
// humana. A regra roda no servidor para não poder ser removida pelo cliente.

const BLOCK_RULES = Object.freeze([
  {
    reason: "credible_threat",
    pattern: /\b(?:eu\s+vou|vou|iremos|i\s+will|i['’]?m\s+going\s+to|voy\s+a)\s+(?:te\s+|lhe\s+|you\s+|a\s+ti\s+)?(?:matar|assassinar|machucar|kill|murder|hurt|asesinar|lastimar)\b/,
  },
  {
    reason: "credible_threat",
    pattern: /\b(?:te\s+mato|vou\s+acabar\s+com\s+voce|i['’]?ll\s+kill\s+you|i\s+will\s+hurt\s+you|te\s+voy\s+a\s+matar)\b/,
  },
  {
    reason: "sexual_exploitation",
    pattern: /\b(?:pornografia\s+infantil|pornografia\s+de\s+menores|child\s+porn(?:ography)?|minor\s+porn|porn\s+infantil)\b/,
  },
  {
    reason: "sexual_exploitation",
    pattern: /\b(?:nudes?|foto(?:s)?\s+pelad[oa]s?)\s+(?:de\s+|do\s+|da\s+)?(?:menor(?:es)?|crianca(?:s)?|nino(?:s)?|nina(?:s)?|child(?:ren)?|minor(?:s)?)\b/,
  },
  {
    reason: "sexual_solicitation",
    pattern: /\b(?:manda|mande|envia|envie|send|send\s+me|mandame|enviame)\s+(?:um\s+|uma\s+|me\s+|tus?\s+)?(?:nude|nudes|foto(?:s)?\s+pelad[oa]s?)\b/,
  },
  {
    reason: "extreme_abuse",
    pattern: /\b(?:nigger|faggot|tranny|retardado\s+imundo|puta\s+imunda|negro\s+imundo|maricon\s+de\s+mierda)\b/,
  },
]);

function normalizeForSafety(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_*~`|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function assessCommunityContent(...values) {
  const original = values.filter((value) => typeof value === "string").join("\n");
  const normalized = normalizeForSafety(original);
  if (!normalized) return { allowed: true };

  for (const rule of BLOCK_RULES) {
    if (rule.pattern.test(normalized)) {
      return { allowed: false, reason: rule.reason };
    }
  }

  const links = original.match(/(?:https?:\/\/|www\.)\S+/gi) || [];
  if (links.length > 3) return { allowed: false, reason: "link_spam" };
  if (/(.)\1{14,}/u.test(normalized)) return { allowed: false, reason: "character_spam" };

  return { allowed: true };
}

module.exports = { assessCommunityContent, normalizeForSafety };
