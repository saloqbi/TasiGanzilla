const BUILD = 527;
const STATE_KEY = '__gannzillaSingleAngleOuterRingV527';
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

function drawSingleAnnulus(ctx, cx, cy, inner, outer) {
  ctx.beginPath();
  ctx.arc(cx, cy, outer, 0, TWO_PI);
  ctx.arc(cx, cy, inner, TWO_PI, 0, true);
  ctx.closePath();
  ctx.fillStyle = CELL_FILL;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, TWO_PI);
  ctx.strokeStyle = BRONZE_DARK;
  ctx.lineWidth = 1.35;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, outer, 0, TWO_PI);
  ctx.strokeStyle = BRONZE;
  ctx.lineWidth = 2.25;
  ctx.stroke();
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('emptyOuterRing', 'true');
    url.searchParams.set('emptyOuterRingCount', '3');
    url.searchParams.set('zodiacOuterRing', 'true');
    url.searchParams.set('weekdaysOuterRing', 'true');
    url.searchParams.set('angleOuterRing', 'true');
    url.searchParams.set('angleFrameCount', '1');
    url.searchParams.set('angleCardinalSpokes', 'false');
    url.searchParams.set('angleTickStep', '1');
    url.searchParams.set('angleMinorLabelStep', '5');
    url.searchParams.set('angleMajorLabelStep', '10');
    if (!url.searchParams.has('gannzillaAngleMajorFontSize')) {
      url.searchParams.set('gannzillaAngleMajorFontSize', '18');
    }
    if (!url.searchParams.has('gannzillaAngleMinorFontSize')) {
      url.searchParams.set('gannzillaAngleMinorFontSize', '11');
    }
    if (!url.searchParams.has('gannzillaAngleCardinalFontSize')) {
      url.searchParams.set('gannzillaAngleCardinalFontSize', '25');
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

function drawSingleAngleOuterRing(source = 'apply', force = false) {
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
      || emptyRingCount < 3
      || !(baseCssSize > 0)
      || !(expandedCssSize > 0)
      || !(ringWidth > 0)) return false;

  const majorFont = numberParam('gannzillaAngleMajorFontSize', 18, 10, 30);
  const minorFont = numberParam('gannzillaAngleMinorFontSize', 11, 7, 20);
  const cardinalFont = numberParam('gannzillaAngleCardinalFontSize', 25, 16, 38);
  const renderKey = [
    canvas.width,
    canvas.height,
    baseCssSize,
    expandedCssSize,
    ringWidth,
    majorFont,
    minorFont,
    cardinalFont,
  ].join(':');
  if (!force && canvas.dataset.gannzillaSingleAngleRenderKeyV527 === renderKey) return true;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return false;

  const cx = expandedCssSize / 2;
  const cy = expandedCssSize / 2;
  const margin = 90 * appliedZoom;
  const baseOuter = Math.max(1, (baseCssSize - margin * 2) / 2);
  const inner = baseOuter + ringWidth * 2;
  const outer = inner + ringWidth;
  const labelRadius = inner + ringWidth * 0.39;

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

  // Exactly one angle frame outside the weekday ring.
  drawSingleAnnulus(ctx, cx, cy, inner, outer);

  // One-degree protractor ticks contained entirely inside the single frame.
  for (let degree = 0; degree < 360; degree += 1) {
    const cardinal = degree % 90 === 0;
    const major = degree % 10 === 0;
    const medium = degree % 5 === 0;
    const length = cardinal
      ? ringWidth * 0.30
      : major
        ? ringWidth * 0.23
        : medium
          ? ringWidth * 0.16
          : ringWidth * 0.085;
    const outerPoint = polar(cx, cy, outer - 1.5, degree);
    const innerPoint = polar(cx, cy, outer - length, degree);
    ctx.beginPath();
    ctx.moveTo(innerPoint.x, innerPoint.y);
    ctx.lineTo(outerPoint.x, outerPoint.y);
    ctx.strokeStyle = cardinal || major ? BLACK : BRONZE;
    ctx.lineWidth = cardinal ? 2.05 : major ? 1.18 : medium ? 0.82 : 0.42;
    ctx.stroke();
  }

  // No center spokes. Labels remain geometrically aligned to the same center.
  for (let angle = 0; angle < 360; angle += 5) {
    const displayAngle = angle === 0 ? 360 : angle;
    const cardinal = angle % 90 === 0;
    const major = angle % 10 === 0;
    const fontSize = (cardinal ? cardinalFont : major ? majorFont : minorFont) * appliedZoom;
    const radius = major || cardinal
      ? labelRadius
      : labelRadius - ringWidth * 0.13;
    const point = polar(cx, cy, radius, angle);

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

  // Subtle copper guide separating labels from ticks, within the same frame.
  ctx.beginPath();
  ctx.arc(cx, cy, inner + ringWidth * 0.68, 0, TWO_PI);
  ctx.strokeStyle = BRONZE_LIGHT;
  ctx.lineWidth = 0.7;
  ctx.stroke();

  ctx.restore();

  canvas.dataset.gannzillaSingleAngleOuterRingV527 = 'true';
  canvas.dataset.gannzillaSingleAngleRenderKeyV527 = renderKey;
  canvas.dataset.gannzillaAngleFrameCountV527 = '1';
  canvas.dataset.gannzillaAngleTickCountV527 = '360';
  canvas.dataset.gannzillaAngleCardinalsV527 = '360,90,180,270';
  canvas.dataset.gannzillaAngleCardinalSpokesV527 = 'false';
  canvas.dataset.gannzillaAngleMainColorV527 = BLACK;
  canvas.dataset.gannzillaAngleSecondaryColorV527 = BRONZE;
  canvas.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    frameCount: 1,
    tickCount: 360,
    cardinals: [360, 90, 180, 270],
    cardinalSpokes: false,
    mainColor: BLACK,
    secondaryColor: BRONZE,
    majorFont,
    minorFont,
    cardinalFont,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:single-angle-outer-ring-v527', { detail: lastApply }));
  return true;
}

function schedule(source = 'schedule', force = false, delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => drawSingleAngleOuterRing(source, force));
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

  [150, 380, 920, 2100, 4300, 8200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, true), delay);
  });

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => schedule('fonts-ready', true)).catch(() => {});
  }

  window.GANNZILLA_SINGLE_ANGLE_OUTER_RING_V527 = true;
  window.__auditGannzillaSingleAngleOuterRingV527 = () => {
    const canvas = findWheel();
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaSingleAngleOuterRingV527 === 'true'
        && Number(canvas.dataset.gannzillaAngleFrameCountV527) === 1
        && Number(canvas.dataset.gannzillaAngleTickCountV527) === 360
        && canvas.dataset.gannzillaAngleCardinalSpokesV527 === 'false',
      build: BUILD,
      frameCount: Number(canvas?.dataset?.gannzillaAngleFrameCountV527 || 0),
      tickCount: Number(canvas?.dataset?.gannzillaAngleTickCountV527 || 0),
      cardinals: canvas?.dataset?.gannzillaAngleCardinalsV527 || null,
      cardinalSpokes: canvas?.dataset?.gannzillaAngleCardinalSpokesV527 === 'true',
      mainColor: canvas?.dataset?.gannzillaAngleMainColorV527 || null,
      secondaryColor: canvas?.dataset?.gannzillaAngleSecondaryColorV527 || null,
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { drawSingleAngleOuterRing, schedule };
}

install();
