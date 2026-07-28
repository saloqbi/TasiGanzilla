const BUILD = 552;
const STATE_KEY = '__gannzillaTasiTimeTrackerTextClarityV552';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-text-clarity-v552';

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
    && boolParam('timeTrackerClarity', true)
    && boolParam('timeTrackerOrderClarity', true)
    && boolParam('timeTrackerTextClarity', true);
}

function cssText() {
  return `
    .top {
      min-height: 150px !important;
    }

    .label {
      font-size: 23px !important;
      font-weight: 900 !important;
      line-height: 1.18 !important;
      color: #251408 !important;
      text-rendering: geometricPrecision !important;
      -webkit-font-smoothing: antialiased !important;
    }

    .value {
      font-size: 30px !important;
      font-weight: 900 !important;
      line-height: 1.08 !important;
    }

    .identity .value {
      font-size: 28px !important;
    }

    .time-value {
      font-size: clamp(54px, 5.2vw, 68px) !important;
      letter-spacing: 3.8px !important;
      line-height: 1 !important;
    }

    .time-subtitle {
      font-size: 18px !important;
      font-weight: 900 !important;
      line-height: 1.2 !important;
    }

    .metric.hour .value,
    .metric.minute .value,
    .metric.second .value,
    .metric.angle .value {
      min-width: 80px !important;
      padding: 12px 15px 13px !important;
      font-size: 35px !important;
    }

    .metric.angle .value {
      min-width: 102px !important;
    }

    .metric.direction .value,
    .metric.cycle .value {
      font-size: 27px !important;
      font-weight: 900 !important;
    }

    .section-title {
      width: 224px !important;
      height: 60px !important;
      margin: 11px 0 -61px 0 !important;
      padding: 18px 10px 13px !important;
      font-size: 19px !important;
      font-weight: 900 !important;
      line-height: 1.08 !important;
      overflow: visible !important;
      text-overflow: unset !important;
    }

    .row-shell {
      height: 61px !important;
      margin-left: 223px !important;
      overflow-x: auto !important;
      overflow-y: hidden !important;
      scrollbar-width: none !important;
    }

    .row-shell::-webkit-scrollbar {
      display: none !important;
    }

    .cells {
      height: 59px !important;
      min-width: 1380px !important;
      grid-template-columns: repeat(60, 23px) !important;
    }

    .cell {
      font-family: "Arial Narrow", "Roboto Condensed", Arial, sans-serif !important;
      font-size: 14px !important;
      font-weight: 900 !important;
      letter-spacing: -0.35px !important;
      color: #f4c98f !important;
      text-shadow: 0 1px 2px #000 !important;
      text-rendering: geometricPrecision !important;
      -webkit-font-smoothing: antialiased !important;
    }

    .cell[data-type="angle"] {
      font-size: 12px !important;
      letter-spacing: -0.55px !important;
    }

    .cell.active {
      font-size: 19px !important;
      letter-spacing: 0 !important;
      transform: translateY(-1px) scale(1.10) !important;
    }

    .cell[data-type="angle"].active {
      font-size: 16px !important;
    }

    .tasi-luxury-guide-v549 {
      top: 215px !important;
      height: 132px !important;
      width: 3px !important;
    }

    @media (max-width: 1180px) {
      .top {
        min-height: 134px !important;
      }

      .label {
        font-size: 20px !important;
      }

      .value {
        font-size: 26px !important;
      }

      .identity .value {
        font-size: 24px !important;
      }

      .time-value {
        font-size: 52px !important;
      }

      .time-subtitle {
        font-size: 16px !important;
      }

      .metric.hour .value,
      .metric.minute .value,
      .metric.second .value,
      .metric.angle .value {
        min-width: 64px !important;
        padding: 10px 11px 11px !important;
        font-size: 30px !important;
      }

      .metric.angle .value {
        min-width: 84px !important;
      }

      .metric.direction .value,
      .metric.cycle .value {
        font-size: 23px !important;
      }

      .section-title {
        width: 196px !important;
        height: 54px !important;
        margin-bottom: -55px !important;
        padding: 16px 8px 12px !important;
        font-size: 17px !important;
      }

      .row-shell {
        height: 55px !important;
        margin-left: 195px !important;
      }

      .cells {
        height: 53px !important;
        min-width: 1260px !important;
        grid-template-columns: repeat(60, 21px) !important;
      }

      .cell {
        font-size: 13px !important;
      }

      .cell[data-type="angle"] {
        font-size: 11px !important;
      }

      .cell.active {
        font-size: 18px !important;
      }

      .cell[data-type="angle"].active {
        font-size: 15px !important;
      }

      .tasi-luxury-guide-v549 {
        top: 195px !important;
        height: 119px !important;
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

  host.dataset.gannzillaTasiTimeTrackerTextClarityV552 = 'true';
  host.dataset.gannzillaTasiTimeTrackerCompactLabelsV552 = '20px';
  host.dataset.gannzillaTasiTimeTrackerRowModeV552 = 'readable-horizontal-scroll';
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV552 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    desktopLabelPx: 23,
    compactLabelPx: 20,
    minuteCellPx: 14,
    angleCellPx: 12,
    readableHorizontalScroll: true,
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

  [0, 80, 220, 600, 1400, 3200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });

  window.GANNZILLA_TASI_TIME_TRACKER_TEXT_CLARITY_V552 = true;
  window.__auditGannzillaTasiTimeTrackerTextClarityV552 = () => {
    const host = document.getElementById(HOST_ID);
    const shadow = host?.shadowRoot;
    return {
      ok: host instanceof HTMLElement
        && shadow instanceof ShadowRoot
        && host.dataset.gannzillaTasiTimeTrackerTextClarityV552 === 'true'
        && shadow.getElementById(STYLE_ID) instanceof HTMLStyleElement,
      build: BUILD,
      applyCount,
      compactLabelPx: Number.parseInt(host?.dataset?.gannzillaTasiTimeTrackerCompactLabelsV552 || '0', 10),
      rowMode: host?.dataset?.gannzillaTasiTimeTrackerRowModeV552 || null,
      canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV552 === 'true',
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, observer };
  schedule('install', 0);
}

install();
