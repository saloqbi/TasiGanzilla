const STYLE_ID = 'gannzilla-clean-drag-viewport-v392';
const STATE_KEY = '__gannzillaCleanDragViewportV392';

function boolParam(name, fallback = false) {
  try {
    const query = new URLSearchParams(window.location.search || '');
    if (!query.has(name)) return fallback;
    const value = String(query.get(name) || '').toLowerCase();
    return value === 'true' || value === '1' || value === 'yes' || value === 'on';
  } catch (_) {
    return fallback;
  }
}

function enabled() {
  return boolParam('cleanDragView', false) || boolParam('draggableWheel', false);
}

function isMainWheelCanvas(canvas) {
  if (!canvas || canvas.closest?.('aside')) return false;
  const rect = canvas.getBoundingClientRect?.();
  return Boolean(canvas.width > 0 && canvas.height > 0 && rect && rect.width > 250 && rect.height > 250);
}

function findMainWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .filter(isMainWheelCanvas)
    .sort((a, b) => {
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      return (br.width * br.height) - (ar.width * ar.height);
    })[0] || null;
}

function installStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    html, body, #root {
      overflow: hidden !important;
      overscroll-behavior: none !important;
    }

    [data-gannzilla-horizontal-pan-assist-v311="true"],
    [data-gannzilla-horizontal-pan-assist-v308="true"],
    [data-gannzilla-page-pan-scrollbars-v305="true"],
    [data-gannzilla-horizontal-pan-top-placement-v312="true"],
    .gannzilla-horizontal-pan-assist,
    .gannzilla-page-pan-scrollbars,
    .gannzilla-bottom-scrollbar,
    .gannzilla-right-scrollbar {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }

    canvas[data-gannzilla-clean-drag-v392="true"] {
      cursor: grab !important;
      touch-action: none !important;
      user-select: none !important;
      will-change: transform !important;
      transform-origin: center center !important;
    }

    canvas[data-gannzilla-clean-drag-v392="true"][data-dragging="true"] {
      cursor: grabbing !important;
    }
  `;
  document.head.appendChild(style);
}

function hideAuxiliaryBars(canvas) {
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;

  Array.from(document.body.querySelectorAll('*')).forEach((element) => {
    if (element === canvas || element.contains(canvas) || canvas.contains?.(element)) return;
    if (element.closest?.('aside')) return;

    const style = window.getComputedStyle(element);
    if (style.position !== 'fixed' && style.position !== 'absolute') return;

    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const bottomBar = rect.top >= viewportHeight - 48 && rect.width >= Math.max(300, viewportWidth * 0.35) && rect.height <= 48;
    const rightBar = rect.left >= viewportWidth - 110 && rect.width <= 110 && rect.height >= 80 && rect.top >= 24;

    if (bottomBar || rightBar) {
      element.dataset.gannzillaHiddenAuxBarV392 = 'true';
      element.style.setProperty('display', 'none', 'important');
      element.style.setProperty('visibility', 'hidden', 'important');
      element.style.setProperty('pointer-events', 'none', 'important');
    }
  });
}

function prepareViewport(canvas) {
  let node = canvas.parentElement;
  let depth = 0;
  while (node && node !== document.body && depth < 6) {
    const style = window.getComputedStyle(node);
    const scrollable = /(auto|scroll)/.test(`${style.overflow} ${style.overflowX} ${style.overflowY}`);
    if (scrollable || depth <= 2) {
      node.style.setProperty('overflow', 'hidden', 'important');
      node.style.setProperty('scrollbar-width', 'none', 'important');
      node.style.setProperty('-ms-overflow-style', 'none', 'important');
      node.dataset.gannzillaCleanViewportV392 = 'true';
    }
    node = node.parentElement;
    depth += 1;
  }
}

function bindDrag(canvas) {
  if (canvas.dataset.gannzillaCleanDragV392 === 'true') return;
  canvas.dataset.gannzillaCleanDragV392 = 'true';

  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let originX = 0;
  let originY = 0;

  const apply = () => {
    canvas.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
  };

  const onPointerDown = (event) => {
    if (event.button !== 0) return;
    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    originX = offsetX;
    originY = offsetY;
    canvas.dataset.dragging = 'true';
    canvas.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  };

  const onPointerMove = (event) => {
    if (!dragging) return;
    offsetX = originX + (event.clientX - startX);
    offsetY = originY + (event.clientY - startY);
    apply();
    event.preventDefault();
  };

  const stop = (event) => {
    if (!dragging) return;
    dragging = false;
    canvas.dataset.dragging = 'false';
    if (event?.pointerId != null) canvas.releasePointerCapture?.(event.pointerId);
  };

  canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
  canvas.addEventListener('pointermove', onPointerMove, { passive: false });
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);
  canvas.addEventListener('lostpointercapture', stop);
}

function applyCleanDragView() {
  if (!enabled()) return false;
  installStyle();
  const canvas = findMainWheelCanvas();
  if (!canvas) return false;
  prepareViewport(canvas);
  hideAuxiliaryBars(canvas);
  bindDrag(canvas);
  window.GANNZILLA_CLEAN_DRAG_VIEWPORT_V392 = true;
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !enabled()) return;
  if (window[STATE_KEY]) return;

  const run = () => applyCleanDragView();
  [0, 80, 220, 500, 1000].forEach((delay) => window.setTimeout(run, delay));

  const observer = new MutationObserver(run);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('resize', run);

  window[STATE_KEY] = { observer };
}

install();
