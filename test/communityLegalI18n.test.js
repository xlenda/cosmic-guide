const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const parser = require('@babel/parser');
const { LANGUAGES, _DICTS_FOR_TESTS } = require('../lib/i18n.js');

const ROOT = path.join(__dirname, '..');
const TERM_KEYS = [
  'terms.intro',
  'terms.service.title',
  'terms.service.body',
  'terms.account.title',
  'terms.account.body',
  'terms.payments.title',
  'terms.community.title',
  'terms.community.body',
  'terms.acceptable.title',
  'terms.acceptable.body',
  'terms.deletion.title',
  'terms.deletion.body',
  'terms.contact.title',
  'terms.contact.body',
];
const GUIDELINE_SECTIONS = [
  'before', 'respect', 'privacy', 'safety', 'integrity', 'symbolic',
  'reports', 'consequences', 'accountDeletion', 'contact',
];
const GUIDELINE_KEYS = [
  'community.guidelines.header',
  'community.guidelines.updated',
  'community.guidelines.intro',
  'community.guidelines.rules.title',
  'community.guidelines.moderation.title',
  'community.guidelines.contact.cta',
  ...GUIDELINE_SECTIONS.flatMap((section) => [
    `community.guidelines.${section}.title`,
    `community.guidelines.${section}.body`,
  ]),
];
const DATA_KEYS = [
  'privacy.use.social',
  'privacy.use.report',
  'privacy.contact.retention',
  'privacy.delete.message',
  'profile.delete.text',
  'profile.delete.finalText',
  'profile.delete.partialText',
];

test('Termos, Diretrizes e exclusão social têm copy completa em PT, ES e EN', () => {
  for (const key of [...TERM_KEYS, ...GUIDELINE_KEYS, ...DATA_KEYS]) {
    for (const lang of LANGUAGES) {
      const value = _DICTS_FOR_TESTS[lang][key];
      assert.equal(typeof value, 'string', `${lang}: ${key} não é string`);
      assert.notEqual(value.trim(), '', `${lang}: ${key} está vazia`);
    }
  }
});

const POLICY_SIGNALS = {
  pt: [
    ['respect.body', /assédio/i], ['privacy.body', /dados/i], ['safety.body', /menores/i],
    ['integrity.body', /spam/i], ['reports.body', /denunci/i], ['reports.body', /bloque/i],
    ['consequences.body', /remover/i], ['consequences.body', /suspender/i],
  ],
  es: [
    ['respect.body', /acoso/i], ['privacy.body', /datos/i], ['safety.body', /menores/i],
    ['integrity.body', /spam/i], ['reports.body', /report/i], ['reports.body', /bloque/i],
    ['consequences.body', /eliminar/i], ['consequences.body', /suspender/i],
  ],
  en: [
    ['respect.body', /harassment/i], ['privacy.body', /data/i], ['safety.body', /minors/i],
    ['integrity.body', /spam/i], ['reports.body', /report/i], ['reports.body', /block/i],
    ['consequences.body', /remove/i], ['consequences.body', /suspend/i],
  ],
};

test('as Diretrizes definem conteúdo proibido e ferramentas de moderação nos três idiomas', () => {
  for (const lang of LANGUAGES) {
    for (const [suffix, signal] of POLICY_SIGNALS[lang]) {
      const key = `community.guidelines.${suffix}`;
      assert.match(_DICTS_FOR_TESTS[lang][key], signal, `${lang}: ${key}`);
    }
  }
});

const DELETION_SIGNALS = {
  pt: [/publicações/i, /comentários/i, /bloqueios/i, /anonimizad/i, /fiscal/i, /sem vínculo/i],
  es: [/publicaciones/i, /comentarios/i, /bloqueos/i, /anonimizad/i, /fiscal/i, /sin vínculo/i],
  en: [/posts/i, /comments/i, /blocks/i, /anonymized/i, /tax/i, /no account link/i],
};

test('Privacidade descreve remoção do UGC, anonimização e retenção fiscal sem vínculo', () => {
  for (const lang of LANGUAGES) {
    const copy = [
      _DICTS_FOR_TESTS[lang]['privacy.use.social'],
      _DICTS_FOR_TESTS[lang]['privacy.use.report'],
      _DICTS_FOR_TESTS[lang]['privacy.contact.retention'],
    ].join(' ');
    for (const signal of DELETION_SIGNALS[lang]) assert.match(copy, signal, lang);
  }
});

function visibleHardcodes(file) {
  const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const ast = parser.parse(source, { sourceType: 'module', plugins: ['jsx'] });
  const found = [];

  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'JSXText' && /[\p{L}\p{N}]/u.test(node.value)) {
      found.push(`texto JSX: ${node.value.trim()}`);
    }
    if (node.type === 'JSXAttribute') {
      const name = node.name && node.name.name;
      if (['title', 'subtitle', 'placeholder', 'accessibilityLabel'].includes(name)
        && node.value && node.value.type === 'StringLiteral'
        && /[\p{L}\p{N}]/u.test(node.value.value)) {
        found.push(`${name}: ${node.value.value}`);
      }
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === 'object' && typeof value.type === 'string') walk(value);
    }
  }

  walk(ast);
  return found;
}

for (const file of ['screens/TermsScreen.js', 'screens/CommunityGuidelinesScreen.js']) {
  test(`${file} não contém chrome visível hardcoded`, () => {
    assert.deepEqual(visibleHardcodes(file), []);
  });
}
