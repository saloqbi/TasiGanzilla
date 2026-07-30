const BUILD = 643;
const STATE_KEY = '__gannzillaWheelTopClipAlignmentV643';
const PARAM = 'alignWheelTopToToolbar';
const PREVIEW_ID = 'gannzilla-fixed-paint-preview-v512';
const PAN_STORAGE_KEY = 'gannzilla-wheel-asymmetric-open-pan-v305';

let timer = 0;
let observer = null;
let frame = 0;
let applying = false;
let applyCount = 0;
let scanCount = 0;
let lastApply = null;
let cachedScan = null;

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

function readPanOffset() {
  try {
    const value = JSON.parse(localStorage.getItem(PAN_STORAGE_KEY) || '{}');
    return {
      x: Number.isFinite(Number(value.x)) ? Number(value.x) : 0,
      y: Number.isFinite(Number(value.y)) ? Number(value.y) : 0,
    };
  } catch (_) {
    return { x: 0, y: 0 };
  }
}

function invalidateScan() {
  cachedScan = null;
}

function isInkPixel(data, index) {
  const alpha = data[index + 3];
  if (alpha < 8) return false;
  const red = data[index];
  const green = data[index + 1];
  const blue = data[index + 2];
  return red < 247 || green < 247 || blue < 247;
}

function detectTopInkRow(source) {
  if (!(source instanceof HTMLCanvasElement) || source.width < 1 || source.height < 1) return 0;
  if (cachedScan
      && cachedScan.source === source
      && cachedScan.width === source.width
      && cachedScan.height === source.height) return cachedScan.row;

  let row = 0;
  try {
    const context = source.getContext('2d', { willReadFrequently: true });
    if (!context) return 0;

    const maxRows = Math.min(source.height, Math.max(1, Math.ceil(source.height * 0.28)));
    const image = context.getImageData(0, 0, source.width, maxRows);
    const xStep = Math.max(1, Math.floor(source.width / 720));
    const samplesPerRow = Math.ceil(source.width / xStep);
    const minimumInkSamples = Math.max(4, Math.ceil(samplesPerRow * 0.004));

    outer:
    for (let y = 0; y < maxRows; y += 1) {
      let inkSamples = 0;
      const rowStart = y * source.width * 4;
      for (let x = 0; x < source.width; x += xStep) {
        if (isInkPixel(image.data, rowStart + x * 4)) {
          inkSamples += 1;
          if (inkSamples >= minimumInkSamples) {
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

  cachedScan = {
    source,
    width: source.width,
    height: source.height,
    row,
  };
  return row;
}

function displayHeight(preview) {
  if (!(preview instanceof HTMLImageElement)) return 0;
  const rect = preview.getBoundingClientRect();
  if (rect.height > 0) return rect.height;
  const inline = Number.parseFloat(preview.style.height || '0');
  return Number.isFinite(inline) ? inline : 0;
}

function setTransform(preview, transform) {
  if (!(preview instanceof HTMLImageElement)) return false;
  if (preview.style.getPropertyValue('transform') === transform
      && preview.style.getPropertyPriority('transform') === 'important') return false;
  preview.style.setProperty('transform', transform, 'important');
  return true;
}

function apply(sourceName = 'apply') {
  frame = 0;
  if (!enabled() || applying) return false;

  const source = findSourceCanvas();
  const preview = document.getElementById(PREVIEW_ID);
  if (!(source instanceof HTMLCanvasElement) || !(preview instanceof HTMLImageElement)) return false;

  const renderedHeight = displayHeight(preview);
  if (!(renderedHeight > 0)) return false;

  const topInkRow = detectTopInkRow(source);
  const sourceHeight = Math.max(1, source.height);
  const topCompensation = Math.max(0, Math.round(topInkRow * renderedHeight / sourceHeight));
  const pan = readPanOffset();
  const visualY = Math.round(pan.y - topCompensation);
  const transform = `translate3d(${Math.round(pan.x)}px, ${visualY}px, 0)`;

  applying = true;
  try {
    setTransform(preview, transform);
    preview.style.setProperty('transform-origin', 'center center', 'important');
    preview.dataset.gannzillaWheelTopClipAlignmentV643 = 'true';
    preview.dataset.gannzillaTopInkSourceRowV643 = String(topInkRow);
    preview.dataset.gannzillaTopCompensationPxV643 = String(topCompensation);
    preview.dataset.gannzillaVisualPanYV643 = String(visualY);
  } finally {
    applying = false;
  }

  applyCount += 1;
  lastApply = {
    source: sourceName,
    build: BUILD,
    sourcePixels: `${source.width}x${source.height}`,
    renderedHeight,
    topInkRow,
    topCompensation,
    storedPan: pan,
    visualY,
    transform,
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
    const relevant = records.some((record) => {
      if (record.type === 'childList') return record.addedNodes.length || record.removedNodes.length;
      if (record.type === 'attributes') {
        const target = record.target;
        return target instanceof HTMLElement
          && (target.id === PREVIEW_ID || target instanceof HTMLCanvasElement);
      }
      return false;
    });
    if (relevant) schedule('dom-or-style-change');
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'src', 'width', 'height'],
  });
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
  timer = window.setInterval(() => schedule('alignment-watch'), 250);

  window.GANNZILLA_WHEEL_TOP_CLIP_ALIGNMENT_V643 = true;
  window.__auditGannzillaWheelTopClipAlignmentV643 = () => {
    const source = findSourceCanvas();
    const preview = document.getElementById(PREVIEW_ID);
    const compensation = Number(preview?.dataset?.gannzillaTopCompensationPxV643 || 0);
    const topInkRow = Number(preview?.dataset?.gannzillaTopInkSourceRowV643 || 0);
    return {
      ok: enabled()
        && source instanceof HTMLCanvasElement
        && preview instanceof HTMLImageElement
        && preview.dataset.gannzillaWheelTopClipAlignmentV643 === 'true'
        && compensation >= 0,
      build: BUILD,
      wheelGeometryChanged: false,
      wheelSizeChanged: false,
      storedPanPreserved: true,
      topInkRow,
      topCompensation: compensation,
      previewTransform: preview instanceof HTMLImageElement ? getComputedStyle(preview).transform : null,
      scanCount,
      applyCount,
      timerActive: Boolean(timer),
      observerActive: Boolean(observer),
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, invalidateScan, detectTopInkRow };
  schedule('install');
}

install();
