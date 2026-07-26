const BUILD = 506;
const STATE_KEY = '__gannzillaFinalWheelAuthorityV506';
const PANEL_KEY = 'tasi-gannzilla-canonical-panel-v326';
const DRAWING_OVERLAY_ID = 'gannzilla-top-center-drawing-overlay-v471';
const THEME_OVERLAY_ID = 'gannzilla-wheel-line-theme-overlay-v473';
const TWO_PI = Math.PI * 2;
const MAX_SAFE_CANVAS_LOGICAL_SIZE = 15000;
const MAX_CANVAS_PIXEL_DIMENSION = 12000;
const CELL_FILL = '#ffffff';
const GRID_STROKE = '#b5b5b5';
const OUTER_STROKE = '#7a7a7a';
const RED_NUMBER_COLOR = '#a51d2d';
const BLUE_NUMBER_COLOR = '#003f9e';
const BLACK_NUMBER_COLOR = '#111111';
const NUMBER_FONT_FAMILY = 'Arial, "Helvetica Neue", Helvetica, Tahoma, sans-serif';
const NUMBER_FONT_SIZE = 28;
const NUMBER_FONT_WEIGHT = 700;
const DIGITAL_ROOT_FONT_SIZE = 28;
const DIGITAL_ROOT_FONT_WEIGHT = 700;
const ANCHOR_RING_SCALE = 1.10;
const REFERENCE_DIGIT_COUNT = 4;
const CELL_ARC_UTILIZATION = 0.84;
const CELL_TANGENTIAL_PADDING = 10;
const MAX_RING_WIDTH_MULTIPLIER = 12;
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

function currentZoom() {
  const runtime = Number(window.__gannzillaNativeDprZoomV504);
  if (Number.isFinite(runtime)) return clamp(runtime, 0.5, 3);
  const query = Number(params().get('gannzillaZoom'));
  return Number.isFinite(query) ? clamp(query, 0.5, 3) : 1;
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
    zoom: currentZoom(),
    adaptiveCellGeometry: booleanSetting('geometry.adaptiveCellGeometry', 'adaptiveCellGeometry', true),
    anchorRingScale: numericSetting(
      'geometry.anchorRingScale',
      'anchorRingScale',
      ANCHOR_RING_SCALE,
      1,
      1.5,
    ),
  };
}

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-final-wheel-authority-v506="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v505="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v504="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v491="true"]',
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

function devicePixelRatioValue() {
  return Math.max(1, Number(window.devicePixelRatio) || 1);
}

function snapText(value, dpr) {
  return Math.round(value * dpr) / dpr;
}

function displayValue(value) {
  return Number.isInteger(value) ? value : Number(value.toFixed(4));
}

function valueForCell(ring, index, cfg) {
  if (ring === 1) return index + 1;
  if (ring === 2) return digitalRoot(index + 1);
  return cfg.anchorValue
    + ((ring - 3) * cfg.divisions + (index + 1) - cfg.divisions) * cfg.increment;
}

function labelMetricsForRing(measureCtx, ring, cfg, visualZoom) {
  const fontSize = (ring === 2 ? DIGITAL_ROOT_FONT_SIZE : NUMBER_FONT_SIZE) * visualZoom;
  const fontWeight = ring === 2 ? DIGITAL_ROOT_FONT_WEIGHT : NUMBER_FONT_WEIGHT;
  measureCtx.font = `${fontWeight} ${fontSize}px ${NUMBER_FONT_FAMILY}`;

  let maxWidth = 0;
  let maxDigits = 1;
  let widestLabel = '';
  for (let index = 0; index < cfg.divisions; index += 1) {
    const text = String(displayValue(valueForCell(ring, index, cfg)));
    const width = measureCtx.measureText(text).width;
    const digits = text.replace(/[^0-9]/g, '').length;
    if (width > maxWidth) {
      maxWidth = width;
      widestLabel = text;
    }
    maxDigits = Math.max(maxDigits, digits);
  }
  return { maxWidth, maxDigits, widestLabel, fontSize };
}

