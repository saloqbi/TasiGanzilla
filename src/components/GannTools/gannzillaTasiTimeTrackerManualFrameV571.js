const BUILD = 571;
const STATE_KEY = '__gannzillaTasiTimeTrackerManualFrameV571';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-manual-frame-v571';
const CONTROLS_ID = 'gannzilla-tasi-time-tracker-manual-controls-v571';
const STORAGE_KEY = 'gannzilla.tasiTimeTracker.manualFrame.v571';

const MIN_WIDTH = 360;
const MIN_HEIGHT = 120;
const MAX_WIDTH = 3200;
const MAX_HEIGHT = 1600;

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
    && boolParam('timeTrackerManualFrame', true);
}

function finiteNumber(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function normalizeState(candidate, fallback) {
  const state = {
    left: finiteNumber(candidate?.left, fallback.left),
    top: finiteNumber(candidate?.top, fallback.top),
    width: clamp(finiteNumber(candidate?.width, fallback.width), MIN_WIDTH, MAX_WIDTH),
    height: clamp(finiteNumber(candidate?.height, fallback.height), MIN_HEIGHT, MAX_HEIGHT),
  };

  const visibleX = 84;
  const visibleY = 42;
  state.left = clamp(state.left, -state.width + visibleX, window.innerWidth - visibleX);
  state.top = clamp(state.top, -state.height + visibleY, window.innerHeight - visibleY);
  return state;
}

function loadStoredState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function saveStoredState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) {
    // Storage is optional. The live controls still work without persistence.
  }
}

function clearStoredState() {
  try { window.localStorage.removeItem(STORAGE_KEY); }
  catch (_) { /* no-op */ }
}

function cssText() {
  return `
    :host {
      overflow: visible !important;
      contain: none !important;
      touch-action: none !important;
    }

    .tracker {
      box-sizing: border-box !important;
      width: var(--tt-manual-base-width) !important;
      min-width: var(--tt-manual-base-width) !important;
      max-width: var(--tt-manual-base-width) !important;
      height: var(--tt-manual-base-height) !important;
      min-height: var(--tt-manual-base-height) !important;
      max-height: var(--tt-manual-base-height) !important;
      transform: scale(var(--tt-manual-scale-x), var(--tt-manual-scale-y)) !important;
      transform-origin: 0 0 !important;
      will-change: transform !important;
      overflow: hidden !important;
    }

    #${CONTROLS_ID} {
      position: absolute;
      inset: 0;
      z-index: 2147483647;
      pointer-events: none;
      user-select: none;
      font-family: Arial, sans-serif;
    }

    #${CONTROLS_ID} .tt-manual-drag,
    #${CONTROLS_ID} .tt-manual-reset,
    #${CONTROLS_ID} .tt-manual-resize {
      pointer-events: auto;
      touch-action: none;
    }

    #${CONTROLS_ID} .tt-manual-drag {
      position: absolute;
      top: -18px;
      left: 50%;
      width: 86px;
      height: 20px;
      border: 1px solid #b9652f;
      border-radius: 999px;
      background: linear-gradient(180deg, rgba(91,38,14,.96), rgba(18,8,4,.98));
      color: #f6cf9b;
      font-size: 15px;
      font-weight: 900;
      line-height: 18px;
      text-align: center;
      cursor: move;
      transform: translateX(-50%);
      opacity: .64;
      box-shadow: 0 0 0 1px rgba(255,218,166,.28) inset, 0 0 10px rgba(214,105,44,.35);
    }

    #${CONTROLS_ID} .tt-manual-drag:hover,
    #${CONTROLS_ID} .tt-manual-drag:focus-visible {
      opacity: 1;
      outline: none;
    }

    #${CONTROLS_ID} .tt-manual-reset {
      position: absolute;
      top: -18px;
      right: 8px;
      width: 25px;
      height: 20px;
      padding: 0;
      border: 1px solid #b9652f;
      border-radius: 6px;
      background: linear-gradient(180deg, rgba(91,38,14,.96), rgba(18,8,4,.98));
      color: #f6cf9b;
      font-size: 15px;
      font-weight: 900;
      line-height: 18px;
      text-align: center;
      cursor: pointer;
      opacity: .64;
      box-shadow: 0 0 0 1px rgba(255,218,166,.28) inset, 0 0 10px rgba(214,105,44,.28);
    }

    #${CONTROLS_ID} .tt-manual-reset:hover,
    #${CONTROLS_ID} .tt-manual-reset:focus-visible {
      opacity: 1;
      outline: none;
    }

    #${CONTROLS_ID} .tt-manual-resize {
      position: absolute;
      opacity: .18;
      transition: opacity 120ms ease;
    }

    #${CONTROLS_ID}:hover .tt-manual-resize {
      opacity: .72;
    }

    #${CONTROLS_ID} .tt-manual-resize::after {
      content: '';
      position: absolute;
      background: #d8894e;
      box-shadow: 0 0 7px rgba(237,132,66,.72);
    }

    #${CONTROLS_ID} [data-resize="n"],
    #${CONTROLS_ID} [data-resize="s"] {
      left: 18px;
      right: 18px;
      height: 10px;
      cursor: ns-resize;
    }

    #${CONTROLS_ID} [data-resize="n"] { top: -5px; }
    #${CONTROLS_ID} [data-resize="s"] { bottom: -5px; }

    #${CONTROLS_ID} [data-resize="n"]::after,
    #${CONTROLS_ID} [data-resize="s"]::after {
      left: 25%;
      right: 25%;
      top: 4px;
      height: 2px;
    }

    #${CONTROLS_ID} [data-resize="e"],
    #${CONTROLS_ID} [data-resize="w"] {
      top: 18px;
      bottom: 18px;
      width: 10px;
      cursor: ew-resize;
    }

    #${CONTROLS_ID} [data-resize="e"] { right: -5px; }
    #${CONTROLS_ID} [data-resize="w"] { left: -5px; }

    #${CONTROLS_ID} [data-resize="e"]::after,
    #${CONTROLS_ID} [data-resize="w"]::after {
      top: 25%;
      bottom: 25%;
      left: 4px;
      width: 2px;
    }

    #${CONTROLS_ID} [data-resize="ne"],
    #${CONTROLS_ID} [data-resize="nw"],
    #${CONTROLS_ID} [data-resize="se"],
    #${CONTROLS_ID} [data-resize="sw"] {
      width: 18px;
      height: 18px;
    }

    #${CONTROLS_ID} [data-resize="ne"] { top: -7px; right: -7px; cursor: nesw-resize; }
    #${CONTROLS_ID} [data-resize="nw"] { top: -7px; left: -7px; cursor: nwse-resize; }
    #${CONTROLS_ID} [data-resize="se"] { bottom: -7px; right: -7px; cursor: nwse-resize; }
    #${CONTROLS_ID} [data-resize="sw"] { bottom: -7px; left: -7px; cursor: nesw-resize; }

    #${CONTROLS_ID} [data-resize="ne"]::after,
    #${CONTROLS_ID} [data-resize="nw"]::after,
    #${CONTROLS_ID} [data-resize="se"]::after,
    #${CONTROLS_ID} [data-resize="sw"]::after {
      inset: 4px;
      border-radius: 50%;
    }
  `;
}

