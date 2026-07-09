import React from 'react';

const MARKER = 'GANNZILLA_NATIVE_PRECISION_WHEEL_V89';
const CANVAS_SIZE = 2000;
const CENTER = CANVAS_SIZE / 2;
const CENTER_RADIUS = 300;
const ANGLE_RING_WIDTH = 62;
const NUMBER_RING_WIDTH = 54;
const NUMBER_RINGS = 10;
const DIVISIONS = 36;
const TWO_PI = Math.PI * 2;
const FONT_STACK = '"Arial Black", Arial, Tahoma, sans-serif';

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

function queryNumber(name, fallback, min, max) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? clamp(value, min, max) : fallback;
}

function queryBool(name, fallback = false) {
  const p = params();
  if (!p.has(name)) return fallback;
  const value = String(p.get(name) || '').toLowerCase();
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
}

function polar(radius, degrees) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(radians),
    y: CENTER + radius * Math.sin(radians),
  };
}

function wedge(ctx, innerRadius, outerRadius, startDegrees, endDegrees) {
  const start = ((startDegrees - 90) * Math.PI) / 180;
  const end = ((endDegrees - 90) * Math.PI) / 180;
  ctx.beginPath();
  ctx.arc(CENTER, CENTER, outerRadius, start, end, false);
  ctx.arc(CENTER, CENTER, innerRadius, end, start, true);
  ctx.closePath();
}

function colorFor(value) {
  const number = Math.trunc(Number(value));
  if (!Number.isFinite(number)) return '#111111';
  const mod = ((number % 3) + 3) % 3;
  if (mod === 1) return '#d92f35';
  if (mod === 2) return '#2458bd';
  return '#111111';
}

function digitalRoot(value) {
  const number = Math.abs(Math.trunc(Number(value)) || 0);
  return number === 0 ? 0 : ((number - 1) % 9) + 1;
}

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)));
}

