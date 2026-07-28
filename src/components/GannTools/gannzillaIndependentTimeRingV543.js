const BUILD = 543;
const STATE_KEY = '__gannzillaIndependentTimeRingV543';
const TWO_PI = Math.PI * 2;
const CELL_FILL = '#ffffff';
const GRID_STROKE = '#b5b5b5';
const OUTER_STROKE = '#7a7a7a';
const RED = '#d71920';
const BLUE = '#0057c8';
const BLACK = '#111111';
const BRONZE = '#a95321';
const BRONZE_DARK = '#6f2f12';
const BRONZE_MID = '#b8652f';
const BRONZE_LIGHT = '#efb07a';

const ZODIAC_BASE = Object.freeze([
  Object.freeze({ text: 'نار الحمل', color: RED }),
  Object.freeze({ text: 'تراب الثور', color: BLUE }),
  Object.freeze({ text: 'هواء الجوزاء', color: BLACK }),
  Object.freeze({ text: 'ماء السرطان', color: RED }),
  Object.freeze({ text: 'نار الأسد', color: BLUE }),
  Object.freeze({ text: 'تراب السنبلة', color: BLACK }),
  Object.freeze({ text: 'هواء الميزان', color: RED }),
  Object.freeze({ text: 'ماء العقرب', color: BLUE }),
  Object.freeze({ text: 'نار القوس', color: BLACK }),
  Object.freeze({ text: 'تراب الجدي', color: RED }),
  Object.freeze({ text: 'هواء الدلو', color: BLUE }),
  Object.freeze({ text: 'ماء الحوت', color: BLACK }),
]);

const WEEKDAY_BASE = Object.freeze([
  Object.freeze({ text: 'الأحد', color: RED }),
  Object.freeze({ text: 'الاثنين', color: BLUE }),
  Object.freeze({ text: 'الثلاثاء', color: BLACK }),
  Object.freeze({ text: 'الأربعاء', color: RED }),
  Object.freeze({ text: 'الخميس', color: BLUE }),
  Object.freeze({ text: 'الجمعة', color: BLACK }),
]);

const ZODIAC_SEQUENCE = Object.freeze(
  Array.from({ length: 36 }, (_, index) => Object.freeze({
    number: index + 1,
    ...ZODIAC_BASE[index % ZODIAC_BASE.length],
  })),
);

const WEEKDAY_SEQUENCE = Object.freeze(
  Array.from({ length: 36 }, (_, index) => Object.freeze({
    number: index + 1,
    ...WEEKDAY_BASE[index % WEEKDAY_BASE.length],
  })),
);

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
  return wheelMode()
    && boolParam('timeRing', false)
    && boolParam('gannzillaIndependentTimeRing', true);
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

function readableRotation(degrees) {
  const normalized = ((degrees % 360) + 360) % 360;
  return normalized > 90 && normalized < 270 ? degrees + 180 : degrees;
}

function wedge(ctx, cx, cy, inner, outer, startDegrees, endDegrees) {
  const start = ((startDegrees - 90) * Math.PI) / 180;
  const end = ((endDegrees - 90) * Math.PI) / 180;
  const anticlockwise = endDegrees < startDegrees;
  ctx.beginPath();
  ctx.arc(cx, cy, outer, start, end, anticlockwise);
  ctx.arc(cx, cy, inner, end, start, !anticlockwise);
  ctx.closePath();
}

function fillAnnulus(ctx, cx, cy, inner, outer, fillStyle) {
  ctx.beginPath();
  ctx.arc(cx, cy, outer, 0, TWO_PI);
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

function roundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function formatTime(date) {
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
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
    strokeCircle(ctx, cx, cy, edgeRadius, BRONZE_DARK, 0.9);
  });
}

function drawOutwardShadow(ctx, cx, cy, outerEdge, spread, opacity) {
  if (!(spread > 0) || !(opacity > 0)) return;
  const gradient = ctx.createRadialGradient(cx, cy, outerEdge, cx, cy, outerEdge + spread);
  gradient.addColorStop(0, `rgba(45, 14, 4, ${opacity})`);
  gradient.addColorStop(0.25, `rgba(54, 18, 5, ${opacity * 0.66})`);
  gradient.addColorStop(0.56, `rgba(61, 22, 7, ${opacity * 0.28})`);
  gradient.addColorStop(1, 'rgba(61, 22, 7, 0)');
  fillAnnulus(ctx, cx, cy, outerEdge - 0.5, outerEdge + spread, gradient);
}

