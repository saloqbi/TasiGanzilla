const BUILD = 531;
const STATE_KEY = '__gannzillaMetallicAngleOuterRingV531';
const CELL_FILL = '#ffffff';
const BLACK = '#111111';
const BRONZE = '#a95321';
const BRONZE_DARK = '#6f2f12';
const BRONZE_MID = '#b8652f';
const BRONZE_LIGHT = '#efb07a';
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

function fillAnnulus(ctx, cx, cy, inner, outer) {
  ctx.beginPath();
  ctx.arc(cx, cy, outer, 0, TWO_PI);
  ctx.arc(cx, cy, inner, TWO_PI, 0, true);
  ctx.closePath();
  ctx.fillStyle = CELL_FILL;
  ctx.fill();
}

function drawMetallicBand(ctx, cx, cy, radius, width) {
  const half = width / 2;
  const gradient = ctx.createRadialGradient(
    cx, cy, Math.max(1, radius - half),
    cx, cy, radius + half,
  );
  gradient.addColorStop(0, BRONZE_DARK);
  gradient.addColorStop(0.18, BRONZE_MID);
  gradient.addColorStop(0.42, BRONZE_LIGHT);
  gradient.addColorStop(0.58, '#f6c49a');
  gradient.addColorStop(0.78, BRONZE_MID);
  gradient.addColorStop(1, BRONZE_DARK);

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TWO_PI);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = width;
  ctx.stroke();

  [radius - half, radius + half].forEach((edgeRadius) => {
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(1, edgeRadius), 0, TWO_PI);
    ctx.strokeStyle = BRONZE_DARK;
    ctx.lineWidth = 0.9;
    ctx.stroke();
  });
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
    url.searchParams.set('gannzillaAngleMetallicBands', 'true');
    url.searchParams.set('gannzillaAngleFrameStrokeWidth', '5.6');
    url.searchParams.set('gannzillaAngleMajorFontSize', '46');
    url.searchParams.set('gannzillaAngleMinorFontSize', '30');
    url.searchParams.set('gannzillaAngleCardinalFontSize', '64');
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

