const BUILD = 511;
const ROOT_ID = 'gannzilla-unified-wheel-tools-v453';
const PENCIL_ID = 'gannzilla-top-center-drawing-trigger-v471';
const CONTROL_ID = 'gannzilla-wheel-color-toggle-v511';
const STYLE_ID = 'gannzilla-wheel-color-toggle-style-v511';
const STATE_KEY = '__gannzillaWheelColorToggleV511';
const STORAGE_KEY = 'tasi-gannzilla-wheel-color-theme-v511';
const ORIGINAL_STROKES = new Set(['#b5b5b5', '#7a7a7a', '#c9c4b8', '#c5c5c5', '#d0d0d0']);

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function normalizeTheme(value) {
  const text = String(value || '').toLowerCase();
  if (text === 'black' || text === 'zinc') return text;
  return 'neutral';
}

function readTheme() {
  const query = params();
  if (query.has('wheelColorTheme')) return normalizeTheme(query.get('wheelColorTheme'));
  try { return normalizeTheme(localStorage.getItem(STORAGE_KEY)); }
  catch (_) { return 'neutral'; }
}

let theme = readTheme();
let previousStroke = null;
let patchedStroke = null;
let toggleCount = 0;
let lastToggle = null;
let positionFrame = 0;

function normalizedColor(value) {
  const text = String(value || '').trim().toLowerCase().replace(/\s+/g, '');
  if (/^#[0-9a-f]{6}$/.test(text)) return text;
  const rgb = text.match(/^rgba?\((\d+),(\d+),(\d+)/);
  if (!rgb) return text;
  return `#${[rgb[1], rgb[2], rgb[3]]
    .map((part) => Math.max(0, Math.min(255, Number(part))).toString(16).padStart(2, '0'))
    .join('')}`;
}

function isMainWheel(canvas) {
  if (!(canvas instanceof HTMLCanvasElement) || canvas.closest('aside')) return false;
  if (canvas.id === 'gannzilla-top-center-drawing-overlay-v471') return false;
  return canvas.dataset.gannzillaFinalWheelAuthorityV506 === 'true'
    || canvas.dataset.gannzillaFinalWheelAuthorityV491 === 'true'
    || canvas.dataset.gannzillaKeyboardMouseControlV459 === 'true';
}

function themeColor(original) {
  if (theme === 'black') return '#111111';
  if (theme === 'zinc') return '#b87333';
  return original;
}

function patchStroke() {
  if (patchedStroke || typeof CanvasRenderingContext2D === 'undefined') return true;
  const prototype = CanvasRenderingContext2D.prototype;
  previousStroke = prototype.stroke;
  if (typeof previousStroke !== 'function') return false;

  patchedStroke = function gannzillaWheelColorStroke(...args) {
    const original = normalizedColor(this.strokeStyle);
    if (!isMainWheel(this.canvas) || !ORIGINAL_STROKES.has(original) || theme === 'neutral') {
      return previousStroke.apply(this, args);
    }
    const saved = this.strokeStyle;
    this.strokeStyle = themeColor(saved);
    try { return previousStroke.apply(this, args); }
    finally { this.strokeStyle = saved; }
  };
  prototype.stroke = patchedStroke;
  return true;
}

function iconMarkup() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.2" fill="#fff" stroke="#66737e" stroke-width="1.1"/>
      <path d="M12 3.8a8.2 8.2 0 0 0 0 16.4Z" fill="#b87333"/>
      <path d="M12 3.8a8.2 8.2 0 0 1 0 16.4Z" fill="#111"/>
      <circle cx="12" cy="12" r="2.1" fill="#fff" stroke="#66737e" stroke-width=".8"/>
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
    #${CONTROL_ID}{position:fixed!important;width:30px!important;min-width:30px!important;max-width:30px!important;height:30px!important;margin:0!important;padding:4px!important;border:1px solid #8d969f!important;border-radius:0!important;background:linear-gradient(#fff,#dedede)!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;user-select:none!important;box-shadow:0 1px 3px rgba(0,0,0,.18)!important;box-sizing:border-box!important;z-index:2147483647!important;}
    #${CONTROL_ID}:hover,#${CONTROL_ID}[data-theme="black"],#${CONTROL_ID}[data-theme="zinc"]{background:linear-gradient(#fff,#f2e3d7)!important;border-color:#9a623f!important;}
    #${CONTROL_ID} svg{width:20px!important;height:20px!important;display:block!important;pointer-events:none!important;}
  `;
}

function persist() {
  try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) { /* runtime only */ }
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('wheelColorTheme', theme);
    url.searchParams.set('showWheelColorToggle', 'true');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime state remains active.
  }
}

function updateControl() {
  const control = document.getElementById(CONTROL_ID);
  if (!(control instanceof HTMLElement)) return;
  control.dataset.theme = theme;
  control.title = theme === 'neutral'
    ? 'لون خطوط العجلة — محايد'
    : theme === 'black'
      ? 'لون خطوط العجلة — أسود'
      : 'لون خطوط العجلة — نحاسي';
  control.setAttribute('aria-label', control.title);
}

function triggerRedraw(source) {
  window.dispatchEvent(new CustomEvent('gannzilla:canonical-property-change-v326', {
    detail: { path: 'appearance.wheelColorTheme', value: theme, source, build: BUILD },
  }));
}

function toggle() {
  theme = theme === 'neutral' ? 'black' : theme === 'black' ? 'zinc' : 'neutral';
  persist();
  updateControl();
  triggerRedraw('wheel-color-toggle');
  toggleCount += 1;
  lastToggle = { theme, at: Date.now() };
}

function ensureControl() {
  installStyle();
  let control = document.getElementById(CONTROL_ID);
  if (!(control instanceof HTMLElement)) {
    control?.remove();
    control = document.createElement('button');
    control.id = CONTROL_ID;
    control.type = 'button';
    control.innerHTML = iconMarkup();
    control.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggle();
    });
    document.body.appendChild(control);
  }
  updateControl();
  return control;
}

function positionControl() {
  positionFrame = 0;
  const control = ensureControl();
  const pencil = document.getElementById(PENCIL_ID);
  if (pencil instanceof HTMLElement) {
    const rect = pencil.getBoundingClientRect();
    if (rect.width > 1 && rect.height > 1) {
      control.style.setProperty('left', `${Math.max(2, Math.round(rect.left - 34))}px`, 'important');
      control.style.setProperty('top', `${Math.round(rect.top)}px`, 'important');
      control.style.removeProperty('right');
      return true;
    }
  }
  const root = document.getElementById(ROOT_ID);
  if (root instanceof HTMLElement) {
    const rect = root.getBoundingClientRect();
    if (rect.width > 1 && rect.height > 1) {
      control.style.setProperty('left', `${Math.max(2, Math.round(rect.left - 68))}px`, 'important');
      control.style.setProperty('top', `${Math.round(rect.top)}px`, 'important');
      control.style.removeProperty('right');
      return true;
    }
  }
  control.style.setProperty('right', '394px', 'important');
  control.style.setProperty('top', '8px', 'important');
  return false;
}

function schedulePosition() {
  cancelAnimationFrame(positionFrame);
  positionFrame = requestAnimationFrame(positionControl);
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode() || window[STATE_KEY]) return;
  patchStroke();
  ensureControl();
  schedulePosition();
  [50, 140, 360, 800, 1800, 3600].forEach((delay) => setTimeout(schedulePosition, delay));
  window.addEventListener('resize', schedulePosition);
  window.addEventListener('scroll', schedulePosition, true);
  document.addEventListener('fullscreenchange', schedulePosition);
  window.addEventListener('gannzilla:unified-wheel-tools-v453', schedulePosition);

  window.GANNZILLA_WHEEL_COLOR_TOGGLE_V511 = true;
  window.__auditGannzillaWheelColorToggleV511 = () => {
    const control = document.getElementById(CONTROL_ID);
    const pencil = document.getElementById(PENCIL_ID);
    const controlRect = control?.getBoundingClientRect();
    const pencilRect = pencil?.getBoundingClientRect();
    return {
      ok: Boolean(control && patchedStroke),
      build: BUILD,
      theme,
      leftOfPencil: Boolean(controlRect && pencilRect && controlRect.right <= pencilRect.left + 1),
      control30px: Boolean(controlRect && Math.round(controlRect.width) === 30 && Math.round(controlRect.height) === 30),
      toggleCount,
      lastToggle,
    };
  };
  window[STATE_KEY] = { schedulePosition };
}

install();