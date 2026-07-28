const BUILD = 570;
const STATE_KEY = '__gannzillaTasiTimeTrackerFinalRightV570';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-final-right-v570';
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
    && boolParam('timeTrackerMainTimeRightCenter', true)
    && boolParam('timeTrackerFinalRight', true);
}

function cssText() {
  return `
    .current-time > .${ROW_CLASS} {
      transform: translateX(calc(var(--tt-main-time-right-shift, 0px) + 6px)) !important;
    }

    .current-time .time-subtitle {
      transform: translateX(calc(var(--tt-main-time-right-shift, 0px) + 6px)) !important;
    }

    @media (max-width: 1180px) {
      .current-time > .${ROW_CLASS},
      .current-time .time-subtitle {
        transform: translateX(calc(var(--tt-main-time-right-shift, 0px) + 5px)) !important;
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
  const row = shadow?.querySelector(`.current-time > .${ROW_CLASS}`);
  if (!(host instanceof HTMLElement)
      || !(shadow instanceof ShadowRoot)
      || !(row instanceof HTMLElement)) return false;

  let style = shadow.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = cssText();
    shadow.appendChild(style);
  }

  const nudge = window.innerWidth < 1180 ? 5 : 6;
  host.dataset.gannzillaTasiTimeTrackerFinalRightV570 = 'true';
  host.dataset.gannzillaTasiTimeTrackerFinalRightPxV570 = String(nudge);
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV570 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    nudgeRightPx: nudge,
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

  window.GANNZILLA_TASI_TIME_TRACKER_FINAL_RIGHT_V570 = true;
  window.__auditGannzillaTasiTimeTrackerFinalRightV570 = () => {
    const host = document.getElementById(HOST_ID);
    const shadow = host?.shadowRoot;
    return {
      ok: host instanceof HTMLElement
        && shadow instanceof ShadowRoot
        && host.dataset.gannzillaTasiTimeTrackerFinalRightV570 === 'true'
        && shadow.getElementById(STYLE_ID) instanceof HTMLStyleElement,
      build: BUILD,
      applyCount,
      nudgeRightPx: Number(host?.dataset?.gannzillaTasiTimeTrackerFinalRightPxV570 || 0),
      canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV570 === 'true',
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, observer };
  schedule('install', 0);
}

install();
