
import React, { useState, useEffect, useRef } from "react";

const defaultSettings = {
  levels: 12,
  rotation: 0,
  divisions: 360,
  startValue: 1,
  language: "ar",
};

const GannCircle360 = () => {
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem("gannCircle360Settings");
    return stored ? JSON.parse(stored) : defaultSettings;
  });

  const [zoom, setZoom] = useState(1);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    localStorage.setItem("gannCircle360Settings", JSON.stringify(settings));
  }, [settings]);



  const totalSectors = settings.divisions;
  const innerRadius = 100;

  const angleStep = (2 * Math.PI) / totalSectors;
  const baseRingWidth = 50;
  const digitScale = 8;


const dynamicSize = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5 );
const center = dynamicSize / 2;


  const getPathForCell = (r1, r2, startAngle, endAngle) => {
    const x1 = center + r1 * Math.cos(startAngle);
    const y1 = center + r1 * Math.sin(startAngle);
    const x2 = center + r2 * Math.cos(startAngle);
    const y2 = center + r2 * Math.sin(startAngle);
    const x3 = center + r2 * Math.cos(endAngle);
    const y3 = center + r2 * Math.sin(endAngle);
    const x4 = center + r1 * Math.cos(endAngle);
    const y4 = center + r1 * Math.sin(endAngle);

    return `M${x1},${y1} L${x2},${y2} A${r2},${r2} 0 0,1 ${x3},${y3} L${x4},${y4} A${r1},${r1} 0 0,0 ${x1},${y1} Z`;

  };

  const handleRotate = () =>
    setSettings((prev) => ({
      ...prev,
      rotation: (prev.rotation + 10) % 360,
    }));

  const toggleLang = () =>
    setSettings((prev) => ({
      ...prev,
      language: prev.language === "ar" ? "en" : "ar",
    }));

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - drag.x,
      y: e.clientY - drag.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setDrag({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
  style={{
    width: "100%",
    minHeight: "100vh",
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 20,
    background: "#111",
  }}
>


      <h2 style={{ color: "#FFD700" }}>
        {settings.language === "ar"
          ? "دائرة Gann 360 (حجم خلية ذكي)"
          : "Gann 360 Circle (Auto Cell Size)"}
      </h2>

      <div style={{ marginBottom: 10, flexWrap: "wrap" }}>
        <button onClick={handleRotate} style={buttonStyle}>
          🔁 {settings.language === "ar" ? "تدوير" : "Rotate"}
        </button>
        <button onClick={toggleLang} style={buttonStyle}>
          🌐 {settings.language === "ar" ? "English" : "العربية"}
        </button>
        <button onClick={() => setZoom((z) => z + 0.1)} style={buttonStyle}>
          🔍 {settings.language === "ar" ? "تكبير" : "Zoom In"}
        </button>
        <button onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))} style={buttonStyle}>
          🔎 {settings.language === "ar" ? "تصغير" : "Zoom Out"}
        </button>

        <label style={{ color: "#FFD700", marginLeft: 15 }}>
          {settings.language === "ar" ? "عدد الحلقات:" : "Levels:"}
          <input
            type="number"
            min={1}
            max={40}
            value={settings.levels}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                levels: parseInt(e.target.value),
              }))
            }
            style={{ marginLeft: 10, width: 60 }}
          />
        </label>

        <label style={{ color: "#FFD700", marginLeft: 15 }}>
          {settings.language === "ar" ? "عدد القطاعات:" : "Divisions:"}
          <input
            type="number"
            min={10}
            max={720}
            value={settings.divisions}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                divisions: parseInt(e.target.value),
              }))
            }
            style={{ marginLeft: 10, width: 60 }}
          />
        </label>

        <label style={{ color: "#FFD700", marginLeft: 15 }}>
          {settings.language === "ar" ? "بداية الترقيم:" : "Start From:"}
          <input
            type="number"
            min={1}
            value={settings.startValue}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                startValue: parseInt(e.target.value),
              }))
            }
            style={{ marginLeft: 10, width: 60 }}
          />
        </label>
      </div>
<div
  style={{
    width: dynamicSize,
    height: dynamicSize,
    margin: "0 auto",
    background: "#111",
    borderRadius: 0,
       overflow: "visible",
    border: "2px solid #444",
  }}
>

 <svg
    width={dynamicSize}
    height={dynamicSize}
    viewBox={`0 0 ${dynamicSize} ${dynamicSize}`}
    preserveAspectRatio="xMidYMid meet"
    style={{
      background: "#000",
      cursor: isDragging ? "grabbing" : "grab",
    }}
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    onMouseLeave={handleMouseUp}
  >
  <g
    transform={`
      translate(${drag.x}, ${drag.y})
      scale(${zoom})
      translate(${(1 - zoom) * center}, ${(1 - zoom) * center})
    `}
  >
    {[...Array(settings.levels)].map((_, level) => {
      const maxDigitsInLevel = Math.max(
        ...Array.from({ length: settings.divisions }, (_, i) =>
          (settings.startValue + level * settings.divisions + i).toString().length
        )
      );
      const dynamicWidth = baseRingWidth + maxDigitsInLevel * digitScale;
      const r1 = innerRadius + [...Array(level)].reduce((acc, l) => {
        const maxDigits = Math.max(
          ...Array.from({ length: settings.divisions }, (_, i) =>
            (settings.startValue + l * settings.divisions + i).toString().length
          )
        );
        return acc + (baseRingWidth + maxDigits * digitScale);
      }, 0);
      const r2 = r1 + dynamicWidth;

      return (
        <React.Fragment key={level}>
          {[...Array(settings.divisions)].map((_, index) => {
            const value = settings.startValue + level * settings.divisions + index;
            const angleStart = index * angleStep + (settings.rotation * Math.PI) / 180;
            const angleEnd = angleStart + angleStep;
            const angleMid = (angleStart + angleEnd) / 2;
            const path = getPathForCell(r1, r2, angleStart, angleEnd);
            const rMid = (r1 + r2) / 2;
            const x = center + rMid * Math.cos(angleMid);
            const y = center + rMid * Math.sin(angleMid);
            const fontSize = Math.max(6, 13 - value.toString().length);
            const isGray = (level + index) % 2 === 0;

            return (
              <g key={`${level}-${index}`}>
                <path d={path} fill={isGray ? "#f0f0f0" : "#ffffff"} stroke="#aaa" strokeWidth={0.5} />
                <text
                  x={x}
                  y={y}
                  fill="#000"
                  fontSize={fontSize}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontWeight="bold"
                >
                  {value}
                </text>
              </g>
            );
          })}
        </React.Fragment>
      );
    })}
  </g>
</svg>
</div> {/* إغلاق الـ Box الخارجي */}

    </div>
  );
};

const buttonStyle = {
  margin: "6px",
  padding: "6px 14px",
  backgroundColor: "#222",
  color: "#FFD700",
  border: "1px solid #444",
  borderRadius: "4px",
  cursor: "pointer",
};

export default GannCircle360;
