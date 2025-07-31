import React, { useRef, useEffect, useState } from "react";
import getDefaultSettings from "./GannCircle360CanvasClean.settings";

const GannCircle360Canvas = () => {
  // === STATES ===
  const [scale, setScale] = useState(0.4);
  const [showZodiacRing, setShowZodiacRing] = useState(true);
  const [showWeekDaysRing, setShowWeekDaysRing] = useState(true);
  const [showDegreeRing, setShowDegreeRing] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showZoomControls, setShowZoomControls] = useState(true);
  const [settings, setSettings] = useState(getDefaultSettings());
  const [cellClickCounts, setCellClickCounts] = useState({});
  
  // Canvas refs
  const canvasRef = useRef();
  const canvasSize = 800;

  // === UTILITY FUNCTIONS ===
  const reduceToDigit = (num) => {
    let numStr = num.toString().replace('.', '');
    let current = numStr.split("").reduce((a, b) => a + Number(b), 0);
    while (current > 9) {
      current = current.toString().split("").reduce((a, b) => a + Number(b), 0);
    }
    return current;
  };

  const getCellValue = (level, index, ringStartNumbers) => {
    if (level < 2) return 0;
    const globalIndex = (level - 2) * settings.divisions + index;
    const incrementStep = 0.01;
    return parseFloat((settings.startValue + globalIndex * incrementStep).toFixed(2));
  };

  const getDigitColor = (digit) => {
    if ([1, 4, 7].includes(digit)) return "red";
    if ([2, 5, 8].includes(digit)) return "blue";
    if ([3, 6, 9].includes(digit)) return "black";
    return "#000";
  };

  const getCellBackgroundColor = (cellKey, clicks) => {
    if (clicks === 1) return "#90ee90";
    if (clicks === 2) return "#ffb6c1";
    if (clicks === 3) return "#ffff00";
    if (clicks === 4) return "#d3d3d3";
    return "#fff";
  };

  const calculateRingWidth = (maxDigits, baseWidth = 100, digitScale = 20, padding = 16) => {
    return Math.max(baseWidth + maxDigits * digitScale + padding * 2, 90);
  };

  const calculateRingStartNumbers = (startValue, levels, divisions) => {
    let ringStartNumbers = [];
    ringStartNumbers[0] = null;
    ringStartNumbers[1] = null;
    
    for (let level = 2; level < levels; level++) {
      if (level === 2) {
        ringStartNumbers[level] = startValue;
      } else {
        const previousRingEnd = ringStartNumbers[level - 1] + divisions - 1;
        let nextStart = previousRingEnd + 1;
        while (reduceToDigit(nextStart) !== 1) {
          nextStart++;
        }
        ringStartNumbers[level] = nextStart;
      }
    }
    return ringStartNumbers;
  };

  // === MAIN DRAWING USEEFFECT ===
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    const uniformScale = dpr * scale;
    ctx.scale(uniformScale, uniformScale);

    const center = canvasSize / 2;
    const innerRadius = 60;
    const baseRingWidth = 100;
    const digitScale = 20;
    const minCellPadding = 16;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // حساب أرقام البداية للحلقات
    const totalLevels = settings.levels + 2;
    const ringStartNumbers = calculateRingStartNumbers(settings.startValue, totalLevels, settings.divisions);

    // رسم الحلقات
    for (let level = 0; level < totalLevels; level++) {
      if (level < 2) continue; // تخطي الحلقات الفارغة

      const maxDigitsInLevel = Math.max(
        ...Array.from({ length: settings.divisions }, (_, i) => {
          const cellValue = getCellValue(level, i, ringStartNumbers);
          return cellValue > 0 ? parseFloat(cellValue.toFixed(2)).toString().length : 1;
        })
      );
      
      const dynamicWidth = calculateRingWidth(maxDigitsInLevel);
      
      const r1 = innerRadius + [...Array(level)].reduce((acc, _, l) => {
        const maxDigits = Math.max(
          ...Array.from({ length: settings.divisions }, (_, i) => {
            const cellValue = getCellValue(l, i, ringStartNumbers);
            return cellValue > 0 ? parseFloat(cellValue.toFixed(2)).toString().length : 1;
          })
        );
        return acc + calculateRingWidth(maxDigits);
      }, 0);
      const r2 = r1 + dynamicWidth;

      // رسم الخلايا
      for (let index = 0; index < settings.divisions; index++) {
        const value = getCellValue(level, index, ringStartNumbers);
        const reduced = value > 0 ? reduceToDigit(value) : 0;
        
        const anglePerCell = 360 / settings.divisions;
        const cellAngleDeg = (index + 1) * anglePerCell;
        let angleDeg = cellAngleDeg - 90;
        const angleRad = (angleDeg * Math.PI) / 180;
        
        const halfAngle = (anglePerCell / 2 * Math.PI) / 180;
        const angleStart = angleRad - halfAngle;
        const angleEnd = angleRad + halfAngle;
        const angleMid = angleRad;
        const rMid = (r1 + r2) / 2;
        
        const cellKey = `${level}-${index}`;
        const clickCount = cellClickCounts[cellKey] || 0;
        
        // رسم الخلية
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, r2, angleStart, angleEnd);
        ctx.arc(center, center, r1, angleEnd, angleStart, true);
        ctx.closePath();
        ctx.fillStyle = getCellBackgroundColor(cellKey, clickCount);
        ctx.fill();
        ctx.strokeStyle = "#aaa";
        ctx.lineWidth = 0.5;
        ctx.stroke();
        
        // رسم النص
        if (level >= 2) {
          const x = center + rMid * Math.cos(angleMid);
          const y = center + rMid * Math.sin(angleMid);
          
          const cellWidth = dynamicWidth;
          const formattedValue = Number(value).toFixed(2);
          const valueString = formattedValue.toString();
          
          const maxFontSize = Math.min(cellWidth * 0.85, 24);
          const minFontSize = 12;
          
          let fontSize = Math.max(
            Math.min(maxFontSize, (cellWidth * 0.75) / valueString.length * 2.4), 
            minFontSize
          );
          
          if (valueString.length > 6) {
            fontSize = Math.max(fontSize * 0.9, minFontSize);
          }
          
          ctx.font = `bold ${fontSize}px Tahoma`;
          ctx.fillStyle = getDigitColor(reduced);
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          
          ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
          ctx.lineWidth = 1;
          ctx.strokeText(formattedValue, x, y);
          ctx.fillText(formattedValue, x, y);
        }
        ctx.restore();
      }
    }

  }, [
    settings,
    scale,
    cellClickCounts
  ]);

  // === CLICK HANDLERS USEEFFECT ===
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleCellClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const uniformScale = dpr * scale;
      
      const canvasMouseX = ((e.clientX - rect.left) * dpr) / uniformScale;
      const canvasMouseY = ((e.clientY - rect.top) * dpr) / uniformScale;
      
      const center = canvasSize / 2;
      const distance = Math.sqrt(Math.pow(canvasMouseX - center, 2) + Math.pow(canvasMouseY - center, 2));
      
      console.log("Cell click detected", { canvasMouseX, canvasMouseY, distance });
      
      // تحديث عدد النقرات للخلية
      setCellClickCounts(prev => ({
        ...prev,
        "test-cell": ((prev["test-cell"] || 0) + 1) % 5
      }));
    };

    canvas.addEventListener("click", handleCellClick);
    
    return () => {
      canvas.removeEventListener("click", handleCellClick);
    };
  }, [scale]);

  // === JSX RENDER ===
  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", background: "#111" }}>
      {/* Controls */}
      <div style={{ padding: 10, flexShrink: 0 }}>
        {showZoomControls && (
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
            <button
              onClick={() => setScale((prev) => Math.min(prev + 0.1, 2.0))}
              style={{ padding: "6px 12px", fontSize: "13px", background: "#333", color: "#FFD700", border: "1px solid #FFD700", borderRadius: "4px", cursor: "pointer" }}
            >
              ➕ تكبير
            </button>
            <button
              onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.1))}
              style={{ padding: "6px 12px", fontSize: "13px", background: "#333", color: "#FFD700", border: "1px solid #FFD700", borderRadius: "4px", cursor: "pointer" }}
            >
              ➖ تصغير
            </button>
            <div style={{ fontSize: "11px", color: "#FFD700", marginTop: "4px" }}>
              {(scale * 100).toFixed(0)}%
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{ padding: "8px 16px", background: "#333", color: "#FFD700", border: "1px solid #FFD700", borderRadius: "4px", cursor: "pointer" }}
          >
            ⚙️ الإعدادات
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div style={{ 
            background: "#222", 
            padding: "20px", 
            borderRadius: "8px", 
            border: "1px solid #FFD700",
            marginBottom: "10px",
            maxWidth: "400px"
          }}>
            <h3 style={{ color: "#FFD700", marginBottom: "15px" }}>إعدادات الدائرة</h3>
            
            <div style={{ marginBottom: "10px" }}>
              <label style={{ color: "#FFD700", display: "block", marginBottom: "5px" }}>
                عدد القطاعات: {settings.divisions}
              </label>
              <input
                type="number"
                min={10}
                max={720}
                value={settings.divisions}
                onChange={(e) => setSettings(prev => ({ ...prev, divisions: parseInt(e.target.value) }))}
                style={{ width: "100%", background: "#1a1a1a", color: "#FFD700", border: "1px solid #FFD700", borderRadius: "4px", padding: "5px" }}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label style={{ color: "#FFD700", display: "block", marginBottom: "5px" }}>
                بداية الترقيم: {settings.startValue}
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.startValue}
                onChange={(e) => setSettings(prev => ({ ...prev, startValue: parseFloat(e.target.value) || 0 }))}
                style={{ width: "100%", background: "#1a1a1a", color: "#FFD700", border: "1px solid #FFD700", borderRadius: "4px", padding: "5px" }}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label style={{ color: "#FFD700", display: "block", marginBottom: "5px" }}>
                عدد الحلقات: {settings.levels}
              </label>
              <input
                type="number"
                min={1}
                max={40}
                value={settings.levels}
                onChange={(e) => setSettings(prev => ({ ...prev, levels: parseInt(e.target.value) || 1 }))}
                style={{ width: "100%", background: "#1a1a1a", color: "#FFD700", border: "1px solid #FFD700", borderRadius: "4px", padding: "5px" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative" }}>
          <canvas
            ref={canvasRef}
            style={{
              border: "2px solid #FFD700",
              borderRadius: "50%",
              background: "transparent",
              width: "100%",
              height: "100%",
              aspectRatio: "1/1"
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GannCircle360Canvas;
