const BUILD = 603;
const STATE_KEY = '__gannzillaCenterClockDateReductionV603';
const CLOCK_ID = 'gannzilla-center-digital-clock-v599';
const DISPLAY_ID = 'gannzilla-center-clock-date-reduction-v603';
const DATE_ID = 'gannzilla-center-clock-date-line-v603';
const TIME_ID = 'gannzilla-center-clock-time-line-v603';
const STYLE_ID = 'gannzilla-center-clock-date-reduction-style-v603';

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
  return wheelMode && logoEnabled && toggleEnabled && reductionEnabled && dateEnabled;
}

function removeLegacyDisplay() {
  [
    'gannzilla-center-clock-hour-minute-reduction-v601',
    'gannzilla-center-clock-date-reduction-v602',
  ].forEach((id) => document.getElementById(id)?.remove());

  [
    'gannzilla-center-clock-hour-minute-reduction-style-v601',
    'gannzilla-center-clock-date-reduction-style-v602',
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
      padding: 0 2.5% !important;
      box-sizing: border-box !important;
      border: 0 !important;
      border-radius: 50% !important;
      background: transparent !important;
      color: #f6d88a !important;
      font-family: "Courier New", Consolas, monospace !important;
      font-variant-numeric: tabular-nums !important;
      font-weight: 700 !important;
      direction: ltr !important;
      text-align: center !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      pointer-events: none !important;
      user-select: none !important;
      transform: translate3d(-50%, -50%, 0) !important;
      transform-origin: center center !important;
      transition: none !important;
      animation: none !important;
    }

    #${DATE_ID}, #${TIME_ID} {
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
      text-align: center !important;
      white-space: nowrap !important;
      overflow: visible !important;
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

function currentDisplay() {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const reduction = digitalRoot(hour + minute);
  return {
    dateText: `${pad(day)} - ${pad(month)} - ${year}`,
    timeText: `${pad(hour)}:${pad(minute)}:${pad(second)} = ${reduction}`,
    day,
    month,
    year,
    hour,
    minute,
    second,
    reduction,
  };
}

function ensureDisplay(clock) {
  const stage = clock?.parentElement;
  if (!(clock instanceof HTMLDivElement) || !(stage instanceof HTMLElement)) return null;

  let display = document.getElementById(DISPLAY_ID);
  if (!(display instanceof HTMLDivElement)) {
    display = document.createElement('div');
    display.id = DISPLAY_ID;
    display.dataset.gannzillaCenterClockDateReductionV603 = 'true';
    display.setAttribute('aria-hidden', 'true');

    const dateLine = document.createElement('div');
    dateLine.id = DATE_ID;

    const timeLine = document.createElement('div');
    timeLine.id = TIME_ID;

    display.append(dateLine, timeLine);
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
  const dateLine = document.getElementById(DATE_ID);
  const timeLine = document.getElementById(TIME_ID);
  if (!(display instanceof HTMLDivElement)
      || !(dateLine instanceof HTMLDivElement)
      || !(timeLine instanceof HTMLDivElement)) return false;

  ['left', 'top', 'width', 'height'].forEach((property) => {
    const value = clock.style.getPropertyValue(property);
    if (value) setImportant(display, property, value);
  });

  const current = currentDisplay();
  if (dateLine.textContent !== current.dateText) dateLine.textContent = current.dateText;
  if (timeLine.textContent !== current.timeText) timeLine.textContent = current.timeText;

  const diameter = Number.parseFloat(clock.style.getPropertyValue('width'))
    || clock.getBoundingClientRect().width
    || 0;

  let dateFit = { fontSize: 0, measuredWidth: 0, availableWidth: 0 };
  let timeFit = { fontSize: 0, measuredWidth: 0, availableWidth: 0 };
  if (diameter > 0) {
    setImportant(display, 'gap', `${Math.max(2, diameter * 0.018).toFixed(3)}px`);
    dateFit = fitLine(dateLine, diameter, 0.060, 0.82);
    timeFit = fitLine(timeLine, diameter, 0.086, 0.86);
  }

  const visible = clockIsVisible(clock);
  setImportant(display, 'display', visible ? 'flex' : 'none');
  setImportant(display, 'visibility', visible ? 'visible' : 'hidden');
  setImportant(display, 'opacity', visible ? '1' : '0');

  attachObserver(clock);
  applyCount += 1;
  lastApply = {
    source,
    visible,
    diameter,
    dateText: current.dateText,
    timeText: current.timeText,
    day: current.day,
    month: current.month,
    year: current.year,
    hour: current.hour,
    minute: current.minute,
    second: current.second,
    reduction: current.reduction,
    sum: current.hour + current.minute,
    dateFit,
    timeFit,
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

  window.GANNZILLA_CENTER_CLOCK_DATE_REDUCTION_V603 = true;
  window.__auditGannzillaCenterClockDateReductionV603 = () => {
    const clock = document.getElementById(CLOCK_ID);
    const display = document.getElementById(DISPLAY_ID);
    const dateLine = document.getElementById(DATE_ID);
    const timeLine = document.getElementById(TIME_ID);
    const clockRect = clock?.getBoundingClientRect();
    const displayRect = display?.getBoundingClientRect();
    const current = currentDisplay();
    return {
      ok: clock instanceof HTMLDivElement
        && display instanceof HTMLDivElement
        && dateLine instanceof HTMLDivElement
        && timeLine instanceof HTMLDivElement
        && display.parentElement === clock.parentElement
        && Math.abs(Number(clockRect?.width || 0) - Number(displayRect?.width || 0)) < 0.5
        && dateLine.textContent === current.dateText
        && timeLine.textContent === current.timeText,
      build: BUILD,
      formula: 'digitalRoot(hour + minute)',
      dateText: current.dateText,
      timeText: current.timeText,
      hour: current.hour,
      minute: current.minute,
      second: current.second,
      sum: current.hour + current.minute,
      reduction: current.reduction,
      applyCount,
      lastApply,
      timerActive: Boolean(timer),
    };
  };

  window[STATE_KEY] = { schedule, sync, digitalRoot, fitLine };
  schedule('install');
}

install();