const BUILD = 567;
const STATE_KEY = '__gannzillaTasiTimeTrackerMainTimeCenterV567';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-main-time-center-v567';
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
    && boolParam('timeTrackerMainTimeCenter', true);
}

function cssText() {
  return `
    .current-time {
      display: grid !important;
      place-content: center !important;
      justify-items: center !important;
      box-sizing: border-box !important;
      padding-left: 34px !important;
      padding-right: 34px !important;
      overflow: hidden !important;
    }

    .current-time > .${ROW_CLASS} {
      width: 472px !important;
      min-width: 472px !important;
      max-width: 472px !important;
      gap: 12px !important;
      margin: 0 auto !important;
      transform: none !important;
      justify-content: center !important;
      overflow: visible !important;
    }

    .current-time > .${ROW_CLASS} > .time-value {
      flex: 0 0 360px !important;
      width: 360px !important;
      min-width: 360px !important;
      max-width: 360px !important;
      margin: 0 !important;
      padding: 0 !important;
      font-size: 54px !important;
      line-height: 1 !important;
      text-align: center !important;
      transform: none !important;
    }

    .current-time > .${ROW_CLASS} > .${RESULT_CLASS} {
      flex: 0 0 84px !important;
      width: 84px !important;
      min-width: 84px !important;
      max-width: 84px !important;
      font-size: 54px !important;
      line-height: 1 !important;
      text-align: center !important;
      transform: none !important;
    }

    .current-time .time-subtitle {
      width: 472px !important;
      margin: 8px auto 0 !important;
      padding: 0 !important;
      text-align: center !important;
      transform: none !important;
    }

    .identity > div:last-child {
      padding-top: 12px !important;
      padding-bottom: 7px !important;
      transform: none !important;
    }

    .identity > div:last-child .value {
      margin-top: 9px !important;
      transform: translate(4px, 7px) !important;
    }

    @media (max-width: 1180px) {
      .current-time {
        padding-left: 26px !important;
        padding-right: 26px !important;
      }

      .current-time > .${ROW_CLASS} {
        width: 386px !important;
        min-width: 386px !important;
        max-width: 386px !important;
        gap: 9px !important;
        transform: none !important;
      }

      .current-time > .${ROW_CLASS} > .time-value {
        flex-basis: 296px !important;
        width: 296px !important;
        min-width: 296px !important;
        max-width: 296px !important;
        font-size: 46px !important;
      }

      .current-time > .${ROW_CLASS} > .${RESULT_CLASS} {
        flex-basis: 72px !important;
        width: 72px !important;
        min-width: 72px !important;
        max-width: 72px !important;
        font-size: 46px !important;
      }

      .current-time .time-subtitle {
        width: 386px !important;
        transform: none !important;
      }

      .identity > div:last-child .value {
        margin-top: 7px !important;
        transform: translate(3px, 5px) !important;
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

  const mainRow = shadow.querySelector(`.current-time > .${ROW_CLASS}`);
  const dateValue = shadow.querySelector('.identity > div:last-child .value');

  host.dataset.gannzillaTasiTimeTrackerMainTimeCenterV567 = 'true';
  host.dataset.gannzillaTasiTimeTrackerMainTimeBalancedV567 = String(mainRow instanceof HTMLElement);
  host.dataset.gannzillaTasiTimeTrackerDateLoweredV567 = String(dateValue instanceof HTMLElement);
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV567 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    mainTimeCentered: mainRow instanceof HTMLElement,
    dateLowered: dateValue instanceof HTMLElement,
    dateShiftDownPx: window.innerWidth < 1180 ? 5 : 7,
    canvasChanged: false,
    at: Date.now(),
  };
  return mainRow instanceof HTMLElement && dateValue instanceof HTMLElement;
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

  window.GANNZILLA_TASI_TIME_TRACKER_MAIN_TIME_CENTER_V567 = true;
  window.__auditGannzillaTasiTimeTrackerMainTimeCenterV567 = () => {
    const host = document.getElementById(HOST_ID);
    const shadow = host?.shadowRoot;
    return {
      ok: host instanceof HTMLElement
        && shadow instanceof ShadowRoot
        && host.dataset.gannzillaTasiTimeTrackerMainTimeCenterV567 === 'true'
        && shadow.getElementById(STYLE_ID) instanceof HTMLStyleElement,
      build: BUILD,
      applyCount,
      mainTimeBalanced: host?.dataset?.gannzillaTasiTimeTrackerMainTimeBalancedV567 === 'true',
      dateLowered: host?.dataset?.gannzillaTasiTimeTrackerDateLoweredV567 === 'true',
      canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV567 === 'true',
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, observer };
  schedule('install', 0);
}

install();
