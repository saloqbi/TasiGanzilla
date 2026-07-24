const BUILD = 446;
const ZOOM_STRIP_ID = 'gannzilla-zoom-fullscreen-strip-v443';
const OLD_CONTROL_ID = 'gannzilla-wheel-move-control-v444';
const CONTROL_ID = 'gannzilla-wheel-move-control-v445';
const TRIGGER_ID = 'gannzilla-wheel-move-trigger-v445';
const PAD_ID = 'gannzilla-wheel-move-pad-v445';
const STYLE_ID = 'gannzilla-wheel-move-style-v445';
const STATE_KEY = '__gannzillaWheelMoveControlV446';
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

function findWheelCanvas() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-keyboard-mouse-control-v413="true"]',
    'canvas[data-gannzilla-native-wheel-scrollbars-hidden-v417="true"]',
  ].join(','));
  if (preferred instanceof HTMLCanvasElement && !preferred.closest?.('aside')) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement) || canvas.closest?.('aside')) return false;
      const rect = canvas.getBoundingClientRect();
      const style = window.getComputedStyle(canvas);
      return canvas.width > 300
        && canvas.height > 300
        && rect.width > 250
        && rect.height > 250
        && style.display !== 'none'
        && style.visibility !== 'hidden';
    })
    .map((canvas) => ({ canvas, area: canvas.width * canvas.height }))
    .sort((a, b) => b.area - a.area)[0]?.canvas || null;
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

function persistOffset(offset) {
  try {
    localStorage.setItem(PAN_STORAGE_KEY, JSON.stringify({
      x: Math.round(Number(offset.x) || 0),
      y: Math.round(Number(offset.y) || 0),
    }));
  } catch (_) {
    // Runtime movement remains available when storage is blocked.
  }
}

let movementCount = 0;
let lastMovement = null;

function applyDirectOffset(offset, source = 'move-pad') {
  const next = {
    x: Number.isFinite(Number(offset?.x)) ? Number(offset.x) : 0,
    y: Number.isFinite(Number(offset?.y)) ? Number(offset.y) : 0,
  };

  persistOffset(next);

  const applyToCanvas = () => {
    const canvas = findWheelCanvas();
    if (!(canvas instanceof HTMLCanvasElement)) return false;
    canvas.style.setProperty(
      'transform',
      `translate3d(${Math.round(next.x)}px, ${Math.round(next.y)}px, 0)`,
      'important',
    );
    canvas.style.setProperty('transform-origin', 'center center', 'important');
    canvas.style.setProperty('will-change', 'transform', 'important');
    canvas.dataset.gannzillaPanX = String(Math.round(next.x));
    canvas.dataset.gannzillaPanY = String(Math.round(next.y));
    canvas.dataset.gannzillaWheelMoveV446 = 'true';
    return true;
  };

  const applied = applyToCanvas();

  // Synchronize both movement systems already used by keyboard, mouse and legacy pan.
  window.dispatchEvent(new CustomEvent('gannzilla:page-scrollbar-pan-v305', {
    detail: { ...next, source, build: BUILD },
  }));
  window.dispatchEvent(new CustomEvent('gannzilla:wheel-pan-offset-v305', {
    detail: { ...next, source, build: BUILD },
  }));
  window.dispatchEvent(new CustomEvent('gannzilla:wheel-move-v446', {
    detail: { ...next, source, build: BUILD },
  }));

  // Re-apply after the active renderer has processed its synchronous listeners.
  window.requestAnimationFrame(applyToCanvas);
  window.setTimeout(applyToCanvas, 40);
  window.setTimeout(applyToCanvas, 140);

  movementCount += 1;
  lastMovement = { source, x: Math.round(next.x), y: Math.round(next.y), at: Date.now() };
  return applied;
}

