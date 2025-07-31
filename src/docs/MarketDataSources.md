# مصادر البيانات المالية اللحظية لدائرة جان 360

## 🏗️ نظرة عامة على البنية التقنية

تم تطوير نظام شامل لربط دائرة جان 360 بالأسواق المالية العالمية مع دعم البيانات اللحظية وأنماط التحليل الفني المتقدمة.

## 📊 مصادر البيانات حسب السوق

### 1. العملات الرقمية (Cryptocurrency)

#### البيانات اللحظية:
- **Binance API**
  - WebSocket: `wss://stream.binance.com:9443/ws/`
  - REST API: `https://api.binance.com/api/v3/`
  - التكلفة: مجاني (مع حدود)
  - التحديث: فوري

- **CoinGecko API**
  - REST API: `https://api.coingecko.com/api/v3/`
  - WebSocket: غير متوفر
  - التكلفة: مجاني (مع حدود)
  - التحديث: كل 1-10 دقائق

- **Coinbase Pro**
  - WebSocket: `wss://ws-feed.pro.coinbase.com`
  - REST API: `https://api.pro.coinbase.com/`
  - التكلفة: مجاني
  - التحديث: فوري

### 2. الفوركس (Forex)

#### البيانات اللحظية:
- **Alpha Vantage**
  - REST API: `https://www.alphavantage.co/query`
  - المفتاح: مطلوب تسجيل مجاني
  - التحديث: كل دقيقة
  - الحد اليومي: 5 طلبات/دقيقة

- **Finnhub**
  - WebSocket: `wss://ws.finnhub.io`
  - REST API: `https://finnhub.io/api/v1/`
  - التكلفة: مجاني (60 طلب/دقيقة)
  - التحديث: فوري

- **Twelve Data**
  - WebSocket: `wss://ws.twelvedata.com/v1/quotes/price`
  - REST API: `https://api.twelvedata.com/`
  - التكلفة: مجاني (800 طلب/يوم)
  - التحديث: كل دقيقة

### 3. السوق الأمريكي (US Stocks)

#### البيانات اللحظية:
- **IEX Cloud**
  - WebSocket: `wss://ws-api.iextrading.com/1.0/tops`
  - REST API: `https://cloud.iexapis.com/stable/`
  - التكلفة: مجاني (مع حدود)
  - التحديث: فوري

- **Polygon.io**
  - WebSocket: `wss://socket.polygon.io/stocks`
  - REST API: `https://api.polygon.io/`
  - التكلفة: مجاني (5 طلبات/دقيقة)
  - التحديث: فوري

- **Yahoo Finance (غير رسمي)**
  - WebSocket: `wss://streamer.finance.yahoo.com/`
  - مجاني لكن غير مضمون الاستقرار

### 4. السوق السعودي (تاسي)

#### البيانات اللحظية:
- **السوق المالية السعودية (تداول)**
  - الموقع: `https://www.saudiexchange.sa/`
  - API رسمي محدود للعامة
  - يتطلب ترخيص للبيانات اللحظية

- **Argaam**
  - REST API: `https://www.argaam.com/ar/`
  - بيانات تأخير 15-20 دقيقة
  - مجاني مع تسجيل

- **Mubasher**
  - WebSocket: `wss://ws.mubasher.info` (تقريبي)
  - تأخير 15 دقيقة للمجاني
  - اشتراك مدفوع للحظي

- **Investing.com**
  - WebSocket: `wss://ws.investing.com` (غير موثق رسمياً)
  - بيانات تأخير متنوعة

#### الحل المقترح للتاسي:
```javascript
// استخدام عدة مصادر مع fallback
const tasiDataSources = [
  'argaam_api',      // المصدر الأول
  'mubasher_api',    // احتياطي
  'scraping_data',   // كحل أخير
  'manual_input'     // إدخال يدوي
];
```

### 5. السلع (Commodities)

#### البيانات اللحظية:
- **Metals-API**
  - REST API: `https://metals-api.com/api/`
  - التكلفة: مجاني (1000 طلب/شهر)
  - الذهب، الفضة، البلاتين

- **Oil Price API**
  - REST API: `https://api.oilpriceapi.com/`
  - التكلفة: مجاني مع حدود
  - النفط الخام، برنت

- **Commodity API**
  - REST API: `https://commodities-api.com/`
  - التكلفة: مجاني (1000 طلب/شهر)
  - جميع السلع الأساسية

### 6. المؤشرات (Indices)

#### البيانات اللحظية:
- **MarketStack**
  - REST API: `https://api.marketstack.com/`
  - التكلفة: مجاني (1000 طلب/شهر)
  - جميع المؤشرات العالمية

- **Financial Modeling Prep**
  - REST API: `https://financialmodelingprep.com/api/`
  - التكلفة: مجاني (250 طلب/يوم)
  - تحديث كل 4 ساعات مجاناً

