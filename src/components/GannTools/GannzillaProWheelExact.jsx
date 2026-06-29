import React, { useEffect, useMemo, useRef, useState } from 'react';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const TWO_PI = Math.PI * 2;

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

function fontSizeForCell(midR, ringWidth, divisions, textLength) {
  const arcRoom = (TWO_PI * midR / divisions) * 0.62;
  const radialRoom = ringWidth * 0.72;
  const charFactor = textLength >= 6 ? 0.68 : textLength === 5 ? 0.63 : textLength === 4 ? 0.58 : 0.54;
  const byArc = arcRoom / Math.max(2, textLength * charFactor);
  const byRadial = radialRoom / Math.max(2, textLength * 0.55);
  return clamp(Math.min(byArc, byRadial), 12, 28);
}

const panelStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: 330,
  height: '100vh',
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
  gridTemplateColumns: '140px 1fr',
  alignItems: 'center',
  minHeight: 22,
  borderBottom: '1px solid #d7d7d7'
};

const labelStyle = { padding: '2px 6px', color: '#333', fontWeight: 600 };
const fieldStyle = { width: '100%', height: 20, border: '1px solid #aaa', background: '#fff', color: '#111', fontSize: 12 };

function Section({ title, children }) {
  return (
    <div style={{ borderBottom: '1px solid #c9c9c9' }}>
      <div style={{ background: '#e7e7dd', color: '#1d1d1d', fontWeight: 800, padding: '3px 6px', borderTop: '1px solid #ccc' }}>
        ▾ {title}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={rowStyle}>
      <div style={labelStyle}>{label}</div>
      <div style={{ padding: '1px 6px' }}>{children}</div>
    </div>
  );
}

