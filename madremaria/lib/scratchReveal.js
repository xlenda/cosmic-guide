// A grade mede cobertura; ela nao desenha o veu. Celulas de aproximadamente
// 7-8 dp na carta grande deixam a estimativa perto da area realmente removida
// sem transformar cada movimento em uma varredura cara de pixels.
export const SCRATCH_COLUMNS = 41;
export const SCRATCH_ROWS = 68;
export const SCRATCH_BRUSH_RADIUS = 24;
export const SCRATCH_REVEAL_PROGRESS = 0.58;
export const SCRATCH_HAPTIC_PROGRESS_STEP = 0.12;

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
  const cols = Math.max(1, Math.floor(columns));
  const lines = Math.max(1, Math.floor(rows));
  const col = Math.min(cols - 1, Math.max(0, Math.floor((x / width) * cols)));
  const row = Math.min(lines - 1, Math.max(0, Math.floor((y / height) * lines)));
  const found = [];
  for (let dy = -radius; dy <= radius; dy += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      const nextCol = col + dx;
      const nextRow = row + dy;
      if (nextCol >= 0 && nextCol < cols && nextRow >= 0 && nextRow < lines) {
        found.push(nextRow * cols + nextCol);
      }
    }
  }
  return found;
}

// Limpa um pincel circular medido em pixels/dp. A grade continua sendo a
// camada portável (funciona no RN nativo e na web), mas o gesto deixa de
// parecer uma sequência de quadrados: só entram as células atravessadas pela
// área física do pincel.
export function scratchIndexesWithBrush({
  x,
  y,
  width,
  height,
  columns = 12,
  rows = 18,
  brushRadius = 24,
}) {
  if (![x, y, width, height, brushRadius].every(Number.isFinite) || width <= 0 || height <= 0 || brushRadius <= 0) {
    return [];
  }
  const cols = Math.max(1, Math.floor(columns));
  const lines = Math.max(1, Math.floor(rows));
  const cellWidth = width / cols;
  const cellHeight = height / lines;
  const minCol = Math.max(0, Math.floor((x - brushRadius) / cellWidth));
  const maxCol = Math.min(cols - 1, Math.floor((x + brushRadius) / cellWidth));
  const minRow = Math.max(0, Math.floor((y - brushRadius) / cellHeight));
  const maxRow = Math.min(lines - 1, Math.floor((y + brushRadius) / cellHeight));
  const found = [];

  for (let row = minRow; row <= maxRow; row += 1) {
    for (let column = minCol; column <= maxCol; column += 1) {
      const centerX = (column + 0.5) * cellWidth;
      const centerY = (row + 0.5) * cellHeight;
      // A celula representa uma amostra de area. Contar apenas quando o centro
      // esta sob o pincel evita superestimar toda celula apenas tangenciada.
      if (Math.hypot(centerX - x, centerY - y) <= brushRadius) {
        found.push(row * cols + column);
      }
    }
  }
  return found;
}

// PanResponder pode entregar dois eventos muito distantes quando o dedo se
// move rápido. Amostrar apenas o ponto atual deixa "ilhas" intactas e dá o
// aspecto robótico que motivou este lote. Esta função interpola o segmento
// inteiro e une todas as células tocadas pelo pincel.
export function scratchIndexesAlongSegment({
  fromX,
  fromY,
  toX,
  toY,
  width,
  height,
  columns = 12,
  rows = 18,
  brushRadius = 24,
  spacing,
}) {
  if (![toX, toY, width, height].every(Number.isFinite) || width <= 0 || height <= 0) return [];
  if (![fromX, fromY].every(Number.isFinite)) {
    return scratchIndexesWithBrush({ x: toX, y: toY, width, height, columns, rows, brushRadius });
  }

  const cols = Math.max(1, Math.floor(columns));
  const lines = Math.max(1, Math.floor(rows));
  const distance = Math.hypot(toX - fromX, toY - fromY);
  const naturalSpacing = Math.max(1, Math.min(width / cols, height / lines) * 0.45);
  const sampleSpacing = Number.isFinite(spacing) && spacing > 0 ? spacing : naturalSpacing;
  const steps = Math.max(1, Math.ceil(distance / sampleSpacing));
  const found = new Set();

  for (let step = 0; step <= steps; step += 1) {
    const ratio = step / steps;
    const x = fromX + (toX - fromX) * ratio;
    const y = fromY + (toY - fromY) * ratio;
    scratchIndexesWithBrush({ x, y, width, height, columns: cols, rows: lines, brushRadius })
      .forEach((index) => found.add(index));
  }
  return [...found];
}

export function scratchProgress(clearedCount, totalCount) {
  if (!Number.isFinite(clearedCount) || !Number.isFinite(totalCount) || totalCount <= 0) return 0;
  return Math.max(0, Math.min(1, clearedCount / totalCount));
}

export function createScratchSvgIdBase(semanticId, instanceId) {
  const semantic = String(semanticId || 'scratch-card').replace(/[^a-zA-Z0-9_-]/g, '');
  const unique = String(instanceId || 'instance').replace(/[^a-zA-Z0-9_-]/g, '');
  return `${semantic || 'scratch-card'}-${unique || 'instance'}`;
}

// Degraus discretos para textura tatil. O chamador tambem limita o tempo entre
// pulsos, portanto um evento que atravesse varios degraus nao cria uma rajada.
export function scratchHapticMilestone(progress, step = SCRATCH_HAPTIC_PROGRESS_STEP) {
  if (!Number.isFinite(progress) || !Number.isFinite(step) || step <= 0) return 0;
  return Math.max(0, Math.floor(Math.max(0, Math.min(1, progress)) / step));
}
