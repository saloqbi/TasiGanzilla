const BUILD = 441;
const FULLSCREEN_CONTROL_ID = 'gannzilla-fullscreen-control-v440';
const CONTROL_ID = 'gannzilla-wheel-zoom-control-v441';
const OUT_BUTTON_ID = 'gannzilla-wheel-zoom-out-v441';
const SELECT_ID = 'gannzilla-wheel-zoom-percent-v441';
const IN_BUTTON_ID = 'gannzilla-wheel-zoom-in-v441';
const STYLE_ID = 'gannzilla-wheel-zoom-style-v441';
const STATE_KEY = '__gannzillaWheelZoomControlV441';
const STORAGE_KEY = 'tasi-gannzilla-wheel-zoom-v441';

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

function currentLanguage() {
  return params().get('lang') === 'ar' ? 'ar' : 'en';
}

function settings() {
  const min = Math.round(numberParam('wheelZoomMin', 50, 25, 100));
  const requestedMax = Math.round(numberParam('wheelZoomMax', 200, 100, 300));
  const max = Math.max(min + 5, requestedMax);
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

function storedPercent() {
  try {
    const value = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(value) ? clampPercent(value) : null;
  } catch (_) {
    return null;
  }
}

function initialPercent() {
  const queryZoom = Number(params().get('gannzillaZoom'));
  if (Number.isFinite(queryZoom)) return clampPercent(queryZoom * 100);
  return storedPercent() ?? 100;
}

function persistPercent(percent) {
  try { localStorage.setItem(STORAGE_KEY, String(percent)); }
  catch (_) { /* URL remains the secondary authority. */ }

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
    // Runtime zoom remains active when history access is restricted.
  }
}

function findMainWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement) || canvas.closest?.('aside')) return false;
      const rect = canvas.getBoundingClientRect?.();
      const style = window.getComputedStyle(canvas);
      return Boolean(
        canvas.width > 300
          && canvas.height > 300
          && rect
          && rect.width > 250
          && rect.height > 250
          && style.display !== 'none'
          && style.visibility !== 'hidden',
      );
    })
    .map((canvas) => ({ canvas, area: canvas.width * canvas.height }))
    .sort((a, b) => b.area - a.area)[0]?.canvas || null;
}

