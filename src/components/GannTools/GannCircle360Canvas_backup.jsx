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


const GannCircle360Canvas = () => {
  // States داخل الملف نفسه
  const [scale, setScale] = useState(1);
  const [showZodiacRing, setShowZodiacRing] = useState(true);
  const [showWeekDaysRing, setShowWeekDaysRing] = useState(true);
  const [showDegreeRing, setShowDegreeRing] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showZoomControls, setShowZoomControls] = useState(true);
  const [settings, setSettings] = useState(getDefaultSettings());

  // عجلة الزوايا والأشكال الهندسية
  const [showAngleWheel, setShowAngleWheel] = useState(false);
  const [angleWheelRotation, setAngleWheelRotation] = useState(0);
  const [angleStepRad, setAngleStep] = useState(10);
  const [rayColor, setRayColor] = useState(defaultRayColor);
  const [rayWidth, setRayWidth] = useState(2);
  const [selectedShape, setSelectedShape] = useState("");
  const [showAngleWheelAngles, setShowAngleWheelAngles] = useState(true); // إظهار زوايا عجلة الزوايا

  // خصائص إضافية مفقودة من GannCircle36
  const [currentTime, setCurrentTime] = useState(new Date());
  const [zoom, setZoom] = useState(1);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [recentlyDragged, setRecentlyDragged] = useState(false); // تتبع السحب الحديث
  const [clickStates, setClickStates] = useState({});
  const [cellColors, setCellColors] = useState([]);
  const [cellClickCounts, setCellClickCounts] = useState({}); // تتبع عدد النقرات لكل خلية
  const [showTriangle, setShowTriangle] = useState(false);
  const [showSquare, setShowSquare] = useState(false);
  const [showStar4, setShowStar4] = useState(false);
  const [showPentagon, setShowPentagon] = useState(false);
  const [showStar, setShowStar] = useState(false);
  const [showHexagon, setShowHexagon] = useState(false);
  const [showHexagram, setShowHexagram] = useState(false);
  const [showHeptagon, setShowHeptagon] = useState(false);
  const [showStar7, setShowStar7] = useState(false);
  const [showOctagon, setShowOctagon] = useState(false);
  const [showStarOctagon, setShowStarOctagon] = useState(false);
  const [showNonagon, setShowNonagon] = useState(false);
  const [showStar9, setShowStar9] = useState(false);
  const [showDecagon, setShowDecagon] = useState(false);
  const [showStar10, setShowStar10] = useState(false);
  const [showHendecagon, setShowHendecagon] = useState(false);
  const [showStar11, setShowStar11] = useState(false);
  const [showDodecagon, setShowDodecagon] = useState(false);
  const [showStar12, setShowStar12] = useState(false);

   //   شكل المثلث
const [customAngles, setCustomAngles] = useState([0, 120, 240]);
const [triangleRotation, setTriangleRotation] = useState(0);
const [highlightTriangle, setHighlightTriangle] = useState(false);
const [fillTriangle, setFillTriangle] = useState(false);
const [isDraggingTriangle, setIsDraggingTriangle] = useState(false);

// متغيرات عجلة الزوايا للتدوير
const [isDraggingAngleWheel, setIsDraggingAngleWheel] = useState(false);
const [hoveredAngleWheelCell, setHoveredAngleWheelCell] = useState(null); // تتبع الخلية المحددة

// متغيرات النجمة الثلاثية
const [star3Rotation, setStar3Rotation] = useState(0);
const [fillStar3, setFillStar3] = useState(true);
const [highlightStar3, setHighlightStar3] = useState(true);
const [showStar3Angles, setShowStar3Angles] = useState(false);
const [star3DrawMode, setStar3DrawMode] = useState("lines"); // "lines" أو "triangle"
const [isDraggingStar3, setIsDraggingStar3] = useState(false);

const [isDraggingStar5, setIsDraggingStar5] = useState(false);
const [isDraggingSquare, setIsDraggingSquare] = useState(false);
const [isDraggingStar4, setIsDraggingStar4] = useState(false);
const [isDraggingPentagon, setIsDraggingPentagon] = useState(false);
const [isDraggingHexagon, setIsDraggingHexagon] = useState(false);
const [isDraggingStar6, setIsDraggingStar6] = useState(false);
const [isDraggingHeptagon, setIsDraggingHeptagon] = useState(false);
const [isDraggingStar7, setIsDraggingStar7] = useState(false);
const [isDraggingOctagon, setIsDraggingOctagon] = useState(false);
const [isDraggingStar8, setIsDraggingStar8] = useState(false);
const [isDraggingNonagon, setIsDraggingNonagon] = useState(false);
const [isDraggingStar9, setIsDraggingStar9] = useState(false);
const [isDraggingDecagon, setIsDraggingDecagon] = useState(false);
const [isDraggingStar10, setIsDraggingStar10] = useState(false);
const [isDraggingHendecagon, setIsDraggingHendecagon] = useState(false);
const [isDraggingStar11, setIsDraggingStar11] = useState(false);
const [isDraggingDodecagon, setIsDraggingDodecagon] = useState(false);
const [isDraggingStar12, setIsDraggingStar12] = useState(false);
const [hoveredPointIndex, setHoveredPointIndex] = useState(null);
const [dragStartAngle, setDragStartAngle] = useState(0);
const [initialRotation, setInitialRotation] = useState(0);

const [customSquareAngles, setCustomSquareAngles] = useState([0, 90, 180, 270]);
const [squareRotation, setSquareRotation] = useState(0);
const [highlightSquare, setHighlightSquare] = useState(false);
const [fillSquare, setFillSquare] = useState(false);
const [showSquareAngles, setShowSquareAngles] = useState(false);

const [customStar4Angles, setCustomStar4Angles] = useState([0, 90, 180, 270]);
const [star4Rotation, setStar4Rotation] = useState(0);
const [fillStar4, setFillStar4] = useState(false);
const [highlightStar4, setHighlightStar4] = useState(false);
const [showStar4Angles, setShowStar4Angles] = useState(false);

const [customPentagonAngles, setCustomPentagonAngles] = useState([0, 72, 144, 216, 288]);
const [pentagonRotation, setPentagonRotation] = useState(0);
const [fillPentagon, setFillPentagon] = useState(false);
const [highlightPentagon, setHighlightPentagon] = useState(false);
const [showPentagonAngles, setShowPentagonAngles] = useState(false);

const [star5Rotation, setStar5Rotation] = useState(0);
const [fillStar5, setFillStar5] = useState(false);
const [highlightStar5, setHighlightStar5] = useState(false);
const [showStar5Angles, setShowStar5Angles] = useState(false);
const [star5DrawMode, setStar5DrawMode] = useState("pentagram"); // "pentagram" أو "lines"

const [customStarAngles, setCustomStarAngles] = useState([0, 72, 144, 216, 288]);
const [customStar3Angles, setCustomStar3Angles] = useState([45, 165, 285]); // زوايا النجمة الثلاثية {3/3} - 45° أساسية
const [starRotation, setStarRotation] = useState(0);
const [fillStar, setFillStar] = useState(false);
const [highlightStar, setHighlightStar] = useState(false);

const [customHexagonAngles, setCustomHexagonAngles] = useState([0,60,120,180,240,300]);
const [hexagonRotation, setHexagonRotation] = useState(0);
const [fillHexagon, setFillHexagon] = useState(false);
const [highlightHexagon, setHighlightHexagon] = useState(false);
const [showHexagonAngles, setShowHexagonAngles] = useState(false);

const [customHexagramAngles, setCustomHexagramAngles] = useState([0,60,120,180,240,300]);
const [hexagramRotation, setHexagramRotation] = useState(0);
const [fillHexagram, setFillHexagram] = useState(false);
const [highlightHexagram, setHighlightHexagram] = useState(false);

const [star6Rotation, setStar6Rotation] = useState(0);
const [fillStar6, setFillStar6] = useState(false);
const [highlightStar6, setHighlightStar6] = useState(false);
const [showStar6Angles, setShowStar6Angles] = useState(false);

const [heptagonRotation, setHeptagonRotation] = useState(0);
const [fillHeptagon, setFillHeptagon] = useState(false);
const [highlightHeptagon, setHighlightHeptagon] = useState(false);

const [star7Rotation, setStar7Rotation] = useState(0);
const [fillStar7, setFillStar7] = useState(false);
const [highlightStar7, setHighlightStar7] = useState(false);
const [showStar7Angles, setShowStar7Angles] = useState(false);

const [customOctagonAngles, setCustomOctagonAngles] = useState([0,45,90,135,180,225,270,315]);
const [octagonRotation, setOctagonRotation] = useState(0);
const [fillOctagon, setFillOctagon] = useState(false);
const [highlightOctagon, setHighlightOctagon] = useState(false);

const [star8Rotation, setStar8Rotation] = useState(0);
const [fillStar8, setFillStar8] = useState(false);
const [highlightStar8, setHighlightStar8] = useState(false);
const [showStar8Angles, setShowStar8Angles] = useState(false);

const [customStarOctagonAngles, setCustomStarOctagonAngles] = useState([0,45,90,135,180,225,270,315]);
const [starOctagonRotation, setStarOctagonRotation] = useState(0);
const [fillStarOctagon, setFillStarOctagon] = useState(false);
const [highlightStarOctagon, setHighlightStarOctagon] = useState(false);

const [nonagonRotation, setNonagonRotation] = useState(0);
const [fillNonagon, setFillNonagon] = useState(false);
const [highlightNonagon, setHighlightNonagon] = useState(false);

const [star9Rotation, setStar9Rotation] = useState(0);
const [fillStar9, setFillStar9] = useState(false);
const [highlightStar9, setHighlightStar9] = useState(false);
const [showStar9Angles, setShowStar9Angles] = useState(false);

const [decagonRotation, setDecagonRotation] = useState(0);
const [fillDecagon, setFillDecagon] = useState(false);
const [highlightDecagon, setHighlightDecagon] = useState(false);

const [star10Rotation, setStar10Rotation] = useState(0);
const [fillStar10, setFillStar10] = useState(false);
const [highlightStar10, setHighlightStar10] = useState(false);
const [showStar10Angles, setShowStar10Angles] = useState(false);

const [hendecagonRotation, setHendecagonRotation] = useState(0);
const [fillHendecagon, setFillHendecagon] = useState(false);
const [highlightHendecagon, setHighlightHendecagon] = useState(false);

const [star11Rotation, setStar11Rotation] = useState(0);
const [fillStar11, setFillStar11] = useState(false);
const [highlightStar11, setHighlightStar11] = useState(false);
const [showStar11Angles, setShowStar11Angles] = useState(false);

const [dodecagonRotation, setDodecagonRotation] = useState(0);
const [fillDodecagon, setFillDodecagon] = useState(false);
const [highlightDodecagon, setHighlightDodecagon] = useState(false);

const [star12Rotation, setStar12Rotation] = useState(0);
const [fillStar12, setFillStar12] = useState(false);
const [highlightStar12, setHighlightStar12] = useState(false);
const [showStar12Angles, setShowStar12Angles] = useState(false);

// متغيرات إظهار الزوايا للأشكال المفقودة
const [showHeptagonAngles, setShowHeptagonAngles] = useState(false);
const [showOctagonAngles, setShowOctagonAngles] = useState(false);
const [showNonagonAngles, setShowNonagonAngles] = useState(false);
const [showDecagonAngles, setShowDecagonAngles] = useState(false);
const [showHendecagonAngles, setShowHendecagonAngles] = useState(false);
const [showDodecagonAngles, setShowDodecagonAngles] = useState(false);

