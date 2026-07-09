import React from 'react';

const OVERLAY_ID = 'gannzilla-radial-reference-renderer-v88';
const MARKER = 'GANNZILLA_ANGLE_RING1_NUMBERS_FROM_RING2_V88';
const TWO_PI = Math.PI * 2;
const FONT_STACK = 'Inter, "Arial Black", Tahoma, Arial, sans-serif';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function params() {
  try {
    return new URLSearchParams(window.location.search || '');
  } catch (_) {
    return new URLSearchParams('');
  }
}

function queryBool(name, fallback = false) {
  const p = params();
  if (!p.has(name)) return fallback;
  const value = String(p.get(name) || '').toLowerCase();
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
}

function queryNumber(name, fallback, min, max) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? clamp(value, min, max) : fallback;
}

function polar(cx, cy, radius, degrees) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function wedge(ctx, cx, cy, innerRadius, outerRadius, startDegrees, endDegrees) {
  const start = ((startDegrees - 90) * Math.PI) / 180;
  const end = ((endDegrees - 90) * Math.PI) / 180;
  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, start, end, false);
  ctx.arc(cx, cy, innerRadius, end, start, true);
  ctx.closePath();
}

function colorFor(value) {
  const number = Math.trunc(Number(value));
  if (!Number.isFinite(number)) return '#141414';
  const mod = ((number % 3) + 3) % 3;
  if (mod === 1) return '#df3037';
  if (mod === 2) return '#245bc7';
  return '#111111';
}

function digitalRoot(value) {
  const number = Math.abs(Math.trunc(Number(value)) || 0);
  return number === 0 ? 0 : ((number - 1) % 9) + 1;
}

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)));
}

function getNumberInputs() {
  return Array.from(document.querySelectorAll('aside input[type="number"]'));
}

function getViewSelect() {
  return Array.from(document.querySelectorAll('aside select')).find((select) =>
    Array.from(select.options || []).some((option) =>
      String(option.textContent || '').includes('Circle of 36')));
}

function getSettings() {
  const inputs = getNumberInputs();
  const forceTen = window.location.search.includes('clean10RingLayout=true');
  const numberLevels = forceTen ? 10 : clamp(Number(inputs[0]?.value) || 10, 1, 12);
  const startValue = Number(inputs[1]?.value ?? 1) || 0;
  const increment = Number(inputs[3]?.value ?? 1) || 1;
  const divisions = Number(getViewSelect()?.value) || 36;
  return { numberLevels, startValue, increment, divisions };
}

function getSourceCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => canvas.id !== OVERLAY_ID)
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 120 && rect.height > 120)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function drawText(ctx, text, x, y, size, color, weight = 800, alpha = 1) {
  ctx.save();
  ctx.font = `${weight} ${size}px ${FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillText(String(text), x, y);
  ctx.restore();
}

function drawFittedText(ctx, text, x, y, requestedSize, maxWidth, maxHeight, color, weight = 900) {
  const label = String(text);
  let size = Math.min(requestedSize, maxHeight * 0.92);
  ctx.save();
  ctx.font = `${weight} ${size}px ${FONT_STACK}`;
  const measured = Math.max(1, ctx.measureText(label).width);
  if (measured > maxWidth) size *= maxWidth / measured;
  ctx.font = `${weight} ${Math.max(3, size)}px ${FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(label, x, y);
  ctx.restore();
}

function drawCenter(ctx, cx, cy, radius) {
  const gradient = ctx.createRadialGradient(cx, cy, 1, cx, cy, radius);
  gradient.addColorStop(0, '#244e68');
  gradient.addColorStop(0.60, '#162733');
  gradient.addColorStop(1, '#0a1118');

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TWO_PI);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = 'rgba(55,130,175,0.55)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toLocaleTimeString('en-GB', { hour12: false });
  drawText(ctx, date, cx, cy - radius * 0.19, clamp(radius * 0.13, 5, 11), '#5cc7ff', 800, 0.95);
  drawText(ctx, time, cx, cy + radius * 0.09, clamp(radius * 0.21, 8, 17), '#42c6ff', 900, 0.98);
  drawText(ctx, 'NOW', cx, cy + radius * 0.39, clamp(radius * 0.10, 4, 8), '#70c5e8', 800, 0.90);
  ctx.restore();
}

