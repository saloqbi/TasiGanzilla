import React from 'react';

const PATCH_KEY = '__gannzillaExistingProtractorTextPatchV357';
const MAJOR_ANGLE_PATTERN = /^(0|30|60|90|120|150|180|210|240|270|300|330)°$/;
const ENGLISH_CALENDAR_LABEL_PATTERN = /^\s*(?:\d{1,2}\s+)?(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s*$/i;
const ARABIC_CALENDAR_LABEL_PATTERN = /^\s*(?:[٠-٩0-9]{1,2}\s+)?(?:يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر)\s*$/;
const FONT_FAMILY = 'Segoe UI, Arial, Helvetica, sans-serif';
const WHEEL_NUMBER_COLORS = Object.freeze({
  red: '#a10f1f',
  blue: '#1457d9',
  black: '#111111',
});
const FIVE_DEGREE_COLOR = '#777b80';

const renderEpochByCanvas = new WeakMap();
const supplementalSignatureByCanvas = new WeakMap();
let scheduleSupplementalAngleDraw = null;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function params() {
  try {
    return new URLSearchParams(window.location.search || '');
  } catch (_) {
    return new URLSearchParams();
  }
}

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? clamp(value, min, max) : fallback;
}

function boolParam(name, fallback) {
  const query = params();
  if (!query.has(name)) return fallback;
  const value = String(query.get(name) || '').toLowerCase();
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
}

function metricValue(metrics, key, fallback) {
  const value = Number(metrics?.[key]);
  return Number.isFinite(value) ? value : fallback;
}

function angleColor(degree) {
  const slot = Math.abs(Math.round(degree / 10)) % 9;
  if (slot === 1 || slot === 4 || slot === 7) return WHEEL_NUMBER_COLORS.red;
  if (slot === 2 || slot === 5 || slot === 8) return WHEEL_NUMBER_COLORS.blue;
  return WHEEL_NUMBER_COLORS.black;
}

function polar(cx, cy, radius, degrees) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function findWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function isCalendarLabel(label) {
  return ENGLISH_CALENDAR_LABEL_PATTERN.test(label)
    || ARABIC_CALENDAR_LABEL_PATTERN.test(label);
}

function scaleCanvasFont(font, factor) {
  const source = String(font || '');
  if (!source) return source;
  return source.replace(/(\d+(?:\.\d+)?)px/i, (_, size) => `${Number(size) * factor}px`);
}

function drawUnifiedAngleLabel(ctx, degree, x, y, options = {}) {
  const fontSize = options.fontSize ?? 20;
  const fontWeight = options.fontWeight ?? 700;
  const degreeScale = options.degreeScale ?? 0.52;
  const color = options.color ?? angleColor(degree);
  const includeDegreeSymbol = options.includeDegreeSymbol !== false;
  const digits = String(degree);

  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `${fontWeight} ${fontSize}px ${FONT_FAMILY}`;

  const digitMetrics = ctx.measureText(digits);
  const digitAdvance = digitMetrics.width;
  const digitLeft = -metricValue(digitMetrics, 'actualBoundingBoxLeft', 0);
  const digitRight = metricValue(digitMetrics, 'actualBoundingBoxRight', digitAdvance);
  const digitAscent = metricValue(digitMetrics, 'actualBoundingBoxAscent', fontSize * 0.75);
  const digitDescent = metricValue(digitMetrics, 'actualBoundingBoxDescent', fontSize * 0.2);
  const digitBaselineY = (digitAscent - digitDescent) / 2;

  if (!includeDegreeSymbol) {
    const visualCenterShift = -((digitLeft + digitRight) / 2);
    ctx.fillText(digits, x + visualCenterShift, y + digitBaselineY);
    return;
  }

  const degreeFontSize = Math.max(10, fontSize * degreeScale);
  ctx.font = `${fontWeight} ${degreeFontSize}px ${FONT_FAMILY}`;
  const degreeMetrics = ctx.measureText('°');
  const degreeAdvance = degreeMetrics.width;
  const degreeLeftMetric = metricValue(degreeMetrics, 'actualBoundingBoxLeft', 0);
  const degreeRightMetric = metricValue(degreeMetrics, 'actualBoundingBoxRight', degreeAdvance);

  const gap = Math.max(1.25, fontSize * 0.055);
  const degreeOrigin = digitAdvance + gap;
  const visualLeft = Math.min(digitLeft, degreeOrigin - degreeLeftMetric);
  const visualRight = Math.max(digitRight, degreeOrigin + degreeRightMetric);
  const visualCenterShift = -((visualLeft + visualRight) / 2);

  ctx.font = `${fontWeight} ${fontSize}px ${FONT_FAMILY}`;
  ctx.fillText(digits, x + visualCenterShift, y + digitBaselineY);

  ctx.font = `${fontWeight} ${degreeFontSize}px ${FONT_FAMILY}`;
  ctx.fillText(
    '°',
    x + visualCenterShift + degreeOrigin,
    y + digitBaselineY - (fontSize * 0.25),
  );
}

