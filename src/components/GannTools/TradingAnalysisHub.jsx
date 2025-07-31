// Japanese Candlestick Integration with Existing GannCircle Project
// تكامل تحليل الشموع اليابانية مع مشروع دائرة جان الموجود

import React from 'react';
import JapaneseCandlestickAnalysis from './JapaneseCandlestickAnalysis.jsx';
import EnhancedJapaneseCandlestickAnalysis from './EnhancedJapaneseCandlestickAnalysis.jsx';
import GannCircle360CanvasLifeTrading from './GannCircle360CanvasLifeTrading.jsx';

// مكون التبديل بين أنماط التحليل المختلفة
export const TradingAnalysisHub = ({ 
  defaultMode = 'gann',
  showModeSelector = true,
  enableAdvancedFeatures = true 
}) => {
  const [currentMode, setCurrentMode] = React.useState(defaultMode);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // أنماط التحليل المتاحة
  const analysisMode = {
    gann: {
      name: 'دائرة جان 360°',
      icon: '🔄',
      component: GannCircle360CanvasLifeTrading,
      description: 'تحليل جان الكلاسيكي مع الأشكال الهندسية'
    },
    candlestick: {
      name: 'الشموع اليابانية',
      icon: '🕯️',
      component: JapaneseCandlestickAnalysis,
      description: 'تحليل الشموع اليابانية الأساسي'
    },
    enhanced: {
      name: 'التحليل المتكامل',
      icon: '🚀',
      component: EnhancedJapaneseCandlestickAnalysis,
      description: 'تحليل متقدم يجمع بين جان والشموع اليابانية'
    }
  };

  // تغيير نمط التحليل مع تأثير انتقالي
  const handleModeChange = (newMode) => {
    if (newMode === currentMode) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMode(newMode);
      setIsTransitioning(false);
    }, 300);
  };

  // الحصول على المكون الحالي
  const getCurrentComponent = () => {
    const mode = analysisMode[currentMode];
    const Component = mode.component;
    return <Component />;
  };

  const styles = {
    container: {
      width: '100%',
      height: '100vh',
      position: 'relative',
      backgroundColor: '#0a0a0a',
      overflow: 'hidden'
    },
    modeSelector: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      zIndex: 1000,
      display: 'flex',
      gap: '10px',
      backgroundColor: 'rgba(26, 26, 26, 0.95)',
      backdropFilter: 'blur(10px)',
      padding: '15px',
      borderRadius: '12px',
      border: '1px solid #333',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    },
    modeButton: {
      padding: '12px 20px',
      backgroundColor: 'transparent',
      color: '#fff',
      border: '2px solid #333',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '5px',
      minWidth: '140px'
    },
    activeModeButton: {
      backgroundColor: 'rgba(255, 215, 0, 0.2)',
      borderColor: '#FFD700',
      color: '#FFD700',
      boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
    },
    modeIcon: {
      fontSize: '24px'
    },
    modeName: {
      fontSize: '12px',
      fontWeight: 'bold'
    },
    modeDescription: {
      fontSize: '10px',
      color: '#999',
      textAlign: 'center',
      lineHeight: '1.2'
    },
    componentContainer: {
      width: '100%',
      height: '100%',
      transition: 'opacity 0.3s ease',
      opacity: isTransitioning ? 0 : 1
    },
    infoPanel: {
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      backgroundColor: 'rgba(26, 26, 26, 0.95)',
      backdropFilter: 'blur(10px)',
      padding: '15px',
      borderRadius: '12px',
      border: '1px solid #333',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      color: '#fff',
      fontSize: '12px',
      maxWidth: '300px'
    },
    infoTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#FFD700',
      marginBottom: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  };

  return (
    <div style={styles.container}>
      {/* منتقي نمط التحليل */}
      {showModeSelector && (
        <div style={styles.modeSelector}>
          {Object.entries(analysisMode).map(([key, mode]) => (
            <button
              key={key}
              style={{
                ...styles.modeButton,
                ...(currentMode === key ? styles.activeModeButton : {})
              }}
              onClick={() => handleModeChange(key)}
              disabled={isTransitioning}
            >
              <div style={styles.modeIcon}>{mode.icon}</div>
              <div style={styles.modeName}>{mode.name}</div>
              <div style={styles.modeDescription}>{mode.description}</div>
            </button>
          ))}
        </div>
      )}

      {/* المكون النشط */}
      <div style={styles.componentContainer}>
        {getCurrentComponent()}
      </div>

      {/* لوحة معلومات النمط الحالي */}
      <div style={styles.infoPanel}>
        <div style={styles.infoTitle}>
          {analysisMode[currentMode].icon} {analysisMode[currentMode].name}
        </div>
        <div>{analysisMode[currentMode].description}</div>
        
        {currentMode === 'gann' && (
          <div style={{ marginTop: '10px', fontSize: '11px', color: '#999' }}>
            • دائرة جان 360° مع الأشكال الهندسية<br/>
            • تحليل الزوايا والمستويات<br/>
            • الأسواق المالية المتكاملة
          </div>
        )}
        
        {currentMode === 'candlestick' && (
          <div style={{ marginTop: '10px', fontSize: '11px', color: '#999' }}>
            • تحليل الشموع اليابانية الكلاسيكي<br/>
            • اكتشاف الأنماط التلقائي<br/>
            • ألوان متمايزة للأنواع المختلفة
          </div>
        )}
        
        {currentMode === 'enhanced' && (
          <div style={{ marginTop: '10px', fontSize: '11px', color: '#999' }}>
            • تكامل فريد بين جان والشموع اليابانية<br/>
            • تحليل متعدد الطبقات<br/>
            • إشارات متقدمة عالية الدقة
          </div>
        )}
      </div>
    </div>
  );
};

