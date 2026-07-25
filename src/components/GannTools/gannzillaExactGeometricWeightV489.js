const BUILD = 489;
const STATE_KEY = '__gannzillaExactGeometricWeightV489';
const PANEL_KEY = 'tasi-gannzilla-canonical-panel-v326';
const DRAWING_OVERLAY_ID = 'gannzilla-top-center-drawing-overlay-v471';
const THEME_OVERLAY_ID = 'gannzilla-wheel-line-theme-overlay-v473';
const TWO_PI = Math.PI * 2;
const MAX_SAFE_CANVAS_LOGICAL_SIZE = 15000;
const LIGHT_FILL = '#fbfaf7';
const SHADED_FILL = '#e4e1da';
const GRID_STROKE = '#888888';
const OUTER_STROKE = '#555555';
const overrides = new Map();

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

function readState() {
  try {
    const runtime = window.__gannzillaReferencePanelStateV421
      || window.__gannzillaCanonicalPanelStateV326;
    if (runtime && typeof runtime === 'object') return runtime;
    const saved = JSON.parse(localStorage.getItem(PANEL_KEY) || '{}');
    return saved && typeof saved === 'object' ? saved : {};
  } catch (_) { return {}; }
}

function getPath(object, path) {
  return String(path || '').split('.').reduce((value, key) => value?.[key], object);
}

function numericSetting(path, queryName, fallback, min, max) {
  if (overrides.has(path)) {
    const value = Number(overrides.get(path));
    return Number.isFinite(value) ? clamp(value, min, max) : fallback;
  }
  const query = params();
  if (query.has(queryName)) {
    const value = Number(query.get(queryName));
    if (Number.isFinite(value)) return clamp(value, min, max);
  }
  const value = Number(getPath(readState(), path));
  return Number.isFinite(value) ? clamp(value, min, max) : fallback;
}

function booleanSetting(path, queryName, fallback) {
  if (overrides.has(path)) return Boolean(overrides.get(path));
  const query = params();
  if (query.has(queryName)) {
    return ['true', '1', 'yes', 'on'].includes(String(query.get(queryName) || '').toLowerCase());
  }
  const value = getPath(readState(), path);
  return typeof value === 'boolean' ? value : fallback;
}

function settings() {
  const baseFont = numericSetting('typography.fontSize', 'gannzillaFontSize', 13, 8, 30);
  const numberScale = numericSetting('typography.numberScale', 'gannzillaNumberScale', 1.45, 1, 1.75);
  return {
    levels: Math.round(numericSetting('layout.size', 'levels', 10, 1, 9999)),
    divisions: Math.round(numericSetting('layout.view', 'divisions', 36, 3, 360)),
    startValue: numericSetting('price.value', 'startValue', 1, -1e9, 1e9),
    increment: numericSetting('price.increment', 'increment', 1, -1e6, 1e6),
    clockwise: booleanSetting('layout.clockwise', 'clockwise', true),
    visible: booleanSetting('layout.visible', 'wheelVisible', true),
    originalInnerRadius: numericSetting('geometry.innerRadius', 'gannzillaInnerRadius', 170, 20, 1000),
    ringWidth: numericSetting('geometry.ringWidth', 'gannzillaRingWidth', 60, 4, 300),
    fontSize: baseFont * numberScale,
    fontWeight: Math.round(numericSetting('typography.numberWeight', 'gannzillaNumberWeight', 800, 600, 900)),
  };
}

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-exact-geometric-weight-v489="true"]',
    'canvas[data-gannzilla-reference-wheel-proportions-v488="true"]',
    'canvas[data-gannzilla-canonical-wheel-geometry-v486="true"]',
    'canvas[data-gannzilla-unlimited-ring-layers-v480="true"]',
    'canvas[data-gannzilla-unified-wheel-tools-v453="true"]',
    'canvas[data-gannzilla-native-wheel-scrollbars-hidden-v417="true"]',
    'canvas[data-gannzilla-keyboard-mouse-control-v459="true"]',
  ].join(','));
  if (preferred instanceof HTMLCanvasElement && !preferred.closest('aside')) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement)
        || canvas.closest('aside')
        || canvas.id === DRAWING_OVERLAY_ID
        || canvas.id === THEME_OVERLAY_ID) return false;
      const rect = canvas.getBoundingClientRect();
      return canvas.width > 300 && canvas.height > 300 && rect.width > 250 && rect.height > 250;
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

function digitalRoot(value) {
  const integer = Math.abs(Math.trunc(Number(value) || 0));
  return integer === 0 ? 0 : 1 + ((integer - 1) % 9);
}

function numberColor(value) {
  const root = digitalRoot(value);
  if (root === 1 || root === 4 || root === 7) return '#a51d2d';
  if (root === 2 || root === 5 || root === 8) return '#1559bd';
  return '#111111';
}

function drawNumber(ctx, value, x, y, fontSize, maxWidth, weight) {
  ctx.save();
  ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5);
  ctx.font = `${weight} ${fontSize}px Tahoma, Arial, sans-serif`;
  ctx.fillStyle = numberColor(value);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(value), 0, 0, Math.max(10, maxWidth));
  ctx.restore();
}

