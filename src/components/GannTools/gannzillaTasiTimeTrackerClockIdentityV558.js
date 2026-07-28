const BUILD = 558;
const STATE_KEY = '__gannzillaTasiTimeTrackerClockIdentityV558';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-clock-identity-v558';
const NUMBER_CLASS = 'tasi-clock-number-v558';

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
      min-height: 178px !important;
      grid-template-columns:
        142px minmax(270px, 1.08fr) minmax(290px, 1.45fr)
        repeat(6, minmax(76px, .57fr)) !important;
      column-gap: 0 !important;
      align-items: stretch !important;
    }

    .clock-face {
      position: relative !important;
      align-self: center !important;
      justify-self: center !important;
      width: 126px !important;
      height: 126px !important;
      min-width: 126px !important;
      min-height: 126px !important;
      margin: 0 auto !important;
      border: 7px solid #6e2f13 !important;
      border-radius: 50% !important;
      background:
        radial-gradient(circle at 50% 50%, transparent 0 56%, rgba(229,163,94,.82) 57% 60%, transparent 61%),
        repeating-conic-gradient(from -1deg, #d9a16b 0 1.3deg, transparent 1.3deg 6deg),
        radial-gradient(circle, #120c08 0 63%, #8d4b22 64% 70%, #261006 71% 100%) !important;
      box-shadow:
        0 0 0 2px #f0b66f,
        0 0 0 7px #351307,
        0 0 18px rgba(99,34,8,.64),
        0 0 30px rgba(213,112,43,.38) !important;
    }

    .hand-hour { width: 4px !important; height: 33px !important; }
    .hand-minute { width: 4px !important; height: 45px !important; }
    .hand-second { width: 2px !important; height: 50px !important; }
    .clock-pin {
      width: 14px !important;
      height: 14px !important;
      background: #f5b96f !important;
      box-shadow: 0 0 8px #ff8c42 !important;
    }

    .${NUMBER_CLASS} {
      position: absolute;
      z-index: 4;
      color: #e8b978;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 14px;
      font-weight: 800;
      line-height: 1;
      text-shadow: 0 1px 2px #000;
      pointer-events: none;
    }
    .${NUMBER_CLASS}[data-position="12"] { top: 8px; left: 50%; transform: translateX(-50%); }
    .${NUMBER_CLASS}[data-position="3"] { right: 9px; top: 50%; transform: translateY(-50%); }
    .${NUMBER_CLASS}[data-position="6"] { bottom: 8px; left: 50%; transform: translateX(-50%); }
    .${NUMBER_CLASS}[data-position="9"] { left: 9px; top: 50%; transform: translateY(-50%); }

    .identity {
      position: relative !important;
      min-width: 270px !important;
      width: 100% !important;
      grid-template-columns: 1fr !important;
      grid-template-rows: 1fr 1fr !important;
      overflow: visible !important;
      transform: translateX(14px) !important;
      border-left: 2px solid rgba(94,48,22,.62) !important;
      border-right: 2px solid rgba(94,48,22,.62) !important;
      box-shadow:
        -10px 0 18px -16px rgba(64,25,8,.85),
        10px 0 18px -16px rgba(64,25,8,.85) !important;
    }

    .identity > div {
      min-height: 85px !important;
      padding: 10px 22px !important;
      justify-content: center !important;
      gap: 5px !important;
      text-align: center !important;
    }

    .identity > div + div {
      position: relative !important;
      border-top: 2px solid rgba(100,50,20,.38) !important;
    }

    .identity > div:last-child::after {
      content: "▦";
      position: absolute;
      right: 18px;
      top: 50%;
      color: #372010;
      font-family: Arial, sans-serif;
      font-size: 25px;
      font-weight: 900;
      line-height: 1;
      transform: translateY(-50%);
    }

    .identity .label {
      color: #241208 !important;
      font-size: 22px !important;
      font-weight: 900 !important;
      line-height: 1.06 !important;
      text-shadow: none !important;
    }

    .identity > div:first-child .value {
      display: block !important;
      min-width: 180px !important;
      margin-top: 3px !important;
      color: #170d07 !important;
      font-size: 32px !important;
      font-weight: 900 !important;
      line-height: 1 !important;
      letter-spacing: .1px !important;
      text-align: center !important;
      text-shadow: 0 1px 0 rgba(255,255,255,.45) !important;
    }

    .identity > div:last-child .value {
      display: block !important;
      width: 190px !important;
      min-width: 190px !important;
      max-width: 190px !important;
      margin: 4px auto 0 !important;
      color: #170d07 !important;
      font-family: "Courier New", Consolas, monospace !important;
      font-size: 27px !important;
      font-weight: 900 !important;
      font-variant-numeric: tabular-nums lining-nums !important;
      font-feature-settings: "tnum" 1, "lnum" 1 !important;
      line-height: 1 !important;
      letter-spacing: .3px !important;
      direction: ltr !important;
      unicode-bidi: isolate !important;
      text-align: center !important;
      white-space: nowrap !important;
      transform: none !important;
      transition: none !important;
      text-shadow: 0 1px 0 rgba(255,255,255,.45) !important;
    }

    @media (max-width: 1180px) {
      .top {
        min-height: 158px !important;
        grid-template-columns:
          120px minmax(232px, 1fr) minmax(245px, 1.34fr)
          repeat(6, minmax(64px, .52fr)) !important;
      }

      .clock-face {
        width: 104px !important;
        height: 104px !important;
        min-width: 104px !important;
        min-height: 104px !important;
      }
      .hand-hour { height: 28px !important; }
      .hand-minute { height: 37px !important; }
      .hand-second { height: 42px !important; }
      .${NUMBER_CLASS} { font-size: 12px; }

      .identity {
        min-width: 232px !important;
        transform: translateX(10px) !important;
      }
      .identity > div {
        min-height: 76px !important;
        padding: 8px 18px !important;
      }
      .identity .label { font-size: 20px !important; }
      .identity > div:first-child .value {
        min-width: 150px !important;
        font-size: 29px !important;
      }
      .identity > div:last-child .value {
        width: 165px !important;
        min-width: 165px !important;
        max-width: 165px !important;
        font-size: 24px !important;
      }
      .identity > div:last-child::after {
        right: 11px;
        font-size: 21px;
      }
    }
  `;
}

function ensureClockNumbers(shadow) {
  const clock = shadow.querySelector('.clock-face');
  if (!(clock instanceof HTMLElement)) return false;
  [['12', '12'], ['3', '3'], ['6', '6'], ['9', '9']].forEach(([text, position]) => {
    let number = clock.querySelector(`.${NUMBER_CLASS}[data-position="${position}"]`);
    if (!(number instanceof HTMLElement)) {
      number = document.createElement('span');
      number.className = NUMBER_CLASS;
      number.dataset.position = position;
      number.textContent = text;
      clock.appendChild(number);
    }
  });
  return true;
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

  const numbersAdded = ensureClockNumbers(shadow);
  const clock = shadow.querySelector('.clock-face');
  const identity = shadow.querySelector('.identity');
  const dateValue = shadow.querySelector('.identity > div:last-child .value');
  const clockWorking = clock instanceof HTMLElement
    && shadow.querySelector('.hand-hour') instanceof HTMLElement
    && shadow.querySelector('.hand-minute') instanceof HTMLElement
    && shadow.querySelector('.hand-second') instanceof HTMLElement;

  host.dataset.gannzillaTasiTimeTrackerClockIdentityV558 = 'true';
  host.dataset.gannzillaTasiTimeTrackerIdentityShiftRightV558 = window.innerWidth < 1180 ? '10px' : '14px';
  host.dataset.gannzillaTasiTimeTrackerStableDateV558 = String(dateValue instanceof HTMLElement);
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV558 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    analogClockPx: window.innerWidth < 1180 ? 104 : 126,
    identityShiftRightPx: window.innerWidth < 1180 ? 10 : 14,
    stableDateWidthPx: window.innerWidth < 1180 ? 165 : 190,
    numbersAdded,
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

  window.GANNZILLA_TASI_TIME_TRACKER_CLOCK_IDENTITY_V558 = true;
  window.__auditGannzillaTasiTimeTrackerClockIdentityV558 = () => {
    const host = document.getElementById(HOST_ID);
    const shadow = host?.shadowRoot;
    const identity = shadow?.querySelector('.identity');
    const dateValue = shadow?.querySelector('.identity > div:last-child .value');
    return {
      ok: host instanceof HTMLElement
        && shadow instanceof ShadowRoot
        && host.dataset.gannzillaTasiTimeTrackerClockIdentityV558 === 'true'
        && shadow.getElementById(STYLE_ID) instanceof HTMLStyleElement
        && identity instanceof HTMLElement
        && dateValue instanceof HTMLElement,
      build: BUILD,
      applyCount,
      identityShiftRight: host?.dataset?.gannzillaTasiTimeTrackerIdentityShiftRightV558 || null,
      dateWidthPx: dateValue instanceof HTMLElement
        ? Math.round(dateValue.getBoundingClientRect().width)
        : null,
      canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV558 === 'true',
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, observer };
  schedule('install', 0);
}

install();
