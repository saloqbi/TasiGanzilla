const BUILD = 632;
const STATE_KEY = '__gannzillaPaintPreviewVisibilityFailSafeV632';
const PREVIEW_ID = 'gannzilla-fixed-paint-preview-v512';
const V515_STATE_KEY = '__gannzillaUnifiedPaintPreviewZoomV515';

let timer = 0;
let applyCount = 0;
let lastApply = null;
let boundPreview = null;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function enabled() {
  const query = params();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  const previewMode = !['false', '0', 'off', 'no'].includes(
    String(query.get('paintPreview') || 'true').toLowerCase(),
  );
  return wheelMode && previewMode;
}

function findSourceCanvas() {
  const preferred = document.querySelector([
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

function setImportant(element, property, value) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.style.getPropertyValue(property) === value
      && element.style.getPropertyPriority(property) === 'important') return false;
  element.style.setProperty(property, value, 'important');
  return true;
}

function disconnectV515SourceObserver() {
  try {
    const sourceObserver = window[V515_STATE_KEY]?.sourceObserver;
    if (sourceObserver && typeof sourceObserver.disconnect === 'function') {
      sourceObserver.disconnect();
      return true;
    }
  } catch (_) {
    // The fail-safe still works by reasserting visibility.
  }
  return false;
}

function previewIsReady(preview) {
  return preview instanceof HTMLImageElement
    && Boolean(preview.src)
    && preview.complete
    && preview.naturalWidth > 0
    && preview.naturalHeight > 0;
}

function bindPreviewEvents(preview) {
  if (!(preview instanceof HTMLImageElement) || boundPreview === preview) return false;
  boundPreview = preview;
  preview.addEventListener('load', () => apply('preview-load'), false);
  preview.addEventListener('error', () => apply('preview-error'), false);
  return true;
}

function apply(source = 'apply') {
  if (!enabled()) return false;

  const observerDisconnected = disconnectV515SourceObserver();
  const canvas = findSourceCanvas();
  const preview = document.getElementById(PREVIEW_ID);
  if (!(canvas instanceof HTMLCanvasElement)) return false;

  bindPreviewEvents(preview);
  const ready = previewIsReady(preview);

  // Never leave the wheel blank: use the live source canvas until the bitmap preview is valid.
  setImportant(canvas, 'display', 'block');
  setImportant(canvas, 'visibility', 'visible');
  setImportant(canvas, 'opacity', ready ? '0' : '1');

  if (preview instanceof HTMLImageElement) {
    setImportant(preview, 'display', 'block');
    setImportant(preview, 'visibility', ready ? 'visible' : 'hidden');
    setImportant(preview, 'opacity', ready ? '1' : '0');
  }

  canvas.dataset.gannzillaPaintPreviewVisibilityFailSafeV632 = 'true';
  canvas.dataset.gannzillaPaintPreviewReadyV632 = String(ready);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    previewReady: ready,
    sourceVisible: !ready,
    previewVisible: ready,
    observerDisconnected,
    sourceOpacity: getComputedStyle(canvas).opacity,
    previewOpacity: preview instanceof HTMLElement ? getComputedStyle(preview).opacity : null,
    at: Date.now(),
  };
  return true;
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  [0, 60, 140, 320, 700, 1500, 3200, 6500].forEach((delay) => {
    window.setTimeout(() => apply(`boot-${delay}`), delay);
  });

  [
    'gannzilla:paint-zoom-v515',
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:wheel-pan-offset-v305',
    'gannzilla:page-scrollbar-pan-v305',
  ].forEach((name) => window.addEventListener(name, () => apply(name), false));

  window.addEventListener('resize', () => apply('window-resize'), false);
  timer = window.setInterval(() => apply('visibility-watch'), 500);

  window.GANNZILLA_PAINT_PREVIEW_VISIBILITY_FAIL_SAFE_V632 = true;
  window.__auditGannzillaPaintPreviewVisibilityFailSafeV632 = () => {
    const canvas = findSourceCanvas();
    const preview = document.getElementById(PREVIEW_ID);
    const ready = previewIsReady(preview);
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaPaintPreviewVisibilityFailSafeV632 === 'true'
        && (ready
          ? getComputedStyle(preview).opacity === '1'
          : getComputedStyle(canvas).opacity === '1'),
      build: BUILD,
      previewReady: ready,
      fallbackCanvasVisible: !ready,
      timerActive: Boolean(timer),
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, previewIsReady, disconnectV515SourceObserver };
  apply('install');
}

install();
