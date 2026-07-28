const BUILD = 578;
const STATE_KEY = '__gannzillaTasiTimeTrackerToolbarToggleV578';
const ROOT_ID = 'gannzilla-unified-wheel-tools-v453';
const MAIN_EYE_ID = 'gannzilla-unified-eye-v509';
const PANEL_EYE_ID = 'gannzilla-panel-visibility-eye-v511';
const BUTTON_ID = 'gannzilla-time-tracker-visibility-clock-v578';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-time-tracker-toolbar-toggle-style-v578';
const STORAGE_KEY = 'tasi-gannzilla-time-tracker-visible-v578';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function boolParam(name, fallback = false) {
  const query = params();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function enabled() {
  const query = params();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  return wheelMode
    && boolParam('timeTracker', false)
    && boolParam('showTimeTrackerVisibilityClock', true);
}

function readVisible() {
  const query = params();
  if (query.has('timeTrackerVisible')) {
    return ['true', '1', 'yes', 'on'].includes(String(query.get('timeTrackerVisible') || '').toLowerCase());
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

let trackerVisible = readVisible();
let toggleCount = 0;
let lastToggle = null;
let observer = null;
let frame = 0;

function clockMarkup(visible) {
  if (!visible) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2" fill="#ececec" stroke="#7e8b94" stroke-width="1.2"/><circle cx="12" cy="12" r="6.4" fill="#f7f7f7" stroke="#a8b0b6" stroke-width=".7"/><path d="M12 7.7v4.5l3.1 2" fill="none" stroke="#687983" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="1" fill="#687983"/><path d="M4.2 4.2 19.8 19.8" stroke="#b13d35" stroke-width="2" stroke-linecap="round"/></svg>';
  }
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2" fill="#fff7e5" stroke="#9b5a28" stroke-width="1.2"/><circle cx="12" cy="12" r="6.4" fill="#f6d59c" stroke="#c87b3c" stroke-width=".75"/><path d="M12 7.5v4.7l3.25 2.05" fill="none" stroke="#3b2416" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="1.05" fill="#7d3517"/><path d="M12 5.05v1.05M18.95 12H17.9M12 18.95V17.9M5.05 12H6.1" stroke="#9b4c21" stroke-width="1" stroke-linecap="round"/></svg>';
}

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = `
    #${ROOT_ID}{width:282px!important;min-width:282px!important;max-width:282px!important;transform:translateX(-68px)!important;transform-origin:top left!important;overflow:visible!important;}
    #${BUTTON_ID}{flex:0 0 30px!important;width:30px!important;min-width:30px!important;max-width:30px!important;height:30px!important;margin:0!important;padding:4px!important;border:1px solid #8d969f!important;border-radius:0!important;background:linear-gradient(#fff,#dedede)!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;user-select:none!important;box-shadow:0 1px 3px rgba(0,0,0,.18)!important;box-sizing:border-box!important;}
    #${BUTTON_ID}:hover,#${BUTTON_ID}[data-time-tracker-visible="false"]{background:linear-gradient(#fff,#dcecff)!important;border-color:#477da8!important;}
    #${BUTTON_ID} svg{width:20px!important;height:20px!important;display:block!important;pointer-events:none!important;}
  `;
}

function persist() {
  try { localStorage.setItem(STORAGE_KEY, trackerVisible ? 'true' : 'false'); } catch (_) { /* runtime only */ }
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('timeTrackerVisible', trackerVisible ? 'true' : 'false');
    url.searchParams.set('showTimeTrackerVisibilityClock', 'true');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime visibility remains active.
  }
}

function updateButton() {
  const button = document.getElementById(BUTTON_ID);
  if (!(button instanceof HTMLElement)) return false;
  button.innerHTML = clockMarkup(trackerVisible);
  button.dataset.timeTrackerVisible = trackerVisible ? 'true' : 'false';
  button.title = trackerVisible
    ? 'إخفاء لوحة الساعة / Hide time tracker'
    : 'إظهار لوحة الساعة / Show time tracker';
  button.setAttribute('aria-label', button.title);
  button.setAttribute('aria-pressed', trackerVisible ? 'true' : 'false');
  return true;
}