function drawInnerCopperFrame(ctx, cx, cy, boundaryRadius, width) {
  const inner = boundaryRadius - width;
  const outer = boundaryRadius;
  const gradient = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
  gradient.addColorStop(0, '#4a1606');
  gradient.addColorStop(0.20, '#7b2a0d');
  gradient.addColorStop(0.48, '#c15e27');
  gradient.addColorStop(0.72, '#f0a16a');
  gradient.addColorStop(0.88, '#ffd4b2');
  gradient.addColorStop(1, '#6c2209');
  fillAnnulus(ctx, cx, cy, inner, outer, gradient);
  strokeCircle(ctx, cx, cy, inner, 'rgba(67, 18, 4, 0.98)', Math.max(1.1, width * 0.12));
  strokeCircle(ctx, cx, cy, outer, 'rgba(115, 38, 10, 0.98)', Math.max(1.0, width * 0.10));
  strokeCircle(ctx, cx, cy, inner + width * 0.72, 'rgba(255, 220, 193, 0.78)', Math.max(0.8, width * 0.075));
}

function drawOuterCopperFrame(ctx, cx, cy, innerEdge, width, shadowSpread, shadowOpacity) {
  const outerEdge = innerEdge + width;
  drawOutwardShadow(ctx, cx, cy, outerEdge, shadowSpread, shadowOpacity);

  const gradient = ctx.createRadialGradient(cx, cy, innerEdge, cx, cy, outerEdge);
  gradient.addColorStop(0, '#351005');
  gradient.addColorStop(0.08, '#531b07');
  gradient.addColorStop(0.20, '#7b2d0f');
  gradient.addColorStop(0.38, '#ad4f1f');
  gradient.addColorStop(0.56, '#d97939');
  gradient.addColorStop(0.72, '#f1a268');
  gradient.addColorStop(0.84, '#f8bd8d');
  gradient.addColorStop(0.93, '#d96f31');
  gradient.addColorStop(1, '#641f09');

  ctx.save();
  ctx.shadowColor = `rgba(55, 17, 4, ${Math.min(0.72, shadowOpacity + 0.08)})`;
  ctx.shadowBlur = width * 0.30;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = width * 0.055;
  fillAnnulus(ctx, cx, cy, innerEdge, outerEdge, gradient);
  ctx.restore();

  strokeCircle(ctx, cx, cy, innerEdge, 'rgba(48, 13, 3, 0.99)', Math.max(1.6, width * 0.075));
  strokeCircle(ctx, cx, cy, innerEdge + width * 0.14, 'rgba(116, 38, 10, 0.96)', Math.max(1.0, width * 0.05));
  strokeCircle(ctx, cx, cy, outerEdge - width * 0.10, 'rgba(247, 181, 132, 0.88)', Math.max(1.3, width * 0.06));
  strokeCircle(ctx, cx, cy, outerEdge, 'rgba(84, 24, 6, 0.99)', Math.max(1.4, width * 0.055));
}

function drawWarmTopHighlight(ctx, cx, cy, innerEdge, frameWidth) {
  const start = (184 * Math.PI) / 180;
  const end = (356 * Math.PI) / 180;
  const radius = innerEdge + frameWidth * 0.69;
  const gradient = ctx.createLinearGradient(cx - radius, 0, cx + radius, 0);
  gradient.addColorStop(0, 'rgba(255,133,52,0)');
  gradient.addColorStop(0.10, 'rgba(255,148,62,0.18)');
  gradient.addColorStop(0.28, 'rgba(255,177,103,0.46)');
  gradient.addColorStop(0.48, 'rgba(255,209,158,0.72)');
  gradient.addColorStop(0.62, 'rgba(255,218,174,0.78)');
  gradient.addColorStop(0.80, 'rgba(255,175,94,0.44)');
  gradient.addColorStop(0.94, 'rgba(255,137,52,0.15)');
  gradient.addColorStop(1, 'rgba(255,133,52,0)');

  ctx.save();
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(190, 74, 20, 0.38)';
  ctx.shadowBlur = frameWidth * 0.20;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, start, end);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = frameWidth * 0.18;
  ctx.stroke();
  ctx.restore();
}

