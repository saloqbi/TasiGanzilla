const BUILD = 479;
const STATE_KEY = '__gannzillaUnlimitedRingPaletteV479';
const PANEL_STORAGE_KEY = 'tasi-gannzilla-canonical-panel-v326';
const DRAWING_OVERLAY_ID = 'gannzilla-top-center-drawing-overlay-v471';
const THEME_OVERLAY_ID = 'gannzilla-wheel-line-theme-overlay-v473';
const TWO_PI = Math.PI * 2;
const MAX_SAFE_CANVAS_LOGICAL_SIZE = 15000;

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

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function readCanonical() {
  try {
    const runtime = window.__gannzillaCanonicalPanelStateV326;
    if (runtime && typeof runtime === 'object') return runtime;
    const saved = JSON.parse(localStorage.getItem(PANEL_STORAGE_KEY) || '{}');
    return saved && typeof saved === 'object' ? saved : {};
  } catch (_) { return {}; }
}

function settings() {
  const canonical = readCanonical();
  const query = params();
  const queryLevels = Number(query.get('levels'));
  const canonicalLevels = Number(canonical?.layout?.size);
  return {
    levels: clamp(Math.round(Number.isFinite(canonicalLevels) ? canonicalLevels : (Number.isFinite(queryLevels) ? queryLevels : 10)), 1, 9999),
    divisions: clamp(Math.round(Number(canonical?.layout?.view) || numberParam('divisions', 36, 3, 360)), 3, 360),
    startValue: Number.isFinite(Number(canonical?.price?.value)) ? Number(canonical.price.value) : numberParam('startValue', 1, -1e9, 1e9),
    increment: Number.isFinite(Number(canonical?.price?.increment)) ? Number(canonical.price.increment) : numberParam('increment', 1, -1e6, 1e6),
    clockwise: canonical?.layout?.clockwise !== false,
    visible: canonical?.layout?.visible !== false,
    innerRadius: numberParam('gannzillaInnerRadius', 170, 20, 1000),
    configuredRingWidth: numberParam('gannzillaRingWidth', 60, 4, 300),
    fontSize: numberParam('gannzillaFontSize', 13, 4, 40),
    fontWeight: Math.round(numberParam('gannzillaFontWeight', 700, 400, 900)),
  };
}

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-unified-wheel-tools-v453="true"]',
    'canvas[data-gannzilla-native-wheel-scrollbars-hidden-v417="true"]',
    'canvas[data-gannzilla-keyboard-mouse-control-v459="true"]',
  ].join(','));
  if (preferred instanceof HTMLCanvasElement && !preferred.closest('aside')) return preferred;
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement) || canvas.id === DRAWING_OVERLAY_ID || canvas.id === THEME_OVERLAY_ID || canvas.closest('aside')) return false;
      const rect = canvas.getBoundingClientRect();
      return rect.width > 250 && rect.height > 250;
    })
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

function polar(cx, cy, radius, degrees) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
}

function wedge(ctx, cx, cy, inner, outer, startDegrees, endDegrees) {
  const start = ((startDegrees - 90) * Math.PI) / 180;
  const end = ((endDegrees - 90) * Math.PI) / 180;
  const anticlockwise = endDegrees < startDegrees;
  ctx.beginPath();
  ctx.arc(cx, cy, outer, start, end, anticlockwise);
  ctx.arc(cx, cy, inner, end, start, !anticlockwise);
  ctx.closePath();
}

function digitalRoot(value) {
  const integer = Math.abs(Math.trunc(Number(value) || 0));
  return integer === 0 ? 0 : 1 + ((integer - 1) % 9);
}

function numberColor(value) {
  const root = digitalRoot(value);
  if (root === 1 || root === 4 || root === 7) return '#a10f1f';
  if (root === 2 || root === 5 || root === 8) return '#1457d9';
  return '#111111';
}

function drawText(ctx, value, x, y, fontSize, maxWidth, weight) {
  ctx.save();
  ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5);
  ctx.font = `${weight} ${fontSize}px Tahoma, Arial, sans-serif`;
  ctx.fillStyle = numberColor(value);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(value), 0, 0, Math.max(4, maxWidth));
  ctx.restore();
}

let frame = 0;
let drawCount = 0;
let lastDraw = null;

