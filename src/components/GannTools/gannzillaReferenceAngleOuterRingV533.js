const BUILD = 533;
const STATE_KEY = '__gannzillaReferenceAngleOuterRingV533';
const CELL_FILL = '#ffffff';
const BLACK = '#111111';
const BRONZE = '#c44f0a';
const BRONZE_DARK = '#6f2608';
const BRONZE_MID = '#bb4e12';
const BRONZE_LIGHT = '#f2a15f';
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
  gradient.addColorStop(0, '#5f1f06');
  gradient.addColorStop(0.10, '#8f3008');
  gradient.addColorStop(0.24, '#d35f18');
  gradient.addColorStop(0.39, '#ffad68');
  gradient.addColorStop(0.50, '#ffe1bd');
  gradient.addColorStop(0.61, '#f1873f');
  gradient.addColorStop(0.78, '#aa3b0a');
  gradient.addColorStop(0.92, '#6d2105');
  gradient.addColorStop(1, '#3f1303');

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TWO_PI);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = width;
  ctx.stroke();

  [radius - half, radius + half].forEach((edgeRadius, index) => {
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(1, edgeRadius), 0, TWO_PI);
    ctx.strokeStyle = index === 0 ? '#512008' : '#9b3608';
    ctx.lineWidth = 1.15;
    ctx.stroke();
  });
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('emptyOuterRing', 'true');
    url.searchParams.set('emptyOuterRingCount', '5');
    url.searchParams.set('zodiacOuterRing', 'true');
    url.searchParams.set('weekdaysOuterRing', 'true');
    url.searchParams.set('angleOuterRing', 'true');
    url.searchParams.set('angleFrameCount', '1');
    url.searchParams.set('angleCardinalSpokes', 'false');
    url.searchParams.set('gannzillaAngleRingScale', '2.75');
    url.searchParams.set('gannzillaAngleMetallicBands', 'true');
    if (!url.searchParams.has('gannzillaAngleFrameStrokeWidth')) {
      url.searchParams.set('gannzillaAngleFrameStrokeWidth', '11.5');
    }
    if (!url.searchParams.has('gannzillaAngleMajorFontSize')) {
      url.searchParams.set('gannzillaAngleMajorFontSize', '40');
    }
    if (!url.searchParams.has('gannzillaAngleMinorFontSize')) {
      url.searchParams.set('gannzillaAngleMinorFontSize', '26');
    }
    if (!url.searchParams.has('gannzillaAngleCardinalFontSize')) {
      url.searchParams.set('gannzillaAngleCardinalFontSize', '58');
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

function drawReferenceAngleOuterRing(source = 'apply', force = false) {
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
      || emptyRingCount < 5
      || !(baseCssSize > 0)
      || !(expandedCssSize > 0)
      || !(ringWidth > 0)) return false;

  const ringScale = numberParam('gannzillaAngleRingScale', 2.75, 2.2, 2.9);
  const bandWidth = numberParam('gannzillaAngleFrameStrokeWidth', 11.5, 7, 18) * appliedZoom;
  const majorFont = numberParam('gannzillaAngleMajorFontSize', 40, 26, 50);
  const minorFont = numberParam('gannzillaAngleMinorFontSize', 26, 16, 34);
  const cardinalFont = numberParam('gannzillaAngleCardinalFontSize', 58, 38, 68);
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
  if (!force && canvas.dataset.gannzillaReferenceAngleRenderKeyV533 === renderKey) return true;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return false;

  const cx = expandedCssSize / 2;
  const cy = expandedCssSize / 2;
  const margin = 90 * appliedZoom;
  const baseOuter = Math.max(1, (baseCssSize - margin * 2) / 2);
  const inner = baseOuter + ringWidth * 2;
  const angleWidth = ringWidth * ringScale;
  const outer = inner + angleWidth;
  const tickOuter = outer - bandWidth * 0.78;
  const majorRadius = inner + angleWidth * 0.51;
  const minorRadius = inner + angleWidth * 0.33;

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

  // One wide angle ring with exactly two thick, equal metallic copper bands.
  fillAnnulus(ctx, cx, cy, inner, outer);
  drawMetallicBand(ctx, cx, cy, inner, bandWidth);
  drawMetallicBand(ctx, cx, cy, outer, bandWidth);

  // Fine black degree ticks with stronger orange 5°/10° ticks, all inside the same ring.
  for (let degree = 0; degree < 360; degree += 1) {
    const cardinal = degree % 90 === 0;
    const major = degree % 10 === 0;
    const medium = degree % 5 === 0;
    const length = cardinal
      ? angleWidth * 0.24
      : major
        ? angleWidth * 0.19
        : medium
          ? angleWidth * 0.14
          : angleWidth * 0.075;
    const outerPoint = polar(cx, cy, tickOuter, degree);
    const innerPoint = polar(cx, cy, tickOuter - length, degree);
    ctx.beginPath();
    ctx.moveTo(innerPoint.x, innerPoint.y);
    ctx.lineTo(outerPoint.x, outerPoint.y);
    ctx.strokeStyle = cardinal || major || medium ? BRONZE : BLACK;
    ctx.globalAlpha = cardinal || major ? 1 : medium ? 0.96 : 0.82;
    ctx.lineWidth = cardinal ? 3.1 : major ? 2.35 : medium ? 1.55 : 0.74;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Large, readable labels matching the approved visual reference. No 0° duplicate.
  for (let angle = 0; angle < 360; angle += 5) {
    const displayAngle = angle === 0 ? 360 : angle;
    const cardinal = angle % 90 === 0;
    const major = angle % 10 === 0;
    const fontSize = (cardinal ? cardinalFont : major ? majorFont : minorFont) * appliedZoom;
    const radius = major || cardinal ? majorRadius : minorRadius;
    const point = polar(cx, cy, radius, angle);

    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate((readableRotation(angle) * Math.PI) / 180);
    ctx.font = `${cardinal ? 800 : 700} ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = major || cardinal ? BLACK : BRONZE;
    ctx.fillText(`${displayAngle}°`, 0, 0);
    ctx.restore();
  }

  ctx.restore();

  canvas.dataset.gannzillaReferenceAngleOuterRingV533 = 'true';
  canvas.dataset.gannzillaReferenceAngleRenderKeyV533 = renderKey;
  canvas.dataset.gannzillaAngleFrameCountV533 = '1';
  canvas.dataset.gannzillaAngleBandCountV533 = '2';
  canvas.dataset.gannzillaAngleTickCountV533 = '360';
  canvas.dataset.gannzillaAngleCardinalsV533 = '360,90,180,270';
  canvas.dataset.gannzillaAngleCardinalSpokesV533 = 'false';
  canvas.dataset.gannzillaAngleBandWidthV533 = String(bandWidth / appliedZoom);
  canvas.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    frameCount: 1,
    bandCount: 2,
    tickCount: 360,
    cardinals: [360, 90, 180, 270],
    cardinalSpokes: false,
    ringScale,
    bandWidth: bandWidth / appliedZoom,
    majorFont,
    minorFont,
    cardinalFont,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:reference-angle-outer-ring-v533', { detail: lastApply }));
  return true;
}

function schedule(source = 'schedule', force = false, delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => drawReferenceAngleOuterRing(source, force));
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
    schedule('outer-ring-v518', true, 75);
  }, false);
  window.addEventListener('resize', () => schedule('resize'), false);

  [160, 420, 980, 2200, 4500, 8600].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, true), delay);
  });

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => schedule('fonts-ready', true)).catch(() => {});
  }

  window.GANNZILLA_REFERENCE_ANGLE_OUTER_RING_V533 = true;
  window.__auditGannzillaReferenceAngleOuterRingV533 = () => {
    const canvas = findWheel();
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaReferenceAngleOuterRingV533 === 'true'
        && Number(canvas.dataset.gannzillaAngleFrameCountV533) === 1
        && Number(canvas.dataset.gannzillaAngleBandCountV533) === 2
        && Number(canvas.dataset.gannzillaAngleTickCountV533) === 360
        && canvas.dataset.gannzillaAngleCardinalSpokesV533 === 'false',
      build: BUILD,
      frameCount: Number(canvas?.dataset?.gannzillaAngleFrameCountV533 || 0),
      bandCount: Number(canvas?.dataset?.gannzillaAngleBandCountV533 || 0),
      tickCount: Number(canvas?.dataset?.gannzillaAngleTickCountV533 || 0),
      cardinals: canvas?.dataset?.gannzillaAngleCardinalsV533 || null,
      cardinalSpokes: canvas?.dataset?.gannzillaAngleCardinalSpokesV533 === 'true',
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { drawReferenceAngleOuterRing, schedule };
}

install();