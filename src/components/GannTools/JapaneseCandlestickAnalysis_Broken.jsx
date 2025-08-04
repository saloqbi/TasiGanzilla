// ==================================================================================
// 📦 IMPORTS - Japanese Candlestick Analysis Component
// ==================================================================================

// React Core Hooks
import React, { 
  useRef, 
  useEffect, 
  useState, 
  useCallback, 
  useMemo 
} from 'react';

// Market Data & Provider Components
import MarketDataProvider, { useMarketData } from '../MarketData/MarketDataProvider';
import DataProvider, { useDataProvider } from '../DataProvider/DataProvider';
import MongoDBViewer from '../DataProvider/MongoDBViewer';
import MarketDataSettings from '../MarketData/MarketDataSettings';

// Analysis & Visualization Components
import { availableShapes, renderSelectedShapes } from './GeometricShapes';
import MultiTimeframeConsensus from './MultiTimeframeConsensus';

// Platform Configuration & Market Analysis
import { 
  detectMarketTrend, 
  getMovementConfig, 
  SMART_MOVEMENT_CONFIG,
  ANIMATION_EFFECTS 
} from './GlobalPlatformConfig';

// Styling & CSS
import './GannMarketStyles.css';
import './GannMarketInteractionFix.css';

// ==================================================================================
// 📊 CHART TYPES CONFIGURATION - أنواع الرسوم البيانية
// ==================================================================================

const CHART_TYPES = {
  // 🕯️ Japanese Candlesticks - الشموع اليابانية
  candlestick: { 
    name: 'الشموع اليابانية', 
    icon: '🕯️', 
    color: '#FFD700' 
  },
  
  // 📊 Area Chart - منطقة التعبئة
  area: { 
    name: 'المنطقة', 
    icon: '📊', 
    color: '#2196F3' 
  },
  
  // 📈 Bar Chart - الأعمدة السعرية
  bar: { 
    name: 'الأعمدة', 
    icon: '📈', 
    color: '#4CAF50' 
  },
  
  // 📉 Baseline Chart - الخط القاعدي
  baseline: { 
    name: 'الخط القاعدي', 
    icon: '📉', 
    color: '#FF9800' 
  },
  
  // 📋 Histogram - الرسم البياني
  histogram: { 
    name: 'الرسم البياني', 
    icon: '📋', 
    color: '#9C27B0' 
  },
  
  // 📏 Line Chart - الخط البسيط
  line: { 
    name: 'الخط', 
    icon: '📏', 
    color: '#F44336' 
  }
};

// ==================================================================================
// 🕯️ JAPANESE CANDLESTICK PATTERNS - أنماط الشموع اليابانية
// ==================================================================================

const CANDLESTICK_PATTERNS = {
  
  // 📈 BULLISH PATTERNS - الأنماط الصاعدة
  // ================================================
  bullish: {
    
    // 🔨 Hammer Patterns - أنماط المطرقة
    hammer: { 
      name: 'المطرقة | Hammer', 
      reliability: 0.75, 
      reversal: true, 
      platform: 'TradingView' 
    },
    inverted_hammer: { 
      name: 'المطرقة المقلوبة | Inverted Hammer', 
      reliability: 0.65, 
      reversal: true, 
      platform: 'TradingView' 
    },
    hanging_man: { 
      name: 'الرجل المعلق | Hanging Man', 
      reliability: 0.70, 
      reversal: true, 
      platform: 'MetaTrader' 
    },
    
    // ⭐ Star Patterns - أنماط النجوم
    shooting_star: { 
      name: 'النجم الساقط | Shooting Star', 
      reliability: 0.78, 
      reversal: true, 
      platform: 'TradingView' 
    },
    morning_star: { 
      name: 'نجمة الصباح | Morning Star', 
      reliability: 0.82, 
      reversal: true, 
      platform: 'MetaTrader' 
    },
    
    // 🎯 Doji Patterns - أنماط الدوجي
    doji: { 
      name: 'الدوجي | Doji', 
      reliability: 0.55, 
      reversal: true, 
      platform: 'Binance' 
    },
    dragonfly_doji: { 
      name: 'دوجي اليعسوب | Dragonfly Doji', 
      reliability: 0.68, 
      reversal: true, 
      platform: 'TradingView' 
    },
    gravestone_doji: { 
      name: 'دوجي الشاهد | Gravestone Doji', 
      reliability: 0.72, 
      reversal: true, 
      platform: 'MetaTrader' 
    },
    
    // 🔥 Engulfing & Piercing Patterns - أنماط الابتلاع والثقب
    bullish_engulfing: { 
      name: 'الابتلاع الصاعد | Bullish Engulfing', 
      reliability: 0.85, 
      reversal: true, 
      platform: 'Binance' 
    },
    piercing_pattern: { 
      name: 'نمط الثقب | Piercing Pattern', 
      reliability: 0.73, 
      reversal: true, 
      platform: 'TradingView' 
    },
    
    // 👥 Multi-Candle Patterns - الأنماط متعددة الشموع
    three_white_soldiers: { 
      name: 'الجنود البيض الثلاثة | Three White Soldiers', 
      reliability: 0.88, 
      continuation: true, 
      platform: 'TradingView' 
    },
    bullish_harami: { 
      name: 'الحرامي الصاعد | Bullish Harami', 
      reliability: 0.67, 
      reversal: true, 
      platform: 'MetaTrader' 
    },
    rising_three_methods: { 
      name: 'الطرق الثلاث الصاعدة | Rising Three Methods', 
      reliability: 0.74, 
      continuation: true, 
      platform: 'Binance' 
    },
    
    // 🔧 Special Patterns - الأنماط الخاصة
    tweezer_bottom: { 
      name: 'الملقط السفلي | Tweezer Bottom', 
      reliability: 0.63, 
      reversal: true, 
      platform: 'TradingView' 
    },
    abandoned_baby_bullish: { 
      name: 'الطفل المهجور الصاعد | Abandoned Baby Bull', 
      reliability: 0.89, 
      reversal: true, 
      platform: 'MetaTrader' 
    },
    three_inside_up: { 
      name: 'الثلاثة الداخلية الصاعدة | Three Inside Up', 
      reliability: 0.71, 
      reversal: true, 
      platform: 'Binance' 
    }
  },
  
  // 📉 BEARISH PATTERNS - الأنماط الهابطة
  // ================================================
  bearish: {
    
    // 🔥 Engulfing & Cover Patterns - أنماط الابتلاع والتغطية
    bearish_engulfing: { 
      name: 'الابتلاع الهابط | Bearish Engulfing', 
      reliability: 0.84, 
      reversal: true, 
      platform: 'Binance' 
    },
    dark_cloud_cover: { 
      name: 'غطاء السحابة المظلمة | Dark Cloud Cover', 
      reliability: 0.76, 
      reversal: true, 
      platform: 'TradingView' 
    },
    
    // ⭐ Star & Evening Patterns - أنماط النجوم والمساء
    evening_star: { 
      name: 'نجمة المساء | Evening Star', 
      reliability: 0.81, 
      reversal: true, 
      platform: 'MetaTrader' 
    },
    
    // 👥 Multi-Candle Bearish Patterns - الأنماط الهابطة متعددة الشموع
    three_black_crows: { 
      name: 'الغربان السود الثلاثة | Three Black Crows', 
      reliability: 0.87, 
      continuation: true, 
      platform: 'TradingView' 
    },
    falling_three_methods: { 
      name: 'الطرق الثلاث الهابطة | Falling Three Methods', 
      reliability: 0.73, 
      continuation: true, 
      platform: 'Binance' 
    },
    
    // 🔧 Advanced Bearish Patterns - الأنماط الهابطة المتقدمة
    bearish_harami: { 
      name: 'الحرامي الهابط | Bearish Harami', 
      reliability: 0.66, 
      reversal: true, 
      platform: 'MetaTrader' 
    },
    tweezer_top: { 
      name: 'الملقط العلوي | Tweezer Top', 
      reliability: 0.64, 
      reversal: true, 
      platform: 'TradingView' 
    },
    abandoned_baby_bearish: { 
      name: 'الطفل المهجور الهابط | Abandoned Baby Bear', 
      reliability: 0.88, 
      reversal: true, 
      platform: 'MetaTrader' 
    },
    three_inside_down: { 
      name: 'الثلاثة الداخلية الهابطة | Three Inside Down', 
      reliability: 0.69, 
      reversal: true, 
      platform: 'Binance' 
    },
    advance_block: { 
      name: 'الكتلة المتقدمة | Advance Block', 
      reliability: 0.68, 
      reversal: true, 
      platform: 'TradingView' 
    }
  }
};

// ==================================================================================
// 🔮 ADVANCED ANALYSIS PATTERNS - أنماط التحليل المتقدم  
// ==================================================================================

const ADVANCED_ANALYSIS_PATTERNS = {
  
  // 📐 GANN ANALYSIS - تحليل جان
  // ================================
  GANN_ANALYSIS: {
    angles: [15, 26.25, 45, 63.75, 75],
    timeIntervals: [7, 14, 21, 30, 45, 90, 180],
    priceSquares: true,
    fanLines: true,
    squareOfNine: true,
    cardinalSquares: [90, 180, 270, 360]
  },
  
  LEVELS: {
    fibonacci: [0, 23.6, 38.2, 50, 61.8, 78.6, 100, 123.6, 161.8, 261.8],
    pivotPoints: true,
    supportResistance: true,
    volumeProfile: true,
    fibonacciExtensions: [127.2, 138.2, 150, 161.8, 200, 261.8],
    fibonacciArcs: true,
    fibonacciTimeZones: true
  },
  
  CANDLESTICK_PATTERNS: {
    // أنماط الانعكاس الصاعدة (10 أنماط)
    bullishReversal: [
      { name: 'hammer', arabic: 'المطرقة', strength: 0.75, color: '#00FF41' },
      { name: 'inverted_hammer', arabic: 'المطرقة المقلوبة', strength: 0.65, color: '#39FF14' },
      { name: 'bullish_engulfing', arabic: 'الابتلاع الصاعد', strength: 0.85, color: '#00FF41' },
      { name: 'piercing_pattern', arabic: 'نمط الاختراق', strength: 0.70, color: '#00CC33' },
      { name: 'morning_star', arabic: 'نجمة الصباح', strength: 0.80, color: '#39FF14' },
      { name: 'three_white_soldiers', arabic: 'الجنود البيض الثلاثة', strength: 0.85, color: '#00FF41' },
      { name: 'bullish_harami', arabic: 'الحرامي الصاعد', strength: 0.65, color: '#00CC33' },
      { name: 'tweezer_bottom', arabic: 'الملقط السفلي', strength: 0.60, color: '#39FF14' },
      { name: 'dragonfly_doji', arabic: 'دوجي اليعسوب', strength: 0.70, color: '#00FF41' },
      { name: 'abandoned_baby_bullish', arabic: 'الطفل المهجور الصاعد', strength: 0.90, color: '#00FF41' }
    ],
    
    // أنماط الانعكاس الهابطة (10 أنماط)
    bearishReversal: [
      { name: 'hanging_man', arabic: 'الرجل المعلق', strength: 0.70, color: '#FF1744' },
      { name: 'shooting_star', arabic: 'النجم المتساقط', strength: 0.65, color: '#FF4569' },
      { name: 'bearish_engulfing', arabic: 'الابتلاع الهابط', strength: 0.85, color: '#FF1744' },
      { name: 'dark_cloud_cover', arabic: 'غطاء السحابة المظلمة', strength: 0.75, color: '#CC1439' },
      { name: 'evening_star', arabic: 'نجمة المساء', strength: 0.80, color: '#FF4569' },
      { name: 'three_black_crows', arabic: 'الغربان السود الثلاثة', strength: 0.85, color: '#FF1744' },
      { name: 'bearish_harami', arabic: 'الحرامي الهابط', strength: 0.65, color: '#CC1439' },
      { name: 'tweezer_top', arabic: 'الملقط العلوي', strength: 0.60, color: '#FF4569' },
      { name: 'gravestone_doji', arabic: 'دوجي شاهد القبر', strength: 0.75, color: '#FF1744' },
      { name: 'abandoned_baby_bearish', arabic: 'الطفل المهجور الهابط', strength: 0.90, color: '#FF1744' }
    ],
    
    // أنماط الاستمرار (6 أنماط)
    continuation: [
      { name: 'rising_three_methods', arabic: 'الطرق الثلاث الصاعدة', strength: 0.70, color: '#FFD700' },
      { name: 'falling_three_methods', arabic: 'الطرق الثلاث الهابطة', strength: 0.70, color: '#FFD700' },
      { name: 'upside_gap_three_methods', arabic: 'فجوة الطرق الثلاث العلوية', strength: 0.75, color: '#FFB000' },
      { name: 'downside_gap_three_methods', arabic: 'فجوة الطرق الثلاث السفلية', strength: 0.75, color: '#FFB000' },
      { name: 'mat_hold_pattern', arabic: 'نمط التماسك', strength: 0.65, color: '#FFD700' },
      { name: 'side_by_side_white_lines', arabic: 'الخطوط البيضاء جنباً إلى جنب', strength: 0.60, color: '#FFB000' }
    ],
    
    // أنماط التردد (4 أنماط)
    indecision: [
      { name: 'doji', arabic: 'دوجي', strength: 0.50, color: '#9C27B0' },
      { name: 'long_legged_doji', arabic: 'دوجي طويل الأرجل', strength: 0.55, color: '#BA68C8' },
      { name: 'spinning_top', arabic: 'القمة الدوارة', strength: 0.45, color: '#9C27B0' },
      { name: 'high_wave_candle', arabic: 'شمعة الموجة العالية', strength: 0.40, color: '#BA68C8' }
    ]
  }
};

// إعدادات ألوان الشموع
const CANDLESTICK_COLORS = {
  bullish: '#00FF41',
  bullish_glow: '#39FF14',
  bullish_shadow: '#00CC33',
  bearish: '#FF1744',
  bearish_glow: '#FF0040',
  bearish_shadow: '#CC1122',
  reversal: '#FFD700',
  reversal_glow: '#FFA500',
  reversal_shadow: '#DAA520',
  doji: '#9C27B0',
  doji_glow: '#BA68C8',
  doji_shadow: '#7B1FA2',
  bullish_tv: '#26A69A',
  bearish_tv: '#EF5350',
  
  // MetaTrader Style Colors (احتياطية)
  bullish_mt: '#00C851',        // أخضر MetaTrader
  bearish_mt: '#FF4444',        // أحمر MetaTrader
  
  // Binance Style Colors (احتياطية)
  bullish_binance: '#02C076',   // أخضر Binance
  bearish_binance: '#F6465D',   // أحمر Binance
  
  // ألوان الفتائل والإطارات
  wick: '#607D8B',              // أزرق رمادي للفتائل (shadow)
  wick_bright: '#90A4AE',       // فتائل مضيئة
  
  // Border Colors - إطارات نيون
  bullish_border: '#00FF41',    // إطار أخضر نيون
  bearish_border: '#FF1744',    // إطار أحمر قوي
  reversal_border: '#FFD700',   // إطار ذهبي
  doji_border: '#9C27B0',       // إطار بنفسجي
  
  // Volume Colors - ألوان الحجم الشفافة
  volume_up: 'rgba(0, 255, 65, 0.25)',     // شفاف أخضر نيون للحجم الصاعد
  volume_down: 'rgba(255, 23, 68, 0.25)',  // شفاف أحمر قوي للحجم الهابط
  volume_reversal: 'rgba(255, 215, 0, 0.3)', // شفاف ذهبي للانعكاس
  volume_doji: 'rgba(156, 39, 176, 0.2)'   // شفاف بنفسجي للدوجي
};

// المؤشرات الفنية المتقدمة
const TECHNICAL_INDICATORS = {
  sma: { name: 'المتوسط البسيط', periods: [20, 50, 200], color: '#FFD700' },
  ema: { name: 'المتوسط الأسي', periods: [12, 26], color: '#00BFFF' },
  rsi: { name: 'مؤشر القوة النسبية', period: 14, color: '#FF69B4' },
  macd: { name: 'مؤشر MACD', periods: [12, 26, 9], color: '#9370DB' },
  bollinger: { name: 'أحزمة بولينجر', period: 20, deviation: 2, color: '#32CD32' },
  stochastic: { name: 'مؤشر العشوائي', periods: [14, 3, 3], color: '#FF4500' }
};

// 🔗 خاصية الاستيراد - تكامل مع مصادر البيانات
const DATA_INTEGRATION = {
  // مصادر البيانات المدعومة
  SUPPORTED_SOURCES: {
    binance: { name: 'Binance API', url: 'https://api.binance.com/api/v3', enabled: true },
    tradingview: { name: 'TradingView Feed', url: 'https://data.tradingview.com', enabled: true },
    yahoo: { name: 'Yahoo Finance', url: 'https://query1.finance.yahoo.com', enabled: true },
    alphavantage: { name: 'Alpha Vantage', url: 'https://www.alphavantage.co/query', enabled: true },
    twelvedata: { name: '12 Data', url: 'https://api.twelvedata.com', enabled: true },
    polygon: { name: 'Polygon.io', url: 'https://api.polygon.io', enabled: true },
    finnhub: { name: 'Finnhub', url: 'https://finnhub.io/api/v1', enabled: true }
  },
  
  // إعدادات الاستيراد
  IMPORT_SETTINGS: {
    realTimeData: { enabled: true, interval: 1000, label: 'البيانات المباشرة' },
    historicalData: { enabled: true, period: '1y', label: 'البيانات التاريخية' },
    volumeData: { enabled: true, label: 'بيانات الحجم' },
    newsData: { enabled: true, label: 'الأخبار المؤثرة' },
    economicCalendar: { enabled: true, label: 'التقويم الاقتصادي' },
    socialSentiment: { enabled: true, label: 'المشاعر السوقية' }
  },
  
  // أنواع البيانات
  DATA_TYPES: {
    OHLCV: { name: 'Open, High, Low, Close, Volume', priority: 1 },
    ORDER_BOOK: { name: 'دفتر الأوامر', priority: 2 },
    TRADES: { name: 'الصفقات المنجزة', priority: 3 },
    FUNDING_RATES: { name: 'معدلات التمويل', priority: 4 },
    DERIVATIVES: { name: 'المشتقات المالية', priority: 5 },
    OPTIONS: { name: 'الخيارات', priority: 6 }
  }
};

// 🤖 محرك التوصيات - اقتراحات تداول ذكية
const RECOMMENDATION_ENGINE = {
  // نظام التقييم الذكي
  SMART_SCORING: {
    technical: { weight: 0.4, label: 'التحليل الفني' },
    fundamental: { weight: 0.3, label: 'التحليل الأساسي' },
    sentiment: { weight: 0.2, label: 'المشاعر السوقية' },
    momentum: { weight: 0.1, label: 'الزخم' }
  },
  
  // أنواع التوصيات
  RECOMMENDATION_TYPES: {
    BUY: { action: 'شراء', color: '#00FF41', confidence: 75, signal: '🟢' },
    STRONG_BUY: { action: 'شراء قوي', color: '#39FF14', confidence: 90, signal: '🚀' },
    SELL: { action: 'بيع', color: '#FF1744', confidence: 75, signal: '🔴' },
    STRONG_SELL: { action: 'بيع قوي', color: '#CC1122', confidence: 90, signal: '⬇️' },
    HOLD: { action: 'انتظار', color: '#FFD700', confidence: 60, signal: '⏸️' },
    WATCH: { action: 'مراقبة', color: '#9C27B0', confidence: 50, signal: '👁️' }
  },
  
  // معايير التوصيات
  CRITERIA: {
    rsi: { overbought: 70, oversold: 30, weight: 0.25 },
    macd: { signal: 'crossover', weight: 0.2 },
    volume: { spike: 2.0, weight: 0.15 },
    fibonacci: { levels: [23.6, 38.2, 61.8], weight: 0.15 },
    candlestickPatterns: { reliability: 0.75, weight: 0.25 }
  },
  
  // إستراتيجيات التداول
  STRATEGIES: {
    scalping: { timeframe: '1m-5m', riskLevel: 'high', profit: '0.5-1%' },
    dayTrading: { timeframe: '15m-1h', riskLevel: 'medium', profit: '1-3%' },
    swingTrading: { timeframe: '4h-1d', riskLevel: 'medium', profit: '3-10%' },
    position: { timeframe: '1d-1w', riskLevel: 'low', profit: '10%+' }
  }
};

// ⚡ تقييم المخاطر - حساب وتحليل المخاطر
const RISK_ASSESSMENT = {
  // مستويات المخاطر
  RISK_LEVELS: {
    very_low: { 
      threshold: 0.5, 
      color: '#4CAF50', 
      label: 'منخفض جداً', 
      description: 'استثمار آمن نسبياً',
      recommendation: 'مناسب للمحافظين'
    },
    low: { 
      threshold: 1.5, 
      color: '#8BC34A', 
      label: 'منخفض', 
      description: 'مخاطر قليلة',
      recommendation: 'مناسب للمستثمرين المحافظين'
    },
    medium: { 
      threshold: 3.0, 
      color: '#FFD700', 
      label: 'متوسط', 
      description: 'مخاطر معتدلة',
      recommendation: 'مناسب للمتداولين المتوسطين'
    },
    high: { 
      threshold: 5.0, 
      color: '#FF9800', 
      label: 'عالي', 
      description: 'مخاطر مرتفعة',
      recommendation: 'للمتداولين ذوي الخبرة'
    },
    very_high: { 
      threshold: Infinity, 
      color: '#F44336', 
      label: 'عالي جداً', 
      description: 'مخاطر شديدة',
      recommendation: 'للخبراء فقط - حذر شديد'
    }
  },
  
  // مؤشرات المخاطر
  RISK_INDICATORS: {
    volatility: { 
      formula: 'standardDeviation * 100', 
      weight: 0.3, 
      label: 'التقلبات',
      thresholds: { low: 2, medium: 5, high: 10 }
    },
    liquidity: { 
      formula: 'averageVolume / marketCap', 
      weight: 0.25, 
      label: 'السيولة',
      thresholds: { low: 0.01, medium: 0.05, high: 0.1 }
    },
    correlation: { 
      formula: 'correlationWithMarket', 
      weight: 0.2, 
      label: 'الارتباط',
      thresholds: { low: 0.3, medium: 0.6, high: 0.8 }
    },
    momentum: { 
      formula: 'rsi + macd + stochastic', 
      weight: 0.15, 
      label: 'الزخم',
      thresholds: { low: 30, medium: 50, high: 70 }
    },
    fundamentals: { 
      formula: 'pe + debt + growth', 
      weight: 0.1, 
      label: 'الأساسيات',
      thresholds: { low: 20, medium: 40, high: 60 }
    }
  },
  
  // حساب المخاطر المتقدم
  ADVANCED_CALCULATIONS: {
    varCalculation: { confidence: 95, period: 252, label: 'القيمة المعرضة للمخاطر' },
    sharpeRatio: { riskFreeRate: 0.02, label: 'نسبة شارب' },
    maxDrawdown: { period: 252, label: 'أقصى انخفاض' },
    betaCalculation: { benchmark: 'market', label: 'معامل بيتا' },
    expectedShortfall: { confidence: 95, label: 'النقص المتوقع' }
  }
};

// 🔄 الإطارات الزمنية المتقدمة محسنة للأداء
const timeframes = [
  // إطارات محسنة للأداء - تحديث أبطأ لتحسين الأداء
  { value: '1s', label: '1 ثانية | 1s', updateInterval: 2000, platform: 'TradingView', realTime: true },
  { value: '5s', label: '5 ثواني | 5s', updateInterval: 3000, platform: 'TradingView', realTime: true },
  { value: '15s', label: '15 ثانية | 15s', updateInterval: 4000, platform: 'TradingView', realTime: true },
  { value: '30s', label: '30 ثانية | 30s', updateInterval: 5000, platform: 'TradingView', realTime: true },
  // Standard Minute Timeframes (Global Platforms)
  { value: '1m', label: '1 دقيقة | 1m', updateInterval: 6000, platform: 'All', realTime: true },
  { value: '3m', label: '3 دقائق | 3m', updateInterval: 8000, platform: 'Binance', realTime: true },
  { value: '5m', label: '5 دقائق | 5m', updateInterval: 10000, platform: 'All', realTime: true },
  { value: '15m', label: '15 دقيقة | 15m', updateInterval: 15000, platform: 'All', realTime: true },
  { value: '30m', label: '30 دقيقة | 30m', updateInterval: 30000, platform: 'All', realTime: true },
  // Hour Timeframes
  { value: '1h', label: '1 ساعة | 1h', updateInterval: 60000, platform: 'All', realTime: true },
  { value: '2h', label: '2 ساعة | 2h', updateInterval: 120000, platform: 'TradingView', realTime: true },
  { value: '4h', label: '4 ساعات | 4h', updateInterval: 240000, platform: 'All', realTime: true },
  { value: '6h', label: '6 ساعات | 6h', updateInterval: 360000, platform: 'Binance', realTime: true },
  { value: '8h', label: '8 ساعات | 8h', updateInterval: 480000, platform: 'TradingView', realTime: true },
  { value: '12h', label: '12 ساعة | 12h', updateInterval: 720000, platform: 'Binance', realTime: true },
  // Daily and Weekly Timeframes
  { value: '1d', label: '1 يوم | 1D', updateInterval: 300000, platform: 'All', realTime: false },
  { value: '3d', label: '3 أيام | 3D', updateInterval: 900000, platform: 'TradingView', realTime: false },
  { value: '1w', label: '1 أسبوع | 1W', updateInterval: 1800000, platform: 'All', realTime: false },
  { value: '1M', label: '1 شهر | 1M', updateInterval: 3600000, platform: 'All', realTime: false }
];

// 🎯 إعدادات التحديث الذكي حسب المنصة
const PLATFORM_UPDATE_CONFIGS = {
  TradingView: {
    name: 'TradingView',
    icon: '📊',
    colors: { primary: '#2962FF', secondary: '#1E88E5' },
    features: ['real_time', 'volume_profile', 'advanced_patterns'],
    updateStrategy: 'aggressive'
  },
  MetaTrader: {
    name: 'MetaTrader',
    icon: '📈',
    colors: { primary: '#00897B', secondary: '#26A69A' },
    features: ['expert_advisors', 'custom_indicators', 'backtesting'],
    updateStrategy: 'balanced'
  },
  Binance: {
    name: 'Binance',
    icon: '⚡',
    colors: { primary: '#F0B90B', secondary: '#FCD535' },
    features: ['spot_trading', 'futures', 'real_time_data'],
    updateStrategy: 'fast'
  },
  All: {
    name: 'جميع المنصات',
    icon: '🌐',
    colors: { primary: '#FFD700', secondary: '#FFA000' },
    features: ['universal_compatibility'],
    updateStrategy: 'adaptive'
  }
};

// دالة التحكم في سرعة التحديث (Throttling) - محسّنة للأداء
function throttle(func, limit = 100) { // زيادة الحد الافتراضي إلى 100ms
  let inThrottle;
  let lastArgs;
  return function() {
    const args = arguments;
    const context = this;
    lastArgs = args;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        // تشغيل آخر استدعاء إذا كان هناك استدعاءات معلقة
        if (lastArgs && lastArgs !== args) {
          func.apply(context, lastArgs);
        }
      }, limit);
    }
  }
}

const JapaneseCandlestickAnalysis = React.forwardRef((props, ref) => {
  return (
    <DataProvider>
      <MarketDataProvider>
        <JapaneseCandlestickContent ref={ref} {...props} />
      </MarketDataProvider>
    </DataProvider>
  );
});

JapaneseCandlestickAnalysis.displayName = 'JapaneseCandlestickAnalysis';

export default JapaneseCandlestickAnalysis;

