const BUILD = 731;
const STATE_KEY = '__gannzillaStableExternalFrameV731';
const OVERLAY_ID = 'gannzilla-stable-external-frame-v731';
const TAU = Math.PI * 2;

let wheel = null;
let overlay = null;
let resizeObserver = null;
let wheelObserver = null;
let documentObserver = null;
let pendingFrame = 0;
let stableSample = null;
let stableSampleCount = 0;
let bitmapKey = '';
let bitmapRedrawCount = 0;
let positionUpdateCount = 0;
let lastApply = null;

function effectiveSearch() {
  return window.__gannzillaV672CanonicalSearch
    || window.sessionStorage?.getItem?.('gannzilla:v672:canonical-search')
    || window.location.search
    || '';
}

function enabled() {
  if (!/\/v672\.html$/.test(window.location.pathname)) return false;
  try {
    const query = new URLSearchParams(effectiveSearch());
    return (query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true')
      && query.get('ornateOuterFrame') !== 'false';
  } catch (_) {
    return true;
  }
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
    'canvas[data-gannzilla-outer-empty-ring-v518="true"]',
    'canvas[data-gannzilla-empty-outer-ring-v518="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v506="true"]',
  ].join(','));

  if (isWheelCanvas(preferred)) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter(isWheelCanvas)
    .sort((a, b) => {
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      return (br.width * br.height) - (ar.width * ar.height);
    })[0] || null;
}

function createOverlay() {
  if (overlay?.isConnected) return overlay;

  overlay = document.createElement('canvas');
  overlay.id = OVERLAY_ID;
  overlay.setAttribute('aria-hidden', 'true');
  overlay.dataset.gannzillaStableExternalFrameV731 = 'true';

  const style = overlay.style;
  style.setProperty('position', 'fixed', 'important');
  style.setProperty('display', 'none', 'important');
  style.setProperty('left', '0px', 'important');
  style.setProperty('top', '0px', 'important');
  style.setProperty('width', '0px', 'important');
  style.setProperty('height', '0px', 'important');
  style.setProperty('max-width', 'none', 'important');
  style.setProperty('max-height', 'none', 'important');
  style.setProperty('pointer-events', 'none', 'important');
  style.setProperty('user-select', 'none', 'important');
  style.setProperty('touch-action', 'none', 'important');
  style.setProperty('z-index', '2147482500', 'important');
  style.setProperty('opacity', '1', 'important');
  style.setProperty('visibility', 'visible', 'important');
  style.setProperty('transform', 'translate3d(0,0,0)', 'important');
  style.setProperty('transform-origin', '50% 50%', 'important');
  style.setProperty('transition', 'none', 'important');
  style.setProperty('animation', 'none', 'important');
  style.setProperty('contain', 'layout style paint', 'important');
  style.setProperty('image-rendering', 'auto', 'important');

  (document.body || document.documentElement).appendChild(overlay);
  return overlay;
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

function strokeCircle(ctx, cx, cy, radius, color, width) {
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(1, radius), 0, TAU);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function roundedRect(ctx, x, y, width, height, radius) {
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
  gradient.addColorStop(0, '#2c0b01');
  gradient.addColorStop(0.17, '#7c3406');
  gradient.addColorStop(0.34, '#d98720');
  gradient.addColorStop(0.50, '#fff0aa');
  gradient.addColorStop(0.66, '#e09a31');
  gradient.addColorStop(0.84, '#763006');
  gradient.addColorStop(1, '#220700');
  return gradient;
}

function drawGem(ctx, x, y, radius, scale) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  const gem = ctx.createRadialGradient(
    x - radius * 0.28,
    y - radius * 0.32,
    0,
    x,
    y,
    radius,
  );
  gem.addColorStop(0, '#ffffff');
  gem.addColorStop(0.22, '#b8f0ff');
  gem.addColorStop(0.48, '#40afea');
  gem.addColorStop(0.76, '#0b5ca4');
  gem.addColorStop(1, '#03284f');
  ctx.fillStyle = gem;
  ctx.fill();
  ctx.strokeStyle = '#ffe69b';
  ctx.lineWidth = Math.max(0.8, 1.15 * scale);
  ctx.stroke();
}

