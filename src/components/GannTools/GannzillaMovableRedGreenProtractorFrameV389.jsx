import React from 'react';

const BUILD = 389;
const TWO_PI = Math.PI * 2;
const FONT_FAMILY = 'Segoe UI, Tahoma, Arial, sans-serif';
const COLORS = Object.freeze({
  red: '#a10f1f',
  blue: '#1457d9',
  black: '#111111',
  minor: '#74797e',
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function params() {
  try {
    return new URLSearchParams(window.location.search || '');
  } catch (_) {
    return new URLSearchParams();
  }
}

function boolParam(name, fallback) {
  const query = params();
  if (!query.has(name)) return fallback;
  const value = String(query.get(name) || '').toLowerCase();
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
}

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? clamp(value, min, max) : fallback;
}

function stringParam(name, fallback) {
  const value = params().get(name);
  return value ? String(value) : fallback;
}

function normalizeDegrees(value) {
  const normalized = Number(value) % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function shortestSignedDegrees(value) {
  const normalized = normalizeDegrees(value);
  return normalized > 180 ? normalized - 360 : normalized;
}

function polar(cx, cy, radius, degrees) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function findWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => !canvas.closest('aside'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ canvas, rect }) => canvas.width > 0 && canvas.height > 0 && rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function angleColor(degree) {
  const slot = Math.abs(Math.round(degree / 10)) % 9;
  if (slot === 1 || slot === 4 || slot === 7) return COLORS.red;
  if (slot === 2 || slot === 5 || slot === 8) return COLORS.blue;
  return COLORS.black;
}

function geometryForCanvas(canvas) {
  const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
  const width = canvas.width / dpr;
  const height = canvas.height / dpr;
  const levels = Math.round(numberParam('levels', 10, 1, 12));
  const innerRadius = numberParam('gannzillaInnerRadius', 170, 80, 500);
  const ringWidth = numberParam('gannzillaRingWidth', 60, 30, 150);
  const wheelRadius = innerRadius + (levels * ringWidth);
  const frameInner = wheelRadius + numberParam('gannzillaMovableFrameInnerOffset', 18, 10, 36);
  const frameBandWidth = numberParam('gannzillaMovableFrameBandWidth', 40, 28, 64);
  const frameOuter = frameInner + frameBandWidth;
  return {
    dpr,
    width,
    height,
    cx: width / 2,
    cy: height / 2,
    wheelRadius,
    frameInner,
    frameOuter,
  };
}

function drawCircle(ctx, cx, cy, radius, color, lineWidth) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TWO_PI);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

function clearOverlayBand(ctx, geometry) {
  const clearInner = geometry.wheelRadius + 8;
  const clearOuter = geometry.frameOuter + 48;
  ctx.save();
  ctx.beginPath();
  ctx.arc(geometry.cx, geometry.cy, clearOuter, 0, TWO_PI);
  ctx.arc(geometry.cx, geometry.cy, clearInner, TWO_PI, 0, true);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();
}