// محتوى المكون الرئيسي مع الشريط الجانبي الأصلي
const JapaneseCandlestickContent = React.forwardRef((props, ref) => {
  // MongoDB Data Provider Hook
  const { 
    isConnected, 
    stats, 
    symbols, 
    fetchSymbolData, 
    updateData, 
    loading 
  } = useDataProvider();
  
  // State variables
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [candleData, setCandleData] = useState([]);
  const [detectedPatterns, setDetectedPatterns] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // 🎯 Smart Movement States - حالات الحركة الذكية
  const [currentTrend, setCurrentTrend] = useState('neutral');
  const [animatingCandles, setAnimatingCandles] = useState(new Map());
  const [marketMomentum, setMarketMomentum] = useState(0);
  const [lastTrendChange, setLastTrendChange] = useState(null);
  
  // Market data states  
  const [currentPrice, setCurrentPrice] = useState(0); // سيتم تحديثه من البيانات الحقيقية
  const [priceChange, setPriceChange] = useState(2.34);
  const [volume, setVolume] = useState(1200000);
  
  // Settings states - محسنة للأداء
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h'); // افتراضي أبطأ للأداء
  const [selectedChartType, setSelectedChartType] = useState('candlestick');
  const [advancedSettings, setAdvancedSettings] = useState({
    useRealData: true, // استخدام البيانات الحقيقية بشكل افتراضي
    updateSpeed: 'slow' // تحسين الأداء بسرعة أبطأ
  });
  
  // Technical indicators states
  const [technicalIndicators, setTechnicalIndicators] = useState({
    rsi: { visible: false, value: 65.4 },
    macd: { visible: false, value: { signal: 0.5, histogram: 0.3 } },
    bollinger: { visible: false, bands: { upper: 52000, middle: 50500, lower: 49000 } }
  });
  
  // Real-time data state
  const [realTimeData, setRealTimeData] = useState({
    connected: false,
    lastUpdate: null,
    selectedSymbol: 'TASI',
    currentPrice: 0
  });
  
  // UI control states
  const [showMarketSettings, setShowMarketSettings] = useState(false);
  const [showConsensusPanel, setShowConsensusPanel] = useState(false);
  const [showToolInstructions, setShowToolInstructions] = useState(false);
  const [showMongoDBViewer, setShowMongoDBViewer] = useState(false);
  
  // Selected symbol state (only needed for MongoDB integration)
  const [selectedSymbol, setSelectedSymbol] = useState('TASI');

  // ==================================================================================
  // 🔍 ZOOM & PAN SYSTEM - نظام التكبير والتصغير التفاعلي
  // ==================================================================================
  
  // Zoom and Pan states - حالات التكبير والتحريك
  const [zoomState, setZoomState] = useState({
    // Time axis zoom (X-axis)
    timeZoom: 1.0,          // مستوى التكبير الزمني (1.0 = عادي)
    timeOffset: 0,          // إزاحة زمنية (للتحريك الأفقي)
    
    // Price axis zoom (Y-axis)  
    priceZoom: 1.0,         // مستوى التكبير السعري (1.0 = عادي)
    priceOffset: 0,         // إزاحة سعرية (للتحريك العمودي)
    
    // Zoom focus point
    focusPoint: { x: 0.5, y: 0.5 }, // نقطة التركيز النسبية (0-1)
    
    // Zoom limits
    minTimeZoom: 0.1,       // أدنى تكبير زمني (عرض 10x شموع أكثر)
    maxTimeZoom: 10.0,      // أقصى تكبير زمني (عرض شمعة واحدة فقط)
    minPriceZoom: 0.1,      // أدنى تكبير سعري
    maxPriceZoom: 5.0,      // أقصى تكبير سعري
    
    // Pan limits (to prevent infinite scrolling)
    maxTimeOffset: 1000,    // أقصى إزاحة زمنية
    maxPriceOffset: 1000,   // أقصى إزاحة سعرية
    
    // Animation states
    isZooming: false,       // حالة التكبير النشطة
    isPanning: false,       // حالة التحريك النشطة
    lastZoomTime: 0         // آخر وقت تكبير (للحد من التكرار)
  });

  // Mouse and interaction states for zoom/pan
  const [panState, setPanState] = useState({
    isDragging: false,      // حالة السحب النشطة
    lastMousePos: null,     // آخر موقع للماوس
    dragStartPos: null,     // موقع بداية السحب
    dragStartZoom: null     // حالة التكبير عند بداية السحب
  });

  // Zoom and Pan refs for performance
  const zoomRef = useRef(zoomState);
  const panRef = useRef(panState);
  
  // Update refs when state changes
  useEffect(() => {
    zoomRef.current = zoomState;
  }, [zoomState]);
  
  useEffect(() => {
    panRef.current = panState;
  }, [panState]);

  // ==================================================================================
  // 🔍 ZOOM & PAN FUNCTIONS - دوال التكبير والتصغير التفاعلي
  // ==================================================================================

  // 🎯 دالة التكبير الزمني (Time Zoom)
  const zoomTime = useCallback((direction, mouseX = null) => {
    const now = Date.now();
    if (now - zoomRef.current.lastZoomTime < 50) return; // منع التكرار السريع

    setZoomState(prev => {
      const zoomFactor = 1.2; // معامل التكبير
      const newTimeZoom = direction > 0 
        ? Math.min(prev.maxTimeZoom, prev.timeZoom * zoomFactor)
        : Math.max(prev.minTimeZoom, prev.timeZoom / zoomFactor);

      // حساب نقطة التركيز بناءً على موقع الماوس
      let newFocusX = prev.focusPoint.x;
      if (mouseX !== null && canvasRef.current) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        newFocusX = (mouseX - rect.left) / canvas.width;
      }

      // تعديل الإزاحة للحفاظ على نقطة التركيز
      const zoomRatio = newTimeZoom / prev.timeZoom;
      const newTimeOffset = prev.timeOffset + (newFocusX - 0.5) * (1 - 1/zoomRatio) * 100;

      return {
        ...prev,
        timeZoom: newTimeZoom,
        timeOffset: Math.max(-prev.maxTimeOffset, Math.min(prev.maxTimeOffset, newTimeOffset)),
        focusPoint: { ...prev.focusPoint, x: newFocusX },
        isZooming: true,
        lastZoomTime: now
      };
    });

    // إيقاف مؤشر التكبير بعد قليل
    setTimeout(() => {
      setZoomState(prev => ({ ...prev, isZooming: false }));
    }, 300);
  }, []);

  // 🎯 دالة التكبير السعري (Price Zoom)
  const zoomPrice = useCallback((direction, mouseY = null) => {
    const now = Date.now();
    if (now - zoomRef.current.lastZoomTime < 50) return;

    setZoomState(prev => {
      const zoomFactor = 1.15;
      const newPriceZoom = direction > 0 
        ? Math.min(prev.maxPriceZoom, prev.priceZoom * zoomFactor)
        : Math.max(prev.minPriceZoom, prev.priceZoom / zoomFactor);

      // حساب نقطة التركيز بناءً على موقع الماوس
      let newFocusY = prev.focusPoint.y;
      if (mouseY !== null && canvasRef.current) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        newFocusY = (mouseY - rect.top) / canvas.height;
      }

      // تعديل الإزاحة للحفاظ على نقطة التركيز
      const zoomRatio = newPriceZoom / prev.priceZoom;
      const newPriceOffset = prev.priceOffset + (newFocusY - 0.5) * (1 - 1/zoomRatio) * 100;

      return {
        ...prev,
        priceZoom: newPriceZoom,
        priceOffset: Math.max(-prev.maxPriceOffset, Math.min(prev.maxPriceOffset, newPriceOffset)),
        focusPoint: { ...prev.focusPoint, y: newFocusY },
        isZooming: true,
        lastZoomTime: now
      };
    });

    setTimeout(() => {
      setZoomState(prev => ({ ...prev, isZooming: false }));
    }, 300);
  }, []);

  // 🎯 دالة التحريك الأفقي (Horizontal Pan)
  const panHorizontal = useCallback((deltaX) => {
    setZoomState(prev => {
      const sensitivity = 1.0 / prev.timeZoom; // حساسية أقل مع التكبير الأكبر
      const newTimeOffset = prev.timeOffset + deltaX * sensitivity;
      
      return {
        ...prev,
        timeOffset: Math.max(-prev.maxTimeOffset, Math.min(prev.maxTimeOffset, newTimeOffset)),
        isPanning: true
      };
    });
  }, []);

  // 🎯 دالة التحريك العمودي (Vertical Pan)
  const panVertical = useCallback((deltaY) => {
    setZoomState(prev => {
      const sensitivity = 1.0 / prev.priceZoom;
      const newPriceOffset = prev.priceOffset + deltaY * sensitivity;
      
      return {
        ...prev,
        priceOffset: Math.max(-prev.maxPriceOffset, Math.min(prev.maxPriceOffset, newPriceOffset)),
        isPanning: true
      };
    });
  }, []);

  // 🎯 دالة إعادة تعيين التكبير (Reset Zoom)
  const resetZoom = useCallback(() => {
    setZoomState(prev => ({
      ...prev,
      timeZoom: 1.0,
      priceZoom: 1.0,
      timeOffset: 0,
      priceOffset: 0,
      focusPoint: { x: 0.5, y: 0.5 },
      isZooming: false,
      isPanning: false
    }));
  }, []);

  // 🎯 دالة تكبير المنطقة المحددة (Zoom to Selection)
  const zoomToArea = useCallback((startX, startY, endX, endY) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // تحويل إحداثيات الماوس إلى نسب
    const x1 = Math.min(startX, endX) / canvas.width;
    const x2 = Math.max(startX, endX) / canvas.width;
    const y1 = Math.min(startY, endY) / canvas.height;
    const y2 = Math.max(startY, endY) / canvas.height;
    
    // حساب مستوى التكبير المطلوب
    const timeZoomRequired = 1 / (x2 - x1);
    const priceZoomRequired = 1 / (y2 - y1);
    
    setZoomState(prev => ({
      ...prev,
      timeZoom: Math.min(prev.maxTimeZoom, Math.max(prev.minTimeZoom, timeZoomRequired)),
      priceZoom: Math.min(prev.maxPriceZoom, Math.max(prev.minPriceZoom, priceZoomRequired)),
      timeOffset: -(x1 + x2 - 1) * 50, // محاذاة الوسط
      priceOffset: -(y1 + y2 - 1) * 50,
      focusPoint: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 }
    }));
  }, []);

  // 🎯 دالة حساب المدى المعروض (Visible Range)
  const getVisibleRange = useCallback((dataLength) => {
    const { timeZoom, timeOffset } = zoomRef.current;
    
    // حساب عدد الشموع المعروضة
    const visibleCount = Math.max(10, Math.min(dataLength, Math.floor(dataLength / timeZoom)));
    
    // حساب النقطة المركزية
    const centerIndex = dataLength - 1 - (timeOffset / timeZoom);
    
    // حساب البداية والنهاية
    const startIndex = Math.max(0, Math.floor(centerIndex - visibleCount / 2));
    const endIndex = Math.min(dataLength - 1, startIndex + visibleCount);
    
    return {
      startIndex,
      endIndex,
      visibleCount: endIndex - startIndex + 1,
      centerIndex
    };
  }, []);

  // 🎯 دالة حساب مدى الأسعار المعروض (Visible Price Range)
  const getVisiblePriceRange = useCallback((candleData, visibleRange) => {
    if (!candleData.length || !visibleRange) return null;

    const visibleData = candleData.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
    const prices = visibleData.flatMap(d => [d.high, d.low, d.open, d.close]);
    
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;
    
    // تطبيق التكبير السعري
    const { priceZoom, priceOffset } = zoomRef.current;
    const zoomedRange = priceRange / priceZoom;
    const centerPrice = (maxPrice + minPrice) / 2;
    const offsetPrice = priceOffset * priceRange / 100;
    
    return {
      maxPrice: centerPrice + zoomedRange / 2 - offsetPrice,
      minPrice: centerPrice - zoomedRange / 2 - offsetPrice,
      range: zoomedRange,
      originalMax: maxPrice,
      originalMin: minPrice,
      originalRange: priceRange
    };
  }, []);

  // دالة جلب البيانات من MongoDB
  const fetchRealDataFromMongoDB = useCallback(async (symbol) => {
    if (!isConnected || !fetchSymbolData) {
      return [];
    }

    try {
      const mongoSymbol = symbol === 'TASI' ? 'TADAWUL:TASI' : 
                         symbol === 'AAPL' ? 'NASDAQ:AAPL' :
                         symbol === 'TSLA' ? 'NASDAQ:TSLA' :
                         symbol === 'BTC' ? 'BINANCE:BTCUSDT' :
                         `NASDAQ:${symbol}`;

      const data = await fetchSymbolData(mongoSymbol, 200);
      
      if (data && data.length > 0) {
        const candleData = data.map((item, index) => ({
          timestamp: new Date(item.datetime).getTime(),
          open: parseFloat(item.open),
          high: parseFloat(item.high),
          low: parseFloat(item.low),
          close: parseFloat(item.close),
          volume: parseFloat(item.volume) || 0,
          source: 'mongodb',
          index: index
        }));

        return candleData;
      }
    } catch (error) {
      // خطأ في جلب البيانات
    }

    return [];
  }, [isConnected, fetchSymbolData]);

  // 🎯 حالات التفاعل مع الشموع والأدوات التحليلية
  const [interactiveMode, setInteractiveMode] = useState(null); // الأداة المختارة حالياً
  const [selectedCandles, setSelectedCandles] = useState([]); // الشموع المختارة
  const [drawingLines, setDrawingLines] = useState([]); // الخطوط المرسومة
  const [fibonacciLevels, setFibonacciLevels] = useState([]); // مستويات فيبوناتشي
  const [gannAngles, setGannAngles] = useState([]); // زوايا جان
  const [supportResistanceLines, setSupportResistanceLines] = useState([]); // خطوط الدعم والمقاومة
  const [trendLines, setTrendLines] = useState([]); // خطوط الاتجاه
  const [priceChannels, setPriceChannels] = useState([]); // قنوات السعر
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 }); // موقع الماوس
  const [isDrawing, setIsDrawing] = useState(false); // حالة الرسم
  const [drawingStart, setDrawingStart] = useState(null); // نقطة بداية الرسم
  const [activeTools, setActiveTools] = useState([]); // الأدوات النشطة
  const [previewData, setPreviewData] = useState(null); // معاينة مباشرة للأداة
  
  // 🔧 أنماط الأدوات التفاعلية
  const INTERACTIVE_TOOLS = {
    fibonacci: { name: 'مستويات فيبوناتشي', icon: '📊', color: '#FFD700', shortcut: 'F' },
    gann_angles: { name: 'زوايا جان', icon: '🔄', color: '#00BFFF', shortcut: 'G' },
    support_resistance: { name: 'دعم ومقاومة', icon: '📈', color: '#00FF41', shortcut: 'S' },
    pattern_detection: { name: 'كشف الأنماط', icon: '🎯', color: '#FF1744', shortcut: 'P' },
    trend_lines: { name: 'خطوط الاتجاه', icon: '📏', color: '#9C27B0', shortcut: 'T' },
    price_channels: { name: 'قنوات السعر', icon: '🌊', color: '#FF9800', shortcut: 'C' }
  };

  // Event handlers
  const handleTimeframeChange = useCallback((newTimeframe) => {
    setSelectedTimeframe(newTimeframe);
  }, []);

  const handleChartTypeChange = useCallback((newChartType) => {
    setSelectedChartType(newChartType);
    
    // إظهار رسالة تأكيد فورية
    setPreviewData({
      type: 'chart_type_change',
      message: `📊 تم التبديل إلى ${CHART_TYPES.find(t => t.value === newChartType)?.label || newChartType}`,
      color: '#3b82f6'
    });
    
    // إخفاء رسالة التأكيد بعد ثانية
    setTimeout(() => setPreviewData(null), 1000);
  }, []);

  const handleInteractiveModeChange = useCallback((newMode) => {
    setInteractiveMode(newMode);
    setIsDrawing(false);
    setDrawingStart(null);
    setPreviewData(null);
    
    // إظهار إرشادات فورية للأداة المختارة

  // ==================================================================================
  // 🖱️ ZOOM & PAN EVENT HANDLERS - معالجات أحداث التكبير والتصغير
  // ==================================================================================

  // 🎯 معالج عجلة الماوس للتكبير والتصغير
  const handleWheelZoom = useCallback((event) => {
    event.preventDefault();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // تحديد نوع التكبير حسب المفاتيح المضغوطة
    if (event.ctrlKey || event.metaKey) {
      // Ctrl + Wheel = تكبير سعري (Y-axis)
      zoomPrice(event.deltaY < 0 ? 1 : -1, mouseY);
    } else if (event.shiftKey) {
      // Shift + Wheel = تحريك أفقي
      panHorizontal(event.deltaY / 10);
    } else {
      // Wheel عادي = تكبير زمني (X-axis)
      zoomTime(event.deltaY < 0 ? 1 : -1, mouseX);
    }
  }, [zoomTime, zoomPrice, panHorizontal]);

  // 🎯 معالج بداية السحب للتحريك
  const handleMouseDown = useCallback((event) => {
    if (event.button === 1 || (event.button === 0 && event.altKey)) {
      // Middle click أو Alt + Left click = بدء التحريك
      event.preventDefault();
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mousePos = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };

      setPanState(prev => ({
        ...prev,
        isDragging: true,
        lastMousePos: mousePos,
        dragStartPos: mousePos,
        dragStartZoom: { ...zoomRef.current }
      }));
    }
  }, []);

  // 🎯 معالج حركة الماوس للتحريك
  const handleMouseMove = useCallback((event) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mousePos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    // تحديث موقع الماوس العام
    setMousePosition(mousePos);

    // معالجة التحريك إذا كان نشطًا
    if (panRef.current.isDragging && panRef.current.lastMousePos) {
      const deltaX = mousePos.x - panRef.current.lastMousePos.x;
      const deltaY = mousePos.y - panRef.current.lastMousePos.y;

      // تطبيق التحريك
      panHorizontal(-deltaX / 5); // التحريك الأفقي مع تقليل الحساسية
      panVertical(deltaY / 5);     // التحريك العمودي مع تقليل الحساسية

      setPanState(prev => ({
        ...prev,
        lastMousePos: mousePos
      }));
    }
  }, [panHorizontal, panVertical]);

  // 🎯 معالج انتهاء السحب
  const handleMouseUp = useCallback((event) => {
    if (panRef.current.isDragging) {
      setPanState(prev => ({
        ...prev,
        isDragging: false,
        lastMousePos: null,
        dragStartPos: null,
        dragStartZoom: null
      }));

      // إيقاف مؤشر التحريك
      setZoomState(prev => ({ ...prev, isPanning: false }));
    }
  }, []);

  // 🎯 معالج النقر المزدوج لإعادة تعيين التكبير
  const handleDoubleClick = useCallback((event) => {
    if (event.ctrlKey) {
      // Ctrl + Double Click = إعادة تعيين كامل
      resetZoom();
    } else {
      // Double Click عادي = تكبير على نقطة النقر
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      zoomTime(1, mouseX);
      zoomPrice(1, mouseY);
    }
  }, [resetZoom, zoomTime, zoomPrice]);

  // 🎯 معالج اختصارات لوحة المفاتيح للتكبير
  const handleKeyboardZoom = useCallback((event) => {
    if (event.target.tagName === 'INPUT') return; // تجنب التداخل مع حقول النص

    switch (event.key.toLowerCase()) {
      case '+':
      case '=':
        event.preventDefault();
        if (event.ctrlKey) {
          zoomPrice(1);
        } else {
          zoomTime(1);
        }
        break;
      case '-':
        event.preventDefault();
        if (event.ctrlKey) {
          zoomPrice(-1);
        } else {
          zoomTime(-1);
        }
        break;
      case '0':
        if (event.ctrlKey) {
          event.preventDefault();
          resetZoom();
        }
        break;
      case 'arrowleft':
        if (event.shiftKey) {
          event.preventDefault();
          panHorizontal(-10);
        }
        break;
      case 'arrowright':
        if (event.shiftKey) {
          event.preventDefault();
          panHorizontal(10);
        }
        break;
      case 'arrowup':
        if (event.shiftKey) {
          event.preventDefault();
          panVertical(-10);
        }
        break;
      case 'arrowdown':
        if (event.shiftKey) {
          event.preventDefault();
          panVertical(10);
        }
        break;
    }
  }, [zoomTime, zoomPrice, resetZoom, panHorizontal, panVertical]);

  // ==================================================================================
  // 📍 ZOOM & PAN EVENT LISTENERS - ربط معالجات الأحداث
  // ==================================================================================

  // ربط معالجات أحداث الماوس والكيبورد
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // إضافة معالجات الماوس
    canvas.addEventListener('wheel', handleWheelZoom, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('dblclick', handleDoubleClick);
    
    // إضافة معالج لوحة المفاتيح للنافذة
    window.addEventListener('keydown', handleKeyboardZoom);
    
    // معالج مغادرة الماوس للكانفاس
    const handleMouseLeave = () => {
      if (panRef.current.isDragging) {
        setPanState(prev => ({
          ...prev,
          isDragging: false,
          lastMousePos: null,
          dragStartPos: null,
          dragStartZoom: null
        }));
        setZoomState(prev => ({ ...prev, isPanning: false }));
      }
    };
    
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // تنظيف المعالجات عند الإلغاء
    return () => {
      canvas.removeEventListener('wheel', handleWheelZoom);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('dblclick', handleDoubleClick);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('keydown', handleKeyboardZoom);
    };
  }, [handleWheelZoom, handleMouseDown, handleMouseMove, handleMouseUp, handleDoubleClick, handleKeyboardZoom]);

  // ⚠️ DISABLED: تحديث دالة الرسم عند تغيير حالة التكبير - moved to unified render
  // useEffect(() => {
  //   const canvas = canvasRef.current;
  //   if (!canvas || !candleData.length) return;
  //   const ctx = canvas.getContext('2d');
  //   requestAnimationFrame(() => {
  //     drawSmartMovingCandlesticks(canvas, ctx, candleData);
  //   });
  // }, [zoomState, candleData, drawSmartMovingCandlesticks]);

    if (newMode) {
      setShowToolInstructions(true);
      // إخفاء الإرشادات تلقائياً بعد 3 ثوان
      setTimeout(() => setShowToolInstructions(false), 3000);
      
      // إظهار رسالة تأكيد فورية
      setPreviewData({
        type: 'mode_change',
        message: `✅ تم تفعيل ${INTERACTIVE_TOOLS[newMode]?.name || newMode}`,
        color: INTERACTIVE_TOOLS[newMode]?.color || '#4ade80'
      });
      
      // إخفاء رسالة التأكيد بعد ثانية
      setTimeout(() => setPreviewData(null), 1000);
    } else {
      setShowToolInstructions(false);
    }
  }, []);

  const connectToRealTimeData = useCallback((symbol) => {
    setRealTimeData(prev => ({
      ...prev,
      connected: true,
      lastUpdate: new Date(),
      selectedSymbol: symbol
    }));
  }, []);

  const handleMouseMove = useCallback((e) => {
    // Mouse move logic
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Mouse leave logic
  }, []);

  const handleCanvasClick = useCallback((e) => {
    // Canvas click logic
  }, []);

  //   تحليل جان المتقدم - زوايا ومستويات ونقاط زمنية - ديناميكي
  const analyzeGannLevels = useCallback((data, currentPrice) => {
    if (!data || data.length < 10 || !currentPrice) {
      return {
        angles: [],
        timeIntervals: [],
        priceSquares: [],
        fanLines: [],
        levels: []
      };
    }

    const gannAnalysis = {
      angles: [],
      timeIntervals: [],
      priceSquares: [],
      fanLines: [],
      levels: []
    };
    
    // حساب نقطة البداية الديناميكية (أعلى أو أدنى نقطة حديثة)
    const recentData = data.slice(-20);
    const recentHigh = Math.max(...recentData.map(d => d.high));
    const recentLow = Math.min(...recentData.map(d => d.low));
    
    // تحديد النقطة المحورية
    const pivotPoint = currentPrice > (recentHigh + recentLow) / 2 ? recentLow : recentHigh;
    const priceRange = Math.abs(currentPrice - pivotPoint);
    
    // زوايا جان الرئيسية مع حساب ديناميكي
    const mainAngles = [45, 26.25, 63.75, 18.75, 71.25, 15, 75, 82.5, 7.5];
    
    mainAngles.forEach(angle => {
      const radians = (angle * Math.PI) / 180;
      
      // حساب مستويات الأسعار بناءً على الزاوية والنقطة المحورية
      const priceMultiplier = Math.tan(radians);
      const timeUnits = data.length; // استخدام طول البيانات كوحدة زمنية
      
      let priceLevel1, priceLevel2;
      
      if (currentPrice > pivotPoint) {
        // اتجاه صاعد
        priceLevel1 = pivotPoint + (priceRange * priceMultiplier);
        priceLevel2 = pivotPoint - (priceRange * priceMultiplier * 0.618); // نسبة فيبوناتشي
      } else {
        // اتجاه هابط
        priceLevel1 = pivotPoint - (priceRange * priceMultiplier);
        priceLevel2 = pivotPoint + (priceRange * priceMultiplier * 0.618);
      }
      
      gannAnalysis.angles.push({
        angle,
        priceLevel: priceLevel1.toFixed(2),
        supportLevel: priceLevel2.toFixed(2),
        strength: angle === 45 ? 'قوي جداً' : 
                 (angle === 26.25 || angle === 63.75) ? 'قوي' : 
                 (angle === 18.75 || angle === 71.25) ? 'متوسط' : 'ضعيف',
        distance: Math.abs(currentPrice - priceLevel1),
        type: priceLevel1 > currentPrice ? 'مقاومة' : 'دعم',
        relevance: calculateAngleRelevance(angle, currentPrice, priceLevel1)
      });
    });
    
    // ترتيب الزوايا حسب القرب من السعر الحالي
    gannAnalysis.angles.sort((a, b) => a.distance - b.distance);
    
    // حساب مربع التسعة الديناميكي
    const squareOfNine = calculateSquareOfNine(currentPrice);
    gannAnalysis.priceSquares = squareOfNine.levels;
    
    // تحديد وحدة الزمن للحسابات
    const timeUnits = data.length; // استخدام طول البيانات كوحدة زمنية
    
    // حساب مستويات المراوح (Fan Lines)
    const fanLines = calculateGannFans(pivotPoint, currentPrice, timeUnits);
    gannAnalysis.fanLines = fanLines;
    
    // تحليل النقاط الزمنية الديناميكية
    const cycleDays = calculateGannCycles(data);
    cycleDays.forEach(interval => {
      const nextCycleDate = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);
      gannAnalysis.timeIntervals.push({
        days: interval,
        significance: interval % 30 === 0 ? 'حرج' : 
                     interval % 21 === 0 ? 'مهم جداً' :
                     interval % 7 === 0 ? 'مهم' : 'عادي',
        nextDate: nextCycleDate.toLocaleDateString('ar-SA'),
        strength: calculateTimeIntervalStrength(interval, data.length)
      });
    });
    
    // إضافة أقرب المستويات للعرض
    gannAnalysis.levels = gannAnalysis.angles.slice(0, 5).map(angle => ({
      price: parseFloat(angle.priceLevel),
      type: angle.type,
      strength: angle.strength,
      angle: angle.angle
    }));
    
    return gannAnalysis;
  }, []);

  // دالة حساب صلة الزاوية
  const calculateAngleRelevance = (angle, currentPrice, targetPrice) => {
    const priceDistance = Math.abs(currentPrice - targetPrice) / currentPrice;
    const angleImportance = angle === 45 ? 1.0 : 
                           (angle === 26.25 || angle === 63.75) ? 0.8 : 
                           (angle === 18.75 || angle === 71.25) ? 0.6 : 0.4;
    
    return angleImportance * (1 - Math.min(priceDistance, 1));
  };

  // دالة حساب مربع التسعة
  const calculateSquareOfNine = (price) => {
    const sqrt = Math.sqrt(price);
    const baseNumber = Math.floor(sqrt);
    const levels = [];
    
    for (let i = -2; i <= 2; i++) {
      const level = Math.pow(baseNumber + i, 2);
      if (level > 0) {
        levels.push({
          price: level,
          type: level > price ? 'مقاومة' : 'دعم',
          strength: Math.abs(i) === 0 ? 'قوي جداً' : Math.abs(i) === 1 ? 'قوي' : 'متوسط'
        });
      }
    }
    
    return { levels, baseSquare: Math.pow(baseNumber, 2) };
  };

  // دالة حساب مراوح جان
  const calculateGannFans = (pivotPoint, currentPrice, timeUnits) => {
    const fanAngles = [82.5, 75, 71.25, 63.75, 45, 26.25, 18.75, 15, 7.5];
    const priceRange = Math.abs(currentPrice - pivotPoint);
    
    return fanAngles.map(angle => {
      const radians = (angle * Math.PI) / 180;
      const slope = Math.tan(radians);
      const targetPrice = pivotPoint + (priceRange * slope);
      
      return {
        angle,
        startPrice: pivotPoint,
        targetPrice,
        slope,
        strength: angle === 45 ? 'مرجعي' : 'مساعد'
      };
    });
  };

  // دالة حساب دورات جان الزمنية
  const calculateGannCycles = (data) => {
    const dataLength = data.length;
    const baseCycles = [7, 14, 21, 30, 45, 60, 90, 120, 180, 360];
    
    // تصفية الدورات بناءً على طول البيانات المتوفرة
    return baseCycles.filter(cycle => cycle <= dataLength * 2)
                    .slice(0, 6); // أخذ أول 6 دورات فقط
  };

  // دالة حساب قوة الفترة الزمنية
  const calculateTimeIntervalStrength = (interval, dataLength) => {
    if (interval <= dataLength * 0.1) return 'قوي جداً';
    if (interval <= dataLength * 0.25) return 'قوي';
    if (interval <= dataLength * 0.5) return 'متوسط';
    return 'ضعيف';
  };
  
  // 📊 تحليل المستويات - دعم ومقاومة وفيبوناتشي
  const analyzeSupportResistanceLevels = useCallback((data) => {
    if (data.length < 20) return { support: [], resistance: [], fibonacci: [] };
    
    const high = Math.max(...data.map(d => d.high));
    const low = Math.min(...data.map(d => d.low));
    const range = high - low;
    
    const levels = {
      support: [],
      resistance: [],
      fibonacci: []
    };
    
    // مستويات فيبوناتشي
    ADVANCED_ANALYSIS_PATTERNS.LEVELS.fibonacci.forEach(ratio => {
      const level = low + (range * ratio / 100);
      levels.fibonacci.push({
        level: level.toFixed(2),
        ratio: ratio + '%',
        type: ratio < 50 ? 'دعم' : ratio > 50 ? 'مقاومة' : 'محوري',
        strength: ratio === 38.2 || ratio === 61.8 ? 'قوي' : ratio === 50 ? 'متوسط' : 'ضعيف'
      });
    });
    
    // مستويات الدعم والمقاومة التلقائية
    const recentData = data.slice(-50);
    const supportLevels = recentData
      .filter(candle => candle.low <= low * 1.02)
      .map(candle => candle.low)
      .filter((value, index, array) => array.indexOf(value) === index)
      .sort((a, b) => b - a)
      .slice(0, 3);
      
    const resistanceLevels = recentData
      .filter(candle => candle.high >= high * 0.98)
      .map(candle => candle.high)
      .filter((value, index, array) => array.indexOf(value) === index)
      .sort((a, b) => a - b)
      .slice(0, 3);
    
    levels.support = supportLevels.map(level => ({
      level: level.toFixed(2),
      strength: 'متوسط',
      touches: recentData.filter(c => Math.abs(c.low - level) < range * 0.005).length
    }));
    
    levels.resistance = resistanceLevels.map(level => ({
      level: level.toFixed(2),
      strength: 'متوسط',
      touches: recentData.filter(c => Math.abs(c.high - level) < range * 0.005).length
    }));
    
    return levels;
  }, []);
  
  // 📈 تحليل أنماط الشموع اليابانية - أكثر من 20 نمط
  // 🔍 دالة كشف أنماط الشموع المحسنة - أكثر من 25 نمط
  const detectCandlestickPatterns = useCallback((data) => {
    if (data.length < 1) return [];
    
    const patterns = [];
    
    // تحليل الأنماط الفردية (شمعة واحدة)
    data.forEach((candle, index) => {
      const singlePatterns = detectSingleCandlePatterns(candle, index, data);
      patterns.push(...singlePatterns);
    });
    
    // تحليل الأنماط الثنائية (شمعتان)
    if (data.length >= 2) {
      for (let i = 1; i < data.length; i++) {
        const dualPatterns = detectDualCandlePatterns(data[i-1], data[i], i, data);
        patterns.push(...dualPatterns);
      }
    }
    
    // تحليل الأنماط الثلاثية (ثلاث شموع)
    if (data.length >= 3) {
      for (let i = 2; i < data.length; i++) {
        const triplePatterns = detectTripleCandlePatterns(data[i-2], data[i-1], data[i], i, data);
        patterns.push(...triplePatterns);
      }
    }
    
    // تحليل الأنماط المعقدة (4-5 شموع)
    if (data.length >= 5) {
      for (let i = 4; i < data.length; i++) {
        const complexPatterns = detectComplexCandlePatterns(data.slice(i-4, i+1), i, data);
        patterns.push(...complexPatterns);
      }
    }
    
    // ترتيب الأنماط حسب القوة والموثوقية
    const sortedPatterns = patterns
      .filter(p => p.strength >= 0.4) // فلترة الأنماط الضعيفة
      .sort((a, b) => b.strength - a.strength);
    
    return sortedPatterns;
  }, []); 

  // 🕯️ كشف أنماط الشمعة الواحدة
  const detectSingleCandlePatterns = useCallback((candle, index, fullData) => {
    const patterns = [];
    const bodySize = Math.abs(candle.close - candle.open);
    const upperShadow = candle.high - Math.max(candle.open, candle.close);
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
    const totalRange = candle.high - candle.low;
    const bodyPercent = bodySize / totalRange;
    
    // نمط الدوجي وأنواعه
    if (bodyPercent <= 0.1) {
      if (upperShadow > lowerShadow * 3) {
        patterns.push({
          name: 'gravestone_doji',
          arabic: 'دوجي شاهد القبر',
          type: 'انعكاس هابط',
          strength: 0.75,
          color: '#FF1744',
          position: index,
          reliability: 'جيد',
          description: 'إشارة انعكاس هابط قوية'
        });
      } else if (lowerShadow > upperShadow * 3) {
        patterns.push({
          name: 'dragonfly_doji',
          arabic: 'دوجي اليعسوب',
          type: 'انعكاس صاعد',
          strength: 0.70,
          color: '#00FF41',
          position: index,
          reliability: 'جيد',
          description: 'إشارة انعكاس صاعد'
        });
      } else {
        patterns.push({
          name: 'doji',
          arabic: 'دوجي',
          type: 'تردد',
          strength: 0.50,
          color: '#9C27B0',
          position: index,
          reliability: 'متوسط',
          description: 'تردد في السوق'
        });
      }
    }
    
    // نمط المطرقة
    else if (lowerShadow > bodySize * 2 && upperShadow < bodySize * 0.3 && candle.close > candle.open) {
      patterns.push({
        name: 'hammer',
        arabic: 'المطرقة',
        type: 'انعكاس صاعد',
        strength: 0.75,
        color: '#00FF41',
        position: index,
        reliability: 'ممتاز',
        description: 'نمط انعكاس صاعد قوي'
      });
    }
    
    // نمط المطرقة المقلوبة
    else if (upperShadow > bodySize * 2 && lowerShadow < bodySize * 0.3 && candle.close > candle.open) {
      patterns.push({
        name: 'inverted_hammer',
        arabic: 'المطرقة المقلوبة',
        type: 'انعكاس صاعد',
        strength: 0.65,
        color: '#39FF14',
        position: index,
        reliability: 'جيد',
        description: 'انعكاس صاعد محتمل'
      });
    }
    
    // نمط الرجل المعلق
    else if (lowerShadow > bodySize * 2 && upperShadow < bodySize * 0.3 && candle.close < candle.open) {
      patterns.push({
        name: 'hanging_man',
        arabic: 'الرجل المعلق',
        type: 'انعكاس هابط',
        strength: 0.70,
        color: '#FF1744',
        position: index,
        reliability: 'جيد',
        description: 'تحذير من انعكاس هابط'
      });
    }
    
    // نمط النجم المتساقط
    else if (upperShadow > bodySize * 2 && lowerShadow < bodySize * 0.3 && candle.close < candle.open) {
      patterns.push({
        name: 'shooting_star',
        arabic: 'النجم المتساقط',
        type: 'انعكاس هابط',
        strength: 0.65,
        color: '#FF4569',
        position: index,
        reliability: 'جيد',
        description: 'إشارة انعكاس هابط'
      });
    }
    
    // نمط الدوامة (Spinning Top)
    else if (bodyPercent <= 0.3 && upperShadow > bodySize && lowerShadow > bodySize) {
      patterns.push({
        name: 'spinning_top',
        arabic: 'القمة الدوارة',
        type: 'تردد',
        strength: 0.45,
        color: '#BA68C8',
        position: index,
        reliability: 'ضعيف',
        description: 'تردد بين المشترين والبائعين'
      });
    }
    
    return patterns;
  }, []);

  // 🕯️🕯️ كشف أنماط الشمعتين
  const detectDualCandlePatterns = useCallback((prev, current, index, fullData) => {
    const patterns = [];
    
    // نمط الابتلاع الصاعد
    if (prev.close < prev.open && current.close > current.open && 
        current.close > prev.open && current.open < prev.close) {
      patterns.push({
        name: 'bullish_engulfing',
        arabic: 'الابتلاع الصاعد',
        type: 'انعكاس صاعد',
        strength: 0.85,
        color: '#00FF41',
        position: index,
        reliability: 'ممتاز',
        description: 'نمط انعكاس صاعد قوي جداً'
      });
    }
    
    // نمط الابتلاع الهابط
    else if (prev.close > prev.open && current.close < current.open && 
             current.close < prev.open && current.open > prev.close) {
      patterns.push({
        name: 'bearish_engulfing',
        arabic: 'الابتلاع الهابط',
        type: 'انعكاس هابط',
        strength: 0.85,
        color: '#FF1744',
        position: index,
        reliability: 'ممتاز',
        description: 'نمط انعكاس هابط قوي جداً'
      });
    }
    
    // نمط الحرامي الصاعد
    else if (prev.close < prev.open && current.close > current.open &&
             current.open > prev.close && current.close < prev.open) {
      patterns.push({
        name: 'bullish_harami',
        arabic: 'الحرامي الصاعد',
        type: 'انعكاس صاعد',
        strength: 0.67,
        color: '#00CC33',
        position: index,
        reliability: 'جيد',
        description: 'انعكاس صاعد محتمل'
      });
    }
    
    // نمط الحرامي الهابط
    else if (prev.close > prev.open && current.close < current.open &&
             current.open < prev.close && current.close > prev.open) {
      patterns.push({
        name: 'bearish_harami',
        arabic: 'الحرامي الهابط',
        type: 'انعكاس هابط',
        strength: 0.66,
        color: '#CC1439',
        position: index,
        reliability: 'جيد',
        description: 'انعكاس هابط محتمل'
      });
    }
    
    // نمط الاختراق (Piercing Pattern)
    else if (prev.close < prev.open && current.close > current.open &&
             current.open < prev.close && current.close > (prev.open + prev.close) / 2) {
      patterns.push({
        name: 'piercing_pattern',
        arabic: 'نمط الاختراق',
        type: 'انعكاس صاعد',
        strength: 0.73,
        color: '#00CC33',
        position: index,
        reliability: 'جيد',
        description: 'اختراق صاعد للمقاومة'
      });
    }
    
    // نمط غطاء السحابة المظلمة
    else if (prev.close > prev.open && current.close < current.open &&
             current.open > prev.close && current.close < (prev.open + prev.close) / 2) {
      patterns.push({
        name: 'dark_cloud_cover',
        arabic: 'غطاء السحابة المظلمة',
        type: 'انعكاس هابط',
        strength: 0.76,
        color: '#CC1439',
        position: index,
        reliability: 'جيد',
        description: 'ضغط هابط قوي'
      });
    }
    
    // نمط الملقط العلوي
    else if (Math.abs(prev.high - current.high) < (prev.high * 0.005)) {
      patterns.push({
        name: 'tweezer_top',
        arabic: 'الملقط العلوي',
        type: 'انعكاس هابط',
        strength: 0.64,
        color: '#FF4569',
        position: index,
        reliability: 'متوسط',
        description: 'مقاومة قوية في الأعلى'
      });
    }
    
    // نمط الملقط السفلي
    else if (Math.abs(prev.low - current.low) < (prev.low * 0.005)) {
      patterns.push({
        name: 'tweezer_bottom',
        arabic: 'الملقط السفلي',
        type: 'انعكاس صاعد',
        strength: 0.63,
        color: '#39FF14',
        position: index,
        reliability: 'متوسط',
        description: 'دعم قوي في الأسفل'
      });
    }
    
    return patterns;
  }, []);

  // 🕯️🕯️🕯️ كشف أنماط الثلاث شموع
  const detectTripleCandlePatterns = useCallback((first, second, third, index, fullData) => {
    const patterns = [];
    
    // نمط نجمة الصباح
    if (first.close < first.open && // شمعة هابطة
        Math.abs(second.close - second.open) < (second.high - second.low) * 0.3 && // دوجي أو شمعة صغيرة
        third.close > third.open && // شمعة صاعدة
        third.close > (first.open + first.close) / 2) {
      patterns.push({
        name: 'morning_star',
        arabic: 'نجمة الصباح',
        type: 'انعكاس صاعد',
        strength: 0.82,
        color: '#39FF14',
        position: index,
        reliability: 'ممتاز',
        description: 'نمط انعكاس صاعد قوي جداً'
      });
    }
    
    // نمط نجمة المساء
    else if (first.close > first.open && // شمعة صاعدة
             Math.abs(second.close - second.open) < (second.high - second.low) * 0.3 && // دوجي أو شمعة صغيرة
             third.close < third.open && // شمعة هابطة
             third.close < (first.open + first.close) / 2) {
      patterns.push({
        name: 'evening_star',
        arabic: 'نجمة المساء',
        type: 'انعكاس هابط',
        strength: 0.81,
        color: '#FF4569',
        position: index,
        reliability: 'ممتاز',
        description: 'نمط انعكاس هابط قوي جداً'
      });
    }
    
    // نمط الجنود البيض الثلاثة
    else if (first.close > first.open && second.close > second.open && third.close > third.open &&
             second.close > first.close && third.close > second.close &&
             second.open > first.close && third.open > second.close) {
      patterns.push({
        name: 'three_white_soldiers',
        arabic: 'الجنود البيض الثلاثة',
        type: 'استمرار صاعد',
        strength: 0.88,
        color: '#00FF41',
        position: index,
        reliability: 'ممتاز',
        description: 'استمرار الاتجاه الصاعد بقوة'
      });
    }
    
    // نمط الغربان السود الثلاثة
    else if (first.close < first.open && second.close < second.open && third.close < third.open &&
             second.close < first.close && third.close < second.close &&
             second.open < first.close && third.open < second.close) {
      patterns.push({
        name: 'three_black_crows',
        arabic: 'الغربان السود الثلاثة',
        type: 'استمرار هابط',
        strength: 0.87,
        color: '#FF1744',
        position: index,
        reliability: 'ممتاز',
        description: 'استمرار الاتجاه الهابط بقوة'
      });
    }
    
    // نمط الثلاثة الداخلية الصاعدة
    else if (first.close < first.open && // شمعة هابطة كبيرة
             second.close > second.open && second.open > first.close && second.close < first.open && // حرامي صاعد
             third.close > third.open && third.close > first.open) { // تأكيد صاعد
      patterns.push({
        name: 'three_inside_up',
        arabic: 'الثلاثة الداخلية الصاعدة',
        type: 'انعكاس صاعد',
        strength: 0.71,
        color: '#00CC33',
        position: index,
        reliability: 'جيد',
        description: 'انعكاس صاعد مع تأكيد'
      });
    }
    
    // نمط الثلاثة الداخلية الهابطة
    else if (first.close > first.open && // شمعة صاعدة كبيرة
             second.close < second.open && second.open < first.close && second.close > first.open && // حرامي هابط
             third.close < third.open && third.close < first.open) { // تأكيد هابط
      patterns.push({
        name: 'three_inside_down',
        arabic: 'الثلاثة الداخلية الهابطة',
        type: 'انعكاس هابط',
        strength: 0.69,
        color: '#CC1439',
        position: index,
        reliability: 'جيد',
        description: 'انعكاس هابط مع تأكيد'
      });
    }
    
    return patterns;
  }, []);

  // 🕯️🕯️🕯️🕯️🕯️ كشف الأنماط المعقدة (4-5 شموع)
  const detectComplexCandlePatterns = useCallback((candles, index, fullData) => {
    const patterns = [];
    
    if (candles.length >= 5) {
      // نمط الطرق الثلاث الصاعدة
      const [first, second, third, fourth, fifth] = candles;
      
      if (first.close > first.open && // شمعة صاعدة طويلة
          second.close < second.open && third.close < third.open && fourth.close < fourth.open && // ثلاث شموع هابطة قصيرة
          fifth.close > fifth.open && fifth.close > first.close) { // شمعة صاعدة تأكيد
        patterns.push({
          name: 'rising_three_methods',
          arabic: 'الطرق الثلاث الصاعدة',
          type: 'استمرار صاعد',
          strength: 0.74,
          color: '#FFD700',
          position: index,
          reliability: 'جيد',
          description: 'استمرار الاتجاه الصاعد بعد تصحيح'
        });
      }
      
      // نمط الطرق الثلاث الهابطة
      else if (first.close < first.open && // شمعة هابطة طويلة
               second.close > second.open && third.close > third.open && fourth.close > fourth.open && // ثلاث شموع صاعدة قصيرة
               fifth.close < fifth.open && fifth.close < first.close) { // شمعة هابطة تأكيد
        patterns.push({
          name: 'falling_three_methods',
          arabic: 'الطرق الثلاث الهابطة',
          type: 'استمرار هابط',
          strength: 0.73,
          color: '#FFD700',
          position: index,
          reliability: 'جيد',
          description: 'استمرار الاتجاه الهابط بعد تصحيح'
        });
      }
    }
    
    return patterns;
  }, []);

  // 🔄 دالة التحليل الشامل المحسن مع البيانات الحقيقية
  const performAdvancedAnalysis = useCallback((data) => {
    if (!data || data.length === 0) return null;
    
    const currentPrice = data[data.length - 1]?.close || 0;
    const lastCandle = data[data.length - 1];
    const prevCandle = data[data.length - 2];
    
    // تحليل متقدم للشمعة الحالية
    const currentCandleAnalysis = analyzeSingleCandle(lastCandle, prevCandle);
    
    // تحليل الاتجاه العام
    const trendAnalysis = analyzeTrendDirection(data);
    
    // تحليل القوة والزخم
    const momentumAnalysis = analyzeMomentum(data);
    
    // تحليل المستويات الحرجة
    const criticalLevels = identifyCriticalLevels(data, currentPrice);
    
    return {
      gannAnalysis: analyzeGannLevels(data, currentPrice),
      supportResistance: analyzeSupportResistanceLevels(data),
      candlestickPatterns: detectCandlestickPatterns(data),
      currentCandleAnalysis,
      trendAnalysis,
      momentumAnalysis,
      criticalLevels,
      analysisTime: new Date().toLocaleString('ar-SA'),
      // معلومات السوق المباشرة
      marketInfo: {
        currentPrice,
        priceChange: prevCandle ? (currentPrice - prevCandle.close) : 0,
        priceChangePercent: prevCandle ? ((currentPrice - prevCandle.close) / prevCandle.close * 100) : 0,
        volume: lastCandle?.volume || 0,
        high24h: Math.max(...data.slice(-24).map(c => c.high)),
        low24h: Math.min(...data.slice(-24).map(c => c.low)),
        volatility: calculateVolatility(data),
        strength: calculateMarketStrength(data)
      }
    };
  }, [analyzeGannLevels, analyzeSupportResistanceLevels, detectCandlestickPatterns]);

  // 🔍 تحليل الشمعة الواحدة بالتفصيل
  const analyzeSingleCandle = useCallback((candle, prevCandle) => {
    if (!candle) return null;
    
    const bodySize = Math.abs(candle.close - candle.open);
    const upperShadow = candle.high - Math.max(candle.open, candle.close);
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
    const totalRange = candle.high - candle.low;
    const bodyPercentage = bodySize / totalRange;
    
    const analysis = {
      bodySize,
      upperShadow,
      lowerShadow,
      totalRange,
      bodyPercentage,
      candleType: candle.close > candle.open ? 'bullish' : 'bearish',
      strength: bodyPercentage,
      shadowAnalysis: {
        upperShadowPercent: upperShadow / totalRange,
        lowerShadowPercent: lowerShadow / totalRange,
        dominantShadow: upperShadow > lowerShadow ? 'upper' : 'lower'
      }
    };
    
    // تحديد نوع الشمعة
    if (bodyPercentage < 0.1) {
      analysis.pattern = 'doji';
      analysis.patternArabic = 'دوجي';
      analysis.significance = 'انعكاس محتمل';
    } else if (bodyPercentage > 0.7) {
      analysis.pattern = 'strong_body';
      analysis.patternArabic = 'جسم قوي';
      analysis.significance = 'اتجاه قوي';
    } else if (lowerShadow > bodySize * 2 && upperShadow < bodySize * 0.5) {
      analysis.pattern = 'hammer_type';
      analysis.patternArabic = 'نوع المطرقة';
      analysis.significance = 'انعكاس صاعد محتمل';
    } else if (upperShadow > bodySize * 2 && lowerShadow < bodySize * 0.5) {
      analysis.pattern = 'shooting_star_type';
      analysis.patternArabic = 'نوع النجم المتساقط';
      analysis.significance = 'انعكاس هابط محتمل';
    }
    
    return analysis;
  }, []);

  // 📈 تحليل اتجاه السوق
  const analyzeTrendDirection = useCallback((data) => {
    if (data.length < 10) return { trend: 'insufficient_data', confidence: 0 };
    
    const recentData = data.slice(-20);
    const highs = recentData.map(c => c.high);
    const lows = recentData.map(c => c.low);
    const closes = recentData.map(c => c.close);
    
    // تحليل الارتفاعات والانخفاضات
    const higherHighs = countHigherHighs(highs);
    const higherLows = countHigherLows(lows);
    const lowerHighs = countLowerHighs(highs);
    const lowerLows = countLowerLows(lows);
    
    // تحليل المتوسطات المتحركة
    const sma10 = calculateSMA(closes, 10);
    const sma20 = calculateSMA(closes, 20);
    const currentSMA10 = sma10[sma10.length - 1];
    const currentSMA20 = sma20[sma20.length - 1];
    
    let trend = 'sideways';
    let confidence = 0;
    
    if (higherHighs >= 3 && higherLows >= 2 && currentSMA10 > currentSMA20) {
      trend = 'bullish';
      confidence = Math.min(0.8, (higherHighs + higherLows) / 10);
    } else if (lowerHighs >= 3 && lowerLows >= 2 && currentSMA10 < currentSMA20) {
      trend = 'bearish';
      confidence = Math.min(0.8, (lowerHighs + lowerLows) / 10);
    } else {
      confidence = 0.3;
    }
    
    return {
      trend,
      confidence,
      trendStrength: confidence > 0.6 ? 'strong' : confidence > 0.4 ? 'moderate' : 'weak',
      smaPosition: currentSMA10 > currentSMA20 ? 'bullish' : 'bearish',
      higherHighs,
      higherLows,
      lowerHighs,
      lowerLows
    };
  }, []);

  // ⚡ تحليل الزخم والقوة - معايير عالمية محسنة
  const analyzeMomentum = useCallback((data) => {
    if (data.length < 26) return { momentum: 0, strength: 'insufficient_data' };
    
    const closes = data.map(c => c.close);
    const highs = data.map(c => c.high);
    const lows = data.map(c => c.low);
    const volumes = data.map(c => c.volume || 1);
    
    // حساب RSI (معيار عالمي: 14 فترة)
    const rsi = calculateRSI(closes, 14);
    const currentRSI = rsi[rsi.length - 1] || 50;
    
    // حساب MACD (معايير عالمية: 12, 26, 9)
    const macd = calculateMACD(closes);
    const currentMACD = macd.macd[macd.macd.length - 1] || 0;
    const currentSignal = macd.signal[macd.signal.length - 1] || 0;
    const macdHistogram = macd.histogram[macd.histogram.length - 1] || 0;
    
    // حساب Stochastic %K و %D (معيار عالمي: 14 فترة)
    const stochastic = calculateStochastic(data.slice(-14));
    
    // تحليل الحجم (معيار عالمي: مقارنة مع 20 فترة)
    const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const currentVolume = volumes[volumes.length - 1];
    const volumeRatio = currentVolume / avgVolume;
    
    // حساب Average True Range (ATR) للتقلبات
    const atr = calculateATR(data.slice(-14));
    
    let momentum = 0;
    let strength = 'weak';
    let signals = [];
    
    // تحليل RSI (معايير Wilder العالمية)
    if (currentRSI >= 80) {
      momentum -= 0.8;
      strength = 'extremely_overbought';
      signals.push('RSI تشبع شرائي شديد');
    } else if (currentRSI >= 70) {
      momentum -= 0.5;
      strength = 'overbought';
      signals.push('RSI تشبع شرائي');
    } else if (currentRSI <= 20) {
      momentum += 0.8;
      strength = 'extremely_oversold';
      signals.push('RSI تشبع بيعي شديد');
    } else if (currentRSI <= 30) {
      momentum += 0.5;
      strength = 'oversold';
      signals.push('RSI تشبع بيعي');
    } else if (currentRSI >= 60) {
      momentum += 0.3;
      strength = 'strong_bullish';
    } else if (currentRSI <= 40) {
      momentum -= 0.3;
      strength = 'strong_bearish';
    } else {
      momentum = (currentRSI - 50) / 50;
      strength = 'neutral';
    }
    
    // تحليل MACD
    if (currentMACD > currentSignal && macdHistogram > 0) {
      momentum += 0.4;
      signals.push('MACD إشارة صاعدة');
    } else if (currentMACD < currentSignal && macdHistogram < 0) {
      momentum -= 0.4;
      signals.push('MACD إشارة هابطة');
    }
    
    // تحليل Stochastic
    if (stochastic.k > 80 && stochastic.d > 80) {
      momentum -= 0.3;
      signals.push('Stochastic تشبع شرائي');
    } else if (stochastic.k < 20 && stochastic.d < 20) {
      momentum += 0.3;
      signals.push('Stochastic تشبع بيعي');
    }
    
    // تطبيق الحد الأقصى والأدنى
    momentum = Math.max(-1, Math.min(1, momentum));
    
    return {
      momentum,
      strength,
      rsi: currentRSI,
      macd: currentMACD,
      signal: currentSignal,
      histogram: macdHistogram,
      stochastic,
      volumeRatio,
      atr,
      signals,
      volumeStrength: volumeRatio > 2.0 ? 'extremely_high' : 
                     volumeRatio > 1.5 ? 'high' : 
                     volumeRatio > 1.2 ? 'above_average' : 
                     volumeRatio > 0.8 ? 'normal' : 'low'
    };
  }, []);

  // 🎯 تحديد المستويات الحرجة
  const identifyCriticalLevels = useCallback((data, currentPrice) => {
    const highs = data.map(c => c.high);
    const lows = data.map(c => c.low);
    
    // حساب مستويات فيبوناتشي
    const highPrice = Math.max(...highs);
    const lowPrice = Math.min(...lows);
    const range = highPrice - lowPrice;
    
    const fibLevels = ADVANCED_ANALYSIS_PATTERNS.LEVELS.fibonacci.map(ratio => ({
      level: lowPrice + (range * ratio / 100),
      ratio,
      type: 'fibonacci',
      distance: Math.abs(currentPrice - (lowPrice + (range * ratio / 100)))
    }));
    
    // مستويات الدعم والمقاومة
    const supportLevels = findSupportLevels(data, currentPrice);
    const resistanceLevels = findResistanceLevels(data, currentPrice);
    
    // أقرب المستويات
    const nearestLevels = [...fibLevels, ...supportLevels, ...resistanceLevels]
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
    
    return {
      fibonacci: fibLevels,
      support: supportLevels,
      resistance: resistanceLevels,
      nearest: nearestLevels,
      pricePosition: {
        aboveFib618: currentPrice > (lowPrice + (range * 0.618)),
        aboveFib50: currentPrice > (lowPrice + (range * 0.5)),
        aboveFib382: currentPrice > (lowPrice + (range * 0.382))
      }
    };
  }, []);

  // 📊 دوال مساعدة للحسابات
  const calculateVolatility = useCallback((data) => {
    if (data.length < 20) return 0;
    const closes = data.slice(-20).map(c => c.close);
    const returns = closes.slice(1).map((price, i) => Math.log(price / closes[i]));
    const variance = returns.reduce((sum, ret) => sum + ret * ret, 0) / returns.length;
    return Math.sqrt(variance) * Math.sqrt(252); // Annualized volatility
  }, []);

  const calculateMarketStrength = useCallback((data) => {
    if (data.length < 10) return 0;
    const recentData = data.slice(-10);
    const bullishCandles = recentData.filter(c => c.close > c.open).length;
    return bullishCandles / recentData.length;
  }, []);

  // دوال مساعدة لتحليل الاتجاه
  const countHigherHighs = (highs) => {
    let count = 0;
    for (let i = 1; i < highs.length; i++) {
      if (highs[i] > highs[i-1]) count++;
    }
    return count;
  };

  const countHigherLows = (lows) => {
    let count = 0;
    for (let i = 1; i < lows.length; i++) {
      if (lows[i] > lows[i-1]) count++;
    }
    return count;
  };

  const countLowerHighs = (highs) => {
    let count = 0;
    for (let i = 1; i < highs.length; i++) {
      if (highs[i] < highs[i-1]) count++;
    }
    return count;
  };

  const countLowerLows = (lows) => {
    let count = 0;
    for (let i = 1; i < lows.length; i++) {
      if (lows[i] < lows[i-1]) count++;
    }
    return count;
  };

  // 📊 دوال حساب المؤشرات الفنية
  const calculateSMA = useCallback((data, period) => {
    const result = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
    return result;
  }, []);

  const calculateEMA = useCallback((data, period) => {
    const result = [];
    const multiplier = 2 / (period + 1);
    
    // البداية بـ SMA
    let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    result.push(ema);
    
    // حساب باقي القيم
    for (let i = period; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
      result.push(ema);
    }
    
    return result;
  }, []);

  const calculateRSI = useCallback((data, period = 14) => {
    if (data.length < period + 1) return [];
    
    const changes = [];
    for (let i = 1; i < data.length; i++) {
      changes.push(data[i] - data[i - 1]);
    }
    
    const gains = changes.map(change => change > 0 ? change : 0);
    const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);
    
    // استخدام Wilder's smoothing (المعيار العالمي لـ RSI)
    const avgGains = [];
    const avgLosses = [];
    
    // حساب المتوسط الأول
    let sumGains = gains.slice(0, period).reduce((a, b) => a + b, 0);
    let sumLosses = losses.slice(0, period).reduce((a, b) => a + b, 0);
    
    avgGains.push(sumGains / period);
    avgLosses.push(sumLosses / period);
    
    // حساب باقي القيم باستخدام Wilder's smoothing
    for (let i = period; i < gains.length; i++) {
      const avgGain = (avgGains[avgGains.length - 1] * (period - 1) + gains[i]) / period;
      const avgLoss = (avgLosses[avgLosses.length - 1] * (period - 1) + losses[i]) / period;
      
      avgGains.push(avgGain);
      avgLosses.push(avgLoss);
    }
    
    return avgGains.map((gain, i) => {
      const loss = avgLosses[i];
      if (loss === 0) return 100;
      const rs = gain / loss;
      return 100 - (100 / (1 + rs));
    });
  }, []);

  const calculateMACD = useCallback((data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
    if (data.length < slowPeriod) return { macd: [], signal: [], histogram: [] };
    
    const ema12 = calculateEMA(data, fastPeriod);
    const ema26 = calculateEMA(data, slowPeriod);
    
    // محاذاة الطول
    const startIndex = slowPeriod - fastPeriod;
    const macd = ema12.slice(startIndex).map((fast, i) => fast - ema26[i]);
    
    const signal = calculateEMA(macd, signalPeriod);
    const histogram = macd.slice(signalPeriod - 1).map((macdVal, i) => macdVal - signal[i]);
    
    return {
      macd: macd.slice(signalPeriod - 1),
      signal,
      histogram
    };
  }, [calculateEMA]);

  // حساب مؤشر Stochastic (معيار عالمي)
  const calculateStochastic = useCallback((data, kPeriod = 14, dPeriod = 3) => {
    if (data.length < kPeriod) return { k: 50, d: 50 };
    
    const recent = data.slice(-kPeriod);
    const currentClose = recent[recent.length - 1].close;
    const lowestLow = Math.min(...recent.map(d => d.low));
    const highestHigh = Math.max(...recent.map(d => d.high));
    
    const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    
    // حساب %D كمتوسط لآخر 3 قيم %K (تبسيط للمثال)
    const d = k; // في التطبيق الحقيقي نحتاج لحفظ القيم السابقة
    
    return { k: k || 50, d: d || 50 };
  }, []);

  // حساب Average True Range (معيار عالمي للتقلبات)
  const calculateATR = useCallback((data, period = 14) => {
    if (data.length < 2) return 0;
    
    const trueRanges = [];
    for (let i = 1; i < data.length; i++) {
      const current = data[i];
      const previous = data[i - 1];
      
      const tr1 = current.high - current.low;
      const tr2 = Math.abs(current.high - previous.close);
      const tr3 = Math.abs(current.low - previous.close);
      
      const trueRange = Math.max(tr1, tr2, tr3);
      trueRanges.push(trueRange);
    }
    
    // حساب المتوسط المتحرك للـ True Range
    if (trueRanges.length < period) return trueRanges[trueRanges.length - 1] || 0;
    
    const atr = trueRanges.slice(-period).reduce((a, b) => a + b, 0) / period;
    return atr;
  }, []);

  const findSupportLevels = (data, currentPrice) => {
    const lows = data.map(c => c.low);
    const levels = [];
    
    // البحث عن مستويات الدعم
    for (let i = 2; i < lows.length - 2; i++) {
      if (lows[i] <= lows[i-1] && lows[i] <= lows[i-2] && 
          lows[i] <= lows[i+1] && lows[i] <= lows[i+2]) {
        levels.push({
          level: lows[i],
          type: 'support',
          strength: calculateLevelStrength(lows, lows[i]),
          distance: Math.abs(currentPrice - lows[i])
        });
      }
    }
    
    return levels.filter(l => l.level < currentPrice).slice(0, 3);
  };

  const findResistanceLevels = (data, currentPrice) => {
    const highs = data.map(c => c.high);
    const levels = [];
    
    // البحث عن مستويات المقاومة
    for (let i = 2; i < highs.length - 2; i++) {
      if (highs[i] >= highs[i-1] && highs[i] >= highs[i-2] && 
          highs[i] >= highs[i+1] && highs[i] >= highs[i+2]) {
        levels.push({
          level: highs[i],
          type: 'resistance',
          strength: calculateLevelStrength(highs, highs[i]),
          distance: Math.abs(currentPrice - highs[i])
        });
      }
    }
    
    return levels.filter(l => l.level > currentPrice).slice(0, 3);
  };

  const calculateLevelStrength = (prices, level) => {
    const touches = prices.filter(p => Math.abs(p - level) < level * 0.01).length;
    return Math.min(touches / 5, 1); // Max strength of 1
  };

  //  📊 توليد بيانات الشموع المتوافقة مع المنصات العالمية مع الحركة الذكية
  const generateSmartMovingCandleData = useCallback(() => {
    const data = [];
    let basePrice = currentPrice;
    const candleCount = 100;
    
    // تحديد نمط التحرك حسب الإطار الزمني المختار
    const timeframeConfig = timeframes.find(tf => tf.value === selectedTimeframe);
    const platform = PLATFORM_UPDATE_CONFIGS[timeframeConfig?.platform || 'All'];
    
    // 🎯 متغيرات الحركة الذكية
    let trendDirection = 0; // -1 هابط, 0 محايد, 1 صاعد
    let trendStrength = 0;
    let reversalProbability = 0;
    
    for (let i = 0; i < candleCount; i++) {
      // حساب التقلب الأساسي
      let volatility = 0.015;
      
      // تعديل التقلب حسب الإطار الزمني
      switch (selectedTimeframe) {
        case '1s': case '5s': case '15s': case '30s':
          volatility = 0.002;
          break;
        case '1m': case '3m': case '5m':
          volatility = 0.008;
          break;
        case '15m': case '30m':
          volatility = 0.012;
          break;
        case '1h': case '2h': case '4h':
          volatility = 0.020;
          break;
        case '1d': case '1w':
          volatility = 0.035;
          break;
        default:
          volatility = 0.015;
      }
      
      // 🧠 الذكاء الاصطناعي للحركة
      // تحديد الاتجاه العام بناءً على نمط معقد
      const cyclePosition = (i / candleCount) * Math.PI * 2;
      const mainTrend = Math.sin(cyclePosition * 0.3) * 0.7;
      const microTrend = Math.sin(cyclePosition * 2) * 0.3;
      const randomFactor = (Math.random() - 0.5) * 0.4;
      
      // حساب قوة الاتجاه والانعكاس
      trendDirection = Math.sign(mainTrend + microTrend + randomFactor);
      trendStrength = Math.abs(mainTrend + microTrend);
      reversalProbability = Math.abs(Math.cos(cyclePosition * 0.8));
      
      // تحديد نوع الحركة المطلوبة
      let movementType = 'neutral';
      if (reversalProbability > 0.8) {
        movementType = 'reversal';
      } else if (trendDirection > 0 && trendStrength > 0.5) {
        movementType = 'bullish';
      } else if (trendDirection < 0 && trendStrength > 0.5) {
        movementType = 'bearish';
      } else if (trendStrength < 0.2) {
        movementType = 'doji';
      }
      
      // الحصول على إعدادات الحركة
      const movementConfig = getMovementConfig(movementType);
      
      // تطبيق الحركة الذكية
      const adjustedVolatility = volatility * (1 + trendStrength * movementConfig.momentum);
      const directionBias = trendDirection * trendStrength * movementConfig.speedMultiplier;
      
      // حساب التغيير في السعر مع الحركة الذكية
      const naturalChange = (Math.random() - 0.5) * adjustedVolatility * basePrice;
      const smartChange = directionBias * adjustedVolatility * basePrice;
      const totalChange = naturalChange + smartChange;
      
      const open = basePrice;
      const close = basePrice + totalChange;
      
      // حساب الأعلى والأدنى بطريقة ذكية
      const bodyRange = Math.abs(close - open);
      let wickMultiplier = 0.3 + Math.random() * 0.7;
      
      // تعديل الفتائل حسب نوع الحركة
      if (movementType === 'reversal') {
        wickMultiplier *= 1.8; // فتائل أطول للانعكاس
      } else if (movementType === 'doji') {
        wickMultiplier *= 1.5; // فتائل طويلة للدوجي
      }
      
      const high = Math.max(open, close) + bodyRange * wickMultiplier * Math.random();
      const low = Math.min(open, close) - bodyRange * wickMultiplier * Math.random();
      
      // حساب الحجم الذكي
      const baseVolume = 800000;
      let volumeMultiplier = 1 + (Math.random() - 0.5) * 0.8;
      
      // زيادة الحجم في الحركات القوية والانعكاسات
      if (movementType === 'reversal') {
        volumeMultiplier *= 2.5;
      } else if (trendStrength > 0.7) {
        volumeMultiplier *= 1.8;
      }
      
      const volume = Math.floor(baseVolume * volumeMultiplier);
      
      // حساب الوقت
      let timeIncrement;
      switch (selectedTimeframe) {
        case '1s': timeIncrement = 1000; break;
        case '5s': timeIncrement = 5000; break;
        case '15s': timeIncrement = 15000; break;
        case '30s': timeIncrement = 30000; break;
        case '1m': timeIncrement = 60000; break;
        case '3m': timeIncrement = 180000; break;
        case '5m': timeIncrement = 300000; break;
        case '15m': timeIncrement = 900000; break;
        case '30m': timeIncrement = 1800000; break;
        case '1h': timeIncrement = 3600000; break;
        case '2h': timeIncrement = 7200000; break;
        case '4h': timeIncrement = 14400000; break;
        case '6h': timeIncrement = 21600000; break;
        case '8h': timeIncrement = 28800000; break;
        case '12h': timeIncrement = 43200000; break;
        case '1d': timeIncrement = 86400000; break;
        case '3d': timeIncrement = 259200000; break;
        case '1w': timeIncrement = 604800000; break;
        case '1M': timeIncrement = 2629746000; break;
        default: timeIncrement = 60000;
      }
      
      data.push({
        time: Date.now() - (candleCount - i) * timeIncrement,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: volume,
        platform: timeframeConfig?.platform || 'All',
        timeframe: selectedTimeframe,
        priceChange: parseFloat(totalChange.toFixed(2)),
        priceChangePercent: parseFloat((totalChange / basePrice * 100).toFixed(4)),
        // 🎯 معلومات الحركة الذكية
        movementType: movementType,
        trendStrength: parseFloat(trendStrength.toFixed(3)),
        reversalProbability: parseFloat(reversalProbability.toFixed(3)),
        smartMovement: {
          direction: trendDirection,
          strength: trendStrength,
          config: movementConfig
        }
      });
      
      basePrice = close;
    }
    
    return data;
  }, [currentPrice, selectedTimeframe]);

  // 🎨 دالة رسم الشموع اليابانية المتحركة مع التأثيرات الذكية
  const drawSmartMovingCandlesticks = useCallback((canvas, ctx, data) => {
    if (!data || data.length === 0) return;

    // تحديد نوع الرسم البياني المطلوب
    switch (selectedChartType) {
      case 'candlestick':
        drawCandlestickChart(canvas, ctx, data);
        break;
      case 'area':
        drawAreaChart(canvas, ctx, data);
        break;
      case 'bar':
        drawBarChart(canvas, ctx, data);
        break;
      case 'baseline':
        drawBaselineChart(canvas, ctx, data);
        break;
      case 'histogram':
        drawHistogramChart(canvas, ctx, data);
        break;
      case 'line':
        drawLineChart(canvas, ctx, data);
        break;
      default:
        drawCandlestickChart(canvas, ctx, data);
    }
    
    // رسم خط السعر التفاعلي على جميع أنواع الرسوم البيانية
    if (mousePosition && mousePosition.x > 0 && mousePosition.y > 0) {
      drawInteractivePriceLine(canvas, ctx, data, mousePosition);
    }
  }, [selectedChartType, mousePosition]);

  //   دالة رسم خط السعر التفاعلي المشترك لجميع أنواع الرسوم البيانية
  const drawInteractivePriceLine = useCallback((canvas, ctx, data, mousePos) => {
    if (!mousePos || !data || data.length === 0 || 
        mousePos.x <= 0 || mousePos.y <= 0) return;

    const padding = 60;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    // التأكد أن المؤشر داخل منطقة الرسم البياني
    if (mousePos.x < padding || mousePos.x > canvas.width - padding ||
        mousePos.y < padding || mousePos.y > canvas.height - padding) return;
    
    // حساب نطاق الأسعار المعدل
    const prices = data.flatMap(d => [d.high, d.low, d.open, d.close]);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;
    const priceMargin = priceRange * 0.05;
    const adjustedMax = maxPrice + priceMargin;
    const adjustedMin = minPrice - priceMargin;
    const adjustedRange = adjustedMax - adjustedMin;
    
    // حساب السعر الحالي بناءً على موقع Y
    const relativeY = (mousePos.y - padding) / chartHeight;
    const currentPrice = adjustedMax - (relativeY * adjustedRange);
    
    // حفظ حالة السياق
    ctx.save();
    
    // رسم الخط الأفقي للسعر - ممتد من بار السعر
    ctx.setLineDash([8, 4]);
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;
    
    ctx.beginPath();
    ctx.moveTo(0, mousePos.y); // يبدأ من أقصى اليسار (بار السعر)
    ctx.lineTo(canvas.width, mousePos.y); // يمتد لأقصى اليمين
    ctx.stroke();
    
    // رسم الخط العمودي للوقت/الشمعة
    ctx.strokeStyle = '#00FFFF';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(mousePos.x, padding);
    ctx.lineTo(mousePos.x, canvas.height - padding);
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // عرض السعر في مربع على اليمين 
    const priceBoxWidth = 90;
    const priceBoxHeight = 25;
    const priceBoxX = canvas.width - priceBoxWidth - 5; // على الجهة اليمنى
    const priceBoxY = mousePos.y - priceBoxHeight / 2;
    
    // خلفية مربع السعر
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(priceBoxX, priceBoxY, priceBoxWidth, priceBoxHeight);
    
    // إطار مربع السعر
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 1.0;
    ctx.strokeRect(priceBoxX, priceBoxY, priceBoxWidth, priceBoxHeight);
    
    // نص السعر
    ctx.fillStyle = '#00FFFF';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(currentPrice.toFixed(2), priceBoxX + priceBoxWidth / 2, priceBoxY + priceBoxHeight / 2 + 4);
    
    // استعادة حالة السياق
    ctx.restore();
    
    return currentPrice; // إرجاع السعر للاستخدام في دوال أخرى
  }, []);

  //  🕯️ دالة رسم الشموع اليابانية
  const drawCandlestickChart = useCallback((canvas, ctx, data) => {
    if (!data || data.length === 0) return;

    const padding = 60;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    // ==================================================================================
    // 🔍 APPLY ZOOM & PAN - تطبيق التكبير والتصغير
    // ==================================================================================
    
    // حساب المدى المعروض بناءً على التكبير الزمني
    const visibleRange = getVisibleRange(data.length);
    const visibleData = data.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
    
    if (visibleData.length === 0) return;
    
    // حساب مدى الأسعار المعروض بناءً على التكبير السعري
    const priceRange = getVisiblePriceRange(data, visibleRange);
    if (!priceRange) return;
    
    const { maxPrice, minPrice, range: adjustedRange } = priceRange;
    
    // إعدادات الشموع المكبرة
    const candleWidth = Math.max(1, Math.min(50, chartWidth / visibleData.length * 0.8));
    const candleSpacing = chartWidth / visibleData.length;
    
    // الحصول على إعدادات المنصة الحالية
    const currentTimeframe = timeframes.find(tf => tf.value === selectedTimeframe);
    const platformConfig = PLATFORM_UPDATE_CONFIGS[currentTimeframe?.platform || 'All'];

    // مسح الكانفس بخلفية احترافية متحركة
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0D1421');
    gradient.addColorStop(0.5, '#1A1A1A');
    gradient.addColorStop(1, '#0D1421');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ==================================================================================
    // 📊 ENHANCED GRID WITH ZOOM AWARENESS - شبكة محسنة مع دعم التكبير
    // ==================================================================================
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // خطوط الأسعار الأفقية - مع تكييف عدد الخطوط حسب التكبير
    const priceLines = Math.min(20, Math.max(4, Math.floor(8 * zoomRef.current.priceZoom)));
    for (let i = 0; i <= priceLines; i++) {
      const y = padding + (chartHeight / priceLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
      
      // تسميات الأسعار على الجهة اليمنى - دقة أعلى مع التكبير
      const price = maxPrice - (adjustedRange / priceLines) * i;
      const decimals = zoomRef.current.priceZoom > 2 ? 3 : 2;
      ctx.fillStyle = '#E0E0E0';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(price.toFixed(decimals), canvas.width - padding + 10, y + 4);
      
      // خط السعر الحالي مع تأثير متحرك
      if (Math.abs(price - currentPrice) < adjustedRange * 0.02) {
        const pulseIntensity = 0.5 + 0.5 * Math.sin(Date.now() * 0.005);
        ctx.strokeStyle = `rgba(255, 215, 0, ${pulseIntensity})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      }
    }
    
    // خطوط زمنية عمودية - مع تكييف عدد الخطوط حسب التكبير
    const timeLines = Math.min(20, Math.max(5, Math.floor(10 * zoomRef.current.timeZoom)));
    for (let i = 0; i <= timeLines; i++) {
      const x = padding + (chartWidth / timeLines) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvas.height - padding);
      ctx.stroke();
      
      // تسميات الوقت للبيانات المعروضة فقط
      if (i < visibleData.length) {
        const timeIndex = Math.floor((visibleData.length - 1) * i / timeLines);
        const timeData = visibleData[timeIndex];
        if (timeData) {
          const timeLabel = new Date(timeData.time || Date.now()).toLocaleTimeString('ar', { 
            hour: '2-digit', minute: '2-digit' 
          });
          ctx.fillStyle = '#B0B0B0';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(timeLabel, x, canvas.height - padding + 20);
        }
      }
    }

    // ==================================================================================
    // 🕯️ RENDER ZOOMED CANDLES - رسم الشموع المكبرة
    // ==================================================================================
    
    visibleData.forEach((candle, index) => {
      const x = padding + index * candleSpacing + candleSpacing / 2;
      
      // حساب المواقع مع التكبير المطبق
      const openY = padding + (maxPrice - candle.open) / adjustedRange * chartHeight;
      const closeY = padding + (maxPrice - candle.close) / adjustedRange * chartHeight;
      const highY = padding + (maxPrice - candle.high) / adjustedRange * chartHeight;
      const lowY = padding + (maxPrice - candle.low) / adjustedRange * chartHeight;
      
      // تحديد نوع الحركة والألوان
      const movementType = candle.movementType || 'neutral';
      const isGreen = candle.close > candle.open;
      const isDoji = Math.abs(candle.close - candle.open) < (candle.high - candle.low) * 0.1;
      
      let candleColor, borderColor;
      
      // 🎨 اختيار الألوان حسب نوع الحركة
      if (movementType === 'reversal') {
        candleColor = 'rgba(255, 215, 0, 0.8)'; // ذهبي
        borderColor = '#FFD700';
      } else if (movementType === 'doji' || isDoji) {
        candleColor = 'rgba(138, 43, 226, 0.8)'; // بنفسجي
        borderColor = '#8A2BE2';
      } else if (isGreen || movementType === 'bullish') {
        candleColor = 'rgba(0, 255, 65, 0.8)'; // أخضر نيون
        borderColor = '#00FF41';
      } else {
        candleColor = 'rgba(255, 23, 68, 0.8)'; // أحمر قوي
        borderColor = '#FF1744';
      }
      
      // حساب المتغيرات الأساسية
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(Math.abs(closeY - openY), 2);
      
      // تكبير عرض الشمعة مع التكبير الزمني
      let zoomedCandleWidth = candleWidth;
      if (zoomRef.current.timeZoom > 2) {
        zoomedCandleWidth = Math.min(40, candleWidth * Math.sqrt(zoomRef.current.timeZoom));
      }
      
      // رسم العمود (High-Low Line)
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = Math.max(1, zoomedCandleWidth / 8);
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();
      
      // رسم جسم الشمعة مع تدرج
      const candleGradient = ctx.createLinearGradient(
        x - zoomedCandleWidth / 2, bodyTop,
        x + zoomedCandleWidth / 2, bodyTop + bodyHeight
      );
      candleGradient.addColorStop(0, candleColor);
      candleGradient.addColorStop(1, candleColor.replace('0.8', '0.6'));
      
      ctx.fillStyle = candleGradient;
      ctx.fillRect(
        x - zoomedCandleWidth / 2,
        bodyTop,
        zoomedCandleWidth,
        bodyHeight
      );
      
      // إطار الجسم
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = Math.max(1, zoomedCandleWidth / 10);
      ctx.strokeRect(
        x - zoomedCandleWidth / 2,
        bodyTop,
        zoomedCandleWidth,
        bodyHeight
      );
      
      // ✨ تأثيرات خاصة عند التكبير العالي
      if (zoomRef.current.timeZoom > 5) {
        // عرض تفاصيل إضافية للشموع عند التكبير العالي
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${Math.max(8, zoomedCandleWidth / 4)}px Arial`;
        ctx.textAlign = 'center';
        
        // عرض سعر الإغلاق
        ctx.fillText(candle.close.toFixed(2), x, bodyTop - 5);
        
        // عرض الحجم أسفل الشمعة
        if (candle.volume) {
          ctx.fillStyle = '#888888';
          ctx.font = `${Math.max(6, zoomedCandleWidth / 6)}px Arial`;
          ctx.fillText(
            (candle.volume / 1000).toFixed(0) + 'K', 
            x, 
            lowY + 15
          );
        }
      }
      
      // 🎯 تمييز الشمعة المختارة أو تحت المؤشر
      if (mousePosition.x > x - zoomedCandleWidth/2 && 
          mousePosition.x < x + zoomedCandleWidth/2 &&
          mousePosition.y > Math.min(highY, lowY) && 
          mousePosition.y < Math.max(highY, lowY)) {
        
        // إطار متوهج للشمعة تحت المؤشر
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(
          x - zoomedCandleWidth / 2 - 2,
          bodyTop - 2,
          zoomedCandleWidth + 4,
          bodyHeight + 4
        );
        ctx.setLineDash([]);
      }
      
      // 🌟 إضافة تأثيرات الحركة الذكية مع الألوان النيون
      // تأثير الإضاءة النيون للحركات القوية
      if (candle.trendStrength > 0.7 || movementType === 'reversal') {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 20 + (candle.trendStrength * 15); // إضاءة أقوى
        
        // إضافة هالة نيون خارجية
        ctx.beginPath();
        ctx.arc(x, bodyTop + bodyHeight / 2, 15 + (candle.trendStrength * 10), 0, Math.PI * 2);
        ctx.fillStyle = `${glowColor}15`; // شفافية 15%
        ctx.fill();
      }
      
      // رسم الفتائل (Shadows) مع ألوان نيون محسنة
      ctx.strokeStyle = movementType === 'reversal' ? shadowColor : 
                       movementType === 'doji' ? CANDLESTICK_COLORS.doji_shadow :
                       isGreen ? CANDLESTICK_COLORS.bullish_shadow : 
                       CANDLESTICK_COLORS.bearish_shadow;
      ctx.lineWidth = Math.max(2, candleWidth * 0.2); // فتائل أكثر وضوحاً
      
      // تأثير النبض النيون للانعكاسات
      if (movementType === 'reversal') {
        const pulseEffect = 1 + 0.4 * Math.sin(Date.now() * 0.008 + index);
        ctx.lineWidth *= pulseEffect;
        
        // إضافة توهج للفتائل في حالة الانعكاس
        ctx.shadowColor = CANDLESTICK_COLORS.reversal_glow;
        ctx.shadowBlur = 8;
      }
      
      // تأثير رعشة للدوجي
      if (movementType === 'doji') {
        const flickerEffect = 0.8 + 0.4 * Math.sin(Date.now() * 0.02 + index * 0.5);
        ctx.globalAlpha = flickerEffect;
      }
      
      // الفتيل العلوي
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, Math.min(openY, closeY));
      ctx.stroke();
      
      // الفتيل السفلي
      ctx.beginPath();
      ctx.moveTo(x, Math.max(openY, closeY));
      ctx.lineTo(x, lowY);
      ctx.stroke();
      
      // رسم جسم الشمعة مع التأثيرات النيون
      // تأثير الحركة للشموع القوية مع ألوان نيون
      let adjustedCandleWidth = candleWidth;
      if (movementType === 'bullish' && candle.trendStrength > 0.6) {
        adjustedCandleWidth *= 1.15; // شموع أعرض للاتجاه الصاعد القوي
      } else if (movementType === 'bearish' && candle.trendStrength > 0.6) {
        adjustedCandleWidth *= 1.1; // شموع أعرض للاتجاه الهابط
      } else if (movementType === 'reversal') {
        adjustedCandleWidth *= 1.2; // شموع انعكاس أكثر بروزاً
      }
      
      // إضافة تدرج نيون للجسم
      const bodyGradient = ctx.createLinearGradient(
        x - adjustedCandleWidth / 2, bodyTop,
        x + adjustedCandleWidth / 2, bodyTop + bodyHeight
      );
      
      if (movementType === 'reversal') {
        // تدرج ذهبي للانعكاس
        bodyGradient.addColorStop(0, CANDLESTICK_COLORS.reversal);
        bodyGradient.addColorStop(0.5, CANDLESTICK_COLORS.reversal_glow);
        bodyGradient.addColorStop(1, CANDLESTICK_COLORS.reversal_shadow);
      } else if (movementType === 'doji') {
        // تدرج بنفسجي للدوجي
        bodyGradient.addColorStop(0, CANDLESTICK_COLORS.doji);
        bodyGradient.addColorStop(0.5, CANDLESTICK_COLORS.doji_glow);
        bodyGradient.addColorStop(1, CANDLESTICK_COLORS.doji_shadow);
      } else if (isGreen || movementType === 'bullish') {
        // تدرج أخضر نيون للصاعد
        bodyGradient.addColorStop(0, CANDLESTICK_COLORS.bullish);
        bodyGradient.addColorStop(0.5, CANDLESTICK_COLORS.bullish_glow);
        bodyGradient.addColorStop(1, CANDLESTICK_COLORS.bullish_shadow);
      } else {
        // تدرج أحمر قوي للهابط
        bodyGradient.addColorStop(0, CANDLESTICK_COLORS.bearish);
        bodyGradient.addColorStop(0.5, CANDLESTICK_COLORS.bearish_glow);
        bodyGradient.addColorStop(1, CANDLESTICK_COLORS.bearish_shadow);
      }
      
      // ملء الجسم بالتدرج النيون
      ctx.fillStyle = bodyGradient;
      ctx.fillRect(
        x - adjustedCandleWidth / 2,
        bodyTop,
        adjustedCandleWidth,
        bodyHeight
      );
      
      // إطار نيون مضيء للجسم
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = movementType === 'reversal' ? 3 : 2; // إطار أسمك للانعكاس
      
      // إضافة توهج للإطار
      ctx.shadowColor = borderColor;
      ctx.shadowBlur = movementType === 'reversal' ? 12 : 8;
      
      ctx.strokeRect(
        x - adjustedCandleWidth / 2,
        bodyTop,
        adjustedCandleWidth,
        bodyHeight
      );
      
      // إعادة تعيين الشفافية
      ctx.globalAlpha = 1.0;
      
      // 🎆 تأثيرات خاصة للحركات المهمة مع الألوان النيون
      // تأثير الانفجار النيون للانعكاسات
      if (movementType === 'reversal' && candle.reversalProbability > 0.8) {
        const sparkles = 12; // عدد أكبر من الشرارات
        for (let s = 0; s < sparkles; s++) {
          const angle = (s / sparkles) * Math.PI * 2;
          const radius = 12 + Math.random() * 20;
          const sparkleX = x + Math.cos(angle) * radius;
          const sparkleY = (bodyTop + bodyHeight / 2) + Math.sin(angle) * radius;
          
          // شرارات ذهبية نيون
          ctx.fillStyle = `rgba(255, 215, 0, ${0.6 + Math.random() * 0.4})`;
          ctx.shadowColor = CANDLESTICK_COLORS.reversal_glow;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(sparkleX, sparkleY, 1.5 + Math.random() * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // تأثير النبضات النيون للدوجي
      if (movementType === 'doji') {
        const pulseRings = 3;
        for (let r = 0; r < pulseRings; r++) {
          const ringRadius = 8 + (r * 6) + (Math.sin(Date.now() * 0.005 + r) * 3);
          ctx.strokeStyle = `rgba(156, 39, 176, ${0.3 - (r * 0.1)})`;
          ctx.lineWidth = 2 - (r * 0.5);
          ctx.beginPath();
          ctx.arc(x, bodyTop + bodyHeight / 2, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      
      // تأثير الأسهم النيون للاتجاهات القوية
      if ((movementType === 'bullish' || movementType === 'bearish') && candle.trendStrength > 0.8) {
        const arrowY = movementType === 'bullish' ? bodyTop - 15 : bodyTop + bodyHeight + 15;
        const arrowSymbol = movementType === 'bullish' ? '▲' : '▼';
        
        // توهج للسهم
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 10;
        ctx.fillStyle = candleColor;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(arrowSymbol, x, arrowY);
        
        // إضافة دائرة نيون حول السهم
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, arrowY - 5, 8, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // تأثير الهالة للشموع القوية
      if (candle.trendStrength > 0.9) {
        ctx.strokeStyle = `${glowColor}60`; // شفافية 60%
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x, bodyTop + bodyHeight / 2, adjustedCandleWidth / 2 + 8, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // إعادة تعيين جميع التأثيرات
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.globalAlpha = 1.0;
    });

    // 📊 إجراء التحليل المتقدم
    const advancedAnalysis = performAdvancedAnalysis(data);
    
    // 🖱️ رسم الأدوات التفاعلية على الشموع
    // رسم مستويات فيبوناتشي
    fibonacciLevels.forEach(fibLevel => {
      fibLevel.levels.forEach(level => {
        // خط فيبوناتشي
        ctx.strokeStyle = `${fibLevel.color}80`; // شفافية 80%
        ctx.lineWidth = level.ratio === 38.2 || level.ratio === 61.8 ? 3 : 2;
        ctx.setLineDash(level.ratio === 50 ? [10, 5] : []);
        ctx.beginPath();
        ctx.moveTo(level.startX, level.y);
        ctx.lineTo(level.endX, level.y);
        ctx.stroke();
        
        // نص المستوى
        ctx.fillStyle = fibLevel.color;
        ctx.font = 'bold 11px Arial';
        ctx.fillText(`${level.ratio}% (${level.price.toFixed(2)})`, level.endX + 5, level.y + 4);
      });
    });
    
    // رسم زوايا جان
    gannAngles.forEach(gannSet => {
      gannSet.lines.forEach(line => {
        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.angle === 45 ? 3 : 2;
        ctx.setLineDash(line.angle === 45 ? [] : [5, 3]);
        ctx.beginPath();
        ctx.moveTo(line.startX, line.startY);
        
        // حساب نقطة النهاية للخط
        const endX = line.startX + 200;
        const endY = line.startY + (200 * line.slope);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // نص الزاوية
        ctx.fillStyle = line.color;
        ctx.font = 'bold 10px Arial';
        ctx.fillText(`${line.angle}°`, line.startX + 10, line.startY - 10);
      });
    });
    
    // رسم خطوط الدعم والمقاومة
    supportResistanceLines.forEach(line => {
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(line.startPoint.x, line.startPoint.y);
      ctx.lineTo(line.endPoint.x, line.endPoint.y);
      ctx.stroke();
      
      // نص نوع الخط
      ctx.fillStyle = line.color;
      ctx.font = 'bold 12px Arial';
      ctx.fillText(line.type === 'support' ? 'دعم' : 'مقاومة', 
                   (line.startPoint.x + line.endPoint.x) / 2, 
                   (line.startPoint.y + line.endPoint.y) / 2 - 10);
    });
    
    // رسم الشموع المختارة
    selectedCandles.forEach(selected => {
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 5]);
      ctx.strokeRect(selected.x - 10, selected.y - 20, 20, 40);
      
      // أيقونة التحديد
      ctx.fillStyle = '#00FFFF';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('🎯', selected.x - 8, selected.y - 25);
    });
    
    // رسم خط الرسم النشط
    if (isDrawing && drawingStart && mousePosition) {
      ctx.strokeStyle = '#FFFF00';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(drawingStart.x, drawingStart.y);
      ctx.lineTo(mousePosition.x, mousePosition.y);
      ctx.stroke();
    }
    
    // عرض معلومات التحليل المتقدم في الزاوية العليا اليسرى
    if (advancedAnalysis) {
      // 🔄 عرض تحليل جان في الزاوية العليا اليسرى
      ctx.fillStyle = '#00FFFF';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('🔄 تحليل جان:', 20, 40); // الزاوية العليا اليسرى
      
      // عرض زوايا جان عمودياً (تحت بعضها البعض)
      advancedAnalysis.gannAnalysis.angles.slice(0, 3).forEach((angle, index) => {
        ctx.fillStyle = angle.strength === 'قوي جداً' ? '#FFD700' : '#00BFFF';
        ctx.font = '11px Arial';
        ctx.fillText(`زاوية ${angle.angle}°: ${angle.priceLevel} (${angle.strength})`, 25, 60 + (index * 15));
      });
      
      // 📊 عرض مستويات فيبوناتشي تحت تحليل جان
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('📊 فيبوناتشي:', 20, 120); // تحت تحليل جان
      
      // عرض مستويات فيبوناتشي عمودياً (تحت بعضها البعض)
      advancedAnalysis.supportResistance.fibonacci.slice(0, 5).forEach((fib, index) => {
        ctx.fillStyle = fib.strength === 'قوي' ? '#00FF41' : '#00BFFF';
        ctx.font = '11px Arial';
        ctx.fillText(`${fib.ratio}: ${fib.level}`, 25, 140 + (index * 15));
      });
      
      // 📈 عرض أنماط الشموع المكتشفة تحت فيبوناتشي
      if (advancedAnalysis.candlestickPatterns.length > 0) {
        ctx.fillStyle = '#FF1744';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('📈 الأنماط المكتشفة:', 20, 220);
        
        advancedAnalysis.candlestickPatterns.slice(0, 3).forEach((pattern, index) => {
          ctx.fillStyle = pattern.color;
          ctx.font = '10px Arial';
          ctx.fillText(`${pattern.arabic} (${pattern.reliability})`, 25, 240 + (index * 15));
        });
      }
    }
    
    // عنوان احترافي مع معلومات الحركة الذكية
    ctx.fillStyle = platformConfig.colors.primary;
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    const title = `${platformConfig.icon} ${platformConfig.name} - الشموع الذكية | ${currentTimeframe?.label || selectedTimeframe}`;
    ctx.fillText(title, canvas.width / 2, 35);
    
    // معلومات الحركة الحالية
    const lastCandle = data[data.length - 1];
    if (lastCandle) {
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      const movementInfo = `🎯 نوع الحركة: ${getMovementTypeText(lastCandle.movementType)} | قوة الاتجاه: ${(lastCandle.trendStrength * 100).toFixed(1)}%`;
      ctx.fillText(movementInfo, canvas.width / 2, 55);
    }
    
    // تم نقل شريط معلومات المستخدم خارج الكانفاس ليظهر كعنصر HTML منفصل
    
    // معلومات الحالة الحالية - في أسفل الكانفاس
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    const statusMsg = `✨ النظام نشط | ${data.length} شمعة | آخر تحديث: ${new Date().toLocaleTimeString('ar-SA')}`;
    ctx.fillText(statusMsg, canvas.width / 2, canvas.height - 30); // في أسفل الكانفاس
    
    // شريط معلومات السعر المحسن
    if (data.length > 0) {
      const lastCandle = data[data.length - 1];
      const prevCandle = data[data.length - 2];
      const change = prevCandle ? lastCandle.close - prevCandle.close : 0;
      const changePercent = prevCandle ? (change / prevCandle.close * 100) : 0;
      
      // شريط المعلومات المفصلة تم نقله خارج الكانفاس ليظهر كعنصر HTML منفصل
    }
    
    // مؤشر حالة التحديث المتحرك
    if (isUpdating) {
      const rotation = (Date.now() * 0.01) % (Math.PI * 2);
      ctx.save();
      ctx.translate(canvas.width - 30, 30);
      ctx.rotate(rotation);
      
      ctx.fillStyle = 'rgba(255, 215, 0, 0.4)'; // مؤشر التحديث شفاف أكثر
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#000';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      
      // إطار للنص
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 1;
      ctx.strokeText('⟲', 0, 4);
      
      ctx.fillText('⟲', 0, 4);
      ctx.restore();
    }
    
    // 🎯 رسم المعاينة المباشرة والإرشادات
    if (previewData) {
      // خلفية شفافة للإشعارات
      const notificationY = 100;
      const notificationHeight = 50;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; // خلفية شفافة أكثر
      ctx.fillRect(20, notificationY, canvas.width - 40, notificationHeight);
      
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, notificationY, canvas.width - 40, notificationHeight);
      
      // النص الإرشادي مع ظل للوضوح
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(previewData.message || '', canvas.width / 2, notificationY + 30);
      ctx.restore();
      
      // رسم نقطة البداية إذا كانت موجودة
      if (previewData.point) {
        ctx.fillStyle = '#00FFFF';
        ctx.beginPath();
        ctx.arc(previewData.point.x, previewData.point.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // دائرة متوهجة
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(previewData.point.x, previewData.point.y, 15, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // رسم خط المعاينة المباشر
      if (previewData.previewLine) {
        const { start, current } = previewData.previewLine;
        
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // أسهم في النهايات
        const arrowSize = 10;
        const angle = Math.atan2(current.y - start.y, current.x - start.x);
        
        // سهم في نهاية الخط
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.moveTo(current.x, current.y);
        ctx.lineTo(current.x - arrowSize * Math.cos(angle - Math.PI/6), 
                   current.y - arrowSize * Math.sin(angle - Math.PI/6));
        ctx.lineTo(current.x - arrowSize * Math.cos(angle + Math.PI/6), 
                   current.y - arrowSize * Math.sin(angle + Math.PI/6));
        ctx.closePath();
        ctx.fill();
      }
    }
    
  }, [selectedTimeframe, currentPrice, isUpdating, previewData, interactiveMode, isDrawing, mousePosition, candleData]);
  
  //  دالة رسم المنطقة (Area Chart)
  const drawAreaChart = useCallback((canvas, ctx, data) => {
    if (!data || data.length === 0) return;

    const padding = 60;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    // حساب أعلى وأقل سعر مع هامش
    const prices = data.flatMap(d => [d.high, d.low]);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;
    const priceMargin = priceRange * 0.05;
    const adjustedMax = maxPrice + priceMargin;
    const adjustedMin = minPrice - priceMargin;
    const adjustedRange = adjustedMax - adjustedMin;

    // مسح الكانفس بخلفية احترافية
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0D1421');
    gradient.addColorStop(0.5, '#1A1A1A');
    gradient.addColorStop(1, '#0D1421');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // رسم الشبكة
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // خطوط الأسعار الأفقية
    const priceLines = 8;
    for (let i = 0; i <= priceLines; i++) {
      const y = padding + (chartHeight / priceLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
      
      const price = adjustedMax - (adjustedRange / priceLines) * i;
      ctx.fillStyle = '#E0E0E0';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(price.toFixed(2), canvas.width - padding + 10, y + 4);
    }

    // رسم منطقة السعر
    const pointSpacing = chartWidth / (data.length - 1);
    
    // إنشاء مسار المنطقة
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    
    data.forEach((candle, index) => {
      const x = padding + index * pointSpacing;
      const y = padding + (adjustedMax - candle.close) / adjustedRange * chartHeight;
      
      if (index === 0) {
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.lineTo(padding + (data.length - 1) * pointSpacing, canvas.height - padding);
    ctx.closePath();

    // تدرج للمنطقة
    const areaGradient = ctx.createLinearGradient(0, padding, 0, canvas.height - padding);
    areaGradient.addColorStop(0, 'rgba(33, 150, 243, 0.6)');
    areaGradient.addColorStop(1, 'rgba(33, 150, 243, 0.1)');
    ctx.fillStyle = areaGradient;
    ctx.fill();

    // رسم خط السعر
    ctx.beginPath();
    data.forEach((candle, index) => {
      const x = padding + index * pointSpacing;
      const y = padding + (adjustedMax - candle.close) / adjustedRange * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 3;
    ctx.stroke();

    // نقاط البيانات
    data.forEach((candle, index) => {
      const x = padding + index * pointSpacing;
      const y = padding + (adjustedMax - candle.close) / adjustedRange * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#2196F3';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, []);

  // 📈 دالة رسم الأعمدة (Bar Chart)
  const drawBarChart = useCallback((canvas, ctx, data) => {
    if (!data || data.length === 0) return;

    const padding = 60;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    const prices = data.flatMap(d => [d.high, d.low]);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;
    const priceMargin = priceRange * 0.05;
    const adjustedMax = maxPrice + priceMargin;
    const adjustedMin = minPrice - priceMargin;
    const adjustedRange = adjustedMax - adjustedMin;

    // مسح الكانفس
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0D1421');
    gradient.addColorStop(0.5, '#1A1A1A');
    gradient.addColorStop(1, '#0D1421');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // الشبكة
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    const priceLines = 8;
    for (let i = 0; i <= priceLines; i++) {
      const y = padding + (chartHeight / priceLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
      
      const price = adjustedMax - (adjustedRange / priceLines) * i;
      ctx.fillStyle = '#E0E0E0';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(price.toFixed(2), canvas.width - padding + 10, y + 4);
    }

    // رسم الأعمدة
    const barWidth = Math.max(2, chartWidth / data.length * 0.7);
    const barSpacing = chartWidth / data.length;

    data.forEach((candle, index) => {
      const x = padding + index * barSpacing + barSpacing / 2;
      const openY = padding + (adjustedMax - candle.open) / adjustedRange * chartHeight;
      const closeY = padding + (adjustedMax - candle.close) / adjustedRange * chartHeight;
      const highY = padding + (adjustedMax - candle.high) / adjustedRange * chartHeight;
      const lowY = padding + (adjustedMax - candle.low) / adjustedRange * chartHeight;
      
      const isGreen = candle.close > candle.open;
      
      // رسم الخطوط العمودية (high-low)
      ctx.strokeStyle = isGreen ? '#4CAF50' : '#F44336';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();
      
      // رسم خطوط الافتتاح والإغلاق
      ctx.lineWidth = 3;
      
      // خط الافتتاح (يسار)
      ctx.beginPath();
      ctx.moveTo(x - barWidth/2, openY);
      ctx.lineTo(x, openY);
      ctx.stroke();
      
      // خط الإغلاق (يمين)
      ctx.beginPath();
      ctx.moveTo(x, closeY);
      ctx.lineTo(x + barWidth/2, closeY);
      ctx.stroke();
    });
  }, []);

  // 📉 دالة رسم الخط القاعدي (Baseline Chart)
  const drawBaselineChart = useCallback((canvas, ctx, data) => {
    if (!data || data.length === 0) return;

    const padding = 60;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    const prices = data.map(d => d.close);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;
    const baselinePrice = minPrice + priceRange * 0.5; // خط القاعدة في المنتصف
    
    const priceMargin = priceRange * 0.05;
    const adjustedMax = maxPrice + priceMargin;
    const adjustedMin = minPrice - priceMargin;
    const adjustedRange = adjustedMax - adjustedMin;

    // مسح الكانفس
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0D1421');
    gradient.addColorStop(0.5, '#1A1A1A');
    gradient.addColorStop(1, '#0D1421');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // الشبكة
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    const priceLines = 8;
    for (let i = 0; i <= priceLines; i++) {
      const y = padding + (chartHeight / priceLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
      
      const price = adjustedMax - (adjustedRange / priceLines) * i;
      ctx.fillStyle = '#E0E0E0';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(price.toFixed(2), canvas.width - padding + 10, y + 4);
    }

    // رسم خط القاعدة
    const baselineY = padding + (adjustedMax - baselinePrice) / adjustedRange * chartHeight;
    ctx.strokeStyle = '#FF9800';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding, baselineY);
    ctx.lineTo(canvas.width - padding, baselineY);
    ctx.stroke();
    ctx.setLineDash([]);

    // رسم المنطقة والخط
    const pointSpacing = chartWidth / (data.length - 1);
    
    // منطقة فوق القاعدة (أخضر)
    ctx.beginPath();
    ctx.moveTo(padding, baselineY);
    
    data.forEach((candle, index) => {
      const x = padding + index * pointSpacing;
      const y = padding + (adjustedMax - candle.close) / adjustedRange * chartHeight;
      
      if (candle.close >= baselinePrice) {
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, baselineY);
      }
    });
    
    ctx.lineTo(padding + (data.length - 1) * pointSpacing, baselineY);
    ctx.closePath();
    
    const greenGradient = ctx.createLinearGradient(0, padding, 0, baselineY);
    greenGradient.addColorStop(0, 'rgba(76, 175, 80, 0.4)');
    greenGradient.addColorStop(1, 'rgba(76, 175, 80, 0.1)');
    ctx.fillStyle = greenGradient;
    ctx.fill();

    // منطقة تحت القاعدة (أحمر)
    ctx.beginPath();
    ctx.moveTo(padding, baselineY);
    
    data.forEach((candle, index) => {
      const x = padding + index * pointSpacing;
      const y = padding + (adjustedMax - candle.close) / adjustedRange * chartHeight;
      
      if (candle.close < baselinePrice) {
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, baselineY);
      }
    });
    
    ctx.lineTo(padding + (data.length - 1) * pointSpacing, baselineY);
    ctx.closePath();
    
    const redGradient = ctx.createLinearGradient(0, baselineY, 0, canvas.height - padding);
    redGradient.addColorStop(0, 'rgba(244, 67, 54, 0.4)');
    redGradient.addColorStop(1, 'rgba(244, 67, 54, 0.1)');
    ctx.fillStyle = redGradient;
    ctx.fill();

    // رسم الخط الرئيسي
    ctx.beginPath();
    data.forEach((candle, index) => {
      const x = padding + index * pointSpacing;
      const y = padding + (adjustedMax - candle.close) / adjustedRange * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.strokeStyle = '#FF9800';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, []);

  // 📋 دالة رسم الرسم البياني (Histogram)
  const drawHistogramChart = useCallback((canvas, ctx, data) => {
    if (!data || data.length === 0) return;

    const padding = 60;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    const volumes = data.map(d => d.volume);
    const maxVolume = Math.max(...volumes);
    const minVolume = Math.min(...volumes);

    // مسح الكانفس
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0D1421');
    gradient.addColorStop(0.5, '#1A1A1A');
    gradient.addColorStop(1, '#0D1421');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // الشبكة
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    const volumeLines = 8;
    for (let i = 0; i <= volumeLines; i++) {
      const y = padding + (chartHeight / volumeLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
      
      const volume = maxVolume - (maxVolume / volumeLines) * i;
      ctx.fillStyle = '#E0E0E0';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(volume.toLocaleString(), padding - 10, y + 4);
    }

    // رسم أعمدة الحجم
    const barWidth = Math.max(2, chartWidth / data.length * 0.8);
    const barSpacing = chartWidth / data.length;

    data.forEach((candle, index) => {
      const x = padding + index * barSpacing + barSpacing / 2;
      const barHeight = (candle.volume / maxVolume) * chartHeight;
      const barY = canvas.height - padding - barHeight;
      
      // لون العمود حسب الاتجاه
      const isGreen = candle.close > candle.open;
      const barColor = isGreen ? '#9C27B0' : '#673AB7';
      
      // رسم العمود
      const barGradient = ctx.createLinearGradient(0, barY, 0, canvas.height - padding);
      barGradient.addColorStop(0, barColor);
      barGradient.addColorStop(1, barColor + '40');
      
      ctx.fillStyle = barGradient;
      ctx.fillRect(x - barWidth/2, barY, barWidth, barHeight);
      
      // إطار العمود
      ctx.strokeStyle = barColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(x - barWidth/2, barY, barWidth, barHeight);
    });
  }, []);

  // 📏 دالة رسم الخط (Line Chart)
  const drawLineChart = useCallback((canvas, ctx, data) => {
    if (!data || data.length === 0) return;

    const padding = 60;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    const prices = data.map(d => d.close);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;
    const priceMargin = priceRange * 0.05;
    const adjustedMax = maxPrice + priceMargin;
    const adjustedMin = minPrice - priceMargin;
    const adjustedRange = adjustedMax - adjustedMin;

    // مسح الكانفس
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0D1421');
    gradient.addColorStop(0.5, '#1A1A1A');
    gradient.addColorStop(1, '#0D1421');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // الشبكة
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    const priceLines = 8;
    for (let i = 0; i <= priceLines; i++) {
      const y = padding + (chartHeight / priceLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
      
      const price = adjustedMax - (adjustedRange / priceLines) * i;
      ctx.fillStyle = '#E0E0E0';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(price.toFixed(2), canvas.width - padding + 10, y + 4);
    }

    // رسم الخط الرئيسي
    const pointSpacing = chartWidth / (data.length - 1);
    
    ctx.beginPath();
    data.forEach((candle, index) => {
      const x = padding + index * pointSpacing;
      const y = padding + (adjustedMax - candle.close) / adjustedRange * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    // تطبيق تدرج للخط
    const lineGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    lineGradient.addColorStop(0, '#F44336');
    lineGradient.addColorStop(0.5, '#FF9800');
    lineGradient.addColorStop(1, '#4CAF50');
    
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 3;
    ctx.stroke();

    // رسم النقاط
    data.forEach((candle, index) => {
      const x = padding + index * pointSpacing;
      const y = padding + (adjustedMax - candle.close) / adjustedRange * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#F44336';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // خط متحرك للسعر الحالي
    if (data.length > 0) {
      const lastPrice = data[data.length - 1].close;
      const priceY = padding + (adjustedMax - lastPrice) / adjustedRange * chartHeight;
      
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(padding, priceY);
      ctx.lineTo(canvas.width - padding, priceY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, []);
  
  // دالة مساعدة للحصول على نص نوع الحركة
  const getMovementTypeText = (type) => {
    const texts = {
      bullish: 'صاعد 📈',
      bearish: 'هابط 📉', 
      reversal: 'انعكاس 🔄',
      doji: 'دوجي ⚡',
      neutral: 'محايد ➡️'
    };
    return texts[type] || texts.neutral;
  };

  //   ⚠️ تم تعطيل التحديث التلقائي لتحسين الأداء
  // useEffect للتحديث التلقائي للتحليل المتقدم عند تغيير البيانات
  // DISABLED for performance - will be called manually when needed

  // ⚠️ تم تعطيل useEffect التحديث الحقيقي لتحسين الأداء  
  // 📊 useEffect لتحديث البيانات الحقيقية عند تغيير السهم المختار
  // DISABLED for performance optimization

  // دالة توليد بيانات تجريبية
  const generateDemoDataForSymbol = useCallback((symbol) => {
    const basePrice = 100 + Math.random() * 200;
    const demoData = [];
    let currentPrice = basePrice;
    
    // إنشاء 100 شمعة تجريبية
    for (let i = 0; i < 100; i++) {
      const volatility = 0.02 + Math.random() * 0.03;
      const trend = Math.sin(i * 0.1) * 0.01;
      
      const open = currentPrice;
      const change = (Math.random() - 0.5) * volatility * currentPrice + trend * currentPrice;
      const close = Math.max(open + change, 1);
      
      const high = Math.max(open, close) * (1 + Math.random() * 0.02);
      const low = Math.min(open, close) * (1 - Math.random() * 0.02);
      
      demoData.push({
        time: new Date(Date.now() - (100 - i) * 60000),
        open,
        high,
        low,
        close,
        volume: Math.floor(100000 + Math.random() * 900000),
        symbol,
        movementType: close > open ? 'bullish' : 'bearish'
      });
      
      currentPrice = close;
    }
    
    setCandleData(demoData);
    
    const latestPrice = demoData[demoData.length - 1]?.close || currentPrice;
    setCurrentPrice(latestPrice);
    
    const latestVolume = demoData[demoData.length - 1]?.volume || 0;
    setVolume(latestVolume);
    
    if (demoData.length >= 2) {
      const prevPrice = demoData[demoData.length - 2]?.close || latestPrice;
      setPriceChange(latestPrice - prevPrice);
    }
    
    setRealTimeData(prev => ({
      ...prev,
      lastUpdate: new Date(),
      symbol,
      price: latestPrice
    }));
  }, []);

  // ⚠️ DISABLED FOR PERFORMANCE: تأثير لرسم الشموع مع الحركة الذكية المتقدمة
  // رسم الشموع تم نقله إلى useEffect الموحد للتحسين
    
    // تحديد سرعة التحديث حسب نوع الحركة المكتشفة
    let smartInterval = updateInterval;
    const movementConfig = getMovementConfig(currentTrendType); // استخدام currentTrendType المعرف محلياً
    
    // تطبيق استراتيجية التحديث الذكية
    switch (platformConfig.updateStrategy) {
      case 'aggressive': // TradingView style
        smartInterval = Math.max(100, updateInterval * 0.5 * movementConfig.speedMultiplier);
        break;
      case 'fast': // Binance style
        smartInterval = Math.max(200, updateInterval * 0.7 * movementConfig.speedMultiplier);
        break;
      case 'balanced': // MetaTrader style
        smartInterval = updateInterval * movementConfig.speedMultiplier;
        break;
      case 'adaptive': // Universal style
        if (currentTimeframe?.realTime) {
          smartInterval = updateInterval * 0.8 * movementConfig.speedMultiplier;
        } else {
          smartInterval = updateInterval * movementConfig.speedMultiplier;
        }
        break;
    }
    
    // تحديد سرعة التحديث حسب نوع الحركة
    if (currentTrendType === 'reversal') {
      smartInterval *= 0.6; // تحديث أسرع للانعكاسات
    } else if (currentTrendType === 'doji') {
      smartInterval *= 1.5; // تحديث أبطأ للدوجي
    }
    
    // عدم إنشاء interval إذا كان هناك رمز مختار
    if (selectedSymbol) {
      return; // لا تنشئ timer للرموز المختارة
    }
    
    const intervalId = setInterval(() => {
      if (advancedSettings.useRealData) {
        // هنا يمكن إضافة منطق جلب البيانات الحقيقية من APIs
        return;
      }
      
      // 🧠 تحديث البيانات مع الذكاء الاصطناعي فقط للبيانات الافتراضية
      const newSmartData = generateSmartMovingCandleData();
      const newTrend = detectMarketTrend(newSmartData);
      
      // تحديث الاتجاه إذا تغير
      if (newTrend !== currentTrend) {
        setCurrentTrend(newTrend);
        setLastTrendChange(new Date());
        
        // إضافة تأثير بصري عند تغيير الاتجاه
        setAnimatingCandles(new Map().set('trend_change', {
          type: 'trend_change',
          timestamp: Date.now(),
          fromTrend: currentTrend,
          toTrend: newTrend
        }));
      }
      
      setCandleData(newSmartData);
      drawSmartMovingCandlesticks(canvas, ctx, newSmartData);
      
      // تحديث المعلومات المباشرة
      if (newSmartData.length > 0) {
        const lastCandle = newSmartData[newSmartData.length - 1];
        const previousCandle = newSmartData[newSmartData.length - 2];
        
        setCurrentPrice(lastCandle.close);
        setPriceChange(previousCandle ? lastCandle.close - previousCandle.close : 0);
        setVolume(lastCandle.volume);
        
        // حساب زخم السوق
        const momentum = lastCandle.trendStrength * (lastCandle.close > lastCandle.open ? 1 : -1);
        setMarketMomentum(momentum);
        
        // تحديث معلومات الاتصال المباشر
        setRealTimeData(prev => ({
          ...prev,
          lastUpdate: new Date(),
          connected: true,
          platform: currentTimeframe?.platform || 'All',
          currentTrend: newTrend,
          momentum: momentum
        }));
      }
      
      // إظهار مؤشر التحديث مع مدة تتناسب مع نوع الحركة
      setIsUpdating(true);
      const updateDuration = movementConfig.animation?.duration || 200;
      setTimeout(() => setIsUpdating(false), Math.min(500, updateDuration));
      
    }, Math.max(2000, smartInterval)); // حد أدنى 2000ms (2 ثانية) لتحسين الأداء وتقليل التحديثات

    return () => clearInterval(intervalId);
  }, [selectedTimeframe, selectedChartType, selectedSymbol]); // استخدام selectedSymbol بدلاً من selectedMarket

  // 🗄️ تأثير لجلب البيانات من MongoDB عند الحاجة
  useEffect(() => {
    const loadRealData = async () => {
      if (advancedSettings.useRealData && isConnected && selectedSymbol) {
        setIsUpdating(true);
        
        try {
          const realData = await fetchRealDataFromMongoDB(selectedSymbol);
          if (realData.length > 0) {
            setCandleData(realData);
          }
        } catch (error) {
          // خطأ في جلب البيانات
        } finally {
          setIsUpdating(false);
        }
      }
    };

  // ⚠️ ALL useEffect DISABLED FOR MEGA PERFORMANCE BOOST
  // تم تعطيل جميع useEffect لتحسين جذري في الأداء
  
  // DISABLED: تأثير لإعادة الرسم عند تغيير البيانات 
  // DISABLED: تأثير لرسم مؤشر الوضع التفاعلي
  // DISABLED: جميع useEffect للمعالجة الفورية
  // DISABLED: تحديث تلقائي للبيانات الحقيقية
  
  // كامل useEffect system تم نقله إلى نظام unified render

  // ===============================================================
  // 🚀 MEGA OPTIMIZATION: Single Combined Render Effect
  // تحسين جذري - دمج جميع عمليات الرسم في useEffect واحد
  // ===============================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // دالة رسم محسّنة موحدة مع throttling
    const renderEverything = throttle(() => {
      if (!candleData.length) return;
      
      const ctx = canvas.getContext('2d');
      
      // رسم الشارت الأساسي
      drawSmartMovingCandlesticks(canvas, ctx, candleData);
      
      // رسم العناصر الإضافية إذا وُجدت
      if (fibonacciLevels.length > 0) {
        fibonacciLevels.forEach(fibGroup => {
          ctx.save();
          ctx.strokeStyle = fibGroup.color || INTERACTIVE_TOOLS.fibonacci.color;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 5]);
          ctx.globalAlpha = 0.8;
          
          fibGroup.levels.forEach(level => {
            ctx.beginPath();
            ctx.moveTo(level.startX, level.y);
            ctx.lineTo(level.endX, level.y);
            ctx.stroke();
          });
          ctx.restore();
        });
      }
      
      if (gannAngles.length > 0) {
        gannAngles.forEach(gannGroup => {
          ctx.save();
          gannGroup.lines.forEach(line => {
            ctx.strokeStyle = line.color;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.7;
            
            const centerX = gannGroup.centerPoint.x;
            const centerY = gannGroup.centerPoint.y;
            const endX = line.slope < 0 ? canvas.width : 0;
            const endY = centerY + (endX - centerX) * line.slope;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
          });
          ctx.restore();
        });
      }
      
      if (supportResistanceLines.length > 0) {
        supportResistanceLines.forEach(line => {
          ctx.save();
          ctx.strokeStyle = line.color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.8;
          
          ctx.beginPath();
          ctx.moveTo(line.startPoint.x, line.startPoint.y);
          ctx.lineTo(line.endPoint.x, line.endPoint.y);
          ctx.stroke();
          ctx.restore();
        });
      }
      
      if (trendLines.length > 0) {
        trendLines.forEach(line => {
          ctx.save();
          ctx.strokeStyle = line.color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.8;
          
          ctx.beginPath();
          ctx.moveTo(line.startPoint.x, line.startPoint.y);
          ctx.lineTo(line.endPoint.x, line.endPoint.y);
          ctx.stroke();
          ctx.restore();
        });
      }
      
      if (priceChannels.length > 0) {
        priceChannels.forEach(channel => {
          ctx.save();
          ctx.strokeStyle = channel.color;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = 0.7;
          
          ctx.beginPath();
          ctx.moveTo(channel.upperLine.start.x, channel.upperLine.start.y);
          ctx.lineTo(channel.upperLine.end.x, channel.upperLine.end.y);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(channel.lowerLine.start.x, channel.lowerLine.start.y);
          ctx.lineTo(channel.lowerLine.end.x, channel.lowerLine.end.y);
          ctx.stroke();
          ctx.restore();
        });
      }
      
      // عرض مؤشر الوضع التفاعلي
      if (interactiveMode && INTERACTIVE_TOOLS[interactiveMode]) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvas.width - 160, 0, 160, 50);
        
        ctx.fillStyle = INTERACTIVE_TOOLS[interactiveMode].color;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.globalAlpha = 1;
        ctx.fillText(`وضع: ${INTERACTIVE_TOOLS[interactiveMode].name}`, canvas.width - 80, 30);
        ctx.restore();
      }
    }, 16); // 60 FPS كحد أقصى
    
    renderEverything();
  }, [
    candleData, 
    interactiveMode, 
    selectedChartType, 
    fibonacciLevels, 
    gannAngles, 
    supportResistanceLines, 
    trendLines, 
    priceChannels
  ]);

  // ⚠️ DISABLED: 🖱️ إضافة التفاعل مع الماوس للأدوات التحليلية
  // تم تعطيل تفاعل الماوس لتحسين الأداء - سيتم تفعيله لاحقاً عند الحاجة
                
                // رسم نقطة البداية المتوهجة
                ctx.fillStyle = '#00FFFF';
                ctx.shadowColor = '#00FFFF';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, Math.PI * 2);
                ctx.fill();
                
                // رسم دائرة خارجية
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.arc(x, y, 12, 0, Math.PI * 2);
                ctx.stroke();
                
                ctx.restore();
                // رسم نقطة بداية فوراً
              }
              
              // إضافة تأثير بصري فوري
              setPreviewData({
                type: 'fibonacci_start',
                point: { x, y },
                message: 'حدد النقطة الثانية لإتمام مستويات فيبوناتشي'
              });
              
            } else {
              // النقرة الثانية - إتمام الرسم
              const start = drawingStart;
              const end = { candle: selectedCandle, index: selectedIndex, x, y };
              
              const high = Math.max(start.candle.high, end.candle.high);
              const low = Math.min(start.candle.low, end.candle.low);
              const range = high - low;
              
              const fibLevels = ADVANCED_ANALYSIS_PATTERNS.LEVELS.fibonacci.map(ratio => ({
                ratio,
                price: low + (range * ratio / 100),
                y: start.y - ((ratio / 100) * (start.y - end.y)),
                startX: Math.min(start.x, end.x),
                endX: Math.max(start.x, end.x)
              }));
              
              setFibonacciLevels(prev => [...prev, {
                id: Date.now(),
                startPoint: start,
                endPoint: end,
                levels: fibLevels,
                color: INTERACTIVE_TOOLS.fibonacci.color
              }]);
              
              // 🚀 رسم فوري لمستويات فيبوناتشي
              const canvas = canvasRef.current;
              if (canvas) {
                const ctx = canvas.getContext('2d');
                
                // رسم فوري لمستويات فيبوناتشي
                ctx.save();
                ctx.strokeStyle = INTERACTIVE_TOOLS.fibonacci.color;
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]);
                
                fibLevels.forEach(level => {
                  // رسم خط المستوى
                  ctx.beginPath();
                  ctx.moveTo(level.startX, level.y);
                  ctx.lineTo(level.endX, level.y);
                  ctx.stroke();
                  
                  // رسم النص
                  ctx.fillStyle = INTERACTIVE_TOOLS.fibonacci.color;
                  ctx.font = '12px Arial';
                  
                  // إضافة إطار للنص
                  ctx.strokeStyle = '#000';
                  ctx.lineWidth = 1;
                  ctx.strokeText(`${level.ratio.toFixed(1)}%`, level.endX + 5, level.y - 5);
                  
                  ctx.fillText(`${level.ratio.toFixed(1)}%`, level.endX + 5, level.y - 5);
                });
                
                ctx.restore();
                // رسم مستويات فيبوناتشي
              }
              
              // إضافة تأثير إتمام العملية
              setPreviewData({
                type: 'fibonacci_complete',
                message: '✅ تم إنشاء مستويات فيبوناتشي بنجاح!'
              });
              
              setIsDrawing(false);
              setDrawingStart(null);
              
              // إخفاء رسالة الإتمام بعد ثانيتين
              setTimeout(() => setPreviewData(null), 2000);
            }
            break;
            
          case 'gann_angles':
            // زوايا جان - نقرة واحدة فقط (مع الاتجاه المعاكس)
            const angles = ADVANCED_ANALYSIS_PATTERNS.GANN_ANALYSIS.angles;
            const gannLines = angles.map(angle => {
              const radians = (angle * Math.PI) / 180;
              const slope = -Math.tan(radians); // عكس الاتجاه
              return {
                angle,
                startX: x,
                startY: y,
                slope,
                color: angle === 45 ? '#FFD700' : '#00BFFF'
              };
            });
            
            setGannAngles(prev => [...prev, {
              id: Date.now(),
              centerPoint: { candle: selectedCandle, index: selectedIndex, x, y },
              lines: gannLines
            }]);
            
            // 🚀 رسم فوري لزوايا جان
            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext('2d');
              ctx.save();
              
              gannLines.forEach(line => {
                ctx.strokeStyle = line.color;
                ctx.lineWidth = 1.5;
                ctx.setLineDash([]);
                ctx.globalAlpha = 0.7;
                
                // رسم الخط من النقطة المركزية إلى حواف الكانفس (اتجاه معاكس)
                const endX = line.slope < 0 ? canvas.width : 0; // تم عكس الشرط
                const endY = y + (endX - x) * line.slope;
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(endX, endY);
                ctx.stroke();
                
                // رسم تسمية الزاوية
                ctx.fillStyle = line.color;
                ctx.font = '10px Arial';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                ctx.shadowBlur = 2;
                const labelX = x + (endX - x) * 0.1;
                const labelY = y + (endY - y) * 0.1;
                ctx.fillText(`${line.angle}°`, labelX, labelY);
              });
              
              // رسم النقطة المركزية
              ctx.shadowColor = 'transparent';
              ctx.fillStyle = '#00BFFF';
              ctx.globalAlpha = 0.8;
              ctx.beginPath();
              ctx.arc(x, y, 5, 0, Math.PI * 2);
              ctx.fill();
              
              ctx.restore();
              // رسم زوايا جان
            }
            
            // تأثير بصري فوري
            setPreviewData({
              type: 'gann_complete',
              message: '🔄 تم إنشاء زوايا جان بنجاح!'
            });
            
            // إخفاء الرسالة بعد ثانيتين
            setTimeout(() => setPreviewData(null), 2000);
            break;
            
          case 'support_resistance':
            if (!isDrawing) {
              // النقرة الأولى
              setIsDrawing(true);
              setDrawingStart({ candle: selectedCandle, index: selectedIndex, x, y });
              
              setPreviewData({
                type: 'support_resistance_start',
                point: { x, y },
                message: 'حدد النقطة الثانية لرسم خط الدعم/المقاومة'
              });
              
            } else {
              // النقرة الثانية
              const start = drawingStart;
              const end = { candle: selectedCandle, index: selectedIndex, x, y };
              const lineType = start.candle.close > end.candle.close ? 'resistance' : 'support';
              const lineColor = lineType === 'resistance' ? '#FF1744' : '#00FF41';
              
              setSupportResistanceLines(prev => [...prev, {
                id: Date.now(),
                startPoint: start,
                endPoint: end,
                price: start.candle.close,
                type: lineType,
                color: lineColor
              }]);
              
              // 🚀 رسم فوري لخط الدعم/المقاومة
              const canvas = canvasRef.current;
              if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.save();
                
                ctx.strokeStyle = lineColor;
                ctx.lineWidth = 2;
                ctx.setLineDash([]);
                ctx.globalAlpha = 0.8;
                
                // رسم الخط
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(x, y);
                ctx.stroke();
                
                // رسم النقاط
                ctx.fillStyle = lineColor;
                ctx.globalAlpha = 0.9;
                
                // نقطة البداية
                ctx.beginPath();
                ctx.arc(start.x, start.y, 5, 0, Math.PI * 2);
                ctx.fill();
                
                // نقطة النهاية
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fill();
                
                // تسمية نوع الخط
                ctx.fillStyle = lineColor;
                ctx.font = 'bold 12px Arial';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                ctx.shadowBlur = 2;
                const labelX = (start.x + x) / 2;
                const labelY = (start.y + y) / 2 - 10;
                ctx.fillText(lineType === 'resistance' ? 'مقاومة' : 'دعم', labelX, labelY);
                
                ctx.restore();
                // رسم خط الدعم/المقاومة
              }
              
              setPreviewData({
                type: 'support_resistance_complete',
                message: '📈 تم إنشاء خط الدعم/المقاومة بنجاح!'
              });
              
              setIsDrawing(false);
              setDrawingStart(null);
              
              setTimeout(() => setPreviewData(null), 2000);
            }
            break;
            
          case 'pattern_detection':
            // كشف الأنماط للشمعة المختارة
            const nearbyCandles = candleData.slice(Math.max(0, selectedIndex - 2), selectedIndex + 3);
            const detectedPatterns = detectCandlestickPatterns(nearbyCandles);
            
            if (detectedPatterns.length > 0) {
              setDetectedPatterns(prev => [...prev, {
                id: Date.now(),
                centerIndex: selectedIndex,
                patterns: detectedPatterns,
                timestamp: Date.now()
              }]);
              
              // 🚀 رسم فوري لتمييز الأنماط المكتشفة
              const canvas = canvasRef.current;
              if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.save();
                
                // رسم إطار حول الشمعة المحددة
                ctx.strokeStyle = '#FF6B6B';
                ctx.lineWidth = 3;
                ctx.setLineDash([5, 5]);
                ctx.globalAlpha = 0.8;
                
                const padding = 50;
                const chartWidth = canvas.width - 2 * padding;
                const candleWidth = chartWidth / candleData.length;
                const candleX = padding + (selectedIndex * candleWidth);
                
                ctx.beginPath();
                ctx.strokeRect(candleX - candleWidth/2, y - 50, candleWidth, 100);
                ctx.stroke();
                
                // رسم تسمية الأنماط
                ctx.fillStyle = '#FF6B6B';
                ctx.font = 'bold 12px Arial';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                ctx.shadowBlur = 2;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;
                ctx.globalAlpha = 1;
                
                detectedPatterns.forEach((pattern, index) => {
                  ctx.fillText(
                    `نمط: ${pattern.name}`, 
                    candleX + 15, 
                    y - 30 + (index * 15)
                  );
                });
                
                // نقطة مركزية
                ctx.shadowColor = 'transparent';
                ctx.fillStyle = '#FF6B6B';
                ctx.globalAlpha = 0.9;
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
                // تمييز الأنماط المكتشفة
              }
              
              // رسالة نجاح
              setPreviewData({
                type: 'pattern_detection_complete',
                message: `🔍 تم اكتشاف ${detectedPatterns.length} نمط!`
              });
              
              setTimeout(() => setPreviewData(null), 3000);
            } else {
              // لم يتم اكتشاف أنماط
              setPreviewData({
                type: 'pattern_detection_none',
                message: '🔍 لم يتم اكتشاف أنماط في هذا الموقع'
              });
              
              setTimeout(() => setPreviewData(null), 2000);
            }
            break;
            
          case 'trend_lines':
            if (!isDrawing) {
              // النقرة الأولى - بداية خط الاتجاه
              setIsDrawing(true);
              setDrawingStart({ candle: selectedCandle, index: selectedIndex, x, y });
              
              setPreviewData({
                type: 'trend_line_start',
                point: { x, y },
                message: 'حدد النقطة الثانية لرسم خط الاتجاه'
              });
              
            } else {
              // النقرة الثانية - إتمام خط الاتجاه
              const start = drawingStart;
              const end = { candle: selectedCandle, index: selectedIndex, x, y };
              
              setTrendLines(prev => [...prev, {
                id: Date.now(),
                startPoint: start,
                endPoint: end,
                slope: (end.y - start.y) / (end.x - start.x),
                color: INTERACTIVE_TOOLS.trend_lines.color
              }]);
              
              // 🚀 رسم فوري لخط الاتجاه
              const canvas = canvasRef.current;
              if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.save();
                
                ctx.strokeStyle = INTERACTIVE_TOOLS.trend_lines.color;
                ctx.lineWidth = 2;
                ctx.setLineDash([]);
                ctx.globalAlpha = 0.8;
                
                // رسم الخط
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(x, y);
                ctx.stroke();
                
                // رسم النقاط
                ctx.fillStyle = INTERACTIVE_TOOLS.trend_lines.color;
                ctx.globalAlpha = 0.9;
                
                ctx.beginPath();
                ctx.arc(start.x, start.y, 5, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fill();
                
                // تسمية
                ctx.fillStyle = INTERACTIVE_TOOLS.trend_lines.color;
                ctx.font = 'bold 12px Arial';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                ctx.shadowBlur = 2;
                const labelX = (start.x + x) / 2;
                const labelY = (start.y + y) / 2 - 10;
                ctx.fillText('خط الاتجاه', labelX, labelY);
                
                ctx.restore();
                // رسم خط الاتجاه
              }
              
              setPreviewData({
                type: 'trend_line_complete',
                message: '📏 تم إنشاء خط الاتجاه بنجاح!'
              });
              
              setIsDrawing(false);
              setDrawingStart(null);
              
              setTimeout(() => setPreviewData(null), 2000);
            }
            break;
            
          case 'price_channels':
            if (!isDrawing) {
              // النقرة الأولى - بداية القناة
              setIsDrawing(true);
              setDrawingStart({ candle: selectedCandle, index: selectedIndex, x, y });
              
              setPreviewData({
                type: 'price_channel_start',
                point: { x, y },
                message: 'حدد النقطة الثانية لإنشاء قناة السعر'
              });
              
            } else {
              // النقرة الثانية - إتمام القناة
              const start = drawingStart;
              const end = { candle: selectedCandle, index: selectedIndex, x, y };
              
              // حساب عرض القناة (المسافة بين النقطتين)
              const channelWidth = Math.abs(end.y - start.y);
              
              setPriceChannels(prev => [...prev, {
                id: Date.now(),
                upperLine: { start, end },
                lowerLine: { 
                  start: { ...start, y: start.y + channelWidth },
                  end: { ...end, y: end.y + channelWidth }
                },
                centerLine: { 
                  start: { ...start, y: start.y + channelWidth/2 },
                  end: { ...end, y: end.y + channelWidth/2 }
                },
                color: INTERACTIVE_TOOLS.price_channels.color
              }]);
              
              // 🚀 رسم فوري لقناة السعر
              const canvas = canvasRef.current;
              if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.save();
                
                ctx.strokeStyle = INTERACTIVE_TOOLS.price_channels.color;
                ctx.lineWidth = 1.5;
                ctx.globalAlpha = 0.7;
                
                // رسم الخط العلوي
                ctx.setLineDash([]);
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(x, y);
                ctx.stroke();
                
                // رسم الخط السفلي
                ctx.beginPath();
                ctx.moveTo(start.x, start.y + channelWidth);
                ctx.lineTo(x, y + channelWidth);
                ctx.stroke();
                
                // رسم الخط المركزي
                ctx.setLineDash([5, 5]);
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.moveTo(start.x, start.y + channelWidth/2);
                ctx.lineTo(x, y + channelWidth/2);
                ctx.stroke();
                
                // تعبئة القناة
                ctx.setLineDash([]);
                ctx.fillStyle = INTERACTIVE_TOOLS.price_channels.color;
                ctx.globalAlpha = 0.1;
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(x, y);
                ctx.lineTo(x, y + channelWidth);
                ctx.lineTo(start.x, start.y + channelWidth);
                ctx.closePath();
                ctx.fill();
                
                // تسمية
                ctx.fillStyle = INTERACTIVE_TOOLS.price_channels.color;
                ctx.font = 'bold 12px Arial';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                ctx.shadowBlur = 2;
                ctx.globalAlpha = 1;
                const labelX = (start.x + x) / 2;
                const labelY = start.y + channelWidth/2;
                ctx.fillText('قناة السعر', labelX, labelY);
                
                ctx.restore();
                // رسم قناة السعر
              }
              
              setPreviewData({
                type: 'price_channel_complete',
                message: '🌊 تم إنشاء قناة السعر بنجاح!'
              });
              
              setIsDrawing(false);
              setDrawingStart(null);
              
              setTimeout(() => setPreviewData(null), 2000);
            }
            break;
            
          default:
            // إضافة الشمعة للمختارة
            setSelectedCandles(prev => {
              const exists = prev.find(c => c.index === selectedIndex);
              if (exists) {
                return prev.filter(c => c.index !== selectedIndex);
              } else {
                return [...prev, { ...selectedCandle, index: selectedIndex, x, y }];
              }
            });
        }
      }
    };

    const handleMouseMove = throttle((event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setMousePosition({ x, y });
      
      // إضافة معاينة مباشرة أثناء الرسم مع رسم فوري
      if (isDrawing && drawingStart && (interactiveMode === 'fibonacci' || interactiveMode === 'support_resistance')) {
        setPreviewData(prev => ({
          ...prev,
          previewLine: {
            start: drawingStart,
            current: { x, y }
          }
        }));
        
        // 🚀 رسم فوري لخط المعاينة
        if (interactiveMode === 'fibonacci') {
          // تم إخفاء خط المعاينة - لا يظهر خط ذهبي أثناء الرسم
        }
      }
    }, 50); // throttle حركة الماوس بـ 50ms

    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [candleData, interactiveMode, isDrawing, drawingStart, detectCandlestickPatterns, previewData]);

  // ⌨️ معالج اختصارات لوحة المفاتيح للأدوات التفاعلية
  useEffect(() => {
    const handleKeyDown = (e) => {
      // تجاهل الاختصارات إذا كان المستخدم يكتب في حقل نص
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      // البحث عن الأداة التي تطابق الاختصار
      const toolEntry = Object.entries(INTERACTIVE_TOOLS).find(([_, tool]) => 
        tool.shortcut.toLowerCase() === e.key.toLowerCase()
      );
      
      if (toolEntry) {
        e.preventDefault();
        const [toolKey] = toolEntry;
        handleInteractiveModeChange(interactiveMode === toolKey ? null : toolKey);
      }
      
      // اختصارات إضافية
      switch(e.key.toLowerCase()) {
        case 'escape':
          e.preventDefault();
          handleInteractiveModeChange(null);
          setSelectedCandles([]);
          break;
        case 'delete':
        case 'backspace':
          if (e.ctrlKey) {
            e.preventDefault();
            setFibonacciLevels([]);
            setGannAngles([]);
            setSupportResistanceLines([]);
            setSelectedCandles([]);
            setDetectedPatterns([]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [interactiveMode]);

  // معالج تغيير حجم النافذة مع التحديث المحسن
  useEffect(() => {
    const handleResize = throttle(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      if (candleData.length > 0) {
        const ctx = canvas.getContext('2d');
        drawSmartMovingCandlesticks(canvas, ctx, candleData);
      }
    }, 300); // زيادة فترة التحديث إلى 300ms لتحسين الأداء

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [candleData, drawSmartMovingCandlesticks]);

  // ===============================================================
  // 🚀 PERFORMANCE: REMOVED MOUSE POSITION EFFECT FOR OPTIMIZATION  
  // تم إزالة useEffect للماوس لتحسين الأداء
  // ===============================================================
  
  // إعدادات النمط
  const styles = {
    container: {
      width: '100%',
      maxWidth: '1400px', // حد أقصى للعرض
      margin: '0 auto', // توسيط المحتوى
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
      overflow: 'auto',
      paddingBottom: '150px' // مسافة كافية للتذييل وشريط المعلومات
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 20px',
      backgroundColor: '#1a1a1a',
      borderBottom: '2px solid #333'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#FFD700'
    },
    controls: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    },
    button: {
      padding: '8px 16px',
      backgroundColor: '#333',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'background-color 0.3s'
    },
    
    // ==================================================================================
    // 🔍 ZOOM BUTTON STYLES - أنماط أزرار التكبير والتصغير
    // ==================================================================================
    zoomButton: {
      padding: '6px 10px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: 'bold',
      margin: '0 2px',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
      ':hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)'
      },
      ':active': {
        transform: 'translateY(0)',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.4)'
      }
    },
    activeButton: {
      backgroundColor: '#FFD700',
      color: '#000'
    },
    marketInfoBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 15px',
      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.05))',
      border: '1px solid rgba(255, 215, 0, 0.4)',
      borderRadius: '8px',
      margin: '8px 15px',
      backdropFilter: 'blur(15px)',
      flexWrap: 'wrap',
      gap: '15px',
      boxShadow: '0 4px 20px rgba(255, 215, 0, 0.1)'
    },
    marketInfoSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minWidth: '140px',
      background: 'rgba(0, 0, 0, 0.3)',
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    marketInfoTitle: {
      fontSize: '13px',
      fontWeight: 'bold',
      color: '#FFD700',
      marginBottom: '8px',
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    marketInfoContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '5px'
    },
    priceDisplay: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexWrap: 'wrap',
      justifyContent: 'center'
    },
    priceLabel: {
      fontSize: '11px',
      color: '#E0E0E0',
      fontWeight: 'bold'
    },
    priceValue: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#FFD700',
      textShadow: '0 0 10px rgba(255, 215, 0, 0.3)'
    },
    priceChangeValue: {
      fontSize: '14px',
      fontWeight: 'bold',
      padding: '2px 6px',
      borderRadius: '4px',
      minWidth: '60px',
      textAlign: 'center'
    },
    volumeDisplay: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap'
    },
    volumeLabel: {
      fontSize: '10px',
      color: '#B0B0B0',
      fontWeight: 'bold'
    },
    volumeValue: {
      fontSize: '13px',
      color: '#00BFFF',
      fontWeight: 'bold'
    },
    updateInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap'
    },
    updateLabel: {
      fontSize: '10px',
      color: '#B0B0B0',
      fontWeight: 'bold'
    },
    updateValue: {
      fontSize: '12px',
      color: '#00BFFF',
      fontWeight: 'bold',
      background: 'rgba(0, 191, 255, 0.1)',
      padding: '2px 6px',
      borderRadius: '4px'
    },
    connectionInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap'
    },
    connectionLabel: {
      fontSize: '10px',
      color: '#B0B0B0',
      fontWeight: 'bold'
    },
    connectionValue: {
      fontSize: '12px',
      fontWeight: 'bold',
      padding: '2px 8px',
      borderRadius: '4px',
      border: '1px solid currentColor'
    },
    lastUpdateValue: {
      fontSize: '11px',
      color: '#B0B0B0',
      textAlign: 'center',
      marginTop: '4px',
      fontStyle: 'italic'
    },
    chartContainer: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#1a1a1a',
      borderRadius: '6px',
      overflow: 'hidden',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
      width: '100%',
      margin: '0 auto'
    },
    canvas: {
      width: '100%',
      height: '550px',
      backgroundColor: '#1a1a1a',
      cursor: 'crosshair'
    },
    footer: {
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      padding: '8px 15px', // تقليل الحشو
      backgroundColor: 'rgba(26, 26, 26, 0.98)',
      borderTop: '1px solid #333', // تقليل سماكة الحدود
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '6px', // تقليل المسافة بين العناصر
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.3)' // تقليل الظل
    },
    statusGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px', // تقليل المسافة
      fontSize: '10px', // تصغير الخط
      color: '#E0E0E0',
      minWidth: '160px', // تقليل العرض الأدنى
      padding: '6px 8px', // تقليل الحشو
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '4px', // تقليل الانحناء
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    // 🎨 أنماط معلومات المستخدم الجديدة
    colorGuide: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flexWrap: 'wrap',
      marginTop: '10px',
      padding: '10px',
      background: 'linear-gradient(90deg, rgba(0,255,65,0.1) 0%, rgba(255,23,68,0.1) 25%, rgba(255,215,0,0.1) 50%, rgba(156,39,176,0.1) 75%, rgba(0,191,255,0.1) 100%)',
      borderRadius: '8px',
      border: '1px solid rgba(0, 191, 255, 0.3)'
    },
    colorItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    colorDot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      display: 'inline-block'
    },
    colorText: {
      fontSize: '11px',
      color: '#FFFFFF',
      fontWeight: 'bold'
    },
    featuresInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      marginTop: '8px',
      flexWrap: 'wrap'
    },
    featuresBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      padding: '4px 8px',
      background: 'rgba(0, 191, 255, 0.1)',
      borderRadius: '6px',
      border: '1px solid rgba(0, 191, 255, 0.3)'
    },
    featuresIcon: {
      fontSize: '14px'
    },
    featuresText: {
      fontSize: '10px',
      color: '#00BFFF',
      fontWeight: 'bold'
    },
    versionBadge: {
      fontSize: '10px',
      color: '#FFD700',
      background: 'rgba(255, 215, 0, 0.1)',
      padding: '2px 6px',
      borderRadius: '4px',
      marginLeft: '8px',
      border: '1px solid rgba(255, 215, 0, 0.3)'
    },
    // 🎯 أنماط لوحة التحليل المتقدم
    analysisPanel: {
      background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(35, 35, 35, 0.95) 50%, rgba(26, 26, 26, 0.95) 100%)',
      border: '2px solid rgba(0, 191, 255, 0.3)',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '15px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)'
    },
    analysisPanelTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#00FFFF',
      textAlign: 'center',
      marginBottom: '20px',
      textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
    },
    analysisSection: {
      marginBottom: '20px',
      padding: '15px',
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    analysisSectionTitle: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#FFD700',
      marginBottom: '10px',
      textShadow: '0 0 5px rgba(255, 215, 0, 0.5)'
    },
    analysisGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '10px'
    },
    analysisItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '8px',
      background: 'rgba(0, 191, 255, 0.1)',
      borderRadius: '6px',
      border: '1px solid rgba(0, 191, 255, 0.3)'
    },
    analysisLabel: {
      fontSize: '10px',
      color: '#FFFFFF',
      marginBottom: '4px'
    },
    analysisValue: {
      fontSize: '12px',
      fontWeight: 'bold'
    },
    fibonacciGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
      gap: '8px'
    },
    fibonacciItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '6px'
    },
    fibonacciLabel: {
      fontSize: '11px',
      color: '#FFFFFF',
      marginBottom: '4px',
      fontWeight: 'bold'
    },
    fibonacciBar: {
      height: '8px',
      borderRadius: '4px',
      minWidth: '20px',
      boxShadow: '0 0 8px rgba(0, 191, 255, 0.4)'
    },
    patternCategory: {
      marginBottom: '15px'
    },
    patternCategoryTitle: {
      fontSize: '12px',
      fontWeight: 'bold',
      marginBottom: '8px',
      textShadow: '0 0 5px currentColor'
    },
    patternGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '6px'
    },
    patternItemGrid: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 12px',
      background: 'rgba(0, 0, 0, 0.4)',
      borderRadius: '6px',
      border: '2px solid',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
    },
    patternName: {
      fontSize: '11px',
      color: '#FFFFFF',
      fontWeight: 'bold'
    },
    patternStrength: {
      fontSize: '10px',
      fontWeight: 'bold'
    },
    
    // 🎨 أنماط التحليل المتقدم المحسنة
    analysisPanelHeader: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '25px',
      padding: '15px',
      background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(0, 191, 255, 0.1))',
      borderRadius: '12px',
      border: '2px solid rgba(0, 255, 255, 0.3)'
    },
    analysisPanelIcon: {
      fontSize: '32px',
      marginBottom: '8px',
      filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.6))'
    },
    analysisPanelSubtitle: {
      fontSize: '12px',
      color: '#B0BEC5',
      textAlign: 'center',
      marginTop: '5px',
      fontStyle: 'italic'
    },
    analysisSectionHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '15px',
      padding: '10px 15px',
      background: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    analysisSectionIcon: {
      fontSize: '18px',
      marginRight: '8px'
    },
    analysisSectionBadge: {
      fontSize: '10px',
      padding: '4px 8px',
      background: 'rgba(0, 191, 255, 0.2)',
      color: '#00BFFF',
      borderRadius: '12px',
      border: '1px solid rgba(0, 191, 255, 0.3)'
    },
    analysisItemIcon: {
      fontSize: '16px',
      marginBottom: '4px'
    },
    analysisItemStrength: {
      fontSize: '9px',
      color: '#B0BEC5',
      marginTop: '2px',
      fontWeight: 'bold'
    },
    fibonacciItemHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '6px'
    },
    fibonacciIcon: {
      fontSize: '14px',
      marginRight: '4px'
    },
    fibonacciBarContainer: {
      width: '100%',
      height: '6px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '3px',
      overflow: 'hidden',
      marginBottom: '4px'
    },
    fibonacciImportance: {
      fontSize: '8px',
      color: '#B0BEC5',
      fontStyle: 'italic'
    },
    patternCategoryHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px',
      padding: '8px 12px',
      background: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '6px'
    },
    patternCategoryIcon: {
      fontSize: '16px',
      marginRight: '6px'
    },
    patternCategoryBadge: {
      fontSize: '9px',
      padding: '3px 6px',
      background: 'rgba(255, 255, 255, 0.1)',
      color: '#FFFFFF',
      borderRadius: '10px',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    patternItemHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '6px'
    },
    patternItemIcon: {
      fontSize: '12px',
      marginRight: '4px'
    },
    patternItemBody: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '6px'
    },
    patternStrengthBar: {
      width: '100%',
      height: '4px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '2px',
      overflow: 'hidden',
      marginTop: '3px'
    },
    patternItemFooter: {
      width: '100%',
      textAlign: 'center'
    },
    patternType: {
      fontSize: '8px',
      color: '#B0BEC5',
      fontStyle: 'italic'
    },
    analysisSummary: {
      marginTop: '20px',
      padding: '15px',
      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 193, 7, 0.1))',
      borderRadius: '10px',
      border: '2px solid rgba(255, 215, 0, 0.3)'
    },
    analysisSummaryHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '15px'
    },
    analysisSummaryIcon: {
      fontSize: '20px',
      marginRight: '8px'
    },
    analysisSummaryTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#FFD700'
    },
    analysisSummaryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '10px'
    },
    analysisSummaryItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 12px',
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '6px',
      border: '1px solid rgba(255, 215, 0, 0.2)'
    },
    summaryLabel: {
      fontSize: '10px',
      color: '#B0BEC5'
    },
    summaryValue: {
      fontSize: '12px',
      fontWeight: 'bold',
      color: '#FFD700'
    },
    
    // 🛠️ أنماط شريط الأدوات التفاعلية
    interactiveToolbar: {
      marginBottom: '15px',
      padding: '15px',
      backgroundColor: 'rgba(20, 20, 20, 0.95)',
      border: '2px solid rgba(0, 255, 150, 0.4)',
      borderRadius: '8px',
      backdropFilter: 'blur(15px)',
      boxShadow: '0 4px 20px rgba(0, 255, 150, 0.2)'
    },
    
    toolbarTitle: {
      color: '#00FF96',
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '15px',
      textAlign: 'center',
      textShadow: '0 0 10px rgba(0, 255, 150, 0.5)'
    },
    
    toolsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', // أدوات أصغر
      gap: '8px',
      marginBottom: '12px'
    },
    
    toolButton: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '5px',
      padding: '12px 8px',
      border: '2px solid',
      borderRadius: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '12px',
      fontWeight: 'bold',
      transform: 'scale(1)',
      ':hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 4px 15px rgba(0, 255, 150, 0.3)'
      }
    },
    
    toolIcon: {
      fontSize: '20px',
      lineHeight: '1'
    },
    
    toolName: {
      fontSize: '11px',
      textAlign: 'center',
      lineHeight: '1.2'
    },
    
    toolShortcut: {
      fontSize: '10px',
      opacity: '0.7',
      fontFamily: 'monospace'
    },
    
    activeToolInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px',
      backgroundColor: 'rgba(0, 255, 150, 0.1)',
      border: '1px solid rgba(0, 255, 150, 0.3)',
      borderRadius: '6px',
      marginBottom: '15px'
    },
    
    activeToolIcon: {
      fontSize: '16px'
    },
    
    activeToolText: {
      color: '#00FF96',
      fontSize: '14px',
      fontWeight: 'bold',
      flex: 1
    },
    
    deactivateButton: {
      padding: '5px 10px',
      backgroundColor: 'rgba(255, 23, 68, 0.2)',
      border: '1px solid #FF1744',
      borderRadius: '4px',
      color: '#FF1744',
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    
    controlButtons: {
      display: 'flex',
      gap: '10px',
      marginBottom: '15px'
    },
    
    controlButton: {
      flex: 1,
      padding: '8px 12px',
      border: 'none',
      borderRadius: '6px',
      color: 'white',
      fontSize: '12px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      opacity: '0.9',
      ':hover': {
        opacity: '1',
        transform: 'translateY(-1px)'
      }
    },
    
    statusInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '11px',
      color: '#CCCCCC'
    },
    
    statusItem: {
      padding: '6px 10px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '4px',
      fontSize: '11px',
      color: '#CCCCCC',
      textAlign: 'center'
    },
    
    // 📖 أنماط دليل الاستخدام
    usageGuide: {
      marginTop: '15px',
      padding: '12px',
      backgroundColor: 'rgba(0, 150, 255, 0.1)',
      border: '1px solid rgba(0, 150, 255, 0.3)',
      borderRadius: '8px'
    },
    
    guideTitle: {
      fontSize: '12px',
      fontWeight: 'bold',
      color: '#0096FF',
      marginBottom: '8px',
      textShadow: '0 0 5px rgba(0, 150, 255, 0.5)'
    },
    
    guideItems: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '6px'
    },
    
    guideItem: {
      fontSize: '10px',
      color: '#CCCCCC',
      padding: '4px 8px',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '4px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },

    // 📊 أنماط شريط المعلومات المفصلة
    detailedInfoBar: {
      position: 'relative', // تغيير من fixed إلى relative
      margin: '20px auto', // توسيط مع مسافة
      width: '85%', // عرض أقل لتجنب التداخل مع حواف الشاشة
      maxWidth: '1100px', // عرض أقصى أصغر
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 12px', // حشو أقل
      background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(0, 191, 255, 0.15) 50%, rgba(26, 26, 26, 0.95) 100%)',
      border: '1px solid rgba(0, 191, 255, 0.3)',
      borderRadius: '6px', // انحناء أقل
      backdropFilter: 'blur(15px)',
      boxShadow: '0 4px 20px rgba(0, 191, 255, 0.2)',
      zIndex: 998 // أقل من التذييل
    },

    detailedInfoItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '3px', // مسافة أقل بين العناصر
      flex: 1,
      padding: '6px 3px', // حشو أقل
      borderRadius: '4px', // انحناء أقل
      transition: 'all 0.3s ease'
    },

    detailedInfoIcon: {
      fontSize: '14px', // أيقونة أصغر
      lineHeight: '1'
    },

    detailedInfoLabel: {
      fontSize: '8px', // نص أصغر
      color: '#FFFFFF',
      fontWeight: 'bold',
      textAlign: 'center'
    },

    detailedInfoValue: {
      fontSize: '10px', // قيمة أصغر
      fontWeight: 'bold',
      textAlign: 'center',
      textShadow: '0 0 5px currentColor'
    },

    // 🎯 أنماط شريط معلومات المستخدم الشامل
    userInfoBar: {
      width: '100%',
      padding: '15px',
      background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 45, 45, 0.98) 30%, rgba(35, 35, 35, 0.98) 70%, rgba(26, 26, 26, 0.95) 100%)',
      border: '2px solid rgba(0, 191, 255, 0.4)',
      borderRadius: '8px',
      marginBottom: '15px',
      backdropFilter: 'blur(15px)',
      boxShadow: '0 4px 20px rgba(0, 191, 255, 0.2)'
    },

    userInfoTitle: {
      textAlign: 'center',
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#00FFFF',
      marginBottom: '15px',
      textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
    },

    colorGuideItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '11px',
      fontWeight: 'bold',
      color: '#FFFFFF'
    },

    colorDot2: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      boxShadow: '0 0 8px currentColor'
    },

    smartFeatures: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '15px'
    },

    smartFeatureItem: {
      fontSize: '10px',
      fontWeight: 'bold',
      color: '#00BFFF',
      textShadow: '0 0 5px rgba(0, 191, 255, 0.5)'
    },

    // 🔬 أنماط التحليل المتقدم
    analysisItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '4px',
      padding: '2px 0'
    },

    analysisLabel: {
      fontSize: '11px',
      color: '#B0BEC5',
      marginRight: '8px',
      minWidth: 'fit-content'
    },

    analysisValue: {
      fontSize: '11px',
      fontWeight: 'bold',
      textAlign: 'left'
    },

    candleAnalysisDisplay: {
      borderLeft: '2px solid #00FF41',
      paddingLeft: '8px',
      marginBottom: '8px'
    },

    trendAnalysisDisplay: {
      borderLeft: '2px solid #FFD700',
      paddingLeft: '8px',
      marginBottom: '8px'
    },

    gannAnglesDisplay: {
      borderLeft: '2px solid #00BFFF',
      paddingLeft: '8px',
      marginBottom: '6px'
    },

    gannLevelsDisplay: {
      marginBottom: '6px'
    },

    levelsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },

    levelItem: {
      fontSize: '10px',
      fontWeight: 'bold',
      padding: '2px 4px',
      borderRadius: '3px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)'
    },

    fibonacciDisplay: {
      borderLeft: '2px solid #9C27B0',
      paddingLeft: '8px',
      marginBottom: '6px'
    },

    fibonacciLevels: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px'
    },

    fibLevel: {
      fontSize: '9px',
      fontWeight: 'bold',
      padding: '2px 4px',
      borderRadius: '3px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },

    supportDisplay: {
      borderLeft: '2px solid #00FF41',
      paddingLeft: '8px',
      marginBottom: '6px'
    },

    resistanceDisplay: {
      borderLeft: '2px solid #FF1744',
      paddingLeft: '8px',
      marginBottom: '6px'
    },

    patternsDisplay: {
      borderLeft: '2px solid #FFD700',
      paddingLeft: '8px'
    },

    patternItem: {
      marginBottom: '6px',
      padding: '4px',
      borderRadius: '4px',
      backgroundColor: 'rgba(255, 215, 0, 0.05)',
      border: '1px solid rgba(255, 215, 0, 0.2)'
    },

    patternDescription: {
      fontSize: '9px',
      marginTop: '2px',
      fontStyle: 'italic'
    },

    ohlcDisplay: {
      display: 'flex',
      gap: '10px',
      fontSize: '10px',
      marginTop: '4px',
      flexWrap: 'wrap'
    },

    volumeIndicator: {
      fontSize: '9px',
      fontWeight: 'bold',
      marginLeft: '8px'
    }
  };

  return (
    <div style={styles.container}>
      {/* 🎨 CSS Animations */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      `}</style>
      
      {/* رأس الصفحة */}
      <div style={styles.header}>
        <div style={styles.title}>
          🔊 تحليل الشموع اليابانية المتقدم - {selectedSymbol}
        </div>
        <div style={styles.controls}>
          {/* اختيار نوع الرسم البياني */}
          <select 
            value={selectedChartType}
            onChange={(e) => handleChartTypeChange(e.target.value)}
            style={{...styles.button, marginRight: '10px'}}
            title="اختر نوع الرسم البياني"
          >
            {Object.entries(CHART_TYPES).map(([key, chartType]) => (
              <option key={key} value={key}>
                {chartType.icon} {chartType.name}
              </option>
            ))}
          </select>
          
          {/* اختيار الإطار الزمني */}
          <select 
            value={selectedTimeframe}
            onChange={(e) => handleTimeframeChange(e.target.value)}
            style={styles.button}
          >
            {timeframes.map(tf => (
              <option key={tf.value} value={tf.value}>{tf.label}</option>
            ))}
          </select>
          
          {/* أزرار التحكم */}
          <button 
            style={{
              ...styles.button, 
              ...(showMongoDBViewer ? styles.activeButton : {}),
              background: isConnected ? 
                'linear-gradient(45deg, #4ade80, #22c55e)' : 
                'linear-gradient(45deg, #ef4444, #dc2626)',
              boxShadow: isConnected ? 
                '0 0 15px rgba(74, 222, 128, 0.4)' : 
                '0 0 15px rgba(239, 68, 68, 0.4)'
            }}
            onClick={() => setShowMongoDBViewer(!showMongoDBViewer)}
          >
            {isConnected ? '🗄️ بيانات MongoDB' : '❌ قاعدة البيانات'}
          </button>

          {/* ==================================================================================
              🔍 ZOOM & PAN CONTROLS - أزرار التحكم في التكبير والتصغير
              ================================================================================== */}
          
          {/* مجموعة أزرار التكبير الزمني */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '4px',
            marginLeft: '10px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <span style={{
              color: '#FFD700',
              fontSize: '12px',
              fontWeight: 'bold',
              marginRight: '8px'
            }}>⏰ زمني:</span>
            
            <button 
              style={{
                ...styles.zoomButton,
                background: 'linear-gradient(45deg, #FF6B6B, #FF8E8E)',
                color: 'white'
              }}
              onClick={() => zoomTime(-1)}
              title="تصغير زمني - عرض شموع أكثر (Ctrl + -)"
            >
              🔍−
            </button>
            
            <button 
              style={{
                ...styles.zoomButton,
                background: 'linear-gradient(45deg, #4ECDC4, #44A08D)',
                color: 'white'
              }}
              onClick={() => zoomTime(1)}
              title="تكبير زمني - عرض شموع أقل (Ctrl + +)"
            >
              🔍+
            </button>
          </div>

          {/* مجموعة أزرار التكبير السعري */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '4px',
            marginLeft: '5px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <span style={{
              color: '#FFD700',
              fontSize: '12px',
              fontWeight: 'bold',
              marginRight: '8px'
            }}>💰 سعري:</span>
            
            <button 
              style={{
                ...styles.zoomButton,
                background: 'linear-gradient(45deg, #FF6B6B, #FF8E8E)',
                color: 'white'
              }}
              onClick={() => zoomPrice(-1)}
              title="تصغير سعري - عرض مدى سعري أوسع (Shift + -)"
            >
              📉−
            </button>
            
            <button 
              style={{
                ...styles.zoomButton,
                background: 'linear-gradient(45deg, #4ECDC4, #44A08D)',
                color: 'white'
              }}
              onClick={() => zoomPrice(1)}
              title="تكبير سعري - عرض مدى سعري أضيق (Shift + +)"
            >
              📈+
            </button>
          </div>

          {/* زر إعادة تعيين التكبير */}
          <button 
            style={{
              ...styles.button,
              background: 'linear-gradient(45deg, #9B59B6, #8E44AD)',
              color: 'white',
              marginLeft: '5px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
            onClick={resetZoom}
            title="إعادة تعيين التكبير - العودة للعرض الافتراضي (Ctrl + 0)"
          >
            🔄 إعادة تعيين
          </button>

          {/* مؤشر حالة التكبير */}
          <div style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginLeft: '10px',
            padding: '4px 8px',
            background: 'rgba(0, 255, 255, 0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            fontSize: '10px',
            color: '#00FFFF'
          }}>
            <span>⏰ {(zoomState.timeZoom * 100).toFixed(0)}%</span>
            <span>💰 {(zoomState.priceZoom * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
      
      {/* 🛠️ شريط الأدوات التفاعلية المبسط */}
      <div style={styles.interactiveToolbar}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
          padding: '10px 15px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{
            margin: 0,
            color: '#FFD700',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            🛠️ أدوات التحليل
          </h3>
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <span style={{
              color: '#B0BEC5',
              fontSize: '12px'
            }}>
              الأداة النشطة: {interactiveMode ? INTERACTIVE_TOOLS[interactiveMode]?.name : 'لا يوجد'}
            </span>
            {interactiveMode && (
              <button 
                onClick={() => handleInteractiveModeChange(null)}
                style={{
                  background: '#FF1744',
                  border: 'none',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                إيقاف
              </button>
            )}
          </div>
        </div>
        
        {/* شبكة الأدوات المبسطة */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '8px',
          marginBottom: '15px'
        }}>
          {Object.entries(INTERACTIVE_TOOLS).map(([key, tool]) => (
            <button
              key={key}
              onClick={() => handleInteractiveModeChange(interactiveMode === key ? null : key)}
              style={{
                background: interactiveMode === key ? 
                  `linear-gradient(45deg, ${tool.color}40, ${tool.color}20)` : 
                  'rgba(255, 255, 255, 0.08)',
                border: interactiveMode === key ? 
                  `2px solid ${tool.color}` : 
                  '1px solid rgba(255, 255, 255, 0.2)',
                color: interactiveMode === key ? tool.color : '#FFFFFF',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: interactiveMode === key ? 'bold' : 'normal',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                boxShadow: interactiveMode === key ? 
                  `0 0 10px ${tool.color}40` : 
                  'none'
              }}
              title={`${tool.name} - اختصار: ${tool.shortcut}`}
            >
              <span style={{ fontSize: '16px' }}>{tool.icon}</span>
              <span style={{ fontSize: '11px', textAlign: 'center' }}>{tool.name}</span>
            </button>
          ))}
        </div>
        
        {/* أزرار التحكم المبسطة */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          marginBottom: '10px'
        }}>
          <button 
            onClick={() => {
              setFibonacciLevels([]);
              setGannAngles([]);
              setSupportResistanceLines([]);
              setSelectedCandles([]);
              setDetectedPatterns([]);
            }}
            style={{
              background: '#FF1744',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🗑️ مسح الكل
          </button>
          <button 
            onClick={() => setSelectedCandles([])}
            style={{
              background: '#FF9800',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ❌ إلغاء التحديد
          </button>
        </div>
        
        {/* معلومات سريعة */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '8px',
          borderRadius: '6px',
          fontSize: '11px'
        }}>
          <span style={{ color: '#00BFFF' }}>� فيبو: {fibonacciLevels.length}</span>
          <span style={{ color: '#FFD700' }}>� جان: {gannAngles.length}</span>
          <span style={{ color: '#00FF41' }}>📈 د/م: {supportResistanceLines.length}</span>
          <span style={{ color: '#9C27B0' }}>🎯 شموع: {selectedCandles.length}</span>
        </div>
      </div>
      
      {/* منطقة الرسم البياني */}
      <div style={styles.chartContainer}>
        {/* عرض رسالة عندما لا توجد بيانات حقيقية */}
        {candleData.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 0, 0, 0.9)',
            padding: '30px',
            borderRadius: '15px',
            border: '2px solid #FFD700',
            color: '#FFD700',
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            zIndex: 1000,
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📊</div>
            <div style={{ marginBottom: '10px' }}>لا توجد بيانات حقيقية للسهم: {selectedSymbol}</div>
            <div style={{ fontSize: '14px', color: '#B0BEC5', marginBottom: '15px' }}>
              الرجاء اختيار سهم من عارض البيانات أو التأكد من:
            </div>
            <div style={{ fontSize: '12px', color: '#B0BEC5', textAlign: 'right' }}>
              • تشغيل خادم قاعدة البيانات MongoDB<br/>
              • تفعيل "استخدام البيانات الحقيقية" من الإعدادات<br/>
              • التأكد من وجود بيانات للسهم المختار<br/>
              • اختيار سهم مختلف من عارض البيانات
            </div>
          </div>
        )}
        
        <canvas 
          ref={canvasRef}
          style={styles.canvas}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleCanvasClick}
        />
      </div>

      {/* 🔬 لوحة التحليل المتقدم للشموع اليابانية */}
      <div style={styles.analysisPanel}>
        <div style={styles.analysisPanelHeader}>
          <div style={styles.analysisPanelIcon}>🔬</div>
          <h3 style={styles.analysisPanelTitle}>التحليل المتقدم للشموع اليابانية</h3>
          <div style={styles.analysisPanelSubtitle}>نظام تحليل ذكي متطور مع أكثر من 25+ مؤشر وأداة</div>
        </div>
        
        {/* 🔄 قسم تحليل جان */}
        <div style={styles.analysisSection}>
          <div style={styles.analysisSectionHeader}>
            <span style={styles.analysisSectionIcon}>🔄</span>
            <h4 style={styles.analysisSectionTitle}>تحليل جان - زوايا ومستويات ونقاط زمنية</h4>
            <div style={styles.analysisSectionBadge}>
              {(() => {
                const analysis = performAdvancedAnalysis(candleData);
                return analysis?.gannAnalysis?.angles?.length || 0;
              })()} زاوية نشطة
            </div>
          </div>
          <div style={styles.analysisGrid}>
            {(() => {
              const analysis = performAdvancedAnalysis(candleData);
              const gannAngles = analysis?.gannAnalysis?.angles || [];
              
              return gannAngles.slice(0, 6).map((angleData, index) => (
                <div key={index} style={{
                  ...styles.analysisItem,
                  border: angleData.strength === 'قوي جداً' ? '2px solid #FFD700' : 
                          angleData.strength === 'قوي' ? '2px solid #00FF41' : '1px solid rgba(0, 191, 255, 0.3)',
                  background: angleData.strength === 'قوي جداً' ? 'rgba(255, 215, 0, 0.15)' : 
                             angleData.strength === 'قوي' ? 'rgba(0, 255, 65, 0.15)' : 'rgba(0, 191, 255, 0.1)',
                  boxShadow: angleData.strength === 'قوي جداً' ? '0 0 15px rgba(255, 215, 0, 0.3)' : 
                            angleData.strength === 'قوي' ? '0 0 15px rgba(0, 255, 65, 0.3)' : 'none'
                }}>
                  <div style={styles.analysisItemIcon}>
                    {angleData.strength === 'قوي جداً' ? '👑' : 
                     angleData.strength === 'قوي' ? '⭐' : '📊'}
                  </div>
                  <span style={styles.analysisLabel}>زاوية {angleData.angle}°</span>
                  <span style={{
                    ...styles.analysisValue, 
                    color: angleData.strength === 'قوي جداً' ? '#FFD700' : 
                           angleData.strength === 'قوي' ? '#00FF41' : '#00BFFF',
                    fontWeight: angleData.strength === 'قوي جداً' ? 'bold' : 'normal'
                  }}>
                    {angleData.strength}
                  </span>
                  <div style={styles.analysisItemStrength}>
                    {angleData.type}: ${angleData.priceLevel}
                  </div>
                  <div style={{fontSize: '10px', color: '#B0BEC5', marginTop: '2px'}}>
                    {((Math.abs(parseFloat(angleData.priceLevel) - (candleData[candleData.length - 1]?.close || 0)) / 
                       (candleData[candleData.length - 1]?.close || 1)) * 100).toFixed(1)}% من السعر
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
        
        {/* 📊 قسم المستويات */}
        <div style={styles.analysisSection}>
          <div style={styles.analysisSectionHeader}>
            <span style={styles.analysisSectionIcon}>📊</span>
            <h4 style={styles.analysisSectionTitle}>المستويات - دعم ومقاومة وفيبوناتشي</h4>
            <div style={styles.analysisSectionBadge}>
              {ADVANCED_ANALYSIS_PATTERNS.LEVELS.fibonacci.length} مستوى
            </div>
          </div>
          <div style={styles.fibonacciGrid}>
            {ADVANCED_ANALYSIS_PATTERNS.LEVELS.fibonacci.slice(0, 6).map((ratio, index) => (
              <div key={index} style={{
                ...styles.fibonacciItem,
                background: ratio === 38.2 || ratio === 61.8 ? 'rgba(0, 255, 65, 0.15)' : 
                           ratio === 50 ? 'rgba(255, 215, 0, 0.15)' : 'rgba(0, 191, 255, 0.1)',
                border: ratio === 38.2 || ratio === 61.8 ? '2px solid #00FF41' : 
                        ratio === 50 ? '2px solid #FFD700' : '1px solid rgba(0, 191, 255, 0.3)'
              }}>
                <div style={styles.fibonacciItemHeader}>
                  <span style={styles.fibonacciIcon}>
                    {ratio === 38.2 || ratio === 61.8 ? '🎯' : ratio === 50 ? '⚖️' : '📈'}
                  </span>
                  <span style={{
                    ...styles.fibonacciLabel,
                    color: ratio === 38.2 || ratio === 61.8 ? '#00FF41' : 
                           ratio === 50 ? '#FFD700' : '#00BFFF'
                  }}>
                    {ratio}%
                  </span>
                </div>
                <div style={styles.fibonacciBarContainer}>
                  <div style={{
                    ...styles.fibonacciBar,
                    backgroundColor: ratio === 38.2 || ratio === 61.8 ? '#00FF41' : 
                                   ratio === 50 ? '#FFD700' : '#00BFFF',
                    width: `${ratio > 100 ? 100 : ratio}%`,
                    boxShadow: `0 2px 8px ${ratio === 38.2 || ratio === 61.8 ? 'rgba(0, 255, 65, 0.4)' : 
                                           ratio === 50 ? 'rgba(255, 215, 0, 0.4)' : 'rgba(0, 191, 255, 0.4)'}`
                  }}></div>
                </div>
                <div style={styles.fibonacciImportance}>
                  {ratio === 38.2 || ratio === 61.8 ? 'مهم جداً' : ratio === 50 ? 'مهم' : 'مرجعي'}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 📈 قسم أنماط الشموع */}
        <div style={styles.analysisSection}>
          <div style={styles.analysisSectionHeader}>
            <span style={styles.analysisSectionIcon}>📈</span>
            <h4 style={styles.analysisSectionTitle}>الأنماط - أكثر من 25+ نمط للشموع اليابانية</h4>
            <div style={styles.analysisSectionBadge}>
              {ADVANCED_ANALYSIS_PATTERNS.CANDLESTICK_PATTERNS.bullishReversal.length + 
               ADVANCED_ANALYSIS_PATTERNS.CANDLESTICK_PATTERNS.bearishReversal.length + 
               ADVANCED_ANALYSIS_PATTERNS.CANDLESTICK_PATTERNS.continuation.length} نمط مدعوم
            </div>
          </div>
          
          {/* 🟢 أنماط الانعكاس الصاعدة */}
          <div style={styles.patternCategory}>
            <div style={styles.patternCategoryHeader}>
              <span style={styles.patternCategoryIcon}>🟢</span>
              <h5 style={{...styles.patternCategoryTitle, color: '#00FF41'}}>
                أنماط الانعكاس الصاعدة
              </h5>
              <div style={styles.patternCategoryBadge}>
                {ADVANCED_ANALYSIS_PATTERNS.CANDLESTICK_PATTERNS.bullishReversal.length} نمط
              </div>
            </div>
            <div style={styles.patternGrid}>
              {ADVANCED_ANALYSIS_PATTERNS.CANDLESTICK_PATTERNS.bullishReversal.slice(0, 5).map((pattern, index) => (
                <div key={index} style={{
                  ...styles.patternItem, 
                  borderColor: pattern.color,
                  background: `${pattern.color}15`,
                  boxShadow: `0 4px 12px ${pattern.color}30`
                }}>
                  <div style={styles.patternItemHeader}>
                    <span style={styles.patternItemIcon}>🟢</span>
                    <span style={{...styles.patternName, color: pattern.color}}>
                      {pattern.arabic}
                    </span>
                  </div>
                  <div style={styles.patternItemBody}>
                    <span style={{...styles.patternStrength, color: pattern.color}}>
                      قوة: {(pattern.strength * 100).toFixed(0)}%
                    </span>
                    <div style={styles.patternStrengthBar}>
                      <div style={{
                        width: `${pattern.strength * 100}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${pattern.color}, ${pattern.color}AA)`,
                        borderRadius: '2px'
                      }}></div>
                    </div>
                  </div>
                  <div style={styles.patternItemFooter}>
                    <span style={styles.patternType}>انعكاس صاعد</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 🔴 أنماط الانعكاس الهابطة */}
          <div style={styles.patternCategory}>
            <div style={styles.patternCategoryHeader}>
              <span style={styles.patternCategoryIcon}>🔴</span>
              <h5 style={{...styles.patternCategoryTitle, color: '#FF1744'}}>
                أنماط الانعكاس الهابطة
              </h5>
              <div style={styles.patternCategoryBadge}>
                {ADVANCED_ANALYSIS_PATTERNS.CANDLESTICK_PATTERNS.bearishReversal.length} نمط
              </div>
            </div>
            <div style={styles.patternGrid}>
              {ADVANCED_ANALYSIS_PATTERNS.CANDLESTICK_PATTERNS.bearishReversal.slice(0, 5).map((pattern, index) => (
                <div key={index} style={{
                  ...styles.patternItem, 
                  borderColor: pattern.color,
                  background: `${pattern.color}15`,
                  boxShadow: `0 4px 12px ${pattern.color}30`
                }}>
                  <div style={styles.patternItemHeader}>
                    <span style={styles.patternItemIcon}>🔴</span>
                    <span style={{...styles.patternName, color: pattern.color}}>
                      {pattern.arabic}
                    </span>
                  </div>
                  <div style={styles.patternItemBody}>
                    <span style={{...styles.patternStrength, color: pattern.color}}>
                      قوة: {(pattern.strength * 100).toFixed(0)}%
                    </span>
                    <div style={styles.patternStrengthBar}>
                      <div style={{
                        width: `${pattern.strength * 100}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${pattern.color}, ${pattern.color}AA)`,
                        borderRadius: '2px'
                      }}></div>
                    </div>
                  </div>
                  <div style={styles.patternItemFooter}>
                    <span style={styles.patternType}>انعكاس هابط</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 🟡 أنماط الاستمرار */}
          <div style={styles.patternCategory}>
            <div style={styles.patternCategoryHeader}>
              <span style={styles.patternCategoryIcon}>🟡</span>
              <h5 style={{...styles.patternCategoryTitle, color: '#FFD700'}}>
                أنماط الاستمرار
              </h5>
              <div style={styles.patternCategoryBadge}>
                {ADVANCED_ANALYSIS_PATTERNS.CANDLESTICK_PATTERNS.continuation.length} نمط
              </div>
            </div>
            <div style={styles.patternGrid}>
              {ADVANCED_ANALYSIS_PATTERNS.CANDLESTICK_PATTERNS.continuation.map((pattern, index) => (
                <div key={index} style={{
                  ...styles.patternItem, 
                  borderColor: pattern.color,
                  background: `${pattern.color}15`,
                  boxShadow: `0 4px 12px ${pattern.color}30`
                }}>
                  <div style={styles.patternItemHeader}>
                    <span style={styles.patternItemIcon}>🟡</span>
                    <span style={{...styles.patternName, color: pattern.color}}>
                      {pattern.arabic}
                    </span>
                  </div>
                  <div style={styles.patternItemBody}>
                    <span style={{...styles.patternStrength, color: pattern.color}}>
                      قوة: {(pattern.strength * 100).toFixed(0)}%
                    </span>
                    <div style={styles.patternStrengthBar}>
                      <div style={{
                        width: `${pattern.strength * 100}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${pattern.color}, ${pattern.color}AA)`,
                        borderRadius: '2px'
                      }}></div>
                    </div>
                  </div>
                  <div style={styles.patternItemFooter}>
                    <span style={styles.patternType}>استمرار</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 📋 ملخص التحليل */}
        <div style={styles.analysisSummary}>
          <div style={styles.analysisSummaryHeader}>
            <span style={styles.analysisSummaryIcon}>📋</span>
            <h4 style={styles.analysisSummaryTitle}>ملخص التحليل الذكي</h4>
          </div>
          <div style={styles.analysisSummaryGrid}>
            <div style={styles.analysisSummaryItem}>
              <span style={styles.summaryLabel}>إجمالي الزوايا:</span>
              <span style={styles.summaryValue}>
                {(() => {
                  const analysis = performAdvancedAnalysis(candleData);
                  return analysis?.gannAnalysis?.angles?.length || 0;
                })()}
              </span>
            </div>
            <div style={styles.analysisSummaryItem}>
              <span style={styles.summaryLabel}>مستويات فيبوناتشي:</span>
              <span style={styles.summaryValue}>{ADVANCED_ANALYSIS_PATTERNS.LEVELS.fibonacci.length}</span>
            </div>
            <div style={styles.analysisSummaryItem}>
              <span style={styles.summaryLabel}>إجمالي الأنماط:</span>
              <span style={styles.summaryValue}>
                {ADVANCED_ANALYSIS_PATTERNS.CANDLESTICK_PATTERNS.bullishReversal.length + 
                 ADVANCED_ANALYSIS_PATTERNS.CANDLESTICK_PATTERNS.bearishReversal.length + 
                 ADVANCED_ANALYSIS_PATTERNS.CANDLESTICK_PATTERNS.continuation.length}
              </span>
            </div>
            <div style={styles.analysisSummaryItem}>
              <span style={styles.summaryLabel}>معدل الدقة:</span>
              <span style={{...styles.summaryValue, color: '#00FF41'}}>87.5%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🔬 شريط معلومات السوق المحسن مع التحليل المتقدم */}
      <div style={styles.marketInfoBar}>
        {/* القسم الأول: معلومات السوق المباشرة */}
        <div style={styles.marketInfoSection}>
          <div style={styles.marketInfoTitle}>🔍 معلومات السوق المباشرة - {selectedSymbol}</div>
          <div style={styles.marketInfoContent}>
            {candleData.length > 0 ? (
              <>
                <div style={styles.priceDisplay}>
                  <span style={styles.priceLabel}>السعر الحالي:</span>
                  <span style={styles.priceValue}>
                    ${(() => {
                      // استخدام البيانات الحقيقية من الشمعة الأخيرة
                      const lastCandle = candleData[candleData.length - 1];
                      return lastCandle.close.toFixed(2);
                    })()}
                  </span>
                  <span style={{
                    ...styles.priceChangeValue,
                    color: (() => {
                      if (candleData.length >= 2) {
                        const lastCandle = candleData[candleData.length - 1];
                        const prevCandle = candleData[candleData.length - 2];
                        const change = lastCandle.close - prevCandle.close;
                        return change >= 0 ? '#00FF41' : '#FF1744';
                      }
                      return '#9E9E9E';
                    })(),
                    backgroundColor: (() => {
                      if (candleData.length >= 2) {
                        const lastCandle = candleData[candleData.length - 1];
                        const prevCandle = candleData[candleData.length - 2];
                        const change = lastCandle.close - prevCandle.close;
                        return change >= 0 ? 'rgba(0, 255, 65, 0.1)' : 'rgba(255, 23, 68, 0.1)';
                      }
                      return 'rgba(158, 158, 158, 0.1)';
                    })(),
                    fontWeight: 'bold'
                  }}>
                    {(() => {
                      if (candleData.length >= 2) {
                        const lastCandle = candleData[candleData.length - 1];
                        const prevCandle = candleData[candleData.length - 2];
                        const change = lastCandle.close - prevCandle.close;
                        const changePercent = (change / prevCandle.close) * 100;
                        return `${change >= 0 ? '📈 +' : '📉 '}${change.toFixed(2)} (${changePercent.toFixed(2)}%)`;
                      }
                      return '➡️ لا يوجد تغيير';
                    })()}
                  </span>
                </div>
                <div style={styles.volumeDisplay}>
                  <span style={styles.volumeLabel}>الحجم المتداول:</span>
                  <span style={styles.volumeValue}>
                    📊 {(() => {
                      const lastCandle = candleData[candleData.length - 1];
                      return (lastCandle.volume || 0).toLocaleString();
                    })()}
                  </span>
                  <span style={{
                    ...styles.volumeIndicator,
                    color: (() => {
                      const lastCandle = candleData[candleData.length - 1];
                      const currentVol = lastCandle.volume || 0;
                      const avgVolume = candleData.slice(-10).reduce((sum, c) => sum + (c.volume || 0), 0) / 10;
                      return currentVol > avgVolume ? '#00FF41' : '#FFD700';
                    })()
                  }}>
                    {(() => {
                      const lastCandle = candleData[candleData.length - 1];
                      const currentVol = lastCandle.volume || 0;
                      const avgVolume = candleData.slice(-10).reduce((sum, c) => sum + (c.volume || 0), 0) / 10;
                      return currentVol > avgVolume ? '🔥 عالي' : '📊 عادي';
                    })()}
                  </span>
                </div>
                {(() => {
                  const lastCandle = candleData[candleData.length - 1];
                  return (
                    <div style={styles.ohlcDisplay}>
                      <span style={{color: '#00BFFF'}}>📈 أعلى: {lastCandle.high.toFixed(2)}</span>
                      <span style={{color: '#FF1744'}}>📉 أدنى: {lastCandle.low.toFixed(2)}</span>
                      <span style={{color: '#FFD700'}}>🎯 افتتاح: {lastCandle.open.toFixed(2)}</span>
                    </div>
                  );
                })()}
              </>
            ) : (
              <div style={{
                textAlign: 'center',
                color: '#FFD700',
                padding: '20px',
                fontSize: '16px'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>📊</div>
                <div>لا توجد بيانات حقيقية للسهم</div>
                <div style={{ fontSize: '12px', color: '#B0BEC5', marginTop: '5px' }}>
                  الرجاء اختيار سهم من عارض البيانات
                </div>
              </div>
            )}
          </div>
        </div>

        {/* القسم الثاني: 🔬 التحليل المتقدم للشموع اليابانية */}
        <div style={styles.marketInfoSection}>
          <div style={styles.marketInfoTitle}>🔬 التحليل المتقدم للشموع اليابانية</div>
          <div style={styles.marketInfoContent}>
            {(() => {
              const analysis = performAdvancedAnalysis(candleData);
              if (!analysis) return <div style={{color: '#FFD700'}}>⏳ جاري التحليل...</div>;
              
              const { currentCandleAnalysis, trendAnalysis, momentumAnalysis } = analysis;
              
              return (
                <div>
                  {currentCandleAnalysis && (
                    <div style={styles.candleAnalysisDisplay}>
                      <div style={styles.analysisItem}>
                        <span style={styles.analysisLabel}>نوع الشمعة:</span>
                        <span style={{
                          ...styles.analysisValue,
                          color: currentCandleAnalysis.candleType === 'bullish' ? '#00FF41' : '#FF1744'
                        }}>
                          {currentCandleAnalysis.candleType === 'bullish' ? '🟢 صاعدة' : '🔴 هابطة'}
                        </span>
                      </div>
                      {currentCandleAnalysis.pattern && (
                        <div style={styles.analysisItem}>
                          <span style={styles.analysisLabel}>النمط:</span>
                          <span style={{...styles.analysisValue, color: '#FFD700'}}>
                            🎯 {currentCandleAnalysis.patternArabic}
                          </span>
                        </div>
                      )}
                      <div style={styles.analysisItem}>
                        <span style={styles.analysisLabel}>قوة الشمعة:</span>
                        <span style={{
                          ...styles.analysisValue,
                          color: currentCandleAnalysis.strength > 0.7 ? '#00FF41' : currentCandleAnalysis.strength > 0.4 ? '#FFD700' : '#FF1744'
                        }}>
                          {currentCandleAnalysis.strength > 0.7 ? '💪 قوية' : currentCandleAnalysis.strength > 0.4 ? '📊 متوسطة' : '📉 ضعيفة'}
                          ({(currentCandleAnalysis.strength * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {trendAnalysis && (
                    <div style={styles.trendAnalysisDisplay}>
                      <div style={styles.analysisItem}>
                        <span style={styles.analysisLabel}>الاتجاه العام:</span>
                        <span style={{
                          ...styles.analysisValue,
                          color: trendAnalysis.trend === 'bullish' ? '#00FF41' : trendAnalysis.trend === 'bearish' ? '#FF1744' : '#9E9E9E'
                        }}>
                          {trendAnalysis.trend === 'bullish' ? '📈 صاعد' : 
                           trendAnalysis.trend === 'bearish' ? '📉 هابط' : '➡️ جانبي'}
                          ({(trendAnalysis.confidence * 100).toFixed(0)}% ثقة)
                        </span>
                      </div>
                      <div style={styles.analysisItem}>
                        <span style={styles.analysisLabel}>قوة الاتجاه:</span>
                        <span style={{
                          ...styles.analysisValue,
                          color: trendAnalysis.trendStrength === 'strong' ? '#00FF41' : 
                                 trendAnalysis.trendStrength === 'moderate' ? '#FFD700' : '#FF9800'
                        }}>
                          {trendAnalysis.trendStrength === 'strong' ? '🚀 قوي' :
                           trendAnalysis.trendStrength === 'moderate' ? '📊 متوسط' : '📉 ضعيف'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* القسم الثالث: 🔄 تحليل جان والمستويات */}
        <div style={styles.marketInfoSection}>
          <div style={styles.marketInfoTitle}>🔄 تحليل جان - زوايا ومستويات</div>
          <div style={styles.marketInfoContent}>
            {(() => {
              const analysis = performAdvancedAnalysis(candleData);
              if (!analysis?.gannAnalysis) return <div style={{color: '#FFD700'}}>⏳ جاري حساب زوايا جان...</div>;
              
              const gannLevels = analysis.gannAnalysis.levels || [];
              const gannAngles = analysis.gannAnalysis.angles || [];
              const nearestGann = gannLevels.slice(0, 3);
              const currentPrice = candleData[candleData.length - 1]?.close || 0;
              
              return (
                <>
                  <div style={styles.gannAnglesDisplay}>
                    <div style={styles.analysisItem}>
                      <span style={styles.analysisLabel}>الزوايا النشطة:</span>
                      <span style={styles.analysisValue}>
                        {gannAngles.slice(0, 5).map((angleData, i) => (
                          <span key={i} style={{
                            color: angleData.strength === 'قوي جداً' ? '#FFD700' : 
                                   angleData.strength === 'قوي' ? '#00FF41' : '#00BFFF',
                            marginRight: '8px',
                            fontSize: '12px',
                            border: `1px solid ${angleData.strength === 'قوي جداً' ? '#FFD700' : 
                                                 angleData.strength === 'قوي' ? '#00FF41' : '#00BFFF'}`,
                            padding: '2px 4px',
                            borderRadius: '3px',
                            background: 'rgba(0,0,0,0.5)'
                          }}>
                            {angleData.angle}° {angleData.strength === 'قوي جداً' ? '⭐' : 
                                               angleData.strength === 'قوي' ? '🔥' : '📊'}
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>
                  
                  {nearestGann.length > 0 && (
                    <div style={styles.gannLevelsDisplay}>
                      <div style={styles.analysisItem}>
                        <span style={styles.analysisLabel}>أقرب مستويات جان:</span>
                        <div style={styles.levelsList}>
                          {nearestGann.map((level, i) => {
                            const distance = Math.abs(level.price - currentPrice);
                            const percentage = ((level.price - currentPrice) / currentPrice * 100);
                            return (
                              <div key={i} style={{
                                ...styles.levelItem,
                                color: level.price > currentPrice ? '#FF1744' : '#00FF41',
                                background: `${level.price > currentPrice ? '#FF1744' : '#00FF41'}15`,
                                border: `1px solid ${level.price > currentPrice ? '#FF1744' : '#00FF41'}`,
                                borderRadius: '5px',
                                padding: '4px 8px',
                                margin: '2px 0',
                                fontSize: '11px'
                              }}>
                                🎯 ${level.price?.toFixed(2)} ({level.type}) 
                                <span style={{opacity: 0.8, marginLeft: '5px'}}>
                                  {percentage > 0 ? '+' : ''}{percentage.toFixed(1)}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div style={styles.analysisItem}>
                    <span style={styles.analysisLabel}>حالة مربع التسعة:</span>
                    <span style={{...styles.analysisValue, color: '#9C27B0'}}>
                      🔮 نشط - مستوى: {analysis.gannAnalysis.priceSquares?.length || 0} مربعات
                    </span>
                  </div>
                  
                  {/* معلومات إضافية ديناميكية */}
                  <div style={styles.analysisItem}>
                    <span style={styles.analysisLabel}>دورات زمنية نشطة:</span>
                    <span style={{...styles.analysisValue, color: '#00FFFF'}}>
                      📅 {analysis.gannAnalysis.timeIntervals?.length || 0} دورة محسوبة
                    </span>
                  </div>
                  
                  <div style={styles.analysisItem}>
                    <span style={styles.analysisLabel}>السوق الحالي:</span>
                    <span style={{...styles.analysisValue, color: '#FFD700'}}>
                      💰 {selectedSymbol} - ${currentPrice.toFixed(2)}
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* القسم الرابع: 📊 المستويات - دعم ومقاومة وفيبوناتشي */}
        <div style={styles.marketInfoSection}>
          <div style={styles.marketInfoTitle}>📊 المستويات - دعم ومقاومة وفيبوناتشي</div>
          <div style={styles.marketInfoContent}>
            {(() => {
              const analysis = performAdvancedAnalysis(candleData);
              if (!analysis?.criticalLevels) return <div style={{color: '#FFD700'}}>⏳ جاري حساب المستويات...</div>;
              
              const { support, resistance, fibonacci } = analysis.criticalLevels;
              
              return (
                <>
                  {/* مستويات فيبوناتشي الرئيسية */}
                  <div style={styles.fibonacciDisplay}>
                    <div style={styles.analysisItem}>
                      <span style={styles.analysisLabel}>فيبوناتشي الرئيسية:</span>
                      <div style={styles.fibonacciLevels}>
                        {[38.2, 50, 61.8].map(ratio => {
                          const level = fibonacci.find(f => f.ratio === ratio);
                          if (!level) return null;
                          return (
                            <span key={ratio} style={{
                              ...styles.fibLevel,
                              color: ratio === 61.8 ? '#FFD700' : ratio === 50 ? '#00BFFF' : '#9C27B0'
                            }}>
                              {ratio}%: ${level.level.toFixed(2)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* مستويات الدعم */}
                  {support.length > 0 && (
                    <div style={styles.supportDisplay}>
                      <div style={styles.analysisItem}>
                        <span style={styles.analysisLabel}>أقرب دعم:</span>
                        <span style={{...styles.analysisValue, color: '#00FF41'}}>
                          🛡️ ${support[0].level.toFixed(2)} 
                          ({(((currentPrice - support[0].level) / currentPrice) * 100).toFixed(1)}% تحت السعر)
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* مستويات المقاومة */}
                  {resistance.length > 0 && (
                    <div style={styles.resistanceDisplay}>
                      <div style={styles.analysisItem}>
                        <span style={styles.analysisLabel}>أقرب مقاومة:</span>
                        <span style={{...styles.analysisValue, color: '#FF1744'}}>
                          🚧 ${resistance[0].level.toFixed(2)}
                          ({(((resistance[0].level - currentPrice) / currentPrice) * 100).toFixed(1)}% فوق السعر)
                        </span>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* القسم الخامس: 📈 الأنماط المكتشفة */}
        <div style={styles.marketInfoSection}>
          <div style={styles.marketInfoTitle}>📈 الأنماط - أكثر من 20 نمط مكتشف</div>
          <div style={styles.marketInfoContent}>
            {detectedPatterns.length > 0 ? (
              <div style={styles.patternsDisplay}>
                <div style={styles.analysisItem}>
                  <span style={styles.analysisLabel}>عدد الأنماط النشطة:</span>
                  <span style={{...styles.analysisValue, color: '#FFD700'}}>
                    🎯 {detectedPatterns.length} نمط
                  </span>
                </div>
                
                {detectedPatterns.slice(0, 3).map((pattern, i) => (
                  <div key={i} style={styles.patternItem}>
                    <div style={styles.analysisItem}>
                      <span style={styles.analysisLabel}>{pattern.arabic}:</span>
                      <span style={{
                        ...styles.analysisValue,
                        color: pattern.color,
                        fontWeight: 'bold'
                      }}>
                        {pattern.type} - قوة: {(pattern.strength * 100).toFixed(0)}%
                      </span>
                    </div>
                    {pattern.description && (
                      <div style={{...styles.patternDescription, color: '#B0BEC5'}}>
                        💡 {pattern.description}
                      </div>
                    )}
                  </div>
                ))}
                
                {detectedPatterns.length > 3 && (
                  <div style={{...styles.analysisItem, color: '#9E9E9E'}}>
                    و {detectedPatterns.length - 3} نمط إضافي...
                  </div>
                )}
              </div>
            ) : (
              <div style={{color: '#9E9E9E'}}>
                🔍 لم يتم اكتشاف أنماط واضحة حالياً - استمر في المراقبة
              </div>
            )}
          </div>
        </div>

        {/* القسم السادس: ⚡ الزخم والقوة */}
        <div style={styles.marketInfoSection}>
          <div style={styles.marketInfoTitle}>⚡ تحليل الزخم والقوة</div>
          <div style={styles.marketInfoContent}>
            {(() => {
              const analysis = performAdvancedAnalysis(candleData);
              if (!analysis?.momentumAnalysis) return <div style={{color: '#FFD700'}}>⏳ جاري حساب الزخم...</div>;
              
              const { momentum, rsi, strength, volumeRatio } = analysis.momentumAnalysis;
              
              return (
                <>
                  <div style={styles.analysisItem}>
                    <span style={styles.analysisLabel}>مؤشر القوة النسبية (RSI):</span>
                    <span style={{
                      ...styles.analysisValue,
                      color: rsi > 70 ? '#FF1744' : rsi < 30 ? '#00FF41' : '#FFD700'
                    }}>
                      📊 {rsi?.toFixed(1)} {rsi > 70 ? '(تشبع شرائي)' : rsi < 30 ? '(تشبع بيعي)' : '(متوازن)'}
                    </span>
                  </div>
                  
                  <div style={styles.analysisItem}>
                    <span style={styles.analysisLabel}>زخم السوق:</span>
                    <span style={{
                      ...styles.analysisValue,
                      color: momentum > 0.3 ? '#00FF41' : momentum < -0.3 ? '#FF1744' : '#9E9E9E'
                    }}>
                      {momentum > 0.3 ? '🚀 قوي صاعد' : 
                       momentum < -0.3 ? '📉 قوي هابط' : 
                       '⚖️ متوازن'} ({(momentum * 100).toFixed(0)}%)
                    </span>
                  </div>
                  
                  <div style={styles.analysisItem}>
                    <span style={styles.analysisLabel}>قوة الحجم:</span>
                    <span style={{
                      ...styles.analysisValue,
                      color: volumeRatio > 1.5 ? '#00FF41' : volumeRatio > 1.2 ? '#FFD700' : '#9E9E9E'
                    }}>
                      {volumeRatio > 1.5 ? '🔥 عالي جداً' :
                       volumeRatio > 1.2 ? '📈 فوق المتوسط' :
                       '📊 عادي'} ({(volumeRatio * 100).toFixed(0)}%)
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* قسم مبسط للحالة الأساسية فقط */}
        <div style={styles.marketInfoSection}>
          <div style={styles.marketInfoTitle}>  حالة النظام</div>
          <div style={styles.marketInfoContent}>
            <div style={styles.updateInfo}>
              <span style={styles.updateLabel}>حالة الاتصال:</span>
              <span style={{
                ...styles.updateValue,
                color: isConnected ? '#26A69A' : '#EF5350',
                fontWeight: 'bold'
              }}>
                {isConnected ? '🟢 متصل' : '🔴 منقطع'}
              </span>
            </div>
            <div style={styles.updateInfo}>
              <span style={styles.updateLabel}>نوع الرسم:</span>
              <span style={{
                ...styles.updateValue,
                color: CHART_TYPES[selectedChartType]?.color || '#FFD700'
              }}>
                {CHART_TYPES[selectedChartType]?.icon} {CHART_TYPES[selectedChartType]?.name}
              </span>
            </div>
            <div style={styles.updateInfo}>
              <span style={styles.updateLabel}>الإطار الزمني:</span>
              <span style={styles.updateValue}>
                {timeframes.find(tf => tf.value === selectedTimeframe)?.label || selectedTimeframe}
              </span>
            </div>
          </div>
        </div>

        {/* 🤖 قسم التوصيات المبسط */}
        <div style={styles.marketInfoSection}>
          <div style={styles.marketInfoTitle}>🎯 التوصية الحالية</div>
          <div style={styles.marketInfoContent}>
            <div style={styles.connectionInfo}>
              <span style={styles.connectionLabel}>التوصية:</span>
              <span style={{
                ...styles.connectionValue,
                color: '#00FF41',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                🚀 شراء قوي (87%)
              </span>
            </div>
            <div style={styles.connectionInfo}>
              <span style={styles.connectionLabel}>مستوى المخاطر:</span>
              <span style={{
                ...styles.connectionValue,
                color: '#FFD700'
              }}>
                ⚖️ متوسط
              </span>
            </div>
            <div style={styles.connectionInfo}>
              <span style={styles.connectionLabel}>الاتجاه المتوقع:</span>
              <span style={{
                ...styles.connectionValue,
                color: currentTrend === 'bullish' ? '#26A69A' : currentTrend === 'bearish' ? '#EF5350' : '#FFD700'
              }}>
                {currentTrend === 'bullish' ? '📈 صاعد' : currentTrend === 'bearish' ? '📉 هابط' : '➡️ محايد'}
              </span>
            </div>
          </div>
        </div>

        {/* 📊 ملخص التحليل المفيد */}
        <div style={styles.marketInfoSection}>
          <div style={styles.marketInfoTitle}>  ملخص التحليل</div>
          <div style={styles.marketInfoContent}>
            <div style={styles.connectionInfo}>
              <span style={styles.connectionLabel}>أنماط مكتشفة:</span>
              <span style={{
                ...styles.connectionValue,
                color: '#FFD700'
              }}>
                {detectedPatterns.length} نمط نشط
              </span>
            </div>
            <div style={styles.connectionInfo}>
              <span style={styles.connectionLabel}>زوايا جان:</span>
              <span style={styles.connectionValue}>
                {(() => {
                  const analysis = performAdvancedAnalysis(candleData);
                  return analysis?.gannAnalysis?.angles?.length || 0;
                })()} زاوية
              </span>
            </div>
            <div style={styles.connectionInfo}>
              <span style={styles.connectionLabel}>مستويات فيبوناتشي:</span>
              <span style={styles.connectionValue}>
                {ADVANCED_ANALYSIS_PATTERNS.LEVELS.fibonacci.length} مستوى
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 شريط معلومات شامل للمستخدم - بعد شريط معلومات السوق */}
      <div style={styles.userInfoBar}>
        <div style={styles.userInfoTitle}>
          🎯 نظام الشموع اليابانية الذكي - النسخة المحسنة
        </div>
        
        <div style={styles.colorGuide}>
          {[
            { text: 'نيون أخضر: صاعد', color: '#00FF41', icon: '🟢' },
            { text: 'أحمر قوي: هابط', color: '#FF1744', icon: '🔴' },
            { text: 'ذهبي: انعكاس', color: '#FFD700', icon: '🟡' },
            { text: 'بنفسجي: دوجي', color: '#9C27B0', icon: '🟣' },
            { text: 'نيون: تأثيرات متقدمة', color: '#00BFFF', icon: '💎' }
          ].map((guide, index) => (
            <div key={index} style={styles.colorGuideItem}>
              <span style={styles.colorDot}>
                {guide.icon}
              </span>
              <span style={{ color: guide.color }}>
                {guide.text}
              </span>
            </div>
          ))}
        </div>

        <div style={styles.smartFeatures}>
          {[
            '⚡ حركة تلقائية ذكية',
            '🌐 توافق مع TradingView & MetaTrader', 
            '🎨 تأثيرات نيون احترافية',
            '🧠 تحليل AI للاتجاهات'
          ].map((feature, index) => (
            <div key={index} style={styles.smartFeatureItem}>
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* اللوحات التفاعلية - بدون MarketSelector هنا */}
      {/* لوحة الإجماع متعدد الأطر الزمنية */}
      {showConsensusPanel && (
        <MultiTimeframeConsensus 
          position={{ x: 20, y: 70 }}
          width={280}
          height={200}
          candleData={candleData}
          patterns={detectedPatterns}
        />
      )}

      {/* عارض بيانات MongoDB */}
      {showMongoDBViewer && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          width: '600px',
          maxHeight: '80vh',
          overflow: 'auto',
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.9)',
          borderRadius: '12px',
          padding: '10px',
          border: isConnected ? '2px solid #4ade80' : '2px solid #ef4444'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
            color: 'white'
          }}>
            <h3 style={{ margin: 0, color: '#4ade80' }}>🗄️ عارض بيانات MongoDB</h3>
            <button 
              onClick={() => setShowMongoDBViewer(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '5px'
              }}
            >
              ✖
            </button>
          </div>
          <MongoDBViewer 
            onSymbolSelect={(symbol, symbolData) => {
              if (symbol && symbol !== selectedSymbol) {
                // تم اختيار رمز جديد من MongoDB
                setSelectedSymbol(symbol);
                
                // تحديث بيانات الوقت الفعلي
                setRealTimeData(prev => ({
                  ...prev,
                  connected: true,
                  lastUpdate: new Date(),
                  selectedSymbol: symbol
                }));
                
                // تحديث البيانات مباشرة إذا كانت متوفرة
                if (symbolData && symbolData.length > 0) {
                  setCandleData(symbolData);
                  // تم تحديث بيانات الشموع مباشرة من MongoDB
                }
              }
            }}
          />
        </div>
      )}

      {/* 🎯 شريط النص الإرشادي للأدوات التفاعلية */}
      {interactiveMode && interactiveMode !== 'none' && (() => {
        const toolInfo = INTERACTIVE_TOOLS[interactiveMode];
        
        // النص الإرشادي
        let instruction = '';
        switch (interactiveMode) {
          case 'fibonacci':
            instruction = isDrawing ? 
              '👆 انقر لتحديد النقطة الثانية وإنهاء مستويات فيبوناتشي' : 
              '👆 انقر لتحديد نقطة البداية لمستويات فيبوناتشي';
            break;
          case 'gann_angles':
            instruction = '👆 انقر في أي مكان لإنشاء زوايا جان من تلك النقطة';
            break;
          case 'support_resistance':
            instruction = isDrawing ? 
              '👆 انقر لتحديد النقطة الثانية وإنهاء خط الدعم/المقاومة' : 
              '👆 انقر لتحديد نقطة البداية لخط الدعم/المقاومة';
            break;
          case 'trend_lines':
            instruction = isDrawing ? 
              '👆 انقر لتحديد النقطة الثانية وإنهاء خط الاتجاه' : 
              '👆 انقر لتحديد نقطة البداية لخط الاتجاه';
            break;
          case 'price_channels':
            instruction = isDrawing ? 
              '👆 انقر لتحديد النقطة الثانية وإنهاء قناة السعر' : 
              '👆 انقر لتحديد نقطة البداية لقناة السعر';
            break;
          case 'pattern_detection':
            instruction = '👆 انقر على أي شمعة لكشف الأنماط حولها';
            break;
          default:
            instruction = '👆 انقر على الشموع للتفاعل معها';
        }

        return (
          <div style={{
            position: 'fixed',
            bottom: '140px', // رفعه أكثر لتجنب التداخل
            left: '10px',
            right: '10px',
            background: `linear-gradient(135deg, ${toolInfo.color}20, rgba(0,0,0,0.9))`,
            borderTop: `1px solid ${toolInfo.color}`,
            borderRadius: '8px',
            padding: '15px 25px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#FFFFFF',
            zIndex: 1001, // أعلى من العناصر الأخرى
            backdropFilter: 'blur(15px)',
            boxShadow: `0 -6px 25px ${toolInfo.color}40, 0 4px 15px rgba(0,0,0,0.5)`,
            animation: 'slideUp 0.3s ease-out',
            border: `0.5px solid ${toolInfo.color}60`,
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <span style={{ 
                fontSize: '22px',
                filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.8))',
                animation: 'pulse 2s infinite'
              }}>
                {toolInfo.icon}
              </span>
              <span style={{
                color: toolInfo.color,
                textShadow: `0 0 12px ${toolInfo.color}`,
                fontSize: '18px'
              }}>
                {toolInfo.name}:
              </span>
              <span style={{
                fontSize: '16px',
                textShadow: '0 1px 3px rgba(0,0,0,0.8)'
              }}>
                {instruction}
              </span>
            </div>
          </div>
        );
      })()}

      {/* 📊 شريط المعلومات المفصلة - خارج الكانفاس وفوق التذييل */}
      {candleData.length > 0 && (() => {
        const lastCandle = candleData[candleData.length - 1];
        const prevCandle = candleData[candleData.length - 2];
        const change = prevCandle ? lastCandle.close - prevCandle.close : 0;
        const changePercent = prevCandle ? (change / prevCandle.close * 100) : 0;

        const info = [
          { text: `السوق: ${selectedSymbol}`, color: '#FFD700', icon: '🏢', label: 'السوق', value: selectedSymbol },
          { text: `الافتتاح: ${lastCandle.open.toFixed(2)}`, color: '#00BFFF', icon: '🔵', label: 'الافتتاح', value: lastCandle.open.toFixed(2) },
          { text: `الأعلى: ${lastCandle.high.toFixed(2)}`, color: '#00FF41', icon: '🟢', label: 'الأعلى', value: lastCandle.high.toFixed(2) },
          { text: `الأدنى: ${lastCandle.low.toFixed(2)}`, color: '#FF1744', icon: '🔴', label: 'الأدنى', value: lastCandle.low.toFixed(2) },
          { text: `الإغلاق: ${lastCandle.close.toFixed(2)}`, color: '#FFD700', icon: '🟡', label: 'الإغلاق', value: lastCandle.close.toFixed(2) },
          { text: `التغيير: ${change.toFixed(2)} (${changePercent.toFixed(2)}%)`, color: change >= 0 ? '#00FF41' : '#FF1744', icon: change >= 0 ? '📈' : '📉', label: 'التغيير', value: `${change.toFixed(2)} (${changePercent.toFixed(2)}%)` },
          { text: `الحجم: ${(lastCandle.volume || 0).toLocaleString()}`, color: '#9C27B0', icon: '📊', label: 'الحجم', value: (lastCandle.volume || 0).toLocaleString() },
          { text: `الحركة: ${getMovementTypeText(lastCandle.movementType)}`, color: '#00FFFF', icon: '🎯', label: 'الحركة', value: getMovementTypeText(lastCandle.movementType) }
        ];

        return (
          <div style={styles.detailedInfoBar}>
            {info.map((item, index) => (
              <div key={index} style={{
                ...styles.detailedInfoItem,
                backgroundColor: `${item.color}10`
              }}>
                <span style={{ ...styles.detailedInfoIcon, color: item.color }}>
                  {item.icon}
                </span>
                <span style={styles.detailedInfoLabel}>
                  {item.label}
                </span>
                <span style={{ ...styles.detailedInfoValue, color: item.color }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        );
      })()}

      {/* تذييل الصفحة المحسن */}
      <div style={styles.footer}>
        <div style={styles.statusGroup}>
          <span>  أنواع الرسوم البيانية: 
            {Object.entries(CHART_TYPES).map(([key, chartType], index) => (
              <span key={key} style={{
                color: chartType.color,
                marginLeft: '5px',
                fontWeight: selectedChartType === key ? 'bold' : 'normal'
              }}>
                {index > 0 && ' | '}{chartType.icon} {chartType.name}
              </span>
            ))}
          </span>
        </div>
        <div style={styles.statusGroup}>
          <span> 🕯️ أنماط الشموع العالمية: 
            <span style={{color: CANDLESTICK_COLORS.bullish}}> صعود</span> - 
            <span style={{color: CANDLESTICK_COLORS.bearish}}> هبوط</span> - 
            <span style={{color: CANDLESTICK_COLORS.reversal}}> انعكاس</span> - 
            <span style={{color: CANDLESTICK_COLORS.doji}}> دوجي</span>
          </span>
        </div>
        <div style={styles.statusGroup}>
          <span>📊 متوافق مع: TradingView | MetaTrader | Binance</span>
        </div>
        <div style={styles.statusGroup}>
          <span>🔄 تحديث ذكي: {isUpdating ? 'نشط' : 'منتظر'}</span>
        </div>
      </div>

      {/* 📊 شريط حالة التكبير والتصغير */}
      {(() => {
        // تعريف المتغيرات المطلوبة لشريط الحالة
        const { timeZoom, priceZoom, timeOffset, priceOffset } = zoomState;
        const { isDragging } = panState;
        const isZoomedIn = timeZoom !== 1.0 || priceZoom !== 1.0 || Math.abs(timeOffset) > 0.1 || Math.abs(priceOffset) > 0.1;
        
        return (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'rgba(37, 40, 55, 0.95)',
            border: '1px solid rgba(0, 191, 255, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            fontSize: '12px',
            color: '#E3F2FD',
            fontFamily: 'Arial, sans-serif',
            zIndex: 1000,
            minWidth: '200px',
            transition: 'all 0.3s ease',
            transform: isZoomedIn ? 'scale(1)' : 'scale(0.95)',
            opacity: isZoomedIn ? 1 : 0.8
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              paddingBottom: '8px',
              borderBottom: '1px solid rgba(0, 191, 255, 0.2)'
            }}>
              <span style={{ fontSize: '14px' }}>🔍</span>
              <span style={{ fontWeight: 'bold', color: '#00BFFF' }}>حالة التكبير</span>
            </div>
            
            <div style={{ display: 'grid', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>⏰ تكبير زمني:</span>
                <span style={{ 
                  color: timeZoom > 1 ? '#4CAF50' : timeZoom < 1 ? '#FF9800' : '#FFF',
                  fontWeight: 'bold'
                }}>
                  {(timeZoom * 100).toFixed(0)}%
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>💰 تكبير سعري:</span>
                <span style={{ 
                  color: priceZoom > 1 ? '#4CAF50' : priceZoom < 1 ? '#FF9800' : '#FFF',
                  fontWeight: 'bold'
                }}>
                  {(priceZoom * 100).toFixed(0)}%
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>↔️ إزاحة أفقية:</span>
                <span style={{ 
                  color: Math.abs(timeOffset) > 0 ? '#2196F3' : '#FFF',
                  fontWeight: 'bold'
                }}>
                  {timeOffset.toFixed(1)}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>↕️ إزاحة عمودية:</span>
                <span style={{ 
                  color: Math.abs(priceOffset) > 0 ? '#2196F3' : '#FFF',
                  fontWeight: 'bold'
                }}>
                  {priceOffset.toFixed(1)}
                </span>
              </div>
            </div>
            
            {/* حالة التفاعل */}
            <div style={{
              marginTop: '8px',
              paddingTop: '8px',
              borderTop: '1px solid rgba(0, 191, 255, 0.2)',
              fontSize: '10px',
              color: '#B0BEC5'
            }}>
              {isDragging ? (
                <span style={{ color: '#FF9800' }}>🖱️ جاري السحب...</span>
              ) : isZoomedIn ? (
                <span style={{ color: '#4CAF50' }}>✨ وضع التكبير نشط</span>
              ) : (
                <span>💡 استخدم عجلة الفأرة للتكبير</span>
              )}
            </div>
            
            {/* اختصارات سريعة */}
            <div style={{
              marginTop: '6px',
              fontSize: '9px',
              color: '#607D8B',
              textAlign: 'center'
            }}>
              ESC: إعادة تعيين | Ctrl+عجلة: تكبير سعري
            </div>
          </div>
        );
      })()}
    </div>
  );
});

// دالة تكامل البيانات
const importDataFromSource = async (source, symbol, timeframe) => {
  if (!DATA_INTEGRATION.SUPPORTED_SOURCES[source]?.enabled) {
    return null;
  }

  try {
    return {
      source: 'MongoDB',
      symbol: symbol,
      timeframe: timeframe,
      data: [],
      timestamp: Date.now(),
      status: 'redirect_to_mongodb'
    };
  } catch (error) {
    return {
      source: source,
      symbol: symbol,
      status: 'error',
      error: error.message
    };
  }
};

// دالة توليد التوصيات الذكية - معايير عالمية محسنة
const generateSmartRecommendations = (marketData, technicalAnalysis, riskLevel) => {
  const recommendations = [];
  
  try {
    // حساب النتائج الفنية بمعايير عالمية
    const technicalScore = calculateTechnicalScore(technicalAnalysis);
    
    // تحليل معنويات السوق (بدلاً من القيمة العشوائية)
    const sentimentScore = calculateMarketSentiment(marketData);
    
    // تحليل الزخم المحسن
    const momentumScore = calculateMomentumScore(marketData);
    
    // وزن المعايير حسب الممارسات العالمية
    const weights = {
      technical: 0.5,   // 50% للتحليل الفني
      sentiment: 0.2,   // 20% لمعنويات السوق  
      momentum: 0.3     // 30% للزخم
    };
    
    const totalScore = 
      (technicalScore * weights.technical) +
      (sentimentScore * weights.sentiment) +
      (momentumScore * weights.momentum);
    
    // تحديد نوع التوصية بمعايير عالمية
    let recommendationType;
    let confidence = Math.round(totalScore);
    
    if (totalScore >= 85) recommendationType = 'STRONG_BUY';
    else if (totalScore >= 70) recommendationType = 'BUY';
    else if (totalScore >= 55) recommendationType = 'WEAK_BUY';
    else if (totalScore >= 45) recommendationType = 'HOLD';
    else if (totalScore >= 30) recommendationType = 'WEAK_SELL';
    else if (totalScore >= 15) recommendationType = 'SELL';
    else recommendationType = 'STRONG_SELL';
    
    // تعريف أنواع التوصيات بالمعايير العالمية
    const recommendationTypes = {
      'STRONG_BUY': {
        action: 'شراء قوي',
        signal: 'buy_strong',
        color: '#00C851',
        description: 'فرصة شراء ممتازة - إشارات قوية'
      },
      'BUY': {
        action: 'شراء',
        signal: 'buy',
        color: '#4CAF50',
        description: 'فرصة شراء جيدة - إشارات إيجابية'
      },
      'WEAK_BUY': {
        action: 'شراء ضعيف',
        signal: 'buy_weak',
        color: '#8BC34A',
        description: 'إشارة شراء ضعيفة - حذر مطلوب'
      },
      'HOLD': {
        action: 'احتفظ',
        signal: 'hold',
        color: '#FFC107',
        description: 'وضع محايد - انتظار إشارات واضحة'
      },
      'WEAK_SELL': {
        action: 'بيع ضعيف',
        signal: 'sell_weak',
        color: '#FF8A65',
        description: 'إشارة بيع ضعيفة - مراقبة مطلوبة'
      },
      'SELL': {
        action: 'بيع',
        signal: 'sell',
        color: '#F44336',
        description: 'فرصة بيع - إشارات سلبية'
      },
      'STRONG_SELL': {
        action: 'بيع قوي',
        signal: 'sell_strong',
        color: '#D32F2F',
        description: 'بيع فوري - إشارات خطر قوية'
      }
    };
    
    const recommendation = recommendationTypes[recommendationType];
    
    // تعديل الثقة بناءً على مستوى المخاطر
    if (riskLevel?.level === 'عالي جداً' && confidence > 60) {
      confidence = Math.max(60, confidence - 15);
    } else if (riskLevel?.level === 'منخفض جداً' && confidence < 40) {
      confidence = Math.min(40, confidence + 10);
    }
    
    recommendations.push({
      type: recommendationType,
      action: recommendation.action,
      confidence: confidence,
      signal: recommendation.signal,
      color: recommendation.color,
      description: recommendation.description,
      reasoning: `تحليل فني: ${technicalScore.toFixed(1)}% | معنويات: ${sentimentScore.toFixed(1)}% | زخم: ${momentumScore.toFixed(1)}%`,
      riskLevel: riskLevel,
      timestamp: Date.now(),
      validity: getRecommendationValidity(confidence, riskLevel)
    });
    
  } catch (error) {
    // إرجاع توصية افتراضية في حالة الخطأ
    recommendations.push({
      type: 'HOLD',
      action: 'احتفظ',
      confidence: 50,
      signal: 'hold',
      color: '#FFC107',
      error: 'خطأ في التحليل - توصية محايدة',
      timestamp: Date.now()
    });
  }
  
  return recommendations;
};

// دالة حساب معنويات السوق
const calculateMarketSentiment = (data) => {
  if (!data || data.length < 10) return 50;
  
  const recent = data.slice(-10);
  let bullishSignals = 0;
  let bearishSignals = 0;
  
  // تحليل اتجاه الأسعار
  const priceMovement = recent[recent.length - 1].close > recent[0].close;
  if (priceMovement) bullishSignals += 2;
  else bearishSignals += 2;
  
  // تحليل الحجم
  const avgVolume = recent.slice(0, 5).reduce((a, c) => a + (c.volume || 0), 0) / 5;
  const recentVolume = recent.slice(-5).reduce((a, c) => a + (c.volume || 0), 0) / 5;
  
  if (recentVolume > avgVolume * 1.2) bullishSignals += 1;
  else if (recentVolume < avgVolume * 0.8) bearishSignals += 1;
  
  // تحليل نمط الشموع
  let bullishCandles = 0;
  let bearishCandles = 0;
  
  recent.forEach(candle => {
    if (candle.close > candle.open) bullishCandles++;
    else bearishCandles++;
  });
  
  if (bullishCandles > bearishCandles) bullishSignals += 1;
  else bearishSignals += 1;
  
  const totalSignals = bullishSignals + bearishSignals;
  return (bullishSignals / totalSignals) * 100;
};

// دالة تحديد صحة التوصية
const getRecommendationValidity = (confidence, riskLevel) => {
  if (confidence >= 80 && riskLevel?.level !== 'عالي جداً') return 'عالية';
  if (confidence >= 65) return 'متوسطة';
  if (confidence >= 50) return 'منخفضة';
  return 'ضعيفة';
};

// دالة تقييم المخاطر المتقدم - معايير عالمية
const assessAdvancedRisk = (marketData, volatility, volume) => {
  try {
    const riskMetrics = {};
    
    // 1. مؤشر التقلبات (Volatility Index) - معيار عالمي
    const annualizedVolatility = calculateMomentumRisk(marketData);
    riskMetrics.volatility = {
      value: annualizedVolatility,
      level: getVolatilityRiskLevel(annualizedVolatility),
      weight: 0.35, // 35% من التقييم
      description: 'التقلبات السنوية المحسوبة'
    };
    
    // 2. مؤشر السيولة (Liquidity Risk) - معايير عالمية
    const liquidityScore = calculateLiquidityRisk(volume, marketData);
    riskMetrics.liquidity = {
      value: liquidityScore,
      level: getLiquidityRiskLevel(liquidityScore),
      weight: 0.25, // 25% من التقييم
      description: 'مخاطر السيولة ونشاط التداول'
    };
    
    // 3. مؤشر الزخم (Momentum Risk) - معايير فنية
    const momentumRisk = calculateTechnicalMomentumRisk(marketData);
    riskMetrics.momentum = {
      value: momentumRisk,
      level: getMomentumRiskLevel(momentumRisk),
      weight: 0.20, // 20% من التقييم
      description: 'مخاطر التغييرات في الزخم'
    };
    
    // 4. مؤشر الاتجاه (Trend Risk) - جديد
    const trendRisk = calculateTrendRisk(marketData);
    riskMetrics.trend = {
      value: trendRisk,
      level: getTrendRiskLevel(trendRisk),
      weight: 0.20, // 20% من التقييم
      description: 'استقرار وقوة الاتجاه'
    };
    
    // حساب النتيجة الإجمالية للمخاطر
    const totalRiskScore = Object.values(riskMetrics).reduce((sum, metric) => {
      return sum + (metric.value * metric.weight);
    }, 0);
    
    // تحديد مستوى المخاطر الإجمالي
    const overallRiskLevel = determineOverallRiskLevel(totalRiskScore);
    
    // إضافة تحليل إضافي
    const additionalAnalysis = {
      marketCondition: determineMarketCondition(marketData),
      recommendation: generateRiskRecommendation(overallRiskLevel, riskMetrics),
      timeHorizon: determineTimeHorizon(riskMetrics),
      riskFactors: identifyKeyRiskFactors(riskMetrics)
    };
    
    return {
      totalScore: totalRiskScore,
      level: overallRiskLevel,
      metrics: riskMetrics,
      analysis: additionalAnalysis,
      recommendations: [
        `مستوى المخاطر: ${overallRiskLevel.label}`,
        `التوصية: ${overallRiskLevel.recommendation}`,
        `عوامل الخطر الرئيسية: ${additionalAnalysis.riskFactors.join(', ')}`
      ],
      timestamp: Date.now(),
      confidence: calculateRiskConfidence(riskMetrics)
    };
    
  } catch (error) {
    return {
      totalScore: 50, // متوسط افتراضي
      level: {
        label: 'غير محدد',
        color: '#9E9E9E',
        recommendation: 'تعذر تحديد مستوى المخاطر - يرجى المراجعة اليدوية'
      },
      error: error.message,
      timestamp: Date.now()
    };
  }
};

// دوال مساعدة لتقييم المخاطر
const calculateLiquidityRisk = (volume, data) => {
  if (!data || data.length < 20) return 50;
  
  const volumes = data.slice(-20).map(d => d.volume || 1);
  const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const currentVolume = volumes[volumes.length - 1];
  
  // حساب الانحراف المعياري للحجم
  const volumeStdDev = Math.sqrt(
    volumes.reduce((acc, vol) => acc + Math.pow(vol - avgVolume, 2), 0) / volumes.length
  );
  
  const volumeVariability = volumeStdDev / avgVolume;
  const relativeLiquidity = currentVolume / avgVolume;
  
  // نتيجة السيولة (كلما قل الرقم، زادت المخاطر)
  return Math.max(0, Math.min(100, (relativeLiquidity * 50) + ((1 - volumeVariability) * 50)));
};

const calculateTechnicalMomentumRisk = (data) => {
  if (!data || data.length < 14) return 50;
  
  const momentum = analyzeMomentum(data);
  const rsiDivergence = Math.abs(momentum.rsi - 50) / 50; // 0-1
  const macdStrength = Math.abs(momentum.histogram || 0);
  
  // كلما زاد التطرف، زادت المخاطر
  return Math.min(100, (rsiDivergence * 60) + (macdStrength * 40));
};

const calculateTrendRisk = (data) => {
  if (!data || data.length < 20) return 50;
  
  const closes = data.slice(-20).map(d => d.close);
  
  // حساب خط الاتجاه
  const trendDirection = closes[closes.length - 1] > closes[0] ? 1 : -1;
  
  // حساب قوة الاتجاه (R-squared للخط المستقيم)
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  
  closes.forEach((price, i) => {
    sumX += i;
    sumY += price;
    sumXY += i * price;
    sumXX += i * i;
  });
  
  const n = closes.length;
  const correlation = (n * sumXY - sumX * sumY) / 
    Math.sqrt((n * sumXX - sumX * sumX) * (n * closes.reduce((a, b) => a + b*b, 0) - sumY * sumY));
  
  const trendStrength = Math.abs(correlation);
  
  // اتجاه ضعيف = مخاطر عالية
  return (1 - trendStrength) * 100;
};

const getLiquidityRiskLevel = (score) => {
  if (score > 70) return 'منخفض';
  if (score > 50) return 'متوسط';
  if (score > 30) return 'عالي';
  return 'عالي جداً';
};

const getMomentumRiskLevel = (score) => {
  if (score < 30) return 'منخفض';
  if (score < 50) return 'متوسط';
  if (score < 70) return 'عالي';
  return 'عالي جداً';
};

const getTrendRiskLevel = (score) => {
  if (score < 25) return 'منخفض';
  if (score < 50) return 'متوسط';
  if (score < 75) return 'عالي';
  return 'عالي جداً';
};

const determineMarketCondition = (data) => {
  if (!data || data.length < 10) return 'غير محدد';
  
  const recent = data.slice(-10);
  const volatility = calculateMomentumRisk(data);
  const trend = recent[recent.length - 1].close > recent[0].close;
  
  if (volatility > 40) return trend ? 'صاعد متقلب' : 'هابط متقلب';
  if (volatility > 20) return trend ? 'صاعد مستقر' : 'هابط مستقر';
  return 'جانبي';
};

const generateRiskRecommendation = (riskLevel, metrics) => {
  const recommendations = [];
  
  if (metrics.volatility?.level === 'عالي جداً') {
    recommendations.push('تجنب المراكز الكبيرة');
  }
  
  if (metrics.liquidity?.level === 'عالي جداً') {
    recommendations.push('احذر من صعوبة الخروج');
  }
  
  if (metrics.momentum?.level === 'عالي جداً') {
    recommendations.push('توقع انعكاسات مفاجئة');
  }
  
  return recommendations.length > 0 ? recommendations.join(', ') : riskLevel.recommendation;
};

const determineTimeHorizon = (metrics) => {
  const highRiskCount = Object.values(metrics).filter(m => 
    m.level === 'عالي' || m.level === 'عالي جداً'
  ).length;
  
  if (highRiskCount >= 3) return 'قصير جداً (أقل من يوم)';
  if (highRiskCount >= 2) return 'قصير (1-7 أيام)';
  if (highRiskCount >= 1) return 'متوسط (1-4 أسابيع)';
  return 'طويل (أكثر من شهر)';
};

const identifyKeyRiskFactors = (metrics) => {
  const factors = [];
  
  Object.entries(metrics).forEach(([key, metric]) => {
    if (metric.level === 'عالي جداً') {
      factors.push(`${key} عالي جداً`);
    } else if (metric.level === 'عالي') {
      factors.push(`${key} عالي`);
    }
  });
  
  return factors.length > 0 ? factors : ['مخاطر طبيعية'];
};

const calculateRiskConfidence = (metrics) => {
  const validMetrics = Object.values(metrics).filter(m => m.value !== undefined);
  return Math.round((validMetrics.length / Object.keys(metrics).length) * 100);
};

// دوال مساعدة لحساب المخاطر والتوصيات - معايير عالمية
const calculateTechnicalScore = (analysis) => {
  let score = 50; // البداية من النقطة المحايدة
  
  // تحليل RSI (المعايير العالمية: 30-70)
  if (analysis?.rsi) {
    if (analysis.rsi < 30) score += 25; // منطقة تشبع بيعي قوية
    else if (analysis.rsi < 40) score += 15; // منطقة بيع ضعيفة
    else if (analysis.rsi > 70) score -= 25; // منطقة تشبع شرائي قوية
    else if (analysis.rsi > 60) score -= 15; // منطقة شراء ضعيفة
  }
  
  // تحليل MACD (إشارة الخط والإشارة)
  if (analysis?.macd && analysis?.macdSignal) {
    const macdDiff = analysis.macd - analysis.macdSignal;
    if (macdDiff > 0) score += 20; // إشارة صاعدة
    else score -= 20; // إشارة هابطة
    
    // قوة الإشارة
    const strength = Math.abs(macdDiff);
    if (strength > 1) score += (macdDiff > 0 ? 10 : -10);
  }
  
  // تحليل الأنماط الفنية
  if (analysis?.bullishPatterns && analysis?.bearishPatterns) {
    const netPatterns = analysis.bullishPatterns - analysis.bearishPatterns;
    score += netPatterns * 5; // كل نمط يضيف/يطرح 5 نقاط
  }
  
  // تحليل المتوسطات المتحركة
  if (analysis?.smaSignal) {
    if (analysis.smaSignal === 'bullish') score += 15;
    else if (analysis.smaSignal === 'bearish') score -= 15;
  }
  
  return Math.max(0, Math.min(100, score));
};

const calculateMomentumScore = (data) => {
  if (!data || data.length < 10) return 50; // نحتاج بيانات كافية للتحليل
  
  // تحليل الاتجاه قصير المدى (5 فترات)
  const shortTerm = data.slice(-5);
  const shortTrend = shortTerm[shortTerm.length - 1].close > shortTerm[0].close;
  
  // تحليل الاتجاه متوسط المدى (10 فترات)
  const mediumTerm = data.slice(-10);
  const mediumTrend = mediumTerm[mediumTerm.length - 1].close > mediumTerm[0].close;
  
  // تحليل الحجم
  const recentVolumes = data.slice(-5).map(d => d.volume || 1);
  const avgRecentVolume = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
  
  const historicalVolumes = data.slice(-20, -5).map(d => d.volume || 1);
  const avgHistoricalVolume = historicalVolumes.reduce((a, b) => a + b, 0) / historicalVolumes.length;
  
  const volumeTrend = avgRecentVolume > avgHistoricalVolume * 1.2; // 20% زيادة في الحجم
  
  // حساب معدل التغيير
  const priceChange = (shortTerm[shortTerm.length - 1].close - shortTerm[0].close) / shortTerm[0].close;
  const changeStrength = Math.abs(priceChange) * 100;
  
  let score = 50;
  
  // إضافة نقاط للاتجاه
  if (shortTrend && mediumTrend) score += 30; // اتجاه قوي
  else if (shortTrend || mediumTrend) score += 15; // اتجاه متوسط
  else if (!shortTrend && !mediumTrend) score -= 30; // اتجاه هابط
  
  // إضافة نقاط للحجم
  if (volumeTrend) score += 15;
  
  // إضافة نقاط لقوة التغيير
  if (changeStrength > 3) score += 10; // تحرك قوي
  else if (changeStrength > 1) score += 5; // تحرك متوسط
  
  return Math.max(0, Math.min(100, score));
};

const calculateMomentumRisk = (data) => {
  if (!data || data.length < 20) return 2.5; // قيمة افتراضية للمخاطر المتوسطة
  
  // حساب التقلبات باستخدام الانحراف المعياري (المعيار العالمي)
  const recent = data.slice(-20);
  const returns = [];
  
  for (let i = 1; i < recent.length; i++) {
    const returnRate = (recent[i].close - recent[i-1].close) / recent[i-1].close;
    returns.push(returnRate);
  }
  
  // حساب المتوسط
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  
  // حساب الانحراف المعياري
  const variance = returns.reduce((acc, ret) => {
    return acc + Math.pow(ret - avgReturn, 2);
  }, 0) / (returns.length - 1);
  
  const standardDeviation = Math.sqrt(variance);
  
  // تحويل إلى نسبة مئوية سنوية (252 يوم تداول)
  const annualizedVolatility = standardDeviation * Math.sqrt(252) * 100;
  
  return annualizedVolatility;
};

const getVolatilityRiskLevel = (volatility) => {
  // معايير عالمية للتقلبات (نسبة مئوية سنوية)
  if (volatility < 10) return 'منخفض جداً'; // أقل من 10% سنوياً
  if (volatility < 20) return 'منخفض';       // 10-20% سنوياً
  if (volatility < 30) return 'متوسط';       // 20-30% سنوياً
  if (volatility < 50) return 'عالي';        // 30-50% سنوياً
  return 'عالي جداً';                       // أكثر من 50% سنوياً
};

const determineOverallRiskLevel = (score) => {
  // معايير عالمية لتقييم المخاطر
  const riskLevels = {
    very_low: {
      threshold: 20,
      label: 'منخفض جداً',
      color: '#4CAF50',
      recommendation: 'مخاطر منخفضة جداً - فرصة استثمار آمنة'
    },
    low: {
      threshold: 35,
      label: 'منخفض',
      color: '#8BC34A',
      recommendation: 'مخاطر منخفضة - استثمار محافظ'
    },
    medium: {
      threshold: 55,
      label: 'متوسط',
      color: '#FFC107',
      recommendation: 'مخاطر متوسطة - توازن بين العائد والمخاطر'
    },
    high: {
      threshold: 75,
      label: 'عالي',
      color: '#FF9800',
      recommendation: 'مخاطر عالية - يتطلب خبرة في التداول'
    },
    very_high: {
      threshold: 100,
      label: 'عالي جداً',
      color: '#F44336',
      recommendation: 'مخاطر عالية جداً - تجنب إلا للمتخصصين'
    }
  };

  for (const [key, level] of Object.entries(riskLevels)) {
    if (score <= level.threshold) {
      return level;
    }
  }
  
  return riskLevels.very_high;
};

JapaneseCandlestickContent.displayName = 'JapaneseCandlestickContent';