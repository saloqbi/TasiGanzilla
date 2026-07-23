const BUILD = 413;
const STATE_KEY = '__gannzillaKeyboardMouseControlV413';
const STYLE_ID = 'gannzilla-keyboard-mouse-control-v413';
const PAN_STORAGE_KEY = 'gannzilla-wheel-asymmetric-open-pan-v305';
const DEFAULT_KEY_STEP = 64;
const DEFAULT_FINE_STEP = 20;
const DEFAULT_FAST_STEP = 160;
const DEFAULT_WHEEL_GAIN = 0.90;
const DEFAULT_MAX_WHEEL_STEP = 180;

function params() {
  try {
    return new URLSearchParams(window.location.search || '');
  } catch (_) {
    return new URLSearchParams();
  }
}

function boolParam(name, fallback = false) {
  const query = params();
  if (!query.has(name)) return fallback;
  const value = String(query.get(name) || '').toLowerCase();
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
}

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

function enabled() {
  return boolParam('gannzillaPro', false)
    && boolParam('keyboardMouseWheelControl', true);
}

function disableLegacyIndependentDrag() {
  try {
    const url = new URL(window.location.href);
    let changed = false;
    ['cleanDragView', 'draggableWheel'].forEach((name) => {
      if (url.searchParams.get(name) === 'true') {
        url.searchParams.set(name, 'false');
        changed = true;
      }
    });
    if (changed) {
      window.history.replaceState(
        window.history.state,
        '',
        `${url.pathname}${url.search}${url.hash}`,
      );
    }
  } catch (_) {
    // The synchronized input authority below remains active.
  }
}

function isTypingTarget(target) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest([
    'input',
    'select',
    'textarea',
    '[contenteditable="true"]',
    '[role="textbox"]',
  ].join(',')));
}

function isPanelOrUiTarget(target) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest([
    'aside',
    'input',
    'select',
    'textarea',
    'button',
    '[contenteditable="true"]',
    '[role="toolbar"]',
    '[role="menu"]',
    '.gannzilla-chart-toolbar-v328',
  ].join(',')));
}

function findMainWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => !canvas.closest?.('aside'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ canvas, rect }) => (
      canvas.width > 300
      && canvas.height > 300
      && rect.width > 250
      && rect.height > 250
      && window.getComputedStyle(canvas).display !== 'none'
      && window.getComputedStyle(canvas).visibility !== 'hidden'
    ))
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function pointIsOverCanvas(event, canvas) {
  if (!(canvas instanceof HTMLCanvasElement)) return false;
  const rect = canvas.getBoundingClientRect();
  return event.clientX >= rect.left
    && event.clientX <= rect.right
    && event.clientY >= rect.top
    && event.clientY <= rect.bottom;
}

function readStoredOffset() {
  try {
    const value = JSON.parse(window.localStorage.getItem(PAN_STORAGE_KEY) || '{}');
    return {
      x: Number.isFinite(Number(value.x)) ? Number(value.x) : 0,
      y: Number.isFinite(Number(value.y)) ? Number(value.y) : 0,
    };
  } catch (_) {
    return { x: 0, y: 0 };
  }
}

function persistOffset(offset) {
  try {
    window.localStorage.setItem(PAN_STORAGE_KEY, JSON.stringify({
      x: Math.round(Number(offset.x) || 0),
      y: Math.round(Number(offset.y) || 0),
    }));
  } catch (_) {
    // Runtime movement remains available if storage is unavailable.
  }
}

function normalizeWheelDelta(event) {
  const multiplier = event.deltaMode === 1
    ? 16
    : event.deltaMode === 2
      ? Math.max(400, window.innerHeight)
      : 1;
  return {
    x: Number(event.deltaX || 0) * multiplier,
    y: Number(event.deltaY || 0) * multiplier,
  };
}

function installStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    canvas[data-gannzilla-keyboard-mouse-control-v413="true"] {
      cursor: grab !important;
      touch-action: none !important;
      user-select: none !important;
      will-change: transform !important;
    }

    canvas[data-gannzilla-keyboard-mouse-control-v413="true"][data-gannzilla-input-dragging-v413="true"] {
      cursor: grabbing !important;
    }
  `;
  document.head.appendChild(style);
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !enabled()) return;
  if (window[STATE_KEY]) return;

  disableLegacyIndependentDrag();
  installStyle();

  let offset = readStoredOffset();
  let drag = null;
  let dragFrame = 0;
  let pendingDragOffset = null;
  let markedCanvas = null;
  let lastAction = null;
  let keyboardMoveCount = 0;
  let mouseWheelMoveCount = 0;
  let mouseDragMoveCount = 0;

  const markCanvas = () => {
    const canvas = findMainWheelCanvas();
    if (!(canvas instanceof HTMLCanvasElement)) return null;
    canvas.dataset.gannzillaKeyboardMouseControlV413 = 'true';
    markedCanvas = canvas;
    return canvas;
  };

  const applyFallbackTransform = (nextOffset) => {
    const canvas = markCanvas();
    if (!(canvas instanceof HTMLCanvasElement)) return;
    canvas.style.setProperty(
      'transform',
      `translate3d(${Math.round(nextOffset.x)}px, ${Math.round(nextOffset.y)}px, 0)`,
      'important',
    );
  };

  const commit = (nextOffset, source) => {
    offset = {
      x: Number.isFinite(Number(nextOffset?.x)) ? Number(nextOffset.x) : 0,
      y: Number.isFinite(Number(nextOffset?.y)) ? Number(nextOffset.y) : 0,
    };
    persistOffset(offset);
    applyFallbackTransform(offset);
    window.dispatchEvent(new CustomEvent('gannzilla:page-scrollbar-pan-v305', {
      detail: { ...offset, source, build: BUILD },
    }));
    lastAction = { source, offset: { ...offset }, at: Date.now() };
  };

  const syncOffset = (event) => {
    const detail = event?.detail || {};
    if (!Number.isFinite(Number(detail.x)) || !Number.isFinite(Number(detail.y))) return;
    offset = { x: Number(detail.x), y: Number(detail.y) };
    persistOffset(offset);
  };

  const keyStep = (event) => {
    if (event.altKey) return numberParam('keyboardFinePanStep', DEFAULT_FINE_STEP, 2, 80);
    if (event.shiftKey) return numberParam('keyboardFastPanStep', DEFAULT_FAST_STEP, 40, 400);
    return numberParam('keyboardPanStep', DEFAULT_KEY_STEP, 8, 240);
  };

  const onKeyDown = (event) => {
    if (!boolParam('keyboardArrowControl', true)) return;
    if (event.defaultPrevented || isTypingTarget(event.target)) return;
    if (event.ctrlKey || event.metaKey) return;
    if (!markCanvas()) return;

    const step = keyStep(event);
    const delta = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    }[event.key];

    if (!delta) return;
    event.preventDefault();
    event.stopPropagation();
    keyboardMoveCount += 1;
    commit({ x: offset.x + delta.x, y: offset.y + delta.y }, `keyboard:${event.key}`);
  };

  const onWheel = (event) => {
    if (!boolParam('mouseWheelControl', true)) return;
    if (event.ctrlKey || event.metaKey || isPanelOrUiTarget(event.target)) return;

    const canvas = markCanvas();
    if (!canvas || !pointIsOverCanvas(event, canvas)) return;

    const delta = normalizeWheelDelta(event);
    if (Math.abs(delta.x) < 0.01 && Math.abs(delta.y) < 0.01) return;

    const gain = numberParam('mouseWheelPanSpeed', DEFAULT_WHEEL_GAIN, 0.10, 4);
    const maxStep = numberParam('mouseWheelMaxStep', DEFAULT_MAX_WHEEL_STEP, 20, 600);
    const clampDelta = (value) => Math.max(-maxStep, Math.min(maxStep, value * gain));

    let moveX;
    let moveY;
    if (event.shiftKey && Math.abs(delta.x) < Math.abs(delta.y)) {
      moveX = -clampDelta(delta.y);
      moveY = 0;
    } else {
      moveX = -clampDelta(delta.x);
      moveY = -clampDelta(delta.y);
    }

    event.preventDefault();
    event.stopPropagation();
    mouseWheelMoveCount += 1;
    commit(
      { x: offset.x + moveX, y: offset.y + moveY },
      event.shiftKey ? 'mouse-wheel-horizontal' : 'mouse-wheel',
    );
  };

  const flushDrag = () => {
    dragFrame = 0;
    if (!pendingDragOffset) return;
    const next = pendingDragOffset;
    pendingDragOffset = null;
    mouseDragMoveCount += 1;
    commit(next, 'mouse-drag');
  };

  const scheduleDrag = (nextOffset) => {
    pendingDragOffset = nextOffset;
    if (dragFrame) return;
    dragFrame = window.requestAnimationFrame(flushDrag);
  };

  const onPointerDown = (event) => {
    if (!boolParam('mouseDragControl', true) || event.button !== 0 || isPanelOrUiTarget(event.target)) return;
    const canvas = markCanvas();
    if (!canvas || !pointIsOverCanvas(event, canvas)) return;

    drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
      canvas,
    };

    canvas.dataset.gannzillaInputDraggingV413 = 'true';
    canvas.setPointerCapture?.(event.pointerId);
    document.body.style.setProperty('user-select', 'none', 'important');
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    lastAction = { source: 'mouse-drag-start', offset: { ...offset }, at: Date.now() };
  };

  const onPointerMove = (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    scheduleDrag({
      x: drag.originX + (event.clientX - drag.startX),
      y: drag.originY + (event.clientY - drag.startY),
    });
  };

  const finishDrag = (event) => {
    if (!drag || (event?.pointerId != null && event.pointerId !== drag.pointerId)) return;
    if (dragFrame) {
      window.cancelAnimationFrame(dragFrame);
      dragFrame = 0;
      flushDrag();
    }
    drag.canvas?.releasePointerCapture?.(drag.pointerId);
    if (drag.canvas) delete drag.canvas.dataset.gannzillaInputDraggingV413;
    document.body.style.removeProperty('user-select');
    drag = null;
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
    }
    lastAction = { source: 'mouse-drag-end', offset: { ...offset }, at: Date.now() };
  };

  const refresh = () => {
    markCanvas();
    offset = readStoredOffset();
  };

  [0, 40, 120, 280, 600, 1200, 2400].forEach((delay) => window.setTimeout(refresh, delay));
  const observer = new MutationObserver(markCanvas);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('gannzilla:wheel-pan-offset-v305', syncOffset);
  window.addEventListener('keydown', onKeyDown, true);
  window.addEventListener('wheel', onWheel, { capture: true, passive: false });
  window.addEventListener('pointerdown', onPointerDown, true);
  window.addEventListener('pointermove', onPointerMove, true);
  window.addEventListener('pointerup', finishDrag, true);
  window.addEventListener('pointercancel', finishDrag, true);
  window.addEventListener('blur', finishDrag);
  window.addEventListener('resize', refresh);

  window.GANNZILLA_KEYBOARD_MOUSE_CONTROL_V413 = true;
  window.__auditGannzillaKeyboardMouseControlV413 = () => ({
    ok: Boolean(findMainWheelCanvas()),
    build: BUILD,
    keyboardArrowControl: boolParam('keyboardArrowControl', true),
    mouseWheelControl: boolParam('mouseWheelControl', true),
    mouseDragControl: boolParam('mouseDragControl', true),
    keyboardPanStep: numberParam('keyboardPanStep', DEFAULT_KEY_STEP, 8, 240),
    keyboardFinePanStep: numberParam('keyboardFinePanStep', DEFAULT_FINE_STEP, 2, 80),
    keyboardFastPanStep: numberParam('keyboardFastPanStep', DEFAULT_FAST_STEP, 40, 400),
    mouseWheelPanSpeed: numberParam('mouseWheelPanSpeed', DEFAULT_WHEEL_GAIN, 0.10, 4),
    keyboardMoveCount,
    mouseWheelMoveCount,
    mouseDragMoveCount,
    currentOffset: { ...offset },
    shiftWheelHorizontal: true,
    trackpadHorizontalEnabled: true,
    legacyIndependentDragDisabled: params().get('cleanDragView') !== 'true',
    synchronizedWithWheelPanAuthorityV305: true,
    lastAction,
  });

  window[STATE_KEY] = { observer };
}

install();
