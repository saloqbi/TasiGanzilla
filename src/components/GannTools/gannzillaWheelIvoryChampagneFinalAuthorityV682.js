const BUILD = 685;
const STATE_KEY = '__gannzillaWheelFourCardinalGoldRaysV685';
const FINAL_EVENT = 'gannzilla:final-wheel-authority-v506';
const TWO_PI = Math.PI * 2;

let applyCount = 0;
let lastApply = null;
let pendingFrame = 0;

function effectiveSearch() {
  return window.__gannzillaV672CanonicalSearch || window.location.search || '';
}

function params() {
  try { return new URLSearchParams(effectiveSearch()); }
  catch (_) { return new URLSearchParams(); }
}

function numberParam(name, fallback) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? value : fallback;
}

function booleanParam(name, fallback = false) {
  const query = params();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function enabled() {
  const query = params();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  return wheelMode && (window.location.pathname === '/v672.html'
    || booleanParam('wheelFourCardinalGoldRays', false));
}

function targetCanvas(canvas) {
  if (!(canvas instanceof HTMLCanvasElement) || canvas.closest('aside')) return false;
  const id = String(canvas.id || '').toLowerCase();
  if (id.includes('overlay') || id.includes('preview') || id.includes('tracker')) return false;
  return canvas.width > 300 && canvas.height > 300;
}

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-final-wheel-authority-v506="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v491="true"]',
    'canvas[data-gannzilla-native-wheel-scrollbars-hidden-v417="true"]',
  ].join(','));
  if (targetCanvas(preferred)) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter(targetCanvas)
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

function polar(cx, cy, radius, degrees) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function digitalRoot(value) {
  const integer = Math.abs(Math.trunc(Number(value) || 0));
  return integer === 0 ? 0 : 1 + ((integer - 1) % 9);
}

function numberColor(value) {
  const root = digitalRoot(value);
  if (root === 1 || root === 4 || root === 7) return '#a51d2d';
  if (root === 2 || root === 5 || root === 8) return '#003f9e';
  return '#111111';
}

function valueForCell(ring, index, divisions, anchorValue, increment) {
  if (ring === 1) return index + 1;
  if (ring === 2) return digitalRoot(index + 1);
  return anchorValue
    + ((ring - 3) * divisions + (index + 1) - divisions) * increment;
}

function displayValue(value) {
  return Number.isInteger(value) ? value : Number(value.toFixed(4));
}

function layeredLine(ctx, from, to) {
  [
    { color: '#5d3200', width: 4.60 },
    { color: '#a96708', width: 3.30 },
    { color: '#d99b25', width: 2.15 },
    { color: '#ffd978', width: 0.92 },
    { color: '#fff7df', width: 0.28 },
  ].forEach(({ color, width }) => {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  });
}

function redrawNumbers(ctx, geometry) {
  const {
    cx,
    cy,
    divisions,
    direction,
    sector,
    northOffset,
    boundaries,
    ringWidths,
    anchorValue,
    increment,
    appliedZoom,
    fontFamily,
    fontWeight,
    fontSize,
  } = geometry;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;

  ringWidths.forEach((width, ringIndex) => {
    const ring = ringIndex + 1;
    const midRadius = boundaries[ringIndex] + width / 2;
    const size = Math.max(10, fontSize * appliedZoom);
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;

    for (let index = 0; index < divisions; index += 1) {
      const centerDegrees = northOffset + direction * (index + 0.5) * sector;
      const point = polar(cx, cy, midRadius, centerDegrees);
      const rawValue = valueForCell(ring, index, divisions, anchorValue, increment);
      const shownValue = displayValue(rawValue);
      const text = String(shownValue);

      // Keep every number visually above the four rays without changing its position.
      ctx.strokeStyle = '#fffaf0';
      ctx.lineWidth = Math.max(1.4, 2.2 * appliedZoom);
      ctx.strokeText(text, point.x, point.y);
      ctx.fillStyle = numberColor(shownValue);
      ctx.fillText(text, point.x, point.y);
    }
  });

  ctx.restore();
}

