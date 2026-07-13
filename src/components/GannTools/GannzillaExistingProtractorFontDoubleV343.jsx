import React from 'react';

const PATCH_KEY = '__gannzillaExistingProtractorTextPatchV345';
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

    const digits = match[1];
    const fontSize = numberParam('gannzillaProtractorFontSize', 24, 16, 32);
    const fontWeight = Math.round(numberParam('gannzillaProtractorFontWeight', 700, 500, 900));
    const horizontal = boolParam('protractorLabelsHorizontal', true);
    const degreeScale = numberParam('gannzillaProtractorDegreeScale', 0.56, 0.42, 0.72);
    const opticalShift = numberParam('gannzillaProtractorOpticalShift', 0, -8, 8);
    const textColor = '#454545';
    const family = 'Segoe UI, Arial, Helvetica, sans-serif';

    this.save();

    if (horizontal && typeof this.getTransform === 'function') {
      const matrix = this.getTransform();
      const px = matrix.a * x + matrix.c * y + matrix.e;
      const py = matrix.b * x + matrix.d * y + matrix.f;
      const scale = Math.hypot(matrix.a, matrix.b) || 1;
      this.setTransform(scale, 0, 0, scale, px, py);
      x = 0;
      y = 0;
    }

    this.fillStyle = textColor;
    this.textBaseline = 'middle';

    this.font = `${fontWeight} ${fontSize}px ${family}`;
    const digitWidth = this.measureText(digits).width;

    const degreeFontSize = Math.max(10, fontSize * degreeScale);
    this.font = `${fontWeight} ${degreeFontSize}px ${family}`;
    const degreeWidth = this.measureText('°').width;

    const gap = Math.max(1.5, fontSize * 0.07);
    const totalWidth = digitWidth + gap + degreeWidth;
    const startX = x - (totalWidth / 2) + opticalShift;

    this.font = `${fontWeight} ${fontSize}px ${family}`;
    this.textAlign = 'left';
    nativeFillText.call(this, digits, startX, y);

    this.font = `${fontWeight} ${degreeFontSize}px ${family}`;
    this.textAlign = 'left';
    nativeFillText.call(
      this,
      '°',
      startX + digitWidth + gap,
      y - (fontSize * 0.27),
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

    window.GANNZILLA_EXISTING_PROTRACTOR_FONT_DOUBLE_V344 = true;
    window.GANNZILLA_EXISTING_PROTRACTOR_FONT_DOUBLE_V345 = true;
    window.__auditGannzillaExistingProtractorFontDoubleV345 = () => ({
      ok: Boolean(window[PATCH_KEY]),
      build: 345,
      existingAnglesOnly: true,
      angleStep: 30,
      oldFontPx: 12,
      newFontPx: numberParam('gannzillaProtractorFontSize', 24, 16, 32),
      scale: numberParam('gannzillaProtractorFontSize', 24, 16, 32) / 12,
      horizontal: boolParam('protractorLabelsHorizontal', true),
      geometricallyCentered: true,
      degreeMarkSuperscripted: true,
      variableWidthBalanced: true,
      opticalShiftPx: numberParam('gannzillaProtractorOpticalShift', 0, -8, 8),
      backgroundOverlay: false,
      addedAngles: false,
      wheelGeometryChanged: false,
      nativeRendererIntercepted: true,
    });
    window.__auditGannzillaExistingProtractorFontDoubleV344 = window.__auditGannzillaExistingProtractorFontDoubleV345;

    return () => {
      uninstall();
      delete window.GANNZILLA_EXISTING_PROTRACTOR_FONT_DOUBLE_V344;
      delete window.GANNZILLA_EXISTING_PROTRACTOR_FONT_DOUBLE_V345;
      delete window.__auditGannzillaExistingProtractorFontDoubleV344;
      delete window.__auditGannzillaExistingProtractorFontDoubleV345;
    };
  }, []);

  return null;
}
