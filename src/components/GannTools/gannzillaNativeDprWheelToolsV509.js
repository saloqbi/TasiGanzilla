const BUILD = 509;
const CONTROL_ID = 'gannzilla-unified-wheel-tools-v453';
const EYE_ID = 'gannzilla-unified-eye-v509';
const MOVE_WRAP_ID = 'gannzilla-unified-move-wrap-v509';
const MOVE_ID = 'gannzilla-unified-move-v509';
const PAD_ID = 'gannzilla-unified-move-pad-v509';
const ZOOM_GROUP_ID = 'gannzilla-unified-zoom-group-v509';
const ZOOM_OUT_ID = 'gannzilla-unified-zoom-out-v509';
const ZOOM_SELECT_ID = 'gannzilla-unified-zoom-select-v509';
const ZOOM_IN_ID = 'gannzilla-unified-zoom-in-v509';
const FULLSCREEN_ID = 'gannzilla-unified-fullscreen-v509';
const STYLE_ID = 'gannzilla-native-dpr-wheel-tools-style-v509';
const STATE_KEY = '__gannzillaNativeDprWheelToolsV509';
const CONNECTION_CONTROL_ID = 'gannzilla-connection-control-v439';
const ZOOM_STORAGE_KEY = 'tasi-gannzilla-native-dpr-zoom-v504';
const PAN_STORAGE_KEY = 'gannzilla-wheel-asymmetric-open-pan-v305';

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

function zoomSettings() {
  const min = Math.round(numberParam('wheelZoomMin', 50, 25, 100));
  const max = Math.max(min + 5, Math.round(numberParam('wheelZoomMax', 300, 100, 300)));
  const step = Math.round(numberParam('wheelZoomStep', 5, 1, 25));
  return { min, max, step };
}

function clampZoom(percent) {
  const { min, max, step } = zoomSettings();
  const numeric = Number(percent);
  const safe = Number.isFinite(numeric) ? numeric : 100;
  return Math.max(min, Math.min(max, Math.round(safe / step) * step));
}

function initialZoom() {
  const fromUrl = Number(params().get('gannzillaZoom'));
  if (Number.isFinite(fromUrl)) return clampZoom(fromUrl * 100);
  try {
    const saved = Number(localStorage.getItem(ZOOM_STORAGE_KEY));
    if (Number.isFinite(saved)) return clampZoom(saved);
  } catch (_) {
    // URL/default remains authoritative.
  }
  return 100;
}

let currentZoom = initialZoom();
let wheelVisible = true;
let movePadOpen = false;
let actionCount = 0;
let lastAction = null;
let positionFrame = 0;

function language() {
  return params().get('lang') === 'ar' ? 'ar' : 'en';
}

function persistZoom() {
  try { localStorage.setItem(ZOOM_STORAGE_KEY, String(currentZoom)); } catch (_) { /* runtime only */ }
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('gannzillaZoom', (currentZoom / 100).toFixed(2));
    url.searchParams.set('nativeDprRendering', 'true');
    url.searchParams.set('cssScaleDisabled', 'true');
    url.searchParams.set('compactIconLayout', 'true');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime state remains active.
  }
}

function applyNativeZoom(source) {
  const ratio = currentZoom / 100;
  window.__gannzillaNativeDprZoomV504 = ratio;
  persistZoom();
  window.dispatchEvent(new CustomEvent('gannzilla:native-dpr-zoom-v504', {
    detail: { source, ratio, percent: currentZoom, build: BUILD },
  }));
  actionCount += 1;
  lastAction = { type: 'native-render-zoom', source, ratio, percent: currentZoom, at: Date.now() };
}

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-final-wheel-authority-v506="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v491="true"]',
  ].join(','));
  if (preferred instanceof HTMLCanvasElement && !preferred.closest('aside')) return preferred;
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => canvas instanceof HTMLCanvasElement && !canvas.closest('aside'))
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

function setVisibility(visible) {
  wheelVisible = Boolean(visible);
  const canvas = findWheel();
  if (canvas instanceof HTMLCanvasElement) {
    canvas.style.setProperty('visibility', wheelVisible ? 'visible' : 'hidden', 'important');
    canvas.style.setProperty('opacity', wheelVisible ? '1' : '0', 'important');
    canvas.style.setProperty('pointer-events', wheelVisible ? 'auto' : 'none', 'important');
  }
  updateControls();
  actionCount += 1;
  lastAction = { type: 'visibility', visible: wheelVisible, at: Date.now() };
}

