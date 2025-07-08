
import React, { useState, useEffect, useRef } from "react";


const defaultSettings = {
  levels: 12,
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
  const innerRadius = 100;

  const angleStep = (2 * Math.PI) / totalSectors;
  const baseRingWidth = 50;
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
const RenderZodiacRing = () => {
  const zodiacSymbols = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
  const total = zodiacSymbols.length;

  const outerRadius = innerRadius + [...Array(settings.levels)].reduce((acc, l) => {
    const maxDigits = Math.max(
      ...Array.from({ length: settings.divisions }, (_, i) =>
        (settings.startValue + l * settings.divisions + i).toString().length
      )
    );
    return acc + (baseRingWidth + maxDigits * digitScale);
  }, 0) + 60;

  return (
    <g>
      {zodiacSymbols.map((symbol, index) => {
        const angle = (index * 2 * Math.PI) / total + (settings.rotation * Math.PI) / 180;
        const x = center + outerRadius * Math.cos(angle);
        const y = center + outerRadius * Math.sin(angle);

        return (
          <text
            key={`zodiac-${index}`}
            x={x}
            y={y}
            fill="#663399"
            fontSize={16}
            textAnchor="middle"
            dominantBaseline="middle"
            fontWeight="bold"
          >
            {symbol}
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", flexWrap: "wrap" }}>

  <h2 style={{ color: "#FFD700", margin: 0, fontSize: 26, fontWeight: "bold" }}>
    {settings.language === "ar"
      ? "🌀 ساعة كوكبة تاسي"
      : "🌀 Gann 360 Circle"}
  </h2>

  <div style={{
  display: "flex",
  gap: "30px",
  backgroundColor: "#222",
  padding: "12px 24px",
  borderRadius: "10px",
  color: "#FFD700",
  border: "1px solid #FFD700",
  boxShadow: "0 0 10px rgba(255, 215, 0, 0.3)"
  }}>
    <div style={{ textAlign: "center" , color: "#00CED1"}}>
    <div style={{ fontSize: "16px" }}>{getGregorianDate()}</div>
    <div style={{ fontSize: "13px" }}>🕐 GMT: {formatTime(currentTime, 0)}</div>
  </div>
  <div style={{ textAlign: "center", color: "#FFA500" }}>
    <div style={{ fontSize: "16px" }}>{getHijriDate()}</div>
    <div style={{ fontSize: "13px" }}>🇸🇦 KSA: {formatTime(currentTime, 3)}</div>
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

      <div style={{ marginBottom: 10, flexWrap: "wrap" }}>
      
	<button onClick={() => rotateRight()} style={buttonStyle}>
  	➡️ {settings.language === "ar" ? "يمين" : "Right"}
	</button>

	  <button onClick={() => rotateLeft()} style={buttonStyle}>
	  ⬅️ {settings.language === "ar" ? "يسار" : "Left"}
	</button>



        <button onClick={toggleLang} style={buttonStyle}>
          🌐 {settings.language === "ar" ? "English" : "العربية"}
        </button>
        <button onClick={() => setZoom((z) => z + 0.1)} style={buttonStyle}>
          🔍 {settings.language === "ar" ? "تكبير" : "Zoom In"}
        </button>
        <button onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))} style={buttonStyle}>
          🔎 {settings.language === "ar" ? "تصغير" : "Zoom Out"}
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
      style={{
        width: "80px",
        padding: "6px",
        borderRadius: "6px",
        border: "1px solid #FFD700",
        backgroundColor: "#222",
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",
      }}
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
      style={{
        width: "80px",
        padding: "6px",
        borderRadius: "6px",
        border: "1px solid #FFD700",
        backgroundColor: "#222",
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",
      }}
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
      style={{
        width: "80px",
        padding: "6px",
        borderRadius: "6px",
        border: "1px solid #FFD700",
        backgroundColor: "#222",
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",
      }}
    />
  </div>
</div>
    </div>

    {/* ✅ القسم السفلي: الدائرة تملأ المساحة المتبقية فقط */}
<div
  style={{
      flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#111",
    borderTop: "3px solid #FFD700",
  }}
>
  <svg
    viewBox={`0 0 ${dynamicSize} ${dynamicSize}`}
    preserveAspectRatio="xMidYMid meet"
    style={{
  width: "100%",
  height: "100%",
  maxWidth: "100vw",
  maxHeight: "100vh",
  aspectRatio: "1 / 1",
  display: "block",
  background: "#fff",
  cursor: isDragging ? "grabbing" : "grab"
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

  const r1 = innerRadius - 20;
  const r2 = innerRadius + 5;
  const angleMid = angle + angleStep / 2;
  const rMid = (r1 + r2) / 2;

  const x = center + rMid * Math.cos(angleMid);
  const y = center + rMid * Math.sin(angleMid);

  return (
    <g key={`fixed-digit-${index}`}>
      <text
        x={x}
        y={y}
        fill="#008000"
        fontSize={9}
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
	       
                     const fontSize = Math.max(6, 13 - value.toString().length);
            const isGray = (level + index) % 2 === 0;

  	       const reduced = reduceToDigit(value);
               const fillColor = getCellColor(reduced);

            return (
              <g key={`${level}-${index}`}>
              
<path
  d={path}
  fill={isGray ? "#f0f0f0" : "#ffffff"}
  stroke="#aaa"
  strokeWidth={0.5}
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

export default GannCircle360;
