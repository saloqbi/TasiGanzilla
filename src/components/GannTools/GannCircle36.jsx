
import React, { useState, useEffect, useRef } from "react";


const defaultSettings = {
  levels: 8,
  rotation: 0,
  divisions: 360,
  startValue: 1,
  language: "ar",
};

const GannCircle360 = () => {
const [currentTime, setCurrentTime] = useState(new Date());

  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem("gannCircle360Settings");
return stored ? JSON.parse(stored) : defaultSettings;

  });

  const [zoom, setZoom] = useState(1);
   const [scale, setScale] = useState(0.3); // ⬅️ يبدأ من 0.2x
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
   const [clickStates, setClickStates] = useState({});
     const [showTriangle, setShowTriangle] = useState(false);
     const [triangleRotation, setTriangleRotation] = useState(0);
     const [customAngles, setCustomAngles] = useState([0, 120, 240]);
     const [highlightTriangle, setHighlightTriangle] = useState(true);
     const [fillTriangle, setFillTriangle] = useState(true);
const [showSquare, setShowSquare] = useState(false);
// 🔷 شكل خماسي
const [showPentagon, setShowPentagon] = useState(false);
const [pentagonRotation, setPentagonRotation] = useState(0);
const [customPentagonAngles, setCustomPentagonAngles] = useState([0, 72, 144, 216, 288]);
const [highlightPentagon, setHighlightPentagon] = useState(true);
const [fillPentagon, setFillPentagon] = useState(true);

// ⭐ نجمة
const [showStar, setShowStar] = useState(false);
const [starRotation, setStarRotation] = useState(0);
const [customStarAngles, setCustomStarAngles] = useState([0, 144, 288, 72, 216]);
const [highlightStar, setHighlightStar] = useState(true);
const [fillStar, setFillStar] = useState(true);

const [squareRotation, setSquareRotation] = useState(0);
const [customSquareAngles, setCustomSquareAngles] = useState([0, 90, 180, 270]);
const [highlightSquare, setHighlightSquare] = useState(true);
const [fillSquare, setFillSquare] = useState(true);

{/* 🔷 شكل السداسي */}
const [showHexagon, setShowHexagon] = useState(false);
const [hexagonRotation, setHexagonRotation] = useState(0);
const [customHexagonAngles, setCustomHexagonAngles] = useState([0, 60, 120, 180, 240, 300]);
const [highlightHexagon, setHighlightHexagon] = useState(true);
const [fillHexagon, setFillHexagon] = useState(true);

{/* ⭐  النجمة السداسية */}

const [showHexagram, setShowHexagram] = useState(false);
const [hexagramRotation, setHexagramRotation] = useState(0);
const [customHexagramAngles, setCustomHexagramAngles] = useState([0, 60, 120, 180, 240, 300]);
const [highlightHexagram, setHighlightHexagram] = useState(true);
const [fillHexagram, setFillHexagram] = useState(true);

// 🧿 مثمن
const [showOctagon, setShowOctagon] = useState(false);
const [octagonRotation, setOctagonRotation] = useState(0);
const [customOctagonAngles, setCustomOctagonAngles] = useState([0, 45, 90, 135, 180, 225, 270, 315]);
const [highlightOctagon, setHighlightOctagon] = useState(true);
const [fillOctagon, setFillOctagon] = useState(true);

// ⭐ نجمة مثمنة
const [showStarOctagon, setShowStarOctagon] = useState(false);
const [starOctagonRotation, setStarOctagonRotation] = useState(0);
const [customStarOctagonAngles, setCustomStarOctagonAngles] = useState([0, 90, 180, 270, 45, 135, 225, 315]);
const [highlightStarOctagon, setHighlightStarOctagon] = useState(true);
const [fillStarOctagon, setFillStarOctagon] = useState(true);

// 🧲 دائرة الزوايا (Wheel of 36 Rays)
const [showAngleWheel, setShowAngleWheel] = useState(false);
const [angleWheelRotation, setAngleWheelRotation] = useState(0);
const [rayColor, setRayColor] = useState("#FF0000"); // أحمر افتراضي
const [rayWidth, setRayWidth] = useState(1);
const [angleStepRad, setAngleStep] = useState(10); // خطوة الزاوية

// 🟡 الدوائر المتداخلة
const [showNestedCircles, setShowNestedCircles] = useState(false);
const [nestedCircleCount, setNestedCircleCount] = useState(6);
const [nestedCircleGap, setNestedCircleGap] = useState(20);
const [nestedCircleColor, setNestedCircleColor] = useState("#EE82EE");
const [nestedCircleLabels, setNestedCircleLabels] = useState(true);
const [useGradientColor, setUseGradientColor] = useState(true);
const [nestedOpacity, setNestedOpacity] = useState(0.5);
const [nestedStrokeWidth, setNestedStrokeWidth] = useState(1.2);
const [nestedDashStyle, setNestedDashStyle] = useState("solid"); // solid | dashed
// ⏱ ربط زمني بالدورات
const [showTimeLabels, setShowTimeLabels] = useState(false); // عرض النصوص الزمنية
const [timeStepDays, setTimeStepDays] = useState(7);         // عدد الأيام لكل دائرة
// 🔁 تكرار تلقائي بنمط هندسي داخل كل دائرة
const [showRepeatedPattern, setShowRepeatedPattern] = useState(false);
const [patternShape, setPatternShape] = useState("triangle"); // triangle | square | star
const [patternRotation, setPatternRotation] = useState(0);
const [patternFill, setPatternFill] = useState(true);
const [patternColor, setPatternColor] = useState("#00CED1");
const [selectedPatternIndex, setSelectedPatternIndex] = useState(null);






   const dragStart = useRef({ x: 0, y: 0 });
     const offsetStart = useRef({ x: 0, y: 0 });


  useEffect(() => {
    localStorage.setItem("gannCircle360Settings", JSON.stringify(settings));
  }, [settings]);

useEffect(() => {
  const interval = setInterval(() => {
    setCurrentTime(new Date());
  }, 1000);
  return () => clearInterval(interval);
}, []);

const getGregorianDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // مثل: 2025-07-08
};

const getHijriDate = () => {
  return new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
};


const formatTime = (date, offset = 0) => {
  const local = new Date(date.getTime() + offset * 60 * 60 * 1000);
  return local.toLocaleTimeString("en-GB", { hour12: false });
};



  const totalSectors = settings.divisions;
  const innerRadius = 60;

  const angleStep = (2 * Math.PI) / totalSectors;
  const baseRingWidth = 35;
  const digitScale = 8;