let frame = 0;
let drawCount = 0;
let lastDraw = null;
const timers = new Map();

function draw(source = 'refresh') {
  frame = 0;
  const canvas = findWheel();
  const cfg = settings();
  if (!(canvas instanceof HTMLCanvasElement) || !cfg.visible) return false;

  const totalRingCount = cfg.levels + 1;
  const desiredRingWidth = cfg.ringWidth;
  const adjustedInnerRadius = Math.max(20, cfg.originalInnerRadius - desiredRingWidth);
  const desiredOuterRadius = adjustedInnerRadius + totalRingCount * desiredRingWidth;
  const maximumOuterRadius = (MAX_SAFE_CANVAS_LOGICAL_SIZE - 240) / 2;
  const safetyScaled = desiredOuterRadius > maximumOuterRadius;
  const effectiveRingWidth = safetyScaled
    ? Math.max(1, (maximumOuterRadius - adjustedInnerRadius) / totalRingCount)
    : desiredRingWidth;
  const outerRadius = adjustedInnerRadius + totalRingCount * effectiveRingWidth;
  const logicalSize = Math.ceil(Math.min(MAX_SAFE_CANVAS_LOGICAL_SIZE, outerRadius * 2 + 180));
  const dpr = clamp(Number(window.devicePixelRatio) || 1, 1, 2);
  const previousLogicalWidth = Math.max(1, canvas.width / dpr);
  const rect = canvas.getBoundingClientRect();
  const visualScale = rect.width > 0 ? rect.width / previousLogicalWidth : 1;

  if (Math.abs(previousLogicalWidth - logicalSize) > 1 || Math.abs(canvas.height / dpr - logicalSize) > 1) {
    canvas.width = Math.ceil(logicalSize * dpr);
    canvas.height = Math.ceil(logicalSize * dpr);
    canvas.style.setProperty('width', `${logicalSize * visualScale}px`, 'important');
    canvas.style.setProperty('height', `${logicalSize * visualScale}px`, 'important');
  }

  const width = canvas.width / dpr;
  const height = canvas.height / dpr;
  const cx = width / 2;
  const cy = height / 2;
  const sector = 360 / cfg.divisions;
  const direction = cfg.clockwise ? 1 : -1;
  // With clockwise=true: cell 36 is north, 9 east, 18 south and 27 west.
  const northOffset = direction * sector / 2;
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
  ctx.arc(cx, cy, adjustedInnerRadius, 0, TWO_PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = OUTER_STROKE;
  ctx.lineWidth = 1.05;
  ctx.stroke();

  const uniformFontSize = Math.max(14, Math.min(cfg.fontSize, effectiveRingWidth * 0.34));
  for (let ring = 1; ring <= totalRingCount; ring += 1) {
    const inner = adjustedInnerRadius + (ring - 1) * effectiveRingWidth;
    const outer = inner + effectiveRingWidth;
    const mid = (inner + outer) / 2;
    const numericRingIndex = ring - 2;
    const fill = ring === 1 ? LIGHT_FILL : (numericRingIndex % 2 === 0 ? SHADED_FILL : LIGHT_FILL);
    const maxWidth = (TWO_PI * mid / cfg.divisions) * 0.92;

    for (let index = 0; index < cfg.divisions; index += 1) {
      const startDegrees = northOffset + direction * index * sector;
      const endDegrees = northOffset + direction * (index + 1) * sector;
      const centerDegrees = northOffset + direction * (index + 0.5) * sector;
      wedge(ctx, cx, cy, inner, outer, startDegrees, endDegrees);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = GRID_STROKE;
      ctx.lineWidth = 0.82;
      ctx.stroke();

      const point = polar(cx, cy, mid, centerDegrees);
      const value = ring === 1
        ? index + 1
        : cfg.startValue + (numericRingIndex * cfg.divisions + index) * cfg.increment;
      const displayValue = Number.isInteger(value) ? value : Number(value.toFixed(4));
      drawNumber(ctx, displayValue, point.x, point.y, uniformFontSize, maxWidth, cfg.fontWeight);
    }
  }

  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, 0, TWO_PI);
  ctx.strokeStyle = OUTER_STROKE;
  ctx.lineWidth = 1.15;
  ctx.stroke();
  ctx.restore();

  canvas.dataset.gannzillaExactGeometricWeightV489 = 'true';
  canvas.dataset.gannzillaCanonicalWheelGeometryV486 = 'true';
  canvas.dataset.gannzillaAdjustedInnerRadius = String(adjustedInnerRadius);
  canvas.dataset.gannzillaEffectiveRingWidth = String(effectiveRingWidth);
  canvas.dataset.gannzillaTotalVisibleRingCount = String(totalRingCount);
  canvas.dataset.gannzillaBaseRingNorth = String(cfg.divisions);
  canvas.dataset.gannzillaBaseRingEast = String(Math.round(cfg.divisions / 4));
  canvas.dataset.gannzillaBaseRingSouth = String(Math.round(cfg.divisions / 2));
  canvas.dataset.gannzillaBaseRingWest = String(Math.round(cfg.divisions * 3 / 4));
  canvas.dataset.gannzillaUniformNumberFontSize = String(uniformFontSize);
  canvas.dataset.gannzillaUniformNumberWeight = String(cfg.fontWeight);

  drawCount += 1;
  lastDraw = {
    source,
    levels: cfg.levels,
    divisions: cfg.divisions,
    clockwise: cfg.clockwise,
    totalRingCount,
    originalInnerRadius: cfg.originalInnerRadius,
    adjustedInnerRadius,
    configuredRingWidth: cfg.ringWidth,
    effectiveRingWidth,
    outerRadius,
    safetyScaled,
    fontSize: uniformFontSize,
    fontWeight: cfg.fontWeight,
    northCell: cfg.divisions,
    eastCell: Math.round(cfg.divisions / 4),
    southCell: Math.round(cfg.divisions / 2),
    westCell: Math.round(cfg.divisions * 3 / 4),
    at: Date.now(),
  };

  window.__gannzillaAllToolsRuntimeV482?.sched?.(`exact-weight-v${BUILD}-${source}`);
  window.dispatchEvent(new CustomEvent('gannzilla:exact-geometric-weight-v489', {
    detail: { ...lastDraw, build: BUILD },
  }));
  return true;
}

