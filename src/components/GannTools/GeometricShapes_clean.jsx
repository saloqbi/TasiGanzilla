// مكتبة الأشكال الهندسية الكاملة - جميع الأشكال والنجوم من 3 إلى 12 ضلع

// رسم المثلث
export const drawTriangle = (ctx, centerX, centerY, radius, color = '#FF6B6B', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  const totalRotation = rotation + globalRotation;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate(totalRotation);
  
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// رسم نجمة المثلث
export const drawTriangleStar = (ctx, centerX, centerY, outerRadius, innerRadius, color = '#FF6B6B', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  // نجمة المثلث {3/3} - محسوبة رياضياً
  const starAngles = [
    45 * Math.PI / 180,   // 45 درجة
    165 * Math.PI / 180,  // 165 درجة
    285 * Math.PI / 180   // 285 درجة
  ];
  
  const totalRotation = rotation + globalRotation;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate(totalRotation);
  
  ctx.beginPath();
  
  // رسم النجمة
  for (let i = 0; i < starAngles.length; i++) {
    const angle = starAngles[i];
    const x = outerRadius * Math.cos(angle);
    const y = outerRadius * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// رسم المربع
export const drawSquare = (ctx, centerX, centerY, radius, color = '#4ECDC4', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  const totalRotation = rotation + globalRotation;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate(totalRotation);
  
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const angle = (i * 2 * Math.PI) / 4 - Math.PI / 4;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// رسم نجمة المربع
export const drawSquareStar = (ctx, centerX, centerY, outerRadius, innerRadius, color = '#4ECDC4', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  const totalRotation = rotation + globalRotation;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate(totalRotation);
  
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// رسم الخماسي
export const drawPentagon = (ctx, centerX, centerY, radius, color = '#45B7D1', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  const totalRotation = rotation + globalRotation;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate(totalRotation);
  
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// رسم نجمة الخماسي
export const drawPentagonStar = (ctx, centerX, centerY, outerRadius, innerRadius, color = '#45B7D1', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  const totalRotation = rotation + globalRotation;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate(totalRotation);
  
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// رسم السداسي
export const drawHexagon = (ctx, centerX, centerY, radius, color = '#96CEB4', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  const totalRotation = rotation + globalRotation;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate(totalRotation);
  
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// رسم نجمة السداسي
export const drawHexagonStar = (ctx, centerX, centerY, outerRadius, innerRadius, color = '#96CEB4', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  const totalRotation = rotation + globalRotation;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate(totalRotation);
  
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6 - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// رسم السباعي
export const drawHeptagon = (ctx, centerX, centerY, radius, color = '#FECA57', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  const totalRotation = rotation + globalRotation;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate(totalRotation);
  
  ctx.beginPath();
  for (let i = 0; i < 7; i++) {
    const angle = (i * 2 * Math.PI) / 7 - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// رسم نجمة السباعي
export const drawHeptagonStar = (ctx, centerX, centerY, outerRadius, innerRadius, color = '#FECA57', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  const totalRotation = rotation + globalRotation;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate(totalRotation);
  
  ctx.beginPath();
  for (let i = 0; i < 14; i++) {
    const angle = (i * Math.PI) / 7 - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// رسم الثماني
export const drawOctagon = (ctx, centerX, centerY, radius, color = '#FF9FF3', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  const totalRotation = rotation + globalRotation;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate(totalRotation);
  
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * 2 * Math.PI) / 8 - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// رسم نجمة الثماني
export const drawOctagonStar = (ctx, centerX, centerY, outerRadius, innerRadius, color = '#FF9FF3', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  const totalRotation = rotation + globalRotation;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate(totalRotation);
  
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI) / 8 - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// رسم التساعي
export const drawEnneagon = (ctx, centerX, centerY, radius, color = '#54A0FF', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  const totalRotation = rotation + globalRotation;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate(totalRotation);
  
  ctx.beginPath();
  for (let i = 0; i < 9; i++) {
    const angle = (i * 2 * Math.PI) / 9 - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// رسم نجمة التساعي
export const drawEnneagonStar = (ctx, centerX, centerY, outerRadius, innerRadius, color = '#54A0FF', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  const totalRotation = rotation + globalRotation;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate(totalRotation);
  
  ctx.beginPath();
  for (let i = 0; i < 18; i++) {
    const angle = (i * Math.PI) / 9 - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// رسم العشاري
export const drawDecagon = (ctx, centerX, centerY, radius, color = '#5F27CD', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  const totalRotation = rotation + globalRotation;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate(totalRotation);
  
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (i * 2 * Math.PI) / 10 - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// رسم نجمة العشاري
export const drawDecagonStar = (ctx, centerX, centerY, outerRadius, innerRadius, color = '#5F27CD', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  const totalRotation = rotation + globalRotation;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate(totalRotation);
  
  ctx.beginPath();
  for (let i = 0; i < 20; i++) {
    const angle = (i * Math.PI) / 10 - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// رسم الأحد عشر
export const drawHendecagon = (ctx, centerX, centerY, radius, color = '#00D2D3', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  const totalRotation = rotation + globalRotation;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate(totalRotation);
  
  ctx.beginPath();
  for (let i = 0; i < 11; i++) {
    const angle = (i * 2 * Math.PI) / 11 - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// رسم نجمة الأحد عشر
export const drawHendecagonStar = (ctx, centerX, centerY, outerRadius, innerRadius, color = '#00D2D3', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  const totalRotation = rotation + globalRotation;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate(totalRotation);
  
  ctx.beginPath();
  for (let i = 0; i < 22; i++) {
    const angle = (i * Math.PI) / 11 - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// رسم الاثني عشر
export const drawDodecagon = (ctx, centerX, centerY, radius, color = '#FF6B35', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  const totalRotation = rotation + globalRotation;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate(totalRotation);
  
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    const angle = (i * 2 * Math.PI) / 12 - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// رسم نجمة الاثني عشر
export const drawDodecagonStar = (ctx, centerX, centerY, outerRadius, innerRadius, color = '#FF6B35', lineWidth = 2, rotation = 0, globalRotation = 0) => {
  const totalRotation = rotation + globalRotation;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate(totalRotation);
  
  ctx.beginPath();
  for (let i = 0; i < 24; i++) {
    const angle = (i * Math.PI) / 12 - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

// قائمة جميع الأشكال المتاحة
export const availableShapes = [
  { id: 'triangle', name: 'المثلث', defaultColor: '#FF6B6B', drawFunction: drawTriangle },
  { id: 'triangleStar', name: 'نجمة المثلث', defaultColor: '#FF6B6B', drawFunction: drawTriangleStar },
  { id: 'square', name: 'المربع', defaultColor: '#4ECDC4', drawFunction: drawSquare },
  { id: 'squareStar', name: 'نجمة المربع', defaultColor: '#4ECDC4', drawFunction: drawSquareStar },
  { id: 'pentagon', name: 'الخماسي', defaultColor: '#45B7D1', drawFunction: drawPentagon },
  { id: 'pentagonStar', name: 'نجمة الخماسي', defaultColor: '#45B7D1', drawFunction: drawPentagonStar },
  { id: 'hexagon', name: 'السداسي', defaultColor: '#96CEB4', drawFunction: drawHexagon },
  { id: 'hexagonStar', name: 'نجمة السداسي', defaultColor: '#96CEB4', drawFunction: drawHexagonStar },
  { id: 'heptagon', name: 'السباعي', defaultColor: '#FECA57', drawFunction: drawHeptagon },
  { id: 'heptagonStar', name: 'نجمة السباعي', defaultColor: '#FECA57', drawFunction: drawHeptagonStar },
  { id: 'octagon', name: 'الثماني', defaultColor: '#FF9FF3', drawFunction: drawOctagon },
  { id: 'octagonStar', name: 'نجمة الثماني', defaultColor: '#FF9FF3', drawFunction: drawOctagonStar },
  { id: 'enneagon', name: 'التساعي', defaultColor: '#54A0FF', drawFunction: drawEnneagon },
  { id: 'enneagonStar', name: 'نجمة التساعي', defaultColor: '#54A0FF', drawFunction: drawEnneagonStar },
  { id: 'decagon', name: 'العشاري', defaultColor: '#5F27CD', drawFunction: drawDecagon },
  { id: 'decagonStar', name: 'نجمة العشاري', defaultColor: '#5F27CD', drawFunction: drawDecagonStar },
  { id: 'hendecagon', name: 'الأحد عشر', defaultColor: '#00D2D3', drawFunction: drawHendecagon },
  { id: 'hendecagonStar', name: 'نجمة الأحد عشر', defaultColor: '#00D2D3', drawFunction: drawHendecagonStar },
  { id: 'dodecagon', name: 'الاثني عشر', defaultColor: '#FF6B35', drawFunction: drawDodecagon },
  { id: 'dodecagonStar', name: 'نجمة الاثني عشر', defaultColor: '#FF6B35', drawFunction: drawDodecagonStar }
];

// دالة مساعدة لرسم الأشكال المحددة
export const renderSelectedShapes = (
  ctx,
  selectedShapes,
  centerX,
  centerY,
  baseRadius,
  globalRotation = 0,
  shapeProps = {}
) => {
  selectedShapes.forEach((shape, index) => {
    const shapeInfo = availableShapes.find(s => s.id === shape.id);
    if (shapeInfo) {
      const props = shapeProps[shape.id] || {};
      
      // حساب القطر لكل شكل
      const radiusMultiplier = props.radiusMultiplier || 1;
      const shapeRadius = baseRadius * radiusMultiplier;
      
      // حساب الدوران الإجمالي
      const totalRotation = globalRotation;
      
      // رسم الشكل
      if (shape.id.includes('Star')) {
        // النجوم تحتاج لقطرين
        const innerRadius = shapeRadius * (props.innerRadiusRatio || 0.5);
        shapeInfo.drawFunction(
          ctx,
          centerX,
          centerY,
          shapeRadius,
          innerRadius,
          props.color || shapeInfo.defaultColor,
          props.lineWidth || 2,
          props.rotation || 0,
          totalRotation
        );
      } else {
        // الأشكال العادية
        shapeInfo.drawFunction(
          ctx,
          centerX,
          centerY,
          shapeRadius,
          props.color || shape.defaultColor,
          props.lineWidth || 2,
          props.rotation || 0,
          totalRotation // استخدام الدوران المحسوب
        );
      }
    }
  });
};