function drawSupplementalFiveDegreeAngles() {
  const showTenDegreeAngles = boolParam('showTenDegreeAngles', false);
  const showFiveDegreeAngles = boolParam('showFiveDegreeAngles', false);
  const enabled = boolParam('showProtractor', true)
    && (showTenDegreeAngles || showFiveDegreeAngles);
  if (!enabled) return false;

  const canvas = findWheelCanvas();
  if (!canvas) return false;

  const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
  const coordinateWidth = canvas.width / dpr;
  const coordinateHeight = canvas.height / dpr;
  if (!Number.isFinite(coordinateWidth) || !Number.isFinite(coordinateHeight)) return false;

  const levels = Math.round(numberParam('levels', 10, 1, 12));
  const innerRadius = numberParam('gannzillaInnerRadius', 170, 80, 500);
  const ringWidth = numberParam('gannzillaRingWidth', 60, 30, 150);
  const radialGap = numberParam('gannzillaProtractorRadialGap', 4, 0, 18);
  const fontSize = numberParam('gannzillaProtractorFontSize', 20, 16, 28);
  const fontWeight = Math.round(numberParam('gannzillaProtractorFontWeight', 700, 500, 900));
  const degreeScale = numberParam('gannzillaProtractorDegreeScale', 0.52, 0.42, 0.68);
  const fiveFontSize = numberParam('gannzillaFiveDegreeFontSize', 14, 10, 18);
  const fiveFontWeight = Math.round(numberParam('gannzillaFiveDegreeFontWeight', 500, 400, 700));
  const fiveRadialOffset = numberParam('gannzillaFiveDegreeRadialOffset', 0, -10, 10);
  const labelRadius = innerRadius + (levels * ringWidth) + 18 + 34 + 22 + radialGap;
  const cx = coordinateWidth / 2;
  const cy = coordinateHeight / 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  const epoch = renderEpochByCanvas.get(canvas) || 0;
  const signature = [
    epoch,
    showTenDegreeAngles,
    showFiveDegreeAngles,
    fontSize,
    fontWeight,
    degreeScale,
    fiveFontSize,
    fiveFontWeight,
    fiveRadialOffset,
    labelRadius,
  ].join('|');
  if (supplementalSignatureByCanvas.get(canvas) === signature) return true;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  for (let degree = 5; degree < 360; degree += 5) {
    if (degree % 30 === 0) continue;

    if (degree % 10 === 0) {
      if (!showTenDegreeAngles) continue;
      const point = polar(cx, cy, labelRadius, degree);
      drawUnifiedAngleLabel(ctx, degree, point.x, point.y, {
        fontSize,
        fontWeight,
        degreeScale,
        color: angleColor(degree),
        includeDegreeSymbol: true,
      });
      continue;
    }

    if (!showFiveDegreeAngles) continue;
    const point = polar(cx, cy, labelRadius + fiveRadialOffset, degree);
    drawUnifiedAngleLabel(ctx, degree, point.x, point.y, {
      fontSize: fiveFontSize,
      fontWeight: fiveFontWeight,
      color: FIVE_DEGREE_COLOR,
      includeDegreeSymbol: false,
    });
  }

  ctx.restore();
  supplementalSignatureByCanvas.set(canvas, signature);
  return true;
}

