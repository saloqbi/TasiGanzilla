const BUILD = 456;
const ROOT_ID = 'gannzilla-unified-wheel-tools-v453';
const FIRST_EYE_ID = 'gannzilla-unified-eye-v453';
const BUTTON_ID = 'gannzilla-unified-chart-eye-v456';
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';
const OLD_PANEL_EYE_IDS = ['gannzilla-panel-chart-eye-v454', 'gannzilla-panel-chart-eye-v455'];
const STYLE_ID = 'gannzilla-unified-chart-eye-style-v456';
const STATE_KEY = '__gannzillaUnifiedSecondChartEyeV456';
const CANONICAL_KEY = 'tasi-gannzilla-canonical-panel-v326';

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

function findPanel() {
  const panel = document.getElementById(PANEL_ID);
  return panel instanceof HTMLElement ? panel : null;
}

function findLayoutSection() {
  const section = findPanel()?.querySelector('.gz421-section[data-section-id="layout"]');
  return section instanceof HTMLElement ? section : null;
}

function findLayoutVisibleCheckbox() {
  const section = findLayoutSection();
  if (!(section instanceof HTMLElement)) return null;
  const checkbox = section.querySelector('.gz421-section-body input[type="checkbox"]')
    || section.querySelector('input[type="checkbox"]');
  return checkbox instanceof HTMLInputElement ? checkbox : null;
}

function storedVisibility() {
  try {
    const value = JSON.parse(localStorage.getItem(CANONICAL_KEY) || '{}');
    return value?.layout?.visible !== false;
  } catch (_) {
    return true;
  }
}

function chartVisible() {
  const checkbox = findLayoutVisibleCheckbox();
  return checkbox instanceof HTMLInputElement ? checkbox.checked : storedVisibility();
}

