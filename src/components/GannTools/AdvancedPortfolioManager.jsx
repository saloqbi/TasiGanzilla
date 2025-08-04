import React, { useState, useEffect, useCallback } from 'react';

// 💼 نظام إدارة المحفظة المتقدم
const AdvancedPortfolioManager = () => {
  // حالات المحفظة
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 250000,
    totalInvested: 200000,
    totalProfit: 50000,
    profitPercentage: 25,
    availableCash: 45000,
    marginUsed: 25000,
    freeMargin: 20000
  });
  
  const [positions, setPositions] = useState([
    {
      id: 1,
      symbol: 'TASI',
      quantity: 500,
      avgPrice: 11200,
      currentPrice: 11350,
      marketValue: 5675000,
      profitLoss: 75000,
      profitPercentage: 1.34,
      allocation: 22.7,
      riskRating: 'medium'
    },
    {
      id: 2,
      symbol: 'SABIC',
      quantity: 1000,
      avgPrice: 95.50,
      currentPrice: 98.75,
      marketValue: 98750,
      profitLoss: 3250,
      profitPercentage: 3.40,
      allocation: 18.5,
      riskRating: 'low'
    },
    {
      id: 3,
      symbol: 'STC',
      quantity: 750,
      avgPrice: 142.30,
      currentPrice: 138.90,
      marketValue: 104175,
      profitLoss: -2550,
      profitPercentage: -2.39,
      allocation: 15.8,
      riskRating: 'medium'
    },
    {
      id: 4,
      symbol: 'ARAMCO',
      quantity: 300,
      avgPrice: 35.80,
      currentPrice: 37.25,
      marketValue: 11175,
      profitLoss: 435,
      profitPercentage: 4.05,
      allocation: 12.3,
      riskRating: 'low'
    }
  ]);
  
  const [riskMetrics, setRiskMetrics] = useState({
    portfolioRisk: 'medium',
    valueAtRisk: 12500,
    sharpeRatio: 2.15,
    beta: 1.08,
    alpha: 3.2,
    maxDrawdown: -8.5,
    volatility: 15.8,
    diversificationScore: 85
  });
  
  const [rebalanceRecommendations, setRebalanceRecommendations] = useState([
    { symbol: 'TASI', action: 'reduce', percentage: 5, reason: 'تقليل التركيز' },
    { symbol: 'BANKS', action: 'increase', percentage: 8, reason: 'زيادة التنويع' },
    { symbol: 'TECH', action: 'add', percentage: 10, reason: 'قطاع واعد' }
  ]);
  
  const [performanceHistory, setPerformanceHistory] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  
  // إعدادات إدارة المخاطر
  const [riskSettings, setRiskSettings] = useState({
    maxPositionSize: 25, // الحد الأقصى لحجم المركز %
    maxSectorExposure: 40, // الحد الأقصى للتعرض القطاعي %
    stopLossLevel: 5, // مستوى وقف الخسارة %
    takeProfitLevel: 15, // مستوى جني الأرباح %
    rebalanceThreshold: 10, // عتبة إعادة التوازن %
    targetCashRatio: 10 // النسبة المستهدفة للنقد %
  });

  // محاكاة بيانات الأداء التاريخي
  const generatePerformanceData = useCallback((timeframe) => {
    const periods = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : 365;
    const data = [];
    let value = portfolioData.totalValue;
    
    for (let i = 0; i < periods; i++) {
      const change = (Math.random() - 0.48) * 0.02; // تحيز إيجابي طفيف
      value *= (1 + change);
      data.push({
        date: new Date(Date.now() - (periods - i) * (timeframe === '1D' ? 3600000 : timeframe === '1W' ? 86400000 : 86400000)),
        value: value,
        return: change * 100
      });
    }
    
    return data;
  }, [portfolioData.totalValue]);

  // تحديث بيانات الأداء
  useEffect(() => {
    setPerformanceHistory(generatePerformanceData(selectedTimeframe));
  }, [selectedTimeframe, generatePerformanceData]);

  // حساب توزيع الأصول
  const calculateAssetAllocation = () => {
    const sectors = {};
    positions.forEach(pos => {
      const sector = getSectorFromSymbol(pos.symbol);
      if (!sectors[sector]) sectors[sector] = 0;
      sectors[sector] += pos.allocation;
    });
    return sectors;
  };

  // تحديد القطاع من الرمز
  const getSectorFromSymbol = (symbol) => {
    const sectorMap = {
      'TASI': 'مؤشرات',
      'SABIC': 'كيماويات',
      'STC': 'اتصالات',
      'ARAMCO': 'طاقة',
      'BANKS': 'مصارف',
      'TECH': 'تقنية'
    };
    return sectorMap[symbol] || 'أخرى';
  };

  // رسم مخطط الأداء
  const renderPerformanceChart = () => {
    if (performanceHistory.length === 0) return null;
    
    const width = 800;
    const height = 300;
    const padding = 60;
    
    const values = performanceHistory.map(d => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue;
    
    const points = values.map((value, index) => {
      const x = padding + (index / (values.length - 1)) * (width - 2 * padding);
      const y = padding + ((maxValue - value) / range) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <div style={{
        background: 'linear-gradient(135deg, #1a237e, #3949ab)',
        padding: '25px',
        borderRadius: '15px',
        border: '3px solid #3F51B5',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#fff', margin: 0 }}>📈 أداء المحفظة</h3>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            {['1D', '1W', '1M', '1Y'].map(timeframe => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                style={{
                  background: selectedTimeframe === timeframe ? '#4CAF50' : 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 15px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: selectedTimeframe === timeframe ? 'bold' : 'normal'
                }}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>
        
        <svg width={width} height={height} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
          {/* خطوط الشبكة */}
          {[...Array(6)].map((_, i) => (
            <g key={i}>
              <line
                x1={padding}
                y1={padding + (i * (height - 2 * padding) / 5)}
                x2={width - padding}
                y2={padding + (i * (height - 2 * padding) / 5)}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={padding + (i * (height - 2 * padding) / 5) + 5}
                fill="#fff"
                fontSize="10"
                textAnchor="end"
              >
                ${(maxValue - (i * range / 5)).toLocaleString()}
              </text>
            </g>
          ))}
          
          {/* منطقة الربح */}
          <defs>
            <linearGradient id="profitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#4CAF50" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          
          <polygon
            points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
            fill="url(#profitGradient)"
          />
          
          {/* خط الأداء */}
          <polyline
            points={points}
            fill="none"
            stroke="#4CAF50"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* النقاط */}
          {values.map((value, index) => {
            const x = padding + (index / (values.length - 1)) * (width - 2 * padding);
            const y = padding + ((maxValue - value) / range) * (height - 2 * padding);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#00E676"
                stroke="#fff"
                strokeWidth="2"
              />
            );
          })}
          
          {/* التسميات */}
          <text x={width/2} y={height - 20} textAnchor="middle" fill="#fff" fontSize="12">
            الوقت ({selectedTimeframe})
          </text>
          <text x={20} y={height/2} textAnchor="middle" fill="#fff" fontSize="12" transform={`rotate(-90, 20, ${height/2})`}>
            قيمة المحفظة ($)
          </text>
        </svg>
        
        <div style={{ 
          marginTop: '15px', 
          display: 'flex', 
          justifyContent: 'space-around',
          color: '#E8EAF6',
          fontSize: '14px'
        }}>
          <div>
            <span style={{ color: '#C5CAE9' }}>أعلى قيمة: </span>
            <strong>${maxValue.toLocaleString()}</strong>
          </div>
          <div>
            <span style={{ color: '#C5CAE9' }}>أقل قيمة: </span>
            <strong>${minValue.toLocaleString()}</strong>
          </div>
          <div>
            <span style={{ color: '#C5CAE9' }}>التغيير: </span>
            <strong style={{ color: portfolioData.profitPercentage > 0 ? '#4CAF50' : '#f44336' }}>
              {portfolioData.profitPercentage > 0 ? '+' : ''}{portfolioData.profitPercentage.toFixed(2)}%
            </strong>
          </div>
        </div>
      </div>
    );
  };

  // رسم توزيع الأصول
  const renderAssetAllocation = () => {
    const allocation = calculateAssetAllocation();
    const sectors = Object.keys(allocation);
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4'];
    
    return (
      <div style={{
        background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
        padding: '20px',
        borderRadius: '15px',
        border: '3px solid #4CAF50'
      }}>
        <h3 style={{ color: '#fff', textAlign: 'center', marginBottom: '20px' }}>
          🥧 توزيع الأصول حسب القطاع
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          alignItems: 'center'
        }}>
          
          {/* الرسم البياني الدائري */}
          <div style={{ textAlign: 'center' }}>
            <svg width="200" height="200">
              {sectors.map((sector, index) => {
                const startAngle = sectors.slice(0, index).reduce((sum, s) => sum + allocation[s], 0) * 3.6;
                const endAngle = startAngle + allocation[sector] * 3.6;
                const largeArcFlag = allocation[sector] > 50 ? 1 : 0;
                
                const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                const x2 = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
                const y2 = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
                
                return (
                  <path
                    key={sector}
                    d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    fill={colors[index % colors.length]}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                );
              })}
              
              {/* النسب المئوية */}
              {sectors.map((sector, index) => {
                const angle = sectors.slice(0, index).reduce((sum, s) => sum + allocation[s], 0) * 3.6 + allocation[sector] * 1.8;
                const x = 100 + 50 * Math.cos((angle - 90) * Math.PI / 180);
                const y = 100 + 50 * Math.sin((angle - 90) * Math.PI / 180);
                
                return (
                  <text
                    key={`${sector}-text`}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {allocation[sector].toFixed(1)}%
                  </text>
                );
              })}
            </svg>
          </div>
          
          {/* المفاتيح */}
          <div>
            {sectors.map((sector, index) => (
              <div key={sector} style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px',
                padding: '8px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: colors[index % colors.length],
                  borderRadius: '4px',
                  marginRight: '12px'
                }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>{sector}</div>
                  <div style={{ fontSize: '12px', color: '#E8F5E8' }}>
                    {allocation[sector].toFixed(1)}% من المحفظة
                  </div>
                </div>
                <div style={{ color: '#fff', fontWeight: 'bold' }}>
                  ${(portfolioData.totalValue * allocation[sector] / 100).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#0a0a0a',
      color: '#fff',
      minHeight: '100vh'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '25px',
        borderRadius: '20px',
        border: '3px solid #6B73FF'
      }}>
        <h1 style={{ margin: 0, fontSize: '2.2em' }}>💼 نظام إدارة المحفظة المتقدم</h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '1.1em', color: '#E3F2FD' }}>
          إدارة ذكية ومراقبة شاملة للاستثمارات
        </p>
      </div>

      {/* نظرة عامة على المحفظة */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        
        <div style={{
          background: 'linear-gradient(135deg, #4CAF50, #45a049)',
          padding: '20px',
          borderRadius: '15px',
          textAlign: 'center',
          border: '2px solid #4CAF50'
        }}>
          <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>💰</div>
          <h3 style={{ margin: '0 0 10px 0' }}>إجمالي القيمة</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold' }}>
            ${portfolioData.totalValue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
            +${portfolioData.totalProfit.toLocaleString()} ({portfolioData.profitPercentage.toFixed(2)}%)
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #2196F3, #1976D2)',
          padding: '20px',
          borderRadius: '15px',
          textAlign: 'center',
          border: '2px solid #2196F3'
        }}>
          <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>📊</div>
          <h3 style={{ margin: '0 0 10px 0' }}>نسبة شارب</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold' }}>
            {riskMetrics.sharpeRatio}
          </div>
          <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
            مؤشر الأداء المعدل للمخاطر
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #FF9800, #F57C00)',
          padding: '20px',
          borderRadius: '15px',
          textAlign: 'center',
          border: '2px solid #FF9800'
        }}>
          <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>⚠️</div>
          <h3 style={{ margin: '0 0 10px 0' }}>القيمة المعرضة للخطر</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold' }}>
            ${riskMetrics.valueAtRisk.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
            95% احتمالية خلال يوم
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #9C27B0, #7B1FA2)',
          padding: '20px',
          borderRadius: '15px',
          textAlign: 'center',
          border: '2px solid #9C27B0'
        }}>
          <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>🎯</div>
          <h3 style={{ margin: '0 0 10px 0' }}>نقاط التنويع</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold' }}>
            {riskMetrics.diversificationScore}/100
          </div>
          <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
            {riskMetrics.diversificationScore > 80 ? 'ممتاز' : riskMetrics.diversificationScore > 60 ? 'جيد' : 'يحتاج تحسين'}
          </div>
        </div>
      </div>

      {/* مخطط الأداء */}
      {renderPerformanceChart()}

      {/* توزيع الأصول */}
      {renderAssetAllocation()}

      {/* المراكز الحالية */}
      <div style={{
        background: 'linear-gradient(135deg, #37474f, #546e7a)',
        padding: '25px',
        borderRadius: '15px',
        border: '3px solid #607D8B',
        marginTop: '20px'
      }}>
        <h3 style={{ color: '#fff', textAlign: 'center', marginBottom: '20px' }}>
          📋 المراكز الحالية
        </h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            color: '#fff',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '12px', borderBottom: '2px solid #fff' }}>الرمز</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #fff' }}>الكمية</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #fff' }}>متوسط السعر</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #fff' }}>السعر الحالي</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #fff' }}>القيمة السوقية</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #fff' }}>الربح/الخسارة</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #fff' }}>التخصيص</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #fff' }}>المخاطر</th>
              </tr>
            </thead>
            <tbody>
              {positions.map(position => (
                <tr key={position.id} style={{
                  backgroundColor: position.profitLoss > 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'
                }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{position.symbol}</td>
                  <td style={{ padding: '12px' }}>{position.quantity.toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>${position.avgPrice.toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>${position.currentPrice.toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>${position.marketValue.toLocaleString()}</td>
                  <td style={{ 
                    padding: '12px',
                    color: position.profitLoss > 0 ? '#4CAF50' : '#f44336',
                    fontWeight: 'bold'
                  }}>
                    {position.profitLoss > 0 ? '+' : ''}${position.profitLoss.toLocaleString()}
                    <br />
                    <span style={{ fontSize: '12px' }}>
                      ({position.profitPercentage > 0 ? '+' : ''}{position.profitPercentage.toFixed(2)}%)
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{position.allocation.toFixed(1)}%</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor: position.riskRating === 'low' ? '#4CAF50' : 
                                       position.riskRating === 'medium' ? '#FF9800' : '#f44336'
                    }}>
                      {position.riskRating === 'low' ? 'منخفض' : 
                       position.riskRating === 'medium' ? 'متوسط' : 'عالي'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* توصيات إعادة التوازن */}
      <div style={{
        background: 'linear-gradient(135deg, #d32f2f, #f44336)',
        padding: '20px',
        borderRadius: '15px',
        border: '3px solid #f44336',
        marginTop: '20px'
      }}>
        <h3 style={{ color: '#fff', textAlign: 'center', marginBottom: '20px' }}>
          ⚖️ توصيات إعادة التوازن
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '15px'
        }}>
          {rebalanceRecommendations.map((rec, index) => (
            <div key={index} style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '15px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{rec.symbol}</div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>
                    {rec.action === 'increase' ? '📈 زيادة' : 
                     rec.action === 'reduce' ? '📉 تقليل' : '➕ إضافة'} {rec.percentage}%
                  </div>
                </div>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '20px',
                  backgroundColor: rec.action === 'increase' ? '#4CAF50' : 
                                   rec.action === 'reduce' ? '#FF9800' : '#2196F3',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {rec.action === 'increase' ? 'زيادة' : 
                   rec.action === 'reduce' ? 'تقليل' : 'إضافة'}
                </div>
              </div>
              <div style={{ marginTop: '8px', fontSize: '13px', opacity: 0.8 }}>
                السبب: {rec.reason}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: '30px',
        padding: '20px',
        fontSize: '14px',
        color: '#B0BEC5'
      }}>
        <p>💼 <strong>إدارة محفظة متقدمة:</strong> تحليل شامل وتوصيات ذكية</p>
        <p>📊 <strong>مؤشرات المخاطر:</strong> تقييم مستمر للمخاطر والعوائد</p>
        <p>⚖️ <strong>إعادة التوازن:</strong> توصيات تلقائية لتحسين الأداء</p>
        <p>📈 <strong>تتبع الأداء:</strong> مراقبة مستمرة للعوائد والمقاييس</p>
      </div>
    </div>
  );
};

export default AdvancedPortfolioManager;
