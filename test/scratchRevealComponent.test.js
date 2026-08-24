const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(
  path.join(__dirname, '..', 'components', 'ScratchRevealCard.js'),
  'utf8',
);

test('raspagem usa gesto nativo com um ponteiro e nao volta ao PanResponder', () => {
  assert.match(source, /GestureDetector/);
  assert.match(source, /Gesture\.Pan\(\)/);
  assert.match(source, /\.maxPointers\(1\)/);
  assert.match(source, /\.shouldCancelWhenOutside\(false\)/);
  assert.doesNotMatch(source, /\bPanResponder\b/);
});

test('cada mascara SVG recebe identidade React propria', () => {
  assert.match(source, /useId\(\)/);
  assert.match(source, /createScratchSvgIdBase\(testID, reactId\)/);
  assert.match(source, /mask=\{`url\(#\$\{maskId\}\)`\}/);
});

test('fallback e progresso expoem contratos acessiveis', () => {
  assert.match(source, /accessibilityRole="progressbar"/);
  assert.match(source, /accessibilityValue=\{\{ min: 0, max: 100, now: accessibleProgressPercent \}\}/);
  assert.match(source, /accessibilityLiveRegion="polite"/);
  assert.match(source, /accessibilityState=\{\{ disabled: completing \}\}/);
  assert.match(source, /minHeight:\s*44/);
  assert.match(source, /revealAnnouncement/);
});

test('foil premium usa metal antigo e nao reapresenta a paleta roxo-rosa', () => {
  assert.match(source, /#121416/);
  assert.match(source, /#987342/);
  assert.match(source, /#D8B16A/);
  assert.doesNotMatch(source, /#2E2038|#715374|#A56B87|#5B456B|#30213B|#F4A9C7/i);
  assert.doesNotMatch(source, /progressTrack|progressFill/);
});

test('movimento e tato respeitam plataforma e preferencia do sistema', () => {
  assert.match(source, /useReducedMotion\(\)/);
  assert.match(source, /duration: motionAllowed \? 360 : 80/);
  assert.match(source, /Platform\.OS === 'web'\) return Promise\.resolve\(\)/);
  assert.match(source, /AndroidHaptics\.Segment_Frequent_Tick/);
  assert.match(source, /HAPTIC_MIN_INTERVAL_MS/);
});
