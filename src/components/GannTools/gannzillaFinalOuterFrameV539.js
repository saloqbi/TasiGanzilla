const BUILD = 539;
const STATE_KEY = '__gannzillaFinalOuterFrameV539';
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

function arcGradient(ctx, cx, radius, stops) {
  const gradient = ctx.createLinearGradient(cx - radius, 0, cx + radius, 0);
  stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
  return gradient;
}

function drawOutwardShadow(ctx, cx, cy, outerEdge, spread, opacity) {
  const gradient = ctx.createRadialGradient(cx, cy, outerEdge, cx, cy, outerEdge + spread);
  gradient.addColorStop(0, `rgba(48, 15, 4, ${opacity})`);
  gradient.addColorStop(0.30, `rgba(58, 20, 6, ${opacity * 0.64})`);
  gradient.addColorStop(0.62, `rgba(64, 23, 8, ${opacity * 0.25})`);
  gradient.addColorStop(1, 'rgba(64, 23, 8, 0)');
  fillAnnulus(ctx, cx, cy, outerEdge - 0.5, outerEdge + spread, gradient);
}

function drawCopperAnnulus(ctx, cx, cy, innerEdge, width, shadowSpread, shadowOpacity) {
  const outerEdge = innerEdge + width;
  drawOutwardShadow(ctx, cx, cy, outerEdge, shadowSpread, shadowOpacity);

  const gradient = ctx.createRadialGradient(cx, cy, innerEdge, cx, cy, outerEdge);
  gradient.addColorStop(0, '#321005');
  gradient.addColorStop(0.06, '#4a1707');
  gradient.addColorStop(0.16, '#71270d');
  gradient.addColorStop(0.34, '#a8481c');
  gradient.addColorStop(0.52, '#d36f34');
  gradient.addColorStop(0.66, '#f1a466');
  gradient.addColorStop(0.78, '#ffd0a4');
  gradient.addColorStop(0.88, '#f29a58');
  gradient.addColorStop(1, '#672309');
  fillAnnulus(ctx, cx, cy, innerEdge, outerEdge, gradient);

  ctx.beginPath();
  ctx.arc(cx, cy, innerEdge + Math.max(1.8, width * 0.07), 0, TWO_PI);
  ctx.strokeStyle = 'rgba(48, 12, 3, 0.98)';
  ctx.lineWidth = Math.max(1.5, width * 0.075);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, innerEdge + width * 0.30, 0, TWO_PI);
  ctx.strokeStyle = 'rgba(244, 143, 76, 0.60)';
  ctx.lineWidth = Math.max(1.1, width * 0.065);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, outerEdge - Math.max(2, width * 0.08), 0, TWO_PI);
  ctx.strokeStyle = 'rgba(255, 224, 198, 0.94)';
  ctx.lineWidth = Math.max(1.4, width * 0.065);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, outerEdge, 0, TWO_PI);
  ctx.strokeStyle = 'rgba(88, 27, 7, 0.99)';
  ctx.lineWidth = Math.max(1.3, width * 0.052);
  ctx.stroke();
}

function drawInnerFrame(ctx, cx, cy, radius, width) {
  const outer = radius + width;
  const gradient = ctx.createRadialGradient(cx, cy, radius, cx, cy, outer);
  gradient.addColorStop(0, '#431405');
  gradient.addColorStop(0.25, '#7f2d10');
  gradient.addColorStop(0.55, '#d17638');
  gradient.addColorStop(0.82, '#f5bc8b');
  gradient.addColorStop(1, '#6a250c');
  fillAnnulus(ctx, cx, cy, radius, outer, gradient);

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TWO_PI);
  ctx.strokeStyle = 'rgba(53, 14, 4, 0.98)';
  ctx.lineWidth = 1.25;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, outer, 0, TWO_PI);
  ctx.strokeStyle = 'rgba(122, 46, 17, 0.96)';
  ctx.lineWidth = 1.1;
  ctx.stroke();
}

