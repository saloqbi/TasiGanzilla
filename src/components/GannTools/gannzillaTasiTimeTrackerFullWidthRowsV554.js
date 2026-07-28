const BUILD = 554;
const STATE_KEY = '__gannzillaTasiTimeTrackerFullWidthRowsV554';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-full-width-rows-v554';

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
    && boolParam('timeTrackerLuxuryStyle', true)
    && boolParam('timeTrackerFullWidthRows', true);
}

function cssText() {
  return `
    .section-title {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      overflow: hidden !important;
    }

    .row-shell {
      clear: both !important;
      width: 100% !important;
      height: 74px !important;
      margin: 10px 0 0 0 !important;
      direction: ltr !important;
      overflow-x: auto !important;
      overflow-y: hidden !important;
      border-width: 2px !important;
      scrollbar-width: none !important;
      scroll-behavior: smooth !important;
    }

    .row-shell + .row-shell {
      margin-top: 10px !important;
    }

    .row-shell::-webkit-scrollbar {
      display: none !important;
    }

    .cells {
      width: 100% !important;
      height: 70px !important;
      direction: ltr !important;
    }

    .cells[data-minute-cells] {
      min-width: max(100%, 1080px) !important;
      grid-template-columns: repeat(60, minmax(18px, 1fr)) !important;
    }

    .cells[data-angle-cells] {
      min-width: max(100%, 1020px) !important;
      grid-template-columns: repeat(30, minmax(34px, 1fr)) !important;
    }

    .cells[data-angle-cells] > .cell:nth-child(even) {
      display: none !important;
    }

    .cell {
      min-width: 0 !important;
      padding: 0 1px !important;
      font-family: "Arial Narrow", "Roboto Condensed", Arial, sans-serif !important;
      font-size: 17px !important;
      font-weight: 900 !important;
      letter-spacing: -0.25px !important;
      line-height: 1 !important;
      color: #ffd28f !important;
      text-shadow: 0 1px 2px #000, 0 0 3px rgba(255, 173, 86, .50) !important;
      text-rendering: geometricPrecision !important;
      -webkit-font-smoothing: antialiased !important;
    }

    .cell[data-type="angle"] {
      font-size: 18px !important;
      letter-spacing: -0.45px !important;
    }

    .cell.active {
      z-index: 8 !important;
      font-size: 23px !important;
      letter-spacing: 0 !important;
      transform: translateY(-1px) scale(1.08) !important;
      box-shadow:
        0 0 0 2px #fff0c6 inset,
        0 0 10px #ff812f,
        0 0 22px rgba(255,119,31,.82) !important;
    }

    .cell[data-type="angle"].active {
      font-size: 22px !important;
    }

    .tasi-luxury-guide-v549 {
      width: 4px !important;
      z-index: 30 !important;
    }

    @media (max-width: 1180px) {
      .row-shell {
        height: 68px !important;
      }

      .cells {
        height: 64px !important;
      }

      .cells[data-minute-cells] {
        min-width: max(100%, 1020px) !important;
        grid-template-columns: repeat(60, minmax(17px, 1fr)) !important;
      }

      .cells[data-angle-cells] {
        min-width: max(100%, 960px) !important;
        grid-template-columns: repeat(30, minmax(32px, 1fr)) !important;
      }

      .cell {
        font-size: 16px !important;
      }

      .cell[data-type="angle"] {
        font-size: 17px !important;
      }

      .cell.active {
        font-size: 22px !important;
      }

      .cell[data-type="angle"].active {
        font-size: 21px !important;
      }
    }
  `;
}

function nearestVisibleAngleMinute(minute) {
  const numeric = Number(minute);
  if (!Number.isFinite(numeric)) return 0;
  const normalized = Math.max(0, Math.min(59, Math.round(numeric)));
  return normalized - (normalized % 2);
}

function desiredScroll(shell, cell) {
  if (!(shell instanceof HTMLElement) || !(cell instanceof HTMLElement)) return 0;
  return Math.max(0, cell.offsetLeft - shell.clientWidth / 2 + cell.offsetWidth / 2);
}

