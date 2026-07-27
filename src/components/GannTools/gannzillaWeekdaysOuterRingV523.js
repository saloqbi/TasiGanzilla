const BUILD = 523;
const STATE_KEY = '__gannzillaWeekdaysOuterRingV523';
const GRID_STROKE = '#b5b5b5';
const OUTER_STROKE = '#7a7a7a';
const CELL_FILL = '#ffffff';
const RED = '#d71920';
const BLUE = '#0057c8';
const BLACK = '#111111';
const TWO_PI = Math.PI * 2;

const BASE_SEQUENCE = Object.freeze([
  Object.freeze({ text: 'الأحد', color: RED }),
  Object.freeze({ text: 'الاثنين', color: BLUE }),
  Object.freeze({ text: 'الثلاثاء', color: BLACK }),
  Object.freeze({ text: 'الأربعاء', color: RED }),
  Object.freeze({ text: 'الخميس', color: BLUE }),
  Object.freeze({ text: 'الجمعة', color: BLACK }),
]);

const WEEKDAY_SEQUENCE = Object.freeze(
  Array.from({ length: 36 }, (_, index) => Object.freeze({
    number: index + 1,
    ...BASE_SEQUENCE[index % BASE_SEQUENCE.length],
  })),
);

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function boolParam(name, fallback = false) {
  const query = params();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

function findWheel() {
  const canvas = document.querySelector('canvas[data-gannzilla-empty-outer-ring-v518="true"]');
  return canvas instanceof HTMLCanvasElement && !canvas.closest('aside') ? canvas : null;
}

function contractPassed() {
  return WEEKDAY_SEQUENCE.length === 36
    && WEEKDAY_SEQUENCE[0].number === 1
    && WEEKDAY_SEQUENCE[0].text === 'الأحد'
    && WEEKDAY_SEQUENCE[0].color === RED
    && WEEKDAY_SEQUENCE[35].number === 36
    && WEEKDAY_SEQUENCE[35].text === 'الجمعة'
    && WEEKDAY_SEQUENCE[35].color === BLACK
    && WEEKDAY_SEQUENCE.filter((item) => item.color === RED).length === 12
    && WEEKDAY_SEQUENCE.filter((item) => item.color === BLUE).length === 12
    && WEEKDAY_SEQUENCE.filter((item) => item.color === BLACK).length === 12;
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

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('emptyOuterRing', 'true');
    url.searchParams.set('emptyOuterRingCount', '2');
    url.searchParams.set('zodiacOuterRing', 'true');
    url.searchParams.set('weekdaysOuterRing', 'true');
    url.searchParams.set('weekdaySequence', '1-36');
    if (!url.searchParams.has('gannzillaWeekdayFontSize')) {
      url.searchParams.set(
        'gannzillaWeekdayFontSize',
        url.searchParams.get('gannzillaZodiacFontSize') || '32',
      );
    }
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime rendering remains authoritative.
  }
}

let applyCount = 0;
let lastApply = null;
let frame = 0;

