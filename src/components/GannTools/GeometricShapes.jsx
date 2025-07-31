// مكتبة الأشكال الهندسية الكاملة
// جميع الأشكال الهندسية من 3-12 أضلاع وجميع أشكال النجوم

import React from 'react';

// المثلث
export const drawTriangle = (ctx, centerX, centerY, radius, rotation = 0, globalRotation = 0, fillShape = false, showAngles = false, settings = { rotation: 0 }) => {
  ctx.save();
  ctx.strokeStyle = '#FF6B6B';
  ctx.lineWidth = 2;
  
  const points = [];
  for (let i = 0; i < 3; i++) {
    const degree = i * 120 + rotation + globalRotation + (settings?.rotation || 0);
    const angle = (degree - 90) * Math.PI / 180;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x, y, angle: degree });
  }
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  
  // التعبئة إذا كانت مفعلة
  if (fillShape) {
    ctx.fillStyle = "rgba(255, 107, 107, 0.3)";
    ctx.fill();
  }
  
  ctx.stroke();
  
  // إظهار الزوايا إذا كانت مفعلة
  if (showAngles) {
    points.forEach((point, index) => {
      const displayAngle = (point.angle % 360 + 360) % 360;
      
      ctx.save();
      ctx.font = "14px Arial";
      ctx.fillStyle = "#8B0000";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.textAlign = "center";
      
      const textOffset = 25;
      const textAngle = (point.angle - 90) * Math.PI / 180;
      const textX = centerX + (radius + textOffset) * Math.cos(textAngle);
      const textY = centerY + (radius + textOffset) * Math.sin(textAngle);
      
      ctx.strokeText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.fillText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.restore();
    });
  }

  // رسم رؤوس المثلث بلون أساسي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء
  points.forEach((point, i) => {
    ctx.save();
    
    // إضافة تأثير نبض للإشارة إلى إمكانية السحب
    const time = Date.now() * 0.003;
    const pulse = Math.sin(time + i * 0.5) * 0.3 + 1;
    const radius = 8 * pulse;
    
    // الدائرة الخارجية مع تأثير الظل
    ctx.shadowColor = 'rgba(139, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#8B0000'; // استخدام اللون الأساسي
    ctx.fill();
    
    // إزالة الظل للحدود
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "white"; // حدود بيضاء للوضوح
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // نقطة مركزية صغيرة بيضاء للوضوح
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    
    // إضافة رمز صغير للإشارة إلى إمكانية السحب
    ctx.font = "8px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("↻", point.x, point.y - 15);
    
    ctx.restore();
  });
  
  ctx.restore();
};

// المربع
export const drawSquare = (ctx, centerX, centerY, radius, rotation = 0, globalRotation = 0, fillShape = false, showAngles = false, settings = { rotation: 0 }) => {
  ctx.save();
  ctx.strokeStyle = '#4ECDC4';
  ctx.lineWidth = 2;
  
  const points = [];
  for (let i = 0; i < 4; i++) {
    const degree = i * 90 + rotation + globalRotation + (settings?.rotation || 0);
    const angle = (degree - 90) * Math.PI / 180;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x, y, angle: degree });
  }
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  
  // التعبئة إذا كانت مفعلة
  if (fillShape) {
    ctx.fillStyle = "rgba(78, 205, 196, 0.3)";
    ctx.fill();
  }
  
  ctx.stroke();
  
  // إظهار الزوايا إذا كانت مفعلة
  if (showAngles) {
    points.forEach((point, index) => {
      const displayAngle = (point.angle % 360 + 360) % 360;
      
      ctx.save();
      ctx.font = "14px Arial";
      ctx.fillStyle = "#2E8B82";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.textAlign = "center";
      
      const textOffset = 25;
      const textAngle = (point.angle - 90) * Math.PI / 180;
      const textX = centerX + (radius + textOffset) * Math.cos(textAngle);
      const textY = centerY + (radius + textOffset) * Math.sin(textAngle);
      
      ctx.strokeText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.fillText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.restore();
    });
  }

  // رسم رؤوس المربع بلون أساسي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء
  points.forEach((point, i) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#2E8B82'; // استخدام اللون الأساسي
    ctx.fill();
    ctx.strokeStyle = "white"; // حدود بيضاء للوضوح
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // نقطة مركزية
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.restore();
  });
  
  ctx.restore();
};

// الخماسي
export const drawPentagon = (ctx, centerX, centerY, radius, rotation = 0, globalRotation = 0, fillShape = false, showAngles = false, settings = { rotation: 0 }) => {
  ctx.save();
  ctx.strokeStyle = '#45B7D1';
  ctx.lineWidth = 2;
  
  const points = [];
  for (let i = 0; i < 5; i++) {
    const degree = i * 72 + rotation + globalRotation + (settings?.rotation || 0);
    const angle = (degree - 90) * Math.PI / 180;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x, y, angle: degree });
  }
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  
  // التعبئة إذا كانت مفعلة
  if (fillShape) {
    ctx.fillStyle = "rgba(69, 183, 209, 0.3)";
    ctx.fill();
  }
  
  ctx.stroke();
  
  // إظهار الزوايا إذا كانت مفعلة
  if (showAngles) {
    points.forEach((point, index) => {
      const displayAngle = (point.angle % 360 + 360) % 360;
      
      ctx.save();
      ctx.font = "14px Arial";
      ctx.fillStyle = "#2E7BA0";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.textAlign = "center";
      
      const textOffset = 25;
      const textAngle = (point.angle - 90) * Math.PI / 180;
      const textX = centerX + (radius + textOffset) * Math.cos(textAngle);
      const textY = centerY + (radius + textOffset) * Math.sin(textAngle);
      
      ctx.strokeText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.fillText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.restore();
    });
  }

  // رسم رؤوس الخماسي بلون أساسي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء
  points.forEach((point, i) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#2E7BA0'; // استخدام اللون الأساسي
    ctx.fill();
    ctx.strokeStyle = "white"; // حدود بيضاء للوضوح
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // نقطة مركزية
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.restore();
  });
  
  ctx.restore();
};

// السداسي
export const drawHexagon = (ctx, centerX, centerY, radius, rotation = 0, globalRotation = 0, fillShape = false, showAngles = false, settings = { rotation: 0 }) => {
  ctx.save();
  ctx.strokeStyle = '#96CEB4';
  ctx.lineWidth = 2;
  
  const points = [];
  for (let i = 0; i < 6; i++) {
    const degree = i * 60 + rotation + globalRotation + (settings?.rotation || 0);
    const angle = (degree - 90) * Math.PI / 180;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x, y, angle: degree });
  }
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  
  // التعبئة إذا كانت مفعلة
  if (fillShape) {
    ctx.fillStyle = "rgba(150, 206, 180, 0.3)";
    ctx.fill();
  }
  
  ctx.stroke();
  
  // إظهار الزوايا إذا كانت مفعلة
  if (showAngles) {
    points.forEach((point, index) => {
      const displayAngle = (point.angle % 360 + 360) % 360;
      
      ctx.save();
      ctx.font = "14px Arial";
      ctx.fillStyle = "#5A8F78";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.textAlign = "center";
      
      const textOffset = 25;
      const textAngle = (point.angle - 90) * Math.PI / 180;
      const textX = centerX + (radius + textOffset) * Math.cos(textAngle);
      const textY = centerY + (radius + textOffset) * Math.sin(textAngle);
      
      ctx.strokeText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.fillText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.restore();
    });
  }

  // رسم رؤوس السداسي بلون أساسي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء
  points.forEach((point, i) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#5A8F78'; // استخدام اللون الأساسي
    ctx.fill();
    ctx.strokeStyle = "white"; // حدود بيضاء للوضوح
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // نقطة مركزية
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.restore();
  });
  
  ctx.restore();
};

