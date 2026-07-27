const BUILD = 541;
const STATE_KEY = '__gannzillaCopperTopCorrectionV541';
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

function drawWarmTopHighlight(ctx, cx, cy, innerEdge, frameWidth) {
  const start = (184 * Math.PI) / 180;
  const end = (356 * Math.PI) / 180;
  const radius = innerEdge + frameWidth * 0.69;
  const gradient = ctx.createLinearGradient(cx - radius, 0, cx + radius, 0);
  gradient.addColorStop(0, 'rgba(255,133,52,0)');
  gradient.addColorStop(0.10, 'rgba(255,148,62,0.18)');
  gradient.addColorStop(0.28, 'rgba(255,177,103,0.46)');
  gradient.addColorStop(0.48, 'rgba(255,209,158,0.72)');
  gradient.addColorStop(0.62, 'rgba(255,218,174,0.78)');
  gradient.addColorStop(0.80, 'rgba(255,175,94,0.44)');
  gradient.addColorStop(0.94, 'rgba(255,137,52,0.15)');
  gradient.addColorStop(1, 'rgba(255,133,52,0)');

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(190, 74, 20, 0.38)';
  ctx.shadowBlur = frameWidth * 0.20;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, start, end);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = frameWidth * 0.18;
  ctx.stroke();
  ctx.restore();
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('gannzillaAngleCopperTopCorrection', 'true');
    url.searchParams.set('gannzillaAngleWhiteTopOverlay', 'false');
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

function drawCopperCorrection(source = 'apply') {
  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement)
      || canvas.dataset.gannzillaCleanOuterFrameV540 !== 'true'
      || !boolParam('gannzillaAngleCopperTopCorrection', true)) return false;

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
  const outerFrameCssWidth = numberParam('gannzillaAngleOuterFrameStrokeWidth', 40, 36, 48);
  const baseFrameWidth = baseFrameCssWidth * appliedZoom;
  const outerFrameWidth = outerFrameCssWidth * appliedZoom;

  const cx = expandedCssSize / 2;
  const cy = expandedCssSize / 2;
  const margin = 90 * appliedZoom;
  const baseOuter = Math.max(1, (baseCssSize - margin * 2) / 2);
  const angleInnerRadius = baseOuter + ringWidth * 2;
  const angleOuterRadius = angleInnerRadius + ringWidth * ringScale;
  const outerInnerEdge = angleOuterRadius - baseFrameWidth / 2;
  const outerEdge = outerInnerEdge + outerFrameWidth;

  const renderKey = [
    canvas.width, canvas.height, baseCssSize, expandedCssSize, ringWidth,
    ringScale, baseFrameCssWidth, outerFrameCssWidth, appliedZoom, redrawGeneration,
  ].join(':');
  if (canvas.dataset.gannzillaCopperTopCorrectionRenderKeyV541 === renderKey) return true;

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

  // Repaint the complete outer frame in copper after V540. This removes the
  // white upper overlay without resizing, copying, or duplicating the wheel.
  const copper = ctx.createRadialGradient(cx, cy, outerInnerEdge, cx, cy, outerEdge);
  copper.addColorStop(0, '#351005');
  copper.addColorStop(0.08, '#531b07');
  copper.addColorStop(0.20, '#7b2d0f');
  copper.addColorStop(0.38, '#ad4f1f');
  copper.addColorStop(0.56, '#d97939');
  copper.addColorStop(0.72, '#f1a268');
  copper.addColorStop(0.84, '#f8bd8d');
  copper.addColorStop(0.93, '#d96f31');
  copper.addColorStop(1, '#641f09');
  fillAnnulus(ctx, cx, cy, outerInnerEdge, outerEdge, copper);

  strokeCircle(ctx, cx, cy, outerInnerEdge, 'rgba(48, 13, 3, 0.99)', Math.max(1.6, outerFrameWidth * 0.075));
  strokeCircle(ctx, cx, cy, outerInnerEdge + outerFrameWidth * 0.14, 'rgba(116, 38, 10, 0.96)', Math.max(1.0, outerFrameWidth * 0.05));
  strokeCircle(ctx, cx, cy, outerEdge - outerFrameWidth * 0.10, 'rgba(247, 181, 132, 0.88)', Math.max(1.3, outerFrameWidth * 0.06));
  strokeCircle(ctx, cx, cy, outerEdge, 'rgba(84, 24, 6, 0.99)', Math.max(1.4, outerFrameWidth * 0.055));
  drawWarmTopHighlight(ctx, cx, cy, outerInnerEdge, outerFrameWidth);
  ctx.restore();

  canvas.dataset.gannzillaCopperTopCorrectionV541 = 'true';
  canvas.dataset.gannzillaCopperTopCorrectionRenderKeyV541 = renderKey;
  canvas.dataset.gannzillaWhiteTopOverlayV541 = 'false';
  canvas.dataset.gannzillaUpperFrameColorV541 = 'copper';
  canvas.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    upperFrameColor: 'copper',
    whiteOverlay: false,
    outerFrameStrokeWidth: outerFrameCssWidth,
    geometryChanged: false,
    canvasResized: false,
    wheelCopied: false,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:copper-top-correction-v541', { detail: lastApply }));
  return true;
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => drawCopperCorrection(source));
  }, delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !wheelMode()
      || window[STATE_KEY]) return;

  persistFlags();

  window.addEventListener('gannzilla:clean-outer-frame-v540', () => {
    redrawGeneration += 1;
    schedule('clean-frame-v540', 15);
  }, false);
  window.addEventListener('resize', () => {
    redrawGeneration += 1;
    schedule('resize', 35);
  }, false);

  [220, 520, 1100, 2200, 4200, 7600, 10400].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  window.GANNZILLA_COPPER_TOP_CORRECTION_V541 = true;
  window.__auditGannzillaCopperTopCorrectionV541 = () => {
    const canvas = findWheel();
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaCopperTopCorrectionV541 === 'true'
        && canvas.dataset.gannzillaWhiteTopOverlayV541 === 'false'
        && canvas.dataset.gannzillaUpperFrameColorV541 === 'copper',
      build: BUILD,
      upperFrameColor: canvas?.dataset?.gannzillaUpperFrameColorV541 || null,
      whiteOverlay: canvas?.dataset?.gannzillaWhiteTopOverlayV541 === 'true',
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { drawCopperCorrection, schedule };
}

install();