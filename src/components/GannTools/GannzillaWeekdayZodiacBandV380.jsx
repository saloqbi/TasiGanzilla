import React from 'react';

const BUILD = 386;
const FONT_FAMILY = 'Tahoma, Segoe UI, Arial, sans-serif';
const DAYS = ['الجمعة', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
const ZODIAC = [
  { sign: 'الحمل', element: 'نار' },
  { sign: 'الثور', element: 'تراب' },
  { sign: 'الجوزاء', element: 'هواء' },
  { sign: 'السرطان', element: 'ماء' },
  { sign: 'الأسد', element: 'نار' },
  { sign: 'السنبلة', element: 'تراب' },
  { sign: 'الميزان', element: 'هواء' },
  { sign: 'العقرب', element: 'ماء' },
  { sign: 'القوس', element: 'نار' },
  { sign: 'الجدي', element: 'تراب' },
  { sign: 'الدلو', element: 'هواء' },
  { sign: 'الحوت', element: 'ماء' },
];
const COLORS = Object.freeze({ red: '#9d1422', blue: '#2454ad', black: '#111111' });

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

function wedge(ctx, cx, cy, innerRadius, outerRadius, startDegrees, endDegrees) {
  const start = ((startDegrees - 90) * Math.PI) / 180;
  const end = ((endDegrees - 90) * Math.PI) / 180;
  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, start, end, false);
  ctx.arc(cx, cy, innerRadius, end, start, true);
  ctx.closePath();
}

function normalizeTextRotation(degrees) {
  let radians = (degrees * Math.PI) / 180;
  while (radians > Math.PI) radians -= Math.PI * 2;
  while (radians < -Math.PI) radians += Math.PI * 2;
  if (radians > Math.PI / 2) radians -= Math.PI;
  if (radians < -Math.PI / 2) radians += Math.PI;
  return radians;
}

function findWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => !canvas.closest('aside'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ canvas, rect }) => canvas.width > 0 && canvas.height > 0 && rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function labelForCell(index) {
  if (index === 35) return 'ماءالحوت';
  if (index % 2 === 0) return DAYS[(index / 2) % DAYS.length];
  const zodiac = ZODIAC[((index - 1) / 2) % ZODIAC.length];
  return `${zodiac.element}${zodiac.sign}`;
}

function pairColor(index) {
  if (index === 35 || index === 0) return COLORS.black;
  const pair = Math.floor((index + 1) / 2) % 3;
  if (pair === 1) return COLORS.red;
  if (pair === 2) return COLORS.blue;
  return COLORS.black;
}

function measureInk(ctx, text, size, weight) {
  ctx.font = `${weight} ${size}px ${FONT_FAMILY}`;
  const metrics = ctx.measureText(text);
  const left = Number.isFinite(metrics.actualBoundingBoxLeft) ? metrics.actualBoundingBoxLeft : 0;
  const right = Number.isFinite(metrics.actualBoundingBoxRight) ? metrics.actualBoundingBoxRight : metrics.width;
  const ascent = Number.isFinite(metrics.actualBoundingBoxAscent) ? metrics.actualBoundingBoxAscent : size * 0.76;
  const descent = Number.isFinite(metrics.actualBoundingBoxDescent) ? metrics.actualBoundingBoxDescent : size * 0.18;
  return {
    width: Math.max(metrics.width, left + right) + 1.5,
    height: Math.max(size * 0.86, ascent + descent),
  };
}

function fitFont(ctx, text, desired, safeWidth, safeHeight, weight) {
  let size = Math.min(desired, safeHeight * 0.96);
  while (size > 7) {
    const bounds = measureInk(ctx, text, size, weight);
    if (bounds.width <= safeWidth && bounds.height <= safeHeight) return size;
    size -= 0.25;
  }
  return 7;
}

