const BUILD = 416;
const PATCH_KEY = '__gannzillaInnerStartRingOneToThirtySixV416';
const PANEL_STORAGE_KEY = 'tasi-gannzilla-canonical-panel-v326';
const TWO_PI = Math.PI * 2;
const DIVISIONS = 36;
const LIGHT_FILL = '#d8d4cc';
const STROKE = '#c9c4b8';

const ARABIC_DIGITS = Object.freeze({
  0: '٠', 1: '١', 2: '٢', 3: '٣', 4: '٤',
  5: '٥', 6: '٦', 7: '٧', 8: '٨', 9: '٩',
});

function params() {
  try {
    return new URLSearchParams(window.location.search || '');
  } catch (_) {
    return new URLSearchParams();
  }
}

function boolParam(name, fallback = false) {
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

function readCanonicalState() {
  try {
    const runtime = window.__gannzillaCanonicalPanelStateV326;
    if (runtime && typeof runtime === 'object') return runtime;
    const saved = JSON.parse(window.localStorage.getItem(PANEL_STORAGE_KEY) || 'null');
    return saved && typeof saved === 'object' ? saved : null;
  } catch (_) {
    return null;
  }
}

function levelCount() {
  if (boolParam('northLastCell', false)) {
    return Math.max(1, Math.min(12, Math.round(numberParam('levels', 10, 1, 12))));
  }

  const stored = Number(readCanonicalState()?.layout?.size);
  if (Number.isFinite(stored)) return Math.max(1, Math.min(12, Math.round(stored)));
  return Math.max(1, Math.min(12, Math.round(numberParam('levels', 10, 1, 12))));
}

function actualVisibleRingWidth() {
  const levels = levelCount();
  const configuredRingWidth = numberParam('gannzillaRingWidth', 60, 12, 300);
  return (levels * configuredRingWidth) / (levels + 1);
}

function shouldUseArabicDigits() {
  const requested = params().get('lang');
  if (requested === 'ar') return true;
  if (requested === 'en') return false;
  return document.documentElement.lang === 'ar';
}

function localizedNumber(value) {
  const text = String(value);
  if (!shouldUseArabicDigits()) return text;
  return text.replace(/[0-9]/g, (digit) => ARABIC_DIGITS[digit]);
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

function isMainWheelCanvas(canvas) {
  if (!(canvas instanceof HTMLCanvasElement) || canvas.closest?.('aside')) return false;
  const rect = canvas.getBoundingClientRect?.();
  return Boolean(
    canvas.width > 300
      && canvas.height > 300
      && rect
      && rect.width > 250
      && rect.height > 250,
  );
}

function findMainWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .filter(isMainWheelCanvas)
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function polar(cx, cy, radius, degrees) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function wedge(ctx, cx, cy, innerRadius, outerRadius, startDegrees, endDegrees) {
  const start = ((startDegrees - 90) * Math.PI) / 180;
  const end = ((endDegrees - 90) * Math.PI) / 180;
  const anticlockwise = endDegrees < startDegrees;
  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, start, end, anticlockwise);
  ctx.arc(cx, cy, innerRadius, end, start, !anticlockwise);
  ctx.closePath();
}

function metricWidth(metrics) {
  return Math.max(
    Number(metrics?.actualBoundingBoxLeft || 0) + Number(metrics?.actualBoundingBoxRight || 0),
    Number(metrics?.width || 0),
    0.01,
  );
}

function metricHeight(metrics, fallback) {
  return Math.max(
    Number(metrics?.actualBoundingBoxAscent || 0) + Number(metrics?.actualBoundingBoxDescent || 0),
    Number(fallback || 0),
    0.01,
  );
}

function fittedFontSize(ctx, text, baseSize, safeWidth, safeHeight, weight) {
  let size = baseSize;
  const family = 'Tahoma, Arial, Helvetica, sans-serif';

  for (let attempt = 0; attempt < 6; attempt += 1) {
    size = Math.max(4, Math.floor(size * 4) / 4);
    ctx.font = `${weight} ${size}px ${family}`;
    const metrics = ctx.measureText(text);
    const width = metricWidth(metrics);
    const height = metricHeight(metrics, size);
    if (width <= safeWidth && height <= safeHeight) return size;
    size *= Math.min(safeWidth / width, safeHeight / height) * 0.97;
  }

  return Math.max(4, size);
}

function drawInnerStartRing() {
  if (!boolParam('innerStartRingOneToThirtySix', false)) return false;

  const canvas = findMainWheelCanvas();
  if (!canvas) return false;

  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const coordinateWidth = canvas.width / dpr;
  const coordinateHeight = canvas.height / dpr;
  if (!Number.isFinite(coordinateWidth) || !Number.isFinite(coordinateHeight)) return false;

  const outerRadius = numberParam('gannzillaInnerRadius', 170, 20, 1000);
  const ringWidth = actualVisibleRingWidth();
  const innerRadius = Math.max(12, outerRadius - ringWidth);
  const actualWidth = outerRadius - innerRadius;
  if (actualWidth < 4) return false;

  const clockwise = boolParam('clockwise', true);
  const direction = clockwise ? 1 : -1;
  const sector = 360 / DIVISIONS;
  const midRadius = (innerRadius + outerRadius) / 2;
  const cx = coordinateWidth / 2;
  const cy = coordinateHeight / 2;
  const fontSize = numberParam('gannzillaFontSize', 16, 8, 30);
  const fontWeight = Math.round(numberParam('gannzillaFontWeight', 700, 500, 900));
  const widthRatio = numberParam('gannzillaCellTextWidthRatio', 0.76, 0.35, 0.94);
  const heightRatio = numberParam('gannzillaCellTextHeightRatio', 0.60, 0.35, 0.88);
  const safeTangentialWidth = Math.max(4, 2 * midRadius * Math.sin((sector * Math.PI / 180) / 2) * widthRatio);
  const safeRadialHeight = Math.max(4, actualWidth * heightRatio);
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  for (let index = 0; index < DIVISIONS; index += 1) {
    const value = index + 1;
    const centerDegrees = direction * ((value % DIVISIONS) * sector);
    const startDegrees = centerDegrees - (direction * sector / 2);
    const endDegrees = centerDegrees + (direction * sector / 2);

    wedge(ctx, cx, cy, innerRadius, outerRadius, startDegrees, endDegrees);
    ctx.fillStyle = LIGHT_FILL;
    ctx.fill();
    ctx.strokeStyle = STROKE;
    ctx.lineWidth = 0.82;
    ctx.stroke();

    const point = polar(cx, cy, midRadius, centerDegrees);
    const label = localizedNumber(value);
    const size = fittedFontSize(
      ctx,
      label,
      fontSize,
      safeTangentialWidth,
      safeRadialHeight,
      fontWeight,
    );

    ctx.font = `${fontWeight} ${size}px Tahoma, Arial, Helvetica, sans-serif`;
    ctx.fillStyle = numberColor(value);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, Math.round(point.x) + 0.5, Math.round(point.y) + 0.5);
  }

  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius, 0, TWO_PI);
  ctx.strokeStyle = STROKE;
  ctx.lineWidth = 0.9;
  ctx.stroke();
  ctx.restore();

  canvas.dataset.gannzillaInnerStartRingOneToThirtySixV416 = 'true';
  canvas.dataset.gannzillaInnerStartRingOuterRadiusV416 = String(outerRadius);
  canvas.dataset.gannzillaInnerStartRingInnerRadiusV416 = String(innerRadius);
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof CanvasRenderingContext2D === 'undefined') return;
  if (!boolParam('innerStartRingOneToThirtySix', false)) return;
  if (window[PATCH_KEY]) return;

  let frame = 0;
  const timers = new Set();
  const schedule = (delay = 0) => {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        drawInnerStartRing();
      });
    }, delay);
    timers.add(timer);
  };
  const scheduleBurst = () => [0, 50, 140, 320, 700, 1400, 2600].forEach(schedule);

  const prototype = CanvasRenderingContext2D.prototype;
  const previousClearRect = prototype.clearRect;
  prototype.clearRect = function innerStartRingAwareClearRect(...args) {
    const result = previousClearRect.apply(this, args);
    if (isMainWheelCanvas(this.canvas)) {
      schedule(0);
      schedule(90);
      schedule(240);
    }
    return result;
  };

  scheduleBurst();
  document.addEventListener('input', scheduleBurst, true);
  document.addEventListener('change', scheduleBurst, true);
  window.addEventListener('resize', scheduleBurst);
  window.addEventListener('gannzilla:ring-two-numbering-refresh', scheduleBurst);
  window.addEventListener('gannzilla:canonical-property-change-v326', scheduleBurst);
  window.addEventListener('gannzilla:language-change', scheduleBurst);
  window.addEventListener('gannzilla:layout-panel-visibility-change', scheduleBurst);

  const observer = new MutationObserver(scheduleBurst);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.GANNZILLA_INNER_START_RING_ONE_TO_THIRTY_SIX_V416 = true;
  window.__auditGannzillaInnerStartRingOneToThirtySixV416 = () => {
    const canvas = findMainWheelCanvas();
    return {
      ok: Boolean(canvas?.dataset?.gannzillaInnerStartRingOneToThirtySixV416 === 'true'),
      build: BUILD,
      enabled: boolParam('innerStartRingOneToThirtySix', false),
      divisions: DIVISIONS,
      numbering: '1_TO_36',
      cardinalAlignment: '36_NORTH_9_EAST_18_SOUTH_27_WEST',
      insertedInsideOriginalIndexRing: true,
      existingRingsPreserved: true,
      originalRepeatOneToNineRingPreserved: true,
      keyboardMouseControlPreserved: true,
      outerRadius: Number(canvas?.dataset?.gannzillaInnerStartRingOuterRadiusV416 || 0),
      innerRadius: Number(canvas?.dataset?.gannzillaInnerStartRingInnerRadiusV416 || 0),
    };
  };

  window[PATCH_KEY] = { observer, timers, previousClearRect };
}

install();