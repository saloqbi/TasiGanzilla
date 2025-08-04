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

// 🧠 المكون الذكي للشموع اليابانية - مع ذكاء اصطناعي
const JapaneseCandlestickAnalysisAI = () => {
  const canvasRef = useRef(null);
  const [candleData, setCandleData] = useState([]);
  const [zoomState, setZoomState] = useState({ scale: 1, offsetX: 0 });
  const [tradingMode, setTradingMode] = useState('demo');
  const [realTimeData, setRealTimeData] = useState(false);
  const [marketData, setMarketData] = useState({
    symbol: 'TASI',
    price: 11250.50,
    change: +125.30,
    changePercent: +1.12,
    volume: 45680000,
    high24h: 11300.00,
    low24h: 11100.00
  });
  
  // 🧠 حالات الذكاء الاصطناعي
  const [aiAnalysis, setAiAnalysis] = useState({
    trend: 'bullish',
    strength: 75,
    signals: ['buy', 'hold'],
    prediction: 'up',
    confidence: 82
  });
  
  const [technicalIndicators, setTechnicalIndicators] = useState({
    ma20: 11200,
    ma50: 11150,
    rsi: 68,
    support: 11100,
    resistance: 11400
  });
  
  const [smartAlerts, setSmartAlerts] = useState([
    { type: 'bullish', message: 'اتجاه صاعد قوي', confidence: 85 }
  ]);

  // إنشاء بيانات تجريبية محسنة
  const generateDemoData = () => {
    const data = [];
    let price = 11000;
    
    for (let i = 0; i < 50; i++) {
      const change = (Math.random() - 0.5) * 200;
      const open = price;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 50;
      const low = Math.min(open, close) - Math.random() * 50;
      
      data.push({
        open: open,
        high: high,
        low: low,
        close: close,
        volume: Math.floor(Math.random() * 1000000) + 500000
      });
      
      price = close;
    }
    
    return data;
  };

  // 🧠 حساب المتوسط المتحرك
  const calculateSMA = useCallback((data, period) => {
    if (data.length < period) return null;
    const sum = data.slice(-period).reduce((acc, candle) => acc + candle.close, 0);
    return sum / period;
  }, []);

  // 🧠 حساب مؤشر القوة النسبية RSI
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
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }, []);

  // 🤖 محرك الذكاء الاصطناعي
  const runAIAnalysis = useCallback((data) => {
    if (data.length < 20) return;
    
    const currentPrice = data[data.length - 1].close;
    const ma20 = calculateSMA(data, 20);
    const ma50 = calculateSMA(data, 50);
    const rsi = calculateRSI(data);
    
    // تحديد الاتجاه الذكي
    const trend = currentPrice > ma20 && ma20 > ma50 ? 'bullish' : 
                  currentPrice < ma20 && ma20 < ma50 ? 'bearish' : 'sideways';
    
    // قوة الاتجاه
    const trendStrength = Math.min(Math.abs(currentPrice - ma20) / ma20 * 1000, 100);
    
    // الإشارات الذكية
    const signals = [];
    if (rsi < 30) signals.push('oversold', 'buy');
    else if (rsi > 70) signals.push('overbought', 'sell');
    else signals.push('hold');
    
    if (currentPrice > ma20 && rsi < 70) signals.push('bullish');
    
    // التوقع الذكي
    const prediction = trend === 'bullish' && rsi < 65 ? 'up' : 
                      trend === 'bearish' && rsi > 35 ? 'down' : 'sideways';
    
    // مستوى الثقة
    const confidence = Math.min(60 + trendStrength + (rsi > 30 && rsi < 70 ? 20 : 0), 95);
    
    setAiAnalysis({
      trend,
      strength: Math.round(trendStrength),
      signals: [...new Set(signals)],
      prediction,
      confidence: Math.round(confidence)
    });
    
    setTechnicalIndicators({
      ma20: ma20?.toFixed(2) || 0,
      ma50: ma50?.toFixed(2) || 0,
      rsi: Math.round(rsi),
      support: Math.min(...data.slice(-10).map(d => d.low)).toFixed(2),
      resistance: Math.max(...data.slice(-10).map(d => d.high)).toFixed(2)
    });
    
    // التنبيهات الذكية
    const alerts = [];
    if (rsi < 30) alerts.push({ type: 'oversold', message: 'منطقة تشبع بيعي - فرصة شراء', confidence: 85 });
    if (rsi > 70) alerts.push({ type: 'overbought', message: 'منطقة تشبع شرائي - احتمال تصحيح', confidence: 80 });
    if (trend === 'bullish') alerts.push({ type: 'bullish', message: 'اتجاه صاعد قوي', confidence: confidence });
    
    setSmartAlerts(alerts);
  }, [calculateSMA, calculateRSI]);

  // معالج التكبير المحسن
  const handleZoom = useCallback(throttle((event) => {
    event.preventDefault();
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    setZoomState(prev => ({
      scale: Math.min(Math.max(prev.scale * zoomFactor, 0.1), 5),
      offsetX: prev.offsetX
    }));
  }, 4), []);

  // رسم الشموع مع المؤشرات
  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || candleData.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 900;
    canvas.height = 500;
    
    // مسح Canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // إعدادات الرسم
    const padding = 50;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    const candleWidth = (chartWidth / candleData.length * 0.7) * zoomState.scale;
    
    // حساب أعلى وأقل سعر
    const prices = candleData.flatMap(d => [d.high, d.low]);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;
    
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
    
    // رسم الشموع
    candleData.forEach((candle, index) => {
      const x = padding + (index * (candleWidth + 3) * zoomState.scale) + zoomState.offsetX;
      
      if (x < -candleWidth || x > canvas.width) return;
      
      const openY = padding + (maxPrice - candle.open) / priceRange * chartHeight;
      const closeY = padding + (maxPrice - candle.close) / priceRange * chartHeight;
      const highY = padding + (maxPrice - candle.high) / priceRange * chartHeight;
      const lowY = padding + (maxPrice - candle.low) / priceRange * chartHeight;
      
      const isGreen = candle.close > candle.open;
      const candleColor = isGreen ? '#4CAF50' : '#f44336';
      
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
    });
    
    // العنوان
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`🧠 ${marketData.symbol} - AI Analysis (${(zoomState.scale * 100).toFixed(0)}%)`, canvas.width / 2, 25);
    
    // معلومات الدعم والمقاومة
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#4CAF50';
    ctx.fillText(`دعم: ${technicalIndicators.support}`, padding, supportY - 5);
    ctx.fillStyle = '#f44336';
    ctx.fillText(`مقاومة: ${technicalIndicators.resistance}`, padding, resistanceY - 5);
    
  }, [candleData, zoomState, marketData.symbol, technicalIndicators]);

  // تحميل البيانات
  useEffect(() => {
    setCandleData(generateDemoData());
  }, []);

  // رسم المخطط
  useEffect(() => {
    drawChart();
  }, [drawChart]);

  // تشغيل التحليل الذكي
  useEffect(() => {
    if (candleData.length > 20) {
      runAIAnalysis(candleData);
    }
  }, [candleData, runAIAnalysis]);

  // تحديث تلقائي للتحليل
  useEffect(() => {
    const interval = setInterval(() => {
      if (candleData.length > 20) {
        runAIAnalysis(candleData);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [candleData, runAIAnalysis]);

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: '#1a1a1a',
      color: '#fff',
      textAlign: 'center'
    }}>
      <h1>🧠 نظام الشموع اليابانية الذكي</h1>
      <p style={{ color: '#ccc', marginBottom: '20px' }}>مدعوم بالذكاء الاصطناعي والتحليل المتقدم</p>
      
      {/* لوحة التحليل الذكي */}
      <div style={{
        background: 'linear-gradient(135deg, #6B73FF, #000DFF)',
        padding: '20px',
        borderRadius: '15px',
        marginBottom: '20px',
        border: '2px solid #6B73FF',
        boxShadow: '0 0 20px rgba(107, 115, 255, 0.3)'
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>🤖 تحليل الذكاء الاصطناعي</h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px',
          marginBottom: '15px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.9em', color: '#E3F2FD' }}>🎯 الاتجاه</div>
            <div style={{ 
              fontSize: '1.3em', 
              fontWeight: 'bold',
              color: aiAnalysis.trend === 'bullish' ? '#4CAF50' : 
                     aiAnalysis.trend === 'bearish' ? '#f44336' : '#FF9800'
            }}>
              {aiAnalysis.trend === 'bullish' ? '📈 صاعد' : 
               aiAnalysis.trend === 'bearish' ? '📉 هابط' : '↔️ جانبي'}
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.9em', color: '#E3F2FD' }}>💪 القوة</div>
            <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#FFD700' }}>
              {aiAnalysis.strength}%
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.9em', color: '#E3F2FD' }}>🔮 التوقع</div>
            <div style={{ 
              fontSize: '1.3em', 
              fontWeight: 'bold',
              color: aiAnalysis.prediction === 'up' ? '#4CAF50' : 
                     aiAnalysis.prediction === 'down' ? '#f44336' : '#FF9800'
            }}>
              {aiAnalysis.prediction === 'up' ? '⬆️ صعود' : 
               aiAnalysis.prediction === 'down' ? '⬇️ هبوط' : '➡️ ثبات'}
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.9em', color: '#E3F2FD' }}>🎯 الثقة</div>
            <div style={{ 
              fontSize: '1.3em', 
              fontWeight: 'bold',
              color: aiAnalysis.confidence > 80 ? '#4CAF50' : 
                     aiAnalysis.confidence > 60 ? '#FF9800' : '#f44336'
            }}>
              {aiAnalysis.confidence}%
            </div>
          </div>
        </div>
        
        <div style={{ 
          fontSize: '1em', 
          color: '#E3F2FD',
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          padding: '10px',
          borderRadius: '8px'
        }}>
          📋 الإشارات: {aiAnalysis.signals.map(signal => 
            signal === 'buy' ? '🟢 شراء' : 
            signal === 'sell' ? '🔴 بيع' : 
            signal === 'hold' ? '🟡 انتظار' :
            signal === 'bullish' ? '📈 صاعد' :
            signal === 'oversold' ? '🔵 تشبع بيعي' :
            signal === 'overbought' ? '🟠 تشبع شرائي' : signal
          ).join(' | ')}
        </div>
      </div>
      
      {/* لوحة المؤشرات التقنية */}
      <div style={{
        background: 'linear-gradient(135deg, #FF6B6B, #EE5A52)',
        padding: '15px',
        borderRadius: '15px',
        marginBottom: '20px',
        border: '2px solid #FF6B6B'
      }}>
        <h4 style={{ margin: '0 0 15px 0' }}>📈 المؤشرات التقنية المتقدمة</h4>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '10px',
          fontSize: '1em'
        }}>
          <div style={{ textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '8px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.8em', color: '#FFE0E0' }}>📊 MA20</div>
            <div style={{ fontWeight: 'bold' }}>{technicalIndicators.ma20}</div>
          </div>
          <div style={{ textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '8px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.8em', color: '#FFE0E0' }}>📊 MA50</div>
            <div style={{ fontWeight: 'bold' }}>{technicalIndicators.ma50}</div>
          </div>
          <div style={{ textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '8px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.8em', color: '#FFE0E0' }}>⚡ RSI</div>
            <div style={{ 
              fontWeight: 'bold',
              color: technicalIndicators.rsi > 70 ? '#ffcccb' : 
                     technicalIndicators.rsi < 30 ? '#90EE90' : '#FFD700'
            }}>{technicalIndicators.rsi}</div>
          </div>
          <div style={{ textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '8px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.8em', color: '#FFE0E0' }}>🔻 دعم</div>
            <div style={{ fontWeight: 'bold', color: '#4CAF50' }}>{technicalIndicators.support}</div>
          </div>
          <div style={{ textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '8px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.8em', color: '#FFE0E0' }}>🔺 مقاومة</div>
            <div style={{ fontWeight: 'bold', color: '#f44336' }}>{technicalIndicators.resistance}</div>
          </div>
        </div>
      </div>
      
      {/* التنبيهات الذكية */}
      {smartAlerts.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #FF9800, #F57C00)',
          padding: '15px',
          borderRadius: '15px',
          marginBottom: '20px',
          border: '2px solid #FF9800'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>🚨 تنبيهات ذكية فورية</h4>
          {smartAlerts.map((alert, index) => (
            <div key={index} style={{
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '10px',
              borderRadius: '8px',
              margin: '8px 0',
              fontSize: '1em'
            }}>
              <strong>{alert.message}</strong> 
              <div style={{ fontSize: '0.9em', color: '#FFF3E0' }}>
                مستوى الثقة: {alert.confidence}%
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* لوحة التحكم */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <label style={{ marginRight: '10px' }}>🎮 وضع التداول:</label>
          <select 
            value={tradingMode} 
            onChange={(e) => setTradingMode(e.target.value)}
            style={{
              background: '#333',
              color: '#fff',
              border: '1px solid #6B73FF',
              padding: '8px 12px',
              borderRadius: '5px'
            }}
          >
            <option value="demo">🧪 تجريبي</option>
            <option value="live">🔴 مباشر</option>
            <option value="ai">🧠 ذكي</option>
          </select>
        </div>
        
        <div>
          <label style={{ marginRight: '10px' }}>🤖 التحليل الذكي:</label>
          <button
            onClick={() => setRealTimeData(!realTimeData)}
            style={{
              background: realTimeData ? '#6B73FF' : '#666',
              color: '#fff',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {realTimeData ? '🟢 نشط' : '🔴 متوقف'}
          </button>
        </div>
      </div>
      
      {/* المخطط */}
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
            backgroundColor: '#1a1a1a',
            display: 'block',
            cursor: 'grab'
          }}
        />
      </div>
      
      <div style={{ 
        marginTop: '20px',
        fontSize: '14px',
        color: '#ccc',
        maxWidth: '800px',
        margin: '20px auto'
      }}>
        <p>🧠 <strong>مدعوم بالذكاء الاصطناعي:</strong> تحليل تلقائي للاتجاهات والإشارات</p>
        <p>📊 <strong>مؤشرات متقدمة:</strong> MA, RSI, الدعم والمقاومة</p>
        <p>🖱️ <strong>تفاعلي:</strong> استخدم عجلة الماوس للتكبير والتصغير</p>
        <p>⚡ <strong>أداء فائق:</strong> 4ms استجابة + تحليل ذكي</p>
        <p>🚨 <strong>تنبيهات ذكية:</strong> إشعارات فورية للفرص</p>
      </div>
    </div>
  );
};

JapaneseCandlestickAnalysisAI.displayName = 'JapaneseCandlestickAnalysisAI';

export default JapaneseCandlestickAnalysisAI;