function eyeMarkup(visible) {
  if (!visible) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M3 5.2h3.2M3 5.2v3.2M21 5.2h-3.2M21 5.2v3.2M3 18.8h3.2M3 18.8v-3.2M21 18.8h-3.2M21 18.8v-3.2" fill="none" stroke="#6e7f89" stroke-width="1.1" stroke-linecap="round"/>
        <path d="M3.1 12s3.4-5.1 8.9-5.1 8.9 5.1 8.9 5.1-3.4 5.1-8.9 5.1S3.1 12 3.1 12Z" fill="#ece7c6" stroke="#8d823f" stroke-width="1.05"/>
        <circle cx="12" cy="12" r="2.9" fill="#7e919b" stroke="#4d626d" stroke-width="1"/>
        <path d="M4.2 4.2 19.8 19.8" stroke="#b13d35" stroke-width="2.05" stroke-linecap="round"/>
      </svg>`;
  }

  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3 5.2h3.2M3 5.2v3.2M21 5.2h-3.2M21 5.2v3.2M3 18.8h3.2M3 18.8v-3.2M21 18.8h-3.2M21 18.8v-3.2" fill="none" stroke="#3c7397" stroke-width="1.1" stroke-linecap="round"/>
      <path d="M3.1 12s3.4-5.1 8.9-5.1 8.9 5.1 8.9 5.1-3.4 5.1-8.9 5.1S3.1 12 3.1 12Z" fill="#dff4ff" stroke="#4f89ad" stroke-width="1.05"/>
      <circle cx="12" cy="12" r="3.1" fill="#4d89b5" stroke="#28658f" stroke-width="1"/>
      <circle cx="12" cy="12" r="1.2" fill="#173f5d"/>
      <circle cx="10.95" cy="10.95" r=".62" fill="#fff" opacity=".94"/>
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
    #${ROOT_ID} {
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
    #${BUTTON_ID}[data-chart-visible="false"] {
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

function updateButton() {
  const button = document.getElementById(BUTTON_ID);
  if (!(button instanceof HTMLElement)) return;

  const visible = chartVisible();
  const state = visible ? 'true' : 'false';
  if (button.dataset.chartVisible !== state) {
    button.innerHTML = eyeMarkup(visible);
    button.dataset.chartVisible = state;
  }

  const ar = language() === 'ar';
  button.title = visible
    ? (ar ? 'إخفاء المخطط' : 'Hide chart')
    : (ar ? 'إظهار المخطط' : 'Show chart');
  button.setAttribute('aria-label', button.title);
}

function clickLayoutVisible() {
  const checkbox = findLayoutVisibleCheckbox();
  if (checkbox instanceof HTMLInputElement) {
    checkbox.click();
    window.requestAnimationFrame(updateButton);
    window.setTimeout(updateButton, 60);
    return true;
  }

  const section = findLayoutSection();
  const header = section?.querySelector('.gz421-section-header');
  if (!(header instanceof HTMLElement)) return false;

  header.click();
  window.requestAnimationFrame(() => {
    const openedCheckbox = findLayoutVisibleCheckbox();
    if (openedCheckbox instanceof HTMLInputElement) openedCheckbox.click();
    window.requestAnimationFrame(updateButton);
  });
  return true;
}

function createButton() {
  const button = document.createElement('span');
  button.id = BUTTON_ID;
  button.tabIndex = 0;
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    clickLayoutVisible();
  });
  button.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    clickLayoutVisible();
  });
  return button;
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

function removeOldPanelEyes() {
  OLD_PANEL_EYE_IDS.forEach((id) => document.getElementById(id)?.remove());
  document.getElementById('gannzilla-panel-chart-eye-style-v454')?.remove();
  document.getElementById('gannzilla-panel-chart-eye-style-v455')?.remove();
}

function mount() {
  installStyle();
  removeOldPanelEyes();

  const root = document.getElementById(ROOT_ID);
  const firstEye = document.getElementById(FIRST_EYE_ID);
  if (!(root instanceof HTMLElement) || !(firstEye instanceof HTMLElement)) return false;

  // Mark the whole toolbar as UI so wheel-drag capture never steals its clicks.
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
  root.dataset.gannzillaSecondChartEyeV456 = 'true';
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showSecondChartEye', true) || window[STATE_KEY]) return;

  let frame = 0;
  let rootObserver = null;
  let observedRoot = null;

  const schedule = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      const mounted = mount();
      const root = document.getElementById(ROOT_ID);
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

  const onPanelChange = (event) => {
    if (event?.detail?.path && event.detail.path !== 'layout.visible') return;
    window.requestAnimationFrame(updateButton);
  };

  document.addEventListener('fullscreenchange', schedule);
  window.addEventListener('resize', schedule);
  window.addEventListener('gannzilla:reference-panel-change-v421', onPanelChange);
  window.addEventListener('gannzilla:canonical-property-change-v326', onPanelChange);

  window.GANNZILLA_UNIFIED_SECOND_CHART_EYE_V456 = true;
  window.__auditGannzillaUnifiedSecondChartEyeV456 = () => {
    const root = document.getElementById(ROOT_ID);
    const firstEye = document.getElementById(FIRST_EYE_ID);
    const secondEye = document.getElementById(BUTTON_ID);
    const rect = secondEye?.getBoundingClientRect();
    return {
      ok: Boolean(root && firstEye && secondEye && rect?.width > 0 && rect?.height > 0),
      build: BUILD,
      enabled: boolParam('showSecondChartEye', true),
      twoEyesVisible: Boolean(firstEye && secondEye),
      secondEyeImmediatelyAfterFirst: firstEye?.nextElementSibling === secondEye,
      chartVisible: chartVisible(),
      unifiedToolbarExcludedFromWheelDragCapture: root?.classList.contains('gannzilla-chart-toolbar-v328') || false,
      scopedObserverOnly: true,
    };
  };

  window[STATE_KEY] = { timers, get rootObserver() { return rootObserver; }, onPanelChange };
}

install();
