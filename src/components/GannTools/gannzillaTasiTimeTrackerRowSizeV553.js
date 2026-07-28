const BUILD = 553;
const STATE_KEY = '__gannzillaTasiTimeTrackerRowSizeV553';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-row-size-v553';

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
    && boolParam('timeTrackerTextClarity', true)
    && boolParam('timeTrackerRowSize', true);
}

function cssText() {
  return `
    .section-title {
      width: 264px !important;
      height: 74px !important;
      margin: 13px 0 -75px 0 !important;
      padding: 23px 12px 16px !important;
      font-size: 22px !important;
      font-weight: 900 !important;
      line-height: 1.08 !important;
      white-space: nowrap !important;
      overflow: visible !important;
      text-overflow: unset !important;
    }

    .row-shell {
      height: 75px !important;
      margin-left: 263px !important;
      overflow-x: auto !important;
      overflow-y: hidden !important;
      scrollbar-width: none !important;
      scroll-behavior: smooth !important;
    }

    .row-shell::-webkit-scrollbar {
      display: none !important;
    }

    .cells {
      height: 73px !important;
      min-width: 1800px !important;
      grid-template-columns: repeat(60, 30px) !important;
    }

    .cell {
      min-width: 30px !important;
      font-family: "Arial Narrow", "Roboto Condensed", Arial, sans-serif !important;
      font-size: 18px !important;
      font-weight: 900 !important;
      letter-spacing: -0.2px !important;
      line-height: 1 !important;
      color: #ffd28f !important;
      text-shadow: 0 1px 2px #000, 0 0 2px rgba(255, 173, 86, .45) !important;
      text-rendering: geometricPrecision !important;
      -webkit-font-smoothing: antialiased !important;
    }

    .cell[data-type="angle"] {
      font-size: 16px !important;
      letter-spacing: -0.45px !important;
    }

    .cell.active {
      font-size: 24px !important;
      letter-spacing: 0 !important;
      transform: translateY(-1px) scale(1.08) !important;
      box-shadow:
        0 0 0 2px #fff0c6 inset,
        0 0 10px #ff812f,
        0 0 22px rgba(255,119,31,.82) !important;
    }

    .cell[data-type="angle"].active {
      font-size: 21px !important;
    }

    .tasi-luxury-guide-v549 {
      top: 230px !important;
      height: 160px !important;
      width: 4px !important;
    }

    @media (max-width: 1180px) {
      .section-title {
        width: 236px !important;
        height: 68px !important;
        margin-bottom: -69px !important;
        padding: 21px 10px 15px !important;
        font-size: 20px !important;
      }

      .row-shell {
        height: 69px !important;
        margin-left: 235px !important;
      }

      .cells {
        height: 67px !important;
        min-width: 1680px !important;
        grid-template-columns: repeat(60, 28px) !important;
      }

      .cell {
        min-width: 28px !important;
        font-size: 17px !important;
      }

      .cell[data-type="angle"] {
        font-size: 15px !important;
      }

      .cell.active {
        font-size: 23px !important;
      }

      .cell[data-type="angle"].active {
        font-size: 20px !important;
      }

      .tasi-luxury-guide-v549 {
        top: 214px !important;
        height: 145px !important;
      }
    }
  `;
}

function setText(element, text) {
  if (element instanceof HTMLElement && element.textContent !== text) element.textContent = text;
}

function applyLabels(shadow) {
  const titles = Array.from(shadow.querySelectorAll('.section-title'));
  setText(titles[0], 'الدقائق (60) — كل خانة');
  setText(titles[1], 'الزوايا (360°) — كل دقيقة');
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

  applyLabels(shadow);

  host.dataset.gannzillaTasiTimeTrackerRowSizeV553 = 'true';
  host.dataset.gannzillaTasiTimeTrackerMinuteCellWidthV553 = '30';
  host.dataset.gannzillaTasiTimeTrackerMinuteFontV553 = '18';
  host.dataset.gannzillaTasiTimeTrackerAngleFontV553 = '16';
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV553 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    rowHeightPx: 75,
    minuteCellWidthPx: 30,
    minuteFontPx: 18,
    angleFontPx: 16,
    activeMinuteFontPx: 24,
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

  window.GANNZILLA_TASI_TIME_TRACKER_ROW_SIZE_V553 = true;
  window.__auditGannzillaTasiTimeTrackerRowSizeV553 = () => {
    const host = document.getElementById(HOST_ID);
    const shadow = host?.shadowRoot;
    return {
      ok: host instanceof HTMLElement
        && shadow instanceof ShadowRoot
        && host.dataset.gannzillaTasiTimeTrackerRowSizeV553 === 'true'
        && shadow.getElementById(STYLE_ID) instanceof HTMLStyleElement,
      build: BUILD,
      applyCount,
      minuteCellWidthPx: Number(host?.dataset?.gannzillaTasiTimeTrackerMinuteCellWidthV553 || 0),
      minuteFontPx: Number(host?.dataset?.gannzillaTasiTimeTrackerMinuteFontV553 || 0),
      angleFontPx: Number(host?.dataset?.gannzillaTasiTimeTrackerAngleFontV553 || 0),
      canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV553 === 'true',
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, observer };
  schedule('install', 0);
}

install();
