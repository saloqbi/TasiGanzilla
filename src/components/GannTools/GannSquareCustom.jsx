
import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const isSquare = (n) => Number.isInteger(Math.sqrt(n));
const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
  return true;
};

const generateSpiralGrid = (size) => {
  const grid = Array.from({ length: size }, () => Array(size).fill(null));
  const center = Math.floor(size / 2);
  let x = center;
  let y = center;
  let num = 1;

  grid[y][x] = num++;

  let steps = 1;
  while (x < size && y < size) {
    for (let i = 0; i < steps; i++) {
      x += 1;
      if (x >= 0 && x < size && y >= 0 && y < size) grid[y][x] = num++;
    }
    for (let i = 0; i < steps; i++) {
      y -= 1;
      if (x >= 0 && x < size && y >= 0 && y < size) grid[y][x] = num++;
    }
    steps++;
    for (let i = 0; i < steps; i++) {
      x -= 1;
      if (x >= 0 && x < size && y >= 0 && y < size) grid[y][x] = num++;
    }
    for (let i = 0; i < steps; i++) {
      y += 1;
      if (x >= 0 && x < size && y >= 0 && y < size) grid[y][x] = num++;
    }
    steps++;
  }

  return grid;
};

const rotateGrid = (grid) => {
  const size = grid.length;
  const newGrid = Array.from({ length: size }, () => Array(size).fill(null));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      newGrid[x][size - 1 - y] = grid[y][x];
    }
  }
  return newGrid;
};

const GannSquareCustom = () => {
  const [gridSize, setGridSize] = useState(9);
  const [grid, setGrid] = useState(generateSpiralGrid(9));
  const [highlightSquares, setHighlightSquares] = useState(true);
  const [highlightPrimes, setHighlightPrimes] = useState(true);
  const [highlightMultiples, setHighlightMultiples] = useState(true);
  const [multipleOf, setMultipleOf] = useState(45);
  const containerRef = useRef();

  useEffect(() => {
    const saved = localStorage.getItem('gannSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setGridSize(parsed.gridSize || 9);
      setGrid(generateSpiralGrid(parsed.gridSize || 9));
      setHighlightSquares(parsed.highlightSquares ?? true);
      setHighlightPrimes(parsed.highlightPrimes ?? true);
      setHighlightMultiples(parsed.highlightMultiples ?? true);
      setMultipleOf(parsed.multipleOf || 45);
    }
  }, []);

  useEffect(() => {
    const settings = {
      gridSize,
      highlightSquares,
      highlightPrimes,
      highlightMultiples,
      multipleOf
    };
    localStorage.setItem('gannSettings', JSON.stringify(settings));
  }, [gridSize, highlightSquares, highlightPrimes, highlightMultiples, multipleOf]);

  const handleChange = (e) => {
    const input = e.target.value;
    const newSize = parseInt(input);

    if (!isNaN(newSize) && newSize > 0 && newSize <= 200) {
      setGridSize(newSize);
      setGrid(generateSpiralGrid(newSize));
    } else {
      setGridSize(input); // السماح للمستخدم بكتابة الرقم كاملاً
    }
    if (!isNaN(newSize) && newSize > 0 && newSize <= 200) {
      setGridSize(newSize);
      setGrid(generateSpiralGrid(newSize));
    }
  };

  const handleRotate = () => {
    setGrid(rotateGrid(grid));
  };

  const handleDownloadImage = () => {
    html2canvas(containerRef.current).then((canvas) => {
      const link = document.createElement('a');
      link.download = `gann_square_${gridSize}x${gridSize}.png`;
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  const handleDownloadPDF = () => {
    html2canvas(containerRef.current).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'pt', 'a4');
      const ratio = Math.min(800 / canvas.width, 550 / canvas.height);
      pdf.addImage(imgData, 'PNG', 40, 40, canvas.width * ratio, canvas.height * ratio);
      pdf.save(`gann_square_${gridSize}x${gridSize}.pdf`);
    });
  };

  const cellSize = gridSize > 50 ? 20 : 30;
  const fontSize = gridSize > 100 ? 8 : gridSize > 50 ? 10 : 12;
  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      <h2 style={{ color: 'gold' }}>🔷 Gann Square (Custom + Highlights)</h2>

      <div style={{ marginBottom: 10 }}>
        <label>الحجم:</label>
        <input
          type="text" pattern="\\d*" inputMode="numeric"
          value={gridSize}
          min={1}
          onChange={handleChange}
          style={{ padding: '6px', fontSize: '16px', margin: '0 10px' }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label><input type="checkbox" checked={highlightSquares} onChange={() => setHighlightSquares(!highlightSquares)} /> مربعات كاملة</label>
        <label style={{ marginLeft: 10 }}><input type="checkbox" checked={highlightPrimes} onChange={() => setHighlightPrimes(!highlightPrimes)} /> أولية</label>
        <label style={{ marginLeft: 10 }}><input type="checkbox" checked={highlightMultiples} onChange={() => setHighlightMultiples(!highlightMultiples)} /> مضاعفات</label>
        {highlightMultiples && (
          <input
            type="text" pattern="\\d*" inputMode="numeric"
            value={multipleOf}
            min={1}
            onChange={(e) => setMultipleOf(parseInt(e.target.value))}
            style={{ marginLeft: 6, width: 60 }}
          />
        )}
      </div>

      <div style={{ marginBottom: 10 }}>
        <button onClick={handleRotate}>🔁 تدوير</button>
        <button onClick={handleDownloadImage} style={{ marginLeft: 10 }}>💾 حفظ كصورة</button>
        <button onClick={handleDownloadPDF} style={{ marginLeft: 10 }}>📄 تصدير PDF</button>
      </div>

      <div
        ref={containerRef}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, 30px)`,
          justifyContent: 'center',
          gap: '1px',
          marginTop: 10,
        }}
      >
        {grid.flat().map((num, idx) => {
          let bg = '#111111';
          let color = 'white';
          if (highlightSquares && isSquare(num)) bg = '#FFD700';
          if (highlightPrimes && isPrime(num)) bg = '#002B5B';
          if (highlightMultiples && num % multipleOf === 0) bg = '#1AFF1A';
          const cellSize = gridSize > 50 ? 20 : 30;
  const fontSize = gridSize > 100 ? 8 : gridSize > 50 ? 10 : 12;
  return (
            <div
              key={idx}
              style={{
                width: cellSize,
                height: cellSize,
                fontSize: fontSize,
                backgroundColor: bg,
                color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid gold',
              }}
            >
              {num}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GannSquareCustom;
