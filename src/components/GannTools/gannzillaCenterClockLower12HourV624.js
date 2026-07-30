const BUILD = 624;
const STATE_KEY = '__gannzillaCenterClockLower12HourV624';
const DISPLAY_ID = 'gannzilla-center-clock-display-v614';
const TRACKER_ID = 'gannzilla-tasi-time-tracker-v547';
const LOWER_TIME_ROW_ID = 'gannzilla-center-clock-lower-time-row-v624';
const LOWER_TIME_VALUE_ID = 'gannzilla-center-clock-lower-time-value-v624';
const LOWER_TIME_ROOT_ID = 'gannzilla-center-clock-lower-time-root-v624';
const LOWER_ANGLE_ROW_ID = 'gannzilla-center-clock-lower-angle-row-v624';
const LOWER_ANGLE_VALUE_ID = 'gannzilla-center-clock-lower-angle-value-v624';
const LOWER_ANGLE_ROOT_ID = 'gannzilla-center-clock-lower-angle-root-v624';
const LOWER_HIJRI_DATE_ID = 'gannzilla-center-clock-lower-hijri-date-v624';
const STYLE_ID = 'gannzilla-center-clock-lower-12h-style-v624';
const LUXURY_FONT = 'Cambria, Georgia, "Times New Roman", serif';
const ARABIC_FONT = 'Tahoma, Arial, "Traditional Arabic", sans-serif';

let frame = 0;
let timer = 0;
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

function hijriDateText(now) {
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    const parts = formatter.formatToParts(now);
    const get = (type) => parts.find((part) => part.type === type)?.value || '';
    const weekday = get('weekday').replace(/[،,]/g, '').trim();
    const day = get('day').trim();
    const month = get('month').trim();
    const year = get('year').replace(/\s*هـ\.?\s*/g, '').trim();
    const result = [weekday, day, month, year].filter(Boolean).join(' ');
    if (result) return result;
  } catch (_) {
    // Fall through to a stable Arabic Gregorian fallback when Umm al-Qura is unavailable.
  }

  return new Intl.DateTimeFormat('ar-SA-u-nu-latn', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now).replace(/[،,]/g, '').replace(/\s*م\.?\s*$/g, '').trim();
}

function currentDisplay() {
  const now = new Date();
  const hour24 = now.getHours();
  const hour12 = hour24 % 12 || 12;
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const meridiem = hour24 < 12 ? 'ص' : 'م';
  const angle = currentAngleValue(minute);
  const hourReduction = digitalRoot(hour12);
  const minuteReduction = digitalRoot(minute);
  const timeReduction = digitalRoot(hourReduction + minuteReduction);
  const angleReduction = digitalRoot(angle);

  return {
    timeText: `${pad(hour12)}:${pad(minute)}:${pad(second)} ${meridiem}`,
    angleText: `${angle}°`,
    hijriDateText: hijriDateText(now),
    hour12,
    minute,
    angle,
    timeReduction,
    angleReduction,
    timeFormula: `${hourReduction} + ${minuteReduction} = ${timeReduction}`,
  };
}

function ensureStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    #${LOWER_TIME_ROW_ID}, #${LOWER_ANGLE_ROW_ID} {
      position: absolute !important;
      left: 50% !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      display: grid !important;
      grid-template-columns: max-content 0.78em 1.2ch !important;
      column-gap: 0.12em !important;
      align-items: baseline !important;
      justify-content: center !important;
      color: #24150d !important;
      font-family: ${LUXURY_FONT} !important;
      font-weight: 600 !important;
      font-variant-numeric: tabular-nums lining-nums !important;
      font-feature-settings: "tnum" 1, "lnum" 1 !important;
      line-height: 1 !important;
      white-space: nowrap !important;
      direction: ltr !important;
      transform: translate3d(-50%, -50%, 0) !important;
      transform-origin: center center !important;
      text-shadow: 0 1px 0 rgba(255,255,255,0.64), 0 1px 1px rgba(45,23,13,0.16) !important;
    }

    #${LOWER_TIME_ROW_ID} {
      top: 62.5% !important;
    }

    #${LOWER_ANGLE_ROW_ID} {
      top: 76.5% !important;
    }

    #${LOWER_TIME_VALUE_ID}, #${LOWER_ANGLE_VALUE_ID} {
      display: block !important;
      text-align: right !important;
      unicode-bidi: isolate !important;
    }

    #${LOWER_TIME_ROOT_ID}, #${LOWER_ANGLE_ROOT_ID} {
      display: block !important;
      text-align: left !important;
    }

    #${LOWER_HIJRI_DATE_ID} {
      position: absolute !important;
      left: 8% !important;
      top: 89% !important;
      width: 84% !important;
      margin: 0 !important;
      padding: 0 !important;
      color: #2b1a11 !important;
      font-family: ${ARABIC_FONT} !important;
      font-weight: 600 !important;
      font-variant-numeric: tabular-nums lining-nums !important;
      font-feature-settings: "tnum" 1, "lnum" 1 !important;
      line-height: 1 !important;
      letter-spacing: 0 !important;
      text-align: center !important;
      white-space: nowrap !important;
      direction: rtl !important;
      unicode-bidi: isolate !important;
      transform: translate3d(0, -50%, 0) !important;
      text-shadow: 0 1px 0 rgba(255,255,255,0.62) !important;
    }
  `;
}

function ensureLowerDisplay(display) {
  if (!(display instanceof HTMLDivElement)) return false;

  let timeRow = document.getElementById(LOWER_TIME_ROW_ID);
  if (!(timeRow instanceof HTMLDivElement)) {
    timeRow = document.createElement('div');
    timeRow.id = LOWER_TIME_ROW_ID;

    const value = document.createElement('span');
    value.id = LOWER_TIME_VALUE_ID;
    const equals = document.createElement('span');
    equals.textContent = '=';
    const root = document.createElement('span');
    root.id = LOWER_TIME_ROOT_ID;
    timeRow.append(value, equals, root);
    display.appendChild(timeRow);
  }

  let angleRow = document.getElementById(LOWER_ANGLE_ROW_ID);
  if (!(angleRow instanceof HTMLDivElement)) {
    angleRow = document.createElement('div');
    angleRow.id = LOWER_ANGLE_ROW_ID;

    const value = document.createElement('span');
    value.id = LOWER_ANGLE_VALUE_ID;
    const equals = document.createElement('span');
    equals.textContent = '=';
    const root = document.createElement('span');
    root.id = LOWER_ANGLE_ROOT_ID;
    angleRow.append(value, equals, root);
    display.appendChild(angleRow);
  }

  let hijriDate = document.getElementById(LOWER_HIJRI_DATE_ID);
  if (!(hijriDate instanceof HTMLDivElement)) {
    hijriDate = document.createElement('div');
    hijriDate.id = LOWER_HIJRI_DATE_ID;
    display.appendChild(hijriDate);
  }

  return true;
}

function apply(source = 'apply') {
  frame = 0;
  if (!enabled()) return false;

  ensureStyle();
  const display = document.getElementById(DISPLAY_ID);
  if (!(display instanceof HTMLDivElement) || !ensureLowerDisplay(display)) return false;

  const timeRow = document.getElementById(LOWER_TIME_ROW_ID);
  const timeValue = document.getElementById(LOWER_TIME_VALUE_ID);
  const timeRoot = document.getElementById(LOWER_TIME_ROOT_ID);
  const angleRow = document.getElementById(LOWER_ANGLE_ROW_ID);
  const angleValue = document.getElementById(LOWER_ANGLE_VALUE_ID);
  const angleRoot = document.getElementById(LOWER_ANGLE_ROOT_ID);
  const hijriDate = document.getElementById(LOWER_HIJRI_DATE_ID);

  if (!(timeRow instanceof HTMLDivElement)
      || !(timeValue instanceof HTMLSpanElement)
      || !(timeRoot instanceof HTMLSpanElement)
      || !(angleRow instanceof HTMLDivElement)
      || !(angleValue instanceof HTMLSpanElement)
      || !(angleRoot instanceof HTMLSpanElement)
      || !(hijriDate instanceof HTMLDivElement)) return false;

  const current = currentDisplay();
  if (timeValue.textContent !== current.timeText) timeValue.textContent = current.timeText;
  if (timeRoot.textContent !== String(current.timeReduction)) timeRoot.textContent = String(current.timeReduction);
  if (angleValue.textContent !== current.angleText) angleValue.textContent = current.angleText;
  if (angleRoot.textContent !== String(current.angleReduction)) angleRoot.textContent = String(current.angleReduction);
  if (hijriDate.textContent !== current.hijriDateText) hijriDate.textContent = current.hijriDateText;

  const diameter = display.getBoundingClientRect().width || 0;
  if (!(diameter > 0)) return false;

  const timeSize = clamp(diameter * 0.105, 17, 30);
  const angleSize = clamp(diameter * 0.095, 16, 28);
  const dateSize = clamp(diameter * 0.060, 10, 18);

  setImportant(timeRow, 'font-size', `${timeSize.toFixed(3)}px`);
  setImportant(angleRow, 'font-size', `${angleSize.toFixed(3)}px`);
  setImportant(hijriDate, 'font-size', `${dateSize.toFixed(3)}px`);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    diameter,
    lowerHalfOnly: true,
    upperHalfChanged: false,
    twelveHourClock: true,
    timeReductionExcludesSeconds: true,
    timeFormula: current.timeFormula,
    angle: current.angle,
    angleReduction: current.angleReduction,
    hijriCalendar: 'islamic-umalqura',
    positions: {
      timeTopPercent: 62.5,
      angleTopPercent: 76.5,
      hijriDateTopPercent: 89,
    },
    sizes: { timeSize, angleSize, dateSize },
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

  timer = window.setInterval(() => schedule('clock-tick'), 250);

  window.GANNZILLA_CENTER_CLOCK_LOWER_12H_V624 = true;
  window.__auditGannzillaCenterClockLower12HourV624 = () => ({
    ok: document.getElementById(LOWER_TIME_ROW_ID) instanceof HTMLDivElement
      && document.getElementById(LOWER_ANGLE_ROW_ID) instanceof HTMLDivElement
      && document.getElementById(LOWER_HIJRI_DATE_ID) instanceof HTMLDivElement,
    build: BUILD,
    lowerHalfOnly: true,
    upperHalfChanged: false,
    twelveHourClock: true,
    timeReductionExcludesSeconds: true,
    timerActive: Boolean(timer),
    applyCount,
    lastApply,
  });

  window[STATE_KEY] = { apply, schedule, digitalRoot, currentDisplay };
  schedule('install');
}

install();
