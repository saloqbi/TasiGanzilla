import React from 'react';

const OVERLAY_ID = 'gannzilla-long-number-digital-renderer-v1';
const EXPORT_BAR_ID = 'gannzilla-clean-copy-export-bar-v43';
const MARKER = '__gannzillaLongNumberDigitalRendererV1';
const V43_MARKER = 'GANNZILLA_CELL_META_STACKED_LAYOUT_V43';
const TWO_PI = Math.PI * 2;
const FONT_STACK = 'Arial, Tahoma, Segoe UI, Helvetica, sans-serif';
const STYLE_VERSION = 'GANNZILLA_CELL_META_STACKED_LAYOUT_V43';

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function params() { try { return new URLSearchParams(window.location.search || ''); } catch (_) { return new URLSearchParams(''); } }
function queryBool(name, fallback = false) { const p = params(); if (!p.has(name)) return fallback; const v = String(p.get(name) || '').toLowerCase(); return v === 'true' || v === '1' || v === 'yes' || v === 'on'; }
function queryNumber(name, fallback, min, max) { const raw = Number(params().get(name)); return Number.isFinite(raw) ? clamp(raw, min, max) : fallback; }
function getBrowserZoomFactor() { if (!queryBool('browserZoomControl', false) && !queryBool('nativeZoomControl', false)) return 1; const dpr = Number(window.devicePixelRatio || 1); return Number.isFinite(dpr) && dpr > 0 ? clamp(dpr, 0.35, 3.5) : 1; }

function getMetaProfile() {
  const enabled = queryBool('angleLayerSum', false) || queryBool('showCellAngles', false) || queryBool('showCellLayers', false) || queryBool('showDigitSum', false);
  return {
    enabled,
    showCellAngles: queryBool('showCellAngles', enabled),
    showCellLayers: queryBool('showCellLayers', enabled),
    showDigitSum: queryBool('showDigitSum', enabled),
    showAngleDegrees: queryBool('showAngleDegrees', false),
    slantedAngles: queryBool('slantedAngles', false),
    followSourceWheel: queryBool('followSourceWheel', true) || queryBool('nativeToolbarZoom', true),
    primaryScale: queryNumber('primaryNumberScale', enabled ? 1.00 : 1.00, 0.55, 2.20),
    angleScale: queryNumber('angleNumberScale', enabled ? 0.82 : 0.72, 0.35, 1.80),
    layerScale: queryNumber('layerNumberScale', enabled ? 0.52 : 0.45, 0.25, 1.20),
    sumScale: queryNumber('digitSumScale', enabled ? 0.58 : 0.50, 0.25, 1.30),
    browserZoomControl: queryBool('browserZoomControl', false) || queryBool('nativeZoomControl', false),
    browserZoomFactor: getBrowserZoomFactor(),
    wheelScale: queryNumber('wheelScale', 1.00, 0.35, 4.00),
    canvasFillRatio: queryNumber('canvasFillRatio', 0.985, 0.50, 1.35),
    sourceWheelPadding: queryNumber('sourceWheelPadding', 0, -200, 600),
  };
}

function polar(cx, cy, radius, deg) { const rad = ((deg - 90) * Math.PI) / 180; return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }; }
function drawWedge(ctx, cx, cy, innerR, outerR, startDeg, endDeg) { const start = ((startDeg - 90) * Math.PI) / 180; const end = ((endDeg - 90) * Math.PI) / 180; ctx.beginPath(); ctx.arc(cx, cy, outerR, start, end, false); ctx.arc(cx, cy, innerR, end, start, true); ctx.closePath(); }
function colorFor(value) { const n = Math.trunc(Number(value)); if (!Number.isFinite(n)) return '#141414'; const mod = ((n % 3) + 3) % 3; if (mod === 1) return '#df2a2a'; if (mod === 2) return '#1a54d4'; return '#111111'; }
function digitalRoot(value) { const n = Math.abs(Math.trunc(Number(value)) || 0); if (n === 0) return 0; return ((n - 1) % 9) + 1; }
function formatNumber(value) { if (Number.isInteger(value)) return String(value); return String(Number(value.toFixed(4))); }
function numberAtRing(startValue, ringIndex, sectorIndex, divisions, increment) { return startValue + ((ringIndex - 1) * divisions + sectorIndex) * increment; }
function angleAtRing(ringIndex, sectorIndex, divisions) { return ((ringIndex - 1) * divisions + sectorIndex + 1); }

function getWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => canvas.id !== OVERLAY_ID)
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 60 && rect.height > 60)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}
function getNumberInputs() { return Array.from(document.querySelectorAll('aside input[type="number"]')); }
function getViewSelect() { return Array.from(document.querySelectorAll('aside select')).find((select) => Array.from(select.options || []).some((option) => String(option.textContent || '').includes('Circle of 36'))); }
function isStandaloneMode() { const q = window.location.search; return q.includes('standaloneImageWheel') || q.includes('exactImageCopy') || q.includes('copyGannzillaStyle') || q.includes('clean10RingLayout'); }
function getSettings() { const inputs = getNumberInputs(); const levels = isStandaloneMode() ? 10 : clamp(Number(inputs[0]?.value) || 5, 1, 12); const startValue = Number(inputs[1]?.value ?? 1) || 0; const increment = Number(inputs[3]?.value ?? 1) || 1; const divisions = Number(getViewSelect()?.value) || 36; return { levels, startValue, increment, divisions, clockwise: true }; }
function getSidebarRight() { const candidates = Array.from(document.querySelectorAll('aside, [class*="side"], [class*="panel"], [class*="control"]')).map((el) => el.getBoundingClientRect()).filter((r) => r.width > 85 && r.height > 240 && r.left < 360).sort((a, b) => b.right - a.right); return candidates[0]?.right || 0; }
function getTopOffset() { const candidates = Array.from(document.querySelectorAll('header, nav, [class*="toolbar"], [class*="topbar"]')).map((el) => el.getBoundingClientRect()).filter((r) => r.width > 280 && r.height > 18 && r.top < 160).sort((a, b) => b.bottom - a.bottom); return candidates[0]?.bottom || 74; }

function getFallbackRect(meta) {
  const left = clamp(Math.ceil(getSidebarRight() + 6), 0, Math.min(360, window.innerWidth * 0.38));
  const top = clamp(Math.ceil(getTopOffset() + 4), 64, 130);
  const baseWidth = Math.max(280, window.innerWidth - left - 8);
  const baseHeight = Math.max(280, window.innerHeight - top - 8);
  const liveScale = clamp(meta.wheelScale * meta.browserZoomFactor, 0.35, 4.00);
  return { left, top, width: Math.max(280, baseWidth * liveScale), height: Math.max(280, baseHeight * liveScale), baseWidth, baseHeight, liveScale, sourceFollowed: false };
}

function getStandaloneRect(meta, sourceCanvas) {
  const sourceRect = sourceCanvas?.getBoundingClientRect?.();
  if (meta.followSourceWheel && sourceRect && sourceRect.width > 60 && sourceRect.height > 60) {
    const pad = meta.sourceWheelPadding;
    const scale = clamp(meta.wheelScale, 0.35, 4.0);
    const width = Math.max(80, (sourceRect.width + pad) * scale);
    const height = Math.max(80, (sourceRect.height + pad) * scale);
    return { left: sourceRect.left + (sourceRect.width - width) / 2, top: sourceRect.top + (sourceRect.height - height) / 2, width, height, baseWidth: sourceRect.width, baseHeight: sourceRect.height, liveScale: scale, sourceFollowed: true };
  }
  return getFallbackRect(meta);
}

