import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import MarketDataProvider, { useMarketData } from '../MarketData/MarketDataProvider';
import MarketSelector from '../MarketData/MarketSelector';
import TechnicalAnalysisPanel from '../MarketData/TechnicalAnalysisPanel';
import MarketDataSettings from '../MarketData/MarketDataSettings';
import TradingControlPanel from '../MarketData/TradingControlPanel';
import { availableShapes, renderSelectedShapes } from './GeometricShapes';
import MultiTimeframeConsensus from './MultiTimeframeConsensus';
import './GannMarketStyles.css';
import './GannMarketInteractionFix.css';

// بيانات الأبراج والعناصر
const zodiacBase = [
  { label: "نار الحمل", color: "red" },
  { label: "تراب الثور", color: "blue" },
  { label: "هواء الجوزاء", color: "black" },
  { label: "ماء السرطان", color: "red" },
  { label: "نار الأسد", color: "blue" },
  { label: "تراب العذراء", color: "black" },
  { label: "هواء الميزان", color: "red" },
  { label: "ماء العقرب", color: "blue" },
  { label: "نار القوس", color: "black" },
  { label: "تراب الجدي", color: "red" },
  { label: "هواء الدلو", color: "blue" },
  { label: "ماء الحوت", color: "black" },
];

// توليد 36 خلية (3 دورات)
const zodiacRing = [...zodiacBase, ...zodiacBase, ...zodiacBase];

// بيانات أيام الأسبوع
const weekDaysBase = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

// دالة مساعدة لتطبيق throttle
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// الإعدادات الافتراضية
const getDefaultSettings = () => ({
  divisions: 36, // يمكن زيادتها إلى 1000
  levels: 8,
  startValue: 1,
  language: "ar",
  rotation: 0,
  showDegreeRing: true,
});

