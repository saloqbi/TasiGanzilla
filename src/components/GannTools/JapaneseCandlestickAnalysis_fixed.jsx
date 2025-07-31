import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import MarketDataProvider, { useMarketData } from '../MarketData/MarketDataProvider';
import MarketSelector from '../MarketData/MarketSelector';
import TechnicalAnalysisPanel from '../MarketData/TechnicalAnalysisPanel';
import MarketDataSettings from '../MarketData/MarketDataSettings';
import TradingControlPanel from '../MarketData/TradingControlPanel';
import { availableShapes, renderSelectedShapes } from './GeometricShapes';
import MultiTimeframeConsensus from './MultiTimeframeConsensus';
import './GannMarketStyles.css';
import './GannMarketInteractionFix.css';

// أنواع الشموع اليابانية المتقدمة
const CANDLESTICK_PATTERNS = {
  bullish: {
    hammer: { name: 'المطرقة', reliability: 0.7, reversal: true },
    inverted_hammer: { name: 'المطرقة المقلوبة', reliability: 0.6, reversal: true },
    hanging_man: { name: 'الرجل المعلق', reliability: 0.6, reversal: true },
    shooting_star: { name: 'النجم الساقط', reliability: 0.7, reversal: true },
    doji: { name: 'الدوجي', reliability: 0.5, reversal: true },
    dragonfly_doji: { name: 'دوجي اليعسوب', reliability: 0.6, reversal: true },
    gravestone_doji: { name: 'دوجي الشاهد', reliability: 0.6, reversal: true },
    bullish_engulfing: { name: 'الابتلاع الصاعد', reliability: 0.8, reversal: true },
    piercing_pattern: { name: 'نمط الثقب', reliability: 0.7, reversal: true },
    morning_star: { name: 'نجمة الصباح', reliability: 0.8, reversal: true },
    three_white_soldiers: { name: 'الجنود البيض الثلاثة', reliability: 0.8, continuation: true },
    // أنماط جديدة متقدمة
    bullish_harami: { name: 'الحرامي الصاعد', reliability: 0.6, reversal: true },
    rising_three_methods: { name: 'الطرق الثلاث الصاعدة', reliability: 0.7, continuation: true },
    tweezer_bottom: { name: 'الملقط السفلي', reliability: 0.6, reversal: true },
    abandoned_baby_bullish: { name: 'الطفل المهجور الصاعد', reliability: 0.8, reversal: true },
    three_inside_up: { name: 'الثلاثة الداخلية الصاعدة', reliability: 0.7, reversal: true }
  },
  bearish: {
    bearish_engulfing: { name: 'الابتلاع الهابط', reliability: 0.8, reversal: true },
    dark_cloud_cover: { name: 'غطاء السحابة المظلمة', reliability: 0.7, reversal: true },
    evening_star: { name: 'نجمة المساء', reliability: 0.8, reversal: true },
    three_black_crows: { name: 'الغربان السود الثلاثة', reliability: 0.8, continuation: true },
    falling_three_methods: { name: 'الطرق الثلاث الهابطة', reliability: 0.7, continuation: true },
    // أنماط جديدة متقدمة
    bearish_harami: { name: 'الحرامي الهابط', reliability: 0.6, reversal: true },
    tweezer_top: { name: 'الملقط العلوي', reliability: 0.6, reversal: true },
    abandoned_baby_bearish: { name: 'الطفل المهجور الهابط', reliability: 0.8, reversal: true },
    three_inside_down: { name: 'الثلاثة الداخلية الهابطة', reliability: 0.7, reversal: true },
    advance_block: { name: 'الكتلة المتقدمة', reliability: 0.6, reversal: true }
  }
};

// إعدادات الشموع اليابانية
const CANDLESTICK_COLORS = {
  bullish: '#00FF00',      // أخضر للشموع الصاعدة
  bearish: '#FF0000',      // أحمر للشموع الهابطة
  reversal: '#FFD700',     // أصفر لشموع الانعكاس
  doji: '#808080',         // رمادي للدوجي
  wick: '#000000'          // أسود للفتائل
};

// المؤشرات الفنية المتقدمة
const TECHNICAL_INDICATORS = {
  sma: { name: 'المتوسط البسيط', periods: [20, 50, 200], color: '#FFD700' },
  ema: { name: 'المتوسط الأسي', periods: [12, 26], color: '#00BFFF' },
  rsi: { name: 'مؤشر القوة النسبية', period: 14, color: '#FF69B4' },
  macd: { name: 'مؤشر MACD', periods: [12, 26, 9], color: '#9370DB' },
  bollinger: { name: 'أحزمة بولينجر', period: 20, deviation: 2, color: '#32CD32' },
  stochastic: { name: 'مؤشر العشوائي', periods: [14, 3, 3], color: '#FF4500' }
};

// الإطارات الزمنية المتقدمة مع التحديثات السريعة
const TIMEFRAMES = [
  { value: '1m', label: '1 دقيقة', updateInterval: 1000 },
  { value: '5m', label: '5 دقائق', updateInterval: 5000 },
  { value: '15m', label: '15 دقيقة', updateInterval: 15000 },
  { value: '30m', label: '30 دقيقة', updateInterval: 30000 },
  { value: '1h', label: '1 ساعة', updateInterval: 60000 },
  { value: '4h', label: '4 ساعات', updateInterval: 240000 },
  { value: '1d', label: '1 يوم', updateInterval: 300000 },
  { value: '1w', label: '1 أسبوع', updateInterval: 1800000 },
  { value: '1M', label: '1 شهر', updateInterval: 3600000 }
];