let host = null;
let shadow = null;
let tracker = null;
let controls = null;
let hostObserver = null;
let bodyObserver = null;
let resizeObserver = null;
let timer = 0;
let gesture = null;
let applying = false;
let baseState = null;
let state = null;
let applyCount = 0;
let lastApply = null;

function setImportantIfNeeded(element, name, value) {
  if (!(element instanceof HTMLElement)) return;
  if (element.style.getPropertyValue(name) === value
      && element.style.getPropertyPriority(name) === 'important') return;
  element.style.setProperty(name, value, 'important');
}

function ensureStyle() {
  let style = shadow.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = cssText();
    shadow.appendChild(style);
  }
  return style;
}

function controlsMarkup() {
  return `
    <button type="button" class="tt-manual-drag" title="تحريك لوحة الوقت" aria-label="تحريك لوحة الوقت">✥</button>
    <button type="button" class="tt-manual-reset" title="إعادة الحجم والموقع الافتراضي" aria-label="إعادة الحجم والموقع الافتراضي">↺</button>
    <span class="tt-manual-resize" data-resize="n" aria-hidden="true"></span>
    <span class="tt-manual-resize" data-resize="e" aria-hidden="true"></span>
    <span class="tt-manual-resize" data-resize="s" aria-hidden="true"></span>
    <span class="tt-manual-resize" data-resize="w" aria-hidden="true"></span>
    <span class="tt-manual-resize" data-resize="ne" aria-hidden="true"></span>
    <span class="tt-manual-resize" data-resize="nw" aria-hidden="true"></span>
    <span class="tt-manual-resize" data-resize="se" aria-hidden="true"></span>
    <span class="tt-manual-resize" data-resize="sw" aria-hidden="true"></span>
  `;
}

