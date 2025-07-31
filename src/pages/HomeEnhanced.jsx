import React, { useState, useRef } from "react";
import { MarketDataProvider } from "../components/MarketData/MarketDataProvider";
import TradingControlPanel from "../components/MarketData/TradingControlPanel";
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
import JapaneseCandlestickAnalysis from "../components/GannTools/JapaneseCandlestickAnalysis";
import MultiTimeframeConsensus from "../components/GannTools/MultiTimeframeConsensus";

const HomeEnhanced = () => {
  const [activeTool, setActiveTool] = useState("GannSquare144");
  const [activeSection, setActiveSection] = useState("classic"); // "classic" أو "markets"
  const [showFeatureDetails, setShowFeatureDetails] = useState({});
  const [showSidebar, setShowSidebar] = useState(true);
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

  // دوال التحكم بالميزات
  const handleMarketsToggle = () => {
    setActiveSection(activeSection === "markets" ? "classic" : "markets");
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // خريطة الأدوات
  const toolsMap = {
    GannSquare: GannSquare,
    GannSquareCustom: GannSquareCustom,
    GannGrid: GannGrid,
    GannFan: GannFan,
    GannBox: GannBox,
    GannSquare144: GannSquare144,
    GannWheel: GannWheel,
    GannCircle36: GannCircle36,
    GannCircle360Canvas: GannCircle360Canvas,
    GannCircle360CanvasLifeTrading: GannCircle360CanvasLifeTrading,
    JapaneseCandlestickAnalysis: JapaneseCandlestickAnalysis
  };

  const tools = [
    {
      id: "GannSquare144",
      nameAr: "مربع جان 144",
      nameEn: "Gann Square 144",
      category: "classic",
      icon: "⭐",
      description: "مربع جان الشهير للتحليل الرقمي المتقدم",
      features: ["144 خانة", "حسابات دقيقة", "تحليل متقدم"]
    },
    {
      id: "GannCircle360CanvasLifeTrading",
      nameAr: "دائرة جان 360° - التداول المباشر",
      nameEn: "Gann Circle 360° - Live Trading",
      category: "markets",
      icon: "🎯",
      description: "دائرة جان 360 درجة مع بيانات الأسواق المباشرة",
      features: ["بيانات مباشرة", "تحليل فني", "تحديث لحظي", "معايير عالمية"]
    },
    {
      id: "JapaneseCandlestickAnalysis",
      nameAr: "تحليل الشموع اليابانية المتقدم",
      nameEn: "Advanced Japanese Candlestick Analysis",
      category: "markets",
      icon: "🕯️",
      description: "تحليل متقدم للشموع اليابانية مع أنماط الانعكاس والاستمرار",
      features: ["أنماط الشموع", "تكامل جان", "تحليل الأنماط", "إشارات دقيقة"]
    },
    {
      id: "GannSquare",
      nameAr: "مربع جان الأساسي",
      nameEn: "Basic Gann Square",
      category: "classic",
      icon: "📐",
      description: "المربع الأساسي لتعلم مبادئ جان",
      features: ["سهل الاستخدام", "تعليمي", "أساسي"]
    },
    {
      id: "GannWheel",
      nameAr: "عجلة جان",
      nameEn: "Gann Wheel",
      category: "classic",
      icon: "⚙️",
      description: "العجلة الدوارة للتحليل الزمني",
      features: ["دوران تفاعلي", "تحليل زمني", "دقيق"]
    },
    {
      id: "GannCircle360Canvas",
      nameAr: "دائرة جان 360°",
      nameEn: "Gann Circle 360°",
      category: "classic",
      icon: "🔄",
      description: "الدائرة الكاملة للتحليل الشامل",
      features: ["360 درجة", "تحليل شامل", "دقة عالية"]
    }
  ];

  const getFilteredTools = () => {
    return tools.filter(tool => tool.category === activeSection);
  };

  const renderToolComponent = () => {
    const ToolComponent = toolsMap[activeTool];
    if (!ToolComponent) return <div>أداة غير متاحة</div>;

    const commonProps = {
      ref: gannRef,
      settings: gannCircleSettings,
      onSettingsChange: setGannCircleSettings,
      selectedMarkets,
      marketDataMode,
      priceBasedColoring,
      showMarketOverlay,
      autoUpdateAnalysis,
      showTechnicalAnalysis
    };

    return <ToolComponent {...commonProps} />;
  };

  // الأنماط
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#fff',
      fontFamily: 'Arial, sans-serif'
    },
    
    header: {
      background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
      padding: '20px',
      textAlign: 'center',
      color: '#000',
      boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)'
    },
    
    headerTitle: {
      fontSize: '28px',
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    
    headerSubtitle: {
      fontSize: '14px',
      opacity: 0.8
    },
    
    mainLayout: {
      display: 'flex',
      minHeight: 'calc(100vh - 100px)'
    },
    
    sidebar: {
      width: showSidebar ? '400px' : '0px',
      background: 'rgba(0, 0, 0, 0.3)',
      borderLeft: '1px solid #333',
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      backdropFilter: 'blur(10px)'
    },
    
    sidebarToggle: {
      position: 'fixed',
      top: '50%',
      right: showSidebar ? '400px' : '0px',
      transform: 'translateY(-50%)',
      background: '#FFD700',
      color: '#000',
      border: 'none',
      borderRadius: '10px 0 0 10px',
      padding: '15px 8px',
      cursor: 'pointer',
      zIndex: 1000,
      transition: 'all 0.3s ease',
      fontSize: '16px',
      fontWeight: 'bold'
    },
    
    content: {
      flex: 1,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    
    toolSelector: {
      background: 'rgba(0, 0, 0, 0.4)',
      borderRadius: '15px',
      padding: '20px',
      border: '1px solid #333',
      backdropFilter: 'blur(10px)'
    },
    
    sectionTabs: {
      display: 'flex',
      marginBottom: '20px',
      background: '#1a1a1a',
      borderRadius: '10px',
      padding: '5px'
    },
    
    tab: {
      flex: 1,
      padding: '12px 20px',
      textAlign: 'center',
      cursor: 'pointer',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      fontSize: '14px',
      fontWeight: 'bold',
      userSelect: 'none'
    },
    
    activeTab: {
      background: '#FFD700',
      color: '#000',
      boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)'
    },
    
    inactiveTab: {
      background: 'transparent',
      color: '#ccc'
    },
    
    toolsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '15px'
    },
    
    toolCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '15px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(5px)'
    },
    
    activeToolCard: {
      border: '2px solid #FFD700',
      background: 'rgba(255, 215, 0, 0.1)',
      boxShadow: '0 8px 25px rgba(255, 215, 0, 0.3)'
    },
    
    toolIcon: {
      fontSize: '24px',
      marginBottom: '10px'
    },
    
    toolName: {
      color: '#FFD700',
      fontSize: '16px',
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    
    toolDescription: {
      color: '#ccc',
      fontSize: '12px',
      marginBottom: '10px',
      lineHeight: 1.4
    },
    
    toolFeatures: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px'
    },
    
    featureBadge: {
      background: '#333',
      color: '#4CAF50',
      padding: '2px 6px',
      borderRadius: '8px',
      fontSize: '10px',
      border: '1px solid #4CAF50'
    },
    
    toolComponent: {
      background: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '15px',
      padding: '20px',
      border: '1px solid #333',
      backdropFilter: 'blur(10px)',
      minHeight: '600px'
    },
    
    footer: {
      background: 'rgba(0, 0, 0, 0.6)',
      padding: '15px',
      textAlign: 'center',
      borderTop: '1px solid #333',
      backdropFilter: 'blur(10px)',
      fontSize: '12px',
      color: '#999'
    },
    
    statusIndicator: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      margin: '0 10px',
      padding: '4px 8px',
      background: 'rgba(76, 175, 80, 0.2)',
      borderRadius: '10px',
      border: '1px solid #4CAF50',
      fontSize: '11px'
    },
    
    pulse: {
      width: '6px',
      height: '6px',
      background: '#4CAF50',
      borderRadius: '50%',
      animation: 'pulse 2s infinite'
    }
  };

  return (
    <MarketDataProvider>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>
            🎯 كوكبة الأرقام السحرية - الإصدار المحسن
          </h1>
          <p style={styles.headerSubtitle}>
            أدوات جان المتقدمة مع لوحة التحكم الشاملة في التحليل الفني
          </p>
        </div>

        {/* Main Layout */}
        <div style={styles.mainLayout}>
          {/* Content Area */}
          <div style={styles.content}>
            {/* Tool Selector */}
            <div style={styles.toolSelector}>
              <h3 style={{ color: '#FFD700', marginBottom: '15px', fontSize: '18px' }}>
                🛠️ اختيار الأدوات
              </h3>
              
              {/* Section Tabs */}
              <div style={styles.sectionTabs}>
                <div
                  style={{
                    ...styles.tab,
                    ...(activeSection === 'classic' ? styles.activeTab : styles.inactiveTab)
                  }}
                  onClick={() => setActiveSection('classic')}
                >
                  📐 الأدوات التقليدية
                </div>
                <div
                  style={{
                    ...styles.tab,
                    ...(activeSection === 'markets' ? styles.activeTab : styles.inactiveTab)
                  }}
                  onClick={() => setActiveSection('markets')}
                >
                  📊 التداول المباشر
                </div>
              </div>

              {/* Tools Grid */}
              <div style={styles.toolsGrid}>
                {getFilteredTools().map(tool => (
                  <div
                    key={tool.id}
                    style={{
                      ...styles.toolCard,
                      ...(activeTool === tool.id ? styles.activeToolCard : {})
                    }}
                    onClick={() => setActiveTool(tool.id)}
                    onMouseEnter={(e) => {
                      if (activeTool !== tool.id) {
                        e.currentTarget.style.borderColor = '#555';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTool !== tool.id) {
                        e.currentTarget.style.borderColor = '#333';
                        e.currentTarget.style.transform = 'translateY(0px)';
                      }
                    }}
                  >
                    <div style={styles.toolIcon}>{tool.icon}</div>
                    <div style={styles.toolName}>{tool.nameAr}</div>
                    <div style={styles.toolDescription}>{tool.description}</div>
                    <div style={styles.toolFeatures}>
                      {tool.features.map((feature, idx) => (
                        <span key={idx} style={styles.featureBadge}>
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tool Component */}
            <div style={styles.toolComponent}>
              {renderToolComponent()}
            </div>
          </div>


                </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={{ marginBottom: '8px' }}>
            <span style={styles.statusIndicator}>
              <span style={styles.pulse}></span>
              📡 متصل بالخوادم
            </span>
            <span style={styles.statusIndicator}>
              🔄 تحديث لحظي
            </span>
            <span style={styles.statusIndicator}>
              ⚙️ إعدادات مخصصة
            </span>
            <span style={styles.statusIndicator}>
              🎯 جان 360° متقدم
            </span>
          </div>
          <div>
            كوكبة الأرقام السحرية © 2024 | أدوات جان المتقدمة مع التحليل الفني المخصص
          </div>
        </div>
      </div>
    </MarketDataProvider>
  );
};

export default HomeEnhanced;
