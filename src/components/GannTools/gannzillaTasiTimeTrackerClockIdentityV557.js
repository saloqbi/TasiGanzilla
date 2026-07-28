const BUILD = 557;
const STATE_KEY = '__gannzillaTasiTimeTrackerClockIdentityV557';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-clock-identity-v557';

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
    && boolParam('timeTrackerClockIdentity', true);
}

function cssText() {
  return `
    .top {
      min-height: 172px !important;
      grid-template-columns:
        138px minmax(248px, 1.05fr) minmax(300px, 1.52fr)
        repeat(6, minmax(80px, .58fr)) !important;
      align-items: stretch !important;
    }

    .clock-face {
      align-self: center !important;
      justify-self: center !important;
      width: 116px !important;
      height: 116px !important;
      min-width: 116px !important;
      min-height: 116px !important;
      margin: 0 auto !important;
      border-width: 6px !important;
      box-shadow:
        0 0 0 2px #f2bd7b,
        0 0 0 7px #351307,
        0 0 18px rgba(104, 40, 10, .62),
        0 0 28px rgba(213, 112, 43, .34) !important;
    }

    .hand-hour {
      width: 4px !important;
      height: 31px !important;
    }

    .hand-minute {
      width: 4px !important;
      height: 42px !important;
    }

    .hand-second {
      width: 2px !important;
      height: 48px !important;
    }

    .clock-pin {
      width: 13px !important;
      height: 13px !important;
      box-shadow: 0 0 8px #ff8c42 !important;
    }

    .identity {
      min-width: 248px !important;
      grid-template-columns: 1fr !important;
      grid-template-rows: 1fr 1fr !important;
      overflow: visible !important;
      border-left: 2px solid rgba(94, 48, 22, .55) !important;
      border-right: 2px solid rgba(94, 48, 22, .55) !important;
    }

    .identity > div {
      min-height: 82px !important;
      padding: 10px 12px !important;
      justify-content: center !important;
      gap: 4px !important;
    }

    .identity > div + div {
      border-top: 2px solid rgba(100, 50, 20, .34) !important;
    }

    .identity .label {
      font-size: 22px !important;
      font-weight: 900 !important;
      line-height: 1.08 !important;
      color: #241208 !important;
      text-shadow: none !important;
    }

    .identity > div:first-child .value {
      margin-top: 3px !important;
      font-size: 32px !important;
      font-weight: 900 !important;
      line-height: 1 !important;
      color: #170d07 !important;
      letter-spacing: .2px !important;
      text-shadow: 0 1px 0 rgba(255,255,255,.45) !important;
    }

    .identity > div:last-child .value {
      margin-top: 3px !important;
      font-family: Georgia, "Times New Roman", serif !important;
      font-size: 27px !important;
      font-weight: 800 !important;
      line-height: 1 !important;
      color: #170d07 !important;
      direction: ltr !important;
      unicode-bidi: isolate !important;
      font-variant-numeric: tabular-nums lining-nums !important;
      font-feature-settings: "tnum" 1, "lnum" 1 !important;
      letter-spacing: .6px !important;
      text-shadow: 0 1px 0 rgba(255,255,255,.45) !important;
    }

    @media (max-width: 1180px) {
      .top {
        min-height: 154px !important;
        grid-template-columns:
          116px minmax(214px, .98fr) minmax(260px, 1.38fr)
          repeat(6, minmax(66px, .52fr)) !important;
      }

      .clock-face {
        width: 98px !important;
        height: 98px !important;
        min-width: 98px !important;
        min-height: 98px !important;
      }

      .hand-hour { height: 27px !important; }
      .hand-minute { height: 36px !important; }
      .hand-second { height: 41px !important; }

      .identity {
        min-width: 214px !important;
      }

      .identity > div {
        min-height: 74px !important;
        padding: 8px 10px !important;
      }

      .identity .label {
        font-size: 20px !important;
      }

      .identity > div:first-child .value {
        font-size: 29px !important;
      }

      .identity > div:last-child .value {
        font-size: 24px !important;
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

  const clock = shadow.querySelector('.clock-face');
  const identity = shadow.querySelector('.identity');
  const clockWorking = clock instanceof HTMLElement
    && shadow.querySelector('.hand-hour') instanceof HTMLElement
    && shadow.querySelector('.hand-minute') instanceof HTMLElement
    && shadow.querySelector('.hand-second') instanceof HTMLElement;

  host.dataset.gannzillaTasiTimeTrackerClockIdentityV557 = 'true';
  host.dataset.gannzillaTasiTimeTrackerAnalogClockWorkingV557 = String(clockWorking);
  host.dataset.gannzillaTasiTimeTrackerIdentityReadableV557 = String(identity instanceof HTMLElement);
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV557 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    analogClockPx: window.innerWidth < 1180 ? 98 : 116,
    dayFontPx: window.innerWidth < 1180 ? 29 : 32,
    dateFontPx: window.innerWidth < 1180 ? 24 : 27,
    clockWorking,
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

  window.GANNZILLA_TASI_TIME_TRACKER_CLOCK_IDENTITY_V557 = true;
  window.__auditGannzillaTasiTimeTrackerClockIdentityV557 = () => {
    const host = document.getElementById(HOST_ID);
    const shadow = host?.shadowRoot;
    const clock = shadow?.querySelector('.clock-face');
    const identity = shadow?.querySelector('.identity');
    return {
      ok: host instanceof HTMLElement
        && shadow instanceof ShadowRoot
        && host.dataset.gannzillaTasiTimeTrackerClockIdentityV557 === 'true'
        && shadow.getElementById(STYLE_ID) instanceof HTMLStyleElement
        && clock instanceof HTMLElement
        && identity instanceof HTMLElement,
      build: BUILD,
      applyCount,
      analogClockWidthPx: clock instanceof HTMLElement
        ? Math.round(clock.getBoundingClientRect().width)
        : null,
      identityWidthPx: identity instanceof HTMLElement
        ? Math.round(identity.getBoundingClientRect().width)
        : null,
      clockWorking: host?.dataset?.gannzillaTasiTimeTrackerAnalogClockWorkingV557 === 'true',
      canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV557 === 'true',
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, observer };
  schedule('install', 0);
}

install();
