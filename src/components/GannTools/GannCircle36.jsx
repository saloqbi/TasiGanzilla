
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
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
   const [clickStates, setClickStates] = useState({});
     const [showTriangle, setShowTriangle] = useState(false);
     const [triangleRotation, setTriangleRotation] = useState(0);
     const [customAngles, setCustomAngles] = useState([0, 120, 240]);
     const [highlightTriangle, setHighlightTriangle] = useState(true);
     const [fillTriangle, setFillTriangle] = useState(true);


   const dragStart = useRef({ x: 0, y: 0 });

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
    min={0.2}
    max={3}
    step={0.1}
    value={zoom}
    onChange={(e) => setZoom(parseFloat(e.target.value))}
  />
  <span style={{ fontSize: "10px", color: "#aaa", marginTop: "4px" }}>
    {zoom.toFixed(1)}x
  </span>
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


    viewBox={`0 0 ${dynamicSize} ${dynamicSize}`}
    preserveAspectRatio="xMidYMid meet"
    style={{
      width: "100%",
      height: "100%",
      maxWidth: "100%",
      maxHeight: "100%",
      aspectRatio: "1 / 1",
      display: "block",
      cursor: isDragging ? "grabbing" : "grab",
    }}
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    onMouseLeave={handleMouseUp}
  >
 
    background: "#fff",    
 <g
          transform={`translate(${drag.x}, ${drag.y}) scale(${zoom}) translate(${(1 - zoom) * center}, ${(1 - zoom) * center})`}
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
