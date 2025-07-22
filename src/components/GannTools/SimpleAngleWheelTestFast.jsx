import React, { useRef, useEffect, useState } from "react";

const SimpleAngleWheelTestFast = () => {
  const canvasRef = useRef(null);
  const [canvasSize] = useState(600);
  const [angleWheelRotation, setAngleWheelRotation] = useState(0);
  const rotationRef = useRef(0);
  const [isHovering, setIsHovering] = useState(false);

  // Draw function (can be called manually)
  const drawWheel = (rotation) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const center = canvasSize / 2;
    // Background
    ctx.beginPath();
    ctx.arc(center, center, 280, 0, 2 * Math.PI);
    ctx.fillStyle = isHovering ? "rgba(255, 215, 0, 0.2)" : "rgba(255, 215, 0, 0.1)";
    ctx.fill();
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = isHovering ? 3 : 2;
    ctx.stroke();
    // Inner circle
    ctx.beginPath();
    ctx.arc(center, center, 150, 0, 2 * Math.PI);
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    // Rays
    ctx.strokeStyle = "#FF6B35";
    ctx.lineWidth = 2;
    for (let angle = 0; angle < 360; angle += 15) {
      const adjustedAngle = angle + rotation;
      const radian = (adjustedAngle * Math.PI) / 180;
      const x1 = center + 150 * Math.cos(radian);
      const y1 = center + 150 * Math.sin(radian);
      const x2 = center + 280 * Math.cos(radian);
      const y2 = center + 280 * Math.sin(radian);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      // Labels
      const labelRadius = 290;
      const labelX = center + labelRadius * Math.cos(radian);
      const labelY = center + labelRadius * Math.sin(radian);
      ctx.fillStyle = "#FFD700";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${angle}°`, labelX, labelY);
    }
    // Rotation info
    ctx.fillStyle = "#00CED1";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Rotation: ${rotation.toFixed(1)}°`, center, 50);
  };

  // Redraw on state change
  useEffect(() => {
    drawWheel(angleWheelRotation);
  }, [angleWheelRotation, isHovering, canvasSize]);

  // Mouse interaction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let isDragging = false;
    let startAngle = 0;
    let initialRotation = 0;

    const handleMouseDown = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const center = canvasSize / 2;
      const distance = Math.sqrt((x - center) ** 2 + (y - center) ** 2);
      if (distance >= 150 && distance <= 280) {
        isDragging = true;
        startAngle = Math.atan2(y - center, x - center) * (180 / Math.PI);
        initialRotation = rotationRef.current;
        canvas.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
      }
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const center = canvasSize / 2;
      // Hover effect
      if (!isDragging && x >= 0 && y >= 0 && x <= canvasSize && y <= canvasSize) {
        const distance = Math.sqrt((x - center) ** 2 + (y - center) ** 2);
        if (distance >= 150 && distance <= 280) {
          setIsHovering(true);
          canvas.style.cursor = "grab";
        } else {
          setIsHovering(false);
          canvas.style.cursor = "crosshair";
        }
      }
      // Dragging
      if (isDragging) {
        const currentAngle = Math.atan2(y - center, x - center) * (180 / Math.PI);
        const deltaAngle = currentAngle - startAngle;
        const newRotation = (initialRotation + deltaAngle + 360) % 360;
        rotationRef.current = newRotation;
        drawWheel(newRotation); // رسم مباشر بدون setState
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setAngleWheelRotation(rotationRef.current); // تحديث state النهائي
        canvas.style.cursor = "crosshair";
        document.body.style.userSelect = "";
      }
      isDragging = false;
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [canvasSize]);

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
          🧲 Mouse Rotation Test - Angle Wheel (Fast)
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
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none"
          }}
        />
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => { setAngleWheelRotation(0); rotationRef.current = 0; drawWheel(0); }}
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

export default SimpleAngleWheelTestFast;
