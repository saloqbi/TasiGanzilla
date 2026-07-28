const BUILD = 577;
const STATE_KEY = '__gannzillaTasiTimeTrackerMainTimeSafeFitV577';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-main-time-safe-fit-v577';
const ROW_CLASS = 'tasi-digital-root-row-v564';

const EXTRA_SAFE_INSET_PX = 8;
const MIN_FIT_SCALE = 0.68;

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
    && boolParam('timeTrackerFourEdgeResize', true)
    && boolParam('timeTrackerMainTimeSafeFit', true);
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function numericCssValue(style, propertyName) {
  const value = Number.parseFloat(style.getPropertyValue(propertyName));
  return Number.isFinite(value) ? value : 0;
}

function cssText() {
  return `
    .current-time {
      box-sizing: border-box !important;
      overflow: hidden !important;
    }

    .current-time > .${ROW_CLASS} {
      width: max-content !important;
      min-width: 0 !important;
      max-width: none !important;
      margin-left: auto !important;
      margin-right: auto !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      justify-content: center !important;
      transform:
        translateX(var(--tt-v577-main-time-shift-x, 0px))
        scale(var(--tt-v577-main-time-fit-scale, 1)) !important;
      transform-origin: center center !important;
      overflow: visible !important;
      will-change: transform !important;
    }

    .current-time > .${ROW_CLASS} > .time-value,
    .current-time > .${ROW_CLASS} > .tasi-digital-root-result-v564 {
      min-width: 0 !important;
      white-space: nowrap !important;
      overflow: visible !important;
    }
  `;
}

let applyCount = 0;
let lastApply = null;
let timer = 0;
let observer = null;
let resizeObserver = null;
let observedContainer = null;
let observedRow = null;

