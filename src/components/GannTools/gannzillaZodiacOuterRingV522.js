const BUILD = 522;
const STATE_KEY = '__gannzillaZodiacOuterRingV522';
const GRID_STROKE = '#b5b5b5';
const OUTER_STROKE = '#7a7a7a';
const CELL_FILL = '#ffffff';
const RED = '#d71920';
const BLUE = '#0057c8';
const BLACK = '#111111';
const TWO_PI = Math.PI * 2;

const BASE_SEQUENCE = Object.freeze([
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

const ZODIAC_SEQUENCE = Object.freeze(
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
  return ZODIAC_SEQUENCE.length === 36
    && ZODIAC_SEQUENCE[0].number === 1
    && ZODIAC_SEQUENCE[0].text === 'نار الحمل'
    && ZODIAC_SEQUENCE[0].color === RED
    && ZODIAC_SEQUENCE[35].number === 36
    && ZODIAC_SEQUENCE[35].text === 'ماء الحوت'
    && ZODIAC_SEQUENCE[35].color === BLACK
    && ZODIAC_SEQUENCE.filter((item) => item.color === RED).length === 12
    && ZODIAC_SEQUENCE.filter((item) => item.color === BLUE).length === 12
    && ZODIAC_SEQUENCE.filter((item) => item.color === BLACK).length === 12;
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

let applyCount = 0;
let lastApply = null;
let frame = 0;

function drawZodiacOuterRing(source = 'apply', force = false) {
  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement)
      || !boolParam('zodiacOuterRing', false)
      || !contractPassed()) return false;

  const divisions = Number(canvas.dataset.gannzillaEmptyOuterRingDivisionsV518 || 0);
  const baseCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingBaseCssSizeV518 || 0);
  const expandedCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518 || 0);
  const ringWidth = Number(canvas.dataset.gannzillaEmptyOuterRingWidthV518 || 0);
  const dpr = Math.max(1, Number(canvas.dataset.gannzillaNativeDpr)
    || (expandedCssSize > 0 ? canvas.width / expandedCssSize : 0)
    || Number(window.devicePixelRatio)
    || 1);
  const appliedZoom = Math.max(0.5, Number(canvas.dataset.gannzillaAppliedZoom) || 1);
  const clockwise = boolParam('clockwise', true);

  if (divisions !== 36 || !(baseCssSize > 0) || !(expandedCssSize > 0) || !(ringWidth > 0)) {
    return false;
  }

  const renderKey = [canvas.width, canvas.height, baseCssSize, expandedCssSize, ringWidth, clockwise].join(':');
  if (!force && canvas.dataset.gannzillaZodiacRenderKeyV522 === renderKey) return true;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return false;

  const cx = expandedCssSize / 2;
  const cy = expandedCssSize / 2;
  const sector = 360 / 36;
  const direction = clockwise ? 1 : -1;
  const northOffset = direction * sector / 2;
  const margin = 90 * appliedZoom;
  const inner = Math.max(1, (baseCssSize - margin * 2) / 2);
  const outer = inner + ringWidth;
  const labelRadius = inner + ringWidth * 0.52;
  const fontSize = numberParam('gannzillaZodiacFontSize', 13, 7, 24) * appliedZoom;

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

  // Repaint only the single outer ring so repeated calls never duplicate text.
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

  ZODIAC_SEQUENCE.forEach((item, index) => {
    // Cell 1 is immediately clockwise from north; cell 36 ends at north.
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

  canvas.dataset.gannzillaZodiacOuterRingV522 = 'true';
  canvas.dataset.gannzillaZodiacRenderKeyV522 = renderKey;
  canvas.dataset.gannzillaZodiacCellCountV522 = '36';
  canvas.dataset.gannzillaZodiacLabelCountV522 = '36';
  canvas.dataset.gannzillaZodiacFirstV522 = '1:نار الحمل:red';
  canvas.dataset.gannzillaZodiacLastV522 = '36:ماء الحوت:black';
  canvas.dataset.gannzillaZodiacColorCountsV522 = 'red:12,blue:12,black:12';
  canvas.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    cells: 36,
    labels: 36,
    first: { number: 1, text: 'نار الحمل', color: 'red' },
    last: { number: 36, text: 'ماء الحوت', color: 'black' },
    colorCounts: { red: 12, blue: 12, black: 12 },
    fontSize,
    clockwise,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:zodiac-outer-ring-v522', { detail: lastApply }));
  return true;
}

function schedule(source = 'schedule', force = false) {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => drawZodiacOuterRing(source, force));
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !wheelMode()
      || window[STATE_KEY]) return;

  const onOuterRing = () => drawZodiacOuterRing('empty-outer-ring-v518', true);
  window.addEventListener('gannzilla:empty-outer-ring-v518', onOuterRing, false);
  window.addEventListener('resize', () => schedule('resize'), false);

  [80, 220, 600, 1400, 3000].forEach((delay) =>
    setTimeout(() => schedule(`boot-${delay}`), delay));

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => schedule('fonts-ready', true)).catch(() => {});
  }

  window.GANNZILLA_ZODIAC_OUTER_RING_V522 = true;
  window.__auditGannzillaZodiacOuterRingV522 = () => {
    const canvas = findWheel();
    return {
      ok: canvas instanceof HTMLCanvasElement
        && contractPassed()
        && canvas.dataset.gannzillaZodiacOuterRingV522 === 'true'
        && Number(canvas.dataset.gannzillaZodiacCellCountV522) === 36
        && Number(canvas.dataset.gannzillaZodiacLabelCountV522) === 36
        && canvas.dataset.gannzillaZodiacFirstV522 === '1:نار الحمل:red'
        && canvas.dataset.gannzillaZodiacLastV522 === '36:ماء الحوت:black',
      build: BUILD,
      contractPassed: contractPassed(),
      cells: Number(canvas?.dataset?.gannzillaZodiacCellCountV522 || 0),
      labels: Number(canvas?.dataset?.gannzillaZodiacLabelCountV522 || 0),
      first: canvas?.dataset?.gannzillaZodiacFirstV522 || null,
      last: canvas?.dataset?.gannzillaZodiacLastV522 || null,
      colorCounts: canvas?.dataset?.gannzillaZodiacColorCountsV522 || null,
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { drawZodiacOuterRing, schedule, onOuterRing, sequence: ZODIAC_SEQUENCE };
}

install();
