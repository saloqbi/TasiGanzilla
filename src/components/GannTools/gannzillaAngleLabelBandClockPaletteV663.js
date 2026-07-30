const BUILD = 663;
const STATE_KEY = '__gannzillaAngleLabelBandClockPaletteV663';
const ENABLE_PARAM = 'angleLabelBandClockPalette';
const TWO_PI = Math.PI * 2;

// Exact warm bronze/gold palette used by the approved inner center-clock frame.
const CLOCK_DARK = '#382015';
const CLOCK_DEEP = '#70401f';
const CLOCK_MID = '#8b512b';
const CLOCK_GOLD = '#c9954f';
const CLOCK_LIGHT = '#f1d49b';
const BLACK = '#111111';
const BRONZE = '#a95321';

let frame = 0;
let timer = 0;
let watchTimer = 0;
let applying = false;
let applyCount = 0;
let lastApply = null;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
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

function enabled() {
  const query = params();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  return wheelMode && boolParam(ENABLE_PARAM, false);
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

function fillAnnulus(ctx, cx, cy, inner, outer, fillStyle) {
  ctx.beginPath();
  ctx.arc(cx, cy, outer, 0, TWO_PI);
  ctx.arc(cx, cy, Math.max(1, inner), TWO_PI, 0, true);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function clockPaletteGradient(ctx, cx, cy, inner, outer) {
  const gradient = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
  gradient.addColorStop(0, CLOCK_DARK);
  gradient.addColorStop(0.10, CLOCK_DEEP);
  gradient.addColorStop(0.28, CLOCK_MID);
  gradient.addColorStop(0.50, CLOCK_GOLD);
  gradient.addColorStop(0.72, CLOCK_LIGHT);
  gradient.addColorStop(0.88, CLOCK_GOLD);
  gradient.addColorStop(1, CLOCK_DARK);
  return gradient;
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set(ENABLE_PARAM, 'true');
    url.searchParams.set('angleInnerFrameClockPalette', 'true');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime rendering remains authoritative.
  }
}

function apply(source = 'apply') {
  frame = 0;
  if (!enabled() || applying) return false;

  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement)
      || canvas.dataset.gannzillaMetallicAngleOuterRingV531 !== 'true') return false;

  const divisions = Number(canvas.dataset.gannzillaEmptyOuterRingDivisionsV518 || 0);
  const baseCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingBaseCssSizeV518 || 0);
  const expandedCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518 || 0);
  const ringWidth = Number(canvas.dataset.gannzillaEmptyOuterRingWidthV518 || 0);
  const dpr = Math.max(1, Number(canvas.dataset.gannzillaNativeDpr)
    || (expandedCssSize > 0 ? canvas.width / expandedCssSize : 0)
    || Number(window.devicePixelRatio)
    || 1);
  const zoom = Math.max(0.5, Number(canvas.dataset.gannzillaAppliedZoom) || 1);

  if (divisions !== 36
      || !(baseCssSize > 0)
      || !(expandedCssSize > 0)
      || !(ringWidth > 0)) return false;

  const ringScale = numberParam('gannzillaAngleRingScale', 2, 1.7, 2);
  const baseFrameWidth = numberParam('gannzillaAngleFrameStrokeWidth', 5.6, 3, 12) * zoom;
  const innerFrameWidth = boolParam('angleInnerFrameClockPalette', true)
    ? numberParam('gannzillaAngleInnerFrameStrokeWidth', 10, 5.6, 16) * zoom
    : baseFrameWidth / 2;
  const majorFont = numberParam('gannzillaAngleMajorFontSize', 48, 20, 48);
  const minorFont = numberParam('gannzillaAngleMinorFontSize', 42, 11, 44);
  const cardinalFont = numberParam('gannzillaAngleCardinalFontSize', 68, 28, 68);

  const cx = expandedCssSize / 2;
  const cy = expandedCssSize / 2;
  const margin = 90 * zoom;
  const baseOuter = Math.max(1, (baseCssSize - margin * 2) / 2);
  const angleInnerRadius = baseOuter + ringWidth * 2;
  const angleWidth = ringWidth * ringScale;
  const angleOuterRadius = angleInnerRadius + angleWidth;

  // Preserve both approved frames. Only replace the former white label field.
  const labelBandInner = angleInnerRadius + Math.max(baseFrameWidth / 2, innerFrameWidth);
  const labelBandOuter = angleOuterRadius - baseFrameWidth / 2;
  if (!(labelBandOuter > labelBandInner)) return false;

  const majorRadius = angleInnerRadius + angleWidth * 0.42;
  const minorRadius = angleInnerRadius + angleWidth * 0.25;
  const tickOuter = angleOuterRadius - baseFrameWidth * 0.72;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return false;

  applying = true;
  try {
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.setLineDash([]);
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    fillAnnulus(
      ctx,
      cx,
      cy,
      labelBandInner,
      labelBandOuter,
      clockPaletteGradient(ctx, cx, cy, labelBandInner, labelBandOuter),
    );

    // Restore every degree tick above the new metallic label-band background.
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
      const outerPoint = polar(cx, cy, tickOuter, degree);
      const innerPoint = polar(cx, cy, tickOuter - length, degree);
      ctx.beginPath();
      ctx.moveTo(innerPoint.x, innerPoint.y);
      ctx.lineTo(outerPoint.x, outerPoint.y);
      ctx.strokeStyle = cardinal || major ? BLACK : BRONZE;
      ctx.lineWidth = cardinal ? 2.35 : major ? 1.45 : medium ? 0.95 : 0.48;
      ctx.stroke();
    }

    // Restore the original angle values and typography without moving any label.
    for (let angle = 0; angle < 360; angle += 5) {
      const displayAngle = angle === 0 ? 360 : angle;
      const cardinal = angle % 90 === 0;
      const major = angle % 10 === 0;
      const fontSize = (cardinal ? cardinalFont : major ? majorFont : minorFont) * zoom;
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

    canvas.dataset.gannzillaAngleLabelBandClockPaletteV663 = 'true';
    canvas.dataset.gannzillaAngleLabelBandFillV663 = 'center-clock-frame-palette';
    canvas.dataset.gannzillaAngleLabelBandInnerRadiusV663 = String(labelBandInner);
    canvas.dataset.gannzillaAngleLabelBandOuterRadiusV663 = String(labelBandOuter);
    canvas.dataset.gannzillaAngleFramesChangedV663 = 'false';
    canvas.dataset.gannzillaAngleLabelsChangedV663 = 'false';
    canvas.dataset.gannzillaAuthorityBuild = String(BUILD);
  } finally {
    applying = false;
  }

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    matchedTo: 'center-clock-frame-v657',
    changedArea: 'angle-label-background-only',
    previousFill: '#ffffff',
    currentFill: 'center-clock-frame-palette',
    innerFrameChanged: false,
    outerFrameChanged: false,
    angleGeometryChanged: false,
    angleLabelsChanged: false,
    wheelGeometryChanged: false,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:angle-label-band-clock-palette-v663', { detail: lastApply }));
  return true;
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => apply(source));
  }, delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  persistFlags();

  [0, 140, 360, 860, 1900, 4000, 7800, 11600].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });

  [
    'gannzilla:metallic-angle-outer-ring-v531',
    'gannzilla:clean-outer-frame-v540',
    'gannzilla:copper-top-correction-v541',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:wheel-input-v459',
    'gannzilla:page-scrollbar-pan-v305',
  ].forEach((name) => window.addEventListener(name, () => schedule(name, 55), false));

  window.addEventListener('resize', () => schedule('window-resize', 70), false);
  watchTimer = window.setInterval(() => schedule('label-band-watch', 0), 1300);

  window.GANNZILLA_ANGLE_LABEL_BAND_CLOCK_PALETTE_V663 = true;
  window.__auditGannzillaAngleLabelBandClockPaletteV663 = () => {
    const canvas = findWheel();
    return {
      ok: enabled()
        && canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaAngleLabelBandClockPaletteV663 === 'true'
        && canvas.dataset.gannzillaAngleLabelBandFillV663 === 'center-clock-frame-palette'
        && canvas.dataset.gannzillaAngleFramesChangedV663 === 'false'
        && canvas.dataset.gannzillaAngleLabelsChangedV663 === 'false',
      build: BUILD,
      matchedTo: 'center-clock-frame-v657',
      changedArea: 'angle-label-background-only',
      innerFrameChanged: false,
      outerFrameChanged: false,
      angleGeometryChanged: false,
      angleLabelsChanged: false,
      wheelGeometryChanged: false,
      applyCount,
      watchActive: Boolean(watchTimer),
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule };
  schedule('install');
}

install();
