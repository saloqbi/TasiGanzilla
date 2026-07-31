const BUILD = 678;
const STATE_KEY = '__gannzillaWheelChampagneChromeOverlayV678';
const ENABLE_PARAM = 'wheelChampagneChrome';
const OVERLAY_ID = 'gannzilla-wheel-champagne-chrome-overlay-v675';
const DRAWING_OVERLAY_ID = 'gannzilla-top-center-drawing-overlay-v471';
const THEME_OVERLAY_ID = 'gannzilla-wheel-line-theme-overlay-v473';
const TWO_PI = Math.PI * 2;

let observer = null;
let timer = 0;
let frame = 0;
let applyCount = 0;
let lastApply = null;

function effectiveSearch() {
  return window.__gannzillaV672CanonicalSearch || window.location.search || '';
}

function params() {
  try { return new URLSearchParams(effectiveSearch()); }
  catch (_) { return new URLSearchParams(); }
}

function boolParam(name, fallback = false) {
  const query = params();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function numberParam(name, fallback) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? value : fallback;
}

function enabled() {
  const query = params();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  return wheelMode && boolParam(ENABLE_PARAM, false);
}

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-final-wheel-authority-v506="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v491="true"]',
    'canvas[data-gannzilla-native-wheel-scrollbars-hidden-v417="true"]',
  ].join(','));
  if (preferred instanceof HTMLCanvasElement && !preferred.closest('aside')) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement)
        || canvas.closest('aside')
        || canvas.id === DRAWING_OVERLAY_ID
        || canvas.id === THEME_OVERLAY_ID
        || canvas.id === OVERLAY_ID) return false;
      const rect = canvas.getBoundingClientRect();
      return canvas.width > 300 && canvas.height > 300 && rect.width > 250 && rect.height > 250;
    })
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

function ensureOverlay() {
  let overlay = document.getElementById(OVERLAY_ID);
  if (!(overlay instanceof HTMLCanvasElement)) {
    overlay = document.createElement('canvas');
    overlay.id = OVERLAY_ID;
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);
  }

  overlay.dataset.gannzillaWheelChampagneChromeOverlayV675 = 'true';
  overlay.dataset.gannzillaWheelIvoryChampagneV678 = 'true';

  Object.assign(overlay.style, {
    position: 'fixed',
    pointerEvents: 'none',
    margin: '0',
    padding: '0',
    border: '0',
    background: 'transparent',
    zIndex: '2147482500',
    transform: 'none',
    transformOrigin: '0 0',
    imageRendering: 'auto',
  });
  return overlay;
}

function polar(cx, cy, radius, degrees) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
}

function drawLayeredCircle(ctx, cx, cy, radius, layers) {
  layers.forEach(({ color, width }) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TWO_PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  });
}

function drawLayeredLine(ctx, from, to, layers) {
  layers.forEach(({ color, width }) => {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  });
}

function minorCircle(ctx, cx, cy, radius, strength = 1) {
  drawLayeredCircle(ctx, cx, cy, radius, [
    { color: 'rgba(110,75,18,.34)', width: 1.85 * strength },
    { color: 'rgba(198,158,86,.92)', width: 1.22 * strength },
    { color: 'rgba(255,241,205,.98)', width: 0.40 * strength },
  ]);
}

function majorCircle(ctx, cx, cy, radius, strength = 1) {
  drawLayeredCircle(ctx, cx, cy, radius, [
    { color: 'rgba(82,47,3,.88)', width: 3.35 * strength },
    { color: 'rgba(184,125,24,.98)', width: 2.25 * strength },
    { color: 'rgba(255,219,132,.98)', width: 0.80 * strength },
    { color: 'rgba(255,255,255,.82)', width: 0.24 * strength },
  ]);
}

function minorSpoke(ctx, from, to, strength = 1) {
  drawLayeredLine(ctx, from, to, [
    { color: 'rgba(105,72,18,.30)', width: 1.70 * strength },
    { color: 'rgba(203,166,96,.91)', width: 1.10 * strength },
    { color: 'rgba(255,244,216,.97)', width: 0.36 * strength },
  ]);
}

