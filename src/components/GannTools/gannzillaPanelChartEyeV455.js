const BUILD = 455;
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';
const BUTTON_ID = 'gannzilla-panel-chart-eye-v455';
const OLD_BUTTON_ID = 'gannzilla-panel-chart-eye-v454';
const LANGUAGE_WRAP_ID = 'gannzilla-language-selector-wrap-v434';
const INFO_BUTTON_ID = 'gannzilla-about-info-button-v432';
const STYLE_ID = 'gannzilla-panel-chart-eye-style-v455';
const STATE_KEY = '__gannzillaPanelChartEyeV455';
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

function findPanel() {
  const panel = document.getElementById(PANEL_ID);
  return panel instanceof HTMLElement ? panel : null;
}

function findPresetBar() {
  const bar = findPanel()?.querySelector('.gz421-preset-bar');
  return bar instanceof HTMLElement ? bar : null;
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
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M2.4 12s3.7-5.8 9.6-5.8 9.6 5.8 9.6 5.8-3.7 5.8-9.6 5.8S2.4 12 2.4 12Z" fill="#ece7c6" stroke="#8d823f" stroke-width="1.1"/><circle cx="12" cy="12" r="3.05" fill="#7e919b" stroke="#4d626d" stroke-width="1"/><path d="M4.1 4.1 19.9 19.9" stroke="#b13d35" stroke-width="2.1" stroke-linecap="round"/></svg>';
  }
  return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M2.4 12s3.7-5.8 9.6-5.8 9.6 5.8 9.6 5.8-3.7 5.8-9.6 5.8S2.4 12 2.4 12Z" fill="#ffe66a" stroke="#b99619" stroke-width="1.1"/><circle cx="12" cy="12" r="3.25" fill="#4d89b5" stroke="#28658f" stroke-width="1"/><circle cx="12" cy="12" r="1.25" fill="#173f5d"/><circle cx="10.9" cy="10.9" r=".65" fill="#fff" opacity=".94"/></svg>';
}

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  const size = Math.round(numberParam('panelChartEyeSize', 28, 22, 38));
  const eyeColumn = Math.max(30, size + 4);
  style.textContent = `
    html body #${PANEL_ID}.gz421-panel .gz421-preset-bar {
      grid-template-columns: 21px minmax(0, 1fr) 27px 27px 27px 48px ${eyeColumn}px 142px 38px !important;
      gap: 4px !important;
      align-items: center !important;
      overflow: visible !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-preset-bar #${BUTTON_ID} {
      grid-column: 7 !important;
      position: relative !important;
      inset: auto !important;
      transform: none !important;
      width: ${size}px !important;
      min-width: ${size}px !important;
      max-width: ${size}px !important;
      height: ${size}px !important;
      min-height: ${size}px !important;
      max-height: ${size}px !important;
      margin: 0 auto !important;
      padding: 3px !important;
      border: 1px solid #8d969f !important;
      border-radius: 2px !important;
      background: linear-gradient(#ffffff, #dedede) !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      cursor: pointer !important;
      user-select: none !important;
      touch-action: manipulation !important;
      z-index: 2147483646 !important;
      box-sizing: border-box !important;
      box-shadow: 0 1px 2px rgba(0,0,0,.18) !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-preset-bar #${BUTTON_ID}:hover,
    html body #${PANEL_ID}.gz421-panel .gz421-preset-bar #${BUTTON_ID}[data-chart-visible="false"] {
      background: linear-gradient(#ffffff, #dcecff) !important;
      border-color: #477da8 !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-preset-bar #${BUTTON_ID} svg {
      width: ${Math.max(17, size - 7)}px !important;
      height: ${Math.max(17, size - 7)}px !important;
      display: block !important;
      pointer-events: none !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-preset-bar #${LANGUAGE_WRAP_ID} {
      grid-column: 8 !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-preset-bar #${INFO_BUTTON_ID} {
      grid-column: 9 !important;
    }
  `;
}

function updateButton() {
  const button = document.getElementById(BUTTON_ID);
  if (!(button instanceof HTMLElement)) return;
  const visible = chartVisible();
  const ar = language() === 'ar';
  const state = visible ? 'true' : 'false';
  if (button.dataset.chartVisible !== state) {
    button.innerHTML = eyeMarkup(visible);
    button.dataset.chartVisible = state;
  }
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

function mount() {
  installStyle();
  document.getElementById(OLD_BUTTON_ID)?.remove();
  document.getElementById('gannzilla-panel-chart-eye-style-v454')?.remove();

  const bar = findPresetBar();
  if (!(bar instanceof HTMLElement)) return false;

  let button = document.getElementById(BUTTON_ID);
  if (!(button instanceof HTMLElement)) button = createButton();

  const languageWrap = document.getElementById(LANGUAGE_WRAP_ID);
  const infoButton = document.getElementById(INFO_BUTTON_ID);
  const anchor = languageWrap instanceof HTMLElement && languageWrap.parentElement === bar
    ? languageWrap
    : infoButton instanceof HTMLElement && infoButton.parentElement === bar
      ? infoButton
      : null;

  if (button.parentElement !== bar || (anchor && button.nextElementSibling !== anchor)) {
    bar.insertBefore(button, anchor);
  }

  clearHiddenState(button);
  updateButton();
  bar.dataset.gannzillaPanelChartEyeV455 = 'true';
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showPanelChartEye', true) || window[STATE_KEY]) return;

  let frame = 0;
  let barObserver = null;
  let observedBar = null;

  const schedule = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      const mounted = mount();
      const bar = findPresetBar();
      if (mounted && bar instanceof HTMLElement && observedBar !== bar && typeof MutationObserver === 'function') {
        barObserver?.disconnect();
        observedBar = bar;
        barObserver = new MutationObserver(() => schedule());
        barObserver.observe(bar, { childList: true });
      }
    });
  };

  schedule();
  const timers = [50, 150, 400, 900, 1800, 3500, 5500].map((delay) => window.setTimeout(schedule, delay));

  const onPanelChange = (event) => {
    if (event?.detail?.path && event.detail.path !== 'layout.visible') return;
    window.requestAnimationFrame(updateButton);
  };
  const onResize = () => schedule();

  window.addEventListener('gannzilla:reference-panel-change-v421', onPanelChange);
  window.addEventListener('gannzilla:canonical-property-change-v326', onPanelChange);
  window.addEventListener('resize', onResize);

  window.GANNZILLA_PANEL_CHART_EYE_V455 = true;
  window.__auditGannzillaPanelChartEyeV455 = () => {
    const bar = findPresetBar();
    const button = document.getElementById(BUTTON_ID);
    const checkbox = findLayoutVisibleCheckbox();
    const rect = button?.getBoundingClientRect();
    return {
      ok: Boolean(bar && button && rect?.width > 0 && rect?.height > 0),
      build: BUILD,
      enabled: boolParam('showPanelChartEye', true),
      gridColumn: button ? window.getComputedStyle(button).gridColumnStart : null,
      secondEyeInsidePanelToolbar: button?.parentElement === bar,
      chartVisible: checkbox?.checked ?? storedVisibility(),
      controlsExistingLayoutVisibleCheckbox: Boolean(checkbox),
      scopedObserverOnly: true,
    };
  };

  window[STATE_KEY] = { timers, get barObserver() { return barObserver; }, onPanelChange, onResize };
}

install();
