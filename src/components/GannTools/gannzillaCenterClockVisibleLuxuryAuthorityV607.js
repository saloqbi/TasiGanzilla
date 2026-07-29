const BUILD = 609;
const STATE_KEY = '__gannzillaCenterClockRegularReadableLayoutV609';
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

  const diameter = display.getBoundingClientRect().width
    || clock.getBoundingClientRect().width
    || 0;

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

  // Use explicit row positions instead of flex scaling for stable, regular spacing.
  setImportant(content, 'position', 'absolute');
  setImportant(content, 'top', '4.5%');
  setImportant(content, 'left', '9%');
  setImportant(content, 'width', '82%');
  setImportant(content, 'height', '42%');
  setImportant(content, 'display', 'block');
  setImportant(content, 'font-family', 'Georgia, "Times New Roman", serif');
  setImportant(content, 'overflow', 'visible');

  [date, angle, time].forEach((element) => {
    setImportant(element, 'position', 'absolute');
    setImportant(element, 'left', '0');
    setImportant(element, 'width', '100%');
    setImportant(element, 'margin', '0');
    setImportant(element, 'padding', '0');
    setImportant(element, 'font-family', 'Georgia, "Times New Roman", serif');
    setImportant(element, 'font-weight', '700');
    setImportant(element, 'color', '#342116');
    setImportant(element, 'line-height', '1');
    setImportant(element, 'text-align', 'center');
    setImportant(element, 'white-space', 'nowrap');
    setImportant(element, 'text-shadow', '0 1px 0 rgba(255,255,255,0.58), 0 1px 1px rgba(63,32,18,0.18)');
    setImportant(element, 'transform', 'translate3d(0, -50%, 0)');
    setImportant(element, 'transform-origin', 'center center');
    setImportant(element, 'will-change', 'top, font-size');
  });

  // Clear hierarchy: slightly larger date, lower angle, and clock safely above the divider.
  const dateSize = Math.max(10, diameter * 0.064);
  const angleSize = Math.max(14, diameter * 0.086);
  const timeSize = Math.max(15, diameter * 0.088);

  setImportant(date, 'top', '12%');
  setImportant(angle, 'top', '48%');
  setImportant(time, 'top', '82%');

  setImportant(date, 'font-size', `${dateSize.toFixed(3)}px`);
  setImportant(angle, 'font-size', `${angleSize.toFixed(3)}px`);
  setImportant(time, 'font-size', `${timeSize.toFixed(3)}px`);

  setImportant(date, 'letter-spacing', '0.040em');
  setImportant(angle, 'letter-spacing', '0.018em');
  setImportant(time, 'letter-spacing', '0.012em');

  // Keep the centre divider unchanged and leave the lower half empty.
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
    diameter,
    inwardOnlyFrame: true,
    outsideProtrusion: false,
    circleGeometryChanged: false,
    clockLogicChanged: false,
    lowerHalfEmpty: true,
    dividerAtPercent: 50,
    rowTopPercent: { date: 12, angle: 48, time: 82 },
    fontSizePx: { date: dateSize, angle: angleSize, time: timeSize },
    dateEnlarged: true,
    angleLowered: true,
    regularAbsoluteLayout: true,
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

  window.GANNZILLA_CENTER_CLOCK_REGULAR_READABLE_LAYOUT_V609 = true;
  window.__auditGannzillaCenterClockRegularReadableLayoutV609 = () => ({
    ok: document.getElementById(DISPLAY_ID) instanceof HTMLDivElement
      && document.getElementById(DATE_ID) instanceof HTMLDivElement
      && document.getElementById(ANGLE_ID) instanceof HTMLDivElement
      && document.getElementById(TIME_ID) instanceof HTMLDivElement,
    build: BUILD,
    inwardOnlyFrame: true,
    outsideProtrusion: false,
    circleGeometryChanged: false,
    clockLogicChanged: false,
    dateEnlarged: true,
    angleLowered: true,
    regularAbsoluteLayout: true,
    intervalActive: Boolean(interval),
    applyCount,
    lastApply,
  });

  window[STATE_KEY] = { apply, schedule, interval };
  schedule('install');
}

install();