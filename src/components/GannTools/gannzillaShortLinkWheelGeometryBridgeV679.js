const BUILD = 679;
const STATE_KEY = '__gannzillaShortLinkWheelGeometryBridgeV679';
const CHAMPAGNE_OVERLAY_ID = 'gannzilla-wheel-champagne-chrome-overlay-v675';
const DRAWING_OVERLAY_ID = 'gannzilla-top-center-drawing-overlay-v471';
const THEME_OVERLAY_ID = 'gannzilla-wheel-line-theme-overlay-v473';

let observer = null;
let timer = 0;
let applyCount = 0;
let lastApply = null;

function effectiveSearch() {
  return window.__gannzillaV672CanonicalSearch || window.location.search || '';
}

function params() {
  try { return new URLSearchParams(effectiveSearch()); }
  catch (_) { return new URLSearchParams(); }
}

function numberParam(name, fallback) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? value : fallback;
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-final-wheel-authority-v506="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v491="true"]',
    'canvas[data-gannzilla-native-wheel-scrollbars-hidden-v417="true"]',
    'canvas[data-gannzilla-keyboard-mouse-control-v459="true"]',
  ].join(','));
  if (preferred instanceof HTMLCanvasElement && !preferred.closest('aside')) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement)
        || canvas.closest('aside')
        || canvas.id === CHAMPAGNE_OVERLAY_ID
        || canvas.id === DRAWING_OVERLAY_ID
        || canvas.id === THEME_OVERLAY_ID) return false;
      const rect = canvas.getBoundingClientRect();
      return canvas.width > 300 && canvas.height > 300 && rect.width > 250 && rect.height > 250;
    })
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

function buildRingWidths() {
  const levels = Math.max(1, Math.round(numberParam('levels', 10)));
  const appliedZoom = Math.max(0.25, numberParam('gannzillaZoom', 1));
  const ringWidth = Math.max(4, numberParam('gannzillaRingWidth', 96.76)) * appliedZoom;
  const anchorRingScale = Math.max(1, numberParam('anchorRingScale', 1.10));
  const totalRingCount = levels + 3;

  return {
    levels,
    appliedZoom,
    ringWidth,
    anchorRingScale,
    widths: Array.from({ length: totalRingCount }, (_, index) =>
      index === 2 ? ringWidth * anchorRingScale : ringWidth),
  };
}

function apply(source = 'apply') {
  if (!wheelMode()) return false;

  const wheel = findWheel();
  if (!(wheel instanceof HTMLCanvasElement)) return false;

  const rect = wheel.getBoundingClientRect();
  if (!(rect.width > 250 && rect.height > 250)) return false;

  const geometry = buildRingWidths();
  const cssSize = Number(wheel.dataset.gannzillaCanvasCssSize)
    || Number.parseFloat(wheel.style.width)
    || rect.width;

  wheel.dataset.gannzillaRingWidths = geometry.widths
    .map((value) => Number(value.toFixed(4)))
    .join(',');
  wheel.dataset.gannzillaAppliedZoom = String(geometry.appliedZoom);
  wheel.dataset.gannzillaCanvasCssSize = String(cssSize);
  wheel.dataset.gannzillaAnchorRingScale = String(geometry.anchorRingScale);
  wheel.dataset.gannzillaAnchorRingWidth = String(geometry.widths[2]);
  wheel.dataset.gannzillaShortLinkGeometryBridgeV679 = 'true';

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    levels: geometry.levels,
    ringBoundaryCount: geometry.widths.length + 1,
    ringWidth: geometry.ringWidth,
    anchorRingWidth: geometry.widths[2],
    appliedZoom: geometry.appliedZoom,
    cssSize,
    geometryChanged: false,
    numberLayoutChanged: false,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:final-wheel-authority-v506', {
    detail: { ...lastApply, geometryBridge: true },
  }));
  return true;
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(schedule.timer);
  schedule.timer = window.setTimeout(() => apply(source), delay);
}

function install() {
  if (typeof window === 'undefined'
    || typeof document === 'undefined'
    || !wheelMode()
    || window[STATE_KEY]) return;

  [0, 30, 80, 160, 320, 600, 1000, 1800, 3200, 5200, 8200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });

  observer = new MutationObserver(() => schedule('mutation', 0));
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'width', 'height', 'class'],
  });

  window.addEventListener('resize', () => schedule('resize', 0), false);
  window.addEventListener('scroll', () => schedule('scroll', 0), true);
  window.addEventListener('gannzilla:native-dpr-zoom-v504', () => schedule('zoom', 20), false);

  timer = window.setInterval(() => apply('geometry-watch'), 180);

  window.GANNZILLA_SHORT_LINK_WHEEL_GEOMETRY_BRIDGE_V679 = true;
  window.__auditGannzillaShortLinkWheelGeometryBridgeV679 = () => {
    const wheel = findWheel();
    return {
      ok: wheel instanceof HTMLCanvasElement
        && wheel.dataset.gannzillaShortLinkGeometryBridgeV679 === 'true'
        && Boolean(wheel.dataset.gannzillaRingWidths),
      build: BUILD,
      wheelFound: wheel instanceof HTMLCanvasElement,
      ringWidthsPublished: wheel?.dataset?.gannzillaRingWidths || '',
      geometryChanged: false,
      numberLayoutChanged: false,
      applyCount,
      observerActive: Boolean(observer),
      timerActive: Boolean(timer),
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule };
  schedule('install');
}

install();
