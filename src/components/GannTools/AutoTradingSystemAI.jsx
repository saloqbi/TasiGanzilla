import React, { useRef, useEffect, useState, useCallback } from 'react';

// 🚀 دالة throttle محسنة للأداء العالي
const throttle = (func, delay = 4) => {
  let timeoutId;
  let lastExecTime = 0;
  return function (...args) {
    const currentTime = Date.now();
    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay);
    }
  };
};

// 🤖 نظام التداول الآلي الذكي المتقدم
const AutoTradingSystemAI = () => {
  const canvasRef = useRef(null);
  const [candleData, setCandleData] = useState([]);
  const [zoomState, setZoomState] = useState({ scale: 1, offsetX: 0 });
  
  // حالات النظام الآلي
  const [autoTradingEnabled, setAutoTradingEnabled] = useState(false);
  const [tradingStrategy, setTradingStrategy] = useState('ai_advanced');
  const [riskLevel, setRiskLevel] = useState('medium');
  const [portfolioBalance, setPortfolioBalance] = useState(100000);
  const [currentPosition, setCurrentPosition] = useState(null);
  
  // إعدادات التداول المتقدمة
  const [tradingSettings, setTradingSettings] = useState({
    maxPositionSize: 10000, // الحد الأقصى لحجم الصفقة
    stopLoss: 2, // نسبة وقف الخسارة %
    takeProfit: 4, // نسبة جني الأرباح %
    maxDailyTrades: 5, // الحد الأقصى للصفقات اليومية
    minConfidence: 75, // الحد الأدنى لمستوى الثقة %
    tradingHours: { start: 9, end: 16 } // ساعات التداول
  });
  
  // إحصائيات التداول
  const [tradingStats, setTradingStats] = useState({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    totalProfit: 0,
    winRate: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
    dailyTrades: 0
  });
  
  // سجل التداول
  const [tradeHistory, setTradeHistory] = useState([]);
  const [activeSignals, setActiveSignals] = useState([]);
  
  // AI Analysis States
  const [aiAnalysis, setAiAnalysis] = useState({
    trend: 'bullish',
    strength: 75,
    signals: ['buy', 'hold'],
    prediction: 'up',
    confidence: 82,
    riskAssessment: 'medium',
    entryPoints: [],
    exitPoints: []
  });
  
  const [technicalIndicators, setTechnicalIndicators] = useState({
    ma20: 11200,
    ma50: 11150,
    rsi: 68,
    support: 11100,
    resistance: 11400,
    macd: { signal: 'bullish', histogram: 12.5 },
    bollinger: { upper: 11350, lower: 11050, squeeze: false }
  });

  // بيانات السوق المحاكاة
  const [marketData, setMarketData] = useState({
    symbol: 'TASI',
    price: 11250.50,
    change: +125.30,
    changePercent: +1.12,
    volume: 45680000,
    bid: 11249.50,
    ask: 11251.50,
    high24h: 11300.00,
    low24h: 11100.00,
    volatility: 0.15
  });

  // إنشاء بيانات تجريبية متقدمة
  const generateAdvancedData = () => {
    const data = [];
    let price = 11000;
    const currentTime = Date.now();
    
    for (let i = 0; i < 100; i++) {
      const timeOffset = i * 60000; // كل دقيقة
      const volatility = 0.002 + Math.random() * 0.008; // تقلبات متغيرة
      const trend = Math.sin(i * 0.1) * 0.001; // اتجاه عام
      const change = (Math.random() - 0.5) * volatility * price + trend * price;
      
      const open = price;
      const close = open + change;
      const high = Math.max(open, close) * (1 + Math.random() * 0.005);
      const low = Math.min(open, close) * (1 - Math.random() * 0.005);
      
      data.push({
        timestamp: currentTime - (100 - i) * timeOffset,
        open: open,
        high: high,
        low: low,
        close: close,
        volume: Math.floor(Math.random() * 2000000) + 500000
      });
      
      price = close;
    }
    
    return data;
  };

  // 🧠 حساب المتوسطات المتحركة المتقدمة
  const calculateAdvancedMA = useCallback((data, period, type = 'SMA') => {
    if (data.length < period) return null;
    
    if (type === 'SMA') {
      const sum = data.slice(-period).reduce((acc, candle) => acc + candle.close, 0);
      return sum / period;
    } else if (type === 'EMA') {
      const multiplier = 2 / (period + 1);
      let ema = data[data.length - period].close;
      for (let i = data.length - period + 1; i < data.length; i++) {
        ema = (data[i].close - ema) * multiplier + ema;
      }
      return ema;
    }
    return null;
  }, []);

  // 🧠 حساب MACD المتقدم
  const calculateMACD = useCallback((data) => {
    if (data.length < 26) return { macd: 0, signal: 0, histogram: 0, trend: 'neutral' };
    
    const ema12 = calculateAdvancedMA(data, 12, 'EMA');
    const ema26 = calculateAdvancedMA(data, 26, 'EMA');
    const macd = ema12 - ema26;
    
    // حساب خط الإشارة (EMA 9 للـ MACD)
    const macdHistory = [];
    for (let i = 26; i <= data.length; i++) {
      const slice = data.slice(0, i);
      const ema12_i = calculateAdvancedMA(slice, 12, 'EMA');
      const ema26_i = calculateAdvancedMA(slice, 26, 'EMA');
      macdHistory.push(ema12_i - ema26_i);
    }
    
    const signal = macdHistory.length >= 9 ? 
      macdHistory.slice(-9).reduce((a, b) => a + b) / 9 : macd;
    
    const histogram = macd - signal;
    const trend = histogram > 0 ? 'bullish' : 'bearish';
    
    return { macd, signal: trend, histogram, trend };
  }, [calculateAdvancedMA]);

  // 🧠 حساب Bollinger Bands
  const calculateBollingerBands = useCallback((data, period = 20, stdDev = 2) => {
    if (data.length < period) return { upper: 0, lower: 0, middle: 0, squeeze: false };
    
    const prices = data.slice(-period).map(d => d.close);
    const sma = prices.reduce((a, b) => a + b) / period;
    const variance = prices.reduce((acc, price) => acc + Math.pow(price - sma, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);
    
    const upper = sma + (standardDeviation * stdDev);
    const lower = sma - (standardDeviation * stdDev);
    const squeeze = (upper - lower) / sma < 0.1; // تحديد حالة الضغط
    
    return { upper, lower, middle: sma, squeeze };
  }, []);

  // 🤖 محرك التداول الآلي المتقدم
  const runAdvancedTradingEngine = useCallback((data) => {
    if (data.length < 50) return;
    
    const currentPrice = data[data.length - 1].close;
    const ma20 = calculateAdvancedMA(data, 20);
    const ma50 = calculateAdvancedMA(data, 50);
    const ema12 = calculateAdvancedMA(data, 12, 'EMA');
    const rsi = calculateRSI(data);
    const macd = calculateMACD(data);
    const bollinger = calculateBollingerBands(data);
    
    // تحليل الاتجاه المتقدم
    const trendSignals = [];
    if (currentPrice > ma20 && ma20 > ma50) trendSignals.push('strong_bullish');
    if (currentPrice > ema12 && ema12 > ma20) trendSignals.push('momentum_bullish');
    if (macd.trend === 'bullish' && macd.histogram > 0) trendSignals.push('macd_bullish');
    
    // تحديد قوة الاتجاه
    const trendStrength = Math.min(
      (Math.abs(currentPrice - ma20) / ma20 * 100) + 
      (trendSignals.length * 20) + 
      (Math.abs(macd.histogram) * 10), 
      100
    );
    
    // تقييم المخاطر الذكي
    const volatility = calculateVolatility(data.slice(-20));
    const riskFactors = [];
    if (volatility > 0.03) riskFactors.push('high_volatility');
    if (rsi > 80 || rsi < 20) riskFactors.push('extreme_rsi');
    if (bollinger.squeeze) riskFactors.push('bollinger_squeeze');
    
    const riskLevel = riskFactors.length > 2 ? 'high' : 
                     riskFactors.length > 0 ? 'medium' : 'low';
    
    // توليد الإشارات التلقائية
    const signals = [];
    let confidence = 50;
    
    // إشارات الشراء
    if (trendSignals.includes('strong_bullish') && rsi < 70 && !bollinger.squeeze) {
      signals.push('strong_buy');
      confidence += 25;
    }
    if (currentPrice > bollinger.lower && currentPrice < bollinger.middle && rsi < 50) {
      signals.push('buy_dip');
      confidence += 15;
    }
    
    // إشارات البيع
    if (rsi > 75 && currentPrice > bollinger.upper) {
      signals.push('overbought_sell');
      confidence += 20;
    }
    if (macd.trend === 'bearish' && currentPrice < ma20) {
      signals.push('trend_reversal_sell');
      confidence += 15;
    }
    
    // تحديد نقاط الدخول والخروج
    const entryPoints = [];
    const exitPoints = [];
    
    if (signals.includes('strong_buy')) {
      entryPoints.push({
        price: currentPrice,
        type: 'market',
        confidence: Math.min(confidence, 95)
      });
    }
    
    if (currentPosition && signals.includes('overbought_sell')) {
      exitPoints.push({
        price: currentPrice,
        type: 'market',
        reason: 'take_profit'
      });
    }
    
    // تحديث التحليل
    setAiAnalysis({
      trend: trendSignals.length > 0 ? 'bullish' : 'bearish',
      strength: Math.round(trendStrength),
      signals: signals,
      prediction: confidence > 70 ? 'up' : confidence < 40 ? 'down' : 'sideways',
      confidence: Math.min(confidence, 95),
      riskAssessment: riskLevel,
      entryPoints,
      exitPoints
    });
    
    setTechnicalIndicators({
      ma20: ma20?.toFixed(2) || 0,
      ma50: ma50?.toFixed(2) || 0,
      rsi: Math.round(rsi),
      support: Math.min(...data.slice(-20).map(d => d.low)).toFixed(2),
      resistance: Math.max(...data.slice(-20).map(d => d.high)).toFixed(2),
      macd,
      bollinger
    });
    
    // تنفيذ التداول الآلي
    if (autoTradingEnabled && confidence >= tradingSettings.minConfidence) {
      executeAutoTrade(signals, currentPrice, confidence);
    }
    
  }, [calculateAdvancedMA, calculateMACD, calculateBollingerBands, autoTradingEnabled, tradingSettings, currentPosition]);

  // 🧠 حساب RSI المحسن
  const calculateRSI = useCallback((data, period = 14) => {
    if (data.length < period + 1) return 50;
    
    let gains = 0, losses = 0;
    for (let i = data.length - period; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }, []);

  // حساب التقلبات
  const calculateVolatility = useCallback((data) => {
    if (data.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < data.length; i++) {
      returns.push((data[i].close - data[i - 1].close) / data[i - 1].close);
    }
    
    const mean = returns.reduce((a, b) => a + b) / returns.length;
    const variance = returns.reduce((acc, ret) => acc + Math.pow(ret - mean, 2), 0) / returns.length;
    return Math.sqrt(variance * 252); // تقلبات سنوية
  }, []);

  // 🤖 تنفيذ التداول الآلي
  const executeAutoTrade = useCallback((signals, currentPrice, confidence) => {
    const currentTime = new Date();
    const hour = currentTime.getHours();
    
    // التحقق من ساعات التداول
    if (hour < tradingSettings.tradingHours.start || hour > tradingSettings.tradingHours.end) {
      return;
    }
    
    // التحقق من الحد الأقصى للصفقات اليومية
    if (tradingStats.dailyTrades >= tradingSettings.maxDailyTrades) {
      return;
    }
    
    // تنفيذ صفقة شراء
    if (signals.includes('strong_buy') && !currentPosition) {
      const positionSize = Math.min(
        tradingSettings.maxPositionSize,
        portfolioBalance * 0.1 // 10% من الرصيد
      );
      
      const newTrade = {
        id: Date.now(),
        type: 'buy',
        symbol: marketData.symbol,
        price: currentPrice,
        quantity: Math.floor(positionSize / currentPrice),
        timestamp: currentTime,
        confidence: confidence,
        stopLoss: currentPrice * (1 - tradingSettings.stopLoss / 100),
        takeProfit: currentPrice * (1 + tradingSettings.takeProfit / 100),
        status: 'open'
      };
      
      setCurrentPosition(newTrade);
      setTradeHistory(prev => [newTrade, ...prev]);
      setTradingStats(prev => ({
        ...prev,
        totalTrades: prev.totalTrades + 1,
        dailyTrades: prev.dailyTrades + 1
      }));
      
      // إضافة إشعار
      setActiveSignals(prev => [...prev, {
        id: Date.now(),
        type: 'trade_executed',
        message: `تم تنفيذ صفقة شراء بسعر ${currentPrice.toFixed(2)}`,
        timestamp: currentTime,
        confidence: confidence
      }]);
    }
    
    // تنفيذ صفقة بيع
    if (currentPosition && (signals.includes('overbought_sell') || 
        currentPrice <= currentPosition.stopLoss || 
        currentPrice >= currentPosition.takeProfit)) {
      
      const profit = (currentPrice - currentPosition.price) * currentPosition.quantity;
      const profitPercent = ((currentPrice - currentPosition.price) / currentPosition.price) * 100;
      
      const closedTrade = {
        ...currentPosition,
        exitPrice: currentPrice,
        exitTime: currentTime,
        profit: profit,
        profitPercent: profitPercent,
        status: 'closed'
      };
      
      setTradeHistory(prev => prev.map(trade => 
        trade.id === currentPosition.id ? closedTrade : trade
      ));
      
      setCurrentPosition(null);
      setPortfolioBalance(prev => prev + profit);
      
      setTradingStats(prev => ({
        ...prev,
        totalProfit: prev.totalProfit + profit,
        winningTrades: profit > 0 ? prev.winningTrades + 1 : prev.winningTrades,
        losingTrades: profit < 0 ? prev.losingTrades + 1 : prev.losingTrades,
        winRate: prev.totalTrades > 0 ? ((profit > 0 ? prev.winningTrades + 1 : prev.winningTrades) / prev.totalTrades) * 100 : 0
      }));
      
      setActiveSignals(prev => [...prev, {
        id: Date.now(),
        type: 'trade_closed',
        message: `تم إغلاق الصفقة بربح ${profit.toFixed(2)} (${profitPercent.toFixed(2)}%)`,
        timestamp: currentTime,
        confidence: 100
      }]);
    }
  }, [tradingSettings, tradingStats, currentPosition, portfolioBalance, marketData.symbol]);

  // معالج التكبير المحسن
  const handleZoom = useCallback(throttle((event) => {
    event.preventDefault();
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    setZoomState(prev => ({
      scale: Math.min(Math.max(prev.scale * zoomFactor, 0.1), 5),
      offsetX: prev.offsetX
    }));
  }, 4), []);

  // رسم المخطط المتقدم
  const drawAdvancedChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || candleData.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 600;
    
    // مسح Canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // إعدادات الرسم
    const padding = 80;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    const candleWidth = (chartWidth / candleData.length * 0.8) * zoomState.scale;
    
    // حساب أعلى وأقل سعر
    const prices = candleData.flatMap(d => [d.high, d.low]);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;
    
    // رسم Bollinger Bands
    if (technicalIndicators.bollinger) {
      const { upper, lower, middle } = technicalIndicators.bollinger;
      
      // الشريط العلوي
      const upperY = padding + (maxPrice - upper) / priceRange * chartHeight;
      const middleY = padding + (maxPrice - middle) / priceRange * chartHeight;
      const lowerY = padding + (maxPrice - lower) / priceRange * chartHeight;
      
      // رسم المنطقة
      ctx.fillStyle = 'rgba(100, 150, 255, 0.1)';
      ctx.fillRect(padding, upperY, chartWidth, lowerY - upperY);
      
      // رسم الخطوط
      ctx.strokeStyle = '#6496FF';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      
      [upperY, middleY, lowerY].forEach(y => {
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
      });
      
      ctx.setLineDash([]);
    }
    
    // رسم خطوط الدعم والمقاومة
    const supportY = padding + (maxPrice - technicalIndicators.support) / priceRange * chartHeight;
    const resistanceY = padding + (maxPrice - technicalIndicators.resistance) / priceRange * chartHeight;
    
    // خط الدعم
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding, supportY);
    ctx.lineTo(canvas.width - padding, supportY);
    ctx.stroke();
    
    // خط المقاومة
    ctx.strokeStyle = '#f44336';
    ctx.beginPath();
    ctx.moveTo(padding, resistanceY);
    ctx.lineTo(canvas.width - padding, resistanceY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // رسم المتوسطات المتحركة
    const ma20Y = padding + (maxPrice - technicalIndicators.ma20) / priceRange * chartHeight;
    const ma50Y = padding + (maxPrice - technicalIndicators.ma50) / priceRange * chartHeight;
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, ma20Y);
    ctx.lineTo(canvas.width - padding, ma20Y);
    ctx.stroke();
    
    ctx.strokeStyle = '#FF9800';
    ctx.beginPath();
    ctx.moveTo(padding, ma50Y);
    ctx.lineTo(canvas.width - padding, ma50Y);
    ctx.stroke();
    
    // رسم الشموع مع تحليل متقدم
    candleData.forEach((candle, index) => {
      const x = padding + (index * (candleWidth + 2) * zoomState.scale) + zoomState.offsetX;
      
      if (x < -candleWidth || x > canvas.width) return;
      
      const openY = padding + (maxPrice - candle.open) / priceRange * chartHeight;
      const closeY = padding + (maxPrice - candle.close) / priceRange * chartHeight;
      const highY = padding + (maxPrice - candle.high) / priceRange * chartHeight;
      const lowY = padding + (maxPrice - candle.low) / priceRange * chartHeight;
      
      const isGreen = candle.close > candle.open;
      let candleColor = isGreen ? '#4CAF50' : '#f44336';
      
      // تلوين الشموع حسب القوة
      const strength = Math.abs(candle.close - candle.open) / candle.open;
      if (strength > 0.02) {
        candleColor = isGreen ? '#00E676' : '#FF1744'; // ألوان أقوى للحركات الكبيرة
      }
      
      // رسم الفتيل
      ctx.strokeStyle = candleColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, highY);
      ctx.lineTo(x + candleWidth / 2, lowY);
      ctx.stroke();
      
      // رسم جسم الشمعة
      ctx.fillStyle = candleColor;
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY) || 2;
      
      ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
      
      // إضافة نقاط الدخول والخروج
      if (aiAnalysis.entryPoints.length > 0 && index === candleData.length - 1) {
        ctx.fillStyle = '#00E676';
        ctx.beginPath();
        ctx.arc(x + candleWidth / 2, closeY, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('دخول', x + candleWidth / 2, closeY - 15);
      }
    });
    
    // العنوان المتقدم
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`🤖 ${marketData.symbol} - AI Auto Trading System`, canvas.width / 2, 30);
    
    // معلومات متقدمة
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    
    // معلومات الشركة والأداء
    const infoY = 60;
    ctx.fillStyle = '#4CAF50';
    ctx.fillText(`الدعم: ${technicalIndicators.support}`, padding, infoY);
    ctx.fillStyle = '#f44336';
    ctx.fillText(`المقاومة: ${technicalIndicators.resistance}`, padding + 150, infoY);
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`MA20: ${technicalIndicators.ma20}`, padding + 320, infoY);
    ctx.fillStyle = '#FF9800';
    ctx.fillText(`MA50: ${technicalIndicators.ma50}`, padding + 480, infoY);
    
    // إشارات التداول
    if (autoTradingEnabled) {
      ctx.fillStyle = '#00E676';
      ctx.fillText('🤖 التداول الآلي نشط', canvas.width - 200, infoY);
    }
    
  }, [candleData, zoomState, marketData.symbol, technicalIndicators, aiAnalysis.entryPoints, autoTradingEnabled]);

  // تحميل البيانات
  useEffect(() => {
    setCandleData(generateAdvancedData());
  }, []);

  // رسم المخطط
  useEffect(() => {
    drawAdvancedChart();
  }, [drawAdvancedChart]);

  // تشغيل محرك التداول
  useEffect(() => {
    if (candleData.length > 50) {
      runAdvancedTradingEngine(candleData);
    }
  }, [candleData, runAdvancedTradingEngine]);

  // تحديث تلقائي للبيانات والتحليل
  useEffect(() => {
    const interval = setInterval(() => {
      if (candleData.length > 50) {
        // تحديث آخر شمعة
        setCandleData(prev => {
          const newData = [...prev];
          const lastCandle = newData[newData.length - 1];
          const priceChange = (Math.random() - 0.5) * 0.01 * lastCandle.close;
          
          newData[newData.length - 1] = {
            ...lastCandle,
            close: lastCandle.close + priceChange,
            high: Math.max(lastCandle.high, lastCandle.close + priceChange),
            low: Math.min(lastCandle.low, lastCandle.close + priceChange)
          };
          
          return newData;
        });
        
        // تحديث سعر السوق
        setMarketData(prev => ({
          ...prev,
          price: candleData[candleData.length - 1]?.close || prev.price
        }));
      }
    }, 2000); // تحديث كل ثانيتين
    
    return () => clearInterval(interval);
  }, [candleData]);

  // تنظيف الإشعارات القديمة
  useEffect(() => {
    const cleanup = setInterval(() => {
      setActiveSignals(prev => prev.filter(signal => 
        Date.now() - signal.timestamp < 30000 // إبقاء الإشعارات لـ 30 ثانية
      ));
    }, 5000);
    
    return () => clearInterval(cleanup);
  }, []);

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: '#0a0a0a',
      color: '#fff',
      textAlign: 'center',
      minHeight: '100vh'
    }}>
      <h1>🤖 نظام التداول الآلي الذكي المتقدم</h1>
      <p style={{ color: '#ccc', marginBottom: '20px' }}>الجيل الرابع - تداول آلي مع ذكاء اصطناعي متطور</p>
      
      {/* لوحة التحكم الرئيسية */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        
        {/* لوحة حالة التداول الآلي */}
        <div style={{
          background: autoTradingEnabled ? 
            'linear-gradient(135deg, #4CAF50, #45a049)' : 
            'linear-gradient(135deg, #f44336, #d32f2f)',
          padding: '20px',
          borderRadius: '15px',
          border: `3px solid ${autoTradingEnabled ? '#4CAF50' : '#f44336'}`
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>
            {autoTradingEnabled ? '🟢 التداول الآلي نشط' : '🔴 التداول الآلي متوقف'}
          </h3>
          
          <button
            onClick={() => setAutoTradingEnabled(!autoTradingEnabled)}
            style={{
              background: autoTradingEnabled ? '#d32f2f' : '#4CAF50',
              color: '#fff',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              width: '100%'
            }}
          >
            {autoTradingEnabled ? '⏹️ إيقاف التداول' : '▶️ تشغيل التداول'}
          </button>
          
          <div style={{ marginTop: '15px', fontSize: '14px' }}>
            <div>الاستراتيجية: {tradingStrategy === 'ai_advanced' ? '🧠 ذكي متقدم' : '📊 تقليدي'}</div>
            <div>مستوى المخاطر: {riskLevel === 'low' ? '🟢 منخفض' : riskLevel === 'medium' ? '🟡 متوسط' : '🔴 عالي'}</div>
          </div>
        </div>

        {/* لوحة الأداء المالي */}
        <div style={{
          background: 'linear-gradient(135deg, #2196F3, #1976D2)',
          padding: '20px',
          borderRadius: '15px',
          border: '3px solid #2196F3'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>💰 الأداء المالي</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            fontSize: '14px'
          }}>
            <div>
              <div style={{ color: '#E3F2FD' }}>الرصيد</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                ${portfolioBalance.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ color: '#E3F2FD' }}>إجمالي الربح</div>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: 'bold',
                color: tradingStats.totalProfit >= 0 ? '#4CAF50' : '#f44336'
              }}>
                ${tradingStats.totalProfit.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ color: '#E3F2FD' }}>معدل النجاح</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {tradingStats.winRate.toFixed(1)}%
              </div>
            </div>
            <div>
              <div style={{ color: '#E3F2FD' }}>الصفقات اليوم</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {tradingStats.dailyTrades}/{tradingSettings.maxDailyTrades}
              </div>
            </div>
          </div>
        </div>

        {/* لوحة التحليل الذكي المتقدم */}
        <div style={{
          background: 'linear-gradient(135deg, #9C27B0, #7B1FA2)',
          padding: '20px',
          borderRadius: '15px',
          border: '3px solid #9C27B0'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>🧠 التحليل الذكي المتقدم</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            fontSize: '13px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#F3E5F5' }}>الاتجاه</div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: aiAnalysis.trend === 'bullish' ? '#4CAF50' : '#f44336'
              }}>
                {aiAnalysis.trend === 'bullish' ? '📈 صاعد' : '📉 هابط'}
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#F3E5F5' }}>مستوى الثقة</div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: aiAnalysis.confidence > 80 ? '#4CAF50' : 
                       aiAnalysis.confidence > 60 ? '#FF9800' : '#f44336'
              }}>
                {aiAnalysis.confidence}%
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#F3E5F5' }}>تقييم المخاطر</div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold',
                color: aiAnalysis.riskAssessment === 'low' ? '#4CAF50' : 
                       aiAnalysis.riskAssessment === 'medium' ? '#FF9800' : '#f44336'
              }}>
                {aiAnalysis.riskAssessment === 'low' ? '🟢 منخفض' : 
                 aiAnalysis.riskAssessment === 'medium' ? '🟡 متوسط' : '🔴 عالي'}
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#F3E5F5' }}>الإشارات</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                {aiAnalysis.signals.length} إشارة
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* الصفقة الحالية */}
      {currentPosition && (
        <div style={{
          background: 'linear-gradient(135deg, #FF9800, #F57C00)',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '20px',
          border: '3px solid #FF9800'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>📊 الصفقة الحالية</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '15px',
            fontSize: '14px'
          }}>
            <div>
              <div style={{ color: '#FFF3E0' }}>الرمز</div>
              <div style={{ fontWeight: 'bold' }}>{currentPosition.symbol}</div>
            </div>
            <div>
              <div style={{ color: '#FFF3E0' }}>سعر الدخول</div>
              <div style={{ fontWeight: 'bold' }}>{currentPosition.price.toFixed(2)}</div>
            </div>
            <div>
              <div style={{ color: '#FFF3E0' }}>الكمية</div>
              <div style={{ fontWeight: 'bold' }}>{currentPosition.quantity}</div>
            </div>
            <div>
              <div style={{ color: '#FFF3E0' }}>وقف الخسارة</div>
              <div style={{ fontWeight: 'bold', color: '#f44336' }}>
                {currentPosition.stopLoss.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ color: '#FFF3E0' }}>جني الأرباح</div>
              <div style={{ fontWeight: 'bold', color: '#4CAF50' }}>
                {currentPosition.takeProfit.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ color: '#FFF3E0' }}>الربح/الخسارة</div>
              <div style={{ 
                fontWeight: 'bold',
                color: (marketData.price - currentPosition.price) >= 0 ? '#4CAF50' : '#f44336'
              }}>
                {((marketData.price - currentPosition.price) * currentPosition.quantity).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* الإشعارات النشطة */}
      {activeSignals.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #4CAF50, #45a049)',
          padding: '15px',
          borderRadius: '15px',
          marginBottom: '20px',
          border: '2px solid #4CAF50'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>🚨 الإشعارات النشطة</h4>
          {activeSignals.slice(0, 3).map((signal, index) => (
            <div key={signal.id} style={{
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '8px 15px',
              borderRadius: '8px',
              margin: '5px 0',
              fontSize: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{signal.message}</span>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>
                {new Date(signal.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* المخطط المتقدم */}
      <div style={{
        border: '3px solid #6B73FF',
        borderRadius: '15px',
        padding: '15px',
        backgroundColor: '#0a0a0a',
        display: 'inline-block',
        boxShadow: '0 0 25px rgba(107, 115, 255, 0.5)'
      }}>
        <canvas
          ref={canvasRef}
          onWheel={handleZoom}
          style={{
            backgroundColor: '#0a0a0a',
            display: 'block',
            cursor: 'grab'
          }}
        />
      </div>
      
      <div style={{ 
        marginTop: '20px',
        fontSize: '14px',
        color: '#ccc',
        maxWidth: '1000px',
        margin: '20px auto'
      }}>
        <p>🤖 <strong>تداول آلي ذكي:</strong> تنفيذ تلقائي للصفقات بناءً على التحليل المتقدم</p>
        <p>📊 <strong>مؤشرات متقدمة:</strong> MACD, Bollinger Bands, RSI, MA</p>
        <p>⚡ <strong>أداء فائق:</strong> 4ms استجابة + تحليل مستمر</p>
        <p>🎯 <strong>إدارة المخاطر:</strong> وقف خسارة وجني أرباح تلقائي</p>
        <p>📈 <strong>إحصائيات شاملة:</strong> تتبع الأداء والأرباح</p>
      </div>
    </div>
  );
};

AutoTradingSystemAI.displayName = 'AutoTradingSystemAI';

export default AutoTradingSystemAI;
