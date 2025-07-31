import React, { useState } from 'react';
import MarketSelector from './MarketSelector';
import AnalysisSettingsPanel from './AnalysisSettingsPanel';

const TradingControlPanel = () => {
  const [activeTab, setActiveTab] = useState('markets'); // 'markets' أو 'settings'

  const styles = {
    container: {
      backgroundColor: '#0a0a0a',
      borderRadius: '15px',
      padding: '10px',
      minHeight: '600px',
      maxHeight: '800px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      border: '1px solid #333'
    },

    tabHeader: {
      display: 'flex',
      marginBottom: '15px',
      backgroundColor: '#1a1a1a',
      borderRadius: '10px',
      padding: '5px',
      border: '1px solid #333'
    },

    tab: {
      flex: 1,
      padding: '12px 15px',
      textAlign: 'center',
      cursor: 'pointer',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      fontSize: '14px',
      fontWeight: 'bold',
      userSelect: 'none'
    },

    activeTab: {
      backgroundColor: '#FFD700',
      color: '#000',
      boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)'
    },

    inactiveTab: {
      backgroundColor: 'transparent',
      color: '#ccc',
      ':hover': {
        backgroundColor: '#2a2a2a',
        color: '#FFD700'
      }
    },

    tabContent: {
      transition: 'all 0.3s ease',
      minHeight: '550px'
    },

    indicator: {
      position: 'absolute',
      bottom: '5px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '5px'
    },

    dot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      transition: 'all 0.3s ease'
    },

    activeDot: {
      backgroundColor: '#FFD700',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.6)'
    },

    inactiveDot: {
      backgroundColor: '#555'
    }
  };

  const tabs = [
    {
      id: 'markets',
      title: '🌍 الأسواق المالية',
      icon: '📊',
      description: 'اختيار وإدارة الأسواق'
    },
    {
      id: 'settings',
      title: '⚙️ إعدادات التحليل',
      icon: '🔧',
      description: 'تخصيص معايير التحليل الفني'
    }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div style={styles.container}>
      {/* شريط التبويبات */}
      <div style={styles.tabHeader}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.activeTab : styles.inactiveTab)
            }}
            onClick={() => handleTabChange(tab.id)}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.target.style.backgroundColor = '#2a2a2a';
                e.target.style.color = '#FFD700';
                e.target.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#ccc';
                e.target.style.transform = 'scale(1)';
              }
            }}
          >
            <div>
              <div style={{ fontSize: '16px', marginBottom: '2px' }}>
                {tab.icon} {tab.title}
              </div>
              <div style={{ 
                fontSize: '10px', 
                opacity: 0.8,
                color: activeTab === tab.id ? '#333' : '#999'
              }}>
                {tab.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* محتوى التبويب */}
      <div style={styles.tabContent}>
        {activeTab === 'markets' && (
          <div style={{ 
            animation: 'slideInLeft 0.3s ease-out',
            opacity: 1
          }}>
            <MarketSelector />
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div style={{ 
            animation: 'slideInRight 0.3s ease-out',
            opacity: 1
          }}>
            <AnalysisSettingsPanel />
          </div>
        )}
      </div>

      {/* مؤشر التبويب النشط */}
      <div style={{
        position: 'relative',
        marginTop: '10px'
      }}>
        <div style={styles.indicator}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              style={{
                ...styles.dot,
                ...(activeTab === tab.id ? styles.activeDot : styles.inactiveDot)
              }}
            />
          ))}
        </div>
      </div>

      {/* شريط الحالة */}
      <div style={{
        marginTop: '15px',
        padding: '8px 12px',
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        border: '1px solid #333',
        textAlign: 'center',
        fontSize: '11px',
        color: '#999'
      }}>
        {activeTab === 'markets' ? (
          <span>
            🔍 تصفح واختيار الأسواق المالية العالمية
          </span>
        ) : (
          <span>
            ⚙️ تخصيص معايير وإعدادات التحليل الفني المتقدم
          </span>
        )}
        <div style={{
          marginTop: '4px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '15px'
        }}>
          <span style={{color: '#4CAF50'}}>
            📡 متصل
          </span>
          <span style={{color: '#FFD700'}}>
            🔄 تحديث لحظي
          </span>
          <span style={{color: '#2196F3'}}>
            🎯 جان 360°
          </span>
        </div>
      </div>
    </div>
  );
};

// إضافة الأنماط المتحركة للـ CSS
const animationStyles = document.createElement('style');
animationStyles.textContent = `
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;
document.head.appendChild(animationStyles);

export default TradingControlPanel;
