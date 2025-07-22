import React, { useRef, useEffect, useState } from "react";

const SimpleTriangleTest = () => {
  const canvasRef = useRef(null);
  const [triangleRotation, setTriangleRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartAngle, setDragStartAngle] = useState(0);
  const [initialRotation, setInitialRotation] = useState(0);
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null);

  const canvasSize = 800;
  const center = canvasSize / 2;
  const radius = 300;
  const customAngles = [0, 120, 240];

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const getAngleDeg = (x, y) => {
    return Math.atan2(y - center, x - center) * (180 / Math.PI);
  };

  const getDistance = (x1, y1, x2, y2) => {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    // إعداد الكانفاس
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    // تنظيف الكانفاس
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // خلفية بيضاء
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // حساب نقاط المثلث
    const trianglePoints = customAngles.map((deg) => {
      const rad = ((deg + triangleRotation - 90) * Math.PI) / 180;
      return {
        x: center + radius * Math.cos(rad),
        y: center + radius * Math.sin(rad),
      };
    });

    // رسم المثلث
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(trianglePoints[0].x, trianglePoints[0].y);
    trianglePoints.forEach((p, i) => {
      if (i > 0) ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.strokeStyle = "darkgreen";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // رسم النقاط الحمراء للتحكم
    trianglePoints.forEach((p, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = hoveredPointIndex === i ? "orange" : "red";
      ctx.fill();
      ctx.strokeStyle = "darkred";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    });

    // رسم خطوط من المركز إلى النقاط
    trianglePoints.forEach((point) => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = "gray";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.restore();
    });

    // رسم نقطة المركز
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.restore();

    // إضافة event listeners
    const onMouseDown = (e) => {
      const { x, y } = getMousePos(e);
      
      const trianglePoints = customAngles.map((deg) => {
        const rad = ((deg + triangleRotation - 90) * Math.PI) / 180;
        return {
          x: center + radius * Math.cos(rad),
          y: center + radius * Math.sin(rad),
        };
      });

      trianglePoints.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        console.log(`Point ${idx}: distance = ${d.toFixed(1)}`);
        if (d < 20) {
          setIsDragging(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(triangleRotation);
          console.log("🔺 Started dragging triangle");
        }
      });
    };

    const onMouseMove = (e) => {
      const { x, y } = getMousePos(e);
      
      console.log(`🖱️ Mouse at: (${x.toFixed(1)}, ${y.toFixed(1)})`);
      
      if (isDragging) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setTriangleRotation((initialRotation + delta + 360) % 360);
        console.log(`🔄 Rotating to: ${((initialRotation + delta + 360) % 360).toFixed(1)}°`);
      }

      // تحديد النقطة المُؤشر عليها
      const trianglePoints = customAngles.map((deg) => {
        const rad = ((deg + triangleRotation - 90) * Math.PI) / 180;
        return {
          x: center + radius * Math.cos(rad),
          y: center + radius * Math.sin(rad),
        };
      });

      let foundPoint = null;
      trianglePoints.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 20) {
          foundPoint = idx;
        }
      });
      setHoveredPointIndex(foundPoint);
    };

    const onMouseUp = () => {
      if (isDragging) {
        console.log("🔺 Stopped dragging triangle");
      }
      setIsDragging(false);
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
    };
  }, [triangleRotation, isDragging, dragStartAngle, initialRotation, hoveredPointIndex]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>اختبار المثلث البسيط</h2>
      <div style={{ marginBottom: "10px" }}>
        <label>تدوير المثلث: {triangleRotation.toFixed(1)}°</label>
        <input
          type="range"
          min="0"
          max="360"
          value={triangleRotation}
          onChange={(e) => setTriangleRotation(parseFloat(e.target.value))}
          style={{ width: "300px", margin: "0 10px" }}
        />
      </div>
      <canvas
        ref={canvasRef}
        style={{
          border: "2px solid #ccc",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      />
      <div style={{ marginTop: "10px", color: "#666" }}>
        <p>• انقر واسحب النقاط الحمراء لتدوير المثلث</p>
        <p>• حالة السحب: {isDragging ? "جاري السحب" : "متوقف"}</p>
        <p>• النقطة المؤشر عليها: {hoveredPointIndex !== null ? hoveredPointIndex : "لا يوجد"}</p>
      </div>
    </div>
  );
};

export default SimpleTriangleTest;