// السباعي
export const drawHeptagon = (ctx, centerX, centerY, radius, rotation = 0, globalRotation = 0, fillShape = false, showAngles = false, settings = { rotation: 0 }) => {
  ctx.save();
  ctx.strokeStyle = '#FECA57';
  ctx.lineWidth = 2;
  
  const points = [];
  for (let i = 0; i < 7; i++) {
    const degree = i * (360 / 7) + rotation + globalRotation + (settings?.rotation || 0);
    const angle = (degree - 90) * Math.PI / 180;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x, y, angle: degree });
  }
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  
  // التعبئة إذا كانت مفعلة
  if (fillShape) {
    ctx.fillStyle = "rgba(254, 202, 87, 0.3)";
    ctx.fill();
  }
  
  ctx.stroke();
  
  // إظهار الزوايا إذا كانت مفعلة
  if (showAngles) {
    points.forEach((point, index) => {
      const displayAngle = (point.angle % 360 + 360) % 360;
      
      ctx.save();
      ctx.font = "14px Arial";
      ctx.fillStyle = "#B8870F";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.textAlign = "center";
      
      const textOffset = 25;
      const textAngle = (point.angle - 90) * Math.PI / 180;
      const textX = centerX + (radius + textOffset) * Math.cos(textAngle);
      const textY = centerY + (radius + textOffset) * Math.sin(textAngle);
      
      ctx.strokeText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.fillText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.restore();
    });
  }

  // رسم رؤوس السباعي بلون أساسي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء
  points.forEach((point, i) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#B8870F'; // استخدام اللون الأساسي
    ctx.fill();
    ctx.strokeStyle = "white"; // حدود بيضاء للوضوح
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // نقطة مركزية
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.restore();
  });
  
  ctx.restore();
};

// الثماني
export const drawOctagon = (ctx, centerX, centerY, radius, rotation = 0, globalRotation = 0, fillShape = false, showAngles = false, settings = { rotation: 0 }) => {
  ctx.save();
  ctx.strokeStyle = '#FF9FF3';
  ctx.lineWidth = 2;
  
  const points = [];
  for (let i = 0; i < 8; i++) {
    const degree = i * 45 + rotation + globalRotation + (settings?.rotation || 0);
    const angle = (degree - 90) * Math.PI / 180;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x, y, angle: degree });
  }
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  
  // التعبئة إذا كانت مفعلة
  if (fillShape) {
    ctx.fillStyle = "rgba(255, 159, 243, 0.3)";
    ctx.fill();
  }
  
  ctx.stroke();
  
  // إظهار الزوايا إذا كانت مفعلة
  if (showAngles) {
    points.forEach((point, index) => {
      const displayAngle = (point.angle % 360 + 360) % 360;
      
      ctx.save();
      ctx.font = "14px Arial";
      ctx.fillStyle = "#CC4DBC";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.textAlign = "center";
      
      const textOffset = 25;
      const textAngle = (point.angle - 90) * Math.PI / 180;
      const textX = centerX + (radius + textOffset) * Math.cos(textAngle);
      const textY = centerY + (radius + textOffset) * Math.sin(textAngle);
      
      ctx.strokeText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.fillText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.restore();
    });
  }

  // رسم رؤوس الثماني بلون أساسي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء
  points.forEach((point, i) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#CC4DBC'; // استخدام اللون الأساسي
    ctx.fill();
    ctx.strokeStyle = "white"; // حدود بيضاء للوضوح
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // نقطة مركزية
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.restore();
  });
  
  ctx.restore();
};

// التساعي
export const drawEnneagon = (ctx, centerX, centerY, radius, rotation = 0, globalRotation = 0, fillShape = false, showAngles = false, settings = { rotation: 0 }) => {
  ctx.save();
  ctx.strokeStyle = '#54A0FF';
  ctx.lineWidth = 2;
  
  const points = [];
  for (let i = 0; i < 9; i++) {
    const degree = i * 40 + rotation + globalRotation + (settings?.rotation || 0);
    const angle = (degree - 90) * Math.PI / 180;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x, y, angle: degree });
  }
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  
  // التعبئة إذا كانت مفعلة
  if (fillShape) {
    ctx.fillStyle = "rgba(84, 160, 255, 0.3)";
    ctx.fill();
  }
  
  ctx.stroke();
  
  // إظهار الزوايا إذا كانت مفعلة
  if (showAngles) {
    points.forEach((point, index) => {
      const displayAngle = (point.angle % 360 + 360) % 360;
      
      ctx.save();
      ctx.font = "14px Arial";
      ctx.fillStyle = "#2E5FCC";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.textAlign = "center";
      
      const textOffset = 25;
      const textAngle = (point.angle - 90) * Math.PI / 180;
      const textX = centerX + (radius + textOffset) * Math.cos(textAngle);
      const textY = centerY + (radius + textOffset) * Math.sin(textAngle);
      
      ctx.strokeText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.fillText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.restore();
    });
  }

  // رسم رؤوس التساعي بلون أساسي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء
  points.forEach((point, i) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#2E5FCC'; // استخدام اللون الأساسي
    ctx.fill();
    ctx.strokeStyle = "white"; // حدود بيضاء للوضوح
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // نقطة مركزية
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.restore();
  });
  
  ctx.restore();
};

// العشاري
export const drawDecagon = (ctx, centerX, centerY, radius, rotation = 0, globalRotation = 0, fillShape = false, showAngles = false, settings = { rotation: 0 }) => {
  ctx.save();
  ctx.strokeStyle = '#5F27CD';
  ctx.lineWidth = 2;
  
  const points = [];
  for (let i = 0; i < 10; i++) {
    const degree = i * 36 + rotation + globalRotation + (settings?.rotation || 0);
    const angle = (degree - 90) * Math.PI / 180;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x, y, angle: degree });
  }
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  
  // التعبئة إذا كانت مفعلة
  if (fillShape) {
    ctx.fillStyle = "rgba(95, 39, 205, 0.3)";
    ctx.fill();
  }
  
  ctx.stroke();
  
  // إظهار الزوايا إذا كانت مفعلة
  if (showAngles) {
    points.forEach((point, index) => {
      const displayAngle = (point.angle % 360 + 360) % 360;
      
      ctx.save();
      ctx.font = "14px Arial";
      ctx.fillStyle = "#3D1A80";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.textAlign = "center";
      
      const textOffset = 25;
      const textAngle = (point.angle - 90) * Math.PI / 180;
      const textX = centerX + (radius + textOffset) * Math.cos(textAngle);
      const textY = centerY + (radius + textOffset) * Math.sin(textAngle);
      
      ctx.strokeText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.fillText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.restore();
    });
  }

  // رسم رؤوس العشاري بلون أساسي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء
  points.forEach((point, i) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#3D1A80'; // استخدام اللون الأساسي
    ctx.fill();
    ctx.strokeStyle = "white"; // حدود بيضاء للوضوح
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // نقطة مركزية
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.restore();
  });
  
  ctx.restore();
};

