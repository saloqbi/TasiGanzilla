// ملف تكوين API للأسواق المالية
// يرجى استبدال هذه المفاتيح بمفاتيح حقيقية من المقدمين

export const API_CONFIG = {
  // Alpha Vantage (مجاني - 5 طلبات في الدقيقة)
  // الموقع: https://www.alphavantage.co/
  ALPHA_VANTAGE: {
    API_KEY: 'YOUR_ALPHA_VANTAGE_API_KEY',
    BASE_URL: 'https://www.alphavantage.co/query',
    RATE_LIMIT: 5 // طلبات في الدقيقة
  },

  // Twelve Data (مجاني جزئياً - 800 طلب في اليوم)
  // الموقع: https://twelvedata.com/
  TWELVE_DATA: {
    API_KEY: 'YOUR_TWELVE_DATA_API_KEY',
    BASE_URL: 'https://api.twelvedata.com',
    RATE_LIMIT: 800 // طلبات في اليوم
  },

  // CoinGecko (مجاني - بدون حد للطلبات العادية)
  // الموقع: https://www.coingecko.com/en/api
  COINGECKO: {
    BASE_URL: 'https://api.coingecko.com/api/v3',
    RATE_LIMIT: 50 // طلب في الدقيقة (للحساب المجاني)
  },

  // Yahoo Finance (غير رسمي - مجاني)
  // ملاحظة: قد يحتاج proxy للتشغيل من المتصفح
  YAHOO_FINANCE: {
    BASE_URL: 'https://query1.finance.yahoo.com/v8/finance/chart',
    PROXY_URL: 'https://api.allorigins.win/get?url=' // خدمة proxy مجانية
  },

  // Binance API (مجاني للبيانات العامة)
  // الموقع: https://binance-docs.github.io/apidocs/
  BINANCE: {
    BASE_URL: 'https://api.binance.com/api/v3',
    RATE_LIMIT: 1200 // طلب في الدقيقة
  },

  // IEX Cloud (مجاني جزئياً)
  // الموقع: https://iexcloud.io/
  IEX_CLOUD: {
    API_KEY: 'YOUR_IEX_CLOUD_API_KEY',
    BASE_URL: 'https://cloud.iexapis.com/stable',
    RATE_LIMIT: 100 // طلب في الثانية للحساب المجاني
  }
};

