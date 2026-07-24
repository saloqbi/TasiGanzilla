const BUILD = 459;
const STATE_KEY = '__gannzillaKeyboardMouseControlV459';
const STYLE_ID = 'gannzilla-keyboard-mouse-control-v459';
const PAN_STORAGE_KEY = 'gannzilla-wheel-asymmetric-open-pan-v305';
const DEFAULT_KEY_STEP = 64;
const DEFAULT_FINE_STEP = 20;
const DEFAULT_FAST_STEP = 160;
const DEFAULT_WHEEL_GAIN = 1.75;
const DEFAULT_MIN_WHEEL_STEP = 24;
const DEFAULT_MAX_WHEEL_STEP = 420;

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
    // The unified movement authority remains active.
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
    '[data-gannzilla-control-strip="true"]',
    '[data-gannzilla-protected-control-v453="true"]',
    '.gannzilla-chart-toolbar-v328',
    '#gannzilla-unified-wheel-tools-v453',
    '#gannzilla-panel-visibility-eye-v457',
    '#gannzilla-connection-control-v439',
    '#gannzilla-right-language-control-v438',
    '#gannzilla-pixel-perfect-reference-panel-v421',
  ].join(',')));
}

function getClassicRoot() {
  const root = document.querySelector('[data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"])');
  return root instanceof HTMLElement ? root : null;
}

function visibleWheelCanvases(scope = document) {
  return Array.from(scope.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement) || canvas.closest?.('aside')) return false;
      const style = window.getComputedStyle(canvas);
      const rect = canvas.getBoundingClientRect();
      return canvas.width > 300
        && canvas.height > 300
        && rect.width > 250
        && rect.height > 250
        && style.display !== 'none'
        && style.visibility !== 'hidden';
    })
    .map((canvas) => ({ canvas, area: canvas.width * canvas.height }))
    .sort((a, b) => b.area - a.area);
}

function findWheelElements() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-unified-wheel-tools-v453="true"]',
    'canvas[data-gannzilla-native-wheel-scrollbars-hidden-v417="true"]',
    'canvas[data-gannzilla-keyboard-mouse-control-v459="true"]',
  ].join(','));

  const root = getClassicRoot();
  const canvas = preferred instanceof HTMLCanvasElement && !preferred.closest?.('aside')
    ? preferred
    : (root ? visibleWheelCanvases(root)[0]?.canvas : null)
      || visibleWheelCanvases(document)[0]?.canvas
      || null;

  if (!(canvas instanceof HTMLCanvasElement)) return null;

  const stage = canvas.parentElement instanceof HTMLElement ? canvas.parentElement : null;
  let viewport = null;

  if (root && stage) {
    let candidate = stage;
    while (candidate.parentElement && candidate.parentElement !== root) {
      candidate = candidate.parentElement;
    }
    if (candidate instanceof HTMLElement && candidate !== root) viewport = candidate;
  }

  if (!(viewport instanceof HTMLElement)) {
    let candidate = stage?.parentElement || stage;
    while (candidate && candidate !== document.body) {
      const style = window.getComputedStyle(candidate);
      const rect = candidate.getBoundingClientRect();
      const positioned = style.position === 'absolute' || style.position === 'fixed';
      const clipped = /(auto|scroll|hidden)/.test(`${style.overflow} ${style.overflowX} ${style.overflowY}`);
      if ((positioned || clipped) && rect.width > 280 && rect.height > 180 && candidate.contains(canvas)) {
        viewport = candidate;
        break;
      }
      candidate = candidate.parentElement;
    }
  }

  if (!(viewport instanceof HTMLElement)) {
    viewport = stage?.parentElement instanceof HTMLElement
      ? stage.parentElement
      : canvas;
  }

  return { root, viewport, stage, canvas };
}

function pointInside(event, element) {
  if (!(element instanceof HTMLElement)) return false;
  const rect = element.getBoundingClientRect();
  return event.clientX >= rect.left
    && event.clientX <= rect.right
    && event.clientY >= rect.top
    && event.clientY <= rect.bottom;
}