// الحادي عشر
export const drawHendecagon = (ctx, centerX, centerY, radius, rotation = 0, globalRotation = 0, fillShape = false, showAngles = false, settings = { rotation: 0 }) => {
  ctx.save();
  ctx.strokeStyle = '#00D2D3';
  ctx.lineWidth = 2;
  
  const points = [];
  for (let i = 0; i < 11; i++) {
    const degree = i * (360 / 11) + rotation + globalRotation + (settings?.rotation || 0);
    const angle = (degree - 90) * Math.PI / 180;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x, y, angle: degree });
  }
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  
  // التعبئة إذا كانت مفعلة
  if (fillShape) {
    ctx.fillStyle = "rgba(0, 210, 211, 0.3)";
    ctx.fill();
  }
  
  ctx.stroke();
  
  // إظهار الزوايا إذا كانت مفعلة
  if (showAngles) {
    points.forEach((point, index) => {
      const displayAngle = (point.angle % 360 + 360) % 360;
      
      ctx.save();
      ctx.font = "14px Arial";
      ctx.fillStyle = "#007A7B";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.textAlign = "center";
      
      const textOffset = 25;
      const textAngle = (point.angle - 90) * Math.PI / 180;
      const textX = centerX + (radius + textOffset) * Math.cos(textAngle);
      const textY = centerY + (radius + textOffset) * Math.sin(textAngle);
      
      ctx.strokeText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.fillText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.restore();
    });
  }

  // رسم رؤوس الحادي عشر بلون أساسي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء
  points.forEach((point, i) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#007A7B'; // استخدام اللون الأساسي
    ctx.fill();
    ctx.strokeStyle = "white"; // حدود بيضاء للوضوح
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // نقطة مركزية
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.restore();
  });
  
  ctx.restore();
};

// الاثني عشر
export const drawDodecagon = (ctx, centerX, centerY, radius, rotation = 0, globalRotation = 0, fillShape = false, showAngles = false, settings = { rotation: 0 }) => {
  ctx.save();
  ctx.strokeStyle = '#FF6B35';
  ctx.lineWidth = 2;
  
  const points = [];
  for (let i = 0; i < 12; i++) {
    const degree = i * 30 + rotation + globalRotation + (settings?.rotation || 0);
    const angle = (degree - 90) * Math.PI / 180;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x, y, angle: degree });
  }
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  
  // التعبئة إذا كانت مفعلة
  if (fillShape) {
    ctx.fillStyle = "rgba(255, 107, 53, 0.3)";
    ctx.fill();
  }
  
  ctx.stroke();
  
  // إظهار الزوايا إذا كانت مفعلة
  if (showAngles) {
    points.forEach((point, index) => {
      const displayAngle = (point.angle % 360 + 360) % 360;
      
      ctx.save();
      ctx.font = "14px Arial";
      ctx.fillStyle = "#CC3500";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.textAlign = "center";
      
      const textOffset = 25;
      const textAngle = (point.angle - 90) * Math.PI / 180;
      const textX = centerX + (radius + textOffset) * Math.cos(textAngle);
      const textY = centerY + (radius + textOffset) * Math.sin(textAngle);
      
      ctx.strokeText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.fillText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.restore();
    });
  }

  // رسم رؤوس الاثني عشر بلون أساسي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء
  points.forEach((point, i) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#CC3500'; // استخدام اللون الأساسي
    ctx.fill();
    ctx.strokeStyle = "white"; // حدود بيضاء للوضوح
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // نقطة مركزية
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.restore();
  });
  
  ctx.restore();
};

// النجمة الثلاثية
// النجمة الثلاثية
export const drawTriangleStar = (ctx, centerX, centerY, outerRadius, innerRadius, rotation = 0, globalRotation = 0, fillStar = false, showStarAngles = false, settings = { rotation: 0 }) => {
  ctx.save();
  
  // إرجاع إلى الأصل للحسابات
  ctx.restore();
  ctx.save();
  
  const r = outerRadius;
  const customAngles = [45, 165, 285]; // زوايا افتراضية
  const drawMode = "lines"; // نمط الرسم الافتراضي
  
  if (drawMode === "lines") {
    // رسم النجمة الثلاثية كنجمة متصلة
    const outerRadius3 = r;
    const innerRadius3 = r * 0.3; // نصف قطر النقاط الداخلية

    // حساب النقاط الخارجية (رؤوس النجمة)
    const outerPoints = [];
    for (let i = 0; i < 3; i++) {
      const angle = ((customAngles[i]) + rotation + settings.rotation - 90) * Math.PI / 180;
      const x = centerX + outerRadius3 * Math.cos(angle);
      const y = centerY + outerRadius3 * Math.sin(angle);
      outerPoints.push({ x, y });
    }

    // حساب النقاط الداخلية (بين كل رأسين)
    const innerPoints = [];
    for (let i = 0; i < 3; i++) {
      const angle1 = ((customAngles[i]) + rotation + settings.rotation - 90) * Math.PI / 180;
      const angle2 = ((customAngles[(i + 1) % 3]) + rotation + settings.rotation - 90) * Math.PI / 180;

      // الزاوية في منتصف المسافة بين النقطتين الخارجيتين
      let midAngle = (angle1 + angle2) / 2;

      // تصحيح الزاوية إذا كانت هناك فجوة كبيرة (عبور الـ 360 درجة)
      if (Math.abs(angle2 - angle1) > Math.PI) {
        midAngle += Math.PI;
      }

      const x = centerX + innerRadius3 * Math.cos(midAngle);
      const y = centerY + innerRadius3 * Math.sin(midAngle);
      innerPoints.push({ x, y });
    }

    // رسم النجمة الثلاثية المتصلة
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    
    // البدء من النقطة الخارجية الأولى
    ctx.moveTo(outerPoints[0].x, outerPoints[0].y);

    // رسم النجمة بالتنقل بين النقاط الخارجية والداخلية
    for (let i = 0; i < 3; i++) {
      const nextInner = innerPoints[i];
      const nextOuter = outerPoints[(i + 1) % 3];

      // من النقطة الخارجية إلى النقطة الداخلية
      ctx.lineTo(nextInner.x, nextInner.y);
      // من النقطة الداخلية إلى النقطة الخارجية التالية
      ctx.lineTo(nextOuter.x, nextOuter.y);
    }

    ctx.closePath();
    
    // التعبئة إذا كانت مفعلة
    if (fillStar) {
      ctx.fillStyle = "rgba(255, 215, 0, 0.3)";
      ctx.fill();
    }
    
    ctx.stroke();
    
    ctx.restore();

    // رسم خطوط الاتصال من المركز إلى النقاط الخارجية
    ctx.save();
    ctx.strokeStyle = "rgba(255, 215, 0, 0.5)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    outerPoints.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    // إظهار الزوايا إذا كانت مفعلة
    if (showStarAngles) {
      // عرض زوايا النقاط الخارجية (رؤوس النجمة)
      outerPoints.forEach((point, index) => {
        const angle = ((customAngles[index] + rotation + settings.rotation) % 360);
        const displayAngle = angle < 0 ? angle + 360 : angle;
        
        ctx.save();
        ctx.font = "bold 16px Arial";
        ctx.fillStyle = "#006400"; // أخضر غامق
        ctx.strokeStyle = "white"; // خلفية بيضاء للنص
        ctx.lineWidth = 3;
        ctx.textAlign = "center";
        
        const textOffset = 30;
        const textAngle = ((customAngles[index] + rotation + settings.rotation - 90) * Math.PI) / 180;
        const textX = centerX + (r + textOffset) * Math.cos(textAngle);
        const textY = centerY + (r + textOffset) * Math.sin(textAngle);
        
        // رسم خلفية للنص
        ctx.strokeText(`${displayAngle.toFixed(0)}°`, textX, textY);
        ctx.fillText(`${displayAngle.toFixed(0)}°`, textX, textY);
        ctx.restore();
      });
    }

    // رسم رؤوس النجمة الثلاثية بلون ذهبي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء
    outerPoints.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#FFD700"; // ذهبي
      ctx.fill();
      ctx.strokeStyle = "#B8860B"; // حدود ذهبي غامق
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // نقطة مركزية
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#B8860B";
      ctx.fill();
      ctx.restore();
    });
    
  } else {
    // رسم مثلث منتظم فقط
    const trianglePoints = [];
    for (let i = 0; i < 3; i++) {
      const angle = ((customAngles[i]) + rotation + settings.rotation - 90) * Math.PI / 180;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      trianglePoints.push({ x, y });
    }

    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(trianglePoints[0].x, trianglePoints[0].y);
    ctx.lineTo(trianglePoints[1].x, trianglePoints[1].y);
    ctx.lineTo(trianglePoints[2].x, trianglePoints[2].y);
    ctx.closePath();
    
    // التعبئة إذا كانت مفعلة
    if (fillStar) {
      ctx.fillStyle = "rgba(255, 215, 0, 0.3)";
      ctx.fill();
    }
    
    ctx.stroke();

    // إظهار الزوايا إذا كانت مفعلة
    if (showStarAngles) {
      trianglePoints.forEach((point, index) => {
        const angle = ((customAngles[index] + rotation + settings.rotation) % 360);
        const displayAngle = angle < 0 ? angle + 360 : angle;
        
        ctx.save();
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "#006400"; // أخضر غامق
        ctx.strokeStyle = "white"; // خلفية بيضاء للنص
        ctx.lineWidth = 3;
        ctx.textAlign = "center";
        
        const textOffset = 30;
        const textAngle = ((customAngles[index] + rotation + settings.rotation - 90) * Math.PI) / 180;
        const textX = centerX + (r + textOffset) * Math.cos(textAngle);
        const textY = centerY + (r + textOffset) * Math.sin(textAngle);
        
        // رسم خلفية للنص
        ctx.strokeText(`${displayAngle.toFixed(0)}°`, textX, textY);
        ctx.fillText(`${displayAngle.toFixed(0)}°`, textX, textY);
        ctx.restore();
      });
    }

    // رسم رؤوس المثلث بلون ذهبي دائماً ظاهرة
    trianglePoints.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#FFD700"; // ذهبي
      ctx.fill();
      ctx.strokeStyle = "#B8860B"; // حدود ذهبي غامق
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // نقطة مركزية
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#B8860B";
      ctx.fill();
      ctx.restore();
    });
  }
};

