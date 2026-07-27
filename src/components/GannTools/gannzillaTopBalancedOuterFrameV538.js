const BUILD = 538;
const STATE_KEY = '__gannzillaTopBalancedOuterFrameV538';
const TWO_PI = Math.PI * 2;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function boolParam(name, fallback = true) {
  const query = params();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

function findWheel() {
  const canvas = document.querySelector('canvas[data-gannzilla-empty-outer-ring-v518="true"]');
  return canvas instanceof HTMLCanvasElement && !canvas.closest('aside') ? canvas : null;
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
  ctx.arc(cx, cy, outer, 0, TWO_PI);
  ctx.arc(cx, cy, Math.max(1, inner), TWO_PI, 0, true);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function drawOutwardShadow(ctx, cx, cy, outerEdge, spread, opacity) {
  const gradient = ctx.createRadialGradient(cx, cy, outerEdge, cx, cy, outerEdge + spread);
  gradient.addColorStop(0, `rgba(44, 13, 3, ${opacity})`);
  gradient.addColorStop(0.24, `rgba(55, 18, 5, ${opacity * 0.70})`);
  gradient.addColorStop(0.58, `rgba(66, 24, 8, ${opacity * 0.30})`);
  gradient.addColorStop(1, 'rgba(66, 24, 8, 0)');
  fillAnnulus(ctx, cx, cy, outerEdge - 0.5, outerEdge + spread, gradient);
}

function drawCopperBody(ctx, cx, cy, innerEdge, width, shadowSpread, shadowOpacity) {
  const outerEdge = innerEdge + width;
  drawOutwardShadow(ctx, cx, cy, outerEdge, shadowSpread, shadowOpacity);

  const gradient = ctx.createRadialGradient(cx, cy, innerEdge, cx, cy, outerEdge);
  gradient.addColorStop(0, '#3a1004');
  gradient.addColorStop(0.07, '#541b07');
  gradient.addColorStop(0.18, '#7d2e10');
  gradient.addColorStop(0.36, '#ad5221');
  gradient.addColorStop(0.54, '#d9793b');
  gradient.addColorStop(0.68, '#f2aa6d');
  gradient.addColorStop(0.81, '#ffd5ad');
  gradient.addColorStop(0.91, '#ec8e4e');
  gradient.addColorStop(1, '#682309');

  ctx.save();
  ctx.shadowColor = 'rgba(51, 14, 3, 0.66)';
  ctx.shadowBlur = width * 0.48;
  ctx.shadowOffsetY = width * 0.08;
  fillAnnulus(ctx, cx, cy, innerEdge, outerEdge, gradient);
  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx, cy, innerEdge + Math.max(1.8, width * 0.065), 0, TWO_PI);
  ctx.strokeStyle = 'rgba(43, 10, 2, 0.98)';
  ctx.lineWidth = Math.max(1.6, width * 0.085);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, innerEdge + width * 0.24, 0, TWO_PI);
  ctx.strokeStyle = 'rgba(255, 174, 110, 0.56)';
  ctx.lineWidth = Math.max(1.2, width * 0.055);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, outerEdge - Math.max(2, width * 0.075), 0, TWO_PI);
  ctx.strokeStyle = 'rgba(255, 225, 198, 0.96)';
  ctx.lineWidth = Math.max(1.5, width * 0.075);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, outerEdge, 0, TWO_PI);
  ctx.strokeStyle = 'rgba(78, 21, 5, 0.99)';
  ctx.lineWidth = Math.max(1.4, width * 0.055);
  ctx.stroke();
}

function arcGradient(ctx, cx, radius, stops) {
  const gradient = ctx.createLinearGradient(cx - radius, 0, cx + radius, 0);
  stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
  return gradient;
}

function drawLightArc(ctx, cx, cy, radius, start, end, width, blur, gradient, shadowColor) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = blur;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, start, end);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.restore();
}

function drawBalancedTopShine(ctx, cx, cy, innerEdge, frameWidth) {
  const start = (182 * Math.PI) / 180;
  const end = (358 * Math.PI) / 180;
  const shineRadius = innerEdge + frameWidth * 0.61;

  drawLightArc(ctx, cx, cy, shineRadius, start, end,
    frameWidth * 0.90, frameWidth * 1.08,
    arcGradient(ctx, cx, shineRadius, [
      [0, 'rgba(255,148,68,0)'],
      [0.05, 'rgba(255,169,88,0.24)'],
      [0.17, 'rgba(255,211,157,0.68)'],
      [0.32, 'rgba(255,245,217,0.96)'],
      [0.50, 'rgba(255,255,242,1)'],
      [0.68, 'rgba(255,255,246,1)'],
      [0.84, 'rgba(255,220,170,0.76)'],
      [0.96, 'rgba(255,165,80,0.26)'],
      [1, 'rgba(255,148,68,0)'],
    ]),
    'rgba(255, 225, 191, 0.98)');

  drawLightArc(ctx, cx, cy, shineRadius, start + 0.018, end - 0.018,
    frameWidth * 0.53, frameWidth * 0.58,
    arcGradient(ctx, cx, shineRadius, [
      [0, 'rgba(255,255,255,0)'],
      [0.07, 'rgba(255,227,198,0.50)'],
      [0.22, 'rgba(255,248,231,0.96)'],
      [0.42, 'rgba(255,255,255,1)'],
      [0.66, 'rgba(255,255,255,1)'],
      [0.84, 'rgba(255,240,219,0.82)'],
      [1, 'rgba(255,255,255,0)'],
    ]),
    'rgba(255, 246, 232, 1)');

  drawLightArc(ctx, cx, cy, shineRadius + frameWidth * 0.012,
    start + 0.045, end - 0.045,
    frameWidth * 0.17, frameWidth * 0.20,
    arcGradient(ctx, cx, shineRadius, [
      [0, 'rgba(255,255,255,0)'],
      [0.10, 'rgba(255,255,250,0.62)'],
      [0.27, 'rgba(255,255,255,0.99)'],
      [0.50, 'rgba(255,255,255,1)'],
      [0.75, 'rgba(255,255,255,0.99)'],
      [0.92, 'rgba(255,247,227,0.52)'],
      [1, 'rgba(255,255,255,0)'],
    ]),
    'rgba(255, 255, 255, 1)');
}

