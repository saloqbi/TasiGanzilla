const BUILD = 572;
const STATE_KEY = '__gannzillaTasiTimeTrackerInteractionFixV572';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const CONTROLS_ID = 'gannzilla-tasi-time-tracker-manual-controls-v571';
const STYLE_ID = 'gannzilla-tasi-time-tracker-interaction-fix-v572';
const MANUAL_API_KEY = '__gannzillaTasiTimeTrackerManualFrameV571';
const WHEEL_API_KEY = '__gannzillaKeyboardMouseControlV459';
const WHEEL_PATCH_KEY = '__gannzillaKeyboardMouseControlTrackerPatchV572';
const RESET_ONCE_KEY = 'gannzilla.tasiTimeTracker.interactionFix.v572.resetOnce';

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
    && boolParam('timeTrackerManualFrame', true)
    && boolParam('timeTrackerInteractionFix', true);
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
      if (document.documentElement.dataset.gannzillaTimeTrackerGestureV572 === 'true') return;
      original.onPointerMove(event);
    },
    finishDrag(event) {
      if (document.documentElement.dataset.gannzillaTimeTrackerGestureV572 === 'true') return;
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
    }

    .tasi-luxury-title-v549 {
      cursor: move !important;
      touch-action: none !important;
      user-select: none !important;
    }

    #${CONTROLS_ID} {
      overflow: visible !important;
    }

    #${CONTROLS_ID} .tt-manual-drag {
      top: -33px !important;
      width: clamp(170px, 24%, 300px) !important;
      height: 35px !important;
      border: 0 !important;
      border-radius: 8px !important;
      background: transparent !important;
      color: transparent !important;
      opacity: 1 !important;
      box-shadow: none !important;
      cursor: move !important;
    }

    #${CONTROLS_ID} .tt-manual-drag:hover,
    #${CONTROLS_ID} .tt-manual-drag:focus-visible {
      background: rgba(215, 125, 64, .08) !important;
      box-shadow: 0 0 0 2px rgba(231, 151, 91, .55), 0 0 14px rgba(226, 118, 49, .35) !important;
    }

    #${CONTROLS_ID} [data-resize="n"],
    #${CONTROLS_ID} [data-resize="s"] {
      left: 30px !important;
      right: 30px !important;
      height: 22px !important;
    }

    #${CONTROLS_ID} [data-resize="n"] { top: -11px !important; }
    #${CONTROLS_ID} [data-resize="s"] { bottom: -11px !important; }

    #${CONTROLS_ID} [data-resize="e"],
    #${CONTROLS_ID} [data-resize="w"] {
      top: 30px !important;
      bottom: 30px !important;
      width: 22px !important;
    }

    #${CONTROLS_ID} [data-resize="e"] { right: -11px !important; }
    #${CONTROLS_ID} [data-resize="w"] { left: -11px !important; }

    #${CONTROLS_ID} [data-resize="ne"],
    #${CONTROLS_ID} [data-resize="nw"],
    #${CONTROLS_ID} [data-resize="se"],
    #${CONTROLS_ID} [data-resize="sw"] {
      width: 30px !important;
      height: 30px !important;
    }

    #${CONTROLS_ID} [data-resize="ne"] { top: -14px !important; right: -14px !important; }
    #${CONTROLS_ID} [data-resize="nw"] { top: -14px !important; left: -14px !important; }
    #${CONTROLS_ID} [data-resize="se"] { bottom: -14px !important; right: -14px !important; }
    #${CONTROLS_ID} [data-resize="sw"] { bottom: -14px !important; left: -14px !important; }

    #${CONTROLS_ID} .tt-manual-resize {
      opacity: .26 !important;
      z-index: 2147483647 !important;
    }

    #${CONTROLS_ID} .tt-manual-resize:hover {
      opacity: 1 !important;
      background: rgba(231, 137, 73, .08) !important;
    }
  `;
}

function ensureStyle(shadow) {
  let style = shadow.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = cssText();
    shadow.appendChild(style);
  }
  return style;
}

function installGestureGate(shadow) {
  const controls = shadow.getElementById(CONTROLS_ID);
  if (!(controls instanceof HTMLElement) || controls.dataset.gestureGateV572 === 'true') return false;

  const begin = (event) => {
    event.stopPropagation();
    document.documentElement.dataset.gannzillaTimeTrackerGestureV572 = 'true';
  };
  const end = () => {
    delete document.documentElement.dataset.gannzillaTimeTrackerGestureV572;
  };

  controls.addEventListener('pointerdown', begin, { capture: true, passive: false });
  window.addEventListener('pointerup', end, true);
  window.addEventListener('pointercancel', end, true);
  window.addEventListener('blur', end, false);
  controls.dataset.gestureGateV572 = 'true';
  return true;
}

function bindTitleDrag(shadow) {
  const title = shadow.querySelector('.tasi-luxury-title-v549');
  const controls = shadow.getElementById(CONTROLS_ID);
  const dragButton = controls?.querySelector('.tt-manual-drag');
  if (!(title instanceof HTMLElement)
      || !(dragButton instanceof HTMLElement)
      || title.dataset.dragBoundV572 === 'true') return false;

  title.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    document.documentElement.dataset.gannzillaTimeTrackerGestureV572 = 'true';
    const forwarded = new PointerEvent('pointerdown', {
      bubbles: true,
      composed: true,
      cancelable: true,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      isPrimary: event.isPrimary,
      button: event.button,
      buttons: event.buttons || 1,
      clientX: event.clientX,
      clientY: event.clientY,
      screenX: event.screenX,
      screenY: event.screenY,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
    });
    dragButton.dispatchEvent(forwarded);
  }, { capture: true, passive: false });

  title.dataset.dragBoundV572 = 'true';
  return true;
}

function resetBrokenStoredStateOnce() {
  try {
    if (window.localStorage.getItem(RESET_ONCE_KEY) === 'true') return false;
    const api = window[MANUAL_API_KEY];
    if (!api || typeof api.reset !== 'function' || !api.baseState) return false;
    api.reset();
    window.localStorage.setItem(RESET_ONCE_KEY, 'true');
    return true;
  } catch (_) {
    return false;
  }
}

let applyCount = 0;
let lastApply = null;
let timer = 0;
let observer = null;

function apply(source = 'apply') {
  if (!enabled()) return false;
  const host = document.getElementById(HOST_ID);
  const shadow = host?.shadowRoot;
  if (!(host instanceof HTMLElement) || !(shadow instanceof ShadowRoot)) return false;

  const style = ensureStyle(shadow);
  const wheelPatched = patchWheelAuthority();
  const gestureGate = installGestureGate(shadow);
  const titleBound = bindTitleDrag(shadow);
  const resetApplied = resetBrokenStoredStateOnce();
  const controls = shadow.getElementById(CONTROLS_ID);
  const handles = controls?.querySelectorAll('[data-resize]').length || 0;

  host.dataset.gannzillaTasiTimeTrackerInteractionFixV572 = 'true';
  host.dataset.gannzillaTasiTimeTrackerWheelIsolationV572 = String(wheelPatched);
  host.dataset.gannzillaTasiTimeTrackerTitleDragV572 = String(
    titleBound || shadow.querySelector('.tasi-luxury-title-v549')?.dataset.dragBoundV572 === 'true',
  );
  host.dataset.gannzillaTasiTimeTrackerResizeHandleCountV572 = String(handles);
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV572 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    wheelPatched,
    gestureGate,
    titleBound,
    resetApplied,
    handles,
    canvasChanged: false,
    at: Date.now(),
  };
  return style instanceof HTMLStyleElement && wheelPatched && handles === 8;
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => requestAnimationFrame(() => apply(source)), delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  observer = new MutationObserver(() => schedule('dom-mutation', 10));
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', () => schedule('resize', 0), false);

  [0, 80, 220, 600, 1400, 3200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });

  window.GANNZILLA_TASI_TIME_TRACKER_INTERACTION_FIX_V572 = true;
  window.__auditGannzillaTasiTimeTrackerInteractionFixV572 = () => {
    const host = document.getElementById(HOST_ID);
    const shadow = host?.shadowRoot;
    const controls = shadow?.getElementById(CONTROLS_ID);
    return {
      ok: host instanceof HTMLElement
        && shadow instanceof ShadowRoot
        && controls instanceof HTMLElement
        && host.dataset.gannzillaTasiTimeTrackerInteractionFixV572 === 'true'
        && host.dataset.gannzillaTasiTimeTrackerWheelIsolationV572 === 'true'
        && controls.querySelectorAll('[data-resize]').length === 8,
      build: BUILD,
      applyCount,
      wheelIsolation: host?.dataset?.gannzillaTasiTimeTrackerWheelIsolationV572 === 'true',
      titleDrag: host?.dataset?.gannzillaTasiTimeTrackerTitleDragV572 === 'true',
      handles: controls?.querySelectorAll('[data-resize]').length || 0,
      canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV572 === 'true',
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, observer };
  schedule('install', 0);
}

install();
