import React from 'react';

const OVERLAY_ID = 'gannzilla-long-number-digital-renderer-v1';
const MARKER = '__gannzillaLongNumberDigitalRendererV1';
const TWO_PI = Math.PI * 2;
const DIGITAL_FONT_STACK = 'Tahoma, Arial, Segoe UI, Helvetica, sans-serif';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function polar(cx, cy, radius, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function drawWedge(ctx, cx, cy, innerR, outerR, startDeg, endDeg) {
  const start = ((startDeg - 90) * Math.PI) / 180;
  const end = ((endDeg - 90) * Math.PI) / 180;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, start, end, false);
  ctx.arc(cx, cy, innerR, end, start, true);
  ctx.closePath();
}

function wheelNumberColor(value) {
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n)) return '#111111';
  const mod = ((n % 3) + 3) % 3;
  if (mod === 1) return '#e01818';
  if (mod === 2) return '#0a48c9';
  return '#050505';
}

function formatNumber(value) {
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(4)));
}

function numberAtRing(startValue, ringIndex, sectorIndex, divisions, increment) {
  return startValue + ((ringIndex - 1) * divisions + sectorIndex) * increment;
}

function getWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => canvas.id !== OVERLAY_ID)
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 160 && rect.height > 160)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
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

function getUnrotatedRect(canvas) {
  const visual = canvas.getBoundingClientRect();
  const width = canvas.offsetWidth || Number.parseFloat(canvas.style.width) || visual.width;
  const height = canvas.offsetHeight || Number.parseFloat(canvas.style.height) || visual.height;
  const centerX = visual.left + visual.width / 2;
  const centerY = visual.top + visual.height / 2;
  return { left: centerX - width / 2, top: centerY - height / 2, width, height };
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
  const arcRoom = (TWO_PI * midR / divisions) * 0.68;
  const radialRoom = ringWidth * 0.50;
  const charFactor = textLength >= 8 ? 0.60 : textLength >= 7 ? 0.62 : textLength >= 6 ? 0.64 : 0.68;
  const natural = Math.min(arcRoom / Math.max(2, textLength * charFactor), radialRoom);

  // Ring-aware cap: keep the first ring strong, then reduce outer rings so labels do not crowd.
  const ringCap = ring === 1
    ? (longMode || textLength >= 7 ? 21 : 23)
    : ring === 2
      ? (longMode || textLength >= 7 ? 17.2 : 19)
      : ring === 3
        ? (longMode || textLength >= 7 ? 14.2 : 16)
        : (longMode || textLength >= 7 ? 12.4 : 14.2);

  const ringMin = ring === 1 ? 14 : ring === 2 ? 12 : ring === 3 ? 10.8 : 9.6;
  return clamp(Math.min(natural, ringCap), ringMin, ringCap);
}

