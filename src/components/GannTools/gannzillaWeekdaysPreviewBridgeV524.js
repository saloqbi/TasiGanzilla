const BUILD = 524;
const STATE_KEY = '__gannzillaWeekdaysPreviewBridgeV524';

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
  const weekdaysAudit = window.__auditGannzillaWeekdaysOuterRingV523?.();
  const previewAuthority = window.__gannzillaUnifiedPaintPreviewZoomV515;
  if (weekdaysAudit?.ok !== true
      || !previewAuthority
      || typeof previewAuthority.scheduleRender !== 'function') return false;

  previewAuthority.applyGeometry?.();
  previewAuthority.scheduleRender(`weekdays-composite-${source}-v524`, 0);
  refreshCount += 1;
  lastRefresh = {
    source,
    build: BUILD,
    weekdaysOk: true,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule') {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    [0, 40, 140, 360, 900].forEach((delay) => {
      window.setTimeout(() => refreshVisibleComposite(`${source}-${delay}`), delay);
    });
  }, 0);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !wheelMode()
      || window[STATE_KEY]) return;

  window.addEventListener('gannzilla:weekdays-outer-ring-v523', () => {
    schedule('weekdays-v523');
  }, false);
  window.addEventListener('gannzilla:zodiac-outer-ring-v522', () => {
    schedule('zodiac-v522');
  }, false);
  window.addEventListener('gannzilla:empty-outer-ring-v518', () => {
    schedule('outer-ring-v518');
  }, false);

  [80, 220, 520, 1200, 2600, 5200, 9000].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  window.GANNZILLA_WEEKDAYS_PREVIEW_BRIDGE_V524 = true;
  window.__auditGannzillaWeekdaysPreviewBridgeV524 = () => {
    const weekdaysAudit = window.__auditGannzillaWeekdaysOuterRingV523?.();
    const previewAudit = window.__auditGannzillaUnifiedPaintPreviewZoomV515?.();
    return {
      ok: weekdaysAudit?.ok === true
        && previewAudit?.ok === true
        && refreshCount > 0,
      build: BUILD,
      weekdaysOk: weekdaysAudit?.ok === true,
      previewOk: previewAudit?.ok === true,
      refreshCount,
      lastRefresh,
    };
  };

  window[STATE_KEY] = { schedule, refreshVisibleComposite };
}

install();
