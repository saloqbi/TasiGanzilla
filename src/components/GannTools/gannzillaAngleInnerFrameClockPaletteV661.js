const BUILD = 661;
const STATE_KEY = '__gannzillaAngleInnerFrameClockPaletteV661';
const ENABLE_PARAM = 'angleInnerFrameClockPalette';
const TWO_PI = Math.PI * 2;

// Exact warm brown/gold family used by the approved center-clock frame.
const CLOCK_DARK = '#382015';
const CLOCK_DEEP = '#70401f';
const CLOCK_MID = '#8b512b';
const CLOCK_GOLD = '#c9954f';
const CLOCK_LIGHT = '#f1d49b';

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

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

function enabled() {
  const query = params();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  return wheelMode && boolParam(ENABLE_PARAM, false);
}

function findWheel() {
  const canvas = document.querySelector('canvas[data-gannzilla-empty-outer-ring-v518="true"]');
  return canvas instanceof HTMLCanvasElement && !canvas.closest('aside') ? canvas : null;
}

function fillAnnulus(ctx, cx, cy, inner, outer, fillStyle) {
  ctx.beginPath();
  ctx.arc(cx, cy, outer, 0, TWO_PI);
  ctx.arc(cx, cy, Math.max(1, inner), TWO_PI, 0, true);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function strokeCircle(ctx, cx, cy, radius, strokeStyle, lineWidth) {
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(1, radius), 0, TWO_PI);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

function clockPaletteGradient(ctx, cx, cy, inner, outer) {
  const gradient = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
  gradient.addColorStop(0, CLOCK_DARK);
  gradient.addColorStop(0.16, CLOCK_DEEP);
  gradient.addColorStop(0.34, CLOCK_MID);
  gradient.addColorStop(0.55, CLOCK_GOLD);
  gradient.addColorStop(0.74, CLOCK_LIGHT);
  gradient.addColorStop(0.90, CLOCK_GOLD);
  gradient.addColorStop(1, CLOCK_DARK);
  return gradient;
}

function drawInnerFrameOnly(ctx, cx, cy, inner, outer) {
  const width = Math.max(1, outer - inner);
  fillAnnulus(ctx, cx, cy, inner, outer, clockPaletteGradient(ctx, cx, cy, inner, outer));
  strokeCircle(ctx, cx, cy, inner, CLOCK_DARK, Math.max(1, width * 0.10));
  strokeCircle(ctx, cx, cy, inner + width * 0.26, CLOCK_DEEP, Math.max(0.8, width * 0.06));
  strokeCircle(ctx, cx, cy, inner + width * 0.68, 'rgba(241, 212, 155, 0.72)', Math.max(0.8, width * 0.055));
  strokeCircle(ctx, cx, cy, outer, CLOCK_DARK, Math.max(1, width * 0.09));
}

function apply(source = 'apply') {
  frame = 0;
  if (!enabled() || applying) return false;

  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement)
      || canvas.dataset.gannzillaMetallicAngleOuterRingV531 !== 'true') return false;

  const baseCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingBaseCssSizeV518 || 0);
  const expandedCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518 || 0);
  const ringWidth = Number(canvas.dataset.gannzillaEmptyOuterRingWidthV518 || 0);
  const dpr = Math.max(1, Number(canvas.dataset.gannzillaNativeDpr)
    || (expandedCssSize > 0 ? canvas.width / expandedCssSize : 0)
    || Number(window.devicePixelRatio)
    || 1);
  const zoom = Math.max(0.5, Number(canvas.dataset.gannzillaAppliedZoom) || 1);

  if (!(baseCssSize > 0) || !(expandedCssSize > 0) || !(ringWidth > 0)) return false;

  const innerFrameWidth = numberParam('gannzillaAngleInnerFrameStrokeWidth', 10, 5.6, 16) * zoom;
  const cx = expandedCssSize / 2;
  const cy = expandedCssSize / 2;
  const margin = 90 * zoom;
  const baseOuter = Math.max(1, (baseCssSize - margin * 2) / 2);
  const angleInnerRadius = baseOuter + ringWidth * 2;
  const innerFrameInner = angleInnerRadius - innerFrameWidth;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return false;

  applying = true;
  try {
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.setLineDash([]);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Deliberately repaint the inner angle frame only. The outer frame remains V541 copper.
    drawInnerFrameOnly(ctx, cx, cy, innerFrameInner, angleInnerRadius);
    ctx.restore();

    canvas.dataset.gannzillaAngleInnerFrameClockPaletteV661 = 'true';
    canvas.dataset.gannzillaAngleInnerFramePaletteV661 = [
      CLOCK_DARK, CLOCK_DEEP, CLOCK_MID, CLOCK_GOLD, CLOCK_LIGHT,
    ].join(',');
    canvas.dataset.gannzillaAngleInnerFrameOnlyV661 = 'true';
    canvas.dataset.gannzillaAngleOuterFrameChangedV661 = 'false';
  } finally {
    applying = false;
  }

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    palette: [CLOCK_DARK, CLOCK_DEEP, CLOCK_MID, CLOCK_GOLD, CLOCK_LIGHT],
    matchedTo: 'center-clock-frame-v657',
    innerFrameWidth: innerFrameWidth / zoom,
    innerFrameChanged: true,
    outerFrameChanged: false,
    wheelGeometryChanged: false,
    angleGeometryChanged: false,
    angleLabelsChanged: false,
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

  [0, 120, 320, 800, 1800, 3800, 7600, 11200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });

  [
    'gannzilla:copper-top-correction-v541',
    'gannzilla:clean-outer-frame-v540',
    'gannzilla:metallic-angle-outer-ring-v531',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:wheel-input-v459',
    'gannzilla:page-scrollbar-pan-v305',
  ].forEach((name) => window.addEventListener(name, () => schedule(name, 45), false));

  window.addEventListener('resize', () => schedule('window-resize', 60), false);
  timer = window.setInterval(() => schedule('inner-clock-palette-watch', 0), 1600);

  window.GANNZILLA_ANGLE_INNER_FRAME_CLOCK_PALETTE_V661 = true;
  window.__auditGannzillaAngleInnerFrameClockPaletteV661 = () => {
    const canvas = findWheel();
    return {
      ok: enabled()
        && canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaAngleInnerFrameClockPaletteV661 === 'true'
        && canvas.dataset.gannzillaAngleInnerFrameOnlyV661 === 'true'
        && canvas.dataset.gannzillaAngleOuterFrameChangedV661 === 'false',
      build: BUILD,
      palette: [CLOCK_DARK, CLOCK_DEEP, CLOCK_MID, CLOCK_GOLD, CLOCK_LIGHT],
      matchedTo: 'center-clock-frame-v657',
      innerFrameChanged: true,
      outerFrameChanged: false,
      wheelGeometryChanged: false,
      angleGeometryChanged: false,
      angleLabelsChanged: false,
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
