const BUILD = 559;
const STATE_KEY = '__gannzillaTasiTimeTrackerClockDisplayV559';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-clock-display-v559';

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
    && boolParam('timeTrackerClockIdentity', true)
    && boolParam('timeTrackerClockDisplay', true);
}

function cssText() {
  return `
    .top {
      min-height: 214px !important;
      grid-template-columns:
        180px minmax(292px, 1.08fr) minmax(390px, 1.48fr)
        repeat(6, minmax(76px, .56fr)) !important;
      align-items: stretch !important;
    }

    .clock-face {
      width: 158px !important;
      height: 158px !important;
      min-width: 158px !important;
      min-height: 158px !important;
      border: 8px solid #5a2410 !important;
      background:
        radial-gradient(circle at 50% 50%, transparent 0 55%, rgba(131, 70, 31, .18) 56% 58%, transparent 59%),
        repeating-conic-gradient(from -1deg, #28150b 0 1.2deg, transparent 1.2deg 6deg),
        radial-gradient(circle, #f5dfba 0 63%, #d5a76e 64% 69%, #2c1006 70% 100%) !important;
      box-shadow:
        0 0 0 2px #f2bd7b,
        0 0 0 8px #351307,
        0 0 19px rgba(87, 29, 7, .70),
        0 0 34px rgba(213, 112, 43, .42) !important;
    }

    .clock-face .tasi-clock-number-v558 {
      color: #201209 !important;
      font-size: 19px !important;
      font-weight: 900 !important;
      text-shadow: 0 1px 0 rgba(255,255,255,.72) !important;
    }

    .clock-face .tasi-clock-number-v558[data-position="12"] { top: 10px !important; }
    .clock-face .tasi-clock-number-v558[data-position="3"] { right: 11px !important; }
    .clock-face .tasi-clock-number-v558[data-position="6"] { bottom: 10px !important; }
    .clock-face .tasi-clock-number-v558[data-position="9"] { left: 11px !important; }

    .hand-hour {
      width: 6px !important;
      height: 43px !important;
      background: #17100b !important;
      box-shadow: 0 0 0 1px rgba(255,255,255,.18), 0 1px 3px rgba(0,0,0,.55) !important;
    }

    .hand-minute {
      width: 5px !important;
      height: 58px !important;
      background: #17100b !important;
      box-shadow: 0 0 0 1px rgba(255,255,255,.16), 0 1px 3px rgba(0,0,0,.55) !important;
    }

    .hand-second {
      width: 2px !important;
      height: 65px !important;
      background: #c41620 !important;
      box-shadow: 0 0 4px rgba(196,22,32,.72) !important;
    }

    .clock-pin {
      width: 16px !important;
      height: 16px !important;
      background: radial-gradient(circle at 35% 30%, #fff4cf 0 18%, #c38238 21% 55%, #49200d 58% 100%) !important;
      box-shadow: 0 0 0 2px #351307, 0 0 9px rgba(255,140,66,.72) !important;
    }

    .identity {
      min-width: 292px !important;
      transform: translateX(16px) !important;
    }

    .identity > div:last-child::after {
      display: none !important;
      content: none !important;
    }

    .identity > div:last-child .value {
      display: grid !important;
      place-items: center !important;
      width: 224px !important;
      min-width: 224px !important;
      max-width: 224px !important;
      height: 40px !important;
      min-height: 40px !important;
      margin: 5px auto 0 !important;
      padding: 0 !important;
      font-family: "Courier New", Consolas, monospace !important;
      font-size: 32px !important;
      font-weight: 900 !important;
      font-variant-numeric: tabular-nums lining-nums !important;
      font-feature-settings: "tnum" 1, "lnum" 1 !important;
      letter-spacing: .15px !important;
      direction: ltr !important;
      unicode-bidi: isolate !important;
      text-align: center !important;
      white-space: nowrap !important;
      transform: none !important;
      transition: none !important;
      animation: none !important;
    }

    .current-time {
      display: grid !important;
      place-content: center !important;
      justify-items: center !important;
      overflow: visible !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }

    .current-time .time-value {
      display: block !important;
      width: 380px !important;
      min-width: 380px !important;
      max-width: 380px !important;
      margin: 0 auto !important;
      padding: 0 !important;
      font-family: "Courier New", Consolas, monospace !important;
      font-size: 69px !important;
      font-weight: 900 !important;
      font-variant-numeric: tabular-nums lining-nums !important;
      font-feature-settings: "tnum" 1, "lnum" 1 !important;
      letter-spacing: 0 !important;
      line-height: 1 !important;
      direction: ltr !important;
      unicode-bidi: isolate !important;
      text-align: center !important;
      white-space: nowrap !important;
      transform: translateX(16px) !important;
      transition: none !important;
      animation: none !important;
    }

    .current-time .time-subtitle {
      width: 100% !important;
      margin-top: 8px !important;
      text-align: center !important;
      transform: translateX(16px) !important;
    }

    @media (max-width: 1180px) {
      .top {
        min-height: 186px !important;
        grid-template-columns:
          154px minmax(250px, 1fr) minmax(326px, 1.34fr)
          repeat(6, minmax(64px, .51fr)) !important;
      }

      .clock-face {
        width: 134px !important;
        height: 134px !important;
        min-width: 134px !important;
        min-height: 134px !important;
      }

      .clock-face .tasi-clock-number-v558 { font-size: 16px !important; }
      .hand-hour { height: 36px !important; }
      .hand-minute { height: 49px !important; }
      .hand-second { height: 55px !important; }

      .identity {
        min-width: 250px !important;
        transform: translateX(12px) !important;
      }

      .identity > div:last-child .value {
        width: 198px !important;
        min-width: 198px !important;
        max-width: 198px !important;
        font-size: 28px !important;
      }

      .current-time .time-value {
        width: 326px !important;
        min-width: 326px !important;
        max-width: 326px !important;
        font-size: 58px !important;
        transform: translateX(11px) !important;
      }

      .current-time .time-subtitle {
        transform: translateX(11px) !important;
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

  const timeValue = shadow.querySelector('.current-time .time-value');
  const dateValue = shadow.querySelector('.identity > div:last-child .value');
  const clock = shadow.querySelector('.clock-face');
  const stable = timeValue instanceof HTMLElement
    && dateValue instanceof HTMLElement
    && clock instanceof HTMLElement;

  host.dataset.gannzillaTasiTimeTrackerClockDisplayV559 = 'true';
  host.dataset.gannzillaTasiTimeTrackerDigitalTimeStableV559 = String(stable);
  host.dataset.gannzillaTasiTimeTrackerCalendarMarkRemovedV559 = 'true';
  host.dataset.gannzillaTasiTimeTrackerAnalogClockLargeV559 = 'true';
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV559 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    digitalTimeFixedWidth: true,
    digitalTimeShiftRightPx: window.innerWidth < 1180 ? 11 : 16,
    dateFixedWidth: true,
    calendarMarkRemoved: true,
    analogClockPx: window.innerWidth < 1180 ? 134 : 158,
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

  window.GANNZILLA_TASI_TIME_TRACKER_CLOCK_DISPLAY_V559 = true;
  window.__auditGannzillaTasiTimeTrackerClockDisplayV559 = () => {
    const host = document.getElementById(HOST_ID);
    const shadow = host?.shadowRoot;
    const timeValue = shadow?.querySelector('.current-time .time-value');
    const dateValue = shadow?.querySelector('.identity > div:last-child .value');
    const clock = shadow?.querySelector('.clock-face');
    return {
      ok: host instanceof HTMLElement
        && shadow instanceof ShadowRoot
        && host.dataset.gannzillaTasiTimeTrackerClockDisplayV559 === 'true'
        && shadow.getElementById(STYLE_ID) instanceof HTMLStyleElement
        && timeValue instanceof HTMLElement
        && dateValue instanceof HTMLElement
        && clock instanceof HTMLElement,
      build: BUILD,
      applyCount,
      timeWidthPx: timeValue instanceof HTMLElement ? Math.round(timeValue.getBoundingClientRect().width) : null,
      dateWidthPx: dateValue instanceof HTMLElement ? Math.round(dateValue.getBoundingClientRect().width) : null,
      clockWidthPx: clock instanceof HTMLElement ? Math.round(clock.getBoundingClientRect().width) : null,
      calendarMarkRemoved: host?.dataset?.gannzillaTasiTimeTrackerCalendarMarkRemovedV559 === 'true',
      canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV559 === 'true',
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, observer };
  schedule('install', 0);
}

install();
