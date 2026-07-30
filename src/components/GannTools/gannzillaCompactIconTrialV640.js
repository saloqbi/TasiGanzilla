const BUILD = 640;
const STATE_KEY = '__gannzillaCompactIconTrialV640';
const STYLE_ID = 'gannzilla-compact-icon-trial-style-v640';
const LEGACY_STYLE_IDS = [
  'gannzilla-uniform-icon-size-fix-style-v639',
  'gannzilla-merged-top-icon-strip-style-v638',
  'gannzilla-uniform-top-icon-strip-style-v637',
];
const PARAM = 'compactIconTrial';

const TOOLBAR_ID = 'gannzilla-unified-wheel-tools-v453';
const MAIN_EYE_ID = 'gannzilla-unified-eye-v509';
const PANEL_EYE_ID = 'gannzilla-panel-visibility-eye-v511';
const TIME_TRACKER_ID = 'gannzilla-time-tracker-visibility-clock-v578';
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

const CONTROL_SIZE = 22;
const ICON_SIZE = 12;
const BORDER_OVERLAP = 1;
const ZOOM_SELECT_WIDTH = 40;
const ZOOM_GROUP_WIDTH = CONTROL_SIZE * 2 + ZOOM_SELECT_WIDTH - BORDER_OVERLAP * 2;
// Toolbar children: main eye, panel eye, time tracker, move, zoom group, fullscreen.
const TOOLBAR_SQUARE_COUNT = 5;
const TOOLBAR_WIDTH = CONTROL_SIZE * TOOLBAR_SQUARE_COUNT
  + ZOOM_GROUP_WIDTH
  - BORDER_OVERLAP * TOOLBAR_SQUARE_COUNT;

let frame = 0;
let timer = 0;
let observer = null;
let applying = false;
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

function squareControlIds() {
  return [
    MAIN_EYE_ID,
    PANEL_EYE_ID,
    TIME_TRACKER_ID,
    MOVE_ID,
    ZOOM_OUT_ID,
    ZOOM_IN_ID,
    FULLSCREEN_ID,
    DRAW_ID,
    COLOR_ID,
    CONNECTION_BUTTON_ID,
  ];
}

