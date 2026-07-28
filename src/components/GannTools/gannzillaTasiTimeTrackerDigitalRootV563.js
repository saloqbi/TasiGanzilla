const BUILD = 563;
const STATE_KEY = '__gannzillaTasiTimeTrackerDigitalRootV563';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-digital-root-v563';

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
    && boolParam('timeTrackerDigitalRoot', true);
}

function digitalRoot(value) {
  let numeric = Math.abs(Math.trunc(Number(value) || 0));
  while (numeric >= 10) {
    numeric = String(numeric)
      .split('')
      .reduce((sum, digit) => sum + Number(digit), 0);
  }
  return numeric;
}

function cssText() {
  return `
    .top {
      grid-template-columns:
        180px minmax(292px, 1.08fr) minmax(460px, 1.58fr)
        132px 132px 132px 166px minmax(110px, .56fr) minmax(110px, .56fr) !important;
    }

    .current-time,
    .metric.hour,
    .metric.minute,
    .metric.second,
    .metric.angle {
      overflow: visible !important;
    }

    .current-time .time-value {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 10px !important;
      box-sizing: border-box !important;
      width: 450px !important;
      min-width: 450px !important;
      max-width: 450px !important;
      margin: 0 auto !important;
      padding: 0 8px !important;
      font-family: "Courier New", Consolas, monospace !important;
      font-size: 62px !important;
      font-weight: 900 !important;
      font-variant-numeric: tabular-nums lining-nums !important;
      font-feature-settings: "tnum" 1, "lnum" 1 !important;
      letter-spacing: 0 !important;
      line-height: 1 !important;
      direction: ltr !important;
      unicode-bidi: isolate !important;
      text-align: center !important;
      white-space: nowrap !important;
      transform: translateX(10px) !important;
      transition: none !important;
      animation: none !important;
    }

    .current-time .time-value::after {
      content: " = " attr(data-digital-root);
      flex: 0 0 auto;
      color: #2a160b;
      font-family: "Courier New", Consolas, monospace;
      font-size: 42px;
      font-weight: 900;
      font-variant-numeric: tabular-nums lining-nums;
      font-feature-settings: "tnum" 1, "lnum" 1;
      line-height: 1;
      letter-spacing: 0;
      text-shadow: 0 1px 0 rgba(255,255,255,.52);
    }

    .metric.hour .value,
    .metric.minute .value,
    .metric.second .value,
    .metric.angle .value {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 5px !important;
      box-sizing: border-box !important;
      height: 66px !important;
      min-height: 66px !important;
      margin: 8px auto 0 !important;
      padding: 0 9px !important;
      font-family: Georgia, "Times New Roman", serif !important;
      font-size: 32px !important;
      font-weight: 800 !important;
      font-variant-numeric: tabular-nums lining-nums !important;
      font-feature-settings: "tnum" 1, "lnum" 1 !important;
      line-height: 1 !important;
      direction: ltr !important;
      unicode-bidi: isolate !important;
      text-align: center !important;
      white-space: nowrap !important;
      transform: none !important;
      transition: none !important;
      animation: none !important;
    }

    .metric.hour .value,
    .metric.minute .value,
    .metric.second .value {
      width: 126px !important;
      min-width: 126px !important;
      max-width: 126px !important;
      min-inline-size: 126px !important;
      inline-size: 126px !important;
    }

    .metric.angle .value {
      width: 158px !important;
      min-width: 158px !important;
      max-width: 158px !important;
      min-inline-size: 158px !important;
      inline-size: 158px !important;
      font-size: 30px !important;
    }

    .metric.hour .value::after,
    .metric.minute .value::after,
    .metric.second .value::after,
    .metric.angle .value::after {
      content: " = " attr(data-digital-root);
      flex: 0 0 auto;
      color: #2a160b;
      font-family: "Courier New", Consolas, monospace;
      font-size: 25px;
      font-weight: 900;
      font-variant-numeric: tabular-nums lining-nums;
      font-feature-settings: "tnum" 1, "lnum" 1;
      line-height: 1;
      letter-spacing: 0;
      text-shadow: 0 1px 0 rgba(255,255,255,.50);
    }

    .metric.minute .value::after,
    .metric.second .value::after {
      color: #fff0d2;
      text-shadow: 0 0 5px rgba(255,148,59,.72);
    }

    @media (max-width: 1180px) {
      .top {
        grid-template-columns:
          154px minmax(250px, 1fr) minmax(370px, 1.40fr)
          112px 112px 112px 142px minmax(90px, .51fr) minmax(90px, .51fr) !important;
      }

      .current-time .time-value {
        width: 364px !important;
        min-width: 364px !important;
        max-width: 364px !important;
        gap: 7px !important;
        font-size: 50px !important;
        transform: translateX(7px) !important;
      }

      .current-time .time-value::after {
        font-size: 33px;
      }

      .metric.hour .value,
      .metric.minute .value,
      .metric.second .value {
        width: 106px !important;
        min-width: 106px !important;
        max-width: 106px !important;
        min-inline-size: 106px !important;
        inline-size: 106px !important;
        height: 58px !important;
        min-height: 58px !important;
        padding: 0 6px !important;
        font-size: 27px !important;
      }

      .metric.angle .value {
        width: 136px !important;
        min-width: 136px !important;
        max-width: 136px !important;
        min-inline-size: 136px !important;
        inline-size: 136px !important;
        height: 58px !important;
        min-height: 58px !important;
        padding: 0 6px !important;
        font-size: 25px !important;
      }

      .metric.hour .value::after,
      .metric.minute .value::after,
      .metric.second .value::after,
      .metric.angle .value::after {
        font-size: 21px;
      }
    }
  `;
}

