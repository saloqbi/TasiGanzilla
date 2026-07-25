const BUILD = 504;
const CONTROL_ID = 'gannzilla-unified-wheel-tools-v453';
const STYLE_ID = 'gannzilla-native-dpr-wheel-tools-style-v504';
const STATE_KEY = '__gannzillaNativeDprWheelToolsV504';
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

function persistZoom() {
  try { localStorage.setItem(ZOOM_STORAGE_KEY, String(currentZoom)); } catch (_) { /* runtime only */ }
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('gannzillaZoom', (currentZoom / 100).toFixed(2));
    url.searchParams.set('nativeDprRendering', 'true');
    url.searchParams.set('cssScaleDisabled', 'true');
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
    'canvas[data-gannzilla-final-wheel-authority-v504="true"]',
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
      detail: { x: 0, y: 0, source: 'native-dpr-toolbar-center', build: BUILD },
    }));
    return;
  }
  const key = { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown' }[direction];
  if (key) window.dispatchEvent(new KeyboardEvent('keydown', { key, code: key, bubbles: true }));
}

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = `
    #${CONTROL_ID}{position:fixed!important;top:8px!important;right:178px!important;z-index:2147483646!important;height:30px!important;display:flex!important;gap:3px!important;align-items:stretch!important;direction:ltr!important;font-family:Arial,"Segoe UI",Tahoma,sans-serif!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;}
    #${CONTROL_ID} button,#${CONTROL_ID} select{height:30px!important;margin:0!important;border:1px solid #8c969f!important;background:linear-gradient(#fff,#e5e5e5)!important;color:#223!important;font:700 13px Arial,"Segoe UI",Tahoma,sans-serif!important;box-sizing:border-box!important;cursor:pointer!important;}
    #${CONTROL_ID} button{width:30px!important;padding:0!important;display:flex!important;align-items:center!important;justify-content:center!important;}
    #${CONTROL_ID} select{width:58px!important;text-align:center!important;text-align-last:center!important;}
    #${CONTROL_ID} button:hover{background:#dcecff!important;border-color:#477da8!important;}
    #gannzilla-native-dpr-move-wrap-v504{position:relative!important;width:30px!important;height:30px!important;}
    #gannzilla-native-dpr-move-pad-v504{position:absolute!important;top:32px!important;left:-32px!important;width:94px!important;height:94px!important;padding:2px!important;background:#f1f1f1!important;border:1px solid #8c969f!important;box-shadow:0 5px 14px rgba(0,0,0,.25)!important;display:none!important;grid-template-columns:repeat(3,30px)!important;grid-template-rows:repeat(3,30px)!important;z-index:2147483647!important;}
    #gannzilla-native-dpr-move-wrap-v504[data-open="true"] #gannzilla-native-dpr-move-pad-v504{display:grid!important;}
    #gannzilla-native-dpr-move-pad-v504 button{width:30px!important;height:30px!important;}
    #gannzilla-native-dpr-move-pad-v504 [data-dir="up"]{grid-column:2;grid-row:1;}#gannzilla-native-dpr-move-pad-v504 [data-dir="left"]{grid-column:1;grid-row:2;}#gannzilla-native-dpr-move-pad-v504 [data-dir="center"]{grid-column:2;grid-row:2;}#gannzilla-native-dpr-move-pad-v504 [data-dir="right"]{grid-column:3;grid-row:2;}#gannzilla-native-dpr-move-pad-v504 [data-dir="down"]{grid-column:2;grid-row:3;}
  `;
}

function button(label, title, onClick) {
  const node = document.createElement('button');
  node.type = 'button';
  node.textContent = label;
  node.title = title;
  node.setAttribute('aria-label', title);
  node.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  });
  return node;
}

