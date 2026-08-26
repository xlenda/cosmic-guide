const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { ROUTES } = require('../routes.js');
const { _DICTS_FOR_TESTS } = require('../lib/i18n.js');

const ROOT = path.join(__dirname, '..');
const APP = fs.readFileSync(path.join(ROOT, 'App.js'), 'utf8');
const HOME = fs.readFileSync(path.join(ROOT, 'screens', 'HomeScreen.js'), 'utf8');

test('Alinhe seu céu tem rota própria, lazy e registrada somente na pilha da Home', () => {
  assert.equal(ROUTES.SKY_ALIGNMENT, 'SkyAlignment');
  assert.equal(
    Object.values(ROUTES).filter((value) => value === ROUTES.SKY_ALIGNMENT).length,
    1,
    'o identificador interno não pode colidir com outra rota'
  );

  assert.match(
    APP,
    /const SkyAlignmentScreen = lazy\(\(\) => import\('\.\/screens\/SkyAlignmentScreen'\)\)/
  );
  assert.match(
    APP,
    /<Stack\.Screen name=\{ROUTES\.SKY_ALIGNMENT\} component=\{SkyAlignmentScreen\} \/>/
  );
  assert.doesNotMatch(
    APP,
    /<Tab\.Screen[\s\S]{0,160}name=\{ROUTES\.SKY_ALIGNMENT\}/,
    'o gesto não deve virar uma quinta aba'
  );
});

test('a rota tem URL canônica e fica livre da oferta flutuante sobre o gesto', () => {
  assert.match(
    APP,
    /\[ROUTES\.HOME_TAB\]: \{\s*\/\/[\s\S]{0,240}path: Platform\.OS === 'web' \? 'cosmic-guide' : ''/
  );
  assert.match(APP, /\[ROUTES\.SKY_ALIGNMENT\]: 'alinhe-seu-ceu'/);
  const inicioPill = APP.indexOf('const ROTAS_SEM_PILL');
  const fimPill = APP.indexOf(']);', inicioPill);
  assert.ok(inicioPill >= 0 && fimPill > inicioPill);
  assert.match(APP.slice(inicioPill, fimPill), /ROUTES\.SKY_ALIGNMENT/);
});

test('a entrada é editorial, sempre visível e não recolhe a Home', () => {
  assert.doesNotMatch(
    HOME,
    /\{!showFirstPath && \(\s*<Pressable[\s\S]{0,300}testID="home-sky-alignment"/,
    'o gatilho não pode desaparecer para a pessoa nova'
  );
  assert.match(HOME, /testID="home-sky-alignment"/);
  assert.match(HOME, /navigation\.navigate\(ROUTES\.SKY_ALIGNMENT\)/);
  assert.doesNotMatch(HOME, /exploreOpen|setExploreOpen/);

  const persistentPath = HOME.indexOf('{showPersistentPath && (');
  const alignment = HOME.indexOf('testID="home-sky-alignment"');
  const orbi = HOME.indexOf('testID="home-orbi-chat"');
  const explore = HOME.indexOf('testID="home-explore-toggle"');
  assert.ok(persistentPath >= 0 && persistentPath < alignment, 'a trilha personalizada deve vir antes');
  assert.ok(alignment < explore, 'a entrada de alinhamento deve vir antes de Explorar');
  assert.ok(explore < orbi, 'Órbi deve ficar fora da primeira dobra, depois da porta de Explorar');
});

test('a porta do alinhamento usa somente texto traduzido e as quatro copies existem em PT/ES/EN', () => {
  const keys = [
    'home.alignment.title',
    'home.alignment.instruction',
    'home.alignment.body',
    'home.alignment.cta',
  ];
  for (const key of keys) {
    assert.ok(HOME.includes(`t('${key}')`), `a Home não usa ${key}`);
    for (const lang of ['pt', 'es', 'en']) {
      assert.equal(typeof _DICTS_FOR_TESTS[lang][key], 'string', `${lang}/${key}`);
      assert.ok(_DICTS_FOR_TESTS[lang][key].trim().length > 0, `${lang}/${key} vazio`);
    }
  }

  assert.equal(_DICTS_FOR_TESTS.pt['home.alignment.title'], 'Alinhe seu céu');
  assert.equal(
    _DICTS_FOR_TESTS.pt['home.alignment.instruction'],
    'Arraste o céu de agora sobre o seu mapa.'
  );
  assert.equal(
    _DICTS_FOR_TESTS.pt['home.alignment.body'],
    'Um dado seu. Um gesto. Um encontro calculado — com a conta na tela.'
  );
  assert.equal(_DICTS_FOR_TESTS.pt['home.alignment.cta'], 'Entrar no alinhamento');
});

test('todo o chrome da experiência nasce completo e com paridade nos três idiomas', () => {
  const keys = [
    'alignment.header.title', 'alignment.header.subtitle',
    'alignment.eyebrow', 'alignment.title', 'alignment.body', 'alignment.signature',
    'alignment.differentiation',
    'alignment.disk.natal', 'alignment.disk.current',
    'alignment.instruction', 'alignment.manual', 'alignment.aligned',
    'alignment.status.idle', 'alignment.status.dragging', 'alignment.status.magnetic',
    'alignment.dragA11y', 'alignment.dragHint', 'alignment.live', 'alignment.loading',
    'alignment.missing.title', 'alignment.missing.body', 'alignment.missing.cta',
    'alignment.error.title', 'alignment.error.body', 'alignment.error.retry',
    'alignment.result.eyebrow',
    'alignment.noAspect.title', 'alignment.noAspect.body',
    'alignment.nextEvent.eyebrow', 'alignment.nextEvent.date',
    'alignment.receipt.title', 'alignment.receipt.data', 'alignment.receipt.calculation',
    'alignment.receipt.aspect', 'alignment.receipt.orb', 'alignment.receipt.source',
    'alignment.receipt.limit', 'alignment.receipt.dataExact',
    'alignment.receipt.dataFixedOffset', 'alignment.receipt.dataDateOnly',
    'alignment.receipt.calculationValue',
    'alignment.receipt.eventCalculationValue', 'alignment.receipt.orbValue',
    'alignment.receipt.sourceValue', 'alignment.receipt.limitValue',
    'alignment.receipt.orbConventionShort', 'alignment.receipt.sourcesShow',
    'alignment.receipt.sourcesHide',
    'alignment.receipt.warningDateOnly', 'alignment.receipt.warningFixedOffset',
    'alignment.receipt.warningNoLocation',
    'alignment.action.diary', 'alignment.action.calendar', 'alignment.action.map',
  ];

  for (const key of keys) {
    for (const lang of ['pt', 'es', 'en']) {
      const value = _DICTS_FOR_TESTS[lang][key];
      assert.equal(typeof value, 'string', `${lang}/${key} ausente`);
      assert.ok(value.trim().length > 0, `${lang}/${key} vazio`);
      assert.notEqual(value, key, `${lang}/${key} caiu na própria chave`);
    }
  }

  assert.match(_DICTS_FOR_TESTS.pt['alignment.receipt.limitValue'], /não leu energia/i);
  assert.match(_DICTS_FOR_TESTS.es['alignment.receipt.limitValue'], /no leyó energía/i);
  assert.match(_DICTS_FOR_TESTS.en['alignment.receipt.limitValue'], /did not read energy/i);
});