const dynamicSize = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5 );
const center = dynamicSize / 2;
const [offset, setOffset] = useState({ x: dynamicSize / 2, y: dynamicSize / 2 });


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
const reduceToDigit = (num) => {
  let current = num;
  while (current > 9) {
    current = current
      .toString()
      .split("")
      .reduce((a, b) => a + Number(b), 0);
  }
  return current;
};

const getCellColor = (digit) => {
  if ([1, 4, 7].includes(digit)) return "red";
  if ([2, 5, 8].includes(digit)) return "blue";
  if ([3, 6, 9].includes(digit)) return "black";
  return "#fff";
};


const getDigitColor = (digit) => {
  if ([1, 4, 7].includes(digit)) return "red";
  if ([2, 5, 8].includes(digit)) return "blue";
  if ([3, 6, 9].includes(digit)) return "black";
  return "#000"; // افتراضي (احتياط)
};

const getClickColor = (value) => {
  const clicks = clickStates[value] || 0;
  if (clicks === 1) return "#90ee90";
  if (clicks === 2) return "pink";
  if (clicks === 3) return "#ffff99";
  if (clicks >= 4) return "gray";
  return null;
};
const handleCellClick = (value) => {
  setClickStates((prev) => {
    const current = prev[value] || 0;
    const next = current >= 4 ? 0 : current + 1;
    return { ...prev, [value]: next };
  });
};

  const rotateLeft = () =>
  setSettings((prev) => ({
    ...prev,
    rotation: (prev.rotation - 10 + 360) % 360,
  }));

const rotateRight = () =>
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
  dragStart.current = { x: e.clientX, y: e.clientY };
  offsetStart.current = { ...offset };
};

const handleMouseMove = (e) => {
  if (!isDragging) return;
  const dx = e.clientX - dragStart.current.x;
  const dy = e.clientY - dragStart.current.y;
  setOffset({
    x: offsetStart.current.x + dx,
    y: offsetStart.current.y + dy,
  });
};

const handleMouseUp = () => {
  setIsDragging(false);
};
const zodiacLabels = [
  { label: "نار الحمل", color: "red" },
  { label: "تراب التراب", color: "blue" },
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

const RenderZodiacRing = () => {
  const zodiacCount = 12;
  const radiusOuter = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5) + 50;
  const radiusInner = radiusOuter - 50; // سمك الخلية

  return (
    <g>
      {[...Array(zodiacCount)].map((_, index) => {
        const startAngle = (index * 360) / zodiacCount;
        const endAngle = ((index + 1) * 360) / zodiacCount;

        const startRad = (startAngle + settings.rotation) * (Math.PI / 180);
        const endRad = (endAngle + settings.rotation) * (Math.PI / 180);
        const midRad = ((startAngle + endAngle) / 2 + settings.rotation) * (Math.PI / 180);

        // نقاط الزاوية
        const x1 = center + radiusInner * Math.cos(startRad);
        const y1 = center + radiusInner * Math.sin(startRad);
        const x2 = center + radiusOuter * Math.cos(startRad);
        const y2 = center + radiusOuter * Math.sin(startRad);
        const x3 = center + radiusOuter * Math.cos(endRad);
        const y3 = center + radiusOuter * Math.sin(endRad);
        const x4 = center + radiusInner * Math.cos(endRad);
        const y4 = center + radiusInner * Math.sin(endRad);

        // اسم البرج
        const zodiacIndex = index % 12;
        const { label, color } = zodiacLabels[zodiacIndex];

        const xText = center + ((radiusInner + radiusOuter) / 2) * Math.cos(midRad);
        const yText = center + ((radiusInner + radiusOuter) / 2) * Math.sin(midRad);

        return (
          <g key={`zodiac-${index}`}>
            {/* ✅ خلفية الخلية */}
            <path
              d={`M ${x1},${y1} L ${x2},${y2} A ${radiusOuter},${radiusOuter} 0 0,1 ${x3},${y3} L ${x4},${y4} A ${radiusInner},${radiusInner} 0 0,0 ${x1},${y1} Z`}
              fill="#eee"
              stroke="#FFD700"
              strokeWidth={0.9}
            />

            {/* ✅ اسم البرج */}
            <text
              x={xText}
              y={yText}
              fill={color}
              fontSize={10}
              textAnchor="middle"
              dominantBaseline="middle"
              fontWeight="bold"
            >
              {label}
            </text>
          </g>
        );
      })}
    </g>
  );
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
    {/* ✅ القسم العلوي: العنوان والأزرار */}
    <div style={{ padding: 10, flexShrink: 0 }}>
      <div style={{ 
    position: "absolute",
    top: "10px",
    right: "10px", // ✅ دائمًا في الزاوية اليمنى
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

  {/* ✅ السطر الجديد: صف يحتوي على GMT و KSA */}
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginTop: "4px",
      gap: "16px", // ✅ المسافة بين الساعتين
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
</div>
<defs>
    <radialGradient id="circleGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#ffffff" />
      <stop offset="100%" stopColor="#dddddd" />
    </radialGradient>
    <filter id="shadowFilter">
      <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="#aaa" />
    </filter>
  </defs>

      <div style={{ 
  position: "absolute",
  top: "120px",
  right: "10px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  backgroundColor: "#222",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #FFD700",
  zIndex: 10,
}}>

{/* 🔍 تكبير و تصغير الدائره  */}
  <div style={{ display: "flex", flexDirection: "column", color: "#FFD700" }}>
  <label style={{ marginBottom: "5px" }}>
    {settings.language === "ar" ? "🔍 تكبير و تصغير الدائره" : "Zoom"}
  </label>
  <input
    type="range"
    min="0.1"
    max="1.5"
    step="0.1"
    value={scale}
    onChange={(e) => setScale(parseFloat(e.target.value))}
  />

<span style={{ fontSize: "10px", marginLeft: "6px" }}>{(scale * 100).toFixed(0)}%</span>

</div>

{/* ♻️ دوران الدائرة  */}

<div style={{ display: "flex", flexDirection: "column", color: "#FFD700" }}>
  <label style={{ marginBottom: "5px" }}>
    {settings.language === "ar" ? "♻️ دوران الدائرة" : "Circle Rotation"}
  </label>
  <input
    type="range"
    min={0}
    max={360}
    step={1}
    value={settings.rotation}
    onChange={(e) =>
      setSettings((prev) => ({
        ...prev,
        rotation: parseInt(e.target.value),
      }))
    }
  />
  <span style={{ fontSize: "10px", color: "#aaa", marginTop: "4px" }}>
    {settings.rotation}°
  </span>
</div>


{/* ✅ أدوات المثلث */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "12px" }}>
  <label>
    <input type="checkbox" checked={showTriangle} onChange={() => setShowTriangle(!showTriangle)} />
    🔺 {settings.language === "ar" ? "إظهار المثلث" : "Show Triangle"}
  </label>

  {showTriangle && (
    <>
      <label>
        🎛 {settings.language === "ar" ? "زوايا المثلث" : "Triangle Angles"}
      </label>
{customAngles.map((angle, idx) => {
  const rotated = (angle + triangleRotation + settings.rotation) % 360;

  return (
    <input
      key={idx}
      type="number"
      value={rotated.toFixed(0)}
      onChange={(e) => {
        const newRotated = parseFloat(e.target.value) || 0;
        const newOriginal = (newRotated - triangleRotation - settings.rotation + 360) % 360;

        const newAngles = [...customAngles];
        newAngles[idx] = newOriginal;
        setCustomAngles(newAngles);
      }}
      style={{ ...inputStyle, marginBottom: "6px", direction: "ltr", textAlign: "center" }}
    />
  );
})}


      <label>
        ♻️ {settings.language === "ar" ? "تدوير المثلث" : "Rotate Triangle"}
      </label>
      <input
        type="range"
        min="0"
        max="360"
        value={triangleRotation}
        onChange={(e) => setTriangleRotation(parseFloat(e.target.value))}
      />

      <label>
        <input type="checkbox" checked={highlightTriangle} onChange={() => setHighlightTriangle(!highlightTriangle)} />
        {settings.language === "ar" ? "تمييز الزوايا" : "Show Highlight"}
      </label>

<label>
  <input
    type="checkbox"
    checked={fillTriangle}
    onChange={() => setFillTriangle(!fillTriangle)}
  />
  {settings.language === "ar" ? "تعبئة المثلث" : "Fill Triangle"}
</label>


    </>
  )}
</div>

{/* 🟥 أدوات المربع */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "12px" }}>
  <label>
    <input type="checkbox" checked={showSquare} onChange={() => setShowSquare(!showSquare)} />
    ⬛ {settings.language === "ar" ? "إظهار المربع" : "Show Square"}
  </label>

  {showSquare && (
    <>
      <label>
        🎛 {settings.language === "ar" ? "زوايا المربع" : "Square Angles"}
      </label>
      {customSquareAngles.map((angle, idx) => {
        const rotated = (angle + squareRotation + settings.rotation) % 360;

        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - squareRotation - settings.rotation + 360) % 360;

              const newAngles = [...customSquareAngles];
              newAngles[idx] = newOriginal;
              setCustomSquareAngles(newAngles);
            }}
            style={{ ...inputStyle, marginBottom: "6px", direction: "ltr", textAlign: "center" }}
          />
        );
      })}

      <label>
        ♻️ {settings.language === "ar" ? "تدوير المربع" : "Rotate Square"}
      </label>
      <input
        type="range"
        min="0"
        max="360"
        value={squareRotation}
        onChange={(e) => setSquareRotation(parseFloat(e.target.value))}
      />

      <label>
        <input type="checkbox" checked={highlightSquare} onChange={() => setHighlightSquare(!highlightSquare)} />
        {settings.language === "ar" ? "تمييز الزوايا" : "Show Highlight"}
      </label>

      <label>
        <input type="checkbox" checked={fillSquare} onChange={() => setFillSquare(!fillSquare)} />
        {settings.language === "ar" ? "تعبئة المربع" : "Fill Square"}
      </label>
    </>
  )}
