import React from 'react';

const PATCH_KEY = '__gannzillaExistingProtractorTextPatchV347';
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
    const isMajorAngle = MAJOR_ANGLE_PATTERN.test(label);
    const enabled = boolParam('showProtractor', true)
      && boolParam('improveExistingProtractorLabels', true);

    if (!enabled || !isMajorAngle) {
      return nativeFillText.apply(this, arguments);
    }

    const fontSize = numberParam('gannzillaProtractorFontSize', 20, 16, 28);
    const fontWeight = Math.round(numberParam('gannzillaProtractorFontWeight', 700, 500, 900));
    const horizontal = boolParam('protractorLabelsHorizontal', true);
    const radialGap = numberParam('gannzillaProtractorRadialGap', 0, -12, 16);
    const textColor = '#454545';
    const family = 'Segoe UI, Arial, Helvetica, sans-serif';

    this.save();

    if (horizontal && typeof this.getTransform === 'function') {
      const matrix = this.getTransform();
      let px = matrix.a * x + matrix.c * y + matrix.e;
      let py = matrix.b * x + matrix.d * y + matrix.f;
      const scale = Math.hypot(matrix.a, matrix.b) || 1;

      if (radialGap !== 0) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const dx = px - centerX;
        const dy = py - centerY;
        const length = Math.hypot(dx, dy) || 1;
        const gapInDevicePixels = radialGap * scale;
        px += (dx / length) * gapInDevicePixels;
        py += (dy / length) * gapInDevicePixels;
      }

      this.setTransform(scale, 0, 0, scale, px, py);
      x = 0;
      y = 0;
    }

    this.font = `${fontWeight} ${fontSize}px ${family}`;
    this.fillStyle = textColor;
    this.textAlign = 'center';
    this.textBaseline = 'middle';
    nativeFillText.call(this, label, x, y, Math.max(56, fontSize * 3.3));

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

    window.GANNZILLA_EXISTING_PROTRACTOR_FONT_DOUBLE_V347 = true;
    window.__auditGannzillaExistingProtractorFontDoubleV347 = () => ({
      ok: Boolean(window[PATCH_KEY]),
      build: 347,
      existingAnglesOnly: true,
      angleStep: 30,
      fontPx: numberParam('gannzillaProtractorFontSize', 20, 16, 28),
      horizontal: boolParam('protractorLabelsHorizontal', true),
      radialGapPx: numberParam('gannzillaProtractorRadialGap', 0, -12, 16),
      nativeAnchorPreserved: true,
      exactTextCenterAlignment: true,
      textAlign: 'center',
      textBaseline: 'middle',
      backgroundOverlay: false,
      addedAngles: false,
      wheelGeometryChanged: false,
      nativeRendererIntercepted: true,
    });

    return () => {
      uninstall();
      delete window.GANNZILLA_EXISTING_PROTRACTOR_FONT_DOUBLE_V347;
      delete window.__auditGannzillaExistingProtractorFontDoubleV347;
    };
  }, []);

  return null;
}
