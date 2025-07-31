import React, { createContext, useContext, useState, useEffect } from 'react';

// مصادر البيانات المالية اللحظية
const MARKET_DATA_SOURCES = {
  // العملات الرقمية
  crypto: {
    binance: 'wss://stream.binance.com:9443/ws/',
    coinbase: 'wss://ws-feed.pro.coinbase.com',
    kraken: 'wss://ws.kraken.com',
    huobi: 'wss://api.huobi.pro/ws'
  },
  
  // الفوركس
  forex: {
    alphaVantage: 'https://www.alphavantage.co/query',
    finhub: 'wss://ws.finnhub.io',
    twelveData: 'wss://ws.twelvedata.com/v1/quotes/price',
    fxempire: 'wss://ws.fxempire.com'
  },
  
  // السوق الأمريكي
  usstocks: {
    alphaVantage: 'https://www.alphavantage.co/query',
    iex: 'wss://ws-api.iextrading.com/1.0/tops',
    polygon: 'wss://socket.polygon.io/stocks',
    yahoo: 'wss://streamer.finance.yahoo.com'
  },
  
  // السوق السعودي (تاسي)
  tasi: {
    tadawul: 'https://www.saudiexchange.sa/wps/portal/tadawul/market-participants/issuers/issuer-directory/company-details',
    argaam: 'wss://ws.argaam.com',
    mubasher: 'wss://ws.mubasher.info',
    investing: 'wss://ws.investing.com'
  },
  
  // السلع
  commodities: {
    metalPrice: 'https://api.metals.live/v1/spot',
    oilPrice: 'wss://ws.oilprice.com',
    goldPrice: 'wss://ws.goldprice.org',
    tradingView: 'wss://data.tradingview.com'
  },
  
  // المؤشرات
  indices: {
    marketWatch: 'wss://ws.marketwatch.com',
    bloomberg: 'wss://ws.bloomberg.com',
    reuters: 'wss://ws.reuters.com',
    yahoo: 'wss://streamer.finance.yahoo.com'
  }
};

// أنماط تحليل جان
const GANN_ANALYSIS_PATTERNS = {
  // زوايا جان الأساسية
  angles: {
    '1x1': 45,    // الزاوية الرئيسية
    '1x2': 26.25, // صاعد
    '2x1': 63.75, // صاعد
    '1x3': 18.75, // صاعد
    '3x1': 71.25, // صاعد
    '1x4': 14.04, // صاعد
    '4x1': 75.96, // صاعد
    '1x8': 7.125, // صاعد
    '8x1': 82.5   // صاعد
  },
  
  // مستويات فيبوناتشي مدمجة مع جان
  fibonacci: {
    levels: [0, 23.6, 38.2, 50, 61.8, 100, 161.8, 261.8],
    timeZones: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
  },
  
  // دورات زمنية جان
  timeCycles: {
    daily: [1, 2, 3, 5, 7, 10, 15, 20, 30],
    weekly: [1, 2, 4, 6, 8, 13, 26, 52],
    monthly: [1, 2, 3, 6, 12, 24, 36],
    yearly: [1, 2, 5, 10, 20, 30]
  },
  
  // مربعات جان
  squares: {
    '144': { size: 144, center: 72 },
    '90': { size: 90, center: 45 },
    '52': { size: 52, center: 26 },
    '360': { size: 360, center: 180 }
  }
};

// سياق البيانات المالية
const MarketDataContext = createContext();