function buildRingGeometry(cfg, visualZoom, adjustedInnerRadius) {
  const totalRingCount = cfg.levels + 3;
  const sectorRadians = TWO_PI / cfg.divisions;
  const baseRingWidth = cfg.ringWidth * visualZoom;
  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  const geometry = [];
  let cursor = adjustedInnerRadius;

  for (let ring = 1; ring <= totalRingCount; ring += 1) {
    const metrics = labelMetricsForRing(measureCtx, ring, cfg, visualZoom);
    const minimumWidth = baseRingWidth * (ring === 3 ? cfg.anchorRingScale : 1);
    let width = minimumWidth;
    let expandedForDigits = false;

    if (cfg.adaptiveCellGeometry && ring >= 3 && metrics.maxDigits > REFERENCE_DIGIT_COUNT) {
      const currentMidRadius = cursor + width / 2;
      const availableTangentialWidth = currentMidRadius * sectorRadians * CELL_ARC_UTILIZATION;
      const requiredTangentialWidth = metrics.maxWidth + CELL_TANGENTIAL_PADDING * visualZoom;

      if (requiredTangentialWidth > availableTangentialWidth) {
        const requiredMidRadius = requiredTangentialWidth
          / (sectorRadians * CELL_ARC_UTILIZATION);
        width = Math.max(width, 2 * (requiredMidRadius - cursor));
        width = Math.min(width, baseRingWidth * MAX_RING_WIDTH_MULTIPLIER);
        expandedForDigits = width > minimumWidth + 0.01;
      }
    }

    const inner = cursor;
    const outer = inner + width;
    geometry.push({
      ring,
      inner,
      outer,
      width,
      midRadius: inner + width / 2,
      minimumWidth,
      maxLabelWidth: metrics.maxWidth,
      maxDigits: metrics.maxDigits,
      widestLabel: metrics.widestLabel,
      expandedForDigits,
      anchorRingExpanded: ring === 3 && width >= baseRingWidth * cfg.anchorRingScale - 0.01,
    });
    cursor = outer;
  }

  return {
    geometry,
    outerRadius: cursor,
    baseRingWidth,
    sectorRadians,
  };
}

function drawNumber(ctx, value, x, y, dpr, visualZoom, options = {}) {
  const baseFontSize = options.fontSize || NUMBER_FONT_SIZE;
  const fontSize = Math.max(10, baseFontSize * visualZoom);
  const fontWeight = options.fontWeight || NUMBER_FONT_WEIGHT;
  const snappedX = snapText(x, dpr);
  const snappedY = snapText(y, dpr);

  ctx.save();
  ctx.font = `${fontWeight} ${fontSize}px ${NUMBER_FONT_FAMILY}`;
  if ('fontKerning' in ctx) ctx.fontKerning = 'normal';
  if ('fontStretch' in ctx) ctx.fontStretch = 'normal';
  if ('textRendering' in ctx) ctx.textRendering = 'optimizeLegibility';
  ctx.fillStyle = numberColor(value);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(value), snappedX, snappedY);
  ctx.restore();
}