function updateControls() {
  const root = document.getElementById(CONTROL_ID);
  if (!(root instanceof HTMLElement)) return;
  const eye = root.querySelector('[data-role="eye"]');
  if (eye instanceof HTMLButtonElement) eye.textContent = wheelVisible ? '◉' : '○';
  const select = root.querySelector('[data-role="zoom"]');
  if (select instanceof HTMLSelectElement) select.value = String(currentZoom);
  const wrap = document.getElementById('gannzilla-native-dpr-move-wrap-v504');
  if (wrap instanceof HTMLElement) wrap.dataset.open = movePadOpen ? 'true' : 'false';
}

function createToolbar() {
  document.getElementById(CONTROL_ID)?.remove();
  const root = document.createElement('div');
  root.id = CONTROL_ID;
  root.dataset.gannzillaProtectedControlV453 = 'true';
  root.dataset.gannzillaNativeDprWheelToolsV504 = 'true';

  const eye = button('◉', 'إظهار أو إخفاء العجلة', () => setVisibility(!wheelVisible));
  eye.dataset.role = 'eye';

  const moveWrap = document.createElement('div');
  moveWrap.id = 'gannzilla-native-dpr-move-wrap-v504';
  moveWrap.dataset.open = 'false';
  const move = button('✣', 'تحريك العجلة', () => {
    movePadOpen = !movePadOpen;
    updateControls();
  });
  const pad = document.createElement('div');
  pad.id = 'gannzilla-native-dpr-move-pad-v504';
  [['up', '↑'], ['left', '←'], ['center', '•'], ['right', '→'], ['down', '↓']].forEach(([direction, label]) => {
    const item = button(label, direction, () => dispatchMove(direction));
    item.dataset.dir = direction;
    pad.appendChild(item);
  });
  moveWrap.append(move, pad);

  const { min, max, step } = zoomSettings();
  const zoomOut = button('−', 'تصغير مع إعادة الرسم', () => {
    currentZoom = clampZoom(currentZoom - step);
    updateControls();
    applyNativeZoom('zoom-out');
  });
  const select = document.createElement('select');
  select.dataset.role = 'zoom';
  for (let percent = min; percent <= max; percent += step) {
    const option = document.createElement('option');
    option.value = String(percent);
    option.textContent = `${percent}%`;
    select.appendChild(option);
  }
  select.value = String(currentZoom);
  select.title = 'حجم العجلة — إعادة رسم أصلية';
  select.addEventListener('change', () => {
    currentZoom = clampZoom(Number(select.value));
    applyNativeZoom('zoom-select');
  });
  const zoomIn = button('+', 'تكبير مع إعادة الرسم', () => {
    currentZoom = clampZoom(currentZoom + step);
    updateControls();
    applyNativeZoom('zoom-in');
  });

  const fullscreen = button('⛶', 'ملء الشاشة', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (_) {
      // Browser policy may reject fullscreen.
    }
  });

  root.append(eye, moveWrap, zoomOut, select, zoomIn, fullscreen);
  document.body.appendChild(root);
  updateControls();
  return root;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode() || window[STATE_KEY]) return;
  installStyle();
  createToolbar();
  applyNativeZoom('install');

  document.addEventListener('click', (event) => {
    const wrap = document.getElementById('gannzilla-native-dpr-move-wrap-v504');
    if (wrap instanceof HTMLElement && !wrap.contains(event.target)) {
      movePadOpen = false;
      updateControls();
    }
  }, true);

  window.GANNZILLA_NATIVE_DPR_WHEEL_TOOLS_V504 = true;
  window.__auditGannzillaNativeDprWheelToolsV504 = () => {
    const root = document.getElementById(CONTROL_ID);
    return {
      ok: root instanceof HTMLElement
        && root.dataset.gannzillaNativeDprWheelToolsV504 === 'true'
        && Number(window.__gannzillaNativeDprZoomV504) === currentZoom / 100,
      build: BUILD,
      currentZoom,
      nativeRenderZoom: currentZoom / 100,
      cssCanvasScaling: false,
      wheelVisible,
      actionCount,
      lastAction,
    };
  };

  window[STATE_KEY] = { currentZoom };
}

install();