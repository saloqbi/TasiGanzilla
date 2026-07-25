const BUILD = 502;
const STATE_KEY = '__gannzillaFinalWheelAuthorityV502';
const PANEL_KEY = 'tasi-gannzilla-canonical-panel-v326';
const DRAWING_OVERLAY_ID = 'gannzilla-top-center-drawing-overlay-v471';
const THEME_OVERLAY_ID = 'gannzilla-wheel-line-theme-overlay-v473';
const TWO_PI = Math.PI * 2;
const MAX_SAFE_CANVAS_LOGICAL_SIZE = 15000;
const CELL_FILL = '#ffffff';
const GRID_STROKE = '#777777';
const OUTER_STROKE = '#3f3f3f';
const RED_NUMBER_COLOR = '#a51d2d';
const BLUE_NUMBER_COLOR = '#003f9e';
const BLACK_NUMBER_COLOR = '#111111';
const NUMBER_FONT_FAMILY = 'Arial, "Helvetica Neue", Helvetica, Tahoma, sans-serif';
const NUMBER_FONT_SIZE = 19;
const NUMBER_FONT_WEIGHT = 700;
const DIGITAL_ROOT_FONT_SIZE = 28;
const DIGITAL_ROOT_FONT_WEIGHT = 700;
const overrides = new Map();

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

function readState() {
  try {
    const runtime = window.__gannzillaReferencePanelStateV421
      || window.__gannzillaCanonicalPanelStateV326;
    if (runtime && typeof runtime === 'object') return runtime;
    const saved = JSON.parse(localStorage.getItem(PANEL_KEY) || '{}');
    return saved && typeof saved === 'object' ? saved : {};
  } catch (_) {
    return {};
  }
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
  return {
    levels: Math.round(numericSetting('layout.size', 'levels', 10, 1, 9999)),
    divisions: Math.round(numericSetting('layout.view', 'divisions', 36, 3, 360)),
    anchorValue: numericSetting('price.value', 'startValue', 3600, -1e9, 1e9),
    increment: numericSetting('price.increment', 'increment', 1, -1e6, 1e6),
    clockwise: booleanSetting('layout.clockwise', 'clockwise', true),
    visible: booleanSetting('layout.visible', 'wheelVisible', true),
    originalInnerRadius: numericSetting('geometry.innerRadius', 'gannzillaInnerRadius', 170, 20, 1000),
    ringWidth: numericSetting('geometry.ringWidth', 'gannzillaRingWidth', 60, 4, 300),
  };
}

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-final-wheel-authority-v502="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v501="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v500="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v491="true"]',
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
  if (root === 1 || root === 4 || root === 7) return RED_NUMBER_COLOR;
  if (root === 2 || root === 5 || root === 8) return BLUE_NUMBER_COLOR;
  return BLACK_NUMBER_COLOR;
}

