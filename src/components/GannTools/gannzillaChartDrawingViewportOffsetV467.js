const BUILD = 467;
const TOOLBAR_ID = 'gannzilla-chart-drawing-toolbar-v466';
const STATE_KEY = '__gannzillaChartDrawingViewportOffsetV467';
const VIEWPORT_MARKER = 'data-gannzilla-chart-drawing-offset-v467';

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

let lastApplied = null;
let applyCount = 0;

function applyOffset(source = 'refresh') {
  const toolbar = document.getElementById(TOOLBAR_ID);
  const elements = findWheelElements();
  if (!(toolbar instanceof HTMLElement) || !elements) return false;

  const toolbarStyle = window.getComputedStyle(toolbar);
  const toolbarRect = toolbar.getBoundingClientRect();
  const viewportRect = elements.viewport.getBoundingClientRect();
  if (toolbarStyle.display === 'none'
    || toolbarStyle.visibility === 'hidden'
    || toolbarRect.width < 2
    || toolbarRect.height < 2
    || viewportRect.height < 10) return false;

  const gap = Math.round(numberParam('chartDrawingContentGap', 6, 0, 24));
  const targetTop = Math.round(toolbarRect.bottom + gap);
  const paddingTop = Math.max(0, targetTop - Math.round(viewportRect.top));
  const currentPadding = Math.round(parseFloat(elements.viewport.style.paddingTop) || 0);

  if (currentPadding !== paddingTop) {
    elements.viewport.style.setProperty('padding-top', `${paddingTop}px`, 'important');
  }
  elements.viewport.style.setProperty('box-sizing', 'border-box', 'important');

  // The original wheel stage remains responsible for centering horizontally.
  // Vertical alignment starts below the toolbar without altering the pan transform.
  elements.canvas.style.setProperty('align-self', 'start', 'important');
  elements.canvas.style.setProperty('justify-self', 'center', 'important');

  elements.viewport.setAttribute(VIEWPORT_MARKER, 'true');
  elements.viewport.dataset.gannzillaChartContentTopV467 = String(targetTop);
  elements.viewport.dataset.gannzillaChartPaddingTopV467 = String(paddingTop);

  lastApplied = {
    source,
    targetTop,
    paddingTop,
    toolbarBottom: Math.round(toolbarRect.bottom),
    viewportTop: Math.round(viewportRect.top),
    at: Date.now(),
  };
  applyCount += 1;

  window.dispatchEvent(new CustomEvent('gannzilla:chart-drawing-viewport-offset-v467', {
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
  let toolbarObserver = null;
  let observedToolbar = null;
  let viewportObserver = null;
  let observedViewport = null;

  const schedule = (source = 'schedule') => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      applyOffset(source);

      const toolbar = document.getElementById(TOOLBAR_ID);
      if (toolbar instanceof HTMLElement
        && toolbar !== observedToolbar
        && typeof ResizeObserver === 'function') {
        toolbarObserver?.disconnect();
        observedToolbar = toolbar;
        toolbarObserver = new ResizeObserver(() => schedule('toolbar-resize'));
        toolbarObserver.observe(toolbar);
      }

      const elements = findWheelElements();
      if (elements?.viewport instanceof HTMLElement
        && elements.viewport !== observedViewport
        && typeof ResizeObserver === 'function') {
        viewportObserver?.disconnect();
        observedViewport = elements.viewport;
        viewportObserver = new ResizeObserver(() => schedule('viewport-resize'));
        viewportObserver.observe(elements.viewport);
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

  window.GANNZILLA_CHART_DRAWING_VIEWPORT_OFFSET_V467 = true;
  window.__auditGannzillaChartDrawingViewportOffsetV467 = () => {
    const toolbar = document.getElementById(TOOLBAR_ID);
    const elements = findWheelElements();
    const toolbarRect = toolbar?.getBoundingClientRect();
    const canvasRect = elements?.canvas?.getBoundingClientRect();
    const gap = Math.round(numberParam('chartDrawingContentGap', 6, 0, 24));
    return {
      ok: Boolean(
        toolbar
        && elements?.viewport?.getAttribute(VIEWPORT_MARKER) === 'true'
        && toolbarRect
        && canvasRect
        && canvasRect.top >= toolbarRect.bottom + gap - 2
      ),
      build: BUILD,
      enabled: boolParam('lowerChartBelowToolbar', true),
      toolbarBottom: toolbarRect ? Math.round(toolbarRect.bottom) : null,
      canvasTop: canvasRect ? Math.round(canvasRect.top) : null,
      requestedGapPx: gap,
      viewportPaddingTopPx: elements?.viewport
        ? Math.round(parseFloat(window.getComputedStyle(elements.viewport).paddingTop) || 0)
        : null,
      applyCount,
      lastApplied,
      panTransformPreserved: true,
      panelPositionUnchanged: true,
    };
  };

  window[STATE_KEY] = {
    timers,
    schedule,
    onLayout,
    get toolbarObserver() { return toolbarObserver; },
    get viewportObserver() { return viewportObserver; },
  };
}

install();