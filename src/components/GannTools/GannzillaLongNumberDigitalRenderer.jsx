import React from 'react';

const OVERLAY_ID = 'gannzilla-long-number-digital-renderer-v1';
const EXPORT_BAR_ID = 'gannzilla-clean-copy-export-bar-v39';
const MARKER = '__gannzillaLongNumberDigitalRendererV1';
const TWO_PI = Math.PI * 2;
const FONT_STACK = 'Arial, Tahoma, Segoe UI, Helvetica, sans-serif';
const SUM_RESULT_STYLE_VERSION = 'GANNZILLA_CLEAN_10_RING_LAYOUT_COPY_V39';

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

function colorFor(value) {
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n)) return '#111111';
  const mod = ((n % 3) + 3) % 3;
  if (mod === 1) return '#df2020';
  if (mod === 2) return '#1557d8';
  return '#111111';
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

function isClean10Mode() {
  const q = window.location.search;
  return q.includes('clean10RingLayout') || q.includes('copyGannzillaStyle') || q.includes('tenRingLargeCells') || q.includes('largeCells10');
}

function syncTenRingInput() {
  if (!isClean10Mode()) return;
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
  const levels = isClean10Mode() ? 10 : clamp(Number(inputs[0]?.value) || 5, 1, 12);
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

function textFontSize(midR, ringWidth, divisions, textLength, ring) {
  const arcRoom = (TWO_PI * midR / divisions) * 0.66;
  const radialRoom = ringWidth * 0.34;
  const charFactor = textLength >= 10 ? 0.62 : textLength >= 7 ? 0.58 : 0.54;
  const natural = Math.min(arcRoom / Math.max(1, textLength * charFactor), radialRoom);
  const min = ring <= 3 ? 7.8 : 6.8;
  const max = ring <= 3 ? 12.4 : ring <= 6 ? 11.6 : 10.8;
  return clamp(natural, min, max);
}

function drawCenteredText(ctx, text, x, y, size, color, weight = 700, alpha = 1) {
  ctx.save();
  ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5);
  ctx.font = `${weight} ${size}px ${FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillText(String(text), 0, 0);
  ctx.restore();
}

function drawFittedText(ctx, text, x, y, size, color, maxWidth, weight = 700) {
  const label = String(text);
  let fitted = size;
  ctx.save();
  ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = 1;
  for (let i = 0; i < 10; i += 1) {
    ctx.font = `${weight} ${fitted}px ${FONT_STACK}`;
    if (ctx.measureText(label).width <= maxWidth || fitted <= 5.4) break;
    fitted -= 0.45;
  }
  ctx.font = `${weight} ${fitted}px ${FONT_STACK}`;
  const measured = Math.max(1, ctx.measureText(label).width);
  const scaleX = measured > maxWidth ? clamp(maxWidth / measured, 0.54, 1) : 1;
  if (scaleX !== 1) ctx.scale(scaleX, 1);
  ctx.fillStyle = color;
  ctx.fillText(label, 0, 0);
  ctx.restore();
}

function makeButton(label, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.style.height = '30px';
  button.style.padding = '0 10px';
  button.style.border = '1px solid #777';
  button.style.borderRadius = '5px';
  button.style.background = 'linear-gradient(#ffffff,#efefef)';
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
      link.download = 'gannzilla-clean-10-ring.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      button.textContent = 'تم الحفظ ✓';
    }
  } catch (error) {
    const link = document.createElement('a');
    link.download = 'gannzilla-clean-10-ring.png';
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

function drawOuterGoldenFrame(ctx, cx, cy, innerR, outerR, divisions, direction) {
  const gold = '#eadb73';
  const softGold = 'rgba(234,219,115,0.72)';
  for (let ring = 0; ring < 3; ring += 1) {
    const r1 = innerR + ring * ((outerR - innerR) / 3);
    const r2 = innerR + (ring + 1) * ((outerR - innerR) / 3);
    ctx.save();
    for (let i = 0; i < divisions; i += 1) {
      drawWedge(ctx, cx, cy, r1, r2, direction * i * (360 / divisions), direction * (i + 1) * (360 / divisions));
      ctx.strokeStyle = softGold;
      ctx.lineWidth = 0.9;
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.save();
  ctx.strokeStyle = gold;
  ctx.lineWidth = 1.15;
  [innerR, innerR + (outerR - innerR) / 3, innerR + 2 * (outerR - innerR) / 3, outerR].forEach((r) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TWO_PI);
    ctx.stroke();
  });
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
  const direction = clockwise ? 1 : -1;
  const sector = 360 / divisions;
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const minSide = Math.min(rect.width, rect.height);
  const outerFrameOuter = minSide / 2 - 24;
  const frameWidth = clamp(minSide * 0.030, 22, 38);
  const wheelOuter = outerFrameOuter - frameWidth - 10;
  const innerRadius = clamp(minSide * 0.145, 86, wheelOuter * 0.30);
  const ringWidth = (wheelOuter - innerRadius) / levels;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius, 0, TWO_PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#dddddd';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  for (let ring = 1; ring <= levels; ring += 1) {
    const inner = innerRadius + (ring - 1) * ringWidth;
    const outer = inner + ringWidth;
    const mid = inner + ringWidth / 2;
    const bandFill = ring % 2 === 0 ? '#f3f3f3' : '#ffffff';
    for (let i = 0; i < divisions; i += 1) {
      const startDeg = direction * i * sector;
      const endDeg = direction * (i + 1) * sector;
      const centerDeg = direction * (i + 0.5) * sector;
      const value = numberAtRing(startValue, ring, i, divisions, increment);
      const label = formatNumber(value);
      ctx.save();
      drawWedge(ctx, cx, cy, inner, outer, startDeg, endDeg);
      ctx.fillStyle = bandFill;
      ctx.fill();
      ctx.strokeStyle = 'rgba(205,205,205,0.72)';
      ctx.lineWidth = 0.78;
      ctx.stroke();
      ctx.restore();

      const p = polar(cx, cy, mid, centerDeg);
      const maxW = (TWO_PI * mid / divisions) * 0.58;
      const fs = textFontSize(mid, ringWidth, divisions, label.length, ring);
      drawFittedText(ctx, label, p.x, p.y, fs, colorFor(value), maxW, 720);
    }
  }

  drawOuterGoldenFrame(ctx, cx, cy, wheelOuter + 10, outerFrameOuter, divisions, direction);
  for (let deg = 0; deg < 360; deg += 30) {
    const p = polar(cx, cy, outerFrameOuter - frameWidth * 0.55, direction * deg);
    drawCenteredText(ctx, `${deg === 0 ? 360 : deg}`, p.x, p.y, 7.2, '#777777', 700, 0.88);
  }

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
    window.__gannzillaClean10RingCopyV39 = true;

    const render = () => {
      syncTenRingInput();
      const sourceCanvas = getWheelCanvas();
      if (!sourceCanvas) return;
      sourceCanvas.style.opacity = '0.001';
      renderOverlay(overlay, sourceCanvas);
    };

    render();
    const timer = window.setInterval(render, 300);
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
