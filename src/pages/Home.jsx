import React, { useState, useRef } from "react";
import GannSquare from "../components/GannTools/GannSquareOfNine";
import GannSquareCustom from "../components/GannTools/GannSquareCustom";
import GannGrid from "../components/GannTools/GannGrid";
import GannFan from "../components/GannTools/GannFan";
import GannBox from "../components/GannTools/GannBox";
import GannSquare144 from "../components/GannTools/GannSquare144_Final";
import GannWheel from "../components/GannTools/GannWheel";
import GannCircle36 from "../components/GannTools/GannCircle36";
import GannCircle360Canvas from "../components/GannTools/GannCircle360Canvas";

const Home = () => {
  const [activeTool, setActiveTool] = useState("GannSquare144");
  const gannRef = useRef();

  // إزالة هوامش المتصفح الافتراضية
  React.useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    
    // تنظيف عند إلغاء التحميل
    return () => {
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.overflow = "";
      document.documentElement.style.margin = "";
      document.documentElement.style.padding = "";
    };
  }, []);

  // 🟡 تهيئة الإعدادات والمقياس هنا
  const defaultSettings = {
    levels: 8,
    rotation: 0,
    divisions: 36,
    startValue: 1,
    language: "ar",
    showDegreeRing: true,
  };
  const [settings, setSettings] = useState(defaultSettings);
  const [scale, setScale] = useState(1); // اجعل المقياس 1 افتراضيًا (بإمكانك تغييره)
  const [showZodiacRing, setShowZodiacRing] = useState(true);

  const renderControls = null; // إزالة جميع أزرار التحكم

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#222",
        overflow: "hidden",
        direction: "ltr",
        margin: 0, // إزالة أي margin
        padding: 0, // إزالة أي padding
        boxSizing: "border-box", // حساب صحيح للأبعاد
      }}
    >
      <h1 style={{ 
        textAlign: "center", 
        color: "gold", 
        fontSize: "2rem",
        margin: "10px 0", // تقليل margin العنوان
        padding: 0, // إزالة padding
      }}>
        كوكبة الأرقام السحرية
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px", // تقليل gap من 10px إلى 8px
          margin: "10px 0", // تقليل margin من 20px إلى 10px
          flexWrap: "wrap",
          padding: "0 5px", // إضافة padding صغير للجوانب فقط
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
          { key: "GannCircle36", label: "GannCircle36" },
          { key: "GannCircle360Canvas", label: "ساعة كوكبة تاسي 🌀" },
        ].map((tool) => (
          <button
            key={tool.key}
            onClick={() => setActiveTool(tool.key)}
            style={{
              backgroundColor: activeTool === tool.key ? "gold" : "#333",
              color: activeTool === tool.key ? "black" : "white",
              padding: "8px 16px", // تقليل padding من 10px 20px إلى 8px 16px
              borderRadius: "6px", // تقليل borderRadius من 8px إلى 6px
              border: "none",
              cursor: "pointer",
              fontSize: "14px", // تقليل حجم الخط قليلاً
            }}
          >
            {tool.label}
          </button>
        ))}
      </div>

      {renderControls}

      <div
        style={{
          width: "100%",
          height: "calc(100vh - 80px)", // تقليل من 120px إلى 80px لإزالة الهوامش الزائدة
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          padding: 0, // إزالة أي padding
          margin: 0, // إزالة أي margin
        }}
      >
        {activeTool === "GannSquare144" && <GannSquare144 />}
        {activeTool === "GannSquareCustom" && <GannSquareCustom />}
        {activeTool === "GannSquare" && <GannSquare />}
        {activeTool === "GannGrid" && <GannGrid />}
        {activeTool === "GannFan" && <GannFan />}
        {activeTool === "GannBox" && <GannBox />}
        {activeTool === "GannWheel" && <GannWheel ref={gannRef} />}
        {activeTool === "GannCircle36" && (
          <GannCircle36
            settings={settings}
            setSettings={setSettings}
            scale={scale}
            setScale={setScale}
            showZodiacRing={showZodiacRing}
          />
        )}
        {activeTool === "GannCircle360Canvas" && (
          <GannCircle360Canvas
      settings={settings}
      setSettings={setSettings}
      scale={scale}
      setScale={setScale}
            showZodiacRing={showZodiacRing}
          />
        )}
      </div>

      {activeTool === "GannWheel" && (
        <div style={{ 
          textAlign: "center", 
          marginTop: "10px", // تقليل من 20px إلى 10px
          padding: "0 10px", // إضافة padding للجوانب فقط
          marginBottom: "5px", // هامش صغير من الأسفل
        }}>
          <button
            onClick={() => gannRef.current?.syncWithChartPoint(200, 300)}
            style={{
              backgroundColor: "#444",
              color: "white",
              padding: "8px 16px", // تقليل padding من 10px 20px إلى 8px 16px
              borderRadius: "6px", // تقليل borderRadius من 8px إلى 6px
              border: "none",
              cursor: "pointer",
              fontSize: "14px", // تقليل حجم الخط
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