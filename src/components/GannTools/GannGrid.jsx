import React, { useState, useEffect, useRef } from 'react';

const GannGrid = ({ width = 800, height = 500, snapSize = 10 }) => {
  const [anchor, setAnchor] = useState(() => {
    const saved = localStorage.getItem('gannGridAnchor');
    return saved ? JSON.parse(saved) : null;
  });
  const [gridSize, setGridSize] = useState(() => {
    const saved = localStorage.getItem('gannGridSize');
    return saved ? JSON.parse(saved) : null;
  });
  const [visible, setVisible] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  useEffect(() => {
    if (anchor) localStorage.setItem('gannGridAnchor', JSON.stringify(anchor));
    if (gridSize) localStorage.setItem('gannGridSize', JSON.stringify(gridSize));
  }, [anchor, gridSize]);

  const snap = (v) => Math.round(v / snapSize) * snapSize;

  const handleMouseDown = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = snap(e.clientX - rect.left);
    const clickY = snap(e.clientY - rect.top);

    if (anchor && gridSize) {
      const { cols, rows, cellWidth, cellHeight } = gridSize;
      const gridWidth = cols * cellWidth;
      const gridHeight = rows * cellHeight;

      if (
        clickX >= anchor.x && clickX <= anchor.x + gridWidth &&
        clickY >= anchor.y && clickY <= anchor.y + gridHeight
      ) {
        setIsDragging(true);
        setOffset({ x: clickX - anchor.x, y: clickY - anchor.y });
        return;
      }
    }

    setAnchor({ x: clickX, y: clickY });
    setGridSize(null);
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const moveX = snap(e.clientX - rect.left);
    const moveY = snap(e.clientY - rect.top);

    if (isDrawing && anchor) {
      const dx = moveX - anchor.x;
      const dy = moveY - anchor.y;
      const cols = 8;
      const rows = 8;
      const cellWidth = Math.abs(dx) / cols;
      const cellHeight = Math.abs(dy) / rows;

      setGridSize({
        cols,
        rows,
        cellWidth,
        cellHeight,
        directionX: dx >= 0 ? 1 : -1,
        directionY: dy >= 0 ? 1 : -1,
      });
    }

    if (isDragging && anchor && gridSize) {
      const newX = moveX - offset.x;
      const newY = moveY - offset.y;
      setAnchor({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsDragging(false);
  };

  const handleClear = () => {
    setAnchor(null);
    setGridSize(null);
    localStorage.removeItem('gannGridAnchor');
    localStorage.removeItem('gannGridSize');
  };

  const exportSVG = () => {
    const svg = svgRef.current;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gann-grid.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderGrid = () => {
    if (!anchor || !gridSize || !visible) return null;

    const lines = [];
    const { cols, rows, cellWidth, cellHeight, directionX, directionY } = gridSize;

    for (let i = 0; i <= cols; i++) {
      const x = anchor.x + directionX * i * cellWidth;
      lines.push(
        <line key={`v-${i}`} x1={x} y1={anchor.y} x2={x} y2={anchor.y + directionY * rows * cellHeight} stroke="#00BFFF" strokeWidth={1} />
      );
    }

    for (let j = 0; j <= rows; j++) {
      const y = anchor.y + directionY * j * cellHeight;
      lines.push(
        <line key={`h-${j}`} x1={anchor.x} y1={y} x2={anchor.x + directionX * cols * cellWidth} y2={y} stroke="#00BFFF" strokeWidth={1} />
      );
    }

    return lines;
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h2 style={{ color: '#FFD700' }}>أداة Gann Grid</h2>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={handleClear} style={buttonStyle}>🧹 حذف</button>
        <button onClick={() => setVisible(!visible)} style={buttonStyle}>
          {visible ? '🚫 إخفاء الشبكة' : '✅ إظهار الشبكة'}
        </button>
        <button onClick={exportSVG} style={{ ...buttonStyle, backgroundColor: '#004080', color: '#fff' }}>📤 تصدير SVG</button>
      </div>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ backgroundColor: '#111', cursor: isDragging ? 'grabbing' : 'crosshair', border: '1px solid #444' }}
      >
        {anchor && !gridSize && <circle cx={anchor.x} cy={anchor.y} r={4} fill="yellow" />}
        {renderGrid()}
      </svg>
      <p style={{ color: '#AAA' }}>
        انقر لتحديد الزاوية، اسحب لتوسيع الشبكة، أو حرّكها، يتم الحفظ تلقائيًا.
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

export default GannGrid;