function drawWeekdaysOuterRing(source = 'apply', force = false) {
  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement)
      || !boolParam('weekdaysOuterRing', false)
      || !contractPassed()) return false;

  const divisions = Number(canvas.dataset.gannzillaEmptyOuterRingDivisionsV518 || 0);
  const emptyRingCount = Number(canvas.dataset.gannzillaEmptyOuterRingCountV518 || 0);
  const baseCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingBaseCssSizeV518 || 0);
  const expandedCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518 || 0);
  const ringWidth = Number(canvas.dataset.gannzillaEmptyOuterRingWidthV518 || 0);
  const dpr = Math.max(1, Number(canvas.dataset.gannzillaNativeDpr)
    || (expandedCssSize > 0 ? canvas.width / expandedCssSize : 0)
    || Number(window.devicePixelRatio)
    || 1);
  const appliedZoom = Math.max(0.5, Number(canvas.dataset.gannzillaAppliedZoom) || 1);
  const clockwise = boolParam('clockwise', true);
  const zodiacFontSize = numberParam('gannzillaZodiacFontSize', 32, 7, 36);
  const requestedFontSize = numberParam('gannzillaWeekdayFontSize', zodiacFontSize, 7, 36);

  if (divisions !== 36
      || emptyRingCount < 2
      || !(baseCssSize > 0)
      || !(expandedCssSize > 0)
      || !(ringWidth > 0)) return false;

  const renderKey = [
    canvas.width,
    canvas.height,
    baseCssSize,
    expandedCssSize,
    ringWidth,
    clockwise,
    requestedFontSize,
  ].join(':');
  if (!force && canvas.dataset.gannzillaWeekdayRenderKeyV523 === renderKey) return true;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return false;

  const cx = expandedCssSize / 2;
  const cy = expandedCssSize / 2;
  const sector = 360 / 36;
  const direction = clockwise ? 1 : -1;
  const northOffset = direction * sector / 2;
  const margin = 90 * appliedZoom;
  const zodiacInner = Math.max(1, (baseCssSize - margin * 2) / 2);
  const inner = zodiacInner + ringWidth;
  const outer = inner + ringWidth;
  const labelRadius = inner + ringWidth * 0.52;
  const fontSize = requestedFontSize * appliedZoom;

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

  for (let index = 0; index < 36; index += 1) {
    const startDegrees = northOffset + direction * index * sector;
    const endDegrees = northOffset + direction * (index + 1) * sector;
    wedge(ctx, cx, cy, inner, outer, startDegrees, endDegrees);
    ctx.fillStyle = CELL_FILL;
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

  WEEKDAY_SEQUENCE.forEach((item, index) => {
    // Cell 1 is clockwise from north; cell 36 closes at north.
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

  ctx.restore();

  canvas.dataset.gannzillaWeekdaysOuterRingV523 = 'true';
  canvas.dataset.gannzillaWeekdayRenderKeyV523 = renderKey;
  canvas.dataset.gannzillaWeekdayCellCountV523 = '36';
  canvas.dataset.gannzillaWeekdayLabelCountV523 = '36';
  canvas.dataset.gannzillaWeekdayFirstV523 = '1:الأحد:red';
  canvas.dataset.gannzillaWeekdayLastV523 = '36:الجمعة:black';
  canvas.dataset.gannzillaWeekdayColorCountsV523 = 'red:12,blue:12,black:12';
  canvas.dataset.gannzillaWeekdayFontSizeV523 = String(requestedFontSize);
  canvas.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    cells: 36,
    labels: 36,
    first: { number: 1, text: 'الأحد', color: 'red' },
    last: { number: 36, text: 'الجمعة', color: 'black' },
    colorCounts: { red: 12, blue: 12, black: 12 },
    fontSize: requestedFontSize,
    clockwise,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:weekdays-outer-ring-v523', { detail: lastApply }));
  return true;
}

function schedule(source = 'schedule', force = false, delay = 0) {
  window.clearTimeout(schedule.timer);
  schedule.timer = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => drawWeekdaysOuterRing(source, force));
  }, delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !wheelMode()
      || window[STATE_KEY]) return;

  persistFlags();

  window.addEventListener('gannzilla:zodiac-outer-ring-v522', () => {
    schedule('zodiac-outer-ring-v522', true);
  }, false);
  window.addEventListener('gannzilla:empty-outer-ring-v518', () => {
    schedule('empty-outer-ring-v518', true, 20);
  }, false);
  window.addEventListener('resize', () => schedule('resize'), false);

  [120, 320, 800, 1800, 3800, 7600].forEach((delay) =>
    window.setTimeout(() => schedule(`boot-${delay}`, true), delay));

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => schedule('fonts-ready', true)).catch(() => {});
  }

  window.GANNZILLA_WEEKDAYS_OUTER_RING_V523 = true;
  window.__auditGannzillaWeekdaysOuterRingV523 = () => {
    const canvas = findWheel();
    return {
      ok: canvas instanceof HTMLCanvasElement
        && contractPassed()
        && canvas.dataset.gannzillaWeekdaysOuterRingV523 === 'true'
        && Number(canvas.dataset.gannzillaWeekdayCellCountV523) === 36
        && Number(canvas.dataset.gannzillaWeekdayLabelCountV523) === 36
        && canvas.dataset.gannzillaWeekdayFirstV523 === '1:الأحد:red'
        && canvas.dataset.gannzillaWeekdayLastV523 === '36:الجمعة:black',
      build: BUILD,
      contractPassed: contractPassed(),
      cells: Number(canvas?.dataset?.gannzillaWeekdayCellCountV523 || 0),
      labels: Number(canvas?.dataset?.gannzillaWeekdayLabelCountV523 || 0),
      first: canvas?.dataset?.gannzillaWeekdayFirstV523 || null,
      last: canvas?.dataset?.gannzillaWeekdayLastV523 || null,
      colorCounts: canvas?.dataset?.gannzillaWeekdayColorCountsV523 || null,
      fontSize: Number(canvas?.dataset?.gannzillaWeekdayFontSizeV523 || 0),
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { drawWeekdaysOuterRing, schedule, sequence: WEEKDAY_SEQUENCE };
}

install();