function cardinalSpoke(ctx, from, to, strength = 1) {
  drawLayeredLine(ctx, from, to, [
    { color: 'rgba(73,40,0,.96)', width: 4.25 * strength },
    { color: 'rgba(176,112,12,.99)', width: 2.95 * strength },
    { color: 'rgba(255,205,92,.99)', width: 1.18 * strength },
    { color: 'rgba(255,250,226,.96)', width: 0.34 * strength },
  ]);
}

function chromeFrame(ctx, cx, cy, radius, strength = 1) {
  drawLayeredCircle(ctx, cx, cy, radius, [
    { color: 'rgba(30,39,45,.97)', width: 7.10 * strength },
    { color: 'rgba(103,116,124,.98)', width: 5.60 * strength },
    { color: 'rgba(202,210,215,.99)', width: 4.08 * strength },
    { color: 'rgba(255,255,255,1)', width: 1.28 * strength },
    { color: 'rgba(219,244,253,.90)', width: 0.48 * strength },
  ]);
}

function goldInnerFrame(ctx, cx, cy, radius, strength = 1) {
  drawLayeredCircle(ctx, cx, cy, radius, [
    { color: 'rgba(58,31,0,.96)', width: 5.30 * strength },
    { color: 'rgba(171,105,10,.99)', width: 3.90 * strength },
    { color: 'rgba(245,190,69,.99)', width: 2.55 * strength },
    { color: 'rgba(255,232,159,.99)', width: 0.92 * strength },
    { color: 'rgba(255,255,255,.84)', width: 0.26 * strength },
  ]);
}

function fillIvoryAnnulus(ctx, cx, cy, innerRadius, outerRadius) {
  const gradient = ctx.createRadialGradient(
    cx - outerRadius * 0.24,
    cy - outerRadius * 0.28,
    Math.max(1, innerRadius),
    cx,
    cy,
    outerRadius,
  );
  gradient.addColorStop(0, 'rgba(255,255,255,.035)');
  gradient.addColorStop(0.48, 'rgba(255,250,236,.080)');
  gradient.addColorStop(1, 'rgba(246,232,201,.115)');

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, 0, TWO_PI);
  ctx.arc(cx, cy, innerRadius, 0, TWO_PI, true);
  ctx.fillStyle = gradient;
  ctx.fill('evenodd');
  ctx.restore();
}

