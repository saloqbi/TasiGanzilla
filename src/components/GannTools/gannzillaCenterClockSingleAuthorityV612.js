const BUILD = 614;
const STATE_KEY = '__gannzillaCenterClockApprovedUpperHalfV614';
const CLOCK_ID = 'gannzilla-center-digital-clock-v599';
const TRACKER_ID = 'gannzilla-tasi-time-tracker-v547';
const DISPLAY_ID = 'gannzilla-center-clock-display-v614';
const DATE_ID = 'gannzilla-center-clock-date-v614';
const DATE_RULE_ID = 'gannzilla-center-clock-date-rule-v614';
const ANGLE_ROW_ID = 'gannzilla-center-clock-angle-row-v614';
const ANGLE_VALUE_ID = 'gannzilla-center-clock-angle-value-v614';
const ANGLE_ROOT_ID = 'gannzilla-center-clock-angle-root-v614';
const TIME_ROW_ID = 'gannzilla-center-clock-time-row-v614';
const TIME_VALUE_ID = 'gannzilla-center-clock-time-value-v614';
const TIME_ROOT_ID = 'gannzilla-center-clock-time-root-v614';
const DIVIDER_ID = 'gannzilla-center-clock-divider-v614';
const STYLE_ID = 'gannzilla-center-clock-style-v614';
const LUXURY_FONT = 'Cambria, Georgia, "Times New Roman", serif';

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
  return wheelMode && logoEnabled && toggleEnabled;
}

