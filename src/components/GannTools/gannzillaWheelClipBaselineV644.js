const BUILD = 644;
const STATE_KEY = '__gannzillaWheelClipBaselineV644';
const PARAM = 'alignWheelTopToToolbar';
const PREVIEW_ID = 'gannzilla-fixed-paint-preview-v512';
const BOUNDARY_LINE_ID = 'gannzilla-thin-top-boundary-line-v642';
const STAGE_SHIFT_DATASET = 'gannzillaWheelClipShiftYV644';

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

  // Copper frame palette ranges from dark brown through orange and pale copper.
  const darkCopper = red >= 48
    && red > green + 12
    && green >= blue
    && red > blue + 28;
  const lightCopper = red >= 150
    && green >= 55
    && red > green + 15
    && red > blue + 22
    && green > blue - 12;

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

    const maxRows = Math.min(source.height, Math.max(1, Math.ceil(source.height * 0.48)));
    const image = context.getImageData(0, 0, source.width, maxRows);
    const xStep = Math.max(1, Math.floor(source.width / 1280));
    const minimumCopperSamples = Math.max(2, Math.ceil((source.width / xStep) * 0.0012));

    outer:
    for (let y = 0; y < maxRows; y += 1) {
      let copperSamples = 0;
      let longestRun = 0;
      let currentRun = 0;
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

      if (copperSamples >= minimumCopperSamples && longestRun >= 2) {
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

function transformY(element) {
  if (!(element instanceof HTMLElement)) return 0;
  const value = getComputedStyle(element).transform;
  if (!value || value === 'none') return 0;
  try {
    return Number(new DOMMatrixReadOnly(value).m42) || 0;
  } catch (_) {
    const match = value.match(/^matrix\([^,]+,[^,]+,[^,]+,[^,]+,[^,]+,\s*([^)]+)\)$/);
    return match ? Number(match[1]) || 0 : 0;
  }
}

function boundaryBottom() {
  const line = document.getElementById(BOUNDARY_LINE_ID);
  const lineRect = line?.getBoundingClientRect?.();
  if (lineRect && lineRect.height > 0) return Math.round(lineRect.bottom);

  const controls = [
    'gannzilla-unified-wheel-tools-v453',
    'gannzilla-top-center-drawing-trigger-v471',
    'gannzilla-wheel-color-toggle-v511',
    'gannzilla-connection-control-v439',
    'gannzilla-right-language-control-v438',
  ].map((id) => document.getElementById(id))
    .filter((element) => element instanceof HTMLElement);

  return Math.round(Math.max(25, ...controls.map((element) => element.getBoundingClientRect().bottom)));
}

function currentStageShift(stage) {
  const value = Number(stage?.dataset?.[STAGE_SHIFT_DATASET]);
  return Number.isFinite(value) ? value : 0;
}

function setStageShift(stage, shift) {
  if (!(stage instanceof HTMLElement)) return false;
  const rounded = Math.round(shift);
  stage.style.setProperty('translate', `0px ${rounded}px`, 'important');
  stage.dataset[STAGE_SHIFT_DATASET] = String(rounded);
  stage.dataset.gannzillaWheelClipBaselineV644 = 'true';
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
  const previousStageShift = currentStageShift(stage);
  const previewPanY = transformY(preview);
  const currentCopperTop = previewRect.top + copperOffsetPx;

  // Remove both the current stage shift and the user's preview pan to recover
  // the stable zero-pan copper edge. Then align that edge to the clip boundary.
  const zeroPanCopperTop = currentCopperTop - previousStageShift - previewPanY;
  const boundary = boundaryBottom();
  const targetStageShift = Math.max(-480, Math.min(480, Math.round(boundary - zeroPanCopperTop)));

  applying = true;
  try {
    setStageShift(stage, targetStageShift);
    preview.dataset.gannzillaCopperTopRowV644 = String(copperRow);
    preview.dataset.gannzillaCopperOffsetPxV644 = String(Math.round(copperOffsetPx));
    preview.dataset.gannzillaClipBoundaryYV644 = String(boundary);
    preview.dataset.gannzillaZeroPanCopperTopV644 = String(Math.round(zeroPanCopperTop));
    preview.dataset.gannzillaStageShiftYV644 = String(targetStageShift);
  } finally {
    applying = false;
  }

  applyCount += 1;
  lastApply = {
    source: sourceName,
    build: BUILD,
    sourcePixels: `${source.width}x${source.height}`,
    previewSize: `${Math.round(previewRect.width)}x${Math.round(previewRect.height)}`,
    copperRow,
    copperOffsetPx,
    boundary,
    previewPanY,
    previousStageShift,
    zeroPanCopperTop,
    targetStageShift,
    userPanPreserved: true,
    wheelGeometryChanged: false,
    wheelSizeChanged: false,
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

  const redrawEvents = [
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:ring-two-numbering-refresh',
    'gannzilla:fixed-paint-preview-v512',
    'gannzilla:paint-zoom-v515',
  ];
  redrawEvents.forEach((name) => window.addEventListener(name, () => {
    invalidateScan();
    schedule(name);
  }, false));

  window.addEventListener('gannzilla:page-scrollbar-pan-v305', () => schedule('page-pan'), false);
  window.addEventListener('gannzilla:wheel-pan-offset-v305', () => schedule('wheel-pan'), false);
  window.addEventListener('resize', () => schedule('window-resize'), false);
  document.addEventListener('fullscreenchange', () => schedule('fullscreen-change'), false);

  installObserver();
  timer = window.setInterval(() => schedule('clip-baseline-watch'), 500);

  window.GANNZILLA_WHEEL_CLIP_BASELINE_V644 = true;
  window.__auditGannzillaWheelClipBaselineV644 = () => {
    const elements = findElements();
    const stageShift = elements ? currentStageShift(elements.stage) : null;
    return {
      ok: enabled()
        && Boolean(elements)
        && Number.isFinite(stageShift)
        && elements.stage.dataset.gannzillaWheelClipBaselineV644 === 'true',
      build: BUILD,
      userPanPreserved: true,
      wheelGeometryChanged: false,
      wheelSizeChanged: false,
      stageShift,
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
