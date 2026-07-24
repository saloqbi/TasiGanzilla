const BUILD = 468;
const TOOLBAR_ID = 'gannzilla-chart-drawing-toolbar-v466';
const STATE_KEY = '__gannzillaChartDrawingViewportOffsetV468';
const VIEWPORT_MARKER = 'data-gannzilla-chart-drawing-viewport-v468';
const STAGE_MARKER = 'data-gannzilla-chart-drawing-stage-v468';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
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

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function getClassicRoot() {
  return document.querySelector('[data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"])');
}

function findWheelElements() {
  const root = getClassicRoot();
  if (!(root instanceof HTMLElement)) return null;

  const canvas = Array.from(root.querySelectorAll('canvas'))
    .filter((node) => {
      if (!(node instanceof HTMLCanvasElement) || node.closest?.('aside')) return false;
      const rect = node.getBoundingClientRect();
      const style = window.getComputedStyle(node);
      return node.width > 300
        && node.height > 300
        && rect.width > 250
        && rect.height > 250
        && style.display !== 'none'
        && style.visibility !== 'hidden';
    })
    .map((node) => ({ node, area: node.width * node.height }))
    .sort((a, b) => b.area - a.area)[0]?.node || null;

  if (!(canvas instanceof HTMLCanvasElement)) return null;
  const stage = canvas.parentElement;
  if (!(stage instanceof HTMLElement)) return null;

  let viewport = stage.parentElement;
  while (viewport && viewport.parentElement !== root) viewport = viewport.parentElement;
  if (!(viewport instanceof HTMLElement)) return null;

  return { root, viewport, stage, canvas };
}

function setImportant(node, property, value) {
  if (!(node instanceof HTMLElement)) return false;
  const currentValue = node.style.getPropertyValue(property);
  const currentPriority = node.style.getPropertyPriority(property);
  if (currentValue === value && currentPriority === 'important') return false;
  node.style.setProperty(property, value, 'important');
  return true;
}

function toolbarIsVisible(toolbar) {
  if (!(toolbar instanceof HTMLElement)) return false;
  const style = window.getComputedStyle(toolbar);
  const rect = toolbar.getBoundingClientRect();
  return style.display !== 'none'
    && style.visibility !== 'hidden'
    && Number(style.opacity || 1) !== 0
    && rect.width > 2
    && rect.height > 2;
}

let lastApplied = null;
let applyCount = 0;
let correctionFrame = 0;

