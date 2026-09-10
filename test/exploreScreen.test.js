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
const { _DICTS_FOR_TESTS } = require('../lib/i18n.js');

test('Explorar é uma rota lazy, permanente e com URL canônica', () => {
  assert.match(APP, /const ExploreScreen = lazy\(\(\) => import\('\.\/screens\/ExploreScreen'\)\)/);
  assert.match(APP, /\[ROUTES\.EXPLORE\]: 'explorar'/);
  assert.match(APP, /<Stack\.Screen name=\{ROUTES\.EXPLORE\} component=\{ExploreScreen\} \/>/);
  assert.match(HOME, /onPress=\{\(\) => navigation\.navigate\(ROUTES\.EXPLORE\)\}/);
  assert.match(APP, /deep\) navigation\.navigate\(ROUTES\.HOME_TAB, \{ screen: ROUTES\.HOME_MAIN \}\)/);
});

// A ORDEM MUDOU EM 10/09/2026 e este teste mudou junto. O catálogo voltou pra
// Home e subiu pro começo; Alinhe seu Céu e a porta do Explorar desceram pro
// fim do rolo (pedido do dono). O que o teste protege continua sendo o mesmo:
// que os cinco blocos EXISTAM e que a ordem seja a decidida — só que agora a
// ordem decidida é outra. Travar a ordem antiga seria travar uma tela que já
// não é a que está no ar.
test('a primeira dobra preserva o caminho personalizado e as portas permanentes', () => {
  assert.doesNotMatch(HOME, /personalizedItems|forYouSecondaryRow/);
  const primary = HOME.indexOf('testID="home-first-path"');
  const catalogo = HOME.indexOf("t('home.sectionExplore')");
  const daily = HOME.indexOf('testID="home-today-line"');
  const orbi = HOME.indexOf('testID="home-orbi-chat"');
  const alignment = HOME.indexOf('testID="home-sky-alignment"');
  const explore = HOME.indexOf('testID="home-explore-toggle"');

  // todos continuam existindo
  for (const [nome, i] of [['first-path', primary], ['catálogo', catalogo], ['today-line', daily],
    ['orbi', orbi], ['sky-alignment', alignment], ['explore-toggle', explore]]) {
    assert.ok(i >= 0, `${nome} sumiu da Home`);
  }

  // o catálogo abre a Home, logo depois do caminho personalizado
  assert.ok(primary < catalogo, 'o caminho personalizado vem antes do catálogo');
  assert.ok(catalogo < daily, 'o catálogo vem antes da linha de hoje');
  assert.ok(daily < orbi, 'Órbi fica depois da linha de hoje');
  // e as duas portas fecham o rolo
  assert.ok(orbi < alignment, 'Alinhe seu Céu desceu pro epílogo, depois do Órbi');
  assert.ok(alignment < explore, 'a porta do Explorar é a última');
});

test('a biblioteca preserva todas as entradas do catálogo com destinos reais', () => {
  // 'profeccoes' saiu da vitrine em 10/09/2026 (pedido do dono). A rota e a
  // tela seguem vivas — o que este teste vigia é o CATÁLOGO, e ela não está
  // mais nele. Se voltar, volta aqui junto.
  // As SEIS de casal viraram DUAS em 10/09/2026 (pedido do dono): agir,
  // reconectar, descobrir, progresso, retrospectiva e timeline saíram da
  // vitrine e viraram abas dentro de 'nosHoje' e 'nossaHistoria'. As rotas
  // continuam registradas em App.js — o que este teste vigia é o CATÁLOGO.
  const expected = [
    'birthchart', 'calendario', 'coffee', 'comovoceta', 'compatibility',
    'diary', 'dream', 'grounding', 'horoscope', 'idadereal', 'jornada',
    'lunarCalendar', 'mitos', 'nosHoje', 'nossaHistoria', 'palm', 'quizcosmico',
    'retrolua', 'rituais', 'social', 'tarot', 'wallpaper', 'zodiacbody',
  ];
  const found = [...EXPLORE.matchAll(/item\('([^']+)'/g)].map((match) => match[1]).sort();
  assert.deepEqual(found, expected.sort());
  assert.match(EXPLORE, /key: 'alignment'[\s\S]*?destination: ROUTES\.SKY_ALIGNMENT/);

  const descriptors = [...EXPLORE.matchAll(/item\('[^']+'[^\n]+ROUTES\.[A-Z_]+/g)];
  assert.equal(descriptors.length, expected.length, 'alguma entrada perdeu seu destino ROUTES');
  assert.match(EXPLORE, /navigation\.navigate\(experience\.destination, experience\.params\)/);
  assert.match(EXPLORE, /navigation\.getParent\(\)\?\.navigate\(tab, params\)/);
});

test('cada experiência explica o que a pessoa encontrará em PT, ES e EN', () => {
  const keys = [
    'horoscope', 'comovoceta', 'birthchart', 'tarot', 'compatibility', 'dream',
    // 'profeccoes' fora desde 10/09/2026: saiu da vitrine, então não há mais
    // linha de catálogo cuja descrição precise existir nos três idiomas. As
    // chaves de tradução seguem em lib/i18n.js, intactas, esperando um retorno.
    'palm', 'coffee', 'alignment', 'grounding', 'rituais',
    'jornada', 'diary', 'lunarCalendar', 'calendario', 'zodiacbody', 'retrolua',
    // 'timeline' saiu daqui em 10/09/2026: virou a primeira aba de
    // 'nossaHistoria'. A chave de tradução dela continua em lib/i18n.js.
    'mitos', 'quizcosmico', 'wallpaper', 'idadereal', 'social',
    // As seis de casal viraram duas portas em 10/09/2026. São elas que agora
    // precisam de descrição nos três idiomas — e a descrição de cada uma
    // NOMEIA as três telas que reúne, pra ninguém achar que algo sumiu.
    'nosHoje', 'nossaHistoria',
  ];

  for (const key of keys) {
    const descriptionKey = `explore.item.${key}.description`;
    assert.ok(EXPLORE.includes(`'${descriptionKey}'`), `${key} não usa a descrição detalhada`);
    assert.equal(I18N.split(`'${descriptionKey}'`).length - 1, 3, `${descriptionKey} precisa existir em PT/ES/EN`);
    for (const lang of ['pt', 'es', 'en']) {
      const description = _DICTS_FOR_TESTS[lang][descriptionKey];
      assert.equal(typeof description, 'string', `${lang}/${descriptionKey} ausente`);
      assert.ok(description.trim().length >= 40, `${lang}/${descriptionKey} continua curto demais`);
      assert.ok(description.trim().length <= 125, `${lang}/${descriptionKey} ficou longo demais para o catálogo`);
    }
  }

  assert.doesNotMatch(
    EXPLORE,
    /item\('[^']+', 'home\.card\.[^']+\.title', 'home\.card\.[^']+\.subtitle'/,
    'o catálogo não deve voltar aos slogans curtos da Home'
  );

  assert.equal(I18N.split("'explore.item.palm.title'").length - 1, 3);
  assert.match(EXPLORE, /item\('palm', 'explore\.item\.palm\.title'/);
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

test('a porta principal de Explorar tem chamada própria nos três idiomas', () => {
  assert.match(HOME, /<LinearGradient[\s\S]*?style=\{styles\.explorePortalInner\}/);
  assert.match(HOME, /t\('home\.explore\.cta'\)/);
  assert.match(HOME, /onFocus=\{\(\) => setExploreFocused\(true\)\}/);
  assert.match(HOME, /exploreFocused && styles\.keyboardFocus/);
  assert.equal(I18N.split("'home.explore.cta'").length - 1, 3);
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