function setImportant(element, property, value) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.style.getPropertyValue(property) === value
      && element.style.getPropertyPriority(property) === 'important') return false;
  element.style.setProperty(property, value, 'important');
  return true;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function removeLegacyPresentation() {
  [
    'gannzilla-center-clock-hour-minute-reduction-v601',
    'gannzilla-center-clock-date-reduction-v602',
    'gannzilla-center-clock-date-reduction-v603',
    'gannzilla-center-clock-date-angle-time-v604',
    'gannzilla-center-clock-display-v612',
    'gannzilla-center-clock-display-v613',
  ].forEach((id) => document.getElementById(id)?.remove());

  [
    'gannzilla-center-clock-hour-minute-reduction-style-v601',
    'gannzilla-center-clock-date-reduction-style-v602',
    'gannzilla-center-clock-date-reduction-style-v603',
    'gannzilla-center-clock-date-angle-time-style-v604',
    'gannzilla-center-clock-beige-theme-style-v605',
    'gannzilla-center-clock-style-v612',
    'gannzilla-center-clock-style-v613',
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
      background: #ddb982 !important;
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
      background:
        radial-gradient(circle at 50% 12%, rgba(255, 244, 213, 0.48), transparent 37%),
        linear-gradient(180deg, #e8c992 0%, #dfbd84 52%, #d8b178 100%) !important;
      overflow: hidden !important;
      pointer-events: none !important;
      user-select: none !important;
      transform: translate3d(-50%, -50%, 0) !important;
      transform-origin: center center !important;
      transition: none !important;
      animation: none !important;
      box-shadow:
        inset 0 0 0 2px #382015,
        inset 0 0 0 5px #8b512b,
        inset 0 0 0 8px #c9954f,
        inset 0 0 0 10px #f1d49b,
        inset 0 0 0 13px #70401f,
        inset 0 0 18px rgba(55, 29, 16, 0.24) !important;
    }

    #${DATE_ID} {
      position: absolute !important;
      left: 9% !important;
      top: 10.5% !important;
      width: 82% !important;
      margin: 0 !important;
      padding: 0 !important;
      color: #2b1a11 !important;
      font-family: ${LUXURY_FONT} !important;
      font-weight: 600 !important;
      font-variant-numeric: tabular-nums lining-nums !important;
      font-feature-settings: "tnum" 1, "lnum" 1 !important;
      line-height: 1 !important;
      letter-spacing: 0.045em !important;
      text-align: center !important;
      white-space: nowrap !important;
      transform: translate3d(0, -50%, 0) !important;
      text-shadow: 0 1px 0 rgba(255,255,255,0.62) !important;
    }

    #${DATE_RULE_ID} {
      position: absolute !important;
      left: 26% !important;
      top: 19% !important;
      width: 48% !important;
      height: 1px !important;
      margin: 0 !important;
      padding: 0 !important;
      background: linear-gradient(90deg, transparent, #9b6a34 18%, #9b6a34 82%, transparent) !important;
      box-shadow: 0 1px 0 rgba(255,255,255,0.36) !important;
    }

    #${DATE_RULE_ID}::after {
      content: "◆" !important;
      position: absolute !important;
      left: 50% !important;
      top: 50% !important;
      color: #96642f !important;
      font-size: 8px !important;
      line-height: 1 !important;
      transform: translate(-50%, -50%) rotate(45deg) !important;
      text-shadow: 0 1px 0 rgba(255,255,255,0.46) !important;
    }

    #${ANGLE_ROW_ID}, #${TIME_ROW_ID} {
      position: absolute !important;
      left: 50% !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      display: grid !important;
      align-items: baseline !important;
      justify-content: center !important;
      color: #24150d !important;
      font-family: ${LUXURY_FONT} !important;
      font-weight: 600 !important;
      font-variant-numeric: tabular-nums lining-nums !important;
      font-feature-settings: "tnum" 1, "lnum" 1 !important;
      line-height: 1 !important;
      white-space: nowrap !important;
      transform: translate3d(-50%, -50%, 0) !important;
      transform-origin: center center !important;
      text-shadow: 0 1px 0 rgba(255,255,255,0.64), 0 1px 1px rgba(45,23,13,0.16) !important;
    }

    #${ANGLE_ROW_ID} {
      top: 29% !important;
      grid-template-columns: 5.2ch 0.78em 1.2ch !important;
      column-gap: 0.12em !important;
    }

    #${TIME_ROW_ID} {
      top: 41.5% !important;
      grid-template-columns: 8.7ch 0.78em 1.2ch !important;
      column-gap: 0.12em !important;
    }

    #${ANGLE_VALUE_ID}, #${TIME_VALUE_ID} {
      display: block !important;
      text-align: right !important;
      overflow: visible !important;
    }

    #${ANGLE_ROOT_ID}, #${TIME_ROOT_ID} {
      display: block !important;
      text-align: left !important;
    }

    #${DIVIDER_ID} {
      position: absolute !important;
      left: 8% !important;
      top: 50% !important;
      width: 84% !important;
      height: 1.4px !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      background: linear-gradient(90deg, transparent, #754722 5%, #754722 95%, transparent) !important;
      box-shadow: 0 1px 0 rgba(255,255,255,0.42) !important;
      transform: translateY(-50%) !important;
      pointer-events: none !important;
    }

    #${DIVIDER_ID}::after {
      content: "◇" !important;
      position: absolute !important;
      left: 50% !important;
      top: 50% !important;
      color: #754722 !important;
      font-size: 10px !important;
      line-height: 1 !important;
      transform: translate(-50%, -50%) !important;
      background: #ddb982 !important;
      padding: 0 4px !important;
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
    angleText: `${angle}°`,
    timeText: `${pad(hour)}:${pad(minute)}:${pad(second)}`,
    angleReduction,
    timeReduction,
    hourReduction,
    minuteReduction,
    angle,
  };
}

