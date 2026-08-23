const test = require('node:test');
const assert = require('node:assert/strict');

const {
  ONBOARDING_INTENTS,
  ONBOARDING_SITUATIONS,
  ONBOARDING_OUTCOMES,
  buildOnboardingPlan,
  normalizeOnboardingIntent,
  normalizeOnboardingProfile,
  saveOnboardingIntent,
  getOnboardingIntent,
  clearOnboardingIntent,
  saveOnboardingProfile,
  getOnboardingProfile,
  clearOnboardingProfile,
} = require('../lib/onboardingPlan.js');
const { _reiniciarStorageParaTestes } = require('../lib/storage.js');
const { _DICTS_FOR_TESTS } = require('../lib/i18n.js');

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

test('cada intenção abre quatro situações próprias e todos os textos são traduzíveis', () => {
  const ids = [];
  for (const intent of ONBOARDING_INTENTS) {
    const situations = ONBOARDING_SITUATIONS[intent.id];
    assert.equal(situations.length, 4);
    for (const item of situations) {
      ids.push(item.id);
      assert.match(item.labelKey, /^onboarding\.situation\./);
      assert.match(item.echoKey, /^onboarding\.situation\./);
      assert.ok(item.firstFeature);
    }
  }
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ONBOARDING_OUTCOMES.length, 4);
});

test('situação e resultado alteram recursos reais, não apenas a frase', () => {
  assert.deepEqual(
    buildOnboardingPlan('love', 'solo', { intent: 'love', situation: 'loveClosure', outcome: 'clarity' }),
    ['diary', 'tarot', 'horoscope']
  );
  assert.deepEqual(
    buildOnboardingPlan('work', 'solo', { intent: 'work', situation: 'workBlock', outcome: 'nextStep' }),
    ['grounding', 'tarot', 'birthchart']
  );
  assert.deepEqual(
    buildOnboardingPlan('curiosity', 'solo', { intent: 'curiosity', situation: 'curiosityMap', outcome: 'timing' }),
    ['birthchart', 'horoscope', 'tarot']
  );
});

test('as 80 combinações adaptativas geram respostas completas e um plano real', () => {
  const idiomas = ['pt', 'es', 'en'];
  const recursosReais = new Set(['tarot', 'horoscope', 'diary', 'birthchart', 'grounding']);
  const narrativasPorIdioma = Object.fromEntries(idiomas.map((lang) => [lang, new Set()]));
  let combinacoes = 0;

  for (const intent of ONBOARDING_INTENTS) {
    for (const situation of ONBOARDING_SITUATIONS[intent.id]) {
      for (const outcome of ONBOARDING_OUTCOMES) {
        combinacoes += 1;
        const profile = { intent: intent.id, situation: situation.id, outcome: outcome.id };
        assert.deepEqual(normalizeOnboardingProfile(profile), profile);

        const plan = buildOnboardingPlan(intent.id, 'solo', profile);
        assert.equal(plan.length, 3);
        assert.equal(new Set(plan).size, plan.length);
        assert.equal(plan[0], situation.firstFeature);
        assert.ok(plan.includes(outcome.firstFeature));
        for (const feature of plan) assert.ok(recursosReais.has(feature));

        for (const lang of idiomas) {
          const dict = _DICTS_FOR_TESTS[lang];
          const parts = [dict[intent.echoKey], dict[situation.echoKey], dict[outcome.echoKey]];
          assert.ok(parts.every((part) => typeof part === 'string' && part.trim().length > 20));
          narrativasPorIdioma[lang].add(parts.join('|'));
        }
      }
    }
  }

  assert.equal(combinacoes, 80);
  for (const lang of idiomas) {
    assert.equal(narrativasPorIdioma[lang].size, 80, `${lang} precisa cobrir as 80 combinações`);
  }
});

test('perfil não aceita situação de outra intenção nem resposta incompleta', () => {
  assert.equal(normalizeOnboardingProfile({ intent: 'love', situation: 'workBlock', outcome: 'clarity' }), null);
  assert.equal(normalizeOnboardingProfile({ intent: 'love', situation: 'loveClosure' }), null);
  assert.deepEqual(
    normalizeOnboardingProfile({ intent: 'love', situation: 'loveClosure', outcome: 'patterns', extra: true }),
    { intent: 'love', situation: 'loveClosure', outcome: 'patterns' }
  );
});

test('casal recebe uma trilha própria e começa por compatibilidade', () => {
  for (const item of ONBOARDING_INTENTS) {
    assert.equal(buildOnboardingPlan(item.id, 'couple')[0], 'compatibility');
    const situation = ONBOARDING_SITUATIONS[item.id][0].id;
    assert.equal(
      buildOnboardingPlan(item.id, 'couple', { intent: item.id, situation, outcome: 'clarity' })[0],
      'compatibility'
    );
  }
});

test('valor inválido não é persistido nem vira personalização inventada', async () => {
  assert.equal(normalizeOnboardingIntent('qualquer-coisa'), null);
  assert.equal(await saveOnboardingIntent('qualquer-coisa'), false);
  assert.equal(await getOnboardingIntent(), null);
  assert.equal(await saveOnboardingProfile({ intent: 'love', situation: 'workBlock', outcome: 'clarity' }), false);
  assert.equal(await getOnboardingProfile(), null);
});

test('intenção válida pode ser salva, lida e apagada', async () => {
  assert.equal(await saveOnboardingIntent('decision'), true);
  assert.equal(await getOnboardingIntent(), 'decision');
  await clearOnboardingIntent();
  assert.equal(await getOnboardingIntent(), null);
});

test('perfil adaptativo válido pode ser salvo, lido e apagado', async () => {
  const profile = { intent: 'decision', situation: 'decisionTiming', outcome: 'timing' };
  assert.equal(await saveOnboardingProfile(profile), true);
  assert.deepEqual(await getOnboardingProfile(), profile);
  await clearOnboardingProfile();
  assert.equal(await getOnboardingProfile(), null);
});
