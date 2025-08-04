import React, { useRef, useEffect, useState } from 'react';

// المكون المبسط للشموع اليابانية - العناصر الأساسية فقط
const JapaneseCandlestickAnalysis = () => {
  const canvasRef = useRef(null);
  const [candleData, setCandleData] = useState([]);

  // إنشاء بيانات تجريبية بسيطة
  const generateDemoData = () => {
    const data = [];
    let price = 11000;
    
    for (let i = 0; i < 30; i++) {
      const change = (Math.random() - 0.5) * 200;
      const open = price;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 50;
      const low = Math.min(open, close) - Math.random() * 50;
      
      data.push({
        open: open,
        high: high,
        low: low,
        close: close
      });
      
      price = close;
    }
    
    return data;
  };

  // تحميل البيانات عند بداية التشغيل
  useEffect(() => {
    setCandleData(generateDemoData());
  }, []);

  // رسم الشموع على Canvas - النسخة المبسطة
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candleData.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 400;
    
    // مسح Canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // إعدادات الرسم
    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    const candleWidth = chartWidth / candleData.length * 0.7;
    
    // حساب أعلى وأقل سعر
    const prices = candleData.flatMap(d => [d.high, d.low]);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;
    
    // رسم الشموع
    candleData.forEach((candle, index) => {
      const x = padding + index * (candleWidth + 5);
      
      // تحويل الأسعار إلى إحداثيات Y
      const openY = padding + (maxPrice - candle.open) / priceRange * chartHeight;
      const closeY = padding + (maxPrice - candle.close) / priceRange * chartHeight;
      const highY = padding + (maxPrice - candle.high) / priceRange * chartHeight;
      const lowY = padding + (maxPrice - candle.low) / priceRange * chartHeight;
      
      // تحديد لون الشمعة
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
    
    // عنوان بسيط
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('الشموع اليابانية', canvas.width / 2, 25);
    
  }, [candleData]);

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: '#1a1a1a',
      color: '#fff',
      textAlign: 'center'
    }}>
      <h2>📊 الشموع اليابانية - النسخة المبسطة</h2>
      
      <div style={{
        border: '2px solid #4CAF50',
        borderRadius: '8px',
        padding: '10px',
        backgroundColor: '#0a0a0a',
        display: 'inline-block'
      }}>
        <canvas
          ref={canvasRef}
          style={{
            backgroundColor: '#1a1a1a',
            display: 'block'
          }}
        />
      </div>
      
      <div style={{ 
        marginTop: '20px',
        fontSize: '14px',
        color: '#ccc'
      }}>
        <p>🟢 أخضر: سعر الإغلاق أعلى من الافتتاح</p>
        <p>🔴 أحمر: سعر الإغلاق أقل من الافتتاح</p>
      </div>
    </div>
  );
};

JapaneseCandlestickAnalysis.displayName = 'JapaneseCandlestickAnalysis';

export default JapaneseCandlestickAnalysis;
