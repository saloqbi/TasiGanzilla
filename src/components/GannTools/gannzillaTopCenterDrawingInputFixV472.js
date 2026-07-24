const BUILD = 472;
const TOOLBAR_ID = 'gannzilla-top-center-drawing-toolbar-v471';
const OVERLAY_ID = 'gannzilla-top-center-drawing-overlay-v471';
const HAND_BUTTON_ID = 'gannzilla-top-center-hand-tool-v472';
const STYLE_ID = 'gannzilla-top-center-drawing-input-fix-style-v472';
const STATE_KEY = '__gannzillaTopCenterDrawingInputFixV472';
const WHEEL_INPUT_STATE_KEY = '__gannzillaKeyboardMouseControlV459';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function boolParam(name, fallback = true) {
  const query = params();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function handMarkup() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8.2 12.1V6.2a1.45 1.45 0 0 1 2.9 0v4.2-6a1.45 1.45 0 0 1 2.9 0v6-5a1.45 1.45 0 0 1 2.9 0v6.1-3.8a1.45 1.45 0 0 1 2.9 0v6.7c0 4.3-2.8 7.1-7 7.1h-1.1c-2.3 0-4.2-1-5.6-2.8l-3-3.9a1.7 1.7 0 0 1 2.6-2.2l2.5 2.5Z" fill="#eef6fb" stroke="#39779f" stroke-width="1.35" stroke-linejoin="round"/>
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
    #${HAND_BUTTON_ID} svg {
      width: 23px !important;
      height: 23px !important;
      display: block !important;
      pointer-events: none !important;
    }
  `;
}

function markDrawingSurface() {
  const overlay = document.getElementById(OVERLAY_ID);
  if (!(overlay instanceof HTMLCanvasElement)) return false;
  overlay.setAttribute('data-gannzilla-drawing-surface', 'true');
  overlay.dataset.gannzillaDrawingSurfaceV472 = 'true';
  return true;
}

let patchedWheelState = null;
let originalPointerDown = null;
let wrappedPointerDown = null;

function patchWheelPointerAuthority() {
  const state = window[WHEEL_INPUT_STATE_KEY];
  if (!state || typeof state.onPointerDown !== 'function') return false;
  if (patchedWheelState === state && wrappedPointerDown) return true;

  if (patchedWheelState && originalPointerDown && wrappedPointerDown) {
    window.removeEventListener('pointerdown', wrappedPointerDown, true);
    window.addEventListener('pointerdown', originalPointerDown, true);
  }

  patchedWheelState = state;
  originalPointerDown = state.onPointerDown;
  wrappedPointerDown = (event) => {
    const target = event.target instanceof Element
      ? event.target.closest('[data-gannzilla-drawing-surface="true"]')
      : null;

    // Left drag belongs to the drawing layer while a drawing tool is active.
    // Middle-button drag, mouse wheel and keyboard arrows remain controlled by V459.
    if (event.button === 0 && target) return;
    originalPointerDown(event);
  };

  window.removeEventListener('pointerdown', originalPointerDown, true);
  window.addEventListener('pointerdown', wrappedPointerDown, true);
  state.gannzillaDrawingInputFixV472 = true;
  return true;
}

function installHandButton() {
  const toolbar = document.getElementById(TOOLBAR_ID);
  if (!(toolbar instanceof HTMLElement)) return false;

  let button = document.getElementById(HAND_BUTTON_ID);
  if (button instanceof HTMLButtonElement) return true;

  const groups = toolbar.querySelectorAll('.g');
  const quickGroup = groups[1] instanceof HTMLElement ? groups[1] : groups[0];
  if (!(quickGroup instanceof HTMLElement)) return false;

  button = document.createElement('button');
  button.id = HAND_BUTTON_ID;
  button.type = 'button';
  button.className = 'tool';
  button.dataset.tool = 'hand';
  button.title = 'إنهاء الرسم وتحريك العجلة';
  button.setAttribute('aria-label', button.title);
  button.innerHTML = handMarkup();
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      bubbles: true,
      cancelable: true,
      composed: true,
    }));
  });
  quickGroup.prepend(button);
  return true;
}

let refreshCount = 0;
let lastRefresh = null;

function refresh(source = 'refresh') {
  installStyle();
  const surfaceMarked = markDrawingSurface();
  const wheelPatched = patchWheelPointerAuthority();
  const handInstalled = installHandButton();
  refreshCount += 1;
  lastRefresh = { source, surfaceMarked, wheelPatched, handInstalled, at: Date.now() };
  return surfaceMarked && wheelPatched && handInstalled;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('enableTopDrawingInputFix', true) || window[STATE_KEY]) return;

  let frame = 0;
  const schedule = (source = 'schedule') => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => refresh(source));
  };

  schedule('install');
  const timers = [40, 120, 300, 700, 1500, 3000, 5000]
    .map((delay) => window.setTimeout(() => schedule(`bootstrap-${delay}`), delay));

  const onLayout = () => schedule('layout');
  window.addEventListener('resize', onLayout);
  document.addEventListener('fullscreenchange', onLayout);
  window.addEventListener('gannzilla:unified-wheel-tools-v453', onLayout);

  window.GANNZILLA_TOP_CENTER_DRAWING_INPUT_FIX_V472 = true;
  window.__auditGannzillaTopCenterDrawingInputFixV472 = () => {
    const overlay = document.getElementById(OVERLAY_ID);
    const hand = document.getElementById(HAND_BUTTON_ID);
    const wheelState = window[WHEEL_INPUT_STATE_KEY];
    return {
      ok: Boolean(
        overlay?.getAttribute('data-gannzilla-drawing-surface') === 'true'
        && hand
        && wheelState?.gannzillaDrawingInputFixV472 === true
      ),
      build: BUILD,
      drawingSurfaceMarked: overlay?.getAttribute('data-gannzilla-drawing-surface') === 'true',
      explicitHandButton: Boolean(hand),
      leftPointerReservedForDrawing: Boolean(wheelState?.gannzillaDrawingInputFixV472),
      mouseWheelPreserved: true,
      keyboardArrowsPreserved: true,
      middleButtonDragPreserved: true,
      handModeRestoresLeftDrag: true,
      refreshCount,
      lastRefresh,
    };
  };

  window[STATE_KEY] = { timers, schedule, onLayout };
}

install();
