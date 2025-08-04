import React, { useState, useEffect } from 'react';
import AutoTradingSystemAI from './AutoTradingSystemAI';
import PerformanceMonitoringSystem from './PerformanceMonitoringSystem';
import AdvancedPortfolioManager from './AdvancedPortfolioManager';
import JapaneseCandlestickAnalysisAI from './JapaneseCandlestickAnalysisAI';

// 🚀 لوحة التحكم الموحدة - المرحلة الرابعة
const UnifiedTradingDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [systemStatus, setSystemStatus] = useState({
    autoTrading: true,
    monitoring: true,
    portfolio: true,
    analysis: true
  });
  
  const [overviewMetrics, setOverviewMetrics] = useState({
    totalValue: 375000,
    dailyProfit: 4250,
    totalTrades: 47,
    winRate: 89.4,
    systemHealth: 98.5,
    activeStrategies: 4,
    riskLevel: 'medium',
    activeBots: 3
  });

  // عرض النظرة العامة
  const renderOverview = () => (
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
        padding: '30px',
        borderRadius: '20px',
        border: '3px solid #6B73FF'
      }}>
        <h1 style={{ margin: 0, fontSize: '2.5em' }}>🚀 لوحة التحكم الموحدة</h1>
        <h2 style={{ margin: '10px 0', color: '#E3F2FD' }}>المرحلة الرابعة - النظام المتكامل</h2>
        <p style={{ margin: 0, fontSize: '1.2em', color: '#B0BEC5' }}>
          تداول آلي ذكي + مراقبة الأداء + إدارة المحفظة
        </p>
      </div>

      {/* مؤشرات الأداء الرئيسية */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        
        <div style={{
          background: 'linear-gradient(135deg, #4CAF50, #45a049)',
          padding: '25px',
          borderRadius: '15px',
          textAlign: 'center',
          border: '3px solid #4CAF50',
          boxShadow: '0 0 20px rgba(76, 175, 80, 0.3)'
        }}>
          <div style={{ fontSize: '3em', marginBottom: '10px' }}>💰</div>
          <h3 style={{ margin: '0 0 10px 0' }}>إجمالي القيمة</h3>
          <div style={{ fontSize: '2.2em', fontWeight: 'bold' }}>
            ${overviewMetrics.totalValue.toLocaleString()}
          </div>
          <div style={{ fontSize: '1em', opacity: 0.9, marginTop: '5px' }}>
            +${overviewMetrics.dailyProfit.toLocaleString()} اليوم
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #2196F3, #1976D2)',
          padding: '25px',
          borderRadius: '15px',
          textAlign: 'center',
          border: '3px solid #2196F3',
          boxShadow: '0 0 20px rgba(33, 150, 243, 0.3)'
        }}>
          <div style={{ fontSize: '3em', marginBottom: '10px' }}>🤖</div>
          <h3 style={{ margin: '0 0 10px 0' }}>الروبوتات النشطة</h3>
          <div style={{ fontSize: '2.2em', fontWeight: 'bold' }}>
            {overviewMetrics.activeBots}/4
          </div>
          <div style={{ fontSize: '1em', opacity: 0.9, marginTop: '5px' }}>
            {overviewMetrics.totalTrades} صفقة اليوم
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #FF9800, #F57C00)',
          padding: '25px',
          borderRadius: '15px',
          textAlign: 'center',
          border: '3px solid #FF9800',
          boxShadow: '0 0 20px rgba(255, 152, 0, 0.3)'
        }}>
          <div style={{ fontSize: '3em', marginBottom: '10px' }}>🎯</div>
          <h3 style={{ margin: '0 0 10px 0' }}>معدل النجاح</h3>
          <div style={{ fontSize: '2.2em', fontWeight: 'bold' }}>
            {overviewMetrics.winRate}%
          </div>
          <div style={{ fontSize: '1em', opacity: 0.9, marginTop: '5px' }}>
            الأداء ممتاز
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #9C27B0, #7B1FA2)',
          padding: '25px',
          borderRadius: '15px',
          textAlign: 'center',
          border: '3px solid #9C27B0',
          boxShadow: '0 0 20px rgba(156, 39, 176, 0.3)'
        }}>
          <div style={{ fontSize: '3em', marginBottom: '10px' }}>📊</div>
          <h3 style={{ margin: '0 0 10px 0' }}>صحة النظام</h3>
          <div style={{ fontSize: '2.2em', fontWeight: 'bold' }}>
            {overviewMetrics.systemHealth}%
          </div>
          <div style={{ fontSize: '1em', opacity: 0.9, marginTop: '5px' }}>
            جميع الأنظمة تعمل
          </div>
        </div>
      </div>

      {/* حالة الأنظمة */}
      <div style={{
        background: 'linear-gradient(135deg, #37474f, #546e7a)',
        padding: '25px',
        borderRadius: '15px',
        border: '3px solid #607D8B',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#fff', textAlign: 'center', marginBottom: '25px' }}>
          ⚙️ حالة الأنظمة المتكاملة
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          
          <div style={{
            background: systemStatus.autoTrading ? 
              'linear-gradient(135deg, #4CAF50, #45a049)' : 
              'linear-gradient(135deg, #f44336, #d32f2f)',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ fontSize: '2em', marginBottom: '8px' }}>🤖</div>
            <h4 style={{ margin: '0 0 8px 0' }}>التداول الآلي</h4>
            <div style={{ 
              fontSize: '1.2em', 
              fontWeight: 'bold',
              color: systemStatus.autoTrading ? '#fff' : '#ffcccb'
            }}>
              {systemStatus.autoTrading ? '🟢 نشط' : '🔴 متوقف'}
            </div>
            <div style={{ fontSize: '0.9em', opacity: 0.9, marginTop: '5px' }}>
              {systemStatus.autoTrading ? '3 استراتيجيات تعمل' : 'جميع الاستراتيجيات متوقفة'}
            </div>
          </div>

          <div style={{
            background: systemStatus.monitoring ? 
              'linear-gradient(135deg, #2196F3, #1976D2)' : 
              'linear-gradient(135deg, #f44336, #d32f2f)',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ fontSize: '2em', marginBottom: '8px' }}>📊</div>
            <h4 style={{ margin: '0 0 8px 0' }}>مراقبة الأداء</h4>
            <div style={{ 
              fontSize: '1.2em', 
              fontWeight: 'bold',
              color: systemStatus.monitoring ? '#fff' : '#ffcccb'
            }}>
              {systemStatus.monitoring ? '🟢 نشط' : '🔴 متوقف'}
            </div>
            <div style={{ fontSize: '0.9em', opacity: 0.9, marginTop: '5px' }}>
              {systemStatus.monitoring ? 'تحديث كل 3 ثوانٍ' : 'لا توجد بيانات'}
            </div>
          </div>

          <div style={{
            background: systemStatus.portfolio ? 
              'linear-gradient(135deg, #9C27B0, #7B1FA2)' : 
              'linear-gradient(135deg, #f44336, #d32f2f)',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ fontSize: '2em', marginBottom: '8px' }}>💼</div>
            <h4 style={{ margin: '0 0 8px 0' }}>إدارة المحفظة</h4>
            <div style={{ 
              fontSize: '1.2em', 
              fontWeight: 'bold',
              color: systemStatus.portfolio ? '#fff' : '#ffcccb'
            }}>
              {systemStatus.portfolio ? '🟢 نشط' : '🔴 متوقف'}
            </div>
            <div style={{ fontSize: '0.9em', opacity: 0.9, marginTop: '5px' }}>
              {systemStatus.portfolio ? '12 أصل مدار' : 'إدارة معطلة'}
            </div>
          </div>

          <div style={{
            background: systemStatus.analysis ? 
              'linear-gradient(135deg, #FF9800, #F57C00)' : 
              'linear-gradient(135deg, #f44336, #d32f2f)',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ fontSize: '2em', marginBottom: '8px' }}>🧠</div>
            <h4 style={{ margin: '0 0 8px 0' }}>التحليل الذكي</h4>
            <div style={{ 
              fontSize: '1.2em', 
              fontWeight: 'bold',
              color: systemStatus.analysis ? '#fff' : '#ffcccb'
            }}>
              {systemStatus.analysis ? '🟢 نشط' : '🔴 متوقف'}
            </div>
            <div style={{ fontSize: '0.9em', opacity: 0.9, marginTop: '5px' }}>
              {systemStatus.analysis ? 'AI يحلل الأسواق' : 'تحليل معطل'}
            </div>
          </div>
        </div>
      </div>

      {/* إحصائيات متقدمة */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '20px'
      }}>
        
        <div style={{
          background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
          padding: '20px',
          borderRadius: '15px',
          border: '2px solid #2196F3'
        }}>
          <h3 style={{ color: '#fff', textAlign: 'center', marginBottom: '20px' }}>
            📈 إحصائيات التداول
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            fontSize: '14px'
          }}>
            <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <div style={{ color: '#E3F2FD', fontSize: '12px' }}>الصفقات المربحة</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4CAF50' }}>42/47</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <div style={{ color: '#E3F2FD', fontSize: '12px' }}>متوسط الربح</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFD700' }}>$156</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <div style={{ color: '#E3F2FD', fontSize: '12px' }}>أقصى ربح</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#00E676' }}>$890</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <div style={{ color: '#E3F2FD', fontSize: '12px' }}>أقصى خسارة</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f44336' }}>-$125</div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
          padding: '20px',
          borderRadius: '15px',
          border: '2px solid #4CAF50'
        }}>
          <h3 style={{ color: '#fff', textAlign: 'center', marginBottom: '20px' }}>
            ⚡ أداء النظام
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            fontSize: '14px'
          }}>
            <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <div style={{ color: '#E8F5E8', fontSize: '12px' }}>زمن الاستجابة</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#00E676' }}>4ms</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <div style={{ color: '#E8F5E8', fontSize: '12px' }}>استخدام المعالج</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFD700' }}>32%</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <div style={{ color: '#E8F5E8', fontSize: '12px' }}>استخدام الذاكرة</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#FF9800' }}>45%</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <div style={{ color: '#E8F5E8', fontSize: '12px' }}>وقت التشغيل</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2196F3' }}>24h</div>
            </div>
          </div>
        </div>
      </div>

      {/* تحكم سريع */}
      <div style={{
        background: 'linear-gradient(135deg, #d32f2f, #f44336)',
        padding: '20px',
        borderRadius: '15px',
        border: '3px solid #f44336'
      }}>
        <h3 style={{ color: '#fff', textAlign: 'center', marginBottom: '20px' }}>
          🎮 التحكم السريع
        </h3>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          
          <button
            onClick={() => setSystemStatus(prev => ({ ...prev, autoTrading: !prev.autoTrading }))}
            style={{
              background: systemStatus.autoTrading ? '#4CAF50' : '#f44336',
              color: '#fff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🤖 {systemStatus.autoTrading ? 'إيقاف' : 'تشغيل'} التداول الآلي
          </button>
          
          <button
            onClick={() => setSystemStatus(prev => ({ ...prev, monitoring: !prev.monitoring }))}
            style={{
              background: systemStatus.monitoring ? '#2196F3' : '#f44336',
              color: '#fff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            📊 {systemStatus.monitoring ? 'إيقاف' : 'تشغيل'} المراقبة
          </button>
          
          <button
            onClick={() => setSystemStatus(prev => ({ ...prev, portfolio: !prev.portfolio }))}
            style={{
              background: systemStatus.portfolio ? '#9C27B0' : '#f44336',
              color: '#fff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            💼 {systemStatus.portfolio ? 'إيقاف' : 'تشغيل'} إدارة المحفظة
          </button>
          
          <button
            onClick={() => setSystemStatus(prev => ({ ...prev, analysis: !prev.analysis }))}
            style={{
              background: systemStatus.analysis ? '#FF9800' : '#f44336',
              color: '#fff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🧠 {systemStatus.analysis ? 'إيقاف' : 'تشغيل'} التحليل الذكي
          </button>
        </div>
      </div>
    </div>
  );

  // تبديل الأنظمة
  const renderActiveView = () => {
    switch(activeView) {
      case 'overview':
        return renderOverview();
      case 'autotrading':
        return <AutoTradingSystemAI />;
      case 'monitoring':
        return <PerformanceMonitoringSystem />;
      case 'portfolio':
        return <AdvancedPortfolioManager />;
      case 'analysis':
        return <JapaneseCandlestickAnalysisAI />;
      default:
        return renderOverview();
    }
  };

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      {/* شريط التنقل */}
      <nav style={{
        background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)',
        padding: '15px 20px',
        borderBottom: '3px solid #6B73FF',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          
          {[
            { id: 'overview', icon: '🏠', label: 'النظرة العامة' },
            { id: 'autotrading', icon: '🤖', label: 'التداول الآلي' },
            { id: 'monitoring', icon: '📊', label: 'مراقبة الأداء' },
            { id: 'portfolio', icon: '💼', label: 'إدارة المحفظة' },
            { id: 'analysis', icon: '🧠', label: 'التحليل الذكي' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                background: activeView === item.id ? 
                  'linear-gradient(135deg, #6B73FF, #4CAF50)' : 
                  'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: activeView === item.id ? '2px solid #00E676' : '1px solid rgba(255,255,255,0.2)',
                padding: '12px 20px',
                borderRadius: '25px',
                fontSize: '14px',
                fontWeight: activeView === item.id ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: activeView === item.id ? '0 0 15px rgba(107, 115, 255, 0.5)' : 'none'
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* المحتوى الرئيسي */}
      {renderActiveView()}
    </div>
  );
};

export default UnifiedTradingDashboard;