function drawSparkle(ctx, x, y, size) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const glow = ctx.createRadialGradient(x, y, 0, x, y, size);
  glow.addColorStop(0, 'rgba(255,255,255,1)');
  glow.addColorStop(0.10, 'rgba(255,255,246,0.98)');
  glow.addColorStop(0.30, 'rgba(255,226,185,0.76)');
  glow.addColorStop(0.62, 'rgba(255,153,72,0.32)');
  glow.addColorStop(1, 'rgba(255,153,72,0)');
  ctx.beginPath();
  ctx.arc(x, y, size, 0, TWO_PI);
  ctx.fillStyle = glow;
  ctx.fill();
  ctx.translate(x, y);
  ctx.strokeStyle = '#ffffff';
  ctx.shadowColor = 'rgba(255,231,196,0.98)';
  ctx.shadowBlur = size * 0.70;
  ctx.lineCap = 'round';
  const longRay = size * 1.18;
  const diagonal = size * 0.80;
  [
    [-longRay, 0, longRay, 0, size * 0.070],
    [0, -longRay, 0, longRay, size * 0.070],
    [-diagonal, -diagonal, diagonal, diagonal, size * 0.040],
    [-diagonal, diagonal, diagonal, -diagonal, size * 0.040],
  ].forEach(([x1, y1, x2, y2, lineWidth]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = Math.max(1, lineWidth);
    ctx.stroke();
  });
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(3, size * 0.17), 0, TWO_PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();
}

function drawThirtySixCellRing(ctx, geometry, sequence, fontSize, direction) {
  const { cx, cy, inner, outer } = geometry;
  const sector = 10;
  const northOffset = direction * sector / 2;
  const labelRadius = inner + (outer - inner) * 0.52;

  for (let index = 0; index < 36; index += 1) {
    const startDegrees = northOffset + direction * index * sector;
    const endDegrees = northOffset + direction * (index + 1) * sector;
    wedge(ctx, cx, cy, inner, outer, startDegrees, endDegrees);
    ctx.fillStyle = CELL_FILL;
    ctx.fill();
    ctx.strokeStyle = GRID_STROKE;
    ctx.lineWidth = 0.55;
    ctx.stroke();
  }
  strokeCircle(ctx, cx, cy, outer, OUTER_STROKE, 0.9);

  ctx.font = `700 ${fontSize}px "Noto Sans Arabic", "Segoe UI", Tahoma, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'rtl';

  sequence.forEach((item, index) => {
    const centerDegrees = northOffset + direction * (index + 0.5) * sector;
    const point = polar(cx, cy, labelRadius, centerDegrees);
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate((readableRotation(centerDegrees) * Math.PI) / 180);
    ctx.fillStyle = item.color;
    ctx.fillText(item.text, 0, 0);
    ctx.restore();
  });
}

function drawTimeRing(ctx, geometry, date, appliedZoom, direction) {
  const { cx, cy, inner, outer } = geometry;
  const activeMinute = date.getMinutes();
  const labelRadius = inner + (outer - inner) * 0.52;
  const fontSize = numberParam('gannzillaTimeRingFontSize', 16, 10, 24) * appliedZoom;
  const activeGradient = ctx.createLinearGradient(cx - outer, cy - outer, cx + outer, cy + outer);
  activeGradient.addColorStop(0, '#7a2c08');
  activeGradient.addColorStop(0.35, '#b8581f');
  activeGradient.addColorStop(0.68, '#e99759');
  activeGradient.addColorStop(1, '#71300e');

  for (let minute = 0; minute < 60; minute += 1) {
    const centerDegrees = direction * minute * 6;
    const startDegrees = centerDegrees - direction * 3;
    const endDegrees = centerDegrees + direction * 3;
    const active = minute === activeMinute;
    wedge(ctx, cx, cy, inner, outer, startDegrees, endDegrees);
    ctx.fillStyle = active ? activeGradient : CELL_FILL;
    ctx.fill();
    ctx.strokeStyle = active ? '#7d300d' : GRID_STROKE;
    ctx.lineWidth = active ? 1.4 : 0.55;
    ctx.stroke();
  }
  strokeCircle(ctx, cx, cy, inner, 'rgba(122,62,23,0.72)', 0.8);
  strokeCircle(ctx, cx, cy, outer, 'rgba(122,62,23,0.90)', 1.0);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'ltr';
  for (let minute = 0; minute < 60; minute += 1) {
    const centerDegrees = direction * minute * 6;
    const point = polar(cx, cy, labelRadius, centerDegrees);
    const active = minute === activeMinute;
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate((readableRotation(centerDegrees) * Math.PI) / 180);
    ctx.font = `${active ? 800 : 700} ${fontSize}px Arial, sans-serif`;
    ctx.fillStyle = active ? '#ffffff' : '#2d1d14';
    ctx.fillText(String(minute).padStart(2, '0'), 0, 0);
    ctx.restore();
  }

  if (boolParam('gannzillaTimeMovingBadge', true)) {
    const centerDegrees = direction * activeMinute * 6;
    const point = polar(cx, cy, labelRadius, centerDegrees);
    const ringHeight = outer - inner;
    const badgeWidth = numberParam('gannzillaTimeBadgeWidth', 92, 64, 130) * appliedZoom;
    const badgeHeight = Math.min(
      ringHeight * 0.72,
      numberParam('gannzillaTimeBadgeHeight', 31, 22, 46) * appliedZoom,
    );
    const badgeFontSize = numberParam('gannzillaTimeBadgeFontSize', 18, 13, 28) * appliedZoom;

    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate((readableRotation(centerDegrees) * Math.PI) / 180);
    ctx.shadowColor = 'rgba(194, 91, 29, 0.70)';
    ctx.shadowBlur = 8 * appliedZoom;
    const badgeGradient = ctx.createLinearGradient(0, -badgeHeight / 2, 0, badgeHeight / 2);
    badgeGradient.addColorStop(0, '#fffaf3');
    badgeGradient.addColorStop(0.55, '#f8dec4');
    badgeGradient.addColorStop(1, '#d9955c');
    roundedRectPath(ctx, -badgeWidth / 2, -badgeHeight / 2, badgeWidth, badgeHeight, badgeHeight * 0.22);
    ctx.fillStyle = badgeGradient;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#8b3d11';
    ctx.lineWidth = Math.max(1.1, 1.05 * appliedZoom);
    ctx.stroke();
    ctx.font = `800 ${badgeFontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#522006';
    ctx.fillText(formatTime(date), 0, 0);
    ctx.restore();
  }

  return activeMinute;
}

