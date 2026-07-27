const BUILD = 529;
const STATE_KEY = '__gannzillaBalancedAngleOuterRingV529';
const CELL_FILL = '#ffffff';
const BLACK = '#111111';
const BRONZE = '#a95321';
const BRONZE_DARK = '#7d3b18';
const BRONZE_LIGHT = '#c98758';
const TWO_PI = Math.PI * 2;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function boolParam(name, fallback = false) {
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

function readableRotation(angle) {
  const normalized = ((angle % 360) + 360) % 360;
  return normalized > 90 && normalized < 270 ? normalized + 180 : normalized;
}

function drawBalancedFrame(ctx, cx, cy, inner, outer, borderWidth) {
  ctx.beginPath();
  ctx.arc(cx, cy, outer, 0, TWO_PI);
  ctx.arc(cx, cy, inner, TWO_PI, 0, true);
  ctx.closePath();
  ctx.fillStyle = CELL_FILL;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, TWO_PI);
  ctx.strokeStyle = BRONZE_DARK;
  ctx.lineWidth = borderWidth;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, outer, 0, TWO_PI);
  ctx.strokeStyle = BRONZE;
  ctx.lineWidth = borderWidth;
  ctx.stroke();
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('emptyOuterRing', 'true');
    url.searchParams.set('emptyOuterRingCount', '4');
    url.searchParams.set('zodiacOuterRing', 'true');
    url.searchParams.set('weekdaysOuterRing', 'true');
    url.searchParams.set('angleOuterRing', 'true');
    url.searchParams.set('angleFrameCount', '1');
    url.searchParams.set('angleCardinalSpokes', 'false');
    url.searchParams.set('gannzillaAngleRingScale', '2');
    if (!url.searchParams.has('gannzillaAngleFrameStrokeWidth')) {
      url.searchParams.set('gannzillaAngleFrameStrokeWidth', '2.8');
    }
    if (!url.searchParams.has('gannzillaAngleMajorFontSize')) {
      url.searchParams.set('gannzillaAngleMajorFontSize', '24');
    }
    if (!url.searchParams.has('gannzillaAngleMinorFontSize')) {
      url.searchParams.set('gannzillaAngleMinorFontSize', '14');
    }
    if (!url.searchParams.has('gannzillaAngleCardinalFontSize')) {
      url.searchParams.set('gannzillaAngleCardinalFontSize', '32');
    }
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

