const BUILD = 453;
const CONTROL_ID = 'gannzilla-unified-wheel-tools-v453';
const EYE_ID = 'gannzilla-unified-eye-v453';
const MOVE_WRAP_ID = 'gannzilla-unified-move-wrap-v453';
const MOVE_ID = 'gannzilla-unified-move-v453';
const PAD_ID = 'gannzilla-unified-move-pad-v453';
const ZOOM_GROUP_ID = 'gannzilla-unified-zoom-group-v453';
const ZOOM_OUT_ID = 'gannzilla-unified-zoom-out-v453';
const ZOOM_SELECT_ID = 'gannzilla-unified-zoom-select-v453';
const ZOOM_IN_ID = 'gannzilla-unified-zoom-in-v453';
const FULLSCREEN_ID = 'gannzilla-unified-fullscreen-v453';
const STYLE_ID = 'gannzilla-unified-wheel-tools-style-v453';
const STATE_KEY = '__gannzillaUnifiedWheelToolsV453';
const CONNECTION_CONTROL_ID = 'gannzilla-connection-control-v439';
const PAN_STORAGE_KEY = 'gannzilla-wheel-asymmetric-open-pan-v305';
const ZOOM_STORAGE_KEY = 'tasi-gannzilla-wheel-zoom-v453';
const VISIBILITY_STORAGE_KEY = 'tasi-gannzilla-wheel-visible-v448';

const OLD_IDS = [
  'gannzilla-fullscreen-control-v440',
  'gannzilla-wheel-zoom-control-v441',
  'gannzilla-wheel-zoom-visible-v442',
  'gannzilla-zoom-fullscreen-strip-v443',
  'gannzilla-wheel-move-control-v444',
  'gannzilla-wheel-move-control-v445',
  'gannzilla-wheel-move-inline-v447',
  'gannzilla-wheel-move-integrated-v450',
  'gannzilla-wheel-visibility-inline-v448',
  'gannzilla-wheel-visibility-fixed-v451',
  'gannzilla-unified-wheel-tools-v452',
];

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

function zoomSettings() {
  const min = Math.round(numberParam('wheelZoomMin', 50, 25, 100));
  const requestedMax = Math.round(numberParam('wheelZoomMax', 200, 100, 300));
  const max = Math.max(min + 5, requestedMax);
  const step = Math.round(numberParam('wheelZoomStep', 5, 1, 25));
  return { min, max, step };
}

function clampZoom(value) {
  const { min, max, step } = zoomSettings();
  const numeric = Number(value);
  const safe = Number.isFinite(numeric) ? numeric : 100;
  return Math.max(min, Math.min(max, Math.round(safe / step) * step));
}

function initialZoom() {
  const queryZoom = Number(params().get('gannzillaZoom'));
  if (Number.isFinite(queryZoom)) return clampZoom(queryZoom * 100);
  try {
    const saved = Number(localStorage.getItem(ZOOM_STORAGE_KEY));
    if (Number.isFinite(saved)) return clampZoom(saved);
  } catch (_) {
    // URL/default remains authoritative.
  }
  return 100;
}

function initialVisibility() {
  if (params().has('wheelVisible')) return boolParam('wheelVisible', true);
  try {
    const saved = localStorage.getItem(VISIBILITY_STORAGE_KEY);
    if (saved === 'false') return false;
    if (saved === 'true') return true;
  } catch (_) {
    // URL/default remains authoritative.
  }
  return true;
}

function readOffset() {
  try {
    const value = JSON.parse(localStorage.getItem(PAN_STORAGE_KEY) || '{}');
    return {
      x: Number.isFinite(Number(value.x)) ? Number(value.x) : 0,
      y: Number.isFinite(Number(value.y)) ? Number(value.y) : 0,
    };
  } catch (_) {
    return { x: 0, y: 0 };
  }
}

