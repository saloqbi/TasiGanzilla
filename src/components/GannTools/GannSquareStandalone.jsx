import React from 'react';

const GannSquareStandalone = ({ size = 400 }) => {
  const gridSize = 11;
  const cellSize = size / gridSize;
  const cells = new Map();

  let cx = 0, cy = 0, dx = 0, dy = -1;
  const totalCells = gridSize * gridSize;

  for (let i = 0; i < totalCells; i++) {
    if (-5 <= cx && cx <= 5 && -5 <= cy && cy <= 5) {
      cells.set(`${cx},${cy}`, i + 1);
    }
    if (cx === cy || (cx < 0 && cx === -cy) || (cx > 0 && cx === 1 - cy)) {
      [dx, dy] = [-dy, dx];
    }
    cx += dx;
    cy += dy;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h2 style={{ color: '#FFD700' }}>مربع Gann التساعي</h2>
      <svg width={size} height={size}>
        {[...cells.entries()].map(([key, value]) => {
          const [col, row] = key.split(',').map(Number);
          const x = (size / 2) + col * cellSize - (cellSize / 2);
          const y = (size / 2) + row * cellSize - (cellSize / 2);
          return (
            <g key={key}>
              <rect
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                fill="black"
                stroke="#999"
              />
              <text
                x={x + cellSize / 2}
                y={y + cellSize / 2 + 4}
                fontSize="10"
                fill="#FFD700"
                textAnchor="middle"
              >
                {value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default GannSquareStandalone;
