const BUILD = 512;
const STATE_KEY = '__gannzillaFixedPaintPreviewV512';
const PREVIEW_ID = 'gannzilla-fixed-paint-preview-v512';
const DEFAULT_STAGE_SIZE = 1280;
const MIN_STAGE_SIZE = 640;
const MAX_STAGE_SIZE = 3840;
const PAN_STORAGE_KEY = 'gannzilla-wheel-asymmetric-open-pan-v305';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function boolParam(name, fallback = true) {
  const query = params();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

function stageSize() {
  return Math.round(numberParam('paintStageSize', DEFAULT_STAGE_SIZE, MIN_STAGE_SIZE, MAX_STAGE_SIZE));
}

function findSourceCanvas() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-final-wheel-authority-v506="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v491="true"]',
    'canvas[data-gannzilla-keyboard-mouse-control-v459="true"]',
  ].join(','));
  if (preferred instanceof HTMLCanvasElement && !preferred.closest('aside')) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement)
        || canvas.closest('aside')
        || canvas.id === 'gannzilla-top-center-drawing-overlay-v471') return false;
      return canvas.width > 300 && canvas.height > 300;
    })
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

function readRequestedZoom(source) {
  const fromCanvas = Number(source?.dataset?.gannzillaRequestedZoom);
  if (Number.isFinite(fromCanvas)) return Math.max(0.5, Math.min(3, fromCanvas));
  const fromUrl = Number(params().get('gannzillaZoom'));
  return Number.isFinite(fromUrl) ? Math.max(0.5, Math.min(3, fromUrl)) : 1;
}

function targetDisplaySize(source) {
  return Math.max(
    Math.round(MIN_STAGE_SIZE * 0.5),
    Math.min(MAX_STAGE_SIZE, Math.round(stageSize() * readRequestedZoom(source))),
  );
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

function panTransform(offset = readPanOffset()) {
  return `translate3d(${Math.round(offset.x)}px, ${Math.round(offset.y)}px, 0)`;
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('paintPreview', 'true');
    url.searchParams.set('paintStageSize', String(stageSize()));
    url.searchParams.set('fixedPaintStage', 'true');
    url.searchParams.set('noFitToViewport', 'true');
    url.searchParams.set('paintBitmapNaturalSize', 'true');
    url.searchParams.set('paintPreviewPixelRatio', '1');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime presentation remains authoritative.
  }
}

function ensurePreview(source) {
  const stage = source?.parentElement;
  if (!(source instanceof HTMLCanvasElement) || !(stage instanceof HTMLElement)) return null;

  let preview = document.getElementById(PREVIEW_ID);
  if (!(preview instanceof HTMLImageElement)) {
    preview?.remove();
    preview = document.createElement('img');
    preview.id = PREVIEW_ID;
    preview.alt = 'Gannzilla paint preview';
    preview.draggable = false;
    preview.dataset.gannzillaFixedPaintPreviewV512 = 'true';
    preview.setAttribute('aria-hidden', 'true');
    stage.appendChild(preview);
  } else if (preview.parentElement !== stage) {
    stage.appendChild(preview);
  }

  stage.style.setProperty('position', 'relative', 'important');
  stage.style.setProperty('display', 'grid', 'important');
  stage.style.setProperty('place-items', 'center', 'important');
  stage.style.setProperty('overflow', 'visible', 'important');

  source.style.setProperty('grid-area', '1 / 1', 'important');
  source.style.setProperty('place-self', 'center', 'important');
  source.style.setProperty('z-index', '1', 'important');

  preview.style.setProperty('grid-area', '1 / 1', 'important');
  preview.style.setProperty('place-self', 'center', 'important');
  preview.style.setProperty('display', 'block', 'important');
  preview.style.setProperty('max-width', 'none', 'important');
  preview.style.setProperty('max-height', 'none', 'important');
  preview.style.setProperty('margin', '0', 'important');
  preview.style.setProperty('padding', '0', 'important');
  preview.style.setProperty('border', '0', 'important');
  preview.style.setProperty('background', '#ffffff', 'important');
  preview.style.setProperty('image-rendering', 'auto', 'important');
  preview.style.setProperty('pointer-events', 'none', 'important');
  preview.style.setProperty('user-select', 'none', 'important');
  preview.style.setProperty('transform-origin', 'center center', 'important');
  preview.style.setProperty('will-change', 'transform', 'important');
  preview.style.setProperty('z-index', '2', 'important');
  return preview;
}

