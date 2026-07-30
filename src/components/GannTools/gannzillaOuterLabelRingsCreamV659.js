const BUILD = 659;
const STATE_KEY = '__gannzillaOuterLabelRingsCreamV659';
const ENABLE_PARAM = 'outerLabelRingsCream';
const COLOR_PARAM = 'outerLabelRingsCreamColor';
const DEFAULT_CREAM = '#f6ecd3';
const GRID_STROKE = '#b5b5b5';
const OUTER_STROKE = '#7a7a7a';
const RED = '#d71920';
const BLUE = '#0057c8';
const BLACK = '#111111';
const TWO_PI = Math.PI * 2;

const ZODIAC_BASE = Object.freeze([
  Object.freeze({ text: 'نار الحمل', color: RED }),
  Object.freeze({ text: 'تراب الثور', color: BLUE }),
  Object.freeze({ text: 'هواء الجوزاء', color: BLACK }),
  Object.freeze({ text: 'ماء السرطان', color: RED }),
  Object.freeze({ text: 'نار الأسد', color: BLUE }),
  Object.freeze({ text: 'تراب السنبلة', color: BLACK }),
  Object.freeze({ text: 'هواء الميزان', color: RED }),
  Object.freeze({ text: 'ماء العقرب', color: BLUE }),
  Object.freeze({ text: 'نار القوس', color: BLACK }),
  Object.freeze({ text: 'تراب الجدي', color: RED }),
  Object.freeze({ text: 'هواء الدلو', color: BLUE }),
  Object.freeze({ text: 'ماء الحوت', color: BLACK }),
]);

const WEEKDAY_BASE = Object.freeze([
  Object.freeze({ text: 'الأحد', color: RED }),
  Object.freeze({ text: 'الاثنين', color: BLUE }),
  Object.freeze({ text: 'الثلاثاء', color: BLACK }),
  Object.freeze({ text: 'الأربعاء', color: RED }),
  Object.freeze({ text: 'الخميس', color: BLUE }),
  Object.freeze({ text: 'الجمعة', color: BLACK }),
]);

const ZODIAC_SEQUENCE = Object.freeze(
  Array.from({ length: 36 }, (_, index) => ZODIAC_BASE[index % ZODIAC_BASE.length]),
);
const WEEKDAY_SEQUENCE = Object.freeze(
  Array.from({ length: 36 }, (_, index) => WEEKDAY_BASE[index % WEEKDAY_BASE.length]),
);

