// ملف الأشكال الهندسية - GeometricShapes.jsx
import React from 'react';

// ========================================
// الأشكال الهندسية الأساسية (3-12 أضلاع)
// ========================================

// دالة رسم المثلث
export const drawTriangle = (ctx, centerX, centerY, radius, color = '#FF6B6B', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation + globalRotation) * Math.PI / 180);
  
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const degree = i * 120; // 0°, 120°, 240°
    const angle = (degree - 90) * Math.PI / 180;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// دالة رسم المربع
export const drawSquare = (ctx, centerX, centerY, radius, color = '#4ECDC4', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation + globalRotation) * Math.PI / 180);
  
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const degree = i * 90; // 0°, 90°, 180°, 270°
    const angle = (degree - 90) * Math.PI / 180;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// دالة رسم الخماسي
export const drawPentagon = (ctx, centerX, centerY, radius, color = '#45B7D1', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation + globalRotation) * Math.PI / 180);
  
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const degree = i * 72; // 0°, 72°, 144°, 216°, 288°
    const angle = (degree - 90) * Math.PI / 180;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// دالة رسم السداسي
export const drawHexagon = (ctx, centerX, centerY, radius, color = '#96CEB4', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation + globalRotation) * Math.PI / 180);
  
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const degree = i * 60; // 0°, 60°, 120°, 180°, 240°, 300°
    const angle = (degree - 90) * Math.PI / 180;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// دالة رسم السباعي
export const drawHeptagon = (ctx, centerX, centerY, radius, color = '#FECA57', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation + globalRotation) * Math.PI / 180);
  
  ctx.beginPath();
  for (let i = 0; i < 7; i++) {
    const degree = i * (360 / 7); // ~51.43° لكل نقطة
    const angle = (degree - 90) * Math.PI / 180;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// دالة رسم الثماني
export const drawOctagon = (ctx, centerX, centerY, radius, color = '#FF9FF3', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation + globalRotation) * Math.PI / 180);
  
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const degree = i * 45; // 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°
    const angle = (degree - 90) * Math.PI / 180;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// دالة رسم التساعي
export const drawEnneagon = (ctx, centerX, centerY, radius, color = '#54A0FF', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation + globalRotation) * Math.PI / 180);
  
  ctx.beginPath();
  for (let i = 0; i < 9; i++) {
    const degree = i * 40; // 40° لكل نقطة
    const angle = (degree - 90) * Math.PI / 180;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// دالة رسم العشاري
export const drawDecagon = (ctx, centerX, centerY, radius, color = '#5F27CD', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation + globalRotation) * Math.PI / 180);
  
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const degree = i * 36; // 36° لكل نقطة
    const angle = (degree - 90) * Math.PI / 180;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// دالة رسم الحادي عشر
export const drawHendecagon = (ctx, centerX, centerY, radius, color = '#00D2D3', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation + globalRotation) * Math.PI / 180);
  
  ctx.beginPath();
  for (let i = 0; i < 11; i++) {
    const degree = i * (360 / 11); // ~32.73° لكل نقطة
    const angle = (degree - 90) * Math.PI / 180;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// دالة رسم الاثني عشر
export const drawDodecagon = (ctx, centerX, centerY, radius, color = '#FF6B35', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation + globalRotation) * Math.PI / 180);
  
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    const degree = i * 30; // 30° لكل نقطة
    const angle = (degree - 90) * Math.PI / 180;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// ========================================
// النجوم (3-12 رؤوس)
// ========================================

