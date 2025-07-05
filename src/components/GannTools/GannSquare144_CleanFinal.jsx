import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const isSquare = (value) => Number.isInteger(Math.sqrt(value));
const isPrime = (value) => {
  if (value < 2) return false;
  for (let i = 2; i <= Math.sqrt(value); i++) {
    if (value % i === 0) return false;
  }
  return true;
};

const GannSquare144 = () => {
  const defaultConfig = {
    center: 1,
    levels: 5,
    customDivisor: 45,
    visible: true,
    highlights: {
      angle45: true,
      angle90: true,
      angle180: true,
      multiples: true,
      squares: true,
      primes: true,
      corners: true,
    }
  };

  const [config, setConfig] = useState(defaultConfig);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('gannSquare144Config');
    if (stored) setConfig(JSON.parse(stored));
  }, []);

  // Save on change
  useEffect(() => {
    localStorage.setItem('gannSquare144Config', JSON.stringify(config));
  }, [config]);

  const gridSize = config.levels * 2 + 1;
  const svgSize = gridSize * 40;
  const totalCells = gridSize ** 2;
  const cells = new Map();

  let x = 0, y = 0;
  let dx = 0, dy = -1;

  for (let i = 0; i < totalCells; i++) {
    if (-config.levels <= x && x <= config.levels && -config.levels <= y && y <= config.levels) {
      cells.set(`${x},${y}`, config.center + i);
    }
    if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
      [dx, dy] = [-dy, dx];
    }
    x += dx;
       y += dy;

  }
  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const toggleHighlight = (type) => {
    setConfig(prev => ({
      ...prev,
      highlights: {
      angle45: true,
      angle90: true,
      angle180: true,
        ...prev.highlights,
        [type]: !prev.highlights[type],
      }
    }));
  };

  const exportAsPNG = () => {
    const svg = document.querySelector('svg');
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    const canvas = document.createElement('canvas');
    canvas.width = svg.width.baseVal.value;
    canvas.height = svg.height.baseVal.value;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const link = document.createElement('a');
      link.download = 'gann-square.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = url;
  };

  const exportAsPDF = () => {
    const container = document.querySelector('#gann-square-container');
    html2canvas(container).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('gann-square.pdf');
    });
  };

  
  // 🧭 الزوايا الرياضية
  const diagonalKeys = [...cells.entries()].filter(([key]) => {
    const [x, y] = key.split(',').map(Number);
    return config.highlights.angle45 && Math.abs(x) === Math.abs(y); // زاوية 45°
  }).map(([key]) => key);

  const verticalKeys = [...cells.entries()].filter(([key]) => {
    const [x, _] = key.split(',').map(Number);
    return config.highlights.angle90 && x === 0; // زاوية 90°
  }).map(([key]) => key);

  const horizontalKeys = [...cells.entries()].filter(([key]) => {
    const [_, y] = key.split(',').map(Number);
    return config.highlights.angle180 && y === 0; // زاوية 180°
  }).map(([key]) => key);

  const cornerCoords = [
  [-config.levels, -config.levels],
  [config.levels, -config.levels],
  [config.levels, config.levels],
  [-config.levels, config.levels]
];
    [-config.levels, -config.levels],
    [config.levels, -config.levels],
    [config.levels, config.levels],
    [-config.levels, config.levels]
  ];

    [-config.levels, -config.levels],
    [config.levels, -config.levels],
    [config.levels, config.levels],
    [-config.levels, config.levels]
  ];
  const cornerKeys = cornerCoords.map(([cx, cy]) => `${cx},${cy}`);
  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      {/* 🔘 أدوات التحكم */}
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => handleChange('center', config.center + 1)} style={buttonStyle}>🔁 تدوير</button>
        <button onClick={() => handleChange('visible', false)} style={buttonStyle}>🧹 حذف</button>
        <button onClick={exportAsPNG} style={{ ...buttonStyle, backgroundColor: '#004080', color: '#fff' }}>📤 تصدير صورة</button>
        <button onClick={exportAsPDF} style={{ ...buttonStyle, backgroundColor: '#600', color: '#fff' }}>📄 تصدير PDF</button>

        <label style={{ margin: '0 10px' }}>
          طبقات:
          <input
            type="number"
            value={config.levels}
            min={1}
            max={20}
            onChange={(e) => handleChange('levels', Number(e.target.value))}
            style={inputStyle}
          />
        </label>

        <label style={{ margin: '0 10px' }}>
          شرط القسمة:
          <input
            type="number"
            value={config.customDivisor}
            min={1}
            onChange={(e) => handleChange('customDivisor', Number(e.target.value))}
            style={inputStyle}
          />
        </label>
      </div>

      {/* ✅ Checkboxes */
      <div style={{ marginBottom: '10px' }}>
        <label><input type="checkbox" checked={config.highlights.angle45} onChange={() => toggleHighlight('angle45')} /> زاوية 45°</label> |
        <label><input type="checkbox" checked={config.highlights.angle90} onChange={() => toggleHighlight('angle90')} /> زاوية 90°</label> |
        <label><input type="checkbox" checked={config.highlights.angle180} onChange={() => toggleHighlight('angle180')} /> زاوية 180°</label>
      </div>}
      <div style={{ marginBottom: '10px' }}>
        <label><input type="checkbox" checked={config.highlights.multiples} onChange={() => toggleHighlight('multiples')} /> مضاعفات</label> |
        <label><input type="checkbox" checked={config.highlights.squares} onChange={() => toggleHighlight('squares')} /> مربعات</label> |
        <label><input type="checkbox" checked={config.highlights.primes} onChange={() => toggleHighlight('primes')} /> أولية</label> |
        <label><input type="checkbox" checked={config.highlights.corners} onChange={() => toggleHighlight('corners')} /> زوايا</label>
      </div>

      {/* 🧠 الشبكة */}
      {config.visible && (
        <div id="gann-square-container" style={containerStyle}>
          <svg
            width={svgSize}
            height={svgSize}
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ background: '#111' }}
          >
            {[...cells.entries()].map(([key, value]) => {
              const [cx, cy] = key.split(',').map(Number);
              const x = (cx + config.levels) * 40;
              const y = (cy + config.levels) * 40;

              const isCorner = cornerKeys.includes(key);
              const fill =
                config.highlights.multiples && value % config.customDivisor === 0 ? '#FF4500' :
                config.highlights.squares && isSquare(value) ? '#228B22' :
                config.highlights.primes && isPrime(value) ? '#1E90FF' :
                config.highlights.corners && isCorner ? '#FFD700' : 'none';

              return (
                <g key={key}>
                  <rect
                    x={x}
                    y={y}
                    width={40}
                    height={40}
                    fill={fill !== 'none' ? `${fill}22` : 'none'}
                    stroke={(diagonalKeys.includes(key) || verticalKeys.includes(key) || horizontalKeys.includes(key)) ? '#FF00FF' : (fill !== 'none' ? fill : '#FFD700')}
                    strokeWidth={isCorner ? 2 : 1}
                  />
                  <text
                    x={x + 20}
                    y={y + 24}
                    fontSize={12}
                    fill={fill !== 'none' ? '#fff' : '#FFD700'}
                    textAnchor="middle"
                    fontWeight={fill !== 'none' ? 'bold' : 'normal'}
                  >
                    {value}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
};

// ✅ أنماط
const buttonStyle = {
  marginRight: '10px',
  padding: '6px 14px',
  backgroundColor: '#222',
  color: '#FFD700',
  border: '1px solid #444',
  borderRadius: '4px',
  cursor: 'pointer',
};

const inputStyle = {
  width: '60px',
  marginLeft: '5px',
  padding: '3px',
  borderRadius: '4px',
  border: '1px solid #555',
  backgroundColor: '#222',
  color: '#FFD700',
};

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  overflowX: 'auto',
  maxWidth: '100%',
  maxHeight: 'calc(100vh - 300px)',
  padding: '10px',
};

export default GannSquare144;
