const BUILD = 665;
const STATE_KEY = '__gannzillaAngleTickHierarchyBlackSilverV665';
const ENABLE_PARAM = 'angleTickHierarchyBlackSilver';

const MAJOR_BLACK = '#050505';
const MAJOR_EDGE = 'rgba(0, 0, 0, 0.96)';
const SILVER_DARK = '#747b84';
const SILVER_MID = '#cbd0d7';
const SILVER_LIGHT = '#f8fbff';
const SILVER_EDGE = 'rgba(66, 72, 80, 0.82)';

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

function silverGradient(ctx, innerPoint, outerPoint) {
  const gradient = ctx.createLinearGradient(
    innerPoint.x,
    innerPoint.y,
    outerPoint.x,
    outerPoint.y,
  );
  gradient.addColorStop(0, SILVER_DARK);
  gradient.addColorStop(0.28, SILVER_MID);
  gradient.addColorStop(0.52, SILVER_LIGHT);
  gradient.addColorStop(0.72, '#ffffff');
  gradient.addColorStop(1, SILVER_DARK);
  return gradient;
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set(ENABLE_PARAM, 'true');
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
      ctx.beginPath();
      ctx.moveTo(innerPoint.x, innerPoint.y);
      ctx.lineTo(outerPoint.x, outerPoint.y);

      if (cardinal || major) {
        ctx.strokeStyle = MAJOR_BLACK;
        ctx.lineWidth = cardinal ? 3.15 : 2.15;
        ctx.shadowColor = MAJOR_EDGE;
        ctx.shadowBlur = cardinal ? 1.5 : 1;
      } else {
        ctx.strokeStyle = silverGradient(ctx, innerPoint, outerPoint);
        ctx.lineWidth = medium ? 1.45 : 0.78;
        ctx.shadowColor = SILVER_EDGE;
        ctx.shadowBlur = medium ? 1.35 : 0.75;
      }

      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();

    canvas.dataset.gannzillaAngleTickHierarchyBlackSilverV665 = 'true';
    canvas.dataset.gannzillaAngleMajorTickPaletteV665 = 'clear-black';
    canvas.dataset.gannzillaAngleMinorTickPaletteV665 = 'shiny-silver';
    canvas.dataset.gannzillaAngleTickGeometryChangedV665 = 'false';
    canvas.dataset.gannzillaAuthorityBuild = String(BUILD);
  } finally {
    applying = false;
  }

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    changedArea: 'angle-tick-color-and-clarity-only',
    majorTicks: 'black',
    minorTicks: 'shiny-silver',
    majorRule: 'angles-divisible-by-10',
    minorRule: 'all-other-one-degree-ticks',
    angleLabelsChanged: false,
    angleGeometryChanged: false,
    frameGeometryChanged: false,
    wheelGeometryChanged: false,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:angle-tick-hierarchy-black-silver-v665', { detail: lastApply }));
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
    'gannzilla:clean-outer-frame-v540',
    'gannzilla:copper-top-correction-v541',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:wheel-input-v459',
    'gannzilla:page-scrollbar-pan-v305',
  ].forEach((name) => window.addEventListener(name, () => schedule(name, 45), false));

  window.addEventListener('resize', () => schedule('window-resize', 90), false);
  watchTimer = window.setInterval(() => schedule('tick-hierarchy-watch', 0), 900);

  window.GANNZILLA_ANGLE_TICK_HIERARCHY_BLACK_SILVER_V665 = true;
  window.__auditGannzillaAngleTickHierarchyBlackSilverV665 = () => {
    const canvas = findWheel();
    return {
      ok: enabled()
        && canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaAngleTickHierarchyBlackSilverV665 === 'true'
        && canvas.dataset.gannzillaAngleMajorTickPaletteV665 === 'clear-black'
        && canvas.dataset.gannzillaAngleMinorTickPaletteV665 === 'shiny-silver'
        && canvas.dataset.gannzillaAngleTickGeometryChangedV665 === 'false',
      build: BUILD,
      changedArea: 'angle-tick-color-and-clarity-only',
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