function drawBalancedAngleOuterRing(source = 'apply', force = false) {
  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement)
      || !boolParam('angleOuterRing', false)) return false;

  const divisions = Number(canvas.dataset.gannzillaEmptyOuterRingDivisionsV518 || 0);
  const emptyRingCount = Number(canvas.dataset.gannzillaEmptyOuterRingCountV518 || 0);
  const baseCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingBaseCssSizeV518 || 0);
  const expandedCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518 || 0);
  const ringWidth = Number(canvas.dataset.gannzillaEmptyOuterRingWidthV518 || 0);
  const dpr = Math.max(1, Number(canvas.dataset.gannzillaNativeDpr)
    || (expandedCssSize > 0 ? canvas.width / expandedCssSize : 0)
    || Number(window.devicePixelRatio)
    || 1);
  const appliedZoom = Math.max(0.5, Number(canvas.dataset.gannzillaAppliedZoom) || 1);

  if (divisions !== 36
      || emptyRingCount < 4
      || !(baseCssSize > 0)
      || !(expandedCssSize > 0)
      || !(ringWidth > 0)) return false;

  const ringScale = numberParam('gannzillaAngleRingScale', 2, 1.5, 2);
  const borderWidth = numberParam('gannzillaAngleFrameStrokeWidth', 2.8, 1.2, 6);
  const majorFont = numberParam('gannzillaAngleMajorFontSize', 24, 14, 36);
  const minorFont = numberParam('gannzillaAngleMinorFontSize', 14, 9, 24);
  const cardinalFont = numberParam('gannzillaAngleCardinalFontSize', 32, 20, 44);
  const renderKey = [
    canvas.width,
    canvas.height,
    baseCssSize,
    expandedCssSize,
    ringWidth,
    ringScale,
    borderWidth,
    majorFont,
    minorFont,
    cardinalFont,
  ].join(':');
  if (!force && canvas.dataset.gannzillaBalancedAngleRenderKeyV529 === renderKey) return true;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return false;

  const cx = expandedCssSize / 2;
  const cy = expandedCssSize / 2;
  const margin = 90 * appliedZoom;
  const baseOuter = Math.max(1, (baseCssSize - margin * 2) / 2);
  const inner = baseOuter + ringWidth * 2;
  const angleWidth = ringWidth * ringScale;
  const outer = inner + angleWidth;
  const labelRadiusMajor = inner + angleWidth * 0.39;
  const labelRadiusMinor = inner + angleWidth * 0.23;
  const guideRadius = inner + angleWidth * 0.62;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.setLineDash([]);
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'round';
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // One wide visual frame occupying the complete outer allocation.
  drawBalancedFrame(ctx, cx, cy, inner, outer, borderWidth);

  // Fine protractor ticks, all contained inside the same frame.
  for (let degree = 0; degree < 360; degree += 1) {
    const cardinal = degree % 90 === 0;
    const major = degree % 10 === 0;
    const medium = degree % 5 === 0;
    const length = cardinal
      ? angleWidth * 0.30
      : major
        ? angleWidth * 0.23
        : medium
          ? angleWidth * 0.15
          : angleWidth * 0.075;
    const outerPoint = polar(cx, cy, outer - borderWidth, degree);
    const innerPoint = polar(cx, cy, outer - length, degree);
    ctx.beginPath();
    ctx.moveTo(innerPoint.x, innerPoint.y);
    ctx.lineTo(outerPoint.x, outerPoint.y);
    ctx.strokeStyle = cardinal || major ? BLACK : BRONZE;
    ctx.lineWidth = cardinal ? 2.15 : major ? 1.25 : medium ? 0.86 : 0.44;
    ctx.stroke();
  }

  // Larger labels, still with no center spokes.
  for (let angle = 0; angle < 360; angle += 5) {
    const displayAngle = angle === 0 ? 360 : angle;
    const cardinal = angle % 90 === 0;
    const major = angle % 10 === 0;
    const fontSize = (cardinal ? cardinalFont : major ? majorFont : minorFont) * appliedZoom;
    const point = polar(cx, cy, major || cardinal ? labelRadiusMajor : labelRadiusMinor, angle);

    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate((readableRotation(angle) * Math.PI) / 180);
    ctx.font = `${cardinal ? 800 : major ? 700 : 600} ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = major || cardinal ? BLACK : BRONZE;
    ctx.fillText(`${displayAngle}°`, 0, 0);
    ctx.restore();
  }

  // A light guide inside the same single frame; it is not a second frame.
  ctx.beginPath();
  ctx.arc(cx, cy, guideRadius, 0, TWO_PI);
  ctx.strokeStyle = BRONZE_LIGHT;
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.restore();

  canvas.dataset.gannzillaBalancedAngleOuterRingV529 = 'true';
  canvas.dataset.gannzillaBalancedAngleRenderKeyV529 = renderKey;
  canvas.dataset.gannzillaAngleFrameCountV529 = '1';
  canvas.dataset.gannzillaAngleTickCountV529 = '360';
  canvas.dataset.gannzillaAngleCardinalsV529 = '360,90,180,270';
  canvas.dataset.gannzillaAngleCardinalSpokesV529 = 'false';
  canvas.dataset.gannzillaAngleRingScaleV529 = String(ringScale);
  canvas.dataset.gannzillaAngleFrameStrokeWidthV529 = String(borderWidth);
  canvas.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    frameCount: 1,
    tickCount: 360,
    cardinals: [360, 90, 180, 270],
    cardinalSpokes: false,
    ringScale,
    borderWidth,
    majorFont,
    minorFont,
    cardinalFont,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:balanced-angle-outer-ring-v529', { detail: lastApply }));
  return true;
}

function schedule(source = 'schedule', force = false, delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => drawBalancedAngleOuterRing(source, force));
  }, delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !wheelMode()
      || window[STATE_KEY]) return;

  persistFlags();

  window.addEventListener('gannzilla:weekdays-outer-ring-v523', () => {
    schedule('weekdays-v523', true, 25);
  }, false);
  window.addEventListener('gannzilla:zodiac-outer-ring-v522', () => {
    schedule('zodiac-v522', true, 45);
  }, false);
  window.addEventListener('gannzilla:empty-outer-ring-v518', () => {
    schedule('outer-ring-v518', true, 70);
  }, false);
  window.addEventListener('resize', () => schedule('resize'), false);

  [160, 400, 960, 2200, 4500, 8600].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, true), delay);
  });

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => schedule('fonts-ready', true)).catch(() => {});
  }

  window.GANNZILLA_BALANCED_ANGLE_OUTER_RING_V529 = true;
  window.__auditGannzillaBalancedAngleOuterRingV529 = () => {
    const canvas = findWheel();
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaBalancedAngleOuterRingV529 === 'true'
        && Number(canvas.dataset.gannzillaAngleFrameCountV529) === 1
        && Number(canvas.dataset.gannzillaAngleTickCountV529) === 360
        && canvas.dataset.gannzillaAngleCardinalSpokesV529 === 'false',
      build: BUILD,
      frameCount: Number(canvas?.dataset?.gannzillaAngleFrameCountV529 || 0),
      tickCount: Number(canvas?.dataset?.gannzillaAngleTickCountV529 || 0),
      cardinals: canvas?.dataset?.gannzillaAngleCardinalsV529 || null,
      cardinalSpokes: canvas?.dataset?.gannzillaAngleCardinalSpokesV529 === 'true',
      ringScale: Number(canvas?.dataset?.gannzillaAngleRingScaleV529 || 0),
      borderWidth: Number(canvas?.dataset?.gannzillaAngleFrameStrokeWidthV529 || 0),
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { drawBalancedAngleOuterRing, schedule };
}

install();