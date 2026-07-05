import React from 'react';

const OVERLAY_ID = 'gannzilla-long-number-digital-renderer-v1';
const EXPORT_BAR_ID = 'gannzilla-copy-export-bar-v38';
const MARKER = '__gannzillaLongNumberDigitalRendererV1';
const TWO_PI = Math.PI * 2;
const DIGITAL_FONT_STACK = 'Arial, Tahoma, Segoe UI, Helvetica, sans-serif';
const SUM_RESULT_STYLE_VERSION = 'TEN_RING_LARGE_CELL_COPY_EXPORT_V38';

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

function isTenRingMode() {
  const q = window.location.search;
  return q.includes('tenRingLargeCells') || q.includes('tenRings') || q.includes('largeCells10');
}

function syncTenRingInput() {
  if (!isTenRingMode()) return;
  const firstLevelInput = getNumberInputs()[0];
  if (!firstLevelInput) return;
  firstLevelInput.min = '1';
  firstLevelInput.max = '10';
  if (Number(firstLevelInput.value) !== 10) {
    firstLevelInput.value = '10';
    firstLevelInput.dispatchEvent(new Event('input', { bubbles: true }));
    firstLevelInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function getSettings() {
  const inputs = getNumberInputs();
  const rawLevels = Number(inputs[0]?.value) || 5;
  const levels = isTenRingMode() ? 10 : clamp(rawLevels, 1, 12);
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
  if (!longMode) {
    if (ring === 1) return 2.90;
    if (ring === 2) return 1.50;
    if (ring === 3) return 1.36;
    if (ring === 4) return 1.46;
    if (ring === 5) return 1.40;
    return 1.18;
  }
  if (ring === 1) return 3.80;
  if (ring === 2) return 1.92;
  if (ring === 3) return 1.70;
  if (ring === 4) return 1.86;
  if (ring === 5) return 1.78;
  return 1.28;
}

function ringMetrics(innerRadius, baseRingWidth, ring, longMode) {
  let inner = innerRadius;
  for (let r = 1; r < ring; r += 1) inner += baseRingWidth * ringWeight(r, longMode);
  const width = baseRingWidth * ringWeight(ring, longMode);
  return { inner, outer: inner + width, width, mid: inner + width / 2 };
}

function fontSizeForCell(midR, ringWidth, divisions, textLength, longMode, ring) {
  const isLong = textLength >= 10;
  const arcRoom = (TWO_PI * midR / divisions) * (isLong ? 0.72 : 0.94);
  const radialRoom = ringWidth * (isLong ? 0.34 : 0.42);
  const charFactor = textLength >= 12 ? 0.60 : textLength >= 10 ? 0.62 : textLength >= 8 ? 0.62 : textLength >= 6 ? 0.66 : 0.72;
  const natural = Math.min(arcRoom / Math.max(2, textLength * charFactor), radialRoom);

  let ringCap;
  if (!isLong) {
    ringCap = ring === 1 ? 20 : ring === 2 ? 18 : ring === 3 ? 16 : ring === 4 || ring === 5 ? 15.8 : 13.8;
  } else if (ring === 1) {
    ringCap = 11.0;
  } else if (ring === 2 || ring === 3) {
    ringCap = 13.2;
  } else if (ring === 4 || ring === 5) {
    ringCap = 13.0;
  } else {
    ringCap = 11.4;
  }

  let ringMin;
  if (!isLong) {
    ringMin = ring === 1 ? 11.2 : ring === 4 || ring === 5 ? 10.8 : ring === 2 ? 10.4 : ring === 3 ? 9.2 : 8.4;
  } else if (ring === 1) {
    ringMin = 6.8;
  } else if (ring === 4 || ring === 5) {
    ringMin = 8.8;
  } else {
    ringMin = 7.8;
  }

  return clamp(Math.min(natural, ringCap), ringMin, ringCap);
}

function normalizeReadableRotation(rad) {
  let r = rad;
  while (r > Math.PI / 2) r -= Math.PI;
  while (r < -Math.PI / 2) r += Math.PI;
  return r;
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

function drawReadableText(ctx, text, x, y, fontSize, color, weight = 700, alpha = 1, rotation = 0) {
  const label = String(text);
  ctx.save();
  ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5);
  if (rotation) ctx.rotate(rotation);
  ctx.font = `${weight} ${fontSize}px ${DIGITAL_FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.lineWidth = Math.max(0.36, fontSize * 0.035);
  ctx.strokeStyle = `rgba(255,255,255,${0.90 * alpha})`;
  ctx.strokeText(label, 0, 0);
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.fillText(label, 0, 0);
  ctx.restore();
}

function drawCrispLongNumberText(ctx, text, x, y, fontSize, color, rotation, maxWidth) {
  const label = String(text);
  const fontWeight = 780;
  let fitSize = fontSize;
  ctx.save();
  ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5);
  if (rotation) ctx.rotate(rotation);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  for (let attempt = 0; attempt < 18; attempt += 1) {
    ctx.font = `${fontWeight} ${fitSize}px ${DIGITAL_FONT_STACK}`;
    const width = ctx.measureText(label).width;
    if (width <= maxWidth || fitSize <= 6.2) break;
    fitSize -= 0.32;
  }

  ctx.font = `${fontWeight} ${fitSize}px ${DIGITAL_FONT_STACK}`;
  const measured = Math.max(1, ctx.measureText(label).width);
  const scaleX = measured > maxWidth ? clamp(maxWidth / measured, 0.42, 1) : 1;
  if (scaleX !== 1) ctx.scale(scaleX, 1);
  ctx.fillStyle = color;
  ctx.fillText(label, 0, 0);
  ctx.restore();
}

function drawAngleText(ctx, text, x, y, fontSize, color, wheelCx, wheelCy) {
  const label = String(text);
  const dx = x - wheelCx;
  const dy = y - wheelCy;
  const tangentRotation = normalizeReadableRotation(Math.atan2(dy, dx) + Math.PI / 2);
  ctx.save();
  ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5);
  ctx.rotate(tangentRotation);
  ctx.font = `820 ${fontSize}px ${DIGITAL_FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  const metrics = ctx.measureText(label);
  const width = metrics.width + clamp(fontSize * 0.92, 9, 18);
  const height = fontSize * 1.34;
  roundedRectPath(ctx, -width / 2, -height / 2, width, height, clamp(fontSize * 0.28, 3, 6));
  ctx.fillStyle = 'rgba(218,218,218,0.64)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.78)';
  ctx.lineWidth = Math.max(0.55, fontSize * 0.045);
  ctx.stroke();
  ctx.lineWidth = Math.max(0.48, fontSize * 0.04);
  ctx.strokeStyle = 'rgba(255,255,255,0.88)';
  ctx.strokeText(label, 0, 0);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.98;
  ctx.fillText(label, 0, 0);
  ctx.restore();
}

function drawCellNumberWithResultAndAngle(ctx, value, x, y, fontSize, color, ringWidth, wheelCx, wheelCy, maxMainWidth, ring) {
  const result = digitalRoot(value);
  const angleVal = angleSequenceValue(value);
  const mainText = formatNumber(value);
  const isLongText = mainText.replace('-', '').length >= 8;
  const toCenterX = wheelCx - x;
  const toCenterY = wheelCy - y;
  const distance = Math.hypot(toCenterX, toCenterY) || 1;
  const ux = toCenterX / distance;
  const uy = toCenterY / distance;
  const resultSize = clamp(fontSize * (isLongText ? 0.66 : 0.62), isLongText ? 4.8 : 7.8, isLongText ? 8.2 : 13.2);
  const angleSize = clamp(fontSize * 0.64, isLongText ? 5.0 : 10.2, isLongText ? 8.8 : 16.4);
  const resultInnerOffset = clamp(ringWidth * (isLongText ? 0.54 : 0.43), 8.0, ringWidth * 0.59);
  const angleOuterOffset = clamp(ringWidth * (isLongText ? 0.42 : 0.38), 8.0, ringWidth * 0.49);
  const mainX = x;
  const mainY = y;
  const resultX = x + ux * resultInnerOffset;
  const resultY = y + uy * resultInnerOffset;
  const angleX = x - ux * angleOuterOffset;
  const angleY = y - uy * angleOuterOffset;
  const mainRotation = isLongText ? normalizeReadableRotation(Math.atan2(mainY - wheelCy, mainX - wheelCx) + Math.PI / 2) : 0;

  drawAngleText(ctx, `${angleVal}°`, angleX, angleY, angleSize, color, wheelCx, wheelCy);
  if (isLongText) {
    const ringClarityBoost = ring === 4 || ring === 5 ? 1.15 : 1;
    drawCrispLongNumberText(ctx, mainText, mainX, mainY, fontSize * ringClarityBoost, color, mainRotation, maxMainWidth);
    drawReadableText(ctx, String(result), resultX, resultY, resultSize, color, 700, 0.97, mainRotation);
  } else {
    const visualBoost = ring === 4 || ring === 5 ? 1.08 : 1;
    drawReadableText(ctx, mainText, mainX, mainY, fontSize * visualBoost, color, 760, 1);
    drawReadableText(ctx, String(result), resultX, resultY, resultSize, color, 700, 0.97);
  }
}

function makeButton(label, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.style.height = '30px';
  button.style.padding = '0 10px';
  button.style.border = '1px solid #888';
  button.style.borderRadius = '5px';
  button.style.background = 'linear-gradient(#fff,#eee)';
  button.style.font = '700 12px Tahoma, Arial, sans-serif';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 2px 6px rgba(0,0,0,.16)';
  button.addEventListener('click', onClick);
  return button;
}

async function copyCanvas(canvas, button) {
  const old = button.textContent;
  try {
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
    if (blob && navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      button.textContent = 'تم النسخ ✓';
    } else {
      const link = document.createElement('a');
      link.download = 'gannzilla-wheel.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      button.textContent = 'تم الحفظ ✓';
    }
  } catch (error) {
    const link = document.createElement('a');
    link.download = 'gannzilla-wheel.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    button.textContent = 'تم الحفظ ✓';
  }
  window.setTimeout(() => { button.textContent = old; }, 1300);
}

function printCanvas(canvas) {
  const dataUrl = canvas.toDataURL('image/png');
  const popup = window.open('', '_blank');
  if (!popup) return;
  popup.document.write(`<!doctype html><html><head><title>Gannzilla PDF</title><style>@page{size:A3 landscape;margin:6mm;}html,body{margin:0;background:white;}img{width:100%;height:auto;display:block;}</style></head><body><img src="${dataUrl}" onload="setTimeout(()=>window.print(),250)" /></body></html>`);
  popup.document.close();
}

function ensureExportBar(overlay, rect) {
  let bar = document.getElementById(EXPORT_BAR_ID);
  if (!bar) {
    bar = document.createElement('div');
    bar.id = EXPORT_BAR_ID;
    bar.dir = 'rtl';
    bar.style.position = 'fixed';
    bar.style.zIndex = '12000';
    bar.style.display = 'flex';
    bar.style.gap = '7px';
    bar.style.background = 'rgba(255,255,255,.96)';
    bar.style.border = '1px solid rgba(150,150,150,.55)';
    bar.style.borderRadius = '7px';
    bar.style.padding = '5px';
    bar.style.boxShadow = '0 2px 8px rgba(0,0,0,.18)';
    document.body.appendChild(bar);
  }
  if (!bar.dataset.ready) {
    bar.appendChild(makeButton('نسخ الصورة', (event) => copyCanvas(overlay, event.currentTarget)));
    bar.appendChild(makeButton('PDF A3', () => printCanvas(overlay)));
    bar.dataset.ready = 'true';
  }
  bar.style.left = `${Math.max(8, rect.left + 10)}px`;
  bar.style.top = `${Math.max(8, rect.top + 8)}px`;
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
  const extraRings = 62;
  const wheelRadius = minSide / 2 - extraRings;
  const innerRadius = clamp(minSide * (longMode ? 0.082 : 0.10), 46, wheelRadius * 0.30);
  const weightSum = Array.from({ length: levels }, (_, i) => ringWeight(i + 1, longMode)).reduce((a, b) => a + b, 0);
  const baseRingWidth = Math.max(28, (wheelRadius - innerRadius) / Math.max(1, weightSum));

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
      const maxMainWidth = (TWO_PI * metrics.mid / divisions) * (text.length >= 10 ? (ring === 1 ? 0.54 : 0.66) : 0.92);
      drawCellNumberWithResultAndAngle(ctx, value, p.x, p.y, fs, wheelNumberColor(value), metrics.width, cx, cy, maxMainWidth, ring);
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
      drawReadableText(ctx, `${deg}°`, pt.x, pt.y, 8.2, '#666', 700, 1);
    }
  }
  ctx.restore();
  ensureExportBar(overlay, rect);
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
    window.__gannzillaSumResultStyleVersion = SUM_RESULT_STYLE_VERSION;
    window.__gannzillaTenRingLargeCellCopyV38 = true;
    const render = () => {
      syncTenRingInput();
      const sourceCanvas = getWheelCanvas();
      if (!sourceCanvas) return;
      sourceCanvas.style.opacity = '0.001';
      renderOverlay(overlay, sourceCanvas);
    };
    render();
    const timer = window.setInterval(render, 260);
    window.addEventListener('resize', render);
    window.addEventListener('scroll', render, true);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('resize', render);
      window.removeEventListener('scroll', render, true);
      const sourceCanvas = getWheelCanvas();
      if (sourceCanvas) sourceCanvas.style.opacity = '';
      document.getElementById(OVERLAY_ID)?.remove();
      document.getElementById(EXPORT_BAR_ID)?.remove();
    };
  }, []);
  return null;
}