// مكون لعرض مقارنة بين الأنماط المختلفة
export const AnalysisComparison = () => {
  const [selectedModes, setSelectedModes] = React.useState(['gann', 'enhanced']);

  const toggleMode = (mode) => {
    setSelectedModes(prev => 
      prev.includes(mode) 
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    );
  };

  const styles = {
    container: {
      width: '100%',
      height: '100vh',
      display: 'grid',
      gridTemplateColumns: selectedModes.length === 1 ? '1fr' : 
                          selectedModes.length === 2 ? '1fr 1fr' : '1fr 1fr 1fr',
      gap: '2px',
      backgroundColor: '#0a0a0a'
    },
    panel: {
      position: 'relative',
      backgroundColor: '#1a1a1a',
      border: '1px solid #333'
    },
    panelHeader: {
      position: 'absolute',
      top: '10px',
      left: '10px',
      right: '10px',
      backgroundColor: 'rgba(26, 26, 26, 0.9)',
      padding: '10px',
      borderRadius: '8px',
      color: '#FFD700',
      fontSize: '14px',
      fontWeight: 'bold',
      textAlign: 'center',
      zIndex: 100
    },
    controls: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      display: 'flex',
      gap: '10px',
      backgroundColor: 'rgba(26, 26, 26, 0.95)',
      padding: '10px',
      borderRadius: '8px'
    },
    controlButton: {
      padding: '8px 12px',
      backgroundColor: 'transparent',
      color: '#fff',
      border: '1px solid #333',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.controls}>
        {['gann', 'candlestick', 'enhanced'].map(mode => (
          <button
            key={mode}
            style={{
              ...styles.controlButton,
              backgroundColor: selectedModes.includes(mode) ? '#FFD700' : 'transparent',
              color: selectedModes.includes(mode) ? '#000' : '#fff'
            }}
            onClick={() => toggleMode(mode)}
          >
            {mode === 'gann' ? '🔄 جان' : 
             mode === 'candlestick' ? '🕯️ شموع' : '🚀 متكامل'}
          </button>
        ))}
      </div>

      {selectedModes.includes('gann') && (
        <div style={styles.panel}>
          <div style={styles.panelHeader}>🔄 دائرة جان 360°</div>
          <GannCircle360CanvasLifeTrading />
        </div>
      )}

      {selectedModes.includes('candlestick') && (
        <div style={styles.panel}>
          <div style={styles.panelHeader}>🕯️ الشموع اليابانية</div>
          <JapaneseCandlestickAnalysis />
        </div>
      )}

      {selectedModes.includes('enhanced') && (
        <div style={styles.panel}>
          <div style={styles.panelHeader}>🚀 التحليل المتكامل</div>
          <EnhancedJapaneseCandlestickAnalysis />
        </div>
      )}
    </div>
  );
};

// مكون للتحليل التفاعلي
export const InteractiveAnalysis = () => {
  const [analysisMode, setAnalysisMode] = React.useState('enhanced');
  const [showComparison, setShowComparison] = React.useState(false);

  if (showComparison) {
    return <AnalysisComparison />;
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <TradingAnalysisHub 
        defaultMode={analysisMode}
        showModeSelector={true}
        enableAdvancedFeatures={true}
      />
      
      {/* زر التبديل لوضع المقارنة */}
      <button
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '12px 20px',
          backgroundColor: 'rgba(255, 215, 0, 0.2)',
          border: '2px solid #FFD700',
          borderRadius: '8px',
          color: '#FFD700',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 1001
        }}
        onClick={() => setShowComparison(!showComparison)}
      >
        📊 وضع المقارنة
      </button>
    </div>
  );
};

// تصدير المكونات
export {
  JapaneseCandlestickAnalysis,
  EnhancedJapaneseCandlestickAnalysis,
  GannCircle360CanvasLifeTrading
};

export default TradingAnalysisHub;
