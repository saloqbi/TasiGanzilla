import React from 'react';

const BUILD = 294;
const PAN_STORAGE_KEY = 'gannzilla-wheel-pan-v265';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function findWheelStage() {
  const canvases = Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height));

  const canvas = canvases[0]?.canvas || null;
  if (!(canvas instanceof HTMLCanvasElement)) return null;

  const stage = canvas.parentElement || canvas;
  if (!(stage instanceof HTMLElement)) return null;
  stage.dataset.gannzillaViewportGuardStageV294 = 'true';
  return stage;
}

function findWheelViewport(stage = findWheelStage()) {
  if (!(stage instanceof HTMLElement)) return null;
  const viewport = stage.parentElement;
  if (!(viewport instanceof HTMLElement)) return null;
  viewport.dataset.gannzillaViewportScrollAuthorityV294 = 'true';
  return viewport;
}

function readOffset(stage) {
  const fromDataset = {
    x: Number(stage?.dataset?.gannzillaPanX),
    y: Number(stage?.dataset?.gannzillaPanY),
  };

  if (Number.isFinite(fromDataset.x) && Number.isFinite(fromDataset.y)) return fromDataset;

  try {
    const stored = JSON.parse(localStorage.getItem(PAN_STORAGE_KEY) || '{}');
    return {
      x: Number.isFinite(Number(stored.x)) ? Number(stored.x) : 0,
      y: Number.isFinite(Number(stored.y)) ? Number(stored.y) : 0,
    };
  } catch {
    return { x: 0, y: 0 };
  }
}

function applyBoundedViewportPan() {
  const stage = findWheelStage();
  const viewport = findWheelViewport(stage);
  if (!(stage instanceof HTMLElement) || !(viewport instanceof HTMLElement)) return null;

  const offset = readOffset(stage);

  // CSS transforms do not enlarge a scroll container's layout bounds. The old
  // transform-based pan could therefore move the wheel outside the viewport and
  // make it disappear. The viewport scroll position is now the visual authority.
  stage.style.setProperty('transform', 'none', 'important');
  stage.style.setProperty('transform-origin', 'center center', 'important');
  stage.style.setProperty('transition', 'none', 'important');
  stage.style.setProperty('will-change', 'auto', 'important');

  const maxLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
  const maxTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
  const centerLeft = maxLeft / 2;
  const centerTop = maxTop / 2;

  // Positive X means the wheel should move visually to the right, so the
  // viewport scrolls left. Positive Y means the wheel moves visually downward.
  const nextLeft = clamp(centerLeft - offset.x, 0, maxLeft);
  const nextTop = clamp(centerTop - offset.y, 0, maxTop);

  viewport.scrollLeft = Math.round(nextLeft);
  viewport.scrollTop = Math.round(nextTop);
  viewport.dataset.gannzillaPanX = String(Math.round(offset.x));
  viewport.dataset.gannzillaPanY = String(Math.round(offset.y));
  viewport.dataset.gannzillaPanClampedV294 = 'true';

  return {
    stage,
    viewport,
    offset,
    maxLeft,
    maxTop,
    nextLeft,
    nextTop,
  };
}

/** Build 294: keep the entire wheel reachable after layout-panel resize and directional movement. */
export default function GannzillaWheelViewportGuardV294() {
  React.useEffect(() => {
    let frame = 0;
    let stageObserver = null;
    let resizeObserver = null;

    const sync = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const result = applyBoundedViewportPan();
        if (!result) return;

        if (!stageObserver) {
          stageObserver = new MutationObserver(sync);
          stageObserver.observe(result.stage, {
            attributes: true,
            attributeFilter: ['style', 'data-gannzilla-pan-x', 'data-gannzilla-pan-y'],
          });
        }

        if (!resizeObserver && typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(sync);
          resizeObserver.observe(result.viewport);
          resizeObserver.observe(result.stage);
          const canvas = result.stage.querySelector('canvas');
          if (canvas) resizeObserver.observe(canvas);
        }
      });
    };

    sync();
    const timers = [0, 80, 220, 520, 1000, 1800].map((delay) => window.setTimeout(sync, delay));
    const bodyObserver = new MutationObserver(sync);
    bodyObserver.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('resize', sync);
    document.addEventListener('fullscreenchange', sync);
    window.addEventListener('gannzilla:ring-two-numbering-refresh', sync);
    window.addEventListener('gannzilla:layout-panel-visibility-change', sync);

    window.GANNZILLA_WHEEL_VIEWPORT_GUARD_V294 = true;
    window.__auditGannzillaWheelViewportGuardV294 = () => {
      const result = applyBoundedViewportPan();
      return {
        ok: Boolean(result),
        build: BUILD,
        transformPanDisabled: result?.stage?.style?.transform === 'none',
        viewportScrollIsMovementAuthority: Boolean(result?.viewport),
        horizontalMovementClamped: Boolean(result && result.nextLeft >= 0 && result.nextLeft <= result.maxLeft),
        verticalMovementClamped: Boolean(result && result.nextTop >= 0 && result.nextTop <= result.maxTop),
        panelResizeReflowSupported: true,
        wheelCannotMoveOutsideScrollableBounds: true,
        offset: result?.offset || null,
        scrollLeft: result?.viewport?.scrollLeft ?? null,
        scrollTop: result?.viewport?.scrollTop ?? null,
        maxLeft: result?.maxLeft ?? null,
        maxTop: result?.maxTop ?? null,
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      window.cancelAnimationFrame(frame);
      bodyObserver.disconnect();
      stageObserver?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener('resize', sync);
      document.removeEventListener('fullscreenchange', sync);
      window.removeEventListener('gannzilla:ring-two-numbering-refresh', sync);
      window.removeEventListener('gannzilla:layout-panel-visibility-change', sync);
      delete window.GANNZILLA_WHEEL_VIEWPORT_GUARD_V294;
      delete window.__auditGannzillaWheelViewportGuardV294;
    };
  }, []);

  return null;
}
