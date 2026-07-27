const BUILD = 534;
const STATE_KEY = '__gannzillaReferenceAnglePreviewBridgeV534';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function persistVersion() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime rendering remains authoritative.
  }
}

let refreshCount = 0;
let lastRefresh = null;
let timer = 0;

function refreshVisibleComposite(source = 'refresh') {
  const angleAudit = window.__auditGannzillaReferenceAngleOuterRingV533?.();
  const previewAuthority = window.__gannzillaUnifiedPaintPreviewZoomV515;
  if (angleAudit?.ok !== true
      || !previewAuthority
      || typeof previewAuthority.scheduleRender !== 'function') return false;

  previewAuthority.applyGeometry?.();
  previewAuthority.scheduleRender(`reference-angle-composite-${source}-v534`, 0);
  refreshCount += 1;
  lastRefresh = {
    source,
    build: BUILD,
    angleOk: true,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule') {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    [0, 50, 170, 440, 1050].forEach((delay) => {
      window.setTimeout(() => refreshVisibleComposite(`${source}-${delay}`), delay);
    });
  }, 0);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !wheelMode()
      || window[STATE_KEY]) return;

  persistVersion();

  window.addEventListener('gannzilla:reference-angle-outer-ring-v533', () => {
    schedule('angle-v533');
  }, false);
  window.addEventListener('gannzilla:weekdays-outer-ring-v523', () => {
    schedule('weekdays-v523');
  }, false);
  window.addEventListener('gannzilla:zodiac-outer-ring-v522', () => {
    schedule('zodiac-v522');
  }, false);
  window.addEventListener('gannzilla:empty-outer-ring-v518', () => {
    schedule('outer-ring-v518');
  }, false);

  [100, 300, 720, 1600, 3400, 6800, 10400].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  window.GANNZILLA_REFERENCE_ANGLE_PREVIEW_BRIDGE_V534 = true;
  window.__auditGannzillaReferenceAnglePreviewBridgeV534 = () => {
    const angleAudit = window.__auditGannzillaReferenceAngleOuterRingV533?.();
    const previewAudit = window.__auditGannzillaUnifiedPaintPreviewZoomV515?.();
    return {
      ok: angleAudit?.ok === true
        && previewAudit?.ok === true
        && refreshCount > 0,
      build: BUILD,
      angleOk: angleAudit?.ok === true,
      previewOk: previewAudit?.ok === true,
      refreshCount,
      lastRefresh,
    };
  };

  window[STATE_KEY] = { schedule, refreshVisibleComposite };
}

install();