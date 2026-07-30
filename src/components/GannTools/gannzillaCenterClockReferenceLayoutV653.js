const BUILD = 653;
const STATE_KEY = '__gannzillaCenterClockReferenceLayoutV653';
const PARAM = 'centerClockReferenceLayout';
const SCALE_PARAM = 'centerClockReferenceScale';
const DEFAULT_SCALE = 1.18;

const LOGO_ID = 'gannzilla-center-logo-responsive-81-v596';
const CLOCK_ID = 'gannzilla-center-digital-clock-v599';
const DISPLAY_ID = 'gannzilla-center-clock-display-v614';
const DATE_ID = 'gannzilla-center-clock-date-v614';
const UPPER_ANGLE_ID = 'gannzilla-center-clock-angle-row-v614';
const UPPER_TIME_ID = 'gannzilla-center-clock-time-row-v614';
const DIVIDER_ID = 'gannzilla-center-clock-divider-v614';
const LOWER_TIME_ID = 'gannzilla-center-clock-lower-time-row-v624';
const LOWER_ANGLE_ID = 'gannzilla-center-clock-lower-angle-row-v624';
const SOURCE_HIJRI_DATE_ID = 'gannzilla-center-clock-lower-hijri-date-v624';
const COMPACT_DATE_ROW_ID = 'gannzilla-center-clock-lower-fixed-date-row-v630';
const STYLE_ID = 'gannzilla-center-clock-reference-layout-style-v653';

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

