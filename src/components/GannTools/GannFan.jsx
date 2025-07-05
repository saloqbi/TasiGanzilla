import React, { useState, useRef, useEffect } from 'react';

const gannColors = [
  '#e6194B', '#f58231', '#ffe119', '#bfef45', '#3cb44b',
  '#42d4f4', '#4363d8', '#911eb4', '#f032e6'
];

const GannFan = ({ width = 800, height = 500, gridSize = 10 }) => {
  const [anchor, setAnchor] = useState(() => {
    const saved = localStorage.getItem('gannFanAnchor');
    return saved ? JSON.parse(saved) : null;
  });
  const [dragging, setDragging] = useState(false);
  const [visible, setVisible] = useState(true);
  const svgRef = useRef(null);

  const angles = [
    { label: '1x8', ratio: 1 / 8 },
    { label: '1x4', ratio: 1 / 4 },
    { label: '1x3', ratio: 1 / 3 },
    { label: '1x2', ratio: 1 / 2 },
    { label: '1x1', ratio: 1 },
    { label: '2x1', ratio: 2 },
    { label: '3x1', ratio: 3 },
    { label: '4x1', ratio: 4 },
    { label: '8x1', ratio: 8 },
  ];

  useEffect(() => {
    if (anchor) {
      localStorage.setItem('gannFanAnchor', JSON.stringify(anchor));
    }
  }, [anchor]);

  const snap = (value) => Math.round(value / gridSize) * gridSize;

  const handleClick = (e) => {
    if (dragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = snap(e.clientX - rect.left);
    const y = snap(e.clientY - rect.top);
    setAnchor({ x, y });
  };

  const handleMouseDown = (e) => {
    if (!anchor) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - anchor.x;
    const dy = y - anchor.y;
    if (Math.sqrt(dx * dx + dy * dy) <= 10) {
      setDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = snap(e.clientX - rect.left);
    const y = snap(e.clientY - rect.top);
    setAnchor({ x, y });
  };

  const handleMouseUp = () => {
    if (dragging) setDragging(false);
  };

  const exportSVG = () => {
    const svg = svgRef.current;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gann-fan.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderLines = () => {
    if (!anchor || !visible) return null;

    return angles.map((angle, idx) => {
      const dx = width - anchor.x;
      const dy = dx / angle.ratio;
      const x2 = width;
      const y2 = anchor.y - dy;

      return (
        <g key={idx}>
          <line
            x1={anchor.x}
            y1={anchor.y}
            x2={x2}
            y2={y2}
            stroke={gannColors[idx % gannColors.length]}
            strokeWidth={1.5}
          />
          <text
            x={anchor.x + 5}
            y={anchor.y - (dy / 2)}
            fill={gannColors[idx % gannColors.length]}
            fontSize={10}
          >
            {angle.label}
          </text>
        </g>
      );
    });
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h2 style={{ color: '#FFD700' }}>أداة Gann Fan</h2>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => setVisible(!visible)} style={buttonStyle}>
          {visible ? '🚫 إخفاء المروحة' : '✅ إظهار المروحة'}
        </button>
        <button onClick={exportSVG} style={{ ...buttonStyle, backgroundColor: '#004080', color: '#fff' }}>
          📤 تصدير SVG
        </button>
      </div>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ border: '1px solid #444', backgroundColor: '#111', cursor: dragging ? 'grabbing' : 'crosshair' }}
      >
        {renderLines()}
        {anchor && visible && (
          <circle cx={anchor.x} cy={anchor.y} r={5} fill="yellow" stroke="#FFD700" strokeWidth={1} />
        )}
      </svg>
      <p style={{ color: '#999' }}>
        انقر لتحديد النقطة (Snap)، أو اسحبها، أو استخدم الأزرار أعلاه للتحكم.
      </p>
    </div>
  );
};

const buttonStyle = {
  marginRight: '10px',
  padding: '6px 14px',
  backgroundColor: '#222',
  color: '#FFD700',
  border: '1px solid #444',
  borderRadius: '4px',
  cursor: 'pointer',
};

export default GannFan;
