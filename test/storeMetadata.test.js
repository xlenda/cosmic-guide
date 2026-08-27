const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  APP_STORE_LOCALE_BY_LISTING,
  STORE_LOCALES,
  listings,
  shared,
} = require('../play-store/metadata/store-listings');

const ROOT = path.resolve(__dirname, '..');
const bytes = (value) => Buffer.byteLength(value, 'utf8');
const normalize = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

test('ASO tem as tres localizacoes completas', () => {
  assert.deepEqual(STORE_LOCALES, ['pt-BR', 'es-419', 'en-US']);
  assert.deepEqual(Object.keys(listings), STORE_LOCALES);
  assert.deepEqual(APP_STORE_LOCALE_BY_LISTING, {
    'pt-BR': 'pt-BR',
    'es-419': 'es-MX',
    'en-US': 'en-US',
  });

  for (const locale of STORE_LOCALES) {
    const listing = listings[locale];
    assert.ok(listing.language);
    assert.equal(listing.screenshots.length, 8, `${locale}: screenshots`);
    assert.equal(listing.appStore.description, listing.googlePlay.fullDescription);
  }
});

test('Google Play respeita limites e politica de metadados', () => {
  const forbiddenPromoClaims = [
    /(?:^|\W)(?:melhor|best)(?:\W|$)/iu,
    /n[º°o.]?\s*1/iu,
    /100\s*%/u,
    /gr[áa]tis por tempo limitado/iu,
    /free for a limited time/iu,
    /baixe agora|descarga ahora|download now/iu,
  ];

  for (const locale of STORE_LOCALES) {
    const { title, shortDescription, fullDescription } = listings[locale].googlePlay;
    assert.ok(title.length <= 30, `${locale}: titulo com ${title.length}/30`);
    assert.ok(shortDescription.length <= 80, `${locale}: curta com ${shortDescription.length}/80`);
    assert.ok(fullDescription.length <= 4000, `${locale}: completa com ${fullDescription.length}/4000`);
    assert.ok(fullDescription.length >= 1200, `${locale}: descricao completa curta demais`);
    assert.doesNotMatch(title, /[\n\r]|[!]{2,}|[★☆]/u, `${locale}: titulo promocional`);
    assert.doesNotMatch(shortDescription, /[\n\r]/u, `${locale}: quebra na descricao curta`);
    for (const pattern of forbiddenPromoClaims) {
      assert.doesNotMatch(`${title}\n${shortDescription}`, pattern, `${locale}: claim promocional proibido`);
    }
  }
});

test('App Store respeita limites, bytes e nao repete keywords visiveis', () => {
  for (const locale of STORE_LOCALES) {
    const listing = listings[locale];
    const { name, subtitle, promotionalText, keywords, description } = listing.appStore;

    assert.ok(name.length >= 2 && name.length <= 30, `${locale}: name ${name.length}/30`);
    assert.ok(subtitle.length <= 30, `${locale}: subtitle ${subtitle.length}/30`);
    assert.ok(promotionalText.length <= 170, `${locale}: promotional ${promotionalText.length}/170`);
    assert.ok(bytes(keywords) >= 95 && bytes(keywords) <= 100, `${locale}: keywords ${bytes(keywords)}/100 bytes`);
    assert.ok(description.length <= 4000, `${locale}: description ${description.length}/4000`);
    assert.doesNotMatch(keywords, /,\s/u, `${locale}: espaco depois de virgula`);

    const visible = new Set(normalize(`${name} ${subtitle} ${shared.appStorePrimaryCategory}`)
      .split(/[^a-z0-9]+/u)
      .filter(Boolean));
    for (const keyword of keywords.split(',')) {
      assert.ok(keyword.trim(), `${locale}: keyword vazia`);
      const normalizedKeyword = normalize(keyword);
      assert.ok(!visible.has(normalizedKeyword), `${locale}: keyword repetida: ${keyword}`);
    }
  }
});