let currentZoom = initialZoom();
let wheelVisible = initialVisibility();
let currentOffset = readOffset();
let markedCanvas = null;
let observedCanvas = null;
let canvasResizeObserver = null;
let observedConnection = null;
let connectionResizeObserver = null;
let canvasFrame = 0;
let positionFrame = 0;
let lastAction = null;
let actionCount = 0;

function findWheelCanvas() {
  if (markedCanvas instanceof HTMLCanvasElement && markedCanvas.isConnected) return markedCanvas;

  const preferred = document.querySelector([
    'canvas[data-gannzilla-keyboard-mouse-control-v413="true"]',
    'canvas[data-gannzilla-native-wheel-scrollbars-hidden-v417="true"]',
    'canvas[data-gannzilla-unified-wheel-tools-v453="true"]',
  ].join(','));
  if (preferred instanceof HTMLCanvasElement && !preferred.closest?.('aside')) {
    markedCanvas = preferred;
    return preferred;
  }

  const canvas = Array.from(document.querySelectorAll('canvas'))
    .filter((node) => {
      if (!(node instanceof HTMLCanvasElement) || node.closest?.('aside')) return false;
      const style = window.getComputedStyle(node);
      return node.width > 300 && node.height > 300 && style.display !== 'none';
    })
    .map((node) => ({ node, area: node.width * node.height }))
    .sort((a, b) => b.area - a.area)[0]?.node || null;

  if (canvas instanceof HTMLCanvasElement) markedCanvas = canvas;
  return canvas;
}

function rendererBaseSize(canvas) {
  const dpr = Math.max(1, Math.min(2, Number(window.devicePixelRatio) || 1));
  const width = canvas.width > 0 ? canvas.width / dpr : canvas.getBoundingClientRect().width;
  const height = canvas.height > 0 ? canvas.height / dpr : canvas.getBoundingClientRect().height;
  return { width: Math.max(1, width), height: Math.max(1, height) };
}

function bindCanvas(canvas) {
  if (!(canvas instanceof HTMLCanvasElement)) return false;
  markedCanvas = canvas;
  if (observedCanvas === canvas) return true;

  canvasResizeObserver?.disconnect();
  observedCanvas = canvas;
  if (typeof ResizeObserver === 'function') {
    canvasResizeObserver = new ResizeObserver(() => scheduleCanvasPresentation('renderer-resize'));
    canvasResizeObserver.observe(canvas);
  }
  return true;
}

function applyCanvasPresentation(source = 'refresh') {
  const canvas = findWheelCanvas();
  if (!(canvas instanceof HTMLCanvasElement) || !bindCanvas(canvas)) return false;

  const base = rendererBaseSize(canvas);
  const ratio = currentZoom / 100;
  const targetWidth = Math.max(1, base.width * ratio);
  const targetHeight = Math.max(1, base.height * ratio);
  const actualWidth = parseFloat(canvas.style.width) || canvas.getBoundingClientRect().width;
  const actualHeight = parseFloat(canvas.style.height) || canvas.getBoundingClientRect().height;

  if (Math.abs(actualWidth - targetWidth) > 0.6) canvas.style.setProperty('width', `${targetWidth}px`, 'important');
  if (Math.abs(actualHeight - targetHeight) > 0.6) canvas.style.setProperty('height', `${targetHeight}px`, 'important');
  canvas.style.setProperty('max-width', 'none', 'important');
  canvas.style.setProperty('max-height', 'none', 'important');

  const expectedVisibility = wheelVisible ? 'visible' : 'hidden';
  const expectedOpacity = wheelVisible ? '1' : '0';
  const expectedPointerEvents = wheelVisible ? 'auto' : 'none';
  if (canvas.style.getPropertyValue('visibility') !== expectedVisibility) canvas.style.setProperty('visibility', expectedVisibility, 'important');
  if (canvas.style.getPropertyValue('opacity') !== expectedOpacity) canvas.style.setProperty('opacity', expectedOpacity, 'important');
  if (canvas.style.getPropertyValue('pointer-events') !== expectedPointerEvents) canvas.style.setProperty('pointer-events', expectedPointerEvents, 'important');

  canvas.dataset.gannzillaUnifiedWheelToolsV453 = 'true';
  canvas.dataset.gannzillaUnifiedZoomV453 = String(currentZoom);
  canvas.dataset.gannzillaUnifiedVisibleV453 = wheelVisible ? 'true' : 'false';
  if (wheelVisible) canvas.removeAttribute('aria-hidden');
  else canvas.setAttribute('aria-hidden', 'true');

  window.dispatchEvent(new CustomEvent('gannzilla:unified-wheel-tools-v453', {
    detail: { source, zoom: ratio, percent: currentZoom, visible: wheelVisible, offset: { ...currentOffset }, build: BUILD },
  }));
  return true;
}

