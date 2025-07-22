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
});

const GannCircle360CanvasFixed = () => {
  // دالة مساعدة لحساب عرض الحلقة المحسن
  const calculateRingWidth = (maxDigits, baseWidth = 100, digitScale = 20, padding = 16) => {
    return Math.max(
      baseWidth + maxDigits * digitScale + padding * 2,
      90 // حد أدنى لعرض الحلقة
    );
  };

  // States أساسية
  const [scale, setScale] = useState(1);
  const [showZodiacRing, setShowZodiacRing] = useState(true);
  const [showWeekDaysRing, setShowWeekDaysRing] = useState(true);
  const [showDegreeRing, setShowDegreeRing] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showZoomControls, setShowZoomControls] = useState(true);
  const [settings, setSettings] = useState(getDefaultSettings());
  
  // States للساعة الرقمية
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeZone, setTimeZone] = useState('riyadh');
  const [showDigitalClock, setShowDigitalClock] = useState(true);

  // عجلة الزوايا والأشكال الهندسية
  const [showAngleWheel, setShowAngleWheel] = useState(false);
  const [angleWheelRotation, setAngleWheelRotation] = useState(0);
  const [angleStepRad, setAngleStep] = useState(10);
  const [rayColor, setRayColor] = useState(defaultRayColor);
  const [rayWidth, setRayWidth] = useState(2);
  const [selectedShape, setSelectedShape] = useState("");
  const [showAngleWheelAngles, setShowAngleWheelAngles] = useState(true);

  // خصائص إضافية
  const [zoom, setZoom] = useState(1);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [recentlyDragged, setRecentlyDragged] = useState(false);
  const [clickStates, setClickStates] = useState({});
  const [cellColors, setCellColors] = useState([]);
  const [cellClickCounts, setCellClickCounts] = useState({});
  
  // أشكال هندسية بسيطة
  const [showTriangle, setShowTriangle] = useState(false);
  const [showSquare, setShowSquare] = useState(false);
  const [showPentagon, setShowPentagon] = useState(false);
  const [showHexagon, setShowHexagon] = useState(false);
  const [showOctagon, setShowOctagon] = useState(false);

  // شكل المثلث
  const [customAngles, setCustomAngles] = useState([0, 120, 240]);
  const [triangleRotation, setTriangleRotation] = useState(0);
  const [highlightTriangle, setHighlightTriangle] = useState(false);
  const [fillTriangle, setFillTriangle] = useState(false);
  const [isDraggingTriangle, setIsDraggingTriangle] = useState(false);

  // متغيرات عجلة الزوايا للتدوير
  const [isDraggingAngleWheel, setIsDraggingAngleWheel] = useState(false);

  // الوقت والتواريخ
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  
  // دالة للحصول على الوقت حسب المنطقة المحددة
  const getTimeByZone = () => {
    if (timeZone === 'utc') {
      return new Date().toLocaleTimeString('en-GB', { 
        timeZone: 'UTC',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } else {
      return new Date().toLocaleTimeString('en-GB', { 
        timeZone: 'Asia/Riyadh',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
  };

  // دوال الألوان واختزال الرقم
  const reduceToDigit = (num) => {
    let numStr = num.toString().replace('.', '');
    let current = numStr.split("").reduce((a, b) => a + Number(b), 0);
    
    while (current > 9) {
      current = current.toString().split("").reduce((a, b) => a + Number(b), 0);
    }
    return current;
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

  // الحسابات الأساسية
  const canvasRectRef = useRef(null);
  const canvasRef = useRef();
  const innerRadius = 60;
  const baseRingWidth = 100;
  const digitScale = 20;
  const minCellPadding = 16;
  
  // حساب أرقام البداية لكل حلقة
  const totalLevels = settings.levels + 2;
  const ringStartNumbers = [];

  // للحلقات الأولى والثانية (فارغة من الأرقام)
  ringStartNumbers[0] = null;
  ringStartNumbers[1] = null;

  // للحلقة الثالثة وما بعدها
  for (let level = 2; level < totalLevels; level++) {
    if (level === 2) {
      ringStartNumbers[level] = settings.startValue;
    } else {
      const previousRingEnd = ringStartNumbers[level - 1] + settings.divisions - 1;
      let nextStart = previousRingEnd + 1;
      while (reduceToDigit(nextStart) !== 1) {
        nextStart++;
      }
      ringStartNumbers[level] = nextStart;
    }
  }

  // حساب نصف قطر آخر حلقة
  let calculatedLastRadius = innerRadius;
  for (let level = 0; level < totalLevels; level++) {
    const maxDigitsInLevel = Math.max(
      ...Array.from({ length: settings.divisions }, (_, i) => {
        const cellValue = level < 2 ? 0 : ringStartNumbers[level] + i;
        return cellValue > 0 ? parseFloat(cellValue.toFixed(2)).toString().length : 1;
      })
    );
    const dynamicWidth = calculateRingWidth(maxDigitsInLevel);
    calculatedLastRadius += dynamicWidth;
  }
  const lastNumberRingRadius = calculatedLastRadius;
  
  // حلقة الدرجات تأتي بعد حلقات الأرقام مع مسافة أكبر
  const degreeRingRadius = lastNumberRingRadius + 35;
  
  // عجلة الزوايا تأتي بعد حلقة الدرجات مع مسافة أكبر
  const angleWheelInnerRadius = degreeRingRadius + 60;
  const angleWheelOuterRadius = angleWheelInnerRadius + 55;
  
  // حلقة الأبراج تأتي بعد عجلة الزوايا أو بعد حلقة الدرجات مباشرة
  const zodiacInnerRadius = showAngleWheel ? angleWheelOuterRadius + 15 : degreeRingRadius + 40;
  const zodiacOuterRadius = zodiacInnerRadius + 45;
  
  // حلقة أيام الأسبوع تأتي بعد حلقة الأبراج
  const weekDaysInnerRadius = zodiacOuterRadius + 30;
  const weekDaysOuterRadius = weekDaysInnerRadius + 60;
  
  // حساب أكبر قطر مطلوب
  let mainCircleRadius = showAngleWheel ? angleWheelOuterRadius : zodiacOuterRadius;
  if (showWeekDaysRing) {
    mainCircleRadius = weekDaysOuterRadius;
  }
  
  // هامش حول الدائرة
  const svgPadding = 280;
  const canvasSize = mainCircleRadius * 2 + svgPadding * 2;

  // استايلات
  const buttonStyle = {
    background: "#333",
    color: "#FFD700",
    border: "1px solid #FFD700",
    borderRadius: "8px",
    padding: "8px 16px",
    margin: "3px 0",
    cursor: "pointer",
    fontWeight: "bold",
  };

  // اللغة
  const toggleLang = () => {
    setSettings((prev) => ({
      ...prev,
      language: prev.language === "ar" ? "en" : "ar",
    }));
  };

  // useEffect للرسم
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const center = canvasSize / 2;
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    const uniformScale = dpr * scale;
    ctx.scale(uniformScale, uniformScale);
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // رسم الخلفية
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // رسم حلقات الأرقام
    for (let level = 0; level < totalLevels; level++) {
      let currentRadius = innerRadius;
      
      // حساب نصف القطر لهذه الحلقة
      for (let l = 0; l < level; l++) {
        const maxDigits = Math.max(
          ...Array.from({ length: settings.divisions }, (_, i) => {
            const value = l < 2 ? 0 : ringStartNumbers[l] + i;
            return value > 0 ? value.toString().length : 1;
          })
        );
        currentRadius += calculateRingWidth(maxDigits);
      }

      if (level >= 2) {
        // رسم الخلايا
        for (let i = 0; i < settings.divisions; i++) {
          const cellValue = ringStartNumbers[level] + i;
          const digit = reduceToDigit(cellValue);
          const centerAngleDeg = -90 + (i * 360) / settings.divisions;
          const angleRad = (centerAngleDeg * Math.PI) / 180;
          
          const cellKey = `${level}-${i}`;
          const clicks = cellClickCounts[cellKey] || 0;
          
          const innerR = currentRadius;
          const maxDigits = Math.max(
            ...Array.from({ length: settings.divisions }, (_, idx) => {
              const val = ringStartNumbers[level] + idx;
              return val.toString().length;
            })
          );
          const outerR = innerR + calculateRingWidth(maxDigits);
          const midR = (innerR + outerR) / 2;
          
          // رسم الخلية
          ctx.save();
          ctx.beginPath();
          ctx.arc(center, center, outerR, angleRad - Math.PI / settings.divisions, angleRad + Math.PI / settings.divisions);
          ctx.arc(center, center, innerR, angleRad + Math.PI / settings.divisions, angleRad - Math.PI / settings.divisions, true);
          ctx.closePath();
          
          ctx.fillStyle = getCellBackgroundColor(cellKey, clicks);
          ctx.fill();
          ctx.strokeStyle = "#444";
          ctx.lineWidth = 1;
          ctx.stroke();
          
          // رسم النص
          const x = center + midR * Math.cos(angleRad);
          const y = center + midR * Math.sin(angleRad);
          
          ctx.fillStyle = getDigitColor(digit);
          ctx.font = "bold 16px Tahoma";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(cellValue.toString(), x, y);
          ctx.restore();
        }
      }
    }

    // رسم حلقة الدرجات إذا كانت مفعلة
    if (showDegreeRing) {
      ctx.save();
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(center, center, degreeRingRadius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();

      // رسم أرقام الدرجات
      for (let i = 0; i < 36; i++) {
        const degree = i * 10;
        const angleRad = ((degree - 90) * Math.PI) / 180;
        const x = center + degreeRingRadius * Math.cos(angleRad);
        const y = center + degreeRingRadius * Math.sin(angleRad);
        
        ctx.save();
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(degree.toString(), x, y);
        ctx.restore();
      }
    }

    // رسم حلقة الأبراج إذا كانت مفعلة
    if (showZodiacRing) {
      for (let i = 0; i < 36; i++) {
        const zodiac = zodiacRing[i];
        const centerAngleDeg = -90 + 10 + i * 10;
        const angleRad = (centerAngleDeg * Math.PI) / 180;
        
        const midR = (zodiacInnerRadius + zodiacOuterRadius) / 2;
        const x = center + midR * Math.cos(angleRad);
        const y = center + midR * Math.sin(angleRad);
        
        ctx.save();
        ctx.fillStyle = zodiac.color;
        ctx.font = "bold 10px Tahoma";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(zodiac.label, x, y);
        ctx.restore();
      }
      
      // حدود حلقة الأبراج
      ctx.save();
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(center, center, zodiacInnerRadius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(center, center, zodiacOuterRadius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();
    }

    // رسم حلقة أيام الأسبوع إذا كانت مفعلة
    if (showWeekDaysRing) {
      const weekDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const sectorsPerDay = Math.floor(36 / 7);
      
      for (let i = 0; i < 7; i++) {
        const centerAngleDeg = -90 + i * (360 / 7);
        const angleRad = (centerAngleDeg * Math.PI) / 180;
        
        const midR = (weekDaysInnerRadius + weekDaysOuterRadius) / 2;
        const x = center + midR * Math.cos(angleRad);
        const y = center + midR * Math.sin(angleRad);
        
        ctx.save();
        ctx.fillStyle = "#00CED1";
        ctx.font = "bold 14px Tahoma";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(weekDays[i], x, y);
        ctx.restore();
      }
      
      // حدود حلقة أيام الأسبوع
      ctx.save();
      ctx.strokeStyle = "#00CED1";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(center, center, weekDaysInnerRadius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(center, center, weekDaysOuterRadius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();
    }

    // رسم عجلة الزوايا إذا كانت مفعلة
    if (showAngleWheel) {
      ctx.save();
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 2.5;
      ctx.fillStyle = "#f5f5dc";
      ctx.beginPath();
      ctx.arc(center, center, angleWheelOuterRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(center, center, angleWheelInnerRadius, 0, 2 * Math.PI);
      ctx.stroke();

      // رسم خطوط التقسيم وأرقام الزوايا
      for (let i = 0; i < 36; i++) {
        const centerAngleDeg = -90 + 10 + i * 10;
        const angleRad = (centerAngleDeg * Math.PI) / 180;
        
        // خطوط التقسيم
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(center + angleWheelInnerRadius * Math.cos(angleRad), center + angleWheelInnerRadius * Math.sin(angleRad));
        ctx.lineTo(center + angleWheelOuterRadius * Math.cos(angleRad), center + angleWheelOuterRadius * Math.sin(angleRad));
        ctx.stroke();
        
        if (showAngleWheelAngles) {
          const angle = (i * 10 + angleWheelRotation) % 360;
          const midR = (angleWheelInnerRadius + angleWheelOuterRadius) / 2;
          const x = center + midR * Math.cos(angleRad);
          const y = center + midR * Math.sin(angleRad);
          
          ctx.fillStyle = "#000";
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 1.5;
          ctx.font = "bold 14px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.strokeText(angle.toString() + "°", x, y);
          ctx.fillText(angle.toString() + "°", x, y);
        }
      }
      ctx.restore();
    }

  }, [canvasSize, settings, scale, showDegreeRing, showZodiacRing, showWeekDaysRing, showAngleWheel, angleWheelRotation, showAngleWheelAngles, cellClickCounts]);

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
      {/* العنوان والأزرار */}
      <div style={{ padding: 10, flexShrink: 0 }}>
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
          <span style={{ color: "#FFD700", fontSize: 20, fontWeight: "bold" }}>
            {settings.language === "ar" ? "🌀 ساعة كوكبة تاسي" : "🌀 Gann 360 Circle"}
          </span>
          <button onClick={toggleLang} style={{ ...buttonStyle, fontSize: 13 }}>
            🌐 {settings.language === "ar" ? "English" : "العربية"}
          </button>
        </div>

        {/* أزرار الإعدادات */}
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
          <button onClick={() => setShowSettings((v) => !v)} style={{
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
          }}>
            {showSettings ? "❌" : "⚙️"}
          </button>

          {showSettings && (
            <>
              <button onClick={() => setShowDegreeRing((v) => !v)} style={buttonStyle}>
                🧭 {showDegreeRing ? "إخفاء حلقة الدرجات" : "إظهار حلقة الدرجات"}
              </button>
              <button onClick={() => setShowZodiacRing((v) => !v)} style={buttonStyle}>
                ♈ {showZodiacRing ? "إخفاء الأبراج" : "إظهار الأبراج"}
              </button>
              <button onClick={() => setShowWeekDaysRing((v) => !v)} style={buttonStyle}>
                📅 {showWeekDaysRing ? "إخفاء أيام الأسبوع" : "إظهار أيام الأسبوع"}
              </button>
              <button onClick={() => setShowAngleWheel(!showAngleWheel)} style={buttonStyle}>
                🧲 {showAngleWheel ? "إخفاء عجلة الزوايا" : "إظهار عجلة الزوايا"}
              </button>
              
              {showAngleWheel && (
                <div style={{ marginLeft: "20px" }}>
                  <label style={{ color: "#FFD700", display: "block", marginBottom: "5px" }}>
                    <input 
                      type="checkbox" 
                      checked={showAngleWheelAngles} 
                      onChange={() => setShowAngleWheelAngles(!showAngleWheelAngles)} 
                    />
                    إظهار أرقام الزوايا
                  </label>
                  <label style={{ color: "#FFD700", display: "block", marginBottom: "5px" }}>
                    تدوير عجلة الزوايا: {angleWheelRotation}°
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="360" 
                    step="10"
                    value={angleWheelRotation}
                    onChange={(e) => setAngleWheelRotation(parseInt(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>
              )}
              
              <div style={{ marginTop: "10px" }}>
                <label style={{ color: "#FFD700", display: "block", marginBottom: "5px" }}>
                  بداية الترقيم: {settings.startValue}
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={settings.startValue}
                  onChange={(e) => setSettings(prev => ({ ...prev, startValue: parseFloat(e.target.value) || 0 }))}
                  style={{ width: "100%", background: "#1a1a1a", color: "#FFD700", border: "1px solid #FFD700", borderRadius: "4px", padding: "5px" }}
                />
              </div>

              <div style={{ marginTop: "10px" }}>
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
            </>
          )}
        </div>

        {/* أدوات التكبير */}
        <div style={{
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
        }}>
          <button
            onClick={() => setScale((prev) => Math.min(prev + 0.1, 2))}
            style={{ ...buttonStyle, padding: "6px 12px", fontSize: "13px" }}
          >
            ➕ تكبير
          </button>
          <button
            onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.1))}
            style={{ ...buttonStyle, padding: "6px 12px", fontSize: "13px" }}
          >
            ➖ تصغير
          </button>
          <div style={{ fontSize: "11px", color: "#FFD700", marginTop: "4px" }}>
            {(scale * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Canvas الدائرة */}
      <div style={{
        width: "100%",
        height: "100%",
        overflow: "auto",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative"
      }}>
        <div style={{
          position: "relative",
          width: `${canvasSize}px`,
          height: `${canvasSize}px`,
          maxWidth: "min(95vw, 95vh)",
          maxHeight: "min(95vw, 95vh)",
          aspectRatio: "1/1"
        }}>
          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            style={{
              display: "block",
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

export default GannCircle360CanvasFixed;
