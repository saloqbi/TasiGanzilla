const BUILD = 668;
const STATE_KEY = '__gannzillaOuterEmptyRingMirrorSilverV668';
const ENABLE_PARAM = 'angleOuterMirrorSilverRing';
const TWO_PI = Math.PI * 2;

let frame = 0;
let timer = 0;
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

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function enabled() {
  return wheelMode() && boolParam(ENABLE_PARAM, false);
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

function fillAnnulus(ctx, cx, cy, inner, outer, fillStyle) {
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(1, outer), 0, TWO_PI);
  ctx.arc(cx, cy, Math.max(1, inner), TWO_PI, 0, true);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function strokeCircle(ctx, cx, cy, radius, strokeStyle, lineWidth) {
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(1, radius), 0, TWO_PI);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

function mirrorSilverGradient(ctx, cx, cy, inner, outer) {
  const gradient = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
  gradient.addColorStop(0, '#26343d');
  gradient.addColorStop(0.07, '#72848f');
  gradient.addColorStop(0.15, '#edfaff');
  gradient.addColorStop(0.24, '#9dabb3');
  gradient.addColorStop(0.34, '#ffffff');
  gradient.addColorStop(0.44, '#c0cbd1');
  gradient.addColorStop(0.53, '#faffff');
  gradient.addColorStop(0.63, '#899aa4');
  gradient.addColorStop(0.73, '#eefaff');
  gradient.addColorStop(0.82, '#667984');
  gradient.addColorStop(0.91, '#f9ffff');
  gradient.addColorStop(1, '#34434c');
  return gradient;
}

function drawSegmentLines(ctx, cx, cy, inner, outer, divisions, clockwise, zoom) {
  const sector = 360 / divisions;
  const direction = clockwise ? 1 : -1;
  const northOffset = direction * sector / 2;

  ctx.save();
  ctx.setLineDash([]);
  ctx.lineCap = 'butt';

  for (let index = 0; index < divisions; index += 1) {
    const angle = northOffset + direction * index * sector;
    const start = polar(cx, cy, inner + Math.max(1, zoom * 1.2), angle);
    const end = polar(cx, cy, outer - Math.max(1, zoom * 1.2), angle);
    const cardinalBoundary = index % 9 === 0;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = cardinalBoundary
      ? 'rgba(31, 42, 49, 0.88)'
      : 'rgba(74, 88, 97, 0.58)';
    ctx.lineWidth = Math.max(0.75, (cardinalBoundary ? 1.35 : 0.82) * zoom);
    ctx.stroke();
  }

  ctx.restore();
}

function drawMirrorHighlights(ctx, cx, cy, inner, outer, width) {
  const centerRadius = inner + width * 0.52;
  const highlight = ctx.createLinearGradient(cx - outer, 0, cx + outer, 0);
  highlight.addColorStop(0, 'rgba(255,255,255,0)');
  highlight.addColorStop(0.16, 'rgba(220,244,255,0.22)');
  highlight.addColorStop(0.36, 'rgba(255,255,255,0.78)');
  highlight.addColorStop(0.50, 'rgba(255,255,255,1)');
  highlight.addColorStop(0.64, 'rgba(218,244,255,0.72)');
  highlight.addColorStop(0.84, 'rgba(255,255,255,0.18)');
  highlight.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(222,247,255,0.92)';
  ctx.shadowBlur = Math.max(3, width * 0.24);
  ctx.beginPath();
  ctx.arc(cx, cy, centerRadius, (198 * Math.PI) / 180, (342 * Math.PI) / 180);
  ctx.strokeStyle = highlight;
  ctx.lineWidth = Math.max(1.4, width * 0.16);
  ctx.stroke();
  ctx.restore();

  const lowerReflection = ctx.createLinearGradient(cx - outer, 0, cx + outer, 0);
  lowerReflection.addColorStop(0, 'rgba(188,213,226,0)');
  lowerReflection.addColorStop(0.34, 'rgba(219,239,247,0.12)');
  lowerReflection.addColorStop(0.50, 'rgba(255,255,255,0.34)');
  lowerReflection.addColorStop(0.66, 'rgba(205,230,241,0.10)');
  lowerReflection.addColorStop(1, 'rgba(188,213,226,0)');

  ctx.save();
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, inner + width * 0.30, (18 * Math.PI) / 180, (162 * Math.PI) / 180);
  ctx.strokeStyle = lowerReflection;
  ctx.lineWidth = Math.max(0.9, width * 0.07);
  ctx.stroke();
  ctx.restore();
}