function draw(source = 'draw') {
  frame = 0;
  if (!enabled()) return false;

  const wheel = findWheel();
  const overlay = ensureOverlay();
  if (!(wheel instanceof HTMLCanvasElement)) {
    overlay.style.display = 'none';
    return false;
  }

  const rect = wheel.getBoundingClientRect();
  if (!(rect.width > 250 && rect.height > 250)) {
    overlay.style.display = 'none';
    return false;
  }

  const dpr = Math.max(1, Number(window.devicePixelRatio) || 1);
  const pixelWidth = Math.max(1, Math.round(rect.width * dpr));
  const pixelHeight = Math.max(1, Math.round(rect.height * dpr));
  if (overlay.width !== pixelWidth) overlay.width = pixelWidth;
  if (overlay.height !== pixelHeight) overlay.height = pixelHeight;

  Object.assign(overlay.style, {
    display: 'block',
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  });

  const cssLogicalSize = Number(wheel.dataset.gannzillaCanvasCssSize) || rect.width;
  const scaleX = rect.width / Math.max(1, cssLogicalSize);
  const scaleY = rect.height / Math.max(1, cssLogicalSize);
  const scale = Math.min(scaleX, scaleY);
  const appliedZoom = Number(wheel.dataset.gannzillaAppliedZoom) || numberParam('gannzillaZoom', 1);
  const divisions = Math.max(3, Math.round(numberParam('divisions', 36)));
  const clockwise = boolParam('clockwise', true);
  const direction = clockwise ? 1 : -1;
  const sector = 360 / divisions;
  const northOffset = direction * sector / 2;
  const innerRadiusSetting = numberParam('gannzillaInnerRadius', 279.32);
  const ringWidthSetting = numberParam('gannzillaRingWidth', 96.76);
  const adjustedInnerRadiusLogical = Math.max(20, innerRadiusSetting - ringWidthSetting) * appliedZoom;
  const ringWidthsLogical = String(wheel.dataset.gannzillaRingWidths || '')
    .split(',')
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0);

  if (!ringWidthsLogical.length) {
    overlay.style.display = 'none';
    return false;
  }

  const boundaries = [adjustedInnerRadiusLogical * scale];
  ringWidthsLogical.forEach((width) => boundaries.push(boundaries[boundaries.length - 1] + width * scale));
  const innerRadius = boundaries[0];
  const outerRadius = boundaries[boundaries.length - 1];
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const ctx = overlay.getContext('2d');
  if (!ctx) return false;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.setLineDash([]);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  fillIvoryAnnulus(ctx, cx, cy, innerRadius, outerRadius);

  boundaries.forEach((radius, index) => {
    const outerEdge = index === boundaries.length - 1;
    const innerEdge = index === 0;
    if (innerEdge || outerEdge) majorCircle(ctx, cx, cy, radius, innerEdge ? 0.90 : 1.04);
    else minorCircle(ctx, cx, cy, radius, 0.84);
  });

  for (let index = 0; index < divisions; index += 1) {
    const degrees = northOffset + direction * index * sector;
    const from = polar(cx, cy, innerRadius, degrees);
    const to = polar(cx, cy, outerRadius, degrees);
    const cardinal = divisions % 4 === 0 && index % (divisions / 4) === 0;
    if (cardinal) cardinalSpoke(ctx, from, to, 1);
    else minorSpoke(ctx, from, to, 0.82);
  }

  goldInnerFrame(ctx, cx, cy, Math.max(2, innerRadius - 4.5 * scale), 0.92);
  chromeFrame(ctx, cx, cy, outerRadius + 5 * scale, 0.96);

  overlay.dataset.gannzillaWheelFrameMaterialV675 = 'mirror-silver-chrome';
  overlay.dataset.gannzillaWheelGridMaterialV675 = 'ivory-champagne-gold';
  overlay.dataset.gannzillaWheelGeometryChangedV675 = 'false';

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    divisions,
    ringBoundaryCount: boundaries.length,
    overlayWidth: rect.width,
    overlayHeight: rect.height,
    innerRadius,
    outerRadius,
    ivoryBase: '#fffaf0',
    champagneGold: '#cba660',
    cardinalGold: '#b0700c',
    chromeMid: '#cad2d7',
    geometryChanged: false,
    numberLayoutChanged: false,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(schedule.timer);
  schedule.timer = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => draw(source));
  }, delay);
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !enabled() || window[STATE_KEY]) return;

  [0, 30, 80, 160, 320, 600, 1000, 1800, 3200, 5200, 8200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });

  const onWheelDraw = () => schedule('final-wheel-event', 12);
  window.addEventListener('gannzilla:final-wheel-authority-v491', onWheelDraw, false);
  window.addEventListener('gannzilla:final-wheel-authority-v506', onWheelDraw, false);
  window.addEventListener('gannzilla:native-dpr-zoom-v504', () => schedule('zoom-change', 20), false);
  window.addEventListener('resize', () => schedule('resize', 0), false);
  window.addEventListener('scroll', () => schedule('scroll', 0), true);

  observer = new MutationObserver(() => schedule('mutation', 0));
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'width', 'height'],
  });

  timer = window.setInterval(() => draw('overlay-watch'), 140);

  window.GANNZILLA_WHEEL_CHAMPAGNE_CHROME_OVERLAY_V675 = true;
  window.GANNZILLA_WHEEL_IVORY_CHAMPAGNE_V678 = true;
  window.__auditGannzillaWheelChampagneChromeOverlayV675 = () => {
    const overlay = document.getElementById(OVERLAY_ID);
    const wheel = findWheel();
    return {
      ok: overlay instanceof HTMLCanvasElement
        && overlay.dataset.gannzillaWheelIvoryChampagneV678 === 'true'
        && overlay.style.display !== 'none',
      build: BUILD,
      enabled: enabled(),
      overlayMounted: overlay instanceof HTMLCanvasElement,
      wheelFound: wheel instanceof HTMLCanvasElement,
      frameMaterial: 'mirror-silver-chrome',
      gridMaterial: 'ivory-champagne-gold',
      cardinalSpokesEmphasized: true,
      geometryChanged: false,
      numberLayoutChanged: false,
      applyCount,
      observerActive: Boolean(observer),
      timerActive: Boolean(timer),
      lastApply,
    };
  };

  window[STATE_KEY] = { draw, schedule };
  schedule('install');
}

install();