</div>

{/* 🔷 أدوات الشكل الخماسي */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "12px" }}>
  <label>
    <input type="checkbox" checked={showPentagon} onChange={() => setShowPentagon(!showPentagon)} />
    🔷 {settings.language === "ar" ? "إظهار الخماسي" : "Show Pentagon"}
  </label>

  {showPentagon && (
    <>
      {customPentagonAngles.map((angle, idx) => {
        const rotated = (angle + pentagonRotation + settings.rotation) % 360;
        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - pentagonRotation - settings.rotation + 360) % 360;
              const newAngles = [...customPentagonAngles];
              newAngles[idx] = newOriginal;
              setCustomPentagonAngles(newAngles);
            }}
            style={{ ...inputStyle, marginBottom: "6px" }}
          />
        );
      })}
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={pentagonRotation}
        onChange={(e) => setPentagonRotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillPentagon} onChange={() => setFillPentagon(!fillPentagon)} /> تعبئة</label>
      <label><input type="checkbox" checked={highlightPentagon} onChange={() => setHighlightPentagon(!highlightPentagon)} /> تمييز</label>
    </>
  )}
</div>

{/* ⭐ أدوات النجمة */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "12px" }}>
  <label>
    <input type="checkbox" checked={showStar} onChange={() => setShowStar(!showStar)} />
    ⭐ {settings.language === "ar" ? "إظهار النجمة" : "Show Star"}
  </label>

  {showStar && (
    <>
      {customStarAngles.map((angle, idx) => {
        const rotated = (angle + starRotation + settings.rotation) % 360;
        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - starRotation - settings.rotation + 360) % 360;
              const newAngles = [...customStarAngles];
              newAngles[idx] = newOriginal;
              setCustomStarAngles(newAngles);
            }}
            style={{ ...inputStyle, marginBottom: "6px" }}
          />
        );
      })}
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={starRotation}
        onChange={(e) => setStarRotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillStar} onChange={() => setFillStar(!fillStar)} /> تعبئة</label>
      <label><input type="checkbox" checked={highlightStar} onChange={() => setHighlightStar(!highlightStar)} /> تمييز</label>
    </>
  )}
</div>

{/* 🔷 أدوات الشكل السداسي */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "12px" }}>
  <label>
    <input type="checkbox" checked={showHexagon} onChange={() => setShowHexagon(!showHexagon)} />
    🛑 {settings.language === "ar" ? "إظهار السداسي" : "Show Hexagon"}
  </label>

  {showHexagon && (
    <>
      {customHexagonAngles.map((angle, idx) => {
        const rotated = (angle + hexagonRotation + settings.rotation) % 360;
        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - hexagonRotation - settings.rotation + 360) % 360;
              const newAngles = [...customHexagonAngles];
              newAngles[idx] = newOriginal;
              setCustomHexagonAngles(newAngles);
            }}
            style={{ ...inputStyle, marginBottom: "6px" }}
          />
        );
      })}
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={hexagonRotation}
        onChange={(e) => setHexagonRotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillHexagon} onChange={() => setFillHexagon(!fillHexagon)} /> تعبئة</label>
      <label><input type="checkbox" checked={highlightHexagon} onChange={() => setHighlightHexagon(!highlightHexagon)} /> تمييز</label>
    </>
  )}