function drawReadableText(ctx, text, x, y, angleDeg, fontSize, color, longMode) {
  const label = String(text);
  void angleDeg;
  void longMode;

  ctx.save();
  ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5);
  ctx.font = `700 ${fontSize}px ${DIGITAL_FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  ctx.lineWidth = Math.max(0.55, fontSize * 0.040);
  ctx.strokeStyle = 'rgba(255,255,255,0.86)';
  ctx.strokeText(label, 0, 0);
  ctx.fillStyle = color;
  ctx.fillText(label, 0, 0);
  ctx.restore();
}

function renderOverlay(overlay, sourceCanvas) {
  const rect = getUnrotatedRect(sourceCanvas);
  const settings = getSettings();
  const dpr = window.devicePixelRatio || 1;

  overlay.style.position = 'fixed';
  overlay.style.left = `${rect.left}px`;
  overlay.style.top = `${rect.top}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
  overlay.style.zIndex = '34';
  overlay.style.pointerEvents = 'none';
  overlay.style.background = '#fff';
  overlay.style.imageRendering = 'auto';
  overlay.width = Math.max(1, Math.round(rect.width * dpr));
  overlay.height = Math.max(1, Math.round(rect.height * dpr));

  const ctx = overlay.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, rect.width, rect.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const { levels, startValue, increment, divisions, clockwise } = settings;
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
  const baseRingWidth = Math.max(18, (wheelRadius - innerRadius) / Math.max(1, weightSum));

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius, 0, TWO_PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#dcdcdc';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  for (let ring = 1; ring <= levels; ring += 1) {
    const metrics = ringMetrics(innerRadius, baseRingWidth, ring, longMode);
    const bandFill = ring % 2 === 0 ? '#f0f0f0' : '#ffffff';

    for (let i = 0; i < divisions; i += 1) {
      const startDeg = direction * i * sector;
      const endDeg = direction * (i + 1) * sector;
      const centerDeg = direction * (i + 0.5) * sector;
      const value = numberAtRing(startValue, ring, i, divisions, increment);
      const text = formatNumber(value);

      ctx.save();
      drawWedge(ctx, cx, cy, metrics.inner, metrics.outer, startDeg, endDeg);
      ctx.fillStyle = bandFill;
      ctx.fill();
      ctx.strokeStyle = '#d5d5d5';
      ctx.lineWidth = 0.9;
      ctx.stroke();
      ctx.restore();

      const p = polar(cx, cy, metrics.mid, centerDeg);
      const fs = fontSizeForCell(metrics.mid, metrics.width, divisions, text.length, longMode, ring);
      drawReadableText(ctx, text, p.x, p.y, centerDeg, fs, wheelNumberColor(value), longMode || text.length >= 6);
    }
  }

  const protractorInner = wheelRadius + 11;
  const protractorOuter = protractorInner + 24;
  ctx.save();
  ctx.strokeStyle = '#bfbfbf';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, protractorInner, 0, TWO_PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, protractorOuter, 0, TWO_PI);
  ctx.stroke();

  for (let deg = 0; deg < 360; deg += 5) {
    const major = deg % 30 === 0;
    const p1 = polar(cx, cy, major ? protractorInner - 2 : protractorInner, direction * deg);
    const p2 = polar(cx, cy, protractorOuter + (major ? 5 : 0), direction * deg);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = major ? '#dd4040' : '#b8b8b8';
    ctx.lineWidth = major ? 1.1 : 0.75;
    ctx.stroke();
    if (major) {
      const pt = polar(cx, cy, protractorOuter + 15, direction * deg);
      drawReadableText(ctx, `${deg}°`, pt.x, pt.y, direction * deg, 8.2, '#666', true);
    }
  }
  ctx.restore();

  const chronoR = protractorOuter + 26;
  ctx.save();
  ctx.strokeStyle = '#b7cfc1';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(cx, cy, chronoR, 0, TWO_PI);
  ctx.stroke();
  const labels = ['21 MAR', '5 APR', '21 APR', '6 MAY', '21 MAY', '6 JUN', '21 JUN', '6 JUL', '22 JUL', '6 AUG', '22 AUG', '6 SEP', '22 SEP', '7 OCT', '22 OCT', '6 NOV', '21 NOV', '6 DEC', '21 DEC', '5 JAN', '20 JAN', '4 FEB', '19 FEB', '6 MAR'];
  labels.forEach((label, idx) => {
    const deg = direction * (idx * 360 / labels.length);
    const p = polar(cx, cy, chronoR + 16, deg);
    drawReadableText(ctx, label, p.x, p.y, deg, 7.4, '#777', true);
  });
  ctx.restore();

  const pointerDeg = 90;
  const pp = polar(cx, cy, wheelRadius + 42, pointerDeg);
  ctx.save();
  ctx.translate(pp.x, pp.y);
  ctx.rotate(((pointerDeg - 90) * Math.PI) / 180);
  ctx.fillStyle = '#e93020';
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.lineTo(6, 8);
  ctx.lineTo(-6, 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export default function GannzillaLongNumberDigitalRenderer() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    let overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      overlay = document.createElement('canvas');
      overlay.id = OVERLAY_ID;
      document.body.appendChild(overlay);
    }
    window[MARKER] = true;

    const render = () => {
      const sourceCanvas = getWheelCanvas();
      if (!sourceCanvas) return;
      sourceCanvas.style.opacity = '0.001';
      renderOverlay(overlay, sourceCanvas);
    };

    render();
    const timer = window.setInterval(render, 240);
    window.addEventListener('resize', render);
    window.addEventListener('scroll', render, true);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('resize', render);
      window.removeEventListener('scroll', render, true);
      const sourceCanvas = getWheelCanvas();
      if (sourceCanvas) sourceCanvas.style.opacity = '';
      document.getElementById(OVERLAY_ID)?.remove();
    };
  }, []);

  return null;
}
