const BUILD = 574;
const STATE_KEY = '__gannzillaTasiTimeTrackerFreeDragV574';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-free-drag-v574';
const STORAGE_KEY = 'gannzilla.tasiTimeTracker.freeDrag.v574';
const WHEEL_API_KEY = '__gannzillaKeyboardMouseControlV459';
const WHEEL_PATCH_KEY = '__gannzillaKeyboardMouseControlFreeDragPatchV574';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function boolParam(name, fallback = false) {
  const query = params();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function enabled() {
  const query = params();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  return wheelMode
    && boolParam('timeTracker', false)
    && boolParam('timeTrackerFreeDrag', true);
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function eventBelongsToTracker(event) {
  const host = document.getElementById(HOST_ID);
  if (!(host instanceof HTMLElement)) return false;
  if (event?.target === host) return true;
  const path = typeof event?.composedPath === 'function' ? event.composedPath() : [];
  return path.includes(host);
}

function patchWheelAuthority() {
  if (window[WHEEL_PATCH_KEY]) return true;
  const original = window[WHEEL_API_KEY];
  if (!original
      || typeof original.onPointerDown !== 'function'
      || typeof original.onPointerMove !== 'function'
      || typeof original.finishDrag !== 'function'
      || typeof original.onWheel !== 'function') return false;

  window.removeEventListener('wheel', original.onWheel, true);
  window.removeEventListener('pointerdown', original.onPointerDown, true);
  window.removeEventListener('pointermove', original.onPointerMove, true);
  window.removeEventListener('pointerup', original.finishDrag, true);
  window.removeEventListener('pointercancel', original.finishDrag, true);
  if (typeof original.onAuxClick === 'function') {
    window.removeEventListener('auxclick', original.onAuxClick, true);
  }

  const wrappers = {
    onWheel(event) {
      if (eventBelongsToTracker(event)) return;
      original.onWheel(event);
    },
    onPointerDown(event) {
      if (eventBelongsToTracker(event)) return;
      original.onPointerDown(event);
    },
    onPointerMove(event) {
      if (document.documentElement.dataset.gannzillaTimeTrackerFreeDragV574 === 'true') return;
      original.onPointerMove(event);
    },
    finishDrag(event) {
      if (document.documentElement.dataset.gannzillaTimeTrackerFreeDragV574 === 'true') return;
      original.finishDrag(event);
    },
    onAuxClick(event) {
      if (eventBelongsToTracker(event)) return;
      original.onAuxClick?.(event);
    },
  };

  window.addEventListener('wheel', wrappers.onWheel, { capture: true, passive: false });
  window.addEventListener('pointerdown', wrappers.onPointerDown, true);
  window.addEventListener('pointermove', wrappers.onPointerMove, true);
  window.addEventListener('pointerup', wrappers.finishDrag, true);
  window.addEventListener('pointercancel', wrappers.finishDrag, true);
  window.addEventListener('auxclick', wrappers.onAuxClick, true);

  window[WHEEL_PATCH_KEY] = { original, wrappers };
  return true;
}

function cssText() {
  return `
    :host {
      pointer-events: auto !important;
      touch-action: none !important;
      cursor: grab !important;
      user-select: none !important;
    }

    :host([data-gannzilla-tasi-time-tracker-free-dragging-v574="true"]) {
      cursor: grabbing !important;
    }

    .tracker,
    .tracker * {
      cursor: inherit !important;
      user-select: none !important;
    }
  `;
}

function readStoredPosition() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed) return null;
    const left = Number(parsed.left);
    const top = Number(parsed.top);
    return Number.isFinite(left) && Number.isFinite(top) ? { left, top } : null;
  } catch (_) {
    return null;
  }
}

function saveStoredPosition(position) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      left: Math.round(position.left),
      top: Math.round(position.top),
    }));
  } catch (_) {
    // Dragging remains available when storage is blocked.
  }
}

function clearLegacyManualState(host, shadow) {
  try {
    window.localStorage.removeItem('gannzilla.tasiTimeTracker.manualFrame.v571');
    window.localStorage.removeItem('gannzilla.tasiTimeTracker.interactionFix.v572.resetOnce');
    window.localStorage.removeItem('gannzilla.tasiTimeTracker.interactionFix.v573.resetOnce');
  } catch (_) {
    // Legacy storage cleanup is optional.
  }

  shadow?.getElementById('gannzilla-tasi-time-tracker-manual-controls-v571')?.remove();
  shadow?.getElementById('gannzilla-tasi-time-tracker-manual-frame-v571')?.remove();
  shadow?.getElementById('gannzilla-tasi-time-tracker-interaction-fix-v572')?.remove();
  shadow?.getElementById('gannzilla-tasi-time-tracker-interaction-fix-v573')?.remove();

  [
    '--tt-manual-base-width',
    '--tt-manual-base-height',
    '--tt-manual-scale-x',
    '--tt-manual-scale-y',
  ].forEach((name) => host.style.removeProperty(name));

  ['width', 'height', 'min-width', 'min-height', 'max-width', 'max-height', 'transform']
    .forEach((name) => host.style.removeProperty(name));

  const tracker = shadow?.querySelector('.tracker');
  if (tracker instanceof HTMLElement) {
    ['width', 'height', 'min-width', 'min-height', 'max-width', 'max-height', 'transform', 'transform-origin']
      .forEach((name) => tracker.style.removeProperty(name));
  }
}

