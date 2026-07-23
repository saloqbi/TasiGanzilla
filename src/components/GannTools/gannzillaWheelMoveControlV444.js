const BUILD = 444;
const ZOOM_STRIP_ID = 'gannzilla-zoom-fullscreen-strip-v443';
const CONTROL_ID = 'gannzilla-wheel-move-control-v444';
const TRIGGER_ID = 'gannzilla-wheel-move-trigger-v444';
const PAD_ID = 'gannzilla-wheel-move-pad-v444';
const STYLE_ID = 'gannzilla-wheel-move-style-v444';
const STATE_KEY = '__gannzillaWheelMoveControlV444';
const PAN_STORAGE_KEY = 'gannzilla-wheel-asymmetric-open-pan-v305';

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

function triggerMarkup() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2.3 8.7 5.6h2.1v3h2.4v-3h2.1L12 2.3Z" fill="#2b74aa"/>
      <path d="m12 21.7 3.3-3.3h-2.1v-3h-2.4v3H8.7l3.3 3.3Z" fill="#2b74aa"/>
      <path d="M2.3 12 5.6 8.7v2.1h3v2.4h-3v2.1L2.3 12Z" fill="#2b74aa"/>
      <path d="m21.7 12-3.3 3.3v-2.1h-3v-2.4h3V8.7l3.3 3.3Z" fill="#2b74aa"/>
      <rect x="9.1" y="9.1" width="5.8" height="5.8" rx="1" fill="#fff" stroke="#2b74aa" stroke-width="1.1"/>
      <path d="M12 10.4v3.2M10.4 12h3.2" stroke="#2b74aa" stroke-width="1.1" stroke-linecap="round"/>
    </svg>`;
}

function arrowMarkup(direction) {
  const rotation = { up: 0, right: 90, down: 180, left: 270 }[direction] || 0;
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="transform:rotate(${rotation}deg)">
      <path d="M12 4 5.2 10.8h4.1V20h5.4v-9.2h4.1L12 4Z" fill="#5d9ec7" stroke="#2e719d" stroke-width=".8" stroke-linejoin="round"/>
    </svg>`;
}