function stopGesture() {
  gesture = null;
  document.documentElement.style.removeProperty('user-select');
  document.documentElement.style.removeProperty('cursor');
  window.removeEventListener('pointermove', onPointerMove, true);
  window.removeEventListener('pointerup', onPointerUp, true);
  window.removeEventListener('pointercancel', onPointerUp, true);
}

function startGesture(event, mode) {
  if (!state) return;
  event.preventDefault();
  event.stopPropagation();
  stopGesture();
  gesture = {
    mode,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    start: { ...state },
  };
  document.documentElement.style.setProperty('user-select', 'none');
  document.documentElement.style.setProperty('cursor', mode === 'move' ? 'move' : `${mode}-resize`);
  window.addEventListener('pointermove', onPointerMove, { capture: true, passive: false });
  window.addEventListener('pointerup', onPointerUp, true);
  window.addEventListener('pointercancel', onPointerUp, true);
}

function resizeFromGesture(mode, dx, dy, start) {
  const next = { ...start };

  if (mode.includes('e')) next.width = clamp(start.width + dx, MIN_WIDTH, MAX_WIDTH);
  if (mode.includes('s')) next.height = clamp(start.height + dy, MIN_HEIGHT, MAX_HEIGHT);

  if (mode.includes('w')) {
    const width = clamp(start.width - dx, MIN_WIDTH, MAX_WIDTH);
    next.left = start.left + (start.width - width);
    next.width = width;
  }

  if (mode.includes('n')) {
    const height = clamp(start.height - dy, MIN_HEIGHT, MAX_HEIGHT);
    next.top = start.top + (start.height - height);
    next.height = height;
  }

  return normalizeState(next, start);
}

function onPointerMove(event) {
  if (!gesture || event.pointerId !== gesture.pointerId) return;
  event.preventDefault();
  const dx = event.clientX - gesture.startX;
  const dy = event.clientY - gesture.startY;

  if (gesture.mode === 'move') {
    state = normalizeState({
      ...gesture.start,
      left: gesture.start.left + dx,
      top: gesture.start.top + dy,
    }, gesture.start);
  } else {
    state = resizeFromGesture(gesture.mode, dx, dy, gesture.start);
  }

  applyState('pointer-move');
}

function onPointerUp(event) {
  if (!gesture || event.pointerId !== gesture.pointerId) return;
  event.preventDefault();
  saveStoredState(state);
  stopGesture();
  applyState('pointer-up');
}

function bindControls() {
  controls = shadow.getElementById(CONTROLS_ID);
  if (!(controls instanceof HTMLElement)) {
    controls = document.createElement('div');
    controls.id = CONTROLS_ID;
    controls.innerHTML = controlsMarkup();
    shadow.appendChild(controls);
  }

  if (controls.dataset.boundV571 === 'true') return;

  controls.querySelector('.tt-manual-drag')?.addEventListener('pointerdown', (event) => {
    startGesture(event, 'move');
  });

  controls.querySelectorAll('[data-resize]').forEach((handle) => {
    handle.addEventListener('pointerdown', (event) => {
      startGesture(event, String(handle.dataset.resize || 'se'));
    });
  });

  controls.querySelector('.tt-manual-reset')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    clearStoredState();
    state = { ...baseState };
    applyState('reset');
  });

  controls.querySelector('.tt-manual-drag')?.addEventListener('dblclick', (event) => {
    event.preventDefault();
    clearStoredState();
    state = { ...baseState };
    applyState('double-click-reset');
  });

  controls.dataset.boundV571 = 'true';
}