function invokeKeyboardAuthority(direction) {
  const key = {
    left: 'ArrowLeft',
    right: 'ArrowRight',
    up: 'ArrowUp',
    down: 'ArrowDown',
  }[direction];
  if (!key || typeof KeyboardEvent !== 'function') return false;

  try {
    const event = new KeyboardEvent('keydown', {
      key,
      code: key,
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    window.dispatchEvent(event);
    return event.defaultPrevented;
  } catch (_) {
    return false;
  }
}

function moveWheel(direction, source = 'click') {
  if (direction !== 'center' && invokeKeyboardAuthority(direction)) {
    const offset = readOffset();
    movementCount += 1;
    lastMovement = {
      source: `${source}:keyboard:${direction}`,
      x: Math.round(offset.x),
      y: Math.round(offset.y),
      at: Date.now(),
    };
    return true;
  }

  const current = readOffset();
  const step = Math.round(numberParam('wheelMoveStep', 48, 8, 240));
  const next = {
    left: { x: current.x - step, y: current.y },
    right: { x: current.x + step, y: current.y },
    up: { x: current.x, y: current.y - step },
    down: { x: current.x, y: current.y + step },
    center: { x: 0, y: 0 },
  }[direction];

  if (!next) return false;
  return applyDirectOffset(next, `${source}:${direction}`);
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
    #${OLD_CONTROL_ID} {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }

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

    #${PAD_ID} .gz445-pad-button {
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

    #${PAD_ID} .gz445-pad-button:hover,
    #${PAD_ID} .gz445-pad-button:focus-visible {
      background: #dcecff !important;
      border-color: #6b9cbd !important;
      outline: none !important;
    }

    #${PAD_ID} .gz445-pad-button svg { width: 20px !important; height: 20px !important; display: block !important; pointer-events: none !important; }
    #${PAD_ID} .gz445-up { grid-column: 2 !important; grid-row: 1 !important; }
    #${PAD_ID} .gz445-left { grid-column: 1 !important; grid-row: 2 !important; }
    #${PAD_ID} .gz445-center { grid-column: 2 !important; grid-row: 2 !important; }
    #${PAD_ID} .gz445-right { grid-column: 3 !important; grid-row: 2 !important; }
    #${PAD_ID} .gz445-down { grid-column: 2 !important; grid-row: 3 !important; }
  `;
}

function attachMovement(element, direction) {
  let holdDelay = 0;
  let holdInterval = 0;
  let suppressClick = false;

  const stopHold = () => {
    if (holdDelay) window.clearTimeout(holdDelay);
    if (holdInterval) window.clearInterval(holdInterval);
    holdDelay = 0;
    holdInterval = 0;
  };

  const execute = (source) => moveWheel(direction, source);

  element.tabIndex = 0;
  element.setAttribute('role', 'button');
  element.dataset.gannzillaV446Direction = direction;

  element.addEventListener('pointerdown', (event) => {
    if (event.button != null && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClick = true;
    execute('pointer');
    holdDelay = window.setTimeout(() => {
      holdInterval = window.setInterval(() => execute('hold'), 75);
    }, 340);
  });

  ['pointerup', 'pointercancel', 'pointerleave'].forEach((name) => {
    element.addEventListener(name, stopHold);
  });

  element.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    execute('click');
  });

  element.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    execute('keyboard');
  });
}

function padButton(direction, className, markup, title) {
  const element = document.createElement('span');
  element.className = `gz445-pad-button ${className}`;
  element.innerHTML = markup;
  element.title = title;
  element.setAttribute('aria-label', title);
  attachMovement(element, direction);
  return element;
}

function createControl() {
  document.getElementById(OLD_CONTROL_ID)?.remove();
  document.getElementById(CONTROL_ID)?.remove();

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
  trigger.setAttribute('role', 'button');
  trigger.tabIndex = 0;
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const open = control.dataset.open !== 'true';
    control.dataset.open = open ? 'true' : 'false';
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  trigger.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    trigger.click();
  });

  const pad = document.createElement('div');
  pad.id = PAD_ID;
  pad.setAttribute('role', 'menu');
  pad.append(
    padButton('up', 'gz445-up', arrowMarkup('up'), ar ? 'تحريك العجلة للأعلى' : 'Move wheel up'),
    padButton('left', 'gz445-left', arrowMarkup('left'), ar ? 'تحريك العجلة لليسار' : 'Move wheel left'),
    padButton('center', 'gz445-center', centerMarkup(), ar ? 'إعادة العجلة إلى المنتصف والاتزان' : 'Center and balance wheel'),
    padButton('right', 'gz445-right', arrowMarkup('right'), ar ? 'تحريك العجلة لليمين' : 'Move wheel right'),
    padButton('down', 'gz445-down', arrowMarkup('down'), ar ? 'تحريك العجلة للأسفل' : 'Move wheel down'),
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
  document.getElementById(OLD_CONTROL_ID)?.remove();
  let control = document.getElementById(CONTROL_ID);
  if (!(control instanceof HTMLElement)) control = createControl();

  let frame = 0;
  let observer = null;
  const refresh = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      installStyle();
      document.getElementById(OLD_CONTROL_ID)?.remove();
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

  window.GANNZILLA_WHEEL_MOVE_CONTROL_V446 = true;
  window.__moveGannzillaWheelV446 = (direction) => moveWheel(direction, 'api');
  window.__auditGannzillaWheelMoveControlV446 = () => {
    const node = document.getElementById(CONTROL_ID);
    const trigger = document.getElementById(TRIGGER_ID);
    const zoom = document.getElementById(ZOOM_STRIP_ID);
    const canvas = findWheelCanvas();
    const rect = node?.getBoundingClientRect();
    const zoomRect = zoom?.getBoundingClientRect();
    return {
      ok: Boolean(node && trigger && canvas && rect?.width > 0 && rect?.height > 0),
      build: BUILD,
      enabled: boolParam('showWheelMoveControl', true),
      fixedLeftOfZoomStrip: Boolean(rect && zoomRect && rect.right <= zoomRect.left + 4),
      popupDirectionPad: true,
      movementDirections: ['up', 'left', 'center', 'right', 'down'],
      keyboardAuthorityFallback: true,
      directCanvasFallback: true,
      synchronizedPanEvents: true,
      currentOffset: readOffset(),
      movementCount,
      lastMovement,
    };
  };

  window[STATE_KEY] = { observer, onDocumentClick, onKeyDown };
}

install();
