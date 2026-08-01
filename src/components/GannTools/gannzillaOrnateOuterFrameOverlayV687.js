const BUILD = 724;
const STATE_KEY = '__gannzillaNativeOrnateFrameV724';
const FINAL_EVENT = 'gannzilla:final-wheel-authority-v506';
const TAU = Math.PI * 2;

let applyCount = 0;
let pendingFrame = 0;
let pendingTimers = [];
let watchTimer = 0;
let lastApply = null;

function effectiveSearch() {
  return window.__gannzillaV672CanonicalSearch
    || window.sessionStorage?.getItem?.('gannzilla:v672:canonical-search')
    || window.location.search
    || '';
}

function params() {
  try { return new URLSearchParams(effectiveSearch()); }
  catch (_) { return new URLSearchParams(); }
}

function enabled() {
  const query = params();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  return window.location.pathname === '/v672.html'
    && wheelMode
    && query.get('ornateOuterFrame') !== 'false';
}

function isWheelCanvas(canvas) {
  if (!(canvas instanceof HTMLCanvasElement) || canvas.closest('aside')) return false;
  const id = String(canvas.id || '').toLowerCase();
  if (id.includes('overlay') || id.includes('preview') || id.includes('tracker')) return false;
  return canvas.width > 300 && canvas.height > 300;
}

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-wheel-ivory-champagne-final-authority-v682="true"]',
    'canvas[data-gannzilla-outer-empty-ring-mirror-silver-v668="true"]',
    'canvas[data-gannzilla-empty-outer-ring-v518="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v506="true"]',
  ].join(','));
  if (isWheelCanvas(preferred)) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter(isWheelCanvas)
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

function removeLegacyOverlays() {
  [
    'gannzilla-ornate-outer-frame-overlay-v687',
    'gannzilla-reference-ornate-frame-v688',
    'gannzilla-exact-reference-frame-v690',
    'gannzilla-exact-reference-frame-v691',
    'gannzilla-exact-reference-frame-v693',
    'gannzilla-exact-reference-frame-v705',
    'gannzilla-exact-reference-frame-v707',
    'gannzilla-persistent-exact-frame-v712',
    'gannzilla-ornate-frame-clean-v720',
    'gannzilla-ornate-frame-clean-v721',
    'gannzilla-ornate-frame-direct-v723',
  ].forEach((id) => document.getElementById(id)?.remove());
}

function polar(cx, cy, radius, degrees) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return {
    x: cx + Math.cos(radians) * radius,
    y: cy + Math.sin(radians) * radius,
  };
}

function fillAnnulus(ctx, cx, cy, inner, outer, fillStyle) {
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(1, outer), 0, TAU);
  ctx.arc(cx, cy, Math.max(1, inner), TAU, 0, true);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function strokeCircle(ctx, cx, cy, radius, strokeStyle, lineWidth) {
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(1, radius), 0, TAU);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

function roundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function goldGradient(ctx, x1, y1, x2, y2) {
  const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  gradient.addColorStop(0, '#4a1902');
  gradient.addColorStop(0.18, '#b96711');
  gradient.addColorStop(0.38, '#f4b94c');
  gradient.addColorStop(0.50, '#fff1ac');
  gradient.addColorStop(0.66, '#d98921');
  gradient.addColorStop(0.84, '#7b3507');
  gradient.addColorStop(1, '#2c0d01');
  return gradient;
}

function drawGem(ctx, x, y, radius, zoom) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  const gem = ctx.createRadialGradient(
    x - radius * 0.30,
    y - radius * 0.34,
    0,
    x,
    y,
    radius,
  );
  gem.addColorStop(0, '#ffffff');
  gem.addColorStop(0.22, '#a8ecff');
  gem.addColorStop(0.48, '#37a9eb');
  gem.addColorStop(0.76, '#0b579d');
  gem.addColorStop(1, '#042951');
  ctx.fillStyle = gem;
  ctx.fill();
  ctx.strokeStyle = '#ffe7a0';
  ctx.lineWidth = Math.max(0.8, 1.15 * zoom);
  ctx.stroke();
}

