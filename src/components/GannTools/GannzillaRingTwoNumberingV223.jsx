import React from 'react';

const BUILD = 226;
const TWO_PI = Math.PI * 2;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function numberParam(name, fallback, min, max) {
  try {
    const value = Number(new URLSearchParams(window.location.search).get(name));
    return Number.isFinite(value) ? clamp(value, min, max) : fallback;
  } catch (_) {
    return fallback;
  }
}

function boolParam(name, fallback) {
  try {
    const query = new URLSearchParams(window.location.search);
    if (!query.has(name)) return fallback;
    const value = String(query.get(name) || '').toLowerCase();
    return value === 'true' || value === '1' || value === 'yes' || value === 'on';
  } catch (_) {
    return fallback;
  }
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

function drawText(ctx, text, x, y, angleDegrees, fontSize, maxWidth, weight, color) {
  ctx.save();
  ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5);
  ctx.rotate(normalizeRotation(angleDegrees));
  ctx.font = `${weight} ${fontSize}px Segoe UI, Arial, Helvetica, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(text), 0, 0, Math.max(8, maxWidth));
  ctx.restore();
}

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)));
}

function digitalRoot(value) {
  const integer = Math.abs(Math.trunc(Number(value) || 0));
  return integer === 0 ? 0 : 1 + ((integer - 1) % 9);
}

function gateColor(value) {
  const root = digitalRoot(value);
  if (root === 1 || root === 4 || root === 7) return '#d71920';
  if (root === 2 || root === 5 || root === 8) return '#1457d9';
  return '#111111';
}

function findWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function redrawWheelNumberingV226() {
  const canvas = findWheelCanvas();
  if (!canvas) return false;

  const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
  const coordinateWidth = canvas.width / dpr;
  const coordinateHeight = canvas.height / dpr;
  if (!Number.isFinite(coordinateWidth) || coordinateWidth <= 0 || coordinateHeight <= 0) return false;

  // `levels` means ten numeric wheels. Ring 1 is a separate 1..36 index ring.
  const numericRingCount = Math.round(numberParam('levels', 10, 1, 12));
  const totalRingCount = numericRingCount + 1;
  const divisions = Math.round(numberParam('divisions', 36, 3, 360));
  const startValue = numberParam('startValue', 79680, -1000000000, 1000000000);
  const increment = numberParam('increment', 1, -1000000, 1000000);
  const innerRadius = numberParam('gannzillaInnerRadius', 170, 80, 500);
  const configuredRingWidth = numberParam('gannzillaRingWidth', 60, 30, 150);
  const fontSize = numberParam('gannzillaFontSize', 13, 8, 30);
  const fontWeight = Math.round(numberParam('gannzillaFontWeight', 700, 500, 900));
  const clockwise = boolParam('clockwise', true);

  // Keep the wheel's existing outer radius while fitting the independent index
  // ring plus all ten numeric rings inside it.
  const availableWheelWidth = numericRingCount * configuredRingWidth;
  const ringWidth = availableWheelWidth / totalRingCount;
  const direction = clockwise ? 1 : -1;
  const sector = 360 / divisions;
  const cx = coordinateWidth / 2;
  const cy = coordinateHeight / 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  for (let ring = 1; ring <= totalRingCount; ring += 1) {
    const inner = innerRadius + (ring - 1) * ringWidth;
    const outer = inner + ringWidth;
    const mid = (inner + outer) / 2;
    const numericRingIndex = ring - 2;
    const fill = ring === 1
      ? '#ffffff'
      : (numericRingIndex % 2 === 0 ? '#dededb' : '#ffffff');
    const arcWidth = (TWO_PI * mid) / divisions;
    const maxWidth = arcWidth * 0.78;

    for (let index = 0; index < divisions; index += 1) {
      const startDegrees = direction * index * sector;
      const endDegrees = direction * (index + 1) * sector;
      const centerDegrees = direction * (index + 0.5) * sector;

      wedge(ctx, cx, cy, inner, outer, startDegrees, endDegrees);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = '#c5c5c5';
      ctx.lineWidth = 0.82;
      ctx.stroke();

      const point = polar(cx, cy, mid, centerDegrees);
      if (ring === 1) {
        const indexNumber = index + 1;
        drawText(
          ctx,
          indexNumber,
          point.x,
          point.y,
          centerDegrees,
          Math.max(11, fontSize),
          maxWidth,
          800,
          gateColor(indexNumber),
        );
      } else {
        const value = startValue + (numericRingIndex * divisions + index) * increment;
        drawText(
          ctx,
          formatNumber(value),
          point.x,
          point.y,
          centerDegrees,
          fontSize,
          maxWidth,
          fontWeight,
          gateColor(value),
        );
      }
    }
  }

  ctx.restore();
  return true;
}

export default function GannzillaRingTwoNumberingV223() {
  React.useEffect(() => {
    let disposed = false;
    let frame = 0;
    let resizeObserver = null;
    const timers = new Set();

    const draw = () => {
      frame = 0;
      if (!disposed) redrawWheelNumberingV226();
    };

    const schedule = (delay = 0) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        if (disposed) return;
        if (frame) window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(draw);
      }, delay);
      timers.add(timer);
    };

    const scheduleAfterUiChange = () => {
      schedule(0);
      schedule(60);
    };

    [0, 100, 260].forEach(schedule);

    const canvas = findWheelCanvas();
    if (canvas && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(scheduleAfterUiChange);
      resizeObserver.observe(canvas);
    }

    document.addEventListener('input', scheduleAfterUiChange, true);
    document.addEventListener('change', scheduleAfterUiChange, true);
    window.addEventListener('resize', scheduleAfterUiChange);
    window.addEventListener('gannzilla:ring-two-numbering-refresh', scheduleAfterUiChange);

    window.GANNZILLA_RING_INDEX_V226 = true;
    window.__auditGannzillaRingIndexV226 = () => ({
      ok: Boolean(findWheelCanvas()),
      build: BUILD,
      ring1Mode: 'INDEX_1_TO_36',
      gateColors: { red: '1/4/7', blue: '2/5/8', black: '3/6/9' },
      allNumericRingsGateColored: true,
      numericRingCount: Math.round(numberParam('levels', 10, 1, 12)),
      firstNumericRing: 2,
      protractorIndependent: true,
      continuousInterval: false,
      bodyMutationObserver: false,
    });

    return () => {
      disposed = true;
      if (frame) window.cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
      resizeObserver?.disconnect();
      document.removeEventListener('input', scheduleAfterUiChange, true);
      document.removeEventListener('change', scheduleAfterUiChange, true);
      window.removeEventListener('resize', scheduleAfterUiChange);
      window.removeEventListener('gannzilla:ring-two-numbering-refresh', scheduleAfterUiChange);
      delete window.GANNZILLA_RING_INDEX_V226;
      delete window.__auditGannzillaRingIndexV226;
    };
  }, []);

  return null;
}
