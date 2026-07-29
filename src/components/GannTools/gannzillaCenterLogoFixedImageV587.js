const BUILD = 587;
const STATE_KEY = '__gannzillaCenterLogoFixedImageV587';
const IMAGE_ID = 'gannzilla-center-logo-fixed-image-v587';
const STYLE_ID = 'gannzilla-center-logo-fixed-image-style-v587';
const IMAGE_URL = '/center-logo-v587.jpg?v=587';
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

  const viewportLeft = Math.max(0, rect.left);
  const viewportTop = Math.max(0, rect.top);
  const viewportRight = Math.min(window.innerWidth, rect.right);
  const viewportBottom = Math.min(window.innerHeight, rect.bottom);
  const visibleArea = Math.max(0, viewportRight - viewportLeft)
    * Math.max(0, viewportBottom - viewportTop);
  const finalAuthority = canvas.dataset.gannzillaFinalWheelAuthorityV506 === 'true'
    || canvas.dataset.gannzillaFinalWheelAuthorityV491 === 'true';
  const finalFrame = canvas.dataset.gannzillaCopperTopCorrectionV541 === 'true';

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
      padding: 0 !important;
      border: 3px solid rgba(190, 141, 46, 0.98) !important;
      border-radius: 50% !important;
      box-sizing: border-box !important;
      object-fit: cover !important;
      object-position: center center !important;
      transform: translate(-50%, -50%) !important;
      transform-origin: center center !important;
      pointer-events: none !important;
      user-select: none !important;
      -webkit-user-drag: none !important;
      background: transparent !important;
      box-shadow: 0 0 0 1px rgba(45, 28, 5, 0.95), 0 0 12px rgba(211, 159, 55, 0.30) !important;
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
      image.dataset.gannzillaCenterLogoImageLoadedV587 = 'false';
      image.style.setProperty('visibility', 'hidden', 'important');
      image.style.setProperty('opacity', '0', 'important');
    }, { once: true });
    document.body.appendChild(image);
  }
  if (image.parentElement !== document.body || document.body.lastElementChild !== image) {
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
  const radius = Math.max(40, expandedRadius * appliedZoom * LOGO_SCALE);
  const diameter = radius * 2;
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  image.style.setProperty('left', `${centerX}px`, 'important');
  image.style.setProperty('top', `${centerY}px`, 'important');
  image.style.setProperty('width', `${diameter}px`, 'important');
  image.style.setProperty('height', `${diameter}px`, 'important');
  image.style.setProperty('visibility', 'visible', 'important');
  image.style.setProperty('opacity', '1', 'important');

  image.dataset.gannzillaCenterLogoFixedImageV587 = 'true';
  image.dataset.gannzillaCenterLogoImageLoadedV587 = 'true';
  image.dataset.gannzillaCenterLogoInteractiveV587 = 'false';
  image.dataset.gannzillaCenterLogoDiameterV587 = diameter.toFixed(2);
  image.dataset.gannzillaCenterLogoSelectedCanvasV587 = canvas.id || '(no-id)';

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    centerX,
    centerY,
    diameter,
    radius,
    appliedZoom,
    expandedRadius,
    canvasId: canvas.id || null,
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

  document.getElementById('gannzilla-center-logo-v579')?.remove();
  document.getElementById('gannzilla-center-logo-layer-v580')?.remove();
  document.getElementById('gannzilla-center-logo-visible-canvas-v581')?.remove();

  ensureStyle();
  ensureImage();

  const events = [
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:copper-top-correction-v541',
    'gannzilla:center-cell-comfort-v508',
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:page-scrollbar-pan-v305',
  ];
  events.forEach((name) => window.addEventListener(name, () => schedule(name), false));
  window.addEventListener('resize', () => schedule('resize'), false);
  window.addEventListener('scroll', () => schedule('scroll'), { passive: true });
  window.addEventListener('pointermove', () => schedule('pointermove'), true);
  window.addEventListener('wheel', () => schedule('wheel'), { capture: true, passive: true });

  [0, 80, 200, 500, 1000, 2000, 4000].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });
  window.setInterval(() => schedule('position-refresh'), 500);

  window.GANNZILLA_CENTER_LOGO_FIXED_IMAGE_V587 = true;
  window.__auditGannzillaCenterLogoFixedImageV587 = () => {
    const image = document.getElementById(IMAGE_ID);
    const rect = image?.getBoundingClientRect();
    const style = image instanceof HTMLImageElement ? getComputedStyle(image) : null;
    return {
      ok: image instanceof HTMLImageElement
        && image.complete
        && image.naturalWidth > 0
        && image.dataset.gannzillaCenterLogoFixedImageV587 === 'true'
        && image.dataset.gannzillaCenterLogoInteractiveV587 === 'false'
        && Number(rect?.width || 0) > 80
        && style?.visibility !== 'hidden'
        && Number(style?.opacity || 0) > 0.9,
      build: BUILD,
      imageLoaded: image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
      naturalWidth: image instanceof HTMLImageElement ? image.naturalWidth : 0,
      naturalHeight: image instanceof HTMLImageElement ? image.naturalHeight : 0,
      interactive: false,
      diameter: Number(image?.dataset.gannzillaCenterLogoDiameterV587 || 0),
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule };
  schedule('install');
}

install();
