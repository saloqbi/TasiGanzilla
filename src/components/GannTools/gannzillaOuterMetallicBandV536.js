const BUILD = 536;
const STATE_KEY = '__gannzillaOuterMetallicBandV536';
const BRONZE_DEEPEST = '#3f1608';
const BRONZE_DARK = '#6f2f12';
const BRONZE_MID = '#b8652f';
const BRONZE_LIGHT = '#ef9d5d';
const BRONZE_HIGHLIGHT = '#ffe0bd';
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

function drawOutwardRadialShadow(ctx, cx, cy, radius, width, spread, opacity) {
  const bandOuter = radius + width / 2;
  const shadowOuter = bandOuter + spread;
  const gradient = ctx.createRadialGradient(cx, cy, bandOuter, cx, cy, shadowOuter);
  gradient.addColorStop(0, `rgba(45, 16, 5, ${opacity})`);
  gradient.addColorStop(0.26, `rgba(55, 20, 6, ${opacity * 0.68})`);
  gradient.addColorStop(0.58, `rgba(60, 22, 8, ${opacity * 0.30})`);
  gradient.addColorStop(1, 'rgba(60, 22, 8, 0)');
  fillAnnulus(ctx, cx, cy, bandOuter - 0.5, shadowOuter, gradient);
}

function drawStrongEmbossedBand(ctx, cx, cy, radius, width, options = {}) {
  const half = width / 2;
  const highlightStrength = Math.max(0, Math.min(1, Number(options.highlightStrength) || 0.9));
  const realShadow = Boolean(options.realShadow);
  const shadowSpread = Math.max(0, Number(options.shadowSpread) || 0);
  const shadowOpacity = Math.max(0, Math.min(0.9, Number(options.shadowOpacity) || 0));
  const shadowBlur = Math.max(0, Number(options.shadowBlur) || 0);
  const shadowOffset = Number(options.shadowOffset) || 0;

  if (realShadow && shadowSpread > 0 && shadowOpacity > 0) {
    drawOutwardRadialShadow(ctx, cx, cy, radius, width, shadowSpread, shadowOpacity);
  }

  const gradient = ctx.createRadialGradient(
    cx, cy, Math.max(1, radius - half),
    cx, cy, radius + half,
  );
  gradient.addColorStop(0, BRONZE_DEEPEST);
  gradient.addColorStop(0.08, '#57200c');
  gradient.addColorStop(0.20, BRONZE_DARK);
  gradient.addColorStop(0.43, BRONZE_MID);
  gradient.addColorStop(0.63, BRONZE_LIGHT);
  gradient.addColorStop(0.78, `rgba(255, 202, 158, ${0.72 + highlightStrength * 0.20})`);
  gradient.addColorStop(0.88, BRONZE_HIGHLIGHT);
  gradient.addColorStop(0.95, '#f5a769');
  gradient.addColorStop(1, BRONZE_DARK);

  ctx.save();
  if (realShadow && shadowBlur > 0) {
    ctx.shadowColor = `rgba(48, 17, 6, ${shadowOpacity})`;
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = shadowOffset;
  }
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TWO_PI);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(1, radius - half + Math.max(1.2, width * 0.09)), 0, TWO_PI);
  ctx.strokeStyle = 'rgba(54, 17, 5, 0.94)';
  ctx.lineWidth = Math.max(1.2, width * 0.10);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, radius + width * 0.16, 0, TWO_PI);
  ctx.strokeStyle = `rgba(255, 178, 119, ${0.40 + highlightStrength * 0.30})`;
  ctx.lineWidth = Math.max(0.9, width * 0.08);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(1, radius + half - Math.max(1.4, width * 0.12)), 0, TWO_PI);
  ctx.strokeStyle = `rgba(255, 237, 215, ${0.68 + highlightStrength * 0.28})`;
  ctx.lineWidth = Math.max(1.2, width * 0.11);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(1, radius + half), 0, TWO_PI);
  ctx.strokeStyle = 'rgba(73, 24, 8, 0.98)';
  ctx.lineWidth = Math.max(1.1, width * 0.07);
  ctx.stroke();
}

