const BUILD = 525;
const STATE_KEY = '__gannzillaAngleOuterRingV525';
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

function drawAnnulus(ctx, cx, cy, inner, outer, fill, stroke, lineWidth) {
  ctx.beginPath();
  ctx.arc(cx, cy, outer, 0, TWO_PI);
  ctx.arc(cx, cy, inner, TWO_PI, 0, true);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
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
    url.searchParams.set('angleFrameCount', '2');
    url.searchParams.set('angleTickStep', '1');
    url.searchParams.set('angleMinorLabelStep', '5');
    url.searchParams.set('angleMajorLabelStep', '10');
    url.searchParams.set('angleCardinalSpokes', 'true');
    if (!url.searchParams.has('gannzillaAngleMajorFontSize')) {
      url.searchParams.set('gannzillaAngleMajorFontSize', '20');
    }
    if (!url.searchParams.has('gannzillaAngleMinorFontSize')) {
      url.searchParams.set('gannzillaAngleMinorFontSize', '12');
    }
    if (!url.searchParams.has('gannzillaAngleCardinalFontSize')) {
      url.searchParams.set('gannzillaAngleCardinalFontSize', '28');
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

function drawAngleOuterRing(source = 'apply', force = false) {
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

  const majorFont = numberParam('gannzillaAngleMajorFontSize', 20, 10, 34);
  const minorFont = numberParam('gannzillaAngleMinorFontSize', 12, 7, 24);
  const cardinalFont = numberParam('gannzillaAngleCardinalFontSize', 28, 16, 42);
  const fullSpokes = boolParam('angleCardinalSpokes', true);
  const renderKey = [
    canvas.width,
    canvas.height,
    baseCssSize,
    expandedCssSize,
    ringWidth,
    majorFont,
    minorFont,
    cardinalFont,
    fullSpokes,
  ].join(':');
  if (!force && canvas.dataset.gannzillaAngleRenderKeyV525 === renderKey) return true;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return false;

  const cx = expandedCssSize / 2;
  const cy = expandedCssSize / 2;
  const margin = 90 * appliedZoom;
  const baseOuter = Math.max(1, (baseCssSize - margin * 2) / 2);
  const labelInner = baseOuter + ringWidth * 2;
  const labelOuter = labelInner + ringWidth;
  const tickInner = labelOuter;
  const tickOuter = tickInner + ringWidth;
  const labelRadius = labelInner + ringWidth * 0.52;
  const centerRadius = numberParam(
    'expandedCenterRadius',
    numberParam('originalCenterRadius', 163, 20, 1000),
    20,
    1200,
  ) * appliedZoom;

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

  // Four exact cardinal spokes: 360, 90, 180, 270.
  if (fullSpokes) {
    ctx.save();
    ctx.strokeStyle = BLACK;
    ctx.globalAlpha = 0.32;
    ctx.lineWidth = Math.max(0.9, 1.05 * appliedZoom);
    [0, 90, 180, 270].forEach((angle) => {
      const start = polar(cx, cy, centerRadius, angle);
      const end = polar(cx, cy, labelInner, angle);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    });
    ctx.restore();
  }

  // Two copper frames outside the weekday ring.
  drawAnnulus(ctx, cx, cy, labelInner, labelOuter, CELL_FILL, BRONZE_DARK, 1.25);
  drawAnnulus(ctx, cx, cy, tickInner, tickOuter, CELL_FILL, BRONZE, 1.8);

  // Ten-degree separators in the inner angle frame.
  for (let angle = 0; angle < 360; angle += 10) {
    const start = polar(cx, cy, labelInner, angle);
    const end = polar(cx, cy, labelOuter, angle);
    const cardinal = angle % 90 === 0;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = cardinal ? BLACK : BRONZE_LIGHT;
    ctx.lineWidth = cardinal ? 2.15 : 0.72;
    ctx.stroke();
  }

  // One-degree protractor ticks in the outer frame.
  for (let degree = 0; degree < 360; degree += 1) {
    const cardinal = degree % 90 === 0;
    const major = degree % 10 === 0;
    const medium = degree % 5 === 0;
    const length = cardinal
      ? ringWidth * 0.82
      : major
        ? ringWidth * 0.64
        : medium
          ? ringWidth * 0.48
          : ringWidth * 0.27;
    const outerPoint = polar(cx, cy, tickOuter - 1.5, degree);
    const innerPoint = polar(cx, cy, tickOuter - length, degree);
    ctx.beginPath();
    ctx.moveTo(innerPoint.x, innerPoint.y);
    ctx.lineTo(outerPoint.x, outerPoint.y);
    ctx.strokeStyle = cardinal || major ? BLACK : BRONZE;
    ctx.lineWidth = cardinal ? 2.35 : major ? 1.35 : medium ? 0.95 : 0.5;
    ctx.stroke();
  }

  // Reinforce cardinal rays through both angle frames.
  [0, 90, 180, 270].forEach((angle) => {
    const start = polar(cx, cy, labelInner, angle);
    const end = polar(cx, cy, tickOuter, angle);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 2.35;
    ctx.stroke();
  });

  // Major black labels every 10 degrees; bronze minor labels at 5-degree offsets.
  for (let angle = 0; angle < 360; angle += 5) {
    const displayAngle = angle === 0 ? 360 : angle;
    const cardinal = angle % 90 === 0;
    const major = angle % 10 === 0;
    const fontSize = (cardinal ? cardinalFont : major ? majorFont : minorFont) * appliedZoom;
    const radius = major || cardinal
      ? labelRadius + ringWidth * 0.02
      : labelRadius - ringWidth * 0.18;
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

  // Crisp copper boundaries for the two-frame assembly.
  [labelInner, labelOuter, tickOuter].forEach((radius, index) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TWO_PI);
    ctx.strokeStyle = index === 2 ? BRONZE : BRONZE_DARK;
    ctx.lineWidth = index === 2 ? 2.4 : 1.35;
    ctx.stroke();
  });

  ctx.restore();

  canvas.dataset.gannzillaAngleOuterRingV525 = 'true';
  canvas.dataset.gannzillaAngleRenderKeyV525 = renderKey;
  canvas.dataset.gannzillaAngleFrameCountV525 = '2';
  canvas.dataset.gannzillaAngleTickCountV525 = '360';
  canvas.dataset.gannzillaAngleMajorLabelsV525 = '36';
  canvas.dataset.gannzillaAngleMinorLabelsV525 = '36';
  canvas.dataset.gannzillaAngleCardinalsV525 = '360,90,180,270';
  canvas.dataset.gannzillaAngleMainColorV525 = BLACK;
  canvas.dataset.gannzillaAngleSecondaryColorV525 = BRONZE;
  canvas.dataset.gannzillaAngleSpokesV525 = fullSpokes ? 'true' : 'false';
  canvas.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    frameCount: 2,
    tickCount: 360,
    majorLabels: 36,
    minorLabels: 36,
    cardinals: [360, 90, 180, 270],
    mainColor: BLACK,
    secondaryColor: BRONZE,
    majorFont,
    minorFont,
    cardinalFont,
    fullSpokes,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:angle-outer-ring-v525', { detail: lastApply }));
  return true;
}

function schedule(source = 'schedule', force = false, delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => drawAngleOuterRing(source, force));
  }, delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !wheelMode()
      || window[STATE_KEY]) return;

  persistFlags();

  window.addEventListener('gannzilla:weekdays-outer-ring-v523', () => {
    schedule('weekdays-v523', true, 20);
  }, false);
  window.addEventListener('gannzilla:zodiac-outer-ring-v522', () => {
    schedule('zodiac-v522', true, 40);
  }, false);
  window.addEventListener('gannzilla:empty-outer-ring-v518', () => {
    schedule('outer-ring-v518', true, 60);
  }, false);
  window.addEventListener('resize', () => schedule('resize'), false);

  [140, 360, 900, 2000, 4200, 8200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, true), delay);
  });

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => schedule('fonts-ready', true)).catch(() => {});
  }

  window.GANNZILLA_ANGLE_OUTER_RING_V525 = true;
  window.__auditGannzillaAngleOuterRingV525 = () => {
    const canvas = findWheel();
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaAngleOuterRingV525 === 'true'
        && Number(canvas.dataset.gannzillaAngleFrameCountV525) === 2
        && Number(canvas.dataset.gannzillaAngleTickCountV525) === 360
        && canvas.dataset.gannzillaAngleCardinalsV525 === '360,90,180,270',
      build: BUILD,
      frameCount: Number(canvas?.dataset?.gannzillaAngleFrameCountV525 || 0),
      tickCount: Number(canvas?.dataset?.gannzillaAngleTickCountV525 || 0),
      majorLabels: Number(canvas?.dataset?.gannzillaAngleMajorLabelsV525 || 0),
      minorLabels: Number(canvas?.dataset?.gannzillaAngleMinorLabelsV525 || 0),
      cardinals: canvas?.dataset?.gannzillaAngleCardinalsV525 || null,
      mainColor: canvas?.dataset?.gannzillaAngleMainColorV525 || null,
      secondaryColor: canvas?.dataset?.gannzillaAngleSecondaryColorV525 || null,
      spokes: canvas?.dataset?.gannzillaAngleSpokesV525 === 'true',
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { drawAngleOuterRing, schedule };
}

install();