function readBaseSize(canvas, percent) {
  const savedWidth = Number(canvas.dataset.gannzillaZoomBaseWidthV441);
  const savedHeight = Number(canvas.dataset.gannzillaZoomBaseHeightV441);
  if (Number.isFinite(savedWidth) && savedWidth > 0 && Number.isFinite(savedHeight) && savedHeight > 0) {
    return { width: savedWidth, height: savedHeight };
  }

  const ratio = Math.max(0.01, percent / 100);
  const rect = canvas.getBoundingClientRect();
  const cssWidth = parseFloat(canvas.style.width) || rect.width;
  const cssHeight = parseFloat(canvas.style.height) || rect.height;
  const width = Math.max(1, cssWidth / ratio);
  const height = Math.max(1, cssHeight / ratio);

  canvas.dataset.gannzillaZoomBaseWidthV441 = String(width);
  canvas.dataset.gannzillaZoomBaseHeightV441 = String(height);
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
    #${CONTROL_ID} {
      position: fixed !important;
      width: 112px !important;
      min-width: 112px !important;
      height: 30px !important;
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
    }

    #${CONTROL_ID}, #${CONTROL_ID} * { box-sizing: border-box !important; }

    #${OUT_BUTTON_ID}, #${IN_BUTTON_ID} {
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
      box-shadow: 0 1px 3px rgba(0,0,0,.18) !important;
    }

    #${OUT_BUTTON_ID} { border-right: 0 !important; }
    #${IN_BUTTON_ID} { border-left: 0 !important; }
    #${OUT_BUTTON_ID}:hover, #${IN_BUTTON_ID}:hover { background: linear-gradient(#ffffff, #dcecff) !important; border-color: #477da8 !important; }
    #${OUT_BUTTON_ID}:disabled, #${IN_BUTTON_ID}:disabled { opacity: .42 !important; cursor: default !important; }
    #${OUT_BUTTON_ID} svg, #${IN_BUTTON_ID} svg { width: 20px !important; height: 20px !important; display: block !important; pointer-events: none !important; }

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
      appearance: none !important;
      -webkit-appearance: none !important;
    }

    #${SELECT_ID}:focus { outline: 1px solid #4d8fbe !important; outline-offset: -2px !important; }
  `;
}

let currentPercent = initialPercent();
let watchedCanvas = null;
let canvasResizeObserver = null;
let applying = false;
let applyFrame = 0;

function syncControls() {
  const select = document.getElementById(SELECT_ID);
  const out = document.getElementById(OUT_BUTTON_ID);
  const zoomIn = document.getElementById(IN_BUTTON_ID);
  const { min, max } = settings();

  if (select instanceof HTMLSelectElement) select.value = String(currentPercent);
  if (out instanceof HTMLButtonElement) out.disabled = currentPercent <= min;
  if (zoomIn instanceof HTMLButtonElement) zoomIn.disabled = currentPercent >= max;
}

function applyZoom(percent, source = 'control') {
  currentPercent = clampPercent(percent);
  persistPercent(currentPercent);
  syncControls();

  const canvas = findMainWheelCanvas();
  if (!(canvas instanceof HTMLCanvasElement)) return false;

  if (watchedCanvas !== canvas) {
    canvasResizeObserver?.disconnect();
    watchedCanvas = canvas;
    const base = readBaseSize(canvas, currentPercent);
    canvas.dataset.gannzillaZoomBaseWidthV441 = String(base.width);
    canvas.dataset.gannzillaZoomBaseHeightV441 = String(base.height);

    if (typeof ResizeObserver === 'function') {
      canvasResizeObserver = new ResizeObserver(() => {
        if (applying) return;
        window.cancelAnimationFrame(applyFrame);
        applyFrame = window.requestAnimationFrame(() => applyZoom(currentPercent, 'canvas-resize'));
      });
      canvasResizeObserver.observe(canvas);
    }
  }

  const base = readBaseSize(canvas, currentPercent);
  const ratio = currentPercent / 100;
  const targetWidth = Math.max(1, base.width * ratio);
  const targetHeight = Math.max(1, base.height * ratio);
  const actualWidth = parseFloat(canvas.style.width) || canvas.getBoundingClientRect().width;
  const actualHeight = parseFloat(canvas.style.height) || canvas.getBoundingClientRect().height;

  if (Math.abs(actualWidth - targetWidth) > 0.4 || Math.abs(actualHeight - targetHeight) > 0.4) {
    applying = true;
    canvas.style.setProperty('width', `${targetWidth}px`, 'important');
    canvas.style.setProperty('height', `${targetHeight}px`, 'important');
    window.requestAnimationFrame(() => { applying = false; });
  }

  canvas.dataset.gannzillaWheelZoomV441 = String(currentPercent);
  window.dispatchEvent(new CustomEvent('gannzilla:wheel-zoom-v441', {
    detail: { percent: currentPercent, zoom: ratio, source, build: BUILD },
  }));
  return true;
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
  if (!Array.from(select.options).some((option) => Number(option.value) === currentPercent)) {
    const option = document.createElement('option');
    option.value = String(currentPercent);
    option.textContent = `${currentPercent}%`;
    select.appendChild(option);
  }
  select.value = String(currentPercent);
}

function createControl() {
  const control = document.createElement('div');
  control.id = CONTROL_ID;
  control.setAttribute('role', 'group');
  control.setAttribute('aria-label', currentLanguage() === 'ar' ? 'تكبير وتصغير العجلة' : 'Wheel zoom');

  const out = document.createElement('button');
  out.id = OUT_BUTTON_ID;
  out.type = 'button';
  out.innerHTML = magnifierMarkup(false);
  out.title = currentLanguage() === 'ar' ? 'تصغير العجلة' : 'Zoom wheel out';
  out.setAttribute('aria-label', out.title);
  out.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    applyZoom(currentPercent - settings().step, 'minus');
  });

  const select = document.createElement('select');
  select.id = SELECT_ID;
  select.title = currentLanguage() === 'ar' ? 'حجم العجلة' : 'Wheel size';
  select.setAttribute('aria-label', select.title);
  populateSelect(select);
  select.addEventListener('change', () => applyZoom(Number(select.value), 'select'));

  const zoomIn = document.createElement('button');
  zoomIn.id = IN_BUTTON_ID;
  zoomIn.type = 'button';
  zoomIn.innerHTML = magnifierMarkup(true);
  zoomIn.title = currentLanguage() === 'ar' ? 'تكبير العجلة' : 'Zoom wheel in';
  zoomIn.setAttribute('aria-label', zoomIn.title);
  zoomIn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    applyZoom(currentPercent + settings().step, 'plus');
  });

  control.append(out, select, zoomIn);
  document.body.appendChild(control);
  syncControls();
  return control;
}

function positionControl(control) {
  const fullscreen = document.getElementById(FULLSCREEN_CONTROL_ID);
  const width = 112;
  const gap = Math.round(numberParam('wheelZoomControlGap', 4, 0, 20));

  if (fullscreen instanceof HTMLElement) {
    const rect = fullscreen.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      control.style.setProperty('left', `${Math.max(2, Math.round(rect.left - width - gap))}px`, 'important');
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
  control.style.setProperty('right', `${languageRight + languageWidth + connectionGap + 30 + fullscreenGap + 30 + gap}px`, 'important');
  control.style.setProperty('top', `${top}px`, 'important');
  control.style.removeProperty('left');
  return false;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showWheelZoomControl', true) || window[STATE_KEY]) return;

  installStyle();
  let control = document.getElementById(CONTROL_ID);
  if (!(control instanceof HTMLElement)) control = createControl();

  let positionFrame = 0;
  let bootstrapObserver = null;
  const refresh = () => {
    window.cancelAnimationFrame(positionFrame);
    positionFrame = window.requestAnimationFrame(() => {
      installStyle();
      let current = document.getElementById(CONTROL_ID);
      if (!(current instanceof HTMLElement)) current = createControl();
      const connected = positionControl(current);
      applyZoom(currentPercent, 'refresh');
      if (connected && findMainWheelCanvas()) {
        bootstrapObserver?.disconnect();
        bootstrapObserver = null;
      }
    });
  };

  refresh();
  [40, 120, 360, 900, 2000, 4000].forEach((delay) => window.setTimeout(refresh, delay));
  bootstrapObserver = new MutationObserver(refresh);
  bootstrapObserver.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('resize', refresh);
  window.addEventListener('scroll', refresh, true);
  document.addEventListener('fullscreenchange', refresh);
  document.addEventListener('webkitfullscreenchange', refresh);
  window.addEventListener('gannzilla:ring-two-numbering-refresh', refresh);
  window.addEventListener('gannzilla:property-change-v318', refresh);

  window.GANNZILLA_WHEEL_ZOOM_CONTROL_V441 = true;
  window.__auditGannzillaWheelZoomControlV441 = () => {
    const buttonOut = document.getElementById(OUT_BUTTON_ID);
    const select = document.getElementById(SELECT_ID);
    const buttonIn = document.getElementById(IN_BUTTON_ID);
    const fullscreen = document.getElementById(FULLSCREEN_CONTROL_ID);
    const rect = document.getElementById(CONTROL_ID)?.getBoundingClientRect();
    const fullscreenRect = fullscreen?.getBoundingClientRect();
    const canvas = findMainWheelCanvas();
    const { min, max, step } = settings();
    return {
      ok: Boolean(buttonOut && select && buttonIn && rect?.width > 0 && rect?.height > 0),
      build: BUILD,
      enabled: boolParam('showWheelZoomControl', true),
      rangePercent: [min, max],
      stepPercent: step,
      currentPercent,
      fixedLeftOfFullscreenIcon: Boolean(rect && fullscreenRect && rect.right <= fullscreenRect.left + 3),
      wheelCanvasBound: Boolean(canvas),
      canvasPercent: canvas?.dataset?.gannzillaWheelZoomV441 || null,
      noPageReloadZoom: true,
      keyboardAndMousePanPreserved: true,
    };
  };

  window[STATE_KEY] = { bootstrapObserver, canvasResizeObserver };
}

install();
