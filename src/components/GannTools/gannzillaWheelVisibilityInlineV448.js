const BUILD = 448;
const ZOOM_STRIP_ID = 'gannzilla-zoom-fullscreen-strip-v443';
const MOVE_WRAP_ID = 'gannzilla-wheel-move-inline-v447';
const WRAP_ID = 'gannzilla-wheel-visibility-inline-v448';
const BUTTON_ID = 'gannzilla-wheel-visibility-button-v448';
const STYLE_ID = 'gannzilla-wheel-visibility-inline-style-v448';
const STATE_KEY = '__gannzillaWheelVisibilityInlineV448';
const STORAGE_KEY = 'tasi-gannzilla-wheel-visible-v448';

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

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function language() {
  return params().get('lang') === 'ar' ? 'ar' : 'en';
}

function initialVisibility() {
  const query = params();
  if (query.has('wheelVisible')) return boolParam('wheelVisible', true);
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'false') return false;
    if (saved === 'true') return true;
  } catch (_) {
    // The URL/default remains authoritative when storage is unavailable.
  }
  return true;
}

let wheelVisible = initialVisibility();
let toggleCount = 0;
let lastToggle = null;
let markedCanvas = null;

function findWheelCanvas() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-wheel-visibility-v448="true"]',
    'canvas[data-gannzilla-keyboard-mouse-control-v413="true"]',
    'canvas[data-gannzilla-native-wheel-scrollbars-hidden-v417="true"]',
  ].join(','));
  if (preferred instanceof HTMLCanvasElement && !preferred.closest?.('aside')) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement) || canvas.closest?.('aside')) return false;
      const rect = canvas.getBoundingClientRect();
      const style = window.getComputedStyle(canvas);
      return canvas.width > 300
        && canvas.height > 300
        && rect.width > 250
        && rect.height > 250
        && style.display !== 'none';
    })
    .map((canvas) => ({ canvas, area: canvas.width * canvas.height }))
    .sort((a, b) => b.area - a.area)[0]?.canvas || null;
}

function eyeMarkup(visible) {
  if (!visible) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M2.4 12s3.7-5.8 9.6-5.8 9.6 5.8 9.6 5.8-3.7 5.8-9.6 5.8S2.4 12 2.4 12Z" fill="#ece7c6" stroke="#9d8e42" stroke-width="1.1"/>
        <circle cx="12" cy="12" r="3.1" fill="#778a94" stroke="#4d626d" stroke-width="1"/>
        <path d="M4.2 4.2 19.8 19.8" stroke="#b13d35" stroke-width="2.1" stroke-linecap="round"/>
      </svg>`;
  }

  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M2.4 12s3.7-5.8 9.6-5.8 9.6 5.8 9.6 5.8-3.7 5.8-9.6 5.8S2.4 12 2.4 12Z" fill="#ffe66a" stroke="#b99619" stroke-width="1.1"/>
      <circle cx="12" cy="12" r="3.25" fill="#4d89b5" stroke="#28658f" stroke-width="1"/>
      <circle cx="12" cy="12" r="1.25" fill="#173f5d"/>
      <circle cx="10.9" cy="10.9" r=".65" fill="#ffffff" opacity=".92"/>
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
    #${ZOOM_STRIP_ID} {
      overflow: visible !important;
      isolation: isolate !important;
    }

    #${WRAP_ID} {
      position: absolute !important;
      left: -68px !important;
      top: 0 !important;
      width: 30px !important;
      min-width: 30px !important;
      max-width: 30px !important;
      height: 30px !important;
      min-height: 30px !important;
      max-height: 30px !important;
      z-index: 2147483646 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      overflow: visible !important;
      direction: ltr !important;
      box-sizing: border-box !important;
    }

    #${WRAP_ID}, #${WRAP_ID} * { box-sizing: border-box !important; }

    #${BUTTON_ID} {
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
      touch-action: manipulation !important;
      box-shadow: 0 1px 3px rgba(0,0,0,.18) !important;
    }

    #${BUTTON_ID}:hover,
    #${BUTTON_ID}[aria-pressed="false"] {
      background: linear-gradient(#ffffff, #dcecff) !important;
      border-color: #477da8 !important;
    }

    #${BUTTON_ID} svg {
      width: 20px !important;
      height: 20px !important;
      display: block !important;
      pointer-events: none !important;
    }
  `;
}

function persistVisibility(visible) {
  try { localStorage.setItem(STORAGE_KEY, visible ? 'true' : 'false'); }
  catch (_) { /* Runtime state remains available. */ }

  try {
    const url = new URL(window.location.href);
    url.searchParams.set('wheelVisible', visible ? 'true' : 'false');
    url.searchParams.set('showWheelVisibilityControl', 'true');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // The visual toggle remains active if history access is restricted.
  }
}

function updateButton() {
  const button = document.getElementById(BUTTON_ID);
  if (!(button instanceof HTMLElement)) return;
  const ar = language() === 'ar';
  button.innerHTML = eyeMarkup(wheelVisible);
  button.setAttribute('aria-pressed', wheelVisible ? 'true' : 'false');
  button.dataset.wheelVisible = wheelVisible ? 'true' : 'false';
  button.title = wheelVisible
    ? (ar ? 'إخفاء العجلة' : 'Hide wheel')
    : (ar ? 'إظهار العجلة' : 'Show wheel');
  button.setAttribute('aria-label', button.title);
}

