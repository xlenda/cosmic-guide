const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

test('as cinco poses do Órbi existem como PNGs transparentes e otimizados', () => {
  for (const pose of ['neutral', 'curious', 'thinking', 'pointing', 'celebrating']) {
    const file = path.join(ROOT, 'assets', 'mascote', `orbi-${pose}.png`);
    assert.equal(fs.existsSync(file), true, `asset ausente: ${pose}`);
    const data = fs.readFileSync(file);
    assert.equal(data.subarray(1, 4).toString('ascii'), 'PNG');
    assert.ok(data.length < 300_000, `${pose} precisa ficar abaixo de 300 KB`);
    // PNG color type 6 = RGBA; o byte fica no IHDR na posição 25.
    assert.equal(data[25], 6, `${pose} precisa manter canal alpha real`);
  }
});

test('OrbiGuide empacota poses estaticamente, respeita reduzir movimento e não cria loop', () => {
  const source = fs.readFileSync(path.join(ROOT, 'components', 'OrbiGuide.js'), 'utf8');
  for (const pose of ['neutral', 'curious', 'thinking', 'pointing', 'celebrating']) {
    assert.match(source, new RegExp(`${pose}: require\\('\\.\\./assets/mascote/orbi-${pose}\\.png'\\)`));
  }
  assert.match(source, /isReduceMotionEnabled/);
  assert.match(source, /reduceMotionChanged/);
  assert.doesNotMatch(source, /Animated\.loop/);
});