function centerMarkup() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="6.4" fill="#fff" stroke="#5b8faf" stroke-width="1.1"/>
      <path d="M12 7.5v9M7.5 12h9" stroke="#2f719d" stroke-width="1.35" stroke-linecap="round"/>
      <circle cx="12" cy="12" r="1.2" fill="#2f719d"/>
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
    #${CONTROL_ID} {
      position: fixed !important;
      width: 30px !important;
      min-width: 30px !important;
      height: 30px !important;
      z-index: 2147483646 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      overflow: visible !important;
      direction: ltr !important;
      box-sizing: border-box !important;
      isolation: isolate !important;
    }

    #${CONTROL_ID}, #${CONTROL_ID} * { box-sizing: border-box !important; }

    #${TRIGGER_ID} {
      width: 30px !important;
      min-width: 30px !important;
      height: 30px !important;
      margin: 0 !important;
      padding: 4px !important;
      border: 1px solid #8d969f !important;
      border-radius: 0 !important;
      background: linear-gradient(#ffffff, #dedede) !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      user-select: none !important;
      box-shadow: 0 1px 3px rgba(0,0,0,.18) !important;
    }

    #${TRIGGER_ID}:hover,
    #${CONTROL_ID}[data-open="true"] #${TRIGGER_ID} {
      background: linear-gradient(#ffffff, #dcecff) !important;
      border-color: #477da8 !important;
    }

    #${TRIGGER_ID} svg { width: 20px !important; height: 20px !important; display: block !important; pointer-events: none !important; }

    #${PAD_ID} {
      position: absolute !important;
      top: 32px !important;
      right: 0 !important;
      width: 94px !important;
      height: 94px !important;
      padding: 2px !important;
      display: none !important;
      grid-template-columns: repeat(3, 30px) !important;
      grid-template-rows: repeat(3, 30px) !important;
      gap: 0 !important;
      border: 1px solid #8d969f !important;
      background: #f1f1f1 !important;
      box-shadow: 0 5px 14px rgba(0,0,0,.28) !important;
      z-index: 2147483647 !important;
      direction: ltr !important;
      touch-action: none !important;
    }

    #${CONTROL_ID}[data-open="true"] #${PAD_ID} { display: grid !important; }

    #${PAD_ID} .gz444-pad-button {
      width: 30px !important;
      height: 30px !important;
      margin: 0 !important;
      padding: 4px !important;
      border: 1px solid #c2c2c2 !important;
      border-radius: 0 !important;
      background: linear-gradient(#ffffff, #e7e7e7) !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      user-select: none !important;
      touch-action: none !important;
    }

    #${PAD_ID} .gz444-pad-button:hover,
    #${PAD_ID} .gz444-pad-button:focus-visible {
      background: #dcecff !important;
      border-color: #6b9cbd !important;
      outline: none !important;
    }

    #${PAD_ID} .gz444-pad-button svg { width: 20px !important; height: 20px !important; display: block !important; pointer-events: none !important; }
    #${PAD_ID} .gz444-up { grid-column: 2 !important; grid-row: 1 !important; }
    #${PAD_ID} .gz444-left { grid-column: 1 !important; grid-row: 2 !important; }
    #${PAD_ID} .gz444-center { grid-column: 2 !important; grid-row: 2 !important; }
    #${PAD_ID} .gz444-right { grid-column: 3 !important; grid-row: 2 !important; }
    #${PAD_ID} .gz444-down { grid-column: 2 !important; grid-row: 3 !important; }
  `;
}

function readOffset() {
  try {
    const value = JSON.parse(localStorage.getItem(PAN_STORAGE_KEY) || '{}');
    return {
      x: Number.isFinite(Number(value.x)) ? Number(value.x) : 0,
      y: Number.isFinite(Number(value.y)) ? Number(value.y) : 0,
    };
  } catch (_) {
    return { x: 0, y: 0 };
  }
}

function fallbackMove(direction) {
  if (window.GANNZILLA_WHEEL_ASYMMETRIC_OPEN_PAN_V305 === true) return;
  const step = Math.round(numberParam('wheelMoveStep', 48, 8, 240));
  const current = readOffset();
  const delta = {
    left: { x: -step, y: 0 },
    right: { x: step, y: 0 },
    up: { x: 0, y: -step },
    down: { x: 0, y: step },
    center: { x: -current.x, y: -current.y },
  }[direction];
  if (!delta) return;
  const next = { x: current.x + delta.x, y: current.y + delta.y };
  try { localStorage.setItem(PAN_STORAGE_KEY, JSON.stringify(next)); } catch (_) { /* runtime only */ }
  const canvas = Array.from(document.querySelectorAll('canvas'))
    .filter((node) => node instanceof HTMLCanvasElement && !node.closest?.('aside'))
    .sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];
  if (canvas instanceof HTMLCanvasElement) {
    canvas.style.setProperty('transform', `translate3d(${Math.round(next.x)}px, ${Math.round(next.y)}px, 0)`, 'important');
  }
  window.dispatchEvent(new CustomEvent('gannzilla:wheel-pan-offset-v305', { detail: next }));
}

function activate(element, handler) {
  element.tabIndex = 0;
  element.setAttribute('role', 'button');
  element.addEventListener('click', handler);
  element.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    element.click();
  });
}

function padButton(direction, className, markup, title) {
  const element = document.createElement('span');
  element.className = `gz444-pad-button ${className}`;
  element.innerHTML = markup;
  element.title = title;
  element.setAttribute('aria-label', title);
  if (direction === 'center') element.setAttribute('data-gannzilla-v265-center', 'true');
  else element.setAttribute('data-gannzilla-v265-direction', direction);
  activate(element, () => fallbackMove(direction));
  return element;
}

function createControl() {
  const ar = language() === 'ar';
  const control = document.createElement('div');
  control.id = CONTROL_ID;
  control.className = 'gannzilla-chart-toolbar-v328';
  control.dataset.open = 'false';
  control.setAttribute('data-gannzilla-toolbar', 'true');

  const trigger = document.createElement('span');
  trigger.id = TRIGGER_ID;
  trigger.innerHTML = triggerMarkup();
  trigger.title = ar ? 'تحريك العجلة' : 'Move wheel';
  trigger.setAttribute('aria-label', trigger.title);
  trigger.setAttribute('data-gannzilla-v265-pan-trigger', 'true');
  activate(trigger, (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    const open = control.dataset.open !== 'true';
    control.dataset.open = open ? 'true' : 'false';
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  const pad = document.createElement('div');
  pad.id = PAD_ID;
  pad.setAttribute('role', 'menu');
  pad.append(
    padButton('up', 'gz444-up', arrowMarkup('up'), ar ? 'تحريك العجلة للأعلى' : 'Move wheel up'),
    padButton('left', 'gz444-left', arrowMarkup('left'), ar ? 'تحريك العجلة لليسار' : 'Move wheel left'),
    padButton('center', 'gz444-center', centerMarkup(), ar ? 'إعادة العجلة إلى المنتصف' : 'Center wheel'),
    padButton('right', 'gz444-right', arrowMarkup('right'), ar ? 'تحريك العجلة لليمين' : 'Move wheel right'),
    padButton('down', 'gz444-down', arrowMarkup('down'), ar ? 'تحريك العجلة للأسفل' : 'Move wheel down'),
  );

  control.append(trigger, pad);
  document.body.appendChild(control);
  return control;
}

function positionControl(control) {
  const zoomStrip = document.getElementById(ZOOM_STRIP_ID);
  const size = 30;
  const gap = Math.round(numberParam('wheelMoveControlGap', 4, 0, 20));

  if (zoomStrip instanceof HTMLElement) {
    const rect = zoomStrip.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      control.style.setProperty('left', `${Math.max(2, Math.round(rect.left - size - gap))}px`, 'important');
      control.style.setProperty('top', `${Math.round(rect.top + Math.max(0, (rect.height - size) / 2))}px`, 'important');
      control.style.removeProperty('right');
      return true;
    }
  }

  const rightLanguage = Math.round(numberParam('rightLanguageRight', 10, 2, 160));
  const languageWidth = Math.round(numberParam('rightLanguageWidth', 136, 104, 200));
  const connectionGap = Math.round(numberParam('connectionControlGap', 4, 0, 20));
  const zoomGap = Math.round(numberParam('zoomFullscreenGap', 4, 0, 20));
  const top = Math.round(numberParam('rightLanguageTop', 8, 2, 160));
  const right = rightLanguage + languageWidth + connectionGap + 30 + zoomGap + 146 + gap;
  control.style.setProperty('right', `${right}px`, 'important');
  control.style.setProperty('top', `${top}px`, 'important');
  control.style.removeProperty('left');
  return false;
}

function closePad() {
  const control = document.getElementById(CONTROL_ID);
  if (!(control instanceof HTMLElement)) return;
  control.dataset.open = 'false';
  document.getElementById(TRIGGER_ID)?.setAttribute('aria-expanded', 'false');
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showWheelMoveControl', true) || window[STATE_KEY]) return;

  installStyle();
  let control = document.getElementById(CONTROL_ID);
  if (!(control instanceof HTMLElement)) control = createControl();

  let frame = 0;
  let observer = null;
  const refresh = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      installStyle();
      let current = document.getElementById(CONTROL_ID);
      if (!(current instanceof HTMLElement)) current = createControl();
      current.hidden = false;
      current.style.setProperty('display', 'block', 'important');
      current.style.setProperty('visibility', 'visible', 'important');
      current.style.setProperty('opacity', '1', 'important');
      const connected = positionControl(current);
      if (connected) {
        observer?.disconnect();
        observer = null;
      }
    });
  };

  refresh();
  [20, 60, 140, 320, 700, 1400, 2800, 5000].forEach((delay) => window.setTimeout(refresh, delay));
  observer = new MutationObserver(refresh);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  const onDocumentClick = (event) => {
    const current = document.getElementById(CONTROL_ID);
    if (current instanceof HTMLElement && !current.contains(event.target)) closePad();
  };
  const onKeyDown = (event) => { if (event.key === 'Escape') closePad(); };
  document.addEventListener('click', onDocumentClick, true);
  document.addEventListener('keydown', onKeyDown);
  window.addEventListener('resize', refresh);
  window.addEventListener('scroll', refresh, true);
  document.addEventListener('fullscreenchange', refresh);

  window.GANNZILLA_WHEEL_MOVE_CONTROL_V444 = true;
  window.__auditGannzillaWheelMoveControlV444 = () => {
    const node = document.getElementById(CONTROL_ID);
    const trigger = document.getElementById(TRIGGER_ID);
    const zoom = document.getElementById(ZOOM_STRIP_ID);
    const rect = node?.getBoundingClientRect();
    const zoomRect = zoom?.getBoundingClientRect();
    return {
      ok: Boolean(node && trigger && rect?.width > 0 && rect?.height > 0),
      build: BUILD,
      enabled: boolParam('showWheelMoveControl', true),
      fixedLeftOfZoomStrip: Boolean(rect && zoomRect && rect.right <= zoomRect.left + 4),
      popupDirectionPad: true,
      movementDirections: ['up', 'left', 'center', 'right', 'down'],
      holdToMoveConnectedToV305: true,
      keyboardAndMouseMovementPreserved: true,
    };
  };

  window[STATE_KEY] = { observer, onDocumentClick, onKeyDown };
}

install();