</div>

{/* ⭐ أدوات النجمة السداسية */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "12px" }}>
  <label>
    <input type="checkbox" checked={showHexagram} onChange={() => setShowHexagram(!showHexagram)} />
    ⭐ {settings.language === "ar" ? "إظهار النجمة السداسية" : "Show Hexagram"}
  </label>

  {showHexagram && (
    <>
      {customHexagramAngles.map((angle, idx) => {
        const rotated = (angle + hexagramRotation + settings.rotation) % 360;
        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - hexagramRotation - settings.rotation + 360) % 360;
              const newAngles = [...customHexagramAngles];
              newAngles[idx] = newOriginal;
              setCustomHexagramAngles(newAngles);
            }}
            style={{ ...inputStyle, marginBottom: "6px" }}
          />
        );
      })}

      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={hexagramRotation}
        onChange={(e) => setHexagramRotation(parseFloat(e.target.value))} />

      <label><input type="checkbox" checked={fillHexagram} onChange={() => setFillHexagram(!fillHexagram)} /> تعبئة</label>
      <label><input type="checkbox" checked={highlightHexagram} onChange={() => setHighlightHexagram(!highlightHexagram)} /> تمييز</label>
    </>
  )}
</div>

{/* 🧿 أدوات الشكل المثمن */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "12px" }}>
  <label>
    <input type="checkbox" checked={showOctagon} onChange={() => setShowOctagon(!showOctagon)} />
    🧿 {settings.language === "ar" ? "إظهار المثمن" : "Show Octagon"}
  </label>

  {showOctagon && (
    <>
      {customOctagonAngles.map((angle, idx) => {
        const rotated = (angle + octagonRotation + settings.rotation) % 360;
        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - octagonRotation - settings.rotation + 360) % 360;
              const newAngles = [...customOctagonAngles];
              newAngles[idx] = newOriginal;
              setCustomOctagonAngles(newAngles);
            }}
            style={{ ...inputStyle, marginBottom: "6px" }}
          />
        );
      })}
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={octagonRotation}
        onChange={(e) => setOctagonRotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillOctagon} onChange={() => setFillOctagon(!fillOctagon)} /> تعبئة</label>
      <label><input type="checkbox" checked={highlightOctagon} onChange={() => setHighlightOctagon(!highlightOctagon)} /> تمييز</label>
    </>
  )}
</div>

{/* ⭐ أدوات النجمة المثمنة */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "12px" }}>
  <label>
    <input type="checkbox" checked={showStarOctagon} onChange={() => setShowStarOctagon(!showStarOctagon)} />
    ⭐ {settings.language === "ar" ? "إظهار نجمة مثمنة" : "Show Star Octagon"}
  </label>

  {showStarOctagon && (
    <>
      {customStarOctagonAngles.map((angle, idx) => {
        const rotated = (angle + starOctagonRotation + settings.rotation) % 360;
        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - starOctagonRotation - settings.rotation + 360) % 360;
              const newAngles = [...customStarOctagonAngles];
              newAngles[idx] = newOriginal;
              setCustomStarOctagonAngles(newAngles);
            }}
            style={{ ...inputStyle, marginBottom: "6px" }}
          />
        );
      })}
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={starOctagonRotation}
        onChange={(e) => setStarOctagonRotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillStarOctagon} onChange={() => setFillStarOctagon(!fillStarOctagon)} /> تعبئة</label>
      <label><input type="checkbox" checked={highlightStarOctagon} onChange={() => setHighlightStarOctagon(!highlightStarOctagon)} /> تمييز</label>
    </>
  )}
</div>

{/* 🧲 عجلة الزوايا */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "12px" }}>
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
  <option value={45}>كل 45° (8 شعاع)</option>
  <option value={60}>كل 60° (6 شعاع)</option>
</select>

    <label>🎨 لون الشعاع</label>
    <input
      type="color"
      value={rayColor}
      onChange={(e) => setRayColor(e.target.value)}
      style={{ width: "60px", height: "25px" }}
    />

    <label>📏 سماكة الشعاع</label>
    <input
      type="range"
      min="0.5"
      max="5"
      step="0.5"
      value={rayWidth}
      onChange={(e) => setRayWidth(parseFloat(e.target.value))}
    />
    <span style={{ fontSize: "10px", color: "#aaa" }}>{rayWidth}px</span>
  </>
)}
</div>

