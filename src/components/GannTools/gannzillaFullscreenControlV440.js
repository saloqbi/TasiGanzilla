const BUILD = 440;
const CONNECTION_CONTROL_ID = 'gannzilla-connection-control-v439';
const CONTROL_ID = 'gannzilla-fullscreen-control-v440';
const BUTTON_ID = 'gannzilla-fullscreen-button-v440';
const STYLE_ID = 'gannzilla-fullscreen-style-v440';
const STATE_KEY = '__gannzillaFullscreenControlV440';

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

function currentLanguage() {
  return params().get('lang') === 'ar' ? 'ar' : 'en';
}

function fullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}

function iconMarkup(active) {
  if (active) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" fill="none" stroke="#416d91" stroke-width="1.8" stroke-linecap="square" stroke-linejoin="miter"/>
        <path d="M9 9 5.5 5.5M15 9l3.5-3.5M9 15l-3.5 3.5M15 15l3.5 3.5" fill="none" stroke="#416d91" stroke-width="1.4" stroke-linecap="round"/>
      </svg>`;
  }

  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M9 3H3v6M15 3h6v6M3 15v6h6M21 15v6h-6" fill="none" stroke="#416d91" stroke-width="1.8" stroke-linecap="square" stroke-linejoin="miter"/>
      <path d="M8.5 8.5 4 4M15.5 8.5 20 4M8.5 15.5 4 20M15.5 15.5 20 20" fill="none" stroke="#416d91" stroke-width="1.4" stroke-linecap="round"/>
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
      box-sizing: border-box !important;
    }

    #${CONTROL_ID}, #${CONTROL_ID} * { box-sizing: border-box !important; }

    #${BUTTON_ID} {
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
      box-shadow: 0 1px 3px rgba(0,0,0,.18) !important;
    }

    #${BUTTON_ID}:hover,
    #${BUTTON_ID}[aria-pressed="true"] {
      background: linear-gradient(#ffffff, #dcecff) !important;
      border-color: #477da8 !important;
    }

    #${BUTTON_ID} svg {
      width: 20px !important;
      height: 20px !important;
      display: block !important;
      pointer-events: none !important;
    }
  `;
}

function updateButton() {
  const button = document.getElementById(BUTTON_ID);
  if (!(button instanceof HTMLButtonElement)) return;
  const active = Boolean(fullscreenElement());
  const ar = currentLanguage() === 'ar';
  button.innerHTML = iconMarkup(active);
  button.setAttribute('aria-pressed', active ? 'true' : 'false');
  button.title = active
    ? (ar ? 'إلغاء تكبير الصفحة' : 'Exit full screen')
    : (ar ? 'تكبير الصفحة' : 'Full screen');
  button.setAttribute('aria-label', button.title);
}

async function toggleFullscreen(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();

  try {
    if (fullscreenElement()) {
      if (typeof document.exitFullscreen === 'function') await document.exitFullscreen();
      else if (typeof document.webkitExitFullscreen === 'function') document.webkitExitFullscreen();
    } else {
      const target = document.documentElement;
      if (typeof target.requestFullscreen === 'function') {
        try { await target.requestFullscreen({ navigationUI: 'hide' }); }
        catch (_) { await target.requestFullscreen(); }
      } else if (typeof target.webkitRequestFullscreen === 'function') {
        target.webkitRequestFullscreen();
      }
    }
  } catch (_) {
    // Browsers may reject fullscreen when policy blocks it; keep the page usable.
  } finally {
    window.setTimeout(updateButton, 40);
  }
}

function createControl() {
  const control = document.createElement('div');
  control.id = CONTROL_ID;

  const button = document.createElement('button');
  button.id = BUTTON_ID;
  button.type = 'button';
  button.addEventListener('click', toggleFullscreen);
  control.appendChild(button);
  document.body.appendChild(control);
  updateButton();
  return control;
}

function positionControl(control) {
  const connection = document.getElementById(CONNECTION_CONTROL_ID);
  const size = 30;
  const gap = Math.round(numberParam('fullscreenControlGap', 4, 0, 20));

  if (connection instanceof HTMLElement) {
    const rect = connection.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      control.style.setProperty('left', `${Math.max(2, Math.round(rect.left - size - gap))}px`, 'important');
      control.style.setProperty('top', `${Math.round(rect.top + Math.max(0, (rect.height - size) / 2))}px`, 'important');
      control.style.removeProperty('right');
      return true;
    }
  }

  const languageRight = Math.round(numberParam('rightLanguageRight', 10, 2, 160));
  const languageWidth = Math.round(numberParam('rightLanguageWidth', 136, 104, 200));
  const connectionGap = Math.round(numberParam('connectionControlGap', 4, 0, 20));
  const top = Math.round(numberParam('rightLanguageTop', 8, 2, 160));
  control.style.setProperty('right', `${languageRight + languageWidth + connectionGap + size + gap}px`, 'important');
  control.style.setProperty('top', `${top}px`, 'important');
  control.style.removeProperty('left');
  return false;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showFullscreenControl', true) || window[STATE_KEY]) return;

  installStyle();
  let control = document.getElementById(CONTROL_ID);
  if (!(control instanceof HTMLElement)) control = createControl();

  let frame = 0;
  let bootstrapObserver = null;
  const position = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      installStyle();
      const current = document.getElementById(CONTROL_ID);
      if (!(current instanceof HTMLElement)) return;
      const connected = positionControl(current);
      updateButton();
      if (connected) {
        bootstrapObserver?.disconnect();
        bootstrapObserver = null;
      }
    });
  };

  position();
  [40, 120, 360, 900, 2000, 4000].forEach((delay) => window.setTimeout(position, delay));
  bootstrapObserver = new MutationObserver(position);
  bootstrapObserver.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('resize', position);
  window.addEventListener('scroll', position, true);
  document.addEventListener('fullscreenchange', updateButton);
  document.addEventListener('webkitfullscreenchange', updateButton);

  window.GANNZILLA_FULLSCREEN_CONTROL_V440 = true;
  window.__auditGannzillaFullscreenControlV440 = () => {
    const button = document.getElementById(BUTTON_ID);
    const connection = document.getElementById(CONNECTION_CONTROL_ID);
    const rect = button?.getBoundingClientRect();
    const connectionRect = connection?.getBoundingClientRect();
    return {
      ok: Boolean(button && rect?.width > 0 && rect?.height > 0),
      build: BUILD,
      enabled: boolParam('showFullscreenControl', true),
      fixedLeftOfConnectionIcon: Boolean(rect && connectionRect && rect.right <= connectionRect.left + 3),
      fullscreenApiConnected: true,
      fullscreenActive: Boolean(fullscreenElement()),
      escapeExitsFullscreen: true,
    };
  };

  window[STATE_KEY] = { bootstrapObserver };
}

install();
