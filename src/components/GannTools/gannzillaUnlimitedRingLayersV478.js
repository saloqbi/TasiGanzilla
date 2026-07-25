const BUILD = 480;
const STATE_KEY = '__gannzillaUnlimitedRingLayersV480';
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';
const PANEL_STORAGE_KEY = 'tasi-gannzilla-canonical-panel-v326';
const DRAWING_OVERLAY_ID = 'gannzilla-top-center-drawing-overlay-v471';
const THEME_OVERLAY_ID = 'gannzilla-wheel-line-theme-overlay-v473';
const TWO_PI = Math.PI * 2;
const MAX_SAFE_CANVAS_LOGICAL_SIZE = 15000;
const MIN_LAYER_COUNT = 1;
const MAX_ACCEPTED_LAYER_COUNT = 9999;
const LIGHT_FILL = '#f7f5f0';
const DARK_FILL = '#d8d4cc';
const GRID_STROKE = '#111111';

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

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

function readCanonical() {
  try {
    const runtime = window.__gannzillaCanonicalPanelStateV326;
    if (runtime && typeof runtime === 'object') return runtime;
    const saved = JSON.parse(localStorage.getItem(PANEL_STORAGE_KEY) || '{}');
    return saved && typeof saved === 'object' ? saved : {};
  } catch (_) { return {}; }
}

function persistLayerCount(levels, source = 'input') {
  const safe = clamp(Math.round(Number(levels) || 1), MIN_LAYER_COUNT, MAX_ACCEPTED_LAYER_COUNT);
  try {
    const current = readCanonical();
    const next = {
      ...current,
      layout: { ...(current.layout || {}), size: safe },
    };
    localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(next));
    window.__gannzillaCanonicalPanelStateV326 = next;
    window.__gannzillaReferencePanelStateV421 = next;
  } catch (_) { /* runtime rendering still continues */ }
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('levels', String(safe));
    url.searchParams.set('unlimitedRingLayers', 'true');
    url.searchParams.set('uniformExtendedRingWidth', 'false');
    url.searchParams.set('allRingBordersBlack', 'true');
    url.searchParams.set('strictAlternatingRingPalette', 'true');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) { /* URL persistence is optional */ }
  window.dispatchEvent(new CustomEvent('gannzilla:canonical-property-change-v326', {
    detail: { path: 'layout.size', value: safe, source, build: BUILD },
  }));
  window.dispatchEvent(new CustomEvent('gannzilla:unlimited-ring-layers-v480', {
    detail: { levels: safe, source, build: BUILD },
  }));
  return safe;
}

function findSizeInput() {
  const panel = document.getElementById(PANEL_ID);
  if (!(panel instanceof HTMLElement)) return null;
  const rows = Array.from(panel.querySelectorAll('.gz421-row'));
  const row = rows.find((node) => String(node.querySelector('.gz421-label')?.textContent || '').trim().toLowerCase() === 'size');
  const input = row?.querySelector('input[type="number"]');
  return input instanceof HTMLInputElement ? input : null;
}

let boundSizeInput = null;
let sizeInputHandler = null;

function patchSizeInput() {
  const input = findSizeInput();
  if (!(input instanceof HTMLInputElement)) return false;
  input.removeAttribute('max');
  input.min = String(MIN_LAYER_COUNT);
  input.step = '1';
  input.dataset.gannzillaUnlimitedLayersV480 = 'true';
  input.title = 'عدد الطبقات مفتوح — أدخل أي عدد صحيح موجب';
  if (boundSizeInput !== input) {
    if (boundSizeInput && sizeInputHandler) {
      boundSizeInput.removeEventListener('input', sizeInputHandler, true);
      boundSizeInput.removeEventListener('change', sizeInputHandler, true);
    }
    sizeInputHandler = (event) => {
      const raw = Number(event.currentTarget?.value);
      if (!Number.isFinite(raw) || raw < MIN_LAYER_COUNT) return;
      persistLayerCount(raw, event.type);
      schedule('size-input');
    };
    input.addEventListener('input', sizeInputHandler, true);
    input.addEventListener('change', sizeInputHandler, true);
    boundSizeInput = input;
  }
  return true;
}

