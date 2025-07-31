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
  const [selectedMarkets, setSelectedMarkets] = useState([
    'crypto_BTCUSDT',   // Bitcoin
    'crypto_ETHUSDT',   // Ethereum
    'crypto_ADAUSDT',   // Cardano
    'crypto_BNBUSDT',   // Binance Coin
    'crypto_XRPUSDT',   // Ripple
    'crypto_SOLUSDT',   // Solana
    'forex_EURUSD',     // EUR/USD
    'forex_GBPUSD',     // GBP/USD
    'forex_USDJPY',     // USD/JPY
    'forex_AUDUSD',     // AUD/USD
    'usstocks_AAPL',    // Apple
    'usstocks_TSLA',    // Tesla
    'usstocks_GOOGL',   // Google
    'usstocks_AMZN',    // Amazon
    'usstocks_MSFT',    // Microsoft
    'tasi_2222',        // أرامكو
    'tasi_1120',        // سابك
    'tasi_2010',        // الراجحي
    'tasi_1180',        // الأهلي التجاري
    'tasi_4001',        // المرافق
    'tasi_2030',        // سافكو
    'tasi_2380',        // المتقدمة
    'commodities_GOLD', // الذهب
    'commodities_OIL',  // النفط
    'commodities_SILVER', // الفضة
    'indices_SPX',      // S&P 500
    'indices_NASDAQ',   // ناسداك
    'indices_TASI'      // مؤشر تاسي
  ]); // مجموعة شاملة ومتنوعة من الأسواق العالمية والمحلية
  const [priceMovements, setPriceMovements] = useState({});
  const [gannAnalysis, setGannAnalysis] = useState({});

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

  // محاكاة متطورة لتحديث الأسعار مع تنوع في التوقيت والحركة
  useEffect(() => {
    const interval = setInterval(() => {
      setSampleMarkets(prevMarkets => {
        const updatedMarkets = { ...prevMarkets };
        const currentTime = Date.now();
        
        Object.keys(updatedMarkets).forEach(key => {
          const market = updatedMarkets[key];
          
          // تخصيص نطاق التغيير والخصائص حسب نوع السوق
          let changeRange = 0.08; // افتراضي ± 4%
          let volatilityMultiplier = 1;
          let updateProbability = 1; // احتمالية التحديث (للواقعية أكثر)
          
          if (key.startsWith('crypto_')) {
            changeRange = 0.12; // العملات الرقمية ± 6% (تقلبات أعلى)
            volatilityMultiplier = 1.5;
            updateProbability = 0.95; // تحديث مستمر تقريباً
          } else if (key.startsWith('forex_')) {
            changeRange = 0.025; // الفوركس ± 1.25% (أكثر استقراراً)
            volatilityMultiplier = 0.7;
            updateProbability = 0.8;
          } else if (key.startsWith('usstocks_')) {
            changeRange = 0.06; // الأسهم الأمريكية ± 3%
            volatilityMultiplier = 1.1;
            updateProbability = 0.85;
          } else if (key.startsWith('tasi_')) {
            changeRange = 0.045; // السوق السعودي ± 2.25%
            volatilityMultiplier = 0.9;
            updateProbability = 0.75; // تحديث أقل خلال ساعات عدم التداول
          } else if (key.startsWith('commodities_')) {
            changeRange = 0.035; // السلع ± 1.75%
            volatilityMultiplier = 0.8;
            updateProbability = 0.7;
          } else if (key.startsWith('indices_')) {
            changeRange = 0.025; // المؤشرات ± 1.25%
            volatilityMultiplier = 0.6;
            updateProbability = 0.9;
          }
          
          // تطبيق احتمالية التحديث
          if (Math.random() > updateProbability) {
            return; // تخطي هذا التحديث للواقعية
          }
          
          // إضافة تقلبات موسمية بناءً على الوقت
          const timeBasedMultiplier = 1 + 0.1 * Math.sin(currentTime / 10000);
          
          // حساب التغيير مع عوامل التقلبات
          const baseChange = (Math.random() - 0.5) * changeRange;
          const finalChange = baseChange * volatilityMultiplier * timeBasedMultiplier;
          
          const newPrice = market.price * (1 + finalChange);
          const changePercent = ((newPrice - market.price) / market.price) * 100;
          
          // تحديث السعر في البيانات المحلية
          updatedMarkets[key] = {
            ...market,
            price: newPrice,
            change: changePercent,
            lastUpdate: currentTime,
            trend: changePercent > 0 ? 'bullish' : changePercent < 0 ? 'bearish' : 'neutral'
          };
          
          // استخدام دالة تحليل الحركة لتعيين الألوان الديناميكية
          const [marketType, symbol] = key.split('_');
          analyzePriceMovement(marketType, symbol, { 
            price: newPrice,
            symbol: market.symbol,
            name: market.name
          });
          
          // تحديث بيانات السوق الأساسية
          setMarketData(prevData => ({
            ...prevData,
            [key]: {
              ...updatedMarkets[key],
              lastUpdate: new Date().toISOString()
            }
          }));
        });
        
        return updatedMarkets;
      });
    }, 1000); // تحديث كل ثانية للاختبار السريع

    return () => clearInterval(interval);
  }, []);

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

  // تحليل محسن لحركة السعر مع معلومات إضافية
  const analyzePriceMovement = (marketType, symbol, data) => {
    const key = `${marketType}_${symbol}`;
    const currentPrice = parseFloat(data.price || data.c || data.last);
    
    if (!currentPrice || isNaN(currentPrice)) return;

    setPriceMovements(prev => {
      const previousPrice = prev[key]?.price;
      
      let movement = 'neutral';
      let color = '#9E9E9E'; // رمادي للحالة المحايدة
      let intensity = 'low'; // شدة الحركة
      
      if (previousPrice && !isNaN(previousPrice)) {
        const changePercent = ((currentPrice - previousPrice) / previousPrice) * 100;
        const absoluteChange = Math.abs(changePercent);
        
        // تحديد شدة الحركة
        if (absoluteChange > 3) intensity = 'high';
        else if (absoluteChange > 1) intensity = 'medium';
        else intensity = 'low';
        
        // إضافة console.log للتصحيح مع معلومات أكثر
        console.log(`📊 ${key}: ${previousPrice.toFixed(4)} → ${currentPrice.toFixed(4)} (${changePercent.toFixed(2)}%) [${intensity}] | ${data.symbol || symbol}`);
        
        if (currentPrice > previousPrice) {
          movement = 'up';
          // تدرج الأخضر حسب قوة الصعود والشدة
          if (changePercent > 3) {
            color = intensity === 'high' ? '#00C853' : '#4CAF50'; // أخضر قوي
          } else if (changePercent > 1) {
            color = intensity === 'medium' ? '#4CAF50' : '#66BB6A'; // أخضر متوسط
          } else if (changePercent > 0.2) {
            color = '#81C784'; // أخضر فاتح
          } else {
            color = '#A5D6A7'; // أخضر ناعم جداً
          }
          console.log(`🟢 ${marketType.toUpperCase()} صعود ${intensity}: ${color} (${data.name || symbol})`);
        } else if (currentPrice < previousPrice) {
          movement = 'down';
          // تدرج الأحمر حسب قوة الهبوط والشدة
          if (changePercent < -3) {
            color = intensity === 'high' ? '#D32F2F' : '#F44336'; // أحمر قوي
          } else if (changePercent < -1) {
            color = intensity === 'medium' ? '#F44336' : '#EF5350'; // أحمر متوسط
          } else if (changePercent < -0.2) {
            color = '#E57373'; // أحمر فاتح
          } else {
            color = '#FFCDD2'; // أحمر ناعم جداً
          }
          console.log(`🔴 ${marketType.toUpperCase()} هبوط ${intensity}: ${color} (${data.name || symbol})`);
        } else {
          console.log(`➡️ ${marketType.toUpperCase()} ثبات: ${color} (${data.name || symbol})`);
        }
      } else {
        console.log(`ℹ️ ${key}: سعر أولي ${currentPrice.toFixed(4)} (${data.name || data.symbol || symbol})`);
      }

      // تحديد نقاط الانعكاس مع تحسينات
      const isReversal = detectReversal(prev[key]?.history || [], currentPrice, marketType);
      if (isReversal) {
        color = '#FFEB3B'; // أصفر لنقاط الانعكاس
        movement = 'reversal';
        console.log(`🔄 انعكاس في ${key}: ${color} (${data.name || symbol})`);
      }

      // إضافة معلومات تقنية إضافية
      const priceHistory = [...(prev[key]?.history || []).slice(-20), currentPrice];
      const volatility = calculateVolatility(priceHistory);
      const rsi = calculateRSI(priceHistory);

      return {
        ...prev,
        [key]: {
          price: currentPrice,
          movement,
          color,
          intensity,
          timestamp: Date.now(),
          history: priceHistory,
          symbol: data.symbol || symbol,
          name: data.name || `${marketType.toUpperCase()}_${symbol}`,
          marketType,
          changePercent: previousPrice ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0,
          volatility,
          rsi,
          isActive: true, // تأكيد أن السوق نشط
          lastUpdate: new Date().toLocaleTimeString('ar-SA')
        }
      };
    });
  };

  // كشف نقاط الانعكاس مع تحسينات
  const detectReversal = (priceHistory, currentPrice, marketType) => {
    if (priceHistory.length < 4) return false;
    
    const recent = priceHistory.slice(-4);
    const [prev3, prev2, prev1] = recent;
    
    // انعكاس صاعد قوي: هبوط متتالي ثم صعود
    const strongBullishReversal = prev3 > prev2 && prev2 > prev1 && prev1 < currentPrice;
    
    // انعكاس هابط قوي: صعود متتالي ثم هبوط
    const strongBearishReversal = prev3 < prev2 && prev2 < prev1 && prev1 > currentPrice;
    
    // انعكاس عادي
    const normalBullishReversal = prev2 > prev1 && prev1 < currentPrice;
    const normalBearishReversal = prev2 < prev1 && prev1 > currentPrice;
    
    // إضافة عامل السوق - بعض الأسواق أكثر تقلباً
    const volatilityMarkets = ['crypto_', 'commodities_'];
    const isVolatile = volatilityMarkets.some(type => marketType.startsWith(type));
    
    return strongBullishReversal || strongBearishReversal || 
           (isVolatile && (normalBullishReversal || normalBearishReversal));
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

  // إضافة سوق للمراقبة
  const addMarketWatch = (marketKey) => {
    if (!selectedMarkets.includes(marketKey)) {
      setSelectedMarkets(prev => [...prev, marketKey]);
      
      // بدء الاتصال إذا لم يكن موجوداً
      const [marketType, symbol] = marketKey.split('_');
      connectToMarket(marketType, symbol);
    }
  };

  // إزالة سوق من المراقبة
  const removeMarketWatch = (marketKey) => {
    setSelectedMarkets(prev => prev.filter(key => key !== marketKey));
    
    // إغلاق الاتصال
    if (connections[marketKey]) {
      connections[marketKey].close();
      setConnections(prev => {
        const newConnections = { ...prev };
        delete newConnections[marketKey];
        return newConnections;
      });
    }
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

  // بيانات السياق
  const contextValue = {
    // البيانات
    marketData,
    priceMovements,
    gannAnalysis,
    selectedMarkets,
    activeMarkets,
    sampleMarkets,
    
    // الإجراءات
    connectToMarket,
    updateMarketData,
    addMarketWatch,
    removeMarketWatch,
    applyGannAnalysis,
    
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