function applyState(source = 'apply-state') {
  if (!(host instanceof HTMLElement)
      || !(shadow instanceof ShadowRoot)
      || !(tracker instanceof HTMLElement)
      || !baseState
      || !state) return false;

  applying = true;
  state = normalizeState(state, baseState);

  const scaleX = state.width / baseState.width;
  const scaleY = state.height / baseState.height;

  setImportantIfNeeded(host, 'position', 'fixed');
  setImportantIfNeeded(host, 'left', `${state.left}px`);
  setImportantIfNeeded(host, 'top', `${state.top}px`);
  setImportantIfNeeded(host, 'right', 'auto');
  setImportantIfNeeded(host, 'bottom', 'auto');
  setImportantIfNeeded(host, 'width', `${state.width}px`);
  setImportantIfNeeded(host, 'height', `${state.height}px`);
  setImportantIfNeeded(host, 'min-width', '0px');
  setImportantIfNeeded(host, 'min-height', '0px');
  setImportantIfNeeded(host, 'max-width', 'none');
  setImportantIfNeeded(host, 'max-height', 'none');
  setImportantIfNeeded(host, 'overflow', 'visible');
  setImportantIfNeeded(host, 'transform', 'none');

  setImportantIfNeeded(host, '--tt-manual-base-width', `${baseState.width}px`);
  setImportantIfNeeded(host, '--tt-manual-base-height', `${baseState.height}px`);
  setImportantIfNeeded(host, '--tt-manual-scale-x', String(scaleX));
  setImportantIfNeeded(host, '--tt-manual-scale-y', String(scaleY));

  host.dataset.gannzillaTasiTimeTrackerManualFrameV571 = 'true';
  host.dataset.gannzillaTasiTimeTrackerManualLeftV571 = String(Math.round(state.left));
  host.dataset.gannzillaTasiTimeTrackerManualTopV571 = String(Math.round(state.top));
  host.dataset.gannzillaTasiTimeTrackerManualWidthV571 = String(Math.round(state.width));
  host.dataset.gannzillaTasiTimeTrackerManualHeightV571 = String(Math.round(state.height));
  host.dataset.gannzillaTasiTimeTrackerManualScaleXV571 = scaleX.toFixed(5);
  host.dataset.gannzillaTasiTimeTrackerManualScaleYV571 = scaleY.toFixed(5);
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV571 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    state: { ...state },
    base: { ...baseState },
    scaleX,
    scaleY,
    canvasChanged: false,
    at: Date.now(),
  };

  requestAnimationFrame(() => { applying = false; });
  return true;
}

function ensureManualFrame(source = 'ensure') {
  if (!enabled()) return false;

  host = document.getElementById(HOST_ID);
  shadow = host?.shadowRoot;
  tracker = shadow?.querySelector('.tracker');

  if (!(host instanceof HTMLElement)
      || !(shadow instanceof ShadowRoot)
      || !(tracker instanceof HTMLElement)) return false;

  ensureStyle();
  bindControls();

  if (!baseState) {
    const rect = host.getBoundingClientRect();
    const natural = {
      left: rect.left,
      top: rect.top,
      width: Math.max(MIN_WIDTH, rect.width),
      height: Math.max(MIN_HEIGHT, rect.height),
    };
    baseState = normalizeState(natural, natural);
    const stored = loadStoredState();
    state = normalizeState(stored || baseState, baseState);
  }

  if (!(hostObserver instanceof MutationObserver)) {
    hostObserver = new MutationObserver(() => {
      if (!applying && !gesture) schedule('host-style-authority', 0);
    });
    hostObserver.observe(host, { attributes: true, attributeFilter: ['style', 'class', 'hidden'] });
  }

  if (typeof ResizeObserver === 'function' && !(resizeObserver instanceof ResizeObserver)) {
    resizeObserver = new ResizeObserver(() => {
      if (!applying && !gesture) schedule('resize-observer', 0);
    });
    resizeObserver.observe(host);
  }

  return applyState(source);
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => requestAnimationFrame(() => ensureManualFrame(source)), delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  bodyObserver = new MutationObserver(() => schedule('dom-mutation', 12));
  bodyObserver.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', () => {
    if (state && baseState) state = normalizeState(state, baseState);
    schedule('window-resize', 0);
  }, false);

  [0, 80, 220, 600, 1400, 3200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });

  window.GANNZILLA_TASI_TIME_TRACKER_MANUAL_FRAME_V571 = true;
  window.__auditGannzillaTasiTimeTrackerManualFrameV571 = () => {
    const trackerHost = document.getElementById(HOST_ID);
    const trackerShadow = trackerHost?.shadowRoot;
    const trackerControls = trackerShadow?.getElementById(CONTROLS_ID);
    return {
      ok: trackerHost instanceof HTMLElement
        && trackerShadow instanceof ShadowRoot
        && trackerControls instanceof HTMLElement
        && trackerHost.dataset.gannzillaTasiTimeTrackerManualFrameV571 === 'true',
      build: BUILD,
      applyCount,
      state: state ? { ...state } : null,
      base: baseState ? { ...baseState } : null,
      handles: trackerControls?.querySelectorAll('[data-resize]').length || 0,
      persisted: Boolean(loadStoredState()),
      canvasChanged: trackerHost?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV571 === 'true',
      lastApply,
    };
  };

  window[STATE_KEY] = {
    schedule,
    ensureManualFrame,
    reset() {
      clearStoredState();
      if (baseState) {
        state = { ...baseState };
        applyState('api-reset');
      }
    },
    get state() { return state ? { ...state } : null; },
    get baseState() { return baseState ? { ...baseState } : null; },
  };

  schedule('install', 0);
}

install();
