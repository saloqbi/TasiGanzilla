import React, { useState } from 'react';
import { useMarketData } from './MarketDataProvider';

const AnalysisSettingsPanel = () => {
  const { 
    analysisSettings, 
    updateAnalysisSettings, 
    toggleAnalysisSetting, 
    toggleGlobalSetting: toggleGlobalSettingFromProvider,
    updateGlobalSetting,
    resetAnalysisSettings,
    toggleTimeframe,
    setActiveTimeframe
  } = useMarketData();
  
  const [expandedSections, setExpandedSections] = useState({
    globalStandards: false,
    gannPeriods: false,
    trendCriteria: false,
    reversalPatterns: false,
    riskIndicators: false,
    general: false
  });

  // تبديل حالة القسم
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // أسماء الأقسام
  const sectionTitles = {
    globalStandards: '🌍 المعايير العالمية للتحليل الفني',
    gannPeriods: '📅 نقاط جان - الفترات الزمنية',
    trendCriteria: '📈 معايير الصعود والهبوط',
    reversalPatterns: '🔄 أنماط الانعكاس',
    riskIndicators: '📊 مؤشرات المخاطر',
    general: '⚙️ الإعدادات العامة'
  };

  // الأنماط
  const styles = {
    container: {
      backgroundColor: '#1a1a1a',
      border: '2px solid #4CAF50',
      borderRadius: '12px',
      padding: '15px',
      maxHeight: '700px',
      overflowY: 'auto',
      boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
      fontFamily: 'Arial, sans-serif'
    },

    header: {
      color: '#4CAF50',
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '15px',
      textAlign: 'center',
      borderBottom: '2px solid #4CAF50',
      paddingBottom: '10px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },

    resetButton: {
      backgroundColor: '#f44336',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 12px',
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontWeight: 'bold'
    },

    section: {
      marginBottom: '12px',
      border: '1px solid #333',
      borderRadius: '8px',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    },

    sectionHeader: {
      backgroundColor: '#2a2a2a',
      padding: '12px 15px',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      userSelect: 'none'
    },

    sectionTitle: {
      color: '#4CAF50',
      fontSize: '14px',
      fontWeight: 'bold'
    },

    expandIcon: {
      color: '#4CAF50',
      fontSize: '16px',
      transition: 'transform 0.3s ease',
      display: 'inline-block'
    },

    sectionContent: {
      backgroundColor: '#1e1e1e',
      padding: '10px 15px',
      transition: 'all 0.3s ease'
    },

    settingItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid #333',
      transition: 'all 0.3s ease'
    },

    settingLeft: {
      display: 'flex',
      alignItems: 'center',
      flex: 1
    },

    checkbox: {
      marginRight: '10px',
      transform: 'scale(1.2)',
      accentColor: '#4CAF50',
      cursor: 'pointer'
    },

    settingLabel: {
      color: '#ccc',
      fontSize: '13px',
      flex: 1
    },

    inputContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },

    numberInput: {
      backgroundColor: '#333',
      border: '1px solid #555',
      borderRadius: '4px',
      color: '#fff',
      padding: '4px 8px',
      fontSize: '12px',
      width: '60px',
      textAlign: 'center'
    },

    unitLabel: {
      color: '#888',
      fontSize: '11px'
    },

    summaryBox: {
      marginTop: '15px',
      padding: '12px',
      backgroundColor: '#2a2a2a',
      borderRadius: '8px',
      border: '1px solid #444'
    },

    summaryTitle: {
      color: '#4CAF50',
      fontSize: '14px',
      fontWeight: 'bold',
      marginBottom: '8px'
    },

    summaryItem: {
      display: 'flex',
      justifyContent: 'space-between',
      color: '#ccc',
      fontSize: '12px',
      marginBottom: '4px'
    },

    enabledCount: {
      color: '#4CAF50',
      fontWeight: 'bold'
    },

    disabledCount: {
      color: '#f44336',
      fontWeight: 'bold'
    }
  };

  // حساب الإحصائيات
  const calculateStats = () => {
    let totalEnabled = 0;
    let totalDisabled = 0;
    
    Object.values(analysisSettings).forEach(category => {
      Object.values(category).forEach(setting => {
        if (setting.enabled) {
          totalEnabled++;
        } else {
          totalDisabled++;
        }
      });
    });
    
    return { totalEnabled, totalDisabled };
  };

  const stats = calculateStats();

  // مكون خاص للمعايير العالمية
  const GlobalStandardsSection = () => {
    // استخدام إعدادات مباشرة من السياق بدلاً من state محلي
    const globalStandards = analysisSettings.globalStandards || {
      // معايير الصعود
      uptrend: {
        slight: { enabled: true, min: 0.1, max: 0.5, label: 'طفيف' },
        light: { enabled: true, min: 0.5, max: 1.0, label: 'خفيف' },
        medium: { enabled: true, min: 1.0, max: 2.0, label: 'متوسط' },
        strong: { enabled: true, min: 2.0, max: 5.0, label: 'قوي' },
        exceptional: { enabled: true, min: 5.0, max: 100, label: 'استثنائي' }
      },
      // معايير الهبوط
      downtrend: {
        slight: { enabled: true, min: -0.5, max: -0.1, label: 'طفيف' },
        light: { enabled: true, min: -1.0, max: -0.5, label: 'خفيف' },
        medium: { enabled: true, min: -2.0, max: -1.0, label: 'متوسط' },
        strong: { enabled: true, min: -5.0, max: -2.0, label: 'قوي' },
        exceptional: { enabled: true, min: -100, max: -5.0, label: 'استثنائي' }
      },
      // أنماط الانعكاس
      reversalPatterns: {
        vShape: { enabled: true, sensitivity: 2.5, label: 'V-Shape (انعكاس حاد)' },
        double: { enabled: true, tolerance: 3.0, label: 'Double (قمة/قاع مزدوج)' },
        triple: { enabled: true, confidence: 90, label: 'Triple (ترند ثلاثي - الأقوى)' }
      },
      // مؤشرات المخاطر
      riskLevels: {
        low: { enabled: true, threshold: 2.0, label: 'منخفض (تقلب < 2%)' },
        medium: { enabled: true, min: 2.0, max: 5.0, label: 'متوسط (تقلب 2-5%)' },
        high: { enabled: true, threshold: 5.0, label: 'عالي (تقلب > 5%)' }
      }
    };

    // دالة تبديل الإعدادات العامة - محسنة
    const toggleGlobalSetting = (category, key) => {
      console.log(`🔄 تبديل إعداد عالمي محلي: globalStandards.${category}.${key}`);
      
      // استخدام الدالة من المزود مع التصحيح المناسب
      toggleGlobalSettingFromProvider('globalStandards', `${category}.${key}`);
    };

    // دالة تحديث الإعدادات العامة - محسنة
    const updateGlobalSettingLocal = (category, key, property, value) => {
      console.log(`📝 تحديث إعداد عالمي محلي: globalStandards.${category}.${key}.${property} = ${value}`);
      
      // استخدام الدالة من المزود
      updateGlobalSetting('globalStandards', `${category}.${key}`, property, value);
    };

    return (
      <div style={{
        background: '#1a2a1a',
        borderRadius: '8px',
        padding: '12px',
        border: '2px solid #4CAF50'
      }}>
        <div style={{
          color: '#4CAF50',
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '15px',
          textAlign: 'center',
          borderBottom: '2px solid #4CAF50',
          paddingBottom: '8px'
        }}>
          🌍 المعايير العالمية للتحليل الفني
        </div>

        {/* معايير الصعود */}
        <div style={{
          background: '#1e3e1e',
          borderRadius: '6px',
          padding: '10px',
          marginBottom: '12px',
          border: '1px solid #4CAF50'
        }}>
          <div style={{
            color: '#4CAF50',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📈 معايير الصعود
            <span style={{
              fontSize: '11px',
              background: '#4CAF50',
              color: '#000',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {Object.values(globalStandards.uptrend).filter(s => s.enabled).length}/5
            </span>
          </div>
          
          {Object.entries(globalStandards.uptrend).map(([key, setting]) => (
            <div key={key} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 0',
              borderBottom: '1px solid #333',
              fontSize: '12px'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                color: setting.enabled ? '#4CAF50' : '#666',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={setting.enabled}
                  onChange={() => toggleGlobalSetting('uptrend', key)}
                  style={{
                    marginLeft: '8px',
                    accentColor: '#4CAF50',
                    transform: 'scale(1.1)'
                  }}
                />
                {setting.label}
              </label>
              
              {setting.enabled && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px'
                }}>
                  <input
                    type="number"
                    value={setting.min}
                    onChange={(e) => updateGlobalSettingLocal('uptrend', key, 'min', e.target.value)}
                    style={{
                      width: '50px',
                      background: '#333',
                      border: '1px solid #555',
                      borderRadius: '3px',
                      color: '#fff',
                      padding: '3px 5px',
                      fontSize: '10px'
                    }}
                    step="0.1"
                  />
                  <span style={{color: '#999'}}>إلى</span>
                  <input
                    type="number"
                    value={setting.max}
                    onChange={(e) => updateGlobalSettingLocal('uptrend', key, 'max', e.target.value)}
                    style={{
                      width: '50px',
                      background: '#333',
                      border: '1px solid #555',
                      borderRadius: '3px',
                      color: '#fff',
                      padding: '3px 5px',
                      fontSize: '10px'
                    }}
                    step="0.1"
                  />
                  <span style={{color: '#999', fontSize: '10px'}}>%</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* معايير الهبوط */}
        <div style={{
          background: '#3e1e1e',
          borderRadius: '6px',
          padding: '10px',
          marginBottom: '12px',
          border: '1px solid #f44336'
        }}>
          <div style={{
            color: '#f44336',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📉 معايير الهبوط
            <span style={{
              fontSize: '11px',
              background: '#f44336',
              color: '#fff',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {Object.values(globalStandards.downtrend).filter(s => s.enabled).length}/5
            </span>
          </div>
          
          {Object.entries(globalStandards.downtrend).map(([key, setting]) => (
            <div key={key} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 0',
              borderBottom: '1px solid #333',
              fontSize: '12px'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                color: setting.enabled ? '#f44336' : '#666',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={setting.enabled}
                  onChange={() => toggleGlobalSetting('downtrend', key)}
                  style={{
                    marginLeft: '8px',
                    accentColor: '#f44336',
                    transform: 'scale(1.1)'
                  }}
                />
                {setting.label}
              </label>
              
              {setting.enabled && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px'
                }}>
                  <input
                    type="number"
                    value={setting.min}
                    onChange={(e) => updateGlobalSettingLocal('downtrend', key, 'min', e.target.value)}
                    style={{
                      width: '50px',
                      background: '#333',
                      border: '1px solid #555',
                      borderRadius: '3px',
                      color: '#fff',
                      padding: '3px 5px',
                      fontSize: '10px'
                    }}
                    step="0.1"
                  />
                  <span style={{color: '#999'}}>إلى</span>
                  <input
                    type="number"
                    value={setting.max}
                    onChange={(e) => updateGlobalSettingLocal('downtrend', key, 'max', e.target.value)}
                    style={{
                      width: '50px',
                      background: '#333',
                      border: '1px solid #555',
                      borderRadius: '3px',
                      color: '#fff',
                      padding: '3px 5px',
                      fontSize: '10px'
                    }}
                    step="0.1"
                  />
                  <span style={{color: '#999', fontSize: '10px'}}>%</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* أنماط الانعكاس */}
        <div style={{
          background: '#1e1e3e',
          borderRadius: '6px',
          padding: '10px',
          marginBottom: '12px',
          border: '1px solid #2196F3'
        }}>
          <div style={{
            color: '#2196F3',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🔄 أنماط الانعكاس
            <span style={{
              fontSize: '11px',
              background: '#2196F3',
              color: '#fff',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {Object.values(globalStandards.reversalPatterns).filter(s => s.enabled).length}/3
            </span>
          </div>
          
          {Object.entries(globalStandards.reversalPatterns).map(([key, setting]) => (
            <div key={key} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 0',
              borderBottom: '1px solid #333',
              fontSize: '12px'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                color: setting.enabled ? '#2196F3' : '#666',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={setting.enabled}
                  onChange={() => toggleGlobalSetting('reversalPatterns', key)}
                  style={{
                    marginLeft: '8px',
                    accentColor: '#2196F3',
                    transform: 'scale(1.1)'
                  }}
                />
                {setting.label}
              </label>
              
              {setting.enabled && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px'
                }}>
                  <input
                    type="number"
                    value={setting.sensitivity || setting.tolerance || setting.confidence}
                    onChange={(e) => {
                      const prop = key === 'vShape' ? 'sensitivity' : 
                                  key === 'double' ? 'tolerance' : 'confidence';
                      updateGlobalSettingLocal('reversalPatterns', key, prop, e.target.value);
                    }}
                    style={{
                      width: '50px',
                      background: '#333',
                      border: '1px solid #555',
                      borderRadius: '3px',
                      color: '#fff',
                      padding: '3px 5px',
                      fontSize: '10px'
                    }}
                    step="0.1"
                  />
                  <span style={{color: '#999', fontSize: '10px'}}>
                    {key === 'vShape' ? 'حساسية' : key === 'double' ? 'تساهل' : '%'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* مؤشرات المخاطر */}
        <div style={{
          background: '#3e2e1e',
          borderRadius: '6px',
          padding: '10px',
          border: '1px solid #FF9800'
        }}>
          <div style={{
            color: '#FF9800',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📊 مؤشرات المخاطر
            <span style={{
              fontSize: '11px',
              background: '#FF9800',
              color: '#000',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {Object.values(globalStandards.riskLevels).filter(s => s.enabled).length}/3
            </span>
          </div>
          
          {Object.entries(globalStandards.riskLevels).map(([key, setting]) => (
            <div key={key} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 0',
              borderBottom: key !== 'high' ? '1px solid #333' : 'none',
              fontSize: '12px'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                color: setting.enabled ? '#FF9800' : '#666',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={setting.enabled}
                  onChange={() => toggleGlobalSetting('riskLevels', key)}
                  style={{
                    marginLeft: '8px',
                    accentColor: '#FF9800',
                    transform: 'scale(1.1)'
                  }}
                />
                {setting.label}
              </label>
              
              {setting.enabled && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px'
                }}>
                  {key === 'medium' ? (
                    <>
                      <input
                        type="number"
                        value={setting.min}
                        onChange={(e) => updateGlobalSettingLocal('riskLevels', key, 'min', e.target.value)}
                        style={{
                          width: '40px',
                          background: '#333',
                          border: '1px solid #555',
                          borderRadius: '3px',
                          color: '#fff',
                          padding: '3px 5px',
                          fontSize: '10px'
                        }}
                        step="0.1"
                      />
                      <span style={{color: '#999'}}>-</span>
                      <input
                        type="number"
                        value={setting.max}
                        onChange={(e) => updateGlobalSettingLocal('riskLevels', key, 'max', e.target.value)}
                        style={{
                          width: '40px',
                          background: '#333',
                          border: '1px solid #555',
                          borderRadius: '3px',
                          color: '#fff',
                          padding: '3px 5px',
                          fontSize: '10px'
                        }}
                        step="0.1"
                      />
                      <span style={{color: '#999', fontSize: '10px'}}>%</span>
                    </>
                  ) : (
                    <>
                      <span style={{color: '#999', fontSize: '10px'}}>
                        {key === 'low' ? '<' : '>'}
                      </span>
                      <input
                        type="number"
                        value={setting.threshold}
                        onChange={(e) => updateGlobalSettingLocal('riskLevels', key, 'threshold', e.target.value)}
                        style={{
                          width: '40px',
                          background: '#333',
                          border: '1px solid #555',
                          borderRadius: '3px',
                          color: '#fff',
                          padding: '3px 5px',
                          fontSize: '10px'
                        }}
                        step="0.1"
                      />
                      <span style={{color: '#999', fontSize: '10px'}}>%</span>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '12px',
          padding: '8px',
          background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
          borderRadius: '6px',
          textAlign: 'center',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(76, 175, 80, 0.3)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.02)';
          e.target.style.boxShadow = '0 4px 8px rgba(76, 175, 80, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 2px 4px rgba(76, 175, 80, 0.3)';
        }}
        onClick={() => {
          console.log('🌍 تطبيق المعايير العالمية:', localSettings);
          // هنا يمكن تطبيق الإعدادات على النظام الرئيسي
        }}
        >
          ✅ تطبيق المعايير العالمية للتحليل الفني
        </div>
      </div>
    );
  };

  // رندر عنصر الإعداد
  const renderSettingItem = (category, key, setting) => {
    const hasValue = setting.hasOwnProperty('value');
    const hasThreshold = setting.hasOwnProperty('threshold');
    const hasDays = setting.hasOwnProperty('days');
    const hasMultiplier = setting.hasOwnProperty('multiplier');
    const hasPercentage = setting.hasOwnProperty('percentage');
    const hasSensitivity = setting.hasOwnProperty('sensitivity');
    const hasTolerance = setting.hasOwnProperty('tolerance');

    return (
      <div 
        key={key} 
        style={{
          ...styles.settingItem,
          backgroundColor: setting.enabled ? '#1a2e1a' : 'transparent'
        }}
      >
        <div style={styles.settingLeft}>
          <input
            type="checkbox"
            checked={setting.enabled}
            onChange={() => toggleAnalysisSetting(category, key)}
            style={styles.checkbox}
          />
          <label style={styles.settingLabel}>
            {setting.label}
          </label>
        </div>
        
        {setting.enabled && (
          <div style={styles.inputContainer}>
            {hasValue && (
              <>
                <input
                  type="number"
                  value={setting.value}
                  onChange={(e) => updateAnalysisSettings(category, key, 'value', parseFloat(e.target.value))}
                  style={styles.numberInput}
                  min="0"
                  max="100"
                />
                <span style={styles.unitLabel}>RSI</span>
              </>
            )}
            
            {hasThreshold && (
              <>
                <input
                  type="number"
                  value={setting.threshold}
                  onChange={(e) => updateAnalysisSettings(category, key, 'threshold', parseFloat(e.target.value))}
                  style={styles.numberInput}
                  min="0"
                  step="0.1"
                />
                <span style={styles.unitLabel}>%</span>
              </>
            )}
            
            {hasDays && (
              <>
                <input
                  type="number"
                  value={setting.days}
                  onChange={(e) => updateAnalysisSettings(category, key, 'days', parseInt(e.target.value))}
                  style={styles.numberInput}
                  min="1"
                  max="365"
                />
                <span style={styles.unitLabel}>يوم</span>
              </>
            )}
            
            {hasMultiplier && (
              <>
                <input
                  type="number"
                  value={setting.multiplier}
                  onChange={(e) => updateAnalysisSettings(category, key, 'multiplier', parseFloat(e.target.value))}
                  style={styles.numberInput}
                  min="1.0"
                  step="0.1"
                />
                <span style={styles.unitLabel}>x</span>
              </>
            )}
            
            {hasPercentage && (
              <>
                <input
                  type="number"
                  value={setting.percentage}
                  onChange={(e) => updateAnalysisSettings(category, key, 'percentage', parseFloat(e.target.value))}
                  style={styles.numberInput}
                  min="0"
                  step="0.1"
                />
                <span style={styles.unitLabel}>%</span>
              </>
            )}
            
            {hasSensitivity && (
              <>
                <input
                  type="number"
                  value={setting.sensitivity}
                  onChange={(e) => updateAnalysisSettings(category, key, 'sensitivity', parseFloat(e.target.value))}
                  style={styles.numberInput}
                  min="0.1"
                  step="0.1"
                />
                <span style={styles.unitLabel}>حساسية</span>
              </>
            )}
            
            {hasTolerance && (
              <>
                <input
                  type="number"
                  value={setting.tolerance}
                  onChange={(e) => updateAnalysisSettings(category, key, 'tolerance', parseFloat(e.target.value))}
                  style={styles.numberInput}
                  min="0.1"
                  step="0.1"
                />
                <span style={styles.unitLabel}>تساهل</span>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          ⚙️ لوحة التحكم في التحليل الفني
          <div style={{fontSize: '12px', color: '#999', marginTop: '5px'}}>
            تخصيص جميع معايير التحليل والمؤشرات
          </div>
        </div>
        <button
          onClick={resetAnalysisSettings}
          style={styles.resetButton}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f66'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#f44336'}
          title="إعادة تعيين جميع الإعدادات"
        >
          🔄 إعادة تعيين
        </button>
      </div>

      {Object.entries(sectionTitles).map(([sectionKey, sectionTitle]) => {
        const isExpanded = expandedSections[sectionKey];
        const sectionSettings = analysisSettings[sectionKey] || {};
        const enabledCount = Object.values(sectionSettings).filter(s => s.enabled).length;
        const totalCount = Object.keys(sectionSettings).length;

        return (
          <div key={sectionKey} style={styles.section}>
            <div
              style={{
                ...styles.sectionHeader,
                backgroundColor: isExpanded ? '#3a4a3a' : '#2a2a2a',
                borderLeft: isExpanded ? '4px solid #4CAF50' : '4px solid transparent'
              }}
              onClick={() => toggleSection(sectionKey)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3a3a3a';
                e.currentTarget.style.transform = 'scale(1.01)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isExpanded ? '#3a4a3a' : '#2a2a2a';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div style={styles.sectionTitle}>
                {sectionTitle} ({enabledCount}/{totalCount})
              </div>
              <span 
                style={{
                  ...styles.expandIcon,
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              >
                ▼
              </span>
            </div>

            {isExpanded && (
              <div style={styles.sectionContent}>
                {sectionKey === 'globalStandards' ? (
                  <GlobalStandardsSection />
                ) : (
                  Object.entries(sectionSettings).map(([key, setting]) =>
                    renderSettingItem(sectionKey, key, setting)
                  )
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* قسم الإطارات الزمنية */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionTitle}>
            ⏰ الإطارات الزمنية للتحليل
          </div>
        </div>
        <div style={styles.sectionContent}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px',
            marginBottom: '15px'
          }}>
            {Object.entries(analysisSettings.timeframes || {}).map(([timeframe, config]) => (
              <div key={timeframe} style={{
                backgroundColor: '#2a2a2a',
                border: config.enabled ? '2px solid #4CAF50' : '1px solid #555',
                borderRadius: '8px',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#fff'
                  }}>
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={() => toggleTimeframe(timeframe)}
                      style={{
                        transform: 'scale(1.2)',
                        accentColor: '#4CAF50'
                      }}
                    />
                    <span style={{
                      fontWeight: analysisSettings.activeTimeframe === timeframe ? 'bold' : 'normal',
                      color: analysisSettings.activeTimeframe === timeframe ? '#4CAF50' : '#fff'
                    }}>
                      {config.name}
                    </span>
                  </label>
                  
                  <button
                    onClick={() => setActiveTimeframe(timeframe)}
                    disabled={!config.enabled}
                    style={{
                      backgroundColor: analysisSettings.activeTimeframe === timeframe ? '#4CAF50' : '#555',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '10px',
                      cursor: config.enabled ? 'pointer' : 'not-allowed',
                      opacity: config.enabled ? 1 : 0.5
                    }}
                  >
                    {analysisSettings.activeTimeframe === timeframe ? 'نشط' : 'تفعيل'}
                  </button>
                </div>
                
                <div style={{
                  fontSize: '11px',
                  color: '#888',
                  textAlign: 'center'
                }}>
                  تحديث كل {Math.floor(config.interval / 60)} ثانية
                </div>
              </div>
            ))}
          </div>
          
          <div style={{
            backgroundColor: '#1a2e1a',
            border: '1px solid #4CAF50',
            borderRadius: '6px',
            padding: '8px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#4CAF50'
          }}>
            الإطار الزمني النشط: {analysisSettings.timeframes?.[analysisSettings.activeTimeframe]?.name || 'غير محدد'}
          </div>
        </div>
      </div>

      <div style={styles.summaryBox}>
        <div style={styles.summaryTitle}>📊 ملخص الإعدادات</div>
        <div style={styles.summaryItem}>
          <span>إجمالي المؤشرات المفعلة:</span>
          <span style={styles.enabledCount}>{stats.totalEnabled}</span>
        </div>
        <div style={styles.summaryItem}>
          <span>المؤشرات المعطلة:</span>
          <span style={styles.disabledCount}>{stats.totalDisabled}</span>
        </div>
        <div style={styles.summaryItem}>
          <span>إجمالي المؤشرات:</span>
          <span style={{color: '#4CAF50', fontWeight: 'bold'}}>
            {stats.totalEnabled + stats.totalDisabled}
          </span>
        </div>
        <div style={{
          marginTop: '8px',
          padding: '8px',
          backgroundColor: '#1a2e1a',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <span style={{color: '#4CAF50', fontSize: '12px', fontWeight: 'bold'}}>
            🔬 معايير التحليل الفني نشطة ومحدثة
          </span>
        </div>
      </div>
    </div>
  );
};

export default AnalysisSettingsPanel;