function drawNumber(ctx, value, x, y, dpr, options = {}) {
  const fontSize = options.fontSize || NUMBER_FONT_SIZE;
  const fontWeight = options.fontWeight || NUMBER_FONT_WEIGHT;
  ctx.save();
  ctx.translate(Math.round(x * dpr) / dpr, Math.round(y * dpr) / dpr);
  ctx.font = `${fontWeight} ${fontSize}px ${NUMBER_FONT_FAMILY}`;
  if ('fontKerning' in ctx) ctx.fontKerning = 'normal';
  if ('fontStretch' in ctx) ctx.fontStretch = 'normal';
  if ('textRendering' in ctx) ctx.textRendering = 'geometricPrecision';
  ctx.fillStyle = numberColor(value);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(value), 0, 0);
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

  const numericRingCount = cfg.levels + 1;
  const totalRingCount = numericRingCount + 2;
  const adjustedInnerRadius = Math.max(20, cfg.originalInnerRadius - cfg.ringWidth);
  const maximumOuterRadius = (MAX_SAFE_CANVAS_LOGICAL_SIZE - 240) / 2;
  const requestedOuterRadius = adjustedInnerRadius + totalRingCount * cfg.ringWidth;
  const safetyScaled = requestedOuterRadius > maximumOuterRadius;
  const effectiveRingWidth = safetyScaled
    ? Math.max(1, (maximumOuterRadius - adjustedInnerRadius) / totalRingCount)
    : cfg.ringWidth;
  const outerRadius = adjustedInnerRadius + totalRingCount * effectiveRingWidth;
  const logicalSize = Math.ceil(Math.min(MAX_SAFE_CANVAS_LOGICAL_SIZE, outerRadius * 2 + 180));
  const dpr = clamp(Number(window.devicePixelRatio) || 1, 1, 2);
  const previousLogicalWidth = Math.max(1, canvas.width / dpr);
  const rect = canvas.getBoundingClientRect();
  const visualScale = rect.width > 0 ? rect.width / previousLogicalWidth : 1;

  if (Math.abs(previousLogicalWidth - logicalSize) > 1
    || Math.abs(canvas.height / dpr - logicalSize) > 1) {
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
  ctx.fillStyle = CELL_FILL;
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.beginPath();
  ctx.arc(cx, cy, adjustedInnerRadius, 0, TWO_PI);
  ctx.fillStyle = CELL_FILL;
  ctx.fill();
  ctx.strokeStyle = OUTER_STROKE;
  ctx.lineWidth = 1.15;
  ctx.stroke();

  for (let ring = 1; ring <= totalRingCount; ring += 1) {
    const inner = adjustedInnerRadius + (ring - 1) * effectiveRingWidth;
    const outer = inner + effectiveRingWidth;
    const mid = (inner + outer) / 2;

    for (let index = 0; index < cfg.divisions; index += 1) {
      const startDegrees = northOffset + direction * index * sector;
      const endDegrees = northOffset + direction * (index + 1) * sector;
      const centerDegrees = northOffset + direction * (index + 0.5) * sector;
      wedge(ctx, cx, cy, inner, outer, startDegrees, endDegrees);
      ctx.fillStyle = CELL_FILL;
      ctx.fill();
      ctx.strokeStyle = GRID_STROKE;
      ctx.lineWidth = 0.9;
      ctx.stroke();

      const point = polar(cx, cy, mid, centerDegrees);
      if (ring === 2) {
        const rootValue = digitalRoot(index + 1);
        drawNumber(ctx, rootValue, point.x, point.y, dpr, {
          fontSize: DIGITAL_ROOT_FONT_SIZE,
          fontWeight: DIGITAL_ROOT_FONT_WEIGHT,
        });
        continue;
      }

      const value = ring === 1
        ? index + 1
        : cfg.anchorValue
          + ((ring - 3) * cfg.divisions + (index + 1) - cfg.divisions) * cfg.increment;
      const displayValue = Number.isInteger(value) ? value : Number(value.toFixed(4));
      drawNumber(ctx, displayValue, point.x, point.y, dpr);
    }
  }

  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, 0, TWO_PI);
  ctx.strokeStyle = OUTER_STROKE;
  ctx.lineWidth = 1.25;
  ctx.stroke();
  ctx.restore();

  const northSpoke = Array.from({ length: numericRingCount }, (_, ringIndex) =>
    cfg.anchorValue + ringIndex * cfg.divisions * cfg.increment);
  const expectedFinalNorth = cfg.anchorValue + cfg.levels * cfg.divisions * cfg.increment;

  canvas.dataset.gannzillaFinalWheelAuthorityV502 = 'true';
  canvas.dataset.gannzillaFinalWheelAuthorityV491 = 'true';
  canvas.dataset.gannzillaAuthorityBuild = String(BUILD);
  canvas.dataset.gannzillaTotalVisibleRingCount = String(totalRingCount);
  canvas.dataset.gannzillaNumericRingCount = String(numericRingCount);
  canvas.dataset.gannzillaSecondRingBlank = 'false';
  canvas.dataset.gannzillaSecondRingMode = 'digital-root-1-9';
  canvas.dataset.gannzillaSecondRingNorth = '9';
  canvas.dataset.gannzillaSecondRingFontSize = String(DIGITAL_ROOT_FONT_SIZE);
  canvas.dataset.gannzillaAnchorValueRing = '3';
  canvas.dataset.gannzillaAnchorValue = String(cfg.anchorValue);
  canvas.dataset.gannzillaNorthSpokeValues = northSpoke.join(',');
  canvas.dataset.gannzillaExpectedFinalNorth = String(expectedFinalNorth);
  canvas.dataset.gannzillaCellFill = CELL_FILL;
  canvas.dataset.gannzillaAllCellsWhite = 'true';
  canvas.dataset.gannzillaAlternatingRingShading = 'false';
  canvas.dataset.gannzillaBlueNumberColor = BLUE_NUMBER_COLOR;
  canvas.dataset.gannzillaNumberFontFamily = 'Arial';
  canvas.dataset.gannzillaNumberFontSize = String(NUMBER_FONT_SIZE);
  canvas.dataset.gannzillaNumberWeight = String(NUMBER_FONT_WEIGHT);
  canvas.dataset.gannzillaNumberHorizontalCompression = 'false';

  drawCount += 1;
  lastDraw = {
    source,
    levels: cfg.levels,
    divisions: cfg.divisions,
    anchorValue: cfg.anchorValue,
    numericRingCount,
    totalRingCount,
    northSpoke,
    expectedFinalNorth,
    cellFill: CELL_FILL,
    allCellsWhite: true,
    alternatingRingShading: false,
    secondRing: {
      mode: 'digital-root-1-9',
      north: 9,
      fontSize: DIGITAL_ROOT_FONT_SIZE,
      fontWeight: DIGITAL_ROOT_FONT_WEIGHT,
    },
    blueNumberColor: BLUE_NUMBER_COLOR,
    numberFontSize: NUMBER_FONT_SIZE,
    safetyScaled,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:final-wheel-authority-v491', {
    detail: { ...lastDraw, build: BUILD },
  }));
  window.dispatchEvent(new CustomEvent('gannzilla:final-wheel-authority-v502', {
    detail: { ...lastDraw, build: BUILD },
  }));
  return true;
}

