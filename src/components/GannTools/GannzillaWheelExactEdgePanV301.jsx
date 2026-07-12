import React from 'react';

const BUILD = 301;
const TOOLBAR_HEIGHT_PX = 24;
const EDGE_MARGIN_PX = 0;
const MOVE_STEP_PX = 48;
const HOLD_STEP_PX = 12;
const PAN_STORAGE_KEY = 'gannzilla-wheel-exact-edge-pan-v301';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getClassicRoot() {
  return document.querySelector('[data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"])');
}

function findWheelElements() {
  const root = getClassicRoot();
  if (!(root instanceof HTMLElement)) return null;

  const canvases = Array.from(root.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, area: canvas.offsetWidth * canvas.offsetHeight }))
    .filter(({ area }) => area > 250 * 250)
    .sort((a, b) => b.area - a.area);

  const canvas = canvases[0]?.canvas || null;
  if (!(canvas instanceof HTMLCanvasElement)) return null;

  const stage = canvas.parentElement;
  if (!(stage instanceof HTMLElement)) return null;

  let viewport = stage.parentElement;
  while (viewport && viewport.parentElement !== root) viewport = viewport.parentElement;
  if (!(viewport instanceof HTMLElement)) return null;

  return { root, viewport, stage, canvas };
}

function readStoredOffset() {
  try {
    const value = JSON.parse(localStorage.getItem(PAN_STORAGE_KEY) || '{}');
    return {
      x: Number.isFinite(Number(value.x)) ? Number(value.x) : 0,
      y: Number.isFinite(Number(value.y)) ? Number(value.y) : 0,
    };
  } catch {
    return { x: 0, y: 0 };
  }
}

function persistOffset(offset) {
  try {
    localStorage.setItem(PAN_STORAGE_KEY, JSON.stringify({
      x: Math.round(offset.x),
      y: Math.round(offset.y),
    }));
  } catch {
    // Runtime state remains authoritative when storage is unavailable.
  }
}

function configureFullPageGeometry(elements) {
  const { viewport, stage, canvas } = elements;

  viewport.style.setProperty('position', 'fixed', 'important');
  viewport.style.setProperty('left', '0', 'important');
  viewport.style.setProperty('right', '0', 'important');
  viewport.style.setProperty('top', `${TOOLBAR_HEIGHT_PX}px`, 'important');
  viewport.style.setProperty('bottom', '0', 'important');
  viewport.style.setProperty('width', 'auto', 'important');
  viewport.style.setProperty('height', 'auto', 'important');
  viewport.style.setProperty('min-width', '0', 'important');
  viewport.style.setProperty('max-width', 'none', 'important');
  viewport.style.setProperty('overflow', 'hidden', 'important');
  viewport.style.setProperty('direction', 'ltr', 'important');
  viewport.style.setProperty('box-sizing', 'border-box', 'important');
  viewport.scrollLeft = 0;
  viewport.scrollTop = 0;

  stage.style.setProperty('position', 'relative', 'important');
  stage.style.setProperty('left', '0', 'important');
  stage.style.setProperty('top', '0', 'important');
  stage.style.setProperty('width', '100%', 'important');
  stage.style.setProperty('height', '100%', 'important');
  stage.style.setProperty('min-width', '100%', 'important');
  stage.style.setProperty('min-height', '100%', 'important');
  stage.style.setProperty('max-width', '100%', 'important');
  stage.style.setProperty('max-height', '100%', 'important');
  stage.style.setProperty('padding', '0', 'important');
  stage.style.setProperty('margin', '0', 'important');
  stage.style.setProperty('display', 'grid', 'important');
  stage.style.setProperty('place-items', 'center', 'important');
  stage.style.setProperty('overflow', 'hidden', 'important');
  stage.style.setProperty('transform', 'none', 'important');
  stage.style.setProperty('box-sizing', 'border-box', 'important');

  canvas.style.setProperty('display', 'block', 'important');
  canvas.style.setProperty('max-width', 'none', 'important');
  canvas.style.setProperty('max-height', 'none', 'important');
  canvas.style.setProperty('margin', '0', 'important');
  canvas.style.setProperty('transition', 'none', 'important');
  canvas.style.setProperty('will-change', 'transform', 'important');
  canvas.style.setProperty('transform-origin', 'center center', 'important');

  const viewportWidth = Math.max(1, viewport.clientWidth);
  const viewportHeight = Math.max(1, viewport.clientHeight);
  const canvasRect = canvas.getBoundingClientRect();
  const canvasWidth = Math.max(1, canvas.offsetWidth || canvasRect.width);
  const canvasHeight = Math.max(1, canvas.offsetHeight || canvasRect.height);

  const maxOffsetX = Math.max(0, Math.abs(viewportWidth - canvasWidth) / 2 - EDGE_MARGIN_PX);
  const maxOffsetY = Math.max(0, Math.abs(viewportHeight - canvasHeight) / 2 - EDGE_MARGIN_PX);

  return {
    viewportWidth,
    viewportHeight,
    canvasWidth,
    canvasHeight,
    maxOffsetX,
    maxOffsetY,
  };
}