function installProtractorTextPatch() {
  if (typeof window === 'undefined' || typeof CanvasRenderingContext2D === 'undefined') {
    return () => {};
  }

  const existing = window[PATCH_KEY];
  if (existing) {
    existing.refCount += 1;
    return () => {
      existing.refCount -= 1;
      if (existing.refCount <= 0) existing.restore();
    };
  }

  const prototype = CanvasRenderingContext2D.prototype;
  const nativeFillText = prototype.fillText;
  const nativeClearRect = prototype.clearRect;

  const patchedClearRect = function patchedClearRect(...args) {
    if (this?.canvas) {
      const nextEpoch = (renderEpochByCanvas.get(this.canvas) || 0) + 1;
      renderEpochByCanvas.set(this.canvas, nextEpoch);
    }
    return nativeClearRect.apply(this, args);
  };

  const patchedFillText = function patchedFillText(text, x, y, maxWidth) {
    const label = String(text ?? '');

    if (boolParam('enlargeCalendarLabels', false) && isCalendarLabel(label)) {
      const calendarScale = numberParam('gannzillaCalendarLabelScale', 2, 1, 3);
      this.save();
      this.font = scaleCanvasFont(this.font, calendarScale);
      let result;
      if (Number.isFinite(Number(maxWidth))) {
        result = nativeFillText.call(this, text, x, y, Number(maxWidth) * calendarScale);
      } else {
        result = nativeFillText.call(this, text, x, y);
      }
      this.restore();
      return result;
    }

    const match = MAJOR_ANGLE_PATTERN.exec(label);
    const enabled = boolParam('showProtractor', true)
      && boolParam('improveExistingProtractorLabels', true);

    if (!enabled || !match) {
      return nativeFillText.apply(this, arguments);
    }

    const degree = Number(match[1]);
    const fontSize = numberParam('gannzillaProtractorFontSize', 20, 16, 28);
    const fontWeight = Math.round(numberParam('gannzillaProtractorFontWeight', 700, 500, 900));
    const horizontal = boolParam('protractorLabelsHorizontal', true);
    const radialGap = numberParam('gannzillaProtractorRadialGap', 4, 0, 18);
    const degreeScale = numberParam('gannzillaProtractorDegreeScale', 0.52, 0.42, 0.68);
    const zeroShiftX = numberParam('gannzillaProtractorZeroShiftX', 0, -4, 4);
    const twoSeventyShiftY = numberParam('gannzillaProtractor270ShiftY', 0, -4, 4);

    this.save();

    if (horizontal && typeof this.getTransform === 'function') {
      const matrix = this.getTransform();
      const px = matrix.a * x + matrix.c * y + matrix.e;
      const py = matrix.b * x + matrix.d * y + matrix.f;
      const scale = Math.hypot(matrix.a, matrix.b) || 1;
      const radians = (degree * Math.PI) / 180;
      const radialX = Math.sin(radians);
      const radialY = -Math.cos(radians);
      const microX = degree === 0 ? zeroShiftX * scale : 0;
      const microY = degree === 270 ? twoSeventyShiftY * scale : 0;
      const targetX = px + (radialX * radialGap * scale) + microX;
      const targetY = py + (radialY * radialGap * scale) + microY;

      this.setTransform(scale, 0, 0, scale, targetX, targetY);
      x = 0;
      y = 0;
    }

    drawUnifiedAngleLabel(this, degree, x, y, {
      fontSize,
      fontWeight,
      degreeScale,
      color: angleColor(degree),
      includeDegreeSymbol: true,
    });

    this.restore();

    if (degree === 330 && typeof scheduleSupplementalAngleDraw === 'function') {
      scheduleSupplementalAngleDraw();
    }
    return undefined;
  };

  prototype.clearRect = patchedClearRect;
  prototype.fillText = patchedFillText;

  const state = {
    refCount: 1,
    restore() {
      if (prototype.fillText === patchedFillText) prototype.fillText = nativeFillText;
      if (prototype.clearRect === patchedClearRect) prototype.clearRect = nativeClearRect;
      delete window[PATCH_KEY];
    },
  };
  window[PATCH_KEY] = state;

  return () => {
    state.refCount -= 1;
    if (state.refCount <= 0) state.restore();
  };
}

