const BUILD = 561;
const STATE_KEY = '__gannzillaTasiTimeTrackerPlainClockV561';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-plain-clock-v561';

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
    && boolParam('timeTrackerClockNumerals', true)
    && boolParam('timeTrackerPlainClock', true);
}

function cssText() {
  return `
    .clock-face {
      position: relative !important;
      isolation: isolate !important;
      overflow: hidden !important;
      background:
        radial-gradient(circle at 46% 38%, rgba(255,255,255,.38) 0 4%, transparent 22%),
        radial-gradient(circle, #f8e8c8 0 76%, #dfb77f 77% 81%, #4a1d0b 82% 100%) !important;
      box-shadow:
        0 0 0 2px #f2bd7b,
        0 0 0 8px #351307,
        0 0 18px rgba(87,29,7,.66),
        0 0 30px rgba(213,112,43,.36) !important;
    }

    .clock-face::before {
      content: '';
      position: absolute;
      z-index: 2;
      inset: 8px;
      border-radius: 50%;
      pointer-events: none;
      background: repeating-conic-gradient(
        from -1deg,
        #2a190f 0deg 1deg,
        transparent 1deg 6deg
      );
      -webkit-mask: radial-gradient(circle, transparent 0 72%, #000 73% 100%);
      mask: radial-gradient(circle, transparent 0 72%, #000 73% 100%);
      opacity: .82;
    }

    .clock-face::after {
      content: '';
      position: absolute;
      z-index: 3;
      inset: 18px;
      border: 1px solid rgba(78,38,15,.22);
      border-radius: 50%;
      pointer-events: none;
    }

    .clock-face .tasi-clock-numeral-v560 {
      z-index: 6 !important;
      color: #17110c !important;
      text-shadow: 0 1px 0 rgba(255,255,255,.86) !important;
    }

    .clock-face .hand {
      z-index: 9 !important;
    }

    .clock-face .clock-pin {
      z-index: 11 !important;
    }

    .identity {
      overflow: hidden !important;
    }

    .identity > div + div {
      border-top: 0 !important;
      box-shadow: none !important;
    }

    .identity > div:last-child {
      overflow: hidden !important;
      padding-left: 24px !important;
      padding-right: 24px !important;
    }

    .identity > div:last-child .value {
      display: grid !important;
      place-items: center !important;
      box-sizing: border-box !important;
      width: 248px !important;
      min-width: 248px !important;
      max-width: 248px !important;
      height: 44px !important;
      min-height: 44px !important;
      margin: 5px auto 0 !important;
      padding: 0 16px !important;
      overflow: hidden !important;
      color: #160c06 !important;
      font-family: "Arial Narrow", "Roboto Condensed", Arial, sans-serif !important;
      font-size: 31px !important;
      font-weight: 900 !important;
      font-stretch: condensed !important;
      font-variant-numeric: tabular-nums lining-nums !important;
      font-feature-settings: "tnum" 1, "lnum" 1 !important;
      letter-spacing: .1px !important;
      word-spacing: -1px !important;
      line-height: 1 !important;
      direction: ltr !important;
      unicode-bidi: isolate !important;
      text-align: center !important;
      white-space: nowrap !important;
      transform: translateX(4px) !important;
      transition: none !important;
      animation: none !important;
    }

    @media (max-width: 1180px) {
      .clock-face::before { inset: 7px; }
      .clock-face::after { inset: 15px; }

      .identity > div:last-child {
        padding-left: 18px !important;
        padding-right: 18px !important;
      }

      .identity > div:last-child .value {
        width: 210px !important;
        min-width: 210px !important;
        max-width: 210px !important;
        height: 40px !important;
        min-height: 40px !important;
        padding: 0 12px !important;
        font-size: 27px !important;
        transform: translateX(3px) !important;
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
  const clock = shadow?.querySelector('.clock-face');
  const dateValue = shadow?.querySelector('.identity > div:last-child .value');
  if (!(host instanceof HTMLElement)
      || !(shadow instanceof ShadowRoot)
      || !(clock instanceof HTMLElement)
      || !(dateValue instanceof HTMLElement)) return false;

  let style = shadow.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = cssText();
    shadow.appendChild(style);
  }

  host.dataset.gannzillaTasiTimeTrackerPlainClockV561 = 'true';
  host.dataset.gannzillaTasiTimeTrackerClockInteriorV561 = 'plain-ivory';
  host.dataset.gannzillaTasiTimeTrackerDateInsetV561 = 'true';
  host.dataset.gannzillaTasiTimeTrackerIdentityMiddleLineV561 = 'removed';
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV561 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    clockInterior: 'plain-ivory',
    minuteTicks: true,
    dateInset: true,
    middleLineRemoved: true,
    clockWidthPx: Math.round(clock.getBoundingClientRect().width),
    dateWidthPx: Math.round(dateValue.getBoundingClientRect().width),
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

  window.GANNZILLA_TASI_TIME_TRACKER_PLAIN_CLOCK_V561 = true;
  window.__auditGannzillaTasiTimeTrackerPlainClockV561 = () => {
    const host = document.getElementById(HOST_ID);
    const shadow = host?.shadowRoot;
    const clock = shadow?.querySelector('.clock-face');
    const dateValue = shadow?.querySelector('.identity > div:last-child .value');
    return {
      ok: host instanceof HTMLElement
        && shadow instanceof ShadowRoot
        && host.dataset.gannzillaTasiTimeTrackerPlainClockV561 === 'true'
        && shadow.getElementById(STYLE_ID) instanceof HTMLStyleElement
        && clock instanceof HTMLElement
        && dateValue instanceof HTMLElement,
      build: BUILD,
      applyCount,
      clockInterior: host?.dataset?.gannzillaTasiTimeTrackerClockInteriorV561 || null,
      dateInset: host?.dataset?.gannzillaTasiTimeTrackerDateInsetV561 === 'true',
      middleLineRemoved: host?.dataset?.gannzillaTasiTimeTrackerIdentityMiddleLineV561 === 'removed',
      canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV561 === 'true',
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, observer };
  schedule('install', 0);
}

install();
