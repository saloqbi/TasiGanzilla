const BUILD = 515;
const STATE_KEY = '__gannzillaUnifiedPaintPreviewZoomV515';
const PREVIEW_ID = 'gannzilla-fixed-paint-preview-v512';
const ZOOM_IN_ID = 'gannzilla-unified-zoom-in-v509';
const ZOOM_OUT_ID = 'gannzilla-unified-zoom-out-v509';
const ZOOM_SELECT_ID = 'gannzilla-unified-zoom-select-v509';
const PAN_STORAGE_KEY = 'gannzilla-wheel-asymmetric-open-pan-v305';
const ZOOM_STORAGE_KEY = 'tasi-gannzilla-paint-zoom-v515';
const DEFAULT_STAGE_SIZE = 1280;
const DEFAULT_MIN = 25;
const DEFAULT_MAX = 500;
const DEFAULT_STEP = 25;
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
  const min = Math.round(numberParam('paintZoomMin', DEFAULT_MIN, 10, 100));
  const max = Math.max(min + 25, Math.round(numberParam('paintZoomMax', DEFAULT_MAX, 100, 800)));
  const step = Math.round(numberParam('paintZoomStep', DEFAULT_STEP, 5, 100));
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
  const explicit = Number(params().get('paintZoomPercent'));
  if (Number.isFinite(explicit)) return clampPercent(explicit);
  try {
    const saved = Number(localStorage.getItem(ZOOM_STORAGE_KEY));
    if (Number.isFinite(saved)) return clampPercent(saved);
  } catch (_) {
    // Default remains authoritative.
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

function setStyle(element, name, value, priority = 'important') {
  if (!(element instanceof HTMLElement)) return;
  if (element.style.getPropertyValue(name) === value
    && element.style.getPropertyPriority(name) === priority) return;
  element.style.setProperty(name, value, priority);
}

function displaySize() {
  return Math.max(320, Math.round(settings().stageSize * currentPercent / 100));
}

function panTransform(offset = readPanOffset()) {
  return `translate3d(${Math.round(offset.x)}px, ${Math.round(offset.y)}px, 0)`;
}

function persist() {
  try { localStorage.setItem(ZOOM_STORAGE_KEY, String(currentPercent)); } catch (_) { /* runtime only */ }
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
    // Runtime state remains active.
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
    preview.dataset.gannzillaUnifiedPaintPreviewZoomV515 = 'true';
    stage.appendChild(preview);
  } else if (preview.parentElement !== stage) {
    stage.appendChild(preview);
  }

  setStyle(stage, 'position', 'relative');
  setStyle(stage, 'display', 'grid');
  setStyle(stage, 'place-items', 'center');
  setStyle(stage, 'overflow', 'visible');

  setStyle(source, 'grid-area', '1 / 1');
  setStyle(source, 'place-self', 'center');
  setStyle(source, 'z-index', '1');

  setStyle(preview, 'grid-area', '1 / 1');
  setStyle(preview, 'place-self', 'center');
  setStyle(preview, 'display', 'block');
  setStyle(preview, 'max-width', 'none');
  setStyle(preview, 'max-height', 'none');
  setStyle(preview, 'margin', '0');
  setStyle(preview, 'padding', '0');
  setStyle(preview, 'border', '0');
  setStyle(preview, 'background', '#ffffff');
  setStyle(preview, 'image-rendering', 'auto');
  setStyle(preview, 'pointer-events', 'none');
  setStyle(preview, 'user-select', 'none');
  setStyle(preview, 'z-index', '2');
  return preview;
}

let currentPercent = initialPercent();
let objectUrl = '';
let renderTimer = 0;
let renderToken = 0;
let actionCount = 0;
let renderCount = 0;
let lastAction = null;
let lastRender = null;
let lastActivationAt = 0;
let sourceObserver = null;
let observedSource = null;
let bindingObserver = null;
let bindingFrame = 0;
let applying = false;

