const BUILD = 646;
const STATE_KEY = '__gannzillaWhiteTopLayerCropV646';
const PARAM = 'hideWhiteTopLayer';
const OFFSET_PARAM = 'whiteTopLayerPx';
const PREVIEW_ID = 'gannzilla-fixed-paint-preview-v512';
const DEFAULT_OFFSET_PX = 52;

let frame = 0;
let timer = 0;
let observer = null;
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
  if (!Number.isFinite(value)) return DEFAULT_OFFSET_PX;
  return Math.max(0, Math.min(160, Math.round(value)));
}

function findSourceCanvas() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-empty-outer-ring-v518="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v506="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v491="true"]',
    'canvas[data-gannzilla-keyboard-mouse-control-v459="true"]',
  ].join(','));
  if (preferred instanceof HTMLCanvasElement && !preferred.closest('aside')) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => canvas instanceof HTMLCanvasElement
      && !canvas.closest('aside')
      && canvas.id !== 'gannzilla-top-center-drawing-overlay-v471'
      && canvas.width > 300
      && canvas.height > 300)
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

function findViewport(stage) {
  if (!(stage instanceof HTMLElement)) return null;
  let node = stage.parentElement;
  while (node instanceof HTMLElement && node.parentElement instanceof HTMLElement) {
    const style = getComputedStyle(node);
    if (style.position === 'fixed' && style.overflow === 'hidden') return node;
    node = node.parentElement;
  }
  return stage.parentElement instanceof HTMLElement ? stage.parentElement : null;
}

function clearLegacyStageShifts(stage) {
  if (!(stage instanceof HTMLElement)) return;
  stage.style.removeProperty('translate');
  delete stage.dataset.gannzillaWheelClipShiftYV644;
  delete stage.dataset.gannzillaWheelClipShiftYV645;
  delete stage.dataset.gannzillaWheelClipBaselineV644;
  delete stage.dataset.gannzillaWheelClipDeltaV645;
}

function apply(sourceName = 'apply') {
  frame = 0;
  if (!enabled() || applying) return false;

  const source = findSourceCanvas();
  const preview = document.getElementById(PREVIEW_ID);
  const stage = source?.parentElement;
  if (!(source instanceof HTMLCanvasElement) || !(stage instanceof HTMLElement)) return false;

  const viewport = findViewport(stage);
  const amount = offsetPx();

  applying = true;
  try {
    clearLegacyStageShifts(stage);

    stage.style.setProperty('position', 'relative', 'important');
    stage.style.setProperty('top', `${-amount}px`, 'important');
    stage.style.setProperty('margin-top', '0', 'important');
    stage.style.setProperty('padding-top', '0', 'important');
    stage.dataset.gannzillaWhiteTopLayerCropV646 = 'true';
    stage.dataset.gannzillaWhiteTopLayerPxV646 = String(amount);

    if (viewport instanceof HTMLElement) {
      viewport.style.setProperty('overflow', 'hidden', 'important');
      viewport.style.setProperty('padding-top', '0', 'important');
      viewport.style.setProperty('margin-top', '0', 'important');
      viewport.dataset.gannzillaWhiteTopLayerViewportV646 = 'true';
    }

    source.style.setProperty('margin-top', '0', 'important');
    source.style.setProperty('padding-top', '0', 'important');

    if (preview instanceof HTMLImageElement) {
      preview.style.setProperty('margin-top', '0', 'important');
      preview.style.setProperty('padding-top', '0', 'important');
      preview.style.setProperty('background', 'transparent', 'important');
    }
  } finally {
    applying = false;
  }

  applyCount += 1;
  lastApply = {
    source: sourceName,
    build: BUILD,
    hiddenWhiteLayerPx: amount,
    presentationLayerOnly: true,
    wheelGeometryChanged: false,
    wheelSizeChanged: false,
    userPanChanged: false,
    previewPresent: preview instanceof HTMLImageElement,
    viewportFound: viewport instanceof HTMLElement,
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

  [0, 40, 120, 300, 700, 1500, 3200, 6400].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  if (typeof MutationObserver === 'function') {
    observer = new MutationObserver((records) => {
      if (applying) return;
      if (records.some((record) => record.addedNodes.length || record.removedNodes.length)) {
        schedule('dom-change');
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  [
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:fixed-paint-preview-v512',
    'gannzilla:paint-zoom-v515',
    'gannzilla:page-scrollbar-pan-v305',
    'gannzilla:wheel-pan-offset-v305',
  ].forEach((name) => window.addEventListener(name, () => schedule(name), false));

  window.addEventListener('resize', () => schedule('window-resize'), false);
  document.addEventListener('fullscreenchange', () => schedule('fullscreen-change'), false);
  timer = window.setInterval(() => schedule('white-layer-watch'), 500);

  window.GANNZILLA_WHITE_TOP_LAYER_CROP_V646 = true;
  window.__auditGannzillaWhiteTopLayerCropV646 = () => {
    const source = findSourceCanvas();
    const stage = source?.parentElement;
    return {
      ok: enabled()
        && stage instanceof HTMLElement
        && stage.dataset.gannzillaWhiteTopLayerCropV646 === 'true'
        && Number(stage.dataset.gannzillaWhiteTopLayerPxV646) === offsetPx(),
      build: BUILD,
      hiddenWhiteLayerPx: offsetPx(),
      presentationLayerOnly: true,
      wheelGeometryChanged: false,
      wheelSizeChanged: false,
      userPanChanged: false,
      applyCount,
      timerActive: Boolean(timer),
      observerActive: Boolean(observer),
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule };
  schedule('install');
}

install();