test('copy do Tarot promete exatamente os cinco temas que existem', () => {
  const tarotSource = fs.readFileSync(path.join(ROOT, 'screens', 'TarotScreen.js'), 'utf8');
  for (const theme of ['Amor', 'Carreira', 'Dinheiro', 'Energia', 'Saúde']) {
    assert.match(tarotSource, new RegExp(`key: '${theme}'`), `tema ausente no app: ${theme}`);
  }

  const localizedThemes = {
    'pt-BR': ['Amor', 'Carreira', 'Dinheiro', 'Energia', 'Saúde'],
    'es-419': ['Amor', 'Carrera', 'Dinero', 'Energía', 'Bienestar'],
    'en-US': ['Love', 'Career', 'Money', 'Energy', 'Well-being'],
  };
  for (const locale of STORE_LOCALES) {
    const description = listings[locale].googlePlay.fullDescription;
    for (const theme of localizedThemes[locale]) {
      assert.match(description, new RegExp(theme, 'u'), `${locale}: tema não anunciado: ${theme}`);
    }
  }
});

test('descrições não transformam o wallpaper estático em live wallpaper', () => {
  for (const locale of STORE_LOCALES) {
    assert.doesNotMatch(listings[locale].googlePlay.fullDescription, /live[- ]sky|live wallpaper/iu);
  }
});

test('screenshots tem uma cena real, texto localizado e alt text curto', () => {
  const expectedScenes = [
    'alignment-stage',
    'alignment-receipt',
    'tarot-scratch',
    'tarot-album',
    'birth-chart',
    'compatibility',
    'horoscope',
    'explore',
  ];

  for (const locale of STORE_LOCALES) {
    const shots = listings[locale].screenshots;
    assert.deepEqual(shots.map((shot) => shot.scene), expectedScenes, `${locale}: sequencia`);
    for (const shot of shots) {
      assert.ok(shot.eyebrow.length <= 36, `${locale}/${shot.slug}: eyebrow`);
      assert.ok(shot.headline.length <= 48, `${locale}/${shot.slug}: headline`);
      assert.ok(shot.altText.length <= 140, `${locale}/${shot.slug}: alt text`);
      assert.doesNotMatch(`${shot.eyebrow} ${shot.headline}`, /premium|gr[áa]tis|free/iu);
    }
  }
});

test('claims visuais principais continuam ancorados no codigo publicado', () => {
  const evidence = [
    ['screens/SkyAlignmentScreen.js', 'sky-alignment-receipt-orb'],
    ['screens/SkyAlignmentScreen.js', 'sky-alignment-receipt-source'],
    ['screens/TarotScreen.js', 'tarot-scratch-'],
    ['screens/TarotAlbumScreen.js', 'album-search'],
    ['screens/BirthChartScreen.js', 'birthchart-editar'],
    ['screens/CompatibilityScreen.js', 'compat-eco-caminho'],
    ['screens/HoroscopeScreen.js', 'horoscope-reading'],
    ['screens/DiaryScreen.js', 'Diário'],
  ];

  for (const [relative, marker] of evidence) {
    const source = fs.readFileSync(path.join(ROOT, relative), 'utf8');
    assert.match(source, new RegExp(marker), `${relative}: evidencia ${marker}`);
  }
});

test('URLs publicas nao usam placeholder e suporte permanece bloqueado com honestidade', () => {
  assert.equal(shared.appId, 'cloud.cosmicguide.app');
  assert.match(shared.privacyPolicyUrl, /^https:\/\/cosmicguide\.cloud\//u);
  assert.match(shared.accountDeletionUrl, /^https:\/\/cosmicguide\.cloud\//u);
  assert.doesNotMatch(`${shared.privacyPolicyUrl} ${shared.accountDeletionUrl}`, /preencher|todo|placeholder/iu);
  assert.equal(shared.supportUrl, null);
});
