
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
const svgRef = useRef();

  const [settings, setSettings] = useState(() => {
  const stored = localStorage.getItem("gannCircle360Settings");

return stored ? JSON.parse(stored) : defaultSettings;

  });
const [selectedShape, setSelectedShape] = useState("");
  const [zoom, setZoom] = useState(1);
   const [showZodiacRing, setShowZodiacRing] = useState(true);
    const [showDegreeRing, setShowDegreeRing] = useState(true);
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
//🟡 زر دائري في الزاوية اليمنى العليا
const [showSettings, setShowSettings] = useState(true);
{' تغير لون الخلية عند الضغط عليها'}
const [cellColors, setCellColors] = useState([]);
const [showZoomControls, setShowZoomControls] = useState(false);






// ⭐ نجمة رباعية
const [showStar4, setShowStar4] = useState(false);
const [star4Rotation, setStar4Rotation] = useState(0);
const [customStar4Angles, setCustomStar4Angles] = useState([0, 180, 90, 270]);
const [highlightStar4, setHighlightStar4] = useState(true);
const [fillStar4, setFillStar4] = useState(true);
const [squareRotation, setSquareRotation] = useState(0);
const [customSquareAngles, setCustomSquareAngles] = useState([0, 90, 180, 270]);
const [highlightSquare, setHighlightSquare] = useState(true);
const [fillSquare, setFillSquare] = useState(true);

// 🔷 شكل خماسي
const [showPentagon, setShowPentagon] = useState(false);
const [pentagonRotation, setPentagonRotation] = useState(0);
const [customPentagonAngles, setCustomPentagonAngles] = useState([0, 72, 144, 216, 288]);
const [highlightPentagon, setHighlightPentagon] = useState(true);
const [fillPentagon, setFillPentagon] = useState(true);

// ⭐  نجمة الخماسي 
const [showStar, setShowStar] = useState(false);
const [starRotation, setStarRotation] = useState(0);
const [customStarAngles, setCustomStarAngles] = useState([0, 144, 288, 72, 216]);
const [highlightStar, setHighlightStar] = useState(true);
const [fillStar, setFillStar] = useState(true);



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

// 🔷 شكل سباعي منتظم
const [showHeptagon, setShowHeptagon] = useState(false);
const [heptagonRotation, setHeptagonRotation] = useState(0);
const [highlightHeptagon, setHighlightHeptagon] = useState(true);
const [fillHeptagon, setFillHeptagon] = useState(true);


// ⭐ نجمة سباعية
const [showStar7, setShowStar7] = useState(false);
const [star7Rotation, setStar7Rotation] = useState(0);
const [highlightStar7, setHighlightStar7] = useState(true);
const [fillStar7, setFillStar7] = useState(true);


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

// 🔷 شكل تساعي منتظم
const [showNonagon, setShowNonagon] = useState(false);
const [nonagonRotation, setNonagonRotation] = useState(0);
const [highlightNonagon, setHighlightNonagon] = useState(true);
const [fillNonagon, setFillNonagon] = useState(true);

// ⭐ نجمة تساعية منتظمة
const [showStar9, setShowStar9] = useState(false);
const [star9Rotation, setStar9Rotation] = useState(0);
const [highlightStar9, setHighlightStar9] = useState(true);
const [fillStar9, setFillStar9] = useState(true);

// 🔷 شكل العشاري منتظم
const [showDecagon, setShowDecagon] = useState(false);
const [decagonRotation, setDecagonRotation] = useState(0);
const [highlightDecagon, setHighlightDecagon] = useState(true);
const [fillDecagon, setFillDecagon] = useState(true);

 // ⭐نجمة عشاريّة منتظمة
const [showStar10, setShowStar10] = useState(false);
const [star10Rotation, setStar10Rotation] = useState(0);
const [highlightStar10, setHighlightStar10] = useState(true);
const [fillStar10, setFillStar10] = useState(true);

//🔷 الشكل الحادي عشر المنتظم
const [showHendecagon, setShowHendecagon] = useState(false);
const [hendecagonRotation, setHendecagonRotation] = useState(0);
const [highlightHendecagon, setHighlightHendecagon] = useState(true);
const [fillHendecagon, setFillHendecagon] = useState(true);

//النجمة الحادية عشر ⭐
const [showStar11, setShowStar11] = useState(false);
const [star11Rotation, setStar11Rotation] = useState(0);
const [highlightStar11, setHighlightStar11] = useState(true);
const [fillStar11, setFillStar11] = useState(true);

//🔷 الشكل الهندسي المنتظم ذو 12 ضلعًا 
const [showDodecagon, setShowDodecagon] = useState(false);
const [dodecagonRotation, setDodecagonRotation] = useState(0);
const [highlightDodecagon, setHighlightDodecagon] = useState(true);
const [fillDodecagon, setFillDodecagon] = useState(true);

// ⭐ النجمة {12/5} — توصيل كل ثاني نقطة
const [showStar12, setShowStar12] = useState(false);
const [star12Rotation, setStar12Rotation] = useState(0);
const [highlightStar12, setHighlightStar12] = useState(true);
const [fillStar12, setFillStar12] = useState(true);



// 🧲 دائرة الزوايا (Wheel of 36 Rays)
const [showAngleWheel, setShowAngleWheel] = useState(false);
const [angleWheelRotation, setAngleWheelRotation] = useState(0);

useEffect(() => {
  // إعادة ضبط دوران عجلة الزوايا لتبدأ من الأعلى
  setAngleWheelRotation((prev) => (prev + 270) % 360);

  // إعادة تعيين دوران الإعدادات إلى 0 (لمنع الانحراف بسبب التخزين)
  setSettings((prev) => ({ ...prev, rotation: 0 }));
}, []);


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

  if (clicks === 1) return "#90ee90";  // أخضر
  if (clicks === 2) return "pink";     // وردي
  if (clicks === 3) return "#ffff99";  // أصفر
  if (clicks === 4) return "gray";     // رمادي
  return null;                         // ✅ أي شيء آخر يرجع للون الأصلي
};

