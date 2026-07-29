const BUILD = 582;
const STATE_KEY = '__gannzillaCenterLogoStaticCanvasV582';
const ASSET_URL = '/center-logo-v580.svg?v=582';
const LOGO_SCALE = 0.94;
const LEGACY_OVERLAY_IDS = [
  'gannzilla-center-logo-v579',
  'gannzilla-center-logo-layer-v580',
  'gannzilla-center-logo-visible-canvas-v581',
];
const EXCLUDED_CANVAS_IDS = new Set([
  'gannzilla-top-center-drawing-overlay-v471',
  'gannzilla-wheel-line-theme-overlay-v473',
]);

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function enabled() {
  const query = params();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  const logoEnabled = !['false', '0', 'off', 'no'].includes(
    String(query.get('centerLogo') || 'true').toLowerCase(),
  );
  return wheelMode && logoEnabled;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function visibleCandidate(canvas) {
  if (!(canvas instanceof HTMLCanvasElement)
      || canvas.closest('aside')
      || EXCLUDED_CANVAS_IDS.has(canvas.id)
      || canvas.hidden
      || canvas.getAttribute('aria-hidden') === 'true') return null;

  const rect = canvas.getBoundingClientRect();
  const style = getComputedStyle(canvas);
  if (style.display === 'none'
      || style.visibility === 'hidden'
      || Number(style.opacity || 1) <= 0.01
      || rect.width <= 250
      || rect.height <= 250) return null;

  const viewportLeft = Math.max(0, rect.left);
  const viewportTop = Math.max(0, rect.top);
  const viewportRight = Math.min(window.innerWidth, rect.right);
  const viewportBottom = Math.min(window.innerHeight, rect.bottom);
  const intersectionArea = Math.max(0, viewportRight - viewportLeft)
    * Math.max(0, viewportBottom - viewportTop);
  const authority = canvas.dataset.gannzillaFinalWheelAuthorityV506 === 'true'
    || canvas.dataset.gannzillaFinalWheelAuthorityV491 === 'true';

  return {
    canvas,
    rect,
    score: (authority ? 1e15 : 0) + intersectionArea * 1e4 + rect.width * rect.height,
  };
}

function findVisibleWheel() {
  return Array.from(document.querySelectorAll('canvas'))
    .map(visibleCandidate)
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)[0]?.canvas || null;
}

function removeLegacyOverlays() {
  LEGACY_OVERLAY_IDS.forEach((id) => document.getElementById(id)?.remove());
  [
    'gannzilla-center-logo-style-v579',
    'gannzilla-center-logo-layer-style-v580',
    'gannzilla-center-logo-visible-canvas-style-v581',
  ].forEach((id) => document.getElementById(id)?.remove());
}

const image = new Image();
image.decoding = 'async';
image.src = ASSET_URL;

let imageReady = false;
let frame = 0;
let applyCount = 0;
let lastApply = null;
const timers = new Map();

