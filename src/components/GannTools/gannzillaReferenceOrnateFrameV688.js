const BUILD = 688;
const STATE_KEY = '__gannzillaReferenceOrnateFrameV688';
const OVERLAY_ID = 'gannzilla-reference-ornate-frame-v688';
const ASSET_URL = '/assets/tasi-ornate-frame-reference-v688.webp?v=688-reference-frame';

let wheel = null;
let overlay = null;
let mutationObserver = null;
let resizeObserver = null;
let frame = 0;
let timer = 0;
let applyCount = 0;
let lastApply = null;

function effectiveParams() {
  try {
    const raw = window.__gannzillaV672CanonicalSearch
      || window.sessionStorage.getItem('gannzilla:v672:canonical-search')
      || window.location.search
      || '';
    return new URLSearchParams(raw);
  } catch (_) {
    return new URLSearchParams();
  }
}

function boolParam(name, fallback = true) {
  const query = effectiveParams();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function numberParam(name, fallback, min, max) {
  const value = Number(effectiveParams().get(name));
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

function enabled() {
  const query = effectiveParams();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  return wheelMode
    && boolParam('ornateOuterFrame', true)
    && boolParam('ornateReferenceFrame', true)
    && (window.location.pathname === '/v672.html' || query.get('ornateReferenceFrame') === 'true');
}

function isWheelCanvas(canvas) {
  if (!(canvas instanceof HTMLCanvasElement) || canvas.closest('aside')) return false;
  const id = String(canvas.id || '').toLowerCase();
  if (id.includes('overlay') || id.includes('preview') || id.includes('tracker')) return false;
  return canvas.width > 300 && canvas.height > 300;
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
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

function removeLegacyApproximation() {
  document.getElementById('gannzilla-ornate-outer-frame-overlay-v687')?.remove();
}

function createOverlay() {
  if (overlay?.isConnected) return overlay;
  overlay = document.createElement('img');
  overlay.id = OVERLAY_ID;
  overlay.alt = '';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.dataset.gannzillaReferenceOrnateFrameV688 = 'true';
  overlay.src = ASSET_URL;
  overlay.draggable = false;
  overlay.style.setProperty('position', 'fixed', 'important');
  overlay.style.setProperty('pointer-events', 'none', 'important');
  overlay.style.setProperty('user-select', 'none', 'important');
  overlay.style.setProperty('z-index', '8', 'important');
  overlay.style.setProperty('object-fit', 'fill', 'important');
  overlay.style.setProperty('transform-origin', 'center center', 'important');
  overlay.style.setProperty('image-rendering', 'auto', 'important');
  overlay.style.setProperty('max-width', 'none', 'important');
  overlay.style.setProperty('max-height', 'none', 'important');
  document.body.appendChild(overlay);
  return overlay;
}

function disconnectObservers() {
  mutationObserver?.disconnect();
  resizeObserver?.disconnect();
  mutationObserver = null;
  resizeObserver = null;
}

function observeWheel(canvas) {
  disconnectObservers();
  mutationObserver = new MutationObserver(() => schedule('wheel-mutation'));
  mutationObserver.observe(canvas, {
    attributes: true,
    attributeFilter: ['style', 'width', 'height', 'class'],
  });
  if (typeof ResizeObserver === 'function') {
    resizeObserver = new ResizeObserver(() => schedule('wheel-resize'));
    resizeObserver.observe(canvas);
  }
}

function apply(source = 'apply') {
  frame = 0;
  removeLegacyApproximation();

  if (!enabled()) {
    if (overlay) overlay.style.display = 'none';
    return false;
  }

  const nextWheel = findWheel();
  if (!(nextWheel instanceof HTMLCanvasElement)) return false;
  if (wheel !== nextWheel) {
    wheel = nextWheel;
    observeWheel(wheel);
  }

  const rect = wheel.getBoundingClientRect();
  if (!(rect.width > 250) || !(rect.height > 250)) return false;

  const scale = numberParam('ornateReferenceFrameScale', 1.0, 0.94, 1.08);
  const xOffset = numberParam('ornateReferenceFrameOffsetX', 0, -80, 80);
  const yOffset = numberParam('ornateReferenceFrameOffsetY', 0, -80, 80);
  const size = Math.min(rect.width, rect.height) * scale;
  const centerX = rect.left + rect.width / 2 + xOffset;
  const centerY = rect.top + rect.height / 2 + yOffset;
  const img = createOverlay();

  img.style.display = 'block';
  img.style.left = `${centerX - size / 2}px`;
  img.style.top = `${centerY - size / 2}px`;
  img.style.width = `${size}px`;
  img.style.height = `${size}px`;

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    referenceAsset: true,
    transparentCenter: true,
    legacyApproximationRemoved: true,
    wheelWidth: rect.width,
    displayedSize: size,
    scale,
    xOffset,
    yOffset,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => apply(source));
  }, delay);
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || window[STATE_KEY]) return;

  removeLegacyApproximation();
  const refresh = (event) => schedule(event?.type || 'refresh');
  [
    'gannzilla:wheel-ivory-champagne-final-authority-v682',
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:outer-empty-ring-mirror-silver-v668',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:wheel-input-v459',
    'gannzilla:page-scrollbar-pan-v305',
    'gannzilla:layout-panel-visibility-change',
  ].forEach((name) => window.addEventListener(name, refresh, false));

  window.addEventListener('resize', refresh, false);
  window.addEventListener('scroll', refresh, true);
  document.addEventListener('visibilitychange', refresh, false);

  [0, 80, 220, 520, 1000, 1800, 3200, 5600].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });
  const watchTimer = window.setInterval(() => schedule('reference-frame-watch'), 400);

  window.GANNZILLA_REFERENCE_ORNATE_FRAME_V688 = true;
  window.__auditGannzillaReferenceOrnateFrameV688 = () => ({
    ok: enabled()
      && wheel instanceof HTMLCanvasElement
      && overlay instanceof HTMLImageElement
      && overlay.isConnected
      && overlay.dataset.gannzillaReferenceOrnateFrameV688 === 'true'
      && overlay.complete
      && overlay.naturalWidth > 0
      && overlay.style.display !== 'none',
    build: BUILD,
    enabled: enabled(),
    exactReferenceAsset: true,
    transparentCenter: true,
    assetLoaded: Boolean(overlay?.complete && overlay?.naturalWidth > 0),
    legacyApproximationRemoved: !document.getElementById('gannzilla-ornate-outer-frame-overlay-v687'),
    overlayConnected: Boolean(overlay?.isConnected),
    applyCount,
    lastApply,
  });

  window[STATE_KEY] = {
    apply,
    schedule,
    get wheel() { return wheel; },
    get overlay() { return overlay; },
    watchTimer,
  };
}

install();
