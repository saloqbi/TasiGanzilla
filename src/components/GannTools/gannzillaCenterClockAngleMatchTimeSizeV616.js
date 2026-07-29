const BUILD = 616;
const STATE_KEY = '__gannzillaCenterClockAngleMatchTimeSizeV616';
const ANGLE_ROW_ID = 'gannzilla-center-clock-angle-row-v614';
const TIME_ROW_ID = 'gannzilla-center-clock-time-row-v614';

let frame = 0;
let timer = 0;
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

  const angleRow = document.getElementById(ANGLE_ROW_ID);
  const timeRow = document.getElementById(TIME_ROW_ID);
  if (!(angleRow instanceof HTMLDivElement) || !(timeRow instanceof HTMLDivElement)) return false;

  const timeFontSize = getComputedStyle(timeRow).fontSize;
  if (!timeFontSize) return false;

  setImportant(angleRow, 'font-size', timeFontSize);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    angleFontSize: getComputedStyle(angleRow).fontSize,
    timeFontSize,
    equal: getComputedStyle(angleRow).fontSize === timeFontSize,
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

  window.addEventListener('resize', () => schedule('window-resize'), false);
  timer = window.setInterval(() => apply('persistent-size-match'), 120);

  window.GANNZILLA_CENTER_CLOCK_ANGLE_MATCH_TIME_SIZE_V616 = true;
  window.__auditGannzillaCenterClockAngleMatchTimeSizeV616 = () => {
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
      timerActive: Boolean(timer),
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, timer };
  schedule('install');
}

install();
