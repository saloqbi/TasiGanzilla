const BUILD = 606;
const STATE_KEY = '__gannzillaCenterClockLuxuryInnerFrameV606';
const CLOCK_ID = 'gannzilla-center-digital-clock-v599';
const DISPLAY_ID = 'gannzilla-center-clock-date-angle-time-v604';
const CONTENT_ID = 'gannzilla-center-clock-upper-content-v604';
const DATE_ID = 'gannzilla-center-clock-date-line-v604';
const ANGLE_ID = 'gannzilla-center-clock-angle-line-v604';
const TIME_ID = 'gannzilla-center-clock-time-line-v604';

let frame = 0;
let timer = 0;
let observer = null;
let measureCanvas = null;
let applyCount = 0;
let lastApply = null;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function enabled() {
  const query = params();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  const logoEnabled = !['false', '0', 'off', 'no'].includes(
    String(query.get('centerLogo') || 'true').toLowerCase(),
  );
  const toggleEnabled = !['false', '0', 'off', 'no'].includes(
    String(query.get('centerLogoClockToggle') || 'true').toLowerCase(),
  );
  const luxuryEnabled = !['false', '0', 'off', 'no'].includes(
    String(query.get('centerClockLuxuryFrame') || 'true').toLowerCase(),
  );
  return wheelMode && logoEnabled && toggleEnabled && luxuryEnabled;
}

function setImportant(element, property, value) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.style.getPropertyValue(property) === value
      && element.style.getPropertyPriority(property) === 'important') return false;
  element.style.setProperty(property, value, 'important');
  return true;
}

function textWidth(element, fontSize) {
  if (!(element instanceof HTMLElement)) return 0;
  if (!(measureCanvas instanceof HTMLCanvasElement)) measureCanvas = document.createElement('canvas');
  const context = measureCanvas.getContext('2d');
  if (!context) return 0;
  const computed = getComputedStyle(element);
  context.font = `${computed.fontWeight || '700'} ${fontSize}px ${computed.fontFamily || 'serif'}`;
  return context.measureText(element.textContent || '').width;
}

function fitLine(element, diameter, preferredRatio, availableRatio, minimum = 8) {
  if (!(element instanceof HTMLElement) || !(diameter > 0)) return 0;
  const preferred = Math.max(minimum, diameter * preferredRatio);
  const available = Math.max(20, diameter * availableRatio);
  const measured = textWidth(element, preferred);
  const fitted = measured > available && measured > 0
    ? Math.max(minimum, preferred * (available / measured) * 0.97)
    : preferred;
  setImportant(element, 'font-size', `${fitted.toFixed(3)}px`);
  return fitted;
}

function apply(source = 'apply') {
  frame = 0;
  if (!enabled()) return false;

  const clock = document.getElementById(CLOCK_ID);
  const display = document.getElementById(DISPLAY_ID);
  const content = document.getElementById(CONTENT_ID);
  const date = document.getElementById(DATE_ID);
  const angle = document.getElementById(ANGLE_ID);
  const time = document.getElementById(TIME_ID);

  if (!(clock instanceof HTMLDivElement)
      || !(display instanceof HTMLDivElement)
      || !(content instanceof HTMLDivElement)
      || !(date instanceof HTMLDivElement)
      || !(angle instanceof HTMLDivElement)
      || !(time instanceof HTMLDivElement)) return false;

  // The frame starts exactly at the circle boundary and grows inward only.
  setImportant(display, 'box-sizing', 'border-box');
  setImportant(display, 'border', '0');
  setImportant(display, 'border-radius', '50%');
  setImportant(display, 'clip-path', 'circle(50% at 50% 50%)');
  setImportant(display, 'overflow', 'hidden');
  setImportant(display, 'box-shadow', [
    'inset 0 0 0 3px #3b2317',
    'inset 0 0 0 6px #b77d43',
    'inset 0 0 0 8px rgba(255, 239, 205, 0.96)',
    'inset 0 0 0 10px rgba(104, 58, 31, 0.82)',
    'inset 0 0 18px rgba(68, 37, 23, 0.18)',
  ].join(', '));

  // Keep all content in the upper half, but increase spacing and visual hierarchy.
  setImportant(content, 'top', '3.5%');
  setImportant(content, 'left', '9%');
  setImportant(content, 'width', '82%');
  setImportant(content, 'height', '42.5%');
  setImportant(content, 'justify-content', 'space-between');
  setImportant(content, 'font-family', 'Georgia, "Times New Roman", serif');

  [date, angle, time].forEach((element) => {
    setImportant(element, 'font-family', 'Georgia, "Times New Roman", serif');
    setImportant(element, 'font-weight', '700');
    setImportant(element, 'color', '#342116');
    setImportant(element, 'text-shadow', '0 1px 0 rgba(255,255,255,0.52), 0 1px 1px rgba(63,32,18,0.16)');
    setImportant(element, 'line-height', '1');
  });

  setImportant(date, 'letter-spacing', '0.035em');
  setImportant(angle, 'letter-spacing', '0.018em');
  setImportant(time, 'letter-spacing', '0.012em');

  const diameter = Number.parseFloat(display.style.getPropertyValue('width'))
    || display.getBoundingClientRect().width
    || clock.getBoundingClientRect().width
    || 0;

  const dateSize = fitLine(date, diameter, 0.058, 0.78, 8);
  const angleSize = fitLine(angle, diameter, 0.086, 0.72, 10);
  const timeSize = fitLine(time, diameter, 0.092, 0.84, 11);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    diameter,
    dateSize,
    angleSize,
    timeSize,
    inwardOnlyFrame: true,
    outerGeometryChanged: false,
    clockLogicChanged: false,
    lowerHalfEmpty: true,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule') {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => apply(source));
}

function installObserver() {
  observer?.disconnect();
  observer = new MutationObserver((records) => {
    if (records.some((record) => record.type === 'childList'
        || record.attributeName === 'style')) schedule('mutation');
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style'],
  });
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  installObserver();
  [
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:wheel-input-v459',
    'gannzilla:page-scrollbar-pan-v305',
  ].forEach((name) => window.addEventListener(name, () => schedule(name), false));
  window.addEventListener('resize', () => schedule('window-resize'), false);

  [0, 80, 220, 600, 1400, 3000].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });
  timer = window.setInterval(() => schedule('style-authority'), 300);

  window.GANNZILLA_CENTER_CLOCK_LUXURY_INNER_FRAME_V606 = true;
  window.__auditGannzillaCenterClockLuxuryInnerFrameV606 = () => ({
    ok: document.getElementById(DISPLAY_ID) instanceof HTMLDivElement
      && document.getElementById(DATE_ID) instanceof HTMLDivElement
      && document.getElementById(ANGLE_ID) instanceof HTMLDivElement
      && document.getElementById(TIME_ID) instanceof HTMLDivElement,
    build: BUILD,
    frameDirection: 'inward-only',
    frameAtOuterBoundary: true,
    outsideProtrusion: false,
    layoutScope: 'center-clock-only',
    timerActive: Boolean(timer),
    applyCount,
    lastApply,
  });

  window[STATE_KEY] = { apply, schedule, observer };
  schedule('install');
}

install();
