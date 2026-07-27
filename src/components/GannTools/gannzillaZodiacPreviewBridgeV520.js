const BUILD = 520;
const STATE_KEY = '__gannzillaZodiacPreviewBridgeV520';
const ZODIAC_EVENT = 'gannzilla:zodiac-outer-ring-v519';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function persistCanonicalPresentation() {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('paintZoomPercent')) url.searchParams.set('paintZoomPercent', '100');
    if (!url.searchParams.has('paintStageSize')) url.searchParams.set('paintStageSize', '1280');
    if (!url.searchParams.has('paintZoomMin')) url.searchParams.set('paintZoomMin', '50');
    if (!url.searchParams.has('paintZoomMax')) url.searchParams.set('paintZoomMax', '300');
    if (!url.searchParams.has('paintZoomStep')) url.searchParams.set('paintZoomStep', '25');
    url.searchParams.set('gannzillaZoom', '1.00');
    url.searchParams.set('zodiacOuterRing', 'true');
    url.searchParams.set('zodiacSequence', '1-36');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime presentation remains authoritative.
  }
}

let refreshCount = 0;
let lastRefresh = null;

function refreshVisiblePreview(source = 'refresh') {
  const zoomAuthority = window.__gannzillaUnifiedPaintPreviewZoomV515;
  if (!zoomAuthority || typeof zoomAuthority.scheduleRender !== 'function') return false;

  zoomAuthority.applyGeometry?.();
  zoomAuthority.scheduleRender(`zodiac-preview-${source}-v520`, 0);
  refreshCount += 1;
  lastRefresh = { source, build: BUILD, at: Date.now() };
  return true;
}

function scheduleRefresh(source = 'schedule') {
  [0, 40, 140, 360, 900].forEach((delay) => {
    window.setTimeout(() => refreshVisiblePreview(`${source}-${delay}`), delay);
  });
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !wheelMode()
      || window[STATE_KEY]) return;

  persistCanonicalPresentation();

  window.addEventListener(ZODIAC_EVENT, () => scheduleRefresh('zodiac-v519'), false);
  window.addEventListener('gannzilla:empty-outer-ring-v518', () => scheduleRefresh('outer-ring-v518'), false);
  window.addEventListener('gannzilla:final-wheel-authority-v506', () => scheduleRefresh('final-wheel-v506'), false);

  [120, 300, 700, 1500, 3200, 6400].forEach((delay) => {
    window.setTimeout(() => scheduleRefresh(`boot-${delay}`), delay);
  });

  window.GANNZILLA_ZODIAC_PREVIEW_BRIDGE_V520 = true;
  window.__auditGannzillaZodiacPreviewBridgeV520 = () => {
    const zodiacAudit = window.__auditGannzillaZodiacOuterRingV519?.();
    const previewAudit = window.__auditGannzillaUnifiedPaintPreviewZoomV515?.();
    const query = params();
    return {
      ok: zodiacAudit?.ok === true
        && previewAudit?.ok === true
        && Number(query.get('paintZoomPercent')) >= 50
        && query.get('zodiacOuterRing') === 'true',
      build: BUILD,
      paintZoomPercent: Number(query.get('paintZoomPercent') || 0),
      paintStageSize: Number(query.get('paintStageSize') || 0),
      zodiacOk: zodiacAudit?.ok === true,
      previewOk: previewAudit?.ok === true,
      refreshCount,
      lastRefresh,
    };
  };

  window[STATE_KEY] = { scheduleRefresh, refreshVisiblePreview };
}

install();
