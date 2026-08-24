const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createScratchTiles,
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
  assert.ok(center.length >= 8 && center.length <= 16, `pincel inesperado: ${center.length} células`);
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
