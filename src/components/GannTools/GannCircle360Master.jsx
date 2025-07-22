import React, { useState } from "react";
import GannCircle360Canvas from "../components/GannCircle360Canvas";

const defaultSettings = {
  levels: 8,
  rotation: 0,
  divisions: 360,
  startValue: 1,
  language: "ar",
};

const GannCircle360Master = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [scale, setScale] = useState(1); // ← عدل هنا

  return (
    <div>
      <GannCircle360Canvas
        settings={settings}
        setSettings={setSettings}
        scale={scale}
        setScale={setScale}
      />
    </div>
  );
};
export default GannCircle360Master;