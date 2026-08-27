const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SCREEN = fs.readFileSync(path.join(ROOT, 'screens', 'SkyAlignmentScreen.js'), 'utf8');
const STAGE = fs.readFileSync(path.join(ROOT, 'components', 'SkyAlignmentStage.js'), 'utf8');
const PACKAGE = require('../package.json');

test('a tela só revela o motor puro e fixa um instante UTC uma vez por foco', () => {
  assert.match(SCREEN, /import \{ buildSkyAlignment \} from '\.\.\/lib\/skyAlignment'/);
  assert.match(SCREEN, /import \{ getAnyBirthData \} from '\.\.\/lib\/birthData'/);
  assert.match(SCREEN, /const instantISO = new Date\(\)\.toISOString\(\)/);
  assert.match(SCREEN, /buildSkyAlignment\(\{ birth, instantISO, lang \}\)/);
  assert.doesNotMatch(SCREEN, /planetPositions|fasesDoCeuPessoal|personalSkyToday/);
  assert.match(SCREEN, /AppState\.addEventListener\('change'/);
  assert.match(SCREEN, /currentMinute !== calculatedMinuteRef\.current/);
});

test('aspecto, ausência real e indisponibilidade têm caminhos distintos', () => {
  assert.match(SCREEN, /result\?\.status === 'aspect'/);
  assert.match(SCREEN, /result\?\.status === 'next_event'/);
  assert.match(SCREEN, /result\?\.status === 'needs_birth'/);
  assert.match(SCREEN, /result\?\.status === 'unavailable'/);
  assert.match(SCREEN, /alignment\.noAspect\.body/);
  assert.match(SCREEN, /ROUTES\.CALENDARIO_COSMICO/);
  assert.match(SCREEN, /ROUTES\.BIRTH_CHART/);
});

test('o Recibo Cósmico mostra dado, cálculo, aspecto, orbe, fonte e limite', () => {
  for (const id of ['data', 'calculation', 'aspect', 'orb', 'source', 'limit']) {
    assert.match(SCREEN, new RegExp(`testID="sky-alignment-receipt-${id}"`), id);
  }
  assert.match(SCREEN, /encounter\.orbDegrees/);
  assert.match(SCREEN, /encounter\.orbLimitDegrees/);
  assert.match(SCREEN, /receipt\?\.calculationEngine/);
  assert.match(SCREEN, /receipt\.sources\.filter\(Boolean\)/);
  assert.match(SCREEN, /receipt\?\.limits\?\.orbConvention/);
  assert.match(SCREEN, /testID="sky-alignment-source-toggle"/);
  assert.match(SCREEN, /testID="sky-alignment-source-details"/);
  assert.match(SCREEN, /alignment\.receipt\.warningDateOnly/);
  assert.match(SCREEN, /alignment\.receipt\.warningFixedOffset/);
});

test('o palco usa gesto na UI thread sem bloquear a rolagem vertical', () => {
  assert.equal(PACKAGE.dependencies['react-native-reanimated'], '~4.1.1');
  assert.equal(PACKAGE.dependencies['react-native-worklets'], '^0.5.1');
  assert.match(STAGE, /GestureDetector/);
  assert.match(STAGE, /touchAction="pan-y"/);
  assert.match(STAGE, /\.activeOffsetX\(\[-6, 6\]\)/);
  assert.match(STAGE, /\.failOffsetY\(\[-12, 12\]\)/);
  assert.doesNotMatch(STAGE, /PanResponder/);
});

test('o fim do gesto usa a posição do evento final, sem corrida com derived value', () => {
  assert.match(STAGE, /\.onEnd\(\(event\) =>/);
  assert.match(STAGE, /gestureStartX\.get\(\) \+ event\.translationX/);
  assert.match(STAGE, /const finalProgress = travel > 0/);
  assert.doesNotMatch(STAGE, /const isInMagneticZone = progress\.get\(\)/);
});

test('o encaixe tem três marcos táteis, fallback e caminho de acessibilidade', () => {
  for (const stage of ['pickup', 'magnetic', 'aligned']) {
    assert.match(STAGE, new RegExp(`emitHaptic\\)\\('${stage}'\\)|emitHaptic\\('${stage}'\\)`), stage);
  }
  assert.match(STAGE, /testID=\{`\$\{testID\}-fallback`\}/);
  assert.match(STAGE, /onAccessibilityAction/);
  assert.match(STAGE, /accessibilityLiveRegion="polite"/);
  assert.match(STAGE, /const nativeDiskIsActionable = Platform\.OS !== 'web' && !disabled && !isAligned/);
  assert.match(STAGE, /statusIdle/);
  assert.match(STAGE, /useReducedMotion/);
  assert.match(STAGE, /duration: reducedMotion \? 0/);
});

test('os discos são desenhados com as posições calculadas, sem sorteio visual', () => {
  assert.match(SCREEN, /longitude: position\.longitude/);
  assert.match(STAGE, /positionAngle\(item\)/);
  assert.match(STAGE, /Array\.from\(\{ length: 12 \}/);
  assert.doesNotMatch(SCREEN, /Math\.random/);
  assert.doesNotMatch(STAGE, /Math\.random/);
});