function drawLightArc(ctx, cx, cy, radius, start, end, width, blur, gradient) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(255, 240, 220, 0.98)';
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
  const shineRadius = innerEdge + frameWidth * 0.64;

  drawLightArc(ctx, cx, cy, shineRadius, start, end,
    frameWidth * 0.78, frameWidth * 0.88,
    arcGradient(ctx, cx, shineRadius, [
      [0, 'rgba(255,152,72,0)'],
      [0.06, 'rgba(255,177,98,0.18)'],
      [0.18, 'rgba(255,215,163,0.60)'],
      [0.34, 'rgba(255,244,218,0.90)'],
      [0.52, 'rgba(255,255,244,0.98)'],
      [0.70, 'rgba(255,251,233,0.96)'],
      [0.86, 'rgba(255,211,158,0.62)'],
      [0.96, 'rgba(255,161,79,0.20)'],
      [1, 'rgba(255,161,79,0)'],
    ]));

  drawLightArc(ctx, cx, cy, shineRadius, start + 0.018, end - 0.018,
    frameWidth * 0.42, frameWidth * 0.44,
    arcGradient(ctx, cx, shineRadius, [
      [0, 'rgba(255,255,255,0)'],
      [0.08, 'rgba(255,228,201,0.42)'],
      [0.24, 'rgba(255,248,233,0.92)'],
      [0.44, 'rgba(255,255,255,0.99)'],
      [0.66, 'rgba(255,255,255,0.99)'],
      [0.84, 'rgba(255,236,211,0.72)'],
      [1, 'rgba(255,255,255,0)'],
    ]));

  drawLightArc(ctx, cx, cy, shineRadius + frameWidth * 0.01,
    start + 0.05, end - 0.05,
    frameWidth * 0.12, frameWidth * 0.13,
    arcGradient(ctx, cx, shineRadius, [
      [0, 'rgba(255,255,255,0)'],
      [0.12, 'rgba(255,255,250,0.52)'],
      [0.30, 'rgba(255,255,255,0.97)'],
      [0.52, 'rgba(255,255,255,1)'],
      [0.76, 'rgba(255,255,255,0.97)'],
      [0.92, 'rgba(255,247,228,0.44)'],
      [1, 'rgba(255,255,255,0)'],
    ]));
}

function drawSparkle(ctx, x, y, size) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  const glow = ctx.createRadialGradient(x, y, 0, x, y, size);
  glow.addColorStop(0, 'rgba(255,255,255,1)');
  glow.addColorStop(0.10, 'rgba(255,255,247,0.98)');
  glow.addColorStop(0.30, 'rgba(255,227,188,0.78)');
  glow.addColorStop(0.62, 'rgba(255,155,73,0.34)');
  glow.addColorStop(1, 'rgba(255,155,73,0)');
  ctx.beginPath();
  ctx.arc(x, y, size, 0, TWO_PI);
  ctx.fillStyle = glow;
  ctx.fill();

  ctx.translate(x, y);
  ctx.strokeStyle = '#ffffff';
  ctx.shadowColor = 'rgba(255,232,198,0.98)';
  ctx.shadowBlur = size * 0.70;
  ctx.lineCap = 'round';

  const longRay = size * 1.16;
  const diagonal = size * 0.80;
  [
    [-longRay, 0, longRay, 0, size * 0.07],
    [0, -longRay, 0, longRay, size * 0.07],
    [-diagonal, -diagonal, diagonal, diagonal, size * 0.04],
    [-diagonal, diagonal, diagonal, -diagonal, size * 0.04],
  ].forEach(([x1, y1, x2, y2, lineWidth]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = Math.max(1, lineWidth);
    ctx.stroke();
  });

  ctx.beginPath();
  ctx.arc(0, 0, Math.max(3, size * 0.16), 0, TWO_PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('emptyOuterRing', 'true');
    url.searchParams.set('emptyOuterRingCount', '5');
    url.searchParams.set('gannzillaAngleInnerFrameStrokeWidth', '10');
    url.searchParams.set('gannzillaAngleOuterFrameStrokeWidth', '40');
    url.searchParams.set('gannzillaAngleOuterFrameOutwardOnly', 'true');
    url.searchParams.set('gannzillaAngleFinalOuterFrame', 'true');
    url.searchParams.set('gannzillaAngleFinalTopShine', 'true');
    url.searchParams.set('gannzillaAngleFinalSparkle', 'true');
    url.searchParams.set('gannzillaAngleFinalSparkleSize', '44');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime drawing remains authoritative.
  }
}

let applyCount = 0;
let lastApply = null;
let frame = 0;
let timer = 0;
let redrawGeneration = 0;

