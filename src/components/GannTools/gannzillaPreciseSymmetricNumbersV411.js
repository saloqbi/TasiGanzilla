const BUILD = 411;
const PATCH_KEY = '__gannzillaPreciseSymmetricNumbersV411';
const PANEL_STORAGE_KEY = 'tasi-gannzilla-canonical-panel-v326';
const DEFAULT_WIDTH_RATIO = 0.76;
const DEFAULT_HEIGHT_RATIO = 0.60;
const MIN_RENDER_FONT_SIZE = 0.25;
const QUARTER_TURN = Math.PI / 2;

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

function boolParam(name, fallback = true) {
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

function enforceCardinalAlignment() {
  try {
    const url = new URL(window.location.href);
    let changed = false;

    if (url.searchParams.get('northLastCell') !== 'true') {
      url.searchParams.set('northLastCell', 'true');
      changed = true;
    }
    if (url.searchParams.get('preciseSymmetricNumbers') !== 'true') {
      url.searchParams.set('preciseSymmetricNumbers', 'true');
      changed = true;
    }

    if (changed) {
      window.history.replaceState(
        window.history.state,
        '',
        `${url.pathname}${url.search}${url.hash}`,
      );
    }
  } catch (_) {
    // Rendering remains active even if the browser blocks URL replacement.
  }
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

function canonicalNumber(path, urlName, fallback, min, max) {
  const state = readCanonicalState();
  const stateValue = path.split('.').reduce((value, key) => value?.[key], state);
  const value = stateValue === undefined
    ? numberParam(urlName, fallback, min, max)
    : Number(stateValue);
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

function levelCount() {
  // northLastCell makes URL geometry authoritative for exact 36/9/18/27 alignment.
  if (boolParam('northLastCell', true)) {
    return Math.max(1, Math.min(12, Math.round(numberParam('levels', 10, 1, 12))));
  }
  return Math.max(1, Math.min(12, Math.round(canonicalNumber('layout.size', 'levels', 10, 1, 12))));
}

function divisionCount() {
  if (boolParam('northLastCell', true)) {
    return Math.max(3, Math.min(360, Math.round(numberParam('divisions', 36, 3, 360))));
  }
  return Math.max(3, Math.min(360, Math.round(canonicalNumber('layout.view', 'divisions', 36, 3, 360))));
}

function configuredRingWidth() {
  return numberParam('gannzillaRingWidth', 60, 12, 300);
}

function actualCellRadialHeight() {
  const levels = levelCount();
  // The renderer adds the 1–36 index ring while preserving total numeric width.
  return (levels * configuredRingWidth()) / (levels + 1);
}

function wheelBounds() {
  const levels = levelCount();
  const innerRadius = numberParam('gannzillaInnerRadius', 170, 20, 1000);
  return {
    inner: Math.max(0, innerRadius - 8),
    outer: innerRadius + (levels * configuredRingWidth()) + 10,
  };
}

function isNumericText(value) {
  return /^[+\-]?(?:[0-9٠-٩]+(?:[.,][0-9٠-٩]+)?|[.,][0-9٠-٩]+)$/.test(String(value ?? '').trim());
}

function localizedMetricText(value) {
  const text = String(value ?? '');
  const queryLanguage = params().get('lang');
  const arabic = queryLanguage === 'ar'
    || (queryLanguage == null && document.documentElement.lang === 'ar');
  if (!arabic) return text;
  return text.replace(/[0-9]/g, (digit) => ARABIC_DIGITS[digit]);
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

function normalizeUpright(radians) {
  let value = radians;
  while (value > Math.PI) value -= Math.PI * 2;
  while (value < -Math.PI) value += Math.PI * 2;
  if (value > Math.PI / 2) value -= Math.PI;
  if (value < -Math.PI / 2) value += Math.PI;

  // Snap exact axes to eliminate tiny floating-point tilts and preserve symmetry.
  const nearestQuarter = Math.round(value / QUARTER_TURN) * QUARTER_TURN;
  if (Math.abs(value - nearestQuarter) < 1e-7) value = nearestQuarter;
  if (Math.abs(value) < 1e-7) value = 0;
  return value;
}

function snapHalfPixel(value) {
  return Math.round(Number(value) * 2) / 2;
}

function locateCell(context, x, y) {
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
  const dx = pointX - centerX;
  const dy = pointY - centerY;
  const radius = Math.hypot(dx, dy) / scale;
  const bounds = wheelBounds();
  if (radius < bounds.inner || radius > bounds.outer) return null;

  // Tangential baseline: horizontal at 36/18 and vertical at 9/27.
  const rotation = normalizeUpright(Math.atan2(dx, -dy));
  return {
    pointX: snapHalfPixel(pointX),
    pointY: snapHalfPixel(pointY),
    scale,
    radius,
    rotation,
  };
}

function install() {
  if (typeof window === 'undefined' || typeof CanvasRenderingContext2D === 'undefined') return;
  enforceCardinalAlignment();
  if (!boolParam('preciseSymmetricNumbers', true)) return;

  const prototype = CanvasRenderingContext2D.prototype;
  if (prototype[PATCH_KEY]) return;

  const previousFillText = prototype.fillText;
  let numericDrawCount = 0;
  let symmetricDrawCount = 0;
  let fittedDrawCount = 0;
  let smallestAppliedFontSize = null;

  Object.defineProperty(prototype, PATCH_KEY, {
    value: previousFillText,
    configurable: true,
  });

  prototype.fillText = function preciseSymmetricNumberFillText(text, x, y) {
    const cell = isMainWheelCanvas(this.canvas) && isNumericText(text)
      ? locateCell(this, x, y)
      : null;

    if (!cell) return previousFillText.apply(this, arguments);

    numericDrawCount += 1;
    const baseFontSize = fontSizeFrom(this.font);
    if (!Number.isFinite(baseFontSize) || baseFontSize <= 0) {
      return previousFillText.apply(this, arguments);
    }

    const widthRatio = numberParam('gannzillaCellTextWidthRatio', DEFAULT_WIDTH_RATIO, 0.35, 0.94);
    const heightRatio = numberParam('gannzillaCellTextHeightRatio', DEFAULT_HEIGHT_RATIO, 0.35, 0.88);
    const arcWidth = (Math.PI * 2 * cell.radius) / divisionCount();
    const safeTangentialWidth = Math.max(2, arcWidth * widthRatio);
    const safeRadialHeight = Math.max(2, actualCellRadialHeight() * heightRatio);
    const metricText = localizedMetricText(text);
    const originalFont = this.font;

    this.save();
    try {
      this.textAlign = 'center';
      this.textBaseline = 'middle';
      this.font = originalFont;
      if ('fontKerning' in this) this.fontKerning = 'normal';
      if ('fontStretch' in this) this.fontStretch = 'normal';
      if ('textRendering' in this) this.textRendering = 'geometricPrecision';

      const initialMetrics = this.measureText(metricText);
      const initialScale = Math.min(
        1,
        safeTangentialWidth / metricWidth(initialMetrics),
        safeRadialHeight / metricHeight(initialMetrics, baseFontSize),
      );

      let fittedFontSize = Math.max(MIN_RENDER_FONT_SIZE, baseFontSize * initialScale * 0.975);

      // Re-measure the real glyph box until it is strictly smaller than the cell.
      for (let attempt = 0; attempt < 7; attempt += 1) {
        fittedFontSize = Math.max(MIN_RENDER_FONT_SIZE, Math.floor(fittedFontSize * 4) / 4);
        this.font = withFontSize(originalFont, fittedFontSize);
        const metrics = this.measureText(metricText);
        const width = metricWidth(metrics);
        const height = metricHeight(metrics, fittedFontSize);
        if (width <= safeTangentialWidth && height <= safeRadialHeight) break;
        fittedFontSize *= Math.min(safeTangentialWidth / width, safeRadialHeight / height) * 0.97;
      }

      if (fittedFontSize < baseFontSize - 0.01) fittedDrawCount += 1;
      smallestAppliedFontSize = smallestAppliedFontSize == null
        ? fittedFontSize
        : Math.min(smallestAppliedFontSize, fittedFontSize);

      this.font = withFontSize(originalFont, fittedFontSize);
      const cosine = Math.cos(cell.rotation);
      const sine = Math.sin(cell.rotation);
      this.setTransform(
        cell.scale * cosine,
        cell.scale * sine,
        -cell.scale * sine,
        cell.scale * cosine,
        cell.pointX,
        cell.pointY,
      );

      symmetricDrawCount += 1;
      // Font fitting preserves glyph proportions; Canvas maxWidth is intentionally omitted.
      return previousFillText.call(this, String(text), 0, 0);
    } finally {
      this.restore();
      if (this.canvas instanceof HTMLCanvasElement) {
        this.canvas.dataset.gannzillaPreciseSymmetricNumbersV411 = 'true';
      }
    }
  };

  window.GANNZILLA_PRECISE_SYMMETRIC_NUMBERS_V411 = true;
  window.__auditGannzillaPreciseSymmetricNumbersV411 = () => ({
    ok: CanvasRenderingContext2D.prototype.fillText !== previousFillText,
    build: BUILD,
    enabled: boolParam('preciseSymmetricNumbers', true),
    orientation: 'TANGENTIAL_UPRIGHT_SYMMETRIC_ALL_NUMERIC_CELLS',
    cardinalAlignment: '36_NORTH_9_EAST_18_SOUTH_27_WEST',
    northLastCell: boolParam('northLastCell', true),
    numericDrawCount,
    symmetricDrawCount,
    fittedDrawCount,
    smallestAppliedFontSize,
    divisions: divisionCount(),
    actualCellRadialHeight: actualCellRadialHeight(),
    widthRatio: numberParam('gannzillaCellTextWidthRatio', DEFAULT_WIDTH_RATIO, 0.35, 0.94),
    heightRatio: numberParam('gannzillaCellTextHeightRatio', DEFAULT_HEIGHT_RATIO, 0.35, 0.88),
    halfPixelPositioning: true,
    exactAxisSnapping: true,
    horizontalCondensationDisabled: true,
    centeredTextAuthority: true,
    safeCellPaddingEnabled: true,
  });
}

install();