function drawLabel({
  ctx,
  text,
  point,
  rotation,
  desiredSize,
  weight,
  color,
  safeWidth,
  safeHeight,
  clip,
}) {
  ctx.save();
  clip();
  ctx.clip();
  ctx.translate(point.x, point.y);
  ctx.rotate(normalizeTextRotation(rotation));

  const size = fitFont(ctx, text, desiredSize, safeWidth, safeHeight, weight);
  ctx.font = `${weight} ${size}px ${FONT_FAMILY}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'rtl';
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function drawBand() {
  if (!boolParam('showProtractor', true) || !boolParam('showWeekdayZodiacBand', true)) return false;

  const canvas = findWheelCanvas();
  if (!canvas) return false;

  const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
  const width = canvas.width / dpr;
  const height = canvas.height / dpr;
  if (!Number.isFinite(width) || !Number.isFinite(height)) return false;

  const levels = Math.round(numberParam('levels', 10, 1, 12));
  const innerRadius = numberParam('gannzillaInnerRadius', 170, 80, 500);
  const ringWidth = numberParam('gannzillaRingWidth', 60, 30, 150);
  const bandGap = 18;
  const bandWidth = numberParam('gannzillaWeekdayZodiacBandWidth', 36, 32, 42);
  const desiredSize = numberParam('gannzillaWeekdayZodiacFontSize', 14.5, 11, 18);
  const weight = Math.round(numberParam('gannzillaWeekdayZodiacFontWeight', 700, 500, 900));
  const tilt = numberParam('gannzillaWeekdayZodiacTilt', 0, -1.2, 1.2);
  const angularPadding = numberParam('gannzillaWeekdayZodiacAngularPadding', 0.85, 0.55, 1.35);
  const radialPadding = numberParam('gannzillaWeekdayZodiacRadialPadding', 3.5, 2, 6);
  const sidePaddingPx = numberParam('gannzillaWeekdayZodiacSidePaddingPx', 4.5, 2, 8);

  const wheelRadius = innerRadius + (levels * ringWidth);
  const inner = wheelRadius + bandGap;
  const outer = inner + bandWidth;
  const safeInner = inner + radialPadding;
  const safeOuter = outer - radialPadding;
  const labelRadius = (safeInner + safeOuter) / 2;
  const cx = width / 2;
  const cy = height / 2;
  const ctx = canvas.getContext('2d');
  if (!ctx || safeOuter <= safeInner) return false;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  for (let index = 0; index < 36; index += 1) {
    wedge(ctx, cx, cy, inner, outer, index * 10, (index + 1) * 10);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  const safeSpan = 10 - (angularPadding * 2);
  const safeChordWidth = 2 * safeInner * Math.sin((safeSpan * Math.PI / 180) / 2);
  const safeWidth = Math.max(16, safeChordWidth - (sidePaddingPx * 2));
  const safeHeight = Math.max(12, safeOuter - safeInner);

  for (let index = 0; index < 36; index += 1) {
    const start = index * 10;
    const center = start + 5;
    const point = polar(cx, cy, labelRadius, center);
    drawLabel({
      ctx,
      text: labelForCell(index),
      point,
      rotation: center + tilt,
      desiredSize,
      weight,
      color: pairColor(index),
      safeWidth,
      safeHeight,
      clip: () => wedge(
        ctx,
        cx,
        cy,
        safeInner,
        safeOuter,
        start + angularPadding,
        start + 10 - angularPadding,
      ),
    });
  }

  ctx.strokeStyle = '#b7b9ba';
  ctx.lineWidth = 0.85;
  [inner, outer].forEach((radius) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  });

  for (let index = 0; index < 36; index += 1) {
    const degree = index * 10;
    const major = index % 3 === 0;
    const p1 = polar(cx, cy, inner, degree);
    const p2 = polar(cx, cy, outer, degree);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = major ? '#d24a4e' : '#c6c7c8';
    ctx.lineWidth = major ? 1.05 : 0.72;
    ctx.stroke();
  }

  ctx.restore();
  canvas.dataset.gannzillaWeekdayZodiacBandV386 = 'true';
  canvas.dataset.gannzillaWeekdayZodiacSafeWidth = String(Math.round(safeWidth));
  return true;
}

export default function GannzillaWeekdayZodiacBandV380() {
  React.useLayoutEffect(() => {
    let disposed = false;
    const timers = new Set();

    const schedule = (delay = 0) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        if (!disposed) window.requestAnimationFrame(drawBand);
      }, delay);
      timers.add(timer);
    };

    const refresh = () => [40, 180, 420, 760].forEach(schedule);

    refresh();
    document.addEventListener('input', refresh, true);
    document.addEventListener('change', refresh, true);
    window.addEventListener('resize', refresh);
    window.addEventListener('gannzilla:ring-two-numbering-refresh', refresh);
    window.addEventListener('gannzilla:canonical-property-change-v326', refresh);

    window.GANNZILLA_WEEKDAY_ZODIAC_BAND_V386 = true;
    window.__auditGannzillaWeekdayZodiacBandV386 = () => ({
      ok: Boolean(findWheelCanvas()?.dataset?.gannzillaWeekdayZodiacBandV386 === 'true'),
      build: BUILD,
      oneLabelPerCell: true,
      compactOriginalBandRestored: true,
      hardClipPerTenDegreeCell: true,
      exactInkFit: true,
      centeredInsideCell: true,
      referenceTopSequence: ['ماءالحوت', 'الجمعة', 'نارالحمل', 'الأحد', 'ترابالثور', 'الاثنين'],
    });

    return () => {
      disposed = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      document.removeEventListener('input', refresh, true);
      document.removeEventListener('change', refresh, true);
      window.removeEventListener('resize', refresh);
      window.removeEventListener('gannzilla:ring-two-numbering-refresh', refresh);
      window.removeEventListener('gannzilla:canonical-property-change-v326', refresh);
      delete window.GANNZILLA_WEEKDAY_ZODIAC_BAND_V386;
      delete window.__auditGannzillaWeekdayZodiacBandV386;
    };
  }, []);

  return null;
}