function drawSparkle(ctx, x, y, size) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  const glow = ctx.createRadialGradient(x, y, 0, x, y, size);
  glow.addColorStop(0, 'rgba(255,255,255,1)');
  glow.addColorStop(0.09, 'rgba(255,255,248,1)');
  glow.addColorStop(0.28, 'rgba(255,227,187,0.80)');
  glow.addColorStop(0.60, 'rgba(255,157,72,0.36)');
  glow.addColorStop(1, 'rgba(255,157,72,0)');
  ctx.beginPath();
  ctx.arc(x, y, size, 0, TWO_PI);
  ctx.fillStyle = glow;
  ctx.fill();

  ctx.translate(x, y);
  ctx.strokeStyle = '#ffffff';
  ctx.shadowColor = 'rgba(255,231,194,1)';
  ctx.shadowBlur = size * 0.78;
  ctx.lineCap = 'round';

  const longRay = size * 1.24;
  const diagonal = size * 0.84;
  [
    [-longRay, 0, longRay, 0, size * 0.075],
    [0, -longRay, 0, longRay, size * 0.075],
    [-diagonal, -diagonal, diagonal, diagonal, size * 0.043],
    [-diagonal, diagonal, diagonal, -diagonal, size * 0.043],
  ].forEach(([x1, y1, x2, y2, lineWidth]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = Math.max(1, lineWidth);
    ctx.stroke();
  });

  ctx.beginPath();
  ctx.arc(0, 0, Math.max(3.2, size * 0.17), 0, TWO_PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('gannzillaAngleInnerFrameStrokeWidth', '10');
    url.searchParams.set('gannzillaAngleOuterFrameStrokeWidth', '40');
    url.searchParams.set('gannzillaAngleOuterFrameOutwardOnly', 'true');
    url.searchParams.set('gannzillaAngleTopBalancedFrame', 'true');
    url.searchParams.set('gannzillaAngleTopBalancedShine', 'true');
    url.searchParams.set('gannzillaAngleTopBalancedSparkle', 'true');
    url.searchParams.set('gannzillaAngleTopBalancedSparkleSize', '44');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime rendering remains authoritative.
  }
}

let applyCount = 0;
let lastApply = null;
let frame = 0;
let timer = 0;
let redrawGeneration = 0;

