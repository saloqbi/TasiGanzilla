const BUILD = 569;
const STATE_KEY = '__gannzillaTasiTimeTrackerMainTimeRightCenterV569';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-main-time-right-center-v569';
const ROW_CLASS = 'tasi-digital-root-row-v564';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function boolParam(name, fallback = false) {
  const query = params();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function enabled() {
  const query = params();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  return wheelMode
    && boolParam('timeTracker', false)
    && boolParam('timeTrackerResponsiveFit', true)
    && boolParam('timeTrackerMainTimeRightCenter', true);
}

function cssText() {
  return `
    .current-time {
      box-sizing: border-box !important;
      padding-left: 18px !important;
      padding-right: 18px !important;
      overflow: hidden !important;
    }

    .current-time > .${ROW_CLASS} {
      width: max-content !important;
      min-width: 0 !important;
      max-width: calc(100% - 36px) !important;
      margin: 0 auto !important;
      justify-content: center !important;
      transform: translateX(var(--tt-main-time-right-shift, 0px)) !important;
      transform-origin: center center !important;
      overflow: visible !important;
    }

    .current-time .time-subtitle {
      transform: translateX(var(--tt-main-time-right-shift, 0px)) !important;
      text-align: center !important;
    }

    @media (max-width: 1180px) {
      .current-time {
        padding-left: 15px !important;
        padding-right: 15px !important;
      }

      .current-time > .${ROW_CLASS} {
        max-width: calc(100% - 30px) !important;
      }
    }
  `;
}

let applyCount = 0;
let lastApply = null;
let timer = 0;
let observer = null;

function apply(source = 'apply') {
  if (!enabled()) return false;
  const host = document.getElementById(HOST_ID);
  const shadow = host?.shadowRoot;
  const container = shadow?.querySelector('.current-time');
  const row = shadow?.querySelector(`.current-time > .${ROW_CLASS}`);
  if (!(host instanceof HTMLElement)
      || !(shadow instanceof ShadowRoot)
      || !(container instanceof HTMLElement)
      || !(row instanceof HTMLElement)) return false;

  let style = shadow.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = cssText();
    shadow.appendChild(style);
  }

  const compact = window.innerWidth < 1180;
  const sidePadding = compact ? 15 : 18;
  const desiredShift = compact ? 14 : 20;
  const containerWidth = container.clientWidth;
  const rowWidth = row.scrollWidth;
  const usableWidth = Math.max(0, containerWidth - sidePadding * 2);
  const freeSpace = Math.max(0, usableWidth - rowWidth);
  const safeShift = Math.max(0, Math.min(desiredShift, Math.floor(freeSpace / 2)));

  container.style.setProperty('--tt-main-time-right-shift', `${safeShift}px`, 'important');

  host.dataset.gannzillaTasiTimeTrackerMainTimeRightCenterV569 = 'true';
  host.dataset.gannzillaTasiTimeTrackerMainTimeShiftV569 = String(safeShift);
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV569 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    containerWidth,
    rowWidth,
    usableWidth,
    freeSpace,
    safeShift,
    canvasChanged: false,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => requestAnimationFrame(() => apply(source)), delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  observer = new MutationObserver(() => schedule('dom-mutation', 10));
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', () => schedule('resize', 0), false);

  [0, 80, 220, 600, 1400, 3200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });

  window.GANNZILLA_TASI_TIME_TRACKER_MAIN_TIME_RIGHT_CENTER_V569 = true;
  window.__auditGannzillaTasiTimeTrackerMainTimeRightCenterV569 = () => {
    const host = document.getElementById(HOST_ID);
    const shadow = host?.shadowRoot;
    return {
      ok: host instanceof HTMLElement
        && shadow instanceof ShadowRoot
        && host.dataset.gannzillaTasiTimeTrackerMainTimeRightCenterV569 === 'true'
        && shadow.getElementById(STYLE_ID) instanceof HTMLStyleElement,
      build: BUILD,
      applyCount,
      shiftPx: Number(host?.dataset?.gannzillaTasiTimeTrackerMainTimeShiftV569 || 0),
      canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV569 === 'true',
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, observer };
  schedule('install', 0);
}

install();
