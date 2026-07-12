import React from 'react';

const BUILD = 303;
const TOOLBAR_HEIGHT_PX = 24;
const HIDDEN_FRACTION = 0.25;
const MOVE_STEP_PX = 48;
const HOLD_STEP_PX = 12;
const PAN_STORAGE_KEY = 'gannzilla-wheel-quarter-hidden-pan-v303';

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

  const panel = Array.from(root.children)
    .find((node) => node instanceof HTMLElement && node.tagName === 'ASIDE') || null;

  return { root, viewport, stage, canvas, panel };
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

function panelIsVisible(panel) {
  if (!(panel instanceof HTMLElement)) return false;
  const style = window.getComputedStyle(panel);
  const rect = panel.getBoundingClientRect();
  return style.display !== 'none'
    && style.visibility !== 'hidden'
    && style.opacity !== '0'
    && rect.width > 1
    && rect.height > 1;
}

function panelSide(panel) {
  if (!(panel instanceof HTMLElement)) return 'none';
  const rect = panel.getBoundingClientRect();
  return rect.left <= window.innerWidth / 2 ? 'left' : 'right';
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

  // At the horizontal limit, exactly 25% of the wheel may pass beyond the page.
  // The remaining 75% always stays visible, so the wheel cannot disappear.
  const maxOffsetX = Math.max(
    0,
    viewportWidth / 2 - canvasWidth * (0.5 - HIDDEN_FRACTION),
  );
  const maxOffsetY = Math.max(
    0,
    viewportHeight / 2 - canvasHeight * (0.5 - HIDDEN_FRACTION),
  );

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

  elements.canvas.dataset.gannzillaQuarterHiddenX = String(Math.round(bounded.x));
  elements.canvas.dataset.gannzillaQuarterHiddenY = String(Math.round(bounded.y));
  elements.viewport.dataset.gannzillaQuarterHiddenViewportV303 = 'true';
  persistOffset(bounded);

  return { ...elements, ...geometry, offset: bounded };
}

/** Build 303: the wheel may tuck 25% beyond the page edge to create room for the full settings panel. */
export default function GannzillaWheelQuarterHiddenPanV303() {
  const offsetRef = React.useRef(readStoredOffset());
  const repeatDelayRef = React.useRef(0);
  const repeatIntervalRef = React.useRef(0);
  const suppressNextClickRef = React.useRef(false);
  const previousPanelVisibleRef = React.useRef(null);

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

    const dockForPanel = () => {
      const current = commit(offsetRef.current);
      if (!current) return null;

      const visible = panelIsVisible(current.panel);
      const side = panelSide(current.panel);
      const justOpened = visible && previousPanelVisibleRef.current !== true;
      previousPanelVisibleRef.current = visible;

      if (justOpened && side !== 'none') {
        // A left panel pushes the wheel right; a right panel pushes it left.
        const x = side === 'left' ? current.maxOffsetX : -current.maxOffsetX;
        return commit({ x, y: offsetRef.current.y });
      }

      return current;
    };

    const sync = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const result = dockForPanel();
        if (!result || resizeObserver || typeof ResizeObserver === 'undefined') return;
        resizeObserver = new ResizeObserver(sync);
        resizeObserver.observe(result.viewport);
        resizeObserver.observe(result.canvas);
        if (result.panel) resizeObserver.observe(result.panel);
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
    window.addEventListener('gannzilla:panel-width-v302-sync', sync);

    window.GANNZILLA_WHEEL_QUARTER_HIDDEN_PAN_V303 = true;
    window.__auditGannzillaWheelQuarterHiddenPanV303 = () => {
      const result = commit(offsetRef.current);
      const rect = result?.canvas?.getBoundingClientRect?.();
      return {
        ok: Boolean(result),
        build: BUILD,
        movementAuthority: 'CLAMPED_CANVAS_TRANSLATION',
        permittedHiddenFraction: HIDDEN_FRACTION,
        minimumVisibleFraction: 1 - HIDDEN_FRACTION,
        quarterWheelMayPassPageEdge: true,
        wheelCannotFullyDisappear: true,
        panelAutoDockEnabled: true,
        panelSide: panelSide(result?.panel),
        panelVisible: panelIsVisible(result?.panel),
        viewportUsesFullBrowserWidth: Boolean(result && Math.abs(result.viewportWidth - window.innerWidth) <= 1),
        panelDoesNotReduceMovementRange: true,
        currentCanvasLeft: rect ? Math.round(rect.left) : null,
        currentCanvasRight: rect ? Math.round(rect.right) : null,
        browserRight: window.innerWidth,
        maximumOffsetX: result?.maxOffsetX ?? null,
        maximumOffsetY: result?.maxOffsetY ?? null,
        currentOffset: result?.offset || null,
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
      window.removeEventListener('gannzilla:panel-width-v302-sync', sync);
      delete window.GANNZILLA_WHEEL_QUARTER_HIDDEN_PAN_V303;
      delete window.__auditGannzillaWheelQuarterHiddenPanV303;
    };
  }, []);

  return null;
}
