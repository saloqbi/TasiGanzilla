const BUILD = 617;
const STATE_KEY = '__gannzillaCenterClockAngleStableSizeV617';
const ANGLE_ROW_ID = 'gannzilla-center-clock-angle-row-v614';
const TIME_ROW_ID = 'gannzilla-center-clock-time-row-v614';

let frame = 0;
let observer = null;
let observedAngle = null;
let observedTime = null;
let applyCount = 0;
let lastApply = null;

function setImportant(element, property, value) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.style.getPropertyValue(property) === value
      && element.style.getPropertyPriority(property) === 'important') return false;
  element.style.setProperty(property, value, 'important');
  return true;
}

function attachObserver(angleRow, timeRow) {
  if (typeof MutationObserver !== 'function'
      || !(angleRow instanceof HTMLDivElement)
      || !(timeRow instanceof HTMLDivElement)) return false;

  if (observer && observedAngle === angleRow && observedTime === timeRow) return true;

  observer?.disconnect();
  observedAngle = angleRow;
  observedTime = timeRow;
  observer = new MutationObserver((records) => {
    if (records.some((record) => record.attributeName === 'style')) {
      // Run in the mutation microtask, before the browser paints the next frame.
      apply('style-mutation');
    }
  });
  observer.observe(angleRow, { attributes: true, attributeFilter: ['style'] });
  observer.observe(timeRow, { attributes: true, attributeFilter: ['style'] });
  return true;
}

function apply(source = 'apply') {
  frame = 0;

  const angleRow = document.getElementById(ANGLE_ROW_ID);
  const timeRow = document.getElementById(TIME_ROW_ID);
  if (!(angleRow instanceof HTMLDivElement) || !(timeRow instanceof HTMLDivElement)) return false;

  attachObserver(angleRow, timeRow);

  const timeFontSize = getComputedStyle(timeRow).fontSize;
  if (!timeFontSize) return false;

  const changed = setImportant(angleRow, 'font-size', timeFontSize);
  const angleFontSize = getComputedStyle(angleRow).fontSize;

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    changed,
    angleFontSize,
    timeFontSize,
    equal: angleFontSize === timeFontSize,
    eventDriven: true,
    repeatingTimer: false,
    otherLayoutChanged: false,
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

  window.GANNZILLA_CENTER_CLOCK_ANGLE_STABLE_SIZE_V617 = true;
  window.__auditGannzillaCenterClockAngleStableSizeV617 = () => {
    const angleRow = document.getElementById(ANGLE_ROW_ID);
    const timeRow = document.getElementById(TIME_ROW_ID);
    const angleFontSize = angleRow instanceof HTMLElement ? getComputedStyle(angleRow).fontSize : null;
    const timeFontSize = timeRow instanceof HTMLElement ? getComputedStyle(timeRow).fontSize : null;
    return {
      ok: angleRow instanceof HTMLDivElement
        && timeRow instanceof HTMLDivElement
        && angleFontSize === timeFontSize,
      build: BUILD,
      angleFontSize,
      timeFontSize,
      eventDriven: true,
      repeatingTimer: false,
      observerActive: Boolean(observer),
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule };
  schedule('install');
}

install();