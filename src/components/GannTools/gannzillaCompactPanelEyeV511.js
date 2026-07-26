const BUILD = 511;
const ROOT_ID = 'gannzilla-unified-wheel-tools-v453';
const MAIN_EYE_ID = 'gannzilla-unified-eye-v509';
const BUTTON_ID = 'gannzilla-panel-visibility-eye-v511';
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';
const STYLE_ID = 'gannzilla-compact-panel-eye-style-v511';
const STATE_KEY = '__gannzillaCompactPanelEyeV511';
const STORAGE_KEY = 'tasi-gannzilla-panel-visible-v511';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function language() {
  return params().get('lang') === 'ar' ? 'ar' : 'en';
}

function readVisible() {
  const query = params();
  if (query.has('panelVisible')) {
    return ['true', '1', 'yes', 'on'].includes(String(query.get('panelVisible') || '').toLowerCase());
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'false') return false;
    if (saved === 'true') return true;
  } catch (_) {
    // URL/default remains authoritative.
  }
  return true;
}

let panelVisible = readVisible();
let toggleCount = 0;
let lastToggle = null;

function findPanel() {
  const panel = document.getElementById(PANEL_ID);
  return panel instanceof HTMLElement ? panel : null;
}

function iconMarkup(visible) {
  if (!visible) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.2" y="4" width="17.6" height="16" rx="1.4" fill="#ececec" stroke="#7e8b94" stroke-width="1.1"/><rect x="4.8" y="5.6" width="4.2" height="12.8" fill="#c8d2d8" stroke="#7e8b94" stroke-width=".7"/><path d="M5.8 12s2.3-3.8 6.2-3.8 6.2 3.8 6.2 3.8-2.3 3.8-6.2 3.8S5.8 12 5.8 12Z" fill="#ece7c6" stroke="#8d823f" stroke-width=".9"/><circle cx="12" cy="12" r="2.2" fill="#7e919b" stroke="#4d626d" stroke-width=".8"/><path d="M4.2 4.2 19.8 19.8" stroke="#b13d35" stroke-width="2" stroke-linecap="round"/></svg>';
  }
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.2" y="4" width="17.6" height="16" rx="1.4" fill="#f7fbfd" stroke="#477b9d" stroke-width="1.1"/><rect x="4.8" y="5.6" width="4.2" height="12.8" fill="#d9edf8" stroke="#477b9d" stroke-width=".7"/><path d="M5.8 12s2.3-3.8 6.2-3.8 6.2 3.8 6.2 3.8-2.3 3.8-6.2 3.8S5.8 12 5.8 12Z" fill="#dff4ff" stroke="#4f89ad" stroke-width=".9"/><circle cx="12" cy="12" r="2.3" fill="#4d89b5" stroke="#28658f" stroke-width=".8"/><circle cx="12" cy="12" r=".85" fill="#173f5d"/></svg>';
}

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = `
    #${ROOT_ID}{width:248px!important;min-width:248px!important;max-width:248px!important;transform:translateX(-34px)!important;transform-origin:top left!important;overflow:visible!important;}
    #${BUTTON_ID}{flex:0 0 30px!important;width:30px!important;min-width:30px!important;max-width:30px!important;height:30px!important;margin:0!important;padding:4px!important;border:1px solid #8d969f!important;border-radius:0!important;background:linear-gradient(#fff,#dedede)!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;user-select:none!important;box-shadow:0 1px 3px rgba(0,0,0,.18)!important;box-sizing:border-box!important;}
    #${BUTTON_ID}:hover,#${BUTTON_ID}[data-panel-visible="false"]{background:linear-gradient(#fff,#dcecff)!important;border-color:#477da8!important;}
    #${BUTTON_ID} svg{width:20px!important;height:20px!important;display:block!important;pointer-events:none!important;}
  `;
}

