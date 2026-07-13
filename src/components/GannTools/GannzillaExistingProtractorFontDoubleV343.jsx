import React from 'react';

const TWO_PI = Math.PI * 2;

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

function normalizeRotation(degrees) {
  let radians = ((degrees - 90) * Math.PI) / 180;
  while (radians > Math.PI) radians -= TWO_PI;
  while (radians < -Math.PI) radians += TWO_PI;
  if (radians > Math.PI / 2) radians -= Math.PI;
  if (radians < -Math.PI / 2) radians += Math.PI;
  return radians;
}

function findWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function drawExistingAnglesDoubleSize() {
  if (!boolParam('showProtractor', true)) return false;

  const canvas = findWheelCanvas();
  if (!canvas) return false;

  const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
  const width = canvas.width / dpr;
  const height = canvas.height / dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx || width <= 0 || height <= 0) return false;

  const levels = Math.round(numberParam('levels', 10, 1, 12));
  const innerRadius = numberParam('gannzillaInnerRadius', 170, 80, 500);
  const ringWidth = numberParam('gannzillaRingWidth', 60, 30, 150);
  const clockwise = boolParam('clockwise', true);
  const direction = clockwise ? 1 : -1;
  const labelRadius = innerRadius + levels * ringWidth + 18 + 34 + 22;
  const fontSize = 24;
  const fontWeight = 700;
  const cx = width / 2;
  const cy = height / 2;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  for (let degree = 0; degree < 360; degree += 30) {
    const drawDegree = direction * degree;
    const point = polar(cx, cy, labelRadius, drawDegree);

    ctx.save();
    ctx.translate(Math.round(point.x) + 0.5, Math.round(point.y) + 0.5);
    ctx.rotate(normalizeRotation(drawDegree));

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-36, -16, 72, 32);

    ctx.font = `${fontWeight} ${fontSize}px Segoe UI, Arial, Helvetica, sans-serif`;
    ctx.fillStyle = '#555555';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${degree}°`, 0, 0, 68);
    ctx.restore();
  }

  ctx.restore();
  return true;
}

export default function GannzillaExistingProtractorFontDoubleV343() {
  React.useEffect(() => {
    let disposed = false;
    const timers = new Set();

    const schedule = (delay) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        if (!disposed) drawExistingAnglesDoubleSize();
      }, delay);
      timers.add(timer);
    };

    const redraw = () => {
      schedule(0);
      schedule(140);
      schedule(320);
    };

    redraw();
    window.addEventListener('resize', redraw);
    window.addEventListener('gannzilla:ring-two-numbering-refresh', redraw);
    window.addEventListener('gannzilla:canonical-property-change-v326', redraw);
    document.addEventListener('input', redraw, true);
    document.addEventListener('change', redraw, true);

    window.GANNZILLA_EXISTING_PROTRACTOR_FONT_DOUBLE_V343 = true;
    window.__auditGannzillaExistingProtractorFontDoubleV343 = () => ({
      ok: Boolean(findWheelCanvas()),
      build: 343,
      existingAnglesOnly: true,
      angleStep: 30,
      oldFontPx: 12,
      newFontPx: 24,
      scale: 2,
      addedAngles: false,
      wheelGeometryChanged: false,
    });

    return () => {
      disposed = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener('resize', redraw);
      window.removeEventListener('gannzilla:ring-two-numbering-refresh', redraw);
      window.removeEventListener('gannzilla:canonical-property-change-v326', redraw);
      document.removeEventListener('input', redraw, true);
      document.removeEventListener('change', redraw, true);
      delete window.GANNZILLA_EXISTING_PROTRACTOR_FONT_DOUBLE_V343;
      delete window.__auditGannzillaExistingProtractorFontDoubleV343;
    };
  }, []);

  return null;
}
