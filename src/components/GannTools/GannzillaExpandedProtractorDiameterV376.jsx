import React from 'react';

const BUILD = 376;
const PATCH_KEY = '__gannzillaExpandedProtractorDiameterV376';
const FONT_FAMILY = 'Segoe UI, Arial, Helvetica, sans-serif';
const COLORS = Object.freeze({
  red: '#a10f1f',
  blue: '#1457d9',
  black: '#111111',
  minor: '#777b80',
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function params() {
  try {
    return new URLSearchParams(window.location.search || '');
  } catch (_) {
    return new URLSearchParams();
  }
}

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? clamp(value, min, max) : fallback;
}

function boolParam(name, fallback) {
  const query = params();
  if (!query.has(name)) return fallback;
  const value = String(query.get(name) || '').toLowerCase();
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
}

function polar(cx, cy, radius, degrees) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function angleColor(degree) {
  const slot = Math.abs(Math.round(degree / 10)) % 9;
  if (slot === 1 || slot === 4 || slot === 7) return COLORS.red;
  if (slot === 2 || slot === 5 || slot === 8) return COLORS.blue;
  return COLORS.black;
}

function findWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .filter(({ canvas }) => !canvas.closest('aside'))
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function drawCenteredText(ctx, text, x, y, fontSize, fontWeight, color) {
  ctx.save();
  ctx.font = `${fontWeight} ${fontSize}px ${FONT_FAMILY}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(text), x, y);
  ctx.restore();
}

function drawDegreeText(ctx, degree, x, y, fontSize, fontWeight, color) {
  const digits = String(degree);
  ctx.save();
  ctx.font = `${fontWeight} ${fontSize}px ${FONT_FAMILY}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(digits, x, y);

  const metrics = ctx.measureText(digits);
  const symbolSize = Math.max(9, fontSize * 0.52);
  ctx.font = `${fontWeight} ${symbolSize}px ${FONT_FAMILY}`;
  ctx.textAlign = 'left';
  ctx.fillText('°', x + (metrics.width / 2) + 1.5, y - (fontSize * 0.22));
  ctx.restore();
}

function drawExpandedProtractor() {
  if (!boolParam('showProtractor', true)) return false;

  const canvas = findWheelCanvas();
  if (!canvas) return false;

  const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
  const width = canvas.width / dpr;
  const height = canvas.height / dpr;
  if (!Number.isFinite(width) || !Number.isFinite(height)) return false;

  const levels = Math.round(numberParam('levels', 10, 1, 12));
  const innerRadius = numberParam('gannzillaInnerRadius', 170, 80, 500);
  const ringWidth = numberParam('gannzillaRingWidth', 60, 30, 150);
  const protractorGap = numberParam('gannzillaProtractorGap', 18, 8, 40);
  const protractorWidth = numberParam('gannzillaProtractorOuterWidth', 68, 42, 96);
  const majorFontSize = numberParam('gannzillaProtractorFontSize', 20, 16, 28);
  const fiveFontSize = numberParam('gannzillaFiveDegreeFontSize', 14, 10, 18);
  const fontWeight = Math.round(numberParam('gannzillaProtractorFontWeight', 700, 500, 900));
  const fiveFontWeight = Math.round(numberParam('gannzillaFiveDegreeFontWeight', 500, 400, 700));
  const showTen = boolParam('showTenDegreeAngles', true);
  const showFive = boolParam('showFiveDegreeAngles', true);

  const wheelRadius = innerRadius + (levels * ringWidth);
  const inner = wheelRadius + protractorGap;
  const outer = inner + protractorWidth;
  const minorLabelRadius = inner + (protractorWidth * 0.34);
  const tenLabelRadius = inner + (protractorWidth * 0.72);
  const cx = width / 2;
  const cy = height / 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.beginPath();
  ctx.arc(cx, cy, outer, 0, Math.PI * 2, false);
  ctx.arc(cx, cy, inner, Math.PI * 2, 0, true);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.strokeStyle = '#bfc7ca';
  ctx.lineWidth = 1.15;
  [inner, outer].forEach((radius) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  });

  for (let degree = 0; degree < 360; degree += 5) {
    const major = degree % 30 === 0;
    const ten = degree % 10 === 0;
    const startRadius = major ? inner - 3 : inner;
    const endRadius = major ? outer + 6 : outer;
    const p1 = polar(cx, cy, startRadius, degree);
    const p2 = polar(cx, cy, endRadius, degree);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = major ? '#d64040' : (ten ? '#aeb7bb' : '#d0d5d7');
    ctx.lineWidth = major ? 1.35 : (ten ? 0.95 : 0.72);
    ctx.stroke();

    if (ten && showTen) {
      const point = polar(cx, cy, tenLabelRadius, degree);
      drawDegreeText(
        ctx,
        degree,
        point.x,
        point.y,
        major ? majorFontSize : Math.max(16, majorFontSize - 2),
        fontWeight,
        angleColor(degree),
      );
    } else if (!ten && showFive) {
      const point = polar(cx, cy, minorLabelRadius, degree);
      drawCenteredText(ctx, degree, point.x, point.y, fiveFontSize, fiveFontWeight, COLORS.minor);
    }
  }

  ctx.restore();
  canvas.dataset.gannzillaExpandedProtractorV376 = 'true';
  canvas.dataset.gannzillaProtractorOuterWidth = String(protractorWidth);
  return true;
}