function scheduleCanvasPresentation(source = 'refresh') {
  window.cancelAnimationFrame(canvasFrame);
  canvasFrame = window.requestAnimationFrame(() => applyCanvasPresentation(source));
}

function persistUiState() {
  try { localStorage.setItem(ZOOM_STORAGE_KEY, String(currentZoom)); } catch (_) { /* runtime only */ }
  try { localStorage.setItem(VISIBILITY_STORAGE_KEY, wheelVisible ? 'true' : 'false'); } catch (_) { /* runtime only */ }
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('gannzillaZoom', (currentZoom / 100).toFixed(2));
    url.searchParams.set('wheelVisible', wheelVisible ? 'true' : 'false');
    url.searchParams.set('showUnifiedWheelTools', 'true');
    url.searchParams.set('showZoomFullscreenStrip', 'false');
    url.searchParams.set('showWheelMoveControl', 'false');
    url.searchParams.set('showWheelVisibilityControl', 'false');
    url.searchParams.set('showWheelZoomControl', 'false');
    url.searchParams.set('showFullscreenControl', 'false');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime state remains active.
  }
}

function eyeMarkup(visible) {
  if (!visible) return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.4 12s3.7-5.8 9.6-5.8 9.6 5.8 9.6 5.8-3.7 5.8-9.6 5.8S2.4 12 2.4 12Z" fill="#ece7c6" stroke="#9d8e42" stroke-width="1.1"/><circle cx="12" cy="12" r="3.1" fill="#778a94" stroke="#4d626d" stroke-width="1"/><path d="M4.2 4.2 19.8 19.8" stroke="#b13d35" stroke-width="2.1" stroke-linecap="round"/></svg>';
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.4 12s3.7-5.8 9.6-5.8 9.6 5.8 9.6 5.8-3.7 5.8-9.6 5.8S2.4 12 2.4 12Z" fill="#ffe66a" stroke="#b99619" stroke-width="1.1"/><circle cx="12" cy="12" r="3.25" fill="#4d89b5" stroke="#28658f" stroke-width="1"/><circle cx="12" cy="12" r="1.25" fill="#173f5d"/><circle cx="10.9" cy="10.9" r=".65" fill="#fff"/></svg>';
}

function moveMarkup() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.3 8.7 5.6h2.1v3h2.4v-3h2.1L12 2.3Z" fill="#2b74aa"/><path d="m12 21.7 3.3-3.3h-2.1v-3h-2.4v3H8.7l3.3 3.3Z" fill="#2b74aa"/><path d="M2.3 12 5.6 8.7v2.1h3v2.4h-3v2.1L2.3 12Z" fill="#2b74aa"/><path d="m21.7 12-3.3 3.3v-2.1h-3v-2.4h3V8.7l3.3 3.3Z" fill="#2b74aa"/><rect x="9.1" y="9.1" width="5.8" height="5.8" rx="1" fill="#fff" stroke="#2b74aa" stroke-width="1.1"/><path d="M12 10.4v3.2M10.4 12h3.2" stroke="#2b74aa" stroke-width="1.1" stroke-linecap="round"/></svg>';
}