function applyExactDisplayGeometry(source, preview, size, offset = readPanOffset()) {
  const exact = `${size}px`;
  const transform = panTransform(offset);

  source.style.setProperty('width', exact, 'important');
  source.style.setProperty('height', exact, 'important');
  source.style.setProperty('min-width', exact, 'important');
  source.style.setProperty('min-height', exact, 'important');
  source.style.setProperty('max-width', 'none', 'important');
  source.style.setProperty('max-height', 'none', 'important');
  source.style.setProperty('transform', transform, 'important');
  source.style.setProperty('transform-origin', 'center center', 'important');
  source.style.setProperty('transition', 'none', 'important');
  source.style.setProperty('will-change', 'transform', 'important');

  preview.style.setProperty('width', exact, 'important');
  preview.style.setProperty('height', exact, 'important');
  preview.style.setProperty('min-width', exact, 'important');
  preview.style.setProperty('min-height', exact, 'important');
  preview.style.setProperty('transform', transform, 'important');
  preview.style.setProperty('transition', 'none', 'important');
  preview.dataset.gannzillaPaintDisplaySize = String(size);
  preview.dataset.gannzillaPaintRequestedZoom = String(readRequestedZoom(source));
}

function sourceIsVisible(source) {
  const style = window.getComputedStyle(source);
  return style.display !== 'none' && style.visibility !== 'hidden';
}

function syncVisibility(source, preview) {
  const visible = sourceIsVisible(source);
  preview.style.setProperty('visibility', visible ? 'visible' : 'hidden', 'important');
  preview.style.setProperty('opacity', visible ? '1' : '0', 'important');
  preview.style.setProperty('pointer-events', 'none', 'important');

  if (visible) {
    source.style.setProperty('opacity', '0', 'important');
    source.style.setProperty('visibility', 'visible', 'important');
  }
  preview.dataset.gannzillaPaintVisible = visible ? 'true' : 'false';
}

let objectUrl = '';
let renderTimer = 0;
let renderToken = 0;
let renderCount = 0;
let lastRender = null;
let sourceObserver = null;
let observedSource = null;
let synchronizingStyle = false;

function installSourceObserver(source, preview) {
  if (observedSource === source && sourceObserver) return;
  sourceObserver?.disconnect();
  observedSource = source;
  sourceObserver = new MutationObserver(() => {
    if (synchronizingStyle) return;
    synchronizingStyle = true;
    syncVisibility(source, preview);
    const size = targetDisplaySize(source);
    applyExactDisplayGeometry(source, preview, size);
    synchronizingStyle = false;
  });
  sourceObserver.observe(source, { attributes: true, attributeFilter: ['style', 'hidden'] });
}

function createBitmap(source, size, token) {
  const bitmap = document.createElement('canvas');
  bitmap.width = size;
  bitmap.height = size;
  const ctx = bitmap.getContext('2d', { alpha: false });
  if (!ctx) return Promise.resolve(null);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, size, size);
  return new Promise((resolve) => {
    bitmap.toBlob((blob) => resolve(token === renderToken ? blob : null), 'image/png', 1);
  });
}

async function renderPreview(sourceReason = 'render') {
  const source = findSourceCanvas();
  if (!(source instanceof HTMLCanvasElement) || source.width < 1 || source.height < 1) return false;
  const preview = ensurePreview(source);
  if (!(preview instanceof HTMLImageElement)) return false;

  const size = targetDisplaySize(source);
  const token = ++renderToken;
  const blob = await createBitmap(source, size, token);
  if (!blob || token !== renderToken) return false;

  const nextUrl = URL.createObjectURL(blob);
  const previousUrl = objectUrl;
  objectUrl = nextUrl;

  await new Promise((resolve) => {
    preview.onload = resolve;
    preview.onerror = resolve;
    preview.src = nextUrl;
  });
  if (token !== renderToken) {
    URL.revokeObjectURL(nextUrl);
    return false;
  }
  if (previousUrl) URL.revokeObjectURL(previousUrl);

  synchronizingStyle = true;
  applyExactDisplayGeometry(source, preview, size);
  syncVisibility(source, preview);
  synchronizingStyle = false;
  installSourceObserver(source, preview);

  source.dataset.gannzillaPaintSourceV512 = 'true';
  source.dataset.gannzillaPaintNaturalDisplaySize = String(size);
  preview.dataset.gannzillaPaintSourcePixelSize = `${source.width}x${source.height}`;
  preview.dataset.gannzillaPaintBitmapPixelSize = `${size}x${size}`;

  renderCount += 1;
  lastRender = {
    source: sourceReason,
    stageSize: stageSize(),
    requestedZoom: readRequestedZoom(source),
    displaySize: size,
    sourcePixelWidth: source.width,
    sourcePixelHeight: source.height,
    at: Date.now(),
  };
  window.dispatchEvent(new CustomEvent('gannzilla:fixed-paint-preview-v512', {
    detail: { ...lastRender, build: BUILD },
  }));
  return true;
}

