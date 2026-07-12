import React from 'react';

const BUILD = 295;
const PAN_STORAGE_KEY = 'gannzilla-wheel-pan-v265';
const EDGE_MARGIN_PX = 8;
const MOVE_STEP_PX = 48;
const HOLD_STEP_PX = 12;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function findWheelElements() {
  const canvases = Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height));

  const canvas = canvases[0]?.canvas || null;
  if (!(canvas instanceof HTMLCanvasElement)) return null;

  const stage = canvas.parentElement;
  const viewport = stage?.parentElement;
  if (!(stage instanceof HTMLElement) || !(viewport instanceof HTMLElement)) return null;

  stage.dataset.gannzillaPageEdgeStageV295 = 'true';
  viewport.dataset.gannzillaPageEdgeViewportV295 = 'true';
  return { canvas, stage, viewport };
}

function readStoredOffset() {
  try {
    const saved = JSON.parse(localStorage.getItem(PAN_STORAGE_KEY) || '{}');
    return {
      x: Number.isFinite(Number(saved.x)) ? Number(saved.x) : 0,
      y: Number.isFinite(Number(saved.y)) ? Number(saved.y) : 0,
    };
  } catch {
    return { x: 0, y: 0 };
  }
}

function axisTrackSize(canvasSize, viewportSize) {
  if (canvasSize >= viewportSize - EDGE_MARGIN_PX * 2) {
    return Math.ceil(canvasSize + EDGE_MARGIN_PX * 2);
  }

  // When the wheel is smaller than the page, create equal hidden travel space
  // on both sides. This lets the wheel move until its edge touches the page
  // margin, but never beyond it.
  return Math.ceil(Math.max(
    viewportSize,
    viewportSize * 2 - canvasSize - EDGE_MARGIN_PX * 2,
  ));
}

function configureTrack(elements) {
  const { canvas, stage, viewport } = elements;
  const canvasWidth = Math.max(1, canvas.offsetWidth || canvas.getBoundingClientRect().width);
  const canvasHeight = Math.max(1, canvas.offsetHeight || canvas.getBoundingClientRect().height);
  const viewportWidth = Math.max(1, viewport.clientWidth);
  const viewportHeight = Math.max(1, viewport.clientHeight);

  const trackWidth = axisTrackSize(canvasWidth, viewportWidth);
  const trackHeight = axisTrackSize(canvasHeight, viewportHeight);

  viewport.style.setProperty('overflow', 'auto', 'important');
  viewport.style.setProperty('direction', 'ltr', 'important');
  viewport.style.setProperty('scroll-behavior', 'auto', 'important');

  stage.style.setProperty('width', `${trackWidth}px`, 'important');
  stage.style.setProperty('height', `${trackHeight}px`, 'important');
  stage.style.setProperty('min-width', `${trackWidth}px`, 'important');
  stage.style.setProperty('min-height', `${trackHeight}px`, 'important');
  stage.style.setProperty('max-width', `${trackWidth}px`, 'important');
  stage.style.setProperty('max-height', `${trackHeight}px`, 'important');
  stage.style.setProperty('padding', '0', 'important');
  stage.style.setProperty('margin', '0', 'important');
  stage.style.setProperty('display', 'flex', 'important');
  stage.style.setProperty('align-items', 'center', 'important');
  stage.style.setProperty('justify-content', 'center', 'important');
  stage.style.setProperty('flex', '0 0 auto', 'important');
  stage.style.setProperty('box-sizing', 'border-box', 'important');
  stage.style.setProperty('overflow', 'visible', 'important');
  stage.style.setProperty('transform', 'none', 'important');
  stage.style.setProperty('transition', 'none', 'important');
  stage.style.setProperty('will-change', 'auto', 'important');

  canvas.style.setProperty('flex', '0 0 auto', 'important');

  const maxScrollLeft = Math.max(0, trackWidth - viewportWidth);
  const maxScrollTop = Math.max(0, trackHeight - viewportHeight);

  return {
    canvasWidth,
    canvasHeight,
    viewportWidth,
    viewportHeight,
    trackWidth,
    trackHeight,
    maxScrollLeft,
    maxScrollTop,
    centerScrollLeft: maxScrollLeft / 2,
    centerScrollTop: maxScrollTop / 2,
    maxOffsetX: maxScrollLeft / 2,
    maxOffsetY: maxScrollTop / 2,
  };
}

function persistOffset(stage, offset) {
  const x = Math.round(offset.x);
  const y = Math.round(offset.y);

  if (stage.dataset.gannzillaPanX !== String(x)) stage.dataset.gannzillaPanX = String(x);
  if (stage.dataset.gannzillaPanY !== String(y)) stage.dataset.gannzillaPanY = String(y);

  try {
    localStorage.setItem(PAN_STORAGE_KEY, JSON.stringify({ x, y }));
  } catch {
    // The current runtime remains authoritative when storage is unavailable.
  }
}

