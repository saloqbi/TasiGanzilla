import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import MarketDataProvider, { useMarketData } from '../MarketData/MarketDataProvider';
import MarketSelector from '../MarketData/MarketSelector';
import TechnicalAnalysisPanel from '../MarketData/TechnicalAnalysisPanel';
import MarketDataSettings from '../MarketData/MarketDataSettings';
import TradingControlPanel from '../MarketData/TradingControlPanel';
import MultiTimeframeConsensus from './MultiTimeframeConsensus';
import CandlestickPatternAnalyzer from './CandlestickPatternAnalyzer.js';
import GannCandlestickIntegration from './GannCandlestickIntegration.js';
import './GannMarketStyles.css';
import './GannMarketInteractionFix.css';

// الإعدادات الافتراضية المحسنة
const getDefaultSettings = () => ({
  timeframe: '1h',
  candleCount: 100,
  showVolume: true,
  showPatterns: true,
  showGannIntegration: true,
  showFibonacci: true,
  language: "ar",
  enableAdvancedAnalysis: true,
  autoDetectPatterns: true,
  showTechnicalLevels: true,
  enableRealTimeUpdates: true
});

// ألوان الشموع المحسنة
const CANDLESTICK_COLORS = {
  bullish: '#00FF41',        // أخضر نيون للصعود
  bearish: '#FF0040',        // أحمر قوي للهبوط
  reversal: '#FFD700',       // ذهبي للانعكاس
  doji: '#9370DB',           // بنفسجي للدوجي
  wick: '#FFFFFF',           // أبيض للفتائل
  volume_bullish: 'rgba(0, 255, 65, 0.3)',
  volume_bearish: 'rgba(255, 0, 64, 0.3)',
  grid: '#333333',
  background: '#0a0a0a',
  text: '#FFFFFF'
};

