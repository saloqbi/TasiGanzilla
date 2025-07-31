// 🌐 إعدادات التوافق مع المنصات العالمية للشموع اليابانية
// Global Platform Compatibility Configuration for Japanese Candlesticks

// 📊 TradingView Configuration
export const TRADINGVIEW_CONFIG = {
  name: 'TradingView',
  colors: {
    bullish: '#26A69A',
    bearish: '#EF5350',
    grid: 'rgba(255, 255, 255, 0.1)',
    text: '#E0E0E0',
    background: '#131722',
    volume: {
      up: 'rgba(38, 166, 154, 0.3)',
      down: 'rgba(239, 83, 80, 0.3)'
    }
  },
  timeframes: ['1s', '5s', '15s', '30s', '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '1d', '1w', '1M'],
  updateStrategy: 'aggressive',
  features: ['real_time', 'volume_profile', 'indicators', 'drawing_tools']
};

// 📈 MetaTrader Configuration  
export const METATRADER_CONFIG = {
  name: 'MetaTrader',
  colors: {
    bullish: '#00C851',
    bearish: '#FF4444',
    grid: 'rgba(255, 255, 255, 0.08)',
    text: '#FFFFFF',
    background: '#1E1E1E',
    volume: {
      up: 'rgba(0, 200, 81, 0.25)',
      down: 'rgba(255, 68, 68, 0.25)'
    }
  },
  timeframes: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'],
  updateStrategy: 'balanced',
  features: ['expert_advisors', 'custom_indicators', 'backtesting', 'auto_trading']
};

// ⚡ Binance Configuration
export const BINANCE_CONFIG = {
  name: 'Binance',
  colors: {
    bullish: '#02C076',
    bearish: '#F6465D',
    grid: 'rgba(255, 255, 255, 0.05)',
    text: '#EAECEF',
    background: '#181A20',
    volume: {
      up: 'rgba(2, 192, 118, 0.2)',
      down: 'rgba(246, 70, 93, 0.2)'
    }
  },
  timeframes: ['1s', '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
  updateStrategy: 'fast',
  features: ['spot_trading', 'futures', 'options', 'real_time_data', 'order_book']
};

// 🔄 Update Strategies Configuration
export const UPDATE_STRATEGIES = {
  aggressive: {
    name: 'عدواني (TradingView)',
    multiplier: 0.5,
    minInterval: 100,
    description: 'تحديثات سريعة جداً للتداول السريع'
  },
  fast: {
    name: 'سريع (Binance)',
    multiplier: 0.7,
    minInterval: 200,
    description: 'تحديثات سريعة للعملات المشفرة'
  },
  balanced: {
    name: 'متوازن (MetaTrader)',
    multiplier: 1.0,
    minInterval: 500,
    description: 'تحديثات متوازنة للفوركس والأسهم'
  },
  adaptive: {
    name: 'تكيفي (شامل)',
    multiplier: 0.8,
    minInterval: 300,
    description: 'يتكيف مع نوع الإطار الزمني'
  }
};

// 🎯 Smart Movement Configuration للحركة الذكية للشموع
export const SMART_MOVEMENT_CONFIG = {
  // إعدادات الاتجاه الصاعد
  bullish: {
    speedMultiplier: 1.2,     // سرعة أسرع للحركة الصاعدة
    volatility: 0.015,        // تقلب متوسط
    momentum: 0.7,            // قوة الزخم
    animation: {
      duration: 150,          // مدة الحركة بالميلي ثانية
      easing: 'ease-out',     // نوع التسارع
      glowEffect: true        // تأثير الإضاءة
    },
    colors: {
      glow: 'rgba(38, 166, 154, 0.4)',
      trail: 'rgba(76, 175, 80, 0.2)'
    }
  },
  
  // إعدادات الاتجاه الهابط
  bearish: {
    speedMultiplier: 1.1,     // سرعة أقل للحركة الهابطة
    volatility: 0.018,        // تقلب أعلى
    momentum: 0.8,            // قوة زخم أقوى
    animation: {
      duration: 180,          // مدة أطول قليلاً
      easing: 'ease-in',      // تسارع مختلف
      glowEffect: true
    },
    colors: {
      glow: 'rgba(239, 83, 80, 0.4)',
      trail: 'rgba(244, 67, 54, 0.2)'
    }
  },
  
  // إعدادات نقاط الانعكاس
  reversal: {
    speedMultiplier: 0.6,     // حركة أبطأ عند الانعكاس
    volatility: 0.025,        // تقلب عالي
    momentum: 0.4,            // زخم أقل
    animation: {
      duration: 300,          // مدة أطول للانعكاس
      easing: 'ease-in-out',  // تسارع متوازن
      glowEffect: true,
      pulseEffect: true       // تأثير النبض للانعكاس
    },
    colors: {
      glow: 'rgba(255, 215, 0, 0.6)',
      trail: 'rgba(255, 193, 7, 0.3)',
      pulse: 'rgba(255, 235, 59, 0.5)'
    }
  },
  
  // إعدادات الدوجي (عدم اليقين)
  doji: {
    speedMultiplier: 0.3,     // حركة بطيئة جداً
    volatility: 0.008,        // تقلب منخفض
    momentum: 0.2,            // زخم قليل جداً
    animation: {
      duration: 400,          // مدة طويلة
      easing: 'ease',         // تسارع عادي
      glowEffect: false,
      flickerEffect: true     // تأثير الرعشة للدلالة على عدم اليقين
    },
    colors: {
      glow: 'rgba(158, 158, 158, 0.3)',
      trail: 'rgba(189, 189, 189, 0.1)'
    }
  }
};

// 📈 Market Trend Detection للكشف عن اتجاه السوق
export const TREND_DETECTION = {
  // قواعد تحديد الاتجاه
  bullishConditions: {
    consecutiveGreenCandles: 3,    // 3 شموع خضراء متتالية
    priceIncrease: 0.02,          // زيادة 2% في السعر
    volumeIncrease: 1.5,          // زيادة الحجم 1.5 مرة
    rsiThreshold: 60              // مؤشر القوة النسبية فوق 60
  },
  
  bearishConditions: {
    consecutiveRedCandles: 3,      // 3 شموع حمراء متتالية
    priceDecrease: 0.02,          // انخفاض 2% في السعر
    volumeIncrease: 1.5,          // زيادة الحجم (دلالة على البيع)
    rsiThreshold: 40              // مؤشر القوة النسبية تحت 40
  },
  
  reversalConditions: {
    priceDeviation: 0.05,         // انحراف 5% عن المتوسط
    volumeSpike: 2.0,             // قفزة في الحجم
    candlestickPatterns: [
      'hammer', 'doji', 'shooting_star', 
      'bullish_engulfing', 'bearish_engulfing'
    ]
  }
};

// 🎨 Animation Effects للتأثيرات البصرية
export const ANIMATION_EFFECTS = {
  // تأثيرات الحركة
  movement: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)'
  },
  
  // تأثيرات الإضاءة
  glow: {
    bullish: {
      boxShadow: '0 0 20px rgba(38, 166, 154, 0.6)',
      filter: 'drop-shadow(0 0 10px rgba(38, 166, 154, 0.4))'
    },
    bearish: {
      boxShadow: '0 0 20px rgba(239, 83, 80, 0.6)',
      filter: 'drop-shadow(0 0 10px rgba(239, 83, 80, 0.4))'
    },
    reversal: {
      boxShadow: '0 0 25px rgba(255, 215, 0, 0.8)',
      filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.6))'
    }
  },
  
  // تأثيرات النبض
  pulse: {
    keyframes: [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.1)', opacity: 0.8 },
      { transform: 'scale(1)', opacity: 1 }
    ],
    duration: 1000,
    iterations: 'infinite'
  }
};