function magnifierMarkup(plus) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9.2" cy="9.2" r="5.7" fill="#fbfdff" stroke="#3579ad" stroke-width="1.45"/><path d="M13.4 13.4 20 20" fill="none" stroke="#3579ad" stroke-width="2" stroke-linecap="round"/><path d="M6.3 9.2h5.8" fill="none" stroke="#2469a2" stroke-width="1.55"/>${plus ? '<path d="M9.2 6.3v5.8" fill="none" stroke="#2469a2" stroke-width="1.55"/>' : ''}</svg>`;
}

function fullscreenMarkup(active) {
  return active
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" fill="none" stroke="#416d91" stroke-width="1.8"/><path d="M9 9 5.5 5.5M15 9l3.5-3.5M9 15l-3.5 3.5M15 15l3.5 3.5" fill="none" stroke="#416d91" stroke-width="1.4" stroke-linecap="round"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3H3v6M15 3h6v6M3 15v6h6M21 15v6h-6" fill="none" stroke="#416d91" stroke-width="1.8"/><path d="M8.5 8.5 4 4M15.5 8.5 20 4M8.5 15.5 4 20M15.5 15.5 20 20" fill="none" stroke="#416d91" stroke-width="1.4" stroke-linecap="round"/></svg>';
}

function arrowMarkup(direction) {
  const rotation = { up: 0, right: 90, down: 180, left: 270 }[direction] || 0;
  return `<svg viewBox="0 0 24 24" aria-hidden="true" style="transform:rotate(${rotation}deg)"><path d="M12 4 5.2 10.8h4.1V20h5.4v-9.2h4.1L12 4Z" fill="#5d9ec7" stroke="#2e719d" stroke-width=".8" stroke-linejoin="round"/></svg>`;
}

function centerMarkup() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6.4" fill="#fff" stroke="#5b8faf" stroke-width="1.1"/><path d="M12 7.5v9M7.5 12h9" stroke="#2f719d" stroke-width="1.35" stroke-linecap="round"/><circle cx="12" cy="12" r="1.2" fill="#2f719d"/></svg>';
}

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = `
    #${CONTROL_ID} { position:fixed!important;width:214px!important;min-width:214px!important;max-width:214px!important;height:30px!important;z-index:2147483646!important;display:flex!important;align-items:stretch!important;gap:4px!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;overflow:visible!important;direction:ltr!important;font-family:Arial,"Segoe UI",Tahoma,sans-serif!important;box-sizing:border-box!important;isolation:isolate!important; }
    #${CONTROL_ID},#${CONTROL_ID} *{box-sizing:border-box!important;}
    #${EYE_ID},#${MOVE_ID},#${ZOOM_OUT_ID},#${ZOOM_IN_ID},#${FULLSCREEN_ID}{width:30px!important;min-width:30px!important;max-width:30px!important;height:30px!important;margin:0!important;padding:4px!important;border:1px solid #8d969f!important;border-radius:0!important;background:linear-gradient(#fff,#dedede)!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;user-select:none!important;touch-action:manipulation!important;box-shadow:0 1px 3px rgba(0,0,0,.18)!important;}
    #${EYE_ID}:hover,#${MOVE_ID}:hover,#${ZOOM_OUT_ID}:hover,#${ZOOM_IN_ID}:hover,#${FULLSCREEN_ID}:hover,#${MOVE_WRAP_ID}[data-open="true"] #${MOVE_ID}{background:linear-gradient(#fff,#dcecff)!important;border-color:#477da8!important;}
    #${EYE_ID} svg,#${MOVE_ID} svg,#${ZOOM_OUT_ID} svg,#${ZOOM_IN_ID} svg,#${FULLSCREEN_ID} svg{width:20px!important;height:20px!important;display:block!important;pointer-events:none!important;}
    #${MOVE_WRAP_ID}{position:relative!important;flex:0 0 30px!important;width:30px!important;height:30px!important;overflow:visible!important;}
    #${ZOOM_GROUP_ID}{flex:0 0 112px!important;width:112px!important;height:30px!important;display:flex!important;align-items:stretch!important;gap:0!important;}
    #${ZOOM_SELECT_ID}{width:52px!important;min-width:52px!important;max-width:52px!important;height:30px!important;margin:0!important;padding:0 2px!important;border:1px solid #8d969f!important;border-radius:0!important;background:linear-gradient(#fff,#e5e5e5)!important;color:#222!important;font:700 13px/28px Arial,"Segoe UI",Tahoma,sans-serif!important;text-align:center!important;text-align-last:center!important;cursor:pointer!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;appearance:auto!important;}
    #${ZOOM_OUT_ID}{border-right:0!important;} #${ZOOM_IN_ID}{border-left:0!important;}
    #${PAD_ID}{position:absolute!important;top:32px!important;left:0!important;width:94px!important;height:94px!important;padding:2px!important;display:none!important;grid-template-columns:repeat(3,30px)!important;grid-template-rows:repeat(3,30px)!important;gap:0!important;border:1px solid #8d969f!important;background:#f1f1f1!important;box-shadow:0 5px 14px rgba(0,0,0,.28)!important;z-index:2147483647!important;direction:ltr!important;touch-action:none!important;}
    #${MOVE_WRAP_ID}[data-open="true"] #${PAD_ID}{display:grid!important;}
    #${PAD_ID} .gz453-pad{width:30px!important;height:30px!important;margin:0!important;padding:4px!important;border:1px solid #c2c2c2!important;background:linear-gradient(#fff,#e7e7e7)!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;pointer-events:auto!important;user-select:none!important;touch-action:none!important;}
    #${PAD_ID} .gz453-pad:hover{background:#dcecff!important;border-color:#6b9cbd!important;} #${PAD_ID} .gz453-pad svg{width:20px!important;height:20px!important;display:block!important;pointer-events:none!important;}
    #${PAD_ID} .gz453-up{grid-column:2!important;grid-row:1!important;} #${PAD_ID} .gz453-left{grid-column:1!important;grid-row:2!important;} #${PAD_ID} .gz453-center{grid-column:2!important;grid-row:2!important;} #${PAD_ID} .gz453-right{grid-column:3!important;grid-row:2!important;} #${PAD_ID} .gz453-down{grid-column:2!important;grid-row:3!important;}
  `;
}

