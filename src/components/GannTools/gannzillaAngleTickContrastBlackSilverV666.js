const BUILD = 666;
const STATE_KEY = '__gannzillaAngleTickContrastBlackSilverV666';
const ENABLE_PARAM = 'angleTickContrastBlackSilver';

const MAJOR_BLACK = '#050505';
const MAJOR_GLOW = 'rgba(0, 0, 0, 0.48)';
const SILVER_EDGE = '#737b85';
const SILVER_ONE = '#d8dee6';
const SILVER_FIVE = '#f6f9fc';
const SILVER_GLOW = 'rgba(255, 255, 255, 0.95)';

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
  return wheelMode
    && boolParam('angleOuterRing', false)
    && boolParam('gannzillaAngleMetallicBands', false)
    && boolParam(ENABLE_PARAM, false);
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

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set(ENABLE_PARAM, 'true');
    url.searchParams.set('angleTickHierarchyBlackSilver', 'true');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime rendering remains authoritative.
  }
}

function strokeTick(ctx, innerPoint, outerPoint, style, width, shadowColor, shadowBlur) {
  ctx.beginPath();
  ctx.moveTo(innerPoint.x, innerPoint.y);
  ctx.lineTo(outerPoint.x, outerPoint.y);
  ctx.strokeStyle = style;
  ctx.lineWidth = width;
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = shadowBlur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.stroke();
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
  const bandWidth = numberParam('gannzillaAngleFrameStrokeWidth', 5.6, 3, 12) * zoom;
  const cx = expandedCssSize / 2;
  const cy = expandedCssSize / 2;
  const margin = 90 * zoom;
  const baseOuter = Math.max(1, (baseCssSize - margin * 2) / 2);
  const inner = baseOuter + ringWidth * 2;
  const angleWidth = ringWidth * ringScale;
  const outer = inner + angleWidth;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return false;

  applying = true;
  try {
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

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

      ctx.save();
      if (cardinal || major) {
        strokeTick(
          ctx,
          innerPoint,
          outerPoint,
          MAJOR_BLACK,
          cardinal ? 4.2 : 3.1,
          MAJOR_GLOW,
          cardinal ? 1.8 : 1.25,
        );
      } else {
        const edgeWidth = medium ? 2.9 : 1.9;
        const coreWidth = medium ? 2.0 : 1.25;

        strokeTick(
          ctx,
          innerPoint,
          outerPoint,
          SILVER_EDGE,
          edgeWidth,
          'rgba(0, 0, 0, 0.34)',
          medium ? 1.2 : 0.8,
        );
        strokeTick(
          ctx,
          innerPoint,
          outerPoint,
          medium ? SILVER_FIVE : SILVER_ONE,
          coreWidth,
          SILVER_GLOW,
          medium ? 2.5 : 1.7,
        );
      }
      ctx.restore();
    }

    ctx.restore();

    canvas.dataset.gannzillaAngleTickContrastBlackSilverV666 = 'true';
    canvas.dataset.gannzillaAngleMajorTickPaletteV666 = 'high-contrast-black';
    canvas.dataset.gannzillaAngleMinorTickPaletteV666 = 'high-visibility-silver';
    canvas.dataset.gannzillaAngleTickGeometryChangedV666 = 'false';
    canvas.dataset.gannzillaAuthorityBuild = String(BUILD);
  } finally {
    applying = false;
  }

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    changedArea: 'angle-tick-visibility-only',
    majorTicks: 'high-contrast-black',
    minorTicks: 'high-visibility-silver',
    majorRule: 'angles-divisible-by-10',
    fiveDegreeRule: 'bright-silver',
    oneDegreeRule: 'silver',
    angleLabelsChanged: false,
    angleGeometryChanged: false,
    frameGeometryChanged: false,
    wheelGeometryChanged: false,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:angle-tick-contrast-black-silver-v666', { detail: lastApply }));
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

  [25, 180, 420, 900, 2100, 4300, 8000, 11800].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });

  [
    'gannzilla:metallic-angle-outer-ring-v531',
    'gannzilla:angle-label-band-clock-palette-v663',
    'gannzilla:angle-minor-silver-shine-v664',
    'gannzilla:angle-tick-hierarchy-black-silver-v665',
    'gannzilla:clean-outer-frame-v540',
    'gannzilla:copper-top-correction-v541',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:wheel-input-v459',
    'gannzilla:page-scrollbar-pan-v305',
  ].forEach((name) => window.addEventListener(name, () => schedule(name, 55), false));

  window.addEventListener('resize', () => schedule('window-resize', 100), false);
  watchTimer = window.setInterval(() => schedule('tick-contrast-watch', 0), 900);

  window.GANNZILLA_ANGLE_TICK_CONTRAST_BLACK_SILVER_V666 = true;
  window.__auditGannzillaAngleTickContrastBlackSilverV666 = () => {
    const canvas = findWheel();
    return {
      ok: enabled()
        && canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaAngleTickContrastBlackSilverV666 === 'true'
        && canvas.dataset.gannzillaAngleMajorTickPaletteV666 === 'high-contrast-black'
        && canvas.dataset.gannzillaAngleMinorTickPaletteV666 === 'high-visibility-silver'
        && canvas.dataset.gannzillaAngleTickGeometryChangedV666 === 'false',
      build: BUILD,
      changedArea: 'angle-tick-visibility-only',
      angleLabelsChanged: false,
      angleGeometryChanged: false,
      frameGeometryChanged: false,
      wheelGeometryChanged: false,
      applyCount,
      watchActive: Boolean(watchTimer),
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule };
  schedule('install', 25);
}

install();
