const BUILD = 562;
const STATE_KEY = '__gannzillaTasiTimeTrackerLineCleanupV562';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-line-cleanup-v562';

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
    && boolParam('timeTrackerPlainClock', true)
    && boolParam('timeTrackerLineCleanup', true);
}

function cssText() {
  return `
    .top {
      position: relative !important;
      z-index: 40 !important;
      min-height: 234px !important;
      overflow: visible !important;
      border-bottom: 0 !important;
      box-shadow:
        0 0 0 1px #ffe0aa inset,
        0 0 0 5px rgba(103,45,15,.17) inset !important;
    }

    .clock-face {
      z-index: 48 !important;
      align-self: center !important;
      transform: translateY(-16px) !important;
    }

    .identity {
      position: relative !important;
      z-index: 47 !important;
      align-self: stretch !important;
      overflow: hidden !important;
      background:
        radial-gradient(circle at 50% 0, rgba(255,255,255,.34), transparent 36%),
        linear-gradient(180deg, #efd2a3, #c8955c) !important;
      border-top: 0 !important;
      border-bottom: 0 !important;
      box-shadow: none !important;
    }

    .identity > div,
    .identity > div + div {
      position: relative !important;
      z-index: 2 !important;
      border-top: 0 !important;
      border-bottom: 0 !important;
      box-shadow: none !important;
      background: transparent !important;
    }

    .identity > div:first-child {
      padding-bottom: 5px !important;
    }

    .identity > div:last-child {
      padding-top: 5px !important;
      padding-bottom: 18px !important;
      transform: translateY(-5px) !important;
    }

    .identity > div:last-child .value {
      position: relative !important;
      z-index: 3 !important;
      transform: translate(4px, -3px) !important;
    }

    .row-shell {
      position: relative !important;
      z-index: 8 !important;
    }

    [data-minute-shell] {
      margin-top: 18px !important;
    }

    @media (max-width: 1180px) {
      .top {
        min-height: 206px !important;
      }

      .clock-face {
        transform: translateY(-13px) !important;
      }

      .identity > div:last-child {
        padding-bottom: 15px !important;
        transform: translateY(-4px) !important;
      }

      .identity > div:last-child .value {
        transform: translate(3px, -2px) !important;
      }

      [data-minute-shell] {
        margin-top: 15px !important;
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
  const clock = shadow?.querySelector('.clock-face');
  const identity = shadow?.querySelector('.identity');
  const dateValue = shadow?.querySelector('.identity > div:last-child .value');
  if (!(host instanceof HTMLElement)
      || !(shadow instanceof ShadowRoot)
      || !(clock instanceof HTMLElement)
      || !(identity instanceof HTMLElement)
      || !(dateValue instanceof HTMLElement)) return false;

  let style = shadow.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = cssText();
    shadow.appendChild(style);
  }

  host.dataset.gannzillaTasiTimeTrackerLineCleanupV562 = 'true';
  host.dataset.gannzillaTasiTimeTrackerClockRaisedV562 = 'true';
  host.dataset.gannzillaTasiTimeTrackerCrossingLinesRemovedV562 = 'true';
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV562 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    clockRaisedPx: window.innerWidth < 1180 ? 13 : 16,
    identityDividerRemoved: true,
    rowOverlapRemoved: true,
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

  window.GANNZILLA_TASI_TIME_TRACKER_LINE_CLEANUP_V562 = true;
  window.__auditGannzillaTasiTimeTrackerLineCleanupV562 = () => {
    const host = document.getElementById(HOST_ID);
    const shadow = host?.shadowRoot;
    const clock = shadow?.querySelector('.clock-face');
    const identity = shadow?.querySelector('.identity');
    return {
      ok: host instanceof HTMLElement
        && shadow instanceof ShadowRoot
        && host.dataset.gannzillaTasiTimeTrackerLineCleanupV562 === 'true'
        && shadow.getElementById(STYLE_ID) instanceof HTMLStyleElement
        && clock instanceof HTMLElement
        && identity instanceof HTMLElement,
      build: BUILD,
      applyCount,
      clockRaised: host?.dataset?.gannzillaTasiTimeTrackerClockRaisedV562 === 'true',
      crossingLinesRemoved: host?.dataset?.gannzillaTasiTimeTrackerCrossingLinesRemovedV562 === 'true',
      canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV562 === 'true',
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, observer };
  schedule('install', 0);
}

install();
