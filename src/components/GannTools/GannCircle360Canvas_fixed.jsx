import React, { useRef, useEffect, useState } from "react";

// مصفوفة الأبراج (دورة واحدة)
const zodiacBase = [
  { label: "نار الحمل", color: "red" },
  { label: "تراب الثور", color: "blue" },
  { label: "هواء الجوزاء", color: "black" },
  { label: "ماء السرطان", color: "red" },
  { label: "نار الاسد", color: "blue" },
  { label: "تراب السنبله", color: "black" },
  { label: "هواء الميزان", color: "red" },
  { label: "ماء العقرب", color: "blue" },
  { label: "نار القوس", color: "black" },
  { label: "تراب الجدي", color: "red" },
  { label: "هواء الدلو", color: "blue" },
  { label: "ماء الحوت", color: "black" },
];

// توليد 36 خلية (3 دورات)
const zodiacRing = [...zodiacBase, ...zodiacBase, ...zodiacBase];

const defaultRayColor = "#FFD700";

const getDefaultSettings = () => ({
  divisions: 36,
  levels: 8,
  startValue: 1,
  language: "ar",
  rotation: 0,
  showDegreeRing: true,
  showZodiacRing: true,
});

const GannCircle360Canvas = () => {
  const canvasRef = useRef(null);
  const [settings, setSettings] = useState(getDefaultSettings);
  const [showSettings, setShowSettings] = useState(true);
  const [canvasSize, setCanvasSize] = useState(1438);
  const [scale, setScale] = useState(1);
  const [showZoomControls, setShowZoomControls] = useState(false);

  // States for drawing options
  const [showDegreeRing, setShowDegreeRing] = useState(true);
  const [showZodiacRing, setShowZodiacRing] = useState(true);

  // States for angle wheel
  const [showAngleWheel, setShowAngleWheel] = useState(false);
  const [angleWheelRotation, setAngleWheelRotation] = useState(0);
  const [angleStepRad, setAngleStep] = useState(10);
  const [rayColor, setRayColor] = useState(defaultRayColor);
  const [rayWidth, setRayWidth] = useState(1);

  // Mouse interaction states
  const [isDraggingAngleWheel, setIsDraggingAngleWheel] = useState(false);
  const [dragStartAngle, setDragStartAngle] = useState(0);
  const [initialRotation, setInitialRotation] = useState(0);

  // Shape selection and rotation
  const [selectedShape, setSelectedShape] = useState("");
  const [triangleRotation, setTriangleRotation] = useState(0);
  const [isDraggingTriangle, setIsDraggingTriangle] = useState(false);
  const [draggingPointIndex, setDraggingPointIndex] = useState(-1);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Triangle states
  const [customAngles, setCustomAngles] = useState([90, 210, 330]);
  const [highlightTriangle, setHighlightTriangle] = useState(false);
  const [fillTriangle, setFillTriangle] = useState(false);

  // دوال مساعدة لحساب المواضع والزوايا
  const getMousePos = (e) => {
    console.log("🚨🚨🚨 NEW getMousePos function called! 🚨🚨🚨");
    
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    console.log(`🔧 getMousePos - clientX: ${e.clientX}, clientY: ${e.clientY}`);
    console.log(`🔧 rect: left=${rect.left}, top=${rect.top}, width=${rect.width}, height=${rect.height}`);
    console.log(`🔧 scale: scaleX=${scaleX}, scaleY=${scaleY}, scale=${scale}`);
    console.log(`🔧 calculated: x=${x}, y=${y}`);
    
    return { x, y };
  };

  const getAngleDeg = (cx, cy, px, py) => {
    if (arguments.length === 2) {
      px = cx;
      py = cy;
      cx = canvasSize / 2;
      cy = canvasSize / 2;
    }
    return (Math.atan2(py - cy, px - cx) * 180 / Math.PI + 360) % 360;
  };

  const getDistance = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  const getDistanceToLine = (px, py, x1, y1, x2, y2) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    if (lenSq === 0) return getDistance(px, py, x1, y1);
    let param = dot / lenSq;
    param = Math.max(0, Math.min(1, param));
    const xx = x1 + param * C;
    const yy = y1 + param * D;
    return getDistance(px, py, xx, yy);
  };

  // دوال التفاعل مع الماوس - خارج useEffect للوصول من Canvas
  const onMouseDown = (e) => {
    console.log("🚨🚨🚨 COMPLETELY NEW onMouseDown VERSION 2.0! 🚨🚨🚨");
    
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("❌ Canvas not found");
      return;
    }
    
    console.log("✅ Canvas found, proceeding...");
    
    const { x, y } = getMousePos(e);
    const center = canvasSize / 2;
    console.log(`🎯 Mouse position: (${x}, ${y}), Center: (${center}, ${center})`);
    
    // حساب بسيط جداً لعجلة الزوايا
    const simpleOuterRadius = center * 0.9; // 90% من نصف القطر
    const simpleInnerRadius = center * 0.7; // 70% من نصف القطر
    
    console.log(`🔥 SIMPLE radii - Inner: ${simpleInnerRadius}, Outer: ${simpleOuterRadius}`);
    console.log(`📊 showAngleWheel: ${showAngleWheel}, selectedShape: ${selectedShape}`);
    
    // حساب المسافة من المركز
    const distanceFromCenter = getDistance(x, y, center, center);
    console.log(`📏 Distance from center: ${distanceFromCenter}`);
    
    // التعامل مع عجلة الزوايا - فحص بسيط جداً
    if (showAngleWheel) {
      console.log("🔍 Checking angle wheel...");
      
      // فحص بسيط - هل النقر داخل منطقة عجلة الزوايا؟
      if (distanceFromCenter >= simpleInnerRadius && distanceFromCenter <= simpleOuterRadius) {
        console.log(`🎯🎯🎯 ANGLE WHEEL HIT! Distance: ${distanceFromCenter} 🎯🎯🎯`);
        setIsDraggingAngleWheel(true);
        setDragStartAngle(getAngleDeg(center, center, x, y));
        setInitialRotation(angleWheelRotation);
        console.log("✅ Angle wheel rotation started!");
        return;
      } else {
        console.log(`❌ MISS! Outside angle wheel. Distance: ${distanceFromCenter}, Need: ${simpleInnerRadius}-${simpleOuterRadius}`);
      }
    }

    // التعامل مع المثلث
    if (selectedShape === "triangle") {
      const r = center * 0.8;
      const trianglePoints = customAngles.map((deg) => {
        const rad = ((deg + triangleRotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      trianglePoints.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 15) {
          console.log(`🎯 Clicked on triangle point ${idx}`);
          setIsDraggingTriangle(true);
          setDragStartAngle(getAngleDeg(center, center, x, y));
          setInitialRotation(triangleRotation);
          return;
        }
      });
    }
  };

  const onMouseMove = (e) => {
    if (!isDraggingAngleWheel && !isDraggingTriangle) return;
    
    const { x, y } = getMousePos(e);
    const center = canvasSize / 2;
    
    if (isDraggingAngleWheel) {
      const currentAngle = getAngleDeg(center, center, x, y);
      const angleDiff = currentAngle - dragStartAngle;
      const newRotation = (initialRotation + angleDiff + 360) % 360;
      setAngleWheelRotation(newRotation);
      console.log(`🔄 Rotating angle wheel to: ${newRotation}°`);
    }
    
    if (isDraggingTriangle) {
      const currentAngle = getAngleDeg(center, center, x, y);
      const angleDiff = currentAngle - dragStartAngle;
      const newRotation = (initialRotation + angleDiff + 360) % 360;
      setTriangleRotation(newRotation);
      console.log(`🔄 Rotating triangle to: ${newRotation}°`);
    }
  };

  const onMouseUp = (e) => {
    if (isDraggingAngleWheel || isDraggingTriangle) {
      console.log("🛑 Mouse up - stopping rotation");
    }
    setIsDraggingAngleWheel(false);
    setIsDraggingTriangle(false);
    setDraggingPointIndex(-1);
  };

  // دالة الرسم الرئيسية
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;
    
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    const center = canvasSize / 2;

    // رسم الدوائر الأساسية
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(center, center, center - 50, 0, 2 * Math.PI);
    ctx.stroke();

    // رسم عجلة الزوايا
    if (showAngleWheel) {
      const outerRadius = center * 0.9;
      const innerRadius = center * 0.7;
      
      ctx.strokeStyle = rayColor;
      ctx.lineWidth = rayWidth;
      
      const totalRays = 360 / angleStepRad;
      for (let i = 0; i < totalRays; i++) {
        const angle = (i * angleStepRad + angleWheelRotation - 90) * Math.PI / 180;
        const startX = center + innerRadius * Math.cos(angle);
        const startY = center + innerRadius * Math.sin(angle);
        const endX = center + outerRadius * Math.cos(angle);
        const endY = center + outerRadius * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    }

    // رسم المثلث
    if (selectedShape === "triangle") {
      const r = center * 0.8;
      const points = customAngles.map((deg) => {
        const rad = ((deg + triangleRotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      ctx.strokeStyle = "#00CED1";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      
      if (fillTriangle) {
        ctx.fillStyle = "rgba(0, 206, 209, 0.2)";
        ctx.fill();
      }
      ctx.stroke();

      // رسم النقاط
      if (highlightTriangle) {
        points.forEach((point, idx) => {
          ctx.fillStyle = "#FF6B6B";
          ctx.beginPath();
          ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    }

  }, [canvasSize, settings, showAngleWheel, angleWheelRotation, angleStepRad, rayColor, rayWidth, selectedShape, triangleRotation, customAngles, fillTriangle, highlightTriangle]);

  // أنماط الأزرار والمدخلات
  const buttonStyle = {
    backgroundColor: "#333",
    color: "#FFD700",
    border: "1px solid #FFD700",
    borderRadius: "5px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "14px",
    marginBottom: "5px",
  };

  const inputStyle = {
    padding: "5px",
    margin: "5px 0",
    borderRadius: "3px",
    border: "1px solid #666",
    backgroundColor: "#444",
    color: "#FFF",
  };

  const toggleLang = () => {
    setSettings(prev => ({
      ...prev,
      language: prev.language === "ar" ? "en" : "ar"
    }));
  };

  // دوال مساعدة للوقت والتاريخ
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date, offset) => {
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const local = new Date(utc + (offset * 3600000));
    return local.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getGregorianDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getHijriDate = () => {
    try {
      return currentTime.toLocaleDateString('ar-SA-u-ca-islamic', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "تاريخ هجري";
    }
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'gann-circle.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#111",
      }}
    >
      <div style={{ padding: 10, flexShrink: 0 }}>
        {showZoomControls && (
          <div
            style={{
              position: "fixed",
              top: "220px",
              right: "10px",
              backgroundColor: "#222",
              border: "1px solid #FFD700",
              borderRadius: "10px",
              padding: "10px",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <button
              onClick={() => setScale((prev) => Math.min(prev + 0.1, 2))}
              style={{ ...buttonStyle, padding: "6px 12px", fontSize: "13px" }}
            >
              ➕ {settings.language === "ar" ? "تكبير" : "Zoom In"}
            </button>
            <button
              onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.1))}
              style={{ ...buttonStyle, padding: "6px 12px", fontSize: "13px" }}
            >
              ➖ {settings.language === "ar" ? "تصغير" : "Zoom Out"}
            </button>
            <div style={{ fontSize: "11px", color: "#FFD700", marginTop: "4px" }}>
              {(scale * 100).toFixed(0)}%
            </div>
          </div>
        )}

        <div style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          backgroundColor: "#222",
          padding: "8px 16px",
          borderRadius: "10px",
          border: "1px solid #FFD700",
          zIndex: 10,
        }}>
          <span
            style={{
              color: "#FFD700",
              fontSize: 20,
              fontWeight: "bold",
              whiteSpace: "nowrap",
            }}
          >
            {settings.language === "ar"
              ? "🌀 ساعة كوكبة تاسي"
              : "🌀 Gann 360 Circle"}
          </span>
          <button onClick={toggleLang} style={{ ...buttonStyle, fontSize: 13 }}>
            🌐 {settings.language === "ar" ? "English" : "العربية"}
          </button>
        </div>

        <div style={{
          position: "fixed",
          top: "10px",
          left: "10px",
          backgroundColor: "rgba(34,34,34,0.95)",
          padding: "8px 16px",
          borderRadius: "10px",
          border: "1px solid #FFD700",
          boxShadow: "0 0 10px rgba(255, 215, 0, 0.4)",
          display: "flex",
          flexDirection: "column",
          zIndex: 9999,
          minWidth: "200px",
          textAlign: "center",
          backdropFilter: "blur(2px)",
        }}>
          <div style={{ fontSize: "17px", color: "#00CED1", fontWeight: "bold" }}>
            {getGregorianDate()}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "4px",
              gap: "16px",
            }}
          >
            <div style={{ fontSize: "10px", color: "#00CED1" }}>
              GMT: {formatTime(currentTime, 0)}
            </div>
            <div style={{ fontSize: "10px", color: "#FFA500" }}>
              KSA: {formatTime(currentTime, 3)}
            </div>
          </div>
          <div style={{ fontSize: "10px", color: "#FFA500", marginTop: "3px", fontWeight: "bold" }}>
            {getHijriDate()}
          </div>
        </div>

        <div style={{
          position: "absolute",
          top: "160px",
          left: "0px",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          backgroundColor: "#222",
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid #FFD700",
          zIndex: 10,
        }}>
          <button
            onClick={() => setShowSettings((v) => !v)}
            style={{
              position: "fixed",
              top: "120px",
              left: "20px",
              width: "25px",
              height: "25px",
              borderRadius: "50%",
              backgroundColor: "#ffcc00",
              color: "#000",
              fontSize: "10px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 10px #000",
              zIndex: 9999
            }}
            title={showSettings ? "إخفاء الإعدادات" : "عرض الإعدادات"}
          >
            {showSettings ? "❌" : "⚙️"}
          </button>

          <button
            onClick={() => setShowZoomControls((prev) => !prev)}
            style={{
              position: "fixed",
              top: "180px",
              right: "10px",
              zIndex: 10000,
              backgroundColor: "#222",
              color: "#FFD700",
              border: "1px solid #FFD700",
              borderRadius: "8px",
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            {showZoomControls
              ? (settings.language === "ar" ? "إخفاء 🔽" : "Hide 🔽")
              : (settings.language === "ar" ? "التكبير 🔍" : "Zoom 🔍")}
          </button>

          {showSettings && (
            <>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <button onClick={handleExportPNG}>📷 حفظ الصورة</button>
                <button onClick={handleExportPDF}>📄 طباعة PDF</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700" }}>
                <label>
                  <input type="checkbox" checked={showAngleWheel} onChange={() => setShowAngleWheel(!showAngleWheel)} />
                  🧲 {settings.language === "ar" ? "إظهار عجلة الزوايا" : "Show Angle Wheel"}
                </label>
                {showAngleWheel && (
                  <>
                    <label>♻️ تدوير</label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={angleWheelRotation}
                      onChange={(e) => setAngleWheelRotation(parseFloat(e.target.value))}
                    />
                    <label>🧮 تكرار كل كم درجة؟</label>
                    <select
                      value={angleStepRad}
                      onChange={(e) => setAngleStep(parseInt(e.target.value))}
                      style={{ width: "100%", padding: "4px" }}
                    >
                      <option value={5}>كل 5° (72 شعاع)</option>
                      <option value={10}>كل 10° (36 شعاع)</option>
                      <option value={15}>كل 15° (24 شعاع)</option>
                      <option value={30}>كل 30° (12 شعاع)</option>
                    </select>
                    <label>🎨 لون الشعاع</label>
                    <input
                      type="color"
                      value={rayColor}
                      onChange={(e) => setRayColor(e.target.value)}
                      style={{ width: "60px", height: "25px" }}
                    />
                  </>
                )}
              </div>

              <div style={{ margin: "10px 0", textAlign: "center" }}>
                <label style={{ fontWeight: "bold", marginBottom: "5px", display: "block" }}>
                  اختيار الأشكال الهندسية:
                </label>
                <select
                  value={selectedShape}
                  onChange={(e) => setSelectedShape(e.target.value)}
                  style={{
                    padding: "6px",
                    fontSize: "16px",
                    width: "100%",
                  }}
                >
                  <option value="">-- اختر --</option>
                  <option value="triangle">🔺 إظهار المثلث</option>
                </select>
              </div>

              {selectedShape === "triangle" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700" }}>
                  <label>🎛 زوايا المثلث</label>
                  {customAngles.map((angle, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ minWidth: "60px" }}>زاوية {idx + 1}:</span>
                      <input
                        type="number"
                        min="0"
                        max="360"
                        value={angle}
                        onChange={(e) => {
                          const newAngles = [...customAngles];
                          newAngles[idx] = parseFloat(e.target.value) || 0;
                          setCustomAngles(newAngles);
                        }}
                        style={{ width: "80px", padding: "2px" }}
                      />
                    </div>
                  ))}
                  <label>♻️ تدوير المثلث</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={triangleRotation}
                    onChange={(e) => setTriangleRotation(parseFloat(e.target.value))}
                  />
                  <label>
                    <input type="checkbox" checked={highlightTriangle} onChange={() => setHighlightTriangle(!highlightTriangle)} />
                    تمييز الزوايا
                  </label>
                  <label>
                    <input type="checkbox" checked={fillTriangle} onChange={() => setFillTriangle(!fillTriangle)} />
                    تعبئة المثلث
                  </label>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "auto",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative"
        }}
      >
        <div
          style={{
            position: "relative",
            width: `${canvasSize}px`,
            height: `${canvasSize}px`,
            maxWidth: "min(95vw, 95vh)",
            maxHeight: "min(95vw, 95vh)",
            aspectRatio: "1/1"
          }}
        >
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onClick={() => console.log("Canvas clicked - basic test")}
          style={{
            display: "block",
            background: "transparent",
            width: "100%",
            height: "100%",
            aspectRatio: "1/1"
          }}
        ></canvas>
        </div>
      </div>
    </div>
  );
};

export default GannCircle360Canvas;
