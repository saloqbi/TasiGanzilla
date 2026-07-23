const BUILD = 412;
const PATCH_KEY = '__gannzillaUprightSymmetricAllNumbersV412';
const PANEL_STORAGE_KEY = 'tasi-gannzilla-canonical-panel-v326';
const DEFAULT_TANGENTIAL_RATIO = 0.76;
const DEFAULT_RADIAL_RATIO = 0.60;
const MIN_RENDER_FONT_SIZE = 0.25;

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
    if (url.searchParams.get('uprightWheelNumbers') !== 'true') {
      url.searchParams.set('uprightWheelNumbers', 'true');
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
    // Rendering remains active if history replacement is unavailable.
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
  // The renderer adds the 1–36 index ring while preserving the configured
  // numbered-wheel width, so this is the real radial height of each cell.
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
  const radiusDevice = Math.hypot(dx, dy);
  const radius = radiusDevice / scale;
  const bounds = wheelBounds();

  if (radius < bounds.inner || radius > bounds.outer || radiusDevice <= 0.001) return null;

  return {
    pointX: snapHalfPixel(pointX),
    pointY: snapHalfPixel(pointY),
    scale,
    radius,
    radialX: dx / radiusDevice,
    radialY: dy / radiusDevice,
  };
}

function projectedExtents(width, height, radialX, radialY) {
  const absX = Math.abs(radialX);
  const absY = Math.abs(radialY);
  return {
    radial: (absX * width) + (absY * height),
    tangential: (absY * width) + (absX * height),
  };
}

function install() {
  if (typeof window === 'undefined' || typeof CanvasRenderingContext2D === 'undefined') return;
  enforceCardinalAlignment();
  if (!boolParam('uprightWheelNumbers', true)) return;

  const prototype = CanvasRenderingContext2D.prototype;
  if (prototype[PATCH_KEY]) return;

  const previousFillText = prototype.fillText;
  let numericDrawCount = 0;
  let uprightDrawCount = 0;
  let fittedDrawCount = 0;
  let smallestAppliedFontSize = null;

  Object.defineProperty(prototype, PATCH_KEY, {
    value: previousFillText,
    configurable: true,
  });

  prototype.fillText = function uprightSymmetricNumberFillText(text, x, y) {
    const cell = isMainWheelCanvas(this.canvas) && isNumericText(text)
      ? locateCell(this, x, y)
      : null;

    if (!cell) return previousFillText.apply(this, arguments);

    numericDrawCount += 1;
    const baseFontSize = fontSizeFrom(this.font);
    if (!Number.isFinite(baseFontSize) || baseFontSize <= 0) {
      return previousFillText.apply(this, arguments);
    }

    const tangentialRatio = numberParam(
      'gannzillaCellTextWidthRatio',
      DEFAULT_TANGENTIAL_RATIO,
      0.35,
      0.94,
    );
    const radialRatio = numberParam(
      'gannzillaCellTextHeightRatio',
      DEFAULT_RADIAL_RATIO,
      0.35,
      0.88,
    );

    const sectorRadians = (Math.PI * 2) / divisionCount();
    const cellTangentialWidth = 2 * cell.radius * Math.sin(sectorRadians / 2);
    const safeTangential = Math.max(2, cellTangentialWidth * tangentialRatio);
    const safeRadial = Math.max(2, actualCellRadialHeight() * radialRatio);
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
      const initialWidth = metricWidth(initialMetrics);
      const initialHeight = metricHeight(initialMetrics, baseFontSize);
      const initialProjection = projectedExtents(
        initialWidth,
        initialHeight,
        cell.radialX,
        cell.radialY,
      );
      const initialScale = Math.min(
        1,
        safeRadial / initialProjection.radial,
        safeTangential / initialProjection.tangential,
      );

      let fittedFontSize = Math.max(MIN_RENDER_FONT_SIZE, baseFontSize * initialScale * 0.975);

      // Re-measure the real glyph box until its axis-aligned presentation fits
      // completely inside the rotated annular cell at every point on the wheel.
      for (let attempt = 0; attempt < 8; attempt += 1) {
        fittedFontSize = Math.max(MIN_RENDER_FONT_SIZE, Math.floor(fittedFontSize * 4) / 4);
        this.font = withFontSize(originalFont, fittedFontSize);
        const metrics = this.measureText(metricText);
        const width = metricWidth(metrics);
        const height = metricHeight(metrics, fittedFontSize);
        const projection = projectedExtents(width, height, cell.radialX, cell.radialY);
        if (projection.radial <= safeRadial && projection.tangential <= safeTangential) break;
        fittedFontSize *= Math.min(
          safeRadial / projection.radial,
          safeTangential / projection.tangential,
        ) * 0.97;
      }

      if (fittedFontSize < baseFontSize - 0.01) fittedDrawCount += 1;
      smallestAppliedFontSize = smallestAppliedFontSize == null
        ? fittedFontSize
        : Math.min(smallestAppliedFontSize, fittedFontSize);

      this.font = withFontSize(originalFont, fittedFontSize);
      // Keep every value horizontal and upright relative to the screen, exactly
      // like the reference: 36 north, 9 east, 18 south and 27 west.
      this.setTransform(
        cell.scale,
        0,
        0,
        cell.scale,
        cell.pointX,
        cell.pointY,
      );

      uprightDrawCount += 1;
      // The fitted font already guarantees clearance; omit Canvas maxWidth so
      // the browser never squeezes or distorts the digits horizontally.
      return previousFillText.call(this, String(text), 0, 0);
    } finally {
      this.restore();
      if (this.canvas instanceof HTMLCanvasElement) {
        this.canvas.dataset.gannzillaUprightSymmetricAllNumbersV412 = 'true';
      }
    }
  };

  window.GANNZILLA_UPRIGHT_SYMMETRIC_ALL_NUMBERS_V412 = true;
  window.__auditGannzillaUprightSymmetricAllNumbersV412 = () => ({
    ok: CanvasRenderingContext2D.prototype.fillText !== previousFillText,
    build: BUILD,
    enabled: boolParam('uprightWheelNumbers', true),
    orientation: 'SCREEN_UPRIGHT_HORIZONTAL_FOR_EVERY_NUMERIC_CELL',
    cardinalAlignment: '36_NORTH_9_EAST_18_SOUTH_27_WEST',
    northLastCell: boolParam('northLastCell', true),
    numericDrawCount,
    uprightDrawCount,
    fittedDrawCount,
    smallestAppliedFontSize,
    divisions: divisionCount(),
    actualCellRadialHeight: actualCellRadialHeight(),
    tangentialRatio: numberParam('gannzillaCellTextWidthRatio', DEFAULT_TANGENTIAL_RATIO, 0.35, 0.94),
    radialRatio: numberParam('gannzillaCellTextHeightRatio', DEFAULT_RADIAL_RATIO, 0.35, 0.88),
    allNumericRingsCovered: true,
    projectedCellFitEnabled: true,
    horizontalCondensationDisabled: true,
    centeredTextAuthority: true,
    safeCellPaddingEnabled: true,
  });
}

install();
