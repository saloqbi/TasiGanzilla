// ✅ GannWheel.jsx - النسخة النهائية المضمونة بعد دمج الميزات
// نبدأ بالمحتوى الكامل مع الميزتين الجديدتين مدمجتين:
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import GannSquareInline from "./GannSquareInline";


const GannWheel = forwardRef(({ width = 600, height = 600, snapSize = 10 }, ref) => {

  const [center, setCenter] = useState(() => {
    const saved = localStorage.getItem('gannWheelCenter');
const syncWithChartPoint = (x, y) => {
  setCenter({ x, y });
  localStorage.setItem('gannWheelCenter', JSON.stringify({ x, y }));
};

    return saved ? JSON.parse(saved) : { x: width / 2, y: height / 2 };
  });

const syncWithChartPoint = (x, y) => {
  setCenter({ x, y });
  localStorage.setItem('gannWheelCenter', JSON.stringify({ x, y }));
};
useImperativeHandle(ref, () => ({
  syncWithChartPoint
}));

  const [dragging, setDragging] = useState(false);
  const [visible, setVisible] = useState(true);
   const [rotation, setRotation] = useState(0);
   const [innerRotation, setInnerRotation] = useState(0);   
   const [innerWheels, setInnerWheels] = useState([]);
   const [layers, setLayers] = useState([]);
   const [showInnerWheels, setShowInnerWheels] = useState(true);
   const [showInlineSquare, setShowInlineSquare] = useState(true);





   const [anglePoints, setAnglePoints] = useState([]);
   const [measuredAngles, setMeasuredAngles] = useState([]);
useEffect(() => {
  const saved = localStorage.getItem('gannMeasuredAngles');
  if (saved) setMeasuredAngles(JSON.parse(saved));
}, []);

useEffect(() => {
  localStorage.setItem('gannMeasuredAngles', JSON.stringify(measuredAngles));
}, [measuredAngles]);

  const [highlightStep, setHighlightStep] = useState(45);
  const [sectors, setSectors] = useState(360);
  const [animate, setAnimate] = useState(false);
  const [layout, setLayout] = useState('row');
  const [showPrimary, setShowPrimary] = useState(true);
  const [showSecondary, setShowSecondary] = useState(true);
  const [showDegreeGrid, setShowDegreeGrid] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1); // ✅ Zoom مضاف
   const [showInnerWheel, setShowInnerWheel] = useState(true);
   const [showAngleLines, setShowAngleLines] = useState(true); // ✅ تحكم في خطوط الزوايا الذهبية



  const [primaryLabels, setPrimaryLabels] = useState([
    { text: 'North', angle: 270, color: '#FF6347' },
    { text: 'East', angle: 0, color: '#40E0D0' },
    { text: 'South', angle: 90, color: '#98FB98' },
    { text: 'West', angle: 180, color: '#FFD700' },
    { text: '🔺', angle: 45, color: '#ff69b4' },
    { text: '🟢', angle: 135, color: '#7CFC00' },
    { text: '⭐', angle: 225, color: '#f0e68c' },
    { text: '⚠️', angle: 315, color: '#ffa500' },
    { text: '360°', angle: 0, color: '#FFFFFF' },
    { text: '180°', angle: 180, color: '#FFFFFF' },
    { text: '90°', angle: 90, color: '#FFFFFF' },
    { text: '270°', angle: 270, color: '#FFFFFF' },
    { text: '12', angle: 30, color: '#00ffff' },
    { text: '3', angle: 120, color: '#00ffff' },
    { text: '6', angle: 210, color: '#00ffff' },
    { text: '9', angle: 300, color: '#00ffff' },
  ]);

  const [secondaryLabels, setSecondaryLabels] = useState([
    { text: 'A', angle: 15, color: '#FFA07A' },
    { text: 'B', angle: 75, color: '#DA70D6' },
    { text: 'C', angle: 150, color: '#90EE90' },
    { text: 'D', angle: 240, color: '#87CEFA' },
    { text: 'E', angle: 330, color: '#FFDAB9' },
  ]);

  const svgRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('gannWheelCenter', JSON.stringify(center));
  }, [center]);

  useEffect(() => {
    let raf;
    if (animate) {
      const rotate = () => {
        setRotation(prev => (prev + 0.5) % 360);
        raf = requestAnimationFrame(rotate);
      };
      rotate();
    }
    return () => cancelAnimationFrame(raf);
  }, [animate]);

  const snap = (value) => Math.round(value / snapSize) * snapSize;

  const handleMouseDown = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - center.x;
    const dy = y - center.y;
    if (Math.sqrt(dx * dx + dy * dy) <= 10) setDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = snap(e.clientX - rect.left);
    const y = snap(e.clientY - rect.top);
    setCenter({ x, y });
  };

  const handleMouseUp = () => setDragging(false);

  const exportSVG = () => {
    const svg = svgRef.current;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gann-wheel.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

const addLayer = () => {
  const baseRadius = 0.85;
  const spacing = 0.15;

  const newLayer = {
    id: Date.now(),
    name: `Layer ${layers.length + 1}`,
    rotation: 0,
    radius: baseRadius - layers.length * spacing,
    visible: true,
    symbols: [
      { angle: 0, label: "A" },
      { angle: 90, label: "B" },
      { angle: 180, label: "C" },
      { angle: 270, label: "D" }
    ]
  };

const rotateLayer = (layerId, delta) => {
  setLayers(prevLayers =>
    prevLayers.map(layer =>
      layer.id === layerId
        ? { ...layer, rotation: layer.rotation + delta }
        : layer
    )
  );
};


  setLayers([...layers, newLayer]);
};

    const handleAngleMeasureClick = (e) => {
  const rect = svgRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const angleDeg = (Math.atan2(y - center.y, x - center.x) * 180) / Math.PI;
  const normalized = (angleDeg + 360) % 360;

  const updatedPoints = [...anglePoints, normalized];
  if (updatedPoints.length === 2) {
    const a1 = updatedPoints[0];
    const a2 = updatedPoints[1];
    const diff = ((a2 - a1 + 360) % 360).toFixed(1);
    //let label = prompt(`📝 أدخل اسمًا لهذه الزاوية (${diff}°):`, `${diff}°`);
   // if (!label) label = `${diff}°`;
    setMeasuredAngles([...measuredAngles, { from: a1, to: a2, value: diff, label }]);
    setAnglePoints([]);
  } else {
    setAnglePoints(updatedPoints);
  }
};



  const renderLabelEditor = (labels, setLabels, title) => (
    <fieldset style={{ border: '1px solid #444', margin: '10px', padding: '10px', minWidth: '280px' }}>
      <legend style={{ color: '#FFD700' }}>{title}</legend>
      {labels.map((label, i) => (
        <div key={i} style={{ display: 'flex', gap: '5px', marginBottom: '5px', alignItems: 'center' }}>
          <input value={label.text} onChange={e => {
            const updated = [...labels]; updated[i].text = e.target.value; setLabels(updated);
          }} style={{ width: '60px', backgroundColor: '#222', color: '#FFD700' }} />
          <input type="number" value={label.angle} onChange={e => {
            const updated = [...labels]; updated[i].angle = parseFloat(e.target.value); setLabels(updated);
          }} style={{ width: '60px', backgroundColor: '#222', color: '#FFD700' }} />
          <input type="color" value={label.color} onChange={e => {
            const updated = [...labels]; updated[i].color = e.target.value; setLabels(updated);
          }} />
        </div>
      ))}
    </fieldset>
  );

  const renderWheel = () => {
    if (!visible) return null;
    const baseRadius = Math.min(width, height) / 2 - 20;
    const radius = baseRadius * zoomLevel; // ✅ تطبيق التكبير
    const angleStep = 360 / sectors;
    const lines = [];

if (showAngleLines) {
  for (let i = 0; i < sectors; i++) {
    const rawDeg = i * angleStep;
    const rotatedDeg = (rawDeg + rotation) % 360;
    const angle = rotatedDeg * Math.PI / 180;
    const x2 = center.x + radius * Math.cos(angle);
    const y2 = center.y + radius * Math.sin(angle);
    let stroke = '#00CED1';
    let strokeWidth = 0.7;
    if (rawDeg % highlightStep === 0) {
      stroke = '#FFD700'; strokeWidth = 1.5;
    } else if (rawDeg % 22.5 === 0) {
      stroke = '#6a5acd'; strokeWidth = 1;
    }
    lines.push(<line key={rawDeg} x1={center.x} y1={center.y} x2={x2} y2={y2} stroke={stroke} strokeWidth={strokeWidth} />);
    if (rawDeg % highlightStep === 0) {
      const tx = center.x + (radius + 12) * Math.cos(angle);
      const ty = center.y + (radius + 12) * Math.sin(angle);
       lines.push(
    <text
      key={`text-${rawDeg}`}
      x={tx}
      y={ty}
      fontSize={10}
      fill="#FFD700"
      textAnchor="middle"
      alignmentBaseline="middle"
    >
      {rawDeg.toFixed(0)}°
    </text>
  );
}
  }
}

if (showAngleLines) {
  const importantAngles = [30, 60, 90, 120, 135, 144, 180, 225, 270, 300, 315, 360];

  importantAngles.forEach((deg, index) => {
    const angle = ((deg + rotation) % 360) * Math.PI / 180;
    const x2 = center.x + (radius - 10) * Math.cos(angle);
    const y2 = center.y + (radius - 10) * Math.sin(angle);

    lines.push(
      <line
        key={`important-${index}`}
        x1={center.x}
        y1={center.y}
        x2={x2}
        y2={y2}
        stroke="#FFD700"
        strokeWidth="2"
      />
    );
  });
}




    if (showDegreeGrid) {
      const majorAngles = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
      majorAngles.forEach((deg, i) => {
        const angle = ((deg + rotation) % 360) * Math.PI / 180;
        const x2 = center.x + radius * Math.cos(angle);
        const y2 = center.y + radius * Math.sin(angle);
        lines.push(
          <line key={`deg-${i}`} x1={center.x} y1={center.y} x2={x2} y2={y2} stroke="#888" strokeDasharray="4,2" strokeWidth={1} />
        );
        const tx = center.x + (radius + 20) * Math.cos(angle);
        const ty = center.y + (radius + 20) * Math.sin(angle);
        lines.push(
          <text key={`deg-label-${i}`} x={tx} y={ty} fontSize={9} fill="#888" textAnchor="middle" alignmentBaseline="middle">
            {deg}°
          </text>
        );
      });
    }

    [...primaryLabels, ...secondaryLabels].forEach((label, idx) => {
  const isPrimary = primaryLabels.includes(label);
  const isSecondary = secondaryLabels.includes(label);

  // إذا كان النوع مخفي، تجاهل الرسم
  if ((isPrimary && !showPrimary) || (isSecondary && !showSecondary)) return;

  const a = ((label.angle + rotation) % 360) * Math.PI / 180;
  const r = isSecondary ? radius * 0.4 : radius * 0.6;
  const x = center.x + r * Math.cos(a);
  const y = center.y + r * Math.sin(a);

  lines.push(
    <text
      key={`label-${idx}`}
      x={x}
      y={y}
      fill={label.color}
      fontSize={label.text.length > 2 ? 10 : 14}
      fontWeight="bold"
      textAnchor="middle"
      alignmentBaseline="middle"
      style={{ textShadow: '1px 1px 2px #000000AA' }}
    >
      {label.text}
    </text>
  );
});

     
if (showInnerWheel) {
  const innerRadius = baseRadius * 0.5;
  const angleStep = 360 / sectors;

 for (let i = 0; i < sectors; i++) {
   const rawDeg = i * angleStep;
   const rotatedDeg = (rawDeg + rotation + innerRotation) % 360;
   const angle = rotatedDeg * Math.PI / 180;
   const x2 = center.x + innerRadius * Math.cos(angle);
   const y2 = center.y + innerRadius * Math.sin(angle);

     lines.push(
   <line
     key={`single-inner-line-${i}`}
     x1={center.x}
     y1={center.y}
     x2={x2}
     y2={y2}
     stroke="#cccccc"
     strokeWidth="0.5"
     />
    );

  }

  lines.push(
    <circle
      cx={center.x}
      cy={center.y}
      r={innerRadius}
      stroke="#dddddd"
      strokeWidth="0.7"
      fill="none"
    />
  );
}


if (showInnerWheels) {
  innerWheels.forEach((wheel, index) => {
    const r = baseRadius * wheel.radiusFactor;
    for (let i = 0; i < sectors; i++) {
      const rawDeg = i * angleStep;
      const rotatedDeg = (rawDeg + rotation + innerRotation) % 360;
      const angle = rotatedDeg * Math.PI / 180;
      const x2 = center.x + r * Math.cos(angle);
      const y2 = center.y + r * Math.sin(angle);
      lines.push(
        <line
          key={`inner-${index}-${i}`}
          x1={center.x}
          y1={center.y}
          x2={x2}
          y2={y2}
          stroke="#ccc"
          strokeWidth="0.5"
        />
      );
    }
    lines.push(
      <circle
        key={`inner-circle-${index}`}
        cx={center.x}
        cy={center.y}
        r={r}
        stroke="#bbb"
        strokeWidth="0.7"
        fill="none"
      />
    );
  });
}


    return (<><circle cx={center.x} cy={center.y} r={radius} stroke="#FFD700" strokeWidth={1.5} fill="none" />{lines}</>);
  };

  const buttonStyle = { marginRight: '10px', padding: '6px 14px', backgroundColor: '#222', color: '#FFD700', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' };
  const svgBoxStyle = { border: '1px solid #333', padding: '8px', backgroundColor: '#1e1e2f' };

  return (
    <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#111', color: '#FFD700', fontFamily: 'sans-serif' }}>
      <h1>🧿 كوكبة الأرقام السحرية</h1>
      <h2>أداة Gann Wheel</h2>

      <div style={{ marginBottom: '15px' }}>
        <button onClick={() => setVisible(!visible)} style={buttonStyle}>{visible ? '🚫 إخفاء العجلة' : '✅ إظهار العجلة'}</button>
        <button onClick={exportSVG} style={{ ...buttonStyle, backgroundColor: '#004080', color: '#fff' }}>📤 تصدير SVG</button>
<button
  onClick={() => {
    const base = 1.0; // أول عجلة تبدأ من نفس العجلة الأصلية
    const step = 0.15;

    let newFactor;
    if (innerWheels.length === 0) {
      newFactor = base - step;
    } else {
      const last = innerWheels[innerWheels.length - 1];
      newFactor = Math.max(0.1, last.radiusFactor - step);
    }

    const newId = Date.now(); setInnerWheels([...innerWheels, { id: newId, radiusFactor: newFactor }]); }} style={buttonStyle} > ➕ إضافة عجلة داخلية </button>

<button onClick={() => setShowInnerWheels(!showInnerWheels)} style={buttonStyle}> {showInnerWheels ? "🚫 إخفاء العجلات الداخلية" : "🧱 عرض العجلات الداخلية"} </button>
<button onClick={addLayer} style={buttonStyle}>➕ إضافة طبقة جديدة</button>
<button onClick={() => setShowInlineSquare(!showInlineSquare)} style={{ ...buttonStyle, border: '1px solid cyan', color: 'cyan' }}> {showInlineSquare ? "🚫 إخفاء مربع جان" : "🔲 إظهار مربع جان"} </button>


<div style={{ marginBottom: "10px" }}>
  {layers.map((layer) => (
    <div key={layer.id} style={{ display: "inline-block", margin: "5px" }}>
      <strong>{layer.name}</strong>
      <button onClick={() => rotateLayer(layer.id, -15)} style={{ margin: "0 5px" }}>⏪ -15°</button>
      <button onClick={() => rotateLayer(layer.id, 15)}>⏩ +15°</button>
    </div>
  ))}
</div>


<button onClick={() => { setMeasuredAngles([]); setAnglePoints([]); }} style={buttonStyle}>❌ مسح الزوايا</button>

        <button onClick={() => setRotation((prev) => (prev + 15) % 360)} style={buttonStyle}>🔁 تدوير 15°</button>
        <button onClick={() => setAnimate(!animate)} style={buttonStyle}>{animate ? '⏹️ إيقاف الدوران' : '▶️ تشغيل تلقائي'}</button>
        <button onClick={() => setShowDegreeGrid(!showDegreeGrid)} style={buttonStyle}>{showDegreeGrid ? '🧭 إخفاء الزوايا الزمنية' : '🧭 عرض الزوايا الزمنية'}</button>
	<button onClick={() => setShowAngleLines(!showAngleLines)} style={buttonStyle}> {showAngleLines ? '🚫 إخفاء خطوط الزوايا' : '📏 عرض خطوط الزوايا'}</button>

	<button onClick={() => setShowAngleLines(!showAngleLines)} style={buttonStyle}> {showAngleLines ? '🚫 إخفاء خطوط الزوايا' : '📏 عرض خطوط الزوايا'}</button>

	<button onClick={() => setShowInnerWheel(!showInnerWheel)} style={buttonStyle}> {showInnerWheel ? '🚫 إخفاء العجلة الداخلية' : '🧱 عرض عجلة داخلية'} 	</button>
	<button onClick={() => setInnerRotation((prev) => prev + 15)} style={buttonStyle}> 🔄 تدوير داخلي +15° </button>
	<button onClick={() => setInnerRotation((prev) => prev - 15)} style={buttonStyle}> ↪️ تدوير داخلي -15° </button>

        <button onClick={() => setZoomLevel(zoomLevel * 1.1)} style={buttonStyle}>➕ تكبير</button>
        <button onClick={() => setZoomLevel(zoomLevel / 1.1)} style={buttonStyle}>➖ تصغير</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
        <button onClick={() => setLayout(layout === 'row' ? 'column' : 'row')} style={buttonStyle}>↔️ تبديل {layout === 'row' ? 'عمودي' : 'أفقي'}</button>
        <button onClick={() => setShowPrimary(!showPrimary)} style={buttonStyle}>{showPrimary ? '🚫 إخفاء الرموز الأساسية' : '✅ عرض الرموز الأساسية'}</button>
        <button onClick={() => setShowSecondary(!showSecondary)} style={buttonStyle}>{showSecondary ? '🚫 إخفاء الرموز الداخلية' : '✅ عرض الرموز الداخلية'}</button>
      </div>

      <div style={{ display: 'flex', flexDirection: layout, justifyContent: 'center', alignItems: 'flex-start', gap: '30px', flexWrap: 'wrap' }}>
        {layout === 'row' && (
          <div style={{ maxHeight: '600px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {showPrimary && renderLabelEditor(primaryLabels, setPrimaryLabels, 'الرموز الأساسية')}
            {showSecondary && renderLabelEditor(secondaryLabels, setSecondaryLabels, 'الرموز الداخلية')}
          </div>
        )}

        <div style={svgBoxStyle}>
          <svg
  ref={svgRef}
  width={width}
  height={height}
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}
  onClick={handleAngleMeasureClick}  // ✅ هذا الجديد

  style={{ cursor: dragging ? 'grabbing' : 'crosshair' }}
>

            {renderWheel()}


{layers.map((layer) => (
  <g
    key={layer.id}
    transform={`rotate(${layer.rotation}, ${center.x}, ${center.y})`}
    opacity={layer.visible ? 1 : 0.6}
  >
    {/* الرموز */}
    {layer.symbols.map((symbol, idx) => {
      const angleRad = (symbol.angle * Math.PI) / 180;
      const baseRadius = Math.min(width, height) / 2 - 20;
      const zoomedRadius = baseRadius * zoomLevel;
      const r = zoomedRadius * layer.radius;
      const x = center.x + r * Math.cos(angleRad);
      const y = center.y + r * Math.sin(angleRad);
      return (
        <text
          key={idx}
          x={x}
          y={y}
          fontSize="14"
          fill="white"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {symbol.label}
        </text>
      );
    })}



  </g>
))}

{showInlineSquare && (
 <GannSquareInline
  x={center.x}
  y={center.y}
  movable={true}  // ✅ هذا هو المفتاح
  initialSize={300}
  rotation={0}
  layers={1}
  highlightMultiplesOf={5}
  divisionCondition={7}
/>

)}
            {visible && (
  <circle
    cx={center.x}
    cy={center.y}
    r={4}
    fill="yellow"
  />
)}



          </svg>
        </div>

        {layout === 'column' && (
          <div style={{ maxHeight: '600px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {showPrimary && renderLabelEditor(primaryLabels, setPrimaryLabels, 'الرموز الأساسية')}
            {showSecondary && renderLabelEditor(secondaryLabels, setSecondaryLabels, 'الرموز الداخلية')}
          </div>
        )}
      </div>
    </div>
  );
});

export default GannWheel;