function dispatchMove(direction) {
  if (direction === 'center') {
    try { localStorage.setItem(PAN_STORAGE_KEY, JSON.stringify({ x: 0, y: 0 })); } catch (_) { /* runtime only */ }
    window.dispatchEvent(new CustomEvent('gannzilla:page-scrollbar-pan-v305', {
      detail: { x: 0, y: 0, source: 'compact-native-toolbar-center', build: BUILD },
    }));
    return;
  }
  const key = { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown' }[direction];
  if (key) window.dispatchEvent(new KeyboardEvent('keydown', { key, code: key, bubbles: true }));
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
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" fill="none" stroke="#416d91" stroke-width="1.8"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3H3v6M15 3h6v6M3 15v6h6M21 15v6h-6" fill="none" stroke="#416d91" stroke-width="1.8"/></svg>';
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
    #${CONTROL_ID}{position:fixed!important;width:214px!important;min-width:214px!important;max-width:214px!important;height:30px!important;z-index:2147483646!important;display:flex!important;align-items:stretch!important;gap:4px!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;overflow:visible!important;direction:ltr!important;font-family:Arial,"Segoe UI",Tahoma,sans-serif!important;box-sizing:border-box!important;}
    #${CONTROL_ID},#${CONTROL_ID} *{box-sizing:border-box!important;}
    #${EYE_ID},#${MOVE_ID},#${ZOOM_OUT_ID},#${ZOOM_IN_ID},#${FULLSCREEN_ID}{width:30px!important;min-width:30px!important;max-width:30px!important;height:30px!important;margin:0!important;padding:4px!important;border:1px solid #8d969f!important;border-radius:0!important;background:linear-gradient(#fff,#dedede)!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;user-select:none!important;box-shadow:0 1px 3px rgba(0,0,0,.18)!important;}
    #${EYE_ID}:hover,#${MOVE_ID}:hover,#${ZOOM_OUT_ID}:hover,#${ZOOM_IN_ID}:hover,#${FULLSCREEN_ID}:hover,#${MOVE_WRAP_ID}[data-open="true"] #${MOVE_ID}{background:linear-gradient(#fff,#dcecff)!important;border-color:#477da8!important;}
    #${EYE_ID} svg,#${MOVE_ID} svg,#${ZOOM_OUT_ID} svg,#${ZOOM_IN_ID} svg,#${FULLSCREEN_ID} svg{width:20px!important;height:20px!important;display:block!important;pointer-events:none!important;}
    #${MOVE_WRAP_ID}{position:relative!important;flex:0 0 30px!important;width:30px!important;height:30px!important;overflow:visible!important;}
    #${ZOOM_GROUP_ID}{flex:0 0 112px!important;width:112px!important;height:30px!important;display:flex!important;align-items:stretch!important;gap:0!important;}
    #${ZOOM_SELECT_ID}{width:52px!important;min-width:52px!important;max-width:52px!important;height:30px!important;margin:0!important;padding:0 2px!important;border:1px solid #8d969f!important;border-radius:0!important;background:linear-gradient(#fff,#e5e5e5)!important;color:#222!important;font:700 13px/28px Arial,"Segoe UI",Tahoma,sans-serif!important;text-align:center!important;text-align-last:center!important;cursor:pointer!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;}
    #${ZOOM_OUT_ID}{border-right:0!important;}#${ZOOM_IN_ID}{border-left:0!important;}
    #${PAD_ID}{position:absolute!important;top:32px!important;left:0!important;width:94px!important;height:94px!important;padding:2px!important;display:none!important;grid-template-columns:repeat(3,30px)!important;grid-template-rows:repeat(3,30px)!important;gap:0!important;border:1px solid #8d969f!important;background:#f1f1f1!important;box-shadow:0 5px 14px rgba(0,0,0,.28)!important;z-index:2147483647!important;direction:ltr!important;}
    #${MOVE_WRAP_ID}[data-open="true"] #${PAD_ID}{display:grid!important;}
    #${PAD_ID} .gz509-pad{width:30px!important;height:30px!important;margin:0!important;padding:4px!important;border:1px solid #c2c2c2!important;background:linear-gradient(#fff,#e7e7e7)!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;}
    #${PAD_ID} .gz509-pad svg{width:20px!important;height:20px!important;pointer-events:none!important;}
    #${PAD_ID} .up{grid-column:2;grid-row:1;}#${PAD_ID} .left{grid-column:1;grid-row:2;}#${PAD_ID} .center{grid-column:2;grid-row:2;}#${PAD_ID} .right{grid-column:3;grid-row:2;}#${PAD_ID} .down{grid-column:2;grid-row:3;}
  `;
}

function makeClickable(element, handler) {
  element.tabIndex = 0;
  element.addEventListener('click', handler);
  element.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handler(event);
  });
}

function makePadItem(direction, className, markup, title) {
  const item = document.createElement('span');
  item.className = `gz509-pad ${className}`;
  item.innerHTML = markup;
  item.title = title;
  item.setAttribute('aria-label', title);
  makeClickable(item, (event) => {
    event.preventDefault();
    event.stopPropagation();
    dispatchMove(direction);
  });
  return item;
}

function updateControls() {
  const eye = document.getElementById(EYE_ID);
  if (eye instanceof HTMLElement) {
    eye.innerHTML = eyeMarkup(wheelVisible);
    eye.dataset.visible = wheelVisible ? 'true' : 'false';
  }
  const select = document.getElementById(ZOOM_SELECT_ID);
  if (select instanceof HTMLSelectElement) select.value = String(currentZoom);
  const wrap = document.getElementById(MOVE_WRAP_ID);
  if (wrap instanceof HTMLElement) wrap.dataset.open = movePadOpen ? 'true' : 'false';
  const fullscreen = document.getElementById(FULLSCREEN_ID);
  if (fullscreen instanceof HTMLElement) fullscreen.innerHTML = fullscreenMarkup(Boolean(document.fullscreenElement));
}

function populateZoomSelect(select) {
  const { min, max, step } = zoomSettings();
  for (let percent = min; percent <= max; percent += step) {
    const option = document.createElement('option');
    option.value = String(percent);
    option.textContent = `${percent}%`;
    select.appendChild(option);
  }
  select.value = String(currentZoom);
}

function positionControl() {
  const root = document.getElementById(CONTROL_ID);
  if (!(root instanceof HTMLElement)) return;
  const connection = document.getElementById(CONNECTION_CONTROL_ID);
  const width = 214;
  const gap = 4;
  if (connection instanceof HTMLElement) {
    const rect = connection.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      root.style.setProperty('left', `${Math.max(2, Math.round(rect.left - width - gap))}px`, 'important');
      root.style.setProperty('top', `${Math.round(rect.top + Math.max(0, (rect.height - 30) / 2))}px`, 'important');
      root.style.removeProperty('right');
      return;
    }
  }
  root.style.setProperty('right', '178px', 'important');
  root.style.setProperty('top', '8px', 'important');
  root.style.removeProperty('left');
}

function schedulePosition() {
  cancelAnimationFrame(positionFrame);
  positionFrame = requestAnimationFrame(positionControl);
}

function createToolbar() {
  document.getElementById(CONTROL_ID)?.remove();
  const ar = language() === 'ar';
  const root = document.createElement('div');
  root.id = CONTROL_ID;
  root.dataset.gannzillaProtectedControlV453 = 'true';
  root.dataset.gannzillaNativeDprWheelToolsV509 = 'true';
  root.dataset.gannzillaCompactIconLayout = 'true';

  const eye = document.createElement('span');
  eye.id = EYE_ID;
  eye.title = ar ? 'إظهار أو إخفاء العجلة' : 'Show or hide wheel';
  makeClickable(eye, (event) => {
    event.preventDefault();
    event.stopPropagation();
    setVisibility(!wheelVisible);
  });

  const moveWrap = document.createElement('div');
  moveWrap.id = MOVE_WRAP_ID;
  moveWrap.dataset.open = 'false';
  const move = document.createElement('span');
  move.id = MOVE_ID;
  move.innerHTML = moveMarkup();
  move.title = ar ? 'تحريك العجلة' : 'Move wheel';
  makeClickable(move, (event) => {
    event.preventDefault();
    event.stopPropagation();
    movePadOpen = !movePadOpen;
    updateControls();
  });
  const pad = document.createElement('div');
  pad.id = PAD_ID;
  pad.append(
    makePadItem('up', 'up', arrowMarkup('up'), ar ? 'أعلى' : 'Up'),
    makePadItem('left', 'left', arrowMarkup('left'), ar ? 'يسار' : 'Left'),
    makePadItem('center', 'center', centerMarkup(), ar ? 'توسيط' : 'Center'),
    makePadItem('right', 'right', arrowMarkup('right'), ar ? 'يمين' : 'Right'),
    makePadItem('down', 'down', arrowMarkup('down'), ar ? 'أسفل' : 'Down'),
  );
  moveWrap.append(move, pad);

  const zoomGroup = document.createElement('div');
  zoomGroup.id = ZOOM_GROUP_ID;
  const zoomOut = document.createElement('span');
  zoomOut.id = ZOOM_OUT_ID;
  zoomOut.innerHTML = magnifierMarkup(false);
  zoomOut.title = ar ? 'تصغير العجلة' : 'Zoom out';
  makeClickable(zoomOut, (event) => {
    event.preventDefault();
    event.stopPropagation();
    const { min, step } = zoomSettings();
    if (currentZoom <= min) return;
    currentZoom = clampZoom(currentZoom - step);
    updateControls();
    applyNativeZoom('zoom-out');
  });

  const select = document.createElement('select');
  select.id = ZOOM_SELECT_ID;
  select.title = ar ? 'حجم العجلة' : 'Wheel size';
  populateZoomSelect(select);
  select.addEventListener('change', () => {
    currentZoom = clampZoom(Number(select.value));
    applyNativeZoom('zoom-select');
  });

  const zoomIn = document.createElement('span');
  zoomIn.id = ZOOM_IN_ID;
  zoomIn.innerHTML = magnifierMarkup(true);
  zoomIn.title = ar ? 'تكبير العجلة' : 'Zoom in';
  makeClickable(zoomIn, (event) => {
    event.preventDefault();
    event.stopPropagation();
    const { max, step } = zoomSettings();
    if (currentZoom >= max) return;
    currentZoom = clampZoom(currentZoom + step);
    updateControls();
    applyNativeZoom('zoom-in');
  });
  zoomGroup.append(zoomOut, select, zoomIn);

  const fullscreen = document.createElement('span');
  fullscreen.id = FULLSCREEN_ID;
  fullscreen.title = ar ? 'ملء الشاشة' : 'Full screen';
  makeClickable(fullscreen, async (event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (_) {
      // Browser policy may reject fullscreen.
    }
    updateControls();
  });

  root.append(eye, moveWrap, zoomGroup, fullscreen);
  document.body.appendChild(root);
  updateControls();
  positionControl();
  return root;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode() || window[STATE_KEY]) return;
  installStyle();
  createToolbar();
  applyNativeZoom('install');

  document.addEventListener('click', (event) => {
    const wrap = document.getElementById(MOVE_WRAP_ID);
    if (wrap instanceof HTMLElement && !wrap.contains(event.target)) {
      movePadOpen = false;
      updateControls();
    }
  }, true);
  document.addEventListener('fullscreenchange', updateControls);
  window.addEventListener('resize', schedulePosition);

  window.GANNZILLA_NATIVE_DPR_WHEEL_TOOLS_V509 = true;
  window.__auditGannzillaNativeDprWheelToolsV509 = () => {
    const root = document.getElementById(CONTROL_ID);
    const rect = root?.getBoundingClientRect();
    return {
      ok: root instanceof HTMLElement
        && root.dataset.gannzillaNativeDprWheelToolsV509 === 'true'
        && root.dataset.gannzillaCompactIconLayout === 'true'
        && Math.abs((rect?.width || 0) - 214) < 1
        && Number(window.__gannzillaNativeDprZoomV504) === currentZoom / 100,
      build: BUILD,
      compactIconLayout: true,
      toolbarWidth: rect?.width || 0,
      toolbarHeight: rect?.height || 0,
      currentZoom,
      nativeRenderZoom: currentZoom / 100,
      cssCanvasScaling: false,
      wheelVisible,
      actionCount,
      lastAction,
    };
  };

  window[STATE_KEY] = { currentZoom, schedulePosition };
}

install();