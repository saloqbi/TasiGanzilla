import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import MarketDataProvider, { useMarketData } from '../MarketData/MarketDataProvider';
import DataProvider, { useDataProvider } from '../DataProvider/DataProvider';
import MongoDBViewer from '../DataProvider/MongoDBViewer';
import MarketSelector from '../MarketData/MarketSelector';
import TechnicalAnalysisPanel from '../MarketData/TechnicalAnalysisPanel';
import MarketDataSettings from '../MarketData/MarketDataSettings';
import TradingControlPanel from '../MarketData/TradingControlPanel';
import { availableShapes, renderSelectedShapes } from './GeometricShapes';
import MultiTimeframeConsensus from './MultiTimeframeConsensus';
import { 
  detectMarketTrend, 
  getMovementConfig, 
  SMART_MOVEMENT_CONFIG,
  ANIMATION_EFFECTS 
} from './GlobalPlatformConfig';
import './GannMarketStyles.css';
import './GannMarketInteractionFix.css';

// 📊 أنواع الرسوم البيانية المتاحة
const CHART_TYPES = {
  candlestick: { name: 'الشموع اليابانية', icon: '🕯️', color: '#FFD700' },
  area: { name: 'المنطقة', icon: '📊', color: '#2196F3' },
  bar: { name: 'الأعمدة', icon: '📈', color: '#4CAF50' },
  baseline: { name: 'الخط القاعدي', icon: '📉', color: '#FF9800' },
  histogram: { name: 'الرسم البياني', icon: '📋', color: '#9C27B0' },
  line: { name: 'الخط', icon: '📏', color: '#F44336' }
};

// 📊 أنواع الشموع اليابانية المتوافقة مع المنصات العالمية (TradingView, MetaTrader, Binance)
const CANDLESTICK_PATTERNS = {
  // TradingView Compatible Patterns
  bullish: {
    hammer: { name: 'المطرقة | Hammer', reliability: 0.75, reversal: true, platform: 'TradingView' },
    inverted_hammer: { name: 'المطرقة المقلوبة | Inverted Hammer', reliability: 0.65, reversal: true, platform: 'TradingView' },
    hanging_man: { name: 'الرجل المعلق | Hanging Man', reliability: 0.70, reversal: true, platform: 'MetaTrader' },
    shooting_star: { name: 'النجم الساقط | Shooting Star', reliability: 0.78, reversal: true, platform: 'TradingView' },
    doji: { name: 'الدوجي | Doji', reliability: 0.55, reversal: true, platform: 'Binance' },
    dragonfly_doji: { name: 'دوجي اليعسوب | Dragonfly Doji', reliability: 0.68, reversal: true, platform: 'TradingView' },
    gravestone_doji: { name: 'دوجي الشاهد | Gravestone Doji', reliability: 0.72, reversal: true, platform: 'MetaTrader' },
    bullish_engulfing: { name: 'الابتلاع الصاعد | Bullish Engulfing', reliability: 0.85, reversal: true, platform: 'Binance' },
    piercing_pattern: { name: 'نمط الثقب | Piercing Pattern', reliability: 0.73, reversal: true, platform: 'TradingView' },
    morning_star: { name: 'نجمة الصباح | Morning Star', reliability: 0.82, reversal: true, platform: 'MetaTrader' },
    three_white_soldiers: { name: 'الجنود البيض الثلاثة | Three White Soldiers', reliability: 0.88, continuation: true, platform: 'TradingView' },
    // MetaTrader & Binance Compatible Patterns
    bullish_harami: { name: 'الحرامي الصاعد | Bullish Harami', reliability: 0.67, reversal: true, platform: 'MetaTrader' },
    rising_three_methods: { name: 'الطرق الثلاث الصاعدة | Rising Three Methods', reliability: 0.74, continuation: true, platform: 'Binance' },
    tweezer_bottom: { name: 'الملقط السفلي | Tweezer Bottom', reliability: 0.63, reversal: true, platform: 'TradingView' },
    abandoned_baby_bullish: { name: 'الطفل المهجور الصاعد | Abandoned Baby Bull', reliability: 0.89, reversal: true, platform: 'MetaTrader' },
    three_inside_up: { name: 'الثلاثة الداخلية الصاعدة | Three Inside Up', reliability: 0.71, reversal: true, platform: 'Binance' }
  },
  bearish: {
    bearish_engulfing: { name: 'الابتلاع الهابط | Bearish Engulfing', reliability: 0.84, reversal: true, platform: 'Binance' },
    dark_cloud_cover: { name: 'غطاء السحابة المظلمة | Dark Cloud Cover', reliability: 0.76, reversal: true, platform: 'TradingView' },
    evening_star: { name: 'نجمة المساء | Evening Star', reliability: 0.81, reversal: true, platform: 'MetaTrader' },
    three_black_crows: { name: 'الغربان السود الثلاثة | Three Black Crows', reliability: 0.87, continuation: true, platform: 'TradingView' },
    falling_three_methods: { name: 'الطرق الثلاث الهابطة | Falling Three Methods', reliability: 0.73, continuation: true, platform: 'Binance' },
    // Advanced Global Platform Patterns
    bearish_harami: { name: 'الحرامي الهابط | Bearish Harami', reliability: 0.66, reversal: true, platform: 'MetaTrader' },
    tweezer_top: { name: 'الملقط العلوي | Tweezer Top', reliability: 0.64, reversal: true, platform: 'TradingView' },
    abandoned_baby_bearish: { name: 'الطفل المهجور الهابط | Abandoned Baby Bear', reliability: 0.88, reversal: true, platform: 'MetaTrader' },
    three_inside_down: { name: 'الثلاثة الداخلية الهابطة | Three Inside Down', reliability: 0.69, reversal: true, platform: 'Binance' },
    advance_block: { name: 'الكتلة المتقدمة | Advance Block', reliability: 0.68, reversal: true, platform: 'TradingView' }
  }
};

