const BUILD = 647;
const STATE_KEY = '__gannzillaWheelTopClipAuthorityV647';
const PARAM = 'wheelTopClipAtToolbar';
const BOUNDARY_LINE_ID = 'gannzilla-thin-top-boundary-line-v642';
const PAN_STORAGE_KEY = 'gannzilla-wheel-asymmetric-open-pan-v305';

let frame = 0;
let resizeObserver = null;
let observedCanvas = null;
let observedViewport = null;
let cachedScan = null;
let applyCount = 0;
let scanCount = 0;
let lastApply = null;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function enabled() {
  const value = String(params().get(PARAM) || '').toLowerCase();
  return ['true', '1', 'yes', 'on'].includes(value);
}

function findCanvas() {
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

function findViewport(canvas) {
  if (!(canvas instanceof HTMLCanvasElement)) return null;
  const marked = canvas.closest('[data-gannzilla-asymmetric-open-pan-v305="true"]');
  if (marked instanceof HTMLElement) return marked;

  let node = canvas.parentElement;
  while (node instanceof HTMLElement) {
    const style = getComputedStyle(node);
    if (style.position === 'fixed' && style.overflow === 'hidden') return node;
    node = node.parentElement;
  }
  return null;
}

function readLogicalPan(canvas) {
  const fromDataset = {
    x: Number(canvas?.dataset?.gannzillaAsymmetricOpenX),
    y: Number(canvas?.dataset?.gannzillaAsymmetricOpenY),
  };
  if (Number.isFinite(fromDataset.x) && Number.isFinite(fromDataset.y)) return fromDataset;

  try {
    const stored = JSON.parse(localStorage.getItem(PAN_STORAGE_KEY) || '{}');
    return {
      x: Number.isFinite(Number(stored.x)) ? Number(stored.x) : 0,
      y: Number.isFinite(Number(stored.y)) ? Number(stored.y) : 0,
    };
  } catch (_) {
    return { x: 0, y: 0 };
  }
}

function visiblePixel(data, index) {
  const alpha = data[index + 3];
  if (alpha < 8) return false;
  return data[index] < 246 || data[index + 1] < 246 || data[index + 2] < 246;
}

function invalidateScan() {
  cachedScan = null;
}

function detectTopVisibleRow(canvas) {
  if (!(canvas instanceof HTMLCanvasElement) || canvas.width < 1 || canvas.height < 1) return 0;
  if (cachedScan
      && cachedScan.canvas === canvas
      && cachedScan.width === canvas.width
      && cachedScan.height === canvas.height) return cachedScan.row;

  let row = 0;
  try {
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return 0;

    const maxRows = Math.min(canvas.height, Math.max(1, Math.ceil(canvas.height * 0.45)));
    const image = context.getImageData(0, 0, canvas.width, maxRows);
    const xStep = Math.max(1, Math.floor(canvas.width / 1000));
    const sampledWidth = Math.ceil(canvas.width / xStep);
    const minimumSamples = Math.max(4, Math.ceil(sampledWidth * 0.003));

    outer:
    for (let y = 0; y < maxRows; y += 1) {
      let samples = 0;
      const rowStart = y * canvas.width * 4;
      for (let x = 0; x < canvas.width; x += xStep) {
        if (visiblePixel(image.data, rowStart + x * 4)) {
          samples += 1;
          if (samples >= minimumSamples) {
            row = y;
            break outer;
          }
        }
      }
    }
    scanCount += 1;
  } catch (_) {
    row = 0;
  }

  cachedScan = { canvas, width: canvas.width, height: canvas.height, row };
  return row;
}

function clipBoundary(viewport) {
  const line = document.getElementById(BOUNDARY_LINE_ID);
  const lineRect = line?.getBoundingClientRect?.();
  const viewportRect = viewport.getBoundingClientRect();
  if (lineRect && lineRect.height > 0) return Math.max(0, Math.round(lineRect.bottom - viewportRect.top));
  return 1;
}

function clearLegacyPresentationShifts(canvas) {
  const stage = canvas?.parentElement;
  if (!(stage instanceof HTMLElement)) return;
  stage.style.removeProperty('top');
  stage.style.removeProperty('translate');
  delete stage.dataset.gannzillaWhiteTopLayerCropV646;
  delete stage.dataset.gannzillaWhiteTopLayerPxV646;
  delete stage.dataset.gannzillaWheelClipShiftYV644;
  delete stage.dataset.gannzillaWheelClipShiftYV645;
}

function bindResizeObserver(canvas, viewport) {
  if (typeof ResizeObserver !== 'function') return;
  if (observedCanvas === canvas && observedViewport === viewport && resizeObserver) return;
  resizeObserver?.disconnect();
  observedCanvas = canvas;
  observedViewport = viewport;
  resizeObserver = new ResizeObserver(() => schedule('resize-observer'));
  resizeObserver.observe(canvas);
  resizeObserver.observe(viewport);
}

function apply(source = 'apply') {
  frame = 0;
  if (!enabled()) return false;

  const canvas = findCanvas();
  const viewport = findViewport(canvas);
  if (!(canvas instanceof HTMLCanvasElement) || !(viewport instanceof HTMLElement)) return false;

  clearLegacyPresentationShifts(canvas);

  const logicalPan = readLogicalPan(canvas);
  const canvasRect = canvas.getBoundingClientRect();
  const canvasHeight = Math.max(1, canvasRect.height);
  const viewportHeight = Math.max(1, viewport.clientHeight);
  const topRow = detectTopVisibleRow(canvas);
  const topContentOffset = topRow * canvasHeight / Math.max(1, canvas.height);
  const centeredCanvasTop = (viewportHeight - canvasHeight) / 2;
  const boundary = clipBoundary(viewport);
  const baseY = Math.round(boundary - centeredCanvasTop - topContentOffset);
  const visualY = Math.round(logicalPan.y + baseY);

  canvas.style.setProperty(
    'transform',
    `translate3d(${Math.round(logicalPan.x)}px, ${visualY}px, 0)`,
    'important',
  );
  canvas.dataset.gannzillaWheelTopClipAuthorityV647 = 'true';
  canvas.dataset.gannzillaTopVisibleRowV647 = String(topRow);
  canvas.dataset.gannzillaTopClipBaseYV647 = String(baseY);
  canvas.dataset.gannzillaTopClipVisualYV647 = String(visualY);

  const preview = document.getElementById('gannzilla-fixed-paint-preview-v512');
  if (preview instanceof HTMLImageElement && getComputedStyle(preview).display !== 'none') {
    preview.style.setProperty(
      'transform',
      `translate3d(${Math.round(logicalPan.x)}px, ${visualY}px, 0)`,
      'important',
    );
  }

  bindResizeObserver(canvas, viewport);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    topRow,
    topContentOffset,
    centeredCanvasTop,
    boundary,
    baseY,
    logicalPan,
    visualY,
    wheelGeometryChanged: false,
    wheelSizeChanged: false,
    storedPanChanged: false,
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

  [0, 50, 140, 320, 700, 1500, 3200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  [
    'gannzilla:wheel-pan-offset-v305',
    'gannzilla:page-scrollbar-pan-v305',
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:zodiac-outer-ring-v522',
    'gannzilla:weekdays-outer-ring-v523',
    'gannzilla:metallic-angle-outer-ring-v531',
    'gannzilla:paint-zoom-v515',
    'gannzilla:ring-two-numbering-refresh',
  ].forEach((name) => window.addEventListener(name, () => {
    if (name !== 'gannzilla:wheel-pan-offset-v305' && name !== 'gannzilla:page-scrollbar-pan-v305') invalidateScan();
    schedule(name);
  }, false));

  window.addEventListener('resize', () => schedule('window-resize'), false);
  document.addEventListener('fullscreenchange', () => schedule('fullscreen-change'), false);

  window.GANNZILLA_WHEEL_TOP_CLIP_AUTHORITY_V647 = true;
  window.__auditGannzillaWheelTopClipAuthorityV647 = () => {
    const canvas = findCanvas();
    return {
      ok: enabled()
        && canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaWheelTopClipAuthorityV647 === 'true',
      build: BUILD,
      wheelGeometryChanged: false,
      wheelSizeChanged: false,
      storedPanChanged: false,
      applyCount,
      scanCount,
      resizeObserverActive: Boolean(resizeObserver),
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, invalidateScan, detectTopVisibleRow };
  schedule('install');
}

install();
