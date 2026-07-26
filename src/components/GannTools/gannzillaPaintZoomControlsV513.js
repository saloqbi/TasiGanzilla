const BUILD = 513;
const STATE_KEY = '__gannzillaPaintZoomControlsV513';
const ZOOM_IN_ID = 'gannzilla-unified-zoom-in-v509';
const ZOOM_OUT_ID = 'gannzilla-unified-zoom-out-v509';
const ZOOM_SELECT_ID = 'gannzilla-unified-zoom-select-v509';
const ZOOM_STORAGE_KEY = 'tasi-gannzilla-native-dpr-zoom-v504';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

function settings() {
  const min = Math.round(numberParam('wheelZoomMin', 50, 25, 100));
  const max = Math.max(min + 5, Math.round(numberParam('wheelZoomMax', 300, 100, 300)));
  const step = Math.round(numberParam('wheelZoomStep', 5, 1, 25));
  return { min, max, step };
}

function clampPercent(value) {
  const { min, max, step } = settings();
  const numeric = Number(value);
  const safe = Number.isFinite(numeric) ? numeric : 100;
  return Math.max(min, Math.min(max, Math.round(safe / step) * step));
}

function readPercent() {
  const select = document.getElementById(ZOOM_SELECT_ID);
  const fromSelect = Number(select?.value);
  if (Number.isFinite(fromSelect)) return clampPercent(fromSelect);

  const runtime = Number(window.__gannzillaNativeDprZoomV504);
  if (Number.isFinite(runtime)) return clampPercent(runtime * 100);

  const fromUrl = Number(params().get('gannzillaZoom'));
  if (Number.isFinite(fromUrl)) return clampPercent(fromUrl * 100);

  try {
    const saved = Number(localStorage.getItem(ZOOM_STORAGE_KEY));
    if (Number.isFinite(saved)) return clampPercent(saved);
  } catch (_) {
    // Default remains authoritative.
  }
  return 100;
}

function persist(percent) {
  try { localStorage.setItem(ZOOM_STORAGE_KEY, String(percent)); } catch (_) { /* runtime only */ }
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('gannzillaZoom', (percent / 100).toFixed(2));
    url.searchParams.set('paintPreview', 'true');
    url.searchParams.set('paintZoomControls', 'true');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime zoom remains active.
  }
}

let actionCount = 0;
let lastAction = null;

function applyZoom(percent, source) {
  const next = clampPercent(percent);
  const ratio = next / 100;
  const select = document.getElementById(ZOOM_SELECT_ID);
  if (select instanceof HTMLSelectElement) select.value = String(next);

  window.__gannzillaNativeDprZoomV504 = ratio;
  persist(next);
  window.dispatchEvent(new CustomEvent('gannzilla:native-dpr-zoom-v504', {
    detail: { source, ratio, percent: next, build: BUILD },
  }));

  actionCount += 1;
  lastAction = { source, percent: next, ratio, at: Date.now() };
  return next;
}

function controlFromTarget(target) {
  if (!(target instanceof Element)) return null;
  return target.closest(`#${ZOOM_IN_ID},#${ZOOM_OUT_ID}`);
}

function handleActivation(event, keyboard = false) {
  const control = controlFromTarget(event.target);
  if (!(control instanceof HTMLElement)) return;
  if (keyboard && event.key !== 'Enter' && event.key !== ' ') return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();

  const { step } = settings();
  const current = readPercent();
  const delta = control.id === ZOOM_IN_ID ? step : -step;
  applyZoom(current + delta, control.id === ZOOM_IN_ID ? 'paint-zoom-in-v513' : 'paint-zoom-out-v513');
}

function markControls() {
  const zoomIn = document.getElementById(ZOOM_IN_ID);
  const zoomOut = document.getElementById(ZOOM_OUT_ID);
  if (zoomIn instanceof HTMLElement) {
    zoomIn.dataset.gannzillaPaintZoomControlV513 = 'zoom-in';
    zoomIn.style.setProperty('pointer-events', 'auto', 'important');
    zoomIn.style.setProperty('cursor', 'pointer', 'important');
  }
  if (zoomOut instanceof HTMLElement) {
    zoomOut.dataset.gannzillaPaintZoomControlV513 = 'zoom-out';
    zoomOut.style.setProperty('pointer-events', 'auto', 'important');
    zoomOut.style.setProperty('cursor', 'pointer', 'important');
  }
  return Boolean(zoomIn && zoomOut);
}

function install() {
  if (typeof window === 'undefined'
    || typeof document === 'undefined'
    || !wheelMode()
    || window[STATE_KEY]) return;

  const onClick = (event) => handleActivation(event, false);
  const onKeyDown = (event) => handleActivation(event, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKeyDown, true);

  markControls();
  [50, 150, 400, 900, 1800, 3600].forEach((delay) => setTimeout(markControls, delay));

  window.GANNZILLA_PAINT_ZOOM_CONTROLS_V513 = true;
  window.__auditGannzillaPaintZoomControlsV513 = () => {
    const zoomIn = document.getElementById(ZOOM_IN_ID);
    const zoomOut = document.getElementById(ZOOM_OUT_ID);
    return {
      ok: zoomIn instanceof HTMLElement
        && zoomOut instanceof HTMLElement
        && zoomIn.dataset.gannzillaPaintZoomControlV513 === 'zoom-in'
        && zoomOut.dataset.gannzillaPaintZoomControlV513 === 'zoom-out',
      build: BUILD,
      currentPercent: readPercent(),
      zoomInBound: zoomIn?.dataset?.gannzillaPaintZoomControlV513 === 'zoom-in',
      zoomOutBound: zoomOut?.dataset?.gannzillaPaintZoomControlV513 === 'zoom-out',
      actionCount,
      lastAction,
    };
  };

  window[STATE_KEY] = { onClick, onKeyDown, markControls, applyZoom };
}

install();