function drawTopBalancedOuterFrame(source = 'apply') {
  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement)
      || canvas.dataset.gannzillaMetallicAngleOuterRingV531 !== 'true'
      || !boolParam('gannzillaAngleTopBalancedFrame', true)) return false;

  const baseCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingBaseCssSizeV518 || 0);
  const expandedCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518 || 0);
  const ringWidth = Number(canvas.dataset.gannzillaEmptyOuterRingWidthV518 || 0);
  const dpr = Math.max(1, Number(canvas.dataset.gannzillaNativeDpr)
    || (expandedCssSize > 0 ? canvas.width / expandedCssSize : 0)
    || Number(window.devicePixelRatio)
    || 1);
  const appliedZoom = Math.max(0.5, Number(canvas.dataset.gannzillaAppliedZoom) || 1);

  if (!(baseCssSize > 0) || !(expandedCssSize > 0) || !(ringWidth > 0)) return false;

  const ringScale = numberParam('gannzillaAngleRingScale', 2, 1.7, 2);
  const baseFrameCssWidth = numberParam('gannzillaAngleFrameStrokeWidth', 5.6, 3, 12);
  const outerFrameCssWidth = numberParam('gannzillaAngleOuterFrameStrokeWidth', 40, 40, 48);
  const outerFrameWidth = outerFrameCssWidth * appliedZoom;
  const baseFrameWidth = baseFrameCssWidth * appliedZoom;
  const shadowSpread = numberParam('gannzillaAngleOuterShadowSpread', 22, 0, 42) * appliedZoom;
  const shadowOpacity = numberParam('gannzillaAngleOuterShadowOpacity', 0.48, 0, 0.9);
  const sparkleSize = numberParam('gannzillaAngleTopBalancedSparkleSize', 44, 24, 64) * appliedZoom;
  const sparkleAngle = numberParam('gannzillaAngleSparkleAngle', 34, -180, 180);

  const cx = expandedCssSize / 2;
  const cy = expandedCssSize / 2;
  const margin = 90 * appliedZoom;
  const baseOuter = Math.max(1, (baseCssSize - margin * 2) / 2);
  const originalInnerRadius = baseOuter + ringWidth * 2;
  const originalOuterRadius = originalInnerRadius + ringWidth * ringScale;

  // The approved inner edge remains fixed. All 40px are painted outward from it.
  const approvedInnerEdge = Number(canvas.dataset.gannzillaReferenceOuterFrameInnerEdgeV537)
    || (originalOuterRadius - baseFrameWidth / 2);
  const outerEdge = approvedInnerEdge + outerFrameWidth;

  const renderKey = [
    canvas.width, canvas.height, baseCssSize, expandedCssSize, ringWidth, ringScale,
    baseFrameCssWidth, outerFrameCssWidth, shadowSpread, shadowOpacity,
    sparkleSize, sparkleAngle, appliedZoom, redrawGeneration,
  ].join(':');
  if (canvas.dataset.gannzillaTopBalancedOuterFrameRenderKeyV538 === renderKey) return true;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return false;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.setLineDash([]);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  drawCopperBody(ctx, cx, cy, approvedInnerEdge, outerFrameWidth, shadowSpread, shadowOpacity);
  drawBalancedTopShine(ctx, cx, cy, approvedInnerEdge, outerFrameWidth);

  const sparklePoint = polar(cx, cy, approvedInnerEdge + outerFrameWidth * 0.70, sparkleAngle);
  drawSparkle(ctx, sparklePoint.x, sparklePoint.y, sparkleSize);
  ctx.restore();

  canvas.dataset.gannzillaTopBalancedOuterFrameV538 = 'true';
  canvas.dataset.gannzillaTopBalancedOuterFrameRenderKeyV538 = renderKey;
  canvas.dataset.gannzillaTopBalancedOuterFrameWidthV538 = String(outerFrameCssWidth);
  canvas.dataset.gannzillaTopBalancedOuterFrameOutwardOnlyV538 = 'true';
  canvas.dataset.gannzillaTopBalancedOuterFrameInnerEdgeV538 = String(approvedInnerEdge);
  canvas.dataset.gannzillaTopBalancedOuterFrameOuterEdgeV538 = String(outerEdge);
  canvas.dataset.gannzillaTopBalancedShineV538 = 'true';
  canvas.dataset.gannzillaTopBalancedSparkleV538 = 'true';
  canvas.dataset.gannzillaTopBalancedSparkleSizeV538 = String(sparkleSize / appliedZoom);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    outerFrameStrokeWidth: outerFrameCssWidth,
    innerFrameStrokeWidth: 10,
    inwardGrowth: 0,
    outwardGrowth: outerFrameCssWidth - baseFrameCssWidth,
    outwardOnly: true,
    topBalanced: true,
    shineLayers: 3,
    sparkleSize: sparkleSize / appliedZoom,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:top-balanced-outer-frame-v538', { detail: lastApply }));
  return true;
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => drawTopBalancedOuterFrame(source));
  }, delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !wheelMode()
      || window[STATE_KEY]) return;

  persistFlags();

  [
    'gannzilla:reference-outer-frame-v537',
    'gannzilla:outer-metallic-band-v536',
    'gannzilla:metallic-angle-outer-ring-v531',
  ].forEach((eventName) => window.addEventListener(eventName, () => {
    redrawGeneration += 1;
    schedule(eventName, 0);
  }, false));

  window.addEventListener('resize', () => {
    redrawGeneration += 1;
    schedule('resize', 20);
  }, false);

  [240, 600, 1400, 3000, 6000, 9600].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  window.GANNZILLA_TOP_BALANCED_OUTER_FRAME_V538 = true;
  window.__auditGannzillaTopBalancedOuterFrameV538 = () => {
    const canvas = findWheel();
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaTopBalancedOuterFrameV538 === 'true'
        && Number(canvas.dataset.gannzillaTopBalancedOuterFrameWidthV538) === 40
        && canvas.dataset.gannzillaTopBalancedOuterFrameOutwardOnlyV538 === 'true'
        && canvas.dataset.gannzillaTopBalancedShineV538 === 'true'
        && canvas.dataset.gannzillaTopBalancedSparkleV538 === 'true',
      build: BUILD,
      outerFrameStrokeWidth: Number(canvas?.dataset?.gannzillaTopBalancedOuterFrameWidthV538 || 0),
      outwardOnly: canvas?.dataset?.gannzillaTopBalancedOuterFrameOutwardOnlyV538 === 'true',
      sparkleSize: Number(canvas?.dataset?.gannzillaTopBalancedSparkleSizeV538 || 0),
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = {
    drawTopBalancedOuterFrame,
    schedule,
    get redrawGeneration() { return redrawGeneration; },
  };
}

install();