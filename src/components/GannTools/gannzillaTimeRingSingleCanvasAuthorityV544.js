const BUILD = 544;
const STATE_KEY = '__gannzillaTimeRingSingleCanvasAuthorityV544';
const V515_STATE_KEY = '__gannzillaUnifiedPaintPreviewZoomV515';
const V543_STATE_KEY = '__gannzillaIndependentTimeRingV543';
const PREVIEW_ID = 'gannzilla-fixed-paint-preview-v512';
const DRAWING_OVERLAY_ID = 'gannzilla-top-center-drawing-overlay-v471';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function boolParam(name, fallback = false) {
  const query = params();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function enabled() {
  return wheelMode()
    && boolParam('timeRing', false)
    && boolParam('gannzillaIndependentTimeRing', true);
}

function findSourceCanvas() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-independent-time-ring-v543="true"]',
    'canvas[data-gannzilla-empty-outer-ring-v518="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v506="true"]',
  ].join(','));
  if (preferred instanceof HTMLCanvasElement && !preferred.closest('aside')) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => canvas instanceof HTMLCanvasElement
      && !canvas.closest('aside')
      && canvas.id !== DRAWING_OVERLAY_ID
      && canvas.width > 300
      && canvas.height > 300)
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

function setImportant(element, name, value) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.style.getPropertyValue(name) === value
      && element.style.getPropertyPriority(name) === 'important') return false;
  element.style.setProperty(name, value, 'important');
  return true;
}

function disconnectPreviewObservers() {
  const authority = window[V515_STATE_KEY];
  let disconnected = 0;
  [authority?.sourceObserver, authority?.bindingObserver].forEach((observer) => {
    if (observer && typeof observer.disconnect === 'function') {
      observer.disconnect();
      disconnected += 1;
    }
  });
  return disconnected;
}

function hidePreviewImages() {
  let hidden = 0;
  Array.from(document.querySelectorAll('img')).forEach((image) => {
    if (!(image instanceof HTMLImageElement)) return;
    const isPaintPreview = image.id === PREVIEW_ID
      || image.dataset.gannzillaUnifiedPaintPreviewZoomV515 === 'true'
      || image.dataset.gannzillaPreviewSuppressedV535 === 'true'
      || String(image.alt || '').toLowerCase().includes('gannzilla paint preview');
    if (!isPaintPreview) return;

    image.dataset.gannzillaTimeRingPreviewHiddenV544 = 'true';
    image.hidden = true;
    image.setAttribute('aria-hidden', 'true');
    setImportant(image, 'display', 'none');
    setImportant(image, 'visibility', 'hidden');
    setImportant(image, 'opacity', '0');
    setImportant(image, 'pointer-events', 'none');
    setImportant(image, 'z-index', '0');
    hidden += 1;
  });
  return hidden;
}

function hideDuplicateCanvases(source) {
  let hidden = 0;
  Array.from(document.querySelectorAll('canvas')).forEach((canvas) => {
    if (!(canvas instanceof HTMLCanvasElement)
        || canvas === source
        || canvas.id === DRAWING_OVERLAY_ID
        || canvas.closest('aside')) return;

    const rect = canvas.getBoundingClientRect();
    const large = canvas.width > 300
      && canvas.height > 300
      && (rect.width > 220 || rect.height > 220);
    if (!large) return;

    canvas.dataset.gannzillaTimeRingDuplicateHiddenV544 = 'true';
    canvas.setAttribute('aria-hidden', 'true');
    setImportant(canvas, 'display', 'none');
    setImportant(canvas, 'visibility', 'hidden');
    setImportant(canvas, 'opacity', '0');
    setImportant(canvas, 'pointer-events', 'none');
    setImportant(canvas, 'z-index', '0');
    hidden += 1;
  });
  return hidden;
}

function showSourceCanvas(source) {
  source.hidden = false;
  source.removeAttribute('aria-hidden');
  source.dataset.gannzillaTimeRingSingleCanvasAuthorityV544 = 'true';
  source.dataset.gannzillaLiveCanvasDisplayV544 = 'true';
  setImportant(source, 'display', 'block');
  setImportant(source, 'visibility', 'visible');
  setImportant(source, 'opacity', '1');
  setImportant(source, 'pointer-events', 'auto');
  setImportant(source, 'z-index', '5');
}

let applyCount = 0;
let hiddenPreviewCount = 0;
let hiddenCanvasCount = 0;
let disconnectedObserverCount = 0;
let lastApply = null;
let timer = 0;
let frame = 0;
let observer = null;
let applying = false;

