import React from 'react';

const BUILD = 380;
const FONT_FAMILY = 'Tahoma, Segoe UI, Arial, sans-serif';
const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
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
const CELL_COLORS = ['#a10f1f', '#1457d9', '#111111'];

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

function findWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => !canvas.closest('aside'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ canvas, rect }) => canvas.width > 0 && canvas.height > 0 && rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function drawText(ctx, text, x, y, fontSize, fontWeight, color) {
  ctx.save();
  ctx.font = `${fontWeight} ${fontSize}px ${FONT_FAMILY}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'rtl';
  ctx.fillText(text, x, y);
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
  const bandWidth = 34;
  const signFontSize = numberParam('gannzillaZodiacFontSize', 10.5, 8, 15);
  const dayFontSize = numberParam('gannzillaWeekdayFontSize', 10.5, 8, 15);
  const wheelRadius = innerRadius + (levels * ringWidth);
  const inner = wheelRadius + bandGap;
  const outer = inner + bandWidth;
  const signRadius = inner + 9.5;
  const dayRadius = inner + 24.5;
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
    ctx.fillStyle = index % 2 === 0 ? '#fffefa' : '#faf9f4';
    ctx.fill();
  }

  ctx.strokeStyle = '#c7c7c7';
  ctx.lineWidth = 1;
  [inner, outer].forEach((radius) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  });

  for (let index = 0; index < 36; index += 1) {
    const boundaryDegree = index * 10;
    const major = index % 3 === 0;
    const p1 = polar(cx, cy, major ? inner - 2 : inner, boundaryDegree);
    const p2 = polar(cx, cy, major ? outer + 5 : outer, boundaryDegree);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = major ? '#d84a4a' : '#c9c9c9';
    ctx.lineWidth = major ? 1.2 : 0.75;
    ctx.stroke();

    const centerDegree = boundaryDegree + 5;
    const zodiac = ZODIAC[index % ZODIAC.length];
    const day = DAYS[index % DAYS.length];
    const color = CELL_COLORS[index % CELL_COLORS.length];
    const signPoint = polar(cx, cy, signRadius, centerDegree);
    const dayPoint = polar(cx, cy, dayRadius, centerDegree);

    drawText(ctx, `${zodiac.element} ${zodiac.sign}`, signPoint.x, signPoint.y, signFontSize, 800, color);
    drawText(ctx, day, dayPoint.x, dayPoint.y, dayFontSize, 700, color);
  }

  ctx.restore();
  canvas.dataset.gannzillaWeekdayZodiacBandV380 = 'true';
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

    window.GANNZILLA_WEEKDAY_ZODIAC_BAND_V380 = true;
    window.__auditGannzillaWeekdayZodiacBandV380 = () => ({
      ok: Boolean(findWheelCanvas()?.dataset?.gannzillaWeekdayZodiacBandV380 === 'true'),
      build: BUILD,
      sectors: 36,
      zodiacCycle: 12,
      weekdayCycle: 6,
      saturdayIntentionallyOmittedToMatchReference: true,
      firstSector: { degreeRange: '0-10', day: 'الأحد', label: 'نار الحمل' },
      lastSector: { degreeRange: '350-360', day: 'الجمعة', label: 'ماء الحوت' },
      horizontalArabicLabels: true,
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
      delete window.GANNZILLA_WEEKDAY_ZODIAC_BAND_V380;
      delete window.__auditGannzillaWeekdayZodiacBandV380;
    };
  }, []);

  return null;
}
