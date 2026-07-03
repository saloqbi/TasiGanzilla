import React from 'react';

const CANVAS_ID = 'gannzilla-twenty-ring-no-overlap-canvas-v1';
const PANEL_ID = 'gannzilla-twenty-ring-no-overlap-panel-v1';
const MARKER = 'GANNZILLA_TWENTY_RING_NO_OVERLAP_STABLE_V36';
const TWO_PI = Math.PI * 2;
const FONT_STACK = 'Tahoma, Arial, Segoe UI, Helvetica, sans-serif';

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

function roundedRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function normalizeReadableRotation(rad) {
  let r = rad;
  while (r > Math.PI / 2) r -= Math.PI;
  while (r < -Math.PI / 2) r += Math.PI;
  return r;
}

function colorFor(value) {
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n)) return '#111';
  const mod = ((n % 3) + 3) % 3;
  if (mod === 1) return '#e01818';
  if (mod === 2) return '#0a48c9';
  return '#050505';
}

function digitalRoot(value) {
  const n = Math.abs(Math.trunc(Number(value)) || 0);
  if (n === 0) return 0;
  return ((n - 1) % 9) + 1;
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
  const rawLevels = Number(inputs[0]?.value) || 10;
  const levels = clamp(rawLevels, 1, 20);
  const startValue = Number(inputs[1]?.value ?? 1) || 0;
  const increment = Number(inputs[3]?.value ?? 1) || 1;
  const divisions = Number(getViewSelect()?.value) || 36;
  return { levels, startValue, increment, divisions, clockwise: true };
}

function settingsKey(settings) {
  return [settings.levels, settings.startValue, settings.increment, settings.divisions, window.devicePixelRatio || 1].join('|');
}

function setLevelMaxTo20() {
  const firstLevelInput = getNumberInputs()[0];
  if (firstLevelInput) {
    firstLevelInput.max = '20';
    firstLevelInput.title = 'يدعم حتى 20 حلقة بدون تداخل';
  }
}

function drawReadableText(ctx, text, x, y, size, color, weight = 700, alpha = 1, rotation = 0) {
  ctx.save();
  ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5);
  if (rotation) ctx.rotate(rotation);
  ctx.font = `${weight} ${size}px ${FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(0.45, size * 0.04);
  ctx.strokeStyle = `rgba(255,255,255,${0.90 * alpha})`;
  ctx.strokeText(String(text), 0, 0);
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.fillText(String(text), 0, 0);
  ctx.restore();
}

function drawAngleBadge(ctx, text, x, y, size, color, wheelCx, wheelCy) {
  const label = String(text);
  const dx = x - wheelCx;
  const dy = y - wheelCy;
  const rotation = normalizeReadableRotation(Math.atan2(dy, dx) + Math.PI / 2);

  ctx.save();
  ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5);
  ctx.rotate(rotation);
  ctx.font = `800 ${size}px ${FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const metrics = ctx.measureText(label);
  const w = metrics.width + clamp(size * 0.96, 8, 18);
  const h = size * 1.30;
  const grad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  grad.addColorStop(0, 'rgba(222,222,222,0.98)');
  grad.addColorStop(0.55, 'rgba(198,198,198,0.98)');
  grad.addColorStop(1, 'rgba(172,172,172,0.96)');
  ctx.shadowColor = 'rgba(0,0,0,0.32)';
  ctx.shadowBlur = clamp(size * 0.26, 2.4, 4.8);
  ctx.shadowOffsetY = clamp(size * 0.11, 0.8, 1.8);
  roundedRectPath(ctx, -w / 2, -h / 2, w, h, clamp(size * 0.24, 2.2, 5));
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(120,120,120,0.58)';
  ctx.lineWidth = Math.max(0.55, size * 0.05);
  ctx.stroke();
  ctx.lineWidth = Math.max(0.45, size * 0.04);
  ctx.strokeStyle = 'rgba(255,255,255,0.86)';
  ctx.strokeText(label, 0, 0);
  ctx.fillStyle = color;
  ctx.fillText(label, 0, 0);
  ctx.restore();
}

function drawCell(ctx, value, cx, cy, midRadius, centerDeg, ringWidth, levels) {
  const mainText = formatNumber(value);
  const color = colorFor(value);
  const textLen = mainText.length;
  const arcRoom = (TWO_PI * midRadius / 36) * 0.62;
  const radialRoom = ringWidth * 0.34;
  const baseSize = Math.min(arcRoom / Math.max(2.5, textLen * 0.62), radialRoom);
  const mainSize = clamp(baseSize, levels >= 16 ? 8.8 : 10, levels >= 16 ? 16 : 18);
  const smallSize = clamp(mainSize * 0.48, 5.2, 8.2);
  const angleSize = clamp(mainSize * 0.58, 6.2, 9.2);

  const p = polar(cx, cy, midRadius, centerDeg);
  const toCenterX = cx - p.x;
  const toCenterY = cy - p.y;
  const d = Math.hypot(toCenterX, toCenterY) || 1;
  const ux = toCenterX / d;
  const uy = toCenterY / d;
  const angleRotation = normalizeReadableRotation((centerDeg * Math.PI) / 180);

  const angleX = p.x - ux * ringWidth * 0.31;
  const angleY = p.y - uy * ringWidth * 0.31;
  const rootX = p.x + ux * ringWidth * 0.31;
  const rootY = p.y + uy * ringWidth * 0.31;

  drawAngleBadge(ctx, `${angleSequenceValue(value)}°`, angleX, angleY, angleSize, color, cx, cy);
  drawReadableText(ctx, mainText, p.x, p.y, mainSize, color, 720, 1, angleRotation);
  drawReadableText(ctx, String(digitalRoot(value)), rootX, rootY, smallSize, color, 650, 0.94, angleRotation);
}

