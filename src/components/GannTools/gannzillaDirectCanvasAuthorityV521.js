const BUILD = 521;
const STATE_KEY = '__gannzillaDirectCanvasAuthorityV521';
const PREVIEW_ID = 'gannzilla-fixed-paint-preview-v512';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function findCanvas() {
  const preferred = document.querySelector('canvas[data-gannzilla-final-wheel-authority-v506="true"]');
  if (preferred instanceof HTMLCanvasElement && !preferred.closest('aside')) return preferred;
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => canvas instanceof HTMLCanvasElement
      && !canvas.closest('aside')
      && canvas.width > 300
      && canvas.height > 300)
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

function persistCanonicalUrl() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('gannzillaZoom', '0.85');
    url.searchParams.set('gannzillaReferenceZoomCalibration', '1');
    url.searchParams.set('directCanvas', 'true');
    url.searchParams.set('directCanvasViewportPercent', '82');
    url.searchParams.set('paintPreview', 'false');
    url.searchParams.set('zodiacOuterRing', 'true');
    url.searchParams.set('zodiacSequence', '1-36');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime presentation remains authoritative.
  }
}

function disableBitmapAuthority() {
  const authority = window.__gannzillaUnifiedPaintPreviewZoomV515;
  try { authority?.sourceObserver?.disconnect?.(); } catch (_) { /* no-op */ }
  try { authority?.bindingObserver?.disconnect?.(); } catch (_) { /* no-op */ }

  if (authority && typeof authority === 'object') {
    try { authority.applyGeometry = () => false; } catch (_) { /* no-op */ }
    try { authority.scheduleRender = () => false; } catch (_) { /* no-op */ }
  }

  const preview = document.getElementById(PREVIEW_ID);
  if (preview instanceof HTMLElement) {
    preview.style.setProperty('display', 'none', 'important');
    preview.style.setProperty('visibility', 'hidden', 'important');
    preview.style.setProperty('opacity', '0', 'important');
    preview.style.setProperty('pointer-events', 'none', 'important');
  }
}

let applyCount = 0;
let lastApply = null;
let frame = 0;
let observer = null;

function applyDirectCanvas(source = 'apply') {
  const canvas = findCanvas();
  if (!(canvas instanceof HTMLCanvasElement)) return false;

  disableBitmapAuthority();

  const stage = canvas.parentElement;
  if (stage instanceof HTMLElement) {
    stage.style.setProperty('position', 'relative', 'important');
    stage.style.setProperty('display', 'grid', 'important');
    stage.style.setProperty('place-items', 'center', 'important');
    stage.style.setProperty('overflow', 'auto', 'important');
    stage.style.setProperty('min-width', '0', 'important');
    stage.style.setProperty('min-height', '0', 'important');
  }

  const query = params();
  const viewportPercent = Math.max(45, Math.min(92,
    Number(query.get('directCanvasViewportPercent')) || 82));
  const exact = `min(${viewportPercent}vw, ${viewportPercent}vh)`;

  canvas.style.setProperty('display', 'block', 'important');
  canvas.style.setProperty('visibility', 'visible', 'important');
  canvas.style.setProperty('opacity', '1', 'important');
  canvas.style.setProperty('width', exact, 'important');
  canvas.style.setProperty('height', exact, 'important');
  canvas.style.setProperty('min-width', '0', 'important');
  canvas.style.setProperty('min-height', '0', 'important');
  canvas.style.setProperty('max-width', 'none', 'important');
  canvas.style.setProperty('max-height', 'none', 'important');
  canvas.style.setProperty('transform', 'none', 'important');
  canvas.style.setProperty('transform-origin', 'center center', 'important');
  canvas.style.setProperty('image-rendering', 'auto', 'important');
  canvas.style.setProperty('place-self', 'center', 'important');
  canvas.style.setProperty('z-index', '5', 'important');

  canvas.dataset.gannzillaDirectCanvasAuthorityV521 = 'true';
  canvas.dataset.gannzillaDirectCanvasViewportPercentV521 = String(viewportPercent);
  canvas.dataset.gannzillaBitmapPreviewDisabledV521 = 'true';
  canvas.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    viewportPercent,
    bitmapPreviewDisabled: true,
    directCanvasVisible: true,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:direct-canvas-v521', { detail: lastApply }));
  return true;
}

function schedule(source = 'schedule') {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => applyDirectCanvas(source));
}

function installObserver() {
  observer?.disconnect();
  observer = new MutationObserver(() => schedule('mutation'));
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'src', 'width', 'height'],
  });
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !wheelMode()
      || window[STATE_KEY]) return;

  persistCanonicalUrl();
  disableBitmapAuthority();

  const finalAuthority = window.__gannzillaFinalWheelAuthorityV506;
  try { finalAuthority?.schedule?.('direct-canvas-v521', [0, 120, 360]); } catch (_) { /* no-op */ }

  window.addEventListener('gannzilla:final-wheel-authority-v506', () => schedule('final-wheel-v506'), false);
  window.addEventListener('gannzilla:empty-outer-ring-v518', () => schedule('outer-ring-v518'), false);
  window.addEventListener('gannzilla:zodiac-outer-ring-v519', () => schedule('zodiac-v519'), false);
  window.addEventListener('resize', () => schedule('resize'), false);

  installObserver();
  [0, 80, 220, 600, 1400, 3000, 6000].forEach((delay) =>
    setTimeout(() => schedule(`boot-${delay}`), delay));

  window.GANNZILLA_DIRECT_CANVAS_AUTHORITY_V521 = true;
  window.__auditGannzillaDirectCanvasAuthorityV521 = () => {
    const canvas = findCanvas();
    const preview = document.getElementById(PREVIEW_ID);
    const previewHidden = !(preview instanceof HTMLElement)
      || getComputedStyle(preview).display === 'none'
      || getComputedStyle(preview).visibility === 'hidden';
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaDirectCanvasAuthorityV521 === 'true'
        && canvas.dataset.gannzillaBitmapPreviewDisabledV521 === 'true'
        && getComputedStyle(canvas).visibility === 'visible'
        && Number(getComputedStyle(canvas).opacity) === 1
        && previewHidden,
      build: BUILD,
      directCanvasVisible: canvas instanceof HTMLCanvasElement
        && getComputedStyle(canvas).visibility === 'visible',
      previewHidden,
      viewportPercent: Number(canvas?.dataset?.gannzillaDirectCanvasViewportPercentV521 || 0),
      zodiacAudit: window.__auditGannzillaZodiacOuterRingV519?.() || null,
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { applyDirectCanvas, schedule, disableBitmapAuthority, observer };
  schedule('install');
}

install();
