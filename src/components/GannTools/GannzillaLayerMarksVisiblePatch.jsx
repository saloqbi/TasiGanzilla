import React from 'react';

const PATCH_CANVAS_ID = 'gannzilla-layer-marks-all-columns-patch-v28';
const SOURCE_CANVAS_ID = 'gannzilla-long-number-digital-renderer-v1';
const FONT_STACK = 'Arial Narrow, Tahoma, Arial, Segoe UI, Helvetica, sans-serif';
const LAYER_COLOR = '#8a2a8f';
const MARKER = 'GANNZILLA_LAYER_MARKS_ALL_COLUMNS_LARGER_PATCH_V28';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function polar(cx, cy, radius, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
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
  return { levels, startValue, increment, divisions, clockwise: true };
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
  ctx.font = `560 ${fontSize}px ${FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(0.5, fontSize * 0.032);
  ctx.strokeStyle = 'rgba(255,255,255,0.94)';
  ctx.strokeText(String(text), 0, 0);
  ctx.fillStyle = LAYER_COLOR;
  ctx.globalAlpha = 0.92;
  ctx.fillText(String(text), 0, 0);
  ctx.restore();
}

function drawSoftGuide(ctx, x1, y1, x2, y2, width) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = 'rgba(138,42,143,0.17)';
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
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

  const { levels, startValue, increment, divisions, clockwise } = getSettings();
  const sector = 360 / divisions;
  const direction = clockwise ? 1 : -1;
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
  const last = ringMetrics(innerRadius, baseRingWidth, levels, longMode);
  const guideWidth = clamp(baseRingWidth * 0.018, 0.55, 1.05);
  const labelSize = clamp(baseRingWidth * 0.20, 8.2, 11.8);

  // V28: same all-cell layer columns, with slightly larger and clearer layer numbers.
  for (let i = 0; i < divisions; i += 1) {
    const boundaryDeg = direction * i * sector;
    const tangentRad = ((boundaryDeg) * Math.PI) / 180;
    const tx = -Math.sin(tangentRad);
    const ty = Math.cos(tangentRad);
    const side = direction >= 0 ? -1 : 1;
    const offset = clamp(baseRingWidth * 0.078, 2.5, 4.2);

    const guideStart = polar(cx, cy, innerRadius + 1.5, boundaryDeg);
    const guideEnd = polar(cx, cy, last.outer - 1.5, boundaryDeg);
    drawSoftGuide(ctx, guideStart.x, guideStart.y, guideEnd.x, guideEnd.y, guideWidth);

    for (let ring = 1; ring <= levels; ring += 1) {
      const metrics = ringMetrics(innerRadius, baseRingWidth, ring, longMode);
      const label = ((ring - 1) % 10) + 1;
      const p = polar(cx, cy, metrics.mid, boundaryDeg);
      const x = p.x + tx * offset * side;
      const y = p.y + ty * offset * side;
      drawLayerText(ctx, label, x, y, labelSize);
    }
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
    document.getElementById('gannzilla-layer-marks-axis-right-patch-v26')?.remove();
    document.getElementById('gannzilla-layer-marks-all-columns-patch-v27')?.remove();

    let overlay = document.getElementById(PATCH_CANVAS_ID);
    if (!overlay) {
      overlay = document.createElement('canvas');
      overlay.id = PATCH_CANVAS_ID;
      document.body.appendChild(overlay);
    }
    window.__gannzillaLayerMarksAllColumnsLargerPatchV28 = MARKER;

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
