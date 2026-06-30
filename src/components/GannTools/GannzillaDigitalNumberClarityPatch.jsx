import React from 'react';

const PATCH_FLAG = '__gannzillaDigitalNumberClarityPatchV1';

function parseFontSize(font) {
  const match = String(font || '').match(/(\d+(?:\.\d+)?)px/i);
  return match ? Number(match[1]) : null;
}

function replaceFontSize(font, nextSize) {
  return String(font || '').replace(/\d+(?:\.\d+)?px/i, `${Number(nextSize.toFixed(1))}px`);
}

function makeFontBolder(font) {
  const base = String(font || '700 12px Segoe UI, Arial, sans-serif');
  if (/\b(700|800|900|bold)\b/i.test(base)) return base.replace(/\b700\b/i, '800').replace(/\bbold\b/i, '800');
  return `800 ${base}`;
}

function isWheelNumber(text) {
  return /^-?\d+(?:\.\d+)?$/.test(String(text || '').trim());
}

function numberLength(text) {
  return String(text || '').trim().replace('-', '').replace('.', '').length;
}

function targetFontSize(text, currentSize) {
  const length = numberLength(text);

  // Long market values such as 72972 / 93055 must stay compact.
  // Upscaling them causes visual crowding in the inner rings.
  if (length >= 7) return Math.min(currentSize, 7.6);
  if (length === 6) return Math.min(currentSize, 8.6);
  if (length === 5) return Math.min(currentSize, 10.2);
  if (length === 4) return Math.min(Math.max(currentSize, 10.4), 11.4);

  if (length === 3) return Math.max(currentSize, 12.2);
  return Math.max(currentSize, 12.0);
}

export default function GannzillaDigitalNumberClarityPatch() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const proto = window.CanvasRenderingContext2D?.prototype;
    if (!proto || proto[PATCH_FLAG]) return undefined;

    const originalFillText = proto.fillText;
    const originalStrokeText = proto.strokeText;
    proto[PATCH_FLAG] = { originalFillText, originalStrokeText };

    proto.fillText = function patchedFillText(text, x, y, maxWidth) {
      const label = String(text ?? '').trim();
      const currentSize = parseFontSize(this.font);
      const isNumeric = isWheelNumber(label);
      const isGannFont = /Segoe UI|Arial|Helvetica/i.test(String(this.font || ''));

      if (!isNumeric || !currentSize || !isGannFont || currentSize > 14.8) {
        return originalFillText.call(this, text, x, y, maxWidth);
      }

      const length = numberLength(label);
      const oldFont = this.font;
      const oldLineWidth = this.lineWidth;
      const oldStrokeStyle = this.strokeStyle;
      const oldGlobalAlpha = this.globalAlpha;
      const nextSize = targetFontSize(label, currentSize);
      const adjustedFont = length >= 5
        ? replaceFontSize(oldFont, nextSize)
        : makeFontBolder(replaceFontSize(oldFont, nextSize));

      try {
        this.font = adjustedFont;
        this.globalAlpha = Math.min(1, Math.max(0.96, oldGlobalAlpha || 1));

        // Short numbers get a tiny white halo. Long numbers stay clean to avoid blur/crowding.
        if (length < 5) {
          this.lineWidth = Math.max(1.0, nextSize * 0.10);
          this.strokeStyle = 'rgba(255,255,255,0.86)';
          originalStrokeText.call(this, text, x, y, maxWidth);
        }

        return originalFillText.call(this, text, x, y, maxWidth);
      } finally {
        this.font = oldFont;
        this.lineWidth = oldLineWidth;
        this.strokeStyle = oldStrokeStyle;
        this.globalAlpha = oldGlobalAlpha;
      }
    };

    window.setTimeout(() => window.dispatchEvent(new Event('resize')), 80);

    return () => {
      if (proto[PATCH_FLAG]) {
        proto.fillText = proto[PATCH_FLAG].originalFillText;
        proto.strokeText = proto[PATCH_FLAG].originalStrokeText;
        delete proto[PATCH_FLAG];
      }
    };
  }, []);

  return null;
}
