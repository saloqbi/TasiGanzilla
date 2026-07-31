const BUILD = 684;
const STATE_KEY = '__gannzillaUnifiedLightPanV684';
const STYLE_ID = 'gannzilla-unified-light-pan-v684';
const PAN_STORAGE_KEY = 'gannzilla-wheel-asymmetric-open-pan-v305';
const V672_STORAGE_KEY = 'gannzilla:v672:canonical-search';
const WHEEL_COMMIT_DELAY_MS = 90;
const DEFAULT_WHEEL_GAIN = 1.15;
const DEFAULT_WHEEL_MAX_STEP = 260;

function boolValue(value, fallback = false) {
  if (value == null) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
}

function canonicalParams() {
  try {
    const raw = window.__gannzillaV672CanonicalSearch
      || window.sessionStorage.getItem(V672_STORAGE_KEY)
      || window.location.search
      || '';
    return new URLSearchParams(raw);
  } catch (_) {
    return new URLSearchParams();
  }
}

function numberParam(name, fallback, min, max) {
  const value = Number(canonicalParams().get(name));
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

function enabled() {
  const query = canonicalParams();
  return boolValue(query.get('gannzillaPro'), false)
    && boolValue(query.get('unifiedLightPan'), true);
}

function disableLegacyMovementAuthorities() {
  try {
    const query = canonicalParams();
    query.set('mouseDragControl', 'false');
    query.set('mouseMiddleDragControl', 'false');
    query.set('mouseWheelControl', 'false');
    query.set('cleanDragView', 'false');
    query.set('draggableWheel', 'false');
    query.set('unifiedLightPan', 'true');
    query.set('unifiedLightPanBuild', String(BUILD));
    const canonical = `?${query.toString()}`;

    window.__gannzillaV672CanonicalSearch = canonical;
    window.__gannzillaV672CanonicalSearchFallback = canonical;
    window.sessionStorage.setItem(V672_STORAGE_KEY, canonical);

    const url = new URL(window.location.href);
    url.searchParams.set('mouseDragControl', 'false');
    url.searchParams.set('mouseMiddleDragControl', 'false');
    url.searchParams.set('mouseWheelControl', 'false');
    url.searchParams.set('cleanDragView', 'false');
    url.searchParams.set('draggableWheel', 'false');
    url.searchParams.set('unifiedLightPan', 'true');
    url.searchParams.set('unifiedLightPanBuild', String(BUILD));
    window.history.replaceState(
      window.history.state,
      document.title,
      `${url.pathname}${url.search}${url.hash}`,
    );
  } catch (_) {
    // The dedicated movement authority still runs if URL persistence is unavailable.
  }
}

function readOffset() {
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
    // Movement remains available without storage.
  }
}

function isUiTarget(target) {
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

function visibleCanvases() {
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement) || canvas.closest('aside')) return false;
      const rect = canvas.getBoundingClientRect();
      const style = window.getComputedStyle(canvas);
      return canvas.width > 300
        && canvas.height > 300
        && rect.width > 250
        && rect.height > 250
        && style.display !== 'none'
        && style.visibility !== 'hidden';
    })
    .sort((a, b) => (b.width * b.height) - (a.width * a.height));
}

function findElements() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-final-wheel-authority-v506="true"]',
    'canvas[data-gannzilla-unified-wheel-tools-v453="true"]',
    'canvas[data-gannzilla-native-wheel-scrollbars-hidden-v417="true"]',
    'canvas[data-gannzilla-unified-light-pan-v684="true"]',
  ].join(','));
  const canvas = preferred instanceof HTMLCanvasElement && !preferred.closest('aside')
    ? preferred
    : visibleCanvases()[0] || null;
  if (!(canvas instanceof HTMLCanvasElement)) return null;

  const viewport = canvas.parentElement?.parentElement instanceof HTMLElement
    ? canvas.parentElement.parentElement
    : canvas.parentElement instanceof HTMLElement
      ? canvas.parentElement
      : canvas;
  return { canvas, viewport };
}

function pointInside(event, element) {
  const rect = element.getBoundingClientRect();
  return event.clientX >= rect.left
    && event.clientX <= rect.right
    && event.clientY >= rect.top
    && event.clientY <= rect.bottom;
}

function eventInsideWorkspace(event, elements) {
  if (!elements || isUiTarget(event.target)) return false;
  if (event.target instanceof Node && elements.viewport.contains(event.target)) return true;
  return pointInside(event, elements.viewport) || pointInside(event, elements.canvas);
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

function stopMovementEvent(event) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
}

function installStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    canvas[data-gannzilla-unified-light-pan-v684="true"] {
      cursor: grab !important;
      touch-action: none !important;
      overscroll-behavior: none !important;
      user-select: none !important;
      transition: none !important;
      will-change: transform !important;
      transform-origin: center center !important;
      backface-visibility: hidden !important;
      -webkit-backface-visibility: hidden !important;
    }
    canvas[data-gannzilla-unified-light-pan-v684="true"][data-dragging="true"] {
      cursor: grabbing !important;
    }
  `;
  document.head.appendChild(style);
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window[STATE_KEY]) return;

  disableLegacyMovementAuthorities();
  if (!enabled()) return;
  installStyle();

  let offset = readOffset();
  let elements = null;
  let markedCanvas = null;
  let drag = null;
  let frame = 0;
  let pendingOffset = null;
  let pendingSource = null;
  let wheelCommitTimer = 0;
  let visualFrameCount = 0;
  let completedDragCount = 0;
  let completedWheelBurstCount = 0;
  let lastAction = null;

  const applyVisualTransform = (nextOffset, canvas = elements?.canvas) => {
    if (!(canvas instanceof HTMLCanvasElement)) return false;
    const x = Number.isFinite(Number(nextOffset?.x)) ? Number(nextOffset.x) : 0;
    const y = Number.isFinite(Number(nextOffset?.y)) ? Number(nextOffset.y) : 0;
    canvas.style.setProperty(
      'transform',
      `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`,
      'important',
    );
    return true;
  };

  const markCommittedOffset = (canvas = elements?.canvas) => {
    if (!(canvas instanceof HTMLCanvasElement)) return;
    canvas.dataset.gannzillaPanX = String(Math.round(offset.x));
    canvas.dataset.gannzillaPanY = String(Math.round(offset.y));
  };

  const refresh = (readStored = false) => {
    const next = findElements();
    if (!next) return false;
    if (markedCanvas && markedCanvas !== next.canvas) {
      delete markedCanvas.dataset.gannzillaUnifiedLightPanV684;
      delete markedCanvas.dataset.dragging;
    }
    elements = next;
    markedCanvas = next.canvas;
    elements.canvas.dataset.gannzillaUnifiedLightPanV684 = 'true';
    elements.canvas.dataset.gannzillaPanTransformAllowed = 'true';
    if (readStored && !drag && !pendingOffset && !wheelCommitTimer) offset = readOffset();
    applyVisualTransform(offset);
    markCommittedOffset();
    return true;
  };

  const flushVisual = () => {
    frame = 0;
    if (!pendingOffset) return;
    offset = pendingOffset;
    pendingOffset = null;
    visualFrameCount += 1;
    applyVisualTransform(offset, drag?.canvas || elements?.canvas);
  };

  const flushVisualNow = () => {
    if (frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
    flushVisual();
  };

  const scheduleVisual = (nextOffset, source) => {
    pendingOffset = nextOffset;
    pendingSource = source;
    if (!frame) frame = window.requestAnimationFrame(flushVisual);
  };

  const commit = (source = pendingSource || 'pan-commit') => {
    flushVisualNow();
    persistOffset(offset);
    markCommittedOffset();
    window.dispatchEvent(new CustomEvent('gannzilla:page-scrollbar-pan-v305', {
      detail: { ...offset, source, build: BUILD },
    }));
    window.dispatchEvent(new CustomEvent('gannzilla:wheel-input-v459', {
      detail: { ...offset, source, build: BUILD },
    }));
    lastAction = { source, offset: { ...offset }, at: Date.now() };
    pendingSource = null;
  };

  const finishWheelBurst = () => {
    wheelCommitTimer = 0;
    completedWheelBurstCount += 1;
    commit(pendingSource || 'mouse-wheel-light-v684');
  };

  const scheduleWheelCommit = () => {
    if (wheelCommitTimer) window.clearTimeout(wheelCommitTimer);
    wheelCommitTimer = window.setTimeout(finishWheelBurst, WHEEL_COMMIT_DELAY_MS);
  };

  const onPointerDown = (event) => {
    if (event.button !== 0 && event.button !== 1) return;
    if (!elements && !refresh(false)) return;
    if (!eventInsideWorkspace(event, elements)) return;

    if (wheelCommitTimer) {
      window.clearTimeout(wheelCommitTimer);
      wheelCommitTimer = 0;
      commit('wheel-before-drag-v684');
    } else {
      flushVisualNow();
    }

    drag = {
      pointerId: event.pointerId,
      button: event.button,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
      canvas: elements.canvas,
      captureElement: elements.viewport,
    };
    drag.canvas.dataset.dragging = 'true';
    try { drag.captureElement.setPointerCapture?.(event.pointerId); } catch (_) { /* optional */ }
    document.body.style.setProperty('user-select', 'none', 'important');
    lastAction = { source: 'drag-start-v684', button: event.button, offset: { ...offset }, at: Date.now() };
    stopMovementEvent(event);
  };

  const onPointerMove = (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const coalesced = typeof event.getCoalescedEvents === 'function'
      ? event.getCoalescedEvents()
      : null;
    const latest = coalesced?.length ? coalesced[coalesced.length - 1] : event;
    scheduleVisual({
      x: drag.originX + (latest.clientX - drag.startX),
      y: drag.originY + (latest.clientY - drag.startY),
    }, drag.button === 1 ? 'mouse-middle-drag-light-v684' : 'mouse-drag-light-v684');
    stopMovementEvent(event);
  };

  const finishDrag = (event) => {
    if (!drag || (event?.pointerId != null && event.pointerId !== drag.pointerId)) return;
    flushVisualNow();
    const completed = drag;
    drag = null;
    completed.canvas.dataset.dragging = 'false';
    try { completed.captureElement.releasePointerCapture?.(completed.pointerId); } catch (_) { /* optional */ }
    document.body.style.removeProperty('user-select');
    completedDragCount += 1;
    commit(completed.button === 1
      ? 'mouse-middle-drag-light-v684'
      : 'mouse-drag-light-v684');
    if (event) stopMovementEvent(event);
  };

  const onWheel = (event) => {
    if (event.ctrlKey || event.metaKey || drag) return;
    if (!elements && !refresh(false)) return;
    if (!eventInsideWorkspace(event, elements)) return;

    const delta = normalizeWheelDelta(event);
    if (Math.abs(delta.x) < 0.01 && Math.abs(delta.y) < 0.01) return;

    const query = canonicalParams();
    const natural = boolValue(query.get('mouseWheelNaturalDirection'), true) ? -1 : 1;
    const gain = numberParam('lightweightWheelGain', DEFAULT_WHEEL_GAIN, 0.10, 4);
    const maxStep = numberParam('lightweightWheelMaxStep', DEFAULT_WHEEL_MAX_STEP, 20, 800);
    const clamp = (value) => Math.max(-maxStep, Math.min(maxStep, value * gain));

    let moveX;
    let moveY;
    if (event.shiftKey && Math.abs(delta.x) < Math.abs(delta.y)) {
      moveX = natural * clamp(delta.y);
      moveY = 0;
    } else {
      moveX = natural * clamp(delta.x);
      moveY = natural * clamp(delta.y);
    }

    const base = pendingOffset || offset;
    scheduleVisual({ x: base.x + moveX, y: base.y + moveY },
      event.shiftKey ? 'mouse-wheel-horizontal-light-v684' : 'mouse-wheel-light-v684');
    scheduleWheelCommit();
    stopMovementEvent(event);
  };

  const onAuxClick = (event) => {
    if (event.button !== 1 || !elements || !eventInsideWorkspace(event, elements)) return;
    stopMovementEvent(event);
  };

  const syncExternalOffset = (event) => {
    const detail = event?.detail || {};
    if (Number(detail.build) === BUILD || drag || wheelCommitTimer || pendingOffset) return;
    if (!Number.isFinite(Number(detail.x)) || !Number.isFinite(Number(detail.y))) return;
    offset = { x: Number(detail.x), y: Number(detail.y) };
    applyVisualTransform(offset);
    markCommittedOffset();
  };

  refresh(true);
  [40, 120, 300, 700, 1500, 3000].forEach((delay) => {
    window.setTimeout(() => refresh(false), delay);
  });

  window.addEventListener('pointerdown', onPointerDown, true);
  window.addEventListener('pointermove', onPointerMove, true);
  window.addEventListener('pointerup', finishDrag, true);
  window.addEventListener('pointercancel', finishDrag, true);
  window.addEventListener('wheel', onWheel, { capture: true, passive: false });
  window.addEventListener('blur', () => {
    finishDrag();
    if (wheelCommitTimer) {
      window.clearTimeout(wheelCommitTimer);
      wheelCommitTimer = 0;
      finishWheelBurst();
    }
  });
  window.addEventListener('auxclick', onAuxClick, true);
  window.addEventListener('resize', () => refresh(false));
  window.addEventListener('gannzilla:ring-two-numbering-refresh', () => refresh(false));
  window.addEventListener('gannzilla:layout-panel-visibility-change', () => refresh(false));
  window.addEventListener('gannzilla:wheel-pan-offset-v305', syncExternalOffset);
  window.addEventListener('gannzilla:page-scrollbar-pan-v305', syncExternalOffset);

  const audit = () => {
    const canonical = window.__gannzillaV672CanonicalSearch || '';
    return {
      ok: Boolean(findElements()?.canvas)
        && canonical.includes('mouseDragControl=false')
        && canonical.includes('mouseWheelControl=false'),
      build: BUILD,
      singleMovementAuthority: true,
      legacyMouseDragDisabled: true,
      legacyMouseWheelDisabled: true,
      stopImmediatePropagationDuringMovement: true,
      transformOnlyDuringActiveMovement: true,
      dataAttributeWritesDuringActiveMovement: 0,
      localStorageWritesDuringActiveMovement: 0,
      globalEventsDuringActiveMovement: 0,
      commitAfterDragEnd: true,
      commitAfterWheelIdleMs: WHEEL_COMMIT_DELAY_MS,
      visualFrameCount,
      completedDragCount,
      completedWheelBurstCount,
      currentOffset: { ...offset },
      lastAction,
    };
  };

  window.GANNZILLA_UNIFIED_LIGHT_PAN_V684 = true;
  window.__auditGannzillaUnifiedLightPanV684 = audit;
  window[STATE_KEY] = {
    refresh,
    onPointerDown,
    onPointerMove,
    finishDrag,
    onWheel,
    audit,
  };
}

install();
