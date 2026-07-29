const BUILD = 607;
const STATE_KEY = '__gannzillaCenterClockVisibleLuxuryAuthorityV607';
const CLOCK_ID = 'gannzilla-center-digital-clock-v599';
const DISPLAY_ID = 'gannzilla-center-clock-date-angle-time-v604';
const CONTENT_ID = 'gannzilla-center-clock-upper-content-v604';
const DATE_ID = 'gannzilla-center-clock-date-line-v604';
const ANGLE_ID = 'gannzilla-center-clock-angle-line-v604';
const TIME_ID = 'gannzilla-center-clock-time-line-v604';
const DIVIDER_ID = 'gannzilla-center-clock-divider-v604';

let frame = 0;
let interval = 0;
let applyCount = 0;
let lastApply = null;

function setImportant(element, property, value) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.style.getPropertyValue(property) === value
      && element.style.getPropertyPriority(property) === 'important') return false;
  element.style.setProperty(property, value, 'important');
  return true;
}

function apply(source = 'apply') {
  frame = 0;

  const clock = document.getElementById(CLOCK_ID);
  const display = document.getElementById(DISPLAY_ID);
  const content = document.getElementById(CONTENT_ID);
  const date = document.getElementById(DATE_ID);
  const angle = document.getElementById(ANGLE_ID);
  const time = document.getElementById(TIME_ID);
  const divider = document.getElementById(DIVIDER_ID);

  if (!(clock instanceof HTMLDivElement)
      || !(display instanceof HTMLDivElement)
      || !(content instanceof HTMLDivElement)
      || !(date instanceof HTMLDivElement)
      || !(angle instanceof HTMLDivElement)
      || !(time instanceof HTMLDivElement)
      || !(divider instanceof HTMLDivElement)) return false;

  // Preserve the existing circle diameter and position. Draw only inward.
  setImportant(clock, 'background', '#DDBD8A');
  setImportant(display, 'background', '#DDBD8A');
  setImportant(display, 'box-sizing', 'border-box');
  setImportant(display, 'border', '0');
  setImportant(display, 'border-radius', '50%');
  setImportant(display, 'clip-path', 'circle(50% at 50% 50%)');
  setImportant(display, 'overflow', 'hidden');
  setImportant(display, 'box-shadow', [
    'inset 0 0 0 4px #3d2418',
    'inset 0 0 0 7px #b77a3f',
    'inset 0 0 0 9px #f5dfb7',
    'inset 0 0 0 12px #704329',
    'inset 0 0 16px rgba(68, 37, 23, 0.18)',
  ].join(', '));

  // Keep all three rows inside the upper half and add visible breathing room.
  setImportant(content, 'top', '3%');
  setImportant(content, 'left', '10%');
  setImportant(content, 'width', '80%');
  setImportant(content, 'height', '43.5%');
  setImportant(content, 'display', 'flex');
  setImportant(content, 'flex-direction', 'column');
  setImportant(content, 'align-items', 'center');
  setImportant(content, 'justify-content', 'space-evenly');
  setImportant(content, 'gap', '0');
  setImportant(content, 'font-family', 'Georgia, "Times New Roman", serif');

  [date, angle, time].forEach((element) => {
    setImportant(element, 'font-family', 'Georgia, "Times New Roman", serif');
    setImportant(element, 'font-weight', '700');
    setImportant(element, 'color', '#342116');
    setImportant(element, 'line-height', '1');
    setImportant(element, 'text-shadow', '0 1px 0 rgba(255,255,255,0.58), 0 1px 1px rgba(63,32,18,0.18)');
    setImportant(element, 'transform-origin', 'center center');
  });

  // Enlarge visually without changing the clock calculation or circle geometry.
  setImportant(date, 'transform', 'scale(1.18)');
  setImportant(angle, 'transform', 'scale(1.34)');
  setImportant(time, 'transform', 'scale(1.30)');
  setImportant(date, 'letter-spacing', '0.035em');
  setImportant(angle, 'letter-spacing', '0.018em');
  setImportant(time, 'letter-spacing', '0.012em');

  setImportant(divider, 'left', '6%');
  setImportant(divider, 'top', '50%');
  setImportant(divider, 'width', '88%');
  setImportant(divider, 'height', '1.5px');
  setImportant(divider, 'background', 'rgba(52, 33, 22, 0.76)');
  setImportant(divider, 'box-shadow', '0 1px 0 rgba(255,255,255,0.38)');

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    inwardOnlyFrame: true,
    outsideProtrusion: false,
    circleGeometryChanged: false,
    clockLogicChanged: false,
    lowerHalfEmpty: true,
    textScales: { date: 1.18, angle: 1.34, time: 1.30 },
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
      || window[STATE_KEY]) return;

  [
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:wheel-input-v459',
    'gannzilla:page-scrollbar-pan-v305',
  ].forEach((name) => window.addEventListener(name, () => schedule(name), false));
  window.addEventListener('resize', () => schedule('window-resize'), false);

  [0, 50, 120, 250, 500, 1000, 2000, 4000].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  interval = window.setInterval(() => apply('persistent-authority'), 120);

  window.GANNZILLA_CENTER_CLOCK_VISIBLE_LUXURY_AUTHORITY_V607 = true;
  window.__auditGannzillaCenterClockVisibleLuxuryAuthorityV607 = () => ({
    ok: document.getElementById(DISPLAY_ID) instanceof HTMLDivElement
      && document.getElementById(DATE_ID) instanceof HTMLDivElement
      && document.getElementById(ANGLE_ID) instanceof HTMLDivElement
      && document.getElementById(TIME_ID) instanceof HTMLDivElement,
    build: BUILD,
    inwardOnlyFrame: true,
    outsideProtrusion: false,
    circleGeometryChanged: false,
    clockLogicChanged: false,
    intervalActive: Boolean(interval),
    applyCount,
    lastApply,
  });

  window[STATE_KEY] = { apply, schedule, interval };
  schedule('install');
}

install();
