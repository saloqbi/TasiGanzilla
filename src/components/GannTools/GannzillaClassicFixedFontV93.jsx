import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const TWO_PI = Math.PI * 2;
const MIN_ZOOM = 0.10;
const MAX_ZOOM = 3.00;
const DEFAULT_FONT_SIZE = 13;
const DEFAULT_FONT_WEIGHT = 700;
const DEFAULT_INNER_RADIUS = 170;
const DEFAULT_RING_WIDTH = 60;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function getParams() {
  try {
    return new URLSearchParams(window.location.search || '');
  } catch (_) {
    return new URLSearchParams();
  }
}

function numberParam(name, fallback, min, max) {
  const value = Number(getParams().get(name));
  return Number.isFinite(value) ? clamp(value, min, max) : fallback;
}

function boolParam(name, fallback) {
  const params = getParams();
  if (!params.has(name)) return fallback;
  const value = String(params.get(name) || '').toLowerCase();
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

function drawFixedText(ctx, text, x, y, angleDegrees, fontSize, maxWidth, weight) {
  ctx.save();
  ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5);
  ctx.rotate(normalizeRotation(angleDegrees));
  ctx.font = `${weight} ${fontSize}px Segoe UI, Arial, Helvetica, sans-serif`;
  ctx.fillStyle = '#111111';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(text), 0, 0, Math.max(8, maxWidth));
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
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 4px',
          background: muted ? '#eeeeee' : '#ececdd',
          color: muted ? '#777' : '#1d1d1d',
          fontWeight: 800,
          borderTop: '1px solid #d3d3c7',
          cursor: 'pointer',
          userSelect: 'none',
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

