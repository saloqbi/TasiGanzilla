const BUILD = 611;
const STATE_KEY = '__gannzillaCenterClockFineTuneV611';
const DATE_ID = 'gannzilla-center-clock-date-line-v604';
const ANGLE_ID = 'gannzilla-center-clock-angle-line-v604';
const TIME_ID = 'gannzilla-center-clock-time-line-v604';

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

  const date = document.getElementById(DATE_ID);
  const angle = document.getElementById(ANGLE_ID);
  const time = document.getElementById(TIME_ID);
  if (!(date instanceof HTMLDivElement)
      || !(angle instanceof HTMLDivElement)
      || !(time instanceof HTMLDivElement)) return false;

  // Lower only the date and enlarge all three rows slightly.
  setImportant(date, 'top', '18%');
  setImportant(date, 'transform', 'translate3d(0, -50%, 0) scale(1.08)');
  setImportant(angle, 'transform', 'translate3d(0, -50%, 0) scale(1.06)');
  setImportant(time, 'transform', 'translate3d(0, -50%, 0) scale(1.06)');

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    dateTopPercent: 18,
    scales: { date: 1.08, angle: 1.06, time: 1.06 },
    clockLogicChanged: false,
    circleGeometryChanged: false,
    dividerChanged: false,
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

  [0, 80, 220, 600, 1400, 3000].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  window.addEventListener('resize', () => schedule('window-resize'), false);
  interval = window.setInterval(() => apply('persistent-fine-tune'), 120);

  window.GANNZILLA_CENTER_CLOCK_FINE_TUNE_V611 = true;
  window.__auditGannzillaCenterClockFineTuneV611 = () => ({
    ok: document.getElementById(DATE_ID) instanceof HTMLDivElement
      && document.getElementById(ANGLE_ID) instanceof HTMLDivElement
      && document.getElementById(TIME_ID) instanceof HTMLDivElement,
    build: BUILD,
    dateLowered: true,
    digitsSlightlyEnlarged: true,
    intervalActive: Boolean(interval),
    applyCount,
    lastApply,
  });

  window[STATE_KEY] = { apply, schedule, interval };
  schedule('install');
}

install();