function drawFinalOuterFrame(source = 'apply') {
  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement)
      || canvas.dataset.gannzillaMetallicAngleOuterRingV531 !== 'true'
      || !boolParam('gannzillaAngleFinalOuterFrame', true)) return false;

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
  const sparkleSizeCss = numberParam('gannzillaAngleFinalSparkleSize', 44, 24, 64);

  const baseFrameWidth = baseFrameCssWidth * appliedZoom;
  const innerFrameWidth = innerFrameCssWidth * appliedZoom;
  const outerFrameWidth = outerFrameCssWidth * appliedZoom;
  const shadowSpread = shadowSpreadCss * appliedZoom;
  const sparkleSize = sparkleSizeCss * appliedZoom;
  const sparkleAngle = numberParam('gannzillaAngleSparkleAngle', 34, -180, 180);

  const cx = expandedCssSize / 2;
  const cy = expandedCssSize / 2;
  const margin = 90 * appliedZoom;
  const baseOuter = Math.max(1, (baseCssSize - margin * 2) / 2);
  const angleInnerRadius = baseOuter + ringWidth * 2;
  const angleOuterRadius = angleInnerRadius + ringWidth * ringScale;

  // The exact inner boundary is retained. The 40px final frame grows only outward.
  const approvedOuterInnerEdge = angleOuterRadius - baseFrameWidth / 2;
  const approvedInnerFrameEdge = angleInnerRadius;
  const finalOuterEdge = approvedOuterInnerEdge + outerFrameWidth;

  const availableOuterPadding = (expandedCssSize / 2) - finalOuterEdge;
  if (availableOuterPadding < shadowSpread * 0.8) return false;

  const renderKey = [
    canvas.width, canvas.height, baseCssSize, expandedCssSize, ringWidth, ringScale,
    emptyRingCount, baseFrameCssWidth, innerFrameCssWidth, outerFrameCssWidth,
    shadowSpreadCss, shadowOpacity, sparkleSizeCss, sparkleAngle,
    appliedZoom, redrawGeneration,
  ].join(':');
  if (canvas.dataset.gannzillaFinalOuterFrameRenderKeyV539 === renderKey) return true;

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

  drawInnerFrame(ctx, cx, cy, approvedInnerFrameEdge, innerFrameWidth);
  drawCopperAnnulus(ctx, cx, cy, approvedOuterInnerEdge, outerFrameWidth, shadowSpread, shadowOpacity);
  drawTopShine(ctx, cx, cy, approvedOuterInnerEdge, outerFrameWidth);

  const sparklePoint = polar(cx, cy, approvedOuterInnerEdge + outerFrameWidth * 0.68, sparkleAngle);
  drawSparkle(ctx, sparklePoint.x, sparklePoint.y, sparkleSize);
  ctx.restore();

  canvas.dataset.gannzillaFinalOuterFrameV539 = 'true';
  canvas.dataset.gannzillaFinalOuterFrameRenderKeyV539 = renderKey;
  canvas.dataset.gannzillaFinalOuterFrameWidthV539 = String(outerFrameCssWidth);
  canvas.dataset.gannzillaFinalInnerFrameWidthV539 = String(innerFrameCssWidth);
  canvas.dataset.gannzillaFinalOuterFrameOutwardOnlyV539 = 'true';
  canvas.dataset.gannzillaFinalOuterFrameInnerEdgeV539 = String(approvedOuterInnerEdge);
  canvas.dataset.gannzillaFinalOuterFrameOuterEdgeV539 = String(finalOuterEdge);
  canvas.dataset.gannzillaFinalOuterPaddingV539 = String(availableOuterPadding);
  canvas.dataset.gannzillaFinalTopShineV539 = 'true';
  canvas.dataset.gannzillaFinalSparkleV539 = 'true';
  canvas.dataset.gannzillaFinalSparkleSizeV539 = String(sparkleSizeCss);

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

  window.dispatchEvent(new CustomEvent('gannzilla:final-outer-frame-v539', { detail: lastApply }));
  return true;
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => drawFinalOuterFrame(source));
  }, delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !wheelMode()
      || window[STATE_KEY]) return;

  persistFlags();

  ['gannzilla:metallic-angle-outer-ring-v531', 'gannzilla:weekdays-outer-ring-v523',
   'gannzilla:zodiac-outer-ring-v522', 'gannzilla:empty-outer-ring-v518']
    .forEach((eventName) => window.addEventListener(eventName, () => {
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

  window.GANNZILLA_FINAL_OUTER_FRAME_V539 = true;
  window.__auditGannzillaFinalOuterFrameV539 = () => {
    const canvas = findWheel();
    return {
      ok: canvas instanceof HTMLCanvasElement
        && Number(canvas.dataset.gannzillaEmptyOuterRingCountV518) >= 5
        && canvas.dataset.gannzillaFinalOuterFrameV539 === 'true'
        && Number(canvas.dataset.gannzillaFinalOuterFrameWidthV539) === 40
        && Number(canvas.dataset.gannzillaFinalInnerFrameWidthV539) === 10
        && canvas.dataset.gannzillaFinalOuterFrameOutwardOnlyV539 === 'true'
        && canvas.dataset.gannzillaFinalTopShineV539 === 'true'
        && canvas.dataset.gannzillaFinalSparkleV539 === 'true',
      build: BUILD,
      emptyRingCount: Number(canvas?.dataset?.gannzillaEmptyOuterRingCountV518 || 0),
      outerFrameStrokeWidth: Number(canvas?.dataset?.gannzillaFinalOuterFrameWidthV539 || 0),
      innerFrameStrokeWidth: Number(canvas?.dataset?.gannzillaFinalInnerFrameWidthV539 || 0),
      outwardOnly: canvas?.dataset?.gannzillaFinalOuterFrameOutwardOnlyV539 === 'true',
      availableOuterPadding: Number(canvas?.dataset?.gannzillaFinalOuterPaddingV539 || 0),
      sparkleSize: Number(canvas?.dataset?.gannzillaFinalSparkleSizeV539 || 0),
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = {
    drawFinalOuterFrame,
    schedule,
    get redrawGeneration() { return redrawGeneration; },
  };
}

install();