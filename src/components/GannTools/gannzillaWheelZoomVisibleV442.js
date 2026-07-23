const BUILD = 442;
const FULLSCREEN_CONTROL_ID = 'gannzilla-fullscreen-control-v440';
const OLD_CONTROL_ID = 'gannzilla-wheel-zoom-control-v441';
const CONTROL_ID = 'gannzilla-wheel-zoom-visible-v442';
const OUT_ID = 'gannzilla-wheel-zoom-out-v442';
const SELECT_ID = 'gannzilla-wheel-zoom-percent-v442';
const IN_ID = 'gannzilla-wheel-zoom-in-v442';
const STYLE_ID = 'gannzilla-wheel-zoom-visible-style-v442';
const STATE_KEY = '__gannzillaWheelZoomVisibleV442';
const STORAGE_KEY = 'tasi-gannzilla-wheel-zoom-v442';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function boolParam(name, fallback = true) {
  const query = params();
  if (!query.has(name)) return fallback;
  const value = String(query.get(name) || '').toLowerCase();
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
}

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function language() {
  return params().get('lang') === 'ar' ? 'ar' : 'en';
}

function settings() {
  const min = Math.round(numberParam('wheelZoomMin', 50, 25, 100));
  const maxRequested = Math.round(numberParam('wheelZoomMax', 200, 100, 300));
  const max = Math.max(min + 5, maxRequested);
  const step = Math.round(numberParam('wheelZoomStep', 5, 1, 25));
  return { min, max, step };
}

function clampPercent(value) {
  const { min, max, step } = settings();
  const numeric = Number(value);
  const safe = Number.isFinite(numeric) ? numeric : 100;
  const snapped = Math.round(safe / step) * step;
  return Math.max(min, Math.min(max, snapped));
}

function initialPercent() {
  const queryZoom = Number(params().get('gannzillaZoom'));
  if (Number.isFinite(queryZoom)) return clampPercent(queryZoom * 100);
  try {
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(stored)) return clampPercent(stored);
  } catch (_) {
    // URL/default remains authoritative.
  }
  return 100;
}

let currentPercent = initialPercent();
let watchedCanvas = null;
let canvasObserver = null;
let applying = false;
let applyFrame = 0;

function persist(percent) {
  try { localStorage.setItem(STORAGE_KEY, String(percent)); }
  catch (_) { /* Runtime remains available. */ }

  try {
    const url = new URL(window.location.href);
    url.searchParams.set('gannzillaZoom', (percent / 100).toFixed(2));
    url.searchParams.set('showWheelZoomControl', 'true');
    url.searchParams.set('wheelZoomMin', String(settings().min));
    url.searchParams.set('wheelZoomMax', String(settings().max));
    url.searchParams.set('wheelZoomStep', String(settings().step));
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime zoom still works if history is blocked.
  }
}

function findWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement) || canvas.closest?.('aside')) return false;
      const rect = canvas.getBoundingClientRect();
      const style = window.getComputedStyle(canvas);
      return canvas.width > 300
        && canvas.height > 300
        && rect.width > 250
        && rect.height > 250
        && style.display !== 'none'
        && style.visibility !== 'hidden';
    })
    .map((canvas) => ({ canvas, area: canvas.width * canvas.height }))
    .sort((a, b) => b.area - a.area)[0]?.canvas || null;
}

function baseSize(canvas) {
  const storedWidth = Number(canvas.dataset.gannzillaZoomBaseWidthV442);
  const storedHeight = Number(canvas.dataset.gannzillaZoomBaseHeightV442);
  if (Number.isFinite(storedWidth) && storedWidth > 0 && Number.isFinite(storedHeight) && storedHeight > 0) {
    return { width: storedWidth, height: storedHeight };
  }

  const ratio = Math.max(0.01, currentPercent / 100);
  const rect = canvas.getBoundingClientRect();
  const cssWidth = parseFloat(canvas.style.width) || rect.width;
  const cssHeight = parseFloat(canvas.style.height) || rect.height;
  const width = Math.max(1, cssWidth / ratio);
  const height = Math.max(1, cssHeight / ratio);
  canvas.dataset.gannzillaZoomBaseWidthV442 = String(width);
  canvas.dataset.gannzillaZoomBaseHeightV442 = String(height);
  return { width, height };
}