function schedule(source = 'schedule', delays = [0, 80, 240, 620]) {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => draw(source));
  delays.filter(Boolean).forEach((delay) => {
    clearTimeout(timers.get(delay));
    timers.set(delay, setTimeout(() => {
      timers.delete(delay);
      draw(`${source}-${delay}`);
    }, delay));
  });
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('northLastCell', 'true');
    url.searchParams.set('canonicalCardinalGeometry', 'true');
    url.searchParams.set('exactRingWidth', 'true');
    url.searchParams.set('preserveOuterRadius', 'true');
    url.searchParams.set('gannzillaNumberScale', url.searchParams.get('gannzillaNumberScale') || '1.45');
    url.searchParams.set('gannzillaNumberWeight', url.searchParams.get('gannzillaNumberWeight') || '800');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) { /* runtime remains active */ }
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode() || window[STATE_KEY]) return;
  persistFlags();

  const onCanonical = (event) => {
    const path = event?.detail?.path;
    if (path) overrides.set(path, event.detail.value);
    schedule(`canonical-${path || 'unknown'}`);
  };
  const refresh = (event) => schedule(event?.type || 'refresh');

  window.addEventListener('gannzilla:canonical-property-change-v326', onCanonical, false);
  window.addEventListener('gannzilla:reference-panel-change-v421', onCanonical, false);
  window.addEventListener('gannzilla:clockwise-direction-commit-v483', refresh, false);
  window.addEventListener('gannzilla:unlimited-ring-layers-v480', refresh, false);
  window.addEventListener('gannzilla:ring-two-numbering-refresh', refresh, false);
  window.addEventListener('resize', refresh, false);
  document.addEventListener('input', refresh, true);
  document.addEventListener('change', refresh, true);

  [0, 50, 180, 420, 900, 1800, 3600, 5600, 6800, 7600].forEach((delay) => {
    setTimeout(() => schedule(`boot-${delay}`, [0, 100, 320, 700]), delay);
  });

  window.GANNZILLA_EXACT_GEOMETRIC_WEIGHT_V489 = true;
  window.__auditGannzillaExactGeometricWeightV489 = () => {
    const canvas = findWheel();
    const cfg = settings();
    const canonical36 = cfg.divisions === 36 && cfg.clockwise;
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaExactGeometricWeightV489 === 'true'
        && Number(canvas.dataset.gannzillaEffectiveRingWidth) === cfg.ringWidth
        && (!canonical36 || (
          canvas.dataset.gannzillaBaseRingNorth === '36'
          && canvas.dataset.gannzillaBaseRingEast === '9'
          && canvas.dataset.gannzillaBaseRingSouth === '18'
          && canvas.dataset.gannzillaBaseRingWest === '27'
        )),
      build: BUILD,
      exactConfiguredRingWidth: Number(canvas?.dataset?.gannzillaEffectiveRingWidth) === cfg.ringWidth,
      canonicalCardinals: { north12: 36, east3: 9, south6: 18, west9: 27 },
      originalInnerRadius: cfg.originalInnerRadius,
      adjustedInnerRadius: Number(canvas?.dataset?.gannzillaAdjustedInnerRadius),
      configuredRingWidth: cfg.ringWidth,
      effectiveRingWidth: Number(canvas?.dataset?.gannzillaEffectiveRingWidth),
      uniformNumberFontSize: Number(canvas?.dataset?.gannzillaUniformNumberFontSize),
      uniformNumberWeight: Number(canvas?.dataset?.gannzillaUniformNumberWeight),
      drawCount,
      lastDraw,
    };
  };

  window[STATE_KEY] = { onCanonical, refresh, schedule, draw, overrides };
  schedule('install');
}

install();