{/* 🟡 الدوائر المتداخلة */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "12px", color: "#FFD700" }}>
  <label>
    <input type="checkbox" checked={showNestedCircles} onChange={() => setShowNestedCircles(!showNestedCircles)} />
    🟡 {settings.language === "ar" ? "إظهار الدوائر المتداخلة" : "Show Nested Circles"}
  </label>

  {showNestedCircles && (
    <>
      <label>🔢 {settings.language === "ar" ? "عدد الدوائر" : "Number of Circles"}
      <input
        type="range"
        min="1"
        max="20"
        value={nestedCircleCount} 
        onChange={(e) => setNestedCircleCount(parseInt(e.target.value))}
      />
      <span>{nestedCircleCount}</span>
</label>

<label>📏 {settings.language === "ar" ? "المسافة بين الدوائر" : "Gap Between Circles"}</label>
<input
  type="range"
  min="5"
  max="100"
  step="1"
  value={nestedCircleGap}
  onChange={(e) => setNestedCircleGap(parseInt(e.target.value))}
/>

<label>{settings.language === "ar" ? "نمط الخط" : "Line Style"}</label>
<select
  value={nestedDashStyle}
  onChange={(e) => setNestedDashStyle(e.target.value)}
>
  <option value="solid">متصل</option>
  <option value="dashed">متقطع</option>
</select>

<label>
  {settings.language === "ar" ? "سماكة الخط" : "Stroke Width"}
</label>
<input
  type="range"
  min="0.5"
  max="5"
  step="0.1"
  value={nestedStrokeWidth}
  onChange={(e) => setNestedStrokeWidth(parseFloat(e.target.value))}
/>
<span style={{ fontSize: "10px", color: "#aaa" }}>
  {nestedStrokeWidth.toFixed(1)}px
</span>


<span style={{ fontSize: "10px", color: "#aaa" }}>
  {nestedCircleGap}px
</span>

{/* ⏱ التحكم بعرض الزمن على الدوائر */}
<label>
  <input
    type="checkbox"
    checked={showTimeLabels}
    onChange={() => setShowTimeLabels(!showTimeLabels)}
  />
  ⏱ {settings.language === "ar" ? "عرض الزمن على الدوائر" : "Show Time Labels"}
</label>

{showTimeLabels && (
  <>
    <label>
      {settings.language === "ar" ? "عدد الأيام لكل دائرة" : "Days per Circle"}
    </label>
    <input
      type="number"
      min={1}
      value={timeStepDays}
      onChange={(e) => setTimeStepDays(parseInt(e.target.value))}
      style={inputStyle}
    />
  </>
)}

<label>🎨 {settings.language === "ar" ? "لون الدوائر" : "Circle Color"}</label>
<input
  type="color"
  value={nestedCircleColor}
  onChange={(e) => setNestedCircleColor(e.target.value)}
  style={{ width: "60px", height: "25px" }}
/>

<label>
  <input
    type="checkbox"
    checked={nestedCircleLabels}
    onChange={() => setNestedCircleLabels(!nestedCircleLabels)}
  />
  {settings.language === "ar" ? "عرض أسماء الدوائر" : "Show Labels"}
</label>

<label>
  <input
    type="checkbox"
    checked={useGradientColor}
    onChange={() => setUseGradientColor(!useGradientColor)}
  />
  {settings.language === "ar" ? "ألوان تلقائية" : "Auto Gradient Colors"}
</label>

<label>
  {settings.language === "ar" ? "الشفافية" : "Opacity"}
</label>

{/* 🔁 تكرار شكل هندسي داخل كل دائرة */}
<label>
  <input
    type="checkbox"
    checked={showRepeatedPattern}
    onChange={() => setShowRepeatedPattern(!showRepeatedPattern)}
  />
  🔁 {settings.language === "ar" ? "تكرار شكل هندسي داخل كل دائرة" : "Repeat Shape per Circle"}
</label>

{showRepeatedPattern && (
  <>
    <label>🎨 {settings.language === "ar" ? "لون الشكل" : "Shape Color"}</label>
    <input
      type="color"
      value={patternColor}
      onChange={(e) => setPatternColor(e.target.value)}
    />

    <label>♻️ {settings.language === "ar" ? "تدوير الشكل" : "Rotation"}</label>
    <input
      type="range"
      min={0}
      max={360}
      value={patternRotation}
      onChange={(e) => setPatternRotation(parseFloat(e.target.value))}
    />

    <label>
      <input
        type="checkbox"
        checked={patternFill}
        onChange={() => setPatternFill(!patternFill)}
      />
      {settings.language === "ar" ? "تعبئة الشكل" : "Fill Shape"}
    </label>

    <label>{settings.language === "ar" ? "اختيار الشكل" : "Select Shape"}</label>
    <select
      value={patternShape}
      onChange={(e) => setPatternShape(e.target.value)}
    >
      <option value="triangle">🔺 مثلث</option>
      <option value="square">⬛ مربع</option>
      <option value="star">⭐ نجمة</option>
    </select>
  </>
)}



    </>
  )}
</div>


        <div style={{ display: "flex", flexDirection: "column", color: "#FFD700" }}>
    <label style={{ marginBottom: "5px" }}>
      {settings.language === "ar" ? "عدد الحلقات" : "Levels"}
    </label>
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
style={inputStyle}
    />
  </div>

         <div style={{ display: "flex", flexDirection: "column", color: "#FFD700" }}>
    <label style={{ marginBottom: "5px" }}>
      {settings.language === "ar" ? "عدد القطاعات" : "Divisions"}
    </label>
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
style={inputStyle}
    />
  </div>

         <div style={{ display: "flex", flexDirection: "column", color: "#FFD700" }}>
    <label style={{ marginBottom: "5px" }}>
      {settings.language === "ar" ? "بداية الترقيم" : "Start From"}
    </label>
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
style={inputStyle}
    />
  </div>
</div>
    </div>

    {/* ✅ القسم السفلي: الدائرة تملأ المساحة المتبقية فقط */}
<div
  style={{    
    border: "2px solid #FFD700",      // ✅ الإطار الذهبي
    borderRadius: "12px",
    padding: "8px",
    background: "#fff",               // خلفية بيضاء حول الدائرة
    boxShadow: "0 0 10px rgba(255, 215, 0, 0.3)",
  }}
>

  <svg
     width="100%"
     height="100%"
     viewBox={`0 0 ${dynamicSize} ${dynamicSize}`}
     style={{
    display: "block",
    margin: "0 auto",
    background: "#f2f2f2",
    cursor: isDragging ? "grabbing" : "grab",
    }}
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    onMouseLeave={handleMouseUp}
  > 
    background: "#fff",    
 <g
           transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}
        >
