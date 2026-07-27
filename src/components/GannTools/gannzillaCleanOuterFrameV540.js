const BUILD = 540;
const STATE_KEY = '__gannzillaCleanOuterFrameV540';
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

function strokeCircle(ctx, cx, cy, radius, strokeStyle, lineWidth) {
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(1, radius), 0, TWO_PI);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

function drawOutwardShadow(ctx, cx, cy, outerEdge, spread, opacity) {
  if (!(spread > 0) || !(opacity > 0)) return;
  const gradient = ctx.createRadialGradient(cx, cy, outerEdge, cx, cy, outerEdge + spread);
  gradient.addColorStop(0, `rgba(45, 14, 4, ${opacity})`);
  gradient.addColorStop(0.25, `rgba(54, 18, 5, ${opacity * 0.66})`);
  gradient.addColorStop(0.56, `rgba(61, 22, 7, ${opacity * 0.28})`);
  gradient.addColorStop(1, 'rgba(61, 22, 7, 0)');
  fillAnnulus(ctx, cx, cy, outerEdge - 0.5, outerEdge + spread, gradient);
}

function drawInnerCopperFrame(ctx, cx, cy, boundaryRadius, width) {
  const inner = boundaryRadius - width;
  const outer = boundaryRadius;
  const gradient = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
  gradient.addColorStop(0, '#4a1606');
  gradient.addColorStop(0.20, '#7b2a0d');
  gradient.addColorStop(0.48, '#c15e27');
  gradient.addColorStop(0.72, '#f0a16a');
  gradient.addColorStop(0.88, '#ffd4b2');
  gradient.addColorStop(1, '#6c2209');
  fillAnnulus(ctx, cx, cy, inner, outer, gradient);
  strokeCircle(ctx, cx, cy, inner, 'rgba(67, 18, 4, 0.98)', Math.max(1.1, width * 0.12));
  strokeCircle(ctx, cx, cy, outer, 'rgba(115, 38, 10, 0.98)', Math.max(1.0, width * 0.10));
  strokeCircle(ctx, cx, cy, inner + width * 0.72, 'rgba(255, 220, 193, 0.78)', Math.max(0.8, width * 0.075));
}