const GannCircle360Content = React.forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastUpdateTime = useRef(0);
  
  // استخدام MarketData context
  const { 
    marketData, 
    priceMovements, 
    addMarketWatch, 
    removeMarketWatch,
    selectedMarkets = [],
    analysisSettings
  } = useMarketData();

  // حالات التحكم في الميزات
  const [showMarketSelector, setShowMarketSelector] = useState(false);
  const [showTechnicalAnalysis, setShowTechnicalAnalysis] = useState(false);
  const [showMarketSettings, setShowMarketSettings] = useState(false);
  const [showTradingControlPanel, setShowTradingControlPanel] = useState(false);
  const [showMarketOverlay, setShowMarketOverlay] = useState(false);
  const [priceBasedColoring, setPriceBasedColoring] = useState(true); // تفعيل التلوين افتراضياً
  const [showConsensusPanel, setShowConsensusPanel] = useState(true); // إظهار لوحة الإجماع

  // إعدادات التحليل الفني
  const [gannIntegrationMode, setGannIntegrationMode] = useState('price');
  const [autoUpdateAnalysis, setAutoUpdateAnalysis] = useState(true);
  
  // إعدادات نقاط الانعكاس
  const [reversalSensitivity, setReversalSensitivity] = useState('medium'); // low, medium, high
  const [showOnlyStrongReversals, setShowOnlyStrongReversals] = useState(false);
  const [maxReversalPoints, setMaxReversalPoints] = useState(12); // حد أقصى لنقاط الانعكاس المعروضة

  // إعدادات دائرة جان
  const [settings, setSettings] = useState(getDefaultSettings);
  const [level, setLevel] = useState(8);
  const [selectedMarket, setSelectedMarket] = useState('');
  const [startingNumber, setStartingNumber] = useState(1.0);
  const [step, setStep] = useState(1);
  const [decimalStep, setDecimalStep] = useState(0.01); // خطوة الأرقام العشرية
  const [showTwoDecimals, setShowTwoDecimals] = useState(true); // عرض رقمين بعد الفاصلة دائماً
  const [cellBorderColor, setCellBorderColor] = useState('#D3D3D3'); // لون حدود الخلايا
  const [showNumbers, setShowNumbers] = useState(true);
  const [showLevels, setShowLevels] = useState(true);
  const showReducedNumbers = true; // ثابت دائماً
  const [clickCount, setClickCount] = useState(0);
  const [cellClickCounts, setCellClickCounts] = useState({}); // لتتبع نقرات كل خلية
  const [lastClickTime, setLastClickTime] = useState(0); // لتتبع وقت آخر نقرة للدبل كليك
  const [clickedCellKey, setClickedCellKey] = useState(null); // لتتبع الخلية المنقورة

  // حالات الحلقات الخارجية
  const [showDegreeRing, setShowDegreeRing] = useState(true);
  const [showZodiacRing, setShowZodiacRing] = useState(true); // تفعيل حلقة الأبراج لتظهر
  const [showWeekDaysRing, setShowWeekDaysRing] = useState(true); // تفعيل حلقة الأيام لتظهر
  const [showAngleWheel, setShowAngleWheel] = useState(false);

  // الزوايا والدوران
  const [angleWheelRotation, setAngleWheelRotation] = useState(0);
  const [angleStepRad, setAngleStepRad] = useState(10);
  const [showAngleWheelAngles, setShowAngleWheelAngles] = useState(true);
  const [rayColor, setRayColor] = useState('#FFD700');
  const [rayWidth, setRayWidth] = useState(2);

  // إعدادات الزوم
  const [zoomLevel, setZoomLevel] = useState(1);
  const minZoom = 0.5;
  const maxZoom = 3;

  // إعدادات الأداء
  const performanceSettings = useMemo(() => ({
    throttleDelay: 60, // 60 FPS
    maxCacheSize: 1000,
    enableCaching: true,
    enableOptimizations: true
  }), []);

  // cache للألوان المحسوبة
  const [colorCache, setColorCache] = useState(new Map());
  const [lastMarketUpdate, setLastMarketUpdate] = useState(0);

  // دالة تحديث خصائص الأشكال (تم نقلها هنا لحل مشكلة initialization order)
  const updateShapeProperty = useCallback((shapeId, property, value) => {
    setShapeProperties(prev => ({
      ...prev,
      [shapeId]: {
        ...prev[shapeId],
        [property]: value
      }
    }));
  }, []);

  // إعدادات الأشكال الهندسية
  const [selectedShapes, setSelectedShapes] = useState([]);
  const [shapeProperties, setShapeProperties] = useState({});
  const [showShapeDropdown, setShowShapeDropdown] = useState(false);
  
  // إعدادات التدوير بالماوس
  const [isDragging, setIsDragging] = useState(false);
  const [dragState, setDragState] = useState({
    shapeId: null,
    type: null,
    vertexIndex: null,
    initialAngle: 0,
    centerX: 0,
    centerY: 0,
    previousAnglesState: null // لحفظ حالة الزوايا قبل التدوير
  });

  // دوال الحسابات الأساسية
  const reduceToDigit = (num) => {
    let numStr = num.toString().replace('.', '');
    let current = numStr
      .split("")
      .reduce((a, b) => a + Number(b), 0);
    
    while (current > 9) {
      current = current
        .toString()
        .split("")
        .reduce((a, b) => a + Number(b), 0);
    }
    return current;
  };

  // دالة حساب نصف القطر الديناميكي
  // دالة حساب maxRadius (تم نقلها بعد تعريف المتغيرات)

  // دالة حساب المسافة بين نقطتين
  const getDistance = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  // دالة حساب الزاوية بين نقطتين
  const getAngle = (centerX, centerY, pointX, pointY) => {
    return Math.atan2(pointY - centerY, pointX - centerX) * 180 / Math.PI;
  };

  // دالة للعثور على رأس زاوية قريب من موضع الماوس
  const findNearbyVertex = (mouseX, mouseY, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const canvasX = mouseX - rect.left;
    const canvasY = mouseY - rect.top;
    
    // تحويل إحداثيات الماوس إلى إحداثيات الكانفاس المقيسة
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const availableRadius = Math.min(canvas.width, canvas.height) / 2 - 20;
    const maxRadius = getMaxRadius();
    const baseScale = Math.min(1, availableRadius / maxRadius);
    const scale = baseScale * zoomLevel;
    const finalScale = Math.min(scale, availableRadius / maxRadius);
    
    const scaledMouseX = canvasX / finalScale;
    const scaledMouseY = canvasY / finalScale;
    const scaledCenterX = centerX / finalScale;
    const scaledCenterY = centerY / finalScale;
    
    const currentDegreeRingRadius = lastNumberRingRadius + 12;
    const shapeRadius = currentDegreeRingRadius - 50;
    
    // البحث في كل شكل مختار
    for (const shapeId of selectedShapes) {
      const shape = availableShapes.find(s => s.id === shapeId);
      const props = shapeProperties[shapeId];
      
      if (!shape || !props?.visible) continue;
      
      // حساب عدد الرؤوس للشكل
      let vertexCount = 0;
      if (shape.type === 'polygon') {
        vertexCount = shape.sides;
      } else if (shape.type === 'star') {
        vertexCount = shape.points || shape.sides;
      }
      
      // حساب مواضع الرؤوس
      for (let i = 0; i < vertexCount; i++) {
        let angle = 0;
        if (shape.type === 'polygon') {
          angle = (i * 360 / vertexCount + (props.rotation || 0) + settings.rotation - 90) * Math.PI / 180;
        } else if (shape.type === 'star') {
          angle = (i * 360 / vertexCount + (props.rotation || 0) + settings.rotation - 90) * Math.PI / 180;
        }
        
        const vertexX = scaledCenterX + shapeRadius * Math.cos(angle);
        const vertexY = scaledCenterY + shapeRadius * Math.sin(angle);
        
        // التحقق من القرب (مسافة 15 بكسل)
        const distance = getDistance(scaledMouseX, scaledMouseY, vertexX, vertexY);
        if (distance <= 15) {
          return {
            shapeId,
            vertexIndex: i,
            centerX: scaledCenterX,
            centerY: scaledCenterY,
            type: 'shape'
          };
        }
      }
    }
    
    // البحث في رؤوس عجلة الزوايا إذا كانت مفعلة
    if (showAngleWheel) {
      const stepDegrees = angleStepRad;
      const totalCells = 360 / stepDegrees;
      const angleWheelRadius = (angleWheelInnerRadius + angleWheelOuterRadius) / 2;
      
      for (let i = 0; i < totalCells; i++) {
        const angleDeg = -90 + angleWheelRotation + i * stepDegrees;
        const angleRad = (angleDeg * Math.PI) / 180;
        
        const vertexX = scaledCenterX + angleWheelRadius * Math.cos(angleRad);
        const vertexY = scaledCenterY + angleWheelRadius * Math.sin(angleRad);
        
        // التحقق من القرب (مسافة 15 بكسل)
        const distance = getDistance(scaledMouseX, scaledMouseY, vertexX, vertexY);
        if (distance <= 15) {
          return {
            shapeId: 'angleWheel',
            vertexIndex: i,
            centerX: scaledCenterX,
            centerY: scaledCenterY,
            type: 'angleWheel'
          };
        }
      }
    }
    
    return null;
  };

  // دالة للحصول على الخلية المنقورة من إحداثيات الماوس
  const getCellFromMouse = (mouseX, mouseY, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const canvasX = mouseX - rect.left;
    const canvasY = mouseY - rect.top;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const availableRadius = Math.min(canvas.width, canvas.height) / 2 - 20;
    const maxRadius = getMaxRadius();
    const baseScale = Math.min(1, availableRadius / maxRadius);
    const scale = baseScale * zoomLevel;
    const finalScale = Math.min(scale, availableRadius / maxRadius);
    
    const scaledMouseX = canvasX / finalScale;
    const scaledMouseY = canvasY / finalScale;
    const scaledCenterX = centerX / finalScale;
    const scaledCenterY = centerY / finalScale;
    
    // حساب المسافة والزاوية من المركز
    const distance = getDistance(scaledCenterX, scaledCenterY, scaledMouseX, scaledMouseY);
    const angle = getAngle(scaledCenterX, scaledCenterY, scaledMouseX, scaledMouseY);
    
    // تحديد المستوى (الحلقة)
    const innerRadius = 20;
    let currentRadius = innerRadius;
    let ringLevel = -1;
    
    for (let level = 0; level < totalLevels; level++) {
      if (level < 2) {
        const dynamicWidth = calculateRingWidth(1);
        currentRadius += dynamicWidth;
        continue;
      }
      
      const maxDigitsInLevel = Math.max(
        ...Array.from({ length: settings.divisions }, (_, i) => {
          const cellValue = getCellValue(level, i, ringStartNumbers, startingNumber);
          if (cellValue > 0) {
            return cellValue.toString().length;
          }
          return 1;
        })
      );
      const ringWidth = calculateRingWidth(maxDigitsInLevel);
      const outerRadius = currentRadius + ringWidth;
      
      if (distance >= currentRadius && distance <= outerRadius) {
        ringLevel = level;
        break;
      }
      
      currentRadius = outerRadius;
    }
    
    if (ringLevel < 2) return null; // الحلقتان الأولى والثانية فارغتان
    
    // تحديد القطاع (فهرس الخلية)
    const adjustedAngle = (angle + 96 - settings.rotation + 360) % 360;
    const normalizedAngle = (adjustedAngle - 10 + 360) % 360;
    const cellIndex = Math.floor(normalizedAngle / (360 / settings.divisions));
    
    return {
      level: ringLevel,
      index: cellIndex,
      cellKey: `${ringLevel}_${cellIndex}`
    };
  };

  const calculateRingStartNumbers = (startValue, levels, divisions) => {
    let ringStartNumbers = [];
    
    if (divisions === 0) {
      return ringStartNumbers;
    }
    
    ringStartNumbers[0] = null;
    ringStartNumbers[1] = null;
    ringStartNumbers[2] = null; // الحلقة الثانية فارغة الآن
    
    // نظام الترقيم المتتالي الصحيح لدائرة جان مع دعم الأرقام العشرية - يبدأ من الحلقة الثالثة
    for (let level = 3; level < levels; level++) { // تغيير من 2 إلى 3
      if (level === 3) { // تغيير من 2 إلى 3
        // الحلقة الثالثة تبدأ من القيمة المحددة من المستخدم
        ringStartNumbers[level] = startValue;
        console.log(`Ring level ${level} starts with:`, startValue);
      } else {
        // للأرقام العشرية: كل حلقة تبدأ من آخر رقم في الحلقة السابقة + خطوة مناسبة
        if (startValue % 1 !== 0) {
          // للأرقام العشرية: نحسب آخر قيمة في الحلقة السابقة
          const previousRingStart = ringStartNumbers[level - 1];
          const lastValueInPreviousRing = previousRingStart + ((divisions - 1) * decimalStep);
          ringStartNumbers[level] = parseFloat((lastValueInPreviousRing + decimalStep).toFixed(2));
        } else {
          // للأرقام الصحيحة: النظام العادي مع step
          const previousRingStart = ringStartNumbers[level - 1];
          const previousRingEnd = previousRingStart + ((divisions - 1) * step);
          ringStartNumbers[level] = previousRingEnd + step;
        }
      }
    }
    
    return ringStartNumbers;
  };

  const getCellValue = (level, index, ringStartNumbers, startValue) => {
    if (level < 3 || !ringStartNumbers[level]) return ""; // تغيير من 2 إلى 3
    
    // إضافة تسجيل للخلية الأولى من الحلقة الثالثة
    if (level === 3 && index === 0) {
      console.log(`First cell of third ring - level: ${level}, index: ${index}, ringStartNumbers[${level}]: ${ringStartNumbers[level]}, startValue: ${startValue}`);
    }
    
    // إذا كانت القيمة الأساسية عشرية، نحسب التسلسل بخطوة قابلة للتخصيص
    if (startValue % 1 !== 0) {
      // للأرقام العشرية: نبدأ من القيمة الأساسية ونضيف index * decimalStep
      const baseValue = ringStartNumbers[level];
      const cellValue = baseValue + (index * decimalStep);
      // ضمان عرض رقمين بعد الفاصلة العشرية دائماً
      const finalValue = parseFloat(cellValue.toFixed(2));
      
      // تسجيل للخلية الأولى من الحلقة الثالثة
      if (level === 3 && index === 0) {
        console.log(`Decimal calculation - baseValue: ${baseValue}, cellValue: ${cellValue}, finalValue: ${finalValue}`);
      }
      
      return finalValue;
    } else {
      // للأرقام الصحيحة: الترقيم المتتالي العادي باستخدام step
      const cellValue = ringStartNumbers[level] + (index * step);
      
      // تسجيل للخلية الأولى من الحلقة الثالثة
      if (level === 3 && index === 0) {
        console.log(`Integer calculation - ringStartNumbers[${level}]: ${ringStartNumbers[level]}, step: ${step}, cellValue: ${cellValue}`);
      }
      
      // إذا كان المستخدم أدخل رقم صحيح لكنه يريد عرض عشري، نضيف .00
      return cellValue;
    }
  };

  const calculateRingWidth = (maxDigits) => {
    const baseWidth = 60; // زيادة العرض الأساسي بشكل كبير
    const digitScale = 22; // زيادة مقياس الرقم بشكل كبير
    const minCellPadding = 20; // زيادة الحشو بشكل كبير
    const maxDigitThreshold = 4; // تقليل العتبة لبدء الزيادة مبكراً جداً
    
    // إضافة مضاعف كبير للأرقام الكبيرة جداً
    let extraScale = 1;
    if (maxDigits > maxDigitThreshold) {
      extraScale = 1 + (maxDigits - maxDigitThreshold) * 0.5; // زيادة أكبر بكثير
    }
    
    // إضافة مضاعف إضافي كبير للأرقام الطويلة جداً (أكثر من 6 أرقام)
    if (maxDigits > 6) {
      extraScale += (maxDigits - 6) * 0.4; // مضاعف إضافي كبير
    }
    
    // مضاعف خاص للأرقام الطويلة جداً (أكثر من 10 أرقام)
    if (maxDigits > 10) {
      extraScale += (maxDigits - 10) * 0.5; // مضاعف إضافي كبير جداً
    }
    
    const calculatedWidth = Math.max(baseWidth, maxDigits * digitScale * extraScale + minCellPadding);
    
    // ضمان حد أدنى وأقصى منطقي مع زيادة الحد الأقصى أكثر
    return Math.min(Math.max(calculatedWidth, 40), 400);
  };

  // حسابات الأبعاد
  const innerRadius = 20;
  const totalLevels = level + 2; // استخدام القيمة المدخلة من المستخدم مباشرة
  const ringStartNumbers = calculateRingStartNumbers(startingNumber, totalLevels, settings.divisions);
  
  let calculatedLastRadius = innerRadius;
  for (let level = 0; level < totalLevels; level++) {
    if (settings.divisions === 0) break;
    
    // حساب أقصى عدد أرقام في هذا المستوى مع مراعاة الأرقام الكبيرة والعشرية
    const maxDigitsInLevel = Math.max(
      ...Array.from({ length: settings.divisions }, (_, i) => {
        const cellValue = getCellValue(level, i, ringStartNumbers, startingNumber);
        if (cellValue > 0) {
          // للأرقام العشرية، نحسب الطول مع التحكم في العرض
          let cellValueStr;
          if (typeof cellValue === 'number' && startingNumber % 1 !== 0 && showTwoDecimals) {
            cellValueStr = cellValue.toFixed(2);
          } else if (typeof cellValue === 'number' && startingNumber % 1 !== 0) {
            cellValueStr = parseFloat(cellValue.toFixed(2)).toString();
          } else {
            cellValueStr = cellValue.toString();
          }
          
          const digitCount = cellValueStr.length;
          
          // تطبيق وزن إضافي للأرقام الطويلة مع تدرج أكثر
          if (digitCount > 12) {
            return digitCount * 1.5; // وزن أكبر للأرقام الطويلة جداً
          } else if (digitCount > 8) {
            return digitCount * 1.3; // وزن متوسط للأرقام الطويلة
          } else if (digitCount > 6) {
            return digitCount * 1.1; // وزن خفيف للأرقام المتوسطة
          } else {
            return digitCount; // لا وزن إضافي للأرقام القصيرة
          }
        }
        return 1;
      })
    );
    const dynamicWidth = calculateRingWidth(maxDigitsInLevel);
    calculatedLastRadius += dynamicWidth;
  }
  const lastNumberRingRadius = calculatedLastRadius;
  
  // مواقع الحلقات الخارجية - تظهر بعد آخر حلقة قطاعات مباشرة مع أحجام ثابتة
  
  // أحجام ثابتة لحلقة الدرجات (تبدأ بعد آخر حلقة قطاعات)
  const degreeRingGap = 8; // مسافة ثابتة من آخر حلقة قطاعات - مقلل للحصول على مظهر متراص
  const degreeRingThickness = 50; // سمك ثابت لحلقة الدرجات - مستقل عن حجم القطاعات (زيادة من 40 إلى 50)
  const degreeRingRadius = lastNumberRingRadius + degreeRingGap;
  
  // أحجام ثابتة لعجلة الزوايا (تبدأ بعد حلقة الدرجات)
  const angleWheelGap = 8; // مسافة ثابتة من حلقة الدرجات - مقلل للحصول على مظهر متراص
  const angleWheelThickness = 50; // سمك ثابت لعجلة الزوايا - مستقل عن حجم القطاعات (زيادة من 40 إلى 50)
  const angleWheelInnerRadius = degreeRingRadius + degreeRingThickness + angleWheelGap;
  const angleWheelOuterRadius = angleWheelInnerRadius + angleWheelThickness;
  
  // أحجام ثابتة لحلقة الأبراج (تبدأ بعد عجلة الزوايا أو حلقة الدرجات)
  const zodiacGap = 8; // مسافة ثابتة من الحلقة السابقة - مقلل للحصول على مظهر متراص
  const zodiacRingThickness = 50; // سمك ثابت لحلقة الأبراج - مستقل عن حجم القطاعات (زيادة من 40 إلى 50)
  const zodiacInnerRadius = showAngleWheel ? 
    (angleWheelOuterRadius + zodiacGap) : 
    (degreeRingRadius + degreeRingThickness + zodiacGap);
  const zodiacOuterRadius = zodiacInnerRadius + zodiacRingThickness;
  
  // أحجام ثابتة لحلقة الأيام (تبدأ بعد حلقة الأبراج)
  const weekDaysGap = 8; // مسافة ثابتة بين حلقة الأبراج والأيام - مقلل للحصول على مظهر متراص
  const weekDaysRingThickness = 50; // سمك ثابت لحلقة الأيام - مستقل عن حجم القطاعات (زيادة من 40 إلى 50)
  const weekDaysInnerRadius = zodiacOuterRadius + weekDaysGap;
  const weekDaysOuterRadius = weekDaysInnerRadius + weekDaysRingThickness;

  // دالة حساب الحجم الديناميكي للدائرة
  const calculateDynamicRadius = () => {
    // نصف القطر الأساسي
    let dynamicRadius = 200;
    
    // إضافة حلقة الأرقام إذا كانت مفعلة
    if (showNumbers) {
      dynamicRadius = Math.max(dynamicRadius, lastNumberRingRadius + 15);
    }
    
    // إضافة حلقة الدرجات إذا كانت مفعلة (بالحجم الثابت)
    if (showDegreeRing) {
      dynamicRadius = Math.max(dynamicRadius, degreeRingRadius + degreeRingThickness + 15);
    }
    
    // إضافة عجلة الزوايا إذا كانت مفعلة (بالحجم الثابت)
    if (showAngleWheel) {
      dynamicRadius = Math.max(dynamicRadius, angleWheelOuterRadius + 15);
    }
    
    // إضافة حلقة الأبراج إذا كانت مفعلة (بالحجم الثابت)
    if (showZodiacRing) {
      dynamicRadius = Math.max(dynamicRadius, zodiacOuterRadius + 15);
    }
    
    // إضافة حلقة الأيام إذا كانت مفعلة (بالحجم الثابت)
    if (showWeekDaysRing) {
      dynamicRadius = Math.max(dynamicRadius, weekDaysOuterRadius + 15);
    }
    
    return dynamicRadius;
  };

  // حساب الحجم الديناميكي
  const dynamicMaxRadius = calculateDynamicRadius();

  // دالة حساب maxRadius
  const getMaxRadius = useCallback(() => {
    // حساب نصف القطر الرئيسي بناءً على الحلقات المفعلة بالأحجام الثابتة
    let mainCircleRadius = lastNumberRingRadius;
    
    if (showDegreeRing) {
      mainCircleRadius = Math.max(mainCircleRadius, degreeRingRadius + degreeRingThickness);
    }
    
    if (showAngleWheel) {
      mainCircleRadius = Math.max(mainCircleRadius, angleWheelOuterRadius);
    }
    
    if (showZodiacRing) {
      mainCircleRadius = Math.max(mainCircleRadius, zodiacOuterRadius);
    }
    
    if (showWeekDaysRing) {
      mainCircleRadius = Math.max(mainCircleRadius, weekDaysOuterRadius);
    }
    
    return Math.max(dynamicMaxRadius, mainCircleRadius);
  }, [dynamicMaxRadius, lastNumberRingRadius, showDegreeRing, showAngleWheel, showZodiacRing, showWeekDaysRing, 
      degreeRingRadius, degreeRingThickness, angleWheelOuterRadius, zodiacOuterRadius, weekDaysOuterRadius]);

  // حساب نصف القطر الرئيسي بناءً على الحلقات المفعلة (بالأحجام الثابتة)
  const maxRadius = getMaxRadius();
  const svgPadding = 30; // تقليل الحشو لتوفير مساحة أكبر للدائرة
  const canvasSize = maxRadius * 2 + svgPadding * 2;

  // معالجات أحداث الماوس للتدوير
  const handleMouseDown = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const vertex = findNearbyVertex(e.clientX, e.clientY, canvas);
    if (vertex) {
      const rect = canvas.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const availableRadius = Math.min(canvas.width, canvas.height) / 2 - 20;
      const maxRadius = getMaxRadius();
      const baseScale = Math.min(1, availableRadius / maxRadius);
      const scale = baseScale * zoomLevel;
      const finalScale = Math.min(scale, availableRadius / maxRadius);
      
      const scaledMouseX = canvasX / finalScale;
      const scaledMouseY = canvasY / finalScale;
      const scaledCenterX = centerX / finalScale;
      const scaledCenterY = centerY / finalScale;
      
      const initialAngle = getAngle(scaledCenterX, scaledCenterY, scaledMouseX, scaledMouseY);
      
      // حفظ حالة الزوايا السابقة قبل التدوير
      let previousAnglesState = null;
      if (vertex.type !== 'angleWheel' && vertex.shapeId) {
        const shape = availableShapes.find(s => s.id === vertex.shapeId);
        const currentProps = shapeProperties[vertex.shapeId];
        if (shape) {
          previousAnglesState = {
            showAngles: currentProps?.showAngles || false,
            showStarAngles: currentProps?.showStarAngles || false,
            shapeType: shape.type
          };
        }
      }
      
      setIsDragging(true);
      setDragState({
        shapeId: vertex.type === 'angleWheel' ? 'angleWheel' : vertex.shapeId,
        type: vertex.type,
        vertexIndex: vertex.vertexIndex,
        initialAngle,
        centerX: scaledCenterX,
        centerY: scaledCenterY,
        previousAnglesState
      });
      
      // تفعيل إظهار الزوايا عند بدء التدوير
      if (vertex.type !== 'angleWheel' && vertex.shapeId) {
        const shape = availableShapes.find(s => s.id === vertex.shapeId);
        if (shape) {
          if (shape.type === 'star') {
            updateShapeProperty(vertex.shapeId, 'showStarAngles', true);
          } else {
            updateShapeProperty(vertex.shapeId, 'showAngles', true);
          }
        }
      }
      
      // تغيير نوع المؤشر
      canvas.style.cursor = 'grabbing';
    }
  }, [findNearbyVertex, getMaxRadius, zoomLevel, lastNumberRingRadius, settings.rotation, updateShapeProperty, availableShapes, shapeProperties]);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    if (isDragging && dragState.shapeId) {
      const rect = canvas.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const availableRadius = Math.min(canvas.width, canvas.height) / 2 - 20;
      const maxRadius = getMaxRadius();
      const baseScale = Math.min(1, availableRadius / maxRadius);
      const scale = baseScale * zoomLevel;
      const finalScale = Math.min(scale, availableRadius / maxRadius);
      
      const scaledMouseX = canvasX / finalScale;
      const scaledMouseY = canvasY / finalScale;
      
      const currentAngle = getAngle(dragState.centerX, dragState.centerY, scaledMouseX, scaledMouseY);
      const angleDifference = currentAngle - dragState.initialAngle;
      
      // تحديث زاوية دوران الشكل أو عجلة الزوايا
      if (dragState.type === 'angleWheel') {
        // تدوير عجلة الزوايا
        setAngleWheelRotation(prev => prev + angleDifference);
      } else {
        // تدوير الشكل العادي
        updateShapeProperty(dragState.shapeId, 'rotation', angleDifference);
      }
    } else {
      // تحقق من وجود رأس قريب لتغيير المؤشر
      const vertex = findNearbyVertex(e.clientX, e.clientY, canvas);
      canvas.style.cursor = vertex ? 'grab' : 'default';
    }
  }, [isDragging, dragState, updateShapeProperty, findNearbyVertex, getMaxRadius, zoomLevel, setAngleWheelRotation]);

  const handleMouseUp = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // استعادة حالة الزوايا السابقة عند انتهاء التدوير
    if (dragState.shapeId && dragState.type !== 'angleWheel' && dragState.previousAnglesState) {
      const { showAngles, showStarAngles, shapeType } = dragState.previousAnglesState;
      
      // استعادة الحالة السابقة للزوايا
      if (shapeType === 'star') {
        updateShapeProperty(dragState.shapeId, 'showStarAngles', showStarAngles);
      } else {
        updateShapeProperty(dragState.shapeId, 'showAngles', showAngles);
      }
    }
    
    setIsDragging(false);
    setDragState({
      shapeId: null,
      type: null,
      vertexIndex: null,
      initialAngle: 0,
      centerX: 0,
      centerY: 0,
      previousAnglesState: null
    });
    
    canvas.style.cursor = 'default';
  }, [dragState, updateShapeProperty]);

  // دالة للتحقق من أن النقر ليس جزءًا من عملية سحب
  const handleCanvasClick = useCallback((e) => {
    // تجنب تنفيذ النقر إذا كان المستخدم يسحب
    if (!isDragging) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // البحث عن الخلية المنقورة
      const clickedCell = getCellFromMouse(e.clientX, e.clientY, canvas);
      
      if (clickedCell) {
        const currentTime = Date.now();
        const timeDiff = currentTime - lastClickTime;
        const isDoubleClick = timeDiff < 300 && clickedCellKey === clickedCell.cellKey;
        
        setLastClickTime(currentTime);
        setClickedCellKey(clickedCell.cellKey);
        
        if (isDoubleClick) {
          // دبل كليك: إعادة تعيين لون الخلية للأصلي
          setCellClickCounts(prev => {
            const newCounts = { ...prev };
            delete newCounts[clickedCell.cellKey];
            return newCounts;
          });
          console.log(`🔄 إعادة تعيين خلية: ${clickedCell.cellKey}`);
        } else {
          // نقرة واحدة: زيادة عداد النقرات + عرض معلومات التطابق السعري
          setCellClickCounts(prev => {
            const currentCount = prev[clickedCell.cellKey] || 0;
            const newCount = currentCount >= 4 ? 1 : currentCount + 1;
            
            // عرض معلومات التطابق السعري إذا كان التلوين مفعل
            if (priceBasedColoring && selectedMarkets.length > 0) {
              showCellPriceMatches(clickedCell);
            }
            
            return {
              ...prev,
              [clickedCell.cellKey]: newCount
            };
          });
        }
        
        // تحديث العداد العام للإجبار على إعادة الرسم
        setClickCount(prev => prev + 1);
      }
    }
  }, [isDragging, getCellFromMouse, lastClickTime, clickedCellKey, priceBasedColoring, selectedMarkets]);

  // دالة حساب موقع السعر في دائرة 360 - منقولة هنا لتجنب مشكلة التهيئة
  const calculatePricePosition = useCallback((price) => {
    if (!price) return { angle: 0, level: 1 };
    
    // تحويل السعر إلى رقم إذا كان نص
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return { angle: 0, level: 1 };

    // منطق محسن لتحويل السعر إلى موقع في الدائرة
    // استخدام نظرية جان للدوائر والمربعات
    
    // خوارزمية محسنة للحصول على زاوية أكثر دقة
    const priceStr = numPrice.toString();
    let angle = 0;
    
    // جمع أرقام السعر مع أوزان مختلفة
    for (let i = 0; i < priceStr.length; i++) {
      const digit = parseInt(priceStr[i]) || 0;
      if (digit > 0) {
        angle += digit * (i + 1) * 9; // ضرب في 9 للحصول على تدرج جيد
      }
    }
    
    // إضافة تأثير الأرقام العشرية
    const decimalPart = numPrice % 1;
    if (decimalPart > 0) {
      angle += decimalPart * 360;
    }
    
    // تطبيق دوران للحصول على زاوية نهائية
    angle = angle % 360;
    
    // تحديد المستوى حسب قيمة السعر بطريقة أكثر ذكاءً
    let levelCalc = 1;
    if (numPrice >= 1000) levelCalc = 5;
    else if (numPrice >= 100) levelCalc = 4;
    else if (numPrice >= 10) levelCalc = 3;
    else if (numPrice >= 1) levelCalc = 2;
    else levelCalc = 1;
    
    return { angle, level: Math.max(1, Math.min(levelCalc, level)) };
  }, [level]);

  // دالة للحصول على عدد الخلايا في المستوى
  const getRingCellCount = useCallback((levelNum) => {
    const counts = [0, 8, 16, 24, 32, 40]; // المستوى 0 غير مستخدم
    return counts[levelNum] || 24;
  }, []);

  // دالة لعرض معلومات التطابق السعري للخلية
  const showCellPriceMatches = useCallback((cellInfo) => {
    const matches = [];
    
    for (let marketKey of selectedMarkets) {
      const movement = priceMovements[marketKey];
      if (movement && movement.price) {
        const position = calculatePricePosition(movement.price);
        
        // حساب المسافة الزاوية
        const cellsInLevel = getRingCellCount(cellInfo.level);
        const cellAngle = (cellInfo.index * 360) / cellsInLevel;
        let angleDiff = Math.abs(position.angle - cellAngle);
        if (angleDiff > 180) angleDiff = 360 - angleDiff;
        
        const levelDiff = Math.abs(position.level - cellInfo.level);
        const totalDistance = angleDiff + (levelDiff * 5);
        
        if (totalDistance <= 25) { // نطاق مرونة أوسع للعرض
          matches.push({
            market: marketKey,
            price: movement.price,
            distance: totalDistance.toFixed(1),
            movement: movement.movement,
            color: movement.color
          });
        }
      }
    }
    
    if (matches.length > 0) {
      console.log(`🎯 تطابقات سعرية للخلية ${cellInfo.cellKey}:`);
      matches.forEach(match => {
        console.log(`  ${match.market}: ${match.price} (مسافة: ${match.distance}°) ${match.movement === 'up' ? '📈' : match.movement === 'down' ? '📉' : '➡️'}`);
      });
    } else {
      console.log(`❌ لا توجد تطابقات سعرية قريبة للخلية ${cellInfo.cellKey}`);
    }
  }, [selectedMarkets, priceMovements, calculatePricePosition, getRingCellCount]);

  // دالة للتحقق من قرب الموقع من خلية معينة - محسنة
  const isPositionNearCell = useCallback((position, cellIndex, cellLevel) => {
    if (position.level !== cellLevel) {
      // السماح بفرق مستوى واحد للمرونة
      const levelDiff = Math.abs(position.level - cellLevel);
      if (levelDiff > 1) return false;
    }
    
    // حساب الزاوية المتوقعة للخلية
    const cellsInLevel = getRingCellCount(cellLevel);
    const cellAngle = (cellIndex * 360) / cellsInLevel;
    
    // التحقق من القرب مع مرونة أكبر
    const tolerance = 15; // زيادة المرونة إلى ±15 درجة
    let angleDiff = Math.abs(position.angle - cellAngle);
    
    // حساب الفرق الدائري (أقصر مسافة زاوية)
    if (angleDiff > 180) {
      angleDiff = 360 - angleDiff;
    }
    
    const isNear = angleDiff <= tolerance;
    
    // إضافة لوغ للتصحيح
    if (isNear) {
      console.log(`🎯 تطابق سعر: زاوية=${position.angle.toFixed(1)}°, خلية=${cellAngle.toFixed(1)}°, فرق=${angleDiff.toFixed(1)}°`);
    }
    
    return isNear;
  }, [getRingCellCount]);

  // دالة مُحسنة للحصول على لون الخلية
  const getCellBackgroundColor = useCallback((cellKey, clickCount, level, index) => {
    // الحصول على عدد نقرات هذه الخلية تحديداً
    const cellClicks = cellClickCounts[cellKey] || 0;
    
    // التحقق من التخزين المؤقت أولاً
    const cacheKey = `${cellKey}_${cellClicks}_${level}_${index}_${lastMarketUpdate}`;
    if (performanceSettings.enableCaching && colorCache.has(cacheKey)) {
      return colorCache.get(cacheKey);
    }

    let finalColor = '#fff'; // اللون الأصلي (أبيض)
    
    // الألوان الافتراضية حسب المستوى والنقر
    const getDefaultColor = () => {
      // التلوين العادي حسب النقرات
      if (cellClicks === 1) return "#90ee90";  // أخضر
      if (cellClicks === 2) return "#ffb6c1";  // وردي
      if (cellClicks === 3) return "#ffff00";  // أصفر
      if (cellClicks === 4) return "#d3d3d3";  // رمادي
      return "#fff"; // اللون الأصلي (أبيض)
    };

        // إذا كان التلوين القائم على السعر مفعلاً
    if (priceBasedColoring && selectedMarkets.length > 0) {
      console.log(`🎨 البحث عن تطابق سعر للخلية ${cellKey} من بين ${selectedMarkets.length} أسواق مختارة`);
      
      let bestMatch = null;
      let closestDistance = Infinity;
      
      // البحث عن أفضل تطابق مع السعر في جميع الأسواق
      for (let marketKey of selectedMarkets) {
        const movement = priceMovements[marketKey];
        if (movement && movement.price) {
          // حساب موقع السعر في دائرة 360
          const position = calculatePricePosition(movement.price);
          
          // حساب المسافة الزاوية بدقة أكبر
          const cellsInLevel = getRingCellCount(level);
          const cellAngle = (index * 360) / cellsInLevel;
          let angleDiff = Math.abs(position.angle - cellAngle);
          
          // حساب أقصر مسافة زاوية (دائرية)
          if (angleDiff > 180) {
            angleDiff = 360 - angleDiff;
          }
          
          // إضافة مكافأة للمستوى المطابق
          const levelDiff = Math.abs(position.level - level);
          const totalDistance = angleDiff + (levelDiff * 5); // وزن إضافي للمستوى
          
          // التحقق من أن هذا أفضل تطابق
          if (totalDistance < closestDistance) {
            closestDistance = totalDistance;
            bestMatch = { movement, marketKey, distance: totalDistance };
          }
        }
      }
      
      // تطبيق التلوين حسب أفضل تطابق
      if (bestMatch && closestDistance <= 20) { // حد المرونة 20 درجة
        if (cellClicks > 0) {
          // مزج لون النقرة مع لون السعر
          const clickColor = getDefaultColor();
          finalColor = blendColors(bestMatch.movement.color, clickColor, 0.6); // 60% سعر، 40% نقرة
        } else {
          finalColor = bestMatch.movement.color;
          
          // تسجيل التطابق في الكونسول للتصحيح
          console.log(`🎨 تلوين سعر: ${bestMatch.marketKey} (${bestMatch.movement.price}) - مسافة: ${closestDistance.toFixed(1)}°`);
        }
      } else {
        // لا يوجد تطابق قريب - استخدم الألوان الافتراضية
        if (cellClicks > 0) {
          finalColor = getDefaultColor();
        } else {
          // ألوان خلفية ناعمة للخلايا غير المطابقة عند تفعيل التلوين
          const subtleColors = ['#fafafa', '#f5f5f5', '#f0f0f0', '#eeeeee', '#e8e8e8'];
          finalColor = subtleColors[level % subtleColors.length] || '#fafafa';
        }
      }
    } else {
      // التلوين التقليدي (بدون قاعدة السعر)
      if (priceBasedColoring && selectedMarkets.length === 0) {
        console.log(`⚠️ التلوين مفعل لكن لا توجد أسواق مختارة للخلية ${cellKey}`);
      }
      finalColor = getDefaultColor();
    }

    // حفظ في الذاكرة المؤقتة
    if (performanceSettings.enableCaching) {
      if (colorCache.size >= performanceSettings.maxCacheSize) {
        colorCache.clear(); // تنظيف الذاكرة عند الامتلاء
      }
      colorCache.set(cacheKey, finalColor);
    }

    return finalColor;
  }, [cellClickCounts, priceBasedColoring, selectedMarkets, priceMovements, lastMarketUpdate, performanceSettings, colorCache, calculatePricePosition, isPositionNearCell]);

  // دالة مساعدة لمزج الألوان
  const blendColors = useCallback((color1, color2, ratio) => {
    try {
      // تحويل hex إلى RGB
      const hex2rgb = (hex) => {
        const cleanHex = hex.replace('#', '');
        if (cleanHex.length === 3) {
          return [
            parseInt(cleanHex[0] + cleanHex[0], 16),
            parseInt(cleanHex[1] + cleanHex[1], 16),
            parseInt(cleanHex[2] + cleanHex[2], 16)
          ];
        }
        return [
          parseInt(cleanHex.slice(0, 2), 16),
          parseInt(cleanHex.slice(2, 4), 16),
          parseInt(cleanHex.slice(4, 6), 16)
        ];
      };
      
      // تحويل RGB إلى hex
      const rgb2hex = (r, g, b) => {
        const toHex = (c) => {
          const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
      };
      
      const [r1, g1, b1] = hex2rgb(color1);
      const [r2, g2, b2] = hex2rgb(color2);
      
      const r = r1 * ratio + r2 * (1 - ratio);
      const g = g1 * ratio + g2 * (1 - ratio);
      const b = b1 * ratio + b2 * (1 - ratio);
      
      return rgb2hex(r, g, b);
    } catch (e) {
      console.warn('خطأ في مزج الألوان:', e);
      return color1; // إرجاع اللون الأول في حالة الخطأ
    }
  }, []);

  // throttled update function للأداء
  const throttledUpdate = useMemo(
    () => throttle(() => {
      setLastMarketUpdate(Date.now());
      drawGannCircle();
    }, performanceSettings.throttleDelay),
    [performanceSettings.throttleDelay]
  );

  // دوال الزوم
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.2, maxZoom));
  }, [maxZoom]);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.2, minZoom));
  }, [minZoom]);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
  }, []);

  // ربط السهم المختار تلقائياً بدائرة جان
  useEffect(() => {
    console.log('🔄 تحديث الأسواق المختارة:', selectedMarkets);
    
    if (selectedMarkets.length > 0) {
      const firstMarket = selectedMarkets[0];
      console.log('🎯 ربط السوق بدائرة جان:', firstMarket);
      
      // تعيين السوق الأساسي لإعدادات دائرة جان
      setSelectedMarket(firstMarket);
      
      // التحقق من وجود بيانات السعر
      console.log('📊 البحث عن بيانات السعر للسوق:', firstMarket);
      console.log('📈 الأسواق المتاحة:', Object.keys(priceMovements));
      
      const movement = priceMovements[firstMarket];
      console.log('💰 بيانات السعر الموجودة:', movement);
      
      if (movement && movement.price) {
        const price = parseFloat(movement.price);
        console.log('🔢 تطبيق السعر كبداية ترقيم:', price);
        
        // تعيين السعر كبداية الترقيم للحلقة الثالثة
        setStartingNumber(price);
        
        // ضبط الخطوة بناءً على قيمة السعر لتناسب التدرج الطبيعي
        if (price < 1) {
          setStep(0.01); // للعملات الرقمية الصغيرة
          setDecimalStep(0.001);
          console.log('⚙️ تم ضبط الخطوة للعملات الصغيرة: 0.01');
        } else if (price < 10) {
          setStep(0.1);
          setDecimalStep(0.01);
          console.log('⚙️ تم ضبط الخطوة للأسعار المنخفضة: 0.1');
        } else if (price < 100) {
          setStep(1);
          setDecimalStep(0.1);
          console.log('⚙️ تم ضبط الخطوة للأسعار المتوسطة: 1');
        } else if (price < 1000) {
          setStep(5);
          setDecimalStep(0.5);
          console.log('⚙️ تم ضبط الخطوة للأسعار العالية: 5');
        } else {
          setStep(10);
          setDecimalStep(1);
          console.log('⚙️ تم ضبط الخطوة للأسعار الكبيرة: 10');
        }
        
        // تفعيل عرض الأرقام العشرية إذا كان السعر يحتويها
        if (price % 1 !== 0) {
          setShowTwoDecimals(true);
          console.log('🔢 تم تفعيل عرض الأرقام العشرية');
        }
        
        // إعلام المستخدم بالتحديث
        console.log(`✅ تم ربط دائرة جان بسعر ${movement.name || firstMarket}: ${price}`);
      } else {
        console.log(`❌ لا توجد بيانات سعر للسوق: ${firstMarket}`);
      }
    } else {
      console.log('❌ لم يتم اختيار أي سوق - مسح إعدادات دائرة جان');
      setSelectedMarket('');
    }
  }, [selectedMarkets, priceMovements, setStartingNumber, setStep, setDecimalStep, setShowTwoDecimals]);

  // تحديث عند تغيير بيانات السوق
  useEffect(() => {
    if (priceBasedColoring && Object.keys(priceMovements).length > 0) {
      throttledUpdate();
    }
  }, [priceMovements, priceBasedColoring, throttledUpdate]);

  // إضافة معالجات أحداث الماوس للتدوير التفاعلي
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // إضافة معالجات الأحداث
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp); // إنهاء السحب عند مغادرة الكانفاس

    // تنظيف المعالجات عند إلغاء المكون
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  // دالة رسم دائرة جان الكاملة
  const drawGannCircle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // حساب المركز والمقياس بناءً على حجم الكانفاس
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // حساب مقياس التكبير/التصغير لجعل الدائرة تملأ الكانفاس
    const availableRadius = Math.min(canvas.width, canvas.height) / 2 - 20; // مع ترك هامش 20 بكسل
    const baseScale = Math.min(1, availableRadius / maxRadius);
    const scale = baseScale * zoomLevel; // تطبيق الزوم
    
    // تطبيق المقياس على السياق مع ضمان عدم تجاوز حدود الكانفاس
    const finalScale = Math.min(scale, availableRadius / maxRadius);
    
    // حساب degreeRingRadius داخل دالة الرسم لضمان الدقة
    const currentDegreeRingRadius = lastNumberRingRadius + 8; // degreeRingGap = 8 - مطابق للقيمة الثابتة الجديدة
    
    ctx.save();
    ctx.scale(finalScale, finalScale);
    const scaledCenterX = centerX / finalScale;
    const scaledCenterY = centerY / finalScale;

    // رسم الحلقات المرقمة
    for (let currentLevel = 0; currentLevel < totalLevels; currentLevel++) {
      drawNumberedRing(ctx, scaledCenterX, scaledCenterY, currentLevel);
    }

    // رسم حلقة الدرجات
    if (showDegreeRing) {
      drawDegreeRing(ctx, scaledCenterX, scaledCenterY, currentDegreeRingRadius);
    }

    // رسم عجلة الزوايا
    if (showAngleWheel) {
      drawAngleWheel(ctx, scaledCenterX, scaledCenterY);
    }

    // رسم حلقة الأبراج
    if (showZodiacRing) {
      drawZodiacRing(ctx, scaledCenterX, scaledCenterY);
    }

    // رسم حلقة أيام الأسبوع
    if (showWeekDaysRing) {
      drawWeekDaysRing(ctx, scaledCenterX, scaledCenterY);
    }

    // رسم الأشكال الهندسية المختارة
    if (selectedShapes.length > 0) {
      renderSelectedShapes(ctx, scaledCenterX, scaledCenterY, selectedShapes, shapeProperties, currentDegreeRingRadius, settings);
    }

    // رسم البيانات الإضافية إذا كانت مفعلة
    if (showMarketOverlay && selectedMarkets.length > 0) {
      drawMarketOverlay(ctx, scaledCenterX, scaledCenterY);
    }
    
    ctx.restore();
  }, [
    totalLevels, level, startingNumber, step, decimalStep, showTwoDecimals, cellBorderColor, showDegreeRing, showAngleWheel, showZodiacRing, showWeekDaysRing,
    showMarketOverlay, selectedMarkets, settings, 
    maxRadius, zoomLevel, dynamicMaxRadius, getCellBackgroundColor,
    selectedShapes, shapeProperties, lastNumberRingRadius
  ]);

  // دالة رسم الحلقة المرقمة
  const drawNumberedRing = useCallback((ctx, centerX, centerY, ringLevel) => {
    if (ringLevel < 3) return; // الحلقات الثلاث الأولى فارغة الآن (تغيير من 2 إلى 3)
    
    const cellCount = settings.divisions;
    if (cellCount === 0) return;

    // حساب نصف القطر لهذه الحلقة
    let currentRadius = innerRadius;
    for (let level = 0; level <= ringLevel; level++) {
      if (level === ringLevel) break;
      
      // حساب أقصى عدد أرقام في هذا المستوى مع مراعاة الأرقام الكبيرة والعشرية
      const maxDigitsInLevel = Math.max(
        ...Array.from({ length: settings.divisions }, (_, i) => {
          const cellValue = getCellValue(level, i, ringStartNumbers, startingNumber);
          if (cellValue) {
            // للأرقام العشرية، نعتبر عدد الأحرف مع التحكم في عرض رقمين بعد الفاصلة
            let cellValueStr;
            if (typeof cellValue === 'number' && startingNumber % 1 !== 0 && showTwoDecimals) {
              cellValueStr = cellValue.toFixed(2);
            } else if (typeof cellValue === 'number' && startingNumber % 1 !== 0) {
              cellValueStr = parseFloat(cellValue.toFixed(2)).toString();
            } else {
              cellValueStr = cellValue.toString();
            }
            const digitCount = cellValueStr.length;
            
            // تطبيق وزن إضافي للأرقام الطويلة مع تدرج أكثر
            if (digitCount > 12) {
              return digitCount * 1.5; // وزن أكبر للأرقام الطويلة جداً
            } else if (digitCount > 8) {
              return digitCount * 1.3; // وزن متوسط للأرقام الطويلة
            } else if (digitCount > 6) {
              return digitCount * 1.1; // وزن خفيف للأرقام المتوسطة
            } else {
              return digitCount; // لا وزن إضافي للأرقام القصيرة
            }
          }
          return 1;
        })
      );
      const dynamicWidth = calculateRingWidth(maxDigitsInLevel);
      currentRadius += dynamicWidth;
    }

    // حساب عرض الحلقة الحالية
    const maxDigitsInCurrentLevel = Math.max(
      ...Array.from({ length: settings.divisions }, (_, i) => {
        const cellValue = getCellValue(ringLevel, i, ringStartNumbers, startingNumber);
        if (cellValue) {
          // للأرقام العشرية، نعتبر عدد الأحرف مع التحكم في عرض رقمين بعد الفاصلة
          let cellValueStr;
          if (typeof cellValue === 'number' && startingNumber % 1 !== 0 && showTwoDecimals) {
            cellValueStr = cellValue.toFixed(2);
          } else if (typeof cellValue === 'number' && startingNumber % 1 !== 0) {
            cellValueStr = parseFloat(cellValue.toFixed(2)).toString();
          } else {
            cellValueStr = cellValue.toString();
          }
          const digitCount = cellValueStr.length;
          
          // تطبيق وزن إضافي للأرقام الطويلة مع تدرج أكثر
          if (digitCount > 12) {
            return digitCount * 1.5; // وزن أكبر للأرقام الطويلة جداً
          } else if (digitCount > 8) {
            return digitCount * 1.3; // وزن متوسط للأرقام الطويلة
          } else if (digitCount > 6) {
            return digitCount * 1.1; // وزن خفيف للأرقام المتوسطة
          } else {
            return digitCount; // لا وزن إضافي للأرقام القصيرة
          }
        }
        return 1;
      })
    );
    
    const ringWidth = calculateRingWidth(maxDigitsInCurrentLevel);
    const innerRingRadius = currentRadius;
    const outerRingRadius = currentRadius + ringWidth;

    const angleStep = (2 * Math.PI) / cellCount;

    for (let i = 0; i < cellCount; i++) {
      // ضبط الزوايا بحيث:
      // - الخلايا تغطي كامل الدائرة 360 درجة بدون فراغات
      // - الخلية الأولى تبدأ من الزاوية 10 درجة
      // - الخلية الأخيرة تنتهي عند الزاوية 10 درجة (دورة كاملة)
      const anglePerCell = 360 / cellCount; // 360 درجة موزعة بالتساوي
      const startAngleDegrees = 10 + (i * anglePerCell);
      const endAngleDegrees = 10 + ((i + 1) * anglePerCell);
      
      const startAngle = (startAngleDegrees - 96 + settings.rotation) * Math.PI / 180;
      const endAngle = (endAngleDegrees - 96 + settings.rotation) * Math.PI / 180;
      
      // حساب رقم الخلية
      const cellValue = getCellValue(ringLevel, i, ringStartNumbers, startingNumber);
      const cellKey = `${ringLevel}_${i}`;

      // الحصول على لون الخلية
      const backgroundColor = getCellBackgroundColor(cellKey, clickCount, ringLevel, i);
      
      // تمييز بصري خاص للخلية الأولى من الحلقة الثالثة إذا كان هناك سهم مربوط
      const isFirstCellOfThirdRing = (ringLevel === 3 && i === 0 && selectedMarket && priceMovements[selectedMarket]);
      
      // رسم الخلية
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRingRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRingRadius, endAngle, startAngle, true);
      ctx.closePath();
      
      // تعبئة الخلية باللون المحسوب حسب النقرات أو باللون المميز للسهم المربوط
      if (isFirstCellOfThirdRing) {
        // لون مميز للخلية المربوطة بالسهم
        const gradient = ctx.createRadialGradient(
          centerX, centerY, innerRingRadius,
          centerX, centerY, outerRingRadius
        );
        gradient.addColorStop(0, '#FFD700'); // ذهبي لامع
        gradient.addColorStop(0.5, '#FF6B35'); // برتقالي
        gradient.addColorStop(1, '#FF1744'); // أحمر
        ctx.fillStyle = gradient;
      } else {
        // تطبيق تأثير التحليل الزمني على الألوان
        let finalColor = backgroundColor;
        
        // البحث عن أقرب تطابق سعري للتحقق من التأثير الزمني
        if (priceBasedColoring && selectedMarkets.length > 0) {
          for (let marketKey of selectedMarkets) {
            const movement = priceMovements[marketKey];
            if (movement && movement.price && movement.timeInfluence) {
              const position = calculatePricePosition(movement.price);
              
              // حساب المسافة الزاوية
              const cellAngle = startAngle + angleStep / 2;
              const cellAngleDeg = (cellAngle * 180) / Math.PI;
              let angleDiff = Math.abs(position.angle - cellAngleDeg);
              if (angleDiff > 180) angleDiff = 360 - angleDiff;
              
              const levelDiff = Math.abs(position.level - ringLevel);
              const totalDistance = angleDiff + (levelDiff * 5);
              
              if (totalDistance <= 20) {
                const timeInfluence = movement.timeInfluence;
                const isTimeActive = movement.isTimeActive;
                
                if (isTimeActive && timeInfluence > 1) {
                  // تكثيف اللون للأسواق النشطة زمنياً
                  const intensity = Math.min(timeInfluence, 2) - 1; // 0-1 scale
                  const originalColor = movement.color;
                  
                  if (originalColor) {
                    // تحويل اللون hex إلى RGB
                    const r = parseInt(originalColor.substr(1, 2), 16);
                    const g = parseInt(originalColor.substr(3, 2), 16);
                    const b = parseInt(originalColor.substr(5, 2), 16);
                    
                    // تكثيف اللون مع الحفاظ على الشفافية
                    const enhancedR = Math.min(255, Math.floor(r + (255 - r) * intensity * 0.3));
                    const enhancedG = Math.min(255, Math.floor(g + (255 - g) * intensity * 0.3));
                    const enhancedB = Math.min(255, Math.floor(b + (255 - b) * intensity * 0.3));
                    
                    finalColor = `rgba(${enhancedR}, ${enhancedG}, ${enhancedB}, ${0.7 + intensity * 0.3})`;
                  }
                } else if (timeInfluence < 1) {
                  // تخفيف اللون للأسواق غير النشطة زمنياً
                  const reduction = 1 - timeInfluence; // 0-1 scale
                  const originalColor = movement.color;
                  
                  if (originalColor) {
                    const r = parseInt(originalColor.substr(1, 2), 16);
                    const g = parseInt(originalColor.substr(3, 2), 16);
                    const b = parseInt(originalColor.substr(5, 2), 16);
                    
                    const reducedR = Math.floor(r * (1 - reduction * 0.5));
                    const reducedG = Math.floor(g * (1 - reduction * 0.5));
                    const reducedB = Math.floor(b * (1 - reduction * 0.5));
                    
                    finalColor = `rgba(${reducedR}, ${reducedG}, ${reducedB}, ${0.3 + (1 - reduction) * 0.4})`;
                  }
                }
                break; // استخدم أول تطابق وخرج من الحلقة
              }
            }
          }
        }
        
        ctx.fillStyle = finalColor;
      }
      ctx.fill();
      
      // رسم الحدود مع سمك متكيف مع عدد القطاعات
      if (isFirstCellOfThirdRing) {
        // حدود مميزة للخلية المربوطة بالسهم
        ctx.strokeStyle = '#FFFFFF'; // أبيض لامع
        ctx.lineWidth = 3; // سمك أكبر
        ctx.setLineDash([5, 3]); // خط متقطع
      } else {
        ctx.strokeStyle = cellBorderColor; // استخدام لون الحدود القابل للتخصيص
        ctx.setLineDash([]); // خط مستمر
        // تقليل سمك الحدود عند زيادة عدد القطاعات لتجنب التداخل
        if (cellCount <= 36) {
          ctx.lineWidth = 1;
        } else if (cellCount <= 72) {
          ctx.lineWidth = 0.8;
        } else if (cellCount <= 180) {
          ctx.lineWidth = 0.6;
        } else {
          ctx.lineWidth = 0.4;
        }
      }
      ctx.stroke();
      
      // إعادة تعيين نمط الخط للرسوم التالية
      ctx.setLineDash([]);

      // إضافة مؤشر بصري للتطابق السعري
      if (priceBasedColoring && selectedMarkets.length > 0) {
        let hasMatch = false;
        let bestMatchMarket = null;
        let closestDistance = Infinity;
        
        // التحقق من وجود تطابق سعري
        for (let marketKey of selectedMarkets) {
          const movement = priceMovements[marketKey];
          if (movement && movement.price) {
            const position = calculatePricePosition(movement.price);
            
            // حساب المسافة الزاوية
            const cellAngle = startAngle + angleStep / 2;
            const cellAngleDeg = (cellAngle * 180) / Math.PI;
            let angleDiff = Math.abs(position.angle - cellAngleDeg);
            if (angleDiff > 180) angleDiff = 360 - angleDiff;
            
            const levelDiff = Math.abs(position.level - ringLevel);
            const totalDistance = angleDiff + (levelDiff * 5);
            
            if (totalDistance <= 20 && totalDistance < closestDistance) {
              hasMatch = true;
              bestMatchMarket = movement;
              closestDistance = totalDistance;
            }
          }
        }
        
        // رسم مؤشر التطابق السعري
        if (hasMatch && bestMatchMarket) {
          const indicatorRadius = (innerRingRadius + outerRingRadius) / 2;
          const indicatorAngle = startAngle + angleStep / 2;
          const indicatorX = centerX + indicatorRadius * Math.cos(indicatorAngle);
          const indicatorY = centerY + indicatorRadius * Math.sin(indicatorAngle);
          
          // رسم نقطة صغيرة ملونة للتطابق
          ctx.save();
          ctx.beginPath();
          ctx.arc(indicatorX, indicatorY, 3, 0, 2 * Math.PI);
          ctx.fillStyle = bestMatchMarket.color;
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;
          ctx.stroke();
          
          // مؤشر التأثير الزمني
          if (bestMatchMarket.timeInfluence && bestMatchMarket.isTimeActive) {
            ctx.beginPath();
            ctx.arc(indicatorX, indicatorY, 5, 0, 2 * Math.PI);
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // رمز ⏰ للوقت النشط
            ctx.font = '10px Arial';
            ctx.fillStyle = '#FFD700';
            ctx.textAlign = 'center';
            ctx.fillText('⏰', indicatorX, indicatorY - 8);
          }
          
          // إضافة رمز حسب الحركة السعرية
          ctx.font = '8px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#FFFFFF';
          
          let symbol = '●';
          if (bestMatchMarket.movement === 'up') symbol = '▲';
          else if (bestMatchMarket.movement === 'down') symbol = '▼';
          
          ctx.fillText(symbol, indicatorX, indicatorY);
          ctx.restore();
        }
      }

      // عرض الأرقام
      if (showNumbers && cellValue) {
        const textRadius = (innerRingRadius + outerRingRadius) / 2;
        const textAngle = startAngle + angleStep / 2;
        const textX = centerX + textRadius * Math.cos(textAngle);
        const textY = centerY + textRadius * Math.sin(textAngle);

        // حساب حجم النص بناءً على حجم الرقم والخلية وعدد القطاعات
        let cellValueStr;
        if (typeof cellValue === 'number' && startingNumber % 1 !== 0 && showTwoDecimals) {
          cellValueStr = cellValue.toFixed(2); // عرض رقمين بعد الفاصلة العشرية دائماً
        } else if (typeof cellValue === 'number' && startingNumber % 1 !== 0) {
          cellValueStr = parseFloat(cellValue.toFixed(2)).toString(); // إزالة الأصفار الزائدة
        } else {
          cellValueStr = cellValue.toString();
        }
        const digitCount = cellValueStr.length;
        const cellWidth = outerRingRadius - innerRingRadius;
        
        // حساب الزاوية المتاحة لكل قطاع
        const anglePerCell = (2 * Math.PI) / cellCount;
        const arcLength = outerRingRadius * anglePerCell; // طول القوس المتاح
        
        // حساب عرض النص المتاح مع هوامش أمان مخفضة
        const textMargin = 1; // تقليل الهامش إلى الحد الأدنى لتوفير مساحة أكبر
        const availableWidth = Math.max(arcLength - (textMargin * 2), 15);
        const availableHeight = Math.max(cellWidth - (textMargin * 2), 12);
        
        // تقدير عرض الحرف الواحد (متوسط) مع تحسين للأرقام الكبيرة
        const avgCharWidth = digitCount > 10 ? 0.5 : (digitCount > 8 ? 0.52 : 0.55); // أحرف أضيق للأرقام الطويلة
        
        // حساب أقصى حجم نص ممكن بناءً على العرض المتاح مع زيادة كبيرة
        const maxFontSizeForWidth = Math.floor(availableWidth / (digitCount * avgCharWidth)) + 2; // زيادة +2
        const maxFontSizeForHeight = Math.floor(availableHeight * 0.9) + 2; // زيادة إلى 90% + 2
        
        // حد أدنى أكبر بكثير للقراءة - خاصة للأرقام الكبيرة
        const minimumReadableSize = digitCount > 12 ? 10 : (digitCount > 10 ? 12 : (digitCount > 8 ? 14 : 16));
        
        // تحديد حجم النص بناءً على عدد القطاعات مع أحجام أكبر للأرقام الكبيرة
        let baseFontSize;
        
        if (cellCount <= 36) {
          // العدد القياسي - أحجام أكبر بكثير للأرقام الكبيرة
          if (digitCount <= 3) {
            baseFontSize = Math.max(16, Math.min(28, cellWidth * 0.5));
          } else if (digitCount <= 6) {
            baseFontSize = Math.max(14, Math.min(24, cellWidth * 0.45));
          } else if (digitCount <= 9) {
            baseFontSize = Math.max(12, Math.min(20, cellWidth * 0.4));
          } else if (digitCount <= 12) {
            baseFontSize = Math.max(10, Math.min(16, cellWidth * 0.35));
          } else {
            baseFontSize = Math.max(9, Math.min(14, cellWidth * 0.3));
          }
        } else if (cellCount <= 72) {
          // عدد متوسط - أحجام أكبر
          if (digitCount <= 3) {
            baseFontSize = Math.max(14, Math.min(22, cellWidth * 0.45));
          } else if (digitCount <= 6) {
            baseFontSize = Math.max(12, Math.min(18, cellWidth * 0.4));
          } else if (digitCount <= 9) {
            baseFontSize = Math.max(10, Math.min(16, cellWidth * 0.35));
          } else if (digitCount <= 12) {
            baseFontSize = Math.max(9, Math.min(14, cellWidth * 0.3));
          } else {
            baseFontSize = Math.max(8, Math.min(12, cellWidth * 0.25));
          }
        } else if (cellCount <= 180) {
          // عدد كبير - أحجام أكبر
          if (digitCount <= 3) {
            baseFontSize = Math.max(12, Math.min(18, cellWidth * 0.4));
          } else if (digitCount <= 6) {
            baseFontSize = Math.max(10, Math.min(16, cellWidth * 0.35));
          } else if (digitCount <= 9) {
            baseFontSize = Math.max(9, Math.min(14, cellWidth * 0.3));
          } else if (digitCount <= 12) {
            baseFontSize = Math.max(8, Math.min(12, cellWidth * 0.25));
          } else {
            baseFontSize = Math.max(7, Math.min(10, cellWidth * 0.2));
          }
        } else {
          // عدد كبير جداً - أحجام أكبر
          if (digitCount <= 3) {
            baseFontSize = Math.max(10, Math.min(16, cellWidth * 0.35));
          } else if (digitCount <= 6) {
            baseFontSize = Math.max(9, Math.min(14, cellWidth * 0.3));
          } else if (digitCount <= 9) {
            baseFontSize = Math.max(8, Math.min(12, cellWidth * 0.25));
          } else if (digitCount <= 12) {
            baseFontSize = Math.max(7, Math.min(10, cellWidth * 0.2));
          } else {
            baseFontSize = Math.max(6, Math.min(8, cellWidth * 0.15));
          }
        }
        
        // تطبيق جميع التقييدات للحصول على حجم النص النهائي
        let fontSize = Math.min(
          baseFontSize, 
          maxFontSizeForWidth, 
          maxFontSizeForHeight,
          32 // زيادة الحد الأقصى المطلق من 24 إلى 32
        );
        
        // ضمان حد أدنى للقراءة خاصة للأرقام الكبيرة
        fontSize = Math.max(fontSize, minimumReadableSize);

        // تحسين عرض الأرقام الكبيرة - تقصير النص إذا كان طويلاً جداً
        let displayText = cellValueStr;
        
        // إذا كان الرقم كبيراً جداً وحجم النص صغير جداً، نقصر العرض (شروط أكثر صرامة)
        if (digitCount > 12 && fontSize < 6) {
          const numValue = parseFloat(cellValue);
          if (numValue >= 1000000) {
            // عرض بتنسيق مليون (M)
            displayText = (numValue / 1000000).toFixed(1) + 'M';
          } else if (numValue >= 1000) {
            // عرض بتنسيق ألف (K)
            displayText = (numValue / 1000).toFixed(1) + 'K';
          }
        } else if (digitCount > 15 && fontSize < 4) {
          const numValue = parseFloat(cellValue);
          if (numValue >= 1000000) {
            displayText = (numValue / 1000000).toFixed(0) + 'M';
          } else if (numValue >= 1000) {
            displayText = (numValue / 1000).toFixed(0) + 'K';
          }
        }

        // تطبيق نمط ألوان جان للرقم الأساسي (نفس ألوان الرقم المختزل)
        const reducedMainValue = reduceToDigit(cellValue);
        let mainColor;
        if ([1, 4, 7].includes(reducedMainValue)) {
          mainColor = '#FF0000'; // أحمر قوي
        } else if ([2, 5, 8].includes(reducedMainValue)) {
          mainColor = '#0000FF'; // أزرق قوي
        } else if ([3, 6, 9].includes(reducedMainValue)) {
          mainColor = '#000000'; // أسود قوي
        } else {
          mainColor = '#FF8C00'; // برتقالي داكن بدلاً من الذهبي
        }
        
        // إعداد النص بدون ظلال أو حدود
        ctx.fillStyle = mainColor;
        ctx.font = `${fontSize}px Arial`; // خط Arial بدون bold
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // رسم النص مباشرة بدون تأثيرات
        ctx.fillText(displayText, textX, textY - 2);
        
        // إضافة رمز خاص للخلية المربوطة بالسهم
        if (isFirstCellOfThirdRing) {
          ctx.font = `${Math.min(fontSize + 4, 16)}px Arial`;
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // رسم رمز نجمة أو سهم للإشارة للخلية المربوطة
          const symbolY = textY + (fontSize * 0.8);
          ctx.fillText('⭐', textX, symbolY);
          
          // إعادة تعيين الخط
          ctx.font = `${fontSize}px Arial`;
        }
        
        // عرض الرقم المختزل إذا كان مفعلاً وإذا كان مناسباً للعرض
        if (showReducedNumbers && cellCount <= 144 && fontSize >= 6 && digitCount <= 10) { // شروط أكثر صرامة
          const reducedValue = reduceToDigit(cellValue);
          
          // تطبيق نمط ألوان جان للأرقام المختزلة
          let reducedColor;
          if ([1, 4, 7].includes(reducedValue)) {
            reducedColor = '#FF0000'; // أحمر قوي
          } else if ([2, 5, 8].includes(reducedValue)) {
            reducedColor = '#0000FF'; // أزرق قوي
          } else if ([3, 6, 9].includes(reducedValue)) {
            reducedColor = '#000000'; // أسود قوي
          } else {
            reducedColor = '#FF8C00'; // برتقالي داكن
          }
          
          // حجم النص المختزل أصغر مع المزيد من التكيف
          let reducedFontSize;
          if (cellCount <= 36 && digitCount <= 6) {
            reducedFontSize = Math.max(6, fontSize * 0.7);
          } else if (cellCount <= 72 && digitCount <= 8) {
            reducedFontSize = Math.max(5, fontSize * 0.65);
          } else if (cellCount <= 144 && digitCount <= 10) {
            reducedFontSize = Math.max(4, fontSize * 0.6);
          } else {
            reducedFontSize = Math.max(3, fontSize * 0.55);
          }
          
          // التأكد من أن النص المختزل لن يتداخل مع النص الأساسي
          const spacingRatio = digitCount > 6 ? 0.7 : 0.85; // مسافة أقل للأرقام الطويلة
          
          // إعداد النص المختزل مع حدود
          // إعداد النص المختزل بدون ظلال أو حدود
          ctx.fillStyle = reducedColor;
          ctx.font = `${reducedFontSize}px 'Segoe UI', Arial, sans-serif`;
          
          // رسم النص المختزل مباشرة
          ctx.fillText(reducedValue.toString(), textX, textY + fontSize * spacingRatio);
        }
      }
    }

    // عرض رقم المستوى في موقع منفصل (خارج الدائرة) - مع تكيف حسب عدد القطاعات
    if (showLevels && outerRingRadius > 20) {
      // استخدام اللون الأزرق الداكن لجميع أرقام المستويات
      const levelColor = '#000080'; // أزرق داكن بدلاً من الذهبي
      
      // وضع رقم المستوى خارج الدائرة بمسافة كافية لتجنب التداخل
      const levelTextRadius = outerRingRadius + 25;
      const levelTextX = centerX + levelTextRadius;
      const levelTextY = centerY;
      
      // تحديد حجم النص بناءً على عدد القطاعات
      let levelFontSize;
      if (cellCount <= 36) {
        levelFontSize = 20;
      } else if (cellCount <= 72) {
        levelFontSize = 16;
      } else if (cellCount <= 180) {
        levelFontSize = 14;
      } else {
        levelFontSize = 12;
      }
      
      // إعداد النص بدون حدود أو ظلال
      ctx.fillStyle = levelColor;
      ctx.font = `bold ${levelFontSize}px Arial`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      
      // رسم النص مباشرة
      ctx.fillText(`L${ringLevel}`, levelTextX, levelTextY);
    }
  }, [settings, ringStartNumbers, innerRadius, showNumbers, showLevels, clickCount, getCellBackgroundColor]);

  // مراقبة تحديث السعر للسهم المربوط وتحديث الترقيم تلقائياً
  useEffect(() => {
    if (selectedMarket && priceMovements[selectedMarket]) {
      const movement = priceMovements[selectedMarket];
      const newPrice = parseFloat(movement.price);
      
      // تحديث بداية الترقيم إذا تغير السعر
      if (newPrice !== startingNumber) {
        setStartingNumber(newPrice);
        
        // تحديث الخطوة بناءً على السعر الجديد
        if (newPrice < 1) {
          setStep(0.01);
          setDecimalStep(0.001);
        } else if (newPrice < 10) {
          setStep(0.1);
          setDecimalStep(0.01);
        } else if (newPrice < 100) {
          setStep(1);
          setDecimalStep(0.1);
        } else if (newPrice < 1000) {
          setStep(5);
          setDecimalStep(0.5);
        } else {
          setStep(10);
          setDecimalStep(1);
        }
        
        // إعادة رسم الدائرة لإظهار التحديث
        setTimeout(() => {
          drawGannCircle();
        }, 50);
      }
    }
  }, [selectedMarket, priceMovements, startingNumber, setStartingNumber, setStep, setDecimalStep, drawGannCircle]);

  // مراقبة تغيرات startingNumber
  useEffect(() => {
    console.log('startingNumber changed to:', startingNumber);
  }, [startingNumber]);

  // دالة رسم حلقة الدرجات
  const drawDegreeRing = useCallback((ctx, centerX, centerY, degreeRingRadius) => {
    const degreeRingThickness = 50; // سمك ثابت لحلقة الدرجات - مستقل عن حجم القطاعات (زيادة من 40 إلى 50)
    const innerRadius = degreeRingRadius;
    const outerRadius = degreeRingRadius + degreeRingThickness;
    const cellCount = 36; // 36 خلية (كل 10 درجات)
    const angleStep = (2 * Math.PI) / cellCount;

    for (let i = 0; i < cellCount; i++) {
      // ضبط الزوايا بحيث:
      // - الخلايا تغطي كامل الدائرة 360 درجة بدون فراغات
      // - الخلية الأولى تبدأ من الزاوية 10 درجة
      const anglePerCell = 360 / cellCount;
      const startAngleDegrees = 10 + (i * anglePerCell);
      const endAngleDegrees = 10 + ((i + 1) * anglePerCell);
      
      const startAngle = (startAngleDegrees - 96 + settings.rotation) * Math.PI / 180;
      const endAngle = (endAngleDegrees - 96 + settings.rotation) * Math.PI / 180;
      
      const degree = i * 10; // كل خلية تمثل 10 درجات
      
      // رسم الخلية بدون حدود
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      
      // تلوين موحد لجميع خلايا الدرجات
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fill();
      
      // عرض النص (رقم الدرجة)
      // تطبيق نمط ألوان جان على أرقام الدرجات
      const degreeReducedValue = reduceToDigit(degree || 360);
      let degreeTextColor;
      if ([1, 4, 7].includes(degreeReducedValue)) {
        degreeTextColor = '#FF0000'; // أحمر قوي
      } else if ([2, 5, 8].includes(degreeReducedValue)) {
        degreeTextColor = '#0000FF'; // أزرق قوي
      } else if ([3, 6, 9].includes(degreeReducedValue)) {
        degreeTextColor = '#000000'; // أسود قوي
      } else {
        degreeTextColor = '#FF8C00'; // برتقالي داكن
      }

      // إعداد النص بدون حدود
      ctx.fillStyle = degreeTextColor;
      ctx.font = "bold 18px Arial"; // خط Arial عريض مع زيادة الحجم
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // رسم النص بشكل منحني متصل داخل الخلية
      const degreeTextRadius = (innerRadius + outerRadius) / 2;
      
      // حساب زاوية النص المتصل
      const textAngle = startAngle + (endAngle - startAngle) / 2;
      const textX = centerX + degreeTextRadius * Math.cos(textAngle);
      const textY = centerY + degreeTextRadius * Math.sin(textAngle);
      
      // رسم النص متصل مع دوران ليتماشى مع المنحنى
      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2); // دوران ليتماشى مع المنحنى
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(degree.toString() + '°', 0, 0); // النص الملون فقط
      ctx.restore();
    }
  }, [degreeRingRadius, settings.rotation]);

  // دالة رسم حلقة الأبراج
  const drawZodiacRing = useCallback((ctx, centerX, centerY) => {
    const innerRadius = zodiacInnerRadius;
    const outerRadius = zodiacOuterRadius;
    const cellCount = 36;
    const angleStep = (2 * Math.PI) / cellCount;

    for (let i = 0; i < cellCount; i++) {
      // ضبط الزوايا بحيث:
      // - الخلايا تغطي كامل الدائرة 360 درجة بدون فراغات
      // - الخلية الأولى تبدأ من الزاوية 10 درجة
      const anglePerCell = 360 / cellCount;
      const startAngleDegrees = 10 + (i * anglePerCell);
      const endAngleDegrees = 10 + ((i + 1) * anglePerCell);
      
      const startAngle = (startAngleDegrees - 96 + settings.rotation) * Math.PI / 180;
      const endAngle = (endAngleDegrees - 96 + settings.rotation) * Math.PI / 180;
      
      const zodiacData = zodiacRing[i];
      
      // رسم الخلية
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      
      // تلوين موحد لجميع خلايا الأبراج
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fill();
      
      // رسم الحدود
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 1;
      ctx.stroke();

      // عرض النص
      // تطبيق نمط ألوان جان للأبراج حسب الرقم المختزل لموقعها
      const zodiacReducedValue = reduceToDigit(i + 1);
      let zodiacTextColor;
      if ([1, 4, 7].includes(zodiacReducedValue)) {
        zodiacTextColor = '#FF0000'; // أحمر قوي
      } else if ([2, 5, 8].includes(zodiacReducedValue)) {
        zodiacTextColor = '#0000FF'; // أزرق قوي
      } else if ([3, 6, 9].includes(zodiacReducedValue)) {
        zodiacTextColor = '#000000'; // أسود قوي
      } else {
        zodiacTextColor = '#FF8C00'; // برتقالي داكن
      }

      // إعداد النص بدون حدود
      ctx.fillStyle = zodiacTextColor;
      ctx.font = "bold 16px Arial"; // خط عريض أكبر للنص الدائري
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // رسم النص بشكل دائري منحني داخل الخلية
      const fullText = zodiacData.label;
      const zodiacTextRadius = (innerRadius + outerRadius) / 2;
      
      // حساب زاوية النص المتصل
      const textAngle = startAngle + (endAngle - startAngle) / 2;
      const textX = centerX + zodiacTextRadius * Math.cos(textAngle);
      const textY = centerY + zodiacTextRadius * Math.sin(textAngle);
      
      // رسم النص متصل مع دوران ليتماشى مع المنحنى
      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2); // دوران ليتماشى مع المنحنى
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(fullText, 0, 0); // النص الملون كاملاً كوحدة واحدة
      ctx.restore();
    }
  }, [zodiacInnerRadius, zodiacOuterRadius, settings.rotation]);

  // دالة رسم حلقة أيام الأسبوع
  const drawWeekDaysRing = useCallback((ctx, centerX, centerY) => {
    const innerRadius = weekDaysInnerRadius;
    const outerRadius = weekDaysOuterRadius;
    const cellCount = 36;
    const angleStep = (2 * Math.PI) / cellCount;

    for (let i = 0; i < cellCount; i++) {
      // ضبط الزوايا بحيث:
      // - الخلايا تغطي كامل الدائرة 360 درجة بدون فراغات
      // - الخلية الأولى تبدأ من الزاوية 10 درجة
      const anglePerCell = 360 / cellCount;
      const startAngleDegrees = 10 + (i * anglePerCell);
      const endAngleDegrees = 10 + ((i + 1) * anglePerCell);
      
      const startAngle = (startAngleDegrees - 96 + settings.rotation) * Math.PI / 180;
      const endAngle = (endAngleDegrees - 96 + settings.rotation) * Math.PI / 180;
      
      const dayIndex = i % 7;
      const dayName = weekDaysBase[dayIndex];
      
      // رسم الخلية
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      
      // تلوين موحد لجميع خلايا الأيام
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fill();
      
      // رسم الحدود
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 1;
      ctx.stroke();

      // عرض اسم اليوم
      // تطبيق نمط ألوان جان لأيام الأسبوع حسب الرقم المختزل لموقعها
      const dayReducedValue = reduceToDigit(i + 1);
      let dayTextColor;
      if ([1, 4, 7].includes(dayReducedValue)) {
        dayTextColor = '#FF0000'; // أحمر قوي
      } else if ([2, 5, 8].includes(dayReducedValue)) {
        dayTextColor = '#0000FF'; // أزرق قوي
      } else if ([3, 6, 9].includes(dayReducedValue)) {
        dayTextColor = '#000000'; // أسود قوي
      } else {
        dayTextColor = '#FF8C00'; // برتقالي داكن
      }

      // إعداد النص بدون حدود
      ctx.fillStyle = dayTextColor;
      ctx.font = "bold 18px Arial"; // خط Arial عريض مع زيادة الحجم
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // رسم النص بشكل منحني متصل داخل الخلية
      const dayTextRadius = (innerRadius + outerRadius) / 2;
      
      // حساب زاوية النص المتصل
      const textAngle = startAngle + (endAngle - startAngle) / 2;
      const textX = centerX + dayTextRadius * Math.cos(textAngle);
      const textY = centerY + dayTextRadius * Math.sin(textAngle);
      
      // رسم النص متصل مع دوران ليتماشى مع المنحنى
      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2); // دوران ليتماشى مع المنحنى
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(dayName, 0, 0); // النص الملون فقط
      ctx.restore();
    }
  }, [weekDaysInnerRadius, weekDaysOuterRadius, settings.rotation]);

  // دالة رسم عجلة الزوايا
  const drawAngleWheel = useCallback((ctx, centerX, centerY) => {
    const innerRadius = angleWheelInnerRadius;
    const outerRadius = angleWheelOuterRadius;
    
    // حساب خطوة الزاوية بناءً على angleStepRad
    const stepDegrees = angleStepRad;
    const totalCells = 360 / stepDegrees;
    
    // رسم الخلفية كحلقة واحدة متصلة
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI, true);
    ctx.closePath();
    
    // خلفية موحدة مثل حلقة الأبراج
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; // نفس لون خلفية حلقة الأبراج
    ctx.fill();
    
    // حدود خارجية وداخلية محسنة
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
    
    // إضافة خطوط تقسيم بين الخلايا
    for (let i = 0; i < totalCells; i++) {
      const angleDeg = -90 + angleWheelRotation + i * stepDegrees;
      const angleRad = (angleDeg * Math.PI) / 180;
      
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(
        centerX + innerRadius * Math.cos(angleRad),
        centerY + innerRadius * Math.sin(angleRad)
      );
      ctx.lineTo(
        centerX + outerRadius * Math.cos(angleRad),
        centerY + outerRadius * Math.sin(angleRad)
      );
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
    
    // رسم خطوط الأشعة من المركز إلى عجلة الزوايا مع تكيف سمك الخط
    for (let i = 0; i < totalCells; i++) {
      const rayDegree = -90 + angleWheelRotation + i * stepDegrees;
      const rayAngle = (rayDegree * Math.PI) / 180;
      
      // تكيف سمك الأشعة حسب عدد القطاعات
      let adaptiveRayWidth;
      if (settings.divisions <= 36) {
        adaptiveRayWidth = rayWidth;
      } else if (settings.divisions <= 72) {
        adaptiveRayWidth = Math.max(1, rayWidth * 0.8);
      } else if (settings.divisions <= 180) {
        adaptiveRayWidth = Math.max(0.8, rayWidth * 0.6);
      } else {
        adaptiveRayWidth = Math.max(0.5, rayWidth * 0.4);
      }
      
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + outerRadius * Math.cos(rayAngle),
        centerY + outerRadius * Math.sin(rayAngle)
      );
      ctx.strokeStyle = rayColor;
      ctx.lineWidth = adaptiveRayWidth;
      ctx.globalAlpha = 0.9;
      ctx.stroke();
      ctx.restore();
    }
    
    // إضافة أرقام الزوايا إذا كان مفعلاً مع تكيف حسب عدد القطاعات
    if (showAngleWheelAngles) {
      const totalAngles = 360 / angleStepRad;
      
      // تقليل عدد الزوايا المعروضة عند زيادة عدد القطاعات لتجنب التداخل
      let angleDisplayStep = 1;
      if (settings.divisions > 180) {
        angleDisplayStep = 4; // إظهار كل 4 زوايا فقط
      } else if (settings.divisions > 72) {
        angleDisplayStep = 2; // إظهار كل زاويتين فقط
      }
      
      for (let i = 0; i < totalAngles; i += angleDisplayStep) {
        const angleDeg = -90 + angleWheelRotation + i * angleStepRad;
        const degreeValue = (i * angleStepRad) % 360;
        
        const angleRad = (angleDeg * Math.PI) / 180;
        const textRadius = (innerRadius + outerRadius) / 2;
        const x = centerX + textRadius * Math.cos(angleRad);
        const y = centerY + textRadius * Math.sin(angleRad);
        
        // تطبيق نمط ألوان جان للزوايا
        const angleReducedValue = reduceToDigit(degreeValue || 360);
        let angleTextColor;
        if ([1, 4, 7].includes(angleReducedValue)) {
          angleTextColor = '#FF0000'; // أحمر قوي
        } else if ([2, 5, 8].includes(angleReducedValue)) {
          angleTextColor = '#0000FF'; // أزرق قوي
        } else if ([3, 6, 9].includes(angleReducedValue)) {
          angleTextColor = '#000000'; // أسود قوي
        } else {
          angleTextColor = '#FF8C00'; // برتقالي داكن
        }
        
        // تحديد حجم النص بناءً على عدد القطاعات
        let angleFontSize;
        if (settings.divisions <= 36) {
          angleFontSize = 16; // زيادة من 14 إلى 16
        } else if (settings.divisions <= 72) {
          angleFontSize = 14; // زيادة من 12 إلى 14
        } else if (settings.divisions <= 180) {
          angleFontSize = 12; // زيادة من 10 إلى 12
        } else {
          angleFontSize = 10; // زيادة من 8 إلى 10
        }
        
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${angleFontSize}px Arial`;
        ctx.fillStyle = angleTextColor;
        ctx.fillText(degreeValue + '°', x, y);
        ctx.restore();
      }
    }
  }, [angleWheelInnerRadius, angleWheelOuterRadius, angleWheelRotation, angleStepRad, showAngleWheelAngles, rayColor, rayWidth, settings.rotation]);

  // دوال إدارة الأشكال الهندسية
  const addShape = useCallback((shapeId) => {
    if (!selectedShapes.includes(shapeId)) {
      setSelectedShapes(prev => [...prev, shapeId]);
      const shape = availableShapes.find(s => s.id === shapeId);
      
      // إعداد الخصائص الافتراضية للشكل
      const defaultProperties = {
        visible: true,
        fillShape: false, // خاصية التعبئة للأشكال العادية
        fillStar: false, // خاصية التعبئة للنجوم
        showAngles: false, // خاصية إظهار الزوايا للأشكال العادية
        showStarAngles: false, // خاصية إظهار الزوايا للنجوم
        rotation: 0,
      };
      
      setShapeProperties(prev => ({
        ...prev,
        [shapeId]: defaultProperties
      }));
    }
  }, [selectedShapes]);

  const removeShape = useCallback((shapeId) => {
    setSelectedShapes(prev => prev.filter(id => id !== shapeId));
    setShapeProperties(prev => {
      const newProps = { ...prev };
      delete newProps[shapeId];
      return newProps;
    });
  }, []);

  const toggleShapeVisibility = useCallback((shapeId) => {
    setShapeProperties(prev => ({
      ...prev,
      [shapeId]: {
        ...prev[shapeId],
        visible: !prev[shapeId]?.visible
      }
    }));
  }, []);

  // دالة رسم معلومات السوق على الدائرة
  const drawMarketOverlay = useCallback((ctx, centerX, centerY, maxRadius) => {
    selectedMarkets.forEach((marketKey, index) => {
      const movement = priceMovements[marketKey];
      if (!movement || !movement.price) return;

      const position = calculatePricePosition(movement.price);
      const overlayRadius = maxRadius * 0.8;
      
      // تحويل الموقع إلى إحداثيات
      const angle = (position.angle * Math.PI) / 180;
      const x = centerX + overlayRadius * Math.cos(angle);
      const y = centerY + overlayRadius * Math.sin(angle);

      // رسم نقطة السوق
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = movement.color || '#FFD700';
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // عرض اسم السوق والسعر بدون ظل
      const [marketType, symbol] = marketKey.split('_');
      ctx.fillStyle = '#FFD700';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbol, x, y - 15);
      ctx.fillText(movement.price.toFixed(2), x, y + 25);
    });
  }, [selectedMarkets, priceMovements, calculatePricePosition]);

  // إعداد canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        // حساب الحجم المطلوب للدائرة مع الزوم
        const requiredRadius = dynamicMaxRadius * zoomLevel;
        const requiredDiameter = requiredRadius * 2;
        const padding = 40; // هامش حول الدائرة
        const requiredCanvasSize = requiredDiameter + padding;
        
        // حساب الحجم المتاح في الحاوية
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const availableSize = Math.min(containerWidth, containerHeight);
        
        // استخدام الحجم المطلوب أو المتاح، أيهما أصغر
        const finalCanvasSize = Math.min(requiredCanvasSize, availableSize);
        
        // ضبط حجم الكانفاس
        canvas.width = finalCanvasSize;
        canvas.height = finalCanvasSize;
        
        drawGannCircle();
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [drawGannCircle, dynamicMaxRadius, zoomLevel]);

  // رسم أولي
  useEffect(() => {
    const timer = setTimeout(drawGannCircle, 100);
    return () => clearTimeout(timer);
  }, [drawGannCircle]);

  // إضافة معالجات أحداث الماوس للتدوير
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp); // إنهاء السحب عند مغادرة الكانفاس

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  // إعادة الرسم عند تغيير حالة الحلقات
  useEffect(() => {
    drawGannCircle();
  }, [
    level, startingNumber, step, decimalStep, showTwoDecimals, cellBorderColor, showDegreeRing, showZodiacRing, showWeekDaysRing, showAngleWheel,
    zoomLevel, // إضافة zoomLevel لإعادة الرسم عند تغيير الزوم
    angleWheelRotation, angleStepRad, showAngleWheelAngles, rayColor, rayWidth, // إعدادات عجلة الزوايا
    selectedShapes, shapeProperties, // الأشكال الهندسية
    cellClickCounts, // إضافة نقرات الخلايا لإعادة الرسم
    drawGannCircle
  ]);

  // دالة تحديث إعدادات السوق المحدد (لا تدير الأسواق المختارة)
  const handleMarketSelect = useCallback((markets) => {
    console.log('handleMarketSelect called with markets for Gann settings:', markets);
    
    // تعيين السوق الأساسي لإعدادات دائرة جان
    setSelectedMarket(markets.length > 0 ? markets[0] : '');
    
    // إذا كان هناك سوق محدد، تطبيق سعره كبداية للترقيم في الحلقة الثالثة
    if (markets.length > 0) {
      const firstMarket = markets[0];
      console.log('Applying Gann settings for market:', firstMarket);
      console.log('Available priceMovements:', Object.keys(priceMovements));
      const movement = priceMovements[firstMarket];
      console.log('Movement data for Gann:', movement);
      
      if (movement && movement.price) {
        // استخدام السعر الفعلي كبداية للترقيم
        const price = parseFloat(movement.price);
        console.log('Setting Gann starting number to:', price);
        
        // تعيين السعر كبداية الترقيم للحلقة الثالثة
        setStartingNumber(price);
        
        // ضبط الخطوة بناءً على قيمة السعر لتناسب التدرج الطبيعي
        if (price < 1) {
          setStep(0.01); // للعملات الرقمية الصغيرة
          setDecimalStep(0.001);
        } else if (price < 10) {
          setStep(0.1);
          setDecimalStep(0.01);
        } else if (price < 100) {
          setStep(1);
          setDecimalStep(0.1);
        } else if (price < 1000) {
          setStep(5);
          setDecimalStep(0.5);
        } else {
          setStep(10);
          setDecimalStep(1);
        }
        
        // تفعيل عرض الأرقام العشرية إذا كان السعر يحتويها
        if (price % 1 !== 0) {
          setShowTwoDecimals(true);
        }
        
        // إعلام المستخدم بالتحديث
        console.log(`تم ربط دائرة جان بسعر ${movement.name || firstMarket}: ${price}`);
      } else {
        console.log(`لا توجد بيانات سعر للسوق: ${firstMarket}`);
      }
    } else {
      console.log(`لم يتم اختيار أي سوق`);
    }
  }, [priceMovements, setStartingNumber, setStep, setDecimalStep, setShowTwoDecimals]);

  // styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#000',
      color: '#FFD700'
    },
    
    header: {
      padding: '10px 20px',
      backgroundColor: '#1a1a1a',
      borderBottom: '2px solid #FFD700',
      textAlign: 'center'
    },
    
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '10px'
    },
    
    controlsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px',
      marginTop: '15px'
    },
    
    controlGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    
    button: {
      padding: '12px 20px',
      backgroundColor: '#333',
      color: '#FFD700',
      border: '2px solid #FFD700',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      transition: 'all 0.3s ease',
      textAlign: 'center'
    },
    
    buttonActive: {
      backgroundColor: '#FFD700',
      color: '#000'
    },
    
    buttonDisabled: {
      backgroundColor: '#666',
      color: '#999',
      cursor: 'not-allowed',
      opacity: 0.6
    },
    
    mainContent: {
      display: 'flex',
      flex: 1,
      position: 'relative'
    },
    
    canvasContainer: {
      flex: 1,
      position: 'relative',
      minHeight: '600px'
    },
    
    canvas: {
      width: '100%',
      height: '100%',
      border: 'rgba(255, 255, 255, 0.7) 2px solid',
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain'
    },
    
    sidebar: {
      width: '350px',
      backgroundColor: '#1a1a1a',
      borderLeft: '2px solid #FFD700',
      padding: '15px',
      overflowY: 'auto'
    },
    
    statusBar: {
      padding: '10px 20px',
      backgroundColor: '#1a1a1a',
      borderTop: '2px solid #FFD700',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '12px'
    },
    
    statusGroup: {
      display: 'flex',
      gap: '20px'
    },
    
    input: {
      padding: '8px',
      backgroundColor: '#333',
      color: '#FFD700',
      border: '1px solid #FFD700',
      borderRadius: '4px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>
          🎯 دائرة جان 360 + الأسواق المالية العالمية
        </div>
        
        {/* الضوابط الرئيسية */}
        <div style={styles.controlsGrid}>
          <button
            style={{
              ...styles.button,
              ...(showMarketSelector ? styles.buttonActive : {})
            }}
            onClick={() => setShowMarketSelector(!showMarketSelector)}
          >
            📊 الأسواق المالية
          </button>
          
          <button
            style={{
              ...styles.button,
              ...(showTechnicalAnalysis ? styles.buttonActive : {})
            }}
            onClick={() => setShowTechnicalAnalysis(!showTechnicalAnalysis)}
          >
            📈 التحليل الفني
          </button>
          
          <button
            style={{
              ...styles.button,
              ...(priceBasedColoring ? styles.buttonActive : {}),
              position: 'relative'
            }}
            onClick={() => setPriceBasedColoring(!priceBasedColoring)}
            title={priceBasedColoring ? 
              `تلوين الأسعار مفعل - ${selectedMarkets.length} سوق متتبع` : 
              'تفعيل تلوين الأسعار حسب البيانات المالية اللحظية'
            }
          >
            🎨 تلوين الأسعار
            {priceBasedColoring && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#4CAF50',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {selectedMarkets.length}
              </span>
            )}
          </button>
          
          <button
            style={{
              ...styles.button,
              ...(showMarketOverlay ? styles.buttonActive : {})
            }}
            onClick={() => setShowMarketOverlay(!showMarketOverlay)}
          >
            🔗 عرض البيانات
          </button>
          
          <button
            style={{
              ...styles.button,
              ...(showOnlyStrongReversals ? styles.buttonActive : {}),
              fontSize: '12px',
              padding: '8px 12px'
            }}
            onClick={() => setShowOnlyStrongReversals(!showOnlyStrongReversals)}
            title={showOnlyStrongReversals ? 
              'عرض نقاط الانعكاس القوية فقط مفعل' : 
              'تفعيل عرض نقاط الانعكاس القوية فقط'
            }
          >
            {showOnlyStrongReversals ? '🔴⭐' : '🔴📍'} نقاط الانعكاس
          </button>
          
          <button
            style={{
              ...styles.button,
              ...(showMarketSettings ? styles.buttonActive : {})
            }}
            onClick={() => setShowMarketSettings(!showMarketSettings)}
          >
            ⚙️ إعدادات السوق
          </button>

          <button
            style={{
              ...styles.button,
              ...(showTradingControlPanel ? styles.buttonActive : {}),
              background: showTradingControlPanel ? '#4CAF50' : styles.button.background,
              color: showTradingControlPanel ? 'white' : styles.button.color
            }}
            onClick={() => setShowTradingControlPanel(!showTradingControlPanel)}
            title="لوحة التحكم الشاملة - إعدادات التحليل الفني والأسواق"
          >
            🌍 لوحة التحكم الشاملة
          </button>

          {/* أزرار التحكم في الحلقات */}
          <button
            style={{
              ...styles.button,
              ...(showDegreeRing ? styles.buttonActive : {})
            }}
            onClick={() => setShowDegreeRing(!showDegreeRing)}
          >
            🔢 حلقة الدرجات
          </button>
          
          <button
            style={{
              ...styles.button,
              ...(showZodiacRing ? styles.buttonActive : {})
            }}
            onClick={() => setShowZodiacRing(!showZodiacRing)}
          >
            ♈ حلقة الأبراج
          </button>
          
          <button
            style={{
              ...styles.button,
              ...(showWeekDaysRing ? styles.buttonActive : {})
            }}
            onClick={() => setShowWeekDaysRing(!showWeekDaysRing)}
          >
            📅 حلقة الأيام
          </button>
          
          <button
            style={{
              ...styles.button,
              ...(showAngleWheel ? styles.buttonActive : {})
            }}
            onClick={() => setShowAngleWheel(!showAngleWheel)}
          >
            ⚙️ عجلة الزوايا
          </button>

          {/* زر إظهار لوحة الإجماع متعدد الإطارات */}
          <button
            style={{
              ...styles.button,
              ...(showConsensusPanel ? styles.buttonActive : {}),
              background: showConsensusPanel ? '#2196F3' : styles.button.background,
              color: showConsensusPanel ? 'white' : styles.button.color
            }}
            onClick={() => setShowConsensusPanel(!showConsensusPanel)}
            title="إظهار/إخفاء لوحة إجماع الإطارات الزمنية"
          >
            📊 إجماع الإطارات
          </button>

          {/* ضوابط عجلة الزوايا المفصلة */}
          {showAngleWheel && (
            <>
              <div style={styles.controlGroup}>
                <label>إظهار الأرقام:</label>
                <button
                  style={{
                    ...styles.button,
                    ...(showAngleWheelAngles ? styles.buttonActive : {}),
                    fontSize: '12px',
                    padding: '8px 12px'
                  }}
                  onClick={() => setShowAngleWheelAngles(!showAngleWheelAngles)}
                >
                  📊 أرقام الزوايا
                </button>
              </div>
              
              <div style={styles.controlGroup}>
                <label>تدوير العجلة (0-360°):</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={angleWheelRotation}
                  onChange={(e) => setAngleWheelRotation(parseFloat(e.target.value))}
                  style={{...styles.input, width: '100%'}}
                />
                <span style={{fontSize: '12px', color: '#FFD700'}}>{angleWheelRotation}°</span>
              </div>
              
              <div style={styles.controlGroup}>
                <label>خطوة الزوايا:</label>
                <select
                  value={angleStepRad}
                  onChange={(e) => setAngleStepRad(parseInt(e.target.value))}
                  style={{...styles.input, width: '100%'}}
                >
                  <option value={5}>كل 5° (72 شعاع)</option>
                  <option value={10}>كل 10° (36 شعاع)</option>
                  <option value={15}>كل 15° (24 شعاع)</option>
                  <option value={30}>كل 30° (12 شعاع)</option>
                  <option value={45}>كل 45° (8 شعاع)</option>
                  <option value={60}>كل 60° (6 شعاع)</option>
                </select>
              </div>
              
              <div style={styles.controlGroup}>
                <label>لون الأشعة:</label>
                <input
                  type="color"
                  value={rayColor}
                  onChange={(e) => setRayColor(e.target.value)}
                  style={{...styles.input, width: '60px', height: '30px'}}
                />
              </div>
              
              <div style={styles.controlGroup}>
                <label>سماكة الأشعة:</label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={rayWidth}
                  onChange={(e) => setRayWidth(parseFloat(e.target.value))}
                  style={{...styles.input, width: '100%'}}
                />
                <span style={{fontSize: '12px', color: '#FFD700'}}>{rayWidth}px</span>
              </div>
            </>
          )}

          {/* أزرار التحكم في أشكال النجوم */}
        </div>

        <div style={styles.controlsGrid}>
          {/* أزرار التحكم في الزوم */}
          <button
            style={{
              ...styles.button,
              ...(zoomLevel >= maxZoom ? styles.buttonDisabled : {})
            }}
            onClick={handleZoomIn}
            disabled={zoomLevel >= maxZoom}
          >
            🔍+ تكبير ({(zoomLevel * 100).toFixed(0)}%)
          </button>
          
          <button
            style={{
              ...styles.button,
              ...(zoomLevel <= minZoom ? styles.buttonDisabled : {})
            }}
            onClick={handleZoomOut}
            disabled={zoomLevel <= minZoom}
          >
            🔍- تصغير ({(zoomLevel * 100).toFixed(0)}%)
          </button>
          
          <button
            style={{
              ...styles.button,
              ...(zoomLevel === 1 ? styles.buttonDisabled : {})
            }}
            onClick={handleResetZoom}
            disabled={zoomLevel === 1}
          >
            🎯 إعادة ضبط الزوم
          </button>
          
          <button
            style={{
              ...styles.button,
              ...(Object.keys(cellClickCounts).length === 0 ? styles.buttonDisabled : {})
            }}
            onClick={() => setCellClickCounts({})}
            disabled={Object.keys(cellClickCounts).length === 0}
          >
            🎨 مسح جميع الألوان
          </button>
        </div>

        {/* ضوابط دائرة جان التقليدية */}
        <div style={styles.controlsGrid}>
          <div style={styles.controlGroup}>
            <label>عدد الحلقات:</label>
            <input
              type="number"
              value={level}
              onChange={(e) => setLevel(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max="1000"
              style={styles.input}
            />
          </div>
          
          <div style={styles.controlGroup}>
            <label>عدد القطاعات:</label>
            <input
              type="number"
              value={settings.divisions}
              onChange={(e) => setSettings({...settings, divisions: Math.max(1, parseInt(e.target.value) || 1)})}
              min="1"
              max="1000"
              style={styles.input}
            />
          </div>
          
          <div style={styles.controlGroup}>
            <label>بداية الترقيم:</label>
            <input
              type="number"
              step="0.01"
              value={startingNumber}
              onChange={(e) => setStartingNumber(parseFloat(e.target.value) || 1.0)}
              style={styles.input}
            />
            {startingNumber % 1 !== 0 && (
              <div style={{ 
                fontSize: '10px', 
                color: '#4CAF50', 
                marginTop: '4px',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                padding: '4px',
                borderRadius: '3px',
                border: '1px solid #4CAF50'
              }}>
                💡 سيتم عرض الأرقام العشرية بتسلسل من الحلقة الثالثة: {startingNumber.toFixed(2)}, {(startingNumber + decimalStep).toFixed(2)}, {(startingNumber + decimalStep * 2).toFixed(2)}...
              </div>
            )}
            
            {selectedMarket && priceMovements[selectedMarket] && (
              <div style={{
                fontSize: '11px', 
                color: '#FFD700', 
                marginTop: '8px',
                backgroundColor: 'rgba(255, 215, 0, 0.15)',
                padding: '6px',
                borderRadius: '5px',
                border: '1px solid #FFD700',
                textAlign: 'center'
              }}>
                ⭐ مربوط بالسهم: {priceMovements[selectedMarket].symbol}<br/>
                💰 السعر الحالي: {priceMovements[selectedMarket].price.toFixed(4)}<br/>
                🎯 الخلية الأولى في الحلقة الثالثة تبدأ بهذا السعر
              </div>
            )}
          </div>
          
          <div style={styles.controlGroup}>
            <label>الخطوة:</label>
            <input
              type="number"
              value={step}
              onChange={(e) => setStep(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              style={styles.input}
            />
          </div>
          
          <div style={styles.controlGroup}>
            <label>خطوة الأرقام العشرية:</label>
            <input
              type="number"
              step="0.001"
              value={decimalStep}
              onChange={(e) => setDecimalStep(Math.max(0.001, parseFloat(e.target.value) || 0.01))}
              min="0.001"
              max="1"
              style={styles.input}
            />
          </div>
          
          <div style={styles.controlGroup}>
            <button
              style={{
                ...styles.button,
                ...(showTwoDecimals ? styles.buttonActive : {})
              }}
              onClick={() => setShowTwoDecimals(!showTwoDecimals)}
            >
              🔢 عرض رقمين بعد الفاصلة
            </button>
          </div>
          
          <div style={styles.controlGroup}>
            <label>لون حدود الخلايا:</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="color"
                value={cellBorderColor}
                onChange={(e) => setCellBorderColor(e.target.value)}
                style={{...styles.input, width: '60px', height: '30px', padding: '2px'}}
              />
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  style={{
                    ...styles.button,
                    fontSize: '10px',
                    padding: '4px 6px',
                    backgroundColor: cellBorderColor === '#D3D3D3' ? '#4CAF50' : '#333'
                  }}
                  onClick={() => setCellBorderColor('#D3D3D3')}
                  title="رمادي فاتح"
                >
                  رمادي
                </button>
                <button
                  style={{
                    ...styles.button,
                    fontSize: '10px',
                    padding: '4px 6px',
                    backgroundColor: cellBorderColor === '#FFD700' ? '#4CAF50' : '#333'
                  }}
                  onClick={() => setCellBorderColor('#FFD700')}
                  title="ذهبي"
                >
                  ذهبي
                </button>
                <button
                  style={{
                    ...styles.button,
                    fontSize: '10px',
                    padding: '4px 6px',
                    backgroundColor: cellBorderColor === '#FFFFFF' ? '#4CAF50' : '#333'
                  }}
                  onClick={() => setCellBorderColor('#FFFFFF')}
                  title="أبيض"
                >
                  أبيض
                </button>
                <button
                  style={{
                    ...styles.button,
                    fontSize: '10px',
                    padding: '4px 6px',
                    backgroundColor: cellBorderColor === '#000000' ? '#4CAF50' : '#333'
                  }}
                  onClick={() => setCellBorderColor('#000000')}
                  title="أسود"
                >
                  أسود
                </button>
              </div>
            </div>
          </div>
          
          <div style={styles.controlGroup}>
            <button
              style={{
                ...styles.button,
                ...(showNumbers ? styles.buttonActive : {})
              }}
              onClick={() => setShowNumbers(!showNumbers)}
            >
              🔢 إظهار الأرقام
            </button>
          </div>
          
          <div style={styles.controlGroup}>
            <button
              style={{
                ...styles.button,
                ...(showLevels ? styles.buttonActive : {})
              }}
              onClick={() => setShowLevels(!showLevels)}
            >
              📊 إظهار المستويات
            </button>
          </div>
        </div>

        {/* قسم الأشكال الهندسية */}
        <div style={styles.controlsGrid}>
          <div style={styles.controlGroup}>
            <label>🔶 الأشكال الهندسية:</label>
            <div style={{ position: 'relative' }}>
              <button
                style={{
                  ...styles.button,
                  backgroundColor: selectedShapes.length > 0 ? '#4CAF50' : '#f0f0f0',
                  color: selectedShapes.length > 0 ? 'white' : 'black'
                }}
                onClick={() => setShowShapeDropdown(!showShapeDropdown)}
              >
                ⚙️ اختيار الأشكال ({selectedShapes.length})
              </button>
              
              {showShapeDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                  {availableShapes.map(shape => (
                    <div key={shape.id} style={{
                      padding: '8px 12px',
                      borderBottom: '1px solid #eee',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <label style={{ 
                        cursor: 'pointer', 
                        fontSize: '14px',
                        flex: 1
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedShapes.includes(shape.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              addShape(shape.id);
                            } else {
                              removeShape(shape.id);
                            }
                          }}
                          style={{ marginRight: '8px' }}
                        />
                        {shape.name}
                      </label>
                      {selectedShapes.includes(shape.id) && (
                        <button
                          style={{
                            background: shapeProperties[shape.id]?.visible ? '#4CAF50' : '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            padding: '2px 6px',
                            fontSize: '10px',
                            cursor: 'pointer'
                          }}
                          onClick={() => toggleShapeVisibility(shape.id)}
                        >
                          {shapeProperties[shape.id]?.visible ? '👁️' : '🙈'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* تحكمات الأشكال المختارة */}
          {selectedShapes.length > 0 && (
            <div style={styles.controlGroup}>
              <label>🎨 تخصيص الأشكال:</label>
              <div style={{ 
                fontSize: '12px', 
                color: '#FFD700', 
                marginBottom: '8px',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #FFD700'
              }}>
                💡 <strong>نصيحة:</strong> يمكنك سحب رؤوس الزوايا بالماوس لتدوير الأشكال مباشرة!
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#90EE90', 
                marginBottom: '8px',
                backgroundColor: 'rgba(144, 238, 144, 0.1)',
                padding: '6px',
                borderRadius: '4px',
                border: '1px solid #90EE90'
              }}>
                🖱️ <strong>النقر على الخلايا:</strong> نقرة واحدة لتغيير اللون (4 ألوان مختلفة) • دبل كليك لإعادة اللون الأصلي
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '5px' }}>
                {selectedShapes.map(shapeId => {
                  const shape = availableShapes.find(s => s.id === shapeId);
                  const props = shapeProperties[shapeId] || {};
                  
                  return (
                    <div key={shapeId} style={{
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '8px',
                      backgroundColor: '#f9f9f9',
                      minWidth: '150px'
                    }}>
                      <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
                        {shape?.name}
                      </div>
                      
                      {/* خاصية التعبئة */}
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '10px', minWidth: '35px' }}>تعبئة:</label>
                        <button
                          style={{
                            background: (shapeId.includes('Star') ? props.fillStar : props.fillShape) ? '#4CAF50' : '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            padding: '2px 8px',
                            fontSize: '10px',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            if (shapeId.includes('Star')) {
                              updateShapeProperty(shapeId, 'fillStar', !props.fillStar);
                            } else {
                              updateShapeProperty(shapeId, 'fillShape', !props.fillShape);
                            }
                          }}
                        >
                          {(shapeId.includes('Star') ? props.fillStar : props.fillShape) ? '🟢 مفعل' : '🔴 معطل'}
                        </button>
                      </div>
                      
                      {/* خاصية إظهار الزوايا */}
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '10px', minWidth: '35px' }}>زوايا:</label>
                        <button
                          style={{
                            background: (shapeId.includes('Star') ? props.showStarAngles : props.showAngles) ? '#4CAF50' : '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            padding: '2px 8px',
                            fontSize: '10px',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            if (shapeId.includes('Star')) {
                              updateShapeProperty(shapeId, 'showStarAngles', !props.showStarAngles);
                            } else {
                              updateShapeProperty(shapeId, 'showAngles', !props.showAngles);
                            }
                          }}
                        >
                          {(shapeId.includes('Star') ? props.showStarAngles : props.showAngles) ? '📐 مفعل' : '📐 معطل'}
                        </button>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '10px', minWidth: '35px' }}>دوران:</label>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={props.rotation || 0}
                          onChange={(e) => updateShapeProperty(shapeId, 'rotation', parseInt(e.target.value))}
                          style={{ flex: 1 }}
                        />
                        <span style={{ fontSize: '10px', minWidth: '30px' }}>{props.rotation || 0}°</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div style={styles.mainContent}>
        {/* منطقة الدائرة */}
        <div style={styles.canvasContainer}>
          <canvas
            ref={canvasRef}
            style={styles.canvas}
            onClick={handleCanvasClick}
          />
        </div>

        {/* الشريط الجانبي */}
        {(showMarketSelector || showTechnicalAnalysis || showMarketSettings || showTradingControlPanel) && (
          <div style={styles.sidebar}>
            {showMarketSelector && (
              <MarketSelector
                onMarketSelect={handleMarketSelect}
              />
            )}
            
            {showTechnicalAnalysis && (
              <TechnicalAnalysisPanel />
            )}
            
            {showMarketSettings && (
              <MarketDataSettings
                priceBasedColoring={priceBasedColoring}
                setPriceBasedColoring={setPriceBasedColoring}
                showMarketOverlay={showMarketOverlay}
                setShowMarketOverlay={setShowMarketOverlay}
                gannIntegrationMode={gannIntegrationMode}
                setGannIntegrationMode={setGannIntegrationMode}
                autoUpdateAnalysis={autoUpdateAnalysis}
                setAutoUpdateAnalysis={setAutoUpdateAnalysis}
              />
            )}
            
            {/* لوحة التحكم الشاملة الجديدة */}
            {showTradingControlPanel && (
              <div style={{
                backgroundColor: '#1a1a1a',
                border: '2px solid #4CAF50',
                borderRadius: '10px',
                padding: '15px',
                marginTop: '10px',
                maxHeight: '500px',
                overflowY: 'auto'
              }}>
                <TradingControlPanel />
              </div>
            )}
          </div>
        )}
      </div>

      {/* شريط الحالة */}
      <div style={styles.statusBar}>
        <div style={styles.statusGroup}>
          <span>📊 الأسواق: {selectedMarkets.length}</span>
          {selectedMarket && priceMovements[selectedMarket] && (
            <>
              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                🎯 مربوط: {priceMovements[selectedMarket].name || selectedMarket} 
                💰 {priceMovements[selectedMarket].price}
              </span>
              <span style={{ 
                color: priceMovements[selectedMarket].movement === 'up' ? '#4CAF50' : 
                       priceMovements[selectedMarket].movement === 'down' ? '#F44336' : '#9E9E9E',
                fontWeight: 'bold' 
              }}>
                {priceMovements[selectedMarket].movement === 'up' ? '📈' : 
                 priceMovements[selectedMarket].movement === 'down' ? '📉' : '➡️'} 
                {priceMovements[selectedMarket].changePercent?.toFixed(2)}%
              </span>
              {priceMovements[selectedMarket].isReversal && (
                <span style={{ color: '#FFD700', fontWeight: 'bold' }}>
                  🔄 انعكاس {priceMovements[selectedMarket].reversalType}
                </span>
              )}
              <span style={{ fontSize: '10px', color: '#999' }}>
                RSI: {priceMovements[selectedMarket].rsi?.toFixed(0)}
                | تقلب: {priceMovements[selectedMarket].volatility?.toFixed(1)}%
                | مخاطر: {priceMovements[selectedMarket].riskLevel}
              </span>
            </>
          )}
          {selectedMarkets.length === 0 && (
            <span style={{ color: '#FF5722' }}>❌ لا يوجد سهم مختار</span>
          )}
          
          {/* معلومات الإعدادات المطبقة */}
          <span style={{ 
            fontSize: '10px', 
            color: analysisSettings?.globalStandards?.enabled?.enabled ? '#4CAF50' : '#FF5722',
            fontWeight: 'bold'
          }}>
            🌍 المعايير العالمية: {analysisSettings?.globalStandards?.enabled?.enabled ? 'مفعلة' : 'معطلة'}
          </span>
          
          {analysisSettings?.globalStandards?.enabled?.enabled && (
            <span style={{ fontSize: '9px', color: '#FFD700' }}>
              ✅ تحليل مخصص نشط
            </span>
          )}
          <span>📈 التحليل الفني: {showTechnicalAnalysis ? 'نشط' : 'معطل'}</span>
          <span style={{ 
            color: priceBasedColoring ? '#4CAF50' : '#9E9E9E',
            fontWeight: priceBasedColoring ? 'bold' : 'normal'
          }}>
            🎨 التلوين: {priceBasedColoring ? `مفعل (${Object.keys(priceMovements).length} سعر)` : 'معطل'}
          </span>
          <span>🔗 البيانات: {showMarketOverlay ? 'معروضة' : 'مخفية'}</span>
          <span>⚙️ الإعدادات: {showMarketSettings ? 'مفتوحة' : 'مغلقة'}</span>
          <span>🔍 الزوم: {(zoomLevel * 100).toFixed(0)}%</span>
          <span>🔶 الأشكال: {selectedShapes.length}</span>
          <span>🎨 الخلايا الملونة: {Object.keys(cellClickCounts).length}</span>
          {priceBasedColoring && Object.keys(priceMovements).length > 0 && (
            <span style={{ color: '#FF9800', fontSize: '11px' }}>
              🔄 آخر تحديث: {new Date(lastMarketUpdate).toLocaleTimeString('ar-SA')}
            </span>
          )}
          <span style={{ color: '#FF5722' }}>📍 الترقيم: من الحلقة الثالثة</span>
          <span style={{ color: '#4CAF50' }}>🔧 الحلقات الخارجية: أحجام ثابتة (50px)</span>
          {startingNumber % 1 !== 0 && (
            <span style={{ color: '#FF9800' }}>
              🔢 عشري: {showTwoDecimals ? 'رقمين' : 'ديناميكي'} | خطوة: {decimalStep}
            </span>
          )}
          <span style={{ color: '#9E9E9E' }}>
            🔲 حدود: <span style={{ 
              backgroundColor: cellBorderColor, 
              padding: '2px 6px', 
              borderRadius: '3px',
              color: cellBorderColor === '#FFFFFF' || cellBorderColor === '#FFD700' ? '#000' : '#FFF'
            }}>
              {cellBorderColor}
            </span>
          </span>
          {selectedShapes.length > 0 && <span style={{ color: '#00BCD4' }}>🖱️ اسحب رؤوس الأشكال للتدوير</span>}
          {isDragging && dragState.type !== 'angleWheel' && (
            <span style={{ color: '#FF6B35' }}>📐 الزوايا ظاهرة أثناء التدوير</span>
          )}
          {isDragging && <span style={{ color: '#4CAF50' }}>🔄 جاري التدوير...</span>}
          {selectedMarket && priceMovements[selectedMarket] && (
            <span style={{ color: '#00FF00', fontWeight: 'bold' }}>
              💰 مربوط بـ {priceMovements[selectedMarket].symbol}: {priceMovements[selectedMarket].price.toFixed(4)}
            </span>
          )}
        </div>
        
        {selectedMarkets.length > 0 && (
          <div style={styles.statusGroup}>
            <span>🔄 البيانات اللحظية متصلة</span>
            <span>⚡ تحديث: كل ثانية</span>
            <span>🎯 دقة جان: عالية</span>
          </div>
        )}
      </div>

      {/* إضافة مكون الإجماع متعدد الإطارات الزمنية */}
      {showConsensusPanel && (
        <MultiTimeframeConsensus 
          position={{ x: 20, y: 20 }}
          width={320}
          height={240}
        />
      )}
    </div>
  );
});

GannCircle360Content.displayName = 'GannCircle360Content';

// المكون الرئيسي مع Provider
const GannCircle360CanvasLifeTrading = React.forwardRef((props, ref) => {
  return (
    <MarketDataProvider>
      <GannCircle360Content {...props} ref={ref} />
    </MarketDataProvider>
  );
});

GannCircle360CanvasLifeTrading.displayName = 'GannCircle360CanvasLifeTrading';

export default GannCircle360CanvasLifeTrading;
