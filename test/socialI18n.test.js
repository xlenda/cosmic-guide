const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { translate, LANGUAGES, _DICTS_FOR_TESTS } = require('../lib/i18n.js');
const { formatSocialTimeAgo } = require('../lib/socialTime.js');

const REQUIRED_KEYS = [
  'tab.community',
  'social.header.title',
  'social.header.subtitle',
  'social.createProfile.displayNamePlaceholder',
  'social.createProfile.usernamePlaceholder',
  'social.createProfile.required',
  'social.profile.close',
  'social.profile.followers_one',
  'social.profile.followers_other',
  'social.profile.following',
  'social.profile.noShared',
  'social.profile.followToSee',
  'social.unfollow',
  'social.like',
  'social.unlike',
  'social.comments.open',
  'social.comments.close',
  'social.comments.placeholder',
  'social.comments.send',
  'social.search.open',
  'social.search.placeholder',
  'social.empty.body',
  'social.delete.title',
  'social.delete.body',
  'social.delete.cta',
  'social.error.title',
  'social.error.profileSave',
  'social.error.follow',
  'social.error.comment',
  'social.error.deletePost',
  'social.time.justNow',
  'social.time.minutes',
  'social.time.hours',
  'social.time.days',
  ...['plaza', 'mirrors', 'bridges', 'sparks', 'poles', 'between']
    .flatMap((room) => [`community.room.${room}.title`, `community.room.${room}.desc`]),
  ...['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']
    .map((sign) => `community.sign.${sign}`),
  ...['copresenca', 'alheio30', 'sextil', 'quadratura', 'trigono', 'alheio150', 'oposicao']
    .map((relation) => `community.relation.${relation}`),
];

test('a superfície social possui traduções não vazias em PT, ES e EN', () => {
  for (const key of REQUIRED_KEYS) {
    for (const lang of LANGUAGES) {
      const value = _DICTS_FOR_TESTS[lang][key];
      assert.equal(typeof value, 'string', `${lang}: ${key} não é string`);
      assert.notEqual(value.trim(), '', `${lang}: ${key} está vazia`);
    }
  }

  assert.equal(translate('pt', 'tab.community'), 'Comunidade');
  assert.equal(translate('es', 'tab.community'), 'Comunidad');
  assert.equal(translate('en', 'tab.community'), 'Community');
});

test('nomes e descrições das salas não prometem compatibilidade ou destino', () => {
  const roomKeys = REQUIRED_KEYS.filter((key) => key.startsWith('community.room.'));
  for (const lang of LANGUAGES) {
    const copy = roomKeys.map((key) => _DICTS_FOR_TESTS[lang][key]).join(' ');
    assert.doesNotMatch(copy, /compatib|porcent|percent|score|match|destin|destiny|garant/i, lang);
  }
});

test('tempo relativo social escolhe a unidade traduzível correta', () => {
  const now = Date.UTC(2026, 7, 24, 12, 0, 0);
  const t = (key, vars = {}) => `${key}:${vars.count ?? ''}`;

  assert.equal(formatSocialTimeAgo(new Date(now - 30_000).toISOString(), t, now), 'social.time.justNow:');
  assert.equal(formatSocialTimeAgo(new Date(now - 5 * 60_000).toISOString(), t, now), 'social.time.minutes:5');
  assert.equal(formatSocialTimeAgo(new Date(now - 3 * 60 * 60_000).toISOString(), t, now), 'social.time.hours:3');
  assert.equal(formatSocialTimeAgo(new Date(now - 2 * 24 * 60 * 60_000).toISOString(), t, now), 'social.time.days:2');
  assert.equal(formatSocialTimeAgo('data-inválida', t, now), 'social.time.justNow:');
  assert.equal(formatSocialTimeAgo(new Date(now + 60_000).toISOString(), t, now), 'social.time.justNow:');
});

test('SocialScreen não mantém chrome visível em literais de um único idioma', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'screens', 'SocialScreen.js'), 'utf8');

  assert.doesNotMatch(source, /\bplaceholder\s*=\s*["']/);
  assert.doesNotMatch(source, /<GradientHeader[^>]+(?:title|subtitle)=["']/);
  assert.doesNotMatch(source, /Alert\.alert\(\s*["']/);
  assert.doesNotMatch(source, /setError\(\s*["']/);

  for (const oldLiteral of [
    'seguidores',
    'seguindo',
    'Deixar de seguir',
    'Nenhuma leitura compartilhada ainda.',
    'Siga essa pessoa pra ver as leituras compartilhadas.',
    'Seu feed está vazio',
    'Entre em contato com outros leitores',
  ]) {
    assert.equal(source.includes(oldLiteral), false, `literal visível ainda presente: ${oldLiteral}`);
  }
});