function drawDiamond(ctx, cx, cy, radius, angle, zoom, large = false) {
  const point = polar(cx, cy, radius, angle);
  const size = Math.max(8, (large ? 17 : 11) * zoom);

  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.rotate((angle * Math.PI) / 180 + Math.PI / 4);
  ctx.fillStyle = '#08090c';
  ctx.strokeStyle = goldGradient(ctx, -size, -size, size, size);
  ctx.lineWidth = Math.max(1.5, 2.2 * zoom);
  ctx.fillRect(-size / 2, -size / 2, size, size);
  ctx.strokeRect(-size / 2, -size / 2, size, size);
  ctx.fillStyle = '#cf8120';
  ctx.fillRect(-size * 0.34, -size * 0.34, size * 0.68, size * 0.68);
  drawGem(ctx, 0, 0, size * 0.19, zoom);
  ctx.restore();
}

function drawFiligree(ctx, span, height, zoom) {
  const gold = goldGradient(ctx, -span, 0, span, 0);
  [-1, 1].forEach((side) => {
    ctx.save();
    ctx.scale(side, 1);
    ctx.strokeStyle = gold;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineWidth = Math.max(2.0, 3.0 * zoom);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(span * 0.20, -height * 0.76, span * 0.54, -height * 0.88, span * 0.82, -height * 0.22);
    ctx.bezierCurveTo(span * 0.61, -height * 0.15, span * 0.43, height * 0.43, span * 0.10, height * 0.34);
    ctx.stroke();

    ctx.lineWidth = Math.max(1.0, 1.45 * zoom);
    ctx.strokeStyle = '#ffe19a';
    ctx.beginPath();
    ctx.moveTo(span * 0.18, -height * 0.05);
    ctx.bezierCurveTo(span * 0.38, -height * 0.56, span * 0.58, -height * 0.54, span * 0.69, -height * 0.17);
    ctx.stroke();

    ctx.strokeStyle = '#a9570e';
    ctx.beginPath();
    ctx.moveTo(span * 0.27, height * 0.14);
    ctx.bezierCurveTo(span * 0.48, height * 0.58, span * 0.68, height * 0.50, span * 0.76, height * 0.15);
    ctx.stroke();
    ctx.restore();
  });
}

