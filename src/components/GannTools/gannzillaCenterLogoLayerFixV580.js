const BUILD = 580;
const STATE_KEY = '__gannzillaCenterLogoLayerFixV580';
const OVERLAY_ID = 'gannzilla-center-logo-layer-v580';
const LEGACY_OVERLAY_ID = 'gannzilla-center-logo-v579';
const STYLE_ID = 'gannzilla-center-logo-layer-style-v580';
const ASSET_URL = '/center-logo-v580.svg?v=580';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function enabled() {
  const query = params();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  const logoEnabled = !['false', '0', 'off', 'no'].includes(String(query.get('centerLogo') || 'true').toLowerCase());
  return wheelMode && logoEnabled;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-final-wheel-authority-v506="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v491="true"]',
  ].join(','));
  if (preferred instanceof HTMLCanvasElement && !preferred.closest('aside')) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => canvas instanceof HTMLCanvasElement && !canvas.closest('aside'))
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

function ensureStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    #${LEGACY_OVERLAY_ID} {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }

    #${OVERLAY_ID} {
      position: fixed !important;
      z-index: 2147483645 !important;
      display: block !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 4px solid rgba(190, 141, 46, .98) !important;
      border-radius: 50% !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
      transform: translate(-50%, -50%) !important;
      transform-origin: center center !important;
      background-color: #020202 !important;
      background-image: url("${ASSET_URL}") !important;
      background-position: center center !important;
      background-repeat: no-repeat !important;
      background-size: cover !important;
      pointer-events: none !important;
      user-select: none !important;
      isolation: isolate !important;
      box-shadow:
        0 0 0 2px rgba(37, 25, 7, .96),
        0 0 20px rgba(220, 163, 52, .48) !important;
    }
  `;
}

function ensureOverlay() {
  let overlay = document.getElementById(OVERLAY_ID);
  if (!(overlay instanceof HTMLElement)) {
    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.setAttribute('role', 'img');
    overlay.setAttribute('aria-label', 'شعار كوكبة تاسي للذهب');
    overlay.dataset.gannzillaCenterLogoLayerV580 = 'true';
    document.body.appendChild(overlay);
  }

  if (overlay.parentElement !== document.body || document.body.lastElementChild !== overlay) {
    document.body.appendChild(overlay);
  }
  return overlay;
}

let frame = 0;
let applyCount = 0;
let lastApply = null;
let resizeObserver = null;
let observedCanvas = null;

function apply(source = 'apply') {
  frame = 0;
  if (!enabled()) return false;

  ensureStyle();
  const canvas = findWheel();
  const overlay = ensureOverlay();
  if (!(canvas instanceof HTMLCanvasElement)) {
    overlay.style.setProperty('visibility', 'hidden', 'important');
    overlay.style.setProperty('opacity', '0', 'important');
    return false;
  }

  const rect = canvas.getBoundingClientRect();
  const canvasStyle = getComputedStyle(canvas);
  const visible = canvasStyle.display !== 'none'
    && canvasStyle.visibility !== 'hidden'
    && Number(canvasStyle.opacity || 1) > 0.01
    && rect.width > 1
    && rect.height > 1;

  const expandedRadius = Number(canvas.dataset.gannzillaExpandedCenterRadius)
    || Number(params().get('expandedCenterRadius'))
    || 182.56;
  const appliedZoom = Number(canvas.dataset.gannzillaAppliedZoom)
    || Number(params().get('gannzillaZoom'))
    || 1;
  const scale = clamp(Number(params().get('centerLogoScale')) || 0.96, 0.70, 1);
  const diameter = clamp(expandedRadius * 2 * appliedZoom * scale, 80, 2400);
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  overlay.style.setProperty('left', `${centerX}px`, 'important');
  overlay.style.setProperty('top', `${centerY}px`, 'important');
  overlay.style.setProperty('width', `${diameter}px`, 'important');
  overlay.style.setProperty('height', `${diameter}px`, 'important');
  overlay.style.setProperty('display', visible ? 'block' : 'none', 'important');
  overlay.style.setProperty('visibility', visible ? 'visible' : 'hidden', 'important');
  overlay.style.setProperty('opacity', visible ? '1' : '0', 'important');
  overlay.style.setProperty('pointer-events', 'none', 'important');

  overlay.dataset.gannzillaCenterLogoLayerV580 = 'true';
  overlay.dataset.gannzillaCenterLogoDiameterV580 = diameter.toFixed(2);
  overlay.dataset.gannzillaCenterLogoScaleV580 = scale.toFixed(2);
  overlay.dataset.gannzillaCenterLogoAssetV580 = ASSET_URL;
  overlay.dataset.gannzillaCenterLogoVisibleV580 = String(visible);
  overlay.dataset.gannzillaCenterLogoCanvasChangedV580 = 'false';

  if (!(resizeObserver instanceof ResizeObserver)) {
    resizeObserver = new ResizeObserver(() => schedule('canvas-resize'));
  }
  if (observedCanvas !== canvas) {
    if (observedCanvas instanceof Element) resizeObserver.unobserve(observedCanvas);
    observedCanvas = canvas;
    resizeObserver.observe(canvas);
  }

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    centerX,
    centerY,
    diameter,
    expandedRadius,
    appliedZoom,
    scale,
    visible,
    at: Date.now(),
  };
  return visible;
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

  const observer = new MutationObserver(() => schedule('dom-mutation'));
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('resize', () => schedule('window-resize'), false);
  window.addEventListener('scroll', () => schedule('window-scroll'), { passive: true });
  window.addEventListener('pointermove', () => schedule('pointermove'), true);
  window.addEventListener('wheel', () => schedule('wheel'), { capture: true, passive: true });

  [
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:final-wheel-authority-v491',
    'gannzilla:center-cell-comfort-v508',
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:page-scrollbar-pan-v305',
  ].forEach((name) => window.addEventListener(name, () => schedule(name), false));

  [0, 80, 220, 600, 1400, 3200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });
  window.setInterval(() => schedule('safety-refresh'), 750);

  window.GANNZILLA_CENTER_LOGO_LAYER_FIX_V580 = true;
  window.__auditGannzillaCenterLogoLayerFixV580 = () => {
    const overlay = document.getElementById(OVERLAY_ID);
    const rect = overlay?.getBoundingClientRect();
    const style = overlay instanceof HTMLElement ? getComputedStyle(overlay) : null;
    return {
      ok: overlay instanceof HTMLElement
        && overlay.dataset.gannzillaCenterLogoLayerV580 === 'true'
        && Number(rect?.width || 0) > 80
        && Math.abs((rect?.width || 0) - (rect?.height || 0)) < 1
        && style?.display !== 'none'
        && style?.visibility !== 'hidden'
        && Number(style?.opacity || 0) > 0.9,
      build: BUILD,
      circular: true,
      aboveCanvas: true,
      zIndex: Number(style?.zIndex || 0),
      diameter: Number(overlay?.dataset.gannzillaCenterLogoDiameterV580 || 0),
      scale: Number(overlay?.dataset.gannzillaCenterLogoScaleV580 || 0),
      asset: overlay?.dataset.gannzillaCenterLogoAssetV580 || null,
      canvasChanged: overlay?.dataset.gannzillaCenterLogoCanvasChangedV580 === 'true',
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, observer };
  schedule('install');
}

install();
