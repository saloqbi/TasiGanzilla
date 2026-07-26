const BUILD = 514;
const STATE_KEY = '__gannzillaPaintZoomAuthorityV514';
const V512_STATE_KEY = '__gannzillaFixedPaintPreviewV512';
const PREVIEW_ID = 'gannzilla-fixed-paint-preview-v512';
const ZOOM_IN_ID = 'gannzilla-unified-zoom-in-v509';
const ZOOM_OUT_ID = 'gannzilla-unified-zoom-out-v509';
const ZOOM_SELECT_ID = 'gannzilla-unified-zoom-select-v509';
const STORAGE_KEY = 'tasi-gannzilla-paint-zoom-v514';
const PAN_STORAGE_KEY = 'gannzilla-wheel-asymmetric-open-pan-v305';
const DEFAULT_STAGE_SIZE = 1280;
const DEFAULT_MIN_PERCENT = 25;
const DEFAULT_MAX_PERCENT = 500;
const DEFAULT_STEP_PERCENT = 25;
const MAX_BITMAP_SIZE = 8192;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

function settings() {
  const min = Math.round(numberParam('paintZoomMin', DEFAULT_MIN_PERCENT, 10, 100));
  const max = Math.max(min + 25, Math.round(numberParam('paintZoomMax', DEFAULT_MAX_PERCENT, 100, 800)));
  const step = Math.round(numberParam('paintZoomStep', DEFAULT_STEP_PERCENT, 5, 100));
  const stageSize = Math.round(numberParam('paintStageSize', DEFAULT_STAGE_SIZE, 640, 3840));
  return { min, max, step, stageSize };
}

function clampPercent(value) {
  const { min, max, step } = settings();
  const numeric = Number(value);
  const safe = Number.isFinite(numeric) ? numeric : 100;
  return Math.max(min, Math.min(max, Math.round(safe / step) * step));
}

function initialPercent() {
  const query = params();
  const explicit = Number(query.get('paintZoomPercent'));
  if (Number.isFinite(explicit)) return clampPercent(explicit);
  try {
    const saved = Number(localStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(saved)) return clampPercent(saved);
  } catch (_) {
    // URL/default remains authoritative.
  }
  return 100;
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

function displaySize(percent = currentPercent) {
  const { stageSize } = settings();
  return Math.max(320, Math.round(stageSize * percent / 100));
}

function transformFor(offset = readPanOffset()) {
  return `translate3d(${Math.round(offset.x)}px, ${Math.round(offset.y)}px, 0)`;
}

function persist() {
  try { localStorage.setItem(STORAGE_KEY, String(currentPercent)); } catch (_) { /* runtime only */ }
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('paintPreview', 'true');
    url.searchParams.set('paintZoomAuthority', 'true');
    url.searchParams.set('paintZoomPercent', String(currentPercent));
    url.searchParams.set('paintZoomMin', String(settings().min));
    url.searchParams.set('paintZoomMax', String(settings().max));
    url.searchParams.set('paintZoomStep', String(settings().step));
    url.searchParams.set('paintStageSize', String(settings().stageSize));
    url.searchParams.set('gannzillaZoom', '1.00');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime zoom remains authoritative.
  }
}

function populateSelect() {
  const select = document.getElementById(ZOOM_SELECT_ID);
  if (!(select instanceof HTMLSelectElement)) return false;
  const { min, max, step } = settings();
  const values = [];
  for (let value = min; value <= max; value += step) values.push(value);
  if (!values.includes(currentPercent)) values.push(currentPercent);
  values.sort((a, b) => a - b);
  const signature = values.join(',');
  if (select.dataset.gannzillaPaintZoomOptionsV514 !== signature) {
    select.replaceChildren(...values.map((value) => {
      const option = document.createElement('option');
      option.value = String(value);
      option.textContent = `${value}%`;
      return option;
    }));
    select.dataset.gannzillaPaintZoomOptionsV514 = signature;
  }
  select.value = String(currentPercent);
  select.dataset.gannzillaPaintZoomAuthorityV514 = 'true';
  select.style.setProperty('pointer-events', 'auto', 'important');
  return true;
}