function removeOldControls() { OLD_IDS.forEach((id) => document.getElementById(id)?.remove()); }

function makeClickable(element, handler) {
  element.tabIndex = 0;
  element.addEventListener('click', handler);
  element.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handler(event);
  });
}

function updateEye() {
  const eye = document.getElementById(EYE_ID);
  if (!(eye instanceof HTMLElement)) return;
  const ar = language() === 'ar';
  eye.innerHTML = eyeMarkup(wheelVisible);
  eye.title = wheelVisible ? (ar ? 'إخفاء العجلة' : 'Hide wheel') : (ar ? 'إظهار العجلة' : 'Show wheel');
  eye.setAttribute('aria-label', eye.title);
  eye.dataset.visible = wheelVisible ? 'true' : 'false';
}

function updateZoomControls() {
  const select = document.getElementById(ZOOM_SELECT_ID);
  if (select instanceof HTMLSelectElement) select.value = String(currentZoom);
  const out = document.getElementById(ZOOM_OUT_ID);
  const zoomIn = document.getElementById(ZOOM_IN_ID);
  const { min, max } = zoomSettings();
  if (out instanceof HTMLElement) out.style.opacity = currentZoom <= min ? '.42' : '1';
  if (zoomIn instanceof HTMLElement) zoomIn.style.opacity = currentZoom >= max ? '.42' : '1';
}

function updateFullscreen() {
  const control = document.getElementById(FULLSCREEN_ID);
  if (!(control instanceof HTMLElement)) return;
  const active = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
  const ar = language() === 'ar';
  control.innerHTML = fullscreenMarkup(active);
  control.title = active ? (ar ? 'إلغاء تكبير الصفحة' : 'Exit full screen') : (ar ? 'تكبير الصفحة' : 'Full screen');
  control.setAttribute('aria-label', control.title);
}

