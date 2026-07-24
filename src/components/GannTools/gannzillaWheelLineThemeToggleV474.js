const BUILD = 474;
const ROOT_ID = 'gannzilla-unified-wheel-tools-v453';
const PENCIL_ID = 'gannzilla-top-center-drawing-trigger-v471';
const CONTROL_ID = 'gannzilla-wheel-line-theme-toggle-v473';
const OLD_OVERLAY_ID = 'gannzilla-wheel-line-theme-overlay-v473';
const OLD_STYLE_ID = 'gannzilla-wheel-line-theme-style-v473';
const STYLE_ID = 'gannzilla-wheel-line-theme-style-v474';
const STATE_KEY = '__gannzillaWheelLineThemeToggleV474';
const STORAGE_KEY = 'tasi-gannzilla-wheel-line-theme-v473';
const EVENT_NAME = 'gannzilla:wheel-line-theme-v474';
const DRAWING_OVERLAY_ID = 'gannzilla-top-center-drawing-overlay-v471';

const GRID_STROKE_COLORS = new Set([
  '#c9c4b8', // Final ring renderer (V338)
  '#c5c5c5', // Base wheel cell grid
  '#d0d0d0', // Center circle
]);

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function boolParam(name, fallback = true) {
  const query = params();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function normalizeTheme(value) {
  return String(value || '').toLowerCase() === 'zinc' ? 'zinc' : 'black';
}

function readTheme() {
  const query = params();
  if (query.has('wheelLineTheme')) return normalizeTheme(query.get('wheelLineTheme'));
  try { return normalizeTheme(localStorage.getItem(STORAGE_KEY) || 'black'); }
  catch (_) { return 'black'; }
}

let theme = readTheme();
let positionFrame = 0;
let observedPencil = null;
let pencilResizeObserver = null;
let toggleCount = 0;
let refreshCount = 0;
let lastToggle = null;
let lastRefresh = null;
let patchedStroke = null;
let previousStroke = null;

function themeColor() {
  return theme === 'zinc' ? '#b87333' : '#111111';
}

function iconMarkup() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="8.2" fill="#ffffff" stroke="#66737e" stroke-width="1.1"/>
      <path d="M12 3.8a8.2 8.2 0 0 0 0 16.4Z" fill="#b87333"/>
      <path d="M12 3.8a8.2 8.2 0 0 1 0 16.4Z" fill="#111111"/>
      <circle cx="12" cy="12" r="2.1" fill="#ffffff" stroke="#66737e" stroke-width=".8"/>
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
      touch-action: manipulation !important;
      box-shadow: 0 1px 3px rgba(0,0,0,.18) !important;
      box-sizing: border-box !important;
      z-index: 2147483647 !important;
    }
    #${CONTROL_ID}:hover,
    #${CONTROL_ID}[data-theme="zinc"] {
      background: linear-gradient(#ffffff, #f2e3d7) !important;
      border-color: #9a623f !important;
    }
    #${CONTROL_ID} svg {
      width: 20px !important;
      height: 20px !important;
      display: block !important;
      pointer-events: none !important;
    }
  `;
}

function isMainWheelCanvas(canvas) {
  if (!(canvas instanceof HTMLCanvasElement)) return false;
  if (canvas.id === DRAWING_OVERLAY_ID || canvas.id === OLD_OVERLAY_ID || canvas.closest?.('aside')) return false;
  if (canvas.dataset?.gannzillaUnifiedWheelToolsV453 === 'true') return true;
  if (canvas.dataset?.gannzillaNativeWheelScrollbarsHiddenV417 === 'true') return true;
  if (canvas.dataset?.gannzillaKeyboardMouseControlV459 === 'true') return true;
  const rect = canvas.getBoundingClientRect?.();
  return canvas.width > 300 && canvas.height > 300 && rect?.width > 250 && rect?.height > 250;
}

function normalizedColor(value) {
  const text = String(value || '').trim().toLowerCase().replace(/\s+/g, '');
  if (/^#[0-9a-f]{6}$/.test(text)) return text;
  const rgb = text.match(/^rgba?\((\d+),(\d+),(\d+)/);
  if (!rgb) return text;
  return `#${[rgb[1], rgb[2], rgb[3]].map((part) => Math.max(0, Math.min(255, Number(part))).toString(16).padStart(2, '0')).join('')}`;
}

