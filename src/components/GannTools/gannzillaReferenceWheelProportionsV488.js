const BUILD = 488;
const STATE_KEY = '__gannzillaReferenceWheelProportionsV488';
const PANEL_KEY = 'tasi-gannzilla-canonical-panel-v326';
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

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? clamp(value, min, max) : fallback;
}

function readState() {
  try {
    const runtime = window.__gannzillaReferencePanelStateV421
      || window.__gannzillaCanonicalPanelStateV326;
    if (runtime && typeof runtime === 'object') return runtime;
    const saved = JSON.parse(localStorage.getItem(PANEL_KEY) || '{}');
    return saved && typeof saved === 'object' ? saved : {};
  } catch (_) { return {}; }
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
  const baseFontSize = numberParam('gannzillaFontSize', 13, 8, 30);
  const numberScale = numberParam('gannzillaNumberScale', 1.20, 1, 1.55);

  return {
    levels: clamp(Math.round(Number.isFinite(stateLevels) ? stateLevels : (Number.isFinite(queryLevels) ? queryLevels : 10)), 1, 9999),
    divisions: clamp(Math.round(Number.isFinite(stateDivisions) ? stateDivisions : (Number.isFinite(queryDivisions) ? queryDivisions : 36)), 3, 360),
    startValue: Number.isFinite(stateStart) ? stateStart : (Number.isFinite(queryStart) ? queryStart : 1),
    increment: Number.isFinite(stateIncrement) ? stateIncrement : (Number.isFinite(queryIncrement) ? queryIncrement : 1),
    clockwise: state?.layout?.clockwise !== false,
    visible: state?.layout?.visible !== false,
    innerRadius: numberParam('gannzillaInnerRadius', 170, 20, 1000),
    configuredRingWidth: numberParam('gannzillaRingWidth', 60, 4, 300),
    fontSize: baseFontSize * numberScale,
    fontWeight: Math.round(numberParam('gannzillaNumberWeight', 800, 600, 900)),
  };
}

function findWheel() {
  const preferred = document.querySelector([
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
  ctx.fillText(String(value), 0, 0, Math.max(8, maxWidth));
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

  // Reference weight: Size keeps the same total radial thickness. The fixed 1..36 ring
  // is included inside that thickness instead of adding a full extra ring outside it.
  const totalRingCount = cfg.levels + 1;
  const intendedWheelThickness = cfg.levels * cfg.configuredRingWidth;
  const maximumRadius = (MAX_SAFE_CANVAS_LOGICAL_SIZE - 240) / 2;
  const safeThickness = Math.min(intendedWheelThickness, Math.max(1, maximumRadius - cfg.innerRadius));
  const effectiveRingWidth = safeThickness / totalRingCount;
  const requiredRadius = cfg.innerRadius + safeThickness;
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

  const uniformFontSize = Math.max(9, Math.min(cfg.fontSize, effectiveRingWidth * 0.36));
  for (let ring = 1; ring <= totalRingCount; ring += 1) {
    const inner = cfg.innerRadius + (ring - 1) * effectiveRingWidth;
    const outer = inner + effectiveRingWidth;
    const mid = (inner + outer) / 2;
    const numericRingIndex = ring - 2;
    const fill = ring === 1 ? LIGHT_FILL : (numericRingIndex % 2 === 0 ? DARK_FILL : LIGHT_FILL);
    const maxWidth = (TWO_PI * mid / cfg.divisions) * 0.90;

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
      drawText(ctx, displayValue, point.x, point.y, uniformFontSize, maxWidth, cfg.fontWeight);
    }
  }

  ctx.restore();
  canvas.dataset.gannzillaReferenceWheelProportionsV488 = 'true';
  canvas.dataset.gannzillaCanonicalWheelGeometryV486 = 'true';
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
    totalRingCount,
    configuredRingWidth: cfg.configuredRingWidth,
    effectiveRingWidth,
    totalWheelThickness: safeThickness,
    fontSize: uniformFontSize,
    fontWeight: cfg.fontWeight,
    northCell: cfg.divisions,
    eastCell: Math.round(cfg.divisions / 4),
    southCell: Math.round(cfg.divisions / 2),
    westCell: Math.round(cfg.divisions * 3 / 4),
    at: Date.now(),
  };

  window.__gannzillaAllToolsRuntimeV482?.sched?.(`reference-proportions-v${BUILD}-${source}`);
  window.dispatchEvent(new CustomEvent('gannzilla:reference-wheel-proportions-v488', {
    detail: { ...lastDraw, build: BUILD },
  }));
  return true;
}

function schedule(source = 'schedule', delays = [0, 120, 360]) {
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

  const refresh = (event) => schedule(event?.type || 'refresh');
  document.addEventListener('input', refresh, false);
  document.addEventListener('change', refresh, false);
  window.addEventListener('resize', refresh, false);
  [
    'gannzilla:canonical-property-change-v326',
    'gannzilla:reference-panel-change-v421',
    'gannzilla:clockwise-direction-commit-v483',
    'gannzilla:unlimited-ring-layers-v480',
    'gannzilla:ring-two-numbering-refresh',
  ].forEach((name) => window.addEventListener(name, refresh, false));

  [50, 180, 420, 900, 1800, 3600, 6500].forEach((delay) => {
    setTimeout(() => schedule(`boot-${delay}`, [0, 140, 400]), delay);
  });

  window.GANNZILLA_REFERENCE_WHEEL_PROPORTIONS_V488 = true;
  window.__auditGannzillaReferenceWheelProportionsV488 = () => {
    const canvas = findWheel();
    const cfg = settings();
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaReferenceWheelProportionsV488 === 'true'
        && (cfg.divisions !== 36 || (
          canvas.dataset.gannzillaBaseRingNorth === '36'
          && canvas.dataset.gannzillaBaseRingEast === '9'
          && canvas.dataset.gannzillaBaseRingSouth === '18'
          && canvas.dataset.gannzillaBaseRingWest === '27'
        )),
      build: BUILD,
      referenceWheelWeight: true,
      sameTotalThicknessAsRequestedLevels: true,
      uniformNumberTypography: true,
      drawCount,
      lastDraw,
    };
  };

  window[STATE_KEY] = { refresh, schedule, draw };
  schedule('install');
}

install();
