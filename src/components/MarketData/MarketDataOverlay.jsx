import React, { useEffect, useRef } from 'react';
import { useMarketData } from './MarketDataProvider';

const MarketDataOverlay = ({ 
  canvasRef, 
  selectedMarkets, 
  showOverlay, 
  circleCenter, 
  circleRadius,
  sectors = 36 
}) => {
  const { marketData, priceMovements } = useMarketData();
  const overlayRef = useRef(null);

  // حساب موقع السوق في الدائرة
  const calculateMarketPosition = (marketKey) => {
    const [marketType, symbol] = marketKey.split('_');
    const data = marketData[marketType]?.[symbol];
    
    if (!data) return null;
    
    const price = parseFloat(data.price || data.c || data.last);
    if (!price) return null;

    // تحويل السعر إلى رقم مختزل
    const priceStr = price.toString().replace('.', '');
    const sumDigits = priceStr.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    const reducedNumber = ((sumDigits - 1) % 9) + 1;
    
    // حساب القطاع والزاوية
    const sector = Math.floor(((reducedNumber - 1) / 9) * sectors) + 1;
    const angle = ((sector - 1) / sectors) * 360;
    const angleRad = (angle - 90) * (Math.PI / 180); // -90 لتعديل البداية
    
    // حساب الإحداثيات
    const radius = circleRadius * 0.8; // داخل الدائرة قليلاً
    const x = circleCenter + radius * Math.cos(angleRad);
    const y = circleCenter + radius * Math.sin(angleRad);
    
    return {
      x,
      y,
      sector,
      angle,
      reducedNumber,
      price,
      symbol,
      marketType
    };
  };

  // رسم البيانات على الكانفاس مباشرة
  const drawMarketOverlay = () => {
    if (!canvasRef.current || !showOverlay || selectedMarkets.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // حفظ الحالة الحالية
    ctx.save();
    
    selectedMarkets.forEach(marketKey => {
      const position = calculateMarketPosition(marketKey);
      if (!position) return;
      
      const movement = priceMovements[marketKey];
      const movementColor = getMovementColor(movement?.movement);
      
      // رسم دائرة صغيرة للسوق
      ctx.beginPath();
      ctx.arc(position.x, position.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = movementColor;
      ctx.fill();
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // رسم النص (الرمز والسعر)
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // خلفية النص
      const text = `${position.symbol.slice(-4)}`; // آخر 4 أحرف
      const textWidth = ctx.measureText(text).width;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(position.x - textWidth/2 - 3, position.y - 15, textWidth + 6, 12);
      
      // النص
      ctx.fillStyle = '#FFD700';
      ctx.fillText(text, position.x, position.y - 9);
      
      // السعر
      const priceText = position.price.toFixed(2);
      const priceWidth = ctx.measureText(priceText).width;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(position.x - priceWidth/2 - 3, position.y + 10, priceWidth + 6, 12);
      
      ctx.fillStyle = movementColor;
      ctx.fillText(priceText, position.x, position.y + 16);
      
      // رسم خط إلى مركز القطاع المناسب
      const sectorAngleRad = ((position.sector - 1) * (360 / sectors) - 90) * (Math.PI / 180);
      const sectorX = circleCenter + (circleRadius * 0.6) * Math.cos(sectorAngleRad);
      const sectorY = circleCenter + (circleRadius * 0.6) * Math.sin(sectorAngleRad);
      
      ctx.beginPath();
      ctx.moveTo(position.x, position.y);
      ctx.lineTo(sectorX, sectorY);
      ctx.strokeStyle = movementColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.stroke();
      ctx.setLineDash([]);
    });
    
    // استعادة الحالة
    ctx.restore();
  };

  // تحديد لون الحركة
  const getMovementColor = (movement) => {
    switch (movement) {
      case 'up': return '#00FF00';
      case 'down': return '#FF0000';
      case 'reversal': return '#FFFF00';
      default: return '#FFD700';
    }
  };

  // تحديث الرسم عند تغيير البيانات
  useEffect(() => {
    if (showOverlay) {
      const interval = setInterval(drawMarketOverlay, 1000);
      return () => clearInterval(interval);
    }
  }, [showOverlay, selectedMarkets, marketData, priceMovements]);

  // رسم أولي
  useEffect(() => {
    if (showOverlay) {
      setTimeout(drawMarketOverlay, 100);
    }
  }, [showOverlay]);

  return null; // هذا المكون يرسم مباشرة على الكانفاس
};

export default MarketDataOverlay;
