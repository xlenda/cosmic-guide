import {
  COSMIC_CARD_SIZE,
  buildCosmicShareCardContent,
  cleanPublicCardText,
  cosmicCardStars,
  cosmicShareCardPack,
} from './cosmicShareCardContent';

export {
  COSMIC_CARD_SIZE,
  buildCosmicShareCardContent,
  cleanPublicCardText,
  cosmicCardStars,
  cosmicShareCardPack,
};

const COLORS = Object.freeze({
  obsidian: '#0B0712',
  plum: '#211025',
  gold: '#E3B85F',
  ivory: '#F4E8CC',
  mauve: '#B9A2BC',
});

function roundedRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function wrappedLines(context, text, maxWidth) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (current && context.measureText(candidate).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function drawCenteredLines(context, lines, centerX, firstY, lineHeight, maxLines) {
  lines.slice(0, maxLines).forEach((line, index) => {
    const isLastClipped = index === maxLines - 1 && lines.length > maxLines;
    context.fillText(isLastClipped ? `${line.replace(/[.…]+$/, '')}…` : line, centerX, firstY + index * lineHeight);
  });
}

function drawCardCanvas(content) {
  const canvas = document.createElement('canvas');
  canvas.width = COSMIC_CARD_SIZE.width;
  canvas.height = COSMIC_CARD_SIZE.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('canvas_context_unavailable');

  const background = context.createRadialGradient(720, 760, 80, 540, 960, 1120);
  background.addColorStop(0, COLORS.plum);
  background.addColorStop(0.58, '#130B17');
  background.addColorStop(1, COLORS.obsidian);
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (const star of cosmicCardStars(content, 38)) {
    context.globalAlpha = star.opacity;
    context.fillStyle = COLORS.ivory;
    context.beginPath();
    context.arc(star.x * 10.8, star.y * 19.2, star.size * 1.35, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;

  context.strokeStyle = 'rgba(227,184,95,0.42)';
  context.lineWidth = 2;
  roundedRect(context, 54, 54, 972, 1812, 42);
  context.stroke();

  context.save();
  context.translate(540, 780);
  context.rotate(-0.18);
  context.scale(1, 0.42);
  context.strokeStyle = 'rgba(227,184,95,0.18)';
  context.lineWidth = 3;
  context.beginPath();
  context.arc(0, 0, 570, 0, Math.PI * 2);
  context.stroke();
  context.restore();

  context.save();
  context.translate(540, 780);
  context.rotate(0.32);
  context.scale(0.54, 1);
  context.strokeStyle = 'rgba(227,184,95,0.13)';
  context.beginPath();
  context.arc(0, 0, 430, 0, Math.PI * 2);
  context.stroke();
  context.restore();

  context.textBaseline = 'middle';
  context.fillStyle = COLORS.ivory;
  context.textAlign = 'left';
  context.font = '900 25px Arial, sans-serif';
  context.fillText(content.brand, 98, 145);
  context.strokeStyle = 'rgba(227,184,95,0.4)';
  context.beginPath();
  context.moveTo(340, 145);
  context.lineTo(764, 145);
  context.stroke();
  context.fillStyle = COLORS.mauve;
  context.textAlign = 'right';
  context.font = '800 18px Arial, sans-serif';
  context.fillText(content.edition, 982, 145);

  context.textAlign = 'center';
  context.fillStyle = COLORS.gold;
  context.font = '900 24px Arial, sans-serif';
  context.fillText(content.eyebrow, 540, 320);

  context.strokeStyle = 'rgba(227,184,95,0.72)';
  context.lineWidth = 3;
  context.beginPath();
  context.arc(540, 548, 154, 0, Math.PI * 2);
  context.stroke();
  context.strokeStyle = 'rgba(227,184,95,0.32)';
  context.beginPath();
  context.arc(566, 548, 127, 0, Math.PI * 2);
  context.stroke();
  context.fillStyle = '#170C1B';
  context.beginPath();
  context.arc(540, 548, 94, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = 'rgba(244,232,204,0.2)';
  context.stroke();
  context.fillStyle = COLORS.ivory;
  context.font = '72px Georgia, serif';
  context.fillText(content.glyph, 540, 550);

  let titleSize = 76;
  let titleLines = [];
  do {
    context.font = `700 ${titleSize}px Georgia, serif`;
    titleLines = wrappedLines(context, content.title, 820);
    if (titleLines.length <= 4) break;
    titleSize -= 4;
  } while (titleSize >= 50);
  context.fillStyle = COLORS.ivory;
  drawCenteredLines(context, titleLines, 540, 780, titleSize * 1.16, 4);

  const titleBottom = 780 + Math.min(titleLines.length, 4) * titleSize * 1.16;
  context.font = '36px Arial, sans-serif';
  context.fillStyle = '#C6B3C7';
  const subtitleLines = wrappedLines(context, content.subtitle, 800);
  drawCenteredLines(context, subtitleLines, 540, titleBottom + 62, 52, 5);

  context.fillStyle = COLORS.ivory;
  context.font = '700 40px Georgia, serif';
  const detailLines = wrappedLines(context, content.detail, 820);
  drawCenteredLines(context, detailLines, 540, 1522, 51, 3);
  context.fillStyle = COLORS.mauve;
  context.font = '800 22px Arial, sans-serif';
  drawCenteredLines(context, wrappedLines(context, content.meta.toUpperCase(), 820), 540, 1682, 31, 2);

  context.strokeStyle = 'rgba(227,184,95,0.42)';
  context.beginPath();
  context.moveTo(98, 1768);
  context.lineTo(982, 1768);
  context.stroke();
  context.fillStyle = COLORS.gold;
  context.font = '900 18px Arial, sans-serif';
  context.fillText(content.footer, 540, 1810);

  return canvas;
}

function canvasBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('png_generation_failed'));
    }, 'image/png', 1);
  });
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${fileName}.png`;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function sharePremiumCosmicCard({ content, dialogTitle }) {
  if (typeof document === 'undefined') throw new Error('web_document_unavailable');
  const canvas = drawCardCanvas(content);
  const blob = await canvasBlob(canvas);
  const file = typeof File === 'function'
    ? new File([blob], `${content.fileName}.png`, { type: 'image/png' })
    : null;

  if (file && typeof navigator?.share === 'function' && typeof navigator?.canShare === 'function') {
    const data = { files: [file], title: dialogTitle, text: content.shareText };
    if (navigator.canShare(data)) {
      try {
        await navigator.share(data);
        return { status: 'shared' };
      } catch (error) {
        if (error?.name === 'AbortError') return { status: 'cancelled' };
      }
    }
  }

  downloadBlob(blob, content.fileName);
  return { status: 'downloaded' };
}