function lockCanvasPresentation(canvas, cssSize) {
  const exact = `${cssSize}px`;
  canvas.style.setProperty('width', exact, 'important');
  canvas.style.setProperty('height', exact, 'important');
  canvas.style.setProperty('min-width', exact, 'important');
  canvas.style.setProperty('min-height', exact, 'important');
  canvas.style.setProperty('max-width', 'none', 'important');
  canvas.style.setProperty('max-height', 'none', 'important');
  canvas.style.setProperty('transform', 'none', 'important');
  canvas.style.setProperty('transform-origin', '0 0', 'important');
  canvas.style.setProperty('zoom', '1', 'important');
  canvas.style.setProperty('image-rendering', 'auto', 'important');
  canvas.dataset.gannzillaCssScaleDisabled = 'true';
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

  const dpr = devicePixelRatioValue();
  const numericRingCount = cfg.levels + 1;
  const totalRingCount = numericRingCount + 2;
  const baseInner = Math.max(20, cfg.originalInnerRadius - cfg.ringWidth);
  const baseLayout = buildRingGeometry(cfg, 1, baseInner);
  const baseLogicalSize = Math.ceil(Math.min(
    MAX_SAFE_CANVAS_LOGICAL_SIZE,
    baseLayout.outerRadius * 2 + 180,
  ));
  const maxZoomFromPixels = MAX_CANVAS_PIXEL_DIMENSION / Math.max(1, baseLogicalSize * dpr);
  const maxZoomFromLogical = MAX_SAFE_CANVAS_LOGICAL_SIZE / Math.max(1, baseLogicalSize);
  const appliedZoom = Math.min(cfg.zoom, Math.max(0.5, maxZoomFromPixels), maxZoomFromLogical);
  const adjustedInnerRadius = baseInner * appliedZoom;
  const layout = buildRingGeometry(cfg, appliedZoom, adjustedInnerRadius);
  const outerRadius = layout.outerRadius;
  const cssSize = Math.ceil(outerRadius * 2 + 180 * appliedZoom);
  const pixelSize = Math.round(cssSize * dpr);

  if (canvas.width !== pixelSize) canvas.width = pixelSize;
  if (canvas.height !== pixelSize) canvas.height = pixelSize;
  lockCanvasPresentation(canvas, cssSize);

  const width = cssSize;
  const height = cssSize;
  const cx = width / 2;
  const cy = height / 2;
  const sector = 360 / cfg.divisions;
  const direction = cfg.clockwise ? 1 : -1;
  const northOffset = direction * sector / 2;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return false;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = CELL_FILL;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.setLineDash([]);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.arc(cx, cy, adjustedInnerRadius, 0, TWO_PI);
  ctx.fillStyle = CELL_FILL;
  ctx.fill();
  ctx.strokeStyle = OUTER_STROKE;
  ctx.lineWidth = 0.85;
  ctx.stroke();

  layout.geometry.forEach((ringInfo) => {
    for (let index = 0; index < cfg.divisions; index += 1) {
      const startDegrees = northOffset + direction * index * sector;
      const endDegrees = northOffset + direction * (index + 1) * sector;
      const centerDegrees = northOffset + direction * (index + 0.5) * sector;

      wedge(ctx, cx, cy, ringInfo.inner, ringInfo.outer, startDegrees, endDegrees);
      ctx.fillStyle = CELL_FILL;
      ctx.fill();
      ctx.strokeStyle = GRID_STROKE;
      ctx.lineWidth = 0.55;
      ctx.stroke();

      const point = polar(cx, cy, ringInfo.midRadius, centerDegrees);
      const rawValue = valueForCell(ringInfo.ring, index, cfg);
      const shownValue = displayValue(rawValue);
      drawNumber(ctx, shownValue, point.x, point.y, dpr, appliedZoom, {
        fontSize: ringInfo.ring === 2 ? DIGITAL_ROOT_FONT_SIZE : NUMBER_FONT_SIZE,
        fontWeight: ringInfo.ring === 2 ? DIGITAL_ROOT_FONT_WEIGHT : NUMBER_FONT_WEIGHT,
      });
    }
  });

  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, 0, TWO_PI);
  ctx.strokeStyle = OUTER_STROKE;
  ctx.lineWidth = 0.9;
  ctx.stroke();
  ctx.restore();

  const northSpoke = Array.from({ length: numericRingCount }, (_, ringIndex) =>
    cfg.anchorValue + ringIndex * cfg.divisions * cfg.increment);
  const expectedFinalNorth = cfg.anchorValue + cfg.levels * cfg.divisions * cfg.increment;
  const anchorRing = layout.geometry.find((item) => item.ring === 3);
  const adaptiveRings = layout.geometry.filter((item) => item.expandedForDigits);
  const ringWidths = layout.geometry.map((item) => Number(item.width.toFixed(4)));

  canvas.dataset.gannzillaFinalWheelAuthorityV506 = 'true';
  canvas.dataset.gannzillaFinalWheelAuthorityV491 = 'true';
  canvas.dataset.gannzillaAuthorityBuild = String(BUILD);
  canvas.dataset.gannzillaNativeDpr = String(dpr);
  canvas.dataset.gannzillaRequestedZoom = String(cfg.zoom);
  canvas.dataset.gannzillaAppliedZoom = String(appliedZoom);
  canvas.dataset.gannzillaCanvasCssSize = String(cssSize);
  canvas.dataset.gannzillaCanvasPixelSize = String(pixelSize);
  canvas.dataset.gannzillaTextPixelSnapping = 'device-pixel-grid';
  canvas.dataset.gannzillaRadiusMidpointMode = 'exact-ring-midpoint';
  canvas.dataset.gannzillaCssScaleDisabled = 'true';
  canvas.dataset.gannzillaSecondRingBlank = 'false';
  canvas.dataset.gannzillaSecondRingMode = 'digital-root-1-9';
  canvas.dataset.gannzillaSecondRingNorth = '9';
  canvas.dataset.gannzillaAnchorValueRing = '3';
  canvas.dataset.gannzillaAnchorRingScale = String(cfg.anchorRingScale);
  canvas.dataset.gannzillaAnchorRingWidth = String(anchorRing?.width || 0);
  canvas.dataset.gannzillaAdaptiveCellGeometry = String(cfg.adaptiveCellGeometry);
  canvas.dataset.gannzillaAdaptiveExpandedRingCount = String(adaptiveRings.length);
  canvas.dataset.gannzillaAdaptiveExpandedRings = adaptiveRings.map((item) => item.ring).join(',');
  canvas.dataset.gannzillaRingWidths = ringWidths.join(',');
  canvas.dataset.gannzillaReferenceDigitCount = String(REFERENCE_DIGIT_COUNT);
  canvas.dataset.gannzillaOutwardOnlyExpansion = 'true';
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
  canvas.dataset.gannzillaUnifiedNumberFontSize = 'true';
  canvas.dataset.gannzillaGridStroke = GRID_STROKE;
  canvas.dataset.gannzillaGridLineWidth = '0.55';

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
    dpr,
    requestedZoom: cfg.zoom,
    appliedZoom,
    cssSize,
    pixelSize,
    numberFontSize: NUMBER_FONT_SIZE,
    digitalRootFontSize: DIGITAL_ROOT_FONT_SIZE,
    unifiedNumberFontSize: true,
    anchorRingScale: cfg.anchorRingScale,
    anchorRingWidth: anchorRing?.width || 0,
    adaptiveCellGeometry: cfg.adaptiveCellGeometry,
    adaptiveExpandedRingCount: adaptiveRings.length,
    adaptiveExpandedRings: adaptiveRings.map((item) => ({
      ring: item.ring,
      width: item.width,
      maxDigits: item.maxDigits,
      widestLabel: item.widestLabel,
    })),
    ringWidths,
    outwardOnlyExpansion: true,
    gridStroke: GRID_STROKE,
    gridLineWidth: 0.55,
    textPixelSnapping: 'device-pixel-grid',
    radiusMidpointMode: 'exact-ring-midpoint',
    cssScaleDisabled: true,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:final-wheel-authority-v491', {
    detail: { ...lastDraw, build: BUILD },
  }));
  window.dispatchEvent(new CustomEvent('gannzilla:final-wheel-authority-v506', {
    detail: { ...lastDraw, build: BUILD },
  }));
  return true;
}