function applyLayout(source = 'refresh') {
  const toolbar = document.getElementById(TOOLBAR_ID);
  const elements = findWheelElements();
  if (!(toolbar instanceof HTMLElement) || !elements) return false;

  const visible = toolbarIsVisible(toolbar);
  const viewportRect = elements.viewport.getBoundingClientRect();

  if (!visible) {
    setImportant(elements.viewport, 'padding-top', '0px');
    setImportant(elements.stage, 'padding-top', '0px');
    setImportant(elements.stage, 'place-items', 'center');
    elements.viewport.removeAttribute(VIEWPORT_MARKER);
    elements.stage.removeAttribute(STAGE_MARKER);
    return false;
  }

  const toolbarRect = toolbar.getBoundingClientRect();
  const gap = Math.round(numberParam('chartDrawingContentGap', 6, 0, 24));
  const targetTop = Math.round(toolbarRect.bottom + gap);
  const stagePaddingTop = Math.max(0, targetTop - Math.round(viewportRect.top));

  // The wheel controller continuously restores the stage to centered placement.
  // Reassert a top-aligned grid with padding so the chart starts under the toolbar,
  // while leaving the canvas pan transform untouched.
  setImportant(elements.viewport, 'padding-top', '0px');
  setImportant(elements.viewport, 'box-sizing', 'border-box');
  setImportant(elements.stage, 'box-sizing', 'border-box');
  setImportant(elements.stage, 'padding-top', `${stagePaddingTop}px`);
  setImportant(elements.stage, 'place-items', 'start center');
  setImportant(elements.stage, 'align-content', 'start');
  setImportant(elements.stage, 'justify-content', 'center');
  setImportant(elements.canvas, 'align-self', 'start');
  setImportant(elements.canvas, 'justify-self', 'center');

  elements.viewport.setAttribute(VIEWPORT_MARKER, 'true');
  elements.stage.setAttribute(STAGE_MARKER, 'true');
  elements.viewport.dataset.gannzillaChartContentTopV468 = String(targetTop);
  elements.stage.dataset.gannzillaChartPaddingTopV468 = String(stagePaddingTop);

  window.cancelAnimationFrame(correctionFrame);
  correctionFrame = window.requestAnimationFrame(() => {
    const current = findWheelElements();
    const currentToolbar = document.getElementById(TOOLBAR_ID);
    if (!current || !(currentToolbar instanceof HTMLElement) || !toolbarIsVisible(currentToolbar)) return;
    const currentTarget = Math.round(currentToolbar.getBoundingClientRect().bottom + gap);
    const canvasTop = Math.round(current.canvas.getBoundingClientRect().top);
    const missing = currentTarget - canvasTop;
    if (missing > 1) {
      const currentPadding = Math.max(0, parseFloat(current.stage.style.paddingTop) || 0);
      setImportant(current.stage, 'padding-top', `${Math.round(currentPadding + missing)}px`);
    }
  });

  lastApplied = {
    source,
    targetTop,
    stagePaddingTop,
    toolbarBottom: Math.round(toolbarRect.bottom),
    viewportTop: Math.round(viewportRect.top),
    at: Date.now(),
  };
  applyCount += 1;

  window.dispatchEvent(new CustomEvent('gannzilla:chart-drawing-viewport-offset-v468', {
    detail: { ...lastApplied, build: BUILD },
  }));
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showChartDrawingToolbar', false)
    || !boolParam('lowerChartBelowToolbar', true)
    || window[STATE_KEY]) return;

  let frame = 0;
  let toolbarResizeObserver = null;
  let observedToolbar = null;
  let viewportResizeObserver = null;
  let observedViewport = null;
  let stageStyleObserver = null;
  let observedStage = null;

  const schedule = (source = 'schedule') => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      applyLayout(source);

      const toolbar = document.getElementById(TOOLBAR_ID);
      if (toolbar instanceof HTMLElement
        && toolbar !== observedToolbar
        && typeof ResizeObserver === 'function') {
        toolbarResizeObserver?.disconnect();
        observedToolbar = toolbar;
        toolbarResizeObserver = new ResizeObserver(() => schedule('toolbar-resize'));
        toolbarResizeObserver.observe(toolbar);
      }

      const elements = findWheelElements();
      if (elements?.viewport instanceof HTMLElement
        && elements.viewport !== observedViewport
        && typeof ResizeObserver === 'function') {
        viewportResizeObserver?.disconnect();
        observedViewport = elements.viewport;
        viewportResizeObserver = new ResizeObserver(() => schedule('viewport-resize'));
        viewportResizeObserver.observe(elements.viewport);
      }

      if (elements?.stage instanceof HTMLElement
        && elements.stage !== observedStage
        && typeof MutationObserver === 'function') {
        stageStyleObserver?.disconnect();
        observedStage = elements.stage;
        stageStyleObserver = new MutationObserver(() => schedule('stage-style'));
        stageStyleObserver.observe(elements.stage, {
          attributes: true,
          attributeFilter: ['style'],
        });
      }
    });
  };

  schedule('install');
  const timers = [40, 120, 300, 700, 1500, 3000, 5000]
    .map((delay) => window.setTimeout(() => schedule(`bootstrap-${delay}`), delay));

  const onLayout = () => schedule('layout-event');
  window.addEventListener('resize', onLayout);
  window.addEventListener('scroll', onLayout, true);
  document.addEventListener('fullscreenchange', onLayout);
  window.addEventListener('gannzilla:layout-panel-visibility-change', onLayout);
  window.addEventListener('gannzilla:ring-two-numbering-refresh', onLayout);
  window.addEventListener('gannzilla:unified-wheel-tools-v453', onLayout);
  window.addEventListener('gannzilla:wheel-pan-offset-v305', onLayout);

  window.GANNZILLA_CHART_DRAWING_VIEWPORT_OFFSET_V468 = true;
  window.__auditGannzillaChartDrawingViewportOffsetV468 = () => {
    const toolbar = document.getElementById(TOOLBAR_ID);
    const elements = findWheelElements();
    const toolbarRect = toolbar?.getBoundingClientRect();
    const canvasRect = elements?.canvas?.getBoundingClientRect();
    const gap = Math.round(numberParam('chartDrawingContentGap', 6, 0, 24));
    return {
      ok: Boolean(
        toolbar
        && elements?.stage?.getAttribute(STAGE_MARKER) === 'true'
        && toolbarRect
        && canvasRect
        && canvasRect.top >= toolbarRect.bottom + gap - 2
      ),
      build: BUILD,
      enabled: boolParam('lowerChartBelowToolbar', true),
      toolbarBottom: toolbarRect ? Math.round(toolbarRect.bottom) : null,
      canvasTop: canvasRect ? Math.round(canvasRect.top) : null,
      requestedGapPx: gap,
      stagePaddingTopPx: elements?.stage
        ? Math.round(parseFloat(window.getComputedStyle(elements.stage).paddingTop) || 0)
        : null,
      applyCount,
      lastApplied,
      panTransformPreserved: true,
      panelPositionUnchanged: true,
      stageStyleProtection: true,
    };
  };

  window[STATE_KEY] = {
    timers,
    schedule,
    onLayout,
    get toolbarResizeObserver() { return toolbarResizeObserver; },
    get viewportResizeObserver() { return viewportResizeObserver; },
    get stageStyleObserver() { return stageStyleObserver; },
  };
}

install();