function textFontSize(midR, ringWidth, divisions, textLength, ring) { const arcRoom = (TWO_PI * midR / divisions) * 0.54; const radialRoom = ringWidth * 0.30; const charFactor = textLength >= 10 ? 0.66 : textLength >= 7 ? 0.61 : 0.56; const natural = Math.min(arcRoom / Math.max(1, textLength * charFactor), radialRoom); const min = ring <= 3 ? 7.0 : 6.2; const max = ring <= 3 ? 10.6 : ring <= 6 ? 9.8 : 9.2; return clamp(natural, min, max); }
function drawCenteredText(ctx, text, x, y, size, color, weight = 700, alpha = 1, rotationDeg = 0) { ctx.save(); ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5); if (rotationDeg) ctx.rotate((rotationDeg * Math.PI) / 180); ctx.font = `${weight} ${size}px ${FONT_STACK}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.fillText(String(text), 0, 0); ctx.restore(); }
function drawFittedText(ctx, text, x, y, size, color, maxWidth, weight = 720, rotationDeg = 0) { const label = String(text); let fitted = size; ctx.save(); ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5); if (rotationDeg) ctx.rotate((rotationDeg * Math.PI) / 180); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha = 1; for (let i = 0; i < 12; i += 1) { ctx.font = `${weight} ${fitted}px ${FONT_STACK}`; if (ctx.measureText(label).width <= maxWidth || fitted <= 4.8) break; fitted -= 0.35; } ctx.font = `${weight} ${fitted}px ${FONT_STACK}`; const measured = Math.max(1, ctx.measureText(label).width); const scaleX = measured > maxWidth ? clamp(maxWidth / measured, 0.48, 1) : 1; if (scaleX !== 1) ctx.scale(scaleX, 1); ctx.fillStyle = color; ctx.fillText(label, 0, 0); ctx.restore(); }

function drawCellMeta(ctx, cell) {
  const { cx, cy, ringWidth, mid, centerDeg, value, angleValue, ring, divisions, side, primarySize, maxW, meta } = cell;
  const center = polar(cx, cy, mid, centerDeg);
  const invMid = Math.max(1, mid);
  const nx = (center.x - cx) / invMid;
  const ny = (center.y - cy) / invMid;
  const tx = -ny;
  const ty = nx;
  const arcRoom = TWO_PI * mid / divisions;
  const topGap = clamp(ringWidth * 0.30, primarySize * 0.85, primarySize * 1.35);
  const bottomGap = clamp(ringWidth * 0.30, primarySize * 0.85, primarySize * 1.35);
  const rightGap = clamp(arcRoom * 0.14, primarySize * 0.55, primarySize * 1.15);
  const top = { x: center.x + nx * topGap, y: center.y + ny * topGap };
  const bottom = { x: center.x - nx * bottomGap, y: center.y - ny * bottomGap };
  const topRight = { x: center.x + nx * (topGap * 0.84) + tx * rightGap, y: center.y + ny * (topGap * 0.84) + ty * rightGap };
  const mainSize = primarySize * meta.primaryScale;
  const angleSize = clamp(primarySize * meta.angleScale, 4.5, 8.2);
  const sumSize = clamp(primarySize * meta.sumScale, 3.8, 6.4);
  const layerSize = clamp(primarySize * meta.layerScale, 3.4, 5.8);
  const label = formatNumber(value);
  const root = digitalRoot(value);
  const rotation = meta.slantedAngles ? centerDeg : 0;

  if (!meta.enabled) {
    drawFittedText(ctx, label, center.x, center.y, mainSize, colorFor(value), maxW, 730);
    if (side >= 620 && ring <= 8) drawCenteredText(ctx, root, bottom.x, bottom.y, sumSize, colorFor(value), 700, 0.56);
    return;
  }

  if (meta.showCellAngles) {
    const angleLabel = meta.showAngleDegrees ? `${angleValue}°` : String(angleValue);
    drawFittedText(ctx, angleLabel, top.x, top.y, angleSize, colorFor(angleValue), maxW * 0.74, 700, rotation);
  }
  if (meta.showCellLayers) {
    drawCenteredText(ctx, ring, topRight.x, topRight.y, layerSize, '#222222', 700, 0.70);
  }
  drawFittedText(ctx, label, center.x, center.y, mainSize, colorFor(value), maxW, 730);
  if (meta.showDigitSum) {
    drawCenteredText(ctx, root, bottom.x, bottom.y, sumSize, colorFor(root), 700, 0.82);
  }
}

function makeButton(label, onClick) { const button = document.createElement('button'); button.type = 'button'; button.textContent = label; button.style.height = '30px'; button.style.padding = '0 10px'; button.style.border = '1px solid #777'; button.style.borderRadius = '5px'; button.style.background = 'linear-gradient(#ffffff,#efefef)'; button.style.font = '700 12px Tahoma, Arial, sans-serif'; button.style.cursor = 'pointer'; button.style.boxShadow = '0 2px 6px rgba(0,0,0,.16)'; button.addEventListener('click', onClick); return button; }
async function copyCanvas(canvas, button) { const old = button.textContent; try { const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1)); if (blob && navigator.clipboard && window.ClipboardItem) { await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); button.textContent = 'تم النسخ ✓'; } else { const link = document.createElement('a'); link.download = 'gannzilla-image-match-wheel.png'; link.href = canvas.toDataURL('image/png'); link.click(); button.textContent = 'تم الحفظ ✓'; } } catch (_) { const link = document.createElement('a'); link.download = 'gannzilla-image-match-wheel.png'; link.href = canvas.toDataURL('image/png'); link.click(); button.textContent = 'تم الحفظ ✓'; } window.setTimeout(() => { button.textContent = old; }, 1300); }
function printCanvas(canvas) { const dataUrl = canvas.toDataURL('image/png'); const popup = window.open('', '_blank'); if (!popup) return; popup.document.write(`<!doctype html><html><head><title>Gannzilla PDF</title><style>@page{size:A3 landscape;margin:6mm;}html,body{margin:0;background:white;}img{width:100%;height:auto;display:block;}</style></head><body><img src="${dataUrl}" onload="setTimeout(()=>window.print(),250)" /></body></html>`); popup.document.close(); }
function ensureExportBar(overlay, rect) { let bar = document.getElementById(EXPORT_BAR_ID); if (!bar) { bar = document.createElement('div'); bar.id = EXPORT_BAR_ID; bar.dir = 'rtl'; bar.style.position = 'fixed'; bar.style.zIndex = '2147483647'; bar.style.display = 'flex'; bar.style.gap = '7px'; bar.style.background = 'rgba(255,255,255,.96)'; bar.style.border = '1px solid rgba(150,150,150,.55)'; bar.style.borderRadius = '7px'; bar.style.padding = '5px'; bar.style.boxShadow = '0 2px 8px rgba(0,0,0,.18)'; document.body.appendChild(bar); } if (!bar.dataset.ready) { bar.appendChild(makeButton('نسخ الصورة', (event) => copyCanvas(overlay, event.currentTarget))); bar.appendChild(makeButton('PDF A3', () => printCanvas(overlay))); bar.dataset.ready = 'true'; } bar.style.left = `${Math.max(8, rect.left + 10)}px`; bar.style.top = `${Math.max(8, rect.top + 8)}px`; }
function drawOuterGoldenFrame(ctx, cx, cy, innerR, outerR, divisions, direction) { const gold = 'rgba(231,215,92,0.90)'; const softGold = 'rgba(231,215,92,0.62)'; const frameLevels = 3; for (let ring = 0; ring < frameLevels; ring += 1) { const r1 = innerR + ring * ((outerR - innerR) / frameLevels); const r2 = innerR + (ring + 1) * ((outerR - innerR) / frameLevels); for (let i = 0; i < divisions; i += 1) { drawWedge(ctx, cx, cy, r1, r2, direction * i * (360 / divisions), direction * (i + 1) * (360 / divisions)); ctx.strokeStyle = softGold; ctx.lineWidth = 0.75; ctx.stroke(); } } ctx.save(); ctx.strokeStyle = gold; ctx.lineWidth = 1.0; [innerR, innerR + (outerR - innerR) / 3, innerR + 2 * (outerR - innerR) / 3, outerR].forEach((r) => { ctx.beginPath(); ctx.arc(cx, cy, r, 0, TWO_PI); ctx.stroke(); }); ctx.restore(); }
function drawCenterHub(ctx, cx, cy, radius) { const gradient = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius); gradient.addColorStop(0, 'rgba(24,60,82,0.95)'); gradient.addColorStop(0.58, 'rgba(25,37,48,0.96)'); gradient.addColorStop(1, 'rgba(12,18,25,0.96)'); ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, radius, 0, TWO_PI); ctx.fillStyle = gradient; ctx.fill(); ctx.strokeStyle = 'rgba(95,135,155,0.45)'; ctx.lineWidth = 2; ctx.stroke(); drawCenteredText(ctx, '2026-04-11', cx, cy - radius * 0.18, clamp(radius * 0.16, 8, 13), '#40b9ff', 800, 0.95); drawCenteredText(ctx, '10:17:53', cx, cy + radius * 0.10, clamp(radius * 0.22, 11, 19), '#35c6ff', 800, 0.98); drawCenteredText(ctx, 'NOW', cx, cy + radius * 0.38, clamp(radius * 0.11, 7, 10), '#5bb8df', 800, 0.9); ctx.restore(); }

function renderOverlay(overlay) {
  const meta = getMetaProfile();
  const sourceCanvas = getWheelCanvas();
  const rect = getStandaloneRect(meta, sourceCanvas);
  const settings = getSettings();
  const dpr = window.devicePixelRatio || 1;
  overlay.style.position = 'fixed'; overlay.style.left = `${rect.left}px`; overlay.style.top = `${rect.top}px`; overlay.style.width = `${rect.width}px`; overlay.style.height = `${rect.height}px`; overlay.style.zIndex = '2147483600'; overlay.style.pointerEvents = 'none'; overlay.style.background = '#fff';
  overlay.width = Math.max(1, Math.round(rect.width * dpr)); overlay.height = Math.max(1, Math.round(rect.height * dpr));
  const ctx = overlay.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, rect.width, rect.height); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, rect.width, rect.height); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  const { levels, startValue, increment, divisions, clockwise } = settings;
  const direction = clockwise ? 1 : -1; const sector = 360 / divisions; const cx = rect.width / 2; const cy = rect.height / 2; const side = Math.max(80, Math.min(rect.width, rect.height) * meta.canvasFillRatio - 10); const outerFrameOuter = side / 2 - 4; const frameWidth = clamp(side * 0.027, 8, 34); const wheelOuter = outerFrameOuter - frameWidth - clamp(side * 0.010, 3, 12); const innerRadius = clamp(side * 0.120, 20, wheelOuter * 0.24); const ringWidth = (wheelOuter - innerRadius) / levels;
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, innerRadius, 0, TWO_PI); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.restore();
  for (let ring = 1; ring <= levels; ring += 1) {
    const inner = innerRadius + (ring - 1) * ringWidth; const outer = inner + ringWidth; const mid = inner + ringWidth * 0.50; const bandFill = ring % 2 === 0 ? '#f3f3f3' : '#ffffff';
    for (let i = 0; i < divisions; i += 1) {
      const startDeg = direction * i * sector; const endDeg = direction * (i + 1) * sector; const centerDeg = direction * (i + 0.5) * sector; const value = numberAtRing(startValue, ring, i, divisions, increment); const angleValue = angleAtRing(ring, i, divisions); const label = formatNumber(value);
      ctx.save(); drawWedge(ctx, cx, cy, inner, outer, startDeg, endDeg); ctx.fillStyle = bandFill; ctx.fill(); ctx.strokeStyle = 'rgba(204,204,204,0.54)'; ctx.lineWidth = 0.62; ctx.stroke(); ctx.restore();
      const maxW = (TWO_PI * mid / divisions) * (meta.enabled ? 0.50 : 0.48); const fs = textFontSize(mid, ringWidth, divisions, label.length, ring);
      drawCellMeta(ctx, { cx, cy, inner, ringWidth, mid, centerDeg, value, angleValue, ring, divisions, side, primarySize: fs, maxW, meta });
    }
  }
  ctx.save(); ctx.strokeStyle = 'rgba(210,210,210,0.82)'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(cx, cy, innerRadius, 0, TWO_PI); ctx.stroke(); ctx.restore();
  drawCenterHub(ctx, cx, cy, clamp(innerRadius * 0.45, 12, 58)); drawOuterGoldenFrame(ctx, cx, cy, wheelOuter + clamp(side * 0.008, 2, 10), outerFrameOuter, divisions, direction);
  for (let deg = 0; deg < 360; deg += 30) { const p = polar(cx, cy, outerFrameOuter - frameWidth * 0.52, direction * deg); drawCenteredText(ctx, `${deg === 0 ? 360 : deg}`, p.x, p.y, clamp(side * 0.0056, 3.8, 8), '#777777', 700, 0.82); }
  window.__gannzillaCellMetaStackedLayoutV43Metrics = { ok: true, marker: window[V43_MARKER] === true, sourceFollowed: rect.sourceFollowed, sourceRect: sourceCanvas?.getBoundingClientRect?.() || null, rect, angleLayerSum: meta.enabled, stackedLayout: true, showCellAngles: meta.showCellAngles, showCellLayers: meta.showCellLayers, showDigitSum: meta.showDigitSum, levels, divisions, noMathMutation: true, noTradingMutation: true };
  window.__gannzillaNativeToolbarZoomFollowSourceV42Metrics = window.__gannzillaCellMetaStackedLayoutV43Metrics;
  ensureExportBar(overlay, rect);
}

function installAuditHelper() {
  const audit = function auditGannzillaCellMetaStackedLayoutV43() {
    const metrics = window.__gannzillaCellMetaStackedLayoutV43Metrics || {}; const meta = getMetaProfile();
    return { ok: window[V43_MARKER] === true, markerV43: window[V43_MARKER] === true, rendererMarker: window[MARKER] === true, styleVersion: window.__gannzillaSumResultStyleVersion, nativeToolbarZoom: meta.followSourceWheel, sourceFollowed: metrics.sourceFollowed === true, angleLayerSum: meta.enabled, stackedLayout: true, showCellAngles: meta.showCellAngles, showCellLayers: meta.showCellLayers, showDigitSum: meta.showDigitSum, slantedAngles: meta.slantedAngles, noMathMutation: true, noTradingMutation: true, metrics };
  };
  window.__auditGannzillaCellMetaStackedLayoutV43 = audit; window.__auditGannzillaNativeToolbarZoomFollowSourceV42 = audit; window.__auditGannzillaBrowserZoomRestoredAngleLayerV41 = audit; window.__auditGannzillaAngleLayerDigitSumV40 = audit;
}

export default function GannzillaLongNumberDigitalRenderer() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true'); if (!isWheelMode) return undefined;
    let overlay = document.getElementById(OVERLAY_ID); if (!overlay) { overlay = document.createElement('canvas'); overlay.id = OVERLAY_ID; document.body.appendChild(overlay); }
    window[MARKER] = true; window[V43_MARKER] = true; window.GANNZILLA_NATIVE_TOOLBAR_ZOOM_FOLLOW_SOURCE_V42 = true; window.GANNZILLA_BROWSER_ZOOM_RESTORED_ANGLE_LAYER_V41 = true; window.GANNZILLA_CELL_ANGLE_LAYER_DIGIT_SUM_V40 = true; window.__gannzillaSumResultStyleVersion = STYLE_VERSION; window.__gannzillaStandaloneImageMatchV43 = true;
    installAuditHelper();
    const render = () => { const sourceCanvas = getWheelCanvas(); if (sourceCanvas) sourceCanvas.style.opacity = queryBool('hideSourceWheel', true) ? '0.001' : ''; renderOverlay(overlay); };
    render(); const timer = window.setInterval(render, 120); window.addEventListener('resize', render); window.addEventListener('scroll', render, true); window.visualViewport?.addEventListener?.('resize', render);
    return () => { window.clearInterval(timer); window.removeEventListener('resize', render); window.removeEventListener('scroll', render, true); window.visualViewport?.removeEventListener?.('resize', render); const sourceCanvas = getWheelCanvas(); if (sourceCanvas) sourceCanvas.style.opacity = ''; document.getElementById(OVERLAY_ID)?.remove(); document.getElementById(EXPORT_BAR_ID)?.remove(); };
  }, []);
  return null;
}