function drawArcLayer(ctx, cx, cy, radius, start, end, lineWidth, blur, colorStops) {
  const gradient = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
  colorStops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.shadowColor = colorStops[Math.floor(colorStops.length / 2)]?.[1] || 'rgba(255,255,255,1)';
  ctx.shadowBlur = blur;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, start, end);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.restore();
}

function drawSpecularShine(ctx, cx, cy, radius, width, options = {}) {
  const strength = Math.max(0, Math.min(1, Number(options.strength) || 1));
  const startDegrees = Number(options.startDegrees) || 195;
  const endDegrees = Number(options.endDegrees) || 345;
  const glowWidth = Math.max(1, Number(options.glowWidth) || 24);
  const glowBlur = Math.max(0, Number(options.glowBlur) || 30);
  const glowOpacity = Math.max(0, Math.min(1, Number(options.glowOpacity) || 0.52));
  const bandWidth = Math.max(1, Number(options.bandWidth) || 10);
  const bandBlur = Math.max(0, Number(options.bandBlur) || 14);
  const bandOpacity = Math.max(0, Math.min(1, Number(options.bandOpacity) || 0.96));
  const coreWidth = Math.max(0.5, Number(options.coreWidth) || 3.5);
  const coreBlur = Math.max(0, Number(options.coreBlur) || 4);
  const coreOpacity = Math.max(0, Math.min(1, Number(options.coreOpacity) || 1));
  const start = (startDegrees * Math.PI) / 180;
  const end = (endDegrees * Math.PI) / 180;
  const shineRadius = radius + width * 0.18;

  drawArcLayer(ctx, cx, cy, shineRadius, start, end, glowWidth, glowBlur, [
    [0, 'rgba(255,255,255,0)'],
    [0.10, `rgba(255,176,105,${0.22 * glowOpacity * strength})`],
    [0.28, `rgba(255,218,176,${0.64 * glowOpacity * strength})`],
    [0.52, `rgba(255,250,235,${glowOpacity * strength})`],
    [0.74, `rgba(255,214,164,${0.72 * glowOpacity * strength})`],
    [0.92, `rgba(255,173,99,${0.28 * glowOpacity * strength})`],
    [1, 'rgba(255,255,255,0)'],
  ]);

  drawArcLayer(ctx, cx, cy, shineRadius, start + 0.025, end - 0.025, bandWidth, bandBlur, [
    [0, 'rgba(255,255,255,0)'],
    [0.08, `rgba(255,233,211,${0.34 * bandOpacity * strength})`],
    [0.25, `rgba(255,248,235,${0.82 * bandOpacity * strength})`],
    [0.48, `rgba(255,255,255,${bandOpacity * strength})`],
    [0.70, `rgba(255,253,245,${0.94 * bandOpacity * strength})`],
    [0.90, `rgba(255,222,190,${0.44 * bandOpacity * strength})`],
    [1, 'rgba(255,255,255,0)'],
  ]);

  drawArcLayer(ctx, cx, cy, shineRadius + width * 0.015, start + 0.06, end - 0.06, coreWidth, coreBlur, [
    [0, 'rgba(255,255,255,0)'],
    [0.12, `rgba(255,255,250,${0.52 * coreOpacity * strength})`],
    [0.34, `rgba(255,255,255,${0.94 * coreOpacity * strength})`],
    [0.56, `rgba(255,255,255,${coreOpacity * strength})`],
    [0.78, `rgba(255,255,252,${0.92 * coreOpacity * strength})`],
    [0.94, `rgba(255,247,233,${0.38 * coreOpacity * strength})`],
    [1, 'rgba(255,255,255,0)'],
  ]);
}

