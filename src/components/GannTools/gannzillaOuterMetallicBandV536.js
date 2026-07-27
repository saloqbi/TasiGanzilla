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

function drawSpecularShine(ctx, cx, cy, radius, width, strength) {
  const start = (202 * Math.PI) / 180;
  const end = (338 * Math.PI) / 180;
  const shineRadius = radius + width * 0.34;
  const glowGradient = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
  glowGradient.addColorStop(0, 'rgba(255,255,255,0)');
  glowGradient.addColorStop(0.16, `rgba(255,226,202,${0.28 * strength})`);
  glowGradient.addColorStop(0.38, `rgba(255,248,238,${0.82 * strength})`);
  glowGradient.addColorStop(0.58, `rgba(255,255,255,${0.98 * strength})`);
  glowGradient.addColorStop(0.78, `rgba(255,224,195,${0.62 * strength})`);
  glowGradient.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.lineCap = 'round';
  ctx.shadowColor = `rgba(255, 232, 211, ${0.92 * strength})`;
  ctx.shadowBlur = width * 0.72;
  ctx.beginPath();
  ctx.arc(cx, cy, shineRadius, start, end);
  ctx.strokeStyle = glowGradient;
  ctx.lineWidth = Math.max(3, width * 0.23);
  ctx.stroke();

  ctx.shadowBlur = width * 0.28;
  ctx.beginPath();
  ctx.arc(cx, cy, shineRadius + width * 0.02, start + 0.04, end - 0.04);
  ctx.strokeStyle = `rgba(255, 255, 248, ${0.92 * strength})`;
  ctx.lineWidth = Math.max(1.2, width * 0.075);
  ctx.stroke();
  ctx.restore();
}

function drawSparkle(ctx, x, y, size, strength) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const glow = ctx.createRadialGradient(x, y, 0, x, y, size);
  glow.addColorStop(0, `rgba(255,255,255,${0.98 * strength})`);
  glow.addColorStop(0.18, `rgba(255,244,222,${0.84 * strength})`);
  glow.addColorStop(0.48, `rgba(255,190,132,${0.34 * strength})`);
  glow.addColorStop(1, 'rgba(255,190,132,0)');
  ctx.beginPath();
  ctx.arc(x, y, size, 0, TWO_PI);
  ctx.fillStyle = glow;
  ctx.fill();

  ctx.translate(x, y);
  ctx.strokeStyle = `rgba(255,255,255,${0.96 * strength})`;
  ctx.lineCap = 'round';
  ctx.shadowColor = `rgba(255,230,196,${0.88 * strength})`;
  ctx.shadowBlur = size * 0.36;

  [[-size, 0, size, 0], [0, -size, 0, size],
   [-size * 0.56, -size * 0.56, size * 0.56, size * 0.56],
   [-size * 0.56, size * 0.56, size * 0.56, -size * 0.56]].forEach((line, index) => {
    ctx.beginPath();
    ctx.moveTo(line[0], line[1]);
    ctx.lineTo(line[2], line[3]);
    ctx.lineWidth = index < 2 ? Math.max(1.1, size * 0.075) : Math.max(0.75, size * 0.045);
    ctx.stroke();
  });

  ctx.beginPath();
  ctx.arc(0, 0, Math.max(1.6, size * 0.13), 0, TWO_PI);
  ctx.fillStyle = '#fffdf5';
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
    url.searchParams.set('gannzillaAngleSparkle', 'true');
    url.searchParams.set('gannzillaAngleSparkleAngle', '34');
    url.searchParams.set('gannzillaAngleSparkleSize', '18');
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
  const sparkleAngle = numberParam('gannzillaAngleSparkleAngle', 34, -180, 180);
  const sparkleSize = numberParam('gannzillaAngleSparkleSize', 18, 6, 36) * appliedZoom;

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
    canvas.width,
    canvas.height,
    baseCssSize,
    expandedCssSize,
    ringWidth,
    ringScale,
    innerFrameCssWidth,
    outerFrameCssWidth,
    realShadow,
    emboss,
    specularShine,
    sparkle,
    shadowBlur,
    shadowOpacity,
    shadowSpread,
    shadowOffset,
    highlightStrength,
    sparkleAngle,
    sparkleSize,
    appliedZoom,
    parentRedrawGeneration,
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
    drawSpecularShine(ctx, cx, cy, outerBandRadius, outerFrameWidth, highlightStrength);
  }

  if (sparkle) {
    const sparklePoint = polar(cx, cy, outerBandRadius + outerFrameWidth * 0.34, sparkleAngle);
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
        && canvas.dataset.gannzillaAngleSparkleV536 === 'true',
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