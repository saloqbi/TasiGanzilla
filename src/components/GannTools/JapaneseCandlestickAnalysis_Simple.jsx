import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import MarketDataProvider, { useMarketData } from '../MarketData/MarketDataProvider';
import DataProvider, { useDataProvider } from '../DataProvider/DataProvider';
import MongoDBViewer from '../DataProvider/MongoDBViewer';
import MarketSelector from '../MarketData/MarketSelector';
import TechnicalAnalysisPanel from '../MarketData/TechnicalAnalysisPanel';
import MarketDataSettings from '../MarketData/MarketDataSettings';
import TradingControlPanel from '../MarketData/TradingControlPanel';
import ConsensusPanel from '../MarketData/ConsensusPanel';

// Error Boundary Component
const ErrorBoundary = React.memo(({ children }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#ff6b6b' }}>
        <h3>⚠️ حدث خطأ في تحليل الشموع اليابانية</h3>
        <button onClick={() => window.location.reload()}>إعادة تحميل</button>
      </div>
    );
  }

  return children;
});

// Main Component Content
const JapaneseCandlestickContent = React.forwardRef((props, ref) => {
  // State
  const [candleData, setCandleData] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [selectedSymbol, setSelectedSymbol] = useState('TASI');
  const [isUpdating, setIsUpdating] = useState(false);

  // Generate sample data
  const generateSampleData = useCallback(() => {
    const data = [];
    const basePrice = 100;
    
    for (let i = 0; i < 50; i++) {
      const price = basePrice + (Math.random() - 0.5) * 20;
      data.push({
        timestamp: Date.now() - (50 - i) * 60000,
        open: price,
        high: price + Math.random() * 5,
        low: price - Math.random() * 5,
        close: price + (Math.random() - 0.5) * 2,
        volume: Math.random() * 1000000
      });
    }
    
    return data;
  }, []);

  // Initialize data
  useEffect(() => {
    setCandleData(generateSampleData());
  }, [generateSampleData]);

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#FFD700', textAlign: 'center' }}>
        📈 تحليل الشموع اليابانية المتقدم
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 300px', 
        gap: '20px',
        marginTop: '20px'
      }}>
        {/* Main Chart Area */}
        <div style={{
          backgroundColor: '#2a2a2a',
          borderRadius: '8px',
          padding: '20px',
          minHeight: '500px'
        }}>
          <canvas 
            ref={ref}
            width={800}
            height={500}
            style={{
              width: '100%',
              height: '100%',
              border: '1px solid #444'
            }}
          />
        </div>

        {/* Side Panel */}
        <div style={{
          backgroundColor: '#2a2a2a',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{ color: '#FFD700', marginBottom: '15px' }}>
            🎯 إعدادات التحليل
          </h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>
              الرمز:
            </label>
            <select 
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#333',
                color: '#fff',
                border: '1px solid #555',
                borderRadius: '4px'
              }}
            >
              <option value="TASI">TASI</option>
              <option value="AAPL">AAPL</option>
              <option value="TSLA">TSLA</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>
              الإطار الزمني:
            </label>
            <select 
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#333',
                color: '#fff',
                border: '1px solid #555',
                borderRadius: '4px'
              }}
            >
              <option value="1m">1 دقيقة</option>
              <option value="5m">5 دقائق</option>
              <option value="1h">1 ساعة</option>
              <option value="1d">1 يوم</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ color: '#00FF41', marginBottom: '10px' }}>
              📊 معلومات السوق
            </h4>
            <div style={{ fontSize: '14px', color: '#ccc' }}>
              <div>عدد الشموع: {candleData.length}</div>
              <div>حالة التحديث: {isUpdating ? 'نشط' : 'متوقف'}</div>
              <div>آخر تحديث: {new Date().toLocaleString('ar-SA')}</div>
            </div>
          </div>

          <button
            onClick={() => {
              setIsUpdating(true);
              setCandleData(generateSampleData());
              setTimeout(() => setIsUpdating(false), 1000);
            }}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🔄 تحديث البيانات
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#2a2a2a',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#ccc'
      }}>
        🕯️ تحليل الشموع اليابانية المتطور - متوافق مع TradingView | MetaTrader | Binance
      </div>
    </div>
  );
});

JapaneseCandlestickContent.displayName = 'JapaneseCandlestickContent';

// Main Component
const JapaneseCandlestickAnalysis = React.forwardRef((props, ref) => {
  return (
    <ErrorBoundary>
      <DataProvider>
        <MarketDataProvider>
          <JapaneseCandlestickContent ref={ref} {...props} />
        </MarketDataProvider>
      </DataProvider>
    </ErrorBoundary>
  );
});

JapaneseCandlestickAnalysis.displayName = 'JapaneseCandlestickAnalysis';

export default JapaneseCandlestickAnalysis;