function setZoom(percent, source) {
  currentZoom = clampZoom(percent);
  persistUiState();
  updateZoomControls();
  scheduleCanvasPresentation(source);
  actionCount += 1;
  lastAction = { type: 'zoom', percent: currentZoom, source, at: Date.now() };
}

function setVisibility(visible, source) {
  wheelVisible = Boolean(visible);
  persistUiState();
  updateEye();
  scheduleCanvasPresentation(source);
  actionCount += 1;
  lastAction = { type: 'visibility', visible: wheelVisible, source, at: Date.now() };
}

function keyboardMove(direction) {
  const key = { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown' }[direction];
  if (!key) return;
  window.dispatchEvent(new KeyboardEvent('keydown', { key, code: key, bubbles: true, cancelable: true, composed: true }));
}

function makePadButton(direction, className, markup, title) {
  const item = document.createElement('span');
  item.className = `gz453-pad ${className}`;
  item.innerHTML = markup;
  item.title = title;
  item.setAttribute('aria-label', title);
  item.tabIndex = 0;
  if (direction === 'center') item.setAttribute('data-gannzilla-v265-center', 'true');
  else item.setAttribute('data-gannzilla-v265-direction', direction);
  item.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    if (direction === 'center') {
      currentOffset = { x: 0, y: 0 };
      try { localStorage.setItem(PAN_STORAGE_KEY, JSON.stringify(currentOffset)); } catch (_) { /* runtime only */ }
      window.dispatchEvent(new CustomEvent('gannzilla:page-scrollbar-pan-v305', { detail: { ...currentOffset, source: 'toolbar-center', build: BUILD } }));
    } else keyboardMove(direction);
  });
  return item;
}

function populateZoomSelect(select) {
  const { min, max, step } = zoomSettings();
  select.replaceChildren();
  for (let percent = min; percent <= max; percent += step) {
    const option = document.createElement('option');
    option.value = String(percent);
    option.textContent = `${percent}%`;
    select.appendChild(option);
  }
  if (![...select.options].some((option) => Number(option.value) === currentZoom)) {
    const option = document.createElement('option');
    option.value = String(currentZoom);
    option.textContent = `${currentZoom}%`;
    select.appendChild(option);
  }
  select.value = String(currentZoom);
}

