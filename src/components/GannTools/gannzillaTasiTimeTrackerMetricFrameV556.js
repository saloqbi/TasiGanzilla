const BUILD = 556;
const STATE_KEY = '__gannzillaTasiTimeTrackerMetricFrameV556';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-metric-frame-v556';

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
    && boolParam('timeTrackerMetricFrame', true);
}

function cssText() {
  return `
    .metric.hour,
    .metric.minute,
    .metric.second,
    .metric.angle {
      overflow: visible !important;
    }

    .metric.hour .value,
    .metric.minute .value,
    .metric.second .value,
    .metric.angle .value {
      position: relative !important;
      display: grid !important;
      place-items: center !important;
      flex: 0 0 auto !important;
      box-sizing: border-box !important;
      width: 96px !important;
      min-width: 96px !important;
      max-width: 96px !important;
      height: 66px !important;
      min-height: 66px !important;
      margin: 8px auto 0 !important;
      padding: 0 !important;
      border: 2px solid #c27a39 !important;
      clip-path: polygon(10% 0, 90% 0, 100% 20%, 100% 80%, 90% 100%, 10% 100%, 0 80%, 0 20%) !important;
      background:
        radial-gradient(circle at 50% 18%, rgba(255, 202, 135, .14), transparent 38%),
        linear-gradient(180deg, #2b170d 0%, #0a0705 56%, #050403 100%) !important;
      color: #f2c38b !important;
      font-family: Georgia, "Times New Roman", serif !important;
      font-size: 34px !important;
      font-weight: 700 !important;
      font-variant-numeric: tabular-nums lining-nums !important;
      font-feature-settings: "tnum" 1, "lnum" 1 !important;
      line-height: 1 !important;
      letter-spacing: 0 !important;
      text-align: center !important;
      text-indent: 0 !important;
      white-space: nowrap !important;
      transform: none !important;
      transition: none !important;
      animation: none !important;
      box-shadow:
        0 0 0 2px #4a1b08,
        0 0 0 1px rgba(255, 224, 177, .42) inset,
        0 5px 8px rgba(0, 0, 0, .34) !important;
    }

    .metric.angle .value {
      width: 124px !important;
      min-width: 124px !important;
      max-width: 124px !important;
      font-size: 32px !important;
    }

    .metric.minute .value {
      border-color: #ffb461 !important;
      color: #ffe8c3 !important;
      box-shadow:
        0 0 0 2px #7a2c0b,
        0 0 0 1px rgba(255, 245, 217, .88) inset,
        0 0 11px #ff8a31,
        0 0 23px rgba(255, 116, 31, .58),
        0 5px 8px rgba(0, 0, 0, .38) !important;
    }

    .metric.second .value {
      border-color: #ffc06f !important;
      color: #fff0d4 !important;
      background:
        radial-gradient(circle at 50% 16%, rgba(255, 219, 168, .24), transparent 42%),
        linear-gradient(180deg, #3b210f 0%, #100805 58%, #070403 100%) !important;
      box-shadow:
        0 0 0 2px #80340f,
        0 0 0 1px rgba(255, 246, 220, .90) inset,
        0 0 12px #ff993e,
        0 0 25px rgba(255, 132, 42, .62),
        0 5px 8px rgba(0, 0, 0, .40) !important;
    }

    .metric.hour .value,
    .metric.second .value {
      min-inline-size: 96px !important;
      inline-size: 96px !important;
    }

    .metric.angle .value {
      min-inline-size: 124px !important;
      inline-size: 124px !important;
    }

    @media (max-width: 1180px) {
      .metric.hour .value,
      .metric.minute .value,
      .metric.second .value {
        width: 78px !important;
        min-width: 78px !important;
        max-width: 78px !important;
        min-inline-size: 78px !important;
        inline-size: 78px !important;
        height: 58px !important;
        min-height: 58px !important;
        font-size: 30px !important;
      }

      .metric.angle .value {
        width: 104px !important;
        min-width: 104px !important;
        max-width: 104px !important;
        min-inline-size: 104px !important;
        inline-size: 104px !important;
        height: 58px !important;
        min-height: 58px !important;
        font-size: 28px !important;
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

  const secondValue = shadow.querySelector('.metric.second .value');
  const stable = secondValue instanceof HTMLElement
    && Math.round(secondValue.getBoundingClientRect().width) >= 78;

  host.dataset.gannzillaTasiTimeTrackerMetricFrameV556 = 'true';
  host.dataset.gannzillaTasiTimeTrackerSecondFrameGlowV556 = 'true';
  host.dataset.gannzillaTasiTimeTrackerTabularDigitsV556 = 'true';
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV556 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    fixedMetricFrames: true,
    tabularDigits: true,
    secondsGlow: true,
    stable,
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

  window.GANNZILLA_TASI_TIME_TRACKER_METRIC_FRAME_V556 = true;
  window.__auditGannzillaTasiTimeTrackerMetricFrameV556 = () => {
    const host = document.getElementById(HOST_ID);
    const shadow = host?.shadowRoot;
    const secondValue = shadow?.querySelector('.metric.second .value');
    return {
      ok: host instanceof HTMLElement
        && shadow instanceof ShadowRoot
        && host.dataset.gannzillaTasiTimeTrackerMetricFrameV556 === 'true'
        && shadow.getElementById(STYLE_ID) instanceof HTMLStyleElement
        && secondValue instanceof HTMLElement,
      build: BUILD,
      applyCount,
      secondsGlow: host?.dataset?.gannzillaTasiTimeTrackerSecondFrameGlowV556 === 'true',
      tabularDigits: host?.dataset?.gannzillaTasiTimeTrackerTabularDigitsV556 === 'true',
      secondFrameWidthPx: secondValue instanceof HTMLElement
        ? Math.round(secondValue.getBoundingClientRect().width)
        : null,
      canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV556 === 'true',
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, observer };
  schedule('install', 0);
}

install();