const handleCellClick = (value) => {
  setClickStates((prev) => {
    const current = prev[value] || 0;
    const next = current >= 4 ? 0 : current + 1;
    return { ...prev, [value]: next };
  });
};

const handleDoubleClick = (value) => {
  setClickStates((prev) => {
    const updated = { ...prev };
    delete updated[value]; // نحذف اللون (عدد الضغطات) لهذه الخلية
    return updated;
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
const RenderZodiacRing = () => {
  const radiusOuter = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5) + 50;
  const radiusInner = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5);
  const zodiacRadius = (radiusInner + radiusOuter) / 2;

  const zodiacBase = [
    { label: "نار الحمل", color: "red" },
    { label: "تراب الثور", color: "blue" },
    { label: "هواء الجوزاء", color: "black" },
    { label: "ماء السرطان", color: "red" },
    { label: "نار الأسد", color: "blue" },
    { label: "تراب السنبلة", color: "black" },
    { label: "هواء الميزان", color: "red" },
    { label: "ماء العقرب", color: "blue" },
    { label: "نار القوس", color: "black" },
    { label: "تراب الجدي", color: "red" },
    { label: "هواء الدلو", color: "blue" },
    { label: "ماء الحوت", color: "black" },
  ];

  const zodiacCycle = [...zodiacBase, ...zodiacBase, ...zodiacBase]; // 36 برج

  const totalSectors = zodiacCycle.length;
  const angleStep = 10;
  const angleStart = -85; // هنا التعديل لحل المشكلة
  return (
    <g>
      {zodiacCycle.map(({ label, color }, i) => {
        const startAngle = angleStart + i * angleStep;
        const endAngle = startAngle + angleStep;
        const midAngle = (startAngle + endAngle) / 2;

        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        const midRad = (midAngle * Math.PI) / 180;

        const x1 = center + radiusInner * Math.cos(startRad);
        const y1 = center + radiusInner * Math.sin(startRad);
        const x2 = center + radiusOuter * Math.cos(startRad);
        const y2 = center + radiusOuter * Math.sin(startRad);
        const x3 = center + radiusOuter * Math.cos(endRad);
        const y3 = center + radiusOuter * Math.sin(endRad);
        const x4 = center + radiusInner * Math.cos(endRad);
        const y4 = center + radiusInner * Math.sin(endRad);

        const xText = center + zodiacRadius * Math.cos(midRad);
        const yText = center + zodiacRadius * Math.sin(midRad);

        return (
          <g key={`zodiac-${i}`}>
            <path
              d={`M ${x1},${y1} L ${x2},${y2} A ${radiusOuter},${radiusOuter} 0 0,1 ${x3},${y3} L ${x4},${y4} A ${radiusInner},${radiusInner} 0 0,0 ${x1},${y1} Z`}
              fill="#eee"
              stroke="#FFD700"
              strokeWidth={0.8}
            />
            <text
              x={xText}
              y={yText}
              fill={color}
              fontSize={10}
              textAnchor="middle"
              dominantBaseline="middle"
              fontWeight="bold"
              transform={`rotate(${midAngle + 90}, ${xText}, ${yText})`}
            >
              {label}
            </text>
          </g>
        );
      })}
    </g>
  );
};

const handleExportPNG = () => {
  const svg = svgRef.current;
  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  canvas.width = svg.clientWidth * 2;
  canvas.height = svg.clientHeight * 2;

  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    const pngImg = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "gann-circle.png";
    link.href = pngImg;
    link.click();
  };
  img.src = url;
};

const handleExportPDF = () => {
  const svgElement = svgRef.current;
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  canvas.width = svgElement.clientWidth * 2;
  canvas.height = svgElement.clientHeight * 2;

  img.onload = async () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);

    const imgData = canvas.toDataURL("image/png");
    const jsPDF = await import("jspdf");
    const pdf = new jsPDF.jsPDF("landscape", "pt", [
      canvas.width,
      canvas.height,
    ]);
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("gann-circle.pdf");
  };

  img.src = url;
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
      {/* 🔍 أزرار التكبير والتصغير على الطرف الأيمن */}

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
  {/* البوكس الخاص بالاعدادات */}
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
  {/* 🟡 زر دائري في الزاوية اليمنى العليا */}
<button
  onClick={() => setShowSettings(!showSettings)}
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

{/* 🎛️ زر إظهار/إخفاء أزرار التكبير */}
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
  <button onClick={handleExportPNG}>📷 جفظ الصورة</button>
  <button onClick={handleExportPDF}>📄 طباعة PDF</button>
</div>


{/* ✅ اظهار حلقة الابراج و حلقة الزوايا*/}
<button
  onClick={() => setShowDegreeRing(!showDegreeRing)}
  style={buttonStyle}
>
  🧭 {settings.language === "ar"
    ? (showDegreeRing ? "إخفاء حلقة الزوايا" : "إظهار حلقة الزوايا")
    : (showDegreeRing ? "Hide Degree Ring" : "Show Degree Ring")}
</button>

<button
  onClick={() => setShowZodiacRing(!showZodiacRing)}
  style={buttonStyle}
>
  ♈ {settings.language === "ar"
    ? (showZodiacRing ? "إخفاء الأبراج" : "إظهار الأبراج")
    : (showZodiacRing ? "Hide Zodiac" : "Show Zodiac")}