function drawText(ctx, text, x, y, size, color, weight = 900, alpha = 1) {
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
  ctx.font = `${weight} ${Math.max(6, size)}px ${FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(label, x, y);
  ctx.restore();
}

function readSettings() {
  const inputs = Array.from(document.querySelectorAll('aside input[type="number"]'));
  const startValue = Number(inputs[1]?.value ?? 1) || 0;
  const increment = Number(inputs[3]?.value ?? 1) || 1;
  return { startValue, increment };
}

function drawPrecisionWheel(canvas) {
  const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
  const pixelSize = Math.round(CANVAS_SIZE * dpr);
  if (canvas.width !== pixelSize) canvas.width = pixelSize;
  if (canvas.height !== pixelSize) canvas.height = pixelSize;

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const { startValue, increment } = readSettings();
  const numberScale = queryNumber('nativeNumberScale', 1.00, 0.65, 1.55);
  const angleScale = queryNumber('nativeAngleScale', 1.00, 0.70, 1.60);
  const showDigitSum = queryBool('nativeShowDigitSum', false);
  const mainWeight = Math.round(queryNumber('nativeMainWeight', 900, 700, 950));
  const smallWeight = Math.round(queryNumber('nativeSmallWeight', 800, 600, 950));
  const sector = 360 / DIVISIONS;
  const angleInner = CENTER_RADIUS;
  const angleOuter = angleInner + ANGLE_RING_WIDTH;
  const numberOuter = angleOuter + NUMBER_RINGS * NUMBER_RING_WIDTH;

  ctx.save();
  ctx.beginPath();
  ctx.arc(CENTER, CENTER, CENTER_RADIUS, 0, TWO_PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#c9c9c9';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  for (let index = 0; index < DIVISIONS; index += 1) {
    const startDegrees = index * sector;
    const endDegrees = (index + 1) * sector;
    const centerDegrees = (index + 0.5) * sector;
    const angleValue = (index + 1) * 10;

    ctx.save();
    wedge(ctx, angleInner, angleOuter, startDegrees, endDegrees);
    ctx.fillStyle = index % 2 === 0 ? '#f7f7f7' : '#e8e8e8';
    ctx.fill();
    ctx.strokeStyle = '#b9b9b9';
    ctx.lineWidth = 0.9;
    ctx.stroke();
    ctx.restore();

    const midRadius = (angleInner + angleOuter) / 2;
    const point = polar(midRadius, centerDegrees);
    const arcWidth = TWO_PI * midRadius / DIVISIONS;
    drawFittedText(
      ctx,
      angleValue,
      point.x,
      point.y,
      19 * angleScale,
      arcWidth * 0.78,
      ANGLE_RING_WIDTH * 0.60,
      colorFor(index + 1),
      mainWeight,
    );
  }

  for (let ring = 1; ring <= NUMBER_RINGS; ring += 1) {
    const inner = angleOuter + (ring - 1) * NUMBER_RING_WIDTH;
    const outer = inner + NUMBER_RING_WIDTH;
    const mid = (inner + outer) / 2;
    const arcWidth = TWO_PI * mid / DIVISIONS;
    const fill = ring % 2 === 1 ? '#ffffff' : '#ddddda';

    for (let index = 0; index < DIVISIONS; index += 1) {
      const startDegrees = index * sector;
      const endDegrees = (index + 1) * sector;
      const centerDegrees = (index + 0.5) * sector;
      const cellIndex = (ring - 1) * DIVISIONS + index;
      const value = startValue + cellIndex * increment;
      const label = formatNumber(value);

      ctx.save();
      wedge(ctx, inner, outer, startDegrees, endDegrees);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = '#c5c5c5';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();

      const point = polar(mid, centerDegrees);
      const requestedSize = Math.min(19 * numberScale, NUMBER_RING_WIDTH * 0.42);
      const mainHeight = showDigitSum ? NUMBER_RING_WIDTH * 0.46 : NUMBER_RING_WIDTH * 0.72;
      drawFittedText(
        ctx,
        label,
        point.x,
        point.y - (showDigitSum ? 5 : 0),
        requestedSize,
        arcWidth * 0.80,
        mainHeight,
        colorFor(value),
        mainWeight,
      );

      if (showDigitSum) {
        const rootPoint = polar(inner + NUMBER_RING_WIDTH * 0.78, centerDegrees);
        drawText(
          ctx,
          digitalRoot(value),
          rootPoint.x,
          rootPoint.y,
          7,
          colorFor(digitalRoot(value)),
          smallWeight,
          0.88,
        );
      }
    }
  }

  for (let index = 0; index < DIVISIONS; index += 1) {
    const degrees = index * sector;
    const start = polar(CENTER_RADIUS, degrees);
    const end = polar(numberOuter, degrees);
    ctx.save();
    ctx.strokeStyle = index % 3 === 0
      ? 'rgba(205,43,48,0.55)'
      : index % 3 === 1
        ? 'rgba(40,81,180,0.52)'
        : 'rgba(45,45,45,0.32)';
    ctx.lineWidth = index % 3 === 2 ? 0.55 : 0.8;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.restore();
  }

  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  for (let degree = 0; degree < 360; degree += 30) {
    const anglePoint = polar(numberOuter + 22, degree);
    drawText(ctx, degree === 0 ? 360 : degree, anglePoint.x, anglePoint.y, 11, '#333333', 900, 0.92);
    const dayPoint = polar(numberOuter + 58, degree);
    drawText(ctx, days[(degree / 30) % days.length], dayPoint.x, dayPoint.y, 13, '#111111', 800, 0.92);
  }

  [numberOuter + 8, numberOuter + 16, numberOuter + 24].forEach((radius) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(218,200,65,0.86)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, radius, 0, TWO_PI);
    ctx.stroke();
    ctx.restore();
  });

  window.__gannzillaNativePrecisionWheelV89Metrics = {
    ok: true,
    marker: window[MARKER] === true,
    canvasSize: CANVAS_SIZE,
    centerRadius: CENTER_RADIUS,
    angleRingWidth: ANGLE_RING_WIDTH,
    numberRingWidth: NUMBER_RING_WIDTH,
    numberRings: NUMBER_RINGS,
    numbersStartVisualRing: 2,
    divisions: DIVISIONS,
    numberCells: NUMBER_RINGS * DIVISIONS,
    nativeScale: true,
    scrollAndPan: true,
    fitToViewportDisabledByDefault: true,
    noTradingMutation: true,
    noMathMutation: true,
  };
}

export default function GannzillaNativePrecisionWheelV89() {
  const canvasRef = React.useRef(null);
  const viewportRef = React.useRef(null);
  const [zoom, setZoom] = React.useState(() => queryNumber('nativeZoom', 1.00, 0.35, 1.80));
  const [panelRight, setPanelRight] = React.useState(320);
  const [, forceRender] = React.useReducer((value) => value + 1, 0);

  const centerViewport = React.useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    requestAnimationFrame(() => {
      viewport.scrollLeft = Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2);
      viewport.scrollTop = Math.max(0, (viewport.scrollHeight - viewport.clientHeight) / 2);
    });
  }, []);

  const fitToScreen = React.useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const next = clamp(
      Math.min((viewport.clientWidth - 80) / CANVAS_SIZE, (viewport.clientHeight - 80) / CANVAS_SIZE),
      0.35,
      1.00,
    );
    setZoom(next);
    window.setTimeout(centerViewport, 60);
  }, [centerViewport]);

  React.useEffect(() => {
    window[MARKER] = true;
    window.__auditGannzillaNativePrecisionWheelV89 = () => {
      const metrics = window.__gannzillaNativePrecisionWheelV89Metrics || {};
      return {
        ok: window[MARKER] === true
          && metrics.ok === true
          && metrics.canvasSize === 2000
          && metrics.numberCells === 360
          && metrics.numbersStartVisualRing === 2,
        marker: window[MARKER] === true,
        metrics,
      };
    };

    const measurePanel = () => {
      const aside = document.querySelector('aside');
      const next = aside ? Math.round(aside.getBoundingClientRect().right) : 0;
      setPanelRight((current) => (Math.abs(current - next) > 1 ? next : current));
    };

    const sourceCanvases = Array.from(document.querySelectorAll('canvas'))
      .filter((canvas) => canvas !== canvasRef.current);
    sourceCanvases.forEach((canvas) => {
      canvas.dataset.nativePrecisionPreviousOpacity = canvas.style.opacity || '';
      canvas.style.opacity = '0.001';
    });

    const onInput = (event) => {
      if (event.target?.closest?.('aside')) forceRender();
    };

    measurePanel();
    const panelTimer = window.setInterval(measurePanel, 400);
    window.addEventListener('resize', measurePanel);
    document.addEventListener('input', onInput, true);
    document.addEventListener('change', onInput, true);
    window.setTimeout(centerViewport, 120);

    return () => {
      window.clearInterval(panelTimer);
      window.removeEventListener('resize', measurePanel);
      document.removeEventListener('input', onInput, true);
      document.removeEventListener('change', onInput, true);
      sourceCanvases.forEach((canvas) => {
        canvas.style.opacity = canvas.dataset.nativePrecisionPreviousOpacity || '';
        delete canvas.dataset.nativePrecisionPreviousOpacity;
      });
    };
  }, [centerViewport]);

  React.useLayoutEffect(() => {
    if (canvasRef.current) drawPrecisionWheel(canvasRef.current);
  });

  React.useEffect(() => {
    window.setTimeout(centerViewport, 30);
  }, [zoom, centerViewport]);

  const displayZoom = Math.round(zoom * 100);
  const canvasCssSize = CANVAS_SIZE * zoom;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          left: panelRight,
          right: 0,
          top: 24,
          bottom: 0,
          zIndex: 25,
          overflow: 'auto',
          background: '#ffffff',
          direction: 'ltr',
        }}
        ref={viewportRef}
      >
        <div
          style={{
            width: canvasCssSize,
            height: canvasCssSize,
            margin: '42px auto',
            position: 'relative',
            flex: '0 0 auto',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              display: 'block',
              width: canvasCssSize,
              height: canvasCssSize,
              background: '#ffffff',
            }}
          />
        </div>
      </div>

      <div
        dir="ltr"
        style={{
          position: 'fixed',
          top: 31,
          right: 18,
          zIndex: 90,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: 4,
          border: '1px solid #9b9b9b',
          borderRadius: 4,
          background: 'rgba(255,255,255,0.97)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.16)',
          fontFamily: 'Arial, Tahoma, sans-serif',
        }}
      >
        <button type="button" onClick={() => setZoom((value) => clamp(value - 0.10, 0.35, 1.80))} style={{ width: 28, height: 28 }}>−</button>
        <div style={{ minWidth: 48, textAlign: 'center', fontWeight: 800, fontSize: 12 }}>{displayZoom}%</div>
        <button type="button" onClick={() => setZoom((value) => clamp(value + 0.10, 0.35, 1.80))} style={{ width: 28, height: 28 }}>+</button>
        <button type="button" onClick={() => { setZoom(1); window.setTimeout(centerViewport, 60); }} style={{ height: 28, fontWeight: 700 }}>100%</button>
        <button type="button" onClick={fitToScreen} style={{ height: 28, fontWeight: 700 }}>ملاءمة</button>
      </div>
    </>
  );
}