function schedule(source = 'schedule', delays = [0, 60, 180, 420, 900]) {
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
    url.searchParams.set('anchorValueAtNorth', 'true');
    url.searchParams.set('anchorValueRing', '3');
    url.searchParams.set('outerCyclesAfterAnchor', url.searchParams.get('levels') || '10');
    url.searchParams.set('secondRingNumbers', 'true');
    url.searchParams.set('secondRingMode', 'digitalRoot');
    url.searchParams.set('secondRingFontSize', String(DIGITAL_ROOT_FONT_SIZE));
    url.searchParams.set('allCellsWhite', 'true');
    url.searchParams.set('cellFill', CELL_FILL);
    url.searchParams.set('alternatingRingShading', 'false');
    url.searchParams.set('blueNumberColor', BLUE_NUMBER_COLOR);
    url.searchParams.set('gannzillaNumberFontFamily', 'Arial');
    url.searchParams.set('gannzillaNumberFontSize', String(NUMBER_FONT_SIZE));
    url.searchParams.set('gannzillaNumberWeight', String(NUMBER_FONT_WEIGHT));
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
  const onCanonical = (event) => {
    const path = event?.detail?.path;
    if (path) overrides.set(path, event.detail.value);
    schedule(`canonical-${path || 'unknown'}`);
  };
  const refresh = (event) => schedule(event?.type || 'refresh');

  window.addEventListener('gannzilla:canonical-property-change-v326', onCanonical, false);
  window.addEventListener('gannzilla:reference-panel-change-v421', onCanonical, false);
  window.addEventListener('gannzilla:clockwise-direction-commit-v483', refresh, false);
  window.addEventListener('resize', refresh, false);
  document.addEventListener('input', refresh, true);
  document.addEventListener('change', refresh, true);

  const observer = new MutationObserver((records) => {
    const canvas = findWheel();
    if (records.some((record) => record.target !== canvas && !canvas?.contains?.(record.target))) {
      schedule('mutation', [0, 100, 360]);
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['width', 'height'],
  });

  [0, 50, 180, 420, 900, 1800, 3600, 5600, 7600, 9000].forEach((delay) =>
    setTimeout(() => schedule(`boot-${delay}`, [0, 120, 420]), delay));

  window.GANNZILLA_FINAL_WHEEL_AUTHORITY_V502 = true;
  window.GANNZILLA_DIGITAL_ROOT_SECOND_RING_V502 = true;
  window.GANNZILLA_DARK_BLUE_NUMBERS_V502 = true;
  window.__auditGannzillaFinalWheelAuthorityV502 = () => {
    const canvas = findWheel();
    const cfg = settings();
    const expectedNorth = Array.from({ length: cfg.levels + 1 }, (_, ringIndex) =>
      cfg.anchorValue + ringIndex * cfg.divisions * cfg.increment);
    const expectedFinalNorth = cfg.anchorValue + cfg.levels * cfg.divisions * cfg.increment;
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaFinalWheelAuthorityV502 === 'true'
        && canvas.dataset.gannzillaAuthorityBuild === String(BUILD)
        && canvas.dataset.gannzillaSecondRingBlank === 'false'
        && canvas.dataset.gannzillaSecondRingMode === 'digital-root-1-9'
        && canvas.dataset.gannzillaSecondRingNorth === '9'
        && Number(canvas.dataset.gannzillaSecondRingFontSize) === DIGITAL_ROOT_FONT_SIZE
        && canvas.dataset.gannzillaBlueNumberColor === BLUE_NUMBER_COLOR
        && canvas.dataset.gannzillaAnchorValue === String(cfg.anchorValue)
        && canvas.dataset.gannzillaNorthSpokeValues === expectedNorth.join(',')
        && Number(canvas.dataset.gannzillaExpectedFinalNorth) === expectedFinalNorth
        && canvas.dataset.gannzillaCellFill === CELL_FILL
        && canvas.dataset.gannzillaAllCellsWhite === 'true'
        && canvas.dataset.gannzillaAlternatingRingShading === 'false'
        && Number(canvas.dataset.gannzillaNumberFontSize) === NUMBER_FONT_SIZE,
      build: BUILD,
      anchorValue: cfg.anchorValue,
      outerCycles: cfg.levels,
      cycleSize: cfg.divisions * cfg.increment,
      firstOuterCycle: {
        start: cfg.anchorValue + cfg.increment,
        end: cfg.anchorValue + cfg.divisions * cfg.increment,
      },
      finalOuterCycle: {
        start: cfg.anchorValue + ((cfg.levels - 1) * cfg.divisions + 1) * cfg.increment,
        end: expectedFinalNorth,
      },
      secondRing: {
        mode: 'digital-root-1-9',
        clockwiseSequenceFromNorth: [9, 1, 2, 3, 4, 5, 6, 7, 8],
        north: 9,
        fontSize: DIGITAL_ROOT_FONT_SIZE,
        fontWeight: DIGITAL_ROOT_FONT_WEIGHT,
      },
      blueNumberColor: BLUE_NUMBER_COLOR,
      northSpokeValues: expectedNorth,
      expectedFinalNorth,
      cellFill: CELL_FILL,
      allCellsWhite: true,
      alternatingRingShading: false,
      fontSize: NUMBER_FONT_SIZE,
      drawCount,
      lastDraw,
    };
  };

  window[STATE_KEY] = { onCanonical, refresh, observer, schedule, draw, overrides };
  schedule('install');
}

install();