function settings() {
  const canonical = readCanonical();
  const query = params();
  const queryLevels = Number(query.get('levels'));
  const canonicalLevels = Number(canonical?.layout?.size);
  const levels = clamp(
    Math.round(Number.isFinite(canonicalLevels) ? canonicalLevels : (Number.isFinite(queryLevels) ? queryLevels : 10)),
    MIN_LAYER_COUNT,
    MAX_ACCEPTED_LAYER_COUNT,
  );
  const divisionsValue = Number(canonical?.layout?.view);
  const divisions = clamp(Math.round(Number.isFinite(divisionsValue) ? divisionsValue : numberParam('divisions', 36, 3, 360)), 3, 360);
  const startValue = Number.isFinite(Number(canonical?.price?.value)) ? Number(canonical.price.value) : numberParam('startValue', 1, -1e9, 1e9);
  const increment = Number.isFinite(Number(canonical?.price?.increment)) ? Number(canonical.price.increment) : numberParam('increment', 1, -1e6, 1e6);
  return {
    levels,
    divisions,
    startValue,
    increment,
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

function drawUnlimitedWheel(source = 'refresh') {
  frame = 0;
  patchSizeInput();
  const canvas = findWheel();
  const cfg = settings();
  if (!(canvas instanceof HTMLCanvasElement) || !cfg.visible) return false;

  const totalRingCount = cfg.levels + 1;
  const maximumRadius = (MAX_SAFE_CANVAS_LOGICAL_SIZE - 240) / 2;
  const effectiveRingWidth = Math.min(
    cfg.configuredRingWidth,
    Math.max(1, (maximumRadius - cfg.innerRadius) / totalRingCount),
  );
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
  ctx.strokeStyle = GRID_STROKE;
  ctx.lineWidth = 0.9;
  ctx.stroke();

  const scaledFontSize = Math.max(3, Math.min(cfg.fontSize, effectiveRingWidth * 0.46));
  for (let ring = 1; ring <= totalRingCount; ring += 1) {
    const inner = cfg.innerRadius + (ring - 1) * effectiveRingWidth;
    const outer = inner + effectiveRingWidth;
    const mid = (inner + outer) / 2;
    const numericRingIndex = ring - 2;
    const fill = ring === 1 ? LIGHT_FILL : (numericRingIndex % 2 === 0 ? DARK_FILL : LIGHT_FILL);
    const maxWidth = (TWO_PI * mid / cfg.divisions) * 0.78;

    for (let index = 0; index < cfg.divisions; index += 1) {
      const startDegrees = northOffset + direction * index * sector;
      const endDegrees = northOffset + direction * (index + 1) * sector;
      const centerDegrees = northOffset + direction * (index + 0.5) * sector;
      wedge(ctx, cx, cy, inner, outer, startDegrees, endDegrees);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = GRID_STROKE;
      ctx.lineWidth = 0.9;
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
  canvas.dataset.gannzillaUnlimitedRingLayersV480 = 'true';
  canvas.dataset.gannzillaUnlimitedLayerCount = String(cfg.levels);
  canvas.dataset.gannzillaEffectiveRingWidth = String(effectiveRingWidth);
  canvas.dataset.gannzillaAlternatingPalette = 'strict';
  canvas.dataset.gannzillaAllBordersBlack = 'true';
  drawCount += 1;
  lastDraw = {
    source,
    levels: cfg.levels,
    totalRingCount,
    configuredRingWidth: cfg.configuredRingWidth,
    effectiveRingWidth,
    canvasLogicalSize: logicalSize,
    dynamicallyScaledForSafety: effectiveRingWidth < cfg.configuredRingWidth,
    strictAlternatingPalette: true,
    allBordersBlack: true,
    at: Date.now(),
  };
  window.dispatchEvent(new CustomEvent('gannzilla:wheel-pan-offset-v305', {
    detail: { source: 'unlimited-ring-layers-v480', build: BUILD },
  }));
  return true;
}

function schedule(source = 'schedule') {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => drawUnlimitedWheel(source));
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('unlimitedRingLayers', true) || window[STATE_KEY]) return;
  patchSizeInput();
  schedule('install');
  const timers = [40, 120, 300, 700, 1500, 3000, 5000].map((delay) => setTimeout(() => {
    patchSizeInput();
    schedule(`bootstrap-${delay}`);
  }, delay));
  const observer = new MutationObserver(() => patchSizeInput());
  observer.observe(document.documentElement, { childList: true, subtree: true });
  const onChange = () => schedule('change');
  document.addEventListener('input', onChange, true);
  document.addEventListener('change', onChange, true);
  window.addEventListener('resize', onChange);
  window.addEventListener('gannzilla:canonical-property-change-v326', onChange);
  window.GANNZILLA_UNLIMITED_RING_LAYERS_V480 = true;
  window.__auditGannzillaUnlimitedRingLayersV480 = () => ({
    ok: findWheel()?.dataset?.gannzillaUnlimitedRingLayersV480 === 'true' && findSizeInput()?.dataset?.gannzillaUnlimitedLayersV480 === 'true',
    build: BUILD,
    htmlMaxRemoved: !findSizeInput()?.hasAttribute('max'),
    acceptedLayerRange: `1-${MAX_ACCEPTED_LAYER_COUNT}`,
    equalRingWidthAcrossAllLayers: true,
    adaptiveSafetyScaling: true,
    strictAlternatingPalette: true,
    allBordersBlack: true,
    drawCount,
    lastDraw,
  });
  window[STATE_KEY] = { timers, observer, onChange, schedule };
}

install();
