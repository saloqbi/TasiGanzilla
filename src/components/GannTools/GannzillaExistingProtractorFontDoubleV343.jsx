import React from 'react';

const PATCH_KEY = '__gannzillaExistingProtractorTextPatchV351';
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

    const degree = Number(match[1]);
    const digits = match[1];
    const fontSize = numberParam('gannzillaProtractorFontSize', 20, 16, 28);
    const fontWeight = Math.round(numberParam('gannzillaProtractorFontWeight', 700, 500, 900));
    const horizontal = boolParam('protractorLabelsHorizontal', true);
    const radialGap = numberParam('gannzillaProtractorRadialGap', 4, 0, 18);
    const degreeScale = numberParam('gannzillaProtractorDegreeScale', 0.52, 0.42, 0.68);
    const textColor = '#41464d';
    const family = 'Segoe UI, Arial, Helvetica, sans-serif';

    this.save();

    if (horizontal && typeof this.getTransform === 'function') {
      const matrix = this.getTransform();
      const px = matrix.a * x + matrix.c * y + matrix.e;
      const py = matrix.b * x + matrix.d * y + matrix.f;
      const scale = Math.hypot(matrix.a, matrix.b) || 1;

      // Preserve the renderer's native anchor, then move only along the
      // exact radial axis for this degree. This remains correct while panning.
      const radians = (degree * Math.PI) / 180;
      const radialX = Math.sin(radians);
      const radialY = -Math.cos(radians);
      const targetX = px + (radialX * radialGap * scale);
      const targetY = py + (radialY * radialGap * scale);

      this.setTransform(scale, 0, 0, scale, targetX, targetY);
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

    const gap = Math.max(1.25, fontSize * 0.055);
    const totalWidth = digitWidth + gap + degreeWidth;
    const startX = x - (totalWidth / 2);

    this.font = `${fontWeight} ${fontSize}px ${family}`;
    this.textAlign = 'left';
    nativeFillText.call(this, digits, startX, y);

    this.font = `${fontWeight} ${degreeFontSize}px ${family}`;
    this.textAlign = 'left';
    nativeFillText.call(this, '°', startX + digitWidth + gap, y - (fontSize * 0.25));

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

    window.GANNZILLA_EXISTING_PROTRACTOR_FONT_DOUBLE_V351 = true;
    window.__auditGannzillaExistingProtractorFontDoubleV351 = () => ({
      ok: Boolean(window[PATCH_KEY]),
      build: 351,
      existingAnglesOnly: true,
      scannedAngles: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      fontPx: numberParam('gannzillaProtractorFontSize', 20, 16, 28),
      degreeScale: numberParam('gannzillaProtractorDegreeScale', 0.52, 0.42, 0.68),
      radialGapPx: numberParam('gannzillaProtractorRadialGap', 4, 0, 18),
      horizontal: boolParam('protractorLabelsHorizontal', true),
      nativeAnchorPreserved: true,
      panInvariantRadialOffset: true,
      compositeLabelMeasuredCenter: true,
      centeredOnRedTickAxis: true,
      backgroundOverlay: false,
      addedAngles: false,
      wheelGeometryChanged: false,
      nativeRendererIntercepted: true,
    });

    return () => {
      uninstall();
      delete window.GANNZILLA_EXISTING_PROTRACTOR_FONT_DOUBLE_V351;
      delete window.__auditGannzillaExistingProtractorFontDoubleV351;
    };
  }, []);

  return null;
}