function drawCardinalOrnament(ctx, cx, cy, radius, angle, label, frameWidth, zoom) {
  const point = polar(cx, cy, radius, angle);
  const radians = (angle * Math.PI) / 180;
  const plaqueWidth = Math.max(54, frameWidth * 0.88);
  const plaqueHeight = Math.max(24, frameWidth * 0.36);
  const filigreeSpan = Math.max(48, frameWidth * 0.88);
  const filigreeHeight = Math.max(25, frameWidth * 0.44);

  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.rotate(radians);
  drawFiligree(ctx, filigreeSpan, filigreeHeight, zoom);
  ctx.rotate(-radians);

  const x = -plaqueWidth / 2;
  const y = -plaqueHeight / 2;
  roundedRectPath(ctx, x, y, plaqueWidth, plaqueHeight, plaqueHeight * 0.34);
  const plaque = ctx.createLinearGradient(0, y, 0, y + plaqueHeight);
  plaque.addColorStop(0, '#44301e');
  plaque.addColorStop(0.38, '#101013');
  plaque.addColorStop(0.62, '#030405');
  plaque.addColorStop(1, '#29160b');
  ctx.fillStyle = plaque;
  ctx.fill();
  ctx.strokeStyle = goldGradient(ctx, x, 0, x + plaqueWidth, 0);
  ctx.lineWidth = Math.max(2.0, 2.8 * zoom);
  ctx.stroke();

  roundedRectPath(
    ctx,
    x + plaqueHeight * 0.12,
    y + plaqueHeight * 0.12,
    plaqueWidth - plaqueHeight * 0.24,
    plaqueHeight - plaqueHeight * 0.24,
    plaqueHeight * 0.25,
  );
  ctx.strokeStyle = 'rgba(255,232,157,0.66)';
  ctx.lineWidth = Math.max(0.7, 0.9 * zoom);
  ctx.stroke();

  const crownY = y - plaqueHeight * 0.38;
  ctx.beginPath();
  ctx.moveTo(0, crownY - plaqueHeight * 0.55);
  ctx.lineTo(plaqueHeight * 0.30, crownY);
  ctx.lineTo(0, crownY + plaqueHeight * 0.22);
  ctx.lineTo(-plaqueHeight * 0.30, crownY);
  ctx.closePath();
  ctx.fillStyle = goldGradient(ctx, -plaqueHeight, crownY, plaqueHeight, crownY);
  ctx.fill();
  ctx.strokeStyle = '#4a1b04';
  ctx.lineWidth = Math.max(0.9, 1.25 * zoom);
  ctx.stroke();

  drawGem(ctx, 0, crownY - plaqueHeight * 0.08, plaqueHeight * 0.12, zoom);

  ctx.font = `900 ${Math.max(17, plaqueHeight * 0.60)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff0b4';
  ctx.strokeStyle = '#1c0902';
  ctx.lineWidth = Math.max(1.2, 1.75 * zoom);
  ctx.strokeText(label, 0, zoom);
  ctx.fillText(label, 0, zoom);
  ctx.restore();
}

function ornateGradient(ctx, cx, cy, inner, outer) {
  const gradient = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
  gradient.addColorStop(0, '#5a2506');
  gradient.addColorStop(0.055, '#d88420');
  gradient.addColorStop(0.115, '#ffe5a1');
  gradient.addColorStop(0.17, '#8a430d');
  gradient.addColorStop(0.23, '#17110d');
  gradient.addColorStop(0.36, '#050608');
  gradient.addColorStop(0.67, '#08090b');
  gradient.addColorStop(0.77, '#24150c');
  gradient.addColorStop(0.845, '#8b450e');
  gradient.addColorStop(0.915, '#ffd77d');
  gradient.addColorStop(0.965, '#a75b16');
  gradient.addColorStop(1, '#351204');
  return gradient;
}

function draw(source = 'draw') {
  pendingFrame = 0;
  removeLegacyOverlays();
  if (!enabled()) return false;

  const canvas = findWheel();
  if (!isWheelCanvas(canvas)) return false;

  const rect = canvas.getBoundingClientRect();
  const cssSize = Number(canvas.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518)
    || Number(canvas.dataset.gannzillaCanvasCssSize)
    || Number.parseFloat(canvas.style.width)
    || rect.width;
  const dpr = Math.max(
    1,
    Number(canvas.dataset.gannzillaNativeDpr)
      || (cssSize > 0 ? canvas.width / cssSize : 0)
      || Number(window.devicePixelRatio)
      || 1,
  );
  const zoom = Math.max(0.5, Number(canvas.dataset.gannzillaAppliedZoom) || 1);

  if (!(cssSize > 300) || canvas.width < 1 || canvas.height < 1) return false;

  const cx = cssSize / 2;
  const cy = cssSize / 2;
  const half = cssSize / 2;
  const reservedMargin = Math.min(half * 0.15, Math.max(72, 90 * zoom));
  const inner = half - reservedMargin + Math.max(2.0, 2.5 * zoom);
  const outer = half - Math.max(4.0, 5.0 * zoom);
  const frameWidth = outer - inner;
  if (!(frameWidth > Math.max(40, 46 * zoom))) return false;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return false;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.setLineDash([]);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  fillAnnulus(ctx, cx, cy, inner - Math.max(1, zoom), half, '#fbf4e7');
  fillAnnulus(ctx, cx, cy, inner, outer, ornateGradient(ctx, cx, cy, inner, outer));

  const rails = [
    [0.02, '#2c0b01', 3.2],
    [0.075, '#e39a2d', 4.6],
    [0.115, '#ffe6a0', 1.5],
    [0.19, '#6f2d07', 2.2],
    [0.27, '#d9801e', 3.2],
    [0.33, '#fff0b0', 1.0],
    [0.68, '#5f2606', 2.0],
    [0.76, '#d98421', 3.2],
    [0.82, '#ffe7a1', 1.1],
    [0.91, '#e49a2c', 4.8],
    [0.97, '#2b0a01', 3.2],
  ];
  rails.forEach(([ratio, color, width]) => {
    strokeCircle(ctx, cx, cy, inner + frameWidth * ratio, color, Math.max(0.8, width * zoom));
  });

  const ornamentRadius = inner + frameWidth * 0.53;
  [30, 60, 120, 150, 210, 240, 300, 330].forEach((angle) => {
    drawDiamond(ctx, cx, cy, ornamentRadius, angle, zoom, false);
  });
  [45, 135, 225, 315].forEach((angle) => {
    drawDiamond(ctx, cx, cy, ornamentRadius, angle, zoom, true);
  });
  [[0, '360°'], [90, '90°'], [180, '180°'], [270, '270°']].forEach(([angle, label]) => {
    drawCardinalOrnament(ctx, cx, cy, ornamentRadius, angle, label, frameWidth, zoom);
  });

  ctx.restore();

  canvas.dataset.gannzillaNativeOrnateFrameV724 = 'true';
  canvas.dataset.gannzillaNativeOrnateFrameBuild = String(BUILD);
  canvas.dataset.gannzillaNativeOrnateFrameMaterial = 'gloss-black-antique-gold-blue-gem';
  canvas.dataset.gannzillaNativeOrnateFrameGeometryChanged = 'false';
  canvas.dataset.gannzillaNativeOrnateFrameExistingContentChanged = 'false';

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    cssSize,
    dpr,
    zoom,
    innerRadius: inner,
    outerRadius: outer,
    frameWidth,
    material: 'gloss-black-antique-gold-blue-gem',
    cardinalOrnaments: [360, 90, 180, 270],
    diamondMarkers: [45, 135, 225, 315],
    geometryChanged: false,
    existingContentChanged: false,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:native-ornate-frame-v724', {
    detail: lastApply,
  }));
  return true;
}

function clearScheduledDraws() {
  pendingTimers.forEach((timer) => window.clearTimeout(timer));
  pendingTimers = [];
  if (pendingFrame) window.cancelAnimationFrame(pendingFrame);
  pendingFrame = 0;
}

function schedule(source = 'schedule', delays = [90, 340, 900]) {
  clearScheduledDraws();
  pendingTimers = delays.map((delay, index) => window.setTimeout(() => {
    pendingFrame = window.requestAnimationFrame(() => {
      draw(index === delays.length - 1 ? `${source}-late` : source);
    });
  }, delay));
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || window[STATE_KEY]) return;

  [
    FINAL_EVENT,
    'gannzilla:wheel-ivory-champagne-final-authority-v682',
    'gannzilla:outer-empty-ring-mirror-silver-v668',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:wheel-input-v459',
    'resize',
  ].forEach((eventName) => {
    window.addEventListener(eventName, () => schedule(eventName), false);
  });

  [0, 180, 520, 1100, 2200, 4200, 7000].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, [0, 180]), delay);
  });

  watchTimer = window.setInterval(() => draw('persistent-watch'), 450);

  window.GANNZILLA_NATIVE_ORNATE_FRAME_V724 = true;
  window.__auditGannzillaNativeOrnateFrameV724 = () => {
    const canvas = findWheel();
    return {
      ok: enabled()
        && canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaNativeOrnateFrameV724 === 'true'
        && applyCount > 0,
      build: BUILD,
      enabled: enabled(),
      wheelFound: canvas instanceof HTMLCanvasElement,
      nativeCanvasIntegration: true,
      overlayRequired: false,
      material: canvas?.dataset?.gannzillaNativeOrnateFrameMaterial || '',
      geometryChanged: canvas?.dataset?.gannzillaNativeOrnateFrameGeometryChanged === 'true',
      existingContentChanged: canvas?.dataset?.gannzillaNativeOrnateFrameExistingContentChanged === 'true',
      applyCount,
      watchTimerActive: Boolean(watchTimer),
      lastApply,
    };
  };

  window[STATE_KEY] = { draw, schedule, clearScheduledDraws };
  schedule('install', [0, 220, 900, 1800]);
}

install();