// 🔵 حلقة داخلية ثابتة: الأرقام من 1 إلى 36 فقط (بدون تكرار)
{Array.from({ length: 36 }).map((_, index) => {
  const fixedValue = index + 1;

  const angle = index * angleStep + (settings.rotation * Math.PI) / 180;
  const angleMid = angle + angleStep / 2;

  const radius = innerRadius - 10; // ✅ داخل الدائرة لكن مرئي
  const x = center + radius * Math.cos(angleMid);
  const y = center + radius * Math.sin(angleMid);

  return (
    <g key={`fixed-digit-${index}`}>
      <text
        x={x}
        y={y}
        fill="#008000"
        fontSize={6}
        textAnchor="middle"
        dominantBaseline="middle"
        fontWeight="bold"
      >
        {fixedValue}
      </text>
    </g>
  );
})}


 // 3️⃣ باقي الحلقات الخارجية والخلايا الكبيرة

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
            const rStart = r1 + 5; // قريب من حافة الخلية الداخلية
            const path = getPathForCell(r1, r2, angleStart, angleEnd);
            const rMid = (r1 + r2) / 2;
	       const angleMid = (angleStart + angleEnd) / 2;
            const xStart = center + rStart * Math.cos(angleMid);
	       const yStart = center + rStart * Math.sin(angleMid);
            
	       // ✅ أضف السطرين التاليين هنا:
                     const x = center + rMid * Math.cos(angleMid);
                     const y = center + rMid * Math.sin(angleMid);
	       
                     const fontSize = Math.max(5, 11 - value.toString().length);
            const isGray = (level + index) % 2 === 0;

  	       const reduced = reduceToDigit(value);
               const fillColor = getCellColor(reduced);

            return (
              <g key={`${level}-${index}`}>
              
<path
  d={path}
  fill={getClickColor(value) || (isGray ? "#f0f0f0" : "#ffffff")}
  stroke="#aaa"
  strokeWidth={0.5}
  onClick={() => handleCellClick(value)}
  style={{ cursor: "pointer" }}
/>


<text
 x={xStart}
 y={yStart}
 fill={getDigitColor(reduceToDigit(value))}
 fontSize={fontSize - 2}
 textAnchor="middle"
 dominantBaseline="middle"
 fontWeight="bold"
>
  {reduceToDigit(value)}
</text>

<text
  x={x}
  y={y}
  fill={getDigitColor(reduceToDigit(value))}
  fontSize={fontSize}
  textAnchor="middle"
  dominantBaseline="middle"
  fontWeight="bold"
>
  {value}
</text>

// 🧭 حلقة الزوايا الخارجية المرتبطة بمجموع الرقم
{[...Array(settings.divisions)].map((_, index) => {
  const angle = index * angleStep + (settings.rotation * Math.PI) / 180;
  const angleMid = angle + angleStep / 2;

  const lastLevel = settings.levels - 1;
  const cellValue = settings.startValue + lastLevel * settings.divisions + index;
  const reduced = reduceToDigit(cellValue);
  const angleDeg = ((index + 1) * 360) / settings.divisions;

  const r = innerRadius + [...Array(settings.levels)].reduce((acc, l) => {
    const maxDigits = Math.max(
      ...Array.from({ length: settings.divisions }, (_, i) =>
        (settings.startValue + l * settings.divisions + i).toString().length
      )
    );
    return acc + (baseRingWidth + maxDigits * digitScale);
  }, 0) + 20; // أبعد من الحلقة الأخيرة

  const x = center + r * Math.cos(angleMid);
  const y = center + r * Math.sin(angleMid);

  return (
    <text
      key={`angle-outside-${index}`}
      x={x}
      y={y}
      fill={getDigitColor(reduced)}
      fontSize={10}
      textAnchor="middle"
      dominantBaseline="middle"
      fontWeight="bold"
    >
      {angleDeg.toFixed(0)}°
    </text>

  );
})}
<RenderZodiacRing />

              </g>
            );
          })}
        </React.Fragment>

      );
    })}
<RenderZodiacRing />

{/* ✅ رسم المثلث داخل الدائرة */}
{showTriangle && (
  <g>
    {(() => {
      const r = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5); // نصف القطر
      const trianglePoints = customAngles.map((deg) => {
        const rad = ((deg + triangleRotation + settings.rotation) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      return (
        <>
          <polygon
            points={trianglePoints.map((p) => `${p.x},${p.y}`).join(" ")}
            fill={fillTriangle ? "rgba(0, 128, 0, 0.2)" : "none"}  // ✅ تعبئة خضراء أو لا شيء
            stroke="green"
            strokeWidth={2}
          />
          {highlightTriangle &&
            trianglePoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill="yellow" />
            ))}
{/* ✅ الخطوط الداخلية من كل رأس للمركز */}
{trianglePoints.map((point, index) => (
  <line
    key={`line-${index}`}
    x1={point.x}
    y1={point.y}
    x2={center}
    y2={center}
    stroke="green"
    strokeWidth={3}
    strokeDasharray="4,2" // خط متقطع (يمكنك تغييره)
  />
))}

{/* ✅ عرض الزوايا الجديدة عند كل رأس */}
{trianglePoints.map((point, i) => {
  const angle = (customAngles[i] + triangleRotation + settings.rotation) % 360;

  return (
    <text
      key={`angle-text-${i}`}
      x={point.x}
      y={point.y - 12}
      fill="green"
      fontSize={16}
      fontWeight="bold"
      textAnchor="middle"
    >
      ({angle.toFixed(0)}°)
    </text>
  );
})}

        </>
      );
    })()}
  </g>
)}


{/* 🟥 رسم المربع داخل الدائرة */}
{showSquare && (
  <g>
    {(() => {
      const r = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5); // نفس نصف القطر
      const squarePoints = customSquareAngles.map((deg) => {
        const rad = ((deg + squareRotation + settings.rotation) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      return (
        <>
          <polygon
            points={squarePoints.map((p) => `${p.x},${p.y}`).join(" ")}
            fill={fillSquare ? "rgba(255, 0, 0, 0.2)" : "none"} // أحمر شفاف
            stroke="red"
            strokeWidth={2}
          />

          {highlightSquare &&
            squarePoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill="orange" />
            ))}

          {/* خطوط من الرؤوس إلى المركز */}
          {squarePoints.map((point, index) => (
            <line
              key={`square-line-${index}`}
              x1={point.x}
              y1={point.y}
              x2={center}
              y2={center}
              stroke="red"
              strokeWidth={2}
              strokeDasharray="4,2"
            />
          ))}

          {/* الزوايا */}
          {squarePoints.map((point, i) => {
            const angle = (customSquareAngles[i] + squareRotation + settings.rotation) % 360;
            return (
              <text
                key={`square-angle-${i}`}
                x={point.x}
                y={point.y - 12}
                fill="red"
                fontSize={14}
                fontWeight="bold"
                textAnchor="middle"
              >
                ({angle.toFixed(0)}°)
              </text>
            );
          })}
        </>
      );
    })()}
  </g>
)}

{/*  رسم الخماسي داخل الدائرة */}
{showPentagon && (
  <g>
    {(() => {
      const r = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5);
      const points = customPentagonAngles.map((deg) => {
        const rad = ((deg + pentagonRotation + settings.rotation) * Math.PI) / 180;
        return { x: center + r * Math.cos(rad), y: center + r * Math.sin(rad) };
      });

      return (
        <>
          <polygon
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill={fillPentagon ? "rgba(0, 0, 255, 0.2)" : "none"}
            stroke="blue"
            strokeWidth={2}
          />
          {highlightPentagon &&
            points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill="cyan" />
            ))}
          {points.map((p, i) => (
            <line key={i} x1={p.x} y1={p.y} x2={center} y2={center} stroke="blue" strokeDasharray="4,2" />
          ))}
          {points.map((p, i) => {
            const angle = (customPentagonAngles[i] + pentagonRotation + settings.rotation) % 360;
            return (
              <text key={i} x={p.x} y={p.y - 10} fill="blue" fontSize={12} fontWeight="bold" textAnchor="middle">
                ({angle.toFixed(0)}°)
              </text>
            );
          })}
        </>
      );
    })()}
  </g>
)}