export const MarketDataProvider = ({ children }) => {
  // حالات البيانات المالية
  const [marketData, setMarketData] = useState({
    crypto: {},
    forex: {},
    stocks: {},
    tasi: {},
    commodities: {},
    indices: {}
  });

  const [connections, setConnections] = useState({});
  const [activeMarkets, setActiveMarkets] = useState(['tasi']); // تاسي كافتراضي
  const [selectedMarkets, setSelectedMarkets] = useState([]); // ابدأ بقائمة فارغة
  const [priceMovements, setPriceMovements] = useState({});
  const [gannAnalysis, setGannAnalysis] = useState({});
  
  // إدارة التحليل الزمني لجان
  const [timeAnalysis, setTimeAnalysis] = useState({
    selectedDateTime: new Date().toISOString().slice(0, 16),
    timeFactors: {},
    gannAngles: {},
    marketInfluence: {}
  });

  const updateTimeAnalysis = (analysisData) => {
    console.log('🕐 تحديث التحليل الزمني:', analysisData);
    setTimeAnalysis(prev => ({
      ...prev,
      ...analysisData
    }));
    
    // تطبيق التحليل على الدائرة
    applyTimeBasedAnalysis(analysisData);
  };

  const applyTimeBasedAnalysis = (analysisData) => {
    const { timeFactors, gannAngles, marketInfluence } = analysisData;
    
    // تحديث ألوان الدائرة بناءً على زوايا الوقت
    setPriceMovements(prev => {
      const updated = { ...prev };
      
      Object.keys(updated).forEach(marketKey => {
        const market = updated[marketKey];
        if (market && timeFactors) {
          // تطبيق تأثير الوقت على التحليل
          const [marketType] = marketKey.split('_');
          const influence = marketInfluence?.[marketType] || 1;
          
          // تعديل قوة الإشارة بناءً على تأثير الوقت
          const timeStrength = influence * 100;
          
          updated[marketKey] = {
            ...market,
            timeStrength,
            gannAngle: gannAngles?.primary || 0,
            timeInfluence: influence,
            isTimeActive: influence > 1,
            timeFactors
          };
        }
      });
      
      return updated;
    });
    
    console.log('✅ تم تطبيق التحليل الزمني على الدائرة');
  };

  // بيانات الإطارات الزمنية المختلفة
  const [timeframeData, setTimeframeData] = useState({
    m1: {},    // دقيقة واحدة
    m15: {},   // 15 دقيقة
    m30: {},   // 30 دقيقة
    h1: {},    // ساعة واحدة
    h4: {},    // 4 ساعات
    d1: {},    // يوم واحد
    w1: {},    // أسبوع واحد
    mo1: {},   // شهر واحد
    y1: {}     // سنة واحدة
  });

  // مراقبة تغييرات الأسواق المختارة
  useEffect(() => {
    console.log('🎯 تحديث الأسواق المختارة:', selectedMarkets);
    console.log('📊 بيانات حركة الأسعار المتاحة:', Object.keys(priceMovements));
    
    if (selectedMarkets.length === 0) {
      console.log('⚠️ لا توجد أسواق مختارة - التلوين معطل');
    } else {
      selectedMarkets.forEach(market => {
        if (priceMovements[market]) {
          console.log(`✅ بيانات متاحة لـ ${market}:`, {
            price: priceMovements[market].price,
            color: priceMovements[market].color,
            movement: priceMovements[market].movement
          });
        } else {
          console.log(`❌ لا توجد بيانات سعر لـ ${market}`);
        }
      });
    }
  }, [selectedMarkets, priceMovements]);

  // إعدادات التحليل الفني القابلة للتخصيص
  const [analysisSettings, setAnalysisSettings] = useState({
    // الإطارات الزمنية للتحليل
    timeframes: {
      m1: { enabled: true, label: 'دقيقة واحدة (1m)', interval: 60, priority: 1 },
      m15: { enabled: true, label: '15 دقيقة (15m)', interval: 900, priority: 2 },
      m30: { enabled: true, label: '30 دقيقة (30m)', interval: 1800, priority: 3 },
      h1: { enabled: true, label: 'ساعة واحدة (1h)', interval: 3600, priority: 4 },
      h4: { enabled: false, label: '4 ساعات (4h)', interval: 14400, priority: 5 },
      d1: { enabled: true, label: 'يوم واحد (1d)', interval: 86400, priority: 6 },
      w1: { enabled: true, label: 'أسبوع واحد (1w)', interval: 604800, priority: 7 },
      mo1: { enabled: true, label: 'شهر واحد (1mo)', interval: 2592000, priority: 8 },
      y1: { enabled: false, label: 'سنة واحدة (1y)', interval: 31536000, priority: 9 }
    },
    
    // الإطار الزمني النشط حالياً
    activeTimeframe: 'h1', // افتراضي: ساعة واحدة
    
    // إعدادات التحليل متعدد الإطارات الزمنية
    multiTimeframeAnalysis: {
      enabled: true,
      primaryTimeframe: 'h1',    // الإطار الزمني الرئيسي
      secondaryTimeframe: 'd1',  // الإطار الزمني الثانوي
      confirmationTimeframe: 'w1' // إطار التأكيد
    },
    
    // المعايير العالمية للتحليل الفني (مفصلة)
    globalStandards: {
      enabled: { enabled: true, label: 'تفعيل المعايير العالمية' },
      
      // معايير الصعود
      uptrend: {
        slight: { enabled: true, min: 0.1, max: 0.5, label: 'طفيف' },
        light: { enabled: true, min: 0.5, max: 1.0, label: 'خفيف' },
        medium: { enabled: true, min: 1.0, max: 2.0, label: 'متوسط' },
        strong: { enabled: true, min: 2.0, max: 5.0, label: 'قوي' },
        exceptional: { enabled: true, min: 5.0, max: 100, label: 'استثنائي' }
      },
      
      // معايير الهبوط
      downtrend: {
        slight: { enabled: true, min: -0.5, max: -0.1, label: 'طفيف' },
        light: { enabled: true, min: -1.0, max: -0.5, label: 'خفيف' },
        medium: { enabled: true, min: -2.0, max: -1.0, label: 'متوسط' },
        strong: { enabled: true, min: -5.0, max: -2.0, label: 'قوي' },
        exceptional: { enabled: true, min: -100, max: -5.0, label: 'استثنائي' }
      },
      
      // أنماط الانعكاس
      reversalPatterns: {
        vShape: { enabled: true, sensitivity: 2.5, label: 'V-Shape (انعكاس حاد)' },
        double: { enabled: true, tolerance: 3.0, label: 'Double (قمة/قاع مزدوج)' },
        triple: { enabled: true, confidence: 90, label: 'Triple (ترند ثلاثي - الأقوى)' }
      },
      
      // مؤشرات المخاطر
      riskLevels: {
        low: { enabled: true, threshold: 2.0, label: 'منخفض (تقلب < 2%)' },
        medium: { enabled: true, min: 2.0, max: 5.0, label: 'متوسط (تقلب 2-5%)' },
        high: { enabled: true, threshold: 5.0, label: 'عالي (تقلب > 5%)' }
      }
    },
    
    // نقاط جان - الفترات الزمنية
    gannPeriods: {
      shortTerm: { enabled: true, days: 7, label: 'قصيرة المدى (7 أيام)' },
      mediumTerm: { enabled: true, days: 30, label: 'متوسطة المدى (30 يوم)' },
      longTerm: { enabled: true, days: 90, label: 'طويلة المدى (90 يوم)' }
    },
    
    // معايير الصعود والهبوط
    trendCriteria: {
      rsiOverbought: { enabled: true, value: 70, label: 'RSI فوق الشراء' },
      rsiOversold: { enabled: true, value: 30, label: 'RSI فوق البيع' },
      volumeSpike: { enabled: true, multiplier: 2.0, label: 'ارتفاع الحجم (x2)' },
      priceBreakout: { enabled: true, percentage: 5.0, label: 'اختراق السعر (5%)' },
      movingAverageCross: { enabled: true, label: 'تقاطع المتوسطات المتحركة' },
      supportResistance: { enabled: true, label: 'مستويات الدعم والمقاومة' }
    },
    
    // أنماط الانعكاس
    reversalPatterns: {
      vShape: { enabled: true, sensitivity: 2.5, label: 'نمط V (انعكاس حاد)' },
      doubleTop: { enabled: true, tolerance: 3.0, label: 'القمة المزدوجة' },
      doubleBottom: { enabled: true, tolerance: 3.0, label: 'القاع المزدوج' },
      headShoulders: { enabled: true, label: 'الرأس والكتفين' },
      triangleBreakout: { enabled: true, label: 'اختراق المثلث' },
      flagPattern: { enabled: true, label: 'نمط العلم' }
    },
    
    // مؤشرات المخاطر
    riskIndicators: {
      volatilityIndex: { enabled: true, threshold: 25.0, label: 'مؤشر التقلبات' },
      correlationRisk: { enabled: true, threshold: 0.8, label: 'مخاطر الارتباط' },
      liquidityRisk: { enabled: true, label: 'مخاطر السيولة' },
      marketCap: { enabled: true, label: 'المخاطر حسب رأس المال' },
      sectorConcentration: { enabled: true, threshold: 40.0, label: 'تركز القطاعات (%)' },
      drawdownRisk: { enabled: true, threshold: 15.0, label: 'مخاطر الانخفاض (%)' }
    },
    
    // إعدادات عامة
    general: {
      globalStandards: { enabled: true, label: 'المعايير العالمية' },
      realTimeUpdates: { enabled: true, label: 'التحديثات اللحظية' },
      notifications: { enabled: true, label: 'التنبيهات' },
      autoCalculation: { enabled: true, label: 'الحساب التلقائي' }
    }
  });

  // بيانات تجريبية شاملة للأسواق (قابلة للتحديث)
  const [sampleMarkets, setSampleMarkets] = useState({
    // العملات الرقمية
    'crypto_BTCUSDT': { name: 'Bitcoin', price: 45000, change: 2.5, symbol: 'BTC' },
    'crypto_ETHUSDT': { name: 'Ethereum', price: 3200, change: -1.2, symbol: 'ETH' },
    'crypto_ADAUSDT': { name: 'Cardano', price: 0.45, change: 3.1, symbol: 'ADA' },
    'crypto_BNBUSDT': { name: 'Binance Coin', price: 240, change: -0.8, symbol: 'BNB' },
    'crypto_XRPUSDT': { name: 'Ripple', price: 0.52, change: 1.5, symbol: 'XRP' },
    'crypto_SOLUSDT': { name: 'Solana', price: 98.50, change: -2.3, symbol: 'SOL' },
    
    // الفوركس
    'forex_EURUSD': { name: 'EUR/USD', price: 1.0850, change: 0.3, symbol: 'EUR/USD' },
    'forex_GBPUSD': { name: 'GBP/USD', price: 1.2650, change: -0.5, symbol: 'GBP/USD' },
    'forex_USDJPY': { name: 'USD/JPY', price: 148.50, change: 1.2, symbol: 'USD/JPY' },
    'forex_AUDUSD': { name: 'AUD/USD', price: 0.6720, change: 0.8, symbol: 'AUD/USD' },
    
    // الأسهم الأمريكية
    'usstocks_AAPL': { name: 'Apple', price: 175.50, change: 1.8, symbol: 'AAPL' },
    'usstocks_GOOGL': { name: 'Google', price: 142.30, change: -2.1, symbol: 'GOOGL' },
    'usstocks_TSLA': { name: 'Tesla', price: 248.50, change: 4.2, symbol: 'TSLA' },
    'usstocks_AMZN': { name: 'Amazon', price: 155.20, change: 0.9, symbol: 'AMZN' },
    'usstocks_MSFT': { name: 'Microsoft', price: 378.80, change: 1.6, symbol: 'MSFT' },
    
    // السوق السعودي (تاسي)
    'tasi_2222': { name: 'أرامكو السعودية', price: 28.50, change: 0.5, symbol: '2222' },
    'tasi_1120': { name: 'سابك', price: 82.40, change: -1.3, symbol: '1120' },
    'tasi_2010': { name: 'الراجحي', price: 85.20, change: 2.1, symbol: '2010' },
    'tasi_1180': { name: 'الأهلي التجاري', price: 72.80, change: 1.4, symbol: '1180' },
    'tasi_4001': { name: 'المرافق', price: 45.60, change: -0.7, symbol: '4001' },
    'tasi_2030': { name: 'سافكو', price: 127.30, change: 2.8, symbol: '2030' },
    'tasi_2380': { name: 'المتقدمة', price: 95.70, change: 1.2, symbol: '2380' },
    
    // السلع
    'commodities_GOLD': { name: 'الذهب', price: 2035.50, change: 1.5, symbol: 'XAU/USD' },
    'commodities_OIL': { name: 'النفط الخام', price: 78.30, change: -0.9, symbol: 'WTI' },
    'commodities_SILVER': { name: 'الفضة', price: 25.20, change: 2.1, symbol: 'XAG/USD' },
    
    // المؤشرات
    'indices_SPX': { name: 'S&P 500', price: 4485.20, change: 0.7, symbol: 'SPX' },
    'indices_NASDAQ': { name: 'ناسداك', price: 13845.30, change: 1.3, symbol: 'NASDAQ' },
    'indices_TASI': { name: 'تاسي العام', price: 11275.40, change: 0.4, symbol: 'TASI' }
  });

  // دالة تغيير الإطار الزمني النشط
  const setActiveTimeframe = (timeframe) => {
    console.log(`⏰ تغيير الإطار الزمني إلى: ${timeframe}`);
    setAnalysisSettings(prev => ({
      ...prev,
      activeTimeframe: timeframe
    }));
  };

  // دالة تبديل حالة إطار زمني
  const toggleTimeframe = (timeframe) => {
    console.log(`🔄 تبديل حالة الإطار الزمني: ${timeframe}`);
    setAnalysisSettings(prev => ({
      ...prev,
      timeframes: {
        ...prev.timeframes,
        [timeframe]: {
          ...prev.timeframes[timeframe],
          enabled: !prev.timeframes[timeframe].enabled
        }
      }
    }));
  };

  // دالة تحديث بيانات إطار زمني محدد
  const updateTimeframeData = (timeframe, marketKey, data) => {
    setTimeframeData(prev => ({
      ...prev,
      [timeframe]: {
        ...prev[timeframe],
        [marketKey]: {
          ...data,
          timestamp: Date.now(),
          timeframe: timeframe
        }
      }
    }));
  };

  // دالة الحصول على بيانات إطار زمني محدد
  const getTimeframeData = (timeframe, marketKey) => {
    return timeframeData[timeframe]?.[marketKey] || null;
  };

  // دالة تحليل متعدد الإطارات الزمنية
  const analyzeMultipleTimeframes = (marketKey) => {
    const { primaryTimeframe, secondaryTimeframe, confirmationTimeframe } = analysisSettings.multiTimeframeAnalysis;
    
    const primaryData = getTimeframeData(primaryTimeframe, marketKey);
    const secondaryData = getTimeframeData(secondaryTimeframe, marketKey);
    const confirmationData = getTimeframeData(confirmationTimeframe, marketKey);
    
    console.log(`📊 تحليل متعدد الإطارات الزمنية لـ ${marketKey}:`);
    console.log(`  📈 الرئيسي (${primaryTimeframe}):`, primaryData?.movement || 'غير متاح');
    console.log(`  📊 الثانوي (${secondaryTimeframe}):`, secondaryData?.movement || 'غير متاح');
    console.log(`  ✅ التأكيد (${confirmationTimeframe}):`, confirmationData?.movement || 'غير متاح');
    
    // تحديد الإجماع
    const movements = [primaryData?.movement, secondaryData?.movement, confirmationData?.movement].filter(Boolean);
    const consensus = getConsensusMovement(movements);
    
    return {
      primary: primaryData,
      secondary: secondaryData,
      confirmation: confirmationData,
      consensus: consensus,
      strength: calculateConsensusStrength(movements)
    };
  };

  // دالة تحديد الإجماع بين الإطارات الزمنية
  const getConsensusMovement = (movements) => {
    if (movements.length === 0) return 'neutral';
    
    const upCount = movements.filter(m => m === 'up').length;
    const downCount = movements.filter(m => m === 'down').length;
    const neutralCount = movements.filter(m => m === 'neutral').length;
    
    if (upCount > downCount && upCount > neutralCount) return 'up';
    if (downCount > upCount && downCount > neutralCount) return 'down';
    return 'neutral';
  };

  // دالة حساب قوة الإجماع
  const calculateConsensusStrength = (movements) => {
    if (movements.length === 0) return 0;
    
    const consensus = getConsensusMovement(movements);
    const consensusCount = movements.filter(m => m === consensus).length;
    
    return (consensusCount / movements.length) * 100; // نسبة مئوية
  };
  useEffect(() => {
    console.log('🚀 بدء تحديث الأسعار التلقائي متعدد الإطارات الزمنية');
    
    // إنشاء فترات زمنية متعددة للتحديث
    const intervals = {};
    
    // دالة إنشاء فترة تحديث لإطار زمني محدد
    const createTimeframeInterval = (timeframe, intervalSeconds) => {
      const intervalMs = intervalSeconds * 1000;
      
      intervals[timeframe] = setInterval(() => {
        console.log(`⏰ تحديث ${timeframe} - كل ${intervalSeconds} ثانية`);
        
        setSampleMarkets(prevMarkets => {
          const updatedMarkets = { ...prevMarkets };
          const currentTime = Date.now();
          let updateCount = 0;
          
          Object.keys(updatedMarkets).forEach(key => {
            const market = updatedMarkets[key];
            
            // تخصيص التقلبات حسب الإطار الزمني
            let volatilityMultiplier = 1;
            let changeRange = 0.08;
            
            switch(timeframe) {
              case 'm1':
                volatilityMultiplier = 0.3; // تقلبات أقل للدقيقة الواحدة
                changeRange = 0.02;
                break;
              case 'm15':
                volatilityMultiplier = 0.5;
                changeRange = 0.04;
                break;
              case 'm30':
                volatilityMultiplier = 0.7;
                changeRange = 0.06;
                break;
              case 'h1':
                volatilityMultiplier = 1.0; // الافتراضي
                changeRange = 0.08;
                break;
              case 'h4':
                volatilityMultiplier = 1.3;
                changeRange = 0.12;
                break;
              case 'd1':
                volatilityMultiplier = 1.5;
                changeRange = 0.15;
                break;
              case 'w1':
                volatilityMultiplier = 2.0;
                changeRange = 0.25;
                break;
              case 'mo1':
                volatilityMultiplier = 3.0;
                changeRange = 0.40;
                break;
              case 'y1':
                volatilityMultiplier = 5.0;
                changeRange = 1.0;
                break;
            }
            
            // تطبيق احتمالية التحديث
            if (Math.random() > 0.8) return; // 80% احتمالية التحديث
            
            // حساب التغيير مع عوامل التقلبات
            const baseChange = (Math.random() - 0.5) * changeRange;
            const finalChange = baseChange * volatilityMultiplier;
            
            const oldPrice = market.price;
            const newPrice = market.price * (1 + finalChange);
            const changePercent = ((newPrice - market.price) / market.price) * 100;
            
            // تحديث البيانات الأساسية
            updatedMarkets[key] = {
              ...market,
              price: newPrice,
              change: changePercent,
              lastUpdate: currentTime,
              trend: changePercent > 0 ? 'bullish' : changePercent < 0 ? 'bearish' : 'neutral'
            };
            
            // تحديث بيانات الإطار الزمني
            updateTimeframeData(timeframe, key, {
              price: newPrice,
              change: changePercent,
              volume: Math.floor(Math.random() * 1000000),
              high: newPrice * (1 + Math.random() * 0.02),
              low: newPrice * (1 - Math.random() * 0.02),
              open: oldPrice,
              close: newPrice,
              movement: changePercent > 0.1 ? 'up' : changePercent < -0.1 ? 'down' : 'neutral',
              volatility: Math.abs(changePercent),
              symbol: market.symbol,
              name: market.name
            });
            
            updateCount++;
            
            // تحليل السعر للإطار الزمني الحالي
            if (timeframe === analysisSettings.activeTimeframe) {
              const [marketType, symbol] = key.split('_');
              analyzePriceMovement(marketType, symbol, { 
                price: newPrice,
                symbol: market.symbol,
                name: market.name
              });
            }
          });
          
          console.log(`✅ ${timeframe}: تم تحديث ${updateCount} سوق`);
          return updatedMarkets;
        });
      }, intervalMs);
    };
    
    // إنشاء فترات تحديث للإطارات الزمنية المفعلة
    Object.entries(analysisSettings.timeframes).forEach(([timeframe, config]) => {
      if (config.enabled) {
        const updateInterval = Math.max(config.interval / 60, 2); // تسريع للاختبار (حد أدنى ثانيتان)
        createTimeframeInterval(timeframe, updateInterval);
        console.log(`🔄 تفعيل تحديث ${timeframe} كل ${updateInterval} ثانية`);
      }
    });
    
    // تنظيف الفترات عند الإلغاء
    return () => {
      console.log('🛑 إيقاف جميع تحديثات الإطارات الزمنية');
      Object.values(intervals).forEach(interval => clearInterval(interval));
    };
  }, [analysisSettings.timeframes, analysisSettings.activeTimeframe]); // إعادة التشغيل عند تغيير الإعدادات

  // دالة ربط WebSocket
  const connectToMarket = (marketType, symbol) => {
    const connectionKey = `${marketType}_${symbol}`;
    
    if (connections[connectionKey]) {
      return; // الاتصال موجود بالفعل
    }

    // محاكاة الاتصال (في التطبيق الحقيقي، ستكون هذه اتصالات WebSocket حقيقية)
    const mockWs = createMockWebSocket(marketType, symbol);
    
    setConnections(prev => ({
      ...prev,
      [connectionKey]: mockWs
    }));

    return mockWs;
  };

  // إنشاء اتصال WebSocket وهمي للاختبار
  const createMockWebSocket = (marketType, symbol) => {
    const mockWs = {};
    
    // محاكاة بيانات لحظية للتاسي
    const interval = setInterval(() => {
      const mockPrice = 100 + Math.random() * 50; // سعر وهمي
      const mockData = {
        symbol: symbol,
        price: mockPrice,
        change: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 1000000),
        timestamp: Date.now()
      };

      if (mockWs.onmessage) {
        mockWs.onmessage({ 
          data: JSON.stringify(mockData) 
        });
      }
    }, 1000);

    mockWs.close = () => clearInterval(interval);
    
    setTimeout(() => {
      if (mockWs.onopen) mockWs.onopen();
    }, 100);

    return mockWs;
  };

  // تحديث بيانات السوق
  const updateMarketData = (marketType, symbol, data) => {
    setMarketData(prev => ({
      ...prev,
      [marketType]: {
        ...prev[marketType],
        [symbol]: {
          ...data,
          timestamp: Date.now()
        }
      }
    }));

    // تحليل حركة السعر لتحديد اللون
    analyzePriceMovement(marketType, symbol, data);
  };

  // تحليل محسن لحركة السعر وفقاً للمعايير العالمية
  const analyzePriceMovement = (marketType, symbol, data) => {
    const key = `${marketType}_${symbol}`;
    const currentPrice = parseFloat(data.price || data.c || data.last);
    
    if (!currentPrice || isNaN(currentPrice)) return;

    setPriceMovements(prev => {
      const previousPrice = prev[key]?.price;
      
      let movement = 'neutral';
      let color = '#9E9E9E'; // رمادي للحالة المحايدة
      let intensity = 'low'; // شدة الحركة
      let signal = 'hold'; // إشارة التداول
      let changePercent = 0; // تعريف المتغير خارج النطاق
      let absoluteChange = 0;
      
      if (previousPrice && !isNaN(previousPrice)) {
        changePercent = ((currentPrice - previousPrice) / previousPrice) * 100;
        absoluteChange = Math.abs(changePercent);
        
        // المعايير العالمية لتصنيف شدة الحركة
        // Low: أقل من 0.5%، Medium: 0.5-2%، High: أكثر من 2%
        if (absoluteChange >= 2) intensity = 'high';
        else if (absoluteChange >= 0.5) intensity = 'medium';
        else intensity = 'low';
        
        console.log(`📊 ${key}: ${previousPrice.toFixed(4)} → ${currentPrice.toFixed(4)} (${changePercent.toFixed(3)}%) [${intensity}]`);
        console.log(`🔧 الإعدادات: المعايير العالمية ${analysisSettings.globalStandards?.enabled?.enabled ? 'مفعلة' : 'معطلة'}`);
        
        // تحليل حسب المعايير العالمية المخصصة
        if (analysisSettings.globalStandards?.enabled?.enabled) {
          console.log('🌍 استخدام المعايير العالمية المخصصة');
          
          let applied = false;
          
          // معايير الصعود العالمية حسب الإعدادات المخصصة
          if (changePercent > 0) {
            // التحقق من كل مستوى صعود
            const uptrendLevels = analysisSettings.globalStandards.uptrend;
            
            // استثنائي
            if (!applied && uptrendLevels.exceptional?.enabled && 
                changePercent >= uptrendLevels.exceptional.min && 
                changePercent <= uptrendLevels.exceptional.max) {
              movement = 'up';
              intensity = 'exceptional';
              color = '#2E7D32'; // أخضر داكن
              signal = 'exceptional_buy';
              applied = true;
              console.log(`🚀 تطبيق معيار الصعود الاستثنائي: ${changePercent.toFixed(2)}%`);
            }
            
            // قوي
            if (!applied && uptrendLevels.strong?.enabled && 
                changePercent >= uptrendLevels.strong.min && 
                changePercent <= uptrendLevels.strong.max) {
              movement = 'up';
              intensity = 'strong';
              color = '#4CAF50'; // أخضر قوي
              signal = 'strong_buy';
              applied = true;
              console.log(`💪 تطبيق معيار الصعود القوي: ${changePercent.toFixed(2)}%`);
            }
            
            // متوسط
            if (!applied && uptrendLevels.medium?.enabled && 
                changePercent >= uptrendLevels.medium.min && 
                changePercent <= uptrendLevels.medium.max) {
              movement = 'up';
              intensity = 'medium';
              color = '#66BB6A'; // أخضر متوسط
              signal = 'buy';
              applied = true;
              console.log(`📈 تطبيق معيار الصعود المتوسط: ${changePercent.toFixed(2)}%`);
            }
            
            // خفيف
            if (!applied && uptrendLevels.light?.enabled && 
                changePercent >= uptrendLevels.light.min && 
                changePercent <= uptrendLevels.light.max) {
              movement = 'up';
              intensity = 'light';
              color = '#A5D6A7'; // أخضر فاتح
              signal = 'buy';
              applied = true;
              console.log(`🌱 تطبيق معيار الصعود الخفيف: ${changePercent.toFixed(2)}%`);
            }
            
            // طفيف
            if (!applied && uptrendLevels.slight?.enabled && 
                changePercent >= uptrendLevels.slight.min && 
                changePercent <= uptrendLevels.slight.max) {
              movement = 'up';
              intensity = 'slight';
              color = '#C8E6C9'; // أخضر فاتح جداً
              signal = 'weak_buy';
              applied = true;
              console.log(`🍃 تطبيق معيار الصعود الطفيف: ${changePercent.toFixed(2)}%`);
            }
          }
          
          // معايير الهبوط العالمية حسب الإعدادات المخصصة
          else if (changePercent < 0) {
            // التحقق من كل مستوى هبوط
            const downtrendLevels = analysisSettings.globalStandards.downtrend;
            
            // استثنائي
            if (!applied && downtrendLevels.exceptional?.enabled && 
                changePercent <= downtrendLevels.exceptional.min && 
                changePercent >= downtrendLevels.exceptional.max) {
              movement = 'down';
              intensity = 'exceptional';
              color = '#C62828'; // أحمر داكن
              signal = 'exceptional_sell';
              applied = true;
              console.log(`💥 تطبيق معيار الهبوط الاستثنائي: ${changePercent.toFixed(2)}%`);
            }
            
            // قوي
            if (!applied && downtrendLevels.strong?.enabled && 
                changePercent <= downtrendLevels.strong.min && 
                changePercent >= downtrendLevels.strong.max) {
              movement = 'down';
              intensity = 'strong';
              color = '#F44336'; // أحمر قوي
              signal = 'strong_sell';
              applied = true;
              console.log(`⬇️ تطبيق معيار الهبوط القوي: ${changePercent.toFixed(2)}%`);
            }
            
            // متوسط
            if (!applied && downtrendLevels.medium?.enabled && 
                changePercent <= downtrendLevels.medium.min && 
                changePercent >= downtrendLevels.medium.max) {
              movement = 'down';
              intensity = 'medium';
              color = '#E57373'; // أحمر متوسط
              signal = 'sell';
              applied = true;
              console.log(`📉 تطبيق معيار الهبوط المتوسط: ${changePercent.toFixed(2)}%`);
            }
            
            // خفيف
            if (!applied && downtrendLevels.light?.enabled && 
                changePercent <= downtrendLevels.light.min && 
                changePercent >= downtrendLevels.light.max) {
              movement = 'down';
              intensity = 'light';
              color = '#EF9A9A'; // أحمر فاتح
              signal = 'sell';
              applied = true;
              console.log(`🔻 تطبيق معيار الهبوط الخفيف: ${changePercent.toFixed(2)}%`);
            }
            
            // طفيف
            if (!applied && downtrendLevels.slight?.enabled && 
                changePercent <= downtrendLevels.slight.min && 
                changePercent >= downtrendLevels.slight.max) {
              movement = 'down';
              intensity = 'slight';
              color = '#FFCDD2'; // أحمر فاتح جداً
              signal = 'weak_sell';
              applied = true;
              console.log(`🍂 تطبيق معيار الهبوط الطفيف: ${changePercent.toFixed(2)}%`);
            }
          }
          
          // إذا لم يتم تطبيق أي معيار مخصص، استخدم النطاق الافتراضي
          if (!applied) {
            console.log(`⚠️ لم يتم العثور على معيار مطابق للتغيير ${changePercent.toFixed(3)}% - استخدام اللون الافتراضي`);
            if (changePercent > 0.05) { // صعود أكثر من 0.05%
              movement = 'up';
              color = changePercent > 1 ? '#4CAF50' : '#A5D6A7';
              signal = changePercent > 1 ? 'strong_buy' : 'buy';
            } else if (changePercent < -0.05) { // هبوط أكثر من 0.05%
              movement = 'down';
              color = changePercent < -1 ? '#F44336' : '#FFCDD2';
              signal = changePercent < -1 ? 'strong_sell' : 'sell';
            } else {
              movement = 'neutral';
              color = '#9E9E9E'; // رمادي للثبات
              signal = 'hold';
            }
          }
        } else {
          // المعايير التقليدية (كما كانت)
          if (changePercent > 0.1) { // صعود أكثر من 0.1%
            movement = 'up';
            signal = changePercent > 1 ? 'strong_buy' : 'buy';
            
            // تدرج الألوان وفقاً للمعايير العالمية
            if (changePercent >= 5) {
              color = '#00C853'; // أخضر قوي جداً
            } else if (changePercent >= 2) {
              color = '#4CAF50'; // أخضر قوي
            } else if (changePercent >= 1) {
              color = '#66BB6A'; // أخضر متوسط
            } else if (changePercent >= 0.5) {
              color = '#81C784'; // أخضر فاتح
            } else {
              color = '#A5D6A7'; // أخضر ناعم
            }
          } else if (changePercent < -0.1) { // هبوط أكثر من 0.1%
            movement = 'down';
            signal = changePercent < -1 ? 'strong_sell' : 'sell';
            
            // تدرج الألوان للهبوط
            if (changePercent <= -5) {
              color = '#B71C1C'; // أحمر قوي جداً
            } else if (changePercent <= -2) {
              color = '#D32F2F'; // أحمر قوي
            } else if (changePercent <= -1) {
              color = '#F44336'; // أحمر متوسط
            } else if (changePercent <= -0.5) {
              color = '#EF5350'; // أحمر فاتح
            } else {
              color = '#FFCDD2'; // أحمر فاتح
            }
          } else {
            // المنطقة المحايدة: -0.1% إلى +0.1%
            movement = 'neutral';
            signal = 'hold';
            color = '#9E9E9E'; // رمادي للثبات
          }
        }
        
        console.log(`${movement === 'up' ? '🟢' : movement === 'down' ? '🔴' : '⚪'} ${marketType.toUpperCase()}: ${movement} ${intensity} (${signal}) - ${color}`);
        
        // إشعار بتطبيق المعايير العالمية
        if (analysisSettings.globalStandards?.enabled?.enabled && (movement === 'up' || movement === 'down')) {
          console.log(`🌍 تم تطبيق المعايير العالمية المخصصة على ${key} - اللون المطبق: ${color}`);
        }
        
        // تسجيل إضافي للتشخيص
        console.log(`🎨 تفاصيل التلوين: ${key} - الحركة: ${movement}, الشدة: ${intensity}, اللون: ${color}, التغيير: ${changePercent.toFixed(3)}%`);
        
      } else {
        console.log(`ℹ️ ${key}: سعر أولي ${currentPrice.toFixed(4)}`);
      }

      // كشف نقاط الانعكاس وفقاً للمعايير العالمية
      const priceHistory = [...(prev[key]?.history || []).slice(-20), currentPrice];
      const isReversal = detectReversal(priceHistory, currentPrice, marketType);
      
      if (isReversal.detected) {
        color = isReversal.type === 'strong' ? '#FFD700' : '#FFEB3B'; // ذهبي للقوي، أصفر للعادي
        movement = 'reversal';
        signal = isReversal.direction === 'bullish' ? 'reversal_buy' : 'reversal_sell';
        console.log(`🔄 انعكاس ${isReversal.type} في ${key}: ${isReversal.direction}`);
      }

      // إضافة المؤشرات الفنية العالمية
      const volatility = calculateVolatility(priceHistory);
      const rsi = calculateRSI(priceHistory);
      
      // استخدام معايير RSI المخصصة
      const rsiOverbought = analysisSettings.trendCriteria.rsiOverbought.enabled ? 
        analysisSettings.trendCriteria.rsiOverbought.value : 70;
      const rsiOversold = analysisSettings.trendCriteria.rsiOversold.enabled ? 
        analysisSettings.trendCriteria.rsiOversold.value : 30;
      
      // تقييم حالة RSI
      let rsiSignal = 'neutral';
      if (rsi >= rsiOverbought && analysisSettings.trendCriteria.rsiOverbought.enabled) {
        rsiSignal = 'overbought';
        color = '#FF5722'; // أحمر للإفراط في الشراء
      } else if (rsi <= rsiOversold && analysisSettings.trendCriteria.rsiOversold.enabled) {
        rsiSignal = 'oversold';
        color = '#4CAF50'; // أخضر لفرصة الشراء
      }
      const sma = calculateSMA(priceHistory, 5); // متوسط متحرك بسيط 5 فترات
      const ema = calculateEMA(priceHistory, 5); // متوسط متحرك أسي 5 فترات

      return {
        ...prev,
        [key]: {
          price: currentPrice,
          movement,
          color,
          intensity,
          signal, // إشارة التداول
          timestamp: Date.now(),
          history: priceHistory,
          symbol: data.symbol || symbol,
          name: data.name || `${marketType.toUpperCase()}_${symbol}`,
          marketType,
          changePercent: previousPrice ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0,
          
          // المؤشرات الفنية العالمية
          volatility,
          rsi,
          rsiSignal,
          rsiOverbought,
          rsiOversold,
          sma,
          ema,
          
          // معلومات الانعكاس
          isReversal: isReversal.detected,
          reversalType: isReversal.type,
          reversalDirection: isReversal.direction,
          reversalPattern: isReversal.pattern,
          
          // حالة النشاط
          isActive: true,
          lastUpdate: new Date().toLocaleTimeString('ar-SA'),
          
          // تصنيف المخاطر العالمي (حسب الإعدادات)
          riskLevel: getRiskLevel(volatility, absoluteChange),
          
          // قوة الترند
          trendStrength: getTrendStrength(changePercent, volatility),
          
          // إعدادات التحليل المطبقة
          appliedSettings: {
            rsiEnabled: analysisSettings.trendCriteria.rsiOverbought.enabled || analysisSettings.trendCriteria.rsiOversold.enabled,
            reversalPatternsEnabled: Object.values(analysisSettings.reversalPatterns).some(p => p.enabled),
            globalStandards: analysisSettings.general.globalStandards.enabled
          }
        }
      };
    });
  };

  // دوال مساعدة للمعايير العالمية (مع الإعدادات المخصصة)
  const getRiskLevel = (volatility, changePercent) => {
    // استخدام إعدادات المخاطر المخصصة
    const volatilityThreshold = analysisSettings.riskIndicators.volatilityIndex.enabled ? 
      analysisSettings.riskIndicators.volatilityIndex.threshold : 25.0;
    const drawdownThreshold = analysisSettings.riskIndicators.drawdownRisk.enabled ? 
      analysisSettings.riskIndicators.drawdownRisk.threshold : 15.0;
    
    // تحويل العتبات من النسب المئوية
    const highVolatility = volatilityThreshold / 5; // 25% -> 5%
    const mediumVolatility = volatilityThreshold / 10; // 25% -> 2.5%
    const highChange = drawdownThreshold / 5; // 15% -> 3%
    const mediumChange = drawdownThreshold / 15; // 15% -> 1%
    
    if (volatility > highVolatility || changePercent > highChange) return 'high';
    if (volatility > mediumVolatility || changePercent > mediumChange) return 'medium';
    return 'low';
  };

  const getTrendStrength = (changePercent, volatility) => {
    const absChange = Math.abs(changePercent);
    
    // استخدام إعداد اختراق السعر لتحديد القوة
    const breakoutThreshold = analysisSettings.trendCriteria.priceBreakout.enabled ? 
      analysisSettings.trendCriteria.priceBreakout.percentage : 5.0;
    
    const strongThreshold = breakoutThreshold / 2.5; // 5% -> 2%
    const mediumThreshold = breakoutThreshold / 5; // 5% -> 1%
    
    if (absChange > strongThreshold && volatility < 3) return 'strong';
    if (absChange > mediumThreshold) return 'medium';
    return 'weak';
  };

  // حساب المتوسط المتحرك البسيط (SMA)
  const calculateSMA = (prices, period) => {
    if (prices.length < period) return prices[prices.length - 1] || 0;
    const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
    return sum / period;
  };

  // حساب المتوسط المتحرك الأسي (EMA)
  const calculateEMA = (prices, period) => {
    if (prices.length < 2) return prices[prices.length - 1] || 0;
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    return ema;
  };

  // كشف نقاط الانعكاس وفقاً للمعايير العالمية المحسنة
  const detectReversal = (priceHistory, currentPrice, marketType) => {
    if (priceHistory.length < 6) return { detected: false };
    
    const recent = priceHistory.slice(-6);
    const [prev5, prev4, prev3, prev2, prev1] = recent;
    
    // استخدام الإعدادات المخصصة للانعكاس
    const vShapeEnabled = analysisSettings.reversalPatterns.vShape.enabled;
    const vShapeSensitivity = analysisSettings.reversalPatterns.vShape.sensitivity || 2.5;
    const doubleTopEnabled = analysisSettings.reversalPatterns.doubleTop.enabled;
    const doubleBottomEnabled = analysisSettings.reversalPatterns.doubleBottom.enabled;
    const doubleTolerance = analysisSettings.reversalPatterns.doubleTop.tolerance || 3.0;
    
    // المعايير العالمية للانعكاس (قابلة للتخصيص)
    const minChangePercent = vShapeSensitivity / 10; // تحويل الحساسية إلى نسبة مئوية
    const strongChangePercent = vShapeSensitivity / 5; // للانعكاس القوي
    
    const changeFromPrev = ((currentPrice - prev1) / prev1) * 100;
    const absChange = Math.abs(changeFromPrev);
    
    // تجاهل التغييرات الطفيفة
    if (absChange < minChangePercent) return { detected: false };
    
    let reversalType = 'normal';
    let direction = null;
    let confidence = 0;
    let pattern = '';
    
    // أنماط الانعكاس العالمية المعترف بها (حسب الإعدادات)
    
    // 1. انعكاس V-Shape (انعكاس حاد) - إذا كان مفعلاً
    const vShapeBullish = vShapeEnabled && prev2 > prev1 && prev1 < currentPrice && absChange >= strongChangePercent;
    const vShapeBearish = vShapeEnabled && prev2 < prev1 && prev1 > currentPrice && absChange >= strongChangePercent;
    
    // 2. انعكاس Double Bottom/Top - إذا كان مفعلاً
    const tolerance = doubleTolerance / 100; // تحويل إلى عشري
    const doubleBullish = doubleBottomEnabled && 
      Math.abs((prev3 - prev1) / prev3) <= tolerance && 
      prev2 < prev1 && prev1 < currentPrice;
    const doubleBearish = doubleTopEnabled && 
      Math.abs((prev3 - prev1) / prev3) <= tolerance && 
      prev2 > prev1 && prev1 > currentPrice;
    
    // 3. انعكاس الترند الثلاثي (أقوى إشارة) - إذا كانت الأنماط مفعلة
    const tripleBullish = analysisSettings.reversalPatterns.triangleBreakout.enabled &&
      prev5 > prev4 && prev4 > prev3 && prev3 > prev2 && prev2 > prev1 && prev1 < currentPrice;
    const tripleBearish = analysisSettings.reversalPatterns.triangleBreakout.enabled &&
      prev5 < prev4 && prev4 < prev3 && prev3 < prev2 && prev2 < prev1 && prev1 > currentPrice;
    
    // تحديد نوع الانعكاس والثقة
    if (tripleBullish || tripleBearish) {
      reversalType = 'strong';
      direction = tripleBullish ? 'bullish' : 'bearish';
      confidence = 90;
      pattern = 'Triangle Breakout';
    } else if ((vShapeBullish || vShapeBearish) && absChange >= strongChangePercent) {
      reversalType = 'strong';
      direction = vShapeBullish ? 'bullish' : 'bearish';
      confidence = 75;
      pattern = 'V-Shape';
    } else if (doubleBullish || doubleBearish) {
      reversalType = 'normal';
      direction = doubleBullish ? 'bullish' : 'bearish';
      confidence = 60;
      pattern = doubleBullish ? 'Double Bottom' : 'Double Top';
    } else if (vShapeBullish || vShapeBearish) {
      reversalType = 'weak';
      direction = vShapeBullish ? 'bullish' : 'bearish';
      confidence = 45;
      pattern = 'Weak V-Shape';
    }
    
    // تعديل حسب نوع السوق (المعايير العالمية)
    const marketMultipliers = {
      'crypto': 1.5,      // الأسواق المتقلبة تحتاج تغيير أكبر
      'commodities': 1.3,
      'forex': 1.1,
      'usstocks': 1.0,    // السوق الأمريكي مرجعي
      'tasi': 1.2,        // الأسواق الناشئة
      'indices': 0.8      // المؤشرات أقل تقلباً
    };
    
    const multiplier = marketMultipliers[marketType] || 1.0;
    const adjustedThreshold = minChangePercent * multiplier;
    
    if (direction && absChange >= adjustedThreshold && confidence >= 45) {
      return {
        detected: true,
        type: reversalType,
        direction: direction,
        confidence: confidence,
        changePercent: changeFromPrev,
        pattern: pattern || 'Unknown',
        marketMultiplier: multiplier,
        settings: {
          vShapeEnabled,
          doubleTopEnabled,
          doubleBottomEnabled,
          sensitivity: vShapeSensitivity,
          tolerance: doubleTolerance
        }
      };
    }
    
    return { detected: false };
  };

  // حساب التقلبات
  const calculateVolatility = (priceHistory) => {
    if (priceHistory.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < priceHistory.length; i++) {
      const returnRate = (priceHistory[i] - priceHistory[i-1]) / priceHistory[i-1];
      returns.push(returnRate);
    }
    
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    
    return Math.sqrt(variance) * 100; // تحويل إلى نسبة مئوية
  };

  // حساب مؤشر القوة النسبية RSI
  const calculateRSI = (priceHistory, period = 14) => {
    if (priceHistory.length < period + 1) return 50; // قيمة محايدة
    
    const changes = [];
    for (let i = 1; i < priceHistory.length; i++) {
      changes.push(priceHistory[i] - priceHistory[i-1]);
    }
    
    const recentChanges = changes.slice(-period);
    const gains = recentChanges.filter(change => change > 0);
    const losses = recentChanges.filter(change => change < 0).map(loss => Math.abs(loss));
    
    const avgGain = gains.length > 0 ? gains.reduce((sum, gain) => sum + gain, 0) / gains.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((sum, loss) => sum + loss, 0) / losses.length : 0;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    return rsi;
  };

  // تطبيق تحليل جان على البيانات
  const applyGannAnalysis = (marketType, symbol, timeframe = 'daily') => {
    const marketKey = `${marketType}_${symbol}`;
    const data = marketData[marketType]?.[symbol];
    
    if (!data || !data.price) return null;

    const price = parseFloat(data.price);
    const analysis = {
      squares: analyzeGannSquares(price),
      angles: analyzeGannAngles(price, data.history || []),
      cycles: analyzeTimeCycles(data.timestamp, timeframe),
      levels: calculateGannLevels(price)
    };

    setGannAnalysis(prev => ({
      ...prev,
      [marketKey]: {
        ...analysis,
        timestamp: Date.now(),
        timeframe
      }
    }));

    return analysis;
  };

  // تحليل مربعات جان
  const analyzeGannSquares = (price) => {
    const squares = {};
    
    Object.entries(GANN_ANALYSIS_PATTERNS.squares).forEach(([name, config]) => {
      const position = (price % config.size) / config.size;
      const quadrant = Math.floor(position * 4) + 1;
      
      squares[name] = {
        position: position * 360, // تحويل إلى درجات
        quadrant,
        resistance: Math.ceil(price / config.size) * config.size,
        support: Math.floor(price / config.size) * config.size
      };
    });

    return squares;
  };

  // تحليل زوايا جان
  const analyzeGannAngles = (currentPrice, priceHistory) => {
    if (priceHistory.length < 2) return {};

    const startPrice = priceHistory[0];
    const priceChange = currentPrice - startPrice;
    const timeUnits = priceHistory.length;
    
    const angles = {};
    
    Object.entries(GANN_ANALYSIS_PATTERNS.angles).forEach(([name, angle]) => {
      const expectedChange = Math.tan(angle * Math.PI / 180) * timeUnits;
      const deviation = Math.abs(priceChange - expectedChange) / startPrice;
      
      angles[name] = {
        angle,
        expected: startPrice + expectedChange,
        actual: currentPrice,
        deviation: deviation * 100,
        trend: priceChange > expectedChange ? 'above' : 'below'
      };
    });

    return angles;
  };

  // تحليل الدورات الزمنية
  const analyzeTimeCycles = (timestamp, timeframe) => {
    const cycles = GANN_ANALYSIS_PATTERNS.timeCycles[timeframe] || [];
    const currentTime = new Date(timestamp);
    
    return cycles.map(cycle => ({
      period: cycle,
      nextCycle: new Date(currentTime.getTime() + cycle * 24 * 60 * 60 * 1000),
      daysUntilNext: cycle
    }));
  };

  // حساب مستويات جان
  const calculateGannLevels = (price) => {
    const levels = [];
    const basePrice = Math.floor(price);
    
    GANN_ANALYSIS_PATTERNS.fibonacci.levels.forEach(level => {
      const value = basePrice * (1 + level / 100);
      levels.push({
        level: level,
        price: value,
        type: level === 0 ? 'base' : level > 100 ? 'resistance' : 'retracement'
      });
    });

    return levels;
  };

  // إضافة سوق للمراقبة (سهم واحد فقط مختار)
  const addMarketWatch = (marketKey) => {
    console.log(`🔍 إضافة السوق: ${marketKey} (إلغاء جميع الأسهم الأخرى)`);
    
    // إغلاق جميع الاتصالات السابقة
    Object.keys(connections).forEach(key => {
      if (connections[key] && connections[key].close) {
        connections[key].close();
      }
    });
    
    // تعيين السوق الجديد كالوحيد المختار
    setSelectedMarkets([marketKey]);
    console.log(`✅ تم تعيين السوق المختار: ${marketKey}`);
    
    // إعادة تعيين الاتصالات
    setConnections({});
    
    // بدء الاتصال للسوق الجديد
    const [marketType, symbol] = marketKey.split('_');
    connectToMarket(marketType, symbol);
    
    // التحقق من وجود بيانات السعر
    setTimeout(() => {
      if (priceMovements[marketKey]) {
        console.log(`📊 بيانات السعر متاحة لـ ${marketKey}:`, priceMovements[marketKey]);
      } else {
        console.log(`⚠️ لا توجد بيانات سعر لـ ${marketKey} - سيتم إنشاؤها تلقائياً`);
      }
    }, 1000);
  };

  // إزالة سوق من المراقبة (مسح جميع الأسواق المختارة)
  const removeMarketWatch = (marketKey) => {
    console.log(`إزالة السوق: ${marketKey} (مسح جميع الأسهم)`);
    
    // مسح جميع الأسواق المختارة
    setSelectedMarkets([]);
    
    // إغلاق جميع الاتصالات
    Object.keys(connections).forEach(key => {
      if (connections[key] && connections[key].close) {
        connections[key].close();
      }
    });
    
    // إعادة تعيين الاتصالات
    setConnections({});
  };

  // مسح جميع الأسواق المختارة
  const clearAllMarkets = () => {
    console.log('مسح جميع الأسواق المختارة');
    setSelectedMarkets([]);
    
    // إغلاق جميع الاتصالات
    Object.values(connections).forEach(connection => {
      if (connection && connection.close) {
        connection.close();
      }
    });
    setConnections({});
  };

  // تنظيف الاتصالات عند إلغاء تحميل المكون
  useEffect(() => {
    return () => {
      Object.values(connections).forEach(connection => {
        if (connection && connection.close) {
          connection.close();
        }
      });
    };
  }, [connections]);

  // دالة تحديث إعدادات التحليل الفني
  const updateAnalysisSettings = (category, key, property, value) => {
    console.log(`🔧 تحديث الإعدادات: ${category}.${key}.${property} = ${value}`);
    
    // معالجة خاصة للمعايير العالمية المعقدة
    if (category === 'globalStandards' && key.includes('.')) {
      const [subCategory, subKey] = key.split('.');
      
      setAnalysisSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [subCategory]: {
            ...prev[category][subCategory],
            [subKey]: {
              ...prev[category][subCategory][subKey],
              [property]: value
            }
          }
        }
      }));
    } else {
      // المعالجة العادية للإعدادات الأخرى
      setAnalysisSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: {
            ...prev[category][key],
            [property]: value
          }
        }
      }));
    }
  };

  // دالة تبديل حالة الإعداد (تفعيل/إلغاء) - محسنة
  const toggleGlobalSetting = (category, key) => {
    console.log(`🔄 تبديل إعداد عالمي: ${category}.${key}`);
    
    setAnalysisSettings(prev => {
      const newSettings = { ...prev };
      
      if (category === 'globalStandards') {
        if (key.includes('.')) {
          const [subCategory, subKey] = key.split('.');
          newSettings[category] = {
            ...newSettings[category],
            [subCategory]: {
              ...newSettings[category][subCategory],
              [subKey]: {
                ...newSettings[category][subCategory][subKey],
                enabled: !newSettings[category][subCategory][subKey].enabled
              }
            }
          };
          console.log(`✅ تحديث ${category}.${subCategory}.${subKey}: ${!newSettings[category][subCategory][subKey].enabled ? 'مفعل' : 'معطل'}`);
        } else {
          newSettings[category] = {
            ...newSettings[category],
            [key]: {
              ...newSettings[category][key],
              enabled: !newSettings[category][key].enabled
            }
          };
          console.log(`✅ تحديث ${category}.${key}: ${!newSettings[category][key].enabled ? 'مفعل' : 'معطل'}`);
        }
      } else {
        newSettings[category] = {
          ...newSettings[category],
          [key]: {
            ...newSettings[category][key],
            enabled: !newSettings[category][key].enabled
          }
        };
        console.log(`✅ تحديث ${category}.${key}: ${!newSettings[category][key].enabled ? 'مفعل' : 'معطل'}`);
      }
      
      return newSettings;
    });
  };

  // دالة تحديث إعدادات عالمية بقيم محددة
  const updateGlobalSetting = (category, key, property, value) => {
    console.log(`🔧 تحديث إعداد عالمي: ${category}.${key}.${property} = ${value}`);
    
    setAnalysisSettings(prev => {
      const newSettings = { ...prev };
      
      if (category === 'globalStandards' && key.includes('.')) {
        const [subCategory, subKey] = key.split('.');
        newSettings[category] = {
          ...newSettings[category],
          [subCategory]: {
            ...newSettings[category][subCategory],
            [subKey]: {
              ...newSettings[category][subCategory][subKey],
              [property]: value
            }
          }
        };
      } else {
        newSettings[category] = {
          ...newSettings[category],
          [key]: {
            ...newSettings[category][key],
            [property]: value
          }
        };
      }
      
      console.log(`✅ تحديث مكتمل: ${category}.${key}.${property} = ${value}`);
      return newSettings;
    });
  };

  // دالة تبديل حالة الإعداد (تفعيل/إلغاء) - الدالة القديمة للتوافق
  const toggleAnalysisSetting = (category, key) => {
    console.log(`🔄 تبديل إعداد: ${category}.${key} (استخدام الدالة المطابقة)`);
    return toggleGlobalSetting(category, key);
  };

  // دالة إعادة تعيين الإعدادات للافتراضية
  const resetAnalysisSettings = () => {
    console.log('🔄 إعادة تعيين جميع الإعدادات للافتراضية');
    
    setAnalysisSettings({
      globalStandards: {
        enabled: { enabled: true, label: 'تفعيل المعايير العالمية' },
        uptrendLevels: { enabled: true, label: 'مستويات الصعود المخصصة' },
        downtrendLevels: { enabled: true, label: 'مستويات الهبوط المخصصة' },
        reversalPatterns: { enabled: true, label: 'أنماط الانعكاس العالمية' },
        riskAssessment: { enabled: true, label: 'تقييم المخاطر الدولي' }
      },
      gannPeriods: {
        shortTerm: { enabled: true, days: 7, label: 'قصيرة المدى (7 أيام)' },
        mediumTerm: { enabled: true, days: 30, label: 'متوسطة المدى (30 يوم)' },
        longTerm: { enabled: true, days: 90, label: 'طويلة المدى (90 يوم)' }
      },
      trendCriteria: {
        rsiOverbought: { enabled: true, value: 70, label: 'RSI فوق الشراء' },
        rsiOversold: { enabled: true, value: 30, label: 'RSI فوق البيع' },
        volumeSpike: { enabled: true, multiplier: 2.0, label: 'ارتفاع الحجم (x2)' },
        priceBreakout: { enabled: true, percentage: 5.0, label: 'اختراق السعر (5%)' },
        movingAverageCross: { enabled: true, label: 'تقاطع المتوسطات المتحركة' },
        supportResistance: { enabled: true, label: 'مستويات الدعم والمقاومة' }
      },
      reversalPatterns: {
        vShape: { enabled: true, sensitivity: 2.5, label: 'نمط V (انعكاس حاد)' },
        doubleTop: { enabled: true, tolerance: 3.0, label: 'القمة المزدوجة' },
        doubleBottom: { enabled: true, tolerance: 3.0, label: 'القاع المزدوج' },
        headShoulders: { enabled: true, label: 'الرأس والكتفين' },
        triangleBreakout: { enabled: true, label: 'اختراق المثلث' },
        flagPattern: { enabled: true, label: 'نمط العلم' }
      },
      riskIndicators: {
        volatilityIndex: { enabled: true, threshold: 25.0, label: 'مؤشر التقلبات' },
        correlationRisk: { enabled: true, threshold: 0.8, label: 'مخاطر الارتباط' },
        liquidityRisk: { enabled: true, label: 'مخاطر السيولة' },
        marketCap: { enabled: true, label: 'المخاطر حسب رأس المال' },
        sectorConcentration: { enabled: true, threshold: 40.0, label: 'تركز القطاعات (%)' },
        drawdownRisk: { enabled: true, threshold: 15.0, label: 'مخاطر الانخفاض (%)' }
      },
      general: {
        globalStandards: { enabled: true, label: 'المعايير العالمية' },
        realTimeUpdates: { enabled: true, label: 'التحديثات اللحظية' },
        notifications: { enabled: true, label: 'التنبيهات' },
        autoCalculation: { enabled: true, label: 'الحساب التلقائي' }
      }
    });
  };

  // بيانات السياق
  const contextValue = {
    // البيانات
    marketData,
    priceMovements,
    gannAnalysis,
    selectedMarkets,
    activeMarkets,
    sampleMarkets,
    analysisSettings,
    timeframeData,
    timeAnalysis,
    
    // الإجراءات
    connectToMarket,
    updateMarketData,
    addMarketWatch,
    removeMarketWatch,
    clearAllMarkets,
    applyGannAnalysis,
    updateAnalysisSettings,
    toggleAnalysisSetting,
    toggleGlobalSetting,
    updateGlobalSetting,
    resetAnalysisSettings,
    
    // إدارة الإطارات الزمنية
    setActiveTimeframe,
    toggleTimeframe,
    updateTimeframeData,
    getTimeframeData,
    analyzeMultipleTimeframes,
    
    // إدارة التحليل الزمني
    updateTimeAnalysis,
    applyTimeBasedAnalysis,
    
    // مصادر البيانات
    MARKET_DATA_SOURCES,
    GANN_ANALYSIS_PATTERNS
  };

  return (
    <MarketDataContext.Provider value={contextValue}>
      {children}
    </MarketDataContext.Provider>
  );
};

// Hook لاستخدام سياق البيانات المالية
export const useMarketData = () => {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
};

export default MarketDataProvider;
