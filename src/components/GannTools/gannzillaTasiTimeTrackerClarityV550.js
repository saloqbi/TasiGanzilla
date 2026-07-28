const BUILD = 550;
const STATE_KEY = '__gannzillaTasiTimeTrackerClarityV550';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-clarity-v550';

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
    && boolParam('timeTrackerLuxuryStyle', true)
    && boolParam('timeTrackerClarity', true);
}

function cssText() {
  return `
    .tracker {
      margin-top: 34px !important;
      padding: 15px 16px 17px !important;
    }

    .tasi-luxury-title-v549 {
      top: -42px !important;
      min-width: 305px !important;
      padding: 7px 42px 8px !important;
      font-size: 20px !important;
      letter-spacing: 2.1px !important;
    }
    .tasi-luxury-title-v549::before,
    .tasi-luxury-title-v549::after {
      font-size: 34px !important;
    }

    .top {
      min-height: 126px !important;
      grid-template-columns: 100px minmax(180px, .95fr) minmax(300px, 1.55fr) repeat(6, minmax(76px, .58fr)) !important;
    }

    .clock-face {
      width: 88px !important;
      height: 88px !important;
      border-width: 5px !important;
    }
    .hand-hour { height: 23px !important; width: 3px !important; }
    .hand-minute { height: 31px !important; width: 3px !important; }
    .hand-second { height: 35px !important; width: 2px !important; }
    .clock-pin { width: 10px !important; height: 10px !important; }

    .identity > div,
    .metric {
      padding: 10px 8px !important;
    }

    .label {
      font-size: 16px !important;
      line-height: 1.15 !important;
    }
    .value {
      margin-top: 4px !important;
      font-size: 25px !important;
      line-height: 1.06 !important;
    }
    .identity .value {
      font-size: 23px !important;
    }

    .time-value {
      font-size: clamp(46px, 4.4vw, 58px) !important;
      letter-spacing: 3.2px !important;
      line-height: 1 !important;
    }
    .time-subtitle {
      margin-top: 7px !important;
      font-size: 14px !important;
      line-height: 1.15 !important;
    }

    .metric.hour .value,
    .metric.minute .value,
    .metric.second .value,
    .metric.angle .value {
      min-width: 67px !important;
      margin-top: 7px !important;
      padding: 9px 13px 10px !important;
      font-size: 30px !important;
    }
    .metric.angle .value { min-width: 84px !important; }
    .metric.direction .value,
    .metric.cycle .value {
      font-size: 22px !important;
    }
    .cycle-ring {
      width: 34px !important;
      height: 34px !important;
    }
    .cycle-ring::after {
      width: 22px !important;
      height: 22px !important;
      margin: 6px !important;
    }

    .section-title {
      width: 154px !important;
      height: 42px !important;
      margin: 9px 0 -43px 0 !important;
      padding: 11px 8px 8px !important;
      font-size: 14px !important;
      line-height: 1.05 !important;
    }
    .row-shell {
      height: 43px !important;
      margin-left: 153px !important;
    }
    .cells {
      height: 41px !important;
      grid-template-columns: repeat(60, minmax(14px, 1fr)) !important;
    }
    .cell {
      font-size: clamp(9px, .9vw, 12px) !important;
      line-height: 1 !important;
    }
    .cell.active {
      font-size: 15px !important;
      transform: translateY(-1px) scale(1.13) !important;
    }

    .tasi-luxury-guide-v549 {
      top: 179px !important;
      height: 94px !important;
      width: 3px !important;
    }
    .tasi-luxury-gem-v549 {
      bottom: -22px !important;
      width: 42px !important;
      height: 42px !important;
    }

    @media (max-width: 1180px) {
      .tracker { padding: 13px 13px 15px !important; }
      .top {
        min-height: 112px !important;
        grid-template-columns: 84px minmax(150px, .85fr) minmax(240px, 1.35fr) repeat(6, minmax(64px, .52fr)) !important;
      }
      .clock-face { width: 74px !important; height: 74px !important; }
      .label { font-size: 13px !important; }
      .value { font-size: 21px !important; }
      .identity .value { font-size: 19px !important; }
      .time-value { font-size: 44px !important; }
      .time-subtitle { font-size: 12px !important; }
      .metric.hour .value,
      .metric.minute .value,
      .metric.second .value,
      .metric.angle .value {
        min-width: 55px !important;
        padding: 8px 9px 9px !important;
        font-size: 25px !important;
      }
      .metric.angle .value { min-width: 70px !important; }
      .metric.direction .value,
      .metric.cycle .value { font-size: 18px !important; }
      .section-title {
        width: 138px !important;
        height: 38px !important;
        margin-bottom: -39px !important;
        padding-top: 10px !important;
        font-size: 12px !important;
      }
      .row-shell {
        height: 39px !important;
        margin-left: 137px !important;
      }
      .cells { height: 37px !important; }
      .cell { font-size: clamp(8px, .82vw, 11px) !important; }
      .cell.active { font-size: 14px !important; }
      .tasi-luxury-guide-v549 {
        top: 162px !important;
        height: 85px !important;
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
  const tracker = shadow?.querySelector('.tracker');
  if (!(host instanceof HTMLElement)
      || !(shadow instanceof ShadowRoot)
      || !(tracker instanceof HTMLElement)) return false;

  let style = shadow.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = cssText();
    shadow.appendChild(style);
  }

  host.dataset.gannzillaTasiTimeTrackerClarityV550 = 'true';
  host.dataset.gannzillaTasiTimeTrackerTypographyScaleV550 = 'labels-133,values-125,rows-130';
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV550 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    labelIncreasePercent: 33,
    valueIncreasePercent: 25,
    rowIncreasePercent: 30,
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

  observer = new MutationObserver(() => schedule('dom-mutation', 20));
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', () => schedule('resize', 10), false);

  [0, 80, 220, 600, 1400, 3200, 6200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });

  window.GANNZILLA_TASI_TIME_TRACKER_CLARITY_V550 = true;
  window.__auditGannzillaTasiTimeTrackerClarityV550 = () => {
    const host = document.getElementById(HOST_ID);
    const shadow = host?.shadowRoot;
    return {
      ok: host instanceof HTMLElement
        && shadow instanceof ShadowRoot
        && host.dataset.gannzillaTasiTimeTrackerClarityV550 === 'true'
        && shadow.getElementById(STYLE_ID) instanceof HTMLStyleElement
        && host.dataset.gannzillaTasiTimeTrackerCanvasChangedV550 === 'false',
      build: BUILD,
      applyCount,
      typographyScale: host?.dataset?.gannzillaTasiTimeTrackerTypographyScaleV550 || null,
      canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV550 === 'true',
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, observer };
  schedule('install', 0);
}

install();