function applyOffset(offset) {
  const elements = findWheelElements();
  if (!elements) return null;

  const geometry = configureTrack(elements);
  const bounded = {
    x: clamp(Number(offset?.x) || 0, -geometry.maxOffsetX, geometry.maxOffsetX),
    y: clamp(Number(offset?.y) || 0, -geometry.maxOffsetY, geometry.maxOffsetY),
  };

  const scrollLeft = clamp(
    geometry.centerScrollLeft - bounded.x,
    0,
    geometry.maxScrollLeft,
  );
  const scrollTop = clamp(
    geometry.centerScrollTop - bounded.y,
    0,
    geometry.maxScrollTop,
  );

  elements.viewport.scrollLeft = Math.round(scrollLeft);
  elements.viewport.scrollTop = Math.round(scrollTop);
  persistOffset(elements.stage, bounded);

  elements.viewport.dataset.gannzillaEdgeStopV295 = 'true';
  elements.viewport.dataset.gannzillaBoundedX = String(Math.round(bounded.x));
  elements.viewport.dataset.gannzillaBoundedY = String(Math.round(bounded.y));

  return {
    ...elements,
    ...geometry,
    offset: bounded,
    scrollLeft,
    scrollTop,
  };
}

/** Build 295: directional movement stops when the wheel reaches the page edge. */
export default function GannzillaWheelViewportGuardV294() {
  const offsetRef = React.useRef(readStoredOffset());
  const repeatDelayRef = React.useRef(0);
  const repeatIntervalRef = React.useRef(0);
  const suppressNextClickRef = React.useRef(false);

  React.useEffect(() => {
    let frame = 0;
    let stageObserver = null;
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
        if (!result) return;

        if (!stageObserver) {
          stageObserver = new MutationObserver(() => {
            const stageX = Number(result.stage.dataset.gannzillaPanX);
            const stageY = Number(result.stage.dataset.gannzillaPanY);
            if (!Number.isFinite(stageX) || !Number.isFinite(stageY)) return;
            if (stageX === offsetRef.current.x && stageY === offsetRef.current.y) return;
            commit({ x: stageX, y: stageY });
          });
          stageObserver.observe(result.stage, {
            attributes: true,
            attributeFilter: ['data-gannzilla-pan-x', 'data-gannzilla-pan-y'],
          });
        }

        if (!resizeObserver && typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(sync);
          resizeObserver.observe(result.viewport);
          resizeObserver.observe(result.canvas);
        }
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

    window.GANNZILLA_WHEEL_PAGE_EDGE_STOP_V295 = true;
    window.__auditGannzillaWheelPageEdgeStopV295 = () => {
      const result = commit(offsetRef.current);
      return {
        ok: Boolean(result),
        build: BUILD,
        movementAuthority: 'BOUNDED_VIEWPORT_SCROLL',
        transformMovementDisabled: result?.stage?.style?.transform === 'none',
        pageEdgeStopEnabled: true,
        entireWheelCannotBePushedPastPageEdge: true,
        horizontalOffsetBounded: Boolean(result && Math.abs(result.offset.x) <= result.maxOffsetX),
        verticalOffsetBounded: Boolean(result && Math.abs(result.offset.y) <= result.maxOffsetY),
        leftEdgeLimitPx: EDGE_MARGIN_PX,
        rightEdgeLimitPx: EDGE_MARGIN_PX,
        topEdgeLimitPx: EDGE_MARGIN_PX,
        bottomEdgeLimitPx: EDGE_MARGIN_PX,
        currentOffset: result?.offset || null,
        maximumOffsetX: result?.maxOffsetX ?? null,
        maximumOffsetY: result?.maxOffsetY ?? null,
        viewportWidth: result?.viewportWidth ?? null,
        viewportHeight: result?.viewportHeight ?? null,
        canvasWidth: result?.canvasWidth ?? null,
        canvasHeight: result?.canvasHeight ?? null,
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      stopHold();
      window.cancelAnimationFrame(frame);
      bodyObserver.disconnect();
      stageObserver?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener('pointerdown', onPointerDownCapture, true);
      window.removeEventListener('pointerup', onPointerEndCapture, true);
      window.removeEventListener('pointercancel', onPointerEndCapture, true);
      window.removeEventListener('click', onClickCapture, true);
      window.removeEventListener('resize', sync);
      document.removeEventListener('fullscreenchange', sync);
      window.removeEventListener('gannzilla:ring-two-numbering-refresh', sync);
      window.removeEventListener('gannzilla:layout-panel-visibility-change', sync);
      delete window.GANNZILLA_WHEEL_PAGE_EDGE_STOP_V295;
      delete window.__auditGannzillaWheelPageEdgeStopV295;
    };
  }, []);

  return null;
}
