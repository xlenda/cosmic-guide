const test = require('node:test');
const assert = require('node:assert/strict');
const {
  SCRATCH_BRUSH_RADIUS,
  SCRATCH_COLUMNS,
  SCRATCH_HAPTIC_PROGRESS_STEP,
  SCRATCH_REVEAL_PROGRESS,
  SCRATCH_ROWS,
  createScratchTiles,
  createScratchSvgIdBase,
  scratchHapticMilestone,
  scratchIndexesAtPoint,
  scratchIndexesWithBrush,
  scratchIndexesAlongSegment,
  scratchProgress,
} = require('../lib/scratchReveal.js');

test('grade de raspagem cobre a carta inteira sem ids duplicados', () => {
  const tiles = createScratchTiles(6, 8);
  assert.equal(tiles.length, 48);
  assert.equal(new Set(tiles.map((tile) => tile.index)).size, 48);
  assert.equal(tiles[0].left, '0%');
  assert.equal(tiles.at(-1).row, 7);
});

test('o dedo limpa a célula tocada e vizinhas sem escapar da grade', () => {
  const middle = scratchIndexesAtPoint({ x: 50, y: 50, width: 100, height: 100, columns: 6, rows: 8, radius: 1 });
  assert.equal(middle.length, 9);
  const corner = scratchIndexesAtPoint({ x: 0, y: 0, width: 100, height: 100, columns: 6, rows: 8, radius: 1 });
  assert.deepEqual(corner, [0, 1, 6, 7]);
});

test('progresso é limitado entre zero e um', () => {
  assert.equal(scratchProgress(24, 48), 0.5);
  assert.equal(scratchProgress(-3, 48), 0);
  assert.equal(scratchProgress(99, 48), 1);
  assert.equal(scratchProgress(2, 0), 0);
});

test('pincel circular acompanha a escala física da carta e respeita as bordas', () => {
  const center = scratchIndexesWithBrush({
    x: 120,
    y: 180,
    width: 240,
    height: 360,
    columns: 12,
    rows: 18,
    brushRadius: 24,
  });
  // O ponto fica no encontro de quatro celulas de 20x20. Somente os quatro
  // centros realmente dentro do raio de 24 contam para a amostra de area.
  assert.equal(center.length, 4, `pincel inesperado: ${center.length} celulas`);
  assert.ok(center.every((index) => index >= 0 && index < 216));

  const corner = scratchIndexesWithBrush({
    x: 0,
    y: 0,
    width: 240,
    height: 360,
    columns: 12,
    rows: 18,
    brushRadius: 24,
  });
  assert.ok(corner.length > 0);
  assert.ok(corner.every((index) => index >= 0 && index < 216));
});

test('trajeto rápido é interpolado sem deixar uma faixa inteira sem raspagem', () => {
  const indexes = scratchIndexesAlongSegment({
    fromX: 12,
    fromY: 180,
    toX: 228,
    toY: 180,
    width: 240,
    height: 360,
    columns: 12,
    rows: 18,
    brushRadius: 22,
  });
  const touchedColumns = new Set(indexes.map((index) => index % 12));
  assert.deepEqual([...touchedColumns].sort((a, b) => a - b), Array.from({ length: 12 }, (_, i) => i));
});

test('trajeto sem ponto anterior ainda raspa o ponto atual', () => {
  const indexes = scratchIndexesAlongSegment({
    fromX: Number.NaN,
    fromY: Number.NaN,
    toX: 50,
    toY: 60,
    width: 100,
    height: 120,
    columns: 10,
    rows: 12,
    brushRadius: 18,
  });
  assert.ok(indexes.length > 0);
});

function distanceToSegment(x, y, from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const lengthSquared = dx * dx + dy * dy;
  const ratio = lengthSquared > 0
    ? Math.max(0, Math.min(1, ((x - from.x) * dx + (y - from.y) * dy) / lengthSquared))
    : 0;
  return Math.hypot(x - (from.x + ratio * dx), y - (from.y + ratio * dy));
}

function rasterCoverage(segments, width, height, brushRadius, sampleStep = 2) {
  let covered = 0;
  let total = 0;
  for (let y = sampleStep / 2; y < height; y += sampleStep) {
    for (let x = sampleStep / 2; x < width; x += sampleStep) {
      total += 1;
      if (segments.some(([from, to]) => distanceToSegment(x, y, from, to) <= brushRadius)) {
        covered += 1;
      }
    }
  }
  return covered / total;
}

test('gate premium acompanha a area visual com erro menor que tres pontos percentuais', () => {
  const width = 288;
  const height = 460.8;
  const points = [];
  for (let row = 0; row < 8; row += 1) {
    const y = ((row + 0.5) * height) / 8;
    const ratios = row % 2 === 0
      ? [0.08, 0.28, 0.48, 0.68, 0.88]
      : [0.88, 0.68, 0.48, 0.28, 0.08];
    ratios.forEach((ratio) => points.push({ x: width * ratio, y }));
  }

  const cleared = new Set();
  const segments = [];
  let measuredProgress = 0;
  for (let index = 0; index < points.length; index += 1) {
    const from = index === 0 ? points[index] : points[index - 1];
    const to = points[index];
    scratchIndexesAlongSegment({
      fromX: from.x,
      fromY: from.y,
      toX: to.x,
      toY: to.y,
      width,
      height,
      columns: SCRATCH_COLUMNS,
      rows: SCRATCH_ROWS,
      brushRadius: SCRATCH_BRUSH_RADIUS,
    }).forEach((cell) => cleared.add(cell));
    segments.push([from, to]);
    measuredProgress = scratchProgress(cleared.size, SCRATCH_COLUMNS * SCRATCH_ROWS);
    if (measuredProgress >= SCRATCH_REVEAL_PROGRESS) break;
  }

  const visualProgress = rasterCoverage(segments, width, height, SCRATCH_BRUSH_RADIUS);
  assert.ok(visualProgress >= 0.55 && visualProgress <= 0.64, `cobertura visual inesperada: ${visualProgress}`);
  assert.ok(
    Math.abs(measuredProgress - visualProgress) <= 0.03,
    `grade=${measuredProgress}; visual=${visualProgress}`,
  );
});

test('degraus hapticos sao limitados, monotonicos e configurados para poucos pulsos', () => {
  assert.equal(scratchHapticMilestone(-1), 0);
  assert.equal(scratchHapticMilestone(SCRATCH_HAPTIC_PROGRESS_STEP - 0.001), 0);
  assert.equal(scratchHapticMilestone(SCRATCH_HAPTIC_PROGRESS_STEP), 1);
  assert.equal(scratchHapticMilestone(0.59), 4);
  assert.ok(scratchHapticMilestone(1) <= 8);
  assert.equal(scratchHapticMilestone(0.5, 0), 0);
});

test('ids SVG usam a identidade da instancia e nao colidem entre cartas irmas', () => {
  const first = createScratchSvgIdBase('scratch-card', ':r1:');
  const second = createScratchSvgIdBase('scratch-card', ':r2:');
  assert.equal(first, 'scratch-card-r1');
  assert.equal(second, 'scratch-card-r2');
  assert.notEqual(first, second);
  assert.match(createScratchSvgIdBase('tarot scratch/0', ''), /^[a-zA-Z0-9_-]+$/);
});
