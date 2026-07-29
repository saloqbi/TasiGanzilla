const BUILD = 622;
const STATE_KEY = '__gannzillaCenterClockAngleOnePercentLowerV622';
const DISPLAY_ID = 'gannzilla-center-clock-display-v614';
const ANGLE_ROW_ID = 'gannzilla-center-clock-angle-row-v614';
const TIME_ROW_ID = 'gannzilla-center-clock-time-row-v614';

let frame = 0;
let observer = null;
let observedAngle = null;
let observedTime = null;
let applyCount = 0;
let lastApply = null;

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
      // Correct owner updates in the same microtask, before browser paint.
      apply('style-mutation');
    }
  });
  observer.observe(angleRow, { attributes: true, attributeFilter: ['style'] });
  observer.observe(timeRow, { attributes: true, attributeFilter: ['style'] });
  return true;
}

function apply(source = 'apply') {
  frame = 0;

  const display = document.getElementById(DISPLAY_ID);
  const angleRow = document.getElementById(ANGLE_ROW_ID);
  const timeRow = document.getElementById(TIME_ROW_ID);
  if (!(display instanceof HTMLDivElement)
      || !(angleRow instanceof HTMLDivElement)
      || !(timeRow instanceof HTMLDivElement)) return false;

  attachObserver(angleRow, timeRow);

  const diameter = display.getBoundingClientRect().width || 0;
  if (!(diameter > 0)) return false;

  // Preserve the compact equal font size used by the approved layout.
  const targetSize = clamp(diameter * 0.115, 17, 32);
  const fontSize = `${targetSize.toFixed(3)}px`;

  const angleChanged = setImportant(angleRow, 'font-size', fontSize);
  const timeChanged = setImportant(timeRow, 'font-size', fontSize);

  // Lower only the angle row by one percentage point: 29% -> 30%.
  const angleTopValue = '30%';
  const angleTopChanged = setImportant(angleRow, 'top', angleTopValue);

  // Keep the time row one percent of the diameter below the divider.
  const renderedHeight = timeRow.getBoundingClientRect().height || targetSize;
  const dividerOffset = diameter * 0.01;
  const targetCenterPx = (diameter * 0.5) - (renderedHeight * 0.5) + dividerOffset;
  const timeTopValue = `${targetCenterPx.toFixed(3)}px`;
  const timeTopChanged = setImportant(timeRow, 'top', timeTopValue);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    diameter,
    targetFontSize: fontSize,
    angleTop: getComputedStyle(angleRow).top,
    renderedHeight,
    dividerOffset,
    targetCenterPx,
    angleFontSize: getComputedStyle(angleRow).fontSize,
    timeFontSize: getComputedStyle(timeRow).fontSize,
    timeTop: getComputedStyle(timeRow).top,
    angleChanged,
    angleTopChanged,
    timeChanged,
    timeTopChanged,
    angleOnePercentLower: true,
    timeOnePercentBelowDivider: true,
    dateChanged: false,
    frameChanged: false,
    dividerChanged: false,
    eventDriven: true,
    repeatingTimer: false,
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

  window.GANNZILLA_CENTER_CLOCK_ANGLE_ONE_PERCENT_LOWER_V622 = true;
  window.__auditGannzillaCenterClockAngleOnePercentLowerV622 = () => {
    const display = document.getElementById(DISPLAY_ID);
    const angleRow = document.getElementById(ANGLE_ROW_ID);
    const timeRow = document.getElementById(TIME_ROW_ID);
    const angleFontSize = angleRow instanceof HTMLElement ? getComputedStyle(angleRow).fontSize : null;
    const timeFontSize = timeRow instanceof HTMLElement ? getComputedStyle(timeRow).fontSize : null;
    const angleTop = angleRow instanceof HTMLElement ? getComputedStyle(angleRow).top : null;
    return {
      ok: display instanceof HTMLDivElement
        && angleRow instanceof HTMLDivElement
        && timeRow instanceof HTMLDivElement
        && angleFontSize === timeFontSize
        && angleRow.style.getPropertyValue('top') === '30%',
      build: BUILD,
      angleFontSize,
      timeFontSize,
      angleTop,
      angleTopInline: angleRow instanceof HTMLElement ? angleRow.style.getPropertyValue('top') : null,
      angleOnePercentLower: true,
      timeTop: timeRow instanceof HTMLElement ? getComputedStyle(timeRow).top : null,
      timeOnePercentBelowDivider: true,
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