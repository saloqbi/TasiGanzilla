const BUILD = 537;
const STATE_KEY = '__gannzillaReferenceOuterFrameV537';
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
  gradient.addColorStop(0, `rgba(45, 14, 4, ${opacity})`);
  gradient.addColorStop(0.26, `rgba(54, 18, 5, ${opacity * 0.68})`);
  gradient.addColorStop(0.58, `rgba(61, 22, 7, ${opacity * 0.28})`);
  gradient.addColorStop(1, 'rgba(61, 22, 7, 0)');
  fillAnnulus(ctx, cx, cy, outerEdge - 0.5, outerEdge + spread, gradient);
}

function drawCopperBody(ctx, cx, cy, radius, width, shadowSpread, shadowOpacity) {
  const half = width / 2;
  const innerEdge = radius - half;
  const outerEdge = radius + half;

  drawOutwardShadow(ctx, cx, cy, outerEdge, shadowSpread, shadowOpacity);

  const gradient = ctx.createRadialGradient(cx, cy, innerEdge, cx, cy, outerEdge);
  gradient.addColorStop(0, '#3b1205');
  gradient.addColorStop(0.07, '#551c08');
  gradient.addColorStop(0.18, '#7a2d10');
  gradient.addColorStop(0.36, '#a94f20');
  gradient.addColorStop(0.56, '#d67638');
  gradient.addColorStop(0.70, '#f0a76b');
  gradient.addColorStop(0.82, '#ffd1a8');
  gradient.addColorStop(0.91, '#e8894a');
  gradient.addColorStop(1, '#6b250c');

  ctx.save();
  ctx.shadowColor = 'rgba(55, 17, 4, 0.58)';
  ctx.shadowBlur = width * 0.42;
  ctx.shadowOffsetY = width * 0.08;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TWO_PI);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx, cy, innerEdge + Math.max(1.6, width * 0.075), 0, TWO_PI);
  ctx.strokeStyle = 'rgba(48, 13, 3, 0.98)';
  ctx.lineWidth = Math.max(1.4, width * 0.085);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, outerEdge - Math.max(1.8, width * 0.08), 0, TWO_PI);
  ctx.strokeStyle = 'rgba(255, 215, 183, 0.92)';
  ctx.lineWidth = Math.max(1.3, width * 0.07);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, outerEdge, 0, TWO_PI);
  ctx.strokeStyle = 'rgba(91, 28, 7, 0.98)';
  ctx.lineWidth = Math.max(1.2, width * 0.055);
  ctx.stroke();
}

function arcGradient(ctx, cx, radius, stops) {
  const gradient = ctx.createLinearGradient(cx - radius, 0, cx + radius, 0);
  stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
  return gradient;
}

function drawLightArc(ctx, cx, cy, radius, start, end, width, blur, gradient) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(255, 239, 219, 0.98)';
  ctx.shadowBlur = blur;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, start, end);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.restore();
}

function drawReferenceShine(ctx, cx, cy, innerEdge, frameWidth) {
  const start = (184 * Math.PI) / 180;
  const end = (356 * Math.PI) / 180;
  const shineRadius = innerEdge + frameWidth * 0.66;

  drawLightArc(ctx, cx, cy, shineRadius, start, end, frameWidth * 0.92, frameWidth * 1.05,
    arcGradient(ctx, cx, shineRadius, [
      [0, 'rgba(255,156,79,0)'],
      [0.06, 'rgba(255,178,101,0.20)'],
      [0.18, 'rgba(255,215,166,0.62)'],
      [0.34, 'rgba(255,246,222,0.92)'],
      [0.52, 'rgba(255,255,244,1)'],
      [0.70, 'rgba(255,252,236,0.98)'],
      [0.86, 'rgba(255,215,164,0.66)'],
      [0.96, 'rgba(255,164,84,0.22)'],
      [1, 'rgba(255,164,84,0)'],
    ]));

  drawLightArc(ctx, cx, cy, shineRadius, start + 0.018, end - 0.018, frameWidth * 0.54, frameWidth * 0.54,
    arcGradient(ctx, cx, shineRadius, [
      [0, 'rgba(255,255,255,0)'],
      [0.08, 'rgba(255,230,205,0.46)'],
      [0.24, 'rgba(255,250,235,0.94)'],
      [0.44, 'rgba(255,255,255,1)'],
      [0.66, 'rgba(255,255,255,1)'],
      [0.84, 'rgba(255,238,215,0.76)'],
      [1, 'rgba(255,255,255,0)'],
    ]));

  drawLightArc(ctx, cx, cy, shineRadius + frameWidth * 0.015, start + 0.045, end - 0.045,
    frameWidth * 0.18, frameWidth * 0.18,
    arcGradient(ctx, cx, shineRadius, [
      [0, 'rgba(255,255,255,0)'],
      [0.12, 'rgba(255,255,250,0.58)'],
      [0.28, 'rgba(255,255,255,0.98)'],
      [0.50, 'rgba(255,255,255,1)'],
      [0.74, 'rgba(255,255,255,0.98)'],
      [0.92, 'rgba(255,247,229,0.48)'],
      [1, 'rgba(255,255,255,0)'],
    ]));
}

