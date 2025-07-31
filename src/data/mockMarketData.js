// بيانات تجريبية لاختبار النظام
export const MOCK_MARKET_DATA = {
  // العملات الرقمية
  crypto: {
    BTCUSDT: {
      symbol: 'BTCUSDT',
      price: 43567.89,
      change: 2.34,
      changePercent: 5.45,
      volume: 15678934,
      high: 44200.50,
      low: 42890.12,
      timestamp: Date.now()
    },
    ETHUSDT: {
      symbol: 'ETHUSDT', 
      price: 2687.45,
      change: -45.67,
      changePercent: -1.67,
      volume: 8934567,
      high: 2750.30,
      low: 2650.80,
      timestamp: Date.now()
    },
    BNBUSDT: {
      symbol: 'BNBUSDT',
      price: 312.78,
      change: 8.92,
      changePercent: 2.94,
      volume: 3456789,
      high: 318.90,
      low: 308.45,
      timestamp: Date.now()
    }
  },

  // الفوركس
  forex: {
    EURUSD: {
      symbol: 'EURUSD',
      price: 1.0892,
      change: 0.0045,
      changePercent: 0.41,
      volume: 567890123,
      high: 1.0925,
      low: 1.0867,
      timestamp: Date.now()
    },
    GBPUSD: {
      symbol: 'GBPUSD',
      price: 1.2678,
      change: -0.0034,
      changePercent: -0.27,
      volume: 345678901,
      high: 1.2715,
      low: 1.2655,
      timestamp: Date.now()
    },
    USDJPY: {
      symbol: 'USDJPY',
      price: 149.45,
      change: 0.78,
      changePercent: 0.52,
      volume: 234567890,
      high: 150.12,
      low: 148.89,
      timestamp: Date.now()
    }
  },

  // السوق الأمريكي
  usstocks: {
    AAPL: {
      symbol: 'AAPL',
      price: 192.35,
      change: 4.67,
      changePercent: 2.49,
      volume: 45678901,
      high: 194.20,
      low: 189.80,
      timestamp: Date.now()
    },
    MSFT: {
      symbol: 'MSFT',
      price: 378.92,
      change: -2.34,
      changePercent: -0.61,
      volume: 23456789,
      high: 382.50,
      low: 376.10,
      timestamp: Date.now()
    },
    TSLA: {
      symbol: 'TSLA',
      price: 248.67,
      change: 12.45,
      changePercent: 5.27,
      volume: 67890123,
      high: 252.30,
      low: 240.80,
      timestamp: Date.now()
    }
  },

  // السوق السعودي (تاسي)
  tasi: {
    '2222': {
      symbol: '2222',
      name: 'أرامكو السعودية',
      price: 34.50,
      change: 0.85,
      changePercent: 2.53,
      volume: 8765432,
      high: 35.20,
      low: 33.90,
      timestamp: Date.now()
    },
    '1120': {
      symbol: '1120',
      name: 'مصرف الراجحي',
      price: 87.20,
      change: -1.30,
      changePercent: -1.47,
      volume: 5432109,
      high: 89.10,
      low: 86.50,
      timestamp: Date.now()
    },
    '2010': {
      symbol: '2010',
      name: 'سابك',
      price: 92.80,
      change: 2.15,
      changePercent: 2.37,
      volume: 3210987,
      high: 94.50,
      low: 91.20,
      timestamp: Date.now()
    }
  },

  // السلع
  commodities: {
    XAUUSD: {
      symbol: 'XAUUSD',
      name: 'الذهب',
      price: 2034.67,
      change: 15.80,
      changePercent: 0.78,
      volume: 987654321,
      high: 2045.30,
      low: 2025.40,
      timestamp: Date.now()
    },
    CRUDE: {
      symbol: 'CRUDE',
      name: 'النفط الخام',
      price: 78.45,
      change: -2.34,
      changePercent: -2.90,
      volume: 654321098,
      high: 81.20,
      low: 77.80,
      timestamp: Date.now()
    },
    XAGUSD: {
      symbol: 'XAGUSD',
      name: 'الفضة',
      price: 24.89,
      change: 0.67,
      changePercent: 2.76,
      volume: 321098765,
      high: 25.45,
      low: 24.20,
      timestamp: Date.now()
    }
  },

  // المؤشرات
  indices: {
    SPX: {
      symbol: 'SPX',
      name: 'S&P 500',
      price: 4789.35,
      change: 23.67,
      changePercent: 0.50,
      volume: 4567890123,
      high: 4805.20,
      low: 4756.80,
      timestamp: Date.now()
    },
    TASI: {
      symbol: 'TASI',
      name: 'مؤشر تاسي',
      price: 11234.56,
      change: 45.78,
      changePercent: 0.41,
      volume: 890123456,
      high: 11289.90,
      low: 11187.30,
      timestamp: Date.now()
    },
    DJI: {
      symbol: 'DJI',
      name: 'داو جونز',
      price: 37689.54,
      change: -123.45,
      changePercent: -0.33,
      volume: 2345678901,
      high: 37850.20,
      low: 37567.80,
      timestamp: Date.now()
    }
  }
};

