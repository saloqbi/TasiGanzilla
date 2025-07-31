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

// Ø£Ù†ÙˆØ§Ø¹ Ø§Ù„Ø´Ù…ÙˆØ¹ Ø§Ù„ÙŠØ§Ø¨Ø§Ù†ÙŠØ© Ø§Ù„Ù…ØªÙ‚Ø¯Ù…Ø©
const CANDLESTICK_PATTERNS = {
  bullish: {
    hammer: { name: 'Ø§Ù„Ù…Ø·Ø±Ù‚Ø©', reliability: 0.7, reversal: true },
    inverted_hammer: { name: 'Ø§Ù„Ù…Ø·Ø±Ù‚Ø© Ø§Ù„Ù…Ù‚Ù„ÙˆØ¨Ø©', reliability: 0.6, reversal: true },
    hanging_man: { name: 'Ø§Ù„Ø±Ø¬Ù„ Ø§Ù„Ù…Ø¹Ù„Ù‚', reliability: 0.6, reversal: true },
    shooting_star: { name: 'Ø§Ù„Ù†Ø¬Ù… Ø§Ù„Ø³Ø§Ù‚Ø·', reliability: 0.7, reversal: true },
    doji: { name: 'Ø§Ù„Ø¯ÙˆØ¬ÙŠ', reliability: 0.5, reversal: true },
    dragonfly_doji: { name: 'Ø¯ÙˆØ¬ÙŠ Ø§Ù„ÙŠØ¹Ø³ÙˆØ¨', reliability: 0.6, reversal: true },
    gravestone_doji: { name: 'Ø¯ÙˆØ¬ÙŠ Ø§Ù„Ø´Ø§Ù‡Ø¯', reliability: 0.6, reversal: true },
    bullish_engulfing: { name: 'Ø§Ù„Ø§Ø¨ØªÙ„Ø§Ø¹ Ø§Ù„ØµØ§Ø¹Ø¯', reliability: 0.8, reversal: true },
    piercing_pattern: { name: 'Ù†Ù…Ø· Ø§Ù„Ø«Ù‚Ø¨', reliability: 0.7, reversal: true },
    morning_star: { name: 'Ù†Ø¬Ù…Ø© Ø§Ù„ØµØ¨Ø§Ø­', reliability: 0.8, reversal: true },
    three_white_soldiers: { name: 'Ø§Ù„Ø¬Ù†ÙˆØ¯ Ø§Ù„Ø¨ÙŠØ¶ Ø§Ù„Ø«Ù„Ø§Ø«Ø©', reliability: 0.8, continuation: true },
    // Ø£Ù†Ù…Ø§Ø· Ø¬Ø¯ÙŠØ¯Ø© Ù…ØªÙ‚Ø¯Ù…Ø©
    bullish_harami: { name: 'Ø§Ù„Ø­Ø±Ø§Ù…ÙŠ Ø§Ù„ØµØ§Ø¹Ø¯', reliability: 0.6, reversal: true },
    rising_three_methods: { name: 'Ø§Ù„Ø·Ø±Ù‚ Ø§Ù„Ø«Ù„Ø§Ø« Ø§Ù„ØµØ§Ø¹Ø¯Ø©', reliability: 0.7, continuation: true },
    tweezer_bottom: { name: 'Ø§Ù„Ù…Ù„Ù‚Ø· Ø§Ù„Ø³ÙÙ„ÙŠ', reliability: 0.6, reversal: true },
    abandoned_baby_bullish: { name: 'Ø§Ù„Ø·ÙÙ„ Ø§Ù„Ù…Ù‡Ø¬ÙˆØ± Ø§Ù„ØµØ§Ø¹Ø¯', reliability: 0.8, reversal: true },
    three_inside_up: { name: 'Ø§Ù„Ø«Ù„Ø§Ø«Ø© Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ© Ø§Ù„ØµØ§Ø¹Ø¯Ø©', reliability: 0.7, reversal: true }
  },
  bearish: {
    bearish_engulfing: { name: 'Ø§Ù„Ø§Ø¨ØªÙ„Ø§Ø¹ Ø§Ù„Ù‡Ø§Ø¨Ø·', reliability: 0.8, reversal: true },
    dark_cloud_cover: { name: 'ØºØ·Ø§Ø¡ Ø§Ù„Ø³Ø­Ø§Ø¨Ø© Ø§Ù„Ù…Ø¸Ù„Ù…Ø©', reliability: 0.7, reversal: true },
    evening_star: { name: 'Ù†Ø¬Ù…Ø© Ø§Ù„Ù…Ø³Ø§Ø¡', reliability: 0.8, reversal: true },
    three_black_crows: { name: 'Ø§Ù„ØºØ±Ø¨Ø§Ù† Ø§Ù„Ø³ÙˆØ¯ Ø§Ù„Ø«Ù„Ø§Ø«Ø©', reliability: 0.8, continuation: true },
    falling_three_methods: { name: 'Ø§Ù„Ø·Ø±Ù‚ Ø§Ù„Ø«Ù„Ø§Ø« Ø§Ù„Ù‡Ø§Ø¨Ø·Ø©', reliability: 0.7, continuation: true },
    // Ø£Ù†Ù…Ø§Ø· Ø¬Ø¯ÙŠØ¯Ø© Ù…ØªÙ‚Ø¯Ù…Ø©
    bearish_harami: { name: 'Ø§Ù„Ø­Ø±Ø§Ù…ÙŠ Ø§Ù„Ù‡Ø§Ø¨Ø·', reliability: 0.6, reversal: true },
    tweezer_top: { name: 'Ø§Ù„Ù…Ù„Ù‚Ø· Ø§Ù„Ø¹Ù„ÙˆÙŠ', reliability: 0.6, reversal: true },
    abandoned_baby_bearish: { name: 'Ø§Ù„Ø·ÙÙ„ Ø§Ù„Ù…Ù‡Ø¬ÙˆØ± Ø§Ù„Ù‡Ø§Ø¨Ø·', reliability: 0.8, reversal: true },
    three_inside_down: { name: 'Ø§Ù„Ø«Ù„Ø§Ø«Ø© Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ© Ø§Ù„Ù‡Ø§Ø¨Ø·Ø©', reliability: 0.7, reversal: true },
    advance_block: { name: 'Ø§Ù„ÙƒØªÙ„Ø© Ø§Ù„Ù…ØªÙ‚Ø¯Ù…Ø©', reliability: 0.6, reversal: true }
  }
};

// Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø´Ù…ÙˆØ¹ Ø§Ù„ÙŠØ§Ø¨Ø§Ù†ÙŠØ©
const CANDLESTICK_COLORS = {
  bullish: '#00FF00',      // Ø£Ø®Ø¶Ø± Ù„Ù„Ø´Ù…ÙˆØ¹ Ø§Ù„ØµØ§Ø¹Ø¯Ø©
  bearish: '#FF0000',      // Ø£Ø­Ù…Ø± Ù„Ù„Ø´Ù…ÙˆØ¹ Ø§Ù„Ù‡Ø§Ø¨Ø·Ø©
  reversal: '#FFD700',     // Ø£ØµÙØ± Ù„Ø´Ù…ÙˆØ¹ Ø§Ù„Ø§Ù†Ø¹ÙƒØ§Ø³
  doji: '#808080',         // Ø±Ù…Ø§Ø¯ÙŠ Ù„Ù„Ø¯ÙˆØ¬ÙŠ
  wick: '#000000'          // Ø£Ø³ÙˆØ¯ Ù„Ù„ÙØªØ§Ø¦Ù„
};

// Ø§Ù„Ù…Ø¤Ø´Ø±Ø§Øª Ø§Ù„ÙÙ†ÙŠØ© Ø§Ù„Ù…ØªÙ‚Ø¯Ù…Ø©
const TECHNICAL_INDICATORS = {
  sma: { name: 'Ø§Ù„Ù…ØªÙˆØ³Ø· Ø§Ù„Ø¨Ø³ÙŠØ·', periods: [20, 50, 200], color: '#FFD700' },
  ema: { name: 'Ø§Ù„Ù…ØªÙˆØ³Ø· Ø§Ù„Ø£Ø³ÙŠ', periods: [12, 26], color: '#00BFFF' },
  rsi: { name: 'Ù…Ø¤Ø´Ø± Ø§Ù„Ù‚ÙˆØ© Ø§Ù„Ù†Ø³Ø¨ÙŠØ©', period: 14, overbought: 70, oversold: 30, color: '#FF6347' },
  macd: { name: 'Ø§Ù„Ù…Ø§ÙƒØ¯', fast: 12, slow: 26, signal: 9, color: '#9370DB' },
  bollinger: { name: 'Ø¨ÙˆÙ„ÙŠÙ†Ø¬Ø± Ø¨Ø§Ù†Ø¯Ø²', period: 20, deviation: 2, color: '#FFA500' },
  stochastic: { name: 'Ø§Ù„Ù…Ø°Ø¨Ø°Ø¨ Ø§Ù„Ø¹Ø´ÙˆØ§Ø¦ÙŠ', k_period: 14, d_period: 3, color: '#32CD32' },
  williams_r: { name: 'ÙˆÙ„ÙŠØ§Ù…Ø² R', period: 14, color: '#FF69B4' },
  atr: { name: 'Ù…ØªÙˆØ³Ø· Ø§Ù„Ù…Ø¯Ù‰ Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠ', period: 14, color: '#4169E1' }
};

// API endpoints Ù„Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ©
const API_ENDPOINTS = {
  crypto: 'wss://stream.binance.com:9443/ws/',
  forex: 'https://api.exchangerate-api.com/v4/latest/',
  stocks: 'https://api.polygon.io/v2/aggs/ticker/',
  tasi: 'https://api.tadawul.com.sa/v1/data/instruments',
  commodities: 'https://api.metals.live/v1/spot'
};

// Ø¯Ø§Ù„Ø© Ù…Ø³Ø§Ø¹Ø¯Ø© Ù„ØªØ·Ø¨ÙŠÙ‚ throttle
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

// Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠØ©
const getDefaultSettings = () => ({
  timeframe: '1h',
  candleCount: 100,
  showVolume: true,
  showPatterns: true,
  language: "ar",
  enableGannIntegration: true,
  autoDetectPatterns: true,
  showTechnicalLevels: true
});