function ensureStyle() {
  LEGACY_STYLE_IDS.forEach((id) => document.getElementById(id)?.remove());

  let style = document.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  } else if (style !== document.head.lastElementChild) {
    document.head.appendChild(style);
  }

  const squareControls = squareControlIds().map((id) => `#${id}`).join(',');
  const squareSvgs = squareControlIds().map((id) => `#${id} svg`).join(',');

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
      justify-content: flex-start !important;
      gap: 0 !important;
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
      padding: 2px !important;
      border: 1px solid #8d969f !important;
      border-radius: 0 !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      line-height: 1 !important;
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
      margin: 0 0 0 -${BORDER_OVERLAP}px !important;
    }

    #${PANEL_EYE_ID}, #${TIME_TRACKER_ID}, #${ZOOM_GROUP_ID}, #${FULLSCREEN_ID} {
      margin-left: -${BORDER_OVERLAP}px !important;
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
    }

    #${ZOOM_SELECT_ID} {
      flex: 0 0 ${ZOOM_SELECT_WIDTH}px !important;
      width: ${ZOOM_SELECT_WIDTH}px !important;
      min-width: ${ZOOM_SELECT_WIDTH}px !important;
      max-width: ${ZOOM_SELECT_WIDTH}px !important;
      height: ${CONTROL_SIZE}px !important;
      min-height: ${CONTROL_SIZE}px !important;
      max-height: ${CONTROL_SIZE}px !important;
      margin: 0 0 0 -${BORDER_OVERLAP}px !important;
      padding: 0 1px !important;
      border: 1px solid #8d969f !important;
      border-radius: 0 !important;
      font: 700 10px/${CONTROL_SIZE - 2}px Arial, "Segoe UI", Tahoma, sans-serif !important;
      text-align: center !important;
      text-align-last: center !important;
      box-sizing: border-box !important;
    }

    #${ZOOM_IN_ID} { margin-left: -${BORDER_OVERLAP}px !important; }

    #${CONNECTION_WRAP_ID} {
      width: ${CONTROL_SIZE}px !important;
      min-width: ${CONTROL_SIZE}px !important;
      max-width: ${CONTROL_SIZE}px !important;
      height: ${CONTROL_SIZE}px !important;
      min-height: ${CONTROL_SIZE}px !important;
      max-height: ${CONTROL_SIZE}px !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
    }

    #${LANGUAGE_WRAP_ID}, #${LANGUAGE_BUTTON_ID} {
      height: ${CONTROL_SIZE}px !important;
      min-height: ${CONTROL_SIZE}px !important;
      max-height: ${CONTROL_SIZE}px !important;
      box-sizing: border-box !important;
    }
  `;
  return true;
}

function forceSquareSizes() {
  squareControlIds().forEach((id) => {
    const element = document.getElementById(id);
    if (!(element instanceof HTMLElement)) return;
    ['width', 'min-width', 'max-width', 'height', 'min-height', 'max-height']
      .forEach((property) => setImportant(element, property, `${CONTROL_SIZE}px`));
    setImportant(element, 'padding', '2px');

    const svg = element.querySelector('svg');
    if (svg instanceof SVGElement) {
      ['width', 'min-width', 'max-width', 'height', 'min-height', 'max-height']
        .forEach((property) => svg.style.setProperty(property, `${ICON_SIZE}px`, 'important'));
    }
  });
}

function positionMergedStrip() {
  const toolbar = document.getElementById(TOOLBAR_ID);
  const draw = document.getElementById(DRAW_ID);
  const color = document.getElementById(COLOR_ID);
  const connection = document.getElementById(CONNECTION_WRAP_ID);
  const language = document.getElementById(LANGUAGE_WRAP_ID);

  if (!(toolbar instanceof HTMLElement)
      || !(draw instanceof HTMLElement)
      || !(color instanceof HTMLElement)
      || !(connection instanceof HTMLElement)
      || !(language instanceof HTMLElement)) return null;

  const languageRect = language.getBoundingClientRect();
  if (!(languageRect.width > 0 && languageRect.height > 0)) return null;

  const top = Math.round(languageRect.top);
  const connectionLeft = Math.round(languageRect.left - CONTROL_SIZE + BORDER_OVERLAP);
  const toolbarLeft = Math.round(connectionLeft - TOOLBAR_WIDTH + BORDER_OVERLAP);
  const drawLeft = Math.round(toolbarLeft - CONTROL_SIZE + BORDER_OVERLAP);
  const colorLeft = Math.round(drawLeft - CONTROL_SIZE + BORDER_OVERLAP);

  [toolbar, draw, color, connection].forEach((element) => {
    setImportant(element, 'position', 'fixed');
    setImportant(element, 'top', `${top}px`);
    element.style.removeProperty('right');
    setImportant(element, 'transform', 'none');
  });

  setImportant(connection, 'left', `${connectionLeft}px`);
  setImportant(toolbar, 'left', `${toolbarLeft}px`);
  setImportant(draw, 'left', `${drawLeft}px`);
  setImportant(color, 'left', `${colorLeft}px`);
  setImportant(toolbar, 'width', `${TOOLBAR_WIDTH}px`);
  setImportant(toolbar, 'min-width', `${TOOLBAR_WIDTH}px`);
  setImportant(toolbar, 'max-width', `${TOOLBAR_WIDTH}px`);
  setImportant(toolbar, 'height', `${CONTROL_SIZE}px`);
  setImportant(toolbar, 'gap', '0');
  setImportant(toolbar, 'justify-content', 'flex-start');

  return { top, colorLeft, drawLeft, toolbarLeft, connectionLeft, languageLeft: Math.round(languageRect.left) };
}

function apply(source = 'apply') {
  frame = 0;
  if (!enabled() || applying) return false;
  applying = true;
  try {
    ensureStyle();
    forceSquareSizes();
    const positions = positionMergedStrip();
    applyCount += 1;
    lastApply = {
      source,
      build: BUILD,
      iconsOnly: true,
      wheelChanged: false,
      controlSize: CONTROL_SIZE,
      iconSize: ICON_SIZE,
      gap: 0,
      toolbarWidth: TOOLBAR_WIDTH,
      positions,
      at: Date.now(),
    };
    return Boolean(positions);
  } finally {
    applying = false;
  }
}

function schedule(source = 'schedule') {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => apply(source));
}

function installObserver() {
  if (typeof MutationObserver !== 'function' || observer) return false;
  observer = new MutationObserver((records) => {
    if (applying) return;
    if (records.some((record) => record.addedNodes.length || record.removedNodes.length)) schedule('dom-change');
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
  timer = window.setInterval(() => schedule('compact-icon-trial-watch'), 150);

  window.GANNZILLA_COMPACT_ICON_TRIAL_V640 = true;
  window.__auditGannzillaCompactIconTrialV640 = () => {
    const controls = squareControlIds()
      .map((id) => document.getElementById(id))
      .filter((item) => item instanceof HTMLElement);
    const sizes = controls.map((item) => {
      const rect = item.getBoundingClientRect();
      const svgRect = item.querySelector('svg')?.getBoundingClientRect?.();
      return {
        id: item.id,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        iconWidth: Math.round(svgRect?.width || 0),
        iconHeight: Math.round(svgRect?.height || 0),
      };
    });
    return {
      ok: enabled()
        && controls.length >= 9
        && sizes.every((size) => size.width === CONTROL_SIZE && size.height === CONTROL_SIZE)
        && sizes.every((size) => size.iconWidth === ICON_SIZE && size.iconHeight === ICON_SIZE),
      build: BUILD,
      targetControlSize: CONTROL_SIZE,
      targetIconSize: ICON_SIZE,
      targetGap: 0,
      sizes,
      applyCount,
      timerActive: Boolean(timer),
      observerActive: Boolean(observer),
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, positionMergedStrip, forceSquareSizes };
  schedule('install');
}

install();