function drawAngleRing(ctx, geometry, appliedZoom) {
  const { cx, cy, inner, outer } = geometry;
  const angleWidth = outer - inner;
  const bandWidth = numberParam('gannzillaAngleFrameStrokeWidth', 5.6, 3, 12) * appliedZoom;
  const majorFont = numberParam('gannzillaAngleMajorFontSize', 48, 20, 48);
  const minorFont = numberParam('gannzillaAngleMinorFontSize', 42, 11, 44);
  const cardinalFont = numberParam('gannzillaAngleCardinalFontSize', 68, 28, 68);
  const majorRadius = inner + angleWidth * 0.42;
  const minorRadius = inner + angleWidth * 0.25;

  fillAnnulus(ctx, cx, cy, inner, outer, CELL_FILL);
  drawMetallicBand(ctx, cx, cy, inner, bandWidth);
  drawMetallicBand(ctx, cx, cy, outer, bandWidth);

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

  return bandWidth;
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('timeRing', 'true');
    url.searchParams.set('gannzillaTimeRingOverlay', 'false');
    url.searchParams.set('gannzillaIndependentTimeRing', 'true');
    url.searchParams.set('gannzillaTimeMovingBadge', 'true');
    url.searchParams.set('emptyOuterRing', 'true');
    url.searchParams.set('emptyOuterRingCount', '6');
    url.searchParams.set('emptyOuterRingNumbers', 'false');
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
let clockTimer = 0;
let redrawGeneration = 0;
let lastMinuteKey = '';

function drawIndependentTimeRing(source = 'apply', force = false) {
  if (!enabled()) return false;
  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement)) return false;

  const emptyRingCount = Number(canvas.dataset.gannzillaEmptyOuterRingCountV518 || 0);
  const baseCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingBaseCssSizeV518 || 0);
  const expandedCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518 || 0);
  const ringWidth = Number(canvas.dataset.gannzillaEmptyOuterRingWidthV518 || 0);
  const dpr = Math.max(1, Number(canvas.dataset.gannzillaNativeDpr)
    || (expandedCssSize > 0 ? canvas.width / expandedCssSize : 0)
    || Number(window.devicePixelRatio)
    || 1);
  const appliedZoom = Math.max(0.5, Number(canvas.dataset.gannzillaAppliedZoom) || 1);
  const clockwise = boolParam('clockwise', true);

  if (emptyRingCount < 6 || !(baseCssSize > 0) || !(expandedCssSize > 0) || !(ringWidth > 0)) {
    return false;
  }

  const direction = clockwise ? 1 : -1;
  const cx = expandedCssSize / 2;
  const cy = expandedCssSize / 2;
  const margin = 90 * appliedZoom;
  const baseOuter = Math.max(1, (baseCssSize - margin * 2) / 2);
  const timeInner = baseOuter;
  const timeOuter = timeInner + ringWidth;
  const zodiacInner = timeOuter;
  const zodiacOuter = zodiacInner + ringWidth;
  const weekdayInner = zodiacOuter;
  const weekdayOuter = weekdayInner + ringWidth;
  const angleInner = weekdayOuter;
  const angleWidth = ringWidth * numberParam('gannzillaAngleRingScale', 2, 1.7, 2);
  const angleOuter = angleInner + angleWidth;

  const baseFrameWidth = numberParam('gannzillaAngleFrameStrokeWidth', 5.6, 3, 12) * appliedZoom;
  const innerFrameWidth = numberParam('gannzillaAngleInnerFrameStrokeWidth', 10, 5.6, 16) * appliedZoom;
  const outerFrameWidth = numberParam('gannzillaAngleOuterFrameStrokeWidth', 40, 36, 48) * appliedZoom;
  const shadowSpread = numberParam('gannzillaAngleOuterShadowSpread', 22, 0, 42) * appliedZoom;
  const shadowOpacity = numberParam('gannzillaAngleOuterShadowOpacity', 0.48, 0, 0.9);
  const sparkleSize = numberParam('gannzillaAngleCleanSparkleSize', 44, 24, 64) * appliedZoom;
  const sparkleAngle = numberParam('gannzillaAngleSparkleAngle', 34, -180, 180);
  const outerFrameInnerEdge = angleOuter - baseFrameWidth / 2;
  const finalOuterEdge = outerFrameInnerEdge + outerFrameWidth;
  const availablePadding = expandedCssSize / 2 - finalOuterEdge;
  if (availablePadding < shadowSpread * 0.8) return false;

  const date = new Date();
  const minuteKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
  const renderKey = [
    canvas.width, canvas.height, baseCssSize, expandedCssSize, ringWidth,
    clockwise, minuteKey, redrawGeneration,
    numberParam('gannzillaTimeRingFontSize', 16, 10, 24),
    numberParam('gannzillaZodiacFontSize', 32, 7, 36),
    numberParam('gannzillaWeekdayFontSize', 32, 7, 36),
  ].join(':');
  if (!force && canvas.dataset.gannzillaIndependentTimeRingRenderKeyV543 === renderKey) return true;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return false;

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

  // Replace only the complete outer authority area. The original number wheel
  // inside baseOuter remains untouched.
  fillAnnulus(ctx, cx, cy, baseOuter, expandedCssSize / 2, CELL_FILL);

  const activeMinute = drawTimeRing(
    ctx,
    { cx, cy, inner: timeInner, outer: timeOuter },
    date,
    appliedZoom,
    direction,
  );

  drawThirtySixCellRing(
    ctx,
    { cx, cy, inner: zodiacInner, outer: zodiacOuter },
    ZODIAC_SEQUENCE,
    numberParam('gannzillaZodiacFontSize', 32, 7, 36) * appliedZoom,
    direction,
  );

  drawThirtySixCellRing(
    ctx,
    { cx, cy, inner: weekdayInner, outer: weekdayOuter },
    WEEKDAY_SEQUENCE,
    numberParam('gannzillaWeekdayFontSize', 32, 7, 36) * appliedZoom,
    direction,
  );

  drawAngleRing(ctx, { cx, cy, inner: angleInner, outer: angleOuter }, appliedZoom);
  drawInnerCopperFrame(ctx, cx, cy, angleInner, innerFrameWidth);
  drawOuterCopperFrame(
    ctx,
    cx,
    cy,
    outerFrameInnerEdge,
    outerFrameWidth,
    shadowSpread,
    shadowOpacity,
  );
  drawWarmTopHighlight(ctx, cx, cy, outerFrameInnerEdge, outerFrameWidth);
  const sparklePoint = polar(cx, cy, outerFrameInnerEdge + outerFrameWidth * 0.68, sparkleAngle);
  drawSparkle(ctx, sparklePoint.x, sparklePoint.y, sparkleSize);
  ctx.restore();

  canvas.dataset.gannzillaIndependentTimeRingV543 = 'true';
  canvas.dataset.gannzillaIndependentTimeRingRenderKeyV543 = renderKey;
  canvas.dataset.gannzillaTimeRingPositionV543 = 'independent-under-zodiac';
  canvas.dataset.gannzillaTimeRingCellCountV543 = '60';
  canvas.dataset.gannzillaTimeRingActiveMinuteV543 = String(activeMinute).padStart(2, '0');
  canvas.dataset.gannzillaTimeRingDisplayedTimeV543 = formatTime(date);
  canvas.dataset.gannzillaTimeRingBaseNumbersCoveredV543 = 'false';
  canvas.dataset.gannzillaTimeRingTransparentOverlayV543 = 'false';
  canvas.dataset.gannzillaOuterAuthorityRebuiltV543 = 'true';
  canvas.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastMinuteKey = minuteKey;
  lastApply = {
    source,
    build: BUILD,
    cells: 60,
    activeMinute,
    displayedTime: formatTime(date),
    position: 'independent-under-zodiac',
    transparentOverlay: false,
    baseNumbersCovered: false,
    rings: ['time', 'zodiac', 'weekdays', 'angles', 'copper-frame'],
    availablePadding,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:independent-time-ring-v543', { detail: lastApply }));
  return true;
}