</button>
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
  {/* 🧲 عجلة الزوايا */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "1px" }}>
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
<div style={{ margin: "0px", textAlign: "center", marginBottom: "0px", paddingBottom: "0px" }}>
  <label style={{ fontWeight: "bold", marginBottom: "4px", display: "block" }}>
    اختيار الأشكال الهندسية:
  </label>
  <select
    value={selectedShape}
    onChange={(e) => setSelectedShape(e.target.value)}
    style={{
      margin: "0px",
      padding: "6px",
      fontSize: "16px",
      display: "block",
      width: "100%",
      maxWidth: "250px",
      marginInline: "auto",
    }}
  >
    <option value="">-- اختر --</option>
    <option value="triangle">🔺 إظهار المثلث</option>
    <option value="square">⬛ إظهار المربع</option>
    <option value="star4">⭐ إظهار النجمة الرباعية</option>
    <option value="pentagon">🔷 إظهار الخماسي</option>
    <option value="star5">⭐  إظهار النجمة الخماسية</option>
    <option value="hexagon">🛑 إظهار السداسي</option>
    <option value="star6">⭐ إظهار النجمة السداسية</option>
    <option value="heptagon">🔷 إظهار السباعي</option>
    <option value="star7">⭐ إظهار النجمة السباعية</option>
    <option value="octagon">🧿 إظهار المربع الثماني</option>
    <option value="star8">⭐ إظهار نجمة مثمنة</option>
    <option value="nonagon">🔷 إظهار التساعي</option>
    <option value="star9">⭐ إظهار النجمة التساعية</option>
    <option value="decagon">🔷 إظهار الشكل العشاري</option>
    <option value="star10">⭐ إظهار النجمة العشارية</option>
    <option value="eleven">🔷 إظهار الحادي عشر</option>
    <option value="star11">⭐ إظهار النجمة الحادية عشر</option>
    <option value="twelve">🔷 إظهار الاثني عشر</option>
    <option value="star12">⭐ النجمة الإثني عشرية {12/5}</option>
    <option value="anglewheel">🧲 إظهار عجلة الزوايا</option>
    <option value="circles">🟡 إظهار الدوائر المتداخلة</option>
  </select>
</div>

{/* ✅ أدوات المثلث */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "1px" }}>

  {selectedShape === "triangle" && (
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
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "1px" }}>

 {selectedShape === "square" && (
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

{/* ⭐ أدوات النجمة الرباعية */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "1px" }}>

  {selectedShape === "star4" && (
    <>
      {customStar4Angles.map((angle, idx) => {
        const rotated = (angle + star4Rotation + settings.rotation) % 360;
        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - star4Rotation - settings.rotation + 360) % 360;
              const newAngles = [...customStar4Angles];
              newAngles[idx] = newOriginal;
              setCustomStar4Angles(newAngles);
            }}
            style={{ ...inputStyle, marginBottom: "6px" }}
          />
        );
      })}
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={star4Rotation}
        onChange={(e) => setStar4Rotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillStar4} onChange={() => setFillStar4(!fillStar4)} /> تعبئة</label>
      <label><input type="checkbox" checked={highlightStar4} onChange={() => setHighlightStar4(!highlightStar4)} /> تمييز</label>
    </>
  )}
</div>

{/* 🔷 أدوات الشكل الخماسي */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "1px" }}>
  {selectedShape === "pentagon" && (
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

{/* ⭐ أدوات النجمة الخماسيه */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "1px" }}>
 {selectedShape === "star5" && (
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
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "1px" }}>
  {selectedShape === "hexagon" && (
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
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "1px" }}>
 {selectedShape === "star6" && (
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

{/* 🔷 أدوات الشكل السباعي */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "1px" }}>
  {selectedShape === "heptagon" && (
    <>
      <label>♻️ تدوير</label>
      <input
        type="range"
        min="0"
        max="360"
        value={heptagonRotation}
        onChange={(e) => setHeptagonRotation(parseFloat(e.target.value))}
      />

      <label>
        <input type="checkbox" checked={fillHeptagon} onChange={() => setFillHeptagon(!fillHeptagon)} />
        {settings.language === "ar" ? "تعبئة الشكل" : "Fill"}
      </label>

      <label>
        <input type="checkbox" checked={highlightHeptagon} onChange={() => setHighlightHeptagon(!highlightHeptagon)} />
        {settings.language === "ar" ? "تمييز الرؤوس" : "Highlight"}
      </label>
    </>
  )}
</div>


{/* ⭐ أدوات النجمة السباعية */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "1px" }}>


 {selectedShape === "star7" && (
    <>
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={star7Rotation}
        onChange={(e) => setStar7Rotation(parseFloat(e.target.value))} />

      <label>
        <input type="checkbox" checked={fillStar7} onChange={() => setFillStar7(!fillStar7)} />
        {settings.language === "ar" ? "تعبئة" : "Fill"}
      </label>

      <label>
        <input type="checkbox" checked={highlightStar7} onChange={() => setHighlightStar7(!highlightStar7)} />
        {settings.language === "ar" ? "تمييز الرؤوس" : "Highlight Points"}
      </label>
    </>
  )}
</div>


{/* 🧿 أدوات الشكل المثمن */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "1px" }}>

 {selectedShape === "octagon" && (
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
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "1px" }}>
{selectedShape === "star8" && (
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

{/* 🔷 أدوات الشكل التساعي */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "1px" }}>
  {selectedShape === "nonagon" && (
    <>
      <label>♻️ تدوير</label>
      <input
        type="range"
        min="0"
        max="360"
        value={nonagonRotation}
        onChange={(e) => setNonagonRotation(parseFloat(e.target.value))}
      />

      <label>
        <input type="checkbox" checked={fillNonagon} onChange={() => setFillNonagon(!fillNonagon)} />
        {settings.language === "ar" ? "تعبئة الشكل" : "Fill"}
      </label>

      <label>
        <input type="checkbox" checked={highlightNonagon} onChange={() => setHighlightNonagon(!highlightNonagon)} />
        {settings.language === "ar" ? "تمييز الرؤوس" : "Highlight"}
      </label>
    </>
  )}
</div>

{/* ⭐ أدوات النجمة التساعية */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "1px" }}>

  {selectedShape === "star9" && (
    <>
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={star9Rotation}
        onChange={(e) => setStar9Rotation(parseFloat(e.target.value))} />

      <label>
        <input type="checkbox" checked={fillStar9} onChange={() => setFillStar9(!fillStar9)} />
        {settings.language === "ar" ? "تعبئة" : "Fill"}
      </label>

      <label>
        <input type="checkbox" checked={highlightStar9} onChange={() => setHighlightStar9(!highlightStar9)} />
        {settings.language === "ar" ? "تمييز الرؤوس" : "Highlight"}
      </label>
    </>
  )}
