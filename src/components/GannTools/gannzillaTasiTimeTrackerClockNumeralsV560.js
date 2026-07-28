const BUILD = 560;
const STATE_KEY = '__gannzillaTasiTimeTrackerClockNumeralsV560';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-clock-numerals-v560';
const NUMERAL_CLASS = 'tasi-clock-numeral-v560';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function boolParam(name, fallback = false) {
  const query = params();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function enabled() {
  const query = params();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  return wheelMode
    && boolParam('timeTracker', false)
    && boolParam('timeTrackerClockDisplay', true)
    && boolParam('timeTrackerClockNumerals', true);
}

function cssText() {
  return `
    .clock-face {
      position: relative !important;
      isolation: isolate !important;
      overflow: hidden !important;
    }

    .clock-face .tasi-clock-number-v558 {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
    }

    .clock-face .${NUMERAL_CLASS} {
      position: absolute !important;
      z-index: 4 !important;
      display: grid !important;
      place-items: center !important;
      width: 30px !important;
      height: 26px !important;
      margin: 0 !important;
      padding: 0 !important;
      color: #11100f !important;
      font-family: Arial, Helvetica, sans-serif !important;
      font-size: 21px !important;
      font-weight: 900 !important;
      font-variant-numeric: tabular-nums lining-nums !important;
      font-feature-settings: "tnum" 1, "lnum" 1 !important;
      line-height: 1 !important;
      letter-spacing: -0.5px !important;
      text-align: center !important;
      white-space: nowrap !important;
      pointer-events: none !important;
      user-select: none !important;
      transform: translate(-50%, -50%) !important;
      text-shadow:
        0 1px 0 rgba(255,255,255,.86),
        0 1px 2px rgba(0,0,0,.22) !important;
    }

    .clock-face .${NUMERAL_CLASS}[data-number="12"] {
      width: 38px !important;
      font-size: 23px !important;
      letter-spacing: -1px !important;
    }

    .clock-face .hand {
      z-index: 8 !important;
    }

    .clock-face .clock-pin {
      z-index: 10 !important;
    }

    @media (max-width: 1180px) {
      .clock-face .${NUMERAL_CLASS} {
        width: 26px !important;
        height: 23px !important;
        font-size: 18px !important;
      }

      .clock-face .${NUMERAL_CLASS}[data-number="12"] {
        width: 34px !important;
        font-size: 20px !important;
      }
    }
  `;
}

function ensureNumerals(clock) {
  if (!(clock instanceof HTMLElement)) return [];
  let numerals = Array.from(clock.querySelectorAll(`.${NUMERAL_CLASS}`));
  if (numerals.length !== 12) {
    numerals.forEach((element) => element.remove());
    const fragment = document.createDocumentFragment();
    for (let number = 1; number <= 12; number += 1) {
      const numeral = document.createElement('span');
      numeral.className = NUMERAL_CLASS;
      numeral.dataset.number = String(number);
      numeral.textContent = String(number);
      numeral.setAttribute('aria-hidden', 'true');
      fragment.appendChild(numeral);
    }
    clock.appendChild(fragment);
    numerals = Array.from(clock.querySelectorAll(`.${NUMERAL_CLASS}`));
  }
  return numerals;
}

function positionNumerals(clock, numerals) {
  if (!(clock instanceof HTMLElement) || numerals.length !== 12) return false;
  const rect = clock.getBoundingClientRect();
  const diameter = Math.min(rect.width, rect.height);
  if (!Number.isFinite(diameter) || diameter < 80) return false;

  const center = diameter / 2;
  const radius = diameter * 0.355;
  numerals.forEach((numeral, index) => {
    const number = index + 1;
    const angle = ((number * 30) - 90) * (Math.PI / 180);
    const left = center + Math.cos(angle) * radius;
    const top = center + Math.sin(angle) * radius;
    numeral.style.setProperty('left', `${left}px`, 'important');
    numeral.style.setProperty('top', `${top}px`, 'important');
  });
  return true;
}

let applyCount = 0;
let lastApply = null;
let timer = 0;
let observer = null;

function apply(source = 'apply') {
  if (!enabled()) return false;
  const host = document.getElementById(HOST_ID);
  const shadow = host?.shadowRoot;
  const clock = shadow?.querySelector('.clock-face');
  if (!(host instanceof HTMLElement)
      || !(shadow instanceof ShadowRoot)
      || !(clock instanceof HTMLElement)) return false;

  let style = shadow.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = cssText();
    shadow.appendChild(style);
  }

  const numerals = ensureNumerals(clock);
  const positioned = positionNumerals(clock, numerals);

  host.dataset.gannzillaTasiTimeTrackerClockNumeralsV560 = 'true';
  host.dataset.gannzillaTasiTimeTrackerClockNumeralCountV560 = String(numerals.length);
  host.dataset.gannzillaTasiTimeTrackerClockNumeralsClearV560 = String(positioned);
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV560 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    numeralCount: numerals.length,
    positioned,
    fullOneToTwelve: numerals.map((element) => element.textContent).join(',') === '1,2,3,4,5,6,7,8,9,10,11,12',
    canvasChanged: false,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => requestAnimationFrame(() => apply(source)), delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  observer = new MutationObserver(() => schedule('dom-mutation', 20));
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', () => schedule('resize', 0), false);

  [0, 80, 220, 600, 1400, 3200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });

  window.GANNZILLA_TASI_TIME_TRACKER_CLOCK_NUMERALS_V560 = true;
  window.__auditGannzillaTasiTimeTrackerClockNumeralsV560 = () => {
    const host = document.getElementById(HOST_ID);
    const shadow = host?.shadowRoot;
    const numerals = shadow instanceof ShadowRoot
      ? Array.from(shadow.querySelectorAll(`.${NUMERAL_CLASS}`))
      : [];
    return {
      ok: host instanceof HTMLElement
        && shadow instanceof ShadowRoot
        && host.dataset.gannzillaTasiTimeTrackerClockNumeralsV560 === 'true'
        && shadow.getElementById(STYLE_ID) instanceof HTMLStyleElement
        && numerals.length === 12,
      build: BUILD,
      applyCount,
      numeralCount: numerals.length,
      numerals: numerals.map((element) => element.textContent),
      clear: host?.dataset?.gannzillaTasiTimeTrackerClockNumeralsClearV560 === 'true',
      canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV560 === 'true',
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, observer };
  schedule('install', 0);
}

install();
