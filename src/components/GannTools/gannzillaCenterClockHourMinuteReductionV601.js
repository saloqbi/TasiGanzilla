const BUILD = 604;
const STATE_KEY = '__gannzillaCenterClockDateAngleTimeV604';
const CLOCK_ID = 'gannzilla-center-digital-clock-v599';
const TRACKER_ID = 'gannzilla-tasi-time-tracker-v547';
const DISPLAY_ID = 'gannzilla-center-clock-date-angle-time-v604';
const CONTENT_ID = 'gannzilla-center-clock-upper-content-v604';
const DATE_ID = 'gannzilla-center-clock-date-line-v604';
const ANGLE_ID = 'gannzilla-center-clock-angle-line-v604';
const TIME_ID = 'gannzilla-center-clock-time-line-v604';
const DIVIDER_ID = 'gannzilla-center-clock-divider-v604';
const STYLE_ID = 'gannzilla-center-clock-date-angle-time-style-v604';

let frame = 0;
let timer = 0;
let observer = null;
let observedClock = null;
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
  const reductionEnabled = !['false', '0', 'off', 'no'].includes(
    String(query.get('centerClockHourMinuteReduction') || 'true').toLowerCase(),
  );
  const dateEnabled = !['false', '0', 'off', 'no'].includes(
    String(query.get('centerClockDate') || 'true').toLowerCase(),
  );
  const angleEnabled = !['false', '0', 'off', 'no'].includes(
    String(query.get('centerClockAngle') || 'true').toLowerCase(),
  );
  return wheelMode
    && logoEnabled
    && toggleEnabled
    && reductionEnabled
    && dateEnabled
    && angleEnabled;
}

function removeLegacyDisplay() {
  [
    'gannzilla-center-clock-hour-minute-reduction-v601',
    'gannzilla-center-clock-date-reduction-v602',
    'gannzilla-center-clock-date-reduction-v603',
  ].forEach((id) => document.getElementById(id)?.remove());

  [
    'gannzilla-center-clock-hour-minute-reduction-style-v601',
    'gannzilla-center-clock-date-reduction-style-v602',
    'gannzilla-center-clock-date-reduction-style-v603',
  ].forEach((id) => document.getElementById(id)?.remove());
}

function ensureStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    #${CLOCK_ID} {
      color: transparent !important;
      text-shadow: none !important;
    }

    #${DISPLAY_ID} {
      position: absolute !important;
      z-index: 81 !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      border: 0 !important;
      border-radius: 50% !important;
      background: transparent !important;
      overflow: hidden !important;
      pointer-events: none !important;
      user-select: none !important;
      transform: translate3d(-50%, -50%, 0) !important;
      transform-origin: center center !important;
      transition: none !important;
      animation: none !important;
    }

    #${CONTENT_ID} {
      position: absolute !important;
      top: 5% !important;
      left: 8% !important;
      width: 84% !important;
      height: 41% !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      color: #f6d88a !important;
      font-family: "Courier New", Consolas, monospace !important;
      font-variant-numeric: tabular-nums !important;
      font-weight: 700 !important;
      direction: ltr !important;
      text-align: center !important;
      white-space: nowrap !important;
      overflow: visible !important;
      pointer-events: none !important;
    }

    #${DATE_ID}, #${ANGLE_ID}, #${TIME_ID} {
      display: block !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      color: #f6d88a !important;
      font-family: inherit !important;
      font-variant-numeric: tabular-nums !important;
      font-weight: 700 !important;
      line-height: 1 !important;
      letter-spacing: 0 !important;
      direction: ltr !important;
      text-align: center !important;
      white-space: nowrap !important;
      overflow: visible !important;
    }

    #${DIVIDER_ID} {
      position: absolute !important;
      left: 5% !important;
      top: 50% !important;
      width: 90% !important;
      height: 1px !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      background: rgba(246, 216, 138, 0.92) !important;
      box-shadow: 0 0 3px rgba(246, 216, 138, 0.28) !important;
      transform: translateY(-50%) !important;
      pointer-events: none !important;
    }
  `;
}

function setImportant(element, property, value) {
  if (!(element instanceof HTMLElement)) return;
  if (element.style.getPropertyValue(property) === value
      && element.style.getPropertyPriority(property) === 'important') return;
  element.style.setProperty(property, value, 'important');
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function digitalRoot(value) {
  const integer = Math.abs(Math.trunc(Number(value) || 0));
  return integer === 0 ? 0 : 1 + ((integer - 1) % 9);
}

function currentAngleValue(minute) {
  const tracker = document.getElementById(TRACKER_ID);
  const authorityValue = Number(tracker?.dataset?.gannzillaTimeTrackerCurrentAngleV547);
  if (Number.isFinite(authorityValue) && authorityValue >= 0 && authorityValue < 360) {
    return Math.round(authorityValue);
  }
  return Math.round(minute * 6);
}

function currentDisplay() {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const angle = currentAngleValue(minute);

  const hourReduction = digitalRoot(hour);
  const minuteReduction = digitalRoot(minute);
  const timeReduction = digitalRoot(hourReduction + minuteReduction);
  const angleReduction = digitalRoot(angle);

  return {
    dateText: `${pad(day)} - ${pad(month)} - ${year}`,
    angleText: `${angle}° = ${angleReduction}`,
    timeText: `${pad(hour)}:${pad(minute)}:${pad(second)} = ${timeReduction}`,
    day,
    month,
    year,
    hour,
    minute,
    second,
    angle,
    hourReduction,
    minuteReduction,
    timeReduction,
    angleReduction,
  };
}

function ensureDisplay(clock) {
  const stage = clock?.parentElement;
  if (!(clock instanceof HTMLDivElement) || !(stage instanceof HTMLElement)) return null;

  let display = document.getElementById(DISPLAY_ID);
  if (!(display instanceof HTMLDivElement)) {
    display = document.createElement('div');
    display.id = DISPLAY_ID;
    display.dataset.gannzillaCenterClockDateAngleTimeV604 = 'true';
    display.setAttribute('aria-hidden', 'true');

    const content = document.createElement('div');
    content.id = CONTENT_ID;

    const dateLine = document.createElement('div');
    dateLine.id = DATE_ID;

    const angleLine = document.createElement('div');
    angleLine.id = ANGLE_ID;

    const timeLine = document.createElement('div');
    timeLine.id = TIME_ID;

    const divider = document.createElement('div');
    divider.id = DIVIDER_ID;

    content.append(dateLine, angleLine, timeLine);
    display.append(content, divider);
  }

  if (display.parentElement !== stage) stage.appendChild(display);
  return display;
}

function clockIsVisible(clock) {
  if (!(clock instanceof HTMLElement)) return false;
  const style = getComputedStyle(clock);
  return style.display !== 'none'
    && style.visibility !== 'hidden'
    && Number(style.opacity || 0) > 0;
}

function textWidth(element, fontSize) {
  if (!(element instanceof HTMLElement)) return 0;
  if (!(measureCanvas instanceof HTMLCanvasElement)) measureCanvas = document.createElement('canvas');
  const context = measureCanvas.getContext('2d');
  if (!context) return 0;

  const computed = getComputedStyle(element);
  context.font = `${computed.fontWeight || '700'} ${fontSize}px ${computed.fontFamily || 'monospace'}`;
  return context.measureText(element.textContent || '').width;
}

function fitLine(element, diameter, preferredRatio, availableRatio) {
  if (!(element instanceof HTMLElement) || !(diameter > 0)) {
    return { fontSize: 0, measuredWidth: 0, availableWidth: 0 };
  }

  const preferredSize = Math.max(7, diameter * preferredRatio);
  const availableWidth = Math.max(20, diameter * availableRatio);
  let fontSize = preferredSize;
  let measuredWidth = textWidth(element, fontSize);

  if (measuredWidth > availableWidth && measuredWidth > 0) {
    fontSize = Math.max(7, fontSize * (availableWidth / measuredWidth) * 0.97);
    measuredWidth = textWidth(element, fontSize);
  }

  setImportant(element, 'font-size', `${fontSize.toFixed(3)}px`);
  return { fontSize, measuredWidth, availableWidth };
}

function sync(source = 'sync') {
  frame = 0;
  if (!enabled()) return false;

  removeLegacyDisplay();
  ensureStyle();
  const clock = document.getElementById(CLOCK_ID);
  if (!(clock instanceof HTMLDivElement)) return false;

  const display = ensureDisplay(clock);
  const content = document.getElementById(CONTENT_ID);
  const dateLine = document.getElementById(DATE_ID);
  const angleLine = document.getElementById(ANGLE_ID);
  const timeLine = document.getElementById(TIME_ID);
  const divider = document.getElementById(DIVIDER_ID);
  if (!(display instanceof HTMLDivElement)
      || !(content instanceof HTMLDivElement)
      || !(dateLine instanceof HTMLDivElement)
      || !(angleLine instanceof HTMLDivElement)
      || !(timeLine instanceof HTMLDivElement)
      || !(divider instanceof HTMLDivElement)) return false;

  ['left', 'top', 'width', 'height'].forEach((property) => {
    const value = clock.style.getPropertyValue(property);
    if (value) setImportant(display, property, value);
  });

  const current = currentDisplay();
  if (dateLine.textContent !== current.dateText) dateLine.textContent = current.dateText;
  if (angleLine.textContent !== current.angleText) angleLine.textContent = current.angleText;
  if (timeLine.textContent !== current.timeText) timeLine.textContent = current.timeText;

  const diameter = Number.parseFloat(clock.style.getPropertyValue('width'))
    || clock.getBoundingClientRect().width
    || 0;

  let dateFit = { fontSize: 0, measuredWidth: 0, availableWidth: 0 };
  let angleFit = { fontSize: 0, measuredWidth: 0, availableWidth: 0 };
  let timeFit = { fontSize: 0, measuredWidth: 0, availableWidth: 0 };
  if (diameter > 0) {
    setImportant(content, 'gap', `${Math.max(2, diameter * 0.010).toFixed(3)}px`);
    dateFit = fitLine(dateLine, diameter, 0.050, 0.76);
    angleFit = fitLine(angleLine, diameter, 0.070, 0.68);
    timeFit = fitLine(timeLine, diameter, 0.073, 0.82);
  }

  const visible = clockIsVisible(clock);
  setImportant(display, 'display', visible ? 'block' : 'none');
  setImportant(display, 'visibility', visible ? 'visible' : 'hidden');
  setImportant(display, 'opacity', visible ? '1' : '0');

  attachObserver(clock);
  applyCount += 1;
  lastApply = {
    source,
    visible,
    diameter,
    dateText: current.dateText,
    angleText: current.angleText,
    timeText: current.timeText,
    angle: current.angle,
    angleReduction: current.angleReduction,
    hourReduction: current.hourReduction,
    minuteReduction: current.minuteReduction,
    timeReduction: current.timeReduction,
    timeFormula: `${current.hourReduction} + ${current.minuteReduction} = ${current.timeReduction}`,
    dateFit,
    angleFit,
    timeFit,
    lowerHalfEmpty: true,
    dividerAtPercent: 50,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule') {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => sync(source));
}

function attachObserver(clock) {
  if (typeof MutationObserver !== 'function' || !(clock instanceof HTMLDivElement)) return false;
  if (clock === observedClock && observer) return true;

  observer?.disconnect();
  observedClock = clock;
  observer = new MutationObserver((records) => {
    if (records.some((record) => record.attributeName === 'style')) schedule('clock-style-change');
  });
  observer.observe(clock, { attributes: true, attributeFilter: ['style'] });
  return true;
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  removeLegacyDisplay();
  ensureStyle();

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

  timer = window.setInterval(() => schedule('clock-tick'), 200);

  window.GANNZILLA_CENTER_CLOCK_DATE_ANGLE_TIME_V604 = true;
  window.__auditGannzillaCenterClockDateAngleTimeV604 = () => {
    const clock = document.getElementById(CLOCK_ID);
    const display = document.getElementById(DISPLAY_ID);
    const dateLine = document.getElementById(DATE_ID);
    const angleLine = document.getElementById(ANGLE_ID);
    const timeLine = document.getElementById(TIME_ID);
    const divider = document.getElementById(DIVIDER_ID);
    const clockRect = clock?.getBoundingClientRect();
    const displayRect = display?.getBoundingClientRect();
    const current = currentDisplay();
    return {
      ok: clock instanceof HTMLDivElement
        && display instanceof HTMLDivElement
        && dateLine instanceof HTMLDivElement
        && angleLine instanceof HTMLDivElement
        && timeLine instanceof HTMLDivElement
        && divider instanceof HTMLDivElement
        && display.parentElement === clock.parentElement
        && Math.abs(Number(clockRect?.width || 0) - Number(displayRect?.width || 0)) < 0.5
        && dateLine.textContent === current.dateText
        && angleLine.textContent === current.angleText
        && timeLine.textContent === current.timeText,
      build: BUILD,
      angleAuthority: 'gannzillaTimeTrackerCurrentAngleV547',
      angleFormula: 'digitalRoot(angle)',
      timeFormula: 'digitalRoot(digitalRoot(hour) + digitalRoot(minute))',
      hourReduction: current.hourReduction,
      minuteReduction: current.minuteReduction,
      timeReduction: current.timeReduction,
      angle: current.angle,
      angleReduction: current.angleReduction,
      dateText: current.dateText,
      angleText: current.angleText,
      timeText: current.timeText,
      lowerHalfEmpty: true,
      dividerAtPercent: 50,
      applyCount,
      lastApply,
      timerActive: Boolean(timer),
    };
  };

  window[STATE_KEY] = { schedule, sync, digitalRoot, fitLine };
  schedule('install');
}

install();