// 📊 Candlestick Pattern Validation (Global Standards)
export const PATTERN_VALIDATION = {
  minBodySize: 0.01,  // الحد الأدنى لحجم جسم الشمعة
  maxWickRatio: 3.0,  // النسبة القصوى للفتيل إلى الجسم
  dojiThreshold: 0.1, // عتبة تحديد الدوجي
  engulfingRatio: 1.2, // نسبة الابتلاع المطلوبة
  volumeThreshold: 1.5 // عتبة الحجم للتأكيد
};

// 🎨 Professional Color Schemes
export const COLOR_SCHEMES = {
  dark_professional: {
    background: 'linear-gradient(135deg, #0D1421 0%, #1A1A1A 100%)',
    grid: 'rgba(255, 255, 255, 0.08)',
    text: '#E0E0E0',
    accent: '#FFD700'
  },
  tradingview_style: {
    background: 'linear-gradient(135deg, #131722 0%, #1E222D 100%)',
    grid: 'rgba(255, 255, 255, 0.1)',
    text: '#D1D4DC',
    accent: '#2962FF'
  },
  binance_style: {
    background: 'linear-gradient(135deg, #181A20 0%, #2B2F36 100%)',
    grid: 'rgba(255, 255, 255, 0.05)',
    text: '#EAECEF',
    accent: '#F0B90B'
  }
};

// 📱 Responsive Breakpoints
export const RESPONSIVE_CONFIG = {
  mobile: {
    maxWidth: 768,
    candleWidth: { min: 1, max: 3 },
    fontSize: { small: 10, medium: 12, large: 14 }
  },
  tablet: {
    maxWidth: 1024,
    candleWidth: { min: 2, max: 5 },
    fontSize: { small: 11, medium: 13, large: 16 }
  },
  desktop: {
    maxWidth: Infinity,
    candleWidth: { min: 3, max: 8 },
    fontSize: { small: 12, medium: 14, large: 18 }
  }
};

// 🔧 Performance Optimization Settings
export const PERFORMANCE_CONFIG = {
  maxCandlesVisible: 200,
  throttleDelay: 100,
  debounceDelay: 150,
  animationDuration: 200,
  memoryManagement: {
    maxHistoryLength: 1000,
    cleanupInterval: 300000 // 5 minutes
  }
};