function drawOuterCopperFrame(ctx, cx, cy, innerEdge, width, shadowSpread, shadowOpacity) {
  const outerEdge = innerEdge + width;
  drawOutwardShadow(ctx, cx, cy, outerEdge, shadowSpread, shadowOpacity);

  const gradient = ctx.createRadialGradient(cx, cy, innerEdge, cx, cy, outerEdge);
  gradient.addColorStop(0, '#351005');
  gradient.addColorStop(0.065, '#501a07');
  gradient.addColorStop(0.17, '#792c0f');
  gradient.addColorStop(0.34, '#aa4c1e');
  gradient.addColorStop(0.53, '#d87537');
  gradient.addColorStop(0.68, '#f2a36a');
  gradient.addColorStop(0.79, '#ffd0aa');
  gradient.addColorStop(0.88, '#f18f50');
  gradient.addColorStop(0.96, '#b34d1d');
  gradient.addColorStop(1, '#5d1d08');

  ctx.save();
  ctx.shadowColor = `rgba(55, 17, 4, ${Math.min(0.72, shadowOpacity + 0.08)})`;
  ctx.shadowBlur = width * 0.34;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = width * 0.055;
  fillAnnulus(ctx, cx, cy, innerEdge, outerEdge, gradient);
  ctx.restore();

  strokeCircle(ctx, cx, cy, innerEdge, 'rgba(48, 13, 3, 0.99)', Math.max(1.6, width * 0.075));
  strokeCircle(ctx, cx, cy, innerEdge + width * 0.13, 'rgba(102, 31, 8, 0.96)', Math.max(1.0, width * 0.05));
  strokeCircle(ctx, cx, cy, outerEdge - width * 0.10, 'rgba(255, 222, 197, 0.90)', Math.max(1.3, width * 0.065));
  strokeCircle(ctx, cx, cy, outerEdge, 'rgba(84, 24, 6, 0.99)', Math.max(1.4, width * 0.055));
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

function drawTopShine(ctx, cx, cy, innerEdge, frameWidth) {
  const start = (184 * Math.PI) / 180;
  const end = (356 * Math.PI) / 180;
  const radius = innerEdge + frameWidth * 0.63;

  drawLightArc(
    ctx, cx, cy, radius, start, end,
    frameWidth * 0.82,
    frameWidth * 0.72,
    arcGradient(ctx, cx, radius, [
      [0, 'rgba(255,150,72,0)'],
      [0.07, 'rgba(255,175,98,0.20)'],
      [0.18, 'rgba(255,215,165,0.55)'],
      [0.34, 'rgba(255,245,220,0.86)'],
      [0.52, 'rgba(255,255,244,0.96)'],
      [0.70, 'rgba(255,252,236,0.92)'],
      [0.86, 'rgba(255,214,162,0.60)'],
      [0.96, 'rgba(255,164,82,0.20)'],
      [1, 'rgba(255,164,82,0)'],
    ]),
    'rgba(255, 227, 197, 0.92)',
  );

  drawLightArc(
    ctx, cx, cy, radius, start + 0.018, end - 0.018,
    frameWidth * 0.42,
    frameWidth * 0.34,
    arcGradient(ctx, cx, radius, [
      [0, 'rgba(255,255,255,0)'],
      [0.09, 'rgba(255,230,205,0.40)'],
      [0.25, 'rgba(255,249,235,0.86)'],
      [0.44, 'rgba(255,255,255,0.98)'],
      [0.66, 'rgba(255,255,255,1)'],
      [0.84, 'rgba(255,237,213,0.70)'],
      [1, 'rgba(255,255,255,0)'],
    ]),
    'rgba(255, 243, 226, 0.98)',
  );

  drawLightArc(
    ctx, cx, cy, radius + frameWidth * 0.012, start + 0.05, end - 0.05,
    frameWidth * 0.115,
    frameWidth * 0.10,
    arcGradient(ctx, cx, radius, [
      [0, 'rgba(255,255,255,0)'],
      [0.14, 'rgba(255,255,250,0.46)'],
      [0.30, 'rgba(255,255,255,0.92)'],
      [0.52, 'rgba(255,255,255,1)'],
      [0.75, 'rgba(255,255,255,0.96)'],
      [0.92, 'rgba(255,245,226,0.40)'],
      [1, 'rgba(255,255,255,0)'],
    ]),
    'rgba(255, 255, 248, 1)',
  );
}

function drawSparkle(ctx, x, y, size) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  const glow = ctx.createRadialGradient(x, y, 0, x, y, size);
  glow.addColorStop(0, 'rgba(255,255,255,1)');
  glow.addColorStop(0.10, 'rgba(255,255,246,0.98)');
  glow.addColorStop(0.30, 'rgba(255,226,185,0.76)');
  glow.addColorStop(0.62, 'rgba(255,153,72,0.32)');
  glow.addColorStop(1, 'rgba(255,153,72,0)');
  ctx.beginPath();
  ctx.arc(x, y, size, 0, TWO_PI);
  ctx.fillStyle = glow;
  ctx.fill();

  ctx.translate(x, y);
  ctx.strokeStyle = '#ffffff';
  ctx.shadowColor = 'rgba(255,231,196,0.98)';
  ctx.shadowBlur = size * 0.70;
  ctx.lineCap = 'round';

  const longRay = size * 1.18;
  const diagonal = size * 0.80;
  [
    [-longRay, 0, longRay, 0, size * 0.070],
    [0, -longRay, 0, longRay, size * 0.070],
    [-diagonal, -diagonal, diagonal, diagonal, size * 0.040],
    [-diagonal, diagonal, diagonal, -diagonal, size * 0.040],
  ].forEach(([x1, y1, x2, y2, lineWidth]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = Math.max(1, lineWidth);
    ctx.stroke();
  });

  ctx.beginPath();
  ctx.arc(0, 0, Math.max(3, size * 0.17), 0, TWO_PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('emptyOuterRing', 'true');
    url.searchParams.set('emptyOuterRingCount', '5');
    url.searchParams.set('emptyOuterRingNumbers', 'false');
    url.searchParams.set('angleOuterRing', 'true');
    url.searchParams.set('angleFrameCount', '1');
    url.searchParams.set('angleCardinalSpokes', 'false');
    url.searchParams.set('gannzillaAngleRingScale', '2');
    url.searchParams.set('gannzillaAngleFrameStrokeWidth', '5.6');
    url.searchParams.set('gannzillaAngleInnerFrameStrokeWidth', '10');
    url.searchParams.set('gannzillaAngleOuterFrameStrokeWidth', '40');
    url.searchParams.set('gannzillaAngleOuterFrameOutwardOnly', 'true');
    url.searchParams.set('gannzillaAngleCleanFrame', 'true');
    url.searchParams.set('gannzillaAngleOuterShadowSpread', '22');
    url.searchParams.set('gannzillaAngleOuterShadowOpacity', '0.48');
    url.searchParams.set('gannzillaAngleCleanSparkleSize', '44');
    url.searchParams.set('gannzillaAngleSparkleAngle', '34');
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

function drawCleanOuterFrame(source = 'apply') {
  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement)
      || canvas.dataset.gannzillaMetallicAngleOuterRingV531 !== 'true'
      || !boolParam('gannzillaAngleCleanFrame', true)) return false;

  const emptyRingCount = Number(canvas.dataset.gannzillaEmptyOuterRingCountV518 || 0);
  const baseCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingBaseCssSizeV518 || 0);
  const expandedCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518 || 0);
  const ringWidth = Number(canvas.dataset.gannzillaEmptyOuterRingWidthV518 || 0);
  const dpr = Math.max(1, Number(canvas.dataset.gannzillaNativeDpr)
    || (expandedCssSize > 0 ? canvas.width / expandedCssSize : 0)
    || Number(window.devicePixelRatio)
    || 1);
  const appliedZoom = Math.max(0.5, Number(canvas.dataset.gannzillaAppliedZoom) || 1);

  if (emptyRingCount < 5 || !(baseCssSize > 0) || !(expandedCssSize > 0) || !(ringWidth > 0)) return false;

  const ringScale = numberParam('gannzillaAngleRingScale', 2, 1.7, 2);
  const baseFrameCssWidth = numberParam('gannzillaAngleFrameStrokeWidth', 5.6, 3, 12);
  const innerFrameCssWidth = numberParam('gannzillaAngleInnerFrameStrokeWidth', 10, 5.6, 16);
  const outerFrameCssWidth = numberParam('gannzillaAngleOuterFrameStrokeWidth', 40, 36, 48);
  const shadowSpreadCss = numberParam('gannzillaAngleOuterShadowSpread', 22, 0, 42);
  const shadowOpacity = numberParam('gannzillaAngleOuterShadowOpacity', 0.48, 0, 0.9);
  const sparkleSizeCss = numberParam('gannzillaAngleCleanSparkleSize', 44, 24, 64);
  const sparkleAngle = numberParam('gannzillaAngleSparkleAngle', 34, -180, 180);

  const baseFrameWidth = baseFrameCssWidth * appliedZoom;
  const innerFrameWidth = innerFrameCssWidth * appliedZoom;
  const outerFrameWidth = outerFrameCssWidth * appliedZoom;
  const shadowSpread = shadowSpreadCss * appliedZoom;
  const sparkleSize = sparkleSizeCss * appliedZoom;

  const cx = expandedCssSize / 2;
  const cy = expandedCssSize / 2;
  const margin = 90 * appliedZoom;
  const baseOuter = Math.max(1, (baseCssSize - margin * 2) / 2);
  const angleInnerRadius = baseOuter + ringWidth * 2;
  const angleOuterRadius = angleInnerRadius + ringWidth * ringScale;

  // Cover the outward half of V531's original inner 5.6px line with clean white,
  // then rebuild the inner frame inward only and the outer frame outward only.
  const outerInnerEdge = angleOuterRadius - baseFrameWidth / 2;
  const finalOuterEdge = outerInnerEdge + outerFrameWidth;
  const availableOuterPadding = expandedCssSize / 2 - finalOuterEdge;
  if (availableOuterPadding < shadowSpread * 0.8) return false;

  const renderKey = [
    canvas.width, canvas.height, baseCssSize, expandedCssSize, ringWidth, ringScale,
    emptyRingCount, baseFrameCssWidth, innerFrameCssWidth, outerFrameCssWidth,
    shadowSpreadCss, shadowOpacity, sparkleSizeCss, sparkleAngle,
    appliedZoom, redrawGeneration,
  ].join(':');
  if (canvas.dataset.gannzillaCleanOuterFrameRenderKeyV540 === renderKey) return true;

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

  fillAnnulus(ctx, cx, cy, angleInnerRadius, angleInnerRadius + baseFrameWidth / 2 + 1, '#ffffff');
  drawInnerCopperFrame(ctx, cx, cy, angleInnerRadius, innerFrameWidth);
  drawOuterCopperFrame(ctx, cx, cy, outerInnerEdge, outerFrameWidth, shadowSpread, shadowOpacity);
  drawTopShine(ctx, cx, cy, outerInnerEdge, outerFrameWidth);

  const sparklePoint = polar(cx, cy, outerInnerEdge + outerFrameWidth * 0.68, sparkleAngle);
  drawSparkle(ctx, sparklePoint.x, sparklePoint.y, sparkleSize);
  ctx.restore();

  canvas.dataset.gannzillaCleanOuterFrameV540 = 'true';
  canvas.dataset.gannzillaCleanOuterFrameRenderKeyV540 = renderKey;
  canvas.dataset.gannzillaCleanOuterFrameWidthV540 = String(outerFrameCssWidth);
  canvas.dataset.gannzillaCleanInnerFrameWidthV540 = String(innerFrameCssWidth);
  canvas.dataset.gannzillaCleanOuterFrameOutwardOnlyV540 = 'true';
  canvas.dataset.gannzillaCleanOuterFrameInnerEdgeV540 = String(outerInnerEdge);
  canvas.dataset.gannzillaCleanOuterFrameOuterEdgeV540 = String(finalOuterEdge);
  canvas.dataset.gannzillaCleanOuterPaddingV540 = String(availableOuterPadding);
  canvas.dataset.gannzillaCleanTopShineV540 = 'true';
  canvas.dataset.gannzillaCleanSparkleV540 = 'true';
  canvas.dataset.gannzillaCleanSparkleSizeV540 = String(sparkleSizeCss);
  canvas.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    emptyRingCount,
    outerFrameStrokeWidth: outerFrameCssWidth,
    innerFrameStrokeWidth: innerFrameCssWidth,
    inwardGrowth: 0,
    outwardOnly: true,
    availableOuterPadding,
    shineLayers: 3,
    sparkleSize: sparkleSizeCss,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:clean-outer-frame-v540', { detail: lastApply }));
  return true;
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => drawCleanOuterFrame(source));
  }, delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !wheelMode()
      || window[STATE_KEY]) return;

  persistFlags();

  [
    'gannzilla:metallic-angle-outer-ring-v531',
    'gannzilla:weekdays-outer-ring-v523',
    'gannzilla:zodiac-outer-ring-v522',
    'gannzilla:empty-outer-ring-v518',
  ].forEach((eventName) => window.addEventListener(eventName, () => {
    redrawGeneration += 1;
    schedule(eventName, eventName.includes('empty-outer-ring') ? 90 : 35);
  }, false));

  window.addEventListener('resize', () => {
    redrawGeneration += 1;
    schedule('resize', 30);
  }, false);

  [180, 460, 950, 1800, 3200, 5600, 9000].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  window.GANNZILLA_CLEAN_OUTER_FRAME_V540 = true;
  window.__auditGannzillaCleanOuterFrameV540 = () => {
    const canvas = findWheel();
    return {
      ok: canvas instanceof HTMLCanvasElement
        && Number(canvas.dataset.gannzillaEmptyOuterRingCountV518) >= 5
        && canvas.dataset.gannzillaCleanOuterFrameV540 === 'true'
        && Number(canvas.dataset.gannzillaCleanOuterFrameWidthV540) === 40
        && Number(canvas.dataset.gannzillaCleanInnerFrameWidthV540) === 10
        && canvas.dataset.gannzillaCleanOuterFrameOutwardOnlyV540 === 'true'
        && canvas.dataset.gannzillaCleanTopShineV540 === 'true'
        && canvas.dataset.gannzillaCleanSparkleV540 === 'true',
      build: BUILD,
      emptyRingCount: Number(canvas?.dataset?.gannzillaEmptyOuterRingCountV518 || 0),
      outerFrameStrokeWidth: Number(canvas?.dataset?.gannzillaCleanOuterFrameWidthV540 || 0),
      innerFrameStrokeWidth: Number(canvas?.dataset?.gannzillaCleanInnerFrameWidthV540 || 0),
      outwardOnly: canvas?.dataset?.gannzillaCleanOuterFrameOutwardOnlyV540 === 'true',
      availableOuterPadding: Number(canvas?.dataset?.gannzillaCleanOuterPaddingV540 || 0),
      sparkleSize: Number(canvas?.dataset?.gannzillaCleanSparkleSizeV540 || 0),
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = {
    drawCleanOuterFrame,
    schedule,
    get redrawGeneration() { return redrawGeneration; },
  };
}

install();