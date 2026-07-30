const BUILD = 657;
const STATE_KEY = '__gannzillaCenterClockUnifiedGeometryV657';
const PARAM = 'centerClockUnifiedGeometry';
const SCALE_PARAM = 'centerClockUnifiedScale';
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
const HIJRI_DATE_ID = 'gannzilla-center-clock-lower-hijri-date-v624';
const COMPACT_DATE_ID = 'gannzilla-center-clock-lower-fixed-date-row-v630';
const STYLE_ID = 'gannzilla-center-clock-unified-geometry-style-v657';

let frame = 0;
let timer = 0;
let observer = null;
let observedSignature = '';
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
  const logo = document.getElementById(LOGO_ID);
  const clock = document.getElementById(CLOCK_ID);
  const display = document.getElementById(DISPLAY_ID);
  const date = document.getElementById(DATE_ID);
  const upperAngle = document.getElementById(UPPER_ANGLE_ID);
  const upperTime = document.getElementById(UPPER_TIME_ID);
  const divider = document.getElementById(DIVIDER_ID);
  const lowerTime = document.getElementById(LOWER_TIME_ID);
  const lowerAngle = document.getElementById(LOWER_ANGLE_ID);
  const hijriDate = document.getElementById(HIJRI_DATE_ID);
  const compactDate = document.getElementById(COMPACT_DATE_ID);

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
    logo,
    clock,
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

function bindObserver(found) {
  if (typeof MutationObserver !== 'function' || !found) return;
  const nodes = [
    found.logo,
    found.clock,
    found.display,
    found.date,
    found.upperAngle,
    found.upperTime,
    found.divider,
    found.lowerTime,
    found.lowerAngle,
    found.hijriDate,
  ];
  const signature = nodes.map((node) => node.id).join('|');
  if (observer && observedSignature === signature) return;

  observer?.disconnect();
  observedSignature = signature;
  observer = new MutationObserver((records) => {
    if (applying) return;
    if (records.some((record) => record.type === 'attributes')) {
      queueMicrotask(() => apply('style-authority-correction'));
    }
  });
  nodes.forEach((node) => observer.observe(node, {
    attributes: true,
    attributeFilter: ['style', 'class'],
  }));
}

