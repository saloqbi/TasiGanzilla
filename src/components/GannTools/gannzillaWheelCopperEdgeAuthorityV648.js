const BUILD = 648;
const STATE_KEY = '__gannzillaWheelCopperEdgeAuthorityV648';
const PARAM = 'wheelCopperEdgeAtToolbar';
const BOUNDARY_LINE_ID = 'gannzilla-thin-top-boundary-line-v642';
const PAN_STORAGE_KEY = 'gannzilla-wheel-asymmetric-open-pan-v305';
const PREVIEW_ID = 'gannzilla-fixed-paint-preview-v512';

let frame = 0;
let timer = 0;
let observer = null;
let observedCanvas = null;
let applying = false;
let cachedScan = null;
let scanCount = 0;
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
  const x = Number(canvas?.dataset?.gannzillaAsymmetricOpenX);
  const y = Number(canvas?.dataset?.gannzillaAsymmetricOpenY);
  if (Number.isFinite(x) && Number.isFinite(y)) return { x, y };

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

function isCopperPixel(red, green, blue, alpha) {
  if (alpha < 12) return false;

  const darkCopper = red >= 44
    && red > green + 12
    && red > blue + 24
    && green >= blue - 6;

  const brightCopper = red >= 130
    && green >= 42
    && red > green + 12
    && red > blue + 20
    && green > blue - 18;

  return darkCopper || brightCopper;
}

function invalidateScan() {
  cachedScan = null;
}

function detectCopperTopRow(canvas) {
  if (!(canvas instanceof HTMLCanvasElement) || canvas.width < 1 || canvas.height < 1) return 0;
  if (cachedScan
      && cachedScan.canvas === canvas
      && cachedScan.width === canvas.width
      && cachedScan.height === canvas.height) return cachedScan.row;

  let row = 0;
  try {
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return 0;

    const maxRows = Math.min(canvas.height, Math.max(1, Math.ceil(canvas.height * 0.52)));
    const image = context.getImageData(0, 0, canvas.width, maxRows);
    const xStart = Math.floor(canvas.width * 0.12);
    const xEnd = Math.ceil(canvas.width * 0.88);
    const xStep = Math.max(1, Math.floor(canvas.width / 1600));
    const sampledWidth = Math.max(1, Math.ceil((xEnd - xStart) / xStep));
    const minimumSamples = Math.max(5, Math.ceil(sampledWidth * 0.003));
    const minimumRun = Math.max(4, Math.ceil(sampledWidth * 0.0025));

    outer:
    for (let y = 0; y < maxRows; y += 1) {
      let samples = 0;
      let run = 0;
      let longestRun = 0;
      const rowStart = y * canvas.width * 4;

      for (let x = xStart; x < xEnd; x += xStep) {
        const index = rowStart + x * 4;
        if (isCopperPixel(
          image.data[index],
          image.data[index + 1],
          image.data[index + 2],
          image.data[index + 3],
        )) {
          samples += 1;
          run += 1;
          longestRun = Math.max(longestRun, run);
        } else {
          run = 0;
        }
      }

      if (samples >= minimumSamples && longestRun >= minimumRun) {
        row = Math.max(0, y - 1);
        break outer;
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
  if (lineRect && lineRect.height > 0) {
    return Math.max(0, Math.round(lineRect.bottom - viewportRect.top));
  }
  return 1;
}

function clearLegacyStageShifts(canvas) {
  const stage = canvas?.parentElement;
  if (!(stage instanceof HTMLElement)) return;
  stage.style.removeProperty('top');
  stage.style.removeProperty('translate');
  delete stage.dataset.gannzillaWhiteTopLayerCropV646;
  delete stage.dataset.gannzillaWhiteTopLayerPxV646;
  delete stage.dataset.gannzillaWheelClipShiftYV644;
  delete stage.dataset.gannzillaWheelClipShiftYV645;
}

function setTransform(element, x, y) {
  if (!(element instanceof HTMLElement)) return false;
  const value = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
  if (element.style.getPropertyValue('transform') === value
      && element.style.getPropertyPriority('transform') === 'important') return false;
  element.style.setProperty('transform', value, 'important');
  return true;
}

function bindCanvasObserver(canvas) {
  if (!(canvas instanceof HTMLCanvasElement) || observedCanvas === canvas) return;
  observer?.disconnect();
  observedCanvas = canvas;
  observer = new MutationObserver((records) => {
    if (applying) return;
    if (records.some((record) => record.type === 'attributes')) schedule('canvas-style-overwrite');
  });
  observer.observe(canvas, { attributes: true, attributeFilter: ['style', 'width', 'height'] });
}

function apply(source = 'apply') {
  frame = 0;
  if (!enabled() || applying) return false;

  const canvas = findCanvas();
  const viewport = findViewport(canvas);
  if (!(canvas instanceof HTMLCanvasElement) || !(viewport instanceof HTMLElement)) return false;

  clearLegacyStageShifts(canvas);

  const logicalPan = readLogicalPan(canvas);
  const canvasRect = canvas.getBoundingClientRect();
  const canvasHeight = Math.max(1, canvas.offsetHeight || canvasRect.height);
  const viewportHeight = Math.max(1, viewport.clientHeight);
  const copperRow = detectCopperTopRow(canvas);
  const copperOffset = copperRow * canvasHeight / Math.max(1, canvas.height);
  const centeredTop = (viewportHeight - canvasHeight) / 2;
  const boundary = clipBoundary(viewport);
  const baseY = Math.round(boundary - centeredTop - copperOffset);
  const visualY = Math.round(logicalPan.y + baseY);

  applying = true;
  try {
    setTransform(canvas, logicalPan.x, visualY);
    canvas.dataset.gannzillaWheelCopperEdgeAuthorityV648 = 'true';
    canvas.dataset.gannzillaCopperTopRowV648 = String(copperRow);
    canvas.dataset.gannzillaCopperOffsetPxV648 = String(Math.round(copperOffset));
    canvas.dataset.gannzillaCopperClipBaseYV648 = String(baseY);
    canvas.dataset.gannzillaCopperClipVisualYV648 = String(visualY);

    const preview = document.getElementById(PREVIEW_ID);
    if (preview instanceof HTMLImageElement && getComputedStyle(preview).display !== 'none') {
      setTransform(preview, logicalPan.x, visualY);
    }
  } finally {
    applying = false;
  }

  bindCanvasObserver(canvas);
  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    copperRow,
    copperOffset,
    centeredTop,
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
  frame = requestAnimationFrame(() => {
    frame = requestAnimationFrame(() => apply(source));
  });
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  [0, 60, 160, 360, 800, 1600, 3200, 6400].forEach((delay) => {
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
    if (!name.includes('pan')) invalidateScan();
    schedule(name);
  }, false));

  window.addEventListener('resize', () => schedule('window-resize'), false);
  document.addEventListener('fullscreenchange', () => schedule('fullscreen-change'), false);
  timer = window.setInterval(() => schedule('copper-edge-watch'), 300);

  window.GANNZILLA_WHEEL_COPPER_EDGE_AUTHORITY_V648 = true;
  window.__auditGannzillaWheelCopperEdgeAuthorityV648 = () => {
    const canvas = findCanvas();
    return {
      ok: enabled()
        && canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaWheelCopperEdgeAuthorityV648 === 'true',
      build: BUILD,
      wheelGeometryChanged: false,
      wheelSizeChanged: false,
      storedPanChanged: false,
      scanCount,
      applyCount,
      observerActive: Boolean(observer),
      timerActive: Boolean(timer),
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, invalidateScan, detectCopperTopRow };
  schedule('install');
}

install();