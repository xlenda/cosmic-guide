const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  COSMIC_CARD_SIZE,
  buildCosmicShareCardContent,
  cosmicCardStars,
  cosmicShareCardPack,
} = require('../lib/cosmicShareCardContent.js');

const ROOT = path.join(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(ROOT, ...parts), 'utf8');

test('card público usa contrato explícito e ignora dados privados extras', () => {
  const card = buildCosmicShareCardContent({
    brand: 'COSMIC GUIDE',
    edition: 'NOTA CELESTE',
    eyebrow: 'ALINHE SEU CÉU',
    glyph: '△',
    title: 'Um encontro no céu',
    subtitle: 'Resultado público',
    detail: 'Marte · trígono · Sol',
    meta: 'aplicativo · orbe 1,20°',
    footer: 'COSMIC GUIDE',
    shareText: 'Um encontro no céu',
    fileName: 'meu-card',
    birthDate: '1991-04-09',
    birthLocation: 'CIDADE-SECRETA',
    city: 'OUTRA-CIDADE-SECRETA',
    question: 'PERGUNTA-PRIVADA',
    reflection: 'REFLEXÃO-PRIVADA',
  });

  assert.deepEqual(Object.keys(card).sort(), [
    'brand', 'detail', 'edition', 'eyebrow', 'fileName', 'footer', 'glyph', 'meta',
    'shareText', 'subtitle', 'title',
  ]);
  const serialized = JSON.stringify(card);
  for (const secret of [
    '1991-04-09', 'CIDADE-SECRETA', 'OUTRA-CIDADE-SECRETA',
    'PERGUNTA-PRIVADA', 'REFLEXÃO-PRIVADA',
  ]) {
    assert.ok(!serialized.includes(secret), `${secret} vazou para o card`);
  }
});

test('PNG tem proporção vertical e constelação determinística sem ID de perfil', () => {
  assert.deepEqual(COSMIC_CARD_SIZE, { width: 1080, height: 1920 });
  const card = buildCosmicShareCardContent({ title: 'Vênus encontra a Lua', detail: 'trígono' });
  const first = cosmicCardStars(card, 24);
  const second = cosmicCardStars(card, 24);
  assert.deepEqual(first, second);
  assert.equal(first.length, 24);
  assert.ok(first.every((star) => star.x >= 5 && star.x <= 95));
  assert.ok(first.every((star) => star.y >= 4 && star.y <= 95));
});

test('PT, ES e EN mantêm o mesmo contrato e não prometem resultado', () => {
  const keys = Object.keys(cosmicShareCardPack('pt')).sort();
  for (const lang of ['pt', 'es', 'en']) {
    const pack = cosmicShareCardPack(lang);
    assert.deepEqual(Object.keys(pack).sort(), keys);
    const visible = Object.values(pack).filter((value) => typeof value === 'string').join(' ');
    assert.ok(!/garant(e|ir|iza)|cura|heal|sanar|manifest/i.test(visible));
    assert.ok(pack.privacyNote.length > 30);
    assert.ok(pack.mirrorPrivacyNote.length > 30);
    assert.ok(pack.tarotPrivacyNote.length > 30);
  }
});

test('integração nativa captura PNG e integração web compartilha ou baixa o canvas', () => {
  const nativeSource = read('lib', 'cosmicShareCard.native.js');
  const webSource = read('lib', 'cosmicShareCard.web.js');
  const componentSource = read('components', 'PremiumCosmicCard.js');
  const packageJson = JSON.parse(read('package.json'));

  assert.match(nativeSource, /captureRef\(cardRef/);
  assert.match(nativeSource, /Sharing\.isAvailableAsync\(\)/);
  assert.match(nativeSource, /mimeType: 'image\/png'/);
  assert.match(nativeSource, /width: COSMIC_CARD_SIZE\.width,/);
  assert.match(nativeSource, /height: COSMIC_CARD_SIZE\.height,/);
  assert.doesNotMatch(nativeSource, /PixelRatio/);
  assert.match(nativeSource, /`file:\/\/\$\{uri\}`/);
  assert.match(webSource, /document\.createElement\('canvas'\)/);
  assert.match(webSource, /canvas\.toBlob/);
  assert.match(webSource, /navigator\.share/);
  assert.match(webSource, /anchor\.download = `\$\{fileName\}\.png`/);
  assert.match(componentSource, /collapsable=\{false\}/);
  assert.equal(packageJson.dependencies['expo-sharing'], '~14.0.8');
  assert.equal(packageJson.dependencies['react-native-view-shot'], '4.0.3');
});

test('Alinhe seu céu monta o card só com campos públicos do encontro', () => {
  const screen = read('screens', 'SkyAlignmentScreen.js');
  const start = screen.indexOf('const shareCardContent = useMemo');
  const end = screen.indexOf('const handleShareCard', start);
  assert.ok(start >= 0 && end > start);
  const builder = screen.slice(start, end);

  assert.match(screen, /<PremiumCosmicCard/);
  assert.match(screen, /testID="sky-alignment-share-card-button"/);
  assert.match(builder, /buildCosmicShareCardContent/);
  assert.doesNotMatch(builder, /birthDate|birthLocation|dataUsed|question|reflection/);
  assert.doesNotMatch(builder, /video/i);
});

test('Espelho e Tarô geram PNG premium sem campos íntimos', () => {
  const album = read('screens', 'TarotAlbumScreen.js');
  const tarot = read('screens', 'TarotScreen.js');
  const mirrorStart = album.indexOf('const mirrorShareCardContent = useMemo');
  const mirrorEnd = album.indexOf('const filteredGroups', mirrorStart);
  const tarotStart = tarot.indexOf('const tarotShareCardContent = useMemo');
  const tarotEnd = tarot.indexOf('useEffect(() => {', tarotStart);
  assert.ok(mirrorStart >= 0 && mirrorEnd > mirrorStart);
  assert.ok(tarotStart >= 0 && tarotEnd > tarotStart);

  const mirrorBuilder = album.slice(mirrorStart, mirrorEnd);
  const tarotBuilder = tarot.slice(tarotStart, tarotEnd);
  assert.match(album, /testID="cosmic-mirror-premium-card"/);
  assert.match(album, /testID="cosmic-mirror-share"/);
  assert.match(tarot, /testID="tarot-premium-card"/);
  assert.match(tarot, /testID="tarot-premium-card-share"/);
  assert.match(mirrorBuilder, /buildCosmicShareCardContent/);
  assert.match(tarotBuilder, /buildCosmicShareCardContent/);
  assert.doesNotMatch(mirrorBuilder, /question|reflection|voiceTranscript|aiInsight/);
  assert.doesNotMatch(tarotBuilder, /readingQuestion|focusLabel|signLabel|reflection/);
  assert.doesNotMatch(`${mirrorBuilder}\n${tarotBuilder}`, /video/i);
});
