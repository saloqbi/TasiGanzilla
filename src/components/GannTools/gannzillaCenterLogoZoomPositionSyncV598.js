const BUILD = 598;
const STATE_KEY = '__gannzillaCenterLogoZoomPositionSyncV598';
const LOGO_STATE_KEY = '__gannzillaCenterLogoResponsive81V596';

let resizeObserver = null;
let observedCanvas = null;
let settleGeneration = 0;
let applyRequestCount = 0;
let lastRequest = null;

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

function requestLogoApply(source) {
  const logoAuthority = window[LOGO_STATE_KEY];
  if (!logoAuthority || typeof logoAuthority.schedule !== 'function') return false;
  logoAuthority.schedule(`position-sync-v${BUILD}:${source}`);
  applyRequestCount += 1;
  lastRequest = { source, at: Date.now() };
  return true;
}

function attachResizeObserver() {
  if (typeof ResizeObserver !== 'function') return false;
  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement)) return false;
  if (canvas === observedCanvas && resizeObserver) return true;

  resizeObserver?.disconnect();
  observedCanvas = canvas;
  resizeObserver = new ResizeObserver(() => settle('canvas-resize'));
  resizeObserver.observe(canvas);
  return true;
}

function settle(source = 'settle') {
  const generation = ++settleGeneration;
  const run = (phase) => {
    if (generation !== settleGeneration) return;
    attachResizeObserver();
    requestLogoApply(`${source}:${phase}`);
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(() => run('double-raf'));
  });

  [40, 100, 180, 320, 600].forEach((delay) => {
    window.setTimeout(() => run(`delay-${delay}`), delay);
  });
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  [
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:empty-outer-ring-v518',
  ].forEach((name) => {
    window.addEventListener(name, () => settle(name), false);
  });

  window.addEventListener('resize', () => settle('window-resize'), false);

  [0, 80, 220, 600, 1400, 3000].forEach((delay) => {
    window.setTimeout(() => settle(`boot-${delay}`), delay);
  });

  window.GANNZILLA_CENTER_LOGO_ZOOM_POSITION_SYNC_V598 = true;
  window.__auditGannzillaCenterLogoZoomPositionSyncV598 = () => ({
    ok: enabled()
      && window[LOGO_STATE_KEY]
      && typeof window[LOGO_STATE_KEY].schedule === 'function'
      && observedCanvas instanceof HTMLCanvasElement,
    build: BUILD,
    logoScalePreserved: Number(
      document.getElementById('gannzilla-center-logo-responsive-81-v596')
        ?.dataset.gannzillaCenterLogoScaleV596 || 0,
    ) === 0.99,
    observedCanvas: observedCanvas instanceof HTMLCanvasElement,
    applyRequestCount,
    lastRequest,
  });

  window[STATE_KEY] = { settle, attachResizeObserver };
  settle('install');
}

install();