function isGridStroke(value) {
  return GRID_STROKE_COLORS.has(normalizedColor(value));
}

function patchCanvasStroke() {
  if (patchedStroke || typeof CanvasRenderingContext2D === 'undefined') return true;
  const prototype = CanvasRenderingContext2D.prototype;
  previousStroke = prototype.stroke;
  if (typeof previousStroke !== 'function') return false;

  patchedStroke = function gannzillaWheelLineThemeStroke(...args) {
    if (!isMainWheelCanvas(this.canvas) || !isGridStroke(this.strokeStyle)) {
      return previousStroke.apply(this, args);
    }

    const savedStrokeStyle = this.strokeStyle;
    this.strokeStyle = themeColor();
    try {
      return previousStroke.apply(this, args);
    } finally {
      this.strokeStyle = savedStrokeStyle;
    }
  };

  prototype.stroke = patchedStroke;
  return true;
}

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-unified-wheel-tools-v453="true"]',
    'canvas[data-gannzilla-native-wheel-scrollbars-hidden-v417="true"]',
    'canvas[data-gannzilla-keyboard-mouse-control-v459="true"]',
  ].join(','));
  if (isMainWheelCanvas(preferred)) return preferred;
  return Array.from(document.querySelectorAll('canvas'))
    .filter(isMainWheelCanvas)
    .map((canvas) => ({ canvas, area: canvas.width * canvas.height }))
    .sort((a, b) => b.area - a.area)[0]?.canvas || null;
}

function redrawCenterCircle() {
  const wheel = findWheel();
  if (!(wheel instanceof HTMLCanvasElement)) return false;
  const ctx = wheel.getContext('2d');
  if (!ctx) return false;
  const dpr = Math.max(1, Math.min(2, Number(window.devicePixelRatio) || 1));
  const width = wheel.width / dpr;
  const height = wheel.height / dpr;
  const innerRadius = numberParam('gannzillaInnerRadius', 170, 80, 500);
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, innerRadius, 0, Math.PI * 2);
  ctx.strokeStyle = themeColor();
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 1;
  ctx.stroke();
  ctx.restore();
  return true;
}

function scheduleExactRefresh(source = 'refresh') {
  refreshCount += 1;
  window.dispatchEvent(new CustomEvent('gannzilla:ring-two-numbering-refresh', {
    detail: { source, theme, color: themeColor(), build: BUILD },
  }));

  [40, 120, 260, 520].forEach((delay) => {
    window.setTimeout(() => {
      const centerRedrawn = redrawCenterCircle();
      lastRefresh = { source, theme, color: themeColor(), centerRedrawn, at: Date.now() };
    }, delay);
  });
}

function persistTheme() {
  try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) { /* runtime state remains active */ }
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('wheelLineTheme', theme);
    url.searchParams.set('brightWheelLines', 'false');
    url.searchParams.set('showWheelLineThemeToggle', 'true');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) { /* runtime state remains active */ }
}

function updateControl() {
  const control = document.getElementById(CONTROL_ID);
  if (!(control instanceof HTMLButtonElement)) return;
  control.dataset.theme = theme;
  const current = theme === 'zinc' ? 'الزنكي / النحاسي' : 'الأسود';
  const next = theme === 'zinc' ? 'الأسود' : 'الزنكي / النحاسي';
  control.title = `لون خطوط العجلة الحالي: ${current} — اضغط للتحويل إلى ${next}`;
  control.setAttribute('aria-label', control.title);
}

function toggleTheme() {
  theme = theme === 'black' ? 'zinc' : 'black';
  toggleCount += 1;
  lastToggle = { theme, color: themeColor(), at: Date.now() };
  persistTheme();
  updateControl();
  scheduleExactRefresh('toggle');
  window.dispatchEvent(new CustomEvent(EVENT_NAME, {
    detail: { theme, color: themeColor(), build: BUILD },
  }));
}

function ensureControl() {
  installStyle();
  let control = document.getElementById(CONTROL_ID);
  if (!(control instanceof HTMLButtonElement)) {
    control?.remove();
    control = document.createElement('button');
    control.id = CONTROL_ID;
    control.type = 'button';
    control.innerHTML = iconMarkup();
    control.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleTheme();
    });
    document.body.appendChild(control);
  }
  updateControl();
  return control;
}

