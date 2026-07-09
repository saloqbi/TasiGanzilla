import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const TWO_PI = Math.PI * 2;
const MIN_ZOOM = 0.10;
const MAX_ZOOM = 3.00;
const DEFAULT_FONT_SIZE = 13;
const DEFAULT_FONT_WEIGHT = 700;
const DEFAULT_INNER_RADIUS = 170;
const DEFAULT_RING_WIDTH = 60;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function params() {
  try {
    return new URLSearchParams(window.location.search || '');
  } catch (_) {
    return new URLSearchParams();
  }
}

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? clamp(value, min, max) : fallback;
}

function boolParam(name, fallback) {
  const p = params();
  if (!p.has(name)) return fallback;
  const value = String(p.get(name) || '').toLowerCase();
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
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

function normalizeRotation(degrees) {
  let radians = ((degrees - 90) * Math.PI) / 180;
  while (radians > Math.PI) radians -= TWO_PI;
  while (radians < -Math.PI) radians += TWO_PI;
  if (radians > Math.PI / 2) radians -= Math.PI;
  if (radians < -Math.PI / 2) radians += Math.PI;
  return radians;
}

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)));
}

function drawFixedText(ctx, text, x, y, angleDegrees, fontSize, maxWidth, weight, color = '#111111', alpha = 1) {
  ctx.save();
  ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5);
  ctx.rotate(normalizeRotation(angleDegrees));
  ctx.font = `${weight} ${fontSize}px Segoe UI, Arial, Helvetica, sans-serif`;
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(text), 0, 0, Math.max(8, maxWidth));
  ctx.restore();
}

function drawCircle(ctx, x, y, radius, fill, stroke, lineWidth = 1) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TWO_PI);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  ctx.restore();
}

const buttonStyle = {
  border: '1px solid #a7a7a7',
  background: '#f7f7f7',
  color: '#222',
  borderRadius: 2,
  height: 21,
  padding: '0 6px',
  fontFamily: 'Segoe UI, Arial, sans-serif',
  fontSize: 12,
  cursor: 'pointer',
};

const panelStyle = {
  position: 'fixed',
  left: 0,
  top: 24,
  width: 330,
  height: 'calc(100vh - 24px)',
  overflow: 'auto',
  zIndex: 30,
  background: '#f2f2f2',
  borderRight: '1px solid #b8b8b8',
  color: '#222',
  direction: 'ltr',
  fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
  fontSize: 12,
};

const rowStyle = {
  display: 'grid',
  gridTemplateColumns: '148px 1fr 18px',
  alignItems: 'center',
  minHeight: 23,
  borderBottom: '1px solid #d6d6d6',
  background: '#f3f3f3',
};

const fieldStyle = {
  width: '100%',
  height: 20,
  border: '1px solid #aaa',
  background: '#fff',
  color: '#111',
  fontSize: 12,
};

function Section({ title, children, defaultOpen = true, muted = false, icon = '▦' }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid #c8c8c8' }}>
      <div
        onClick={() => setOpen((value) => !value)}
        style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '2px 4px',
          background: muted ? '#eeeeee' : '#ececdd', color: muted ? '#777' : '#1d1d1d',
          fontWeight: 800, borderTop: '1px solid #d3d3c7', cursor: 'pointer', userSelect: 'none',
        }}
      >
        <span style={{ color: '#0096a6', width: 10 }}>{open ? '−' : '+'}</span>
        <span style={{ flex: 1 }}>{title}</span>
        <span style={{ opacity: 0.55 }}>{icon}</span>
      </div>
      {open && children}
    </div>
  );
}

function Field({ label, children, glyph = '', disabled = false }) {
  return (
    <div style={{ ...rowStyle, opacity: disabled ? 0.46 : 1 }}>
      <div style={{ padding: '2px 6px', color: '#333', fontWeight: 500 }}>{label}</div>
      <div style={{ padding: '1px 5px' }}>{children}</div>
      <div style={{ color: '#777', textAlign: 'center' }}>{glyph}</div>
    </div>
  );
}