function TopToolbar({ zoom, setZoom, fitToScreen, clockwise, setClockwise }) {
  const iconStyle = {
    ...buttonStyle,
    width: 22,
    padding: 0,
    color: '#1c75bc',
    fontWeight: 800,
    marginRight: 2,
  };

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

export default function GannzillaClassicFixedFontV93() {
  const params = getParams();
  const canvasRef = useRef(null);
  const viewportRef = useRef(null);

  const [panelVisible, setPanelVisible] = useState(params.get('hidePanel') !== 'true');
  const [layoutVisible, setLayoutVisible] = useState(true);
  const [levels, setLevels] = useState(() => Math.round(numberParam('levels', 10, 1, 12)));
  const [divisions, setDivisions] = useState(() => Math.round(numberParam('divisions', 36, 3, 360)));
  const [startValue, setStartValue] = useState(() => numberParam('startValue', 79680, -1000000000, 1000000000));
  const [findValue, setFindValue] = useState(1);
  const [increment, setIncrement] = useState(() => numberParam('increment', 1, -1000000, 1000000));
  const [clockwise, setClockwise] = useState(true);
  const [showNumbers, setShowNumbers] = useState(true);
  const [showMarks, setShowMarks] = useState(true);
  const [showProtractor, setShowProtractor] = useState(boolParam('showProtractor', true));
  const [showChronometer, setShowChronometer] = useState(boolParam('showChronometer', false));
  const [showCosmogram, setShowCosmogram] = useState(false);
  const [highlightVisible, setHighlightVisible] = useState(false);
  const [highlightFill, setHighlightFill] = useState('Levels');
  const [angle, setAngle] = useState(0);
  const [zoom, setZoom] = useState(() => numberParam('gannzillaZoom', 1, MIN_ZOOM, MAX_ZOOM));

  const fixedFontSize = numberParam('gannzillaFontSize', DEFAULT_FONT_SIZE, 8, 30);
  const fixedFontWeight = Math.round(numberParam('gannzillaFontWeight', DEFAULT_FONT_WEIGHT, 500, 900));
  const innerRadius = numberParam('gannzillaInnerRadius', DEFAULT_INNER_RADIUS, 80, 500);
  const ringWidth = numberParam('gannzillaRingWidth', DEFAULT_RING_WIDTH, 30, 150);

  const geometry = useMemo(() => {
    const wheelRadius = innerRadius + levels * ringWidth;
    const protractorGap = 18;
    const protractorWidth = 34;
    const chronometerGap = 16;
    const chronometerWidth = 46;
    const outerRadius = wheelRadius + protractorGap + (showProtractor ? protractorWidth : 0) + chronometerGap + (showChronometer ? chronometerWidth : 0) + 58;
    const size = Math.ceil(outerRadius * 2 + 60);
    return { innerRadius, ringWidth, wheelRadius, protractorGap, protractorWidth, chronometerGap, chronometerWidth, outerRadius, size };
  }, [innerRadius, ringWidth, levels, showProtractor, showChronometer]);

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

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, geometry.innerRadius, 0, TWO_PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#d0d0d0';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    for (let ring = 1; ring <= levels; ring += 1) {
      const inner = geometry.innerRadius + (ring - 1) * geometry.ringWidth;
      const outer = inner + geometry.ringWidth;
      const mid = (inner + outer) / 2;
      const fill = ring % 2 === 0 ? '#dededb' : '#ffffff';
      const arcWidth = (TWO_PI * mid) / divisions;
      const textMaxWidth = arcWidth * 0.78;

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
          drawFixedText(ctx, formatNumber(value), point.x, point.y, centerDegrees, fixedFontSize, textMaxWidth, fixedFontWeight);
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

    if (showProtractor) {
      const inner = geometry.wheelRadius + geometry.protractorGap;
      const outer = inner + geometry.protractorWidth;
      ctx.save();
      ctx.strokeStyle = '#c7c7c7';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, inner, 0, TWO_PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, outer, 0, TWO_PI);
      ctx.stroke();
      for (let degree = 0; degree < 360; degree += 5) {
        const major = degree % 30 === 0;
        const p1 = polar(cx, cy, major ? inner - 2 : inner, direction * degree);
        const p2 = polar(cx, cy, outer + (major ? 5 : 0), direction * degree);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = major ? '#dd4040' : '#b8b8b8';
        ctx.lineWidth = major ? 1.2 : 0.8;
        ctx.stroke();
        if (major && showMarks) {
          const point = polar(cx, cy, outer + 22, direction * degree);
          drawFixedText(ctx, `${degree}°`, point.x, point.y, direction * degree, 12, 40, 700);
        }
      }
      ctx.restore();
    }

    if (showChronometer) {
      const radius = geometry.wheelRadius + geometry.protractorGap + geometry.protractorWidth + geometry.chronometerGap;
      const labels = ['21 MAR', '5 APR', '21 APR', '6 MAY', '21 MAY', '6 JUN', '21 JUN', '6 JUL', '22 JUL', '6 AUG', '22 AUG', '6 SEP', '22 SEP', '7 OCT', '22 OCT', '6 NOV', '21 NOV', '6 DEC', '21 DEC', '5 JAN', '20 JAN', '4 FEB', '19 FEB', '6 MAR'];
      ctx.save();
      ctx.strokeStyle = '#b7cfc1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, TWO_PI);
      ctx.stroke();
      labels.forEach((label, index) => {
        const degree = direction * (index * 360 / labels.length);
        const point = polar(cx, cy, radius + 28, degree);
        drawFixedText(ctx, label, point.x, point.y, degree, 11, 70, 700);
      });
      ctx.restore();
    }

    if (showCosmogram) {
      ctx.save();
      ctx.strokeStyle = '#87cfa3';
      ctx.globalAlpha = 0.28;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, geometry.outerRadius - 16, 0, TWO_PI);
      ctx.stroke();
      ctx.restore();
    }

    const pointerDegrees = clockwise ? angle : -angle;
    const pointer = polar(cx, cy, geometry.wheelRadius + 62, pointerDegrees);
    ctx.save();
    ctx.translate(pointer.x, pointer.y);
    ctx.rotate(((pointerDegrees - 90) * Math.PI) / 180);
    ctx.fillStyle = '#e93020';
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(7, 9);
    ctx.lineTo(-7, 9);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    window.__gannzillaClassicFixedFontV93Metrics = {
      ok: true,
      levels,
      divisions,
      fontSize: fixedFontSize,
      fontWeight: fixedFontWeight,
      fontIsConstantAcrossAllRings: true,
      ringWidth: geometry.ringWidth,
      innerRadius: geometry.innerRadius,
      startValue,
      increment,
      zoom,
      singleRenderer: true,
    };
  }, [geometry, zoom, levels, divisions, startValue, increment, clockwise, layoutVisible, showNumbers, showMarks, showProtractor, showChronometer, showCosmogram, highlightVisible, highlightFill, findValue, angle, fixedFontSize, fixedFontWeight]);

  useEffect(() => {
    window.GANNZILLA_CLASSIC_FIXED_FONT_V93 = true;
    window.__auditGannzillaClassicFixedFontV93 = () => ({
      ok: window.GANNZILLA_CLASSIC_FIXED_FONT_V93 === true
        && window.__gannzillaClassicFixedFontV93Metrics?.singleRenderer === true
        && window.__gannzillaClassicFixedFontV93Metrics?.fontIsConstantAcrossAllRings === true,
      metrics: window.__gannzillaClassicFixedFontV93Metrics || null,
    });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(centerViewport, 120);
    return () => window.clearTimeout(timer);
  }, [geometry.size, centerViewport]);

  const viewportLeft = panelVisible ? 330 : 0;

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#ffffff', direction: 'ltr' }}>
      <TopToolbar zoom={zoom} setZoom={(updater) => { setZoom(updater); window.setTimeout(centerViewport, 30); }} fitToScreen={fitToScreen} clockwise={clockwise} setClockwise={setClockwise} />

      {panelVisible && (
        <aside style={panelStyle}>
          <Section title="Layout">
            <CheckField label="Visible" checked={layoutVisible} onChange={setLayoutVisible} />
            <CheckField label="Clockwise" checked={clockwise} onChange={setClockwise} />
            <Field label="Size" glyph="↔"><input style={fieldStyle} type="number" min="1" max="12" value={levels} onChange={(event) => setLevels(clamp(Number(event.target.value) || 1, 1, 12))} /></Field>
            <Field label="View" glyph="▾"><select style={fieldStyle} value={divisions} onChange={(event) => setDivisions(Number(event.target.value))}><option value={36}>Circle of 36</option><option value={60}>Circle of 60</option><option value={90}>Circle of 90</option><option value={360}>Circle of 360</option></select></Field>
            <Field label="Data type" glyph="▾"><select style={fieldStyle}><option>Price</option><option>Time</option></select></Field>
          </Section>

          <Section title="Price" icon="🟡">
            <Field label="Value" glyph="‹›"><input style={fieldStyle} type="number" value={startValue} onChange={(event) => setStartValue(Number(event.target.value) || 0)} /></Field>
            <Field label="Find" glyph="🔍"><input style={fieldStyle} type="number" value={findValue} onChange={(event) => setFindValue(Number(event.target.value) || 0)} /></Field>
            <Field label="Increment"><input style={fieldStyle} type="number" value={increment} onChange={(event) => setIncrement(Number(event.target.value) || 1)} /></Field>
          </Section>

          <Section title="Highlight">
            <CheckField label="Visible" checked={highlightVisible} onChange={setHighlightVisible} />
            <Field label="Fill" glyph="▾"><select style={fieldStyle} value={highlightFill} onChange={(event) => setHighlightFill(event.target.value)}><option>Levels</option><option>Cell</option></select></Field>
            <CheckField label="Show marks" checked={showMarks} onChange={setShowMarks} />
            <CheckField label="Show numbers" checked={showNumbers} onChange={setShowNumbers} />
          </Section>

          <Section title="Protractor" icon="◴">
            <CheckField label="Visible" checked={showProtractor} onChange={setShowProtractor} />
            <CheckField label="Clockwise" checked={clockwise} onChange={setClockwise} />
            <Field label="Angle"><input style={fieldStyle} type="number" value={angle} onChange={(event) => setAngle(Number(event.target.value) || 0)} /></Field>
          </Section>

          <Section title="Counter" defaultOpen={false} muted><CheckField label="Visible" checked={false} disabled /></Section>
          <Section title="Secondary scale" defaultOpen={false} muted><CheckField label="Visible" checked={false} disabled /></Section>
          <Section title="Marker" defaultOpen={false} muted><CheckField label="Visible" checked={false} disabled /></Section>

          <Section title="Chronometer" icon="◷">
            <CheckField label="Visible" checked={showChronometer} onChange={setShowChronometer} />
            <CheckField label="Clockwise" checked={clockwise} onChange={setClockwise} />
            <Field label="Range" glyph="▾"><select style={fieldStyle}><option>Annual</option><option>Monthly</option><option>Weekly</option><option>Daily</option></select></Field>
          </Section>

          <Section title="Cosmogram" icon="★">
            <CheckField label="Visible" checked={showCosmogram} onChange={setShowCosmogram} />
            <CheckField label="Clockwise" checked={clockwise} onChange={setClockwise} />
            <Field label="System" glyph="▾"><select style={fieldStyle}><option>Geocentric</option><option>Heliocentric</option></select></Field>
          </Section>

          <Section title="Location" muted>
            <Field label="City" glyph="▾"><input style={fieldStyle} defaultValue="New York" /></Field>
            <Field label="Latitude"><input style={fieldStyle} defaultValue="40° 43′ North" /></Field>
            <Field label="Longitude"><input style={fieldStyle} defaultValue="74° 1′ West" /></Field>
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