// النجمة الرباعية
export const drawSquareStar = (ctx, centerX, centerY, outerRadius, innerRadius, rotation = 0, globalRotation = 0, fillStar = false, showStarAngles = false, settings = { rotation: 0 }) => {
  ctx.save();
  
  // إرجاع إلى الأصل للحسابات
  ctx.restore();
  ctx.save();
  
  const r = outerRadius;
  const customAngles = [0, 90, 180, 270]; // زوايا افتراضية
  
  // النقاط الأربعة الأساسية للنجمة الرباعية
  const mainPoints = customAngles.map((deg) => {
    const rad = ((deg + rotation + settings.rotation - 90) * Math.PI) / 180;
    return {
      x: centerX + r * Math.cos(rad),
      y: centerY + r * Math.sin(rad),
    };
  });

  // النقاط الداخلية للنجمة (على مسافة أقل من المركز)
  const innerRadius4 = r * 0.4; // 40% من الشعاع الخارجي
  const innerPoints = [45, 135, 225, 315].map((deg) => {
    const rad = ((deg + rotation + settings.rotation - 90) * Math.PI) / 180;
    return {
      x: centerX + innerRadius4 * Math.cos(rad),
      y: centerY + innerRadius4 * Math.sin(rad),
    };
  });

  // رسم النجمة الرباعية بتناوب النقاط الخارجية والداخلية
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  
  // البدء من النقطة الأولى الخارجية
  ctx.moveTo(mainPoints[0].x, mainPoints[0].y);
  
  // رسم النجمة بالتناوب بين النقاط الخارجية والداخلية
  for (let i = 0; i < 4; i++) {
    // الانتقال إلى النقطة الداخلية
    ctx.lineTo(innerPoints[i].x, innerPoints[i].y);
    // الانتقال إلى النقطة الخارجية التالية
    ctx.lineTo(mainPoints[(i + 1) % 4].x, mainPoints[(i + 1) % 4].y);
  }
  
  ctx.closePath();
  
  // التعبئة إذا كانت مفعلة
  if (fillStar) {
    ctx.fillStyle = "rgba(255, 215, 0, 0.2)";
    ctx.fill();
  }
  
  ctx.stroke();
  
  ctx.restore();

  // رسم خطوط الاتصال من المركز إلى النقاط الرئيسية فقط
  ctx.save();
  ctx.strokeStyle = "rgba(255, 215, 0, 0.5)";
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  mainPoints.forEach((p) => {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });
  ctx.restore();

  // إظهار الزوايا إذا كانت مفعلة
  if (showStarAngles) {
    mainPoints.forEach((point, index) => {
      const angle = ((index * 90) + rotation + settings.rotation) % 360;
      const displayAngle = angle < 0 ? angle + 360 : angle;
      
      ctx.save();
      ctx.font = "12px Arial";
      ctx.fillStyle = "#B8860B"; // لون ذهبي غامق
      ctx.strokeStyle = "white"; // خلفية بيضاء للنص
      ctx.lineWidth = 3;
      ctx.textAlign = "center";
      
      // وضع النص خارج النقطة قليلاً
      const textOffset = 20;
      const textAngle = ((customAngles[index] + rotation + settings.rotation - 90) * Math.PI) / 180;
      const textX = centerX + (r + textOffset) * Math.cos(textAngle);
      const textY = centerY + (r + textOffset) * Math.sin(textAngle);
      
      // رسم خلفية للنص
      ctx.strokeText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.fillText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.restore();
    });
  }

  // رسم رؤوس النجمة الرباعية بلون فضي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء
  mainPoints.forEach((point, i) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = "#C0C0C0"; // فضي
    ctx.fill();
    ctx.strokeStyle = "#808080"; // حدود رمادي غامق
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // نقطة مركزية
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "#808080";
    ctx.fill();
    ctx.restore();
  });
};

// النجمة الخماسية
export const drawPentagonStar = (ctx, centerX, centerY, outerRadius, innerRadius, rotation = 0, globalRotation = 0, fillStar = false, showStarAngles = false, settings = { rotation: 0 }) => {
  ctx.save();
  ctx.strokeStyle = '#45B7D1';
  ctx.lineWidth = 2;
  
  // استخدام نفس الزوايا المخصصة من الكود الأصلي
  const customPentagonAngles = [0, 72, 144, 216, 288]; // زوايا النجمة الخماسية
  
  // النقاط الخارجية (رؤوس النجمة)
  const outerPoints = [];
  for (let i = 0; i < 5; i++) {
    const angle = ((customPentagonAngles[i] + rotation + globalRotation + (settings?.rotation || 0)) - 90) * Math.PI / 180;
    const x = centerX + outerRadius * Math.cos(angle);
    const y = centerY + outerRadius * Math.sin(angle);
    outerPoints.push({ x, y, angle: customPentagonAngles[i] + rotation + globalRotation + (settings?.rotation || 0) });
  }
  
  // رسم النجمة الخماسية التقليدية - البنتاغرام {5/2}
  // كل نقطة تتصل بالنقطة الثانية التالية لتشكيل النجمة
  ctx.beginPath();
  
  // البدء من النقطة الأولى
  ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
  
  // رسم الخطوط المتصلة للنجمة
  // النمط: 0→2→4→1→3→0 (كل نقطة تتصل بالنقطة الثانية التالية)
  for (let i = 0; i < 5; i++) {
    const nextIndex = (i * 2) % 5;
    ctx.lineTo(outerPoints[nextIndex].x, outerPoints[nextIndex].y);
  }
  
  ctx.closePath();
  
  // التعبئة إذا كانت مفعلة
  if (fillStar) {
    ctx.fillStyle = "rgba(69, 183, 209, 0.3)";
    ctx.fill();
  }
  
  ctx.stroke();
  
  // إظهار الزوايا إذا كانت مفعلة
  if (showStarAngles) {
    outerPoints.forEach((point, index) => {
      const displayAngle = (point.angle % 360 + 360) % 360;
      
      ctx.save();
      ctx.font = "14px Arial";
      ctx.fillStyle = "#2E7BA0";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.textAlign = "center";
      
      const textOffset = 25;
      const textAngle = (point.angle - 90) * Math.PI / 180;
      const textX = centerX + (outerRadius + textOffset) * Math.cos(textAngle);
      const textY = centerY + (outerRadius + textOffset) * Math.sin(textAngle);
      
      ctx.strokeText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.fillText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.restore();
    });
  }

  // رسم رؤوس النجمة الخماسية بلون أساسي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء
  outerPoints.forEach((point, i) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#2E7BA0'; // استخدام اللون الأساسي
    ctx.fill();
    ctx.strokeStyle = "white"; // حدود بيضاء للوضوح
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // نقطة مركزية
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.restore();
  });
  
  ctx.restore();
};

