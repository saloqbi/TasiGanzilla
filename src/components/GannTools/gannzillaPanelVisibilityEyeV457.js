const BUILD = 457;
const TOOLBAR_ID = 'gannzilla-unified-wheel-tools-v453';
const FIRST_EYE_ID = 'gannzilla-unified-eye-v453';
const BUTTON_ID = 'gannzilla-panel-visibility-eye-v457';
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';
const STYLE_ID = 'gannzilla-panel-visibility-eye-style-v457';
const STATE_KEY = '__gannzillaPanelVisibilityEyeV457';
const STORAGE_KEY = 'tasi-gannzilla-panel-visible-v457';
const OLD_EYE_IDS = [
  'gannzilla-panel-chart-eye-v454',
  'gannzilla-panel-chart-eye-v455',
  'gannzilla-unified-chart-eye-v456',
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

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function language() {
  return params().get('lang') === 'ar' ? 'ar' : 'en';
}

function initialPanelVisibility() {
  const query = params();
  if (query.has('panelVisible')) return boolParam('panelVisible', true);
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'false') return false;
    if (stored === 'true') return true;
  } catch (_) {
    // URL/default remains authoritative.
  }
  return true;
}

let panelVisible = initialPanelVisibility();
let toggleCount = 0;
let lastToggle = null;
let savedViewportLeft = '';
let savedViewportLeftPriority = '';
let savedPanelDisplay = 'flex';

function findPanel() {
  const panel = document.getElementById(PANEL_ID);
  return panel instanceof HTMLElement ? panel : null;
}

function findWheelCanvas() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-keyboard-mouse-control-v413="true"]',
    'canvas[data-gannzilla-native-wheel-scrollbars-hidden-v417="true"]',
    'canvas[data-gannzilla-unified-wheel-tools-v453="true"]',
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

function findWheelViewport() {
  const canvas = findWheelCanvas();
  if (!(canvas instanceof HTMLCanvasElement)) return null;

  let node = canvas.parentElement;
  while (node && node !== document.body) {
    if (node instanceof HTMLElement) {
      const style = window.getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      const positionedViewport = (style.position === 'absolute' || style.position === 'fixed')
        && rect.width > 280
        && rect.height > 180
        && node.contains(canvas);
      if (positionedViewport) return node;
    }
    node = node.parentElement;
  }

  const fallback = canvas.parentElement?.parentElement;
  return fallback instanceof HTMLElement ? fallback : null;
}