function baseGeometry(logo, clock) {
  const logoRect = logo.getBoundingClientRect();
  const clockRect = clock.getBoundingClientRect();
  const logoWidth = Number.parseFloat(logo.style.getPropertyValue('width')) || logoRect.width;
  const clockWidth = Number.parseFloat(clock.style.getPropertyValue('width')) || clockRect.width;
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

  const found = findElements();
  if (!found) return false;
  bindObserver(found);

  const geometry = baseGeometry(found.logo, found.clock);
  const scale = scaleValue();
  const diameter = geometry.baseDiameter * scale;

  const dateSize = clamp(diameter * 0.064, 12, 22);
  const upperAngleSize = clamp(diameter * 0.112, 21, 39);
  const upperTimeSize = clamp(diameter * 0.104, 20, 37);
  const lowerTimeSize = clamp(diameter * 0.098, 18, 34);
  const lowerAngleSize = clamp(diameter * 0.092, 17, 32);
  const hijriDateSize = clamp(diameter * 0.052, 10, 18);

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

    // One owner for frame and every vertical row. No stacked layout authorities.
    setImportant(found.display, 'box-shadow', [
      'inset 0 0 0 1px #382015',
      'inset 0 0 0 3px #8b512b',
      'inset 0 0 0 5px #c9954f',
      'inset 0 0 0 7.5px #f1d49b',
      'inset 0 0 0 9.5px #70401f',
      'inset 0 0 14px rgba(55,29,16,0.18)',
    ].join(', '));

    setImportant(found.date, 'left', '10%');
    setImportant(found.date, 'top', '14%');
    setImportant(found.date, 'width', '80%');
    setImportant(found.date, 'font-size', `${dateSize.toFixed(3)}px`);
    setImportant(found.date, 'font-weight', '600');

    setImportant(found.upperAngle, 'top', '29.5%');
    setImportant(found.upperAngle, 'font-size', `${upperAngleSize.toFixed(3)}px`);
    setImportant(found.upperAngle, 'font-weight', '600');

    setImportant(found.upperTime, 'top', '41.5%');
    setImportant(found.upperTime, 'font-size', `${upperTimeSize.toFixed(3)}px`);
    setImportant(found.upperTime, 'font-weight', '600');

    // Geometric midpoint between the two time rows. Robot result: 53.747%.
    setImportant(found.divider, 'left', '10%');
    setImportant(found.divider, 'top', '53.75%');
    setImportant(found.divider, 'width', '80%');
    setImportant(found.divider, 'height', '1.25px');
    setImportant(found.divider, 'transform', 'translateY(-50%)');

    setImportant(found.lowerTime, 'top', '64%');
    setImportant(found.lowerTime, 'font-size', `${lowerTimeSize.toFixed(3)}px`);
    setImportant(found.lowerTime, 'font-weight', '600');

    setImportant(found.lowerAngle, 'top', '76%');
    setImportant(found.lowerAngle, 'font-size', `${lowerAngleSize.toFixed(3)}px`);
    setImportant(found.lowerAngle, 'font-weight', '600');

    setImportant(found.hijriDate, 'display', 'block');
    setImportant(found.hijriDate, 'visibility', 'visible');
    setImportant(found.hijriDate, 'opacity', '1');
    setImportant(found.hijriDate, 'left', '10%');
    setImportant(found.hijriDate, 'top', '86%');
    setImportant(found.hijriDate, 'width', '80%');
    setImportant(found.hijriDate, 'font-size', `${hijriDateSize.toFixed(3)}px`);
    setImportant(found.hijriDate, 'font-weight', '600');
    setImportant(found.hijriDate, 'direction', 'rtl');
    setImportant(found.hijriDate, 'text-align', 'center');
    setImportant(found.hijriDate, 'transform', 'translate3d(0, -50%, 0)');

    if (found.compactDate) setImportant(found.compactDate, 'display', 'none');

    found.display.dataset.gannzillaCenterClockUnifiedGeometryV657 = 'true';
    found.display.dataset.gannzillaCenterClockUnifiedScaleV657 = scale.toFixed(3);
    found.display.dataset.gannzillaCenterClockDividerTopV657 = '53.75';
  } finally {
    applying = false;
  }

  const displayRect = found.display.getBoundingClientRect();
  const upperRect = found.upperTime.getBoundingClientRect();
  const dividerRect = found.divider.getBoundingClientRect();
  const lowerRect = found.lowerTime.getBoundingClientRect();

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    scale,
    baseDiameter: geometry.baseDiameter,
    diameter,
    dividerTopPercent: 53.75,
    upperDividerClearancePx: dividerRect.top - upperRect.bottom,
    lowerDividerClearancePx: lowerRect.top - dividerRect.bottom,
    displayWidth: displayRect.width,
    singleGeometryOwner: true,
    removedAuthorityImports: ['V616', 'V630', 'V653', 'V654', 'V655', 'V656'],
    wheelSizeChanged: false,
    wheelGeometryChanged: false,
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
  timer = window.setInterval(() => schedule('unified-geometry-watch'), 500);

  window.GANNZILLA_CENTER_CLOCK_UNIFIED_GEOMETRY_V657 = true;
  window.__auditGannzillaCenterClockUnifiedGeometryV657 = () => {
    const found = findElements();
    return {
      ok: enabled()
        && Boolean(found)
        && found.display.dataset.gannzillaCenterClockUnifiedGeometryV657 === 'true'
        && found.display.dataset.gannzillaCenterClockDividerTopV657 === '53.75',
      build: BUILD,
      singleGeometryOwner: true,
      wheelSizeChanged: false,
      wheelGeometryChanged: false,
      observerActive: Boolean(observer),
      timerActive: Boolean(timer),
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule };
  schedule('install');
}

install();