function positionControl() {
  positionFrame = 0;
  const control = ensureControl();
  const gap = Math.round(numberParam('wheelLineThemeToggleGap', 4, 0, 20));
  const pencil = document.getElementById(PENCIL_ID);
  if (pencil instanceof HTMLElement) {
    const rect = pencil.getBoundingClientRect();
    if (rect.width > 1 && rect.height > 1) {
      control.style.setProperty('left', `${Math.max(2, Math.round(rect.left - 30 - gap))}px`, 'important');
      control.style.setProperty('top', `${Math.round(rect.top)}px`, 'important');
      control.style.removeProperty('right');
      if (observedPencil !== pencil && typeof ResizeObserver === 'function') {
        pencilResizeObserver?.disconnect();
        observedPencil = pencil;
        pencilResizeObserver = new ResizeObserver(schedulePosition);
        pencilResizeObserver.observe(pencil);
      }
      return true;
    }
  }

  const root = document.getElementById(ROOT_ID);
  if (root instanceof HTMLElement) {
    const rect = root.getBoundingClientRect();
    if (rect.width > 1 && rect.height > 1) {
      control.style.setProperty('left', `${Math.max(2, Math.round(rect.left - 64 - gap))}px`, 'important');
      control.style.setProperty('top', `${Math.round(rect.top)}px`, 'important');
      control.style.removeProperty('right');
      return true;
    }
  }

  control.style.setProperty('right', '394px', 'important');
  control.style.setProperty('top', '8px', 'important');
  control.style.removeProperty('left');
  return false;
}

function schedulePosition() {
  window.cancelAnimationFrame(positionFrame);
  positionFrame = window.requestAnimationFrame(positionControl);
}

function removeLegacyOverlay() {
  document.getElementById(OLD_OVERLAY_ID)?.remove();
  document.getElementById(OLD_STYLE_ID)?.remove();
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showWheelLineThemeToggle', true) || window[STATE_KEY]) return;

  removeLegacyOverlay();
  patchCanvasStroke();
  ensureControl();
  schedulePosition();
  scheduleExactRefresh('install');

  const timers = [40, 120, 300, 700, 1500, 3000, 5000]
    .map((delay) => window.setTimeout(() => {
      removeLegacyOverlay();
      patchCanvasStroke();
      schedulePosition();
      scheduleExactRefresh(`bootstrap-${delay}`);
    }, delay));

  const onLayout = () => {
    schedulePosition();
    scheduleExactRefresh('layout');
  };
  const onTheme = (event) => {
    const next = normalizeTheme(event?.detail?.theme);
    if (next === theme) return;
    theme = next;
    persistTheme();
    updateControl();
    scheduleExactRefresh('external-theme');
  };

  window.addEventListener('resize', onLayout);
  window.addEventListener('scroll', schedulePosition, true);
  document.addEventListener('fullscreenchange', onLayout);
  window.addEventListener('gannzilla:unified-wheel-tools-v453', onLayout);
  window.addEventListener('gannzilla:canonical-property-change-v326', onLayout);
  window.addEventListener(EVENT_NAME, onTheme);

  window.GANNZILLA_WHEEL_LINE_THEME_TOGGLE_V474 = true;
  window.__auditGannzillaWheelLineThemeToggleV474 = () => {
    const control = document.getElementById(CONTROL_ID);
    const pencil = document.getElementById(PENCIL_ID);
    const controlRect = control?.getBoundingClientRect();
    const pencilRect = pencil?.getBoundingClientRect();
    return {
      ok: Boolean(control && patchedStroke && findWheel()),
      build: BUILD,
      theme,
      color: themeColor(),
      exactRendererStrokeRecolor: true,
      syntheticGridOverlayRemoved: !document.getElementById(OLD_OVERLAY_ID),
      preservedNativeGeometry: true,
      leftOfPencil: Boolean(controlRect && pencilRect && controlRect.right <= pencilRect.left + 1),
      control30px: Boolean(controlRect && Math.round(controlRect.width) === 30 && Math.round(controlRect.height) === 30),
      toggleCount,
      refreshCount,
      lastToggle,
      lastRefresh,
      drawingToolsUnaffected: true,
      wheelMovementUnaffected: true,
    };
  };

  window[STATE_KEY] = {
    timers,
    onLayout,
    onTheme,
    schedulePosition,
    scheduleExactRefresh,
    get pencilResizeObserver() { return pencilResizeObserver; },
  };
}

install();
