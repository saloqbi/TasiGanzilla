import React, { useState } from 'react';
import { useMarketData } from '../MarketData/MarketDataProvider';

const MultiTimeframeConsensus = ({ 
  position = { x: 50, y: 50 },
  width = 320, 
  height = 280 
}) => {
  const { analysisSettings, timeframeData, updateTimeAnalysis } = useMarketData();
  
  // حالة اختيار الوقت/التاريخ
  const [selectedDateTime, setSelectedDateTime] = useState(() => {
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localDateTime.toISOString().slice(0, 16);
  });
  
  // حالة عرض منتقي الوقت
  const [showTimePicker, setShowTimePicker] = useState(false);

  // تهيئة التحليل الزمني عند التحميل
  React.useEffect(() => {
    if (updateTimeAnalysis) {
      handleTimeChange(selectedDateTime);
    }
  }, [updateTimeAnalysis]); // تشغيل عند توفر دالة التحديث

  // دالة تحديث التحليل بناءً على الوقت المختار
  const handleTimeChange = (newDateTime) => {
    setSelectedDateTime(newDateTime);
    
    // تحديث التحليل في الدائرة بناءً على الوقت الجديد
    const selectedDate = new Date(newDateTime);
    const timeFactors = calculateTimeFactors(selectedDate);
    
    // إرسال التحديث للدائرة
    if (updateTimeAnalysis) {
      updateTimeAnalysis({
        selectedDateTime: newDateTime,
        timeFactors,
        gannAngles: calculateGannAngles(selectedDate),
        marketInfluence: calculateMarketInfluence(selectedDate)
      });
    }
    
    console.log('🕐 تم تحديث التحليل للوقت:', newDateTime, timeFactors);
  };

  // حساب عوامل الوقت لجان
  const calculateTimeFactors = (date) => {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    // زوايا جان الزمنية
    const timeAngle = ((hour * 60 + minute) / 1440) * 360; // زاوية الوقت في اليوم
    const weekAngle = (dayOfWeek / 7) * 360; // زاوية اليوم في الأسبوع
    const monthAngle = (dayOfMonth / 31) * 360; // زاوية اليوم في الشهر
    const yearAngle = (month / 12) * 360; // زاوية الشهر في السنة
    
    return {
      timeAngle,
      weekAngle,
      monthAngle,
      yearAngle,
      hour,
      dayOfWeek,
      dayOfMonth,
      month,
      year,
      gannNumber: (hour + minute + dayOfMonth + month) % 360
    };
  };

  // حساب زوايا جان بناءً على الوقت
  const calculateGannAngles = (date) => {
    const factors = calculateTimeFactors(date);
    
    return {
      primary: factors.timeAngle,
      secondary: factors.weekAngle,
      support: [
        factors.monthAngle,
        factors.yearAngle,
        (factors.gannNumber * 4) % 360, // مضاعف جان
        (factors.gannNumber / 2) % 360   // نصف جان
      ]
    };
  };

  // حساب تأثير الوقت على الأسواق
  const calculateMarketInfluence = (date) => {
    const factors = calculateTimeFactors(date);
    
    // تأثيرات مختلفة حسب الوقت
    const influences = {
      crypto: 1.0, // العملات الرقمية تعمل 24/7
      forex: factors.hour >= 8 && factors.hour <= 17 ? 1.2 : 0.8, // الفوركس أقوى وقت التداول
      stocks: factors.hour >= 9 && factors.hour <= 16 ? 1.3 : 0.6, // الأسهم وقت التداول
      tasi: factors.hour >= 10 && factors.hour <= 15 ? 1.4 : 0.5, // تاسي وقت التداول السعودي
      commodities: factors.hour >= 9 && factors.hour <= 17 ? 1.1 : 0.9
    };
    
    // تأثير يوم الأسبوع
    const weekMultiplier = [0.8, 1.0, 1.1, 1.2, 1.1, 0.9, 0.7][factors.dayOfWeek];
    
    Object.keys(influences).forEach(market => {
      influences[market] *= weekMultiplier;
    });
    
    return influences;
  };

  // حساب الإجماع عبر الإطارات الزمنية
  const calculateConsensus = () => {
    const enabledTimeframes = Object.entries(analysisSettings.timeframes || {})
      .filter(([_, config]) => config.enabled)
      .map(([timeframe, _]) => timeframe);

    if (enabledTimeframes.length === 0) return null;

    const consensus = {
      bullish: 0,
      bearish: 0,
      neutral: 0,
      total: 0,
      details: {}
    };

    enabledTimeframes.forEach(timeframe => {
      const data = timeframeData?.[timeframe] || {};
      const markets = Object.values(data);
      
      if (markets.length > 0) {
        let timeframeBullish = 0;
        let timeframeBearish = 0;
        let timeframeNeutral = 0;

        markets.forEach(market => {
          if (market.movement === 'up') timeframeBullish++;
          else if (market.movement === 'down') timeframeBearish++;
          else timeframeNeutral++;
        });

        const timeframeTotal = markets.length;
        consensus.details[timeframe] = {
          bullish: (timeframeBullish / timeframeTotal) * 100,
          bearish: (timeframeBearish / timeframeTotal) * 100,
          neutral: (timeframeNeutral / timeframeTotal) * 100,
          total: timeframeTotal
        };

        consensus.bullish += timeframeBullish;
        consensus.bearish += timeframeBearish;
        consensus.neutral += timeframeNeutral;
        consensus.total += timeframeTotal;
      }
    });

    if (consensus.total > 0) {
      consensus.bullishPercent = (consensus.bullish / consensus.total) * 100;
      consensus.bearishPercent = (consensus.bearish / consensus.total) * 100;
      consensus.neutralPercent = (consensus.neutral / consensus.total) * 100;
    }

    return consensus;
  };

  const consensus = calculateConsensus();

  if (!consensus) {
    return (
      <div style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width,
        height,
        backgroundColor: 'rgba(26, 26, 26, 0.9)',
        border: '2px solid #555',
        borderRadius: '12px',
        padding: '15px',
        color: '#fff',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: '#888' }}>
          <div>📊 لا توجد إطارات زمنية مفعلة</div>
          <div style={{ fontSize: '10px', marginTop: '5px' }}>
            يرجى تفعيل إطار زمني واحد على الأقل
          </div>
        </div>
      </div>
    );
  }

  // تحديد الاتجاه العام
  const overallTrend = consensus.bullishPercent > consensus.bearishPercent 
    ? 'صاعد' 
    : consensus.bearishPercent > consensus.bullishPercent 
    ? 'هابط' 
    : 'محايد';

  const trendColor = consensus.bullishPercent > consensus.bearishPercent 
    ? '#4CAF50' 
    : consensus.bearishPercent > consensus.bullishPercent 
    ? '#f44336' 
    : '#FFC107';

  return (
    <div style={{
      position: 'absolute',
      left: position.x,
      top: position.y,
      width,
      height,
      backgroundColor: 'rgba(26, 26, 26, 0.95)',
      border: `2px solid ${trendColor}`,
      borderRadius: '12px',
      padding: '12px',
      color: '#fff',
      fontSize: '11px',
      overflowY: 'auto',
      boxShadow: `0 4px 20px rgba(${trendColor === '#4CAF50' ? '76, 175, 80' : trendColor === '#f44336' ? '244, 67, 54' : '255, 193, 7'}, 0.3)`
    }}>
      {/* العنوان مع اختيار الوقت */}
      <div style={{
        textAlign: 'center',
        fontSize: '13px',
        fontWeight: 'bold',
        color: trendColor,
        marginBottom: '10px',
        borderBottom: `1px solid ${trendColor}`,
        paddingBottom: '8px'
      }}>
        <div style={{ marginBottom: '5px' }}>📊 إجماع الإطارات الزمنية</div>
        
        {/* منتقي الوقت */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '11px'
        }}>
          <button
            onClick={() => setShowTimePicker(!showTimePicker)}
            style={{
              backgroundColor: 'rgba(42, 42, 42, 0.8)',
              border: `1px solid ${trendColor}`,
              borderRadius: '4px',
              color: trendColor,
              padding: '4px 8px',
              fontSize: '10px',
              cursor: 'pointer'
            }}
            title="اختيار وقت التحليل"
          >
            🕐 {new Date(selectedDateTime).toLocaleString('ar-SA', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </button>
          
          {showTimePicker && (
            <div style={{
              position: 'absolute',
              top: '35px',
              left: '10px',
              right: '10px',
              backgroundColor: 'rgba(26, 26, 26, 0.95)',
              border: `2px solid ${trendColor}`,
              borderRadius: '8px',
              padding: '10px',
              zIndex: 1000
            }}>
              <input
                type="datetime-local"
                value={selectedDateTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#333',
                  border: `1px solid ${trendColor}`,
                  borderRadius: '4px',
                  color: '#fff',
                  padding: '6px',
                  fontSize: '12px'
                }}
              />
              
              {/* أزرار سريعة للأوقات المهمة */}
              <div style={{
                display: 'flex',
                gap: '4px',
                marginTop: '8px',
                flexWrap: 'wrap'
              }}>
                {[
                  { label: 'الآن', offset: 0 },
                  { label: 'بداية اليوم', time: '09:00' },
                  { label: 'منتصف اليوم', time: '12:00' },
                  { label: 'نهاية اليوم', time: '16:00' },
                  { label: 'أمس', offset: -1 }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const now = new Date();
                      let targetDate = new Date(now);
                      
                      if (preset.offset !== undefined) {
                        targetDate.setDate(now.getDate() + preset.offset);
                      }
                      if (preset.time) {
                        const [hours, minutes] = preset.time.split(':');
                        targetDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                      }
                      
                      const localDateTime = new Date(targetDate.getTime() - targetDate.getTimezoneOffset() * 60000);
                      handleTimeChange(localDateTime.toISOString().slice(0, 16));
                      setShowTimePicker(false);
                    }}
                    style={{
                      backgroundColor: 'rgba(76, 175, 80, 0.2)',
                      border: '1px solid #4CAF50',
                      borderRadius: '3px',
                      color: '#4CAF50',
                      padding: '3px 6px',
                      fontSize: '9px',
                      cursor: 'pointer'
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowTimePicker(false)}
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#f44336',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* الاتجاه العام مع تأثير الوقت */}
      <div style={{
        backgroundColor: 'rgba(42, 42, 42, 0.8)',
        borderRadius: '6px',
        padding: '8px',
        marginBottom: '10px',
        textAlign: 'center'
      }}>
        <div style={{ color: '#ccc', fontSize: '10px' }}>الاتجاه العام</div>
        <div style={{ 
          color: trendColor, 
          fontSize: '14px', 
          fontWeight: 'bold',
          marginTop: '2px'
        }}>
          {overallTrend}
        </div>
        
        {/* عرض تأثير الوقت */}
        <div style={{
          marginTop: '4px',
          fontSize: '9px',
          color: '#888',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>🕐 زاوية الوقت: {calculateTimeFactors(new Date(selectedDateTime)).timeAngle.toFixed(0)}°</span>
          <span>📅 رقم جان: {calculateTimeFactors(new Date(selectedDateTime)).gannNumber}</span>
        </div>
      </div>

      {/* النسب الإجمالية */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '12px',
        gap: '4px'
      }}>
        <div style={{
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          border: '1px solid #4CAF50',
          borderRadius: '4px',
          padding: '4px',
          flex: 1,
          textAlign: 'center'
        }}>
          <div style={{ color: '#4CAF50', fontSize: '10px' }}>صاعد</div>
          <div style={{ color: '#4CAF50', fontWeight: 'bold' }}>
            {(consensus.bullishPercent || 0).toFixed(0)}%
          </div>
        </div>
        
        <div style={{
          backgroundColor: 'rgba(255, 193, 7, 0.2)',
          border: '1px solid #FFC107',
          borderRadius: '4px',
          padding: '4px',
          flex: 1,
          textAlign: 'center'
        }}>
          <div style={{ color: '#FFC107', fontSize: '10px' }}>محايد</div>
          <div style={{ color: '#FFC107', fontWeight: 'bold' }}>
            {(consensus.neutralPercent || 0).toFixed(0)}%
          </div>
        </div>
        
        <div style={{
          backgroundColor: 'rgba(244, 67, 54, 0.2)',
          border: '1px solid #f44336',
          borderRadius: '4px',
          padding: '4px',
          flex: 1,
          textAlign: 'center'
        }}>
          <div style={{ color: '#f44336', fontSize: '10px' }}>هابط</div>
          <div style={{ color: '#f44336', fontWeight: 'bold' }}>
            {(consensus.bearishPercent || 0).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* تفاصيل الإطارات الزمنية */}
      <div style={{
        maxHeight: '120px',
        overflowY: 'auto'
      }}>
        <div style={{
          color: '#ccc',
          fontSize: '10px',
          marginBottom: '6px',
          textAlign: 'center'
        }}>
          تفاصيل الإطارات الزمنية
        </div>
        
        {Object.entries(consensus.details).map(([timeframe, details]) => {
          const config = analysisSettings.timeframes?.[timeframe];
          const isActive = analysisSettings.activeTimeframe === timeframe;
          
          return (
            <div key={timeframe} style={{
              backgroundColor: isActive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(42, 42, 42, 0.5)',
              border: isActive ? '1px solid #4CAF50' : '1px solid #555',
              borderRadius: '4px',
              padding: '6px',
              marginBottom: '4px',
              fontSize: '10px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '3px'
              }}>
                <span style={{ 
                  color: isActive ? '#4CAF50' : '#fff',
                  fontWeight: isActive ? 'bold' : 'normal'
                }}>
                  {config?.name || timeframe}
                </span>
                <span style={{ color: '#888' }}>
                  ({details.total} سوق)
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '2px',
                height: '12px'
              }}>
                <div style={{
                  backgroundColor: '#4CAF50',
                  width: `${details.bullish}%`,
                  borderRadius: '2px',
                  minWidth: details.bullish > 0 ? '2px' : '0'
                }} />
                <div style={{
                  backgroundColor: '#FFC107',
                  width: `${details.neutral}%`,
                  borderRadius: '2px',
                  minWidth: details.neutral > 0 ? '2px' : '0'
                }} />
                <div style={{
                  backgroundColor: '#f44336',
                  width: `${details.bearish}%`,
                  borderRadius: '2px',
                  minWidth: details.bearish > 0 ? '2px' : '0'
                }} />
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '2px',
                fontSize: '9px',
                color: '#888'
              }}>
                <span>▲{(details.bullish || 0).toFixed(0)}%</span>
                <span>●{(details.neutral || 0).toFixed(0)}%</span>
                <span>▼{(details.bearish || 0).toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultiTimeframeConsensus;
