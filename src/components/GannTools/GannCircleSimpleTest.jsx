import React, { useRef, useEffect, useState } from "react";

// نسخة مبسطة لاختبار ربط الأسعار
const GannCircleSimpleTest = () => {
  const canvasRef = useRef();
  const [selectedMarkets, setSelectedMarkets] = useState(['2222']);
  
  // بيانات مصطنعة للاختبار
  const marketCategories = {
    stocks_saudi: [
      { symbol: '2222', name: 'أرامكو', price: '32.50', change: 0.6 },
      { symbol: '1180', name: 'الراجحي', price: '78.20', change: -0.3 },
    ],
    crypto: [
      { symbol: 'BTC/USD', name: 'بيتكوين', price: '45,250.00', change: 2.5 },
    ],
  };
  
  // دالة للحصول على السعر الحالي
  const getCurrentMarketPrice = () => {
    console.log('🔍 فحص الأسواق المحددة:', selectedMarkets);
    
    if (!selectedMarkets.length) {
      console.log('❌ لا توجد أسواق محددة');
      return null;
    }
    
    const firstMarket = selectedMarkets[0];
    console.log('🎯 السوق الأول:', firstMarket);
    
    // البحث في الفئات المختلفة
    for (const [categoryName, category] of Object.entries(marketCategories)) {
      const market = category.find(m => m.symbol === firstMarket);
      if (market) {
        const price = parseFloat(market.price.replace(/,/g, ''));
        console.log(`💰 تم العثور على سعر السوق ${firstMarket} في فئة ${categoryName}: ${price}`);
        return isNaN(price) ? null : price;
      }
    }
    
    console.log(`❌ لم يتم العثور على سعر للسوق: ${firstMarket}`);
    return null;
  };
  
  // دالة رسم مبسطة
  const draw = (ctx) => {
    console.log("🎨 بدء عملية الرسم...");
    
    if (!ctx) {
      console.log("❌ لا يوجد canvas context");
      return;
    }
    
    const canvasSize = 800;
    const center = canvasSize / 2;
    
    // مسح الكانفاس
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // رسم دائرة أساسية
    ctx.beginPath();
    ctx.arc(center, center, 200, 0, 2 * Math.PI);
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // إظهار السعر الحالي
    const currentPrice = getCurrentMarketPrice();
    if (currentPrice !== null && currentPrice > 0) {
      console.log(`✅ سيتم عرض السعر: ${currentPrice}`);
      
      ctx.font = "24px Arial";
      ctx.fillStyle = '#00FF00';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`السعر: ${currentPrice}`, center, center);
      
      console.log(`✅ تم رسم السعر بنجاح!`);
    } else {
      ctx.font = "20px Arial";
      ctx.fillStyle = '#FF0000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('لا يوجد سعر', center, center);
      console.log(`❌ لا يوجد سعر للعرض`);
    }
    
    console.log("✅ انتهاء عملية الرسم");
  };
  
  // useEffect للرسم
  useEffect(() => {
    console.log("🔄 useEffect للرسم تم الاستدعاء");
    console.log("🎯 Selected Markets:", selectedMarkets);
    
    const canvas = canvasRef.current;
    if (canvas) {
      console.log("✅ Canvas موجود");
      const ctx = canvas.getContext('2d');
      if (ctx) {
        console.log("✅ Canvas context موجود");
        draw(ctx);
      } else {
        console.log("❌ فشل في الحصول على Canvas context");
      }
    } else {
      console.log("❌ Canvas غير موجود");
    }
  }, [selectedMarkets]);
  
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#111',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FFD700'
    }}>
      <h1>🎯 اختبار ربط الأسعار الحية</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => {
            console.log("🔴 تم النقر على أرامكو");
            setSelectedMarkets(['2222']);
            console.log("📋 تم تعيين الأسواق المحددة إلى: ['2222']");
          }}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: 'rgba(255, 215, 0, 0.2)',
            color: '#FFD700',
            border: '1px solid #FFD700',
            borderRadius: '4px',
            cursor: 'pointer',
            margin: '0 10px'
          }}
        >
          اختبار أرامكو (32.50)
        </button>
        
        <button
          onClick={() => {
            console.log("🔴 تم النقر على بيتكوين");
            setSelectedMarkets(['BTC/USD']);
            console.log("📋 تم تعيين الأسواق المحددة إلى: ['BTC/USD']");
          }}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: 'rgba(255, 215, 0, 0.2)',
            color: '#FFD700',
            border: '1px solid #FFD700',
            borderRadius: '4px',
            cursor: 'pointer',
            margin: '0 10px'
          }}
        >
          اختبار بيتكوين (45,250)
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <p>السوق المحدد: {selectedMarkets.length > 0 ? selectedMarkets[0] : 'لا يوجد'}</p>
        <p>السعر الحالي: {getCurrentMarketPrice() || 'لا يوجد'}</p>
      </div>
      
      <canvas
        ref={canvasRef}
        width={800}
        height={800}
        style={{
          border: '1px solid #FFD700',
          background: 'black'
        }}
      />
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p>افتح Developer Console (F12) لمشاهدة الرسائل التفصيلية</p>
        <p>إذا ظهر السعر في المربع الأسود فإن المكون يعمل بشكل صحيح</p>
      </div>
    </div>
  );
};

export default GannCircleSimpleTest;
