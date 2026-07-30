const BUILD = 637;
const STATE_KEY = '__gannzillaUniformTopIconStripV637';
const STYLE_ID = 'gannzilla-uniform-top-icon-strip-style-v637';
const PARAM = 'uniformTopIcons';

const TOOLBAR_ID = 'gannzilla-unified-wheel-tools-v453';
const MAIN_EYE_ID = 'gannzilla-unified-eye-v509';
const PANEL_EYE_ID = 'gannzilla-panel-visibility-eye-v511';
const MOVE_WRAP_ID = 'gannzilla-unified-move-wrap-v509';
const MOVE_ID = 'gannzilla-unified-move-v509';
const ZOOM_GROUP_ID = 'gannzilla-unified-zoom-group-v509';
const ZOOM_OUT_ID = 'gannzilla-unified-zoom-out-v509';
const ZOOM_SELECT_ID = 'gannzilla-unified-zoom-select-v509';
const ZOOM_IN_ID = 'gannzilla-unified-zoom-in-v509';
const FULLSCREEN_ID = 'gannzilla-unified-fullscreen-v509';
const DRAW_ID = 'gannzilla-top-center-drawing-trigger-v471';
const COLOR_ID = 'gannzilla-wheel-color-toggle-v511';
const CONNECTION_WRAP_ID = 'gannzilla-connection-control-v439';
const CONNECTION_BUTTON_ID = 'gannzilla-connection-button-v439';
const LANGUAGE_WRAP_ID = 'gannzilla-right-language-control-v438';
const LANGUAGE_BUTTON_ID = 'gannzilla-right-language-button-v438';
const ABOUT_INFO_ID = 'gannzilla-about-info-button-v432';

const CONTROL_SIZE = 24;
const ICON_SIZE = 15;
const GAP = 3;
const ZOOM_SELECT_WIDTH = 40;
const ZOOM_GROUP_WIDTH = CONTROL_SIZE * 2 + ZOOM_SELECT_WIDTH;
const TOOLBAR_WIDTH = CONTROL_SIZE * 4 + ZOOM_GROUP_WIDTH + GAP * 4;

