import React from 'react';

const OVERLAY_ID = 'gannzilla-long-number-digital-renderer-v1';
const EXPORT_BUTTONS_ID = 'gannzilla-export-copy-buttons-v33';
const MARKER = '__gannzillaLongNumberDigitalRendererV1';
const TWO_PI = Math.PI * 2;
const FONT_STACK = 'Tahoma, Arial, Segoe UI, Helvetica, sans-serif';
const SUM_RESULT_STYLE_VERSION = 'TWENTY_RING_EXPANDED_NO_OVERLAP_V33';

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

function colorForValue(value) {
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

function getSettings() {
  const inputs = getNumberInputs();
  const levels = clamp(Number(inputs[0]?.value) || 10, 1, 20);
  const startValue = Number(inputs[1]?.value ?? 1) || 0;
  const increment = Number(inputs[3]?.value ?? 1) || 1;
  const divisions = Number(getViewSelect()?.value) || 36;
  return { levels, startValue, increment, divisions, clockwise: true };
}

function getSourceRect(canvas) {
  const visual = canvas.getBoundingClientRect();
  const width = canvas.offsetWidth || Number.parseFloat(canvas.style.width) || visual.width;
  const height = canvas.offsetHeight || Number.parseFloat(canvas.style.height) || visual.height;
  const centerX = visual.left + visual.width / 2;
  const centerY = visual.top + visual.height / 2;
  return { left: centerX - width / 2, top: centerY - height / 2, width, height };
}

function normalizedTextRotation(rad) {
  let r = rad;
  while (r > Math.PI / 2) r -= Math.PI;
  while (r < -Math.PI / 2) r += Math.PI;
  return r;
}

function roundedRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

function drawReadableText(ctx, text, x, y, size, color, weight = 700, alpha = 1, rotation = 0) {
  const label = String(text);
  ctx.save();
  ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5);
  if (rotation) ctx.rotate(rotation);
  ctx.font = `${weight} ${size}px ${FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(0.45, size * 0.04);
  ctx.strokeStyle = `rgba(255,255,255,${0.92 * alpha})`;
  ctx.strokeText(label, 0, 0);
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.fillText(label, 0, 0);
  ctx.restore();
}

function drawAngleLabel(ctx, label, x, y, size, color, cx, cy) {
  const dx = x - cx;
  const dy = y - cy;
  const rotation = normalizedTextRotation(Math.atan2(dy, dx) + Math.PI / 2);
  ctx.save();
  ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5);
  ctx.rotate(rotation);
  ctx.font = `820 ${size}px ${FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const metrics = ctx.measureText(label);
  const w = metrics.width + clamp(size * 1.0, 9, 18);
  const h = size * 1.36;
  const grad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  grad.addColorStop(0, 'rgba(224,224,224,0.98)');
  grad.addColorStop(0.55, 'rgba(202,202,202,0.98)');
  grad.addColorStop(1, 'rgba(177,177,177,0.97)');
  ctx.shadowColor = 'rgba(0,0,0,0.34)';
  ctx.shadowBlur = clamp(size * 0.28, 2.5, 5.5);
  ctx.shadowOffsetY = clamp(size * 0.13, 1.0, 2.2);
  roundedRectPath(ctx, -w / 2, -h / 2, w, h, clamp(size * 0.25, 3, 5.5));
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = 'rgba(120,120,120,0.62)';
  ctx.lineWidth = Math.max(0.65, size * 0.055);
  ctx.stroke();
  ctx.lineWidth = Math.max(0.5, size * 0.04);
  ctx.strokeStyle = 'rgba(255,255,255,0.90)';
  ctx.strokeText(label, 0, 0);
  ctx.fillStyle = color;
  ctx.fillText(label, 0, 0);
  ctx.restore();
}

function cellFontSize(midR, ringWidth, divisions, textLength, levels) {
  const arcRoom = (TWO_PI * midR / divisions) * 0.58;
  const radialRoom = ringWidth * 0.30;
  const charFactor = textLength >= 7 ? 0.67 : textLength >= 5 ? 0.62 : 0.58;
  const natural = Math.min(arcRoom / Math.max(2, textLength * charFactor), radialRoom);
  const maxSize = levels >= 18 ? 17.5 : levels >= 14 ? 18.5 : 21.5;
  const minSize = levels >= 18 ? 7.6 : 8.6;
  return clamp(natural, minSize, maxSize);
}

function drawCell(ctx, value, x, y, fs, color, ringWidth, cx, cy, levels) {
  const root = digitalRoot(value);
  const angle = angleSequenceValue(value);
  const mainText = formatNumber(value);
  const toCenterX = cx - x;
  const toCenterY = cy - y;
  const distance = Math.hypot(toCenterX, toCenterY) || 1;
  const ux = toCenterX / distance;
  const uy = toCenterY / distance;
  const angleSize = clamp(fs * (levels >= 18 ? 0.62 : 0.70), 6.2, 13.0);
  const rootSize = clamp(fs * 0.45, 5.2, 9.6);
  const angleOffset = clamp(ringWidth * 0.36, 8.0, ringWidth * 0.44);
  const rootOffset = clamp(ringWidth * 0.30, 6.0, ringWidth * 0.38);
  const angleX = x - ux * angleOffset;
  const angleY = y - uy * angleOffset;
  const rootX = x + ux * rootOffset;
  const rootY = y + uy * rootOffset;
  drawAngleLabel(ctx, `${angle}°`, angleX, angleY, angleSize, color, cx, cy);
  drawReadableText(ctx, mainText, x, y, fs, color, 720, 1);
  drawReadableText(ctx, String(root), rootX, rootY, rootSize, color, 700, 0.97);
}

function computeExpandedRect(sourceRect, levels) {
  const desired = clamp(980 + levels * 92, 1500, 3000);
  const width = Math.max(sourceRect.width, desired);
  const height = Math.max(sourceRect.height, desired);
  const centerX = sourceRect.left + window.scrollX + sourceRect.width / 2;
  const centerY = sourceRect.top + window.scrollY + sourceRect.height / 2;
  return {
    left: centerX - width / 2,
    top: centerY - height / 2,
    width,
    height,
  };
}

function renderOverlay(overlay, sourceCanvas) {
  const settings = getSettings();
  const sourceRect = getSourceRect(sourceCanvas);
  const rect = computeExpandedRect(sourceRect, settings.levels);
  const dpr = window.devicePixelRatio || 1;

  document.body.style.minWidth = `${Math.ceil(Math.max(document.body.scrollWidth, rect.left + rect.width + 80))}px`;
  document.body.style.minHeight = `${Math.ceil(Math.max(document.body.scrollHeight, rect.top + rect.height + 80))}px`;

  overlay.style.position = 'absolute';
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
  const margin = clamp(minSide * 0.050, 82, 150);
  const outerRadius = minSide / 2 - margin;
  const innerRadius = clamp(minSide * 0.145, 170, outerRadius * 0.34);
  const ringWidth = (outerRadius - innerRadius) / Math.max(1, levels);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius, 0, TWO_PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#d8d8d8';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();

  for (let ring = 1; ring <= levels; ring += 1) {
    const inner = innerRadius + (ring - 1) * ringWidth;
    const outer = inner + ringWidth;
    const mid = inner + ringWidth / 2;
    const bandFill = ring % 2 === 0 ? '#f0f0f0' : '#ffffff';

    for (let i = 0; i < divisions; i += 1) {
      const startDeg = direction * i * sector;
      const endDeg = direction * (i + 1) * sector;
      const centerDeg = direction * (i + 0.5) * sector;
      const value = numberAtRing(startValue, ring, i, divisions, increment);
      const text = formatNumber(value);
      ctx.save();
      drawWedge(ctx, cx, cy, inner, outer, startDeg, endDeg);
      ctx.fillStyle = bandFill;
      ctx.fill();
      ctx.strokeStyle = '#d7d7d7';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
      const p = polar(cx, cy, mid, centerDeg);
      const fs = cellFontSize(mid, ringWidth, divisions, text.length, levels);
      drawCell(ctx, value, p.x, p.y, fs, colorForValue(value), ringWidth, cx, cy, levels);
    }
  }

  const protractorInner = outerRadius + 12;
  const protractorOuter = protractorInner + 24;
  ctx.save();
  ctx.strokeStyle = '#bfc8c8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, protractorInner, 0, TWO_PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, protractorOuter, 0, TWO_PI);
  ctx.stroke();
  for (let deg = 0; deg < 360; deg += 5) {
    const major = deg % 30 === 0;
    const p1 = polar(cx, cy, major ? protractorInner - 3 : protractorInner, direction * deg);
    const p2 = polar(cx, cy, protractorOuter + (major ? 6 : 0), direction * deg);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = major ? '#dd4040' : '#b8b8b8';
    ctx.lineWidth = major ? 1.1 : 0.7;
    ctx.stroke();
    if (major) {
      const pt = polar(cx, cy, protractorOuter + 16, direction * deg);
      drawReadableText(ctx, `${deg}°`, pt.x, pt.y, 8.2, '#666', 700, 1);
    }
  }
  ctx.restore();

  const pointer = polar(cx, cy, outerRadius + 42, 90);
  ctx.save();
  ctx.translate(pointer.x, pointer.y);
  ctx.rotate(0);
  ctx.fillStyle = '#e93020';
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.lineTo(6, 8);
  ctx.lineTo(-6, 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function makeExportButton(label, title, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.title = title;
  button.style.height = '32px';
  button.style.padding = '0 14px';
  button.style.border = '1px solid #9ea4ad';
  button.style.borderRadius = '4px';
  button.style.background = 'linear-gradient(#ffffff, #ededed)';
  button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.18)';
  button.style.color = '#111';
  button.style.font = '700 13px Tahoma, Arial, sans-serif';
  button.style.cursor = 'pointer';
  button.style.whiteSpace = 'nowrap';
  button.addEventListener('click', onClick);
  return button;
}

async function copyCanvasImage(canvas, button) {
  if (!canvas) return;
  const original = button.textContent;
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
  window.setTimeout(() => {
    button.textContent = original;
  }, 1400);
}

function printCanvasPdf(canvas) {
  if (!canvas) return;
  const dataUrl = canvas.toDataURL('image/png');
  const popup = window.open('', '_blank');
  if (!popup) {
    window.print();
    return;
  }
  popup.document.write(`<!doctype html><html><head><title>Gannzilla PDF</title><style>html,body{margin:0;background:#fff;}img{width:100%;height:auto;display:block;}@media print{img{max-width:100%;page-break-inside:avoid;}}</style></head><body><img src="${dataUrl}" onload="setTimeout(()=>{window.print();},250)" /></body></html>`);
  popup.document.close();
}

function ensureExportButtons(overlay) {
  document.getElementById('gannzilla-export-copy-buttons-v31')?.remove();
  document.getElementById('gannzilla-export-copy-buttons-v32')?.remove();
  if (document.getElementById(EXPORT_BUTTONS_ID)) return;
  const bar = document.createElement('div');
  bar.id = EXPORT_BUTTONS_ID;
  bar.dir = 'rtl';
  bar.style.position = 'fixed';
  bar.style.top = '10px';
  bar.style.left = '10px';
  bar.style.zIndex = '2147483647';
  bar.style.display = 'flex';
  bar.style.gap = '8px';
  bar.style.alignItems = 'center';
  bar.style.pointerEvents = 'auto';
  bar.style.background = 'rgba(255,255,255,0.94)';
  bar.style.border = '1px solid rgba(150,150,150,0.45)';
  bar.style.borderRadius = '6px';
  bar.style.padding = '5px 6px';
  bar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)';
  bar.appendChild(makeExportButton('نسخ الصورة ⧉', 'نسخ صورة العجلة', (event) => copyCanvasImage(overlay, event.currentTarget)));
  bar.appendChild(makeExportButton('طباعة PDF 🖨', 'طباعة العجلة أو حفظها PDF', () => printCanvasPdf(overlay)));
  document.body.appendChild(bar);
  window.__gannzillaExportButtonsV33 = true;
}

function removeExportButtons() {
  document.getElementById(EXPORT_BUTTONS_ID)?.remove();
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
    ensureExportButtons(overlay);
    window[MARKER] = true;
    window.__gannzillaSumResultStyleVersion = SUM_RESULT_STYLE_VERSION;

    const render = () => {
      const sourceCanvas = getWheelCanvas();
      if (!sourceCanvas) return;
      sourceCanvas.style.opacity = '0.001';
      ensureExportButtons(overlay);
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
      removeExportButtons();
      document.getElementById(OVERLAY_ID)?.remove();
    };
  }, []);

  return null;
}
