const BUILD = 628;
const STATE_KEY = '__gannzillaCenterClockHijriCompactNumericV628';
const DISPLAY_ID = 'gannzilla-center-clock-display-v614';
const SOURCE_DATE_ID = 'gannzilla-center-clock-lower-hijri-date-v624';
const LEGACY_NUMERIC_DATE_ID = 'gannzilla-center-clock-hijri-numeric-month-v627';
const COMPACT_DATE_ID = 'gannzilla-center-clock-hijri-compact-numeric-v628';
const STYLE_ID = 'gannzilla-center-clock-hijri-compact-numeric-style-v628';
const ARABIC_FONT = 'Tahoma, Arial, "Traditional Arabic", sans-serif';

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

function pad(value) {
  return String(value || '').padStart(2, '0');
}

function compactHijriDateText(now) {
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', {
      weekday: 'long',
      day: 'numeric',
      month: '2-digit',
      year: 'numeric',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    const parts = formatter.formatToParts(now);
    const get = (type) => parts.find((part) => part.type === type)?.value || '';
    const weekday = get('weekday').replace(/[،,]/g, '').trim();
    const day = get('day').replace(/\D/g, '').trim();
    const month = get('month').replace(/\D/g, '').trim();
    const year = get('year').replace(/\D/g, '').trim();
    if (weekday && day && month && year) {
      // Preserve the approved compact visual rhythm: only replace the month name with its number.
      return `${weekday} ${Number(day)} ${pad(month)} ${year}`;
    }
  } catch (_) {
    // Keep the original source date visible if Umm al-Qura formatting is unavailable.
  }
  return '';
}

function ensureStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    #${COMPACT_DATE_ID} {
      position: absolute !important;
      z-index: 83 !important;
      left: 8% !important;
      top: 85% !important;
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
      word-spacing: 0 !important;
      text-align: center !important;
      white-space: nowrap !important;
      direction: rtl !important;
      unicode-bidi: isolate !important;
      transform: translate3d(0, -50%, 0) !important;
      text-shadow: 0 1px 0 rgba(255,255,255,0.62) !important;
      pointer-events: none !important;
      user-select: none !important;
    }
  `;
}

function ensureCompactDate(display) {
  if (!(display instanceof HTMLDivElement)) return null;
  document.getElementById(LEGACY_NUMERIC_DATE_ID)?.remove();

  let compactDate = document.getElementById(COMPACT_DATE_ID);
  if (!(compactDate instanceof HTMLDivElement)) {
    compactDate = document.createElement('div');
    compactDate.id = COMPACT_DATE_ID;
    compactDate.dataset.gannzillaHijriCompactNumericV628 = 'true';
    display.appendChild(compactDate);
  }
  if (compactDate.parentElement !== display) display.appendChild(compactDate);
  return compactDate;
}

function apply(source = 'apply') {
  frame = 0;
  ensureStyle();

  const display = document.getElementById(DISPLAY_ID);
  const sourceDate = document.getElementById(SOURCE_DATE_ID);
  if (!(display instanceof HTMLDivElement) || !(sourceDate instanceof HTMLDivElement)) return false;

  const compactDate = ensureCompactDate(display);
  if (!(compactDate instanceof HTMLDivElement)) return false;

  const text = compactHijriDateText(new Date());
  if (!text) {
    setImportant(sourceDate, 'opacity', '1');
    setImportant(compactDate, 'display', 'none');
    return false;
  }

  if (compactDate.textContent !== text) compactDate.textContent = text;

  const sourceStyle = getComputedStyle(sourceDate);
  const targetTop = sourceDate.style.getPropertyValue('top') || '85%';
  const fontSize = sourceStyle.fontSize || '12px';

  setImportant(sourceDate, 'opacity', '0');
  setImportant(sourceDate, 'text-shadow', 'none');
  setImportant(compactDate, 'display', 'block');
  setImportant(compactDate, 'top', targetTop);
  setImportant(compactDate, 'font-size', fontSize);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    lowerDateOnly: true,
    upperHalfChanged: false,
    timeChanged: false,
    angleChanged: false,
    positionsChanged: false,
    sizesChanged: false,
    separatorsAdded: false,
    monthNameRemoved: true,
    monthNumeric: true,
    format: 'weekday DD MM YYYY',
    text,
    top: getComputedStyle(compactDate).top,
    fontSize: getComputedStyle(compactDate).fontSize,
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
  timer = window.setInterval(() => schedule('date-sync'), 500);

  window.GANNZILLA_CENTER_CLOCK_HIJRI_COMPACT_NUMERIC_V628 = true;
  window.__auditGannzillaCenterClockHijriCompactNumericV628 = () => ({
    ok: document.getElementById(COMPACT_DATE_ID) instanceof HTMLDivElement
      && !document.getElementById(LEGACY_NUMERIC_DATE_ID),
    build: BUILD,
    lowerDateOnly: true,
    upperHalfChanged: false,
    timeChanged: false,
    angleChanged: false,
    positionsChanged: false,
    sizesChanged: false,
    separatorsAdded: false,
    monthNameRemoved: true,
    monthNumeric: true,
    timerActive: Boolean(timer),
    applyCount,
    lastApply,
  });

  window[STATE_KEY] = { apply, schedule, compactHijriDateText };
  schedule('install');
}

install();
