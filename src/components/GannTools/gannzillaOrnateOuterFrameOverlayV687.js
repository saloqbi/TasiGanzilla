const BUILD = 720;
const STATE_KEY = '__gannzillaOrnateFrameCleanRebuildV720';
const OVERLAY_ID = 'gannzilla-ornate-frame-clean-v720';
const ASSET_URL = '/assets/tasi-ornate-frame-exact-v691.webp?v=720-clean-rebuild';

const LEGACY_OVERLAY_IDS = [
  'gannzilla-ornate-outer-frame-overlay-v687',
  'gannzilla-reference-ornate-frame-v688',
  'gannzilla-exact-reference-frame-v690',
  'gannzilla-exact-reference-frame-v691',
  'gannzilla-exact-reference-frame-v693',
  'gannzilla-exact-reference-frame-v707',
  'gannzilla-persistent-exact-frame-v712',
];

let wheel = null;
let overlay = null;
let resizeObserver = null;
let mutationObserver = null;
let animationFrame = 0;
let timer = 0;
let applyCount = 0;
let lastApply = null;
let assetError = null;

function isEnabled() {
  return window.location.pathname === '/v672.html';
}

function removeLegacyOverlays() {
  LEGACY_OVERLAY_IDS.forEach((id) => {
    document.getElementById(id)?.remove();
  });

  document
    .querySelectorAll('[data-gannzilla-reference-ornate-frame-v688="true"], [data-gannzilla-exact-reference-frame-v707="true"]')
    .forEach((node) => {
      if (node.id !== OVERLAY_ID) node.remove();
    });
}

function isWheelCanvas(canvas) {
  if (!(canvas instanceof HTMLCanvasElement) || canvas.closest('aside')) return false;

  const id = String(canvas.id || '').toLowerCase();
  if (id.includes('overlay') || id.includes('preview') || id.includes('tracker')) return false;

  const rect = canvas.getBoundingClientRect();
  return rect.width > 300 && rect.height > 300 && canvas.width > 300 && canvas.height > 300;
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
  overlay.dataset.gannzillaOrnateFrameCleanV720 = 'true';
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
  style.setProperty('z-index', '8', 'important');
  style.setProperty('opacity', '1', 'important');
  style.setProperty('visibility', 'visible', 'important');
  style.setProperty('transform', 'translate3d(0,0,0)', 'important');
  style.setProperty('transform-origin', 'center center', 'important');
  style.setProperty('image-rendering', 'auto', 'important');
  style.setProperty('filter', 'none', 'important');
  style.setProperty('mix-blend-mode', 'normal', 'important');

  document.body.appendChild(overlay);
  return overlay;
}

function disconnectWheelObserver() {
  resizeObserver?.disconnect();
  resizeObserver = null;
}

function observeWheel(canvas) {
  disconnectWheelObserver();

  if (typeof ResizeObserver === 'function') {
    resizeObserver = new ResizeObserver(() => schedule('wheel-resize'));
    resizeObserver.observe(canvas);
  }
}

function snapToDevicePixel(value) {
  const dpr = Math.max(1, Number(window.devicePixelRatio) || 1);
  return Math.round(value * dpr) / dpr;
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
  const size = snapToDevicePixel(Math.min(rect.width, rect.height));
  if (!(size > 300)) return false;

  const centerX = snapToDevicePixel(rect.left + rect.width / 2);
  const centerY = snapToDevicePixel(rect.top + rect.height / 2);
  const left = snapToDevicePixel(centerX - size / 2);
  const top = snapToDevicePixel(centerY - size / 2);

  image.style.setProperty('left', `${left}px`, 'important');
  image.style.setProperty('top', `${top}px`, 'important');
  image.style.setProperty('width', `${size}px`, 'important');
  image.style.setProperty('height', `${size}px`, 'important');
  image.style.setProperty('display', 'block', 'important');

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    asset: ASSET_URL,
    wheelWidth: rect.width,
    wheelHeight: rect.height,
    frameSize: size,
    scale: 1,
    centerX,
    centerY,
    left,
    top,
    exactSquareGeometry: true,
    centerLocked: true,
    existingWheelGeometryChanged: false,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:ornate-frame-clean-v720', {
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
  if (typeof window === 'undefined' || typeof document === 'undefined' || window[STATE_KEY]) return;

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

  if (typeof MutationObserver === 'function') {
    mutationObserver = new MutationObserver(() => schedule('dom-replacement', 20));
    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  document.addEventListener('visibilitychange', refresh, false);

  [0, 60, 160, 360, 750, 1400, 2600, 4800, 8000].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  const watchTimer = window.setInterval(() => schedule('geometry-watch'), 400);

  window.GANNZILLA_ORNATE_FRAME_CLEAN_V720 = true;
  window.__auditGannzillaOrnateFrameCleanV720 = () => ({
    ok: isEnabled()
      && wheel instanceof HTMLCanvasElement
      && overlay instanceof HTMLImageElement
      && overlay.isConnected
      && overlay.complete
      && overlay.naturalWidth > 0
      && overlay.style.display !== 'none'
      && !assetError,
    build: BUILD,
    enabled: isEnabled(),
    singleAuthority: true,
    scale: 1,
    geometryMode: 'canvas-square-center-lock',
    exactReferenceAsset: true,
    asset: ASSET_URL,
    assetLoaded: Boolean(overlay?.complete && overlay?.naturalWidth > 0),
    assetError,
    overlayConnected: Boolean(overlay?.isConnected),
    legacyOverlaysRemoved: LEGACY_OVERLAY_IDS.every((id) => !document.getElementById(id)),
    existingWheelGeometryChanged: false,
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
