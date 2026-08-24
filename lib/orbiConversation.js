// Contrato puro da conversa com Órbi. A personalização usa apenas escolhas
// explícitas do onboarding e o signo já salvo no perfil; não lê Diário,
// pergunta anterior, nota privada, data de nascimento ou qualquer dado
// inferido. O backend repete a mesma allowlist antes de gastar tokens.
import {
  getOnboardingOutcomeDefinition,
  getOnboardingSituationDefinition,
  normalizeOnboardingProfile,
} from './onboardingPlan';

export const ORBI_PERSONA_ID = 'orbi';
export const ORBI_HISTORY_KEY = 'cosmic-chat-history-orbi';
export const ORBI_DIARY_RECORDED_KEY = 'cosmic-chat-diary-date';
export const ORBI_LEGACY_HISTORY_KEYS = Object.freeze([
  'cosmic-chat-history-luna',
  'cosmic-chat-history-arcano',
]);

export const ORBI_POSES = Object.freeze([
  'neutral',
  'curious',
  'thinking',
  'pointing',
  'celebrating',
]);

const VALID_SIGNS = new Set([
  'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
  'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
]);

export function normalizeOrbiSign(value) {
  const candidate = typeof value === 'string'
    ? value
    : value && typeof value === 'object'
      ? value.name || value.nome || value.signo
      : null;
  return VALID_SIGNS.has(candidate) ? candidate : null;
}

// O servidor exige os quatro campos juntos. Sem perfil completo OU sem signo,
// o chat continua funcionando sem contexto em vez de completar lacunas.
export function buildOrbiChatContext(profile, sign) {
  const normalizedProfile = normalizeOnboardingProfile(profile);
  const normalizedSign = normalizeOrbiSign(sign);
  if (!normalizedProfile || !normalizedSign) return undefined;
  return {
    sign: normalizedSign,
    intent: normalizedProfile.intent,
    situation: normalizedProfile.situation,
    outcome: normalizedProfile.outcome,
  };
}

// A tela resolve `valueKey` com t() e injeta o resultado no template. Assim as
// sugestões mudam verificavelmente com situação/objetivo sem manter 80 textos
// quase iguais, e continuam inteiras em PT/ES/EN.
export function buildOrbiSuggestionSpecs(profile, sign) {
  const normalizedProfile = normalizeOnboardingProfile(profile);
  const normalizedSign = normalizeOrbiSign(sign);
  const suggestions = [];

  if (normalizedProfile) {
    const situation = getOnboardingSituationDefinition(
      normalizedProfile.intent,
      normalizedProfile.situation
    );
    const outcome = getOnboardingOutcomeDefinition(normalizedProfile.outcome);
    if (situation) {
      suggestions.push({
        id: `situation-${situation.id}`,
        textKey: 'orbi.chat.prompt.situation',
        valueKey: situation.labelKey,
        valueVar: 'situation',
      });
    }
    if (outcome) {
      suggestions.push({
        id: `outcome-${outcome.id}`,
        textKey: 'orbi.chat.prompt.outcome',
        valueKey: outcome.labelKey,
        valueVar: 'outcome',
      });
    }
  }

  if (normalizedSign) {
    suggestions.push({
      id: `sign-${normalizedSign}`,
      textKey: 'orbi.chat.prompt.sign',
      vars: { sign: normalizedSign },
    });
  }

  const fallbackKeys = [
    'orbi.chat.prompt.organize',
    'orbi.chat.prompt.symbols',
    'orbi.chat.prompt.nextQuestion',
  ];
  for (const textKey of fallbackKeys) {
    if (suggestions.length >= 3) break;
    suggestions.push({ id: textKey, textKey });
  }
  return suggestions.slice(0, 3);
}
