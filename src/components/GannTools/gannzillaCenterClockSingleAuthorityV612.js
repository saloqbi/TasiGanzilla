const BUILD = 612;
const STATE_KEY = '__gannzillaCenterClockSingleAuthorityV612';
const CLOCK_ID = 'gannzilla-center-digital-clock-v599';
const TRACKER_ID = 'gannzilla-tasi-time-tracker-v547';
const DISPLAY_ID = 'gannzilla-center-clock-display-v612';
const CONTENT_ID = 'gannzilla-center-clock-content-v612';
const DATE_ID = 'gannzilla-center-clock-date-v612';
const ANGLE_ID = 'gannzilla-center-clock-angle-v612';
const TIME_ID = 'gannzilla-center-clock-time-v612';
const DIVIDER_ID = 'gannzilla-center-clock-divider-v612';
const STYLE_ID = 'gannzilla-center-clock-style-v612';
const DIGITAL_FONT = 'Consolas, "Courier New", monospace';

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
  return wheelMode && logoEnabled && toggleEnabled;
}

function setImportant(element, property, value) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.style.getPropertyValue(property) === value
      && element.style.getPropertyPriority(property) === 'important') return false;
  element.style.setProperty(property, value, 'important');
  return true;
}

function removeLegacyClockPresentation() {
  [
    'gannzilla-center-clock-hour-minute-reduction-v601',
    'gannzilla-center-clock-date-reduction-v602',
    'gannzilla-center-clock-date-reduction-v603',
    'gannzilla-center-clock-date-angle-time-v604',
  ].forEach((id) => document.getElementById(id)?.remove());

  [
    'gannzilla-center-clock-hour-minute-reduction-style-v601',
    'gannzilla-center-clock-date-reduction-style-v602',
    'gannzilla-center-clock-date-reduction-style-v603',
    'gannzilla-center-clock-date-angle-time-style-v604',
    'gannzilla-center-clock-beige-theme-style-v605',
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
      background: #DDBD8A !important;
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
      clip-path: circle(50% at 50% 50%) !important;
      background: #DDBD8A !important;
      overflow: hidden !important;
      pointer-events: none !important;
      user-select: none !important;
      transform: translate3d(-50%, -50%, 0) !important;
      transform-origin: center center !important;
      transition: none !important;
      animation: none !important;
      box-shadow:
        inset 0 0 0 4px #3d2418,
        inset 0 0 0 7px #b77a3f,
        inset 0 0 0 9px #f5dfb7,
        inset 0 0 0 12px #704329,
        inset 0 0 16px rgba(68, 37, 23, 0.18) !important;
    }

    #${CONTENT_ID} {
      position: absolute !important;
      top: 5.5% !important;
      left: 8% !important;
      width: 84% !important;
      height: 40% !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      display: block !important;
      overflow: visible !important;
      pointer-events: none !important;
      direction: ltr !important;
      unicode-bidi: isolate !important;
      font-family: ${DIGITAL_FONT} !important;
      font-variant-numeric: tabular-nums lining-nums !important;
      font-feature-settings: "tnum" 1, "lnum" 1 !important;
    }

    #${DATE_ID}, #${ANGLE_ID}, #${TIME_ID} {
      position: absolute !important;
      left: 0 !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      display: block !important;
      color: #342116 !important;
      font-family: ${DIGITAL_FONT} !important;
      font-weight: 700 !important;
      font-variant-numeric: tabular-nums lining-nums !important;
      font-feature-settings: "tnum" 1, "lnum" 1 !important;
      line-height: 1 !important;
      letter-spacing: 0 !important;
      direction: ltr !important;
      unicode-bidi: isolate !important;
      text-align: center !important;
      white-space: nowrap !important;
      overflow: visible !important;
      transform: translate3d(0, -50%, 0) !important;
      transform-origin: center center !important;
      text-shadow: 0 1px 0 rgba(255,255,255,0.58), 0 1px 1px rgba(63,32,18,0.18) !important;
      transition: none !important;
      animation: none !important;
    }

    #${DATE_ID} { top: 28% !important; letter-spacing: 0.035em !important; }
    #${ANGLE_ID} { top: 59% !important; letter-spacing: 0.010em !important; }
    #${TIME_ID} { top: 88% !important; }

    #${DIVIDER_ID} {
      position: absolute !important;
      left: 6% !important;
      top: 50% !important;
      width: 88% !important;
      height: 1.5px !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      background: rgba(52, 33, 22, 0.76) !important;
      box-shadow: 0 1px 0 rgba(255,255,255,0.38) !important;
      transform: translateY(-50%) !important;
      pointer-events: none !important;
    }
  `;
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
    display.dataset.gannzillaCenterClockSingleAuthorityV612 = 'true';
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

function textWidth(text, fontSize) {
  if (!(measureCanvas instanceof HTMLCanvasElement)) measureCanvas = document.createElement('canvas');
  const context = measureCanvas.getContext('2d');
  if (!context) return 0;
  context.font = `700 ${fontSize}px ${DIGITAL_FONT}`;
  return context.measureText(text || '').width;
}

function fitLine(element, diameter, preferredRatio, availableRatio, minimum) {
  if (!(element instanceof HTMLElement) || !(diameter > 0)) return 0;
  const preferred = Math.max(minimum, diameter * preferredRatio);
  const available = Math.max(20, diameter * availableRatio);
  const measured = textWidth(element.textContent || '', preferred);
  const fitted = measured > available && measured > 0
    ? Math.max(minimum, preferred * (available / measured) * 0.97)
    : preferred;
  setImportant(element, 'font-size', `${fitted.toFixed(3)}px`);
  return fitted;
}

function attachObserver(clock) {
  if (typeof MutationObserver !== 'function' || !(clock instanceof HTMLDivElement)) return false;
  if (clock === observedClock && observer) return true;
  observer?.disconnect();
  observedClock = clock;
  observer = new MutationObserver(() => schedule('clock-style-change'));
  observer.observe(clock, { attributes: true, attributeFilter: ['style'] });
  return true;
}

function sync(source = 'sync') {
  frame = 0;
  if (!enabled()) return false;

  removeLegacyClockPresentation();
  ensureStyle();

  const clock = document.getElementById(CLOCK_ID);
  if (!(clock instanceof HTMLDivElement)) return false;

  const display = ensureDisplay(clock);
  const dateLine = document.getElementById(DATE_ID);
  const angleLine = document.getElementById(ANGLE_ID);
  const timeLine = document.getElementById(TIME_ID);
  if (!(display instanceof HTMLDivElement)
      || !(dateLine instanceof HTMLDivElement)
      || !(angleLine instanceof HTMLDivElement)
      || !(timeLine instanceof HTMLDivElement)) return false;

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

  const dateSize = fitLine(dateLine, diameter, 0.073, 0.78, 11);
  const angleSize = fitLine(angleLine, diameter, 0.088, 0.70, 14);
  const timeSize = fitLine(timeLine, diameter, 0.086, 0.84, 15);

  const visible = clockIsVisible(clock);
  setImportant(display, 'display', visible ? 'block' : 'none');
  setImportant(display, 'visibility', visible ? 'visible' : 'hidden');
  setImportant(display, 'opacity', visible ? '1' : '0');

  attachObserver(clock);
  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    diameter,
    dateSize,
    angleSize,
    timeSize,
    rowTopPercent: { date: 28, angle: 59, time: 88 },
    regularTabularDigits: true,
    singleStyleAuthority: true,
    clockLogicChanged: false,
    circleGeometryChanged: false,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule') {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => sync(source));
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  removeLegacyClockPresentation();
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

  timer = window.setInterval(() => schedule('clock-tick'), 250);

  window.GANNZILLA_CENTER_CLOCK_SINGLE_AUTHORITY_V612 = true;
  window.__auditGannzillaCenterClockSingleAuthorityV612 = () => ({
    ok: document.getElementById(DISPLAY_ID) instanceof HTMLDivElement
      && document.getElementById(DATE_ID) instanceof HTMLDivElement
      && document.getElementById(ANGLE_ID) instanceof HTMLDivElement
      && document.getElementById(TIME_ID) instanceof HTMLDivElement,
    build: BUILD,
    singleStyleAuthority: true,
    regularTabularDigits: true,
    dateLoweredClearly: true,
    digitsEnlarged: true,
    applyCount,
    lastApply,
    timerActive: Boolean(timer),
  });

  window[STATE_KEY] = { schedule, sync, digitalRoot, fitLine };
  schedule('install');
}

install();