function drawDiamond(ctx, cx, cy, radius, angle, scale, large) {
  const point = polar(cx, cy, radius, angle);
  const size = Math.max(12, (large ? 30 : 21) * scale);

  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.rotate((angle * Math.PI) / 180 + Math.PI / 4);
  ctx.fillStyle = '#050608';
  ctx.strokeStyle = goldGradient(ctx, -size, -size, size, size);
  ctx.lineWidth = Math.max(1.5, 2.4 * scale);
  ctx.fillRect(-size / 2, -size / 2, size, size);
  ctx.strokeRect(-size / 2, -size / 2, size, size);
  ctx.fillStyle = '#d78b27';
  ctx.fillRect(-size * 0.34, -size * 0.34, size * 0.68, size * 0.68);
  drawGem(ctx, 0, 0, size * 0.19, scale);
  ctx.restore();
}

function drawFiligree(ctx, span, height, scale) {
  const gold = goldGradient(ctx, -span, 0, span, 0);
  [-1, 1].forEach((side) => {
    ctx.save();
    ctx.scale(side, 1);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.strokeStyle = gold;
    ctx.lineWidth = Math.max(2.2, 3.4 * scale);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      span * 0.20,
      -height * 0.78,
      span * 0.55,
      -height * 0.92,
      span * 0.84,
      -height * 0.22,
    );
    ctx.bezierCurveTo(
      span * 0.62,
      -height * 0.14,
      span * 0.43,
      height * 0.46,
      span * 0.10,
      height * 0.35,
    );
    ctx.stroke();

    ctx.strokeStyle = '#ffe4a1';
    ctx.lineWidth = Math.max(1.0, 1.55 * scale);
    ctx.beginPath();
    ctx.moveTo(span * 0.18, -height * 0.05);
    ctx.bezierCurveTo(
      span * 0.39,
      -height * 0.57,
      span * 0.59,
      -height * 0.56,
      span * 0.70,
      -height * 0.17,
    );
    ctx.stroke();

    ctx.strokeStyle = '#9f4e0b';
    ctx.beginPath();
    ctx.moveTo(span * 0.27, height * 0.14);
    ctx.bezierCurveTo(
      span * 0.49,
      height * 0.60,
      span * 0.69,
      height * 0.52,
      span * 0.77,
      height * 0.15,
    );
    ctx.stroke();
    ctx.restore();
  });
}

