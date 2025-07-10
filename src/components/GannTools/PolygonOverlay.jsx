import React, { useState, useEffect } from "react";

const PolygonOverlay = ({
  center = 250,
  outerRadius = 400,
  drag = { x: 0, y: 0 },
  zoom = 1,
  rotation = 0,
}) => {
  const [visible, setVisible] = useState(true);
  const [highlight, setHighlight] = useState(true);
  const [points, setPoints] = useState([]);

  useEffect(() => {
    const baseAngles = [0, 120, 240];
    const newPoints = baseAngles.map((base) => {
      const deg = base + rotation;
      const rad = (deg * Math.PI) / 180;
      const x = center + outerRadius * Math.cos(rad);
      const y = center + outerRadius * Math.sin(rad);
      return { x, y };
    });
    setPoints(newPoints);
  }, [outerRadius, center, rotation]);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      {/* لوحة التحكم */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          background: "#222",
          padding: 10,
          borderRadius: 10,
          color: "white",
          border: "1px solid gold",
          zIndex: 9999,
          pointerEvents: "auto",
        }}
      >
        <label>
          <input
            type="checkbox"
            checked={visible}
            onChange={() => setVisible(!visible)}
          />
          Show Triangle
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={highlight}
            onChange={() => setHighlight(!highlight)}
          />
          Show Highlight
        </label>
      </div>

      {/* رسم المثلث */}
      <svg
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 999,
          pointerEvents: "none",
        }}
      >
        <g
          transform={`
            translate(${drag.x}, ${drag.y})
            scale(${zoom})
            translate(${(1 - zoom) * center}, ${(1 - zoom) * center})
          `}
        >
          {visible && (
            <>
              <polygon
                points={points.map((p) => `${p.x},${p.y}`).join(" ")}
                fill={highlight ? "rgba(0,255,0,0.2)" : "none"}
                stroke="lime"
                strokeWidth={2}
              />
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={5}
                  fill="yellow"
                  stroke="black"
                  strokeWidth={1}
                />
              ))}
            </>
          )}
        </g>
      </svg>
    </div>
  );
};

export default PolygonOverlay;