function applyGeometry(offset = readPanOffset()) {
  const source = findSourceCanvas();
  if (!(source instanceof HTMLCanvasElement)) return false;
  const preview = ensurePreview(source);
  if (!(preview instanceof HTMLImageElement)) return false;

  const size = displaySize();
  const exact = `${size}px`;
  const transform = panTransform(offset);
  applying = true;
  [source, preview].forEach((element) => {
    setStyle(element, 'width', exact);
    setStyle(element, 'height', exact);
    setStyle(element, 'min-width', exact);
    setStyle(element, 'min-height', exact);
    setStyle(element, 'max-width', 'none');
    setStyle(element, 'max-height', 'none');
    setStyle(element, 'transform', transform);
    setStyle(element, 'transform-origin', 'center center');
    setStyle(element, 'transition', 'none');
    setStyle(element, 'will-change', 'transform');
  });

  const sourceStyle = getComputedStyle(source);
  const visible = sourceStyle.display !== 'none' && sourceStyle.visibility !== 'hidden';
  setStyle(source, 'opacity', '0');
  setStyle(source, 'visibility', visible ? 'visible' : 'hidden');
  setStyle(preview, 'visibility', visible ? 'visible' : 'hidden');
  setStyle(preview, 'opacity', visible ? '1' : '0');
  setStyle(preview, 'pointer-events', 'none');
  source.dataset.gannzillaRequestedZoom = '1';
  source.dataset.gannzillaPaintZoomPercentV515 = String(currentPercent);
  preview.dataset.gannzillaPaintZoomPercentV515 = String(currentPercent);
  preview.dataset.gannzillaPaintDisplaySizeV515 = String(size);
  applying = false;
  updateSelect();
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
  if (!(source instanceof HTMLCanvasElement) || source.width < 1 || source.height < 1) return false;
  const preview = ensurePreview(source);
  if (!(preview instanceof HTMLImageElement)) return false;
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
  preview.dataset.gannzillaPaintBitmapPixelSizeV515 = `${result.bitmapSize}x${result.bitmapSize}`;
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

function scheduleRender(reason = 'schedule', delay = 45) {
  clearTimeout(renderTimer);
  renderTimer = window.setTimeout(() => {
    renderTimer = 0;
    renderPreview(reason);
  }, delay);
}

function valuesForSelect() {
  const { min, max, step } = settings();
  const values = [];
  for (let value = min; value <= max; value += step) values.push(value);
  if (!values.includes(currentPercent)) values.push(currentPercent);
  return values.sort((a, b) => a - b);
}

function updateSelect() {
  const select = document.getElementById(ZOOM_SELECT_ID);
  if (!(select instanceof HTMLSelectElement)) return false;
  const values = valuesForSelect();
  const signature = values.join(',');
  if (select.dataset.gannzillaPaintZoomOptionsV515 !== signature) {
    select.replaceChildren(...values.map((value) => {
      const option = document.createElement('option');
      option.value = String(value);
      option.textContent = `${value}%`;
      return option;
    }));
    select.dataset.gannzillaPaintZoomOptionsV515 = signature;
  }
  select.value = String(currentPercent);
  select.dataset.gannzillaUnifiedPaintPreviewZoomV515 = 'true';
  setStyle(select, 'pointer-events', 'auto');
  setStyle(select, 'cursor', 'pointer');
  setStyle(select, 'position', 'relative');
  setStyle(select, 'z-index', '2147483647');
  return true;
}

function applyPercent(value, source) {
  currentPercent = clampPercent(value);
  persist();
  updateSelect();
  applyGeometry();
  scheduleRender(source, 30);
  actionCount += 1;
  lastAction = {
    source,
    percent: currentPercent,
    displaySize: displaySize(),
    at: Date.now(),
  };
  window.dispatchEvent(new CustomEvent('gannzilla:paint-zoom-v515', {
    detail: { ...lastAction, build: BUILD },
  }));
  return currentPercent;
}

function stopEvent(event) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
}

function activate(direction, event, source) {
  if (event) stopEvent(event);
  const now = Date.now();
  if (now - lastActivationAt < 180) return currentPercent;
  lastActivationAt = now;
  return applyPercent(currentPercent + direction * settings().step, source);
}

function replaceAndBindButton(id, direction) {
  const current = document.getElementById(id);
  if (!(current instanceof HTMLElement)) return null;
  if (current.dataset.gannzillaUnifiedPaintPreviewZoomV515 === 'true') return current;

  const button = current.cloneNode(true);
  button.id = id;
  button.dataset.gannzillaUnifiedPaintPreviewZoomV515 = 'true';
  current.replaceWith(button);
  setStyle(button, 'pointer-events', 'auto');
  setStyle(button, 'cursor', 'pointer');
  setStyle(button, 'position', 'relative');
  setStyle(button, 'z-index', '2147483647');
  const handler = (event) => activate(direction, event, direction > 0 ? 'paint-zoom-in-direct-v515' : 'paint-zoom-out-direct-v515');
  button.addEventListener('pointerdown', handler, true);
  button.addEventListener('mousedown', handler, true);
  button.addEventListener('click', handler, true);
  button.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') handler(event);
  }, true);
  return button;
}

function replaceAndBindSelect() {
  const current = document.getElementById(ZOOM_SELECT_ID);
  if (!(current instanceof HTMLSelectElement)) return null;
  let select = current;
  if (current.dataset.gannzillaUnifiedPaintPreviewZoomV515 !== 'true') {
    select = current.cloneNode(false);
    select.id = ZOOM_SELECT_ID;
    current.replaceWith(select);
    select.dataset.gannzillaUnifiedPaintPreviewZoomV515 = 'true';
    select.addEventListener('change', (event) => {
      stopEvent(event);
      applyPercent(Number(select.value), 'paint-zoom-select-direct-v515');
    }, true);
  }
  updateSelect();
  return select;
}