// دالة التحكم في سرعة التحديث (Throttling)
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

export default function JapaneseCandlestickAnalysis() {
  return (
    <MarketDataProvider>
      <JapaneseCandlestickContent />
    </MarketDataProvider>
  );
}

// محتوى المكون الرئيسي
const JapaneseCandlestickContent = React.forwardRef((props, ref) => {
  // إعدادات النمط
  const styles = {
    container: {
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
      overflow: 'auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 20px',
      backgroundColor: '#1a1a1a',
      borderBottom: '2px solid #333'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#FFD700'
    },
    controls: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    },
    button: {
      padding: '8px 16px',
      backgroundColor: '#333',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'background-color 0.3s'
    },
    activeButton: {
      backgroundColor: '#FFD700',
      color: '#000'
    },
    marketInfoBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 20px',
      backgroundColor: 'rgba(255, 215, 0, 0.1)',
      border: '1px solid rgba(255, 215, 0, 0.3)',
      borderRadius: '8px',
      margin: '10px 20px',
      backdropFilter: 'blur(10px)',
      flexWrap: 'wrap',
      gap: '15px'
    },
    chartContainer: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#1a1a1a',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
      width: '100%',
      margin: '20px'
    },
    canvas: {
      width: '100%',
      height: '600px',
      backgroundColor: '#1a1a1a',
      cursor: 'crosshair'
    },
    advancedAnalysisSection: {
      margin: '20px',
      padding: '20px',
      backgroundColor: 'rgba(255, 215, 0, 0.05)',
      border: '1px solid rgba(255, 215, 0, 0.2)',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)'
    },
    advancedStatsSection: {
      margin: '20px',
      padding: '20px',
      backgroundColor: 'rgba(0, 191, 255, 0.05)',
      border: '1px solid rgba(0, 191, 255, 0.2)',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)'
    },
    footer: {
      padding: '10px 20px',
      backgroundColor: '#1a1a1a',
      borderTop: '1px solid #333',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    statusGroup: {
      display: 'flex',
      gap: '20px',
      fontSize: '12px',
      color: '#999'
    }
  };

  return (
    <div style={styles.container}>
      {/* رأس الصفحة */}
      <div style={styles.header}>
        <div style={styles.title}>🕯️ تحليل الشموع اليابانية المتقدم</div>
        <div style={styles.controls}>
          <button style={styles.button}>⏸️ إيقاف مؤقت</button>
          <button style={styles.button}>▶️ تشغيل</button>
          <button style={styles.button}>⚙️ إعدادات</button>
        </div>
      </div>

      {/* شريط معلومات السوق */}
      <div style={styles.marketInfoBar}>
        <div>
          <div style={{ color: '#FFD700', fontSize: '12px', fontWeight: 'bold' }}>💰 السعر الحالي</div>
          <div style={{ color: '#FFD700', fontSize: '16px', fontWeight: 'bold' }}>$50,234.67</div>
        </div>
        <div>
          <div style={{ color: '#ccc', fontSize: '10px' }}>📈 التغيير</div>
          <div style={{ color: '#00FF00', fontSize: '12px', fontWeight: 'bold' }}>+2.34%</div>
        </div>
        <div>
          <div style={{ color: '#ccc', fontSize: '10px' }}>📊 الحجم</div>
          <div style={{ color: '#00BFFF', fontSize: '12px' }}>1.2M</div>
        </div>
        <div>
          <div style={{ color: '#ccc', fontSize: '10px' }}>🔄 آخر تحديث</div>
          <div style={{ color: '#00BFFF', fontSize: '11px' }}>منذ ثانية</div>
        </div>
      </div>

      {/* منطقة الرسم البياني */}
      <div style={styles.chartContainer}>
        <canvas style={styles.canvas} />
      </div>

      {/* قسم التحليل المتقدم */}
      <div style={styles.advancedAnalysisSection}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFD700', textAlign: 'center', marginBottom: '20px' }}>
          🔍 تحليل متقدم
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00BFFF', marginBottom: '10px' }}>📊 الأنماط المكتشفة</div>
            <div style={{ padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#fff', marginBottom: '5px' }}>المطرقة الصاعدة</div>
              <div style={{ fontSize: '11px', color: '#00FF00' }}>موثوقية: 85%</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00BFFF', marginBottom: '10px' }}>🎯 مستويات الدعم والمقاومة</div>
            <div style={{ padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold' }}>مقاومة</span>
                <span style={{ fontSize: '12px', color: '#FFD700', fontWeight: 'bold' }}>$52,500</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* قسم الإحصائيات المتقدمة */}
      <div style={styles.advancedStatsSection}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00BFFF', textAlign: 'center', marginBottom: '20px' }}>
          📊 إحصائيات متقدمة
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#FFD700', marginBottom: '15px' }}>🌐 حالة الاتصال</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#ccc' }}>📡 البيانات</span>
              <span style={{ fontSize: '12px', color: '#4CAF50', fontWeight: 'bold' }}>مباشرة</span>
            </div>
          </div>
        </div>
      </div>

      {/* تذييل الصفحة */}
      <div style={styles.footer}>
        <div style={styles.statusGroup}>
          <span>🕯️ الشموع: صعود({CANDLESTICK_COLORS.bullish}) - هبوط({CANDLESTICK_COLORS.bearish}) - انعكاس({CANDLESTICK_COLORS.reversal})</span>
        </div>
      </div>
    </div>
  );
});
