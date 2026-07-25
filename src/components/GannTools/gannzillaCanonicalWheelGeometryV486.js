const BUILD = 486;
const STATE_KEY = '__gannzillaCanonicalWheelGeometryV486';
const PANEL_KEY = 'tasi-gannzilla-canonical-panel-v326';
const REFERENCE_KEY = 'tasi-gannzilla-reference-panel-v421';
const DRAWING_OVERLAY_ID = 'gannzilla-top-center-drawing-overlay-v471';
const THEME_OVERLAY_ID = 'gannzilla-wheel-line-theme-overlay-v473';
const TWO_PI = Math.PI * 2;
const MAX_SAFE_CANVAS_LOGICAL_SIZE = 15000;
const LIGHT_FILL = '#f7f5f0';
const DARK_FILL = '#d8d4cc';
const GRID_STROKE = '#111111';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? clamp(value, min, max) : fallback;
}

function readJson(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '{}');
    return value && typeof value === 'object' ? value : {};
  } catch (_) {
    return {};
  }
}

function readState() {
  const runtime = window.__gannzillaReferencePanelStateV421
    || window.__gannzillaCanonicalPanelStateV326;
  return runtime && typeof runtime === 'object' ? runtime : readJson(PANEL_KEY);
}

function setPath(object, path, value) {
  const keys = String(path || '').split('.').filter(Boolean);
  const root = { ...(object || {}) };
  let cursor = root;
  let source = object || {};
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = value;
      return;
    }
    const next = source?.[key];
    cursor[key] = { ...(next || {}) };
    cursor = cursor[key];
    source = next || {};
  });
  return root;
}

function commitPath(path, value, source = 'property') {
  if (!path) return readState();
  const next = setPath(readState(), path, value);
  window.__gannzillaCanonicalPanelStateV326 = next;
  window.__gannzillaReferencePanelStateV421 = next;
  try { localStorage.setItem(PANEL_KEY, JSON.stringify(next)); } catch (_) { /* runtime remains active */ }
  try { localStorage.setItem(REFERENCE_KEY, JSON.stringify(next)); } catch (_) { /* runtime remains active */ }
  try {
    const url = new URL(window.location.href);
    if (path === 'price.value') url.searchParams.set('startValue', String(value));
    if (path === 'price.increment') url.searchParams.set('increment', String(value));
    if (path === 'layout.size') url.searchParams.set('levels', String(value));
    if (path === 'layout.view') url.searchParams.set('divisions', String(value));
    if (path === 'layout.clockwise') url.searchParams.set('clockwise', value ? 'true' : 'false');
    url.searchParams.set('northLastCell', 'true');
    url.searchParams.set('canonicalCardinalGeometry', 'true');
    url.searchParams.set('startValueControlsOuterRing', 'true');
    url.searchParams.delete('startValueControlsFirstCell');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) { /* URL persistence is optional */ }
  window.__gannzillaCanonicalWheelGeometryLastCommitV486 = { path, value, source, at: Date.now() };
  return next;
}

function settings() {
  const state = readState();
  const query = params();
  const queryLevels = Number(query.get('levels'));
  const queryDivisions = Number(query.get('divisions'));
  const queryStart = Number(query.get('startValue'));
  const queryIncrement = Number(query.get('increment'));
  const stateLevels = Number(state?.layout?.size);
  const stateDivisions = Number(state?.layout?.view);
  const stateStart = Number(state?.price?.value);
  const stateIncrement = Number(state?.price?.increment);
  return {
    levels: clamp(Math.round(Number.isFinite(stateLevels) ? stateLevels : (Number.isFinite(queryLevels) ? queryLevels : 10)), 1, 9999),
    divisions: clamp(Math.round(Number.isFinite(stateDivisions) ? stateDivisions : (Number.isFinite(queryDivisions) ? queryDivisions : 36)), 3, 360),
    startValue: Number.isFinite(stateStart) ? stateStart : (Number.isFinite(queryStart) ? queryStart : 1),
    increment: Number.isFinite(stateIncrement) ? stateIncrement : (Number.isFinite(queryIncrement) ? queryIncrement : 1),
    clockwise: state?.layout?.clockwise !== false,
    visible: state?.layout?.visible !== false,
    innerRadius: numberParam('gannzillaInnerRadius', 170, 20, 1000),
    configuredRingWidth: numberParam('gannzillaRingWidth', 60, 4, 300),
    fontSize: numberParam('gannzillaFontSize', 13, 4, 40),
    fontWeight: Math.round(numberParam('gannzillaFontWeight', 700, 400, 900)),
  };
}

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-unlimited-ring-layers-v480="true"]',
    'canvas[data-gannzilla-unified-wheel-tools-v453="true"]',
    'canvas[data-gannzilla-native-wheel-scrollbars-hidden-v417="true"]',
    'canvas[data-gannzilla-keyboard-mouse-control-v459="true"]',
  ].join(','));
  if (preferred instanceof HTMLCanvasElement && !preferred.closest('aside')) return preferred;
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement)
        || canvas.id === DRAWING_OVERLAY_ID
        || canvas.id === THEME_OVERLAY_ID
        || canvas.closest('aside')) return false;
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