function drawLogo(source = 'draw-logo') {
  frame = 0;
  if (!enabled() || !imageReady) return false;

  removeLegacyOverlays();
  const canvas = findVisibleWheel();
  if (!(canvas instanceof HTMLCanvasElement)) return false;

  const rect = canvas.getBoundingClientRect();
  const dprFromDataset = Number(canvas.dataset.gannzillaNativeDpr);
  const dprFromGeometry = rect.width > 0 ? canvas.width / rect.width : 1;
  const dpr = Number.isFinite(dprFromDataset) && dprFromDataset > 0
    ? dprFromDataset
    : Math.max(1, dprFromGeometry || window.devicePixelRatio || 1);
  const logicalSize = Number(canvas.dataset.gannzillaCanvasCssSize)
    || canvas.width / dpr;
  const appliedZoom = Number(canvas.dataset.gannzillaAppliedZoom)
    || Number(params().get('gannzillaZoom'))
    || 1;
  const expandedRadius = Number(canvas.dataset.gannzillaExpandedCenterRadius)
    || Number(params().get('expandedCenterRadius'))
    || Math.max(
      20,
      (Number(params().get('gannzillaInnerRadius')) || 279.32)
        - (Number(params().get('gannzillaRingWidth')) || 96.76),
    );
  const centerRadius = expandedRadius * appliedZoom;
  const logoRadius = clamp(centerRadius * LOGO_SCALE, 40, centerRadius);
  const diameter = logoRadius * 2;
  const cx = logicalSize / 2;
  const cy = logicalSize / 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.beginPath();
  ctx.arc(cx, cy, logoRadius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = '#020202';
  ctx.fillRect(cx - logoRadius, cy - logoRadius, diameter, diameter);
  ctx.drawImage(
    image,
    cx - logoRadius,
    cy - logoRadius,
    diameter,
    diameter,
  );
  ctx.restore();

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.beginPath();
  ctx.arc(cx, cy, logoRadius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(190, 141, 46, 0.98)';
  ctx.lineWidth = Math.max(2, 3 * appliedZoom);
  ctx.stroke();
  ctx.restore();

  canvas.dataset.gannzillaCenterLogoStaticCanvasV582 = 'true';
  canvas.dataset.gannzillaCenterLogoBuildV582 = String(BUILD);
  canvas.dataset.gannzillaCenterLogoScaleV582 = String(LOGO_SCALE);
  canvas.dataset.gannzillaCenterLogoRadiusV582 = logoRadius.toFixed(3);
  canvas.dataset.gannzillaCenterLogoDiameterV582 = diameter.toFixed(3);
  canvas.dataset.gannzillaCenterLogoImageOnlyV582 = 'true';
  canvas.dataset.gannzillaCenterLogoOverlayV582 = 'false';
  canvas.dataset.gannzillaCenterLogoInteractiveV582 = 'false';

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    canvasId: canvas.id || null,
    logicalSize,
    dpr,
    appliedZoom,
    expandedRadius,
    centerRadius,
    logoRadius,
    diameter,
    scale: LOGO_SCALE,
    imageOnly: true,
    interactive: false,
    overlay: false,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule', delays = [0, 48, 160]) {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => drawLogo(source));
  delays.filter(Boolean).forEach((delay) => {
    clearTimeout(timers.get(delay));
    timers.set(delay, window.setTimeout(() => {
      timers.delete(delay);
      drawLogo(`${source}-${delay}`);
    }, delay));
  });
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  removeLegacyOverlays();

  image.addEventListener('load', () => {
    imageReady = true;
    schedule('image-load', [0, 80, 220]);
  }, { once: true });
  image.addEventListener('error', () => {
    imageReady = false;
  }, { once: true });
  if (image.complete && image.naturalWidth > 0) imageReady = true;

  [
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:final-wheel-authority-v491',
    'gannzilla:center-cell-comfort-v508',
    'gannzilla:native-dpr-zoom-v504',
  ].forEach((name) => window.addEventListener(name, () => schedule(name), false));
  window.addEventListener('resize', () => schedule('window-resize'), false);

  [0, 100, 320, 800, 1800, 3600].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, [0, 80, 220]), delay);
  });

  window.GANNZILLA_CENTER_LOGO_STATIC_CANVAS_V582 = true;
  window.__auditGannzillaCenterLogoStaticCanvasV582 = () => {
    const canvas = findVisibleWheel();
    const logoRadius = Number(canvas?.dataset.gannzillaCenterLogoRadiusV582 || 0);
    const expandedRadius = Number(canvas?.dataset.gannzillaExpandedCenterRadius)
      || Number(params().get('expandedCenterRadius'))
      || 182.56;
    const appliedZoom = Number(canvas?.dataset.gannzillaAppliedZoom)
      || Number(params().get('gannzillaZoom'))
      || 1;
    const expectedRadius = expandedRadius * appliedZoom * LOGO_SCALE;
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaCenterLogoStaticCanvasV582 === 'true'
        && canvas.dataset.gannzillaCenterLogoImageOnlyV582 === 'true'
        && canvas.dataset.gannzillaCenterLogoOverlayV582 === 'false'
        && canvas.dataset.gannzillaCenterLogoInteractiveV582 === 'false'
        && Math.abs(logoRadius - expectedRadius) < 1,
      build: BUILD,
      imageReady,
      scale: LOGO_SCALE,
      logoRadius,
      expectedRadius,
      diameter: Number(canvas?.dataset.gannzillaCenterLogoDiameterV582 || 0),
      imageOnly: true,
      overlay: false,
      interactive: false,
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { drawLogo, schedule };
  schedule('install', [0, 80, 220]);
}

install();
