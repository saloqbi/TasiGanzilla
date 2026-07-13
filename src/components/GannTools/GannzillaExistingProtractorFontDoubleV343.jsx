import React from 'react';

const PATCH_KEY = '__gannzillaExistingProtractorTextPatchV354';
const MAJOR_ANGLE_PATTERN = /^(0|30|60|90|120|150|180|210|240|270|300|330)°$/;
const FONT_FAMILY = 'Segoe UI, Arial, Helvetica, sans-serif';
const WHEEL_NUMBER_COLORS = Object.freeze({
  red: '#a10f1f',
  blue: '#1457d9',
  black: '#111111',
});

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

function drawSupplementalTenDegreeAngles() {
  const enabled = boolParam('showProtractor', true)
    && boolParam('showTenDegreeAngles', false);
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
  const majorFontSize = numberParam('gannzillaProtractorFontSize', 20, 16, 28);
  const majorFontWeight = Math.round(numberParam('gannzillaProtractorFontWeight', 700, 500, 900));
  const fontSize = numberParam('gannzillaMinorAngleFontSize', majorFontSize, 16, 28);
  const fontWeight = Math.round(numberParam('gannzillaMinorAngleFontWeight', majorFontWeight, 500, 900));
  const labelRadius = innerRadius + (levels * ringWidth) + 18 + 34 + 22 + radialGap;
  const cx = coordinateWidth / 2;
  const cy = coordinateHeight / 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.font = `${fontWeight} ${fontSize}px ${FONT_FAMILY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let degree = 10; degree < 360; degree += 10) {
    if (degree % 30 === 0) continue;
    const point = polar(cx, cy, labelRadius, degree);
    ctx.fillStyle = angleColor(degree);
    ctx.fillText(String(degree), point.x, point.y);
  }

  ctx.restore();
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

  const patchedFillText = function patchedFillText(text, x, y, maxWidth) {
    const label = String(text ?? '');
    const match = MAJOR_ANGLE_PATTERN.exec(label);
    const enabled = boolParam('showProtractor', true)
      && boolParam('improveExistingProtractorLabels', true);

    if (!enabled || !match) {
      return nativeFillText.apply(this, arguments);
    }

    const degree = Number(match[1]);
    const digits = match[1];
    const fontSize = numberParam('gannzillaProtractorFontSize', 20, 16, 28);
    const fontWeight = Math.round(numberParam('gannzillaProtractorFontWeight', 700, 500, 900));
    const horizontal = boolParam('protractorLabelsHorizontal', true);
    const radialGap = numberParam('gannzillaProtractorRadialGap', 4, 0, 18);
    const degreeScale = numberParam('gannzillaProtractorDegreeScale', 0.52, 0.42, 0.68);
    const zeroShiftX = numberParam('gannzillaProtractorZeroShiftX', 0, -4, 4);
    const twoSeventyShiftY = numberParam('gannzillaProtractor270ShiftY', 0, -4, 4);
    const textColor = angleColor(degree);

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

    this.fillStyle = textColor;
    this.textAlign = 'left';
    this.textBaseline = 'alphabetic';

    this.font = `${fontWeight} ${fontSize}px ${FONT_FAMILY}`;
    const digitMetrics = this.measureText(digits);
    const digitAdvance = digitMetrics.width;
    const digitLeft = -metricValue(digitMetrics, 'actualBoundingBoxLeft', 0);
    const digitRight = metricValue(digitMetrics, 'actualBoundingBoxRight', digitAdvance);
    const digitAscent = metricValue(digitMetrics, 'actualBoundingBoxAscent', fontSize * 0.75);
    const digitDescent = metricValue(digitMetrics, 'actualBoundingBoxDescent', fontSize * 0.2);

    const degreeFontSize = Math.max(10, fontSize * degreeScale);
    this.font = `${fontWeight} ${degreeFontSize}px ${FONT_FAMILY}`;
    const degreeMetrics = this.measureText('°');
    const degreeAdvance = degreeMetrics.width;
    const degreeLeftMetric = metricValue(degreeMetrics, 'actualBoundingBoxLeft', 0);
    const degreeRightMetric = metricValue(degreeMetrics, 'actualBoundingBoxRight', degreeAdvance);

    const gap = Math.max(1.25, fontSize * 0.055);
    const degreeOrigin = digitAdvance + gap;
    const visualLeft = Math.min(digitLeft, degreeOrigin - degreeLeftMetric);
    const visualRight = Math.max(digitRight, degreeOrigin + degreeRightMetric);
    const visualCenterShift = -((visualLeft + visualRight) / 2);
    const digitBaselineY = (digitAscent - digitDescent) / 2;

    this.font = `${fontWeight} ${fontSize}px ${FONT_FAMILY}`;
    nativeFillText.call(this, digits, x + visualCenterShift, y + digitBaselineY);

    this.font = `${fontWeight} ${degreeFontSize}px ${FONT_FAMILY}`;
    nativeFillText.call(
      this,
      '°',
      x + visualCenterShift + degreeOrigin,
      y + digitBaselineY - (fontSize * 0.25),
    );

    this.restore();

    if (degree === 330 && typeof scheduleSupplementalAngleDraw === 'function') {
      scheduleSupplementalAngleDraw();
    }
    return undefined;
  };

  prototype.fillText = patchedFillText;

  const state = {
    refCount: 1,
    restore() {
      if (prototype.fillText === patchedFillText) {
        prototype.fillText = nativeFillText;
      }
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
      if (!disposed) drawSupplementalTenDegreeAngles();
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
      schedule(80);
      schedule(220);
    };

    scheduleSupplementalAngleDraw = () => schedule(0);
    [0, 100, 260, 520].forEach(schedule);

    document.addEventListener('input', scheduleAfterChange, true);
    document.addEventListener('change', scheduleAfterChange, true);
    window.addEventListener('resize', scheduleAfterChange);
    window.addEventListener('gannzilla:ring-two-numbering-refresh', scheduleAfterChange);
    window.addEventListener('gannzilla:canonical-property-change-v326', scheduleAfterChange);

    window.GANNZILLA_EXISTING_PROTRACTOR_FONT_DOUBLE_V354 = true;
    window.__auditGannzillaExistingProtractorFontDoubleV354 = () => ({
      ok: Boolean(window[PATCH_KEY]),
      build: 354,
      majorFontPx: numberParam('gannzillaProtractorFontSize', 20, 16, 28),
      minorFontPx: numberParam(
        'gannzillaMinorAngleFontSize',
        numberParam('gannzillaProtractorFontSize', 20, 16, 28),
        16,
        28,
      ),
      sameFontFamilyAsMajor: true,
      sameDefaultSizeAsMajor: true,
      maxWidthCompressionRemoved: true,
      subpixelPositioningPreserved: true,
      exactWheelPalette: WHEEL_NUMBER_COLORS,
      colorRule: '147_RED_258_BLUE_369_BLACK',
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
      delete window.GANNZILLA_EXISTING_PROTRACTOR_FONT_DOUBLE_V354;
      delete window.__auditGannzillaExistingProtractorFontDoubleV354;
    };
  }, []);

  return null;
}
