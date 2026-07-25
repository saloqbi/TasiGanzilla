const BUILD = 485;
const MIN_ZOOM = 50;
const MAX_ZOOM = 600;
const STEP = 5;
const ZOOM_STORAGE_KEY = 'tasi-gannzilla-wheel-zoom-v453';
const CONTROL_ID = 'gannzilla-unified-wheel-tools-v453';
const ZOOM_OUT_ID = 'gannzilla-unified-zoom-out-v453';
const ZOOM_SELECT_ID = 'gannzilla-unified-zoom-select-v453';
const ZOOM_IN_ID = 'gannzilla-unified-zoom-in-v453';
const STATE_KEY = '__gannzillaZoomRange600V485';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function clampZoom(value) {
  const numeric = Number(value);
  const safe = Number.isFinite(numeric) ? numeric : 100;
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(safe / STEP) * STEP));
}

function readInitialZoom() {
  const queryZoom = Number(params().get('gannzillaZoom'));
  if (Number.isFinite(queryZoom)) return clampZoom(queryZoom * 100);
  try {
    const saved = Number(localStorage.getItem(ZOOM_STORAGE_KEY));
    if (Number.isFinite(saved)) return clampZoom(saved);
  } catch (_) { /* default remains active */ }
  return 100;
}

let currentZoom = readInitialZoom();
let frame = 0;
let applyCount = 0;
let actionCount = 0;
let lastAction = null;
let observedCanvas = null;
let canvasObserver = null;

function findWheelCanvas() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-unlimited-ring-layers-v480="true"]',
    'canvas[data-gannzilla-unified-wheel-tools-v453="true"]',
    'canvas[data-gannzilla-native-wheel-scrollbars-hidden-v417="true"]',
    'canvas[data-gannzilla-keyboard-mouse-control-v459="true"]',
  ].join(','));
  if (preferred instanceof HTMLCanvasElement && !preferred.closest('aside')) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement)
        || canvas.closest('aside')
        || canvas.id === 'gannzilla-top-center-drawing-overlay-v471'
        || canvas.id === 'gannzilla-wheel-line-theme-overlay-v473') return false;
      const style = getComputedStyle(canvas);
      return canvas.width > 300 && canvas.height > 300 && style.display !== 'none';
    })
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

function baseSize(canvas) {
  const dpr = Math.max(1, Math.min(2, Number(window.devicePixelRatio) || 1));
  return {
    width: Math.max(1, canvas.width / dpr),
    height: Math.max(1, canvas.height / dpr),
  };
}

function persistZoom() {
  try { localStorage.setItem(ZOOM_STORAGE_KEY, String(currentZoom)); } catch (_) { /* runtime only */ }
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('gannzillaZoom', (currentZoom / 100).toFixed(2));
    url.searchParams.set('wheelZoomMin', String(MIN_ZOOM));
    url.searchParams.set('wheelZoomMax', String(MAX_ZOOM));
    url.searchParams.set('wheelZoomStep', String(STEP));
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) { /* URL persistence is optional */ }
}

function populateSelect() {
  const select = document.getElementById(ZOOM_SELECT_ID);
  if (!(select instanceof HTMLSelectElement)) return false;

  const values = Array.from(select.options).map((option) => Number(option.value));
  if (values[0] !== MIN_ZOOM || values.at(-1) !== MAX_ZOOM || values.length !== ((MAX_ZOOM - MIN_ZOOM) / STEP) + 1) {
    const fragment = document.createDocumentFragment();
    for (let percent = MIN_ZOOM; percent <= MAX_ZOOM; percent += STEP) {
      const option = document.createElement('option');
      option.value = String(percent);
      option.textContent = `${percent}%`;
      fragment.appendChild(option);
    }
    select.replaceChildren(fragment);
  }
  select.value = String(currentZoom);
  return true;
}

function updateButtons() {
  const zoomOut = document.getElementById(ZOOM_OUT_ID);
  const zoomIn = document.getElementById(ZOOM_IN_ID);
  if (zoomOut instanceof HTMLElement) zoomOut.style.opacity = currentZoom <= MIN_ZOOM ? '.42' : '1';
  if (zoomIn instanceof HTMLElement) zoomIn.style.opacity = currentZoom >= MAX_ZOOM ? '.42' : '1';
}

function observeCanvas(canvas) {
  if (!(canvas instanceof HTMLCanvasElement) || observedCanvas === canvas) return;
  canvasObserver?.disconnect();
  observedCanvas = canvas;
  if (typeof ResizeObserver === 'function') {
    canvasObserver = new ResizeObserver(() => scheduleApply('canvas-resize', [0, 30, 100]));
    canvasObserver.observe(canvas);
  }
}

