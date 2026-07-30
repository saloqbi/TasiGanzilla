const BUILD = 654;
const STATE_KEY = '__gannzillaCenterClockComfortLayoutV654';
const PARAM = 'centerClockComfortLayout';

const DISPLAY_ID = 'gannzilla-center-clock-display-v614';
const DATE_ID = 'gannzilla-center-clock-date-v614';
const UPPER_ANGLE_ID = 'gannzilla-center-clock-angle-row-v614';
const UPPER_TIME_ID = 'gannzilla-center-clock-time-row-v614';
const DIVIDER_ID = 'gannzilla-center-clock-divider-v614';
const LOWER_TIME_ID = 'gannzilla-center-clock-lower-time-row-v624';
const LOWER_ANGLE_ID = 'gannzilla-center-clock-lower-angle-row-v624';
const HIJRI_DATE_ID = 'gannzilla-center-clock-lower-hijri-date-v624';
const COMPACT_DATE_ID = 'gannzilla-center-clock-lower-fixed-date-row-v630';
const STYLE_ID = 'gannzilla-center-clock-comfort-layout-style-v654';

let frame = 0;
let timer = 0;
let observer = null;
let applying = false;
let applyCount = 0;
let lastApply = null;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function enabled() {
  const query = params();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  const value = String(query.get(PARAM) || '').toLowerCase();
  return wheelMode && ['true', '1', 'yes', 'on'].includes(value);
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function setImportant(element, property, value) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.style.getPropertyValue(property) === value
      && element.style.getPropertyPriority(property) === 'important') return false;
  element.style.setProperty(property, value, 'important');
  return true;
}

function ensureStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    #${DISPLAY_ID},
    #${DATE_ID},
    #${UPPER_ANGLE_ID},
    #${UPPER_TIME_ID},
    #${LOWER_TIME_ID},
    #${LOWER_ANGLE_ID},
    #${HIJRI_DATE_ID} {
      font-family: Arial, Tahoma, sans-serif !important;
      font-variant-numeric: tabular-nums lining-nums !important;
      font-feature-settings: "tnum" 1, "lnum" 1 !important;
    }

    #${UPPER_ANGLE_ID},
    #${UPPER_TIME_ID},
    #${LOWER_TIME_ID},
    #${LOWER_ANGLE_ID} {
      grid-template-columns: max-content 0.72em max-content !important;
      column-gap: 0.12em !important;
      line-height: 1 !important;
      white-space: nowrap !important;
    }

    #${DIVIDER_ID}::after {
      content: none !important;
      display: none !important;
    }
  `;
}

function findElements() {
  const display = document.getElementById(DISPLAY_ID);
  const date = document.getElementById(DATE_ID);
  const upperAngle = document.getElementById(UPPER_ANGLE_ID);
  const upperTime = document.getElementById(UPPER_TIME_ID);
  const divider = document.getElementById(DIVIDER_ID);
  const lowerTime = document.getElementById(LOWER_TIME_ID);
  const lowerAngle = document.getElementById(LOWER_ANGLE_ID);
  const hijriDate = document.getElementById(HIJRI_DATE_ID);
  const compactDate = document.getElementById(COMPACT_DATE_ID);

  if (!(display instanceof HTMLDivElement)
      || !(date instanceof HTMLDivElement)
      || !(upperAngle instanceof HTMLDivElement)
      || !(upperTime instanceof HTMLDivElement)
      || !(divider instanceof HTMLElement)
      || !(lowerTime instanceof HTMLDivElement)
      || !(lowerAngle instanceof HTMLDivElement)
      || !(hijriDate instanceof HTMLDivElement)) return null;

  return {
    display,
    date,
    upperAngle,
    upperTime,
    divider,
    lowerTime,
    lowerAngle,
    hijriDate,
    compactDate: compactDate instanceof HTMLElement ? compactDate : null,
  };
}

function apply(source = 'apply') {
  frame = 0;
  if (!enabled() || applying) return false;
  ensureStyle();

  const found = findElements();
  if (!found) return false;

  const diameter = found.display.getBoundingClientRect().width
    || Number.parseFloat(found.display.style.getPropertyValue('width'))
    || 0;
  if (!(diameter > 0)) return false;

  const dateSize = clamp(diameter * 0.064, 12, 22);
  const upperAngleSize = clamp(diameter * 0.112, 21, 39);
  const upperTimeSize = clamp(diameter * 0.104, 20, 37);
  const lowerTimeSize = clamp(diameter * 0.098, 18, 34);
  const lowerAngleSize = clamp(diameter * 0.092, 17, 32);
  const hijriDateSize = clamp(diameter * 0.052, 10, 18);

  applying = true;
  try {
    // Reduce the inner frame occupancy by about 10% while preserving the outer clock diameter.
    setImportant(found.display, 'box-shadow', [
      'inset 0 0 0 1.5px #382015',
      'inset 0 0 0 4px #8b512b',
      'inset 0 0 0 6.5px #c9954f',
      'inset 0 0 0 9px #f1d49b',
      'inset 0 0 0 11.5px #70401f',
      'inset 0 0 18px rgba(55,29,16,0.20)',
    ].join(', '));

    // Rebalance all rows inside the enlarged usable face area.
    setImportant(found.date, 'top', '14%');
    setImportant(found.date, 'left', '10%');
    setImportant(found.date, 'width', '80%');
    setImportant(found.date, 'font-size', `${dateSize.toFixed(3)}px`);

    setImportant(found.upperAngle, 'top', '29.5%');
    setImportant(found.upperAngle, 'font-size', `${upperAngleSize.toFixed(3)}px`);

    setImportant(found.upperTime, 'top', '41.5%');
    setImportant(found.upperTime, 'font-size', `${upperTimeSize.toFixed(3)}px`);

    setImportant(found.divider, 'left', '10%');
    setImportant(found.divider, 'top', '53%');
    setImportant(found.divider, 'width', '80%');
    setImportant(found.divider, 'height', '1.25px');
    setImportant(found.divider, 'transform', 'translateY(-50%)');

    setImportant(found.lowerTime, 'top', '64%');
    setImportant(found.lowerTime, 'font-size', `${lowerTimeSize.toFixed(3)}px`);

    setImportant(found.lowerAngle, 'top', '76%');
    setImportant(found.lowerAngle, 'font-size', `${lowerAngleSize.toFixed(3)}px`);

    setImportant(found.hijriDate, 'display', 'block');
    setImportant(found.hijriDate, 'visibility', 'visible');
    setImportant(found.hijriDate, 'opacity', '1');
    setImportant(found.hijriDate, 'left', '10%');
    setImportant(found.hijriDate, 'top', '86%');
    setImportant(found.hijriDate, 'width', '80%');
    setImportant(found.hijriDate, 'font-size', `${hijriDateSize.toFixed(3)}px`);
    setImportant(found.hijriDate, 'direction', 'rtl');
    setImportant(found.hijriDate, 'text-align', 'center');
    setImportant(found.hijriDate, 'transform', 'translate3d(0, -50%, 0)');

    if (found.compactDate) setImportant(found.compactDate, 'display', 'none');

    found.display.dataset.gannzillaCenterClockComfortLayoutV654 = 'true';
    found.display.dataset.gannzillaCenterClockComfortDiameterV654 = diameter.toFixed(3);
  } finally {
    applying = false;
  }

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    diameter,
    innerFrameReduced: true,
    innerFrameReductionApproxPercent: 10,
    wheelSizeChanged: false,
    wheelGeometryChanged: false,
    clockDiameterChanged: false,
    positions: {
      date: 14,
      upperAngle: 29.5,
      upperTime: 41.5,
      divider: 53,
      lowerTime: 64,
      lowerAngle: 76,
      hijriDate: 86,
    },
    sizes: {
      dateSize,
      upperAngleSize,
      upperTimeSize,
      lowerTimeSize,
      lowerAngleSize,
      hijriDateSize,
    },
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule') {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => apply(source));
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  [0, 60, 160, 360, 800, 1600, 3200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  if (typeof MutationObserver === 'function') {
    observer = new MutationObserver(() => {
      if (!applying) schedule('dom-change');
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  [
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:wheel-input-v459',
    'gannzilla:page-scrollbar-pan-v305',
  ].forEach((name) => window.addEventListener(name, () => schedule(name), false));

  window.addEventListener('resize', () => schedule('window-resize'), false);
  timer = window.setInterval(() => schedule('comfort-layout-watch'), 750);

  window.GANNZILLA_CENTER_CLOCK_COMFORT_LAYOUT_V654 = true;
  window.__auditGannzillaCenterClockComfortLayoutV654 = () => {
    const found = findElements();
    return {
      ok: enabled()
        && Boolean(found)
        && found.display.dataset.gannzillaCenterClockComfortLayoutV654 === 'true',
      build: BUILD,
      innerFrameReduced: true,
      innerFrameReductionApproxPercent: 10,
      wheelSizeChanged: false,
      wheelGeometryChanged: false,
      clockDiameterChanged: false,
      applyCount,
      observerActive: Boolean(observer),
      timerActive: Boolean(timer),
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule };
  schedule('install');
}

install();