function ensureDisplay(clock) {
  const stage = clock?.parentElement;
  if (!(clock instanceof HTMLDivElement) || !(stage instanceof HTMLElement)) return null;

  let display = document.getElementById(DISPLAY_ID);
  if (!(display instanceof HTMLDivElement)) {
    display = document.createElement('div');
    display.id = DISPLAY_ID;
    display.dataset.gannzillaCenterClockApprovedUpperHalfV614 = 'true';
    display.setAttribute('aria-hidden', 'true');

    const date = document.createElement('div');
    date.id = DATE_ID;

    const dateRule = document.createElement('div');
    dateRule.id = DATE_RULE_ID;

    const angleRow = document.createElement('div');
    angleRow.id = ANGLE_ROW_ID;
    const angleValue = document.createElement('span');
    angleValue.id = ANGLE_VALUE_ID;
    const angleEquals = document.createElement('span');
    angleEquals.textContent = '=';
    const angleRoot = document.createElement('span');
    angleRoot.id = ANGLE_ROOT_ID;
    angleRow.append(angleValue, angleEquals, angleRoot);

    const timeRow = document.createElement('div');
    timeRow.id = TIME_ROW_ID;
    const timeValue = document.createElement('span');
    timeValue.id = TIME_VALUE_ID;
    const timeEquals = document.createElement('span');
    timeEquals.textContent = '=';
    const timeRoot = document.createElement('span');
    timeRoot.id = TIME_ROOT_ID;
    timeRow.append(timeValue, timeEquals, timeRoot);

    const divider = document.createElement('div');
    divider.id = DIVIDER_ID;

    display.append(date, dateRule, angleRow, timeRow, divider);
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

  removeLegacyPresentation();
  ensureStyle();

  const clock = document.getElementById(CLOCK_ID);
  if (!(clock instanceof HTMLDivElement)) return false;

  const display = ensureDisplay(clock);
  const date = document.getElementById(DATE_ID);
  const angleRow = document.getElementById(ANGLE_ROW_ID);
  const angleValue = document.getElementById(ANGLE_VALUE_ID);
  const angleRoot = document.getElementById(ANGLE_ROOT_ID);
  const timeRow = document.getElementById(TIME_ROW_ID);
  const timeValue = document.getElementById(TIME_VALUE_ID);
  const timeRoot = document.getElementById(TIME_ROOT_ID);

  if (!(display instanceof HTMLDivElement)
      || !(date instanceof HTMLDivElement)
      || !(angleRow instanceof HTMLDivElement)
      || !(angleValue instanceof HTMLSpanElement)
      || !(angleRoot instanceof HTMLSpanElement)
      || !(timeRow instanceof HTMLDivElement)
      || !(timeValue instanceof HTMLSpanElement)
      || !(timeRoot instanceof HTMLSpanElement)) return false;

  ['left', 'top', 'width', 'height'].forEach((property) => {
    const value = clock.style.getPropertyValue(property);
    if (value) setImportant(display, property, value);
  });

  const current = currentDisplay();
  if (date.textContent !== current.dateText) date.textContent = current.dateText;
  if (angleValue.textContent !== current.angleText) angleValue.textContent = current.angleText;
  if (angleRoot.textContent !== String(current.angleReduction)) angleRoot.textContent = String(current.angleReduction);
  if (timeValue.textContent !== current.timeText) timeValue.textContent = current.timeText;
  if (timeRoot.textContent !== String(current.timeReduction)) timeRoot.textContent = String(current.timeReduction);

  const diameter = Number.parseFloat(clock.style.getPropertyValue('width'))
    || clock.getBoundingClientRect().width
    || 0;

  const dateSize = clamp(diameter * 0.085, 12, 22);
  const angleSize = clamp(diameter * 0.145, 22, 40);
  const timeSize = clamp(diameter * 0.130, 20, 36);

  setImportant(date, 'font-size', `${dateSize.toFixed(3)}px`);
  setImportant(angleRow, 'font-size', `${angleSize.toFixed(3)}px`);
  setImportant(timeRow, 'font-size', `${timeSize.toFixed(3)}px`);

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
    upperHalfOnly: true,
    lowerHalfEmpty: true,
    fixedColumns: true,
    autoShrinkDisabled: true,
    angle: current.angle,
    angleReduction: current.angleReduction,
    timeFormula: `${current.hourReduction} + ${current.minuteReduction} = ${current.timeReduction}`,
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

  removeLegacyPresentation();
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

  window.GANNZILLA_CENTER_CLOCK_APPROVED_UPPER_HALF_V614 = true;
  window.__auditGannzillaCenterClockApprovedUpperHalfV614 = () => ({
    ok: document.getElementById(DISPLAY_ID) instanceof HTMLDivElement
      && document.getElementById(DATE_ID) instanceof HTMLDivElement
      && document.getElementById(ANGLE_ROW_ID) instanceof HTMLDivElement
      && document.getElementById(TIME_ROW_ID) instanceof HTMLDivElement,
    build: BUILD,
    upperHalfOnly: true,
    lowerHalfEmpty: true,
    fixedColumns: true,
    autoShrinkDisabled: true,
    timerActive: Boolean(timer),
    applyCount,
    lastApply,
  });

  window[STATE_KEY] = { schedule, sync, digitalRoot };
  schedule('install');
}

install();