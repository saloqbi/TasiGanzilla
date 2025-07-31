import React, { useState, useEffect } from 'react';
import { useMarketData } from './MarketDataProvider';

const TechnicalAnalysisPanel = ({ selectedMarkets = [] }) => {
  const { marketData, priceMovements, gannAnalysis, applyGannAnalysis } = useMarketData();
  const [activeTab, setActiveTab] = useState('gann');
  const [analysisSettings, setAnalysisSettings] = useState({
    timeframe: 'daily',
    showAngles: true,
    showFibonacci: true,
    showSupport: true,
    showResistance: true,
    showTimeZones: true
  });

  // أنماط التحليل الفني العالمية
  const technicalPatterns = {
    gann: {
      name: 'تحليل جان',
      icon: '🔄',
      patterns: [
        'زوايا جان الأساسية',
        'مربعات الوقت والسعر',
        'دورات زمنية',
        'مقاومة ودعم طبيعي',
        'مراوح جان'
      ]
    },
    
    fibonacci: {
      name: 'فيبوناتشي',
      icon: '🌀',
      patterns: [
        'مستويات الارتداد',
        'امتدادات فيبوناتشي',
        'مراوح فيبوناتشي',
        'أقواس فيبوناتشي',
        'المناطق الزمنية'
      ]
    },
    
    elliot: {
      name: 'موجات إليوت',
      icon: '🌊',
      patterns: [
        'الموجة الدافعة 5-3',
        'موجات التصحيح ABC',
        'الموجات الفرعية',
        'قواعد الموجات',
        'نسب فيبوناتشي في الموجات'
      ]
    },
    
    classical: {
      name: 'الأنماط الكلاسيكية',
      icon: '📈',
      patterns: [
        'الرأس والكتفين',
        'القاع المزدوج/القمة المزدوجة',
        'المثلثات (صاعد، هابط، متماثل)',
        'القنوات السعرية',
        'أنماط الانعكاس'
      ]
    },
    
    candlestick: {
      name: 'الشموع اليابانية',
      icon: '🕯️',
      patterns: [
        'المطرقة/المطرقة المقلوبة',
        'الدوجي وأنواعه',
        'البلع الصاعد/الهابط',
        'نجمة الصباح/المساء',
        'الهارامي'
      ]
    },
    
    volume: {
      name: 'تحليل الحجم',
      icon: '📊',
      patterns: [
        'مؤشر OBV',
        'مؤشر تدفق الأموال',
        'حجم التداول المرجح',
        'توزيع التراكم',
        'انحراف الحجم'
      ]
    }
  };

  // حساب تحليل جان المتقدم
  const calculateAdvancedGannAnalysis = (marketKey) => {
    const [marketType, symbol] = marketKey.split('_');
    const data = marketData[marketType]?.[symbol];
    
    if (!data) return null;

    const currentPrice = parseFloat(data.price || data.c || data.last);
    if (!currentPrice) return null;

    // حساب زوايا جان الأساسية
    const gannAngles = {
      '1x8': { angle: 7.5, price: currentPrice * 0.875 },
      '1x4': { angle: 15, price: currentPrice * 0.9 },
      '1x3': { angle: 18.75, price: currentPrice * 0.925 },
      '1x2': { angle: 26.25, price: currentPrice * 0.95 },
      '1x1': { angle: 45, price: currentPrice, main: true },
      '2x1': { angle: 63.75, price: currentPrice * 1.05 },
      '3x1': { angle: 71.25, price: currentPrice * 1.075 },
      '4x1': { angle: 75, price: currentPrice * 1.1 },
      '8x1': { angle: 82.5, price: currentPrice * 1.125 }
    };

    // حساب مستويات الدعم والمقاومة
    const supportResistance = calculateSupportResistance(currentPrice);

    // حساب الموقع في دائرة 360
    const circlePosition = calculateGannCirclePosition(currentPrice);

    // تحديد اتجاه الترند
    const trendDirection = determineTrendDirection(marketKey);

    return {
      currentPrice,
      gannAngles,
      supportResistance,
      circlePosition,
      trendDirection,
      timestamp: Date.now()
    };
  };

  // حساب مستويات الدعم والمقاومة
  const calculateSupportResistance = (price) => {
    const levels = [];
    
    // مستويات فيبوناتشي
    const fibLevels = [0.236, 0.382, 0.5, 0.618, 0.786];
    
    fibLevels.forEach(level => {
      levels.push({
        type: 'support',
        price: price * (1 - level * 0.1),
        strength: level,
        source: 'fibonacci'
      });
      
      levels.push({
        type: 'resistance', 
        price: price * (1 + level * 0.1),
        strength: level,
        source: 'fibonacci'
      });
    });

    // مستويات نفسية (أرقام مدورة)
    const roundNumbers = [
      Math.floor(price / 100) * 100,
      Math.ceil(price / 100) * 100,
      Math.floor(price / 50) * 50,
      Math.ceil(price / 50) * 50
    ];

    roundNumbers.forEach(level => {
      if (level !== price) {
        levels.push({
          type: level > price ? 'resistance' : 'support',
          price: level,
          strength: 0.5,
          source: 'psychological'
        });
      }
    });

    return levels.sort((a, b) => Math.abs(a.price - price) - Math.abs(b.price - price));
  };

  // حساب موقع السعر في دائرة جان 360
  const calculateGannCirclePosition = (price) => {
    // تحويل السعر إلى رقم مختزل
    const priceStr = price.toString().replace('.', '');
    const sumDigits = priceStr.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    const reducedNumber = ((sumDigits - 1) % 9) + 1;

    // حساب الموقع في الدائرة
    const sector = Math.floor(((reducedNumber - 1) / 9) * 36) + 1;
    const angle = ((reducedNumber - 1) / 9) * 360;

    // تحديد خصائص القطاع
    const sectorProperties = getSectorProperties(sector);

    return {
      reducedNumber,
      sector,
      angle,
      properties: sectorProperties,
      quadrant: Math.floor(angle / 90) + 1
    };
  };

  // خصائص القطاعات في دائرة جان
  const getSectorProperties = (sector) => {
    const properties = {
      element: '',
      quality: '',
      polarity: '',
      ruling: ''
    };

    // تحديد العنصر (نار، تراب، هواء، ماء)
    const elementCycle = sector % 4;
    switch (elementCycle) {
      case 1: properties.element = 'نار'; break;
      case 2: properties.element = 'تراب'; break;
      case 3: properties.element = 'هواء'; break;
      case 0: properties.element = 'ماء'; break;
    }

    // تحديد القطبية (إيجابي/سلبي)
    properties.polarity = sector % 2 === 1 ? 'إيجابي' : 'سلبي';

    // تحديد الخاصية (كاردينال، ثابت، متغير)
    const qualityCycle = sector % 3;
    switch (qualityCycle) {
      case 1: properties.quality = 'كاردينال'; break;
      case 2: properties.quality = 'ثابت'; break;
      case 0: properties.quality = 'متغير'; break;
    }

    return properties;
  };

  // تحديد اتجاه الترند
  const determineTrendDirection = (marketKey) => {
    const movement = priceMovements[marketKey];
    if (!movement || !movement.history || movement.history.length < 3) {
      return 'محايد';
    }

    const recent = movement.history.slice(-3);
    const [old, mid, current] = recent;

    if (current > mid && mid > old) return 'صاعد قوي';
    if (current > mid && mid <= old) return 'صاعد';
    if (current < mid && mid < old) return 'هابط قوي';
    if (current < mid && mid >= old) return 'هابط';
    
    return 'جانبي';
  };

  // رندر تحليل السوق الواحد
  const renderMarketAnalysis = (marketKey) => {
    const [marketType, symbol] = marketKey.split('_');
    const analysis = calculateAdvancedGannAnalysis(marketKey);
    const movement = priceMovements[marketKey];

    if (!analysis) return null;

    return (
      <div key={marketKey} style={styles.marketCard}>
        <div style={styles.marketHeader}>
          <div style={styles.marketTitle}>
            <span style={styles.symbol}>{symbol}</span>
            <span style={styles.marketType}>{getMarketTypeLabel(marketType)}</span>
          </div>
          <div style={styles.priceInfo}>
            <span style={{
              ...styles.currentPrice,
              color: movement?.color || '#FFD700'
            }}>
              {analysis.currentPrice.toFixed(4)}
            </span>
            <span style={styles.movement}>
              {movement?.movement === 'up' ? '📈' : movement?.movement === 'down' ? '📉' : '➡️'}
            </span>
          </div>
        </div>

        {activeTab === 'gann' && (
          <div style={styles.analysisContent}>
            <div style={styles.gannSection}>
              <h4 style={styles.sectionTitle}>🔄 زوايا جان</h4>
              <div style={styles.anglesList}>
                {Object.entries(analysis.gannAngles).map(([angleKey, angleData]) => (
                  <div key={angleKey} style={{
                    ...styles.angleItem,
                    border: angleData.main ? '2px solid #FFD700' : '1px solid #333'
                  }}>
                    <span style={styles.angleLabel}>{angleKey}</span>
                    <span style={styles.angleValue}>{angleData.price.toFixed(4)}</span>
                    <span style={styles.angleDegree}>{angleData.angle}°</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.circleSection}>
              <h4 style={styles.sectionTitle}>🎯 موقع دائرة 360</h4>
              <div style={styles.circleInfo}>
                <div style={styles.circleItem}>
                  <span>الرقم المختزل:</span>
                  <span style={styles.circleValue}>{analysis.circlePosition.reducedNumber}</span>
                </div>
                <div style={styles.circleItem}>
                  <span>القطاع:</span>
                  <span style={styles.circleValue}>{analysis.circlePosition.sector}/36</span>
                </div>
                <div style={styles.circleItem}>
                  <span>الزاوية:</span>
                  <span style={styles.circleValue}>{analysis.circlePosition.angle.toFixed(1)}°</span>
                </div>
                <div style={styles.circleItem}>
                  <span>العنصر:</span>
                  <span style={styles.circleValue}>{analysis.circlePosition.properties.element}</span>
                </div>
              </div>
            </div>

            <div style={styles.trendSection}>
              <h4 style={styles.sectionTitle}>📊 تحليل الاتجاه</h4>
              <div style={styles.trendInfo}>
                <span style={{
                  ...styles.trendValue,
                  color: getTrendColor(analysis.trendDirection)
                }}>
                  {analysis.trendDirection}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'levels' && (
          <div style={styles.analysisContent}>
            <h4 style={styles.sectionTitle}>📊 مستويات الدعم والمقاومة</h4>
            <div style={styles.levelsList}>
              {analysis.supportResistance.slice(0, 8).map((level, index) => (
                <div key={index} style={{
                  ...styles.levelItem,
                  borderLeft: `4px solid ${level.type === 'support' ? '#00FF00' : '#FF0000'}`
                }}>
                  <span style={styles.levelType}>
                    {level.type === 'support' ? '🟢 دعم' : '🔴 مقاومة'}
                  </span>
                  <span style={styles.levelPrice}>{level.price.toFixed(4)}</span>
                  <span style={styles.levelSource}>{level.source}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // الحصول على تسمية نوع السوق
  const getMarketTypeLabel = (marketType) => {
    const labels = {
      crypto: '💰 رقمية',
      forex: '💱 فوركس',
      usstocks: '🏢 أمريكي',
      tasi: '🇸🇦 تاسي',
      commodities: '🥇 سلع',
      indices: '📊 مؤشرات'
    };
    return labels[marketType] || marketType;
  };

  // لون الاتجاه
  const getTrendColor = (trend) => {
    if (trend.includes('صاعد')) return '#00FF00';
    if (trend.includes('هابط')) return '#FF0000';
    return '#FFD700';
  };

  // الأنماط
  const styles = {
    container: {
      backgroundColor: '#1a1a1a',
      border: '2px solid #FFD700',
      borderRadius: '10px',
      padding: '15px',
      maxHeight: '800px',
      overflowY: 'auto'
    },

    header: {
      color: '#FFD700',
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '15px',
      textAlign: 'center'
    },

    tabsContainer: {
      display: 'flex',
      marginBottom: '15px',
      borderBottom: '1px solid #333'
    },

    tab: {
      flex: 1,
      padding: '10px',
      backgroundColor: '#2a2a2a',
      color: '#aaa',
      border: 'none',
      cursor: 'pointer',
      fontSize: '12px',
      transition: 'all 0.3s'
    },

    activeTab: {
      backgroundColor: '#FFD700',
      color: '#000',
      fontWeight: 'bold'
    },

    marketCard: {
      backgroundColor: '#2a2a2a',
      border: '1px solid #333',
      borderRadius: '8px',
      marginBottom: '15px',
      overflow: 'hidden'
    },

    marketHeader: {
      padding: '12px 15px',
      backgroundColor: '#333',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },

    marketTitle: {
      display: 'flex',
      flexDirection: 'column'
    },

    symbol: {
      color: '#FFD700',
      fontSize: '14px',
      fontWeight: 'bold'
    },

    marketType: {
      color: '#aaa',
      fontSize: '10px'
    },

    priceInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },

    currentPrice: {
      fontSize: '16px',
      fontWeight: 'bold'
    },

    movement: {
      fontSize: '16px'
    },

    analysisContent: {
      padding: '15px'
    },

    gannSection: {
      marginBottom: '15px'
    },

    sectionTitle: {
      color: '#FFD700',
      fontSize: '12px',
      marginBottom: '8px',
      borderBottom: '1px solid #444',
      paddingBottom: '4px'
    },

    anglesList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '8px'
    },

    angleItem: {
      padding: '8px',
      backgroundColor: '#1e1e1e',
      borderRadius: '4px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontSize: '10px'
    },

    angleLabel: {
      color: '#FFD700',
      fontWeight: 'bold',
      marginBottom: '2px'
    },

    angleValue: {
      color: '#fff',
      fontSize: '12px'
    },

    angleDegree: {
      color: '#aaa',
      fontSize: '9px'
    },

    circleSection: {
      marginBottom: '15px'
    },

    circleInfo: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '8px'
    },

    circleItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '6px 10px',
      backgroundColor: '#1e1e1e',
      borderRadius: '4px',
      fontSize: '11px'
    },

    circleValue: {
      color: '#FFD700',
      fontWeight: 'bold'
    },

    trendSection: {
      textAlign: 'center'
    },

    trendInfo: {
      padding: '10px',
      backgroundColor: '#1e1e1e',
      borderRadius: '6px'
    },

    trendValue: {
      fontSize: '14px',
      fontWeight: 'bold'
    },

    levelsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },

    levelItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 12px',
      backgroundColor: '#1e1e1e',
      borderRadius: '4px',
      fontSize: '11px'
    },

    levelType: {
      minWidth: '60px'
    },

    levelPrice: {
      color: '#FFD700',
      fontWeight: 'bold'
    },

    levelSource: {
      color: '#aaa',
      fontSize: '9px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        📊 التحليل الفني المتقدم
      </div>

      <div style={styles.tabsContainer}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'gann' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('gann')}
        >
          🔄 جان
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'levels' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('levels')}
        >
          📊 المستويات
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'patterns' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('patterns')}
        >
          📈 الأنماط
        </button>
      </div>

      {selectedMarkets.length === 0 ? (
        <div style={{
          textAlign: 'center',
          color: '#aaa',
          padding: '30px',
          fontSize: '14px'
        }}>
          📋 اختر الأسواق من القائمة لعرض التحليل
        </div>
      ) : (
        <div>
          {selectedMarkets.map(marketKey => renderMarketAnalysis(marketKey))}
        </div>
      )}

      {activeTab === 'patterns' && (
        <div style={{ padding: '15px' }}>
          <div style={styles.sectionTitle}>🎯 أنماط التحليل العالمية</div>
          {Object.entries(technicalPatterns).map(([key, pattern]) => (
            <div key={key} style={{
              marginBottom: '10px',
              padding: '10px',
              backgroundColor: '#2a2a2a',
              borderRadius: '6px'
            }}>
              <div style={{
                color: '#FFD700',
                fontWeight: 'bold',
                marginBottom: '5px'
              }}>
                {pattern.icon} {pattern.name}
              </div>
              <div style={{ fontSize: '10px', color: '#aaa' }}>
                {pattern.patterns.join(' • ')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TechnicalAnalysisPanel;
