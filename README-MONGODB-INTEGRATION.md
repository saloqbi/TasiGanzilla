# 🕯️ مشروع تحليل الشموع اليابانية المتقدم مع MongoDB

## 📊 نظرة عامة
مشروع متكامل لتحليل الشموع اليابانية مع دعم MongoDB السحابي وجلب البيانات من TradingView. يوفر المشروع تحليلاً متقدماً للأنماط وأدوات جان والفيبوناتشي.

## 🚀 الميزات الرئيسية

### 📈 تحليل البيانات
- ✅ جلب البيانات المباشرة من TradingView
- ✅ تخزين البيانات في MongoDB السحابي
- ✅ دعم أكثر من 100 رمز تداول
- ✅ فترات زمنية متعددة (1 دقيقة إلى شهرية)
- ✅ حفظ البيانات في ملفات CSV للنسخ الاحتياطي

### 🕯️ تحليل الشموع اليابانية
- 🔍 كشف أكثر من 25 نمط شمعة يابانية
- 📊 تحليل موثوقية الأنماط
- 🎯 دعم منصات TradingView و MetaTrader و Binance
- 📈 تحليل اتجاهات الانعكاس والاستمرار

### 🛠️ أدوات التحليل التقني
- 📐 أدوات جان (زوايا، مربع التسعة، خطوط المروحة)
- 🌀 مستويات فيبوناتشي وامتداداته
- 📊 مستويات الدعم والمقاومة
- 🎨 أشكال هندسية متقدمة

## 🏗️ البنية التقنية

```
TasiProject/
├── 📁 src/                              # المصدر الأمامي
│   ├── 📁 components/
│   │   ├── 📁 GannTools/               # أدوات التحليل
│   │   ├── 📁 DataProvider/            # مزود البيانات
│   │   └── 📁 MarketData/              # بيانات السوق
├── 📁 server/                          # الخادم الخلفي
│   ├── 📄 server.js                   # خادم Node.js
│   └── 📄 package.json                # تبعيات الخادم
├── 📁 scripts/                        # سكريبت Python
│   └── 📄 data_fetcher.py             # جامع البيانات
├── 📁 data_15min/                     # بيانات CSV
├── 📄 requirements.txt                # تبعيات Python
└── 📄 setup-project.bat              # ملف الإعداد
```

## 🛠️ التثبيت والإعداد

### 📋 المتطلبات
- **Node.js** (الإصدار 16 أو أحدث)
- **Python** (الإصدار 3.8 أو أحدث)
- **اتصال بالإنترنت** لجلب البيانات
- **حساب MongoDB** (متوفر مجاناً)

### ⚡ إعداد سريع
1. **تنزيل المشروع** إلى مجلد على جهازك
2. **تشغيل ملف الإعداد**:
   ```bash
   double-click setup-project.bat
   ```
3. **اتباع التعليمات** في النافذة

### 🔧 إعداد يدوي

#### 1. تثبيت Node.js
```bash
# تنزيل من https://nodejs.org
# تثبيت تبعيات المشروع الرئيسي
npm install

# تثبيت تبعيات الخادم
cd server
npm install
cd ..
```

#### 2. تثبيت Python
```bash
# تنزيل من https://www.python.org
# تثبيت التبعيات
pip install -r requirements.txt
```

#### 3. إعداد MongoDB
- **استخدام الاتصال الموجود** (معد مسبقاً)
- **أو إعداد قاعدة بيانات جديدة** وتحديث الرابط في:
  - `server/server.js`
  - `scripts/data_fetcher.py`

## 🚀 تشغيل المشروع

### 🎯 طريقة سريعة
```bash
# تشغيل كامل
double-click start-japanese-analysis.bat
```

### 🔧 تشغيل متقدم

#### 1. تشغيل الخادم الخلفي
```bash
cd server
npm start
# أو للتطوير
npm run dev
```

#### 2. تشغيل الواجهة الأمامية
```bash
npm run dev
# أو بناء للإنتاج
npm run build
```

#### 3. تحديث البيانات
```bash
# تحديث تلقائي
double-click update-trading-data.bat

# أو يدوياً
python scripts/data_fetcher.py
```

