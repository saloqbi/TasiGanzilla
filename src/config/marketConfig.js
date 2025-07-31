// ملف تكوين الأسواق المالية وأنماط التحليل
export const MARKET_CONFIG = {
  // إعدادات الاتصال
  CONNECTION: {
    // زمن انتظار الاتصال (بالثواني)
    TIMEOUT: 30,
    // عدد محاولات إعادة الاتصال
    RETRY_ATTEMPTS: 3,
    // فترة إعادة الاتصال (بالثواني)
    RETRY_INTERVAL: 5,
    // تفعيل البيانات اللحظية
    REAL_TIME: true
  },

  // مصادر البيانات حسب السوق
  DATA_SOURCES: {
    crypto: {
      primary: 'binance',
      fallback: ['coinbase', 'kraken'],
      apis: {
        binance: {
          wsUrl: 'wss://stream.binance.com:9443/ws/',
          restUrl: 'https://api.binance.com/api/v3/',
          rateLimit: 1200, // requests per minute
          free: true
        },
        coinbase: {
          wsUrl: 'wss://ws-feed.pro.coinbase.com',
          restUrl: 'https://api.pro.coinbase.com/',
          rateLimit: 10, // requests per second
          free: true
        },
        kraken: {
          wsUrl: 'wss://ws.kraken.com',
          restUrl: 'https://api.kraken.com/0/public/',
          rateLimit: 1, // request per second
          free: true
        }
      }
    },

    forex: {
      primary: 'finhub',
      fallback: ['alphaVantage', 'twelveData'],
      apis: {
        finhub: {
          wsUrl: 'wss://ws.finnhub.io',
          restUrl: 'https://finnhub.io/api/v1/',
          rateLimit: 60, // requests per minute
          free: true,
          requiresKey: true
        },
        alphaVantage: {
          restUrl: 'https://www.alphavantage.co/query',
          rateLimit: 5, // requests per minute
          free: true,
          requiresKey: true
        },
        twelveData: {
          wsUrl: 'wss://ws.twelvedata.com/v1/quotes/price',
          restUrl: 'https://api.twelvedata.com/',
          rateLimit: 800, // requests per day (free)
          free: true,
          requiresKey: true
        }
      }
    },

    usstocks: {
      primary: 'iex',
      fallback: ['polygon', 'alphaVantage'],
      apis: {
        iex: {
          wsUrl: 'wss://ws-api.iextrading.com/1.0/tops',
          restUrl: 'https://cloud.iexapis.com/stable/',
          rateLimit: 100, // requests per second
          free: true,
          requiresKey: true
        },
        polygon: {
          wsUrl: 'wss://socket.polygon.io/stocks',
          restUrl: 'https://api.polygon.io/',
          rateLimit: 5, // requests per minute (free)
          free: true,
          requiresKey: true
        }
      }
    },

    tasi: {
      primary: 'simulation', // حالياً محاكاة
      fallback: ['argaam', 'mubasher'],
      apis: {
        simulation: {
          // محاكاة البيانات للتجربة
          enabled: true,
          updateInterval: 1000, // كل ثانية
          volatility: 0.02 // تذبذب 2%
        },
        argaam: {
          restUrl: 'https://www.argaam.com/ar/',
          rateLimit: 60, // requests per minute
          delay: 15, // دقيقة تأخير
          free: true
        },
        mubasher: {
          restUrl: 'https://www.mubasher.info/',
          rateLimit: 30, // requests per minute
          delay: 15, // دقيقة تأخير
          requiresSubscription: true
        }
      }
    },

    commodities: {
      primary: 'metalsAPI',
      fallback: ['commodityAPI'],
      apis: {
        metalsAPI: {
          restUrl: 'https://metals-api.com/api/',
          rateLimit: 1000, // requests per month (free)
          free: true,
          requiresKey: true
        },
        commodityAPI: {
          restUrl: 'https://commodities-api.com/',
          rateLimit: 1000, // requests per month (free)
          free: true,
          requiresKey: true
        }
      }
    },

    indices: {
      primary: 'marketStack',
      fallback: ['financialModelingPrep'],
      apis: {
        marketStack: {
          restUrl: 'https://api.marketstack.com/',
          rateLimit: 1000, // requests per month (free)
          free: true,
          requiresKey: true
        },
        financialModelingPrep: {
          restUrl: 'https://financialmodelingprep.com/api/',
          rateLimit: 250, // requests per day (free)
          free: true,
          requiresKey: true
        }
      }
    }
  },

  // رموز الأسواق المدعومة
  SUPPORTED_SYMBOLS: {
    crypto: [
      'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 
      'XRPUSDT', 'DOTUSDT', 'DOGEUSDT', 'LINKUSDT', 'LTCUSDT'
    ],
    
    forex: [
      'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD',
      'USDCAD', 'NZDUSD', 'EURGBP', 'EURJPY', 'GBPJPY'
    ],
    
    usstocks: [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA',
      'META', 'NVDA', 'NFLX', 'BABA', 'V'
    ],
    
    tasi: [
      '2222', '1120', '2010', '1210', '4030',
      '2020', '1180', '2380', '4280', '1111'
    ],
    
    commodities: [
      'XAUUSD', 'XAGUSD', 'XPTUSD', 'XPDUSD', 'CRUDE',
      'BRENT', 'NATGAS', 'COPPER', 'SUGAR', 'WHEAT'
    ],
    
    indices: [
      'SPX', 'DJI', 'IXIC', 'FTSE', 'DAX',
      'N225', 'HSI', 'TASI', 'EGX30', 'QE'
    ]
  },

  // إعدادات التحليل الفني
  TECHNICAL_ANALYSIS: {
    // زوايا جان
    gann: {
      angles: {
        '1x8': 7.5,
        '1x4': 15,
        '1x3': 18.75,
        '1x2': 26.25,
        '1x1': 45,
        '2x1': 63.75,
        '3x1': 71.25,
        '4x1': 75,
        '8x1': 82.5
      },
      squares: [9, 16, 25, 36, 49, 64, 81, 100, 121, 144],
      timeCycles: [1, 2, 3, 5, 7, 10, 15, 20, 30, 45, 60, 90]
    },

    // مستويات فيبوناتشي
    fibonacci: {
      retracements: [0, 23.6, 38.2, 50, 61.8, 78.6, 100],
      extensions: [127.2, 138.2, 161.8, 200, 261.8, 361.8],
      timeZones: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
    },

    // إعدادات المؤشرات
    indicators: {
      rsi: { period: 14, overbought: 70, oversold: 30 },
      macd: { fast: 12, slow: 26, signal: 9 },
      bollinger: { period: 20, stdDev: 2 },
      stochastic: { kPeriod: 14, dPeriod: 3, smooth: 3 }
    }
  },

  // إعدادات التلوين والعرض
  DISPLAY: {
    colors: {
      bullish: '#00FF00',    // أخضر للصعود
      bearish: '#FF0000',    // أحمر للهبوط
      neutral: '#FFD700',    // ذهبي للمحايد
      reversal: '#FFFF00',   // أصفر للانعكاس
      support: '#0080FF',    // أزرق للدعم
      resistance: '#FF8000'  // برتقالي للمقاومة
    },
    
    // إعدادات التحديث
    updateIntervals: {
      realtime: 1000,      // كل ثانية
      fast: 5000,          // كل 5 ثوان  
      normal: 30000,       // كل 30 ثانية
      slow: 300000         // كل 5 دقائق
    },
    
    // عدد البيانات المحفوظة
    dataPoints: {
      intraday: 1440,      // 24 ساعة بالدقائق
      daily: 365,          // سنة كاملة
      weekly: 520,         // 10 سنوات أسبوعي
      monthly: 240         // 20 سنة شهري
    }
  },

  // إعدادات دائرة جان 360
  GANN_CIRCLE: {
    // عدد القطاعات
    sectors: 36,
    
    // ربط السعر بالموقع
    priceMapping: {
      method: 'reduced_number', // 'reduced_number', 'modulo', 'hash'
      digitReduction: true,
      includeDecimals: true
    },
    
    // إعدادات التلوين
    cellColoring: {
      enabled: true,
      basedOn: 'price_movement', // 'price_movement', 'volume', 'volatility'
      smoothing: true,
      fadeTime: 5000 // 5 ثوان
    },
    
    // عرض البيانات على الدائرة
    dataOverlay: {
      showPrices: true,
      showSymbols: true,
      showPercentage: true,
      fontSize: 10,
      maxCharsPerCell: 8
    }
  },

  // إعدادات الإشعارات والتنبيهات
  ALERTS: {
    priceAlerts: {
      enabled: true,
      thresholds: [1, 2, 5, 10], // نسب التغيير %
      soundEnabled: false
    },
    
    technicalAlerts: {
      enabled: true,
      patterns: ['breakout', 'reversal', 'gann_angle', 'fibonacci'],
      sensitivity: 'medium' // 'high', 'medium', 'low'
    },
    
    newsAlerts: {
      enabled: false, // للإصدارات المستقبلية
      keywords: ['earnings', 'merger', 'dividend']
    }
  },

  // إعدادات الأداء
  PERFORMANCE: {
    // تحسين الشبكة
    networking: {
      compression: true,
      batching: true,
      caching: true,
      cacheDuration: 60000 // دقيقة واحدة
    },
    
    // تحسين الرسم
    rendering: {
      useWebGL: false, // للمستقبل
      frameRate: 30,
      animationDuration: 500,
      useRAF: true // requestAnimationFrame
    },
    
    // إدارة الذاكرة
    memory: {
      maxDataPoints: 10000,
      cleanupInterval: 300000, // 5 دقائق
      compressionThreshold: 0.8
    }
  },

  // إعدادات المطورين
  DEVELOPMENT: {
    debugging: {
      enabled: process.env.NODE_ENV === 'development',
      verbose: false,
      logLevel: 'info' // 'debug', 'info', 'warn', 'error'
    },
    
    testing: {
      mockData: true,
      simulateLatency: false,
      errorRate: 0 // نسبة الأخطاء المحاكاة
    }
  }
};

// تصدير التكوين الافتراضي
export default MARKET_CONFIG;