function schedule(source = 'schedule', force = false, delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => drawIndependentTimeRing(source, force));
  }, delay);
}

function tickClock() {
  if (!enabled()) return;
  const date = new Date();
  const minuteKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
  if (minuteKey !== lastMinuteKey) {
    redrawGeneration += 1;
    schedule('clock-minute-change', true);
  }
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !wheelMode()
      || window[STATE_KEY]) return;

  document.getElementById('gannzilla-time-ring-overlay-v542')?.remove();
  if (enabled()) persistFlags();

  const refresh = (event) => {
    if (!enabled()) return;
    redrawGeneration += 1;
    schedule(event?.type || 'refresh', true, 28);
  };

  [
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:zodiac-outer-ring-v522',
    'gannzilla:weekdays-outer-ring-v523',
    'gannzilla:metallic-angle-outer-ring-v531',
    'gannzilla:clean-outer-frame-v540',
    'gannzilla:copper-top-correction-v541',
  ].forEach((eventName) => window.addEventListener(eventName, refresh, false));
  window.addEventListener('resize', refresh, false);

  [210, 520, 1050, 2100, 4100, 7200, 10400, 13200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, true), delay);
  });

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => schedule('fonts-ready', true)).catch(() => {});
  }

  clockTimer = window.setInterval(tickClock, 1000);

  window.GANNZILLA_INDEPENDENT_TIME_RING_V543 = true;
  window.__auditGannzillaIndependentTimeRingV543 = () => {
    const canvas = findWheel();
    return {
      ok: !enabled() || (
        canvas instanceof HTMLCanvasElement
        && Number(canvas.dataset.gannzillaEmptyOuterRingCountV518) >= 6
        && canvas.dataset.gannzillaIndependentTimeRingV543 === 'true'
        && canvas.dataset.gannzillaTimeRingPositionV543 === 'independent-under-zodiac'
        && Number(canvas.dataset.gannzillaTimeRingCellCountV543) === 60
        && canvas.dataset.gannzillaTimeRingBaseNumbersCoveredV543 === 'false'
        && canvas.dataset.gannzillaTimeRingTransparentOverlayV543 === 'false'
      ),
      build: BUILD,
      enabled: enabled(),
      cells: Number(canvas?.dataset?.gannzillaTimeRingCellCountV543 || 0),
      activeMinute: canvas?.dataset?.gannzillaTimeRingActiveMinuteV543 || null,
      displayedTime: canvas?.dataset?.gannzillaTimeRingDisplayedTimeV543 || null,
      position: canvas?.dataset?.gannzillaTimeRingPositionV543 || null,
      baseNumbersCovered: canvas?.dataset?.gannzillaTimeRingBaseNumbersCoveredV543 === 'true',
      transparentOverlay: canvas?.dataset?.gannzillaTimeRingTransparentOverlayV543 === 'true',
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = {
    drawIndependentTimeRing,
    schedule,
    get clockTimer() { return clockTimer; },
  };
}

install();