const BUILD = 568;
const STATE_KEY = '__gannzillaTasiTimeTrackerResponsiveFitV568';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-responsive-fit-v568';
const ROW_CLASS = 'tasi-digital-root-row-v564';
const RESULT_CLASS = 'tasi-digital-root-result-v564';

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
    && boolParam('timeTrackerDigitalRootVisible', true)
    && boolParam('timeTrackerResponsiveFit', true);
}

function cssText() {
  return `
    .current-time {
      container-type: inline-size !important;
      display: grid !important;
      grid-template-rows: auto auto !important;
      place-content: center !important;
      justify-items: center !important;
      box-sizing: border-box !important;
      min-width: 0 !important;
      padding-left: 22px !important;
      padding-right: 22px !important;
      overflow: hidden !important;
    }

    .current-time > .${ROW_CLASS} {
      display: grid !important;
      grid-template-columns: max-content max-content !important;
      align-items: center !important;
      justify-content: center !important;
      box-sizing: border-box !important;
      width: calc(100% - 4px) !important;
      min-width: 0 !important;
      max-width: calc(100% - 4px) !important;
      gap: clamp(6px, 2.2cqi, 11px) !important;
      margin: 0 auto !important;
      padding: 0 !important;
      transform: none !important;
      overflow: visible !important;
    }

    .current-time > .${ROW_CLASS} > .time-value {
      display: block !important;
      width: auto !important;
      min-width: 0 !important;
      max-width: none !important;
      flex: none !important;
      margin: 0 !important;
      padding: 0 !important;
      font-family: "Courier New", Consolas, monospace !important;
      font-size: clamp(28px, 11.5cqi, 52px) !important;
      font-weight: 900 !important;
      font-variant-numeric: tabular-nums lining-nums !important;
      font-feature-settings: "tnum" 1, "lnum" 1 !important;
      letter-spacing: 0 !important;
      line-height: 1 !important;
      direction: ltr !important;
      unicode-bidi: isolate !important;
      text-align: center !important;
      white-space: nowrap !important;
      transform: none !important;
      transition: none !important;
      animation: none !important;
    }

    .current-time > .${ROW_CLASS} > .${RESULT_CLASS} {
      display: block !important;
      width: auto !important;
      min-width: 0 !important;
      max-width: none !important;
      flex: none !important;
      margin: 0 !important;
      padding: 0 !important;
      color: #241208 !important;
      font-family: "Courier New", Consolas, monospace !important;
      font-size: clamp(28px, 11.5cqi, 52px) !important;
      font-weight: 900 !important;
      font-variant-numeric: tabular-nums lining-nums !important;
      font-feature-settings: "tnum" 1, "lnum" 1 !important;
      letter-spacing: 0 !important;
      line-height: 1 !important;
      direction: ltr !important;
      unicode-bidi: isolate !important;
      text-align: center !important;
      white-space: nowrap !important;
      transform: none !important;
      transition: none !important;
      animation: none !important;
    }

    .current-time .time-subtitle {
      box-sizing: border-box !important;
      width: calc(100% - 12px) !important;
      min-width: 0 !important;
      max-width: calc(100% - 12px) !important;
      margin: 7px auto 0 !important;
      padding: 0 !important;
      text-align: center !important;
      transform: none !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }

    @media (max-width: 1180px) {
      .current-time {
        padding-left: 18px !important;
        padding-right: 18px !important;
      }

      .current-time > .${ROW_CLASS} {
        gap: clamp(5px, 2cqi, 8px) !important;
      }

      .current-time > .${ROW_CLASS} > .time-value,
      .current-time > .${ROW_CLASS} > .${RESULT_CLASS} {
        font-size: clamp(27px, 11.2cqi, 45px) !important;
      }
    }
  `;
}

let applyCount = 0;
let lastApply = null;
let timer = 0;
let observer = null;

function apply(source = 'apply') {
  if (!enabled()) return false;
  const host = document.getElementById(HOST_ID);
  const shadow = host?.shadowRoot;
  if (!(host instanceof HTMLElement) || !(shadow instanceof ShadowRoot)) return false;

  let style = shadow.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = cssText();
    shadow.appendChild(style);
  }

  const currentTime = shadow.querySelector('.current-time');
  const row = shadow.querySelector(`.current-time > .${ROW_CLASS}`);
  const timeValue = row?.querySelector('.time-value');
  const result = row?.querySelector(`.${RESULT_CLASS}`);
  const frameWidth = currentTime instanceof HTMLElement
    ? Math.round(currentTime.getBoundingClientRect().width)
    : null;
  const rowWidth = row instanceof HTMLElement
    ? Math.round(row.getBoundingClientRect().width)
    : null;
  const fits = Number.isFinite(frameWidth)
    && Number.isFinite(rowWidth)
    && rowWidth <= Math.max(0, frameWidth - 20);

  host.dataset.gannzillaTasiTimeTrackerResponsiveFitV568 = 'true';
  host.dataset.gannzillaTasiTimeTrackerMainTimeFitsV568 = String(fits);
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV568 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    frameWidth,
    rowWidth,
    timeVisible: timeValue instanceof HTMLElement,
    resultVisible: result instanceof HTMLElement,
    fits,
    canvasChanged: false,
    at: Date.now(),
  };
  return timeValue instanceof HTMLElement && result instanceof HTMLElement;
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

  observer = new MutationObserver(() => schedule('dom-mutation', 10));
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', () => schedule('resize', 0), false);

  [0, 80, 220, 600, 1400, 3200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });

  window.GANNZILLA_TASI_TIME_TRACKER_RESPONSIVE_FIT_V568 = true;
  window.__auditGannzillaTasiTimeTrackerResponsiveFitV568 = () => {
    const host = document.getElementById(HOST_ID);
    const shadow = host?.shadowRoot;
    const row = shadow?.querySelector(`.current-time > .${ROW_CLASS}`);
    return {
      ok: host instanceof HTMLElement
        && shadow instanceof ShadowRoot
        && host.dataset.gannzillaTasiTimeTrackerResponsiveFitV568 === 'true'
        && shadow.getElementById(STYLE_ID) instanceof HTMLStyleElement
        && row instanceof HTMLElement,
      build: BUILD,
      applyCount,
      fits: host?.dataset?.gannzillaTasiTimeTrackerMainTimeFitsV568 === 'true',
      canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV568 === 'true',
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, observer };
  schedule('install', 0);
}

install();