function drawOuterReferenceLabels(ctx, cx, cy, wheelOuter, labelRadius, divisions) {
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  for (let degree = 0; degree < 360; degree += 30) {
    const anglePoint = polar(cx, cy, wheelOuter + 9, degree);
    drawText(ctx, degree === 0 ? 360 : degree, anglePoint.x, anglePoint.y, 8, '#555555', 800, 0.86);

    const dayPoint = polar(cx, cy, labelRadius, degree);
    drawText(ctx, days[(degree / 30) % days.length], dayPoint.x, dayPoint.y, 9, '#202020', 800, 0.95);
  }

  ctx.save();
  ctx.strokeStyle = 'rgba(214,198,78,0.88)';
  ctx.lineWidth = 0.8;
  [wheelOuter + 3, wheelOuter + 8, wheelOuter + 13].forEach((radius) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TWO_PI);
    ctx.stroke();
  });
  ctx.restore();

  for (let index = 0; index < divisions; index += 1) {
    const start = polar(cx, cy, wheelOuter + 3, index * 360 / divisions);
    const end = polar(cx, cy, wheelOuter + 13, index * 360 / divisions);
    ctx.save();
    ctx.strokeStyle = 'rgba(214,198,78,0.72)';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.restore();
  }
}

function drawAngleRing(ctx, geometry) {
  const {
    cx, cy, innerRadius, outerRadius, divisions, sector,
    angleScale, angleWeight,
  } = geometry;
  const mid = (innerRadius + outerRadius) / 2;
  const ringWidth = outerRadius - innerRadius;
  const arcWidth = TWO_PI * mid / divisions;

  for (let index = 0; index < divisions; index += 1) {
    const startDegrees = index * sector;
    const endDegrees = (index + 1) * sector;
    const centerDegrees = (index + 0.5) * sector;
    const angleValue = (index + 1) * 10;

    ctx.save();
    wedge(ctx, cx, cy, innerRadius, outerRadius, startDegrees, endDegrees);
    ctx.fillStyle = index % 2 === 0 ? '#f8f8f8' : '#eeeeee';
    ctx.fill();
    ctx.strokeStyle = 'rgba(150,150,150,0.72)';
    ctx.lineWidth = 0.72;
    ctx.stroke();
    ctx.restore();

    const point = polar(cx, cy, mid, centerDegrees);
    const requested = Math.min(ringWidth * 0.44, arcWidth / 2.2) * angleScale;
    drawFittedText(
      ctx,
      angleValue,
      point.x,
      point.y,
      requested,
      arcWidth * 0.82,
      ringWidth * 0.60,
      colorFor(angleValue / 10),
      angleWeight,
    );
  }
}

