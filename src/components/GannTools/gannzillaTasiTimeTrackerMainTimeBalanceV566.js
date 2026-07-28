const BUILD = 566;
const STATE_KEY = '__gannzillaTasiTimeTrackerMainTimeBalanceV566';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-main-time-balance-v566';
const ROW_CLASS = 'tasi-digital-root-row-v564';
const RESULT_CLASS = 'tasi-digital-root-result-v564';

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
    && boolParam('timeTrackerDigitalRootVisible', true)
    && boolParam('timeTrackerDigitalRootScale', true)
    && boolParam('timeTrackerMainTimeBalance', true);
}

function cssText() {
  return `
    .current-time {
      padding-left: 42px !important;
      padding-right: 6px !important;
    }

    .current-time > .${ROW_CLASS} {
      transform: translateX(30px) !important;
    }

    .current-time .time-subtitle {
      transform: translateX(30px) !important;
    }

    .metric.angle > .${ROW_CLASS} > .${RESULT_CLASS} {
      transform: translateX(-8px) !important;
    }

    @media (max-width: 1180px) {
      .current-time {
        padding-left: 32px !important;
        padding-right: 5px !important;
      }

      .current-time > .${ROW_CLASS} {
        transform: translateX(22px) !important;
      }

      .current-time .time-subtitle {
        transform: translateX(22px) !important;
      }

      .metric.angle > .${ROW_CLASS} > .${RESULT_CLASS} {
        transform: translateX(-6px) !important;
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
  if (!(host instanceof HTMLElement) || !(shadow instanceof ShadowRoot)) return false;

  let style = shadow.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = cssText();
    shadow.appendChild(style);
  }

  const timeRow = shadow.querySelector(`.current-time > .${ROW_CLASS}`);
  const angleResult = shadow.querySelector(`.metric.angle > .${ROW_CLASS} > .${RESULT_CLASS}`);
  const ready = timeRow instanceof HTMLElement && angleResult instanceof HTMLElement;

  host.dataset.gannzillaTasiTimeTrackerMainTimeBalanceV566 = 'true';
  host.dataset.gannzillaTasiTimeTrackerMainTimeShiftRightV566 = '30';
  host.dataset.gannzillaTasiTimeTrackerAngleRootShiftLeftV566 = '8';
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV566 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    mainTimeShiftRightPx: window.innerWidth < 1180 ? 22 : 30,
    angleRootShiftLeftPx: window.innerWidth < 1180 ? 6 : 8,
    ready,
    canvasChanged: false,
    at: Date.now(),
  };
  return ready;
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

  window.GANNZILLA_TASI_TIME_TRACKER_MAIN_TIME_BALANCE_V566 = true;
  window.__auditGannzillaTasiTimeTrackerMainTimeBalanceV566 = () => {
    const host = document.getElementById(HOST_ID);
    const shadow = host?.shadowRoot;
    return {
      ok: host instanceof HTMLElement
        && shadow instanceof ShadowRoot
        && host.dataset.gannzillaTasiTimeTrackerMainTimeBalanceV566 === 'true'
        && shadow.getElementById(STYLE_ID) instanceof HTMLStyleElement,
      build: BUILD,
      applyCount,
      mainTimeShiftRightPx: host?.dataset?.gannzillaTasiTimeTrackerMainTimeShiftRightV566 || null,
      angleRootShiftLeftPx: host?.dataset?.gannzillaTasiTimeTrackerAngleRootShiftLeftV566 || null,
      canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV566 === 'true',
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, observer };
  schedule('install', 0);
}

install();
