const BUILD = 583;
const STATE_KEY = '__gannzillaCenterLogoStaticCanvasV583';
const ASSET_URL = '/center-logo-v580.svg?v=583';
const LOGO_SCALE = 0.94;
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

function visibleCanvasCandidate(canvas) {
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

  const authority = canvas.dataset.gannzillaFinalWheelAuthorityV506 === 'true'
    || canvas.dataset.gannzillaFinalWheelAuthorityV491 === 'true';
  const viewportLeft = Math.max(0, rect.left);
  const viewportTop = Math.max(0, rect.top);
  const viewportRight = Math.min(window.innerWidth, rect.right);
  const viewportBottom = Math.min(window.innerHeight, rect.bottom);
  const intersectionArea = Math.max(0, viewportRight - viewportLeft)
    * Math.max(0, viewportBottom - viewportTop);

  return {
    canvas,
    score: (authority ? 1e15 : 0) + intersectionArea * 1e4 + rect.width * rect.height,
  };
}

function findVisibleWheel() {
  return Array.from(document.querySelectorAll('canvas'))
    .map(visibleCanvasCandidate)
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)[0]?.canvas || null;
}

function removeLegacyLogoRuntime() {
  [
    'gannzilla-center-logo-v579',
    'gannzilla-center-logo-layer-v580',
    'gannzilla-center-logo-visible-canvas-v581',
  ].forEach((id) => document.getElementById(id)?.remove());
  [
    'gannzilla-center-logo-style-v579',
    'gannzilla-center-logo-layer-style-v580',
    'gannzilla-center-logo-visible-canvas-style-v581',
  ].forEach((id) => document.getElementById(id)?.remove());
}

const image = new Image();
image.decoding = 'async';
let imageReady = false;
let drawCount = 0;
let lastDraw = null;

function drawLogo(source = 'draw-logo') {
  if (!enabled() || !imageReady) return false;

  removeLegacyLogoRuntime();
  const canvas = findVisibleWheel();
  if (!(canvas instanceof HTMLCanvasElement)) return false;

  const rect = canvas.getBoundingClientRect();
  const dprFromDataset = Number(canvas.dataset.gannzillaNativeDpr);
  const dprFromGeometry = rect.width > 0 ? canvas.width / rect.width : 1;
  const dpr = Number.isFinite(dprFromDataset) && dprFromDataset > 0
    ? dprFromDataset
    : Math.max(1, dprFromGeometry || window.devicePixelRatio || 1);
  const logicalSize = Number(canvas.dataset.gannzillaCanvasCssSize) || canvas.width / dpr;
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
  const logoRadius = Math.max(40, centerRadius * LOGO_SCALE);
  const diameter = logoRadius * 2;
  const cx = logicalSize / 2;
  const cy = logicalSize / 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  const naturalWidth = Math.max(1, image.naturalWidth || 1);
  const naturalHeight = Math.max(1, image.naturalHeight || 1);
  const cropSize = Math.min(naturalWidth, naturalHeight);
  const sourceX = (naturalWidth - cropSize) / 2;
  const sourceY = (naturalHeight - cropSize) / 2;

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
    sourceX,
    sourceY,
    cropSize,
    cropSize,
    cx - logoRadius,
    cy - logoRadius,
    diameter,
    diameter,
  );
  ctx.restore();

  canvas.dataset.gannzillaCenterLogoStaticCanvasV583 = 'true';
  canvas.dataset.gannzillaCenterLogoBuildV583 = String(BUILD);
  canvas.dataset.gannzillaCenterLogoScaleV583 = String(LOGO_SCALE);
  canvas.dataset.gannzillaCenterLogoRadiusV583 = logoRadius.toFixed(3);
  canvas.dataset.gannzillaCenterLogoDiameterV583 = diameter.toFixed(3);
  canvas.dataset.gannzillaCenterLogoImageOnlyV583 = 'true';
  canvas.dataset.gannzillaCenterLogoOverlayV583 = 'false';
  canvas.dataset.gannzillaCenterLogoInteractiveV583 = 'false';

  drawCount += 1;
  lastDraw = {
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

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  removeLegacyLogoRuntime();

  image.addEventListener('load', () => {
    imageReady = true;
    drawLogo('image-load');
  }, { once: true });
  image.addEventListener('error', () => {
    imageReady = false;
  }, { once: true });
  image.src = ASSET_URL;
  if (image.complete && image.naturalWidth > 0) imageReady = true;

  const onFinalWheelDraw = () => {
    // Synchronous and last-registered: the logo becomes the final pixels written
    // into the wheel canvas after every complete wheel redraw.
    drawLogo('final-wheel-draw');
  };
  window.addEventListener('gannzilla:final-wheel-authority-v506', onFinalWheelDraw, false);

  window.GANNZILLA_CENTER_LOGO_STATIC_CANVAS_V583 = true;
  window.__auditGannzillaCenterLogoStaticCanvasV583 = () => {
    const canvas = findVisibleWheel();
    const logoRadius = Number(canvas?.dataset.gannzillaCenterLogoRadiusV583 || 0);
    const expandedRadius = Number(canvas?.dataset.gannzillaExpandedCenterRadius)
      || Number(params().get('expandedCenterRadius'))
      || 182.56;
    const appliedZoom = Number(canvas?.dataset.gannzillaAppliedZoom)
      || Number(params().get('gannzillaZoom'))
      || 1;
    const expectedRadius = expandedRadius * appliedZoom * LOGO_SCALE;
    return {
      ok: canvas instanceof HTMLCanvasElement
        && imageReady
        && canvas.dataset.gannzillaCenterLogoStaticCanvasV583 === 'true'
        && canvas.dataset.gannzillaCenterLogoImageOnlyV583 === 'true'
        && canvas.dataset.gannzillaCenterLogoOverlayV583 === 'false'
        && canvas.dataset.gannzillaCenterLogoInteractiveV583 === 'false'
        && Math.abs(logoRadius - expectedRadius) < 1,
      build: BUILD,
      imageReady,
      scale: LOGO_SCALE,
      logoRadius,
      expectedRadius,
      diameter: Number(canvas?.dataset.gannzillaCenterLogoDiameterV583 || 0),
      imageOnly: true,
      overlay: false,
      interactive: false,
      drawCount,
      lastDraw,
    };
  };

  window[STATE_KEY] = { drawLogo, onFinalWheelDraw };
  if (imageReady) drawLogo('install-ready');
}

install();
