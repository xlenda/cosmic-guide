// O plano inicial do Cosmic Guide nasce de uma escolha explícita da pessoa.
// Ele não prevê nada e não usa IA: apenas ordena recursos que já existem no
// app de acordo com o trabalho que ela disse querer fazer agora.
import { getItemSeguro, setItemSeguro, removeItemSeguro } from './storage';

export const ONBOARDING_INTENT_KEY = 'cosmic-onboarding-intent-v1';
export const ONBOARDING_PROFILE_KEY = 'cosmic-onboarding-profile-v1';

// A primeira devolução depois de descobrir/escolher o signo precisa mudar de
// verdade com a escolha. O mapa fica aqui, longe das telas, para os dois
// caminhos do onboarding (data de nascimento e seletor direto) usarem a mesma
// fonte. Os textos se declaram contemporâneos: não fingem ser cálculo do mapa
// completo nem tradição antiga.
export const ONBOARDING_SIGN_STORY_KEYS = Object.freeze({
  'Áries': 'onboarding.signStory.aries',
  Touro: 'onboarding.signStory.taurus',
  'Gêmeos': 'onboarding.signStory.gemini',
  'Câncer': 'onboarding.signStory.cancer',
  'Leão': 'onboarding.signStory.leo',
  Virgem: 'onboarding.signStory.virgo',
  Libra: 'onboarding.signStory.libra',
  'Escorpião': 'onboarding.signStory.scorpio',
  'Sagitário': 'onboarding.signStory.sagittarius',
  'Capricórnio': 'onboarding.signStory.capricorn',
  'Aquário': 'onboarding.signStory.aquarius',
  Peixes: 'onboarding.signStory.pisces',
});

export function getOnboardingSignStoryKey(signName) {
  return ONBOARDING_SIGN_STORY_KEYS[signName] || null;
}

export const ONBOARDING_INTENTS = Object.freeze([
  Object.freeze({
    id: 'love',
    icon: 'heart',
    labelKey: 'onboarding.intent.love.label',
    descriptionKey: 'onboarding.intent.love.description',
    echoKey: 'onboarding.intent.love.echo',
  }),
  Object.freeze({
    id: 'decision',
    icon: 'git-branch',
    labelKey: 'onboarding.intent.decision.label',
    descriptionKey: 'onboarding.intent.decision.description',
    echoKey: 'onboarding.intent.decision.echo',
  }),
  Object.freeze({
    id: 'self',
    icon: 'compass',
    labelKey: 'onboarding.intent.self.label',
    descriptionKey: 'onboarding.intent.self.description',
    echoKey: 'onboarding.intent.self.echo',
  }),
  Object.freeze({
    id: 'work',
    icon: 'briefcase',
    labelKey: 'onboarding.intent.work.label',
    descriptionKey: 'onboarding.intent.work.description',
    echoKey: 'onboarding.intent.work.echo',
  }),
  Object.freeze({
    id: 'curiosity',
    icon: 'sparkles',
    labelKey: 'onboarding.intent.curiosity.label',
    descriptionKey: 'onboarding.intent.curiosity.description',
    echoKey: 'onboarding.intent.curiosity.echo',
  }),
]);

// A segunda pergunta muda com a intenção anterior. Cada opção descreve uma
// situação presente — não diagnostica, não prevê e não tenta forçar uma dor.
// `firstFeature` é o efeito concreto da resposta: muda a ordem da Home.
const situation = (id, icon, firstFeature) => Object.freeze({
  id,
  icon,
  firstFeature,
  labelKey: `onboarding.situation.${id}.label`,
  echoKey: `onboarding.situation.${id}.echo`,
});

export const ONBOARDING_SITUATIONS = Object.freeze({
  love: Object.freeze([
    situation('loveBeginning', 'sparkles-outline', 'tarot'),
    situation('loveRelationship', 'heart-outline', 'tarot'),
    situation('loveDistance', 'help-circle-outline', 'tarot'),
    situation('loveClosure', 'leaf-outline', 'diary'),
  ]),
  decision: Object.freeze([
    situation('decisionOptions', 'git-branch-outline', 'tarot'),
    situation('decisionTiming', 'time-outline', 'horoscope'),
    situation('decisionFear', 'shield-outline', 'grounding'),
    situation('decisionPressure', 'people-outline', 'birthchart'),
  ]),
  self: Object.freeze([
    situation('selfPatterns', 'repeat-outline', 'birthchart'),
    situation('selfEmotions', 'water-outline', 'diary'),
    situation('selfDirection', 'compass-outline', 'tarot'),
    situation('selfConfidence', 'sunny-outline', 'birthchart'),
  ]),
  work: Object.freeze([
    situation('workChange', 'swap-horizontal-outline', 'tarot'),
    situation('workGrowth', 'trending-up-outline', 'birthchart'),
    situation('workBlock', 'lock-closed-outline', 'grounding'),
    situation('workPurpose', 'navigate-outline', 'birthchart'),
  ]),
  curiosity: Object.freeze([
    situation('curiositySign', 'sunny-outline', 'horoscope'),
    situation('curiosityMap', 'map-outline', 'birthchart'),
    situation('curiosityTarot', 'albums-outline', 'tarot'),
    situation('curiositySky', 'moon-outline', 'horoscope'),
  ]),
});

