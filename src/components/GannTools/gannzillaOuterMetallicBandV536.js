const BUILD = 536;
const STATE_KEY = '__gannzillaOuterMetallicBandV536';
const BRONZE_DARK = '#6f2f12';
const BRONZE_MID = '#b8652f';
const BRONZE_LIGHT = '#efb07a';
const BRONZE_HIGHLIGHT = '#ffd0aa';
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

function drawShadedMetallicBand(ctx, cx, cy, radius, width) {
  const half = width / 2;
  const gradient = ctx.createRadialGradient(
    cx, cy, Math.max(1, radius - half),
    cx, cy, radius + half,
  );

  gradient.addColorStop(0, BRONZE_DARK);
  gradient.addColorStop(0.12, '#8f421f');
  gradient.addColorStop(0.28, BRONZE_MID);
  gradient.addColorStop(0.43, BRONZE_LIGHT);
  gradient.addColorStop(0.52, BRONZE_HIGHLIGHT);
  gradient.addColorStop(0.62, BRONZE_LIGHT);
  gradient.addColorStop(0.80, BRONZE_MID);
  gradient.addColorStop(1, BRONZE_DARK);

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TWO_PI);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = width;
  ctx.stroke();

  // Dark edge definition and a restrained highlight preserve the metallic depth.
  [radius - half, radius + half].forEach((edgeRadius) => {
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(1, edgeRadius), 0, TWO_PI);
    ctx.strokeStyle = BRONZE_DARK;
    ctx.lineWidth = 1.05;
    ctx.stroke();
  });

  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(1, radius - half + width * 0.34), 0, TWO_PI);
  ctx.strokeStyle = 'rgba(255, 225, 198, 0.72)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('gannzillaAngleFrameStrokeWidth', '5.6');
    url.searchParams.set('gannzillaAngleOuterFrameStrokeWidth', '15');
    url.searchParams.set('gannzillaAngleOuterFrameShading', 'true');
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

function drawOuterMetallicBand(source = 'apply', force = false) {
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
  const innerBandCssWidth = numberParam('gannzillaAngleFrameStrokeWidth', 5.6, 3, 12);
  const outerBandCssWidth = numberParam('gannzillaAngleOuterFrameStrokeWidth', 15, 5.6, 24);
  const innerBandWidth = innerBandCssWidth * appliedZoom;
  const outerBandWidth = outerBandCssWidth * appliedZoom;

  const cx = expandedCssSize / 2;
  const cy = expandedCssSize / 2;
  const margin = 90 * appliedZoom;
  const baseOuter = Math.max(1, (baseCssSize - margin * 2) / 2);
  const inner = baseOuter + ringWidth * 2;
  const angleWidth = ringWidth * ringScale;
  const originalOuterRadius = inner + angleWidth;

  // Grow outward only. The inner edge remains aligned with the approved 5.6px frame,
  // so ticks and angle labels keep their exact geometry.
  const outwardOffset = Math.max(0, (outerBandWidth - innerBandWidth) / 2);
  const outerBandRadius = originalOuterRadius + outwardOffset;

  const renderKey = [
    canvas.width,
    canvas.height,
    baseCssSize,
    expandedCssSize,
    ringWidth,
    ringScale,
    innerBandCssWidth,
    outerBandCssWidth,
    appliedZoom,
  ].join(':');

  if (!force && canvas.dataset.gannzillaOuterMetallicBandRenderKeyV536 === renderKey) return true;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return false;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.setLineDash([]);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  drawShadedMetallicBand(ctx, cx, cy, outerBandRadius, outerBandWidth);
  ctx.restore();

  canvas.dataset.gannzillaOuterMetallicBandV536 = 'true';
  canvas.dataset.gannzillaOuterMetallicBandRenderKeyV536 = renderKey;
  canvas.dataset.gannzillaAngleInnerFrameStrokeWidthV536 = String(innerBandCssWidth);
  canvas.dataset.gannzillaAngleOuterFrameStrokeWidthV536 = String(outerBandCssWidth);
  canvas.dataset.gannzillaAngleOuterFrameShadingV536 = 'true';
  canvas.dataset.gannzillaAngleOuterFrameOutwardGrowthV536 = String(Math.max(0, (outerBandCssWidth - innerBandCssWidth) / 2));

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    innerFrameStrokeWidth: innerBandCssWidth,
    outerFrameStrokeWidth: outerBandCssWidth,
    shaded: true,
    outwardOnly: true,
    geometryChanged: false,
    outwardGrowth: Math.max(0, (outerBandCssWidth - innerBandCssWidth) / 2),
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:outer-metallic-band-v536', { detail: lastApply }));
  return true;
}

function schedule(source = 'schedule', force = false, delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => drawOuterMetallicBand(source, force));
  }, delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !wheelMode()
      || window[STATE_KEY]) return;

  persistFlags();

  window.addEventListener('gannzilla:metallic-angle-outer-ring-v531', () => {
    schedule('angle-v531', true, 0);
  }, false);
  window.addEventListener('resize', () => schedule('resize', true, 20), false);

  [180, 460, 1100, 2400, 4800, 8600].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, true), delay);
  });

  window.GANNZILLA_OUTER_METALLIC_BAND_V536 = true;
  window.__auditGannzillaOuterMetallicBandV536 = () => {
    const canvas = findWheel();
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaOuterMetallicBandV536 === 'true'
        && Number(canvas.dataset.gannzillaAngleInnerFrameStrokeWidthV536) === 5.6
        && Number(canvas.dataset.gannzillaAngleOuterFrameStrokeWidthV536) === 15
        && canvas.dataset.gannzillaAngleOuterFrameShadingV536 === 'true',
      build: BUILD,
      innerFrameStrokeWidth: Number(canvas?.dataset?.gannzillaAngleInnerFrameStrokeWidthV536 || 0),
      outerFrameStrokeWidth: Number(canvas?.dataset?.gannzillaAngleOuterFrameStrokeWidthV536 || 0),
      shaded: canvas?.dataset?.gannzillaAngleOuterFrameShadingV536 === 'true',
      outwardGrowth: Number(canvas?.dataset?.gannzillaAngleOuterFrameOutwardGrowthV536 || 0),
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { drawOuterMetallicBand, schedule };
}

install();