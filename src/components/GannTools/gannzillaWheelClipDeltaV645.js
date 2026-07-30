const BUILD = 645;
const STATE_KEY = '__gannzillaWheelClipDeltaV645';
const PARAM = 'alignWheelTopToToolbar';
const PREVIEW_ID = 'gannzilla-fixed-paint-preview-v512';
const BOUNDARY_LINE_ID = 'gannzilla-thin-top-boundary-line-v642';
const SHIFT_DATA_KEY = 'gannzillaWheelClipShiftYV645';

let frame = 0;
let timer = 0;
let observer = null;
let applying = false;
let scanCount = 0;
let applyCount = 0;
let cachedCopperScan = null;
let lastApply = null;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function enabled() {
  const value = String(params().get(PARAM) || '').toLowerCase();
  return ['true', '1', 'yes', 'on'].includes(value);
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

function findElements() {
  const source = findSourceCanvas();
  const preview = document.getElementById(PREVIEW_ID);
  const stage = source?.parentElement;
  if (!(source instanceof HTMLCanvasElement)
      || !(preview instanceof HTMLImageElement)
      || !(stage instanceof HTMLElement)) return null;
  return { source, preview, stage };
}

function copperPixel(red, green, blue, alpha) {
  if (alpha < 16) return false;
  const darkCopper = red >= 45
    && red > green + 14
    && red > blue + 30
    && green >= blue - 4;
  const lightCopper = red >= 145
    && green >= 50
    && red > green + 14
    && red > blue + 24;
  return darkCopper || lightCopper;
}

function invalidateScan() {
  cachedCopperScan = null;
}

function detectCopperTopRow(source) {
  if (!(source instanceof HTMLCanvasElement) || source.width < 1 || source.height < 1) return 0;
  if (cachedCopperScan
      && cachedCopperScan.source === source
      && cachedCopperScan.width === source.width
      && cachedCopperScan.height === source.height) return cachedCopperScan.row;

  let row = 0;
  try {
    const context = source.getContext('2d', { willReadFrequently: true });
    if (!context) return 0;

    const maxRows = Math.min(source.height, Math.max(1, Math.ceil(source.height * 0.52)));
    const image = context.getImageData(0, 0, source.width, maxRows);
    const xStep = Math.max(1, Math.floor(source.width / 1280));
    const sampledWidth = Math.ceil(source.width / xStep);
    const minimumCopperSamples = Math.max(10, Math.ceil(sampledWidth * 0.008));
    const minimumRun = Math.max(10, Math.ceil(sampledWidth * 0.012));

    outer:
    for (let y = 0; y < maxRows; y += 1) {
      let copperSamples = 0;
      let currentRun = 0;
      let longestRun = 0;
      const rowStart = y * source.width * 4;

      for (let x = 0; x < source.width; x += xStep) {
        const index = rowStart + x * 4;
        if (copperPixel(
          image.data[index],
          image.data[index + 1],
          image.data[index + 2],
          image.data[index + 3],
        )) {
          copperSamples += 1;
          currentRun += 1;
          longestRun = Math.max(longestRun, currentRun);
        } else {
          currentRun = 0;
        }
      }

      if (copperSamples >= minimumCopperSamples && longestRun >= minimumRun) {
        row = Math.max(0, y - 1);
        break outer;
      }
    }
    scanCount += 1;
  } catch (_) {
    row = 0;
  }

  cachedCopperScan = {
    source,
    width: source.width,
    height: source.height,
    row,
  };
  return row;
}

function boundaryBottom() {
  const line = document.getElementById(BOUNDARY_LINE_ID);
  const rect = line?.getBoundingClientRect?.();
  if (rect && rect.height > 0) return Math.round(rect.bottom);
  return 25;
}

function currentShift(stage) {
  const value = Number(stage?.dataset?.[SHIFT_DATA_KEY]);
  return Number.isFinite(value) ? value : 0;
}

function setShift(stage, value) {
  if (!(stage instanceof HTMLElement)) return false;
  const rounded = Math.max(-480, Math.min(480, Math.round(value)));
  stage.style.setProperty('translate', `0px ${rounded}px`, 'important');
  stage.dataset[SHIFT_DATA_KEY] = String(rounded);
  stage.dataset.gannzillaWheelClipDeltaV645 = 'true';
  return true;
}

function apply(sourceName = 'apply') {
  frame = 0;
  if (!enabled() || applying) return false;
  const elements = findElements();
  if (!elements) return false;

  const { source, preview, stage } = elements;
  const previewRect = preview.getBoundingClientRect();
  if (!(previewRect.width > 0 && previewRect.height > 0)) return false;

  const copperRow = detectCopperTopRow(source);
  const copperOffsetPx = copperRow * previewRect.height / Math.max(1, source.height);
  const copperTop = previewRect.top + copperOffsetPx;
  const boundary = boundaryBottom();
  const delta = Math.round(boundary - copperTop);
  const previousShift = currentShift(stage);
  const nextShift = previousShift + delta;

  applying = true;
  try {
    setShift(stage, nextShift);
    preview.dataset.gannzillaCopperTopRowV645 = String(copperRow);
    preview.dataset.gannzillaCopperOffsetPxV645 = String(Math.round(copperOffsetPx));
    preview.dataset.gannzillaClipBoundaryYV645 = String(boundary);
    preview.dataset.gannzillaCopperTopYV645 = String(Math.round(copperTop));
    preview.dataset.gannzillaClipDeltaYV645 = String(delta);
    preview.dataset.gannzillaStageShiftYV645 = String(Math.round(nextShift));
  } finally {
    applying = false;
  }

  applyCount += 1;
  lastApply = {
    source: sourceName,
    build: BUILD,
    copperRow,
    copperOffsetPx,
    copperTop,
    boundary,
    delta,
    previousShift,
    nextShift,
    wheelGeometryChanged: false,
    wheelSizeChanged: false,
    userPanChanged: false,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule') {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => apply(source));
}

function installObserver() {
  if (typeof MutationObserver !== 'function' || observer) return false;
  observer = new MutationObserver((records) => {
    if (applying) return;
    if (records.some((record) => record.addedNodes.length || record.removedNodes.length)) {
      schedule('dom-change');
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  return true;
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  [0, 50, 140, 320, 700, 1400, 2800, 5600].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  [
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:ring-two-numbering-refresh',
    'gannzilla:fixed-paint-preview-v512',
    'gannzilla:paint-zoom-v515',
  ].forEach((name) => window.addEventListener(name, () => {
    invalidateScan();
    schedule(name);
  }, false));

  window.addEventListener('resize', () => schedule('window-resize'), false);
  document.addEventListener('fullscreenchange', () => schedule('fullscreen-change'), false);

  installObserver();
  timer = window.setInterval(() => schedule('clip-delta-watch'), 700);

  window.GANNZILLA_WHEEL_CLIP_DELTA_V645 = true;
  window.__auditGannzillaWheelClipDeltaV645 = () => {
    const elements = findElements();
    const shift = elements ? currentShift(elements.stage) : null;
    return {
      ok: enabled()
        && Boolean(elements)
        && Number.isFinite(shift)
        && elements.stage.dataset.gannzillaWheelClipDeltaV645 === 'true',
      build: BUILD,
      wheelGeometryChanged: false,
      wheelSizeChanged: false,
      userPanChanged: false,
      shift,
      scanCount,
      applyCount,
      timerActive: Boolean(timer),
      observerActive: Boolean(observer),
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, invalidateScan, detectCopperTopRow };
  schedule('install');
}

install();
