const BUILD = 519;
const STATE_KEY = '__gannzillaZodiacOuterRingV519';
const GRID_STROKE = '#b5b5b5';
const CELL_FILL = '#ffffff';
const TWO_PI = Math.PI * 2;

const BASE_SEQUENCE = Object.freeze([
  Object.freeze({ text: 'نار الحمل', color: '#d71920' }),
  Object.freeze({ text: 'تراب الثور', color: '#0057c8' }),
  Object.freeze({ text: 'هواء الجوزاء', color: '#111111' }),
  Object.freeze({ text: 'ماء السرطان', color: '#d71920' }),
  Object.freeze({ text: 'نار الأسد', color: '#0057c8' }),
  Object.freeze({ text: 'تراب السنبلة', color: '#111111' }),
  Object.freeze({ text: 'هواء الميزان', color: '#d71920' }),
  Object.freeze({ text: 'ماء العقرب', color: '#0057c8' }),
  Object.freeze({ text: 'نار القوس', color: '#111111' }),
  Object.freeze({ text: 'تراب الجدي', color: '#d71920' }),
  Object.freeze({ text: 'هواء الدلو', color: '#0057c8' }),
  Object.freeze({ text: 'ماء الحوت', color: '#111111' }),
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

function boolParam(name, fallback = true) {
  const query = params();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

function findWheel() {
  const canvas = document.querySelector('canvas[data-gannzilla-final-wheel-authority-v506="true"]');
  return canvas instanceof HTMLCanvasElement && !canvas.closest('aside') ? canvas : null;
}

function validateContract() {
  const red = ZODIAC_SEQUENCE.filter((item) => item.color === '#d71920').length;
  const blue = ZODIAC_SEQUENCE.filter((item) => item.color === '#0057c8').length;
  const black = ZODIAC_SEQUENCE.filter((item) => item.color === '#111111').length;
  return ZODIAC_SEQUENCE.length === 36
    && ZODIAC_SEQUENCE[0].number === 1
    && ZODIAC_SEQUENCE[0].text === 'نار الحمل'
    && ZODIAC_SEQUENCE[0].color === '#d71920'
    && ZODIAC_SEQUENCE[35].number === 36
    && ZODIAC_SEQUENCE[35].text === 'ماء الحوت'
    && ZODIAC_SEQUENCE[35].color === '#111111'
    && red === 12
    && blue === 12
    && black === 12;
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

function applyZodiacOuterRing(source = 'apply') {
  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement)
      || !boolParam('zodiacOuterRing', true)
      || !validateContract()) return false;

  if (canvas.dataset.gannzillaEmptyOuterRingV518 !== 'true') return false;
  if (canvas.dataset.gannzillaZodiacOuterRingV519 === 'true'
      && canvas.dataset.gannzillaEmptyOuterRingBlankV518 === 'false') return true;

  const cssSize = Number(canvas.dataset.gannzillaCanvasCssSize || 0);
  const baseCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingBaseCssSizeV518 || 0);
  const ringWidth = Number(canvas.dataset.gannzillaEmptyOuterRingWidthV518 || 0);
  const divisions = Number(canvas.dataset.gannzillaEmptyOuterRingDivisionsV518 || 0);
  const dpr = Math.max(1, Number(canvas.dataset.gannzillaNativeDpr)
    || (cssSize > 0 ? canvas.width / cssSize : 0)
    || Number(window.devicePixelRatio)
    || 1);
  const appliedZoom = Math.max(0.5, Number(canvas.dataset.gannzillaAppliedZoom) || 1);
  const clockwise = boolParam('clockwise', true);

  if (!(cssSize > 0) || !(baseCssSize > 0) || !(ringWidth > 0) || divisions !== 36) return false;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return false;

  const cx = cssSize / 2;
  const cy = cssSize / 2;
  const direction = clockwise ? 1 : -1;
  const sector = 360 / 36;
  const margin = 90 * appliedZoom;
  const inner = Math.max(1, (baseCssSize - margin * 2) / 2);
  const outer = inner + ringWidth;
  const labelRadius = inner + ringWidth * 0.53;
  const fontSize = numberParam(
    'gannzillaZodiacFontSize',
    Math.max(9, Math.min(14, ringWidth * 0.22)),
    7,
    24,
  ) * appliedZoom;

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

  // Redraw exactly 36 clean cells before placing the authoritative labels.
  const northOffset = direction * sector / 2;
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
  ctx.strokeStyle = '#7a7a7a';
  ctx.lineWidth = 0.9;
  ctx.stroke();

  ctx.font = `700 ${fontSize}px "Noto Sans Arabic", "Segoe UI", Tahoma, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'rtl';

  ZODIAC_SEQUENCE.forEach((item, index) => {
    // Cell 1 is immediately clockwise from north; cell 36 closes at north.
    const centerDegrees = direction * (index + 1) * sector;
    const radians = ((centerDegrees - 90) * Math.PI) / 180;
    const x = cx + Math.cos(radians) * labelRadius;
    const y = cy + Math.sin(radians) * labelRadius;
    const rotation = readableRotation(centerDegrees);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.fillStyle = item.color;
    ctx.fillText(item.text, 0, 0);
    ctx.restore();
  });

  ctx.restore();

  canvas.dataset.gannzillaZodiacOuterRingV519 = 'true';
  canvas.dataset.gannzillaZodiacOuterRingBuildV519 = String(BUILD);
  canvas.dataset.gannzillaZodiacOuterRingCellCountV519 = '36';
  canvas.dataset.gannzillaZodiacOuterRingLabelCountV519 = '36';
  canvas.dataset.gannzillaZodiacOuterRingFirstV519 = '1:نار الحمل:red';
  canvas.dataset.gannzillaZodiacOuterRingLastV519 = '36:ماء الحوت:black';
  canvas.dataset.gannzillaZodiacOuterRingColorCountsV519 = 'red:12,blue:12,black:12';
  canvas.dataset.gannzillaEmptyOuterRingBlankV518 = 'false';
  canvas.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    cellCount: 36,
    labelCount: 36,
    first: { number: 1, text: 'نار الحمل', color: 'red' },
    last: { number: 36, text: 'ماء الحوت', color: 'black' },
    colorCounts: { red: 12, blue: 12, black: 12 },
    clockwise,
    contractPassed: true,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:zodiac-outer-ring-v519', { detail: lastApply }));
  return true;
}

function schedule(source = 'schedule') {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    if (!applyZodiacOuterRing(source)) {
      setTimeout(() => applyZodiacOuterRing(`${source}-retry`), 40);
    }
  });
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('emptyOuterRing', 'true');
    url.searchParams.set('emptyOuterRingCount', '1');
    url.searchParams.set('zodiacOuterRing', 'true');
    url.searchParams.set('zodiacSequence', '1-36');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime rendering remains authoritative.
  }
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !wheelMode()
      || window[STATE_KEY]) return;

  persistFlags();

  window.addEventListener('gannzilla:empty-outer-ring-v518', () => schedule('empty-ring-v518'), false);
  window.addEventListener('gannzilla:final-wheel-authority-v506', () => schedule('final-wheel-v506'), false);
  window.addEventListener('gannzilla:native-dpr-zoom-v504', () => schedule('native-zoom'), false);
  window.addEventListener('resize', () => schedule('resize'), false);

  [50, 140, 320, 760, 1700, 3600, 7200].forEach((delay) =>
    setTimeout(() => schedule(`boot-${delay}`), delay));

  window.GANNZILLA_ZODIAC_OUTER_RING_V519 = true;
  window.__auditGannzillaZodiacOuterRingV519 = () => {
    const canvas = findWheel();
    return {
      ok: canvas instanceof HTMLCanvasElement
        && validateContract()
        && canvas.dataset.gannzillaZodiacOuterRingV519 === 'true'
        && Number(canvas.dataset.gannzillaZodiacOuterRingCellCountV519) === 36
        && Number(canvas.dataset.gannzillaZodiacOuterRingLabelCountV519) === 36
        && canvas.dataset.gannzillaZodiacOuterRingFirstV519 === '1:نار الحمل:red'
        && canvas.dataset.gannzillaZodiacOuterRingLastV519 === '36:ماء الحوت:black',
      build: BUILD,
      contractPassed: validateContract(),
      cellCount: Number(canvas?.dataset?.gannzillaZodiacOuterRingCellCountV519 || 0),
      labelCount: Number(canvas?.dataset?.gannzillaZodiacOuterRingLabelCountV519 || 0),
      first: canvas?.dataset?.gannzillaZodiacOuterRingFirstV519 || null,
      last: canvas?.dataset?.gannzillaZodiacOuterRingLastV519 || null,
      colorCounts: canvas?.dataset?.gannzillaZodiacOuterRingColorCountsV519 || null,
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { schedule, applyZodiacOuterRing, sequence: ZODIAC_SEQUENCE };
}

install();
