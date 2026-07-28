const BUILD = 551;
const STATE_KEY = '__gannzillaTasiTimeTrackerOrderClarityV551';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-order-clarity-v551';

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
    && boolParam('timeTrackerOrderClarity', true);
}

function cssText() {
  return `
    .top {
      direction: ltr !important;
      min-height: 136px !important;
      grid-template-columns: 104px minmax(188px, .95fr) minmax(315px, 1.58fr) repeat(6, minmax(80px, .60fr)) !important;
    }

    .clock-face { grid-column: 1 !important; }
    .identity { grid-column: 2 !important; }
    .current-time { grid-column: 3 !important; }
    .metric.hour { grid-column: 4 !important; }
    .metric.minute { grid-column: 5 !important; }
    .metric.second { grid-column: 6 !important; }
    .metric.angle { grid-column: 7 !important; }
    .metric.direction { grid-column: 8 !important; }
    .metric.cycle { grid-column: 9 !important; }

    .label {
      font-size: 18px !important;
      font-weight: 900 !important;
      line-height: 1.16 !important;
      letter-spacing: .1px !important;
    }

    .value {
      font-size: 27px !important;
      font-weight: 900 !important;
      line-height: 1.08 !important;
    }

    .identity .value { font-size: 25px !important; }

    .time-value {
      font-size: clamp(50px, 4.8vw, 62px) !important;
      letter-spacing: 3.4px !important;
    }

    .time-subtitle {
      font-size: 15px !important;
      font-weight: 800 !important;
    }

    .metric.hour .value,
    .metric.minute .value,
    .metric.second .value,
    .metric.angle .value {
      min-width: 72px !important;
      padding: 10px 14px 11px !important;
      font-size: 32px !important;
    }

    .metric.angle .value { min-width: 92px !important; }
    .metric.direction .value,
    .metric.cycle .value { font-size: 23px !important; }

    .cycle-value {
      direction: ltr !important;
      flex-direction: row !important;
      justify-content: center !important;
    }

    .section-title {
      width: 186px !important;
      height: 52px !important;
      margin: 10px 0 -53px 0 !important;
      padding: 14px 9px 10px !important;
      font-size: 16px !important;
      font-weight: 900 !important;
      line-height: 1.05 !important;
      text-align: center !important;
    }

    .row-shell {
      height: 53px !important;
      margin-left: 185px !important;
    }

    .cells {
      height: 51px !important;
      grid-template-columns: repeat(60, minmax(15px, 1fr)) !important;
    }

    .cell {
      font-size: clamp(10px, .98vw, 13px) !important;
      font-weight: 800 !important;
      line-height: 1 !important;
      text-rendering: geometricPrecision !important;
      -webkit-font-smoothing: antialiased !important;
    }

    .cell.active {
      font-size: 17px !important;
      transform: translateY(-1px) scale(1.12) !important;
    }

    .tasi-luxury-guide-v549 {
      top: 193px !important;
      height: 113px !important;
      width: 3px !important;
    }

    @media (max-width: 1180px) {
      .top {
        min-height: 120px !important;
        grid-template-columns: 86px minmax(155px, .86fr) minmax(250px, 1.38fr) repeat(6, minmax(66px, .53fr)) !important;
      }
      .label { font-size: 15px !important; }
      .value { font-size: 23px !important; }
      .identity .value { font-size: 21px !important; }
      .time-value { font-size: 48px !important; }
      .time-subtitle { font-size: 13px !important; }
      .metric.hour .value,
      .metric.minute .value,
      .metric.second .value,
      .metric.angle .value {
        min-width: 58px !important;
        padding: 9px 10px 10px !important;
        font-size: 27px !important;
      }
      .metric.angle .value { min-width: 76px !important; }
      .metric.direction .value,
      .metric.cycle .value { font-size: 20px !important; }
      .section-title {
        width: 158px !important;
        height: 46px !important;
        margin-bottom: -47px !important;
        padding-top: 13px !important;
        font-size: 14px !important;
      }
      .row-shell {
        height: 47px !important;
        margin-left: 157px !important;
      }
      .cells { height: 45px !important; }
      .cell { font-size: clamp(9px, .9vw, 12px) !important; }
      .cell.active { font-size: 16px !important; }
      .tasi-luxury-guide-v549 {
        top: 174px !important;
        height: 101px !important;
      }
    }
  `;
}

function setText(element, text) {
  if (element instanceof HTMLElement && element.textContent !== text) element.textContent = text;
}

function enforceLabelsAndOrder(shadow) {
  const labels = [
    ['.metric.hour .label', 'الساعة'],
    ['.metric.minute .label', 'الدقيقة'],
    ['.metric.second .label', 'الثانية'],
    ['.metric.angle .label', 'الزاوية'],
    ['.metric.direction .label', 'اتجاه الدورة'],
    ['.metric.cycle .label', 'الدورة'],
    ['.identity > div:first-child .label', 'اليوم'],
    ['.identity > div:last-child .label', 'التاريخ'],
  ];
  labels.forEach(([selector, text]) => setText(shadow.querySelector(selector), text));
  setText(shadow.querySelector('.time-subtitle'), 'الوقت الحالي بنظام 24 ساعة');

  const titles = Array.from(shadow.querySelectorAll('.section-title'));
  setText(titles[0], 'الدقائق (60) — كل خانة دقيقة');
  setText(titles[1], 'الزوايا (360°) — كل دقيقة = 6°');

  const top = shadow.querySelector('.top');
  if (top instanceof HTMLElement) top.dataset.gannzillaTasiTimeTrackerOrderV551 = 'clock,date,time,hour,minute,second,angle,direction,cycle';
}

let applyCount = 0;
let lastApply = null;
let timer = 0;
let observer = null;
let interval = 0;

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

  enforceLabelsAndOrder(shadow);

  host.dataset.gannzillaTasiTimeTrackerOrderClarityV551 = 'true';
  host.dataset.gannzillaTasiTimeTrackerRightToLeftOrderV551 = 'cycle,direction,angle,second,minute,hour,time,date,clock';
  host.dataset.gannzillaTasiTimeTrackerRowClarityV551 = 'labels-16,cells-13,active-17';
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV551 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    rightToLeftOrder: ['cycle', 'direction', 'angle', 'second', 'minute', 'hour', 'time', 'date', 'clock'],
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
  interval = window.setInterval(() => apply('label-integrity'), 1000);

  window.GANNZILLA_TASI_TIME_TRACKER_ORDER_CLARITY_V551 = true;
  window.__auditGannzillaTasiTimeTrackerOrderClarityV551 = () => {
    const host = document.getElementById(HOST_ID);
    const shadow = host?.shadowRoot;
    const top = shadow?.querySelector('.top');
    return {
      ok: host instanceof HTMLElement
        && shadow instanceof ShadowRoot
        && host.dataset.gannzillaTasiTimeTrackerOrderClarityV551 === 'true'
        && top?.dataset?.gannzillaTasiTimeTrackerOrderV551 === 'clock,date,time,hour,minute,second,angle,direction,cycle',
      build: BUILD,
      applyCount,
      rightToLeftOrder: host?.dataset?.gannzillaTasiTimeTrackerRightToLeftOrderV551 || null,
      canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV551 === 'true',
      lastApply,
    };
  };

  window[STATE_KEY] = {
    apply,
    schedule,
    observer,
    get interval() { return interval; },
  };

  schedule('install', 0);
}

install();
