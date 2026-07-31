const BUILD = 688;
const STATE_KEY = '__gannzillaWheelCardinalOutlineOnlyV688';
const FINAL_EVENT = 'gannzilla:final-wheel-authority-v506';

let applyCount = 0;
let pendingFrame = 0;
let pendingTimers = [];
let lastApply = null;

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
  return wheelMode && (
    window.location.pathname === '/v672.html'
    || booleanParam('wheelCardinalOutlineOnly', false)
  );
}

function isWheelCanvas(canvas) {
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
  if (isWheelCanvas(preferred)) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter(isWheelCanvas)
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

function polar(cx, cy, radius, degrees) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function drawGoldEdge(ctx, from, to) {
  [
    { color: '#4f2900', width: 6.20 },
    { color: '#8f5105', width: 4.65 },
    { color: '#c98517', width: 3.15 },
    { color: '#f0bd55', width: 1.60 },
    { color: '#ffe6a8', width: 0.62 },
  ].forEach(({ color, width }) => {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  });
}

function cardinalOutlineFrames(divisions) {
  if (divisions < 4 || divisions % 4 !== 0) return [];
  const halfSector = 180 / divisions;
  return [0, 90, 180, 270].map((centerDegrees) => ({
    centerDegrees,
    leadingEdgeDegrees: centerDegrees - halfSector,
    trailingEdgeDegrees: centerDegrees + halfSector,
  }));
}

function draw(source = 'draw') {
  pendingFrame = 0;
  if (!enabled()) return false;

  const wheel = findWheel();
  if (!isWheelCanvas(wheel)) return false;

  const cssSize = Number(wheel.dataset.gannzillaCanvasCssSize)
    || Number.parseFloat(wheel.style.width)
    || wheel.getBoundingClientRect().width;
  const dpr = Number(wheel.dataset.gannzillaNativeDpr)
    || Math.max(1, Number(window.devicePixelRatio) || 1);
  const appliedZoom = Number(wheel.dataset.gannzillaAppliedZoom)
    || numberParam('gannzillaZoom', 1);
  const divisions = Math.max(4, Math.round(numberParam('divisions', 36)));

  const innerRadiusSetting = numberParam('gannzillaInnerRadius', 279.32);
  const ringWidthSetting = numberParam('gannzillaRingWidth', 96.76);
  const innerRadius = Math.max(20, innerRadiusSetting - ringWidthSetting) * appliedZoom;
  const ringWidths = String(wheel.dataset.gannzillaRingWidths || '')
    .split(',')
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0);
  if (!ringWidths.length) return false;

  const outerRadius = ringWidths.reduce((sum, width) => sum + width, innerRadius);
  const frames = cardinalOutlineFrames(divisions);
  if (frames.length !== 4) return false;

  const cx = cssSize / 2;
  const cy = cssSize / 2;
  const ctx = wheel.getContext('2d');
  if (!ctx) return false;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.setLineDash([]);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  frames.forEach(({ leadingEdgeDegrees, trailingEdgeDegrees }) => {
    drawGoldEdge(
      ctx,
      polar(cx, cy, innerRadius, leadingEdgeDegrees),
      polar(cx, cy, outerRadius, leadingEdgeDegrees),
    );
    drawGoldEdge(
      ctx,
      polar(cx, cy, innerRadius, trailingEdgeDegrees),
      polar(cx, cy, outerRadius, trailingEdgeDegrees),
    );
  });

  ctx.restore();

  const edgeDegrees = frames.flatMap(({ leadingEdgeDegrees, trailingEdgeDegrees }) => [
    leadingEdgeDegrees,
    trailingEdgeDegrees,
  ]);

  wheel.dataset.gannzillaWheelCardinalOutlineOnlyV688 = 'true';
  wheel.dataset.gannzillaWheelCardinalCentersV688 = '0,90,180,270';
  wheel.dataset.gannzillaWheelCardinalOutlineEdgeDegreesV688 = edgeDegrees.join(',');
  wheel.dataset.gannzillaWheelCardinalOutlineFrameCountV688 = '4';
  wheel.dataset.gannzillaWheelCardinalRadialEdgeCountV688 = '8';
  wheel.dataset.gannzillaWheelCardinalInteriorFillV688 = 'none';
  wheel.dataset.gannzillaWheelLateFinalPassV688 = source.includes('late') ? 'true' : 'false';
  wheel.dataset.gannzillaWheelGeometryChangedV688 = 'false';
  wheel.dataset.gannzillaWheelNumberLayoutChangedV688 = 'false';

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    divisions,
    cardinalCenters: [0, 90, 180, 270],
    edgeDegrees,
    outlineFrameCount: 4,
    radialEdgeCount: 8,
    interiorFill: 'none',
    lateFinalPass: source.includes('late'),
    innerRadius,
    outerRadius,
    geometryChanged: false,
    numberLayoutChanged: false,
    at: Date.now(),
  };
  return true;
}