function markButtons() {
  const zoomIn = document.getElementById(ZOOM_IN_ID);
  const zoomOut = document.getElementById(ZOOM_OUT_ID);
  if (zoomIn instanceof HTMLElement) {
    zoomIn.dataset.gannzillaPaintZoomAuthorityV514 = 'zoom-in';
    zoomIn.style.setProperty('pointer-events', 'auto', 'important');
    zoomIn.style.setProperty('cursor', 'pointer', 'important');
  }
  if (zoomOut instanceof HTMLElement) {
    zoomOut.dataset.gannzillaPaintZoomAuthorityV514 = 'zoom-out';
    zoomOut.style.setProperty('pointer-events', 'auto', 'important');
    zoomOut.style.setProperty('cursor', 'pointer', 'important');
  }
  populateSelect();
  return Boolean(zoomIn && zoomOut);
}

let currentPercent = initialPercent();
let objectUrl = '';
let renderTimer = 0;
let renderToken = 0;
let actionCount = 0;
let renderCount = 0;
let lastAction = null;
let lastRender = null;
let repairObserver = null;
let repairing = false;
let lastPointerActivation = 0;

function applyGeometry(offset = readPanOffset()) {
  const source = findSourceCanvas();
  const preview = document.getElementById(PREVIEW_ID);
  if (!(source instanceof HTMLCanvasElement) || !(preview instanceof HTMLImageElement)) return false;
  const size = displaySize();
  const exact = `${size}px`;
  const transform = transformFor(offset);
  const stage = source.parentElement;
  if (stage instanceof HTMLElement) {
    stage.style.setProperty('position', 'relative', 'important');
    stage.style.setProperty('display', 'grid', 'important');
    stage.style.setProperty('place-items', 'center', 'important');
    stage.style.setProperty('overflow', 'visible', 'important');
  }
  [source, preview].forEach((element) => {
    element.style.setProperty('grid-area', '1 / 1', 'important');
    element.style.setProperty('place-self', 'center', 'important');
    element.style.setProperty('width', exact, 'important');
    element.style.setProperty('height', exact, 'important');
    element.style.setProperty('min-width', exact, 'important');
    element.style.setProperty('min-height', exact, 'important');
    element.style.setProperty('max-width', 'none', 'important');
    element.style.setProperty('max-height', 'none', 'important');
    element.style.setProperty('transform', transform, 'important');
    element.style.setProperty('transform-origin', 'center center', 'important');
    element.style.setProperty('transition', 'none', 'important');
    element.style.setProperty('will-change', 'transform', 'important');
  });
  source.style.setProperty('opacity', '0', 'important');
  source.style.setProperty('visibility', 'visible', 'important');
  source.style.setProperty('z-index', '1', 'important');
  preview.style.setProperty('display', 'block', 'important');
  preview.style.setProperty('visibility', 'visible', 'important');
  preview.style.setProperty('opacity', '1', 'important');
  preview.style.setProperty('pointer-events', 'none', 'important');
  preview.style.setProperty('z-index', '2', 'important');
  source.dataset.gannzillaRequestedZoom = '1';
  source.dataset.gannzillaPaintZoomPercentV514 = String(currentPercent);
  preview.dataset.gannzillaPaintZoomPercentV514 = String(currentPercent);
  preview.dataset.gannzillaPaintDisplaySizeV514 = String(size);
  return true;
}

function createBitmap(source, size, token) {
  const bitmapSize = Math.min(MAX_BITMAP_SIZE, size);
  const bitmap = document.createElement('canvas');
  bitmap.width = bitmapSize;
  bitmap.height = bitmapSize;
  const ctx = bitmap.getContext('2d', { alpha: false });
  if (!ctx) return Promise.resolve(null);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, bitmapSize, bitmapSize);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, bitmapSize, bitmapSize);
  return new Promise((resolve) => {
    bitmap.toBlob((blob) => resolve(token === renderToken ? { blob, bitmapSize } : null), 'image/png', 1);
  });
}

