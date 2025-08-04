import React, { useState, useEffect } from 'react';
import './DataProvider.css';

const DataProvider = ({ onDataUpdate, children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState({});
  const [symbols, setSymbols] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // جلب الإحصائيات العامة
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/stats`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setIsConnected(data.stats.dbConnection === 'متصل');
      }
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
      setError('فشل في الاتصال بالخادم');
      setIsConnected(false);
    }
  };

  // جلب قائمة الرموز المتاحة
  const fetchSymbols = async () => {
    try {
      const response = await fetch(`${API_BASE}/symbols`);
      const data = await response.json();
      
      if (data.success) {
        setSymbols(data.symbols);
      }
    } catch (error) {
      console.error('خطأ في جلب الرموز:', error);
    }
  };

  // جلب البيانات لرمز معين
  const fetchSymbolData = async (symbol, limit = 1000) => {
    try {
      const response = await fetch(`${API_BASE}/data/${encodeURIComponent(symbol)}?limit=${limit}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'فشل في جلب البيانات');
      }
    } catch (error) {
      console.error(`خطأ في جلب بيانات ${symbol}:`, error);
      throw error;
    }
  };

  // تحديث البيانات من TradingView
  const updateData = async (symbolsList = [], options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const updateRequest = {
        symbols: symbolsList.length > 0 ? symbolsList : [
          "TADAWUL:TASI", "NASDAQ:AAPL", "NASDAQ:MSFT", "NASDAQ:TSLA",
          "BINANCE:BTCUSDT", "BINANCE:ETHUSDT"
        ],
        interval: options.interval || '15m',
        n_bars: options.n_bars || 1000
      };

      const response = await fetch(`${API_BASE}/update-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateRequest)
      });

      const data = await response.json();
      
      if (data.success) {
        // تحديث الإحصائيات والرموز بعد النجاح
        await fetchStats();
        await fetchSymbols();
        
        if (onDataUpdate) {
          onDataUpdate(data);
        }
        
        return data;
      } else {
        throw new Error(data.error || 'فشل في تحديث البيانات');
      }
    } catch (error) {
      console.error('خطأ في تحديث البيانات:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // جلب أنماط الشموع لرمز معين
  const fetchPatterns = async (symbol, limit = 100) => {
    try {
      const response = await fetch(`${API_BASE}/patterns/${encodeURIComponent(symbol)}?limit=${limit}`);
      const data = await response.json();
      
      if (data.success) {
        return data.patterns;
      } else {
        throw new Error(data.error || 'فشل في جلب الأنماط');
      }
    } catch (error) {
      console.error(`خطأ في جلب أنماط ${symbol}:`, error);
      throw error;
    }
  };

  // تشغيل جلب الإحصائيات عند تحميل المكون
  useEffect(() => {
    fetchStats();
    fetchSymbols();
    
    // تحديث الإحصائيات كل 30 ثانية
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // قيم السياق المتاحة للمكونات التابعة
  const contextValue = {
    // حالة الاتصال
    isConnected,
    loading,
    error,
    
    // البيانات
    stats,
    symbols,
    
    // الوظائف
    fetchSymbolData,
    fetchPatterns,
    updateData,
    fetchStats,
    fetchSymbols,
    
    // إعدادات API
    API_BASE
  };

  return (
    <div className="data-provider">
      {/* شريط حالة الاتصال */}
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        <div className="status-indicator">
          <span className={`status-dot ${isConnected ? 'online' : 'offline'}`}></span>
          <span className="status-text">
            {isConnected ? '🟢 متصل بقاعدة البيانات' : '🔴 غير متصل'}
          </span>
        </div>
        
        {stats.totalRecords && (
          <div className="stats-summary">
            <span>📊 {stats.totalRecords.toLocaleString()} سجل</span>
            <span>📈 {stats.totalSymbols} رمز</span>
            <span>🕐 آخر تحديث: {new Date(stats.lastUpdate).toLocaleString('ar-SA')}</span>
          </div>
        )}
      </div>

      {/* شريط التحكم */}
      <div className="control-panel">
        <button 
          className="update-btn"
          onClick={() => updateData()}
          disabled={loading}
        >
          {loading ? '🔄 جاري التحديث...' : '🔄 تحديث البيانات'}
        </button>
        
        <button 
          className="refresh-btn"
          onClick={fetchStats}
          disabled={loading}
        >
          🔄 تحديث الإحصائيات
        </button>
      </div>

      {/* عرض الأخطاء */}
      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
          <button onClick={() => setError(null)}>✖</button>
        </div>
      )}

      {/* تمرير السياق للمكونات التابعة */}
      <DataContext.Provider value={contextValue}>
        {children}
      </DataContext.Provider>
    </div>
  );
};

// إنشاء السياق
const DataContext = React.createContext();

// Hook لاستخدام السياق
export const useDataProvider = () => {
  const context = React.useContext(DataContext);
  if (!context) {
    throw new Error('useDataProvider must be used within a DataProvider');
  }
  return context;
};

export default DataProvider;
