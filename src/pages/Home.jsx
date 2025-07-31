import React, { useState, useRef } from "react";
import { MarketDataProvider } from "../components/MarketData/MarketDataProvider";
import GannSquare from "../components/GannTools/GannSquareOfNine";
import GannSquareCustom from "../components/GannTools/GannSquareCustom";
import GannGrid from "../components/GannTools/GannGrid";
import GannFan from "../components/GannTools/GannFan";
import GannBox from "../components/GannTools/GannBox";
import GannSquare144 from "../components/GannTools/GannSquare144_Final";
import GannWheel from "../components/GannTools/GannWheel";
import GannCircle36 from "../components/GannTools/GannCircle36";
import GannCircle360Canvas from "../components/GannTools/GannCircle360Canvas";
import GannCircle360CanvasLifeTrading from "../components/GannTools/GannCircle360CanvasLifeTrading";
//import GannCircle360CanvasFixed from "../components/GannTools/GannCircle360CanvasLifeTrading";
//import GannCircleSVG from "../components/GannTools/GannCircleSVG";

const Home = () => {
  const [activeTool, setActiveTool] = useState("GannSquare144");
  const [activeSection, setActiveSection] = useState("classic"); // "classic" أو "markets"
  const [showFeatureDetails, setShowFeatureDetails] = useState({}); // لتتبع الميزات المعروضة
  const gannRef = useRef();

  // متغيرات التحكم في دائرة جان المالية
  const [selectedMarkets, setSelectedMarkets] = useState([]);
  const [marketDataMode, setMarketDataMode] = useState('realtime');
  const [priceBasedColoring, setPriceBasedColoring] = useState(true);
  const [showMarketOverlay, setShowMarketOverlay] = useState(false);
  const [autoUpdateAnalysis, setAutoUpdateAnalysis] = useState(true);
  const [showTechnicalAnalysis, setShowTechnicalAnalysis] = useState(false);
  const [showMarketSettings, setShowMarketSettings] = useState(false);
  const [gannCircleSettings, setGannCircleSettings] = useState({
    levels: 8,
    rotation: 0,
    divisions: 36,
    startValue: 1,
    language: "ar",
    showDegreeRing: true,
  });

  // دالة لتبديل عرض تفاصيل الميزة
  const toggleFeatureDetails = (featureName) => {
    setShowFeatureDetails(prev => ({
      ...prev,
      [featureName]: !prev[featureName]
    }));
  };

    // قائمة جميع الأسواق المالية المتاحة
  const availableMarkets = {
    crypto: [
      { symbol: 'BTCUSDT', name: 'Bitcoin', price: '$43,250', change: '+2.5%', color: '#f7931a' },
      { symbol: 'ETHUSDT', name: 'Ethereum', price: '$2,680', change: '+1.8%', color: '#627eea' },
      { symbol: 'ADAUSDT', name: 'Cardano', price: '$0.52', change: '+3.2%', color: '#0033ad' },
      { symbol: 'DOGEUSDT', name: 'Dogecoin', price: '$0.085', change: '+5.1%', color: '#c2a633' },
      { symbol: 'XRPUSDT', name: 'Ripple', price: '$0.615', change: '+1.2%', color: '#23292f' },
      { symbol: 'SOLUSDT', name: 'Solana', price: '$102.5', change: '+4.3%', color: '#9945ff' },
    ],
    forex: [
      { symbol: 'EURUSD', name: 'EUR/USD', price: '1.0875', change: '+0.12%', color: '#2196f3' },
      { symbol: 'GBPUSD', name: 'GBP/USD', price: '1.2654', change: '-0.08%', color: '#f44336' },
      { symbol: 'USDJPY', name: 'USD/JPY', price: '148.25', change: '+0.25%', color: '#2196f3' },
      { symbol: 'USDCHF', name: 'USD/CHF', price: '0.8745', change: '+0.15%', color: '#2196f3' },
      { symbol: 'AUDUSD', name: 'AUD/USD', price: '0.6825', change: '-0.05%', color: '#f44336' },
      { symbol: 'USDCAD', name: 'USD/CAD', price: '1.3456', change: '+0.18%', color: '#2196f3' },
    ],
    stocks_us: [
      { symbol: 'AAPL', name: 'Apple Inc', price: '$192.85', change: '+1.5%', color: '#007aff' },
      { symbol: 'GOOGL', name: 'Alphabet', price: '$142.50', change: '+0.8%', color: '#4285f4' },
      { symbol: 'MSFT', name: 'Microsoft', price: '$378.25', change: '+2.1%', color: '#00bcf2' },
      { symbol: 'TSLA', name: 'Tesla', price: '$248.50', change: '+3.2%', color: '#cc0000' },
      { symbol: 'AMZN', name: 'Amazon', price: '$156.75', change: '+1.2%', color: '#ff9900' },
      { symbol: 'NVDA', name: 'NVIDIA', price: '$785.50', change: '+4.5%', color: '#76b900' },
    ],
    stocks_saudi: [
      { symbol: '2222.SR', name: 'أرامكو السعودية', price: '28.50 ر.س', change: '+1.8%', color: '#1976d2' },
      { symbol: '1120.SR', name: 'مصرف الراجحي', price: '85.20 ر.س', change: '+0.5%', color: '#4caf50' },
      { symbol: '2010.SR', name: 'سابك', price: '89.40 ر.س', change: '+2.1%', color: '#ff9800' },
      { symbol: '7010.SR', name: 'الاتصالات السعودية', price: '35.80 ر.س', change: '+1.2%', color: '#9c27b0' },
      { symbol: '4030.SR', name: 'الأهلي التجاري', price: '42.15 ر.س', change: '-0.3%', color: '#f44336' },
      { symbol: '1030.SR', name: 'مصرف الإنماء', price: '52.75 ر.س', change: '+0.8%', color: '#795548' },
    ],
    commodities: [
      { symbol: 'XAUUSD', name: 'الذهب', price: '$2,025.50', change: '+0.8%', color: '#ffd700' },
      { symbol: 'XAGUSD', name: 'الفضة', price: '$24.85', change: '+1.2%', color: '#c0c0c0' },
      { symbol: 'USOIL', name: 'النفط الخام', price: '$78.50', change: '+2.1%', color: '#000000' },
      { symbol: 'UKOIL', name: 'نفط برنت', price: '$82.75', change: '+1.8%', color: '#8b4513' },
      { symbol: 'NATGAS', name: 'الغاز الطبيعي', price: '$2.95', change: '+3.5%', color: '#4169e1' },
      { symbol: 'COPPER', name: 'النحاس', price: '$8,450', change: '+1.5%', color: '#b87333' },
    ],
    indices: [
      { symbol: 'SPX500', name: 'S&P 500', price: '4,785.25', change: '+0.8%', color: '#2196f3' },
      { symbol: 'NAS100', name: 'NASDAQ 100', price: '16,845.50', change: '+1.2%', color: '#4caf50' },
      { symbol: 'DJI30', name: 'Dow Jones', price: '37,525.80', change: '+0.5%', color: '#ff9800' },
      { symbol: 'TASI', name: 'مؤشر تاسي', price: '11,250.75', change: '+1.5%', color: '#1976d2' },
      { symbol: 'UK100', name: 'FTSE 100', price: '7,685.50', change: '+0.3%', color: '#9c27b0' },
      { symbol: 'GER40', name: 'DAX 40', price: '16,950.25', change: '+0.9%', color: '#f44336' },
    ],
  };

  // دوال التحكم بالميزات
  const handleMarketsToggle = () => {
    toggleFeatureDetails('markets');
    setShowMarketOverlay(!showMarketOverlay);
  };

  const handleAnalysisToggle = () => {
    toggleFeatureDetails('analysis');
    setShowTechnicalAnalysis(!showTechnicalAnalysis);
  };

  const handleColoringToggle = () => {
    toggleFeatureDetails('coloring');
    setPriceBasedColoring(!priceBasedColoring);
  };

  const handleDisplayToggle = () => {
    toggleFeatureDetails('display');
    setShowMarketOverlay(!showMarketOverlay);
  };

  const handleSettingsToggle = () => {
    toggleFeatureDetails('settings');
    setShowMarketSettings(!showMarketSettings);
  };

  const handleAutoUpdateToggle = () => {
    toggleFeatureDetails('autoUpdate');
    setAutoUpdateAnalysis(!autoUpdateAnalysis);
  };

  // دالة لإضافة الأسواق
  const addMarket = (marketType, marketSymbol, marketData = null) => {
    const newMarket = {
      type: marketType,
      symbol: marketSymbol,
      name: marketData?.name || marketSymbol,
      price: marketData?.price || 'N/A',
      change: marketData?.change || '0%',
      color: marketData?.color || '#4CAF50',
      addedAt: new Date().toISOString()
    };
    
    // التحقق من عدم وجود السوق مسبقاً
    if (!selectedMarkets.find(m => m.symbol === marketSymbol)) {
      setSelectedMarkets(prev => [...prev, newMarket]);
    }
  };

  // دالة لحذف السوق
  const removeMarket = (symbolToRemove) => {
    setSelectedMarkets(prev => prev.filter(market => market.symbol !== symbolToRemove));
  };

  // تحديث الأداة النشطة عند تبديل القسم
  React.useEffect(() => {
    if (activeSection === "classic") {
      setActiveTool("GannSquare144");
    } else if (activeSection === "markets") {
      setActiveTool("GannCircle360CanvasWithMarketData");
    }
  }, [activeSection]);

  // إزالة هوامش المتصفح الافتراضية
  React.useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "auto"; // تمكين التمرير
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    
    // تنظيف عند إلغاء التحميل
    return () => {
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.overflow = "";
      document.documentElement.style.margin = "";
      document.documentElement.style.padding = "";
    };
  }, []);

  // 🟡 تهيئة الإعدادات والمقياس هنا
  const defaultSettings = {
    levels: 8,
    rotation: 0,
    divisions: 36,
    startValue: 1,
    language: "ar",
    showDegreeRing: true,
  };
  const [settings, setSettings] = useState(defaultSettings);
  const [scale, setScale] = useState(1);
  const [showZodiacRing, setShowZodiacRing] = useState(true);

  const renderControls = () => {
    // عناصر تحكم خاصة بقسم الأسواق المالية

    
    // لا توجد عناصر تحكم للأدوات الكلاسيكية
    return null;
  };



  return (
    <MarketDataProvider>
      <div
        style={{
          width: "100vw",
          minHeight: "100vh", // تغيير من height إلى minHeight
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)",
          overflow: "visible", // السماح بظهور المحتوى خارج حدود الصفحة
          direction: "ltr",
          margin: 0,
        padding: 0,
        boxSizing: "border-box",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        position: "relative", // لوضع الدائرة بشكل مطلق
      }}
    >
      {/* العنوان الرئيسي */}
      <header style={{
        textAlign: "center",
        padding: "15px 0 10px 0", // تقليل من 20px 0 15px 0
        background: "rgba(0, 0, 0, 0.3)",
        borderBottom: "2px solid rgba(255, 215, 0, 0.3)",
      }}>
        <h1 style={{ 
          color: "#FFD700", 
          fontSize: "2.5rem",
          margin: 0,
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
          fontWeight: "bold",
          letterSpacing: "2px",
        }}>
          ⭐ كوكبة الأرقام السحرية ⭐
        </h1>
        <p style={{
          color: "#B8B8B8",
          fontSize: "1rem",
          margin: "5px 0 0 0",
          fontStyle: "italic",
        }}>
          أدوات جان المتقدمة والتحليل المالي الحديث
        </p>
      </header>

      {/* شريط التبديل بين الأقسام */}
      <nav style={{
        display: "flex",
        justifyContent: "center",
        padding: "10px 0",
        background: "rgba(0, 0, 0, 0.2)",
        borderBottom: "1px solid rgba(255, 215, 0, 0.2)",
      }}>
        <div style={{
          display: "flex",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "25px",
          padding: "5px",
          border: "1px solid rgba(255, 215, 0, 0.3)",
        }}>
          <button
            onClick={() => setActiveSection("classic")}
            style={{
              padding: "12px 30px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              transition: "all 0.3s ease",
              background: activeSection === "classic" 
                ? "linear-gradient(45deg, #FFD700, #FFA500)" 
                : "transparent",
              color: activeSection === "classic" ? "#000" : "#FFD700",
              marginRight: "5px",
            }}
          >
            🏛️ الأدوات الكلاسيكية
          </button>
          <button
            onClick={() => setActiveSection("markets")}
            style={{
              padding: "12px 30px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              transition: "all 0.3s ease",
              background: activeSection === "markets" 
                ? "linear-gradient(45deg, #FFD700, #FFA500)" 
                : "transparent",
              color: activeSection === "markets" ? "#000" : "#FFD700",
            }}
          >
            📊 الأسواق المالية
          </button>
        </div>
      </nav>

      {/* محتوى الأقسام */}
      {activeSection === "classic" && (
        <>
          {/* قائمة الأدوات الكلاسيكية */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            margin: "15px 0", // تقليل من 20px 0
            flexWrap: "wrap",
            padding: "0 15px", // تقليل من 0 20px
          }}>
            {[
              { key: "GannSquare144", label: "مربع 144", icon: "🔢" },
              { key: "GannSquareCustom", label: "مربع مخصص", icon: "⚙️" },
              { key: "GannSquare", label: "مربع التسعة", icon: "⭕" },
              { key: "GannCircle360Canvas", label: " ساعة كوكبة تاسي للتحليل", icon: "🌀" },
            ].map((tool) => (
              <button
                key={tool.key}
                onClick={() => setActiveTool(tool.key)}
                style={{
                  backgroundColor: activeTool === tool.key 
                    ? "linear-gradient(45deg, #FFD700, #FFA500)" 
                    : "rgba(255, 255, 255, 0.1)",
                  color: activeTool === tool.key ? "#000" : "#FFD700",
                  padding: "12px 20px",
                  borderRadius: "12px",
                  border: activeTool === tool.key 
                    ? "2px solid #FFD700" 
                    : "1px solid rgba(255, 215, 0, 0.3)",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                  transition: "all 0.3s ease",
                  boxShadow: activeTool === tool.key 
                    ? "0 4px 15px rgba(255, 215, 0, 0.4)" 
                    : "0 2px 8px rgba(0, 0, 0, 0.3)",
                  minWidth: "140px",
                }}
                onMouseEnter={(e) => {
                  if (activeTool !== tool.key) {
                    e.target.style.backgroundColor = "rgba(255, 215, 0, 0.2)";
                    e.target.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTool !== tool.key) {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                    e.target.style.transform = "translateY(0)";
                  }
                }}
              >
                <span style={{ marginRight: "8px" }}>{tool.icon}</span>
                {tool.label}
              </button>
            ))}
          </div>

          {/* منطقة عرض الأدوات الكلاسيكية */}
          <div style={{
            width: "100%",
            minHeight: "800px", // ارتفاع أدنى ثابت
            display: "flex",
            justifyContent: "center",
            alignItems: "center", 
            overflow: "visible",
            padding: "20px", // هامش للتنفس
            background: "transparent",
            border: "none",
            boxSizing: "border-box",
            position: "relative", 
          }}>
            {activeTool === "GannSquare144" && <GannSquare144 />}
            {activeTool === "GannSquareCustom" && <GannSquareCustom />}
            {activeTool === "GannSquare" && <GannSquare />}
            {activeTool === "GannCircle360Canvas" && (
              <GannCircle360Canvas 
                mode="tasi-analysis"
                showMarketData={true}
                enableTrading={true}
                showTechnicalIndicators={true}
                showGannAngles={true}
                showTimePatterns={true}
                focusOnTASI={true}
                showTASIMetrics={true}
              />
            )}
          </div>

          {/* عرض عناصر التحكم للأدوات الكلاسيكية */}
          {renderControls()}
        </>
      )}

      {/* قسم الأسواق المالية */}
      {activeSection === "markets" && (
        <>
          {/* أداة دائرة جان 360 + الأسواق المالية */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            margin: "15px 0",
            flexWrap: "wrap",
            padding: "0 15px",
          }}>
            <button
              onClick={() => setActiveTool("GannCircle360CanvasWithMarketData")}
              style={{
                backgroundColor: activeTool === "GannCircle360CanvasWithMarketData" 
                  ? "linear-gradient(45deg, #FFD700, #FFA500)" 
                  : "rgba(255, 255, 255, 0.1)",
                color: activeTool === "GannCircle360CanvasWithMarketData" ? "#000" : "#FFD700",
                padding: "12px 20px",
                borderRadius: "12px",
                border: activeTool === "GannCircle360CanvasWithMarketData" 
                  ? "2px solid #FFD700" 
                  : "1px solid rgba(255, 215, 0, 0.3)",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                transition: "all 0.3s ease",
                boxShadow: activeTool === "GannCircle360CanvasWithMarketData" 
                  ? "0 4px 15px rgba(255, 215, 0, 0.4)" 
                  : "0 2px 8px rgba(0, 0, 0, 0.3)",
                minWidth: "250px",
              }}
            >
              <span style={{ marginRight: "8px" }}>📊</span>
              دائرة جان 360 + الأسواق المالية
            </button>
          </div>

          {/* ملاحظة إرشادية */}
          <div style={{
            marginTop: "20px",
            padding: "12px 20px",
            background: "rgba(255, 215, 0, 0.1)",
            borderRadius: "8px",
            border: "1px solid rgba(255, 215, 0, 0.3)",
            textAlign: "center",
          }}>
            <p style={{
              color: "#FFD700",
              fontSize: "14px",
              margin: "0",
              fontWeight: "bold",
            }}>
              💡 انقر على الزر أعلاه لبدء استخدام دائرة جان 360 مع جميع الميزات المالية المتقدمة
            </p>
          </div>

          {/* منطقة عرض أداة الأسواق المالية */}
          <div style={{
            width: "100%",
            minHeight: "800px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center", 
            overflow: "visible",
            padding: "20px",
            background: "transparent",
            border: "none",
            boxSizing: "border-box",
            position: "relative", 
          }}>
            {activeTool === "GannCircle360CanvasWithMarketData" && (
              <GannCircle360CanvasLifeTrading 
                mode="global-markets"
                showRealTimeData={true}
                enableAllMarkets={true}
                // تمرير جميع الحالات من الصفحة الرئيسية
                selectedMarkets={selectedMarkets}
                marketDataMode={marketDataMode}
                priceBasedColoring={priceBasedColoring}
                showMarketOverlay={showMarketOverlay}
                autoUpdateAnalysis={autoUpdateAnalysis}
                showTechnicalAnalysis={showTechnicalAnalysis}
                showMarketSettings={showMarketSettings}
                gannCircleSettings={gannCircleSettings}
                // دوال التحكم
                onMarketsChange={setSelectedMarkets}
                onSettingsChange={setGannCircleSettings}
              />
            )}
          </div>

          {/* عرض عناصر التحكم للأسواق المالية */}
          {renderControls()}
        </>
      )}
      </div>
    </MarketDataProvider>
  );
};

export default Home;