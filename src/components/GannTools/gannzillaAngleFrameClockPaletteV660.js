const BUILD = 660;
const STATE_KEY = '__gannzillaAngleFrameClockPaletteV660';
const ENABLE_PARAM = 'angleFrameClockPalette';
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
  gradient.addColorStop(0.12, CLOCK_DEEP);
  gradient.addColorStop(0.28, CLOCK_MID);
  gradient.addColorStop(0.48, CLOCK_GOLD);
  gradient.addColorStop(0.66, CLOCK_LIGHT);
  gradient.addColorStop(0.82, CLOCK_GOLD);
  gradient.addColorStop(0.94, CLOCK_MID);
  gradient.addColorStop(1, CLOCK_DARK);
  return gradient;
}

function drawClockMatchedFrame(ctx, cx, cy, inner, outer) {
  const width = Math.max(1, outer - inner);
  fillAnnulus(ctx, cx, cy, inner, outer, clockPaletteGradient(ctx, cx, cy, inner, outer));

  // Preserve the existing frame geometry; only replace its color authority.
  strokeCircle(ctx, cx, cy, inner, CLOCK_DARK, Math.max(1, width * 0.065));
  strokeCircle(ctx, cx, cy, inner + width * 0.18, CLOCK_DEEP, Math.max(0.8, width * 0.040));
  strokeCircle(ctx, cx, cy, inner + width * 0.58, 'rgba(241, 212, 155, 0.72)', Math.max(0.8, width * 0.035));
  strokeCircle(ctx, cx, cy, outer - width * 0.10, CLOCK_GOLD, Math.max(0.9, width * 0.045));
  strokeCircle(ctx, cx, cy, outer, CLOCK_DARK, Math.max(1, width * 0.055));
}

function drawTopClockHighlight(ctx, cx, cy, inner, width) {
  const radius = inner + width * 0.63;
  const start = (190 * Math.PI) / 180;
  const end = (350 * Math.PI) / 180;
  const gradient = ctx.createLinearGradient(cx - radius, 0, cx + radius, 0);
  gradient.addColorStop(0, 'rgba(241,212,155,0)');
  gradient.addColorStop(0.20, 'rgba(241,212,155,0.18)');
  gradient.addColorStop(0.50, 'rgba(246,236,211,0.54)');
  gradient.addColorStop(0.80, 'rgba(241,212,155,0.18)');
  gradient.addColorStop(1, 'rgba(241,212,155,0)');

  ctx.save();
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, start, end);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = Math.max(1, width * 0.10);
  ctx.stroke();
  ctx.restore();
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

  const ringScale = numberParam('gannzillaAngleRingScale', 2, 1.7, 2);
  const baseFrameWidth = numberParam('gannzillaAngleFrameStrokeWidth', 5.6, 3, 12) * zoom;
  const innerFrameWidth = numberParam('gannzillaAngleInnerFrameStrokeWidth', 10, 5.6, 16) * zoom;
  const outerFrameWidth = numberParam('gannzillaAngleOuterFrameStrokeWidth', 40, 36, 48) * zoom;

  const cx = expandedCssSize / 2;
  const cy = expandedCssSize / 2;
  const margin = 90 * zoom;
  const baseOuter = Math.max(1, (baseCssSize - margin * 2) / 2);
  const angleInnerRadius = baseOuter + ringWidth * 2;
  const angleOuterRadius = angleInnerRadius + ringWidth * ringScale;
  const innerFrameInner = angleInnerRadius - innerFrameWidth;
  const outerFrameInner = angleOuterRadius - baseFrameWidth / 2;
  const outerFrameOuter = outerFrameInner + outerFrameWidth;

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

    drawClockMatchedFrame(ctx, cx, cy, innerFrameInner, angleInnerRadius);
    drawClockMatchedFrame(ctx, cx, cy, outerFrameInner, outerFrameOuter);
    drawTopClockHighlight(ctx, cx, cy, outerFrameInner, outerFrameWidth);
    ctx.restore();

    canvas.dataset.gannzillaAngleFrameClockPaletteV660 = 'true';
    canvas.dataset.gannzillaAngleFramePaletteV660 = [
      CLOCK_DARK, CLOCK_DEEP, CLOCK_MID, CLOCK_GOLD, CLOCK_LIGHT,
    ].join(',');
    canvas.dataset.gannzillaAngleFrameGeometryChangedV660 = 'false';
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
    outerFrameWidth: outerFrameWidth / zoom,
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
  timer = window.setInterval(() => schedule('clock-palette-watch', 0), 1600);

  window.GANNZILLA_ANGLE_FRAME_CLOCK_PALETTE_V660 = true;
  window.__auditGannzillaAngleFrameClockPaletteV660 = () => {
    const canvas = findWheel();
    return {
      ok: enabled()
        && canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaAngleFrameClockPaletteV660 === 'true'
        && canvas.dataset.gannzillaAngleFrameGeometryChangedV660 === 'false',
      build: BUILD,
      palette: [CLOCK_DARK, CLOCK_DEEP, CLOCK_MID, CLOCK_GOLD, CLOCK_LIGHT],
      matchedTo: 'center-clock-frame-v657',
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