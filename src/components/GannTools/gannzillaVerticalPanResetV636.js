const BUILD = 636;
const STATE_KEY = '__gannzillaVerticalPanResetV636';
const PAN_STORAGE_KEY = 'gannzilla-wheel-asymmetric-open-pan-v305';
const PARAM = 'resetVerticalPan';

let applyCount = 0;
let lastApply = null;

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

function sanitizeStoredVerticalPan() {
  if (!enabled()) return { changed: false, offset: readOffset() };
  const current = readOffset();
  const next = { x: current.x, y: 0 };
  try {
    localStorage.setItem(PAN_STORAGE_KEY, JSON.stringify(next));
    return { changed: current.y !== 0, offset: next };
  } catch (_) {
    return { changed: false, offset: next };
  }
}

function dispatchOffset(offset, source) {
  const detail = { x: offset.x, y: 0, source, build: BUILD };
  window.dispatchEvent(new CustomEvent('gannzilla:page-scrollbar-pan-v305', { detail }));
  window.dispatchEvent(new CustomEvent('gannzilla:wheel-pan-offset-v305', { detail }));
}

function apply(source = 'apply') {
  if (!enabled()) return false;
  const result = sanitizeStoredVerticalPan();
  dispatchOffset(result.offset, source);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    horizontalPanPreserved: true,
    previousVerticalPanCleared: result.changed,
    targetOffset: result.offset,
    at: Date.now(),
  };
  return true;
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  [0, 60, 160, 360, 800, 1600, 3200].forEach((delay) => {
    window.setTimeout(() => apply(`boot-${delay}`), delay);
  });
  window.addEventListener('load', () => apply('window-load'), { once: true });

  window.GANNZILLA_VERTICAL_PAN_RESET_V636 = true;
  window.__auditGannzillaVerticalPanResetV636 = () => {
    const offset = readOffset();
    return {
      ok: enabled() && offset.y === 0,
      build: BUILD,
      horizontalPanPreserved: true,
      verticalPan: offset.y,
      currentOffset: offset,
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, sanitizeStoredVerticalPan, readOffset };
  apply('install');
}

// Run synchronously before React mounts the V305 pan authority so its initial y offset is zero.
sanitizeStoredVerticalPan();
window.setTimeout(install, 0);
