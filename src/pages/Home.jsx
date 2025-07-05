
import React, { useState } from "react";
import GannSquare from "../components/GannTools/GannSquareOfNine";
import GannSquareCustom from "../components/GannTools/GannSquareCustom";
import GannGrid from "../components/GannTools/GannGrid";
import GannFan from "../components/GannTools/GannFan";
import GannBox from "../components/GannTools/GannBox";
import GannSquare144 from "../components/GannTools/GannSquare144_Final";
import GannWheel from "../components/GannTools/GannWheel"; // ✅ تصحيح الاسم

const Home = () => {
  const [activeTool, setActiveTool] = useState("GannSquare144");

  return (
    <div>
      <h1 style={{ textAlign: "center", color: "gold", fontSize: "2rem" }}>
        كوكبة الأرقام السحرية
      </h1>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", margin: "20px 0", flexWrap: "wrap" }}>
        <button onClick={() => setActiveTool("GannSquare144")} style={{ backgroundColor: activeTool === "GannSquare144" ? "gold" : "#333", color: activeTool === "GannSquare144" ? "black" : "white", padding: "10px 20px", borderRadius: "8px", border: "none" }}>GannSquare144</button>
        <button onClick={() => setActiveTool("GannSquareCustom")} style={{ backgroundColor: activeTool === "GannSquareCustom" ? "gold" : "#333", color: activeTool === "GannSquareCustom" ? "black" : "white", padding: "10px 20px", borderRadius: "8px", border: "none" }}>GannSquareCustom</button>
        <button onClick={() => setActiveTool("GannSquare")} style={{ backgroundColor: activeTool === "GannSquare" ? "gold" : "#333", color: activeTool === "GannSquare" ? "black" : "white", padding: "10px 20px", borderRadius: "8px", border: "none" }}>GannSquare</button>
        <button onClick={() => setActiveTool("GannGrid")} style={{ backgroundColor: activeTool === "GannGrid" ? "gold" : "#333", color: activeTool === "GannGrid" ? "black" : "white", padding: "10px 20px", borderRadius: "8px", border: "none" }}>GannGrid</button>
        <button onClick={() => setActiveTool("GannFan")} style={{ backgroundColor: activeTool === "GannFan" ? "gold" : "#333", color: activeTool === "GannFan" ? "black" : "white", padding: "10px 20px", borderRadius: "8px", border: "none" }}>GannFan</button>
        <button onClick={() => setActiveTool("GannBox")} style={{ backgroundColor: activeTool === "GannBox" ? "gold" : "#333", color: activeTool === "GannBox" ? "black" : "white", padding: "10px 20px", borderRadius: "8px", border: "none" }}>GannBox</button>
        <button onClick={() => setActiveTool("GannWheel")} style={{ backgroundColor: activeTool === "GannWheel" ? "gold" : "#333", color: activeTool === "GannWheel" ? "black" : "white", padding: "10px 20px", borderRadius: "8px", border: "none" }}>GannWheel</button>
      </div>

      {activeTool === "GannSquare144" && <GannSquare144 />}
      {activeTool === "GannSquareCustom" && <GannSquareCustom />}
      {activeTool === "GannSquare" && <GannSquare />}
      {activeTool === "GannGrid" && <GannGrid />}
      {activeTool === "GannFan" && <GannFan />}
      {activeTool === "GannBox" && <GannBox />}
      {activeTool === "GannWheel" && <GannWheel />}
    </div>
  );
};

export default Home;
