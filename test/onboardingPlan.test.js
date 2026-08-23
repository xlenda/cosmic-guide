const test = require('node:test');
const assert = require('node:assert/strict');

const {
  ONBOARDING_INTENTS,
  buildOnboardingPlan,
  normalizeOnboardingIntent,
  saveOnboardingIntent,
  getOnboardingIntent,
  clearOnboardingIntent,
} = require('../lib/onboardingPlan.js');
const { _reiniciarStorageParaTestes } = require('../lib/storage.js');

test.beforeEach(() => {
  _reiniciarStorageParaTestes();
});

test('intenções têm ids únicos e chaves de texto explícitas', () => {
  const ids = ONBOARDING_INTENTS.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const item of ONBOARDING_INTENTS) {
    assert.match(item.labelKey, /^onboarding\.intent\./);
    assert.match(item.descriptionKey, /^onboarding\.intent\./);
    assert.match(item.echoKey, /^onboarding\.intent\./);
  }
});

test('cada resposta muda de verdade a ordem do plano solo', () => {
  const plans = ONBOARDING_INTENTS.map((item) => buildOnboardingPlan(item.id, 'solo').join('|'));
  assert.ok(new Set(plans).size >= 4, 'as respostas não podem devolver o mesmo plano decorativo');
  assert.deepEqual(buildOnboardingPlan('love', 'solo'), ['tarot', 'horoscope', 'diary']);
  assert.deepEqual(buildOnboardingPlan('self', 'solo'), ['birthchart', 'horoscope', 'diary']);
});

test('casal recebe uma trilha própria e começa por compatibilidade', () => {
  for (const item of ONBOARDING_INTENTS) {
    assert.equal(buildOnboardingPlan(item.id, 'couple')[0], 'compatibility');
  }
});

test('valor inválido não é persistido nem vira personalização inventada', async () => {
  assert.equal(normalizeOnboardingIntent('qualquer-coisa'), null);
  assert.equal(await saveOnboardingIntent('qualquer-coisa'), false);
  assert.equal(await getOnboardingIntent(), null);
});

test('intenção válida pode ser salva, lida e apagada', async () => {
  assert.equal(await saveOnboardingIntent('decision'), true);
  assert.equal(await getOnboardingIntent(), 'decision');
  await clearOnboardingIntent();
  assert.equal(await getOnboardingIntent(), null);
});