{/*  رسم النجمه الحماسيه داخل الدائرة */}

{showStar && (
  <g>
    {(() => {
      const r = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5);
      const points = customStarAngles.map((deg) => {
        const rad = ((deg + starRotation + settings.rotation) * Math.PI) / 180;
        return { x: center + r * Math.cos(rad), y: center + r * Math.sin(rad) };
      });

      return (
        <>
          <polygon
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill={fillStar ? "rgba(255, 165, 0, 0.2)" : "none"}
            stroke="orange"
            strokeWidth={2}
          />
          {highlightStar &&
            points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill="orange" />
            ))}
          {points.map((p, i) => (
            <line key={i} x1={p.x} y1={p.y} x2={center} y2={center} stroke="orange" strokeDasharray="4,2" />
          ))}
          {points.map((p, i) => {
            const angle = (customStarAngles[i] + starRotation + settings.rotation) % 360;
            return (
              <text key={i} x={p.x} y={p.y - 10} fill="orange" fontSize={12} fontWeight="bold" textAnchor="middle">
                ({angle.toFixed(0)}°)
              </text>
            );
          })}
        </>
      );
    })()}
  </g>
)}

{/* رسم السداسي داخل الدائرة */}
{showHexagon && (
  <g>
    {(() => {
      const r = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5);
      const points = customHexagonAngles.map((deg) => {
        const rad = ((deg + hexagonRotation + settings.rotation) * Math.PI) / 180;
        return { x: center + r * Math.cos(rad), y: center + r * Math.sin(rad) };
      });

      return (
        <>
          <polygon
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill={fillHexagon ? "rgba(0, 200, 0, 0.2)" : "none"}
            stroke="green"
            strokeWidth={2}
          />
          {highlightHexagon &&
            points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill="green" />
            ))}
          {points.map((p, i) => (
            <line key={i} x1={p.x} y1={p.y} x2={center} y2={center} stroke="green" strokeDasharray="4,2" />
          ))}
          {points.map((p, i) => {
            const angle = (customHexagonAngles[i] + hexagonRotation + settings.rotation) % 360;
            return (
              <text key={i} x={p.x} y={p.y - 10} fill="green" fontSize={12} fontWeight="bold" textAnchor="middle">
                ({angle.toFixed(0)}°)
              </text>
            );
          })}
        </>
      );
    })()}
  </g>
)}

{/*  رسم النجمه السداسيه داخل الدائرة */}
{showHexagram && (
  <g>
    {(() => {
      const r = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5);
      const points = customHexagramAngles.map((deg) => {
        const rad = ((deg + hexagramRotation + settings.rotation) * Math.PI) / 180;
        return { x: center + r * Math.cos(rad), y: center + r * Math.sin(rad) };
      });

      return (
        <>
          <polygon
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill={fillHexagram ? "rgba(138, 43, 226, 0.2)" : "none"} // بنفسجي فاتح
            stroke="purple"
            strokeWidth={2}
          />
          {highlightHexagram &&
            points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill="violet" />
            ))}
          {points.map((p, i) => (
            <line key={i} x1={p.x} y1={p.y} x2={center} y2={center} stroke="purple" strokeDasharray="4,2" />
          ))}
          {points.map((p, i) => {
            const angle = (customHexagramAngles[i] + hexagramRotation + settings.rotation) % 360;
            return (
              <text key={i} x={p.x} y={p.y - 10} fill="purple" fontSize={12} fontWeight="bold" textAnchor="middle">
                ({angle.toFixed(0)}°)
              </text>
            );
          })}
        </>
      );
    })()}
  </g>
)}

{/* 🧿 رسم المثمن*/}

{showOctagon && (
  <g>
    {(() => {
      const r = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5);
      const points = customOctagonAngles.map((deg) => {
        const rad = ((deg + octagonRotation + settings.rotation) * Math.PI) / 180;
        return { x: center + r * Math.cos(rad), y: center + r * Math.sin(rad) };
      });

      return (
        <>
          <polygon
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill={fillOctagon ? "rgba(0, 0, 139, 0.2)" : "none"}
            stroke="darkblue"
            strokeWidth={2}
          />
          {highlightOctagon &&
            points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill="blue" />
            ))}
          {points.map((p, i) => (
            <line key={i} x1={p.x} y1={p.y} x2={center} y2={center} stroke="darkblue" strokeDasharray="4,2" />
          ))}
          {points.map((p, i) => {
            const angle = (customOctagonAngles[i] + octagonRotation + settings.rotation) % 360;
            return (
              <text key={i} x={p.x} y={p.y - 10} fill="darkblue" fontSize={12} fontWeight="bold" textAnchor="middle">
                ({angle.toFixed(0)}°)
              </text>
            );
          })}
        </>
      );
    })()}
  </g>
)}

{/* ⭐ رسم النجمة الثمانية*/}

{showStarOctagon && (
  <g>
    {(() => {
      const r = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5);
      const points = customStarOctagonAngles.map((deg) => {
        const rad = ((deg + starOctagonRotation + settings.rotation) * Math.PI) / 180;
        return { x: center + r * Math.cos(rad), y: center + r * Math.sin(rad) };
      });

      return (
        <>
          <polygon
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill={fillStarOctagon ? "rgba(255, 215, 0, 0.2)" : "none"}
            stroke="gold"
            strokeWidth={2}
          />
          {highlightStarOctagon &&
            points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill="gold" />
            ))}
          {points.map((p, i) => (
            <line key={i} x1={p.x} y1={p.y} x2={center} y2={center} stroke="gold" strokeDasharray="4,2" />
          ))}
          {points.map((p, i) => {
            const angle = (customStarOctagonAngles[i] + starOctagonRotation + settings.rotation) % 360;
            return (
              <text key={i} x={p.x} y={p.y - 10} fill="gold" fontSize={12} fontWeight="bold" textAnchor="middle">
                ({angle.toFixed(0)}°)
              </text>
            );
          })}
        </>
      );
    })()}
  </g>
)}