function applyVisibility(source = 'apply') {
  const host = document.getElementById(HOST_ID);
  if (!(host instanceof HTMLElement)) return false;

  host.dataset.gannzillaTasiTimeTrackerVisibleV578 = trackerVisible ? 'true' : 'false';
  host.setAttribute('aria-hidden', trackerVisible ? 'false' : 'true');

  if (trackerVisible) {
    host.style.removeProperty('content-visibility');
    host.style.removeProperty('translate');
    host.style.removeProperty('clip-path');
    host.style.removeProperty('contain');
    host.style.setProperty('visibility', 'visible', 'important');
    host.style.setProperty('opacity', '1', 'important');
    host.style.setProperty('pointer-events', 'auto', 'important');
  } else {
    host.style.setProperty('content-visibility', 'hidden', 'important');
    host.style.setProperty('translate', '-200vw -200vh', 'important');
    host.style.setProperty('clip-path', 'inset(50%)', 'important');
    host.style.setProperty('contain', 'strict', 'important');
    host.style.setProperty('visibility', 'hidden', 'important');
    host.style.setProperty('opacity', '0', 'important');
    host.style.setProperty('pointer-events', 'none', 'important');
  }

  document.documentElement.dataset.gannzillaTasiTimeTrackerVisibleV578 = trackerVisible ? 'true' : 'false';
  window.dispatchEvent(new CustomEvent('gannzilla:time-tracker-visibility-change-v578', {
    detail: { visible: trackerVisible, source, build: BUILD },
  }));
  return true;
}

function toggle() {
  trackerVisible = !trackerVisible;
  persist();
  updateButton();
  applyVisibility('button');
  toggleCount += 1;
  lastToggle = { visible: trackerVisible, at: Date.now() };
}

function createButton() {
  const button = document.createElement('span');
  button.id = BUTTON_ID;
  button.tabIndex = 0;
  button.setAttribute('role', 'button');
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
  if (!enabled()) return false;
  installStyle();
  const root = document.getElementById(ROOT_ID);
  const host = document.getElementById(HOST_ID);
  const panelEye = document.getElementById(PANEL_EYE_ID);
  const mainEye = document.getElementById(MAIN_EYE_ID);
  const anchor = panelEye instanceof HTMLElement ? panelEye : mainEye;
  if (!(root instanceof HTMLElement)
      || !(host instanceof HTMLElement)
      || !(anchor instanceof HTMLElement)) return false;

  let button = document.getElementById(BUTTON_ID);
  if (!(button instanceof HTMLElement)) button = createButton();
  if (button.parentElement !== root || anchor.nextElementSibling !== button) {
    root.insertBefore(button, anchor.nextElementSibling);
  }

  updateButton();
  applyVisibility('mount');
  root.dataset.gannzillaTimeTrackerToolbarToggleV578 = 'true';
  return true;
}

function schedule() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(mount);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true });
  schedule();
  [40, 120, 300, 700, 1500, 3000].forEach((delay) => setTimeout(schedule, delay));
  window.addEventListener('resize', schedule, false);
  document.addEventListener('fullscreenchange', schedule, false);

  window.GANNZILLA_TASI_TIME_TRACKER_TOOLBAR_TOGGLE_V578 = true;
  window.__auditGannzillaTasiTimeTrackerToolbarToggleV578 = () => {
    const root = document.getElementById(ROOT_ID);
    const host = document.getElementById(HOST_ID);
    const panelEye = document.getElementById(PANEL_EYE_ID);
    const mainEye = document.getElementById(MAIN_EYE_ID);
    const anchor = panelEye instanceof HTMLElement ? panelEye : mainEye;
    const button = document.getElementById(BUTTON_ID);
    const buttonRect = button?.getBoundingClientRect();
    const rootRect = root?.getBoundingClientRect();
    return {
      ok: Boolean(root
        && host
        && anchor
        && button
        && anchor.nextElementSibling === button
        && Math.round(buttonRect?.width || 0) === 30
        && Math.round(buttonRect?.height || 0) === 30
        && Math.round(rootRect?.width || 0) === 282),
      build: BUILD,
      trackerVisible,
      immediatelyAfterPanelEye: panelEye instanceof HTMLElement
        ? panelEye.nextElementSibling === button
        : null,
      button30px: Boolean(buttonRect
        && Math.round(buttonRect.width) === 30
        && Math.round(buttonRect.height) === 30),
      toolbarWidth: rootRect?.width || 0,
      toggleCount,
      lastToggle,
    };
  };

  window[STATE_KEY] = { schedule, toggle, get visible() { return trackerVisible; } };
}

install();