</div>

{/* 🔷 أدوات الشكل العشاري */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "1px" }}>

 {selectedShape === "decagon" && (
    <>
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={decagonRotation}
        onChange={(e) => setDecagonRotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillDecagon} onChange={() => setFillDecagon(!fillDecagon)} /> تعبئة</label>
      <label><input type="checkbox" checked={highlightDecagon} onChange={() => setHighlightDecagon(!highlightDecagon)} /> تمييز</label>
    </>
  )}
</div>

{/* ⭐ أدوات النجمة العشارية */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "1px" }}>

  {selectedShape === "star10" && (
    <>
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={star10Rotation}
        onChange={(e) => setStar10Rotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillStar10} onChange={() => setFillStar10(!fillStar10)} /> تعبئة</label>
      <label><input type="checkbox" checked={highlightStar10} onChange={() => setHighlightStar10(!highlightStar10)} /> تمييز</label>
    </>
  )}
</div>

{/* 🔷 أدوات الشكل الحادي عشر */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "1px" }}>

  {selectedShape === "hendecagon" && (
    <>
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={hendecagonRotation}
        onChange={(e) => setHendecagonRotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillHendecagon} onChange={() => setFillHendecagon(!fillHendecagon)} /> تعبئة</label>
      <label><input type="checkbox" checked={highlightHendecagon} onChange={() => setHighlightHendecagon(!highlightHendecagon)} /> تمييز</label>
    </>
  )}
</div>

{/* ⭐ أدوات النجمة الحادية عشر */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "1px" }}>

  {selectedShape === "star11" && (
    <>
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={star11Rotation}
        onChange={(e) => setStar11Rotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillStar11} onChange={() => setFillStar11(!fillStar11)} /> تعبئة</label>
      <label><input type="checkbox" checked={highlightStar11} onChange={() => setHighlightStar11(!highlightStar11)} /> تمييز</label>
    </>
  )}
</div>

{/* 🔷 أدوات الشكل الاثني عشر */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "1px" }}>

  {selectedShape === "dodecagon" && (
    <>
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={dodecagonRotation}
        onChange={(e) => setDodecagonRotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillDodecagon} onChange={() => setFillDodecagon(!fillDodecagon)} /> تعبئة</label>
      <label><input type="checkbox" checked={highlightDodecagon} onChange={() => setHighlightDodecagon(!highlightDodecagon)} /> تمييز</label>
    </>
  )}
</div>

{/* ⭐ أدوات النجمة 12/5 */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "1px" }}>

  {selectedShape === "star12" && (
    <>
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={star12Rotation}
        onChange={(e) => setStar12Rotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillStar12} onChange={() => setFillStar12(!fillStar12)} /> تعبئة</label>
      <label><input type="checkbox" checked={highlightStar12} onChange={() => setHighlightStar12(!highlightStar12)} /> تمييز</label>
    </>
  )}
</div>

{/* 🟡 الدوائر المتداخلة */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "1px" }}>
  {selectedShape === "circles" && (
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
  </>
)}
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
> {/*'🔵 دائرة جان ديفيد'*/}
<div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "200vh",
    backgroundColor: "#111", // اختياري: خلفية داكنة
  }}
>
  <svg
        ref={svgRef}
     width="100%"
     height="100%"
     viewBox={`0 0 ${dynamicSize} ${dynamicSize}`}
     style={{
    display: "block",
    margin: "0 auto",
    background: "#f2f2f2",
    cursor: isDragging ? "grabbing" : "grab",    }}
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

const angleOffset = Math.PI / 2; // 90 درجة بالراديان

const angle = index * angleStep - angleOffset + angleStep / 2;
const angleMid = angle;
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

  // دالة لاختزال الرقم
  const reduceToDigit = (num) => {
    while (num > 9) {
      num = num.toString().split("").reduce((a, b) => a + Number(b), 0);
    }
    return num;
  };

  const reduced = reduceToDigit(value);
  const reducedStart = reduceToDigit(settings.startValue);

  // الزاوية التي يبدأ منها الرقم المختزل الأول
  const baseAngles = {
    1: 10,
    2: 20,
    3: 30,
    4: 40,
    5: 50,
    6: 60,
    7: 70,
    8: 80,
    9: 90,
  };

  // الزاوية الفعلية لهذا الرقم ضمن الدورة
  const sequenceIndex = value - settings.startValue;
  const baseAngle = baseAngles[reducedStart];
  const angleDeg = (baseAngle + sequenceIndex * 10) % 360 || 360;
  const angleRad = (angleDeg - 90) * (Math.PI / 180);

  const angleStart = angleRad - (5 * Math.PI / 180);
  const angleEnd = angleRad + (5 * Math.PI / 180);
  const angleMid = angleRad;

  // أنصاف الأقطار
  const r1 = innerRadius + [...Array(level)].reduce((acc, l) => {
    const maxDigits = Math.max(
      ...Array.from({ length: settings.divisions }, (_, i) =>
        (settings.startValue + l * settings.divisions + i).toString().length
      )
    );
    return acc + (baseRingWidth + maxDigits * digitScale);
  }, 0);

  const maxDigits = value.toString().length;
  const dynamicWidth = baseRingWidth + maxDigits * digitScale;
  const r2 = r1 + dynamicWidth;
  const rMid = (r1 + r2) / 2;

  // إحداثيات النص
  const x = center + rMid * Math.cos(angleMid);
  const y = center + rMid * Math.sin(angleMid);

  const fontSize = 8;

  const getDigitColor = (digit) => {
    if ([1, 4, 7].includes(digit)) return "red";
    if ([2, 5, 8].includes(digit)) return "blue";
    if ([3, 6, 9].includes(digit)) return "black";
    return "black";
  };

  const path = getPathForCell(r1, r2, angleStart, angleEnd);

  return (
// داخل map الخاص بالحلقات والخلايا:
<g key={`${level}-${index}`}>
  <path
    d={path}
    fill={getClickColor(value) || "#fff"}
    stroke="#aaa"
    strokeWidth={0.5}
    onClick={() => handleCellClick(value)}
    onDoubleClick={() => handleDoubleClick(value)} // ضغطتين لإلغاء اللون

    style={{ cursor: "pointer" }}
  />

  {/* الرقم الكامل في مركز الخلية */}
  <text
    x={x}
    y={y}
    fill={getDigitColor(reduced)}
    fontSize={fontSize}
    textAnchor="middle"
    dominantBaseline="middle"
    fontWeight="bold"
  >
    {value}
  </text>

  {/* ✅ الرقم المختزل مرفوع للأعلى قليلاً داخل الخلية */}
  <text
    x={center + (r1 + 6) * Math.cos(angleMid)}
    y={center + (r1 + 6) * Math.sin(angleMid)}
    fill={getDigitColor(reduced)}
    fontSize={fontSize - 2}
    textAnchor="middle"
    dominantBaseline="middle"
    fontWeight="bold"
  >
    {reduced}
  </text>


   
// 🧭 حلقة الزوايا الخارجية المرتبطة بمجموع الرقم


{showDegreeRing && [...Array(36)].map((_, index) => {
  const angleDeg = (index + 1) * 10;

  // 🔢 الرقم المختزل لمجموع الزاوية
  const digitSum = angleDeg.toString().split('').reduce((sum, d) => sum + parseInt(d), 0);
  const reduced = digitSum > 9
    ? digitSum.toString().split('').reduce((sum, d) => sum + parseInt(d), 0)
    : digitSum;

  // 🎨 اللون حسب الرقم المختزل
  const getDigitColor = (n) =>
    n === 1 || n === 4 || n === 7 ? "red" :
    n === 2 || n === 5 || n === 8 ? "blue" :
    "black";

  const angleRad = (angleDeg - 90) * (Math.PI / 180); // -90 لجعل البداية من الأعلى
  const r = innerRadius + [...Array(settings.levels)].reduce((acc, l) => {
    const maxDigits = Math.max(
      ...Array.from({ length: settings.divisions }, (_, i) =>
        (settings.startValue + l * settings.divisions + i).toString().length
      )
    );
    return acc + (baseRingWidth + maxDigits * digitScale);
  }, 0) + 40;

  const x = center + r * Math.cos(angleRad);
  const y = center + r * Math.sin(angleRad);

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
      {angleDeg}°
    </text>
  );
})}