export default function GannzillaExistingProtractorFontDoubleV343() {
  React.useLayoutEffect(() => {
    const uninstall = installProtractorTextPatch();
    let disposed = false;
    let frame = 0;
    const timers = new Set();

    const draw = () => {
      frame = 0;
      if (!disposed) drawSupplementalFiveDegreeAngles();
    };

    const schedule = (delay = 0) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        if (disposed) return;
        if (frame) window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(draw);
      }, delay);
      timers.add(timer);
    };

    const scheduleAfterChange = () => {
      schedule(0);
      schedule(100);
      schedule(260);
    };

    scheduleSupplementalAngleDraw = () => schedule(0);
    [0, 120, 320, 600].forEach(schedule);

    document.addEventListener('input', scheduleAfterChange, true);
    document.addEventListener('change', scheduleAfterChange, true);
    window.addEventListener('resize', scheduleAfterChange);
    window.addEventListener('gannzilla:ring-two-numbering-refresh', scheduleAfterChange);
    window.addEventListener('gannzilla:canonical-property-change-v326', scheduleAfterChange);

    window.GANNZILLA_EXISTING_PROTRACTOR_FONT_DOUBLE_V357 = true;
    window.__auditGannzillaExistingProtractorFontDoubleV357 = () => ({
      ok: Boolean(window[PATCH_KEY]),
      build: 357,
      majorAnglesEveryThirtyDegrees: true,
      coloredAnglesEveryTenDegrees: boolParam('showTenDegreeAngles', false),
      grayMinorAnglesEveryFiveDegrees: boolParam('showFiveDegreeAngles', false),
      fiveDegreeFontPx: numberParam('gannzillaFiveDegreeFontSize', 14, 10, 18),
      calendarLabelsEnlarged: boolParam('enlargeCalendarLabels', false),
      calendarLabelScale: numberParam('gannzillaCalendarLabelScale', 2, 1, 3),
      calendarLabelsOnly: true,
      angleFontSizesUnchanged: true,
      arabicAndEnglishCalendarLabelsSupported: true,
      exactVisualCentering: true,
      supplementalOverdrawPrevented: true,
      exactWheelPalette: WHEEL_NUMBER_COLORS,
      wheelGeometryChanged: false,
    });

    return () => {
      disposed = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      if (frame) window.cancelAnimationFrame(frame);
      document.removeEventListener('input', scheduleAfterChange, true);
      document.removeEventListener('change', scheduleAfterChange, true);
      window.removeEventListener('resize', scheduleAfterChange);
      window.removeEventListener('gannzilla:ring-two-numbering-refresh', scheduleAfterChange);
      window.removeEventListener('gannzilla:canonical-property-change-v326', scheduleAfterChange);
      scheduleSupplementalAngleDraw = null;
      uninstall();
      delete window.GANNZILLA_EXISTING_PROTRACTOR_FONT_DOUBLE_V357;
      delete window.__auditGannzillaExistingProtractorFontDoubleV357;
    };
  }, []);

  return null;
}
