const BUILD = 658;
const STATE_KEY = '__gannzillaInnerNumberRingsCreamV658';
const ENABLE_PARAM = 'innerNumberRingsCream';
const COLOR_PARAM = 'innerNumberRingsCreamColor';
const DEFAULT_CREAM = '#f6ecd3';
const GRID_STROKE = '#b5b5b5';
const RED_NUMBER_COLOR = '#a51d2d';
const BLUE_NUMBER_COLOR = '#003f9e';
const BLACK_NUMBER_COLOR = '#111111';
const NUMBER_FONT_FAMILY = 'Arial, "Helvetica Neue", Helvetica, Tahoma, sans-serif';
const NUMBER_FONT_SIZE = 28;
const NUMBER_FONT_WEIGHT = 700;
const TWO_PI = Math.PI * 2;

let frame = 0;
let timer = 0;
let applying = false;
let applyCount = 0;
let lastApply = null;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function enabled() {
  const query = params();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  const value = String(query.get(ENABLE_PARAM) || '').toLowerCase();
  return wheelMode && ['true', '1', 'yes', 'on'].includes(value);
}

function validHex(value) {
  const text = String(value || '').trim();
  return /^#[0-9a-f]{6}$/i.test(text) ? text.toLowerCase() : DEFAULT_CREAM;
}

function creamColor() {
  return validHex(params().get(COLOR_PARAM));
}

function numberValue(name, fallback) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? value : fallback;
}

function booleanValue(name, fallback) {
  const query = params();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function findWheel() {
  const preferred = document.querySelector('canvas[data-gannzilla-final-wheel-authority-v506="true"]');
  if (preferred instanceof HTMLCanvasElement && !preferred.closest('aside')) return preferred;
  return null;
}

function polar(cx, cy, radius, degrees) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
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

function digitalRoot(value) {
  const integer = Math.abs(Math.trunc(Number(value) || 0));
  return integer === 0 ? 0 : 1 + ((integer - 1) % 9);
}

function numberColor(value) {
  const root = digitalRoot(value);
  if (root === 1 || root === 4 || root === 7) return RED_NUMBER_COLOR;
  if (root === 2 || root === 5 || root === 8) return BLUE_NUMBER_COLOR;
  return BLACK_NUMBER_COLOR;
}

function drawNumber(ctx, value, x, y, dpr, zoom) {
  const snappedX = Math.round(x * dpr) / dpr;
  const snappedY = Math.round(y * dpr) / dpr;
  ctx.save();
  ctx.font = `${NUMBER_FONT_WEIGHT} ${Math.max(10, NUMBER_FONT_SIZE * zoom)}px ${NUMBER_FONT_FAMILY}`;
  ctx.fillStyle = numberColor(value);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(value), snappedX, snappedY);
  ctx.restore();
}

function apply(source = 'apply') {
  frame = 0;
  if (!enabled() || applying) return false;

  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement)) return false;

  const dpr = Math.max(1, Number(canvas.dataset.gannzillaNativeDpr) || Number(window.devicePixelRatio) || 1);
  const zoom = Math.max(0.5, Number(canvas.dataset.gannzillaAppliedZoom) || 1);
  const cssSize = Number(canvas.dataset.gannzillaCanvasCssSize) || (canvas.width / dpr);
  const divisions = Math.max(3, Math.round(numberValue('divisions', 36)));
  const originalInnerRadius = numberValue('gannzillaInnerRadius', 170);
  const ringWidth = numberValue('gannzillaRingWidth', 60);
  const clockwise = booleanValue('clockwise', true);
  const direction = clockwise ? 1 : -1;
  const sector = 360 / divisions;
  const northOffset = direction * sector / 2;
  const adjustedInner = Math.max(20, originalInnerRadius - ringWidth) * zoom;
  const adjustedRingWidth = ringWidth * zoom;
  const cx = cssSize / 2;
  const cy = cssSize / 2;
  const fill = creamColor();
  const ctx = canvas.getContext('2d');
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

    for (let ring = 1; ring <= 2; ring += 1) {
      const inner = adjustedInner + (ring - 1) * adjustedRingWidth;
      const outer = inner + adjustedRingWidth;
      const midRadius = inner + adjustedRingWidth / 2;

      for (let index = 0; index < divisions; index += 1) {
        const startDegrees = northOffset + direction * index * sector;
        const endDegrees = northOffset + direction * (index + 1) * sector;
        const centerDegrees = northOffset + direction * (index + 0.5) * sector;

        wedge(ctx, cx, cy, inner, outer, startDegrees, endDegrees);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = GRID_STROKE;
        ctx.lineWidth = 0.55;
        ctx.stroke();

        const point = polar(cx, cy, midRadius, centerDegrees);
        const shownValue = ring === 1 ? index + 1 : digitalRoot(index + 1);
        drawNumber(ctx, shownValue, point.x, point.y, dpr, zoom);
      }
    }

    ctx.restore();
    canvas.dataset.gannzillaInnerNumberRingsCreamV658 = 'true';
    canvas.dataset.gannzillaInnerNumberRingsCreamColorV658 = fill;
    canvas.dataset.gannzillaInnerNumberRingsCreamScopeV658 = 'rings-1-and-2-only';
  } finally {
    applying = false;
  }

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    creamColor: fill,
    changedRings: [1, 2],
    ringOneMeaning: 'numbers-1-to-36',
    ringTwoMeaning: 'digital-root-1-to-9',
    wheelGeometryChanged: false,
    numberPositionsChanged: false,
    numberColorsChanged: false,
    clockChanged: false,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule') {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => apply(source));
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  [0, 80, 220, 600, 1400, 3000, 6500].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  [
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:wheel-input-v459',
    'gannzilla:page-scrollbar-pan-v305',
  ].forEach((name) => window.addEventListener(name, () => schedule(name), false));

  window.addEventListener('resize', () => schedule('window-resize'), false);
  timer = window.setInterval(() => schedule('cream-ring-watch'), 1200);

  window.GANNZILLA_INNER_NUMBER_RINGS_CREAM_V658 = true;
  window.__auditGannzillaInnerNumberRingsCreamV658 = () => {
    const canvas = findWheel();
    return {
      ok: enabled()
        && canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaInnerNumberRingsCreamV658 === 'true'
        && canvas.dataset.gannzillaInnerNumberRingsCreamColorV658 === creamColor()
        && canvas.dataset.gannzillaInnerNumberRingsCreamScopeV658 === 'rings-1-and-2-only',
      build: BUILD,
      creamColor: creamColor(),
      changedRings: [1, 2],
      wheelGeometryChanged: false,
      numberPositionsChanged: false,
      numberColorsChanged: false,
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