## 🔧 التكامل مع دائرة جان

### تلوين الخلايا حسب حركة الأسعار:
- **🟢 أخضر**: السعر صاعد
- **🔴 أحمر**: السعر هابط  
- **🟡 أصفر**: نقاط الانعكاس
- **⚪ أبيض**: محايد

### ربط السعر بموقع الدائرة:
```javascript
// خوارزمية تحديد موقع السعر في دائرة 360
function calculateGannPosition(price) {
  const digits = price.toString().replace('.', '');
  const sum = digits.split('').reduce((a, b) => a + parseInt(b), 0);
  const reducedNumber = ((sum - 1) % 9) + 1;
  const sector = Math.floor(((reducedNumber - 1) / 9) * 36) + 1;
  const angle = ((reducedNumber - 1) / 9) * 360;
  
  return { sector, angle, reducedNumber };
}
```

## 📈 أنماط التحليل الفني المدمجة

### 1. تحليل جان الكلاسيكي
- زوايا جان الأساسية (1x1, 1x2, 2x1, إلخ...)
- مربعات الوقت والسعر
- دورات زمنية
- مراوح جان

### 2. فيبوناتشي المتقدم
- مستويات الارتداد (23.6%, 38.2%, 50%, 61.8%, 78.6%)
- امتدادات فيبوناتشي
- المناطق الزمنية
- أقواس فيبوناتشي

### 3. موجات إليوت
- الموجات الدافعة 5-3
- موجات التصحيح ABC
- الموجات الفرعية
- نسب فيبوناتشي في الموجات

### 4. الأنماط الكلاسيكية
- الرأس والكتفين
- القاع/القمة المزدوجة
- المثلثات (صاعد، هابط، متماثل)
- القنوات السعرية

## 🛠️ كود التنفيذ العملي

### إعداد الاتصال بالبيانات:
```javascript
// مثال للاتصال بـ Binance WebSocket
const connectToBinance = (symbol) => {
  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`);
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    updateGannCircle(data.c, symbol); // تحديث الدائرة بالسعر الجديد
  };
};

// تحديث ألوان الخلايا
const updateGannCircle = (price, symbol) => {
  const position = calculateGannPosition(price);
  const movement = detectPriceMovement(price, previousPrice);
  
  // تلوين الخلية المقابلة
  colorCell(position.sector, getMovementColor(movement));
};
```

### إعداد API للسوق السعودي:
```javascript
// حل متعدد المصادر للتاسي
const getTasiData = async (symbol) => {
  try {
    // المحاولة الأولى: Argaam
    const argaamData = await fetch(`https://api.argaam.com/ar/json/ir-api/financialdata/${symbol}`);
    if (argaamData.ok) return argaamData.json();
    
    // المحاولة الثانية: Mubasher
    const mubasherData = await fetch(`https://api.mubasher.info/v3.0/stock/${symbol}`);
    if (mubasherData.ok) return mubasherData.json();
    
    // الحل الاحتياطي: محاكاة البيانات
    return simulateTasiData(symbol);
  } catch (error) {
    console.error('Error fetching TASI data:', error);
    return simulateTasiData(symbol);
  }
};
```

## 🚀 التنفيذ والتشغيل

### 1. التثبيت:
```bash
npm install ws axios react-websocket
```

### 2. تشغيل النظام:
```bash
npm start
```

### 3. الاختبار:
- افتح المتصفح على `http://localhost:3000`
- فعل "📊 الأسواق المالية"
- اختر الأسواق المطلوبة
- فعل "🎨 تلوين الأسعار"
- راقب تحديث الألوان حسب حركة الأسعار

## 📋 قائمة المهام المطلوبة

### للمطور:
- [ ] الحصول على API keys للخدمات المطلوبة
- [ ] تفعيل CORS للخدمات الخارجية
- [ ] إنشاء خدمة Proxy للسوق السعودي
- [ ] تنفيذ نظام Cache للبيانات
- [ ] إضافة Error Handling شامل

### للمستخدم:
- [ ] اختيار الأسواق المطلوبة
- [ ] تفعيل البيانات اللحظية
- [ ] ضبط إعدادات التحليل
- [ ] مراقبة الألوان والمؤشرات

## 🔒 الأمان والخصوصية

- جميع API keys يجب حفظها في متغيرات البيئة
- استخدام HTTPS لجميع الاتصالات
- تشفير البيانات الحساسة
- عدم حفظ بيانات المستخدمين

## 📞 الدعم والمساعدة

للحصول على مساعدة في التنفيذ أو حل المشاكل:
- راجع وثائق كل API
- تحقق من صحة المفاتيح
- راقب console للأخطاء
- استخدم البيانات التجريبية للاختبار
