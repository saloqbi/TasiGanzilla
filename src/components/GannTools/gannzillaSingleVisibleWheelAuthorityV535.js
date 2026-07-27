const BUILD = 535;
const STATE_KEY = '__gannzillaSingleVisibleWheelAuthorityV535';
const PREVIEW_ID = 'gannzilla-fixed-paint-preview-v512';
const DRAWING_OVERLAY_ID = 'gannzilla-top-center-drawing-overlay-v471';

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

function findSourceCanvas() {
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
      && canvas.id !== DRAWING_OVERLAY_ID
      && canvas.width > 300
      && canvas.height > 300)
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('singleVisibleWheelAuthority', 'true');
    url.searchParams.set('liveCanvasDisplay', 'true');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime display remains authoritative.
  }
}

let applyCount = 0;
let hiddenCanvasCount = 0;
let lastApply = null;
let frame = 0;
let timer = 0;
let observer = null;
let observedSource = null;
let observedPreview = null;

function setImportant(element, name, value) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.style.getPropertyValue(name) === value
      && element.style.getPropertyPriority(name) === 'important') return false;
  element.style.setProperty(name, value, 'important');
  return true;
}

function hideDuplicateCanvases(source) {
  const sourceRect = source.getBoundingClientRect();
  let hidden = 0;

  Array.from(document.querySelectorAll('canvas')).forEach((canvas) => {
    if (!(canvas instanceof HTMLCanvasElement)
        || canvas === source
        || canvas.id === DRAWING_OVERLAY_ID
        || canvas.closest('aside')) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width < 250 || rect.height < 250) return;

    const sameStage = canvas.parentElement === source.parentElement;
    const similarCenter = Math.abs((rect.left + rect.width / 2) - (sourceRect.left + sourceRect.width / 2)) < 12
      && Math.abs((rect.top + rect.height / 2) - (sourceRect.top + sourceRect.height / 2)) < 12;
    if (!sameStage && !similarCenter) return;

    canvas.dataset.gannzillaDuplicateWheelHiddenV535 = 'true';
    canvas.setAttribute('aria-hidden', 'true');
    setImportant(canvas, 'display', 'none');
    setImportant(canvas, 'visibility', 'hidden');
    setImportant(canvas, 'opacity', '0');
    setImportant(canvas, 'pointer-events', 'none');
    hidden += 1;
  });

  hiddenCanvasCount += hidden;
  return hidden;
}

function bindStyleObserver(source, preview) {
  if (observedSource === source && observedPreview === preview && observer) return;
  observer?.disconnect();
  observedSource = source;
  observedPreview = preview;
  observer = new MutationObserver(() => schedule('style-mutation', 0));
  observer.observe(source, { attributes: true, attributeFilter: ['style', 'hidden', 'class'] });
  if (preview instanceof HTMLImageElement) {
    observer.observe(preview, { attributes: true, attributeFilter: ['style', 'hidden', 'class', 'src'] });
  }
}

function enforceSingleVisibleWheel(sourceName = 'apply') {
  const source = findSourceCanvas();
  if (!(source instanceof HTMLCanvasElement)) return false;

  const preview = document.getElementById(PREVIEW_ID);

  source.removeAttribute('aria-hidden');
  source.dataset.gannzillaSingleVisibleWheelAuthorityV535 = 'true';
  setImportant(source, 'opacity', '1');
  setImportant(source, 'visibility', 'visible');
  setImportant(source, 'pointer-events', 'auto');
  setImportant(source, 'z-index', '3');

  if (preview instanceof HTMLImageElement) {
    preview.dataset.gannzillaPreviewSuppressedV535 = 'true';
    preview.setAttribute('aria-hidden', 'true');
    setImportant(preview, 'display', 'none');
    setImportant(preview, 'visibility', 'hidden');
    setImportant(preview, 'opacity', '0');
    setImportant(preview, 'pointer-events', 'none');
    setImportant(preview, 'z-index', '1');
  }

  const hidden = hideDuplicateCanvases(source);
  bindStyleObserver(source, preview);

  applyCount += 1;
  lastApply = {
    source: sourceName,
    build: BUILD,
    previewSuppressed: preview instanceof HTMLImageElement,
    hiddenDuplicateCanvases: hidden,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:single-visible-wheel-v535', { detail: lastApply }));
  return true;
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => enforceSingleVisibleWheel(source));
  }, delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !wheelMode()
      || !boolParam('singleVisibleWheelAuthority', true)
      || window[STATE_KEY]) return;

  persistFlags();

  [
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:zodiac-outer-ring-v522',
    'gannzilla:weekdays-outer-ring-v523',
    'gannzilla:metallic-angle-outer-ring-v531',
    'gannzilla:paint-zoom-v515',
  ].forEach((eventName) => {
    window.addEventListener(eventName, () => schedule(eventName, 0), false);
  });

  window.addEventListener('resize', () => schedule('resize', 0), false);

  const domObserver = new MutationObserver(() => schedule('dom-mutation', 0));
  domObserver.observe(document.body, { childList: true, subtree: true });

  [0, 60, 160, 360, 800, 1600, 3200, 6400, 10000].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });

  window.GANNZILLA_SINGLE_VISIBLE_WHEEL_AUTHORITY_V535 = true;
  window.__auditGannzillaSingleVisibleWheelAuthorityV535 = () => {
    const source = findSourceCanvas();
    const preview = document.getElementById(PREVIEW_ID);
    const sourceStyle = source instanceof HTMLCanvasElement ? getComputedStyle(source) : null;
    const previewStyle = preview instanceof HTMLImageElement ? getComputedStyle(preview) : null;
    const visibleWheelCanvases = Array.from(document.querySelectorAll('canvas'))
      .filter((canvas) => canvas instanceof HTMLCanvasElement
        && !canvas.closest('aside')
        && canvas.id !== DRAWING_OVERLAY_ID
        && canvas.getBoundingClientRect().width > 250
        && canvas.getBoundingClientRect().height > 250
        && getComputedStyle(canvas).display !== 'none'
        && getComputedStyle(canvas).visibility !== 'hidden'
        && Number(getComputedStyle(canvas).opacity) > 0.01);

    return {
      ok: source instanceof HTMLCanvasElement
        && sourceStyle?.visibility !== 'hidden'
        && Number(sourceStyle?.opacity || 0) > 0.99
        && (!(preview instanceof HTMLImageElement)
          || previewStyle?.display === 'none'
          || previewStyle?.visibility === 'hidden'
          || Number(previewStyle?.opacity || 0) < 0.01)
        && visibleWheelCanvases.length === 1,
      build: BUILD,
      sourceVisible: source instanceof HTMLCanvasElement
        && sourceStyle?.visibility !== 'hidden'
        && Number(sourceStyle?.opacity || 0) > 0.99,
      previewSuppressed: !(preview instanceof HTMLImageElement)
        || previewStyle?.display === 'none'
        || previewStyle?.visibility === 'hidden'
        || Number(previewStyle?.opacity || 0) < 0.01,
      visibleWheelCanvasCount: visibleWheelCanvases.length,
      applyCount,
      hiddenCanvasCount,
      lastApply,
    };
  };

  window[STATE_KEY] = {
    enforceSingleVisibleWheel,
    schedule,
    domObserver,
    get observer() { return observer; },
  };
}

install();
