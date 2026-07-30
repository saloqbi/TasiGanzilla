const BUILD = 629;
const STATE_KEY = '__gannzillaCenterClockLowerUnifiedLayoutV629';
const DISPLAY_ID = 'gannzilla-center-clock-display-v614';
const LOWER_TIME_ROW_ID = 'gannzilla-center-clock-lower-time-row-v624';
const LOWER_ANGLE_ROW_ID = 'gannzilla-center-clock-lower-angle-row-v624';
const SOURCE_DATE_ID = 'gannzilla-center-clock-lower-hijri-date-v624';
const LEGACY_NUMERIC_DATE_ID = 'gannzilla-center-clock-hijri-numeric-month-v627';
const LEGACY_COMPACT_DATE_ID = 'gannzilla-center-clock-hijri-compact-numeric-v628';
const GROUP_ID = 'gannzilla-center-clock-lower-group-v629';
const DATE_ROW_ID = 'gannzilla-center-clock-lower-date-row-v629';
const DATE_WEEKDAY_ID = 'gannzilla-center-clock-lower-date-weekday-v629';
const DATE_NUMERIC_ID = 'gannzilla-center-clock-lower-date-numeric-v629';
const STYLE_ID = 'gannzilla-center-clock-lower-unified-layout-style-v629';
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
      left: 8% !important;
      top: 54.5% !important;
      width: 84% !important;
      height: 34.5% !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      display: grid !important;
      grid-template-rows: max-content max-content max-content !important;
      align-content: space-between !important;
      justify-items: center !important;
      overflow: visible !important;
      pointer-events: none !important;
      user-select: none !important;
    }

    #${GROUP_ID} > #${LOWER_TIME_ROW_ID},
    #${GROUP_ID} > #${LOWER_ANGLE_ROW_ID} {
      position: relative !important;
      left: auto !important;
      top: auto !important;
      width: auto !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      transform: none !important;
      transform-origin: center center !important;
      align-self: center !important;
      justify-self: center !important;
    }

    #${DATE_ROW_ID} {
      position: relative !important;
      left: auto !important;
      top: auto !important;
      width: 100% !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      display: flex !important;
      flex-direction: row !important;
      align-items: baseline !important;
      justify-content: center !important;
      gap: 0.32em !important;
      color: #2b1a11 !important;
      font-family: ${ARABIC_FONT} !important;
      font-weight: 600 !important;
      font-variant-numeric: tabular-nums lining-nums !important;
      font-feature-settings: "tnum" 1, "lnum" 1 !important;
      line-height: 1 !important;
      letter-spacing: 0 !important;
      white-space: nowrap !important;
      direction: rtl !important;
      unicode-bidi: isolate !important;
      transform: none !important;
      text-shadow: 0 1px 0 rgba(255,255,255,0.62) !important;
      align-self: center !important;
      justify-self: stretch !important;
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

  let group = document.getElementById(GROUP_ID);
  if (!(group instanceof HTMLDivElement)) {
    group = document.createElement('div');
    group.id = GROUP_ID;
    group.dataset.gannzillaCenterClockLowerUnifiedLayoutV629 = 'true';
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

  return { group, dateRow };
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

  const sourceStyle = getComputedStyle(sourceDate);
  const dateFontSize = sourceStyle.fontSize || '12px';

  setImportant(sourceDate, 'opacity', '0');
  setImportant(sourceDate, 'text-shadow', 'none');
  setImportant(ensured.dateRow, 'display', 'flex');
  setImportant(ensured.dateRow, 'font-size', dateFontSize);

  // The unified group owns spacing. Reapply these after the legacy clock updater runs.
  setImportant(timeRow, 'position', 'relative');
  setImportant(timeRow, 'left', 'auto');
  setImportant(timeRow, 'top', 'auto');
  setImportant(timeRow, 'transform', 'none');
  setImportant(angleRow, 'position', 'relative');
  setImportant(angleRow, 'left', 'auto');
  setImportant(angleRow, 'top', 'auto');
  setImportant(angleRow, 'transform', 'none');

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    lowerHalfOnly: true,
    upperHalfChanged: false,
    unifiedGroup: true,
    independentTopPositionsRemoved: true,
    timeChanged: false,
    angleChanged: false,
    sizesChanged: false,
    contentLogicChanged: false,
    monthNameRemoved: true,
    separatorsAdded: false,
    datePartsSeparated: true,
    groupTop: getComputedStyle(ensured.group).top,
    groupHeight: getComputedStyle(ensured.group).height,
    dateFontSize: getComputedStyle(ensured.dateRow).fontSize,
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

  // Run after the V624 250 ms updater so the unified layout remains the final authority.
  timer = window.setInterval(() => schedule('unified-layout-sync'), 260);

  window.GANNZILLA_CENTER_CLOCK_LOWER_UNIFIED_LAYOUT_V629 = true;
  window.__auditGannzillaCenterClockLowerUnifiedLayoutV629 = () => {
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
        && getComputedStyle(timeRow).position === 'relative'
        && getComputedStyle(angleRow).position === 'relative'
        && !document.getElementById(LEGACY_NUMERIC_DATE_ID)
        && !document.getElementById(LEGACY_COMPACT_DATE_ID),
      build: BUILD,
      lowerHalfOnly: true,
      upperHalfChanged: false,
      unifiedGroup: true,
      independentTopPositionsRemoved: true,
      timeChanged: false,
      angleChanged: false,
      sizesChanged: false,
      timerActive: Boolean(timer),
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, compactHijriParts };
  schedule('install');
}

install();
