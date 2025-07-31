# 🔍 استكشاف الأخطاء وحلول المشاكل الشائعة

## ❌ أخطاء الاستيراد (Import Errors)

### المشكلة: "Module not found"
```
Module not found: Can't resolve '../MarketData/MarketDataProvider'
```

**الحل:**
```javascript
// تحقق من مسار الملف الصحيح
// إذا كان MarketData في نفس مجلد components:
import MarketDataProvider from './MarketData/MarketDataProvider';

// إذا كان في مجلد منفصل:
import MarketDataProvider from '../MarketData/MarketDataProvider';

// إذا كان في src مباشرة:
import MarketDataProvider from '../../MarketData/MarketDataProvider';
```

### المشكلة: "Default export not found"
```javascript
// خطأ شائع - تأكد من export default في الملفات
// في نهاية كل ملف مكون:
export default ComponentName;
```

## 🎨 مشاكل التلوين (Coloring Issues)

### المشكلة: الخلايا لا تتلون
```javascript
// تأكد من استدعاء getCellBackgroundColor بالمعاملات الصحيحة
const backgroundColor = getCellBackgroundColor(cellKey, clickCount, level, index);

// وليس الاستدعاء القديم:
// const backgroundColor = getCellBackgroundColor(cellKey, clickCount);
```

### المشكلة: ألوان خاطئة
```javascript
// في getCellBackgroundColor، تأكد من وجود البيانات:
if (!marketData) {
    return getDefaultCellColor(cellKey, clickCount); // العودة للون الافتراضي
}
```

## 📡 مشاكل البيانات (Data Issues)

### المشكلة: "Cannot read property of undefined"
```javascript
// أضف checks للبيانات:
const price = marketData?.currentPrice || 0;
const change = marketData?.priceChange || 0;

// بدلاً من:
// const price = marketData.currentPrice; // قد يسبب خطأ
```

### المشكلة: WebSocket لا يعمل
```javascript
// في بيئة التطوير، استخدم البيانات التجريبية:
const useRealData = process.env.NODE_ENV === 'production';

if (useRealData) {
    // اتصال WebSocket حقيقي
} else {
    // استخدام mockMarketData
}
```

## 🖼️ مشاكل Canvas

### المشكلة: Canvas لا يرسم
```javascript
// تأكد من وجود المرجع:
if (!canvasRef.current) return;

const canvas = canvasRef.current;
const ctx = canvas.getContext('2d');

// تأكد من أبعاد Canvas:
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
```

### المشكلة: البيانات لا تظهر على Canvas
```javascript
// تأكد من تحديث useEffect:
useEffect(() => {
    if (showMarketOverlay && selectedMarket) {
        drawMarketData();
    }
}, [showMarketOverlay, selectedMarket, marketData]);
```

## ⚙️ مشاكل الإعدادات

### المشكلة: الإعدادات لا تحفظ
```javascript
// إضافة حفظ في localStorage:
const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('gannMarketSettings', JSON.stringify(newSettings));
};

// استرجاع عند التحميل:
useEffect(() => {
    const saved = localStorage.getItem('gannMarketSettings');
    if (saved) {
        setSettings(JSON.parse(saved));
    }
}, []);
```

## 🔧 حلول سريعة

### إعادة تعيين النظام
```javascript
// إضافة زر إعادة تعيين:
const resetSystem = () => {
    setSelectedMarket(null);
    setMarketData(null);
    setShowPriceColoring(false);
    setShowTechnicalAnalysis(false);
    setShowMarketOverlay(false);
    localStorage.removeItem('gannMarketSettings');
};
```

### اختبار حالة البيانات
```javascript
// إضافة debug mode:
const debugMode = process.env.NODE_ENV === 'development';

if (debugMode) {
    console.log('Market Data:', marketData);
    console.log('Selected Market:', selectedMarket);
    console.log('Settings:', settings);
}
```

## 📱 مشاكل التوافق

### المشكلة: لا يعمل على الموبايل
```css
/* إضافة responsive CSS */
@media (max-width: 768px) {
    .gann-circle-container {
        transform: scale(0.8);
    }
    
    .market-controls {
        flex-direction: column;
    }
}
```

### المشكلة: بطء في الأداء
```javascript
// تحسين الأداء:
const throttledUpdate = useMemo(
    () => throttle(updateMarketData, 1000), // تحديث كل ثانية بدلاً من كل مللي ثانية
    []
);

// أو استخدام useMemo للحسابات الثقيلة:
const expensiveCalculation = useMemo(() => {
    return calculateComplexAnalysis(marketData);
}, [marketData]);
```

## 🛠️ أدوات التشخيص

### تحقق من حالة النظام
```javascript
// إضافة مكون للتشخيص:
const SystemStatus = () => {
    const { marketData, selectedMarket, isConnected } = useMarketData();
    
    return (
        <div style={{ 
            position: 'fixed', 
            top: 10, 
            right: 10, 
            background: 'rgba(0,0,0,0.7)', 
            color: 'white', 
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px'
        }}>
            <div>🔗 Connection: {isConnected ? '✅' : '❌'}</div>
            <div>📊 Market: {selectedMarket || 'None'}</div>
            <div>💰 Price: {marketData?.currentPrice || 'N/A'}</div>
            <div>📈 Change: {marketData?.priceChange || 'N/A'}%</div>
        </div>
    );
};
```

### لوحة تحكم للمطور
```javascript
// إضافة لوحة تحكم مخفية (Ctrl + Shift + D):
useEffect(() => {
    const handleKeyPress = (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            setShowDevPanel(!showDevPanel);
        }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
}, [showDevPanel]);
```

## 📋 قائمة تحقق سريعة

عند ظهور أي مشكلة، تحقق من:

- [ ] **المسارات صحيحة؟** (import paths)
- [ ] **المكونات exported بشكل صحيح؟**
- [ ] **البيانات موجودة قبل الاستخدام؟** (null checks)
- [ ] **Canvas مرجع بشكل صحيح؟**
- [ ] **Console لا يُظهر أخطاء؟**
- [ ] **الدوال تُستدعى بالمعاملات الصحيحة؟**
- [ ] **useEffect لديه dependencies صحيحة؟**
- [ ] **المتغيرات مُعرفة في النطاق الصحيح؟**

## 🎯 نصائح للتطوير السلس

1. **استخدم التدرج**: ابدأ بميزة واحدة واختبرها قبل إضافة أخرى
2. **راقب Console**: اتركه مفتوحاً دائماً أثناء التطوير
3. **اختبر على بيانات بسيطة**: استخدم mockData أولاً
4. **حفظ نسخ احتياطية**: قبل تعديلات كبيرة
5. **اكتب كوداً وثق نفسه**: أضف تعليقات للأجزاء المعقدة

## 🆘 طلب المساعدة

إذا استمرت المشاكل:

1. **صُف المشكلة بدقة**: ما حدث؟ ما المتوقع؟
2. **أرفق الأخطاء**: من Console
3. **وضح الخطوات**: لإعادة إنتاج المشكلة
4. **اذكر البيئة**: نظام التشغيل، المتصفح، إصدار Node.js

تذكر: كل مطور يواجه مشاكل! المهم هو التعلم من كل مشكلة وحلها. 💪
