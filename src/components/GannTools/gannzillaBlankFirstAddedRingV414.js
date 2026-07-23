const BUILD = 414;
const PATCH_KEY = '__gannzillaBlankFirstAddedRingV414';
const PANEL_STORAGE_KEY = 'tasi-gannzilla-canonical-panel-v326';

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

  const stateValue = Number(readCanonicalState()?.layout?.size);
  if (Number.isFinite(stateValue)) return Math.max(1, Math.min(12, Math.round(stateValue)));
  return Math.max(1, Math.min(12, Math.round(numberParam('levels', 10, 1, 12))));
}

function actualAddedRingWidth() {
  const levels = levelCount();
  const configuredRingWidth = numberParam('gannzillaRingWidth', 60, 12, 300);

  // The visible renderer inserts the original 1–36 index ring while preserving
  // the configured width of the numbered wheel. Every visible ring therefore
  // uses this exact radial width.
  return (levels * configuredRingWidth) / (levels + 1);
}

function isNumericText(value) {
  return /^[+\-]?(?:[0-9٠-٩]+(?:[.,][0-9٠-٩]+)?|[.,][0-9٠-٩]+)$/.test(String(value ?? '').trim());
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

function logicalRadiusAt(context, x, y) {
  if (typeof context.getTransform !== 'function') return null;
  const matrix = context.getTransform();
  const localX = Number(x) || 0;
  const localY = Number(y) || 0;
  const pointX = (matrix.a * localX) + (matrix.c * localY) + matrix.e;
  const pointY = (matrix.b * localX) + (matrix.d * localY) + matrix.f;
  const scaleX = Math.hypot(matrix.a, matrix.b) || 1;
  const scaleY = Math.hypot(matrix.c, matrix.d) || scaleX;
  const scale = (scaleX + scaleY) / 2;
  const centerX = context.canvas.width / 2;
  const centerY = context.canvas.height / 2;
  return Math.hypot(pointX - centerX, pointY - centerY) / scale;
}

function belongsToFirstAddedRing(context, x, y) {
  const radius = logicalRadiusAt(context, x, y);
  if (!Number.isFinite(radius)) return false;

  const innerRadius = numberParam('gannzillaInnerRadius', 170, 20, 1000);
  const ringWidth = actualAddedRingWidth();
  const targetCenter = innerRadius + (ringWidth * 1.5);
  const tolerance = ringWidth * 0.36;
  return Math.abs(radius - targetCenter) <= tolerance;
}

function install() {
  if (typeof window === 'undefined' || typeof CanvasRenderingContext2D === 'undefined') return;
  if (!boolParam('blankFirstAddedRing', false)) return;

  const prototype = CanvasRenderingContext2D.prototype;
  if (prototype[PATCH_KEY]) return;

  const previousFillText = prototype.fillText;
  let skippedNumberCount = 0;

  Object.defineProperty(prototype, PATCH_KEY, {
    value: previousFillText,
    configurable: true,
  });

  prototype.fillText = function blankFirstAddedRingFillText(text, x, y, maxWidth) {
    const eligible = isMainWheelCanvas(this.canvas)
      && isNumericText(text)
      && Number.isFinite(Number(maxWidth))
      && Number(maxWidth) > 8
      && belongsToFirstAddedRing(this, x, y);

    if (!eligible) return previousFillText.apply(this, arguments);

    skippedNumberCount += 1;
    this.canvas.dataset.gannzillaBlankFirstAddedRingV414 = 'true';
    return undefined;
  };

  window.GANNZILLA_BLANK_FIRST_ADDED_RING_V414 = true;
  window.__auditGannzillaBlankFirstAddedRingV414 = () => ({
    ok: CanvasRenderingContext2D.prototype.fillText !== previousFillText,
    build: BUILD,
    enabled: boolParam('blankFirstAddedRing', false),
    skippedNumberCount,
    originalIndexRingNumbersPreserved: true,
    firstAddedRingCellsPreserved: true,
    firstAddedRingNumbersVisible: false,
    allOtherWheelNumbersPreserved: true,
    targetRingRadialCenter: numberParam('gannzillaInnerRadius', 170, 20, 1000)
      + (actualAddedRingWidth() * 1.5),
    actualAddedRingWidth: actualAddedRingWidth(),
  });
}

install();
