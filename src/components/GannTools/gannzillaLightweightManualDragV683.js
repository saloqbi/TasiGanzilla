const BUILD = 683;
const STATE_KEY = '__gannzillaLightweightManualDragV683';
const STYLE_ID = 'gannzilla-lightweight-manual-drag-v683';
const PAN_STORAGE_KEY = 'gannzilla-wheel-asymmetric-open-pan-v305';
const V672_STORAGE_KEY = 'gannzilla:v672:canonical-search';

function boolValue(value, fallback = false) {
  if (value == null) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
}

function enabled() {
  try {
    const query = new URLSearchParams(window.location.search || '');
    return boolValue(query.get('gannzillaPro'), false)
      && boolValue(query.get('lightweightManualDrag'), true);
  } catch (_) {
    return false;
  }
}

function disableLegacyDragAuthority() {
  try {
    const raw = window.__gannzillaV672CanonicalSearch
      || window.sessionStorage.getItem(V672_STORAGE_KEY)
      || window.location.search
      || '';
    const query = new URLSearchParams(raw);
    query.set('mouseDragControl', 'false');
    query.set('mouseMiddleDragControl', 'false');
    query.set('lightweightManualDrag', 'true');
    query.set('lightweightManualDragBuild', String(BUILD));
    const canonical = `?${query.toString()}`;

    window.__gannzillaV672CanonicalSearch = canonical;
    window.__gannzillaV672CanonicalSearchFallback = canonical;
    window.sessionStorage.setItem(V672_STORAGE_KEY, canonical);

    const url = new URL(window.location.href);
    url.searchParams.set('mouseDragControl', 'false');
    url.searchParams.set('mouseMiddleDragControl', 'false');
    url.searchParams.set('lightweightManualDrag', 'true');
    url.searchParams.set('lightweightManualDragBuild', String(BUILD));
    window.history.replaceState(
      window.history.state,
      document.title,
      `${url.pathname}${url.search}${url.hash}`,
    );
  } catch (_) {
    // The dedicated drag handler remains available even if URL persistence is unavailable.
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
      x: Math.round(offset.x),
      y: Math.round(offset.y),
    }));
  } catch (_) {
    // Dragging remains available without storage.
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
    'canvas[data-gannzilla-lightweight-manual-drag-v683="true"]',
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

function installStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    canvas[data-gannzilla-lightweight-manual-drag-v683="true"] {
      cursor: grab !important;
      touch-action: none !important;
      user-select: none !important;
      transition: none !important;
      will-change: transform !important;
      transform-origin: center center !important;
    }
    canvas[data-gannzilla-lightweight-manual-drag-v683="true"][data-dragging="true"] {
      cursor: grabbing !important;
    }
  `;
  document.head.appendChild(style);
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window[STATE_KEY]) return;

  disableLegacyDragAuthority();
  if (!enabled()) return;
  installStyle();

  let offset = readOffset();
  let elements = null;
  let drag = null;
  let frame = 0;
  let pendingOffset = null;
  let visualFrameCount = 0;
  let completedDragCount = 0;
  let lastAction = null;

  const applyTransform = (nextOffset, canvas = elements?.canvas) => {
    if (!(canvas instanceof HTMLCanvasElement)) return false;
    const x = Math.round(Number(nextOffset.x) || 0);
    const y = Math.round(Number(nextOffset.y) || 0);
    canvas.style.setProperty('transform', `translate3d(${x}px, ${y}px, 0)`, 'important');
    canvas.dataset.gannzillaPanX = String(x);
    canvas.dataset.gannzillaPanY = String(y);
    return true;
  };

  const refresh = () => {
    const next = findElements();
    if (!next) return false;
    elements = next;
    elements.canvas.dataset.gannzillaLightweightManualDragV683 = 'true';
    elements.canvas.dataset.gannzillaPanTransformAllowed = 'true';
    offset = readOffset();
    applyTransform(offset);
    return true;
  };

  const flush = () => {
    frame = 0;
    if (!drag || !pendingOffset) return;
    offset = pendingOffset;
    pendingOffset = null;
    visualFrameCount += 1;
    applyTransform(offset, drag.canvas);
  };

  const schedule = (nextOffset) => {
    pendingOffset = nextOffset;
    if (!frame) frame = window.requestAnimationFrame(flush);
  };

  const onPointerDown = (event) => {
    if (event.button !== 0 && event.button !== 1) return;
    if (!refresh() || !eventInsideWorkspace(event, elements)) return;

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
    event.preventDefault();
    event.stopPropagation();
    lastAction = { source: 'drag-start', button: event.button, offset: { ...offset }, at: Date.now() };
  };

  const onPointerMove = (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    schedule({
      x: drag.originX + (event.clientX - drag.startX),
      y: drag.originY + (event.clientY - drag.startY),
    });
    event.preventDefault();
    event.stopPropagation();
  };

  const finishDrag = (event) => {
    if (!drag || (event?.pointerId != null && event.pointerId !== drag.pointerId)) return;
    if (frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
    if (pendingOffset) {
      offset = pendingOffset;
      pendingOffset = null;
      visualFrameCount += 1;
      applyTransform(offset, drag.canvas);
    }

    const completed = drag;
    drag = null;
    completed.canvas.dataset.dragging = 'false';
    try { completed.captureElement.releasePointerCapture?.(completed.pointerId); } catch (_) { /* optional */ }
    document.body.style.removeProperty('user-select');

    persistOffset(offset);
    completedDragCount += 1;
    const source = completed.button === 1
      ? 'mouse-middle-drag-lightweight-v683'
      : 'mouse-drag-lightweight-v683';
    window.dispatchEvent(new CustomEvent('gannzilla:page-scrollbar-pan-v305', {
      detail: { ...offset, source, build: BUILD },
    }));
    window.dispatchEvent(new CustomEvent('gannzilla:wheel-input-v459', {
      detail: { ...offset, source, build: BUILD },
    }));
    lastAction = { source, offset: { ...offset }, at: Date.now() };

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const onAuxClick = (event) => {
    if (event.button !== 1 || !elements || !eventInsideWorkspace(event, elements)) return;
    event.preventDefault();
    event.stopPropagation();
  };

  refresh();
  [40, 120, 300, 700, 1500, 3000].forEach((delay) => window.setTimeout(refresh, delay));
  window.addEventListener('pointerdown', onPointerDown, true);
  window.addEventListener('pointermove', onPointerMove, true);
  window.addEventListener('pointerup', finishDrag, true);
  window.addEventListener('pointercancel', finishDrag, true);
  window.addEventListener('blur', finishDrag);
  window.addEventListener('auxclick', onAuxClick, true);
  window.addEventListener('resize', refresh);
  window.addEventListener('gannzilla:ring-two-numbering-refresh', refresh);
  window.addEventListener('gannzilla:layout-panel-visibility-change', refresh);

  const audit = () => ({
    ok: Boolean(findElements()?.canvas)
      && window.__gannzillaV672CanonicalSearch?.includes('mouseDragControl=false'),
    build: BUILD,
    legacyMouseDragDisabled: true,
    transformOnlyDuringPointerMove: true,
    localStorageWritesDuringPointerMove: 0,
    globalEventsDuringPointerMove: 0,
    commitOnlyAtPointerEnd: true,
    visualFrameCount,
    completedDragCount,
    currentOffset: { ...offset },
    lastAction,
  });

  window.GANNZILLA_LIGHTWEIGHT_MANUAL_DRAG_V683 = true;
  window.__auditGannzillaLightweightManualDragV683 = audit;
  window[STATE_KEY] = { refresh, onPointerDown, onPointerMove, finishDrag, audit };
}

install();
