const BUILD = 465;
const EYE_ID = 'gannzilla-unified-eye-v453';
const WHEEL_TOOLBAR_ID = 'gannzilla-unified-wheel-tools-v453';
const DRAWING_STRIP_ID = 'gannzilla-compact-drawing-tools-v463';
const DRAWING_OVERLAY_ID = 'gannzilla-compact-drawing-overlay-v463';
const DRAWING_TRIGGER_ID = 'gannzilla-drawing-tools-trigger-v463';
const SHAPES_TRIGGER_ID = 'gannzilla-shapes-menu-trigger-v460';
const SHAPES_MENU_ID = 'gannzilla-shapes-menu-v460';
const SHAPES_OVERLAY_ID = 'gannzilla-shapes-overlay-v460';
const STYLE_ID = 'gannzilla-wheel-drawing-visibility-link-style-v465';
const STATE_KEY = '__gannzillaWheelDrawingVisibilityLinkV465';
const ROOT_STATE_ATTR = 'data-gannzilla-wheel-drawing-visible-v465';

const FLOATING_DRAWING_IDS = [
  'gannzilla-drawing-tools-menu-v463',
  'gannzilla-selection-menu-v463',
  'gannzilla-paste-menu-v463',
  'gannzilla-thickness-menu-v463',
  'gannzilla-color-menu-v463',
  SHAPES_MENU_ID,
];

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

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    html[${ROOT_STATE_ATTR}="false"] #${DRAWING_STRIP_ID},
    html[${ROOT_STATE_ATTR}="false"] #${DRAWING_OVERLAY_ID},
    html[${ROOT_STATE_ATTR}="false"] #${SHAPES_TRIGGER_ID},
    html[${ROOT_STATE_ATTR}="false"] #${SHAPES_MENU_ID},
    html[${ROOT_STATE_ATTR}="false"] #${SHAPES_OVERLAY_ID},
    html[${ROOT_STATE_ATTR}="false"] #gannzilla-drawing-tools-menu-v463,
    html[${ROOT_STATE_ATTR}="false"] #gannzilla-selection-menu-v463,
    html[${ROOT_STATE_ATTR}="false"] #gannzilla-paste-menu-v463,
    html[${ROOT_STATE_ATTR}="false"] #gannzilla-thickness-menu-v463,
    html[${ROOT_STATE_ATTR}="false"] #gannzilla-color-menu-v463 {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `;
}

function readWheelVisible() {
  const eye = document.getElementById(EYE_ID);
  if (eye instanceof HTMLElement) {
    if (eye.dataset.visible === 'false') return false;
    if (eye.dataset.visible === 'true') return true;
  }

  const canvas = document.querySelector([
    'canvas[data-gannzilla-unified-wheel-tools-v453="true"]',
    'canvas[data-gannzilla-native-wheel-scrollbars-hidden-v417="true"]',
    'canvas[data-gannzilla-keyboard-mouse-control-v459="true"]',
  ].join(','));
  if (!(canvas instanceof HTMLCanvasElement)) return true;
  const style = window.getComputedStyle(canvas);
  return style.display !== 'none'
    && style.visibility !== 'hidden'
    && Number(style.opacity || 1) !== 0;
}

function closeFloatingDrawingUi() {
  FLOATING_DRAWING_IDS.forEach((id) => {
    const node = document.getElementById(id);
    if (!(node instanceof HTMLElement)) return;
    node.hidden = true;
    node.setAttribute('aria-hidden', 'true');
  });

  [DRAWING_TRIGGER_ID, 'gannzilla-selection-trigger-v463', 'gannzilla-paste-trigger-v463', SHAPES_TRIGGER_ID]
    .forEach((id) => document.getElementById(id)?.setAttribute('aria-expanded', 'false'));

  // Let the compact toolbar close its private menu state and return to a safe tool.
  document.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'Escape',
    code: 'Escape',
    bubbles: true,
    cancelable: true,
    composed: true,
  }));
}

let lastVisible = null;
let syncCount = 0;
let lastSync = null;