function drawText(ctx, value, x, y, fontSize, maxWidth, weight) {
  ctx.save();
  ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5);
  ctx.font = `${weight} ${fontSize}px Tahoma, Arial, sans-serif`;
  ctx.fillStyle = numberColor(value);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(value), 0, 0, Math.max(4, maxWidth));
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

  // Canonical geometry: one fixed 1..36 base ring plus the requested numeric layers.
  const totalRingCount = cfg.levels + 1;
  const maximumRadius = (MAX_SAFE_CANVAS_LOGICAL_SIZE - 240) / 2;
  const effectiveRingWidth = Math.min(
    cfg.configuredRingWidth,
    Math.max(1, (maximumRadius - cfg.innerRadius) / totalRingCount),
  );
  const requiredRadius = cfg.innerRadius + totalRingCount * effectiveRingWidth;
  const logicalSize = Math.ceil(Math.min(MAX_SAFE_CANVAS_LOGICAL_SIZE, requiredRadius * 2 + 180));
  const dpr = clamp(Number(window.devicePixelRatio) || 1, 1, 2);
  const oldLogicalWidth = Math.max(1, canvas.width / dpr);
  const rect = canvas.getBoundingClientRect();
  const visualScale = rect.width / oldLogicalWidth;

  if (Math.abs(oldLogicalWidth - logicalSize) > 1 || Math.abs(canvas.height / dpr - logicalSize) > 1) {
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
  // Half-cell offset makes the last cell center exactly north (12 o'clock).
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
  ctx.arc(cx, cy, cfg.innerRadius, 0, TWO_PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = GRID_STROKE;
  ctx.lineWidth = 0.9;
  ctx.stroke();

  const scaledFontSize = Math.max(3, Math.min(cfg.fontSize, effectiveRingWidth * 0.46));
  for (let ring = 1; ring <= totalRingCount; ring += 1) {
    const inner = cfg.innerRadius + (ring - 1) * effectiveRingWidth;
    const outer = inner + effectiveRingWidth;
    const mid = (inner + outer) / 2;
    const numericRingIndex = ring - 2;
    const fill = ring === 1 ? LIGHT_FILL : (numericRingIndex % 2 === 0 ? DARK_FILL : LIGHT_FILL);
    const maxWidth = (TWO_PI * mid / cfg.divisions) * 0.78;

    for (let index = 0; index < cfg.divisions; index += 1) {
      const startDegrees = northOffset + direction * index * sector;
      const endDegrees = northOffset + direction * (index + 1) * sector;
      const centerDegrees = northOffset + direction * (index + 0.5) * sector;
      wedge(ctx, cx, cy, inner, outer, startDegrees, endDegrees);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = GRID_STROKE;
      ctx.lineWidth = 0.9;
      ctx.stroke();

      const point = polar(cx, cy, mid, centerDegrees);
      const value = ring === 1
        ? index + 1
        : cfg.startValue + (numericRingIndex * cfg.divisions + index) * cfg.increment;
      const displayValue = Number.isInteger(value) ? value : Number(value.toFixed(4));
      drawText(ctx, displayValue, point.x, point.y, scaledFontSize, maxWidth, ring === 1 ? 800 : cfg.fontWeight);
    }
  }

  ctx.restore();

  const lastNumericValue = cfg.startValue + ((cfg.levels * cfg.divisions - 1) * cfg.increment);
  canvas.dataset.gannzillaCanonicalWheelGeometryV486 = 'true';
  canvas.dataset.gannzillaUnlimitedRingLayersV480 = 'true';
  canvas.dataset.gannzillaUnlimitedLayerCount = String(cfg.levels);
  canvas.dataset.gannzillaTotalVisibleRingCount = String(totalRingCount);
  canvas.dataset.gannzillaEffectiveRingWidth = String(effectiveRingWidth);
  canvas.dataset.gannzillaBaseRingNorth = String(cfg.divisions);
  canvas.dataset.gannzillaBaseRingEast = String(Math.round(cfg.divisions / 4));
  canvas.dataset.gannzillaBaseRingSouth = String(Math.round(cfg.divisions / 2));
  canvas.dataset.gannzillaBaseRingWest = String(Math.round(cfg.divisions * 3 / 4));
  canvas.dataset.gannzillaOuterStartValue = String(cfg.startValue);
  canvas.dataset.gannzillaOuterLastValue = String(lastNumericValue);
  canvas.dataset.gannzillaAlternatingPalette = 'strict';
  canvas.dataset.gannzillaAllBordersBlack = 'true';

  drawCount += 1;
  lastDraw = {
    source,
    levels: cfg.levels,
    totalRingCount,
    divisions: cfg.divisions,
    startValue: cfg.startValue,
    lastNumericValue,
    increment: cfg.increment,
    clockwise: cfg.clockwise,
    northCell: cfg.divisions,
    eastCell: Math.round(cfg.divisions / 4),
    southCell: Math.round(cfg.divisions / 2),
    westCell: Math.round(cfg.divisions * 3 / 4),
    effectiveRingWidth,
    at: Date.now(),
  };

  window.__gannzillaAllToolsRuntimeV482?.sched?.(`canonical-wheel-v${BUILD}-${source}`);
  window.dispatchEvent(new CustomEvent('gannzilla:canonical-wheel-geometry-v486', {
    detail: { ...lastDraw, build: BUILD },
  }));
  return true;
}

function schedule(source = 'schedule', delays = [0, 30, 100, 280]) {
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

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode() || window[STATE_KEY]) return;

  const onCanonical = (event) => {
    const path = event?.detail?.path;
    if (path) commitPath(path, event.detail.value, event.detail.source || 'canonical');
    schedule(`canonical-${path || 'unknown'}`);
  };
  const onInput = () => schedule('input');
  const onChange = () => schedule('change');
  const onDirection = () => schedule('direction');
  const onResize = () => schedule('resize', [0, 80, 260]);

  window.addEventListener('gannzilla:canonical-property-change-v326', onCanonical, true);
  window.addEventListener('gannzilla:reference-panel-change-v421', onCanonical, true);
  window.addEventListener('gannzilla:clockwise-direction-commit-v483', onDirection, true);
  window.addEventListener('gannzilla:unlimited-ring-layers-v480', onDirection, true);
  window.addEventListener('resize', onResize, true);
  document.addEventListener('input', onInput, true);
  document.addEventListener('change', onChange, true);

  [0, 50, 140, 340, 760, 1600, 3200, 5200, 6200].forEach((delay) => {
    setTimeout(() => schedule(`boot-${delay}`, [0, 40, 180]), delay);
  });

  window.GANNZILLA_CANONICAL_WHEEL_GEOMETRY_V486 = true;
  window.__auditGannzillaCanonicalWheelGeometryV486 = () => {
    const canvas = findWheel();
    const cfg = settings();
    const isCanonical36 = cfg.divisions === 36;
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaCanonicalWheelGeometryV486 === 'true'
        && (!isCanonical36 || (
          canvas.dataset.gannzillaBaseRingNorth === '36'
          && canvas.dataset.gannzillaBaseRingEast === '9'
          && canvas.dataset.gannzillaBaseRingSouth === '18'
          && canvas.dataset.gannzillaBaseRingWest === '27'
        )),
      build: BUILD,
      canonicalCardinals: {
        north12: isCanonical36 ? 36 : cfg.divisions,
        east3: isCanonical36 ? 9 : Math.round(cfg.divisions / 4),
        south6: isCanonical36 ? 18 : Math.round(cfg.divisions / 2),
        west9: isCanonical36 ? 27 : Math.round(cfg.divisions * 3 / 4),
      },
      fixedBaseRing: true,
      requestedNumericLayers: cfg.levels,
      totalVisibleRings: cfg.levels + 1,
      startValueBeginsOnSecondRing: true,
      configuredRingWidth: cfg.configuredRingWidth,
      effectiveRingWidth: Number(canvas?.dataset?.gannzillaEffectiveRingWidth),
      clockwise: cfg.clockwise,
      drawCount,
      lastDraw,
      lastCommit: window.__gannzillaCanonicalWheelGeometryLastCommitV486 || null,
    };
  };

  window[STATE_KEY] = { onCanonical, onInput, onChange, onDirection, onResize, schedule, draw, commitPath };
  schedule('install');
}

install();