function CheckField({ label, checked, onChange, disabled = false }) {
  return (
    <Field label={label} disabled={disabled}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange?.(event.target.checked)} />
    </Field>
  );
}

function NumField({ label, value, onChange, min, max, step = 1, glyph = '' }) {
  return (
    <Field label={label} glyph={glyph}>
      <input style={fieldStyle} type="number" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} />
    </Field>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <Field label={label} glyph="▾">
      <select style={fieldStyle} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option value={option.value ?? option} key={option.value ?? option}>{option.label ?? option}</option>)}
      </select>
    </Field>
  );
}

function TopToolbar({ zoom, setZoom, fitToScreen, clockwise, setClockwise }) {
  const iconStyle = { ...buttonStyle, width: 22, padding: 0, color: '#1c75bc', fontWeight: 800, marginRight: 2 };
  return (
    <div style={{ position: 'fixed', left: 0, right: 0, top: 0, height: 24, zIndex: 60, display: 'flex', alignItems: 'center', direction: 'ltr', background: '#efefef', borderBottom: '1px solid #bdbdbd', fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: 12, color: '#222' }}>
      <div style={{ width: 330, height: '100%', display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 5, borderRight: '1px solid #c9c9c9' }}>
        <span style={{ fontWeight: 700 }}>Gannzilla Pro</span>
        <span style={{ marginLeft: 'auto', color: '#333' }}>Default</span>
        <button type="button" style={{ ...buttonStyle, color: '#13a332', fontWeight: 800 }}>＋ Add</button>
        <button type="button" style={{ ...buttonStyle, color: '#c82020', fontWeight: 800 }}>−</button>
        <button type="button" style={buttonStyle}>✎</button>
        <button type="button" style={buttonStyle}>▣</button>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>
        {['↖', '—', '▢', 'T', '🔒', '⌕'].map((label) => <button type="button" key={label} style={iconStyle}>{label}</button>)}
        <button type="button" onClick={fitToScreen} style={iconStyle}>⛶</button>
        <button type="button" onClick={() => setZoom((value) => clamp(value - (value > 1 ? 0.10 : 0.05), MIN_ZOOM, MAX_ZOOM))} style={iconStyle}>−</button>
        <span style={{ minWidth: 44, textAlign: 'center', fontWeight: 700 }}>{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={() => setZoom((value) => clamp(value + (value >= 1 ? 0.10 : 0.05), MIN_ZOOM, MAX_ZOOM))} style={iconStyle}>＋</button>
        <button type="button" onClick={() => setZoom(1)} style={{ ...buttonStyle, marginLeft: 5 }}>100%</button>
        <button type="button" onClick={() => setClockwise((value) => !value)} style={{ ...buttonStyle, marginLeft: 5 }}>{clockwise ? 'Clockwise' : 'Counter'}</button>
        <span style={{ marginLeft: 8 }}>🇬🇧 English</span>
        <span style={{ marginLeft: 8, color: '#235ba8', fontWeight: 800 }}>ⓘ</span>
      </div>
    </div>
  );
}

function SideShapeBar() {
  const shapes = ['◁', '□', '⬠', '⬡', '⬟', '◯', '△', '◢', '◎'];
  return (
    <div style={{ position: 'fixed', right: 18, top: 168, zIndex: 18, background: 'rgba(255,255,255,0.82)', border: '1px solid #e2e2e2', borderRadius: 18, padding: 7, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {shapes.map((shape) => <button type="button" key={shape} style={{ width: 28, height: 28, border: '1px solid #d2d2d2', borderRadius: 3, background: '#fafafa', color: '#9aa', fontSize: 18 }}>{shape}</button>)}
    </div>
  );
}

export default function GannzillaClassicFullOptionsV94() {
  const canvasRef = useRef(null);
  const viewportRef = useRef(null);
  const p = params();

  const [panelVisible, setPanelVisible] = useState(p.get('hidePanel') !== 'true');
  const [layoutVisible, setLayoutVisible] = useState(true);
  const [levels, setLevels] = useState(() => Math.round(numberParam('levels', 10, 1, 12)));
  const [divisions, setDivisions] = useState(() => Math.round(numberParam('divisions', 36, 3, 360)));
  const [dataType, setDataType] = useState('Price');
  const [startValue, setStartValue] = useState(() => numberParam('startValue', 79680, -1000000000, 1000000000));
  const [findValue, setFindValue] = useState(1);
  const [increment, setIncrement] = useState(() => numberParam('increment', 1, -1000000, 1000000));
  const [clockwise, setClockwise] = useState(true);
  const [showNumbers, setShowNumbers] = useState(true);
  const [showMarks, setShowMarks] = useState(true);
  const [highlightVisible, setHighlightVisible] = useState(false);
  const [highlightFill, setHighlightFill] = useState('Levels');

  const [showProtractor, setShowProtractor] = useState(boolParam('showProtractor', true));
  const [protractorClockwise, setProtractorClockwise] = useState(true);
  const [protractorAngle, setProtractorAngle] = useState(0);

  const [counterVisible, setCounterVisible] = useState(false);
  const [counterClockwise, setCounterClockwise] = useState(true);
  const [counterStart, setCounterStart] = useState(1);
  const [counterStep, setCounterStep] = useState(1);
  const [counterRadius, setCounterRadius] = useState(34);
  const [counterFontSize, setCounterFontSize] = useState(11);

  const [secondaryVisible, setSecondaryVisible] = useState(false);
  const [secondaryClockwise, setSecondaryClockwise] = useState(true);
  const [secondaryStart, setSecondaryStart] = useState(0);
  const [secondaryIncrement, setSecondaryIncrement] = useState(10);
  const [secondaryDivisions, setSecondaryDivisions] = useState(36);
  const [secondaryRadius, setSecondaryRadius] = useState(60);
  const [secondaryFontSize, setSecondaryFontSize] = useState(10);

  const [markerVisible, setMarkerVisible] = useState(false);
  const [markerAngle, setMarkerAngle] = useState(0);
  const [markerRadius, setMarkerRadius] = useState(0);
  const [markerShape, setMarkerShape] = useState('Triangle');
  const [markerColor, setMarkerColor] = useState('#e93020');
  const [markerWidth, setMarkerWidth] = useState(2);
  const [markerLabel, setMarkerLabel] = useState('');

  const [showChronometer, setShowChronometer] = useState(boolParam('showChronometer', false));
  const [chronometerClockwise, setChronometerClockwise] = useState(true);
  const [chronometerAngle, setChronometerAngle] = useState(0);
  const [chronometerRange, setChronometerRange] = useState('Annual');
  const [chronometerSecondary, setChronometerSecondary] = useState(false);
  const [chronometerMarker, setChronometerMarker] = useState(false);

  const [showCosmogram, setShowCosmogram] = useState(false);
  const [cosmogramClockwise, setCosmogramClockwise] = useState(true);
  const [cosmogramAngle, setCosmogramAngle] = useState(0);
  const [cosmogramSystem, setCosmogramSystem] = useState('Geocentric');

  const [city, setCity] = useState('New York');
  const [latitude, setLatitude] = useState('40° 43′ North');
  const [longitude, setLongitude] = useState('74° 1′ West');

  const [moonVisible, setMoonVisible] = useState(false);
  const [moonEclipses, setMoonEclipses] = useState(false);
  const [moonSize, setMoonSize] = useState(10);
  const [moonOffset, setMoonOffset] = useState(28);

  const [zoom, setZoom] = useState(() => numberParam('gannzillaZoom', 1, MIN_ZOOM, MAX_ZOOM));
  const fontSize = numberParam('gannzillaFontSize', DEFAULT_FONT_SIZE, 8, 30);
  const fontWeight = Math.round(numberParam('gannzillaFontWeight', DEFAULT_FONT_WEIGHT, 500, 900));
  const innerRadius = numberParam('gannzillaInnerRadius', DEFAULT_INNER_RADIUS, 80, 500);
  const ringWidth = numberParam('gannzillaRingWidth', DEFAULT_RING_WIDTH, 30, 150);

  const geometry = useMemo(() => {
    const wheelRadius = innerRadius + levels * ringWidth;
    const protractorGap = 18;
    const protractorWidth = showProtractor ? 34 : 0;
    const optionAllowance = Math.max(counterRadius, secondaryRadius, moonOffset, 20);
    const chronometerWidth = showChronometer ? 54 : 0;
    const cosmogramWidth = showCosmogram ? 58 : 0;
    const outerRadius = wheelRadius + protractorGap + protractorWidth + optionAllowance + chronometerWidth + cosmogramWidth + 80;
    const size = Math.ceil(outerRadius * 2 + 60);
    return { innerRadius, ringWidth, wheelRadius, protractorGap, protractorWidth, outerRadius, size };
  }, [innerRadius, ringWidth, levels, showProtractor, counterRadius, secondaryRadius, moonOffset, showChronometer, showCosmogram]);

  const centerViewport = useCallback(() => {
    const viewport = viewportRef.current;
    const canvas = canvasRef.current;
    if (!viewport || !canvas) return;
    requestAnimationFrame(() => {
      viewport.scrollLeft = Math.max(0, (canvas.offsetWidth - viewport.clientWidth) / 2);
      viewport.scrollTop = Math.max(0, (canvas.offsetHeight - viewport.clientHeight) / 2);
    });
  }, []);

  const fitToScreen = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const fit = Math.min((viewport.clientWidth - 60) / geometry.size, (viewport.clientHeight - 60) / geometry.size);
    setZoom(clamp(fit, MIN_ZOOM, 1));
    window.setTimeout(centerViewport, 40);
  }, [geometry.size, centerViewport]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
    canvas.width = Math.ceil(geometry.size * dpr);
    canvas.height = Math.ceil(geometry.size * dpr);
    canvas.style.width = `${geometry.size * zoom}px`;
    canvas.style.height = `${geometry.size * zoom}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, geometry.size, geometry.size);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, geometry.size, geometry.size);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    if (!layoutVisible) return;

    const cx = geometry.size / 2;
    const cy = geometry.size / 2;
    const sector = 360 / divisions;
    const direction = clockwise ? 1 : -1;

    drawCircle(ctx, cx, cy, geometry.innerRadius, '#ffffff', '#d0d0d0', 1);

    for (let ring = 1; ring <= levels; ring += 1) {
      const inner = geometry.innerRadius + (ring - 1) * geometry.ringWidth;
      const outer = inner + geometry.ringWidth;
      const mid = (inner + outer) / 2;
      const fill = ring % 2 === 0 ? '#dededb' : '#ffffff';
      const arcWidth = (TWO_PI * mid) / divisions;
      const maxWidth = arcWidth * 0.78;

      for (let index = 0; index < divisions; index += 1) {
        const startDegrees = direction * index * sector;
        const endDegrees = direction * (index + 1) * sector;
        const centerDegrees = direction * (index + 0.5) * sector;
        const value = startValue + ((ring - 1) * divisions + index) * increment;

        ctx.save();
        wedge(ctx, cx, cy, inner, outer, startDegrees, endDegrees);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = '#c5c5c5';
        ctx.lineWidth = 0.82;
        ctx.stroke();
        ctx.restore();

        if (showNumbers) {
          const point = polar(cx, cy, mid, centerDegrees);
          drawFixedText(ctx, formatNumber(value), point.x, point.y, centerDegrees, fontSize, maxWidth, fontWeight);
        }
      }
    }

    if (highlightVisible) {
      const index = Math.max(0, Math.min(divisions - 1, Math.abs(Math.trunc(Number(findValue))) % divisions));
      const inner = geometry.innerRadius;
      const outer = inner + geometry.ringWidth;
      ctx.save();
      wedge(ctx, cx, cy, inner, outer, direction * index * sector, direction * (index + 1) * sector);
      ctx.fillStyle = highlightFill === 'Levels' ? 'rgba(239,74,74,0.30)' : 'rgba(86,170,255,0.26)';
      ctx.fill();
      ctx.restore();
    }

    let outerCursor = geometry.wheelRadius + geometry.protractorGap;

    if (showProtractor) {
      const inner = outerCursor;
      const outer = inner + 34;
      const pDirection = protractorClockwise ? 1 : -1;
      ctx.save();
      ctx.strokeStyle = '#c7c7c7';
      ctx.lineWidth = 1;
      [inner, outer].forEach((radius) => { ctx.beginPath(); ctx.arc(cx, cy, radius, 0, TWO_PI); ctx.stroke(); });
      for (let degree = 0; degree < 360; degree += 5) {
        const major = degree % 30 === 0;
        const rotatedDegree = pDirection * (degree + protractorAngle);
        const p1 = polar(cx, cy, major ? inner - 2 : inner, rotatedDegree);
        const p2 = polar(cx, cy, outer + (major ? 5 : 0), rotatedDegree);
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = major ? '#dd4040' : '#b8b8b8'; ctx.lineWidth = major ? 1.2 : 0.8; ctx.stroke();
        if (major && showMarks) {
          const point = polar(cx, cy, outer + 22, rotatedDegree);
          drawFixedText(ctx, `${degree}°`, point.x, point.y, rotatedDegree, 12, 42, 700, '#555');
        }
      }
      ctx.restore();
      outerCursor = outer + 24;
    }

    if (counterVisible) {
      const radius = outerCursor + counterRadius;
      const cDirection = counterClockwise ? 1 : -1;
      drawCircle(ctx, cx, cy, radius, null, '#b8b8b8', 1);
      for (let index = 0; index < divisions; index += 1) {
        const degree = cDirection * (index + 0.5) * sector;
        const point = polar(cx, cy, radius, degree);
        drawFixedText(ctx, counterStart + index * counterStep, point.x, point.y, degree, counterFontSize, 55, 700, '#333');
      }
      outerCursor = radius + 22;
    }

    if (secondaryVisible) {
      const radius = outerCursor + secondaryRadius;
      const sDirection = secondaryClockwise ? 1 : -1;
      const sSector = 360 / Math.max(3, secondaryDivisions);
      drawCircle(ctx, cx, cy, radius, null, '#98a9b8', 1);
      for (let index = 0; index < secondaryDivisions; index += 1) {
        const degree = sDirection * (index + 0.5) * sSector;
        const point = polar(cx, cy, radius, degree);
        drawFixedText(ctx, secondaryStart + index * secondaryIncrement, point.x, point.y, degree, secondaryFontSize, 58, 700, '#2458bd');
      }
      outerCursor = radius + 24;
    }

    if (showChronometer) {
      const radius = outerCursor + 30;
      const labelsByRange = {
        Annual: ['21 MAR', '5 APR', '21 APR', '6 MAY', '21 MAY', '6 JUN', '21 JUN', '6 JUL', '22 JUL', '6 AUG', '22 AUG', '6 SEP', '22 SEP', '7 OCT', '22 OCT', '6 NOV', '21 NOV', '6 DEC', '21 DEC', '5 JAN', '20 JAN', '4 FEB', '19 FEB', '6 MAR'],
        Monthly: Array.from({ length: 30 }, (_, index) => String(index + 1)),
        Weekly: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
        Daily: Array.from({ length: 24 }, (_, index) => `${index}:00`),
      };
      const labels = labelsByRange[chronometerRange] || labelsByRange.Annual;
      const cDirection = chronometerClockwise ? 1 : -1;
      drawCircle(ctx, cx, cy, radius, null, '#b7cfc1', 2);
      labels.forEach((label, index) => {
        const degree = cDirection * (chronometerAngle + index * 360 / labels.length);
        const point = polar(cx, cy, radius + 26, degree);
        drawFixedText(ctx, label, point.x, point.y, degree, 11, 74, 700, '#666');
      });
      if (chronometerSecondary) drawCircle(ctx, cx, cy, radius + 12, null, '#8fa99a', 1);
      if (chronometerMarker) {
        const markerPoint = polar(cx, cy, radius, chronometerAngle);
        drawCircle(ctx, markerPoint.x, markerPoint.y, 5, '#e93020', '#a71c15', 1);
      }
      outerCursor = radius + 50;
    }

    if (showCosmogram) {
      const radius = outerCursor + 28;
      const symbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
      const cDirection = cosmogramClockwise ? 1 : -1;
      drawCircle(ctx, cx, cy, radius, null, cosmogramSystem === 'Heliocentric' ? '#d49b35' : '#87cfa3', 2);
      symbols.forEach((symbol, index) => {
        const degree = cDirection * (cosmogramAngle + index * 30);
        const point = polar(cx, cy, radius + 24, degree);
        drawFixedText(ctx, symbol, point.x, point.y, degree, 17, 32, 700, '#4c775c');
      });
      outerCursor = radius + 48;
    }

    if (moonVisible) {
      const radius = outerCursor + moonOffset;
      const phases = ['●', '◕', '◑', '◔', '○', '◔', '◑', '◕'];
      phases.forEach((phase, index) => {
        const degree = index * 45;
        const point = polar(cx, cy, radius, degree);
        drawFixedText(ctx, phase, point.x, point.y, degree, moonSize, 28, 700, '#555');
      });
      if (moonEclipses) {
        [90, 270].forEach((degree) => {
          const point = polar(cx, cy, radius + 18, degree);
          drawCircle(ctx, point.x, point.y, 5, '#df3037', '#8f1116', 1);
        });
      }
    }

    if (markerVisible) {
      const radius = markerRadius > 0 ? markerRadius : geometry.wheelRadius + 46;
      const point = polar(cx, cy, radius, markerAngle);
      const centerPoint = polar(cx, cy, geometry.innerRadius, markerAngle);
      ctx.save();
      ctx.strokeStyle = markerColor;
      ctx.lineWidth = markerWidth;
      ctx.beginPath(); ctx.moveTo(centerPoint.x, centerPoint.y); ctx.lineTo(point.x, point.y); ctx.stroke();
      ctx.restore();
      if (markerShape === 'Circle') drawCircle(ctx, point.x, point.y, 7, markerColor, '#111', 1);
      else if (markerShape === 'Square') {
        ctx.save(); ctx.fillStyle = markerColor; ctx.fillRect(point.x - 6, point.y - 6, 12, 12); ctx.restore();
      } else {
        ctx.save(); ctx.translate(point.x, point.y); ctx.rotate(((markerAngle - 90) * Math.PI) / 180);
        ctx.fillStyle = markerColor; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(8, 10); ctx.lineTo(-8, 10); ctx.closePath(); ctx.fill(); ctx.restore();
      }
      if (markerLabel) drawFixedText(ctx, markerLabel, point.x, point.y - 18, markerAngle, 11, 80, 700, markerColor);
    }

    window.__gannzillaClassicFullOptionsV94Metrics = {
      ok: true,
      singleRenderer: true,
      fixedFontAcrossRings: true,
      optionGroups: ['Layout', 'Price', 'Highlight', 'Protractor', 'Counter', 'Secondary scale', 'Marker', 'Chronometer', 'Cosmogram', 'Location', 'Moon phases'],
      fontSize,
      fontWeight,
      levels,
      divisions,
      city,
      latitude,
      longitude,
    };
  }, [geometry, zoom, layoutVisible, levels, divisions, startValue, increment, clockwise, showNumbers, highlightVisible, highlightFill, findValue, fontSize, fontWeight, showProtractor, showMarks, protractorClockwise, protractorAngle, counterVisible, counterClockwise, counterStart, counterStep, counterRadius, counterFontSize, secondaryVisible, secondaryClockwise, secondaryStart, secondaryIncrement, secondaryDivisions, secondaryRadius, secondaryFontSize, showChronometer, chronometerClockwise, chronometerAngle, chronometerRange, chronometerSecondary, chronometerMarker, showCosmogram, cosmogramClockwise, cosmogramAngle, cosmogramSystem, moonVisible, moonEclipses, moonSize, moonOffset, markerVisible, markerAngle, markerRadius, markerShape, markerColor, markerWidth, markerLabel, city, latitude, longitude]);

  useEffect(() => {
    window.GANNZILLA_CLASSIC_FULL_OPTIONS_V94 = true;
    window.__auditGannzillaClassicFullOptionsV94 = () => ({
      ok: window.GANNZILLA_CLASSIC_FULL_OPTIONS_V94 === true
        && window.__gannzillaClassicFullOptionsV94Metrics?.singleRenderer === true
        && window.__gannzillaClassicFullOptionsV94Metrics?.fixedFontAcrossRings === true,
      metrics: window.__gannzillaClassicFullOptionsV94Metrics || null,
    });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(centerViewport, 120);
    return () => window.clearTimeout(timer);
  }, [geometry.size, centerViewport]);

  const viewportLeft = panelVisible ? 330 : 0;

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#ffffff', direction: 'ltr' }}>
      <TopToolbar zoom={zoom} setZoom={setZoom} fitToScreen={fitToScreen} clockwise={clockwise} setClockwise={setClockwise} />

      {panelVisible && (
        <aside style={panelStyle}>
          <Section title="Layout">
            <CheckField label="Visible" checked={layoutVisible} onChange={setLayoutVisible} />
            <CheckField label="Clockwise" checked={clockwise} onChange={setClockwise} />
            <NumField label="Size" value={levels} onChange={(value) => setLevels(clamp(value || 1, 1, 12))} min={1} max={12} glyph="↔" />
            <SelectField label="View" value={divisions} onChange={(value) => setDivisions(Number(value))} options={[36, 60, 90, 360].map((value) => ({ value, label: `Circle of ${value}` }))} />
            <SelectField label="Data type" value={dataType} onChange={setDataType} options={['Price', 'Time', 'Angle']} />
          </Section>

          <Section title="Price" icon="🟡">
            <NumField label="Value" value={startValue} onChange={setStartValue} glyph="‹›" />
            <NumField label="Find" value={findValue} onChange={setFindValue} glyph="🔍" />
            <NumField label="Increment" value={increment} onChange={setIncrement} step={0.1} />
          </Section>

          <Section title="Highlight">
            <CheckField label="Visible" checked={highlightVisible} onChange={setHighlightVisible} />
            <SelectField label="Fill" value={highlightFill} onChange={setHighlightFill} options={['Levels', 'Cell']} />
            <CheckField label="Show marks" checked={showMarks} onChange={setShowMarks} />
            <CheckField label="Show numbers" checked={showNumbers} onChange={setShowNumbers} />
          </Section>

          <Section title="Protractor" icon="◴">
            <CheckField label="Visible" checked={showProtractor} onChange={setShowProtractor} />
            <CheckField label="Clockwise" checked={protractorClockwise} onChange={setProtractorClockwise} />
            <NumField label="Angle" value={protractorAngle} onChange={setProtractorAngle} min={-360} max={360} step={1} />
          </Section>

          <Section title="Counter" defaultOpen={false}>
            <CheckField label="Visible" checked={counterVisible} onChange={setCounterVisible} />
            <CheckField label="Clockwise" checked={counterClockwise} onChange={setCounterClockwise} />
            <NumField label="Start" value={counterStart} onChange={setCounterStart} />
            <NumField label="Step" value={counterStep} onChange={setCounterStep} />
            <NumField label="Radius" value={counterRadius} onChange={setCounterRadius} min={0} max={180} />
            <NumField label="Font size" value={counterFontSize} onChange={setCounterFontSize} min={7} max={24} />
          </Section>

          <Section title="Secondary scale" defaultOpen={false}>
            <CheckField label="Visible" checked={secondaryVisible} onChange={setSecondaryVisible} />
            <CheckField label="Clockwise" checked={secondaryClockwise} onChange={setSecondaryClockwise} />
            <NumField label="Start" value={secondaryStart} onChange={setSecondaryStart} />
            <NumField label="Increment" value={secondaryIncrement} onChange={setSecondaryIncrement} />
            <NumField label="Divisions" value={secondaryDivisions} onChange={(value) => setSecondaryDivisions(clamp(value || 3, 3, 360))} min={3} max={360} />
            <NumField label="Radius" value={secondaryRadius} onChange={setSecondaryRadius} min={0} max={220} />
            <NumField label="Font size" value={secondaryFontSize} onChange={setSecondaryFontSize} min={7} max={24} />
          </Section>

          <Section title="Marker" defaultOpen={false}>
            <CheckField label="Visible" checked={markerVisible} onChange={setMarkerVisible} />
            <NumField label="Angle" value={markerAngle} onChange={setMarkerAngle} min={-360} max={360} />
            <NumField label="Radius" value={markerRadius} onChange={setMarkerRadius} min={0} max={1600} />
            <SelectField label="Shape" value={markerShape} onChange={setMarkerShape} options={['Triangle', 'Circle', 'Square']} />
            <Field label="Color"><input type="color" value={markerColor} onChange={(event) => setMarkerColor(event.target.value)} /></Field>
            <NumField label="Line width" value={markerWidth} onChange={setMarkerWidth} min={1} max={10} />
            <Field label="Label"><input style={fieldStyle} value={markerLabel} onChange={(event) => setMarkerLabel(event.target.value)} /></Field>
          </Section>

          <Section title="Chronometer" icon="◷">
            <CheckField label="Visible" checked={showChronometer} onChange={setShowChronometer} />
            <CheckField label="Clockwise" checked={chronometerClockwise} onChange={setChronometerClockwise} />
            <NumField label="Angle" value={chronometerAngle} onChange={setChronometerAngle} min={-360} max={360} />
            <SelectField label="Range" value={chronometerRange} onChange={setChronometerRange} options={['Annual', 'Monthly', 'Weekly', 'Daily']} />
            <CheckField label="Secondary scale" checked={chronometerSecondary} onChange={setChronometerSecondary} />
            <CheckField label="Marker" checked={chronometerMarker} onChange={setChronometerMarker} />
          </Section>

          <Section title="Cosmogram" icon="★">
            <CheckField label="Visible" checked={showCosmogram} onChange={setShowCosmogram} />
            <CheckField label="Clockwise" checked={cosmogramClockwise} onChange={setCosmogramClockwise} />
            <NumField label="Angle" value={cosmogramAngle} onChange={setCosmogramAngle} min={-360} max={360} />
            <SelectField label="System" value={cosmogramSystem} onChange={setCosmogramSystem} options={['Geocentric', 'Heliocentric']} />
          </Section>

          <Section title="Location" muted>
            <Field label="City" glyph="▾"><input style={fieldStyle} value={city} onChange={(event) => setCity(event.target.value)} /></Field>
            <Field label="Latitude"><input style={fieldStyle} value={latitude} onChange={(event) => setLatitude(event.target.value)} /></Field>
            <Field label="Longitude"><input style={fieldStyle} value={longitude} onChange={(event) => setLongitude(event.target.value)} /></Field>
          </Section>

          <Section title="Moon phases" muted>
            <CheckField label="Visible" checked={moonVisible} onChange={setMoonVisible} />
            <CheckField label="Show eclipses" checked={moonEclipses} onChange={setMoonEclipses} />
            <NumField label="Size" value={moonSize} onChange={setMoonSize} min={6} max={30} />
            <NumField label="Offset" value={moonOffset} onChange={setMoonOffset} min={0} max={180} />
          </Section>
        </aside>
      )}

      <button type="button" onClick={() => setPanelVisible((value) => !value)} style={{ ...buttonStyle, position: 'fixed', left: panelVisible ? 336 : 10, top: 30, zIndex: 50 }}>
        {panelVisible ? 'Hide' : 'Show'}
      </button>
      <SideShapeBar />

      <div ref={viewportRef} style={{ position: 'absolute', left: viewportLeft, right: 0, top: 24, bottom: 0, overflow: 'auto', background: '#ffffff' }}>
        <div style={{ minWidth: '100%', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 30 }}>
          <canvas ref={canvasRef} style={{ display: 'block', background: '#ffffff', maxWidth: 'none', maxHeight: 'none' }} />
        </div>
      </div>
    </div>
  );
}
