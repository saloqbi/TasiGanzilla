const BUILD = 626;
const STATE_KEY = '__gannzillaCenterClockLowerDateComfortV626';
const DISPLAY_ID = 'gannzilla-center-clock-display-v614';
const LOWER_TIME_ROW_ID = 'gannzilla-center-clock-lower-time-row-v624';
const LOWER_ANGLE_ROW_ID = 'gannzilla-center-clock-lower-angle-row-v624';
const LOWER_HIJRI_DATE_ID = 'gannzilla-center-clock-lower-hijri-date-v624';

// Approved correction:
// - raise lower 12-hour time by 1.5% from the V624 baseline
// - raise lower angle by 1.5% from the V624 baseline
// - use the released space to raise the Hijri date farther from the frame
const TIME_TOP = '61%';
const ANGLE_TOP = '75%';
const HIJRI_DATE_TOP = '85%';

let frame = 0;
let observer = null;
let observedDisplay = null;
let applyCount = 0;
let lastApply = null;

function setImportant(element, property, value) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.style.getPropertyValue(property) === value
      && element.style.getPropertyPriority(property) === 'important') return false;
  element.style.setProperty(property, value, 'important');
  return true;
}

function attachObserver(display) {
  if (typeof MutationObserver !== 'function' || !(display instanceof HTMLDivElement)) return false;
  if (observer && observedDisplay === display) return true;

  observer?.disconnect();
  observedDisplay = display;
  observer = new MutationObserver(() => schedule('display-mutation'));
  observer.observe(display, { childList: true, subtree: true });
  return true;
}

function apply(source = 'apply') {
  frame = 0;

  const display = document.getElementById(DISPLAY_ID);
  const timeRow = document.getElementById(LOWER_TIME_ROW_ID);
  const angleRow = document.getElementById(LOWER_ANGLE_ROW_ID);
  const hijriDate = document.getElementById(LOWER_HIJRI_DATE_ID);

  if (!(display instanceof HTMLDivElement)
      || !(timeRow instanceof HTMLDivElement)
      || !(angleRow instanceof HTMLDivElement)
      || !(hijriDate instanceof HTMLDivElement)) return false;

  attachObserver(display);

  const timeChanged = setImportant(timeRow, 'top', TIME_TOP);
  const angleChanged = setImportant(angleRow, 'top', ANGLE_TOP);
  const dateChanged = setImportant(hijriDate, 'top', HIJRI_DATE_TOP);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    lowerHalfOnly: true,
    upperHalfChanged: false,
    sizesChanged: false,
    contentChanged: false,
    timeTop: getComputedStyle(timeRow).top,
    angleTop: getComputedStyle(angleRow).top,
    hijriDateTop: getComputedStyle(hijriDate).top,
    timeRaisedByPercent: 1.5,
    angleRaisedByPercent: 1.5,
    hijriDateRaisedByPercent: 4,
    timeChanged,
    angleChanged,
    dateChanged,
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

  [
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:wheel-input-v459',
    'gannzilla:page-scrollbar-pan-v305',
  ].forEach((name) => window.addEventListener(name, () => schedule(name), false));
  window.addEventListener('resize', () => schedule('window-resize'), false);

  window.GANNZILLA_CENTER_CLOCK_LOWER_DATE_COMFORT_V626 = true;
  window.__auditGannzillaCenterClockLowerDateComfortV626 = () => {
    const timeRow = document.getElementById(LOWER_TIME_ROW_ID);
    const angleRow = document.getElementById(LOWER_ANGLE_ROW_ID);
    const hijriDate = document.getElementById(LOWER_HIJRI_DATE_ID);

    return {
      ok: timeRow instanceof HTMLDivElement
        && angleRow instanceof HTMLDivElement
        && hijriDate instanceof HTMLDivElement
        && timeRow.style.getPropertyValue('top') === TIME_TOP
        && angleRow.style.getPropertyValue('top') === ANGLE_TOP
        && hijriDate.style.getPropertyValue('top') === HIJRI_DATE_TOP,
      build: BUILD,
      lowerHalfOnly: true,
      upperHalfChanged: false,
      sizesChanged: false,
      contentChanged: false,
      targetPositions: {
        timeTop: TIME_TOP,
        angleTop: ANGLE_TOP,
        hijriDateTop: HIJRI_DATE_TOP,
      },
      movement: {
        timeRaisedByPercent: 1.5,
        angleRaisedByPercent: 1.5,
        hijriDateRaisedByPercent: 4,
      },
      observerActive: Boolean(observer),
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule };
  schedule('install');
}

install();
