const BUILD = 721;
const STATE_KEY = '__gannzillaOrnateFrameCleanAuthorityV721';
const OVERLAY_ID = 'gannzilla-ornate-frame-clean-v721';
const ASSET_URL = '/assets/tasi-ornate-frame-exact-v691.webp?v=721-clean-authority';
const ASSET_HOLE_DIAMETER_RATIO = 0.7444444444;
const BASE_RESERVED_MARGIN = 90;

const LEGACY_OVERLAY_IDS = [
  'gannzilla-ornate-outer-frame-overlay-v687',
  'gannzilla-reference-ornate-frame-v688',
  'gannzilla-exact-reference-frame-v690',
  'gannzilla-exact-reference-frame-v691',
  'gannzilla-exact-reference-frame-v693',
  'gannzilla-exact-reference-frame-v707',
  'gannzilla-persistent-exact-frame-v712',
  'gannzilla-ornate-frame-clean-v720',
];

let wheel = null;
let overlay = null;
let resizeObserver = null;
let wheelMutationObserver = null;
let documentMutationObserver = null;
let animationFrame = 0;
let timer = 0;
let applyCount = 0;
let lastApply = null;
let assetError = null;

function isEnabled() {
  return typeof window !== 'undefined'
    && window.location.pathname === '/v672.html';
}

function removeLegacyOverlays() {
  LEGACY_OVERLAY_IDS.forEach((id) => {
    document.getElementById(id)?.remove();
  });

  document
    .querySelectorAll([
      '[data-gannzilla-reference-ornate-frame-v688="true"]',
      '[data-gannzilla-exact-reference-frame-v707="true"]',
      '[data-gannzilla-persistent-exact-frame-v712="true"]',
    ].join(','))
    .forEach((node) => {
      if (node.id !== OVERLAY_ID) node.remove();
    });
}

function isWheelCanvas(canvas) {
  if (!(canvas instanceof HTMLCanvasElement) || canvas.closest('aside')) return false;

  const id = String(canvas.id || '').toLowerCase();
  if (id.includes('overlay') || id.includes('preview') || id.includes('tracker')) return false;

  const rect = canvas.getBoundingClientRect();
  return rect.width > 300
    && rect.height > 300
    && canvas.width > 300
    && canvas.height > 300;
}

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-wheel-ivory-champagne-final-authority-v682="true"]',
    'canvas[data-gannzilla-outer-empty-ring-mirror-silver-v668="true"]',
    'canvas[data-gannzilla-empty-outer-ring-v518="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v506="true"]',
  ].join(','));

  if (isWheelCanvas(preferred)) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter(isWheelCanvas)
    .sort((a, b) => {
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      return (bRect.width * bRect.height) - (aRect.width * aRect.height);
    })[0] || null;
}

function createOverlay() {
  if (overlay?.isConnected) return overlay;

  overlay = document.createElement('img');
  overlay.id = OVERLAY_ID;
  overlay.alt = '';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.dataset.gannzillaOrnateFrameCleanAuthorityV721 = 'true';
  overlay.draggable = false;
  overlay.decoding = 'async';
  overlay.src = ASSET_URL;

  overlay.addEventListener('load', () => {
    assetError = null;
    schedule('asset-load');
  });

  overlay.addEventListener('error', () => {
    assetError = 'FRAME_ASSET_LOAD_FAILED';
    overlay.style.setProperty('display', 'none', 'important');
  });

  const style = overlay.style;
  style.setProperty('position', 'fixed', 'important');
  style.setProperty('display', 'none', 'important');
  style.setProperty('left', '0px', 'important');
  style.setProperty('top', '0px', 'important');
  style.setProperty('width', '0px', 'important');
  style.setProperty('height', '0px', 'important');
  style.setProperty('max-width', 'none', 'important');
  style.setProperty('max-height', 'none', 'important');
  style.setProperty('object-fit', 'fill', 'important');
  style.setProperty('object-position', 'center', 'important');
  style.setProperty('pointer-events', 'none', 'important');
  style.setProperty('user-select', 'none', 'important');
  style.setProperty('touch-action', 'none', 'important');
  style.setProperty('z-index', '2147482000', 'important');
  style.setProperty('opacity', '1', 'important');
  style.setProperty('visibility', 'visible', 'important');
  style.setProperty('transform', 'translate3d(0,0,0)', 'important');
  style.setProperty('transform-origin', 'center center', 'important');
  style.setProperty('image-rendering', 'auto', 'important');
  style.setProperty('filter', 'none', 'important');
  style.setProperty('mix-blend-mode', 'normal', 'important');
  style.setProperty('will-change', 'left, top, width, height', 'important');

  (document.body || document.documentElement).appendChild(overlay);
  return overlay;
}

function disconnectWheelObservers() {
  resizeObserver?.disconnect();
  wheelMutationObserver?.disconnect();
  resizeObserver = null;
  wheelMutationObserver = null;
}

function observeWheel(canvas) {
  disconnectWheelObservers();

  if (typeof ResizeObserver === 'function') {
    resizeObserver = new ResizeObserver(() => schedule('wheel-resize'));
    resizeObserver.observe(canvas);
  }

  if (typeof MutationObserver === 'function') {
    wheelMutationObserver = new MutationObserver(() => schedule('wheel-mutation'));
    wheelMutationObserver.observe(canvas, {
      attributes: true,
      attributeFilter: ['style', 'class', 'width', 'height'],
    });
  }
}

function snapToDevicePixel(value) {
  const dpr = Math.max(1, Number(window.devicePixelRatio) || 1);
  return Math.round(value * dpr) / dpr;
}

