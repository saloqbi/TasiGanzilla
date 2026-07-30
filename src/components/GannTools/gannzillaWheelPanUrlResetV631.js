const BUILD = 631;
const STATE_KEY = '__gannzillaWheelPanUrlResetV631';
const PAN_STORAGE_KEY = 'gannzilla-wheel-asymmetric-open-pan-v305';
const RESET_PARAM = 'resetWheelPan';

let applyCount = 0;
let lastApply = null;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function enabled() {
  const value = String(params().get(RESET_PARAM) || '').toLowerCase();
  return ['true', '1', 'yes', 'on'].includes(value);
}

function clearStoredPan() {
  try {
    localStorage.removeItem(PAN_STORAGE_KEY);
    return true;
  } catch (_) {
    return false;
  }
}

function dispatchReset(source = 'dispatch-reset') {
  const detail = { x: 0, y: 0, source, build: BUILD };
  window.dispatchEvent(new CustomEvent('gannzilla:wheel-pan-offset-v305', { detail }));
  window.dispatchEvent(new CustomEvent('gannzilla:page-scrollbar-pan-v305', { detail }));
}

function apply(source = 'apply') {
  if (!enabled()) return false;

  const storageCleared = clearStoredPan();
  dispatchReset(source);

  const wheel = document.querySelector([
    'canvas[data-gannzilla-final-wheel-authority-v506="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v491="true"]',
    'canvas[data-gannzilla-keyboard-mouse-control-v459="true"]',
  ].join(','));
  const preview = document.getElementById('gannzilla-fixed-paint-preview-v512');

  [wheel, preview].forEach((element) => {
    if (!(element instanceof HTMLElement)) return;
    element.style.setProperty('transform', 'translate3d(0px, 0px, 0)', 'important');
    element.style.setProperty('transform-origin', 'center center', 'important');
  });

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    storageCleared,
    pan: { x: 0, y: 0 },
    wheelFound: wheel instanceof HTMLCanvasElement,
    previewFound: preview instanceof HTMLImageElement,
    at: Date.now(),
  };
  return true;
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  clearStoredPan();

  [0, 40, 120, 300, 700, 1600, 3200].forEach((delay) => {
    window.setTimeout(() => apply(`boot-${delay}`), delay);
  });

  window.addEventListener('gannzilla:final-wheel-authority-v506', () => apply('final-wheel-authority'), false);
  window.addEventListener('load', () => apply('window-load'), { once: true });

  window.GANNZILLA_WHEEL_PAN_URL_RESET_V631 = true;
  window.__auditGannzillaWheelPanUrlResetV631 = () => ({
    ok: enabled()
      && (() => {
        try { return localStorage.getItem(PAN_STORAGE_KEY) === null; }
        catch (_) { return false; }
      })(),
    build: BUILD,
    resetParam: params().get(RESET_PARAM),
    storageKey: PAN_STORAGE_KEY,
    targetPan: { x: 0, y: 0 },
    applyCount,
    lastApply,
  });

  window[STATE_KEY] = { apply, dispatchReset, clearStoredPan };
  apply('install');
}

install();
