import React, { useEffect, useMemo, useRef, useState } from 'react';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const TWO_PI = Math.PI * 2;

function getSearchParams() {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

function polar(cx, cy, radius, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function wedge(ctx, cx, cy, innerR, outerR, startDeg, endDeg) {
  const start = ((startDeg - 90) * Math.PI) / 180;
  const end = ((endDeg - 90) * Math.PI) / 180;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, start, end, false);
  ctx.arc(cx, cy, innerR, end, start, true);
  ctx.closePath();
}

function normalizeRotation(angle) {
  let rot = ((angle - 90) * Math.PI) / 180;
  while (rot > Math.PI) rot -= TWO_PI;
  while (rot < -Math.PI) rot += TWO_PI;
  if (rot > Math.PI / 2) rot -= Math.PI;
  if (rot < -Math.PI / 2) rot += Math.PI;
  return rot;
}

function numberAtRing(startValue, ringIndex, sectorIndex, divisions, increment) {
  return startValue + ((ringIndex - 1) * divisions + sectorIndex) * increment;
}

function formatNumber(value) {
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(4)));
}

function drawRotatedText(ctx, text, x, y, angleDeg, fontSize, color = '#111') {
  ctx.save();
  ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5);
  ctx.rotate(normalizeRotation(angleDeg));
  ctx.font = `700 ${fontSize}px Segoe UI, Arial, Helvetica, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(text), 0, 0);
  ctx.restore();
}

function fontSizeForCell(midR, ringWidth, divisions, textLength, compactMode) {
  const arcRoom = (TWO_PI * midR / divisions) * (compactMode ? 0.66 : 0.62);
  const radialRoom = ringWidth * (compactMode ? 0.82 : 0.72);
  const charFactor = textLength >= 6 ? 0.68 : textLength === 5 ? 0.63 : textLength === 4 ? 0.58 : 0.54;
  const byArc = arcRoom / Math.max(2, textLength * charFactor);
  const byRadial = radialRoom / Math.max(2, textLength * 0.55);
  return clamp(Math.min(byArc, byRadial), compactMode ? 9 : 12, compactMode ? 18 : 28);
}

const buttonStyle = {
  border: '1px solid #9b9b9b',
  background: '#f7f7f7',
  color: '#222',
  borderRadius: 2,
  padding: '2px 7px',
  fontSize: 12,
  cursor: 'pointer',
  height: 22,
  lineHeight: '16px'
};

const panelStyle = {
  position: 'fixed',
  top: 24,
  left: 0,
  width: 330,
  height: 'calc(100vh - 24px)',
  overflow: 'auto',
  background: '#f2f2f2',
  borderRight: '1px solid #b8b8b8',
  color: '#222',
  zIndex: 20,
  fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
  fontSize: 12,
  direction: 'ltr'
};

const rowStyle = {
  display: 'grid',
  gridTemplateColumns: '148px 1fr 18px',
  alignItems: 'center',
  minHeight: 23,
  borderBottom: '1px solid #d6d6d6',
  background: '#f3f3f3'
};

const labelStyle = { padding: '2px 6px', color: '#333', fontWeight: 500 };
const fieldStyle = { width: '100%', height: 20, border: '1px solid #aaa', background: '#fff', color: '#111', fontSize: 12 };

const toolbarIconStyle = {
  width: 22,
  height: 21,
  border: '1px solid #b8b8b8',
  borderRadius: 2,
  background: '#f7f7f7',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#1c75bc',
  fontSize: 13,
  fontWeight: 700,
  marginRight: 2,
  cursor: 'pointer'
};

function SelectArrow() {
  return <span style={{ color: '#555', textAlign: 'center' }}>▾</span>;
}

function Section({ title, children, defaultOpen = true, muted = false, icon = '▾' }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid #c8c8c8' }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: muted ? '#eeeeee' : '#ececdd',
          color: muted ? '#777' : '#1d1d1d',
          fontWeight: 800,
          padding: '2px 4px',
          borderTop: '1px solid #d3d3c7',
          cursor: 'pointer',
          userSelect: 'none'
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

function Field({ label, children, disabled = false, glyph = '' }) {
  return (
    <div style={{ ...rowStyle, opacity: disabled ? 0.48 : 1 }}>
      <div style={labelStyle}>{label}</div>
      <div style={{ padding: '1px 5px' }}>{children}</div>
      <div style={{ color: '#777', textAlign: 'center', fontSize: 12 }}>{glyph}</div>
    </div>
  );
}

function CheckField({ label, checked, onChange, disabled = false, glyph = '' }) {
  return (
    <Field label={label} disabled={disabled} glyph={glyph}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange?.(e.target.checked)} />
    </Field>
  );
}

function TopToolbar({ zoom, setZoom, fitToScreen, proSmallView, clockwise, setClockwise, tool, setTool }) {
  const icons = [
    ['cursor', '↖'], ['line', '—'], ['square', '▢'], ['text', 'T'], ['lock', '🔒'], ['zoom', '⌕'], ['fit', '⛶']
  ];
  return (
    <div style={{ position: 'fixed', left: 0, top: 0, right: 0, height: 24, background: '#efefef', borderBottom: '1px solid #bdbdbd', zIndex: 50, display: 'flex', alignItems: 'center', direction: 'ltr', fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: 12, color: '#222' }}>
      <div style={{ width: 330, display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 5, borderRight: '1px solid #c9c9c9', height: '100%' }}>
        <span style={{ fontWeight: 700 }}>Gannzilla Pro</span>
        <span style={{ marginLeft: 'auto', color: '#333' }}>Default</span>
        <button style={{ ...buttonStyle, height: 19, padding: '0 4px', color: '#13a332', fontWeight: 800 }}>＋ Add</button>
        <button style={{ ...buttonStyle, height: 19, padding: '0 5px', color: '#c82020', fontWeight: 800 }}>−</button>
        <button style={{ ...buttonStyle, height: 19, padding: '0 5px' }}>✎</button>
        <button style={{ ...buttonStyle, height: 19, padding: '0 5px' }}>▣</button>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>
        {icons.map(([key, label]) => (
          <button key={key} onClick={() => key === 'fit' ? fitToScreen() : setTool(key)} style={{ ...toolbarIconStyle, background: tool === key ? '#dceeff' : '#f7f7f7' }}>{label}</button>
        ))}
        <button onClick={() => setZoom((z) => clamp(z - 0.05, 0.06, 2))} style={toolbarIconStyle}>−</button>
        <span style={{ minWidth: 38, textAlign: 'center', fontWeight: 700 }}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom((z) => clamp(z + 0.05, 0.06, 2))} style={toolbarIconStyle}>＋</button>
        <button onClick={proSmallView} style={{ ...buttonStyle, marginLeft: 5 }}>Pro Small</button>
        <button onClick={() => setClockwise((v) => !v)} style={{ ...buttonStyle, marginLeft: 5 }}>{clockwise ? 'Clockwise' : 'Counter'}</button>
        <span style={{ marginLeft: 8 }}>🇬🇧 English</span>
        <span style={{ marginLeft: 8, color: '#235ba8', fontWeight: 800 }}>ⓘ</span>
      </div>
    </div>
  );
}

function SideShapeBar() {
  const shapes = ['◁', '□', '⬠', '⬡', '⬟', '◯', '△', '◢', '◎'];
  return (
    <div style={{ position: 'fixed', right: 18, top: 168, zIndex: 12, background: 'rgba(255,255,255,0.78)', border: '1px solid #e2e2e2', borderRadius: 18, padding: 7, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {shapes.map((s, i) => <button key={i} style={{ width: 28, height: 28, border: '1px solid #d2d2d2', borderRadius: i === shapes.length - 1 ? '50%' : 3, background: '#fafafa', color: '#9aa', fontSize: 18 }}>{s}</button>)}
    </div>
  );
}

export default function GannzillaProWheelExact() {
  const params = getSearchParams();
  const initialProUi = params.get('proUI') === 'true' || params.get('ui') === 'pro';
  const initialCompactMode = initialProUi || params.get('compact') === 'true' || params.get('view') === 'compact' || params.get('proSmall') === 'true';
  const canvasRef = useRef(null);
  const viewportRef = useRef(null);

  const [compactMode, setCompactMode] = useState(initialCompactMode);
  const [visiblePanel, setVisiblePanel] = useState(initialProUi ? true : !initialCompactMode);
  const [levels, setLevels] = useState(5);
  const [divisions, setDivisions] = useState(36);
  const [startValue, setStartValue] = useState(1);
  const [findValue, setFindValue] = useState(1);
  const [increment, setIncrement] = useState(1);
  const [clockwise, setClockwise] = useState(true);
  const [layoutVisible, setLayoutVisible] = useState(true);
  const [showMarks, setShowMarks] = useState(true);
  const [showNumbers, setShowNumbers] = useState(true);
  const [showProtractor, setShowProtractor] = useState(true);
  const [showChronometer, setShowChronometer] = useState(true);
  const [showCosmogram, setShowCosmogram] = useState(false);
  const [highlightVisible, setHighlightVisible] = useState(false);
  const [highlightFill, setHighlightFill] = useState('Levels');
  const [zoom, setZoom] = useState(initialCompactMode ? 0.48 : 0.9);
  const [angle, setAngle] = useState(90);
  const [chronoAngle, setChronoAngle] = useState(30);
  const [tool, setTool] = useState('cursor');

  const geometry = useMemo(() => {
    const innerRadius = compactMode ? 92 : 170;
    const ringWidth = compactMode ? 48 : 88;
    const protractorGap = compactMode ? 11 : 18;
    const protractorWidth = compactMode ? 24 : 34;
    const chronoGap = compactMode ? 11 : 16;
    const chronoWidth = compactMode ? 32 : 46;
    const wheelRadius = innerRadius + levels * ringWidth;
    const outerRadius = wheelRadius + protractorGap + (showProtractor ? protractorWidth : 0) + chronoGap + (showChronometer ? chronoWidth : 0) + (compactMode ? 44 : 72);
    const size = Math.ceil(outerRadius * 2 + (compactMode ? 42 : 60));
    return { innerRadius, ringWidth, wheelRadius, protractorGap, protractorWidth, chronoGap, chronoWidth, outerRadius, size };
  }, [levels, showProtractor, showChronometer, compactMode]);

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const cssSize = geometry.size * zoom;
    canvas.style.width = `${cssSize}px`;
    canvas.style.height = `${cssSize}px`;
    canvas.width = Math.ceil(geometry.size * dpr);
    canvas.height = Math.ceil(geometry.size * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.clearRect(0, 0, geometry.size, geometry.size);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, geometry.size, geometry.size);

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
    ctx.strokeStyle = '#d4d4d4';
    ctx.lineWidth = compactMode ? 0.8 : 1;
    ctx.stroke();
    ctx.restore();

    for (let ring = 1; ring <= levels; ring += 1) {
      const inner = geometry.innerRadius + (ring - 1) * geometry.ringWidth;
      const outer = inner + geometry.ringWidth;
      const mid = (inner + outer) / 2;
      const bandFill = ring % 2 === 0 ? '#e9e9e9' : '#ffffff';

      for (let i = 0; i < divisions; i += 1) {
        const startDeg = direction * i * sector;
        const endDeg = direction * (i + 1) * sector;
        const centerDeg = direction * (i + 0.5) * sector;
        const value = numberAtRing(startValue, ring, i, divisions, increment);
        const text = formatNumber(value);

        ctx.save();
        wedge(ctx, cx, cy, inner, outer, startDeg, endDeg);
        ctx.fillStyle = bandFill;
        ctx.fill();
        ctx.strokeStyle = '#d2d2d2';
        ctx.lineWidth = compactMode ? 0.82 : 1;
        ctx.stroke();
        ctx.restore();

        if (showNumbers) {
          const p = polar(cx, cy, mid, centerDeg);
          const fs = fontSizeForCell(mid, geometry.ringWidth, divisions, text.length, compactMode);
          drawRotatedText(ctx, text, p.x, p.y, centerDeg, fs, '#111');
        }
      }
    }

    if (highlightVisible) {
      const hiIndex = Math.max(0, Math.min(divisions - 1, Number(findValue) % divisions));
      const inner = geometry.innerRadius;
      const outer = inner + geometry.ringWidth;
      ctx.save();
      wedge(ctx, cx, cy, inner, outer, direction * hiIndex * sector, direction * (hiIndex + 1) * sector);
      ctx.fillStyle = highlightFill === 'Levels' ? 'rgba(239, 74, 74, 0.35)' : 'rgba(86, 170, 255, 0.25)';
      ctx.fill();
      ctx.restore();
    }

    if (showProtractor) {
      const inner = geometry.wheelRadius + geometry.protractorGap;
      const outer = inner + geometry.protractorWidth;
      ctx.save();
      ctx.strokeStyle = '#c7c7c7';
      ctx.lineWidth = compactMode ? 0.9 : 1;
      ctx.beginPath();
      ctx.arc(cx, cy, inner, 0, TWO_PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, outer, 0, TWO_PI);
      ctx.stroke();
      for (let deg = 0; deg < 360; deg += 5) {
        const major = deg % 30 === 0;
        const p1 = polar(cx, cy, major ? inner - 2 : inner, direction * deg);
        const p2 = polar(cx, cy, outer + (major ? 5 : 0), direction * deg);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = major ? '#dd4040' : '#b8b8b8';
        ctx.lineWidth = major ? 1.2 : 0.8;
        ctx.stroke();
        if (major && showMarks) {
          const pt = polar(cx, cy, outer + (compactMode ? 14 : 22), direction * deg);
          drawRotatedText(ctx, `${deg}°`, pt.x, pt.y, direction * deg, compactMode ? 8.5 : 14, '#666');
        }
      }
      ctx.restore();
    }

    if (showChronometer) {
      const r = geometry.wheelRadius + geometry.protractorGap + geometry.protractorWidth + geometry.chronoGap;
      ctx.save();
      ctx.strokeStyle = '#b7cfc1';
      ctx.lineWidth = compactMode ? 1.2 : 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TWO_PI);
      ctx.stroke();
      const labels = ['21 MAR', '5 APR', '21 APR', '6 MAY', '21 MAY', '6 JUN', '21 JUN', '6 JUL', '22 JUL', '6 AUG', '22 AUG', '6 SEP', '22 SEP', '7 OCT', '22 OCT', '6 NOV', '21 NOV', '6 DEC', '21 DEC', '5 JAN', '20 JAN', '4 FEB', '19 FEB', '6 MAR'];
      labels.forEach((label, idx) => {
        const deg = direction * (idx * 360 / labels.length);
        const p = polar(cx, cy, r + (compactMode ? 17 : 28), deg);
        drawRotatedText(ctx, label, p.x, p.y, deg, compactMode ? 7.8 : 13, '#777');
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

    ctx.save();
    const pointerDeg = clockwise ? angle : -angle;
    const pp = polar(cx, cy, geometry.wheelRadius + (compactMode ? 43 : 80), pointerDeg);
    ctx.translate(pp.x, pp.y);
    ctx.rotate(((pointerDeg - 90) * Math.PI) / 180);
    ctx.fillStyle = '#e93020';
    ctx.beginPath();
    ctx.moveTo(0, compactMode ? -7 : -10);
    ctx.lineTo(compactMode ? 6 : 8, compactMode ? 8 : 10);
    ctx.lineTo(compactMode ? -6 : -8, compactMode ? 8 : 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  useEffect(() => {
    render();
  }, [geometry, zoom, levels, divisions, startValue, findValue, increment, clockwise, showMarks, showNumbers, showProtractor, showChronometer, showCosmogram, highlightVisible, highlightFill, angle, chronoAngle, compactMode, layoutVisible]);

  const centerViewport = () => {
    const vp = viewportRef.current;
    const canvas = canvasRef.current;
    if (!vp || !canvas) return;
    requestAnimationFrame(() => {
      vp.scrollLeft = Math.max(0, (canvas.offsetWidth - vp.clientWidth) / 2);
      vp.scrollTop = Math.max(0, (canvas.offsetHeight - vp.clientHeight) / 2);
    });
  };

  const fitToScreen = () => {
    const vp = viewportRef.current;
    if (!vp) return;
    const fit = Math.min((vp.clientWidth - 120) / geometry.size, (vp.clientHeight - 120) / geometry.size);
    const next = compactMode ? Math.min(fit, 0.52) : fit;
    setZoom(clamp(next, 0.06, 2));
    centerViewport();
  };

  const proSmallView = () => {
    setCompactMode(true);
    setVisiblePanel(true);
    setShowChronometer(true);
    setShowProtractor(true);
    setShowMarks(true);
    setShowNumbers(true);
    setZoom(0.48);
    centerViewport();
  };

  useEffect(() => {
    const id = setTimeout(() => {
      if (initialCompactMode) proSmallView();
      else fitToScreen();
    }, 120);
    return () => clearTimeout(id);
  }, [geometry.size]);

  const viewportLeft = visiblePanel ? 330 : 0;

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#ffffff', overflow: 'hidden', direction: 'ltr' }}>
      <TopToolbar zoom={zoom} setZoom={setZoom} fitToScreen={fitToScreen} proSmallView={proSmallView} clockwise={clockwise} setClockwise={setClockwise} tool={tool} setTool={setTool} />

      {visiblePanel && (
        <aside style={panelStyle}>
          <Section title="Layout" icon="▦">
            <CheckField label="Visible" checked={layoutVisible} onChange={setLayoutVisible} />
            <CheckField label="Clockwise" checked={clockwise} onChange={setClockwise} />
            <Field label="Size" glyph="↔"><input style={fieldStyle} type="number" min="1" max="12" value={levels} onChange={(e) => setLevels(clamp(Number(e.target.value) || 1, 1, 12))} /></Field>
            <Field label="View" glyph={<SelectArrow />}><select style={fieldStyle} value={divisions} onChange={(e) => setDivisions(Number(e.target.value))}><option value={36}>Circle of 36</option><option value={60}>Circle of 60</option><option value={90}>Circle of 90</option><option value={360}>Circle of 360</option></select></Field>
            <Field label="Data type" glyph={<SelectArrow />}><select style={fieldStyle}><option>Price</option><option>Time</option></select></Field>
          </Section>

          <Section title="Price" icon="🟡">
            <Field label="Value" glyph="‹›"><input style={fieldStyle} type="number" value={startValue} onChange={(e) => setStartValue(Number(e.target.value) || 0)} /></Field>
            <Field label="Find" glyph="🔍"><input style={fieldStyle} type="number" value={findValue} onChange={(e) => setFindValue(Number(e.target.value) || 0)} /></Field>
            <Field label="Increment"><input style={fieldStyle} type="number" value={increment} onChange={(e) => setIncrement(Number(e.target.value) || 1)} /></Field>
          </Section>

          <Section title="Highlight" icon="▦">
            <CheckField label="Visible" checked={highlightVisible} onChange={setHighlightVisible} />
            <Field label="Fill" glyph={<SelectArrow />}><select style={fieldStyle} value={highlightFill} onChange={(e) => setHighlightFill(e.target.value)}><option>Levels</option><option>Cell</option></select></Field>
            <CheckField label="Show marks" checked={showMarks} onChange={setShowMarks} />
            <CheckField label="Show numbers" checked={showNumbers} onChange={setShowNumbers} />
          </Section>

          <Section title="Protractor" icon="◴">
            <CheckField label="Visible" checked={showProtractor} onChange={setShowProtractor} />
            <CheckField label="Clockwise" checked={clockwise} onChange={setClockwise} />
            <Field label="Angle"><input style={fieldStyle} type="number" value={angle} onChange={(e) => setAngle(Number(e.target.value) || 0)} /></Field>
          </Section>

          <Section title="Counter" defaultOpen={false} muted icon="▣"><Field label="Visible" disabled><input type="checkbox" disabled /></Field></Section>
          <Section title="Secondary scale" defaultOpen={false} muted icon="⚙"><Field label="Visible" disabled><input type="checkbox" disabled /></Field></Section>
          <Section title="Marker" defaultOpen={false} muted icon="◇"><Field label="Visible" disabled><input type="checkbox" disabled /></Field></Section>

          <Section title="Chronometer" icon="◷">
            <CheckField label="Visible" checked={showChronometer} onChange={setShowChronometer} />
            <CheckField label="Clockwise" checked={clockwise} onChange={setClockwise} />
            <Field label="Angle"><input style={fieldStyle} type="number" value={chronoAngle} onChange={(e) => setChronoAngle(Number(e.target.value) || 0)} /></Field>
            <Field label="Range" glyph={<SelectArrow />}><select style={fieldStyle}><option>Annual</option><option>Monthly</option><option>Weekly</option><option>Daily</option></select></Field>
          </Section>

          <Section title="Secondary scale" defaultOpen={false} muted icon="⚙"><Field label="Visible" disabled><input type="checkbox" disabled /></Field></Section>
          <Section title="Marker" defaultOpen={false} muted icon="◇"><Field label="Visible" disabled><input type="checkbox" disabled /></Field></Section>

          <Section title="Cosmogram" icon="★">
            <CheckField label="Visible" checked={showCosmogram} onChange={setShowCosmogram} />
            <CheckField label="Clockwise" checked={clockwise} onChange={setClockwise} />
            <Field label="Angle"><input style={fieldStyle} type="number" defaultValue={0} /></Field>
            <Field label="System" glyph={<SelectArrow />}><select style={fieldStyle}><option>Geocentric</option><option>Heliocentric</option></select></Field>
          </Section>

          <Section title="Location" defaultOpen={true} muted icon="▣">
            <Field label="City" glyph={<SelectArrow />}><input style={fieldStyle} defaultValue="New York" /></Field>
            <Field label="Latitude"><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}><input style={fieldStyle} defaultValue="40°" /><input style={fieldStyle} defaultValue="43′" /><select style={fieldStyle}><option>North</option><option>South</option></select></div></Field>
            <Field label="Longitude"><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}><input style={fieldStyle} defaultValue="74°" /><input style={fieldStyle} defaultValue="1′" /><select style={fieldStyle}><option>West</option><option>East</option></select></div></Field>
          </Section>

          <Section title="Moon phases" defaultOpen={true} muted icon="○">
            <CheckField label="Visible" checked={false} disabled />
            <CheckField label="Show eclipses" checked={false} disabled />
            <Field label="Date" disabled><input style={fieldStyle} defaultValue="31.12.2019" disabled /></Field>
          </Section>
        </aside>
      )}

      <button onClick={() => setVisiblePanel((v) => !v)} style={{ ...buttonStyle, position: 'fixed', left: visiblePanel ? 336 : 10, top: 30, zIndex: 40 }}>
        {visiblePanel ? 'Hide' : 'Show'}
      </button>

      <SideShapeBar />

      <div ref={viewportRef} style={{ position: 'absolute', inset: '24px 0 0 0', left: viewportLeft, overflow: 'auto', background: '#ffffff' }}>
        <div style={{ minWidth: '100%', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: compactMode ? 22 : 30 }}>
          <canvas ref={canvasRef} style={{ display: 'block', background: '#fff' }} />
        </div>
      </div>
    </div>
  );
}