// رموز الأسواق الافتراضية
export const DEFAULT_SYMBOLS = {
  // الأسهم الأمريكية - أهم الشركات
  stocks: [
    'AAPL',   // Apple
    'MSFT',   // Microsoft
    'GOOGL',  // Alphabet (Google)
    'AMZN',   // Amazon
    'TSLA',   // Tesla
    'META',   // Meta (Facebook)
    'NVDA',   // NVIDIA
    'JPM',    // JPMorgan Chase
    'JNJ',    // Johnson & Johnson
    'V',      // Visa
    'PG',     // Procter & Gamble
    'HD',     // Home Depot
    'UNH',    // UnitedHealth
    'MA',     // Mastercard
    'DIS',    // Disney
    'ADBE',   // Adobe
    'NFLX',   // Netflix
    'CRM',    // Salesforce
    'XOM',    // Exxon Mobil
    'BAC'     // Bank of America
  ],

  // العملات (فوريكس)
  forex: [
    'EURUSD', // يورو/دولار
    'GBPUSD', // جنيه إسترليني/دولار
    'USDJPY', // دولار/ين ياباني
    'USDCHF', // دولار/فرنك سويسري
    'USDCAD', // دولار/دولار كندي
    'AUDUSD', // دولار أسترالي/دولار
    'NZDUSD', // دولار نيوزيلندي/دولار
    'EURGBP', // يورو/جنيه إسترليني
    'EURJPY', // يورو/ين ياباني
    'GBPJPY', // جنيه إسترليني/ين ياباني
    'USDSAR', // دولار/ريال سعودي
    'EURCAD', // يورو/دولار كندي
    'AUDCAD', // دولار أسترالي/دولار كندي
    'AUDCHF', // دولار أسترالي/فرنك سويسري
    'EURAUD'  // يورو/دولار أسترالي
  ],

  // العملات الرقمية
  crypto: [
    'bitcoin',        // Bitcoin (BTC)
    'ethereum',       // Ethereum (ETH)
    'binancecoin',    // Binance Coin (BNB)
    'ripple',         // XRP
    'cardano',        // Cardano (ADA)
    'solana',         // Solana (SOL)
    'polkadot',       // Polkadot (DOT)
    'dogecoin',       // Dogecoin (DOGE)
    'avalanche-2',    // Avalanche (AVAX)
    'shiba-inu',      // Shiba Inu (SHIB)
    'polygon',        // Polygon (MATIC)
    'chainlink',      // Chainlink (LINK)
    'litecoin',       // Litecoin (LTC)
    'bitcoin-cash',   // Bitcoin Cash (BCH)
    'uniswap',        // Uniswap (UNI)
    'cosmos',         // Cosmos (ATOM)
    'algorand',       // Algorand (ALGO)
    'tron',           // TRON (TRX)
    'stellar',        // Stellar (XLM)
    'internet-computer' // Internet Computer (ICP)
  ],

  // السلع
  commodities: [
    'CL=F',   // النفط الخام
    'NG=F',   // الغاز الطبيعي
    'GC=F',   // الذهب
    'SI=F',   // الفضة
    'HG=F',   // النحاس
    'PL=F',   // البلاتين
    'PA=F',   // البالاديوم
    'ZC=F',   // الذرة
    'ZS=F',   // فول الصويا
    'ZW=F',   // القمح
    'KC=F',   // القهوة
    'SB=F',   // السكر
    'CC=F',   // الكاكاو
    'CT=F',   // القطن
    'LBS=F'   // الخشب
  ],

  // المؤشرات
  indices: [
    '^GSPC',  // S&P 500
    '^DJI',   // Dow Jones
    '^IXIC',  // NASDAQ
    '^RUT',   // Russell 2000
    '^VIX',   // VIX (مؤشر الخوف)
    '^FTSE',  // FTSE 100 (بريطانيا)
    '^GDAXI', // DAX (ألمانيا)
    '^FCHI',  // CAC 40 (فرنسا)
    '^N225',  // Nikkei 225 (اليابان)
    '^HSI',   // Hang Seng (هونج كونج)
    '^AORD',  // All Ordinaries (أستراليا)
    '^BVSP',  // Bovespa (البرازيل)
    '^TSX',   // TSX (كندا)
    '^MERV',  // MERVAL (الأرجنتين)
    '^TA125'  // TA-125 (إسرائيل)
  ],

  // المعادن الثمينة
  metals: [
    'GC=F',   // الذهب
    'SI=F',   // الفضة
    'PL=F',   // البلاتين
    'PA=F',   // البالاديوم
    'HG=F',   // النحاس
    'ALI=F'   // الألومنيوم
  ]
};

// إعدادات التحديث
export const UPDATE_INTERVALS = {
  REAL_TIME: 1000,      // ثانية واحدة (للعملات الرقمية)
  FAST: 5000,           // 5 ثوان
  NORMAL: 60000,        // دقيقة واحدة
  SLOW: 300000,         // 5 دقائق
  HOURLY: 3600000       // ساعة واحدة
};

// إعدادات دائرة Gann للأسواق المختلفة
export const GANN_MARKET_SETTINGS = {
  stocks: {
    basePrice: 100,       // السعر الأساسي للحسابات
    angleMultiplier: 1,   // مضاعف الزاوية
    divisions: 36,        // عدد القطاعات
    levels: 8            // عدد المستويات
  },
  forex: {
    basePrice: 1,
    angleMultiplier: 3600, // للعملات (أسعار صغيرة)
    divisions: 36,
    levels: 8
  },
  crypto: {
    basePrice: 1,
    angleMultiplier: 1,
    divisions: 36,
    levels: 8
  },
  commodities: {
    basePrice: 50,
    angleMultiplier: 1,
    divisions: 36,
    levels: 8
  },
  indices: {
    basePrice: 1000,
    angleMultiplier: 0.1,
    divisions: 36,
    levels: 8
  },
  metals: {
    basePrice: 100,
    angleMultiplier: 1,
    divisions: 36,
    levels: 8
  }
};

export default API_CONFIG;
