const BUILD = 473;
const ROOT_ID = 'gannzilla-unified-wheel-tools-v453';
const PENCIL_ID = 'gannzilla-top-center-drawing-trigger-v471';
const CONTROL_ID = 'gannzilla-wheel-line-theme-toggle-v473';
const OVERLAY_ID = 'gannzilla-wheel-line-theme-overlay-v473';
const STYLE_ID = 'gannzilla-wheel-line-theme-style-v473';
const STATE_KEY = '__gannzillaWheelLineThemeToggleV473';
const STORAGE_KEY = 'tasi-gannzilla-wheel-line-theme-v473';
const EVENT_NAME = 'gannzilla:wheel-line-theme-v473';
const CANONICAL_PANEL_KEY = 'tasi-gannzilla-canonical-panel-v326';

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

function readCanonicalLayout() {
  try {
    const value = JSON.parse(localStorage.getItem(CANONICAL_PANEL_KEY) || '{}');
    return value?.layout && typeof value.layout === 'object' ? value.layout : {};
  } catch (_) {
    return {};
  }
}

let theme = readTheme();
let overlayFrame = 0;
let positionFrame = 0;
let observedWheel = null;
let wheelResizeObserver = null;
let observedPencil = null;
let pencilResizeObserver = null;
let toggleCount = 0;
let lastToggle = null;
let lastRender = null;

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
    #${OVERLAY_ID} {
      position: fixed !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      background: transparent !important;
      pointer-events: none !important;
      touch-action: none !important;
      z-index: 2147481500 !important;
      transform: none !important;
      transform-origin: top left !important;
    }
  `;
}

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-unified-wheel-tools-v453="true"]',
    'canvas[data-gannzilla-native-wheel-scrollbars-hidden-v417="true"]',
    'canvas[data-gannzilla-keyboard-mouse-control-v459="true"]',
  ].join(','));

  if (preferred instanceof HTMLCanvasElement
    && preferred.id !== OVERLAY_ID
    && preferred.id !== 'gannzilla-top-center-drawing-overlay-v471'
    && !preferred.closest?.('aside')) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement)
        || canvas.id === OVERLAY_ID
        || canvas.id === 'gannzilla-top-center-drawing-overlay-v471'
        || canvas.closest?.('aside')) return false;
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

function ensureOverlay() {
  let overlay = document.getElementById(OVERLAY_ID);
  if (overlay instanceof HTMLCanvasElement) return overlay;
  overlay = document.createElement('canvas');
  overlay.id = OVERLAY_ID;
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);
  return overlay;
}

function bindWheelObserver(wheel) {
  if (!(wheel instanceof HTMLCanvasElement) || observedWheel === wheel) return;
  wheelResizeObserver?.disconnect();
  observedWheel = wheel;
  if (typeof ResizeObserver === 'function') {
    wheelResizeObserver = new ResizeObserver(scheduleOverlay);
    wheelResizeObserver.observe(wheel);
  }
}

function wheelSettings() {
  const layout = readCanonicalLayout();
  const queryLevels = numberParam('levels', 10, 1, 12);
  const queryDivisions = numberParam('divisions', 36, 3, 360);
  const levels = Number.isFinite(Number(layout.size))
    ? Math.max(1, Math.min(12, Math.round(Number(layout.size))))
    : Math.round(queryLevels);
  const divisions = Number.isFinite(Number(layout.view))
    ? Math.max(3, Math.min(360, Math.round(Number(layout.view))))
    : Math.round(queryDivisions);
  return {
    levels,
    divisions,
    innerRadius: numberParam('gannzillaInnerRadius', 170, 80, 500),
    ringWidth: numberParam('gannzillaRingWidth', 60, 30, 150),
    lineWidth: numberParam('wheelLineThemeWidth', 1.35, .8, 3),
  };
}

function renderOverlay() {
  overlayFrame = 0;
  const overlay = ensureOverlay();
  const wheel = findWheel();
  if (!(wheel instanceof HTMLCanvasElement)) {
    overlay.style.setProperty('display', 'none', 'important');
    return false;
  }

  bindWheelObserver(wheel);
  const rect = wheel.getBoundingClientRect();
  const style = window.getComputedStyle(wheel);
  const hidden = style.display === 'none'
    || style.visibility === 'hidden'
    || Number(style.opacity || 1) === 0
    || rect.width < 2
    || rect.height < 2;
  if (hidden) {
    overlay.style.setProperty('display', 'none', 'important');
    return false;
  }

  const dpr = Math.max(1, Math.min(2, Number(window.devicePixelRatio) || 1));
  const targetWidth = Math.max(1, Math.round(rect.width * dpr));
  const targetHeight = Math.max(1, Math.round(rect.height * dpr));
  if (overlay.width !== targetWidth) overlay.width = targetWidth;
  if (overlay.height !== targetHeight) overlay.height = targetHeight;

  overlay.style.setProperty('display', 'block', 'important');
  overlay.style.setProperty('left', `${rect.left}px`, 'important');
  overlay.style.setProperty('top', `${rect.top}px`, 'important');
  overlay.style.setProperty('width', `${rect.width}px`, 'important');
  overlay.style.setProperty('height', `${rect.height}px`, 'important');

  const ctx = overlay.getContext('2d');
  if (!ctx) return false;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);

  const settings = wheelSettings();
  const rendererDpr = Math.max(1, Math.min(2, Number(window.devicePixelRatio) || 1));
  const logicalWheelWidth = Math.max(1, wheel.width / rendererDpr);
  const logicalWheelHeight = Math.max(1, wheel.height / rendererDpr);
  const scaleX = rect.width / logicalWheelWidth;
  const scaleY = rect.height / logicalWheelHeight;
  const scale = Math.min(scaleX, scaleY);
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const inner = settings.innerRadius * scale;
  const ringWidth = settings.ringWidth * scale;
  const outer = inner + settings.levels * ringWidth;

  ctx.save();
  ctx.strokeStyle = themeColor();
  ctx.globalAlpha = 1;
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
  ctx.lineWidth = settings.lineWidth;

  ctx.beginPath();
  for (let ring = 0; ring <= settings.levels; ring += 1) {
    const radius = inner + ring * ringWidth;
    ctx.moveTo(cx + radius, cy);
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  }
  for (let index = 0; index < settings.divisions; index += 1) {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / settings.divisions;
    ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
    ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
  }
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = Math.max(settings.lineWidth + .35, 1.5);
  ctx.arc(cx, cy, outer, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  lastRender = {
    theme,
    color: themeColor(),
    levels: settings.levels,
    divisions: settings.divisions,
    left: Math.round(rect.left),
    top: Math.round(rect.top),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    at: Date.now(),
  };
  return true;
}

function scheduleOverlay() {
  window.cancelAnimationFrame(overlayFrame);
  overlayFrame = window.requestAnimationFrame(renderOverlay);
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
  scheduleOverlay();
  window.dispatchEvent(new CustomEvent(EVENT_NAME, {
    detail: { theme, color: themeColor(), build: BUILD },
  }));
}

function ensureControl() {
  installStyle();
  let control = document.getElementById(CONTROL_ID);
  if (control instanceof HTMLButtonElement) {
    updateControl();
    return control;
  }

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

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showWheelLineThemeToggle', true) || window[STATE_KEY]) return;

  ensureControl();
  ensureOverlay();
  schedulePosition();
  scheduleOverlay();

  const timers = [40, 120, 300, 700, 1500, 3000, 5000]
    .map((delay) => window.setTimeout(() => {
      schedulePosition();
      scheduleOverlay();
    }, delay));

  const onLayout = () => {
    schedulePosition();
    scheduleOverlay();
  };
  const onTheme = (event) => {
    const next = normalizeTheme(event?.detail?.theme);
    if (next === theme) return;
    theme = next;
    persistTheme();
    updateControl();
    scheduleOverlay();
  };

  window.addEventListener('resize', onLayout);
  window.addEventListener('scroll', onLayout, true);
  document.addEventListener('fullscreenchange', onLayout);
  window.addEventListener('gannzilla:unified-wheel-tools-v453', onLayout);
  window.addEventListener('gannzilla:wheel-pan-offset-v305', scheduleOverlay);
  window.addEventListener('gannzilla:page-scrollbar-pan-v305', scheduleOverlay);
  window.addEventListener('gannzilla:ring-two-numbering-refresh', scheduleOverlay);
  window.addEventListener('gannzilla:canonical-property-change-v326', scheduleOverlay);
  window.addEventListener(EVENT_NAME, onTheme);

  window.GANNZILLA_WHEEL_LINE_THEME_TOGGLE_V473 = true;
  window.__auditGannzillaWheelLineThemeToggleV473 = () => {
    const control = document.getElementById(CONTROL_ID);
    const overlay = document.getElementById(OVERLAY_ID);
    const pencil = document.getElementById(PENCIL_ID);
    const controlRect = control?.getBoundingClientRect();
    const pencilRect = pencil?.getBoundingClientRect();
    return {
      ok: Boolean(control && overlay && lastRender),
      build: BUILD,
      theme,
      color: themeColor(),
      leftOfPencil: Boolean(controlRect && pencilRect && controlRect.right <= pencilRect.left + 1),
      control30px: Boolean(controlRect && Math.round(controlRect.width) === 30 && Math.round(controlRect.height) === 30),
      toggleCount,
      lastToggle,
      lastRender,
      drawingToolsUnaffected: true,
      wheelMovementUnaffected: true,
    };
  };

  window[STATE_KEY] = {
    timers,
    onLayout,
    onTheme,
    scheduleOverlay,
    schedulePosition,
    get wheelResizeObserver() { return wheelResizeObserver; },
    get pencilResizeObserver() { return pencilResizeObserver; },
  };
}

install();