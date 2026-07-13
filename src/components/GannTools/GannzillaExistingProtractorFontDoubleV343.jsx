import React from 'react';

const PATCH_KEY = '__gannzillaExistingProtractorTextPatchV344';
const MAJOR_ANGLE_PATTERN = /^(?:0|30|60|90|120|150|180|210|240|270|300|330)°$/;

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
    const isMajorAngle = MAJOR_ANGLE_PATTERN.test(label);
    const enabled = boolParam('showProtractor', true)
      && boolParam('improveExistingProtractorLabels', true);

    if (!enabled || !isMajorAngle) {
      return nativeFillText.apply(this, arguments);
    }

    const fontSize = numberParam('gannzillaProtractorFontSize', 24, 12, 32);
    const fontWeight = Math.round(numberParam('gannzillaProtractorFontWeight', 700, 500, 900));
    const horizontal = boolParam('protractorLabelsHorizontal', true);
    const textColor = '#4a4a4a';
    const widthLimit = Math.max(72, fontSize * 3.4);

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

    this.font = `${fontWeight} ${fontSize}px Segoe UI, Arial, Helvetica, sans-serif`;
    this.fillStyle = textColor;
    this.textAlign = 'center';
    this.textBaseline = 'middle';
    nativeFillText.call(this, label, x, y, widthLimit);
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
    window.__auditGannzillaExistingProtractorFontDoubleV344 = () => ({
      ok: Boolean(window[PATCH_KEY]),
      build: 344,
      existingAnglesOnly: true,
      angleStep: 30,
      oldFontPx: 12,
      newFontPx: numberParam('gannzillaProtractorFontSize', 24, 12, 32),
      scale: numberParam('gannzillaProtractorFontSize', 24, 12, 32) / 12,
      horizontal: boolParam('protractorLabelsHorizontal', true),
      backgroundOverlay: false,
      addedAngles: false,
      wheelGeometryChanged: false,
      nativeRendererIntercepted: true,
    });

    return () => {
      uninstall();
      delete window.GANNZILLA_EXISTING_PROTRACTOR_FONT_DOUBLE_V344;
      delete window.__auditGannzillaExistingProtractorFontDoubleV344;
    };
  }, []);

  return null;
}
