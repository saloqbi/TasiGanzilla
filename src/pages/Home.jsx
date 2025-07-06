import React, { useState, useRef } from "react";
import GannSquare from "../components/GannTools/GannSquareOfNine";
import GannSquareCustom from "../components/GannTools/GannSquareCustom";
import GannGrid from "../components/GannTools/GannGrid";
import GannFan from "../components/GannTools/GannFan";
import GannBox from "../components/GannTools/GannBox";
import GannSquare144 from "../components/GannTools/GannSquare144_Final";
import GannWheel from "../components/GannTools/GannWheel";

const Home = () => {
  const [activeTool, setActiveTool] = useState("GannSquare144");
  const gannRef = useRef(); // ✅ مرجع لعجلة Gann

  return (
    <div>
      <h1 style={{ textAlign: "center", color: "gold", fontSize: "2rem" }}>
        كوكبة الأرقام السحرية
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          margin: "20px 0",
          flexWrap: "wrap",
        }}
      >
        {[
          { key: "GannSquare144", label: "GannSquare144" },
          { key: "GannSquareCustom", label: "GannSquareCustom" },
          { key: "GannSquare", label: "GannSquare" },
          { key: "GannGrid", label: "GannGrid" },
          { key: "GannFan", label: "GannFan" },
          { key: "GannBox", label: "GannBox" },
          { key: "GannWheel", label: "GannWheel" },
        ].map((tool) => (
          <button
            key={tool.key}
            onClick={() => setActiveTool(tool.key)}
            style={{
              backgroundColor: activeTool === tool.key ? "gold" : "#333",
              color: activeTool === tool.key ? "black" : "white",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
            }}
          >
            {tool.label}
          </button>
        ))}
      </div>

      {activeTool === "GannSquare144" && <GannSquare144 />}
      {activeTool === "GannSquareCustom" && <GannSquareCustom />}
      {activeTool === "GannSquare" && <GannSquare />}
      {activeTool === "GannGrid" && <GannGrid />}
      {activeTool === "GannFan" && <GannFan />}
      {activeTool === "GannBox" && <GannBox />}
      {activeTool === "GannWheel" && <GannWheel ref={gannRef} />}

      {/* ✅ زر تجريبي لمزامنة المركز */}
      {activeTool === "GannWheel" && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            onClick={() =>
              gannRef.current?.syncWithChartPoint(200, 300)
            }
            style={{
              backgroundColor: "#444",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            🎯 مزامنة مع نقطة (200x / 300y)
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