// النجمة السداسية
export const drawHexagonStar = (ctx, centerX, centerY, outerRadius, innerRadius, rotation = 0, globalRotation = 0, fillStar = false, showStarAngles = false, settings = { rotation: 0 }) => {
  ctx.save();
  ctx.strokeStyle = '#96CEB4';
  ctx.lineWidth = 2;
  
  // النجمة السداسية الصحيحة: مثلثان متساويان متداخلان (نجمة داود)
  // المثلث الأول: نقاط عند 0°، 120°، 240°
  // المثلث الثاني: نقاط عند 60°، 180°، 300°
  
  const triangle1Points = [0, 120, 240].map((deg) => {
    const angle = ((deg + rotation + globalRotation + (settings?.rotation || 0)) - 90) * Math.PI / 180;
    return {
      x: centerX + outerRadius * Math.cos(angle),
      y: centerY + outerRadius * Math.sin(angle),
      angle: deg + rotation + globalRotation + (settings?.rotation || 0)
    };
  });
  
  const triangle2Points = [60, 180, 300].map((deg) => {
    const angle = ((deg + rotation + globalRotation + (settings?.rotation || 0)) - 90) * Math.PI / 180;
    return {
      x: centerX + outerRadius * Math.cos(angle),
      y: centerY + outerRadius * Math.sin(angle),
      angle: deg + rotation + globalRotation + (settings?.rotation || 0)
    };
  });

  // رسم المثلث الأول
  ctx.beginPath();
  ctx.moveTo(triangle1Points[0].x, triangle1Points[0].y);
  ctx.lineTo(triangle1Points[1].x, triangle1Points[1].y);
  ctx.lineTo(triangle1Points[2].x, triangle1Points[2].y);
  ctx.closePath();
  
  // التعبئة إذا كانت مفعلة للمثلث الأول
  if (fillStar) {
    ctx.fillStyle = "rgba(150, 206, 180, 0.2)";
    ctx.fill();
  }
  
  ctx.stroke();
  
  // رسم المثلث الثاني
  ctx.beginPath();
  ctx.moveTo(triangle2Points[0].x, triangle2Points[0].y);
  ctx.lineTo(triangle2Points[1].x, triangle2Points[1].y);
  ctx.lineTo(triangle2Points[2].x, triangle2Points[2].y);
  ctx.closePath();
  
  // التعبئة إذا كانت مفعلة للمثلث الثاني
  if (fillStar) {
    ctx.fillStyle = "rgba(150, 206, 180, 0.2)";
    ctx.fill();
  }
  
  ctx.stroke();
  
  // إظهار الزوايا إذا كانت مفعلة
  if (showStarAngles) {
    const allPoints = [...triangle1Points, ...triangle2Points];
    allPoints.forEach((point, index) => {
      const displayAngle = (point.angle % 360 + 360) % 360;
      
      ctx.save();
      ctx.font = "14px Arial";
      ctx.fillStyle = "#5A8F78";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.textAlign = "center";
      
      const textOffset = 25;
      const textAngle = (point.angle - 90) * Math.PI / 180;
      const textX = centerX + (outerRadius + textOffset) * Math.cos(textAngle);
      const textY = centerY + (outerRadius + textOffset) * Math.sin(textAngle);
      
      ctx.strokeText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.fillText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.restore();
    });
  }

  // رسم رؤوس النجمة السداسية بلون أساسي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء
  const allPoints = [...triangle1Points, ...triangle2Points];
  allPoints.forEach((point, i) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#5A8F78'; // استخدام اللون الأساسي
    ctx.fill();
    ctx.strokeStyle = "white"; // حدود بيضاء للوضوح
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // نقطة مركزية
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.restore();
  });
  
  ctx.restore();
};

// النجمة السباعية
export const drawHeptagonStar = (ctx, centerX, centerY, outerRadius, innerRadius, rotation = 0, globalRotation = 0, fillStar = false, showStarAngles = false, settings = { rotation: 0 }) => {
  ctx.save();
  ctx.strokeStyle = '#FECA57';
  ctx.lineWidth = 2;
  
  // حساب النقاط السبع على المحيط
  const points = [];
  for (let i = 0; i < 7; i++) {
    const angle = ((i * 360 / 7 + rotation + globalRotation + (settings?.rotation || 0)) - 90) * Math.PI / 180;
    points.push({
      x: centerX + outerRadius * Math.cos(angle),
      y: centerY + outerRadius * Math.sin(angle),
      angle: i * 360 / 7 + rotation + globalRotation + (settings?.rotation || 0)
    });
  }

  // رسم النجمة السباعية {7/3} - النمط المنتظم
  // الزاوية الداخلية: ≈25.714°، زمرة التناظر: D7
  // النمط {7/3} - يتطلب رسم مسارات متعددة
  // النجمة السباعية {7/3} تتكون من خطوط منفصلة
  const visited = new Array(7).fill(false);
  
  for (let start = 0; start < 7; start++) {
    if (!visited[start]) {
      ctx.beginPath();
      let current = start;
      ctx.moveTo(points[current].x, points[current].y);
      
      do {
        visited[current] = true;
        current = (current + 3) % 7;
        ctx.lineTo(points[current].x, points[current].y);
      } while (current !== start);
      
      ctx.closePath();
      
      // التعبئة إذا كانت مفعلة
      if (fillStar) {
        ctx.fillStyle = "rgba(254, 202, 87, 0.3)";
        ctx.fill();
      }
      
      ctx.stroke();
    }
  }
  
  // إظهار الزوايا إذا كانت مفعلة
  if (showStarAngles) {
    points.forEach((point, index) => {
      const displayAngle = (point.angle % 360 + 360) % 360;
      
      ctx.save();
      ctx.font = "14px Arial";
      ctx.fillStyle = "#B8870F";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.textAlign = "center";
      
      const textOffset = 25;
      const textAngle = (point.angle - 90) * Math.PI / 180;
      const textX = centerX + (outerRadius + textOffset) * Math.cos(textAngle);
      const textY = centerY + (outerRadius + textOffset) * Math.sin(textAngle);
      
      ctx.strokeText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.fillText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.restore();
    });
  }

  // رسم رؤوس النجمة السباعية بلون أساسي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء
  points.forEach((point, i) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#B8870F'; // استخدام اللون الأساسي
    ctx.fill();
    ctx.strokeStyle = "white"; // حدود بيضاء للوضوح
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // نقطة مركزية
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.restore();
  });
  
  ctx.restore();
};