function draw(source = 'draw') {
  pendingFrame = 0;
  if (!enabled()) return false;

  const wheel = findWheel();
  if (!targetCanvas(wheel)) return false;

  const cssSize = Number(wheel.dataset.gannzillaCanvasCssSize)
    || Number.parseFloat(wheel.style.width)
    || wheel.getBoundingClientRect().width;
  const dpr = Number(wheel.dataset.gannzillaNativeDpr)
    || Math.max(1, Number(window.devicePixelRatio) || 1);
  const appliedZoom = Number(wheel.dataset.gannzillaAppliedZoom)
    || numberParam('gannzillaZoom', 1);
  const divisions = Math.max(4, Math.round(numberParam('divisions', 36)));
  const clockwise = booleanParam('clockwise', true);
  const direction = clockwise ? 1 : -1;
  const sector = 360 / divisions;
  const northOffset = direction * sector / 2;

  const innerRadiusSetting = numberParam('gannzillaInnerRadius', 279.32);
  const ringWidthSetting = numberParam('gannzillaRingWidth', 96.76);
  const innerRadius = Math.max(20, innerRadiusSetting - ringWidthSetting) * appliedZoom;
  const ringWidths = String(wheel.dataset.gannzillaRingWidths || '')
    .split(',')
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0);
  if (!ringWidths.length) return false;

  const boundaries = [innerRadius];
  ringWidths.forEach((width) => boundaries.push(boundaries[boundaries.length - 1] + width));
  const outerRadius = boundaries[boundaries.length - 1];
  const cx = cssSize / 2;
  const cy = cssSize / 2;
  const ctx = wheel.getContext('2d');
  if (!ctx) return false;

  const anchorValue = numberParam('startValue', 3600);
  const increment = numberParam('increment', 1);
  const fontFamily = wheel.dataset.gannzillaNumberFontFamily || 'Arial';
  const fontWeight = Number(wheel.dataset.gannzillaNumberWeight) || 700;
  const fontSize = Number(wheel.dataset.gannzillaNumberFontSize) || 28;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.setLineDash([]);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  // Exactly four complete cardinal rays: 360/0, 90, 180 and 270 degrees.
  [0, 90, 180, 270].forEach((degrees) => {
    layeredLine(
      ctx,
      polar(cx, cy, innerRadius, degrees),
      polar(cx, cy, outerRadius, degrees),
    );
  });

  // Restore all numbers above the rays so no gold line cuts through the text.
  redrawNumbers(ctx, {
    cx,
    cy,
    divisions,
    direction,
    sector,
    northOffset,
    boundaries,
    ringWidths,
    anchorValue,
    increment,
    appliedZoom,
    fontFamily,
    fontWeight,
    fontSize,
  });

  ctx.restore();

  wheel.dataset.gannzillaWheelFourCardinalGoldRaysV685 = 'true';
  wheel.dataset.gannzillaWheelFourCardinalGoldRayCountV685 = '4';
  wheel.dataset.gannzillaWheelCardinalAnglesV685 = '0,90,180,270';
  wheel.dataset.gannzillaWheelNumbersRedrawnAboveRaysV685 = 'true';
  wheel.dataset.gannzillaWheelGeometryChangedV685 = 'false';
  wheel.dataset.gannzillaWheelNumberPositionsChangedV685 = 'false';

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    cssSize,
    dpr,
    divisions,
    cardinalAngles: [0, 90, 180, 270],
    cardinalRayCount: 4,
    numbersRedrawnAboveRays: true,
    innerRadius,
    outerRadius,
    geometryChanged: false,
    numberPositionsChanged: false,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule') {
  if (pendingFrame) cancelAnimationFrame(pendingFrame);
  pendingFrame = requestAnimationFrame(() => draw(source));
}

function install() {
  if (typeof window === 'undefined'
    || typeof document === 'undefined'
    || window[STATE_KEY]) return;

  window.addEventListener(FINAL_EVENT, () => schedule(FINAL_EVENT), false);
  window.addEventListener('gannzilla:native-dpr-zoom-v504', () => schedule('zoom'), false);
  window.addEventListener('resize', () => schedule('resize'), false);

  [0, 250, 1000].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  window.GANNZILLA_WHEEL_FOUR_CARDINAL_GOLD_RAYS_V685 = true;
  window.__auditGannzillaWheelFourCardinalGoldRaysV685 = () => {
    const wheel = findWheel();
    return {
      ok: wheel instanceof HTMLCanvasElement
        && wheel.dataset.gannzillaWheelFourCardinalGoldRaysV685 === 'true'
        && Number(wheel.dataset.gannzillaWheelFourCardinalGoldRayCountV685) === 4
        && wheel.dataset.gannzillaWheelCardinalAnglesV685 === '0,90,180,270'
        && wheel.dataset.gannzillaWheelNumbersRedrawnAboveRaysV685 === 'true',
      build: BUILD,
      enabled: enabled(),
      wheelFound: wheel instanceof HTMLCanvasElement,
      applyCount,
      observerActive: false,
      recurringTimerActive: false,
      pendingFrame: Boolean(pendingFrame),
      geometryChanged: false,
      numberPositionsChanged: false,
      lastApply,
    };
  };

  window[STATE_KEY] = { draw, schedule };
  schedule('install');
}

install();