// دالة رسم النجمة الثلاثية {3/3}
export const drawTriangleStar = (ctx, centerX, centerY, outerRadius, innerRadius, color = '#FF6B6B', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation + globalRotation) * Math.PI / 180);
  
  // النجمة الثلاثية الصحيحة {3/3} - زوايا 45°, 165°, 285°
  const customStar3Angles = [45, 165, 285];
  
  const outerPoints = [];
  for (let i = 0; i < 3; i++) {
    const degree = customStar3Angles[i];
    const angle = (degree - 90) * Math.PI / 180;
    const x = outerRadius * Math.cos(angle);
    const y = outerRadius * Math.sin(angle);
    outerPoints.push({ x, y });
  }
  
  const innerPoints = [];
  for (let i = 0; i < 3; i++) {
    const angle1 = (customStar3Angles[i] - 90) * Math.PI / 180;
    const angle2 = (customStar3Angles[(i + 1) % 3] - 90) * Math.PI / 180;
    
    let midAngle = (angle1 + angle2) / 2;
    if (Math.abs(angle2 - angle1) > Math.PI) {
      midAngle += Math.PI;
    }
    
    const x = innerRadius * Math.cos(midAngle);
    const y = innerRadius * Math.sin(midAngle);
    innerPoints.push({ x, y });
  }
  
  ctx.beginPath();
  ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
  for (let i = 0; i < 3; i++) {
    const nextInner = innerPoints[i];
    const nextOuter = outerPoints[(i + 1) % 3];
    ctx.lineTo(nextInner.x, nextInner.y);
    ctx.lineTo(nextOuter.x, nextOuter.y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// دالة رسم النجمة الرباعية
export const drawSquareStar = (ctx, centerX, centerY, outerRadius, innerRadius, color = '#4ECDC4', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation + globalRotation) * Math.PI / 180);
  
  const outerPoints = [];
  for (let i = 0; i < 4; i++) {
    const degree = i * 90; // 0°, 90°, 180°, 270°
    const angle = (degree - 90) * Math.PI / 180;
    const x = outerRadius * Math.cos(angle);
    const y = outerRadius * Math.sin(angle);
    outerPoints.push({ x, y });
  }
  
  const innerPoints = [];
  for (let i = 0; i < 4; i++) {
    const degree = i * 90 + 45; // 45°, 135°, 225°, 315°
    const angle = (degree - 90) * Math.PI / 180;
    const x = innerRadius * Math.cos(angle);
    const y = innerRadius * Math.sin(angle);
    innerPoints.push({ x, y });
  }
  
  ctx.beginPath();
  ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
  for (let i = 0; i < 4; i++) {
    const nextInner = innerPoints[i];
    const nextOuter = outerPoints[(i + 1) % 4];
    ctx.lineTo(nextInner.x, nextInner.y);
    ctx.lineTo(nextOuter.x, nextOuter.y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// دالة رسم النجمة الخماسية
export const drawPentagonStar = (ctx, centerX, centerY, outerRadius, innerRadius, color = '#45B7D1', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation + globalRotation) * Math.PI / 180);
  
  const outerPoints = [];
  for (let i = 0; i < 5; i++) {
    const degree = i * 72;
    const angle = (degree - 90) * Math.PI / 180;
    const x = outerRadius * Math.cos(angle);
    const y = outerRadius * Math.sin(angle);
    outerPoints.push({ x, y });
  }
  
  const innerPoints = [];
  for (let i = 0; i < 5; i++) {
    const degree = i * 72 + 36;
    const angle = (degree - 90) * Math.PI / 180;
    const x = innerRadius * Math.cos(angle);
    const y = innerRadius * Math.sin(angle);
    innerPoints.push({ x, y });
  }
  
  ctx.beginPath();
  ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
  for (let i = 0; i < 5; i++) {
    const nextInner = innerPoints[i];
    const nextOuter = outerPoints[(i + 1) % 5];
    ctx.lineTo(nextInner.x, nextInner.y);
    ctx.lineTo(nextOuter.x, nextOuter.y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// دالة رسم النجمة السداسية
export const drawHexagonStar = (ctx, centerX, centerY, outerRadius, innerRadius, color = '#96CEB4', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation + globalRotation) * Math.PI / 180);
  
  const outerPoints = [];
  for (let i = 0; i < 6; i++) {
    const degree = i * 60;
    const angle = (degree - 90) * Math.PI / 180;
    const x = outerRadius * Math.cos(angle);
    const y = outerRadius * Math.sin(angle);
    outerPoints.push({ x, y });
  }
  
  const innerPoints = [];
  for (let i = 0; i < 6; i++) {
    const degree = i * 60 + 30;
    const angle = (degree - 90) * Math.PI / 180;
    const x = innerRadius * Math.cos(angle);
    const y = innerRadius * Math.sin(angle);
    innerPoints.push({ x, y });
  }
  
  ctx.beginPath();
  ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
  for (let i = 0; i < 6; i++) {
    const nextInner = innerPoints[i];
    const nextOuter = outerPoints[(i + 1) % 6];
    ctx.lineTo(nextInner.x, nextInner.y);
    ctx.lineTo(nextOuter.x, nextOuter.y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// دالة رسم النجمة السباعية
export const drawHeptagonStar = (ctx, centerX, centerY, outerRadius, innerRadius, color = '#FECA57', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation + globalRotation) * Math.PI / 180);
  
  const outerPoints = [];
  for (let i = 0; i < 7; i++) {
    const degree = i * (360 / 7);
    const angle = (degree - 90) * Math.PI / 180;
    const x = outerRadius * Math.cos(angle);
    const y = outerRadius * Math.sin(angle);
    outerPoints.push({ x, y });
  }
  
  const innerPoints = [];
  for (let i = 0; i < 7; i++) {
    const degree = i * (360 / 7) + (360 / 14);
    const angle = (degree - 90) * Math.PI / 180;
    const x = innerRadius * Math.cos(angle);
    const y = innerRadius * Math.sin(angle);
    innerPoints.push({ x, y });
  }
  
  ctx.beginPath();
  ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
  for (let i = 0; i < 7; i++) {
    const nextInner = innerPoints[i];
    const nextOuter = outerPoints[(i + 1) % 7];
    ctx.lineTo(nextInner.x, nextInner.y);
    ctx.lineTo(nextOuter.x, nextOuter.y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// دالة رسم النجمة الثمانية
export const drawOctagonStar = (ctx, centerX, centerY, outerRadius, innerRadius, color = '#FF9FF3', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation + globalRotation) * Math.PI / 180);
  
  const outerPoints = [];
  for (let i = 0; i < 8; i++) {
    const degree = i * 45;
    const angle = (degree - 90) * Math.PI / 180;
    const x = outerRadius * Math.cos(angle);
    const y = outerRadius * Math.sin(angle);
    outerPoints.push({ x, y });
  }
  
  const innerPoints = [];
  for (let i = 0; i < 8; i++) {
    const degree = i * 45 + 22.5;
    const angle = (degree - 90) * Math.PI / 180;
    const x = innerRadius * Math.cos(angle);
    const y = innerRadius * Math.sin(angle);
    innerPoints.push({ x, y });
  }
  
  ctx.beginPath();
  ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
  for (let i = 0; i < 8; i++) {
    const nextInner = innerPoints[i];
    const nextOuter = outerPoints[(i + 1) % 8];
    ctx.lineTo(nextInner.x, nextInner.y);
    ctx.lineTo(nextOuter.x, nextOuter.y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// دالة رسم النجمة التساعية
export const drawEnneagonStar = (ctx, centerX, centerY, outerRadius, innerRadius, color = '#54A0FF', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation + globalRotation) * Math.PI / 180);
  
  const outerPoints = [];
  for (let i = 0; i < 9; i++) {
    const degree = i * 40;
    const angle = (degree - 90) * Math.PI / 180;
    const x = outerRadius * Math.cos(angle);
    const y = outerRadius * Math.sin(angle);
    outerPoints.push({ x, y });
  }
  
  const innerPoints = [];
  for (let i = 0; i < 9; i++) {
    const degree = i * 40 + 20;
    const angle = (degree - 90) * Math.PI / 180;
    const x = innerRadius * Math.cos(angle);
    const y = innerRadius * Math.sin(angle);
    innerPoints.push({ x, y });
  }
  
  ctx.beginPath();
  ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
  for (let i = 0; i < 9; i++) {
    const nextInner = innerPoints[i];
    const nextOuter = outerPoints[(i + 1) % 9];
    ctx.lineTo(nextInner.x, nextInner.y);
    ctx.lineTo(nextOuter.x, nextOuter.y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// دالة رسم النجمة العشارية
export const drawDecagonStar = (ctx, centerX, centerY, outerRadius, innerRadius, color = '#5F27CD', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation + globalRotation) * Math.PI / 180);
  
  const outerPoints = [];
  for (let i = 0; i < 10; i++) {
    const degree = i * 36;
    const angle = (degree - 90) * Math.PI / 180;
    const x = outerRadius * Math.cos(angle);
    const y = outerRadius * Math.sin(angle);
    outerPoints.push({ x, y });
  }
  
  const innerPoints = [];
  for (let i = 0; i < 10; i++) {
    const degree = i * 36 + 18;
    const angle = (degree - 90) * Math.PI / 180;
    const x = innerRadius * Math.cos(angle);
    const y = innerRadius * Math.sin(angle);
    innerPoints.push({ x, y });
  }
  
  ctx.beginPath();
  ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
  for (let i = 0; i < 10; i++) {
    const nextInner = innerPoints[i];
    const nextOuter = outerPoints[(i + 1) % 10];
    ctx.lineTo(nextInner.x, nextInner.y);
    ctx.lineTo(nextOuter.x, nextOuter.y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// دالة رسم النجمة الحادية عشر
export const drawHendecagonStar = (ctx, centerX, centerY, outerRadius, innerRadius, color = '#00D2D3', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation + globalRotation) * Math.PI / 180);
  
  const outerPoints = [];
  for (let i = 0; i < 11; i++) {
    const degree = i * (360 / 11);
    const angle = (degree - 90) * Math.PI / 180;
    const x = outerRadius * Math.cos(angle);
    const y = outerRadius * Math.sin(angle);
    outerPoints.push({ x, y });
  }
  
  const innerPoints = [];
  for (let i = 0; i < 11; i++) {
    const degree = i * (360 / 11) + (360 / 22);
    const angle = (degree - 90) * Math.PI / 180;
    const x = innerRadius * Math.cos(angle);
    const y = innerRadius * Math.sin(angle);
    innerPoints.push({ x, y });
  }
  
  ctx.beginPath();
  ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
  for (let i = 0; i < 11; i++) {
    const nextInner = innerPoints[i];
    const nextOuter = outerPoints[(i + 1) % 11];
    ctx.lineTo(nextInner.x, nextInner.y);
    ctx.lineTo(nextOuter.x, nextOuter.y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// دالة رسم النجمة الإثني عشرية
export const drawDodecagonStar = (ctx, centerX, centerY, outerRadius, innerRadius, color = '#FF6B35', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation + globalRotation) * Math.PI / 180);
  
  const outerPoints = [];
  for (let i = 0; i < 12; i++) {
    const degree = i * 30;
    const angle = (degree - 90) * Math.PI / 180;
    const x = outerRadius * Math.cos(angle);
    const y = outerRadius * Math.sin(angle);
    outerPoints.push({ x, y });
  }
  
  const innerPoints = [];
  for (let i = 0; i < 12; i++) {
    const degree = i * 30 + 15;
    const angle = (degree - 90) * Math.PI / 180;
    const x = innerRadius * Math.cos(angle);
    const y = innerRadius * Math.sin(angle);
    innerPoints.push({ x, y });
  }
  
  ctx.beginPath();
  ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
  for (let i = 0; i < 12; i++) {
    const nextInner = innerPoints[i];
    const nextOuter = outerPoints[(i + 1) % 12];
    ctx.lineTo(nextInner.x, nextInner.y);
    ctx.lineTo(nextOuter.x, nextOuter.y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// ========================================
// قائمة الأشكال المتاحة الكاملة
// ========================================

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
    defaultColor: '#FF6B6B'
  },
  { 
    id: 'squareStar', 
    name: '⭐ النجمة الرباعية {4/4}', 
    drawFunction: drawSquareStar,
    type: 'star',
    sides: 4,
    defaultColor: '#4ECDC4'
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
    name: '⭐ النجمة العشارية {10/10}', 
    drawFunction: drawDecagonStar,
    type: 'star',
    sides: 10,
    defaultColor: '#5F27CD'
  },
  { 
    id: 'hendecagonStar', 
    name: '⭐ النجمة الحادية عشر {11/11}', 
    drawFunction: drawHendecagonStar,
    type: 'star',
    sides: 11,
    defaultColor: '#00D2D3'
  },
  { 
    id: 'dodecagonStar', 
    name: '⭐ النجمة الإثني عشرية {12/12}', 
    drawFunction: drawDodecagonStar,
    type: 'star',
    sides: 12,
    defaultColor: '#FF6B35'
  }
];

// ========================================
// دالة رسم الأشكال المختارة
// ========================================

export const renderSelectedShapes = (ctx, centerX, centerY, selectedShapes, shapeProperties, degreeRingRadius, settings) => {
  selectedShapes.forEach(shapeId => {
    const shape = availableShapes.find(s => s.id === shapeId);
    if (shape && shapeProperties[shapeId]?.visible) {
      const props = shapeProperties[shapeId];
      
      // حساب نصف القطر مع إمكانية التكبير/التصغير
      const shapeRadius = degreeRingRadius * (props.radiusScale || 1.0);
      
      // حساب الدوران الكلي
      const totalRotation = (props.rotation || 0) + (settings?.rotation || 0);
      
      if (shape.type === 'star') {
        shape.drawFunction(
          ctx, 
          centerX, 
          centerY, 
          shapeRadius, 
          shapeRadius * 0.7, // النصف القطر الداخلي 70% من الخارجي
          props.color || shape.defaultColor,
          props.lineWidth || 2,
          props.rotation || 0,
          totalRotation
        );
      } else {
        shape.drawFunction(
          ctx, 
          centerX, 
          centerY, 
          shapeRadius,
          props.color || shape.defaultColor,
          props.lineWidth || 2,
          props.rotation || 0,
          totalRotation
        );
      }
    }
  });
};

// ========================================
// دوال مساعدة للحصول على الأشكال حسب النوع
// ========================================

// الحصول على جميع الأشكال الهندسية فقط
export const getPolygonShapes = () => {
  return availableShapes.filter(shape => shape.type === 'polygon');
};

// الحصول على جميع النجوم فقط
export const getStarShapes = () => {
  return availableShapes.filter(shape => shape.type === 'star');
};

// الحصول على الأشكال حسب عدد الأضلاع
export const getShapesBySides = (sides) => {
  return availableShapes.filter(shape => shape.sides === sides);
};

// الحصول على جميع الأشكال المرتبة حسب عدد الأضلاع
export const getShapesBySidesGrouped = () => {
  const grouped = {};
  for (let i = 3; i <= 12; i++) {
    grouped[i] = getShapesBySides(i);
  }
  return grouped;
};

// إحصائيات الأشكال
export const getShapesStats = () => {
  return {
    total: availableShapes.length,
    polygons: getPolygonShapes().length,
    stars: getStarShapes().length,
    sidesRange: { min: 3, max: 12 }
  };
};
