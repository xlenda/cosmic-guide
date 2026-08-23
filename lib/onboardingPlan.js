// O plano inicial do Cosmic Guide nasce de uma escolha explícita da pessoa.
// Ele não prevê nada e não usa IA: apenas ordena recursos que já existem no
// app de acordo com o trabalho que ela disse querer fazer agora.
import { getItemSeguro, setItemSeguro, removeItemSeguro } from './storage';

export const ONBOARDING_INTENT_KEY = 'cosmic-onboarding-intent-v1';

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

export function buildOnboardingPlan(intent, mode = 'solo') {
  const id = normalizeOnboardingIntent(intent) || 'curiosity';
  const table = mode === 'couple' ? COUPLE_PLANS : SOLO_PLANS;
  return table[id].slice();
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

export async function clearOnboardingIntent() {
  await removeItemSeguro(ONBOARDING_INTENT_KEY);
}