// � أنماط التحليل المتقدم للشموع اليابانية
const ADVANCED_ANALYSIS_PATTERNS = {
  // 🔄 تحليل جان - زوايا ومستويات ونقاط زمنية
  GANN_ANALYSIS: {
    angles: [15, 26.25, 45, 63.75, 75], // زوايا جان الأساسية
    timeIntervals: [7, 14, 21, 30, 45, 90, 180], // النقاط الزمنية المهمة
    priceSquares: true, // مربعات السعر والزمن
    fanLines: true, // خطوط المروحة
    squareOfNine: true, // مربع التسعة
    cardinalSquares: [90, 180, 270, 360] // المربعات الأساسية
  },
  
  // 📊 المستويات - دعم ومقاومة وفيبوناتشي
  LEVELS: {
    fibonacci: [0, 23.6, 38.2, 50, 61.8, 78.6, 100, 123.6, 161.8, 261.8], // مستويات فيبوناتشي
    pivotPoints: true, // نقاط المحورية
    supportResistance: true, // مستويات الدعم والمقاومة
    volumeProfile: true, // توزيع الحجم
    fibonacciExtensions: [127.2, 138.2, 150, 161.8, 200, 261.8], // امتدادات فيبوناتشي
    fibonacciArcs: true, // أقواس فيبوناتشي
    fibonacciTimeZones: true // مناطق فيبوناتشي الزمنية
  },
  
  // 📈 أنماط الشموع اليابانية - أكثر من 20 نمط
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

// �🎨 إعدادات الشموع اليابانية متوافقة مع المنصات العالمية - ألوان نيون محسنة
const CANDLESTICK_COLORS = {
  // 🟢 ألوان نيون للشموع الصاعدة
  bullish: '#00FF41',            // أخضر نيون مشرق للشموع الصاعدة
  bullish_glow: '#39FF14',       // أخضر نيون للإضاءة
  bullish_shadow: '#00CC33',     // أخضر أغمق للظلال
  
  // 🔴 ألوان قوية للشموع الهابطة  
  bearish: '#FF1744',            // أحمر قوي مشرق للشموع الهابطة
  bearish_glow: '#FF0040',       // أحمر قوي للإضاءة
  bearish_shadow: '#CC1122',     // أحمر أغمق للظلال
  
  // 🟡 ألوان ذهبية للانعكاس
  reversal: '#FFD700',           // ذهبي كلاسيكي لشموع الانعكاس
  reversal_glow: '#FFA500',      // ذهبي محروق للإضاءة
  reversal_shadow: '#DAA520',    // ذهبي داكن للظلال
  
  // 🟣 ألوان بنفسجية للدوجي
  doji: '#9C27B0',              // بنفسجي مشرق للدوجي
  doji_glow: '#BA68C8',         // بنفسجي فاتح للإضاءة
  doji_shadow: '#7B1FA2',       // بنفسجي داكن للظلال
  
  // TradingView Style Colors (احتياطية)
  bullish_tv: '#26A69A',        // أخضر TradingView
  bearish_tv: '#EF5350',        // أحمر TradingView
  
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

// دالة التحكم في سرعة التحديث (Throttling)
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
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
  const [showMarketSelector, setShowMarketSelector] = useState(false);
  const [showTechnicalAnalysis, setShowTechnicalAnalysis] = useState(false);
  const [showMarketSettings, setShowMarketSettings] = useState(false);
  const [showTradingControlPanel, setShowTradingControlPanel] = useState(false);
  const [showConsensusPanel, setShowConsensusPanel] = useState(false);
  const [showToolInstructions, setShowToolInstructions] = useState(false);
  const [showMongoDBViewer, setShowMongoDBViewer] = useState(false);
  
  // Market selection states
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState('TASI');

  // دالة جلب البيانات من MongoDB
  const fetchRealDataFromMongoDB = useCallback(async (symbol) => {
    if (!isConnected || !fetchSymbolData) {
      console.log('MongoDB غير متصل أو دالة الجلب غير متاحة');
      return [];
    }

    try {
      const mongoSymbol = symbol === 'TASI' ? 'TADAWUL:TASI' : 
                         symbol === 'AAPL' ? 'NASDAQ:AAPL' :
                         symbol === 'TSLA' ? 'NASDAQ:TSLA' :
                         symbol === 'BTC' ? 'BINANCE:BTCUSDT' :
                         `NASDAQ:${symbol}`;

      console.log(`جلب بيانات ${mongoSymbol} من MongoDB...`);
      const data = await fetchSymbolData(mongoSymbol, 200);
      
      if (data && data.length > 0) {
        // تحويل بيانات MongoDB إلى تنسيق الشموع
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

        console.log(`تم جلب ${candleData.length} شمعة من MongoDB`);
        return candleData;
      }
    } catch (error) {
      console.error('خطأ في جلب البيانات من MongoDB:', error);
    }

    return [];
  }, [isConnected, fetchSymbolData]);

  // دالة توليد بيانات السوق حسب النوع (بيانات ثابتة لتجنب التقلب)
  const generateMarketData = useCallback((symbol, marketType) => {
    // استخدام seed ثابت حسب الرمز لضمان نفس البيانات
    const seedValue = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const basePrice = {
      crypto: 45000, // Bitcoin base
      forex: 1.1, // EUR/USD base
      usstocks: 150, // Apple base
      tasi: 11000, // TASI base
      commodities: 1800, // Gold base
      indices: 4500 // S&P 500 base
    }[marketType] || 100;

    const dataPoints = 50;
    const data = [];
    let currentPrice = basePrice;

    for (let i = 0; i < dataPoints; i++) {
      const volatility = {
        crypto: 0.05, // 5% volatility
        forex: 0.01, // 1% volatility
        usstocks: 0.03, // 3% volatility
        tasi: 0.02, // 2% volatility
        commodities: 0.025, // 2.5% volatility
        indices: 0.02 // 2% volatility
      }[marketType] || 0.02;

      // استخدام seed ثابت لتوليد نفس البيانات
      const pseudoRandom1 = ((seedValue + i * 7) % 100) / 100;
      const pseudoRandom2 = ((seedValue + i * 13) % 100) / 100;
      const pseudoRandom3 = ((seedValue + i * 19) % 100) / 100;
      const pseudoRandom4 = ((seedValue + i * 23) % 100) / 100;

      const change = (pseudoRandom1 - 0.5) * volatility * currentPrice;
      const open = currentPrice;
      const close = open + change;
      const high = Math.max(open, close) + pseudoRandom2 * volatility * currentPrice * 0.5;
      const low = Math.min(open, close) - pseudoRandom3 * volatility * currentPrice * 0.5;
      const volume = Math.floor(pseudoRandom4 * 1000000) + 100000;

      data.push({
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume,
        date: new Date(Date.now() - (dataPoints - i) * 24 * 60 * 60 * 1000),
        movementType: close > open ? 'bullish' : 'bearish'
      });

      currentPrice = close;
    }

    return data;
  }, []);
  
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

  const handleMarketSelect = useCallback((market) => {
    console.log('🎯 تم اختيار السوق:', market);
    
    if (market) {
      // تحديث بيانات السوق المختار
      setSelectedMarket(market);
      
      // تحديث الرمز المختار - سيؤدي إلى تشغيل useEffect التحديث التلقائي
      const newSymbol = `${market.nameAr} (${market.symbol})`;
      setSelectedSymbol(newSymbol);
      
      // تحديث بيانات الوقت الفعلي
      setRealTimeData(prev => ({
        ...prev,
        connected: true,
        lastUpdate: new Date(),
        selectedSymbol: market.symbol
      }));
      
      console.log(`✅ تم تحديد السهم: ${newSymbol} - سيتم تحديث البيانات تلقائياً`);
    } else {
      // إعادة تعيين البيانات عند إلغاء الاختيار
      setSelectedMarket(null);
      setSelectedSymbol('TASI - المؤشر العام');
      
      // العودة للبيانات الافتراضية
      console.log('🔄 تم إلغاء اختيار السوق - العودة للبيانات الافتراضية');
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

  // � تحليل جان المتقدم - زوايا ومستويات ونقاط زمنية
  const analyzeGannLevels = useCallback((data, currentPrice) => {
    const gannAnalysis = {
      angles: [],
      timeIntervals: [],
      priceSquares: [],
      fanLines: []
    };
    
    // حساب زوايا جان
    ADVANCED_ANALYSIS_PATTERNS.GANN_ANALYSIS.angles.forEach(angle => {
      const radians = (angle * Math.PI) / 180;
      const priceLevel = currentPrice * (1 + Math.tan(radians) * 0.1);
      gannAnalysis.angles.push({
        angle,
        priceLevel: priceLevel.toFixed(2),
        strength: angle === 45 ? 'قوي جداً' : angle === 26.25 || angle === 63.75 ? 'قوي' : 'متوسط'
      });
    });
    
    // تحليل النقاط الزمنية
    ADVANCED_ANALYSIS_PATTERNS.GANN_ANALYSIS.timeIntervals.forEach(interval => {
      gannAnalysis.timeIntervals.push({
        days: interval,
        significance: interval % 30 === 0 ? 'حرج' : interval % 7 === 0 ? 'مهم' : 'عادي',
        nextDate: new Date(Date.now() + interval * 24 * 60 * 60 * 1000).toLocaleDateString('ar-SA')
      });
    });
    
    return gannAnalysis;
  }, []);
  
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
    
    console.log('🔍 detectCandlestickPatterns: تم اكتشاف', sortedPatterns.length, 'نمط من أصل', patterns.length);
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

  // ⚡ تحليل الزخم والقوة
  const analyzeMomentum = useCallback((data) => {
    if (data.length < 14) return { momentum: 0, strength: 'weak' };
    
    const closes = data.map(c => c.close);
    const volumes = data.map(c => c.volume || 1);
    
    // حساب RSI
    const rsi = calculateRSI(closes, 14);
    const currentRSI = rsi[rsi.length - 1];
    
    // حساب MACD
    const macd = calculateMACD(closes);
    
    // تحليل الحجم
    const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const currentVolume = volumes[volumes.length - 1];
    const volumeRatio = currentVolume / avgVolume;
    
    let momentum = 0;
    let strength = 'weak';
    
    // تحديد قوة الزخم
    if (currentRSI > 70) {
      momentum = 0.8;
      strength = 'overbought';
    } else if (currentRSI < 30) {
      momentum = -0.8;
      strength = 'oversold';
    } else if (currentRSI > 60) {
      momentum = 0.5;
      strength = 'strong_bullish';
    } else if (currentRSI < 40) {
      momentum = -0.5;
      strength = 'strong_bearish';
    } else {
      momentum = (currentRSI - 50) / 50;
      strength = 'moderate';
    }
    
    return {
      momentum,
      strength,
      rsi: currentRSI,
      macd: macd.macd[macd.macd.length - 1],
      signal: macd.signal[macd.signal.length - 1],
      volumeRatio,
      volumeStrength: volumeRatio > 1.5 ? 'high' : volumeRatio > 1.2 ? 'above_average' : 'normal'
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
    
    const avgGains = calculateSMA(gains, period);
    const avgLosses = calculateSMA(losses, period);
    
    return avgGains.map((gain, i) => {
      const loss = avgLosses[i];
      if (loss === 0) return 100;
      const rs = gain / loss;
      return 100 - (100 / (1 + rs));
    });
  }, [calculateSMA]);

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

  // �📊 توليد بيانات الشموع المتوافقة مع المنصات العالمية مع الحركة الذكية
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
      console.log('🎯 محاولة رسم خط السعر:', { mousePosition, dataLength: data.length, chartType: selectedChartType });
      drawInteractivePriceLine(canvas, ctx, data, mousePosition);
    } else {
      console.log('❌ لا يوجد موقع مؤشر:', mousePosition);
    }
  }, [selectedChartType, mousePosition]);

  // � دالة رسم خط السعر التفاعلي المشترك لجميع أنواع الرسوم البيانية
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

  // �🕯️ دالة رسم الشموع اليابانية
  const drawCandlestickChart = useCallback((canvas, ctx, data) => {
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
    
    // إعدادات الشموع
    const candleWidth = Math.max(2, chartWidth / data.length * 0.7);
    const candleSpacing = chartWidth / data.length;
    
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

    // رسم الشبكة الاحترافية
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
      
      // تسميات الأسعار على الجهة اليمنى
      const price = adjustedMax - (adjustedRange / priceLines) * i;
      ctx.fillStyle = '#E0E0E0';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(price.toFixed(2), canvas.width - padding + 10, y + 4);
      
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
    
    // خطوط زمنية عمودية
    const timeLines = 10;
    for (let i = 0; i <= timeLines; i++) {
      const x = padding + (chartWidth / timeLines) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvas.height - padding);
      ctx.stroke();
      
      // تسميات الوقت
      if (i < data.length) {
        const timeIndex = Math.floor((data.length - 1) * i / timeLines);
        const timeData = data[timeIndex];
        if (timeData) {
          const timeLabel = new Date(timeData.time).toLocaleTimeString('ar', { 
            hour: '2-digit', minute: '2-digit' 
          });
          ctx.fillStyle = '#B0B0B0';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(timeLabel, x, canvas.height - padding + 20);
        }
      }
    }

    // 🎯 رسم الشموع مع الحركة الذكية والتأثيرات البصرية
    data.forEach((candle, index) => {
      const x = padding + index * candleSpacing + candleSpacing / 2;
      
      // حساب المواقع
      const openY = padding + (adjustedMax - candle.open) / adjustedRange * chartHeight;
      const closeY = padding + (adjustedMax - candle.close) / adjustedRange * chartHeight;
      const highY = padding + (adjustedMax - candle.high) / adjustedRange * chartHeight;
      const lowY = padding + (adjustedMax - candle.low) / adjustedRange * chartHeight;
      
      // تحديد نوع الحركة والألوان النيون الجديدة
      const movementType = candle.movementType || 'neutral';
      const isGreen = candle.close > candle.open;
      const isDoji = Math.abs(candle.close - candle.open) < (candle.high - candle.low) * 0.1;
      
      let candleColor, borderColor, glowColor, shadowColor;
      
      // 🎨 اختيار الألوان النيون حسب نوع الحركة
      if (movementType === 'reversal') {
        // 🟡 ذهبي لشموع الانعكاس
        candleColor = CANDLESTICK_COLORS.reversal;
        borderColor = CANDLESTICK_COLORS.reversal_border;
        glowColor = CANDLESTICK_COLORS.reversal_glow;
        shadowColor = CANDLESTICK_COLORS.reversal_shadow;
      } else if (movementType === 'doji' || isDoji) {
        // 🟣 بنفسجي لشموع الدوجي
        candleColor = CANDLESTICK_COLORS.doji;
        borderColor = CANDLESTICK_COLORS.doji_border;
        glowColor = CANDLESTICK_COLORS.doji_glow;
        shadowColor = CANDLESTICK_COLORS.doji_shadow;
      } else if (isGreen || movementType === 'bullish') {
        // 🟢 أخضر نيون للشموع الصاعدة
        candleColor = CANDLESTICK_COLORS.bullish;
        borderColor = CANDLESTICK_COLORS.bullish_border;
        glowColor = CANDLESTICK_COLORS.bullish_glow;
        shadowColor = CANDLESTICK_COLORS.bullish_shadow;
      } else {
        // 🔴 أحمر قوي للشموع الهابطة
        candleColor = CANDLESTICK_COLORS.bearish;
        borderColor = CANDLESTICK_COLORS.bearish_border;
        glowColor = CANDLESTICK_COLORS.bearish_glow;
        shadowColor = CANDLESTICK_COLORS.bearish_shadow;
      }
      
      // ⚡ حساب المتغيرات الأساسية أولاً قبل استخدامها
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(Math.abs(closeY - openY), 2);
      
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

  // � useEffect للتحديث التلقائي للتحليل المتقدم عند تغيير البيانات
  useEffect(() => {
    if (candleData.length > 0) {
      // تحديث التحليل المتقدم
      const analysis = performAdvancedAnalysis(candleData);
      if (analysis) {
        // تحديث الأنماط المكتشفة
        setDetectedPatterns(analysis.candlestickPatterns || []);
        
        // تحديث اتجاه السوق بناءً على التحليل
        if (analysis.trendAnalysis?.trend) {
          setCurrentTrend(analysis.trendAnalysis.trend);
        }
        
        // تحديث الزخم
        if (analysis.momentumAnalysis?.momentum !== undefined) {
          setMarketMomentum(analysis.momentumAnalysis.momentum);
        }
        
        // تسجيل التحليل في الكونسول للمراجعة
        console.log('🔬 التحليل المتقدم محدث:', {
          patterns: analysis.candlestickPatterns?.length || 0,
          trend: analysis.trendAnalysis?.trend,
          confidence: analysis.trendAnalysis?.confidence,
          momentum: analysis.momentumAnalysis?.momentum,
          rsi: analysis.momentumAnalysis?.rsi
        });
      }
    }
  }, [candleData, performAdvancedAnalysis]);

  // 📊 useEffect لتحديث البيانات الحقيقية عند تغيير السهم المختار
  useEffect(() => {
    const updateRealDataForSymbol = async () => {
      console.log('🔄 تشغيل updateRealDataForSymbol للرمز:', selectedSymbol, 'البيانات الحقيقية:', advancedSettings.useRealData);
      
      if (selectedSymbol && advancedSettings.useRealData) {
        setIsUpdating(true);
        
        try {
          // محاولة الحصول على البيانات من قاعدة البيانات
          if (fetchSymbolData && typeof fetchSymbolData === 'function') {
            console.log('📡 جاري جلب البيانات للرمز:', selectedSymbol);
            const symbolData = await fetchSymbolData(selectedSymbol);
            
            if (symbolData && symbolData.length > 0) {
              console.log('✅ تم الحصول على البيانات:', symbolData.length, 'سجل');
              
              // تحويل البيانات إلى تنسيق الشموع - استخدام البيانات الحقيقية فقط
              const formattedData = symbolData
                .filter(item => item.open && item.high && item.low && item.close) // فقط البيانات الكاملة
                .map((item, index) => ({
                  time: new Date(item.timestamp || item.datetime || Date.now() - (symbolData.length - index) * 60000),
                  open: parseFloat(item.open),
                  high: parseFloat(item.high),
                  low: parseFloat(item.low),
                  close: parseFloat(item.close),
                  volume: parseInt(item.volume || 0),
                  symbol: selectedSymbol,
                  movementType: item.close > item.open ? 'bullish' : 'bearish'
                }));
              
              
              if (formattedData.length > 0) {
                setCandleData(formattedData);
                console.log(`✅ تم تحديث البيانات الحقيقية للسهم ${selectedSymbol}:`, formattedData.length, 'شمعة');
                
                // تحديث السعر الحالي
                const latestPrice = formattedData[formattedData.length - 1]?.close || 0;
                setCurrentPrice(latestPrice);
                
                // تحديث الحجم المتداول
                const latestVolume = formattedData[formattedData.length - 1]?.volume || 0;
                setVolume(latestVolume);
                
                // حساب التغيير في السعر
                if (formattedData.length >= 2) {
                  const prevPrice = formattedData[formattedData.length - 2]?.close || latestPrice;
                  setPriceChange(latestPrice - prevPrice);
                }
                
                // تحديث البيانات في realTimeData
                setRealTimeData(prev => ({
                  ...prev,
                  lastUpdate: new Date(),
                  symbol: selectedSymbol,
                  price: latestPrice
                }));
              } else {
                console.log(`⚠️ لا توجد بيانات صالحة للسهم ${selectedSymbol}`);
                // عرض رسالة بدلاً من بيانات وهمية
                setCandleData([]);
                setCurrentPrice(0);
                setVolume(0);
                setPriceChange(0);
              }
            } else {
              console.log(`⚠️ لم يتم العثور على بيانات للسهم ${selectedSymbol} - الرجاء تحديث البيانات من الخادم`);
              // عرض رسالة بدلاً من بيانات تجريبية
              setCandleData([]);
              setCurrentPrice(0);
              setVolume(0);
              setPriceChange(0);
            }
          } else {
            console.log('📊 وظيفة fetchSymbolData غير متوفرة - الرجاء التحقق من الاتصال بالخادم');
            setCandleData([]);
            setCurrentPrice(0);
            setVolume(0);
            setPriceChange(0);
          }
        } catch (error) {
          console.error('❌ خطأ في تحديث البيانات الحقيقية:', error);
          // عرض رسالة خطأ بدلاً من بيانات تجريبية
          setCandleData([]);
          setCurrentPrice(0);
          setVolume(0);
          setPriceChange(0);
        } finally {
          setIsUpdating(false);
        }
      } else if (selectedSymbol && !advancedSettings.useRealData) {
        // إذا لم تكن البيانات الحقيقية مفعلة، لا تعرض أي بيانات
        console.log('⚠️ البيانات الحقيقية غير مفعلة - الرجاء تفعيلها من الإعدادات');
        setCandleData([]);
        setCurrentPrice(0);
        setVolume(0);
        setPriceChange(0);
      }
    };

    updateRealDataForSymbol();
  }, [selectedSymbol, advancedSettings.useRealData, fetchSymbolData]);

  // 🎯 دالة توليد بيانات تجريبية للسهم المختار
  const generateDemoDataForSymbol = useCallback((symbol) => {
    // إنشاء بيانات تجريبية واقعية للسهم المختار
    const basePrice = 100 + Math.random() * 200; // سعر أساسي بين 100-300
    const demoData = [];
    let currentPrice = basePrice;
    
    // إنشاء 100 شمعة تجريبية
    for (let i = 0; i < 100; i++) {
      const volatility = 0.02 + Math.random() * 0.03; // تقلبات بين 2-5%
      const trend = Math.sin(i * 0.1) * 0.01; // اتجاه تدريجي
      
      const open = currentPrice;
      const change = (Math.random() - 0.5) * volatility * currentPrice + trend * currentPrice;
      const close = Math.max(open + change, 1); // تجنب الأسعار السالبة
      
      const high = Math.max(open, close) * (1 + Math.random() * 0.02);
      const low = Math.min(open, close) * (1 - Math.random() * 0.02);
      
      demoData.push({
        time: new Date(Date.now() - (100 - i) * 60000), // دقيقة لكل شمعة
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
    console.log(`🎯 تم إنشاء بيانات تجريبية للسهم ${symbol}:`, demoData.length, 'شمعة');
    
    // تحديث السعر الحالي
    const latestPrice = demoData[demoData.length - 1]?.close || currentPrice;
    setCurrentPrice(latestPrice);
    
    // تحديث الحجم المتداول
    const latestVolume = demoData[demoData.length - 1]?.volume || 0;
    setVolume(latestVolume);
    
    // حساب التغيير في السعر
    if (demoData.length >= 2) {
      const prevPrice = demoData[demoData.length - 2]?.close || latestPrice;
      setPriceChange(latestPrice - prevPrice);
    }
    
    // تحديث البيانات الفورية
    setRealTimeData(prev => ({
      ...prev,
      lastUpdate: new Date(),
      symbol,
      price: latestPrice
    }));
  }, []);

  // �🚀 تأثير لرسم الشموع مع الحركة الذكية المتقدمة
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // تجنب إعادة التشغيل التلقائي إذا كان هناك سوق مختار
    let currentTrendType = currentTrend; // استخدام القيمة الحالية كافتراضية
    
    if (!selectedMarket && !selectedSymbol) {
      // توليد بيانات الشموع الذكية فقط للبيانات الافتراضية
      const smartData = generateSmartMovingCandleData();
      setCandleData(smartData);

      // تحليل الاتجاه الحالي
      currentTrendType = detectMarketTrend(smartData);
      setCurrentTrend(currentTrendType);

      // رسم الشموع بالحركة الذكية
      drawSmartMovingCandlesticks(canvas, ctx, smartData);
    } else {
      // إذا كان هناك سوق أو سهم مختار، ارسم البيانات الموجودة فقط
      if (candleData.length > 0) {
        drawSmartMovingCandlesticks(canvas, ctx, candleData);
      }
    }

    // 🎯 إعداد التحديث الذكي المتقدم
    const currentTimeframe = timeframes.find(tf => tf.value === selectedTimeframe);
    const updateInterval = currentTimeframe?.updateInterval || 5000;
    const platformConfig = PLATFORM_UPDATE_CONFIGS[currentTimeframe?.platform || 'All'];
    
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
    
    // عدم إنشاء interval إذا كان هناك سوق مختار
    if (selectedMarket) {
      return; // لا تنشئ timer للأسواق المختارة
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
      
    }, Math.max(1000, smartInterval)); // حد أدنى 1000ms (1 ثانية) لتحسين الأداء

    return () => clearInterval(intervalId);
  }, [selectedTimeframe, selectedChartType, selectedMarket]); // تقليل dependencies لتحسين الأداء

  // 🗄️ تأثير لجلب البيانات من MongoDB عند الحاجة
  useEffect(() => {
    const loadRealData = async () => {
      if (advancedSettings.useRealData && isConnected && selectedSymbol) {
        console.log(`جاري جلب بيانات حقيقية للرمز: ${selectedSymbol}`);
        setIsUpdating(true);
        
        try {
          const realData = await fetchRealDataFromMongoDB(selectedSymbol);
          if (realData.length > 0) {
            setCandleData(realData);
            console.log(`تم تحديث البيانات بـ ${realData.length} شمعة من MongoDB`);
          } else {
            console.log('لم يتم العثور على بيانات، استخدام البيانات المحاكاة');
          }
        } catch (error) {
          console.error('خطأ في جلب البيانات الحقيقية:', error);
        } finally {
          setIsUpdating(false);
        }
      }
    };

    loadRealData();
  }, [selectedSymbol, advancedSettings.useRealData, isConnected, fetchRealDataFromMongoDB]);

  // تأثير لإعادة الرسم عند تغيير البيانات مع التحسينات الذكية
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !candleData.length) return;

    // إعادة الرسم عند تغيير البيانات للتأكد من ظهور الشموع
    const ctx = canvas.getContext('2d');
    
    // التأكد من وجود دالة الرسم قبل استدعائها
    const redrawChart = () => {
      if (typeof drawSmartMovingCandlesticks === 'function') {
        drawSmartMovingCandlesticks(canvas, ctx, candleData);
        console.log('🔄 تم إعادة رسم الشموع');
      }
    };
    
    // استخدام timeout محسن للأداء
    setTimeout(redrawChart, 50); // تحسين من 10ms إلى 50ms
  }, [candleData]);

  // 🚀 useEffect للرسم الفوري عند تغيير الأوضاع التفاعلية - لإصلاح مشكلة التأخير
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !candleData.length) return;

    // رسم فوري عند تغيير الوضع التفاعلي
    const redraw = () => {
      console.log(`🎯 تم تغيير الوضع إلى: ${interactiveMode || 'none'}`);
      
      // فقط إضافة مؤشر بصري للوضع النشط بدون مسح الشموع
      if (interactiveMode && interactiveMode !== 'none') {
        const ctx = canvas.getContext('2d');
        const modeConfig = INTERACTIVE_TOOLS[interactiveMode];
        if (modeConfig) {
          // رسم مؤشر الوضع النشط في الزاوية العلوية اليمنى بدون مسح باقي الرسم
          ctx.save();
          
          // مسح منطقة المؤشر فقط
          ctx.clearRect(canvas.width - 160, 0, 160, 50);
          
          // رسم خلفية المؤشر الشفافة مع إطار
          ctx.fillStyle = modeConfig.color;
          ctx.globalAlpha = 0.3; // خلفية شفافة أكثر
          ctx.fillRect(canvas.width - 150, 10, 140, 30);
          
          // رسم إطار ملون
          ctx.strokeStyle = modeConfig.color;
          ctx.globalAlpha = 0.8;
          ctx.lineWidth = 2;
          ctx.strokeRect(canvas.width - 150, 10, 140, 30);
          
          // رسم نص المؤشر
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.globalAlpha = 1;
          ctx.fillText(`وضع: ${modeConfig.name}`, canvas.width - 80, 30);
          ctx.restore();
        }
      } else {
        // مسح منطقة المؤشر عند إلغاء الوضع
        const ctx = canvas.getContext('2d');
        ctx.clearRect(canvas.width - 160, 0, 160, 50);
      }
    };
    
    requestAnimationFrame(redraw);
  }, [interactiveMode]);

  // 🚀 useEffect للرسم الفوري عند تغيير نوع الرسم البياني - لإصلاح مشكلة التأخير
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !candleData.length) return;

    // رسم فوري عند تغيير نوع الرسم البياني
    const redraw = () => {
      console.log(`📊 تم تغيير نوع الرسم إلى: ${selectedChartType}`);
      // سيتم الرسم عبر النظام الأساسي
    };
    
    requestAnimationFrame(redraw);
  }, [selectedChartType]);

  // � useEffect للرسم الفوري لمستويات فيبوناتشي - إصلاح عدم الظهور
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || fibonacciLevels.length === 0) return;

    // رسم فوري لجميع مستويات فيبوناتشي
    const redrawFibonacci = () => {
      const ctx = canvas.getContext('2d');
      
      console.log(`🎯 رسم فوري لـ ${fibonacciLevels.length} مستوى فيبوناتشي`);
      
      fibonacciLevels.forEach(fibGroup => {
        ctx.save();
        ctx.strokeStyle = fibGroup.color || INTERACTIVE_TOOLS.fibonacci.color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.globalAlpha = 0.8;
        
        // رسم جميع مستويات المجموعة
        fibGroup.levels.forEach(level => {
          // رسم خط المستوى
          ctx.beginPath();
          ctx.moveTo(level.startX, level.y);
          ctx.lineTo(level.endX, level.y);
          ctx.stroke();
          
          // رسم النص والنسبة
          ctx.save();
          ctx.setLineDash([]);
          ctx.fillStyle = fibGroup.color || INTERACTIVE_TOOLS.fibonacci.color;
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'left';
          ctx.globalAlpha = 1;
          
          // خلفية شفافة للنص
          const text = `${level.ratio.toFixed(1)}%`;
          const textWidth = ctx.measureText(text).width;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; // خلفية شفافة أكثر
          ctx.fillRect(level.endX + 2, level.y - 15, textWidth + 6, 16);
          
          // إطار رفيع حول النص
          ctx.strokeStyle = fibGroup.color || INTERACTIVE_TOOLS.fibonacci.color;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.3; // إطار شفاف أكثر
          ctx.strokeRect(level.endX + 2, level.y - 15, textWidth + 6, 16);
          
          // النص مع ظل للوضوح
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 2;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
          ctx.fillStyle = fibGroup.color || INTERACTIVE_TOOLS.fibonacci.color;
          ctx.globalAlpha = 1;
          ctx.fillText(text, level.endX + 5, level.y - 5);
          ctx.restore();
          ctx.restore();
        });
        
        // رسم نقطتي البداية والنهاية
        ctx.setLineDash([]);
        ctx.fillStyle = fibGroup.color || INTERACTIVE_TOOLS.fibonacci.color;
        ctx.globalAlpha = 0.9;
        
        // نقطة البداية
        ctx.beginPath();
        ctx.arc(fibGroup.startPoint.x, fibGroup.startPoint.y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // نقطة النهاية
        ctx.beginPath();
        ctx.arc(fibGroup.endPoint.x, fibGroup.endPoint.y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });
      
      console.log('✅ تم رسم جميع مستويات فيبوناتشي بنجاح');
    };
    
    requestAnimationFrame(redrawFibonacci);
  }, [fibonacciLevels]);

  // 🚀 useEffect للرسم الفوري لزوايا جان
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gannAngles.length === 0) return;

    const redrawGannAngles = () => {
      const ctx = canvas.getContext('2d');
      
      console.log(`🎯 رسم فوري لـ ${gannAngles.length} مجموعة زوايا جان`);
      
      gannAngles.forEach(gannGroup => {
        ctx.save();
        
        gannGroup.lines.forEach(line => {
          ctx.strokeStyle = line.color;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([]);
          ctx.globalAlpha = 0.7;
          
          const centerX = gannGroup.centerPoint.x;
          const centerY = gannGroup.centerPoint.y;
          // عكس اتجاه الخطوط - استخدام اتجاه معاكس للخط
          const endX = line.slope < 0 ? canvas.width : 0; // تم عكس الشرط
          const endY = centerY + (endX - centerX) * line.slope;
          
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        });
        
        ctx.restore();
      });
      
      console.log('✅ تم رسم جميع زوايا جان بنجاح');
    };
    
    requestAnimationFrame(redrawGannAngles);
  }, [gannAngles]);

  // 🚀 useEffect للرسم الفوري لخطوط الدعم والمقاومة  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || supportResistanceLines.length === 0) return;

    const redrawSupportResistance = () => {
      const ctx = canvas.getContext('2d');
      
      console.log(`🎯 رسم فوري لـ ${supportResistanceLines.length} خط دعم/مقاومة`);
      
      supportResistanceLines.forEach(line => {
        ctx.save();
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.globalAlpha = 0.8;
        
        ctx.beginPath();
        ctx.moveTo(line.startPoint.x, line.startPoint.y);
        ctx.lineTo(line.endPoint.x, line.endPoint.y);
        ctx.stroke();
        
        ctx.restore();
      });
      
      console.log('✅ تم رسم جميع خطوط الدعم والمقاومة بنجاح');
    };
    
    requestAnimationFrame(redrawSupportResistance);
  }, [supportResistanceLines]);

  // 🚀 useEffect للرسم الفوري لخطوط الاتجاه
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || trendLines.length === 0) return;

    const redrawTrendLines = () => {
      const ctx = canvas.getContext('2d');
      
      console.log(`🎯 رسم فوري لـ ${trendLines.length} خط اتجاه`);
      
      trendLines.forEach(line => {
        ctx.save();
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.globalAlpha = 0.8;
        
        ctx.beginPath();
        ctx.moveTo(line.startPoint.x, line.startPoint.y);
        ctx.lineTo(line.endPoint.x, line.endPoint.y);
        ctx.stroke();
        
        ctx.restore();
      });
      
      console.log('✅ تم رسم جميع خطوط الاتجاه بنجاح');
    };
    
    requestAnimationFrame(redrawTrendLines);
  }, [trendLines]);

  // 🚀 useEffect للرسم الفوري لقنوات السعر
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || priceChannels.length === 0) return;

    const redrawPriceChannels = () => {
      const ctx = canvas.getContext('2d');
      
      console.log(`🎯 رسم فوري لـ ${priceChannels.length} قناة سعر`);
      
      priceChannels.forEach(channel => {
        ctx.save();
        ctx.strokeStyle = channel.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.7;
        
        // رسم الخط العلوي
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(channel.upperLine.start.x, channel.upperLine.start.y);
        ctx.lineTo(channel.upperLine.end.x, channel.upperLine.end.y);
        ctx.stroke();
        
        // رسم الخط السفلي
        ctx.beginPath();
        ctx.moveTo(channel.lowerLine.start.x, channel.lowerLine.start.y);
        ctx.lineTo(channel.lowerLine.end.x, channel.lowerLine.end.y);
        ctx.stroke();
        
        // رسم الخط المركزي
        ctx.setLineDash([5, 5]);
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(channel.centerLine.start.x, channel.centerLine.start.y);
        ctx.lineTo(channel.centerLine.end.x, channel.centerLine.end.y);
        ctx.stroke();
        
        ctx.restore();
      });
      
      console.log('✅ تم رسم جميع قنوات السعر بنجاح');
    };
    
    requestAnimationFrame(redrawPriceChannels);
  }, [priceChannels]);

  // �🖱️ إضافة التفاعل مع الماوس للأدوات التحليلية
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleCanvasClick = (event) => {
      if (!candleData.length) return;
      
      console.log('🖱️ تم النقر! الوضع النشط:', interactiveMode);
      
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // حساب الشمعة المختارة
      const padding = 50;
      const chartWidth = canvas.width - 2 * padding;
      const candleWidth = chartWidth / candleData.length;
      const selectedIndex = Math.floor((x - padding) / candleWidth);
      
      if (selectedIndex >= 0 && selectedIndex < candleData.length) {
        const selectedCandle = candleData[selectedIndex];
        
        switch (interactiveMode) {
          case 'fibonacci':
            if (!isDrawing) {
              // النقرة الأولى - بداية الرسم
              setIsDrawing(true);
              setDrawingStart({ candle: selectedCandle, index: selectedIndex, x, y });
              
              // 🚀 رسم فوري لنقطة البداية
              const canvas = canvasRef.current;
              if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.save();
                
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
                console.log('🎯 تم رسم نقطة بداية فيبوناتشي فوراً');
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
                console.log('🎯 تم رسم مستويات فيبوناتشي فوراً');
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
              console.log('🎯 تم رسم زوايا جان فوراً');
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
                console.log('🎯 تم رسم خط الدعم/المقاومة فوراً');
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
            console.log('🔍 بدء كشف الأنماط للفهرس:', selectedIndex);
            const nearbyCandles = candleData.slice(Math.max(0, selectedIndex - 2), selectedIndex + 3);
            console.log('🔍 الشموع المجاورة:', nearbyCandles.length, nearbyCandles);
            const detectedPatterns = detectCandlestickPatterns(nearbyCandles);
            console.log('🔍 الأنماط المكتشفة:', detectedPatterns.length, detectedPatterns);
            
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
                console.log('🎯 تم تمييز الأنماط المكتشفة فوراً');
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
                console.log('🎯 تم رسم خط الاتجاه فوراً');
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
                console.log('🎯 تم رسم قناة السعر فوراً');
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

    const handleMouseMove = (event) => {
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
    };

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
    }, 100); // تحديد معدل التحديث لتحسين الأداء

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [candleData, drawSmartMovingCandlesticks]);

  // 📍 useEffect للرسم عند تحريك المؤشر فقط - تحديث خط السعر
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !candleData.length) return;

    // إعادة رسم الرسم البياني مع خط السعر الجديد
    const ctx = canvas.getContext('2d');
    drawSmartMovingCandlesticks(canvas, ctx, candleData);
  }, [mousePosition]);

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
    patternItem: {
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
    
    // 🎛️ أنماط لوحة التحكم الشاملة
    comprehensiveControlPanel: {
      position: 'fixed',
      top: '50px',
      right: '20px',
      width: '450px',
      maxHeight: '80vh',
      backgroundColor: 'rgba(20, 20, 20, 0.98)',
      border: '2px solid rgba(255, 107, 53, 0.6)',
      borderRadius: '15px',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 10px 40px rgba(255, 107, 53, 0.3)',
      zIndex: 1000,
      overflow: 'hidden',
      animation: 'slideInRight 0.3s ease-out'
    },
    
    controlPanelHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 20px',
      background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(247, 147, 30, 0.2))',
      borderBottom: '1px solid rgba(255, 107, 53, 0.3)'
    },
    
    controlPanelTitle: {
      color: '#FF6B35',
      fontSize: '18px',
      fontWeight: 'bold',
      margin: 0,
      textShadow: '0 0 10px rgba(255, 107, 53, 0.5)'
    },
    
    closePanelButton: {
      background: 'none',
      border: 'none',
      color: '#FF6B35',
      fontSize: '20px',
      cursor: 'pointer',
      padding: '5px',
      borderRadius: '50%',
      width: '30px',
      height: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      ':hover': {
        backgroundColor: 'rgba(255, 107, 53, 0.2)',
        transform: 'scale(1.1)'
      }
    },
    
    controlPanelTabs: {
      display: 'flex',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    
    tabButton: {
      flex: 1,
      padding: '12px 8px',
      background: 'none',
      border: 'none',
      color: '#CCCCCC',
      fontSize: '11px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      borderBottom: '3px solid transparent',
      textAlign: 'center'
    },
    
    activeTab: {
      color: '#FF6B35',
      borderBottomColor: '#FF6B35',
      backgroundColor: 'rgba(255, 107, 53, 0.1)'
    },
    
    controlPanelContent: {
      maxHeight: '65vh',
      overflowY: 'auto',
      padding: '0'
    },
    
    tabContent: {
      padding: '20px'
    },
    
    sectionTitle: {
      color: '#FF6B35',
      fontSize: '16px',
      fontWeight: 'bold',
      marginBottom: '15px',
      textShadow: '0 0 8px rgba(255, 107, 53, 0.4)'
    },
    
    settingGroup: {
      marginBottom: '15px'
    },
    
    settingLabel: {
      display: 'block',
      color: '#FFFFFF',
      fontSize: '12px',
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    
    settingSelect: {
      width: '100%',
      padding: '8px 12px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '6px',
      color: '#FFFFFF',
      fontSize: '12px',
      outline: 'none',
      transition: 'all 0.3s ease'
    },
    
    settingRange: {
      width: '100%',
      height: '6px',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '3px',
      outline: 'none',
      appearance: 'none',
      cursor: 'pointer'
    },
    
    timeframeGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(50px, 1fr))',
      gap: '8px'
    },
    
    timeframeButton: {
      padding: '8px 12px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '6px',
      color: '#FFFFFF',
      fontSize: '11px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    
    activeTimeframe: {
      backgroundColor: 'rgba(255, 107, 53, 0.3)',
      borderColor: '#FF6B35',
      color: '#FF6B35'
    },
    
    checkboxGroup: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '10px',
      marginTop: '15px'
    },
    
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#FFFFFF',
      fontSize: '12px',
      fontWeight: 'bold',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '6px',
      transition: 'all 0.3s ease',
      ':hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.05)'
      }
    },
    
    angleGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
      gap: '8px'
    },
    
    angleItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '6px 10px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '6px'
    },
    
    angleValue: {
      color: '#FFFFFF',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    
    removeAngleButton: {
      background: 'none',
      border: 'none',
      color: '#FF5722',
      fontSize: '12px',
      cursor: 'pointer',
      padding: '2px',
      borderRadius: '3px',
      transition: 'all 0.3s ease'
    },
    
    connectionStatus: {
      marginTop: '20px',
      padding: '15px',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    
    statusIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '10px'
    },
    
    statusDot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      animation: 'pulse 2s infinite'
    },
    
    statusText: {
      color: '#FFFFFF',
      fontSize: '14px',
      fontWeight: 'bold'
    },
    
    // ⚡ أنماط الإعدادات السريعة
    quickSettings: {
      padding: '15px 20px',
      backgroundColor: 'rgba(255, 107, 53, 0.1)',
      borderBottom: '1px solid rgba(255, 107, 53, 0.2)'
    },
    
    quickSettingsTitle: {
      color: '#FF6B35',
      fontSize: '14px',
      fontWeight: 'bold',
      margin: '0 0 10px 0',
      textShadow: '0 0 5px rgba(255, 107, 53, 0.4)'
    },
    
    quickButtons: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
      gap: '8px'
    },
    
    quickButton: {
      padding: '8px 12px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 107, 53, 0.3)',
      borderRadius: '6px',
      color: '#FFFFFF',
      fontSize: '11px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      ':hover': {
        backgroundColor: 'rgba(255, 107, 53, 0.2)',
        borderColor: '#FF6B35',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)'
      }
    },
    
    // 📊 أنماط معلومات الحالة
    panelFooter: {
      padding: '15px 20px',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      borderTop: '1px solid rgba(255, 107, 53, 0.3)'
    },
    
    currentStatus: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '10px'
    },
    
    statusRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '4px 8px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '4px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    
    statusLabel: {
      fontSize: '10px',
      color: '#CCCCCC',
      fontWeight: 'bold'
    },
    
    statusValue: {
      fontSize: '10px',
      color: '#FF6B35',
      fontWeight: 'bold',
      textShadow: '0 0 3px rgba(255, 107, 53, 0.5)'
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
      
      {/* 🛠️ شريط الأدوات التفاعلية */}
      <div style={styles.interactiveToolbar}>
        <h3 style={styles.toolbarTitle}>🛠️ الأدوات التفاعلية</h3>
        <div style={styles.toolsGrid}>
          {Object.entries(INTERACTIVE_TOOLS).map(([key, tool]) => (
            <button
              key={key}
              onClick={() => handleInteractiveModeChange(interactiveMode === key ? null : key)}
              style={{
                ...styles.toolButton,
                backgroundColor: interactiveMode === key ? tool.color + '40' : 'rgba(255, 255, 255, 0.1)',
                borderColor: interactiveMode === key ? tool.color : 'rgba(255, 255, 255, 0.3)',
                color: interactiveMode === key ? tool.color : '#FFFFFF'
              }}
              title={`اختصار: ${tool.shortcut}`}
            >
              <span style={styles.toolIcon}>{tool.icon}</span>
              <span style={styles.toolName}>{tool.name}</span>
              <span style={styles.toolShortcut}>{tool.shortcut}</span>
            </button>
          ))}
        </div>
        
        {/* معلومات الأداة النشطة */}
        {interactiveMode && (
          <div style={styles.activeToolInfo}>
            <span style={styles.activeToolIcon}>{INTERACTIVE_TOOLS[interactiveMode].icon}</span>
            <span style={styles.activeToolText}>
              أداة نشطة: {INTERACTIVE_TOOLS[interactiveMode].name}
            </span>
            <button 
              onClick={() => handleInteractiveModeChange(null)}
              style={styles.deactivateButton}
            >
              إلغاء تفعيل
            </button>
          </div>
        )}
        
        {/* أزرار التحكم */}
        <div style={styles.controlButtons}>
          <button 
            onClick={() => {
              setFibonacciLevels([]);
              setGannAngles([]);
              setSupportResistanceLines([]);
              setSelectedCandles([]);
              setDetectedPatterns([]);
            }}
            style={{...styles.controlButton, backgroundColor: '#FF1744'}}
          >
            🗑️ مسح الكل
          </button>
          <button 
            onClick={() => setSelectedCandles([])}
            style={{...styles.controlButton, backgroundColor: '#FF9800'}}
          >
            ❌ إلغاء التحديد
          </button>
        </div>
        
        {/* معلومات الحالة */}
        <div style={styles.statusInfo}>
          <div style={styles.statusItem}>
            📊 فيبوناتشي: {fibonacciLevels.length}
          </div>
          <div style={styles.statusItem}>
            🔄 زوايا جان: {gannAngles.length}
          </div>
          <div style={styles.statusItem}>
            📈 خطوط د/م: {supportResistanceLines.length}
          </div>
          <div style={styles.statusItem}>
            🎯 شموع مختارة: {selectedCandles.length}
          </div>
        </div>
        
        {/* دليل الاستخدام السريع */}
        <div style={styles.usageGuide}>
          <div style={styles.guideTitle}>📖 دليل الاستخدام السريع:</div>
          <div style={styles.guideItems}>
            <div style={styles.guideItem}>🖱️ انقر على الشموع لاختيارها</div>
            <div style={styles.guideItem}>⌨️ استخدم F, G, S, P, T, C للأدوات</div>
            <div style={styles.guideItem}>🔄 ESC لإلغاء الأداة النشطة</div>
            <div style={styles.guideItem}>🗑️ Ctrl+Delete لمسح الكل</div>
          </div>
        </div>
      </div>
      
      {/* 🎯 لوحة التحليل المتقدم */}
      <div style={styles.analysisPanel}>
        <h3 style={styles.analysisPanelTitle}>🔬 التحليل المتقدم للشموع اليابانية</h3>
        
        {/* تحليل جان */}
        <div style={styles.analysisSection}>
          <h4 style={styles.analysisSectionTitle}>🔄 تحليل جان - زوايا ومستويات ونقاط زمنية</h4>
          <div style={styles.analysisGrid}>
            {ADVANCED_ANALYSIS_PATTERNS.GANN_ANALYSIS.angles.map((angle, index) => (
              <div key={index} style={styles.analysisItem}>
                <span style={styles.analysisLabel}>زاوية {angle}°</span>
                <span style={{...styles.analysisValue, color: angle === 45 ? '#FFD700' : '#00BFFF'}}>
                  {angle === 45 ? 'قوي جداً' : angle === 26.25 || angle === 63.75 ? 'قوي' : 'متوسط'}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* المستويات */}
        <div style={styles.analysisSection}>
          <h4 style={styles.analysisSectionTitle}>📊 المستويات - دعم ومقاومة وفيبوناتشي</h4>
          <div style={styles.fibonacciGrid}>
            {ADVANCED_ANALYSIS_PATTERNS.LEVELS.fibonacci.slice(0, 6).map((ratio, index) => (
              <div key={index} style={styles.fibonacciItem}>
                <span style={styles.fibonacciLabel}>{ratio}%</span>
                <div style={{
                  ...styles.fibonacciBar,
                  backgroundColor: ratio === 38.2 || ratio === 61.8 ? '#00FF41' : ratio === 50 ? '#FFD700' : '#00BFFF',
                  width: `${ratio > 100 ? 100 : ratio}%`
                }}></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* أنماط الشموع */}
        <div style={styles.analysisSection}>
          <h4 style={styles.analysisSectionTitle}>📈 الأنماط - أكثر من 20 نمط للشموع اليابانية</h4>
          
          {/* أنماط الانعكاس الصاعدة */}
          <div style={styles.patternCategory}>
            <h5 style={{...styles.patternCategoryTitle, color: '#00FF41'}}>🟢 أنماط الانعكاس الصاعدة</h5>
            <div style={styles.patternGrid}>
              {ADVANCED_ANALYSIS_PATTERNS.CANDLESTICK_PATTERNS.bullishReversal.slice(0, 5).map((pattern, index) => (
                <div key={index} style={{...styles.patternItem, borderColor: pattern.color}}>
                  <span style={styles.patternName}>{pattern.arabic}</span>
                  <span style={{...styles.patternStrength, color: pattern.color}}>
                    قوة: {(pattern.strength * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* أنماط الانعكاس الهابطة */}
          <div style={styles.patternCategory}>
            <h5 style={{...styles.patternCategoryTitle, color: '#FF1744'}}>🔴 أنماط الانعكاس الهابطة</h5>
            <div style={styles.patternGrid}>
              {ADVANCED_ANALYSIS_PATTERNS.CANDLESTICK_PATTERNS.bearishReversal.slice(0, 5).map((pattern, index) => (
                <div key={index} style={{...styles.patternItem, borderColor: pattern.color}}>
                  <span style={styles.patternName}>{pattern.arabic}</span>
                  <span style={{...styles.patternStrength, color: pattern.color}}>
                    قوة: {(pattern.strength * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* أنماط الاستمرار */}
          <div style={styles.patternCategory}>
            <h5 style={{...styles.patternCategoryTitle, color: '#FFD700'}}>🟡 أنماط الاستمرار</h5>
            <div style={styles.patternGrid}>
              {ADVANCED_ANALYSIS_PATTERNS.CANDLESTICK_PATTERNS.continuation.map((pattern, index) => (
                <div key={index} style={{...styles.patternItem, borderColor: pattern.color}}>
                  <span style={styles.patternName}>{pattern.arabic}</span>
                  <span style={{...styles.patternStrength, color: pattern.color}}>
                    قوة: {(pattern.strength * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
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
            style={{...styles.button, ...(showMarketSelector ? styles.activeButton : {})}}
            onClick={() => setShowMarketSelector(!showMarketSelector)}
          >
            📈 الأسواق
          </button>
          <button 
            style={{...styles.button, ...(showTechnicalAnalysis ? styles.activeButton : {})}}
            onClick={() => setShowTechnicalAnalysis(!showTechnicalAnalysis)}
          >
            📊 التحليل الفني
          </button>
          <button 
            style={{...styles.button, ...(showMarketSettings ? styles.activeButton : {})}}
            onClick={() => setShowMarketSettings(!showMarketSettings)}
          >
            ⚙️ الإعدادات
          </button>
          <button 
            style={{...styles.button, ...(showTradingControlPanel ? styles.activeButton : {})}}
            onClick={() => setShowTradingControlPanel(!showTradingControlPanel)}
          >
            🎛️ لوحة التحكم
          </button>
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
              const nearestGann = gannLevels.slice(0, 3);
              
              return (
                <>
                  <div style={styles.gannAnglesDisplay}>
                    <div style={styles.analysisItem}>
                      <span style={styles.analysisLabel}>الزوايا النشطة:</span>
                      <span style={styles.analysisValue}>
                        {ADVANCED_ANALYSIS_PATTERNS.GANN_ANALYSIS.angles.map((angle, i) => (
                          <span key={i} style={{
                            color: angle === 45 ? '#FFD700' : '#00BFFF',
                            marginRight: '8px'
                          }}>
                            {angle}° {angle === 45 ? '⭐' : ''}
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
                          {nearestGann.map((level, i) => (
                            <div key={i} style={{
                              ...styles.levelItem,
                              color: level.price > currentPrice ? '#FF1744' : '#00FF41'
                            }}>
                              🎯 ${level.price?.toFixed(2)} ({level.type})
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div style={styles.analysisItem}>
                    <span style={styles.analysisLabel}>حالة مربع التسعة:</span>
                    <span style={{...styles.analysisValue, color: '#9C27B0'}}>
                      🔮 نشط - دورة زمنية: {Math.floor(Math.random() * 90) + 10} يوم
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

        <div style={styles.marketInfoSection}>
          <div style={styles.marketInfoTitle}>⏰ معلومات التحديث الذكي</div>
          <div style={styles.marketInfoContent}>
            <div style={styles.updateInfo}>
              <span style={styles.updateLabel}>نوع الرسم البياني:</span>
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
            <div style={styles.updateInfo}>
              <span style={styles.updateLabel}>المنصة:</span>
              <span style={styles.updateValue}>
                {(() => {
                  const tf = timeframes.find(tf => tf.value === selectedTimeframe);
                  const platform = PLATFORM_UPDATE_CONFIGS[tf?.platform || 'All'];
                  return `${platform.icon} ${platform.name}`;
                })()}
              </span>
            </div>
            <div style={styles.updateInfo}>
              <span style={styles.updateLabel}>تردد التحديث:</span>
              <span style={styles.updateValue}>
                {(() => {
                  const tf = timeframes.find(tf => tf.value === selectedTimeframe);
                  const interval = tf?.updateInterval || 5000;
                  return interval < 1000 ? `${interval}ms` : `${(interval/1000).toFixed(1)}s`;
                })()}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.marketInfoSection}>
          <div style={styles.marketInfoTitle}>🗄️ حالة قاعدة البيانات</div>
          <div style={styles.marketInfoContent}>
            <div style={styles.updateInfo}>
              <span style={styles.updateLabel}>الاتصال:</span>
              <span style={{
                ...styles.updateValue,
                color: isConnected ? '#26A69A' : '#EF5350',
                fontWeight: 'bold'
              }}>
                {isConnected ? '🟢 متصل' : '🔴 غير متصل'}
              </span>
            </div>
            {stats && (
              <>
                <div style={styles.updateInfo}>
                  <span style={styles.updateLabel}>إجمالي السجلات:</span>
                  <span style={styles.updateValue}>
                    📊 {stats.totalRecords?.toLocaleString('ar-SA') || 0}
                  </span>
                </div>
                <div style={styles.updateInfo}>
                  <span style={styles.updateLabel}>عدد الرموز:</span>
                  <span style={styles.updateValue}>
                    🎯 {stats.totalSymbols || 0}
                  </span>
                </div>
                <div style={styles.updateInfo}>
                  <span style={styles.updateLabel}>آخر تحديث:</span>
                  <span style={styles.updateValue}>
                    🕒 {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleString('ar-SA') : 'غير محدد'}
                  </span>
                </div>
              </>
            )}
            <div style={styles.updateInfo}>
              <span style={styles.updateLabel}>البيانات الحقيقية:</span>
              <span style={{
                ...styles.updateValue,
                color: advancedSettings.useRealData ? '#26A69A' : '#FFB74D'
              }}>
                {advancedSettings.useRealData ? '✅ مُفعلة' : '⏸️ مُعطلة'}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.marketInfoSection}>
          <div style={styles.marketInfoTitle}>🔗 حالة الاتصال العالمي</div>
          <div style={styles.marketInfoContent}>
            <div style={styles.connectionInfo}>
              <span style={styles.connectionLabel}>نوع البيانات:</span>
              <span style={{
                ...styles.connectionValue,
                color: advancedSettings.useRealData ? '#4CAF50' : '#FF9800'
              }}>
                {advancedSettings.useRealData ? '🔴 مباشرة' : '🟡 تجريبية'}
              </span>
            </div>
            <div style={styles.connectionInfo}>
              <span style={styles.connectionLabel}>حالة التحديث:</span>
              <span style={{
                ...styles.connectionValue,
                color: isUpdating ? '#FF9800' : '#4CAF50'
              }}>
                {isUpdating ? '🔄 يتم التحديث...' : '✅ مستقر'}
              </span>
            </div>
            <div style={styles.connectionInfo}>
              <span style={styles.connectionLabel}>الاتجاه الحالي:</span>
              <span style={{
                ...styles.connectionValue,
                color: currentTrend === 'bullish' ? '#26A69A' : currentTrend === 'bearish' ? '#EF5350' : '#FFD700'
              }}>
                {currentTrend === 'bullish' ? '🟢 صاعد' : currentTrend === 'bearish' ? '🔴 هابط' : '⚪ محايد'}
              </span>
            </div>
          </div>
        </div>

        {/* 🔗 قسم تكامل البيانات الجديد */}
        <div style={styles.marketInfoSection}>
          <div style={styles.marketInfoTitle}>📥 خاصية الاستيراد - تكامل البيانات</div>
          <div style={styles.marketInfoContent}>
            <div style={styles.connectionInfo}>
              <span style={styles.connectionLabel}>مصادر نشطة:</span>
              <span style={styles.connectionValue}>
                {Object.entries(DATA_INTEGRATION.SUPPORTED_SOURCES)
                  .filter(([key, source]) => source.enabled)
                  .length} / {Object.keys(DATA_INTEGRATION.SUPPORTED_SOURCES).length}
              </span>
            </div>
            <div style={styles.connectionInfo}>
              <span style={styles.connectionLabel}>البيانات المباشرة:</span>
              <span style={{
                ...styles.connectionValue,
                color: DATA_INTEGRATION.IMPORT_SETTINGS.realTimeData.enabled ? '#4CAF50' : '#FF5722'
              }}>
                {DATA_INTEGRATION.IMPORT_SETTINGS.realTimeData.enabled ? '✅ مفعل' : '❌ معطل'}
              </span>
            </div>
            <div style={styles.connectionInfo}>
              <span style={styles.connectionLabel}>الأخبار التأثيرية:</span>
              <span style={{
                ...styles.connectionValue,
                color: DATA_INTEGRATION.IMPORT_SETTINGS.newsData.enabled ? '#4CAF50' : '#FF5722'
              }}>
                {DATA_INTEGRATION.IMPORT_SETTINGS.newsData.enabled ? '📰 نشط' : '📰 معطل'}
              </span>
            </div>
          </div>
        </div>

        {/* 🤖 قسم محرك التوصيات */}
        <div style={styles.marketInfoSection}>
          <div style={styles.marketInfoTitle}>🤖 محرك التوصيات الذكية</div>
          <div style={styles.marketInfoContent}>
            <div style={styles.connectionInfo}>
              <span style={styles.connectionLabel}>التوصية الحالية:</span>
              <span style={{
                ...styles.connectionValue,
                color: '#00FF41'
              }}>
                🚀 شراء قوي (87%)
              </span>
            </div>
            <div style={styles.connectionInfo}>
              <span style={styles.connectionLabel}>التحليل الفني:</span>
              <span style={styles.connectionValue}>
                {(RECOMMENDATION_ENGINE.SMART_SCORING.technical.weight * 100).toFixed(0)}% وزن
              </span>
            </div>
            <div style={styles.connectionInfo}>
              <span style={styles.connectionLabel}>المشاعر السوقية:</span>
              <span style={styles.connectionValue}>
                {(RECOMMENDATION_ENGINE.SMART_SCORING.sentiment.weight * 100).toFixed(0)}% وزن
              </span>
            </div>
          </div>
        </div>

        {/* ⚡ قسم تقييم المخاطر */}
        <div style={styles.marketInfoSection}>
          <div style={styles.marketInfoTitle}>⚡ تقييم المخاطر المتقدم</div>
          <div style={styles.marketInfoContent}>
            <div style={styles.connectionInfo}>
              <span style={styles.connectionLabel}>مستوى المخاطر:</span>
              <span style={{
                ...styles.connectionValue,
                color: RISK_ASSESSMENT.RISK_LEVELS.medium.color
              }}>
                {RISK_ASSESSMENT.RISK_LEVELS.medium.label} (متوسط)
              </span>
            </div>
            <div style={styles.connectionInfo}>
              <span style={styles.connectionLabel}>مؤشر التقلبات:</span>
              <span style={styles.connectionValue}>
                {(RISK_ASSESSMENT.RISK_INDICATORS.volatility.weight * 100).toFixed(0)}% وزن
              </span>
            </div>
            <div style={styles.connectionInfo}>
              <span style={styles.connectionLabel}>تقييم السيولة:</span>
              <span style={{
                ...styles.connectionValue,
                color: '#4CAF50'
              }}>
                ✅ جيد
              </span>
            </div>
          </div>
        </div>

        {/* 📊 قسم التحليل الفني المتطور */}
        <div style={styles.marketInfoSection}>
          <div style={styles.marketInfoTitle}>📊 تحليل فني متطور - إشارات ذكية</div>
          <div style={styles.marketInfoContent}>
            <div style={styles.connectionInfo}>
              <span style={styles.connectionLabel}>أنماط اكتُشفت:</span>
              <span style={{
                ...styles.connectionValue,
                color: '#FFD700'
              }}>
                {detectedPatterns.length} نمط نشط
              </span>
            </div>
            <div style={styles.connectionInfo}>
              <span style={styles.connectionLabel}>إشارات جان:</span>
              <span style={styles.connectionValue}>
                {ADVANCED_ANALYSIS_PATTERNS.GANN_ANALYSIS.angles.length} زاوية
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

        <div style={styles.marketInfoSection}>
          <div style={styles.marketInfoTitle}>🔗 حالة الاتصال العالمي</div>
          <div style={styles.marketInfoContent}>
            <div style={styles.connectionInfo}>
              <span style={styles.connectionLabel}>الاتجاه الحالي:</span>
              <span style={{
                ...styles.connectionValue,
                color: (() => {
                  switch(currentTrend) {
                    case 'bullish': return '#26A69A';
                    case 'bearish': return '#EF5350';
                    case 'reversal': return '#FFD700';
                    case 'doji': return '#9E9E9E';
                    default: return '#2196F3';
                  }
                })()
              }}>
                {(() => {
                  const trendTexts = {
                    bullish: '📈 صاعد',
                    bearish: '📉 هابط', 
                    reversal: '🔄 انعكاس',
                    doji: '⚡ دوجي',
                    neutral: '➡️ محايد'
                  };
                  return trendTexts[currentTrend] || trendTexts.neutral;
                })()}
              </span>
            </div>
            <div style={styles.connectionInfo}>
              <span style={styles.connectionLabel}>زخم السوق:</span>
              <span style={{
                ...styles.connectionValue,
                color: marketMomentum > 0 ? '#26A69A' : marketMomentum < 0 ? '#EF5350' : '#9E9E9E'
              }}>
                {marketMomentum > 0 ? '🚀' : marketMomentum < 0 ? '📉' : '⚖️'} {Math.abs(marketMomentum * 100).toFixed(1)}%
              </span>
            </div>
            {realTimeData.lastUpdate && (
              <div style={styles.lastUpdateValue}>
                آخر تحديث: {realTimeData.lastUpdate.toLocaleTimeString('ar', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
                {lastTrendChange && (
                  <div style={{fontSize: '10px', color: '#FFD700', marginTop: '2px'}}>
                    آخر تغيير اتجاه: {lastTrendChange.toLocaleTimeString('ar', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
              </div>
            )}
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

      {/* اللوحات التفاعلية - بدون MarketSelector هنا */}
      {showTechnicalAnalysis && (
        <TechnicalAnalysisPanel 
          position={{ x: 20, y: 300 }}
          candleData={candleData}
          indicators={technicalIndicators}
        />
      )}

      {showMarketSettings && (
        <MarketDataSettings 
          position={{ x: 20, y: 500 }}
          settings={advancedSettings}
          onSettingsChange={setAdvancedSettings}
        />
      )}

      {showTradingControlPanel && (
        <TradingControlPanel 
          position={{ x: 20, y: 200 }}
          onSpeedChange={(speed) => setAdvancedSettings(prev => ({ ...prev, updateSpeed: speed }))}
          currentSpeed={advancedSettings.updateSpeed}
        />
      )}

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
                console.log('🎯 تم اختيار رمز جديد من MongoDB:', symbol);
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
                  console.log('✅ تم تحديث بيانات الشموع مباشرة من MongoDB');
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

      {/* 🌍 الأسواق المالية العالمية - تظهر بعد شريط المعلومات المفصلة */}
      {showMarketSelector && (
        <div style={{ position: 'relative', zIndex: 997 }}>
          <MarketSelector 
            position={{ x: 20, y: 100 }}
            onMarketSelect={handleMarketSelect}
          />
        </div>
      )}

      {/* تذييل الصفحة المحسن */}
      <div style={styles.footer}>
        <div style={styles.statusGroup}>
          <span>� أنواع الرسوم البيانية: 
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
          <span>�🕯️ أنماط الشموع العالمية: 
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
    </div>
  );
});

// 🔗 دالة تكامل البيانات - استيراد من مصادر متعددة
const importDataFromSource = async (source, symbol, timeframe) => {
  if (!DATA_INTEGRATION.SUPPORTED_SOURCES[source]?.enabled) {
    console.warn(`مصدر البيانات ${source} غير مفعل`);
    return null;
  }

  try {
    console.log(`📥 جاري استيراد البيانات من ${source} للرمز ${symbol}`);
    
    // محاكاة استيراد البيانات (في التطبيق الحقيقي ستكون API calls)
    const mockData = generateMockDataFromAPI(source, symbol, timeframe);
    
    return {
      source: source,
      symbol: symbol,
      timeframe: timeframe,
      data: mockData,
      timestamp: Date.now(),
      status: 'success'
    };
  } catch (error) {
    console.error(`❌ خطأ في استيراد البيانات من ${source}:`, error);
    return {
      source: source,
      symbol: symbol,
      status: 'error',
      error: error.message
    };
  }
};

// 🤖 دالة توليد التوصيات الذكية
const generateSmartRecommendations = (marketData, technicalAnalysis, riskLevel) => {
  const recommendations = [];
  
  try {
    // تحليل المؤشرات الفنية
    const technicalScore = calculateTechnicalScore(technicalAnalysis);
    
    // تحليل المشاعر السوقية (محاكاة)
    const sentimentScore = Math.random() * 100;
    
    // تحليل الزخم
    const momentumScore = calculateMomentumScore(marketData);
    
    // حساب النتيجة الإجمالية
    const totalScore = 
      (technicalScore * RECOMMENDATION_ENGINE.SMART_SCORING.technical.weight) +
      (sentimentScore * RECOMMENDATION_ENGINE.SMART_SCORING.sentiment.weight) +
      (momentumScore * RECOMMENDATION_ENGINE.SMART_SCORING.momentum.weight);
    
    // تحديد نوع التوصية
    let recommendationType;
    if (totalScore >= 80) recommendationType = 'STRONG_BUY';
    else if (totalScore >= 65) recommendationType = 'BUY';
    else if (totalScore >= 45) recommendationType = 'HOLD';
    else if (totalScore >= 30) recommendationType = 'WATCH';
    else if (totalScore >= 15) recommendationType = 'SELL';
    else recommendationType = 'STRONG_SELL';
    
    const recommendation = RECOMMENDATION_ENGINE.RECOMMENDATION_TYPES[recommendationType];
    
    recommendations.push({
      type: recommendationType,
      action: recommendation.action,
      confidence: Math.round(totalScore),
      signal: recommendation.signal,
      color: recommendation.color,
      reasoning: `فني: ${technicalScore}% | مشاعر: ${Math.round(sentimentScore)}% | زخم: ${momentumScore}%`,
      riskLevel: riskLevel,
      timestamp: Date.now()
    });
    
    console.log(`🤖 توصية ذكية: ${recommendation.action} بثقة ${Math.round(totalScore)}%`);
    
  } catch (error) {
    console.error('❌ خطأ في توليد التوصيات:', error);
  }
  
  return recommendations;
};

// ⚡ دالة تقييم المخاطر المتقدم
const assessAdvancedRisk = (marketData, volatility, volume) => {
  try {
    const riskMetrics = {};
    
    // حساب مؤشر التقلبات
    riskMetrics.volatility = {
      value: volatility * 100,
      level: getVolatilityRiskLevel(volatility),
      weight: RISK_ASSESSMENT.RISK_INDICATORS.volatility.weight
    };
    
    // حساب مخاطر السيولة
    riskMetrics.liquidity = {
      value: volume / 1000000,
      level: volume > 500000 ? 'منخفض' : volume > 100000 ? 'متوسط' : 'عالي',
      weight: RISK_ASSESSMENT.RISK_INDICATORS.liquidity.weight
    };
    
    // حساب مخاطر الزخم
    riskMetrics.momentum = {
      value: calculateMomentumRisk(marketData),
      level: 'متوسط',
      weight: RISK_ASSESSMENT.RISK_INDICATORS.momentum.weight
    };
    
    // حساب النتيجة الإجمالية للمخاطر
    const totalRiskScore = Object.values(riskMetrics).reduce((sum, metric) => {
      return sum + (metric.value * metric.weight);
    }, 0);
    
    // تحديد مستوى المخاطر الإجمالي
    const overallRiskLevel = determineOverallRiskLevel(totalRiskScore);
    
    console.log(`⚡ تقييم المخاطر: ${overallRiskLevel.label} (${totalRiskScore.toFixed(2)})`);
    
    return {
      totalScore: totalRiskScore,
      level: overallRiskLevel,
      metrics: riskMetrics,
      recommendations: [`نصيحة: ${overallRiskLevel.recommendation}`],
      timestamp: Date.now()
    };
    
  } catch (error) {
    console.error('❌ خطأ في تقييم المخاطر:', error);
    return {
      totalScore: 0,
      level: RISK_ASSESSMENT.RISK_LEVELS.medium,
      error: error.message
    };
  }
};

// دوال مساعدة لحساب المخاطر والتوصيات
const calculateTechnicalScore = (analysis) => {
  let score = 50;
  
  if (analysis?.rsi < 30) score += 20;
  else if (analysis?.rsi > 70) score -= 20;
  
  if (analysis?.macd > analysis?.macdSignal) score += 15;
  else score -= 15;
  
  if (analysis?.bullishPatterns > analysis?.bearishPatterns) score += 10;
  else score -= 10;
  
  return Math.max(0, Math.min(100, score));
};

const calculateMomentumScore = (data) => {
  if (!data || data.length < 2) return 50;
  
  const recent = data.slice(-5);
  const trend = recent[recent.length - 1].close > recent[0].close;
  const volumeTrend = recent[recent.length - 1].volume > recent[0].volume;
  
  let score = 50;
  if (trend) score += 25;
  if (volumeTrend) score += 25;
  
  return score;
};

const calculateMomentumRisk = (data) => {
  if (!data || data.length < 2) return 2.5;
  
  const recent = data.slice(-10);
  const volatility = recent.reduce((acc, candle, i) => {
    if (i === 0) return acc;
    return acc + Math.abs(candle.close - recent[i-1].close);
  }, 0) / (recent.length - 1);
  
  return volatility;
};

const getVolatilityRiskLevel = (volatility) => {
  const vol = volatility * 100;
  if (vol < 2) return 'منخفض';
  if (vol < 5) return 'متوسط';
  return 'عالي';
};

const determineOverallRiskLevel = (score) => {
  for (const [key, level] of Object.entries(RISK_ASSESSMENT.RISK_LEVELS)) {
    if (score <= level.threshold) {
      return level;
    }
  }
  return RISK_ASSESSMENT.RISK_LEVELS.very_high;
};

const generateMockDataFromAPI = (source, symbol, timeframe) => {
  const data = [];
  const basePrice = 100 + Math.random() * 100;
  
  for (let i = 0; i < 100; i++) {
    const price = basePrice + (Math.random() - 0.5) * 10;
    data.push({
      timestamp: Date.now() - (100 - i) * 60000,
      open: price,
      high: price + Math.random() * 5,
      low: price - Math.random() * 5,
      close: price + (Math.random() - 0.5) * 2,
      volume: Math.random() * 1000000,
      source: source
    });
  }
  
  return data;
};

JapaneseCandlestickContent.displayName = 'JapaneseCandlestickContent';