const BUILD = 630;
const STATE_KEY = '__gannzillaCenterClockLowerFixedLayoutV630';
const DISPLAY_ID = 'gannzilla-center-clock-display-v614';
const LOWER_TIME_ROW_ID = 'gannzilla-center-clock-lower-time-row-v624';
const LOWER_ANGLE_ROW_ID = 'gannzilla-center-clock-lower-angle-row-v624';
const SOURCE_DATE_ID = 'gannzilla-center-clock-lower-hijri-date-v624';
const LEGACY_NUMERIC_DATE_ID = 'gannzilla-center-clock-hijri-numeric-month-v627';
const LEGACY_COMPACT_DATE_ID = 'gannzilla-center-clock-hijri-compact-numeric-v628';
const LEGACY_GROUP_ID = 'gannzilla-center-clock-lower-group-v629';
const LEGACY_DATE_ROW_ID = 'gannzilla-center-clock-lower-date-row-v629';
const LEGACY_STYLE_ID = 'gannzilla-center-clock-lower-unified-layout-style-v629';
const GROUP_ID = 'gannzilla-center-clock-lower-fixed-group-v630';
const DATE_ROW_ID = 'gannzilla-center-clock-lower-fixed-date-row-v630';
const DATE_WEEKDAY_ID = 'gannzilla-center-clock-lower-fixed-date-weekday-v630';
const DATE_NUMERIC_ID = 'gannzilla-center-clock-lower-fixed-date-numeric-v630';
const STYLE_ID = 'gannzilla-center-clock-lower-fixed-layout-style-v630';
const ARABIC_FONT = 'Tahoma, Arial, "Traditional Arabic", sans-serif';

const TIME_TOP = '61%';
const ANGLE_TOP = '74.5%';
const DATE_TOP = '83.5%';

let frame = 0;
let dateTimer = 0;
let observer = null;
let observedTimeRow = null;
let observedAngleRow = null;
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

function pad(value) {
  return String(value || '').padStart(2, '0');
}

function compactHijriParts(now) {
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
      return {
        weekday,
        numeric: `${Number(day)} ${pad(month)} ${year}`,
      };
    }
  } catch (_) {
    // Keep the original source date visible if Umm al-Qura formatting is unavailable.
  }
  return null;
}

