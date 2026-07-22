const PATCH_KEY = '__gannzillaBrightWheelLinesV391';
const TWO_PI = Math.PI * 2;

function queryParams() {
  try {
    return new URLSearchParams(window.location.search || '');
  } catch (_) {
    return new URLSearchParams();
  }
}

function boolParam(name, fallback = false) {
  const query = queryParams();
  if (!query.has(name)) return fallback;
  const value = String(query.get(name) || '').toLowerCase();
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
}

function numberParam(name, fallback, min, max) {
  const value = Number(queryParams().get(name));
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

function isMainWheelCanvas(canvas) {
  if (!canvas || canvas.closest?.('aside')) return false;
  const rect = canvas.getBoundingClientRect?.();
  return Boolean(
    canvas.width > 0
      && canvas.height > 0
      && rect
      && rect.width > 250
      && rect.height > 250,
  );
}

function findMainWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .filter(isMainWheelCanvas)
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function polar(cx, cy, radius, degrees) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function wedge(ctx, cx, cy, innerRadius, outerRadius, startDegrees, endDegrees) {
  const start = ((startDegrees - 90) * Math.PI) / 180;
  const end = ((endDegrees - 90) * Math.PI) / 180;
  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, start, end, false);
  ctx.arc(cx, cy, innerRadius, end, start, true);
  ctx.closePath();
}

function normalizeRotation(degrees) {
  let radians = ((degrees - 90) * Math.PI) / 180;
  while (radians > Math.PI) radians -= TWO_PI;
  while (radians < -Math.PI) radians += TWO_PI;
  if (radians > Math.PI / 2) radians -= Math.PI;
  if (radians < -Math.PI / 2) radians += Math.PI;
  return radians;
}

function digitalRoot(value) {
  const integer = Math.abs(Math.trunc(Number(value) || 0));
  return integer === 0 ? 0 : 1 + ((integer - 1) % 9);
}

function numberColor(value) {
  const root = digitalRoot(value);
  if (root === 1 || root === 4 || root === 7) return '#a10f1f';
  if (root === 2 || root === 5 || root === 8) return '#1457d9';
  return '#111111';
}

function drawText(ctx, text, x, y, degrees, fontSize, maxWidth, fontWeight) {
  ctx.save();
  ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5);
  ctx.rotate(normalizeRotation(degrees));
  ctx.font = `${fontWeight} ${fontSize}px Tahoma, Segoe UI, Arial, sans-serif`;
  ctx.fillStyle = numberColor(text);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(text), 0, 0, Math.max(8, maxWidth));
  ctx.restore();
}