{showZodiacRing && <RenderZodiacRing />}

              </g>
            );
          })}
        </React.Fragment>

      );
    })}
{showZodiacRing && <RenderZodiacRing />}



{/* ✅ رسم المثلث داخل الدائرة */}
{selectedShape === "triangle" && (
  <g>
    {(() => {
      const r = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5); // نصف القطر الديناميكي
      const trianglePoints = customAngles.map((deg) => {
        const rad = ((deg + triangleRotation + settings.rotation) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      return (
        <>
          {/* ✅ المثلث نفسه */}
          <polygon
            points={trianglePoints.map(p => `${p.x},${p.y}`).join(" ")}
            fill={fillTriangle ? "rgba(0, 128, 255, 0.2)" : "none"}
            stroke="green"
            strokeWidth={2}
          />

          {/* ✅ تمييز الزوايا بدوائر */}
          {highlightTriangle &&
            trianglePoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill="yellow" />
            ))}

          {/* ✅ الخطوط الداخلية من الرؤوس إلى المركز */}
          {trianglePoints.map((point, index) => (
            <line
              key={`line-${index}`}
              x1={point.x}
              y1={point.y}
              x2={center}
              y2={center}
              stroke="green"
              strokeWidth={3}
              strokeDasharray="4,2"
            />
          ))}

          {/* ✅ عرض الزوايا النصية عند الرؤوس */}
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
{selectedShape === "square" && (
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


{/* ⭐ رسم النجمة الرباعية */}
{/* ⭐ رسم النجمة الرباعية الحقيقية (شكل كوكسيتير مثل الصورة) */}
{selectedShape === "star4" && (
  <g>
    {(() => {
      const R_outer = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5);
      const R_inner = R_outer * 0.45; // نصف القطر الداخلي = 45% من الخارجي

      const angles = [...Array(8)].map((_, i) => i * 45 + star4Rotation + settings.rotation);
      const points = angles.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const r = i % 2 === 0 ? R_outer : R_inner;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
          angle: deg % 360,
        };
      });

      return (
        <>
          <polygon
            points={points.map(p => `${p.x},${p.y}`).join(" ")}
            fill={fillStar4 ? "rgba(255, 0, 255, 0.2)" : "none"}
            stroke="magenta"
            strokeWidth={2}
          />
          {highlightStar4 &&
            points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill="magenta" />
            ))}
          {points.map((p, i) => (
            <line key={i} x1={p.x} y1={p.y} x2={center} y2={center} stroke="magenta" strokeDasharray="4,2" />
          ))}
          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={p.y - 10}
              fill="magenta"
              fontSize={11}
              fontWeight="bold"
              textAnchor="middle"
            >
              ({Math.round(p.angle)}°)
            </text>
          ))}
        </>
      );
    })()}
  </g>
)}
{/*  رسم الخماسي داخل الدائرة */}
 {selectedShape === "pentagon" && (
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
 {selectedShape === "star5" && (
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
 {selectedShape === "hexagon" && (
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
{/*  ⭐ رسم النجمة السداسية بشكل مركب من مثلثين */}
 {selectedShape === "star6" && (
  <g>
    {(() => {
      const r = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5);
      // مثلث أول (0°, 120°, 240°)
      const triangle1 = [0, 120, 240].map((deg) => {
        const rad = ((deg + hexagramRotation + settings.rotation) * Math.PI) / 180;
        return { x: center + r * Math.cos(rad), y: center + r * Math.sin(rad), angle: deg };
      });
      // مثلث ثاني (60°, 180°, 300°)
      const triangle2 = [60, 180, 300].map((deg) => {
        const rad = ((deg + hexagramRotation + settings.rotation) * Math.PI) / 180;
        return { x: center + r * Math.cos(rad), y: center + r * Math.sin(rad), angle: deg };
      });
      const allPoints = [...triangle1, ...triangle2];
      return (
        <>
          {/* مثلث أول */}
          <polygon
            points={triangle1.map((p) => `${p.x},${p.y}`).join(" ")}
            fill={fillHexagram ? "rgba(138, 43, 226, 0.2)" : "none"}
            stroke="purple"
            strokeWidth={2}
          />
          {/* مثلث ثاني */}
          <polygon
            points={triangle2.map((p) => `${p.x},${p.y}`).join(" ")}
            fill={fillHexagram ? "rgba(138, 43, 226, 0.2)" : "none"}
            stroke="purple"
            strokeWidth={2}
          />
          {/* نقاط الرؤوس */}
          {highlightHexagram &&
            allPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill="violet" />
            ))}
          {/* خطوط من كل رأس إلى المركز */}
          {allPoints.map((p, i) => (
            <line key={i} x1={p.x} y1={p.y} x2={center} y2={center} stroke="purple" strokeDasharray="4,2" />
          ))}

          {/* الزوايا */}
          {allPoints.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={p.y - 10}
              fill="purple"
              fontSize={12}
              fontWeight="bold"
              textAnchor="middle"
            >
              ({(p.angle + hexagramRotation + settings.rotation) % 360}°)
            </text>
          ))}
        </>
      );
    })()}
  </g>
)}
{/* 🔷 رسم الشكل السباعي المنتظم */}
 {selectedShape === "heptagon" && (
  <g>
    {(() => {
      const R = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5);
      const centerX = center;
      const centerY = center;

      const points = [...Array(7)].map((_, i) => {
        const angle = ((i * 360 / 7 + heptagonRotation + settings.rotation) * Math.PI) / 180;
        return {
          x: centerX + R * Math.cos(angle),
          y: centerY + R * Math.sin(angle),
          angleDeg: (i * 360 / 7 + heptagonRotation + settings.rotation) % 360
        };
      });
      return (
        <>
          <polygon
            points={points.map(p => `${p.x},${p.y}`).join(" ")}
            fill={fillHeptagon ? "rgba(0, 100, 255, 0.2)" : "none"}
            stroke="blue"
            strokeWidth={2}
          />
          {highlightHeptagon &&
            points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill="blue" />
            ))}
          {points.map((p, i) => (
            <line key={i} x1={p.x} y1={p.y} x2={centerX} y2={centerY} stroke="blue" strokeDasharray="4,2" />
          ))}
          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={p.y - 10}
              fill="blue"
              fontSize={11}
              fontWeight="bold"
              textAnchor="middle"
            >
              ({Math.round(p.angleDeg)}°)
            </text>
          ))}
        </>
      );
    })()}
  </g>
)}
{/* ⭐ رسم النجمة السباعية */}
 {selectedShape === "star7" && (
  <g>
    {(() => {
      const R_outer = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5);
      const R_inner = R_outer * 0.45;
      const points = [];
      for (let i = 0; i < 14; i++) {
        const deg = i * (360 / 14) + star7Rotation + settings.rotation;
        const rad = (deg * Math.PI) / 180;
        const r = i % 2 === 0 ? R_outer : R_inner;
        points.push({
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
          angle: deg % 360,
        });
      }
      return (
        <>
          <polygon
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill={fillStar7 ? "rgba(0, 0, 139, 0.2)" : "none"}
            stroke="darkblue"
            strokeWidth={2}
          />
          {highlightStar7 &&
            points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill="darkblue" />
            ))}
          {points.map((p, i) => (
            <line key={i} x1={p.x} y1={p.y} x2={center} y2={center} stroke="darkblue" strokeDasharray="4,2" />
          ))}
          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={p.y - 10}
              fill="darkblue"
              fontSize={11}
              fontWeight="bold"
              textAnchor="middle"
            >
              ({Math.round(p.angle)}°)
            </text>
          ))}
        </>
      );
    })()}
  </g>
)}
{/* 🧿 رسم المربع الثماني*/}
 {selectedShape === "octagon" && (
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
{/* ⭐ رسم النجمة الثمانية (8/3 شليفلي) */}
 {selectedShape === "star8" && (
  <g>
    {(() => {
      const R = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5);
      // 8 رؤوس منتظمة كل 45°
      const points = [...Array(8)].map((_, i) => {
        const angle = ((i * 45 + starOctagonRotation + settings.rotation) * Math.PI) / 180;
        return {
          x: center + R * Math.cos(angle),
          y: center + R * Math.sin(angle),
          angleDeg: (i * 45 + starOctagonRotation + settings.rotation) % 360,
        };
      });
      // ترتيب النقاط حسب شليفلي 8/3 => كل ثالث نقطة
      const order = [];
      let index = 0;
      for (let i = 0; i < 8; i++) {
        order.push(points[index]);
        index = (index + 3) % 8;
      }
      return (
        <>
          <polygon
            points={order.map((p) => `${p.x},${p.y}`).join(" ")}
            fill={fillStarOctagon ? "rgba(0, 0, 0, 0.15)" : "none"}
            stroke="black"
            strokeWidth={2}
          />

          {highlightStarOctagon &&
            order.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill="magenta" />
            ))}

          {order.map((p, i) => (
            <line key={i} x1={p.x} y1={p.y} x2={center} y2={center} stroke="black" strokeDasharray="4,2" />
          ))}
          {order.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={p.y - 10}
              fill="black"
              fontSize={11}
              fontWeight="bold"
              textAnchor="middle"
            >
              ({Math.round(p.angleDeg)}°)
            </text>
          ))}
        </>
      );
    })()}
  </g>
)}
{/* 🔷 رسم الشكل التساعي المنتظم */}
 {selectedShape === "nonagon" && (
  <g>
    {(() => {
      const R = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5);
      const centerX = center;
      const centerY = center;
      const points = [...Array(9)].map((_, i) => {
        const angle = ((i * 360 / 9 + nonagonRotation + settings.rotation) * Math.PI) / 180;
        return {
          x: centerX + R * Math.cos(angle),
          y: centerY + R * Math.sin(angle),
          angleDeg: (i * 360 / 9 + nonagonRotation + settings.rotation) % 360
        };
      });
      return (
        <>
          <polygon
            points={points.map(p => `${p.x},${p.y}`).join(" ")}
            fill={fillNonagon ? "rgba(0, 0, 139, 0.2)" : "none"}
            stroke="darkblue"
            strokeWidth={2}
          />
          {highlightNonagon &&
            points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill="darkblue" />
            ))}
          {points.map((p, i) => (
            <line key={i} x1={p.x} y1={p.y} x2={centerX} y2={centerY} stroke="darkblue" strokeDasharray="4,2" />
          ))}
          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={p.y - 10}
              fill="darkblue"
              fontSize={11}
              fontWeight="bold"
              textAnchor="middle"
            >
              ({Math.round(p.angleDeg)}°)
            </text>
          ))}
        </>
      );
    })()}
  </g>
)}
{/* ⭐ رسم النجمة التساعية المنتظمة {9/2} */}
 {selectedShape === "star9" && (
  <g>
    {(() => {
      const R = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5);
      const basePoints = [...Array(9)].map((_, i) => {
        const angle = ((i * 360 / 9 + star9Rotation + settings.rotation) * Math.PI) / 180;
        return {
          x: center + R * Math.cos(angle),
          y: center + R * Math.sin(angle),
          angleDeg: (i * 360 / 9 + star9Rotation + settings.rotation) % 360
        };
      });
      // ترتيب النجمة {9/2}: كل ثاني نقطة
      const ordered = [];
      let index = 0;
      const visited = new Set();
      for (let i = 0; i < 9; i++) {
        ordered.push(basePoints[index]);
        visited.add(index);
        index = (index + 2) % 9;
        if (visited.has(index)) break; // تأمين منع التكرار
      }
      return (
        <>
          <polygon
            points={ordered.map(p => `${p.x},${p.y}`).join(" ")}
            fill={fillStar9 ? "rgba(255, 105, 180, 0.2)" : "none"}
            stroke="black"
            strokeWidth={2}
          />
          {highlightStar9 &&
            ordered.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill="deeppink" />
            ))}
          {ordered.map((p, i) => (
            <line key={i} x1={p.x} y1={p.y} x2={center} y2={center} stroke="black" strokeDasharray="4,2" />
          ))}
          {ordered.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={p.y - 10}
              fill="black"
              fontSize={11}
              fontWeight="bold"
              textAnchor="middle"
            >
              ({Math.round(p.angleDeg)}°)
            </text>
          ))}
        </>
      );
    })()}
  </g>
)}
{/* 🔷 رسم الشكل العشاري المنتظم */}
 {selectedShape === "decagon" && (
  <g>
    {(() => {
      const R = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5);
      const points = [...Array(10)].map((_, i) => {
        const angle = ((i * 360 / 10 + decagonRotation + settings.rotation) * Math.PI) / 180;
        return {
          x: center + R * Math.cos(angle),
          y: center + R * Math.sin(angle),
          angleDeg: (i * 360 / 10 + decagonRotation + settings.rotation) % 360
        };
      });
      return (
        <>
          <polygon
            points={points.map(p => `${p.x},${p.y}`).join(" ")}
            fill={fillDecagon ? "rgba(30, 144, 255, 0.2)" : "none"}
            stroke="dodgerblue"
            strokeWidth={2}
          />
          {highlightDecagon &&
            points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill="dodgerblue" />
            ))}
          {points.map((p, i) => (
            <line key={i} x1={p.x} y1={p.y} x2={center} y2={center} stroke="dodgerblue" strokeDasharray="4,2" />
          ))}
          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={p.y - 10}
              fill="dodgerblue"
              fontSize={11}
              fontWeight="bold"
              textAnchor="middle"
            >
              ({Math.round(p.angleDeg)}°)
            </text>
          ))}
        </>
      );
    })()}
  </g>
)}
{/* ⭐ رسم النجمة العشارية المنتظمة {10/3} */}
 {selectedShape === "star10" && (
  <g>
    {(() => {
      const R = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5);
      const basePoints = [...Array(10)].map((_, i) => {
        const angle = ((i * 360 / 10 + star10Rotation + settings.rotation) * Math.PI) / 180;
        return {
          x: center + R * Math.cos(angle),
          y: center + R * Math.sin(angle),
          angleDeg: (i * 360 / 10 + star10Rotation + settings.rotation) % 360
        };
      });
      const ordered = [];
      let index = 0;
      const visited = new Set();
      for (let i = 0; i < 10; i++) {
        ordered.push(basePoints[index]);
        visited.add(index);
        index = (index + 3) % 10;
        if (visited.has(index)) break;
      }
      return (
        <>
          <polygon
            points={ordered.map(p => `${p.x},${p.y}`).join(" ")}
            fill={fillStar10 ? "rgba(139, 0, 0, 0.2)" : "none"}
            stroke="darkred"
            strokeWidth={2}
          />
          {highlightStar10 &&
            ordered.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill="darkred" />
            ))}
          {ordered.map((p, i) => (
            <line key={i} x1={p.x} y1={p.y} x2={center} y2={center} stroke="darkred" strokeDasharray="4,2" />
          ))}
          {ordered.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={p.y - 10}
              fill="darkred"
              fontSize={11}
              fontWeight="bold"
              textAnchor="middle"
            >
              ({Math.round(p.angleDeg)}°)
            </text>
          ))}
        </>
      );
    })()}
  </g>
)}
{/* 🔷 رسم الشكل الهندسي الحادي عشر المنتظم */}
 {selectedShape === "hendecagon" && (
  <g>
    {(() => {
      const R = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5);
      const points = [...Array(11)].map((_, i) => {
        const angle = ((i * 360 / 11 + hendecagonRotation + settings.rotation) * Math.PI) / 180;
        return {
          x: center + R * Math.cos(angle),
          y: center + R * Math.sin(angle),
          angleDeg: (i * 360 / 11 + hendecagonRotation + settings.rotation) % 360
        };
      });
      return (
        <>
          <polygon
            points={points.map(p => `${p.x},${p.y}`).join(" ")}
            fill={fillHendecagon ? "rgba(0, 0, 128, 0.2)" : "none"}
            stroke="navy"
            strokeWidth={2}
          />
          {highlightHendecagon &&
            points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill="navy" />
            ))}
          {points.map((p, i) => (
            <line key={i} x1={p.x} y1={p.y} x2={center} y2={center} stroke="navy" strokeDasharray="4,2" />
          ))}
          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={p.y - 10}
              fill="navy"
              fontSize={11}
              fontWeight="bold"
              textAnchor="middle"
            >
              ({Math.round(p.angleDeg)}°)
            </text>
          ))}
        </>
      );
    })()}
  </g>
)}
{/* ⭐ رسم النجمة الحادية عشر {11/3} */}
 {selectedShape === "star11" && (
  <g>
    {(() => {
      const R = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5);
      const basePoints = [...Array(11)].map((_, i) => {
        const angle = ((i * 360 / 11 + star11Rotation + settings.rotation) * Math.PI) / 180;
        return {
          x: center + R * Math.cos(angle),
          y: center + R * Math.sin(angle),
          angleDeg: (i * 360 / 11 + star11Rotation + settings.rotation) % 360
        };
      });
      const ordered = [];
      let index = 0;
      const visited = new Set();
      for (let i = 0; i < 11; i++) {
        ordered.push(basePoints[index]);
        visited.add(index);
        index = (index + 3) % 11;
        if (visited.has(index)) break;
      }
      return (
        <>
          <polygon
            points={ordered.map(p => `${p.x},${p.y}`).join(" ")}
            fill={fillStar11 ? "rgba(255, 0, 0, 0.15)" : "none"}
            stroke="maroon"
            strokeWidth={2}
          />
          {highlightStar11 &&
            ordered.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill="maroon" />
            ))}
          {ordered.map((p, i) => (
            <line key={i} x1={p.x} y1={p.y} x2={center} y2={center} stroke="maroon" strokeDasharray="4,2" />
          ))}
          {ordered.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={p.y - 10}
              fill="maroon"
              fontSize={11}
              fontWeight="bold"
              textAnchor="middle"
            >
              ({Math.round(p.angleDeg)}°)
            </text>
          ))}
        </>
      );
    })()}
  </g>
)}
{/* 🔷 رسم الشكل الهندسي الاثني عشر المنتظم */}
 {selectedShape === "dodecagon" && (
  <g>
    {(() => {
      const R = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5);
      const points = [...Array(12)].map((_, i) => {
        const angle = ((i * 360 / 12 + dodecagonRotation + settings.rotation) * Math.PI) / 180;
        return {
          x: center + R * Math.cos(angle),
          y: center + R * Math.sin(angle),
          angleDeg: (i * 360 / 12 + dodecagonRotation + settings.rotation) % 360
        };
      });
      return (
        <>
          <polygon
            points={points.map(p => `${p.x},${p.y}`).join(" ")}
            fill={fillDodecagon ? "rgba(75, 0, 130, 0.2)" : "none"}
            stroke="indigo"
            strokeWidth={2}
          />
          {highlightDodecagon &&
            points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill="indigo" />
            ))}
          {points.map((p, i) => (
            <line key={i} x1={p.x} y1={p.y} x2={center} y2={center} stroke="indigo" strokeDasharray="4,2" />
          ))}
          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={p.y - 10}
              fill="indigo"
              fontSize={11}
              fontWeight="bold"
              textAnchor="middle"
            >
              ({Math.round(p.angleDeg)}°)
            </text>
          ))}
        </>
      );
    })()}
  </g>
)}
{/* ⭐ رسم النجمة الإثني عشرية المنتظمة {12/5} */}
 {selectedShape === "star12" && (
  <g>
    {(() => {
      const R = innerRadius + settings.levels * (baseRingWidth + digitScale * 5.5);
      const basePoints = [...Array(12)].map((_, i) => {
        const angle = ((i * 360 / 12 + star12Rotation + settings.rotation) * Math.PI) / 180;
        return {
          x: center + R * Math.cos(angle),
          y: center + R * Math.sin(angle),
          angleDeg: (i * 360 / 12 + star12Rotation + settings.rotation) % 360
        };
      });
      const ordered = [];
      let index = 0;
      const visited = new Set();
      for (let i = 0; i < 12; i++) {
        ordered.push(basePoints[index]);
        visited.add(index);
        index = (index + 5) % 12;
        if (visited.has(index)) break;
      }
      return (
        <>
          <polygon
            points={ordered.map(p => `${p.x},${p.y}`).join(" ")}
            fill={fillStar12 ? "rgba(0, 128, 0, 0.2)" : "none"}
            stroke="green"
            strokeWidth={2}
          />
          {highlightStar12 &&
            ordered.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill="green" />
            ))}
          {ordered.map((p, i) => (
            <line key={i} x1={p.x} y1={p.y} x2={center} y2={center} stroke="green" strokeDasharray="4,2" />
          ))}
          {ordered.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={p.y - 10}
              fill="green"
              fontSize={11}
              fontWeight="bold"
              textAnchor="middle"
            >
              ({Math.round(p.angleDeg)}°)
            </text>
          ))}
        </>
      );
    })()}
  </g>
)}
{/* 🧲 رسم عجلة الزوايا */}
{showAngleWheel && (
  <g>
    {(() => {
        const rayCount = Math.round(360 / angleStepRad);
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
            const labelX = center + (outerR + 12) * Math.cos(rad) +6;
            const labelY = center + (outerR + 12) * Math.sin(rad) + 6;
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
                  {Math.round(angle) === 0 ? "360°" : `${Math.round(angle)}°`}
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
{selectedShape === "circles" && (
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
{selectedShape === "circles" && (
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
{selectedShape === "circles" && (
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
