const BUILD = 450;
const ZOOM_STRIP_ID = 'gannzilla-zoom-fullscreen-strip-v443';
const VISIBILITY_WRAP_ID = 'gannzilla-wheel-visibility-inline-v448';
const OLD_CONTROL_IDS = [
  'gannzilla-wheel-move-control-v444',
  'gannzilla-wheel-move-control-v445',
  'gannzilla-wheel-move-inline-v447',
];
const WRAP_ID = 'gannzilla-wheel-move-integrated-v450';
const TRIGGER_ID = 'gannzilla-wheel-move-trigger-v450';
const PAD_ID = 'gannzilla-wheel-move-pad-v450';
const STYLE_ID = 'gannzilla-wheel-move-integrated-style-v450';
const STATE_KEY = '__gannzillaWheelMoveIntegratedV450';
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
    // Runtime movement remains available if storage is blocked.
  }
}

function findWheelCanvas() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-keyboard-mouse-control-v413="true"]',
    'canvas[data-gannzilla-native-wheel-scrollbars-hidden-v417="true"]',
    'canvas[data-gannzilla-wheel-visibility-v448="true"]',
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
        && style.display !== 'none';
    })
    .map((canvas) => ({ canvas, area: canvas.width * canvas.height }))
    .sort((a, b) => b.area - a.area)[0]?.canvas || null;
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
    canvas.dataset.gannzillaWheelMoveIntegratedV450 = 'true';
    return true;
  };

  const applied = applyToCanvas();

  window.dispatchEvent(new CustomEvent('gannzilla:page-scrollbar-pan-v305', {
    detail: { ...next, source, build: BUILD },
  }));
  window.dispatchEvent(new CustomEvent('gannzilla:wheel-pan-offset-v305', {
    detail: { ...next, source, build: BUILD },
  }));
  window.dispatchEvent(new CustomEvent('gannzilla:wheel-move-v450', {
    detail: { ...next, source, build: BUILD },
  }));

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
    #${ZOOM_STRIP_ID} {
      width: 180px !important;
      min-width: 180px !important;
      max-width: 180px !important;
      overflow: visible !important;
      isolation: isolate !important;
      transform: translateX(-34px) !important;
      transform-origin: top left !important;
    }

    #${ZOOM_STRIP_ID} .gz443-zoom {
      flex: 0 0 112px !important;
      width: 112px !important;
      min-width: 112px !important;
      max-width: 112px !important;
    }

    #${VISIBILITY_WRAP_ID} {
      left: -34px !important;
    }

    #${WRAP_ID} {
      position: relative !important;
      left: auto !important;
      right: auto !important;
      top: auto !important;
      flex: 0 0 30px !important;
      width: 30px !important;
      min-width: 30px !important;
      max-width: 30px !important;
      height: 30px !important;
      min-height: 30px !important;
      max-height: 30px !important;
      margin: 0 !important;
      z-index: 2147483646 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      overflow: visible !important;
      direction: ltr !important;
      box-sizing: border-box !important;
    }

    #${WRAP_ID}, #${WRAP_ID} * { box-sizing: border-box !important; }

    #${TRIGGER_ID} {
      width: 30px !important;
      min-width: 30px !important;
      max-width: 30px !important;
      height: 30px !important;
      min-height: 30px !important;
      max-height: 30px !important;
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
      touch-action: none !important;
      box-shadow: 0 1px 3px rgba(0,0,0,.18) !important;
    }

    #${TRIGGER_ID}:hover,
    #${WRAP_ID}[data-open="true"] #${TRIGGER_ID} {
      background: linear-gradient(#ffffff, #dcecff) !important;
      border-color: #477da8 !important;
    }

    #${TRIGGER_ID} svg {
      width: 20px !important;
      height: 20px !important;
      display: block !important;
      pointer-events: none !important;
    }

    #${PAD_ID} {
      position: absolute !important;
      top: 32px !important;
      left: 0 !important;
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

    #${WRAP_ID}[data-open="true"] #${PAD_ID} { display: grid !important; }

    #${PAD_ID} .gz450-pad-button {
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

    #${PAD_ID} .gz450-pad-button:hover,
    #${PAD_ID} .gz450-pad-button:focus-visible {
      background: #dcecff !important;
      border-color: #6b9cbd !important;
      outline: none !important;
    }

    #${PAD_ID} .gz450-pad-button svg {
      width: 20px !important;
      height: 20px !important;
      display: block !important;
      pointer-events: none !important;
    }

    #${PAD_ID} .gz450-up { grid-column: 2 !important; grid-row: 1 !important; }
    #${PAD_ID} .gz450-left { grid-column: 1 !important; grid-row: 2 !important; }
    #${PAD_ID} .gz450-center { grid-column: 2 !important; grid-row: 2 !important; }
    #${PAD_ID} .gz450-right { grid-column: 3 !important; grid-row: 2 !important; }
    #${PAD_ID} .gz450-down { grid-column: 2 !important; grid-row: 3 !important; }
  `;
}

function clearHiddenState(node, display) {
  if (!(node instanceof HTMLElement)) return;
  node.removeAttribute('hidden');
  node.removeAttribute('aria-hidden');
  node.removeAttribute('role');
  node.removeAttribute('data-gannzilla-v145-hidden');
  node.removeAttribute('data-gannzilla-v145-previous-display');
  node.removeAttribute('data-gannzilla-toolbar-duplicate-hidden-v396');
  node.removeAttribute('data-gannzilla-duplicate-toolbar-v393');
  node.style.setProperty('display', display, 'important');
  node.style.setProperty('visibility', 'visible', 'important');
  node.style.setProperty('opacity', '1', 'important');
  node.style.setProperty('pointer-events', 'auto', 'important');
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
  element.dataset.gannzillaV450Direction = direction;

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
  element.className = `gz450-pad-button ${className}`;
  element.innerHTML = markup;
  element.title = title;
  element.setAttribute('aria-label', title);
  attachMovement(element, direction);
  return element;
}

function createControl() {
  const ar = language() === 'ar';
  const wrap = document.createElement('div');
  wrap.id = WRAP_ID;
  wrap.dataset.open = 'false';

  const trigger = document.createElement('span');
  trigger.id = TRIGGER_ID;
  trigger.innerHTML = triggerMarkup();
  trigger.title = ar ? 'تحريك العجلة' : 'Move wheel';
  trigger.setAttribute('aria-label', trigger.title);
  trigger.tabIndex = 0;
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const open = wrap.dataset.open !== 'true';
    wrap.dataset.open = open ? 'true' : 'false';
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  trigger.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    trigger.click();
  });

  const pad = document.createElement('div');
  pad.id = PAD_ID;
  pad.setAttribute('aria-label', ar ? 'اتجاهات تحريك العجلة' : 'Wheel movement directions');
  pad.append(
    padButton('up', 'gz450-up', arrowMarkup('up'), ar ? 'تحريك العجلة للأعلى' : 'Move wheel up'),
    padButton('left', 'gz450-left', arrowMarkup('left'), ar ? 'تحريك العجلة لليسار' : 'Move wheel left'),
    padButton('center', 'gz450-center', centerMarkup(), ar ? 'إعادة العجلة إلى المنتصف والاتزان' : 'Center and balance wheel'),
    padButton('right', 'gz450-right', arrowMarkup('right'), ar ? 'تحريك العجلة لليمين' : 'Move wheel right'),
    padButton('down', 'gz450-down', arrowMarkup('down'), ar ? 'تحريك العجلة للأسفل' : 'Move wheel down'),
  );

  wrap.append(trigger, pad);
  return wrap;
}

function removeObsoleteControls() {
  OLD_CONTROL_IDS.forEach((id) => document.getElementById(id)?.remove());
}

function mountIntegratedControl() {
  removeObsoleteControls();
  const strip = document.getElementById(ZOOM_STRIP_ID);
  if (!(strip instanceof HTMLElement)) return false;

  let wrap = document.getElementById(WRAP_ID);
  if (!(wrap instanceof HTMLElement)) wrap = createControl();

  const zoom = strip.querySelector('.gz443-zoom');
  if (zoom instanceof HTMLElement) {
    if (wrap.parentElement !== strip || wrap.nextElementSibling !== zoom) strip.insertBefore(wrap, zoom);
  } else if (wrap.parentElement !== strip) {
    strip.insertBefore(wrap, strip.firstChild);
  }

  clearHiddenState(strip, 'flex');
  clearHiddenState(wrap, 'block');
  clearHiddenState(document.getElementById(TRIGGER_ID), 'inline-flex');

  strip.style.setProperty('width', '180px', 'important');
  strip.style.setProperty('min-width', '180px', 'important');
  strip.style.setProperty('max-width', '180px', 'important');
  strip.style.setProperty('transform', 'translateX(-34px)', 'important');
  strip.style.setProperty('overflow', 'visible', 'important');

  const eye = document.getElementById(VISIBILITY_WRAP_ID);
  if (eye instanceof HTMLElement) eye.style.setProperty('left', '-34px', 'important');

  strip.dataset.gannzillaWheelMoveIntegratedV450 = 'true';
  return true;
}

function closePad() {
  const wrap = document.getElementById(WRAP_ID);
  if (!(wrap instanceof HTMLElement)) return;
  wrap.dataset.open = 'false';
  document.getElementById(TRIGGER_ID)?.setAttribute('aria-expanded', 'false');
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showWheelMoveControl', true) || window[STATE_KEY]) return;

  installStyle();
  let frame = 0;
  let stripObserver = null;

  const refresh = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      installStyle();
      const mounted = mountIntegratedControl();
      const strip = document.getElementById(ZOOM_STRIP_ID);
      if (mounted && !stripObserver && strip instanceof HTMLElement) {
        stripObserver = new MutationObserver(refresh);
        stripObserver.observe(strip, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'hidden', 'role', 'aria-hidden'],
        });
      }
    });
  };

  refresh();
  [20, 60, 140, 320, 700, 1400, 2800, 5000].forEach((delay) => window.setTimeout(refresh, delay));
  const bootstrapObserver = new MutationObserver(refresh);
  bootstrapObserver.observe(document.documentElement, { childList: true, subtree: true });

  const onDocumentClick = (event) => {
    const wrap = document.getElementById(WRAP_ID);
    if (wrap instanceof HTMLElement && !wrap.contains(event.target)) closePad();
  };
  const onKeyDown = (event) => { if (event.key === 'Escape') closePad(); };
  document.addEventListener('click', onDocumentClick, true);
  document.addEventListener('keydown', onKeyDown);
  window.addEventListener('resize', refresh);
  document.addEventListener('fullscreenchange', refresh);
  document.addEventListener('webkitfullscreenchange', refresh);

  window.GANNZILLA_WHEEL_MOVE_INTEGRATED_V450 = true;
  window.__auditGannzillaWheelMoveIntegratedV450 = () => {
    const strip = document.getElementById(ZOOM_STRIP_ID);
    const wrap = document.getElementById(WRAP_ID);
    const trigger = document.getElementById(TRIGGER_ID);
    const zoom = strip?.querySelector('.gz443-zoom');
    const eye = document.getElementById(VISIBILITY_WRAP_ID);
    const canvas = findWheelCanvas();
    const rect = trigger?.getBoundingClientRect();
    const zoomRect = zoom?.getBoundingClientRect();
    return {
      ok: Boolean(strip && wrap && trigger && canvas && rect?.width > 0 && rect?.height > 0),
      build: BUILD,
      enabled: boolParam('showWheelMoveControl', true),
      integratedAsRealStripItem: wrap?.parentElement === strip && wrap?.nextElementSibling === zoom,
      immediatelyLeftOfZoom: Boolean(rect && zoomRect && rect.right <= zoomRect.left + 2),
      eyeImmediatelyLeftOfMove: Boolean(eye && Number.parseFloat(getComputedStyle(eye).left) === -34),
      movementDirections: ['up', 'left', 'center', 'right', 'down'],
      wheelCanvasBound: Boolean(canvas),
      movementCount,
      lastMovement,
    };
  };

  window[STATE_KEY] = { bootstrapObserver, get stripObserver() { return stripObserver; }, onDocumentClick, onKeyDown };
}

install();