// دالة لمحاكاة تحديث البيانات
export const generateRandomUpdate = (currentPrice, volatility = 0.02) => {
  const change = (Math.random() - 0.5) * volatility * currentPrice;
  const newPrice = currentPrice + change;
  const changePercent = (change / currentPrice) * 100;
  
  return {
    price: parseFloat(newPrice.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    timestamp: Date.now()
  };
};

// محاكاة تحديثات مختلفة حسب نوع السوق
export const getMarketVolatility = (marketType) => {
  const volatilities = {
    crypto: 0.05,      // تذبذب عالي 5%
    forex: 0.01,       // تذبذب منخفض 1%
    usstocks: 0.02,    // تذبذب متوسط 2%
    tasi: 0.025,       // تذبذب متوسط-عالي 2.5%
    commodities: 0.03, // تذبذب متوسط-عالي 3%
    indices: 0.015     // تذبذب منخفض-متوسط 1.5%
  };
  
  return volatilities[marketType] || 0.02;
};

// أنماط حركة الأسعار للمحاكاة
export const PRICE_PATTERNS = {
  uptrend: {
    bias: 0.6,           // احتمال الصعود 60%
    momentum: 1.2,       // قوة الحركة
    description: 'اتجاه صاعد'
  },
  
  downtrend: {
    bias: 0.4,           // احتمال الصعود 40%
    momentum: 1.2,       // قوة الحركة
    description: 'اتجاه هابط'
  },
  
  sideways: {
    bias: 0.5,           // متوازن 50%
    momentum: 0.8,       // حركة أقل
    description: 'حركة جانبية'
  },
  
  volatile: {
    bias: 0.5,           // متوازن 50%
    momentum: 1.8,       // حركة قوية
    description: 'تذبذب عالي'
  },
  
  breakout: {
    bias: 0.7,           // احتمال الصعود 70%
    momentum: 2.0,       // حركة قوية جداً
    description: 'اختراق صاعد'
  },
  
  breakdown: {
    bias: 0.3,           // احتمال الصعود 30%
    momentum: 2.0,       // حركة قوية جداً
    description: 'اختراق هابط'
  }
};

// دالة متقدمة لمحاكاة البيانات مع الأنماط
export const simulateAdvancedMarketData = (symbol, marketType, pattern = 'sideways') => {
  const currentData = MOCK_MARKET_DATA[marketType]?.[symbol];
  if (!currentData) return null;

  const baseVolatility = getMarketVolatility(marketType);
  const patternConfig = PRICE_PATTERNS[pattern];
  
  // تطبيق نمط السوق
  const random = Math.random();
  const direction = random < patternConfig.bias ? 1 : -1;
  const intensity = patternConfig.momentum;
  
  // حساب التغيير
  const volatility = baseVolatility * intensity;
  const maxChange = currentData.price * volatility;
  const change = direction * Math.random() * maxChange;
  
  const newPrice = Math.max(0.01, currentData.price + change);
  const changePercent = (change / currentData.price) * 100;
  
  // حساب الحجم (يزيد مع التذبذب)
  const volumeMultiplier = 0.8 + (Math.abs(changePercent) * 0.1);
  const newVolume = Math.floor(currentData.volume * volumeMultiplier);
  
  return {
    ...currentData,
    price: parseFloat(newPrice.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    volume: newVolume,
    high: Math.max(currentData.high, newPrice),
    low: Math.min(currentData.low, newPrice),
    timestamp: Date.now(),
    pattern: pattern,
    patternDescription: patternConfig.description
  };
};

// محاكاة بيانات أخبار السوق (للاستخدام المستقبلي)
export const MOCK_NEWS_DATA = [
  {
    id: 1,
    title: 'Bitcoin يصل لمستوى جديد',
    summary: 'البيتكوين يحقق مكاسب قوية وسط تفاؤل المستثمرين',
    impact: 'positive',
    market: 'crypto',
    symbols: ['BTCUSDT'],
    timestamp: Date.now() - 300000 // منذ 5 دقائق
  },
  {
    id: 2,
    title: 'تقرير أرباح Apple يفوق التوقعات',
    summary: 'شركة آبل تحقق أرباح فصلية قوية',
    impact: 'positive',
    market: 'usstocks',
    symbols: ['AAPL'],
    timestamp: Date.now() - 1800000 // منذ 30 دقيقة
  },
  {
    id: 3,
    title: 'أرامكو تعلن عن توزيعات أرباح',
    summary: 'شركة أرامكو تعلن عن توزيع أرباح نقدية للمساهمين',
    impact: 'positive',
    market: 'tasi',
    symbols: ['2222'],
    timestamp: Date.now() - 3600000 // منذ ساعة
  }
];

export default MOCK_MARKET_DATA;
