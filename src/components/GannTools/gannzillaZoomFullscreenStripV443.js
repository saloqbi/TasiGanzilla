const BUILD = 443;
const CONNECTION_CONTROL_ID = 'gannzilla-connection-control-v439';
const OLD_FULLSCREEN_ID = 'gannzilla-fullscreen-control-v440';
const OLD_ZOOM_IDS = ['gannzilla-wheel-zoom-control-v441', 'gannzilla-wheel-zoom-visible-v442'];
const CONTROL_ID = 'gannzilla-zoom-fullscreen-strip-v443';
const OUT_ID = 'gannzilla-zoom-out-v443';
const SELECT_ID = 'gannzilla-zoom-percent-v443';
const IN_ID = 'gannzilla-zoom-in-v443';
const FULLSCREEN_ID = 'gannzilla-fullscreen-v443';
const STYLE_ID = 'gannzilla-zoom-fullscreen-style-v443';
const STATE_KEY = '__gannzillaZoomFullscreenStripV443';
const STORAGE_KEY = 'tasi-gannzilla-wheel-zoom-v443';

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

function initialPercent() {
  const queryZoom = Number(params().get('gannzillaZoom'));
  if (Number.isFinite(queryZoom)) return clampPercent(queryZoom * 100);
  try {
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(stored)) return clampPercent(stored);
  } catch (_) {
    // Query/default remains authoritative.
  }
  return 100;
}

let currentPercent = initialPercent();
let baseCanvas = null;
let baseWidth = 0;
let baseHeight = 0;
let applying = false;
let canvasObserver = null;

function fullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || null;
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

function fullscreenMarkup(active) {
  return active
    ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" fill="none" stroke="#416d91" stroke-width="1.8"/><path d="M9 9 5.5 5.5M15 9l3.5-3.5M9 15l-3.5 3.5M15 15l3.5 3.5" fill="none" stroke="#416d91" stroke-width="1.4" stroke-linecap="round"/></svg>`
    : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3H3v6M15 3h6v6M3 15v6h6M21 15v6h-6" fill="none" stroke="#416d91" stroke-width="1.8"/><path d="M8.5 8.5 4 4M15.5 8.5 20 4M8.5 15.5 4 20M15.5 15.5 20 20" fill="none" stroke="#416d91" stroke-width="1.4" stroke-linecap="round"/></svg>`;
}

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    #${OLD_FULLSCREEN_ID},
    #gannzilla-wheel-zoom-control-v441,
    #gannzilla-wheel-zoom-visible-v442 {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }

    #${CONTROL_ID} {
      position: fixed !important;
      width: 146px !important;
      min-width: 146px !important;
      max-width: 146px !important;
      height: 30px !important;
      min-height: 30px !important;
      max-height: 30px !important;
      z-index: 2147483646 !important;
      display: flex !important;
      align-items: stretch !important;
      gap: 4px !important;
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
    #${CONTROL_ID} .gz443-zoom { width: 112px !important; height: 30px !important; display: flex !important; align-items: stretch !important; }

    #${OUT_ID}, #${IN_ID}, #${FULLSCREEN_ID} {
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
    #${OUT_ID}:hover, #${IN_ID}:hover, #${FULLSCREEN_ID}:hover { background: linear-gradient(#ffffff, #dcecff) !important; border-color: #477da8 !important; }
    #${OUT_ID}[data-disabled="true"], #${IN_ID}[data-disabled="true"] { opacity: .42 !important; cursor: default !important; }
    #${OUT_ID} svg, #${IN_ID} svg, #${FULLSCREEN_ID} svg { width: 20px !important; height: 20px !important; display: block !important; pointer-events: none !important; }

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

function findWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement) || canvas.closest?.('aside')) return false;
      const rect = canvas.getBoundingClientRect();
      const style = window.getComputedStyle(canvas);
      return canvas.width > 300 && canvas.height > 300 && rect.width > 250 && rect.height > 250
        && style.display !== 'none' && style.visibility !== 'hidden';
    })
    .map((canvas) => ({ canvas, area: canvas.width * canvas.height }))
    .sort((a, b) => b.area - a.area)[0]?.canvas || null;
}

