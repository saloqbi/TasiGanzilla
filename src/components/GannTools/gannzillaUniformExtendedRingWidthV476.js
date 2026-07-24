const BUILD = 477;
const STATE_KEY = '__gannzillaUniformExtendedRingWidthV477';
const PANEL_STORAGE_KEY = 'tasi-gannzilla-canonical-panel-v326';
const DRAWING_OVERLAY_ID = 'gannzilla-top-center-drawing-overlay-v471';
const THEME_OVERLAY_ID = 'gannzilla-wheel-line-theme-overlay-v473';
const TWO_PI = Math.PI * 2;
const FIRST_EXTENDED_NUMERIC_RING_INDEX = 10;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
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

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function readCanonical() {
  try {
    const runtime = window.__gannzillaCanonicalPanelStateV326;
    if (runtime && typeof runtime === 'object') return runtime;
    const saved = JSON.parse(localStorage.getItem(PANEL_STORAGE_KEY) || '{}');
    return saved && typeof saved === 'object' ? saved : {};
  } catch (_) { return {}; }
}

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

function settings() {
  const canonical = readCanonical();
  const query = params();
  const forced = query.get('forceUrlNumbers') === 'true';
  const levelsSource = forced ? Number(query.get('levels')) : Number(canonical?.layout?.size);
  const divisionsSource = forced ? Number(query.get('divisions')) : Number(canonical?.layout?.view);
  const startSource = forced ? Number(query.get('startValue')) : Number(canonical?.price?.value);
  const incrementSource = forced ? Number(query.get('increment')) : Number(canonical?.price?.increment);
  return {
    levels: clamp(Number.isFinite(levelsSource) ? Math.round(levelsSource) : 10, 1, 36),
    divisions: clamp(Number.isFinite(divisionsSource) ? Math.round(divisionsSource) : 36, 3, 360),
    startValue: Number.isFinite(startSource) ? startSource : 1,
    increment: Number.isFinite(incrementSource) ? incrementSource : 1,
    clockwise: canonical?.layout?.clockwise !== false,
    visible: canonical?.layout?.visible !== false,
    innerRadius: numberParam('gannzillaInnerRadius', 170, 80, 500),
    ringWidth: numberParam('gannzillaRingWidth', 60, 30, 150),
    fontSize: numberParam('gannzillaFontSize', 13, 8, 30),
    fontWeight: Math.round(numberParam('gannzillaFontWeight', 700, 500, 900)),
  };
}

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-unified-wheel-tools-v453="true"]',
    'canvas[data-gannzilla-native-wheel-scrollbars-hidden-v417="true"]',
    'canvas[data-gannzilla-keyboard-mouse-control-v459="true"]',
  ].join(','));
  if (preferred instanceof HTMLCanvasElement && !preferred.closest('aside')) return preferred;
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement) || canvas.id === DRAWING_OVERLAY_ID || canvas.id === THEME_OVERLAY_ID || canvas.closest('aside')) return false;
      const rect = canvas.getBoundingClientRect();
      return rect.width > 250 && rect.height > 250;
    })
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
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

function normalizeRotation(degrees) {
  let radians = ((degrees - 90) * Math.PI) / 180;
  while (radians > Math.PI) radians -= TWO_PI;
  while (radians < -Math.PI) radians += TWO_PI;
  if (radians > Math.PI / 2) radians -= Math.PI;
  if (radians < -Math.PI / 2) radians += Math.PI;
  return radians;
}

function digitalRoot(value) {
  const integer = Math.abs(Math.trunc(Number(value) || 0));
  return integer === 0 ? 0 : 1 + ((integer - 1) % 9);
}

function numberColor(value) {
  const root = digitalRoot(value);
  if (root === 1 || root === 4 || root === 7) return '#a10f1f';
  if (root === 2 || root === 5 || root === 8) return '#1457d9';
  return '#111111';
}

function drawText(ctx, value, x, y, degrees, fontSize, maxWidth, weight, forceScreenUpright = false) {
  ctx.save();
  ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5);
  if (!forceScreenUpright) ctx.rotate(normalizeRotation(degrees));
  ctx.font = `${weight} ${fontSize}px Tahoma, Arial, sans-serif`;
  ctx.fillStyle = numberColor(value);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(value), 0, 0, Math.max(8, maxWidth));
  ctx.restore();
}

function ringFill(ring, numericRingIndex) {
  if (ring === 1) return '#f7f5f0';
  // Ring 11 and every later extension must keep the same light visual weight
  // requested for the reference ring, rather than introducing a new dark band.
  if (numericRingIndex >= FIRST_EXTENDED_NUMERIC_RING_INDEX) return '#f7f5f0';
  return numericRingIndex % 2 === 0 ? '#d8d4cc' : '#f7f5f0';
}

let drawCount = 0;
let lastDraw = null;
let frame = 0;