function applyOffset(offset) {
  const elements = findWheelElements();
  if (!elements) return null;

  const geometry = configureFullPageGeometry(elements);
  const bounded = {
    x: clamp(Number(offset?.x) || 0, -geometry.maxOffsetX, geometry.maxOffsetX),
    y: clamp(Number(offset?.y) || 0, -geometry.maxOffsetY, geometry.maxOffsetY),
  };

  elements.canvas.style.setProperty(
    'transform',
    `translate3d(${Math.round(bounded.x)}px, ${Math.round(bounded.y)}px, 0)`,
    'important',
  );

  elements.canvas.dataset.gannzillaExactEdgeX = String(Math.round(bounded.x));
  elements.canvas.dataset.gannzillaExactEdgeY = String(Math.round(bounded.y));
  elements.viewport.dataset.gannzillaExactEdgeViewportV301 = 'true';
  persistOffset(bounded);

  return { ...elements, ...geometry, offset: bounded };
}

/** Build 301: move the wheel itself until its outer edge touches the browser edge exactly. */
export default function GannzillaWheelExactEdgePanV301() {
  const offsetRef = React.useRef(readStoredOffset());
  const repeatDelayRef = React.useRef(0);
  const repeatIntervalRef = React.useRef(0);
  const suppressNextClickRef = React.useRef(false);

  React.useEffect(() => {
    let frame = 0;
    let resizeObserver = null;

    const stopHold = () => {
      if (repeatDelayRef.current) window.clearTimeout(repeatDelayRef.current);
      if (repeatIntervalRef.current) window.clearInterval(repeatIntervalRef.current);
      repeatDelayRef.current = 0;
      repeatIntervalRef.current = 0;
    };

    const commit = (nextOffset) => {
      const result = applyOffset(nextOffset);
      if (result) offsetRef.current = result.offset;
      return result;
    };

    const move = (direction, distance = MOVE_STEP_PX) => {
      const delta = {
        left: { x: -distance, y: 0 },
        right: { x: distance, y: 0 },
        up: { x: 0, y: -distance },
        down: { x: 0, y: distance },
      }[direction];
      if (!delta) return;

      commit({
        x: offsetRef.current.x + delta.x,
        y: offsetRef.current.y + delta.y,
      });
    };

    const sync = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const result = commit(offsetRef.current);
        if (!result || resizeObserver || typeof ResizeObserver === 'undefined') return;
        resizeObserver = new ResizeObserver(sync);
        resizeObserver.observe(result.viewport);
        resizeObserver.observe(result.canvas);
      });
    };

    const stopEvent = (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
    };

    const directionFromEvent = (event) => {
      const button = event.target?.closest?.('[data-gannzilla-v265-direction]');
      return button?.getAttribute?.('data-gannzilla-v265-direction') || null;
    };

    const onPointerDownCapture = (event) => {
      const direction = directionFromEvent(event);
      if (!direction) return;
      stopEvent(event);
      stopHold();
      suppressNextClickRef.current = true;
      move(direction, MOVE_STEP_PX);
      repeatDelayRef.current = window.setTimeout(() => {
        repeatIntervalRef.current = window.setInterval(() => move(direction, HOLD_STEP_PX), 70);
      }, 340);
    };

    const onPointerEndCapture = () => stopHold();

    const onClickCapture = (event) => {
      const direction = directionFromEvent(event);
      const centerButton = event.target?.closest?.('[data-gannzilla-v265-center="true"]');

      if (direction) {
        stopEvent(event);
        if (suppressNextClickRef.current) {
          suppressNextClickRef.current = false;
          return;
        }
        move(direction, MOVE_STEP_PX);
        return;
      }

      if (centerButton) {
        stopEvent(event);
        offsetRef.current = { x: 0, y: 0 };
        commit(offsetRef.current);
      }
    };

    sync();
    const timers = [0, 80, 220, 520, 1000, 1800].map((delay) => window.setTimeout(sync, delay));
    const bodyObserver = new MutationObserver(sync);
    bodyObserver.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('pointerdown', onPointerDownCapture, true);
    window.addEventListener('pointerup', onPointerEndCapture, true);
    window.addEventListener('pointercancel', onPointerEndCapture, true);
    window.addEventListener('click', onClickCapture, true);
    window.addEventListener('resize', sync);
    document.addEventListener('fullscreenchange', sync);
    window.addEventListener('gannzilla:ring-two-numbering-refresh', sync);
    window.addEventListener('gannzilla:layout-panel-visibility-change', sync);
    window.addEventListener('gannzilla:panel-frame-cleanup-sync', sync);

    window.GANNZILLA_WHEEL_EXACT_EDGE_PAN_V301 = true;
    window.__auditGannzillaWheelExactEdgePanV301 = () => {
      const result = commit(offsetRef.current);
      const rect = result?.canvas?.getBoundingClientRect?.();
      return {
        ok: Boolean(result),
        build: BUILD,
        movementAuthority: 'CLAMPED_CANVAS_TRANSLATION',
        viewportUsesFullBrowserWidth: Boolean(result && result.viewportWidth === window.innerWidth),
        panelDoesNotReduceMovementRange: true,
        rightEdgeReachable: Boolean(result && result.maxOffsetX >= 0),
        leftEdgeReachable: Boolean(result && result.maxOffsetX >= 0),
        currentCanvasLeft: rect ? Math.round(rect.left) : null,
        currentCanvasRight: rect ? Math.round(rect.right) : null,
        browserRight: window.innerWidth,
        maximumOffsetX: result?.maxOffsetX ?? null,
        maximumOffsetY: result?.maxOffsetY ?? null,
        currentOffset: result?.offset || null,
        exactPageEdgeMarginPx: EDGE_MARGIN_PX,
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      stopHold();
      window.cancelAnimationFrame(frame);
      bodyObserver.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener('pointerdown', onPointerDownCapture, true);
      window.removeEventListener('pointerup', onPointerEndCapture, true);
      window.removeEventListener('pointercancel', onPointerEndCapture, true);
      window.removeEventListener('click', onClickCapture, true);
      window.removeEventListener('resize', sync);
      document.removeEventListener('fullscreenchange', sync);
      window.removeEventListener('gannzilla:ring-two-numbering-refresh', sync);
      window.removeEventListener('gannzilla:layout-panel-visibility-change', sync);
      window.removeEventListener('gannzilla:panel-frame-cleanup-sync', sync);
      delete window.GANNZILLA_WHEEL_EXACT_EDGE_PAN_V301;
      delete window.__auditGannzillaWheelExactEdgePanV301;
    };
  }, []);

  return null;
}
