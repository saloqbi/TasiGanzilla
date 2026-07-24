const BUILD = 451;
const ZOOM_STRIP_ID = 'gannzilla-zoom-fullscreen-strip-v443';
const CONNECTION_CONTROL_ID = 'gannzilla-connection-control-v439';
const OLD_WRAP_ID = 'gannzilla-wheel-visibility-inline-v448';
const CONTROL_ID = 'gannzilla-wheel-visibility-fixed-v451';
const BUTTON_ID = 'gannzilla-wheel-visibility-fixed-button-v451';
const STYLE_ID = 'gannzilla-wheel-visibility-fixed-style-v451';
const STATE_KEY = '__gannzillaWheelVisibilityFixedV451';
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

function initialVisibility() {
  if (params().has('wheelVisible')) return boolParam('wheelVisible', true);
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'false') return false;
    if (stored === 'true') return true;
  } catch (_) {
    // The URL/default remains authoritative.
  }
  return true;
}

let wheelVisible = initialVisibility();
let markedCanvas = null;
let toggleCount = 0;
let lastToggle = null;

function findWheelCanvas() {
  if (markedCanvas instanceof HTMLCanvasElement && markedCanvas.isConnected) return markedCanvas;

  const preferred = document.querySelector([
    'canvas[data-gannzilla-keyboard-mouse-control-v413="true"]',
    'canvas[data-gannzilla-native-wheel-scrollbars-hidden-v417="true"]',
    'canvas[data-gannzilla-wheel-visibility-fixed-v451="true"]',
  ].join(','));
  if (preferred instanceof HTMLCanvasElement && !preferred.closest?.('aside')) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement) || canvas.closest?.('aside')) return false;
      const style = window.getComputedStyle(canvas);
      return canvas.width > 300 && canvas.height > 300 && style.display !== 'none';
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
    #${CONTROL_ID} {
      position: fixed !important;
      width: 30px !important;
      min-width: 30px !important;
      max-width: 30px !important;
      height: 30px !important;
      min-height: 30px !important;
      max-height: 30px !important;
      z-index: 2147483647 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      overflow: visible !important;
      direction: ltr !important;
      box-sizing: border-box !important;
      isolation: isolate !important;
    }

    #${CONTROL_ID}, #${CONTROL_ID} * { box-sizing: border-box !important; }

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
  catch (_) { /* Runtime state remains active. */ }

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

function applyVisibility(source = 'refresh') {
  const canvas = findWheelCanvas() || markedCanvas;
  if (!(canvas instanceof HTMLCanvasElement)) return false;

  markedCanvas = canvas;
  canvas.dataset.gannzillaWheelVisibilityFixedV451 = 'true';
  canvas.dataset.gannzillaWheelVisibleV451 = wheelVisible ? 'true' : 'false';

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

  const detail = { visible: wheelVisible, source, build: BUILD };
  window.dispatchEvent(new CustomEvent('gannzilla:wheel-visibility-v451', { detail }));
  window.dispatchEvent(new CustomEvent('gannzilla:wheel-visibility-v448', { detail }));
  return true;
}

function setVisibility(visible, source = 'button') {
  wheelVisible = Boolean(visible);
  persistVisibility(wheelVisible);
  updateButton();
  applyVisibility(source);
  window.requestAnimationFrame(() => applyVisibility(`${source}:frame`));
  window.setTimeout(() => applyVisibility(`${source}:40ms`), 40);
  window.setTimeout(() => applyVisibility(`${source}:140ms`), 140);
  toggleCount += 1;
  lastToggle = { visible: wheelVisible, source, at: Date.now() };
}

function createControl() {
  const control = document.createElement('div');
  control.id = CONTROL_ID;

  const button = document.createElement('span');
  button.id = BUTTON_ID;
  button.tabIndex = 0;
  // Intentionally no role="button": the legacy top-row cleaner only targets buttons/role=button.
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    setVisibility(!wheelVisible, 'click');
  });
  button.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    setVisibility(!wheelVisible, 'keyboard');
  });

  control.appendChild(button);
  document.body.appendChild(control);
  updateButton();
  return control;
}

function clearLegacyEye() {
  document.getElementById(OLD_WRAP_ID)?.remove();
  document.getElementById('gannzilla-wheel-visibility-inline-style-v448')?.remove();
  document.getElementById('gannzilla-wheel-visibility-guard-style-v449')?.remove();
}

