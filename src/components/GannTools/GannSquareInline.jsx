import React, { useState, useRef, useEffect } from "react";

const GannSquareInline = ({
  x,
  y,
  movable = false,
  initialSize = 220,
  rotation = 0,
  layers = 1,
  highlightMultiplesOf = 5,
  divisionCondition = 7
}) => {
  const [size, setSize] = useState(initialSize);
  const [angle, setAngle] = useState(rotation);
  const isResizing = useRef(false);
  const isDragging = useRef(false);

  const gridSize = 11;
  const cellSize = size / gridSize;
  const totalCells = gridSize * gridSize;

  const originalCells = new Map();
  let cx = 0, cy = 0, dx = 0, dy = -1;

  for (let i = 0; i < totalCells; i++) {
    if (-5 <= cx && cx <= 5 && -5 <= cy && cy <= 5) {
      originalCells.set(`${cx},${cy}`, i + 1);
    }
    if (cx === cy || (cx < 0 && cx === -cy) || (cx > 0 && cx === 1 - cy)) {
      [dx, dy] = [-dy, dx];
    }
    cx += dx;
    cy += dy;
  }
  
  const cells = new Map();

  // Apply rotation to the keys (positions) of originalCells
  const deg = (angle % 360 + 360) % 360;
  for (const [key, val] of originalCells.entries()) {
    const [x0, y0] = key.split(',').map(Number);
    let x1 = x0;
    let y1 = y0;

    if (deg === 90) {
      x1 = -y0;
      y1 = x0;
    } else if (deg === 180) {
      x1 = -x0;
      y1 = -y0;
    } else if (deg === 270) {
      x1 = y0;
      y1 = -x0;
    }

    cells.set(`${x1},${y1}`, val);
  }
  useEffect(() => {
    const onMouseMove = (e) => {
      if (isResizing.current) {
        const dx = e.clientX - x;
        const dy = e.clientY - y;
        const newSize = Math.max(50, Math.min(Math.sqrt(dx * dx + dy * dy) * 2, 600));
        setSize(newSize);
      } else if (isDragging.current && movable) {
        const svg = groupRef.current.closest("svg");
        const rect = svg.getBoundingClientRect();
        const newX = e.clientX - rect.left;
        const newY = e.clientY - rect.top;
        setPosition({ x: newX, y: newY });
      }
    };

    const onMouseUp = () => {
      isResizing.current = false;
      isDragging.current = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [x, y, movable]);

  const renderAngleLines = () => {
    const lines = [];
    const centerX = x;
    const centerY = y;
    const radius = size / 2;
    const angles = [0, 45, 90, 135, 180, 225, 270, 315];
    angles.forEach((deg, i) => {
      const rad = (deg * Math.PI) / 180;
      const x2 = centerX + radius * Math.cos(rad);
      const y2 = centerY + radius * Math.sin(rad);
      lines.push(
        <line
          key={`angle-${i}`}
          x1={centerX}
          y1={centerY}
          x2={x2}
          y2={y2}
          stroke="yellow"
          strokeWidth={0.5}
          strokeDasharray="2,2"
        />
      );
    });
    return lines;
  };

  const groupRef = useRef(null);
  const [position, setPosition] = useState({ x, y });
  const [showPrimes, setShowPrimes] = useState(true);
  const [showSquares, setShowSquares] = useState(true);

  const handleMouseDown = (e) => {
    if (!movable) return;
    isDragging.current = true;
    e.stopPropagation();
  };

  return (
    <>
      <foreignObject x={10} y={5} width={150} height={60}>
        <div xmlns="http://www.w3.org/1999/xhtml" style={{ color: 'white', fontSize: 12 }}>
          <label>
            <input type="checkbox" checked={showPrimes} onChange={() => setShowPrimes(!showPrimes)} /> أرقام أولية
          </label>
          <br />
          <label>
            <input type="checkbox" checked={showSquares} onChange={() => setShowSquares(!showSquares)} /> مربعات كاملة
          </label>
        </div>
      </foreignObject>
      <g ref={groupRef} onMouseDown={movable ? handleMouseDown : undefined} style={{ cursor: movable ? 'move' : 'default' }}>
        {[...Array(layers)].map((_, layerIndex) => {
          const layerOffset = layerIndex * 2;
          const scaledSize = size - layerOffset * 2;
          const scaledCellSize = scaledSize / gridSize;

          return Array.from(cells.entries()).map(([key, value], index) => {
            const [col, row] = key.split(",").map(Number);
            const rectX = position.x - (scaledCellSize * (gridSize - 1)) / 2 + col * scaledCellSize;
            const rectY = position.y - (scaledCellSize * (gridSize - 1)) / 2 + row * scaledCellSize;

            let fill = "rgba(255,255,255,0.08)";
            const isPrime = (n) => {
              if (n < 2) return false;
              for (let i = 2; i <= Math.sqrt(n); i++) {
                if (n % i === 0) return false;
              }
              return true;
            };
            const isPerfectSquare = Number.isInteger(Math.sqrt(value));
            if (value % highlightMultiplesOf === 0) fill = "rgba(0,255,255,0.2)";
            if (isPrime(value) && showPrimes) fill = "rgba(255, 105, 180, 0.25)"; // وردي للأرقام الأولية
            if (isPerfectSquare && showSquares) fill = "rgba(173, 216, 230, 0.25)"; // أزرق فاتح للمربعات الكاملة
            if (value === 45) fill = "#6a0dad";       // زاوية 45° بنفسجي
            if (value === 90) fill = "#007f00";         // زاوية 90° أخضر غامق
            if (value === 180) fill = "#004080";        // زاوية 180° أزرق داكن
            if (value === 360) fill = "#b8860b";        // زاوية 360° ذهبي غامق      // زاوية 360°
            if (value % divisionCondition === 0) fill = "rgba(255,165,0,0.2)";
            if (value === 1 || value === 121 || value === 61) fill = "rgba(255,0,0,0.3)";

            return (
              <g key={`layer-${layerIndex}-${index}`}>
                <rect x={rectX} y={rectY} width={scaledCellSize} height={scaledCellSize} fill={fill}$1
  stroke={(value === 45 || value === 90 || value === 180 || value === 360) ? "gold" : "white"}
  strokeWidth={(value === 45 || value === 90 || value === 180 || value === 360) ? 1.5 : 0.4}
/>
                <text
  x={rectX + scaledCellSize / 2}
  y={rectY + scaledCellSize / 2}
  fontSize={Math.max(6, scaledCellSize / 2.5)}
  fill="white"
  textAnchor="middle"
  dominantBaseline="middle"
>
  {(value === 45 && '45°') || (value === 90 && '90°') || (value === 180 && '180°') || (value === 360 && '360°') || value}
</text>
              </g>
            );
          });
        })}

        {renderAngleLines()}

        
      </g>

     <g>
  {/* زر التدوير */}
  <g onClick={() => setAngle((angle + 90) % 360)} style={{ cursor: 'pointer' }}>
    <rect x={30} y={30} width={60} height={20} fill="#222" stroke="white" />
    <text x={60} y={45} fontSize={12} fill="white" textAnchor="middle">Rotate 90°</text>
    <title>Rotate Clockwise</title>
  </g>

  {/* زر التكبير */}
  <g onClick={() => setSize(prev => Math.min(prev + 20, 600))} style={{ cursor: 'pointer' }}>
    <rect x={100} y={30} width={20} height={20} fill="#222" stroke="white" />
    <text x={110} y={45} fontSize={14} fill="white" textAnchor="middle">＋</text>
    <title>Zoom In</title>
  </g>

  {/* زر التصغير */}
  <g onClick={() => setSize(prev => Math.max(prev - 20, 100))} style={{ cursor: 'pointer' }}>
    <rect x={130} y={30} width={20} height={20} fill="#222" stroke="white" />
    <text x={140} y={45} fontSize={14} fill="white" textAnchor="middle">－</text>
    <title>Zoom Out</title>
  </g>
</g>


      {/* زاوية التدوير يدويًا */}
      
    </>
  );
};

export default GannSquareInline;