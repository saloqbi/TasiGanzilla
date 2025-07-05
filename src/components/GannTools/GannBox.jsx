import React, { useState } from 'react';

const GannBox = ({ width = 800, height = 500 }) => {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // إذا كان تم رسم مربع مسبقًا، تحقق إذا تم النقر داخل المربع
    if (start && end) {
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const size = Math.abs(end.x - start.x);

      if (
        clickX >= x && clickX <= x + size &&
        clickY >= y && clickY <= y + size
      ) {
        setIsDragging(true);
        setOffset({ x: clickX - x, y: clickY - y });
        return;
      }
    }

    // بدء رسم مربع جديد
    setStart({ x: clickX, y: clickY });
    setEnd(null);
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const moveX = e.clientX - rect.left;
    const moveY = e.clientY - rect.top;

    if (isDrawing && start) {
      const dx = moveX - start.x;
      const dy = moveY - start.y;
      const size = Math.min(Math.abs(dx), Math.abs(dy));

      setEnd({
        x: dx >= 0 ? start.x + size : start.x - size,
        y: dy >= 0 ? start.y + size : start.y - size,
      });
    }

    if (isDragging && start && end) {
      const size = Math.abs(end.x - start.x);
      const newX = moveX - offset.x;
      const newY = moveY - offset.y;

      setStart({ x: newX, y: newY });
      setEnd({ x: newX + size, y: newY + size });
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsDragging(false);
  };

  const renderBox = () => {
    if (!start || !end) return null;

    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const boxSize = Math.abs(end.x - start.x);
    const midX = x + boxSize / 2;
    const midY = y + boxSize / 2;

    return (
      <>
        <rect
          x={x}
          y={y}
          width={boxSize}
          height={boxSize}
          fill="rgba(0,255,0,0.1)"
          stroke="#00FF00"
          strokeWidth={2}
        />
        {/* الخطوط */}
        <line x1={x} y1={midY} x2={x + boxSize} y2={midY} stroke="#00FF00" strokeDasharray="4" />
        <line x1={midX} y1={y} x2={midX} y2={y + boxSize} stroke="#00FF00" strokeDasharray="4" />
        <line x1={x} y1={y} x2={x + boxSize} y2={y + boxSize} stroke="#00FF00" strokeDasharray="2" />
        <line x1={x + boxSize} y1={y} x2={x} y2={y + boxSize} stroke="#00FF00" strokeDasharray="2" />
      </>
    );
  };

  return (
    <svg
      width={width}
      height={height}
      style={{ backgroundColor: '#111', cursor: isDragging ? 'grabbing' : 'crosshair' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {renderBox()}
    </svg>
  );
};

export default GannBox;
