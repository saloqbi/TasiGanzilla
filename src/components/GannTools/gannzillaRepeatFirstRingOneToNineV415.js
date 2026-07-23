const BUILD = 415;
const PATCH_KEY = '__gannzillaRepeatFirstRingOneToNineV415';
const PANEL_STORAGE_KEY = 'tasi-gannzilla-canonical-panel-v326';

const ARABIC_TO_LATIN = Object.freeze({
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
});

const LATIN_TO_ARABIC = Object.freeze({
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

function belongsToOriginalIndexRing(context, x, y) {
  const radius = logicalRadiusAt(context, x, y);
  if (!Number.isFinite(radius)) return false;

  const innerRadius = numberParam('gannzillaInnerRadius', 170, 20, 1000);
  const ringWidth = actualVisibleRingWidth();
  const targetCenter = innerRadius + (ringWidth / 2);
  const tolerance = ringWidth * 0.36;
  return Math.abs(radius - targetCenter) <= tolerance;
}

function toLatinDigits(value) {
  return String(value ?? '').replace(/[٠-٩]/g, (digit) => ARABIC_TO_LATIN[digit] || digit);
}

function usesArabicDigits(value) {
  return /[٠-٩]/.test(String(value ?? ''));
}

function repeatedOneToNine(value) {
  const numeric = Number(toLatinDigits(value).replace(',', '.'));
  if (!Number.isFinite(numeric)) return value;
  const repeated = ((Math.trunc(numeric) - 1) % 9 + 9) % 9 + 1;
  if (!usesArabicDigits(value)) return String(repeated);
  return String(repeated).replace(/[0-9]/g, (digit) => LATIN_TO_ARABIC[digit]);
}

function install() {
  if (typeof window === 'undefined' || typeof CanvasRenderingContext2D === 'undefined') return;
  if (!boolParam('repeatFirstRingOneToNine', false)) return;

  const prototype = CanvasRenderingContext2D.prototype;
  if (prototype[PATCH_KEY]) return;

  const previousFillText = prototype.fillText;
  let replacedNumberCount = 0;

  Object.defineProperty(prototype, PATCH_KEY, {
    value: previousFillText,
    configurable: true,
  });

  prototype.fillText = function repeatFirstRingOneToNineFillText(text, x, y, maxWidth) {
    const eligible = isMainWheelCanvas(this.canvas)
      && isNumericText(text)
      && Number.isFinite(Number(maxWidth))
      && Number(maxWidth) > 8
      && belongsToOriginalIndexRing(this, x, y);

    if (!eligible) return previousFillText.apply(this, arguments);

    const replacement = repeatedOneToNine(text);
    replacedNumberCount += 1;
    this.canvas.dataset.gannzillaRepeatFirstRingOneToNineV415 = 'true';
    return previousFillText.call(this, replacement, x, y, maxWidth);
  };

  window.GANNZILLA_REPEAT_FIRST_RING_ONE_TO_NINE_V415 = true;
  window.__auditGannzillaRepeatFirstRingOneToNineV415 = () => ({
    ok: CanvasRenderingContext2D.prototype.fillText !== previousFillText,
    build: BUILD,
    enabled: boolParam('repeatFirstRingOneToNine', false),
    repeatedNumberPattern: '1_2_3_4_5_6_7_8_9_REPEATED',
    targetRing: 'ORIGINAL_INNER_INDEX_RING_ONLY',
    replacedNumberCount,
    originalCellGeometryPreserved: true,
    allOuterRingNumbersPreserved: true,
    uprightNumberFormattingPreserved: true,
    keyboardMouseControlPreserved: true,
  });
}

install();