// 🌍 Localization Support
export const LOCALIZATION = {
  ar: {
    open: 'فتح',
    high: 'أعلى',
    low: 'أدنى',
    close: 'إغلاق',
    volume: 'الحجم',
    timeframe: 'الإطار الزمني',
    price: 'السعر',
    change: 'التغيير',
    updating: 'يتم التحديث...',
    connected: 'متصل',
    disconnected: 'منقطع'
  },
  en: {
    open: 'Open',
    high: 'High',
    low: 'Low',
    close: 'Close',
    volume: 'Volume',
    timeframe: 'Timeframe',
    price: 'Price',
    change: 'Change',
    updating: 'Updating...',
    connected: 'Connected',
    disconnected: 'Disconnected'
  }
};

// 🎯 Export main configuration function
export function getPlatformConfig(platform = 'All') {
  switch (platform) {
    case 'TradingView':
      return TRADINGVIEW_CONFIG;
    case 'MetaTrader':
      return METATRADER_CONFIG;
    case 'Binance':
      return BINANCE_CONFIG;
    default:
      return {
        name: 'Universal',
        colors: COLOR_SCHEMES.dark_professional,
        timeframes: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'],
        updateStrategy: 'adaptive',
        features: ['universal_compatibility']
      };
  }
}

// 🧠 Smart Movement Functions للوظائف الذكية
export function detectMarketTrend(candleData, currentIndex = -1) {
  if (!candleData || candleData.length < 5) return 'neutral';
  
  const recentCandles = candleData.slice(-5); // آخر 5 شموع
  const currentCandle = recentCandles[recentCandles.length + currentIndex];
  const previousCandles = recentCandles.slice(0, -1);
  
  // تحليل الاتجاه العام
  let greenCount = 0;
  let redCount = 0;
  let totalVolume = 0;
  let priceChange = 0;
  
  recentCandles.forEach((candle, index) => {
    if (candle.close > candle.open) greenCount++;
    else if (candle.close < candle.open) redCount++;
    
    totalVolume += candle.volume;
    if (index > 0) {
      priceChange += (candle.close - recentCandles[index - 1].close);
    }
  });
  
  const avgVolume = totalVolume / recentCandles.length;
  const priceChangePercent = Math.abs(priceChange / recentCandles[0].open);
  
  // الكشف عن نقاط الانعكاس
  if (currentCandle && isReversalPattern(currentCandle, previousCandles)) {
    return 'reversal';
  }
  
  // الكشف عن الدوجي
  if (currentCandle && isDoji(currentCandle)) {
    return 'doji';
  }
  
  // تحديد الاتجاه
  if (greenCount >= 3 && priceChangePercent > 0.015) {
    return 'bullish';
  } else if (redCount >= 3 && priceChangePercent > 0.015) {
    return 'bearish';
  }
  
  return 'neutral';
}

export function isReversalPattern(currentCandle, previousCandles) {
  if (!currentCandle || !previousCandles || previousCandles.length < 2) return false;
  
  const prevCandle = previousCandles[previousCandles.length - 1];
  const bodySize = Math.abs(currentCandle.close - currentCandle.open);
  const prevBodySize = Math.abs(prevCandle.close - prevCandle.open);
  
  // نمط الابتلاع
  if (bodySize > prevBodySize * 1.5) {
    if (currentCandle.close > currentCandle.open && prevCandle.close < prevCandle.open) {
      return true; // ابتلاع صاعد
    }
    if (currentCandle.close < currentCandle.open && prevCandle.close > prevCandle.open) {
      return true; // ابتلاع هابط
    }
  }
  
  // نمط المطرقة
  const wickSize = Math.abs(currentCandle.low - Math.min(currentCandle.open, currentCandle.close));
  if (wickSize > bodySize * 2 && currentCandle.close > currentCandle.open) {
    return true;
  }
  
  return false;
}

export function isDoji(candle) {
  if (!candle) return false;
  
  const bodySize = Math.abs(candle.close - candle.open);
  const totalRange = candle.high - candle.low;
  
  return bodySize < totalRange * 0.1; // جسم الشمعة أقل من 10% من المدى الكلي
}

export function getMovementConfig(trend) {
  return SMART_MOVEMENT_CONFIG[trend] || SMART_MOVEMENT_CONFIG.doji;
}

export default {
  TRADINGVIEW_CONFIG,
  METATRADER_CONFIG,
  BINANCE_CONFIG,
  UPDATE_STRATEGIES,
  SMART_MOVEMENT_CONFIG,
  TREND_DETECTION,
  ANIMATION_EFFECTS,
  PATTERN_VALIDATION,
  COLOR_SCHEMES,
  RESPONSIVE_CONFIG,
  PERFORMANCE_CONFIG,
  LOCALIZATION,
  getPlatformConfig,
  detectMarketTrend,
  isReversalPattern,
  isDoji,
  getMovementConfig
};