## 🌐 واجهات برمجة التطبيقات (API)

### 📊 جلب البيانات
```http
GET /api/data/{symbol}?limit=1000&interval=15m
```

### 📈 قائمة الرموز
```http
GET /api/symbols
```

### 🔄 تحديث البيانات
```http
POST /api/update-data
Content-Type: application/json

{
  "symbols": ["TADAWUL:TASI", "NASDAQ:AAPL"],
  "interval": "15m",
  "n_bars": 1000
}
```

### 🔍 أنماط الشموع
```http
GET /api/patterns/{symbol}?limit=100
```

### 📊 إحصائيات عامة
```http
GET /api/stats
```

## 📁 قاعدة البيانات

### 🗄️ مجموعات MongoDB
- **candlestickdatas**: بيانات الشموع اليابانية
- **patterndatas**: الأنماط المكتشفة

### 📊 هيكل البيانات
```json
{
  "symbol": "TADAWUL:TASI",
  "datetime": "2024-01-01T12:00:00Z",
  "open": 12000.50,
  "high": 12100.75,
  "low": 11950.25,
  "close": 12075.00,
  "volume": 1500000,
  "interval": "15m"
}
```

## 🎨 تخصيص المشروع

### 🔧 إضافة رموز جديدة
```python
# في scripts/data_fetcher.py
symbols = [
    "TADAWUL:TASI",
    "NYSE:AAPL",
    "BINANCE:BTCUSDT",
    # أضف رموزك هنا
]
```

### ⏰ تغيير الفترات الزمنية
```python
# الفترات المتاحة
intervals = {
    '1': '1 دقيقة',
    '5': '5 دقائق', 
    '15': '15 دقيقة',
    '1H': 'ساعة',
    '1D': 'يومي'
}
```

### 🎯 تخصيص الأنماط
```jsx
// في src/components/GannTools/JapaneseCandlestickAnalysis.jsx
const CANDLESTICK_PATTERNS = {
  // أضف أنماطك المخصصة هنا
}
```

## 🔍 استكشاف الأخطاء

### ❌ مشاكل شائعة وحلولها

#### 🔗 فشل الاتصال بـ MongoDB
```bash
# تحقق من الاتصال
ping 8.8.8.8

# تحقق من صحة رابط MongoDB
# في server/server.js السطر 12
```

#### 🐍 أخطاء Python
```bash
# تثبيت التبعيات الأساسية
pip install pandas numpy websocket-client requests pymongo

# تحقق من إصدار Python
python --version
```

#### 📦 أخطاء Node.js
```bash
# مسح الذاكرة المؤقتة
npm cache clean --force

# إعادة تثبيت التبعيات
rm -rf node_modules
npm install
```

### 📝 ملفات السجل
- **trading_data.log**: سجل جلب البيانات
- **server logs**: في وحدة التحكم
- **browser console**: أخطاء الواجهة الأمامية

## 🤝 المساهمة

### 🔄 خطوات المساهمة
1. Fork المستودع
2. إنشاء فرع للميزة (`git checkout -b feature/new-pattern`)
3. تطبيق التغييرات (`git commit -am 'Add new pattern'`)
4. رفع الفرع (`git push origin feature/new-pattern`)
5. إنشاء Pull Request

### 📝 معايير التطوير
- **كود نظيف ومُعلق**
- **اختبارات شاملة**
- **توثيق واضح**
- **دعم متعدد اللغات (عربي/إنجليزي)**

## 📄 الترخيص
هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE.md](LICENSE.md) للتفاصيل.

## 🙏 شكر وتقدير
- **TradingView** لتوفير البيانات
- **MongoDB** لخدمات قاعدة البيانات
- **مجتمع المطورين** للمساهمات والدعم

## 📞 الدعم والتواصل
- **المشاكل التقنية**: [GitHub Issues](https://github.com/saloqbi/TasiGanzilla/issues)
- **اقتراحات التحسين**: [GitHub Discussions](https://github.com/saloqbi/TasiGanzilla/discussions)
- **التوثيق**: راجع ملفات المشروع

---

**🎉 استمتع بتحليل الأسواق المالية!** 📈✨
