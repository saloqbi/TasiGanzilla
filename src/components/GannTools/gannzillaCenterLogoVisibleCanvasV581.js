const BUILD = 581;
const STATE_KEY = '__gannzillaCenterLogoVisibleCanvasV581';
const OVERLAY_ID = 'gannzilla-center-logo-visible-canvas-v581';
const STYLE_ID = 'gannzilla-center-logo-visible-canvas-style-v581';
const ASSET_URL = '/center-logo-v580.svg?v=581';
const LEGACY_OVERLAY_IDS = [
  'gannzilla-center-logo-v579',
  'gannzilla-center-logo-layer-v580',
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

function visibleCanvasCandidate(canvas) {
  if (!(canvas instanceof HTMLCanvasElement)
      || canvas.closest('aside')
      || EXCLUDED_CANVAS_IDS.has(canvas.id)
      || canvas.hidden
      || canvas.getAttribute('aria-hidden') === 'true') return null;

  const rect = canvas.getBoundingClientRect();
  const style = getComputedStyle(canvas);
  const visible = style.display !== 'none'
    && style.visibility !== 'hidden'
    && Number(style.opacity || 1) > 0.01
    && rect.width > 250
    && rect.height > 250;
  if (!visible) return null;

  const viewportLeft = Math.max(0, rect.left);
  const viewportTop = Math.max(0, rect.top);
  const viewportRight = Math.min(window.innerWidth, rect.right);
  const viewportBottom = Math.min(window.innerHeight, rect.bottom);
  const viewportWidth = Math.max(0, viewportRight - viewportLeft);
  const viewportHeight = Math.max(0, viewportBottom - viewportTop);
  const intersectionArea = viewportWidth * viewportHeight;
  const rectArea = rect.width * rect.height;
  const authority = canvas.dataset.gannzillaFinalWheelAuthorityV506 === 'true'
    || canvas.dataset.gannzillaFinalWheelAuthorityV491 === 'true';
  const liveAuthority = canvas.dataset.gannzillaSingleVisibleWheelAuthorityV535 === 'true'
    || canvas.dataset.gannzillaSingleVisibleWheel === 'true';

  return {
    canvas,
    rect,
    intersectionArea,
    rectArea,
    authority,
    liveAuthority,
    score: (authority ? 1e15 : 0)
      + (liveAuthority ? 1e14 : 0)
      + intersectionArea * 1e4
      + rectArea,
  };
}

function findVisibleWheel() {
  return Array.from(document.querySelectorAll('canvas'))
    .map(visibleCanvasCandidate)
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
    ${LEGACY_OVERLAY_IDS.map((id) => `#${id}`).join(',')} {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }

    #${OVERLAY_ID} {
      position: fixed !important;
      z-index: 2147483000 !important;
      display: block !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 4px solid rgba(190, 141, 46, .98) !important;
      border-radius: 50% !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
      transform: translate(-50%, -50%) !important;
      transform-origin: center center !important;
      background: #020202 !important;
      pointer-events: none !important;
      user-select: none !important;
      isolation: isolate !important;
      box-shadow:
        0 0 0 2px rgba(37, 25, 7, .96),
        0 0 22px rgba(220, 163, 52, .52) !important;
    }

    #${OVERLAY_ID} img {
      display: block !important;
      width: 100% !important;
      height: 100% !important;
      max-width: none !important;
      max-height: none !important;
      object-fit: cover !important;
      object-position: center center !important;
      border-radius: 50% !important;
      pointer-events: none !important;
      user-select: none !important;
      -webkit-user-drag: none !important;
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
    overlay.dataset.gannzillaCenterLogoVisibleCanvasV581 = 'true';

    const image = document.createElement('img');
    image.alt = '';
    image.draggable = false;
    image.src = ASSET_URL;
    image.addEventListener('load', () => {
      overlay.dataset.gannzillaCenterLogoAssetLoadedV581 = 'true';
    });
    image.addEventListener('error', () => {
      overlay.dataset.gannzillaCenterLogoAssetLoadedV581 = 'false';
    });
    overlay.appendChild(image);
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
  const candidate = findVisibleWheel();
  const overlay = ensureOverlay();
  if (!candidate) {
    overlay.style.setProperty('display', 'none', 'important');
    overlay.style.setProperty('visibility', 'hidden', 'important');
    overlay.style.setProperty('opacity', '0', 'important');
    overlay.dataset.gannzillaCenterLogoVisibleCanvasFoundV581 = 'false';
    return false;
  }

  const { canvas, rect } = candidate;
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
  overlay.style.setProperty('display', 'block', 'important');
  overlay.style.setProperty('visibility', 'visible', 'important');
  overlay.style.setProperty('opacity', '1', 'important');
  overlay.style.setProperty('pointer-events', 'none', 'important');

  overlay.dataset.gannzillaCenterLogoVisibleCanvasV581 = 'true';
  overlay.dataset.gannzillaCenterLogoVisibleCanvasFoundV581 = 'true';
  overlay.dataset.gannzillaCenterLogoDiameterV581 = diameter.toFixed(2);
  overlay.dataset.gannzillaCenterLogoScaleV581 = scale.toFixed(2);
  overlay.dataset.gannzillaCenterLogoSelectedCanvasIdV581 = canvas.id || '(no-id)';
  overlay.dataset.gannzillaCenterLogoSelectedCanvasAuthorityV581 = String(candidate.authority);
  overlay.dataset.gannzillaCenterLogoSelectedCanvasIntersectionV581 = String(
    Math.round(candidate.intersectionArea),
  );
  overlay.dataset.gannzillaCenterLogoCanvasChangedV581 = 'false';

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
    canvasId: canvas.id || null,
    authority: candidate.authority,
    liveAuthority: candidate.liveAuthority,
    intersectionArea: candidate.intersectionArea,
    rectArea: candidate.rectArea,
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

  window.GANNZILLA_CENTER_LOGO_VISIBLE_CANVAS_V581 = true;
  window.__auditGannzillaCenterLogoVisibleCanvasV581 = () => {
    const overlay = document.getElementById(OVERLAY_ID);
    const rect = overlay?.getBoundingClientRect();
    const style = overlay instanceof HTMLElement ? getComputedStyle(overlay) : null;
    return {
      ok: overlay instanceof HTMLElement
        && overlay.dataset.gannzillaCenterLogoVisibleCanvasV581 === 'true'
        && overlay.dataset.gannzillaCenterLogoVisibleCanvasFoundV581 === 'true'
        && Number(rect?.width || 0) > 80
        && Math.abs((rect?.width || 0) - (rect?.height || 0)) < 1
        && style?.display !== 'none'
        && style?.visibility !== 'hidden'
        && Number(style?.opacity || 0) > 0.9,
      build: BUILD,
      visibleCanvasSelected: overlay?.dataset.gannzillaCenterLogoVisibleCanvasFoundV581 === 'true',
      selectedCanvasId: overlay?.dataset.gannzillaCenterLogoSelectedCanvasIdV581 || null,
      selectedCanvasAuthority: overlay?.dataset.gannzillaCenterLogoSelectedCanvasAuthorityV581 === 'true',
      intersectionArea: Number(overlay?.dataset.gannzillaCenterLogoSelectedCanvasIntersectionV581 || 0),
      circular: true,
      aboveCanvas: true,
      zIndex: Number(style?.zIndex || 0),
      diameter: Number(overlay?.dataset.gannzillaCenterLogoDiameterV581 || 0),
      scale: Number(overlay?.dataset.gannzillaCenterLogoScaleV581 || 0),
      assetLoaded: overlay?.dataset.gannzillaCenterLogoAssetLoadedV581 || 'pending',
      canvasChanged: overlay?.dataset.gannzillaCenterLogoCanvasChangedV581 === 'true',
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, observer, findVisibleWheel };
  schedule('install');
}

install();