let frame = 0;
let timer = 0;
let observer = null;
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

  const squareControls = [
    MAIN_EYE_ID,
    PANEL_EYE_ID,
    MOVE_ID,
    ZOOM_OUT_ID,
    ZOOM_IN_ID,
    FULLSCREEN_ID,
    DRAW_ID,
    COLOR_ID,
    CONNECTION_BUTTON_ID,
  ].map((id) => `#${id}`).join(',');

  const squareSvgs = [
    MAIN_EYE_ID,
    PANEL_EYE_ID,
    MOVE_ID,
    ZOOM_OUT_ID,
    ZOOM_IN_ID,
    FULLSCREEN_ID,
    DRAW_ID,
    COLOR_ID,
    CONNECTION_BUTTON_ID,
  ].map((id) => `#${id} svg`).join(',');

  style.textContent = `
    #${TOOLBAR_ID} {
      width: ${TOOLBAR_WIDTH}px !important;
      min-width: ${TOOLBAR_WIDTH}px !important;
      max-width: ${TOOLBAR_WIDTH}px !important;
      height: ${CONTROL_SIZE}px !important;
      min-height: ${CONTROL_SIZE}px !important;
      max-height: ${CONTROL_SIZE}px !important;
      display: flex !important;
      align-items: center !important;
      gap: ${GAP}px !important;
      padding: 0 !important;
      margin: 0 !important;
      overflow: visible !important;
      transform: none !important;
      box-sizing: border-box !important;
    }

    ${squareControls} {
      flex: 0 0 ${CONTROL_SIZE}px !important;
      width: ${CONTROL_SIZE}px !important;
      min-width: ${CONTROL_SIZE}px !important;
      max-width: ${CONTROL_SIZE}px !important;
      height: ${CONTROL_SIZE}px !important;
      min-height: ${CONTROL_SIZE}px !important;
      max-height: ${CONTROL_SIZE}px !important;
      margin: 0 !important;
      padding: 3px !important;
      border: 1px solid #8d969f !important;
      border-radius: 0 !important;
      background: linear-gradient(#ffffff, #dedede) !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      line-height: 1 !important;
      box-shadow: 0 1px 3px rgba(0,0,0,.18) !important;
      box-sizing: border-box !important;
      vertical-align: top !important;
    }

    ${squareSvgs} {
      width: ${ICON_SIZE}px !important;
      min-width: ${ICON_SIZE}px !important;
      max-width: ${ICON_SIZE}px !important;
      height: ${ICON_SIZE}px !important;
      min-height: ${ICON_SIZE}px !important;
      max-height: ${ICON_SIZE}px !important;
      display: block !important;
      margin: 0 !important;
      pointer-events: none !important;
    }

    #${MOVE_WRAP_ID} {
      flex: 0 0 ${CONTROL_SIZE}px !important;
      width: ${CONTROL_SIZE}px !important;
      min-width: ${CONTROL_SIZE}px !important;
      max-width: ${CONTROL_SIZE}px !important;
      height: ${CONTROL_SIZE}px !important;
      min-height: ${CONTROL_SIZE}px !important;
      max-height: ${CONTROL_SIZE}px !important;
      margin: 0 !important;
    }

    #${ZOOM_GROUP_ID} {
      flex: 0 0 ${ZOOM_GROUP_WIDTH}px !important;
      width: ${ZOOM_GROUP_WIDTH}px !important;
      min-width: ${ZOOM_GROUP_WIDTH}px !important;
      max-width: ${ZOOM_GROUP_WIDTH}px !important;
      height: ${CONTROL_SIZE}px !important;
      min-height: ${CONTROL_SIZE}px !important;
      max-height: ${CONTROL_SIZE}px !important;
      display: flex !important;
      align-items: center !important;
      gap: 0 !important;
      margin: 0 !important;
    }

    #${ZOOM_SELECT_ID} {
      flex: 0 0 ${ZOOM_SELECT_WIDTH}px !important;
      width: ${ZOOM_SELECT_WIDTH}px !important;
      min-width: ${ZOOM_SELECT_WIDTH}px !important;
      max-width: ${ZOOM_SELECT_WIDTH}px !important;
      height: ${CONTROL_SIZE}px !important;
      min-height: ${CONTROL_SIZE}px !important;
      max-height: ${CONTROL_SIZE}px !important;
      margin: 0 !important;
      padding: 0 1px !important;
      border: 1px solid #8d969f !important;
      border-radius: 0 !important;
      font: 700 11px/${CONTROL_SIZE - 2}px Arial, "Segoe UI", Tahoma, sans-serif !important;
      text-align: center !important;
      text-align-last: center !important;
      box-sizing: border-box !important;
    }

    #${CONNECTION_WRAP_ID} {
      width: ${CONTROL_SIZE}px !important;
      min-width: ${CONTROL_SIZE}px !important;
      max-width: ${CONTROL_SIZE}px !important;
      height: ${CONTROL_SIZE}px !important;
      min-height: ${CONTROL_SIZE}px !important;
      max-height: ${CONTROL_SIZE}px !important;
      margin: 0 !important;
      padding: 0 !important;
      display: block !important;
      box-sizing: border-box !important;
    }

    #${LANGUAGE_WRAP_ID}, #${LANGUAGE_BUTTON_ID} {
      height: ${CONTROL_SIZE}px !important;
      min-height: ${CONTROL_SIZE}px !important;
      max-height: ${CONTROL_SIZE}px !important;
      box-sizing: border-box !important;
    }

    html body #gannzilla-pixel-perfect-reference-panel-v421 .gz421-preset-bar #${ABOUT_INFO_ID} {
      width: ${CONTROL_SIZE}px !important;
      min-width: ${CONTROL_SIZE}px !important;
      max-width: ${CONTROL_SIZE}px !important;
      height: ${CONTROL_SIZE}px !important;
      min-height: ${CONTROL_SIZE}px !important;
      max-height: ${CONTROL_SIZE}px !important;
      font: 900 17px/${CONTROL_SIZE - 2}px Arial, "Segoe UI", sans-serif !important;
    }
  `;
  return true;
}