function schedule(source = 'schedule', delays = [0, 80, 240, 600]) {
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
    url.searchParams.set('anchorRingScale', String(ANCHOR_RING_SCALE));
    url.searchParams.set('adaptiveCellGeometry', 'true');
    url.searchParams.set('outwardOnlyExpansion', 'true');
    url.searchParams.set('referenceDigitCount', String(REFERENCE_DIGIT_COUNT));
    url.searchParams.set('outerCyclesAfterAnchor', url.searchParams.get('levels') || '10');
    url.searchParams.set('secondRingNumbers', 'true');
    url.searchParams.set('secondRingMode', 'digitalRoot');
    url.searchParams.set('allCellsWhite', 'true');
    url.searchParams.set('cellFill', CELL_FILL);
    url.searchParams.set('alternatingRingShading', 'false');
    url.searchParams.set('blueNumberColor', BLUE_NUMBER_COLOR);
    url.searchParams.set('gannzillaNumberFontFamily', 'Arial');
    url.searchParams.set('gannzillaNumberFontSize', String(NUMBER_FONT_SIZE));
    url.searchParams.set('gannzillaNumberWeight', String(NUMBER_FONT_WEIGHT));
    url.searchParams.set('unifiedNumberFontSize', 'true');
    url.searchParams.set('gridStroke', GRID_STROKE);
    url.searchParams.set('gridLineWidth', '0.55');
    url.searchParams.set('nativeDprRendering', 'true');
    url.searchParams.set('textPixelSnapping', 'true');
    url.searchParams.set('cssScaleDisabled', 'true');
    url.searchParams.set('exactRadiusMidpoint', 'true');
    url.searchParams.set('gannzillaReferenceZoomCalibration', '1');
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
  const refresh = (event) => {
    persistFlags();
    schedule(event?.type || 'refresh');
  };

  window.addEventListener('gannzilla:canonical-property-change-v326', onCanonical, false);
  window.addEventListener('gannzilla:reference-panel-change-v421', onCanonical, false);
  window.addEventListener('gannzilla:clockwise-direction-commit-v483', refresh, false);
  window.addEventListener('gannzilla:native-dpr-zoom-v504', refresh, false);
  window.addEventListener('resize', refresh, false);
  document.addEventListener('input', refresh, true);
  document.addEventListener('change', refresh, true);

  const observer = new MutationObserver(() => {
    const canvas = findWheel();
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const expected = `${canvas.dataset.gannzillaCanvasCssSize || ''}px`;
    if (expected !== 'px' && (
      canvas.style.width !== expected
      || canvas.style.height !== expected
      || canvas.style.transform !== 'none'
      || canvas.style.zoom !== '1'
    )) schedule('presentation-repair', [0, 100]);
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['width', 'height', 'style'],
  });

  [0, 60, 220, 600, 1400, 3000, 6000].forEach((delay) =>
    setTimeout(() => schedule(`boot-${delay}`, [0, 160, 520]), delay));

  window.GANNZILLA_FINAL_WHEEL_AUTHORITY_V506 = true;
  window.GANNZILLA_ADAPTIVE_OUTWARD_CELLS_V506 = true;
  window.__auditGannzillaFinalWheelAuthorityV506 = () => {
    const canvas = findWheel();
    const cfg = settings();
    const dpr = devicePixelRatioValue();
    const expectedNorth = Array.from({ length: cfg.levels + 1 }, (_, ringIndex) =>
      cfg.anchorValue + ringIndex * cfg.divisions * cfg.increment);
    const expectedFinalNorth = cfg.anchorValue + cfg.levels * cfg.divisions * cfg.increment;
    const cssSize = Number(canvas?.dataset?.gannzillaCanvasCssSize || 0);
    const pixelSize = Number(canvas?.dataset?.gannzillaCanvasPixelSize || 0);
    const baseWidth = cfg.ringWidth * Number(canvas?.dataset?.gannzillaAppliedZoom || 0);
    const anchorWidth = Number(canvas?.dataset?.gannzillaAnchorRingWidth || 0);
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaFinalWheelAuthorityV506 === 'true'
        && canvas.dataset.gannzillaAuthorityBuild === String(BUILD)
        && Number(canvas.dataset.gannzillaNativeDpr) === dpr
        && Math.abs(pixelSize - Math.round(cssSize * dpr)) <= 1
        && canvas.dataset.gannzillaTextPixelSnapping === 'device-pixel-grid'
        && canvas.dataset.gannzillaRadiusMidpointMode === 'exact-ring-midpoint'
        && canvas.dataset.gannzillaCssScaleDisabled === 'true'
        && canvas.dataset.gannzillaUnifiedNumberFontSize === 'true'
        && Number(canvas.dataset.gannzillaNumberFontSize) === NUMBER_FONT_SIZE
        && canvas.dataset.gannzillaAdaptiveCellGeometry === 'true'
        && canvas.dataset.gannzillaOutwardOnlyExpansion === 'true'
        && anchorWidth >= baseWidth * cfg.anchorRingScale - 0.1
        && canvas.dataset.gannzillaSecondRingMode === 'digital-root-1-9'
        && canvas.dataset.gannzillaAnchorValue === String(cfg.anchorValue)
        && canvas.dataset.gannzillaNorthSpokeValues === expectedNorth.join(',')
        && Number(canvas.dataset.gannzillaExpectedFinalNorth) === expectedFinalNorth
        && canvas.dataset.gannzillaCellFill === CELL_FILL,
      build: BUILD,
      nativeDpr: dpr,
      requestedZoom: cfg.zoom,
      appliedZoom: Number(canvas?.dataset?.gannzillaAppliedZoom || 0),
      cssSize,
      pixelSize,
      fontFamily: 'Arial',
      numberFontSize: NUMBER_FONT_SIZE,
      digitalRootFontSize: DIGITAL_ROOT_FONT_SIZE,
      unifiedNumberFontSize: true,
      anchorRingScale: cfg.anchorRingScale,
      anchorRingWidth: anchorWidth,
      adaptiveCellGeometry: true,
      adaptiveExpandedRingCount: Number(canvas?.dataset?.gannzillaAdaptiveExpandedRingCount || 0),
      adaptiveExpandedRings: canvas?.dataset?.gannzillaAdaptiveExpandedRings || '',
      ringWidths: canvas?.dataset?.gannzillaRingWidths || '',
      referenceDigitCount: REFERENCE_DIGIT_COUNT,
      outwardOnlyExpansion: true,
      textPixelSnapping: 'device-pixel-grid',
      cssScaleDisabled: true,
      radiusMidpointMode: 'exact-ring-midpoint',
      northSpokeValues: expectedNorth,
      expectedFinalNorth,
      drawCount,
      lastDraw,
    };
  };

  window[STATE_KEY] = { onCanonical, refresh, observer, schedule, draw, overrides };
  schedule('install');
}

install();