function drawAlternatingPalette(source = 'refresh') {
  frame = 0;
  const canvas = findWheel();
  const cfg = settings();
  if (!(canvas instanceof HTMLCanvasElement) || !cfg.visible) return false;

  const totalRingCount = cfg.levels + 1;
  const maximumRadius = (MAX_SAFE_CANVAS_LOGICAL_SIZE - 240) / 2;
  const effectiveRingWidth = Math.min(cfg.configuredRingWidth, Math.max(1, (maximumRadius - cfg.innerRadius) / totalRingCount));
  const requiredRadius = cfg.innerRadius + totalRingCount * effectiveRingWidth;
  const logicalSize = Math.ceil(Math.min(MAX_SAFE_CANVAS_LOGICAL_SIZE, requiredRadius * 2 + 180));
  const dpr = clamp(Number(window.devicePixelRatio) || 1, 1, 2);
  const oldLogicalWidth = Math.max(1, canvas.width / dpr);
  const rect = canvas.getBoundingClientRect();
  const visualScale = rect.width / oldLogicalWidth;

  if (Math.abs(oldLogicalWidth - logicalSize) > 1 || Math.abs(canvas.height / dpr - logicalSize) > 1) {
    canvas.width = Math.ceil(logicalSize * dpr);
    canvas.height = Math.ceil(logicalSize * dpr);
    canvas.style.setProperty('width', `${logicalSize * visualScale}px`, 'important');
    canvas.style.setProperty('height', `${logicalSize * visualScale}px`, 'important');
  }

  const width = canvas.width / dpr;
  const height = canvas.height / dpr;
  const cx = width / 2;
  const cy = height / 2;
  const sector = 360 / cfg.divisions;
  const direction = cfg.clockwise ? 1 : -1;
  const northOffset = direction * sector / 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.beginPath();
  ctx.arc(cx, cy, cfg.innerRadius, 0, TWO_PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#c9c4b8';
  ctx.lineWidth = 0.82;
  ctx.stroke();

  const scaledFontSize = Math.max(3, Math.min(cfg.fontSize, effectiveRingWidth * 0.46));
  for (let ring = 1; ring <= totalRingCount; ring += 1) {
    const inner = cfg.innerRadius + (ring - 1) * effectiveRingWidth;
    const outer = inner + effectiveRingWidth;
    const mid = (inner + outer) / 2;
    const numericRingIndex = ring - 2;
    const fill = ring === 1 || numericRingIndex % 2 !== 0 ? '#f7f5f0' : '#d8d4cc';
    const maxWidth = (TWO_PI * mid / cfg.divisions) * 0.78;

    for (let index = 0; index < cfg.divisions; index += 1) {
      const startDegrees = northOffset + direction * index * sector;
      const endDegrees = northOffset + direction * (index + 1) * sector;
      const centerDegrees = northOffset + direction * (index + 0.5) * sector;
      wedge(ctx, cx, cy, inner, outer, startDegrees, endDegrees);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = '#c9c4b8';
      ctx.lineWidth = 0.82;
      ctx.stroke();

      const point = polar(cx, cy, mid, centerDegrees);
      const value = ring === 1
        ? ((cfg.startValue + index * cfg.increment - 1) % cfg.divisions + cfg.divisions) % cfg.divisions + 1
        : cfg.startValue + (numericRingIndex * cfg.divisions + index) * cfg.increment;
      const displayValue = Number.isInteger(value) ? value : Number(value.toFixed(4));
      drawText(ctx, displayValue, point.x, point.y, ring === 1 ? Math.max(4, scaledFontSize) : scaledFontSize, maxWidth, ring === 1 ? 800 : cfg.fontWeight);
    }
  }

  ctx.restore();
  canvas.dataset.gannzillaUnlimitedRingPaletteV479 = 'true';
  canvas.dataset.gannzillaRingPalette = 'alternating-dark-light';
  drawCount += 1;
  lastDraw = { source, levels: cfg.levels, totalRingCount, effectiveRingWidth, dark: '#d8d4cc', light: '#f7f5f0', at: Date.now() };
  window.dispatchEvent(new CustomEvent('gannzilla:wheel-pan-offset-v305', { detail: { source: 'unlimited-ring-palette-v479', build: BUILD } }));
  return true;
}

function schedule(source = 'schedule') {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => drawAlternatingPalette(source));
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('unlimitedRingPalette', true) || window[STATE_KEY]) return;
  schedule('install');
  const timers = [80, 180, 380, 800, 1600, 3200, 5200].map((delay) => setTimeout(() => schedule(`bootstrap-${delay}`), delay));
  const onChange = () => setTimeout(() => schedule('change'), 25);
  document.addEventListener('input', onChange, true);
  document.addEventListener('change', onChange, true);
  window.addEventListener('resize', onChange);
  window.addEventListener('gannzilla:canonical-property-change-v326', onChange);
  window.addEventListener('gannzilla:unlimited-ring-layers-v478', onChange);
  window.GANNZILLA_UNLIMITED_RING_PALETTE_V479 = true;
  window.__auditGannzillaUnlimitedRingPaletteV479 = () => ({
    ok: findWheel()?.dataset?.gannzillaUnlimitedRingPaletteV479 === 'true',
    build: BUILD,
    alternatingDarkLightAcrossAllLayers: true,
    dark: '#d8d4cc',
    light: '#f7f5f0',
    drawCount,
    lastDraw,
  });
  window[STATE_KEY] = { timers, onChange, schedule };
}

install();