function applyZoom(source = 'apply') {
  frame = 0;
  populateSelect();
  updateButtons();

  const canvas = findWheelCanvas();
  if (!(canvas instanceof HTMLCanvasElement)) return false;
  observeCanvas(canvas);

  const base = baseSize(canvas);
  const ratio = currentZoom / 100;
  const width = base.width * ratio;
  const height = base.height * ratio;
  const actualWidth = parseFloat(canvas.style.width) || canvas.getBoundingClientRect().width;
  const actualHeight = parseFloat(canvas.style.height) || canvas.getBoundingClientRect().height;

  if (Math.abs(actualWidth - width) > 0.6) canvas.style.setProperty('width', `${width}px`, 'important');
  if (Math.abs(actualHeight - height) > 0.6) canvas.style.setProperty('height', `${height}px`, 'important');
  canvas.style.setProperty('max-width', 'none', 'important');
  canvas.style.setProperty('max-height', 'none', 'important');
  canvas.dataset.gannzillaZoomRange600V485 = 'true';
  canvas.dataset.gannzillaUnifiedZoomV453 = String(currentZoom);

  applyCount += 1;
  window.__gannzillaAllToolsRuntimeV482?.sched?.(`zoom-600-v${BUILD}-${source}`);
  window.dispatchEvent(new CustomEvent('gannzilla:zoom-range-600-v485', {
    detail: { source, percent: currentZoom, zoom: ratio, min: MIN_ZOOM, max: MAX_ZOOM, step: STEP, build: BUILD },
  }));
  return true;
}

const lateTimers = new Map();
function scheduleApply(source = 'schedule', delays = [0, 24, 80, 220]) {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => applyZoom(source));
  delays.filter(Boolean).forEach((delay) => {
    clearTimeout(lateTimers.get(delay));
    lateTimers.set(delay, setTimeout(() => {
      lateTimers.delete(delay);
      applyZoom(`${source}-${delay}`);
    }, delay));
  });
}

function setZoom(value, source) {
  currentZoom = clampZoom(value);
  persistZoom();
  actionCount += 1;
  lastAction = { source, percent: currentZoom, at: Date.now() };
  scheduleApply(source, [0, 20, 70, 180]);
}

function controlFromEvent(event) {
  const element = event.target?.closest?.(`#${ZOOM_OUT_ID},#${ZOOM_SELECT_ID},#${ZOOM_IN_ID}`);
  return element instanceof HTMLElement ? element : null;
}

function onClick(event) {
  const control = controlFromEvent(event);
  if (!control || control.id === ZOOM_SELECT_ID) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (control.id === ZOOM_OUT_ID) setZoom(currentZoom - STEP, 'zoom-out-600');
  if (control.id === ZOOM_IN_ID) setZoom(currentZoom + STEP, 'zoom-in-600');
}

function onKeyDown(event) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const control = controlFromEvent(event);
  if (!control || control.id === ZOOM_SELECT_ID) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (control.id === ZOOM_OUT_ID) setZoom(currentZoom - STEP, 'zoom-out-keyboard-600');
  if (control.id === ZOOM_IN_ID) setZoom(currentZoom + STEP, 'zoom-in-keyboard-600');
}

function onChange(event) {
  const select = event.target;
  if (!(select instanceof HTMLSelectElement) || select.id !== ZOOM_SELECT_ID) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  setZoom(Number(select.value), 'zoom-select-600');
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode() || window[STATE_KEY]) return;

  persistZoom();
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('change', onChange, true);

  const refresh = (event) => {
    if (event?.type === 'change' && event.target?.id === ZOOM_SELECT_ID) return;
    scheduleApply(event?.type || 'refresh');
  };
  window.addEventListener('resize', refresh, true);
  window.addEventListener('gannzilla:ring-two-numbering-refresh', refresh, true);
  window.addEventListener('gannzilla:unlimited-ring-layers-v480', refresh, true);
  window.addEventListener('gannzilla:start-value-authority-v484', refresh, true);
  window.addEventListener('gannzilla:clockwise-direction-commit-v483', refresh, true);
  window.addEventListener('gannzilla:canonical-property-change-v326', refresh, true);

  const observer = new MutationObserver(() => {
    populateSelect();
    scheduleApply('mutation', [0, 60]);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  [0, 40, 120, 300, 700, 1500, 3000, 5000].forEach((delay) => {
    setTimeout(() => scheduleApply(`boot-${delay}`, [0, 40, 140]), delay);
  });

  window.GANNZILLA_ZOOM_RANGE_600_V485 = true;
  window.__auditGannzillaZoomRange600V485 = () => {
    const select = document.getElementById(ZOOM_SELECT_ID);
    const canvas = findWheelCanvas();
    return {
      ok: window.GANNZILLA_ZOOM_RANGE_600_V485 === true
        && select instanceof HTMLSelectElement
        && Number(select.options[select.options.length - 1]?.value) === MAX_ZOOM
        && canvas?.dataset?.gannzillaZoomRange600V485 === 'true',
      build: BUILD,
      min: MIN_ZOOM,
      max: MAX_ZOOM,
      step: STEP,
      currentZoom,
      selectOptionCount: select instanceof HTMLSelectElement ? select.options.length : 0,
      applyCount,
      actionCount,
      lastAction,
    };
  };

  window[STATE_KEY] = { observer, refresh, onClick, onKeyDown, onChange, setZoom, scheduleApply };
  scheduleApply('install');
}

install();
