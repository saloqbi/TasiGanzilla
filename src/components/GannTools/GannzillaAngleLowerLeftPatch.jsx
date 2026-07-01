import React from 'react';

const PATCH_CANVAS_ID = 'gannzilla-angle-lower-left-patch-v12';
const SOURCE_CANVAS_ID = 'gannzilla-long-number-digital-renderer-v1';
const TWO_PI = Math.PI * 2;
const DIGITAL_FONT_STACK = 'Tahoma, Arial, Segoe UI, Helvetica, sans-serif';
const MARKER = 'CELL_ANGLE_LOWER_LEFT_CORNER_V12';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function polar(cx, cy, radius, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function wheelNumberColor(value) {
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n)) return '#111111';
  const mod = ((n % 3) + 3) % 3;
  if (mod === 1) return '#e01818';
  if (mod === 2) return '#0a48c9';
  return '#050505';
}

function angleSequenceValue(value) {
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n)) return 0;
  const normalized = ((((n - 1) % 360) + 360) % 360) + 1;
  return normalized === 36 ? 0 : normalized;
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
  if (!longMode) return ring === 1 ? 1.72 : ring === 2 ? 1.24 : ring === 3 ? 1.08 : 1;
  if (ring === 1) return 2.06;
  if (ring === 2) return 1.48;
  if (ring === 3) return 1.16;
  return 1;
}

function ringMetrics(innerRadius, baseRingWidth, ring, longMode) {
  let inner = innerRadius;
  for (let r = 1; r < ring; r += 1) inner += baseRingWidth * ringWeight(r, longMode);
  const width = baseRingWidth * ringWeight(ring, longMode);
  return { inner, outer: inner + width, width, mid: inner + width / 2 };
}

function fontSizeForCell(midR, ringWidth, divisions, textLength, longMode, ring) {
  const arcRoom = (TWO_PI * midR / divisions) * 0.72;
  const radialRoom = ringWidth * 0.38;
  const charFactor = textLength >= 8 ? 0.60 : textLength >= 7 ? 0.62 : textLength >= 6 ? 0.64 : 0.68;
  const natural = Math.min(arcRoom / Math.max(2, textLength * charFactor), radialRoom);

  const ringCap = ring === 1
    ? (longMode || textLength >= 7 ? 17.0 : 19.5)
    : ring === 2
      ? (longMode || textLength >= 7 ? 14.2 : 16.0)
      : ring === 3
        ? (longMode || textLength >= 7 ? 11.8 : 13.4)
        : (longMode || textLength >= 7 ? 10.2 : 12.0);

  const ringMin = ring === 1 ? 11.8 : ring === 2 ? 10.0 : ring === 3 ? 8.8 : 8.0;
  return clamp(Math.min(natural, ringCap), ringMin, ringCap);
}

function drawReadableText(ctx, text, x, y, fontSize, color, weight = 750, alpha = 0.98) {
  const label = String(text);
  ctx.save();
  ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5);
  ctx.font = `${weight} ${fontSize}px ${DIGITAL_FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(0.42, fontSize * 0.034);
  ctx.strokeStyle = `rgba(255,255,255,${0.9 * alpha})`;
  ctx.strokeText(label, 0, 0);
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.fillText(label, 0, 0);
  ctx.restore();
}

function eraseOldAngle(ctx, x, y, fontSize) {
  const w = Math.max(16, fontSize * 2.4);
  const h = Math.max(12, fontSize * 1.55);
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.96;
  ctx.fillRect(Math.round(x - w / 2), Math.round(y - h / 2), Math.round(w), Math.round(h));
  ctx.restore();
}

function drawPatch(overlay, sourceCanvas) {
  const rect = sourceCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  overlay.style.position = 'fixed';
  overlay.style.left = `${rect.left}px`;
  overlay.style.top = `${rect.top}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
  overlay.style.zIndex = '36';
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
  const innerRadius = clamp(minSide * (longMode ? 0.225 : 0.198), 112, wheelRadius * 0.52);
  const weightSum = Array.from({ length: levels }, (_, i) => ringWeight(i + 1, longMode)).reduce((a, b) => a + b, 0);
  const baseRingWidth = Math.max(20, (wheelRadius - innerRadius) / Math.max(1, weightSum));

  for (let ring = 1; ring <= levels; ring += 1) {
    const metrics = ringMetrics(innerRadius, baseRingWidth, ring, longMode);

    for (let i = 0; i < divisions; i += 1) {
      const centerDeg = direction * (i + 0.5) * sector;
      const value = numberAtRing(startValue, ring, i, divisions, increment);
      const text = formatNumber(value);
      const p = polar(cx, cy, metrics.mid, centerDeg);
      const color = wheelNumberColor(value);
      const fs = fontSizeForCell(metrics.mid, metrics.width, divisions, text.length, longMode, ring);

      const toCenterX = cx - p.x;
      const toCenterY = cy - p.y;
      const distance = Math.hypot(toCenterX, toCenterY) || 1;
      const ux = toCenterX / distance;
      const uy = toCenterY / distance;
      const leftX = -uy;
      const leftY = ux;

      const oldAngleSize = clamp(fs * 0.78, 9.2, 14.6);
      const oldAngleOuterOffset = clamp(metrics.width * 0.46, 10.2, metrics.width * 0.55);
      const oldAngleX = p.x - ux * oldAngleOuterOffset;
      const oldAngleY = p.y - uy * oldAngleOuterOffset;
      eraseOldAngle(ctx, oldAngleX, oldAngleY, oldAngleSize);

      const angleSize = clamp(fs * 0.70, 8.6, 13.6);
      const angleInnerOffset = clamp(metrics.width * 0.24, 5.8, metrics.width * 0.34);
      const angleLeftOffset = clamp(metrics.width * 0.24, 5.8, metrics.width * 0.34);
      const angleX = p.x + ux * angleInnerOffset + leftX * angleLeftOffset;
      const angleY = p.y + uy * angleInnerOffset + leftY * angleLeftOffset;

      drawReadableText(ctx, String(angleSequenceValue(value)), angleX, angleY, angleSize, color, 750, 0.98);
    }
  }
}

export default function GannzillaAngleLowerLeftPatch() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    let overlay = document.getElementById(PATCH_CANVAS_ID);
    if (!overlay) {
      overlay = document.createElement('canvas');
      overlay.id = PATCH_CANVAS_ID;
      document.body.appendChild(overlay);
    }
    window.__gannzillaAngleLowerLeftPatchV12 = MARKER;

    const render = () => {
      const sourceCanvas = document.getElementById(SOURCE_CANVAS_ID);
      if (!sourceCanvas) return;
      drawPatch(overlay, sourceCanvas);
    };

    render();
    const timer = window.setInterval(render, 260);
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
