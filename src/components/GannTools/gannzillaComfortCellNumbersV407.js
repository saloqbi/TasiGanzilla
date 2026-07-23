const BUILD = 407;
const PATCH_KEY = '__gannzillaComfortCellNumbersV407';
const WIDTH_RATIO_DEFAULT = 0.86;
const HEIGHT_RATIO_DEFAULT = 0.56;
const MIN_FONT_SIZE_DEFAULT = 5;

function queryParams() {
  try {
    return new URLSearchParams(window.location.search || '');
  } catch (_) {
    return new URLSearchParams();
  }
}

function numberParam(name, fallback, min, max) {
  const value = Number(queryParams().get(name));
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

function boolParam(name, fallback = true) {
  const query = queryParams();
  if (!query.has(name)) return fallback;
  const value = String(query.get(name) || '').toLowerCase();
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
}

function isNumericCellText(value) {
  return /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(String(value ?? '').trim());
}

function isMainWheelCanvas(canvas) {
  if (!(canvas instanceof HTMLCanvasElement) || canvas.closest?.('aside')) return false;
  return canvas.width > 300 && canvas.height > 300;
}

function fontSizeFrom(font) {
  const match = String(font || '').match(/(\d+(?:\.\d+)?)px/i);
  return match ? Number(match[1]) : null;
}

function withFontSize(font, size) {
  return String(font || '').replace(/(\d+(?:\.\d+)?)px/i, `${size}px`);
}

function roundedQuarter(value) {
  return Math.max(0.25, Math.floor(value * 4) / 4);
}

function install() {
  if (typeof window === 'undefined' || typeof CanvasRenderingContext2D === 'undefined') return;
  if (!boolParam('comfortCellNumbers', true)) return;

  const prototype = CanvasRenderingContext2D.prototype;
  if (prototype[PATCH_KEY]) return;

  const originalFillText = prototype.fillText;
  let numericDrawCount = 0;
  let fittedDrawCount = 0;
  let smallestAppliedFontSize = null;

  Object.defineProperty(prototype, PATCH_KEY, {
    value: originalFillText,
    configurable: true,
  });

  prototype.fillText = function comfortCellNumberFillText(text, x, y, maxWidth) {
    const numeric = isNumericCellText(text);
    const centeredCellCall = numeric
      && Number.isFinite(Number(maxWidth))
      && Number(maxWidth) > 8
      && Math.abs(Number(x) || 0) < 0.001
      && Math.abs(Number(y) || 0) < 0.001
      && isMainWheelCanvas(this.canvas);

    if (!centeredCellCall) {
      return originalFillText.apply(this, arguments);
    }

    numericDrawCount += 1;

    const originalFont = this.font;
    const originalAlign = this.textAlign;
    const originalBaseline = this.textBaseline;
    const baseFontSize = fontSizeFrom(originalFont);

    if (!Number.isFinite(baseFontSize) || baseFontSize <= 0) {
      return originalFillText.apply(this, arguments);
    }

    const ringWidth = numberParam('gannzillaRingWidth', 60, 12, 300);
    const widthRatio = numberParam('gannzillaCellTextWidthRatio', WIDTH_RATIO_DEFAULT, 0.55, 0.98);
    const heightRatio = numberParam('gannzillaCellTextHeightRatio', HEIGHT_RATIO_DEFAULT, 0.40, 0.85);
    const minimumFontSize = numberParam('gannzillaCellMinFontSize', MIN_FONT_SIZE_DEFAULT, 2, 20);
    const safeWidth = Math.max(6, Number(maxWidth) * widthRatio);
    const safeHeight = Math.max(6, ringWidth * heightRatio);

    this.textAlign = 'center';
    this.textBaseline = 'middle';
    this.font = originalFont;

    const metrics = this.measureText(String(text));
    const measuredWidth = Math.max(
      Number(metrics.actualBoundingBoxLeft || 0) + Number(metrics.actualBoundingBoxRight || 0),
      Number(metrics.width || 0),
      1,
    );
    const measuredHeight = Math.max(
      Number(metrics.actualBoundingBoxAscent || 0) + Number(metrics.actualBoundingBoxDescent || 0),
      baseFontSize,
      1,
    );

    const scale = Math.min(1, safeWidth / measuredWidth, safeHeight / measuredHeight);
    const fittedFontSize = roundedQuarter(Math.max(minimumFontSize, baseFontSize * scale));

    if (fittedFontSize < baseFontSize - 0.01) fittedDrawCount += 1;
    smallestAppliedFontSize = smallestAppliedFontSize == null
      ? fittedFontSize
      : Math.min(smallestAppliedFontSize, fittedFontSize);

    this.font = withFontSize(originalFont, fittedFontSize);

    try {
      return originalFillText.call(this, String(text), 0, 0, safeWidth);
    } finally {
      this.font = originalFont;
      this.textAlign = originalAlign;
      this.textBaseline = originalBaseline;
      if (this.canvas instanceof HTMLCanvasElement) {
        this.canvas.dataset.gannzillaComfortCellNumbersV407 = 'true';
      }
    }
  };

  window.GANNZILLA_COMFORT_CELL_NUMBERS_V407 = true;
  window.__auditGannzillaComfortCellNumbersV407 = () => ({
    ok: CanvasRenderingContext2D.prototype.fillText !== originalFillText,
    build: BUILD,
    enabled: boolParam('comfortCellNumbers', true),
    numericDrawCount,
    fittedDrawCount,
    smallestAppliedFontSize,
    widthRatio: numberParam('gannzillaCellTextWidthRatio', WIDTH_RATIO_DEFAULT, 0.55, 0.98),
    heightRatio: numberParam('gannzillaCellTextHeightRatio', HEIGHT_RATIO_DEFAULT, 0.40, 0.85),
    minimumFontSize: numberParam('gannzillaCellMinFontSize', MIN_FONT_SIZE_DEFAULT, 2, 20),
    horizontalDistortionPrevented: true,
    centeredTextAuthority: true,
    safeCellPaddingEnabled: true,
  });
}

install();