function redrawV543(source = 'v544-redraw') {
  const authority = window[V543_STATE_KEY];
  if (!authority || typeof authority.drawIndependentTimeRing !== 'function') return false;
  return authority.drawIndependentTimeRing(source, true) === true;
}

function enforce(sourceName = 'apply', requestRedraw = false) {
  if (!enabled() || applying) return false;
  applying = true;

  disconnectedObserverCount += disconnectPreviewObservers();
  const source = findSourceCanvas();
  if (!(source instanceof HTMLCanvasElement)) {
    applying = false;
    return false;
  }

  if (requestRedraw) redrawV543(`${sourceName}:v543`);
  showSourceCanvas(source);
  const hiddenPreviews = hidePreviewImages();
  const hiddenCanvases = hideDuplicateCanvases(source);
  hiddenPreviewCount += hiddenPreviews;
  hiddenCanvasCount += hiddenCanvases;

  source.dataset.gannzillaTimeRingRefreshDuplicateFixedV544 = 'true';
  source.dataset.gannzillaTimeRingVisibleCanvasCountV544 = '1';
  source.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source: sourceName,
    build: BUILD,
    hiddenPreviews,
    hiddenCanvases,
    requestRedraw,
    at: Date.now(),
  };

  applying = false;
  window.dispatchEvent(new CustomEvent('gannzilla:time-ring-single-canvas-v544', { detail: lastApply }));
  return true;
}

function schedule(source = 'schedule', delay = 0, requestRedraw = false) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => enforce(source, requestRedraw));
  }, delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  observer = new MutationObserver(() => schedule('dom-or-style-mutation', 0, false));
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'hidden', 'class', 'src'],
  });

  [
    'gannzilla:independent-time-ring-v543',
    'gannzilla:paint-zoom-v515',
    'gannzilla:single-visible-wheel-v535',
    'gannzilla:page-scrollbar-pan-v305',
    'gannzilla:wheel-input-v459',
  ].forEach((eventName) => {
    window.addEventListener(eventName, () => schedule(eventName, 8, false), false);
  });
  window.addEventListener('resize', () => schedule('resize', 10, true), false);
  window.addEventListener('load', () => schedule('load', 20, true), { once: true });

  [0, 80, 200, 420, 900, 1700, 3300, 6500, 10600, 13600].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0, delay >= 900), delay);
  });

  window.GANNZILLA_TIME_RING_SINGLE_CANVAS_AUTHORITY_V544 = true;
  window.__auditGannzillaTimeRingSingleCanvasAuthorityV544 = () => {
    const source = findSourceCanvas();
    const preview = document.getElementById(PREVIEW_ID);
    const visibleLargeCanvases = Array.from(document.querySelectorAll('canvas'))
      .filter((canvas) => canvas instanceof HTMLCanvasElement
        && !canvas.closest('aside')
        && canvas.id !== DRAWING_OVERLAY_ID
        && canvas.width > 300
        && canvas.height > 300
        && canvas.getBoundingClientRect().width > 220
        && canvas.getBoundingClientRect().height > 220
        && getComputedStyle(canvas).display !== 'none'
        && getComputedStyle(canvas).visibility !== 'hidden'
        && Number(getComputedStyle(canvas).opacity) > 0.01);
    const sourceStyle = source instanceof HTMLCanvasElement ? getComputedStyle(source) : null;
    const previewStyle = preview instanceof HTMLImageElement ? getComputedStyle(preview) : null;

    return {
      ok: source instanceof HTMLCanvasElement
        && source.dataset.gannzillaTimeRingRefreshDuplicateFixedV544 === 'true'
        && sourceStyle?.display !== 'none'
        && sourceStyle?.visibility !== 'hidden'
        && Number(sourceStyle?.opacity || 0) > 0.99
        && visibleLargeCanvases.length === 1
        && (!(preview instanceof HTMLImageElement)
          || previewStyle?.display === 'none'
          || previewStyle?.visibility === 'hidden'
          || Number(previewStyle?.opacity || 0) < 0.01),
      build: BUILD,
      visibleLargeCanvasCount: visibleLargeCanvases.length,
      previewHidden: !(preview instanceof HTMLImageElement)
        || previewStyle?.display === 'none'
        || previewStyle?.visibility === 'hidden'
        || Number(previewStyle?.opacity || 0) < 0.01,
      disconnectedObserverCount,
      hiddenPreviewCount,
      hiddenCanvasCount,
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = {
    enforce,
    schedule,
    redrawV543,
    observer,
  };

  schedule('install', 0, true);
}

install();