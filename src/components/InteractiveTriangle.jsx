import React, { useRef, useEffect, useState } from 'react';

const InteractiveTriangle = () => {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPointIndex, setDraggedPointIndex] = useState(null);
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // زوايا المثلث الأساسية (يمكن تعديلها)
  const [triangleAngles, setTriangleAngles] = useState([0, 120, 240]);

  const canvasSize = 400;
  const center = canvasSize / 2;
  const triangleRadius = 150;

  // حساب نقاط المثلث
  const getTrianglePoints = () => {
    return triangleAngles.map((angle) => {
      const rad = ((angle + rotation - 90) * Math.PI) / 180; // -90 لجعل 0° في الأعلى
      return {
        x: center + triangleRadius * Math.cos(rad),
        y: center + triangleRadius * Math.sin(rad)
      };
    });
  };

  // رسم المثلث والنقاط
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    const trianglePoints = getTrianglePoints();

    // رسم دائرة الخلفية
    ctx.beginPath();
    ctx.arc(center, center, triangleRadius + 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#f5f5f5';
    ctx.fill();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.stroke();

    // رسم خطوط من المركز إلى النقاط
    trianglePoints.forEach((point) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // رسم المثلث
    ctx.beginPath();
    ctx.moveTo(trianglePoints[0].x, trianglePoints[0].y);
    trianglePoints.forEach((point, i) => {
      if (i > 0) ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(76, 175, 80, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 3;
    ctx.stroke();

    // رسم النقاط الحمراء القابلة للسحب
    trianglePoints.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI);
      
      // تغيير اللون حسب الحالة
      if (draggedPointIndex === index) {
        ctx.fillStyle = '#ff4444'; // أحمر داكن عند السحب
      } else if (hoveredPointIndex === index) {
        ctx.fillStyle = '#ff8888'; // أحمر فاتح عند التمرير
      } else {
        ctx.fillStyle = '#ff0000'; // أحمر عادي
      }
      
      ctx.fill();
      ctx.strokeStyle = '#800000';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // رسم النقطة المركزية
    ctx.beginPath();
    ctx.arc(center, center, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();

    // عرض الزوايا
    trianglePoints.forEach((point, index) => {
      const currentAngle = (triangleAngles[index] + rotation) % 360;
      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // موضع النص خارج النقطة
      const textOffset = 25;
      const textAngle = ((triangleAngles[index] + rotation - 90) * Math.PI) / 180;
      const textX = center + (triangleRadius + textOffset) * Math.cos(textAngle);
      const textY = center + (triangleRadius + textOffset) * Math.sin(textAngle);
      
      ctx.fillText(`${currentAngle.toFixed(0)}°`, textX, textY);
    });
  };

  // التحقق من قرب النقطة للماوس
  const getPointAtPosition = (mouseX, mouseY) => {
    const trianglePoints = getTrianglePoints();
    for (let i = 0; i < trianglePoints.length; i++) {
      const point = trianglePoints[i];
      const distance = Math.sqrt(
        Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2)
      );
      if (distance <= 15) { // منطقة أكبر للتفاعل
        return i;
      }
    }
    return null;
  };

  // أحداث الماوس
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const pointIndex = getPointAtPosition(mouseX, mouseY);
    
    if (pointIndex !== null) {
      setIsDragging(true);
      setDraggedPointIndex(pointIndex);
      setLastMousePos({ x: mouseX, y: mouseY });
      console.log(`بدء سحب النقطة ${pointIndex}`);
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging && draggedPointIndex !== null) {
      // حساب الزاوية الجديدة بناءً على موضع الماوس
      const deltaX = mouseX - center;
      const deltaY = mouseY - center;
      let newAngle = (Math.atan2(deltaY, deltaX) * 180 / Math.PI) + 90; // +90 لجعل 0° في الأعلى
      
      if (newAngle < 0) newAngle += 360;
      if (newAngle >= 360) newAngle -= 360;

      // تحديث زاوية النقطة المسحوبة
      const newAngles = [...triangleAngles];
      newAngles[draggedPointIndex] = newAngle;
      setTriangleAngles(newAngles);
      
      console.log(`سحب النقطة ${draggedPointIndex} إلى زاوية: ${newAngle.toFixed(1)}°`);
    } else {
      // تحديث hover
      const pointIndex = getPointAtPosition(mouseX, mouseY);
      setHoveredPointIndex(pointIndex);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      console.log('انتهاء السحب');
      setIsDragging(false);
      setDraggedPointIndex(null);
    }
  };

  // إعداد canvas و event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvasSize;
    canvas.height = canvasSize;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;

    // إضافة event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    // تغيير cursor
    canvas.style.cursor = hoveredPointIndex !== null ? 'pointer' : 'default';

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [isDragging, draggedPointIndex, hoveredPointIndex, triangleAngles, rotation]);

  // رسم canvas عند تغيير الحالة
  useEffect(() => {
    draw();
  }, [triangleAngles, rotation, hoveredPointIndex, draggedPointIndex]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3>مثلث تفاعلي - اسحب النقاط الحمراء</h3>
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={() => setRotation(rotation - 15)}
          style={{ margin: '0 5px', padding: '5px 10px' }}
        >
          دوران -15°
        </button>
        <button 
          onClick={() => setRotation(rotation + 15)}
          style={{ margin: '0 5px', padding: '5px 10px' }}
        >
          دوران +15°
        </button>
        <button 
          onClick={() => {
            setTriangleAngles([0, 120, 240]);
            setRotation(0);
          }}
          style={{ margin: '0 5px', padding: '5px 10px' }}
        >
          إعادة تعيين
        </button>
      </div>
      
      <canvas
        ref={canvasRef}
        style={{
          border: '2px solid #ccc',
          borderRadius: '8px',
          display: 'block',
          margin: '0 auto'
        }}
      />
      
      <div style={{ marginTop: '10px', fontSize: '14px' }}>
        <p>الزوايا الحالية:</p>
        {triangleAngles.map((angle, index) => (
          <span key={index} style={{ margin: '0 10px' }}>
            النقطة {index + 1}: {((angle + rotation) % 360).toFixed(0)}°
          </span>
        ))}
      </div>
      
      {isDragging && (
        <p style={{ color: 'green', fontWeight: 'bold' }}>
          جاري سحب النقطة {draggedPointIndex + 1}...
        </p>
      )}
    </div>
  );
};

export default InteractiveTriangle;