function persist() {
  try { localStorage.setItem(STORAGE_KEY, panelVisible ? 'true' : 'false'); } catch (_) { /* runtime only */ }
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('panelVisible', panelVisible ? 'true' : 'false');
    url.searchParams.set('showPanelVisibilityEye', 'true');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime visibility remains active.
  }
}

function updateButton() {
  const button = document.getElementById(BUTTON_ID);
  if (!(button instanceof HTMLElement)) return;
  button.innerHTML = iconMarkup(panelVisible);
  button.dataset.panelVisible = panelVisible ? 'true' : 'false';
  const ar = language() === 'ar';
  button.title = panelVisible
    ? (ar ? 'إخفاء لوحة المخطط' : 'Hide chart panel')
    : (ar ? 'إظهار لوحة المخطط' : 'Show chart panel');
  button.setAttribute('aria-label', button.title);
}

function applyVisibility(source = 'apply') {
  const panel = findPanel();
  if (!(panel instanceof HTMLElement)) return false;
  panel.hidden = !panelVisible;
  panel.setAttribute('aria-hidden', panelVisible ? 'false' : 'true');
  panel.style.setProperty('display', panelVisible ? 'flex' : 'none', 'important');
  panel.style.setProperty('visibility', panelVisible ? 'visible' : 'hidden', 'important');
  panel.style.setProperty('opacity', panelVisible ? '1' : '0', 'important');
  panel.style.setProperty('pointer-events', panelVisible ? 'auto' : 'none', 'important');
  document.documentElement.dataset.gannzillaPanelVisibleV511 = panelVisible ? 'true' : 'false';
  window.dispatchEvent(new CustomEvent('gannzilla:layout-panel-visibility-change', {
    detail: { visible: panelVisible, source, build: BUILD },
  }));
  return true;
}

function toggle() {
  panelVisible = !panelVisible;
  persist();
  updateButton();
  applyVisibility('button');
  toggleCount += 1;
  lastToggle = { visible: panelVisible, at: Date.now() };
}

function createButton() {
  const button = document.createElement('span');
  button.id = BUTTON_ID;
  button.tabIndex = 0;
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggle();
  });
  button.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    toggle();
  });
  return button;
}

function mount() {
  installStyle();
  const root = document.getElementById(ROOT_ID);
  const mainEye = document.getElementById(MAIN_EYE_ID);
  if (!(root instanceof HTMLElement) || !(mainEye instanceof HTMLElement) || !findPanel()) return false;
  root.classList.add('gannzilla-chart-toolbar-v328');
  root.dataset.gannzillaControlStrip = 'true';
  let button = document.getElementById(BUTTON_ID);
  if (!(button instanceof HTMLElement)) button = createButton();
  if (button.parentElement !== root || mainEye.nextElementSibling !== button) {
    root.insertBefore(button, mainEye.nextElementSibling);
  }
  updateButton();
  applyVisibility('mount');
  root.dataset.gannzillaCompactPanelEyeV511 = 'true';
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode() || window[STATE_KEY]) return;
  let frame = 0;
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(mount);
  };
  schedule();
  [40, 120, 300, 700, 1500, 3000].forEach((delay) => setTimeout(schedule, delay));
  window.addEventListener('resize', schedule);
  document.addEventListener('fullscreenchange', schedule);

  window.GANNZILLA_COMPACT_PANEL_EYE_V511 = true;
  window.__auditGannzillaCompactPanelEyeV511 = () => {
    const root = document.getElementById(ROOT_ID);
    const mainEye = document.getElementById(MAIN_EYE_ID);
    const button = document.getElementById(BUTTON_ID);
    const rect = button?.getBoundingClientRect();
    return {
      ok: Boolean(root && mainEye && button && rect?.width > 0 && mainEye.nextElementSibling === button),
      build: BUILD,
      panelVisible,
      immediatelyAfterMainEye: mainEye?.nextElementSibling === button,
      button30px: Boolean(rect && Math.round(rect.width) === 30 && Math.round(rect.height) === 30),
      toggleCount,
      lastToggle,
    };
  };
  window[STATE_KEY] = { schedule };
}

install();