function createControl() {
  const ar = language() === 'ar';
  const root = document.createElement('div');
  root.id = CONTROL_ID;
  root.dataset.gannzillaProtectedControlV453 = 'true';

  const eye = document.createElement('span');
  eye.id = EYE_ID;
  makeClickable(eye, (event) => { event.preventDefault(); event.stopPropagation(); setVisibility(!wheelVisible, 'eye'); });

  const moveWrap = document.createElement('div');
  moveWrap.id = MOVE_WRAP_ID;
  moveWrap.dataset.open = 'false';
  const move = document.createElement('span');
  move.id = MOVE_ID;
  move.innerHTML = moveMarkup();
  move.title = ar ? 'تحريك العجلة' : 'Move wheel';
  move.setAttribute('aria-label', move.title);
  makeClickable(move, (event) => { event.preventDefault(); event.stopPropagation(); moveWrap.dataset.open = moveWrap.dataset.open === 'true' ? 'false' : 'true'; });
  const pad = document.createElement('div');
  pad.id = PAD_ID;
  pad.append(
    makePadButton('up', 'gz453-up', arrowMarkup('up'), ar ? 'تحريك للأعلى' : 'Move up'),
    makePadButton('left', 'gz453-left', arrowMarkup('left'), ar ? 'تحريك لليسار' : 'Move left'),
    makePadButton('center', 'gz453-center', centerMarkup(), ar ? 'السنتر والاتزان' : 'Center wheel'),
    makePadButton('right', 'gz453-right', arrowMarkup('right'), ar ? 'تحريك لليمين' : 'Move right'),
    makePadButton('down', 'gz453-down', arrowMarkup('down'), ar ? 'تحريك للأسفل' : 'Move down'),
  );
  moveWrap.append(move, pad);

  const zoomGroup = document.createElement('div');
  zoomGroup.id = ZOOM_GROUP_ID;
  const zoomOut = document.createElement('span');
  zoomOut.id = ZOOM_OUT_ID;
  zoomOut.innerHTML = magnifierMarkup(false);
  zoomOut.title = ar ? 'تصغير العجلة' : 'Zoom wheel out';
  zoomOut.setAttribute('aria-label', zoomOut.title);
  makeClickable(zoomOut, (event) => { event.preventDefault(); event.stopPropagation(); const { min, step } = zoomSettings(); if (currentZoom > min) setZoom(currentZoom - step, 'zoom-out'); });
  const select = document.createElement('select');
  select.id = ZOOM_SELECT_ID;
  select.title = ar ? 'حجم العجلة' : 'Wheel size';
  select.setAttribute('aria-label', select.title);
  populateZoomSelect(select);
  select.addEventListener('change', () => setZoom(Number(select.value), 'zoom-select'));
  const zoomIn = document.createElement('span');
  zoomIn.id = ZOOM_IN_ID;
  zoomIn.innerHTML = magnifierMarkup(true);
  zoomIn.title = ar ? 'تكبير العجلة' : 'Zoom wheel in';
  zoomIn.setAttribute('aria-label', zoomIn.title);
  makeClickable(zoomIn, (event) => { event.preventDefault(); event.stopPropagation(); const { max, step } = zoomSettings(); if (currentZoom < max) setZoom(currentZoom + step, 'zoom-in'); });
  zoomGroup.append(zoomOut, select, zoomIn);

  const fullscreen = document.createElement('span');
  fullscreen.id = FULLSCREEN_ID;
  makeClickable(fullscreen, async (event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else document.webkitExitFullscreen?.();
      } else if (document.documentElement.requestFullscreen) {
        try { await document.documentElement.requestFullscreen({ navigationUI: 'hide' }); }
        catch (_) { await document.documentElement.requestFullscreen(); }
      } else document.documentElement.webkitRequestFullscreen?.();
    } catch (_) { /* Browser policy may reject fullscreen. */ }
    window.setTimeout(updateFullscreen, 40);
  });

  root.append(eye, moveWrap, zoomGroup, fullscreen);
  document.body.appendChild(root);
  updateEye();
  updateZoomControls();
  updateFullscreen();
  return root;
}

function clearHiddenState(node) {
  if (!(node instanceof HTMLElement)) return;
  node.hidden = false;
  node.removeAttribute('aria-hidden');
  node.removeAttribute('data-gannzilla-v145-hidden');
  node.removeAttribute('data-gannzilla-v145-previous-display');
  node.removeAttribute('data-gannzilla-toolbar-duplicate-hidden-v396');
  node.removeAttribute('data-gannzilla-duplicate-toolbar-v393');
  node.style.setProperty('display', 'flex', 'important');
  node.style.setProperty('visibility', 'visible', 'important');
  node.style.setProperty('opacity', '1', 'important');
  node.style.setProperty('pointer-events', 'auto', 'important');
}

function positionControl(root) {
  const connection = document.getElementById(CONNECTION_CONTROL_ID);
  const width = 214;
  const gap = Math.round(numberParam('unifiedWheelToolsGap', 4, 0, 20));
  if (connection instanceof HTMLElement) {
    const rect = connection.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      root.style.setProperty('left', `${Math.max(2, Math.round(rect.left - width - gap))}px`, 'important');
      root.style.setProperty('top', `${Math.round(rect.top + Math.max(0, (rect.height - 30) / 2))}px`, 'important');
      root.style.removeProperty('right');
      if (observedConnection !== connection && typeof ResizeObserver === 'function') {
        connectionResizeObserver?.disconnect();
        observedConnection = connection;
        connectionResizeObserver = new ResizeObserver(() => schedulePosition());
        connectionResizeObserver.observe(connection);
      }
      return true;
    }
  }
  const languageRight = Math.round(numberParam('rightLanguageRight', 10, 2, 160));
  const languageWidth = Math.round(numberParam('rightLanguageWidth', 136, 104, 200));
  const connectionGap = Math.round(numberParam('connectionControlGap', 4, 0, 20));
  const top = Math.round(numberParam('rightLanguageTop', 8, 2, 160));
  root.style.setProperty('right', `${languageRight + languageWidth + connectionGap + 30 + gap}px`, 'important');
  root.style.setProperty('top', `${top}px`, 'important');
  root.style.removeProperty('left');
  return false;
}