function drawSparkle(ctx, x, y, size, strength) {
  const glowRadius = size * 0.94;
  const rayLength = size * 1.10;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
  glow.addColorStop(0, `rgba(255,255,255,${strength})`);
  glow.addColorStop(0.10, `rgba(255,253,244,${0.96 * strength})`);
  glow.addColorStop(0.30, `rgba(255,225,188,${0.74 * strength})`);
  glow.addColorStop(0.62, `rgba(255,164,93,${0.30 * strength})`);
  glow.addColorStop(1, 'rgba(255,164,93,0)');
  ctx.beginPath();
  ctx.arc(x, y, glowRadius, 0, TWO_PI);
  ctx.fillStyle = glow;
  ctx.fill();

  ctx.translate(x, y);
  ctx.strokeStyle = `rgba(255,255,255,${strength})`;
  ctx.lineCap = 'round';
  ctx.shadowColor = `rgba(255,232,202,${0.96 * strength})`;
  ctx.shadowBlur = size * 0.58;

  [
    [-rayLength, 0, rayLength, 0, 0.085],
    [0, -rayLength, 0, rayLength, 0.085],
    [-rayLength * 0.70, -rayLength * 0.70, rayLength * 0.70, rayLength * 0.70, 0.050],
    [-rayLength * 0.70, rayLength * 0.70, rayLength * 0.70, -rayLength * 0.70, 0.050],
  ].forEach((line) => {
    ctx.beginPath();
    ctx.moveTo(line[0], line[1]);
    ctx.lineTo(line[2], line[3]);
    ctx.lineWidth = Math.max(1, size * line[4]);
    ctx.stroke();
  });

  ctx.beginPath();
  ctx.arc(0, 0, Math.max(2.4, size * 0.16), 0, TWO_PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('gannzillaAngleFrameStrokeWidth', '5.6');
    url.searchParams.set('gannzillaAngleInnerFrameStrokeWidth', '10');
    url.searchParams.set('gannzillaAngleOuterFrameStrokeWidth', '25');
    url.searchParams.set('gannzillaAngleOuterFrameShading', 'true');
    url.searchParams.set('gannzillaAngleFrameShadingStrength', 'strong');
    url.searchParams.set('gannzillaAngleHighlightDirection', 'outer');
    url.searchParams.set('gannzillaAngleOuterShadow', 'true');
    url.searchParams.set('gannzillaAngleOuterShadowBlur', '12');
    url.searchParams.set('gannzillaAngleOuterShadowOpacity', '0.52');
    url.searchParams.set('gannzillaAngleOuterShadowSpread', '16');
    url.searchParams.set('gannzillaAngleOuterShadowOffset', '2');
    url.searchParams.set('gannzillaAngleEmboss', 'true');
    url.searchParams.set('gannzillaAngleHighlightStrength', '1');
    url.searchParams.set('gannzillaAngleSpecularShine', 'true');
    url.searchParams.set('gannzillaAngleShineStart', '195');
    url.searchParams.set('gannzillaAngleShineEnd', '345');
    url.searchParams.set('gannzillaAngleShineGlowWidth', '24');
    url.searchParams.set('gannzillaAngleShineGlowBlur', '30');
    url.searchParams.set('gannzillaAngleShineGlowOpacity', '0.52');
    url.searchParams.set('gannzillaAngleShineBandWidth', '10');
    url.searchParams.set('gannzillaAngleShineBandBlur', '14');
    url.searchParams.set('gannzillaAngleShineBandOpacity', '0.96');
    url.searchParams.set('gannzillaAngleShineCoreWidth', '3.5');
    url.searchParams.set('gannzillaAngleShineCoreBlur', '4');
    url.searchParams.set('gannzillaAngleShineCoreOpacity', '1');
    url.searchParams.set('gannzillaAngleSparkle', 'true');
    url.searchParams.set('gannzillaAngleSparkleAngle', '34');
    url.searchParams.set('gannzillaAngleSparkleSize', '32');
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
let parentRedrawGeneration = 0;

function drawOuterMetallicBand(source = 'apply') {
  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement)
      || canvas.dataset.gannzillaMetallicAngleOuterRingV531 !== 'true'
      || !boolParam('gannzillaAngleOuterFrameShading', true)) return false;

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
  const innerFrameCssWidth = numberParam('gannzillaAngleInnerFrameStrokeWidth', 10, 5.6, 20);
  const outerFrameCssWidth = numberParam('gannzillaAngleOuterFrameStrokeWidth', 25, 10, 32);
  const innerFrameWidth = innerFrameCssWidth * appliedZoom;
  const outerFrameWidth = outerFrameCssWidth * appliedZoom;
  const baseFrameWidth = baseFrameCssWidth * appliedZoom;
  const realShadow = boolParam('gannzillaAngleOuterShadow', true);
  const emboss = boolParam('gannzillaAngleEmboss', true);
  const specularShine = boolParam('gannzillaAngleSpecularShine', true);
  const sparkle = boolParam('gannzillaAngleSparkle', true);
  const shadowBlur = numberParam('gannzillaAngleOuterShadowBlur', 12, 0, 30) * appliedZoom;
  const shadowOpacity = numberParam('gannzillaAngleOuterShadowOpacity', 0.52, 0, 0.9);
  const shadowSpread = numberParam('gannzillaAngleOuterShadowSpread', 16, 0, 36) * appliedZoom;
  const shadowOffset = numberParam('gannzillaAngleOuterShadowOffset', 2, -12, 12) * appliedZoom;
  const highlightStrength = numberParam('gannzillaAngleHighlightStrength', 1, 0, 1);
  const shineStart = numberParam('gannzillaAngleShineStart', 195, 120, 260);
  const shineEnd = numberParam('gannzillaAngleShineEnd', 345, 280, 420);
  const shineGlowWidth = numberParam('gannzillaAngleShineGlowWidth', 24, 4, 42) * appliedZoom;
  const shineGlowBlur = numberParam('gannzillaAngleShineGlowBlur', 30, 0, 50) * appliedZoom;
  const shineGlowOpacity = numberParam('gannzillaAngleShineGlowOpacity', 0.52, 0, 1);
  const shineBandWidth = numberParam('gannzillaAngleShineBandWidth', 10, 2, 24) * appliedZoom;
  const shineBandBlur = numberParam('gannzillaAngleShineBandBlur', 14, 0, 30) * appliedZoom;
  const shineBandOpacity = numberParam('gannzillaAngleShineBandOpacity', 0.96, 0, 1);
  const shineCoreWidth = numberParam('gannzillaAngleShineCoreWidth', 3.5, 0.5, 10) * appliedZoom;
  const shineCoreBlur = numberParam('gannzillaAngleShineCoreBlur', 4, 0, 16) * appliedZoom;
  const shineCoreOpacity = numberParam('gannzillaAngleShineCoreOpacity', 1, 0, 1);
  const sparkleAngle = numberParam('gannzillaAngleSparkleAngle', 34, -180, 180);
  const sparkleSize = numberParam('gannzillaAngleSparkleSize', 32, 8, 48) * appliedZoom;

  const cx = expandedCssSize / 2;
  const cy = expandedCssSize / 2;
  const margin = 90 * appliedZoom;
  const baseOuter = Math.max(1, (baseCssSize - margin * 2) / 2);
  const originalInnerRadius = baseOuter + ringWidth * 2;
  const angleWidth = ringWidth * ringScale;
  const originalOuterRadius = originalInnerRadius + angleWidth;
  const outerBandRadius = originalOuterRadius + Math.max(0, (outerFrameWidth - baseFrameWidth) / 2);
  const innerBandRadius = originalInnerRadius - Math.max(0, (innerFrameWidth - baseFrameWidth) / 2);

  const renderKey = [
    canvas.width, canvas.height, baseCssSize, expandedCssSize, ringWidth, ringScale,
    innerFrameCssWidth, outerFrameCssWidth, realShadow, emboss, specularShine, sparkle,
    shadowBlur, shadowOpacity, shadowSpread, shadowOffset, highlightStrength,
    shineStart, shineEnd, shineGlowWidth, shineGlowBlur, shineGlowOpacity,
    shineBandWidth, shineBandBlur, shineBandOpacity,
    shineCoreWidth, shineCoreBlur, shineCoreOpacity,
    sparkleAngle, sparkleSize, appliedZoom, parentRedrawGeneration,
  ].join(':');

  if (canvas.dataset.gannzillaOuterMetallicBandRenderKeyV536 === renderKey) return true;

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

  drawStrongEmbossedBand(ctx, cx, cy, innerBandRadius, innerFrameWidth, {
    highlightStrength: Math.max(0.72, highlightStrength - 0.12),
    realShadow: false,
    shadowSpread: 0,
    shadowOpacity: 0,
    shadowBlur: 0,
    shadowOffset: 0,
    emboss,
  });

  drawStrongEmbossedBand(ctx, cx, cy, outerBandRadius, outerFrameWidth, {
    highlightStrength,
    realShadow,
    shadowSpread,
    shadowOpacity,
    shadowBlur,
    shadowOffset,
    emboss,
  });

  if (specularShine) {
    drawSpecularShine(ctx, cx, cy, outerBandRadius, outerFrameWidth, {
      strength: highlightStrength,
      startDegrees: shineStart,
      endDegrees: shineEnd,
      glowWidth: shineGlowWidth,
      glowBlur: shineGlowBlur,
      glowOpacity: shineGlowOpacity,
      bandWidth: shineBandWidth,
      bandBlur: shineBandBlur,
      bandOpacity: shineBandOpacity,
      coreWidth: shineCoreWidth,
      coreBlur: shineCoreBlur,
      coreOpacity: shineCoreOpacity,
    });
  }

  if (sparkle) {
    const sparklePoint = polar(cx, cy, outerBandRadius + outerFrameWidth * 0.22, sparkleAngle);
    drawSparkle(ctx, sparklePoint.x, sparklePoint.y, sparkleSize, highlightStrength);
  }
  ctx.restore();

  canvas.dataset.gannzillaOuterMetallicBandV536 = 'true';
  canvas.dataset.gannzillaOuterMetallicBandRenderKeyV536 = renderKey;
  canvas.dataset.gannzillaAngleInnerFrameStrokeWidthV536 = String(innerFrameCssWidth);
  canvas.dataset.gannzillaAngleOuterFrameStrokeWidthV536 = String(outerFrameCssWidth);
  canvas.dataset.gannzillaAngleOuterFrameShadingV536 = 'true';
  canvas.dataset.gannzillaAngleFrameShadingStrengthV536 = 'strong';
  canvas.dataset.gannzillaAngleHighlightDirectionV536 = 'outer';
  canvas.dataset.gannzillaAngleOuterShadowV536 = String(realShadow);
  canvas.dataset.gannzillaAngleOuterShadowBlurV536 = String(shadowBlur / appliedZoom);
  canvas.dataset.gannzillaAngleOuterShadowOpacityV536 = String(shadowOpacity);
  canvas.dataset.gannzillaAngleOuterShadowSpreadV536 = String(shadowSpread / appliedZoom);
  canvas.dataset.gannzillaAngleEmbossV536 = String(emboss);
  canvas.dataset.gannzillaAngleSpecularShineV536 = String(specularShine);
  canvas.dataset.gannzillaAngleShineGlowWidthV536 = String(shineGlowWidth / appliedZoom);
  canvas.dataset.gannzillaAngleShineBandWidthV536 = String(shineBandWidth / appliedZoom);
  canvas.dataset.gannzillaAngleShineCoreWidthV536 = String(shineCoreWidth / appliedZoom);
  canvas.dataset.gannzillaAngleSparkleV536 = String(sparkle);
  canvas.dataset.gannzillaAngleSparkleAngleV536 = String(sparkleAngle);
  canvas.dataset.gannzillaAngleSparkleSizeV536 = String(sparkleSize / appliedZoom);
  canvas.dataset.gannzillaAngleOuterFrameOutwardGrowthV536 = String(Math.max(0, (outerFrameCssWidth - baseFrameCssWidth) / 2));
  canvas.dataset.gannzillaAngleInnerFrameInwardGrowthV536 = String(Math.max(0, (innerFrameCssWidth - baseFrameCssWidth) / 2));

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    innerFrameStrokeWidth: innerFrameCssWidth,
    outerFrameStrokeWidth: outerFrameCssWidth,
    shadingStrength: 'strong',
    highlightDirection: 'outer',
    realOuterShadow: realShadow,
    shadowBlur: shadowBlur / appliedZoom,
    shadowOpacity,
    shadowSpread: shadowSpread / appliedZoom,
    shadowOffset: shadowOffset / appliedZoom,
    emboss,
    highlightStrength,
    specularShine,
    shineGlowWidth: shineGlowWidth / appliedZoom,
    shineBandWidth: shineBandWidth / appliedZoom,
    shineCoreWidth: shineCoreWidth / appliedZoom,
    sparkle,
    sparkleAngle,
    sparkleSize: sparkleSize / appliedZoom,
    outerGrowth: Math.max(0, (outerFrameCssWidth - baseFrameCssWidth) / 2),
    innerGrowth: Math.max(0, (innerFrameCssWidth - baseFrameCssWidth) / 2),
    angleGeometryChanged: false,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:outer-metallic-band-v536', { detail: lastApply }));
  return true;
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => drawOuterMetallicBand(source));
  }, delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !wheelMode()
      || window[STATE_KEY]) return;

  persistFlags();

  window.addEventListener('gannzilla:metallic-angle-outer-ring-v531', () => {
    parentRedrawGeneration += 1;
    schedule('angle-v531', 0);
  }, false);
  window.addEventListener('resize', () => {
    parentRedrawGeneration += 1;
    schedule('resize', 20);
  }, false);

  [180, 460, 1100, 2400, 4800, 8600].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  window.GANNZILLA_OUTER_METALLIC_BAND_V536 = true;
  window.__auditGannzillaOuterMetallicBandV536 = () => {
    const canvas = findWheel();
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaOuterMetallicBandV536 === 'true'
        && Number(canvas.dataset.gannzillaAngleInnerFrameStrokeWidthV536) === 10
        && Number(canvas.dataset.gannzillaAngleOuterFrameStrokeWidthV536) === 25
        && canvas.dataset.gannzillaAngleOuterFrameShadingV536 === 'true'
        && canvas.dataset.gannzillaAngleFrameShadingStrengthV536 === 'strong'
        && canvas.dataset.gannzillaAngleHighlightDirectionV536 === 'outer'
        && canvas.dataset.gannzillaAngleOuterShadowV536 === 'true'
        && canvas.dataset.gannzillaAngleEmbossV536 === 'true'
        && canvas.dataset.gannzillaAngleSpecularShineV536 === 'true'
        && Number(canvas.dataset.gannzillaAngleShineGlowWidthV536) === 24
        && Number(canvas.dataset.gannzillaAngleShineBandWidthV536) === 10
        && Number(canvas.dataset.gannzillaAngleShineCoreWidthV536) === 3.5
        && canvas.dataset.gannzillaAngleSparkleV536 === 'true'
        && Number(canvas.dataset.gannzillaAngleSparkleSizeV536) === 32,
      build: BUILD,
      innerFrameStrokeWidth: Number(canvas?.dataset?.gannzillaAngleInnerFrameStrokeWidthV536 || 0),
      outerFrameStrokeWidth: Number(canvas?.dataset?.gannzillaAngleOuterFrameStrokeWidthV536 || 0),
      shadingStrength: canvas?.dataset?.gannzillaAngleFrameShadingStrengthV536 || null,
      highlightDirection: canvas?.dataset?.gannzillaAngleHighlightDirectionV536 || null,
      realOuterShadow: canvas?.dataset?.gannzillaAngleOuterShadowV536 === 'true',
      shadowBlur: Number(canvas?.dataset?.gannzillaAngleOuterShadowBlurV536 || 0),
      shadowOpacity: Number(canvas?.dataset?.gannzillaAngleOuterShadowOpacityV536 || 0),
      shadowSpread: Number(canvas?.dataset?.gannzillaAngleOuterShadowSpreadV536 || 0),
      emboss: canvas?.dataset?.gannzillaAngleEmbossV536 === 'true',
      specularShine: canvas?.dataset?.gannzillaAngleSpecularShineV536 === 'true',
      shineGlowWidth: Number(canvas?.dataset?.gannzillaAngleShineGlowWidthV536 || 0),
      shineBandWidth: Number(canvas?.dataset?.gannzillaAngleShineBandWidthV536 || 0),
      shineCoreWidth: Number(canvas?.dataset?.gannzillaAngleShineCoreWidthV536 || 0),
      sparkle: canvas?.dataset?.gannzillaAngleSparkleV536 === 'true',
      sparkleAngle: Number(canvas?.dataset?.gannzillaAngleSparkleAngleV536 || 0),
      sparkleSize: Number(canvas?.dataset?.gannzillaAngleSparkleSizeV536 || 0),
      outwardGrowth: Number(canvas?.dataset?.gannzillaAngleOuterFrameOutwardGrowthV536 || 0),
      inwardGrowth: Number(canvas?.dataset?.gannzillaAngleInnerFrameInwardGrowthV536 || 0),
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = {
    drawOuterMetallicBand,
    schedule,
    get parentRedrawGeneration() { return parentRedrawGeneration; },
  };
}

install();