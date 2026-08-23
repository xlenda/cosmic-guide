const test = require('node:test');
const assert = require('node:assert/strict');

const { zodiacSigns } = require('../theme.js');
const {
  ONBOARDING_SIGN_STORY_KEYS,
  getOnboardingSignStoryKey,
} = require('../lib/onboardingPlan.js');
const { _DICTS_FOR_TESTS } = require('../lib/i18n.js');

test('os doze signos têm uma primeira leitura própria', () => {
  const keys = zodiacSigns.map((sign) => getOnboardingSignStoryKey(sign.name));
  assert.equal(keys.length, 12);
  assert.equal(new Set(keys).size, 12);
  assert.deepEqual(new Set(keys), new Set(Object.values(ONBOARDING_SIGN_STORY_KEYS)));
});

test('cada leitura existe e é diferente nos três idiomas', () => {
  for (const lang of ['pt', 'es', 'en']) {
    const textos = zodiacSigns.map((sign) => {
      const key = getOnboardingSignStoryKey(sign.name);
      const texto = _DICTS_FOR_TESTS[lang][key];
      assert.ok(typeof texto === 'string' && texto.length > 120, `${lang}/${sign.name} ficou vazio ou genérico`);
      return texto;
    });
    assert.equal(new Set(textos).size, 12, `${lang}: algum signo recebeu exatamente o texto de outro`);
  }
});

test('signo desconhecido não recebe a leitura de Áries por fallback', () => {
  assert.equal(getOnboardingSignStoryKey('Ofiúco'), null);
  assert.equal(getOnboardingSignStoryKey(null), null);
});
