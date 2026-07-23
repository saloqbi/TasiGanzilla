const BUILD = 409;
const PATCH_KEY = '__gannzillaComfortTangentialCellNumbersV409';
const PANEL_STORAGE_KEY = 'tasi-gannzilla-canonical-panel-v326';
const WIDTH_RATIO_DEFAULT = 0.76;
const HEIGHT_RATIO_DEFAULT = 0.58;
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
    // URL parameters remain authoritative when state storage is unavailable.
  }

  return Math.max(1, Math.min(12, Math.round(numberParam('levels', 10, 1, 12))));
}

function actualRadialCellHeight() {
  const levels = canonicalLevelCount();
  const configuredRingWidth = numberParam('gannzillaRingWidth', 60, 12, 300);

  // The index ring is added while the configured numbered-wheel width is kept,
  // so this is the true radial height of every visible cell.
  return (levels * configuredRingWidth) / (levels + 1);
}

function numberedWheelBounds() {
  const levels = canonicalLevelCount();
  const innerRadius = numberParam('gannzillaInnerRadius', 170, 20, 1000);
  const configuredRingWidth = numberParam('gannzillaRingWidth', 60, 12, 300);
  return {
    innerRadius: Math.max(0, innerRadius - 4),
    outerRadius: innerRadius + (levels * configuredRingWidth) + 6,
  };
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

function normalizeUprightRadians(radians) {
  let value = radians;
  while (value > Math.PI) value -= Math.PI * 2;
  while (value < -Math.PI) value += Math.PI * 2;
  if (value > Math.PI / 2) value -= Math.PI;
  if (value < -Math.PI / 2) value += Math.PI;
  return value;
}

function cellTransform(context) {
  if (typeof context.getTransform !== 'function') return null;
  const matrix = context.getTransform();
  const scale = Math.hypot(matrix.a, matrix.b) || 1;
  const centerX = context.canvas.width / 2;
  const centerY = context.canvas.height / 2;
  const dx = matrix.e - centerX;
  const dy = matrix.f - centerY;
  const radiusLogical = Math.hypot(dx, dy) / scale;
  const bounds = numberedWheelBounds();

  if (radiusLogical < bounds.innerRadius || radiusLogical > bounds.outerRadius) return null;

  // Angle measured clockwise from 12 o'clock. Using it as the text baseline
  // makes the number tangential to the circle: horizontal at top/bottom and
  // vertical at the sides, while normalization keeps all values upright.
  const tangentialRotation = normalizeUprightRadians(Math.atan2(dx, -dy));
  return { matrix, scale, tangentialRotation };
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

  prototype.fillText = function tangentialCellNumberFillText(text, x, y, maxWidth) {
    const transform = isMainWheelCanvas(this.canvas) ? cellTransform(this) : null;
    const centeredNumericCellCall = Boolean(transform)
      && isNumericCellText(text)
      && Number.isFinite(Number(maxWidth))
      && Number(maxWidth) > 8
      && Math.abs(Number(x) || 0) < 0.001
      && Math.abs(Number(y) || 0) < 0.001;

    if (!centeredNumericCellCall) return previousFillText.apply(this, arguments);

    numericDrawCount += 1;
    const baseFontSize = fontSizeFrom(this.font);
    if (!Number.isFinite(baseFontSize) || baseFontSize <= 0) {
      return previousFillText.apply(this, arguments);
    }

    const tangentialWidthRatio = numberParam('gannzillaCellTextWidthRatio', WIDTH_RATIO_DEFAULT, 0.40, 0.94);
    const radialHeightRatio = numberParam('gannzillaCellTextHeightRatio', HEIGHT_RATIO_DEFAULT, 0.40, 0.86);
    const safeTangentialWidth = Math.max(2, Number(maxWidth) * tangentialWidthRatio);
    const safeRadialHeight = Math.max(2, actualRadialCellHeight() * radialHeightRatio);

    this.save();
    try {
      this.textAlign = 'center';
      this.textBaseline = 'middle';

      const baseMetrics = this.measureText(String(text));
      const scaleToCell = Math.min(
        1,
        safeTangentialWidth / metricWidth(baseMetrics),
        safeRadialHeight / metricHeight(baseMetrics, baseFontSize),
      );

      let fittedFontSize = Math.max(MIN_RENDER_FONT_SIZE, baseFontSize * scaleToCell * 0.985);

      // Re-measure until the actual glyph box is strictly smaller than the
      // available cell area. This prevents long values from touching a wall.
      for (let attempt = 0; attempt < 6; attempt += 1) {
        this.font = withFontSize(this.font, fittedFontSize);
        const fittedMetrics = this.measureText(String(text));
        const width = metricWidth(fittedMetrics);
        const height = metricHeight(fittedMetrics, fittedFontSize);
        if (width <= safeTangentialWidth && height <= safeRadialHeight) break;
        fittedFontSize *= Math.min(safeTangentialWidth / width, safeRadialHeight / height) * 0.98;
        fittedFontSize = Math.max(MIN_RENDER_FONT_SIZE, fittedFontSize);
      }

      if (fittedFontSize < baseFontSize - 0.01) fittedDrawCount += 1;
      smallestAppliedFontSize = smallestAppliedFontSize == null
        ? fittedFontSize
        : Math.min(smallestAppliedFontSize, fittedFontSize);

      this.font = withFontSize(this.font, fittedFontSize);

      const { matrix, scale, tangentialRotation } = transform;
      const cosine = Math.cos(tangentialRotation);
      const sine = Math.sin(tangentialRotation);
      this.setTransform(
        scale * cosine,
        scale * sine,
        -scale * sine,
        scale * cosine,
        matrix.e,
        matrix.f,
      );

      // Font fitting already guarantees clearance. Omitting Canvas maxWidth
      // prevents browsers from squeezing digits horizontally.
      return previousFillText.call(this, String(text), 0, 0);
    } finally {
      this.restore();
      if (this.canvas instanceof HTMLCanvasElement) {
        this.canvas.dataset.gannzillaComfortTangentialCellNumbersV409 = 'true';
      }
    }
  };

  window.GANNZILLA_COMFORT_TANGENTIAL_CELL_NUMBERS_V409 = true;
  window.__auditGannzillaComfortTangentialCellNumbersV409 = () => ({
    ok: CanvasRenderingContext2D.prototype.fillText !== previousFillText,
    build: BUILD,
    enabled: boolParam('comfortCellNumbers', true),
    orientation: 'TANGENTIAL_UPRIGHT_AROUND_WHEEL',
    numericDrawCount,
    fittedDrawCount,
    smallestAppliedFontSize,
    actualRadialCellHeight: actualRadialCellHeight(),
    tangentialWidthRatio: numberParam('gannzillaCellTextWidthRatio', WIDTH_RATIO_DEFAULT, 0.40, 0.94),
    radialHeightRatio: numberParam('gannzillaCellTextHeightRatio', HEIGHT_RATIO_DEFAULT, 0.40, 0.86),
    horizontalCondensationDisabled: true,
    centeredTextAuthority: true,
    safeCellPaddingEnabled: true,
  });
}

install();
