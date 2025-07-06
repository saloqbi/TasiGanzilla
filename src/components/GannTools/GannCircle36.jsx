import React, { useState, useEffect, useRef } from "react";

const defaultSettings = {
  levels: 12,
  rotation: 0,
  divisions: 360,
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

  const size = 800;
  const center = size / 2;
  const totalSectors = settings.divisions;
  const innerRadius = 60;
  const ringWidth = 28;
  const angleStep = (2 * Math.PI) / totalSectors;

  const getPathForCell = (level, index) => {
    const startAngle = index * angleStep + (settings.rotation * Math.PI / 180);
    const endAngle = startAngle + angleStep;

    const r1 = innerRadius + level * ringWidth;
    const r2 = r1 + ringWidth;

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
    <div style={{ textAlign: "center", marginTop: 20 }}>
      <h2 style={{ color: "#FFD700" }}>
        {settings.language === "ar"
          ? "دائرة Gann 360 (سحب وتحريك)"
          : "Gann 360 Circle (Draggable)"}
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
      </div>

      <svg
        width={size}
        height={size}
        style={{ background: "#111", cursor: isDragging ? "grabbing" : "grab" }}
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
          {[...Array(settings.levels)].map((_, level) =>
            [...Array(settings.divisions)].map((_, index) => {
              const value = level * settings.divisions + index + 1;
              const path = getPathForCell(level, index);

              const angle =
                (index + 0.5) * angleStep +
                (settings.rotation * Math.PI) / 180;
              const r = innerRadius + level * ringWidth + ringWidth / 2;
              const x = center + r * Math.cos(angle);
              const y = center + r * Math.sin(angle);

              const isGray = (level + index) % 2 === 0;
              const fontSize = Math.max(6, 11 - level * 0.3);

              return (
                <g key={`${level}-${index}`}>
                  <path
                    d={path}
                    fill={isGray ? "#f5f5f5" : "#ffffff"}
                    stroke="#ccc"
                    strokeWidth={0.5}
                  />
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
            })
          )}

          {[0, 90, 180, 270].map((deg) => {
            const rad = (deg - 90 + settings.rotation) * (Math.PI / 180);
            const x = center + (innerRadius + settings.levels * ringWidth) * Math.cos(rad);
            const y = center + (innerRadius + settings.levels * ringWidth) * Math.sin(rad);
            return (
              <line
                key={deg}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#FF0000"
                strokeWidth={1}
              />
            );
          })}
        </g>
      </svg>
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