function eventInsideWorkspace(event, elements) {
  if (!elements || isPanelOrUiTarget(event.target)) return false;
  const target = event.target;
  if (target instanceof Node && elements.viewport.contains(target)) return true;
  return pointInside(event, elements.viewport) || pointInside(event, elements.canvas);
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
    canvas[data-gannzilla-keyboard-mouse-control-v459="true"],
    [data-gannzilla-wheel-workspace-v459="true"] {
      cursor: grab !important;
      touch-action: none !important;
      overscroll-behavior: none !important;
      user-select: none !important;
    }

    canvas[data-gannzilla-input-dragging-v459="true"],
    [data-gannzilla-wheel-workspace-v459="true"][data-gannzilla-input-dragging-v459="true"] {
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
  let markedCanvas = null;
  let markedViewport = null;
  let drag = null;
  let dragFrame = 0;
  let pendingDragOffset = null;
  let wheelFrame = 0;
  let pendingWheelX = 0;
  let pendingWheelY = 0;
  let pendingWheelSource = 'mouse-wheel';
  let keyboardMoveCount = 0;
  let mouseWheelMoveCount = 0;
  let mouseDragMoveCount = 0;
  let middleDragMoveCount = 0;
  let lastAction = null;

  const markElements = () => {
    const elements = findWheelElements();
    if (!elements) return null;

    if (markedCanvas && markedCanvas !== elements.canvas) {
      delete markedCanvas.dataset.gannzillaKeyboardMouseControlV459;
      delete markedCanvas.dataset.gannzillaInputDraggingV459;
    }
    if (markedViewport && markedViewport !== elements.viewport) {
      delete markedViewport.dataset.gannzillaWheelWorkspaceV459;
      delete markedViewport.dataset.gannzillaInputDraggingV459;
    }

    elements.canvas.dataset.gannzillaKeyboardMouseControlV459 = 'true';
    elements.viewport.dataset.gannzillaWheelWorkspaceV459 = 'true';
    markedCanvas = elements.canvas;
    markedViewport = elements.viewport;
    return elements;
  };

  const applyFallbackTransform = (nextOffset, elements = markElements()) => {
    const canvas = elements?.canvas;
    if (!(canvas instanceof HTMLCanvasElement)) return false;
    canvas.style.setProperty(
      'transform',
      `translate3d(${Math.round(nextOffset.x)}px, ${Math.round(nextOffset.y)}px, 0)`,
      'important',
    );
    canvas.style.setProperty('transform-origin', 'center center', 'important');
    canvas.style.setProperty('will-change', 'transform', 'important');
    canvas.dataset.gannzillaPanX = String(Math.round(nextOffset.x));
    canvas.dataset.gannzillaPanY = String(Math.round(nextOffset.y));
    return true;
  };

  const commit = (nextOffset, source) => {
    offset = {
      x: Number.isFinite(Number(nextOffset?.x)) ? Number(nextOffset.x) : 0,
      y: Number.isFinite(Number(nextOffset?.y)) ? Number(nextOffset.y) : 0,
    };
    persistOffset(offset);

    const elements = markElements();
    applyFallbackTransform(offset, elements);

    window.dispatchEvent(new CustomEvent('gannzilla:page-scrollbar-pan-v305', {
      detail: { ...offset, source, build: BUILD },
    }));
    window.dispatchEvent(new CustomEvent('gannzilla:wheel-input-v459', {
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
    if (!markElements()) return;

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

  const flushWheel = () => {
    wheelFrame = 0;
    const moveX = pendingWheelX;
    const moveY = pendingWheelY;
    pendingWheelX = 0;
    pendingWheelY = 0;
    if (Math.abs(moveX) < 0.01 && Math.abs(moveY) < 0.01) return;
    mouseWheelMoveCount += 1;
    commit({ x: offset.x + moveX, y: offset.y + moveY }, pendingWheelSource);
  };

  const scheduleWheel = (moveX, moveY, source) => {
    pendingWheelX += moveX;
    pendingWheelY += moveY;
    pendingWheelSource = source;
    if (wheelFrame) return;
    wheelFrame = window.requestAnimationFrame(flushWheel);
  };

  const onWheel = (event) => {
    if (!boolParam('mouseWheelControl', true)) return;
    if (event.ctrlKey || event.metaKey) return;

    const elements = markElements();
    if (!eventInsideWorkspace(event, elements)) return;

    const delta = normalizeWheelDelta(event);
    if (Math.abs(delta.x) < 0.01 && Math.abs(delta.y) < 0.01) return;

    const gain = numberParam('mouseWheelPanSpeed', DEFAULT_WHEEL_GAIN, 0.10, 6);
    const minStep = numberParam('mouseWheelMinStep', DEFAULT_MIN_WHEEL_STEP, 0, 120);
    const maxStep = numberParam('mouseWheelMaxStep', DEFAULT_MAX_WHEEL_STEP, 20, 1000);
    const natural = boolParam('mouseWheelNaturalDirection', true) ? -1 : 1;
    const scaleDelta = (value) => {
      if (Math.abs(value) < 0.01) return 0;
      const scaled = value * gain;
      const boosted = Math.abs(scaled) < minStep ? Math.sign(scaled) * minStep : scaled;
      return Math.max(-maxStep, Math.min(maxStep, boosted));
    };

    let moveX;
    let moveY;
    if (event.shiftKey && Math.abs(delta.x) < Math.abs(delta.y)) {
      moveX = natural * scaleDelta(delta.y);
      moveY = 0;
    } else {
      moveX = natural * scaleDelta(delta.x);
      moveY = natural * scaleDelta(delta.y);
    }

    event.preventDefault();
    event.stopPropagation();
    scheduleWheel(
      moveX,
      moveY,
      event.shiftKey ? 'mouse-wheel-horizontal' : 'mouse-wheel',
    );
  };

  const flushDrag = () => {
    dragFrame = 0;
    if (!pendingDragOffset) return;
    const next = pendingDragOffset;
    pendingDragOffset = null;
    if (drag?.button === 1) middleDragMoveCount += 1;
    else mouseDragMoveCount += 1;
    commit(next, drag?.button === 1 ? 'mouse-middle-drag' : 'mouse-drag');
  };

  const scheduleDrag = (nextOffset) => {
    pendingDragOffset = nextOffset;
    if (dragFrame) return;
    dragFrame = window.requestAnimationFrame(flushDrag);
  };

  const onPointerDown = (event) => {
    const leftEnabled = boolParam('mouseDragControl', true) && event.button === 0;
    const middleEnabled = boolParam('mouseMiddleDragControl', true) && event.button === 1;
    if (!leftEnabled && !middleEnabled) return;

    const elements = markElements();
    if (!eventInsideWorkspace(event, elements)) return;

    drag = {
      pointerId: event.pointerId,
      button: event.button,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
      canvas: elements.canvas,
      viewport: elements.viewport,
      captureElement: elements.viewport,
    };

    elements.canvas.dataset.gannzillaInputDraggingV459 = 'true';
    elements.viewport.dataset.gannzillaInputDraggingV459 = 'true';
    try { elements.viewport.setPointerCapture?.(event.pointerId); } catch (_) { /* capture is optional */ }
    document.body.style.setProperty('user-select', 'none', 'important');
    event.preventDefault();
    event.stopPropagation();
    lastAction = {
      source: event.button === 1 ? 'mouse-middle-drag-start' : 'mouse-drag-start',
      offset: { ...offset },
      at: Date.now(),
    };
  };

  const onPointerMove = (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
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

    try { drag.captureElement?.releasePointerCapture?.(drag.pointerId); } catch (_) { /* release is optional */ }
    if (drag.canvas) delete drag.canvas.dataset.gannzillaInputDraggingV459;
    if (drag.viewport) delete drag.viewport.dataset.gannzillaInputDraggingV459;
    document.body.style.removeProperty('user-select');
    const source = drag.button === 1 ? 'mouse-middle-drag-end' : 'mouse-drag-end';
    drag = null;

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    lastAction = { source, offset: { ...offset }, at: Date.now() };
  };

  const onAuxClick = (event) => {
    if (event.button !== 1) return;
    const elements = markElements();
    if (!eventInsideWorkspace(event, elements)) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const refresh = () => {
    markElements();
    offset = readStoredOffset();
  };

  refresh();
  [40, 120, 300, 700, 1500, 3000].forEach((delay) => window.setTimeout(refresh, delay));

  window.addEventListener('gannzilla:wheel-pan-offset-v305', syncOffset);
  window.addEventListener('gannzilla:page-scrollbar-pan-v305', syncOffset);
  window.addEventListener('keydown', onKeyDown, true);
  window.addEventListener('wheel', onWheel, { capture: true, passive: false });
  window.addEventListener('pointerdown', onPointerDown, true);
  window.addEventListener('pointermove', onPointerMove, true);
  window.addEventListener('pointerup', finishDrag, true);
  window.addEventListener('pointercancel', finishDrag, true);
  window.addEventListener('auxclick', onAuxClick, true);
  window.addEventListener('blur', finishDrag);
  window.addEventListener('resize', refresh);
  window.addEventListener('gannzilla:ring-two-numbering-refresh', refresh);
  window.addEventListener('gannzilla:layout-panel-visibility-change', refresh);

  window.GANNZILLA_KEYBOARD_MOUSE_CONTROL_V459 = true;
  window.__auditGannzillaKeyboardMouseControlV459 = () => {
    const elements = findWheelElements();
    return {
      ok: Boolean(elements?.canvas && elements?.viewport),
      build: BUILD,
      keyboardArrowControl: boolParam('keyboardArrowControl', true),
      mouseWheelControl: boolParam('mouseWheelControl', true),
      mouseDragControl: boolParam('mouseDragControl', true),
      mouseMiddleDragControl: boolParam('mouseMiddleDragControl', true),
      wheelWorksAcrossWorkspace: true,
      leftDragWorksAcrossWorkspace: true,
      middleButtonDragEnabled: true,
      mouseWheelPanSpeed: numberParam('mouseWheelPanSpeed', DEFAULT_WHEEL_GAIN, 0.10, 6),
      mouseWheelMinStep: numberParam('mouseWheelMinStep', DEFAULT_MIN_WHEEL_STEP, 0, 120),
      mouseWheelMaxStep: numberParam('mouseWheelMaxStep', DEFAULT_MAX_WHEEL_STEP, 20, 1000),
      keyboardMoveCount,
      mouseWheelMoveCount,
      mouseDragMoveCount,
      middleDragMoveCount,
      currentOffset: { ...offset },
      lastAction,
      noDocumentWideMutationObserver: true,
    };
  };

  window[STATE_KEY] = {
    onWheel,
    onPointerDown,
    onPointerMove,
    finishDrag,
    onAuxClick,
  };
}

install();