// الدوائر المتداخلة
const [showNestedCircles, setShowNestedCircles] = useState(false);
const [nestedCircleCount, setNestedCircleCount] = useState(5);
const [nestedCircleGap, setNestedCircleGap] = useState(20);
const [nestedDashStyle, setNestedDashStyle] = useState("solid");
const [nestedStrokeWidth, setNestedStrokeWidth] = useState(2);
const [nestedCircleColor, setNestedCircleColor] = useState("#FFD700");
const [nestedCircleLabels, setNestedCircleLabels] = useState(false);
const [useGradientColor, setUseGradientColor] = useState(false);
const [nestedOpacity, setNestedOpacity] = useState(0.7);
const [showTimeLabels, setShowTimeLabels] = useState(false);
const [timeStepDays, setTimeStepDays] = useState(7);
const [showRepeatedPattern, setShowRepeatedPattern] = useState(false);
const [patternColor, setPatternColor] = useState("#00CED1");
const [patternRotation, setPatternRotation] = useState(0);
const [patternFill, setPatternFill] = useState(false);
const [patternShape, setPatternShape] = useState("triangle");
const [selectedPatternIndex, setSelectedPatternIndex] = useState(null);

  // الوقت والتواريخ (محلية)
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  const getGregorianDate = () => currentTime.toLocaleDateString("ar-EG");
  const getHijriDate = () => {
    try {
      return currentTime
        .toLocaleDateString("ar-SA-u-ca-islamic", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
        .replace(/هـ.*/, "هـ");
    } catch {
      return "";
    }
  };
  const formatTime = (date, offset) => {
    const d = new Date(date);
    d.setHours(d.getHours() + offset);
    return d.toLocaleTimeString("ar-EG");
  };

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
  const inputStyle = {
    background: "#1a1a1a",
    color: "#FFD700",
    border: "1px solid #FFD700",
    borderRadius: "4px",
    padding: "5px",
    marginBottom: "7px",
    marginTop: "2px",
    fontSize: "14px",
  };

  // اللغة
  const toggleLang = () => {
    setSettings((prev) => ({
      ...prev,
      language: prev.language === "ar" ? "en" : "ar",
    }));
  };

  // الحسابات الأساسية
  const canvasRectRef = useRef(null);
  const canvasRef = useRef();
  const innerRadius = 60;
  const baseRingWidth = 35;
  const digitScale = 8;
  
  // حساب نصف قطر آخر حلقة بنفس منطق الحلقة الفعلية
  let calculatedLastRadius = innerRadius;
  for (let level = 0; level < settings.levels; level++) {
    const maxDigitsInLevel = Math.max(
      ...Array.from({ length: settings.divisions }, (_, i) => {
        const globalIndex = level * settings.divisions + i;
        return parseFloat((settings.startValue + globalIndex).toFixed(2)).toString().length;
      })
    );
    const dynamicWidth = baseRingWidth + maxDigitsInLevel * digitScale;
    calculatedLastRadius += dynamicWidth;
  }
  const lastNumberRingRadius = calculatedLastRadius;
  
  // حلقة الدرجات تأتي قبل حلقة الأبراج (داخلياً منها)
  const degreeRingRadius = lastNumberRingRadius + 10; // بعد حلقات الأرقام مع مسافة صغيرة
  
  // عجلة الزوايا تأتي مباشرة بعد حلقة الدرجات
  const angleWheelInnerRadius = degreeRingRadius + 25; // مباشرة بعد حلقة الدرجات
  const angleWheelOuterRadius = angleWheelInnerRadius + 40; // منطقة واسعة للنقر
  
  // حلقة الأبراج تأتي بعد عجلة الزوايا
  const zodiacInnerRadius = showAngleWheel ? angleWheelOuterRadius + 5 : degreeRingRadius + 18;
  const zodiacOuterRadius = zodiacInnerRadius + 30;
  
  // حلقة أيام الأسبوع تأتي بعد حلقة الأبراج
  const weekDaysInnerRadius = zodiacOuterRadius + 5;
  const weekDaysOuterRadius = weekDaysInnerRadius + 25;
  
  // للتوافق مع الكود الموجود، نحافظ على ringRadius
  const ringRadius = lastNumberRingRadius;
  
  // حساب حجم الدوائر المتداخلة إذا كانت موجودة
  const nestedRadius = showNestedCircles ? nestedCircleGap * nestedCircleCount : 0;
  
  // حساب أكبر قطر مطلوب - الآن يشمل حلقة أيام الأسبوع كآخر حلقة
  let mainCircleRadius = showAngleWheel ? angleWheelOuterRadius : zodiacOuterRadius;
  if (showWeekDaysRing) {
    mainCircleRadius = weekDaysOuterRadius;
  }
  const maxRadius = Math.max(mainCircleRadius, nestedRadius);
  
  // هامش حول الدائرة (مثل GannCircle36)
  const svgPadding = 120;
  const canvasSize = maxRadius * 2 + svgPadding * 2;

  // دوال الرسم للأشكال الهندسية
  function drawSquare(ctx, center, radius) {
    const r = degreeRingRadius; // ربط بحلقة الدرجات
    const points = customSquareAngles.map((deg) => {
      const rad = ((deg + squareRotation + settings.rotation - 90) * Math.PI) / 180;
      return {
        x: center + r * Math.cos(rad),
        y: center + r * Math.sin(rad),
      };
    });

    // رسم خطوط الربط من المركز إلى حلقة الدرجات
    points.forEach((point) => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.7;
      ctx.stroke();
      ctx.restore();
    });

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, i) => {
      if (i > 0) ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    
    if (fillSquare) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
      ctx.fill();
    }
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    if (highlightSquare) {
      points.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.restore();
      });
    }
    
    // تمييز النقطة المحددة (عند التمرير)
    if (hoveredPointIndex !== null && selectedShape === "square") {
      const hoveredPoint = points[hoveredPointIndex];
      if (hoveredPoint) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(hoveredPoint.x, hoveredPoint.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = "cyan";
        ctx.fill();
        ctx.restore();
      }
    }
    
    // عرض الزوايا النصية عند الرؤوس
    if (showSquareAngles) {
      points.forEach((point, i) => {
        const angle = (customSquareAngles[i] + squareRotation + settings.rotation) % 360;
        ctx.save();
        ctx.font = "bold 16px Tahoma";
        ctx.fillStyle = "#2F4F4F";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(`(${angle.toFixed(0)}°)`, point.x, point.y - 12);
        ctx.restore();
      });
    }

    // **رسم رؤوس المربع بلون أحمر غامق دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI); // دائرة أكبر قليلاً
      ctx.fillStyle = "#DC143C"; // أحمر غامق (Crimson)
      ctx.fill();
      ctx.strokeStyle = "#8B0000"; // حدود أحمر أغمق
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // إضافة نقطة مركزية صغيرة للتأكيد
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#8B0000"; // نقطة مركزية أغمق
      ctx.fill();
      ctx.restore();
    });
  }

  function drawPentagon(ctx, center, radius) {
    const r = degreeRingRadius; // ربط بحلقة الدرجات
    const points = customPentagonAngles.map((deg) => {
      const rad = ((deg + pentagonRotation + settings.rotation - 90) * Math.PI) / 180;
      return {
        x: center + r * Math.cos(rad),
        y: center + r * Math.sin(rad),
      };
    });

    // رسم خطوط الربط من المركز إلى حلقة الدرجات
    points.forEach((point) => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.7;
      ctx.stroke();
      ctx.restore();
    });

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, i) => {
      if (i > 0) ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    
    if (fillPentagon) {
      ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
      ctx.fill();
    }
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    if (highlightPentagon) {
      points.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.restore();
      });
    }
    
    // تمييز النقطة المحددة (عند التمرير)
    if (hoveredPointIndex !== null && selectedShape === "pentagon") {
      const hoveredPoint = points[hoveredPointIndex];
      if (hoveredPoint) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(hoveredPoint.x, hoveredPoint.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = "cyan";
        ctx.fill();
        ctx.restore();
      }
    }
    
    // عرض الزوايا النصية عند الرؤوس
    if (showPentagonAngles) {
      points.forEach((point, i) => {
        const angle = (customPentagonAngles[i] + pentagonRotation + settings.rotation) % 360;
        ctx.save();
        ctx.font = "bold 16px Tahoma";
        ctx.fillStyle = "#2F4F4F";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(`(${angle.toFixed(0)}°)`, point.x, point.y - 12);
        ctx.restore();
      });
    }

    // **رسم رؤوس الشكل الخماسي بلون أخضر دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI); // دائرة أكبر قليلاً
      ctx.fillStyle = "#228B22"; // أخضر غامق (ForestGreen)
      ctx.fill();
      ctx.strokeStyle = "#006400"; // حدود أخضر أغمق
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // إضافة نقطة مركزية صغيرة للتأكيد
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#006400"; // نقطة مركزية أغمق
      ctx.fill();
      ctx.restore();
    });
  }

  function drawHexagon(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = customHexagonAngles.map((deg) => {
      const rad = ((deg + hexagonRotation + settings.rotation - 90) * Math.PI) / 180;
      return {
        x: center + r * Math.cos(rad),
        y: center + r * Math.sin(rad),
      };
    });

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, i) => {
      if (i > 0) ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    
    if (fillHexagon) {
      ctx.fillStyle = "rgba(0, 0, 255, 0.2)";
      ctx.fill();
    }
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Draw radial connection lines from center to vertices
    ctx.save();
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    if (highlightHexagon) {
      points.forEach((p, i) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = hoveredPointIndex === i && selectedShape === "hexagon" ? "orange" : "yellow";
        ctx.fill();
        ctx.restore();
      });
    }

    // Show angle values when enabled
    if (showHexagonAngles) {
      points.forEach((point, idx) => {
        const currentAngle = (customHexagonAngles[idx] + hexagonRotation + settings.rotation) % 360;
        
        ctx.save();
        ctx.fillStyle = "#000080"; // Dark blue color
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Position text slightly outside the point
        const textOffset = 20;
        const textAngle = ((customHexagonAngles[idx] + hexagonRotation + settings.rotation - 90) * Math.PI) / 180;
        const textX = center + (r + textOffset) * Math.cos(textAngle);
        const textY = center + (r + textOffset) * Math.sin(textAngle);
        
        ctx.fillText(`${currentAngle.toFixed(0)}°`, textX, textY);
        ctx.restore();
      });
    }

    // **رسم رؤوس الشكل السداسي بلون أزرق غامق دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI); // دائرة أكبر قليلاً
      ctx.fillStyle = "#1E90FF"; // أزرق فاتح (DodgerBlue)
      ctx.fill();
      ctx.strokeStyle = "#0000CD"; // حدود أزرق أغمق
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // إضافة نقطة مركزية صغيرة للتأكيد
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#0000CD"; // نقطة مركزية أغمق
      ctx.fill();
      ctx.restore();
    });
  }

  function drawOctagon(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = customOctagonAngles.map((deg) => {
      const rad = ((deg + octagonRotation + settings.rotation - 90) * Math.PI) / 180;
      return {
        x: center + r * Math.cos(rad),
        y: center + r * Math.sin(rad),
      };
    });

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, i) => {
      if (i > 0) ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    
    if (fillOctagon) {
      ctx.fillStyle = "rgba(128, 0, 128, 0.2)";
      ctx.fill();
    }
    ctx.strokeStyle = "purple";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Draw radial connection lines from center to vertices
    ctx.save();
    ctx.strokeStyle = "purple";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    if (highlightOctagon) {
      points.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.restore();
      });
    }

    // عرض الزوايا النصية عند الرؤوس
    if (showOctagonAngles) {
      points.forEach((point, i) => {
        const angle = (customOctagonAngles[i] + octagonRotation + settings.rotation) % 360;
        ctx.save();
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "purple";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(`${angle.toFixed(0)}°`, point.x, point.y - 12);
        ctx.restore();
      });
    }

    // **رسم رؤوس الشكل الثماني بلون بنفسجي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI); // دائرة أكبر قليلاً
      ctx.fillStyle = "#9932CC"; // بنفسجي غامق (DarkOrchid)
      ctx.fill();
      ctx.strokeStyle = "#4B0082"; // حدود بنفسجي أغمق
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // إضافة نقطة مركزية صغيرة للتأكيد
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#4B0082"; // نقطة مركزية أغمق
      ctx.fill();
      ctx.restore();
    });
  }

  // Drawing heptagon (7 sides)
  function drawHeptagon(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = [];
    for (let i = 0; i < 7; i++) {
      const angle = ((i * 360 / 7) + heptagonRotation + settings.rotation - 90) * Math.PI / 180;
      points.push({
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      });
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, i) => {
      if (i > 0) ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    
    if (fillHeptagon) {
      ctx.fillStyle = "rgba(255, 165, 0, 0.2)";
      ctx.fill();
    }
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Draw radial connection lines from center to vertices
    ctx.save();
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    if (highlightHeptagon) {
      points.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.restore();
      });
    }

    // عرض الزوايا النصية عند الرؤوس
    if (showHeptagonAngles) {
      points.forEach((point, i) => {
        const angle = ((i * 360 / 7) + heptagonRotation + settings.rotation) % 360;
        ctx.save();
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "orange";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(`${angle.toFixed(0)}°`, point.x, point.y - 12);
        ctx.restore();
      });
    }

    // **رسم رؤوس الشكل السباعي بلون برتقالي غامق دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI); // دائرة أكبر قليلاً
      ctx.fillStyle = "#FF8C00"; // برتقالي غامق (DarkOrange)
      ctx.fill();
      ctx.strokeStyle = "#FF4500"; // حدود برتقالي أغمق
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // إضافة نقطة مركزية صغيرة للتأكيد
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#FF4500"; // نقطة مركزية أغمق
      ctx.fill();
      ctx.restore();
    });
  }

  // Drawing nonagon (9 sides)
  function drawNonagon(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = [];
    for (let i = 0; i < 9; i++) {
      const angle = ((i * 360 / 9) + nonagonRotation + settings.rotation - 90) * Math.PI / 180;
      points.push({
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      });
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, i) => {
      if (i > 0) ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    
    if (fillNonagon) {
      ctx.fillStyle = "rgba(255, 192, 203, 0.2)";
      ctx.fill();
    }
    ctx.strokeStyle = "pink";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Draw radial connection lines from center to vertices
    ctx.save();
    ctx.strokeStyle = "pink";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    if (highlightNonagon) {
      points.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.restore();
      });
    }

    // عرض الزوايا النصية عند الرؤوس
    if (showNonagonAngles) {
      points.forEach((point, i) => {
        const angle = ((i * 360 / 9) + nonagonRotation + settings.rotation) % 360;
        ctx.save();
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "pink";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(`${angle.toFixed(0)}°`, point.x, point.y - 12);
        ctx.restore();
      });
    }

    // **رسم رؤوس الشكل التساعي بلون وردي غامق دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI); // دائرة أكبر قليلاً
      ctx.fillStyle = "#FF69B4"; // وردي ساخن (HotPink)
      ctx.fill();
      ctx.strokeStyle = "#FF1493"; // حدود وردي أغمق
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // إضافة نقطة مركزية صغيرة للتأكيد
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#FF1493"; // نقطة مركزية أغمق
      ctx.fill();
      ctx.restore();
    });
  }

  // Drawing decagon (10 sides)
  function drawDecagon(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = [];
    for (let i = 0; i < 10; i++) {
      const angle = ((i * 360 / 10) + decagonRotation + settings.rotation - 90) * Math.PI / 180;
      points.push({
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      });
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, i) => {
      if (i > 0) ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    
    if (fillDecagon) {
      ctx.fillStyle = "rgba(0, 255, 255, 0.2)";
      ctx.fill();
    }
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Draw radial connection lines from center to vertices
    ctx.save();
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    if (highlightDecagon) {
      points.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.restore();
      });
    }

    // عرض الزوايا النصية عند الرؤوس
    if (showDecagonAngles) {
      points.forEach((point, i) => {
        const angle = ((i * 360 / 10) + decagonRotation + settings.rotation) % 360;
        ctx.save();
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "cyan";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(`${angle.toFixed(0)}°`, point.x, point.y - 12);
        ctx.restore();
      });
    }

    // **رسم رؤوس الشكل العشري بلون سماوي غامق دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI); // دائرة أكبر قليلاً
      ctx.fillStyle = "#00CED1"; // سماوي غامق (DarkTurquoise)
      ctx.fill();
      ctx.strokeStyle = "#008B8B"; // حدود سماوي أغمق
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // إضافة نقطة مركزية صغيرة للتأكيد
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#008B8B"; // نقطة مركزية أغمق
      ctx.fill();
      ctx.restore();
    });
  }

  // Drawing hendecagon (11 sides)
  function drawHendecagon(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = [];
    for (let i = 0; i < 11; i++) {
      const angle = ((i * 360 / 11) + hendecagonRotation + settings.rotation - 90) * Math.PI / 180;
      points.push({
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      });
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, i) => {
      if (i > 0) ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    
    if (fillHendecagon) {
      ctx.fillStyle = "rgba(255, 20, 147, 0.2)";
      ctx.fill();
    }
    ctx.strokeStyle = "deeppink";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Draw radial connection lines from center to vertices
    ctx.save();
    ctx.strokeStyle = "deeppink";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    if (highlightHendecagon) {
      points.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.restore();
      });
    }

    // **عرض الزوايا النصية عند الرؤوس دائماً للشكل الحادي عشر**
    points.forEach((point, i) => {
      const angle = ((i * 360 / 11) + hendecagonRotation + settings.rotation) % 360;
      ctx.save();
      ctx.font = "bold 14px Arial";
      ctx.fillStyle = "deeppink";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`${angle.toFixed(0)}°`, point.x, point.y - 12);
      ctx.restore();
    });

    // **رسم رؤوس الشكل الأحد عشري بلون وردي عميق دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI); // دائرة أكبر قليلاً
      ctx.fillStyle = "#FF1493"; // وردي عميق (DeepPink)
      ctx.fill();
      ctx.strokeStyle = "#C71585"; // حدود وردي أغمق
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // إضافة نقطة مركزية صغيرة للتأكيد
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#C71585"; // نقطة مركزية أغمق
      ctx.fill();
      ctx.restore();
    });
  }

  // Drawing dodecagon (12 sides)
  function drawDodecagon(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = [];
    for (let i = 0; i < 12; i++) {
      const angle = ((i * 360 / 12) + dodecagonRotation + settings.rotation - 90) * Math.PI / 180;
      points.push({
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      });
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, i) => {
      if (i > 0) ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    
    if (fillDodecagon) {
      ctx.fillStyle = "rgba(255, 69, 0, 0.2)";
      ctx.fill();
    }
    ctx.strokeStyle = "orangered";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Draw radial connection lines from center to vertices
    ctx.save();
    ctx.strokeStyle = "orangered";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    if (highlightDodecagon) {
      points.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.restore();
      });
    }

    // **عرض الزوايا النصية عند الرؤوس دائماً للشكل الاثني عشري**
    points.forEach((point, i) => {
      const angle = ((i * 360 / 12) + dodecagonRotation + settings.rotation) % 360;
      ctx.save();
      ctx.font = "bold 14px Arial";
      ctx.fillStyle = "orangered";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`${angle.toFixed(0)}°`, point.x, point.y - 12);
      ctx.restore();
    });

    // **رسم رؤوس الشكل الاثني عشري بلون برتقالي محمر دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI); // دائرة أكبر قليلاً
      ctx.fillStyle = "#FF6347"; // برتقالي محمر (Tomato)
      ctx.fill();
      ctx.strokeStyle = "#CD5C5C"; // حدود أحمر فاتح
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // إضافة نقطة مركزية صغيرة للتأكيد
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#CD5C5C"; // نقطة مركزية أغمق
      ctx.fill();
      ctx.restore();
    });
  }

  // Drawing star variations
  function drawStar4(ctx, center, radius) {
    const r = degreeRingRadius;
    
    // النجمة الرباعية الصحيحة: أربعة رؤوس بزاوية 135°
    // النقاط الأربعة الأساسية للنجمة الرباعية
    const mainPoints = customStar4Angles.map((deg) => {
      const rad = ((deg + star4Rotation + settings.rotation - 90) * Math.PI) / 180;
      return {
        x: center + r * Math.cos(rad),
        y: center + r * Math.sin(rad),
      };
    });

    // النقاط الداخلية للنجمة (على مسافة أقل من المركز)
    const innerRadius = r * 0.4; // 40% من الشعاع الخارجي
    const innerPoints = [45, 135, 225, 315].map((deg) => {
      const rad = ((deg + star4Rotation + settings.rotation - 90) * Math.PI) / 180;
      return {
        x: center + innerRadius * Math.cos(rad),
        y: center + innerRadius * Math.sin(rad),
      };
    });

    ctx.save();
    
    // رسم النجمة الرباعية بتناوب النقاط الخارجية والداخلية
    ctx.beginPath();
    
    // البدء من النقطة الأولى الخارجية
    ctx.moveTo(mainPoints[0].x, mainPoints[0].y);
    
    // رسم النجمة بالتناوب بين النقاط الخارجية والداخلية
    for (let i = 0; i < 4; i++) {
      // الانتقال إلى النقطة الداخلية
      ctx.lineTo(innerPoints[i].x, innerPoints[i].y);
      // الانتقال إلى النقطة الخارجية التالية
      ctx.lineTo(mainPoints[(i + 1) % 4].x, mainPoints[(i + 1) % 4].y);
    }
    
    ctx.closePath();
    
    if (fillStar4) {
      ctx.fillStyle = "rgba(255, 215, 0, 0.2)";
      ctx.fill();
    }
    ctx.strokeStyle = "gold";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // جمع جميع النقاط للتفاعل (8 نقاط: 4 خارجية + 4 داخلية)
    const allPoints = [];
    for (let i = 0; i < 4; i++) {
      allPoints.push(mainPoints[i]);
      allPoints.push(innerPoints[i]);
    }

    // رسم خطوط الاتصال من المركز إلى النقاط الرئيسية فقط
    ctx.save();
    ctx.strokeStyle = "gold";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    mainPoints.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    // تمييز النقاط الرئيسية عند التفعيل
    if (highlightStar4) {
      mainPoints.forEach((p, i) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = hoveredPointIndex === i && selectedShape === "star4" ? "orange" : "yellow";
        ctx.fill();
        ctx.restore();
      });
    }

    // عرض قيم الزوايا عند التفعيل
    if (showStar4Angles) {
      const angles = [0, 90, 180, 270];
      mainPoints.forEach((point, idx) => {
        const currentAngle = (angles[idx] + star4Rotation + settings.rotation) % 360;
        
        ctx.save();
        ctx.fillStyle = "#B8860B"; // لون ذهبي غامق
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // وضع النص خارج النقطة قليلاً
        const textOffset = 20;
        const textAngle = ((angles[idx] + star4Rotation + settings.rotation - 90) * Math.PI) / 180;
        const textX = center + (r + textOffset) * Math.cos(textAngle);
        const textY = center + (r + textOffset) * Math.sin(textAngle);
        
        ctx.fillText(`${currentAngle.toFixed(0)}°`, textX, textY);
        ctx.restore();
      });
    }

    // **رسم رؤوس النجمة الرباعية بلون فضي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء**
    mainPoints.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#C0C0C0"; // فضي
      ctx.fill();
      ctx.strokeStyle = "#808080"; // حدود رمادي غامق
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // نقطة مركزية
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#808080";
      ctx.fill();
      ctx.restore();
    });
  }

  function drawStar3(ctx, center, radius) {
    console.log("Drawing star3 with radius:", radius, "rotation:", star3Rotation, "mode:", star3DrawMode);
    console.log("Using degreeRingRadius:", degreeRingRadius, "instead of passed radius:", radius);
    
    // النجمة الثلاثية الحقيقية - نجمة ثلاثية الأطراف متصلة
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 2;
    
    // ربط النجمة الثلاثية بحلقة الدرجات مثل المثلث - تجاهل معامل radius واستخدم degreeRingRadius
    const r = degreeRingRadius;
    
    if (star3DrawMode === "lines") {
      // رسم النجمة الثلاثية كنجمة متصلة من المركز إلى 3 نقاط خارجية
      // ثم ربط النقاط الخارجية ببعضها لتكوين مثلث خارجي
      
      const outerRadius = r; // استخدام degreeRingRadius بدلاً من radius
      const innerRadius = r * 0.3; // نصف قطر النقاط الداخلية
      
      // حساب النقاط الخارجية (رؤوس النجمة)
      const outerPoints = [];
      for (let i = 0; i < 3; i++) {
        const angle = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
        const x = center + outerRadius * Math.cos(angle);
        const y = center + outerRadius * Math.sin(angle);
        outerPoints.push({ x, y });
      }
      
      // حساب النقاط الداخلية (بين كل رأسين)
      const innerPoints = [];
      for (let i = 0; i < 3; i++) {
        const angle1 = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
        const angle2 = ((customStar3Angles[(i + 1) % 3]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
        
        // الزاوية في منتصف المسافة بين النقطتين الخارجيتين
        let midAngle = (angle1 + angle2) / 2;
        
        // تصحيح الزاوية إذا كانت هناك فجوة كبيرة (عبور الـ 360 درجة)
        if (Math.abs(angle2 - angle1) > Math.PI) {
          midAngle += Math.PI;
        }
        
        const x = center + innerRadius * Math.cos(midAngle);
        const y = center + innerRadius * Math.sin(midAngle);
        innerPoints.push({ x, y });
      }
      
      // رسم النجمة الثلاثية المتصلة
      ctx.beginPath();
      
      // البدء من النقطة الخارجية الأولى
      ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
      
      // رسم النجمة بالتنقل بين النقاط الخارجية والداخلية
      for (let i = 0; i < 3; i++) {
        const currentOuter = outerPoints[i];
        const nextInner = innerPoints[i];
        const nextOuter = outerPoints[(i + 1) % 3];
        
        // من النقطة الخارجية إلى النقطة الداخلية
        ctx.lineTo(nextInner.x, nextInner.y);
        // من النقطة الداخلية إلى النقطة الخارجية التالية
        ctx.lineTo(nextOuter.x, nextOuter.y);
      }
      
      ctx.closePath();
      ctx.stroke();
      
      // تعبئة النجمة إذا كانت مفعلة
      if (fillStar3) {
        ctx.fillStyle = "rgba(255, 215, 0, 0.3)";
        ctx.fill();
      }
      
      // رسم النقاط إذا كان التمييز مفعل
      if (highlightStar3) {
        // نقاط النجمة الخارجية (صفراء)
        outerPoints.forEach((point, idx) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 7, 0, 2 * Math.PI);
          // تغيير اللون عند hover
          ctx.fillStyle = hoveredPointIndex === idx && selectedShape === "star3" ? "orange" : "yellow";
          ctx.fill();
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 1;
          ctx.stroke();
        });
        
        // نقاط النجمة الداخلية (برتقالية)
        innerPoints.forEach((point, idx) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
          // تغيير اللون عند hover (إضافة 3 للفهرس لأن النقاط الداخلية تأتي بعد الخارجية)
          ctx.fillStyle = hoveredPointIndex === (idx + 3) && selectedShape === "star3" ? "red" : "orange";
          ctx.fill();
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      }
      
    } else {
      // رسم مثلث منتظم فقط
      const trianglePoints = [];
      for (let i = 0; i < 3; i++) {
        const angle = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
        const x = center + r * Math.cos(angle); // استخدام r (degreeRingRadius)
        const y = center + r * Math.sin(angle); // استخدام r (degreeRingRadius)
        trianglePoints.push({ x, y });
      }
      
      ctx.beginPath();
      ctx.moveTo(trianglePoints[0].x, trianglePoints[0].y);
      ctx.lineTo(trianglePoints[1].x, trianglePoints[1].y);
      ctx.lineTo(trianglePoints[2].x, trianglePoints[2].y);
      ctx.closePath();
      ctx.stroke();
      
      // تعبئة المثلث
      if (fillStar3) {
        ctx.fillStyle = "rgba(255, 215, 0, 0.3)";
        ctx.fill();
      }
      
      // رسم نقاط الرؤوس
      if (highlightStar3) {
        trianglePoints.forEach((point, idx) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
          // تغيير اللون عند hover
          ctx.fillStyle = hoveredPointIndex === idx && selectedShape === "star3" ? "orange" : "yellow";
          ctx.fill();
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      }
    }
    
    // عرض الزوايا
    if (showStar3Angles) {
      if (star3DrawMode === "lines") {
        // عرض زوايا النجمة الثلاثية - النقاط الخارجية والداخلية
        const outerAngles = customStar3Angles.map(angle => (angle + star3Rotation + settings.rotation - 90) % 360);
        
        // رسم زوايا النقاط الخارجية (رؤوس النجمة)
        outerAngles.forEach((angle, i) => {
          ctx.save();
          ctx.fillStyle = "#006400";
          ctx.font = "bold 18px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 3;
          
          const textOffset = 30;
          const textAngle = (angle - 90) * Math.PI / 180;
          const textX = center + (degreeRingRadius + textOffset) * Math.cos(textAngle);
          const textY = center + (degreeRingRadius + textOffset) * Math.sin(textAngle);
          
          // رسم حدود بيضاء للنص لجعله أكثر وضوحاً
          ctx.strokeText(`${angle.toFixed(0)}°`, textX, textY);
          ctx.fillText(`${angle.toFixed(0)}°`, textX, textY);
          ctx.restore();
        });
        
        // رسم زوايا النقاط الداخلية
        for (let i = 0; i < 3; i++) {
          const angle1 = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
          const angle2 = ((customStar3Angles[(i + 1) % 3]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
          
          let midAngle = (angle1 + angle2) / 2;
          if (Math.abs(angle2 - angle1) > Math.PI) {
            midAngle += Math.PI;
          }
          
          const innerAngle = (midAngle * 180 / Math.PI) % 360;
          
          ctx.save();
          ctx.fillStyle = "#228B22";
          ctx.font = "bold 15px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 2;
          
          const textOffset = 20;
          const innerRadius = degreeRingRadius * 0.3;
          const textX = center + (innerRadius + textOffset) * Math.cos(midAngle);
          const textY = center + (innerRadius + textOffset) * Math.sin(midAngle);
          
          // رسم حدود بيضاء للنص لجعله أكثر وضوحاً
          ctx.strokeText(`${innerAngle.toFixed(0)}°`, textX, textY);
          ctx.fillText(`${innerAngle.toFixed(0)}°`, textX, textY);
          ctx.restore();
        }
      } else {
        // عرض زوايا المثلث البسيط
        const angles = customStar3Angles.map(angle => (angle + star3Rotation + settings.rotation - 90) % 360);
          
        angles.forEach((angle, i) => {
          ctx.save();
          ctx.fillStyle = "#006400";
          ctx.font = "bold 16px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 3;
          
          const textOffset = 30;
          const textAngle = (angle - 90) * Math.PI / 180;
          const textX = center + (degreeRingRadius + textOffset) * Math.cos(textAngle);
          const textY = center + (degreeRingRadius + textOffset) * Math.sin(textAngle);
          
          // رسم حدود بيضاء للنص لجعله أكثر وضوحاً
          ctx.strokeText(`${angle.toFixed(0)}°`, textX, textY);
          ctx.fillText(`${angle.toFixed(0)}°`, textX, textY);
          ctx.restore();
        });
      }
    }
    
    // **رسم رؤوس النجمة الثلاثية بلون ذهبي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء**
    if (star3DrawMode === "lines") {
      const outerRadius = degreeRingRadius;
      const innerRadius = degreeRingRadius * 0.3;
      
      // النقاط الخارجية (رؤوس النجمة)
      const outerPoints = [];
      for (let i = 0; i < 3; i++) {
        const angle = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
        const x = center + outerRadius * Math.cos(angle);
        const y = center + outerRadius * Math.sin(angle);
        outerPoints.push({ x, y });
      }
      
      // النقاط الداخلية
      const innerPoints = [];
      for (let i = 0; i < 3; i++) {
        const angle1 = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
        const angle2 = ((customStar3Angles[(i + 1) % 3]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
        
        let midAngle = (angle1 + angle2) / 2;
        if (Math.abs(angle2 - angle1) > Math.PI) {
          midAngle += Math.PI;
        }
        
        const x = center + innerRadius * Math.cos(midAngle);
        const y = center + innerRadius * Math.sin(midAngle);
        innerPoints.push({ x, y });
      }
      
      // رسم النقاط الخارجية (رؤوس النجمة الرئيسية)
      outerPoints.forEach((point, i) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = "#FFD700"; // ذهبي
        ctx.fill();
        ctx.strokeStyle = "#B8860B"; // حدود ذهبي غامق
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // نقطة مركزية
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "#B8860B";
        ctx.fill();
        ctx.restore();
      });
      
      // رسم النقاط الداخلية
      innerPoints.forEach((point, i) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = "#DAA520"; // ذهبي أغمق
        ctx.fill();
        ctx.strokeStyle = "#8B7D00"; // حدود ذهبي أغمق
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // نقطة مركزية
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
        ctx.fillStyle = "#8B7D00";
        ctx.fill();
        ctx.restore();
      });
    } else {
      // رؤوس المثلث البسيط
      const trianglePoints = [];
      for (let i = 0; i < 3; i++) {
        const angle = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
        const x = center + degreeRingRadius * Math.cos(angle);
        const y = center + degreeRingRadius * Math.sin(angle);
        trianglePoints.push({ x, y });
      }
      
      trianglePoints.forEach((point, i) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = "#FFD700"; // ذهبي
        ctx.fill();
        ctx.strokeStyle = "#B8860B"; // حدود ذهبي غامق
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // نقطة مركزية
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "#B8860B";
        ctx.fill();
        ctx.restore();
      });
    }
    
    console.log("Finished drawing star3");
  }

  function drawStar5(ctx, center, radius) {
    // النجمة الخماسية التقليدية (البنتاغرام) - نجمة {5/2}
    // رسم النجمة الخماسية بنفس الطريقة الموضحة في الصورة المرفقة
    const outerPoints = [];
    
    // حساب النقاط الخمس للنجمة
    for (let i = 0; i < 5; i++) {
      const angle = ((customPentagonAngles[i]) + star5Rotation + settings.rotation - 90) * Math.PI / 180;
      outerPoints.push({
        x: center + degreeRingRadius * Math.cos(angle),
        y: center + degreeRingRadius * Math.sin(angle),
      });
    }

    // حساب النقاط الداخلية (نقاط التقاطع) للنجمة الخماسية
    const innerPoints = [];
    for (let i = 0; i < 5; i++) {
      // نقاط التقاطع تكون على مسافة أقرب للمركز
      const angle = ((customPentagonAngles[i]) + star5Rotation + settings.rotation - 90 + 36) * Math.PI / 180; // إضافة 36 درجة للحصول على النقاط الداخلية
      const innerRadius = degreeRingRadius * 0.4; // 40% من الشعاع الخارجي
      innerPoints.push({
        x: center + innerRadius * Math.cos(angle),
        y: center + innerRadius * Math.sin(angle),
      });
    }

    ctx.save();
    
    // رسم النجمة الخماسية التقليدية - البنتاغرام {5/2}
    // كل نقطة تتصل بالنقطة الثانية التالية لتشكيل النجمة
    ctx.beginPath();
    
    // البدء من النقطة الأولى
    ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
    
    // رسم الخطوط المتصلة للنجمة
    // النمط: 0→2→4→1→3→0 (كل نقطة تتصل بالنقطة الثانية التالية)
    for (let i = 0; i < 5; i++) {
      const nextIndex = (i * 2) % 5;
      ctx.lineTo(outerPoints[nextIndex].x, outerPoints[nextIndex].y);
    }
    
    ctx.closePath();
    
    // تعبئة النجمة إذا كانت مطلوبة
    if (fillStar5) {
      ctx.fillStyle = "rgba(184, 134, 11, 0.3)";
      ctx.fill();
    }
    
    // رسم حدود النجمة
    ctx.strokeStyle = "#B8860B";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // رسم الخطوط الشعاعية من المركز إلى النقاط (اختياري)
    if (highlightStar5) {
      ctx.save();
      ctx.strokeStyle = "rgba(184, 134, 11, 0.6)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      outerPoints.forEach((p) => {
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      });
      ctx.restore();
      
      // تمييز النقاط
      outerPoints.forEach((p, idx) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.restore();
      });
    }
    
    // تمييز النقطة المحددة (عند التمرير)
    if (hoveredPointIndex !== null && selectedShape === "star5") {
      const hoveredPoint = outerPoints[hoveredPointIndex];
      if (hoveredPoint) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(hoveredPoint.x, hoveredPoint.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = "cyan";
        ctx.fill();
        ctx.restore();
      }
    }
    
    // عرض الزوايا النصية عند الرؤوس
    if (showStar5Angles) {
      outerPoints.forEach((point, i) => {
        const angle = (customPentagonAngles[i] + star5Rotation + settings.rotation) % 360;
        ctx.save();
        ctx.font = "bold 16px Tahoma";
        ctx.fillStyle = "#2F4F4F";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(`(${angle.toFixed(0)}°)`, point.x, point.y - 12);
        ctx.restore();
      });
    }

    // **رسم رؤوس النجمة الخماسية بلون ذهبي لامع دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء**
    // النقاط الخارجية (رؤوس النجمة الرئيسية)
    outerPoints.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#FFD700"; // ذهبي لامع
      ctx.fill();
      ctx.strokeStyle = "#FF8C00"; // حدود برتقالي ذهبي
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // نقطة مركزية
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#FF8C00";
      ctx.fill();
      ctx.restore();
    });

    // النقاط الداخلية (نقاط التقاطع)
    innerPoints.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = "#FFA500"; // برتقالي ذهبي
      ctx.fill();
      ctx.strokeStyle = "#FF6347"; // حدود برتقالي أحمر
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // نقطة مركزية
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = "#FF6347";
      ctx.fill();
      ctx.restore();
    });
  }

  function drawStar6(ctx, center, radius) {
    const r = degreeRingRadius;
    
    // النجمة السداسية الصحيحة: مثلثان متساويان متداخلان
    // المثلث الأول: نقاط عند 0°، 120°، 240°
    // المثلث الثاني: نقاط عند 60°، 180°، 300°
    
    const triangle1Points = [0, 120, 240].map((deg) => {
      const rad = ((deg + star6Rotation + settings.rotation - 90) * Math.PI) / 180;
      return {
        x: center + r * Math.cos(rad),
        y: center + r * Math.sin(rad),
      };
    });
    
    const triangle2Points = [60, 180, 300].map((deg) => {
      const rad = ((deg + star6Rotation + settings.rotation - 90) * Math.PI) / 180;
      return {
        x: center + r * Math.cos(rad),
        y: center + r * Math.sin(rad),
      };
    });

    ctx.save();
    
    // رسم المثلث الأول
    ctx.beginPath();
    ctx.moveTo(triangle1Points[0].x, triangle1Points[0].y);
    ctx.lineTo(triangle1Points[1].x, triangle1Points[1].y);
    ctx.lineTo(triangle1Points[2].x, triangle1Points[2].y);
    ctx.closePath();
    
    if (fillStar6) {
      ctx.fillStyle = "rgba(0, 0, 255, 0.15)";
      ctx.fill();
    }
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // رسم المثلث الثاني
    ctx.beginPath();
    ctx.moveTo(triangle2Points[0].x, triangle2Points[0].y);
    ctx.lineTo(triangle2Points[1].x, triangle2Points[1].y);
    ctx.lineTo(triangle2Points[2].x, triangle2Points[2].y);
    ctx.closePath();
    
    if (fillStar6) {
      ctx.fillStyle = "rgba(0, 0, 255, 0.15)";
      ctx.fill();
    }
    ctx.stroke();
    
    ctx.restore();

    // جمع جميع النقاط للتفاعل (6 نقاط بالترتيب)
    const allPoints = [
      triangle1Points[0], // 0°
      triangle2Points[0], // 60°
      triangle1Points[1], // 120°
      triangle2Points[1], // 180°
      triangle1Points[2], // 240°
      triangle2Points[2]  // 300°
    ];

    // رسم خطوط الاتصال من المركز إلى الرؤوس
    ctx.save();
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    allPoints.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    // تمييز النقاط عند التفعيل
    if (highlightStar6) {
      allPoints.forEach((p, i) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = hoveredPointIndex === i && selectedShape === "star6" ? "orange" : "yellow";
        ctx.fill();
        ctx.restore();
      });
    }

    // عرض قيم الزوايا عند التفعيل
    if (showStar6Angles) {
      const angles = [0, 60, 120, 180, 240, 300];
      allPoints.forEach((point, idx) => {
        const currentAngle = (angles[idx] + star6Rotation + settings.rotation) % 360;
        
        ctx.save();
        ctx.fillStyle = "#000080"; // لون أزرق غامق
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // وضع النص خارج النقطة قليلاً
        const textOffset = 20;
        const textAngle = ((angles[idx] + star6Rotation + settings.rotation - 90) * Math.PI) / 180;
        const textX = center + (r + textOffset) * Math.cos(textAngle);
        const textY = center + (r + textOffset) * Math.sin(textAngle);
        
        ctx.fillText(`${currentAngle.toFixed(0)}°`, textX, textY);
        ctx.restore();
      });
    }

    // **رسم رؤوس النجمة السداسية بلون أزرق لامع دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء**
    allPoints.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#1E90FF"; // أزرق لامع (DodgerBlue)
      ctx.fill();
      ctx.strokeStyle = "#4169E1"; // حدود أزرق ملكي
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // نقطة مركزية
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#4169E1";
      ctx.fill();
      ctx.restore();
    });
  }

  function drawStar7(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = [];
    
    // حساب النقاط السبع على المحيط
    for (let i = 0; i < 7; i++) {
      const angle = ((i * 360 / 7) + star7Rotation + settings.rotation - 90) * Math.PI / 180;
      points.push({
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      });
    }

    // رسم النجمة السباعية {7/3} - النمط المنتظم
    // الزاوية الداخلية: ≈25.714°، زمرة التناظر: D7
    ctx.save();
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 2;
    
    // النمط {7/3} - يتطلب رسم مسارات متعددة
    // النجمة السباعية {7/3} تتكون من خطوط منفصلة
    const visited = new Array(7).fill(false);
    
    for (let start = 0; start < 7; start++) {
      if (!visited[start]) {
        ctx.beginPath();
        let current = start;
        ctx.moveTo(points[current].x, points[current].y);
        
        do {
          visited[current] = true;
          current = (current + 3) % 7;
          ctx.lineTo(points[current].x, points[current].y);
        } while (current !== start);
        
        ctx.closePath();
        
        if (fillStar7) {
          ctx.fillStyle = "rgba(255, 165, 0, 0.2)";
          ctx.fill();
        }
        ctx.stroke();
      }
    }
    
    ctx.restore();

    // Draw radial connection lines from center to vertices
    ctx.save();
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    if (highlightStar7) {
      points.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.restore();
      });
    }

    // إظهار الزوايا للنجمة السباعية
    if (showStar7Angles) {
      points.forEach((point, idx) => {
        const angleDeg = (idx * 360 / 7 + star7Rotation + settings.rotation) % 360;
        ctx.save();
        ctx.font = "12px Arial";
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        ctx.fillText(`${angleDeg.toFixed(1)}°`, point.x, point.y - 10);
        ctx.restore();
      });
    }

    // **رسم رؤوس النجمة السباعية بلون برتقالي نحاسي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#CD853F"; // برتقالي نحاسي (Peru)
      ctx.fill();
      ctx.strokeStyle = "#A0522D"; // حدود بني محمر
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // نقطة مركزية
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#A0522D";
      ctx.fill();
      ctx.restore();
    });
  }

  function drawStar8(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = [];
    
    // حساب النقاط الثمانية على المحيط (كل 45°)
    for (let i = 0; i < 8; i++) {
      const angle = ((i * 45) + star8Rotation + settings.rotation - 90) * Math.PI / 180;
      points.push({
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      });
    }

    // رسم النجمة الثمانية بالنمط {8/3}
    ctx.save();
    ctx.strokeStyle = "purple";
    ctx.lineWidth = 2;
    
    // النمط {8/3}: نرسم مسار مغلق للحصول على شكل قابل للتعبئة
    ctx.beginPath();
    
    // البدء من النقطة الأولى واتباع النمط {8/3}
    let currentIndex = 0;
    ctx.moveTo(points[currentIndex].x, points[currentIndex].y);
    
    // رسم النمط الكامل
    for (let i = 0; i < 8; i++) {
      currentIndex = (currentIndex + 3) % 8;
      ctx.lineTo(points[currentIndex].x, points[currentIndex].y);
    }
    ctx.closePath();
    
    // التعبئة أولاً إذا كانت مفعلة
    if (fillStar8) {
      ctx.fillStyle = "rgba(128, 0, 128, 0.2)";
      ctx.fill();
    }
    
    // رسم الحدود
    ctx.stroke();
    
    // تمييز النجمة إذا كانت مفعلة
    if (highlightStar8) {
      ctx.strokeStyle = "rgba(255, 255, 0, 0.7)";
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    
    ctx.restore();
    
    // رسم النقاط مع الزوايا
    points.forEach((point, index) => {
      // رسم النقطة
      ctx.save();
      ctx.beginPath();
      
      // تمييز النقطة إذا كانت محومة عليها
      const isHovered = hoveredPointIndex === index && selectedShape === "star8";
      const pointSize = isHovered ? 7 : 5; // زيادة حجم النقطة عند التمرير
      
      ctx.arc(point.x, point.y, pointSize, 0, 2 * Math.PI);
      ctx.fillStyle = isHovered ? "yellow" : (highlightStar8 ? "orange" : "purple");
      ctx.fill();
      // إضافة حدود للنقطة لجعلها أوضح
      ctx.strokeStyle = isHovered ? "red" : "white";
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();
      ctx.restore();
      
      // إظهار الزوايا إذا كانت مفعلة
      if (showStar8Angles) {
        const angle = (index * 45 + star8Rotation + settings.rotation) % 360;
        const displayAngle = angle < 0 ? angle + 360 : angle;
        
        ctx.save();
        ctx.font = "12px Arial";
        ctx.fillStyle = "purple";
        ctx.textAlign = "center";
        ctx.fillText(`${displayAngle.toFixed(0)}°`, point.x, point.y - 15);
        ctx.restore();
      }
    });

    // **رسم رؤوس النجمة الثمانية بلون بنفسجي ملكي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#8A2BE2"; // بنفسجي ملكي (BlueViolet)
      ctx.fill();
      ctx.strokeStyle = "#4B0082"; // حدود نيلي
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // نقطة مركزية
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#4B0082";
      ctx.fill();
      ctx.restore();
    });
  }

  function drawStar9(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = [];
    
    // حساب النقاط التسع على المحيط (كل 40°)
    for (let i = 0; i < 9; i++) {
      const angle = ((i * 360 / 9) + star9Rotation + settings.rotation - 90) * Math.PI / 180;
      points.push({
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      });
    }

    // رسم النجمة التساعية بالنمط {9/4}
    ctx.save();
    ctx.strokeStyle = "#C44569"; // لون وردي أغمق
    ctx.lineWidth = 2;
    
    // النمط {9/4}: رسم خطوط منفصلة من كل نقطة إلى النقطة الرابعة التالية
    // هذا سينتج عنه نجمة تساعية مختلفة عن النمط {9/3}
    for (let i = 0; i < 9; i++) {
      const startIndex = i;
      const endIndex = (i + 4) % 9;
      
      ctx.beginPath();
      ctx.moveTo(points[startIndex].x, points[startIndex].y);
      ctx.lineTo(points[endIndex].x, points[endIndex].y);
      ctx.stroke();
    }
    
    // التعبئة إذا كانت مفعلة - نرسم المضلعات المتشكلة من تقاطع الخطوط
    if (fillStar9) {
      ctx.fillStyle = "rgba(196, 69, 105, 0.2)"; // لون وردي أغمق للتعبئة
      
      // النمط {9/4} ينتج عنه شكل نجمة مكونة من تسعة نقاط متصلة
      // نرسم مسار واحد مغلق يمر عبر جميع النقاط حسب النمط {9/4}
      ctx.beginPath();
      let currentIndex = 0;
      ctx.moveTo(points[currentIndex].x, points[currentIndex].y);
      
      for (let i = 0; i < 9; i++) {
        currentIndex = (currentIndex + 4) % 9;
        ctx.lineTo(points[currentIndex].x, points[currentIndex].y);
      }
      ctx.closePath();
      ctx.fill();
    }
    
    // تمييز النجمة إذا كانت مفعلة
    if (highlightStar9) {
      ctx.strokeStyle = "rgba(255, 255, 0, 0.7)";
      ctx.lineWidth = 4;
      
      // إعادة رسم الخطوط للتمييز
      for (let i = 0; i < 9; i++) {
        const startIndex = i;
        const endIndex = (i + 4) % 9;
        
        ctx.beginPath();
        ctx.moveTo(points[startIndex].x, points[startIndex].y);
        ctx.lineTo(points[endIndex].x, points[endIndex].y);
        ctx.stroke();
      }
    }
    
    ctx.restore();

    // رسم خطوط الاتصال من المركز إلى الرؤوس (اختياري)
    ctx.save();
    ctx.strokeStyle = "rgba(196, 69, 105, 0.5)"; // لون وردي أغمق مع شفافية
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    // رسم النقاط التفاعلية
    points.forEach((point, index) => {
      ctx.save();
      ctx.beginPath();
      
      // تمييز النقطة إذا كانت محومة عليها
      const isHovered = hoveredPointIndex === index && selectedShape === "star9";
      const pointSize = isHovered ? 7 : 5;
      
      ctx.arc(point.x, point.y, pointSize, 0, 2 * Math.PI);
      ctx.fillStyle = isHovered ? "yellow" : (highlightStar9 ? "orange" : "#C44569");
      ctx.fill();
      
      // إضافة حدود للنقطة لجعلها أوضح
      ctx.strokeStyle = isHovered ? "red" : "#8B2C49"; // لون وردي أغمق للحدود
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();
      ctx.restore();
      
      // إظهار الزوايا إذا كانت مفعلة
      if (showStar9Angles) {
        const angle = ((index * 360 / 9) + star9Rotation + settings.rotation) % 360;
        const displayAngle = angle < 0 ? angle + 360 : angle;
        
        ctx.save();
        ctx.font = "12px Arial";
        ctx.fillStyle = "#C44569"; // نفس لون النجمة
        ctx.strokeStyle = "white"; // خلفية بيضاء للنص
        ctx.lineWidth = 3;
        ctx.textAlign = "center";
        
        // رسم خلفية للنص
        ctx.strokeText(`${displayAngle.toFixed(0)}°`, point.x, point.y - 15);
        ctx.fillText(`${displayAngle.toFixed(0)}°`, point.x, point.y - 15);
        ctx.restore();
      }
    });

    // **رسم رؤوس النجمة التساعية بلون وردي كريزون دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#DC143C"; // كريزون (Crimson)
      ctx.fill();
      ctx.strokeStyle = "#B22222"; // حدود أحمر ناري
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // نقطة مركزية
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#B22222";
      ctx.fill();
      ctx.restore();
    });
  }

  function drawStar10(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = [];
    
    // حساب النقاط العشر على المحيط (كل 36°)
    for (let i = 0; i < 10; i++) {
      const angle = ((i * 360 / 10) + star10Rotation + settings.rotation - 90) * Math.PI / 180;
      points.push({
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      });
    }

    // رسم النجمة العشارية بالنمط {10/4}
    ctx.save();
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 2;
    
    // النمط {10/4}: رسم خطوط منفصلة من كل نقطة إلى النقطة الرابعة التالية
    // هذا سينتج عنه نجمة عشارية كاملة مع جميع الخطوط المرئية
    for (let i = 0; i < 10; i++) {
      const startIndex = i;
      const endIndex = (i + 4) % 10;
      
      ctx.beginPath();
      ctx.moveTo(points[startIndex].x, points[startIndex].y);
      ctx.lineTo(points[endIndex].x, points[endIndex].y);
      ctx.stroke();
    }
    
    // التعبئة إذا كانت مفعلة - نرسم المضلعات المتشكلة من تقاطع الخطوط
    if (fillStar10) {
      ctx.fillStyle = "rgba(0, 255, 255, 0.2)";
      
      // النمط {10/4} ينتج عنه نجمة مكونة من خماسيين متداخلين
      // الخماسي الأول: النقاط 0, 4, 8, 2, 6
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[4].x, points[4].y);
      ctx.lineTo(points[8].x, points[8].y);
      ctx.lineTo(points[2].x, points[2].y);
      ctx.lineTo(points[6].x, points[6].y);
      ctx.closePath();
      ctx.fill();
      
      // الخماسي الثاني: النقاط 1, 5, 9, 3, 7
      ctx.beginPath();
      ctx.moveTo(points[1].x, points[1].y);
      ctx.lineTo(points[5].x, points[5].y);
      ctx.lineTo(points[9].x, points[9].y);
      ctx.lineTo(points[3].x, points[3].y);
      ctx.lineTo(points[7].x, points[7].y);
      ctx.closePath();
      ctx.fill();
    }
    
    // تمييز النجمة إذا كانت مفعلة
    if (highlightStar10) {
      ctx.strokeStyle = "rgba(255, 255, 0, 0.7)";
      ctx.lineWidth = 4;
      
      // إعادة رسم الخطوط للتمييز
      for (let i = 0; i < 10; i++) {
        const startIndex = i;
        const endIndex = (i + 4) % 10;
        
        ctx.beginPath();
        ctx.moveTo(points[startIndex].x, points[startIndex].y);
        ctx.lineTo(points[endIndex].x, points[endIndex].y);
        ctx.stroke();
      }
    }
    
    ctx.restore();

    // رسم خطوط الاتصال من المركز إلى الرؤوس (اختياري)
    ctx.save();
    ctx.strokeStyle = "rgba(0, 255, 255, 0.5)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    // رسم النقاط التفاعلية
    points.forEach((point, index) => {
      ctx.save();
      ctx.beginPath();
      
      // تمييز النقطة إذا كانت محومة عليها
      const isHovered = hoveredPointIndex === index && selectedShape === "star10";
      const pointSize = isHovered ? 7 : 5;
      
      ctx.arc(point.x, point.y, pointSize, 0, 2 * Math.PI);
      ctx.fillStyle = isHovered ? "yellow" : (highlightStar10 ? "orange" : "cyan");
      ctx.fill();
      
      // إضافة حدود للنقطة لجعلها أوضح
      ctx.strokeStyle = isHovered ? "red" : "white";
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();
      ctx.restore();
      
      // إظهار الزوايا إذا كانت مفعلة
      if (showStar10Angles) {
        const angle = ((index * 360 / 10) + star10Rotation + settings.rotation) % 360;
        const displayAngle = angle < 0 ? angle + 360 : angle;
        
        ctx.save();
        ctx.font = "12px Arial";
        ctx.fillStyle = "cyan";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.textAlign = "center";
        
        // رسم خلفية للنص
        ctx.strokeText(`${displayAngle.toFixed(0)}°`, point.x, point.y - 15);
        // رسم النص
        ctx.fillText(`${displayAngle.toFixed(0)}°`, point.x, point.y - 15);
        ctx.restore();
      }
    });

    // **رسم رؤوس النجمة العشرية بلون سماوي كهربائي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#00FFFF"; // سماوي كهربائي (Cyan)
      ctx.fill();
      ctx.strokeStyle = "#008B8B"; // حدود سماوي غامق
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // نقطة مركزية
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#008B8B";
      ctx.fill();
      ctx.restore();
    });
  }

  function drawStar11(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = [];
    
    // حساب النقاط الإحدى عشرة على المحيط
    for (let i = 0; i < 11; i++) {
      const angle = ((i * 360 / 11) + star11Rotation + settings.rotation - 90) * Math.PI / 180;
      points.push({
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      });
    }

    // رسم النجمة الحادية عشرة بالنمط {11/4}
    ctx.save();
    ctx.strokeStyle = "deeppink";
    ctx.lineWidth = 2;
    
    // النمط {11/4}: رسم خطوط منفصلة من كل نقطة إلى النقطة الرابعة التالية
    // هذا سينتج عنه نجمة حادية عشر كاملة مع جميع الخطوط المرئية
    for (let i = 0; i < 11; i++) {
      const startIndex = i;
      const endIndex = (i + 4) % 11;
      
      ctx.beginPath();
      ctx.moveTo(points[startIndex].x, points[startIndex].y);
      ctx.lineTo(points[endIndex].x, points[endIndex].y);
      ctx.stroke();
    }
    
    // التعبئة إذا كانت مفعلة - نرسم مسار واحد مغلق
    if (fillStar11) {
      ctx.fillStyle = "rgba(255, 20, 147, 0.2)";
      
      // النمط {11/4} ينتج عنه نجمة واحدة متصلة
      ctx.beginPath();
      let currentIndex = 0;
      ctx.moveTo(points[currentIndex].x, points[currentIndex].y);
      
      for (let i = 0; i < 11; i++) {
        currentIndex = (currentIndex + 4) % 11;
        ctx.lineTo(points[currentIndex].x, points[currentIndex].y);
      }
      ctx.closePath();
      ctx.fill();
    }
    
    // تمييز النجمة إذا كانت مفعلة
    if (highlightStar11) {
      ctx.strokeStyle = "rgba(255, 255, 0, 0.7)";
      ctx.lineWidth = 4;
      
      // إعادة رسم الخطوط للتمييز
      for (let i = 0; i < 11; i++) {
        const startIndex = i;
        const endIndex = (i + 4) % 11;
        
        ctx.beginPath();
        ctx.moveTo(points[startIndex].x, points[startIndex].y);
        ctx.lineTo(points[endIndex].x, points[endIndex].y);
        ctx.stroke();
      }
    }
    
    ctx.restore();

    // رسم خطوط الاتصال من المركز إلى الرؤوس (اختياري)
    ctx.save();
    ctx.strokeStyle = "rgba(255, 20, 147, 0.5)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    // رسم النقاط التفاعلية
    points.forEach((point, index) => {
      ctx.save();
      ctx.beginPath();
      
      // تمييز النقطة إذا كانت محومة عليها
      const isHovered = hoveredPointIndex === index && selectedShape === "star11";
      const pointSize = isHovered ? 7 : 5;
      
      ctx.arc(point.x, point.y, pointSize, 0, 2 * Math.PI);
      ctx.fillStyle = isHovered ? "yellow" : (highlightStar11 ? "orange" : "deeppink");
      ctx.fill();
      
      // إضافة حدود للنقطة لجعلها أوضح
      ctx.strokeStyle = isHovered ? "red" : "white";
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();
      ctx.restore();
      
      // إظهار الزوايا إذا كانت مفعلة
      if (showStar11Angles) {
        const angle = ((index * 360 / 11) + star11Rotation + settings.rotation) % 360;
        const displayAngle = angle < 0 ? angle + 360 : angle;
        
        ctx.save();
        ctx.font = "12px Arial";
        ctx.fillStyle = "deeppink"; // نفس لون النجمة
        ctx.strokeStyle = "white"; // خلفية بيضاء للنص
        ctx.lineWidth = 3;
        ctx.textAlign = "center";
        
        // رسم خلفية للنص
        ctx.strokeText(`${displayAngle.toFixed(0)}°`, point.x, point.y - 15);
        ctx.fillText(`${displayAngle.toFixed(0)}°`, point.x, point.y - 15);
        ctx.restore();
      }
    });

    // **رسم رؤوس النجمة الحادية عشرية بلون وردي عميق ملكي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#FF1493"; // وردي عميق (DeepPink)
      ctx.fill();
      ctx.strokeStyle = "#8B0039"; // حدود وردي غامق جداً
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // نقطة مركزية
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#8B0039";
      ctx.fill();
      ctx.restore();
    });
  }

  function drawStar12(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = [];
    
    // حساب النقاط الاثنى عشرة على المحيط (كل 30°)
    for (let i = 0; i < 12; i++) {
      const angle = ((i * 360 / 12) + star12Rotation + settings.rotation - 90) * Math.PI / 180;
      points.push({
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      });
    }

    // رسم النجمة الثانية عشرة بالنمط {12/5}
    ctx.save();
    ctx.strokeStyle = "orangered";
    ctx.lineWidth = 2;
    
    // النمط {12/5}: رسم خطوط منفصلة من كل نقطة إلى النقطة الخامسة التالية
    // هذا سينتج عنه نجمة اثني عشر كاملة مع جميع الخطوط المرئية
    for (let i = 0; i < 12; i++) {
      const startIndex = i;
      const endIndex = (i + 5) % 12;
      
      ctx.beginPath();
      ctx.moveTo(points[startIndex].x, points[startIndex].y);
      ctx.lineTo(points[endIndex].x, points[endIndex].y);
      ctx.stroke();
    }
    
    // التعبئة إذا كانت مفعلة - نرسم مسار واحد مغلق
    if (fillStar12) {
      ctx.fillStyle = "rgba(255, 69, 0, 0.2)";
      
      // النمط {12/5} ينتج عنه نجمة واحدة متصلة
      ctx.beginPath();
      let currentIndex = 0;
      ctx.moveTo(points[currentIndex].x, points[currentIndex].y);
      
      for (let i = 0; i < 12; i++) {
        currentIndex = (currentIndex + 5) % 12;
        ctx.lineTo(points[currentIndex].x, points[currentIndex].y);
      }
      ctx.closePath();
      ctx.fill();
    }
    
    // تمييز النجمة إذا كانت مفعلة
    if (highlightStar12) {
      ctx.strokeStyle = "rgba(255, 255, 0, 0.7)";
      ctx.lineWidth = 4;
      
      // إعادة رسم الخطوط للتمييز
      for (let i = 0; i < 12; i++) {
        const startIndex = i;
        const endIndex = (i + 5) % 12;
        
        ctx.beginPath();
        ctx.moveTo(points[startIndex].x, points[startIndex].y);
        ctx.lineTo(points[endIndex].x, points[endIndex].y);
        ctx.stroke();
      }
    }
    
    ctx.restore();

    // رسم خطوط الاتصال من المركز إلى الرؤوس (اختياري)
    ctx.save();
    ctx.strokeStyle = "rgba(255, 69, 0, 0.5)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    // رسم النقاط التفاعلية
    points.forEach((point, index) => {
      ctx.save();
      ctx.beginPath();
      
      // تمييز النقطة إذا كانت محومة عليها
      const isHovered = hoveredPointIndex === index && selectedShape === "star12";
      const pointSize = isHovered ? 7 : 5;
      
      ctx.arc(point.x, point.y, pointSize, 0, 2 * Math.PI);
      ctx.fillStyle = isHovered ? "yellow" : (highlightStar12 ? "orange" : "orangered");
      ctx.fill();
      
      // إضافة حدود للنقطة لجعلها أوضح
      ctx.strokeStyle = isHovered ? "red" : "white";
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();
      ctx.restore();
      
      // إظهار الزوايا إذا كانت مفعلة
      if (showStar12Angles) {
        const angle = ((index * 360 / 12) + star12Rotation + settings.rotation) % 360;
        const displayAngle = angle < 0 ? angle + 360 : angle;
        
        ctx.save();
        ctx.font = "12px Arial";
        ctx.fillStyle = "orangered"; // نفس لون النجمة
        ctx.strokeStyle = "white"; // خلفية بيضاء للنص
        ctx.lineWidth = 3;
        ctx.textAlign = "center";
        
        // رسم خلفية للنص
        ctx.strokeText(`${displayAngle.toFixed(0)}°`, point.x, point.y - 15);
        ctx.fillText(`${displayAngle.toFixed(0)}°`, point.x, point.y - 15);
        ctx.restore();
      }
    });

    // **رسم رؤوس النجمة الاثني عشرية بلون برتقالي أحمر لهبي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#FF4500"; // برتقالي أحمر (OrangeRed)
      ctx.fill();
      ctx.strokeStyle = "#CD3700"; // حدود برتقالي أحمر غامق
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // نقطة مركزية
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#CD3700";
      ctx.fill();
      ctx.restore();
    });
  }

  // Main shape drawing function
  function drawShape(ctx, center, radius, shape) {
    console.log("drawShape called with shape:", shape);
    switch (shape) {
      case "triangle":
        // تم تنفيذ رسم المثلث مباشرة في useEffect
        break;
      case "star3":
        console.log("About to call drawStar3");
        drawStar3(ctx, center, radius);
        console.log("Finished calling drawStar3");
        break;
      case "square":
        drawSquare(ctx, center, radius);
        break;
      case "star4":
        drawStar4(ctx, center, radius);
        break;
      case "pentagon":
        drawPentagon(ctx, center, radius);
        break;
      case "star5":
        drawStar5(ctx, center, radius);
        break;
      case "hexagon":
        drawHexagon(ctx, center, radius);
        break;
      case "star6":
        drawStar6(ctx, center, radius);
        break;
      case "heptagon":
        drawHeptagon(ctx, center, radius);
        break;
      case "star7":
        drawStar7(ctx, center, radius);
        break;
      case "octagon":
        drawOctagon(ctx, center, radius);
        break;
      case "star8":
        drawStar8(ctx, center, radius);
        break;
      case "nonagon":
        drawNonagon(ctx, center, radius);
        break;
      case "star9":
        drawStar9(ctx, center, radius);
        break;
      case "decagon":
        drawDecagon(ctx, center, radius);
        break;
      case "star10":
        drawStar10(ctx, center, radius);
        break;
      case "eleven":
        drawHendecagon(ctx, center, radius);
        break;
      case "star11":
        drawStar11(ctx, center, radius);
        break;
      case "twelve":
        drawDodecagon(ctx, center, radius);
        break;
      case "star12":
        drawStar12(ctx, center, radius);
        break;
    }
  }

useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const center = canvasSize / 2;
  
  // استخدام نفس حساب عجلة الزوايا المحسن من بداية الكود
  const innerRadius = canvasSize / 2 - 50;
  const baseRingWidth = 20;
  const digitScale = 8;
  
  // حساب نصف قطر آخر حلقة بنفس منطق الحلقة الفعلية
  let calculatedLastRadius = innerRadius;
  for (let level = 0; level < settings.levels; level++) {
    const maxDigitsInLevel = Math.max(
      ...Array.from({ length: settings.divisions }, (_, i) => {
        const globalIndex = level * settings.divisions + i;
        return parseFloat((settings.startValue + globalIndex).toFixed(2)).toString().length;
      })
    );
    const dynamicWidth = baseRingWidth + maxDigitsInLevel * digitScale;
    calculatedLastRadius += dynamicWidth;
  }
  const lastNumberRingRadius = calculatedLastRadius;
  
  // حلقة الدرجات تأتي قبل حلقة الأبراج (داخلياً منها)
  const degreeRingRadius = lastNumberRingRadius + 10; // بعد حلقات الأرقام مع مسافة صغيرة
  
  // عجلة الزوايا تأتي مباشرة بعد حلقة الدرجات
  const angleWheelInnerRadius = degreeRingRadius + 25; // مباشرة بعد حلقة الدرجات
  const angleWheelOuterRadius = angleWheelInnerRadius + 40; // منطقة واسعة للنقر
  
  // حلقة الأبراج تأتي بعد عجلة الزوايا
  const zodiacInnerRadius = showAngleWheel ? angleWheelOuterRadius + 5 : degreeRingRadius + 18;
  const zodiacOuterRadius = zodiacInnerRadius + 30;

  const getMousePos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    
    return {
      x: rawX * scaleX,
      y: rawY * scaleY,
    };
  };

  const getAngleDeg = (x, y) => {
    // حساب الزاوية الخام من المركز
    const angle = Math.atan2(y - center, x - center) * (180 / Math.PI);
    // تحويل الزاوية لتتوافق مع نظام الرسم (-90° للأعلى)
    // في نظام الرسم: -90° = أعلى، 0° = يمين، 90° = أسفل، 180° = يسار
    let adjustedAngle = angle + 90;
    // تأكد من أن النتيجة في نطاق 0-360
    if (adjustedAngle < 0) adjustedAngle += 360;
    if (adjustedAngle >= 360) adjustedAngle -= 360;
    return adjustedAngle;
  };

  const getDistance = (x1, y1, x2, y2) => {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // دالة حساب المسافة من نقطة إلى خط
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

  function onMouseDown(e) {
    const { x, y } = getMousePos(e);
    console.log(`\n🖱️ ======== MAIN MOUSE DOWN EVENT ========`);
    console.log(`📍 Raw click position: (${x.toFixed(1)}, ${y.toFixed(1)})`);
    console.log(`🎯 Canvas center: (${center}, ${center})`);
    console.log(`📋 Selected shape: ${selectedShape}, Show angle wheel: ${showAngleWheel}`);
    
    const distanceFromCenter = getDistance(x, y, center, center);
    
    console.log(`📏 Ring calculations (using GLOBAL values):`);
    console.log(`   angleWheelInnerRadius: ${angleWheelInnerRadius.toFixed(1)}`);
    console.log(`   angleWheelOuterRadius: ${angleWheelOuterRadius.toFixed(1)}`);
    console.log(`   distanceFromCenter: ${distanceFromCenter.toFixed(1)}`);
    
    // **تجاهل عجلة الزوايا تماماً - يتم التعامل معها في الـ listener المخصص**
    if (showAngleWheel && distanceFromCenter >= angleWheelInnerRadius && distanceFromCenter <= angleWheelOuterRadius) {
      console.log(`⏭️ Skipping angle wheel handling in main listener - handled by dedicated listener`);
      return; // تجاهل تماماً
    }
    
    // **أولوية عالية: التعامل مع الأشكال المحددة حسب النوع**
    
    // 🔺 التعامل مع المثلث عندما يكون محدد
    if (selectedShape === "triangle") {
      console.log("🔺🎯 TRIANGLE: Processing triangle mouse down");
      
      const r = degreeRingRadius; // استخدام القيمة العالمية
      const trianglePoints = customAngles.map((deg) => {
        const rad = ((deg + triangleRotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      console.log(`🔺 Triangle check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`📏 Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // كشف فوري على رؤوس المثلث بأولوية عالية جداً - يتفوق على أي شيء آخر
      for (let idx = 0; idx < trianglePoints.length; idx++) {
        const point = trianglePoints[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = customAngles[idx];
        
        console.log(`🔺 TRIANGLE Vertex ${idx} (angle: ${vertexAngle}°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // منطقة واسعة جداً لجميع رؤوس المثلث - أولوية مطلقة
        const detectionRadius = 50; // منطقة أوسع لضمان عدم التداخل مع عجلة الزوايا
        
        if (d < detectionRadius) {
          console.log(`🚀 TRIANGLE: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}° (distance: ${d.toFixed(1)})`);
          setIsDraggingTriangle(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(triangleRotation);
          return; // خروج فوري مطلق
        }
      }
      
      // كشف إضافي على أضلاع المثلث والخطوط الشعاعية - أولوية عالية
      for (let i = 0; i < trianglePoints.length; i++) {
        const currentPoint = trianglePoints[i];
        const nextPoint = trianglePoints[(i + 1) % trianglePoints.length];
        
        const distanceToEdge = getDistanceToLine(
          x, y,
          currentPoint.x, currentPoint.y,
          nextPoint.x, nextPoint.y
        );
        
        if (distanceToEdge < 30) { // منطقة أوسع للأضلاع
          console.log(`🚀 TRIANGLE: Edge detection ${i}-${(i + 1) % trianglePoints.length} (distance: ${distanceToEdge.toFixed(1)})`);
          setIsDraggingTriangle(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(triangleRotation);
          return;
        }
      }

      // كشف الخطوط الشعاعية للمثلث - إزالة لتجنب التداخل مع عجلة الزوايا
      // عجلة الزوايا ستتولى كشف وتدوير خطوط الشعاع
    }
    
    // 🟦 التعامل مع المربع عندما يكون محدد  
    if (selectedShape === "square") {
      console.log("🟦🎯 SQUARE: Processing square mouse down");
      const r = degreeRingRadius;
      const squarePoints = customSquareAngles.map((deg) => {
        const rad = ((deg + squareRotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      console.log(`🟦 Square check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`📏 Distance from center: ${distanceFromCenter.toFixed(1)}`);
      console.log(`🟦 Square angles: [${customSquareAngles.join(', ')}]`);
      console.log(`🟦 Square rotation: ${squareRotation}`);

      // كشف فوري على رؤوس المربع بأولوية عالية
      for (let idx = 0; idx < squarePoints.length; idx++) {
        const point = squarePoints[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = customSquareAngles[idx];
        
        console.log(`🟦 SQUARE Vertex ${idx} (angle: ${vertexAngle}°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // منطقة واسعة لجميع رؤوس المربع
        const detectionRadius = 25;
        
        if (d < detectionRadius) {
          console.log(`🚀 SQUARE: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}° (distance: ${d.toFixed(1)})`);
          setIsDraggingSquare(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(squareRotation);
          return; // خروج فوري مطلق
        }
      }
      
      // كشف إضافي على أضلاع المربع والخطوط الشعاعية
      for (let i = 0; i < squarePoints.length; i++) {
        const currentPoint = squarePoints[i];
        const nextPoint = squarePoints[(i + 1) % squarePoints.length];
        
        const distanceToEdge = getDistanceToLine(
          x, y,
          currentPoint.x, currentPoint.y,
          nextPoint.x, nextPoint.y
        );
        
        if (distanceToEdge < 30) {
          console.log(`🚀 SQUARE: Edge detection ${i}-${(i + 1) % squarePoints.length} (distance: ${distanceToEdge.toFixed(1)})`);
          setIsDraggingSquare(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(squareRotation);
          return;
        }
      }

      // كشف الخطوط الشعاعية للمربع
      for (let idx = 0; idx < squarePoints.length; idx++) {
        const point = squarePoints[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`🚀 SQUARE: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingSquare(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(squareRotation);
          return;
        }
      }
      
      // فحص عام لمنطقة أوسع حول المربع
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`🎯 SQUARE FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingSquare(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(squareRotation);
        return;
      }
    }
    
    // ⭐ التعامل مع النجمة الرباعية عندما تكون محددة
    if (selectedShape === "star4") {
      console.log("⭐🎯 STAR4: Processing star4 mouse down");
      const r = degreeRingRadius;
      // النقاط الأربعة الرئيسية للنجمة الرباعية
      const star4Points = [0, 90, 180, 270].map((deg) => {
        const rad = ((deg + star4Rotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      console.log(`⭐ Star4 check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`📏 Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // كشف فوري على رؤوس النجمة الرباعية بأولوية عالية
      for (let idx = 0; idx < star4Points.length; idx++) {
        const point = star4Points[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = [0, 90, 180, 270][idx];
        
        console.log(`⭐ STAR4 Vertex ${idx} (angle: ${vertexAngle}°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // منطقة واسعة لجميع رؤوس النجمة الرباعية
        const detectionRadius = 25;
        
        if (d < detectionRadius) {
          console.log(`🚀 STAR4: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}° (distance: ${d.toFixed(1)})`);
          setIsDraggingStar4(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star4Rotation);
          return; // خروج فوري مطلق
        }
      }
      
      // كشف إضافي على الخطوط الشعاعية للنجمة الرباعية
      for (let idx = 0; idx < star4Points.length; idx++) {
        const point = star4Points[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`🚀 STAR4: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingStar4(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star4Rotation);
          return;
        }
      }
      
      // فحص عام لمنطقة أوسع حول النجمة الرباعية
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`🎯 STAR4 FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingStar4(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(star4Rotation);
        return;
      }
    }
    
    // 🔷 التعامل مع الخماسي عندما يكون محدد
    if (selectedShape === "pentagon") {
      console.log("🔷🎯 PENTAGON: Processing pentagon mouse down");
      const r = degreeRingRadius;
      const pentagonPoints = customPentagonAngles.map((deg) => {
        const rad = ((deg + pentagonRotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      console.log(`🔷 Pentagon check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`📏 Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // كشف فوري على رؤوس الخماسي بأولوية عالية
      for (let idx = 0; idx < pentagonPoints.length; idx++) {
        const point = pentagonPoints[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = customPentagonAngles[idx];
        
        console.log(`🔷 PENTAGON Vertex ${idx} (angle: ${vertexAngle}°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // منطقة واسعة لجميع رؤوس الخماسي
        const detectionRadius = 25;
        
        if (d < detectionRadius) {
          console.log(`🚀 PENTAGON: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}° (distance: ${d.toFixed(1)})`);
          setIsDraggingPentagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(pentagonRotation);
          return; // خروج فوري مطلق
        }
      }
      
      // كشف إضافي على أضلاع الخماسي والخطوط الشعاعية
      for (let i = 0; i < pentagonPoints.length; i++) {
        const currentPoint = pentagonPoints[i];
        const nextPoint = pentagonPoints[(i + 1) % pentagonPoints.length];
        
        const distanceToEdge = getDistanceToLine(
          x, y,
          currentPoint.x, currentPoint.y,
          nextPoint.x, nextPoint.y
        );
        
        if (distanceToEdge < 30) {
          console.log(`🚀 PENTAGON: Edge detection ${i}-${(i + 1) % pentagonPoints.length} (distance: ${distanceToEdge.toFixed(1)})`);
          setIsDraggingPentagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(pentagonRotation);
          return;
        }
      }

      // كشف الخطوط الشعاعية للخماسي
      for (let idx = 0; idx < pentagonPoints.length; idx++) {
        const point = pentagonPoints[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`🚀 PENTAGON: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingPentagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(pentagonRotation);
          return;
        }
      }
      
      // فحص عام لمنطقة أوسع حول الخماسي
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`🎯 PENTAGON FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingPentagon(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(pentagonRotation);
        return;
      }
    }
    
    // ⭐ التعامل مع النجمة الثلاثية عندما تكون محددة  
    if (selectedShape === "star3") {
      console.log("⭐🎯 STAR3: Processing star3 mouse down");
      const r = degreeRingRadius; // **تصحيح: استخدام نفس المسافة للمثلث**
      console.log(`Using radius: ${r}, center: ${center}`);
      
      // حساب النقاط بناءً على نمط الرسم الجديد
      const star3Points = [];
      
      if (star3DrawMode === "lines") {
        console.log("Star3 mode: lines");
        // للنجمة الحقيقية - النقاط الخارجية والداخلية
        // النقاط الخارجية (رؤوس النجمة)
        for (let i = 0; i < 3; i++) {
          const angle = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
          const point = {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
          };
          star3Points.push(point);
          console.log(`Outer point ${i}: (${point.x.toFixed(1)}, ${point.y.toFixed(1)}) at angle ${customStar3Angles[i]}°`);
        }
        
        // النقاط الداخلية
        for (let i = 0; i < 3; i++) {
          const angle1 = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
          const angle2 = ((customStar3Angles[(i + 1) % 3]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
          
          let midAngle = (angle1 + angle2) / 2;
          if (Math.abs(angle2 - angle1) > Math.PI) {
            midAngle += Math.PI;
          }
          
          const point = {
            x: center + (r * 0.3) * Math.cos(midAngle),
            y: center + (r * 0.3) * Math.sin(midAngle),
          };
          star3Points.push(point);
          console.log(`Inner point ${i}: (${point.x.toFixed(1)}, ${point.y.toFixed(1)})`);
        }
      } else {
        console.log("Star3 mode: triangle");
        // للمثلث - 3 نقاط فقط
        customStar3Angles.forEach((deg, i) => {
          const rad = ((deg + star3Rotation + settings.rotation - 90) * Math.PI) / 180;
          const point = {
            x: center + r * Math.cos(rad),
            y: center + r * Math.sin(rad),
          };
          star3Points.push(point);
          console.log(`Triangle point ${i}: (${point.x.toFixed(1)}, ${point.y.toFixed(1)}) at angle ${deg}°`);
        });
      }

      let foundPoint = false;
      star3Points.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        console.log(`Star3 point ${idx}: distance = ${d.toFixed(1)}, point = (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), mouse = (${x.toFixed(1)}, ${y.toFixed(1)})`);
        if (d < 25) { // زيادة المنطقة الحساسة أكثر
          console.log(`*** Star3 drag started on point ${idx} with distance ${d.toFixed(1)} ***`);
          setIsDraggingStar3(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star3Rotation);
          foundPoint = true;
        }
      });
      
      if (foundPoint) {
        return; // خروج فوري فقط إذا تم العثور على نقطة النجمة الثلاثية
      }
      
      // كشف الخطوط الشعاعية للنجمة الثلاثية - لا نحتاجها لأن عجلة الزوايا تتولى ذلك
      // إزالة هذا الكشف لتجنب التداخل مع عجلة الزوايا
      
      if (!foundPoint) {
        console.log("❌ No star3 point found within range");
        console.log(`📊 Star3 Debug Info:`);
        console.log(`   selectedShape: ${selectedShape}`);
        console.log(`   star3DrawMode: ${star3DrawMode}`);
        console.log(`   star3Rotation: ${star3Rotation}`);
        console.log(`   customStar3Angles: [${customStar3Angles.join(', ')}]`);
        console.log(`   Total points calculated: ${star3Points.length}`);
        
        // إضافة فحص عام لمنطقة أوسع حول النجمة الثلاثية
        const distanceFromCenter = getDistance(x, y, center, center);
        const minDistance = r * 0.2; // 20% من نصف القطر
        const maxDistance = r + 50;   // نصف القطر + 50px
        
        // فحص إذا كانت النقرة داخل حلقة عجلة الزوايا تماماً - إذا كانت فلا نفعل النجمة
        const fallbackAngleWheelInnerRadius = degreeRingRadius * 1.05;
        const fallbackAngleWheelOuterRadius = degreeRingRadius * 1.19;
        const inAngleWheelRing = showAngleWheel && 
          distanceFromCenter >= fallbackAngleWheelInnerRadius && 
          distanceFromCenter <= fallbackAngleWheelOuterRadius;
        
        if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance && !inAngleWheelRing) {
          console.log(`🎯 Star3 FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
          setIsDraggingStar3(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star3Rotation);
          foundPoint = true;
          return; // خروج فقط إذا تم تفعيل النجمة الثلاثية في المنطقة العامة
        }
      }
    }
    
    // ⭐ التعامل مع النجمة الخماسية عندما تكون محددة
    if (selectedShape === "star5") {
      console.log("⭐🎯 STAR5: Processing star5 mouse down");
      const r = degreeRingRadius;
      const star5Points = customPentagonAngles.map((deg) => {
        const rad = ((deg + star5Rotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      console.log(`⭐ Star5 check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`📏 Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // كشف فوري على رؤوس النجمة الخماسية بأولوية عالية
      for (let idx = 0; idx < star5Points.length; idx++) {
        const point = star5Points[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = customPentagonAngles[idx];
        
        console.log(`⭐ STAR5 Vertex ${idx} (angle: ${vertexAngle}°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // منطقة واسعة لجميع رؤوس النجمة الخماسية
        const detectionRadius = 25;
        
        if (d < detectionRadius) {
          console.log(`🚀 STAR5: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}° (distance: ${d.toFixed(1)})`);
          setIsDraggingStar5(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star5Rotation);
          return; // خروج فوري مطلق
        }
      }
      
      // كشف إضافي على الخطوط الشعاعية للنجمة الخماسية
      for (let idx = 0; idx < star5Points.length; idx++) {
        const point = star5Points[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`🚀 STAR5: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingStar5(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star5Rotation);
          return;
        }
      }
      
      // فحص عام لمنطقة أوسع حول النجمة الخماسية
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`🎯 STAR5 FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingStar5(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(star5Rotation);
        return;
      }
    }
    
    // 🔸 التعامل مع السداسي عندما يكون محدد
    if (selectedShape === "hexagon") {
      console.log("🔸🎯 HEXAGON: Processing hexagon mouse down");
      const r = degreeRingRadius;
      const hexagonPoints = customHexagonAngles.map((deg) => {
        const rad = ((deg + hexagonRotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      console.log(`🔸 Hexagon check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`📏 Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // كشف فوري على رؤوس السداسي بأولوية عالية
      for (let idx = 0; idx < hexagonPoints.length; idx++) {
        const point = hexagonPoints[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = customHexagonAngles[idx];
        
        console.log(`🔸 HEXAGON Vertex ${idx} (angle: ${vertexAngle}°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // منطقة واسعة لجميع رؤوس السداسي
        const detectionRadius = 25;
        
        if (d < detectionRadius) {
          console.log(`🚀 HEXAGON: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}° (distance: ${d.toFixed(1)})`);
          setIsDraggingHexagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(hexagonRotation);
          return; // خروج فوري مطلق
        }
      }
      
      // كشف إضافي على أضلاع السداسي والخطوط الشعاعية
      for (let i = 0; i < hexagonPoints.length; i++) {
        const currentPoint = hexagonPoints[i];
        const nextPoint = hexagonPoints[(i + 1) % hexagonPoints.length];
        
        const distanceToEdge = getDistanceToLine(
          x, y,
          currentPoint.x, currentPoint.y,
          nextPoint.x, nextPoint.y
        );
        
        if (distanceToEdge < 30) {
          console.log(`🚀 HEXAGON: Edge detection ${i}-${(i + 1) % hexagonPoints.length} (distance: ${distanceToEdge.toFixed(1)})`);
          setIsDraggingHexagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(hexagonRotation);
          return;
        }
      }

      // كشف الخطوط الشعاعية للسداسي
      for (let idx = 0; idx < hexagonPoints.length; idx++) {
        const point = hexagonPoints[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`🚀 HEXAGON: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingHexagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(hexagonRotation);
          return;
        }
      }
      
      // فحص عام لمنطقة أوسع حول السداسي
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`🎯 HEXAGON FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingHexagon(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(hexagonRotation);
        return;
      }
    }
    
    // ⭐ التعامل مع النجمة السداسية عندما تكون محددة
    if (selectedShape === "star6") {
      console.log("⭐🎯 STAR6: Processing star6 mouse down");
      const r = degreeRingRadius;
      // النقاط الستة للنجمة السداسية بالترتيب: 0°، 60°، 120°، 180°، 240°، 300°
      const star6Points = [0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = ((deg + star6Rotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      console.log(`⭐ Star6 check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`📏 Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // كشف فوري على رؤوس النجمة السداسية بأولوية عالية
      for (let idx = 0; idx < star6Points.length; idx++) {
        const point = star6Points[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = [0, 60, 120, 180, 240, 300][idx];
        
        console.log(`⭐ STAR6 Vertex ${idx} (angle: ${vertexAngle}°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // منطقة واسعة لجميع رؤوس النجمة السداسية
        const detectionRadius = 25;
        
        if (d < detectionRadius) {
          console.log(`🚀 STAR6: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}° (distance: ${d.toFixed(1)})`);
          setIsDraggingStar6(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star6Rotation);
          return; // خروج فوري مطلق
        }
      }
      
      // كشف إضافي على الخطوط الشعاعية للنجمة السداسية
      for (let idx = 0; idx < star6Points.length; idx++) {
        const point = star6Points[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`🚀 STAR6: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingStar6(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star6Rotation);
          return;
        }
      }
      
      // فحص عام لمنطقة أوسع حول النجمة السداسية
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`🎯 STAR6 FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingStar6(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(star6Rotation);
        return;
      }
    }

    // ⭐ التعامل مع النجمة السباعية عندما تكون محددة
    if (selectedShape === "star7") {
      console.log("⭐🎯 STAR7: Processing star7 mouse down");
      const r = degreeRingRadius;
      // النقاط السبعة للنجمة السباعية - نفس الحساب كما في drawStar7
      const star7Points = [];
      for (let i = 0; i < 7; i++) {
        const angle = ((i * 360 / 7) + star7Rotation + settings.rotation - 90) * Math.PI / 180;
        star7Points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      console.log(`⭐ Star7 check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`📏 Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // كشف فوري على رؤوس النجمة السباعية بأولوية عالية
      for (let idx = 0; idx < star7Points.length; idx++) {
        const point = star7Points[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = (idx * 360 / 7);
        
        console.log(`⭐ STAR7 Vertex ${idx} (angle: ${vertexAngle.toFixed(1)}°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // منطقة واسعة لجميع رؤوس النجمة السباعية
        const detectionRadius = 30; // زيادة منطقة الكشف أكثر للنجمة السباعية
        
        if (d < detectionRadius) {
          console.log(`🚀 STAR7: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle.toFixed(1)}° (distance: ${d.toFixed(1)})`);
          setIsDraggingStar7(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star7Rotation);
          return; // خروج فوري مطلق
        }
      }
      
      // كشف إضافي على الخطوط الشعاعية للنجمة السباعية
      for (let idx = 0; idx < star7Points.length; idx++) {
        const point = star7Points[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`🚀 STAR7: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingStar7(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star7Rotation);
          return;
        }
      }
      
      // فحص عام لمنطقة أوسع حول النجمة السباعية
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`🎯 STAR7 FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingStar7(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(star7Rotation);
        return;
      }
    }
    
    // ⭐ التعامل مع النجمة الثمانية عندما تكون محددة
    if (selectedShape === "star8") {
      console.log("⭐🎯 STAR8: Processing star8 mouse down");
      const r = degreeRingRadius;
      const star8Points = [];
      for (let i = 0; i < 8; i++) {
        const angle = ((i * 45) + star8Rotation + settings.rotation - 90) * Math.PI / 180;
        star8Points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      console.log(`⭐ Star8 check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`📏 Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // كشف فوري على رؤوس النجمة الثمانية بأولوية عالية
      for (let idx = 0; idx < star8Points.length; idx++) {
        const point = star8Points[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = (idx * 45);
        
        console.log(`⭐ STAR8 Vertex ${idx} (angle: ${vertexAngle}°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // منطقة واسعة لجميع رؤوس النجمة الثمانية
        const detectionRadius = 30; // زيادة منطقة الكشف من 20 إلى 30
        
        if (d < detectionRadius) {
          console.log(`🚀 STAR8: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}° (distance: ${d.toFixed(1)})`);
          setIsDraggingStar8(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star8Rotation);
          return; // خروج فوري مطلق
        }
      }
      
      // كشف إضافي على الخطوط الشعاعية للنجمة الثمانية
      for (let idx = 0; idx < star8Points.length; idx++) {
        const point = star8Points[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`🚀 STAR8: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingStar8(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star8Rotation);
          return;
        }
      }
      
      // فحص عام لمنطقة أوسع حول النجمة الثمانية
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`🎯 STAR8 FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingStar8(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(star8Rotation);
        return;
      }
    }
    
    // ⭐ التعامل مع النجمة التساعية عندما تكون محددة
    if (selectedShape === "star9") {
      console.log("⭐🎯 STAR9: Processing star9 mouse down");
      const r = degreeRingRadius;
      const star9Points = [];
      for (let i = 0; i < 9; i++) {
        const angle = ((i * 360 / 9) + star9Rotation + settings.rotation - 90) * Math.PI / 180;
        star9Points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      console.log(`⭐ Star9 check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`📏 Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // كشف فوري على رؤوس النجمة التساعية بأولوية عالية
      for (let idx = 0; idx < star9Points.length; idx++) {
        const point = star9Points[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = (idx * 360 / 9);
        
        console.log(`⭐ STAR9 Vertex ${idx} (angle: ${vertexAngle.toFixed(1)}°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // منطقة واسعة لجميع رؤوس النجمة التساعية
        const detectionRadius = 30; // زيادة منطقة الكشف من 20 إلى 30
        
        if (d < detectionRadius) {
          console.log(`🚀 STAR9: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle.toFixed(1)}° (distance: ${d.toFixed(1)})`);
          setIsDraggingStar9(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star9Rotation);
          return; // خروج فوري مطلق
        }
      }
      
      // كشف إضافي على الخطوط الشعاعية للنجمة التساعية
      for (let idx = 0; idx < star9Points.length; idx++) {
        const point = star9Points[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`🚀 STAR9: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingStar9(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star9Rotation);
          return;
        }
      }
      
      // فحص عام لمنطقة أوسع حول النجمة التساعية
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`🎯 STAR9 FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingStar9(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(star9Rotation);
        return;
      }
    }
    
    // ⭐ التعامل مع النجمة العاشرية عندما تكون محددة
    if (selectedShape === "star10") {
      console.log("⭐🎯 STAR10: Processing star10 mouse down");
      const r = degreeRingRadius;
      const star10Points = [];
      for (let i = 0; i < 10; i++) {
        const angle = ((i * 360 / 10) + star10Rotation + settings.rotation - 90) * Math.PI / 180;
        star10Points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      console.log(`⭐ Star10 check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`📏 Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // كشف فوري على رؤوس النجمة العاشرية بأولوية عالية
      for (let idx = 0; idx < star10Points.length; idx++) {
        const point = star10Points[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = (idx * 360 / 10);
        
        console.log(`⭐ STAR10 Vertex ${idx} (angle: ${vertexAngle}°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // منطقة واسعة لجميع رؤوس النجمة العاشرية
        const detectionRadius = 30; // زيادة منطقة الكشف من 20 إلى 30
        
        if (d < detectionRadius) {
          console.log(`🚀 STAR10: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}° (distance: ${d.toFixed(1)})`);
          setIsDraggingStar10(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star10Rotation);
          return; // خروج فوري مطلق
        }
      }
      
      // كشف إضافي على الخطوط الشعاعية للنجمة العاشرية
      for (let idx = 0; idx < star10Points.length; idx++) {
        const point = star10Points[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`🚀 STAR10: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingStar10(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star10Rotation);
          return;
        }
      }
      
      // فحص عام لمنطقة أوسع حول النجمة العاشرية
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`🎯 STAR10 FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingStar10(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(star10Rotation);
        return;
      }
    }
    
    // ⭐ التعامل مع النجمة الحادية عشرة عندما تكون محددة
    if (selectedShape === "star11") {
      console.log("⭐🎯 STAR11: Processing star11 mouse down");
      const r = degreeRingRadius;
      const star11Points = [];
      for (let i = 0; i < 11; i++) {
        const angle = ((i * 360 / 11) + star11Rotation + settings.rotation - 90) * Math.PI / 180;
        star11Points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      console.log(`⭐ Star11 check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`📏 Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // كشف فوري على رؤوس النجمة الحادية عشرة بأولوية عالية
      for (let idx = 0; idx < star11Points.length; idx++) {
        const point = star11Points[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = (idx * 360 / 11);
        
        console.log(`⭐ STAR11 Vertex ${idx} (angle: ${vertexAngle.toFixed(1)}°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // منطقة واسعة لجميع رؤوس النجمة الحادية عشرة
        const detectionRadius = 30; // زيادة منطقة الكشف من 20 إلى 30
        
        if (d < detectionRadius) {
          console.log(`🚀 STAR11: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle.toFixed(1)}° (distance: ${d.toFixed(1)})`);
          setIsDraggingStar11(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star11Rotation);
          return; // خروج فوري مطلق
        }
      }
      
      // كشف إضافي على الخطوط الشعاعية للنجمة الحادية عشرة
      for (let idx = 0; idx < star11Points.length; idx++) {
        const point = star11Points[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`🚀 STAR11: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingStar11(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star11Rotation);
          return;
        }
      }
      
      // فحص عام لمنطقة أوسع حول النجمة الحادية عشرة
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`🎯 STAR11 FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingStar11(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(star11Rotation);
        return;
      }
    }
    
    // ⭐ التعامل مع النجمة الثانية عشرة عندما تكون محددة
    if (selectedShape === "star12") {
      console.log("⭐🎯 STAR12: Processing star12 mouse down");
      const r = degreeRingRadius;
      const star12Points = [];
      for (let i = 0; i < 12; i++) {
        const angle = ((i * 360 / 12) + star12Rotation + settings.rotation - 90) * Math.PI / 180;
        star12Points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      console.log(`⭐ Star12 check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`📏 Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // كشف فوري على رؤوس النجمة الثانية عشرة بأولوية عالية
      for (let idx = 0; idx < star12Points.length; idx++) {
        const point = star12Points[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = (idx * 360 / 12);
        
        console.log(`⭐ STAR12 Vertex ${idx} (angle: ${vertexAngle}°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // منطقة واسعة لجميع رؤوس النجمة الثانية عشرة
        const detectionRadius = 30; // زيادة منطقة الكشف من 20 إلى 30
        
        if (d < detectionRadius) {
          console.log(`🚀 STAR12: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}° (distance: ${d.toFixed(1)})`);
          setIsDraggingStar12(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star12Rotation);
          return; // خروج فوري مطلق
        }
      }
      
      // كشف إضافي على الخطوط الشعاعية للنجمة الثانية عشرة
      for (let idx = 0; idx < star12Points.length; idx++) {
        const point = star12Points[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`🚀 STAR12: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingStar12(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star12Rotation);
          return;
        }
      }
      
      // فحص عام لمنطقة أوسع حول النجمة الثانية عشرة
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`🎯 STAR12 FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingStar12(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(star12Rotation);
        return;
      }
    }
    
    // 🔷 التعامل مع الشكل السباعي عندما يكون محدد
    if (selectedShape === "heptagon") {
      console.log("🔷🎯 HEPTAGON: Processing heptagon mouse down");
      const r = degreeRingRadius;
      const heptagonPoints = [];
      for (let i = 0; i < 7; i++) {
        const angle = ((i * 360 / 7) + heptagonRotation + settings.rotation - 90) * Math.PI / 180;
        heptagonPoints.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      console.log(`🔷 Heptagon check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`📏 Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // كشف فوري على رؤوس السباعي بأولوية عالية
      for (let idx = 0; idx < heptagonPoints.length; idx++) {
        const point = heptagonPoints[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = (idx * 360 / 7);
        
        console.log(`🔷 HEPTAGON Vertex ${idx} (angle: ${vertexAngle.toFixed(1)}°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // منطقة واسعة لجميع رؤوس السباعي
        const detectionRadius = 30; // زيادة منطقة الكشف من 15 إلى 30
        
        if (d < detectionRadius) {
          console.log(`🚀 HEPTAGON: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle.toFixed(1)}° (distance: ${d.toFixed(1)})`);
          setIsDraggingHeptagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(heptagonRotation);
          return; // خروج فوري مطلق
        }
      }
      
      // كشف إضافي على أضلاع السباعي والخطوط الشعاعية
      for (let i = 0; i < heptagonPoints.length; i++) {
        const currentPoint = heptagonPoints[i];
        const nextPoint = heptagonPoints[(i + 1) % heptagonPoints.length];
        
        const distanceToEdge = getDistanceToLine(
          x, y,
          currentPoint.x, currentPoint.y,
          nextPoint.x, nextPoint.y
        );
        
        if (distanceToEdge < 30) {
          console.log(`🚀 HEPTAGON: Edge detection ${i}-${(i + 1) % heptagonPoints.length} (distance: ${distanceToEdge.toFixed(1)})`);
          setIsDraggingHeptagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(heptagonRotation);
          return;
        }
      }

      // كشف الخطوط الشعاعية للسباعي
      for (let idx = 0; idx < heptagonPoints.length; idx++) {
        const point = heptagonPoints[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`🚀 HEPTAGON: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingHeptagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(heptagonRotation);
          return;
        }
      }
      
      // فحص عام لمنطقة أوسع حول السباعي
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`🎯 HEPTAGON FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingHeptagon(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(heptagonRotation);
        return;
      }
    }
    
    // 🔸 التعامل مع الشكل الثماني عندما يكون محدد
    if (selectedShape === "octagon") {
      console.log("🔸🎯 OCTAGON: Processing octagon mouse down");
      const r = degreeRingRadius;
      const octagonPoints = customOctagonAngles.map((deg) => {
        const rad = ((deg + octagonRotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      console.log(`🔸 Octagon check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`📏 Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // كشف فوري على رؤوس الثماني بأولوية عالية
      for (let idx = 0; idx < octagonPoints.length; idx++) {
        const point = octagonPoints[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = customOctagonAngles[idx];
        
        console.log(`🔸 OCTAGON Vertex ${idx} (angle: ${vertexAngle}°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // منطقة واسعة لجميع رؤوس الثماني
        const detectionRadius = 30; // زيادة منطقة الكشف من 15 إلى 30
        
        if (d < detectionRadius) {
          console.log(`🚀 OCTAGON: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}° (distance: ${d.toFixed(1)})`);
          setIsDraggingOctagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(octagonRotation);
          return; // خروج فوري مطلق
        }
      }
      
      // كشف إضافي على أضلاع الثماني والخطوط الشعاعية
      for (let i = 0; i < octagonPoints.length; i++) {
        const currentPoint = octagonPoints[i];
        const nextPoint = octagonPoints[(i + 1) % octagonPoints.length];
        
        const distanceToEdge = getDistanceToLine(
          x, y,
          currentPoint.x, currentPoint.y,
          nextPoint.x, nextPoint.y
        );
        
        if (distanceToEdge < 30) {
          console.log(`🚀 OCTAGON: Edge detection ${i}-${(i + 1) % octagonPoints.length} (distance: ${distanceToEdge.toFixed(1)})`);
          setIsDraggingOctagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(octagonRotation);
          return;
        }
      }

      // كشف الخطوط الشعاعية للثماني
      for (let idx = 0; idx < octagonPoints.length; idx++) {
        const point = octagonPoints[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`🚀 OCTAGON: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingOctagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(octagonRotation);
          return;
        }
      }
      
      // فحص عام لمنطقة أوسع حول الثماني
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`🎯 OCTAGON FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingOctagon(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(octagonRotation);
        return;
      }
    }
    
    // 🔹 التعامل مع الشكل التساعي عندما يكون محدد
    if (selectedShape === "nonagon") {
      console.log("🔹🎯 NONAGON: Processing nonagon mouse down");
      const r = degreeRingRadius;
      const nonagonPoints = [];
      for (let i = 0; i < 9; i++) {
        const angle = ((i * 360 / 9) + nonagonRotation + settings.rotation - 90) * Math.PI / 180;
        nonagonPoints.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      console.log(`🔹 Nonagon check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`📏 Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // كشف فوري على رؤوس التساعي بأولوية عالية
      for (let idx = 0; idx < nonagonPoints.length; idx++) {
        const point = nonagonPoints[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = (idx * 360 / 9);
        
        console.log(`🔹 NONAGON Vertex ${idx} (angle: ${vertexAngle.toFixed(1)}°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // منطقة واسعة لجميع رؤوس التساعي
        const detectionRadius = 30; // زيادة منطقة الكشف من 15 إلى 30
        
        if (d < detectionRadius) {
          console.log(`🚀 NONAGON: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle.toFixed(1)}° (distance: ${d.toFixed(1)})`);
          setIsDraggingNonagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(nonagonRotation);
          return; // خروج فوري مطلق
        }
      }
      
      // كشف إضافي على أضلاع التساعي والخطوط الشعاعية
      for (let i = 0; i < nonagonPoints.length; i++) {
        const currentPoint = nonagonPoints[i];
        const nextPoint = nonagonPoints[(i + 1) % nonagonPoints.length];
        
        const distanceToEdge = getDistanceToLine(
          x, y,
          currentPoint.x, currentPoint.y,
          nextPoint.x, nextPoint.y
        );
        
        if (distanceToEdge < 30) {
          console.log(`🚀 NONAGON: Edge detection ${i}-${(i + 1) % nonagonPoints.length} (distance: ${distanceToEdge.toFixed(1)})`);
          setIsDraggingNonagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(nonagonRotation);
          return;
        }
      }

      // كشف الخطوط الشعاعية للتساعي
      for (let idx = 0; idx < nonagonPoints.length; idx++) {
        const point = nonagonPoints[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`🚀 NONAGON: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingNonagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(nonagonRotation);
          return;
        }
      }
      
      // فحص عام لمنطقة أوسع حول التساعي
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`🎯 NONAGON FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingNonagon(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(nonagonRotation);
        return;
      }
    }
    
    // 🔷 التعامل مع الشكل العاشر عندما يكون محدد
    if (selectedShape === "decagon") {
      console.log("🔷🎯 DECAGON: Processing decagon mouse down");
      const r = degreeRingRadius;
      const decagonPoints = [];
      for (let i = 0; i < 10; i++) {
        const angle = ((i * 360 / 10) + decagonRotation + settings.rotation - 90) * Math.PI / 180;
        decagonPoints.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      console.log(`🔷 Decagon check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`📏 Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // كشف فوري على رؤوس العاشر بأولوية عالية
      for (let idx = 0; idx < decagonPoints.length; idx++) {
        const point = decagonPoints[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = (idx * 360 / 10);
        
        console.log(`🔷 DECAGON Vertex ${idx} (angle: ${vertexAngle}°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // منطقة واسعة لجميع رؤوس العاشر
        const detectionRadius = 30; // زيادة منطقة الكشف من 15 إلى 30
        
        if (d < detectionRadius) {
          console.log(`🚀 DECAGON: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}° (distance: ${d.toFixed(1)})`);
          setIsDraggingDecagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(decagonRotation);
          return; // خروج فوري مطلق
        }
      }
      
      // كشف إضافي على أضلاع العاشر والخطوط الشعاعية
      for (let i = 0; i < decagonPoints.length; i++) {
        const currentPoint = decagonPoints[i];
        const nextPoint = decagonPoints[(i + 1) % decagonPoints.length];
        
        const distanceToEdge = getDistanceToLine(
          x, y,
          currentPoint.x, currentPoint.y,
          nextPoint.x, nextPoint.y
        );
        
        if (distanceToEdge < 30) {
          console.log(`🚀 DECAGON: Edge detection ${i}-${(i + 1) % decagonPoints.length} (distance: ${distanceToEdge.toFixed(1)})`);
          setIsDraggingDecagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(decagonRotation);
          return;
        }
      }

      // كشف الخطوط الشعاعية للعاشر
      for (let idx = 0; idx < decagonPoints.length; idx++) {
        const point = decagonPoints[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`🚀 DECAGON: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingDecagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(decagonRotation);
          return;
        }
      }
      
      // فحص عام لمنطقة أوسع حول العاشر
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`🎯 DECAGON FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingDecagon(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(decagonRotation);
        return;
      }
    }
    
    // 🔸 التعامل مع الشكل الحادي عشر عندما يكون محدد
    if (selectedShape === "eleven") {
      console.log("🔸🎯 ELEVEN: Processing eleven mouse down");
      const r = degreeRingRadius;
      const hendecagonPoints = [];
      for (let i = 0; i < 11; i++) {
        const angle = ((i * 360 / 11) + hendecagonRotation + settings.rotation - 90) * Math.PI / 180;
        hendecagonPoints.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      console.log(`🔸 Eleven check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`📏 Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // كشف فوري على رؤوس الحادي عشر بأولوية عالية
      for (let idx = 0; idx < hendecagonPoints.length; idx++) {
        const point = hendecagonPoints[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = (idx * 360 / 11);
        
        console.log(`🔸 ELEVEN Vertex ${idx} (angle: ${vertexAngle.toFixed(1)}°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // منطقة واسعة لجميع رؤوس الحادي عشر
        const detectionRadius = 30; // زيادة منطقة الكشف من 15 إلى 30
        
        if (d < detectionRadius) {
          console.log(`🚀 ELEVEN: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle.toFixed(1)}° (distance: ${d.toFixed(1)})`);
          setIsDraggingHendecagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(hendecagonRotation);
          return; // خروج فوري مطلق
        }
      }
      
      // كشف إضافي على أضلاع الحادي عشر والخطوط الشعاعية
      for (let i = 0; i < hendecagonPoints.length; i++) {
        const currentPoint = hendecagonPoints[i];
        const nextPoint = hendecagonPoints[(i + 1) % hendecagonPoints.length];
        
        const distanceToEdge = getDistanceToLine(
          x, y,
          currentPoint.x, currentPoint.y,
          nextPoint.x, nextPoint.y
        );
        
        if (distanceToEdge < 30) {
          console.log(`🚀 ELEVEN: Edge detection ${i}-${(i + 1) % hendecagonPoints.length} (distance: ${distanceToEdge.toFixed(1)})`);
          setIsDraggingHendecagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(hendecagonRotation);
          return;
        }
      }

      // كشف الخطوط الشعاعية للحادي عشر
      for (let idx = 0; idx < hendecagonPoints.length; idx++) {
        const point = hendecagonPoints[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`🚀 ELEVEN: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingHendecagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(hendecagonRotation);
          return;
        }
      }
      
      // فحص عام لمنطقة أوسع حول الحادي عشر
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`🎯 ELEVEN FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingHendecagon(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(hendecagonRotation);
        return;
      }
    }
    
    // 🔷 التعامل مع الشكل الثاني عشر عندما يكون محدد
    if (selectedShape === "twelve") {
      console.log("🔷🎯 TWELVE: Processing twelve mouse down");
      const r = degreeRingRadius;
      const dodecagonPoints = [];
      for (let i = 0; i < 12; i++) {
        const angle = ((i * 360 / 12) + dodecagonRotation + settings.rotation - 90) * Math.PI / 180;
        dodecagonPoints.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      console.log(`🔷 Twelve check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`📏 Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // كشف فوري على رؤوس الثاني عشر بأولوية عالية
      for (let idx = 0; idx < dodecagonPoints.length; idx++) {
        const point = dodecagonPoints[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = (idx * 360 / 12);
        
        console.log(`🔷 TWELVE Vertex ${idx} (angle: ${vertexAngle}°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // منطقة واسعة لجميع رؤوس الثاني عشر
        const detectionRadius = 30; // زيادة منطقة الكشف من 15 إلى 30
        
        if (d < detectionRadius) {
          console.log(`🚀 TWELVE: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}° (distance: ${d.toFixed(1)})`);
          setIsDraggingDodecagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(dodecagonRotation);
          return; // خروج فوري مطلق
        }
      }
      
      // كشف إضافي على أضلاع الثاني عشر والخطوط الشعاعية
      for (let i = 0; i < dodecagonPoints.length; i++) {
        const currentPoint = dodecagonPoints[i];
        const nextPoint = dodecagonPoints[(i + 1) % dodecagonPoints.length];
        
        const distanceToEdge = getDistanceToLine(
          x, y,
          currentPoint.x, currentPoint.y,
          nextPoint.x, nextPoint.y
        );
        
        if (distanceToEdge < 30) {
          console.log(`🚀 TWELVE: Edge detection ${i}-${(i + 1) % dodecagonPoints.length} (distance: ${distanceToEdge.toFixed(1)})`);
          setIsDraggingDodecagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(dodecagonRotation);
          return;
        }
      }

      // كشف الخطوط الشعاعية للثاني عشر
      for (let idx = 0; idx < dodecagonPoints.length; idx++) {
        const point = dodecagonPoints[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`🚀 TWELVE: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingDodecagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(dodecagonRotation);
          return;
        }
      }
      
      // فحص عام لمنطقة أوسع حول الثاني عشر
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`🎯 TWELVE FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingDodecagon(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(dodecagonRotation);
        return;
      }
    }
    
    // **منطق احتياطي نهائي - أولوية مطلقة للمثلث المحدد - لكن بتقييد للسماح لعجلة الزوايا**
    if (selectedShape === "triangle" && !isDraggingTriangle) {
      const triangleRadius = degreeRingRadius;
      console.log(`🔄 TRIANGLE FALLBACK: Final attempt for triangle. Distance: ${distanceFromCenter.toFixed(1)}`);
      
      // إعادة حساب منطقة عجلة الزوايا لتجنب التداخل
      const innerRadius = canvasSize / 2 - 50;
      const baseRingWidth = 20;
      const digitScale = 8;
      
      let calculatedLastRadius = innerRadius;
      for (let level = 0; level < settings.levels; level++) {
        const maxDigitsInLevel = Math.max(
          ...Array.from({ length: settings.divisions }, (_, i) => {
            const globalIndex = level * settings.divisions + i;
            return parseFloat((settings.startValue + globalIndex).toFixed(2)).toString().length;
          })
        );
        const dynamicWidth = baseRingWidth + maxDigitsInLevel * digitScale;
        calculatedLastRadius += dynamicWidth;
      }
      const lastNumberRingRadius = calculatedLastRadius;
      const fallbackDegreeRingRadius = lastNumberRingRadius + 10;
      const fallbackAngleWheelInnerRadius = fallbackDegreeRingRadius + 25;
      const fallbackAngleWheelOuterRadius = fallbackAngleWheelInnerRadius + 40;
      
      // فحص إذا كانت النقرة داخل حلقة عجلة الزوايا تماماً - إذا كانت فلا نفعل المثلث
      const inAngleWheelRing = showAngleWheel && 
        distanceFromCenter >= fallbackAngleWheelInnerRadius && 
        distanceFromCenter <= fallbackAngleWheelOuterRadius;
      
      if (!inAngleWheelRing) {
        // منطقة أصغر للمثلث - لا تتداخل مع عجلة الزوايا
        const minTriangleRange = Math.max(50, triangleRadius - 200);
        const maxTriangleRange = showAngleWheel ? fallbackAngleWheelInnerRadius - 30 : triangleRadius + 400;
        
        if (distanceFromCenter >= minTriangleRange && distanceFromCenter <= maxTriangleRange) {
          console.log(`🚀 TRIANGLE FALLBACK SUCCESS: Activating triangle rotation (avoiding angle wheel area)`);
          setIsDraggingTriangle(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(triangleRotation);
          return; // خروج فوري - لكن فقط خارج منطقة عجلة الزوايا
        }
      } else {
        console.log(`🔄 TRIANGLE FALLBACK: Click in angle wheel area - allowing angle wheel to handle`);
      }
    }
    
    // **منطق احتياطي لعجلة الزوايا - فحص بسيط على الحلقة في النهاية**
    if (showAngleWheel && !isDraggingAngleWheel) {
      console.log(`🔄 ANGLE WHEEL FALLBACK: Final attempt for angle wheel ring. Distance: ${distanceFromCenter.toFixed(1)}`);
      
      // إعادة حساب الحلقة
      const innerRadius = canvasSize / 2 - 50;
      const baseRingWidth = 20;
      const digitScale = 8;
      
      let calculatedLastRadius = innerRadius;
      for (let level = 0; level < settings.levels; level++) {
        const maxDigitsInLevel = Math.max(
          ...Array.from({ length: settings.divisions }, (_, i) => {
            const globalIndex = level * settings.divisions + i;
            return parseFloat((settings.startValue + globalIndex).toFixed(2)).toString().length;
          })
        );
        const dynamicWidth = baseRingWidth + maxDigitsInLevel * digitScale;
        calculatedLastRadius += dynamicWidth;
      }
      const lastNumberRingRadius = calculatedLastRadius;
      const degreeRingRadius = lastNumberRingRadius + 10;
      const angleWheelInnerRadius = degreeRingRadius + 25;
      const angleWheelOuterRadius = angleWheelInnerRadius + 40;
      
      // فحص مرن على حلقة عجلة الزوايا مع هامش كبير
      const margin = 20; // هامش أكبر للأمان في fallback
      if (distanceFromCenter >= angleWheelInnerRadius - margin && distanceFromCenter <= angleWheelOuterRadius + margin) {
        console.log(`✅ ANGLE WHEEL FALLBACK SUCCESS: Activating on angle wheel ring with margin`);
        setIsDraggingAngleWheel(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(angleWheelRotation);
        return;
      }
    }
  }

  function onMouseMove(e) {
    const { x, y } = getMousePos(e);
    
    // **كشف الخلية المحددة في عجلة الزوايا للمؤشر البصري**
    if (showAngleWheel && !isDraggingAngleWheel) {
      const distanceFromCenter = getDistance(x, y, center, center);
      
      if (distanceFromCenter >= angleWheelInnerRadius && distanceFromCenter <= angleWheelOuterRadius) {
        const stepDegrees = angleStepRad;
        const totalCells = 360 / stepDegrees;
        
        // حساب الزاوية النسبية باستخدام نفس المنطق المستخدم في الكشف
        const rawAngle = Math.atan2(y - center, x - center) * (180 / Math.PI);
        let normalizedAngle = rawAngle - angleWheelRotation;
        
        // تطبيع الزاوية لتكون في نطاق 0-360
        while (normalizedAngle < 0) normalizedAngle += 360;
        while (normalizedAngle >= 360) normalizedAngle -= 360;
        
        const cellIndex = Math.floor(normalizedAngle / stepDegrees);
        const cellStartAngle = cellIndex * stepDegrees;
        const cellEndAngle = cellStartAngle + stepDegrees;
        
        if (normalizedAngle >= cellStartAngle && normalizedAngle < cellEndAngle && cellIndex < totalCells) {
          setHoveredAngleWheelCell(cellIndex);
          canvas.style.cursor = "grab";
        } else {
          setHoveredAngleWheelCell(null);
        }
      } else {
        setHoveredAngleWheelCell(null);
      }
    }
    
    // **أولوية عالية: التعامل مع السحب النشط أولاً (باستخدام القيم العالمية)**
    
    // 1️⃣ سحب المثلث - أولوية عالية جداً
    if (isDraggingTriangle) {
      const currentAngle = getAngleDeg(x, y);
      const delta = currentAngle - dragStartAngle;
      setTriangleRotation((initialRotation + delta + 360) % 360);
      return; // خروج مبكر لمنع أي تداخل
    }
    
    // 2️⃣ سحب النجمة الثلاثية - أولوية عالية جداً
    if (isDraggingStar3) {
      const currentAngle = getAngleDeg(x, y);
      const delta = currentAngle - dragStartAngle;
      setStar3Rotation((initialRotation + delta + 360) % 360);
      return; // خروج مبكر
    }
    
    // 3️⃣ سحب عجلة الزوايا - أولوية عالية
    if (isDraggingAngleWheel) {
      const currentAngle = getAngleDeg(x, y);
      const delta = currentAngle - dragStartAngle;
      const newRotation = (initialRotation + delta + 360) % 360;
      console.log(`🔄 ANGLE WHEEL DRAG: current=${currentAngle.toFixed(1)}°, start=${dragStartAngle.toFixed(1)}°, delta=${delta.toFixed(1)}°, new=${newRotation.toFixed(1)}°`);
      canvas.style.cursor = "grabbing";
      setAngleWheelRotation(newRotation);
      return; // خروج مبكر
    }
    
    // 4️⃣ سحب الأشكال الأخرى
    if (isDraggingSquare) {
      const currentAngle = getAngleDeg(x, y);
      const delta = currentAngle - dragStartAngle;
      setSquareRotation((initialRotation + delta + 360) % 360);
      return;
    }
    
    if (isDraggingStar4) {
      const currentAngle = getAngleDeg(x, y);
      const delta = currentAngle - dragStartAngle;
      setStar4Rotation((initialRotation + delta + 360) % 360);
      return;
    }
    
    if (isDraggingPentagon) {
      const currentAngle = getAngleDeg(x, y);
      const delta = currentAngle - dragStartAngle;
      setPentagonRotation((initialRotation + delta + 360) % 360);
      return;
    }
    
    if (isDraggingStar5) {
      const currentAngle = getAngleDeg(x, y);
      const delta = currentAngle - dragStartAngle;
      setStar5Rotation((initialRotation + delta + 360) % 360);
      return;
    }
    
    // **أولوية متوسطة: التعامل مع hover والمؤشر**
    
    // إعادة تعيين المؤشر افتراضياً
    canvas.style.cursor = "default";
    setHoveredPointIndex(null);
    
    // التحقق من الشكل المحدد للمؤشر
    if (selectedShape === "triangle") {
      const r = degreeRingRadius; // نفس المسافة المستخدمة في الرسم
      const trianglePoints = customAngles.map((deg) => {
        const rad = ((deg + triangleRotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      trianglePoints.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 15) { // منطقة أوسع للمؤشر
          setHoveredPointIndex(idx);
          canvas.style.cursor = "move";
        }
      });
    }
    
    else if (selectedShape === "star3") {
      const r = degreeRingRadius; // **تصحيح: استخدام نفس المسافة للمثلث**
      
      // حساب النقاط بناءً على نمط الرسم
      const star3Points = [];
      
      if (star3DrawMode === "lines") {
        // النقاط الخارجية
        for (let i = 0; i < 3; i++) {
          const angle = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
          star3Points.push({
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
          });
        }
        
        // النقاط الداخلية
        for (let i = 0; i < 3; i++) {
          const angle1 = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
          const angle2 = ((customStar3Angles[(i + 1) % 3]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
          
          let midAngle = (angle1 + angle2) / 2;
          if (Math.abs(angle2 - angle1) > Math.PI) {
            midAngle += Math.PI;
          }
          
          star3Points.push({
            x: center + (r * 0.3) * Math.cos(midAngle),
            y: center + (r * 0.3) * Math.sin(midAngle),
          });
        }
      } else {
        // للمثلث - 3 نقاط فقط
        customStar3Angles.forEach((deg) => {
          const rad = ((deg + star3Rotation + settings.rotation - 90) * Math.PI) / 180;
          star3Points.push({
            x: center + r * Math.cos(rad),
            y: center + r * Math.sin(rad),
          });
        });
      }

      star3Points.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 15) {
          setHoveredPointIndex(idx);
          canvas.style.cursor = "move";
        }
      });
    }
    
    // **تحقق من عجلة الزوايا أخيراً (بغض النظر عن الشكل المحدد)**
    if (showAngleWheel) {
      const distanceFromCenter = getDistance(x, y, center, center);
      if (distanceFromCenter >= angleWheelInnerRadius && distanceFromCenter <= angleWheelOuterRadius) {
        canvas.style.cursor = "grab"; // يتفوق على مؤشر الأشكال
      }
    }
    
    
    // � تحديث مؤشر المربع وتنفيذ السحب
    if (selectedShape === "square") {
      const r = degreeRingRadius;
      const squarePoints = customSquareAngles.map((deg) => {
        const rad = ((deg + squareRotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      let found = false;
      squarePoints.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 25) { // زيادة منطقة الكشف من 10 إلى 25 لتتماشى مع onMouseDown
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingSquare) {
        console.log("🟦 SQUARE: Currently dragging, updating rotation");
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        const newRotation = (initialRotation + delta + 360) % 360;
        console.log(`🟦 SQUARE rotation: ${squareRotation.toFixed(1)}° -> ${newRotation.toFixed(1)}°`);
        setSquareRotation(newRotation);
      }
    }
    
    // التعامل مع النجمة الرباعية
    else if (selectedShape === "star4") {
      const r = degreeRingRadius;
      // النقاط الأربعة الرئيسية للنجمة الرباعية
      const star4Points = [0, 90, 180, 270].map((deg) => {
        const rad = ((deg + star4Rotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      let found = false;
      star4Points.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 10) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingStar4) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setStar4Rotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // التعامل مع الخماسي
    else if (selectedShape === "pentagon") {
      const r = degreeRingRadius;
      const pentagonPoints = customPentagonAngles.map((deg) => {
        const rad = ((deg + pentagonRotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      let found = false;
      pentagonPoints.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 10) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingPentagon) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setPentagonRotation((initialRotation + delta + 360) % 360);
      }
      
      if (isDraggingStar3) {
        console.log("Star3 is being dragged");
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        const newRotation = (initialRotation + delta + 360) % 360;
        console.log(`Star3 rotation: ${star3Rotation.toFixed(1)}° -> ${newRotation.toFixed(1)}°`);
        setStar3Rotation(newRotation);
      }
    }
    
    // التعامل مع النجمة الثلاثية
    else if (selectedShape === "star3") {
      const r = degreeRingRadius; // **تصحيح: استخدام نفس المسافة للمثلث**
      
      // حساب النقاط بناءً على نمط الرسم الجديد
      const star3Points = [];
      
      if (star3DrawMode === "lines") {
        // للنجمة الحقيقية - النقاط الخارجية والداخلية
        // النقاط الخارجية (رؤوس النجمة)
        for (let i = 0; i < 3; i++) {
          const angle = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
          star3Points.push({
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
          });
        }
        
        // النقاط الداخلية
        for (let i = 0; i < 3; i++) {
          const angle1 = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
          const angle2 = ((customStar3Angles[(i + 1) % 3]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
          
          let midAngle = (angle1 + angle2) / 2;
          if (Math.abs(angle2 - angle1) > Math.PI) {
            midAngle += Math.PI;
          }
          
          star3Points.push({
            x: center + (r * 0.3) * Math.cos(midAngle),
            y: center + (r * 0.3) * Math.sin(midAngle),
          });
        }
      } else {
        // للمثلث - 3 نقاط فقط
        customStar3Angles.forEach((deg) => {
          const rad = ((deg + star3Rotation + settings.rotation - 90) * Math.PI) / 180;
          star3Points.push({
            x: center + r * Math.cos(rad),
            y: center + r * Math.sin(rad),
          });
        });
      }

      let found = false;
      star3Points.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 10) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingStar3) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setStar3Rotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // التعامل مع النجمة الخماسية
    else if (selectedShape === "star5") {
      const r = degreeRingRadius;
      const star5Points = customPentagonAngles.map((deg) => {
        const rad = ((deg + star5Rotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      let found = false;
      star5Points.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 10) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move"; // تغيير مؤشر الماوس
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default"; // إعادة مؤشر الماوس الافتراضي
      }

      if (isDraggingStar5) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setStar5Rotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // التعامل مع السداسي
    else if (selectedShape === "hexagon") {
      const r = degreeRingRadius;
      const hexagonPoints = customHexagonAngles.map((deg) => {
        const rad = ((deg + hexagonRotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      let found = false;
      hexagonPoints.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 10) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingHexagon) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setHexagonRotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // التعامل مع النجمة السداسية
    else if (selectedShape === "star6") {
      const r = degreeRingRadius;
      // النقاط الستة للنجمة السداسية بالترتيب: 0°، 60°، 120°، 180°، 240°، 300°
      const star6Points = [0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = ((deg + star6Rotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      let found = false;
      star6Points.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 10) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingStar6) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setStar6Rotation((initialRotation + delta + 360) % 360);
      }
    }

    // التعامل مع النجمة السباعية
    else if (selectedShape === "star7") {
      const r = degreeRingRadius;
      const star7Points = [];
      for (let i = 0; i < 7; i++) {
        const angle = ((i * 360 / 7) + star7Rotation + settings.rotation - 90) * Math.PI / 180;
        star7Points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      let found = false;
      star7Points.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 15) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingStar7) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setStar7Rotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // التعامل مع النجمة الثمانية
    else if (selectedShape === "star8") {
      const r = degreeRingRadius;
      const star8Points = [];
      for (let i = 0; i < 8; i++) {
        const angle = ((i * 45) + star8Rotation + settings.rotation - 90) * Math.PI / 180;
        star8Points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      let found = false;
      star8Points.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 20) { // زيادة منطقة الكشف من 15 إلى 20
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingStar8) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setStar8Rotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // التعامل مع النجمة التساعية
    else if (selectedShape === "star9") {
      const r = degreeRingRadius;
      const star9Points = [];
      for (let i = 0; i < 9; i++) {
        const angle = ((i * 360 / 9) + star9Rotation + settings.rotation - 90) * Math.PI / 180;
        star9Points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      let found = false;
      star9Points.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 20) { // زيادة منطقة الكشف من 15 إلى 20
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingStar9) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setStar9Rotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // التعامل مع النجمة العاشرية
    else if (selectedShape === "star10") {
      const r = degreeRingRadius;
      const star10Points = [];
      for (let i = 0; i < 10; i++) {
        const angle = ((i * 360 / 10) + star10Rotation + settings.rotation - 90) * Math.PI / 180;
        star10Points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      let found = false;
      star10Points.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 20) { // زيادة منطقة الكشف من 15 إلى 20
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingStar10) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setStar10Rotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // التعامل مع النجمة الحادية عشرة
    else if (selectedShape === "star11") {
      const r = degreeRingRadius;
      const star11Points = [];
      for (let i = 0; i < 11; i++) {
        const angle = ((i * 360 / 11) + star11Rotation + settings.rotation - 90) * Math.PI / 180;
        star11Points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      let found = false;
      star11Points.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 20) { // زيادة منطقة الكشف من 15 إلى 20
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingStar11) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setStar11Rotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // التعامل مع النجمة الثانية عشرة
    else if (selectedShape === "star12") {
      const r = degreeRingRadius;
      const star12Points = [];
      for (let i = 0; i < 12; i++) {
        const angle = ((i * 360 / 12) + star12Rotation + settings.rotation - 90) * Math.PI / 180;
        star12Points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      let found = false;
      star12Points.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 20) { // زيادة منطقة الكشف من 15 إلى 20
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingStar12) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setStar12Rotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // التعامل مع الشكل السباعي
    else if (selectedShape === "heptagon") {
      const r = degreeRingRadius;
      const heptagonPoints = [];
      for (let i = 0; i < 7; i++) {
        const angle = ((i * 360 / 7) + heptagonRotation + settings.rotation - 90) * Math.PI / 180;
        heptagonPoints.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      let found = false;
      heptagonPoints.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 15) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingHeptagon) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setHeptagonRotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // التعامل مع الشكل الثماني
    else if (selectedShape === "octagon") {
      const r = degreeRingRadius;
      const octagonPoints = customOctagonAngles.map((deg) => {
        const rad = ((deg + octagonRotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      let found = false;
      octagonPoints.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 15) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingOctagon) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setOctagonRotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // التعامل مع الشكل التساعي
    else if (selectedShape === "nonagon") {
      const r = degreeRingRadius;
      const nonagonPoints = [];
      for (let i = 0; i < 9; i++) {
        const angle = ((i * 360 / 9) + nonagonRotation + settings.rotation - 90) * Math.PI / 180;
        nonagonPoints.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      let found = false;
      nonagonPoints.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 15) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingNonagon) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setNonagonRotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // التعامل مع الشكل العاشر
    else if (selectedShape === "decagon") {
      const r = degreeRingRadius;
      const decagonPoints = [];
      for (let i = 0; i < 10; i++) {
        const angle = ((i * 360 / 10) + decagonRotation + settings.rotation - 90) * Math.PI / 180;
        decagonPoints.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      let found = false;
      decagonPoints.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 15) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingDecagon) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setDecagonRotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // التعامل مع الشكل الحادي عشر
    else if (selectedShape === "eleven") {
      const r = degreeRingRadius;
      const hendecagonPoints = [];
      for (let i = 0; i < 11; i++) {
        const angle = ((i * 360 / 11) + hendecagonRotation + settings.rotation - 90) * Math.PI / 180;
        hendecagonPoints.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      let found = false;
      hendecagonPoints.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 15) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingHendecagon) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setHendecagonRotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // التعامل مع الشكل الثاني عشر
    else if (selectedShape === "twelve") {
      const r = degreeRingRadius;
      const dodecagonPoints = [];
      for (let i = 0; i < 12; i++) {
        const angle = ((i * 360 / 12) + dodecagonRotation + settings.rotation - 90) * Math.PI / 180;
        dodecagonPoints.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      let found = false;
      dodecagonPoints.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 15) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingDodecagon) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setDodecagonRotation((initialRotation + delta + 360) % 360);
      }
    }
  }

  function onMouseUp() {
    console.log("Mouse up - ending all drags");
    
    // تحديد ما إذا كان أي شكل في حالة سحب
    const wasDragging = isDraggingTriangle || isDraggingSquare || isDraggingStar4 || isDraggingPentagon || 
                       isDraggingStar3 || isDraggingStar5 || isDraggingHexagon || isDraggingStar6 || 
                       isDraggingHeptagon || isDraggingStar7 || isDraggingOctagon || isDraggingStar8 || 
                       isDraggingNonagon || isDraggingStar9 || isDraggingDecagon || isDraggingStar10 || 
                       isDraggingHendecagon || isDraggingStar11 || isDraggingDodecagon || isDraggingStar12 || 
                       isDraggingAngleWheel;
    
    if (wasDragging) {
      console.log("🚫 Setting recentlyDragged flag to prevent cell clicks");
      setRecentlyDragged(true);
      // إعادة تعيين العلامة بعد فترة قصيرة
      setTimeout(() => {
        setRecentlyDragged(false);
        console.log("✅ recentlyDragged flag cleared");
      }, 50); // 50ms كافية لمنع click event
    }
    
    if (isDraggingStar3) {
      console.log("Star3 drag ended");
    }
    setIsDraggingTriangle(false);
    setIsDraggingAngleWheel(false);
    setIsDraggingStar3(false);
    setIsDraggingStar5(false);
    setIsDraggingSquare(false);
    setIsDraggingStar4(false);
    setIsDraggingPentagon(false);
    setIsDraggingHexagon(false);
    setIsDraggingStar6(false);
    setIsDraggingHeptagon(false);
    setIsDraggingStar7(false);
    setIsDraggingOctagon(false);
    setIsDraggingStar8(false);
    setIsDraggingNonagon(false);
    setIsDraggingStar9(false);
    setIsDraggingDecagon(false);
    setIsDraggingStar10(false);
    setIsDraggingHendecagon(false);
    setIsDraggingStar11(false);
    setIsDraggingDodecagon(false);
    setIsDraggingStar12(false);
  }

    // **حل جذري: event listener منفصل خاص بعجلة الزوايا فقط**
    // **🚀 حل جذري: نظام كشف موحد بقيم محسوبة ديناميكياً**
    function onAngleWheelMouseDown(e) {
      if (!showAngleWheel || isDraggingAngleWheel) return;
      
      const { x, y } = getMousePos(e);
      const distanceFromCenter = getDistance(x, y, center, center);
      const clickAngle = getAngleDeg(x, y);
      
      // 🔥 حساب قيم الأشعة الديناميكي (بدلاً من المتغيرات الثابتة)
      const baseRadius = Math.min(canvasWidth, canvasHeight) / 2;
      const dynamicInnerRadius = baseRadius * 0.71; // نسبة ثابتة
      const dynamicOuterRadius = baseRadius * 0.76; // نسبة ثابتة
      
      console.log(`🎯 UNIFIED ANGLE WHEEL DETECTION:`);
      console.log(`   📍 Click: (${x.toFixed(1)}, ${y.toFixed(1)}) at angle: ${clickAngle.toFixed(1)}°`);
      console.log(`   📏 Distance: ${distanceFromCenter.toFixed(1)}`);
      console.log(`   🔄 Dynamic range: ${dynamicInnerRadius.toFixed(1)} - ${dynamicOuterRadius.toFixed(1)}`);
      console.log(`   🔄 Original range: ${angleWheelInnerRadius.toFixed(1)} - ${angleWheelOuterRadius.toFixed(1)}`);
      
      // التحقق الأساسي من المسافة باستخدام القيم الديناميكية
      if (distanceFromCenter >= dynamicInnerRadius && distanceFromCenter <= dynamicOuterRadius) {
        // التحقق الدقيق: هل النقر داخل إحدى خلايا عجلة الزوايا؟
        const stepDegrees = angleStepRad;
        const totalCells = 360 / stepDegrees;
        // 🔧 حساب الزاوية مع تصحيح تلقائي لنظام الإحداثيات
        // إستراتيجية جديدة: محاولة كلا النظامين واختيار الأفضل
        const rawAngle = Math.atan2(y - center, x - center) * (180 / Math.PI);
        
        // نظام 1: Gann التقليدي (0° في الأعلى)
        let normalizedAngleV1 = rawAngle + 90 - angleWheelRotation;
        while (normalizedAngleV1 < 0) normalizedAngleV1 += 360;
        while (normalizedAngleV1 >= 360) normalizedAngleV1 -= 360;
        
        // نظام 2: Canvas المعياري (0° في اليمين) 
        let normalizedAngleV2 = rawAngle - angleWheelRotation;
        while (normalizedAngleV2 < 0) normalizedAngleV2 += 360;
        while (normalizedAngleV2 >= 360) normalizedAngleV2 -= 360;
        
        // نظام 3: مقلوب تماماً (تجربة)
        let normalizedAngleV3 = -rawAngle + 90 - angleWheelRotation;
        while (normalizedAngleV3 < 0) normalizedAngleV3 += 360;
        while (normalizedAngleV3 >= 360) normalizedAngleV3 -= 360;
        
        // حساب الخلايا للأنظمة الثلاثة
        const cellV1 = Math.floor(normalizedAngleV1 / stepDegrees);
        const cellV2 = Math.floor(normalizedAngleV2 / stepDegrees);
        const cellV3 = Math.floor(normalizedAngleV3 / stepDegrees);
        
        console.log(`   🔍 Multi-system analysis:`);
        console.log(`      V1 (Gann+90): ${normalizedAngleV1.toFixed(1)}° → Cell ${cellV1}`);
        console.log(`      V2 (Canvas): ${normalizedAngleV2.toFixed(1)}° → Cell ${cellV2}`);
        console.log(`      V3 (Inverted): ${normalizedAngleV3.toFixed(1)}° → Cell ${cellV3}`);
        
        // اختيار النظام الأكثر منطقية (على أساس الربع المتوقع)
        const expectedQuadrant = Math.floor(clickAngle / 90);
        const quadrantV1 = Math.floor(normalizedAngleV1 / 90);
        const quadrantV2 = Math.floor(normalizedAngleV2 / 90); 
        const quadrantV3 = Math.floor(normalizedAngleV3 / 90);
        
        let bestAngle, bestCell;
        if (quadrantV1 === expectedQuadrant) {
          bestAngle = normalizedAngleV1;
          bestCell = cellV1;
          console.log(`   ✅ Selected V1 (Gann+90) - quadrant match`);
        } else if (quadrantV2 === expectedQuadrant) {
          bestAngle = normalizedAngleV2;
          bestCell = cellV2;
          console.log(`   ✅ Selected V2 (Canvas) - quadrant match`);
        } else {
          bestAngle = normalizedAngleV3;
          bestCell = cellV3;
          console.log(`   ✅ Selected V3 (Inverted) - fallback`);
        }
        
        const cellStartAngle = bestCell * stepDegrees;
        const cellEndAngle = cellStartAngle + stepDegrees;
        
        console.log(`   � Final selection: ${bestAngle.toFixed(1)}° → Cell ${bestCell} (${cellStartAngle}° - ${cellEndAngle}°)`);
        
        // التأكد من أن النقر داخل نطاق خلية صحيحة مع تساهل إضافي
        const tolerance = stepDegrees * 0.1; // 10% تساهل
        const isInCellRange = bestAngle >= (cellStartAngle - tolerance) && bestAngle < (cellEndAngle + tolerance);
        const isValidCellIndex = bestCell >= 0 && bestCell < totalCells;
        
        if (isInCellRange && isValidCellIndex) {
          console.log(`🚀 ✅ UNIFIED DETECTION SUCCESS - Cell ${bestCell} at ${clickAngle.toFixed(1)}°`);
          console.log(`   🔄 System used dynamic radius: ${dynamicInnerRadius.toFixed(1)}-${dynamicOuterRadius.toFixed(1)}`);
          
          // منع جميع الأحداث الأخرى تماماً
          e.stopPropagation();
          e.stopImmediatePropagation();
          e.preventDefault();
          
          // تفعيل التدوير
          setIsDraggingAngleWheel(true);
          setDragStartAngle(clickAngle);
          setInitialRotation(angleWheelRotation);
          
          console.log(`✅ Angle wheel drag activated from cell ${bestCell} at ${clickAngle.toFixed(1)}°`);
          return true;
        } else {
          console.log(`❌ UNIFIED DETECTION MISS - not in valid cell`);
          console.log(`   📊 Cell range check: ${bestAngle.toFixed(1)}° vs ${cellStartAngle.toFixed(1)}°-${cellEndAngle.toFixed(1)}°`);
          console.log(`   📊 Tolerance used: ±${tolerance.toFixed(1)}°`);
        }
      } else {
        const tooClose = distanceFromCenter < dynamicInnerRadius;
        const tooFar = distanceFromCenter > dynamicOuterRadius;
        console.log(`❌ UNIFIED DETECTION MISS - distance out of range`);
        console.log(`   📏 Distance: ${distanceFromCenter.toFixed(1)}, Range: ${dynamicInnerRadius.toFixed(1)}-${dynamicOuterRadius.toFixed(1)}`);
        if (tooClose) console.log(`   ⬇️ Too close to center`);
        if (tooFar) console.log(`   ⬆️ Too far from center`);
        
        // 🔄 تجربة النطاق الأصلي كخطة بديلة
        if (distanceFromCenter >= angleWheelInnerRadius && distanceFromCenter <= angleWheelOuterRadius) {
          console.log(`   🔄 FALLBACK: Using original radius values`);
          // إعادة المحاولة بالقيم الأصلية
        }
      }
      
      return false;
    }
    
    // تسجيل الـ listener المخصص لعجلة الزوايا مع أولوية عالية (capture phase)
    canvas.addEventListener("mousedown", onAngleWheelMouseDown, true);
    
    // **اختبار تشخيصي للتحقق من دقة الكشف في خلايا مختلفة**
    console.log(`🧪 DIAGNOSTIC TEST for angle wheel cell detection (360° coverage):`);
    
    // **CRITICAL FIX: Use the same radius calculation as the actual detection logic**
    // Calculate the actual radius values using the same logic as the main drawing code
    const actualInnerRadius = canvasSize / 2 - 50;
    const actualBaseRingWidth = 20;
    const actualDigitScale = 8;
    
    let actualCalculatedLastRadius = actualInnerRadius;
    for (let level = 0; level < settings.levels; level++) {
      const maxDigitsInLevel = Math.max(
        ...Array.from({ length: settings.divisions }, (_, i) => {
          const globalIndex = level * settings.divisions + i;
          return parseFloat((settings.startValue + globalIndex).toFixed(2)).toString().length;
        })
      );
      const dynamicWidth = actualBaseRingWidth + maxDigitsInLevel * actualDigitScale;
      actualCalculatedLastRadius += dynamicWidth;
    }
    const actualLastNumberRingRadius = actualCalculatedLastRadius;
    const actualDegreeRingRadius = actualLastNumberRingRadius + 10;
    const actualAngleWheelInnerRadius = actualDegreeRingRadius + 25;
    const actualAngleWheelOuterRadius = actualAngleWheelInnerRadius + 40;
    
    console.log(`📏 RADIUS DEBUG - Test using: inner=${actualAngleWheelInnerRadius.toFixed(1)}, outer=${actualAngleWheelOuterRadius.toFixed(1)}`);
    console.log(`📏 RADIUS DEBUG - Original vars: inner=${angleWheelInnerRadius?.toFixed(1) || 'undefined'}, outer=${angleWheelOuterRadius?.toFixed(1) || 'undefined'}`);
    
    const stepDegrees = angleStepRad;
    const totalCells = 360 / stepDegrees;
    const testRadius = (actualAngleWheelInnerRadius + actualAngleWheelOuterRadius) / 2;
    
    // **اختبار شامل بـ 360 نقطة موزعة بالتساوي (كل درجة)**
    console.log(`🎯 ULTRA-COMPREHENSIVE TEST: Testing 360 points (every 1 degree):`);
    let successCount = 0;
    let failCount = 0;
    const failedAngles = [];
    
    for (let testAngle = 0; testAngle < 360; testAngle += 1) {
      // حساب الإحداثيات لهذه الزاوية (باستخدام نظام الرسم)
      const drawingAngle = testAngle - 90 + angleWheelRotation; // تحويل لنظام الرسم
      const rad = (drawingAngle * Math.PI) / 180;
      
      const testX = center + testRadius * Math.cos(rad);
      const testY = center + testRadius * Math.sin(rad);
      const distance = getDistance(testX, testY, center, center);
      
      // محاكاة منطق الكشف الجديد
      const rawAngle = Math.atan2(testY - center, testX - center) * (180 / Math.PI);
      let normalizedAngle = rawAngle - angleWheelRotation;
      while (normalizedAngle < 0) normalizedAngle += 360;
      while (normalizedAngle >= 360) normalizedAngle -= 360;
      
      const detectedCellIndex = Math.floor(normalizedAngle / stepDegrees);
      const inRange = distance >= actualAngleWheelInnerRadius && distance <= actualAngleWheelOuterRadius;
      const inCell = detectedCellIndex >= 0 && detectedCellIndex < totalCells && 
                     normalizedAngle >= detectedCellIndex * stepDegrees && 
                     normalizedAngle < (detectedCellIndex + 1) * stepDegrees;
      
      if (inRange && inCell) {
        successCount++;
      } else {
        failCount++;
        if (failedAngles.length < 10) { // حفظ أول 10 أخطاء للفحص
          failedAngles.push({
            angle: testAngle,
            rawAngle: rawAngle.toFixed(1),
            normalized: normalizedAngle.toFixed(1),
            detectedCell: detectedCellIndex,
            inRange,
            inCell
          });
        }
      }
      
      // عرض عينة كل 45 درجة للمراجعة
      if (testAngle % 45 === 0) {
        console.log(`   ${testAngle}°: raw=${rawAngle.toFixed(1)}° norm=${normalizedAngle.toFixed(1)}° cell=${detectedCellIndex} success=${inRange && inCell}`);
      }
    }
    
    console.log(`📊 360° TEST RESULTS: Success=${successCount}/360 (${(successCount/360*100).toFixed(1)}%), Failed=${failCount}/360`);
    
    if (failedAngles.length > 0) {
      console.log(`❌ FAILED ANGLES (first ${failedAngles.length}):`);
      failedAngles.forEach(fail => {
        console.log(`   ${fail.angle}°: raw=${fail.rawAngle}° norm=${fail.normalized}° cell=${fail.detectedCell} inRange=${fail.inRange} inCell=${fail.inCell}`);
      });
    }
    
    console.log(`📊 Total cells expected: ${totalCells}, Step: ${stepDegrees}°, Wheel rotation: ${angleWheelRotation.toFixed(1)}°`);
    
    // **اختبار شامل لجميع الخلايا للتأكد من تغطية 360 درجة**
    console.log(`🔍 COMPREHENSIVE CELL TEST (testing 3 points per cell):`);
    console.log(`   📊 COORDINATE SYSTEM: Math.atan2 range=[-180°,+180°] → Normalized=[0°,360°]`);
    console.log(`       stepDegrees=${stepDegrees.toFixed(1)}°, testRadius=${testRadius.toFixed(1)}px`);
    console.log(`       actualInnerRadius=${actualAngleWheelInnerRadius.toFixed(1)}, actualOuterRadius=${actualAngleWheelOuterRadius.toFixed(1)}`);
    let cellTestResults = { success: 0, fail: 0, failedCells: [] };
    
    for (let cellIndex = 0; cellIndex < Math.min(totalCells, 72); cellIndex++) {
      let cellSuccess = 0;
      
      // اختبار 3 نقاط لكل خلية: البداية والوسط والنهاية
      const testOffsets = [0.15, 0.5, 0.85]; // مواضع أفضل داخل الخلية
      
      testOffsets.forEach((offset, pointIndex) => {
        // حساب الزاوية النرمولية المتوقعة للخلية (كما يفهمها منطق الكشف)
        const expectedNormalizedAngle = cellIndex * stepDegrees + stepDegrees * offset;
        
        // تحويل إلى نظام Canvas للتطابق مع منطق الكشف المُحدث
        // منطق الكشف يستخدم: rawAngle + 90 - angleWheelRotation
        // لذا نحتاج لعكس التحويل: نطرح 90° ثم نضيفها في التحويل للراديان
        let canvasAngle = expectedNormalizedAngle - 90;
        
        // إضافة دوران العجلة
        canvasAngle += angleWheelRotation;
        
        // تطبيع للنطاق -180 إلى +180 (نطاق Math.atan2)
        while (canvasAngle > 180) canvasAngle -= 360;
        while (canvasAngle <= -180) canvasAngle += 360;
        
        // تحويل إلى راديان وحساب الإحداثيات
        const rad = (canvasAngle * Math.PI) / 180;
        const testX = center + testRadius * Math.cos(rad);
        const testY = center + testRadius * Math.sin(rad);
        const distance = Math.sqrt((testX - center) ** 2 + (testY - center) ** 2);
        
        // التحقق من أن النقطة في منطقة عجلة الزوايا
        if (distance >= actualAngleWheelInnerRadius && distance <= actualAngleWheelOuterRadius) {
          // محاكاة منطق الكشف الحقيقي (نفس منطق onAngleWheelMouseDown المُحدث)
          const rawAngle = Math.atan2(testY - center, testX - center) * (180 / Math.PI);
          let normalizedAngle = rawAngle + 90 - angleWheelRotation;
          
          // تطبيع الزاوية لنطاق 0-360
          while (normalizedAngle < 0) normalizedAngle += 360;
          while (normalizedAngle >= 360) normalizedAngle -= 360;
          
          const detectedCell = Math.floor(normalizedAngle / stepDegrees);
          const cellStartAngle = detectedCell * stepDegrees;
          const cellEndAngle = cellStartAngle + stepDegrees;
          
          // التحقق من الصحة: هل الخلية المكتشفة تطابق الخلية المتوقعة؟
          const isInCorrectCell = normalizedAngle >= cellStartAngle && normalizedAngle < cellEndAngle;
          const isCorrectCellIndex = detectedCell === cellIndex;
          
          if (isInCorrectCell && isCorrectCellIndex) {
            cellSuccess++;
            cellTestResults.success++;
          } else {
            cellTestResults.fail++;
            // تفاصيل إضافية للخطأ
            if (cellIndex <= 5 || cellSuccess === 0) {
              console.log(`     ❌ Cell ${cellIndex} Point ${pointIndex}: expected=${cellIndex}, detected=${detectedCell}, angle=${normalizedAngle.toFixed(1)}°, range=${cellStartAngle}-${cellEndAngle}, expectedNorm=${expectedNormalizedAngle.toFixed(1)}°, canvasAngle=${canvasAngle.toFixed(1)}°, actualRaw=${rawAngle.toFixed(1)}°`);
            }
          }
        } else {
          cellTestResults.fail++;
          console.log(`     ❌ Cell ${cellIndex} Point ${pointIndex}: outside range (distance=${distance.toFixed(1)})`);
        }
      });
      
      // تسجيل النتائج للخلايا الفاشلة أو كل خلية عاشرة
      if (cellSuccess < 3 || cellIndex % 10 === 0) {
        console.log(`   Cell ${cellIndex}: ${cellSuccess}/3 points successful`);
        if (cellSuccess < 3) {
          cellTestResults.failedCells.push(cellIndex);
        }
      }
    }
    
    const totalTests = Math.min(totalCells, 72) * 3;
    console.log(`📊 CELL TEST RESULTS: Success=${cellTestResults.success}/${totalTests} (${(cellTestResults.success/totalTests*100).toFixed(1)}%)`);
    
    if (cellTestResults.failedCells.length > 0) {
      console.log(`❌ FAILED CELLS: ${cellTestResults.failedCells.join(', ')}`);
      console.log(`🔧 DIAGNOSIS: Cell test issues may indicate coordinate system misalignment`);
      console.log(`💡 TIP: Use testComprehensiveDetection() for detailed analysis`);
    } else {
      console.log(`✅ ALL CELLS PASSED: Perfect detection coverage!`);
    }
    
    // **اختبار شعاعي: نقاط على مسافات مختلفة من المركز**
    console.log(`🎯 RADIAL TEST: Testing different radii within the ring (using ACTUAL values):`);
    console.log(`   📊 Actual angleWheelInnerRadius: ${actualAngleWheelInnerRadius.toFixed(1)} (vs original: ${angleWheelInnerRadius.toFixed(1)})`);
    console.log(`   📊 Actual angleWheelOuterRadius: ${actualAngleWheelOuterRadius.toFixed(1)} (vs original: ${angleWheelOuterRadius.toFixed(1)})`);
    
    const testRadii = [
      actualAngleWheelInnerRadius + 2, // قريب من الحافة الداخلية  
      (actualAngleWheelInnerRadius + actualAngleWheelOuterRadius) / 2, // منتصف الحلقة
      actualAngleWheelOuterRadius - 2  // قريب من الحافة الخارجية
    ];
    
    testRadii.forEach((testR, rIndex) => {
      let radiusSuccessCount = 0;
      const testStep = 30; // اختبار كل 30 درجة
      
      for (let angle = 0; angle < 360; angle += testStep) {
        const rad = ((angle - 90 + angleWheelRotation) * Math.PI) / 180;
        const testX = center + testR * Math.cos(rad);
        const testY = center + testR * Math.sin(rad);
        const distance = getDistance(testX, testY, center, center);
        
        if (distance >= actualAngleWheelInnerRadius && distance <= actualAngleWheelOuterRadius) {
          radiusSuccessCount++;
        }
      }
      
      console.log(`   Radius ${testR.toFixed(1)}: ${radiusSuccessCount}/${360/testStep} points in range`);
    });
    
    // **إنشاء دالة اختبار تفاعلية لاستخدامها في المتصفح**
    window.testAngleWheelDetection = (testAngle = 0) => {
      console.log(`🧪 INTERACTIVE TEST at ${testAngle}°:`);
      const testR = (actualAngleWheelInnerRadius + actualAngleWheelOuterRadius) / 2;
      const currentRotation = angleWheelRotation;
      const currentStepDegrees = angleStepRad;
      const rad = ((testAngle - 90 + currentRotation) * Math.PI) / 180;
      const testX = center + testR * Math.cos(rad);
      const testY = center + testR * Math.sin(rad);
      
      // محاكاة الكشف الحقيقي
      const rawAngle = Math.atan2(testY - center, testX - center) * (180 / Math.PI);
      let normalizedAngle = rawAngle - currentRotation;
      while (normalizedAngle < 0) normalizedAngle += 360;
      while (normalizedAngle >= 360) normalizedAngle -= 360;
      
      const cellIndex = Math.floor(normalizedAngle / currentStepDegrees);
      const cellStartAngle = cellIndex * currentStepDegrees;
      const cellEndAngle = cellStartAngle + currentStepDegrees;
      const distance = getDistance(testX, testY, center, center);
      const inRange = distance >= actualAngleWheelInnerRadius && distance <= actualAngleWheelOuterRadius;
      const inCorrectCell = normalizedAngle >= cellStartAngle && normalizedAngle < cellEndAngle;
      
      console.log(`   Position: (${testX.toFixed(1)}, ${testY.toFixed(1)})`);
      console.log(`   Raw angle: ${rawAngle.toFixed(1)}°, Normalized: ${normalizedAngle.toFixed(1)}°`);
      console.log(`   Expected angle: ${testAngle}°, Cell: ${cellIndex} (${cellStartAngle}°-${cellEndAngle}°)`);
      console.log(`   Distance: ${distance.toFixed(1)}, In range: ${inRange}, In correct cell: ${inCorrectCell}`);
      console.log(`   Current rotation: ${currentRotation}°, Step: ${currentStepDegrees}°`);
      console.log(`   Actual radius range: ${actualAngleWheelInnerRadius.toFixed(1)}-${actualAngleWheelOuterRadius.toFixed(1)}`);
      console.log(`   ✅ OVERALL SUCCESS: ${inRange && inCorrectCell}`);
      
      return { testX, testY, cellIndex, inRange, normalizedAngle, success: inRange && inCorrectCell };
    };
    
    // **إنشاء دالة لاختبار جميع الربعات**
    window.testAllQuadrants = () => {
      console.log(`🔄 TESTING ALL QUADRANTS:`);
      [0, 45, 90, 135, 180, 225, 270, 315].forEach(angle => {
        const result = window.testAngleWheelDetection(angle);
        console.log(`   ${angle}° → Cell ${result.cellIndex}, Success: ${result.success ? '✅' : '❌'}`);
      });
    };
    
    // **دالة اختبار شاملة جديدة**
    window.testComprehensiveDetection = () => {
      console.log(`🔍 COMPREHENSIVE DETECTION TEST:`);
      let totalSuccess = 0;
      let totalTests = 0;
      
      for (let angle = 0; angle < 360; angle += 15) {
        const result = window.testAngleWheelDetection(angle);
        if (result.success) totalSuccess++;
        totalTests++;
      }
      
      const percentage = (totalSuccess / totalTests * 100).toFixed(1);
      console.log(`📊 OVERALL RESULTS: ${totalSuccess}/${totalTests} (${percentage}%) successful detections`);
      return { totalSuccess, totalTests, percentage };
    };
    
    console.log(`💡 INTERACTIVE COMMANDS AVAILABLE IN CONSOLE:`);
    console.log(`   testAngleWheelDetection(45)  // اختبار زاوية 45 درجة`);
    console.log(`   testAllQuadrants()           // اختبار جميع الربعات والزوايا الرئيسية`);
    console.log(`   testComprehensiveDetection() // اختبار شامل كل 15 درجة`);
    console.log(`   for(let i=0;i<360;i+=10) testAngleWheelDetection(i) // اختبار كل 10 درجات`);
    
    // دالة تنظيف للـ listener المخصص
    const cleanupAngleWheelListener = () => {
      canvas.removeEventListener("mousedown", onAngleWheelMouseDown, true);
    };

    // تسجيل مستمعات الأحداث العادية (بعد الـ listener المخصص)
    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  
  // تنظيف مستمعات الأحداث
  return () => {
    cleanupAngleWheelListener(); // تنظيف الـ listener المخصص أولاً
    canvas.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };
}, [
  selectedShape,
  triangleRotation,
  customAngles,
  settings,
  isDraggingTriangle,
  isDraggingAngleWheel,
  isDraggingStar3,
  isDraggingStar5,
  isDraggingSquare,
  isDraggingStar4,
  isDraggingPentagon,
  isDraggingHexagon,
  isDraggingStar6,
  isDraggingHeptagon,
  isDraggingStar7,
  isDraggingOctagon,
  isDraggingStar8,
  isDraggingNonagon,
  isDraggingStar9,
  isDraggingDecagon,
  isDraggingStar10,
  isDraggingHendecagon,
  isDraggingStar11,
  isDraggingDodecagon,
  isDraggingStar12,
  dragStartAngle,
  initialRotation,
  scale,
  star4Rotation,
  star3Rotation,
  star5Rotation,
  squareRotation,
  star3Rotation,
  pentagonRotation,
  hexagonRotation,
  star6Rotation,
  heptagonRotation,
  star7Rotation,
  octagonRotation,
  star8Rotation,
  nonagonRotation,
  star9Rotation,
  decagonRotation,
  star10Rotation,
  hendecagonRotation,
  star11Rotation,
  dodecagonRotation,
  star12Rotation,
  showSquareAngles,
  showStar3Angles,
  showStar4Angles,
  showPentagonAngles,
  showStar5Angles,
  showHexagonAngles,
  showStar6Angles,
  showHeptagonAngles,
  showStar7Angles,
  showOctagonAngles,
  showStar8Angles,
  showNonagonAngles,
  showStar9Angles,
  showDecagonAngles,
  showStar10Angles,
  showHendecagonAngles,
  showStar11Angles,
  showDodecagonAngles,
  showStar12Angles,
  customStar3Angles,
  star3DrawMode,
  highlightStar3,
  angleWheelRotation,
  showAngleWheel,
  angleStepRad,
  hoveredAngleWheelCell,
]);

  // تصدير كصورة PNG
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext("2d");
    ctx.drawImage(canvas, 0, 0);
    const pngUrl = exportCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "gann-circle.png";
    link.href = pngUrl;
    link.click();
  };

  // تصدير كملف PDF
  const handleExportPDF = async () => {
    const canvas = canvasRef.current;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext("2d");
    ctx.drawImage(canvas, 0, 0);
    const imgData = exportCanvas.toDataURL("image/png");
    const jsPDF = await import("jspdf");
    const pdf = new jsPDF.jsPDF("landscape", "pt", [
      exportCanvas.width,
      exportCanvas.height,
    ]);
    pdf.addImage(imgData, "PNG", 0, 0, exportCanvas.width, exportCanvas.height);
    pdf.save("gann-circle.pdf");
  };

  // دوال الألوان واختزال الرقم
  const reduceToDigit = (num) => {
    // تحويل الرقم إلى نص وإزالة العلامة العشرية
    let numStr = num.toString().replace('.', '');
    
    // جمع جميع الأرقام
    let current = numStr
      .split("")
      .reduce((a, b) => a + Number(b), 0);
    
    // استمرار الاختزال حتى نحصل على رقم واحد
    while (current > 9) {
      current = current
        .toString()
        .split("")
        .reduce((a, b) => a + Number(b), 0);
    }
    return current;
  };
  const getDigitColor = (digit) => {
    if ([1, 4, 7].includes(digit)) return "red";
    if ([2, 5, 8].includes(digit)) return "blue";
    if ([3, 6, 9].includes(digit)) return "black";
    return "#000";
  };

  // دالة الحصول على لون الخلية حسب عدد النقرات
  const getCellBackgroundColor = (cellKey, clicks) => {
    if (clicks === 1) return "#90ee90";  // أخضر
    if (clicks === 2) return "pink";     // وردي
    if (clicks === 3) return "#ffff99";  // أصفر
    if (clicks === 4) return "gray";     // رمادي
    return "#fff"; // اللون الأصلي (أبيض)
  };

  // رسم عجلة الزوايا (مقسمة إلى خلايا مثل حلقة الأبراج)
  function drawAngleWheel(ctx, center) {
    const innerRadius = angleWheelInnerRadius;
    const outerRadius = angleWheelOuterRadius;
    
    // حساب خطوة الزاوية بناءً على angleStepRad
    const stepDegrees = angleStepRad;
    const totalCells = 360 / stepDegrees;
    
    // رسم الخلفية كحلقة واحدة متصلة
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, outerRadius, 0, 2 * Math.PI);
    ctx.arc(center, center, innerRadius, 0, 2 * Math.PI, true);
    ctx.closePath();
    
    // خلفية بلون مميز لعجلة الزوايا
    ctx.fillStyle = "#f5f5dc"; // لون بيج فاتح
    ctx.fill();
    
    // حدود خارجية وداخلية
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    
    // رسم تمييز للخلية المحددة (إذا وجدت)
    if (hoveredAngleWheelCell !== null) {
      const startAngle = -90 + angleWheelRotation + hoveredAngleWheelCell * stepDegrees;
      const endAngle = startAngle + stepDegrees;
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, outerRadius, startRad, endRad);
      ctx.arc(center, center, innerRadius, endRad, startRad, true);
      ctx.closePath();
      
      // لون مميز للخلية المحددة
      ctx.fillStyle = "rgba(255, 215, 0, 0.3)"; // ذهبي شفاف
      ctx.fill();
      
      // حدود واضحة للخلية المحددة
      ctx.strokeStyle = "#FF6B35"; // برتقالي مميز
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
    
    // إضافة خطوط تقسيم بين الخلايا بوضوح أكثر
    for (let i = 0; i < totalCells; i++) {
      const angleDeg = -90 + angleWheelRotation + i * stepDegrees;
      const angleRad = (angleDeg * Math.PI) / 180;
      
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(
        center + innerRadius * Math.cos(angleRad),
        center + innerRadius * Math.sin(angleRad)
      );
      ctx.lineTo(
        center + outerRadius * Math.cos(angleRad),
        center + outerRadius * Math.sin(angleRad)
      );
      ctx.strokeStyle = "#DAA520"; // ذهبي داكن لوضوح أفضل
      ctx.lineWidth = 1.5; // خط أعرض قليلاً
      ctx.stroke();
      ctx.restore();
    }
    
    // إضافة أرقام الزوايا إذا كان مفعلاً
    if (showAngleWheelAngles) {
      const totalAngles = 360 / angleStepRad;
      for (let i = 0; i < totalAngles; i++) {
        const angleDeg = -90 + angleWheelRotation + i * angleStepRad;
        const degreeValue = (i * angleStepRad) % 360; // الزاوية الحقيقية
        
        const angleRad = (angleDeg * Math.PI) / 180;
        const textRadius = (innerRadius + outerRadius) / 2;
        const x = center + textRadius * Math.cos(angleRad);
        const y = center + textRadius * Math.sin(angleRad);
        
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 9px Tahoma";
        ctx.fillStyle = "#000";
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.strokeText(degreeValue + "°", x, y);
        ctx.fillText(degreeValue + "°", x, y);
        ctx.restore();
      }
    }
  }

  // دالة رسم خطوط الأشعة (الخطوط الشعاعية) من المركز إلى عجلة الزوايا
  function drawAngleWheelRays(ctx, center) {
    if (!showAngleWheel) return;
    
    const stepDegrees = angleStepRad;
    const totalCells = 360 / stepDegrees;
    
    // رسم خطوط الأشعة من المركز إلى حافة عجلة الزوايا
    const innerRadius = 0; // من المركز مباشرة
    const outerRadius = angleWheelOuterRadius; // إلى حافة عجلة الزوايا
    
    for (let i = 0; i < totalCells; i++) {
      // حساب الشعاع: الشعاع الأول (i=0) من الساعة 12
      const rayDegree = -90 + angleWheelRotation + i * stepDegrees;
      const rayAngle = (rayDegree * Math.PI) / 180;
      
      ctx.save();
      ctx.beginPath();
      // الخط من المركز مباشرة إلى حافة عجلة الزوايا
      ctx.moveTo(center, center);
      ctx.lineTo(
        center + outerRadius * Math.cos(rayAngle),
        center + outerRadius * Math.sin(rayAngle)
      );
      ctx.strokeStyle = rayColor;
      ctx.lineWidth = rayWidth;
      ctx.globalAlpha = 0.9; // واضح أكثر
      ctx.stroke();
      ctx.restore();
    }
  }

  
  // دالة رسم حلقة الأبراج (منتصف كل برج عند زاوية القطاع الصحيح)
  function drawZodiacRing(ctx, center) {
    const radiusInner = zodiacInnerRadius;
    const radiusOuter = zodiacOuterRadius;
    const angleStep = 10;
    
    // رسم الخلايا
    for (let i = 0; i < 36; i++) {
      // برج الحمل يجب أن يكون عند الزاوية 10° (ليس 40°)
      // نطرح 30° من الحساب السابق لإصلاح الإزاحة
      const centerAngleDeg = -90 - 20 + i * angleStep; // تعديل للحصول على الموضع الصحيح
      const cellStartDegree = centerAngleDeg - angleStep/2; // بداية الخلية
      const cellEndDegree = centerAngleDeg + angleStep/2; // نهاية الخلية
      const startAngle = (cellStartDegree * Math.PI) / 180;
      const endAngle = (cellEndDegree * Math.PI) / 180;
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radiusOuter, startAngle, endAngle);
      ctx.arc(center, center, radiusInner, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = "#eee";
      ctx.fill();
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
    }
    
    // رسم النصوص في منتصف كل خلية بشكل دائري منسق
    for (let i = 0; i < 36; i++) {
      const { label, color } = zodiacRing[i];
      // نفس التعديل للنص: برج الحمل عند الزاوية 10°
      const textAngleDeg = -90 - 20 + i * angleStep;
      const textAngleRad = (textAngleDeg * Math.PI) / 180;
      const textRadius = (radiusInner + radiusOuter) / 2;
      
      ctx.save();
      // انتقال إلى مركز الدائرة
      ctx.translate(center, center);
      // دوران لتوجيه النص نحو الخارج
      ctx.rotate(textAngleRad);
      
      // إعدادات النص المحسنة
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 9px 'Segoe UI', 'Tahoma', Arial, sans-serif"; // حجم ثابت مصغر
      
      // إضافة ظل للنص لتحسين الوضوح
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = 1;
      ctx.shadowOffsetX = 0.3;
      ctx.shadowOffsetY = 0.3;
      
      // رسم النص على المسافة الصحيحة من المركز
      ctx.fillStyle = color;
      ctx.fillText(label, 0, -textRadius);
      
      // إزالة الظل ورسم حدود للنص لوضوح أفضل
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 0.3;
      ctx.strokeText(label, 0, -textRadius);
      
      ctx.restore();
    }
    
  }

  // دالة رسم حلقة أيام الأسبوع
  function drawWeekDaysRing(ctx, center) {
    const radiusInner = weekDaysInnerRadius;
    const radiusOuter = weekDaysOuterRadius;
    const angleStep = 10; // كل 10 درجات
    
    // أسماء أيام الأسبوع (من الأحد إلى الجمعة ثم تكرار)
    const weekDays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
    
    // ألوان الأرقام المختزلة
    const getReducedColor = (reducedDigit) => {
      if ([1, 4, 7].includes(reducedDigit)) return "red";
      if ([2, 5, 8].includes(reducedDigit)) return "blue";
      if ([3, 6, 9].includes(reducedDigit)) return "black";
      return "#000";
    };
    
    // رسم الخلايا
    for (let i = 0; i < 36; i++) {
      // نفس منطق حلقة الأبراج: الأحد يبدأ من 10 درجة
      const centerAngleDeg = -90 - 20 + i * angleStep; // تطبيق نفس إعدادات حلقة الأبراج
      const cellStartDegree = centerAngleDeg - angleStep/2;
      const cellEndDegree = centerAngleDeg + angleStep/2;
      const startAngle = (cellStartDegree * Math.PI) / 180;
      const endAngle = (cellEndDegree * Math.PI) / 180;
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radiusOuter, startAngle, endAngle);
      ctx.arc(center, center, radiusInner, endAngle, startAngle, true);
      ctx.closePath();
      
      // خلفية الخلية
      ctx.fillStyle = "#f9f9f9";
      ctx.fill();
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
    }
    
    // رسم النصوص في منتصف كل خلية
    for (let i = 0; i < 36; i++) {
      // نفس منطق حلقة الأبراج للنص
      const textAngleDeg = -90 - 20 + i * angleStep;
      const textAngleRad = (textAngleDeg * Math.PI) / 180;
      const textRadius = (radiusInner + radiusOuter) / 2;
      
      // حساب الرقم المختزل (1-9 متكرر)
      const reducedDigit = (i % 9) + 1;
      
      // حساب يوم الأسبوع حسب الجدولة المطلوبة
      // الأحد=0, الاثنين=1, الثلاثاء=2, الأربعاء=3, الخميس=4, الجمعة=5, ثم تكرار
      const dayIndex = (i % 6); // 6 أيام فقط (من الأحد إلى الجمعة)
      
      const dayName = weekDays[dayIndex];
      
      ctx.save();
      // انتقال إلى مركز الدائرة
      ctx.translate(center, center);
      // دوران لتوجيه النص نحو الخارج
      ctx.rotate(textAngleRad);
      
      // إعدادات النص
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 8px 'Segoe UI', 'Tahoma', Arial, sans-serif";
      
      // إضافة ظل للنص
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = 1;
      ctx.shadowOffsetX = 0.3;
      ctx.shadowOffsetY = 0.3;
      
      // رسم اسم اليوم بلون الرقم المختزل
      ctx.fillStyle = getReducedColor(reducedDigit);
      ctx.fillText(dayName, 0, -textRadius + 3);
      
      // رسم الرقم المختزل
      ctx.font = "bold 6px 'Segoe UI', 'Tahoma', Arial, sans-serif";
      ctx.fillText(`(${reducedDigit})`, 0, -textRadius - 5);
      
      // إزالة الظل ورسم حدود للنص
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 0.3;
      ctx.strokeText(dayName, 0, -textRadius + 3);
      ctx.strokeText(`(${reducedDigit})`, 0, -textRadius - 5);
      
      ctx.restore();
    }
  }
  
  //  event listeners لتدوير راس زوايا الاشكال مثل المثلث

  useEffect(() => {
    console.log("useEffect triggered. selectedShape:", selectedShape);
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    
    // تأكد من أن Canvas مربع (نفس العرض والارتفاع)
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;

    const ctx = canvas.getContext("2d");
    
    // إعادة تعيين التحويل وتطبيق Uniform Scaling
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // استخدام نفس القيمة للعرض والارتفاع للحفاظ على الشكل الدائري
    const uniformScale = dpr * scale;
    ctx.scale(uniformScale, uniformScale);

    const center = canvasSize / 2;
    settings.rotation = 0;


    
    // خلفية الدائرة الرمادية
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, ringRadius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = "#eee";
    ctx.fill();
    ctx.restore();

    // عجلة الزوايا قبل الأرقام/الأبراج
    if (showAngleWheel) {
      drawAngleWheel(ctx, center);
    }

    // رسم الأشكال (مثال: مثلث، مربع، ... إلخ)
  function drawShape(ctx, center, radius, shape) {

      if (shape === "triangle") {
    // رسم المثلث مقترن بحلقة الدرجات (degree ring)
    const r = degreeRingRadius;
    
    const trianglePoints = customAngles.map((deg) => {
      const rad = ((deg + triangleRotation + settings.rotation - 90) * Math.PI) / 180;
      return {
        x: center + r * Math.cos(rad),
        y: center + r * Math.sin(rad),
      };
    });

    // رسم خطوط الربط من المركز إلى حلقة الدرجات
    trianglePoints.forEach((point) => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = "darkgreen";
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8;
      ctx.stroke();
      ctx.restore();
    });

    // رسم المثلث نفسه
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(trianglePoints[0].x, trianglePoints[0].y);
    trianglePoints.forEach((p, i) => {
      if (i > 0) ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    if (fillTriangle) {
      ctx.fillStyle = "rgba(0, 100, 0, 0.2)";
      ctx.fill();
    }
    ctx.strokeStyle = "darkgreen";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // تمييز الزوايا بدوائر على حلقة الدرجات
    if (highlightTriangle) {
      trianglePoints.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = "darkgreen";
        ctx.fill();
        ctx.strokeStyle = "green";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      });
    }

    // الخطوط الداخلية من الرؤوس إلى المركز
    trianglePoints.forEach((point) => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(center, center);
      ctx.strokeStyle = "green";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 2]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    });

    // عرض الزوايا النصية عند الرؤوس
    trianglePoints.forEach((point, i) => {
      const angle = (customAngles[i] + triangleRotation + settings.rotation) % 360;
      ctx.save();
      ctx.font = "bold 16px Tahoma";
      ctx.fillStyle = "darkgreen";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`(${angle.toFixed(0)}°)`, point.x, point.y - 15); // رفعت النص قليلاً
      ctx.restore();
    });

    // **رسم رؤوس المثلث بلون أصفر غامق دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء**
    trianglePoints.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI); // دائرة أكبر قليلاً
      ctx.fillStyle = "#B8860B"; // أصفر غامق (DarkGoldenRod)
      ctx.fill();
      ctx.strokeStyle = "#8B7D00"; // حدود أصفر أغمق
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // إضافة نقطة مركزية صغيرة للتأكيد
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#8B7D00"; // نقطة مركزية أغمق
      ctx.fill();
      ctx.restore();
    });

    // إبراز الرأس تحت الماوس (فوق الرؤوس الأصفر)
if (hoveredPointIndex !== null && trianglePoints[hoveredPointIndex]) {
  const p = trianglePoints[hoveredPointIndex];
  ctx.save();
  ctx.beginPath();
  ctx.arc(p.x, p.y, 10, 0, 2 * Math.PI); // أكبر قليلاً من الرؤوس الأصفر
  ctx.fillStyle = "orange";
  ctx.fill();
  ctx.strokeStyle = "#FF8C00"; // حدود برتقالية
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}
    return; // انتهى رسم المثلث ولا تنفذ الباقي
  }

  // رسم الأشكال الهندسية الأخرى
  if (shape === "square") {
    drawSquare(ctx, center, radius);
    return;
  }
  if (shape === "pentagon") {
    drawPentagon(ctx, center, radius);
    return;
  }
  if (shape === "hexagon") {
    drawHexagon(ctx, center, radius);
    return;
  }
  if (shape === "heptagon") {
    drawHeptagon(ctx, center, radius);
    return;
  }
  if (shape === "octagon") {
    drawOctagon(ctx, center, radius);
    return;
  }
  if (shape === "nonagon") {
    drawNonagon(ctx, center, radius);
    return;
  }
  if (shape === "decagon") {
    drawDecagon(ctx, center, radius);
    return;
  }
  if (shape === "eleven") {
    drawHendecagon(ctx, center, radius);
    return;
  }
  if (shape === "twelve") {
    drawDodecagon(ctx, center, radius);
    return;
  }
  
  // رسم النجوم
  if (shape === "star4") {
    drawStar4(ctx, center, radius);
    return;
  }
  if (shape === "star5") {
    drawStar5(ctx, center, radius);
    return;
  }
  if (shape === "star6") {
    drawStar6(ctx, center, radius);
    return;
  }
  if (shape === "star7") {
    drawStar7(ctx, center, radius);
    return;
  }
  if (shape === "star8") {
    drawStar8(ctx, center, radius);
    return;
  }
  if (shape === "star9") {
    drawStar9(ctx, center, radius);
    return;
  }
  if (shape === "star10") {
    drawStar10(ctx, center, radius);
    return;
  }
  if (shape === "star11") {
    drawStar11(ctx, center, radius);
    return;
  }
  if (shape === "star12") {
    drawStar12(ctx, center, radius);
    return;
  }
    
    const shapes = {
      triangle: 3,
      square: 4,
      star4: 4,
      pentagon: 5,
      star5: 5,
      hexagon: 6,
      star6: 6,
      heptagon: 7,
      star7: 7,
      octagon: 8,
      star8: 8,
      nonagon: 9,
      star9: 9,
      decagon: 10,
      star10: 10,
      eleven: 11,
      star11: 11,
      twelve: 12,
      star12: 12,
    };
    let N = shapes[shape];
    if (!N) return;
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      let angle = ((2 * Math.PI * i) / N) - Math.PI / 2;
      let r = radius;
      // نجمة: كل زاوية ثانية نصف القطر
      if (shape.startsWith("star")) {
        r = i % 2 === 0 ? radius : radius * 0.55;
      }
      let x = center + r * Math.cos(angle);
      let y = center + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = "#00CED1";
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.7;
    ctx.stroke();
    ctx.restore();
  }

    // الحلقة الداخلية للأرقام 1-36
const count = 36;
// البداية من زاوية الرقم المختزل للرقم 1 (وهو 1) → زاوية 10°
const innerFirstValueReduced = reduceToDigit(1); // = 1
const startAngleDeg = innerFirstValueReduced * 10; // = 10°

for (let i = 0; i < count; i++) {
  // حساب الزاوية: البداية من 10° + (10° × index)
  let angleDeg = (startAngleDeg + i * 10) % 360; // دورة كاملة كل 360°
  angleDeg = angleDeg - 90; // تحويل إلى نظام Canvas
  const angle = (angleDeg + (settings.rotation || 0)) * (Math.PI / 180);
  const radius = innerRadius - 10;
  const x = center + radius * Math.cos(angle);
  const y = center + radius * Math.sin(angle);

  const number = i + 1;
  const reduced = reduceToDigit(number);

  ctx.save();
  ctx.font = " 6px Tahoma";
  ctx.fillStyle = getDigitColor(reduced); // لون بناءً على الرقم المختزل
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(number, x, y);
  ctx.restore();
}

    // الحلقات الخارجية والخلايا
    // حساب زاوية البداية العامة بناءً على الرقم المختزل لأول قيمة (startValue)
    const firstValueReduced = reduceToDigit(settings.startValue);
    const globalStartAngleDeg = firstValueReduced * 10; // الزاوية للرقم المختزل الأول
    
    for (let level = 0; level < settings.levels; level++) {
      const maxDigitsInLevel = Math.max(
        ...Array.from({ length: settings.divisions }, (_, i) => {
          const globalIndex = level * settings.divisions + i;
          return parseFloat((settings.startValue + globalIndex).toFixed(2)).toString().length;
        })
      );
      const dynamicWidth = baseRingWidth + maxDigitsInLevel * digitScale;
      const r1 =
        innerRadius +
        [...Array(level)].reduce((acc, _, l) => {
          const maxDigits = Math.max(
            ...Array.from({ length: settings.divisions }, (_, i) => {
              const globalIndex = l * settings.divisions + i;
              return parseFloat((settings.startValue + globalIndex).toFixed(2)).toString().length;
            })
          );
          return acc + (baseRingWidth + maxDigits * digitScale);
        }, 0);
      const r2 = r1 + dynamicWidth;
      
      for (let index = 0; index < settings.divisions; index++) {
        // حساب القيمة: كل حلقة تتابع من حيث انتهت الحلقة السابقة
        const globalIndex = level * settings.divisions + index;
        const value = parseFloat((settings.startValue + globalIndex).toFixed(2));
        const reduced = reduceToDigit(value);
        
        // حساب الزاوية: كل خلية تأخذ (360° / عدد القطاعات) من المساحة
        // الخلية الأولى تبدأ من زاوية البداية، والأخيرة تنتهي عند 360°
        const anglePerCell = 360 / settings.divisions;
        const cellAngleDeg = (index + 1) * anglePerCell; // من anglePerCell إلى 360°
        
        let angleDeg = cellAngleDeg - 90; // تحويل إلى نظام Canvas (-90° للساعة 12)
        const angleRad = (angleDeg * Math.PI) / 180;
        
        // حساب زوايا بداية ونهاية الخلية
        const halfAngle = (anglePerCell / 2 * Math.PI) / 180; // نصف عرض الخلية
        const angleStart = angleRad - halfAngle;
        const angleEnd = angleRad + halfAngle;
        const angleMid = angleRad;
        const rMid = (r1 + r2) / 2;
        
        // مفتاح فريد للخلية
        const cellKey = `${level}-${index}`;
        const clickCount = cellClickCounts[cellKey] || 0;
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, r2, angleStart, angleEnd);
        ctx.arc(center, center, r1, angleEnd, angleStart, true);
        ctx.closePath();
        ctx.fillStyle = getCellBackgroundColor(cellKey, clickCount);
        ctx.fill();
        ctx.strokeStyle = "#aaa";
        ctx.lineWidth = 0.5;
        ctx.stroke();
        const x = center + rMid * Math.cos(angleMid);
        const y = center + rMid * Math.sin(angleMid);
        ctx.font = "bold 12px Tahoma";
        ctx.fillStyle = getDigitColor(reduced);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(value, x, y);
        ctx.font = "bold 9px Tahoma";
        ctx.fillText(
          reduced,
          center + (r1 + 6) * Math.cos(angleMid),
          center + (r1 + 6) * Math.sin(angleMid)
        );
        ctx.restore();
      }
    }

    // رسم خطوط الأشعة فوق حلقات الأرقام
    drawAngleWheelRays(ctx, center);

    // حلقة الزوايا الخارجية (الدرجات)
    if (showDegreeRing) {
      // رسم خلفية حلقة الدرجات مثل حلقة الأبراج
      const ringInnerRadius = degreeRingRadius - 18; // نصف قطر داخلي
      const ringOuterRadius = degreeRingRadius + 18; // نصف قطر خارجي
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, ringOuterRadius, 0, 2 * Math.PI);
      ctx.arc(center, center, ringInnerRadius, 0, 2 * Math.PI, true);
      ctx.closePath();
      ctx.fillStyle = "#eee"; // نفس لون خلفية حلقة الأبراج
      ctx.fill();
      ctx.strokeStyle = "#ddd"; // حدود خفيفة
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
      
      // رسم النصوص
      for (let i = 0; i < 36; i++) {
        const angleDeg = -90 + 10 + i * 10;
        const degreeValue = (i + 1) * 10;
        const digitSum = degreeValue
          .toString()
          .split("")
          .reduce((sum, d) => sum + parseInt(d), 0);
        const reduced =
          digitSum > 9
            ? digitSum
                .toString()
                .split("")
                .reduce((sum, d) => sum + parseInt(d), 0)
            : digitSum;
        const getDegreeColor = (n) =>
          n === 1 || n === 4 || n === 7
            ? "red"
            : n === 2 || n === 5 || n === 8
            ? "blue"
            : "black";
        const angleRad = (angleDeg * Math.PI) / 180;
        const r = degreeRingRadius;
        const x = center + r * Math.cos(angleRad);
        const y = center + r * Math.sin(angleRad);
        ctx.save();
        ctx.font = "bold 12px Tahoma"; // حجم ثابت
        ctx.fillStyle = getDegreeColor(reduced);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${degreeValue}°`, x, y);
        ctx.restore();
      }
    }
    if (showZodiacRing) {
      drawZodiacRing(ctx, center);
    }
    if (showWeekDaysRing) {
      drawWeekDaysRing(ctx, center);
    }
    
    // رسم الدوائر المتداخلة
    if (showNestedCircles) {
      for (let i = 0; i < nestedCircleCount; i++) {
        const radius = nestedCircleGap * (i + 1);
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = nestedCircleColor;
        ctx.lineWidth = nestedStrokeWidth;
        ctx.stroke();
        ctx.restore();
        
        // إضافة تسميات الدوائر إذا كانت مطلوبة
        if (nestedCircleLabels) {
          ctx.save();
          ctx.font = "10px Arial";
          ctx.fillStyle = nestedCircleColor;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`R=${radius}`, center, center - radius - 4);
          ctx.restore();
        }
      }
    }
    
    console.log("Current selectedShape:", selectedShape);
        if (selectedShape && selectedShape !== "anglewheel" && selectedShape !== "circles") {
      // رسم الأشكال على حلقة الدرجات
      console.log("Drawing shape:", selectedShape, "at radius:", degreeRingRadius);
      
      // حفظ السياق قبل الرسم واستعادته بعد الانتهاء
      ctx.save();
      drawShape(ctx, center, degreeRingRadius, selectedShape);
      
      // رسم النجمة الثلاثية مباشرة
      if (selectedShape === "star3") {
        console.log("Drawing star3 directly in useEffect");
        
        const starRadius = degreeRingRadius;
        
        // النجمة الثلاثية الحقيقية {3/3} - 3 مثلثات خارجية + مثلث مركزي
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 2;
        
        if (star3DrawMode === "lines") {
          // رسم النجمة الثلاثية كنجمة متصلة من المركز إلى 3 نقاط خارجية
          // ثم ربط النقاط الخارجية ببعضها لتكوين مثلث خارجي
          
          const outerRadius = starRadius;
          const innerRadius = starRadius * 0.3; // نصف قطر النقاط الداخلية
          
          // حساب النقاط الخارجية (رؤوس النجمة)
          const outerPoints = [];
          for (let i = 0; i < 3; i++) {
            const angle = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
            const x = center + outerRadius * Math.cos(angle);
            const y = center + outerRadius * Math.sin(angle);
            outerPoints.push({ x, y });
          }
          
          // حساب النقاط الداخلية (بين كل رأسين)
          const innerPoints = [];
          for (let i = 0; i < 3; i++) {
            const angle1 = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
            const angle2 = ((customStar3Angles[(i + 1) % 3]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
            
            // الزاوية في منتصف المسافة بين النقطتين الخارجيتين
            let midAngle = (angle1 + angle2) / 2;
            
            // تصحيح الزاوية إذا كانت هناك فجوة كبيرة (عبور الـ 360 درجة)
            if (Math.abs(angle2 - angle1) > Math.PI) {
              midAngle += Math.PI;
            }
            
            const x = center + innerRadius * Math.cos(midAngle);
            const y = center + innerRadius * Math.sin(midAngle);
            innerPoints.push({ x, y });
          }
          
          // رسم النجمة الثلاثية المتصلة
          ctx.beginPath();
          
          // البدء من النقطة الخارجية الأولى
          ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
          
          // رسم النجمة بالتنقل بين النقاط الخارجية والداخلية
          for (let i = 0; i < 3; i++) {
            const currentOuter = outerPoints[i];
            const nextInner = innerPoints[i];
            const nextOuter = outerPoints[(i + 1) % 3];
            
            // من النقطة الخارجية إلى النقطة الداخلية
            ctx.lineTo(nextInner.x, nextInner.y);
            // من النقطة الداخلية إلى النقطة الخارجية التالية
            ctx.lineTo(nextOuter.x, nextOuter.y);
          }
          
          ctx.closePath();
          ctx.stroke();
          
          // تعبئة النجمة إذا كانت مفعلة
          if (fillStar3) {
            ctx.fillStyle = "rgba(255, 215, 0, 0.3)";
            ctx.fill();
          }
          
          // رسم النقاط إذا كان التمييز مفعل
          if (highlightStar3) {
            // نقاط النجمة الخارجية (صفراء)
            outerPoints.forEach((point, idx) => {
              ctx.beginPath();
              ctx.arc(point.x, point.y, 7, 0, 2 * Math.PI);
              // تغيير اللون عند hover
              ctx.fillStyle = hoveredPointIndex === idx && selectedShape === "star3" ? "orange" : "yellow";
              ctx.fill();
              ctx.strokeStyle = "#000";
              ctx.lineWidth = 1;
              ctx.stroke();
            });
            
            // نقاط النجمة الداخلية (برتقالية)
            innerPoints.forEach((point, idx) => {
              ctx.beginPath();
              ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
              // تغيير اللون عند hover (إضافة 3 للفهرس لأن النقاط الداخلية تأتي بعد الخارجية)
              ctx.fillStyle = hoveredPointIndex === (idx + 3) && selectedShape === "star3" ? "red" : "orange";
              ctx.fill();
              ctx.strokeStyle = "#000";
              ctx.lineWidth = 1;
              ctx.stroke();
            });
          }
          
        } else {
          // رسم مثلث منتظم فقط
          const trianglePoints = [];
          for (let i = 0; i < 3; i++) {
            const angle = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
            const x = center + starRadius * Math.cos(angle);
            const y = center + starRadius * Math.sin(angle);
            trianglePoints.push({ x, y });
          }
          
          ctx.beginPath();
          ctx.moveTo(trianglePoints[0].x, trianglePoints[0].y);
          ctx.lineTo(trianglePoints[1].x, trianglePoints[1].y);
          ctx.lineTo(trianglePoints[2].x, trianglePoints[2].y);
          ctx.closePath();
          ctx.stroke();
          
          // تعبئة المثلث
          if (fillStar3) {
            ctx.fillStyle = "rgba(255, 215, 0, 0.3)";
            ctx.fill();
          }
          
          // رسم نقاط الرؤوس
          if (highlightStar3) {
            trianglePoints.forEach((point, idx) => {
              ctx.beginPath();
              ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
              // تغيير اللون عند hover
              ctx.fillStyle = hoveredPointIndex === idx && selectedShape === "star3" ? "orange" : "yellow";
              ctx.fill();
              ctx.strokeStyle = "#000";
              ctx.lineWidth = 1;
              ctx.stroke();
            });
          }
        }
        
        // عرض الزوايا
        if (showStar3Angles) {
          if (star3DrawMode === "lines") {
            // عرض زوايا النجمة الثلاثية - النقاط الخارجية والداخلية
            const outerAngles = customStar3Angles.map(angle => (angle + star3Rotation + settings.rotation - 90) % 360);
            
            // رسم زوايا النقاط الخارجية (رؤوس النجمة)
            outerAngles.forEach((angle, i) => {
              ctx.save();
              ctx.fillStyle = "#006400";
              ctx.font = "bold 18px Arial";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.strokeStyle = "#FFFFFF";
              ctx.lineWidth = 3;
              
              const textOffset = 30;
              const textAngle = (angle - 90) * Math.PI / 180;
              const textX = center + (starRadius + textOffset) * Math.cos(textAngle);
              const textY = center + (starRadius + textOffset) * Math.sin(textAngle);
              
              // رسم حدود بيضاء للنص لجعله أكثر وضوحاً
              ctx.strokeText(`${angle.toFixed(0)}°`, textX, textY);
              ctx.fillText(`${angle.toFixed(0)}°`, textX, textY);
              ctx.restore();
            });
            
            // رسم زوايا النقاط الداخلية
            for (let i = 0; i < 3; i++) {
              const angle1 = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
              const angle2 = ((customStar3Angles[(i + 1) % 3]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
              
              let midAngle = (angle1 + angle2) / 2;
              if (Math.abs(angle2 - angle1) > Math.PI) {
                midAngle += Math.PI;
              }
              
              const innerAngle = (midAngle * 180 / Math.PI) % 360;
              
              ctx.save();
              ctx.fillStyle = "#228B22";
              ctx.font = "bold 15px Arial";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.strokeStyle = "#FFFFFF";
              ctx.lineWidth = 2;
              
              const textOffset = 20;
              const innerRadius = starRadius * 0.3;
              const textX = center + (innerRadius + textOffset) * Math.cos(midAngle);
              const textY = center + (innerRadius + textOffset) * Math.sin(midAngle);
              
              // رسم حدود بيضاء للنص لجعله أكثر وضوحاً
              ctx.strokeText(`${innerAngle.toFixed(0)}°`, textX, textY);
              ctx.fillText(`${innerAngle.toFixed(0)}°`, textX, textY);
              ctx.restore();
            }
          } else {
            // عرض زوايا المثلث البسيط
            const angles = customStar3Angles.map(angle => (angle + star3Rotation + settings.rotation) % 360);
              
            angles.forEach((angle, i) => {
              ctx.save();
              ctx.fillStyle = "#006400";
              ctx.font = "bold 16px Arial";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.strokeStyle = "#FFFFFF";
              ctx.lineWidth = 3;
              
              const textOffset = 30;
              const textAngle = (angle - 90) * Math.PI / 180;
              const textX = center + (starRadius + textOffset) * Math.cos(textAngle);
              const textY = center + (starRadius + textOffset) * Math.sin(textAngle);
              
              // رسم حدود بيضاء للنص لجعله أكثر وضوحاً
              ctx.strokeText(`${angle.toFixed(0)}°`, textX, textY);
              ctx.fillText(`${angle.toFixed(0)}°`, textX, textY);
              ctx.restore();
            });
          }
        }
        
        console.log("Star3 drawing completed");
      }
      
      ctx.restore();
    }
    ctx.restore();
    
    // تعريف دوال النقر على الخلايا داخل useEffect
    function onCellClick(e) {
      // منع تغيير ألوان الخلايا أثناء أو بعد السحب مباشرة
      if (isDraggingTriangle || isDraggingSquare || isDraggingStar4 || isDraggingPentagon || 
          isDraggingStar3 || isDraggingStar5 || isDraggingHexagon || isDraggingStar6 || 
          isDraggingHeptagon || isDraggingStar7 || isDraggingOctagon || isDraggingStar8 || 
          isDraggingNonagon || isDraggingStar9 || isDraggingDecagon || isDraggingStar10 || 
          isDraggingHendecagon || isDraggingStar11 || isDraggingDodecagon || isDraggingStar12 || 
          isDraggingAngleWheel || recentlyDragged) {
        console.log("🚫 Cell click blocked - shape is being dragged or recently dragged");
        return; // منع تغيير ألوان الخلايا أثناء أو بعد السحب
      }
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // تحويل إحداثيات الماوس مع مراعاة scale
      const canvasMouseX = mouseX / scale;
      const canvasMouseY = mouseY / scale;
      
      const center = canvasSize / 2;
      const distance = Math.sqrt(Math.pow(canvasMouseX - center, 2) + Math.pow(canvasMouseY - center, 2));
      
      // ✅ **حماية منطقة عجلة الزوايا من تداخل النقر على الخلايا**
      if (showAngleWheel) {
        // استخدام القيم المطابقة تماماً للرسم - بدون هوامش
        const exactAngleWheelInner = angleWheelInnerRadius;
        const exactAngleWheelOuter = angleWheelOuterRadius;
        
        if (distance >= exactAngleWheelInner && distance <= exactAngleWheelOuter) {
          console.log(`🚫 Cell click blocked - inside EXACT angle wheel zone`);
          console.log(`   Distance: ${distance.toFixed(2)}, wheel range: ${exactAngleWheelInner.toFixed(2)}-${exactAngleWheelOuter.toFixed(2)}`);
          return; // منع النقر على الخلايا في منطقة عجلة الزوايا
        }
      }
      
      // التحقق من النقر داخل منطقة الحلقات الخارجية
      for (let level = 0; level < settings.levels; level++) {
        const maxDigitsInLevel = Math.max(
          ...Array.from({ length: settings.divisions }, (_, i) => {
            const globalIndex = level * settings.divisions + i;
            return parseFloat((settings.startValue + globalIndex).toFixed(2)).toString().length;
          })
        );
        const dynamicWidth = baseRingWidth + maxDigitsInLevel * digitScale;
        const r1 = innerRadius + [...Array(level)].reduce((acc, _, l) => {
          const maxDigits = Math.max(
            ...Array.from({ length: settings.divisions }, (_, i) => {
              const globalIndex = l * settings.divisions + i;
              return parseFloat((settings.startValue + globalIndex).toFixed(2)).toString().length;
            })
          );
          return acc + (baseRingWidth + maxDigits * digitScale);
        }, 0);
        const r2 = r1 + dynamicWidth;
        
        // التحقق من أن النقرة داخل هذه الحلقة
        if (distance >= r1 && distance <= r2) {
          // حساب الزاوية
          const angle = Math.atan2(canvasMouseY - center, canvasMouseX - center);
          let angleDeg = (angle * 180 / Math.PI + 90 + 360) % 360;
          
          // حساب فهرس الخلية
          const anglePerCell = 360 / settings.divisions;
          const cellIndex = Math.floor(angleDeg / anglePerCell);
          
          // مفتاح فريد للخلية
          const cellKey = `${level}-${cellIndex}`;
          
          // تحديث عدد النقرات
          setCellClickCounts(prev => {
            const currentClicks = prev[cellKey] || 0;
            const newClicks = (currentClicks + 1) % 5; // 0-4 دورة
            return {
              ...prev,
              [cellKey]: newClicks
            };
          });
          
          break;
        }
      }
    }

    // دالة للتعامل مع double click (إرجاع للون الأصلي)
    function onCellDoubleClick(e) {
      // منع تغيير ألوان الخلايا أثناء أو بعد السحب مباشرة
      if (isDraggingTriangle || isDraggingSquare || isDraggingStar4 || isDraggingPentagon || 
          isDraggingStar3 || isDraggingStar5 || isDraggingHexagon || isDraggingStar6 || 
          isDraggingHeptagon || isDraggingStar7 || isDraggingOctagon || isDraggingStar8 || 
          isDraggingNonagon || isDraggingStar9 || isDraggingDecagon || isDraggingStar10 || 
          isDraggingHendecagon || isDraggingStar11 || isDraggingDodecagon || isDraggingStar12 || 
          isDraggingAngleWheel || recentlyDragged) {
        console.log("🚫 Cell double-click blocked - shape is being dragged or recently dragged");
        return; // منع تغيير ألوان الخلايا أثناء أو بعد السحب
      }
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // تحويل إحداثيات الماوس مع مراعاة scale
      const canvasMouseX = mouseX / scale;
      const canvasMouseY = mouseY / scale;
      
      const center = canvasSize / 2;
      const distance = Math.sqrt(Math.pow(canvasMouseX - center, 2) + Math.pow(canvasMouseY - center, 2));
      
      // ✅ **حماية منطقة عجلة الزوايا من تداخل double-click على الخلايا**
      if (showAngleWheel) {
        // استخدام القيم المطابقة تماماً للرسم - بدون هوامش
        const exactAngleWheelInner = angleWheelInnerRadius;
        const exactAngleWheelOuter = angleWheelOuterRadius;
        
        if (distance >= exactAngleWheelInner && distance <= exactAngleWheelOuter) {
          console.log(`🚫 Cell double-click blocked - inside EXACT angle wheel zone`);
          console.log(`   Distance: ${distance.toFixed(2)}, wheel range: ${exactAngleWheelInner.toFixed(2)}-${exactAngleWheelOuter.toFixed(2)}`);
          return; // منع double-click على الخلايا في منطقة عجلة الزوايا
        }
      }
      
      // التحقق من النقر داخل منطقة الحلقات الخارجية
      for (let level = 0; level < settings.levels; level++) {
        const maxDigitsInLevel = Math.max(
          ...Array.from({ length: settings.divisions }, (_, i) => {
            const globalIndex = level * settings.divisions + i;
            return parseFloat((settings.startValue + globalIndex).toFixed(2)).toString().length;
          })
        );
        const dynamicWidth = baseRingWidth + maxDigitsInLevel * digitScale;
        const r1 = innerRadius + [...Array(level)].reduce((acc, _, l) => {
          const maxDigits = Math.max(
            ...Array.from({ length: settings.divisions }, (_, i) => {
              const globalIndex = l * settings.divisions + i;
              return parseFloat((settings.startValue + globalIndex).toFixed(2)).toString().length;
            })
          );
          return acc + (baseRingWidth + maxDigits * digitScale);
        }, 0);
        const r2 = r1 + dynamicWidth;
        
        if (distance >= r1 && distance <= r2) {
          const angle = Math.atan2(canvasMouseY - center, canvasMouseX - center);
          let angleDeg = (angle * 180 / Math.PI + 90 + 360) % 360;
          
          const anglePerCell = 360 / settings.divisions;
          const cellIndex = Math.floor(angleDeg / anglePerCell);
          
          const cellKey = `${level}-${cellIndex}`;
          
          // إرجاع للون الأصلي (حذف من state)
          setCellClickCounts(prev => {
            const newState = { ...prev };
            delete newState[cellKey];
            return newState;
          });
          
          break;
        }
      }
    }
    
    // تسجيل مستمعات الأحداث للنقر على الخلايا فقط
    canvas.addEventListener("click", onCellClick);
    canvas.addEventListener("dblclick", onCellDoubleClick);
    
    // تنظيف مستمعات الأحداث عند إلغاء تحميل المكون
    return () => {
      canvas.removeEventListener("click", onCellClick);
      canvas.removeEventListener("dblclick", onCellDoubleClick);
    };
  },
  
  [
  settings,
  scale,
  showZodiacRing,
  showWeekDaysRing,
  showDegreeRing,
  showAngleWheel,
  angleWheelRotation,
  angleStepRad,
  rayColor,
  rayWidth,
  selectedShape,
  canvasSize,
  triangleRotation,
  customAngles,
  highlightTriangle,
  fillTriangle,
  hoveredPointIndex,
  showNestedCircles,
  nestedCircleCount,
  nestedCircleGap,
  nestedCircleColor,
  nestedStrokeWidth,
  nestedCircleLabels,
  // Square states
  squareRotation,
  customSquareAngles,
  fillSquare,
  highlightSquare,
  showSquareAngles,
  // Star 4 states
  star4Rotation,
  customStar4Angles,
  fillStar4,
  highlightStar4,
  showStar4Angles,
  // Star 3 states
  star3Rotation,
  customStar3Angles,
  fillStar3,
  highlightStar3,
  showStar3Angles,
  star3DrawMode,
  // Pentagon states
  pentagonRotation,
  customPentagonAngles,
  fillPentagon,
  highlightPentagon,
  showPentagonAngles,
  // Star 5 states
  star5Rotation,
  customPentagonAngles,
  fillStar5,
  highlightStar5,
  showStar5Angles,
  // Hexagon states
  hexagonRotation,
  customHexagonAngles,
  fillHexagon,
  highlightHexagon,
  showHexagonAngles,
  // Star 6 states
  star6Rotation,
  customHexagonAngles,
  fillStar6,
  highlightStar6,
  showStar6Angles,
  // Heptagon states
  heptagonRotation,
  fillHeptagon,
  highlightHeptagon,
  // Star 7 states
  star7Rotation,
  fillStar7,
  highlightStar7,
  showStar7Angles,
  // Octagon states
  octagonRotation,
  customOctagonAngles,
  fillOctagon,
  highlightOctagon,
  // Star 8 states
  star8Rotation,
  customOctagonAngles,
  fillStar8,
  highlightStar8,
  showStar8Angles,
  // Nonagon states
  nonagonRotation,
  fillNonagon,
  highlightNonagon,
  // Star 9 states
  star9Rotation,
  fillStar9,
  highlightStar9,
  showStar9Angles,
  // Decagon states
  decagonRotation,
  fillDecagon,
  highlightDecagon,
  // Star 10 states
  star10Rotation,
  fillStar10,
  highlightStar10,
  showStar10Angles,
  // Hendecagon states
  hendecagonRotation,
  fillHendecagon,
  highlightHendecagon,
  showHendecagonAngles,
  // Star 11 states
  star11Rotation,
  fillStar11,
  highlightStar11,
  showStar11Angles,
  // Dodecagon states
  dodecagonRotation,
  fillDodecagon,
  highlightDodecagon,
  showDodecagonAngles,
  // Star 12 states
  star12Rotation,
  fillStar12,
  highlightStar12,
  showStar12Angles,
  // Cell click states
  cellClickCounts,
  recentlyDragged,
  // Dragging states
  isDraggingTriangle,
  isDraggingSquare,
  isDraggingStar4,
  isDraggingPentagon,
  isDraggingStar3,
  isDraggingStar5,
  isDraggingHexagon,
  isDraggingStar6,
  isDraggingHeptagon,
  isDraggingStar7,
  isDraggingOctagon,
  isDraggingStar8,
  isDraggingNonagon,
  isDraggingStar9,
  isDraggingDecagon,
  isDraggingStar10,
  isDraggingHendecagon,
  isDraggingStar11,
  isDraggingDodecagon,
  isDraggingStar12,
  isDraggingAngleWheel,
  ]);

  // --- JSX الرئيسي ---
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
      {/* القسم العلوي: العنوان والأزرار */}
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
                <button onClick={handleExportPNG}>📷 جفظ الصورة</button>
                <button onClick={handleExportPDF}>📄 طباعة PDF</button>
              </div>
              <button
                onClick={() => setShowDegreeRing((v) => !v)}
                style={buttonStyle}
              >
                🧭 {settings.language === "ar"
                  ? (showDegreeRing ? "إخفاء حلقة الزوايا" : "إظهار حلقة الزوايا")
                  : (showDegreeRing ? "Hide Degree Ring" : "Show Degree Ring")}
              </button>
              <button
                onClick={() => setShowZodiacRing((v) => !v)}
                style={buttonStyle}
              >
                ♈ {settings.language === "ar"
                  ? (showZodiacRing ? "إخفاء الأبراج" : "إظهار الأبراج")
                  : (showZodiacRing ? "Hide Zodiac" : "Show Zodiac")}
              </button>
              <button
                onClick={() => setShowWeekDaysRing((v) => !v)}
                style={buttonStyle}
              >
                📅 {settings.language === "ar"
                  ? (showWeekDaysRing ? "إخفاء أيام الأسبوع" : "إظهار أيام الأسبوع")
                  : (showWeekDaysRing ? "Hide Week Days" : "Show Week Days")}
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
                  min={0}
                  step="0.01"
                  value={settings.startValue}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      startValue: parseFloat(e.target.value) || 0,
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
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
                <label>
                  <input type="checkbox" checked={showAngleWheel} onChange={() => setShowAngleWheel(!showAngleWheel)} />
                  🧲 {settings.language === "ar" ? "إظهار عجلة الزوايا" : "Show Angle Wheel"}
                </label>
                {showAngleWheel && (
                  <>
                    <label>
                      <input type="checkbox" checked={showAngleWheelAngles} onChange={() => setShowAngleWheelAngles(!showAngleWheelAngles)} />
                      📊 {settings.language === "ar" ? "إظهار زوايا عجلة الزوايا" : "Show Angle Wheel Numbers"}
                    </label>
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
              {/* اختيار الأشكال الهندسية */}
              <div style={{ margin: "0px", textAlign: "center", marginBottom: "2px", paddingBottom: "0px" }}>
                <label style={{ fontWeight: "bold", marginBottom: "2px", display: "block" }}>
                  اختيار الأشكال الهندسية:
                </label>
                <select
                  value={selectedShape}
                  onChange={(e) => {
                    console.log("Shape selected:", e.target.value);
                    setSelectedShape(e.target.value);
                  }}
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
                  <option value="star3">⭐ النجمة الثلاثية</option>
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
                  <option value="star12">⭐ النجمة الإثني عشرية </option>
                  <option value="anglewheel">🧲 إظهار عجلة الزوايا</option>
                  <option value="circles">🟡 إظهار الدوائر المتداخلة</option>
                </select>
              </div>
              {/* ✅ أدوات المثلث */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>

  {selectedShape === "triangle" && (
    <>
      <label>
        🎛 {settings.language === "ar" ? "زوايا المثلث" : "Triangle Angles"}
      </label>
{customAngles.map((angle, idx) => {
  const rotated = (angle + triangleRotation + settings.rotation - 90) % 360;

  return (
    <input
      key={idx}
      type="number"
      value={rotated.toFixed(0)}
      onChange={(e) => {
        const newRotated = parseFloat(e.target.value) || 0;
        const newOriginal = (newRotated - triangleRotation - settings.rotation + 90 + 360) % 360;

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

{/* ⭐ أدوات النجمة الثلاثية */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
  {selectedShape === "star3" && (
    <>
      <label>
        🎛 {settings.language === "ar" ? "زوايا النجمة الثلاثية" : "Star3 Angles"}
      </label>
      {customStar3Angles.map((angle, idx) => {
        const rotated = (angle + star3Rotation + settings.rotation - 90) % 360;
        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - star3Rotation - settings.rotation + 90 + 360) % 360;
              const newAngles = [...customStar3Angles];
              newAngles[idx] = newOriginal;
              setCustomStar3Angles(newAngles);
            }}
            style={{ ...inputStyle, marginBottom: "6px", direction: "ltr", textAlign: "center" }}
          />
        );
      })}
      
      <label>♻️ تدوير</label>
      <input
        type="range"
        min="0"
        max="360"
        value={star3Rotation}
        onChange={(e) => setStar3Rotation(parseFloat(e.target.value))}
      />

      <label>
        <input type="checkbox" checked={fillStar3} onChange={() => setFillStar3(!fillStar3)} />
        {settings.language === "ar" ? "تعبئة النجمة" : "Fill Star"}
      </label>

      <label>
        <input type="checkbox" checked={highlightStar3} onChange={() => setHighlightStar3(!highlightStar3)} />
        {settings.language === "ar" ? "تمييز الرؤوس" : "Highlight"}
      </label>

      <label>
        <input type="checkbox" checked={showStar3Angles} onChange={() => setShowStar3Angles(!showStar3Angles)} />
        عرض الزوايا
      </label>

      
    </>
  )}
</div>

{/* 🟥 أدوات المربع */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>

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
        <input type="checkbox" checked={showSquareAngles} onChange={() => setShowSquareAngles(!showSquareAngles)} />
        {settings.language === "ar" ? "إظهار الزوايا" : "Show Angles"}
      </label>

      <label>
        <input type="checkbox" checked={fillSquare} onChange={() => setFillSquare(!fillSquare)} />
        {settings.language === "ar" ? "تعبئة المربع" : "Fill Square"}
      </label>
    </>
  )}
</div>

{/* ⭐ أدوات النجمة الرباعية */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>

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
      <label>
        <input type="checkbox" checked={showStar4Angles} onChange={() => setShowStar4Angles(!showStar4Angles)} />
        {settings.language === "ar" ? "إظهار الزوايا" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* 🔷 أدوات الشكل الخماسي */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
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
      <label>
        <input type="checkbox" checked={showPentagonAngles} onChange={() => setShowPentagonAngles(!showPentagonAngles)} />
        {settings.language === "ar" ? "إظهار الزوايا" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* ⭐ أدوات النجمة الخماسية */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
  {selectedShape === "star5" && (
    <>
      {customPentagonAngles.map((angle, idx) => {
        const rotated = (angle + star5Rotation + settings.rotation) % 360;
        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - star5Rotation - settings.rotation + 360) % 360;
              const newAngles = [...customPentagonAngles];
              newAngles[idx] = newOriginal;
              setCustomPentagonAngles(newAngles);
            }}
            style={{ ...inputStyle, marginBottom: "6px" }}
          />
        );
      })}
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={star5Rotation}
        onChange={(e) => setStar5Rotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillStar5} onChange={() => setFillStar5(!fillStar5)} /> تعبئة</label>
      <label><input type="checkbox" checked={highlightStar5} onChange={() => setHighlightStar5(!highlightStar5)} /> تمييز</label>
      <label><input type="checkbox" checked={showStar5Angles} onChange={() => setShowStar5Angles(!showStar5Angles)} /> عرض الزوايا</label>
    </>
  )}
</div>

{/* 🔷 أدوات الشكل السداسي */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
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
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
 {selectedShape === "star6" && (
    <>
      <label>
        🎛 {settings.language === "ar" ? "زوايا النجمة السداسية" : "Hexagram Angles"}
      </label>
      {[0, 60, 120, 180, 240, 300].map((angle, idx) => {
        const rotated = (angle + star6Rotation + settings.rotation) % 360;
        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - star6Rotation - settings.rotation + 360) % 360;
              // للنجمة السداسية نحتاج إلى حساب الدوران المناسب
              const angleDiff = newOriginal - angle;
              setStar6Rotation((star6Rotation + angleDiff + 360) % 360);
            }}
            style={{ ...inputStyle, marginBottom: "6px", direction: "ltr", textAlign: "center" }}
          />
        );
      })}
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={star6Rotation}
        onChange={(e) => setStar6Rotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillStar6} onChange={() => setFillStar6(!fillStar6)} /> تعبئة</label>
      <label><input type="checkbox" checked={highlightStar6} onChange={() => setHighlightStar6(!highlightStar6)} /> تمييز</label>
      <label><input type="checkbox" checked={showStar6Angles} onChange={() => setShowStar6Angles(!showStar6Angles)} /> عرض الزوايا</label>
    </>
  )}
</div>

{/* 🔷 أدوات الشكل السباعي */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
  {selectedShape === "heptagon" && (
    <>
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={heptagonRotation}
        onChange={(e) => setHeptagonRotation(parseFloat(e.target.value))} />

      <label>
        <input type="checkbox" checked={fillHeptagon} onChange={() => setFillHeptagon(!fillHeptagon)} />
        {settings.language === "ar" ? "تعبئة الشكل" : "Fill"}
      </label>

      <label>
        <input type="checkbox" checked={highlightHeptagon} onChange={() => setHighlightHeptagon(!highlightHeptagon)} />
        {settings.language === "ar" ? "تمييز الرؤوس" : "Highlight"}
      </label>

      <label>
        <input type="checkbox" checked={showHeptagonAngles} onChange={() => setShowHeptagonAngles(!showHeptagonAngles)} />
        {settings.language === "ar" ? "إظهار الزوايا" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* ⭐ أدوات النجمة السباعية */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>

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

      <label>
        <input type="checkbox" checked={showStar7Angles} onChange={() => setShowStar7Angles(!showStar7Angles)} />
        {settings.language === "ar" ? "إظهار الزوايا" : "Show Angles"}
      </label>
    </>
  )}
</div>


{/* 🧿 أدوات الشكل المثمن */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
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
      <label>
        <input type="checkbox" checked={showOctagonAngles} onChange={() => setShowOctagonAngles(!showOctagonAngles)} />
        {settings.language === "ar" ? "إظهار الزوايا" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* ⭐ أدوات النجمة المثمنة */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
 {selectedShape === "star8" && (
    <>
      {customOctagonAngles.map((angle, idx) => {
        const rotated = (angle + star8Rotation + settings.rotation) % 360;
        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - star8Rotation - settings.rotation + 360) % 360;
              const newAngles = [...customOctagonAngles];
              newAngles[idx] = newOriginal;
              setCustomOctagonAngles(newAngles);
            }}
            style={{ ...inputStyle, marginBottom: "6px" }}
          />
        );
      })}
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={star8Rotation}
        onChange={(e) => setStar8Rotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillStar8} onChange={() => setFillStar8(!fillStar8)} /> تعبئة</label>
      <label><input type="checkbox" checked={highlightStar8} onChange={() => setHighlightStar8(!highlightStar8)} /> تمييز</label>
      <label>
        <input type="checkbox" checked={showStar8Angles} onChange={() => setShowStar8Angles(!showStar8Angles)} />
        {settings.language === "ar" ? "إظهار الزوايا" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* 🔷 أدوات الشكل التساعي */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
  {selectedShape === "nonagon" && (
    <>
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={nonagonRotation}
        onChange={(e) => setNonagonRotation(parseFloat(e.target.value))} />

      <label>
        <input type="checkbox" checked={fillNonagon} onChange={() => setFillNonagon(!fillNonagon)} />
        {settings.language === "ar" ? "تعبئة الشكل" : "Fill"}
      </label>

      <label>
        <input type="checkbox" checked={highlightNonagon} onChange={() => setHighlightNonagon(!highlightNonagon)} />
        {settings.language === "ar" ? "تمييز الرؤوس" : "Highlight"}
      </label>

      <label>
        <input type="checkbox" checked={showNonagonAngles} onChange={() => setShowNonagonAngles(!showNonagonAngles)} />
        {settings.language === "ar" ? "إظهار الزوايا" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* ⭐ أدوات النجمة التساعية */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>

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
        {settings.language === "ar" ? "تمييز الرؤوس" : "Highlight Points"}
      </label>

      <label>
        <input type="checkbox" checked={showStar9Angles} onChange={() => setShowStar9Angles(!showStar9Angles)} />
        {settings.language === "ar" ? "إظهار الزوايا" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* 🔷 أدوات الشكل العشاري */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
  {selectedShape === "decagon" && (
    <>
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={decagonRotation}
        onChange={(e) => setDecagonRotation(parseFloat(e.target.value))} />

      <label>
        <input type="checkbox" checked={fillDecagon} onChange={() => setFillDecagon(!fillDecagon)} />
        {settings.language === "ar" ? "تعبئة الشكل" : "Fill"}
      </label>

      <label>
        <input type="checkbox" checked={highlightDecagon} onChange={() => setHighlightDecagon(!highlightDecagon)} />
        {settings.language === "ar" ? "تمييز الرؤوس" : "Highlight"}
      </label>

      <label>
        <input type="checkbox" checked={showDecagonAngles} onChange={() => setShowDecagonAngles(!showDecagonAngles)} />
        {settings.language === "ar" ? "إظهار الزوايا" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* ⭐ أدوات النجمة العشارية */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>

  {selectedShape === "star10" && (
    <>
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={star10Rotation}
        onChange={(e) => setStar10Rotation(parseFloat(e.target.value))} />

      <label>
        <input type="checkbox" checked={fillStar10} onChange={() => setFillStar10(!fillStar10)} />
        {settings.language === "ar" ? "تعبئة" : "Fill"}
      </label>

      <label>
        <input type="checkbox" checked={highlightStar10} onChange={() => setHighlightStar10(!highlightStar10)} />
        {settings.language === "ar" ? "تمييز الرؤوس" : "Highlight Points"}
      </label>

      <label>
        <input type="checkbox" checked={showStar10Angles} onChange={() => setShowStar10Angles(!showStar10Angles)} />
        {settings.language === "ar" ? "إظهار الزوايا" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* 🔷 أدوات الشكل الحادي عشر */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
  {selectedShape === "eleven" && (
    <>
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={hendecagonRotation}
        onChange={(e) => setHendecagonRotation(parseFloat(e.target.value))} />

      <label>
        <input type="checkbox" checked={fillHendecagon} onChange={() => setFillHendecagon(!fillHendecagon)} />
        {settings.language === "ar" ? "تعبئة الشكل" : "Fill"}
      </label>

      <label>
        <input type="checkbox" checked={highlightHendecagon} onChange={() => setHighlightHendecagon(!highlightHendecagon)} />
        {settings.language === "ar" ? "تمييز الرؤوس" : "Highlight"}
      </label>

      <label>
        <input type="checkbox" checked={showHendecagonAngles} onChange={() => setShowHendecagonAngles(!showHendecagonAngles)} />
        {settings.language === "ar" ? "إظهار الزوايا" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* ⭐ أدوات النجمة الحادية عشر */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>

  {selectedShape === "star11" && (
    <>
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={star11Rotation}
        onChange={(e) => setStar11Rotation(parseFloat(e.target.value))} />

      <label>
        <input type="checkbox" checked={fillStar11} onChange={() => setFillStar11(!fillStar11)} />
        {settings.language === "ar" ? "تعبئة" : "Fill"}
      </label>

      <label>
        <input type="checkbox" checked={highlightStar11} onChange={() => setHighlightStar11(!highlightStar11)} />
        {settings.language === "ar" ? "تمييز الرؤوس" : "Highlight Points"}
      </label>

      <label>
        <input type="checkbox" checked={showStar11Angles} onChange={() => setShowStar11Angles(!showStar11Angles)} />
        {settings.language === "ar" ? "إظهار الزوايا" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* 🔷 أدوات الشكل الاثني عشر */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
  {selectedShape === "twelve" && (
    <>
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={dodecagonRotation}
        onChange={(e) => setDodecagonRotation(parseFloat(e.target.value))} />

      <label>
        <input type="checkbox" checked={fillDodecagon} onChange={() => setFillDodecagon(!fillDodecagon)} />
        {settings.language === "ar" ? "تعبئة الشكل" : "Fill"}
      </label>

      <label>
        <input type="checkbox" checked={highlightDodecagon} onChange={() => setHighlightDodecagon(!highlightDodecagon)} />
        {settings.language === "ar" ? "تمييز الرؤوس" : "Highlight"}
      </label>

      <label>
        <input type="checkbox" checked={showDodecagonAngles} onChange={() => setShowDodecagonAngles(!showDodecagonAngles)} />
        {settings.language === "ar" ? "إظهار الزوايا" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* ⭐ أدوات النجمة الاثني عشرية */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>

  {selectedShape === "star12" && (
    <>
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={star12Rotation}
        onChange={(e) => setStar12Rotation(parseFloat(e.target.value))} />

      <label>
        <input type="checkbox" checked={fillStar12} onChange={() => setFillStar12(!fillStar12)} />
        {settings.language === "ar" ? "تعبئة" : "Fill"}
      </label>

      <label>
        <input type="checkbox" checked={highlightStar12} onChange={() => setHighlightStar12(!highlightStar12)} />
        {settings.language === "ar" ? "تمييز الرؤوس" : "Highlight Points"}
      </label>

      <label>
        <input type="checkbox" checked={showStar12Angles} onChange={() => setShowStar12Angles(!showStar12Angles)} />
        {settings.language === "ar" ? "إظهار الزوايا" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* ⭐ أدوات النجمة الخماسيه */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
 {selectedShape === "star5" && (
    <>
      {customPentagonAngles.map((angle, idx) => {
        const rotated = (angle + star5Rotation + settings.rotation) % 360;
        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - star5Rotation - settings.rotation + 360) % 360;
              const newAngles = [...customPentagonAngles];
              newAngles[idx] = newOriginal;
              setCustomPentagonAngles(newAngles);
            }}
            style={{ ...inputStyle, marginBottom: "6px" }}
          />
        );
      })}
      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={star5Rotation}
        onChange={(e) => setStar5Rotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillStar5} onChange={() => setFillStar5(!fillStar5)} /> تعبئة</label>
      <label><input type="checkbox" checked={highlightStar5} onChange={() => setHighlightStar5(!highlightStar5)} /> تمييز</label>
      <label><input type="checkbox" checked={showStar5Angles} onChange={() => setShowStar5Angles(!showStar5Angles)} /> عرض الزوايا</label>
    </>
  )}
</div>

{/* 🔷 أدوات الشكل السداسي */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
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
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
 {selectedShape === "star6" && (
    <>
      {customHexagonAngles.map((angle, idx) => {
        const rotated = (angle + star6Rotation + settings.rotation) % 360;
        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - star6Rotation - settings.rotation + 360) % 360;
              const newAngles = [...customHexagonAngles];
              newAngles[idx] = newOriginal;
              setCustomHexagonAngles(newAngles);
            }}
            style={{ ...inputStyle, marginBottom: "6px" }}
          />
        );
      })}

      <label>♻️ تدوير</label>
      <input type="range" min="0" max="360" value={star6Rotation}
        onChange={(e) => setStar6Rotation(parseFloat(e.target.value))} />

      <label><input type="checkbox" checked={fillStar6} onChange={() => setFillStar6(!fillStar6)} /> تعبئة</label>
      <label><input type="checkbox" checked={highlightStar6} onChange={() => setHighlightStar6(!highlightStar6)} /> تمييز</label>
    </>
  )}
</div>


{/* 🔷 أدوات الشكل الحادي عشر */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>

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

{/* 🔷 أدوات الشكل الاثني عشر */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>

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

{/* 🟡 الدوائر المتداخلة */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
  <label>
    <input
      type="checkbox"
      checked={showNestedCircles}
      onChange={() => setShowNestedCircles(!showNestedCircles)}
    />
    {settings.language === "ar" ? "عرض الدوائر المتداخلة" : "Show Nested Circles"}
  </label>
  
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
      {/* ✅ Canvas الدائرة */}
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