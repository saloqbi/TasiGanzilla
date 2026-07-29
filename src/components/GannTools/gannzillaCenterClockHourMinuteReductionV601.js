const BUILD = 601;
const STATE_KEY = '__gannzillaCenterClockHourMinuteReductionV601';
const CLOCK_ID = 'gannzilla-center-digital-clock-v599';
const DISPLAY_ID = 'gannzilla-center-clock-hour-minute-reduction-v601';
const STYLE_ID = 'gannzilla-center-clock-hour-minute-reduction-style-v601';

let frame = 0;
let timer = 0;
let observer = null;
let observedClock = null;
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
  return wheelMode && logoEnabled && toggleEnabled && reductionEnabled;
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
      padding: 0 4% !important;
      box-sizing: border-box !important;
      border: 0 !important;
      border-radius: 50% !important;
      background: transparent !important;
      color: #f6d88a !important;
      font-family: "Courier New", Consolas, monospace !important;
      font-variant-numeric: tabular-nums !important;
      font-weight: 700 !important;
      line-height: 1 !important;
      letter-spacing: 0 !important;
      direction: ltr !important;
      text-align: center !important;
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
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const reduction = digitalRoot(hour + minute);
  return {
    text: `${pad(hour)}:${pad(minute)}:${pad(second)} = ${reduction}`,
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
    display.dataset.gannzillaCenterClockHourMinuteReductionV601 = 'true';
    display.setAttribute('aria-hidden', 'true');
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

function sync(source = 'sync') {
  frame = 0;
  if (!enabled()) return false;

  ensureStyle();
  const clock = document.getElementById(CLOCK_ID);
  if (!(clock instanceof HTMLDivElement)) return false;

  const display = ensureDisplay(clock);
  if (!(display instanceof HTMLDivElement)) return false;

  ['left', 'top', 'width', 'height'].forEach((property) => {
    const value = clock.style.getPropertyValue(property);
    if (value) setImportant(display, property, value);
  });

  const diameter = Number.parseFloat(clock.style.getPropertyValue('width'))
    || clock.getBoundingClientRect().width
    || 0;
  if (diameter > 0) {
    setImportant(display, 'font-size', `${Math.max(20, diameter * 0.115).toFixed(3)}px`);
  }

  const visible = clockIsVisible(clock);
  setImportant(display, 'display', visible ? 'flex' : 'none');
  setImportant(display, 'visibility', visible ? 'visible' : 'hidden');
  setImportant(display, 'opacity', visible ? '1' : '0');

  const current = currentDisplay();
  if (display.textContent !== current.text) display.textContent = current.text;

  attachObserver(clock);
  applyCount += 1;
  lastApply = {
    source,
    visible,
    diameter,
    text: current.text,
    hour: current.hour,
    minute: current.minute,
    second: current.second,
    reduction: current.reduction,
    sum: current.hour + current.minute,
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

  window.GANNZILLA_CENTER_CLOCK_HOUR_MINUTE_REDUCTION_V601 = true;
  window.__auditGannzillaCenterClockHourMinuteReductionV601 = () => {
    const clock = document.getElementById(CLOCK_ID);
    const display = document.getElementById(DISPLAY_ID);
    const clockRect = clock?.getBoundingClientRect();
    const displayRect = display?.getBoundingClientRect();
    const current = currentDisplay();
    return {
      ok: clock instanceof HTMLDivElement
        && display instanceof HTMLDivElement
        && display.parentElement === clock.parentElement
        && Math.abs(Number(clockRect?.width || 0) - Number(displayRect?.width || 0)) < 0.5
        && display.textContent === current.text,
      build: BUILD,
      formula: 'digitalRoot(hour + minute)',
      hour: current.hour,
      minute: current.minute,
      second: current.second,
      sum: current.hour + current.minute,
      reduction: current.reduction,
      text: current.text,
      applyCount,
      lastApply,
      timerActive: Boolean(timer),
    };
  };

  window[STATE_KEY] = { schedule, sync, digitalRoot };
  schedule('install');
}

install();
