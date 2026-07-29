const BUILD = 584;
const STATE_KEY = '__gannzillaCenterLogoAfterFinalFrameV584';
const ASSET_URL = '/center-logo-v580.svg?v=584';
const LOGO_SCALE = 0.94;

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

function findWheel() {
  const finalFrameCanvas = document.querySelector(
    'canvas[data-gannzilla-copper-top-correction-v541="true"]',
  );
  if (finalFrameCanvas instanceof HTMLCanvasElement && !finalFrameCanvas.closest('aside')) {
    return finalFrameCanvas;
  }

  const finalAuthorityCanvas = document.querySelector([
    'canvas[data-gannzilla-final-wheel-authority-v506="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v491="true"]',
  ].join(','));
  return finalAuthorityCanvas instanceof HTMLCanvasElement && !finalAuthorityCanvas.closest('aside')
    ? finalAuthorityCanvas
    : null;
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
  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement)) return false;

  const rect = canvas.getBoundingClientRect();
  const dprFromDataset = Number(canvas.dataset.gannzillaNativeDpr);
  const dprFromGeometry = rect.width > 0 ? canvas.width / rect.width : 1;
  const dpr = Number.isFinite(dprFromDataset) && dprFromDataset > 0
    ? dprFromDataset
    : Math.max(1, dprFromGeometry || window.devicePixelRatio || 1);
  const logicalSize = Number(canvas.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518)
    || Number(canvas.dataset.gannzillaCanvasCssSize)
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
  ctx.globalAlpha = 1;
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

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.beginPath();
  ctx.arc(cx, cy, logoRadius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(190, 141, 46, 0.98)';
  ctx.lineWidth = Math.max(2, 3 * appliedZoom);
  ctx.stroke();
  ctx.restore();

  canvas.dataset.gannzillaCenterLogoAfterFinalFrameV584 = 'true';
  canvas.dataset.gannzillaCenterLogoBuildV584 = String(BUILD);
  canvas.dataset.gannzillaCenterLogoScaleV584 = String(LOGO_SCALE);
  canvas.dataset.gannzillaCenterLogoRadiusV584 = logoRadius.toFixed(3);
  canvas.dataset.gannzillaCenterLogoDiameterV584 = diameter.toFixed(3);
  canvas.dataset.gannzillaCenterLogoImageOnlyV584 = 'true';
  canvas.dataset.gannzillaCenterLogoOverlayV584 = 'false';
  canvas.dataset.gannzillaCenterLogoInteractiveV584 = 'false';
  canvas.dataset.gannzillaCenterLogoDrawnAfterV541 = 'true';

  drawCount += 1;
  lastDraw = {
    source,
    build: BUILD,
    logicalSize,
    dpr,
    appliedZoom,
    expandedRadius,
    logoRadius,
    diameter,
    afterFinalFrame: true,
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

  const onFinalFrameDraw = () => {
    // V541 has completed the final live-canvas repaint. No later wheel renderer
    // is allowed to overwrite the center image after this synchronous call.
    drawLogo('copper-top-correction-v541');
  };
  window.addEventListener('gannzilla:copper-top-correction-v541', onFinalFrameDraw, false);

  window.GANNZILLA_CENTER_LOGO_AFTER_FINAL_FRAME_V584 = true;
  window.__auditGannzillaCenterLogoAfterFinalFrameV584 = () => {
    const canvas = findWheel();
    return {
      ok: canvas instanceof HTMLCanvasElement
        && imageReady
        && canvas.dataset.gannzillaCenterLogoAfterFinalFrameV584 === 'true'
        && canvas.dataset.gannzillaCenterLogoDrawnAfterV541 === 'true'
        && canvas.dataset.gannzillaCenterLogoImageOnlyV584 === 'true'
        && canvas.dataset.gannzillaCenterLogoOverlayV584 === 'false'
        && canvas.dataset.gannzillaCenterLogoInteractiveV584 === 'false',
      build: BUILD,
      imageReady,
      scale: LOGO_SCALE,
      drawnAfterV541: canvas?.dataset.gannzillaCenterLogoDrawnAfterV541 === 'true',
      radius: Number(canvas?.dataset.gannzillaCenterLogoRadiusV584 || 0),
      diameter: Number(canvas?.dataset.gannzillaCenterLogoDiameterV584 || 0),
      imageOnly: true,
      overlay: false,
      interactive: false,
      drawCount,
      lastDraw,
    };
  };

  window[STATE_KEY] = { drawLogo, onFinalFrameDraw };
  if (imageReady) drawLogo('install-ready');
}

install();