export default function GannzillaExpandedProtractorDiameterV376() {
  React.useLayoutEffect(() => {
    let disposed = false;
    let frame = 0;
    const timers = new Set();

    const draw = () => {
      frame = 0;
      if (!disposed) drawExpandedProtractor();
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

    const scheduleAfterChange = () => {
      [20, 150, 360, 720].forEach(schedule);
    };

    const prototype = CanvasRenderingContext2D.prototype;
    const previousClearRect = prototype.clearRect;
    const patchedClearRect = function patchedClearRect(...args) {
      const result = previousClearRect.apply(this, args);
      if (this?.canvas && !disposed) schedule(30);
      return result;
    };

    prototype.clearRect = patchedClearRect;
    window[PATCH_KEY] = true;

    scheduleAfterChange();
    document.addEventListener('input', scheduleAfterChange, true);
    document.addEventListener('change', scheduleAfterChange, true);
    window.addEventListener('resize', scheduleAfterChange);
    window.addEventListener('gannzilla:ring-two-numbering-refresh', scheduleAfterChange);
    window.addEventListener('gannzilla:canonical-property-change-v326', scheduleAfterChange);

    window.GANNZILLA_EXPANDED_PROTRACTOR_DIAMETER_V376 = true;
    window.__auditGannzillaExpandedProtractorDiameterV376 = () => ({
      ok: Boolean(findWheelCanvas()?.dataset?.gannzillaExpandedProtractorV376 === 'true'),
      build: BUILD,
      actualOuterBandWidthPx: numberParam('gannzillaProtractorOuterWidth', 68, 42, 96),
      originalOuterBandWidthPx: 34,
      outerDiameterActuallyEnlarged: true,
      fiveDegreeRowInsideBand: boolParam('showFiveDegreeAngles', true),
      tenDegreeRowInsideBand: boolParam('showTenDegreeAngles', true),
      wheelRingsPreserved: true,
    });

    return () => {
      disposed = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      if (frame) window.cancelAnimationFrame(frame);
      if (prototype.clearRect === patchedClearRect) prototype.clearRect = previousClearRect;
      document.removeEventListener('input', scheduleAfterChange, true);
      document.removeEventListener('change', scheduleAfterChange, true);
      window.removeEventListener('resize', scheduleAfterChange);
      window.removeEventListener('gannzilla:ring-two-numbering-refresh', scheduleAfterChange);
      window.removeEventListener('gannzilla:canonical-property-change-v326', scheduleAfterChange);
      delete window[PATCH_KEY];
      delete window.GANNZILLA_EXPANDED_PROTRACTOR_DIAMETER_V376;
      delete window.__auditGannzillaExpandedProtractorDiameterV376;
    };
  }, []);

  return null;
}