function synchronizeRows(shadow) {
  const minuteShell = shadow.querySelector('[data-minute-shell]');
  const angleShell = shadow.querySelector('[data-angle-shell]');
  const activeMinute = shadow.querySelector('.cell[data-type="minute"].active');
  if (!(minuteShell instanceof HTMLElement)
      || !(angleShell instanceof HTMLElement)
      || !(activeMinute instanceof HTMLElement)) return false;

  const minute = Number(activeMinute.dataset.index || 0);
  const visibleAngleMinute = nearestVisibleAngleMinute(minute);
  const angleCells = Array.from(shadow.querySelectorAll('.cell[data-type="angle"]'));
  angleCells.forEach((cell) => {
    const active = Number(cell.dataset.index) === visibleAngleMinute;
    cell.classList.toggle('active', active);
  });
  const activeAngle = angleCells.find((cell) => Number(cell.dataset.index) === visibleAngleMinute);

  minuteShell.scrollLeft = desiredScroll(minuteShell, activeMinute);
  if (activeAngle instanceof HTMLElement) angleShell.scrollLeft = desiredScroll(angleShell, activeAngle);

  const tracker = shadow.querySelector('.tracker');
  const guide = shadow.querySelector('.tasi-luxury-guide-v549');
  if (tracker instanceof HTMLElement && guide instanceof HTMLElement) {
    const trackerRect = tracker.getBoundingClientRect();
    const minuteRect = minuteShell.getBoundingClientRect();
    const angleRect = angleShell.getBoundingClientRect();
    const activeRect = activeMinute.getBoundingClientRect();
    guide.style.setProperty('left', `${activeRect.left - trackerRect.left + activeRect.width / 2}px`, 'important');
    guide.style.setProperty('top', `${minuteRect.top - trackerRect.top}px`, 'important');
    guide.style.setProperty('height', `${Math.max(1, angleRect.bottom - minuteRect.top)}px`, 'important');
  }

  return true;
}

let applyCount = 0;
let lastApply = null;
let timer = 0;
let observer = null;
let interval = 0;

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

  const synchronized = synchronizeRows(shadow);
  host.dataset.gannzillaTasiTimeTrackerFullWidthRowsV554 = 'true';
  host.dataset.gannzillaTasiTimeTrackerLeftTitlesRemovedV554 = 'true';
  host.dataset.gannzillaTasiTimeTrackerMinuteColumnsV554 = '60';
  host.dataset.gannzillaTasiTimeTrackerAngleColumnsV554 = '30';
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV554 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    minuteColumns: 60,
    angleColumns: 30,
    angleStepDegrees: 12,
    leftTitlesRemoved: true,
    synchronized,
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

  observer = new MutationObserver(() => schedule('dom-mutation', 10));
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', () => schedule('resize', 0), false);

  [0, 80, 220, 600, 1400, 3200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });
  interval = window.setInterval(() => apply('clock-sync'), 200);

  window.GANNZILLA_TASI_TIME_TRACKER_FULL_WIDTH_ROWS_V554 = true;
  window.__auditGannzillaTasiTimeTrackerFullWidthRowsV554 = () => {
    const host = document.getElementById(HOST_ID);
    const shadow = host?.shadowRoot;
    const visibleAngles = shadow instanceof ShadowRoot
      ? Array.from(shadow.querySelectorAll('.cell[data-type="angle"]')).filter((cell) => getComputedStyle(cell).display !== 'none')
      : [];
    return {
      ok: host instanceof HTMLElement
        && shadow instanceof ShadowRoot
        && host.dataset.gannzillaTasiTimeTrackerFullWidthRowsV554 === 'true'
        && shadow.getElementById(STYLE_ID) instanceof HTMLStyleElement
        && visibleAngles.length === 30,
      build: BUILD,
      applyCount,
      minuteColumns: Number(host?.dataset?.gannzillaTasiTimeTrackerMinuteColumnsV554 || 0),
      angleColumns: visibleAngles.length,
      leftTitlesRemoved: host?.dataset?.gannzillaTasiTimeTrackerLeftTitlesRemovedV554 === 'true',
      canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV554 === 'true',
      lastApply,
    };
  };

  window[STATE_KEY] = {
    apply,
    schedule,
    observer,
    get interval() { return interval; },
  };

  schedule('install', 0);
}

install();