function magnifierMarkup(plus) {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="9.2" cy="9.2" r="5.7" fill="#fbfdff" stroke="#3579ad" stroke-width="1.45"/>
      <path d="M13.4 13.4 20 20" fill="none" stroke="#3579ad" stroke-width="2" stroke-linecap="round"/>
      <path d="M6.3 9.2h5.8" fill="none" stroke="#2469a2" stroke-width="1.55" stroke-linecap="square"/>
      ${plus ? '<path d="M9.2 6.3v5.8" fill="none" stroke="#2469a2" stroke-width="1.55" stroke-linecap="square"/>' : ''}
    </svg>`;
}

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    #${OLD_CONTROL_ID} {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }

    #${CONTROL_ID} {
      position: fixed !important;
      width: 112px !important;
      min-width: 112px !important;
      max-width: 112px !important;
      height: 30px !important;
      min-height: 30px !important;
      max-height: 30px !important;
      z-index: 2147483646 !important;
      display: flex !important;
      align-items: stretch !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      overflow: visible !important;
      direction: ltr !important;
      font-family: Arial, "Segoe UI", Tahoma, sans-serif !important;
      box-sizing: border-box !important;
      isolation: isolate !important;
    }

    #${CONTROL_ID}, #${CONTROL_ID} * { box-sizing: border-box !important; }

    #${OUT_ID}, #${IN_ID} {
      width: 30px !important;
      min-width: 30px !important;
      max-width: 30px !important;
      height: 30px !important;
      min-height: 30px !important;
      max-height: 30px !important;
      margin: 0 !important;
      padding: 4px !important;
      border: 1px solid #8d969f !important;
      border-radius: 0 !important;
      background: linear-gradient(#ffffff, #dedede) !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      user-select: none !important;
      box-shadow: 0 1px 3px rgba(0,0,0,.18) !important;
    }

    #${OUT_ID} { border-right: 0 !important; }
    #${IN_ID} { border-left: 0 !important; }
    #${OUT_ID}:hover, #${IN_ID}:hover { background: linear-gradient(#ffffff, #dcecff) !important; border-color: #477da8 !important; }
    #${OUT_ID}[data-disabled="true"], #${IN_ID}[data-disabled="true"] { opacity: .42 !important; cursor: default !important; }
    #${OUT_ID} svg, #${IN_ID} svg { width: 20px !important; height: 20px !important; display: block !important; pointer-events: none !important; }

    #${SELECT_ID} {
      width: 52px !important;
      min-width: 52px !important;
      max-width: 52px !important;
      height: 30px !important;
      min-height: 30px !important;
      max-height: 30px !important;
      margin: 0 !important;
      padding: 0 2px !important;
      border: 1px solid #8d969f !important;
      border-radius: 0 !important;
      background: linear-gradient(#ffffff, #e5e5e5) !important;
      color: #222 !important;
      font: 700 13px/28px Arial, "Segoe UI", Tahoma, sans-serif !important;
      text-align: center !important;
      text-align-last: center !important;
      cursor: pointer !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      appearance: auto !important;
    }
  `;
}

function populateSelect(select) {
  const { min, max, step } = settings();
  select.replaceChildren();
  for (let percent = min; percent <= max; percent += step) {
    const option = document.createElement('option');
    option.value = String(percent);
    option.textContent = `${percent}%`;
    select.appendChild(option);
  }
  if (![...select.options].some((option) => Number(option.value) === currentPercent)) {
    const option = document.createElement('option');
    option.value = String(currentPercent);
    option.textContent = `${currentPercent}%`;
    select.appendChild(option);
  }
  select.value = String(currentPercent);
}

function syncControl() {
  const { min, max } = settings();
  const out = document.getElementById(OUT_ID);
  const zoomIn = document.getElementById(IN_ID);
  const select = document.getElementById(SELECT_ID);
  if (out instanceof HTMLElement) out.dataset.disabled = currentPercent <= min ? 'true' : 'false';
  if (zoomIn instanceof HTMLElement) zoomIn.dataset.disabled = currentPercent >= max ? 'true' : 'false';
  if (select instanceof HTMLSelectElement) select.value = String(currentPercent);
}

