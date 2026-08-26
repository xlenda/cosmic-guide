const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const APP = fs.readFileSync(path.join(ROOT, 'App.js'), 'utf8');
const HOME = fs.readFileSync(path.join(ROOT, 'screens', 'HomeScreen.js'), 'utf8');
const EXPLORE = fs.readFileSync(path.join(ROOT, 'screens', 'ExploreScreen.js'), 'utf8');
const FEATURE_GATE = fs.readFileSync(path.join(ROOT, 'components', 'FeatureGate.js'), 'utf8');
const I18N = fs.readFileSync(path.join(ROOT, 'lib', 'i18n.js'), 'utf8');

test('Explorar é uma rota lazy, permanente e com URL canônica', () => {
  assert.match(APP, /const ExploreScreen = lazy\(\(\) => import\('\.\/screens\/ExploreScreen'\)\)/);
  assert.match(APP, /\[ROUTES\.EXPLORE\]: 'explorar'/);
  assert.match(APP, /<Stack\.Screen name=\{ROUTES\.EXPLORE\} component=\{ExploreScreen\} \/>/);
  assert.match(HOME, /onPress=\{\(\) => navigation\.navigate\(ROUTES\.EXPLORE\)\}/);
  assert.match(APP, /deep\) navigation\.navigate\(ROUTES\.HOME_TAB, \{ screen: ROUTES\.HOME_MAIN \}\)/);
});

test('a primeira dobra preserva uma ação dominante e só duas portas secundárias', () => {
  assert.doesNotMatch(HOME, /personalizedItems|forYouSecondaryRow/);
  const primary = HOME.indexOf('testID="home-first-path"');
  const alignment = HOME.indexOf('testID="home-sky-alignment"');
  const explore = HOME.indexOf('testID="home-explore-toggle"');
  const daily = HOME.indexOf('testID="home-today-line"');
  const orbi = HOME.indexOf('testID="home-orbi-chat"');
  assert.ok(primary >= 0 && primary < alignment);
  assert.ok(alignment < explore);
  assert.ok(explore < daily);
  assert.ok(daily < orbi, 'Órbi deve ficar depois do bloco diário, fora da primeira dobra');
});

test('a biblioteca preserva todas as entradas do catálogo com destinos reais', () => {
  const expected = [
    'agir', 'birthchart', 'calendario', 'coffee', 'comovoceta', 'compatibility',
    'descobrir', 'diary', 'dream', 'grounding', 'horoscope', 'idadereal', 'jornada',
    'lunarCalendar', 'mitos', 'palm', 'profeccoes', 'progresso', 'quizcosmico',
    'reconectar', 'retrolua', 'retrospectiva', 'rituais', 'social', 'tarot',
    'timeline', 'wallpaper', 'zodiacbody',
  ];
  const found = [...EXPLORE.matchAll(/item\('([^']+)'/g)].map((match) => match[1]).sort();
  assert.deepEqual(found, expected.sort());
  assert.match(EXPLORE, /key: 'alignment'[\s\S]*?destination: ROUTES\.SKY_ALIGNMENT/);

  const descriptors = [...EXPLORE.matchAll(/item\('[^']+'[^\n]+ROUTES\.[A-Z_]+/g)];
  assert.equal(descriptors.length, expected.length, 'alguma entrada perdeu seu destino ROUTES');
  assert.match(EXPLORE, /navigation\.navigate\(experience\.destination, experience\.params\)/);
  assert.match(EXPLORE, /navigation\.getParent\(\)\?\.navigate\(tab, params\)/);
});

test('Explorar usa lista virtualizada, Pressable, safe area e não adiciona movimento obrigatório', () => {
  assert.match(EXPLORE, /useSafeAreaInsets\(\)/);
  assert.match(EXPLORE, /<SectionList/);
  assert.match(EXPLORE, /initialNumToRender=\{10\}/);
  assert.match(EXPLORE, /paddingTop: insets\.top \+ 10/);
  assert.match(EXPLORE, /paddingBottom: insets\.bottom \+ 112/);
  assert.match(EXPLORE, /<Pressable/);
  assert.doesNotMatch(EXPLORE, /TouchableOpacity|Animated\.|withTiming|withSpring/);
});

test('Timeline declara o mesmo bloqueio que a rota realmente aplica', () => {
  assert.match(EXPLORE, /COUPLE_LOCKED_KEYS[\s\S]*?'timeline'/);
  assert.match(APP, /const TimelineGated = withFeatureGate/);
});

test('copy de Explorar descreve a mudança sem prometer que o catálogo ficou na Home', () => {
  assert.doesNotMatch(I18N, /Nada some da sua Home|Nada desaparece de tu inicio|Nothing disappears from Home/i);
  assert.match(I18N, /o catálogo completo mora em Explorar/);
  assert.match(I18N, /the full library lives in Explore/);
});

test('os seis gates de casal resolvem título e descrição no idioma atual', () => {
  for (const feature of ['timeline', 'reconnect', 'discover', 'act', 'progress', 'recap']) {
    for (const field of ['title', 'description']) {
      const key = `gate.${feature}.${field}`;
      assert.equal(I18N.split(`'${key}'`).length - 1, 3, `${key} precisa existir em PT/ES/EN`);
      assert.ok(APP.includes(`${field}Key: '${key}'`));
    }
  }
  assert.match(FEATURE_GATE, /options\.titleKey \? t\(options\.titleKey\)/);
  assert.match(FEATURE_GATE, /options\.descriptionKey \? t\(options\.descriptionKey\)/);
});

test('todo o chrome de Explorar existe em PT, ES e EN', () => {
  const keys = [
    'explore.back', 'explore.topLabel', 'explore.eyebrow', 'explore.title',
    'explore.body', 'explore.locked',
    'explore.section.readings.title', 'explore.section.practices.title',
    'explore.section.sky.title', 'explore.section.discoveries.title',
    'explore.section.couple.title',
  ];
  for (const key of keys) {
    const occurrences = I18N.split(`'${key}'`).length - 1;
    assert.equal(occurrences, 3, `${key} precisa existir uma vez em cada idioma`);
    assert.ok(EXPLORE.includes(`t('${key}')`) || ['explore.locked'].includes(key));
  }
});
