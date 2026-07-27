const BUILD = 526;
const STATE_KEY = '__gannzillaAnglePreviewBridgeV526';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

let refreshCount = 0;
let lastRefresh = null;
let timer = 0;

function refreshVisibleComposite(source = 'refresh') {
  const angleAudit = window.__auditGannzillaAngleOuterRingV525?.();
  const previewAuthority = window.__gannzillaUnifiedPaintPreviewZoomV515;
  if (angleAudit?.ok !== true
      || !previewAuthority
      || typeof previewAuthority.scheduleRender !== 'function') return false;

  previewAuthority.applyGeometry?.();
  previewAuthority.scheduleRender(`angle-composite-${source}-v526`, 0);
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
    [0, 50, 160, 420, 1000].forEach((delay) => {
      window.setTimeout(() => refreshVisibleComposite(`${source}-${delay}`), delay);
    });
  }, 0);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !wheelMode()
      || window[STATE_KEY]) return;

  window.addEventListener('gannzilla:angle-outer-ring-v525', () => {
    schedule('angle-v525');
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

  [100, 280, 680, 1500, 3200, 6400, 10000].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  window.GANNZILLA_ANGLE_PREVIEW_BRIDGE_V526 = true;
  window.__auditGannzillaAnglePreviewBridgeV526 = () => {
    const angleAudit = window.__auditGannzillaAngleOuterRingV525?.();
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