function observeCanvas(canvas) {
  if (watchedCanvas === canvas) return;
  canvasObserver?.disconnect();
  watchedCanvas = canvas;
  if (!(canvas instanceof HTMLCanvasElement)) return;
  baseSize(canvas);
  canvasObserver = new MutationObserver(() => {
    if (applying) return;
    window.cancelAnimationFrame(applyFrame);
    applyFrame = window.requestAnimationFrame(() => applyZoom(currentPercent, 'canvas-style'));
  });
  canvasObserver.observe(canvas, { attributes: true, attributeFilter: ['style', 'class'] });
}

function applyZoom(percent, source = 'control') {
  currentPercent = clampPercent(percent);
  persist(currentPercent);
  syncControl();

  const canvas = findWheelCanvas();
  if (!(canvas instanceof HTMLCanvasElement)) return false;
  observeCanvas(canvas);

  const base = baseSize(canvas);
  const ratio = currentPercent / 100;
  const targetWidth = Math.max(1, base.width * ratio);
  const targetHeight = Math.max(1, base.height * ratio);
  const actualWidth = parseFloat(canvas.style.width) || canvas.getBoundingClientRect().width;
  const actualHeight = parseFloat(canvas.style.height) || canvas.getBoundingClientRect().height;

  if (Math.abs(actualWidth - targetWidth) > 0.5 || Math.abs(actualHeight - targetHeight) > 0.5) {
    applying = true;
    canvas.style.setProperty('width', `${targetWidth}px`, 'important');
    canvas.style.setProperty('height', `${targetHeight}px`, 'important');
    canvas.style.setProperty('max-width', 'none', 'important');
    canvas.style.setProperty('max-height', 'none', 'important');
    window.requestAnimationFrame(() => { applying = false; });
  }

  canvas.dataset.gannzillaWheelZoomV442 = String(currentPercent);
  window.dispatchEvent(new CustomEvent('gannzilla:wheel-zoom-v442', {
    detail: { percent: currentPercent, zoom: ratio, source, build: BUILD },
  }));
  return true;
}

function activate(element, handler) {
  element.tabIndex = 0;
  element.addEventListener('click', handler);
  element.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handler(event);
  });
}

function createControl() {
  document.getElementById(OLD_CONTROL_ID)?.remove();
  const control = document.createElement('div');
  control.id = CONTROL_ID;
  control.setAttribute('aria-label', language() === 'ar' ? 'تكبير وتصغير العجلة' : 'Wheel zoom');

  const out = document.createElement('span');
  out.id = OUT_ID;
  out.innerHTML = magnifierMarkup(false);
  out.title = language() === 'ar' ? 'تصغير العجلة' : 'Zoom wheel out';
  out.setAttribute('aria-label', out.title);
  activate(out, (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (currentPercent <= settings().min) return;
    applyZoom(currentPercent - settings().step, 'minus');
  });

  const select = document.createElement('select');
  select.id = SELECT_ID;
  select.title = language() === 'ar' ? 'حجم العجلة' : 'Wheel size';
  select.setAttribute('aria-label', select.title);
  populateSelect(select);
  select.addEventListener('change', () => applyZoom(Number(select.value), 'select'));

  const zoomIn = document.createElement('span');
  zoomIn.id = IN_ID;
  zoomIn.innerHTML = magnifierMarkup(true);
  zoomIn.title = language() === 'ar' ? 'تكبير العجلة' : 'Zoom wheel in';
  zoomIn.setAttribute('aria-label', zoomIn.title);
  activate(zoomIn, (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (currentPercent >= settings().max) return;
    applyZoom(currentPercent + settings().step, 'plus');
  });

  control.append(out, select, zoomIn);
  document.body.appendChild(control);
  syncControl();
  return control;
}

