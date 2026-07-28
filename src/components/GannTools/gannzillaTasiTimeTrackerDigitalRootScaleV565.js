const BUILD = 565;
const STATE_KEY = '__gannzillaTasiTimeTrackerDigitalRootScaleV565';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-digital-root-scale-v565';
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
    && boolParam('timeTrackerDigitalRootScale', true);
}

function cssText() {
  return `
    .top {
      grid-template-columns:
        180px minmax(292px, 1.02fr) minmax(540px, 1.68fr)
        164px 164px 164px 204px minmax(110px, .54fr) minmax(110px, .54fr) !important;
    }

    .current-time {
      box-sizing: border-box !important;
      padding-left: 28px !important;
      padding-right: 10px !important;
      overflow: hidden !important;
    }

    .current-time > .${ROW_CLASS} {
      width: 512px !important;
      min-width: 512px !important;
      max-width: 512px !important;
      gap: 14px !important;
      margin: 0 auto !important;
      transform: translateX(16px) !important;
      overflow: visible !important;
    }

    .current-time > .${ROW_CLASS} > .time-value {
      flex: 0 0 390px !important;
      width: 390px !important;
      min-width: 390px !important;
      max-width: 390px !important;
      margin: 0 !important;
      padding: 0 !important;
      font-size: 56px !important;
      line-height: 1 !important;
      text-align: center !important;
      transform: none !important;
    }

    .current-time > .${ROW_CLASS} > .${RESULT_CLASS} {
      flex: 0 0 102px !important;
      width: 102px !important;
      min-width: 102px !important;
      max-width: 102px !important;
      font-size: 56px !important;
      line-height: 1 !important;
      text-align: left !important;
    }

    .metric.hour > .${ROW_CLASS},
    .metric.minute > .${ROW_CLASS},
    .metric.second > .${ROW_CLASS} {
      width: 154px !important;
      min-width: 154px !important;
      max-width: 154px !important;
      gap: 10px !important;
      margin: 8px auto 0 !important;
    }

    .metric.angle > .${ROW_CLASS} {
      width: 194px !important;
      min-width: 194px !important;
      max-width: 194px !important;
      gap: 12px !important;
      margin: 8px auto 0 !important;
    }

    .metric.hour > .${ROW_CLASS} > .value,
    .metric.minute > .${ROW_CLASS} > .value,
    .metric.second > .${ROW_CLASS} > .value {
      flex: 0 0 86px !important;
      width: 86px !important;
      min-width: 86px !important;
      max-width: 86px !important;
      min-inline-size: 86px !important;
      inline-size: 86px !important;
      height: 62px !important;
      min-height: 62px !important;
      margin: 0 !important;
      padding: 0 !important;
      font-size: 32px !important;
      overflow: hidden !important;
    }

    .metric.angle > .${ROW_CLASS} > .value {
      flex: 0 0 122px !important;
      width: 122px !important;
      min-width: 122px !important;
      max-width: 122px !important;
      min-inline-size: 122px !important;
      inline-size: 122px !important;
      height: 62px !important;
      min-height: 62px !important;
      margin: 0 !important;
      padding: 0 !important;
      font-size: 30px !important;
      overflow: hidden !important;
    }

    .metric.hour > .${ROW_CLASS} > .${RESULT_CLASS},
    .metric.minute > .${ROW_CLASS} > .${RESULT_CLASS},
    .metric.second > .${ROW_CLASS} > .${RESULT_CLASS} {
      flex: 0 0 58px !important;
      width: 58px !important;
      min-width: 58px !important;
      max-width: 58px !important;
      font-size: 32px !important;
      line-height: 1 !important;
      text-align: left !important;
    }

    .metric.angle > .${ROW_CLASS} > .${RESULT_CLASS} {
      flex: 0 0 60px !important;
      width: 60px !important;
      min-width: 60px !important;
      max-width: 60px !important;
      font-size: 30px !important;
      line-height: 1 !important;
      text-align: left !important;
    }

    @media (max-width: 1180px) {
      .top {
        grid-template-columns:
          154px minmax(250px, .98fr) minmax(438px, 1.47fr)
          140px 140px 140px 176px minmax(92px, .50fr) minmax(92px, .50fr) !important;
      }

      .current-time {
        padding-left: 22px !important;
        padding-right: 8px !important;
      }

      .current-time > .${ROW_CLASS} {
        width: 414px !important;
        min-width: 414px !important;
        max-width: 414px !important;
        gap: 10px !important;
        transform: translateX(12px) !important;
      }

      .current-time > .${ROW_CLASS} > .time-value {
        flex-basis: 316px !important;
        width: 316px !important;
        min-width: 316px !important;
        max-width: 316px !important;
        font-size: 47px !important;
      }

      .current-time > .${ROW_CLASS} > .${RESULT_CLASS} {
        flex-basis: 88px !important;
        width: 88px !important;
        min-width: 88px !important;
        max-width: 88px !important;
        font-size: 47px !important;
      }

      .metric.hour > .${ROW_CLASS},
      .metric.minute > .${ROW_CLASS},
      .metric.second > .${ROW_CLASS} {
        width: 132px !important;
        min-width: 132px !important;
        max-width: 132px !important;
        gap: 7px !important;
      }

      .metric.angle > .${ROW_CLASS} {
        width: 166px !important;
        min-width: 166px !important;
        max-width: 166px !important;
        gap: 8px !important;
      }

      .metric.hour > .${ROW_CLASS} > .value,
      .metric.minute > .${ROW_CLASS} > .value,
      .metric.second > .${ROW_CLASS} > .value {
        flex-basis: 74px !important;
        width: 74px !important;
        min-width: 74px !important;
        max-width: 74px !important;
        min-inline-size: 74px !important;
        inline-size: 74px !important;
        height: 56px !important;
        min-height: 56px !important;
        font-size: 27px !important;
      }

      .metric.angle > .${ROW_CLASS} > .value {
        flex-basis: 104px !important;
        width: 104px !important;
        min-width: 104px !important;
        max-width: 104px !important;
        min-inline-size: 104px !important;
        inline-size: 104px !important;
        height: 56px !important;
        min-height: 56px !important;
        font-size: 26px !important;
      }

      .metric.hour > .${ROW_CLASS} > .${RESULT_CLASS},
      .metric.minute > .${ROW_CLASS} > .${RESULT_CLASS},
      .metric.second > .${ROW_CLASS} > .${RESULT_CLASS} {
        flex-basis: 51px !important;
        width: 51px !important;
        min-width: 51px !important;
        max-width: 51px !important;
        font-size: 27px !important;
      }

      .metric.angle > .${ROW_CLASS} > .${RESULT_CLASS} {
        flex-basis: 54px !important;
        width: 54px !important;
        min-width: 54px !important;
        max-width: 54px !important;
        font-size: 26px !important;
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

  const resultCount = shadow.querySelectorAll(`.${RESULT_CLASS}`).length;
  host.dataset.gannzillaTasiTimeTrackerDigitalRootScaleV565 = 'true';
  host.dataset.gannzillaTasiTimeTrackerDigitalRootResultCountV565 = String(resultCount);
  host.dataset.gannzillaTasiTimeTrackerMainTimeShiftedV565 = 'true';
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV565 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    resultCount,
    mainTimeShiftRightPx: window.innerWidth < 1180 ? 12 : 16,
    mainTimeFontPx: window.innerWidth < 1180 ? 47 : 56,
    metricResultMatchesValue: true,
    canvasChanged: false,
    at: Date.now(),
  };
  return resultCount === 5;
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

  window.GANNZILLA_TASI_TIME_TRACKER_DIGITAL_ROOT_SCALE_V565 = true;
  window.__auditGannzillaTasiTimeTrackerDigitalRootScaleV565 = () => {
    const host = document.getElementById(HOST_ID);
    const shadow = host?.shadowRoot;
    const results = shadow instanceof ShadowRoot
      ? Array.from(shadow.querySelectorAll(`.${RESULT_CLASS}`))
      : [];
    return {
      ok: host instanceof HTMLElement
        && shadow instanceof ShadowRoot
        && host.dataset.gannzillaTasiTimeTrackerDigitalRootScaleV565 === 'true'
        && shadow.getElementById(STYLE_ID) instanceof HTMLStyleElement
        && results.length === 5,
      build: BUILD,
      applyCount,
      resultCount: results.length,
      mainTimeShifted: host?.dataset?.gannzillaTasiTimeTrackerMainTimeShiftedV565 === 'true',
      canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV565 === 'true',
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, observer };
  schedule('install', 0);
}

install();
