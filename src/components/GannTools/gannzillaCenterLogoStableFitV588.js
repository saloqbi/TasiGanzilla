const BUILD = 588;
const STATE_KEY = '__gannzillaCenterLogoStableFitV588';
const IMAGE_ID = 'gannzilla-center-logo-stable-fit-v588';
const STYLE_ID = 'gannzilla-center-logo-stable-fit-style-v588';
const IMAGE_URL = '/center-logo-v587.jpg?v=588';
const LOGO_SCALE = 0.78;

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

function canvasCandidate(canvas) {
  if (!(canvas instanceof HTMLCanvasElement)
      || canvas.closest('aside')
      || canvas.hidden
      || canvas.getAttribute('aria-hidden') === 'true'
      || canvas.id === 'gannzilla-top-center-drawing-overlay-v471'
      || canvas.id === 'gannzilla-wheel-line-theme-overlay-v473') return null;

  const rect = canvas.getBoundingClientRect();
  const style = getComputedStyle(canvas);
  if (style.display === 'none'
      || style.visibility === 'hidden'
      || Number(style.opacity || 1) <= 0.01
      || rect.width <= 250
      || rect.height <= 250) return null;

  const visibleWidth = Math.max(0, Math.min(window.innerWidth, rect.right) - Math.max(0, rect.left));
  const visibleHeight = Math.max(0, Math.min(window.innerHeight, rect.bottom) - Math.max(0, rect.top));
  const visibleArea = visibleWidth * visibleHeight;
  const finalFrame = canvas.dataset.gannzillaCopperTopCorrectionV541 === 'true';
  const finalAuthority = canvas.dataset.gannzillaFinalWheelAuthorityV506 === 'true'
    || canvas.dataset.gannzillaFinalWheelAuthorityV491 === 'true';

  return {
    canvas,
    rect,
    score: (finalFrame ? 1e16 : 0)
      + (finalAuthority ? 1e15 : 0)
      + visibleArea * 1e4
      + rect.width * rect.height,
  };
}

function findVisibleWheel() {
  return Array.from(document.querySelectorAll('canvas'))
    .map(canvasCandidate)
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)[0] || null;
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
      padding: 4% !important;
      border: 2px solid rgba(190, 141, 46, 0.98) !important;
      border-radius: 50% !important;
      box-sizing: border-box !important;
      object-fit: contain !important;
      object-position: center center !important;
      transform: translate3d(-50%, -50%, 0) !important;
      transform-origin: center center !important;
      transition: none !important;
      animation: none !important;
      pointer-events: none !important;
      user-select: none !important;
      -webkit-user-drag: none !important;
      background: #020202 !important;
      box-shadow: none !important;
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
    image.src = IMAGE_URL;
    image.style.setProperty('visibility', 'hidden', 'important');
    image.style.setProperty('opacity', '0', 'important');
    image.addEventListener('load', () => schedule('image-load'), { once: true });
    image.addEventListener('error', () => {
      image.style.setProperty('visibility', 'hidden', 'important');
      image.style.setProperty('opacity', '0', 'important');
    }, { once: true });
    document.body.appendChild(image);
  }
  return image;
}

let frame = 0;
let applyCount = 0;
let lastApply = null;

function apply(source = 'apply') {
  frame = 0;
  if (!enabled()) return false;

  ensureStyle();
  const candidate = findVisibleWheel();
  const image = ensureImage();
  const imageReady = image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;

  if (!candidate || !imageReady) {
    image.style.setProperty('visibility', 'hidden', 'important');
    image.style.setProperty('opacity', '0', 'important');
    return false;
  }

  const { canvas, rect } = candidate;
  const dpr = Math.max(1, Number(canvas.dataset.gannzillaNativeDpr) || window.devicePixelRatio || 1);
  const logicalSize = Number(canvas.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518)
    || Number(canvas.dataset.gannzillaCanvasCssSize)
    || canvas.width / dpr;
  const viewportScale = logicalSize > 0 ? rect.width / logicalSize : 1;
  const appliedZoom = Number(canvas.dataset.gannzillaAppliedZoom)
    || Number(params().get('gannzillaZoom'))
    || 1;
  const expandedRadius = Number(canvas.dataset.gannzillaExpandedCenterRadius)
    || Number(params().get('expandedCenterRadius'))
    || 182.56;
  const emptyRadiusOnScreen = expandedRadius * appliedZoom * viewportScale;
  const radius = Math.max(28, emptyRadiusOnScreen * LOGO_SCALE);
  const diameter = radius * 2;
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  image.style.setProperty('left', `${centerX.toFixed(3)}px`, 'important');
  image.style.setProperty('top', `${centerY.toFixed(3)}px`, 'important');
  image.style.setProperty('width', `${diameter.toFixed(3)}px`, 'important');
  image.style.setProperty('height', `${diameter.toFixed(3)}px`, 'important');
  image.style.setProperty('visibility', 'visible', 'important');
  image.style.setProperty('opacity', '1', 'important');

  image.dataset.gannzillaCenterLogoStableFitV588 = 'true';
  image.dataset.gannzillaCenterLogoScaleV588 = String(LOGO_SCALE);
  image.dataset.gannzillaCenterLogoViewportScaleV588 = viewportScale.toFixed(6);
  image.dataset.gannzillaCenterLogoEmptyRadiusV588 = emptyRadiusOnScreen.toFixed(3);
  image.dataset.gannzillaCenterLogoDiameterV588 = diameter.toFixed(3);
  image.dataset.gannzillaCenterLogoInteractiveV588 = 'false';

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    centerX,
    centerY,
    logicalSize,
    viewportScale,
    appliedZoom,
    expandedRadius,
    emptyRadiusOnScreen,
    radius,
    diameter,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule') {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => apply(source));
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  document.getElementById('gannzilla-center-logo-fixed-image-v587')?.remove();
  document.getElementById('gannzilla-center-logo-fixed-image-style-v587')?.remove();

  ensureStyle();
  ensureImage();

  [
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:copper-top-correction-v541',
    'gannzilla:center-cell-comfort-v508',
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:page-scrollbar-pan-v305',
  ].forEach((name) => window.addEventListener(name, () => schedule(name), false));

  window.addEventListener('resize', () => schedule('resize'), false);
  window.addEventListener('scroll', () => schedule('scroll'), { passive: true });
  window.addEventListener('pointerup', () => schedule('pointerup'), true);
  window.addEventListener('wheel', () => schedule('wheel'), { capture: true, passive: true });

  [0, 80, 220, 600, 1400, 3000].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  window.GANNZILLA_CENTER_LOGO_STABLE_FIT_V588 = true;
  window.__auditGannzillaCenterLogoStableFitV588 = () => {
    const image = document.getElementById(IMAGE_ID);
    const rect = image?.getBoundingClientRect();
    const emptyRadius = Number(image?.dataset.gannzillaCenterLogoEmptyRadiusV588 || 0);
    const diameter = Number(image?.dataset.gannzillaCenterLogoDiameterV588 || 0);
    return {
      ok: image instanceof HTMLImageElement
        && image.complete
        && image.naturalWidth > 0
        && image.dataset.gannzillaCenterLogoStableFitV588 === 'true'
        && image.dataset.gannzillaCenterLogoInteractiveV588 === 'false'
        && diameter > 50
        && diameter < emptyRadius * 2
        && Number(rect?.width || 0) > 50,
      build: BUILD,
      scale: LOGO_SCALE,
      diameter,
      emptyRadius,
      viewportScale: Number(image?.dataset.gannzillaCenterLogoViewportScaleV588 || 0),
      interactive: false,
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule };
  schedule('install');
}

install();
