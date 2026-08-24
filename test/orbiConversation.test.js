const test = require('node:test');
const assert = require('node:assert/strict');

const {
  ORBI_DIARY_RECORDED_KEY,
  ORBI_HISTORY_KEY,
  ORBI_LEGACY_HISTORY_KEYS,
  ORBI_PERSONA_ID,
  ORBI_POSES,
  buildOrbiChatContext,
  buildOrbiSuggestionSpecs,
  normalizeOrbiSign,
} = require('../lib/orbiConversation.js');
const { ONBOARDING_INTENTS, ONBOARDING_SITUATIONS, ONBOARDING_OUTCOMES } = require('../lib/onboardingPlan.js');

test('Órbi é a única persona nova e expõe as cinco poses do sistema', () => {
  assert.equal(ORBI_PERSONA_ID, 'orbi');
  assert.equal(ORBI_DIARY_RECORDED_KEY, 'cosmic-chat-diary-date');
  assert.equal(ORBI_HISTORY_KEY, 'cosmic-chat-history-orbi');
  assert.deepEqual(ORBI_LEGACY_HISTORY_KEYS, [
    'cosmic-chat-history-luna',
    'cosmic-chat-history-arcano',
  ]);
  assert.equal(Object.isFrozen(ORBI_LEGACY_HISTORY_KEYS), true);
  assert.deepEqual(ORBI_POSES, ['neutral', 'curious', 'thinking', 'pointing', 'celebrating']);
  assert.equal(new Set(ORBI_POSES).size, 5);
});

test('contexto aceita somente perfil completo e signo canônico', () => {
  const profile = { intent: 'love', situation: 'loveDistance', outcome: 'clarity' };
  assert.deepEqual(buildOrbiChatContext(profile, { name: 'Escorpião' }), {
    sign: 'Escorpião',
    intent: 'love',
    situation: 'loveDistance',
    outcome: 'clarity',
  });
  assert.equal(buildOrbiChatContext(profile, 'Ofiúco'), undefined);
  assert.equal(buildOrbiChatContext({ ...profile, situation: 'workBlock' }, 'Áries'), undefined);
  assert.equal(buildOrbiChatContext(null, 'Áries'), undefined);
  assert.equal(normalizeOrbiSign({ signo: 'Peixes' }), 'Peixes');
  assert.equal(normalizeOrbiSign({ name: '<script>' }), null);
});

test('as 80 combinações mudam as perguntas por situação e objetivo', () => {
  const signatures = new Set();
  let count = 0;
  for (const intent of ONBOARDING_INTENTS) {
    for (const situation of ONBOARDING_SITUATIONS[intent.id]) {
      for (const outcome of ONBOARDING_OUTCOMES) {
        count += 1;
        const specs = buildOrbiSuggestionSpecs(
          { intent: intent.id, situation: situation.id, outcome: outcome.id },
          'Áries'
        );
        assert.equal(specs.length, 3);
        assert.equal(new Set(specs.map((item) => item.id)).size, 3);
        assert.equal(specs[0].valueKey, situation.labelKey);
        assert.equal(specs[1].valueKey, outcome.labelKey);
        assert.equal(specs[2].vars.sign, 'Áries');
        signatures.add(specs.map((item) => item.id).join('|'));
      }
    }
  }
  assert.equal(count, 80);
  assert.equal(signatures.size, 80);
});

test('sem perfil as sugestões continuam úteis e não inventam contexto', () => {
  const specs = buildOrbiSuggestionSpecs(null, null);
  assert.deepEqual(
    specs.map((item) => item.textKey),
    ['orbi.chat.prompt.organize', 'orbi.chat.prompt.symbols', 'orbi.chat.prompt.nextQuestion']
  );
});