function drawMetallicAngleOuterRing(source = 'apply', force = false) {
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

  const ringScale = numberParam('gannzillaAngleRingScale', 2, 1.7, 2);
  const bandWidth = numberParam('gannzillaAngleFrameStrokeWidth', 5.6, 3, 12) * appliedZoom;
  const majorFont = numberParam('gannzillaAngleMajorFontSize', 46, 20, 48);
  const minorFont = numberParam('gannzillaAngleMinorFontSize', 30, 11, 32);
  const cardinalFont = numberParam('gannzillaAngleCardinalFontSize', 64, 28, 68);
  const renderKey = [
    canvas.width,
    canvas.height,
    baseCssSize,
    expandedCssSize,
    ringWidth,
    ringScale,
    bandWidth,
    majorFont,
    minorFont,
    cardinalFont,
  ].join(':');
  if (!force && canvas.dataset.gannzillaMetallicAngleRenderKeyV531 === renderKey) return true;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return false;

  const cx = expandedCssSize / 2;
  const cy = expandedCssSize / 2;
  const margin = 90 * appliedZoom;
  const baseOuter = Math.max(1, (baseCssSize - margin * 2) / 2);
  const inner = baseOuter + ringWidth * 2;
  const angleWidth = ringWidth * ringScale;
  const outer = inner + angleWidth;
  const majorRadius = inner + angleWidth * 0.42;
  const minorRadius = inner + angleWidth * 0.25;

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

  // Preserve the approved geometry: only the angle-label typography is enlarged.
  fillAnnulus(ctx, cx, cy, inner, outer);
  drawMetallicBand(ctx, cx, cy, inner, bandWidth);
  drawMetallicBand(ctx, cx, cy, outer, bandWidth);

  // One-degree protractor ticks inside the same frame.
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
    const outerPoint = polar(cx, cy, outer - bandWidth * 0.72, degree);
    const innerPoint = polar(cx, cy, outer - length, degree);
    ctx.beginPath();
    ctx.moveTo(innerPoint.x, innerPoint.y);
    ctx.lineTo(outerPoint.x, outerPoint.y);
    ctx.strokeStyle = cardinal || major ? BLACK : BRONZE;
    ctx.lineWidth = cardinal ? 2.35 : major ? 1.45 : medium ? 0.95 : 0.48;
    ctx.stroke();
  }

  // Major 10-degree labels, minor 5-degree labels and four cardinals.
  for (let angle = 0; angle < 360; angle += 5) {
    const displayAngle = angle === 0 ? 360 : angle;
    const cardinal = angle % 90 === 0;
    const major = angle % 10 === 0;
    const fontSize = (cardinal ? cardinalFont : major ? majorFont : minorFont) * appliedZoom;
    const point = polar(cx, cy, major || cardinal ? majorRadius : minorRadius, angle);

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

  ctx.restore();

  canvas.dataset.gannzillaMetallicAngleOuterRingV531 = 'true';
  canvas.dataset.gannzillaMetallicAngleRenderKeyV531 = renderKey;
  canvas.dataset.gannzillaAngleFrameCountV531 = '1';
  canvas.dataset.gannzillaAngleTickCountV531 = '360';
  canvas.dataset.gannzillaAngleCardinalsV531 = '360,90,180,270';
  canvas.dataset.gannzillaAngleCardinalSpokesV531 = 'false';
  canvas.dataset.gannzillaAngleBandWidthV531 = String(bandWidth / appliedZoom);
  canvas.dataset.gannzillaAngleGuideCircleV531 = 'false';
  canvas.dataset.gannzillaAngleMajorFontSizeV531 = String(majorFont);
  canvas.dataset.gannzillaAngleMinorFontSizeV531 = String(minorFont);
  canvas.dataset.gannzillaAngleCardinalFontSizeV531 = String(cardinalFont);
  canvas.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    frameCount: 1,
    tickCount: 360,
    cardinals: [360, 90, 180, 270],
    cardinalSpokes: false,
    guideCircle: false,
    metallicBands: true,
    bandWidth: bandWidth / appliedZoom,
    majorFont,
    minorFont,
    cardinalFont,
    geometryChanged: false,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:metallic-angle-outer-ring-v531', { detail: lastApply }));
  return true;
}

function schedule(source = 'schedule', force = false, delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => drawMetallicAngleOuterRing(source, force));
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

  window.GANNZILLA_METALLIC_ANGLE_OUTER_RING_V531 = true;
  window.__auditGannzillaMetallicAngleOuterRingV531 = () => {
    const canvas = findWheel();
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaMetallicAngleOuterRingV531 === 'true'
        && Number(canvas.dataset.gannzillaAngleFrameCountV531) === 1
        && Number(canvas.dataset.gannzillaAngleTickCountV531) === 360
        && canvas.dataset.gannzillaAngleCardinalSpokesV531 === 'false'
        && canvas.dataset.gannzillaAngleGuideCircleV531 === 'false'
        && Number(canvas.dataset.gannzillaAngleMajorFontSizeV531) === 46
        && Number(canvas.dataset.gannzillaAngleMinorFontSizeV531) === 30
        && Number(canvas.dataset.gannzillaAngleCardinalFontSizeV531) === 64,
      build: BUILD,
      frameCount: Number(canvas?.dataset?.gannzillaAngleFrameCountV531 || 0),
      tickCount: Number(canvas?.dataset?.gannzillaAngleTickCountV531 || 0),
      cardinals: canvas?.dataset?.gannzillaAngleCardinalsV531 || null,
      cardinalSpokes: canvas?.dataset?.gannzillaAngleCardinalSpokesV531 === 'true',
      guideCircle: canvas?.dataset?.gannzillaAngleGuideCircleV531 === 'true',
      bandWidth: Number(canvas?.dataset?.gannzillaAngleBandWidthV531 || 0),
      majorFont: Number(canvas?.dataset?.gannzillaAngleMajorFontSizeV531 || 0),
      minorFont: Number(canvas?.dataset?.gannzillaAngleMinorFontSizeV531 || 0),
      cardinalFont: Number(canvas?.dataset?.gannzillaAngleCardinalFontSizeV531 || 0),
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { drawMetallicAngleOuterRing, schedule };
}

install();