function scheduleRender(source = 'schedule', delay = 70) {
  clearTimeout(renderTimer);
  renderTimer = window.setTimeout(() => {
    renderTimer = 0;
    renderPreview(source);
  }, delay);
}

function syncPan(event) {
  const source = findSourceCanvas();
  const preview = document.getElementById(PREVIEW_ID);
  if (!(source instanceof HTMLCanvasElement) || !(preview instanceof HTMLImageElement)) return;
  const detail = event?.detail || {};
  const offset = Number.isFinite(Number(detail.x)) && Number.isFinite(Number(detail.y))
    ? { x: Number(detail.x), y: Number(detail.y) }
    : readPanOffset();
  synchronizingStyle = true;
  applyExactDisplayGeometry(source, preview, targetDisplaySize(source), offset);
  synchronizingStyle = false;
}

function install() {
  if (typeof window === 'undefined'
    || typeof document === 'undefined'
    || !wheelMode()
    || !boolParam('paintPreview', true)
    || window[STATE_KEY]) return;

  persistFlags();
  const onFinal = (event) => scheduleRender(event?.type || 'final-wheel', 45);
  const onLayout = (event) => {
    persistFlags();
    const source = findSourceCanvas();
    const preview = document.getElementById(PREVIEW_ID);
    if (source instanceof HTMLCanvasElement && preview instanceof HTMLImageElement) {
      synchronizingStyle = true;
      applyExactDisplayGeometry(source, preview, targetDisplaySize(source));
      syncVisibility(source, preview);
      synchronizingStyle = false;
    }
    if (event?.type === 'fullscreenchange') scheduleRender('fullscreen', 100);
  };

  window.addEventListener('gannzilla:final-wheel-authority-v506', onFinal, false);
  window.addEventListener('gannzilla:final-wheel-authority-v491', onFinal, false);
  window.addEventListener('gannzilla:page-scrollbar-pan-v305', syncPan, false);
  window.addEventListener('gannzilla:wheel-pan-offset-v305', syncPan, false);
  window.addEventListener('gannzilla:layout-panel-visibility-change', onLayout, false);
  window.addEventListener('resize', onLayout, false);
  document.addEventListener('fullscreenchange', onLayout, false);

  [80, 260, 700, 1600, 3200, 6200].forEach((delay) => {
    window.setTimeout(() => scheduleRender(`boot-${delay}`, 20), delay);
  });

  window.GANNZILLA_FIXED_PAINT_PREVIEW_V512 = true;
  window.__auditGannzillaFixedPaintPreviewV512 = () => {
    const source = findSourceCanvas();
    const preview = document.getElementById(PREVIEW_ID);
    const sourceRect = source?.getBoundingClientRect();
    const previewRect = preview?.getBoundingClientRect();
    const size = source instanceof HTMLCanvasElement ? targetDisplaySize(source) : 0;
    return {
      ok: source instanceof HTMLCanvasElement
        && preview instanceof HTMLImageElement
        && preview.dataset.gannzillaFixedPaintPreviewV512 === 'true'
        && Math.abs((previewRect?.width || 0) - size) < 1
        && Math.abs((previewRect?.height || 0) - size) < 1
        && Math.abs((sourceRect?.width || 0) - size) < 1
        && preview.dataset.gannzillaPaintBitmapPixelSize === `${size}x${size}`,
      build: BUILD,
      fixedPaintStage: true,
      noFitToViewport: true,
      bitmapNaturalSize: true,
      stageSize: stageSize(),
      requestedZoom: source instanceof HTMLCanvasElement ? readRequestedZoom(source) : null,
      displaySize: size,
      sourceRectWidth: sourceRect?.width || 0,
      previewRectWidth: previewRect?.width || 0,
      renderCount,
      lastRender,
      scopedSourceObserver: true,
      visibleRendererIsPngBitmap: true,
      interactiveSourcePreservedUnderPreview: true,
    };
  };

  window[STATE_KEY] = {
    onFinal,
    onLayout,
    syncPan,
    scheduleRender,
    get sourceObserver() { return sourceObserver; },
  };
}

install();