const JapaneseCandlestickContent = React.forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const animationRef = useRef(null);
  const lastUpdateTime = useRef(0);
  
  // Ø§Ø³ØªØ®Ø¯Ø§Ù… MarketData context
  const { 
    marketData, 
    priceMovements, 
    addMarketWatch, 
    removeMarketWatch,
    selectedMarkets = [],
    analysisSettings
  } = useMarketData();

  // Ø­Ø§Ù„Ø§Øª Ø§Ù„ØªØ­ÙƒÙ… ÙÙŠ Ø§Ù„Ù…ÙŠØ²Ø§Øª
  const [showMarketSelector, setShowMarketSelector] = useState(false);
  const [showTechnicalAnalysis, setShowTechnicalAnalysis] = useState(false);
  const [showMarketSettings, setShowMarketSettings] = useState(false);
  const [showTradingControlPanel, setShowTradingControlPanel] = useState(false);
  const [showMarketOverlay, setShowMarketOverlay] = useState(false);
  const [showConsensusPanel, setShowConsensusPanel] = useState(true);

  // Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø´Ù…ÙˆØ¹ Ø§Ù„ÙŠØ§Ø¨Ø§Ù†ÙŠØ©
  const [settings, setSettings] = useState(getDefaultSettings);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [candleData, setCandleData] = useState([]);
  const [detectedPatterns, setDetectedPatterns] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [volume, setVolume] = useState(0);

  // Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø§Ù„ÙÙ†ÙŠ Ø§Ù„Ù…ØªÙ‚Ø¯Ù…
  const [gannLevels, setGannLevels] = useState([]);
  const [supportResistanceLevels, setSupportResistanceLevels] = useState([]);
  const [trendLines, setTrendLines] = useState([]);
  const [fibonacciLevels, setFibonacciLevels] = useState([]);

  // Ø§Ù„Ù…Ø¤Ø´Ø±Ø§Øª Ø§Ù„ÙÙ†ÙŠØ© Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©
  const [technicalIndicators, setTechnicalIndicators] = useState({
    sma: { values: [], visible: true },
    ema: { values: [], visible: true },
    rsi: { values: [], visible: true },
    macd: { values: [], visible: false },
    bollinger: { values: [], visible: false },
    stochastic: { values: [], visible: false }
  });

  // Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ©
  const [realTimeData, setRealTimeData] = useState({
    connected: false,
    lastUpdate: null,
    websocket: null,
    selectedSymbol: 'BTCUSDT'
  });

  // Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ù…ØªÙ‚Ø¯Ù…Ø©
  const [advancedSettings, setAdvancedSettings] = useState({
    useRealData: false,
    enableAlerts: true,
    autoAnalysis: true,
    confidenceThreshold: 0.6,
    showVolumeMountains: true,
    enableSentimentAnalysis: false,
    updateSpeed: 'normal' // Ø¨Ø·ÙŠØ¡ØŒ Ø¹Ø§Ø¯ÙŠØŒ Ø³Ø±ÙŠØ¹
  });

  // Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø¹Ø±Ø¶
  const [showGrid, setShowGrid] = useState(true);
  const [showCrosshair, setShowCrosshair] = useState(true);
  const [showTechnicalIndicators, setShowTechnicalIndicators] = useState(true);
  const [showVolumeProfile, setShowVolumeProfile] = useState(true);
  const [showOrderBook, setShowOrderBook] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // Ø­Ø§Ù„Ø© Ø§Ù„ØªØ­Ø¯ÙŠØ«

  // Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø²ÙˆÙ… ÙˆØ§Ù„ØªØ­Ø±ÙŠÙƒ
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Ø§Ù„Ø£Ø³ÙˆØ§Ù‚ Ø§Ù„Ù…Ø§Ù„ÙŠØ© Ø§Ù„Ù…ØªØ§Ø­Ø©
  const availableMarkets = [
    { id: 'BTCUSDT', name: 'Bitcoin/USDT', category: 'crypto' },
    { id: 'ETHUSDT', name: 'Ethereum/USDT', category: 'crypto' },
    { id: 'EURUSD', name: 'EUR/USD', category: 'forex' },
    { id: 'GBPUSD', name: 'GBP/USD', category: 'forex' },
    { id: 'AAPL', name: 'Apple Inc.', category: 'stocks' },
    { id: 'GOOGL', name: 'Alphabet Inc.', category: 'stocks' },
    { id: '2222.SR', name: 'Ø£Ø±Ø§Ù…ÙƒÙˆ Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©', category: 'tasi' },
    { id: '1120.SR', name: 'Ø¨Ù†Ùƒ Ø§Ù„Ø±Ø§Ø¬Ø­ÙŠ', category: 'tasi' },
    { id: 'XAUUSD', name: 'Gold/USD', category: 'commodities' },
    { id: 'XAGUSD', name: 'Silver/USD', category: 'commodities' }
  ];

  // Ø§Ù„Ø£Ø·Ø± Ø§Ù„Ø²Ù…Ù†ÙŠØ© Ø§Ù„Ù…ØªØ§Ø­Ø©
  const timeframes = [
    { value: '1m', label: '1 Ø¯Ù‚ÙŠÙ‚Ø©' },
    { value: '5m', label: '5 Ø¯Ù‚Ø§Ø¦Ù‚' },
    { value: '15m', label: '15 Ø¯Ù‚ÙŠÙ‚Ø©' },
    { value: '30m', label: '30 Ø¯Ù‚ÙŠÙ‚Ø©' },
    { value: '1h', label: 'Ø³Ø§Ø¹Ø©' },
    { value: '4h', label: '4 Ø³Ø§Ø¹Ø§Øª' },
    { value: '1d', label: 'ÙŠÙˆÙ…' },
    { value: '1w', label: 'Ø£Ø³Ø¨ÙˆØ¹' },
    { value: '1M', label: 'Ø´Ù‡Ø±' }
  ];

  // Ø¯Ø§Ù„Ø© ØªÙˆÙ„ÙŠØ¯ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø´Ù…ÙˆØ¹ Ø§Ù„ØªØ¬Ø±ÙŠØ¨ÙŠØ©
  const generateCandleData = useCallback((count = 100) => {
    const candles = [];
    let currentPrice = 50000;
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
      const timestamp = new Date(now.getTime() - (count - i) * 60 * 60 * 1000);
      
      // ØªÙˆÙ„ÙŠØ¯ ØªØºÙŠÙŠØ± Ø¹Ø´ÙˆØ§Ø¦ÙŠ ÙÙŠ Ø§Ù„Ø³Ø¹Ø±
      const change = (Math.random() - 0.5) * 1000;
      const open = currentPrice;
      const close = currentPrice + change;
      const high = Math.max(open, close) + Math.random() * 500;
      const low = Math.min(open, close) - Math.random() * 500;
      const vol = Math.random() * 1000000;
      
      candles.push({
        timestamp,
        open: Math.max(low, open),
        high,
        low,
        close: Math.max(low, close),
        volume: vol
      });
      
      currentPrice = close;
    }
    
    return candles;
  }, []);

  // Ø¯Ø§Ù„Ø© Ø§ÙƒØªØ´Ø§Ù Ø£Ù†Ù…Ø§Ø· Ø§Ù„Ø´Ù…ÙˆØ¹
  const detectCandlestickPatterns = useCallback((candles) => {
    const patterns = [];
    
    for (let i = 2; i < candles.length; i++) {
      const current = candles[i];
      const previous = candles[i - 1];
      const beforePrevious = candles[i - 2];
      
      const bodySize = Math.abs(current.close - current.open);
      const upperWick = current.high - Math.max(current.open, current.close);
      const lowerWick = Math.min(current.open, current.close) - current.low;
      const totalRange = current.high - current.low;
      
      // Ø§ÙƒØªØ´Ø§Ù Ù†Ù…Ø· Ø§Ù„Ù…Ø·Ø±Ù‚Ø©
      if (bodySize < totalRange * 0.3 && lowerWick > bodySize * 2 && upperWick < bodySize * 0.5) {
        patterns.push({
          type: 'hammer',
          index: i,
          confidence: 0.7,
          signal: 'bullish_reversal',
          description: 'Ù†Ù…Ø· Ø§Ù„Ù…Ø·Ø±Ù‚Ø© - Ø¥Ø´Ø§Ø±Ø© Ø§Ù†Ø¹ÙƒØ§Ø³ ØµØ§Ø¹Ø¯'
        });
      }
      
      // Ø§ÙƒØªØ´Ø§Ù Ù†Ù…Ø· Ø§Ù„Ø§Ø¨ØªÙ„Ø§Ø¹ Ø§Ù„ØµØ§Ø¹Ø¯
      if (previous.close < previous.open && current.close > current.open &&
          current.open < previous.close && current.close > previous.open) {
        patterns.push({
          type: 'bullish_engulfing',
          index: i,
          confidence: 0.8,
          signal: 'bullish_reversal',
          description: 'Ù†Ù…Ø· Ø§Ù„Ø§Ø¨ØªÙ„Ø§Ø¹ Ø§Ù„ØµØ§Ø¹Ø¯ - Ø¥Ø´Ø§Ø±Ø© Ø§Ù†Ø¹ÙƒØ§Ø³ Ù‚ÙˆÙŠØ©'
        });
      }
      
      // Ø§ÙƒØªØ´Ø§Ù Ù†Ù…Ø· Ø§Ù„Ø§Ø¨ØªÙ„Ø§Ø¹ Ø§Ù„Ù‡Ø§Ø¨Ø·
      if (previous.close > previous.open && current.close < current.open &&
          current.open > previous.close && current.close < previous.open) {
        patterns.push({
          type: 'bearish_engulfing',
          index: i,
          confidence: 0.8,
          signal: 'bearish_reversal',
          description: 'Ù†Ù…Ø· Ø§Ù„Ø§Ø¨ØªÙ„Ø§Ø¹ Ø§Ù„Ù‡Ø§Ø¨Ø· - Ø¥Ø´Ø§Ø±Ø© Ø§Ù†Ø¹ÙƒØ§Ø³ Ù‡Ø§Ø¨Ø·Ø©'
        });
      }
      
      // Ø§ÙƒØªØ´Ø§Ù Ù†Ù…Ø· Ø§Ù„Ø¯ÙˆØ¬ÙŠ
      if (bodySize < totalRange * 0.1) {
        patterns.push({
          type: 'doji',
          index: i,
          confidence: 0.5,
          signal: 'reversal',
          description: 'Ù†Ù…Ø· Ø§Ù„Ø¯ÙˆØ¬ÙŠ - Ø¹Ø¯Ù… ÙŠÙ‚ÙŠÙ† ÙÙŠ Ø§Ù„Ø³ÙˆÙ‚'
        });
      }
      
      // Ø§ÙƒØªØ´Ø§Ù Ù†Ø¬Ù…Ø© Ø§Ù„ØµØ¨Ø§Ø­
      if (i >= 2 && 
          beforePrevious.close < beforePrevious.open &&
          Math.abs(previous.close - previous.open) < totalRange * 0.2 &&
          current.close > current.open &&
          current.close > (beforePrevious.open + beforePrevious.close) / 2) {
        patterns.push({
          type: 'morning_star',
          index: i,
          confidence: 0.8,
          signal: 'bullish_reversal',
          description: 'Ù†Ø¬Ù…Ø© Ø§Ù„ØµØ¨Ø§Ø­ - Ø¥Ø´Ø§Ø±Ø© Ø§Ù†Ø¹ÙƒØ§Ø³ ØµØ§Ø¹Ø¯ Ù‚ÙˆÙŠØ©'
        });
      }
    }
    
    return patterns;
  }, []);

  // Ø¯Ø§Ù„Ø© Ø­Ø³Ø§Ø¨ Ù…Ø³ØªÙˆÙŠØ§Øª Ø¬Ø§Ù†
  const calculateGannLevels = useCallback((price) => {
    const levels = [];
    const basePrice = Math.floor(price / 100) * 100;
    
    // Ù…Ø³ØªÙˆÙŠØ§Øª Ø¬Ø§Ù† Ø§Ù„ÙƒÙ„Ø§Ø³ÙŠÙƒÙŠØ©
    const gannAngles = [15, 26.25, 45, 63.75, 75];
    
    gannAngles.forEach(angle => {
      const factor = Math.tan(angle * Math.PI / 180);
      levels.push({
        price: basePrice + (basePrice * factor * 0.1),
        type: 'resistance',
        angle: angle,
        strength: angle === 45 ? 'strong' : 'medium'
      });
      levels.push({
        price: basePrice - (basePrice * factor * 0.1),
        type: 'support',
        angle: angle,
        strength: angle === 45 ? 'strong' : 'medium'
      });
    });
    
    return levels;
  }, []);

  // Ø¯Ø§Ù„Ø© Ø­Ø³Ø§Ø¨ Ù…Ø³ØªÙˆÙŠØ§Øª Ø§Ù„Ø¯Ø¹Ù… ÙˆØ§Ù„Ù…Ù‚Ø§ÙˆÙ…Ø©
  const calculateSupportResistance = useCallback((candles) => {
    const levels = [];
    const prices = candles.map(c => [c.high, c.low]).flat();
    const sortedPrices = [...prices].sort((a, b) => a - b);
    
    // Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† Ù…Ø³ØªÙˆÙŠØ§Øª Ø§Ù„Ø¯Ø¹Ù… ÙˆØ§Ù„Ù…Ù‚Ø§ÙˆÙ…Ø© Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ ØªÙƒØ±Ø§Ø± Ø§Ù„Ø£Ø³Ø¹Ø§Ø±
    const priceGroups = {};
    const tolerance = sortedPrices[sortedPrices.length - 1] * 0.005; // 0.5% tolerance
    
    prices.forEach(price => {
      let found = false;
      for (const groupPrice in priceGroups) {
        if (Math.abs(price - parseFloat(groupPrice)) < tolerance) {
          priceGroups[groupPrice]++;
          found = true;
          break;
        }
      }
      if (!found) {
        priceGroups[price] = 1;
      }
    });
    
    // ØªØ­ÙˆÙŠÙ„ Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø§Øª Ø¥Ù„Ù‰ Ù…Ø³ØªÙˆÙŠØ§Øª
    Object.entries(priceGroups).forEach(([price, count]) => {
      if (count >= 3) {
        levels.push({
          price: parseFloat(price),
          strength: count >= 5 ? 'strong' : 'medium',
          type: parseFloat(price) > candles[candles.length - 1].close ? 'resistance' : 'support',
          touches: count
        });
      }
    });
    
    return levels.sort((a, b) => b.touches - a.touches).slice(0, 10);
  }, []);

  // Ø¯Ø§Ù„Ø© Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…ØªÙˆØ³Ø· Ø§Ù„Ù…ØªØ­Ø±Ùƒ Ø§Ù„Ø¨Ø³ÙŠØ· (SMA)
  const calculateSMA = useCallback((prices, period) => {
    const sma = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  }, []);

  // Ø¯Ø§Ù„Ø© Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…ØªÙˆØ³Ø· Ø§Ù„Ù…ØªØ­Ø±Ùƒ Ø§Ù„Ø£Ø³ÙŠ (EMA)
  const calculateEMA = useCallback((prices, period) => {
    const ema = [];
    const multiplier = 2 / (period + 1);
    ema[0] = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema[i] = (prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
    }
    return ema;
  }, []);

  // Ø¯Ø§Ù„Ø© Ø­Ø³Ø§Ø¨ Ù…Ø¤Ø´Ø± Ø§Ù„Ù‚ÙˆØ© Ø§Ù„Ù†Ø³Ø¨ÙŠØ© (RSI)
  const calculateRSI = useCallback((prices, period = 14) => {
    const rsi = [];
    const changes = [];
    
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }
    
    for (let i = period; i < changes.length; i++) {
      const gains = changes.slice(i - period, i).filter(x => x > 0);
      const losses = changes.slice(i - period, i).filter(x => x < 0).map(x => Math.abs(x));
      
      const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0;
      const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / period : 0;
      
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
    
    return rsi;
  }, []);

  // Ø¯Ø§Ù„Ø© Ø­Ø³Ø§Ø¨ Ø¨ÙˆÙ„ÙŠÙ†Ø¬Ø± Ø¨Ø§Ù†Ø¯Ø²
  const calculateBollingerBands = useCallback((prices, period = 20, deviation = 2) => {
    const sma = calculateSMA(prices, period);
    const bands = { upper: [], middle: [], lower: [] };
    
    for (let i = 0; i < sma.length; i++) {
      const slice = prices.slice(i, i + period);
      const mean = sma[i];
      const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      
      bands.upper.push(mean + (deviation * stdDev));
      bands.middle.push(mean);
      bands.lower.push(mean - (deviation * stdDev));
    }
    
    return bands;
  }, [calculateSMA]);

  // Ø¯Ø§Ù„Ø© Ø­Ø³Ø§Ø¨ ÙØªØ±Ø© Ø§Ù„ØªØ­Ø¯ÙŠØ« Ù„Ù„Ù€ WebSocket Ø­Ø³Ø¨ Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠ
  const getWebSocketUpdateInterval = useCallback(() => {
    const intervals = {
      '1m': 1000,   // ÙƒÙ„ Ø«Ø§Ù†ÙŠØ© Ù„Ù„Ø¯Ù‚ÙŠÙ‚Ø© Ø§Ù„ÙˆØ§Ø­Ø¯Ø©
      '5m': 2000,   // ÙƒÙ„ Ø«Ø§Ù†ÙŠØªÙŠÙ† Ù„Ù„Ù€ 5 Ø¯Ù‚Ø§Ø¦Ù‚
      '15m': 5000,  // ÙƒÙ„ 5 Ø«ÙˆØ§Ù† Ù„Ù„Ù€ 15 Ø¯Ù‚ÙŠÙ‚Ø©
      '30m': 10000, // ÙƒÙ„ 10 Ø«ÙˆØ§Ù† Ù„Ù„Ù€ 30 Ø¯Ù‚ÙŠÙ‚Ø©
      '1h': 30000,  // ÙƒÙ„ 30 Ø«Ø§Ù†ÙŠØ© Ù„Ù„Ø³Ø§Ø¹Ø©
      '4h': 120000, // ÙƒÙ„ Ø¯Ù‚ÙŠÙ‚ØªÙŠÙ† Ù„Ù„Ù€ 4 Ø³Ø§Ø¹Ø§Øª
      '1d': 300000, // ÙƒÙ„ 5 Ø¯Ù‚Ø§Ø¦Ù‚ Ù„Ù„ÙŠÙˆÙ…ÙŠ
      '1w': 900000, // ÙƒÙ„ 15 Ø¯Ù‚ÙŠÙ‚Ø© Ù„Ù„Ø£Ø³Ø¨ÙˆØ¹ÙŠ
      '1M': 1800000 // ÙƒÙ„ 30 Ø¯Ù‚ÙŠÙ‚Ø© Ù„Ù„Ø´Ù‡Ø±ÙŠ
    };
    return intervals[selectedTimeframe] || 5000;
  }, [selectedTimeframe]);

  // Ø¯Ø§Ù„Ø© Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ©
  const connectToRealTimeData = useCallback((symbol) => {
    if (realTimeData.websocket) {
      realTimeData.websocket.close();
    }

    // Ù…Ø­Ø§ÙˆÙ„Ø© Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ù€ Binance WebSocket Ù„Ù„Ø¹Ù…Ù„Ø§Øª Ø§Ù„Ø±Ù‚Ù…ÙŠØ©
    if (symbol.includes('USDT')) {
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_1m`);
      
      ws.onopen = () => {
        setRealTimeData(prev => ({ ...prev, connected: true, websocket: ws }));
        console.log('ðŸ”— Ù…ØªØµÙ„ Ø¨Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ©:', symbol);
      };

      // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø­Ø³Ø¨ Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠ Ù„Ù…Ù†ØµØ§Øª Ø§Ù„ØªØ¯Ø§ÙˆÙ„
      ws.onmessage = throttle((event) => {
        try {
          const data = JSON.parse(event.data);
          const kline = data.k;
          
          if (kline && kline.x) { // Ø§Ù„Ø´Ù…Ø¹Ø© Ù…ÙƒØªÙ…Ù„Ø©
            const newCandle = {
              timestamp: new Date(kline.t),
              open: parseFloat(kline.o),
              high: parseFloat(kline.h),
              low: parseFloat(kline.l),
              close: parseFloat(kline.c),
              volume: parseFloat(kline.v)
            };

            setCandleData(prev => {
              const updated = [...prev.slice(1), newCandle];
              return updated;
            });

            setCurrentPrice(parseFloat(kline.c));
            setVolume(parseFloat(kline.v));
            setRealTimeData(prev => ({ ...prev, lastUpdate: new Date() }));
          }
        } catch (error) {
          console.error('Ø®Ø·Ø£ ÙÙŠ Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª:', error);
        }
      }, getWebSocketUpdateInterval()); // ØªØ­Ø¯ÙŠØ« Ø­Ø³Ø¨ Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠ

      ws.onerror = (error) => {
        console.error('Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø§ØªØµØ§Ù„:', error);
        setRealTimeData(prev => ({ ...prev, connected: false }));
      };

      ws.onclose = () => {
        setRealTimeData(prev => ({ ...prev, connected: false, websocket: null }));
        console.log('ðŸ”Œ Ø§Ù†Ù‚Ø·Ø¹ Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ©');
      };
    }
  }, [realTimeData.websocket, getWebSocketUpdateInterval]);

  // Ø¯Ø§Ù„Ø© Ø±Ø³Ù… Ø§Ù„Ø´Ù…ÙˆØ¹ Ø§Ù„ÙŠØ§Ø¨Ø§Ù†ÙŠØ©
  const drawCandlesticks = useCallback((ctx, candles, width, height) => {
    if (!candles || candles.length === 0) return;
    
    // Ø­Ø³Ø§Ø¨ Ø£Ø¨Ø¹Ø§Ø¯ Ø§Ù„Ø´Ù…ÙˆØ¹ Ø­Ø³Ø¨ Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠ
    const chartWidth = width - 120; // Ù…Ø³Ø§Ø­Ø© Ø£ÙƒØ¨Ø± Ù„Ù„Ù‡ÙˆØ§Ù…Ø´
    const candleSpacing = chartWidth / candles.length;
    const candleWidth = Math.min(Math.max(candleSpacing * 0.6, 2), 8); // Ø¹Ø±Ø¶ Ù…Ø­Ø¯ÙˆØ¯ Ø¨ÙŠÙ† 2-8 Ø¨ÙƒØ³Ù„
    
    // Ø­Ø³Ø§Ø¨ Ø£Ø¹Ù„Ù‰ ÙˆØ£Ù‚Ù„ Ø³Ø¹Ø±
    const prices = candles.map(c => [c.high, c.low]).flat();
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;
    
    const chartHeight = height - 200; // Ù…Ø³Ø§Ø­Ø© Ø£ÙƒØ¨Ø± Ù„Ù„Ù…Ø¤Ø´Ø±Ø§Øª
    const chartTop = 60; // Ù‡Ø§Ù…Ø´ Ø¹Ù„ÙˆÙŠ Ø£ÙƒØ¨Ø±
    
    candles.forEach((candle, index) => {
      const x = 60 + index * candleSpacing + (candleSpacing - candleWidth) / 2;
      
      // ØªØ­ÙˆÙŠÙ„ Ø§Ù„Ø£Ø³Ø¹Ø§Ø± Ø¥Ù„Ù‰ Ø¥Ø­Ø¯Ø§Ø«ÙŠØ§Øª y
      const openY = chartTop + (maxPrice - candle.open) / priceRange * chartHeight;
      const closeY = chartTop + (maxPrice - candle.close) / priceRange * chartHeight;
      const highY = chartTop + (maxPrice - candle.high) / priceRange * chartHeight;
      const lowY = chartTop + (maxPrice - candle.low) / priceRange * chartHeight;
      
      // ØªØ­Ø¯ÙŠØ¯ Ù„ÙˆÙ† Ø§Ù„Ø´Ù…Ø¹Ø©
      let candleColor = CANDLESTICK_COLORS.bullish;
      if (candle.close < candle.open) {
        candleColor = CANDLESTICK_COLORS.bearish;
      } else if (Math.abs(candle.close - candle.open) < (candle.high - candle.low) * 0.1) {
        candleColor = CANDLESTICK_COLORS.reversal;
      }
      
      // Ø±Ø³Ù… Ø§Ù„ÙØªÙŠÙ„ Ø§Ù„Ø¹Ù„ÙˆÙŠ ÙˆØ§Ù„Ø³ÙÙ„ÙŠ (Ø®Ø· Ø±ÙÙŠØ¹)
      ctx.strokeStyle = CANDLESTICK_COLORS.wick;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, highY);
      ctx.lineTo(x + candleWidth / 2, lowY);
      ctx.stroke();
      
      // Ø±Ø³Ù… Ø¬Ø³Ù… Ø§Ù„Ø´Ù…Ø¹Ø© (Ø£Ø¨Ø¹Ø§Ø¯ ØµØºÙŠØ±Ø© Ø§Ø­ØªØ±Ø§ÙÙŠØ©)
      const bodyHeight = Math.max(Math.abs(closeY - openY), 1); // Ø­Ø¯ Ø£Ø¯Ù†Ù‰ Ù„Ù„Ø§Ø±ØªÙØ§Ø¹
      const bodyTop = Math.min(openY, closeY);
      
      ctx.fillStyle = candleColor;
      ctx.strokeStyle = candleColor;
      ctx.lineWidth = 1;
      
      if (candle.close >= candle.open) {
        // Ø´Ù…Ø¹Ø© ØµØ§Ø¹Ø¯Ø© (Ù…Ø¬ÙˆÙØ© Ù…Ø¹ Ø­Ø¯ÙˆØ¯)
        ctx.strokeRect(x, bodyTop, candleWidth, bodyHeight);
      } else {
        // Ø´Ù…Ø¹Ø© Ù‡Ø§Ø¨Ø·Ø© (Ù…Ù…Ù„ÙˆØ¡Ø©)
        ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
      }
    });
  }, []);

  // Ø¯Ø§Ù„Ø© Ø±Ø³Ù… Ø§Ù„Ù…Ø³ØªÙˆÙŠØ§Øª Ø§Ù„ØªÙ‚Ù†ÙŠØ©
  const drawTechnicalLevels = useCallback((ctx, levels, width, height, maxPrice, minPrice) => {
    const priceRange = maxPrice - minPrice;
    const chartHeight = height - 100;
    const chartTop = 50;
    
    levels.forEach(level => {
      const y = chartTop + (maxPrice - level.price) / priceRange * chartHeight;
      
      // ØªØ­Ø¯ÙŠØ¯ Ù„ÙˆÙ† Ø§Ù„Ù…Ø³ØªÙˆÙ‰
      let color = level.type === 'support' ? '#00FF00' : '#FF0000';
      if (level.strength === 'strong') {
        color = level.type === 'support' ? '#008000' : '#800000';
      }
      
      ctx.strokeStyle = color;
      ctx.lineWidth = level.strength === 'strong' ? 2 : 1;
      ctx.setLineDash(level.strength === 'strong' ? [] : [5, 5]);
      
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(width - 50, y);
      ctx.stroke();
      
      // Ø¥Ø¶Ø§ÙØ© ØªØ³Ù…ÙŠØ© Ø§Ù„Ù…Ø³ØªÙˆÙ‰
      ctx.fillStyle = color;
      ctx.font = '12px Arial';
      ctx.fillText(`${level.price.toFixed(2)}`, width - 45, y - 5);
    });
    
    ctx.setLineDash([]);
  }, []);

  // Ø¯Ø§Ù„Ø© Ø±Ø³Ù… Ø£Ù†Ù…Ø§Ø· Ø§Ù„Ø´Ù…ÙˆØ¹ Ø§Ù„Ù…ÙƒØªØ´ÙØ©
  const drawPatterns = useCallback((ctx, patterns, candles, width, height, maxPrice, minPrice) => {
    const priceRange = maxPrice - minPrice;
    const chartHeight = height - 100;
    const chartTop = 50;
    const candleSpacing = (width - 100) / candles.length;
    
    patterns.forEach(pattern => {
      const candle = candles[pattern.index];
      const x = 50 + pattern.index * candleSpacing;
      const y = chartTop + (maxPrice - candle.high) / priceRange * chartHeight - 20;
      
      // Ø±Ø³Ù… Ø±Ù…Ø² Ø§Ù„Ù†Ù…Ø·
      ctx.fillStyle = pattern.signal.includes('bullish') ? '#00FF00' : 
                     pattern.signal.includes('bearish') ? '#FF0000' : '#FFD700';
      ctx.font = 'bold 16px Arial';
      
      let symbol = 'â­';
      if (pattern.type.includes('hammer')) symbol = 'ðŸ”¨';
      else if (pattern.type.includes('engulfing')) symbol = 'ðŸ”¥';
      else if (pattern.type.includes('doji')) symbol = 'âž•';
      else if (pattern.type.includes('star')) symbol = 'â­';
      
      ctx.fillText(symbol, x, y);
      
      // Ø±Ø³Ù… Ø®Ø· Ù„Ù„Ø¥Ø´Ø§Ø±Ø©
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 5);
      ctx.lineTo(x + 8, y + 25);
      ctx.stroke();
    });
  }, []);

  // Ø¯Ø§Ù„Ø© Ø±Ø³Ù… Ø§Ù„Ù…Ø¤Ø´Ø±Ø§Øª Ø§Ù„ÙÙ†ÙŠØ©
  const drawTechnicalIndicators = useCallback((ctx, candles, indicators, width, height, maxPrice, minPrice) => {
    const priceRange = maxPrice - minPrice;
    const chartHeight = height - 200; // ØªØ±Ùƒ Ù…Ø³Ø§Ø­Ø© Ù„Ù„Ù…Ø¤Ø´Ø±Ø§Øª ÙÙŠ Ø§Ù„Ø£Ø³ÙÙ„
    const chartTop = 50;
    const candleSpacing = (width - 100) / candles.length;
    const indicatorHeight = 100;
    const indicatorTop = height - 150;

    // Ø±Ø³Ù… Ø§Ù„Ù…ØªÙˆØ³Ø·Ø§Øª Ø§Ù„Ù…ØªØ­Ø±ÙƒØ© Ø¹Ù„Ù‰ Ø§Ù„Ø±Ø³Ù… Ø§Ù„Ø¨ÙŠØ§Ù†ÙŠ Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ
    if (indicators.sma.visible && indicators.sma.values.length > 0) {
      ctx.strokeStyle = TECHNICAL_INDICATORS.sma.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      indicators.sma.values.forEach((value, index) => {
        const x = 50 + (index + 20) * candleSpacing; // ØªØ¹Ø¯ÙŠÙ„ Ù„Ù„ÙØªØ±Ø©
        const y = chartTop + (maxPrice - value) / priceRange * chartHeight;
        
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      
      // ØªØ³Ù…ÙŠØ© Ø§Ù„Ù…Ø¤Ø´Ø±
      ctx.fillStyle = TECHNICAL_INDICATORS.sma.color;
      ctx.font = '12px Arial';
      ctx.fillText('SMA(20)', 60, chartTop + 20);
    }

    // Ø±Ø³Ù… Ø§Ù„Ù…ØªÙˆØ³Ø· Ø§Ù„Ø£Ø³ÙŠ
    if (indicators.ema.visible && indicators.ema.values.length > 0) {
      ctx.strokeStyle = TECHNICAL_INDICATORS.ema.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      indicators.ema.values.forEach((value, index) => {
        const x = 50 + index * candleSpacing;
        const y = chartTop + (maxPrice - value) / priceRange * chartHeight;
        
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      
      // ØªØ³Ù…ÙŠØ© Ø§Ù„Ù…Ø¤Ø´Ø±
      ctx.fillStyle = TECHNICAL_INDICATORS.ema.color;
      ctx.font = '12px Arial';
      ctx.fillText('EMA(12)', 60, chartTop + 35);
    }

    // Ø±Ø³Ù… RSI ÙÙŠ Ø§Ù„Ù…Ù†Ø·Ù‚Ø© Ø§Ù„Ø³ÙÙ„ÙŠØ©
    if (indicators.rsi.visible && indicators.rsi.values.length > 0) {
      // Ø®Ù„ÙÙŠØ© Ù…Ù†Ø·Ù‚Ø© RSI
      ctx.fillStyle = 'rgba(50, 50, 50, 0.3)';
      ctx.fillRect(50, indicatorTop, width - 100, indicatorHeight);
      
      // Ø®Ø·ÙˆØ· Ø§Ù„Ù…Ø±Ø¬Ø¹
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      
      // Ø®Ø· 70 (Ù…Ù†Ø·Ù‚Ø© Ø§Ù„Ø´Ø±Ø§Ø¡ Ø§Ù„Ù…ÙØ±Ø·)
      const overboughtY = indicatorTop + (100 - 70) / 100 * indicatorHeight;
      ctx.beginPath();
      ctx.moveTo(50, overboughtY);
      ctx.lineTo(width - 50, overboughtY);
      ctx.stroke();
      
      // Ø®Ø· 30 (Ù…Ù†Ø·Ù‚Ø© Ø§Ù„Ø¨ÙŠØ¹ Ø§Ù„Ù…ÙØ±Ø·)
      const oversoldY = indicatorTop + (100 - 30) / 100 * indicatorHeight;
      ctx.beginPath();
      ctx.moveTo(50, oversoldY);
      ctx.lineTo(width - 50, oversoldY);
      ctx.stroke();
      
      ctx.setLineDash([]);
      
      // Ø±Ø³Ù… Ø®Ø· RSI
      ctx.strokeStyle = TECHNICAL_INDICATORS.rsi.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      indicators.rsi.values.forEach((value, index) => {
        const x = 50 + (index + 14) * candleSpacing; // ØªØ¹Ø¯ÙŠÙ„ Ù„Ù„ÙØªØ±Ø©
        const y = indicatorTop + (100 - value) / 100 * indicatorHeight;
        
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      
      // ØªØ³Ù…ÙŠØ© Ø§Ù„Ù…Ø¤Ø´Ø±
      ctx.fillStyle = TECHNICAL_INDICATORS.rsi.color;
      ctx.font = 'bold 12px Arial';
      ctx.fillText('RSI(14)', 60, indicatorTop + 15);
      
      // Ø§Ù„Ù‚ÙŠÙ… Ø§Ù„Ù…Ø±Ø¬Ø¹ÙŠØ©
      ctx.fillStyle = '#ccc';
      ctx.font = '10px Arial';
      ctx.fillText('70', 20, overboughtY + 3);
      ctx.fillText('30', 20, oversoldY + 3);
    }
  }, []);

  // Ø¯Ø§Ù„Ø© Ø§Ù„Ø±Ø³Ù… Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    // Ù…Ø³Ø­ Ø§Ù„ÙƒØ§Ù†ÙØ§Ø³
    ctx.clearRect(0, 0, width, height);
    
    // Ø±Ø³Ù… Ø®Ù„ÙÙŠØ© Ø§Ù„Ø±Ø³Ù… Ø§Ù„Ø¨ÙŠØ§Ù†ÙŠ
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    // Ø±Ø³Ù… Ø§Ù„Ø´Ø¨ÙƒØ©
    if (showGrid) {
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
      
      // Ø®Ø·ÙˆØ· Ø¹Ù…ÙˆØ¯ÙŠØ©
      for (let i = 50; i < width - 50; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 50);
        ctx.lineTo(i, height - 50);
        ctx.stroke();
      }
      
      // Ø®Ø·ÙˆØ· Ø£ÙÙ‚ÙŠØ©
      for (let i = 50; i < height - 50; i += 40) {
        ctx.beginPath();
        ctx.moveTo(50, i);
        ctx.lineTo(width - 50, i);
        ctx.stroke();
      }
    }
    
    if (candleData.length > 0) {
      // Ø±Ø³Ù… Ø§Ù„Ø´Ù…ÙˆØ¹ Ø§Ù„ÙŠØ§Ø¨Ø§Ù†ÙŠØ©
      drawCandlesticks(ctx, candleData, width, height);
      
      // Ø­Ø³Ø§Ø¨ Ø£Ø¹Ù„Ù‰ ÙˆØ£Ù‚Ù„ Ø³Ø¹Ø± Ù„Ù„Ù…Ø³ØªÙˆÙŠØ§Øª
      const prices = candleData.map(c => [c.high, c.low]).flat();
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      
      // Ø±Ø³Ù… Ø§Ù„Ù…Ø³ØªÙˆÙŠØ§Øª Ø§Ù„ØªÙ‚Ù†ÙŠØ©
      if (showTechnicalIndicators) {
        drawTechnicalLevels(ctx, [...gannLevels, ...supportResistanceLevels], width, height, maxPrice, minPrice);
      }
      
      // Ø±Ø³Ù… Ø§Ù„Ù…Ø¤Ø´Ø±Ø§Øª Ø§Ù„ÙÙ†ÙŠØ©
      if (Object.values(technicalIndicators).some(ind => ind.visible)) {
        drawTechnicalIndicators(ctx, candleData, technicalIndicators, width, height, maxPrice, minPrice);
      }
      
      // Ø±Ø³Ù… Ø£Ù†Ù…Ø§Ø· Ø§Ù„Ø´Ù…ÙˆØ¹ Ø§Ù„Ù…ÙƒØªØ´ÙØ©
      if (settings.showPatterns) {
        drawPatterns(ctx, detectedPatterns, candleData, width, height, maxPrice, minPrice);
      }
    }
    
    // Ø±Ø³Ù… Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ø±Ø³Ù… Ø§Ù„Ø¨ÙŠØ§Ù†ÙŠ
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø´Ù…ÙˆØ¹ Ø§Ù„ÙŠØ§Ø¨Ø§Ù†ÙŠØ© - Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø§Ù„ÙÙ†ÙŠ Ø§Ù„Ù…ØªÙ‚Ø¯Ù…', width / 2, 30);
    
    ctx.textAlign = 'start';
  }, [candleData, detectedPatterns, gannLevels, supportResistanceLevels, showGrid, showTechnicalIndicators, settings.showPatterns, technicalIndicators, drawCandlesticks, drawTechnicalLevels, drawPatterns, drawTechnicalIndicators]);

  // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø¹Ù†Ø¯ ØªØºÙŠÙŠØ± Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª (Ù…Ø¹ ØªØ­ÙƒÙ… ÙÙŠ Ø§Ù„Ø³Ø±Ø¹Ø© Ø­Ø³Ø¨ Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠ)
  useEffect(() => {
    // ØªØ­Ø¯ÙŠØ¯ Ø²Ù…Ù† Ø§Ù„ØªØ£Ø®ÙŠØ± Ø­Ø³Ø¨ Ø§Ù„Ø¥Ø·Ø§Ø± Ø§Ù„Ø²Ù…Ù†ÙŠ (Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠ Ù„Ù…Ù†ØµØ§Øª Ø§Ù„ØªØ¯Ø§ÙˆÙ„)
    const getUpdateDelayByTimeframe = () => {
      const timeframeDelays = {
        '1m': 1000,   // 1 Ø«Ø§Ù†ÙŠØ© Ù„Ù„Ø¯Ù‚ÙŠÙ‚Ø© Ø§Ù„ÙˆØ§Ø­Ø¯Ø©
        '5m': 5000,   // 5 Ø«ÙˆØ§Ù† Ù„Ù„Ù€ 5 Ø¯Ù‚Ø§Ø¦Ù‚
        '15m': 15000, // 15 Ø«Ø§Ù†ÙŠØ© Ù„Ù„Ù€ 15 Ø¯Ù‚ÙŠÙ‚Ø©
        '30m': 30000, // 30 Ø«Ø§Ù†ÙŠØ© Ù„Ù„Ù€ 30 Ø¯Ù‚ÙŠÙ‚Ø©
        '1h': 60000,  // Ø¯Ù‚ÙŠÙ‚Ø© ÙˆØ§Ø­Ø¯Ø© Ù„Ù„Ø³Ø§Ø¹Ø©
        '4h': 240000, // 4 Ø¯Ù‚Ø§Ø¦Ù‚ Ù„Ù„Ù€ 4 Ø³Ø§Ø¹Ø§Øª
        '1d': 300000, // 5 Ø¯Ù‚Ø§Ø¦Ù‚ Ù„Ù„ÙŠÙˆÙ…ÙŠ
        '1w': 1800000, // 30 Ø¯Ù‚ÙŠÙ‚Ø© Ù„Ù„Ø£Ø³Ø¨ÙˆØ¹ÙŠ
        '1M': 3600000  // Ø³Ø§Ø¹Ø© Ù„Ù„Ø´Ù‡Ø±ÙŠ
      };
      
      const baseDelay = timeframeDelays[selectedTimeframe] || 5000;
      
      // ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø³Ø±Ø¹Ø© Ø­Ø³Ø¨ Ø¥Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…
      switch (advancedSettings.updateSpeed) {
        case 'slow': return baseDelay * 2; // Ø£Ø¨Ø·Ø£ Ù…Ù† Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠ
        case 'normal': return baseDelay;   // Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠ Ø§Ù„Ù‚ÙŠØ§Ø³ÙŠ
        case 'fast': return baseDelay / 2; // Ø£Ø³Ø±Ø¹ Ù…Ù† Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠ
        default: return baseDelay;
      }
    };
    
    // Ø¥Ø¶Ø§ÙØ© Ù…Ø¤Ù‚Øª Ù„ØªØ£Ø®ÙŠØ± Ø§Ù„ØªØ­Ø¯ÙŠØ« ÙˆØªØ¬Ù†Ø¨ Ø§Ù„Ø³Ø±Ø¹Ø© Ø§Ù„Ù…ÙØ±Ø·Ø©
    const updateTimer = setTimeout(() => {
      setIsUpdating(true); // Ø¨Ø¯Ø¡ Ø§Ù„ØªØ­Ø¯ÙŠØ«
      
      const newCandleData = advancedSettings.useRealData ? candleData : generateCandleData(settings.candleCount);
      
      if (!advancedSettings.useRealData) {
        setCandleData(newCandleData);
      }
      
      if (newCandleData.length > 0) {
        const patterns = detectCandlestickPatterns(newCandleData);
        setDetectedPatterns(patterns);
        
        const currentCandle = newCandleData[newCandleData.length - 1];
        setCurrentPrice(currentCandle.close);
        setPriceChange(currentCandle.close - newCandleData[newCandleData.length - 2]?.close || 0);
        setVolume(currentCandle.volume);
        
        // Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…Ø¤Ø´Ø±Ø§Øª Ø§Ù„ÙÙ†ÙŠØ©
        const closePrices = newCandleData.map(c => c.close);
        
        // Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…ØªÙˆØ³Ø·Ø§Øª Ø§Ù„Ù…ØªØ­Ø±ÙƒØ©
        if (closePrices.length >= 20) {
          const smaValues = calculateSMA(closePrices, 20);
          const emaValues = calculateEMA(closePrices, 12);
          const rsiValues = calculateRSI(closePrices, 14);
          
          setTechnicalIndicators(prev => ({
            ...prev,
            sma: { ...prev.sma, values: smaValues },
            ema: { ...prev.ema, values: emaValues },
            rsi: { ...prev.rsi, values: rsiValues }
          }));
        }
        
        if (settings.enableGannIntegration) {
          const gann = calculateGannLevels(currentCandle.close);
          setGannLevels(gann);
        }
        
        const sr = calculateSupportResistance(newCandleData);
        setSupportResistanceLevels(sr);
      }
      
      setIsUpdating(false); // Ø§Ù†ØªÙ‡Ø§Ø¡ Ø§Ù„ØªØ­Ø¯ÙŠØ«
    }, getUpdateDelayByTimeframe()); // Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠ Ù„Ù„ØªØ­Ø¯ÙŠØ«
    
    return () => clearTimeout(updateTimer);
  }, [settings, advancedSettings.useRealData, advancedSettings.updateSpeed, selectedTimeframe, generateCandleData, detectCandlestickPatterns, calculateGannLevels, calculateSupportResistance, calculateSMA, calculateEMA, calculateRSI, candleData]);

  // Ø±Ø³Ù… Ø§Ù„Ø±Ø³Ù… Ø§Ù„Ø¨ÙŠØ§Ù†ÙŠ Ø¹Ù†Ø¯ ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª (Ù…Ø¹ ØªØ­ÙƒÙ… ÙÙŠ Ø§Ù„Ø³Ø±Ø¹Ø©)
  useEffect(() => {
    const now = Date.now();
    // Ù…Ù†Ø¹ Ø§Ù„ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…ØªÙƒØ±Ø± - ØªØ­Ø¯ÙŠØ« ÙƒÙ„ 100ms ÙÙ‚Ø·
    if (now - lastUpdateTime.current < 100) {
      return;
    }
    
    lastUpdateTime.current = now;
    const animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, [draw]);

  // ØªÙ‡ÙŠØ¦Ø© Ø§Ù„ÙƒØ§Ù†ÙØ§Ø³
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      // ØªØ·Ø¨ÙŠÙ‚ Ù…Ø¹Ø§ÙŠÙŠØ± Ø§Ù„Ø±Ø³ÙˆÙ… Ø§Ù„Ø¨ÙŠØ§Ù†ÙŠØ© Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠØ© - Ø£Ø¨Ø¹Ø§Ø¯ Ø£ØµØºØ± ÙˆØ£ÙƒØ«Ø± Ø§Ø­ØªØ±Ø§ÙÙŠØ©
      canvas.width = Math.min(container.clientWidth, 1000); // Ø­Ø¯ Ø£Ù‚ØµÙ‰ Ù„Ù„Ø¹Ø±Ø¶
      canvas.height = Math.min(container.clientHeight, 400); // Ø­Ø¯ Ø£Ù‚ØµÙ‰ Ù„Ù„Ø§Ø±ØªÙØ§Ø¹
      draw();
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [draw]);

  // ØªÙ†Ø¸ÙŠÙ WebSocket Ø¹Ù†Ø¯ Ø¥ØºÙ„Ø§Ù‚ Ø§Ù„Ù…ÙƒÙˆÙ†
  useEffect(() => {
    return () => {
      if (realTimeData.websocket) {
        realTimeData.websocket.close();
      }
    };
  }, [realTimeData.websocket]);

  // Ù…Ø¹Ø§Ù„Ø¬Ø§Øª Ø§Ù„Ø£Ø­Ø¯Ø§Ø«
  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
    setSettings(prev => ({ ...prev, timeframe }));
  };

  const handleMarketSelect = (marketId) => {
    const market = availableMarkets.find(m => m.id === marketId);
    if (market) {
      addMarketWatch(market);
    }
  };

  // Ø£Ù†Ù…Ø§Ø· Ø§Ù„ØªØµÙ…ÙŠÙ…
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
    chartContainer: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#1a1a1a',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
      width: '100%'
    },
    canvas: {
      width: '100%',
      height: '600px',
      backgroundColor: '#1a1a1a',
      cursor: 'crosshair'
    },
    marketInfo: {
      marginBottom: '12px' // ØªÙ‚Ù„ÙŠÙ„ Ù…Ù† 20px Ø¥Ù„Ù‰ 12px
    },
    priceInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px' // ØªÙ‚Ù„ÙŠÙ„ Ù…Ù† 10px Ø¥Ù„Ù‰ 8px
    },
    price: {
      fontSize: '16px', // ØªÙ‚Ù„ÙŠÙ„ Ù…Ù† 20px Ø¥Ù„Ù‰ 16px
      fontWeight: 'bold',
      color: '#FFD700'
    },
    priceChange: {
      fontSize: '12px', // ØªÙ‚Ù„ÙŠÙ„ Ù…Ù† 14px Ø¥Ù„Ù‰ 12px
      fontWeight: 'bold'
    },
    patternsList: {
      marginBottom: '20px'
    },
    patternItem: {
      padding: '8px',
      backgroundColor: '#333',
      borderRadius: '4px',
      marginBottom: '5px',
      fontSize: '12px'
    },
    levelsList: {
      marginBottom: '20px'
    },
    levelItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '5px',
      borderBottom: '1px solid #333',
      fontSize: '12px'
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
    },
    globalMarketsSection: {
      padding: '20px',
      backgroundColor: '#1a1a1a',
      borderTop: '2px solid #333',
      marginTop: '20px'
    },
    sectionTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#FFD700',
      textAlign: 'center',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    },
    marketsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '15px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    marketCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '2px solid #333',
      borderRadius: '12px',
      padding: '20px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textAlign: 'center',
      position: 'relative',
      backdropFilter: 'blur(5px)'
    },
    selectedMarketCard: {
      border: '2px solid #FFD700',
      background: 'rgba(255, 215, 0, 0.1)',
      boxShadow: '0 8px 25px rgba(255, 215, 0, 0.3)'
    },
    marketIcon: {
      fontSize: '32px',
      marginBottom: '10px'
    },
    marketName: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#FFD700',
      marginBottom: '8px'
    },
    marketCategory: {
      fontSize: '12px',
      color: '#ccc',
      marginBottom: '10px'
    },
    selectedIndicator: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: '#4CAF50',
      color: '#fff',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '10px',
      fontWeight: 'bold'
    },
    toggleButton: {
      padding: '2px 6px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '10px',
      color: '#fff',
      transition: 'all 0.3s ease'
    },
    symbolSelect: {
      width: '100%',
      padding: '8px',
      backgroundColor: '#333',
      color: '#fff',
      border: '1px solid #555',
      borderRadius: '4px',
      fontSize: '12px'
    },
    // Ø£Ù†Ù…Ø§Ø· Ø´Ø±ÙŠØ· Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø³ÙˆÙ‚ Ø§Ù„Ø¬Ø¯ÙŠØ¯
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
    marketInfoSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minWidth: '120px'
    },
    marketInfoTitle: {
      fontSize: '12px',
      fontWeight: 'bold',
      color: '#FFD700',
      marginBottom: '5px',
      textAlign: 'center'
    },
    marketInfoContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '3px'
    },
    priceDisplay: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    priceLabel: {
      fontSize: '11px',
      color: '#ccc'
    },
    priceValue: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#FFD700'
    },
    priceChangeValue: {
      fontSize: '12px',
      fontWeight: 'bold'
    },
    volumeDisplay: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    },
    volumeLabel: {
      fontSize: '10px',
      color: '#ccc'
    },
    volumeValue: {
      fontSize: '12px',
      color: '#00BFFF'
    },
    updateInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    },
    updateLabel: {
      fontSize: '10px',
      color: '#ccc'
    },
    updateValue: {
      fontSize: '11px',
      color: '#00BFFF',
      fontWeight: 'bold'
    },
    connectionInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    },
    connectionLabel: {
      fontSize: '10px',
      color: '#ccc'
    },
    connectionValue: {
      fontSize: '11px',
      fontWeight: 'bold'
    },
    lastUpdateValue: {
      fontSize: '11px',
      color: '#ccc',
      textAlign: 'center'
    },
    // Ø£Ù†Ù…Ø§Ø· Ù‚Ø³Ù… Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ù…ØªÙ‚Ø¯Ù… Ø§Ù„Ø¬Ø¯ÙŠØ¯
    advancedAnalysisSection: {
      margin: '20px',
      padding: '20px',
      backgroundColor: 'rgba(255, 215, 0, 0.05)',
      border: '1px solid rgba(255, 215, 0, 0.2)',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)'
    },
    advancedAnalysisTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#FFD700',
      textAlign: 'center',
      marginBottom: '20px',
      borderBottom: '2px solid rgba(255, 215, 0, 0.3)',
      paddingBottom: '10px'
    },
    advancedAnalysisContent: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px'
    },
    analysisColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    analysisSubTitle: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#00BFFF',
      borderBottom: '1px solid rgba(0, 191, 255, 0.3)',
      paddingBottom: '8px',
      marginBottom: '10px'
    },
    patternsGrid: {
      display: 'grid',
      gap: '10px'
    },
    patternCard: {
      padding: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      backdropFilter: 'blur(5px)'
    },
    patternName: {
      fontSize: '12px',
      color: '#fff',
      fontWeight: 'bold',
      marginBottom: '5px'
    },
    patternConfidence: {
      fontSize: '11px',
      color: '#00FF00'
    },
    levelsGrid: {
      display: 'grid',
      gap: '8px'
    },
    levelCard: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '6px',
      backdropFilter: 'blur(5px)'
    },
    levelType: {
      fontSize: '11px',
      fontWeight: 'bold'
    },
    levelPrice: {
      fontSize: '12px',
      color: '#FFD700',
      fontWeight: 'bold'
    },
    indicatorsGrid: {
      display: 'grid',
      gap: '8px'
    },
    indicatorCard: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '6px',
      backdropFilter: 'blur(5px)'
    },
    indicatorName: {
      fontSize: '11px',
      color: '#fff'
    },
    indicatorToggle: {
      padding: '4px 8px',
      border: 'none',
      borderRadius: '4px',
      fontSize: '10px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    // Ø£Ù†Ù…Ø§Ø· Ù‚Ø³Ù… Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ù…ØªÙ‚Ø¯Ù…Ø© Ø§Ù„Ø¬Ø¯ÙŠØ¯
    advancedStatsSection: {
      margin: '20px',
      padding: '20px',
      backgroundColor: 'rgba(0, 191, 255, 0.05)',
      border: '1px solid rgba(0, 191, 255, 0.2)',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)'
    },
    advancedStatsTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#00BFFF',
      textAlign: 'center',
      marginBottom: '20px',
      borderBottom: '2px solid rgba(0, 191, 255, 0.3)',
      paddingBottom: '10px'
    },
    advancedStatsContent: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '25px'
    },
    statsColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    statsSubTitle: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#FFD700',
      borderBottom: '1px solid rgba(255, 215, 0, 0.3)',
      paddingBottom: '8px',
      marginBottom: '15px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '12px'
    },
    statCard: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 15px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      backdropFilter: 'blur(5px)',
      transition: 'all 0.3s ease'
    },
    statLabel: {
      fontSize: '12px',
      color: '#ccc',
      fontWeight: 'bold'
    },
    statValue: {
      fontSize: '12px',
      fontWeight: 'bold'
    },
    symbolSelectorCard: {
      padding: '15px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      backdropFilter: 'blur(5px)'
    },
    symbolSelectAdvanced: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#333',
      color: '#fff',
      border: '1px solid #555',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: 'bold'
    }
  };

  return (
    <div style={styles.container}>
      {/* Ø±Ø£Ø³ Ø§Ù„ØµÙØ­Ø© */}
      <div style={styles.header}>
        <div style={styles.title}>
          ðŸ“Š ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø´Ù…ÙˆØ¹ Ø§Ù„ÙŠØ§Ø¨Ø§Ù†ÙŠØ© Ø§Ù„Ù…ØªÙ‚Ø¯Ù…
        </div>
        <div style={styles.controls}>
          {/* Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø¥Ø·Ø§Ø± Ø§Ù„Ø²Ù…Ù†ÙŠ */}
          <select 
            value={selectedTimeframe}
            onChange={(e) => handleTimeframeChange(e.target.value)}
            style={styles.button}
          >
            {timeframes.map(tf => (
              <option key={tf.value} value={tf.value}>{tf.label}</option>
            ))}
          </select>
          
          {/* Ø£Ø²Ø±Ø§Ø± Ø§Ù„ØªØ­ÙƒÙ… */}
          <button 
            style={{...styles.button, ...(showMarketSelector ? styles.activeButton : {})}}
            onClick={() => setShowMarketSelector(!showMarketSelector)}
          >
            ðŸ“ˆ Ø§Ù„Ø£Ø³ÙˆØ§Ù‚
          </button>
          <button 
            style={{...styles.button, ...(showTechnicalAnalysis ? styles.activeButton : {})}}
            onClick={() => setShowTechnicalAnalysis(!showTechnicalAnalysis)}
          >
            ðŸ“Š Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø§Ù„ÙÙ†ÙŠ
          </button>
          <button 
            style={{...styles.button, ...(showMarketSettings ? styles.activeButton : {})}}
            onClick={() => setShowMarketSettings(!showMarketSettings)}
          >
            âš™ï¸ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª
          </button>
          <button 
            style={{...styles.button, ...(showTradingControlPanel ? styles.activeButton : {})}}
            onClick={() => setShowTradingControlPanel(!showTradingControlPanel)}
          >
            ðŸŽ›ï¸ Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…
          </button>
          <button 
            style={{...styles.button, backgroundColor: '#4CAF50'}}
            onClick={() => {
              document.querySelector('[data-markets-section]')?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
              });
            }}
            title="Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„ Ù„Ù„Ø£Ø³ÙˆØ§Ù‚ Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠØ©"
          >
            ðŸŒ Ø§Ù„Ø£Ø³ÙˆØ§Ù‚
          </button>
          <button 
            style={{...styles.button, backgroundColor: advancedSettings.useRealData ? '#FFD700' : '#666', color: advancedSettings.useRealData ? '#000' : '#fff'}}
            onClick={() => {
              setAdvancedSettings(prev => ({ ...prev, useRealData: !prev.useRealData }));
              if (!advancedSettings.useRealData) {
                connectToRealTimeData(realTimeData.selectedSymbol);
              }
            }}
            title="ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ©"
          >
            ðŸ“¡ {advancedSettings.useRealData ? 'Ù…Ø¨Ø§Ø´Ø±' : 'ØªØ¬Ø±ÙŠØ¨ÙŠ'}
          </button>
          <button 
            style={{...styles.button, backgroundColor: '#9370DB'}}
            onClick={() => {
              setTechnicalIndicators(prev => ({
                ...prev,
                rsi: { ...prev.rsi, visible: !prev.rsi.visible }
              }));
            }}
            title="ØªØ¨Ø¯ÙŠÙ„ Ù…Ø¤Ø´Ø± RSI"
          >
            ðŸ“Š RSI
          </button>
          <button 
            style={{...styles.button, backgroundColor: '#FF6347'}}
            onClick={() => {
              const speeds = ['slow', 'normal', 'fast'];
              const currentIndex = speeds.indexOf(advancedSettings.updateSpeed);
              const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
              setAdvancedSettings(prev => ({ ...prev, updateSpeed: nextSpeed }));
            }}
            title="ØªØºÙŠÙŠØ± Ø³Ø±Ø¹Ø© Ø§Ù„ØªØ­Ø¯ÙŠØ« Ø­Ø³Ø¨ Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠ"
          >
            âš¡ {advancedSettings.updateSpeed === 'slow' ? 'Ø¨Ø·ÙŠØ¡ (2x)' : 
                 advancedSettings.updateSpeed === 'normal' ? 'Ù‚ÙŠØ§Ø³ÙŠ (1x)' : 'Ø³Ø±ÙŠØ¹ (0.5x)'}
          </button>
        </div>
      </div>

      {/* Ø´Ø±ÙŠØ· Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø³ÙˆÙ‚ */}
      <div style={styles.marketInfoBar}>
        <div style={styles.marketInfoSection}>
          <div style={styles.marketInfoTitle}>ðŸ” Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø³ÙˆÙ‚ Ø§Ù„Ø­Ø§Ù„ÙŠ</div>
          <div style={styles.marketInfoContent}>
            <div style={styles.priceDisplay}>
              <span style={styles.priceLabel}>Ø§Ù„Ø³Ø¹Ø±:</span>
              <span style={styles.priceValue}>${currentPrice.toFixed(2)}</span>
              <span style={{
                ...styles.priceChangeValue,
                color: priceChange >= 0 ? '#00FF00' : '#FF0000'
              }}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}
              </span>
            </div>
            <div style={styles.volumeDisplay}>
              <span style={styles.volumeLabel}>Ø§Ù„Ø­Ø¬Ù…:</span>
              <span style={styles.volumeValue}>{volume.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div style={styles.marketInfoSection}>
          <div style={styles.marketInfoTitle}>â° Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„ØªØ­Ø¯ÙŠØ«</div>
          <div style={styles.marketInfoContent}>
            <div style={styles.updateInfo}>
              <span style={styles.updateLabel}>Ø§Ù„Ø¥Ø·Ø§Ø± Ø§Ù„Ø²Ù…Ù†ÙŠ:</span>
              <span style={styles.updateValue}>
                {timeframes.find(tf => tf.value === selectedTimeframe)?.label || selectedTimeframe}
              </span>
            </div>
            <div style={styles.updateInfo}>
              <span style={styles.updateLabel}>ØªØ±Ø¯Ø¯ Ø§Ù„ØªØ­Ø¯ÙŠØ«:</span>
              <span style={styles.updateValue}>
                {(() => {
                  const delays = {
                    '1m': '1 Ø«Ø§Ù†ÙŠØ©', '5m': '5 Ø«ÙˆØ§Ù†', '15m': '15 Ø«Ø§Ù†ÙŠØ©',
                    '30m': '30 Ø«Ø§Ù†ÙŠØ©', '1h': '1 Ø¯Ù‚ÙŠÙ‚Ø©', '4h': '4 Ø¯Ù‚Ø§Ø¦Ù‚',
                    '1d': '5 Ø¯Ù‚Ø§Ø¦Ù‚', '1w': '30 Ø¯Ù‚ÙŠÙ‚Ø©', '1M': '1 Ø³Ø§Ø¹Ø©'
                  };
                  return delays[selectedTimeframe] || 'Ø§ÙØªØ±Ø§Ø¶ÙŠ';
                })()}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.marketInfoSection}>
          <div style={styles.marketInfoTitle}>ðŸ”— Ø­Ø§Ù„Ø© Ø§Ù„Ø§ØªØµØ§Ù„</div>
          <div style={styles.marketInfoContent}>
            <div style={styles.connectionInfo}>
              <span style={styles.connectionLabel}>Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª:</span>
              <span style={{
                ...styles.connectionValue,
                color: advancedSettings.useRealData ? '#4CAF50' : '#FFA500'
              }}>
                {advancedSettings.useRealData ? 'Ù…Ø¨Ø§Ø´Ø±Ø©' : 'ØªØ¬Ø±ÙŠØ¨ÙŠØ©'}
              </span>
            </div>
            <div style={styles.connectionInfo}>
              <span style={styles.connectionLabel}>Ø§Ù„Ø­Ø§Ù„Ø©:</span>
              <span style={{
                ...styles.connectionValue,
                color: isUpdating ? '#FFA500' : '#4CAF50'
              }}>
                {isUpdating ? 'ÙŠØªÙ… Ø§Ù„ØªØ­Ø¯ÙŠØ«...' : 'Ù…Ø³ØªÙ‚Ø±'}
              </span>
            </div>
          </div>
        </div>

        {realTimeData.lastUpdate && (
          <div style={styles.marketInfoSection}>
            <div style={styles.marketInfoTitle}>â° Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ«</div>
            <div style={styles.marketInfoContent}>
              <span style={styles.lastUpdateValue}>
                {realTimeData.lastUpdate.toLocaleTimeString('ar')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Ù‚Ø³Ù… Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ù…ØªÙ‚Ø¯Ù… */}
      <div style={styles.advancedAnalysisSection}>
        <div style={styles.advancedAnalysisTitle}>ðŸ” ØªØ­Ù„ÙŠÙ„ Ù…ØªÙ‚Ø¯Ù…</div>
        <div style={styles.advancedAnalysisContent}>
          {/* Ø£Ù†Ù…Ø§Ø· Ø§Ù„Ø´Ù…ÙˆØ¹ Ø§Ù„Ù…ÙƒØªØ´ÙØ© */}
          <div style={styles.analysisColumn}>
            <div style={styles.analysisSubTitle}>ðŸ•¯ï¸ Ø£Ù†Ù…Ø§Ø· Ø§Ù„Ø´Ù…ÙˆØ¹</div>
            <div style={styles.patternsGrid}>
              {detectedPatterns.slice(0, 5).map((pattern, index) => (
                <div key={index} style={styles.patternCard}>
                  <div style={styles.patternName}>{pattern.description}</div>
                  <div style={styles.patternConfidence}>Ø§Ù„Ø«Ù‚Ø©: {(pattern.confidence * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Ù…Ø³ØªÙˆÙŠØ§Øª Ø§Ù„Ø¯Ø¹Ù… ÙˆØ§Ù„Ù…Ù‚Ø§ÙˆÙ…Ø© */}
          <div style={styles.analysisColumn}>
            <div style={styles.analysisSubTitle}>ðŸ“Š Ø§Ù„Ù…Ø³ØªÙˆÙŠØ§Øª</div>
            <div style={styles.levelsGrid}>
              {supportResistanceLevels.slice(0, 5).map((level, index) => (
                <div key={index} style={styles.levelCard}>
                  <span style={styles.levelType}>
                    {level.type === 'support' ? 'ðŸŸ¢ Ø¯Ø¹Ù…' : 'ðŸ”´ Ù…Ù‚Ø§ÙˆÙ…Ø©'}
                  </span>
                  <span style={styles.levelPrice}>${level.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ù…Ø³ØªÙˆÙŠØ§Øª Ø¬Ø§Ù† */}
          {settings.enableGannIntegration && (
            <div style={styles.analysisColumn}>
              <div style={styles.analysisSubTitle}>ðŸ”„ Ù…Ø³ØªÙˆÙŠØ§Øª Ø¬Ø§Ù†</div>
              <div style={styles.levelsGrid}>
                {gannLevels.slice(0, 5).map((level, index) => (
                  <div key={index} style={styles.levelCard}>
                    <span style={styles.levelType}>
                      {level.type === 'support' ? 'ðŸŸ¢' : 'ðŸ”´'} {level.angle}Â°
                    </span>
                    <span style={styles.levelPrice}>${level.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ø§Ù„Ù…Ø¤Ø´Ø±Ø§Øª Ø§Ù„ÙÙ†ÙŠØ© */}
          <div style={styles.analysisColumn}>
            <div style={styles.analysisSubTitle}>âš™ï¸ Ø§Ù„Ù…Ø¤Ø´Ø±Ø§Øª Ø§Ù„ÙÙ†ÙŠØ©</div>
            <div style={styles.indicatorsGrid}>
              {Object.entries(technicalIndicators).map(([key, indicator]) => (
                <div key={key} style={styles.indicatorCard}>
                  <span style={styles.indicatorName}>
                    {TECHNICAL_INDICATORS[key]?.name || key.toUpperCase()}
                  </span>
                  <button
                    style={{
                      ...styles.indicatorToggle,
                      backgroundColor: indicator.visible ? '#4CAF50' : '#666'
                    }}
                    onClick={() => {
                      setTechnicalIndicators(prev => ({
                        ...prev,
                        [key]: { ...prev[key], visible: !prev[key].visible }
                      }));
                    }}
                  >
                    {indicator.visible ? 'âœ…' : 'âŒ'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ù‚Ø³Ù… Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ù…ØªÙ‚Ø¯Ù…Ø© */}
      <div style={styles.advancedStatsSection}>
        <div style={styles.advancedStatsTitle}>ðŸ“Š Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ù…ØªÙ‚Ø¯Ù…Ø©</div>
        <div style={styles.advancedStatsContent}>
          
          {/* Ø­Ø§Ù„Ø© Ø§Ù„Ø§ØªØµØ§Ù„ ÙˆØ§Ù„Ù†Ø¸Ø§Ù… */}
          <div style={styles.statsColumn}>
            <div style={styles.statsSubTitle}>ðŸŒ Ø­Ø§Ù„Ø© Ø§Ù„Ø§ØªØµØ§Ù„</div>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>ðŸ“¡ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª</span>
                <span style={{
                  ...styles.statValue,
                  color: advancedSettings.useRealData ? '#4CAF50' : '#FFA500'
                }}>
                  {advancedSettings.useRealData ? 'Ù…Ø¨Ø§Ø´Ø±Ø©' : 'ØªØ¬Ø±ÙŠØ¨ÙŠØ©'}
                </span>
              </div>
              
              <div style={styles.statCard}>
                <span style={styles.statLabel}>â° Ø§Ù„Ø¥Ø·Ø§Ø± Ø§Ù„Ø²Ù…Ù†ÙŠ</span>
                <span style={{...styles.statValue, color: '#00BFFF'}}>
                  {timeframes.find(tf => tf.value === selectedTimeframe)?.label || selectedTimeframe}
                </span>
              </div>
              
              <div style={styles.statCard}>
                <span style={styles.statLabel}>âš¡ ØªØ±Ø¯Ø¯ Ø§Ù„ØªØ­Ø¯ÙŠØ«</span>
                <span style={{...styles.statValue, color: '#FFD700', fontSize: '10px'}}>
                  {(() => {
                    const delays = {
                      '1m': '1 Ø«Ø§Ù†ÙŠØ©', '5m': '5 Ø«ÙˆØ§Ù†', '15m': '15 Ø«Ø§Ù†ÙŠØ©',
                      '30m': '30 Ø«Ø§Ù†ÙŠØ©', '1h': '1 Ø¯Ù‚ÙŠÙ‚Ø©', '4h': '4 Ø¯Ù‚Ø§Ø¦Ù‚',
                      '1d': '5 Ø¯Ù‚Ø§Ø¦Ù‚', '1w': '30 Ø¯Ù‚ÙŠÙ‚Ø©', '1M': '1 Ø³Ø§Ø¹Ø©'
                    };
                    return delays[selectedTimeframe] || 'Ø§ÙØªØ±Ø§Ø¶ÙŠ';
                  })()}
                </span>
              </div>
              
              <div style={styles.statCard}>
                <span style={styles.statLabel}>ðŸš€ Ø§Ù„Ø³Ø±Ø¹Ø©</span>
                <span style={{...styles.statValue, color: '#FFD700'}}>
                  {advancedSettings.updateSpeed === 'slow' ? 'Ø¨Ø·ÙŠØ¡ (2x)' : 
                   advancedSettings.updateSpeed === 'normal' ? 'Ø¹Ø§Ø¯ÙŠ (Ù‚ÙŠØ§Ø³ÙŠ)' : 'Ø³Ø±ÙŠØ¹ (0.5x)'}
                </span>
              </div>
              
              <div style={styles.statCard}>
                <span style={styles.statLabel}>ðŸ”„ Ø§Ù„Ø­Ø§Ù„Ø©</span>
                <span style={{
                  ...styles.statValue,
                  color: isUpdating ? '#FFA500' : '#4CAF50'
                }}>
                  {isUpdating ? 'ÙŠØªÙ… Ø§Ù„ØªØ­Ø¯ÙŠØ«...' : 'Ù…Ø³ØªÙ‚Ø±'}
                </span>
              </div>
              
              <div style={styles.statCard}>
                <span style={styles.statLabel}>ðŸ”— Ø§Ù„Ø§ØªØµØ§Ù„</span>
                <span style={{
                  ...styles.statValue,
                  color: realTimeData.connected ? '#4CAF50' : '#FF0000'
                }}>
                  {realTimeData.connected ? 'Ù…ØªØµÙ„' : 'Ù…Ù†Ù‚Ø·Ø¹'}
                </span>
              </div>
              
              {realTimeData.lastUpdate && (
                <div style={styles.statCard}>
                  <span style={styles.statLabel}>â° Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ«</span>
                  <span style={{...styles.statValue, fontSize: '10px', color: '#ccc'}}>
                    {realTimeData.lastUpdate.toLocaleTimeString('ar')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø±Ù…Ø² Ù„Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ© */}
          {advancedSettings.useRealData && (
            <div style={styles.statsColumn}>
              <div style={styles.statsSubTitle}>ðŸŽ¯ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø±Ù…Ø²</div>
              <div style={styles.symbolSelectorCard}>
                <select
                  value={realTimeData.selectedSymbol}
                  onChange={(e) => {
                    const newSymbol = e.target.value;
                    setRealTimeData(prev => ({ ...prev, selectedSymbol: newSymbol }));
                    connectToRealTimeData(newSymbol);
                  }}
                  style={styles.symbolSelectAdvanced}
                >
                  <option value="BTCUSDT">Bitcoin/USDT</option>
                  <option value="ETHUSDT">Ethereum/USDT</option>
                  <option value="BNBUSDT">BNB/USDT</option>
                  <option value="ADAUSDT">Cardano/USDT</option>
                  <option value="SOLUSDT">Solana/USDT</option>
                </select>
              </div>
            </div>
          )}
          {/* Ù…Ù„Ø®Øµ Ø³Ø±ÙŠØ¹ Ù„Ù„Ù†Ø¸Ø§Ù… */}
          <div style={styles.statsColumn}>
            <div style={styles.statsSubTitle}>ðŸ“ˆ Ù…Ù„Ø®Øµ Ø³Ø±ÙŠØ¹</div>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>ðŸ”„ Ø§Ù„Ù†Ø¸Ø§Ù…</span>
                <span style={{...styles.statValue, color: '#4CAF50'}}>Ù†Ø´Ø·</span>
              </div>
              
              <div style={styles.statCard}>
                <span style={styles.statLabel}>ðŸ“Š Ø§Ù„ØªØ­Ù„ÙŠÙ„</span>
                <span style={{...styles.statValue, color: '#4CAF50'}}>Ø¬Ø§Ø±ÙŠ</span>
              </div>
              
              <div style={styles.statCard}>
                <span style={styles.statLabel}>ðŸ•¯ï¸ Ø§Ù„Ø£Ù†Ù…Ø§Ø·</span>
                <span style={{...styles.statValue, color: '#FFD700'}}>
                  {detectedPatterns.length} Ù†Ù…Ø·
                </span>
              </div>
              
              <div style={styles.statCard}>
                <span style={styles.statLabel}>ðŸ“ˆ Ø§Ù„Ù…Ø³ØªÙˆÙŠØ§Øª</span>
                <span style={{...styles.statValue, color: '#00BFFF'}}>
                  {supportResistanceLevels.length} Ù…Ø³ØªÙˆÙ‰
                </span>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Ù…Ù†Ø·Ù‚Ø© Ø§Ù„Ø±Ø³Ù… Ø§Ù„Ø¨ÙŠØ§Ù†ÙŠ */}
      <div style={styles.chartContainer}>
        <canvas 
          ref={canvasRef}
          style={{...styles.canvas, width: '100%'}}
        />
      </div>

      {/* تذييل الصفحة */}
      {/* ØªØ°ÙŠÙŠÙ„ Ø§Ù„ØµÙØ­Ø© */}
      <div style={styles.footer}>
        <div style={styles.statusGroup}>
          <span>ðŸ•¯ï¸ Ø§Ù„Ø´Ù…ÙˆØ¹: ØµØ¹ÙˆØ¯({CANDLESTICK_COLORS.bullish}) - Ù‡Ø¨ÙˆØ·({CANDLESTICK_COLORS.bearish}) - Ø§Ù†Ø¹ÙƒØ§Ø³({CANDLESTICK_COLORS.reversal})</span>
        </div>
        
        <div style={styles.statusGroup}>
          <span>ðŸŒ Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠ: ØªØ­Ø¯ÙŠØ« ÙƒÙ„ {(() => {
            const delays = {
              '1m': '1 Ø«Ø§Ù†ÙŠØ©', '5m': '5 Ø«ÙˆØ§Ù†', '15m': '15 Ø«Ø§Ù†ÙŠØ©',
              '30m': '30 Ø«Ø§Ù†ÙŠØ©', '1h': '1 Ø¯Ù‚ÙŠÙ‚Ø©', '4h': '4 Ø¯Ù‚Ø§Ø¦Ù‚',
              '1d': '5 Ø¯Ù‚Ø§Ø¦Ù‚', '1w': '30 Ø¯Ù‚ÙŠÙ‚Ø©', '1M': '1 Ø³Ø§Ø¹Ø©'
            };
            return delays[selectedTimeframe] || 'Ù‚ÙŠØ§Ø³ÙŠ';
          })()} Ù„Ù„Ø¥Ø·Ø§Ø± {timeframes.find(tf => tf.value === selectedTimeframe)?.label}</span>
          <span>ðŸ“Š Ù…Ø¹Ø§ÙŠÙŠØ±: TradingView, MetaTrader, Binance</span>
        </div>
        
        {selectedMarkets.length > 0 && (
          <div style={styles.statusGroup}>
            <span>ðŸ”„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù„Ø­Ø¸ÙŠØ© Ù…ØªØµÙ„Ø©</span>
            <span>âš¡ ØªØ­Ø¯ÙŠØ«: Ø­Ø³Ø¨ Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠ</span>
            <span>ðŸŽ¯ Ø¯Ù‚Ø© Ø§Ù„ØªØ­Ù„ÙŠÙ„: Ø¹Ø§Ù„ÙŠØ©</span>
          </div>
        )}
      </div>

      {/* Ù‚Ø³Ù… Ø§Ù„Ø£Ø³ÙˆØ§Ù‚ Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠØ© */}
      <div style={styles.globalMarketsSection} data-markets-section>
        <div style={styles.sectionTitle}>ðŸŒ Ø§Ù„Ø£Ø³ÙˆØ§Ù‚ Ø§Ù„Ù…Ø§Ù„ÙŠØ© Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠØ©</div>
        <div style={styles.marketsGrid}>
          {availableMarkets.map((market, index) => (
            <div 
              key={market.id} 
              style={{
                ...styles.marketCard,
                ...(selectedMarkets.find(m => m.id === market.id) ? styles.selectedMarketCard : {})
              }}
              onClick={() => handleMarketSelect(market.id)}
              onMouseEnter={(e) => {
                if (!selectedMarkets.find(m => m.id === market.id)) {
                  e.currentTarget.style.borderColor = '#555';
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedMarkets.find(m => m.id === market.id)) {
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div style={styles.marketIcon}>
                {market.category === 'crypto' ? 'â‚¿' : 
                 market.category === 'forex' ? 'ðŸ’±' : 
                 market.category === 'stocks' ? 'ðŸ“ˆ' : 
                 market.category === 'tasi' ? 'ðŸ›ï¸' : 'ðŸ¥‡'}
              </div>
              <div style={styles.marketName}>{market.name}</div>
              <div style={styles.marketCategory}>
                {market.category === 'crypto' ? 'Ø§Ù„Ø¹Ù…Ù„Ø§Øª Ø§Ù„Ø±Ù‚Ù…ÙŠØ©' : 
                 market.category === 'forex' ? 'Ø§Ù„Ø¹Ù…Ù„Ø§Øª Ø§Ù„Ø£Ø¬Ù†Ø¨ÙŠØ©' : 
                 market.category === 'stocks' ? 'Ø§Ù„Ø£Ø³Ù‡Ù… Ø§Ù„Ø£Ù…Ø±ÙŠÙƒÙŠØ©' : 
                 market.category === 'tasi' ? 'Ø§Ù„Ø³ÙˆÙ‚ Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠ' : 'Ø§Ù„Ø³Ù„Ø¹'}
              </div>
              {selectedMarkets.find(m => m.id === market.id) && (
                <div style={styles.selectedIndicator}>âœ… Ù…ÙØ®ØªØ§Ø±</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ø§Ù„Ù†ÙˆØ§ÙØ° Ø§Ù„Ù…Ù†Ø¨Ø«Ù‚Ø© */}
      {showMarketSelector && (
        <MarketSelector 
          onClose={() => setShowMarketSelector(false)}
          onSelectMarket={handleMarketSelect}
          availableMarkets={availableMarkets}
        />
      )}

      {showTechnicalAnalysis && (
        <TechnicalAnalysisPanel 
          onClose={() => setShowTechnicalAnalysis(false)}
          candleData={candleData}
          patterns={detectedPatterns}
        />
      )}

      {showMarketSettings && (
        <MarketDataSettings 
          onClose={() => setShowMarketSettings(false)}
          settings={settings}
          onSettingsChange={setSettings}
        />
      )}

      {showTradingControlPanel && (
        <TradingControlPanel 
          onClose={() => setShowTradingControlPanel(false)}
          currentPrice={currentPrice}
          selectedMarkets={selectedMarkets}
        />
      )}

      {/* Ù„ÙˆØ­Ø© Ø§Ù„Ø¥Ø¬Ù…Ø§Ø¹ Ù…ØªØ¹Ø¯Ø¯ Ø§Ù„Ø£Ø·Ø± Ø§Ù„Ø²Ù…Ù†ÙŠØ© */}
      {showConsensusPanel && (
        <MultiTimeframeConsensus 
          position={{ x: 20, y: 70 }}
          width={280}
          height={200}
          candleData={candleData}
          patterns={detectedPatterns}
        />
      )}
    </div>
  );
});

JapaneseCandlestickContent.displayName = 'JapaneseCandlestickContent';

// Ø§Ù„Ù…ÙƒÙˆÙ† Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ Ù…Ø¹ Provider
const JapaneseCandlestickAnalysis = React.forwardRef((props, ref) => {
  return (
    <MarketDataProvider>
      <JapaneseCandlestickContent {...props} ref={ref} />
    </MarketDataProvider>
  );
});

JapaneseCandlestickAnalysis.displayName = 'JapaneseCandlestickAnalysis';

export default JapaneseCandlestickAnalysis;

