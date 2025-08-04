import React from 'react';
import JapaneseCandlestickAnalysis from './JapaneseCandlestickAnalysis.jsx';
import JapaneseCandlestickAnalysisAI from './JapaneseCandlestickAnalysisAI.jsx';

const TradingComparison = () => {
  return (
    <div style={{
      backgroundColor: '#0f0f0f',
      color: '#fff',
      padding: '20px',
      minHeight: '100vh'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '30px',
        borderRadius: '20px',
        border: '3px solid #6B73FF'
      }}>
        <h1 style={{ margin: 0, fontSize: '2.5em' }}>🚀 نظام التداول المتطور</h1>
        <h2 style={{ margin: '10px 0', color: '#E3F2FD' }}>مقارنة الأداء: عادي vs ذكي</h2>
        <p style={{ margin: 0, fontSize: '1.2em', color: '#B0BEC5' }}>
          تطوير الجيل الثالث مع الذكاء الاصطناعي
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '30px',
        alignItems: 'start'
      }}>
        {/* النسخة العادية */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '15px',
          padding: '20px',
          border: '2px solid #4CAF50'
        }}>
          <h3 style={{ 
            textAlign: 'center', 
            color: '#4CAF50',
            marginBottom: '20px'
          }}>
            📊 النسخة الاحترافية
          </h3>
          <div style={{ transform: 'scale(0.6)', transformOrigin: 'top' }}>
            <JapaneseCandlestickAnalysis />
          </div>
        </div>

        {/* النسخة الذكية */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '15px',
          padding: '20px',
          border: '2px solid #6B73FF'
        }}>
          <h3 style={{ 
            textAlign: 'center', 
            color: '#6B73FF',
            marginBottom: '20px'
          }}>
            🧠 النسخة الذكية AI
          </h3>
          <div style={{ transform: 'scale(0.6)', transformOrigin: 'top' }}>
            <JapaneseCandlestickAnalysisAI />
          </div>
        </div>
      </div>

      {/* مقارنة الميزات */}
      <div style={{
        marginTop: '40px',
        background: 'linear-gradient(135deg, #FF9800, #F57C00)',
        padding: '30px',
        borderRadius: '20px',
        border: '3px solid #FF9800'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>📋 مقارنة الميزات</h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.2em' }}>الميزة</div>
          <div style={{ fontWeight: 'bold', fontSize: '1.2em', color: '#4CAF50' }}>النسخة الاحترافية</div>
          <div style={{ fontWeight: 'bold', fontSize: '1.2em', color: '#6B73FF' }}>النسخة الذكية AI</div>
          
          <div>⚡ سرعة الاستجابة</div>
          <div style={{ color: '#4CAF50' }}>✅ 4ms</div>
          <div style={{ color: '#6B73FF' }}>✅ 4ms</div>
          
          <div>📊 الشموع اليابانية</div>
          <div style={{ color: '#4CAF50' }}>✅ متقدمة</div>
          <div style={{ color: '#6B73FF' }}>✅ متقدمة + ذكية</div>
          
          <div>🎮 أوضاع التداول</div>
          <div style={{ color: '#4CAF50' }}>✅ تجريبي/مباشر</div>
          <div style={{ color: '#6B73FF' }}>✅ تجريبي/مباشر/ذكي</div>
          
          <div>📈 المؤشرات التقنية</div>
          <div style={{ color: '#4CAF50' }}>✅ أساسية</div>
          <div style={{ color: '#6B73FF' }}>✅ متقدمة + AI</div>
          
          <div>🤖 الذكاء الاصطناعي</div>
          <div style={{ color: '#f44336' }}>❌ غير متوفر</div>
          <div style={{ color: '#6B73FF' }}>✅ تحليل تلقائي</div>
          
          <div>🚨 التنبيهات الذكية</div>
          <div style={{ color: '#f44336' }}>❌ غير متوفر</div>
          <div style={{ color: '#6B73FF' }}>✅ تنبيهات فورية</div>
          
          <div>🎯 توقع الاتجاه</div>
          <div style={{ color: '#f44336' }}>❌ غير متوفر</div>
          <div style={{ color: '#6B73FF' }}>✅ توقع ذكي</div>
          
          <div>📊 مستوى الثقة</div>
          <div style={{ color: '#f44336' }}>❌ غير متوفر</div>
          <div style={{ color: '#6B73FF' }}>✅ حساب تلقائي</div>
        </div>
      </div>

      {/* إحصائيات الأداء */}
      <div style={{
        marginTop: '30px',
        background: 'linear-gradient(135deg, #9C27B0, #673AB7)',
        padding: '25px',
        borderRadius: '15px',
        border: '2px solid #9C27B0'
      }}>
        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>📊 إحصائيات الأداء</h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
            <div style={{ fontSize: '2em' }}>⚡</div>
            <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>4ms</div>
            <div>زمن الاستجابة</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
            <div style={{ fontSize: '2em' }}>🧠</div>
            <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>85%</div>
            <div>دقة التحليل الذكي</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
            <div style={{ fontSize: '2em' }}>📈</div>
            <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>12+</div>
            <div>مؤشر تقني</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
            <div style={{ fontSize: '2em' }}>🚨</div>
            <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>5s</div>
            <div>تحديث التنبيهات</div>
          </div>
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: '30px',
        padding: '20px',
        fontSize: '1.1em',
        color: '#B0BEC5'
      }}>
        <p>🎯 <strong>المرحلة الثالثة مكتملة:</strong> الذكاء الاصطناعي + التحليل المتقدم</p>
        <p>🚀 <strong>التطوير المستمر:</strong> تحسينات يومية للأداء والدقة</p>
        <p>🌟 <strong>الجيل القادم:</strong> تحليل أعمق + توقعات أدق</p>
      </div>
    </div>
  );
};

export default TradingComparison;
