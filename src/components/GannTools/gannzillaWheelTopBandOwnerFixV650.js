const BUILD = 650;
const STATE_KEY = '__gannzillaWheelTopBandOwnerFixV650';
const PARAM = 'removeWheelTopBand';
const OFFSET_PARAM = 'wheelTopBandPx';
const DEFAULT_OFFSET = 28;

let frame = 0;
let timer = 0;
let observer = null;
let observedViewport = null;
let observedStage = null;
let applying = false;
let applyCount = 0;
let lastApply = null;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function enabled() {
  const value = String(params().get(PARAM) || '').toLowerCase();
  return ['true', '1', 'yes', 'on'].includes(value);
}

function offsetPx() {
  const value = Number(params().get(OFFSET_PARAM));
  if (!Number.isFinite(value)) return DEFAULT_OFFSET;
  return Math.max(0, Math.min(120, Math.round(value)));
}

function visible(element) {
  if (!(element instanceof HTMLElement)) return false;
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return style.display !== 'none'
    && style.visibility !== 'hidden'
    && Number(style.opacity || 0) > 0.01
    && rect.width > 250
    && rect.height > 250;
}

function findOwnerElements() {
  const viewports = Array.from(document.querySelectorAll('[data-gannzilla-asymmetric-open-pan-v305="true"]'))
    .filter((node) => node instanceof HTMLElement && visible(node));

  for (const viewport of viewports) {
    const canvases = Array.from(viewport.querySelectorAll('canvas'))
      .filter((canvas) => canvas instanceof HTMLCanvasElement
        && !canvas.closest('aside')
        && canvas.id !== 'gannzilla-top-center-drawing-overlay-v471'
        && visible(canvas))
      .sort((a, b) => (b.getBoundingClientRect().width * b.getBoundingClientRect().height)
        - (a.getBoundingClientRect().width * a.getBoundingClientRect().height));

    const canvas = canvases[0];
    const stage = canvas?.parentElement;
    if (canvas instanceof HTMLCanvasElement && stage instanceof HTMLElement) {
      return { viewport, stage, canvas };
    }
  }

  return null;
}

function setImportant(element, property, value) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.style.getPropertyValue(property) === value
      && element.style.getPropertyPriority(property) === 'important') return false;
  element.style.setProperty(property, value, 'important');
  return true;
}

function bindObserver(viewport, stage) {
  if (observedViewport === viewport && observedStage === stage && observer) return;
  observer?.disconnect();
  observedViewport = viewport;
  observedStage = stage;
  observer = new MutationObserver(() => {
    if (!applying) schedule('owner-style-overwrite');
  });
  observer.observe(viewport, { attributes: true, attributeFilter: ['style', 'class'] });
  observer.observe(stage, { attributes: true, attributeFilter: ['style', 'class'] });
}

function apply(source = 'apply') {
  frame = 0;
  if (!enabled() || applying) return false;

  const elements = findOwnerElements();
  if (!elements) return false;
  const { viewport, stage, canvas } = elements;
  const amount = offsetPx();

  applying = true;
  try {
    // V305 owns this viewport and repeatedly writes top:24px and stage top:0.
    // Keep its movement transform untouched; only remove the reserved white band.
    setImportant(viewport, 'top', '25px');
    setImportant(viewport, 'overflow', 'hidden');
    setImportant(viewport, 'padding-top', '0');
    setImportant(viewport, 'margin-top', '0');

    setImportant(stage, 'position', 'relative');
    setImportant(stage, 'top', `${-amount}px`);
    setImportant(stage, 'height', `calc(100% + ${amount}px)`);
    setImportant(stage, 'min-height', `calc(100% + ${amount}px)`);
    setImportant(stage, 'max-height', `calc(100% + ${amount}px)`);
    setImportant(stage, 'padding-top', '0');
    setImportant(stage, 'margin-top', '0');

    stage.dataset.gannzillaWheelTopBandOwnerFixV650 = 'true';
    stage.dataset.gannzillaWheelTopBandPxV650 = String(amount);
    viewport.dataset.gannzillaWheelTopBandViewportV650 = 'true';
  } finally {
    applying = false;
  }

  bindObserver(viewport, stage);
  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    owner: 'V305_VIEWPORT_AND_STAGE',
    removedBandPx: amount,
    viewportTop: Math.round(viewport.getBoundingClientRect().top),
    stageTop: Math.round(stage.getBoundingClientRect().top),
    canvasTransformPreserved: getComputedStyle(canvas).transform,
    wheelGeometryChanged: false,
    wheelSizeChanged: false,
    panTransformChanged: false,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule') {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => apply(source));
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  [0, 40, 100, 220, 500, 1000, 2000, 4000].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  [
    'gannzilla:wheel-pan-offset-v305',
    'gannzilla:page-scrollbar-pan-v305',
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:paint-zoom-v515',
    'gannzilla:ring-two-numbering-refresh',
    'gannzilla:layout-panel-visibility-change',
  ].forEach((name) => window.addEventListener(name, () => schedule(name), false));

  window.addEventListener('resize', () => schedule('window-resize'), false);
  document.addEventListener('fullscreenchange', () => schedule('fullscreen-change'), false);
  timer = window.setInterval(() => schedule('owner-watch'), 250);

  window.GANNZILLA_WHEEL_TOP_BAND_OWNER_FIX_V650 = true;
  window.__auditGannzillaWheelTopBandOwnerFixV650 = () => {
    const elements = findOwnerElements();
    const amount = offsetPx();
    return {
      ok: enabled()
        && Boolean(elements)
        && elements.stage.dataset.gannzillaWheelTopBandOwnerFixV650 === 'true'
        && Number(elements.stage.dataset.gannzillaWheelTopBandPxV650) === amount,
      build: BUILD,
      owner: 'V305_VIEWPORT_AND_STAGE',
      removedBandPx: amount,
      wheelGeometryChanged: false,
      wheelSizeChanged: false,
      panTransformChanged: false,
      applyCount,
      observerActive: Boolean(observer),
      timerActive: Boolean(timer),
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule };
  schedule('install');
}

install();