// النجمة الثمانية
export const drawOctagonStar = (ctx, centerX, centerY, outerRadius, innerRadius, rotation = 0, globalRotation = 0, fillStar = false, showStarAngles = false, settings = { rotation: 0 }) => {
  ctx.save();
  ctx.strokeStyle = '#FF9FF3';
  ctx.lineWidth = 2;
  
  // حساب النقاط الثمانية على المحيط (كل 45°)
  const points = [];
  for (let i = 0; i < 8; i++) {
    const angle = ((i * 45 + rotation + globalRotation + (settings?.rotation || 0)) - 90) * Math.PI / 180;
    points.push({
      x: centerX + outerRadius * Math.cos(angle),
      y: centerY + outerRadius * Math.sin(angle),
      angle: i * 45 + rotation + globalRotation + (settings?.rotation || 0)
    });
  }

  // رسم النجمة الثمانية بالنمط {8/3}
  // النمط {8/3}: نرسم مسار مغلق للحصول على شكل قابل للتعبئة
  ctx.beginPath();
  
  // البدء من النقطة الأولى واتباع النمط {8/3}
  let currentIndex = 0;
  ctx.moveTo(points[currentIndex].x, points[currentIndex].y);
  
  // رسم النمط الكامل
  for (let i = 0; i < 8; i++) {
    currentIndex = (currentIndex + 3) % 8;
    ctx.lineTo(points[currentIndex].x, points[currentIndex].y);
  }
  ctx.closePath();
  
  // التعبئة إذا كانت مفعلة
  if (fillStar) {
    ctx.fillStyle = "rgba(255, 159, 243, 0.3)";
    ctx.fill();
  }
  
  ctx.stroke();
  
  // إظهار الزوايا إذا كانت مفعلة
  if (showStarAngles) {
    points.forEach((point, index) => {
      const displayAngle = (point.angle % 360 + 360) % 360;
      
      ctx.save();
      ctx.font = "14px Arial";
      ctx.fillStyle = "#CC4DBC";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.textAlign = "center";
      
      const textOffset = 25;
      const textAngle = (point.angle - 90) * Math.PI / 180;
      const textX = centerX + (outerRadius + textOffset) * Math.cos(textAngle);
      const textY = centerY + (outerRadius + textOffset) * Math.sin(textAngle);
      
      ctx.strokeText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.fillText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.restore();
    });
  }

  // رسم رؤوس النجمة الثمانية بلون أساسي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء
  points.forEach((point, i) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#CC4DBC'; // استخدام اللون الأساسي
    ctx.fill();
    ctx.strokeStyle = "white"; // حدود بيضاء للوضوح
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // نقطة مركزية
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.restore();
  });
  
  ctx.restore();
};

// النجمة التساعية
export const drawEnneagonStar = (ctx, centerX, centerY, outerRadius, innerRadius, rotation = 0, globalRotation = 0, fillStar = false, showStarAngles = false, settings = { rotation: 0 }) => {
  ctx.save();
  ctx.strokeStyle = '#54A0FF';
  ctx.lineWidth = 2;
  
  // حساب النقاط التسع على المحيط (كل 40°)
  const points = [];
  for (let i = 0; i < 9; i++) {
    const angle = ((i * 360 / 9 + rotation + globalRotation + (settings?.rotation || 0)) - 90) * Math.PI / 180;
    points.push({
      x: centerX + outerRadius * Math.cos(angle),
      y: centerY + outerRadius * Math.sin(angle),
      angle: i * 360 / 9 + rotation + globalRotation + (settings?.rotation || 0)
    });
  }

  // رسم النجمة التساعية بالنمط {9/4}
  // النمط {9/4}: رسم خطوط منفصلة من كل نقطة إلى النقطة الرابعة التالية
  // هذا سينتج عنه نجمة تساعية مختلفة عن النمط {9/3}
  for (let i = 0; i < 9; i++) {
    const startIndex = i;
    const endIndex = (i + 4) % 9;
    
    ctx.beginPath();
    ctx.moveTo(points[startIndex].x, points[startIndex].y);
    ctx.lineTo(points[endIndex].x, points[endIndex].y);
    ctx.stroke();
  }
  
  // التعبئة إذا كانت مفعلة - تحتاج لحل معقد لهذا النمط
  if (fillStar) {
    // نرسم مضلع مبسط للتعبئة
    ctx.beginPath();
    let currentIndex = 0;
    ctx.moveTo(points[currentIndex].x, points[currentIndex].y);
    
    for (let i = 0; i < 9; i++) {
      currentIndex = (currentIndex + 4) % 9;
      ctx.lineTo(points[currentIndex].x, points[currentIndex].y);
    }
    ctx.closePath();
    
    ctx.fillStyle = "rgba(84, 160, 255, 0.2)";
    ctx.fill();
  }
  
  // إظهار الزوايا إذا كانت مفعلة
  if (showStarAngles) {
    points.forEach((point, index) => {
      const displayAngle = (point.angle % 360 + 360) % 360;
      
      ctx.save();
      ctx.font = "14px Arial";
      ctx.fillStyle = "#2E5FCC";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.textAlign = "center";
      
      const textOffset = 25;
      const textAngle = (point.angle - 90) * Math.PI / 180;
      const textX = centerX + (outerRadius + textOffset) * Math.cos(textAngle);
      const textY = centerY + (outerRadius + textOffset) * Math.sin(textAngle);
      
      ctx.strokeText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.fillText(`${displayAngle.toFixed(0)}°`, textX, textY);
      ctx.restore();
    });
  }

  // رسم رؤوس النجمة التساعية بلون أساسي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء
  points.forEach((point, i) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#2E5FCC'; // استخدام اللون الأساسي
    ctx.fill();
    ctx.strokeStyle = "white"; // حدود بيضاء للوضوح
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // نقطة مركزية
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.restore();
  });
  
  ctx.restore();
};

