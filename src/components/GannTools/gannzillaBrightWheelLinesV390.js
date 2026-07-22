const PATCH_KEY = '__gannzillaBrightWheelLinesV390';

function boolParam(name, fallback = false) {
  try {
    const query = new URLSearchParams(window.location.search || '');
    if (!query.has(name)) return fallback;
    const value = String(query.get(name) || '').toLowerCase();
    return value === 'true' || value === '1' || value === 'yes' || value === 'on';
  } catch (_) {
    return fallback;
  }
}

function isMainWheelCanvas(canvas) {
  if (!canvas || canvas.closest?.('aside')) return false;
  const rect = canvas.getBoundingClientRect?.();
  return Boolean(
    canvas.width > 0
      && canvas.height > 0
      && rect
      && rect.width > 250
      && rect.height > 250,
  );
}

function installBrightWheelLines() {
  if (typeof window === 'undefined' || typeof CanvasRenderingContext2D === 'undefined') return;
  if (window[PATCH_KEY]) return;

  const prototype = CanvasRenderingContext2D.prototype;
  const nativeStroke = prototype.stroke;

  prototype.stroke = function brightWheelStroke(...args) {
    if (boolParam('brightWheelLines', false) && isMainWheelCanvas(this.canvas)) {
      const previousStrokeStyle = this.strokeStyle;
      const previousLineWidth = this.lineWidth;
      const previousGlobalAlpha = this.globalAlpha;

      this.strokeStyle = '#000000';
      this.lineWidth = Math.max(1.15, Number(this.lineWidth) || 1);
      this.globalAlpha = 1;

      const result = nativeStroke.apply(this, args);

      this.strokeStyle = previousStrokeStyle;
      this.lineWidth = previousLineWidth;
      this.globalAlpha = previousGlobalAlpha;
      return result;
    }

    return nativeStroke.apply(this, args);
  };

  window[PATCH_KEY] = true;
  window.GANNZILLA_BRIGHT_WHEEL_LINES_V390 = true;
}

installBrightWheelLines();