function apply(source = 'apply') {
  frame = 0;
  if (!enabled() || applying) return false;

  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement)
      || canvas.dataset.gannzillaMetallicAngleOuterRingV531 !== 'true') return false;

  const baseCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingBaseCssSizeV518 || 0);
  const expandedCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518 || 0);
  const ringWidth = Number(canvas.dataset.gannzillaEmptyOuterRingWidthV518 || 0);
  const emptyRingCount = Number(canvas.dataset.gannzillaEmptyOuterRingCountV518 || 0);
  const divisions = Math.max(3, Math.min(360, Math.round(
    Number(canvas.dataset.gannzillaEmptyOuterRingDivisionsV518 || numberParam('divisions', 36, 3, 360)),
  )));
  const dpr = Math.max(1, Number(canvas.dataset.gannzillaNativeDpr)
    || (expandedCssSize > 0 ? canvas.width / expandedCssSize : 0)
    || Number(window.devicePixelRatio)
    || 1);
  const zoom = Math.max(0.5, Number(canvas.dataset.gannzillaAppliedZoom) || 1);

  if (!(baseCssSize > 0)
      || !(expandedCssSize > 0)
      || !(ringWidth > 0)
      || !(emptyRingCount >= 5)) return false;

  const ringScale = numberParam('gannzillaAngleRingScale', 2, 1.7, 2);
  const baseFrameWidth = numberParam('gannzillaAngleFrameStrokeWidth', 5.6, 3, 12) * zoom;
  const outerFrameWidth = numberParam('gannzillaAngleOuterFrameStrokeWidth', 40, 30, 52) * zoom;
  const clockwise = boolParam('clockwise', true);

  const cx = expandedCssSize / 2;
  const cy = expandedCssSize / 2;
  const margin = 90 * zoom;
  const baseOuter = Math.max(1, (baseCssSize - margin * 2) / 2);
  const angleInnerRadius = baseOuter + ringWidth * 2;
  const angleOuterRadius = angleInnerRadius + ringWidth * ringScale;
  const outerFrameInner = angleOuterRadius - baseFrameWidth / 2;
  const outerFrameOuter = outerFrameInner + outerFrameWidth;
  const emptyRingsOuter = baseOuter + ringWidth * emptyRingCount;

  // The requested target is the remaining white outer ring immediately outside
  // the approved copper angle frame, not an additional ring beyond the wheel.
  const mirrorInner = outerFrameOuter + Math.max(1.2, zoom * 1.2);
  const mirrorOuter = emptyRingsOuter - Math.max(0.8, zoom * 0.8);
  const mirrorWidth = mirrorOuter - mirrorInner;
  if (!(mirrorWidth > Math.max(4, zoom * 4))) return false;

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
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    fillAnnulus(
      ctx,
      cx,
      cy,
      mirrorInner,
      mirrorOuter,
      mirrorSilverGradient(ctx, cx, cy, mirrorInner, mirrorOuter),
    );

    strokeCircle(ctx, cx, cy, mirrorInner, 'rgba(31,43,51,0.98)', Math.max(1.2, mirrorWidth * 0.040));
    strokeCircle(ctx, cx, cy, mirrorInner + mirrorWidth * 0.11, 'rgba(238,251,255,0.94)', Math.max(0.9, mirrorWidth * 0.028));
    strokeCircle(ctx, cx, cy, mirrorInner + mirrorWidth * 0.48, 'rgba(255,255,255,0.70)', Math.max(0.8, mirrorWidth * 0.018));
    strokeCircle(ctx, cx, cy, mirrorOuter - mirrorWidth * 0.09, 'rgba(242,252,255,0.94)', Math.max(0.9, mirrorWidth * 0.030));
    strokeCircle(ctx, cx, cy, mirrorOuter, 'rgba(44,57,65,0.98)', Math.max(1.2, mirrorWidth * 0.040));

    drawSegmentLines(ctx, cx, cy, mirrorInner, mirrorOuter, divisions, clockwise, zoom);
    drawMirrorHighlights(ctx, cx, cy, mirrorInner, mirrorOuter, mirrorWidth);
    ctx.restore();

    canvas.dataset.gannzillaOuterEmptyRingMirrorSilverV668 = 'true';
    canvas.dataset.gannzillaOuterEmptyRingMirrorSilverTargetV668 = 'remaining-white-ring-outside-copper-angle-frame';
    canvas.dataset.gannzillaOuterEmptyRingMirrorSilverInnerV668 = String(mirrorInner);
    canvas.dataset.gannzillaOuterEmptyRingMirrorSilverOuterV668 = String(mirrorOuter);
    canvas.dataset.gannzillaOuterEmptyRingMirrorSilverWidthV668 = String(mirrorWidth / zoom);
    canvas.dataset.gannzillaOuterEmptyRingGeometryChangedV668 = 'false';
  } finally {
    applying = false;
  }

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    target: 'remaining-white-ring-outside-copper-angle-frame',
    material: 'mirror-polished-silver-chrome',
    innerRadius: mirrorInner,
    outerRadius: mirrorOuter,
    width: mirrorWidth / zoom,
    divisions,
    geometryChanged: false,
    labelsChanged: false,
    at: Date.now(),
  };
  return true;
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set(ENABLE_PARAM, 'true');
    url.searchParams.set('angleOuterSilverFrame', 'true');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime rendering remains authoritative even if URL replacement is blocked.
  }
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(schedule.timer);
  schedule.timer = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => apply(source));
  }, delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !wheelMode()
      || window[STATE_KEY]) return;

  persistFlags();

  [0, 80, 220, 520, 1050, 2100, 4200, 7600, 11200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });

  [
    'gannzilla:angle-frame-clock-palette-v660',
    'gannzilla:angle-inner-frame-visible-clock-palette-v662',
    'gannzilla:angle-label-band-clock-palette-v663',
    'gannzilla:angle-minor-silver-shine-v664',
    'gannzilla:angle-tick-hierarchy-black-silver-v665',
    'gannzilla:angle-tick-contrast-black-silver-v666',
    'gannzilla:metallic-angle-outer-ring-v531',
    'gannzilla:clean-outer-frame-v540',
    'gannzilla:copper-top-correction-v541',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:wheel-input-v459',
    'gannzilla:page-scrollbar-pan-v305',
  ].forEach((name) => window.addEventListener(name, () => schedule(name, 90), false));

  window.addEventListener('resize', () => schedule('window-resize', 110), false);
  timer = window.setInterval(() => schedule('mirror-silver-outer-ring-watch', 0), 1100);

  window.GANNZILLA_OUTER_EMPTY_RING_MIRROR_SILVER_V668 = true;
  window.__auditGannzillaOuterEmptyRingMirrorSilverV668 = () => {
    const canvas = findWheel();
    return {
      ok: enabled()
        && canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaOuterEmptyRingMirrorSilverV668 === 'true'
        && canvas.dataset.gannzillaOuterEmptyRingMirrorSilverTargetV668 === 'remaining-white-ring-outside-copper-angle-frame'
        && canvas.dataset.gannzillaOuterEmptyRingGeometryChangedV668 === 'false',
      build: BUILD,
      enabled: enabled(),
      target: canvas?.dataset?.gannzillaOuterEmptyRingMirrorSilverTargetV668 || null,
      material: 'mirror-polished-silver-chrome',
      width: Number(canvas?.dataset?.gannzillaOuterEmptyRingMirrorSilverWidthV668 || 0),
      geometryChanged: canvas?.dataset?.gannzillaOuterEmptyRingGeometryChangedV668 !== 'false',
      applyCount,
      timerActive: Boolean(timer),
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule };
  schedule('install');
}

install();