function bindCanvas(canvas) {
  if (!(canvas instanceof HTMLCanvasElement)) return false;
  if (baseCanvas !== canvas) {
    canvasObserver?.disconnect();
    baseCanvas = canvas;
    const ratio = Math.max(.01, currentPercent / 100);
    const rect = canvas.getBoundingClientRect();
    baseWidth = (parseFloat(canvas.style.width) || rect.width) / ratio;
    baseHeight = (parseFloat(canvas.style.height) || rect.height) / ratio;
    canvasObserver = new MutationObserver(() => {
      if (!applying) window.requestAnimationFrame(() => applyZoom(currentPercent, 'canvas-mutation'));
    });
    canvasObserver.observe(canvas, { attributes: true, attributeFilter: ['style', 'class'] });
  }
  return true;
}

function persist(percent) {
  try { localStorage.setItem(STORAGE_KEY, String(percent)); } catch (_) { /* runtime still works */ }
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('gannzillaZoom', (percent / 100).toFixed(2));
    url.searchParams.set('showZoomFullscreenStrip', 'true');
    url.searchParams.set('showWheelZoomControl', 'false');
    url.searchParams.set('showFullscreenControl', 'false');
    url.searchParams.set('wheelZoomMin', String(settings().min));
    url.searchParams.set('wheelZoomMax', String(settings().max));
    url.searchParams.set('wheelZoomStep', String(settings().step));
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime remains active.
  }
}

function syncControls() {
  const { min, max } = settings();
  const out = document.getElementById(OUT_ID);
  const zoomIn = document.getElementById(IN_ID);
  const select = document.getElementById(SELECT_ID);
  if (out instanceof HTMLElement) out.dataset.disabled = currentPercent <= min ? 'true' : 'false';
  if (zoomIn instanceof HTMLElement) zoomIn.dataset.disabled = currentPercent >= max ? 'true' : 'false';
  if (select instanceof HTMLSelectElement) select.value = String(currentPercent);
}

function applyZoom(percent, source = 'control') {
  currentPercent = clampPercent(percent);
  persist(currentPercent);
  syncControls();
  const canvas = findWheelCanvas();
  if (!bindCanvas(canvas)) return false;
  const ratio = currentPercent / 100;
  applying = true;
  canvas.style.setProperty('width', `${Math.max(1, baseWidth * ratio)}px`, 'important');
  canvas.style.setProperty('height', `${Math.max(1, baseHeight * ratio)}px`, 'important');
  canvas.style.setProperty('max-width', 'none', 'important');
  canvas.style.setProperty('max-height', 'none', 'important');
  canvas.dataset.gannzillaZoomFullscreenV443 = String(currentPercent);
  window.requestAnimationFrame(() => { applying = false; });
  window.dispatchEvent(new CustomEvent('gannzilla:wheel-zoom-v443', { detail: { percent: currentPercent, zoom: ratio, source, build: BUILD } }));
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
  if (![...select.options].some((option) => Number(option.value) === currentPercent)) {
    const option = document.createElement('option');
    option.value = String(currentPercent);
    option.textContent = `${currentPercent}%`;
    select.appendChild(option);
  }
  select.value = String(currentPercent);
}

function activateSpan(element, handler) {
  element.tabIndex = 0;
  element.addEventListener('click', handler);
  element.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handler(event);
  });
}

function updateFullscreenControl() {
  const control = document.getElementById(FULLSCREEN_ID);
  if (!(control instanceof HTMLElement)) return;
  const active = Boolean(fullscreenElement());
  control.innerHTML = fullscreenMarkup(active);
  control.title = active
    ? (language() === 'ar' ? 'إلغاء تكبير الصفحة' : 'Exit full screen')
    : (language() === 'ar' ? 'تكبير الصفحة' : 'Full screen');
  control.setAttribute('aria-label', control.title);
}

async function toggleFullscreen(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  try {
    if (fullscreenElement()) {
      if (document.exitFullscreen) await document.exitFullscreen();
      else document.webkitExitFullscreen?.();
    } else if (document.documentElement.requestFullscreen) {
      try { await document.documentElement.requestFullscreen({ navigationUI: 'hide' }); }
      catch (_) { await document.documentElement.requestFullscreen(); }
    } else {
      document.documentElement.webkitRequestFullscreen?.();
    }
  } catch (_) {
    // Browser policy may reject fullscreen.
  }
  window.setTimeout(updateFullscreenControl, 40);
}