function eyeMarkup(visible) {
  if (!visible) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3.2" y="4" width="17.6" height="16" rx="1.4" fill="#ececec" stroke="#7e8b94" stroke-width="1.1"/>
        <rect x="4.8" y="5.6" width="4.2" height="12.8" fill="#c8d2d8" stroke="#7e8b94" stroke-width=".7"/>
        <path d="M5.8 12s2.3-3.8 6.2-3.8 6.2 3.8 6.2 3.8-2.3 3.8-6.2 3.8S5.8 12 5.8 12Z" fill="#ece7c6" stroke="#8d823f" stroke-width=".9"/>
        <circle cx="12" cy="12" r="2.2" fill="#7e919b" stroke="#4d626d" stroke-width=".8"/>
        <path d="M4.2 4.2 19.8 19.8" stroke="#b13d35" stroke-width="2" stroke-linecap="round"/>
      </svg>`;
  }

  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3.2" y="4" width="17.6" height="16" rx="1.4" fill="#f7fbfd" stroke="#477b9d" stroke-width="1.1"/>
      <rect x="4.8" y="5.6" width="4.2" height="12.8" fill="#d9edf8" stroke="#477b9d" stroke-width=".7"/>
      <path d="M5.8 12s2.3-3.8 6.2-3.8 6.2 3.8 6.2 3.8-2.3 3.8-6.2 3.8S5.8 12 5.8 12Z" fill="#dff4ff" stroke="#4f89ad" stroke-width=".9"/>
      <circle cx="12" cy="12" r="2.3" fill="#4d89b5" stroke="#28658f" stroke-width=".8"/>
      <circle cx="12" cy="12" r=".85" fill="#173f5d"/>
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
    #${TOOLBAR_ID} {
      width: 248px !important;
      min-width: 248px !important;
      max-width: 248px !important;
      transform: translateX(-34px) !important;
      transform-origin: top left !important;
      overflow: visible !important;
    }

    #${BUTTON_ID} {
      flex: 0 0 30px !important;
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
      box-sizing: border-box !important;
    }

    #${BUTTON_ID}:hover,
    #${BUTTON_ID}[data-panel-visible="false"] {
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

function persistVisibility() {
  try { localStorage.setItem(STORAGE_KEY, panelVisible ? 'true' : 'false'); }
  catch (_) { /* Runtime state remains active. */ }

  try {
    const url = new URL(window.location.href);
    url.searchParams.set('panelVisible', panelVisible ? 'true' : 'false');
    url.searchParams.set('showPanelVisibilityEye', 'true');
    url.searchParams.set('showSecondChartEye', 'false');
    url.searchParams.set('showPanelChartEye', 'false');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime visibility remains active.
  }
}

function updateButton() {
  const button = document.getElementById(BUTTON_ID);
  if (!(button instanceof HTMLElement)) return;
  const state = panelVisible ? 'true' : 'false';
  if (button.dataset.panelVisible !== state) {
    button.innerHTML = eyeMarkup(panelVisible);
    button.dataset.panelVisible = state;
  }

  const ar = language() === 'ar';
  button.title = panelVisible
    ? (ar ? 'إخفاء لوحة المخطط' : 'Hide chart panel')
    : (ar ? 'إظهار لوحة المخطط' : 'Show chart panel');
  button.setAttribute('aria-label', button.title);
}

function applyPanelVisibility(source = 'refresh') {
  const panel = findPanel();
  if (!(panel instanceof HTMLElement)) return false;

  if (!savedPanelDisplay) savedPanelDisplay = panel.style.getPropertyValue('display') || 'flex';

  if (panelVisible) {
    panel.hidden = false;
    panel.removeAttribute('aria-hidden');
    panel.style.setProperty('display', savedPanelDisplay || 'flex', 'important');
    panel.style.setProperty('visibility', 'visible', 'important');
    panel.style.setProperty('opacity', '1', 'important');
    panel.style.setProperty('pointer-events', 'auto', 'important');
  } else {
    panel.hidden = true;
    panel.setAttribute('aria-hidden', 'true');
    panel.style.setProperty('display', 'none', 'important');
    panel.style.setProperty('visibility', 'hidden', 'important');
    panel.style.setProperty('opacity', '0', 'important');
    panel.style.setProperty('pointer-events', 'none', 'important');
  }

  const viewport = findWheelViewport();
  if (viewport instanceof HTMLElement) {
    if (!savedViewportLeft) {
      savedViewportLeft = viewport.style.getPropertyValue('left') || '330px';
      savedViewportLeftPriority = viewport.style.getPropertyPriority('left') || 'important';
    }

    if (panelVisible) {
      viewport.style.setProperty('left', savedViewportLeft || '330px', savedViewportLeftPriority || 'important');
    } else {
      viewport.style.setProperty('left', '0px', 'important');
    }
  }

  document.documentElement.dataset.gannzillaPanelVisibleV457 = panelVisible ? 'true' : 'false';
  window.dispatchEvent(new CustomEvent('gannzilla:panel-visibility-v457', {
    detail: { visible: panelVisible, source, build: BUILD },
  }));
  window.dispatchEvent(new CustomEvent('gannzilla:layout-panel-visibility-change', {
    detail: { visible: panelVisible, source, build: BUILD },
  }));
  return true;
}

function setPanelVisibility(visible, source = 'button') {
  panelVisible = Boolean(visible);
  persistVisibility();
  updateButton();
  applyPanelVisibility(source);
  window.requestAnimationFrame(() => applyPanelVisibility(`${source}:frame`));
  window.setTimeout(() => applyPanelVisibility(`${source}:80ms`), 80);
  toggleCount += 1;
  lastToggle = { visible: panelVisible, source, at: Date.now() };
}

function createButton() {
  const button = document.createElement('span');
  button.id = BUTTON_ID;
  button.tabIndex = 0;
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    setPanelVisibility(!panelVisible, 'click');
  });
  button.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    setPanelVisibility(!panelVisible, 'keyboard');
  });
  return button;
}

function removeOldEyes() {
  OLD_EYE_IDS.forEach((id) => document.getElementById(id)?.remove());
  ['gannzilla-panel-chart-eye-style-v454', 'gannzilla-panel-chart-eye-style-v455', 'gannzilla-unified-chart-eye-style-v456']
    .forEach((id) => document.getElementById(id)?.remove());
}

function clearHiddenState(node) {
  if (!(node instanceof HTMLElement)) return;
  node.hidden = false;
  node.removeAttribute('aria-hidden');
  node.removeAttribute('data-gannzilla-v145-hidden');
  node.removeAttribute('data-gannzilla-v145-previous-display');
  node.removeAttribute('data-gannzilla-toolbar-duplicate-hidden-v396');
  node.removeAttribute('data-gannzilla-duplicate-toolbar-v393');
  node.style.setProperty('display', 'inline-flex', 'important');
  node.style.setProperty('visibility', 'visible', 'important');
  node.style.setProperty('opacity', '1', 'important');
  node.style.setProperty('pointer-events', 'auto', 'important');
}

function mount() {
  installStyle();
  removeOldEyes();

  const root = document.getElementById(TOOLBAR_ID);
  const firstEye = document.getElementById(FIRST_EYE_ID);
  if (!(root instanceof HTMLElement) || !(firstEye instanceof HTMLElement) || !findPanel()) return false;

  root.classList.add('gannzilla-chart-toolbar-v328');
  root.setAttribute('data-gannzilla-control-strip', 'true');
  root.style.setProperty('overflow', 'visible', 'important');

  let button = document.getElementById(BUTTON_ID);
  if (!(button instanceof HTMLElement)) button = createButton();
  if (button.parentElement !== root || firstEye.nextElementSibling !== button) {
    root.insertBefore(button, firstEye.nextElementSibling);
  }

  clearHiddenState(button);
  updateButton();
  applyPanelVisibility('mount');
  root.dataset.gannzillaPanelVisibilityEyeV457 = 'true';
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showPanelVisibilityEye', true) || window[STATE_KEY]) return;

  let frame = 0;
  let rootObserver = null;
  let observedRoot = null;

  const schedule = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      const mounted = mount();
      const root = document.getElementById(TOOLBAR_ID);
      if (mounted && root instanceof HTMLElement && observedRoot !== root && typeof MutationObserver === 'function') {
        rootObserver?.disconnect();
        observedRoot = root;
        rootObserver = new MutationObserver(schedule);
        rootObserver.observe(root, { childList: true });
      }
    });
  };

  schedule();
  const timers = [30, 100, 250, 600, 1200, 2400, 4500].map((delay) => window.setTimeout(schedule, delay));
  const onResize = () => {
    applyPanelVisibility('resize');
    schedule();
  };

  window.addEventListener('resize', onResize);
  document.addEventListener('fullscreenchange', schedule);

  window.GANNZILLA_PANEL_VISIBILITY_EYE_V457 = true;
  window.__auditGannzillaPanelVisibilityEyeV457 = () => {
    const root = document.getElementById(TOOLBAR_ID);
    const firstEye = document.getElementById(FIRST_EYE_ID);
    const secondEye = document.getElementById(BUTTON_ID);
    const panel = findPanel();
    const viewport = findWheelViewport();
    const rect = secondEye?.getBoundingClientRect();
    return {
      ok: Boolean(root && firstEye && secondEye && panel && rect?.width > 0 && rect?.height > 0),
      build: BUILD,
      enabled: boolParam('showPanelVisibilityEye', true),
      panelVisible,
      twoEyesVisible: Boolean(firstEye && secondEye),
      secondEyeImmediatelyAfterFirst: firstEye?.nextElementSibling === secondEye,
      panelDisplay: panel ? window.getComputedStyle(panel).display : null,
      viewportLeft: viewport ? window.getComputedStyle(viewport).left : null,
      toolbarExcludedFromWheelDragCapture: root?.classList.contains('gannzilla-chart-toolbar-v328') || false,
      toggleCount,
      lastToggle,
      scopedObserverOnly: true,
    };
  };

  window[STATE_KEY] = { timers, get rootObserver() { return rootObserver; }, onResize };
}

install();