function drawHorizontalLabel(ctx, text, point, fontSize, fontWeight, color) {
  ctx.save();
  ctx.font = `${fontWeight} ${fontSize}px ${FONT_FAMILY}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'ltr';
  ctx.fillText(text, point.x, point.y);
  ctx.restore();
}

function drawFrame(canvas, angle) {
  if (!boolParam('showProtractor', true) || !boolParam('showMovableGannzillaFrame', true)) return false;

  const geometry = geometryForCanvas(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  const clockwise = boolParam('clockwise', true);
  const direction = clockwise ? 1 : -1;
  const rotation = normalizeDegrees(angle);
  const frameWidth = numberParam('gannzillaMovableFrameLineWidth', 3.2, 1.5, 8);
  const innerColor = stringParam('gannzillaMovableFrameInnerColor', '#c93b38');
  const outerColor = stringParam('gannzillaMovableFrameOuterColor', '#4f8f70');
  const tenFontSize = numberParam('gannzillaProtractorFontSize', 20, 12, 30);
  const tenFontWeight = Math.round(numberParam('gannzillaProtractorFontWeight', 700, 400, 900));
  const fiveFontSize = numberParam('gannzillaFiveDegreeFontSize', 14, 9, 20);
  const fiveFontWeight = Math.round(numberParam('gannzillaFiveDegreeFontWeight', 500, 400, 800));
  const labelRadius = geometry.frameInner + ((geometry.frameOuter - geometry.frameInner) * 0.54);

  ctx.save();
  ctx.setTransform(geometry.dpr, 0, 0, geometry.dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  clearOverlayBand(ctx, geometry);

  // Gannzilla-style dual frame: red inner boundary and green outer boundary.
  drawCircle(ctx, geometry.cx, geometry.cy, geometry.frameInner, innerColor, frameWidth);
  drawCircle(ctx, geometry.cx, geometry.cy, geometry.frameOuter, outerColor, frameWidth);

  // Fine companion lines give the frame the same layered appearance as the desktop Gannzilla reference.
  ctx.save();
  ctx.globalAlpha = 0.32;
  drawCircle(ctx, geometry.cx, geometry.cy, geometry.frameInner - 3.5, innerColor, 1);
  drawCircle(ctx, geometry.cx, geometry.cy, geometry.frameOuter + 3.5, outerColor, 1);
  ctx.restore();

  for (let degree = 0; degree < 360; degree += 5) {
    const physicalDegree = direction * (degree + rotation);
    const majorThirty = degree % 30 === 0;
    const majorTen = degree % 10 === 0;
    const tickInner = geometry.frameInner - (majorThirty ? 5 : majorTen ? 2 : 0);
    const tickOuter = majorThirty
      ? geometry.frameOuter + 6
      : majorTen
        ? geometry.frameOuter + 2
        : geometry.frameInner + ((geometry.frameOuter - geometry.frameInner) * 0.34);
    const p1 = polar(geometry.cx, geometry.cy, tickInner, physicalDegree);
    const p2 = polar(geometry.cx, geometry.cy, tickOuter, physicalDegree);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = majorTen ? innerColor : '#aeb2b5';
    ctx.lineWidth = majorThirty ? 1.8 : majorTen ? 1.25 : 0.75;
    ctx.stroke();

    const point = polar(geometry.cx, geometry.cy, labelRadius, physicalDegree);
    if (majorTen) {
      drawHorizontalLabel(ctx, `${degree}°`, point, tenFontSize, tenFontWeight, angleColor(degree));
    } else if (boolParam('showFiveDegreeAngles', true)) {
      drawHorizontalLabel(ctx, String(degree), point, fiveFontSize, fiveFontWeight, COLORS.minor);
    }
  }

  // The red zero handle is the manual drag authority for rotating the complete angle scale.
  const zeroPoint = polar(geometry.cx, geometry.cy, geometry.frameInner, direction * rotation);
  ctx.beginPath();
  ctx.arc(zeroPoint.x, zeroPoint.y, Math.max(4.5, frameWidth * 1.55), 0, TWO_PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = innerColor;
  ctx.lineWidth = Math.max(2, frameWidth * 0.72);
  ctx.stroke();

  ctx.restore();

  canvas.dataset.gannzillaMovableRedGreenFrameV389 = 'true';
  canvas.dataset.gannzillaMovableFrameAngle = shortestSignedDegrees(rotation).toFixed(2);
  window.__gannzillaMovableFrameAngleV389 = shortestSignedDegrees(rotation);
  return true;
}

function pointerAngle(event, canvas, geometry) {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const x = (event.clientX - rect.left) * (geometry.width / rect.width);
  const y = (event.clientY - rect.top) * (geometry.height / rect.height);
  return normalizeDegrees((Math.atan2(y - geometry.cy, x - geometry.cx) * 180 / Math.PI) + 90);
}

function pointerRadius(event, canvas, geometry) {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return Infinity;
  const x = (event.clientX - rect.left) * (geometry.width / rect.width);
  const y = (event.clientY - rect.top) * (geometry.height / rect.height);
  return Math.hypot(x - geometry.cx, y - geometry.cy);
}

export default function GannzillaMovableRedGreenProtractorFrameV389() {
  React.useLayoutEffect(() => {
    if (!boolParam('showMovableGannzillaFrame', true)) return undefined;

    let disposed = false;
    let canvas = null;
    let dragging = false;
    let dragOffset = 0;
    let angle = normalizeDegrees(numberParam('gannzillaMovableFrameAngle', 0, -3600, 3600));
    const timers = new Set();

    const redraw = () => {
      if (disposed) return false;
      const nextCanvas = findWheelCanvas();
      if (!nextCanvas) return false;
      if (canvas !== nextCanvas) {
        if (canvas) {
          canvas.removeEventListener('pointerdown', onPointerDown, true);
          canvas.removeEventListener('pointermove', onPointerHover, true);
        }
        canvas = nextCanvas;
        canvas.addEventListener('pointerdown', onPointerDown, true);
        canvas.addEventListener('pointermove', onPointerHover, true);
      }
      return drawFrame(canvas, angle);
    };

    const schedule = (delay = 0) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        window.requestAnimationFrame(redraw);
      }, delay);
      timers.add(timer);
    };

    const scheduleAfterChange = () => [0, 120, 360, 760].forEach(schedule);

    function isFrameHit(event) {
      if (!canvas) return false;
      const geometry = geometryForCanvas(canvas);
      const radius = pointerRadius(event, canvas, geometry);
      return radius >= geometry.frameInner - 14 && radius <= geometry.frameOuter + 18;
    }

    function onPointerHover(event) {
      if (!canvas || dragging) return;
      canvas.style.cursor = isFrameHit(event) ? 'grab' : '';
    }

    function onPointerDown(event) {
      if (!canvas || event.button !== 0 || !isFrameHit(event)) return;
      const geometry = geometryForCanvas(canvas);
      const currentPointerAngle = pointerAngle(event, canvas, geometry);
      if (currentPointerAngle == null) return;
      dragging = true;
      dragOffset = normalizeDegrees(currentPointerAngle - angle);
      canvas.style.cursor = 'grabbing';
      canvas.setPointerCapture?.(event.pointerId);
      event.preventDefault();
      event.stopPropagation();
    }

    function onPointerMove(event) {
      if (!dragging || !canvas) return;
      const geometry = geometryForCanvas(canvas);
      const currentPointerAngle = pointerAngle(event, canvas, geometry);
      if (currentPointerAngle == null) return;
      const snap = numberParam('gannzillaMovableFrameSnap', 1, 0.1, 30);
      const rawAngle = normalizeDegrees(currentPointerAngle - dragOffset);
      angle = normalizeDegrees(Math.round(rawAngle / snap) * snap);
      drawFrame(canvas, angle);
      window.dispatchEvent(new CustomEvent('gannzilla:movable-frame-angle-v389', {
        detail: { angle: shortestSignedDegrees(angle) },
      }));
      event.preventDefault();
      event.stopPropagation();
    }

    function onPointerUp(event) {
      if (!dragging) return;
      dragging = false;
      if (canvas) {
        canvas.style.cursor = 'grab';
        canvas.releasePointerCapture?.(event.pointerId);
      }
      event.preventDefault();
      event.stopPropagation();
    }

    [40, 180, 420, 760, 1120].forEach(schedule);
    document.addEventListener('input', scheduleAfterChange, true);
    document.addEventListener('change', scheduleAfterChange, true);
    window.addEventListener('resize', scheduleAfterChange);
    window.addEventListener('pointermove', onPointerMove, true);
    window.addEventListener('pointerup', onPointerUp, true);
    window.addEventListener('pointercancel', onPointerUp, true);
    window.addEventListener('gannzilla:ring-two-numbering-refresh', scheduleAfterChange);
    window.addEventListener('gannzilla:canonical-property-change-v326', scheduleAfterChange);

    window.GANNZILLA_MOVABLE_RED_GREEN_PROTRACTOR_FRAME_V389 = true;
    window.__auditGannzillaMovableRedGreenProtractorFrameV389 = () => ({
      ok: Boolean(canvas?.dataset?.gannzillaMovableRedGreenFrameV389 === 'true'),
      build: BUILD,
      draggableFromZero: true,
      allAnglesRotateTogether: true,
      redInnerFrame: true,
      greenOuterFrame: true,
      currentAngle: shortestSignedDegrees(angle),
      snapDegrees: numberParam('gannzillaMovableFrameSnap', 1, 0.1, 30),
    });

    return () => {
      disposed = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      if (canvas) {
        canvas.removeEventListener('pointerdown', onPointerDown, true);
        canvas.removeEventListener('pointermove', onPointerHover, true);
        canvas.style.cursor = '';
      }
      document.removeEventListener('input', scheduleAfterChange, true);
      document.removeEventListener('change', scheduleAfterChange, true);
      window.removeEventListener('resize', scheduleAfterChange);
      window.removeEventListener('pointermove', onPointerMove, true);
      window.removeEventListener('pointerup', onPointerUp, true);
      window.removeEventListener('pointercancel', onPointerUp, true);
      window.removeEventListener('gannzilla:ring-two-numbering-refresh', scheduleAfterChange);
      window.removeEventListener('gannzilla:canonical-property-change-v326', scheduleAfterChange);
      delete window.GANNZILLA_MOVABLE_RED_GREEN_PROTRACTOR_FRAME_V389;
      delete window.__auditGannzillaMovableRedGreenProtractorFrameV389;
      delete window.__gannzillaMovableFrameAngleV389;
    };
  }, []);

  return null;
}
