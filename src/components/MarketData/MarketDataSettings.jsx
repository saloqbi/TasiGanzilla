import React, { useState } from 'react';
import { useMarketData } from './MarketDataProvider';

const MarketDataSettings = ({ 
  priceBasedColoring,
  setPriceBasedColoring,
  showMarketOverlay,
  setShowMarketOverlay,
  gannIntegrationMode,
  setGannIntegrationMode,
  autoUpdateAnalysis,
  setAutoUpdateAnalysis
}) => {
  const { MARKET_DATA_SOURCES } = useMarketData();
  const [activeTab, setActiveTab] = useState('general');

  const styles = {
    container: {
      backgroundColor: '#1a1a1a',
      border: '2px solid #FFD700',
      borderRadius: '10px',
      padding: '15px',
      color: '#FFD700',
      minWidth: '300px'
    },
    
    header: {
      fontSize: '16px',
      fontWeight: 'bold',
      marginBottom: '15px',
      textAlign: 'center',
      borderBottom: '1px solid #FFD700',
      paddingBottom: '8px'
    },
    
    tabs: {
      display: 'flex',
      marginBottom: '15px',
      borderBottom: '1px solid #333'
    },
    
    tab: {
      flex: 1,
      padding: '8px 12px',
      backgroundColor: '#2a2a2a',
      color: '#aaa',
      border: 'none',
      cursor: 'pointer',
      fontSize: '11px',
      transition: 'all 0.3s'
    },
    
    activeTab: {
      backgroundColor: '#FFD700',
      color: '#000',
      fontWeight: 'bold'
    },
    
    section: {
      marginBottom: '15px'
    },
    
    sectionTitle: {
      fontSize: '12px',
      fontWeight: 'bold',
      marginBottom: '8px',
      color: '#FFD700'
    },
    
    setting: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
      padding: '6px 0'
    },
    
    settingLabel: {
      fontSize: '11px',
      color: '#ccc'
    },
    
    toggle: {
      width: '40px',
      height: '20px',
      backgroundColor: '#333',
      borderRadius: '10px',
      position: 'relative',
      cursor: 'pointer',
      transition: 'background-color 0.3s'
    },
    
    toggleActive: {
      backgroundColor: '#4CAF50'
    },
    
    toggleSlider: {
      width: '16px',
      height: '16px',
      backgroundColor: '#fff',
      borderRadius: '50%',
      position: 'absolute',
      top: '2px',
      left: '2px',
      transition: 'transform 0.3s'
    },
    
    toggleSliderActive: {
      transform: 'translateX(20px)'
    },
    
    select: {
      backgroundColor: '#333',
      color: '#FFD700',
      border: '1px solid #555',
      borderRadius: '4px',
      padding: '4px 8px',
      fontSize: '11px'
    },
    
    input: {
      backgroundColor: '#333',
      color: '#FFD700',
      border: '1px solid #555',
      borderRadius: '4px',
      padding: '4px 8px',
      fontSize: '11px',
      width: '60px'
    },
    
    sourceList: {
      fontSize: '10px',
      color: '#aaa',
      lineHeight: '1.4'
    },
    
    statusIndicator: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      display: 'inline-block',
      marginLeft: '5px'
    },
    
    statusConnected: {
      backgroundColor: '#4CAF50'
    },
    
    statusDisconnected: {
      backgroundColor: '#f44336'
    }
  };

  // مكون Toggle المخصص
  const Toggle = ({ checked, onChange, label }) => (
    <div style={styles.setting}>
      <span style={styles.settingLabel}>{label}</span>
      <div 
        style={{
          ...styles.toggle,
          ...(checked ? styles.toggleActive : {})
        }}
        onClick={onChange}
      >
        <div 
          style={{
            ...styles.toggleSlider,
            ...(checked ? styles.toggleSliderActive : {})
          }}
        />
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        ⚙️ إعدادات البيانات المالية
      </div>

      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'general' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('general')}
        >
          عام
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'integration' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('integration')}
        >
          التكامل
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'sources' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('sources')}
        >
          المصادر
        </button>
      </div>

      {activeTab === 'general' && (
        <div>
          <div style={styles.section}>
            <div style={styles.sectionTitle}>🎨 إعدادات العرض</div>
            
            <Toggle
              checked={priceBasedColoring}
              onChange={() => setPriceBasedColoring(!priceBasedColoring)}
              label="تلوين الخلايا حسب الأسعار"
            />
            
            <Toggle
              checked={showMarketOverlay}
              onChange={() => setShowMarketOverlay(!showMarketOverlay)}
              label="عرض البيانات على الدائرة"
            />
            
            <Toggle
              checked={autoUpdateAnalysis}
              onChange={() => setAutoUpdateAnalysis(!autoUpdateAnalysis)}
              label="تحديث التحليل تلقائياً"
            />
          </div>

          <div style={styles.section}>
            <div style={styles.sectionTitle}>⏱️ إعدادات التحديث</div>
            
            <div style={styles.setting}>
              <span style={styles.settingLabel}>تردد التحديث</span>
              <select style={styles.select} defaultValue="realtime">
                <option value="realtime">لحظي (1ث)</option>
                <option value="fast">سريع (5ث)</option>
                <option value="normal">عادي (30ث)</option>
                <option value="slow">بطيء (5د)</option>
              </select>
            </div>
            
            <div style={styles.setting}>
              <span style={styles.settingLabel}>عدد البيانات المحفوظة</span>
              <input 
                style={styles.input}
                type="number"
                defaultValue="100"
                min="10"
                max="1000"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'integration' && (
        <div>
          <div style={styles.section}>
            <div style={styles.sectionTitle}>🔗 تكامل جان</div>
            
            <div style={styles.setting}>
              <span style={styles.settingLabel}>طريقة التكامل</span>
              <select 
                style={styles.select}
                value={gannIntegrationMode}
                onChange={(e) => setGannIntegrationMode(e.target.value)}
              >
                <option value="price">السعر فقط</option>
                <option value="time">الوقت فقط</option>
                <option value="both">السعر والوقت</option>
                <option value="volume">الحجم</option>
              </select>
            </div>
            
            <Toggle
              checked={true}
              onChange={() => {}}
              label="ربط الزوايا بالأسعار"
            />
            
            <Toggle
              checked={false}
              onChange={() => {}}
              label="تفعيل دورات الوقت"
            />
          </div>

          <div style={styles.section}>
            <div style={styles.sectionTitle}>📊 إعدادات التحليل</div>
            
            <div style={styles.setting}>
              <span style={styles.settingLabel}>حساسية الانعكاس</span>
              <select style={styles.select} defaultValue="medium">
                <option value="high">عالية</option>
                <option value="medium">متوسطة</option>
                <option value="low">منخفضة</option>
              </select>
            </div>
            
            <div style={styles.setting}>
              <span style={styles.settingLabel}>أدنى تغيير للتلوين (%)</span>
              <input 
                style={styles.input}
                type="number"
                defaultValue="0.5"
                min="0.1"
                max="10"
                step="0.1"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sources' && (
        <div>
          <div style={styles.section}>
            <div style={styles.sectionTitle}>📡 حالة المصادر</div>
            
            {Object.entries(MARKET_DATA_SOURCES).map(([market, sources]) => (
              <div key={market} style={{ marginBottom: '10px' }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  marginBottom: '4px'
                }}>
                  {getMarketLabel(market)}
                  <span 
                    style={{
                      ...styles.statusIndicator,
                      ...(Math.random() > 0.5 ? styles.statusConnected : styles.statusDisconnected)
                    }}
                  />
                </div>
                <div style={styles.sourceList}>
                  {Object.keys(sources).slice(0, 2).join(', ')}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.section}>
            <div style={styles.sectionTitle}>🔧 إعدادات الشبكة</div>
            
            <div style={styles.setting}>
              <span style={styles.settingLabel}>مهلة الاتصال (ثانية)</span>
              <input 
                style={styles.input}
                type="number"
                defaultValue="30"
                min="5"
                max="120"
              />
            </div>
            
            <div style={styles.setting}>
              <span style={styles.settingLabel}>محاولات إعادة الاتصال</span>
              <input 
                style={styles.input}
                type="number"
                defaultValue="3"
                min="1"
                max="10"
              />
            </div>
            
            <Toggle
              checked={true}
              onChange={() => {}}
              label="ضغط البيانات"
            />
            
            <Toggle
              checked={false}
              onChange={() => {}}
              label="وضع التطوير"
            />
          </div>
        </div>
      )}

      <div style={{
        marginTop: '15px',
        padding: '8px',
        backgroundColor: '#2a2a2a',
        borderRadius: '6px',
        fontSize: '10px',
        textAlign: 'center',
        color: '#aaa'
      }}>
        💡 يمكن تخصيص جميع الإعدادات حسب احتياجاتك
      </div>
    </div>
  );

  function getMarketLabel(market) {
    const labels = {
      crypto: '💰 العملات الرقمية',
      forex: '💱 الفوركس',
      usstocks: '🏢 الأسهم الأمريكية',
      tasi: '🇸🇦 تاسي',
      commodities: '🥇 السلع',
      indices: '📊 المؤشرات'
    };
    return labels[market] || market;
  }
};

export default MarketDataSettings;