function bindControls() {
  const zoomOut = replaceAndBindButton(ZOOM_OUT_ID, -1);
  const zoomIn = replaceAndBindButton(ZOOM_IN_ID, 1);
  const select = replaceAndBindSelect();
  return Boolean(zoomOut && zoomIn && select);
}

function controlFromTarget(target) {
  if (!(target instanceof Element)) return null;
  return target.closest(`#${ZOOM_IN_ID},#${ZOOM_OUT_ID}`);
}

function globalPointerFallback(event) {
  const control = controlFromTarget(event.target);
  if (!(control instanceof HTMLElement) || event.button !== 0) return;
  activate(control.id === ZOOM_IN_ID ? 1 : -1, event,
    control.id === ZOOM_IN_ID ? 'paint-zoom-in-window-v515' : 'paint-zoom-out-window-v515');
}

function onPan(event) {
  const detail = event?.detail || {};
  const offset = Number.isFinite(Number(detail.x)) && Number.isFinite(Number(detail.y))
    ? { x: Number(detail.x), y: Number(detail.y) }
    : readPanOffset();
  applyGeometry(offset);
}

function installSourceObserver() {
  const source = findSourceCanvas();
  if (!(source instanceof HTMLCanvasElement)) return;
  if (observedSource === source && sourceObserver) return;
  sourceObserver?.disconnect();
  observedSource = source;
  sourceObserver = new MutationObserver(() => {
    if (!applying) requestAnimationFrame(() => applyGeometry());
  });
  sourceObserver.observe(source, { attributes: true, attributeFilter: ['style', 'hidden'] });
}

function scheduleBindings() {
  cancelAnimationFrame(bindingFrame);
  bindingFrame = requestAnimationFrame(() => {
    bindControls();
    applyGeometry();
    installSourceObserver();
  });
}

function installBindingObserver() {
  bindingObserver?.disconnect();
  bindingObserver = new MutationObserver((records) => {
    if (records.some((record) => record.addedNodes.length || record.removedNodes.length)) scheduleBindings();
  });
  bindingObserver.observe(document.body, { childList: true, subtree: true });
}

function install() {
  if (typeof window === 'undefined'
    || typeof document === 'undefined'
    || !wheelMode()
    || window[STATE_KEY]) return;

  persist();
  window.addEventListener('pointerdown', globalPointerFallback, true);
  window.addEventListener('gannzilla:page-scrollbar-pan-v305', onPan, false);
  window.addEventListener('gannzilla:wheel-pan-offset-v305', onPan, false);
  window.addEventListener('gannzilla:final-wheel-authority-v506', () => {
    applyGeometry();
    scheduleRender('source-redraw-v515', 35);
  }, false);
  window.addEventListener('resize', () => applyGeometry(), false);
  document.addEventListener('fullscreenchange', () => applyGeometry(), false);

  bindControls();
  applyGeometry();
  installSourceObserver();
  installBindingObserver();
  scheduleRender('install-v515', 40);
  [60, 160, 360, 800, 1600, 3200, 6400].forEach((delay) => setTimeout(() => {
    bindControls();
    applyGeometry();
    installSourceObserver();
    scheduleRender(`boot-${delay}-v515`, 25);
  }, delay));

  window.GANNZILLA_UNIFIED_PAINT_PREVIEW_ZOOM_V515 = true;
  window.__auditGannzillaUnifiedPaintPreviewZoomV515 = () => {
    const source = findSourceCanvas();
    const preview = document.getElementById(PREVIEW_ID);
    const zoomIn = document.getElementById(ZOOM_IN_ID);
    const zoomOut = document.getElementById(ZOOM_OUT_ID);
    const select = document.getElementById(ZOOM_SELECT_ID);
    const expected = displaySize();
    const actual = preview?.getBoundingClientRect().width || 0;
    return {
      ok: source instanceof HTMLCanvasElement
        && preview instanceof HTMLImageElement
        && zoomIn?.dataset?.gannzillaUnifiedPaintPreviewZoomV515 === 'true'
        && zoomOut?.dataset?.gannzillaUnifiedPaintPreviewZoomV515 === 'true'
        && select?.dataset?.gannzillaUnifiedPaintPreviewZoomV515 === 'true'
        && Math.abs(actual - expected) < 1,
      build: BUILD,
      currentPercent,
      minPercent: settings().min,
      maxPercent: settings().max,
      stepPercent: settings().step,
      expectedDisplaySize: expected,
      actualDisplaySize: actual,
      zoomInDirectBound: zoomIn?.dataset?.gannzillaUnifiedPaintPreviewZoomV515 === 'true',
      zoomOutDirectBound: zoomOut?.dataset?.gannzillaUnifiedPaintPreviewZoomV515 === 'true',
      actionCount,
      renderCount,
      lastAction,
      lastRender,
    };
  };

  window[STATE_KEY] = {
    applyPercent,
    applyGeometry,
    bindControls,
    scheduleRender,
    onPan,
    globalPointerFallback,
    get sourceObserver() { return sourceObserver; },
    get bindingObserver() { return bindingObserver; },
  };
}

install();