const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://admin:admin123@tradingviewdb.yc0suhj.mongodb.net/TradingViewData';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ تم الاتصال بقاعدة البيانات MongoDB بنجاح');
})
.catch((error) => {
  console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error);
});

// MongoDB Schema للبيانات
const candlestickSchema = new mongoose.Schema({
  symbol: { type: String, required: true, index: true },
  datetime: { type: Date, required: true, index: true },
  open: { type: Number, required: true },
  high: { type: Number, required: true },
  low: { type: Number, required: true },
  close: { type: Number, required: true },
  volume: { type: Number, default: 0 },
  interval: { type: String, default: '15m' },
  exchange: { type: String, default: 'NASDAQ' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// فهرس مركب للاستعلامات السريعة
candlestickSchema.index({ symbol: 1, datetime: 1 }, { unique: true });
candlestickSchema.index({ symbol: 1, interval: 1, datetime: -1 });

const CandlestickData = mongoose.model('CandlestickData', candlestickSchema);

// Schema للأنماط المكتشفة
const patternSchema = new mongoose.Schema({
  symbol: { type: String, required: true, index: true },
  patternType: { type: String, required: true },
  patternName: { type: String, required: true },
  confidence: { type: Number, required: true },
  datetime: { type: Date, required: true },
  direction: { type: String, enum: ['bullish', 'bearish', 'neutral'] },
  reliability: { type: Number, min: 0, max: 1 },
  platform: { type: String, enum: ['TradingView', 'MetaTrader', 'Binance'] },
  additionalData: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

const PatternData = mongoose.model('PatternData', patternSchema);

// API Routes

// 📊 جلب البيانات لرمز معين
app.get('/api/data/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { limit = 1000, interval = '15m' } = req.query;
    
    const data = await CandlestickData
      .find({ symbol, interval })
      .sort({ datetime: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      symbol,
      count: data.length,
      data: data.reverse() // ترتيب تصاعدي حسب التاريخ
    });
  } catch (error) {
    console.error('خطأ في جلب البيانات:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 📈 جلب جميع الرموز المتاحة
app.get('/api/symbols', async (req, res) => {
  try {
    const symbols = await CandlestickData.distinct('symbol');
    const symbolsInfo = await Promise.all(
      symbols.map(async (symbol) => {
        const lastData = await CandlestickData
          .findOne({ symbol })
          .sort({ datetime: -1 });
        
        const count = await CandlestickData.countDocuments({ symbol });
        
        return {
          symbol,
          lastUpdate: lastData?.datetime,
          recordCount: count,
          lastPrice: lastData?.close
        };
      })
    );
    
    res.json({
      success: true,
      count: symbols.length,
      symbols: symbolsInfo
    });
  } catch (error) {
    console.error('خطأ في جلب الرموز:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🔄 تحديث البيانات باستخدام Python script
app.post('/api/update-data', async (req, res) => {
  try {
    const { symbols, interval = '15m', n_bars = 1000 } = req.body;
    
    console.log('🔄 بدء تحديث البيانات...');
    
    // تشغيل Python script
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../scripts/data_fetcher.py'),
      JSON.stringify({ symbols, interval, n_bars })
    ]);
    
    let pythonOutput = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      pythonOutput += data.toString();
      console.log('Python output:', data.toString());
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error('Python error:', data.toString());
    });
    
    pythonProcess.on('close', async (code) => {
      if (code === 0) {
        // قراءة البيانات المحدثة من ملفات CSV وحفظها في MongoDB
        await importCSVToMongoDB();
        
        res.json({
          success: true,
          message: 'تم تحديث البيانات بنجاح',
          output: pythonOutput
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'خطأ في تحديث البيانات',
          error: errorOutput
        });
      }
    });
    
  } catch (error) {
    console.error('خطأ في تحديث البيانات:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🔍 كشف الأنماط
app.get('/api/patterns/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { limit = 100 } = req.query;
    
    const patterns = await PatternData
      .find({ symbol })
      .sort({ datetime: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      symbol,
      count: patterns.length,
      patterns
    });
  } catch (error) {
    console.error('خطأ في جلب الأنماط:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 📊 إحصائيات عامة
app.get('/api/stats', async (req, res) => {
  try {
    const totalRecords = await CandlestickData.countDocuments();
    const totalSymbols = await CandlestickData.distinct('symbol');
    const totalPatterns = await PatternData.countDocuments();
    
    const latestData = await CandlestickData
      .findOne()
      .sort({ datetime: -1 });
    
    res.json({
      success: true,
      stats: {
        totalRecords,
        totalSymbols: totalSymbols.length,
        totalPatterns,
        lastUpdate: latestData?.datetime,
        dbConnection: mongoose.connection.readyState === 1 ? 'متصل' : 'غير متصل'
      }
    });
  } catch (error) {
    console.error('خطأ في جلب الإحصائيات:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// دالة لاستيراد بيانات CSV إلى MongoDB
async function importCSVToMongoDB() {
  const dataDir = path.join(__dirname, '../data_15min');
  
  if (!fs.existsSync(dataDir)) {
    console.log('📂 مجلد البيانات غير موجود');
    return;
  }
  
  const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.csv'));
  
  for (const file of files) {
    const symbol = file.replace('.csv', '').replace('_', ':');
    const filePath = path.join(dataDir, file);
    
    console.log(`📊 معالجة ملف: ${file} للرمز: ${symbol}`);
    
    const records = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          records.push({
            symbol,
            datetime: new Date(row.datetime),
            open: parseFloat(row.open),
            high: parseFloat(row.high),
            low: parseFloat(row.low),
            close: parseFloat(row.close),
            volume: parseFloat(row.volume) || 0,
            interval: '15m'
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    if (records.length > 0) {
      try {
        // استخدام upsert لتجنب التكرار
        const bulkOps = records.map(record => ({
          updateOne: {
            filter: { symbol: record.symbol, datetime: record.datetime },
            update: { $set: record },
            upsert: true
          }
        }));
        
        const result = await CandlestickData.bulkWrite(bulkOps);
        console.log(`✅ ${symbol}: ${result.upsertedCount} سجل جديد، ${result.modifiedCount} سجل محدث`);
      } catch (error) {
        console.error(`❌ خطأ في حفظ بيانات ${symbol}:`, error);
      }
    }
  }
}

// تشغيل الخادم
app.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
  console.log(`🌐 الرابط: http://localhost:${PORT}`);
});

// معالجة إشارات الإغلاق
process.on('SIGINT', async () => {
  console.log('🔄 إغلاق الاتصال مع قاعدة البيانات...');
  await mongoose.connection.close();
  process.exit(0);
});