// النجمة العشارية
export const drawDecagonStar = (ctx, centerX, centerY, outerRadius, innerRadius, rotation = 0, globalRotation = 0, fillStar = false, showStarAngles = false, settings = { rotation: 0 }) => {
  ctx.save();
  ctx.strokeStyle = '#5F27CD';
  ctx.lineWidth = 2;
  
  // إرجاع إلى الأصل للحسابات
  ctx.restore();
  ctx.save();
  
  const r = outerRadius;
  const points = [];
  
  // حساب النقاط العشر على المحيط (كل 36°)
  for (let i = 0; i < 10; i++) {
    const angle = ((i * 360 / 10) + rotation + settings.rotation - 90) * Math.PI / 180;
    points.push({
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
      angle: (i * 360 / 10) + rotation + settings.rotation
    });
  }

  // رسم النجمة العشارية بالنمط {10/4}
  ctx.strokeStyle = '#5F27CD';
  ctx.lineWidth = 2;
  
  // النمط {10/4}: رسم خطوط منفصلة من كل نقطة إلى النقطة الرابعة التالية
  // هذا سينتج عنه نجمة عشارية كاملة مع جميع الخطوط المرئية
  for (let i = 0; i < 10; i++) {
    const startIndex = i;
    const endIndex = (i + 4) % 10;
    
    ctx.beginPath();
    ctx.moveTo(points[startIndex].x, points[startIndex].y);
    ctx.lineTo(points[endIndex].x, points[endIndex].y);
    ctx.stroke();
  }
  
  // التعبئة إذا كانت مفعلة - نرسم المضلعات المتشكلة من تقاطع الخطوط
  if (fillStar) {
    ctx.fillStyle = "rgba(95, 39, 205, 0.2)"; // استخدام لون مماثل للون الأصلي مع شفافية
    
    // النمط {10/4} ينتج عنه نجمة مكونة من خماسيين متداخلين
    // الخماسي الأول: النقاط 0, 4, 8, 2, 6
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[4].x, points[4].y);
    ctx.lineTo(points[8].x, points[8].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.lineTo(points[6].x, points[6].y);
    ctx.closePath();
    ctx.fill();
    
    // الخماسي الثاني: النقاط 1, 5, 9, 3, 7
    ctx.beginPath();
    ctx.moveTo(points[1].x, points[1].y);
    ctx.lineTo(points[5].x, points[5].y);
    ctx.lineTo(points[9].x, points[9].y);
    ctx.lineTo(points[3].x, points[3].y);
    ctx.lineTo(points[7].x, points[7].y);
    ctx.closePath();
    ctx.fill();
  }
  
  // رسم خطوط الاتصال من المركز إلى الرؤوس (اختياري)
  ctx.save();
  ctx.strokeStyle = "rgba(95, 39, 205, 0.5)";
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  points.forEach((p) => {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });
  ctx.restore();

  // إظهار الزوايا إذا كانت مفعلة
  if (showStarAngles) {
    points.forEach((point, index) => {
      const angle = ((index * 360 / 10) + rotation + settings.rotation) % 360;
      const displayAngle = angle < 0 ? angle + 360 : angle;
      
      ctx.save();
      ctx.font = "12px Arial";
      ctx.fillStyle = '#5F27CD';
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.textAlign = "center";
      
      // رسم خلفية للنص
      ctx.strokeText(`${displayAngle.toFixed(0)}°`, point.x, point.y - 15);
      // رسم النص
      ctx.fillText(`${displayAngle.toFixed(0)}°`, point.x, point.y - 15);
      ctx.restore();
    });
  }

  // رسم رؤوس النجمة العشارية بلون أساسي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء
  points.forEach((point, i) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#5F27CD'; // استخدام اللون الأساسي
    ctx.fill();
    ctx.strokeStyle = "white"; // حدود بيضاء للوضوح
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // نقطة مركزية
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.restore();
  });
  
  ctx.restore();
};

// النجمة الحادية عشر
export const drawHendecagonStar = (ctx, centerX, centerY, outerRadius, innerRadius, rotation = 0, globalRotation = 0, fillStar = false, showStarAngles = false, settings = { rotation: 0 }) => {
  ctx.save();
  ctx.strokeStyle = '#00D2D3';
  ctx.lineWidth = 2;
  
  // إرجاع إلى الأصل للحسابات
  ctx.restore();
  ctx.save();
  
  const r = outerRadius;
  const points = [];
  
  // حساب النقاط الإحدى عشرة على المحيط
  for (let i = 0; i < 11; i++) {
    const angle = ((i * 360 / 11) + rotation + settings.rotation - 90) * Math.PI / 180;
    points.push({
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    });
  }

  // رسم النجمة الحادية عشرة بالنمط {11/4}
  ctx.strokeStyle = '#00D2D3';
  ctx.lineWidth = 2;
  
  // النمط {11/4}: رسم خطوط منفصلة من كل نقطة إلى النقطة الرابعة التالية
  // هذا سينتج عنه نجمة حادية عشر كاملة مع جميع الخطوط المرئية
  for (let i = 0; i < 11; i++) {
    const startIndex = i;
    const endIndex = (i + 4) % 11;
    
    ctx.beginPath();
    ctx.moveTo(points[startIndex].x, points[startIndex].y);
    ctx.lineTo(points[endIndex].x, points[endIndex].y);
    ctx.stroke();
  }
  
  // التعبئة إذا كانت مفعلة - نرسم مسار واحد مغلق
  if (fillStar) {
    ctx.fillStyle = "rgba(0, 210, 211, 0.2)"; // استخدام لون مماثل للون الأصلي مع شفافية
    
    // النمط {11/4} ينتج عنه نجمة واحدة متصلة
    ctx.beginPath();
    let currentIndex = 0;
    ctx.moveTo(points[currentIndex].x, points[currentIndex].y);
    
    for (let i = 0; i < 11; i++) {
      currentIndex = (currentIndex + 4) % 11;
      ctx.lineTo(points[currentIndex].x, points[currentIndex].y);
    }
    ctx.closePath();
    ctx.fill();
  }
  
  // رسم خطوط الاتصال من المركز إلى الرؤوس (اختياري)
  ctx.save();
  ctx.strokeStyle = "rgba(0, 210, 211, 0.5)";
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  points.forEach((p) => {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });
  ctx.restore();

  // إظهار الزوايا إذا كانت مفعلة
  if (showStarAngles) {
    points.forEach((point, index) => {
      const angle = ((index * 360 / 11) + rotation + settings.rotation) % 360;
      const displayAngle = angle < 0 ? angle + 360 : angle;
      
      ctx.save();
      ctx.font = "12px Arial";
      ctx.fillStyle = '#00D2D3'; // نفس لون النجمة
      ctx.strokeStyle = "white"; // خلفية بيضاء للنص
      ctx.lineWidth = 3;
      ctx.textAlign = "center";
      
      // رسم خلفية للنص
      ctx.strokeText(`${displayAngle.toFixed(0)}°`, point.x, point.y - 15);
      ctx.fillText(`${displayAngle.toFixed(0)}°`, point.x, point.y - 15);
      ctx.restore();
    });
  }

  // رسم رؤوس النجمة الحادية عشرية بلون أساسي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء
  points.forEach((point, i) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#00D2D3'; // استخدام اللون الأساسي
    ctx.fill();
    ctx.strokeStyle = "white"; // حدود بيضاء للوضوح
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // نقطة مركزية
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.restore();
  });
  
  ctx.restore();
};

// النجمة الإثني عشرية
export const drawDodecagonStar = (ctx, centerX, centerY, outerRadius, innerRadius, rotation = 0, globalRotation = 0, fillStar = false, showStarAngles = false, settings = { rotation: 0 }) => {
  ctx.save();
  ctx.strokeStyle = '#FF6B35';
  ctx.lineWidth = 2;
  
  // إرجاع إلى الأصل للحسابات
  ctx.restore();
  ctx.save();
  
  const r = outerRadius;
  const points = [];
  
  // حساب النقاط الاثنى عشرة على المحيط (كل 30°)
  for (let i = 0; i < 12; i++) {
    const angle = ((i * 360 / 12) + rotation + settings.rotation - 90) * Math.PI / 180;
    points.push({
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    });
  }

  // رسم النجمة الثانية عشرة بالنمط {12/5}
  ctx.strokeStyle = '#FF6B35';
  ctx.lineWidth = 2;
  
  // النمط {12/5}: رسم خطوط منفصلة من كل نقطة إلى النقطة الخامسة التالية
  // هذا سينتج عنه نجمة اثني عشر كاملة مع جميع الخطوط المرئية
  for (let i = 0; i < 12; i++) {
    const startIndex = i;
    const endIndex = (i + 5) % 12;
    
    ctx.beginPath();
    ctx.moveTo(points[startIndex].x, points[startIndex].y);
    ctx.lineTo(points[endIndex].x, points[endIndex].y);
    ctx.stroke();
  }
  
  // التعبئة إذا كانت مفعلة - نرسم مسار واحد مغلق
  if (fillStar) {
    ctx.fillStyle = "rgba(255, 107, 53, 0.2)"; // استخدام لون مماثل للون الأصلي مع شفافية
    
    // النمط {12/5} ينتج عنه نجمة واحدة متصلة
    ctx.beginPath();
    let currentIndex = 0;
    ctx.moveTo(points[currentIndex].x, points[currentIndex].y);
    
    for (let i = 0; i < 12; i++) {
      currentIndex = (currentIndex + 5) % 12;
      ctx.lineTo(points[currentIndex].x, points[currentIndex].y);
    }
    ctx.closePath();
    ctx.fill();
  }
  
  // رسم خطوط الاتصال من المركز إلى الرؤوس (اختياري)
  ctx.save();
  ctx.strokeStyle = "rgba(255, 107, 53, 0.5)";
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  points.forEach((p) => {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });
  ctx.restore();

  // إظهار الزوايا إذا كانت مفعلة
  if (showStarAngles) {
    points.forEach((point, index) => {
      const angle = ((index * 360 / 12) + rotation + settings.rotation) % 360;
      const displayAngle = angle < 0 ? angle + 360 : angle;
      
      ctx.save();
      ctx.font = "12px Arial";
      ctx.fillStyle = '#FF6B35'; // نفس لون النجمة
      ctx.strokeStyle = "white"; // خلفية بيضاء للنص
      ctx.lineWidth = 3;
      ctx.textAlign = "center";
      
      // رسم خلفية للنص
      ctx.strokeText(`${displayAngle.toFixed(0)}°`, point.x, point.y - 15);
      ctx.fillText(`${displayAngle.toFixed(0)}°`, point.x, point.y - 15);
      ctx.restore();
    });
  }

  // رسم رؤوس النجمة الاثني عشرية بلون أساسي دائماً ظاهرة - في النهاية ليكونوا فوق كل شيء
  points.forEach((point, i) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#FF6B35'; // استخدام اللون الأساسي
    ctx.fill();
    ctx.strokeStyle = "white"; // حدود بيضاء للوضوح
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // نقطة مركزية
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.restore();
  });
  
  ctx.restore();
};