{showAngleWheel && (
  <g>
    {(() => {
        const rayCount = 360 / angleStepRad;
      const outerR = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5) + 60;
      const innerR = innerRadius - 10;

      return (
        <>
          {[...Array(rayCount)].map((_, i) => {
            const angle = (i * angleStepRad + angleWheelRotation + settings.rotation) % 360;
            const rad = (angle * Math.PI) / 180;
            const x1 = center + innerR * Math.cos(rad);
            const y1 = center + innerR * Math.sin(rad);
            const x2 = center + outerR * Math.cos(rad);
            const y2 = center + outerR * Math.sin(rad);

            const labelX = center + (outerR + 10) * Math.cos(rad);
            const labelY = center + (outerR + 10) * Math.sin(rad);

            return (
              <g key={`angle-ray-${i}`}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={rayColor} strokeWidth={rayWidth} />
                <text
                  x={labelX}
                  y={labelY}
                  fill="#996515"
                  fontSize={9}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {angle.toFixed(0)}°
                </text>
              </g>
            );
          })}
        </>
      );
    })()}
  </g>
)}

{/* 🟡  رسم الدوائر المتداخلة  */}


{showNestedCircles && (
  <g>
    {[...Array(nestedCircleCount)].map((_, i) => {
      const radius = nestedCircleGap * (i + 1);
      const color = useGradientColor
        ? `hsl(${(i * 30) % 360}, 70%, 60%)`
        : nestedCircleColor;

      return (
        <g key={`nested-${i}`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={nestedStrokeWidth}
            fill="none"
            strokeOpacity={nestedOpacity}
strokeDasharray={nestedDashStyle === "dashed" ? "4,2" : "none"}
onClick={() =>
  alert(`🟡 دائرة رقم ${i + 1}\nنصف القطر: ${radius}px`)}
          />
          {nestedCircleLabels && (
            <text
              x={center}
              y={center - radius - 4}
              fill="black" 
              fontSize={10}
              textAnchor="middle"
              fontWeight="bold"
              opacity={nestedOpacity}
            >
              R={radius}
            </text>
          )}

{showNestedCircles && showTimeLabels && (
  <g>
    {[...Array(nestedCircleCount)].map((_, i) => {
      const radius = nestedCircleGap * (i + 1);
      const label = `${(i + 1) * timeStepDays} يوم`;
      return (
        <text
          key={`time-label-${i}`}
          x={center}
          y={center - radius - 20}
          fill="green"
          fontSize={11}
          fontWeight="bold"
          textAnchor="middle"
        >
          ⏱ {label}
        </text>
      );
    })}
  </g>
)}

        </g>
      );
    })}
  </g>
)}

{/* 🧭 كتابة الزوايا مرة واحدة حول الدائرة مخ خطوط الشعاع */}

{showNestedCircles && (
  <g>
    {[...Array(12)].map((_, j) => {
      const angle = ((j * 30 - 90) * Math.PI) / 180;
      const outerRadius = nestedCircleGap * nestedCircleCount + 20;
      const tx = center + outerRadius * Math.cos(angle);
      const ty = center + outerRadius * Math.sin(angle);

      return (
        <text
          key={`global-angle-${j}`}
          x={tx}
          y={ty}
          fontSize={10}
          fill="#333"
          textAnchor="middle"
          dominantBaseline="middle"
          fontWeight="bold"
        >
          {j * 30}°
        </text>
      );
    })}
  </g>
)}
{showNestedCircles && (
  <g>
    {[...Array(12)].map((_, j) => {
      const angle = ((j * 30 - 90) * Math.PI) / 180;
      const outerRadius = nestedCircleGap * nestedCircleCount;
      const x = center + outerRadius * Math.cos(angle);
      const y = center + outerRadius * Math.sin(angle);

      return (
        <line
          key={`main-ray-${j}`}
          x1={center}
          y1={center}
          x2={x}
          y2={y}
          stroke="red"
          strokeWidth={1}
          opacity={nestedOpacity}
        />
      );
    })}
  </g>
)}

{showNestedCircles && showRepeatedPattern && (
  <g>
    {[...Array(nestedCircleCount)].map((_, i) => {
      const radius = nestedCircleGap * (i + 1);
      const centerX = center;
      const centerY = center;
      let angles = [];

      if (patternShape === "triangle") angles = [0, 120, 240];
      else if (patternShape === "square") angles = [0, 90, 180, 270];
      else if (patternShape === "star") angles = [0, 144, 288, 72, 216];

      const points = angles.map((angleDeg) => {
        const rad = ((angleDeg + patternRotation + settings.rotation) * Math.PI) / 180;
        return {
          x: centerX + radius * Math.cos(rad),
          y: centerY + radius * Math.sin(rad),
        };
      });

      return (
        <g key={`pattern-${i}`}>
<polygon
  points={points.map((p) => `${p.x},${p.y}`).join(" ")}
  fill={patternFill ? patternColor + "55" : "none"}
  stroke={patternColor}
  strokeWidth={2}
  onClick={() => {
    setSelectedPatternIndex(i);
    alert(
      `📈 دائرة رقم ${i + 1}\nالشكل: ${patternShape.toUpperCase()}\nنصف القطر: ${radius}px`
    );
  }}
/>
{selectedPatternIndex === i && (
  <circle
    cx={centerX}
    cy={centerY}
    r={6}
    fill="limegreen"
    stroke="black"
    strokeWidth={1}
  />
)}


          {points.map((p, idx) => (
            <circle key={idx} cx={p.x} cy={p.y} r={3} fill={patternColor} />
          ))}
{selectedPatternIndex === i && (
  <circle
    cx={centerX}
    cy={centerY}
    r={6}
    fill="limegreen"
    stroke="black"
    strokeWidth={1}
  />
)}

        </g>
      );
    })}
  </g>
)}

   </g>
      </svg>
    </div>
  </div>
);
};


const buttonStyle = {
   margin: "6px",
  padding: "8px 16px",
  backgroundColor: "#333",
  color: "#FFD700",
  border: "1px solid #666",
  borderRadius: "8px",
  fontWeight: "bold",
  fontSize: "14px",
  transition: "all 0.3s ease",
  cursor: "pointer",
};

const inputStyle = {
  width: "80px",
  padding: "6px",
  borderRadius: "6px",
  border: "1px solid #FFD700",
  backgroundColor: "#222",
  color: "#fff",
  fontWeight: "bold",
  textAlign: "center",
};
export default GannCircle360;