const EnhancedJapaneseCandlestickContent = React.forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const volumeCanvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastUpdateTime = useRef(0);
  
  // محللات متقدمة
  const patternAnalyzer = useMemo(() => new CandlestickPatternAnalyzer(), []);
  const gannIntegration = useMemo(() => new GannCandlestickIntegration(), []);
  
  // استخدام MarketData context
  const { 
    marketData, 
    priceMovements, 
    addMarketWatch, 
    removeMarketWatch,
    selectedMarkets = [],
    analysisSettings
  } = useMarketData();

  // حالات التحكم المحسنة
  const [settings, setSettings] = useState(getDefaultSettings);
  const [candleData, setCandleData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [volume, setVolume] = useState(0);
  
  // التحليلات المتقدمة
  const [detectedPatterns, setDetectedPatterns] = useState([]);
  const [gannLevels, setGannLevels] = useState([]);
  const [fibonacciLevels, setFibonacciLevels] = useState([]);
  const [integratedAnalysis, setIntegratedAnalysis] = useState(null);
  const [marketAnalysis, setMarketAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  // حالات العرض
  const [showMarketSelector, setShowMarketSelector] = useState(false);
  const [showTechnicalAnalysis, setShowTechnicalAnalysis] = useState(false);
  const [showMarketSettings, setShowMarketSettings] = useState(false);
  const [showTradingControlPanel, setShowTradingControlPanel] = useState(false);
  const [showConsensusPanel, setShowConsensusPanel] = useState(true);
  const [showPatternDetails, setShowPatternDetails] = useState(true);
  const [showVolumeProfile, setShowVolumeProfile] = useState(true);
  const [showAdvancedOverlay, setShowAdvancedOverlay] = useState(true);

  // إعدادات الرسم
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [candleWidth, setCandleWidth] = useState(8);
  const [showCrosshair, setShowCrosshair] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // الأسواق المالية المحسنة
  const availableMarkets = [
    // العملات الرقمية
    { id: 'BTCUSDT', name: 'Bitcoin/USDT', category: 'crypto', symbol: '₿' },
    { id: 'ETHUSDT', name: 'Ethereum/USDT', category: 'crypto', symbol: 'Ξ' },
    { id: 'ADAUSDT', name: 'Cardano/USDT', category: 'crypto', symbol: '₳' },
    { id: 'DOTUSDT', name: 'Polkadot/USDT', category: 'crypto', symbol: '●' },
    
    // الفوركس
    { id: 'EURUSD', name: 'EUR/USD', category: 'forex', symbol: '€/$' },
    { id: 'GBPUSD', name: 'GBP/USD', category: 'forex', symbol: '£/$' },
    { id: 'USDJPY', name: 'USD/JPY', category: 'forex', symbol: '$/¥' },
    { id: 'AUDUSD', name: 'AUD/USD', category: 'forex', symbol: 'A$/$' },
    
    // الأسهم الأمريكية
    { id: 'AAPL', name: 'Apple Inc.', category: 'stocks', symbol: '🍎' },
    { id: 'GOOGL', name: 'Alphabet Inc.', category: 'stocks', symbol: 'G' },
    { id: 'MSFT', name: 'Microsoft Corp.', category: 'stocks', symbol: 'Ⓜ' },
    { id: 'TSLA', name: 'Tesla Inc.', category: 'stocks', symbol: '🚗' },
    
    // السوق السعودي (تاسي)
    { id: '2222.SR', name: 'أرامكو السعودية', category: 'tasi', symbol: '🛢️' },
    { id: '1120.SR', name: 'بنك الراجحي', category: 'tasi', symbol: '🏦' },
    { id: '2010.SR', name: 'سابك', category: 'tasi', symbol: '🏭' },
    { id: '1180.SR', name: 'البنك الأهلي', category: 'tasi', symbol: '🏛️' },
    
    // السلع
    { id: 'XAUUSD', name: 'Gold/USD', category: 'commodities', symbol: '🥇' },
    { id: 'XAGUSD', name: 'Silver/USD', category: 'commodities', symbol: '🥈' },
    { id: 'WTIUSD', name: 'WTI Oil/USD', category: 'commodities', symbol: '🛢️' },
    { id: 'NATGAS', name: 'Natural Gas', category: 'commodities', symbol: '💨' }
  ];

  // الأطر الزمنية المحسنة
  const timeframes = [
    { value: '1m', label: '1 دقيقة', multiplier: 1 },
    { value: '5m', label: '5 دقائق', multiplier: 5 },
    { value: '15m', label: '15 دقيقة', multiplier: 15 },
    { value: '30m', label: '30 دقيقة', multiplier: 30 },
    { value: '1h', label: 'ساعة', multiplier: 60 },
    { value: '4h', label: '4 ساعات', multiplier: 240 },
    { value: '1d', label: 'يوم', multiplier: 1440 },
    { value: '1w', label: 'أسبوع', multiplier: 10080 },
    { value: '1M', label: 'شهر', multiplier: 43200 }
  ];

  // توليد بيانات محسنة للشموع
  const generateEnhancedCandleData = useCallback((count = 100) => {
    const candles = [];
    let currentPrice = 45000 + Math.random() * 10000;
    const now = new Date();
    const timeframe = timeframes.find(tf => tf.value === settings.timeframe);
    const interval = timeframe ? timeframe.multiplier * 60 * 1000 : 60 * 60 * 1000;
    
    for (let i = 0; i < count; i++) {
      const timestamp = new Date(now.getTime() - (count - i) * interval);
      
      // نمط حركة أكثر واقعية
      const trend = Math.sin(i * 0.1) * 0.5 + 0.5; // اتجاه عام
      const volatility = 0.02 + Math.random() * 0.03; // تقلبات
      const noise = (Math.random() - 0.5) * 2; // ضوضاء عشوائية
      
      const change = currentPrice * volatility * (trend + noise * 0.3);
      const open = currentPrice;
      const close = Math.max(open + change, open * 0.98); // حماية من الانهيار
      
      // حساب الأعلى والأقل بشكل واقعي
      const baseHigh = Math.max(open, close);
      const baseLow = Math.min(open, close);
      const high = baseHigh + Math.random() * currentPrice * 0.01;
      const low = Math.max(baseLow - Math.random() * currentPrice * 0.01, currentPrice * 0.95);
      
      // حجم التداول مع ارتباط بالتقلبات
      const baseVolume = 500000 + Math.random() * 2000000;
      const volatilityMultiplier = Math.abs(change) / currentPrice * 10 + 1;
      const vol = baseVolume * volatilityMultiplier;
      
      candles.push({
        timestamp,
        open: Math.max(low, open),
        high,
        low,
        close: Math.max(low, close),
        volume: vol
      });
      
      currentPrice = close;
    }
    
    return candles;
  }, [settings.timeframe]);

  // التحليل المتكامل المحسن
  const performIntegratedAnalysis = useCallback((candles) => {
    if (!candles || candles.length === 0) return;

    try {
      // التحليل المتكامل
      const analysis = gannIntegration.integratedAnalysis(
        candles,
        candles[candles.length - 1].close,
        candles[0].timestamp
      );

      setDetectedPatterns(analysis.candlestickPatterns);
      setGannLevels(analysis.gannLevels);
      setFibonacciLevels(analysis.fibonacciLevels);
      setIntegratedAnalysis(analysis.integratedSignals);
      setMarketAnalysis(analysis.marketAnalysis);
      setRecommendations(analysis.recommendations);

    } catch (error) {
      console.error('خطأ في التحليل المتكامل:', error);
    }
  }, [gannIntegration]);

  // رسم الشموع المحسن
  const drawEnhancedCandlesticks = useCallback((ctx, candles, width, height) => {
    if (!candles || candles.length === 0) return;
    
    const visibleCandles = Math.floor((width - 100) / (candleWidth + 2));
    const startIndex = Math.max(0, candles.length - visibleCandles + Math.floor(panX));
    const endIndex = Math.min(candles.length, startIndex + visibleCandles);
    const visibleData = candles.slice(startIndex, endIndex);
    
    if (visibleData.length === 0) return;

    const candleSpacing = candleWidth + 2;
    const chartHeight = height - 100;
    const chartTop = 50;
    
    // حساب نطاق الأسعار للشموع المرئية
    const prices = visibleData.map(c => [c.high, c.low]).flat();
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;
    const padding = priceRange * 0.1;
    const adjustedMax = maxPrice + padding;
    const adjustedMin = minPrice - padding;
    const adjustedRange = adjustedMax - adjustedMin;

    // رسم الشموع
    visibleData.forEach((candle, index) => {
      const x = 50 + index * candleSpacing;
      
      // تحويل الأسعار إلى إحداثيات y
      const openY = chartTop + (adjustedMax - candle.open) / adjustedRange * chartHeight;
      const closeY = chartTop + (adjustedMax - candle.close) / adjustedRange * chartHeight;
      const highY = chartTop + (adjustedMax - candle.high) / adjustedRange * chartHeight;
      const lowY = chartTop + (adjustedMax - candle.low) / adjustedRange * chartHeight;
      
      // تحديد لون ونوع الشمعة
      let candleColor = CANDLESTICK_COLORS.bullish;
      let candleType = 'bullish';
      
      if (candle.close < candle.open) {
        candleColor = CANDLESTICK_COLORS.bearish;
        candleType = 'bearish';
      } else if (Math.abs(candle.close - candle.open) < (candle.high - candle.low) * 0.1) {
        candleColor = CANDLESTICK_COLORS.doji;
        candleType = 'doji';
      }

      // التحقق من أنماط الانعكاس
      const candleIndex = startIndex + index;
      const reversalPattern = detectedPatterns.find(p => 
        p.index === candleIndex && p.category === 'reversal'
      );
      
      if (reversalPattern) {
        candleColor = CANDLESTICK_COLORS.reversal;
        candleType = 'reversal';
      }

      // رسم الفتائل
      ctx.strokeStyle = CANDLESTICK_COLORS.wick;
      ctx.lineWidth = Math.max(1, candleWidth / 8);
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, highY);
      ctx.lineTo(x + candleWidth / 2, lowY);
      ctx.stroke();

      // رسم جسم الشمعة
      const bodyHeight = Math.abs(closeY - openY);
      const bodyTop = Math.min(openY, closeY);
      
      if (candleType === 'bearish' || candleType === 'reversal') {
        // شمعة مملوءة
        ctx.fillStyle = candleColor;
        ctx.fillRect(x, bodyTop, candleWidth, Math.max(bodyHeight, 1));
      } else {
        // شمعة مجوفة
        ctx.strokeStyle = candleColor;
        ctx.lineWidth = Math.max(1, candleWidth / 10);
        ctx.strokeRect(x, bodyTop, candleWidth, Math.max(bodyHeight, 1));
      }

      // إضافة تأثيرات بصرية للحجم
      if (candle.volume > 0) {
        const volumeAlpha = Math.min(candle.volume / 5000000, 0.3);
        ctx.fillStyle = candleType === 'bearish' ? 
          `rgba(255, 0, 64, ${volumeAlpha})` : 
          `rgba(0, 255, 65, ${volumeAlpha})`;
        ctx.fillRect(x, bodyTop, candleWidth, Math.max(bodyHeight, 1));
      }
    });

    // رسم المؤشرات والإشارات
    this.drawTechnicalIndicators(ctx, visibleData, startIndex, width, height, adjustedMax, adjustedMin, adjustedRange);
    
  }, [candleWidth, panX, detectedPatterns]);

  // رسم المؤشرات الفنية
  const drawTechnicalIndicators = useCallback((ctx, visibleData, startIndex, width, height, maxPrice, minPrice, priceRange) => {
    const chartHeight = height - 100;
    const chartTop = 50;

    // رسم مستويات جان
    if (settings.showGannIntegration && gannLevels.length > 0) {
      gannLevels.forEach(level => {
        if (level.price >= minPrice && level.price <= maxPrice) {
          const y = chartTop + (maxPrice - level.price) / priceRange * chartHeight;
          
          ctx.strokeStyle = level.type === 'support' ? 
            'rgba(0, 255, 65, 0.7)' : 'rgba(255, 0, 64, 0.7)';
          ctx.lineWidth = level.strength === 'قوي جداً' ? 3 : 
                         level.strength === 'قوي' ? 2 : 1;
          ctx.setLineDash(level.strength === 'متوسط' ? [5, 5] : []);
          
          ctx.beginPath();
          ctx.moveTo(50, y);
          ctx.lineTo(width - 50, y);
          ctx.stroke();
          
          // تسمية المستوى
          ctx.fillStyle = ctx.strokeStyle;
          ctx.font = '11px Arial';
          ctx.fillText(`جان ${level.angle}° ${level.price.toFixed(2)}`, width - 120, y - 3);
        }
      });
      ctx.setLineDash([]);
    }

    // رسم مستويات فيبوناتشي
    if (settings.showFibonacci && fibonacciLevels.length > 0) {
      fibonacciLevels.forEach(level => {
        if (level.price >= minPrice && level.price <= maxPrice) {
          const y = chartTop + (maxPrice - level.price) / priceRange * chartHeight;
          
          ctx.strokeStyle = level.type === 'fibonacci_retracement' ? 
            'rgba(255, 215, 0, 0.6)' : 'rgba(138, 43, 226, 0.6)';
          ctx.lineWidth = level.strength === 'قوي' ? 2 : 1;
          ctx.setLineDash([3, 3]);
          
          ctx.beginPath();
          ctx.moveTo(50, y);
          ctx.lineTo(width - 50, y);
          ctx.stroke();
          
          // تسمية فيبوناتشي
          ctx.fillStyle = ctx.strokeStyle;
          ctx.font = '10px Arial';
          ctx.fillText(`فيب ${level.percentage}%`, 55, y - 3);
        }
      });
      ctx.setLineDash([]);
    }

    // رسم أنماط الشموع المكتشفة
    if (settings.showPatterns && detectedPatterns.length > 0) {
      detectedPatterns.forEach(pattern => {
        const patternIndex = pattern.index - startIndex;
        if (patternIndex >= 0 && patternIndex < visibleData.length) {
          const x = 50 + patternIndex * (candleWidth + 2);
          const candle = visibleData[patternIndex];
          const y = chartTop + (maxPrice - candle.high) / priceRange * chartHeight - 25;
          
          // رسم أيقونة النمط
          ctx.fillStyle = pattern.signal === 'bullish' ? '#00FF41' : 
                         pattern.signal === 'bearish' ? '#FF0040' : '#FFD700';
          ctx.font = 'bold 16px Arial';
          ctx.fillText(pattern.icon || '📊', x - 8, y);
          
          // خط الإشارة
          ctx.strokeStyle = ctx.fillStyle;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x + 8, y + 5);
          ctx.lineTo(x + 8, y + 20);
          ctx.stroke();

          // نص الثقة
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '9px Arial';
          ctx.fillText(`${Math.round(pattern.confidence * 100)}%`, x - 5, y + 35);
        }
      });
    }

  }, [settings.showGannIntegration, settings.showFibonacci, settings.showPatterns, 
      gannLevels, fibonacciLevels, detectedPatterns, candleWidth]);

  // رسم الحجم
  const drawVolumeProfile = useCallback((ctx, candles, width, height) => {
    if (!settings.showVolume || !candles.length) return;

    const volumeHeight = 80;
    const volumeTop = height - volumeHeight - 20;
    const visibleCandles = Math.floor((width - 100) / (candleWidth + 2));
    const startIndex = Math.max(0, candles.length - visibleCandles + Math.floor(panX));
    const endIndex = Math.min(candles.length, startIndex + visibleCandles);
    const visibleData = candles.slice(startIndex, endIndex);

    if (visibleData.length === 0) return;

    const maxVolume = Math.max(...visibleData.map(c => c.volume));
    const candleSpacing = candleWidth + 2;

    visibleData.forEach((candle, index) => {
      const x = 50 + index * candleSpacing;
      const volumeBarHeight = (candle.volume / maxVolume) * volumeHeight;
      const y = volumeTop + volumeHeight - volumeBarHeight;

      ctx.fillStyle = candle.close >= candle.open ? 
        CANDLESTICK_COLORS.volume_bullish : 
        CANDLESTICK_COLORS.volume_bearish;
      
      ctx.fillRect(x, y, candleWidth, volumeBarHeight);
    });

    // تسمية الحجم
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.fillText('الحجم', 10, volumeTop + 15);

  }, [settings.showVolume, candleWidth, panX]);

  // رسم الشبكة المحسنة
  const drawEnhancedGrid = useCallback((ctx, width, height) => {
    ctx.strokeStyle = CANDLESTICK_COLORS.grid;
    ctx.lineWidth = 0.5;
    
    // خطوط عمودية
    const verticalSpacing = 60;
    for (let i = 50; i < width - 50; i += verticalSpacing) {
      ctx.globalAlpha = i % (verticalSpacing * 2) === 50 ? 0.3 : 0.1;
      ctx.beginPath();
      ctx.moveTo(i, 50);
      ctx.lineTo(i, height - 120);
      ctx.stroke();
    }
    
    // خطوط أفقية
    const horizontalSpacing = 40;
    for (let i = 50; i < height - 120; i += horizontalSpacing) {
      ctx.globalAlpha = i % (horizontalSpacing * 2) === 50 ? 0.3 : 0.1;
      ctx.beginPath();
      ctx.moveTo(50, i);
      ctx.lineTo(width - 50, i);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
  }, []);

  // الرسم الرئيسي المحسن
  const drawEnhancedChart = useCallback(() => {
    const canvas = canvasRef.current;
    const volumeCanvas = volumeCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    
    if (!canvas || !volumeCanvas || !overlayCanvas) return;
    
    const ctx = canvas.getContext('2d');
    const volumeCtx = volumeCanvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');
    
    const { width, height } = canvas;
    
    // مسح جميع الطبقات
    ctx.clearRect(0, 0, width, height);
    volumeCtx.clearRect(0, 0, width, height);
    overlayCtx.clearRect(0, 0, width, height);
    
    // رسم الخلفية المتدرجة
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, CANDLESTICK_COLORS.background);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // رسم الشبكة
    drawEnhancedGrid(ctx, width, height);
    
    if (candleData.length > 0) {
      // رسم الشموع والمؤشرات
      drawEnhancedCandlesticks(ctx, candleData, width, height);
      
      // رسم الحجم في طبقة منفصلة
      drawVolumeProfile(volumeCtx, candleData, width, height);
    }
    
    // رسم العناوين والمعلومات
    drawChartHeaders(overlayCtx, width, height);
    
    // رسم الكروس هير إذا كان مفعلاً
    if (showCrosshair) {
      drawCrosshair(overlayCtx, width, height);
    }
    
  }, [candleData, drawEnhancedGrid, drawEnhancedCandlesticks, 
      drawVolumeProfile, showCrosshair]);

  // رسم العناوين والمعلومات
  const drawChartHeaders = useCallback((ctx, width, height) => {
    // عنوان الرسم البياني
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📊 تحليل الشموع اليابانية المتقدم مع تكامل جان', width / 2, 30);
    
    // معلومات السعر الحالي
    if (currentPrice > 0) {
      ctx.textAlign = 'left';
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#FFD700';
      ctx.fillText(`السعر: $${currentPrice.toFixed(2)}`, 20, height - 30);
      
      ctx.fillStyle = priceChange >= 0 ? '#00FF41' : '#FF0040';
      ctx.fillText(`التغيير: ${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}`, 200, height - 30);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.fillText(`الحجم: ${volume.toLocaleString()}`, 400, height - 30);
    }
    
    // إعادة تعيين المحاذاة
    ctx.textAlign = 'start';
  }, [currentPrice, priceChange, volume]);

  // رسم الكروس هير
  const drawCrosshair = useCallback((ctx, width, height) => {
    if (mousePosition.x === 0 && mousePosition.y === 0) return;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // خط عمودي
    ctx.beginPath();
    ctx.moveTo(mousePosition.x, 50);
    ctx.lineTo(mousePosition.x, height - 120);
    ctx.stroke();
    
    // خط أفقي
    ctx.beginPath();
    ctx.moveTo(50, mousePosition.y);
    ctx.lineTo(width - 50, mousePosition.y);
    ctx.stroke();
    
    ctx.setLineDash([]);
  }, [mousePosition]);

  // معالجة حركة الماوس
  const handleMouseMove = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    setMousePosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
  }, []);

  // تحديث البيانات عند تغيير الإعدادات
  useEffect(() => {
    const newCandleData = generateEnhancedCandleData(settings.candleCount);
    setCandleData(newCandleData);
    
    if (newCandleData.length > 0) {
      const currentCandle = newCandleData[newCandleData.length - 1];
      setCurrentPrice(currentCandle.close);
      setPriceChange(currentCandle.close - (newCandleData[newCandleData.length - 2]?.close || currentCandle.close));
      setVolume(currentCandle.volume);
      
      // تشغيل التحليل المتكامل
      performIntegratedAnalysis(newCandleData);
    }
  }, [settings, generateEnhancedCandleData, performIntegratedAnalysis]);

  // رسم الرسم البياني عند تحديث البيانات
  useEffect(() => {
    const animationId = requestAnimationFrame(drawEnhancedChart);
    return () => cancelAnimationFrame(animationId);
  }, [drawEnhancedChart]);

  // تهيئة الكانفاس
  useEffect(() => {
    const canvas = canvasRef.current;
    const volumeCanvas = volumeCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    
    if (!canvas || !volumeCanvas || !overlayCanvas) return;
    
    const resizeCanvases = () => {
      const container = canvas.parentElement;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      [canvas, volumeCanvas, overlayCanvas].forEach(c => {
        c.width = width;
        c.height = height;
        c.style.width = width + 'px';
        c.style.height = height + 'px';
      });
      
      drawEnhancedChart();
    };
    
    resizeCanvases();
    
    // إضافة مستمعات الأحداث
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resizeCanvases);
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvases);
    };
  }, [drawEnhancedChart, handleMouseMove]);

  // تحديث البيانات في الوقت الفعلي
  useEffect(() => {
    if (!settings.enableRealTimeUpdates) return;
    
    const interval = setInterval(() => {
      if (candleData.length > 0) {
        setCandleData(prevData => {
          const lastCandle = prevData[prevData.length - 1];
          const change = (Math.random() - 0.5) * lastCandle.close * 0.002;
          const newClose = Math.max(lastCandle.close + change, lastCandle.close * 0.999);
          
          const updatedCandle = {
            ...lastCandle,
            close: newClose,
            high: Math.max(lastCandle.high, newClose),
            low: Math.min(lastCandle.low, newClose),
            volume: lastCandle.volume + Math.random() * 10000
          };
          
          setCurrentPrice(newClose);
          setPriceChange(newClose - lastCandle.close);
          
          return [...prevData.slice(0, -1), updatedCandle];
        });
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [settings.enableRealTimeUpdates, candleData.length]);

  // أنماط التصميم المحسنة
  const styles = {
    container: {
      width: '100%',
      height: '100vh',
      backgroundColor: CANDLESTICK_COLORS.background,
      color: CANDLESTICK_COLORS.text,
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 20px',
      backgroundColor: 'rgba(26, 26, 26, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '2px solid #333',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      background: 'linear-gradient(45deg, #FFD700, #FFA500)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    controls: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    button: {
      padding: '10px 16px',
      background: 'linear-gradient(45deg, #333, #555)',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
    },
    activeButton: {
      background: 'linear-gradient(45deg, #FFD700, #FFA500)',
      color: '#000',
      boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
    },
    chartContainer: {
      flex: 1,
      position: 'relative',
      height: 'calc(100vh - 80px)'
    },
    canvas: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%'
    },
    sidebar: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      width: '320px',
      maxHeight: 'calc(100vh - 120px)',
      backgroundColor: 'rgba(26, 26, 26, 0.95)',
      backdropFilter: 'blur(15px)',
      border: '1px solid #444',
      borderRadius: '12px',
      padding: '20px',
      overflowY: 'auto',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
    },
    sidebarTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '15px',
      color: '#FFD700',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    patternItem: {
      padding: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      marginBottom: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'all 0.3s ease'
    },
    levelItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 12px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      fontSize: '13px'
    },
    footer: {
      padding: '12px 20px',
      backgroundColor: 'rgba(26, 26, 26, 0.95)',
      borderTop: '1px solid #333',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backdropFilter: 'blur(10px)'
    }
  };

  return (
    <div style={styles.container}>
      {/* رأس الصفحة المحسن */}
      <div style={styles.header}>
        <div style={styles.title}>
          🕯️ تحليل الشموع اليابانية المتقدم مع جان
        </div>
        <div style={styles.controls}>
          <select 
            value={settings.timeframe}
            onChange={(e) => setSettings(prev => ({ ...prev, timeframe: e.target.value }))}
            style={styles.button}
          >
            {timeframes.map(tf => (
              <option key={tf.value} value={tf.value}>{tf.label}</option>
            ))}
          </select>
          
          <button 
            style={{...styles.button, ...(showMarketSelector ? styles.activeButton : {})}}
            onClick={() => setShowMarketSelector(!showMarketSelector)}
          >
            🌍 الأسواق
          </button>
          <button 
            style={{...styles.button, ...(showTechnicalAnalysis ? styles.activeButton : {})}}
            onClick={() => setShowTechnicalAnalysis(!showTechnicalAnalysis)}
          >
            📊 التحليل الفني
          </button>
          <button 
            style={{...styles.button, ...(showAdvancedOverlay ? styles.activeButton : {})}}
            onClick={() => setShowAdvancedOverlay(!showAdvancedOverlay)}
          >
            🔬 التحليل المتقدم
          </button>
          <button 
            style={{...styles.button, ...(showMarketSettings ? styles.activeButton : {})}}
            onClick={() => setShowMarketSettings(!showMarketSettings)}
          >
            ⚙️ الإعدادات
          </button>
        </div>
      </div>

      {/* منطقة الرسم البياني متعددة الطبقات */}
      <div style={styles.chartContainer}>
        <canvas ref={canvasRef} style={styles.canvas} />
        <canvas ref={volumeCanvasRef} style={styles.canvas} />
        <canvas ref={overlayCanvasRef} style={styles.canvas} />
        
        {/* الشريط الجانبي المحسن */}
        {showAdvancedOverlay && (
          <div style={styles.sidebar}>
            <div style={styles.sidebarTitle}>📊 التحليل المتكامل</div>
            
            {/* معلومات السوق */}
            <div style={{ marginBottom: '20px' }}>
              <div style={styles.sidebarTitle}>💰 معلومات السعر</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFD700' }}>
                ${currentPrice.toFixed(2)}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: priceChange >= 0 ? '#00FF41' : '#FF0040',
                fontWeight: 'bold'
              }}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({((priceChange / currentPrice) * 100).toFixed(2)}%)
              </div>
            </div>

            {/* الأنماط المكتشفة */}
            {detectedPatterns.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={styles.sidebarTitle}>🕯️ أنماط الشموع المكتشفة</div>
                {detectedPatterns.slice(0, 5).map((pattern, index) => (
                  <div key={index} style={styles.patternItem}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                      <span style={{ fontSize: '16px' }}>{pattern.icon}</span>
                      <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{pattern.name}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#ccc' }}>
                      الثقة: {Math.round(pattern.confidence * 100)}% | القوة: {pattern.strength}
                    </div>
                    <div style={{ fontSize: '11px', color: '#999', marginTop: '3px' }}>
                      {pattern.description}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* التحليل المتكامل */}
            {marketAnalysis && (
              <div style={{ marginBottom: '20px' }}>
                <div style={styles.sidebarTitle}>🎯 تحليل السوق</div>
                <div style={styles.levelItem}>
                  <span>الاتجاه:</span>
                  <span style={{ 
                    color: marketAnalysis.trend === 'صاعد' ? '#00FF41' : 
                           marketAnalysis.trend === 'هابط' ? '#FF0040' : '#FFD700' 
                  }}>
                    {marketAnalysis.trend}
                  </span>
                </div>
                <div style={styles.levelItem}>
                  <span>القوة:</span>
                  <span>{marketAnalysis.strength}</span>
                </div>
                <div style={styles.levelItem}>
                  <span>الثقة:</span>
                  <span>{marketAnalysis.confidence}%</span>
                </div>
                <div style={styles.levelItem}>
                  <span>المعنويات:</span>
                  <span>{marketAnalysis.marketSentiment}</span>
                </div>
              </div>
            )}

            {/* التوصيات */}
            {recommendations.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={styles.sidebarTitle}>💡 التوصيات</div>
                {recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} style={styles.patternItem}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{rec.icon}</span>
                      <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{rec.action}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#ccc', marginTop: '3px' }}>
                      {rec.description}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* مستويات التحليل الفني */}
            <div style={{ marginBottom: '20px' }}>
              <div style={styles.sidebarTitle}>📈 أنماط التحليل المتقدم</div>
              <div style={styles.levelItem}>
                <span>🔄 تحليل جان</span>
                <span style={{ color: '#00FF41' }}>نشط ({gannLevels.length})</span>
              </div>
              <div style={styles.levelItem}>
                <span>📊 مستويات فيبوناتشي</span>
                <span style={{ color: '#00FF41' }}>نشط ({fibonacciLevels.length})</span>
              </div>
              <div style={styles.levelItem}>
                <span>📈 أنماط الشموع</span>
                <span style={{ color: '#00FF41' }}>نشط ({detectedPatterns.length})</span>
              </div>
              {integratedAnalysis && (
                <div style={styles.levelItem}>
                  <span>🎯 التحليل المتكامل</span>
                  <span style={{ color: '#FFD700' }}>متقدم ({integratedAnalysis.length})</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* تذييل محسن */}
      <div style={styles.footer}>
        <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#999' }}>
          <span>🕯️ الشموع: صعود({CANDLESTICK_COLORS.bullish}) - هبوط({CANDLESTICK_COLORS.bearish}) - انعكاس({CANDLESTICK_COLORS.reversal})</span>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#999' }}>
          <span>🔄 تحديث مباشر</span>
          <span>📊 تحليل متكامل</span>
          <span>🎯 دقة عالية</span>
        </div>
      </div>

      {/* النوافذ المنبثقة */}
      {showMarketSelector && (
        <MarketSelector 
          onClose={() => setShowMarketSelector(false)}
          onSelectMarket={(marketId) => {
            const market = availableMarkets.find(m => m.id === marketId);
            if (market) addMarketWatch(market);
          }}
          availableMarkets={availableMarkets}
        />
      )}

      {showTechnicalAnalysis && (
        <TechnicalAnalysisPanel 
          onClose={() => setShowTechnicalAnalysis(false)}
          candleData={candleData}
          patterns={detectedPatterns}
          gannLevels={gannLevels}
          fibonacciLevels={fibonacciLevels}
          integratedAnalysis={integratedAnalysis}
        />
      )}

      {showMarketSettings && (
        <MarketDataSettings 
          onClose={() => setShowMarketSettings(false)}
          settings={settings}
          onSettingsChange={setSettings}
        />
      )}

      {showConsensusPanel && (
        <MultiTimeframeConsensus 
          position={{ x: 20, y: 90 }}
          width={300}
          height={220}
          candleData={candleData}
          patterns={detectedPatterns}
          marketAnalysis={marketAnalysis}
        />
      )}
    </div>
  );
});

EnhancedJapaneseCandlestickContent.displayName = 'EnhancedJapaneseCandlestickContent';

// المكون الرئيسي مع Provider
const EnhancedJapaneseCandlestickAnalysis = React.forwardRef((props, ref) => {
  return (
    <MarketDataProvider>
      <EnhancedJapaneseCandlestickContent {...props} ref={ref} />
    </MarketDataProvider>
  );
});

EnhancedJapaneseCandlestickAnalysis.displayName = 'EnhancedJapaneseCandlestickAnalysis';

export default EnhancedJapaneseCandlestickAnalysis;
