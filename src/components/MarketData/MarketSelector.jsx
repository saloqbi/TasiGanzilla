import React, { useState, useEffect } from 'react';
import { useMarketData } from './MarketDataProvider';

// إضافة الأنماط المتحركة
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes pulse {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.2); }
    100% { opacity: 1; transform: scale(1); }
  }
  
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideUp {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-10px); }
  }
`;
document.head.appendChild(styleSheet);

const MarketSelector = ({ onMarketSelect }) => {
  const { addMarketWatch, removeMarketWatch, clearAllMarkets, MARKET_DATA_SOURCES, selectedMarkets: currentSelectedMarkets } = useMarketData();
  const [expandedSections, setExpandedSections] = useState({
    crypto: false,
    forex: false,
    usstocks: false,
    tasi: false, // جميع الأقسام مغلقة افتراضياً
    commodities: false,
    indices: false
  });

  // طباعة حالة الأقسام عند تحديث المكون
  useEffect(() => {
    console.log('🔍 حالة الأقسام الحالية:', expandedSections);
  }, [expandedSections]);

  // قوائم الرموز المختلفة للأسواق
  const marketSymbols = {
    crypto: [
      { symbol: 'BTCUSDT', name: 'Bitcoin', nameAr: 'بيتكوين' },
      { symbol: 'ETHUSDT', name: 'Ethereum', nameAr: 'إيثيريوم' },
      { symbol: 'BNBUSDT', name: 'Binance Coin', nameAr: 'عملة بينانس' },
      { symbol: 'ADAUSDT', name: 'Cardano', nameAr: 'كاردانو' },
      { symbol: 'SOLUSDT', name: 'Solana', nameAr: 'سولانا' },
      { symbol: 'XRPUSDT', name: 'Ripple', nameAr: 'ريبل' },
      { symbol: 'DOTUSDT', name: 'Polkadot', nameAr: 'بولكادوت' },
      { symbol: 'DOGEUSDT', name: 'Dogecoin', nameAr: 'دوجكوين' }
    ],
    
    forex: [
      { symbol: 'EURUSD', name: 'EUR/USD', nameAr: 'يورو/دولار' },
      { symbol: 'GBPUSD', name: 'GBP/USD', nameAr: 'جنيه/دولار' },
      { symbol: 'USDJPY', name: 'USD/JPY', nameAr: 'دولار/ين' },
      { symbol: 'USDCHF', name: 'USD/CHF', nameAr: 'دولار/فرنك' },
      { symbol: 'AUDUSD', name: 'AUD/USD', nameAr: 'دولار أسترالي/دولار' },
      { symbol: 'USDCAD', name: 'USD/CAD', nameAr: 'دولار/دولار كندي' },
      { symbol: 'NZDUSD', name: 'NZD/USD', nameAr: 'دولار نيوزيلندي/دولار' },
      { symbol: 'EURGBP', name: 'EUR/GBP', nameAr: 'يورو/جنيه' }
    ],
    
    usstocks: [
      { symbol: 'AAPL', name: 'Apple Inc.', nameAr: 'آبل' },
      { symbol: 'MSFT', name: 'Microsoft', nameAr: 'مايكروسوفت' },
      { symbol: 'GOOGL', name: 'Alphabet', nameAr: 'ألفابت' },
      { symbol: 'AMZN', name: 'Amazon', nameAr: 'أمازون' },
      { symbol: 'TSLA', name: 'Tesla', nameAr: 'تيسلا' },
      { symbol: 'META', name: 'Meta', nameAr: 'ميتا' },
      { symbol: 'NVDA', name: 'NVIDIA', nameAr: 'إنفيديا' },
      { symbol: 'NFLX', name: 'Netflix', nameAr: 'نتفليكس' }
    ],
    
    tasi: [
      { symbol: '2222', name: 'Saudi Aramco', nameAr: 'أرامكو السعودية' },
      { symbol: '1120', name: 'Al Rajhi Bank', nameAr: 'مصرف الراجحي' },
      { symbol: '2010', name: 'SABIC', nameAr: 'سابك' },
      { symbol: '1210', name: 'Saudi Basic Industries', nameAr: 'الصناعات الأساسية' },
      { symbol: '4030', name: 'Saudi Telecom', nameAr: 'الاتصالات السعودية' },
      { symbol: '2020', name: 'SABIC Agri-Nutrients', nameAr: 'سابك للمغذيات الزراعية' },
      { symbol: '1180', name: 'National Commercial Bank', nameAr: 'البنك الأهلي التجاري' },
      { symbol: '2380', name: 'Petrochemical Industries', nameAr: 'الصناعات البتروكيماوية' },
      { symbol: '4280', name: 'Saudi Arabian Mining', nameAr: 'التعدين العربي السعودي' },
      { symbol: '1111', name: 'Saudi Investment Bank', nameAr: 'البنك السعودي للاستثمار' }
    ],
    
    commodities: [
      { symbol: 'XAUUSD', name: 'Gold', nameAr: 'الذهب' },
      { symbol: 'XAGUSD', name: 'Silver', nameAr: 'الفضة' },
      { symbol: 'XPTUSD', name: 'Platinum', nameAr: 'البلاتين' },
      { symbol: 'XPDUSD', name: 'Palladium', nameAr: 'البالاديوم' },
      { symbol: 'CRUDE', name: 'Crude Oil', nameAr: 'النفط الخام' },
      { symbol: 'BRENT', name: 'Brent Oil', nameAr: 'نفط برنت' },
      { symbol: 'NATGAS', name: 'Natural Gas', nameAr: 'الغاز الطبيعي' },
      { symbol: 'COPPER', name: 'Copper', nameAr: 'النحاس' }
    ],
    
    indices: [
      { symbol: 'SPX', name: 'S&P 500', nameAr: 'مؤشر ستاندرد آند بورز 500' },
      { symbol: 'DJI', name: 'Dow Jones', nameAr: 'مؤشر داو جونز' },
      { symbol: 'IXIC', name: 'NASDAQ', nameAr: 'مؤشر ناسداك' },
      { symbol: 'FTSE', name: 'FTSE 100', nameAr: 'مؤشر فوتسي 100' },
      { symbol: 'DAX', name: 'DAX 30', nameAr: 'مؤشر داكس 30' },
      { symbol: 'N225', name: 'Nikkei 225', nameAr: 'مؤشر نيكي 225' },
      { symbol: 'HSI', name: 'Hang Seng', nameAr: 'مؤشر هانغ سنغ' },
      { symbol: 'TASI', name: 'TASI', nameAr: 'مؤشر تاسي' }
    ]
  };

  // أسماء الأقسام بالعربية
  const sectionNames = {
    crypto: '💰 العملات الرقمية',
    forex: '💱 الفوركس',
    usstocks: '🏢 السوق الأمريكي',
    tasi: '🇸🇦 السوق السعودي (تاسي)',
    commodities: '🥇 السلع',
    indices: '📊 المؤشرات'
  };

  // تبديل حالة القسم (مفتوح/مغلق)
  const toggleSection = (section) => {
    console.log(`🔄 تبديل القسم: ${section}`);
    console.log(`📊 الحالة الحالية قبل التغيير:`, expandedSections[section]);
    
    setExpandedSections(prev => {
      const newState = {
        ...prev,
        [section]: !prev[section]
      };
      console.log(`✅ الحالة الجديدة لـ ${section}:`, newState[section]);
      console.log(`📋 جميع الأقسام بعد التحديث:`, newState);
      return newState;
    });
  };

  // تحديد/إلغاء تحديد سوق (سهم واحد فقط)
  const handleMarketToggle = (marketType, symbol) => {
    console.log(`تبديل السوق: ${marketType}_${symbol}`);
    const marketKey = `${marketType}_${symbol}`;
    
    if (currentSelectedMarkets.includes(marketKey)) {
      console.log(`إلغاء اختيار السوق: ${marketKey}`);
      removeMarketWatch(marketKey);
      // إشعار المكون الأب بإلغاء الاختيار
      if (onMarketSelect) {
        onMarketSelect(null);
      }
    } else {
      console.log(`اختيار السوق: ${marketKey} (إلغاء أي سهم آخر مختار)`);
      addMarketWatch(marketKey);
      // إشعار المكون الأب بالسوق المختار
      if (onMarketSelect) {
        const marketInfo = marketSymbols[marketType]?.find(item => item.symbol === symbol);
        onMarketSelect({
          symbol,
          marketType,
          marketKey,
          name: marketInfo?.name || symbol,
          nameAr: marketInfo?.nameAr || symbol
        });
      }
    }
  };

  // تحديد أول سوق في قسم (سهم واحد فقط)
  const selectAllInSection = (section) => {
    console.log(`اختيار أول سوق في قسم: ${section}`);
    const sectionSymbols = marketSymbols[section] || [];
    
    if (sectionSymbols.length > 0) {
      const firstItem = sectionSymbols[0];
      const marketKey = `${section}_${firstItem.symbol}`;
      console.log(`اختيار السوق الأول: ${marketKey}`);
      addMarketWatch(marketKey);
    }
  };

  // إلغاء تحديد جميع الأسواق
  const deselectAllInSection = (section) => {
    console.log(`إلغاء اختيار جميع الأسواق`);
    clearAllMarkets();
  };

  // تصميم الأنماط
  const styles = {
    container: {
      backgroundColor: '#1a1a1a',
      border: '2px solid #FFD700',
      borderRadius: '10px',
      padding: '15px',
      maxHeight: '600px',
      overflowY: 'auto',
      boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
    },
    
    header: {
      color: '#FFD700',
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '15px',
      textAlign: 'center',
      borderBottom: '2px solid #FFD700',
      paddingBottom: '10px'
    },
    
    section: {
      marginBottom: '10px',
      border: '1px solid #333',
      borderRadius: '8px',
      overflow: 'hidden'
    },
    
    sectionHeader: {
      backgroundColor: '#2a2a2a',
      padding: '12px 15px',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      userSelect: 'none',
      border: '1px solid #444',
      borderRadius: '6px',
      ':hover': {
        backgroundColor: '#3a3a3a'
      }
    },
    
    sectionTitle: {
      color: '#FFD700',
      fontSize: '14px',
      fontWeight: 'bold'
    },
    
    sectionControls: {
      display: 'flex',
      gap: '5px'
    },
    
    smallButton: {
      backgroundColor: '#333',
      color: '#FFD700',
      border: '1px solid #FFD700',
      borderRadius: '4px',
      padding: '4px 8px',
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      marginLeft: '5px',
      minWidth: '25px',
      fontWeight: 'bold'
    },
    
    sectionContent: {
      backgroundColor: '#1e1e1e',
      maxHeight: '200px',
      overflowY: 'auto',
      transition: 'all 0.3s ease',
      borderTop: '1px solid #333'
    },
    
    marketItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '8px 15px',
      borderBottom: '1px solid #333',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      ':hover': {
        backgroundColor: '#2a2a2a',
        transform: 'translateX(5px)'
      }
    },
    
    checkbox: {
      marginRight: '10px',
      transform: 'scale(1.2)',
      accentColor: '#FFD700',
      cursor: 'pointer'
    },
    
    marketInfo: {
      flex: 1
    },
    
    marketSymbol: {
      color: '#FFD700',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    
    marketName: {
      color: '#ccc',
      fontSize: '11px',
      marginTop: '2px'
    },
    
    expandIcon: {
      color: '#FFD700',
      fontSize: '16px',
      transition: 'transform 0.3s ease, color 0.3s ease',
      display: 'inline-block',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            🌍 الأسواق المالية العالمية
            <div style={{fontSize: '12px', color: '#999', marginTop: '5px'}}>
              انقر على اسم القسم لفتحه أو إغلاقه • سهم واحد مختار: {currentSelectedMarkets.length}
            </div>
          </div>
          <button
            onClick={() => {
              clearAllMarkets();
              console.log('تم مسح جميع الأسواق المختارة');
            }}
            style={{
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#ff6666'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#ff4444'}
          >
            🗑️ مسح الكل
          </button>
        </div>
      </div>
      
      {Object.entries(sectionNames).map(([sectionKey, sectionName]) => {
        const isExpanded = expandedSections[sectionKey];
        const sectionSymbols = marketSymbols[sectionKey] || [];
        const selectedInSection = sectionSymbols.filter(item => 
          currentSelectedMarkets.includes(`${sectionKey}_${item.symbol}`)
        ).length;
        
        return (
          <div key={sectionKey} style={styles.section}>
            <div 
              style={{
                ...styles.sectionHeader,
                cursor: 'pointer',
                userSelect: 'none',
                backgroundColor: isExpanded ? '#3a4a3a' : '#2a2a2a',
                borderLeft: isExpanded ? '4px solid #FFD700' : '4px solid transparent'
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`🖱️ تم النقر على header القسم: ${sectionKey}`);
                console.log(`📊 الحالة الحالية: ${isExpanded ? 'مفتوح' : 'مغلق'}`);
                console.log(`🔄 سيتم تغييرها إلى: ${!isExpanded ? 'مفتوح' : 'مغلق'}`);
                toggleSection(sectionKey);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.01)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 215, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={styles.sectionTitle}>
                <span style={{marginRight: '8px'}}>
                  {isExpanded ? '📂' : '📁'}
                </span>
                {sectionName} ({selectedInSection}/{sectionSymbols.length})
              </div>
              
              <div style={styles.sectionControls} onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log('🚫 تم النقر على منطقة الأزرار - تم منع النقر');
              }}>
                <button
                  style={styles.smallButton}
                  onClick={() => selectAllInSection(sectionKey)}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#FFD700';
                    e.target.style.color = '#000';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#333';
                    e.target.style.color = '#FFD700';
                  }}
                  title="اختيار أول سهم في هذا القسم"
                >
                  ✓
                </button>
                <button
                  style={styles.smallButton}
                  onClick={() => deselectAllInSection(sectionKey)}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f44336';
                    e.target.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#333';
                    e.target.style.color = '#FFD700';
                  }}
                  title="إلغاء اختيار أي سهم مختار"
                >
                  ✗
                </button>
                <span 
                  style={{
                    ...styles.expandIcon,
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    display: 'inline-block'
                  }}
                  title={isExpanded ? 'إغلاق القسم' : 'فتح القسم'}
                >
                  ▼
                </span>
              </div>
            </div>
            
            {isExpanded && (
              <div 
                style={{
                  ...styles.sectionContent,
                  animation: isExpanded ? 'slideDown 0.3s ease-out' : 'slideUp 0.3s ease-in'
                }}
              >
                {sectionSymbols.map((item) => {
                  const marketKey = `${sectionKey}_${item.symbol}`;
                  const isSelected = currentSelectedMarkets.includes(marketKey);
                  
                  return (
                    <div 
                      key={item.symbol}
                      style={{
                        ...styles.marketItem,
                        backgroundColor: isSelected ? '#2a4a2a' : 'transparent'
                      }}
                      onClick={() => handleMarketToggle(sectionKey, item.symbol)}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '#2a2a2a';
                        }
                        e.currentTarget.style.transform = 'translateX(5px)';
                        e.currentTarget.style.borderLeft = '3px solid #FFD700';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                        e.currentTarget.style.transform = 'translateX(0px)';
                        e.currentTarget.style.borderLeft = 'none';
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleMarketToggle(sectionKey, item.symbol);
                        }}
                        style={styles.checkbox}
                      />
                      
                      <div style={styles.marketInfo}>
                        <div style={styles.marketSymbol}>
                          {item.symbol}
                        </div>
                        <div style={styles.marketName}>
                          {item.nameAr} ({item.name})
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      
      <div style={{
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#2a2a2a',
        borderRadius: '8px',
        textAlign: 'center',
        border: '1px solid #444'
      }}>
        <div style={{ color: '#FFD700', fontSize: '12px', marginBottom: '5px' }}>
          📡 البيانات اللحظية متصلة
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            backgroundColor: '#00ff00',
            borderRadius: '50%',
            marginLeft: '8px',
            animation: 'pulse 2s infinite'
          }}></span>
        </div>
        <div style={{ color: '#aaa', fontSize: '10px' }}>
          إجمالي الأسواق المحددة: 
          <span style={{
            color: '#FFD700',
            fontWeight: 'bold',
            fontSize: '12px',
            marginLeft: '5px',
            transition: 'all 0.3s ease',
            display: 'inline-block'
          }}>
            {currentSelectedMarkets.length}
          </span>
        </div>
        <div style={{ 
          color: '#666', 
          fontSize: '9px', 
          marginTop: '5px',
          borderTop: '1px solid #333',
          paddingTop: '5px'
        }}>
          🔧 الأقسام المفتوحة: {Object.values(expandedSections).filter(Boolean).length}/6
        </div>
      </div>
    </div>
  );
};

export default MarketSelector;
