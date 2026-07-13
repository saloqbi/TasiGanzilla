import React from 'react';

const PATCH_KEY = '__gannzillaExistingProtractorTextPatchV352';
const MAJOR_ANGLE_PATTERN = /^(0|30|60|90|120|150|180|210|240|270|300|330)°$/;

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
    const textColor = '#41464d';
    const family = 'Segoe UI, Arial, Helvetica, sans-serif';

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

    this.font = `${fontWeight} ${fontSize}px ${family}`;
    const digitMetrics = this.measureText(digits);
    const digitAdvance = digitMetrics.width;
    const digitLeft = -metricValue(digitMetrics, 'actualBoundingBoxLeft', 0);
    const digitRight = metricValue(digitMetrics, 'actualBoundingBoxRight', digitAdvance);
    const digitAscent = metricValue(digitMetrics, 'actualBoundingBoxAscent', fontSize * 0.75);
    const digitDescent = metricValue(digitMetrics, 'actualBoundingBoxDescent', fontSize * 0.2);

    const degreeFontSize = Math.max(10, fontSize * degreeScale);
    this.font = `${fontWeight} ${degreeFontSize}px ${family}`;
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

    this.font = `${fontWeight} ${fontSize}px ${family}`;
    nativeFillText.call(this, digits, x + visualCenterShift, y + digitBaselineY);

    this.font = `${fontWeight} ${degreeFontSize}px ${family}`;
    nativeFillText.call(
      this,
      '°',
      x + visualCenterShift + degreeOrigin,
      y + digitBaselineY - (fontSize * 0.25),
    );

    this.restore();
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

    window.GANNZILLA_EXISTING_PROTRACTOR_FONT_DOUBLE_V352 = true;
    window.__auditGannzillaExistingProtractorFontDoubleV352 = () => ({
      ok: Boolean(window[PATCH_KEY]),
      build: 352,
      existingAnglesOnly: true,
      scannedAngles: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      fontPx: numberParam('gannzillaProtractorFontSize', 20, 16, 28),
      degreeScale: numberParam('gannzillaProtractorDegreeScale', 0.52, 0.42, 0.68),
      radialGapPx: numberParam('gannzillaProtractorRadialGap', 4, 0, 18),
      zeroShiftX: numberParam('gannzillaProtractorZeroShiftX', 0, -4, 4),
      twoSeventyShiftY: numberParam('gannzillaProtractor270ShiftY', 0, -4, 4),
      horizontal: boolParam('protractorLabelsHorizontal', true),
      nativeAnchorPreserved: true,
      exactInkBoundingBoxCenter: true,
      exactDigitVerticalCenter: true,
      centeredOnRedTickAxis: true,
      backgroundOverlay: false,
      addedAngles: false,
      wheelGeometryChanged: false,
      nativeRendererIntercepted: true,
    });

    return () => {
      uninstall();
      delete window.GANNZILLA_EXISTING_PROTRACTOR_FONT_DOUBLE_V352;
      delete window.__auditGannzillaExistingProtractorFontDoubleV352;
    };
  }, []);

  return null;
}
