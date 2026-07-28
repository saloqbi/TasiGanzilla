const BUILD = 555;
const STATE_KEY = '__gannzillaTasiTimeTrackerFrameGlowV555';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-frame-glow-v555';
const MARKER_CLASS = 'tasi-time-tracker-triangle-v555';

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
    && boolParam('timeTrackerFullWidthRows', true)
    && boolParam('timeTrackerFrameGlow', true);
}

function cssText() {
  return `
    .tasi-luxury-guide-v549 {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      width: 0 !important;
      height: 0 !important;
      box-shadow: none !important;
    }

    .cell.active::after {
      display: none !important;
    }

    .row-shell {
      position: relative !important;
      border: 2px solid #d78239 !important;
      background:
        linear-gradient(180deg, rgba(31, 16, 8, .99), rgba(3, 3, 3, .995)) !important;
      box-shadow:
        0 0 0 1px rgba(255, 223, 169, .72) inset,
        0 0 0 5px rgba(72, 25, 7, .68) inset,
        0 0 10px rgba(255, 142, 58, .72),
        0 0 24px rgba(207, 76, 18, .43) !important;
    }

    [data-minute-shell] {
      border-color: #e39a52 !important;
      box-shadow:
        0 0 0 1px rgba(255, 235, 194, .82) inset,
        0 0 0 5px rgba(83, 30, 8, .72) inset,
        0 0 12px rgba(255, 159, 75, .80),
        0 0 26px rgba(224, 91, 25, .46) !important;
    }

    [data-angle-shell] {
      border-color: #c96f2d !important;
      box-shadow:
        0 0 0 1px rgba(255, 212, 151, .72) inset,
        0 0 0 5px rgba(71, 24, 7, .74) inset,
        0 0 10px rgba(240, 121, 46, .72),
        0 0 22px rgba(195, 65, 17, .42) !important;
    }

    .cell.active {
      border-color: #ffd39a !important;
      box-shadow:
        0 0 0 2px rgba(255, 244, 213, .88) inset,
        0 0 7px rgba(255, 139, 52, .74) !important;
    }

    .${MARKER_CLASS} {
      position: absolute;
      z-index: 60;
      width: 0;
      height: 0;
      pointer-events: none;
      border-left: 12px solid transparent;
      border-right: 12px solid transparent;
      border-top: 18px solid #ffc06c;
      transform: translate(-50%, -2px);
      filter:
        drop-shadow(0 0 2px #fff5d8)
        drop-shadow(0 0 6px #ff8b32)
        drop-shadow(0 0 14px rgba(255, 100, 24, .92));
    }

    .${MARKER_CLASS}::after {
      content: '';
      position: absolute;
      left: -5px;
      top: -16px;
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 8px solid #fff0c4;
    }
  `;
}

function ensureMarker(shadow) {
  const tracker = shadow.querySelector('.tracker');
  if (!(tracker instanceof HTMLElement)) return null;
  let marker = shadow.querySelector(`.${MARKER_CLASS}`);
  if (!(marker instanceof HTMLElement)) {
    marker = document.createElement('div');
    marker.className = MARKER_CLASS;
    marker.setAttribute('aria-hidden', 'true');
    tracker.appendChild(marker);
  }
  return { tracker, marker };
}

function positionMarker(shadow, tracker, marker) {
  const minuteShell = shadow.querySelector('[data-minute-shell]');
  const activeMinute = shadow.querySelector('.cell[data-type="minute"].active');
  if (!(minuteShell instanceof HTMLElement) || !(activeMinute instanceof HTMLElement)) return false;

  const trackerRect = tracker.getBoundingClientRect();
  const shellRect = minuteShell.getBoundingClientRect();
  const activeRect = activeMinute.getBoundingClientRect();
  const left = activeRect.left - trackerRect.left + activeRect.width / 2;
  const top = shellRect.bottom - trackerRect.top + 1;
  marker.style.setProperty('left', `${left}px`, 'important');
  marker.style.setProperty('top', `${top}px`, 'important');
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

  const decoration = ensureMarker(shadow);
  if (!decoration) return false;
  const positioned = positionMarker(shadow, decoration.tracker, decoration.marker);

  host.dataset.gannzillaTasiTimeTrackerFrameGlowV555 = 'true';
  host.dataset.gannzillaTasiTimeTrackerVerticalGuideV555 = 'removed';
  host.dataset.gannzillaTasiTimeTrackerFrameGlowModeV555 = 'minute-angle-frames-and-triangle';
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV555 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    verticalGuideRemoved: true,
    minuteFrameGlow: true,
    angleFrameGlow: true,
    triangleMarker: true,
    positioned,
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

  window.GANNZILLA_TASI_TIME_TRACKER_FRAME_GLOW_V555 = true;
  window.__auditGannzillaTasiTimeTrackerFrameGlowV555 = () => {
    const host = document.getElementById(HOST_ID);
    const shadow = host?.shadowRoot;
    return {
      ok: host instanceof HTMLElement
        && shadow instanceof ShadowRoot
        && host.dataset.gannzillaTasiTimeTrackerFrameGlowV555 === 'true'
        && shadow.getElementById(STYLE_ID) instanceof HTMLStyleElement
        && shadow.querySelector(`.${MARKER_CLASS}`) instanceof HTMLElement,
      build: BUILD,
      applyCount,
      verticalGuide: host?.dataset?.gannzillaTasiTimeTrackerVerticalGuideV555 || null,
      glowMode: host?.dataset?.gannzillaTasiTimeTrackerFrameGlowModeV555 || null,
      canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV555 === 'true',
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