function drawCardinal(ctx, cx, cy, radius, angle, label, frameWidth, scale) {
  const point = polar(cx, cy, radius, angle);
  const radians = (angle * Math.PI) / 180;
  const plaqueWidth = Math.max(92, Math.min(205 * scale, frameWidth * 1.60));
  const plaqueHeight = Math.max(40, Math.min(74 * scale, frameWidth * 0.50));
  const span = Math.max(108, Math.min(250 * scale, frameWidth * 2.00));
  const height = Math.max(52, Math.min(112 * scale, frameWidth * 0.82));

  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.rotate(radians);
  drawFiligree(ctx, span, height, scale);
  ctx.rotate(-radians);

  const x = -plaqueWidth / 2;
  const y = -plaqueHeight / 2;
  roundedRect(ctx, x, y, plaqueWidth, plaqueHeight, plaqueHeight * 0.34);
  const plaque = ctx.createLinearGradient(0, y, 0, y + plaqueHeight);
  plaque.addColorStop(0, '#4b3320');
  plaque.addColorStop(0.38, '#101013');
  plaque.addColorStop(0.63, '#020304');
  plaque.addColorStop(1, '#2c180b');
  ctx.fillStyle = plaque;
  ctx.fill();
  ctx.strokeStyle = goldGradient(ctx, x, 0, x + plaqueWidth, 0);
  ctx.lineWidth = Math.max(2.1, 3.0 * scale);
  ctx.stroke();

  roundedRect(
    ctx,
    x + plaqueHeight * 0.12,
    y + plaqueHeight * 0.12,
    plaqueWidth - plaqueHeight * 0.24,
    plaqueHeight - plaqueHeight * 0.24,
    plaqueHeight * 0.25,
  );
  ctx.strokeStyle = 'rgba(255,234,164,0.68)';
  ctx.lineWidth = Math.max(0.7, 0.95 * scale);
  ctx.stroke();

  const crownY = y - plaqueHeight * 0.39;
  ctx.beginPath();
  ctx.moveTo(0, crownY - plaqueHeight * 0.57);
  ctx.lineTo(plaqueHeight * 0.31, crownY);
  ctx.lineTo(0, crownY + plaqueHeight * 0.22);
  ctx.lineTo(-plaqueHeight * 0.31, crownY);
  ctx.closePath();
  ctx.fillStyle = goldGradient(ctx, -plaqueHeight, crownY, plaqueHeight, crownY);
  ctx.fill();
  ctx.strokeStyle = '#491a03';
  ctx.lineWidth = Math.max(0.9, 1.3 * scale);
  ctx.stroke();
  drawGem(ctx, 0, crownY - plaqueHeight * 0.08, plaqueHeight * 0.13, scale);

  ctx.font = `900 ${Math.max(22, plaqueHeight * 0.56)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff0b8';
  ctx.strokeStyle = '#1b0802';
  ctx.lineWidth = Math.max(1.2, 1.8 * scale);
  ctx.strokeText(label, 0, scale);
  ctx.fillText(label, 0, scale);
  ctx.restore();
}

function drawBitmap(logicalSize, dpr, appliedZoom) {
  const canvas = createOverlay();
  const backingSize = Math.max(1, Math.round(logicalSize * dpr));
  if (canvas.width !== backingSize) canvas.width = backingSize;
  if (canvas.height !== backingSize) canvas.height = backingSize;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return false;

  const cx = logicalSize / 2;
  const cy = logicalSize / 2;
  const half = logicalSize / 2;
  const scale = Math.max(0.65, Number(appliedZoom) || 1);
  const baseReservedMargin = Math.min(half * 0.205, Math.max(108, 128 * scale));
  const baseInner = half - baseReservedMargin + Math.max(2, 2.5 * scale);
  const outer = half - Math.max(3.5, 4.5 * scale);
  const baseFrameWidth = outer - baseInner;
  const frameWidth = Math.min(
    outer - Math.max(34, 38 * scale),
    baseFrameWidth * 2.0,
  );
  const inner = outer - frameWidth;
  if (!(frameWidth > Math.max(70, 78 * scale))) return false;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, logicalSize, logicalSize);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.setLineDash([]);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const body = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
  body.addColorStop(0, '#4d1d04');
  body.addColorStop(0.055, '#d47d1b');
  body.addColorStop(0.11, '#ffe49d');
  body.addColorStop(0.17, '#8b430d');
  body.addColorStop(0.24, '#15100d');
  body.addColorStop(0.36, '#030405');
  body.addColorStop(0.66, '#07080a');
  body.addColorStop(0.77, '#24140b');
  body.addColorStop(0.85, '#8d450e');
  body.addColorStop(0.92, '#ffd77c');
  body.addColorStop(0.97, '#a85a15');
  body.addColorStop(1, '#321003');
  fillAnnulus(ctx, cx, cy, inner, outer, body);

  const silverInner = inner + frameWidth * 0.205;
  const silverOuter = inner + frameWidth * 0.355;
  const silverWidth = silverOuter - silverInner;
  const silver = ctx.createRadialGradient(cx, cy, silverInner, cx, cy, silverOuter);
  silver.addColorStop(0, '#26343d');
  silver.addColorStop(0.08, '#778a95');
  silver.addColorStop(0.18, '#eefaff');
  silver.addColorStop(0.30, '#9baab2');
  silver.addColorStop(0.43, '#ffffff');
  silver.addColorStop(0.56, '#bcc8ce');
  silver.addColorStop(0.70, '#faffff');
  silver.addColorStop(0.84, '#71838d');
  silver.addColorStop(1, '#33434c');
  fillAnnulus(ctx, cx, cy, silverInner, silverOuter, silver);
  strokeCircle(ctx, cx, cy, silverInner, 'rgba(28,39,47,0.98)', Math.max(1.2, silverWidth * 0.055));
  strokeCircle(ctx, cx, cy, silverInner + silverWidth * 0.20, 'rgba(245,253,255,0.96)', Math.max(0.9, silverWidth * 0.042));
  strokeCircle(ctx, cx, cy, silverInner + silverWidth * 0.52, 'rgba(255,255,255,0.78)', Math.max(0.8, silverWidth * 0.026));
  strokeCircle(ctx, cx, cy, silverOuter - silverWidth * 0.16, 'rgba(240,251,255,0.94)', Math.max(0.9, silverWidth * 0.040));
  strokeCircle(ctx, cx, cy, silverOuter, 'rgba(39,52,60,0.98)', Math.max(1.2, silverWidth * 0.055));

  [
    [0.018, '#240700', 3.8],
    [0.065, '#d98a24', 5.4],
    [0.105, '#ffe49d', 1.8],
    [0.18, '#6d2a06', 2.6],
    [0.39, '#fff0ae', 1.2],
    [0.67, '#5a2104', 2.6],
    [0.75, '#d77e1c', 4.0],
    [0.82, '#ffe49e', 1.3],
    [0.91, '#df9027', 5.6],
    [0.975, '#220600', 3.8],
  ].forEach(([ratio, color, width]) => {
    strokeCircle(
      ctx,
      cx,
      cy,
      inner + frameWidth * ratio,
      color,
      Math.max(0.9, width * scale),
    );
  });

  const ornamentRadius = inner + frameWidth * 0.60;
  [30, 60, 120, 150, 210, 240, 300, 330].forEach((angle) => {
    drawDiamond(ctx, cx, cy, ornamentRadius, angle, scale, false);
  });
  [45, 135, 225, 315].forEach((angle) => {
    drawDiamond(ctx, cx, cy, ornamentRadius, angle, scale, true);
  });
  [[0, '360°'], [90, '90°'], [180, '180°'], [270, '270°']].forEach(([angle, label]) => {
    drawCardinal(ctx, cx, cy, ornamentRadius, angle, label, frameWidth, scale);
  });

  bitmapRedrawCount += 1;
  canvas.dataset.gannzillaStableExternalFrameBuild = String(BUILD);
  canvas.dataset.gannzillaStableExternalFrameThickness = '2.0';
  canvas.dataset.gannzillaStableExternalFrameSilverAuthority = 'same-overlay-bitmap';
  return true;
}

function rectSample(rect) {
  return [rect.left, rect.top, rect.width, rect.height]
    .map((value) => Math.round(value * 2) / 2)
    .join(':');
}

function observeWheel(nextWheel) {
  resizeObserver?.disconnect();
  wheelObserver?.disconnect();
  resizeObserver = null;
  wheelObserver = null;

  if (typeof ResizeObserver === 'function') {
    resizeObserver = new ResizeObserver(() => schedule('wheel-resize'));
    resizeObserver.observe(nextWheel);
  }

  if (typeof MutationObserver === 'function') {
    wheelObserver = new MutationObserver(() => schedule('wheel-attribute-change'));
    wheelObserver.observe(nextWheel, {
      attributes: true,
      attributeFilter: ['style', 'class', 'width', 'height'],
    });
  }
}

function sync(source = 'sync') {
  pendingFrame = 0;
  if (!enabled()) return false;

  const nextWheel = findWheel();
  if (!isWheelCanvas(nextWheel)) return false;

  if (wheel !== nextWheel) {
    wheel = nextWheel;
    stableSample = null;
    stableSampleCount = 0;
    observeWheel(wheel);
  }

  const rect = wheel.getBoundingClientRect();
  if (!(rect.width > 300) || !(rect.height > 300)) return false;

  const sample = rectSample(rect);
  if (sample === stableSample) stableSampleCount += 1;
  else {
    stableSample = sample;
    stableSampleCount = 1;
  }

  const frameCanvas = createOverlay();
  const size = Math.min(rect.width, rect.height);
  const left = rect.left + (rect.width - size) / 2;
  const top = rect.top + (rect.height - size) / 2;

  frameCanvas.style.setProperty('display', 'block', 'important');
  frameCanvas.style.setProperty('left', `${left}px`, 'important');
  frameCanvas.style.setProperty('top', `${top}px`, 'important');
  frameCanvas.style.setProperty('width', `${size}px`, 'important');
  frameCanvas.style.setProperty('height', `${size}px`, 'important');
  positionUpdateCount += 1;

  const logicalSize = Number(wheel.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518)
    || Number(wheel.dataset.gannzillaCanvasCssSize)
    || size;
  const dpr = Math.max(
    1,
    Number(wheel.dataset.gannzillaNativeDpr)
      || (logicalSize > 0 ? wheel.width / logicalSize : 0)
      || Number(window.devicePixelRatio)
      || 1,
  );
  const appliedZoom = Math.max(0.5, Number(wheel.dataset.gannzillaAppliedZoom) || 1);
  const nextBitmapKey = [
    Math.round(logicalSize * 100) / 100,
    Math.round(dpr * 1000) / 1000,
    Math.round(appliedZoom * 1000) / 1000,
  ].join(':');

  if (stableSampleCount >= 2 && nextBitmapKey !== bitmapKey) {
    if (drawBitmap(logicalSize, dpr, appliedZoom)) bitmapKey = nextBitmapKey;
  }

  lastApply = {
    source,
    build: BUILD,
    overlayMode: 'dedicated-persistent-canvas',
    thicknessMultiplier: 2.0,
    stableSampleCount,
    bitmapKey,
    bitmapRedrawCount,
    positionUpdateCount,
    left,
    top,
    displayedSize: size,
    logicalSize,
    dpr,
    appliedZoom,
    competingCanvasRedraws: false,
    recurringRedrawTimer: false,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule') {
  if (pendingFrame) window.cancelAnimationFrame(pendingFrame);
  pendingFrame = window.requestAnimationFrame(() => {
    sync(source);
    window.requestAnimationFrame(() => sync(`${source}-stable-sample`));
  });
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || window[STATE_KEY]) return;

  createOverlay();

  [
    'resize',
    'scroll',
    'wheel',
    'pointerdown',
    'pointermove',
    'pointerup',
    'pointercancel',
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:wheel-ivory-champagne-final-authority-v682',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:wheel-input-v459',
    'gannzilla:page-scrollbar-pan-v305',
    'gannzilla:layout-panel-visibility-change',
  ].forEach((eventName) => {
    window.addEventListener(eventName, () => schedule(eventName), true);
  });

  document.addEventListener('visibilitychange', () => schedule('visibilitychange'), false);

  if (typeof MutationObserver === 'function') {
    documentObserver = new MutationObserver(() => {
      const nextWheel = findWheel();
      if (nextWheel !== wheel) schedule('wheel-dom-replacement');
    });
    documentObserver.observe(document.documentElement, { childList: true, subtree: true });
  }

  [0, 80, 220, 520, 1100, 2200, 4200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  window.GANNZILLA_STABLE_EXTERNAL_FRAME_V731 = true;
  window.__auditGannzillaStableExternalFrameV731 = () => ({
    ok: enabled()
      && wheel instanceof HTMLCanvasElement
      && overlay instanceof HTMLCanvasElement
      && overlay.isConnected
      && overlay.style.display !== 'none'
      && overlay.dataset.gannzillaStableExternalFrameThickness === '2.0'
      && bitmapRedrawCount > 0,
    build: BUILD,
    enabled: enabled(),
    overlayMode: 'dedicated-persistent-canvas',
    thicknessMultiplier: 2.0,
    silverAuthority: 'same-overlay-bitmap',
    nativeWheelCanvasModified: false,
    competingCanvasRedraws: false,
    recurringRedrawTimer: false,
    overlayConnected: Boolean(overlay?.isConnected),
    bitmapRedrawCount,
    positionUpdateCount,
    lastApply,
  });

  window[STATE_KEY] = {
    sync,
    schedule,
    get wheel() { return wheel; },
    get overlay() { return overlay; },
  };

  schedule('install');
}

install();
