// مكتبة الأشكال الهندسية الكاملة

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
  const starAngles = [
    45 * Math.PI / 180,
    165 * Math.PI / 180,
    285 * Math.PI / 180
  ];
  
  const totalRotation = rotation + globalRotation;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.translate(centerX, centerY);
  ctx.rotate(totalRotation);
  
  ctx.beginPath();
  
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

// قائمة جميع الأشكال المتاحة
export const availableShapes = [
  { id: 'triangle', name: 'المثلث', defaultColor: '#FF6B6B', drawFunction: drawTriangle },
  { id: 'triangleStar', name: 'نجمة المثلث', defaultColor: '#FF6B6B', drawFunction: drawTriangleStar },
  { id: 'square', name: 'المربع', defaultColor: '#4ECDC4', drawFunction: drawSquare },
  { id: 'squareStar', name: 'نجمة المربع', defaultColor: '#4ECDC4', drawFunction: drawSquareStar }
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
      
      const radiusMultiplier = props.radiusMultiplier || 1;
      const shapeRadius = baseRadius * radiusMultiplier;
      
      if (shape.id.includes('Star')) {
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
          globalRotation
        );
      } else {
        shapeInfo.drawFunction(
          ctx,
          centerX,
          centerY,
          shapeRadius,
          props.color || shapeInfo.defaultColor,
          props.lineWidth || 2,
          props.rotation || 0,
          globalRotation
        );
      }
    }
  });
};
