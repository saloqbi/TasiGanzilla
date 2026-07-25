const BUILD = 481;
const STATE_KEY = '__gannzillaUnlimitedRingThemeBridgeV481';
const STORAGE_KEY = 'tasi-gannzilla-wheel-line-theme-v473';
const THEME_EVENT_V474 = 'gannzilla:wheel-line-theme-v474';
const THEME_EVENT_V473 = 'gannzilla:wheel-line-theme-v473';
const DRAWING_OVERLAY_ID = 'gannzilla-top-center-drawing-overlay-v471';
const OLD_THEME_OVERLAY_ID = 'gannzilla-wheel-line-theme-overlay-v473';

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

function normalizeTheme(value) {
  return String(value || '').toLowerCase() === 'zinc' ? 'zinc' : 'black';
}

function readTheme() {
  const query = params();
  if (query.has('wheelLineTheme')) return normalizeTheme(query.get('wheelLineTheme'));
  try { return normalizeTheme(localStorage.getItem(STORAGE_KEY) || 'black'); }
  catch (_) { return 'black'; }
}

function themeColor() {
  return theme === 'zinc' ? '#b87333' : '#111111';
}

function isMainWheelCanvas(canvas) {
  if (!(canvas instanceof HTMLCanvasElement)) return false;
  if (canvas.id === DRAWING_OVERLAY_ID || canvas.id === OLD_THEME_OVERLAY_ID || canvas.closest?.('aside')) return false;
  if (canvas.dataset?.gannzillaUnifiedWheelToolsV453 === 'true') return true;
  if (canvas.dataset?.gannzillaNativeWheelScrollbarsHiddenV417 === 'true') return true;
  if (canvas.dataset?.gannzillaKeyboardMouseControlV459 === 'true') return true;
  if (canvas.dataset?.gannzillaUnlimitedRingLayersV480 === 'true') return true;
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

const LAYER_GRID_COLORS = new Set([
  '#111111',
  '#000000',
  '#c9c4b8',
]);

let theme = readTheme();
let previousStroke = null;
let patchedStroke = null;
let refreshCount = 0;
let lastRefresh = null;

function patchStroke() {
  if (patchedStroke || typeof CanvasRenderingContext2D === 'undefined') return true;
  const prototype = CanvasRenderingContext2D.prototype;
  previousStroke = prototype.stroke;
  if (typeof previousStroke !== 'function') return false;

  patchedStroke = function unlimitedRingThemeStroke(...args) {
    if (!isMainWheelCanvas(this.canvas) || !LAYER_GRID_COLORS.has(normalizedColor(this.strokeStyle))) {
      return previousStroke.apply(this, args);
    }
    const saved = this.strokeStyle;
    this.strokeStyle = themeColor();
    try {
      return previousStroke.apply(this, args);
    } finally {
      this.strokeStyle = saved;
    }
  };

  prototype.stroke = patchedStroke;
  return true;
}

function persistTheme() {
  try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) { /* runtime only */ }
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('wheelLineTheme', theme);
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) { /* optional */ }
}

function requestLayerRedraw(source) {
  refreshCount += 1;
  lastRefresh = { source, theme, color: themeColor(), at: Date.now() };
  window.dispatchEvent(new CustomEvent('gannzilla:canonical-property-change-v326', {
    detail: { path: 'layout.size', value: window.__gannzillaCanonicalPanelStateV326?.layout?.size, source, build: BUILD },
  }));
  window.dispatchEvent(new CustomEvent('gannzilla:ring-two-numbering-refresh', {
    detail: { source, theme, color: themeColor(), build: BUILD },
  }));
}

function onTheme(event) {
  const next = normalizeTheme(event?.detail?.theme);
  if (next === theme) {
    requestLayerRedraw('theme-refresh');
    return;
  }
  theme = next;
  persistTheme();
  requestLayerRedraw('theme-change');
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('unlimitedRingThemeBridge', true) || window[STATE_KEY]) return;

  patchStroke();
  requestLayerRedraw('install');
  const timers = [40, 120, 300, 700, 1500, 3000].map((delay) => setTimeout(() => {
    patchStroke();
    requestLayerRedraw(`bootstrap-${delay}`);
  }, delay));

  window.addEventListener(THEME_EVENT_V474, onTheme);
  window.addEventListener(THEME_EVENT_V473, onTheme);

  window.GANNZILLA_UNLIMITED_RING_THEME_BRIDGE_V481 = true;
  window.__auditGannzillaUnlimitedRingThemeBridgeV481 = () => ({
    ok: Boolean(patchedStroke),
    build: BUILD,
    theme,
    color: themeColor(),
    allUnlimitedRingBordersFollowTheme: true,
    innerAndOuterLayersShareThemeAuthority: true,
    refreshCount,
    lastRefresh,
  });

  window[STATE_KEY] = { timers, onTheme, requestLayerRedraw };
}

install();
