const BUILD = 682;
const STATE_KEY = '__gannzillaWheelIvoryChampagneFinalAuthorityV682';
const FINAL_EVENT = 'gannzilla:final-wheel-authority-v506';
const LEGACY_FINAL_EVENT = 'gannzilla:final-wheel-authority-v491';
const TWO_PI = Math.PI * 2;

let applyCount = 0;
let lastApply = null;
let observer = null;

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
    || booleanParam('wheelIvoryChampagneFinal', false));
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

function layeredLine(ctx, from, to, layers) {
  layers.forEach(({ color, width }) => {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  });
}

function layeredCircle(ctx, cx, cy, radius, layers) {
  layers.forEach(({ color, width }) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TWO_PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  });
}

function draw(source = 'draw') {
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

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.setLineDash([]);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  // All circular wheel boundaries: warm champagne with a fine pearl highlight.
  boundaries.forEach((radius, index) => {
    const edge = index === 0 || index === boundaries.length - 1;
    layeredCircle(ctx, cx, cy, radius, edge ? [
      { color: '#744300', width: 2.80 },
      { color: '#c78318', width: 1.72 },
      { color: '#ffe3a0', width: 0.48 },
    ] : [
      { color: '#b88a39', width: 1.05 },
      { color: '#e3c27b', width: 0.64 },
      { color: '#fff3d4', width: 0.22 },
    ]);
  });

  // All 36 radial boundaries.
  for (let index = 0; index < divisions; index += 1) {
    const degrees = northOffset + direction * index * sector;
    layeredLine(
      ctx,
      polar(cx, cy, innerRadius, degrees),
      polar(cx, cy, outerRadius, degrees),
      [
        { color: '#b88a39', width: 1.02 },
        { color: '#e3c27b', width: 0.62 },
        { color: '#fff3d4', width: 0.20 },
      ],
    );
  }

  // Exact 0°, 90°, 180°, and 270° visual authority.
  [0, 90, 180, 270].forEach((degrees) => {
    layeredLine(
      ctx,
      polar(cx, cy, innerRadius, degrees),
      polar(cx, cy, outerRadius, degrees),
      [
        { color: '#613500', width: 4.20 },
        { color: '#b8730c', width: 2.72 },
        { color: '#ffd77b', width: 0.88 },
        { color: '#fff7df', width: 0.26 },
      ],
    );
  });

  // Gold centre frame and chrome outer wheel frame.
  layeredCircle(ctx, cx, cy, Math.max(2, innerRadius - 2.2), [
    { color: '#4f2a00', width: 5.30 },
    { color: '#a96808', width: 3.70 },
    { color: '#e5ad38', width: 2.20 },
    { color: '#ffe7a9', width: 0.72 },
  ]);
  layeredCircle(ctx, cx, cy, outerRadius + 2.4, [
    { color: '#26343c', width: 6.20 },
    { color: '#8999a2', width: 4.50 },
    { color: '#d7e0e5', width: 3.10 },
    { color: '#ffffff', width: 0.96 },
  ]);

  ctx.restore();

  wheel.dataset.gannzillaWheelIvoryChampagneFinalV682 = 'true';
  wheel.dataset.gannzillaWheelRingCountV682 = String(boundaries.length);
  wheel.dataset.gannzillaWheelSpokeCountV682 = String(divisions);
  wheel.dataset.gannzillaWheelCardinalCountV682 = '4';
  wheel.dataset.gannzillaWheelGeometryChangedV682 = 'false';
  wheel.dataset.gannzillaWheelNumberLayoutChangedV682 = 'false';

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    cssSize,
    dpr,
    divisions,
    ringBoundaryCount: boundaries.length,
    cardinalCount: 4,
    innerRadius,
    outerRadius,
    geometryChanged: false,
    numberLayoutChanged: false,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule') {
  [0, 24, 80, 180].forEach((delay) => {
    window.setTimeout(() => window.requestAnimationFrame(() => draw(`${source}-${delay}`)), delay);
  });
}

function install() {
  if (typeof window === 'undefined'
    || typeof document === 'undefined'
    || window[STATE_KEY]) return;

  window.addEventListener(FINAL_EVENT, () => schedule(FINAL_EVENT), false);
  window.addEventListener(LEGACY_FINAL_EVENT, () => schedule(LEGACY_FINAL_EVENT), false);
  window.addEventListener('gannzilla:native-dpr-zoom-v504', () => schedule('zoom'), false);
  window.addEventListener('resize', () => schedule('resize'), false);

  observer = new MutationObserver(() => schedule('mutation'));
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['width', 'height', 'style', 'class'],
  });

  [0, 100, 300, 700, 1500, 3200, 6500].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  window.GANNZILLA_WHEEL_IVORY_CHAMPAGNE_FINAL_AUTHORITY_V682 = true;
  window.__auditGannzillaWheelIvoryChampagneFinalAuthorityV682 = () => {
    const wheel = findWheel();
    return {
      ok: wheel instanceof HTMLCanvasElement
        && wheel.dataset.gannzillaWheelIvoryChampagneFinalV682 === 'true'
        && Number(wheel.dataset.gannzillaWheelRingCountV682) > 1
        && Number(wheel.dataset.gannzillaWheelSpokeCountV682) >= 4
        && Number(wheel.dataset.gannzillaWheelCardinalCountV682) === 4,
      build: BUILD,
      enabled: enabled(),
      wheelFound: wheel instanceof HTMLCanvasElement,
      applyCount,
      observerActive: Boolean(observer),
      geometryChanged: false,
      numberLayoutChanged: false,
      lastApply,
    };
  };

  window[STATE_KEY] = { draw, schedule, observer };
  schedule('install');
}

install();
