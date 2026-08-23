const test = require('node:test');
const assert = require('node:assert/strict');
const { createScratchTiles, scratchIndexesAtPoint, scratchProgress } = require('../lib/scratchReveal.js');

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