function applyCanvasVisibility(source = 'refresh') {
  const canvas = findWheelCanvas();
  if (!(canvas instanceof HTMLCanvasElement)) return false;

  markedCanvas = canvas;
  canvas.dataset.gannzillaWheelVisibilityV448 = 'true';
  canvas.dataset.gannzillaWheelVisibleV448 = wheelVisible ? 'true' : 'false';

  if (wheelVisible) {
    canvas.style.setProperty('visibility', 'visible', 'important');
    canvas.style.setProperty('opacity', '1', 'important');
    canvas.style.setProperty('pointer-events', 'auto', 'important');
    canvas.removeAttribute('aria-hidden');
  } else {
    canvas.style.setProperty('visibility', 'hidden', 'important');
    canvas.style.setProperty('opacity', '0', 'important');
    canvas.style.setProperty('pointer-events', 'none', 'important');
    canvas.setAttribute('aria-hidden', 'true');
  }

  window.dispatchEvent(new CustomEvent('gannzilla:wheel-visibility-v448', {
    detail: { visible: wheelVisible, source, build: BUILD },
  }));
  return true;
}

function setWheelVisibility(visible, source = 'button') {
  wheelVisible = Boolean(visible);
  persistVisibility(wheelVisible);
  updateButton();
  applyCanvasVisibility(source);
  window.requestAnimationFrame(() => applyCanvasVisibility(`${source}:frame`));
  window.setTimeout(() => applyCanvasVisibility(`${source}:40ms`), 40);
  window.setTimeout(() => applyCanvasVisibility(`${source}:140ms`), 140);
  toggleCount += 1;
  lastToggle = { visible: wheelVisible, source, at: Date.now() };
}

function createControl() {
  const wrap = document.createElement('div');
  wrap.id = WRAP_ID;

  const button = document.createElement('span');
  button.id = BUTTON_ID;
  button.tabIndex = 0;
  button.setAttribute('role', 'button');
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    setWheelVisibility(!wheelVisible, 'click');
  });
  button.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    setWheelVisibility(!wheelVisible, 'keyboard');
  });

  wrap.appendChild(button);
  updateButton();
  return wrap;
}

function mountInlineControl() {
  const strip = document.getElementById(ZOOM_STRIP_ID);
  if (!(strip instanceof HTMLElement)) return false;

  let wrap = document.getElementById(WRAP_ID);
  if (!(wrap instanceof HTMLElement)) wrap = createControl();
  if (wrap.parentElement !== strip) strip.appendChild(wrap);

  const move = document.getElementById(MOVE_WRAP_ID);
  wrap.style.setProperty('left', move instanceof HTMLElement ? '-68px' : '-34px', 'important');
  wrap.hidden = false;
  wrap.removeAttribute('aria-hidden');
  wrap.removeAttribute('data-gannzilla-v145-hidden');
  wrap.removeAttribute('data-gannzilla-toolbar-duplicate-hidden-v396');
  wrap.style.setProperty('display', 'block', 'important');
  wrap.style.setProperty('visibility', 'visible', 'important');
  wrap.style.setProperty('opacity', '1', 'important');
  wrap.style.setProperty('pointer-events', 'auto', 'important');
  strip.style.setProperty('overflow', 'visible', 'important');
  strip.dataset.gannzillaInlineWheelVisibilityV448 = 'true';

  updateButton();
  applyCanvasVisibility('mount');
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showWheelVisibilityControl', true) || window[STATE_KEY]) return;

  installStyle();
  let frame = 0;
  const refresh = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      installStyle();
      mountInlineControl();
    });
  };

  refresh();
  [20, 60, 140, 320, 700, 1400, 2800, 5000].forEach((delay) => window.setTimeout(refresh, delay));
  const observer = new MutationObserver(refresh);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('resize', refresh);
  document.addEventListener('fullscreenchange', refresh);
  document.addEventListener('webkitfullscreenchange', refresh);
  window.addEventListener('gannzilla:ring-two-numbering-refresh', refresh);
  window.addEventListener('gannzilla:property-change-v318', refresh);

  window.GANNZILLA_WHEEL_VISIBILITY_INLINE_V448 = true;
  window.__auditGannzillaWheelVisibilityInlineV448 = () => {
    const strip = document.getElementById(ZOOM_STRIP_ID);
    const wrap = document.getElementById(WRAP_ID);
    const button = document.getElementById(BUTTON_ID);
    const move = document.getElementById(MOVE_WRAP_ID);
    const canvas = findWheelCanvas() || markedCanvas;
    const rect = button?.getBoundingClientRect();
    const moveRect = move?.getBoundingClientRect();
    return {
      ok: Boolean(strip && wrap && button && canvas && rect?.width > 0 && rect?.height > 0),
      build: BUILD,
      enabled: boolParam('showWheelVisibilityControl', true),
      wheelVisible,
      inlineInsideVisibleZoomStrip: wrap?.parentElement === strip,
      fixedLeftOfMoveIcon: Boolean(rect && moveRect && rect.right <= moveRect.left + 4),
      wheelCanvasBound: Boolean(canvas),
      toggleCount,
      lastToggle,
    };
  };

  window[STATE_KEY] = { observer };
}

install();