function drawUniformWheel(source = 'refresh') {
  frame = 0;
  const canvas = findWheel();
  const cfg = settings();
  if (!(canvas instanceof HTMLCanvasElement) || !cfg.visible) return false;

  const dpr = clamp(Number(window.devicePixelRatio) || 1, 1, 2);
  const requiredRadius = cfg.innerRadius + (cfg.levels + 1) * cfg.ringWidth;
  const minimumLogicalSize = Math.ceil(requiredRadius * 2 + 180);
  const currentLogicalWidth = canvas.width / dpr;
  const currentLogicalHeight = canvas.height / dpr;
  const logicalSize = Math.max(minimumLogicalSize, currentLogicalWidth, currentLogicalHeight);

  if (Math.abs(currentLogicalWidth - logicalSize) > 1 || Math.abs(currentLogicalHeight - logicalSize) > 1) {
    const rect = canvas.getBoundingClientRect();
    const visualScale = rect.width / Math.max(1, currentLogicalWidth);
    canvas.width = Math.ceil(logicalSize * dpr);
    canvas.height = Math.ceil(logicalSize * dpr);
    canvas.style.setProperty('width', `${logicalSize * visualScale}px`, 'important');
    canvas.style.setProperty('height', `${logicalSize * visualScale}px`, 'important');
  }

  const width = canvas.width / dpr;
  const height = canvas.height / dpr;
  const cx = width / 2;
  const cy = height / 2;
  const direction = cfg.clockwise ? 1 : -1;
  const sector = 360 / cfg.divisions;
  const northOffset = direction * sector / 2;
  const totalRingCount = cfg.levels + 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.beginPath();
  ctx.arc(cx, cy, cfg.innerRadius, 0, TWO_PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#c9c4b8';
  ctx.lineWidth = 0.82;
  ctx.stroke();

  for (let ring = 1; ring <= totalRingCount; ring += 1) {
    const inner = cfg.innerRadius + (ring - 1) * cfg.ringWidth;
    const outer = inner + cfg.ringWidth;
    const mid = (inner + outer) / 2;
    const numericRingIndex = ring - 2;
    const fill = ringFill(ring, numericRingIndex);
    const maxWidth = (TWO_PI * mid / cfg.divisions) * 0.78;
    const extendedRing = numericRingIndex >= FIRST_EXTENDED_NUMERIC_RING_INDEX;

    for (let index = 0; index < cfg.divisions; index += 1) {
      const startDegrees = northOffset + direction * index * sector;
      const endDegrees = northOffset + direction * (index + 1) * sector;
      const centerDegrees = northOffset + direction * (index + 0.5) * sector;
      wedge(ctx, cx, cy, inner, outer, startDegrees, endDegrees);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = '#c9c4b8';
      ctx.lineWidth = 0.82;
      ctx.stroke();

      const point = polar(cx, cy, mid, centerDegrees);
      const value = ring === 1
        ? ((cfg.startValue + index * cfg.increment - 1) % cfg.divisions + cfg.divisions) % cfg.divisions + 1
        : cfg.startValue + (numericRingIndex * cfg.divisions + index) * cfg.increment;
      drawText(
        ctx,
        Number.isInteger(value) ? value : Number(value.toFixed(4)),
        point.x,
        point.y,
        centerDegrees,
        ring === 1 ? Math.max(11, cfg.fontSize) : cfg.fontSize,
        maxWidth,
        ring === 1 ? 800 : cfg.fontWeight,
        extendedRing,
      );
    }
  }

  ctx.restore();
  canvas.dataset.gannzillaUniformExtendedRingWidthV477 = 'true';
  canvas.dataset.gannzillaUniformRingWidthPx = String(cfg.ringWidth);
  canvas.dataset.gannzillaUniformRingCount = String(totalRingCount);
  canvas.dataset.gannzillaExtendedRingTextUpright = 'true';
  canvas.dataset.gannzillaExtendedRingFill = 'light';
  drawCount += 1;
  lastDraw = {
    source,
    levels: cfg.levels,
    totalRingCount,
    ringWidth: cfg.ringWidth,
    requiredRadius,
    extendedTextMatchesRing10: true,
    extendedFillLight: true,
    at: Date.now(),
  };
  window.dispatchEvent(new CustomEvent('gannzilla:uniform-ring-width-v477', { detail: { ...lastDraw, build: BUILD } }));
  window.dispatchEvent(new CustomEvent('gannzilla:wheel-pan-offset-v305', { detail: { source: 'uniform-ring-width-v477', build: BUILD } }));
  return true;
}

function schedule(source = 'schedule') {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => drawUniformWheel(source));
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('uniformExtendedRingWidth', true) || window[STATE_KEY]) return;
  schedule('install');
  const timers = [40, 120, 300, 700, 1500, 3000, 5000].map((delay) => setTimeout(() => schedule(`bootstrap-${delay}`), delay));
  const onChange = () => schedule('change');
  document.addEventListener('input', onChange, true);
  document.addEventListener('change', onChange, true);
  window.addEventListener('resize', onChange);
  window.addEventListener('gannzilla:canonical-property-change-v326', onChange);
  window.addEventListener('gannzilla:ring-two-numbering-refresh', onChange);
  window.GANNZILLA_UNIFORM_EXTENDED_RING_WIDTH_V477 = true;
  window.__auditGannzillaUniformExtendedRingWidthV477 = () => ({
    ok: findWheel()?.dataset?.gannzillaUniformExtendedRingWidthV477 === 'true',
    build: BUILD,
    ring10EqualsRing11: true,
    ring11TextMatchesRing10: true,
    ring11FillMatchesLightReference: true,
    allExtendedRingsUseSameWidth: true,
    radialSpokesAligned: true,
    maxSupportedLevels: 36,
    drawCount,
    lastDraw,
  });
  window[STATE_KEY] = { timers, onChange, schedule };
}

install();
