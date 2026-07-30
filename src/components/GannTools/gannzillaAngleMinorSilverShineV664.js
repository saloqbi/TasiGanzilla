const BUILD = 664;
const STATE_KEY = '__gannzillaAngleMinorSilverShineV664';
const ENABLE_PARAM = 'angleMinorLabelsSilverShine';

const SILVER_DARK = '#69727c';
const SILVER_MID = '#c8ced6';
const SILVER_LIGHT = '#f8fbff';
const SILVER_EDGE = 'rgba(47, 52, 58, 0.92)';

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
    && boolParam('angleLabelBandClockPalette', false)
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

function readableRotation(angle) {
  const normalized = ((angle % 360) + 360) % 360;
  return normalized > 90 && normalized < 270 ? normalized + 180 : normalized;
}

function silverGradient(ctx, fontSize) {
  const gradient = ctx.createLinearGradient(0, -fontSize * 0.58, 0, fontSize * 0.58);
  gradient.addColorStop(0, SILVER_DARK);
  gradient.addColorStop(0.20, SILVER_MID);
  gradient.addColorStop(0.43, SILVER_LIGHT);
  gradient.addColorStop(0.58, '#ffffff');
  gradient.addColorStop(0.78, SILVER_MID);
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
      || canvas.dataset.gannzillaAngleLabelBandClockPaletteV663 !== 'true') return false;

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
  const minorFont = numberParam('gannzillaAngleMinorFontSize', 42, 11, 44);
  const cx = expandedCssSize / 2;
  const cy = expandedCssSize / 2;
  const margin = 90 * zoom;
  const baseOuter = Math.max(1, (baseCssSize - margin * 2) / 2);
  const angleInnerRadius = baseOuter + ringWidth * 2;
  const angleWidth = ringWidth * ringScale;
  const minorRadius = angleInnerRadius + angleWidth * 0.25;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return false;

  applying = true;
  try {
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    for (let angle = 0; angle < 360; angle += 5) {
      const cardinal = angle % 90 === 0;
      const major = angle % 10 === 0;
      if (cardinal || major) continue;

      const displayAngle = angle === 0 ? 360 : angle;
      const fontSize = minorFont * zoom;
      const point = polar(cx, cy, minorRadius, angle);

      ctx.save();
      ctx.translate(point.x, point.y);
      ctx.rotate((readableRotation(angle) * Math.PI) / 180);
      ctx.font = `700 ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeStyle = SILVER_EDGE;
      ctx.lineWidth = Math.max(1.15, fontSize * 0.045);
      ctx.shadowColor = 'rgba(255, 255, 255, 0.72)';
      ctx.shadowBlur = Math.max(1.8, fontSize * 0.07);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = -Math.max(0.5, fontSize * 0.018);
      ctx.strokeText(`${displayAngle}°`, 0, 0);
      ctx.fillStyle = silverGradient(ctx, fontSize);
      ctx.fillText(`${displayAngle}°`, 0, 0);
      ctx.restore();
    }

    ctx.restore();

    canvas.dataset.gannzillaAngleMinorSilverShineV664 = 'true';
    canvas.dataset.gannzillaAngleMinorLabelPaletteV664 = 'shiny-silver';
    canvas.dataset.gannzillaAngleMinorGeometryChangedV664 = 'false';
    canvas.dataset.gannzillaAuthorityBuild = String(BUILD);
  } finally {
    applying = false;
  }

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    changedArea: 'minor-angle-label-color-only',
    affectedLabels: 'angles-divisible-by-5-not-10',
    palette: 'shiny-silver',
    primaryLabelsChanged: false,
    angleGeometryChanged: false,
    frameGeometryChanged: false,
    wheelGeometryChanged: false,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:angle-minor-silver-shine-v664', { detail: lastApply }));
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
    'gannzilla:angle-label-band-clock-palette-v663',
    'gannzilla:metallic-angle-outer-ring-v531',
    'gannzilla:clean-outer-frame-v540',
    'gannzilla:copper-top-correction-v541',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:wheel-input-v459',
    'gannzilla:page-scrollbar-pan-v305',
  ].forEach((name) => window.addEventListener(name, () => schedule(name, 30), false));

  window.addEventListener('resize', () => schedule('window-resize', 75), false);
  watchTimer = window.setInterval(() => schedule('minor-silver-watch', 0), 900);

  window.GANNZILLA_ANGLE_MINOR_SILVER_SHINE_V664 = true;
  window.__auditGannzillaAngleMinorSilverShineV664 = () => {
    const canvas = findWheel();
    return {
      ok: enabled()
        && canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaAngleMinorSilverShineV664 === 'true'
        && canvas.dataset.gannzillaAngleMinorLabelPaletteV664 === 'shiny-silver'
        && canvas.dataset.gannzillaAngleMinorGeometryChangedV664 === 'false',
      build: BUILD,
      changedArea: 'minor-angle-label-color-only',
      primaryLabelsChanged: false,
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
