import React from 'react';

const BUILD = 383;
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
const PAIR_COLORS = Object.freeze({ red: '#9f1724', blue: '#315ab6', black: '#151515' });

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

function pairColor(index) {
  if (index === 35 || index === 0) return PAIR_COLORS.black;
  const pair = Math.floor((index + 1) / 2) % 3;
  if (pair === 1) return PAIR_COLORS.red;
  if (pair === 2) return PAIR_COLORS.blue;
  return PAIR_COLORS.black;
}

function labelForCell(index) {
  if (index === 35) return 'ماء الحوت';
  if (index % 2 === 0) return DAYS[(index / 2) % DAYS.length];
  const zodiac = ZODIAC[((index - 1) / 2) % ZODIAC.length];
  return `${zodiac.element} ${zodiac.sign}`;
}

function fittedFontSize(ctx, text, requestedSize, minSize, safeWidth, fontWeight) {
  let size = requestedSize;
  while (size > minSize) {
    ctx.font = `italic ${fontWeight} ${size}px ${FONT_FAMILY}`;
    if (ctx.measureText(text).width <= safeWidth) break;
    size -= 0.5;
  }
  return size;
}

function drawContainedLabel({
  ctx,
  text,
  x,
  y,
  rotationDegrees,
  requestedFontSize,
  minimumFontSize,
  fontWeight,
  color,
  safeTextWidth,
  clipPath,
}) {
  ctx.save();
  clipPath();
  ctx.clip();
  ctx.translate(x, y);
  ctx.rotate(normalizeTextRotation(rotationDegrees));

  const actualFontSize = fittedFontSize(
    ctx,
    text,
    requestedFontSize,
    minimumFontSize,
    safeTextWidth,
    fontWeight,
  );

  ctx.font = `italic ${fontWeight} ${actualFontSize}px ${FONT_FAMILY}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'rtl';
  ctx.shadowColor = 'rgba(255,255,255,.96)';
  ctx.shadowBlur = 1;
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function drawWeekdayZodiacBand() {
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
  const bandWidth = numberParam('gannzillaWeekdayZodiacBandWidth', 42, 38, 48);
  const requestedFontSize = numberParam('gannzillaWeekdayZodiacFontSize', 20, 16, 24);
  const minimumFontSize = numberParam('gannzillaWeekdayZodiacMinFontSize', 13, 11, 18);
  const fontWeight = Math.round(numberParam('gannzillaWeekdayZodiacFontWeight', 700, 500, 900));
  const italicTilt = numberParam('gannzillaWeekdayZodiacTilt', 1.5, -5, 5);
  const angularPadding = numberParam('gannzillaWeekdayZodiacAngularPadding', 2.05, 1.6, 2.6);
  const radialPadding = numberParam('gannzillaWeekdayZodiacRadialPadding', 4, 2, 7);
  const widthSafety = numberParam('gannzillaWeekdayZodiacWidthSafety', 0.86, 0.72, 0.92);

  const wheelRadius = innerRadius + (levels * ringWidth);
  const inner = wheelRadius + bandGap;
  const outer = inner + bandWidth;
  const labelRadius = inner + (bandWidth * 0.50);
  const cx = width / 2;
  const cy = height / 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  for (let index = 0; index < 36; index += 1) {
    wedge(ctx, cx, cy, inner, outer, index * 10, (index + 1) * 10);
    ctx.fillStyle = index % 2 === 0 ? '#fffefb' : '#faf8f2';
    ctx.fill();
  }

  ctx.strokeStyle = '#bfc3c5';
  ctx.lineWidth = 1;
  [inner, outer].forEach((radius) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  });

  const safeAngularSpan = 10 - (angularPadding * 2);
  const safeChordWidth = 2 * labelRadius * Math.sin((safeAngularSpan * Math.PI / 180) / 2);
  const safeTextWidth = Math.max(38, safeChordWidth * widthSafety);

  for (let index = 0; index < 36; index += 1) {
    const boundaryDegree = index * 10;
    const major = index % 3 === 0;
    const p1 = polar(cx, cy, major ? inner - 2 : inner, boundaryDegree);
    const p2 = polar(cx, cy, major ? outer + 4 : outer, boundaryDegree);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = major ? '#d64848' : '#c5c7c8';
    ctx.lineWidth = major ? 1.15 : 0.72;
    ctx.stroke();

    const centerDegree = boundaryDegree + 5;
    const point = polar(cx, cy, labelRadius, centerDegree);
    drawContainedLabel({
      ctx,
      text: labelForCell(index),
      x: point.x,
      y: point.y,
      rotationDegrees: centerDegree + italicTilt,
      requestedFontSize,
      minimumFontSize,
      fontWeight,
      color: pairColor(index),
      safeTextWidth,
      clipPath: () => wedge(
        ctx,
        cx,
        cy,
        inner + radialPadding,
        outer - radialPadding,
        boundaryDegree + angularPadding,
        boundaryDegree + 10 - angularPadding,
      ),
    });
  }

  ctx.restore();
  canvas.dataset.gannzillaWeekdayZodiacBandV383 = 'true';
  canvas.dataset.gannzillaWeekdayZodiacSafeTextWidth = String(Math.round(safeTextWidth));
  return true;
}

export default function GannzillaWeekdayZodiacBandV380() {
  React.useLayoutEffect(() => {
    let disposed = false;
    const timers = new Set();

    const schedule = (delay = 0) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        if (!disposed) window.requestAnimationFrame(drawWeekdayZodiacBand);
      }, delay);
      timers.add(timer);
    };

    const refresh = () => {
      [40, 180, 420, 760].forEach(schedule);
    };

    refresh();
    document.addEventListener('input', refresh, true);
    document.addEventListener('change', refresh, true);
    window.addEventListener('resize', refresh);
    window.addEventListener('gannzilla:ring-two-numbering-refresh', refresh);
    window.addEventListener('gannzilla:canonical-property-change-v326', refresh);

    window.GANNZILLA_WEEKDAY_ZODIAC_BAND_V383 = true;
    window.__auditGannzillaWeekdayZodiacBandV383 = () => ({
      ok: Boolean(findWheelCanvas()?.dataset?.gannzillaWeekdayZodiacBandV383 === 'true'),
      build: BUILD,
      sectors: 36,
      oneLabelPerCell: true,
      strictCellContainment: true,
      angularPaddingDegrees: numberParam('gannzillaWeekdayZodiacAngularPadding', 2.05, 1.6, 2.6),
      radialPaddingPx: numberParam('gannzillaWeekdayZodiacRadialPadding', 4, 2, 7),
      dynamicFontFitApplied: true,
      fillTextHorizontalCompressionDisabled: true,
      referenceTopSequence: ['ماء الحوت', 'الجمعة', 'نار الحمل', 'الأحد', 'تراب الثور', 'الاثنين'],
      wheelGeometryChanged: false,
    });

    return () => {
      disposed = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      document.removeEventListener('input', refresh, true);
      document.removeEventListener('change', refresh, true);
      window.removeEventListener('resize', refresh);
      window.removeEventListener('gannzilla:ring-two-numbering-refresh', refresh);
      window.removeEventListener('gannzilla:canonical-property-change-v326', refresh);
      delete window.GANNZILLA_WEEKDAY_ZODIAC_BAND_V383;
      delete window.__auditGannzillaWeekdayZodiacBandV383;
    };
  }, []);

  return null;
}
