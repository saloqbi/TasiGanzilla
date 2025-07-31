import React, { useState, useRef, useEffect } from 'react';

const GannCircle360Simple = () => {
  // الحالة الأساسية
  const [showSettings, setShowSettings] = useState(true);
  const [divisions, setDivisions] = useState(24);
  const [mode, setMode] = useState('degrees');
  const [selectedShape, setSelectedShape] = useState('circle');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const canvasRef = useRef(null);
  const canvasSize = 600;

  // تحديث الوقت
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // رسم الدائرة
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const center = canvasSize / 2;
    const radius = 250;
    
    // مسح الكانفاس
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // رسم الخلفية
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#0f0f23');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    // رسم الدائرة الخارجية
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // رسم التقسيمات
    const angleStep = 360 / divisions;
    for (let i = 0; i < divisions; i++) {
      const angle = (i * angleStep) * (Math.PI / 180);
      const x1 = center + Math.cos(angle) * (radius - 20);
      const y1 = center + Math.sin(angle) * (radius - 20);
      const x2 = center + Math.cos(angle) * radius;
      const y2 = center + Math.sin(angle) * radius;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      
      // رسم الأرقام
      ctx.fillStyle = '#FFD700';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      const textX = center + Math.cos(angle) * (radius + 15);
      const textY = center + Math.sin(angle) * (radius + 15);
      ctx.fillText((i * angleStep).toString(), textX, textY);
    }
    
    // رسم النقطة المركزية
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(center, center, 5, 0, 2 * Math.PI);
    ctx.fill();
    
  }, [divisions, mode, selectedShape]);

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
      fontFamily: "'Times New Roman', serif",
      overflow: "hidden"
    }}>
      {/* 🏛️ الهيدر الكلاسيكي */}
      <header style={{
        background: "linear-gradient(90deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)",
        color: "#FFD700",
        padding: "15px 30px",
        borderBottom: "3px solid #FFD700",
        boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
        zIndex: 1000
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          maxWidth: "1400px",
          margin: "0 auto"
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: "28px", 
              fontWeight: "bold",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)"
            }}>
              🔮 دائرة جان المالية 360°
            </h1>
            <p style={{ 
              margin: "5px 0 0 0", 
              fontSize: "14px", 
              opacity: 0.8 
            }}>
              أداة التحليل الفني والتنبؤ المالي المتقدمة
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "18px", fontWeight: "bold" }}>
              {currentTime.toLocaleTimeString('ar-SA')}
            </div>
            <div style={{ fontSize: "14px", opacity: 0.8 }}>
              {currentTime.toLocaleDateString('ar-SA')}
            </div>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <div style={{
        flex: 1,
        display: "flex",
        position: "relative",
        overflow: "hidden",
        maxWidth: "1400px",
        margin: "0 auto",
        width: "100%"
      }}>
        
        {/* 📋 الشريط الجانبي الكلاسيكي */}
        <aside style={{
          width: showSettings ? "320px" : "60px",
          background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
          borderRight: "2px solid #FFD700",
          transition: "all 0.3s ease",
          overflow: "hidden",
          boxShadow: "4px 0 15px rgba(0,0,0,0.2)",
          zIndex: 999
        }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              width: "100%",
              background: "#FFD700",
              color: "#000",
              border: "none",
              padding: "15px",
              cursor: "pointer",
              fontSize: "18px",
              fontWeight: "bold",
              transition: "all 0.3s ease",
              borderBottom: "2px solid #FFA500"
            }}
          >
            {showSettings ? "⚙️ إغلاق الإعدادات" : "⚙️"}
          </button>
          
          {showSettings && (
            <div style={{
              padding: "20px",
              height: "calc(100vh - 140px)",
              overflowY: "auto",
              color: "#FFD700"
            }}>
              {/* قسم الأسواق المالية */}
              <div style={{
                background: "rgba(255, 215, 0, 0.05)",
                border: "1px solid #FFD700",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "20px"
              }}>
                <h3 style={{ 
                  color: "#FFD700", 
                  marginBottom: "15px", 
                  fontSize: "16px",
                  borderBottom: "1px solid rgba(255, 215, 0, 0.3)",
                  paddingBottom: "8px"
                }}>
                  📊 الأسواق المالية
                </h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button style={{
                    background: "linear-gradient(45deg, #4CAF50, #45a049)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "14px"
                  }}>
                    📈 تفعيل وضع التداول
                  </button>
                  
                  <button style={{
                    background: "linear-gradient(45deg, #2196F3, #1976D2)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "14px"
                  }}>
                    ⚙️ إعدادات السوق
                  </button>
                </div>
              </div>
              
              {/* الإعدادات الأساسية */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ 
                    marginBottom: "8px", 
                    display: "block", 
                    fontSize: "14px",
                    fontWeight: "bold"
                  }}>
                    📐 عدد القطاعات
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={360}
                    value={divisions}
                    onChange={(e) => setDivisions(parseInt(e.target.value) || 24)}
                    style={{
                      padding: "10px",
                      backgroundColor: "#2a2a3e",
                      color: "#FFD700",
                      border: "2px solid #FFD700",
                      borderRadius: "8px",
                      width: "100%",
                      fontSize: "14px"
                    }}
                  />
                  <small style={{ 
                    fontSize: "12px", 
                    opacity: 0.7, 
                    marginTop: "4px",
                    display: "block"
                  }}>
                    من 4 إلى 360 قطاع
                  </small>
                </div>
                
                <div>
                  <label style={{ 
                    marginBottom: "8px", 
                    display: "block", 
                    fontSize: "14px",
                    fontWeight: "bold"
                  }}>
                    🎯 نمط التحليل
                  </label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    style={{
                      padding: "10px",
                      backgroundColor: "#2a2a3e",
                      color: "#FFD700",
                      border: "2px solid #FFD700",
                      borderRadius: "8px",
                      width: "100%",
                      fontSize: "14px"
                    }}
                  >
                    <option value="degrees">🔄 درجات</option>
                    <option value="gann">📊 جان</option>
                    <option value="fibonacci">🌀 فيبوناتشي</option>
                    <option value="astro">⭐ فلكي</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ 
                    marginBottom: "8px", 
                    display: "block", 
                    fontSize: "14px",
                    fontWeight: "bold"
                  }}>
                    🎨 شكل الدائرة
                  </label>
                  <select
                    value={selectedShape}
                    onChange={(e) => setSelectedShape(e.target.value)}
                    style={{
                      padding: "10px",
                      backgroundColor: "#2a2a3e",
                      color: "#FFD700",
                      border: "2px solid #FFD700",
                      borderRadius: "8px",
                      width: "100%",
                      fontSize: "14px"
                    }}
                  >
                    <option value="circle">⭕ دائرة كلاسيكية</option>
                    <option value="triangle">🔺 مثلث</option>
                    <option value="square">⬛ مربع</option>
                    <option value="hexagon">🔸 سداسي</option>
                    <option value="star">⭐ نجمة</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* منطقة الكانفاس الرئيسية */}
        <main style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          background: "radial-gradient(circle at center, rgba(26, 26, 46, 0.3) 0%, rgba(15, 15, 35, 0.8) 100%)"
        }}>
          <div style={{
            position: "relative",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(255, 215, 0, 0.3)",
            border: "3px solid rgba(255, 215, 0, 0.8)",
            background: "linear-gradient(45deg, rgba(26, 26, 46, 0.9), rgba(22, 33, 62, 0.9))"
          }}>
            <canvas
              ref={canvasRef}
              width={canvasSize}
              height={canvasSize}
              style={{
                display: "block",
                background: "radial-gradient(circle at center, #1a1a2e 0%, #0f0f23 100%)"
              }}
            />
            
            {/* مؤشر معلومات */}
            <div style={{
              position: "absolute",
              top: "15px",
              right: "15px",
              background: "rgba(0, 0, 0, 0.8)",
              color: "#FFD700",
              padding: "10px",
              borderRadius: "8px",
              fontSize: "12px",
              border: "1px solid #FFD700"
            }}>
              <div>القطاعات: {divisions}</div>
              <div>النمط: {mode}</div>
              <div>الشكل: {selectedShape}</div>
            </div>
          </div>
        </main>
      </div>

      {/* 🏛️ التذييل الكلاسيكي */}
      <footer style={{
        background: "linear-gradient(90deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
        borderTop: "2px solid #FFD700",
        padding: "15px 30px",
        color: "#FFD700",
        boxShadow: "0 -5px 15px rgba(0,0,0,0.3)"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          maxWidth: "1400px",
          margin: "0 auto",
          fontSize: "14px"
        }}>
          <div>
            <span style={{ fontWeight: "bold" }}>🔮 دائرة جان المالية 360°</span>
            <span style={{ marginLeft: "20px", opacity: 0.8 }}>
              أداة التحليل الفني المتقدمة
            </span>
          </div>
          <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
            <span>📊 التحليل المالي</span>
            <span>⏰ {currentTime.toLocaleTimeString('ar-SA')}</span>
            <span>📈 التداول الذكي</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GannCircle360Simple;
