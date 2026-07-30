const BUILD = 642;
const STATE_KEY = '__gannzillaThinTopBoundaryV642';
const STYLE_ID = 'gannzilla-thin-top-boundary-style-v642';
const LINE_ID = 'gannzilla-thin-top-boundary-line-v642';
const PARAM = 'thinTopBoundary';

const CONTROL_TOP = 2;
const CONTROL_SIZE = 22;
const BOUNDARY_TOP = CONTROL_TOP + CONTROL_SIZE;

const TOOLBAR_ID = 'gannzilla-unified-wheel-tools-v453';
const DRAW_ID = 'gannzilla-top-center-drawing-trigger-v471';
const COLOR_ID = 'gannzilla-wheel-color-toggle-v511';
const CONNECTION_ID = 'gannzilla-connection-control-v439';
const LANGUAGE_ID = 'gannzilla-right-language-control-v438';

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

  style.textContent = `
    :root {
      --gannzilla-toolbar-height: ${BOUNDARY_TOP}px !important;
    }

    #${TOOLBAR_ID},
    #${DRAW_ID},
    #${COLOR_ID},
    #${CONNECTION_ID},
    #${LANGUAGE_ID} {
      top: ${CONTROL_TOP}px !important;
      margin-top: 0 !important;
      margin-bottom: 0 !important;
      box-shadow: none !important;
      filter: none !important;
    }

    #${TOOLBAR_ID},
    #${CONNECTION_ID},
    #${LANGUAGE_ID} {
      background-color: transparent !important;
      border-bottom-color: transparent !important;
    }

    #${LINE_ID} {
      position: fixed !important;
      left: 0 !important;
      right: 0 !important;
      top: ${BOUNDARY_TOP}px !important;
      width: 100vw !important;
      height: 1px !important;
      min-height: 1px !important;
      max-height: 1px !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      background: #d2d2d2 !important;
      box-shadow: none !important;
      filter: none !important;
      pointer-events: none !important;
      z-index: 2147482000 !important;
    }
  `;
  return true;
}

function ensureLine() {
  let line = document.getElementById(LINE_ID);
  if (!(line instanceof HTMLElement)) {
    line?.remove?.();
    line = document.createElement('div');
    line.id = LINE_ID;
    line.setAttribute('aria-hidden', 'true');
    document.body.appendChild(line);
  }
  return line;
}

function apply(source = 'apply') {
  if (!enabled()) return false;
  ensureStyle();
  const line = ensureLine();
  const controls = [TOOLBAR_ID, DRAW_ID, COLOR_ID, CONNECTION_ID, LANGUAGE_ID]
    .map((id) => document.getElementById(id))
    .filter((element) => element instanceof HTMLElement);

  controls.forEach((element) => {
    setImportant(element, 'top', `${CONTROL_TOP}px`);
    setImportant(element, 'margin-top', '0');
    setImportant(element, 'margin-bottom', '0');
    setImportant(element, 'box-shadow', 'none');
    setImportant(element, 'filter', 'none');
  });

  setImportant(line, 'top', `${BOUNDARY_TOP}px`);
  setImportant(line, 'height', '1px');
  setImportant(line, 'background', '#d2d2d2');

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    controlsAligned: controls.length,
    controlTop: CONTROL_TOP,
    controlSize: CONTROL_SIZE,
    boundaryTop: BOUNDARY_TOP,
    boundaryHeight: 1,
    wheelChanged: false,
    panelChanged: false,
    at: Date.now(),
  };
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !enabled() || window[STATE_KEY]) return;

  [0, 40, 120, 300, 700, 1500, 3200].forEach((delay) => {
    window.setTimeout(() => apply(`boot-${delay}`), delay);
  });

  if (typeof MutationObserver === 'function') {
    observer = new MutationObserver(() => apply('dom-change'));
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.addEventListener('resize', () => apply('window-resize'), false);
  timer = window.setInterval(() => apply('boundary-watch'), 500);

  window.GANNZILLA_THIN_TOP_BOUNDARY_V642 = true;
  window.__auditGannzillaThinTopBoundaryV642 = () => {
    const line = document.getElementById(LINE_ID);
    const rect = line?.getBoundingClientRect?.();
    return {
      ok: enabled()
        && line instanceof HTMLElement
        && Math.round(rect?.top || 0) === BOUNDARY_TOP
        && Math.round(rect?.height || 0) === 1,
      build: BUILD,
      wheelChanged: false,
      panelChanged: false,
      controlTop: CONTROL_TOP,
      controlSize: CONTROL_SIZE,
      boundaryTop: BOUNDARY_TOP,
      boundaryHeight: rect?.height || 0,
      applyCount,
      timerActive: Boolean(timer),
      observerActive: Boolean(observer),
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, ensureStyle, ensureLine };
  apply('install');
}

install();
