import React from 'react';

const BUILD = 387;
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
const COLORS = Object.freeze({ red: '#981624', blue: '#2855aa', black: '#111111' });

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
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0] || null;
}

function labelForCell(index) {
  if (index === 35) return 'ماء الحوت';
  if (index % 2 === 0) return DAYS[(index / 2) % DAYS.length];
  const zodiac = ZODIAC[((index - 1) / 2) % ZODIAC.length];
  return `${zodiac.element} ${zodiac.sign}`;
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
  const width = Number.isFinite(metrics.actualBoundingBoxLeft) && Number.isFinite(metrics.actualBoundingBoxRight)
    ? metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight
    : metrics.width;
  const height = Number.isFinite(metrics.actualBoundingBoxAscent) && Number.isFinite(metrics.actualBoundingBoxDescent)
    ? metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
    : size;
  return {
    width: Math.max(metrics.width, width) + (size * 0.08),
    height: Math.max(height, size * 0.86),
  };
}

function fitFont(ctx, text, desired, safeWidth, safeHeight, weight) {
  let size = Math.min(desired, safeHeight * 0.94);
  while (size > 7) {
    const bounds = measureInk(ctx, text, size, weight);
    if (bounds.width <= safeWidth && bounds.height <= safeHeight) return size;
    size -= 0.25;
  }
  return 7;
}

function drawLabel({ ctx, text, point, rotation, desiredSize, weight, color, safeWidth, safeHeight, clip }) {
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

  const found = findWheelCanvas();
  if (!found) return false;
  const { canvas, rect } = found;

  const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
  const logicalWidth = canvas.width / dpr;
  const logicalHeight = canvas.height / dpr;
  if (!Number.isFinite(logicalWidth) || !Number.isFinite(logicalHeight) || rect.width <= 0) return false;

  // The wheel canvas is displayed smaller than its backing resolution. Compensate so
  // the text is the requested visible size on screen, not a tiny backing-canvas size.
  const displayScale = clamp(logicalWidth / rect.width, 0.75, 4);

  const levels = Math.round(numberParam('levels', 10, 1, 12));
  const innerRadius = numberParam('gannzillaInnerRadius', 170, 80, 500);
  const ringWidth = numberParam('gannzillaRingWidth', 60, 30, 150);
  const bandGap = 18;

  const visibleBandWidth = numberParam('gannzillaWeekdayZodiacBandWidth', 34, 28, 42);
  const visibleFontSize = numberParam('gannzillaWeekdayZodiacFontSize', 17, 13, 21);
  const weight = Math.round(numberParam('gannzillaWeekdayZodiacFontWeight', 700, 500, 900));
  const tilt = numberParam('gannzillaWeekdayZodiacTilt', 0, -1.2, 1.2);
  const angularPadding = numberParam('gannzillaWeekdayZodiacAngularPadding', 0.75, 0.45, 1.25);
  const visibleRadialPadding = numberParam('gannzillaWeekdayZodiacRadialPadding', 3, 2, 6);
  const visibleSidePadding = numberParam('gannzillaWeekdayZodiacSidePaddingPx', 5, 2, 9);

  const bandWidth = visibleBandWidth * displayScale;
  const desiredSize = visibleFontSize * displayScale;
  const radialPadding = visibleRadialPadding * displayScale;
  const sidePadding = visibleSidePadding * displayScale;

  const wheelRadius = innerRadius + (levels * ringWidth);
  const inner = wheelRadius + bandGap;
  const outer = inner + bandWidth;
  const safeInner = inner + radialPadding;
  const safeOuter = outer - radialPadding;
  const labelRadius = (safeInner + safeOuter) / 2;
  const cx = logicalWidth / 2;
  const cy = logicalHeight / 2;
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
  const safeWidth = Math.max(16 * displayScale, safeChordWidth - (sidePadding * 2));
  const safeHeight = Math.max(12 * displayScale, safeOuter - safeInner);

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

  // Draw the frame last so every phrase is visibly enclosed by its own cell.
  ctx.strokeStyle = '#b7b9ba';
  ctx.lineWidth = Math.max(0.85, displayScale * 0.55);
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
    ctx.lineWidth = major ? Math.max(1.05, displayScale * 0.7) : Math.max(0.72, displayScale * 0.42);
    ctx.stroke();
  }

  ctx.restore();
  canvas.dataset.gannzillaWeekdayZodiacBandV380 = 'true';
  canvas.dataset.gannzillaWeekdayZodiacBandV387 = 'true';
  canvas.dataset.gannzillaWeekdayZodiacDisplayScale = displayScale.toFixed(3);
  canvas.dataset.gannzillaWeekdayZodiacVisibleFontPx = String(visibleFontSize);
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

    window.GANNZILLA_WEEKDAY_ZODIAC_BAND_V387 = true;
    window.__auditGannzillaWeekdayZodiacBandV387 = () => {
      const found = findWheelCanvas();
      const canvas = found?.canvas;
      return {
        ok: Boolean(canvas?.dataset?.gannzillaWeekdayZodiacBandV387 === 'true'),
        build: BUILD,
        oneLabelPerCell: true,
        visibleScaleCompensation: true,
        strictCellClip: true,
        bordersRedrawnAboveText: true,
        displayedFontPx: numberParam('gannzillaWeekdayZodiacFontSize', 17, 13, 21),
        referenceTopSequence: ['ماء الحوت', 'الجمعة', 'نار الحمل', 'الأحد', 'تراب الثور', 'الاثنين'],
      };
    };

    return () => {
      disposed = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      document.removeEventListener('input', refresh, true);
      document.removeEventListener('change', refresh, true);
      window.removeEventListener('resize', refresh);
      window.removeEventListener('gannzilla:ring-two-numbering-refresh', refresh);
      window.removeEventListener('gannzilla:canonical-property-change-v326', refresh);
      delete window.GANNZILLA_WEEKDAY_ZODIAC_BAND_V387;
      delete window.__auditGannzillaWeekdayZodiacBandV387;
    };
  }, []);

  return null;
}