function positionControl(control) {
  const strip = document.getElementById(ZOOM_STRIP_ID);
  if (strip instanceof HTMLElement) {
    const rect = strip.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      control.style.setProperty('left', `${Math.max(2, Math.round(rect.left - 34))}px`, 'important');
      control.style.setProperty('top', `${Math.round(rect.top + Math.max(0, (rect.height - 30) / 2))}px`, 'important');
      control.style.removeProperty('right');
      return true;
    }
  }

  const connection = document.getElementById(CONNECTION_CONTROL_ID);
  if (connection instanceof HTMLElement) {
    const rect = connection.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      control.style.setProperty('left', `${Math.max(2, Math.round(rect.left - 214 - 8))}px`, 'important');
      control.style.setProperty('top', `${Math.round(rect.top)}px`, 'important');
      control.style.removeProperty('right');
      return false;
    }
  }

  const languageRight = Math.round(numberParam('rightLanguageRight', 10, 2, 160));
  const languageWidth = Math.round(numberParam('rightLanguageWidth', 136, 104, 200));
  const connectionGap = Math.round(numberParam('connectionControlGap', 4, 0, 20));
  const zoomGap = Math.round(numberParam('zoomFullscreenGap', 4, 0, 20));
  const top = Math.round(numberParam('rightLanguageTop', 8, 2, 160));
  control.style.setProperty('right', `${languageRight + languageWidth + connectionGap + 30 + zoomGap + 180 + 4}px`, 'important');
  control.style.setProperty('top', `${top}px`, 'important');
  control.style.removeProperty('left');
  return false;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showWheelVisibilityControl', true) || window[STATE_KEY]) return;

  installStyle();
  clearLegacyEye();
  let control = document.getElementById(CONTROL_ID);
  if (!(control instanceof HTMLElement)) control = createControl();

  let frame = 0;
  let observer = null;
  const refresh = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      installStyle();
      clearLegacyEye();
      let current = document.getElementById(CONTROL_ID);
      if (!(current instanceof HTMLElement)) current = createControl();
      current.hidden = false;
      current.removeAttribute('aria-hidden');
      current.removeAttribute('data-gannzilla-v145-hidden');
      current.removeAttribute('data-gannzilla-toolbar-duplicate-hidden-v396');
      current.style.setProperty('display', 'block', 'important');
      current.style.setProperty('visibility', 'visible', 'important');
      current.style.setProperty('opacity', '1', 'important');
      current.style.setProperty('pointer-events', 'auto', 'important');
      positionControl(current);
      updateButton();
      applyVisibility('refresh');
    });
  };

  refresh();
  [20, 60, 140, 320, 700, 1400, 2800, 5000].forEach((delay) => window.setTimeout(refresh, delay));
  observer = new MutationObserver(refresh);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('resize', refresh);
  window.addEventListener('scroll', refresh, true);
  document.addEventListener('fullscreenchange', refresh);
  document.addEventListener('webkitfullscreenchange', refresh);
  window.addEventListener('gannzilla:ring-two-numbering-refresh', refresh);

  window.GANNZILLA_WHEEL_VISIBILITY_FIXED_V451 = true;
  window.__auditGannzillaWheelVisibilityFixedV451 = () => {
    const controlNode = document.getElementById(CONTROL_ID);
    const button = document.getElementById(BUTTON_ID);
    const strip = document.getElementById(ZOOM_STRIP_ID);
    const canvas = findWheelCanvas() || markedCanvas;
    const rect = button?.getBoundingClientRect();
    const stripRect = strip?.getBoundingClientRect();
    return {
      ok: Boolean(controlNode && button && canvas && rect?.width > 0 && rect?.height > 0),
      build: BUILD,
      enabled: boolParam('showWheelVisibilityControl', true),
      wheelVisible,
      fixedLeftOfVisibleStrip: Boolean(rect && stripRect && rect.right <= stripRect.left + 2),
      protectedFromLegacyCleaner: button?.getAttribute('role') !== 'button' && button?.tagName !== 'BUTTON',
      canvasBound: Boolean(canvas),
      toggleCount,
      lastToggle,
    };
  };

  window[STATE_KEY] = { observer };
}

install();
