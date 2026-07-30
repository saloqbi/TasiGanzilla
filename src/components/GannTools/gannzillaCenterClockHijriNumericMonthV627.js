const BUILD = 627;
const STATE_KEY = '__gannzillaCenterClockHijriNumericMonthV627';
const DISPLAY_ID = 'gannzilla-center-clock-display-v614';
const SOURCE_DATE_ID = 'gannzilla-center-clock-lower-hijri-date-v624';
const NUMERIC_DATE_ID = 'gannzilla-center-clock-lower-hijri-numeric-date-v627';
const STYLE_ID = 'gannzilla-center-clock-lower-hijri-numeric-style-v627';
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

function formattedNumericDate(now, locale) {
  const formatter = new Intl.DateTimeFormat(locale, {
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
  if (!weekday || !day || !month || !year) return '';
  return `${weekday} ${Number(day)} - ${pad(month)} - ${year}`;
}

function hijriNumericDateText(now) {
  try {
    const hijri = formattedNumericDate(now, 'ar-SA-u-ca-islamic-umalqura-nu-latn');
    if (hijri) return hijri;
  } catch (_) {
    // Fall through to a stable numeric Arabic date when Umm al-Qura is unavailable.
  }

  try {
    return formattedNumericDate(now, 'ar-SA-u-nu-latn');
  } catch (_) {
    return '';
  }
}

function ensureStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    #${NUMERIC_DATE_ID} {
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

function ensureNumericDate(display) {
  if (!(display instanceof HTMLDivElement)) return null;
  let numericDate = document.getElementById(NUMERIC_DATE_ID);
  if (!(numericDate instanceof HTMLDivElement)) {
    numericDate = document.createElement('div');
    numericDate.id = NUMERIC_DATE_ID;
    numericDate.dataset.gannzillaHijriNumericMonthV627 = 'true';
    display.appendChild(numericDate);
  }
  if (numericDate.parentElement !== display) display.appendChild(numericDate);
  return numericDate;
}

function apply(source = 'apply') {
  frame = 0;
  ensureStyle();

  const display = document.getElementById(DISPLAY_ID);
  const sourceDate = document.getElementById(SOURCE_DATE_ID);
  if (!(display instanceof HTMLDivElement) || !(sourceDate instanceof HTMLDivElement)) return false;

  const numericDate = ensureNumericDate(display);
  if (!(numericDate instanceof HTMLDivElement)) return false;

  const text = hijriNumericDateText(new Date());
  if (text && numericDate.textContent !== text) numericDate.textContent = text;

  const sourceStyle = getComputedStyle(sourceDate);
  const targetTop = sourceDate.style.getPropertyValue('top') || '85%';
  const fontSize = sourceStyle.fontSize || '12px';

  setImportant(sourceDate, 'opacity', '0');
  setImportant(sourceDate, 'text-shadow', 'none');
  setImportant(numericDate, 'top', targetTop);
  setImportant(numericDate, 'font-size', fontSize);

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
    monthNameRemoved: true,
    monthNumeric: true,
    format: 'weekday DD - MM - YYYY',
    text,
    top: getComputedStyle(numericDate).top,
    fontSize: getComputedStyle(numericDate).fontSize,
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

  window.GANNZILLA_CENTER_CLOCK_HIJRI_NUMERIC_MONTH_V627 = true;
  window.__auditGannzillaCenterClockHijriNumericMonthV627 = () => {
    const sourceDate = document.getElementById(SOURCE_DATE_ID);
    const numericDate = document.getElementById(NUMERIC_DATE_ID);
    const text = numericDate?.textContent || '';
    return {
      ok: sourceDate instanceof HTMLDivElement
        && numericDate instanceof HTMLDivElement
        && sourceDate.style.getPropertyValue('opacity') === '0'
        && /^\S+\s+\d{1,2}\s+-\s+\d{2}\s+-\s+\d{4}$/.test(text),
      build: BUILD,
      lowerDateOnly: true,
      upperHalfChanged: false,
      timeChanged: false,
      angleChanged: false,
      positionsChanged: false,
      sizesChanged: false,
      monthNameRemoved: true,
      monthNumeric: true,
      text,
      timerActive: Boolean(timer),
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, hijriNumericDateText };
  schedule('install');
}

install();