async function renderPreview(reason = 'render') {
  const source = findSourceCanvas();
  const preview = document.getElementById(PREVIEW_ID);
  if (!(source instanceof HTMLCanvasElement) || !(preview instanceof HTMLImageElement)) return false;
  const size = displaySize();
  const token = ++renderToken;
  const result = await createBitmap(source, size, token);
  if (!result?.blob || token !== renderToken) return false;
  const nextUrl = URL.createObjectURL(result.blob);
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
  applyGeometry();
  preview.dataset.gannzillaPaintBitmapPixelSizeV514 = `${result.bitmapSize}x${result.bitmapSize}`;
  renderCount += 1;
  lastRender = {
    reason,
    percent: currentPercent,
    displaySize: size,
    bitmapSize: result.bitmapSize,
    sourcePixels: `${source.width}x${source.height}`,
    at: Date.now(),
  };
  return true;
}

function scheduleRender(reason = 'schedule', delay = 60) {
  clearTimeout(renderTimer);
  renderTimer = window.setTimeout(() => {
    renderTimer = 0;
    renderPreview(reason);
  }, delay);
}

function applyPercent(percent, source) {
  currentPercent = clampPercent(percent);
  persist();
  markButtons();
  applyGeometry();
  scheduleRender(source, 35);
  actionCount += 1;
  lastAction = {
    source,
    percent: currentPercent,
    displaySize: displaySize(),
    at: Date.now(),
  };
  window.dispatchEvent(new CustomEvent('gannzilla:paint-zoom-v514', {
    detail: { ...lastAction, build: BUILD },
  }));
  return currentPercent;
}

function controlFromTarget(target) {
  if (!(target instanceof Element)) return null;
  return target.closest(`#${ZOOM_IN_ID},#${ZOOM_OUT_ID}`);
}

function activateControl(control, source) {
  const { step } = settings();
  const delta = control.id === ZOOM_IN_ID ? step : -step;
  return applyPercent(currentPercent + delta, source);
}

function stopEvent(event) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
}

function onPointerDown(event) {
  const control = controlFromTarget(event.target);
  if (!(control instanceof HTMLElement) || event.button !== 0) return;
  stopEvent(event);
  lastPointerActivation = Date.now();
  activateControl(control, control.id === ZOOM_IN_ID ? 'paint-zoom-in-pointer-v514' : 'paint-zoom-out-pointer-v514');
}

function onClick(event) {
  const control = controlFromTarget(event.target);
  if (!(control instanceof HTMLElement)) return;
  stopEvent(event);
  if (Date.now() - lastPointerActivation < 500) return;
  activateControl(control, control.id === ZOOM_IN_ID ? 'paint-zoom-in-click-v514' : 'paint-zoom-out-click-v514');
}

function onKeyDown(event) {
  const control = controlFromTarget(event.target);
  if (!(control instanceof HTMLElement) || (event.key !== 'Enter' && event.key !== ' ')) return;
  stopEvent(event);
  activateControl(control, control.id === ZOOM_IN_ID ? 'paint-zoom-in-key-v514' : 'paint-zoom-out-key-v514');
}

function onChange(event) {
  if (!(event.target instanceof HTMLSelectElement) || event.target.id !== ZOOM_SELECT_ID) return;
  stopEvent(event);
  applyPercent(Number(event.target.value), 'paint-zoom-select-v514');
}

function onPan(event) {
  const detail = event?.detail || {};
  const offset = Number.isFinite(Number(detail.x)) && Number.isFinite(Number(detail.y))
    ? { x: Number(detail.x), y: Number(detail.y) }
    : readPanOffset();
  applyGeometry(offset);
}