function clearScheduledDraws() {
  pendingTimers.forEach((timer) => window.clearTimeout(timer));
  pendingTimers = [];
  if (pendingFrame) cancelAnimationFrame(pendingFrame);
  pendingFrame = 0;
}

function schedule(source = 'schedule', delays = [70, 260]) {
  clearScheduledDraws();
  pendingTimers = delays.map((delay, passIndex) => window.setTimeout(() => {
    pendingFrame = requestAnimationFrame(() => {
      draw(passIndex === delays.length - 1 ? `${source}-late` : source);
    });
  }, delay));
}

function install() {
  if (typeof window === 'undefined'
    || typeof document === 'undefined'
    || window[STATE_KEY]) return;

  window.addEventListener(FINAL_EVENT, () => schedule(FINAL_EVENT, [70, 260]), false);
  window.addEventListener('gannzilla:native-dpr-zoom-v504', () => schedule('zoom', [50, 210]), false);
  window.addEventListener('resize', () => schedule('resize', [50, 210]), false);

  window.setTimeout(() => schedule('boot', [0, 320, 1200]), 0);

  window.GANNZILLA_WHEEL_CARDINAL_OUTLINE_ONLY_V688 = true;
  window.__auditGannzillaWheelCardinalOutlineOnlyV688 = () => {
    const wheel = findWheel();
    return {
      ok: wheel instanceof HTMLCanvasElement
        && wheel.dataset.gannzillaWheelCardinalOutlineOnlyV688 === 'true'
        && wheel.dataset.gannzillaWheelCardinalCentersV688 === '0,90,180,270'
        && Number(wheel.dataset.gannzillaWheelCardinalOutlineFrameCountV688) === 4
        && Number(wheel.dataset.gannzillaWheelCardinalRadialEdgeCountV688) === 8
        && wheel.dataset.gannzillaWheelCardinalInteriorFillV688 === 'none',
      build: BUILD,
      enabled: enabled(),
      wheelFound: wheel instanceof HTMLCanvasElement,
      cardinalCenters: wheel?.dataset?.gannzillaWheelCardinalCentersV688 || '',
      edgeDegrees: wheel?.dataset?.gannzillaWheelCardinalOutlineEdgeDegreesV688 || '',
      outlineFrameCount: Number(wheel?.dataset?.gannzillaWheelCardinalOutlineFrameCountV688 || 0),
      radialEdgeCount: Number(wheel?.dataset?.gannzillaWheelCardinalRadialEdgeCountV688 || 0),
      interiorFill: wheel?.dataset?.gannzillaWheelCardinalInteriorFillV688 || '',
      lateFinalPass: wheel?.dataset?.gannzillaWheelLateFinalPassV688 === 'true',
      applyCount,
      observerActive: false,
      recurringTimerActive: false,
      geometryChanged: false,
      numberLayoutChanged: false,
      lastApply,
    };
  };

  window[STATE_KEY] = { draw, schedule, clearScheduledDraws };
  schedule('install', [0, 320, 1200]);
}

install();