function ensureStyle() {
  document.getElementById(LEGACY_STYLE_ID)?.remove();

  let style = document.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    #${GROUP_ID} {
      position: absolute !important;
      z-index: 83 !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      overflow: visible !important;
      pointer-events: none !important;
      user-select: none !important;
    }

    #${GROUP_ID} > #${LOWER_TIME_ROW_ID},
    #${GROUP_ID} > #${LOWER_ANGLE_ROW_ID} {
      position: absolute !important;
      left: 50% !important;
      width: auto !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      transform: translate3d(-50%, -50%, 0) !important;
      transform-origin: center center !important;
    }

    #${DATE_ROW_ID} {
      position: absolute !important;
      left: 8% !important;
      top: ${DATE_TOP} !important;
      width: 84% !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      display: flex !important;
      flex-direction: row !important;
      align-items: baseline !important;
      justify-content: center !important;
      gap: 0.28em !important;
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

    #${DATE_WEEKDAY_ID} {
      direction: rtl !important;
      unicode-bidi: isolate !important;
    }

    #${DATE_NUMERIC_ID} {
      direction: ltr !important;
      unicode-bidi: isolate !important;
    }
  `;
}

function ensureGroup(display, timeRow, angleRow) {
  if (!(display instanceof HTMLDivElement)
      || !(timeRow instanceof HTMLDivElement)
      || !(angleRow instanceof HTMLDivElement)) return null;

  document.getElementById(LEGACY_NUMERIC_DATE_ID)?.remove();
  document.getElementById(LEGACY_COMPACT_DATE_ID)?.remove();
  document.getElementById(LEGACY_DATE_ROW_ID)?.remove();

  let group = document.getElementById(GROUP_ID);
  if (!(group instanceof HTMLDivElement)) {
    group = document.createElement('div');
    group.id = GROUP_ID;
    group.dataset.gannzillaCenterClockLowerFixedLayoutV630 = 'true';
    display.appendChild(group);
  }

  let dateRow = document.getElementById(DATE_ROW_ID);
  if (!(dateRow instanceof HTMLDivElement)) {
    dateRow = document.createElement('div');
    dateRow.id = DATE_ROW_ID;

    const weekday = document.createElement('span');
    weekday.id = DATE_WEEKDAY_ID;

    const numeric = document.createElement('span');
    numeric.id = DATE_NUMERIC_ID;

    dateRow.append(weekday, numeric);
  }

  if (timeRow.parentElement !== group) group.appendChild(timeRow);
  if (angleRow.parentElement !== group) group.appendChild(angleRow);
  if (dateRow.parentElement !== group) group.appendChild(dateRow);
  if (group.parentElement !== display) display.appendChild(group);

  const legacyGroup = document.getElementById(LEGACY_GROUP_ID);
  if (legacyGroup instanceof HTMLDivElement && legacyGroup !== group) legacyGroup.remove();

  return { group, dateRow };
}

function attachObserver(timeRow, angleRow) {
  if (typeof MutationObserver !== 'function'
      || !(timeRow instanceof HTMLDivElement)
      || !(angleRow instanceof HTMLDivElement)) return false;

  if (observer && observedTimeRow === timeRow && observedAngleRow === angleRow) return true;

  observer?.disconnect();
  observedTimeRow = timeRow;
  observedAngleRow = angleRow;
  observer = new MutationObserver((records) => {
    if (records.some((record) => record.attributeName === 'style')) schedule('legacy-style-correction');
  });
  observer.observe(timeRow, { attributes: true, attributeFilter: ['style'] });
  observer.observe(angleRow, { attributes: true, attributeFilter: ['style'] });
  return true;
}

function apply(source = 'apply') {
  frame = 0;
  ensureStyle();

  const display = document.getElementById(DISPLAY_ID);
  const timeRow = document.getElementById(LOWER_TIME_ROW_ID);
  const angleRow = document.getElementById(LOWER_ANGLE_ROW_ID);
  const sourceDate = document.getElementById(SOURCE_DATE_ID);

  if (!(display instanceof HTMLDivElement)
      || !(timeRow instanceof HTMLDivElement)
      || !(angleRow instanceof HTMLDivElement)
      || !(sourceDate instanceof HTMLDivElement)) return false;

  const ensured = ensureGroup(display, timeRow, angleRow);
  if (!ensured) return false;

  attachObserver(timeRow, angleRow);

  const weekday = document.getElementById(DATE_WEEKDAY_ID);
  const numeric = document.getElementById(DATE_NUMERIC_ID);
  if (!(weekday instanceof HTMLSpanElement) || !(numeric instanceof HTMLSpanElement)) return false;

  const parts = compactHijriParts(new Date());
  if (!parts) {
    setImportant(sourceDate, 'opacity', '1');
    setImportant(ensured.dateRow, 'display', 'none');
    return false;
  }

  if (weekday.textContent !== parts.weekday) weekday.textContent = parts.weekday;
  if (numeric.textContent !== parts.numeric) numeric.textContent = parts.numeric;

  const diameter = display.getBoundingClientRect().width || 0;
  if (!(diameter > 0)) return false;
  const dateFontSize = clamp(diameter * 0.066, 11, 18);

  setImportant(sourceDate, 'opacity', '0');
  setImportant(sourceDate, 'text-shadow', 'none');

  setImportant(timeRow, 'position', 'absolute');
  setImportant(timeRow, 'left', '50%');
  setImportant(timeRow, 'top', TIME_TOP);
  setImportant(timeRow, 'transform', 'translate3d(-50%, -50%, 0)');

  setImportant(angleRow, 'position', 'absolute');
  setImportant(angleRow, 'left', '50%');
  setImportant(angleRow, 'top', ANGLE_TOP);
  setImportant(angleRow, 'transform', 'translate3d(-50%, -50%, 0)');

  setImportant(ensured.dateRow, 'display', 'flex');
  setImportant(ensured.dateRow, 'top', DATE_TOP);
  setImportant(ensured.dateRow, 'font-size', `${dateFontSize.toFixed(3)}px`);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    lowerHalfOnly: true,
    upperHalfChanged: false,
    unifiedGroup: true,
    fixedPositions: true,
    spaceBetweenRemoved: true,
    timeTop: getComputedStyle(timeRow).top,
    angleTop: getComputedStyle(angleRow).top,
    dateTop: getComputedStyle(ensured.dateRow).top,
    timeChanged: false,
    angleChanged: false,
    timeSizeChanged: false,
    angleSizeChanged: false,
    dateSizeComfortRaised: true,
    dateFontSize: getComputedStyle(ensured.dateRow).fontSize,
    datePartsSeparated: true,
    dateText: `${parts.weekday} ${parts.numeric}`,
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

  dateTimer = window.setInterval(() => schedule('date-sync'), 60000);

  window.GANNZILLA_CENTER_CLOCK_LOWER_FIXED_LAYOUT_V630 = true;
  window.__auditGannzillaCenterClockLowerFixedLayoutV630 = () => {
    const group = document.getElementById(GROUP_ID);
    const timeRow = document.getElementById(LOWER_TIME_ROW_ID);
    const angleRow = document.getElementById(LOWER_ANGLE_ROW_ID);
    const dateRow = document.getElementById(DATE_ROW_ID);
    return {
      ok: group instanceof HTMLDivElement
        && timeRow instanceof HTMLDivElement
        && angleRow instanceof HTMLDivElement
        && dateRow instanceof HTMLDivElement
        && timeRow.parentElement === group
        && angleRow.parentElement === group
        && dateRow.parentElement === group
        && timeRow.style.getPropertyValue('top') === TIME_TOP
        && angleRow.style.getPropertyValue('top') === ANGLE_TOP
        && dateRow.style.getPropertyValue('top') === DATE_TOP
        && !document.getElementById(LEGACY_GROUP_ID)
        && !document.getElementById(LEGACY_NUMERIC_DATE_ID)
        && !document.getElementById(LEGACY_COMPACT_DATE_ID),
      build: BUILD,
      lowerHalfOnly: true,
      upperHalfChanged: false,
      unifiedGroup: true,
      fixedPositions: true,
      spaceBetweenRemoved: true,
      targetPositions: {
        timeTop: TIME_TOP,
        angleTop: ANGLE_TOP,
        dateTop: DATE_TOP,
      },
      timeSizeChanged: false,
      angleSizeChanged: false,
      dateSizeComfortRaised: true,
      observerActive: Boolean(observer),
      dateTimerActive: Boolean(dateTimer),
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, compactHijriParts };
  schedule('install');
}

install();
