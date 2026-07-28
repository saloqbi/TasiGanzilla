const BUILD = 575;
const STATE_KEY = '__gannzillaTasiTimeTrackerHorizontalResizeV575';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-horizontal-resize-v575';
const STORAGE_KEY = 'gannzilla.tasiTimeTracker.horizontalResize.v575';
const LEGACY_POSITION_KEY = 'gannzilla.tasiTimeTracker.freeDrag.v574';
const WHEEL_API_KEY = '__gannzillaKeyboardMouseControlV459';
const WHEEL_PATCH_KEY = '__gannzillaKeyboardMouseControlHorizontalResizePatchV575';

const EDGE_HIT_PX = 22;
const MIN_WIDTH = 420;
const MAX_WIDTH = 3200;

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
    && boolParam('timeTrackerHorizontalResize', true);
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function finite(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
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
      if (document.documentElement.dataset.gannzillaTimeTrackerGestureV575 === 'true') return;
      original.onPointerMove(event);
    },
    finishDrag(event) {
      if (document.documentElement.dataset.gannzillaTimeTrackerGestureV575 === 'true') return;
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
      overflow: visible !important;
    }

    :host([data-gannzilla-tasi-time-tracker-gesture-mode-v575="move"]) {
      cursor: grabbing !important;
    }

    :host([data-gannzilla-tasi-time-tracker-edge-v575="left"]),
    :host([data-gannzilla-tasi-time-tracker-edge-v575="right"]),
    :host([data-gannzilla-tasi-time-tracker-gesture-mode-v575="resize-left"]),
    :host([data-gannzilla-tasi-time-tracker-gesture-mode-v575="resize-right"]) {
      cursor: ew-resize !important;
    }

    .tracker,
    .tracker * {
      cursor: inherit !important;
      user-select: none !important;
    }

    .tracker {
      box-sizing: border-box !important;
      width: var(--tt-v575-base-width) !important;
      min-width: var(--tt-v575-base-width) !important;
      max-width: var(--tt-v575-base-width) !important;
      transform: scaleX(var(--tt-v575-scale-x)) !important;
      transform-origin: 0 0 !important;
      will-change: transform !important;
    }
  `;
}

function readJson(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function loadStoredState(fallback) {
  const current = readJson(STORAGE_KEY);
  if (current) {
    return {
      left: finite(current.left, fallback.left),
      top: finite(current.top, fallback.top),
      width: finite(current.width, fallback.width),
    };
  }

  const legacy = readJson(LEGACY_POSITION_KEY);
  if (legacy) {
    return {
      left: finite(legacy.left, fallback.left),
      top: finite(legacy.top, fallback.top),
      width: fallback.width,
    };
  }
  return { ...fallback };
}

function saveStoredState(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      left: Math.round(value.left),
      top: Math.round(value.top),
      width: Math.round(value.width),
    }));
  } catch (_) {
    // Runtime controls remain available when storage is blocked.
  }
}

function clearLegacyManualState(host, shadow) {
  try {
    window.localStorage.removeItem('gannzilla.tasiTimeTracker.manualFrame.v571');
    window.localStorage.removeItem('gannzilla.tasiTimeTracker.interactionFix.v572.resetOnce');
    window.localStorage.removeItem('gannzilla.tasiTimeTracker.interactionFix.v573.resetOnce');
  } catch (_) {
    // Legacy cleanup is optional.
  }

  shadow?.getElementById('gannzilla-tasi-time-tracker-manual-controls-v571')?.remove();
  shadow?.getElementById('gannzilla-tasi-time-tracker-manual-frame-v571')?.remove();
  shadow?.getElementById('gannzilla-tasi-time-tracker-interaction-fix-v572')?.remove();
  shadow?.getElementById('gannzilla-tasi-time-tracker-interaction-fix-v573')?.remove();
  shadow?.getElementById('gannzilla-tasi-time-tracker-free-drag-v574')?.remove();

  [
    '--tt-manual-base-width',
    '--tt-manual-base-height',
    '--tt-manual-scale-x',
    '--tt-manual-scale-y',
  ].forEach((name) => host.style.removeProperty(name));
}

let host = null;
let shadow = null;
let tracker = null;
let baseWidth = 0;
let baseHeight = 0;
let state = null;
let gesture = null;
let applying = false;
let observer = null;
let hostObserver = null;
let timer = 0;
let applyCount = 0;
let lastApply = null;

function normalizeState(candidate) {
  const width = clamp(finite(candidate.width, baseWidth || MIN_WIDTH), MIN_WIDTH, MAX_WIDTH);
  const visibleX = 90;
  const visibleY = 42;
  return {
    left: clamp(
      finite(candidate.left, 0),
      -width + visibleX,
      window.innerWidth - visibleX,
    ),
    top: clamp(
      finite(candidate.top, 0),
      -(baseHeight || 120) + visibleY,
      window.innerHeight - visibleY,
    ),
    width,
  };
}

function applyState(source = 'apply-state') {
  if (!(host instanceof HTMLElement)
      || !(tracker instanceof HTMLElement)
      || !baseWidth
      || !baseHeight
      || !state) return false;

  applying = true;
  state = normalizeState(state);
  const scaleX = state.width / baseWidth;

  host.style.setProperty('position', 'fixed', 'important');
  host.style.setProperty('left', `${state.left}px`, 'important');
  host.style.setProperty('top', `${state.top}px`, 'important');
  host.style.setProperty('right', 'auto', 'important');
  host.style.setProperty('bottom', 'auto', 'important');
  host.style.setProperty('width', `${state.width}px`, 'important');
  host.style.setProperty('height', `${baseHeight}px`, 'important');
  host.style.setProperty('min-width', '0px', 'important');
  host.style.setProperty('max-width', 'none', 'important');
  host.style.setProperty('min-height', `${baseHeight}px`, 'important');
  host.style.setProperty('max-height', `${baseHeight}px`, 'important');
  host.style.setProperty('overflow', 'visible', 'important');
  host.style.setProperty('--tt-v575-base-width', `${baseWidth}px`, 'important');
  host.style.setProperty('--tt-v575-scale-x', String(scaleX), 'important');

  host.dataset.gannzillaTasiTimeTrackerHorizontalResizeV575 = 'true';
  host.dataset.gannzillaTasiTimeTrackerLeftV575 = String(Math.round(state.left));
  host.dataset.gannzillaTasiTimeTrackerTopV575 = String(Math.round(state.top));
  host.dataset.gannzillaTasiTimeTrackerWidthV575 = String(Math.round(state.width));
  host.dataset.gannzillaTasiTimeTrackerScaleXV575 = scaleX.toFixed(5);
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV575 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    state: { ...state },
    baseWidth,
    baseHeight,
    scaleX,
    mode: gesture?.mode || null,
    canvasChanged: false,
    at: Date.now(),
  };

  requestAnimationFrame(() => { applying = false; });
  return true;
}

function detectMode(event) {
  if (!(host instanceof HTMLElement)) return 'move';
  const rect = host.getBoundingClientRect();
  const localX = event.clientX - rect.left;
  if (localX <= EDGE_HIT_PX) return 'resize-left';
  if (localX >= rect.width - EDGE_HIT_PX) return 'resize-right';
  return 'move';
}

function updateHoverCursor(event) {
  if (!(host instanceof HTMLElement) || gesture) return;
  if (!eventBelongsToTracker(event)) {
    delete host.dataset.gannzillaTasiTimeTrackerEdgeV575;
    return;
  }
  const mode = detectMode(event);
  if (mode === 'resize-left') host.dataset.gannzillaTasiTimeTrackerEdgeV575 = 'left';
  else if (mode === 'resize-right') host.dataset.gannzillaTasiTimeTrackerEdgeV575 = 'right';
  else delete host.dataset.gannzillaTasiTimeTrackerEdgeV575;
}

function onPointerDown(event) {
  if (event.button !== 0 || !eventBelongsToTracker(event)) return;
  if (!(host instanceof HTMLElement) || !state) return;

  const mode = detectMode(event);
  const rect = host.getBoundingClientRect();
  state = normalizeState({ left: rect.left, top: rect.top, width: rect.width });
  gesture = {
    mode,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    start: { ...state },
    fixedRight: state.left + state.width,
  };

  document.documentElement.dataset.gannzillaTimeTrackerGestureV575 = 'true';
  host.dataset.gannzillaTasiTimeTrackerGestureModeV575 = mode;
  delete host.dataset.gannzillaTasiTimeTrackerEdgeV575;
  try { host.setPointerCapture?.(event.pointerId); } catch (_) { /* optional */ }
  document.documentElement.style.setProperty('user-select', 'none');
  event.preventDefault();
  event.stopPropagation();
}

function onPointerMove(event) {
  if (!gesture) {
    updateHoverCursor(event);
    return;
  }
  if (event.pointerId !== gesture.pointerId) return;

  event.preventDefault();
  event.stopPropagation();
  const dx = event.clientX - gesture.startX;
  const dy = event.clientY - gesture.startY;

  if (gesture.mode === 'move') {
    state = normalizeState({
      ...gesture.start,
      left: gesture.start.left + dx,
      top: gesture.start.top + dy,
    });
  } else if (gesture.mode === 'resize-right') {
    state = normalizeState({
      ...gesture.start,
      width: gesture.start.width + dx,
    });
  } else {
    const width = clamp(gesture.start.width - dx, MIN_WIDTH, MAX_WIDTH);
    state = normalizeState({
      ...gesture.start,
      left: gesture.fixedRight - width,
      width,
    });
  }

  applyState('pointer-move');
}

function finishGesture(event) {
  if (!gesture || (event?.pointerId != null && event.pointerId !== gesture.pointerId)) return;
  try { host?.releasePointerCapture?.(gesture.pointerId); } catch (_) { /* optional */ }
  gesture = null;
  delete document.documentElement.dataset.gannzillaTimeTrackerGestureV575;
  if (host instanceof HTMLElement) delete host.dataset.gannzillaTasiTimeTrackerGestureModeV575;
  document.documentElement.style.removeProperty('user-select');
  if (state) saveStoredState(state);
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  applyState('pointer-up');
}

function ensureHorizontalResize(source = 'ensure') {
  if (!enabled()) return false;
  host = document.getElementById(HOST_ID);
  shadow = host?.shadowRoot;
  tracker = shadow?.querySelector('.tracker');
  if (!(host instanceof HTMLElement)
      || !(shadow instanceof ShadowRoot)
      || !(tracker instanceof HTMLElement)) return false;

  clearLegacyManualState(host, shadow);

  let style = shadow.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = cssText();
    shadow.appendChild(style);
  }

  patchWheelAuthority();

  if (!baseWidth || !baseHeight) {
    const rect = host.getBoundingClientRect();
    baseWidth = Math.max(MIN_WIDTH, rect.width);
    baseHeight = Math.max(120, rect.height);
    const fallback = { left: rect.left, top: rect.top, width: baseWidth };
    state = normalizeState(loadStoredState(fallback));
  }

  if (!(hostObserver instanceof MutationObserver)) {
    hostObserver = new MutationObserver(() => {
      if (!applying && !gesture) schedule('host-style-authority', 0);
    });
    hostObserver.observe(host, { attributes: true, attributeFilter: ['style', 'class', 'hidden'] });
  }

  return applyState(source);
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => requestAnimationFrame(() => ensureHorizontalResize(source)), delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  window.addEventListener('pointerdown', onPointerDown, true);
  window.addEventListener('pointermove', onPointerMove, true);
  window.addEventListener('pointerup', finishGesture, true);
  window.addEventListener('pointercancel', finishGesture, true);
  window.addEventListener('blur', finishGesture, false);
  window.addEventListener('resize', () => schedule('resize', 0), false);

  observer = new MutationObserver(() => {
    if (!gesture) schedule('dom-mutation', 12);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  [0, 80, 220, 600, 1400, 3200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });

  window.GANNZILLA_TASI_TIME_TRACKER_HORIZONTAL_RESIZE_V575 = true;
  window.__auditGannzillaTasiTimeTrackerHorizontalResizeV575 = () => ({
    ok: host instanceof HTMLElement
      && shadow instanceof ShadowRoot
      && tracker instanceof HTMLElement
      && host.dataset.gannzillaTasiTimeTrackerHorizontalResizeV575 === 'true'
      && !shadow.getElementById('gannzilla-tasi-time-tracker-manual-controls-v571'),
    build: BUILD,
    applyCount,
    state: state ? { ...state } : null,
    baseWidth,
    baseHeight,
    edgeHitPx: EDGE_HIT_PX,
    mode: gesture?.mode || null,
    freeMove: true,
    leftResize: true,
    rightResize: true,
    verticalResize: false,
    wheelIsolation: Boolean(window[WHEEL_PATCH_KEY]),
    canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV575 === 'true',
    lastApply,
  });

  window[STATE_KEY] = {
    ensureHorizontalResize,
    get state() { return state ? { ...state } : null; },
  };

  schedule('install', 0);
}

install();