function schedulePosition() {
  window.cancelAnimationFrame(positionFrame);
  positionFrame = window.requestAnimationFrame(() => {
    const root = document.getElementById(CONTROL_ID);
    if (root instanceof HTMLElement) positionControl(root);
  });
}

function closeMovePad() {
  const wrap = document.getElementById(MOVE_WRAP_ID);
  if (wrap instanceof HTMLElement) wrap.dataset.open = 'false';
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showUnifiedWheelTools', true) || window[STATE_KEY]) return;

  installStyle();
  removeOldControls();
  let root = document.getElementById(CONTROL_ID);
  if (!(root instanceof HTMLElement)) root = createControl();
  clearHiddenState(root);
  positionControl(root);
  scheduleCanvasPresentation('install');

  const bootstrapDelays = [50, 150, 400, 900, 1800, 3500];
  const bootstrapTimers = bootstrapDelays.map((delay) => window.setTimeout(() => {
    removeOldControls();
    const current = document.getElementById(CONTROL_ID);
    if (current instanceof HTMLElement) { clearHiddenState(current); positionControl(current); }
    scheduleCanvasPresentation(`bootstrap-${delay}`);
  }, delay));

  const onDocumentClick = (event) => {
    const wrap = document.getElementById(MOVE_WRAP_ID);
    if (wrap instanceof HTMLElement && !wrap.contains(event.target)) closeMovePad();
  };
  const onKeyDown = (event) => { if (event.key === 'Escape') closeMovePad(); };
  const onPanSync = (event) => {
    const detail = event?.detail || {};
    if (!Number.isFinite(Number(detail.x)) || !Number.isFinite(Number(detail.y))) return;
    currentOffset = { x: Number(detail.x), y: Number(detail.y) };
  };
  const onRendererRefresh = () => scheduleCanvasPresentation('renderer-event');

  document.addEventListener('click', onDocumentClick, true);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('fullscreenchange', updateFullscreen);
  document.addEventListener('webkitfullscreenchange', updateFullscreen);
  window.addEventListener('resize', schedulePosition);
  window.addEventListener('gannzilla:wheel-pan-offset-v305', onPanSync);
  window.addEventListener('gannzilla:page-scrollbar-pan-v305', onPanSync);
  window.addEventListener('gannzilla:ring-two-numbering-refresh', onRendererRefresh);
  window.addEventListener('gannzilla:property-change-v318', onRendererRefresh);
  window.addEventListener('gannzilla:layout-panel-visibility-change', onRendererRefresh);

  window.GANNZILLA_UNIFIED_WHEEL_TOOLS_V453 = true;
  window.__auditGannzillaUnifiedWheelToolsV453 = () => {
    const node = document.getElementById(CONTROL_ID);
    const canvas = findWheelCanvas();
    const rect = node?.getBoundingClientRect();
    return {
      ok: Boolean(node && canvas && rect?.width > 0 && rect?.height > 0),
      build: BUILD,
      visible: Boolean(node && getComputedStyle(node).visibility !== 'hidden'),
      currentZoom,
      wheelVisible,
      currentOffset: { ...currentOffset },
      actionCount,
      lastAction,
      movementAuthority: 'GannzillaWheelQuarterHiddenPanV303',
      documentWideMutationObserver: false,
      repeatedCanvasTimersPerAction: false,
      oldToolbarControlsRemoved: OLD_IDS.every((id) => !document.getElementById(id)),
    };
  };
  window[STATE_KEY] = { bootstrapTimers, onDocumentClick, onKeyDown, onPanSync };
}

install();
