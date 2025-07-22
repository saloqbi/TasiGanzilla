import React, { useRef, useEffect, useState } from "react";

const SimpleAngleWheelTest = () => {
  const canvasRef = useRef(null);
  const [canvasSize] = useState(600);
  const [angleWheelRotation, setAngleWheelRotation] = useState(0);
  const [rayColor] = useState("#FF6B35");
  const [rayWidth] = useState(2); // زيادة سماكة الخط
  const [angleStep] = useState(15);
  const [isHovering, setIsHovering] = useState(false);

  // Mouse interaction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDragging = false;
    let startAngle = 0;
    let initialRotation = 0;

    const handleMouseDown = (e) => {
      e.preventDefault(); // منع السلوك الافتراضي
      console.log("🖱️ Mouse down event triggered");
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const center = canvasSize / 2;
      
      // Check if click is on angle wheel area
      const distance = Math.sqrt((x - center) ** 2 + (y - center) ** 2);
      const wheelInner = 150;
      const wheelOuter = 280;
      
      console.log(`📍 Distance: ${distance.toFixed(1)} (range: ${wheelInner}-${wheelOuter})`);
      
      if (distance >= wheelInner && distance <= wheelOuter) {
        isDragging = true;
        startAngle = Math.atan2(y - center, x - center) * (180 / Math.PI);
        initialRotation = angleWheelRotation;
        console.log("✅ Starting rotation drag");
        canvas.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
      } else {
        console.log("❌ Click outside wheel area");
      }
    };

    const handleMouseMove = (e) => {
      e.preventDefault(); // منع السلوك الافتراضي
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const center = canvasSize / 2;
      
      // Check for hover effect only when not dragging and mouse is over canvas
      if (!isDragging && x >= 0 && y >= 0 && x <= canvasSize && y <= canvasSize) {
        const distance = Math.sqrt((x - center) ** 2 + (y - center) ** 2);
        const wheelInner = 150;
        const wheelOuter = 280;
        
        if (distance >= wheelInner && distance <= wheelOuter) {
          setIsHovering(true);
          canvas.style.cursor = "grab";
        } else {
          setIsHovering(false);
          canvas.style.cursor = "crosshair";
        }
      }
      
      if (!isDragging) return;
      
      // Update rotation during drag - removed throttling for smoother movement
      const currentAngle = Math.atan2(y - center, x - center) * (180 / Math.PI);
      const deltaAngle = currentAngle - startAngle;
      const newRotation = (initialRotation + deltaAngle + 360) % 360;
      
      setAngleWheelRotation(newRotation);
    };

    const handleMouseUp = (e) => {
      e.preventDefault(); // منع السلوك الافتراضي
      if (isDragging) {
        console.log("✅ Ending rotation drag");
        canvas.style.cursor = "crosshair";
        document.body.style.userSelect = ""; // إعادة تفعيل تحديد النص
      }
      isDragging = false;
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove); // Changed back to document for global tracking
    document.addEventListener("mouseup", handleMouseUp); // Changed to document

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [angleWheelRotation, canvasSize]);

  // Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const center = canvasSize / 2;
    
    // Draw background circle - made larger to match click area
    ctx.beginPath();
    ctx.arc(center, center, 280, 0, 2 * Math.PI);
    ctx.fillStyle = isHovering ? "rgba(255, 215, 0, 0.2)" : "rgba(255, 215, 0, 0.1)";
    ctx.fill();
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = isHovering ? 3 : 2;
    ctx.stroke();

    // Draw inner circle to show the clickable area
    ctx.beginPath();
    ctx.arc(center, center, 150, 0, 2 * Math.PI);
    ctx.fillStyle = "transparent";
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // Draw angle rays
    ctx.strokeStyle = rayColor;
    ctx.lineWidth = rayWidth;

    for (let angle = 0; angle < 360; angle += angleStep) {
      const adjustedAngle = angle + angleWheelRotation;
      const radian = (adjustedAngle * Math.PI) / 180;
      
      const innerRadius = 150; // Match click area
      const outerRadius = 280; // Match click area
      
      const x1 = center + innerRadius * Math.cos(radian);
      const y1 = center + innerRadius * Math.sin(radian);
      const x2 = center + outerRadius * Math.cos(radian);
      const y2 = center + outerRadius * Math.sin(radian);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Draw angle labels
      const labelRadius = 290; // Outside the wheel
      const labelX = center + labelRadius * Math.cos(radian);
      const labelY = center + labelRadius * Math.sin(radian);
      
      ctx.fillStyle = "#FFD700";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${angle}°`, labelX, labelY);
    }

    // Draw rotation info
    ctx.fillStyle = "#00CED1";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Rotation: ${angleWheelRotation.toFixed(1)}°`, center, 50);

  }, [canvasSize, angleWheelRotation, rayColor, rayWidth, angleStep, isHovering]);

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#111"
    }}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ color: "#FFD700", marginBottom: "20px" }}>
          🧲 Mouse Rotation Test - Angle Wheel
        </h2>
        <p style={{ color: "#00CED1", marginBottom: "20px" }}>
          Click and drag anywhere on the yellow ring to rotate<br/>
          The ring area is between the inner and outer yellow circles
        </p>
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          style={{
            border: "2px solid #FFD700",
            background: "transparent",
            cursor: "crosshair",
            userSelect: "none", // منع تحديد النص
            WebkitUserSelect: "none", // Safari
            MozUserSelect: "none", // Firefox
            msUserSelect: "none" // IE
          }}
        />
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => setAngleWheelRotation(0)}
            style={{
              background: "#FFD700",
              color: "#000",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Reset Rotation
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleAngleWheelTest;
