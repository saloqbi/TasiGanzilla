const BUILD = 633;
const STATE_KEY = '__gannzillaCompactInterfaceV633';
const STYLE_ID = 'gannzilla-compact-interface-style-v633';
const PARAM = 'compactInterface';

const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';
const TOOLBAR_ID = 'gannzilla-unified-wheel-tools-v453';
const EYE_ID = 'gannzilla-unified-eye-v509';
const MOVE_ID = 'gannzilla-unified-move-v509';
const MOVE_WRAP_ID = 'gannzilla-unified-move-wrap-v509';
const ZOOM_GROUP_ID = 'gannzilla-unified-zoom-group-v509';
const ZOOM_OUT_ID = 'gannzilla-unified-zoom-out-v509';
const ZOOM_SELECT_ID = 'gannzilla-unified-zoom-select-v509';
const ZOOM_IN_ID = 'gannzilla-unified-zoom-in-v509';
const FULLSCREEN_ID = 'gannzilla-unified-fullscreen-v509';
const DRAW_ID = 'gannzilla-top-center-drawing-trigger-v471';
const COLOR_ID = 'gannzilla-wheel-color-toggle-v511';
const PANEL_EYE_ID = 'gannzilla-panel-visibility-eye-v511';
const CONNECTION_ID = 'gannzilla-connection-control-v439';
const LANGUAGE_CONTROL_ID = 'gannzilla-right-language-control-v438';
const LANGUAGE_BUTTON_ID = 'gannzilla-right-language-button-v438';

let timer = 0;
let applyCount = 0;
let lastApply = null;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function enabled() {
  const value = String(params().get(PARAM) || '').toLowerCase();
  return ['true', '1', 'yes', 'on'].includes(value);
}

function prepareUrlBeforePanelModule() {
  if (!enabled()) return false;
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('fullPanelExtraLarge', 'false');
    url.searchParams.set('fullPanelWidth', '420');
    url.searchParams.set('fullPanelFontSize', '13');
    url.searchParams.set('fullPanelRowHeight', '25');
    url.searchParams.set('rightLanguageWidth', '110');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    return true;
  } catch (_) {
    return false;
  }
}

function setImportant(element, property, value) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.style.getPropertyValue(property) === value
      && element.style.getPropertyPriority(property) === 'important') return false;
  element.style.setProperty(property, value, 'important');
  return true;
}

function ensureStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  } else if (style !== document.head.lastElementChild) {
    document.head.appendChild(style);
  }

  style.textContent = `
    html body #${PANEL_ID} {
      width: 420px !important;
      min-width: 420px !important;
      max-width: 420px !important;
      font-size: 13px !important;
    }
    html body #${PANEL_ID} .gz421-row {
      height: 25px !important;
      min-height: 25px !important;
      font-size: 12px !important;
    }
    html body #${PANEL_ID} .gz421-section-header {
      height: 27px !important;
      min-height: 27px !important;
      font-size: 13px !important;
      line-height: 22px !important;
    }
    html body #${PANEL_ID} .gz421-label,
    html body #${PANEL_ID} .gz421-value,
    html body #${PANEL_ID} input,
    html body #${PANEL_ID} select {
      font-size: 12px !important;
    }
    html body #${PANEL_ID} input:not([type='checkbox']):not([type='radio']):not([type='color']),
    html body #${PANEL_ID} select {
      height: 21px !important;
      min-height: 21px !important;
      line-height: 19px !important;
    }

    #${TOOLBAR_ID} {
      width: 190px !important;
      min-width: 190px !important;
      max-width: 190px !important;
      height: 26px !important;
      gap: 3px !important;
    }
    #${EYE_ID}, #${MOVE_ID}, #${ZOOM_OUT_ID}, #${ZOOM_IN_ID}, #${FULLSCREEN_ID},
    #${DRAW_ID}, #${COLOR_ID}, #${PANEL_EYE_ID}, #${CONNECTION_ID} {
      width: 26px !important;
      min-width: 26px !important;
      max-width: 26px !important;
      height: 26px !important;
      min-height: 26px !important;
      max-height: 26px !important;
      padding: 3px !important;
    }
    #${EYE_ID} svg, #${MOVE_ID} svg, #${ZOOM_OUT_ID} svg, #${ZOOM_IN_ID} svg,
    #${FULLSCREEN_ID} svg, #${DRAW_ID} svg, #${COLOR_ID} svg,
    #${PANEL_EYE_ID} svg, #${CONNECTION_ID} svg {
      width: 17px !important;
      height: 17px !important;
    }
    #${MOVE_WRAP_ID} {
      flex: 0 0 26px !important;
      width: 26px !important;
      height: 26px !important;
    }
    #${ZOOM_GROUP_ID} {
      flex: 0 0 98px !important;
      width: 98px !important;
      height: 26px !important;
    }
    #${ZOOM_SELECT_ID} {
      width: 46px !important;
      min-width: 46px !important;
      max-width: 46px !important;
      height: 26px !important;
      min-height: 26px !important;
      font-size: 12px !important;
      line-height: 24px !important;
    }
    #${LANGUAGE_CONTROL_ID} {
      width: 110px !important;
      min-width: 110px !important;
      max-width: 110px !important;
      height: 26px !important;
    }
    #${LANGUAGE_BUTTON_ID} {
      height: 26px !important;
      min-height: 26px !important;
      font-size: 13px !important;
    }
  `;
  return true;
}

function apply(source = 'apply') {
  if (!enabled()) return false;
  ensureStyle();

  const panel = document.getElementById(PANEL_ID);
  if (panel instanceof HTMLElement) {
    setImportant(panel, 'width', '420px');
    setImportant(panel, 'min-width', '420px');
    setImportant(panel, 'max-width', '420px');
    document.documentElement.style.setProperty('--gannzilla-property-panel-width', '420px', 'important');
  }

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    interfaceOnly: true,
    wheelChanged: false,
    panelWidth: panel instanceof HTMLElement ? getComputedStyle(panel).width : null,
    toolbarHeight: document.getElementById(TOOLBAR_ID) instanceof HTMLElement
      ? getComputedStyle(document.getElementById(TOOLBAR_ID)).height
      : null,
    at: Date.now(),
  };
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !enabled() || window[STATE_KEY]) return;

  [0, 40, 120, 300, 700, 1500, 3200].forEach((delay) => {
    window.setTimeout(() => apply(`boot-${delay}`), delay);
  });
  window.addEventListener('resize', () => apply('window-resize'), false);
  timer = window.setInterval(() => apply('interface-watch'), 500);

  window.GANNZILLA_COMPACT_INTERFACE_V633 = true;
  window.__auditGannzillaCompactInterfaceV633 = () => {
    const panel = document.getElementById(PANEL_ID);
    const toolbar = document.getElementById(TOOLBAR_ID);
    return {
      ok: enabled()
        && params().get('fullPanelExtraLarge') === 'false'
        && (!(panel instanceof HTMLElement) || Math.abs(panel.getBoundingClientRect().width - 420) < 1)
        && (!(toolbar instanceof HTMLElement) || Math.abs(toolbar.getBoundingClientRect().height - 26) < 1),
      build: BUILD,
      interfaceOnly: true,
      wheelChanged: false,
      panelWidth: panel instanceof HTMLElement ? panel.getBoundingClientRect().width : null,
      toolbarHeight: toolbar instanceof HTMLElement ? toolbar.getBoundingClientRect().height : null,
      applyCount,
      timerActive: Boolean(timer),
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, ensureStyle };
  apply('install');
}

prepareUrlBeforePanelModule();
window.setTimeout(install, 0);
