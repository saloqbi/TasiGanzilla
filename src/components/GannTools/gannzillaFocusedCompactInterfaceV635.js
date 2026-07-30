const BUILD = 635;
const STATE_KEY = '__gannzillaFocusedCompactInterfaceV635';
const STYLE_ID = 'gannzilla-focused-compact-interface-style-v635';
const PARAM = 'focusedCompactInterface';

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

const PANEL_WIDTH = 400;
const PANEL_FONT_SIZE = 13;
const PANEL_ROW_HEIGHT = 24;
const CONTROL_SIZE = 24;
const ICON_SIZE = 16;
const TOOLBAR_WIDTH = 176;
const ZOOM_GROUP_WIDTH = 88;
const ZOOM_SELECT_WIDTH = 40;
const LANGUAGE_WIDTH = 108;

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

// This runs before V423 is evaluated because this module is imported first in main.jsx.
// It prevents the old Extra Large owner from installing and fighting the compact owner.
function disableLegacyExtraLargeBeforeImport() {
  if (!enabled()) return false;
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('fullPanelExtraLarge', 'false');
    url.searchParams.set('fullPanelWidth', String(PANEL_WIDTH));
    url.searchParams.set('fullPanelFontSize', String(PANEL_FONT_SIZE));
    url.searchParams.set('fullPanelRowHeight', String(PANEL_ROW_HEIGHT));
    url.searchParams.set('compactToolbarWidth', String(TOOLBAR_WIDTH));
    url.searchParams.set('rightLanguageWidth', String(LANGUAGE_WIDTH));
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
    :root {
      --gannzilla-property-panel-width: ${PANEL_WIDTH}px !important;
    }

    html body #${PANEL_ID}.gz421-panel,
    html body #${PANEL_ID} {
      width: ${PANEL_WIDTH}px !important;
      min-width: ${PANEL_WIDTH}px !important;
      max-width: ${PANEL_WIDTH}px !important;
      font-size: ${PANEL_FONT_SIZE}px !important;
      line-height: 1.2 !important;
    }

    html body #${PANEL_ID} .gz421-window-title {
      height: 32px !important;
      min-height: 32px !important;
      padding: 3px 9px !important;
      font-size: 15px !important;
      line-height: 26px !important;
    }

    html body #${PANEL_ID} .gz421-preset-bar {
      height: 27px !important;
      min-height: 27px !important;
      padding: 0 6px !important;
      font-size: 13px !important;
    }

    html body #${PANEL_ID} .gz421-preset-bar button {
      width: 21px !important;
      min-width: 21px !important;
      height: 21px !important;
      min-height: 21px !important;
      line-height: 19px !important;
    }

    html body #${PANEL_ID} .gz421-section-header {
      height: 26px !important;
      min-height: 26px !important;
      padding-top: 1px !important;
      padding-bottom: 1px !important;
      font-size: 13px !important;
      line-height: 22px !important;
    }

    html body #${PANEL_ID} .gz421-row {
      height: ${PANEL_ROW_HEIGHT}px !important;
      min-height: ${PANEL_ROW_HEIGHT}px !important;
      font-size: 12px !important;
      line-height: 1.15 !important;
    }

    html body #${PANEL_ID} .gz421-label,
    html body #${PANEL_ID} .gz421-value {
      padding-top: 1px !important;
      padding-bottom: 1px !important;
      font-size: 12px !important;
    }

    html body #${PANEL_ID} input:not([type='checkbox']):not([type='radio']):not([type='color']),
    html body #${PANEL_ID} select {
      height: 20px !important;
      min-height: 20px !important;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
      font-size: 12px !important;
      line-height: 18px !important;
    }

    html body #${PANEL_ID} input[type='checkbox'],
    html body #${PANEL_ID} input[type='radio'] {
      width: 15px !important;
      min-width: 15px !important;
      height: 15px !important;
      min-height: 15px !important;
    }

    #${TOOLBAR_ID} {
      width: ${TOOLBAR_WIDTH}px !important;
      min-width: ${TOOLBAR_WIDTH}px !important;
      max-width: ${TOOLBAR_WIDTH}px !important;
      height: ${CONTROL_SIZE}px !important;
      gap: 2px !important;
      padding: 0 !important;
      justify-content: flex-end !important;
    }

    #${EYE_ID}, #${MOVE_ID}, #${ZOOM_OUT_ID}, #${ZOOM_IN_ID}, #${FULLSCREEN_ID},
    #${DRAW_ID}, #${COLOR_ID}, #${PANEL_EYE_ID}, #${CONNECTION_ID} {
      width: ${CONTROL_SIZE}px !important;
      min-width: ${CONTROL_SIZE}px !important;
      max-width: ${CONTROL_SIZE}px !important;
      height: ${CONTROL_SIZE}px !important;
      min-height: ${CONTROL_SIZE}px !important;
      max-height: ${CONTROL_SIZE}px !important;
      padding: 3px !important;
    }

    #${EYE_ID} svg, #${MOVE_ID} svg, #${ZOOM_OUT_ID} svg, #${ZOOM_IN_ID} svg,
    #${FULLSCREEN_ID} svg, #${DRAW_ID} svg, #${COLOR_ID} svg,
    #${PANEL_EYE_ID} svg, #${CONNECTION_ID} svg {
      width: ${ICON_SIZE}px !important;
      height: ${ICON_SIZE}px !important;
    }

    #${MOVE_WRAP_ID} {
      flex: 0 0 ${CONTROL_SIZE}px !important;
      width: ${CONTROL_SIZE}px !important;
      height: ${CONTROL_SIZE}px !important;
    }

    #${ZOOM_GROUP_ID} {
      flex: 0 0 ${ZOOM_GROUP_WIDTH}px !important;
      width: ${ZOOM_GROUP_WIDTH}px !important;
      height: ${CONTROL_SIZE}px !important;
    }

    #${ZOOM_SELECT_ID} {
      width: ${ZOOM_SELECT_WIDTH}px !important;
      min-width: ${ZOOM_SELECT_WIDTH}px !important;
      max-width: ${ZOOM_SELECT_WIDTH}px !important;
      height: ${CONTROL_SIZE}px !important;
      min-height: ${CONTROL_SIZE}px !important;
      max-height: ${CONTROL_SIZE}px !important;
      padding: 0 1px !important;
      font-size: 11px !important;
      line-height: 22px !important;
    }

    #${LANGUAGE_CONTROL_ID} {
      width: ${LANGUAGE_WIDTH}px !important;
      min-width: ${LANGUAGE_WIDTH}px !important;
      max-width: ${LANGUAGE_WIDTH}px !important;
      height: ${CONTROL_SIZE}px !important;
    }

    #${LANGUAGE_BUTTON_ID} {
      height: ${CONTROL_SIZE}px !important;
      min-height: ${CONTROL_SIZE}px !important;
      max-height: ${CONTROL_SIZE}px !important;
      font-size: 12px !important;
    }
  `;
  return true;
}

function apply(source = 'apply') {
  if (!enabled()) return false;
  ensureStyle();

  const panel = document.getElementById(PANEL_ID);
  if (panel instanceof HTMLElement) {
    setImportant(panel, 'width', `${PANEL_WIDTH}px`);
    setImportant(panel, 'min-width', `${PANEL_WIDTH}px`);
    setImportant(panel, 'max-width', `${PANEL_WIDTH}px`);
    setImportant(panel, 'font-size', `${PANEL_FONT_SIZE}px`);
    document.documentElement.style.setProperty('--gannzilla-property-panel-width', `${PANEL_WIDTH}px`, 'important');
  }

  const toolbar = document.getElementById(TOOLBAR_ID);
  if (toolbar instanceof HTMLElement) {
    setImportant(toolbar, 'width', `${TOOLBAR_WIDTH}px`);
    setImportant(toolbar, 'min-width', `${TOOLBAR_WIDTH}px`);
    setImportant(toolbar, 'max-width', `${TOOLBAR_WIDTH}px`);
    setImportant(toolbar, 'height', `${CONTROL_SIZE}px`);
    setImportant(toolbar, 'gap', '2px');
  }

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    interfaceOnly: true,
    wheelChanged: false,
    legacyExtraLargeDisabled: params().get('fullPanelExtraLarge') === 'false',
    panelWidth: panel instanceof HTMLElement ? getComputedStyle(panel).width : null,
    toolbarWidth: toolbar instanceof HTMLElement ? getComputedStyle(toolbar).width : null,
    controlSize: CONTROL_SIZE,
    iconSize: ICON_SIZE,
    at: Date.now(),
  };
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !enabled() || window[STATE_KEY]) return;

  [0, 40, 120, 300, 700, 1500, 3200, 6400].forEach((delay) => {
    window.setTimeout(() => apply(`boot-${delay}`), delay);
  });
  window.addEventListener('resize', () => apply('window-resize'), false);
  timer = window.setInterval(() => apply('interface-watch'), 1500);

  window.GANNZILLA_FOCUSED_COMPACT_INTERFACE_V635 = true;
  window.__auditGannzillaFocusedCompactInterfaceV635 = () => {
    const panel = document.getElementById(PANEL_ID);
    const toolbar = document.getElementById(TOOLBAR_ID);
    return {
      ok: enabled()
        && params().get('fullPanelExtraLarge') === 'false'
        && (!(panel instanceof HTMLElement) || Math.abs(panel.getBoundingClientRect().width - PANEL_WIDTH) < 1)
        && (!(toolbar instanceof HTMLElement) || Math.abs(toolbar.getBoundingClientRect().height - CONTROL_SIZE) < 1),
      build: BUILD,
      interfaceOnly: true,
      wheelChanged: false,
      targets: {
        panelWidth: PANEL_WIDTH,
        panelFontSize: PANEL_FONT_SIZE,
        panelRowHeight: PANEL_ROW_HEIGHT,
        toolbarWidth: TOOLBAR_WIDTH,
        controlSize: CONTROL_SIZE,
        iconSize: ICON_SIZE,
      },
      timerActive: Boolean(timer),
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, ensureStyle };
  apply('install');
}

disableLegacyExtraLargeBeforeImport();
window.setTimeout(install, 0);
