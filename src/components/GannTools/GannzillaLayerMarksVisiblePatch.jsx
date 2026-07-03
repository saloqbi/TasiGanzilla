import React from 'react';

const PATCH_CANVAS_ID = 'gannzilla-layer-marks-axis-right-patch-v26';
const SOURCE_CANVAS_ID = 'gannzilla-long-number-digital-renderer-v1';
const FONT_STACK = 'Tahoma, Arial, Segoe UI, Helvetica, sans-serif';
const LAYER_COLOR = '#9c27b0';
const MARKER = 'GANNZILLA_LAYER_MARKS_AXIS_NEAR_LINE_PATCH_V26';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatNumber(value) {
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(4)));
}

function numberAtRing(startValue, ringIndex, sectorIndex, divisions, increment) {
  return startValue + ((ringIndex - 1) * divisions + sectorIndex) * increment;
}

function getNumberInputs() {
  return Array.from(document.querySelectorAll('aside input[type="number"]'));
}

function getViewSelect() {
  return Array.from(document.querySelectorAll('aside select')).find((select) =>
    Array.from(select.options || []).some((option) => String(option.textContent || '').includes('Circle of 36'))
  );
}

function getSettings() {
  const inputs = getNumberInputs();
  const levels = clamp(Number(inputs[0]?.value) || 5, 1, 12);
  const startValue = Number(inputs[1]?.value ?? 1) || 0;
  const increment = Number(inputs[3]?.value ?? 1) || 1;
  const divisions = Number(getViewSelect()?.value) || 36;
  return { levels, startValue, increment, divisions };
}

function ringWeight(ring, longMode) {
  if (!longMode) return ring === 1 ? 1.86 : ring === 2 ? 1.38 : ring === 3 ? 1.22 : 1.08;
  if (ring === 1) return 2.26;
  if (ring === 2) return 1.68;
  if (ring === 3) return 1.34;
  return 1.10;
}

function ringMetrics(innerRadius, baseRingWidth, ring, longMode) {
  let inner = innerRadius;
  for (let r = 1; r < ring; r += 1) inner += baseRingWidth * ringWeight(r, longMode);
  const width = baseRingWidth * ringWeight(ring, longMode);
  return { inner, outer: inner + width, width, mid: inner + width / 2 };
}

function drawLayerText(ctx, text, x, y, fontSize) {
  ctx.save();
  ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5);
  ctx.font = `600 ${fontSize}px ${FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(0.45, fontSize * 0.03);
  ctx.strokeStyle = 'rgba(255,255,255,0.96)';
  ctx.strokeText(String(text), 0, 0);
  ctx.fillStyle = LAYER_COLOR;
  ctx.globalAlpha = 0.92;
  ctx.fillText(String(text), 0, 0);
  ctx.restore();
}

function renderLayerMarks(overlay, sourceCanvas) {
  const rect = sourceCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  overlay.style.position = 'fixed';
  overlay.style.left = `${rect.left}px`;
  overlay.style.top = `${rect.top}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
  overlay.style.zIndex = '9999';
  overlay.style.pointerEvents = 'none';
  overlay.width = Math.max(1, Math.round(rect.width * dpr));
  overlay.height = Math.max(1, Math.round(rect.height * dpr));

  const ctx = overlay.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);

  const { levels, startValue, increment, divisions } = getSettings();
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const minSide = Math.min(rect.width, rect.height);
  const sampleMax = numberAtRing(startValue, levels, Math.max(0, divisions - 1), divisions, increment);
  const longMode = Math.max(formatNumber(startValue).length, formatNumber(sampleMax).length) >= 7;
  const extraRings = 96;
  const wheelRadius = minSide / 2 - extraRings;
  const innerRadius = clamp(minSide * (longMode ? 0.158 : 0.138), 74, wheelRadius * 0.44);
  const weightSum = Array.from({ length: levels }, (_, i) => ringWeight(i + 1, longMode)).reduce((a, b) => a + b, 0);
  const baseRingWidth = Math.max(30, (wheelRadius - innerRadius) / Math.max(1, weightSum));

  // V26: keep exactly one layer number per ring, smaller and very close to the 0° axis line.
  // This avoids merging with 36/72/108 on the left and 1/37/73/145 on the right.
  const labelX = cx + clamp(baseRingWidth * 0.16, 5.0, 8.5);
  const labelSize = clamp(baseRingWidth * 0.20, 8.0, 11.2);

  for (let ring = 1; ring <= levels; ring += 1) {
    const metrics = ringMetrics(innerRadius, baseRingWidth, ring, longMode);
    const label = ((ring - 1) % 10) + 1;
    const labelY = cy - metrics.mid;
    drawLayerText(ctx, label, labelX, labelY, labelSize);
  }
}

export default function GannzillaLayerMarksVisiblePatch() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    document.getElementById('gannzilla-layer-marks-visible-patch-v16')?.remove();
    document.getElementById('gannzilla-layer-marks-visible-patch-v17')?.remove();
    document.getElementById('gannzilla-layer-marks-visible-patch-v18')?.remove();
    document.getElementById('gannzilla-layer-marks-line-patch-v19')?.remove();
    document.getElementById('gannzilla-layer-marks-line-patch-v20')?.remove();
    document.getElementById('gannzilla-layer-marks-line-patch-v21')?.remove();
    document.getElementById('gannzilla-layer-marks-line-patch-v22')?.remove();
    document.getElementById('gannzilla-layer-marks-clean-single-patch-v23')?.remove();
    document.getElementById('gannzilla-layer-marks-axis-right-patch-v25')?.remove();

    let overlay = document.getElementById(PATCH_CANVAS_ID);
    if (!overlay) {
      overlay = document.createElement('canvas');
      overlay.id = PATCH_CANVAS_ID;
      document.body.appendChild(overlay);
    }
    window.__gannzillaLayerMarksAxisNearLinePatchV26 = MARKER;

    const render = () => {
      const sourceCanvas = document.getElementById(SOURCE_CANVAS_ID);
      if (!sourceCanvas) return;
      renderLayerMarks(overlay, sourceCanvas);
    };

    render();
    const timer = window.setInterval(render, 180);
    window.addEventListener('resize', render);
    window.addEventListener('scroll', render, true);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('resize', render);
      window.removeEventListener('scroll', render, true);
      document.getElementById(PATCH_CANVAS_ID)?.remove();
    };
  }, []);

  return null;
}