function retireV512Authority() {
  const state = window[V512_STATE_KEY];
  if (!state || state.retiredByV514) return false;
  try {
    window.removeEventListener('gannzilla:final-wheel-authority-v506', state.onFinal, false);
    window.removeEventListener('gannzilla:final-wheel-authority-v491', state.onFinal, false);
    window.removeEventListener('gannzilla:page-scrollbar-pan-v305', state.syncPan, false);
    window.removeEventListener('gannzilla:wheel-pan-offset-v305', state.syncPan, false);
    window.removeEventListener('gannzilla:layout-panel-visibility-change', state.onLayout, false);
    window.removeEventListener('resize', state.onLayout, false);
    document.removeEventListener('fullscreenchange', state.onLayout, false);
    state.sourceObserver?.disconnect?.();
    state.retiredByV514 = true;
    return true;
  } catch (_) {
    return false;
  }
}

function installRepairObserver() {
  repairObserver?.disconnect();
  repairObserver = new MutationObserver(() => {
    if (repairing) return;
    repairing = true;
    requestAnimationFrame(() => {
      applyGeometry();
      repairing = false;
    });
  });
  const source = findSourceCanvas();
  const preview = document.getElementById(PREVIEW_ID);
  if (source instanceof HTMLElement) repairObserver.observe(source, { attributes: true, attributeFilter: ['style', 'hidden'] });
  if (preview instanceof HTMLElement) repairObserver.observe(preview, { attributes: true, attributeFilter: ['style'] });
}

function install() {
  if (typeof window === 'undefined'
    || typeof document === 'undefined'
    || !wheelMode()
    || window[STATE_KEY]) return;

  retireV512Authority();
  persist();

  document.addEventListener('pointerdown', onPointerDown, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('change', onChange, true);
  window.addEventListener('gannzilla:page-scrollbar-pan-v305', onPan, false);
  window.addEventListener('gannzilla:wheel-pan-offset-v305', onPan, false);
  window.addEventListener('gannzilla:final-wheel-authority-v506', () => {
    applyGeometry();
    scheduleRender('source-redraw-v514', 45);
  }, false);
  window.addEventListener('resize', () => applyGeometry(), false);
  document.addEventListener('fullscreenchange', () => applyGeometry(), false);

  markButtons();
  applyGeometry();
  scheduleRender('install-v514', 40);
  [80, 220, 600, 1400, 3200, 6800].forEach((delay) => setTimeout(() => {
    retireV512Authority();
    markButtons();
    applyGeometry();
    installRepairObserver();
    scheduleRender(`boot-${delay}-v514`, 30);
  }, delay));

  window.GANNZILLA_PAINT_ZOOM_AUTHORITY_V514 = true;
  window.__auditGannzillaPaintZoomAuthorityV514 = () => {
    const source = findSourceCanvas();
    const preview = document.getElementById(PREVIEW_ID);
    const zoomIn = document.getElementById(ZOOM_IN_ID);
    const zoomOut = document.getElementById(ZOOM_OUT_ID);
    const select = document.getElementById(ZOOM_SELECT_ID);
    const expectedSize = displaySize();
    const previewRect = preview?.getBoundingClientRect();
    return {
      ok: source instanceof HTMLCanvasElement
        && preview instanceof HTMLImageElement
        && zoomIn instanceof HTMLElement
        && zoomOut instanceof HTMLElement
        && select instanceof HTMLSelectElement
        && Math.abs((previewRect?.width || 0) - expectedSize) < 1,
      build: BUILD,
      currentPercent,
      minPercent: settings().min,
      maxPercent: settings().max,
      stepPercent: settings().step,
      stageSize: settings().stageSize,
      expectedDisplaySize: expectedSize,
      actualDisplaySize: previewRect?.width || 0,
      v512Retired: Boolean(window[V512_STATE_KEY]?.retiredByV514),
      zoomInBound: zoomIn?.dataset?.gannzillaPaintZoomAuthorityV514 === 'zoom-in',
      zoomOutBound: zoomOut?.dataset?.gannzillaPaintZoomAuthorityV514 === 'zoom-out',
      actionCount,
      renderCount,
      lastAction,
      lastRender,
    };
  };

  window[STATE_KEY] = {
    onPointerDown,
    onClick,
    onKeyDown,
    onChange,
    onPan,
    applyPercent,
    applyGeometry,
    scheduleRender,
    get repairObserver() { return repairObserver; },
  };
}

install();