const outcome = (id, icon, firstFeature) => Object.freeze({
  id,
  icon,
  firstFeature,
  labelKey: `onboarding.outcome.${id}.label`,
  echoKey: `onboarding.outcome.${id}.echo`,
});

export const ONBOARDING_OUTCOMES = Object.freeze([
  outcome('clarity', 'eye-outline', 'tarot'),
  outcome('nextStep', 'arrow-forward-circle-outline', 'grounding'),
  outcome('patterns', 'repeat-outline', 'birthchart'),
  outcome('timing', 'time-outline', 'horoscope'),
]);

const VALID_IDS = new Set(ONBOARDING_INTENTS.map((item) => item.id));

// Recursos reais, já existentes. A ordem é a personalização: nunca mudamos
// cálculo, carta ou significado para agradar a resposta do onboarding.
const SOLO_PLANS = Object.freeze({
  love: Object.freeze(['tarot', 'horoscope', 'diary']),
  decision: Object.freeze(['tarot', 'birthchart', 'diary']),
  self: Object.freeze(['birthchart', 'horoscope', 'diary']),
  work: Object.freeze(['tarot', 'birthchart', 'horoscope']),
  curiosity: Object.freeze(['tarot', 'birthchart', 'horoscope']),
});

const COUPLE_PLANS = Object.freeze({
  love: Object.freeze(['compatibility', 'tarot', 'timeline']),
  decision: Object.freeze(['compatibility', 'tarot', 'agir']),
  self: Object.freeze(['compatibility', 'birthchart', 'timeline']),
  work: Object.freeze(['compatibility', 'tarot', 'agir']),
  curiosity: Object.freeze(['compatibility', 'tarot', 'timeline']),
});

export function normalizeOnboardingIntent(value) {
  return typeof value === 'string' && VALID_IDS.has(value) ? value : null;
}

export function getOnboardingIntentDefinition(value) {
  const id = normalizeOnboardingIntent(value);
  return id ? ONBOARDING_INTENTS.find((item) => item.id === id) || null : null;
}

export function getOnboardingSituations(intent) {
  const id = normalizeOnboardingIntent(intent);
  return id ? ONBOARDING_SITUATIONS[id].slice() : [];
}

export function getOnboardingSituationDefinition(intent, value) {
  return getOnboardingSituations(intent).find((item) => item.id === value) || null;
}

export function getOnboardingOutcomeDefinition(value) {
  return ONBOARDING_OUTCOMES.find((item) => item.id === value) || null;
}

export function normalizeOnboardingProfile(value) {
  let candidate = value;
  if (typeof value === 'string') {
    try {
      candidate = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (!candidate || typeof candidate !== 'object') return null;
  const intent = normalizeOnboardingIntent(candidate.intent);
  const situationDef = getOnboardingSituationDefinition(intent, candidate.situation);
  const outcomeDef = getOnboardingOutcomeDefinition(candidate.outcome);
  if (!intent || !situationDef || !outcomeDef) return null;
  return { intent, situation: situationDef.id, outcome: outcomeDef.id };
}

export function buildOnboardingPlan(intent, mode = 'solo', profile = null) {
  const id = normalizeOnboardingIntent(intent) || 'curiosity';
  const table = mode === 'couple' ? COUPLE_PLANS : SOLO_PLANS;
  const base = table[id].slice();
  const normalizedProfile = normalizeOnboardingProfile(profile);
  if (mode !== 'solo' || !normalizedProfile || normalizedProfile.intent !== id) return base;
  const situationDef = getOnboardingSituationDefinition(id, normalizedProfile.situation);
  const outcomeDef = getOnboardingOutcomeDefinition(normalizedProfile.outcome);
  return [...new Set([situationDef.firstFeature, outcomeDef.firstFeature, ...base])].slice(0, 3);
}

export async function saveOnboardingIntent(intent) {
  const id = normalizeOnboardingIntent(intent);
  if (!id) return false;
  await setItemSeguro(ONBOARDING_INTENT_KEY, id);
  return true;
}

export async function getOnboardingIntent() {
  const raw = await getItemSeguro(ONBOARDING_INTENT_KEY);
  return normalizeOnboardingIntent(raw);
}

export async function saveOnboardingProfile(profile) {
  const normalized = normalizeOnboardingProfile(profile);
  if (!normalized) return false;
  await setItemSeguro(ONBOARDING_PROFILE_KEY, JSON.stringify(normalized));
  return true;
}

export async function getOnboardingProfile() {
  return normalizeOnboardingProfile(await getItemSeguro(ONBOARDING_PROFILE_KEY));
}

export async function clearOnboardingProfile() {
  await removeItemSeguro(ONBOARDING_PROFILE_KEY);
}

export async function clearOnboardingIntent() {
  await removeItemSeguro(ONBOARDING_INTENT_KEY);
}