function getGeometry(canvas, rect) {
  const canvasSize = Math.min(rect.width, rect.height);
  const zoom = Math.max(0.5, Number(canvas.dataset.gannzillaAppliedZoom) || 1);
  const reservedMargin = Math.min(
    canvasSize * 0.16,
    Math.max(36, BASE_RESERVED_MARGIN * zoom),
  );

  const existingWheelDiameter = Math.max(
    canvasSize * 0.68,
    canvasSize - (reservedMargin * 2),
  );
  const targetHoleDiameter = existingWheelDiameter + Math.max(2, 4 * zoom);
  const frameSize = targetHoleDiameter / ASSET_HOLE_DIAMETER_RATIO;
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  return {
    canvasSize,
    zoom,
    reservedMargin,
    existingWheelDiameter,
    targetHoleDiameter,
    frameSize: snapToDevicePixel(frameSize),
    centerX: snapToDevicePixel(centerX),
    centerY: snapToDevicePixel(centerY),
  };
}

function apply(source = 'apply') {
  animationFrame = 0;
  removeLegacyOverlays();

  const image = createOverlay();
  if (!isEnabled()) {
    image.style.setProperty('display', 'none', 'important');
    return false;
  }

  const nextWheel = findWheel();
  if (!(nextWheel instanceof HTMLCanvasElement)) {
    image.style.setProperty('display', 'none', 'important');
    return false;
  }

  if (wheel !== nextWheel) {
    wheel = nextWheel;
    observeWheel(wheel);
  }

  const rect = wheel.getBoundingClientRect();
  const geometry = getGeometry(wheel, rect);
  if (!(geometry.canvasSize > 300) || !(geometry.frameSize > 300)) return false;

  const left = snapToDevicePixel(geometry.centerX - geometry.frameSize / 2);
  const top = snapToDevicePixel(geometry.centerY - geometry.frameSize / 2);

  image.style.setProperty('left', `${left}px`, 'important');
  image.style.setProperty('top', `${top}px`, 'important');
  image.style.setProperty('width', `${geometry.frameSize}px`, 'important');
  image.style.setProperty('height', `${geometry.frameSize}px`, 'important');
  image.style.setProperty('display', 'block', 'important');

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    asset: ASSET_URL,
    assetLoaded: Boolean(image.complete && image.naturalWidth > 0),
    assetNaturalWidth: Number(image.naturalWidth || 0),
    assetNaturalHeight: Number(image.naturalHeight || 0),
    wheelWidth: rect.width,
    wheelHeight: rect.height,
    frameSize: geometry.frameSize,
    frameToCanvasRatio: geometry.frameSize / geometry.canvasSize,
    transparentHoleRatio: ASSET_HOLE_DIAMETER_RATIO,
    targetHoleDiameter: geometry.targetHoleDiameter,
    existingWheelDiameter: geometry.existingWheelDiameter,
    reservedMargin: geometry.reservedMargin,
    zoom: geometry.zoom,
    centerX: geometry.centerX,
    centerY: geometry.centerY,
    left,
    top,
    centerLocked: true,
    existingWheelGeometryChanged: false,
    zIndex: 2147482000,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:ornate-frame-clean-authority-v721', {
    detail: lastApply,
  }));

  return true;
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = window.requestAnimationFrame(() => apply(source));
  }, Math.max(0, Number(delay) || 0));
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || window[STATE_KEY]) return;

  removeLegacyOverlays();
  createOverlay();

  const refresh = (event) => schedule(event?.type || 'refresh');
  [
    'resize',
    'scroll',
    'wheel',
    'pointerdown',
    'pointermove',
    'pointerup',
    'pointercancel',
    'gannzilla:wheel-ivory-champagne-final-authority-v682',
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:outer-empty-ring-mirror-silver-v668',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:wheel-input-v459',
    'gannzilla:page-scrollbar-pan-v305',
    'gannzilla:layout-panel-visibility-change',
  ].forEach((name) => window.addEventListener(name, refresh, true));

  document.addEventListener('visibilitychange', refresh, false);

  if (typeof MutationObserver === 'function') {
    documentMutationObserver = new MutationObserver(() => schedule('document-child-change', 20));
    documentMutationObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  [0, 80, 180, 360, 700, 1200, 2200, 4000, 7000].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  const watchTimer = window.setInterval(() => schedule('geometry-watch'), 350);

  window.GANNZILLA_ORNATE_FRAME_CLEAN_AUTHORITY_V721 = true;
  window.__auditGannzillaOrnateFrameCleanAuthorityV721 = () => ({
    ok: isEnabled()
      && wheel instanceof HTMLCanvasElement
      && overlay instanceof HTMLImageElement
      && overlay.isConnected
      && overlay.complete
      && overlay.naturalWidth > 0
      && overlay.style.display !== 'none'
      && overlay.style.zIndex === '2147482000',
    build: BUILD,
    enabled: isEnabled(),
    singleAuthority: true,
    sourceIntegrated: true,
    legacyRuntimeRequired: false,
    exactReferenceAsset: true,
    asset: ASSET_URL,
    assetLoaded: Boolean(overlay?.complete && overlay?.naturalWidth > 0),
    assetError,
    overlayConnected: Boolean(overlay?.isConnected),
    zIndex: Number(overlay?.style?.zIndex || 0),
    applyCount,
    lastApply,
  });

  window[STATE_KEY] = {
    apply,
    schedule,
    watchTimer,
    get wheel() { return wheel; },
    get overlay() { return overlay; },
  };
}

install();