function drawSparkle(ctx, x, y, size) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  const glow = ctx.createRadialGradient(x, y, 0, x, y, size);
  glow.addColorStop(0, 'rgba(255,255,255,1)');
  glow.addColorStop(0.10, 'rgba(255,255,246,0.98)');
  glow.addColorStop(0.30, 'rgba(255,225,184,0.76)');
  glow.addColorStop(0.62, 'rgba(255,153,72,0.34)');
  glow.addColorStop(1, 'rgba(255,153,72,0)');
  ctx.beginPath();
  ctx.arc(x, y, size, 0, TWO_PI);
  ctx.fillStyle = glow;
  ctx.fill();

  ctx.translate(x, y);
  ctx.strokeStyle = '#ffffff';
  ctx.shadowColor = 'rgba(255,231,196,0.98)';
  ctx.shadowBlur = size * 0.72;
  ctx.lineCap = 'round';

  const longRay = size * 1.20;
  const diagonal = size * 0.82;
  [
    [-longRay, 0, longRay, 0, size * 0.075],
    [0, -longRay, 0, longRay, size * 0.075],
    [-diagonal, -diagonal, diagonal, diagonal, size * 0.042],
    [-diagonal, diagonal, diagonal, -diagonal, size * 0.042],
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
    url.searchParams.set('gannzillaAngleInnerFrameStrokeWidth', '10');
    url.searchParams.set('gannzillaAngleOuterFrameStrokeWidth', '35');
    url.searchParams.set('gannzillaAngleOuterFrameOutwardOnly', 'true');
    url.searchParams.set('gannzillaAngleReferenceShine', 'true');
    url.searchParams.set('gannzillaAngleReferenceSparkle', 'true');
    url.searchParams.set('gannzillaAngleReferenceSparkleSize', '40');
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

function drawReferenceOuterFrame(source = 'apply') {
  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement)
      || canvas.dataset.gannzillaMetallicAngleOuterRingV531 !== 'true'
      || !boolParam('gannzillaAngleReferenceShine', true)) return false;

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
  const outerFrameCssWidth = numberParam('gannzillaAngleOuterFrameStrokeWidth', 35, 30, 42);
  const outerFrameWidth = outerFrameCssWidth * appliedZoom;
  const baseFrameWidth = baseFrameCssWidth * appliedZoom;
  const shadowSpread = numberParam('gannzillaAngleOuterShadowSpread', 20, 0, 40) * appliedZoom;
  const shadowOpacity = numberParam('gannzillaAngleOuterShadowOpacity', 0.46, 0, 0.9);
  const sparkleSize = numberParam('gannzillaAngleReferenceSparkleSize', 40, 20, 58) * appliedZoom;
  const sparkleAngle = numberParam('gannzillaAngleSparkleAngle', 34, -180, 180);

  const cx = expandedCssSize / 2;
  const cy = expandedCssSize / 2;
  const margin = 90 * appliedZoom;
  const baseOuter = Math.max(1, (baseCssSize - margin * 2) / 2);
  const originalInnerRadius = baseOuter + ringWidth * 2;
  const originalOuterRadius = originalInnerRadius + ringWidth * ringScale;

  // Keep the approved 5.6px inner edge fixed. Every extra pixel grows outward only.
  const approvedInnerEdge = originalOuterRadius - baseFrameWidth / 2;
  const outerBandRadius = approvedInnerEdge + outerFrameWidth / 2;
  const outerEdge = approvedInnerEdge + outerFrameWidth;

  const renderKey = [
    canvas.width, canvas.height, baseCssSize, expandedCssSize, ringWidth, ringScale,
    baseFrameCssWidth, outerFrameCssWidth, shadowSpread, shadowOpacity,
    sparkleSize, sparkleAngle, appliedZoom, redrawGeneration,
  ].join(':');
  if (canvas.dataset.gannzillaReferenceOuterFrameRenderKeyV537 === renderKey) return true;

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

  drawCopperBody(ctx, cx, cy, outerBandRadius, outerFrameWidth, shadowSpread, shadowOpacity);
  drawReferenceShine(ctx, cx, cy, approvedInnerEdge, outerFrameWidth);

  const sparklePoint = polar(cx, cy, approvedInnerEdge + outerFrameWidth * 0.68, sparkleAngle);
  drawSparkle(ctx, sparklePoint.x, sparklePoint.y, sparkleSize);
  ctx.restore();

  canvas.dataset.gannzillaReferenceOuterFrameV537 = 'true';
  canvas.dataset.gannzillaReferenceOuterFrameRenderKeyV537 = renderKey;
  canvas.dataset.gannzillaReferenceOuterFrameWidthV537 = String(outerFrameCssWidth);
  canvas.dataset.gannzillaReferenceOuterFrameOutwardOnlyV537 = 'true';
  canvas.dataset.gannzillaReferenceOuterFrameInnerEdgeV537 = String(approvedInnerEdge);
  canvas.dataset.gannzillaReferenceOuterFrameOuterEdgeV537 = String(outerEdge);
  canvas.dataset.gannzillaReferenceShineV537 = 'true';
  canvas.dataset.gannzillaReferenceSparkleV537 = 'true';
  canvas.dataset.gannzillaReferenceSparkleSizeV537 = String(sparkleSize / appliedZoom);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    outerFrameStrokeWidth: outerFrameCssWidth,
    inwardGrowth: 0,
    outwardOnly: true,
    shineLayers: 3,
    sparkleSize: sparkleSize / appliedZoom,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:reference-outer-frame-v537', { detail: lastApply }));
  return true;
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => drawReferenceOuterFrame(source));
  }, delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !wheelMode()
      || window[STATE_KEY]) return;

  persistFlags();

  ['gannzilla:outer-metallic-band-v536', 'gannzilla:metallic-angle-outer-ring-v531']
    .forEach((eventName) => window.addEventListener(eventName, () => {
      redrawGeneration += 1;
      schedule(eventName, 0);
    }, false));

  window.addEventListener('resize', () => {
    redrawGeneration += 1;
    schedule('resize', 20);
  }, false);

  [220, 520, 1200, 2600, 5200, 9000].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  window.GANNZILLA_REFERENCE_OUTER_FRAME_V537 = true;
  window.__auditGannzillaReferenceOuterFrameV537 = () => {
    const canvas = findWheel();
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaReferenceOuterFrameV537 === 'true'
        && Number(canvas.dataset.gannzillaReferenceOuterFrameWidthV537) === 35
        && canvas.dataset.gannzillaReferenceOuterFrameOutwardOnlyV537 === 'true'
        && canvas.dataset.gannzillaReferenceShineV537 === 'true'
        && canvas.dataset.gannzillaReferenceSparkleV537 === 'true',
      build: BUILD,
      outerFrameStrokeWidth: Number(canvas?.dataset?.gannzillaReferenceOuterFrameWidthV537 || 0),
      outwardOnly: canvas?.dataset?.gannzillaReferenceOuterFrameOutwardOnlyV537 === 'true',
      sparkleSize: Number(canvas?.dataset?.gannzillaReferenceSparkleSizeV537 || 0),
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = {
    drawReferenceOuterFrame,
    schedule,
    get redrawGeneration() { return redrawGeneration; },
  };
}

install();