export default function GannzillaProWheelExact() {
  const canvasRef = useRef(null);
  const viewportRef = useRef(null);
  const [visiblePanel, setVisiblePanel] = useState(true);
  const [levels, setLevels] = useState(5);
  const [divisions, setDivisions] = useState(36);
  const [startValue, setStartValue] = useState(1);
  const [increment, setIncrement] = useState(1);
  const [clockwise, setClockwise] = useState(true);
  const [showMarks, setShowMarks] = useState(true);
  const [showNumbers, setShowNumbers] = useState(true);
  const [showProtractor, setShowProtractor] = useState(true);
  const [showChronometer, setShowChronometer] = useState(true);
  const [highlightVisible, setHighlightVisible] = useState(true);
  const [zoom, setZoom] = useState(0.9);
  const [angle, setAngle] = useState(90);
  const [chronoAngle, setChronoAngle] = useState(30);

  const geometry = useMemo(() => {
    const innerRadius = 170;
    const ringWidth = 88;
    const protractorGap = 18;
    const protractorWidth = 34;
    const chronoGap = 16;
    const chronoWidth = 46;
    const wheelRadius = innerRadius + levels * ringWidth;
    const outerRadius = wheelRadius + protractorGap + (showProtractor ? protractorWidth : 0) + chronoGap + (showChronometer ? chronoWidth : 0) + 72;
    const size = Math.ceil(outerRadius * 2 + 60);
    return { innerRadius, ringWidth, wheelRadius, protractorGap, protractorWidth, chronoGap, chronoWidth, outerRadius, size };
  }, [levels, showProtractor, showChronometer]);

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

    const cx = geometry.size / 2;
    const cy = geometry.size / 2;
    const sector = 360 / divisions;
    const direction = clockwise ? 1 : -1;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, geometry.innerRadius, 0, TWO_PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#cfcfcf';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    for (let ring = 1; ring <= levels; ring += 1) {
      const inner = geometry.innerRadius + (ring - 1) * geometry.ringWidth;
      const outer = inner + geometry.ringWidth;
      const mid = (inner + outer) / 2;
      const bandFill = ring % 2 === 0 ? '#e7e7e7' : '#ffffff';

      for (let i = 0; i < divisions; i += 1) {
        const startDeg = direction * i * sector;
        const endDeg = direction * (i + 1) * sector;
        const centerDeg = direction * (i + 0.5) * sector;
        const value = numberAtRing(startValue, ring, i, divisions, increment);
        const text = Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)));

        ctx.save();
        wedge(ctx, cx, cy, inner, outer, startDeg, endDeg);
        ctx.fillStyle = bandFill;
        ctx.fill();
        ctx.strokeStyle = '#d0d0d0';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        if (showNumbers) {
          const p = polar(cx, cy, mid, centerDeg);
          const fs = fontSizeForCell(mid, geometry.ringWidth, divisions, text.length);
          drawRotatedText(ctx, text, p.x, p.y, centerDeg, fs, '#111');
        }
      }
    }

    if (highlightVisible) {
      const hiIndex = Math.max(0, Math.min(divisions - 1, startValue % divisions));
      const inner = geometry.innerRadius;
      const outer = inner + geometry.ringWidth;
      ctx.save();
      wedge(ctx, cx, cy, inner, outer, direction * hiIndex * sector, direction * (hiIndex + 1) * sector);
      ctx.fillStyle = 'rgba(239, 74, 74, 0.42)';
      ctx.fill();
      ctx.restore();
    }

    if (showProtractor) {
      const inner = geometry.wheelRadius + geometry.protractorGap;
      const outer = inner + geometry.protractorWidth;
      ctx.save();
      ctx.strokeStyle = '#c5c5c5';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, inner, 0, TWO_PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, outer, 0, TWO_PI);
      ctx.stroke();
      for (let deg = 0; deg < 360; deg += 5) {
        const major = deg % 30 === 0;
        const p1 = polar(cx, cy, major ? inner - 3 : inner, direction * deg);
        const p2 = polar(cx, cy, outer + (major ? 6 : 0), direction * deg);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = major ? '#dd4040' : '#b8b8b8';
        ctx.lineWidth = major ? 1.5 : 1;
        ctx.stroke();
        if (major && showMarks) {
          const pt = polar(cx, cy, outer + 22, direction * deg);
          drawRotatedText(ctx, `${deg}°`, pt.x, pt.y, direction * deg, 14, '#555');
        }
      }
      ctx.restore();
    }

    if (showChronometer) {
      const r = geometry.wheelRadius + geometry.protractorGap + geometry.protractorWidth + geometry.chronoGap;
      ctx.save();
      ctx.strokeStyle = '#b7cfc1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TWO_PI);
      ctx.stroke();
      const labels = ['21 MAR', '5 APR', '21 APR', '6 MAY', '21 MAY', '6 JUN', '21 JUN', '6 JUL', '22 JUL', '6 AUG', '22 AUG', '6 SEP', '22 SEP', '7 OCT', '22 OCT', '6 NOV', '21 NOV', '6 DEC', '21 DEC', '5 JAN', '20 JAN', '4 FEB', '19 FEB', '6 MAR'];
      labels.forEach((label, idx) => {
        const deg = direction * (idx * 360 / labels.length);
        const p = polar(cx, cy, r + 28, deg);
        drawRotatedText(ctx, label, p.x, p.y, deg, 13, '#777');
      });
      ctx.restore();
    }

    // Protractor pointer
    ctx.save();
    const pointerDeg = clockwise ? angle : -angle;
    const pp = polar(cx, cy, geometry.wheelRadius + 80, pointerDeg);
    ctx.translate(pp.x, pp.y);
    ctx.rotate(((pointerDeg - 90) * Math.PI) / 180);
    ctx.fillStyle = '#e93020';
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(8, 10);
    ctx.lineTo(-8, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  useEffect(() => {
    render();
  }, [geometry, zoom, levels, divisions, startValue, increment, clockwise, showMarks, showNumbers, showProtractor, showChronometer, highlightVisible, angle, chronoAngle]);

  const fitToScreen = () => {
    const vp = viewportRef.current;
    if (!vp) return;
    const fit = Math.min((vp.clientWidth - 80) / geometry.size, (vp.clientHeight - 80) / geometry.size);
    setZoom(clamp(fit, 0.08, 2));
  };

  useEffect(() => {
    const id = setTimeout(fitToScreen, 100);
    return () => clearTimeout(id);
  }, [geometry.size]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f4f4f4', overflow: 'hidden', direction: 'ltr' }}>
      {visiblePanel && (
        <aside style={panelStyle}>
          <div style={{ padding: '4px 6px', background: '#e5e5e5', borderBottom: '1px solid #aaa', fontWeight: 800 }}>Default</div>
          <Section title="View">
            <Field label="Size"><input style={fieldStyle} type="number" min="1" max="12" value={levels} onChange={(e) => setLevels(clamp(Number(e.target.value) || 1, 1, 12))} /></Field>
            <Field label="View"><select style={fieldStyle} value={divisions} onChange={(e) => setDivisions(Number(e.target.value))}><option value={36}>Circle of 36</option><option value={60}>Circle of 60</option><option value={90}>Circle of 90</option><option value={360}>Circle of 360</option></select></Field>
            <Field label="Data type"><select style={fieldStyle}><option>Price</option><option>Time</option></select></Field>
          </Section>
          <Section title="Price">
            <Field label="Value"><input style={fieldStyle} type="number" value={startValue} onChange={(e) => setStartValue(Number(e.target.value) || 0)} /></Field>
            <Field label="Find"><input style={fieldStyle} type="number" defaultValue="1" /></Field>
            <Field label="Increment"><input style={fieldStyle} type="number" value={increment} onChange={(e) => setIncrement(Number(e.target.value) || 1)} /></Field>
          </Section>
          <Section title="Highlight">
            <Field label="Visible"><input type="checkbox" checked={highlightVisible} onChange={(e) => setHighlightVisible(e.target.checked)} /></Field>
            <Field label="Show marks"><input type="checkbox" checked={showMarks} onChange={(e) => setShowMarks(e.target.checked)} /></Field>
            <Field label="Show numbers"><input type="checkbox" checked={showNumbers} onChange={(e) => setShowNumbers(e.target.checked)} /></Field>
          </Section>
          <Section title="Protractor">
            <Field label="Visible"><input type="checkbox" checked={showProtractor} onChange={(e) => setShowProtractor(e.target.checked)} /></Field>
            <Field label="Clockwise"><input type="checkbox" checked={clockwise} onChange={(e) => setClockwise(e.target.checked)} /></Field>
            <Field label="Angle"><input style={fieldStyle} type="number" value={angle} onChange={(e) => setAngle(Number(e.target.value) || 0)} /></Field>
          </Section>
          <Section title="Chronometer">
            <Field label="Visible"><input type="checkbox" checked={showChronometer} onChange={(e) => setShowChronometer(e.target.checked)} /></Field>
            <Field label="Clockwise"><input type="checkbox" checked={clockwise} onChange={(e) => setClockwise(e.target.checked)} /></Field>
            <Field label="Angle"><input style={fieldStyle} type="number" value={chronoAngle} onChange={(e) => setChronoAngle(Number(e.target.value) || 0)} /></Field>
            <Field label="Range"><select style={fieldStyle}><option>Annual</option><option>Daily</option><option>Weekly</option></select></Field>
          </Section>
        </aside>
      )}

      <button onClick={() => setVisiblePanel((v) => !v)} style={{ position: 'fixed', left: visiblePanel ? 336 : 10, top: 10, zIndex: 40, background: '#fff', border: '1px solid #aaa', borderRadius: 4, color: '#333' }}>
        {visiblePanel ? 'Hide' : 'Show'}
      </button>

      <div style={{ position: 'fixed', right: 12, top: 8, zIndex: 30, display: 'flex', gap: 8, alignItems: 'center', background: '#f8f8f8', border: '1px solid #bcbcbc', borderRadius: 4, padding: '4px 8px', color: '#333', direction: 'ltr' }}>
        <button onClick={() => setZoom((z) => clamp(z - 0.1, 0.08, 2))}>−</button>
        <span>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom((z) => clamp(z + 0.1, 0.08, 2))}>+</button>
        <button onClick={fitToScreen}>Fit</button>
        <button onClick={() => setClockwise((v) => !v)}>{clockwise ? 'Clockwise' : 'Counter'}</button>
      </div>

      <div ref={viewportRef} style={{ position: 'absolute', inset: 0, left: visiblePanel ? 330 : 0, overflow: 'auto', background: '#fff' }}>
        <div style={{ minWidth: '100%', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 30 }}>
          <canvas ref={canvasRef} style={{ display: 'block', background: '#fff' }} />
        </div>
      </div>
    </div>
  );
}
