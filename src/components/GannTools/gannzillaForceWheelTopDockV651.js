const BUILD = 651;
const STATE_KEY = '__gannzillaForceWheelTopDockV651';
const PARAM = 'forceWheelTopDock';
const PAN_STORAGE_KEY = 'gannzilla-wheel-asymmetric-open-pan-v305';
const RESET_WINDOW_MS = 8000;

let applyCount = 0;
let lastApply = null;
let stopped = false;
let stopTimer = 0;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function enabled() {
  const value = String(params().get(PARAM) || '').toLowerCase();
  return ['true', '1', 'yes', 'on'].includes(value);
}

function readOffset() {
  try {
    const value = JSON.parse(localStorage.getItem(PAN_STORAGE_KEY) || '{}');
    return {
      x: Number.isFinite(Number(value.x)) ? Number(value.x) : 0,
      y: Number.isFinite(Number(value.y)) ? Number(value.y) : 0,
    };
  } catch (_) {
    return { x: 0, y: 0 };
  }
}

function writeZeroVerticalOffset() {
  const current = readOffset();
  const next = { x: current.x, y: 0 };
  try {
    localStorage.setItem(PAN_STORAGE_KEY, JSON.stringify(next));
  } catch (_) {
    // Runtime event remains the active authority when storage is unavailable.
  }
  return { current, next };
}

function findVisibleCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement)
          || canvas.closest('aside')
          || canvas.id === 'gannzilla-top-center-drawing-overlay-v471') return false;
      const style = getComputedStyle(canvas);
      const rect = canvas.getBoundingClientRect();
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity || 0) > 0.01
        && rect.width > 250
        && rect.height > 250;
    })
    .sort((a, b) => {
      const aArea = a.getBoundingClientRect().width * a.getBoundingClientRect().height;
      const bArea = b.getBoundingClientRect().width * b.getBoundingClientRect().height;
      return bArea - aArea;
    })[0] || null;
}

function apply(source = 'apply') {
  if (!enabled() || stopped) return false;

  const { current, next } = writeZeroVerticalOffset();
  const detail = {
    x: next.x,
    y: 0,
    source,
    build: BUILD,
    forceWheelTopDock: true,
  };

  // V305 listens to this event and updates its internal React offset authority.
  window.dispatchEvent(new CustomEvent('gannzilla:page-scrollbar-pan-v305', { detail }));

  const canvas = findVisibleCanvas();
  if (canvas instanceof HTMLCanvasElement) {
    canvas.dataset.gannzillaForceWheelTopDockV651 = 'true';
    canvas.dataset.gannzillaForceWheelTopDockYV651 = '0';
  }

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    previousStoredOffset: current,
    targetOffset: next,
    visibleCanvasFound: canvas instanceof HTMLCanvasElement,
    canvasRuntimeY: canvas instanceof HTMLCanvasElement
      ? Number(canvas.dataset.gannzillaAsymmetricOpenY || 0)
      : null,
    storageChanged: current.y !== 0,
    wheelGeometryChanged: false,
    wheelSizeChanged: false,
    horizontalPanPreserved: true,
    at: Date.now(),
  };
  return true;
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  // Clear persisted vertical pan before the delayed V305 layout passes complete.
  writeZeroVerticalOffset();

  [0, 40, 100, 220, 500, 1000, 1800, 3000, 5000, 7600]
    .forEach((delay) => window.setTimeout(() => apply(`boot-${delay}`), delay));

  [
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:zodiac-outer-ring-v522',
    'gannzilla:weekdays-outer-ring-v523',
    'gannzilla:metallic-angle-outer-ring-v531',
    'gannzilla:paint-zoom-v515',
    'gannzilla:ring-two-numbering-refresh',
    'gannzilla:layout-panel-visibility-change',
  ].forEach((name) => window.addEventListener(name, () => apply(name), false));

  window.addEventListener('load', () => apply('window-load'), { once: true });
  window.addEventListener('resize', () => apply('window-resize'), false);

  stopTimer = window.setTimeout(() => {
    apply('final-dock');
    stopped = true;
  }, RESET_WINDOW_MS);

  window.GANNZILLA_FORCE_WHEEL_TOP_DOCK_V651 = true;
  window.__auditGannzillaForceWheelTopDockV651 = () => {
    const stored = readOffset();
    const canvas = findVisibleCanvas();
    const runtimeY = canvas instanceof HTMLCanvasElement
      ? Number(canvas.dataset.gannzillaAsymmetricOpenY || 0)
      : null;
    return {
      ok: enabled()
        && stored.y === 0
        && (runtimeY === null || runtimeY === 0),
      build: BUILD,
      resetWindowMs: RESET_WINDOW_MS,
      horizontalPanPreserved: true,
      storedOffset: stored,
      canvasRuntimeY: runtimeY,
      applyCount,
      resetWindowComplete: stopped,
      stopTimerActive: Boolean(stopTimer) && !stopped,
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, readOffset, writeZeroVerticalOffset };
  apply('install');
}

install();
