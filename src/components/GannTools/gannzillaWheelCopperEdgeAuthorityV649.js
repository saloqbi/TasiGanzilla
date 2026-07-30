const BUILD = 649;
const STATE_KEY = '__gannzillaWheelCopperEdgeAuthorityV649';
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
let lastLogicalPan = null;
let lastApply = null;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function enabled() {
  const value = String(params().get(PARAM) || '').toLowerCase();
  return ['true', '1', 'yes', 'on'].includes(value);
}

function visibleElement(element) {
  if (!(element instanceof HTMLElement)) return false;
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return style.display !== 'none'
    && style.visibility !== 'hidden'
    && Number(style.opacity || 0) > 0.01
    && rect.width > 250
    && rect.height > 250;
}

function findViewportAndCanvas() {
  const viewports = Array.from(document.querySelectorAll('[data-gannzilla-asymmetric-open-pan-v305="true"]'))
    .filter((node) => node instanceof HTMLElement && visibleElement(node));

  for (const viewport of viewports) {
    const canvases = Array.from(viewport.querySelectorAll('canvas'))
      .filter((canvas) => canvas instanceof HTMLCanvasElement
        && !canvas.closest('aside')
        && canvas.id !== 'gannzilla-top-center-drawing-overlay-v471'
        && visibleElement(canvas))
      .sort((a, b) => {
        const az = Number.parseInt(getComputedStyle(a).zIndex, 10) || 0;
        const bz = Number.parseInt(getComputedStyle(b).zIndex, 10) || 0;
        if (az !== bz) return bz - az;
        return (b.getBoundingClientRect().width * b.getBoundingClientRect().height)
          - (a.getBoundingClientRect().width * a.getBoundingClientRect().height);
      });
    if (canvases[0]) return { viewport, canvas: canvases[0] };
  }

  return null;
}

function readLogicalPan(canvas, detail = null) {
  const fromDetail = {
    x: Number(detail?.x),
    y: Number(detail?.y),
  };
  if (Number.isFinite(fromDetail.x) && Number.isFinite(fromDetail.y)) return fromDetail;

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

    const maxRows = Math.min(canvas.height, Math.max(1, Math.ceil(canvas.height * 0.55)));
    const image = context.getImageData(0, 0, canvas.width, maxRows);
    const xStart = Math.floor(canvas.width * 0.10);
    const xEnd = Math.ceil(canvas.width * 0.90);
    const xStep = Math.max(1, Math.floor(canvas.width / 1800));
    const sampledWidth = Math.max(1, Math.ceil((xEnd - xStart) / xStep));
    const minimumSamples = Math.max(6, Math.ceil(sampledWidth * 0.0035));
    const minimumRun = Math.max(5, Math.ceil(sampledWidth * 0.003));

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

function transformXY(element) {
  if (!(element instanceof HTMLElement)) return { x: 0, y: 0 };
  const value = getComputedStyle(element).transform;
  if (!value || value === 'none') return { x: 0, y: 0 };
  try {
    const matrix = new DOMMatrixReadOnly(value);
    return { x: Number(matrix.m41) || 0, y: Number(matrix.m42) || 0 };
  } catch (_) {
    return { x: 0, y: 0 };
  }
}

function boundaryBottom() {
  const line = document.getElementById(BOUNDARY_LINE_ID);
  const rect = line?.getBoundingClientRect?.();
  return rect && rect.height > 0 ? Math.round(rect.bottom) : 25;
}

function setTransform(element, x, y) {
  if (!(element instanceof HTMLElement)) return false;
  const value = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
  if (element.style.getPropertyValue('transform') === value
      && element.style.getPropertyPriority('transform') === 'important') return false;
  element.style.setProperty('transform', value, 'important');
  return true;
}

function bindObserver(canvas) {
  if (!(canvas instanceof HTMLCanvasElement) || observedCanvas === canvas) return;
  observer?.disconnect();
  observedCanvas = canvas;
  observer = new MutationObserver(() => {
    if (!applying) schedule('visible-canvas-style-overwrite');
  });
  observer.observe(canvas, { attributes: true, attributeFilter: ['style', 'width', 'height'] });
}

function apply(source = 'apply', detail = null) {
  frame = 0;
  if (!enabled() || applying) return false;

  const elements = findViewportAndCanvas();
  if (!elements) return false;
  const { viewport, canvas } = elements;

  const logicalPan = readLogicalPan(canvas, detail || lastLogicalPan);
  lastLogicalPan = logicalPan;

  const rect = canvas.getBoundingClientRect();
  const transform = transformXY(canvas);
  const displayHeight = Math.max(1, rect.height);
  const copperRow = detectCopperTopRow(canvas);
  const copperOffset = copperRow * displayHeight / Math.max(1, canvas.height);
  const layoutTopWithoutTransform = rect.top - transform.y;
  const boundary = boundaryBottom();
  const baseY = Math.round(boundary - layoutTopWithoutTransform - copperOffset);
  const visualY = Math.round(baseY + logicalPan.y);

  applying = true;
  try {
    setTransform(canvas, logicalPan.x, visualY);
    canvas.dataset.gannzillaWheelCopperEdgeAuthorityV649 = 'true';
    canvas.dataset.gannzillaVisibleCopperTopRowV649 = String(copperRow);
    canvas.dataset.gannzillaCopperBaseYV649 = String(baseY);
    canvas.dataset.gannzillaCopperVisualYV649 = String(visualY);

    const preview = document.getElementById(PREVIEW_ID);
    if (preview instanceof HTMLImageElement && visibleElement(preview)) {
      setTransform(preview, logicalPan.x, visualY);
    }
  } finally {
    applying = false;
  }

  bindObserver(canvas);
  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    viewportMarkedByV305: viewport.dataset.gannzillaAsymmetricOpenPanV305 === 'true',
    visibleCanvasSelected: true,
    copperRow,
    copperOffset,
    boundary,
    layoutTopWithoutTransform,
    previousTransform: transform,
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

function schedule(source = 'schedule', detail = null) {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => apply(source, detail));
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  const onPan = (event) => schedule(event.type, event?.detail || null);
  window.addEventListener('gannzilla:wheel-pan-offset-v305', onPan, false);

  [0, 60, 160, 360, 800, 1600, 3200, 6400].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  [
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:zodiac-outer-ring-v522',
    'gannzilla:weekdays-outer-ring-v523',
    'gannzilla:metallic-angle-outer-ring-v531',
    'gannzilla:paint-zoom-v515',
    'gannzilla:ring-two-numbering-refresh',
  ].forEach((name) => window.addEventListener(name, () => {
    invalidateScan();
    schedule(name);
  }, false));

  window.addEventListener('resize', () => schedule('window-resize'), false);
  document.addEventListener('fullscreenchange', () => schedule('fullscreen-change'), false);
  timer = window.setInterval(() => schedule('visible-copper-edge-watch'), 300);

  window.GANNZILLA_WHEEL_COPPER_EDGE_AUTHORITY_V649 = true;
  window.__auditGannzillaWheelCopperEdgeAuthorityV649 = () => {
    const elements = findViewportAndCanvas();
    return {
      ok: enabled()
        && Boolean(elements)
        && elements.canvas.dataset.gannzillaWheelCopperEdgeAuthorityV649 === 'true',
      build: BUILD,
      selectedOnlyVisibleCanvas: true,
      directAbsoluteEdgeAlignment: true,
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