function render(canvas, settings = getSettings()) {
  setLevelMaxTo20();
  const { levels, startValue, increment, divisions, clockwise } = settings;
  const side = levels >= 16 ? 2600 : levels >= 12 ? 2200 : 1800;
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = `${side}px`;
  canvas.style.height = `${side}px`;
  canvas.width = Math.round(side * dpr);
  canvas.height = Math.round(side * dpr);

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, side, side);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, side, side);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const cx = side / 2;
  const cy = side / 2;
  const outerRadius = side / 2 - 92;
  const innerRadius = clamp(side * 0.145, 245, 360);
  const ringWidth = (outerRadius - innerRadius) / levels;
  const sector = 360 / divisions;
  const direction = clockwise ? 1 : -1;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius, 0, TWO_PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#d2d2d2';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();

  for (let ring = 1; ring <= levels; ring += 1) {
    const inner = innerRadius + (ring - 1) * ringWidth;
    const outer = inner + ringWidth;
    const mid = inner + ringWidth / 2;
    const bandFill = ring % 2 === 0 ? '#efefef' : '#ffffff';

    for (let i = 0; i < divisions; i += 1) {
      const startDeg = direction * i * sector;
      const endDeg = direction * (i + 1) * sector;
      const centerDeg = direction * (i + 0.5) * sector;
      const value = numberAtRing(startValue, ring, i, divisions, increment);

      ctx.save();
      drawWedge(ctx, cx, cy, inner, outer, startDeg, endDeg);
      ctx.fillStyle = bandFill;
      ctx.fill();
      ctx.strokeStyle = '#d4d4d4';
      ctx.lineWidth = 0.95;
      ctx.stroke();
      ctx.restore();

      drawCell(ctx, value, cx, cy, mid, centerDeg, ringWidth, levels);
    }
  }

  const protractorInner = outerRadius + 14;
  const protractorOuter = protractorInner + 32;
  ctx.save();
  ctx.strokeStyle = '#bfcfc5';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx, cy, protractorInner, 0, TWO_PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, protractorOuter, 0, TWO_PI);
  ctx.stroke();
  for (let deg = 0; deg < 360; deg += 5) {
    const major = deg % 30 === 0;
    const p1 = polar(cx, cy, major ? protractorInner - 3 : protractorInner, direction * deg);
    const p2 = polar(cx, cy, protractorOuter + (major ? 7 : 0), direction * deg);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = major ? '#dd4040' : '#b9b9b9';
    ctx.lineWidth = major ? 1.25 : 0.75;
    ctx.stroke();
    if (major) {
      const pt = polar(cx, cy, protractorOuter + 22, direction * deg);
      drawReadableText(ctx, `${deg}°`, pt.x, pt.y, 12, '#666', 700, 1);
    }
  }
  ctx.restore();
}

function ensureCanvas() {
  document.getElementById('gannzilla-long-number-digital-renderer-v1')?.style.setProperty('display', 'none', 'important');
  document.getElementById('gannzilla-layer-marks-all-columns-patch-v29')?.style.setProperty('display', 'none', 'important');
  let panel = document.getElementById(PANEL_ID);
  if (!panel) {
    panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.style.position = 'fixed';
    panel.style.left = '260px';
    panel.style.top = '78px';
    panel.style.zIndex = '80';
    panel.style.background = '#fff';
    panel.style.overflow = 'auto';
    panel.style.boxSizing = 'border-box';
    document.body.appendChild(panel);
  }
  let canvas = document.getElementById(CANVAS_ID);
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = CANVAS_ID;
    canvas.style.display = 'block';
    panel.appendChild(canvas);
  }
  return canvas;
}

export default function GannzillaTwentyRingNoOverlapPatch() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    window.__gannzillaTwentyRingNoOverlapPatchV36 = MARKER;
    let lastKey = '';

    const renderIfNeeded = (force = false) => {
      const canvas = ensureCanvas();
      const settings = getSettings();
      const key = settingsKey(settings);
      if (force || key !== lastKey) {
        lastKey = key;
        render(canvas, settings);
      }
      document.body.style.minWidth = '100%';
      document.body.style.minHeight = '100%';
      document.body.style.overflowX = 'hidden';
    };

    renderIfNeeded(true);
    const timer = window.setInterval(() => renderIfNeeded(false), 900);
    window.addEventListener('resize', () => renderIfNeeded(true));

    return () => {
      window.clearInterval(timer);
      document.getElementById(PANEL_ID)?.remove();
      document.body.style.minWidth = '';
      document.body.style.minHeight = '';
      document.body.style.overflowX = '';
    };
  }, []);

  return null;
}
