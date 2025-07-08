
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
  const lastLevel = settings.levels - 1;

  const outerRadius = innerRadius + [...Array(settings.levels)].reduce((acc, l) => {
    const maxDigits = Math.max(
      ...Array.from({ length: settings.divisions }, (_, i) =>
        (settings.startValue + l * settings.divisions + i).toString().length
      )
    );
    return acc + (baseRingWidth + maxDigits * digitScale);
  }, 0) + 50;

  return (
    <g>
      {[...Array(settings.divisions)].map((_, index) => {
        const angle = index * angleStep + (settings.rotation * Math.PI) / 180;
        const angleMid = angle + angleStep / 2;

        const x = center + outerRadius * Math.cos(angleMid);
        const y = center + outerRadius * Math.sin(angleMid);

        const value = settings.startValue + lastLevel * settings.divisions + index;
        const digitSum = reduceToDigit(value);
        const zodiacIndex = (value - 1) % 12;
        const { label, color } = zodiacLabels[zodiacIndex];

        return (
          <text
            key={`zodiac-${index}`}
            x={x}
            y={y}
            fill={color}
            fontSize={10}
            textAnchor="middle"
            dominantBaseline="middle"
            fontWeight="bold"
          >
            {label}
          </text>
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
      
  <button onClick={() => setZoom((z) => z + 0.1)} style={buttonStyle}>
    🔍 {settings.language === "ar" ? "تكبير" : "Zoom In"}
  </button>
  <button onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))} style={buttonStyle}>
    🔎 {settings.language === "ar" ? "تصغير" : "Zoom Out"}
  </button>
  <button onClick={() => rotateRight()} style={buttonStyle}>
    ➡️ {settings.language === "ar" ? "يمين" : "Right"}
  </button>
  <button onClick={() => rotateLeft()} style={buttonStyle}>
    ⬅️ {settings.language === "ar" ? "يسار" : "Left"}
  </button>




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
 
    background: "#fff",     <g
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
