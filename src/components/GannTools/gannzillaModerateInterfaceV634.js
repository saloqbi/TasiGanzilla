const BUILD = 634;
const STATE_KEY = '__gannzillaModerateInterfaceV634';
const STYLE_ID = 'gannzilla-moderate-interface-style-v634';
const PARAM = 'moderateInterface';

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

const TOOLBAR_WIDTH = 190;
const CONTROL_SIZE = 26;
const ICON_SIZE = 17;
const ZOOM_GROUP_WIDTH = 98;
const ZOOM_SELECT_WIDTH = 46;
const LANGUAGE_WIDTH = 120;

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
    #${TOOLBAR_ID} {
      width: ${TOOLBAR_WIDTH}px !important;
      min-width: ${TOOLBAR_WIDTH}px !important;
      max-width: ${TOOLBAR_WIDTH}px !important;
      height: ${CONTROL_SIZE}px !important;
      gap: 3px !important;
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
      padding: 0 2px !important;
      font-size: 12px !important;
      line-height: 24px !important;
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
      font-size: 14px !important;
    }
  `;
  return true;
}

function apply(source = 'apply') {
  if (!enabled()) return false;
  ensureStyle();

  const toolbar = document.getElementById(TOOLBAR_ID);
  if (toolbar instanceof HTMLElement) {
    setImportant(toolbar, 'width', `${TOOLBAR_WIDTH}px`);
    setImportant(toolbar, 'min-width', `${TOOLBAR_WIDTH}px`);
    setImportant(toolbar, 'max-width', `${TOOLBAR_WIDTH}px`);
    setImportant(toolbar, 'height', `${CONTROL_SIZE}px`);
    setImportant(toolbar, 'gap', '3px');
  }

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    interfaceOnly: true,
    wheelChanged: false,
    panelOwnedByExistingV423Params: true,
    toolbarWidth: toolbar instanceof HTMLElement ? getComputedStyle(toolbar).width : null,
    toolbarHeight: toolbar instanceof HTMLElement ? getComputedStyle(toolbar).height : null,
    controlSize: CONTROL_SIZE,
    iconSize: ICON_SIZE,
    at: Date.now(),
  };
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !enabled() || window[STATE_KEY]) return;

  [0, 60, 160, 360, 800, 1600, 3200, 6400].forEach((delay) => {
    window.setTimeout(() => apply(`boot-${delay}`), delay);
  });
  window.addEventListener('resize', () => apply('window-resize'), false);
  timer = window.setInterval(() => apply('interface-watch'), 1000);

  window.GANNZILLA_MODERATE_INTERFACE_V634 = true;
  window.__auditGannzillaModerateInterfaceV634 = () => {
    const toolbar = document.getElementById(TOOLBAR_ID);
    const zoomSelect = document.getElementById(ZOOM_SELECT_ID);
    return {
      ok: enabled()
        && (!(toolbar instanceof HTMLElement)
          || (Math.abs(toolbar.getBoundingClientRect().width - TOOLBAR_WIDTH) < 1
            && Math.abs(toolbar.getBoundingClientRect().height - CONTROL_SIZE) < 1))
        && (!(zoomSelect instanceof HTMLElement)
          || Math.abs(zoomSelect.getBoundingClientRect().height - CONTROL_SIZE) < 1),
      build: BUILD,
      interfaceOnly: true,
      wheelChanged: false,
      panelTargetFromUrl: {
        width: Number(params().get('fullPanelWidth')),
        fontSize: Number(params().get('fullPanelFontSize')),
        rowHeight: Number(params().get('fullPanelRowHeight')),
      },
      toolbarTarget: { width: TOOLBAR_WIDTH, height: CONTROL_SIZE },
      controlSize: CONTROL_SIZE,
      iconSize: ICON_SIZE,
      timerActive: Boolean(timer),
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, ensureStyle };
  apply('install');
}

install();