function createControl() {
  OLD_ZOOM_IDS.forEach((id) => document.getElementById(id)?.remove());
  document.getElementById(OLD_FULLSCREEN_ID)?.remove();

  const control = document.createElement('div');
  control.id = CONTROL_ID;
  control.className = 'gannzilla-chart-toolbar-v328';
  control.setAttribute('data-gannzilla-toolbar', 'true');

  const zoom = document.createElement('div');
  zoom.className = 'gz443-zoom';

  const out = document.createElement('span');
  out.id = OUT_ID;
  out.innerHTML = magnifierMarkup(false);
  out.title = language() === 'ar' ? 'تصغير العجلة' : 'Zoom wheel out';
  activateSpan(out, (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (currentPercent > settings().min) applyZoom(currentPercent - settings().step, 'minus');
  });

  const select = document.createElement('select');
  select.id = SELECT_ID;
  select.title = language() === 'ar' ? 'حجم العجلة' : 'Wheel size';
  populateSelect(select);
  select.addEventListener('change', () => applyZoom(Number(select.value), 'select'));

  const zoomIn = document.createElement('span');
  zoomIn.id = IN_ID;
  zoomIn.innerHTML = magnifierMarkup(true);
  zoomIn.title = language() === 'ar' ? 'تكبير العجلة' : 'Zoom wheel in';
  activateSpan(zoomIn, (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (currentPercent < settings().max) applyZoom(currentPercent + settings().step, 'plus');
  });

  zoom.append(out, select, zoomIn);

  const fullscreen = document.createElement('span');
  fullscreen.id = FULLSCREEN_ID;
  activateSpan(fullscreen, toggleFullscreen);

  control.append(zoom, fullscreen);
  document.body.appendChild(control);
  syncControls();
  updateFullscreenControl();
  return control;
}

function positionControl(control) {
  const connection = document.getElementById(CONNECTION_CONTROL_ID);
  const width = 146;
  const gap = Math.round(numberParam('zoomFullscreenGap', 4, 0, 20));
  if (connection instanceof HTMLElement) {
    const rect = connection.getBoundingClientRect();
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
  const top = Math.round(numberParam('rightLanguageTop', 8, 2, 160));
  control.style.setProperty('right', `${languageRight + languageWidth + connectionGap + 30 + gap}px`, 'important');
  control.style.setProperty('top', `${top}px`, 'important');
  control.style.removeProperty('left');
  return false;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showZoomFullscreenStrip', true) || window[STATE_KEY]) return;

  installStyle();
  OLD_ZOOM_IDS.forEach((id) => document.getElementById(id)?.remove());
  document.getElementById(OLD_FULLSCREEN_ID)?.remove();
  let control = document.getElementById(CONTROL_ID);
  if (!(control instanceof HTMLElement)) control = createControl();

  let frame = 0;
  let bootstrapObserver = null;
  const refresh = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      installStyle();
      OLD_ZOOM_IDS.forEach((id) => document.getElementById(id)?.remove());
      document.getElementById(OLD_FULLSCREEN_ID)?.remove();
      let current = document.getElementById(CONTROL_ID);
      if (!(current instanceof HTMLElement)) current = createControl();
      current.hidden = false;
      current.style.setProperty('display', 'flex', 'important');
      current.style.setProperty('visibility', 'visible', 'important');
      current.style.setProperty('opacity', '1', 'important');
      const connected = positionControl(current);
      applyZoom(currentPercent, 'refresh');
      updateFullscreenControl();
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

  window.GANNZILLA_ZOOM_FULLSCREEN_STRIP_V443 = true;
  window.__auditGannzillaZoomFullscreenStripV443 = () => {
    const node = document.getElementById(CONTROL_ID);
    const rect = node?.getBoundingClientRect();
    const connection = document.getElementById(CONNECTION_CONTROL_ID);
    const connectionRect = connection?.getBoundingClientRect();
    const canvas = findWheelCanvas();
    const { min, max, step } = settings();
    return {
      ok: Boolean(node && rect?.width > 0 && rect?.height > 0),
      build: BUILD,
      enabled: boolParam('showZoomFullscreenStrip', true),
      visibleFixedStrip: Boolean(node && getComputedStyle(node).visibility !== 'hidden'),
      fixedLeftOfConnection: Boolean(rect && connectionRect && rect.right <= connectionRect.left + 4),
      rangePercent: [min, max],
      stepPercent: step,
      currentPercent,
      wheelCanvasBound: Boolean(canvas),
      fullscreenApiConnected: true,
      oldZoomAndFullscreenControlsRemoved: true,
      protectedToolbarMarker: node?.getAttribute('data-gannzilla-toolbar') === 'true',
    };
  };

  window[STATE_KEY] = { bootstrapObserver, canvasObserver };
}

install();