function applyLinkedVisibility(source = 'refresh') {
  const visible = readWheelVisible();
  document.documentElement.setAttribute(ROOT_STATE_ATTR, visible ? 'true' : 'false');

  const strip = document.getElementById(DRAWING_STRIP_ID);
  if (strip instanceof HTMLElement) {
    strip.dataset.gannzillaLinkedWheelVisibleV465 = visible ? 'true' : 'false';
    if (visible) {
      strip.removeAttribute('aria-hidden');
    } else {
      strip.setAttribute('aria-hidden', 'true');
    }
  }

  if (!visible) closeFloatingDrawingUi();
  if (visible && lastVisible === false) {
    // Existing layout authorities reposition the restored strip without creating a new icon.
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new CustomEvent('gannzilla:layout-panel-visibility-change', {
      detail: { visible: true, source: 'linked-eye-v465', build: BUILD },
    }));
  }

  if (visible !== lastVisible) {
    window.dispatchEvent(new CustomEvent('gannzilla:wheel-drawing-visibility-v465', {
      detail: { visible, source, build: BUILD },
    }));
  }

  lastVisible = visible;
  syncCount += 1;
  lastSync = { visible, source, at: Date.now() };
  return visible;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('linkWheelAndDrawingVisibility', true) || window[STATE_KEY]) return;

  installStyle();

  let frame = 0;
  let eyeObserver = null;
  let observedEye = null;
  let toolbarObserver = null;
  let observedToolbar = null;

  const schedule = (source = 'schedule') => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      const eye = document.getElementById(EYE_ID);
      if (eye instanceof HTMLElement && observedEye !== eye && typeof MutationObserver === 'function') {
        eyeObserver?.disconnect();
        observedEye = eye;
        eyeObserver = new MutationObserver(() => schedule('eye-attribute'));
        eyeObserver.observe(eye, { attributes: true, attributeFilter: ['data-visible', 'style', 'class'] });
      }

      const toolbar = document.getElementById(WHEEL_TOOLBAR_ID);
      if (toolbar instanceof HTMLElement && observedToolbar !== toolbar && typeof MutationObserver === 'function') {
        toolbarObserver?.disconnect();
        observedToolbar = toolbar;
        toolbarObserver = new MutationObserver(() => schedule('toolbar-child'));
        toolbarObserver.observe(toolbar, { childList: true });
      }

      applyLinkedVisibility(source);
    });
  };

  schedule('install');
  const timers = [40, 120, 300, 700, 1500, 3000, 5000]
    .map((delay) => window.setTimeout(() => schedule(`bootstrap-${delay}`), delay));

  const onWheelTools = () => schedule('wheel-tools-event');
  const onResize = () => schedule('resize');
  window.addEventListener('gannzilla:unified-wheel-tools-v453', onWheelTools);
  window.addEventListener('gannzilla:ring-two-numbering-refresh', onWheelTools);
  window.addEventListener('resize', onResize);
  document.addEventListener('fullscreenchange', onResize);

  window.GANNZILLA_WHEEL_DRAWING_VISIBILITY_LINK_V465 = true;
  window.__auditGannzillaWheelDrawingVisibilityLinkV465 = () => {
    const eye = document.getElementById(EYE_ID);
    const strip = document.getElementById(DRAWING_STRIP_ID);
    const visible = readWheelVisible();
    const stripStyle = strip instanceof HTMLElement ? window.getComputedStyle(strip) : null;
    return {
      ok: Boolean(eye && strip)
        && document.documentElement.getAttribute(ROOT_STATE_ATTR) === (visible ? 'true' : 'false')
        && (visible || stripStyle?.display === 'none'),
      build: BUILD,
      enabled: boolParam('linkWheelAndDrawingVisibility', true),
      existingEyeReused: Boolean(eye),
      newEyeCreated: false,
      wheelVisible: visible,
      drawingToolsVisible: stripStyle ? stripStyle.display !== 'none' : null,
      shapesTriggerVisible: document.getElementById(SHAPES_TRIGGER_ID)
        ? window.getComputedStyle(document.getElementById(SHAPES_TRIGGER_ID)).display !== 'none'
        : null,
      syncCount,
      lastSync,
      scopedObserversOnly: true,
    };
  };

  window[STATE_KEY] = {
    timers,
    get eyeObserver() { return eyeObserver; },
    get toolbarObserver() { return toolbarObserver; },
    schedule,
    onWheelTools,
    onResize,
  };
}

install();
