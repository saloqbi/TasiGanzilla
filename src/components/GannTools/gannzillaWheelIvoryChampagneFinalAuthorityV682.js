const BUILD = 687;
const STATE_KEY = '__gannzillaWheelFourIndexedGoldRaysV687';
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
    || booleanParam('wheelFourIndexedGoldRays', false)
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

function drawGoldRay(ctx, from, to) {
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

function indexedCardinalSpokes(divisions) {
  if (divisions === 36) return [0, 9, 18, 27];
  if (divisions % 4 === 0) {
    const step = divisions / 4;
    return [0, step, step * 2, step * 3];
  }
  return [];
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

  const outerRadius = ringWidths.reduce((sum, width) => sum + width, innerRadius);
  const indices = indexedCardinalSpokes(divisions);
  if (indices.length !== 4) return false;

  const boundaryDegrees = Array.from(
    { length: divisions },
    (_, index) => northOffset + direction * index * sector,
  );

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

  const resolvedDegrees = indices.map((spokeIndex) => {
    const degrees = boundaryDegrees[spokeIndex];
    drawGoldRay(
      ctx,
      polar(cx, cy, innerRadius, degrees),
      polar(cx, cy, outerRadius, degrees),
    );
    return degrees;
  });

  ctx.restore();

  wheel.dataset.gannzillaWheelFourIndexedGoldRaysV687 = 'true';
  wheel.dataset.gannzillaWheelCardinalIndicesV687 = indices.join(',');
  wheel.dataset.gannzillaWheelResolvedDegreesV687 = resolvedDegrees.join(',');
  wheel.dataset.gannzillaWheelFourIndexedGoldRayCountV687 = '4';
  wheel.dataset.gannzillaWheelLateFinalPassV687 = source.includes('late') ? 'true' : 'false';
  wheel.dataset.gannzillaWheelGeometryChangedV687 = 'false';
  wheel.dataset.gannzillaWheelNumberLayoutChangedV687 = 'false';

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    divisions,
    indices,
    resolvedDegrees,
    cardinalRayCount: 4,
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

  window.GANNZILLA_WHEEL_FOUR_INDEXED_GOLD_RAYS_V687 = true;
  window.__auditGannzillaWheelFourIndexedGoldRaysV687 = () => {
    const wheel = findWheel();
    return {
      ok: wheel instanceof HTMLCanvasElement
        && wheel.dataset.gannzillaWheelFourIndexedGoldRaysV687 === 'true'
        && wheel.dataset.gannzillaWheelCardinalIndicesV687 === '0,9,18,27'
        && Number(wheel.dataset.gannzillaWheelFourIndexedGoldRayCountV687) === 4,
      build: BUILD,
      enabled: enabled(),
      wheelFound: wheel instanceof HTMLCanvasElement,
      cardinalIndices: wheel?.dataset?.gannzillaWheelCardinalIndicesV687 || '',
      resolvedDegrees: wheel?.dataset?.gannzillaWheelResolvedDegreesV687 || '',
      lateFinalPass: wheel?.dataset?.gannzillaWheelLateFinalPassV687 === 'true',
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
