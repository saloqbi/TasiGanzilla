const BUILD = 408;
const PATCH_KEY = '__gannzillaComfortRadialCellNumbersV408';
const PANEL_STORAGE_KEY = 'tasi-gannzilla-canonical-panel-v326';
const WIDTH_RATIO_DEFAULT = 0.70;
const HEIGHT_RATIO_DEFAULT = 0.62;
const MIN_RENDER_FONT_SIZE = 0.25;

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

function canonicalLevelCount() {
  try {
    const runtime = Number(window.__gannzillaCanonicalPanelStateV326?.layout?.size);
    if (Number.isFinite(runtime)) return Math.max(1, Math.min(12, Math.round(runtime)));

    const saved = JSON.parse(window.localStorage.getItem(PANEL_STORAGE_KEY) || 'null');
    const stored = Number(saved?.layout?.size);
    if (Number.isFinite(stored)) return Math.max(1, Math.min(12, Math.round(stored)));
  } catch (_) {
    // URL value remains authoritative when state storage is unavailable.
  }

  return Math.max(1, Math.min(12, Math.round(numberParam('levels', 10, 1, 12))));
}

function actualRadialCellWidth() {
  const levels = canonicalLevelCount();
  const configuredRingWidth = numberParam('gannzillaRingWidth', 60, 12, 300);

  // RingTwoNumbering adds one index ring while preserving the configured total
  // numeric-wheel width, so this is the actual radial width visible per cell.
  return (levels * configuredRingWidth) / (levels + 1);
}

function isNumericCellText(value) {
  return /^[+\-]?(?:[0-9٠-٩]+(?:[.,][0-9٠-٩]+)?|[.,][0-9٠-٩]+)$/.test(String(value ?? '').trim());
}

function isMainWheelCanvas(canvas) {
  if (!(canvas instanceof HTMLCanvasElement) || canvas.closest?.('aside')) return false;
  const rect = canvas.getBoundingClientRect?.();
  return Boolean(canvas.width > 300 && canvas.height > 300 && rect && rect.width > 250 && rect.height > 250);
}

function fontSizeFrom(font) {
  const match = String(font || '').match(/(\d+(?:\.\d+)?)px/i);
  return match ? Number(match[1]) : null;
}

function withFontSize(font, size) {
  return String(font || '').replace(/(\d+(?:\.\d+)?)px/i, `${size}px`);
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

function install() {
  if (typeof window === 'undefined' || typeof CanvasRenderingContext2D === 'undefined') return;
  if (!boolParam('comfortCellNumbers', true)) return;

  const prototype = CanvasRenderingContext2D.prototype;
  if (prototype[PATCH_KEY]) return;

  const previousFillText = prototype.fillText;
  let numericDrawCount = 0;
  let fittedDrawCount = 0;
  let smallestAppliedFontSize = null;

  Object.defineProperty(prototype, PATCH_KEY, {
    value: previousFillText,
    configurable: true,
  });

  prototype.fillText = function radialCellNumberFillText(text, x, y, maxWidth) {
    const centeredNumericCellCall = isNumericCellText(text)
      && Number.isFinite(Number(maxWidth))
      && Number(maxWidth) > 8
      && Math.abs(Number(x) || 0) < 0.001
      && Math.abs(Number(y) || 0) < 0.001
      && isMainWheelCanvas(this.canvas);

    if (!centeredNumericCellCall) return previousFillText.apply(this, arguments);

    numericDrawCount += 1;

    const originalFont = this.font;
    const originalAlign = this.textAlign;
    const originalBaseline = this.textBaseline;
    const baseFontSize = fontSizeFrom(originalFont);

    if (!Number.isFinite(baseFontSize) || baseFontSize <= 0) {
      return previousFillText.apply(this, arguments);
    }

    // The text baseline is radial (it rotates with each sector), not globally
    // horizontal. Therefore its available width is the ring thickness, while
    // the passed maxWidth represents the tangential arc dimension.
    const radialWidthRatio = numberParam('gannzillaCellTextWidthRatio', WIDTH_RATIO_DEFAULT, 0.40, 0.90);
    const tangentialHeightRatio = numberParam('gannzillaCellTextHeightRatio', HEIGHT_RATIO_DEFAULT, 0.40, 0.90);
    const safeRadialWidth = Math.max(2, actualRadialCellWidth() * radialWidthRatio);
    const safeTangentialHeight = Math.max(2, Number(maxWidth) * tangentialHeightRatio);

    this.textAlign = 'center';
    this.textBaseline = 'middle';
    this.font = originalFont;

    const baseMetrics = this.measureText(String(text));
    const scale = Math.min(
      1,
      safeRadialWidth / metricWidth(baseMetrics),
      safeTangentialHeight / metricHeight(baseMetrics, baseFontSize),
    );

    let fittedFontSize = Math.max(MIN_RENDER_FONT_SIZE, baseFontSize * scale * 0.985);

    // Re-measure after scaling so the final glyph box is always smaller than
    // the cell in both directions, even for very long values.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      this.font = withFontSize(originalFont, fittedFontSize);
      const fittedMetrics = this.measureText(String(text));
      const width = metricWidth(fittedMetrics);
      const height = metricHeight(fittedMetrics, fittedFontSize);
      if (width <= safeRadialWidth && height <= safeTangentialHeight) break;
      fittedFontSize *= Math.min(safeRadialWidth / width, safeTangentialHeight / height) * 0.98;
      fittedFontSize = Math.max(MIN_RENDER_FONT_SIZE, fittedFontSize);
    }

    if (fittedFontSize < baseFontSize - 0.01) fittedDrawCount += 1;
    smallestAppliedFontSize = smallestAppliedFontSize == null
      ? fittedFontSize
      : Math.min(smallestAppliedFontSize, fittedFontSize);

    this.font = withFontSize(originalFont, fittedFontSize);

    try {
      // Do not pass Canvas maxWidth: browsers may horizontally condense text.
      // The fitted font already guarantees clearance and keeps digits stable.
      return previousFillText.call(this, String(text), 0, 0);
    } finally {
      this.font = originalFont;
      this.textAlign = originalAlign;
      this.textBaseline = originalBaseline;
      if (this.canvas instanceof HTMLCanvasElement) {
        this.canvas.dataset.gannzillaComfortRadialCellNumbersV408 = 'true';
      }
    }
  };

  window.GANNZILLA_COMFORT_RADIAL_CELL_NUMBERS_V408 = true;
  window.__auditGannzillaComfortRadialCellNumbersV408 = () => ({
    ok: CanvasRenderingContext2D.prototype.fillText !== previousFillText,
    build: BUILD,
    enabled: boolParam('comfortCellNumbers', true),
    orientation: 'RADIAL_ACROSS_CELL_NOT_GLOBAL_HORIZONTAL',
    numericDrawCount,
    fittedDrawCount,
    smallestAppliedFontSize,
    actualRadialCellWidth: actualRadialCellWidth(),
    radialWidthRatio: numberParam('gannzillaCellTextWidthRatio', WIDTH_RATIO_DEFAULT, 0.40, 0.90),
    tangentialHeightRatio: numberParam('gannzillaCellTextHeightRatio', HEIGHT_RATIO_DEFAULT, 0.40, 0.90),
    horizontalCondensationDisabled: true,
    centeredTextAuthority: true,
    safeCellPaddingEnabled: true,
  });
}

install();
