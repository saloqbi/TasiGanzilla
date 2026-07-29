import brandPart0 from './gannzillaBrandImageV247Part0';
import brandPart1 from './gannzillaBrandImageV247Part1';
import brandPart2 from './gannzillaBrandImageV247Part2';

const BUILD = 592;
const STATE_KEY = '__gannzillaCenterLogoFixed71V592';
const IMAGE_ID = 'gannzilla-center-logo-fixed-71-v592';
const STYLE_ID = 'gannzilla-center-logo-fixed-71-style-v592';
const LOGO_SCALE = 0.71;
const IMAGE_DATA_URL = `data:image/webp;base64,${brandPart0}${brandPart1}${brandPart2}`;

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
  const preferred = document.querySelector([
    'canvas[data-gannzilla-final-wheel-authority-v506="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v491="true"]',
    'canvas[data-gannzilla-keyboard-mouse-control-v459="true"]',
  ].join(','));
  if (preferred instanceof HTMLCanvasElement && !preferred.closest('aside')) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement) || canvas.closest('aside')) return false;
      const rect = canvas.getBoundingClientRect();
      const style = getComputedStyle(canvas);
      return rect.width > 250
        && rect.height > 250
        && style.display !== 'none'
        && style.visibility !== 'hidden';
    })
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

function removeLegacyLogoNodes() {
  [
    'gannzilla-center-logo-v579',
    'gannzilla-center-logo-layer-v580',
    'gannzilla-center-logo-visible-canvas-v581',
    'gannzilla-center-logo-fixed-image-v587',
    'gannzilla-center-logo-stable-fit-v588',
    'gannzilla-center-logo-stage-v590',
    'gannzilla-center-logo-stage-v591',
  ].forEach((id) => document.getElementById(id)?.remove());

  [
    'gannzilla-center-logo-style-v579',
    'gannzilla-center-logo-layer-style-v580',
    'gannzilla-center-logo-visible-canvas-style-v581',
    'gannzilla-center-logo-fixed-image-style-v587',
    'gannzilla-center-logo-stable-fit-style-v588',
    'gannzilla-center-logo-stage-style-v590',
    'gannzilla-center-logo-stage-style-v591',
  ].forEach((id) => document.getElementById(id)?.remove());
}

function ensureStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    #${IMAGE_ID} {
      position: fixed !important;
      display: block !important;
      z-index: 2147482000 !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      border: 2px solid rgba(190, 141, 46, 0.98) !important;
      border-radius: 50% !important;
      clip-path: circle(50% at 50% 50%) !important;
      object-fit: cover !important;
      object-position: center center !important;
      background: #020202 !important;
      pointer-events: none !important;
      user-select: none !important;
      -webkit-user-drag: none !important;
      transition: none !important;
      animation: none !important;
      transform: translate3d(-50%, -50%, 0) !important;
      transform-origin: center center !important;
      will-change: auto !important;
    }
  `;
}

function ensureImage() {
  let image = document.getElementById(IMAGE_ID);
  if (!(image instanceof HTMLImageElement)) {
    image = document.createElement('img');
    image.id = IMAGE_ID;
    image.alt = 'شعار كوكبة تاسي للذهب';
    image.draggable = false;
    image.decoding = 'async';
    image.loading = 'eager';
    image.style.setProperty('visibility', 'hidden', 'important');
    image.style.setProperty('opacity', '0', 'important');
    image.src = IMAGE_DATA_URL;
    document.body.appendChild(image);
  }
  return image;
}

let locked = false;
let lockCount = 0;
let lastLock = null;

function lockLogo(source = 'lock') {
  if (locked || !enabled()) return locked;

  removeLegacyLogoNodes();
  ensureStyle();
  const image = ensureImage();
  const canvas = findWheel();
  const imageReady = image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
  if (!(canvas instanceof HTMLCanvasElement) || !imageReady) return false;

  const canvasRect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, Number(canvas.dataset.gannzillaNativeDpr) || window.devicePixelRatio || 1);
  const logicalSize = Number(canvas.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518)
    || Number(canvas.dataset.gannzillaCanvasCssSize)
    || canvas.width / dpr;
  const viewportScale = logicalSize > 0 ? canvasRect.width / logicalSize : 1;
  const emptyCenterRadius = Number(canvas.dataset.gannzillaExpandedCenterRadius)
    || Number(params().get('expandedCenterRadius'))
    || Math.max(
      20,
      (Number(params().get('gannzillaInnerRadius')) || 279.32)
        - (Number(params().get('gannzillaRingWidth')) || 96.76),
    );

  const centerX = canvasRect.left + canvasRect.width / 2;
  const centerY = canvasRect.top + canvasRect.height / 2;
  const emptyRadiusOnScreen = emptyCenterRadius * viewportScale;
  const logoRadius = Math.max(28, emptyRadiusOnScreen * LOGO_SCALE);
  const diameter = logoRadius * 2;

  image.style.setProperty('left', `${centerX.toFixed(3)}px`, 'important');
  image.style.setProperty('top', `${centerY.toFixed(3)}px`, 'important');
  image.style.setProperty('width', `${diameter.toFixed(3)}px`, 'important');
  image.style.setProperty('height', `${diameter.toFixed(3)}px`, 'important');
  image.style.setProperty('visibility', 'visible', 'important');
  image.style.setProperty('opacity', '1', 'important');

  image.dataset.gannzillaCenterLogoFixed71V592 = 'true';
  image.dataset.gannzillaCenterLogoBuildV592 = String(BUILD);
  image.dataset.gannzillaCenterLogoScaleV592 = String(LOGO_SCALE);
  image.dataset.gannzillaCenterLogoDiameterV592 = diameter.toFixed(3);
  image.dataset.gannzillaCenterLogoInteractiveV592 = 'false';
  image.dataset.gannzillaCenterLogoFixedPositionV592 = 'true';
  image.dataset.gannzillaCenterLogoFixedSizeV592 = 'true';
  image.dataset.gannzillaCenterLogoPanTrackingV592 = 'false';
  image.dataset.gannzillaCenterLogoZoomTrackingV592 = 'false';

  locked = true;
  lockCount += 1;
  lastLock = {
    source,
    build: BUILD,
    centerX,
    centerY,
    logicalSize,
    viewportScale,
    emptyCenterRadius,
    emptyRadiusOnScreen,
    logoRadius,
    diameter,
    scale: LOGO_SCALE,
    fixedPosition: true,
    fixedSize: true,
    at: Date.now(),
  };
  return true;
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  removeLegacyLogoNodes();
  ensureStyle();
  const image = ensureImage();

  image.addEventListener('load', () => {
    window.setTimeout(() => lockLogo('image-load-stable'), 2200);
  }, { once: true });
  image.addEventListener('error', () => {
    image.style.setProperty('visibility', 'hidden', 'important');
    image.style.setProperty('opacity', '0', 'important');
    image.dataset.gannzillaCenterLogoImageErrorV592 = 'true';
  }, { once: true });

  [2200, 3200, 4500, 6500].forEach((delay) => {
    window.setTimeout(() => lockLogo(`boot-${delay}`), delay);
  });

  window.GANNZILLA_CENTER_LOGO_FIXED_71_V592 = true;
  window.__auditGannzillaCenterLogoFixed71V592 = () => {
    const currentImage = document.getElementById(IMAGE_ID);
    const rect = currentImage?.getBoundingClientRect();
    return {
      ok: currentImage instanceof HTMLImageElement
        && currentImage.complete
        && currentImage.naturalWidth > 0
        && currentImage.dataset.gannzillaCenterLogoFixed71V592 === 'true'
        && currentImage.dataset.gannzillaCenterLogoFixedPositionV592 === 'true'
        && currentImage.dataset.gannzillaCenterLogoFixedSizeV592 === 'true'
        && currentImage.dataset.gannzillaCenterLogoPanTrackingV592 === 'false'
        && currentImage.dataset.gannzillaCenterLogoZoomTrackingV592 === 'false'
        && Number(rect?.width || 0) > 50,
      build: BUILD,
      scale: LOGO_SCALE,
      locked,
      fixedPosition: true,
      fixedSize: true,
      panTracking: false,
      zoomTracking: false,
      renderedWidth: Number(rect?.width || 0),
      lockCount,
      lastLock,
    };
  };

  window[STATE_KEY] = { lockLogo };
}

install();