function scaleValue() {
  const value = Number(params().get(SCALE_PARAM));
  return Number.isFinite(value) ? clamp(value, 1, 1.28) : DEFAULT_SCALE;
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
    #${SOURCE_HIJRI_DATE_ID} {
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

function elements() {
  const logo = document.getElementById(LOGO_ID);
  const clock = document.getElementById(CLOCK_ID);
  const display = document.getElementById(DISPLAY_ID);
  const date = document.getElementById(DATE_ID);
  const upperAngle = document.getElementById(UPPER_ANGLE_ID);
  const upperTime = document.getElementById(UPPER_TIME_ID);
  const divider = document.getElementById(DIVIDER_ID);
  const lowerTime = document.getElementById(LOWER_TIME_ID);
  const lowerAngle = document.getElementById(LOWER_ANGLE_ID);
  const hijriDate = document.getElementById(SOURCE_HIJRI_DATE_ID);
  const compactDate = document.getElementById(COMPACT_DATE_ROW_ID);

  if (!(logo instanceof HTMLImageElement)
      || !(clock instanceof HTMLDivElement)
      || !(display instanceof HTMLDivElement)
      || !(date instanceof HTMLDivElement)
      || !(upperAngle instanceof HTMLDivElement)
      || !(upperTime instanceof HTMLDivElement)
      || !(divider instanceof HTMLElement)
      || !(lowerTime instanceof HTMLDivElement)
      || !(lowerAngle instanceof HTMLDivElement)
      || !(hijriDate instanceof HTMLDivElement)) return null;

  return {
    logo, clock, display, date, upperAngle, upperTime, divider,
    lowerTime, lowerAngle, hijriDate,
    compactDate: compactDate instanceof HTMLElement ? compactDate : null,
  };
}

function baseGeometry(logo, clock) {
  const logoWidth = Number.parseFloat(logo.style.getPropertyValue('width'))
    || logo.getBoundingClientRect().width;
  const clockWidth = Number.parseFloat(clock.style.getPropertyValue('width'))
    || clock.getBoundingClientRect().width;
  const baseDiameter = Math.max(1, logoWidth || clockWidth || 1);

  return {
    left: logo.style.getPropertyValue('left') || clock.style.getPropertyValue('left'),
    top: logo.style.getPropertyValue('top') || clock.style.getPropertyValue('top'),
    baseDiameter,
  };
}

function apply(source = 'apply') {
  frame = 0;
  if (!enabled() || applying) return false;
  ensureStyle();

  const found = elements();
  if (!found) return false;

  const geometry = baseGeometry(found.logo, found.clock);
  const scale = scaleValue();
  const diameter = geometry.baseDiameter * scale;

  const dateSize = clamp(diameter * 0.070, 13, 24);
  const upperAngleSize = clamp(diameter * 0.120, 22, 42);
  const upperTimeSize = clamp(diameter * 0.112, 21, 40);
  const lowerTimeSize = clamp(diameter * 0.105, 19, 36);
  const lowerAngleSize = clamp(diameter * 0.100, 18, 34);
  const hijriDateSize = clamp(diameter * 0.058, 11, 20);

  applying = true;
  try {
    [found.clock, found.display].forEach((element) => {
      if (geometry.left) setImportant(element, 'left', geometry.left);
      if (geometry.top) setImportant(element, 'top', geometry.top);
      setImportant(element, 'width', `${diameter.toFixed(3)}px`);
      setImportant(element, 'height', `${diameter.toFixed(3)}px`);
      setImportant(element, 'min-width', `${diameter.toFixed(3)}px`);
      setImportant(element, 'min-height', `${diameter.toFixed(3)}px`);
      setImportant(element, 'max-width', `${diameter.toFixed(3)}px`);
      setImportant(element, 'max-height', `${diameter.toFixed(3)}px`);
    });

    setImportant(found.display, 'box-shadow', [
      'inset 0 0 0 2px #382015',
      'inset 0 0 0 5px #8b512b',
      'inset 0 0 0 8px #c9954f',
      'inset 0 0 0 11px #f1d49b',
      'inset 0 0 0 14px #70401f',
      'inset 0 0 20px rgba(55,29,16,0.22)',
    ].join(', '));

    setImportant(found.date, 'top', '12%');
    setImportant(found.date, 'font-size', `${dateSize.toFixed(3)}px`);
    setImportant(found.date, 'font-weight', '600');

    setImportant(found.upperAngle, 'top', '29%');
    setImportant(found.upperAngle, 'font-size', `${upperAngleSize.toFixed(3)}px`);
    setImportant(found.upperAngle, 'font-weight', '600');

    setImportant(found.upperTime, 'top', '42%');
    setImportant(found.upperTime, 'font-size', `${upperTimeSize.toFixed(3)}px`);
    setImportant(found.upperTime, 'font-weight', '600');

    setImportant(found.divider, 'left', '8%');
    setImportant(found.divider, 'top', '51%');
    setImportant(found.divider, 'width', '84%');
    setImportant(found.divider, 'height', '1.4px');
    setImportant(found.divider, 'transform', 'translateY(-50%)');

    setImportant(found.lowerTime, 'top', '62%');
    setImportant(found.lowerTime, 'font-size', `${lowerTimeSize.toFixed(3)}px`);
    setImportant(found.lowerTime, 'font-weight', '600');

    setImportant(found.lowerAngle, 'top', '75%');
    setImportant(found.lowerAngle, 'font-size', `${lowerAngleSize.toFixed(3)}px`);
    setImportant(found.lowerAngle, 'font-weight', '600');

    setImportant(found.hijriDate, 'display', 'block');
    setImportant(found.hijriDate, 'visibility', 'visible');
    setImportant(found.hijriDate, 'opacity', '1');
    setImportant(found.hijriDate, 'left', '8%');
    setImportant(found.hijriDate, 'top', '87%');
    setImportant(found.hijriDate, 'width', '84%');
    setImportant(found.hijriDate, 'font-size', `${hijriDateSize.toFixed(3)}px`);
    setImportant(found.hijriDate, 'font-weight', '600');
    setImportant(found.hijriDate, 'direction', 'rtl');
    setImportant(found.hijriDate, 'text-align', 'center');
    setImportant(found.hijriDate, 'transform', 'translate3d(0, -50%, 0)');

    if (found.compactDate) setImportant(found.compactDate, 'display', 'none');

    found.display.dataset.gannzillaCenterClockReferenceLayoutV653 = 'true';
    found.display.dataset.gannzillaCenterClockReferenceScaleV653 = scale.toFixed(3);
    found.display.dataset.gannzillaCenterClockReferenceDiameterV653 = diameter.toFixed(3);
  } finally {
    applying = false;
  }

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    scale,
    baseDiameter: geometry.baseDiameter,
    diameter,
    dividerTop: 51,
    upperPositions: { date: 12, angle: 29, time: 42 },
    lowerPositions: { time: 62, angle: 75, date: 87 },
    wheelSizeChanged: false,
    wheelGeometryChanged: false,
    clockGeometryChanged: true,
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

  [
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:wheel-input-v459',
    'gannzilla:page-scrollbar-pan-v305',
  ].forEach((name) => window.addEventListener(name, () => schedule(name), false));

  window.addEventListener('resize', () => schedule('window-resize'), false);

  if (typeof MutationObserver === 'function') {
    observer = new MutationObserver(() => {
      if (!applying) schedule('clock-layout-overwrite');
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style'],
    });
  }

  timer = window.setInterval(() => schedule('reference-layout-watch'), 500);

  window.GANNZILLA_CENTER_CLOCK_REFERENCE_LAYOUT_V653 = true;
  window.__auditGannzillaCenterClockReferenceLayoutV653 = () => {
    const found = elements();
    const scale = scaleValue();
    return {
      ok: enabled()
        && Boolean(found)
        && found.display.dataset.gannzillaCenterClockReferenceLayoutV653 === 'true'
        && Number(found.display.dataset.gannzillaCenterClockReferenceScaleV653) === Number(scale.toFixed(3)),
      build: BUILD,
      scale,
      wheelSizeChanged: false,
      wheelGeometryChanged: false,
      clockGeometryChanged: true,
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