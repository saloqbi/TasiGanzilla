import React, { useState, useEffect } from 'react';
import { useDataProvider } from '../DataProvider/DataProvider';
import { ALL_SYMBOLS_CATEGORIES } from './AllSymbolsCategories';
import './MongoDBViewer.css';

const MongoDBViewer = ({ onSymbolSelect }) => {
  const { 
    isConnected, 
    stats, 
    symbols, 
    fetchSymbolData, 
    fetchPatterns,
    API_BASE 
  } = useDataProvider();
  
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [selectedMarketCategory, setSelectedMarketCategory] = useState('us_nasdaq');
  const [symbolData, setSymbolData] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('data');
  const [dataLimit, setDataLimit] = useState(100);

  // تصنيفات الأسواق
  const marketCategories = {
    all: { 
      name: '🌍 جميع الأسواق', 
      symbols: [],
      description: 'عرض جميع الرموز المتاحة من كافة الأسواق'
    },
    us_stocks: { 
      name: '🇺🇸 الأسهم الأمريكية', 
      symbols: [
        // NASDAQ الرئيسية
        'AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NVDA', 'AMD', 'INTC',
        'NFLX', 'ADBE', 'CRM', 'COIN', 'ROKU', 'ZM', 'PYPL', 'EBAY', 'ABNB',
        'COST', 'SBUX', 'LULU', 'OKTA', 'MDB', 'CRWD', 'SNOW', 'TEAM', 'MSTR',
        // NYSE الرئيسية
        'BA', 'CAT', 'GE', 'IBM', 'JNJ', 'WMT', 'HD', 'DIS', 'NKE', 'MCD',
        'PG', 'V', 'MA', 'GS', 'BAC', 'WFC', 'UNH', 'PFE', 'CVS', 'LOW'
      ],
      description: 'أسهم الشركات الأمريكية الكبرى من NASDAQ و NYSE'
    },
    crypto: { 
      name: '🪙 العملات الرقمية', 
      symbols: ['BTCUSD', 'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT', 'SOLUSDT', 'ENSUSDT'],
      description: 'العملات المشفرة والرقمية الرئيسية من Binance و Crypto'
    },
    commodities: { 
      name: '🛢️ السلع والنفط', 
      symbols: ['UKOIL', 'CL1!', 'USO', 'DXY'],
      description: 'النفط الخام ومؤشر الدولار والسلع الأساسية'
    },
    indices: { 
      name: '� المؤشرات العالمية', 
      symbols: ['DJI', 'SPX', 'NAS100USD', 'US30USD', 'VIX', 'NIKKEI', 'SPX500'],
      description: 'المؤشرات الرئيسية العالمية ومؤشرات التقلبات'
    },
    etfs: { 
      name: '📈 صناديق الاستثمار', 
      symbols: ['SPY', 'QQQ', 'ARKK', 'XLF', 'XLE', 'XLU', 'XLV', 'XLK', 'USO'],
      description: 'صناديق الاستثمار المتداولة والقطاعية'
    },
    saudi_stocks: { 
      name: '🇸🇦 الأسهم السعودية', 
      symbols: ['TASI', 'MT30', '4011', '2240', '2001'],
      description: 'المؤشرات والأسهم السعودية من تداول'
    }
  };

  // تصفية الرموز حسب الفئة المحددة
  const getFilteredSymbols = () => {
    if (selectedMarketCategory === 'all') {
      return symbols;
    }
    
    const categorySymbols = ALL_SYMBOLS_CATEGORIES[selectedMarketCategory]?.symbols || [];
    return symbols.filter(symbolInfo => 
      categorySymbols.includes(symbolInfo.symbol)
    );
  };

  // جلب البيانات للرمز المحدد
  const handleSymbolSelect = async (symbol) => {
    if (!symbol) return;
    
    setSelectedSymbol(symbol);
    setLoading(true);
    
    try {
      // جلب بيانات الشموع
      if (activeTab === 'data') {
        const data = await fetchSymbolData(symbol, dataLimit);
        setSymbolData(data);
        
        // إبلاغ الكومبوننت الرئيسي بالتغيير
        if (onSymbolSelect && data && data.length > 0) {
          onSymbolSelect(symbol, data);
        }
      }
      
      // جلب الأنماط
      if (activeTab === 'patterns') {
        const patternsData = await fetchPatterns(symbol, 50);
        setPatterns(patternsData);
        
        // إبلاغ الكومبوننت الرئيسي بالتغيير (حتى لو كانت الأنماط فقط)
        if (onSymbolSelect) {
          onSymbolSelect(symbol, symbolData);
        }
      }
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
    } finally {
      setLoading(false);
    }
  };

  // تغيير التبويب
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (selectedSymbol) {
      handleSymbolSelect(selectedSymbol);
    }
  };

  // تغيير فئة السوق
  const handleMarketCategoryChange = (category) => {
    setSelectedMarketCategory(category);
    setSelectedSymbol(''); // إعادة تعيين الرمز المحدد
    setSymbolData([]);
    setPatterns([]);
  };

  // الحصول على إحصائيات الفئة المحددة
  const getCategoryStats = () => {
    const filteredSymbols = getFilteredSymbols();
    const totalRecords = filteredSymbols.reduce((sum, symbol) => sum + (symbol.recordCount || 0), 0);
    
    return {
      symbolsCount: filteredSymbols.length,
      totalRecords: totalRecords,
      averageRecords: filteredSymbols.length > 0 ? Math.round(totalRecords / filteredSymbols.length) : 0
    };
  };

  // تنسيق التاريخ
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // تنسيق الأرقام
  const formatNumber = (num) => {
    return parseFloat(num).toLocaleString('ar-SA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    });
  };

  return (
    <div className="mongodb-viewer">
      {/* رأس العارض */}
      <div className="viewer-header">
        <h2>📊 عارض بيانات MongoDB</h2>
        <div className="connection-indicator">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span>{isConnected ? 'متصل' : 'غير متصل'}</span>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <span className="stat-label">إجمالي السجلات</span>
              <span className="stat-value">{stats.totalRecords?.toLocaleString('ar-SA')}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <span className="stat-label">عدد الرموز</span>
              <span className="stat-value">{stats.totalSymbols}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🏢</div>
            <div className="stat-info">
              <span className="stat-label">الفئة المحددة</span>
              <span className="stat-value">
                {ALL_SYMBOLS_CATEGORIES[selectedMarketCategory]?.name.replace(/^[^\s]+\s/, '')}
              </span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔢</div>
            <div className="stat-info">
              <span className="stat-label">رموز في الفئة</span>
              <span className="stat-value">{getFilteredSymbols().length}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔍</div>
            <div className="stat-info">
              <span className="stat-label">الأنماط المكتشفة</span>
              <span className="stat-value">{stats.totalPatterns}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🕐</div>
            <div className="stat-info">
              <span className="stat-label">آخر تحديث</span>
              <span className="stat-value">
                {stats.lastUpdate ? formatDateTime(stats.lastUpdate) : 'غير متوفر'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* محدد فئة السوق */}
      <div className="market-category-selector">
        <label>🏢 فئة السوق:</label>
        
        {/* وصف الفئة المحددة */}
        <div className="category-description">
          <div className="description-text">
            <span>{ALL_SYMBOLS_CATEGORIES[selectedMarketCategory]?.description}</span>
          </div>
          <div className="category-stats">
            <span className="stat-badge">
              📊 {getCategoryStats().totalRecords.toLocaleString('ar-SA')} سجل
            </span>
            <span className="stat-badge">
              🎯 {getCategoryStats().symbolsCount} رمز
            </span>
            <span className="stat-badge">
              📈 {getCategoryStats().averageRecords.toLocaleString('ar-SA')} متوسط/رمز
            </span>
          </div>
        </div>
        
        <div className="category-buttons">
          {Object.entries(ALL_SYMBOLS_CATEGORIES).map(([key, category]) => {
            const filteredCount = key === 'all' 
              ? symbols.length 
              : symbols.filter(s => category.symbols.includes(s.symbol)).length;
            
            return (
              <button
                key={key}
                className={`category-btn ${selectedMarketCategory === key ? 'active' : ''}`}
                onClick={() => handleMarketCategoryChange(key)}
                disabled={!isConnected}
              >
                {category.name}
                <span className="category-count">({filteredCount})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* محدد الرموز */}
      <div className="symbol-selector">
        <div className="symbol-row">
          <label>🎯 اختر الرمز:</label>
          {getFilteredSymbols().length > 0 ? (
            <select 
              value={selectedSymbol} 
              onChange={(e) => handleSymbolSelect(e.target.value)}
              disabled={!isConnected}
            >
              <option value="">-- اختر رمز --</option>
              {getFilteredSymbols().map((symbolInfo) => (
                <option key={symbolInfo.symbol} value={symbolInfo.symbol}>
                  {symbolInfo.symbol} ({symbolInfo.recordCount} سجل)
                </option>
              ))}
            </select>
          ) : (
            <div className="no-symbols-message">
              <span>📭 لا توجد رموز متاحة في هذه الفئة</span>
            </div>
          )}
        </div>
        
        <div className="records-row">
          <label>📊 عدد السجلات:</label>
          <select 
            value={dataLimit} 
            onChange={(e) => setDataLimit(parseInt(e.target.value))}
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
            <option value={1000}>1000</option>
          </select>
        </div>
      </div>

      {/* التبويبات */}
      {selectedSymbol && (
        <div className="data-tabs">
          <button 
            className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => handleTabChange('data')}
          >
            📊 بيانات الشموع
          </button>
          <button 
            className={`tab-btn ${activeTab === 'patterns' ? 'active' : ''}`}
            onClick={() => handleTabChange('patterns')}
          >
            🔍 الأنماط المكتشفة
          </button>
        </div>
      )}

      {/* محتوى البيانات */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>جاري تحميل البيانات...</span>
        </div>
      ) : (
        <div className="data-content">
          {activeTab === 'data' && symbolData.length > 0 && (
            <div className="data-table-container">
              <h3>📊 بيانات الشموع - {selectedSymbol}</h3>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>التاريخ والوقت</th>
                      <th>الافتتاح</th>
                      <th>الأعلى</th>
                      <th>الأدنى</th>
                      <th>الإغلاق</th>
                      <th>الحجم</th>
                    </tr>
                  </thead>
                  <tbody>
                    {symbolData.map((row, index) => (
                      <tr key={index}>
                        <td>{formatDateTime(row.datetime)}</td>
                        <td className="price-cell">{formatNumber(row.open)}</td>
                        <td className="price-cell high">{formatNumber(row.high)}</td>
                        <td className="price-cell low">{formatNumber(row.low)}</td>
                        <td className="price-cell">{formatNumber(row.close)}</td>
                        <td className="volume-cell">{row.volume?.toLocaleString('ar-SA')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'patterns' && patterns.length > 0 && (
            <div className="patterns-container">
              <h3>🔍 الأنماط المكتشفة - {selectedSymbol}</h3>
              <div className="patterns-grid">
                {patterns.map((pattern, index) => (
                  <div key={index} className={`pattern-card ${pattern.direction}`}>
                    <div className="pattern-header">
                      <span className="pattern-name">{pattern.patternName}</span>
                      <span className="pattern-direction">
                        {pattern.direction === 'bullish' ? '📈' : 
                         pattern.direction === 'bearish' ? '📉' : '➡️'}
                      </span>
                    </div>
                    <div className="pattern-details">
                      <div className="pattern-info">
                        <span>الثقة: {(pattern.confidence * 100).toFixed(1)}%</span>
                        <span>الموثوقية: {(pattern.reliability * 100).toFixed(1)}%</span>
                      </div>
                      <div className="pattern-meta">
                        <span>المنصة: {pattern.platform}</span>
                        <span>التاريخ: {formatDateTime(pattern.datetime)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedSymbol && (
            (activeTab === 'data' && symbolData.length === 0) ||
            (activeTab === 'patterns' && patterns.length === 0)
          ) && !loading && (
            <div className="no-data">
              <span>📭 لا توجد بيانات متاحة للرمز المحدد</span>
            </div>
          )}
        </div>
      )}

      {/* معلومات إضافية */}
      {isConnected && (
        <div className="viewer-footer">
          <div className="api-info">
            <span>🔗 API: {API_BASE}</span>
            <span>🗄️ قاعدة البيانات: TradingViewData</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MongoDBViewer;