function setResult(shadow, selector, result, formula) {
  const element = shadow.querySelector(selector);
  if (!(element instanceof HTMLElement)) return false;
  const resultText = String(result);
  if (element.dataset.digitalRoot !== resultText) element.dataset.digitalRoot = resultText;
  element.dataset.digitalRootFormula = formula;
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

  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const angle = minute * 6;

  const timeRoot = digitalRoot(hour + minute);
  const hourRoot = digitalRoot(hour);
  const minuteRoot = digitalRoot(minute);
  const secondRoot = digitalRoot(second);
  const angleRoot = digitalRoot(angle);

  const wrote = [
    setResult(shadow, '[data-time]', timeRoot, `${hour}+${minute}`),
    setResult(shadow, '[data-hour]', hourRoot, String(hour)),
    setResult(shadow, '[data-minute]', minuteRoot, String(minute)),
    setResult(shadow, '[data-second]', secondRoot, String(second)),
    setResult(shadow, '[data-angle]', angleRoot, String(angle)),
  ].every(Boolean);

  host.dataset.gannzillaTasiTimeTrackerDigitalRootV563 = 'true';
  host.dataset.gannzillaTasiTimeTrackerTimeRootV563 = String(timeRoot);
  host.dataset.gannzillaTasiTimeTrackerHourRootV563 = String(hourRoot);
  host.dataset.gannzillaTasiTimeTrackerMinuteRootV563 = String(minuteRoot);
  host.dataset.gannzillaTasiTimeTrackerSecondRootV563 = String(secondRoot);
  host.dataset.gannzillaTasiTimeTrackerAngleRootV563 = String(angleRoot);
  host.dataset.gannzillaTasiTimeTrackerTimeRootFormulaV563 = `${hour}+${minute}`;
  host.dataset.gannzillaTasiTimeTrackerSecondsExcludedFromTimeRootV563 = 'true';
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV563 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    hour,
    minute,
    second,
    angle,
    timeRoot,
    hourRoot,
    minuteRoot,
    secondRoot,
    angleRoot,
    timeRootFormula: `${hour}+${minute}`,
    secondsExcludedFromTimeRoot: true,
    wrote,
    canvasChanged: false,
    at: Date.now(),
  };
  return wrote;
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
  const interval = window.setInterval(() => apply('clock-sync'), 100);

  window.GANNZILLA_TASI_TIME_TRACKER_DIGITAL_ROOT_V563 = true;
  window.__auditGannzillaTasiTimeTrackerDigitalRootV563 = () => {
    const host = document.getElementById(HOST_ID);
    const shadow = host?.shadowRoot;
    const timeValue = shadow?.querySelector('[data-time]');
    const hourValue = shadow?.querySelector('[data-hour]');
    const minuteValue = shadow?.querySelector('[data-minute]');
    const secondValue = shadow?.querySelector('[data-second]');
    const angleValue = shadow?.querySelector('[data-angle]');
    return {
      ok: host instanceof HTMLElement
        && shadow instanceof ShadowRoot
        && host.dataset.gannzillaTasiTimeTrackerDigitalRootV563 === 'true'
        && shadow.getElementById(STYLE_ID) instanceof HTMLStyleElement
        && timeValue instanceof HTMLElement
        && hourValue instanceof HTMLElement
        && minuteValue instanceof HTMLElement
        && secondValue instanceof HTMLElement
        && angleValue instanceof HTMLElement,
      build: BUILD,
      applyCount,
      timeRoot: Number(host?.dataset?.gannzillaTasiTimeTrackerTimeRootV563 || 0),
      hourRoot: Number(host?.dataset?.gannzillaTasiTimeTrackerHourRootV563 || 0),
      minuteRoot: Number(host?.dataset?.gannzillaTasiTimeTrackerMinuteRootV563 || 0),
      secondRoot: Number(host?.dataset?.gannzillaTasiTimeTrackerSecondRootV563 || 0),
      angleRoot: Number(host?.dataset?.gannzillaTasiTimeTrackerAngleRootV563 || 0),
      formula: host?.dataset?.gannzillaTasiTimeTrackerTimeRootFormulaV563 || null,
      secondsExcludedFromTimeRoot: host?.dataset?.gannzillaTasiTimeTrackerSecondsExcludedFromTimeRootV563 === 'true',
      canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV563 === 'true',
      lastApply,
    };
  };

  window[STATE_KEY] = {
    apply,
    schedule,
    observer,
    interval,
    digitalRoot,
  };
  schedule('install', 0);
}

install();
