import React, { useState, useEffect, useCallback } from 'react';

// 📊 نظام مراقبة الأداء المتقدم
const PerformanceMonitoringSystem = () => {
  // حالات النظام
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [performanceData, setPerformanceData] = useState({
    systemHealth: 98,
    responseTime: 4,
    memoryUsage: 45,
    cpuUsage: 32,
    networkLatency: 12,
    errorRate: 0.02
  });
  
  const [tradingMetrics, setTradingMetrics] = useState({
    totalProfitToday: 2450.75,
    totalTrades: 23,
    winRate: 87.5,
    averageProfit: 106.55,
    maxDrawdown: -125.30,
    riskAdjustedReturn: 15.8,
    sharpeRatio: 2.3,
    volatility: 0.18
  });
  
  const [systemAlerts, setSystemAlerts] = useState([
    { id: 1, type: 'success', message: 'تم تنفيذ صفقة مربحة +$150', timestamp: Date.now() - 30000 },
    { id: 2, type: 'info', message: 'تحديث استراتيجية التداول', timestamp: Date.now() - 120000 },
    { id: 3, type: 'warning', message: 'زيادة في التقلبات', timestamp: Date.now() - 300000 }
  ]);
  
  const [realTimeData, setRealTimeData] = useState([]);
  const [chartType, setChartType] = useState('performance');

  // محاكاة البيانات المباشرة
  const generateRealTimeData = useCallback(() => {
    const timestamp = Date.now();
    const profit = tradingMetrics.totalProfitToday + (Math.random() - 0.5) * 50;
    const performance = 90 + Math.random() * 10;
    
    return {
      timestamp,
      profit,
      performance,
      responseTime: 3 + Math.random() * 3,
      trades: Math.floor(Math.random() * 5),
      winRate: 80 + Math.random() * 20
    };
  }, [tradingMetrics.totalProfitToday]);

  // تحديث البيانات المباشرة
  useEffect(() => {
    if (!isMonitoring) return;
    
    const interval = setInterval(() => {
      const newData = generateRealTimeData();
      
      setRealTimeData(prev => {
        const updated = [...prev, newData];
        return updated.slice(-50); // الاحتفاظ بآخر 50 نقطة
      });
      
      // تحديث المقاييس
      setTradingMetrics(prev => ({
        ...prev,
        totalProfitToday: newData.profit,
        totalTrades: prev.totalTrades + newData.trades
      }));
      
      setPerformanceData(prev => ({
        ...prev,
        responseTime: newData.responseTime,
        systemHealth: newData.performance
      }));
      
    }, 3000); // تحديث كل 3 ثواني
    
    return () => clearInterval(interval);
  }, [isMonitoring, generateRealTimeData]);

  // رسم مخطط الأداء
  const renderPerformanceChart = () => {
    if (realTimeData.length === 0) return null;
    
    const width = 800;
    const height = 300;
    const padding = 40;
    
    const chartData = chartType === 'performance' ? 
      realTimeData.map(d => d.performance) :
      chartType === 'profit' ?
      realTimeData.map(d => d.profit) :
      realTimeData.map(d => d.responseTime);
    
    const maxValue = Math.max(...chartData);
    const minValue = Math.min(...chartData);
    const range = maxValue - minValue;
    
    const points = chartData.map((value, index) => {
      const x = padding + (index / (chartData.length - 1)) * (width - 2 * padding);
      const y = padding + ((maxValue - value) / range) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <div style={{
        background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
        padding: '20px',
        borderRadius: '15px',
        border: '2px solid #2196F3',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#fff', textAlign: 'center', marginBottom: '20px' }}>
          📈 مخطط الأداء المباشر - {
            chartType === 'performance' ? 'أداء النظام' :
            chartType === 'profit' ? 'الأرباح' : 'زمن الاستجابة'
          }
        </h3>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
          {['performance', 'profit', 'responseTime'].map(type => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              style={{
                background: chartType === type ? '#4CAF50' : 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: 'none',
                padding: '8px 15px',
                margin: '0 5px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {type === 'performance' ? '📊 الأداء' :
               type === 'profit' ? '💰 الأرباح' : '⚡ الاستجابة'}
            </button>
          ))}
        </div>
        
        <svg width={width} height={height} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
          {/* خطوط الشبكة */}
          {[...Array(5)].map((_, i) => (
            <g key={i}>
              <line
                x1={padding}
                y1={padding + (i * (height - 2 * padding) / 4)}
                x2={width - padding}
                y2={padding + (i * (height - 2 * padding) / 4)}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            </g>
          ))}
          
          {/* خط البيانات */}
          <polyline
            points={points}
            fill="none"
            stroke="#4CAF50"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* النقاط */}
          {chartData.map((value, index) => {
            const x = padding + (index / (chartData.length - 1)) * (width - 2 * padding);
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
          <text x={width/2} y={height - 10} textAnchor="middle" fill="#fff" fontSize="12">
            الوقت
          </text>
          <text x={15} y={height/2} textAnchor="middle" fill="#fff" fontSize="12" transform={`rotate(-90, 15, ${height/2})`}>
            {chartType === 'performance' ? 'الأداء %' :
             chartType === 'profit' ? 'الأرباح $' : 'الاستجابة ms'}
          </text>
        </svg>
        
        <div style={{ textAlign: 'center', marginTop: '10px', color: '#E3F2FD', fontSize: '12px' }}>
          آخر تحديث: {new Date().toLocaleTimeString()}
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
        <h1 style={{ margin: 0, fontSize: '2.2em' }}>📊 مركز مراقبة الأداء المتقدم</h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '1.1em', color: '#E3F2FD' }}>
          مراقبة شاملة لأداء النظام والتداول
        </p>
        
        <div style={{ marginTop: '15px' }}>
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            style={{
              background: isMonitoring ? '#f44336' : '#4CAF50',
              color: '#fff',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {isMonitoring ? '⏹️ إيقاف المراقبة' : '▶️ تشغيل المراقبة'}
          </button>
        </div>
      </div>

      {/* مؤشرات الأداء الرئيسية */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        
        {/* صحة النظام */}
        <div style={{
          background: `linear-gradient(135deg, ${performanceData.systemHealth > 95 ? '#4CAF50' : performanceData.systemHealth > 80 ? '#FF9800' : '#f44336'}, ${performanceData.systemHealth > 95 ? '#45a049' : performanceData.systemHealth > 80 ? '#F57C00' : '#d32f2f'})`,
          padding: '20px',
          borderRadius: '15px',
          textAlign: 'center',
          border: '2px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ fontSize: '3em', marginBottom: '10px' }}>
            {performanceData.systemHealth > 95 ? '💚' : performanceData.systemHealth > 80 ? '💛' : '❤️'}
          </div>
          <h3 style={{ margin: '0 0 10px 0' }}>صحة النظام</h3>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold' }}>
            {performanceData.systemHealth.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
            {performanceData.systemHealth > 95 ? 'ممتاز' : performanceData.systemHealth > 80 ? 'جيد' : 'يحتاج تحسين'}
          </div>
        </div>

        {/* زمن الاستجابة */}
        <div style={{
          background: `linear-gradient(135deg, ${performanceData.responseTime < 5 ? '#4CAF50' : performanceData.responseTime < 10 ? '#FF9800' : '#f44336'}, ${performanceData.responseTime < 5 ? '#45a049' : performanceData.responseTime < 10 ? '#F57C00' : '#d32f2f'})`,
          padding: '20px',
          borderRadius: '15px',
          textAlign: 'center',
          border: '2px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ fontSize: '3em', marginBottom: '10px' }}>⚡</div>
          <h3 style={{ margin: '0 0 10px 0' }}>زمن الاستجابة</h3>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold' }}>
            {performanceData.responseTime.toFixed(1)}ms
          </div>
          <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
            {performanceData.responseTime < 5 ? 'فائق السرعة' : performanceData.responseTime < 10 ? 'سريع' : 'بطيء'}
          </div>
        </div>

        {/* الأرباح اليومية */}
        <div style={{
          background: `linear-gradient(135deg, ${tradingMetrics.totalProfitToday > 0 ? '#4CAF50' : '#f44336'}, ${tradingMetrics.totalProfitToday > 0 ? '#45a049' : '#d32f2f'})`,
          padding: '20px',
          borderRadius: '15px',
          textAlign: 'center',
          border: '2px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ fontSize: '3em', marginBottom: '10px' }}>
            {tradingMetrics.totalProfitToday > 0 ? '💰' : '📉'}
          </div>
          <h3 style={{ margin: '0 0 10px 0' }}>الأرباح اليومية</h3>
          <div style={{ fontSize: '2.2em', fontWeight: 'bold' }}>
            ${tradingMetrics.totalProfitToday.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
            {tradingMetrics.totalTrades} صفقة
          </div>
        </div>

        {/* معدل النجاح */}
        <div style={{
          background: `linear-gradient(135deg, ${tradingMetrics.winRate > 80 ? '#4CAF50' : tradingMetrics.winRate > 60 ? '#FF9800' : '#f44336'}, ${tradingMetrics.winRate > 80 ? '#45a049' : tradingMetrics.winRate > 60 ? '#F57C00' : '#d32f2f'})`,
          padding: '20px',
          borderRadius: '15px',
          textAlign: 'center',
          border: '2px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ fontSize: '3em', marginBottom: '10px' }}>🎯</div>
          <h3 style={{ margin: '0 0 10px 0' }}>معدل النجاح</h3>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold' }}>
            {tradingMetrics.winRate.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
            {tradingMetrics.winRate > 80 ? 'ممتاز' : tradingMetrics.winRate > 60 ? 'جيد' : 'يحتاج تحسين'}
          </div>
        </div>
      </div>

      {/* المخطط المباشر */}
      {renderPerformanceChart()}

      {/* معلومات تفصيلية */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '20px'
      }}>
        
        {/* مقاييس التداول */}
        <div style={{
          background: 'linear-gradient(135deg, #9C27B0, #7B1FA2)',
          padding: '20px',
          borderRadius: '15px',
          border: '2px solid #9C27B0'
        }}>
          <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>📈 مقاييس التداول المتقدمة</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            fontSize: '14px'
          }}>
            <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <div style={{ color: '#F3E5F5', fontSize: '12px' }}>متوسط الربح</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>${tradingMetrics.averageProfit.toFixed(2)}</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <div style={{ color: '#F3E5F5', fontSize: '12px' }}>أقصى تراجع</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f44336' }}>${tradingMetrics.maxDrawdown.toFixed(2)}</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <div style={{ color: '#F3E5F5', fontSize: '12px' }}>نسبة شارب</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{tradingMetrics.sharpeRatio.toFixed(2)}</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <div style={{ color: '#F3E5F5', fontSize: '12px' }}>التقلبات</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{(tradingMetrics.volatility * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>

        {/* مقاييس النظام */}
        <div style={{
          background: 'linear-gradient(135deg, #2196F3, #1976D2)',
          padding: '20px',
          borderRadius: '15px',
          border: '2px solid #2196F3'
        }}>
          <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>⚙️ مقاييس النظام</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            fontSize: '14px'
          }}>
            <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <div style={{ color: '#E3F2FD', fontSize: '12px' }}>استخدام الذاكرة</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{performanceData.memoryUsage}%</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <div style={{ color: '#E3F2FD', fontSize: '12px' }}>استخدام المعالج</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{performanceData.cpuUsage}%</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <div style={{ color: '#E3F2FD', fontSize: '12px' }}>تأخير الشبكة</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{performanceData.networkLatency}ms</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <div style={{ color: '#E3F2FD', fontSize: '12px' }}>معدل الأخطاء</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{(performanceData.errorRate * 100).toFixed(2)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* التنبيهات */}
      <div style={{
        background: 'linear-gradient(135deg, #FF9800, #F57C00)',
        padding: '20px',
        borderRadius: '15px',
        border: '2px solid #FF9800'
      }}>
        <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>🚨 تنبيهات النظام</h3>
        
        {systemAlerts.map(alert => (
          <div key={alert.id} style={{
            background: 'rgba(255,255,255,0.15)',
            padding: '15px',
            borderRadius: '10px',
            margin: '10px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: `2px solid ${alert.type === 'success' ? '#4CAF50' : alert.type === 'warning' ? '#FF9800' : '#2196F3'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '1.5em', marginRight: '10px' }}>
                {alert.type === 'success' ? '✅' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
              <span>{alert.message}</span>
            </div>
            <span style={{ fontSize: '12px', opacity: 0.8 }}>
              {new Date(alert.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: '30px',
        padding: '20px',
        fontSize: '14px',
        color: '#B0BEC5'
      }}>
        <p>📊 <strong>مراقبة شاملة:</strong> تتبع جميع جوانب الأداء في الوقت الفعلي</p>
        <p>⚡ <strong>تحديث مستمر:</strong> بيانات محدثة كل 3 ثوانٍ</p>
        <p>🎯 <strong>تحليل متقدم:</strong> مقاييس مالية وتقنية متخصصة</p>
        <p>🚨 <strong>تنبيهات ذكية:</strong> إشعارات فورية للأحداث المهمة</p>
      </div>
    </div>
  );
};

export default PerformanceMonitoringSystem;