function measureAndApply(source = 'apply') {
  if (!enabled()) return false;

  const host = document.getElementById(HOST_ID);
  const shadow = host?.shadowRoot;
  const container = shadow?.querySelector('.current-time');
  const row = shadow?.querySelector(`.current-time > .${ROW_CLASS}`);
  const timeValue = row?.querySelector('.time-value');
  const result = row?.querySelector('.tasi-digital-root-result-v564');

  if (!(host instanceof HTMLElement)
      || !(shadow instanceof ShadowRoot)
      || !(container instanceof HTMLElement)
      || !(row instanceof HTMLElement)
      || !(timeValue instanceof HTMLElement)
      || !(result instanceof HTMLElement)) return false;

  let style = shadow.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = cssText();
    shadow.appendChild(style);
  }

  const containerStyle = getComputedStyle(container);
  const paddingLeft = numericCssValue(containerStyle, 'padding-left');
  const paddingRight = numericCssValue(containerStyle, 'padding-right');
  const contentWidth = Math.max(0, container.clientWidth - paddingLeft - paddingRight);
  const availableWidth = Math.max(1, contentWidth - EXTRA_SAFE_INSET_PX * 2);
  const intrinsicRowWidth = Math.max(1, row.scrollWidth, row.offsetWidth);
  const fitScale = clamp(availableWidth / intrinsicRowWidth, MIN_FIT_SCALE, 1);
  const renderedWidth = intrinsicRowWidth * fitScale;
  const freeWidth = Math.max(0, availableWidth - renderedWidth);

  const legacyShift = numericCssValue(containerStyle, '--tt-main-time-right-shift');
  const legacyNudge = window.innerWidth < 1180 ? 5 : 6;
  const requestedShift = Math.max(0, legacyShift + legacyNudge);
  const safeShift = Math.min(requestedShift, freeWidth / 2);

  container.style.setProperty('--tt-v577-main-time-fit-scale', fitScale.toFixed(6), 'important');
  container.style.setProperty('--tt-v577-main-time-shift-x', `${safeShift.toFixed(3)}px`, 'important');

  host.dataset.gannzillaTasiTimeTrackerMainTimeSafeFitV577 = 'true';
  host.dataset.gannzillaTasiTimeTrackerMainTimeScaleV577 = fitScale.toFixed(6);
  host.dataset.gannzillaTasiTimeTrackerMainTimeShiftV577 = safeShift.toFixed(3);
  host.dataset.gannzillaTasiTimeTrackerMainTimeAvailableWidthV577 = String(Math.round(availableWidth));
  host.dataset.gannzillaTasiTimeTrackerMainTimeIntrinsicWidthV577 = String(Math.round(intrinsicRowWidth));
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV577 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  requestAnimationFrame(() => {
    const containerRect = container.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const tolerance = 2;
    const fullyVisible = rowRect.left >= containerRect.left - tolerance
      && rowRect.right <= containerRect.right + tolerance;
    host.dataset.gannzillaTasiTimeTrackerMainTimeFullyVisibleV577 = String(fullyVisible);
  });

  if (!(resizeObserver instanceof ResizeObserver)) {
    resizeObserver = new ResizeObserver(() => schedule('resize-observer', 0));
  }
  if (observedContainer !== container) {
    if (observedContainer instanceof Element) resizeObserver.unobserve(observedContainer);
    observedContainer = container;
    resizeObserver.observe(container);
  }
  if (observedRow !== row) {
    if (observedRow instanceof Element) resizeObserver.unobserve(observedRow);
    observedRow = row;
    resizeObserver.observe(row);
  }

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    containerWidth: container.clientWidth,
    paddingLeft,
    paddingRight,
    availableWidth,
    intrinsicRowWidth,
    fitScale,
    renderedWidth,
    freeWidth,
    requestedShift,
    safeShift,
    canvasChanged: false,
    at: Date.now(),
  };

  return true;
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => requestAnimationFrame(() => measureAndApply(source)), delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  observer = new MutationObserver(() => schedule('dom-mutation', 12));
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', () => schedule('window-resize', 0), false);
  window.addEventListener('pointermove', () => {
    if (document.documentElement.dataset.gannzillaTimeTrackerGestureV576 === 'true') {
      schedule('tracker-resize-gesture', 0);
    }
  }, true);
  window.addEventListener('pointerup', () => schedule('tracker-resize-complete', 0), true);

  [0, 80, 220, 600, 1400, 3200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });

  window.GANNZILLA_TASI_TIME_TRACKER_MAIN_TIME_SAFE_FIT_V577 = true;
  window.__auditGannzillaTasiTimeTrackerMainTimeSafeFitV577 = () => {
    const host = document.getElementById(HOST_ID);
    const shadow = host?.shadowRoot;
    return {
      ok: host instanceof HTMLElement
        && shadow instanceof ShadowRoot
        && host.dataset.gannzillaTasiTimeTrackerMainTimeSafeFitV577 === 'true'
        && host.dataset.gannzillaTasiTimeTrackerMainTimeFullyVisibleV577 === 'true'
        && shadow.getElementById(STYLE_ID) instanceof HTMLStyleElement,
      build: BUILD,
      applyCount,
      fullyVisible: host?.dataset.gannzillaTasiTimeTrackerMainTimeFullyVisibleV577 === 'true',
      fitScale: Number(host?.dataset.gannzillaTasiTimeTrackerMainTimeScaleV577 || 0),
      shiftPx: Number(host?.dataset.gannzillaTasiTimeTrackerMainTimeShiftV577 || 0),
      availableWidth: Number(host?.dataset.gannzillaTasiTimeTrackerMainTimeAvailableWidthV577 || 0),
      intrinsicRowWidth: Number(host?.dataset.gannzillaTasiTimeTrackerMainTimeIntrinsicWidthV577 || 0),
      canvasChanged: host?.dataset.gannzillaTasiTimeTrackerCanvasChangedV577 === 'true',
      lastApply,
    };
  };

  window[STATE_KEY] = { apply: measureAndApply, schedule, observer };
  schedule('install', 0);
}

install();
