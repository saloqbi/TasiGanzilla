const BUILD = 454;
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';
const BUTTON_ID = 'gannzilla-panel-chart-eye-v454';
const INFO_BUTTON_ID = 'gannzilla-about-info-button-v432';
const STYLE_ID = 'gannzilla-panel-chart-eye-style-v454';
const STATE_KEY = '__gannzillaPanelChartEyeV454';
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

function findLayoutVisibleCheckbox() {
  const section = findPanel()?.querySelector('.gz421-section[data-section-id="layout"]');
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
        <path d="M2.4 12s3.7-5.8 9.6-5.8 9.6 5.8 9.6 5.8-3.7 5.8-9.6 5.8S2.4 12 2.4 12Z" fill="#ece7c6" stroke="#8d823f" stroke-width="1.1"/>
        <circle cx="12" cy="12" r="3.05" fill="#7e919b" stroke="#4d626d" stroke-width="1"/>
        <path d="M4.1 4.1 19.9 19.9" stroke="#b13d35" stroke-width="2.1" stroke-linecap="round"/>
      </svg>`;
  }

  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M2.4 12s3.7-5.8 9.6-5.8 9.6 5.8 9.6 5.8-3.7 5.8-9.6 5.8S2.4 12 2.4 12Z" fill="#ffe66a" stroke="#b99619" stroke-width="1.1"/>
      <circle cx="12" cy="12" r="3.25" fill="#4d89b5" stroke="#28658f" stroke-width="1"/>
      <circle cx="12" cy="12" r="1.25" fill="#173f5d"/>
      <circle cx="10.9" cy="10.9" r=".65" fill="#fff" opacity=".94"/>
    </svg>`;
}

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  const size = Math.round(numberParam('panelChartEyeSize', 28, 22, 38));
  style.textContent = `
    #${PANEL_ID} .gz421-preset-bar {
      position: relative !important;
      overflow: visible !important;
    }

    #${BUTTON_ID} {
      position: absolute !important;
      top: 50% !important;
      right: 42px !important;
      transform: translateY(-50%) !important;
      width: ${size}px !important;
      min-width: ${size}px !important;
      max-width: ${size}px !important;
      height: ${size}px !important;
      min-height: ${size}px !important;
      max-height: ${size}px !important;
      margin: 0 !important;
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
      z-index: 2147483645 !important;
      box-sizing: border-box !important;
      box-shadow: 0 1px 2px rgba(0,0,0,.18) !important;
    }

    #${BUTTON_ID}:hover,
    #${BUTTON_ID}[data-chart-visible="false"] {
      background: linear-gradient(#ffffff, #dcecff) !important;
      border-color: #477da8 !important;
    }

    #${BUTTON_ID} svg {
      width: ${Math.max(17, size - 7)}px !important;
      height: ${Math.max(17, size - 7)}px !important;
      display: block !important;
      pointer-events: none !important;
    }
  `;
}

function updateButton() {
  const button = document.getElementById(BUTTON_ID);
  if (!(button instanceof HTMLElement)) return;
  const visible = chartVisible();
  const ar = language() === 'ar';
  button.innerHTML = eyeMarkup(visible);
  button.dataset.chartVisible = visible ? 'true' : 'false';
  button.title = visible
    ? (ar ? 'إخفاء المخطط' : 'Hide chart')
    : (ar ? 'إظهار المخطط' : 'Show chart');
  button.setAttribute('aria-label', button.title);
}

function positionButton() {
  const bar = findPresetBar();
  const button = document.getElementById(BUTTON_ID);
  if (!(bar instanceof HTMLElement) || !(button instanceof HTMLElement)) return false;

  bar.style.setProperty('position', 'relative', 'important');
  bar.style.setProperty('overflow', 'visible', 'important');

  const info = document.getElementById(INFO_BUTTON_ID);
  if (info instanceof HTMLElement && info.parentElement === bar) {
    const barRect = bar.getBoundingClientRect();
    const infoRect = info.getBoundingClientRect();
    const buttonWidth = button.getBoundingClientRect().width || 28;
    if (barRect.width > 0 && infoRect.width > 0) {
      const left = Math.max(2, Math.round(infoRect.left - barRect.left - buttonWidth - 5));
      button.style.setProperty('left', `${left}px`, 'important');
      button.style.removeProperty('right');
      return true;
    }
  }

  button.style.setProperty('right', '42px', 'important');
  button.style.removeProperty('left');
  return false;
}

function toggleChart(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  const checkbox = findLayoutVisibleCheckbox();
  if (!(checkbox instanceof HTMLInputElement)) return false;
  checkbox.click();
  window.requestAnimationFrame(updateButton);
  window.setTimeout(updateButton, 40);
  return true;
}

function createButton() {
  const button = document.createElement('span');
  button.id = BUTTON_ID;
  button.tabIndex = 0;
  button.addEventListener('click', toggleChart);
  button.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    toggleChart(event);
  });
  return button;
}

function mount() {
  installStyle();
  const bar = findPresetBar();
  if (!(bar instanceof HTMLElement) || !findLayoutVisibleCheckbox()) return false;

  let button = document.getElementById(BUTTON_ID);
  if (!(button instanceof HTMLElement)) button = createButton();
  if (button.parentElement !== bar) bar.appendChild(button);

  button.hidden = false;
  button.removeAttribute('aria-hidden');
  button.style.setProperty('display', 'inline-flex', 'important');
  button.style.setProperty('visibility', 'visible', 'important');
  button.style.setProperty('opacity', '1', 'important');
  button.style.setProperty('pointer-events', 'auto', 'important');
  updateButton();
  positionButton();
  bar.dataset.gannzillaPanelChartEyeV454 = 'true';
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showPanelChartEye', true) || window[STATE_KEY]) return;

  const timers = [0, 50, 150, 400, 900, 1800, 3500].map((delay) => window.setTimeout(mount, delay));
  let resizeObserver = null;

  const attachResizeObserver = () => {
    if (resizeObserver || typeof ResizeObserver !== 'function') return;
    const bar = findPresetBar();
    if (!(bar instanceof HTMLElement)) return;
    resizeObserver = new ResizeObserver(() => positionButton());
    resizeObserver.observe(bar);
  };

  window.setTimeout(attachResizeObserver, 500);
  window.setTimeout(attachResizeObserver, 1600);

  const onPanelChange = (event) => {
    if (event?.detail?.path && event.detail.path !== 'layout.visible') return;
    updateButton();
  };
  const onResize = () => positionButton();

  window.addEventListener('gannzilla:reference-panel-change-v421', onPanelChange);
  window.addEventListener('gannzilla:canonical-property-change-v326', onPanelChange);
  window.addEventListener('resize', onResize);

  window.GANNZILLA_PANEL_CHART_EYE_V454 = true;
  window.__auditGannzillaPanelChartEyeV454 = () => {
    const panel = findPanel();
    const bar = findPresetBar();
    const button = document.getElementById(BUTTON_ID);
    const checkbox = findLayoutVisibleCheckbox();
    const rect = button?.getBoundingClientRect();
    return {
      ok: Boolean(panel && bar && button && checkbox && rect?.width > 0 && rect?.height > 0),
      build: BUILD,
      enabled: boolParam('showPanelChartEye', true),
      secondEyeInsidePanelToolbar: button?.parentElement === bar,
      chartVisible: checkbox?.checked ?? storedVisibility(),
      controlsExistingLayoutVisibleCheckbox: Boolean(checkbox),
      noDocumentWideObserver: true,
    };
  };

  window[STATE_KEY] = { timers, get resizeObserver() { return resizeObserver; }, onPanelChange, onResize };
}

install();