let host = null;
let shadow = null;
let drag = null;
let position = null;
let applyCount = 0;
let lastApply = null;
let observer = null;
let timer = 0;

function normalizePosition(candidate) {
  const rect = host.getBoundingClientRect();
  const visibleX = 90;
  const visibleY = 42;
  return {
    left: clamp(candidate.left, -rect.width + visibleX, window.innerWidth - visibleX),
    top: clamp(candidate.top, -rect.height + visibleY, window.innerHeight - visibleY),
  };
}

function applyPosition(source = 'apply-position') {
  if (!(host instanceof HTMLElement) || !position) return false;
  position = normalizePosition(position);
  host.style.setProperty('position', 'fixed', 'important');
  host.style.setProperty('left', `${position.left}px`, 'important');
  host.style.setProperty('top', `${position.top}px`, 'important');
  host.style.setProperty('right', 'auto', 'important');
  host.style.setProperty('bottom', 'auto', 'important');
  host.style.setProperty('z-index', '2147482500', 'important');

  host.dataset.gannzillaTasiTimeTrackerFreeDragV574 = 'true';
  host.dataset.gannzillaTasiTimeTrackerFreeDragLeftV574 = String(Math.round(position.left));
  host.dataset.gannzillaTasiTimeTrackerFreeDragTopV574 = String(Math.round(position.top));
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV574 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    position: { ...position },
    dragging: Boolean(drag),
    canvasChanged: false,
    at: Date.now(),
  };
  return true;
}

function onPointerDown(event) {
  if (event.button !== 0 || !eventBelongsToTracker(event)) return;
  if (!(host instanceof HTMLElement)) return;

  const rect = host.getBoundingClientRect();
  position = { left: rect.left, top: rect.top };
  drag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    originLeft: position.left,
    originTop: position.top,
  };

  document.documentElement.dataset.gannzillaTimeTrackerFreeDragV574 = 'true';
  host.dataset.gannzillaTasiTimeTrackerFreeDraggingV574 = 'true';
  try { host.setPointerCapture?.(event.pointerId); } catch (_) { /* optional */ }
  event.preventDefault();
  event.stopPropagation();
}

function onPointerMove(event) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  event.preventDefault();
  event.stopPropagation();
  position = {
    left: drag.originLeft + (event.clientX - drag.startX),
    top: drag.originTop + (event.clientY - drag.startY),
  };
  applyPosition('pointer-move');
}

function finishDrag(event) {
  if (!drag || (event?.pointerId != null && event.pointerId !== drag.pointerId)) return;
  try { host?.releasePointerCapture?.(drag.pointerId); } catch (_) { /* optional */ }
  drag = null;
  delete document.documentElement.dataset.gannzillaTimeTrackerFreeDragV574;
  if (host instanceof HTMLElement) delete host.dataset.gannzillaTasiTimeTrackerFreeDraggingV574;
  if (position) saveStoredPosition(position);
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  applyPosition('pointer-up');
}

function ensureFreeDrag(source = 'ensure') {
  if (!enabled()) return false;
  host = document.getElementById(HOST_ID);
  shadow = host?.shadowRoot;
  if (!(host instanceof HTMLElement) || !(shadow instanceof ShadowRoot)) return false;

  clearLegacyManualState(host, shadow);

  let style = shadow.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = cssText();
    shadow.appendChild(style);
  }

  patchWheelAuthority();

  if (!position) {
    const rect = host.getBoundingClientRect();
    position = readStoredPosition() || { left: rect.left, top: rect.top };
  }

  return applyPosition(source);
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => requestAnimationFrame(() => ensureFreeDrag(source)), delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  window.addEventListener('pointerdown', onPointerDown, true);
  window.addEventListener('pointermove', onPointerMove, true);
  window.addEventListener('pointerup', finishDrag, true);
  window.addEventListener('pointercancel', finishDrag, true);
  window.addEventListener('blur', finishDrag, false);
  window.addEventListener('resize', () => schedule('resize', 0), false);

  observer = new MutationObserver(() => {
    if (!drag) schedule('dom-mutation', 12);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  [0, 80, 220, 600, 1400, 3200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });

  window.GANNZILLA_TASI_TIME_TRACKER_FREE_DRAG_V574 = true;
  window.__auditGannzillaTasiTimeTrackerFreeDragV574 = () => ({
    ok: host instanceof HTMLElement
      && shadow instanceof ShadowRoot
      && host.dataset.gannzillaTasiTimeTrackerFreeDragV574 === 'true'
      && !shadow.getElementById('gannzilla-tasi-time-tracker-manual-controls-v571'),
    build: BUILD,
    applyCount,
    position: position ? { ...position } : null,
    dragging: Boolean(drag),
    controlsRemoved: !shadow?.getElementById('gannzilla-tasi-time-tracker-manual-controls-v571'),
    wheelIsolation: Boolean(window[WHEEL_PATCH_KEY]),
    canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV574 === 'true',
    lastApply,
  });

  window[STATE_KEY] = {
    ensureFreeDrag,
    get position() { return position ? { ...position } : null; },
  };

  schedule('install', 0);
}

install();
