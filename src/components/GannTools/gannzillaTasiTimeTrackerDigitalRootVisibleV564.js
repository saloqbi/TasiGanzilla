const BUILD = 564;
const STATE_KEY = '__gannzillaTasiTimeTrackerDigitalRootVisibleV564';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-digital-root-visible-v564';
const ROW_CLASS = 'tasi-digital-root-row-v564';
const RESULT_CLASS = 'tasi-digital-root-result-v564';

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
    && boolParam('timeTrackerDigitalRoot', true)
    && boolParam('timeTrackerDigitalRootVisible', true);
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
    .current-time .time-value::after,
    .metric.hour .value::after,
    .metric.minute .value::after,
    .metric.second .value::after,
    .metric.angle .value::after {
      content: none !important;
      display: none !important;
      visibility: hidden !important;
      width: 0 !important;
      height: 0 !important;
    }

    .${ROW_CLASS} {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-sizing: border-box !important;
      direction: ltr !important;
      white-space: nowrap !important;
      overflow: visible !important;
    }

    .current-time > .${ROW_CLASS} {
      width: 450px !important;
      min-width: 450px !important;
      max-width: 450px !important;
      gap: 12px !important;
      margin: 0 auto !important;
      transform: translateX(10px) !important;
    }

    .current-time > .${ROW_CLASS} > .time-value {
      flex: 0 0 360px !important;
      width: 360px !important;
      min-width: 360px !important;
      max-width: 360px !important;
      margin: 0 !important;
      padding: 0 !important;
      transform: none !important;
      text-align: center !important;
    }

    .current-time > .${ROW_CLASS} > .${RESULT_CLASS} {
      flex: 0 0 68px !important;
      min-width: 68px !important;
      color: #241208 !important;
      font-family: "Courier New", Consolas, monospace !important;
      font-size: 40px !important;
      font-weight: 900 !important;
      font-variant-numeric: tabular-nums lining-nums !important;
      font-feature-settings: "tnum" 1, "lnum" 1 !important;
      line-height: 1 !important;
      letter-spacing: 0 !important;
      text-align: left !important;
      text-shadow: 0 1px 0 rgba(255,255,255,.55) !important;
    }

    .metric.hour > .${ROW_CLASS},
    .metric.minute > .${ROW_CLASS},
    .metric.second > .${ROW_CLASS} {
      width: 126px !important;
      min-width: 126px !important;
      max-width: 126px !important;
      gap: 7px !important;
      margin: 8px auto 0 !important;
    }

    .metric.angle > .${ROW_CLASS} {
      width: 158px !important;
      min-width: 158px !important;
      max-width: 158px !important;
      gap: 8px !important;
      margin: 8px auto 0 !important;
    }

    .metric.hour > .${ROW_CLASS} > .value,
    .metric.minute > .${ROW_CLASS} > .value,
    .metric.second > .${ROW_CLASS} > .value {
      flex: 0 0 78px !important;
      width: 78px !important;
      min-width: 78px !important;
      max-width: 78px !important;
      min-inline-size: 78px !important;
      inline-size: 78px !important;
      height: 58px !important;
      min-height: 58px !important;
      margin: 0 !important;
      padding: 0 !important;
      transform: none !important;
      overflow: hidden !important;
    }

    .metric.angle > .${ROW_CLASS} > .value {
      flex: 0 0 108px !important;
      width: 108px !important;
      min-width: 108px !important;
      max-width: 108px !important;
      min-inline-size: 108px !important;
      inline-size: 108px !important;
      height: 58px !important;
      min-height: 58px !important;
      margin: 0 !important;
      padding: 0 !important;
      transform: none !important;
      overflow: hidden !important;
    }

    .metric > .${ROW_CLASS} > .${RESULT_CLASS} {
      flex: 0 0 34px !important;
      min-width: 34px !important;
      color: #2a160b !important;
      font-family: "Courier New", Consolas, monospace !important;
      font-size: 24px !important;
      font-weight: 900 !important;
      font-variant-numeric: tabular-nums lining-nums !important;
      font-feature-settings: "tnum" 1, "lnum" 1 !important;
      line-height: 1 !important;
      letter-spacing: 0 !important;
      text-align: left !important;
      text-shadow: 0 1px 0 rgba(255,255,255,.50) !important;
    }

    .metric.minute > .${ROW_CLASS} > .${RESULT_CLASS},
    .metric.second > .${ROW_CLASS} > .${RESULT_CLASS} {
      color: #5b260e !important;
      text-shadow: 0 1px 0 rgba(255,255,255,.62), 0 0 5px rgba(255,148,59,.38) !important;
    }

    @media (max-width: 1180px) {
      .current-time > .${ROW_CLASS} {
        width: 364px !important;
        min-width: 364px !important;
        max-width: 364px !important;
        gap: 8px !important;
        transform: translateX(7px) !important;
      }

      .current-time > .${ROW_CLASS} > .time-value {
        flex-basis: 292px !important;
        width: 292px !important;
        min-width: 292px !important;
        max-width: 292px !important;
      }

      .current-time > .${ROW_CLASS} > .${RESULT_CLASS} {
        flex-basis: 56px !important;
        min-width: 56px !important;
        font-size: 32px !important;
      }

      .metric.hour > .${ROW_CLASS},
      .metric.minute > .${ROW_CLASS},
      .metric.second > .${ROW_CLASS} {
        width: 106px !important;
        min-width: 106px !important;
        max-width: 106px !important;
        gap: 5px !important;
      }

      .metric.angle > .${ROW_CLASS} {
        width: 136px !important;
        min-width: 136px !important;
        max-width: 136px !important;
        gap: 6px !important;
      }

      .metric.hour > .${ROW_CLASS} > .value,
      .metric.minute > .${ROW_CLASS} > .value,
      .metric.second > .${ROW_CLASS} > .value {
        flex-basis: 68px !important;
        width: 68px !important;
        min-width: 68px !important;
        max-width: 68px !important;
        min-inline-size: 68px !important;
        inline-size: 68px !important;
        height: 54px !important;
        min-height: 54px !important;
      }

      .metric.angle > .${ROW_CLASS} > .value {
        flex-basis: 92px !important;
        width: 92px !important;
        min-width: 92px !important;
        max-width: 92px !important;
        min-inline-size: 92px !important;
        inline-size: 92px !important;
        height: 54px !important;
        min-height: 54px !important;
      }

      .metric > .${ROW_CLASS} > .${RESULT_CLASS} {
        flex-basis: 28px !important;
        min-width: 28px !important;
        font-size: 20px !important;
      }
    }
  `;
}

const SPECS = [
  { key: 'time', container: '.current-time', value: '[data-time]' },
  { key: 'hour', container: '.metric.hour', value: '[data-hour]' },
  { key: 'minute', container: '.metric.minute', value: '[data-minute]' },
  { key: 'second', container: '.metric.second', value: '[data-second]' },
  { key: 'angle', container: '.metric.angle', value: '[data-angle]' },
];

function ensureResultRow(shadow, spec) {
  const container = shadow.querySelector(spec.container);
  const value = shadow.querySelector(spec.value);
  if (!(container instanceof HTMLElement) || !(value instanceof HTMLElement)) return null;

  let row = container.querySelector(`.${ROW_CLASS}[data-root-key="${spec.key}"]`);
  let result = row?.querySelector(`.${RESULT_CLASS}`);

  if (!(row instanceof HTMLElement)) {
    row = document.createElement('div');
    row.className = ROW_CLASS;
    row.dataset.rootKey = spec.key;
    value.parentNode?.insertBefore(row, value);
    row.appendChild(value);
  } else if (value.parentElement !== row) {
    row.insertBefore(value, row.firstChild);
  }

  if (!(result instanceof HTMLElement)) {
    result = document.createElement('span');
    result.className = RESULT_CLASS;
    result.dataset.rootResult = spec.key;
    result.setAttribute('aria-live', 'off');
    row.appendChild(result);
  }

  return { container, value, row, result };
}

function writeResult(binding, result, formula) {
  if (!binding) return false;
  const text = `= ${result}`;
  if (binding.result.textContent !== text) binding.result.textContent = text;
  binding.result.title = formula;
  binding.result.setAttribute('aria-label', `النتيجة ${result}`);
  return true;
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

  const bindings = Object.fromEntries(
    SPECS.map((spec) => [spec.key, ensureResultRow(shadow, spec)]),
  );

  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const angle = minute * 6;

  const roots = {
    time: digitalRoot(hour + minute),
    hour: digitalRoot(hour),
    minute: digitalRoot(minute),
    second: digitalRoot(second),
    angle: digitalRoot(angle),
  };

  const wrote = [
    writeResult(bindings.time, roots.time, `${hour} + ${minute}`),
    writeResult(bindings.hour, roots.hour, String(hour)),
    writeResult(bindings.minute, roots.minute, String(minute)),
    writeResult(bindings.second, roots.second, String(second)),
    writeResult(bindings.angle, roots.angle, String(angle)),
  ].every(Boolean);

  host.dataset.gannzillaTasiTimeTrackerDigitalRootVisibleV564 = 'true';
  host.dataset.gannzillaTasiTimeTrackerDigitalRootInsideCellV564 = 'false';
  host.dataset.gannzillaTasiTimeTrackerDigitalRootVisibleCountV564 = String(
    shadow.querySelectorAll(`.${RESULT_CLASS}`).length,
  );
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV564 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    hour,
    minute,
    second,
    angle,
    roots,
    wrote,
    resultPlacement: 'outside-black-cell',
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
  interval = window.setInterval(() => apply('clock-sync'), 200);

  window.GANNZILLA_TASI_TIME_TRACKER_DIGITAL_ROOT_VISIBLE_V564 = true;
  window.__auditGannzillaTasiTimeTrackerDigitalRootVisibleV564 = () => {
    const host = document.getElementById(HOST_ID);
    const shadow = host?.shadowRoot;
    const results = shadow instanceof ShadowRoot
      ? Array.from(shadow.querySelectorAll(`.${RESULT_CLASS}`))
      : [];
    return {
      ok: host instanceof HTMLElement
        && shadow instanceof ShadowRoot
        && host.dataset.gannzillaTasiTimeTrackerDigitalRootVisibleV564 === 'true'
        && shadow.getElementById(STYLE_ID) instanceof HTMLStyleElement
        && results.length === 5,
      build: BUILD,
      applyCount,
      visibleResultCount: results.length,
      placement: host?.dataset?.gannzillaTasiTimeTrackerDigitalRootInsideCellV564 === 'false'
        ? 'outside-black-cell'
        : 'unknown',
      canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV564 === 'true',
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