function positionControl(control) {
  const fullscreen = document.getElementById(FULLSCREEN_CONTROL_ID);
  const width = 112;
  const gap = Math.round(numberParam('wheelZoomControlGap', 4, 0, 20));

  if (fullscreen instanceof HTMLElement) {
    const rect = fullscreen.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const left = Math.max(2, Math.round(rect.left - width - gap));
      control.style.setProperty('left', `${left}px`, 'important');
      control.style.setProperty('top', `${Math.round(rect.top + Math.max(0, (rect.height - 30) / 2))}px`, 'important');
      control.style.removeProperty('right');
      return true;
    }
  }

  const languageRight = Math.round(numberParam('rightLanguageRight', 10, 2, 160));
  const languageWidth = Math.round(numberParam('rightLanguageWidth', 136, 104, 200));
  const connectionGap = Math.round(numberParam('connectionControlGap', 4, 0, 20));
  const fullscreenGap = Math.round(numberParam('fullscreenControlGap', 4, 0, 20));
  const top = Math.round(numberParam('rightLanguageTop', 8, 2, 160));
  const right = languageRight + languageWidth + connectionGap + 30 + fullscreenGap + 30 + gap;
  control.style.setProperty('right', `${right}px`, 'important');
  control.style.setProperty('top', `${top}px`, 'important');
  control.style.removeProperty('left');
  return false;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showWheelZoomControl', true) || window[STATE_KEY]) return;

  installStyle();
  document.getElementById(OLD_CONTROL_ID)?.remove();
  let control = document.getElementById(CONTROL_ID);
  if (!(control instanceof HTMLElement)) control = createControl();

  let frame = 0;
  let bootstrapObserver = null;
  const refresh = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      installStyle();
      document.getElementById(OLD_CONTROL_ID)?.remove();
      let current = document.getElementById(CONTROL_ID);
      if (!(current instanceof HTMLElement)) current = createControl();
      current.hidden = false;
      current.style.setProperty('display', 'flex', 'important');
      current.style.setProperty('visibility', 'visible', 'important');
      current.style.setProperty('opacity', '1', 'important');
      const connected = positionControl(current);
      applyZoom(currentPercent, 'refresh');
      if (connected && findWheelCanvas()) {
        bootstrapObserver?.disconnect();
        bootstrapObserver = null;
      }
    });
  };

  refresh();
  [20, 60, 140, 320, 700, 1400, 2800, 5000].forEach((delay) => window.setTimeout(refresh, delay));
  bootstrapObserver = new MutationObserver(refresh);
  bootstrapObserver.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('resize', refresh);
  window.addEventListener('scroll', refresh, true);
  document.addEventListener('fullscreenchange', refresh);
  document.addEventListener('webkitfullscreenchange', refresh);
  window.addEventListener('gannzilla:ring-two-numbering-refresh', refresh);
  window.addEventListener('gannzilla:property-change-v318', refresh);

  window.GANNZILLA_WHEEL_ZOOM_VISIBLE_V442 = true;
  window.__auditGannzillaWheelZoomVisibleV442 = () => {
    const controlNode = document.getElementById(CONTROL_ID);
    const rect = controlNode?.getBoundingClientRect();
    const fullscreen = document.getElementById(FULLSCREEN_CONTROL_ID);
    const fullscreenRect = fullscreen?.getBoundingClientRect();
    const canvas = findWheelCanvas();
    const { min, max, step } = settings();
    return {
      ok: Boolean(controlNode && rect?.width > 0 && rect?.height > 0),
      build: BUILD,
      enabled: boolParam('showWheelZoomControl', true),
      rangePercent: [min, max],
      stepPercent: step,
      currentPercent,
      alwaysVisibleFixedControl: true,
      nonButtonMagnifierControls: true,
      fixedLeftOfFullscreenIcon: Boolean(rect && fullscreenRect && rect.right <= fullscreenRect.left + 4),
      wheelCanvasBound: Boolean(canvas),
      canvasPercent: canvas?.dataset?.gannzillaWheelZoomV442 || null,
      keyboardAndMousePanPreserved: true,
    };
  };

  window[STATE_KEY] = { bootstrapObserver, canvasObserver };
}

install();
