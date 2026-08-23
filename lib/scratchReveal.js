export function createScratchTiles(columns = 6, rows = 8) {
  const cols = Math.max(1, Math.floor(columns));
  const lines = Math.max(1, Math.floor(rows));
  return Array.from({ length: cols * lines }, (_, index) => ({
    index,
    column: index % cols,
    row: Math.floor(index / cols),
    left: `${((index % cols) * 100) / cols}%`,
    top: `${(Math.floor(index / cols) * 100) / lines}%`,
    width: `${100 / cols + 0.4}%`,
    height: `${100 / lines + 0.4}%`,
  }));
}

export function scratchIndexesAtPoint({ x, y, width, height, columns = 6, rows = 8, radius = 1 }) {
  if (![x, y, width, height].every(Number.isFinite) || width <= 0 || height <= 0) return [];
  const col = Math.min(columns - 1, Math.max(0, Math.floor((x / width) * columns)));
  const row = Math.min(rows - 1, Math.max(0, Math.floor((y / height) * rows)));
  const found = [];
  for (let dy = -radius; dy <= radius; dy += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      const nextCol = col + dx;
      const nextRow = row + dy;
      if (nextCol >= 0 && nextCol < columns && nextRow >= 0 && nextRow < rows) {
        found.push(nextRow * columns + nextCol);
      }
    }
  }
  return found;
}

export function scratchProgress(clearedCount, totalCount) {
  if (!Number.isFinite(clearedCount) || !Number.isFinite(totalCount) || totalCount <= 0) return 0;
  return Math.max(0, Math.min(1, clearedCount / totalCount));
}