function drawExactCardinalWheel() {
  if (!boolParam('cardinalAlign36', false)) return false;

  const canvas = findMainWheelCanvas();
  if (!canvas) return false;

  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const width = canvas.width / dpr;
  const height = canvas.height / dpr;
  if (!Number.isFinite(width) || !Number.isFinite(height)) return false;

  const levels = Math.round(numberParam('levels', 10, 1, 12));
  const divisions = 36;
  const innerRadius = numberParam('gannzillaInnerRadius', 170, 80, 500);
  const configuredRingWidth = numberParam('gannzillaRingWidth', 60, 30, 150);
  const fontSize = numberParam('gannzillaFontSize', 13, 8, 30);
  const fontWeight = Math.round(numberParam('gannzillaFontWeight', 700, 500, 900));
  const totalRingCount = levels + 1;
  const ringWidth = (levels * configuredRingWidth) / totalRingCount;
  const wheelRadius = innerRadius + (totalRingCount * ringWidth);
  const cx = width / 2;
  const cy = height / 2;
  const sector = 360 / divisions;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius, 0, TWO_PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  for (let ring = 0; ring < totalRingCount; ring += 1) {
    const inner = innerRadius + (ring * ringWidth);
    const outer = inner + ringWidth;
    const mid = (inner + outer) / 2;
    const numericRingIndex = ring - 1;
    const fill = ring === 0
      ? '#f7f5f0'
      : (numericRingIndex % 2 === 0 ? '#d8d4cc' : '#f7f5f0');
    const arcWidth = (TWO_PI * mid) / divisions;
    const maxWidth = arcWidth * 0.78;

    for (let index = 0; index < divisions; index += 1) {
      // index 0 is value 1 at 10°. index 35 is 36 at 0°.
      const centerDegrees = ((index + 1) % divisions) * sector;
      const startDegrees = centerDegrees - (sector / 2);
      const endDegrees = centerDegrees + (sector / 2);

      wedge(ctx, cx, cy, inner, outer, startDegrees, endDegrees);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.15;
      ctx.globalAlpha = 1;
      ctx.stroke();

      const value = ring === 0
        ? index + 1
        : (numericRingIndex * divisions) + index + 1;
      const point = polar(cx, cy, mid, centerDegrees);
      drawText(
        ctx,
        value,
        point.x,
        point.y,
        centerDegrees,
        ring === 0 ? Math.max(11, fontSize) : fontSize,
        maxWidth,
        ring === 0 ? 800 : fontWeight,
      );
    }
  }

  ctx.restore();
  canvas.dataset.gannzillaCardinalAlignmentV391 = 'true';
  canvas.dataset.gannzillaNorth = '36,36,72,108,144,180,216,252,288,324,360';
  canvas.dataset.gannzillaEast = '9';
  canvas.dataset.gannzillaSouth = '18';
  canvas.dataset.gannzillaWest = '27';
  canvas.dataset.gannzillaVisibleOuterRadius = String(wheelRadius);
  return true;
}

function installBrightWheelLines() {
  if (typeof window === 'undefined' || typeof CanvasRenderingContext2D === 'undefined') return;
  if (window[PATCH_KEY]) return;

  const prototype = CanvasRenderingContext2D.prototype;
  const nativeStroke = prototype.stroke;

  prototype.stroke = function brightWheelStroke(...args) {
    if (boolParam('brightWheelLines', false) && isMainWheelCanvas(this.canvas)) {
      const previousStrokeStyle = this.strokeStyle;
      const previousLineWidth = this.lineWidth;
      const previousGlobalAlpha = this.globalAlpha;

      this.strokeStyle = '#000000';
      this.lineWidth = Math.max(1.15, Number(this.lineWidth) || 1);
      this.globalAlpha = 1;

      const result = nativeStroke.apply(this, args);

      this.strokeStyle = previousStrokeStyle;
      this.lineWidth = previousLineWidth;
      this.globalAlpha = previousGlobalAlpha;
      return result;
    }

    return nativeStroke.apply(this, args);
  };

  let frame = 0;
  const timers = new Set();
  const schedule = (delay = 0) => {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        drawExactCardinalWheel();
      });
    }, delay);
    timers.add(timer);
  };
  const scheduleBurst = () => [0, 60, 180, 420, 850, 1400].forEach(schedule);

  scheduleBurst();
  document.addEventListener('input', scheduleBurst, true);
  document.addEventListener('change', scheduleBurst, true);
  window.addEventListener('resize', scheduleBurst);
  window.addEventListener('gannzilla:ring-two-numbering-refresh', scheduleBurst);
  window.addEventListener('gannzilla:canonical-property-change-v326', scheduleBurst);

  window[PATCH_KEY] = true;
  window.GANNZILLA_BRIGHT_WHEEL_LINES_V391 = true;
  window.__auditGannzillaCardinalAlignmentV391 = () => {
    const canvas = findMainWheelCanvas();
    return {
      ok: canvas?.dataset?.gannzillaCardinalAlignmentV391 === 'true',
      build: 391,
      north: '36 / 36 / 72 / 108 / 144 / 180 / 216 / 252 / 288 / 324 / 360',
      east: 9,
      south: 18,
      west: 27,
      sectorDegrees: 10,
      halfCellOffsetDegrees: 5,
      brightBlackLines: boolParam('brightWheelLines', false),
    };
  };
}

installBrightWheelLines();