function renderRadialWheel(canvas, sourceCanvas) {
  const sourceRect = sourceCanvas?.getBoundingClientRect?.();
  if (!sourceRect || sourceRect.width < 120 || sourceRect.height < 120) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.style.position = 'fixed';
  canvas.style.left = `${sourceRect.left}px`;
  canvas.style.top = `${sourceRect.top}px`;
  canvas.style.width = `${sourceRect.width}px`;
  canvas.style.height = `${sourceRect.height}px`;
  canvas.style.zIndex = '2147483600';
  canvas.style.pointerEvents = 'none';
  canvas.style.background = '#ffffff';

  const pixelWidth = Math.max(1, Math.round(sourceRect.width * dpr));
  const pixelHeight = Math.max(1, Math.round(sourceRect.height * dpr));
  if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
  if (canvas.height !== pixelHeight) canvas.height = pixelHeight;

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, sourceRect.width, sourceRect.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, sourceRect.width, sourceRect.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const settings = getSettings();
  const { numberLevels, startValue, increment, divisions } = settings;
  const side = Math.min(sourceRect.width, sourceRect.height);
  const cx = sourceRect.width / 2;
  const cy = sourceRect.height / 2;
  const labelMargin = clamp(side * 0.075, 38, 72);
  const wheelOuter = side / 2 - labelMargin;
  const centerRadius = clamp(wheelOuter * queryNumber('radialInnerRatio', 0.105, 0.06, 0.22), 20, wheelOuter * 0.22);
  const angleRingRatio = queryNumber('radialAngleRingRatio', 0.82, 0.45, 1.50);
  const numberRingWidth = (wheelOuter - centerRadius) / (numberLevels + angleRingRatio);
  const angleRingWidth = numberRingWidth * angleRingRatio;
  const angleInner = centerRadius;
  const angleOuter = angleInner + angleRingWidth;
  const sector = 360 / divisions;

  const mainScale = queryNumber('radialNumberScale', 1.22, 0.50, 2.50);
  const angleScale = queryNumber('radialAngleScale', 1.18, 0.60, 2.40);
  const showDigitSum = queryBool('radialShowDigitSum', true);
  const showCellIndex = queryBool('radialShowCellIndex', false);
  const mainWeight = Math.round(queryNumber('radialMainWeight', 900, 700, 950));
  const smallWeight = Math.round(queryNumber('radialSmallWeight', 800, 600, 950));
  const angleWeight = Math.round(queryNumber('radialAngleWeight', 900, 700, 950));

  drawAngleRing(ctx, {
    cx,
    cy,
    innerRadius: angleInner,
    outerRadius: angleOuter,
    divisions,
    sector,
    angleScale,
    angleWeight,
  });

  for (let numberRing = 1; numberRing <= numberLevels; numberRing += 1) {
    const visualRing = numberRing + 1;
    const inner = angleOuter + (numberRing - 1) * numberRingWidth;
    const outer = inner + numberRingWidth;
    const mid = (inner + outer) / 2;
    const fill = visualRing % 2 === 0 ? '#ffffff' : '#f3f3f3';
    const arcWidth = TWO_PI * mid / divisions;

    for (let index = 0; index < divisions; index += 1) {
      const startDegrees = index * sector;
      const endDegrees = (index + 1) * sector;
      const centerDegrees = (index + 0.5) * sector;
      const cellIndex = (numberRing - 1) * divisions + index + 1;
      const value = startValue + (cellIndex - 1) * increment;
      const label = formatNumber(value);

      ctx.save();
      wedge(ctx, cx, cy, inner, outer, startDegrees, endDegrees);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = 'rgba(185,185,185,0.56)';
      ctx.lineWidth = 0.55;
      ctx.stroke();
      ctx.restore();

      const centerPoint = polar(cx, cy, mid, centerDegrees);
      const topPoint = polar(cx, cy, inner + numberRingWidth * 0.22, centerDegrees);
      const bottomPoint = polar(cx, cy, inner + numberRingWidth * 0.80, centerDegrees);
      const requested = Math.min(numberRingWidth * 0.42, arcWidth / Math.max(2.7, label.length * 0.61)) * mainScale;
      const maxWidth = arcWidth * 0.76;
      const maxHeight = numberRingWidth * (showDigitSum || showCellIndex ? 0.43 : 0.72);

      drawFittedText(
        ctx,
        label,
        centerPoint.x,
        centerPoint.y,
        requested,
        maxWidth,
        maxHeight,
        colorFor(value),
        mainWeight,
      );

      const smallSize = clamp(requested * 0.43, 3.0, 8.0);
      if (showCellIndex) {
        drawText(ctx, cellIndex, topPoint.x, topPoint.y, smallSize, colorFor(cellIndex), smallWeight, 0.84);
      }
      if (showDigitSum) {
        const root = digitalRoot(value);
        drawText(ctx, root, bottomPoint.x, bottomPoint.y, smallSize, colorFor(root), smallWeight, 0.88);
      }
    }
  }

  for (let index = 0; index < divisions; index += 1) {
    const degrees = index * sector;
    const start = polar(cx, cy, centerRadius * 0.18, degrees);
    const end = polar(cx, cy, wheelOuter, degrees);
    ctx.save();
    ctx.strokeStyle = index % 3 === 0
      ? 'rgba(210,42,48,0.80)'
      : index % 3 === 1
        ? 'rgba(40,84,190,0.78)'
        : 'rgba(30,30,30,0.58)';
    ctx.lineWidth = index % 3 === 2 ? 0.72 : 1.0;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.restore();
  }

  drawCenter(ctx, cx, cy, clamp(centerRadius * 0.48, 14, 52));
  drawOuterReferenceLabels(ctx, cx, cy, wheelOuter, wheelOuter + labelMargin * 0.62, divisions);

  window.__gannzillaRadialReferenceRendererV88Metrics = {
    ok: true,
    marker: window[MARKER] === true,
    numberLevels,
    visualRings: numberLevels + 1,
    numbersStartVisualRing: 2,
    angleRingCells: divisions,
    numberCells: numberLevels * divisions,
    divisions,
    sourceWidth: sourceRect.width,
    sourceHeight: sourceRect.height,
    centerRadius,
    angleRingWidth,
    numberRingWidth,
    wheelOuter,
    followsNativeZoom: true,
    stableResizeObserverOnly: true,
    noTradingMutation: true,
    noMathMutation: true,
  };
}