// قائمة الأشكال المتاحة
export const availableShapes = [
  // الأشكال الهندسية الأساسية
  { 
    id: 'triangle', 
    name: '🔺 المثلث (3 أضلاع)', 
    drawFunction: drawTriangle,
    type: 'polygon',
    sides: 3,
    defaultColor: '#FF6B6B'
  },
  { 
    id: 'square', 
    name: '⬛ المربع (4 أضلاع)', 
    drawFunction: drawSquare,
    type: 'polygon',
    sides: 4,
    defaultColor: '#4ECDC4'
  },
  { 
    id: 'pentagon', 
    name: '🔷 الخماسي (5 أضلاع)', 
    drawFunction: drawPentagon,
    type: 'polygon',
    sides: 5,
    defaultColor: '#45B7D1'
  },
  { 
    id: 'hexagon', 
    name: '🛑 السداسي (6 أضلاع)', 
    drawFunction: drawHexagon,
    type: 'polygon',
    sides: 6,
    defaultColor: '#96CEB4'
  },
  { 
    id: 'heptagon', 
    name: '🔷 السباعي (7 أضلاع)', 
    drawFunction: drawHeptagon,
    type: 'polygon',
    sides: 7,
    defaultColor: '#FECA57'
  },
  { 
    id: 'octagon', 
    name: '🧿 الثماني (8 أضلاع)', 
    drawFunction: drawOctagon,
    type: 'polygon',
    sides: 8,
    defaultColor: '#FF9FF3'
  },
  { 
    id: 'enneagon', 
    name: '🔷 التساعي (9 أضلاع)', 
    drawFunction: drawEnneagon,
    type: 'polygon',
    sides: 9,
    defaultColor: '#54A0FF'
  },
  { 
    id: 'decagon', 
    name: '🔷 العشاري (10 أضلاع)', 
    drawFunction: drawDecagon,
    type: 'polygon',
    sides: 10,
    defaultColor: '#5F27CD'
  },
  { 
    id: 'hendecagon', 
    name: '🔷 الحادي عشر (11 ضلع)', 
    drawFunction: drawHendecagon,
    type: 'polygon',
    sides: 11,
    defaultColor: '#00D2D3'
  },
  { 
    id: 'dodecagon', 
    name: '🔷 الاثني عشر (12 ضلع)', 
    drawFunction: drawDodecagon,
    type: 'polygon',
    sides: 12,
    defaultColor: '#FF6B35'
  },

  // النجوم
  { 
    id: 'triangleStar', 
    name: '⭐ النجمة الثلاثية {3/3}', 
    drawFunction: drawTriangleStar,
    type: 'star',
    sides: 3,
    defaultColor: '#FFD700'
  },
  { 
    id: 'squareStar', 
    name: '⭐ النجمة الرباعية {4/4}', 
    drawFunction: drawSquareStar,
    type: 'star',
    sides: 4,
    defaultColor: '#FFD700'
  },
  { 
    id: 'pentagonStar', 
    name: '⭐ النجمة الخماسية {5/5}', 
    drawFunction: drawPentagonStar,
    type: 'star',
    sides: 5,
    defaultColor: '#45B7D1'
  },
  { 
    id: 'hexagonStar', 
    name: '⭐ النجمة السداسية {6/6}', 
    drawFunction: drawHexagonStar,
    type: 'star',
    sides: 6,
    defaultColor: '#96CEB4'
  },
  { 
    id: 'heptagonStar', 
    name: '⭐ النجمة السباعية {7/7}', 
    drawFunction: drawHeptagonStar,
    type: 'star',
    sides: 7,
    defaultColor: '#FECA57'
  },
  { 
    id: 'octagonStar', 
    name: '⭐ النجمة الثمانية {8/8}', 
    drawFunction: drawOctagonStar,
    type: 'star',
    sides: 8,
    defaultColor: '#FF9FF3'
  },
  { 
    id: 'enneagonStar', 
    name: '⭐ النجمة التساعية {9/9}', 
    drawFunction: drawEnneagonStar,
    type: 'star',
    sides: 9,
    defaultColor: '#54A0FF'
  },
  { 
    id: 'decagonStar', 
    name: '⭐ النجمة العشارية {10/4}', 
    drawFunction: drawDecagonStar,
    type: 'star',
    sides: 10,
    defaultColor: '#5F27CD'
  },
  { 
    id: 'hendecagonStar', 
    name: '⭐ النجمة الحادية عشر {11/4}', 
    drawFunction: drawHendecagonStar,
    type: 'star',
    sides: 11,
    defaultColor: '#00D2D3'
  },
  { 
    id: 'dodecagonStar', 
    name: '⭐ النجمة الإثني عشرية {12/5}', 
    drawFunction: drawDodecagonStar,
    type: 'star',
    sides: 12,
    defaultColor: '#FF6B35'
  }
];

// دالة رسم الأشكال المختارة
export const renderSelectedShapes = (ctx, centerX, centerY, selectedShapes, shapeProperties, degreeRingRadius, settings) => {
  selectedShapes.forEach(shapeId => {
    const shape = availableShapes.find(s => s.id === shapeId);
    if (shape && shapeProperties[shapeId]?.visible) {
      const props = shapeProperties[shapeId];
      
      const shapeRadius = degreeRingRadius;
      const totalRotation = (settings?.rotation || 0);
      
      if (shape.type === 'star') {
        shape.drawFunction(
          ctx, 
          centerX, 
          centerY, 
          shapeRadius, 
          shapeRadius * 0.7,
          props.rotation || 0,
          totalRotation,
          props.fillStar || props.fillShape || false,
          props.showStarAngles || false,
          settings
        );
      } else {
        shape.drawFunction(
          ctx, 
          centerX, 
          centerY, 
          shapeRadius,
          props.rotation || 0,
          totalRotation,
          props.fillShape || false,
          props.showAngles || false,
          settings
        );
      }
    }
  });
};