let frame = 0;
let timer = 0;
let applying = false;
let applyCount = 0;
let lastApply = null;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function boolParam(name, fallback = false) {
  const query = params();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function enabled() {
  const query = params();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  return wheelMode && boolParam(ENABLE_PARAM, false);
}

function validHex(value) {
  const text = String(value || '').trim();
  return /^#[0-9a-f]{6}$/i.test(text) ? text.toLowerCase() : DEFAULT_CREAM;
}

function creamColor() {
  return validHex(params().get(COLOR_PARAM));
}

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

function findWheel() {
  const canvas = document.querySelector('canvas[data-gannzilla-empty-outer-ring-v518="true"]');
  return canvas instanceof HTMLCanvasElement && !canvas.closest('aside') ? canvas : null;
}

function wedge(ctx, cx, cy, inner, outer, startDegrees, endDegrees) {
  const start = ((startDegrees - 90) * Math.PI) / 180;
  const end = ((endDegrees - 90) * Math.PI) / 180;
  const anticlockwise = endDegrees < startDegrees;
  ctx.beginPath();
  ctx.arc(cx, cy, outer, start, end, anticlockwise);
  ctx.arc(cx, cy, inner, end, start, !anticlockwise);
  ctx.closePath();
}

function readableRotation(angle) {
  const normalized = ((angle % 360) + 360) % 360;
  return normalized > 90 && normalized < 270 ? normalized + 180 : normalized;
}

function drawRing(ctx, geometry, sequence, fontSize, fill) {
  const {
    cx, cy, inner, outer, ringWidth, direction, northOffset, sector,
  } = geometry;
  const labelRadius = inner + ringWidth * 0.52;

  for (let index = 0; index < 36; index += 1) {
    const startDegrees = northOffset + direction * index * sector;
    const endDegrees = northOffset + direction * (index + 1) * sector;
    wedge(ctx, cx, cy, inner, outer, startDegrees, endDegrees);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = GRID_STROKE;
    ctx.lineWidth = 0.55;
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, outer, 0, TWO_PI);
  ctx.strokeStyle = OUTER_STROKE;
  ctx.lineWidth = 0.9;
  ctx.stroke();

  ctx.font = `700 ${fontSize}px "Noto Sans Arabic", "Segoe UI", Tahoma, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'rtl';

  sequence.forEach((item, index) => {
    const centerDegrees = northOffset + direction * (index + 0.5) * sector;
    const radians = ((centerDegrees - 90) * Math.PI) / 180;
    const x = cx + Math.cos(radians) * labelRadius;
    const y = cy + Math.sin(radians) * labelRadius;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((readableRotation(centerDegrees) * Math.PI) / 180);
    ctx.fillStyle = item.color;
    ctx.fillText(item.text, 0, 0);
    ctx.restore();
  });
}

function apply(source = 'apply') {
  frame = 0;
  if (!enabled() || applying) return false;

  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement)) return false;

  const divisions = Number(canvas.dataset.gannzillaEmptyOuterRingDivisionsV518 || 0);
  const emptyRingCount = Number(canvas.dataset.gannzillaEmptyOuterRingCountV518 || 0);
  const baseCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingBaseCssSizeV518 || 0);
  const expandedCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518 || 0);
  const ringWidth = Number(canvas.dataset.gannzillaEmptyOuterRingWidthV518 || 0);
  const dpr = Math.max(1, Number(canvas.dataset.gannzillaNativeDpr)
    || (expandedCssSize > 0 ? canvas.width / expandedCssSize : 0)
    || Number(window.devicePixelRatio)
    || 1);
  const zoom = Math.max(0.5, Number(canvas.dataset.gannzillaAppliedZoom) || 1);

  if (divisions !== 36
      || emptyRingCount < 2
      || !(baseCssSize > 0)
      || !(expandedCssSize > 0)
      || !(ringWidth > 0)) return false;

  const zodiacEnabled = boolParam('zodiacOuterRing', false);
  const weekdaysEnabled = boolParam('weekdaysOuterRing', false);
  if (!zodiacEnabled && !weekdaysEnabled) return false;

  const clockwise = boolParam('clockwise', true);
  const direction = clockwise ? 1 : -1;
  const sector = 10;
  const northOffset = direction * sector / 2;
  const margin = 90 * zoom;
  const zodiacInner = Math.max(1, (baseCssSize - margin * 2) / 2);
  const fill = creamColor();
  const zodiacFontSize = numberParam('gannzillaZodiacFontSize', 32, 7, 36) * zoom;
  const weekdayFontSize = numberParam(
    'gannzillaWeekdayFontSize',
    numberParam('gannzillaZodiacFontSize', 32, 7, 36),
    7,
    36,
  ) * zoom;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return false;

  applying = true;
  try {
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.setLineDash([]);
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (zodiacEnabled) {
      drawRing(ctx, {
        cx: expandedCssSize / 2,
        cy: expandedCssSize / 2,
        inner: zodiacInner,
        outer: zodiacInner + ringWidth,
        ringWidth,
        direction,
        northOffset,
        sector,
      }, ZODIAC_SEQUENCE, zodiacFontSize, fill);
    }

    if (weekdaysEnabled) {
      drawRing(ctx, {
        cx: expandedCssSize / 2,
        cy: expandedCssSize / 2,
        inner: zodiacInner + ringWidth,
        outer: zodiacInner + ringWidth * 2,
        ringWidth,
        direction,
        northOffset,
        sector,
      }, WEEKDAY_SEQUENCE, weekdayFontSize, fill);
    }

    ctx.restore();
    canvas.dataset.gannzillaOuterLabelRingsCreamV659 = 'true';
    canvas.dataset.gannzillaOuterLabelRingsCreamColorV659 = fill;
    canvas.dataset.gannzillaOuterLabelRingsCreamScopeV659 = 'zodiac-and-weekdays-only';
  } finally {
    applying = false;
  }

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    creamColor: fill,
    changedRings: ['zodiac', 'weekdays'],
    zodiacEnabled,
    weekdaysEnabled,
    wheelGeometryChanged: false,
    labelPositionsChanged: false,
    labelColorsChanged: false,
    clockChanged: false,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(schedule.timer);
  schedule.timer = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => apply(source));
  }, delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  [0, 100, 260, 700, 1600, 3400, 7200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  [
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:zodiac-outer-ring-v522',
    'gannzilla:weekdays-outer-ring-v523',
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:wheel-input-v459',
    'gannzilla:page-scrollbar-pan-v305',
  ].forEach((name) => window.addEventListener(name, () => schedule(name, 24), false));

  window.addEventListener('resize', () => schedule('window-resize', 40), false);
  timer = window.setInterval(() => schedule('cream-outer-ring-watch'), 1400);

  window.GANNZILLA_OUTER_LABEL_RINGS_CREAM_V659 = true;
  window.__auditGannzillaOuterLabelRingsCreamV659 = () => {
    const canvas = findWheel();
    return {
      ok: enabled()
        && canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaOuterLabelRingsCreamV659 === 'true'
        && canvas.dataset.gannzillaOuterLabelRingsCreamColorV659 === creamColor()
        && canvas.dataset.gannzillaOuterLabelRingsCreamScopeV659 === 'zodiac-and-weekdays-only',
      build: BUILD,
      creamColor: creamColor(),
      changedRings: ['zodiac', 'weekdays'],
      wheelGeometryChanged: false,
      labelPositionsChanged: false,
      labelColorsChanged: false,
      clockChanged: false,
      applyCount,
      timerActive: Boolean(timer),
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule };
  schedule('install');
}

install();