function positionStrip() {
  const toolbar = document.getElementById(TOOLBAR_ID);
  const draw = document.getElementById(DRAW_ID);
  const color = document.getElementById(COLOR_ID);
  const connection = document.getElementById(CONNECTION_WRAP_ID);
  const language = document.getElementById(LANGUAGE_WRAP_ID);

  if (!(toolbar instanceof HTMLElement)) return null;

  const languageRect = language instanceof HTMLElement ? language.getBoundingClientRect() : null;
  const top = languageRect && languageRect.height > 0
    ? Math.round(languageRect.top)
    : Math.round(toolbar.getBoundingClientRect().top || 8);

  let connectionLeft = null;
  if (languageRect && languageRect.width > 0) {
    connectionLeft = Math.max(2, Math.round(languageRect.left - CONTROL_SIZE - GAP));
    if (connection instanceof HTMLElement) {
      setImportant(connection, 'left', `${connectionLeft}px`);
      setImportant(connection, 'top', `${top}px`);
      connection.style.removeProperty('right');
    }
    setImportant(language, 'top', `${top}px`);
  } else if (connection instanceof HTMLElement) {
    const connectionRect = connection.getBoundingClientRect();
    connectionLeft = Math.round(connectionRect.left);
    setImportant(connection, 'top', `${top}px`);
  }

  const toolbarLeft = connectionLeft == null
    ? Math.round(toolbar.getBoundingClientRect().left)
    : Math.max(2, connectionLeft - TOOLBAR_WIDTH - GAP);

  setImportant(toolbar, 'left', `${toolbarLeft}px`);
  setImportant(toolbar, 'top', `${top}px`);
  toolbar.style.removeProperty('right');
  setImportant(toolbar, 'transform', 'none');

  const drawLeft = Math.max(2, toolbarLeft - CONTROL_SIZE - GAP);
  const colorLeft = Math.max(2, drawLeft - CONTROL_SIZE - GAP);

  if (draw instanceof HTMLElement) {
    setImportant(draw, 'left', `${drawLeft}px`);
    setImportant(draw, 'top', `${top}px`);
    draw.style.removeProperty('right');
  }
  if (color instanceof HTMLElement) {
    setImportant(color, 'left', `${colorLeft}px`);
    setImportant(color, 'top', `${top}px`);
    color.style.removeProperty('right');
  }

  return { top, colorLeft, drawLeft, toolbarLeft, connectionLeft };
}

function apply(source = 'apply') {
  frame = 0;
  if (!enabled()) return false;
  ensureStyle();
  const positions = positionStrip();

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    iconsOnly: true,
    wheelChanged: false,
    controlSize: CONTROL_SIZE,
    iconSize: ICON_SIZE,
    toolbarWidth: TOOLBAR_WIDTH,
    positions,
    at: Date.now(),
  };
  return Boolean(positions);
}

function schedule(source = 'schedule') {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => apply(source));
}

function installObserver() {
  if (typeof MutationObserver !== 'function' || observer) return false;
  observer = new MutationObserver((records) => {
    if (records.some((record) => record.addedNodes.length || record.removedNodes.length)) {
      schedule('dom-change');
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !enabled() || window[STATE_KEY]) return;

  [0, 40, 100, 220, 500, 1000, 2000, 4000].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });
  window.addEventListener('resize', () => schedule('window-resize'), false);
  window.addEventListener('scroll', () => schedule('window-scroll'), true);
  document.addEventListener('fullscreenchange', () => schedule('fullscreen-change'), false);
  installObserver();
  timer = window.setInterval(() => schedule('uniform-icon-watch'), 1000);

  window.GANNZILLA_UNIFORM_TOP_ICON_STRIP_V637 = true;
  window.__auditGannzillaUniformTopIconStripV637 = () => {
    const ids = [MAIN_EYE_ID, PANEL_EYE_ID, MOVE_ID, ZOOM_OUT_ID, ZOOM_IN_ID,
      FULLSCREEN_ID, DRAW_ID, COLOR_ID, CONNECTION_BUTTON_ID];
    const controls = ids.map((id) => document.getElementById(id)).filter((item) => item instanceof HTMLElement);
    const sizes = controls.map((item) => {
      const rect = item.getBoundingClientRect();
      return { id: item.id, width: Math.round(rect.width), height: Math.round(rect.height) };
    });
    return {
      ok: enabled()
        && controls.length >= 8
        && sizes.every((size) => size.width === CONTROL_SIZE && size.height === CONTROL_SIZE),
      build: BUILD,
      iconsOnly: true,
      wheelChanged: false,
      targetControlSize: CONTROL_SIZE,
      targetIconSize: ICON_SIZE,
      sizes,
      applyCount,
      timerActive: Boolean(timer),
      observerActive: Boolean(observer),
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, positionStrip };
  schedule('install');
}

install();