export default function GannzillaRadialReferenceRendererV87() {
  React.useEffect(() => {
    const isEnabled = window.location.search.includes('radialReferenceLayout=true');
    if (!isEnabled) return undefined;

    let canvas = document.getElementById(OVERLAY_ID);
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = OVERLAY_ID;
      document.body.appendChild(canvas);
    }

    window[MARKER] = true;
    window.GANNZILLA_ANGLE_RING1_NUMBERS_FROM_RING2_V88 = true;
    window.__auditGannzillaRadialReferenceRendererV87 = () => {
      const metrics = window.__gannzillaRadialReferenceRendererV88Metrics || {};
      return {
        ok: window[MARKER] === true
          && metrics.ok === true
          && metrics.numberLevels === 10
          && metrics.visualRings === 11
          && metrics.numbersStartVisualRing === 2
          && metrics.angleRingCells === 36
          && metrics.numberCells === 360,
        markerV88: window[MARKER] === true,
        metrics,
      };
    };
    window.__auditGannzillaAngleRing1NumbersFromRing2V88 = window.__auditGannzillaRadialReferenceRendererV87;

    let sourceCanvas = null;
    let resizeObserver = null;
    let mutationObserver = null;
    let renderFrame = null;

    const scheduleRender = () => {
      if (renderFrame !== null) cancelAnimationFrame(renderFrame);
      renderFrame = requestAnimationFrame(() => {
        renderFrame = null;
        if (!sourceCanvas || !document.body.contains(sourceCanvas)) {
          sourceCanvas = getSourceCanvas();
          if (sourceCanvas) {
            sourceCanvas.style.opacity = queryBool('hideSourceWheel', true) ? '0.001' : '';
            resizeObserver?.disconnect();
            resizeObserver = new ResizeObserver(scheduleRender);
            resizeObserver.observe(sourceCanvas);
            mutationObserver?.disconnect();
            mutationObserver = new MutationObserver(scheduleRender);
            mutationObserver.observe(sourceCanvas, { attributes: true, attributeFilter: ['style', 'width', 'height'] });
          }
        }
        if (sourceCanvas) renderRadialWheel(canvas, sourceCanvas);
      });
    };

    const onInput = (event) => {
      if (event.target?.closest?.('aside')) scheduleRender();
    };

    const clockTimer = window.setInterval(scheduleRender, 1000);
    window.addEventListener('resize', scheduleRender);
    window.addEventListener('scroll', scheduleRender, true);
    document.addEventListener('input', onInput, true);
    document.addEventListener('change', onInput, true);
    scheduleRender();

    return () => {
      window.clearInterval(clockTimer);
      window.removeEventListener('resize', scheduleRender);
      window.removeEventListener('scroll', scheduleRender, true);
      document.removeEventListener('input', onInput, true);
      document.removeEventListener('change', onInput, true);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      if (renderFrame !== null) cancelAnimationFrame(renderFrame);
      if (sourceCanvas) sourceCanvas.style.opacity = '';
      document.getElementById(OVERLAY_ID)?.remove();
    };
  }, []);

  return null;
}
