﻿import React, { useRef, useEffect, useState } from "react";
import MarketDataProvider, { useMarketData } from '../MarketData/MarketDataProvider';
import MarketSelector from '../MarketData/MarketSelector';
import TechnicalAnalysisPanel from '../MarketData/TechnicalAnalysisPanel';
import MarketDataOverlay from '../MarketData/MarketDataOverlay';
import MarketDataSettings from '../MarketData/MarketDataSettings';
import './GannMarketStyles.css'; // Ø§Ø³ØªÙŠØ±Ø§Ø¯ Ø§Ù„Ø£Ù†Ù…Ø§Ø· Ø§Ù„Ù…Ø®ØµØµØ©
import './GannMarketInteractionFix.css'; // Ø¥ØµÙ„Ø§Ø­ Ù…Ø´Ø§ÙƒÙ„ Ø§Ù„ØªÙØ§Ø¹Ù„

/*
 * Ø¯Ø§Ø¦Ø±Ø© Ø¬Ø§Ù† 360 + Ø§Ù„Ø£Ø³ÙˆØ§Ù‚ Ø§Ù„Ù…Ø§Ù„ÙŠØ©
 * =================================
 * 
 * Ø§Ù„ØªØ­Ø¯ÙŠØ«Ø§Øª Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©:
 * âœ… Ù‚Ø§Ø¦Ù…Ø© Ù…Ù†Ø¸Ù…Ø© Ù„Ù„Ø£Ø³ÙˆØ§Ù‚ Ø§Ù„Ù…Ø§Ù„ÙŠØ© ØªØ­Øª Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©
 * âœ… Ø¹Ø±Ø¶ Ø§Ù„Ø®ØµØ§Ø¦Øµ ÙˆØ§Ù„Ù…ÙŠØ²Ø§Øª ØªØ­Øª ÙƒÙ„ Ø®ÙŠØ§Ø±
 * âœ… ØªØµÙ…ÙŠÙ… Ù…Ø­Ø³Ù† Ù„Ù„Ù‚ÙˆØ§Ø¦Ù… Ø§Ù„ÙØ±Ø¹ÙŠØ©
 * âœ… Ø´Ø±ÙŠØ· Ø­Ø§Ù„Ø© Ø´Ø§Ù…Ù„ ÙŠØ¸Ù‡Ø± Ø¯Ø§Ø¦Ù…Ø§Ù‹
 * âœ… Ø£Ù„ÙˆØ§Ù† ÙˆØªÙ†Ø³ÙŠÙ‚ Ù…Ø­Ø³Ù† Ù„Ø³Ù‡ÙˆÙ„Ø© Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…
 * âœ… Ø£Ù†Ù…Ø§Ø· CSS Ù…Ø®ØµØµØ© Ù„Ù„ØªØµÙ…ÙŠÙ…
 * 
 * Ø§Ù„Ù…ÙŠØ²Ø§Øª:
 * ðŸ“Š Ø§Ù„Ø£Ø³ÙˆØ§Ù‚ Ø§Ù„Ù…Ø§Ù„ÙŠØ© - 6 Ø£Ø³ÙˆØ§Ù‚ Ø¹Ø§Ù„Ù…ÙŠØ©
 * ðŸ“ˆ Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø§Ù„ÙÙ†ÙŠ - 6 Ø£Ù†Ù…Ø§Ø· ØªØ­Ù„ÙŠÙ„ÙŠØ© 
 * ðŸŽ¨ Ø§Ù„ØªÙ„ÙˆÙŠÙ† Ø§Ù„Ø°ÙƒÙŠ - Ø­Ø³Ø¨ Ø­Ø±ÙƒØ© Ø§Ù„Ø£Ø³Ø¹Ø§Ø±
 * ðŸ”— Ø¹Ø±Ø¶ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª - Ù…Ø¨Ø§Ø´Ø±Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø¯Ø§Ø¦Ø±Ø©
 * âš™ï¸ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ù…ØªÙ‚Ø¯Ù…Ø© - ØªØ­ÙƒÙ… ÙƒØ§Ù…Ù„
 */

// Ù…ØµÙÙˆÙØ© Ø§Ù„Ø£Ø¨Ø±Ø§Ø¬ (Ø¯ÙˆØ±Ø© ÙˆØ§Ø­Ø¯Ø©)
const zodiacBase = [
  { label: "Ù†Ø§Ø± Ø§Ù„Ø­Ù…Ù„", color: "red" },
  { label: "ØªØ±Ø§Ø¨ Ø§Ù„Ø«ÙˆØ±", color: "blue" },
  { label: "Ù‡ÙˆØ§Ø¡ Ø§Ù„Ø¬ÙˆØ²Ø§Ø¡", color: "black" },
  { label: "Ù…Ø§Ø¡ Ø§Ù„Ø³Ø±Ø·Ø§Ù†", color: "red" },
  { label: "Ù†Ø§Ø± Ø§Ù„Ø§Ø³Ø¯", color: "blue" },
  { label: "ØªØ±Ø§Ø¨ Ø§Ù„Ø³Ù†Ø¨Ù„Ù‡", color: "black" },
  { label: "Ù‡ÙˆØ§Ø¡ Ø§Ù„Ù…ÙŠØ²Ø§Ù†", color: "red" },
  { label: "Ù…Ø§Ø¡ Ø§Ù„Ø¹Ù‚Ø±Ø¨", color: "blue" },
  { label: "Ù†Ø§Ø± Ø§Ù„Ù‚ÙˆØ³", color: "black" },
  { label: "ØªØ±Ø§Ø¨ Ø§Ù„Ø¬Ø¯ÙŠ", color: "red" },
  { label: "Ù‡ÙˆØ§Ø¡ Ø§Ù„Ø¯Ù„Ùˆ", color: "blue" },
  { label: "Ù…Ø§Ø¡ Ø§Ù„Ø­ÙˆØª", color: "black" },
];

// ØªÙˆÙ„ÙŠØ¯ 36 Ø®Ù„ÙŠØ© (3 Ø¯ÙˆØ±Ø§Øª)
const zodiacRing = [...zodiacBase, ...zodiacBase, ...zodiacBase];

const defaultRayColor = "#FFD700";

const getDefaultSettings = () => ({
  divisions: 36,
  levels: 8,
  startValue: 1,
  language: "ar",
  rotation: 0,
  showDegreeRing: true,
});


const GannCircle360Canvas = () => {
  // Ø¯Ø§Ù„Ø© Ù…Ø³Ø§Ø¹Ø¯Ø© Ù„Ø­Ø³Ø§Ø¨ Ø¹Ø±Ø¶ Ø§Ù„Ø­Ù„Ù‚Ø© Ø§Ù„Ù…Ø­Ø³Ù†
  const calculateRingWidth = (maxDigits, baseWidth = 100, digitScale = 20, padding = 16) => {
    return Math.max(
      baseWidth + maxDigits * digitScale + padding * 2,
      90 // Ø­Ø¯ Ø£Ø¯Ù†Ù‰ Ù„Ø¹Ø±Ø¶ Ø§Ù„Ø­Ù„Ù‚Ø©
    );
  };

  // States Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…Ù„Ù Ù†ÙØ³Ù‡
  const [scale, setScale] = useState(0.4); // Ø­Ø¬Ù… Ø£ØµØºØ± Ø¹Ù†Ø¯ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù„Ø£ÙˆÙ„ Ù…Ø±Ø©
  const [showZodiacRing, setShowZodiacRing] = useState(true);
  const [showWeekDaysRing, setShowWeekDaysRing] = useState(true);
  const [showDegreeRing, setShowDegreeRing] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showZoomControls, setShowZoomControls] = useState(true);
  const [settings, setSettings] = useState(getDefaultSettings());
  
  // States Ù„Ù„Ø³Ø§Ø¹Ø© Ø§Ù„Ø±Ù‚Ù…ÙŠØ©
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeZone, setTimeZone] = useState('riyadh'); // 'riyadh' or 'utc'
  const [showDigitalClock, setShowDigitalClock] = useState(true);

  // States Ù„Ù„Ø£Ø³ÙˆØ§Ù‚ Ø§Ù„Ù…Ø§Ù„ÙŠØ© Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©
  const [showMarketDataPanel, setShowMarketDataPanel] = useState(false);
  const [showTechnicalAnalysis, setShowTechnicalAnalysis] = useState(false);
  const [showMarketSettings, setShowMarketSettings] = useState(false);
  const [selectedMarkets, setSelectedMarkets] = useState([]);
  const [marketDataMode, setMarketDataMode] = useState('realtime'); // 'realtime' Ø£Ùˆ 'historical'
  const [priceBasedColoring, setPriceBasedColoring] = useState(true); // ØªÙ„ÙˆÙŠÙ† Ø§Ù„Ø®Ù„Ø§ÙŠØ§ Ø­Ø³Ø¨ Ø­Ø±ÙƒØ© Ø§Ù„Ø³Ø¹Ø±
  const [showMarketOverlay, setShowMarketOverlay] = useState(false); // Ø¹Ø±Ø¶ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø¹Ù„Ù‰ Ø§Ù„Ø¯Ø§Ø¦Ø±Ø©
  const [autoUpdateAnalysis, setAutoUpdateAnalysis] = useState(true); // ØªØ­Ø¯ÙŠØ« Ø§Ù„ØªØ­Ù„ÙŠÙ„ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹
  const [gannIntegrationMode, setGannIntegrationMode] = useState('price'); // 'price', 'time', 'both'

  // Ø¹Ø¬Ù„Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§ ÙˆØ§Ù„Ø£Ø´ÙƒØ§Ù„ Ø§Ù„Ù‡Ù†Ø¯Ø³ÙŠØ©
  const [showAngleWheel, setShowAngleWheel] = useState(false);
  const [angleWheelRotation, setAngleWheelRotation] = useState(0);
  const [angleStepRad, setAngleStep] = useState(10);
  const [rayColor, setRayColor] = useState(defaultRayColor);
  const [rayWidth, setRayWidth] = useState(2);
  const [selectedShape, setSelectedShape] = useState("");
  const [showAngleWheelAngles, setShowAngleWheelAngles] = useState(true); // Ø¥Ø¸Ù‡Ø§Ø± Ø²ÙˆØ§ÙŠØ§ Ø¹Ø¬Ù„Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§

  // Ø®ØµØ§Ø¦Øµ Ø¥Ø¶Ø§ÙÙŠØ© Ù…ÙÙ‚ÙˆØ¯Ø© Ù…Ù† GannCircle36
  const [zoom, setZoom] = useState(0.4); // Ø­Ø¬Ù… Ø£ØµØºØ± Ø¹Ù†Ø¯ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù„Ø£ÙˆÙ„ Ù…Ø±Ø©
  const [drag, setDrag] = useState({ x: 0, y: 0 }); // Ù…Ø±ÙƒØ² Ø«Ø§Ø¨Øª - Ù„Ø§ ÙŠØªØºÙŠØ±
  const [isDragging, setIsDragging] = useState(false);
  const [recentlyDragged, setRecentlyDragged] = useState(false); // ØªØªØ¨Ø¹ Ø§Ù„Ø³Ø­Ø¨ Ø§Ù„Ø­Ø¯ÙŠØ«
  const [clickStates, setClickStates] = useState({});
  const [cellColors, setCellColors] = useState([]);
  const [cellClickCounts, setCellClickCounts] = useState({}); // ØªØªØ¨Ø¹ Ø¹Ø¯Ø¯ Ø§Ù„Ù†Ù‚Ø±Ø§Øª Ù„ÙƒÙ„ Ø®Ù„ÙŠØ©
  const [showTriangle, setShowTriangle] = useState(false);
  const [showSquare, setShowSquare] = useState(false);
  const [showStar4, setShowStar4] = useState(false);
  const [showPentagon, setShowPentagon] = useState(false);
  const [showStar, setShowStar] = useState(false);
  const [showHexagon, setShowHexagon] = useState(false);
  const [showHexagram, setShowHexagram] = useState(false);
  const [showHeptagon, setShowHeptagon] = useState(false);
  const [showStar7, setShowStar7] = useState(false);
  const [showOctagon, setShowOctagon] = useState(false);
  const [showStarOctagon, setShowStarOctagon] = useState(false);
  const [showNonagon, setShowNonagon] = useState(false);
  const [showStar9, setShowStar9] = useState(false);
  const [showDecagon, setShowDecagon] = useState(false);
  const [showStar10, setShowStar10] = useState(false);
  const [showHendecagon, setShowHendecagon] = useState(false);
  const [showStar11, setShowStar11] = useState(false);
  const [showDodecagon, setShowDodecagon] = useState(false);
  const [showStar12, setShowStar12] = useState(false);

  // Ø´ÙƒÙ„ Ø§Ù„Ù…Ø«Ù„Ø«
  const [customAngles, setCustomAngles] = useState([0, 120, 240]);
  const [triangleRotation, setTriangleRotation] = useState(0);
  const [highlightTriangle, setHighlightTriangle] = useState(false);
  const [fillTriangle, setFillTriangle] = useState(false);
  const [isDraggingTriangle, setIsDraggingTriangle] = useState(false);

  // Ù…ØªØºÙŠØ±Ø§Øª Ø¹Ø¬Ù„Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ù„Ù„ØªØ¯ÙˆÙŠØ±
  const [isDraggingAngleWheel, setIsDraggingAngleWheel] = useState(false);

  // Ù…ØªØºÙŠØ±Ø§Øª Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù„Ø§Ø«ÙŠØ©
  const [star3Rotation, setStar3Rotation] = useState(0);
  const [fillStar3, setFillStar3] = useState(true);
  const [highlightStar3, setHighlightStar3] = useState(true);
  const [showStar3Angles, setShowStar3Angles] = useState(false);
  const [star3DrawMode, setStar3DrawMode] = useState("lines"); // "lines" Ø£Ùˆ "triangle"
  const [isDraggingStar3, setIsDraggingStar3] = useState(false);

  const [isDraggingStar5, setIsDraggingStar5] = useState(false);

  // Ø¯ÙˆØ§Ù„ Ø§Ù„Ø£Ù„ÙˆØ§Ù† ÙˆØ§Ø®ØªØ²Ø§Ù„ Ø§Ù„Ø±Ù‚Ù…
  const reduceToDigit = (num) => {
    // ØªØ­ÙˆÙŠÙ„ Ø§Ù„Ø±Ù‚Ù… Ø¥Ù„Ù‰ Ù†Øµ ÙˆØ¥Ø²Ø§Ù„Ø© Ø§Ù„Ø¹Ù„Ø§Ù…Ø© Ø§Ù„Ø¹Ø´Ø±ÙŠØ©
    let numStr = num.toString().replace('.', '');
    
    // Ø¬Ù…Ø¹ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ø±Ù‚Ø§Ù…
    let current = numStr
      .split("")
      .reduce((a, b) => a + Number(b), 0);
    
    // Ø§Ø³ØªÙ…Ø±Ø§Ø± Ø§Ù„Ø§Ø®ØªØ²Ø§Ù„ Ø­ØªÙ‰ Ù†Ø­ØµÙ„ Ø¹Ù„Ù‰ Ø±Ù‚Ù… ÙˆØ§Ø­Ø¯
    while (current > 9) {
      current = current
        .toString()
        .split("")
        .reduce((a, b) => a + Number(b), 0);
    }
    return current;
  };

  // Ø¯Ø§Ù„Ø© Ù„Ø¥ÙŠØ¬Ø§Ø¯ Ø§Ù„Ø±Ù‚Ù… Ø§Ù„ØªØ§Ù„ÙŠ Ø§Ù„Ø°ÙŠ ÙŠØ¹Ø·ÙŠ Ø±Ù‚Ù…Ø§Ù‹ Ù…Ø®ØªØ²Ù„Ø§Ù‹ Ù…Ø¹ÙŠÙ†Ø§Ù‹
  const findNextNumberWithReduced = (startFrom, targetReduced) => {
    let current = startFrom;
    while (reduceToDigit(current) !== targetReduced) {
      current++;
    }
    return current;
  };

  // Ø¯Ø§Ù„Ø© Ù„Ø­Ø³Ø§Ø¨ Ø£Ø±Ù‚Ø§Ù… Ø§Ù„Ø¨Ø¯Ø§ÙŠØ© Ù„ÙƒÙ„ Ø­Ù„Ù‚Ø©
  // Ø¨Ø­ÙŠØ« ÙƒÙ„ Ø­Ù„Ù‚Ø© ØªØ¨Ø¯Ø£ Ù…Ù† Ø±Ù‚Ù… ÙŠØ¹Ø·ÙŠ Ø±Ù‚Ù…Ø§Ù‹ Ù…Ø®ØªØ²Ù„Ø§Ù‹ = 1 
  const calculateRingStartNumbers = (startValue, levels, divisions) => {
    let ringStartNumbers = [];
    
    // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ÙˆØ¬ÙˆØ¯ Ù‚Ø·Ø§Ø¹Ø§Øª
    if (divisions === 0) {
      return ringStartNumbers;
    }
    
    // Ù„Ù„Ø­Ù„Ù‚Ø§Øª Ø§Ù„Ø£ÙˆÙ„Ù‰ ÙˆØ§Ù„Ø«Ø§Ù†ÙŠØ© (ÙØ§Ø±ØºØ© Ù…Ù† Ø§Ù„Ø£Ø±Ù‚Ø§Ù…)
    ringStartNumbers[0] = null;
    ringStartNumbers[1] = null;
    
    // ØªØ­Ø¯ÙŠØ¯ Ø®Ø·ÙˆØ© Ø§Ù„Ø²ÙŠØ§Ø¯Ø© Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ Ø·Ø¨ÙŠØ¹Ø© Ù‚ÙŠÙ…Ø© Ø§Ù„Ø¨Ø¯Ø§ÙŠØ©
    const step = (startValue % 1 === 0) ? 1 : 0.01;
    
    // Ù„Ù„Ø­Ù„Ù‚Ø© Ø§Ù„Ø«Ø§Ù„Ø«Ø© ÙˆÙ…Ø§ Ø¨Ø¹Ø¯Ù‡Ø§
    for (let level = 2; level < levels; level++) {
      if (level === 2) {
        // Ø§Ù„Ø­Ù„Ù‚Ø© Ø§Ù„Ø«Ø§Ù„Ø«Ø© ØªØ¨Ø¯Ø£ Ù…Ù† startValue
        ringStartNumbers[level] = startValue;
      } else {
        // Ø§Ù„Ø­Ù„Ù‚Ø§Øª Ø§Ù„ØªØ§Ù„ÙŠØ© ØªØ¨Ø¯Ø£ Ù…Ù† Ø£ÙˆÙ„ Ø±Ù‚Ù… Ø¨Ø¹Ø¯ Ø§Ù†ØªÙ‡Ø§Ø¡ Ø§Ù„Ø­Ù„Ù‚Ø© Ø§Ù„Ø³Ø§Ø¨Ù‚Ø©
        const previousRingEnd = parseFloat((ringStartNumbers[level - 1] + (divisions - 1) * step).toFixed(2));
        const nextStart = parseFloat((previousRingEnd + step).toFixed(2));
        
        // Ù„Ù„Ø£Ø±Ù‚Ø§Ù… Ø§Ù„Ø¹Ø´Ø±ÙŠØ©ØŒ Ù†Ø³ØªØ®Ø¯Ù… Ø§Ù„Ø±Ù‚Ù… Ø§Ù„ØªØ§Ù„ÙŠ Ù…Ø¨Ø§Ø´Ø±Ø©
        // Ù„Ù„Ø£Ø±Ù‚Ø§Ù… Ø§Ù„ØµØ­ÙŠØ­Ø©ØŒ Ù†Ø³ØªØ®Ø¯Ù… findNextNumberWithReduced
        if (startValue % 1 === 0) {
          ringStartNumbers[level] = findNextNumberWithReduced(nextStart, 1);
        } else {
          ringStartNumbers[level] = nextStart;
        }
      }
    }
    
    return ringStartNumbers;
  };

  // Ø¯Ø§Ù„Ø© Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø§Ù„Ù‚ÙŠÙ…Ø© ÙÙŠ Ø®Ù„ÙŠØ© Ù…Ø¹ÙŠÙ†Ø©
  // Ù…Ø«Ø§Ù„: Ù„Ù„Ø­Ù„Ù‚Ø© 3 ÙˆØ§Ù„Ø®Ù„ÙŠØ© 0 Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø¨Ø¯Ø§ÙŠØ© Ø§Ù„Ø­Ù„Ù‚Ø© 3.77 Ø³ØªØ¹Ø·ÙŠ 3.77
  // Ù„Ù„Ø­Ù„Ù‚Ø© 3 ÙˆØ§Ù„Ø®Ù„ÙŠØ© 1 Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø¨Ø¯Ø§ÙŠØ© Ø§Ù„Ø­Ù„Ù‚Ø© 3.77 Ø³ØªØ¹Ø·ÙŠ 3.78
  const getCellValue = (level, index, ringStartNumbers, startValue = 1) => {
    if (level < 2) return 0; // Ø§Ù„Ø­Ù„Ù‚Ø§Øª Ø§Ù„ÙØ§Ø±ØºØ©
    
    const baseValue = ringStartNumbers[level];
    
    // ØªØ­Ø¯ÙŠØ¯ Ø®Ø·ÙˆØ© Ø§Ù„Ø²ÙŠØ§Ø¯Ø© Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ Ø·Ø¨ÙŠØ¹Ø© Ù‚ÙŠÙ…Ø© Ø§Ù„Ø¨Ø¯Ø§ÙŠØ©
    let step;
    if (startValue % 1 === 0) {
      // Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù‚ÙŠÙ…Ø© Ø§Ù„Ø¨Ø¯Ø§ÙŠØ© Ø¹Ø¯Ø¯ ØµØ­ÙŠØ­ØŒ Ø§Ù„Ø®Ø·ÙˆØ© = 1
      step = 1;
    } else {
      // Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù‚ÙŠÙ…Ø© Ø§Ù„Ø¨Ø¯Ø§ÙŠØ© Ø¹Ø¯Ø¯ Ø¹Ø´Ø±ÙŠØŒ Ø§Ù„Ø®Ø·ÙˆØ© = 0.01
      step = 0.01;
    }
    
    return parseFloat((baseValue + (index * step)).toFixed(2));
  };

  const getDigitColor = (digit) => {
    if ([1, 4, 7].includes(digit)) return "red";
    if ([2, 5, 8].includes(digit)) return "blue";
    if ([3, 6, 9].includes(digit)) return "black";
    return "#000";
  };

  // Ø¯Ø§Ù„Ø© Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ù„ÙˆÙ† Ø§Ù„Ø®Ù„ÙŠØ© Ø­Ø³Ø¨ Ø¹Ø¯Ø¯ Ø§Ù„Ù†Ù‚Ø±Ø§Øª Ø£Ùˆ Ø­Ø±ÙƒØ© Ø§Ù„Ø³Ø¹Ø±
  const getCellBackgroundColor = (cellKey, clicks, level, index) => {
    // Ø¥Ø°Ø§ ÙƒØ§Ù† Ø§Ù„ØªÙ„ÙˆÙŠÙ† Ø­Ø³Ø¨ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø§Ù„ÙŠØ© Ù…ÙØ¹Ù„
    if (priceBasedColoring && selectedMarkets.length > 0) {
      return getMarketBasedCellColor(level, index);
    }
    
    // Ø§Ù„ØªÙ„ÙˆÙŠÙ† Ø§Ù„Ø¹Ø§Ø¯ÙŠ Ø­Ø³Ø¨ Ø§Ù„Ù†Ù‚Ø±Ø§Øª
    if (clicks === 1) return "#90ee90";  // Ø£Ø®Ø¶Ø±
    if (clicks === 2) return "#ffb6c1";     // ÙˆØ±Ø¯ÙŠ
    if (clicks === 3) return "#ffff00";  // Ø£ØµÙØ±
    if (clicks === 4) return "#d3d3d3";     // Ø±Ù…Ø§Ø¯ÙŠ
    return "#fff"; // Ø§Ù„Ù„ÙˆÙ† Ø§Ù„Ø£ØµÙ„ÙŠ (Ø£Ø¨ÙŠØ¶)
  };

  // Ø¯Ø§Ù„Ø© Ø¬Ø¯ÙŠØ¯Ø© Ù„ØªØ­Ø¯ÙŠØ¯ Ù„ÙˆÙ† Ø§Ù„Ø®Ù„ÙŠØ© Ø­Ø³Ø¨ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø§Ù„ÙŠØ©
  const getMarketBasedCellColor = (level, index) => {
    if (selectedMarkets.length === 0) return "#fff";
    
    // Ø­Ø³Ø§Ø¨ Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ø®Ù„ÙŠØ© ÙÙŠ Ø¯Ø§Ø¦Ø±Ø© 360
    const cellAngle = (index / settings.divisions) * 360;
    const cellSector = index + 1;
    
    // Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† Ø³ÙˆÙ‚ Ù…Ø§Ù„ÙŠ ÙŠÙ‚Ø¹ ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„Ù‚Ø·Ø§Ø¹
    const marketInSector = findMarketInSector(cellSector, cellAngle);
    
    if (marketInSector) {
      const movement = marketInSector.movement;
      
      // ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù„ÙˆÙ† Ø­Ø³Ø¨ Ø­Ø±ÙƒØ© Ø§Ù„Ø³Ø¹Ø±
      switch (movement) {
        case 'up': return "#90ee90";    // Ø£Ø®Ø¶Ø± Ù„Ù„ØµØ¹ÙˆØ¯
        case 'down': return "#ffcccb";   // Ø£Ø­Ù…Ø± Ù„Ù„Ù‡Ø¨ÙˆØ·
        case 'reversal': return "#ffff00"; // Ø£ØµÙØ± Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø§Ù†Ø¹ÙƒØ§Ø³
        default: return "#f0f0f0";       // Ø±Ù…Ø§Ø¯ÙŠ ÙØ§ØªØ­ Ù„Ù„Ù…Ø­Ø§ÙŠØ¯
      }
    }
    
    return "#fff"; // Ø£Ø¨ÙŠØ¶ Ø§ÙØªØ±Ø§Ø¶ÙŠ
  };

  // Ø¯Ø§Ù„Ø© Ù„Ù„Ø¨Ø­Ø« Ø¹Ù† Ø³ÙˆÙ‚ ÙÙŠ Ù‚Ø·Ø§Ø¹ Ù…Ø¹ÙŠÙ†
  const findMarketInSector = (sector, angle) => {
    // Ù‡Ø°Ù‡ Ø¯Ø§Ù„Ø© Ù…Ø¨Ø³Ø·Ø© - ÙŠÙ…ÙƒÙ† ØªØ·ÙˆÙŠØ±Ù‡Ø§ Ø£ÙƒØ«Ø±
    // ØªØ¨Ø­Ø« ÙÙŠ Ø§Ù„Ø£Ø³ÙˆØ§Ù‚ Ø§Ù„Ù…Ø­Ø¯Ø¯Ø© Ù„ØªØ¬Ø¯ Ø³ÙˆÙ‚ ÙŠÙ‚Ø¹ ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„Ù‚Ø·Ø§Ø¹
    
    for (const marketKey of selectedMarkets) {
      // Ù…Ø­Ø§ÙƒØ§Ø© Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ø³ÙˆÙ‚ ÙÙŠ Ø§Ù„Ø¯Ø§Ø¦Ø±Ø©
      const marketSector = (marketKey.charCodeAt(marketKey.length - 1) % 36) + 1;
      
      if (Math.abs(marketSector - sector) <= 1) {
        // Ø¥Ø±Ø¬Ø§Ø¹ Ø¨ÙŠØ§Ù†Ø§Øª ÙˆÙ‡Ù…ÙŠØ© - ÙŠØ¬Ø¨ Ø±Ø¨Ø·Ù‡Ø§ Ø¨Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ©
        return {
          marketKey,
          movement: ['up', 'down', 'neutral', 'reversal'][Math.floor(Math.random() * 4)],
          price: 100 + Math.random() * 50
        };
      }
    }
    
    return null;
  };
  const [isDraggingSquare, setIsDraggingSquare] = useState(false);
  const [isDraggingStar4, setIsDraggingStar4] = useState(false);
  const [isDraggingPentagon, setIsDraggingPentagon] = useState(false);
  const [isDraggingHexagon, setIsDraggingHexagon] = useState(false);
  const [isDraggingStar6, setIsDraggingStar6] = useState(false);
  const [isDraggingHeptagon, setIsDraggingHeptagon] = useState(false);
  const [isDraggingStar7, setIsDraggingStar7] = useState(false);
  const [isDraggingOctagon, setIsDraggingOctagon] = useState(false);
  const [isDraggingStar8, setIsDraggingStar8] = useState(false);
  const [isDraggingNonagon, setIsDraggingNonagon] = useState(false);
  const [isDraggingStar9, setIsDraggingStar9] = useState(false);
  const [isDraggingDecagon, setIsDraggingDecagon] = useState(false);
  const [isDraggingStar10, setIsDraggingStar10] = useState(false);
  const [isDraggingHendecagon, setIsDraggingHendecagon] = useState(false);
  const [isDraggingStar11, setIsDraggingStar11] = useState(false);
  const [isDraggingDodecagon, setIsDraggingDodecagon] = useState(false);
  const [isDraggingStar12, setIsDraggingStar12] = useState(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null);
  const [dragStartAngle, setDragStartAngle] = useState(0);
  const [initialRotation, setInitialRotation] = useState(0);

  const [customSquareAngles, setCustomSquareAngles] = useState([0, 90, 180, 270]);
  const [squareRotation, setSquareRotation] = useState(0);
  const [highlightSquare, setHighlightSquare] = useState(false);
  const [fillSquare, setFillSquare] = useState(false);
  const [showSquareAngles, setShowSquareAngles] = useState(false);

  const [customStar4Angles, setCustomStar4Angles] = useState([0, 90, 180, 270]);
  const [star4Rotation, setStar4Rotation] = useState(0);
  const [fillStar4, setFillStar4] = useState(false);
  const [highlightStar4, setHighlightStar4] = useState(false);
  const [showStar4Angles, setShowStar4Angles] = useState(false);

  const [customPentagonAngles, setCustomPentagonAngles] = useState([0, 72, 144, 216, 288]);
  const [pentagonRotation, setPentagonRotation] = useState(0);
  const [fillPentagon, setFillPentagon] = useState(false);
  const [highlightPentagon, setHighlightPentagon] = useState(false);
  const [showPentagonAngles, setShowPentagonAngles] = useState(false);

  const [star5Rotation, setStar5Rotation] = useState(0);
const [fillStar5, setFillStar5] = useState(false);
const [highlightStar5, setHighlightStar5] = useState(false);
const [showStar5Angles, setShowStar5Angles] = useState(false);
const [star5DrawMode, setStar5DrawMode] = useState("pentagram"); // "pentagram" Ø£Ùˆ "lines"

const [customStarAngles, setCustomStarAngles] = useState([0, 72, 144, 216, 288]);
const [customStar3Angles, setCustomStar3Angles] = useState([45, 165, 285]); // Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù„Ø§Ø«ÙŠØ© {3/3} - 45Â° Ø£Ø³Ø§Ø³ÙŠØ©
const [starRotation, setStarRotation] = useState(0);
const [fillStar, setFillStar] = useState(false);
const [highlightStar, setHighlightStar] = useState(false);

const [customHexagonAngles, setCustomHexagonAngles] = useState([0,60,120,180,240,300]);
const [hexagonRotation, setHexagonRotation] = useState(0);
const [fillHexagon, setFillHexagon] = useState(false);
const [highlightHexagon, setHighlightHexagon] = useState(false);
const [showHexagonAngles, setShowHexagonAngles] = useState(false);

const [customHexagramAngles, setCustomHexagramAngles] = useState([0,60,120,180,240,300]);
const [hexagramRotation, setHexagramRotation] = useState(0);
const [fillHexagram, setFillHexagram] = useState(false);
const [highlightHexagram, setHighlightHexagram] = useState(false);

const [star6Rotation, setStar6Rotation] = useState(0);
const [fillStar6, setFillStar6] = useState(false);
const [highlightStar6, setHighlightStar6] = useState(false);
const [showStar6Angles, setShowStar6Angles] = useState(false);

const [heptagonRotation, setHeptagonRotation] = useState(0);
const [fillHeptagon, setFillHeptagon] = useState(false);
const [highlightHeptagon, setHighlightHeptagon] = useState(false);

const [star7Rotation, setStar7Rotation] = useState(0);
const [fillStar7, setFillStar7] = useState(false);
const [highlightStar7, setHighlightStar7] = useState(false);
const [showStar7Angles, setShowStar7Angles] = useState(false);

const [customOctagonAngles, setCustomOctagonAngles] = useState([0,45,90,135,180,225,270,315]);
const [octagonRotation, setOctagonRotation] = useState(0);
const [fillOctagon, setFillOctagon] = useState(false);
const [highlightOctagon, setHighlightOctagon] = useState(false);

const [star8Rotation, setStar8Rotation] = useState(0);
const [fillStar8, setFillStar8] = useState(false);
const [highlightStar8, setHighlightStar8] = useState(false);
const [showStar8Angles, setShowStar8Angles] = useState(false);

const [customStarOctagonAngles, setCustomStarOctagonAngles] = useState([0,45,90,135,180,225,270,315]);
const [starOctagonRotation, setStarOctagonRotation] = useState(0);
const [fillStarOctagon, setFillStarOctagon] = useState(false);
const [highlightStarOctagon, setHighlightStarOctagon] = useState(false);

const [nonagonRotation, setNonagonRotation] = useState(0);
const [fillNonagon, setFillNonagon] = useState(false);
const [highlightNonagon, setHighlightNonagon] = useState(false);

const [star9Rotation, setStar9Rotation] = useState(0);
const [fillStar9, setFillStar9] = useState(false);
const [highlightStar9, setHighlightStar9] = useState(false);
const [showStar9Angles, setShowStar9Angles] = useState(false);

const [decagonRotation, setDecagonRotation] = useState(0);
const [fillDecagon, setFillDecagon] = useState(false);
const [highlightDecagon, setHighlightDecagon] = useState(false);

const [star10Rotation, setStar10Rotation] = useState(0);
const [fillStar10, setFillStar10] = useState(false);
const [highlightStar10, setHighlightStar10] = useState(false);
const [showStar10Angles, setShowStar10Angles] = useState(false);

const [hendecagonRotation, setHendecagonRotation] = useState(0);
const [fillHendecagon, setFillHendecagon] = useState(false);
const [highlightHendecagon, setHighlightHendecagon] = useState(false);

const [star11Rotation, setStar11Rotation] = useState(0);
const [fillStar11, setFillStar11] = useState(false);
const [highlightStar11, setHighlightStar11] = useState(false);
const [showStar11Angles, setShowStar11Angles] = useState(false);

const [dodecagonRotation, setDodecagonRotation] = useState(0);
const [fillDodecagon, setFillDodecagon] = useState(false);
const [highlightDodecagon, setHighlightDodecagon] = useState(false);

const [star12Rotation, setStar12Rotation] = useState(0);
const [fillStar12, setFillStar12] = useState(false);
const [highlightStar12, setHighlightStar12] = useState(false);
const [showStar12Angles, setShowStar12Angles] = useState(false);

// Ù…ØªØºÙŠØ±Ø§Øª Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ù„Ù„Ø£Ø´ÙƒØ§Ù„ Ø§Ù„Ù…ÙÙ‚ÙˆØ¯Ø©
const [showHeptagonAngles, setShowHeptagonAngles] = useState(false);
const [showOctagonAngles, setShowOctagonAngles] = useState(false);
const [showNonagonAngles, setShowNonagonAngles] = useState(false);
const [showDecagonAngles, setShowDecagonAngles] = useState(false);
const [showHendecagonAngles, setShowHendecagonAngles] = useState(false);
const [showDodecagonAngles, setShowDodecagonAngles] = useState(false);

// Ø§Ù„Ø¯ÙˆØ§Ø¦Ø± Ø§Ù„Ù…ØªØ¯Ø§Ø®Ù„Ø©
const [showNestedCircles, setShowNestedCircles] = useState(false);
const [nestedCircleCount, setNestedCircleCount] = useState(5);
const [nestedCircleGap, setNestedCircleGap] = useState(20);
const [nestedDashStyle, setNestedDashStyle] = useState("solid");
const [nestedStrokeWidth, setNestedStrokeWidth] = useState(2);
const [nestedCircleColor, setNestedCircleColor] = useState("#FFD700");
const [nestedCircleLabels, setNestedCircleLabels] = useState(false);
const [useGradientColor, setUseGradientColor] = useState(false);
const [nestedOpacity, setNestedOpacity] = useState(0.7);
const [showTimeLabels, setShowTimeLabels] = useState(false);
const [timeStepDays, setTimeStepDays] = useState(7);
const [showRepeatedPattern, setShowRepeatedPattern] = useState(false);
const [patternColor, setPatternColor] = useState("#00CED1");
const [patternRotation, setPatternRotation] = useState(0);
const [patternFill, setPatternFill] = useState(false);
const [patternShape, setPatternShape] = useState("triangle");
const [selectedPatternIndex, setSelectedPatternIndex] = useState(null);

  // Ø§Ù„ÙˆÙ‚Øª ÙˆØ§Ù„ØªÙˆØ§Ø±ÙŠØ® (Ù…Ø­Ù„ÙŠØ© ÙˆÙ…Ø¹ Ø¯Ø¹Ù… Ø§Ù„ØªÙˆÙ‚ÙŠØªØ§Øª Ø§Ù„Ù…Ø®ØªÙ„ÙØ©)
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Ø¯Ø§Ù„Ø© Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø§Ù„ÙˆÙ‚Øª Ø­Ø³Ø¨ Ø§Ù„Ù…Ù†Ø·Ù‚Ø© Ø§Ù„Ù…Ø­Ø¯Ø¯Ø©
  const getTimeByZone = () => {
    if (timeZone === 'utc') {
      return new Date().toLocaleTimeString('en-GB', { 
        timeZone: 'UTC',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } else {
      return new Date().toLocaleTimeString('en-GB', { 
        timeZone: 'Asia/Riyadh',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
  };
  
  // Ø¯Ø§Ù„Ø© Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø§Ù„ØªØ§Ø±ÙŠØ® Ø­Ø³Ø¨ Ø§Ù„Ù…Ù†Ø·Ù‚Ø© Ø§Ù„Ù…Ø­Ø¯Ø¯Ø©
  const getDateByZone = () => {
    const date = timeZone === 'utc' 
      ? new Date().toLocaleDateString('en-GB', { timeZone: 'UTC' })
      : new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Riyadh' });
    
    const [day, month, year] = date.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };
  
  // Ø¯Ø§Ù„Ø© Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø§Ø³Ù… Ø§Ù„ÙŠÙˆÙ…
  const getDayName = () => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dayIndex = timeZone === 'utc' 
      ? new Date().getUTCDay()
      : new Date().getDay();
    return days[dayIndex];
  };
  
  const getGregorianDate = () => currentTime.toLocaleDateString("ar-EG");
  const getHijriDate = () => {
    try {
      return currentTime
        .toLocaleDateString("ar-SA-u-ca-islamic", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
        .replace(/Ù‡Ù€.*/, "Ù‡Ù€");
    } catch {
      return "";
    }
  };
  const formatTime = (date, offset) => {
    const d = new Date(date);
    d.setHours(d.getHours() + offset);
    return d.toLocaleTimeString("ar-EG");
  };

  const buttonStyle = {
    background: "#333",
    color: "#FFD700",
    border: "1px solid #FFD700",
    borderRadius: "8px",
    padding: "8px 16px",
    margin: "3px 0",
    cursor: "pointer",
    fontWeight: "bold",
  };
  const inputStyle = {
    background: "#1a1a1a",
    color: "#FFD700",
    border: "1px solid #FFD700",
    borderRadius: "4px",
    padding: "5px",
    marginBottom: "7px",
    marginTop: "2px",
    fontSize: "14px",
  };

  // Ø§Ù„Ù„ØºØ©
  const toggleLang = () => {
    setSettings((prev) => ({
      ...prev,
      language: prev.language === "ar" ? "en" : "ar",
    }));
  };

  // Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©
  const canvasRectRef = useRef(null);
  const canvasRef = useRef();
  const innerRadius = 60;
  const baseRingWidth = 100; // Ø²ÙŠØ§Ø¯Ø© Ø§Ù„Ø¹Ø±Ø¶ Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ Ù„Ø®Ù„Ø§ÙŠØ§ Ø£ÙƒØ¨Ø±
  const digitScale = 20; // Ø²ÙŠØ§Ø¯Ø© Ø§Ù„Ù…Ù‚ÙŠØ§Ø³ Ù„Ù„Ø£Ø±Ù‚Ø§Ù… Ø§Ù„Ø·ÙˆÙŠÙ„Ø©  
  const minCellPadding = 16; // Ø­Ø¯ Ø£Ø¯Ù†Ù‰ Ø£ÙƒØ¨Ø± Ù„Ù„Ù…Ø³Ø§Ø­Ø© Ø§Ù„ÙØ§Ø±ØºØ© Ø¯Ø§Ø®Ù„ Ø§Ù„Ø®Ù„ÙŠØ©
  
  // Ø­Ø³Ø§Ø¨ Ø£Ø±Ù‚Ø§Ù… Ø§Ù„Ø¨Ø¯Ø§ÙŠØ© Ù„ÙƒÙ„ Ø­Ù„Ù‚Ø©
  // Ø¥Ø¶Ø§ÙØ© 2 Ø­Ù„Ù‚Ø§Øª Ø¥Ø¶Ø§ÙÙŠØ© (Ø§Ù„Ø£ÙˆÙ„Ù‰ ÙˆØ§Ù„Ø«Ø§Ù†ÙŠØ©) Ù„Ù„Ø­Ù„Ù‚Ø§Øª Ø§Ù„Ù…Ø±Ù‚Ù…Ø©
  const totalLevels = settings.levels + 2;
  const ringStartNumbers = calculateRingStartNumbers(settings.startValue, totalLevels, settings.divisions);
  
  // Ø­Ø³Ø§Ø¨ Ù†ØµÙ Ù‚Ø·Ø± Ø¢Ø®Ø± Ø­Ù„Ù‚Ø© Ø¨Ù†ÙØ³ Ù…Ù†Ø·Ù‚ Ø§Ù„Ø­Ù„Ù‚Ø© Ø§Ù„ÙØ¹Ù„ÙŠØ© Ø§Ù„Ù…Ø­Ø³Ù†
  let calculatedLastRadius = innerRadius;
  for (let level = 0; level < totalLevels; level++) {
    // Ø­Ù…Ø§ÙŠØ© Ù…Ù† Ø­Ø§Ù„Ø© Ø¹Ø¯Ø¯ Ø§Ù„Ù‚Ø·Ø§Ø¹Ø§Øª = 0
    if (settings.divisions === 0) {
      break;
    }
    
    const maxDigitsInLevel = Math.max(
      ...Array.from({ length: settings.divisions }, (_, i) => {
        const cellValue = getCellValue(level, i, ringStartNumbers, settings.startValue);
        return cellValue > 0 ? parseFloat(cellValue.toFixed(2)).toString().length : 1;
      })
    );
    // Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù†ÙØ³ Ø§Ù„Ø¯Ø§Ù„Ø© Ø§Ù„Ù…Ø­Ø³Ù†Ø© Ù„Ù„Ø­Ø³Ø§Ø¨ - Ù‡Ø°Ø§ Ù…Ù‡Ù… Ù„Ù„ØªØ·Ø§Ø¨Ù‚ Ù…Ø¹ Ø§Ù„Ø­Ù„Ù‚Ø§Øª Ø§Ù„ÙØ¹Ù„ÙŠØ©
    const dynamicWidth = calculateRingWidth(maxDigitsInLevel);
    calculatedLastRadius += dynamicWidth;
  }
  const lastNumberRingRadius = calculatedLastRadius;
  
  // Ø­Ù„Ù‚Ø© Ø§Ù„Ø¯Ø±Ø¬Ø§Øª ØªØ£ØªÙŠ Ø¨Ø¹Ø¯ Ø­Ù„Ù‚Ø§Øª Ø§Ù„Ø£Ø±Ù‚Ø§Ù… Ù…Ø¹ Ù…Ø³Ø§ÙØ© Ø£ÙƒØ¨Ø±
  const degreeRingRadius = lastNumberRingRadius + 35; // Ø²ÙŠØ§Ø¯Ø© Ø§Ù„Ù…Ø³Ø§ÙØ© Ù„Ù„ÙˆØ¶ÙˆØ­
  
  // Ø¹Ø¬Ù„Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§ ØªØ£ØªÙŠ Ø¨Ø¹Ø¯ Ø­Ù„Ù‚Ø© Ø§Ù„Ø¯Ø±Ø¬Ø§Øª Ù…Ø¹ ÙØ±Ø§Øº ØµØºÙŠØ± Ù„ØªØ¬Ù†Ø¨ Ø§Ù„ØªØ¯Ø§Ø®Ù„
  const angleWheelInnerRadius = degreeRingRadius + 25; // Ø¥Ø¶Ø§ÙØ© ÙØ±Ø§Øº 25px Ù„ØªØ¬Ù†Ø¨ Ø§Ù„ØªØ¯Ø§Ø®Ù„ Ù…Ø¹ Ø§Ù„Ø¯Ø±Ø¬Ø§Øª
  const angleWheelOuterRadius = angleWheelInnerRadius + 55; // Ù…Ù†Ø·Ù‚Ø© Ø£ÙˆØ³Ø¹ Ù„Ù„Ù†Ù‚Ø±
  
  // Ø­Ù„Ù‚Ø© Ø§Ù„Ø£Ø¨Ø±Ø§Ø¬ ØªØ£ØªÙŠ Ø¨Ø¹Ø¯ Ø¹Ø¬Ù„Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ø£Ùˆ Ø¨Ø¹Ø¯ Ø­Ù„Ù‚Ø© Ø§Ù„Ø¯Ø±Ø¬Ø§Øª Ù…Ø¹ ÙØ±Ø§Øº ØµØºÙŠØ± Ù„ØªØ¬Ù†Ø¨ Ø§Ù„ØªØ¯Ø§Ø®Ù„
  const zodiacInnerRadius = showAngleWheel ? angleWheelOuterRadius : degreeRingRadius + 25; // Ø¥Ø¶Ø§ÙØ© ÙØ±Ø§Øº 25px Ù„ØªØ¬Ù†Ø¨ Ø§Ù„ØªØ¯Ø§Ø®Ù„ Ù…Ø¹ Ø§Ù„Ø¯Ø±Ø¬Ø§Øª
  const zodiacOuterRadius = zodiacInnerRadius + 60; // ØªÙˆØ­ÙŠØ¯ Ø§Ù„Ø³ÙÙ…Ùƒ Ù…Ø¹ Ø­Ù„Ù‚Ø© Ø§Ù„Ø£ÙŠØ§Ù…
  
  // Ø­Ù„Ù‚Ø© Ø£ÙŠØ§Ù… Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ ØªØ£ØªÙŠ Ø¨Ø¹Ø¯ Ø­Ù„Ù‚Ø© Ø§Ù„Ø£Ø¨Ø±Ø§Ø¬ Ù…Ø¨Ø§Ø´Ø±Ø© Ø¨Ø¯ÙˆÙ† ÙØ±Ø§ØºØ§Øª
  const weekDaysInnerRadius = zodiacOuterRadius;
  const weekDaysOuterRadius = weekDaysInnerRadius + 60;
  
  // Ù„Ù„ØªÙˆØ§ÙÙ‚ Ù…Ø¹ Ø§Ù„ÙƒÙˆØ¯ Ø§Ù„Ù…ÙˆØ¬ÙˆØ¯ØŒ Ù†Ø­Ø§ÙØ¸ Ø¹Ù„Ù‰ ringRadius
  const ringRadius = lastNumberRingRadius;
  
  // Ø­Ø³Ø§Ø¨ Ø­Ø¬Ù… Ø§Ù„Ø¯ÙˆØ§Ø¦Ø± Ø§Ù„Ù…ØªØ¯Ø§Ø®Ù„Ø© Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…ÙˆØ¬ÙˆØ¯Ø©
  const nestedRadius = showNestedCircles ? nestedCircleGap * nestedCircleCount : 0;
  
  // Ø­Ø³Ø§Ø¨ Ø£ÙƒØ¨Ø± Ù‚Ø·Ø± Ù…Ø·Ù„ÙˆØ¨ - Ø§Ù„Ø¢Ù† ÙŠØ´Ù…Ù„ Ø­Ù„Ù‚Ø© Ø£ÙŠØ§Ù… Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ ÙƒØ¢Ø®Ø± Ø­Ù„Ù‚Ø©
  let mainCircleRadius = showAngleWheel ? angleWheelOuterRadius : zodiacOuterRadius;
  if (showWeekDaysRing) {
    mainCircleRadius = weekDaysOuterRadius;
  }
  const maxRadius = Math.max(mainCircleRadius, nestedRadius);
  
  // Ù‡Ø§Ù…Ø´ Ø­ÙˆÙ„ Ø§Ù„Ø¯Ø§Ø¦Ø±Ø© - Ø­Ø¬Ù… Ù…ØªÙ†Ø§Ø³Ù‚ ÙˆÙ…Ø±ÙŠØ­ Ù„Ù„Ø¹Ø±Ø¶
  const svgPadding = 150; // ØªØµØºÙŠØ± Ø§Ù„Ù‡Ø§Ù…Ø´ Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø­Ø¬Ù… Ù…ØªÙ†Ø§Ø³Ù‚
  const canvasSize = maxRadius * 2 + svgPadding * 2;

  // Ø¯ÙˆØ§Ù„ Ø§Ù„Ø±Ø³Ù… Ù„Ù„Ø£Ø´ÙƒØ§Ù„ Ø§Ù„Ù‡Ù†Ø¯Ø³ÙŠØ©
  function drawSquare(ctx, center, radius) {
    const r = degreeRingRadius; // Ø±Ø¨Ø· Ø¨Ø­Ù„Ù‚Ø© Ø§Ù„Ø¯Ø±Ø¬Ø§Øª
    const points = customSquareAngles.map((deg) => {
      const rad = ((deg + squareRotation + settings.rotation - 90) * Math.PI) / 180;
      return {
        x: center + r * Math.cos(rad),
        y: center + r * Math.sin(rad),
      };
    });

    // Ø±Ø³Ù… Ø®Ø·ÙˆØ· Ø§Ù„Ø±Ø¨Ø· Ù…Ù† Ø§Ù„Ù…Ø±ÙƒØ² Ø¥Ù„Ù‰ Ø­Ù„Ù‚Ø© Ø§Ù„Ø¯Ø±Ø¬Ø§Øª
    points.forEach((point) => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.7;
      ctx.stroke();
      ctx.restore();
    });

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, i) => {
      if (i > 0) ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    
    if (fillSquare) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
      ctx.fill();
    }
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    if (highlightSquare) {
      points.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.restore();
      });
    }
    
    // ØªÙ…ÙŠÙŠØ² Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ù…Ø­Ø¯Ø¯Ø© (Ø¹Ù†Ø¯ Ø§Ù„ØªÙ…Ø±ÙŠØ±)
    if (hoveredPointIndex !== null && selectedShape === "square") {
      const hoveredPoint = points[hoveredPointIndex];
      if (hoveredPoint) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(hoveredPoint.x, hoveredPoint.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = "cyan";
        ctx.fill();
        ctx.restore();
      }
    }
    
    // Ø¹Ø±Ø¶ Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ù†ØµÙŠØ© Ø¹Ù†Ø¯ Ø§Ù„Ø±Ø¤ÙˆØ³
    if (showSquareAngles) {
      points.forEach((point, i) => {
        const angle = (customSquareAngles[i] + squareRotation + settings.rotation) % 360;
        ctx.save();
        ctx.font = "bold 16px Tahoma";
        ctx.fillStyle = "#2F4F4F";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(`(${angle.toFixed(0)}Â°)`, point.x, point.y - 12);
        ctx.restore();
      });
    }

    // **Ø±Ø³Ù… Ø±Ø¤ÙˆØ³ Ø§Ù„Ù…Ø±Ø¨Ø¹ Ø¨Ù„ÙˆÙ† Ø£Ø­Ù…Ø± ØºØ§Ù…Ù‚ Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ø¸Ø§Ù‡Ø±Ø© - ÙÙŠ Ø§Ù„Ù†Ù‡Ø§ÙŠØ© Ù„ÙŠÙƒÙˆÙ†ÙˆØ§ ÙÙˆÙ‚ ÙƒÙ„ Ø´ÙŠØ¡**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI); // Ø¯Ø§Ø¦Ø±Ø© Ø£ÙƒØ¨Ø± Ù‚Ù„ÙŠÙ„Ø§Ù‹
      ctx.fillStyle = "#DC143C"; // Ø£Ø­Ù…Ø± ØºØ§Ù…Ù‚ (Crimson)
      ctx.fill();
      ctx.strokeStyle = "#8B0000"; // Ø­Ø¯ÙˆØ¯ Ø£Ø­Ù…Ø± Ø£ØºÙ…Ù‚
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Ø¥Ø¶Ø§ÙØ© Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ© ØµØºÙŠØ±Ø© Ù„Ù„ØªØ£ÙƒÙŠØ¯
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#8B0000"; // Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ© Ø£ØºÙ…Ù‚
      ctx.fill();
      ctx.restore();
    });
  }

  function drawPentagon(ctx, center, radius) {
    const r = degreeRingRadius; // Ø±Ø¨Ø· Ø¨Ø­Ù„Ù‚Ø© Ø§Ù„Ø¯Ø±Ø¬Ø§Øª
    const points = customPentagonAngles.map((deg) => {
      const rad = ((deg + pentagonRotation + settings.rotation - 90) * Math.PI) / 180;
      return {
        x: center + r * Math.cos(rad),
        y: center + r * Math.sin(rad),
      };
    });

    // Ø±Ø³Ù… Ø®Ø·ÙˆØ· Ø§Ù„Ø±Ø¨Ø· Ù…Ù† Ø§Ù„Ù…Ø±ÙƒØ² Ø¥Ù„Ù‰ Ø­Ù„Ù‚Ø© Ø§Ù„Ø¯Ø±Ø¬Ø§Øª
    points.forEach((point) => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.7;
      ctx.stroke();
      ctx.restore();
    });

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, i) => {
      if (i > 0) ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    
    if (fillPentagon) {
      ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
      ctx.fill();
    }
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    if (highlightPentagon) {
      points.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.restore();
      });
    }
    
    // ØªÙ…ÙŠÙŠØ² Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ù…Ø­Ø¯Ø¯Ø© (Ø¹Ù†Ø¯ Ø§Ù„ØªÙ…Ø±ÙŠØ±)
    if (hoveredPointIndex !== null && selectedShape === "pentagon") {
      const hoveredPoint = points[hoveredPointIndex];
      if (hoveredPoint) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(hoveredPoint.x, hoveredPoint.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = "cyan";
        ctx.fill();
        ctx.restore();
      }
    }
    
    // Ø¹Ø±Ø¶ Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ù†ØµÙŠØ© Ø¹Ù†Ø¯ Ø§Ù„Ø±Ø¤ÙˆØ³
    if (showPentagonAngles) {
      points.forEach((point, i) => {
        const angle = (customPentagonAngles[i] + pentagonRotation + settings.rotation) % 360;
        ctx.save();
        ctx.font = "bold 16px Tahoma";
        ctx.fillStyle = "#2F4F4F";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(`(${angle.toFixed(0)}Â°)`, point.x, point.y - 12);
        ctx.restore();
      });
    }

    // **Ø±Ø³Ù… Ø±Ø¤ÙˆØ³ Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø®Ù…Ø§Ø³ÙŠ Ø¨Ù„ÙˆÙ† Ø£Ø®Ø¶Ø± Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ø¸Ø§Ù‡Ø±Ø© - ÙÙŠ Ø§Ù„Ù†Ù‡Ø§ÙŠØ© Ù„ÙŠÙƒÙˆÙ†ÙˆØ§ ÙÙˆÙ‚ ÙƒÙ„ Ø´ÙŠØ¡**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI); // Ø¯Ø§Ø¦Ø±Ø© Ø£ÙƒØ¨Ø± Ù‚Ù„ÙŠÙ„Ø§Ù‹
      ctx.fillStyle = "#228B22"; // Ø£Ø®Ø¶Ø± ØºØ§Ù…Ù‚ (ForestGreen)
      ctx.fill();
      ctx.strokeStyle = "#006400"; // Ø­Ø¯ÙˆØ¯ Ø£Ø®Ø¶Ø± Ø£ØºÙ…Ù‚
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Ø¥Ø¶Ø§ÙØ© Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ© ØµØºÙŠØ±Ø© Ù„Ù„ØªØ£ÙƒÙŠØ¯
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#006400"; // Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ© Ø£ØºÙ…Ù‚
      ctx.fill();
      ctx.restore();
    });
  }

  function drawHexagon(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = customHexagonAngles.map((deg) => {
      const rad = ((deg + hexagonRotation + settings.rotation - 90) * Math.PI) / 180;
      return {
        x: center + r * Math.cos(rad),
        y: center + r * Math.sin(rad),
      };
    });

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, i) => {
      if (i > 0) ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    
    if (fillHexagon) {
      ctx.fillStyle = "rgba(0, 0, 255, 0.2)";
      ctx.fill();
    }
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Draw radial connection lines from center to vertices
    ctx.save();
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    if (highlightHexagon) {
      points.forEach((p, i) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = hoveredPointIndex === i && selectedShape === "hexagon" ? "orange" : "yellow";
        ctx.fill();
        ctx.restore();
      });
    }

    // Show angle values when enabled
    if (showHexagonAngles) {
      points.forEach((point, idx) => {
        const currentAngle = (customHexagonAngles[idx] + hexagonRotation + settings.rotation) % 360;
        
        ctx.save();
        ctx.fillStyle = "#000080"; // Dark blue color
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Position text slightly outside the point
        const textOffset = 20;
        const textAngle = ((customHexagonAngles[idx] + hexagonRotation + settings.rotation - 90) * Math.PI) / 180;
        const textX = center + (r + textOffset) * Math.cos(textAngle);
        const textY = center + (r + textOffset) * Math.sin(textAngle);
        
        ctx.fillText(`${currentAngle.toFixed(0)}Â°`, textX, textY);
        ctx.restore();
      });
    }

    // **Ø±Ø³Ù… Ø±Ø¤ÙˆØ³ Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠ Ø¨Ù„ÙˆÙ† Ø£Ø²Ø±Ù‚ ØºØ§Ù…Ù‚ Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ø¸Ø§Ù‡Ø±Ø© - ÙÙŠ Ø§Ù„Ù†Ù‡Ø§ÙŠØ© Ù„ÙŠÙƒÙˆÙ†ÙˆØ§ ÙÙˆÙ‚ ÙƒÙ„ Ø´ÙŠØ¡**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI); // Ø¯Ø§Ø¦Ø±Ø© Ø£ÙƒØ¨Ø± Ù‚Ù„ÙŠÙ„Ø§Ù‹
      ctx.fillStyle = "#1E90FF"; // Ø£Ø²Ø±Ù‚ ÙØ§ØªØ­ (DodgerBlue)
      ctx.fill();
      ctx.strokeStyle = "#0000CD"; // Ø­Ø¯ÙˆØ¯ Ø£Ø²Ø±Ù‚ Ø£ØºÙ…Ù‚
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Ø¥Ø¶Ø§ÙØ© Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ© ØµØºÙŠØ±Ø© Ù„Ù„ØªØ£ÙƒÙŠØ¯
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#0000CD"; // Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ© Ø£ØºÙ…Ù‚
      ctx.fill();
      ctx.restore();
    });
  }

  function drawOctagon(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = customOctagonAngles.map((deg) => {
      const rad = ((deg + octagonRotation + settings.rotation - 90) * Math.PI) / 180;
      return {
        x: center + r * Math.cos(rad),
        y: center + r * Math.sin(rad),
      };
    });

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, i) => {
      if (i > 0) ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    
    if (fillOctagon) {
      ctx.fillStyle = "rgba(128, 0, 128, 0.2)";
      ctx.fill();
    }
    ctx.strokeStyle = "purple";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Draw radial connection lines from center to vertices
    ctx.save();
    ctx.strokeStyle = "purple";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    if (highlightOctagon) {
      points.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.restore();
      });
    }

    // Ø¹Ø±Ø¶ Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ù†ØµÙŠØ© Ø¹Ù†Ø¯ Ø§Ù„Ø±Ø¤ÙˆØ³
    if (showOctagonAngles) {
      points.forEach((point, i) => {
        const angle = (customOctagonAngles[i] + octagonRotation + settings.rotation) % 360;
        ctx.save();
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "purple";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(`${angle.toFixed(0)}Â°`, point.x, point.y - 12);
        ctx.restore();
      });
    }

    // **Ø±Ø³Ù… Ø±Ø¤ÙˆØ³ Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø«Ù…Ø§Ù†ÙŠ Ø¨Ù„ÙˆÙ† Ø¨Ù†ÙØ³Ø¬ÙŠ Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ø¸Ø§Ù‡Ø±Ø© - ÙÙŠ Ø§Ù„Ù†Ù‡Ø§ÙŠØ© Ù„ÙŠÙƒÙˆÙ†ÙˆØ§ ÙÙˆÙ‚ ÙƒÙ„ Ø´ÙŠØ¡**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI); // Ø¯Ø§Ø¦Ø±Ø© Ø£ÙƒØ¨Ø± Ù‚Ù„ÙŠÙ„Ø§Ù‹
      ctx.fillStyle = "#9932CC"; // Ø¨Ù†ÙØ³Ø¬ÙŠ ØºØ§Ù…Ù‚ (DarkOrchid)
      ctx.fill();
      ctx.strokeStyle = "#4B0082"; // Ø­Ø¯ÙˆØ¯ Ø¨Ù†ÙØ³Ø¬ÙŠ Ø£ØºÙ…Ù‚
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Ø¥Ø¶Ø§ÙØ© Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ© ØµØºÙŠØ±Ø© Ù„Ù„ØªØ£ÙƒÙŠØ¯
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#4B0082"; // Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ© Ø£ØºÙ…Ù‚
      ctx.fill();
      ctx.restore();
    });
  }

  // Drawing heptagon (7 sides)
  function drawHeptagon(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = [];
    for (let i = 0; i < 7; i++) {
      const angle = ((i * 360 / 7) + heptagonRotation + settings.rotation - 90) * Math.PI / 180;
      points.push({
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      });
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, i) => {
      if (i > 0) ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    
    if (fillHeptagon) {
      ctx.fillStyle = "rgba(255, 165, 0, 0.2)";
      ctx.fill();
    }
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Draw radial connection lines from center to vertices
    ctx.save();
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    if (highlightHeptagon) {
      points.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.restore();
      });
    }

    // Ø¹Ø±Ø¶ Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ù†ØµÙŠØ© Ø¹Ù†Ø¯ Ø§Ù„Ø±Ø¤ÙˆØ³
    if (showHeptagonAngles) {
      points.forEach((point, i) => {
        const angle = ((i * 360 / 7) + heptagonRotation + settings.rotation) % 360;
        ctx.save();
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "orange";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(`${angle.toFixed(0)}Â°`, point.x, point.y - 12);
        ctx.restore();
      });
    }

    // **Ø±Ø³Ù… Ø±Ø¤ÙˆØ³ Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø³Ø¨Ø§Ø¹ÙŠ Ø¨Ù„ÙˆÙ† Ø¨Ø±ØªÙ‚Ø§Ù„ÙŠ ØºØ§Ù…Ù‚ Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ø¸Ø§Ù‡Ø±Ø© - ÙÙŠ Ø§Ù„Ù†Ù‡Ø§ÙŠØ© Ù„ÙŠÙƒÙˆÙ†ÙˆØ§ ÙÙˆÙ‚ ÙƒÙ„ Ø´ÙŠØ¡**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI); // Ø¯Ø§Ø¦Ø±Ø© Ø£ÙƒØ¨Ø± Ù‚Ù„ÙŠÙ„Ø§Ù‹
      ctx.fillStyle = "#FF8C00"; // Ø¨Ø±ØªÙ‚Ø§Ù„ÙŠ ØºØ§Ù…Ù‚ (DarkOrange)
      ctx.fill();
      ctx.strokeStyle = "#FF4500"; // Ø­Ø¯ÙˆØ¯ Ø¨Ø±ØªÙ‚Ø§Ù„ÙŠ Ø£ØºÙ…Ù‚
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Ø¥Ø¶Ø§ÙØ© Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ© ØµØºÙŠØ±Ø© Ù„Ù„ØªØ£ÙƒÙŠØ¯
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#FF4500"; // Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ© Ø£ØºÙ…Ù‚
      ctx.fill();
      ctx.restore();
    });
  }

  // Drawing nonagon (9 sides)
  function drawNonagon(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = [];
    for (let i = 0; i < 9; i++) {
      const angle = ((i * 360 / 9) + nonagonRotation + settings.rotation - 90) * Math.PI / 180;
      points.push({
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      });
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, i) => {
      if (i > 0) ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    
    if (fillNonagon) {
      ctx.fillStyle = "rgba(255, 192, 203, 0.2)";
      ctx.fill();
    }
    ctx.strokeStyle = "pink";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Draw radial connection lines from center to vertices
    ctx.save();
    ctx.strokeStyle = "pink";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    if (highlightNonagon) {
      points.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.restore();
      });
    }

    // Ø¹Ø±Ø¶ Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ù†ØµÙŠØ© Ø¹Ù†Ø¯ Ø§Ù„Ø±Ø¤ÙˆØ³
    if (showNonagonAngles) {
      points.forEach((point, i) => {
        const angle = ((i * 360 / 9) + nonagonRotation + settings.rotation) % 360;
        ctx.save();
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "pink";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(`${angle.toFixed(0)}Â°`, point.x, point.y - 12);
        ctx.restore();
      });
    }

    // **Ø±Ø³Ù… Ø±Ø¤ÙˆØ³ Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„ØªØ³Ø§Ø¹ÙŠ Ø¨Ù„ÙˆÙ† ÙˆØ±Ø¯ÙŠ ØºØ§Ù…Ù‚ Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ø¸Ø§Ù‡Ø±Ø© - ÙÙŠ Ø§Ù„Ù†Ù‡Ø§ÙŠØ© Ù„ÙŠÙƒÙˆÙ†ÙˆØ§ ÙÙˆÙ‚ ÙƒÙ„ Ø´ÙŠØ¡**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI); // Ø¯Ø§Ø¦Ø±Ø© Ø£ÙƒØ¨Ø± Ù‚Ù„ÙŠÙ„Ø§Ù‹
      ctx.fillStyle = "#FF69B4"; // ÙˆØ±Ø¯ÙŠ Ø³Ø§Ø®Ù† (HotPink)
      ctx.fill();
      ctx.strokeStyle = "#FF1493"; // Ø­Ø¯ÙˆØ¯ ÙˆØ±Ø¯ÙŠ Ø£ØºÙ…Ù‚
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Ø¥Ø¶Ø§ÙØ© Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ© ØµØºÙŠØ±Ø© Ù„Ù„ØªØ£ÙƒÙŠØ¯
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#FF1493"; // Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ© Ø£ØºÙ…Ù‚
      ctx.fill();
      ctx.restore();
    });
  }

  // Drawing decagon (10 sides)
  function drawDecagon(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = [];
    for (let i = 0; i < 10; i++) {
      const angle = ((i * 360 / 10) + decagonRotation + settings.rotation - 90) * Math.PI / 180;
      points.push({
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      });
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, i) => {
      if (i > 0) ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    
    if (fillDecagon) {
      ctx.fillStyle = "rgba(0, 255, 255, 0.2)";
      ctx.fill();
    }
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Draw radial connection lines from center to vertices
    ctx.save();
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    if (highlightDecagon) {
      points.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.restore();
      });
    }

    // Ø¹Ø±Ø¶ Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ù†ØµÙŠØ© Ø¹Ù†Ø¯ Ø§Ù„Ø±Ø¤ÙˆØ³
    if (showDecagonAngles) {
      points.forEach((point, i) => {
        const angle = ((i * 360 / 10) + decagonRotation + settings.rotation) % 360;
        ctx.save();
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "cyan";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(`${angle.toFixed(0)}Â°`, point.x, point.y - 12);
        ctx.restore();
      });
    }

    // **Ø±Ø³Ù… Ø±Ø¤ÙˆØ³ Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø¹Ø´Ø±ÙŠ Ø¨Ù„ÙˆÙ† Ø³Ù…Ø§ÙˆÙŠ ØºØ§Ù…Ù‚ Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ø¸Ø§Ù‡Ø±Ø© - ÙÙŠ Ø§Ù„Ù†Ù‡Ø§ÙŠØ© Ù„ÙŠÙƒÙˆÙ†ÙˆØ§ ÙÙˆÙ‚ ÙƒÙ„ Ø´ÙŠØ¡**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI); // Ø¯Ø§Ø¦Ø±Ø© Ø£ÙƒØ¨Ø± Ù‚Ù„ÙŠÙ„Ø§Ù‹
      ctx.fillStyle = "#00CED1"; // Ø³Ù…Ø§ÙˆÙŠ ØºØ§Ù…Ù‚ (DarkTurquoise)
      ctx.fill();
      ctx.strokeStyle = "#008B8B"; // Ø­Ø¯ÙˆØ¯ Ø³Ù…Ø§ÙˆÙŠ Ø£ØºÙ…Ù‚
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Ø¥Ø¶Ø§ÙØ© Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ© ØµØºÙŠØ±Ø© Ù„Ù„ØªØ£ÙƒÙŠØ¯
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#008B8B"; // Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ© Ø£ØºÙ…Ù‚
      ctx.fill();
      ctx.restore();
    });
  }

  // Drawing hendecagon (11 sides)
  function drawHendecagon(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = [];
    for (let i = 0; i < 11; i++) {
      const angle = ((i * 360 / 11) + hendecagonRotation + settings.rotation - 90) * Math.PI / 180;
      points.push({
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      });
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, i) => {
      if (i > 0) ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    
    if (fillHendecagon) {
      ctx.fillStyle = "rgba(255, 20, 147, 0.2)";
      ctx.fill();
    }
    ctx.strokeStyle = "deeppink";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Draw radial connection lines from center to vertices
    ctx.save();
    ctx.strokeStyle = "deeppink";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    if (highlightHendecagon) {
      points.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.restore();
      });
    }

    // **Ø¹Ø±Ø¶ Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ù†ØµÙŠØ© Ø¹Ù†Ø¯ Ø§Ù„Ø±Ø¤ÙˆØ³ Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ù„Ù„Ø´ÙƒÙ„ Ø§Ù„Ø­Ø§Ø¯ÙŠ Ø¹Ø´Ø±**
    points.forEach((point, i) => {
      const angle = ((i * 360 / 11) + hendecagonRotation + settings.rotation) % 360;
      ctx.save();
      ctx.font = "bold 14px Arial";
      ctx.fillStyle = "deeppink";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`${angle.toFixed(0)}Â°`, point.x, point.y - 12);
      ctx.restore();
    });

    // **Ø±Ø³Ù… Ø±Ø¤ÙˆØ³ Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø£Ø­Ø¯ Ø¹Ø´Ø±ÙŠ Ø¨Ù„ÙˆÙ† ÙˆØ±Ø¯ÙŠ Ø¹Ù…ÙŠÙ‚ Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ø¸Ø§Ù‡Ø±Ø© - ÙÙŠ Ø§Ù„Ù†Ù‡Ø§ÙŠØ© Ù„ÙŠÙƒÙˆÙ†ÙˆØ§ ÙÙˆÙ‚ ÙƒÙ„ Ø´ÙŠØ¡**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI); // Ø¯Ø§Ø¦Ø±Ø© Ø£ÙƒØ¨Ø± Ù‚Ù„ÙŠÙ„Ø§Ù‹
      ctx.fillStyle = "#FF1493"; // ÙˆØ±Ø¯ÙŠ Ø¹Ù…ÙŠÙ‚ (DeepPink)
      ctx.fill();
      ctx.strokeStyle = "#C71585"; // Ø­Ø¯ÙˆØ¯ ÙˆØ±Ø¯ÙŠ Ø£ØºÙ…Ù‚
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Ø¥Ø¶Ø§ÙØ© Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ© ØµØºÙŠØ±Ø© Ù„Ù„ØªØ£ÙƒÙŠØ¯
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#C71585"; // Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ© Ø£ØºÙ…Ù‚
      ctx.fill();
      ctx.restore();
    });
  }

  // Drawing dodecagon (12 sides)
  function drawDodecagon(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = [];
    for (let i = 0; i < 12; i++) {
      const angle = ((i * 360 / 12) + dodecagonRotation + settings.rotation - 90) * Math.PI / 180;
      points.push({
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      });
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, i) => {
      if (i > 0) ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    
    if (fillDodecagon) {
      ctx.fillStyle = "rgba(255, 69, 0, 0.2)";
      ctx.fill();
    }
    ctx.strokeStyle = "orangered";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Draw radial connection lines from center to vertices
    ctx.save();
    ctx.strokeStyle = "orangered";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    if (highlightDodecagon) {
      points.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.restore();
      });
    }

    // **Ø¹Ø±Ø¶ Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ù†ØµÙŠØ© Ø¹Ù†Ø¯ Ø§Ù„Ø±Ø¤ÙˆØ³ Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ù„Ù„Ø´ÙƒÙ„ Ø§Ù„Ø§Ø«Ù†ÙŠ Ø¹Ø´Ø±ÙŠ**
    points.forEach((point, i) => {
      const angle = ((i * 360 / 12) + dodecagonRotation + settings.rotation) % 360;
      ctx.save();
      ctx.font = "bold 14px Arial";
      ctx.fillStyle = "orangered";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`${angle.toFixed(0)}Â°`, point.x, point.y - 12);
      ctx.restore();
    });

    // **Ø±Ø³Ù… Ø±Ø¤ÙˆØ³ Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø§Ø«Ù†ÙŠ Ø¹Ø´Ø±ÙŠ Ø¨Ù„ÙˆÙ† Ø¨Ø±ØªÙ‚Ø§Ù„ÙŠ Ù…Ø­Ù…Ø± Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ø¸Ø§Ù‡Ø±Ø© - ÙÙŠ Ø§Ù„Ù†Ù‡Ø§ÙŠØ© Ù„ÙŠÙƒÙˆÙ†ÙˆØ§ ÙÙˆÙ‚ ÙƒÙ„ Ø´ÙŠØ¡**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI); // Ø¯Ø§Ø¦Ø±Ø© Ø£ÙƒØ¨Ø± Ù‚Ù„ÙŠÙ„Ø§Ù‹
      ctx.fillStyle = "#FF6347"; // Ø¨Ø±ØªÙ‚Ø§Ù„ÙŠ Ù…Ø­Ù…Ø± (Tomato)
      ctx.fill();
      ctx.strokeStyle = "#CD5C5C"; // Ø­Ø¯ÙˆØ¯ Ø£Ø­Ù…Ø± ÙØ§ØªØ­
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Ø¥Ø¶Ø§ÙØ© Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ© ØµØºÙŠØ±Ø© Ù„Ù„ØªØ£ÙƒÙŠØ¯
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#CD5C5C"; // Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ© Ø£ØºÙ…Ù‚
      ctx.fill();
      ctx.restore();
    });
  }

  // Drawing star variations
  function drawStar4(ctx, center, radius) {
    const r = degreeRingRadius;
    
    // Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø±Ø¨Ø§Ø¹ÙŠØ© Ø§Ù„ØµØ­ÙŠØ­Ø©: Ø£Ø±Ø¨Ø¹Ø© Ø±Ø¤ÙˆØ³ Ø¨Ø²Ø§ÙˆÙŠØ© 135Â°
    // Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø£Ø±Ø¨Ø¹Ø© Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ© Ù„Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø±Ø¨Ø§Ø¹ÙŠØ©
    const mainPoints = customStar4Angles.map((deg) => {
      const rad = ((deg + star4Rotation + settings.rotation - 90) * Math.PI) / 180;
      return {
        x: center + r * Math.cos(rad),
        y: center + r * Math.sin(rad),
      };
    });

    // Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ© Ù„Ù„Ù†Ø¬Ù…Ø© (Ø¹Ù„Ù‰ Ù…Ø³Ø§ÙØ© Ø£Ù‚Ù„ Ù…Ù† Ø§Ù„Ù…Ø±ÙƒØ²)
    const innerRadius = r * 0.4; // 40% Ù…Ù† Ø§Ù„Ø´Ø¹Ø§Ø¹ Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠ
    const innerPoints = [45, 135, 225, 315].map((deg) => {
      const rad = ((deg + star4Rotation + settings.rotation - 90) * Math.PI) / 180;
      return {
        x: center + innerRadius * Math.cos(rad),
        y: center + innerRadius * Math.sin(rad),
      };
    });

    ctx.save();
    
    // Ø±Ø³Ù… Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø±Ø¨Ø§Ø¹ÙŠØ© Ø¨ØªÙ†Ø§ÙˆØ¨ Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© ÙˆØ§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©
    ctx.beginPath();
    
    // Ø§Ù„Ø¨Ø¯Ø¡ Ù…Ù† Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ø£ÙˆÙ„Ù‰ Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ©
    ctx.moveTo(mainPoints[0].x, mainPoints[0].y);
    
    // Ø±Ø³Ù… Ø§Ù„Ù†Ø¬Ù…Ø© Ø¨Ø§Ù„ØªÙ†Ø§ÙˆØ¨ Ø¨ÙŠÙ† Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© ÙˆØ§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©
    for (let i = 0; i < 4; i++) {
      // Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„ Ø¥Ù„Ù‰ Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©
      ctx.lineTo(innerPoints[i].x, innerPoints[i].y);
      // Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„ Ø¥Ù„Ù‰ Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© Ø§Ù„ØªØ§Ù„ÙŠØ©
      ctx.lineTo(mainPoints[(i + 1) % 4].x, mainPoints[(i + 1) % 4].y);
    }
    
    ctx.closePath();
    
    if (fillStar4) {
      ctx.fillStyle = "rgba(255, 215, 0, 0.2)";
      ctx.fill();
    }
    ctx.strokeStyle = "gold";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Ø¬Ù…Ø¹ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù†Ù‚Ø§Ø· Ù„Ù„ØªÙØ§Ø¹Ù„ (8 Ù†Ù‚Ø§Ø·: 4 Ø®Ø§Ø±Ø¬ÙŠØ© + 4 Ø¯Ø§Ø®Ù„ÙŠØ©)
    const allPoints = [];
    for (let i = 0; i < 4; i++) {
      allPoints.push(mainPoints[i]);
      allPoints.push(innerPoints[i]);
    }

    // Ø±Ø³Ù… Ø®Ø·ÙˆØ· Ø§Ù„Ø§ØªØµØ§Ù„ Ù…Ù† Ø§Ù„Ù…Ø±ÙƒØ² Ø¥Ù„Ù‰ Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© ÙÙ‚Ø·
    ctx.save();
    ctx.strokeStyle = "gold";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    mainPoints.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    // ØªÙ…ÙŠÙŠØ² Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© Ø¹Ù†Ø¯ Ø§Ù„ØªÙØ¹ÙŠÙ„
    if (highlightStar4) {
      mainPoints.forEach((p, i) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = hoveredPointIndex === i && selectedShape === "star4" ? "orange" : "yellow";
        ctx.fill();
        ctx.restore();
      });
    }

    // Ø¹Ø±Ø¶ Ù‚ÙŠÙ… Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ø¹Ù†Ø¯ Ø§Ù„ØªÙØ¹ÙŠÙ„
    if (showStar4Angles) {
      const angles = [0, 90, 180, 270];
      mainPoints.forEach((point, idx) => {
        const currentAngle = (angles[idx] + star4Rotation + settings.rotation) % 360;
        
        ctx.save();
        ctx.fillStyle = "#B8860B"; // Ù„ÙˆÙ† Ø°Ù‡Ø¨ÙŠ ØºØ§Ù…Ù‚
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // ÙˆØ¶Ø¹ Ø§Ù„Ù†Øµ Ø®Ø§Ø±Ø¬ Ø§Ù„Ù†Ù‚Ø·Ø© Ù‚Ù„ÙŠÙ„Ø§Ù‹
        const textOffset = 20;
        const textAngle = ((angles[idx] + star4Rotation + settings.rotation - 90) * Math.PI) / 180;
        const textX = center + (r + textOffset) * Math.cos(textAngle);
        const textY = center + (r + textOffset) * Math.sin(textAngle);
        
        ctx.fillText(`${currentAngle.toFixed(0)}Â°`, textX, textY);
        ctx.restore();
      });
    }

    // **Ø±Ø³Ù… Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø±Ø¨Ø§Ø¹ÙŠØ© Ø¨Ù„ÙˆÙ† ÙØ¶ÙŠ Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ø¸Ø§Ù‡Ø±Ø© - ÙÙŠ Ø§Ù„Ù†Ù‡Ø§ÙŠØ© Ù„ÙŠÙƒÙˆÙ†ÙˆØ§ ÙÙˆÙ‚ ÙƒÙ„ Ø´ÙŠØ¡**
    mainPoints.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#C0C0C0"; // ÙØ¶ÙŠ
      ctx.fill();
      ctx.strokeStyle = "#808080"; // Ø­Ø¯ÙˆØ¯ Ø±Ù…Ø§Ø¯ÙŠ ØºØ§Ù…Ù‚
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ©
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#808080";
      ctx.fill();
      ctx.restore();
    });
  }

  function drawStar3(ctx, center, radius) {
    console.log("Drawing star3 with radius:", radius, "rotation:", star3Rotation, "mode:", star3DrawMode);
    console.log("Using degreeRingRadius:", degreeRingRadius, "instead of passed radius:", radius);
    
    // Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù„Ø§Ø«ÙŠØ© Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ© - Ù†Ø¬Ù…Ø© Ø«Ù„Ø§Ø«ÙŠØ© Ø§Ù„Ø£Ø·Ø±Ø§Ù Ù…ØªØµÙ„Ø©
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 2;
    
    // Ø±Ø¨Ø· Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù„Ø§Ø«ÙŠØ© Ø¨Ø­Ù„Ù‚Ø© Ø§Ù„Ø¯Ø±Ø¬Ø§Øª Ù…Ø«Ù„ Ø§Ù„Ù…Ø«Ù„Ø« - ØªØ¬Ø§Ù‡Ù„ Ù…Ø¹Ø§Ù…Ù„ radius ÙˆØ§Ø³ØªØ®Ø¯Ù… degreeRingRadius
    const r = degreeRingRadius;
    
    if (star3DrawMode === "lines") {
      // Ø±Ø³Ù… Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù„Ø§Ø«ÙŠØ© ÙƒÙ†Ø¬Ù…Ø© Ù…ØªØµÙ„Ø© Ù…Ù† Ø§Ù„Ù…Ø±ÙƒØ² Ø¥Ù„Ù‰ 3 Ù†Ù‚Ø§Ø· Ø®Ø§Ø±Ø¬ÙŠØ©
      // Ø«Ù… Ø±Ø¨Ø· Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© Ø¨Ø¨Ø¹Ø¶Ù‡Ø§ Ù„ØªÙƒÙˆÙŠÙ† Ù…Ø«Ù„Ø« Ø®Ø§Ø±Ø¬ÙŠ
      
      const outerRadius = r; // Ø§Ø³ØªØ®Ø¯Ø§Ù… degreeRingRadius Ø¨Ø¯Ù„Ø§Ù‹ Ù…Ù† radius
      const innerRadius = r * 0.3; // Ù†ØµÙ Ù‚Ø·Ø± Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©
      
      // Ø­Ø³Ø§Ø¨ Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© (Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø©)
      const outerPoints = [];
      for (let i = 0; i < 3; i++) {
        const angle = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
        const x = center + outerRadius * Math.cos(angle);
        const y = center + outerRadius * Math.sin(angle);
        outerPoints.push({ x, y });
      }
      
      // Ø­Ø³Ø§Ø¨ Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ© (Ø¨ÙŠÙ† ÙƒÙ„ Ø±Ø£Ø³ÙŠÙ†)
      const innerPoints = [];
      for (let i = 0; i < 3; i++) {
        const angle1 = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
        const angle2 = ((customStar3Angles[(i + 1) % 3]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
        
        // Ø§Ù„Ø²Ø§ÙˆÙŠØ© ÙÙŠ Ù…Ù†ØªØµÙ Ø§Ù„Ù…Ø³Ø§ÙØ© Ø¨ÙŠÙ† Ø§Ù„Ù†Ù‚Ø·ØªÙŠÙ† Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØªÙŠÙ†
        let midAngle = (angle1 + angle2) / 2;
        
        // ØªØµØ­ÙŠØ­ Ø§Ù„Ø²Ø§ÙˆÙŠØ© Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù‡Ù†Ø§Ùƒ ÙØ¬ÙˆØ© ÙƒØ¨ÙŠØ±Ø© (Ø¹Ø¨ÙˆØ± Ø§Ù„Ù€ 360 Ø¯Ø±Ø¬Ø©)
        if (Math.abs(angle2 - angle1) > Math.PI) {
          midAngle += Math.PI;
        }
        
        const x = center + innerRadius * Math.cos(midAngle);
        const y = center + innerRadius * Math.sin(midAngle);
        innerPoints.push({ x, y });
      }
      
      // Ø±Ø³Ù… Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù„Ø§Ø«ÙŠØ© Ø§Ù„Ù…ØªØµÙ„Ø©
      ctx.beginPath();
      
      // Ø§Ù„Ø¨Ø¯Ø¡ Ù…Ù† Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© Ø§Ù„Ø£ÙˆÙ„Ù‰
      ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
      
      // Ø±Ø³Ù… Ø§Ù„Ù†Ø¬Ù…Ø© Ø¨Ø§Ù„ØªÙ†Ù‚Ù„ Ø¨ÙŠÙ† Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© ÙˆØ§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©
      for (let i = 0; i < 3; i++) {
        const currentOuter = outerPoints[i];
        const nextInner = innerPoints[i];
        const nextOuter = outerPoints[(i + 1) % 3];
        
        // Ù…Ù† Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© Ø¥Ù„Ù‰ Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©
        ctx.lineTo(nextInner.x, nextInner.y);
        // Ù…Ù† Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ© Ø¥Ù„Ù‰ Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© Ø§Ù„ØªØ§Ù„ÙŠØ©
        ctx.lineTo(nextOuter.x, nextOuter.y);
      }
      
      ctx.closePath();
      ctx.stroke();
      
      // ØªØ¹Ø¨Ø¦Ø© Ø§Ù„Ù†Ø¬Ù…Ø© Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…ÙØ¹Ù„Ø©
      if (fillStar3) {
        ctx.fillStyle = "rgba(255, 215, 0, 0.3)";
        ctx.fill();
      }
      
      // Ø±Ø³Ù… Ø§Ù„Ù†Ù‚Ø§Ø· Ø¥Ø°Ø§ ÙƒØ§Ù† Ø§Ù„ØªÙ…ÙŠÙŠØ² Ù…ÙØ¹Ù„
      if (highlightStar3) {
        // Ù†Ù‚Ø§Ø· Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© (ØµÙØ±Ø§Ø¡)
        outerPoints.forEach((point, idx) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 7, 0, 2 * Math.PI);
          // ØªØºÙŠÙŠØ± Ø§Ù„Ù„ÙˆÙ† Ø¹Ù†Ø¯ hover
          ctx.fillStyle = hoveredPointIndex === idx && selectedShape === "star3" ? "orange" : "yellow";
          ctx.fill();
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 1;
          ctx.stroke();
        });
        
        // Ù†Ù‚Ø§Ø· Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ© (Ø¨Ø±ØªÙ‚Ø§Ù„ÙŠØ©)
        innerPoints.forEach((point, idx) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
          // ØªØºÙŠÙŠØ± Ø§Ù„Ù„ÙˆÙ† Ø¹Ù†Ø¯ hover (Ø¥Ø¶Ø§ÙØ© 3 Ù„Ù„ÙÙ‡Ø±Ø³ Ù„Ø£Ù† Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ© ØªØ£ØªÙŠ Ø¨Ø¹Ø¯ Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ©)
          ctx.fillStyle = hoveredPointIndex === (idx + 3) && selectedShape === "star3" ? "red" : "orange";
          ctx.fill();
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      }
      
    } else {
      // Ø±Ø³Ù… Ù…Ø«Ù„Ø« Ù…Ù†ØªØ¸Ù… ÙÙ‚Ø·
      const trianglePoints = [];
      for (let i = 0; i < 3; i++) {
        const angle = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
        const x = center + r * Math.cos(angle); // Ø§Ø³ØªØ®Ø¯Ø§Ù… r (degreeRingRadius)
        const y = center + r * Math.sin(angle); // Ø§Ø³ØªØ®Ø¯Ø§Ù… r (degreeRingRadius)
        trianglePoints.push({ x, y });
      }
      
      ctx.beginPath();
      ctx.moveTo(trianglePoints[0].x, trianglePoints[0].y);
      ctx.lineTo(trianglePoints[1].x, trianglePoints[1].y);
      ctx.lineTo(trianglePoints[2].x, trianglePoints[2].y);
      ctx.closePath();
      ctx.stroke();
      
      // ØªØ¹Ø¨Ø¦Ø© Ø§Ù„Ù…Ø«Ù„Ø«
      if (fillStar3) {
        ctx.fillStyle = "rgba(255, 215, 0, 0.3)";
        ctx.fill();
      }
      
      // Ø±Ø³Ù… Ù†Ù‚Ø§Ø· Ø§Ù„Ø±Ø¤ÙˆØ³
      if (highlightStar3) {
        trianglePoints.forEach((point, idx) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
          // ØªØºÙŠÙŠØ± Ø§Ù„Ù„ÙˆÙ† Ø¹Ù†Ø¯ hover
          ctx.fillStyle = hoveredPointIndex === idx && selectedShape === "star3" ? "orange" : "yellow";
          ctx.fill();
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      }
    }
    
    // Ø¹Ø±Ø¶ Ø§Ù„Ø²ÙˆØ§ÙŠØ§
    if (showStar3Angles) {
      if (star3DrawMode === "lines") {
        // Ø¹Ø±Ø¶ Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù„Ø§Ø«ÙŠØ© - Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© ÙˆØ§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©
        const outerAngles = customStar3Angles.map(angle => (angle + star3Rotation + settings.rotation - 90) % 360);
        
        // Ø±Ø³Ù… Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© (Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø©)
        outerAngles.forEach((angle, i) => {
          ctx.save();
          ctx.fillStyle = "#006400";
          ctx.font = "bold 18px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 3;
          
          const textOffset = 30;
          const textAngle = (angle - 90) * Math.PI / 180;
          const textX = center + (degreeRingRadius + textOffset) * Math.cos(textAngle);
          const textY = center + (degreeRingRadius + textOffset) * Math.sin(textAngle);
          
          // Ø±Ø³Ù… Ø­Ø¯ÙˆØ¯ Ø¨ÙŠØ¶Ø§Ø¡ Ù„Ù„Ù†Øµ Ù„Ø¬Ø¹Ù„Ù‡ Ø£ÙƒØ«Ø± ÙˆØ¶ÙˆØ­Ø§Ù‹
          ctx.strokeText(`${angle.toFixed(0)}Â°`, textX, textY);
          ctx.fillText(`${angle.toFixed(0)}Â°`, textX, textY);
          ctx.restore();
        });
        
        // Ø±Ø³Ù… Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©
        for (let i = 0; i < 3; i++) {
          const angle1 = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
          const angle2 = ((customStar3Angles[(i + 1) % 3]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
          
          let midAngle = (angle1 + angle2) / 2;
          if (Math.abs(angle2 - angle1) > Math.PI) {
            midAngle += Math.PI;
          }
          
          const innerAngle = (midAngle * 180 / Math.PI) % 360;
          
          ctx.save();
          ctx.fillStyle = "#228B22";
          ctx.font = "bold 15px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 2;
          
          const textOffset = 20;
          const innerRadius = degreeRingRadius * 0.3;
          const textX = center + (innerRadius + textOffset) * Math.cos(midAngle);
          const textY = center + (innerRadius + textOffset) * Math.sin(midAngle);
          
          // Ø±Ø³Ù… Ø­Ø¯ÙˆØ¯ Ø¨ÙŠØ¶Ø§Ø¡ Ù„Ù„Ù†Øµ Ù„Ø¬Ø¹Ù„Ù‡ Ø£ÙƒØ«Ø± ÙˆØ¶ÙˆØ­Ø§Ù‹
          ctx.strokeText(`${innerAngle.toFixed(0)}Â°`, textX, textY);
          ctx.fillText(`${innerAngle.toFixed(0)}Â°`, textX, textY);
          ctx.restore();
        }
      } else {
        // Ø¹Ø±Ø¶ Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ù…Ø«Ù„Ø« Ø§Ù„Ø¨Ø³ÙŠØ·
        const angles = customStar3Angles.map(angle => (angle + star3Rotation + settings.rotation - 90) % 360);
          
        angles.forEach((angle, i) => {
          ctx.save();
          ctx.fillStyle = "#006400";
          ctx.font = "bold 16px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 3;
          
          const textOffset = 30;
          const textAngle = (angle - 90) * Math.PI / 180;
          const textX = center + (degreeRingRadius + textOffset) * Math.cos(textAngle);
          const textY = center + (degreeRingRadius + textOffset) * Math.sin(textAngle);
          
          // Ø±Ø³Ù… Ø­Ø¯ÙˆØ¯ Ø¨ÙŠØ¶Ø§Ø¡ Ù„Ù„Ù†Øµ Ù„Ø¬Ø¹Ù„Ù‡ Ø£ÙƒØ«Ø± ÙˆØ¶ÙˆØ­Ø§Ù‹
          ctx.strokeText(`${angle.toFixed(0)}Â°`, textX, textY);
          ctx.fillText(`${angle.toFixed(0)}Â°`, textX, textY);
          ctx.restore();
        });
      }
    }
    
    // **Ø±Ø³Ù… Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù„Ø§Ø«ÙŠØ© Ø¨Ù„ÙˆÙ† Ø°Ù‡Ø¨ÙŠ Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ø¸Ø§Ù‡Ø±Ø© - ÙÙŠ Ø§Ù„Ù†Ù‡Ø§ÙŠØ© Ù„ÙŠÙƒÙˆÙ†ÙˆØ§ ÙÙˆÙ‚ ÙƒÙ„ Ø´ÙŠØ¡**
    if (star3DrawMode === "lines") {
      const outerRadius = degreeRingRadius;
      const innerRadius = degreeRingRadius * 0.3;
      
      // Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© (Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø©)
      const outerPoints = [];
      for (let i = 0; i < 3; i++) {
        const angle = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
        const x = center + outerRadius * Math.cos(angle);
        const y = center + outerRadius * Math.sin(angle);
        outerPoints.push({ x, y });
      }
      
      // Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©
      const innerPoints = [];
      for (let i = 0; i < 3; i++) {
        const angle1 = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
        const angle2 = ((customStar3Angles[(i + 1) % 3]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
        
        let midAngle = (angle1 + angle2) / 2;
        if (Math.abs(angle2 - angle1) > Math.PI) {
          midAngle += Math.PI;
        }
        
        const x = center + innerRadius * Math.cos(midAngle);
        const y = center + innerRadius * Math.sin(midAngle);
        innerPoints.push({ x, y });
      }
      
      // Ø±Ø³Ù… Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© (Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©)
      outerPoints.forEach((point, i) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = "#FFD700"; // Ø°Ù‡Ø¨ÙŠ
        ctx.fill();
        ctx.strokeStyle = "#B8860B"; // Ø­Ø¯ÙˆØ¯ Ø°Ù‡Ø¨ÙŠ ØºØ§Ù…Ù‚
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ©
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "#B8860B";
        ctx.fill();
        ctx.restore();
      });
      
      // Ø±Ø³Ù… Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©
      innerPoints.forEach((point, i) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = "#DAA520"; // Ø°Ù‡Ø¨ÙŠ Ø£ØºÙ…Ù‚
        ctx.fill();
        ctx.strokeStyle = "#8B7D00"; // Ø­Ø¯ÙˆØ¯ Ø°Ù‡Ø¨ÙŠ Ø£ØºÙ…Ù‚
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ©
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
        ctx.fillStyle = "#8B7D00";
        ctx.fill();
        ctx.restore();
      });
    } else {
      // Ø±Ø¤ÙˆØ³ Ø§Ù„Ù…Ø«Ù„Ø« Ø§Ù„Ø¨Ø³ÙŠØ·
      const trianglePoints = [];
      for (let i = 0; i < 3; i++) {
        const angle = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
        const x = center + degreeRingRadius * Math.cos(angle);
        const y = center + degreeRingRadius * Math.sin(angle);
        trianglePoints.push({ x, y });
      }
      
      trianglePoints.forEach((point, i) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = "#FFD700"; // Ø°Ù‡Ø¨ÙŠ
        ctx.fill();
        ctx.strokeStyle = "#B8860B"; // Ø­Ø¯ÙˆØ¯ Ø°Ù‡Ø¨ÙŠ ØºØ§Ù…Ù‚
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ©
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "#B8860B";
        ctx.fill();
        ctx.restore();
      });
    }
    
    console.log("Finished drawing star3");
  }

  function drawStar5(ctx, center, radius) {
    // Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø®Ù…Ø§Ø³ÙŠØ© Ø§Ù„ØªÙ‚Ù„ÙŠØ¯ÙŠØ© (Ø§Ù„Ø¨Ù†ØªØ§ØºØ±Ø§Ù…) - Ù†Ø¬Ù…Ø© {5/2}
    // Ø±Ø³Ù… Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø®Ù…Ø§Ø³ÙŠØ© Ø¨Ù†ÙØ³ Ø§Ù„Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„Ù…ÙˆØ¶Ø­Ø© ÙÙŠ Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ù…Ø±ÙÙ‚Ø©
    const outerPoints = [];
    
    // Ø­Ø³Ø§Ø¨ Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø®Ù…Ø³ Ù„Ù„Ù†Ø¬Ù…Ø©
    for (let i = 0; i < 5; i++) {
      const angle = ((customPentagonAngles[i]) + star5Rotation + settings.rotation - 90) * Math.PI / 180;
      outerPoints.push({
        x: center + degreeRingRadius * Math.cos(angle),
        y: center + degreeRingRadius * Math.sin(angle),
      });
    }

    // Ø­Ø³Ø§Ø¨ Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ© (Ù†Ù‚Ø§Ø· Ø§Ù„ØªÙ‚Ø§Ø·Ø¹) Ù„Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø®Ù…Ø§Ø³ÙŠØ©
    const innerPoints = [];
    for (let i = 0; i < 5; i++) {
      // Ù†Ù‚Ø§Ø· Ø§Ù„ØªÙ‚Ø§Ø·Ø¹ ØªÙƒÙˆÙ† Ø¹Ù„Ù‰ Ù…Ø³Ø§ÙØ© Ø£Ù‚Ø±Ø¨ Ù„Ù„Ù…Ø±ÙƒØ²
      const angle = ((customPentagonAngles[i]) + star5Rotation + settings.rotation - 90 + 36) * Math.PI / 180; // Ø¥Ø¶Ø§ÙØ© 36 Ø¯Ø±Ø¬Ø© Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©
      const innerRadius = degreeRingRadius * 0.4; // 40% Ù…Ù† Ø§Ù„Ø´Ø¹Ø§Ø¹ Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠ
      innerPoints.push({
        x: center + innerRadius * Math.cos(angle),
        y: center + innerRadius * Math.sin(angle),
      });
    }

    ctx.save();
    
    // Ø±Ø³Ù… Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø®Ù…Ø§Ø³ÙŠØ© Ø§Ù„ØªÙ‚Ù„ÙŠØ¯ÙŠØ© - Ø§Ù„Ø¨Ù†ØªØ§ØºØ±Ø§Ù… {5/2}
    // ÙƒÙ„ Ù†Ù‚Ø·Ø© ØªØªØµÙ„ Ø¨Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ© Ø§Ù„ØªØ§Ù„ÙŠØ© Ù„ØªØ´ÙƒÙŠÙ„ Ø§Ù„Ù†Ø¬Ù…Ø©
    ctx.beginPath();
    
    // Ø§Ù„Ø¨Ø¯Ø¡ Ù…Ù† Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ø£ÙˆÙ„Ù‰
    ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
    
    // Ø±Ø³Ù… Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ù…ØªØµÙ„Ø© Ù„Ù„Ù†Ø¬Ù…Ø©
    // Ø§Ù„Ù†Ù…Ø·: 0â†’2â†’4â†’1â†’3â†’0 (ÙƒÙ„ Ù†Ù‚Ø·Ø© ØªØªØµÙ„ Ø¨Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ© Ø§Ù„ØªØ§Ù„ÙŠØ©)
    for (let i = 0; i < 5; i++) {
      const nextIndex = (i * 2) % 5;
      ctx.lineTo(outerPoints[nextIndex].x, outerPoints[nextIndex].y);
    }
    
    ctx.closePath();
    
    // ØªØ¹Ø¨Ø¦Ø© Ø§Ù„Ù†Ø¬Ù…Ø© Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…Ø·Ù„ÙˆØ¨Ø©
    if (fillStar5) {
      ctx.fillStyle = "rgba(184, 134, 11, 0.3)";
      ctx.fill();
    }
    
    // Ø±Ø³Ù… Ø­Ø¯ÙˆØ¯ Ø§Ù„Ù†Ø¬Ù…Ø©
    ctx.strokeStyle = "#B8860B";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Ø±Ø³Ù… Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ© Ù…Ù† Ø§Ù„Ù…Ø±ÙƒØ² Ø¥Ù„Ù‰ Ø§Ù„Ù†Ù‚Ø§Ø· (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)
    if (highlightStar5) {
      ctx.save();
      ctx.strokeStyle = "rgba(184, 134, 11, 0.6)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      outerPoints.forEach((p) => {
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      });
      ctx.restore();
      
      // ØªÙ…ÙŠÙŠØ² Ø§Ù„Ù†Ù‚Ø§Ø·
      outerPoints.forEach((p, idx) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.restore();
      });
    }
    
    // ØªÙ…ÙŠÙŠØ² Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ù…Ø­Ø¯Ø¯Ø© (Ø¹Ù†Ø¯ Ø§Ù„ØªÙ…Ø±ÙŠØ±)
    if (hoveredPointIndex !== null && selectedShape === "star5") {
      const hoveredPoint = outerPoints[hoveredPointIndex];
      if (hoveredPoint) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(hoveredPoint.x, hoveredPoint.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = "cyan";
        ctx.fill();
        ctx.restore();
      }
    }
    
    // Ø¹Ø±Ø¶ Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ù†ØµÙŠØ© Ø¹Ù†Ø¯ Ø§Ù„Ø±Ø¤ÙˆØ³
    if (showStar5Angles) {
      outerPoints.forEach((point, i) => {
        const angle = (customPentagonAngles[i] + star5Rotation + settings.rotation) % 360;
        ctx.save();
        ctx.font = "bold 16px Tahoma";
        ctx.fillStyle = "#2F4F4F";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(`(${angle.toFixed(0)}Â°)`, point.x, point.y - 12);
        ctx.restore();
      });
    }

    // **Ø±Ø³Ù… Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø®Ù…Ø§Ø³ÙŠØ© Ø¨Ù„ÙˆÙ† Ø°Ù‡Ø¨ÙŠ Ù„Ø§Ù…Ø¹ Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ø¸Ø§Ù‡Ø±Ø© - ÙÙŠ Ø§Ù„Ù†Ù‡Ø§ÙŠØ© Ù„ÙŠÙƒÙˆÙ†ÙˆØ§ ÙÙˆÙ‚ ÙƒÙ„ Ø´ÙŠØ¡**
    // Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© (Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©)
    outerPoints.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#FFD700"; // Ø°Ù‡Ø¨ÙŠ Ù„Ø§Ù…Ø¹
      ctx.fill();
      ctx.strokeStyle = "#FF8C00"; // Ø­Ø¯ÙˆØ¯ Ø¨Ø±ØªÙ‚Ø§Ù„ÙŠ Ø°Ù‡Ø¨ÙŠ
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ©
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#FF8C00";
      ctx.fill();
      ctx.restore();
    });

    // Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ© (Ù†Ù‚Ø§Ø· Ø§Ù„ØªÙ‚Ø§Ø·Ø¹)
    innerPoints.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = "#FFA500"; // Ø¨Ø±ØªÙ‚Ø§Ù„ÙŠ Ø°Ù‡Ø¨ÙŠ
      ctx.fill();
      ctx.strokeStyle = "#FF6347"; // Ø­Ø¯ÙˆØ¯ Ø¨Ø±ØªÙ‚Ø§Ù„ÙŠ Ø£Ø­Ù…Ø±
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ©
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = "#FF6347";
      ctx.fill();
      ctx.restore();
    });
  }

  function drawStar6(ctx, center, radius) {
    const r = degreeRingRadius;
    
    // Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠØ© Ø§Ù„ØµØ­ÙŠØ­Ø©: Ù…Ø«Ù„Ø«Ø§Ù† Ù…ØªØ³Ø§ÙˆÙŠØ§Ù† Ù…ØªØ¯Ø§Ø®Ù„Ø§Ù†
    // Ø§Ù„Ù…Ø«Ù„Ø« Ø§Ù„Ø£ÙˆÙ„: Ù†Ù‚Ø§Ø· Ø¹Ù†Ø¯ 0Â°ØŒ 120Â°ØŒ 240Â°
    // Ø§Ù„Ù…Ø«Ù„Ø« Ø§Ù„Ø«Ø§Ù†ÙŠ: Ù†Ù‚Ø§Ø· Ø¹Ù†Ø¯ 60Â°ØŒ 180Â°ØŒ 300Â°
    
    const triangle1Points = [0, 120, 240].map((deg) => {
      const rad = ((deg + star6Rotation + settings.rotation - 90) * Math.PI) / 180;
      return {
        x: center + r * Math.cos(rad),
        y: center + r * Math.sin(rad),
      };
    });
    
    const triangle2Points = [60, 180, 300].map((deg) => {
      const rad = ((deg + star6Rotation + settings.rotation - 90) * Math.PI) / 180;
      return {
        x: center + r * Math.cos(rad),
        y: center + r * Math.sin(rad),
      };
    });

    ctx.save();
    
    // Ø±Ø³Ù… Ø§Ù„Ù…Ø«Ù„Ø« Ø§Ù„Ø£ÙˆÙ„
    ctx.beginPath();
    ctx.moveTo(triangle1Points[0].x, triangle1Points[0].y);
    ctx.lineTo(triangle1Points[1].x, triangle1Points[1].y);
    ctx.lineTo(triangle1Points[2].x, triangle1Points[2].y);
    ctx.closePath();
    
    if (fillStar6) {
      ctx.fillStyle = "rgba(0, 0, 255, 0.15)";
      ctx.fill();
    }
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Ø±Ø³Ù… Ø§Ù„Ù…Ø«Ù„Ø« Ø§Ù„Ø«Ø§Ù†ÙŠ
    ctx.beginPath();
    ctx.moveTo(triangle2Points[0].x, triangle2Points[0].y);
    ctx.lineTo(triangle2Points[1].x, triangle2Points[1].y);
    ctx.lineTo(triangle2Points[2].x, triangle2Points[2].y);
    ctx.closePath();
    
    if (fillStar6) {
      ctx.fillStyle = "rgba(0, 0, 255, 0.15)";
      ctx.fill();
    }
    ctx.stroke();
    
    ctx.restore();

    // Ø¬Ù…Ø¹ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù†Ù‚Ø§Ø· Ù„Ù„ØªÙØ§Ø¹Ù„ (6 Ù†Ù‚Ø§Ø· Ø¨Ø§Ù„ØªØ±ØªÙŠØ¨)
    const allPoints = [
      triangle1Points[0], // 0Â°
      triangle2Points[0], // 60Â°
      triangle1Points[1], // 120Â°
      triangle2Points[1], // 180Â°
      triangle1Points[2], // 240Â°
      triangle2Points[2]  // 300Â°
    ];

    // Ø±Ø³Ù… Ø®Ø·ÙˆØ· Ø§Ù„Ø§ØªØµØ§Ù„ Ù…Ù† Ø§Ù„Ù…Ø±ÙƒØ² Ø¥Ù„Ù‰ Ø§Ù„Ø±Ø¤ÙˆØ³
    ctx.save();
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    allPoints.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    // ØªÙ…ÙŠÙŠØ² Ø§Ù„Ù†Ù‚Ø§Ø· Ø¹Ù†Ø¯ Ø§Ù„ØªÙØ¹ÙŠÙ„
    if (highlightStar6) {
      allPoints.forEach((p, i) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = hoveredPointIndex === i && selectedShape === "star6" ? "orange" : "yellow";
        ctx.fill();
        ctx.restore();
      });
    }

    // Ø¹Ø±Ø¶ Ù‚ÙŠÙ… Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ø¹Ù†Ø¯ Ø§Ù„ØªÙØ¹ÙŠÙ„
    if (showStar6Angles) {
      const angles = [0, 60, 120, 180, 240, 300];
      allPoints.forEach((point, idx) => {
        const currentAngle = (angles[idx] + star6Rotation + settings.rotation) % 360;
        
        ctx.save();
        ctx.fillStyle = "#000080"; // Ù„ÙˆÙ† Ø£Ø²Ø±Ù‚ ØºØ§Ù…Ù‚
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // ÙˆØ¶Ø¹ Ø§Ù„Ù†Øµ Ø®Ø§Ø±Ø¬ Ø§Ù„Ù†Ù‚Ø·Ø© Ù‚Ù„ÙŠÙ„Ø§Ù‹
        const textOffset = 20;
        const textAngle = ((angles[idx] + star6Rotation + settings.rotation - 90) * Math.PI) / 180;
        const textX = center + (r + textOffset) * Math.cos(textAngle);
        const textY = center + (r + textOffset) * Math.sin(textAngle);
        
        ctx.fillText(`${currentAngle.toFixed(0)}Â°`, textX, textY);
        ctx.restore();
      });
    }

    // **Ø±Ø³Ù… Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠØ© Ø¨Ù„ÙˆÙ† Ø£Ø²Ø±Ù‚ Ù„Ø§Ù…Ø¹ Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ø¸Ø§Ù‡Ø±Ø© - ÙÙŠ Ø§Ù„Ù†Ù‡Ø§ÙŠØ© Ù„ÙŠÙƒÙˆÙ†ÙˆØ§ ÙÙˆÙ‚ ÙƒÙ„ Ø´ÙŠØ¡**
    allPoints.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#1E90FF"; // Ø£Ø²Ø±Ù‚ Ù„Ø§Ù…Ø¹ (DodgerBlue)
      ctx.fill();
      ctx.strokeStyle = "#4169E1"; // Ø­Ø¯ÙˆØ¯ Ø£Ø²Ø±Ù‚ Ù…Ù„ÙƒÙŠ
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ©
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#4169E1";
      ctx.fill();
      ctx.restore();
    });
  }

  function drawStar7(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = [];
    
    // Ø­Ø³Ø§Ø¨ Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø³Ø¨Ø¹ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø­ÙŠØ·
    for (let i = 0; i < 7; i++) {
      const angle = ((i * 360 / 7) + star7Rotation + settings.rotation - 90) * Math.PI / 180;
      points.push({
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      });
    }

    // Ø±Ø³Ù… Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¨Ø§Ø¹ÙŠØ© {7/3} - Ø§Ù„Ù†Ù…Ø· Ø§Ù„Ù…Ù†ØªØ¸Ù…
    // Ø§Ù„Ø²Ø§ÙˆÙŠØ© Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©: â‰ˆ25.714Â°ØŒ Ø²Ù…Ø±Ø© Ø§Ù„ØªÙ†Ø§Ø¸Ø±: D7
    ctx.save();
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 2;
    
    // Ø§Ù„Ù†Ù…Ø· {7/3} - ÙŠØªØ·Ù„Ø¨ Ø±Ø³Ù… Ù…Ø³Ø§Ø±Ø§Øª Ù…ØªØ¹Ø¯Ø¯Ø©
    // Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¨Ø§Ø¹ÙŠØ© {7/3} ØªØªÙƒÙˆÙ† Ù…Ù† Ø®Ø·ÙˆØ· Ù…Ù†ÙØµÙ„Ø©
    const visited = new Array(7).fill(false);
    
    for (let start = 0; start < 7; start++) {
      if (!visited[start]) {
        ctx.beginPath();
        let current = start;
        ctx.moveTo(points[current].x, points[current].y);
        
        do {
          visited[current] = true;
          current = (current + 3) % 7;
          ctx.lineTo(points[current].x, points[current].y);
        } while (current !== start);
        
        ctx.closePath();
        
        if (fillStar7) {
          ctx.fillStyle = "rgba(255, 165, 0, 0.2)";
          ctx.fill();
        }
        ctx.stroke();
      }
    }
    
    ctx.restore();

    // Draw radial connection lines from center to vertices
    ctx.save();
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    if (highlightStar7) {
      points.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.restore();
      });
    }

    // Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ù„Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¨Ø§Ø¹ÙŠØ©
    if (showStar7Angles) {
      points.forEach((point, idx) => {
        const angleDeg = (idx * 360 / 7 + star7Rotation + settings.rotation) % 360;
        ctx.save();
        ctx.font = "12px Arial";
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        ctx.fillText(`${angleDeg.toFixed(1)}Â°`, point.x, point.y - 10);
        ctx.restore();
      });
    }

    // **Ø±Ø³Ù… Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¨Ø§Ø¹ÙŠØ© Ø¨Ù„ÙˆÙ† Ø¨Ø±ØªÙ‚Ø§Ù„ÙŠ Ù†Ø­Ø§Ø³ÙŠ Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ø¸Ø§Ù‡Ø±Ø© - ÙÙŠ Ø§Ù„Ù†Ù‡Ø§ÙŠØ© Ù„ÙŠÙƒÙˆÙ†ÙˆØ§ ÙÙˆÙ‚ ÙƒÙ„ Ø´ÙŠØ¡**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#CD853F"; // Ø¨Ø±ØªÙ‚Ø§Ù„ÙŠ Ù†Ø­Ø§Ø³ÙŠ (Peru)
      ctx.fill();
      ctx.strokeStyle = "#A0522D"; // Ø­Ø¯ÙˆØ¯ Ø¨Ù†ÙŠ Ù…Ø­Ù…Ø±
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ©
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#A0522D";
      ctx.fill();
      ctx.restore();
    });
  }

  function drawStar8(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = [];
    
    // Ø­Ø³Ø§Ø¨ Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø«Ù…Ø§Ù†ÙŠØ© Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø­ÙŠØ· (ÙƒÙ„ 45Â°)
    for (let i = 0; i < 8; i++) {
      const angle = ((i * 45) + star8Rotation + settings.rotation - 90) * Math.PI / 180;
      points.push({
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      });
    }

    // Ø±Ø³Ù… Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù…Ø§Ù†ÙŠØ© Ø¨Ø§Ù„Ù†Ù…Ø· {8/3}
    ctx.save();
    ctx.strokeStyle = "purple";
    ctx.lineWidth = 2;
    
    // Ø§Ù„Ù†Ù…Ø· {8/3}: Ù†Ø±Ø³Ù… Ù…Ø³Ø§Ø± Ù…ØºÙ„Ù‚ Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø´ÙƒÙ„ Ù‚Ø§Ø¨Ù„ Ù„Ù„ØªØ¹Ø¨Ø¦Ø©
    ctx.beginPath();
    
    // Ø§Ù„Ø¨Ø¯Ø¡ Ù…Ù† Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ø£ÙˆÙ„Ù‰ ÙˆØ§ØªØ¨Ø§Ø¹ Ø§Ù„Ù†Ù…Ø· {8/3}
    let currentIndex = 0;
    ctx.moveTo(points[currentIndex].x, points[currentIndex].y);
    
    // Ø±Ø³Ù… Ø§Ù„Ù†Ù…Ø· Ø§Ù„ÙƒØ§Ù…Ù„
    for (let i = 0; i < 8; i++) {
      currentIndex = (currentIndex + 3) % 8;
      ctx.lineTo(points[currentIndex].x, points[currentIndex].y);
    }
    ctx.closePath();
    
    // Ø§Ù„ØªØ¹Ø¨Ø¦Ø© Ø£ÙˆÙ„Ø§Ù‹ Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…ÙØ¹Ù„Ø©
    if (fillStar8) {
      ctx.fillStyle = "rgba(128, 0, 128, 0.2)";
      ctx.fill();
    }
    
    // Ø±Ø³Ù… Ø§Ù„Ø­Ø¯ÙˆØ¯
    ctx.stroke();
    
    // ØªÙ…ÙŠÙŠØ² Ø§Ù„Ù†Ø¬Ù…Ø© Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…ÙØ¹Ù„Ø©
    if (highlightStar8) {
      ctx.strokeStyle = "rgba(255, 255, 0, 0.7)";
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    
    ctx.restore();
    
    // Ø±Ø³Ù… Ø§Ù„Ù†Ù‚Ø§Ø· Ù…Ø¹ Ø§Ù„Ø²ÙˆØ§ÙŠØ§
    points.forEach((point, index) => {
      // Ø±Ø³Ù… Ø§Ù„Ù†Ù‚Ø·Ø©
      ctx.save();
      ctx.beginPath();
      
      // ØªÙ…ÙŠÙŠØ² Ø§Ù„Ù†Ù‚Ø·Ø© Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…Ø­ÙˆÙ…Ø© Ø¹Ù„ÙŠÙ‡Ø§
      const isHovered = hoveredPointIndex === index && selectedShape === "star8";
      const pointSize = isHovered ? 7 : 5; // Ø²ÙŠØ§Ø¯Ø© Ø­Ø¬Ù… Ø§Ù„Ù†Ù‚Ø·Ø© Ø¹Ù†Ø¯ Ø§Ù„ØªÙ…Ø±ÙŠØ±
      
      ctx.arc(point.x, point.y, pointSize, 0, 2 * Math.PI);
      ctx.fillStyle = isHovered ? "yellow" : (highlightStar8 ? "orange" : "purple");
      ctx.fill();
      // Ø¥Ø¶Ø§ÙØ© Ø­Ø¯ÙˆØ¯ Ù„Ù„Ù†Ù‚Ø·Ø© Ù„Ø¬Ø¹Ù„Ù‡Ø§ Ø£ÙˆØ¶Ø­
      ctx.strokeStyle = isHovered ? "red" : "white";
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();
      ctx.restore();
      
      // Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…ÙØ¹Ù„Ø©
      if (showStar8Angles) {
        const angle = (index * 45 + star8Rotation + settings.rotation) % 360;
        const displayAngle = angle < 0 ? angle + 360 : angle;
        
        ctx.save();
        ctx.font = "12px Arial";
        ctx.fillStyle = "purple";
        ctx.textAlign = "center";
        ctx.fillText(`${displayAngle.toFixed(0)}Â°`, point.x, point.y - 15);
        ctx.restore();
      }
    });

    // **Ø±Ø³Ù… Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù…Ø§Ù†ÙŠØ© Ø¨Ù„ÙˆÙ† Ø¨Ù†ÙØ³Ø¬ÙŠ Ù…Ù„ÙƒÙŠ Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ø¸Ø§Ù‡Ø±Ø© - ÙÙŠ Ø§Ù„Ù†Ù‡Ø§ÙŠØ© Ù„ÙŠÙƒÙˆÙ†ÙˆØ§ ÙÙˆÙ‚ ÙƒÙ„ Ø´ÙŠØ¡**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#8A2BE2"; // Ø¨Ù†ÙØ³Ø¬ÙŠ Ù…Ù„ÙƒÙŠ (BlueViolet)
      ctx.fill();
      ctx.strokeStyle = "#4B0082"; // Ø­Ø¯ÙˆØ¯ Ù†ÙŠÙ„ÙŠ
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ©
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#4B0082";
      ctx.fill();
      ctx.restore();
    });
  }

  function drawStar9(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = [];
    
    // Ø­Ø³Ø§Ø¨ Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„ØªØ³Ø¹ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø­ÙŠØ· (ÙƒÙ„ 40Â°)
    for (let i = 0; i < 9; i++) {
      const angle = ((i * 360 / 9) + star9Rotation + settings.rotation - 90) * Math.PI / 180;
      points.push({
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      });
    }

    // Ø±Ø³Ù… Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„ØªØ³Ø§Ø¹ÙŠØ© Ø¨Ø§Ù„Ù†Ù…Ø· {9/4}
    ctx.save();
    ctx.strokeStyle = "#C44569"; // Ù„ÙˆÙ† ÙˆØ±Ø¯ÙŠ Ø£ØºÙ…Ù‚
    ctx.lineWidth = 2;
    
    // Ø§Ù„Ù†Ù…Ø· {9/4}: Ø±Ø³Ù… Ø®Ø·ÙˆØ· Ù…Ù†ÙØµÙ„Ø© Ù…Ù† ÙƒÙ„ Ù†Ù‚Ø·Ø© Ø¥Ù„Ù‰ Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ø±Ø§Ø¨Ø¹Ø© Ø§Ù„ØªØ§Ù„ÙŠØ©
    // Ù‡Ø°Ø§ Ø³ÙŠÙ†ØªØ¬ Ø¹Ù†Ù‡ Ù†Ø¬Ù…Ø© ØªØ³Ø§Ø¹ÙŠØ© Ù…Ø®ØªÙ„ÙØ© Ø¹Ù† Ø§Ù„Ù†Ù…Ø· {9/3}
    for (let i = 0; i < 9; i++) {
      const startIndex = i;
      const endIndex = (i + 4) % 9;
      
      ctx.beginPath();
      ctx.moveTo(points[startIndex].x, points[startIndex].y);
      ctx.lineTo(points[endIndex].x, points[endIndex].y);
      ctx.stroke();
    }
    
    // Ø§Ù„ØªØ¹Ø¨Ø¦Ø© Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…ÙØ¹Ù„Ø© - Ù†Ø±Ø³Ù… Ø§Ù„Ù…Ø¶Ù„Ø¹Ø§Øª Ø§Ù„Ù…ØªØ´ÙƒÙ„Ø© Ù…Ù† ØªÙ‚Ø§Ø·Ø¹ Ø§Ù„Ø®Ø·ÙˆØ·
    if (fillStar9) {
      ctx.fillStyle = "rgba(196, 69, 105, 0.2)"; // Ù„ÙˆÙ† ÙˆØ±Ø¯ÙŠ Ø£ØºÙ…Ù‚ Ù„Ù„ØªØ¹Ø¨Ø¦Ø©
      
      // Ø§Ù„Ù†Ù…Ø· {9/4} ÙŠÙ†ØªØ¬ Ø¹Ù†Ù‡ Ø´ÙƒÙ„ Ù†Ø¬Ù…Ø© Ù…ÙƒÙˆÙ†Ø© Ù…Ù† ØªØ³Ø¹Ø© Ù†Ù‚Ø§Ø· Ù…ØªØµÙ„Ø©
      // Ù†Ø±Ø³Ù… Ù…Ø³Ø§Ø± ÙˆØ§Ø­Ø¯ Ù…ØºÙ„Ù‚ ÙŠÙ…Ø± Ø¹Ø¨Ø± Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù†Ù‚Ø§Ø· Ø­Ø³Ø¨ Ø§Ù„Ù†Ù…Ø· {9/4}
      ctx.beginPath();
      let currentIndex = 0;
      ctx.moveTo(points[currentIndex].x, points[currentIndex].y);
      
      for (let i = 0; i < 9; i++) {
        currentIndex = (currentIndex + 4) % 9;
        ctx.lineTo(points[currentIndex].x, points[currentIndex].y);
      }
      ctx.closePath();
      ctx.fill();
    }
    
    // ØªÙ…ÙŠÙŠØ² Ø§Ù„Ù†Ø¬Ù…Ø© Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…ÙØ¹Ù„Ø©
    if (highlightStar9) {
      ctx.strokeStyle = "rgba(255, 255, 0, 0.7)";
      ctx.lineWidth = 4;
      
      // Ø¥Ø¹Ø§Ø¯Ø© Ø±Ø³Ù… Ø§Ù„Ø®Ø·ÙˆØ· Ù„Ù„ØªÙ…ÙŠÙŠØ²
      for (let i = 0; i < 9; i++) {
        const startIndex = i;
        const endIndex = (i + 4) % 9;
        
        ctx.beginPath();
        ctx.moveTo(points[startIndex].x, points[startIndex].y);
        ctx.lineTo(points[endIndex].x, points[endIndex].y);
        ctx.stroke();
      }
    }
    
    ctx.restore();

    // Ø±Ø³Ù… Ø®Ø·ÙˆØ· Ø§Ù„Ø§ØªØµØ§Ù„ Ù…Ù† Ø§Ù„Ù…Ø±ÙƒØ² Ø¥Ù„Ù‰ Ø§Ù„Ø±Ø¤ÙˆØ³ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)
    ctx.save();
    ctx.strokeStyle = "rgba(196, 69, 105, 0.5)"; // Ù„ÙˆÙ† ÙˆØ±Ø¯ÙŠ Ø£ØºÙ…Ù‚ Ù…Ø¹ Ø´ÙØ§ÙÙŠØ©
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    // Ø±Ø³Ù… Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„ØªÙØ§Ø¹Ù„ÙŠØ©
    points.forEach((point, index) => {
      ctx.save();
      ctx.beginPath();
      
      // ØªÙ…ÙŠÙŠØ² Ø§Ù„Ù†Ù‚Ø·Ø© Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…Ø­ÙˆÙ…Ø© Ø¹Ù„ÙŠÙ‡Ø§
      const isHovered = hoveredPointIndex === index && selectedShape === "star9";
      const pointSize = isHovered ? 7 : 5;
      
      ctx.arc(point.x, point.y, pointSize, 0, 2 * Math.PI);
      ctx.fillStyle = isHovered ? "yellow" : (highlightStar9 ? "orange" : "#C44569");
      ctx.fill();
      
      // Ø¥Ø¶Ø§ÙØ© Ø­Ø¯ÙˆØ¯ Ù„Ù„Ù†Ù‚Ø·Ø© Ù„Ø¬Ø¹Ù„Ù‡Ø§ Ø£ÙˆØ¶Ø­
      ctx.strokeStyle = isHovered ? "red" : "#8B2C49"; // Ù„ÙˆÙ† ÙˆØ±Ø¯ÙŠ Ø£ØºÙ…Ù‚ Ù„Ù„Ø­Ø¯ÙˆØ¯
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();
      ctx.restore();
      
      // Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…ÙØ¹Ù„Ø©
      if (showStar9Angles) {
        const angle = ((index * 360 / 9) + star9Rotation + settings.rotation) % 360;
        const displayAngle = angle < 0 ? angle + 360 : angle;
        
        ctx.save();
        ctx.font = "12px Arial";
        ctx.fillStyle = "#C44569"; // Ù†ÙØ³ Ù„ÙˆÙ† Ø§Ù„Ù†Ø¬Ù…Ø©
        ctx.strokeStyle = "white"; // Ø®Ù„ÙÙŠØ© Ø¨ÙŠØ¶Ø§Ø¡ Ù„Ù„Ù†Øµ
        ctx.lineWidth = 3;
        ctx.textAlign = "center";
        
        // Ø±Ø³Ù… Ø®Ù„ÙÙŠØ© Ù„Ù„Ù†Øµ
        ctx.strokeText(`${displayAngle.toFixed(0)}Â°`, point.x, point.y - 15);
        ctx.fillText(`${displayAngle.toFixed(0)}Â°`, point.x, point.y - 15);
        ctx.restore();
      }
    });

    // **Ø±Ø³Ù… Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„ØªØ³Ø§Ø¹ÙŠØ© Ø¨Ù„ÙˆÙ† ÙˆØ±Ø¯ÙŠ ÙƒØ±ÙŠØ²ÙˆÙ† Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ø¸Ø§Ù‡Ø±Ø© - ÙÙŠ Ø§Ù„Ù†Ù‡Ø§ÙŠØ© Ù„ÙŠÙƒÙˆÙ†ÙˆØ§ ÙÙˆÙ‚ ÙƒÙ„ Ø´ÙŠØ¡**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#DC143C"; // ÙƒØ±ÙŠØ²ÙˆÙ† (Crimson)
      ctx.fill();
      ctx.strokeStyle = "#B22222"; // Ø­Ø¯ÙˆØ¯ Ø£Ø­Ù…Ø± Ù†Ø§Ø±ÙŠ
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ©
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#B22222";
      ctx.fill();
      ctx.restore();
    });
  }

  function drawStar10(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = [];
    
    // Ø­Ø³Ø§Ø¨ Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø¹Ø´Ø± Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø­ÙŠØ· (ÙƒÙ„ 36Â°)
    for (let i = 0; i < 10; i++) {
      const angle = ((i * 360 / 10) + star10Rotation + settings.rotation - 90) * Math.PI / 180;
      points.push({
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      });
    }

    // Ø±Ø³Ù… Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø¹Ø´Ø§Ø±ÙŠØ© Ø¨Ø§Ù„Ù†Ù…Ø· {10/4}
    ctx.save();
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 2;
    
    // Ø§Ù„Ù†Ù…Ø· {10/4}: Ø±Ø³Ù… Ø®Ø·ÙˆØ· Ù…Ù†ÙØµÙ„Ø© Ù…Ù† ÙƒÙ„ Ù†Ù‚Ø·Ø© Ø¥Ù„Ù‰ Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ø±Ø§Ø¨Ø¹Ø© Ø§Ù„ØªØ§Ù„ÙŠØ©
    // Ù‡Ø°Ø§ Ø³ÙŠÙ†ØªØ¬ Ø¹Ù†Ù‡ Ù†Ø¬Ù…Ø© Ø¹Ø´Ø§Ø±ÙŠØ© ÙƒØ§Ù…Ù„Ø© Ù…Ø¹ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ù…Ø±Ø¦ÙŠØ©
    for (let i = 0; i < 10; i++) {
      const startIndex = i;
      const endIndex = (i + 4) % 10;
      
      ctx.beginPath();
      ctx.moveTo(points[startIndex].x, points[startIndex].y);
      ctx.lineTo(points[endIndex].x, points[endIndex].y);
      ctx.stroke();
    }
    
    // Ø§Ù„ØªØ¹Ø¨Ø¦Ø© Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…ÙØ¹Ù„Ø© - Ù†Ø±Ø³Ù… Ø§Ù„Ù…Ø¶Ù„Ø¹Ø§Øª Ø§Ù„Ù…ØªØ´ÙƒÙ„Ø© Ù…Ù† ØªÙ‚Ø§Ø·Ø¹ Ø§Ù„Ø®Ø·ÙˆØ·
    if (fillStar10) {
      ctx.fillStyle = "rgba(0, 255, 255, 0.2)";
      
      // Ø§Ù„Ù†Ù…Ø· {10/4} ÙŠÙ†ØªØ¬ Ø¹Ù†Ù‡ Ù†Ø¬Ù…Ø© Ù…ÙƒÙˆÙ†Ø© Ù…Ù† Ø®Ù…Ø§Ø³ÙŠÙŠÙ† Ù…ØªØ¯Ø§Ø®Ù„ÙŠÙ†
      // Ø§Ù„Ø®Ù…Ø§Ø³ÙŠ Ø§Ù„Ø£ÙˆÙ„: Ø§Ù„Ù†Ù‚Ø§Ø· 0, 4, 8, 2, 6
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[4].x, points[4].y);
      ctx.lineTo(points[8].x, points[8].y);
      ctx.lineTo(points[2].x, points[2].y);
      ctx.lineTo(points[6].x, points[6].y);
      ctx.closePath();
      ctx.fill();
      
      // Ø§Ù„Ø®Ù…Ø§Ø³ÙŠ Ø§Ù„Ø«Ø§Ù†ÙŠ: Ø§Ù„Ù†Ù‚Ø§Ø· 1, 5, 9, 3, 7
      ctx.beginPath();
      ctx.moveTo(points[1].x, points[1].y);
      ctx.lineTo(points[5].x, points[5].y);
      ctx.lineTo(points[9].x, points[9].y);
      ctx.lineTo(points[3].x, points[3].y);
      ctx.lineTo(points[7].x, points[7].y);
      ctx.closePath();
      ctx.fill();
    }
    
    // ØªÙ…ÙŠÙŠØ² Ø§Ù„Ù†Ø¬Ù…Ø© Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…ÙØ¹Ù„Ø©
    if (highlightStar10) {
      ctx.strokeStyle = "rgba(255, 255, 0, 0.7)";
      ctx.lineWidth = 4;
      
      // Ø¥Ø¹Ø§Ø¯Ø© Ø±Ø³Ù… Ø§Ù„Ø®Ø·ÙˆØ· Ù„Ù„ØªÙ…ÙŠÙŠØ²
      for (let i = 0; i < 10; i++) {
        const startIndex = i;
        const endIndex = (i + 4) % 10;
        
        ctx.beginPath();
        ctx.moveTo(points[startIndex].x, points[startIndex].y);
        ctx.lineTo(points[endIndex].x, points[endIndex].y);
        ctx.stroke();
      }
    }
    
    ctx.restore();

    // Ø±Ø³Ù… Ø®Ø·ÙˆØ· Ø§Ù„Ø§ØªØµØ§Ù„ Ù…Ù† Ø§Ù„Ù…Ø±ÙƒØ² Ø¥Ù„Ù‰ Ø§Ù„Ø±Ø¤ÙˆØ³ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)
    ctx.save();
    ctx.strokeStyle = "rgba(0, 255, 255, 0.5)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    // Ø±Ø³Ù… Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„ØªÙØ§Ø¹Ù„ÙŠØ©
    points.forEach((point, index) => {
      ctx.save();
      ctx.beginPath();
      
      // ØªÙ…ÙŠÙŠØ² Ø§Ù„Ù†Ù‚Ø·Ø© Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…Ø­ÙˆÙ…Ø© Ø¹Ù„ÙŠÙ‡Ø§
      const isHovered = hoveredPointIndex === index && selectedShape === "star10";
      const pointSize = isHovered ? 7 : 5;
      
      ctx.arc(point.x, point.y, pointSize, 0, 2 * Math.PI);
      ctx.fillStyle = isHovered ? "yellow" : (highlightStar10 ? "orange" : "cyan");
      ctx.fill();
      
      // Ø¥Ø¶Ø§ÙØ© Ø­Ø¯ÙˆØ¯ Ù„Ù„Ù†Ù‚Ø·Ø© Ù„Ø¬Ø¹Ù„Ù‡Ø§ Ø£ÙˆØ¶Ø­
      ctx.strokeStyle = isHovered ? "red" : "white";
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();
      ctx.restore();
      
      // Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…ÙØ¹Ù„Ø©
      if (showStar10Angles) {
        const angle = ((index * 360 / 10) + star10Rotation + settings.rotation) % 360;
        const displayAngle = angle < 0 ? angle + 360 : angle;
        
        ctx.save();
        ctx.font = "12px Arial";
        ctx.fillStyle = "cyan";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.textAlign = "center";
        
        // Ø±Ø³Ù… Ø®Ù„ÙÙŠØ© Ù„Ù„Ù†Øµ
        ctx.strokeText(`${displayAngle.toFixed(0)}Â°`, point.x, point.y - 15);
        // Ø±Ø³Ù… Ø§Ù„Ù†Øµ
        ctx.fillText(`${displayAngle.toFixed(0)}Â°`, point.x, point.y - 15);
        ctx.restore();
      }
    });

    // **Ø±Ø³Ù… Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø¹Ø´Ø±ÙŠØ© Ø¨Ù„ÙˆÙ† Ø³Ù…Ø§ÙˆÙŠ ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠ Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ø¸Ø§Ù‡Ø±Ø© - ÙÙŠ Ø§Ù„Ù†Ù‡Ø§ÙŠØ© Ù„ÙŠÙƒÙˆÙ†ÙˆØ§ ÙÙˆÙ‚ ÙƒÙ„ Ø´ÙŠØ¡**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#00FFFF"; // Ø³Ù…Ø§ÙˆÙŠ ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠ (Cyan)
      ctx.fill();
      ctx.strokeStyle = "#008B8B"; // Ø­Ø¯ÙˆØ¯ Ø³Ù…Ø§ÙˆÙŠ ØºØ§Ù…Ù‚
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ©
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#008B8B";
      ctx.fill();
      ctx.restore();
    });
  }

  function drawStar11(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = [];
    
    // Ø­Ø³Ø§Ø¨ Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø¥Ø­Ø¯Ù‰ Ø¹Ø´Ø±Ø© Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø­ÙŠØ·
    for (let i = 0; i < 11; i++) {
      const angle = ((i * 360 / 11) + star11Rotation + settings.rotation - 90) * Math.PI / 180;
      points.push({
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      });
    }

    // Ø±Ø³Ù… Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø­Ø§Ø¯ÙŠØ© Ø¹Ø´Ø±Ø© Ø¨Ø§Ù„Ù†Ù…Ø· {11/4}
    ctx.save();
    ctx.strokeStyle = "deeppink";
    ctx.lineWidth = 2;
    
    // Ø§Ù„Ù†Ù…Ø· {11/4}: Ø±Ø³Ù… Ø®Ø·ÙˆØ· Ù…Ù†ÙØµÙ„Ø© Ù…Ù† ÙƒÙ„ Ù†Ù‚Ø·Ø© Ø¥Ù„Ù‰ Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ø±Ø§Ø¨Ø¹Ø© Ø§Ù„ØªØ§Ù„ÙŠØ©
    // Ù‡Ø°Ø§ Ø³ÙŠÙ†ØªØ¬ Ø¹Ù†Ù‡ Ù†Ø¬Ù…Ø© Ø­Ø§Ø¯ÙŠØ© Ø¹Ø´Ø± ÙƒØ§Ù…Ù„Ø© Ù…Ø¹ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ù…Ø±Ø¦ÙŠØ©
    for (let i = 0; i < 11; i++) {
      const startIndex = i;
      const endIndex = (i + 4) % 11;
      
      ctx.beginPath();
      ctx.moveTo(points[startIndex].x, points[startIndex].y);
      ctx.lineTo(points[endIndex].x, points[endIndex].y);
      ctx.stroke();
    }
    
    // Ø§Ù„ØªØ¹Ø¨Ø¦Ø© Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…ÙØ¹Ù„Ø© - Ù†Ø±Ø³Ù… Ù…Ø³Ø§Ø± ÙˆØ§Ø­Ø¯ Ù…ØºÙ„Ù‚
    if (fillStar11) {
      ctx.fillStyle = "rgba(255, 20, 147, 0.2)";
      
      // Ø§Ù„Ù†Ù…Ø· {11/4} ÙŠÙ†ØªØ¬ Ø¹Ù†Ù‡ Ù†Ø¬Ù…Ø© ÙˆØ§Ø­Ø¯Ø© Ù…ØªØµÙ„Ø©
      ctx.beginPath();
      let currentIndex = 0;
      ctx.moveTo(points[currentIndex].x, points[currentIndex].y);
      
      for (let i = 0; i < 11; i++) {
        currentIndex = (currentIndex + 4) % 11;
        ctx.lineTo(points[currentIndex].x, points[currentIndex].y);
      }
      ctx.closePath();
      ctx.fill();
    }
    
    // ØªÙ…ÙŠÙŠØ² Ø§Ù„Ù†Ø¬Ù…Ø© Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…ÙØ¹Ù„Ø©
    if (highlightStar11) {
      ctx.strokeStyle = "rgba(255, 255, 0, 0.7)";
      ctx.lineWidth = 4;
      
      // Ø¥Ø¹Ø§Ø¯Ø© Ø±Ø³Ù… Ø§Ù„Ø®Ø·ÙˆØ· Ù„Ù„ØªÙ…ÙŠÙŠØ²
      for (let i = 0; i < 11; i++) {
        const startIndex = i;
        const endIndex = (i + 4) % 11;
        
        ctx.beginPath();
        ctx.moveTo(points[startIndex].x, points[startIndex].y);
        ctx.lineTo(points[endIndex].x, points[endIndex].y);
        ctx.stroke();
      }
    }
    
    ctx.restore();

    // Ø±Ø³Ù… Ø®Ø·ÙˆØ· Ø§Ù„Ø§ØªØµØ§Ù„ Ù…Ù† Ø§Ù„Ù…Ø±ÙƒØ² Ø¥Ù„Ù‰ Ø§Ù„Ø±Ø¤ÙˆØ³ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)
    ctx.save();
    ctx.strokeStyle = "rgba(255, 20, 147, 0.5)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    // Ø±Ø³Ù… Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„ØªÙØ§Ø¹Ù„ÙŠØ©
    points.forEach((point, index) => {
      ctx.save();
      ctx.beginPath();
      
      // ØªÙ…ÙŠÙŠØ² Ø§Ù„Ù†Ù‚Ø·Ø© Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…Ø­ÙˆÙ…Ø© Ø¹Ù„ÙŠÙ‡Ø§
      const isHovered = hoveredPointIndex === index && selectedShape === "star11";
      const pointSize = isHovered ? 7 : 5;
      
      ctx.arc(point.x, point.y, pointSize, 0, 2 * Math.PI);
      ctx.fillStyle = isHovered ? "yellow" : (highlightStar11 ? "orange" : "deeppink");
      ctx.fill();
      
      // Ø¥Ø¶Ø§ÙØ© Ø­Ø¯ÙˆØ¯ Ù„Ù„Ù†Ù‚Ø·Ø© Ù„Ø¬Ø¹Ù„Ù‡Ø§ Ø£ÙˆØ¶Ø­
      ctx.strokeStyle = isHovered ? "red" : "white";
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();
      ctx.restore();
      
      // Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…ÙØ¹Ù„Ø©
      if (showStar11Angles) {
        const angle = ((index * 360 / 11) + star11Rotation + settings.rotation) % 360;
        const displayAngle = angle < 0 ? angle + 360 : angle;
        
        ctx.save();
        ctx.font = "12px Arial";
        ctx.fillStyle = "deeppink"; // Ù†ÙØ³ Ù„ÙˆÙ† Ø§Ù„Ù†Ø¬Ù…Ø©
        ctx.strokeStyle = "white"; // Ø®Ù„ÙÙŠØ© Ø¨ÙŠØ¶Ø§Ø¡ Ù„Ù„Ù†Øµ
        ctx.lineWidth = 3;
        ctx.textAlign = "center";
        
        // Ø±Ø³Ù… Ø®Ù„ÙÙŠØ© Ù„Ù„Ù†Øµ
        ctx.strokeText(`${displayAngle.toFixed(0)}Â°`, point.x, point.y - 15);
        ctx.fillText(`${displayAngle.toFixed(0)}Â°`, point.x, point.y - 15);
        ctx.restore();
      }
    });

    // **Ø±Ø³Ù… Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø­Ø§Ø¯ÙŠØ© Ø¹Ø´Ø±ÙŠØ© Ø¨Ù„ÙˆÙ† ÙˆØ±Ø¯ÙŠ Ø¹Ù…ÙŠÙ‚ Ù…Ù„ÙƒÙŠ Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ø¸Ø§Ù‡Ø±Ø© - ÙÙŠ Ø§Ù„Ù†Ù‡Ø§ÙŠØ© Ù„ÙŠÙƒÙˆÙ†ÙˆØ§ ÙÙˆÙ‚ ÙƒÙ„ Ø´ÙŠØ¡**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#FF1493"; // ÙˆØ±Ø¯ÙŠ Ø¹Ù…ÙŠÙ‚ (DeepPink)
      ctx.fill();
      ctx.strokeStyle = "#8B0039"; // Ø­Ø¯ÙˆØ¯ ÙˆØ±Ø¯ÙŠ ØºØ§Ù…Ù‚ Ø¬Ø¯Ø§Ù‹
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ©
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#8B0039";
      ctx.fill();
      ctx.restore();
    });
  }

  function drawStar12(ctx, center, radius) {
    const r = degreeRingRadius;
    const points = [];
    
    // Ø­Ø³Ø§Ø¨ Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø§Ø«Ù†Ù‰ Ø¹Ø´Ø±Ø© Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø­ÙŠØ· (ÙƒÙ„ 30Â°)
    for (let i = 0; i < 12; i++) {
      const angle = ((i * 360 / 12) + star12Rotation + settings.rotation - 90) * Math.PI / 180;
      points.push({
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      });
    }

    // Ø±Ø³Ù… Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ© Ø¹Ø´Ø±Ø© Ø¨Ø§Ù„Ù†Ù…Ø· {12/5}
    ctx.save();
    ctx.strokeStyle = "orangered";
    ctx.lineWidth = 2;
    
    // Ø§Ù„Ù†Ù…Ø· {12/5}: Ø±Ø³Ù… Ø®Ø·ÙˆØ· Ù…Ù†ÙØµÙ„Ø© Ù…Ù† ÙƒÙ„ Ù†Ù‚Ø·Ø© Ø¥Ù„Ù‰ Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ø®Ø§Ù…Ø³Ø© Ø§Ù„ØªØ§Ù„ÙŠØ©
    // Ù‡Ø°Ø§ Ø³ÙŠÙ†ØªØ¬ Ø¹Ù†Ù‡ Ù†Ø¬Ù…Ø© Ø§Ø«Ù†ÙŠ Ø¹Ø´Ø± ÙƒØ§Ù…Ù„Ø© Ù…Ø¹ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ù…Ø±Ø¦ÙŠØ©
    for (let i = 0; i < 12; i++) {
      const startIndex = i;
      const endIndex = (i + 5) % 12;
      
      ctx.beginPath();
      ctx.moveTo(points[startIndex].x, points[startIndex].y);
      ctx.lineTo(points[endIndex].x, points[endIndex].y);
      ctx.stroke();
    }
    
    // Ø§Ù„ØªØ¹Ø¨Ø¦Ø© Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…ÙØ¹Ù„Ø© - Ù†Ø±Ø³Ù… Ù…Ø³Ø§Ø± ÙˆØ§Ø­Ø¯ Ù…ØºÙ„Ù‚
    if (fillStar12) {
      ctx.fillStyle = "rgba(255, 69, 0, 0.2)";
      
      // Ø§Ù„Ù†Ù…Ø· {12/5} ÙŠÙ†ØªØ¬ Ø¹Ù†Ù‡ Ù†Ø¬Ù…Ø© ÙˆØ§Ø­Ø¯Ø© Ù…ØªØµÙ„Ø©
      ctx.beginPath();
      let currentIndex = 0;
      ctx.moveTo(points[currentIndex].x, points[currentIndex].y);
      
      for (let i = 0; i < 12; i++) {
        currentIndex = (currentIndex + 5) % 12;
        ctx.lineTo(points[currentIndex].x, points[currentIndex].y);
      }
      ctx.closePath();
      ctx.fill();
    }
    
    // ØªÙ…ÙŠÙŠØ² Ø§Ù„Ù†Ø¬Ù…Ø© Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…ÙØ¹Ù„Ø©
    if (highlightStar12) {
      ctx.strokeStyle = "rgba(255, 255, 0, 0.7)";
      ctx.lineWidth = 4;
      
      // Ø¥Ø¹Ø§Ø¯Ø© Ø±Ø³Ù… Ø§Ù„Ø®Ø·ÙˆØ· Ù„Ù„ØªÙ…ÙŠÙŠØ²
      for (let i = 0; i < 12; i++) {
        const startIndex = i;
        const endIndex = (i + 5) % 12;
        
        ctx.beginPath();
        ctx.moveTo(points[startIndex].x, points[startIndex].y);
        ctx.lineTo(points[endIndex].x, points[endIndex].y);
        ctx.stroke();
      }
    }
    
    ctx.restore();

    // Ø±Ø³Ù… Ø®Ø·ÙˆØ· Ø§Ù„Ø§ØªØµØ§Ù„ Ù…Ù† Ø§Ù„Ù…Ø±ÙƒØ² Ø¥Ù„Ù‰ Ø§Ù„Ø±Ø¤ÙˆØ³ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)
    ctx.save();
    ctx.strokeStyle = "rgba(255, 69, 0, 0.5)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.restore();

    // Ø±Ø³Ù… Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„ØªÙØ§Ø¹Ù„ÙŠØ©
    points.forEach((point, index) => {
      ctx.save();
      ctx.beginPath();
      
      // ØªÙ…ÙŠÙŠØ² Ø§Ù„Ù†Ù‚Ø·Ø© Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…Ø­ÙˆÙ…Ø© Ø¹Ù„ÙŠÙ‡Ø§
      const isHovered = hoveredPointIndex === index && selectedShape === "star12";
      const pointSize = isHovered ? 7 : 5;
      
      ctx.arc(point.x, point.y, pointSize, 0, 2 * Math.PI);
      ctx.fillStyle = isHovered ? "yellow" : (highlightStar12 ? "orange" : "orangered");
      ctx.fill();
      
      // Ø¥Ø¶Ø§ÙØ© Ø­Ø¯ÙˆØ¯ Ù„Ù„Ù†Ù‚Ø·Ø© Ù„Ø¬Ø¹Ù„Ù‡Ø§ Ø£ÙˆØ¶Ø­
      ctx.strokeStyle = isHovered ? "red" : "white";
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();
      ctx.restore();
      
      // Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…ÙØ¹Ù„Ø©
      if (showStar12Angles) {
        const angle = ((index * 360 / 12) + star12Rotation + settings.rotation) % 360;
        const displayAngle = angle < 0 ? angle + 360 : angle;
        
        ctx.save();
        ctx.font = "12px Arial";
        ctx.fillStyle = "orangered"; // Ù†ÙØ³ Ù„ÙˆÙ† Ø§Ù„Ù†Ø¬Ù…Ø©
        ctx.strokeStyle = "white"; // Ø®Ù„ÙÙŠØ© Ø¨ÙŠØ¶Ø§Ø¡ Ù„Ù„Ù†Øµ
        ctx.lineWidth = 3;
        ctx.textAlign = "center";
        
        // Ø±Ø³Ù… Ø®Ù„ÙÙŠØ© Ù„Ù„Ù†Øµ
        ctx.strokeText(`${displayAngle.toFixed(0)}Â°`, point.x, point.y - 15);
        ctx.fillText(`${displayAngle.toFixed(0)}Â°`, point.x, point.y - 15);
        ctx.restore();
      }
    });

    // **Ø±Ø³Ù… Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø§Ø«Ù†ÙŠ Ø¹Ø´Ø±ÙŠØ© Ø¨Ù„ÙˆÙ† Ø¨Ø±ØªÙ‚Ø§Ù„ÙŠ Ø£Ø­Ù…Ø± Ù„Ù‡Ø¨ÙŠ Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ø¸Ø§Ù‡Ø±Ø© - ÙÙŠ Ø§Ù„Ù†Ù‡Ø§ÙŠØ© Ù„ÙŠÙƒÙˆÙ†ÙˆØ§ ÙÙˆÙ‚ ÙƒÙ„ Ø´ÙŠØ¡**
    points.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#FF4500"; // Ø¨Ø±ØªÙ‚Ø§Ù„ÙŠ Ø£Ø­Ù…Ø± (OrangeRed)
      ctx.fill();
      ctx.strokeStyle = "#CD3700"; // Ø­Ø¯ÙˆØ¯ Ø¨Ø±ØªÙ‚Ø§Ù„ÙŠ Ø£Ø­Ù…Ø± ØºØ§Ù…Ù‚
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ©
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#CD3700";
      ctx.fill();
      ctx.restore();
    });
  }

  // Main shape drawing function
  function drawShape(ctx, center, radius, shape) {
    console.log("drawShape called with shape:", shape);
    switch (shape) {
      case "triangle":
        // ØªÙ… ØªÙ†ÙÙŠØ° Ø±Ø³Ù… Ø§Ù„Ù…Ø«Ù„Ø« Ù…Ø¨Ø§Ø´Ø±Ø© ÙÙŠ useEffect
        break;
      case "star3":
        console.log("About to call drawStar3");
        drawStar3(ctx, center, radius);
        console.log("Finished calling drawStar3");
        break;
      case "square":
        drawSquare(ctx, center, radius);
        break;
      case "star4":
        drawStar4(ctx, center, radius);
        break;
      case "pentagon":
        drawPentagon(ctx, center, radius);
        break;
      case "star5":
        drawStar5(ctx, center, radius);
        break;
      case "hexagon":
        drawHexagon(ctx, center, radius);
        break;
      case "star6":
        drawStar6(ctx, center, radius);
        break;
      case "heptagon":
        drawHeptagon(ctx, center, radius);
        break;
      case "star7":
        drawStar7(ctx, center, radius);
        break;
      case "octagon":
        drawOctagon(ctx, center, radius);
        break;
      case "star8":
        drawStar8(ctx, center, radius);
        break;
      case "nonagon":
        drawNonagon(ctx, center, radius);
        break;
      case "star9":
        drawStar9(ctx, center, radius);
        break;
      case "decagon":
        drawDecagon(ctx, center, radius);
        break;
      case "star10":
        drawStar10(ctx, center, radius);
        break;
      case "eleven":
        drawHendecagon(ctx, center, radius);
        break;
      case "star11":
        drawStar11(ctx, center, radius);
        break;
      case "twelve":
        drawDodecagon(ctx, center, radius);
        break;
      case "star12":
        drawStar12(ctx, center, radius);
        break;
    }
  }

useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const center = canvasSize / 2;
  
  // Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù†ÙØ³ Ø­Ø³Ø§Ø¨ Ø¹Ø¬Ù„Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ù…Ø­Ø³Ù† Ù…Ù† Ø¨Ø¯Ø§ÙŠØ© Ø§Ù„ÙƒÙˆØ¯
  const innerRadius = canvasSize / 2 - 50;
  const baseRingWidth = 100;
  const digitScale = 20;
  
  // Ø­Ø³Ø§Ø¨ Ø£Ø±Ù‚Ø§Ù… Ø§Ù„Ø¨Ø¯Ø§ÙŠØ© Ù„ÙƒÙ„ Ø­Ù„Ù‚Ø©
  // Ø¥Ø¶Ø§ÙØ© 2 Ø­Ù„Ù‚Ø§Øª Ø¥Ø¶Ø§ÙÙŠØ© (Ø§Ù„Ø£ÙˆÙ„Ù‰ ÙˆØ§Ù„Ø«Ø§Ù†ÙŠØ©) Ù„Ù„Ø­Ù„Ù‚Ø§Øª Ø§Ù„Ù…Ø±Ù‚Ù…Ø©
  const totalLevels = settings.levels + 2;
  const ringStartNumbers = calculateRingStartNumbers(settings.startValue, totalLevels, settings.divisions);
  
  // Ø­Ø³Ø§Ø¨ Ù†ØµÙ Ù‚Ø·Ø± Ø¢Ø®Ø± Ø­Ù„Ù‚Ø© Ø¨Ù†ÙØ³ Ù…Ù†Ø·Ù‚ Ø§Ù„Ø­Ù„Ù‚Ø© Ø§Ù„ÙØ¹Ù„ÙŠØ©
  let calculatedLastRadius = innerRadius;
  for (let level = 0; level < totalLevels; level++) {
    // Ø­Ù…Ø§ÙŠØ© Ù…Ù† Ø­Ø§Ù„Ø© Ø¹Ø¯Ø¯ Ø§Ù„Ù‚Ø·Ø§Ø¹Ø§Øª = 0
    if (settings.divisions === 0) {
      break;
    }
    
    const maxDigitsInLevel = Math.max(
      ...Array.from({ length: settings.divisions }, (_, i) => {
        const cellValue = getCellValue(level, i, ringStartNumbers, settings.startValue);
        return cellValue > 0 ? parseFloat(cellValue.toFixed(2)).toString().length : 1;
      })
    );
    // Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù†ÙØ³ Ø§Ù„Ø¯Ø§Ù„Ø© Ø§Ù„Ù…Ø­Ø³Ù†Ø© Ù„Ù„Ø­Ø³Ø§Ø¨ Ù„Ø¶Ù…Ø§Ù† Ø§Ù„ØªØ·Ø§Ø¨Ù‚
    const dynamicWidth = calculateRingWidth(maxDigitsInLevel);
    calculatedLastRadius += dynamicWidth;
  }
  const lastNumberRingRadius = calculatedLastRadius;
  
  // Ø­Ù„Ù‚Ø© Ø§Ù„Ø¯Ø±Ø¬Ø§Øª ØªØ£ØªÙŠ Ø¨Ø¹Ø¯ Ø­Ù„Ù‚Ø§Øª Ø§Ù„Ø£Ø±Ù‚Ø§Ù… Ù…Ø¹ Ù…Ø³Ø§ÙØ© Ø£ÙƒØ¨Ø±
  const degreeRingRadius = lastNumberRingRadius + 35; // Ù…Ø³Ø§ÙØ© Ø£ÙƒØ¨Ø± Ù„Ù„ÙˆØ¶ÙˆØ­
  
  // Ø¹Ø¬Ù„Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§ ØªØ£ØªÙŠ Ø¨Ø¹Ø¯ Ø­Ù„Ù‚Ø© Ø§Ù„Ø¯Ø±Ø¬Ø§Øª Ù…Ø¹ ÙØ±Ø§Øº ØµØºÙŠØ± Ù„ØªØ¬Ù†Ø¨ Ø§Ù„ØªØ¯Ø§Ø®Ù„
  const angleWheelInnerRadius = degreeRingRadius + 25; // Ø¥Ø¶Ø§ÙØ© ÙØ±Ø§Øº 25px Ù„ØªØ¬Ù†Ø¨ Ø§Ù„ØªØ¯Ø§Ø®Ù„ Ù…Ø¹ Ø§Ù„Ø¯Ø±Ø¬Ø§Øª
  const angleWheelOuterRadius = angleWheelInnerRadius + 55; // Ù…Ù†Ø·Ù‚Ø© Ø£ÙˆØ³Ø¹ Ù„Ù„Ù†Ù‚Ø±
  
  // Ø­Ù„Ù‚Ø© Ø§Ù„Ø£Ø¨Ø±Ø§Ø¬ ØªØ£ØªÙŠ Ø¨Ø¹Ø¯ Ø¹Ø¬Ù„Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ø£Ùˆ Ø¨Ø¹Ø¯ Ø­Ù„Ù‚Ø© Ø§Ù„Ø¯Ø±Ø¬Ø§Øª Ù…Ø¹ ÙØ±Ø§Øº ØµØºÙŠØ± Ù„ØªØ¬Ù†Ø¨ Ø§Ù„ØªØ¯Ø§Ø®Ù„
  const zodiacInnerRadius = showAngleWheel ? angleWheelOuterRadius : degreeRingRadius + 25; // Ø¥Ø¶Ø§ÙØ© ÙØ±Ø§Øº 25px Ù„ØªØ¬Ù†Ø¨ Ø§Ù„ØªØ¯Ø§Ø®Ù„ Ù…Ø¹ Ø§Ù„Ø¯Ø±Ø¬Ø§Øª
  const zodiacOuterRadius = zodiacInnerRadius + 60; // ØªÙˆØ­ÙŠØ¯ Ø§Ù„Ø³ÙÙ…Ùƒ Ù…Ø¹ Ø­Ù„Ù‚Ø© Ø§Ù„Ø£ÙŠØ§Ù…

  const getMousePos = (e) => {
    const rect = canvas.getBoundingClientRect(); // Ø­Ø³Ø§Ø¨ rect ÙÙŠ ÙƒÙ„ Ù…Ø±Ø©
    const dpr = window.devicePixelRatio || 1;
    const uniformScale = dpr * scale; // Ù†ÙØ³ Ø§Ù„Ù…Ù‚ÙŠØ§Ø³ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ÙÙŠ Ø§Ù„Ø±Ø³Ù…
    
    return {
      x: ((e.clientX - rect.left) * dpr) / uniformScale,
      y: ((e.clientY - rect.top) * dpr) / uniformScale,
    };
  };

  const getAngleDeg = (x, y) => {
    const angle = Math.atan2(y - center, x - center) * (180 / Math.PI);
    return (angle + 360) % 360; // ØªØ­ÙˆÙŠÙ„ Ù…Ù† -180/+180 Ø¥Ù„Ù‰ 0-360
  };

  const getDistance = (x1, y1, x2, y2) =>
    Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

  // Ø¯Ø§Ù„Ø© Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…Ø³Ø§ÙØ© Ù…Ù† Ù†Ù‚Ø·Ø© Ø¥Ù„Ù‰ Ø®Ø·
  const getDistanceToLine = (px, py, x1, y1, x2, y2) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return getDistance(px, py, x1, y1);
    
    let param = dot / lenSq;
    param = Math.max(0, Math.min(1, param));
    
    const xx = x1 + param * C;
    const yy = y1 + param * D;
    
    return getDistance(px, py, xx, yy);
  };

  function onMouseDown(e) {
    const { x, y } = getMousePos(e);
    console.log(`Mouse down at (${x.toFixed(1)}, ${y.toFixed(1)}), selectedShape: ${selectedShape}, showAngleWheel: ${showAngleWheel}`);
    
    // **Ø­Ø³Ø§Ø¨ Ø£Ù†ØµØ§Ù Ø§Ù„Ø£Ù‚Ø·Ø§Ø± Ù…Ø±Ø© ÙˆØ§Ø­Ø¯Ø© ÙÙŠ Ø¨Ø¯Ø§ÙŠØ© Ø§Ù„Ø¯Ø§Ù„Ø©**
    const innerRadius = canvasSize / 2 - 50;
    const baseRingWidth = 100;
    const digitScale = 20;
    
    // Ø­Ø³Ø§Ø¨ Ø£Ø±Ù‚Ø§Ù… Ø§Ù„Ø¨Ø¯Ø§ÙŠØ© Ù„ÙƒÙ„ Ø­Ù„Ù‚Ø©
    // Ø¥Ø¶Ø§ÙØ© 2 Ø­Ù„Ù‚Ø§Øª Ø¥Ø¶Ø§ÙÙŠØ© (Ø§Ù„Ø£ÙˆÙ„Ù‰ ÙˆØ§Ù„Ø«Ø§Ù†ÙŠØ©) Ù„Ù„Ø­Ù„Ù‚Ø§Øª Ø§Ù„Ù…Ø±Ù‚Ù…Ø©
    const totalLevels = settings.levels + 2;
    const ringStartNumbers = calculateRingStartNumbers(settings.startValue, totalLevels, settings.divisions);
    
    let calculatedLastRadius = innerRadius;
    for (let level = 0; level < totalLevels; level++) {
      const maxDigitsInLevel = Math.max(
        ...Array.from({ length: settings.divisions }, (_, i) => {
          const cellValue = getCellValue(level, i, ringStartNumbers, settings.startValue);
          return cellValue > 0 ? parseFloat(cellValue.toFixed(2)).toString().length : 1;
        })
      );
      // Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù†ÙØ³ Ø§Ù„Ø¯Ø§Ù„Ø© Ø§Ù„Ù…Ø­Ø³Ù†Ø© Ù„Ù„Ø­Ø³Ø§Ø¨
      const dynamicWidth = calculateRingWidth(maxDigitsInLevel);
      calculatedLastRadius += dynamicWidth;
    }
    const lastNumberRingRadius = calculatedLastRadius;
    const degreeRingRadius = lastNumberRingRadius + 35; // Ù…Ø·Ø§Ø¨Ù‚ Ù„Ù„Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© Ø§Ù„Ù…Ø­Ø³Ù†Ø©
    const angleWheelInnerRadius = degreeRingRadius + 25; // Ø¥Ø¶Ø§ÙØ© ÙØ±Ø§Øº 25px Ù„ØªØ¬Ù†Ø¨ Ø§Ù„ØªØ¯Ø§Ø®Ù„ Ù…Ø¹ Ø§Ù„Ø¯Ø±Ø¬Ø§Øª
    const angleWheelOuterRadius = angleWheelInnerRadius + 55;
    const distanceFromCenter = getDistance(x, y, center, center);
    
    // **Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ©: Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ø£Ø´ÙƒØ§Ù„ Ø§Ù„Ù…Ø­Ø¯Ø¯Ø© Ø­Ø³Ø¨ Ø§Ù„Ù†ÙˆØ¹**
    
    // ðŸ”º Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù…Ø«Ù„Ø« Ø¹Ù†Ø¯Ù…Ø§ ÙŠÙƒÙˆÙ† Ù…Ø­Ø¯Ø¯
    if (selectedShape === "triangle") {
      console.log("ðŸ”ºðŸŽ¯ TRIANGLE: Processing triangle mouse down");
      
      const r = degreeRingRadius;
      const trianglePoints = customAngles.map((deg) => {
        const rad = ((deg + triangleRotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      console.log(`ðŸ”º Triangle check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`ðŸ“ Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // ÙƒØ´Ù ÙÙˆØ±ÙŠ Ø¹Ù„Ù‰ Ø±Ø¤ÙˆØ³ Ø§Ù„Ù…Ø«Ù„Ø« Ø¨Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ© Ø¬Ø¯Ø§Ù‹ - ÙŠØªÙÙˆÙ‚ Ø¹Ù„Ù‰ Ø£ÙŠ Ø´ÙŠØ¡ Ø¢Ø®Ø±
      for (let idx = 0; idx < trianglePoints.length; idx++) {
        const point = trianglePoints[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = customAngles[idx];
        
        console.log(`ðŸ”º TRIANGLE Vertex ${idx} (angle: ${vertexAngle}Â°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // Ù…Ù†Ø·Ù‚Ø© ÙˆØ§Ø³Ø¹Ø© Ø¬Ø¯Ø§Ù‹ Ù„Ø¬Ù…ÙŠØ¹ Ø±Ø¤ÙˆØ³ Ø§Ù„Ù…Ø«Ù„Ø« - Ø£ÙˆÙ„ÙˆÙŠØ© Ù…Ø·Ù„Ù‚Ø©
        const detectionRadius = 50; // Ù…Ù†Ø·Ù‚Ø© Ø£ÙˆØ³Ø¹ Ù„Ø¶Ù…Ø§Ù† Ø¹Ø¯Ù… Ø§Ù„ØªØ¯Ø§Ø®Ù„ Ù…Ø¹ Ø¹Ø¬Ù„Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§
        
        if (d < detectionRadius) {
          console.log(`ðŸš€ TRIANGLE: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}Â° (distance: ${d.toFixed(1)})`);
          setIsDraggingTriangle(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(triangleRotation);
          return; // Ø®Ø±ÙˆØ¬ ÙÙˆØ±ÙŠ Ù…Ø·Ù„Ù‚
        }
      }
      
      // ÙƒØ´Ù Ø¥Ø¶Ø§ÙÙŠ Ø¹Ù„Ù‰ Ø£Ø¶Ù„Ø§Ø¹ Ø§Ù„Ù…Ø«Ù„Ø« ÙˆØ§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ© - Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ©
      for (let i = 0; i < trianglePoints.length; i++) {
        const currentPoint = trianglePoints[i];
        const nextPoint = trianglePoints[(i + 1) % trianglePoints.length];
        
        const distanceToEdge = getDistanceToLine(
          x, y,
          currentPoint.x, currentPoint.y,
          nextPoint.x, nextPoint.y
        );
        
        if (distanceToEdge < 30) { // Ù…Ù†Ø·Ù‚Ø© Ø£ÙˆØ³Ø¹ Ù„Ù„Ø£Ø¶Ù„Ø§Ø¹
          console.log(`ðŸš€ TRIANGLE: Edge detection ${i}-${(i + 1) % trianglePoints.length} (distance: ${distanceToEdge.toFixed(1)})`);
          setIsDraggingTriangle(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(triangleRotation);
          return;
        }
      }

      // ÙƒØ´Ù Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ© Ù„Ù„Ù…Ø«Ù„Ø«
      for (let idx = 0; idx < trianglePoints.length; idx++) {
        const point = trianglePoints[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`ðŸš€ TRIANGLE: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingTriangle(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(triangleRotation);
          return;
        }
      }
    }
    
    // ðŸŸ¦ Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù…Ø±Ø¨Ø¹ Ø¹Ù†Ø¯Ù…Ø§ ÙŠÙƒÙˆÙ† Ù…Ø­Ø¯Ø¯  
    if (selectedShape === "square") {
      console.log("ðŸŸ¦ðŸŽ¯ SQUARE: Processing square mouse down");
      const r = degreeRingRadius;
      const squarePoints = customSquareAngles.map((deg) => {
        const rad = ((deg + squareRotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      console.log(`ðŸŸ¦ Square check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`ðŸ“ Distance from center: ${distanceFromCenter.toFixed(1)}`);
      console.log(`ðŸŸ¦ Square angles: [${customSquareAngles.join(', ')}]`);
      console.log(`ðŸŸ¦ Square rotation: ${squareRotation}`);

      // ÙƒØ´Ù ÙÙˆØ±ÙŠ Ø¹Ù„Ù‰ Ø±Ø¤ÙˆØ³ Ø§Ù„Ù…Ø±Ø¨Ø¹ Ø¨Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ©
      for (let idx = 0; idx < squarePoints.length; idx++) {
        const point = squarePoints[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = customSquareAngles[idx];
        
        console.log(`ðŸŸ¦ SQUARE Vertex ${idx} (angle: ${vertexAngle}Â°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // Ù…Ù†Ø·Ù‚Ø© ÙˆØ§Ø³Ø¹Ø© Ù„Ø¬Ù…ÙŠØ¹ Ø±Ø¤ÙˆØ³ Ø§Ù„Ù…Ø±Ø¨Ø¹
        const detectionRadius = 25;
        
        if (d < detectionRadius) {
          console.log(`ðŸš€ SQUARE: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}Â° (distance: ${d.toFixed(1)})`);
          setIsDraggingSquare(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(squareRotation);
          return; // Ø®Ø±ÙˆØ¬ ÙÙˆØ±ÙŠ Ù…Ø·Ù„Ù‚
        }
      }
      
      // ÙƒØ´Ù Ø¥Ø¶Ø§ÙÙŠ Ø¹Ù„Ù‰ Ø£Ø¶Ù„Ø§Ø¹ Ø§Ù„Ù…Ø±Ø¨Ø¹ ÙˆØ§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ©
      for (let i = 0; i < squarePoints.length; i++) {
        const currentPoint = squarePoints[i];
        const nextPoint = squarePoints[(i + 1) % squarePoints.length];
        
        const distanceToEdge = getDistanceToLine(
          x, y,
          currentPoint.x, currentPoint.y,
          nextPoint.x, nextPoint.y
        );
        
        if (distanceToEdge < 30) {
          console.log(`ðŸš€ SQUARE: Edge detection ${i}-${(i + 1) % squarePoints.length} (distance: ${distanceToEdge.toFixed(1)})`);
          setIsDraggingSquare(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(squareRotation);
          return;
        }
      }

      // ÙƒØ´Ù Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ© Ù„Ù„Ù…Ø±Ø¨Ø¹
      for (let idx = 0; idx < squarePoints.length; idx++) {
        const point = squarePoints[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`ðŸš€ SQUARE: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingSquare(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(squareRotation);
          return;
        }
      }
      
      // ÙØ­Øµ Ø¹Ø§Ù… Ù„Ù…Ù†Ø·Ù‚Ø© Ø£ÙˆØ³Ø¹ Ø­ÙˆÙ„ Ø§Ù„Ù…Ø±Ø¨Ø¹
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`ðŸŽ¯ SQUARE FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingSquare(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(squareRotation);
        return;
      }
    }
    
    // â­ Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø±Ø¨Ø§Ø¹ÙŠØ© Ø¹Ù†Ø¯Ù…Ø§ ØªÙƒÙˆÙ† Ù…Ø­Ø¯Ø¯Ø©
    if (selectedShape === "star4") {
      console.log("â­ðŸŽ¯ STAR4: Processing star4 mouse down");
      const r = degreeRingRadius;
      // Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø£Ø±Ø¨Ø¹Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© Ù„Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø±Ø¨Ø§Ø¹ÙŠØ©
      const star4Points = [0, 90, 180, 270].map((deg) => {
        const rad = ((deg + star4Rotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      console.log(`â­ Star4 check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`ðŸ“ Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // ÙƒØ´Ù ÙÙˆØ±ÙŠ Ø¹Ù„Ù‰ Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø±Ø¨Ø§Ø¹ÙŠØ© Ø¨Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ©
      for (let idx = 0; idx < star4Points.length; idx++) {
        const point = star4Points[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = [0, 90, 180, 270][idx];
        
        console.log(`â­ STAR4 Vertex ${idx} (angle: ${vertexAngle}Â°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // Ù…Ù†Ø·Ù‚Ø© ÙˆØ§Ø³Ø¹Ø© Ù„Ø¬Ù…ÙŠØ¹ Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø±Ø¨Ø§Ø¹ÙŠØ©
        const detectionRadius = 25;
        
        if (d < detectionRadius) {
          console.log(`ðŸš€ STAR4: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}Â° (distance: ${d.toFixed(1)})`);
          setIsDraggingStar4(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star4Rotation);
          return; // Ø®Ø±ÙˆØ¬ ÙÙˆØ±ÙŠ Ù…Ø·Ù„Ù‚
        }
      }
      
      // ÙƒØ´Ù Ø¥Ø¶Ø§ÙÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ© Ù„Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø±Ø¨Ø§Ø¹ÙŠØ©
      for (let idx = 0; idx < star4Points.length; idx++) {
        const point = star4Points[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`ðŸš€ STAR4: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingStar4(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star4Rotation);
          return;
        }
      }
      
      // ÙØ­Øµ Ø¹Ø§Ù… Ù„Ù…Ù†Ø·Ù‚Ø© Ø£ÙˆØ³Ø¹ Ø­ÙˆÙ„ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø±Ø¨Ø§Ø¹ÙŠØ©
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`ðŸŽ¯ STAR4 FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingStar4(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(star4Rotation);
        return;
      }
    }
    
    // ðŸ”· Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ø®Ù…Ø§Ø³ÙŠ Ø¹Ù†Ø¯Ù…Ø§ ÙŠÙƒÙˆÙ† Ù…Ø­Ø¯Ø¯
    if (selectedShape === "pentagon") {
      console.log("ðŸ”·ðŸŽ¯ PENTAGON: Processing pentagon mouse down");
      const r = degreeRingRadius;
      const pentagonPoints = customPentagonAngles.map((deg) => {
        const rad = ((deg + pentagonRotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      console.log(`ðŸ”· Pentagon check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`ðŸ“ Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // ÙƒØ´Ù ÙÙˆØ±ÙŠ Ø¹Ù„Ù‰ Ø±Ø¤ÙˆØ³ Ø§Ù„Ø®Ù…Ø§Ø³ÙŠ Ø¨Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ©
      for (let idx = 0; idx < pentagonPoints.length; idx++) {
        const point = pentagonPoints[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = customPentagonAngles[idx];
        
        console.log(`ðŸ”· PENTAGON Vertex ${idx} (angle: ${vertexAngle}Â°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // Ù…Ù†Ø·Ù‚Ø© ÙˆØ§Ø³Ø¹Ø© Ù„Ø¬Ù…ÙŠØ¹ Ø±Ø¤ÙˆØ³ Ø§Ù„Ø®Ù…Ø§Ø³ÙŠ
        const detectionRadius = 25;
        
        if (d < detectionRadius) {
          console.log(`ðŸš€ PENTAGON: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}Â° (distance: ${d.toFixed(1)})`);
          setIsDraggingPentagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(pentagonRotation);
          return; // Ø®Ø±ÙˆØ¬ ÙÙˆØ±ÙŠ Ù…Ø·Ù„Ù‚
        }
      }
      
      // ÙƒØ´Ù Ø¥Ø¶Ø§ÙÙŠ Ø¹Ù„Ù‰ Ø£Ø¶Ù„Ø§Ø¹ Ø§Ù„Ø®Ù…Ø§Ø³ÙŠ ÙˆØ§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ©
      for (let i = 0; i < pentagonPoints.length; i++) {
        const currentPoint = pentagonPoints[i];
        const nextPoint = pentagonPoints[(i + 1) % pentagonPoints.length];
        
        const distanceToEdge = getDistanceToLine(
          x, y,
          currentPoint.x, currentPoint.y,
          nextPoint.x, nextPoint.y
        );
        
        if (distanceToEdge < 30) {
          console.log(`ðŸš€ PENTAGON: Edge detection ${i}-${(i + 1) % pentagonPoints.length} (distance: ${distanceToEdge.toFixed(1)})`);
          setIsDraggingPentagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(pentagonRotation);
          return;
        }
      }

      // ÙƒØ´Ù Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ© Ù„Ù„Ø®Ù…Ø§Ø³ÙŠ
      for (let idx = 0; idx < pentagonPoints.length; idx++) {
        const point = pentagonPoints[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`ðŸš€ PENTAGON: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingPentagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(pentagonRotation);
          return;
        }
      }
      
      // ÙØ­Øµ Ø¹Ø§Ù… Ù„Ù…Ù†Ø·Ù‚Ø© Ø£ÙˆØ³Ø¹ Ø­ÙˆÙ„ Ø§Ù„Ø®Ù…Ø§Ø³ÙŠ
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`ðŸŽ¯ PENTAGON FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingPentagon(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(pentagonRotation);
        return;
      }
    }
    
    // â­ Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù„Ø§Ø«ÙŠØ© Ø¹Ù†Ø¯Ù…Ø§ ØªÙƒÙˆÙ† Ù…Ø­Ø¯Ø¯Ø©  
    if (selectedShape === "star3") {
      console.log("â­ðŸŽ¯ STAR3: Processing star3 mouse down");
      const r = degreeRingRadius; // **ØªØµØ­ÙŠØ­: Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù†ÙØ³ Ø§Ù„Ù…Ø³Ø§ÙØ© Ù„Ù„Ù…Ø«Ù„Ø«**
      console.log(`Using radius: ${r}, center: ${center}`);
      
      // Ø­Ø³Ø§Ø¨ Ø§Ù„Ù†Ù‚Ø§Ø· Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ Ù†Ù…Ø· Ø§Ù„Ø±Ø³Ù… Ø§Ù„Ø¬Ø¯ÙŠØ¯
      const star3Points = [];
      
      if (star3DrawMode === "lines") {
        console.log("Star3 mode: lines");
        // Ù„Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ© - Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© ÙˆØ§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©
        // Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© (Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø©)
        for (let i = 0; i < 3; i++) {
          const angle = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
          const point = {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
          };
          star3Points.push(point);
          console.log(`Outer point ${i}: (${point.x.toFixed(1)}, ${point.y.toFixed(1)}) at angle ${customStar3Angles[i]}Â°`);
        }
        
        // Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©
        for (let i = 0; i < 3; i++) {
          const angle1 = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
          const angle2 = ((customStar3Angles[(i + 1) % 3]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
          
          let midAngle = (angle1 + angle2) / 2;
          if (Math.abs(angle2 - angle1) > Math.PI) {
            midAngle += Math.PI;
          }
          
          const point = {
            x: center + (r * 0.3) * Math.cos(midAngle),
            y: center + (r * 0.3) * Math.sin(midAngle),
          };
          star3Points.push(point);
          console.log(`Inner point ${i}: (${point.x.toFixed(1)}, ${point.y.toFixed(1)})`);
        }
      } else {
        console.log("Star3 mode: triangle");
        // Ù„Ù„Ù…Ø«Ù„Ø« - 3 Ù†Ù‚Ø§Ø· ÙÙ‚Ø·
        customStar3Angles.forEach((deg, i) => {
          const rad = ((deg + star3Rotation + settings.rotation - 90) * Math.PI) / 180;
          const point = {
            x: center + r * Math.cos(rad),
            y: center + r * Math.sin(rad),
          };
          star3Points.push(point);
          console.log(`Triangle point ${i}: (${point.x.toFixed(1)}, ${point.y.toFixed(1)}) at angle ${deg}Â°`);
        });
      }

      let foundPoint = false;
      star3Points.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        console.log(`Star3 point ${idx}: distance = ${d.toFixed(1)}, point = (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), mouse = (${x.toFixed(1)}, ${y.toFixed(1)})`);
        if (d < 25) { // Ø²ÙŠØ§Ø¯Ø© Ø§Ù„Ù…Ù†Ø·Ù‚Ø© Ø§Ù„Ø­Ø³Ø§Ø³Ø© Ø£ÙƒØ«Ø±
          console.log(`*** Star3 drag started on point ${idx} with distance ${d.toFixed(1)} ***`);
          setIsDraggingStar3(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star3Rotation);
          foundPoint = true;
          return; // Ø®Ø±ÙˆØ¬ ÙÙˆØ±ÙŠ Ø¹Ù†Ø¯ Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ù†Ù‚Ø·Ø©
        }
      });
      
      if (!foundPoint) {
        console.log("âŒ No star3 point found within range");
        console.log(`ðŸ“Š Star3 Debug Info:`);
        console.log(`   selectedShape: ${selectedShape}`);
        console.log(`   star3DrawMode: ${star3DrawMode}`);
        console.log(`   star3Rotation: ${star3Rotation}`);
        console.log(`   customStar3Angles: [${customStar3Angles.join(', ')}]`);
        console.log(`   Total points calculated: ${star3Points.length}`);
        
        // Ø¥Ø¶Ø§ÙØ© ÙØ­Øµ Ø¹Ø§Ù… Ù„Ù…Ù†Ø·Ù‚Ø© Ø£ÙˆØ³Ø¹ Ø­ÙˆÙ„ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù„Ø§Ø«ÙŠØ©
        const distanceFromCenter = getDistance(x, y, center, center);
        const minDistance = r * 0.2; // 20% Ù…Ù† Ù†ØµÙ Ø§Ù„Ù‚Ø·Ø±
        const maxDistance = r + 50;   // Ù†ØµÙ Ø§Ù„Ù‚Ø·Ø± + 50px
        
        if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
          console.log(`ðŸŽ¯ Star3 FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
          setIsDraggingStar3(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star3Rotation);
          foundPoint = true;
        }
      }
    }
    
    // â­ Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø®Ù…Ø§Ø³ÙŠØ© Ø¹Ù†Ø¯Ù…Ø§ ØªÙƒÙˆÙ† Ù…Ø­Ø¯Ø¯Ø©
    if (selectedShape === "star5") {
      console.log("â­ðŸŽ¯ STAR5: Processing star5 mouse down");
      const r = degreeRingRadius;
      const star5Points = customPentagonAngles.map((deg) => {
        const rad = ((deg + star5Rotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      console.log(`â­ Star5 check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`ðŸ“ Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // ÙƒØ´Ù ÙÙˆØ±ÙŠ Ø¹Ù„Ù‰ Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø®Ù…Ø§Ø³ÙŠØ© Ø¨Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ©
      for (let idx = 0; idx < star5Points.length; idx++) {
        const point = star5Points[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = customPentagonAngles[idx];
        
        console.log(`â­ STAR5 Vertex ${idx} (angle: ${vertexAngle}Â°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // Ù…Ù†Ø·Ù‚Ø© ÙˆØ§Ø³Ø¹Ø© Ù„Ø¬Ù…ÙŠØ¹ Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø®Ù…Ø§Ø³ÙŠØ©
        const detectionRadius = 25;
        
        if (d < detectionRadius) {
          console.log(`ðŸš€ STAR5: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}Â° (distance: ${d.toFixed(1)})`);
          setIsDraggingStar5(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star5Rotation);
          return; // Ø®Ø±ÙˆØ¬ ÙÙˆØ±ÙŠ Ù…Ø·Ù„Ù‚
        }
      }
      
      // ÙƒØ´Ù Ø¥Ø¶Ø§ÙÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ© Ù„Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø®Ù…Ø§Ø³ÙŠØ©
      for (let idx = 0; idx < star5Points.length; idx++) {
        const point = star5Points[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`ðŸš€ STAR5: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingStar5(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star5Rotation);
          return;
        }
      }
      
      // ÙØ­Øµ Ø¹Ø§Ù… Ù„Ù…Ù†Ø·Ù‚Ø© Ø£ÙˆØ³Ø¹ Ø­ÙˆÙ„ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø®Ù…Ø§Ø³ÙŠØ©
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`ðŸŽ¯ STAR5 FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingStar5(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(star5Rotation);
        return;
      }
    }
    
    // ðŸ”¸ Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠ Ø¹Ù†Ø¯Ù…Ø§ ÙŠÙƒÙˆÙ† Ù…Ø­Ø¯Ø¯
    if (selectedShape === "hexagon") {
      console.log("ðŸ”¸ðŸŽ¯ HEXAGON: Processing hexagon mouse down");
      const r = degreeRingRadius;
      const hexagonPoints = customHexagonAngles.map((deg) => {
        const rad = ((deg + hexagonRotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      console.log(`ðŸ”¸ Hexagon check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`ðŸ“ Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // ÙƒØ´Ù ÙÙˆØ±ÙŠ Ø¹Ù„Ù‰ Ø±Ø¤ÙˆØ³ Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠ Ø¨Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ©
      for (let idx = 0; idx < hexagonPoints.length; idx++) {
        const point = hexagonPoints[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = customHexagonAngles[idx];
        
        console.log(`ðŸ”¸ HEXAGON Vertex ${idx} (angle: ${vertexAngle}Â°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // Ù…Ù†Ø·Ù‚Ø© ÙˆØ§Ø³Ø¹Ø© Ù„Ø¬Ù…ÙŠØ¹ Ø±Ø¤ÙˆØ³ Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠ
        const detectionRadius = 25;
        
        if (d < detectionRadius) {
          console.log(`ðŸš€ HEXAGON: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}Â° (distance: ${d.toFixed(1)})`);
          setIsDraggingHexagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(hexagonRotation);
          return; // Ø®Ø±ÙˆØ¬ ÙÙˆØ±ÙŠ Ù…Ø·Ù„Ù‚
        }
      }
      
      // ÙƒØ´Ù Ø¥Ø¶Ø§ÙÙŠ Ø¹Ù„Ù‰ Ø£Ø¶Ù„Ø§Ø¹ Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠ ÙˆØ§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ©
      for (let i = 0; i < hexagonPoints.length; i++) {
        const currentPoint = hexagonPoints[i];
        const nextPoint = hexagonPoints[(i + 1) % hexagonPoints.length];
        
        const distanceToEdge = getDistanceToLine(
          x, y,
          currentPoint.x, currentPoint.y,
          nextPoint.x, nextPoint.y
        );
        
        if (distanceToEdge < 30) {
          console.log(`ðŸš€ HEXAGON: Edge detection ${i}-${(i + 1) % hexagonPoints.length} (distance: ${distanceToEdge.toFixed(1)})`);
          setIsDraggingHexagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(hexagonRotation);
          return;
        }
      }

      // ÙƒØ´Ù Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ© Ù„Ù„Ø³Ø¯Ø§Ø³ÙŠ
      for (let idx = 0; idx < hexagonPoints.length; idx++) {
        const point = hexagonPoints[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`ðŸš€ HEXAGON: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingHexagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(hexagonRotation);
          return;
        }
      }
      
      // ÙØ­Øµ Ø¹Ø§Ù… Ù„Ù…Ù†Ø·Ù‚Ø© Ø£ÙˆØ³Ø¹ Ø­ÙˆÙ„ Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠ
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`ðŸŽ¯ HEXAGON FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingHexagon(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(hexagonRotation);
        return;
      }
    }
    
    // â­ Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠØ© Ø¹Ù†Ø¯Ù…Ø§ ØªÙƒÙˆÙ† Ù…Ø­Ø¯Ø¯Ø©
    if (selectedShape === "star6") {
      console.log("â­ðŸŽ¯ STAR6: Processing star6 mouse down");
      const r = degreeRingRadius;
      // Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø³ØªØ© Ù„Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠØ© Ø¨Ø§Ù„ØªØ±ØªÙŠØ¨: 0Â°ØŒ 60Â°ØŒ 120Â°ØŒ 180Â°ØŒ 240Â°ØŒ 300Â°
      const star6Points = [0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = ((deg + star6Rotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      console.log(`â­ Star6 check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`ðŸ“ Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // ÙƒØ´Ù ÙÙˆØ±ÙŠ Ø¹Ù„Ù‰ Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠØ© Ø¨Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ©
      for (let idx = 0; idx < star6Points.length; idx++) {
        const point = star6Points[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = [0, 60, 120, 180, 240, 300][idx];
        
        console.log(`â­ STAR6 Vertex ${idx} (angle: ${vertexAngle}Â°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // Ù…Ù†Ø·Ù‚Ø© ÙˆØ§Ø³Ø¹Ø© Ù„Ø¬Ù…ÙŠØ¹ Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠØ©
        const detectionRadius = 25;
        
        if (d < detectionRadius) {
          console.log(`ðŸš€ STAR6: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}Â° (distance: ${d.toFixed(1)})`);
          setIsDraggingStar6(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star6Rotation);
          return; // Ø®Ø±ÙˆØ¬ ÙÙˆØ±ÙŠ Ù…Ø·Ù„Ù‚
        }
      }
      
      // ÙƒØ´Ù Ø¥Ø¶Ø§ÙÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ© Ù„Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠØ©
      for (let idx = 0; idx < star6Points.length; idx++) {
        const point = star6Points[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`ðŸš€ STAR6: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingStar6(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star6Rotation);
          return;
        }
      }
      
      // ÙØ­Øµ Ø¹Ø§Ù… Ù„Ù…Ù†Ø·Ù‚Ø© Ø£ÙˆØ³Ø¹ Ø­ÙˆÙ„ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠØ©
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`ðŸŽ¯ STAR6 FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingStar6(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(star6Rotation);
        return;
      }
    }

    // â­ Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¨Ø§Ø¹ÙŠØ© Ø¹Ù†Ø¯Ù…Ø§ ØªÙƒÙˆÙ† Ù…Ø­Ø¯Ø¯Ø©
    if (selectedShape === "star7") {
      console.log("â­ðŸŽ¯ STAR7: Processing star7 mouse down");
      const r = degreeRingRadius;
      // Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø³Ø¨Ø¹Ø© Ù„Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¨Ø§Ø¹ÙŠØ© - Ù†ÙØ³ Ø§Ù„Ø­Ø³Ø§Ø¨ ÙƒÙ…Ø§ ÙÙŠ drawStar7
      const star7Points = [];
      for (let i = 0; i < 7; i++) {
        const angle = ((i * 360 / 7) + star7Rotation + settings.rotation - 90) * Math.PI / 180;
        star7Points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      console.log(`â­ Star7 check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`ðŸ“ Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // ÙƒØ´Ù ÙÙˆØ±ÙŠ Ø¹Ù„Ù‰ Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¨Ø§Ø¹ÙŠØ© Ø¨Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ©
      for (let idx = 0; idx < star7Points.length; idx++) {
        const point = star7Points[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = (idx * 360 / 7);
        
        console.log(`â­ STAR7 Vertex ${idx} (angle: ${vertexAngle.toFixed(1)}Â°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // Ù…Ù†Ø·Ù‚Ø© ÙˆØ§Ø³Ø¹Ø© Ù„Ø¬Ù…ÙŠØ¹ Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¨Ø§Ø¹ÙŠØ©
        const detectionRadius = 30; // Ø²ÙŠØ§Ø¯Ø© Ù…Ù†Ø·Ù‚Ø© Ø§Ù„ÙƒØ´Ù Ø£ÙƒØ«Ø± Ù„Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¨Ø§Ø¹ÙŠØ©
        
        if (d < detectionRadius) {
          console.log(`ðŸš€ STAR7: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle.toFixed(1)}Â° (distance: ${d.toFixed(1)})`);
          setIsDraggingStar7(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star7Rotation);
          return; // Ø®Ø±ÙˆØ¬ ÙÙˆØ±ÙŠ Ù…Ø·Ù„Ù‚
        }
      }
      
      // ÙƒØ´Ù Ø¥Ø¶Ø§ÙÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ© Ù„Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¨Ø§Ø¹ÙŠØ©
      for (let idx = 0; idx < star7Points.length; idx++) {
        const point = star7Points[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`ðŸš€ STAR7: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingStar7(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star7Rotation);
          return;
        }
      }
      
      // ÙØ­Øµ Ø¹Ø§Ù… Ù„Ù…Ù†Ø·Ù‚Ø© Ø£ÙˆØ³Ø¹ Ø­ÙˆÙ„ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¨Ø§Ø¹ÙŠØ©
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`ðŸŽ¯ STAR7 FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingStar7(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(star7Rotation);
        return;
      }
    }
    
    // â­ Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù…Ø§Ù†ÙŠØ© Ø¹Ù†Ø¯Ù…Ø§ ØªÙƒÙˆÙ† Ù…Ø­Ø¯Ø¯Ø©
    if (selectedShape === "star8") {
      console.log("â­ðŸŽ¯ STAR8: Processing star8 mouse down");
      const r = degreeRingRadius;
      const star8Points = [];
      for (let i = 0; i < 8; i++) {
        const angle = ((i * 45) + star8Rotation + settings.rotation - 90) * Math.PI / 180;
        star8Points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      console.log(`â­ Star8 check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`ðŸ“ Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // ÙƒØ´Ù ÙÙˆØ±ÙŠ Ø¹Ù„Ù‰ Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù…Ø§Ù†ÙŠØ© Ø¨Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ©
      for (let idx = 0; idx < star8Points.length; idx++) {
        const point = star8Points[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = (idx * 45);
        
        console.log(`â­ STAR8 Vertex ${idx} (angle: ${vertexAngle}Â°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // Ù…Ù†Ø·Ù‚Ø© ÙˆØ§Ø³Ø¹Ø© Ù„Ø¬Ù…ÙŠØ¹ Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù…Ø§Ù†ÙŠØ©
        const detectionRadius = 30; // Ø²ÙŠØ§Ø¯Ø© Ù…Ù†Ø·Ù‚Ø© Ø§Ù„ÙƒØ´Ù Ù…Ù† 20 Ø¥Ù„Ù‰ 30
        
        if (d < detectionRadius) {
          console.log(`ðŸš€ STAR8: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}Â° (distance: ${d.toFixed(1)})`);
          setIsDraggingStar8(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star8Rotation);
          return; // Ø®Ø±ÙˆØ¬ ÙÙˆØ±ÙŠ Ù…Ø·Ù„Ù‚
        }
      }
      
      // ÙƒØ´Ù Ø¥Ø¶Ø§ÙÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ© Ù„Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù…Ø§Ù†ÙŠØ©
      for (let idx = 0; idx < star8Points.length; idx++) {
        const point = star8Points[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`ðŸš€ STAR8: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingStar8(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star8Rotation);
          return;
        }
      }
      
      // ÙØ­Øµ Ø¹Ø§Ù… Ù„Ù…Ù†Ø·Ù‚Ø© Ø£ÙˆØ³Ø¹ Ø­ÙˆÙ„ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù…Ø§Ù†ÙŠØ©
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`ðŸŽ¯ STAR8 FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingStar8(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(star8Rotation);
        return;
      }
    }
    
    // â­ Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„ØªØ³Ø§Ø¹ÙŠØ© Ø¹Ù†Ø¯Ù…Ø§ ØªÙƒÙˆÙ† Ù…Ø­Ø¯Ø¯Ø©
    if (selectedShape === "star9") {
      console.log("â­ðŸŽ¯ STAR9: Processing star9 mouse down");
      const r = degreeRingRadius;
      const star9Points = [];
      for (let i = 0; i < 9; i++) {
        const angle = ((i * 360 / 9) + star9Rotation + settings.rotation - 90) * Math.PI / 180;
        star9Points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      console.log(`â­ Star9 check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`ðŸ“ Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // ÙƒØ´Ù ÙÙˆØ±ÙŠ Ø¹Ù„Ù‰ Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„ØªØ³Ø§Ø¹ÙŠØ© Ø¨Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ©
      for (let idx = 0; idx < star9Points.length; idx++) {
        const point = star9Points[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = (idx * 360 / 9);
        
        console.log(`â­ STAR9 Vertex ${idx} (angle: ${vertexAngle.toFixed(1)}Â°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // Ù…Ù†Ø·Ù‚Ø© ÙˆØ§Ø³Ø¹Ø© Ù„Ø¬Ù…ÙŠØ¹ Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„ØªØ³Ø§Ø¹ÙŠØ©
        const detectionRadius = 30; // Ø²ÙŠØ§Ø¯Ø© Ù…Ù†Ø·Ù‚Ø© Ø§Ù„ÙƒØ´Ù Ù…Ù† 20 Ø¥Ù„Ù‰ 30
        
        if (d < detectionRadius) {
          console.log(`ðŸš€ STAR9: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle.toFixed(1)}Â° (distance: ${d.toFixed(1)})`);
          setIsDraggingStar9(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star9Rotation);
          return; // Ø®Ø±ÙˆØ¬ ÙÙˆØ±ÙŠ Ù…Ø·Ù„Ù‚
        }
      }
      
      // ÙƒØ´Ù Ø¥Ø¶Ø§ÙÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ© Ù„Ù„Ù†Ø¬Ù…Ø© Ø§Ù„ØªØ³Ø§Ø¹ÙŠØ©
      for (let idx = 0; idx < star9Points.length; idx++) {
        const point = star9Points[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`ðŸš€ STAR9: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingStar9(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star9Rotation);
          return;
        }
      }
      
      // ÙØ­Øµ Ø¹Ø§Ù… Ù„Ù…Ù†Ø·Ù‚Ø© Ø£ÙˆØ³Ø¹ Ø­ÙˆÙ„ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„ØªØ³Ø§Ø¹ÙŠØ©
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`ðŸŽ¯ STAR9 FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingStar9(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(star9Rotation);
        return;
      }
    }
    
    // â­ Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø¹Ø§Ø´Ø±ÙŠØ© Ø¹Ù†Ø¯Ù…Ø§ ØªÙƒÙˆÙ† Ù…Ø­Ø¯Ø¯Ø©
    if (selectedShape === "star10") {
      console.log("â­ðŸŽ¯ STAR10: Processing star10 mouse down");
      const r = degreeRingRadius;
      const star10Points = [];
      for (let i = 0; i < 10; i++) {
        const angle = ((i * 360 / 10) + star10Rotation + settings.rotation - 90) * Math.PI / 180;
        star10Points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      console.log(`â­ Star10 check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`ðŸ“ Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // ÙƒØ´Ù ÙÙˆØ±ÙŠ Ø¹Ù„Ù‰ Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø¹Ø§Ø´Ø±ÙŠØ© Ø¨Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ©
      for (let idx = 0; idx < star10Points.length; idx++) {
        const point = star10Points[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = (idx * 360 / 10);
        
        console.log(`â­ STAR10 Vertex ${idx} (angle: ${vertexAngle}Â°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // Ù…Ù†Ø·Ù‚Ø© ÙˆØ§Ø³Ø¹Ø© Ù„Ø¬Ù…ÙŠØ¹ Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø¹Ø§Ø´Ø±ÙŠØ©
        const detectionRadius = 30; // Ø²ÙŠØ§Ø¯Ø© Ù…Ù†Ø·Ù‚Ø© Ø§Ù„ÙƒØ´Ù Ù…Ù† 20 Ø¥Ù„Ù‰ 30
        
        if (d < detectionRadius) {
          console.log(`ðŸš€ STAR10: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}Â° (distance: ${d.toFixed(1)})`);
          setIsDraggingStar10(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star10Rotation);
          return; // Ø®Ø±ÙˆØ¬ ÙÙˆØ±ÙŠ Ù…Ø·Ù„Ù‚
        }
      }
      
      // ÙƒØ´Ù Ø¥Ø¶Ø§ÙÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ© Ù„Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø¹Ø§Ø´Ø±ÙŠØ©
      for (let idx = 0; idx < star10Points.length; idx++) {
        const point = star10Points[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`ðŸš€ STAR10: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingStar10(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star10Rotation);
          return;
        }
      }
      
      // ÙØ­Øµ Ø¹Ø§Ù… Ù„Ù…Ù†Ø·Ù‚Ø© Ø£ÙˆØ³Ø¹ Ø­ÙˆÙ„ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø¹Ø§Ø´Ø±ÙŠØ©
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`ðŸŽ¯ STAR10 FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingStar10(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(star10Rotation);
        return;
      }
    }
    
    // â­ Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø­Ø§Ø¯ÙŠØ© Ø¹Ø´Ø±Ø© Ø¹Ù†Ø¯Ù…Ø§ ØªÙƒÙˆÙ† Ù…Ø­Ø¯Ø¯Ø©
    if (selectedShape === "star11") {
      console.log("â­ðŸŽ¯ STAR11: Processing star11 mouse down");
      const r = degreeRingRadius;
      const star11Points = [];
      for (let i = 0; i < 11; i++) {
        const angle = ((i * 360 / 11) + star11Rotation + settings.rotation - 90) * Math.PI / 180;
        star11Points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      console.log(`â­ Star11 check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`ðŸ“ Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // ÙƒØ´Ù ÙÙˆØ±ÙŠ Ø¹Ù„Ù‰ Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø­Ø§Ø¯ÙŠØ© Ø¹Ø´Ø±Ø© Ø¨Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ©
      for (let idx = 0; idx < star11Points.length; idx++) {
        const point = star11Points[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = (idx * 360 / 11);
        
        console.log(`â­ STAR11 Vertex ${idx} (angle: ${vertexAngle.toFixed(1)}Â°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // Ù…Ù†Ø·Ù‚Ø© ÙˆØ§Ø³Ø¹Ø© Ù„Ø¬Ù…ÙŠØ¹ Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø­Ø§Ø¯ÙŠØ© Ø¹Ø´Ø±Ø©
        const detectionRadius = 30; // Ø²ÙŠØ§Ø¯Ø© Ù…Ù†Ø·Ù‚Ø© Ø§Ù„ÙƒØ´Ù Ù…Ù† 20 Ø¥Ù„Ù‰ 30
        
        if (d < detectionRadius) {
          console.log(`ðŸš€ STAR11: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle.toFixed(1)}Â° (distance: ${d.toFixed(1)})`);
          setIsDraggingStar11(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star11Rotation);
          return; // Ø®Ø±ÙˆØ¬ ÙÙˆØ±ÙŠ Ù…Ø·Ù„Ù‚
        }
      }
      
      // ÙƒØ´Ù Ø¥Ø¶Ø§ÙÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ© Ù„Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø­Ø§Ø¯ÙŠØ© Ø¹Ø´Ø±Ø©
      for (let idx = 0; idx < star11Points.length; idx++) {
        const point = star11Points[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`ðŸš€ STAR11: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingStar11(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star11Rotation);
          return;
        }
      }
      
      // ÙØ­Øµ Ø¹Ø§Ù… Ù„Ù…Ù†Ø·Ù‚Ø© Ø£ÙˆØ³Ø¹ Ø­ÙˆÙ„ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø­Ø§Ø¯ÙŠØ© Ø¹Ø´Ø±Ø©
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`ðŸŽ¯ STAR11 FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingStar11(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(star11Rotation);
        return;
      }
    }
    
    // â­ Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ© Ø¹Ø´Ø±Ø© Ø¹Ù†Ø¯Ù…Ø§ ØªÙƒÙˆÙ† Ù…Ø­Ø¯Ø¯Ø©
    if (selectedShape === "star12") {
      console.log("â­ðŸŽ¯ STAR12: Processing star12 mouse down");
      const r = degreeRingRadius;
      const star12Points = [];
      for (let i = 0; i < 12; i++) {
        const angle = ((i * 360 / 12) + star12Rotation + settings.rotation - 90) * Math.PI / 180;
        star12Points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      console.log(`â­ Star12 check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`ðŸ“ Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // ÙƒØ´Ù ÙÙˆØ±ÙŠ Ø¹Ù„Ù‰ Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ© Ø¹Ø´Ø±Ø© Ø¨Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ©
      for (let idx = 0; idx < star12Points.length; idx++) {
        const point = star12Points[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = (idx * 360 / 12);
        
        console.log(`â­ STAR12 Vertex ${idx} (angle: ${vertexAngle}Â°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // Ù…Ù†Ø·Ù‚Ø© ÙˆØ§Ø³Ø¹Ø© Ù„Ø¬Ù…ÙŠØ¹ Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ© Ø¹Ø´Ø±Ø©
        const detectionRadius = 30; // Ø²ÙŠØ§Ø¯Ø© Ù…Ù†Ø·Ù‚Ø© Ø§Ù„ÙƒØ´Ù Ù…Ù† 20 Ø¥Ù„Ù‰ 30
        
        if (d < detectionRadius) {
          console.log(`ðŸš€ STAR12: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}Â° (distance: ${d.toFixed(1)})`);
          setIsDraggingStar12(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star12Rotation);
          return; // Ø®Ø±ÙˆØ¬ ÙÙˆØ±ÙŠ Ù…Ø·Ù„Ù‚
        }
      }
      
      // ÙƒØ´Ù Ø¥Ø¶Ø§ÙÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ© Ù„Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ© Ø¹Ø´Ø±Ø©
      for (let idx = 0; idx < star12Points.length; idx++) {
        const point = star12Points[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`ðŸš€ STAR12: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingStar12(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(star12Rotation);
          return;
        }
      }
      
      // ÙØ­Øµ Ø¹Ø§Ù… Ù„Ù…Ù†Ø·Ù‚Ø© Ø£ÙˆØ³Ø¹ Ø­ÙˆÙ„ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ© Ø¹Ø´Ø±Ø©
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`ðŸŽ¯ STAR12 FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingStar12(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(star12Rotation);
        return;
      }
    }
    
    // ðŸ”· Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø³Ø¨Ø§Ø¹ÙŠ Ø¹Ù†Ø¯Ù…Ø§ ÙŠÙƒÙˆÙ† Ù…Ø­Ø¯Ø¯
    if (selectedShape === "heptagon") {
      console.log("ðŸ”·ðŸŽ¯ HEPTAGON: Processing heptagon mouse down");
      const r = degreeRingRadius;
      const heptagonPoints = [];
      for (let i = 0; i < 7; i++) {
        const angle = ((i * 360 / 7) + heptagonRotation + settings.rotation - 90) * Math.PI / 180;
        heptagonPoints.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      console.log(`ðŸ”· Heptagon check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`ðŸ“ Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // ÙƒØ´Ù ÙÙˆØ±ÙŠ Ø¹Ù„Ù‰ Ø±Ø¤ÙˆØ³ Ø§Ù„Ø³Ø¨Ø§Ø¹ÙŠ Ø¨Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ©
      for (let idx = 0; idx < heptagonPoints.length; idx++) {
        const point = heptagonPoints[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = (idx * 360 / 7);
        
        console.log(`ðŸ”· HEPTAGON Vertex ${idx} (angle: ${vertexAngle.toFixed(1)}Â°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // Ù…Ù†Ø·Ù‚Ø© ÙˆØ§Ø³Ø¹Ø© Ù„Ø¬Ù…ÙŠØ¹ Ø±Ø¤ÙˆØ³ Ø§Ù„Ø³Ø¨Ø§Ø¹ÙŠ
        const detectionRadius = 30; // Ø²ÙŠØ§Ø¯Ø© Ù…Ù†Ø·Ù‚Ø© Ø§Ù„ÙƒØ´Ù Ù…Ù† 15 Ø¥Ù„Ù‰ 30
        
        if (d < detectionRadius) {
          console.log(`ðŸš€ HEPTAGON: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle.toFixed(1)}Â° (distance: ${d.toFixed(1)})`);
          setIsDraggingHeptagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(heptagonRotation);
          return; // Ø®Ø±ÙˆØ¬ ÙÙˆØ±ÙŠ Ù…Ø·Ù„Ù‚
        }
      }
      
      // ÙƒØ´Ù Ø¥Ø¶Ø§ÙÙŠ Ø¹Ù„Ù‰ Ø£Ø¶Ù„Ø§Ø¹ Ø§Ù„Ø³Ø¨Ø§Ø¹ÙŠ ÙˆØ§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ©
      for (let i = 0; i < heptagonPoints.length; i++) {
        const currentPoint = heptagonPoints[i];
        const nextPoint = heptagonPoints[(i + 1) % heptagonPoints.length];
        
        const distanceToEdge = getDistanceToLine(
          x, y,
          currentPoint.x, currentPoint.y,
          nextPoint.x, nextPoint.y
        );
        
        if (distanceToEdge < 30) {
          console.log(`ðŸš€ HEPTAGON: Edge detection ${i}-${(i + 1) % heptagonPoints.length} (distance: ${distanceToEdge.toFixed(1)})`);
          setIsDraggingHeptagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(heptagonRotation);
          return;
        }
      }

      // ÙƒØ´Ù Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ© Ù„Ù„Ø³Ø¨Ø§Ø¹ÙŠ
      for (let idx = 0; idx < heptagonPoints.length; idx++) {
        const point = heptagonPoints[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`ðŸš€ HEPTAGON: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingHeptagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(heptagonRotation);
          return;
        }
      }
      
      // ÙØ­Øµ Ø¹Ø§Ù… Ù„Ù…Ù†Ø·Ù‚Ø© Ø£ÙˆØ³Ø¹ Ø­ÙˆÙ„ Ø§Ù„Ø³Ø¨Ø§Ø¹ÙŠ
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`ðŸŽ¯ HEPTAGON FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingHeptagon(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(heptagonRotation);
        return;
      }
    }
    
    // ðŸ”¸ Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø«Ù…Ø§Ù†ÙŠ Ø¹Ù†Ø¯Ù…Ø§ ÙŠÙƒÙˆÙ† Ù…Ø­Ø¯Ø¯
    if (selectedShape === "octagon") {
      console.log("ðŸ”¸ðŸŽ¯ OCTAGON: Processing octagon mouse down");
      const r = degreeRingRadius;
      const octagonPoints = customOctagonAngles.map((deg) => {
        const rad = ((deg + octagonRotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      console.log(`ðŸ”¸ Octagon check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`ðŸ“ Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // ÙƒØ´Ù ÙÙˆØ±ÙŠ Ø¹Ù„Ù‰ Ø±Ø¤ÙˆØ³ Ø§Ù„Ø«Ù…Ø§Ù†ÙŠ Ø¨Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ©
      for (let idx = 0; idx < octagonPoints.length; idx++) {
        const point = octagonPoints[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = customOctagonAngles[idx];
        
        console.log(`ðŸ”¸ OCTAGON Vertex ${idx} (angle: ${vertexAngle}Â°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // Ù…Ù†Ø·Ù‚Ø© ÙˆØ§Ø³Ø¹Ø© Ù„Ø¬Ù…ÙŠØ¹ Ø±Ø¤ÙˆØ³ Ø§Ù„Ø«Ù…Ø§Ù†ÙŠ
        const detectionRadius = 30; // Ø²ÙŠØ§Ø¯Ø© Ù…Ù†Ø·Ù‚Ø© Ø§Ù„ÙƒØ´Ù Ù…Ù† 15 Ø¥Ù„Ù‰ 30
        
        if (d < detectionRadius) {
          console.log(`ðŸš€ OCTAGON: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}Â° (distance: ${d.toFixed(1)})`);
          setIsDraggingOctagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(octagonRotation);
          return; // Ø®Ø±ÙˆØ¬ ÙÙˆØ±ÙŠ Ù…Ø·Ù„Ù‚
        }
      }
      
      // ÙƒØ´Ù Ø¥Ø¶Ø§ÙÙŠ Ø¹Ù„Ù‰ Ø£Ø¶Ù„Ø§Ø¹ Ø§Ù„Ø«Ù…Ø§Ù†ÙŠ ÙˆØ§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ©
      for (let i = 0; i < octagonPoints.length; i++) {
        const currentPoint = octagonPoints[i];
        const nextPoint = octagonPoints[(i + 1) % octagonPoints.length];
        
        const distanceToEdge = getDistanceToLine(
          x, y,
          currentPoint.x, currentPoint.y,
          nextPoint.x, nextPoint.y
        );
        
        if (distanceToEdge < 30) {
          console.log(`ðŸš€ OCTAGON: Edge detection ${i}-${(i + 1) % octagonPoints.length} (distance: ${distanceToEdge.toFixed(1)})`);
          setIsDraggingOctagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(octagonRotation);
          return;
        }
      }

      // ÙƒØ´Ù Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ© Ù„Ù„Ø«Ù…Ø§Ù†ÙŠ
      for (let idx = 0; idx < octagonPoints.length; idx++) {
        const point = octagonPoints[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`ðŸš€ OCTAGON: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingOctagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(octagonRotation);
          return;
        }
      }
      
      // ÙØ­Øµ Ø¹Ø§Ù… Ù„Ù…Ù†Ø·Ù‚Ø© Ø£ÙˆØ³Ø¹ Ø­ÙˆÙ„ Ø§Ù„Ø«Ù…Ø§Ù†ÙŠ
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`ðŸŽ¯ OCTAGON FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingOctagon(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(octagonRotation);
        return;
      }
    }
    
    // ðŸ”¹ Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„ØªØ³Ø§Ø¹ÙŠ Ø¹Ù†Ø¯Ù…Ø§ ÙŠÙƒÙˆÙ† Ù…Ø­Ø¯Ø¯
    if (selectedShape === "nonagon") {
      console.log("ðŸ”¹ðŸŽ¯ NONAGON: Processing nonagon mouse down");
      const r = degreeRingRadius;
      const nonagonPoints = [];
      for (let i = 0; i < 9; i++) {
        const angle = ((i * 360 / 9) + nonagonRotation + settings.rotation - 90) * Math.PI / 180;
        nonagonPoints.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      console.log(`ðŸ”¹ Nonagon check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`ðŸ“ Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // ÙƒØ´Ù ÙÙˆØ±ÙŠ Ø¹Ù„Ù‰ Ø±Ø¤ÙˆØ³ Ø§Ù„ØªØ³Ø§Ø¹ÙŠ Ø¨Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ©
      for (let idx = 0; idx < nonagonPoints.length; idx++) {
        const point = nonagonPoints[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = (idx * 360 / 9);
        
        console.log(`ðŸ”¹ NONAGON Vertex ${idx} (angle: ${vertexAngle.toFixed(1)}Â°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // Ù…Ù†Ø·Ù‚Ø© ÙˆØ§Ø³Ø¹Ø© Ù„Ø¬Ù…ÙŠØ¹ Ø±Ø¤ÙˆØ³ Ø§Ù„ØªØ³Ø§Ø¹ÙŠ
        const detectionRadius = 30; // Ø²ÙŠØ§Ø¯Ø© Ù…Ù†Ø·Ù‚Ø© Ø§Ù„ÙƒØ´Ù Ù…Ù† 15 Ø¥Ù„Ù‰ 30
        
        if (d < detectionRadius) {
          console.log(`ðŸš€ NONAGON: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle.toFixed(1)}Â° (distance: ${d.toFixed(1)})`);
          setIsDraggingNonagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(nonagonRotation);
          return; // Ø®Ø±ÙˆØ¬ ÙÙˆØ±ÙŠ Ù…Ø·Ù„Ù‚
        }
      }
      
      // ÙƒØ´Ù Ø¥Ø¶Ø§ÙÙŠ Ø¹Ù„Ù‰ Ø£Ø¶Ù„Ø§Ø¹ Ø§Ù„ØªØ³Ø§Ø¹ÙŠ ÙˆØ§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ©
      for (let i = 0; i < nonagonPoints.length; i++) {
        const currentPoint = nonagonPoints[i];
        const nextPoint = nonagonPoints[(i + 1) % nonagonPoints.length];
        
        const distanceToEdge = getDistanceToLine(
          x, y,
          currentPoint.x, currentPoint.y,
          nextPoint.x, nextPoint.y
        );
        
        if (distanceToEdge < 30) {
          console.log(`ðŸš€ NONAGON: Edge detection ${i}-${(i + 1) % nonagonPoints.length} (distance: ${distanceToEdge.toFixed(1)})`);
          setIsDraggingNonagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(nonagonRotation);
          return;
        }
      }

      // ÙƒØ´Ù Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ© Ù„Ù„ØªØ³Ø§Ø¹ÙŠ
      for (let idx = 0; idx < nonagonPoints.length; idx++) {
        const point = nonagonPoints[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`ðŸš€ NONAGON: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingNonagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(nonagonRotation);
          return;
        }
      }
      
      // ÙØ­Øµ Ø¹Ø§Ù… Ù„Ù…Ù†Ø·Ù‚Ø© Ø£ÙˆØ³Ø¹ Ø­ÙˆÙ„ Ø§Ù„ØªØ³Ø§Ø¹ÙŠ
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`ðŸŽ¯ NONAGON FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingNonagon(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(nonagonRotation);
        return;
      }
    }
    
    // ðŸ”· Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø¹Ø§Ø´Ø± Ø¹Ù†Ø¯Ù…Ø§ ÙŠÙƒÙˆÙ† Ù…Ø­Ø¯Ø¯
    if (selectedShape === "decagon") {
      console.log("ðŸ”·ðŸŽ¯ DECAGON: Processing decagon mouse down");
      const r = degreeRingRadius;
      const decagonPoints = [];
      for (let i = 0; i < 10; i++) {
        const angle = ((i * 360 / 10) + decagonRotation + settings.rotation - 90) * Math.PI / 180;
        decagonPoints.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      console.log(`ðŸ”· Decagon check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`ðŸ“ Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // ÙƒØ´Ù ÙÙˆØ±ÙŠ Ø¹Ù„Ù‰ Ø±Ø¤ÙˆØ³ Ø§Ù„Ø¹Ø§Ø´Ø± Ø¨Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ©
      for (let idx = 0; idx < decagonPoints.length; idx++) {
        const point = decagonPoints[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = (idx * 360 / 10);
        
        console.log(`ðŸ”· DECAGON Vertex ${idx} (angle: ${vertexAngle}Â°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // Ù…Ù†Ø·Ù‚Ø© ÙˆØ§Ø³Ø¹Ø© Ù„Ø¬Ù…ÙŠØ¹ Ø±Ø¤ÙˆØ³ Ø§Ù„Ø¹Ø§Ø´Ø±
        const detectionRadius = 30; // Ø²ÙŠØ§Ø¯Ø© Ù…Ù†Ø·Ù‚Ø© Ø§Ù„ÙƒØ´Ù Ù…Ù† 15 Ø¥Ù„Ù‰ 30
        
        if (d < detectionRadius) {
          console.log(`ðŸš€ DECAGON: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}Â° (distance: ${d.toFixed(1)})`);
          setIsDraggingDecagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(decagonRotation);
          return; // Ø®Ø±ÙˆØ¬ ÙÙˆØ±ÙŠ Ù…Ø·Ù„Ù‚
        }
      }
      
      // ÙƒØ´Ù Ø¥Ø¶Ø§ÙÙŠ Ø¹Ù„Ù‰ Ø£Ø¶Ù„Ø§Ø¹ Ø§Ù„Ø¹Ø§Ø´Ø± ÙˆØ§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ©
      for (let i = 0; i < decagonPoints.length; i++) {
        const currentPoint = decagonPoints[i];
        const nextPoint = decagonPoints[(i + 1) % decagonPoints.length];
        
        const distanceToEdge = getDistanceToLine(
          x, y,
          currentPoint.x, currentPoint.y,
          nextPoint.x, nextPoint.y
        );
        
        if (distanceToEdge < 30) {
          console.log(`ðŸš€ DECAGON: Edge detection ${i}-${(i + 1) % decagonPoints.length} (distance: ${distanceToEdge.toFixed(1)})`);
          setIsDraggingDecagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(decagonRotation);
          return;
        }
      }

      // ÙƒØ´Ù Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ© Ù„Ù„Ø¹Ø§Ø´Ø±
      for (let idx = 0; idx < decagonPoints.length; idx++) {
        const point = decagonPoints[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`ðŸš€ DECAGON: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingDecagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(decagonRotation);
          return;
        }
      }
      
      // ÙØ­Øµ Ø¹Ø§Ù… Ù„Ù…Ù†Ø·Ù‚Ø© Ø£ÙˆØ³Ø¹ Ø­ÙˆÙ„ Ø§Ù„Ø¹Ø§Ø´Ø±
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`ðŸŽ¯ DECAGON FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingDecagon(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(decagonRotation);
        return;
      }
    }
    
    // ðŸ”¸ Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø­Ø§Ø¯ÙŠ Ø¹Ø´Ø± Ø¹Ù†Ø¯Ù…Ø§ ÙŠÙƒÙˆÙ† Ù…Ø­Ø¯Ø¯
    if (selectedShape === "eleven") {
      console.log("ðŸ”¸ðŸŽ¯ ELEVEN: Processing eleven mouse down");
      const r = degreeRingRadius;
      const hendecagonPoints = [];
      for (let i = 0; i < 11; i++) {
        const angle = ((i * 360 / 11) + hendecagonRotation + settings.rotation - 90) * Math.PI / 180;
        hendecagonPoints.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      console.log(`ðŸ”¸ Eleven check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`ðŸ“ Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // ÙƒØ´Ù ÙÙˆØ±ÙŠ Ø¹Ù„Ù‰ Ø±Ø¤ÙˆØ³ Ø§Ù„Ø­Ø§Ø¯ÙŠ Ø¹Ø´Ø± Ø¨Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ©
      for (let idx = 0; idx < hendecagonPoints.length; idx++) {
        const point = hendecagonPoints[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = (idx * 360 / 11);
        
        console.log(`ðŸ”¸ ELEVEN Vertex ${idx} (angle: ${vertexAngle.toFixed(1)}Â°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // Ù…Ù†Ø·Ù‚Ø© ÙˆØ§Ø³Ø¹Ø© Ù„Ø¬Ù…ÙŠØ¹ Ø±Ø¤ÙˆØ³ Ø§Ù„Ø­Ø§Ø¯ÙŠ Ø¹Ø´Ø±
        const detectionRadius = 30; // Ø²ÙŠØ§Ø¯Ø© Ù…Ù†Ø·Ù‚Ø© Ø§Ù„ÙƒØ´Ù Ù…Ù† 15 Ø¥Ù„Ù‰ 30
        
        if (d < detectionRadius) {
          console.log(`ðŸš€ ELEVEN: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle.toFixed(1)}Â° (distance: ${d.toFixed(1)})`);
          setIsDraggingHendecagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(hendecagonRotation);
          return; // Ø®Ø±ÙˆØ¬ ÙÙˆØ±ÙŠ Ù…Ø·Ù„Ù‚
        }
      }
      
      // ÙƒØ´Ù Ø¥Ø¶Ø§ÙÙŠ Ø¹Ù„Ù‰ Ø£Ø¶Ù„Ø§Ø¹ Ø§Ù„Ø­Ø§Ø¯ÙŠ Ø¹Ø´Ø± ÙˆØ§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ©
      for (let i = 0; i < hendecagonPoints.length; i++) {
        const currentPoint = hendecagonPoints[i];
        const nextPoint = hendecagonPoints[(i + 1) % hendecagonPoints.length];
        
        const distanceToEdge = getDistanceToLine(
          x, y,
          currentPoint.x, currentPoint.y,
          nextPoint.x, nextPoint.y
        );
        
        if (distanceToEdge < 30) {
          console.log(`ðŸš€ ELEVEN: Edge detection ${i}-${(i + 1) % hendecagonPoints.length} (distance: ${distanceToEdge.toFixed(1)})`);
          setIsDraggingHendecagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(hendecagonRotation);
          return;
        }
      }

      // ÙƒØ´Ù Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ© Ù„Ù„Ø­Ø§Ø¯ÙŠ Ø¹Ø´Ø±
      for (let idx = 0; idx < hendecagonPoints.length; idx++) {
        const point = hendecagonPoints[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`ðŸš€ ELEVEN: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingHendecagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(hendecagonRotation);
          return;
        }
      }
      
      // ÙØ­Øµ Ø¹Ø§Ù… Ù„Ù…Ù†Ø·Ù‚Ø© Ø£ÙˆØ³Ø¹ Ø­ÙˆÙ„ Ø§Ù„Ø­Ø§Ø¯ÙŠ Ø¹Ø´Ø±
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`ðŸŽ¯ ELEVEN FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingHendecagon(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(hendecagonRotation);
        return;
      }
    }
    
    // ðŸ”· Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø«Ø§Ù†ÙŠ Ø¹Ø´Ø± Ø¹Ù†Ø¯Ù…Ø§ ÙŠÙƒÙˆÙ† Ù…Ø­Ø¯Ø¯
    if (selectedShape === "twelve") {
      console.log("ðŸ”·ðŸŽ¯ TWELVE: Processing twelve mouse down");
      const r = degreeRingRadius;
      const dodecagonPoints = [];
      for (let i = 0; i < 12; i++) {
        const angle = ((i * 360 / 12) + dodecagonRotation + settings.rotation - 90) * Math.PI / 180;
        dodecagonPoints.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      console.log(`ðŸ”· Twelve check - radius: ${r}, center: (${center}, ${center})`);
      console.log(`ðŸ“ Distance from center: ${distanceFromCenter.toFixed(1)}`);

      // ÙƒØ´Ù ÙÙˆØ±ÙŠ Ø¹Ù„Ù‰ Ø±Ø¤ÙˆØ³ Ø§Ù„Ø«Ø§Ù†ÙŠ Ø¹Ø´Ø± Ø¨Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ©
      for (let idx = 0; idx < dodecagonPoints.length; idx++) {
        const point = dodecagonPoints[idx];
        const d = getDistance(x, y, point.x, point.y);
        const vertexAngle = (idx * 360 / 12);
        
        console.log(`ðŸ”· TWELVE Vertex ${idx} (angle: ${vertexAngle}Â°): position (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), distance: ${d.toFixed(1)}`);
        
        // Ù…Ù†Ø·Ù‚Ø© ÙˆØ§Ø³Ø¹Ø© Ù„Ø¬Ù…ÙŠØ¹ Ø±Ø¤ÙˆØ³ Ø§Ù„Ø«Ø§Ù†ÙŠ Ø¹Ø´Ø±
        const detectionRadius = 30; // Ø²ÙŠØ§Ø¯Ø© Ù…Ù†Ø·Ù‚Ø© Ø§Ù„ÙƒØ´Ù Ù…Ù† 15 Ø¥Ù„Ù‰ 30
        
        if (d < detectionRadius) {
          console.log(`ðŸš€ TWELVE: IMMEDIATE activation on vertex ${idx} at angle ${vertexAngle}Â° (distance: ${d.toFixed(1)})`);
          setIsDraggingDodecagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(dodecagonRotation);
          return; // Ø®Ø±ÙˆØ¬ ÙÙˆØ±ÙŠ Ù…Ø·Ù„Ù‚
        }
      }
      
      // ÙƒØ´Ù Ø¥Ø¶Ø§ÙÙŠ Ø¹Ù„Ù‰ Ø£Ø¶Ù„Ø§Ø¹ Ø§Ù„Ø«Ø§Ù†ÙŠ Ø¹Ø´Ø± ÙˆØ§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ©
      for (let i = 0; i < dodecagonPoints.length; i++) {
        const currentPoint = dodecagonPoints[i];
        const nextPoint = dodecagonPoints[(i + 1) % dodecagonPoints.length];
        
        const distanceToEdge = getDistanceToLine(
          x, y,
          currentPoint.x, currentPoint.y,
          nextPoint.x, nextPoint.y
        );
        
        if (distanceToEdge < 30) {
          console.log(`ðŸš€ TWELVE: Edge detection ${i}-${(i + 1) % dodecagonPoints.length} (distance: ${distanceToEdge.toFixed(1)})`);
          setIsDraggingDodecagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(dodecagonRotation);
          return;
        }
      }

      // ÙƒØ´Ù Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ© Ù„Ù„Ø«Ø§Ù†ÙŠ Ø¹Ø´Ø±
      for (let idx = 0; idx < dodecagonPoints.length; idx++) {
        const point = dodecagonPoints[idx];
        const distanceToRay = getDistanceToLine(
          x, y,
          center, center,
          point.x, point.y
        );
        
        if (distanceToRay < 35 && distanceFromCenter >= 50 && distanceFromCenter <= r + 100) {
          console.log(`ðŸš€ TWELVE: Ray detection to vertex ${idx} (distance: ${distanceToRay.toFixed(1)})`);
          setIsDraggingDodecagon(true);
          setDragStartAngle(getAngleDeg(x, y));
          setInitialRotation(dodecagonRotation);
          return;
        }
      }
      
      // ÙØ­Øµ Ø¹Ø§Ù… Ù„Ù…Ù†Ø·Ù‚Ø© Ø£ÙˆØ³Ø¹ Ø­ÙˆÙ„ Ø§Ù„Ø«Ø§Ù†ÙŠ Ø¹Ø´Ø±
      const minDistance = r * 0.2;
      const maxDistance = r + 50;
      
      if (distanceFromCenter >= minDistance && distanceFromCenter <= maxDistance) {
        console.log(`ðŸŽ¯ TWELVE FALLBACK: Activating drag in general area (distance: ${distanceFromCenter.toFixed(1)}, range: ${minDistance.toFixed(1)}-${maxDistance.toFixed(1)})`);
        setIsDraggingDodecagon(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(dodecagonRotation);
        return;
      }
    }
    
    // **Ù…Ù†Ø·Ù‚ Ø§Ø­ØªÙŠØ§Ø·ÙŠ Ù†Ù‡Ø§Ø¦ÙŠ - Ø£ÙˆÙ„ÙˆÙŠØ© Ù…Ø·Ù„Ù‚Ø© Ù„Ù„Ù…Ø«Ù„Ø« Ø§Ù„Ù…Ø­Ø¯Ø¯**
    if (selectedShape === "triangle" && !isDraggingTriangle) {
      const triangleRadius = degreeRingRadius;
      console.log(`ðŸ”„ TRIANGLE FALLBACK: Final attempt for triangle. Distance: ${distanceFromCenter.toFixed(1)}`);
      
      // Ø£ÙŠ Ù†Ù‚Ø±Ø© ÙÙŠ Ù…Ù†Ø·Ù‚Ø© Ù…Ø¹Ù‚ÙˆÙ„Ø© ØªÙØ¹Ù„ ØªØ¯ÙˆÙŠØ± Ø§Ù„Ù…Ø«Ù„Ø« - Ø£ÙˆÙ„ÙˆÙŠØ© Ù…Ø·Ù„Ù‚Ø©
      const minTriangleRange = Math.max(50, triangleRadius - 300);
      const maxTriangleRange = triangleRadius + 400;
      
      if (distanceFromCenter >= minTriangleRange && distanceFromCenter <= maxTriangleRange) {
        console.log(`ðŸš€ TRIANGLE FALLBACK SUCCESS: Absolute priority - activating triangle rotation!`);
        setIsDraggingTriangle(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(triangleRotation);
        return; // Ø®Ø±ÙˆØ¬ ÙÙˆØ±ÙŠ - Ù…Ù†Ø¹ Ø£ÙŠ Ù…Ø¹Ø§Ù„Ø¬Ø© Ø£Ø®Ø±Ù‰
      }
    }
    
    // **Ù…Ù†Ø·Ù‚ Ø§Ø­ØªÙŠØ§Ø·ÙŠ Ù„Ø¹Ø¬Ù„Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§ - Ù„Ù„Ø¬Ù…ÙŠØ¹ Ù…Ø§ Ø¹Ø¯Ø§ Ø§Ù„Ù…Ø«Ù„Ø« ÙˆØ§Ù„Ø£Ø´ÙƒØ§Ù„ Ø§Ù„Ù†Ø´Ø·Ø©**
    if (showAngleWheel && !isDraggingAngleWheel) {
      console.log(`ðŸ”„ ANGLE WHEEL FALLBACK: Final attempt for angle wheel. selectedShape: ${selectedShape}, Distance: ${distanceFromCenter.toFixed(1)}`);
      
      // Ø£ÙŠ Ù†Ù‚Ø±Ø© ÙÙŠ Ø£ÙŠ Ù…ÙƒØ§Ù† Ù…Ø¹Ù‚ÙˆÙ„ ØªÙØ¹Ù„ Ø¹Ø¬Ù„Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§
      if (distanceFromCenter >= 30 && distanceFromCenter <= (canvasSize / 2 - 30)) {
        console.log(`âœ… ANGLE WHEEL FALLBACK SUCCESS: Activating angle wheel rotation`);
        setIsDraggingAngleWheel(true);
        setDragStartAngle(getAngleDeg(x, y));
        setInitialRotation(angleWheelRotation);
      }
    }
  }

  function onMouseMove(e) {
    const { x, y } = getMousePos(e);
    
    // ØªØ¹Ø±ÙŠÙ Ù…Ø±ÙƒØ² Ø§Ù„Ø¯Ø§Ø¦Ø±Ø© - Ù…Ø·Ø§Ø¨Ù‚ Ù„Ù„Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©
    const center = canvasSize / 2;
    
    // **Ø­Ø³Ø§Ø¨ Ø£Ù†ØµØ§Ù Ø§Ù„Ø£Ù‚Ø·Ø§Ø± Ù…Ø±Ø© ÙˆØ§Ø­Ø¯Ø©**
    const innerRadius = canvasSize / 2 - 50;
    const baseRingWidth = 100; // Ø²ÙŠØ§Ø¯Ø© Ø§Ù„Ø¹Ø±Ø¶ Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ Ù„Ø®Ù„Ø§ÙŠØ§ Ø£ÙƒØ¨Ø±
    const digitScale = 20; // Ø²ÙŠØ§Ø¯Ø© Ø§Ù„Ù…Ù‚ÙŠØ§Ø³ Ù„Ù„Ø£Ø±Ù‚Ø§Ù… Ø§Ù„Ø·ÙˆÙŠÙ„Ø©  
    const minCellPadding = 16; // Ø­Ø¯ Ø£Ø¯Ù†Ù‰ Ø£ÙƒØ¨Ø± Ù„Ù„Ù…Ø³Ø§Ø­Ø© Ø§Ù„ÙØ§Ø±ØºØ© Ø¯Ø§Ø®Ù„ Ø§Ù„Ø®Ù„ÙŠØ©
    
    // Ø­Ø³Ø§Ø¨ Ø£Ø±Ù‚Ø§Ù… Ø§Ù„Ø¨Ø¯Ø§ÙŠØ© Ù„ÙƒÙ„ Ø­Ù„Ù‚Ø©
    // Ø¥Ø¶Ø§ÙØ© 2 Ø­Ù„Ù‚Ø§Øª Ø¥Ø¶Ø§ÙÙŠØ© (Ø§Ù„Ø£ÙˆÙ„Ù‰ ÙˆØ§Ù„Ø«Ø§Ù†ÙŠØ©) Ù„Ù„Ø­Ù„Ù‚Ø§Øª Ø§Ù„Ù…Ø±Ù‚Ù…Ø©
    const totalLevels = settings.levels + 2;
    const ringStartNumbers = calculateRingStartNumbers(settings.startValue, totalLevels, settings.divisions);
    
    let calculatedLastRadius = innerRadius;
    for (let level = 0; level < totalLevels; level++) {
      const maxDigitsInLevel = Math.max(
        ...Array.from({ length: settings.divisions }, (_, i) => {
          const cellValue = getCellValue(level, i, ringStartNumbers, settings.startValue);
          return cellValue > 0 ? parseFloat(cellValue.toFixed(2)).toString().length : 1;
        })
      );
      
      // Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù†ÙØ³ Ø§Ù„Ø¯Ø§Ù„Ø© Ø§Ù„Ù…Ø­Ø³Ù†Ø© Ù„Ù„Ø­Ø³Ø§Ø¨ Ù„Ù„ØªØ·Ø§Ø¨Ù‚ Ù…Ø¹ Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©
      const dynamicWidth = calculateRingWidth(maxDigitsInLevel);
      
      calculatedLastRadius += dynamicWidth;
    }
    const lastNumberRingRadius = calculatedLastRadius;
    // ØªØ·Ø¨ÙŠÙ‚ Ù†ÙØ³ Ø§Ù„Ù…Ø³Ø§ÙØ§Øª Ø§Ù„Ù…Ø­Ø³Ù†Ø© Ù…Ù† Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© - Ù…Ø¹ ÙØ±Ø§ØºØ§Øª Ù„ØªØ¬Ù†Ø¨ Ø§Ù„ØªØ¯Ø§Ø®Ù„
    const degreeRingRadius = lastNumberRingRadius + 35;
    const angleWheelInnerRadius = degreeRingRadius + 25; // Ø¥Ø¶Ø§ÙØ© ÙØ±Ø§Øº 25px Ù„ØªØ¬Ù†Ø¨ Ø§Ù„ØªØ¯Ø§Ø®Ù„ Ù…Ø¹ Ø§Ù„Ø¯Ø±Ø¬Ø§Øª
    const angleWheelOuterRadius = angleWheelInnerRadius + 55;
    const zodiacInnerRadius = showAngleWheel ? angleWheelOuterRadius : degreeRingRadius + 25; // Ø¥Ø¶Ø§ÙØ© ÙØ±Ø§Øº 25px Ù„ØªØ¬Ù†Ø¨ Ø§Ù„ØªØ¯Ø§Ø®Ù„ Ù…Ø¹ Ø§Ù„Ø¯Ø±Ø¬Ø§Øª
    const zodiacOuterRadius = zodiacInnerRadius + 60; // ØªÙˆØ­ÙŠØ¯ Ø§Ù„Ø³ÙÙ…Ùƒ Ù…Ø¹ Ø­Ù„Ù‚Ø© Ø§Ù„Ø£ÙŠØ§Ù…
    
    // Ø¯Ø§Ù„Ø© Ø­Ø³Ø§Ø¨ Ø§Ù„Ø²Ø§ÙˆÙŠØ© - Ù…Ø·Ø§Ø¨Ù‚Ø© Ù„Ù„Ø¯Ø§Ù„Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©
    const getAngleDeg = (x, y) => {
      const angle = Math.atan2(y - center, x - center) * (180 / Math.PI);
      return (angle + 360) % 360; // ØªØ­ÙˆÙŠÙ„ Ù…Ù† -180/+180 Ø¥Ù„Ù‰ 0-360
    };
    
    // **Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ©: Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ø³Ø­Ø¨ Ø§Ù„Ù†Ø´Ø· Ø£ÙˆÙ„Ø§Ù‹**
    
    // 1ï¸âƒ£ Ø³Ø­Ø¨ Ø§Ù„Ù…Ø«Ù„Ø« - Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ© Ø¬Ø¯Ø§Ù‹
    if (isDraggingTriangle) {
      const currentAngle = getAngleDeg(x, y);
      let delta = currentAngle - dragStartAngle;
      
      // Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù†ØªÙ‚Ø§Ù„ Ø§Ù„Ø²Ø§ÙˆÙŠØ© Ù…Ù† 359Â° Ø¥Ù„Ù‰ 0Â° ÙˆØ§Ù„Ø¹ÙƒØ³
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      
      setTriangleRotation((initialRotation + delta + 360) % 360);
      return; // Ø®Ø±ÙˆØ¬ Ù…Ø¨ÙƒØ± Ù„Ù…Ù†Ø¹ Ø£ÙŠ ØªØ¯Ø§Ø®Ù„
    }
    
    // 2ï¸âƒ£ Ø³Ø­Ø¨ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù„Ø§Ø«ÙŠØ© - Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ© Ø¬Ø¯Ø§Ù‹
    if (isDraggingStar3) {
      const currentAngle = getAngleDeg(x, y);
      let delta = currentAngle - dragStartAngle;
      
      // Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù†ØªÙ‚Ø§Ù„ Ø§Ù„Ø²Ø§ÙˆÙŠØ© Ù…Ù† 359Â° Ø¥Ù„Ù‰ 0Â° ÙˆØ§Ù„Ø¹ÙƒØ³
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      
      setStar3Rotation((initialRotation + delta + 360) % 360);
      return; // Ø®Ø±ÙˆØ¬ Ù…Ø¨ÙƒØ±
    }
    
    // 3ï¸âƒ£ Ø³Ø­Ø¨ Ø¹Ø¬Ù„Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§ - Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ©
    if (isDraggingAngleWheel) {
      console.log("ðŸ”„ Dragging angle wheel...");
      canvas.style.cursor = "grabbing";
      const currentAngle = getAngleDeg(x, y);
      let delta = currentAngle - dragStartAngle;
      
      // Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù†ØªÙ‚Ø§Ù„ Ø§Ù„Ø²Ø§ÙˆÙŠØ© Ù…Ù† 359Â° Ø¥Ù„Ù‰ 0Â° ÙˆØ§Ù„Ø¹ÙƒØ³
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      
      const newRotation = (initialRotation + delta + 360) % 360;
      setAngleWheelRotation(newRotation);
      return; // Ø®Ø±ÙˆØ¬ Ù…Ø¨ÙƒØ±
    }
    
    // 4ï¸âƒ£ Ø³Ø­Ø¨ Ø§Ù„Ø£Ø´ÙƒØ§Ù„ Ø§Ù„Ø£Ø®Ø±Ù‰
    if (isDraggingSquare) {
      const currentAngle = getAngleDeg(x, y);
      let delta = currentAngle - dragStartAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      setSquareRotation((initialRotation + delta + 360) % 360);
      return;
    }
    
    if (isDraggingStar4) {
      const currentAngle = getAngleDeg(x, y);
      let delta = currentAngle - dragStartAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      setStar4Rotation((initialRotation + delta + 360) % 360);
      return;
    }
    
    if (isDraggingPentagon) {
      const currentAngle = getAngleDeg(x, y);
      let delta = currentAngle - dragStartAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      setPentagonRotation((initialRotation + delta + 360) % 360);
      return;
    }
    
    if (isDraggingStar5) {
      const currentAngle = getAngleDeg(x, y);
      let delta = currentAngle - dragStartAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      setStar5Rotation((initialRotation + delta + 360) % 360);
      return;
    }
    
    // **Ø£ÙˆÙ„ÙˆÙŠØ© Ù…ØªÙˆØ³Ø·Ø©: Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ hover ÙˆØ§Ù„Ù…Ø¤Ø´Ø±**
    
    // Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ù…Ø¤Ø´Ø± Ø§ÙØªØ±Ø§Ø¶ÙŠØ§Ù‹
    canvas.style.cursor = "default";
    setHoveredPointIndex(null);
    
    // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ù…Ø­Ø¯Ø¯ Ù„Ù„Ù…Ø¤Ø´Ø±
    if (selectedShape === "triangle") {
      const r = degreeRingRadius; // Ù†ÙØ³ Ø§Ù„Ù…Ø³Ø§ÙØ© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…Ø© ÙÙŠ Ø§Ù„Ø±Ø³Ù…
      const trianglePoints = customAngles.map((deg) => {
        const rad = ((deg + triangleRotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      trianglePoints.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 15) { // Ù…Ù†Ø·Ù‚Ø© Ø£ÙˆØ³Ø¹ Ù„Ù„Ù…Ø¤Ø´Ø±
          setHoveredPointIndex(idx);
          canvas.style.cursor = "move";
        }
      });
    }
    
    else if (selectedShape === "star3") {
      const r = degreeRingRadius; // **ØªØµØ­ÙŠØ­: Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù†ÙØ³ Ø§Ù„Ù…Ø³Ø§ÙØ© Ù„Ù„Ù…Ø«Ù„Ø«**
      
      // Ø­Ø³Ø§Ø¨ Ø§Ù„Ù†Ù‚Ø§Ø· Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ Ù†Ù…Ø· Ø§Ù„Ø±Ø³Ù…
      const star3Points = [];
      
      if (star3DrawMode === "lines") {
        // Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ©
        for (let i = 0; i < 3; i++) {
          const angle = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
          star3Points.push({
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
          });
        }
        
        // Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©
        for (let i = 0; i < 3; i++) {
          const angle1 = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
          const angle2 = ((customStar3Angles[(i + 1) % 3]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
          
          let midAngle = (angle1 + angle2) / 2;
          if (Math.abs(angle2 - angle1) > Math.PI) {
            midAngle += Math.PI;
          }
          
          star3Points.push({
            x: center + (r * 0.3) * Math.cos(midAngle),
            y: center + (r * 0.3) * Math.sin(midAngle),
          });
        }
      } else {
        // Ù„Ù„Ù…Ø«Ù„Ø« - 3 Ù†Ù‚Ø§Ø· ÙÙ‚Ø·
        customStar3Angles.forEach((deg) => {
          const rad = ((deg + star3Rotation + settings.rotation - 90) * Math.PI) / 180;
          star3Points.push({
            x: center + r * Math.cos(rad),
            y: center + r * Math.sin(rad),
          });
        });
      }

      star3Points.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 15) {
          setHoveredPointIndex(idx);
          canvas.style.cursor = "move";
        }
      });
    }
    
    // **ØªØ­Ù‚Ù‚ Ù…Ù† Ø¹Ø¬Ù„Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ø£Ø®ÙŠØ±Ø§Ù‹ (Ø¨ØºØ¶ Ø§Ù„Ù†Ø¸Ø± Ø¹Ù† Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ù…Ø­Ø¯Ø¯)**
    if (showAngleWheel) {
      const distanceFromCenter = getDistance(x, y, center, center);
      if (distanceFromCenter >= angleWheelInnerRadius && distanceFromCenter <= angleWheelOuterRadius) {
        canvas.style.cursor = "grab"; // ÙŠØªÙÙˆÙ‚ Ø¹Ù„Ù‰ Ù…Ø¤Ø´Ø± Ø§Ù„Ø£Ø´ÙƒØ§Ù„
      }
    }
    
    
    //   ØªØ­Ø¯ÙŠØ« Ù…Ø¤Ø´Ø± Ø§Ù„Ù…Ø±Ø¨Ø¹ ÙˆØªÙ†ÙÙŠØ° Ø§Ù„Ø³Ø­Ø¨
    if (selectedShape === "square") {
      const r = degreeRingRadius;
      const squarePoints = customSquareAngles.map((deg) => {
        const rad = ((deg + squareRotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      let found = false;
      squarePoints.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 25) { // Ø²ÙŠØ§Ø¯Ø© Ù…Ù†Ø·Ù‚Ø© Ø§Ù„ÙƒØ´Ù Ù…Ù† 10 Ø¥Ù„Ù‰ 25 Ù„ØªØªÙ…Ø§Ø´Ù‰ Ù…Ø¹ onMouseDown
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingSquare) {
        console.log("ðŸŸ¦ SQUARE: Currently dragging, updating rotation");
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        const newRotation = (initialRotation + delta + 360) % 360;
        console.log(`ðŸŸ¦ SQUARE rotation: ${squareRotation.toFixed(1)}Â° -> ${newRotation.toFixed(1)}Â°`);
        setSquareRotation(newRotation);
      }
    }
    
    // Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø±Ø¨Ø§Ø¹ÙŠØ©
    else if (selectedShape === "star4") {
      const r = degreeRingRadius;
      // Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø£Ø±Ø¨Ø¹Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© Ù„Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø±Ø¨Ø§Ø¹ÙŠØ©
      const star4Points = [0, 90, 180, 270].map((deg) => {
        const rad = ((deg + star4Rotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      let found = false;
      star4Points.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 10) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingStar4) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setStar4Rotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ø®Ù…Ø§Ø³ÙŠ
    else if (selectedShape === "pentagon") {
      const r = degreeRingRadius;
      const pentagonPoints = customPentagonAngles.map((deg) => {
        const rad = ((deg + pentagonRotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      let found = false;
      pentagonPoints.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 10) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingPentagon) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setPentagonRotation((initialRotation + delta + 360) % 360);
      }
      
      if (isDraggingStar3) {
        console.log("Star3 is being dragged");
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        const newRotation = (initialRotation + delta + 360) % 360;
        console.log(`Star3 rotation: ${star3Rotation.toFixed(1)}Â° -> ${newRotation.toFixed(1)}Â°`);
        setStar3Rotation(newRotation);
      }
    }
    
    // Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù„Ø§Ø«ÙŠØ©
    else if (selectedShape === "star3") {
      const r = degreeRingRadius; // **ØªØµØ­ÙŠØ­: Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù†ÙØ³ Ø§Ù„Ù…Ø³Ø§ÙØ© Ù„Ù„Ù…Ø«Ù„Ø«**
      
      // Ø­Ø³Ø§Ø¨ Ø§Ù„Ù†Ù‚Ø§Ø· Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ Ù†Ù…Ø· Ø§Ù„Ø±Ø³Ù… Ø§Ù„Ø¬Ø¯ÙŠØ¯
      const star3Points = [];
      
      if (star3DrawMode === "lines") {
        // Ù„Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ© - Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© ÙˆØ§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©
        // Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© (Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø©)
        for (let i = 0; i < 3; i++) {
          const angle = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
          star3Points.push({
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
          });
        }
        
        // Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©
        for (let i = 0; i < 3; i++) {
          const angle1 = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
          const angle2 = ((customStar3Angles[(i + 1) % 3]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
          
          let midAngle = (angle1 + angle2) / 2;
          if (Math.abs(angle2 - angle1) > Math.PI) {
            midAngle += Math.PI;
          }
          
          star3Points.push({
            x: center + (r * 0.3) * Math.cos(midAngle),
            y: center + (r * 0.3) * Math.sin(midAngle),
          });
        }
      } else {
        // Ù„Ù„Ù…Ø«Ù„Ø« - 3 Ù†Ù‚Ø§Ø· ÙÙ‚Ø·
        customStar3Angles.forEach((deg) => {
          const rad = ((deg + star3Rotation + settings.rotation - 90) * Math.PI) / 180;
          star3Points.push({
            x: center + r * Math.cos(rad),
            y: center + r * Math.sin(rad),
          });
        });
      }

      let found = false;
      star3Points.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 10) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingStar3) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setStar3Rotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø®Ù…Ø§Ø³ÙŠØ©
    else if (selectedShape === "star5") {
      const r = degreeRingRadius;
      const star5Points = customPentagonAngles.map((deg) => {
        const rad = ((deg + star5Rotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      let found = false;
      star5Points.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 10) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move"; // ØªØºÙŠÙŠØ± Ù…Ø¤Ø´Ø± Ø§Ù„Ù…Ø§ÙˆØ³
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default"; // Ø¥Ø¹Ø§Ø¯Ø© Ù…Ø¤Ø´Ø± Ø§Ù„Ù…Ø§ÙˆØ³ Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠ
      }

      if (isDraggingStar5) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setStar5Rotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠ
    else if (selectedShape === "hexagon") {
      const r = degreeRingRadius;
      const hexagonPoints = customHexagonAngles.map((deg) => {
        const rad = ((deg + hexagonRotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      let found = false;
      hexagonPoints.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 10) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingHexagon) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setHexagonRotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠØ©
    else if (selectedShape === "star6") {
      const r = degreeRingRadius;
      // Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø³ØªØ© Ù„Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠØ© Ø¨Ø§Ù„ØªØ±ØªÙŠØ¨: 0Â°ØŒ 60Â°ØŒ 120Â°ØŒ 180Â°ØŒ 240Â°ØŒ 300Â°
      const star6Points = [0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = ((deg + star6Rotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      let found = false;
      star6Points.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 10) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingStar6) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setStar6Rotation((initialRotation + delta + 360) % 360);
      }
    }

    // Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¨Ø§Ø¹ÙŠØ©
    else if (selectedShape === "star7") {
      const r = degreeRingRadius;
      const star7Points = [];
      for (let i = 0; i < 7; i++) {
        const angle = ((i * 360 / 7) + star7Rotation + settings.rotation - 90) * Math.PI / 180;
        star7Points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      let found = false;
      star7Points.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 15) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingStar7) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setStar7Rotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù…Ø§Ù†ÙŠØ©
    else if (selectedShape === "star8") {
      const r = degreeRingRadius;
      const star8Points = [];
      for (let i = 0; i < 8; i++) {
        const angle = ((i * 45) + star8Rotation + settings.rotation - 90) * Math.PI / 180;
        star8Points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      let found = false;
      star8Points.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 20) { // Ø²ÙŠØ§Ø¯Ø© Ù…Ù†Ø·Ù‚Ø© Ø§Ù„ÙƒØ´Ù Ù…Ù† 15 Ø¥Ù„Ù‰ 20
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingStar8) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setStar8Rotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„ØªØ³Ø§Ø¹ÙŠØ©
    else if (selectedShape === "star9") {
      const r = degreeRingRadius;
      const star9Points = [];
      for (let i = 0; i < 9; i++) {
        const angle = ((i * 360 / 9) + star9Rotation + settings.rotation - 90) * Math.PI / 180;
        star9Points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      let found = false;
      star9Points.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 20) { // Ø²ÙŠØ§Ø¯Ø© Ù…Ù†Ø·Ù‚Ø© Ø§Ù„ÙƒØ´Ù Ù…Ù† 15 Ø¥Ù„Ù‰ 20
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingStar9) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setStar9Rotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø¹Ø§Ø´Ø±ÙŠØ©
    else if (selectedShape === "star10") {
      const r = degreeRingRadius;
      const star10Points = [];
      for (let i = 0; i < 10; i++) {
        const angle = ((i * 360 / 10) + star10Rotation + settings.rotation - 90) * Math.PI / 180;
        star10Points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      let found = false;
      star10Points.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 20) { // Ø²ÙŠØ§Ø¯Ø© Ù…Ù†Ø·Ù‚Ø© Ø§Ù„ÙƒØ´Ù Ù…Ù† 15 Ø¥Ù„Ù‰ 20
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingStar10) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setStar10Rotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø­Ø§Ø¯ÙŠØ© Ø¹Ø´Ø±Ø©
    else if (selectedShape === "star11") {
      const r = degreeRingRadius;
      const star11Points = [];
      for (let i = 0; i < 11; i++) {
        const angle = ((i * 360 / 11) + star11Rotation + settings.rotation - 90) * Math.PI / 180;
        star11Points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      let found = false;
      star11Points.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 20) { // Ø²ÙŠØ§Ø¯Ø© Ù…Ù†Ø·Ù‚Ø© Ø§Ù„ÙƒØ´Ù Ù…Ù† 15 Ø¥Ù„Ù‰ 20
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingStar11) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setStar11Rotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ© Ø¹Ø´Ø±Ø©
    else if (selectedShape === "star12") {
      const r = degreeRingRadius;
      const star12Points = [];
      for (let i = 0; i < 12; i++) {
        const angle = ((i * 360 / 12) + star12Rotation + settings.rotation - 90) * Math.PI / 180;
        star12Points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      let found = false;
      star12Points.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 20) { // Ø²ÙŠØ§Ø¯Ø© Ù…Ù†Ø·Ù‚Ø© Ø§Ù„ÙƒØ´Ù Ù…Ù† 15 Ø¥Ù„Ù‰ 20
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingStar12) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setStar12Rotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø³Ø¨Ø§Ø¹ÙŠ
    else if (selectedShape === "heptagon") {
      const r = degreeRingRadius;
      const heptagonPoints = [];
      for (let i = 0; i < 7; i++) {
        const angle = ((i * 360 / 7) + heptagonRotation + settings.rotation - 90) * Math.PI / 180;
        heptagonPoints.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      let found = false;
      heptagonPoints.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 15) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingHeptagon) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setHeptagonRotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø«Ù…Ø§Ù†ÙŠ
    else if (selectedShape === "octagon") {
      const r = degreeRingRadius;
      const octagonPoints = customOctagonAngles.map((deg) => {
        const rad = ((deg + octagonRotation + settings.rotation - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad),
        };
      });

      let found = false;
      octagonPoints.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 15) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingOctagon) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setOctagonRotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„ØªØ³Ø§Ø¹ÙŠ
    else if (selectedShape === "nonagon") {
      const r = degreeRingRadius;
      const nonagonPoints = [];
      for (let i = 0; i < 9; i++) {
        const angle = ((i * 360 / 9) + nonagonRotation + settings.rotation - 90) * Math.PI / 180;
        nonagonPoints.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      let found = false;
      nonagonPoints.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 15) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingNonagon) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setNonagonRotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø¹Ø§Ø´Ø±
    else if (selectedShape === "decagon") {
      const r = degreeRingRadius;
      const decagonPoints = [];
      for (let i = 0; i < 10; i++) {
        const angle = ((i * 360 / 10) + decagonRotation + settings.rotation - 90) * Math.PI / 180;
        decagonPoints.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      let found = false;
      decagonPoints.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 15) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingDecagon) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setDecagonRotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø­Ø§Ø¯ÙŠ Ø¹Ø´Ø±
    else if (selectedShape === "eleven") {
      const r = degreeRingRadius;
      const hendecagonPoints = [];
      for (let i = 0; i < 11; i++) {
        const angle = ((i * 360 / 11) + hendecagonRotation + settings.rotation - 90) * Math.PI / 180;
        hendecagonPoints.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      let found = false;
      hendecagonPoints.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 15) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingHendecagon) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setHendecagonRotation((initialRotation + delta + 360) % 360);
      }
    }
    
    // Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø«Ø§Ù†ÙŠ Ø¹Ø´Ø±
    else if (selectedShape === "twelve") {
      const r = degreeRingRadius;
      const dodecagonPoints = [];
      for (let i = 0; i < 12; i++) {
        const angle = ((i * 360 / 12) + dodecagonRotation + settings.rotation - 90) * Math.PI / 180;
        dodecagonPoints.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        });
      }

      let found = false;
      dodecagonPoints.forEach((point, idx) => {
        const d = getDistance(x, y, point.x, point.y);
        if (d < 15) {
          setHoveredPointIndex(idx);
          found = true;
          canvas.style.cursor = "move";
        }
      });
      if (!found) {
        setHoveredPointIndex(null);
        canvas.style.cursor = "default";
      }

      if (isDraggingDodecagon) {
        const currentAngle = getAngleDeg(x, y);
        const delta = currentAngle - dragStartAngle;
        setDodecagonRotation((initialRotation + delta + 360) % 360);
      }
    }
  }

  function onMouseUp() {
    console.log("Mouse up - ending all drags");
    
    // ØªØ­Ø¯ÙŠØ¯ Ù…Ø§ Ø¥Ø°Ø§ ÙƒØ§Ù† Ø£ÙŠ Ø´ÙƒÙ„ ÙÙŠ Ø­Ø§Ù„Ø© Ø³Ø­Ø¨
    const wasDragging = isDraggingTriangle || isDraggingSquare || isDraggingStar4 || isDraggingPentagon || 
                       isDraggingStar3 || isDraggingStar5 || isDraggingHexagon || isDraggingStar6 || 
                       isDraggingHeptagon || isDraggingStar7 || isDraggingOctagon || isDraggingStar8 || 
                       isDraggingNonagon || isDraggingStar9 || isDraggingDecagon || isDraggingStar10 || 
                       isDraggingHendecagon || isDraggingStar11 || isDraggingDodecagon || isDraggingStar12 || 
                       isDraggingAngleWheel;
    
    if (wasDragging) {
      console.log("ðŸš« Setting recentlyDragged flag to prevent cell clicks");
      setRecentlyDragged(true);
      // Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ø¹Ù„Ø§Ù…Ø© Ø¨Ø¹Ø¯ ÙØªØ±Ø© Ù‚ØµÙŠØ±Ø©
      setTimeout(() => {
        setRecentlyDragged(false);
        console.log("âœ… recentlyDragged flag cleared");
      }, 50); // 50ms ÙƒØ§ÙÙŠØ© Ù„Ù…Ù†Ø¹ click event
    }
    
    if (isDraggingStar3) {
      console.log("Star3 drag ended");
    }
    setIsDraggingTriangle(false);
    setIsDraggingAngleWheel(false);
    setIsDraggingStar3(false);
    setIsDraggingStar5(false);
    setIsDraggingSquare(false);
    setIsDraggingStar4(false);
    setIsDraggingPentagon(false);
    setIsDraggingHexagon(false);
    setIsDraggingStar6(false);
    setIsDraggingHeptagon(false);
    setIsDraggingStar7(false);
    setIsDraggingOctagon(false);
    setIsDraggingStar8(false);
    setIsDraggingNonagon(false);
    setIsDraggingStar9(false);
    setIsDraggingDecagon(false);
    setIsDraggingStar10(false);
    setIsDraggingHendecagon(false);
    setIsDraggingStar11(false);
    setIsDraggingDodecagon(false);
    setIsDraggingStar12(false);
  }

  // ØªØ³Ø¬ÙŠÙ„ Ù…Ø³ØªÙ…Ø¹Ø§Øª Ø§Ù„Ø£Ø­Ø¯Ø§Ø« Ù„Ù„ØªØ¯ÙˆÙŠØ±
  canvas.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  // ØªÙ†Ø¸ÙŠÙ Ù…Ø³ØªÙ…Ø¹Ø§Øª Ø§Ù„Ø£Ø­Ø¯Ø§Ø«
  return () => {
    canvas.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };
}, [
  selectedShape,
  triangleRotation,
  customAngles,
  settings,
  isDraggingTriangle,
  isDraggingAngleWheel,
  isDraggingStar3,
  isDraggingStar5,
  isDraggingSquare,
  isDraggingStar4,
  isDraggingPentagon,
  isDraggingHexagon,
  isDraggingStar6,
  isDraggingHeptagon,
  isDraggingStar7,
  isDraggingOctagon,
  isDraggingStar8,
  isDraggingNonagon,
  isDraggingStar9,
  isDraggingDecagon,
  isDraggingStar10,
  isDraggingHendecagon,
  isDraggingStar11,
  isDraggingDodecagon,
  isDraggingStar12,
  dragStartAngle,
  initialRotation,
  scale,
  star4Rotation,
  star3Rotation,
  star5Rotation,
  squareRotation,
  star3Rotation,
  pentagonRotation,
  hexagonRotation,
  star6Rotation,
  heptagonRotation,
  star7Rotation,
  octagonRotation,
  star8Rotation,
  nonagonRotation,
  star9Rotation,
  decagonRotation,
  star10Rotation,
  hendecagonRotation,
  star11Rotation,
  dodecagonRotation,
  star12Rotation,
  showSquareAngles,
  showStar3Angles,
  showStar4Angles,
  showPentagonAngles,
  showStar5Angles,
  showHexagonAngles,
  showStar6Angles,
  showHeptagonAngles,
  showStar7Angles,
  showOctagonAngles,
  showStar8Angles,
  showNonagonAngles,
  showStar9Angles,
  showDecagonAngles,
  showStar10Angles,
  showHendecagonAngles,
  showStar11Angles,
  showDodecagonAngles,
  showStar12Angles,
  customStar3Angles,
  star3DrawMode,
  highlightStar3,
  angleWheelRotation,
  showAngleWheel,
  angleStepRad,
]);

  // ØªØµØ¯ÙŠØ± ÙƒØµÙˆØ±Ø© PNG
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext("2d");
    ctx.drawImage(canvas, 0, 0);
    const pngUrl = exportCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "gann-circle.png";
    link.href = pngUrl;
    link.click();
  };

  // ØªØµØ¯ÙŠØ± ÙƒÙ…Ù„Ù PDF
  const handleExportPDF = async () => {
    const canvas = canvasRef.current;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext("2d");
    ctx.drawImage(canvas, 0, 0);
    const imgData = exportCanvas.toDataURL("image/png");
    const jsPDF = await import("jspdf");
    const pdf = new jsPDF.jsPDF("landscape", "pt", [
      exportCanvas.width,
      exportCanvas.height,
    ]);
    pdf.addImage(imgData, "PNG", 0, 0, exportCanvas.width, exportCanvas.height);
    pdf.save("gann-circle.pdf");
  };

  // Ø±Ø³Ù… Ø¹Ø¬Ù„Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§ (Ù…Ù‚Ø³Ù…Ø© Ø¥Ù„Ù‰ Ø®Ù„Ø§ÙŠØ§ Ù…Ø«Ù„ Ø­Ù„Ù‚Ø© Ø§Ù„Ø£Ø¨Ø±Ø§Ø¬)
  function drawAngleWheel(ctx, center) {
    const innerRadius = angleWheelInnerRadius;
    const outerRadius = angleWheelOuterRadius;
    
    // Ø­Ø³Ø§Ø¨ Ø®Ø·ÙˆØ© Ø§Ù„Ø²Ø§ÙˆÙŠØ© Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ angleStepRad
    const stepDegrees = angleStepRad;
    const totalCells = 360 / stepDegrees;
    
    // Ø±Ø³Ù… Ø§Ù„Ø®Ù„ÙÙŠØ© ÙƒØ­Ù„Ù‚Ø© ÙˆØ§Ø­Ø¯Ø© Ù…ØªØµÙ„Ø©
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, outerRadius, 0, 2 * Math.PI);
    ctx.arc(center, center, innerRadius, 0, 2 * Math.PI, true);
    ctx.closePath();
    
    // Ø®Ù„ÙÙŠØ© Ø¨Ù„ÙˆÙ† Ù…Ù…ÙŠØ² Ù„Ø¹Ø¬Ù„Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§
    ctx.fillStyle = "#f5f5dc"; // Ù„ÙˆÙ† Ø¨ÙŠØ¬ ÙØ§ØªØ­
    ctx.fill();
    
    // Ø­Ø¯ÙˆØ¯ Ø®Ø§Ø±Ø¬ÙŠØ© ÙˆØ¯Ø§Ø®Ù„ÙŠØ© Ù…Ø­Ø³Ù†Ø©
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 2.5; // Ø­Ø¯ÙˆØ¯ Ø£Ø³Ù…Ùƒ
    ctx.stroke();
    ctx.restore();
    
    // Ø¥Ø¶Ø§ÙØ© Ø®Ø·ÙˆØ· ØªÙ‚Ø³ÙŠÙ… Ø¨ÙŠÙ† Ø§Ù„Ø®Ù„Ø§ÙŠØ§
    for (let i = 0; i < totalCells; i++) {
      const angleDeg = -90 + angleWheelRotation + i * stepDegrees;
      const angleRad = (angleDeg * Math.PI) / 180;
      
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(
        center + innerRadius * Math.cos(angleRad),
        center + innerRadius * Math.sin(angleRad)
      );
      ctx.lineTo(
        center + outerRadius * Math.cos(angleRad),
        center + outerRadius * Math.sin(angleRad)
      );
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 1.5; // Ø®Ø·ÙˆØ· ØªÙ‚Ø³ÙŠÙ… Ø£Ø³Ù…Ùƒ
      ctx.stroke();
      ctx.restore();
    }
    
    // Ø¥Ø¶Ø§ÙØ© Ø£Ø±Ù‚Ø§Ù… Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ø¥Ø°Ø§ ÙƒØ§Ù† Ù…ÙØ¹Ù„Ø§Ù‹
    if (showAngleWheelAngles) {
      const totalAngles = 360 / angleStepRad;
      for (let i = 0; i < totalAngles; i++) {
        const angleDeg = -90 + angleWheelRotation + i * angleStepRad;
        const degreeValue = (i * angleStepRad) % 360; // Ø§Ù„Ø²Ø§ÙˆÙŠØ© Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ©
        
        const angleRad = (angleDeg * Math.PI) / 180;
        const textRadius = (innerRadius + outerRadius) / 2;
        const x = center + textRadius * Math.cos(angleRad);
        const y = center + textRadius * Math.sin(angleRad);
        
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 14px Tahoma"; // Ø­Ø¬Ù… Ù†Øµ Ø£ÙƒØ¨Ø±
        ctx.fillStyle = "#000";
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5; // Ø­Ø¯ÙˆØ¯ Ù†Øµ Ø£Ø³Ù…Ùƒ
        ctx.strokeText(degreeValue + "Â°", x, y);
        ctx.fillText(degreeValue + "Â°", x, y);
        ctx.restore();
      }
    }
  }

  // Ø¯Ø§Ù„Ø© Ø±Ø³Ù… Ø®Ø·ÙˆØ· Ø§Ù„Ø£Ø´Ø¹Ø© (Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠØ©) Ù…Ù† Ø§Ù„Ù…Ø±ÙƒØ² Ø¥Ù„Ù‰ Ø¹Ø¬Ù„Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§
  function drawAngleWheelRays(ctx, center) {
    if (!showAngleWheel) return;
    
    const stepDegrees = angleStepRad;
    const totalCells = 360 / stepDegrees;
    
    // Ø±Ø³Ù… Ø®Ø·ÙˆØ· Ø§Ù„Ø£Ø´Ø¹Ø© Ù…Ù† Ø§Ù„Ù…Ø±ÙƒØ² Ø¥Ù„Ù‰ Ø­Ø§ÙØ© Ø¹Ø¬Ù„Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§
    const innerRadius = 0; // Ù…Ù† Ø§Ù„Ù…Ø±ÙƒØ² Ù…Ø¨Ø§Ø´Ø±Ø©
    const outerRadius = angleWheelOuterRadius; // Ø¥Ù„Ù‰ Ø­Ø§ÙØ© Ø¹Ø¬Ù„Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§
    
    for (let i = 0; i < totalCells; i++) {
      // Ø­Ø³Ø§Ø¨ Ø§Ù„Ø´Ø¹Ø§Ø¹: Ø§Ù„Ø´Ø¹Ø§Ø¹ Ø§Ù„Ø£ÙˆÙ„ (i=0) Ù…Ù† Ø§Ù„Ø³Ø§Ø¹Ø© 12
      const rayDegree = -90 + angleWheelRotation + i * stepDegrees;
      const rayAngle = (rayDegree * Math.PI) / 180;
      
      ctx.save();
      ctx.beginPath();
      // Ø§Ù„Ø®Ø· Ù…Ù† Ø§Ù„Ù…Ø±ÙƒØ² Ù…Ø¨Ø§Ø´Ø±Ø© Ø¥Ù„Ù‰ Ø­Ø§ÙØ© Ø¹Ø¬Ù„Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§
      ctx.moveTo(center, center);
      ctx.lineTo(
        center + outerRadius * Math.cos(rayAngle),
        center + outerRadius * Math.sin(rayAngle)
      );
      ctx.strokeStyle = rayColor;
      ctx.lineWidth = rayWidth;
      ctx.globalAlpha = 0.9; // ÙˆØ§Ø¶Ø­ Ø£ÙƒØ«Ø±
      ctx.stroke();
      ctx.restore();
    }
  }

  
  // Ø¯Ø§Ù„Ø© Ø±Ø³Ù… Ø­Ù„Ù‚Ø© Ø§Ù„Ø£Ø¨Ø±Ø§Ø¬ (Ù…Ù†ØªØµÙ ÙƒÙ„ Ø¨Ø±Ø¬ Ø¹Ù†Ø¯ Ø²Ø§ÙˆÙŠØ© Ø§Ù„Ù‚Ø·Ø§Ø¹ Ø§Ù„ØµØ­ÙŠØ­)
  function drawZodiacRing(ctx, center) {
    const radiusInner = zodiacInnerRadius;
    const radiusOuter = zodiacOuterRadius;
    const angleStep = 10;
    
    // Ø±Ø³Ù… Ø§Ù„Ø®Ù„Ø§ÙŠØ§
    for (let i = 0; i < 36; i++) {
      // Ø¨Ø±Ø¬ Ø§Ù„Ø­Ù…Ù„ ÙŠØ¬Ø¨ Ø£Ù† ÙŠÙƒÙˆÙ† Ø¹Ù†Ø¯ Ø§Ù„Ø²Ø§ÙˆÙŠØ© 10Â° (Ù„ÙŠØ³ 40Â°)
      // Ù†Ø·Ø±Ø­ 30Â° Ù…Ù† Ø§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„Ø³Ø§Ø¨Ù‚ Ù„Ø¥ØµÙ„Ø§Ø­ Ø§Ù„Ø¥Ø²Ø§Ø­Ø©
      const centerAngleDeg = -90 - 20 + i * angleStep; // ØªØ¹Ø¯ÙŠÙ„ Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø§Ù„Ù…ÙˆØ¶Ø¹ Ø§Ù„ØµØ­ÙŠØ­
      const cellStartDegree = centerAngleDeg - angleStep/2; // Ø¨Ø¯Ø§ÙŠØ© Ø§Ù„Ø®Ù„ÙŠØ©
      const cellEndDegree = centerAngleDeg + angleStep/2; // Ù†Ù‡Ø§ÙŠØ© Ø§Ù„Ø®Ù„ÙŠØ©
      const startAngle = (cellStartDegree * Math.PI) / 180;
      const endAngle = (cellEndDegree * Math.PI) / 180;
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radiusOuter, startAngle, endAngle);
      ctx.arc(center, center, radiusInner, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = "#eee";
      ctx.fill();
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 2.0; // Ø­Ø¯ÙˆØ¯ Ø£Ø³Ù…Ùƒ Ù„Ù„Ø­Ø¬Ù… Ø§Ù„Ù…ÙƒØ¨Ø±
      ctx.stroke();
      ctx.restore();
    }
    
    // Ø±Ø³Ù… Ø§Ù„Ù†ØµÙˆØµ ÙÙŠ Ù…Ù†ØªØµÙ ÙƒÙ„ Ø®Ù„ÙŠØ© Ø¨Ø´ÙƒÙ„ Ø¯Ø§Ø¦Ø±ÙŠ Ù…Ù†Ø³Ù‚
    for (let i = 0; i < 36; i++) {
      const { label, color } = zodiacRing[i];
      // Ù†ÙØ³ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„ Ù„Ù„Ù†Øµ: Ø¨Ø±Ø¬ Ø§Ù„Ø­Ù…Ù„ Ø¹Ù†Ø¯ Ø§Ù„Ø²Ø§ÙˆÙŠØ© 10Â°
      const textAngleDeg = -90 - 20 + i * angleStep;
      const textAngleRad = (textAngleDeg * Math.PI) / 180;
      const textRadius = (radiusInner + radiusOuter) / 2;
      
      ctx.save();
      // Ø§Ù†ØªÙ‚Ø§Ù„ Ø¥Ù„Ù‰ Ù…Ø±ÙƒØ² Ø§Ù„Ø¯Ø§Ø¦Ø±Ø©
      ctx.translate(center, center);
      // Ø¯ÙˆØ±Ø§Ù† Ù„ØªÙˆØ¬ÙŠÙ‡ Ø§Ù„Ù†Øµ Ù†Ø­Ùˆ Ø§Ù„Ø®Ø§Ø±Ø¬
      ctx.rotate(textAngleRad);
      
      // ØªØ­Ø¯ÙŠØ¯ Ù…Ø§ Ø¥Ø°Ø§ ÙƒØ§Ù† Ù‡Ø°Ø§ Ø¨Ø±Ø¬ Ø§Ù„Ø­Ù…Ù„ (Ø£ÙˆÙ„ Ø¹Ù†ØµØ± ÙÙŠ ÙƒÙ„ Ø¯ÙˆØ±Ø© Ù…Ù† 12)
      const isAries = (i % 12) === 0; // Ø¨Ø±Ø¬ Ø§Ù„Ø­Ù…Ù„ ÙŠØ¸Ù‡Ø± ÙÙŠ Ø§Ù„Ù…ÙˆØ§Ø¶Ø¹ 0, 12, 24
      
      // Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù†Øµ Ø§Ù„Ù…Ø­Ø³Ù†Ø© Ù„Ø­Ù„Ù‚Ø© Ø§Ù„Ø£Ø¨Ø±Ø§Ø¬ - Ø­Ø¬Ù… Ø£ÙƒØ¨Ø± Ù„Ù„Ø­Ù…Ù„
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (isAries) {
        ctx.font = "bold 18px 'Segoe UI', 'Tahoma', Arial, sans-serif"; // Ù†ÙØ³ Ø­Ø¬Ù… Ø­Ù„Ù‚Ø© Ø§Ù„Ø£ÙŠØ§Ù…
      } else {
        ctx.font = "bold 16px 'Segoe UI', 'Tahoma', Arial, sans-serif"; // Ø§Ù„Ø­Ø¬Ù… Ø§Ù„Ø¹Ø§Ø¯ÙŠ Ù„Ù„Ø£Ø¨Ø±Ø§Ø¬ Ø§Ù„Ø£Ø®Ø±Ù‰
      }
      
      // Ø¥Ø¶Ø§ÙØ© Ø¸Ù„ Ù„Ù„Ù†Øµ Ù„ØªØ­Ø³ÙŠÙ† Ø§Ù„ÙˆØ¶ÙˆØ­
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = 1;
      ctx.shadowOffsetX = 0.3;
      ctx.shadowOffsetY = 0.3;
      
      // ØªØ­Ø¯ÙŠØ¯ Ù„ÙˆÙ† Ø¨Ø±Ø¬ Ø§Ù„Ø­Ù…Ù„ Ø­Ø³Ø¨ Ù†Ø¸Ø§Ù… Ø§Ù„Ø£Ù„ÙˆØ§Ù† Ø§Ù„Ù…Ø®ØªØ²Ù„
      let textColor;
      if (isAries) {
        // Ø¨Ø±Ø¬ Ø§Ù„Ø­Ù…Ù„ ÙŠØ£Ø®Ø° Ù†ÙØ³ Ù„ÙˆÙ† Ø­Ù„Ù‚Ø© Ø§Ù„Ø£ÙŠØ§Ù… (Ø§Ù„Ø±Ù‚Ù… Ø§Ù„Ù…Ø®ØªØ²Ù„ 1)
        textColor = getDigitColor(1); // Ù†ÙØ³ Ù†Ø¸Ø§Ù… Ø£Ù„ÙˆØ§Ù† Ø­Ù„Ù‚Ø© Ø§Ù„Ø£ÙŠØ§Ù…
      } else {
        textColor = color; // Ø§Ù„Ø£Ø¨Ø±Ø§Ø¬ Ø§Ù„Ø£Ø®Ø±Ù‰ ØªØ­ØªÙØ¸ Ø¨Ø£Ù„ÙˆØ§Ù†Ù‡Ø§ Ø§Ù„Ø£ØµÙ„ÙŠØ©
      }
      
      ctx.fillStyle = textColor;
      
      if (isAries) {
        // Ø±Ø³Ù… Ø¨Ø±Ø¬ Ø§Ù„Ø­Ù…Ù„ Ø¨Ø³ØªØ§ÙŠÙ„ Ø¨Ø³ÙŠØ· Ø¨Ø¯ÙˆÙ† Ø§Ù„Ø±Ù‚Ù… Ø§Ù„Ù…Ø®ØªØ²Ù„
        ctx.fillText(label, 0, -textRadius); // Ø§Ø³Ù… Ø§Ù„Ø¨Ø±Ø¬ ÙÙ‚Ø·
        
        // Ø­Ø¯ÙˆØ¯ Ø§Ù„Ù†Øµ
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 0.3;
        ctx.strokeText(label, 0, -textRadius);
      } else {
        // Ø±Ø³Ù… Ø§Ù„Ø£Ø¨Ø±Ø§Ø¬ Ø§Ù„Ø£Ø®Ø±Ù‰ Ø¨Ø§Ù„Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„Ø¹Ø§Ø¯ÙŠØ©
        ctx.fillText(label, 0, -textRadius);
        
        // Ø­Ø¯ÙˆØ¯ Ø§Ù„Ù†Øµ Ù„Ù„Ø£Ø¨Ø±Ø§Ø¬ Ø§Ù„Ø£Ø®Ø±Ù‰
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 0.5;
        ctx.strokeText(label, 0, -textRadius);
      }
      
      ctx.restore();
    }
    
  }

  // Ø¯Ø§Ù„Ø© Ø±Ø³Ù… Ø­Ù„Ù‚Ø© Ø£ÙŠØ§Ù… Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹
  function drawWeekDaysRing(ctx, center) {
    const radiusInner = weekDaysInnerRadius;
    const radiusOuter = weekDaysOuterRadius;
    const angleStep = 10; // ÙƒÙ„ 10 Ø¯Ø±Ø¬Ø§Øª
    
    // Ø£Ø³Ù…Ø§Ø¡ Ø£ÙŠØ§Ù… Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ (Ù…Ù† Ø§Ù„Ø£Ø­Ø¯ Ø¥Ù„Ù‰ Ø§Ù„Ø¬Ù…Ø¹Ø© Ø«Ù… ØªÙƒØ±Ø§Ø±)
    const weekDays = ["Ø§Ù„Ø£Ø­Ø¯", "Ø§Ù„Ø§Ø«Ù†ÙŠÙ†", "Ø§Ù„Ø«Ù„Ø§Ø«Ø§Ø¡", "Ø§Ù„Ø£Ø±Ø¨Ø¹Ø§Ø¡", "Ø§Ù„Ø®Ù…ÙŠØ³", "Ø§Ù„Ø¬Ù…Ø¹Ø©"];
    
    // Ø£Ù„ÙˆØ§Ù† Ø§Ù„Ø£Ø±Ù‚Ø§Ù… Ø§Ù„Ù…Ø®ØªØ²Ù„Ø©
    const getReducedColor = (reducedDigit) => {
      if ([1, 4, 7].includes(reducedDigit)) return "red";
      if ([2, 5, 8].includes(reducedDigit)) return "blue";
      if ([3, 6, 9].includes(reducedDigit)) return "black";
      return "#000";
    };
    
    // Ø±Ø³Ù… Ø§Ù„Ø®Ù„Ø§ÙŠØ§
    for (let i = 0; i < 36; i++) {
      // Ù†ÙØ³ Ù…Ù†Ø·Ù‚ Ø­Ù„Ù‚Ø© Ø§Ù„Ø£Ø¨Ø±Ø§Ø¬: Ø§Ù„Ø£Ø­Ø¯ ÙŠØ¨Ø¯Ø£ Ù…Ù† 10 Ø¯Ø±Ø¬Ø©
      const centerAngleDeg = -90 - 20 + i * angleStep; // ØªØ·Ø¨ÙŠÙ‚ Ù†ÙØ³ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø­Ù„Ù‚Ø© Ø§Ù„Ø£Ø¨Ø±Ø§Ø¬
      const cellStartDegree = centerAngleDeg - angleStep/2;
      const cellEndDegree = centerAngleDeg + angleStep/2;
      const startAngle = (cellStartDegree * Math.PI) / 180;
      const endAngle = (cellEndDegree * Math.PI) / 180;
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radiusOuter, startAngle, endAngle);
      ctx.arc(center, center, radiusInner, endAngle, startAngle, true);
      ctx.closePath();
      
      // Ø®Ù„ÙÙŠØ© Ø§Ù„Ø®Ù„ÙŠØ© Ù…Ø¹ Ø­Ø¯ÙˆØ¯ Ø£ÙƒØ«Ø± ÙˆØ¶ÙˆØ­Ø§Ù‹
      ctx.fillStyle = "#f9f9f9";
      ctx.fill();
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 2.0; // Ø²ÙŠØ§Ø¯Ø© Ø³ÙÙ…Ùƒ Ø§Ù„Ø­Ø¯ÙˆØ¯ Ø¥Ù„Ù‰ 2.0px
      ctx.stroke();
      ctx.restore();
    }
    
    // Ø±Ø³Ù… Ø§Ù„Ù†ØµÙˆØµ ÙÙŠ Ù…Ù†ØªØµÙ ÙƒÙ„ Ø®Ù„ÙŠØ©
    for (let i = 0; i < 36; i++) {
      // Ù†ÙØ³ Ù…Ù†Ø·Ù‚ Ø­Ù„Ù‚Ø© Ø§Ù„Ø£Ø¨Ø±Ø§Ø¬ Ù„Ù„Ù†Øµ
      const textAngleDeg = -90 - 20 + i * angleStep;
      const textAngleRad = (textAngleDeg * Math.PI) / 180;
      const textRadius = (radiusInner + radiusOuter) / 2;
      
      // Ø­Ø³Ø§Ø¨ Ø§Ù„Ø±Ù‚Ù… Ø§Ù„Ù…Ø®ØªØ²Ù„ (1-9 Ù…ØªÙƒØ±Ø±)
      const reducedDigit = (i % 9) + 1;
      
      // Ø­Ø³Ø§Ø¨ ÙŠÙˆÙ… Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ Ø­Ø³Ø¨ Ø§Ù„Ø¬Ø¯ÙˆÙ„Ø© Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø©
      // Ø§Ù„Ø£Ø­Ø¯=0, Ø§Ù„Ø§Ø«Ù†ÙŠÙ†=1, Ø§Ù„Ø«Ù„Ø§Ø«Ø§Ø¡=2, Ø§Ù„Ø£Ø±Ø¨Ø¹Ø§Ø¡=3, Ø§Ù„Ø®Ù…ÙŠØ³=4, Ø§Ù„Ø¬Ù…Ø¹Ø©=5, Ø«Ù… ØªÙƒØ±Ø§Ø±
      const dayIndex = (i % 6); // 6 Ø£ÙŠØ§Ù… ÙÙ‚Ø· (Ù…Ù† Ø§Ù„Ø£Ø­Ø¯ Ø¥Ù„Ù‰ Ø§Ù„Ø¬Ù…Ø¹Ø©)
      
      const dayName = weekDays[dayIndex];
      
      ctx.save();
      // Ø§Ù†ØªÙ‚Ø§Ù„ Ø¥Ù„Ù‰ Ù…Ø±ÙƒØ² Ø§Ù„Ø¯Ø§Ø¦Ø±Ø©
      ctx.translate(center, center);
      // Ø¯ÙˆØ±Ø§Ù† Ù„ØªÙˆØ¬ÙŠÙ‡ Ø§Ù„Ù†Øµ Ù†Ø­Ùˆ Ø§Ù„Ø®Ø§Ø±Ø¬
      ctx.rotate(textAngleRad);
      
      // Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù†Øµ Ø§Ù„Ù…Ø­Ø³Ù†Ø© Ù„Ø­Ù„Ù‚Ø© Ø£ÙŠØ§Ù… Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ - Ø­Ø¬Ù… Ø£ÙƒØ¨Ø±
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 18px 'Segoe UI', 'Tahoma', Arial, sans-serif"; // Ø²ÙŠØ§Ø¯Ø© Ø­Ø¬Ù… Ø§Ù„Ø®Ø· Ø¥Ù„Ù‰ 18px
      
      // Ø¥Ø¶Ø§ÙØ© Ø¸Ù„ Ù„Ù„Ù†Øµ
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = 1;
      ctx.shadowOffsetX = 0.3;
      ctx.shadowOffsetY = 0.3;
      
      // Ø±Ø³Ù… Ø§Ø³Ù… Ø§Ù„ÙŠÙˆÙ… ÙÙ‚Ø· Ø¨Ø¯ÙˆÙ† Ø§Ù„Ø±Ù‚Ù… Ø§Ù„Ù…Ø®ØªØ²Ù„
      ctx.fillStyle = getReducedColor(reducedDigit);
      ctx.fillText(dayName, 0, -textRadius);
      
      // Ø±Ø³Ù… Ø­Ø¯ÙˆØ¯ Ø§Ù„Ù†Øµ
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 0.3;
      ctx.strokeText(dayName, 0, -textRadius);
      
      ctx.restore();
    }
  }
  
  //  event listeners Ù„ØªØ¯ÙˆÙŠØ± Ø±Ø§Ø³ Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ø§Ø´ÙƒØ§Ù„ Ù…Ø«Ù„ Ø§Ù„Ù…Ø«Ù„Ø«

  useEffect(() => {
    console.log("useEffect triggered. selectedShape:", selectedShape);
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    
    // ØªØ£ÙƒØ¯ Ù…Ù† Ø£Ù† Canvas Ù…Ø±Ø¨Ø¹ (Ù†ÙØ³ Ø§Ù„Ø¹Ø±Ø¶ ÙˆØ§Ù„Ø§Ø±ØªÙØ§Ø¹)
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;

    const ctx = canvas.getContext("2d");
    
    // Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† Ø§Ù„ØªØ­ÙˆÙŠÙ„ ÙˆØªØ·Ø¨ÙŠÙ‚ Uniform Scaling - Ù…Ø±ÙƒØ² Ø«Ø§Ø¨Øª
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù†ÙØ³ Ø§Ù„Ù‚ÙŠÙ…Ø© Ù„Ù„Ø¹Ø±Ø¶ ÙˆØ§Ù„Ø§Ø±ØªÙØ§Ø¹ Ù„Ù„Ø­ÙØ§Ø¸ Ø¹Ù„Ù‰ Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø¯Ø§Ø¦Ø±ÙŠ
    const uniformScale = dpr * scale;
    ctx.scale(uniformScale, uniformScale);

    // Ù…Ø±ÙƒØ² Ø§Ù„Ø¯Ø§Ø¦Ø±Ø© Ø«Ø§Ø¨Øª Ø¯Ø§Ø¦Ù…Ø§Ù‹ ÙÙŠ Ù…Ù†ØªØµÙ Ø§Ù„ÙƒØ§Ù†ÙØ§Ø³ - Ù„Ø§ ÙŠØªØ£Ø«Ø± Ø¨Ø§Ù„Ø³Ø­Ø¨
    const center = canvasSize / 2;
    settings.rotation = 0;

    // Ù…Ù„Ø§Ø­Ø¸Ø©: Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª ØªØ³ØªØ®Ø¯Ù… center ÙƒÙ†Ù‚Ø·Ø© Ø«Ø§Ø¨ØªØ© Ù„Ù„Ù…Ø±Ø¬Ø¹
    // Ù„Ø§ ØªÙˆØ¬Ø¯ ØªØ­ÙˆÙŠÙ„Ø§Øª translate() ØªØ¤Ø«Ø± Ø¹Ù„Ù‰ Ù…ÙˆØ¶Ø¹ Ø§Ù„Ù…Ø±ÙƒØ²

    // ØªØ¹Ø±ÙŠÙ Ø§Ù„Ù…ØªØºÙŠØ±Ø§Øª Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø© Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„Ø­Ù„Ù‚Ø§Øª
    const innerRadius = 60;
    const baseRingWidth = 100; // Ø²ÙŠØ§Ø¯Ø© Ø§Ù„Ø¹Ø±Ø¶ Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ Ù„Ø®Ù„Ø§ÙŠØ§ Ø£ÙƒØ¨Ø±
    const digitScale = 20; // Ø²ÙŠØ§Ø¯Ø© Ø§Ù„Ù…Ù‚ÙŠØ§Ø³ Ù„Ù„Ø£Ø±Ù‚Ø§Ù… Ø§Ù„Ø·ÙˆÙŠÙ„Ø©  
    const minCellPadding = 16; // Ø­Ø¯ Ø£Ø¯Ù†Ù‰ Ø£ÙƒØ¨Ø± Ù„Ù„Ù…Ø³Ø§Ø­Ø© Ø§Ù„ÙØ§Ø±ØºØ© Ø¯Ø§Ø®Ù„ Ø§Ù„Ø®Ù„ÙŠØ©

    
    // Ø®Ù„ÙÙŠØ© Ø§Ù„Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„Ø±Ù…Ø§Ø¯ÙŠØ©
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, ringRadius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = "#eee";
    ctx.fill();
    ctx.restore();

    // ØªÙ… Ù†Ù‚Ù„ Ø±Ø³Ù… Ø§Ù„Ø³Ø§Ø¹Ø© Ù„ØªÙƒÙˆÙ† ÙÙˆÙ‚ Ø§Ù„Ø®Ù„Ø§ÙŠØ§ (Ø³ÙŠØªÙ… Ø±Ø³Ù…Ù‡Ø§ Ù„Ø§Ø­Ù‚Ø§Ù‹)

    // Ø¹Ø¬Ù„Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ù‚Ø¨Ù„ Ø§Ù„Ø£Ø±Ù‚Ø§Ù…/Ø§Ù„Ø£Ø¨Ø±Ø§Ø¬
    if (showAngleWheel) {
      drawAngleWheel(ctx, center);
    }

    // Ø±Ø³Ù… Ø§Ù„Ø£Ø´ÙƒØ§Ù„ (Ù…Ø«Ø§Ù„: Ù…Ø«Ù„Ø«ØŒ Ù…Ø±Ø¨Ø¹ØŒ ... Ø¥Ù„Ø®)
  function drawShape(ctx, center, radius, shape) {

      if (shape === "triangle") {
    // Ø±Ø³Ù… Ø§Ù„Ù…Ø«Ù„Ø« Ù…Ù‚ØªØ±Ù† Ø¨Ø­Ù„Ù‚Ø© Ø§Ù„Ø¯Ø±Ø¬Ø§Øª (degree ring)
    const r = degreeRingRadius;
    
    const trianglePoints = customAngles.map((deg) => {
      const rad = ((deg + triangleRotation + settings.rotation - 90) * Math.PI) / 180;
      return {
        x: center + r * Math.cos(rad),
        y: center + r * Math.sin(rad),
      };
    });

    // Ø±Ø³Ù… Ø®Ø·ÙˆØ· Ø§Ù„Ø±Ø¨Ø· Ù…Ù† Ø§Ù„Ù…Ø±ÙƒØ² Ø¥Ù„Ù‰ Ø­Ù„Ù‚Ø© Ø§Ù„Ø¯Ø±Ø¬Ø§Øª
    trianglePoints.forEach((point) => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = "darkgreen";
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8;
      ctx.stroke();
      ctx.restore();
    });

    // Ø±Ø³Ù… Ø§Ù„Ù…Ø«Ù„Ø« Ù†ÙØ³Ù‡
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(trianglePoints[0].x, trianglePoints[0].y);
    trianglePoints.forEach((p, i) => {
      if (i > 0) ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    if (fillTriangle) {
      ctx.fillStyle = "rgba(0, 100, 0, 0.2)";
      ctx.fill();
    }
    ctx.strokeStyle = "darkgreen";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // ØªÙ…ÙŠÙŠØ² Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ø¨Ø¯ÙˆØ§Ø¦Ø± Ø¹Ù„Ù‰ Ø­Ù„Ù‚Ø© Ø§Ù„Ø¯Ø±Ø¬Ø§Øª
    if (highlightTriangle) {
      trianglePoints.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = "darkgreen";
        ctx.fill();
        ctx.strokeStyle = "green";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      });
    }

    // Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ© Ù…Ù† Ø§Ù„Ø±Ø¤ÙˆØ³ Ø¥Ù„Ù‰ Ø§Ù„Ù…Ø±ÙƒØ²
    trianglePoints.forEach((point) => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(center, center);
      ctx.strokeStyle = "green";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 2]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    });

    // Ø¹Ø±Ø¶ Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ù†ØµÙŠØ© Ø¹Ù†Ø¯ Ø§Ù„Ø±Ø¤ÙˆØ³
    trianglePoints.forEach((point, i) => {
      const angle = (customAngles[i] + triangleRotation + settings.rotation) % 360;
      ctx.save();
      ctx.font = "bold 16px Tahoma";
      ctx.fillStyle = "darkgreen";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`(${angle.toFixed(0)}Â°)`, point.x, point.y - 15); // Ø±ÙØ¹Øª Ø§Ù„Ù†Øµ Ù‚Ù„ÙŠÙ„Ø§Ù‹
      ctx.restore();
    });

    // **Ø±Ø³Ù… Ø±Ø¤ÙˆØ³ Ø§Ù„Ù…Ø«Ù„Ø« Ø¨Ù„ÙˆÙ† Ø£ØµÙØ± ØºØ§Ù…Ù‚ Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ø¸Ø§Ù‡Ø±Ø© - ÙÙŠ Ø§Ù„Ù†Ù‡Ø§ÙŠØ© Ù„ÙŠÙƒÙˆÙ†ÙˆØ§ ÙÙˆÙ‚ ÙƒÙ„ Ø´ÙŠØ¡**
    trianglePoints.forEach((point, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI); // Ø¯Ø§Ø¦Ø±Ø© Ø£ÙƒØ¨Ø± Ù‚Ù„ÙŠÙ„Ø§Ù‹
      ctx.fillStyle = "#B8860B"; // Ø£ØµÙØ± ØºØ§Ù…Ù‚ (DarkGoldenRod)
      ctx.fill();
      ctx.strokeStyle = "#8B7D00"; // Ø­Ø¯ÙˆØ¯ Ø£ØµÙØ± Ø£ØºÙ…Ù‚
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Ø¥Ø¶Ø§ÙØ© Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ© ØµØºÙŠØ±Ø© Ù„Ù„ØªØ£ÙƒÙŠØ¯
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#8B7D00"; // Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ© Ø£ØºÙ…Ù‚
      ctx.fill();
      ctx.restore();
    });

    // Ø¥Ø¨Ø±Ø§Ø² Ø§Ù„Ø±Ø£Ø³ ØªØ­Øª Ø§Ù„Ù…Ø§ÙˆØ³ (ÙÙˆÙ‚ Ø§Ù„Ø±Ø¤ÙˆØ³ Ø§Ù„Ø£ØµÙØ±)
if (hoveredPointIndex !== null && trianglePoints[hoveredPointIndex]) {
  const p = trianglePoints[hoveredPointIndex];
  ctx.save();
  ctx.beginPath();
  ctx.arc(p.x, p.y, 10, 0, 2 * Math.PI); // Ø£ÙƒØ¨Ø± Ù‚Ù„ÙŠÙ„Ø§Ù‹ Ù…Ù† Ø§Ù„Ø±Ø¤ÙˆØ³ Ø§Ù„Ø£ØµÙØ±
  ctx.fillStyle = "orange";
  ctx.fill();
  ctx.strokeStyle = "#FF8C00"; // Ø­Ø¯ÙˆØ¯ Ø¨Ø±ØªÙ‚Ø§Ù„ÙŠØ©
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}
    return; // Ø§Ù†ØªÙ‡Ù‰ Ø±Ø³Ù… Ø§Ù„Ù…Ø«Ù„Ø« ÙˆÙ„Ø§ ØªÙ†ÙØ° Ø§Ù„Ø¨Ø§Ù‚ÙŠ
  }

  // Ø±Ø³Ù… Ø§Ù„Ø£Ø´ÙƒØ§Ù„ Ø§Ù„Ù‡Ù†Ø¯Ø³ÙŠØ© Ø§Ù„Ø£Ø®Ø±Ù‰
  if (shape === "square") {
    drawSquare(ctx, center, radius);
    return;
  }
  if (shape === "pentagon") {
    drawPentagon(ctx, center, radius);
    return;
  }
  if (shape === "hexagon") {
    drawHexagon(ctx, center, radius);
    return;
  }
  if (shape === "heptagon") {
    drawHeptagon(ctx, center, radius);
    return;
  }
  if (shape === "octagon") {
    drawOctagon(ctx, center, radius);
    return;
  }
  if (shape === "nonagon") {
    drawNonagon(ctx, center, radius);
    return;
  }
  if (shape === "decagon") {
    drawDecagon(ctx, center, radius);
    return;
  }
  if (shape === "eleven") {
    drawHendecagon(ctx, center, radius);
    return;
  }
  if (shape === "twelve") {
    drawDodecagon(ctx, center, radius);
    return;
  }
  
  // Ø±Ø³Ù… Ø§Ù„Ù†Ø¬ÙˆÙ…
  if (shape === "star4") {
    drawStar4(ctx, center, radius);
    return;
  }
  if (shape === "star5") {
    drawStar5(ctx, center, radius);
    return;
  }
  if (shape === "star6") {
    drawStar6(ctx, center, radius);
    return;
  }
  if (shape === "star7") {
    drawStar7(ctx, center, radius);
    return;
  }
  if (shape === "star8") {
    drawStar8(ctx, center, radius);
    return;
  }
  if (shape === "star9") {
    drawStar9(ctx, center, radius);
    return;
  }
  if (shape === "star10") {
    drawStar10(ctx, center, radius);
    return;
  }
  if (shape === "star11") {
    drawStar11(ctx, center, radius);
    return;
  }
  if (shape === "star12") {
    drawStar12(ctx, center, radius);
    return;
  }
    
    const shapes = {
      triangle: 3,
      square: 4,
      star4: 4,
      pentagon: 5,
      star5: 5,
      hexagon: 6,
      star6: 6,
      heptagon: 7,
      star7: 7,
      octagon: 8,
      star8: 8,
      nonagon: 9,
      star9: 9,
      decagon: 10,
      star10: 10,
      eleven: 11,
      star11: 11,
      twelve: 12,
      star12: 12,
    };
    let N = shapes[shape];
    if (!N) return;
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      let angle = ((2 * Math.PI * i) / N) - Math.PI / 2;
      let r = radius;
      // Ù†Ø¬Ù…Ø©: ÙƒÙ„ Ø²Ø§ÙˆÙŠØ© Ø«Ø§Ù†ÙŠØ© Ù†ØµÙ Ø§Ù„Ù‚Ø·Ø±
      if (shape.startsWith("star")) {
        r = i % 2 === 0 ? radius : radius * 0.55;
      }
      let x = center + r * Math.cos(angle);
      let y = center + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = "#00CED1";
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.7;
    ctx.stroke();
    ctx.restore();
  }

    // Ø§Ù„Ø­Ù„Ù‚Ø§Øª Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© ÙˆØ§Ù„Ø®Ù„Ø§ÙŠØ§
    // Ø­Ø³Ø§Ø¨ Ø£Ø±Ù‚Ø§Ù… Ø§Ù„Ø¨Ø¯Ø§ÙŠØ© Ù„ÙƒÙ„ Ø­Ù„Ù‚Ø©
    // Ø¥Ø¶Ø§ÙØ© 2 Ø­Ù„Ù‚Ø§Øª Ø¥Ø¶Ø§ÙÙŠØ© (Ø§Ù„Ø£ÙˆÙ„Ù‰ ÙˆØ§Ù„Ø«Ø§Ù†ÙŠØ©) Ù„Ù„Ø­Ù„Ù‚Ø§Øª Ø§Ù„Ù…Ø±Ù‚Ù…Ø©
    const totalLevels = settings.levels + 2;
    const ringStartNumbers = calculateRingStartNumbers(settings.startValue, totalLevels, settings.divisions);
    
    // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ÙˆØ¬ÙˆØ¯ Ù‚Ø·Ø§Ø¹Ø§Øª ÙˆØ­Ù„Ù‚Ø§Øª Ù„Ø±Ø³Ù…Ù‡Ø§
    if (settings.divisions > 0 && settings.levels > 0) {
      for (let level = 0; level < totalLevels; level++) {
        const maxDigitsInLevel = Math.max(
          ...Array.from({ length: settings.divisions }, (_, i) => {
            const cellValue = getCellValue(level, i, ringStartNumbers, settings.startValue);
            return cellValue > 0 ? parseFloat(cellValue.toFixed(2)).toString().length : 1;
          })
        );
        
        // Ø­Ø³Ø§Ø¨ Ø¹Ø±Ø¶ Ø§Ù„Ø­Ù„Ù‚Ø© Ù…Ø¹ Ù…Ø±Ø§Ø¹Ø§Ø© Ø·ÙˆÙ„ Ø§Ù„Ø£Ø±Ù‚Ø§Ù… ÙˆØ§Ù„Ù…Ø³Ø§Ø­Ø© Ø§Ù„ÙØ§Ø±ØºØ©
        const dynamicWidth = calculateRingWidth(maxDigitsInLevel);
        
        const r1 =
          innerRadius +
          [...Array(level)].reduce((acc, _, l) => {
            const maxDigits = Math.max(
              ...Array.from({ length: settings.divisions }, (_, i) => {
                const cellValue = getCellValue(l, i, ringStartNumbers, settings.startValue);
                return cellValue > 0 ? parseFloat(cellValue.toFixed(2)).toString().length : 1;
              })
            );
            return acc + calculateRingWidth(maxDigits);
          }, 0);
        const r2 = r1 + dynamicWidth;      for (let index = 0; index < settings.divisions; index++) {
        // Ø­Ø³Ø§Ø¨ Ø§Ù„Ù‚ÙŠÙ…Ø© Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©: Ø¨Ø¯Ø§ÙŠØ© Ø§Ù„Ø­Ù„Ù‚Ø© + ÙÙ‡Ø±Ø³ Ø§Ù„Ø®Ù„ÙŠØ© (Ù…Ø¹ Ù…Ø±Ø§Ø¹Ø§Ø© Ø®Ø·ÙˆØ© Ø§Ù„Ø²ÙŠØ§Ø¯Ø©)
        const value = getCellValue(level, index, ringStartNumbers, settings.startValue);
        const reduced = value > 0 ? reduceToDigit(value) : 0;
        
        // Ø­Ø³Ø§Ø¨ Ø§Ù„Ø²Ø§ÙˆÙŠØ©: ÙƒÙ„ Ø®Ù„ÙŠØ© ØªØ£Ø®Ø° (360Â° / Ø¹Ø¯Ø¯ Ø§Ù„Ù‚Ø·Ø§Ø¹Ø§Øª) Ù…Ù† Ø§Ù„Ù…Ø³Ø§Ø­Ø©
        // Ø§Ù„Ø®Ù„ÙŠØ© Ø§Ù„Ø£ÙˆÙ„Ù‰ ØªØ¨Ø¯Ø£ Ù…Ù† Ø²Ø§ÙˆÙŠØ© Ø§Ù„Ø¨Ø¯Ø§ÙŠØ©ØŒ ÙˆØ§Ù„Ø£Ø®ÙŠØ±Ø© ØªÙ†ØªÙ‡ÙŠ Ø¹Ù†Ø¯ 360Â°
        const anglePerCell = 360 / settings.divisions;
        const cellAngleDeg = (index + 1) * anglePerCell; // Ù…Ù† anglePerCell Ø¥Ù„Ù‰ 360Â°
        
        let angleDeg = cellAngleDeg - 90 + settings.rotation; // ØªØ­ÙˆÙŠÙ„ Ø¥Ù„Ù‰ Ù†Ø¸Ø§Ù… Canvas (-90Â° Ù„Ù„Ø³Ø§Ø¹Ø© 12) Ù…Ø¹ Ø¥Ø¶Ø§ÙØ© Ø§Ù„ØªØ¯ÙˆÙŠØ±
        const angleRad = (angleDeg * Math.PI) / 180;
        
        // Ø­Ø³Ø§Ø¨ Ø²ÙˆØ§ÙŠØ§ Ø¨Ø¯Ø§ÙŠØ© ÙˆÙ†Ù‡Ø§ÙŠØ© Ø§Ù„Ø®Ù„ÙŠØ©
        const halfAngle = (anglePerCell / 2 * Math.PI) / 180; // Ù†ØµÙ Ø¹Ø±Ø¶ Ø§Ù„Ø®Ù„ÙŠØ©
        const angleStart = angleRad - halfAngle;
        const angleEnd = angleRad + halfAngle;
        const angleMid = angleRad;
        const rMid = (r1 + r2) / 2;
        
        // Ù…ÙØªØ§Ø­ ÙØ±ÙŠØ¯ Ù„Ù„Ø®Ù„ÙŠØ©
        const cellKey = `${level}-${index}`;
        const clickCount = cellClickCounts[cellKey] || 0;
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, r2, angleStart, angleEnd);
        ctx.arc(center, center, r1, angleEnd, angleStart, true);
        ctx.closePath();
        ctx.fillStyle = getCellBackgroundColor(cellKey, clickCount, level, index);
        ctx.fill();
        ctx.strokeStyle = "#aaa";
        ctx.lineWidth = 0.5;
        ctx.stroke();
        
        // Ø±Ø³Ù… Ø§Ù„Ø£Ø±Ù‚Ø§Ù… Ø¨Ø¯Ø§ÙŠØ© Ù…Ù† Ø§Ù„Ø­Ù„Ù‚Ø© Ø§Ù„Ø«Ø§Ù„Ø«Ø© (level >= 2)
        // Ø¹Ø±Ø¶ Ø±Ù‚Ù… Ø§Ù„Ø­Ù„Ù‚Ø© Ø¨Ø­ÙŠØ« Ø§Ù„Ø­Ù„Ù‚Ø© Ø§Ù„Ø«Ø§Ù„Ø«Ø© ØªÙƒÙˆÙ† Ø±Ù‚Ù… 1
        if (level >= 2) {
          const x = center + rMid * Math.cos(angleMid);
          const y = center + rMid * Math.sin(angleMid);
          
          // Ø­Ø³Ø§Ø¨ Ø­Ø¬Ù… Ø§Ù„Ø®Ø· Ø§Ù„Ù…Ù†Ø§Ø³Ø¨ Ù„Ù„Ø®Ù„ÙŠØ© Ø¨Ø´ÙƒÙ„ Ø£ÙƒØ«Ø± Ø¯Ù‚Ø©
          const cellWidth = dynamicWidth;
          // ØªÙ†Ø³ÙŠÙ‚ Ø§Ù„Ø±Ù‚Ù… Ø¨Ø­Ø¯ Ø£Ù‚ØµÙ‰ Ø±Ù‚Ù…ÙŠÙ† Ø¨Ø¹Ø¯ Ø§Ù„ÙØ§ØµÙ„Ø© Ø§Ù„Ø¹Ø´Ø±ÙŠØ©
          const formattedValue = parseFloat(value.toFixed(2)).toString();
          const valueString = formattedValue;
          
          // Ø­Ø³Ø§Ø¨ Ø­Ø¬Ù… Ø§Ù„Ø®Ø· Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ Ø¹Ø±Ø¶ Ø§Ù„Ø®Ù„ÙŠØ© ÙˆØ·ÙˆÙ„ Ø§Ù„Ù†Øµ
          const maxFontSize = Math.min(cellWidth * 0.85, 24); // Ø­Ø¯ Ø£Ù‚ØµÙ‰ Ø£ÙƒØ¨Ø± 24px
          const minFontSize = 12; // Ø­Ø¯ Ø£Ø¯Ù†Ù‰ Ø£ÙƒØ¨Ø± Ù„Ù„ÙˆØ¶ÙˆØ­
          
          // Ø­Ø³Ø§Ø¨ Ø­Ø¬Ù… Ø®Ø· Ø¯ÙŠÙ†Ø§Ù…ÙŠÙƒÙŠ Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ Ø·ÙˆÙ„ Ø§Ù„Ù†Øµ
          let fontSize = Math.max(
            Math.min(maxFontSize, (cellWidth * 0.75) / valueString.length * 2.4), 
            minFontSize
          );
          
          // Ù„Ù„Ø£Ø±Ù‚Ø§Ù… Ø§Ù„Ø·ÙˆÙŠÙ„Ø© (Ø£ÙƒØ«Ø± Ù…Ù† 6 Ø£Ø±Ù‚Ø§Ù…) Ù†Ø¹Ø·ÙŠÙ‡Ø§ Ù…Ø³Ø§Ø­Ø© Ø¥Ø¶Ø§ÙÙŠØ©
          if (valueString.length > 6) {
            fontSize = Math.max(fontSize * 0.9, minFontSize);
          }
          
          ctx.font = `bold ${fontSize}px Tahoma`;
          ctx.fillStyle = getDigitColor(reduced);
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          
          // Ø¥Ø¶Ø§ÙØ© Ø®Ø·ÙˆØ· Ø®Ø§Ø±Ø¬ÙŠØ© Ù„Ù„Ù†Øµ Ù„Ù„ÙˆØ¶ÙˆØ­
          ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
          ctx.lineWidth = 1;
          ctx.strokeText(formattedValue, x, y);
          ctx.fillText(formattedValue, x, y);
          
          // Ø§Ù„Ø±Ù‚Ù… Ø§Ù„Ù…Ø®ØªØ²Ù„ Ø¨Ø­Ø¬Ù… Ø£ØµØºØ± Ù†Ø³Ø¨ÙŠØ§Ù‹
          const reducedFontSize = Math.max(fontSize * 0.6, 8);
          ctx.font = `bold ${reducedFontSize}px Tahoma`;
          ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
          ctx.lineWidth = 0.8;
          const reducedX = center + (r1 + minCellPadding + 2) * Math.cos(angleMid);
          const reducedY = center + (r1 + minCellPadding + 2) * Math.sin(angleMid);
          ctx.strokeText(reduced, reducedX, reducedY);
          ctx.fillText(reduced, reducedX, reducedY);
        }
        ctx.restore();
      }
    }
    } // Ø¥ØºÙ„Ø§Ù‚ Ø´Ø±Ø· settings.divisions > 0 && settings.levels > 0

    // Ø±Ø³Ù… Ø®Ø·ÙˆØ· Ø§Ù„Ø£Ø´Ø¹Ø© ÙÙˆÙ‚ Ø­Ù„Ù‚Ø§Øª Ø§Ù„Ø£Ø±Ù‚Ø§Ù…
    drawAngleWheelRays(ctx, center);

    // Ø±Ø³Ù… Ø§Ù„Ø£Ø±Ù‚Ø§Ù… Ù…Ù† 1 Ø¥Ù„Ù‰ 36 ÙÙŠ Ø§Ù„Ø­Ù„Ù‚Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ© - Ø¨Ø¹Ø¯ ÙƒÙ„ Ø§Ù„Ø­Ù„Ù‚Ø§Øª
    const level0Width = baseRingWidth + 2 * digitScale;
    const level1R1 = innerRadius + level0Width;
    // ØªØµØºÙŠØ± Ø­Ù„Ù‚Ø© Ø§Ù„Ø£Ø±Ù‚Ø§Ù… ÙˆØ¬Ø¹Ù„Ù‡Ø§ Ø£Ù‚Ø±Ø¨ Ù„Ù„Ø­Ø§ÙØ© Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ©
    const level1DynamicWidth = (baseRingWidth + 2 * digitScale) * 0.7; // ØªØµØºÙŠØ± Ø¹Ø±Ø¶ Ø§Ù„Ø­Ù„Ù‚Ø©
    const level1R2 = level1R1 + level1DynamicWidth;
    // Ù†Ù‚Ù„ Ø§Ù„Ø£Ø±Ù‚Ø§Ù… Ø¥Ù„Ù‰ Ù…Ù†ØªØµÙ Ø§Ù„Ø­Ù„Ù‚Ø© Ø§Ù„Ù…ØµØºØ±Ø©
    const level1RMid = level1R1 + (level1DynamicWidth * 0.6); // Ù…Ù†ØªØµÙ Ø§Ù„Ø­Ù„Ù‚Ø© Ø§Ù„Ø£ØµØºØ±
    
    // Ø±Ø³Ù… Ø®Ù„ÙÙŠØ© Ø±Ù…Ø§Ø¯ÙŠØ© Ù„Ù„Ø­Ù„Ù‚Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ© Ù…Ø¹ ØªØ¯Ø±Ø¬ ÙŠØªÙ†Ø§Ø³Ù‚ Ù…Ø¹ Ø§Ù„Ø³Ø§Ø¹Ø© Ø§Ù„Ù…ÙˆØ³Ø¹Ø©
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, level1R2, 0, 2 * Math.PI);
    ctx.arc(center, center, level1R1, 0, 2 * Math.PI, true);
    ctx.closePath();
    
    // ØªØ¯Ø±Ø¬ Ø­Ù„Ù‚Ø© Ø§Ù„Ø£Ø±Ù‚Ø§Ù… Ù…ØªÙ†Ø§Ø³Ù‚ Ù…Ø¹ Ø§Ù„Ø³Ø§Ø¹Ø© Ø§Ù„Ù…Ø®ØµØµØ© Ù„Ù„Ø­Ù„Ù‚Ø© ØµÙØ± ÙˆØ§Ù„Ø£ÙˆÙ„Ù‰
    const ringGradient = ctx.createRadialGradient(center, center, level1R1, center, center, level1R2);
    ringGradient.addColorStop(0, "rgba(170, 170, 170, 0.4)"); // ÙŠØ¨Ø¯Ø£ Ù…Ù† Ù†Ù‡Ø§ÙŠØ© Ø§Ù„Ø³Ø§Ø¹Ø©
    ringGradient.addColorStop(0.3, "rgba(200, 200, 200, 0.7)");
    ringGradient.addColorStop(0.7, "#e0e0e0"); 
    ringGradient.addColorStop(1, "#f5f5f5"); // Ø£Ø¨ÙŠØ¶ ÙØ§ØªØ­ ÙÙŠ Ø§Ù„Ù†Ù‡Ø§ÙŠØ©
    
    ctx.fillStyle = ringGradient;
    ctx.fill();
    
    // Ø­Ø¯ÙˆØ¯ Ù…ØªØ¯Ø±Ø¬Ø© Ù†Ø§Ø¹Ù…Ø©
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = "#e8e8e8";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    
    // Ø±Ø³Ù… Ø§Ù„Ø£Ø±Ù‚Ø§Ù… Ø¨Ø­Ø¬Ù… Ø£ØµØºØ± ÙÙŠ Ø§Ù„Ø®Ù„Ø§ÙŠØ§ Ø§Ù„Ù…ØµØºØ±Ø©
    ctx.save();
    ctx.font = "bold 10px Arial"; // Ø­Ø¬Ù… Ø£ØµØºØ± Ù„Ù„Ø®Ù„Ø§ÙŠØ§ Ø§Ù„Ù…ØµØºØ±Ø©
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Ø¥Ø¶Ø§ÙØ© ØªØ£Ø«ÙŠØ± Ø¸Ù„ Ø£Ù‚Ù„ Ù„Ù„Ø£Ø±Ù‚Ø§Ù…
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 1;
    ctx.shadowOffsetX = 0.5;
    ctx.shadowOffsetY = 0.5;
    
    for (let i = 0; i < 36; i++) {
      // Ù†ÙØ³ Ù†Ø¸Ø§Ù… Ø­Ù„Ù‚Ø© Ø§Ù„Ø£Ø¨Ø±Ø§Ø¬ ÙˆØ§Ù„Ø¯Ø±Ø¬Ø§Øª: Ø§Ù„Ø±Ù‚Ù… 1 Ø¹Ù†Ø¯ 10Â°ØŒ Ø§Ù„Ø±Ù‚Ù… 36 Ø¹Ù†Ø¯ 360Â°
      const centerAngleDeg = -90 + 10 + i * 10; // Ø§Ù„Ø¨Ø¯Ø§ÙŠØ© Ù…Ù† 10Â° Ù…Ø«Ù„ Ø­Ù„Ù‚Ø© Ø§Ù„Ø£Ø¨Ø±Ø§Ø¬
      const angleRad = (centerAngleDeg * Math.PI) / 180;
      
      const x = center + level1RMid * Math.cos(angleRad);
      const y = center + level1RMid * Math.sin(angleRad);

      const number = i + 1;
      
      // ØªÙ…ÙŠÙŠØ² Ø§Ù„Ø£Ø±Ù‚Ø§Ù… Ø¨Ø£Ù„ÙˆØ§Ù† Ù…Ø®ØªÙ„ÙØ© Ø­Ø³Ø¨ Ø£Ù‡Ù…ÙŠØªÙ‡Ø§
      if (number % 9 === 0) {
        ctx.fillStyle = "#8B0000"; // Ø£Ø­Ù…Ø± ØºØ§Ù…Ù‚ Ù„Ù…Ø¶Ø§Ø¹ÙØ§Øª Ø§Ù„Ù€ 9 (9, 18, 27, 36)
      } else if (number % 6 === 0) {
        ctx.fillStyle = "#4B0082"; // Ø¨Ù†ÙØ³Ø¬ÙŠ Ù„Ù…Ø¶Ø§Ø¹ÙØ§Øª Ø§Ù„Ù€ 6
      } else if (number % 3 === 0) {
        ctx.fillStyle = "#00008B"; // Ø£Ø²Ø±Ù‚ ØºØ§Ù…Ù‚ Ù„Ù…Ø¶Ø§Ø¹ÙØ§Øª Ø§Ù„Ù€ 3
      } else {
        ctx.fillStyle = "#006400"; // Ø£Ø®Ø¶Ø± ØºØ§Ù…Ù‚ Ù„Ù„Ø¨Ø§Ù‚ÙŠ
      }
      
      ctx.fillText(number, x, y);
    }
    
    // Ø¥Ø²Ø§Ù„Ø© ØªØ£Ø«ÙŠØ± Ø§Ù„Ø¸Ù„
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.restore();

    // Ø±Ø³Ù… Ø§Ù„Ø³Ø§Ø¹Ø© Ø§Ù„Ø±Ù‚Ù…ÙŠØ© ÙÙˆÙ‚ Ø§Ù„Ø®Ù„Ø§ÙŠØ§
    if (showDigitalClock) {
      const time = getTimeByZone();
      const date = getDateByZone();
      const dayName = getDayName();
      const timeZoneName = timeZone === 'utc' ? 'UTC' : 'KSA';
      
      ctx.save();
      
      // Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…Ù†Ø·Ù‚Ø© Ø§Ù„Ù…ØªØ§Ø­Ø© Ù„Ù„Ø³Ø§Ø¹Ø©
      const level0Width = baseRingWidth + 2 * digitScale;
      const level1R1 = innerRadius + level0Width;
      const level1DynamicWidth = baseRingWidth + 2 * digitScale;
      const level1R2 = level1R1 + level1DynamicWidth;
      
      // Ø§Ù„Ø³Ø§Ø¹Ø© ØªÙ…Ù„Ø£ Ø§Ù„Ø­Ù„Ù‚Ø© ØµÙØ± ÙˆØ§Ù„Ø¥Ø·Ø§Ø± ÙÙŠ Ø§Ù„Ø­Ù„Ù‚Ø© Ø§Ù„Ø£ÙˆÙ„Ù‰
      const clockRadius = level1R1; // Ø§Ù„Ø³Ø§Ø¹Ø© ØªØµÙ„ Ø¥Ù„Ù‰ Ù†Ù‡Ø§ÙŠØ© Ø§Ù„Ø­Ù„Ù‚Ø© ØµÙØ±
      const frameRadius = level1R2; // Ø§Ù„Ø¥Ø·Ø§Ø± ÙŠØµÙ„ Ø¥Ù„Ù‰ Ù†Ù‡Ø§ÙŠØ© Ø§Ù„Ø­Ù„Ù‚Ø© Ø§Ù„Ø£ÙˆÙ„Ù‰
      
      // Ø±Ø³Ù… Ø§Ù„Ø³Ø§Ø¹Ø© Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ© ÙÙŠ Ø§Ù„Ø­Ù„Ù‚Ø© ØµÙØ± Ø¨Ø®Ù„ÙÙŠØ© Ø³ÙˆØ¯Ø§Ø¡ Ù…Ø«Ù„ Ø§Ù„ØµÙˆØ±Ø©
      const clockGradient = ctx.createRadialGradient(center, center, 0, center, center, clockRadius);
      clockGradient.addColorStop(0, "#000000");    // Ø£Ø³ÙˆØ¯ Ù…Ø«Ù„ Ø§Ù„ØµÙˆØ±Ø©
      clockGradient.addColorStop(0.2, "#111111");
      clockGradient.addColorStop(0.4, "#222222");
      clockGradient.addColorStop(0.6, "#333333");
      clockGradient.addColorStop(0.8, "#444444");
      clockGradient.addColorStop(1, "#555555");    // Ù†Ù‡Ø§ÙŠØ© Ø§Ù„Ø­Ù„Ù‚Ø© ØµÙØ±
      
      ctx.beginPath();
      ctx.arc(center, center, clockRadius, 0, 2 * Math.PI);
      ctx.fillStyle = clockGradient;
      ctx.fill();
      
      // Ø­Ø¯ Ø±Ù…Ø§Ø¯ÙŠ Ù„Ù„Ø³Ø§Ø¹Ø© Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©
      ctx.strokeStyle = "#666666";
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Ø±Ø³Ù… Ø¥Ø·Ø§Ø± Ø§Ù„Ø³Ø§Ø¹Ø© ÙÙŠ Ø§Ù„Ø­Ù„Ù‚Ø© Ø§Ù„Ø£ÙˆÙ„Ù‰ Ø¨Ø®Ù„ÙÙŠØ© Ø³ÙˆØ¯Ø§Ø¡
      const frameGradient = ctx.createRadialGradient(center, center, clockRadius, center, center, frameRadius);
      frameGradient.addColorStop(0, "#555555"); // ÙŠØ¨Ø¯Ø£ Ù…Ù† Ù†Ù‡Ø§ÙŠØ© Ø§Ù„Ø³Ø§Ø¹Ø©
      frameGradient.addColorStop(0.3, "#666666");
      frameGradient.addColorStop(0.6, "#777777");
      frameGradient.addColorStop(1, "#888888");    // Ù†Ù‡Ø§ÙŠØ© Ø§Ù„Ø¥Ø·Ø§Ø±
      
      ctx.beginPath();
      ctx.arc(center, center, frameRadius, 0, 2 * Math.PI);
      ctx.arc(center, center, clockRadius, 0, 2 * Math.PI, true);
      ctx.closePath();
      ctx.fillStyle = frameGradient;
      ctx.fill();
      
      // Ø­Ø¯ÙˆØ¯ Ø§Ù„Ø¥Ø·Ø§Ø± Ø±Ù…Ø§Ø¯ÙŠØ©
      ctx.strokeStyle = "#888888";
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Ø­Ø³Ø§Ø¨ Ø£Ø­Ø¬Ø§Ù… Ø®Ø·ÙˆØ· Ù…Ù†Ø§Ø³Ø¨Ø© Ù„Ù„Ø­Ù„Ù‚Ø© ØµÙØ± (Ø§Ù„Ø³Ø§Ø¹Ø© Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©)
      const baseFontSize = Math.max(16, clockRadius * 0.20);
      const timeFontSize = Math.max(24, clockRadius * 0.32);
      
      // Ø§Ù„Ø³Ø·Ø± Ø§Ù„Ø£ÙˆÙ„: Ø§Ù„ØªØ§Ø±ÙŠØ® Ù…Ø¹ ØªØ£Ø«ÙŠØ± Ø¸Ù„ Ù…Ø­Ø³Ù† ÙˆØªØ¨Ø§ÙŠÙ† Ø£ÙØ¶Ù„
      const [year, month, day] = date.split('-');
      
      // Ø¥Ø¶Ø§ÙØ© Ø­Ø¯ÙˆØ¯ Ø¨ÙŠØ¶Ø§Ø¡ Ù„Ù„Ù†Øµ Ù„ØªØ­Ø³ÙŠÙ† Ø§Ù„ÙˆØ¶ÙˆØ­ Ø¹Ù„Ù‰ Ø§Ù„Ø®Ù„ÙÙŠØ© Ø§Ù„Ø³ÙˆØ¯Ø§Ø¡
      ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#0080FF";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      ctx.fillStyle = "#0080FF"; // Ø£Ø²Ø±Ù‚ Ø±Ù‚Ù…ÙŠ Ù…Ø«Ù„ Ø§Ù„ØµÙˆØ±Ø©
      ctx.font = `bold ${baseFontSize}px 'Arial', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Ø±Ø³Ù… Ø§Ù„Ù†Øµ Ù…Ø¹ Ø§Ù„Ø­Ø¯ÙˆØ¯ ÙÙŠ Ø§Ù„Ø­Ù„Ù‚Ø© ØµÙØ±
      ctx.strokeText(`${year}-${month}-${day}`, center, center - clockRadius * 0.4);
      ctx.fillText(`${year}-${month}-${day}`, center, center - clockRadius * 0.4);
      
      // Ø§Ù„Ø³Ø·Ø± Ø§Ù„Ø«Ø§Ù†ÙŠ: Ø§Ø³Ù… Ø§Ù„ÙŠÙˆÙ… Ù…Ø¹ ÙˆØ¶ÙˆØ­ Ø£ÙØ¶Ù„
      ctx.shadowBlur = 8;
      ctx.fillStyle = "#0080FF"; // Ù†ÙØ³ Ø§Ù„Ù„ÙˆÙ† Ø§Ù„Ø£Ø²Ø±Ù‚ Ø§Ù„Ø±Ù‚Ù…ÙŠ
      ctx.font = `bold ${baseFontSize * 0.85}px 'Arial', sans-serif`;
      ctx.strokeText(dayName, center, center - clockRadius * 0.15);
      ctx.fillText(dayName, center, center - clockRadius * 0.15);
      
      // Ø§Ù„Ø³Ø·Ø± Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ: Ø§Ù„ÙˆÙ‚Øª Ù…Ø¹ ØªØ£Ø«ÙŠØ± ÙˆÙ‡Ø¬ Ø£Ø²Ø±Ù‚ Ø±Ù‚Ù…ÙŠ
      ctx.shadowColor = "#0080FF";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
      ctx.lineWidth = 2;
      ctx.fillStyle = "#0080FF"; // Ø£Ø²Ø±Ù‚ Ø±Ù‚Ù…ÙŠ Ù…Ø«Ù„ Ø§Ù„ØµÙˆØ±Ø©
      ctx.font = `bold ${timeFontSize}px 'Arial', sans-serif`;
      
      // Ø±Ø³Ù… Ø§Ù„ÙˆÙ‚Øª Ø¨ÙˆØ¶ÙˆØ­ Ø¹Ø§Ù„ÙŠ
      ctx.strokeText(time, center, center + clockRadius * 0.05);
      ctx.fillText(time, center, center + clockRadius * 0.05);
      
      // Ø¥Ø¶Ø§ÙØ© ÙˆÙ‡Ø¬ Ø¥Ø¶Ø§ÙÙŠ Ù„Ù„ÙˆÙ‚Øª
      ctx.shadowColor = "#0080FF";
      ctx.shadowBlur = 25;
      ctx.fillStyle = "#00AAFF"; // Ø£Ø²Ø±Ù‚ Ø£ÙØªØ­ Ù„Ù„ÙˆÙ‡Ø¬ Ø§Ù„Ø¥Ø¶Ø§ÙÙŠ
      ctx.fillText(time, center, center + clockRadius * 0.05);
      
      // Ø§Ù„Ø³Ø·Ø± Ø§Ù„Ø£Ø®ÙŠØ±: Ø§Ù„Ù…Ù†Ø·Ù‚Ø© Ø§Ù„Ø²Ù…Ù†ÙŠØ© Ù…Ø¹ ÙˆØ¶ÙˆØ­ Ø¬ÙŠØ¯
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowColor = "#0080FF";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
      ctx.lineWidth = 2;
      ctx.fillStyle = "#0080FF"; // Ù†ÙØ³ Ø§Ù„Ù„ÙˆÙ† Ø§Ù„Ø£Ø²Ø±Ù‚ Ø§Ù„Ø±Ù‚Ù…ÙŠ
      ctx.font = `bold ${baseFontSize * 0.8}px 'Arial', sans-serif`;
      ctx.strokeText(timeZoneName, center, center + clockRadius * 0.35);
      ctx.fillText(timeZoneName, center, center + clockRadius * 0.35);
      
      // Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ø£Ø±Ù‚Ø§Ù… Ù…Ù† 1 Ø¥Ù„Ù‰ 36 ÙÙŠ Ø§Ù„Ø¥Ø·Ø§Ø±
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.globalAlpha = 0.8; // Ø¬Ø¹Ù„ Ø§Ù„Ø£Ø±Ù‚Ø§Ù… Ø£Ù‚Ù„ Ø´ÙØ§ÙÙŠØ© Ù‚Ù„ÙŠÙ„Ø§Ù‹      
      ctx.fillStyle = "#f4f7f4ff"; // Ø£ØµÙØ± ÙØ§ØªØ­ Ø¬Ù…ÙŠÙ„ Ù„Ù„Ø£Ø±Ù‚Ø§Ù…
      ctx.font = `bold ${Math.max(10, clockRadius * 0.12)}px 'Arial', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.globalAlpha = 1.0;
      
      // Ø±Ø³Ù… Ø§Ù„Ø£Ø±Ù‚Ø§Ù… Ù…Ù† 1 Ø¥Ù„Ù‰ 36 ÙÙŠ Ø§Ù„Ø¥Ø·Ø§Ø± (Ù…Ù† 10 Ø¥Ù„Ù‰ 360 Ø¯Ø±Ø¬Ø©)
      for (let i = 0; i < 36; i++) {
        const angleDegrees = 10 + (i * 10); // ÙŠØ¨Ø¯Ø£ Ù…Ù† 10 Ø¯Ø±Ø¬Ø© ÙˆÙŠÙ†ØªÙ‡ÙŠ Ø¹Ù†Ø¯ 360 Ø¯Ø±Ø¬Ø©
        const angle = (angleDegrees - 90) * Math.PI / 180; // ØªØ­ÙˆÙŠÙ„ Ø¥Ù„Ù‰ Ø±Ø§Ø¯ÙŠØ§Ù† Ù…Ø¹ ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø§ØªØ¬Ø§Ù‡
        const numberRadius = (clockRadius + frameRadius) / 2; // ÙÙŠ Ù…Ù†ØªØµÙ Ø§Ù„Ø¥Ø·Ø§Ø±
        
        const x = center + numberRadius * Math.cos(angle);
        const y = center + numberRadius * Math.sin(angle);
        
        const number = i + 1;
        
        // Ø¥Ø¶Ø§ÙØ© Ø­Ø¯ÙˆØ¯ Ø±Ù…Ø§Ø¯ÙŠØ© Ù„Ù„Ø£Ø±Ù‚Ø§Ù… Ø§Ù„ÙØ§ØªØ­Ø© Ù„Ù„ÙˆØ¶ÙˆØ­
        ctx.strokeStyle = "#666666";
        ctx.lineWidth = 1.5;
        ctx.strokeText(number.toString(), x, y);
        ctx.fillText(number.toString(), x, y);
      }
      
      ctx.globalAlpha = 1.0;
      ctx.restore();
    }

    // Ø­Ù„Ù‚Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© (Ø§Ù„Ø¯Ø±Ø¬Ø§Øª)
    if (showDegreeRing) {
      // Ø±Ø³Ù… Ø®Ù„ÙÙŠØ© Ø­Ù„Ù‚Ø© Ø§Ù„Ø¯Ø±Ø¬Ø§Øª Ø§Ù„Ù…Ø­Ø³Ù†Ø© Ù…Ø¹ Ø£Ø­Ø¬Ø§Ù… Ø£ÙƒØ¨Ø±
      const ringInnerRadius = degreeRingRadius - 28; // Ù†ØµÙ Ù‚Ø·Ø± Ø¯Ø§Ø®Ù„ÙŠ Ø£ÙƒØ¨Ø±
      const ringOuterRadius = degreeRingRadius + 28; // Ù†ØµÙ Ù‚Ø·Ø± Ø®Ø§Ø±Ø¬ÙŠ Ø£ÙƒØ¨Ø±
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, ringOuterRadius, 0, 2 * Math.PI);
      ctx.arc(center, center, ringInnerRadius, 0, 2 * Math.PI, true);
      ctx.closePath();
      ctx.fillStyle = "#eee"; // Ù†ÙØ³ Ù„ÙˆÙ† Ø®Ù„ÙÙŠØ© Ø­Ù„Ù‚Ø© Ø§Ù„Ø£Ø¨Ø±Ø§Ø¬
      ctx.fill();
      ctx.strokeStyle = "#ddd"; // Ø­Ø¯ÙˆØ¯ Ø®ÙÙŠÙØ©
      ctx.lineWidth = 1.5; // Ø­Ø¯ÙˆØ¯ Ø£Ø³Ù…Ùƒ
      ctx.stroke();
      ctx.restore();
      
      // Ø±Ø³Ù… Ø§Ù„Ù†ØµÙˆØµ
      for (let i = 0; i < 36; i++) {
        const angleDeg = -90 + 10 + i * 10;
        const degreeValue = (i + 1) * 10;
        const digitSum = degreeValue
          .toString()
          .split("")
          .reduce((sum, d) => sum + parseInt(d), 0);
        const reduced =
          digitSum > 9
            ? digitSum
                .toString()
                .split("")
                .reduce((sum, d) => sum + parseInt(d), 0)
            : digitSum;
        const getDegreeColor = (n) =>
          n === 1 || n === 4 || n === 7
            ? "red"
            : n === 2 || n === 5 || n === 8
            ? "blue"
            : "black";
        const angleRad = (angleDeg * Math.PI) / 180;
        const r = degreeRingRadius;
        const x = center + r * Math.cos(angleRad);
        const y = center + r * Math.sin(angleRad);
        ctx.save();
        ctx.font = "bold 16px Tahoma"; // Ø­Ø¬Ù… Ø£ÙƒØ¨Ø± Ù„Ù„Ù†Øµ
        ctx.fillStyle = getDegreeColor(reduced);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${degreeValue}Â°`, x, y);
        ctx.restore();
      }
    }
    if (showZodiacRing) {
      drawZodiacRing(ctx, center);
    }
    if (showWeekDaysRing) {
      drawWeekDaysRing(ctx, center);
    }
    
    // Ø±Ø³Ù… Ø§Ù„Ø¯ÙˆØ§Ø¦Ø± Ø§Ù„Ù…ØªØ¯Ø§Ø®Ù„Ø©
    if (showNestedCircles) {
      for (let i = 0; i < nestedCircleCount; i++) {
        const radius = nestedCircleGap * (i + 1);
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = nestedCircleColor;
        ctx.lineWidth = nestedStrokeWidth;
        ctx.stroke();
        ctx.restore();
        
        // Ø¥Ø¶Ø§ÙØ© ØªØ³Ù…ÙŠØ§Øª Ø§Ù„Ø¯ÙˆØ§Ø¦Ø± Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…Ø·Ù„ÙˆØ¨Ø©
        if (nestedCircleLabels) {
          ctx.save();
          ctx.font = "10px Arial";
          ctx.fillStyle = nestedCircleColor;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`R=${radius}`, center, center - radius - 4);
          ctx.restore();
        }
      }
    }
    
    console.log("Current selectedShape:", selectedShape);
        if (selectedShape && selectedShape !== "anglewheel" && selectedShape !== "circles") {
      // Ø±Ø³Ù… Ø§Ù„Ø£Ø´ÙƒØ§Ù„ Ø¹Ù„Ù‰ Ø­Ù„Ù‚Ø© Ø§Ù„Ø¯Ø±Ø¬Ø§Øª
      console.log("Drawing shape:", selectedShape, "at radius:", degreeRingRadius);
      
      // Ø­ÙØ¸ Ø§Ù„Ø³ÙŠØ§Ù‚ Ù‚Ø¨Ù„ Ø§Ù„Ø±Ø³Ù… ÙˆØ§Ø³ØªØ¹Ø§Ø¯ØªÙ‡ Ø¨Ø¹Ø¯ Ø§Ù„Ø§Ù†ØªÙ‡Ø§Ø¡
      ctx.save();
      drawShape(ctx, center, degreeRingRadius, selectedShape);
      
      // Ø±Ø³Ù… Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù„Ø§Ø«ÙŠØ© Ù…Ø¨Ø§Ø´Ø±Ø©
      if (selectedShape === "star3") {
        console.log("Drawing star3 directly in useEffect");
        
        const starRadius = degreeRingRadius;
        
        // Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù„Ø§Ø«ÙŠØ© Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ© {3/3} - 3 Ù…Ø«Ù„Ø«Ø§Øª Ø®Ø§Ø±Ø¬ÙŠØ© + Ù…Ø«Ù„Ø« Ù…Ø±ÙƒØ²ÙŠ
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 2;
        
        if (star3DrawMode === "lines") {
          // Ø±Ø³Ù… Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù„Ø§Ø«ÙŠØ© ÙƒÙ†Ø¬Ù…Ø© Ù…ØªØµÙ„Ø© Ù…Ù† Ø§Ù„Ù…Ø±ÙƒØ² Ø¥Ù„Ù‰ 3 Ù†Ù‚Ø§Ø· Ø®Ø§Ø±Ø¬ÙŠØ©
          // Ø«Ù… Ø±Ø¨Ø· Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© Ø¨Ø¨Ø¹Ø¶Ù‡Ø§ Ù„ØªÙƒÙˆÙŠÙ† Ù…Ø«Ù„Ø« Ø®Ø§Ø±Ø¬ÙŠ
          
          const outerRadius = starRadius;
          const innerRadius = starRadius * 0.3; // Ù†ØµÙ Ù‚Ø·Ø± Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©
          
          // Ø­Ø³Ø§Ø¨ Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© (Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø©)
          const outerPoints = [];
          for (let i = 0; i < 3; i++) {
            const angle = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
            const x = center + outerRadius * Math.cos(angle);
            const y = center + outerRadius * Math.sin(angle);
            outerPoints.push({ x, y });
          }
          
          // Ø­Ø³Ø§Ø¨ Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ© (Ø¨ÙŠÙ† ÙƒÙ„ Ø±Ø£Ø³ÙŠÙ†)
          const innerPoints = [];
          for (let i = 0; i < 3; i++) {
            const angle1 = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
            const angle2 = ((customStar3Angles[(i + 1) % 3]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
            
            // Ø§Ù„Ø²Ø§ÙˆÙŠØ© ÙÙŠ Ù…Ù†ØªØµÙ Ø§Ù„Ù…Ø³Ø§ÙØ© Ø¨ÙŠÙ† Ø§Ù„Ù†Ù‚Ø·ØªÙŠÙ† Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØªÙŠÙ†
            let midAngle = (angle1 + angle2) / 2;
            
            // ØªØµØ­ÙŠØ­ Ø§Ù„Ø²Ø§ÙˆÙŠØ© Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù‡Ù†Ø§Ùƒ ÙØ¬ÙˆØ© ÙƒØ¨ÙŠØ±Ø© (Ø¹Ø¨ÙˆØ± Ø§Ù„Ù€ 360 Ø¯Ø±Ø¬Ø©)
            if (Math.abs(angle2 - angle1) > Math.PI) {
              midAngle += Math.PI;
            }
            
            const x = center + innerRadius * Math.cos(midAngle);
            const y = center + innerRadius * Math.sin(midAngle);
            innerPoints.push({ x, y });
          }
          
          // Ø±Ø³Ù… Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù„Ø§Ø«ÙŠØ© Ø§Ù„Ù…ØªØµÙ„Ø©
          ctx.beginPath();
          
          // Ø§Ù„Ø¨Ø¯Ø¡ Ù…Ù† Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© Ø§Ù„Ø£ÙˆÙ„Ù‰
          ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
          
          // Ø±Ø³Ù… Ø§Ù„Ù†Ø¬Ù…Ø© Ø¨Ø§Ù„ØªÙ†Ù‚Ù„ Ø¨ÙŠÙ† Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© ÙˆØ§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©
          for (let i = 0; i < 3; i++) {
            const currentOuter = outerPoints[i];
            const nextInner = innerPoints[i];
            const nextOuter = outerPoints[(i + 1) % 3];
            
            // Ù…Ù† Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© Ø¥Ù„Ù‰ Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©
            ctx.lineTo(nextInner.x, nextInner.y);
            // Ù…Ù† Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ© Ø¥Ù„Ù‰ Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© Ø§Ù„ØªØ§Ù„ÙŠØ©
            ctx.lineTo(nextOuter.x, nextOuter.y);
          }
          
          ctx.closePath();
          ctx.stroke();
          
          // ØªØ¹Ø¨Ø¦Ø© Ø§Ù„Ù†Ø¬Ù…Ø© Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…ÙØ¹Ù„Ø©
          if (fillStar3) {
            ctx.fillStyle = "rgba(255, 215, 0, 0.3)";
            ctx.fill();
          }
          
          // Ø±Ø³Ù… Ø§Ù„Ù†Ù‚Ø§Ø· Ø¥Ø°Ø§ ÙƒØ§Ù† Ø§Ù„ØªÙ…ÙŠÙŠØ² Ù…ÙØ¹Ù„
          if (highlightStar3) {
            // Ù†Ù‚Ø§Ø· Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© (ØµÙØ±Ø§Ø¡)
            outerPoints.forEach((point, idx) => {
              ctx.beginPath();
              ctx.arc(point.x, point.y, 7, 0, 2 * Math.PI);
              // ØªØºÙŠÙŠØ± Ø§Ù„Ù„ÙˆÙ† Ø¹Ù†Ø¯ hover
              ctx.fillStyle = hoveredPointIndex === idx && selectedShape === "star3" ? "orange" : "yellow";
              ctx.fill();
              ctx.strokeStyle = "#000";
              ctx.lineWidth = 1;
              ctx.stroke();
            });
            
            // Ù†Ù‚Ø§Ø· Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ© (Ø¨Ø±ØªÙ‚Ø§Ù„ÙŠØ©)
            innerPoints.forEach((point, idx) => {
              ctx.beginPath();
              ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
              // ØªØºÙŠÙŠØ± Ø§Ù„Ù„ÙˆÙ† Ø¹Ù†Ø¯ hover (Ø¥Ø¶Ø§ÙØ© 3 Ù„Ù„ÙÙ‡Ø±Ø³ Ù„Ø£Ù† Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ© ØªØ£ØªÙŠ Ø¨Ø¹Ø¯ Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ©)
              ctx.fillStyle = hoveredPointIndex === (idx + 3) && selectedShape === "star3" ? "red" : "orange";
              ctx.fill();
              ctx.strokeStyle = "#000";
              ctx.lineWidth = 1;
              ctx.stroke();
            });
          }
          
        } else {
          // Ø±Ø³Ù… Ù…Ø«Ù„Ø« Ù…Ù†ØªØ¸Ù… ÙÙ‚Ø·
          const trianglePoints = [];
          for (let i = 0; i < 3; i++) {
            const angle = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
            const x = center + starRadius * Math.cos(angle);
            const y = center + starRadius * Math.sin(angle);
            trianglePoints.push({ x, y });
          }
          
          ctx.beginPath();
          ctx.moveTo(trianglePoints[0].x, trianglePoints[0].y);
          ctx.lineTo(trianglePoints[1].x, trianglePoints[1].y);
          ctx.lineTo(trianglePoints[2].x, trianglePoints[2].y);
          ctx.closePath();
          ctx.stroke();
          
          // ØªØ¹Ø¨Ø¦Ø© Ø§Ù„Ù…Ø«Ù„Ø«
          if (fillStar3) {
            ctx.fillStyle = "rgba(255, 215, 0, 0.3)";
            ctx.fill();
          }
          
          // Ø±Ø³Ù… Ù†Ù‚Ø§Ø· Ø§Ù„Ø±Ø¤ÙˆØ³
          if (highlightStar3) {
            trianglePoints.forEach((point, idx) => {
              ctx.beginPath();
              ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
              // ØªØºÙŠÙŠØ± Ø§Ù„Ù„ÙˆÙ† Ø¹Ù†Ø¯ hover
              ctx.fillStyle = hoveredPointIndex === idx && selectedShape === "star3" ? "orange" : "yellow";
              ctx.fill();
              ctx.strokeStyle = "#000";
              ctx.lineWidth = 1;
              ctx.stroke();
            });
          }
        }
        
        // Ø¹Ø±Ø¶ Ø§Ù„Ø²ÙˆØ§ÙŠØ§
        if (showStar3Angles) {
          if (star3DrawMode === "lines") {
            // Ø¹Ø±Ø¶ Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù„Ø§Ø«ÙŠØ© - Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© ÙˆØ§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©
            const outerAngles = customStar3Angles.map(angle => (angle + star3Rotation + settings.rotation - 90) % 360);
            
            // Ø±Ø³Ù… Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© (Ø±Ø¤ÙˆØ³ Ø§Ù„Ù†Ø¬Ù…Ø©)
            outerAngles.forEach((angle, i) => {
              ctx.save();
              ctx.fillStyle = "#006400";
              ctx.font = "bold 18px Arial";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.strokeStyle = "#FFFFFF";
              ctx.lineWidth = 3;
              
              const textOffset = 30;
              const textAngle = (angle - 90) * Math.PI / 180;
              const textX = center + (starRadius + textOffset) * Math.cos(textAngle);
              const textY = center + (starRadius + textOffset) * Math.sin(textAngle);
              
              // Ø±Ø³Ù… Ø­Ø¯ÙˆØ¯ Ø¨ÙŠØ¶Ø§Ø¡ Ù„Ù„Ù†Øµ Ù„Ø¬Ø¹Ù„Ù‡ Ø£ÙƒØ«Ø± ÙˆØ¶ÙˆØ­Ø§Ù‹
              ctx.strokeText(`${angle.toFixed(0)}Â°`, textX, textY);
              ctx.fillText(`${angle.toFixed(0)}Â°`, textX, textY);
              ctx.restore();
            });
            
            // Ø±Ø³Ù… Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©
            for (let i = 0; i < 3; i++) {
              const angle1 = ((customStar3Angles[i]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
              const angle2 = ((customStar3Angles[(i + 1) % 3]) + star3Rotation + settings.rotation - 90) * Math.PI / 180;
              
              let midAngle = (angle1 + angle2) / 2;
              if (Math.abs(angle2 - angle1) > Math.PI) {
                midAngle += Math.PI;
              }
              
              const innerAngle = (midAngle * 180 / Math.PI) % 360;
              
              ctx.save();
              ctx.fillStyle = "#228B22";
              ctx.font = "bold 15px Arial";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.strokeStyle = "#FFFFFF";
              ctx.lineWidth = 2;
              
              const textOffset = 20;
              const innerRadius = starRadius * 0.3;
              const textX = center + (innerRadius + textOffset) * Math.cos(midAngle);
              const textY = center + (innerRadius + textOffset) * Math.sin(midAngle);
              
              // Ø±Ø³Ù… Ø­Ø¯ÙˆØ¯ Ø¨ÙŠØ¶Ø§Ø¡ Ù„Ù„Ù†Øµ Ù„Ø¬Ø¹Ù„Ù‡ Ø£ÙƒØ«Ø± ÙˆØ¶ÙˆØ­Ø§Ù‹
              ctx.strokeText(`${innerAngle.toFixed(0)}Â°`, textX, textY);
              ctx.fillText(`${innerAngle.toFixed(0)}Â°`, textX, textY);
              ctx.restore();
            }
          } else {
            // Ø¹Ø±Ø¶ Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ù…Ø«Ù„Ø« Ø§Ù„Ø¨Ø³ÙŠØ·
            const angles = customStar3Angles.map(angle => (angle + star3Rotation + settings.rotation) % 360);
              
            angles.forEach((angle, i) => {
              ctx.save();
              ctx.fillStyle = "#006400";
              ctx.font = "bold 16px Arial";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.strokeStyle = "#FFFFFF";
              ctx.lineWidth = 3;
              
              const textOffset = 30;
              const textAngle = (angle - 90) * Math.PI / 180;
              const textX = center + (starRadius + textOffset) * Math.cos(textAngle);
              const textY = center + (starRadius + textOffset) * Math.sin(textAngle);
              
              // Ø±Ø³Ù… Ø­Ø¯ÙˆØ¯ Ø¨ÙŠØ¶Ø§Ø¡ Ù„Ù„Ù†Øµ Ù„Ø¬Ø¹Ù„Ù‡ Ø£ÙƒØ«Ø± ÙˆØ¶ÙˆØ­Ø§Ù‹
              ctx.strokeText(`${angle.toFixed(0)}Â°`, textX, textY);
              ctx.fillText(`${angle.toFixed(0)}Â°`, textX, textY);
              ctx.restore();
            });
          }
        }
        
        console.log("Star3 drawing completed");
      }
      
      ctx.restore();
    }
    ctx.restore();
    
    // ØªØ¹Ø±ÙŠÙ Ø¯ÙˆØ§Ù„ Ø§Ù„Ù†Ù‚Ø± Ø¹Ù„Ù‰ Ø§Ù„Ø®Ù„Ø§ÙŠØ§ Ø¯Ø§Ø®Ù„ useEffect
    function onCellClick(e) {
      // Ù…Ù†Ø¹ ØªØºÙŠÙŠØ± Ø£Ù„ÙˆØ§Ù† Ø§Ù„Ø®Ù„Ø§ÙŠØ§ Ø£Ø«Ù†Ø§Ø¡ Ø£Ùˆ Ø¨Ø¹Ø¯ Ø§Ù„Ø³Ø­Ø¨ Ù…Ø¨Ø§Ø´Ø±Ø©
      if (isDraggingTriangle || isDraggingSquare || isDraggingStar4 || isDraggingPentagon || 
          isDraggingStar3 || isDraggingStar5 || isDraggingHexagon || isDraggingStar6 || 
          isDraggingHeptagon || isDraggingStar7 || isDraggingOctagon || isDraggingStar8 || 
          isDraggingNonagon || isDraggingStar9 || isDraggingDecagon || isDraggingStar10 || 
          isDraggingHendecagon || isDraggingStar11 || isDraggingDodecagon || isDraggingStar12 || 
          isDraggingAngleWheel || recentlyDragged) {
        console.log("ðŸš« Cell click blocked - shape is being dragged or recently dragged");
        return; // Ù…Ù†Ø¹ ØªØºÙŠÙŠØ± Ø£Ù„ÙˆØ§Ù† Ø§Ù„Ø®Ù„Ø§ÙŠØ§ Ø£Ø«Ù†Ø§Ø¡ Ø£Ùˆ Ø¨Ø¹Ø¯ Ø§Ù„Ø³Ø­Ø¨
      }
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // ØªØ­ÙˆÙŠÙ„ Ø¥Ø­Ø¯Ø§Ø«ÙŠØ§Øª Ø§Ù„Ù…Ø§ÙˆØ³ Ù…Ø¹ Ù…Ø±Ø§Ø¹Ø§Ø© scale
      const canvasMouseX = mouseX / scale;
      const canvasMouseY = mouseY / scale;
      
      const center = canvasSize / 2;
      const distance = Math.sqrt(Math.pow(canvasMouseX - center, 2) + Math.pow(canvasMouseY - center, 2));
      
      // Ø­Ø³Ø§Ø¨ Ø£Ø±Ù‚Ø§Ù… Ø§Ù„Ø¨Ø¯Ø§ÙŠØ© Ù„ÙƒÙ„ Ø­Ù„Ù‚Ø©
      // Ø¥Ø¶Ø§ÙØ© 2 Ø­Ù„Ù‚Ø§Øª Ø¥Ø¶Ø§ÙÙŠØ© (Ø§Ù„Ø£ÙˆÙ„Ù‰ ÙˆØ§Ù„Ø«Ø§Ù†ÙŠØ©) Ù„Ù„Ø­Ù„Ù‚Ø§Øª Ø§Ù„Ù…Ø±Ù‚Ù…Ø©
      const totalLevels = settings.levels + 2;
      const ringStartNumbers = calculateRingStartNumbers(settings.startValue, totalLevels, settings.divisions);
      
      // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ù†Ù‚Ø± Ø¯Ø§Ø®Ù„ Ù…Ù†Ø·Ù‚Ø© Ø§Ù„Ø­Ù„Ù‚Ø§Øª Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ©
      for (let level = 0; level < totalLevels; level++) {
        const maxDigitsInLevel = Math.max(
          ...Array.from({ length: settings.divisions }, (_, i) => {
            const cellValue = getCellValue(level, i, ringStartNumbers);
            return cellValue > 0 ? parseFloat(cellValue.toFixed(2)).toString().length : 1;
          })
        );
        const dynamicWidth = calculateRingWidth(maxDigitsInLevel);
        const r1 = innerRadius + [...Array(level)].reduce((acc, _, l) => {
          const maxDigits = Math.max(
            ...Array.from({ length: settings.divisions }, (_, i) => {
              const cellValue = getCellValue(l, i, ringStartNumbers);
              return cellValue > 0 ? parseFloat(cellValue.toFixed(2)).toString().length : 1;
            })
          );
          return acc + calculateRingWidth(maxDigits);
        }, 0);
        const r2 = r1 + dynamicWidth;
        
        // Ø¥Ø¶Ø§ÙØ© Ù‡Ø§Ù…Ø´ ØµØºÙŠØ± Ù„Ù„Ø¯Ù‚Ø© ÙÙŠ Ø§Ù„Ù†Ù‚Ø±
        const clickMargin = 2;
        
        // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø£Ù† Ø§Ù„Ù†Ù‚Ø±Ø© Ø¯Ø§Ø®Ù„ Ù‡Ø°Ù‡ Ø§Ù„Ø­Ù„Ù‚Ø© (Ù…Ø¹ Ø§Ù„Ù‡Ø§Ù…Ø´)
        if (distance >= (r1 - clickMargin) && distance <= (r2 + clickMargin)) {
          // Ø­Ø³Ø§Ø¨ Ø§Ù„Ø²Ø§ÙˆÙŠØ© Ù…Ø¹ Ù†ÙØ³ Ø§Ù„Ù…Ù†Ø·Ù‚ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ÙÙŠ Ø§Ù„Ø±Ø³Ù…
          const angle = Math.atan2(canvasMouseY - center, canvasMouseX - center);
          // ØªØ­ÙˆÙŠÙ„ Ø§Ù„Ø²Ø§ÙˆÙŠØ© Ø¥Ù„Ù‰ Ø¯Ø±Ø¬Ø§Øª (ÙÙŠ Ù†Ø·Ø§Ù‚ 0-360)
          let mouseAngleDeg = (angle * 180 / Math.PI + 360) % 360;
          
          // Ø­Ø³Ø§Ø¨ ÙÙ‡Ø±Ø³ Ø§Ù„Ø®Ù„ÙŠØ©
          const anglePerCell = 360 / settings.divisions;
          
          // ÙÙŠ Ø§Ù„Ø±Ø³Ù…: Ø§Ù„Ø®Ù„ÙŠØ© index ØªÙ‚Ø¹ ÙÙŠ Ø§Ù„Ø²Ø§ÙˆÙŠØ© (index + 1) * anglePerCell - 90 + settings.rotation
          // Ù„Ø°Ø§ Ù†Ø­ØªØ§Ø¬ Ù„Ø¥ÙŠØ¬Ø§Ø¯ Ø§Ù„Ø®Ù„ÙŠØ© Ø§Ù„Ø£Ù‚Ø±Ø¨ Ù„Ø²Ø§ÙˆÙŠØ© Ø§Ù„Ù…Ø§ÙˆØ³
          
          // ØªØ­ÙˆÙŠÙ„ Ø²Ø§ÙˆÙŠØ© Ø§Ù„Ù…Ø§ÙˆØ³ Ø¥Ù„Ù‰ Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ÙÙŠ Ø§Ù„Ø±Ø³Ù…
          let adjustedMouseAngle = (mouseAngleDeg + 90 - settings.rotation + 360) % 360;
          
          // Ø§Ù„Ø¢Ù† Ù†Ø­Ø³Ø¨ Ø£ÙŠ Ø®Ù„ÙŠØ© ØªØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ù‡Ø°Ù‡ Ø§Ù„Ø²Ø§ÙˆÙŠØ©
          // Ø§Ù„Ø®Ù„ÙŠØ© index ØªØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù†Ø·Ù‚Ø© Ø­ÙˆÙ„ (index + 1) * anglePerCell
          let cellIndex = Math.round(adjustedMouseAngle / anglePerCell) - 1;
          cellIndex = (cellIndex + settings.divisions) % settings.divisions;
          
          // ØªØ³Ø¬ÙŠÙ„ ØªÙØµÙŠÙ„ÙŠ Ù„Ù„ØªØ·ÙˆÙŠØ±
          console.log(`ðŸ” Debug Click - MouseAngle: ${mouseAngleDeg.toFixed(1)}Â°, AdjustedAngle: ${adjustedMouseAngle.toFixed(1)}Â°, AnglePerCell: ${anglePerCell.toFixed(1)}Â°, CalculatedIndex: ${cellIndex}`);
          
          // Ù…ÙØªØ§Ø­ ÙØ±ÙŠØ¯ Ù„Ù„Ø®Ù„ÙŠØ©
          const cellKey = `${level}-${cellIndex}`;
          
          // ØªØ­Ø¯ÙŠØ« Ø¹Ø¯Ø¯ Ø§Ù„Ù†Ù‚Ø±Ø§Øª Ù…Ø¹ Ø¥Ø¶Ø§ÙØ© ØªØ£ÙƒÙŠØ¯ ÙÙŠ ÙˆØ­Ø¯Ø© Ø§Ù„ØªØ­ÙƒÙ… Ù„Ù„ØªØ·ÙˆÙŠØ±
          setCellClickCounts(prev => {
            const currentClicks = prev[cellKey] || 0;
            const newClicks = (currentClicks + 1) % 5; // 0-4 Ø¯ÙˆØ±Ø©
            console.log(`ðŸŽ¯ Cell clicked: Level ${level}, Index ${cellIndex}, Clicks: ${newClicks}, MouseAngle: ${mouseAngleDeg.toFixed(1)}Â°, CellAngle: ${((cellIndex + 1) * anglePerCell - 90 + settings.rotation + 360) % 360}Â°`);
            return {
              ...prev,
              [cellKey]: newClicks
            };
          });
          
          break;
        }
      }
    }

    // Ø¯Ø§Ù„Ø© Ù„Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ double click (Ø¥Ø±Ø¬Ø§Ø¹ Ù„Ù„ÙˆÙ† Ø§Ù„Ø£ØµÙ„ÙŠ)
    function onCellDoubleClick(e) {
      // Ù…Ù†Ø¹ ØªØºÙŠÙŠØ± Ø£Ù„ÙˆØ§Ù† Ø§Ù„Ø®Ù„Ø§ÙŠØ§ Ø£Ø«Ù†Ø§Ø¡ Ø£Ùˆ Ø¨Ø¹Ø¯ Ø§Ù„Ø³Ø­Ø¨ Ù…Ø¨Ø§Ø´Ø±Ø©
      if (isDraggingTriangle || isDraggingSquare || isDraggingStar4 || isDraggingPentagon || 
          isDraggingStar3 || isDraggingStar5 || isDraggingHexagon || isDraggingStar6 || 
          isDraggingHeptagon || isDraggingStar7 || isDraggingOctagon || isDraggingStar8 || 
          isDraggingNonagon || isDraggingStar9 || isDraggingDecagon || isDraggingStar10 || 
          isDraggingHendecagon || isDraggingStar11 || isDraggingDodecagon || isDraggingStar12 || 
          isDraggingAngleWheel || recentlyDragged) {
        console.log("ðŸš« Cell double-click blocked - shape is being dragged or recently dragged");
        return; // Ù…Ù†Ø¹ ØªØºÙŠÙŠØ± Ø£Ù„ÙˆØ§Ù† Ø§Ù„Ø®Ù„Ø§ÙŠØ§ Ø£Ø«Ù†Ø§Ø¡ Ø£Ùˆ Ø¨Ø¹Ø¯ Ø§Ù„Ø³Ø­Ø¨
      }
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const canvasMouseX = mouseX / scale;
      const canvasMouseY = mouseY / scale;
      
      const center = canvasSize / 2;
      const distance = Math.sqrt(Math.pow(canvasMouseX - center, 2) + Math.pow(canvasMouseY - center, 2));
      
      // Ø­Ø³Ø§Ø¨ Ø£Ø±Ù‚Ø§Ù… Ø§Ù„Ø¨Ø¯Ø§ÙŠØ© Ù„ÙƒÙ„ Ø­Ù„Ù‚Ø©
      // Ø¥Ø¶Ø§ÙØ© 2 Ø­Ù„Ù‚Ø§Øª Ø¥Ø¶Ø§ÙÙŠØ© (Ø§Ù„Ø£ÙˆÙ„Ù‰ ÙˆØ§Ù„Ø«Ø§Ù†ÙŠØ©) Ù„Ù„Ø­Ù„Ù‚Ø§Øª Ø§Ù„Ù…Ø±Ù‚Ù…Ø©
      const totalLevels = settings.levels + 2;
      const ringStartNumbers = calculateRingStartNumbers(settings.startValue, totalLevels, settings.divisions);
      
      // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ù†Ù‚Ø± Ø¯Ø§Ø®Ù„ Ù…Ù†Ø·Ù‚Ø© Ø§Ù„Ø­Ù„Ù‚Ø§Øª Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ©
      for (let level = 0; level < totalLevels; level++) {
        const maxDigitsInLevel = Math.max(
          ...Array.from({ length: settings.divisions }, (_, i) => {
            const cellValue = getCellValue(level, i, ringStartNumbers);
            return cellValue > 0 ? parseFloat(cellValue.toFixed(2)).toString().length : 1;
          })
        );
        const dynamicWidth = calculateRingWidth(maxDigitsInLevel);
        const r1 = innerRadius + [...Array(level)].reduce((acc, _, l) => {
          const maxDigits = Math.max(
            ...Array.from({ length: settings.divisions }, (_, i) => {
              const cellValue = getCellValue(l, i, ringStartNumbers);
              return cellValue > 0 ? parseFloat(cellValue.toFixed(2)).toString().length : 1;
            })
          );
          return acc + calculateRingWidth(maxDigits);
        }, 0);
        const r2 = r1 + dynamicWidth;
        
        // Ø¥Ø¶Ø§ÙØ© Ù‡Ø§Ù…Ø´ ØµØºÙŠØ± Ù„Ù„Ø¯Ù‚Ø© ÙÙŠ Ø§Ù„Ù†Ù‚Ø±
        const clickMargin = 2;
        
        if (distance >= (r1 - clickMargin) && distance <= (r2 + clickMargin)) {
          // Ø­Ø³Ø§Ø¨ Ø§Ù„Ø²Ø§ÙˆÙŠØ© Ù…Ø¹ Ù†ÙØ³ Ø§Ù„Ù…Ù†Ø·Ù‚ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ÙÙŠ Ø§Ù„Ø±Ø³Ù…
          const angle = Math.atan2(canvasMouseY - center, canvasMouseX - center);
          // ØªØ­ÙˆÙŠÙ„ Ø§Ù„Ø²Ø§ÙˆÙŠØ© Ø¥Ù„Ù‰ Ø¯Ø±Ø¬Ø§Øª (ÙÙŠ Ù†Ø·Ø§Ù‚ 0-360)
          let mouseAngleDeg = (angle * 180 / Math.PI + 360) % 360;
          
          // Ø­Ø³Ø§Ø¨ ÙÙ‡Ø±Ø³ Ø§Ù„Ø®Ù„ÙŠØ©
          const anglePerCell = 360 / settings.divisions;
          
          // ÙÙŠ Ø§Ù„Ø±Ø³Ù…: Ø§Ù„Ø®Ù„ÙŠØ© index ØªÙ‚Ø¹ ÙÙŠ Ø§Ù„Ø²Ø§ÙˆÙŠØ© (index + 1) * anglePerCell - 90 + settings.rotation
          // Ù„Ø°Ø§ Ù†Ø­ØªØ§Ø¬ Ù„Ø¥ÙŠØ¬Ø§Ø¯ Ø§Ù„Ø®Ù„ÙŠØ© Ø§Ù„Ø£Ù‚Ø±Ø¨ Ù„Ø²Ø§ÙˆÙŠØ© Ø§Ù„Ù…Ø§ÙˆØ³
          
          // ØªØ­ÙˆÙŠÙ„ Ø²Ø§ÙˆÙŠØ© Ø§Ù„Ù…Ø§ÙˆØ³ Ø¥Ù„Ù‰ Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ÙÙŠ Ø§Ù„Ø±Ø³Ù…
          let adjustedMouseAngle = (mouseAngleDeg + 90 - settings.rotation + 360) % 360;
          
          // Ø§Ù„Ø¢Ù† Ù†Ø­Ø³Ø¨ Ø£ÙŠ Ø®Ù„ÙŠØ© ØªØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ù‡Ø°Ù‡ Ø§Ù„Ø²Ø§ÙˆÙŠØ©
          // Ø§Ù„Ø®Ù„ÙŠØ© index ØªØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù†Ø·Ù‚Ø© Ø­ÙˆÙ„ (index + 1) * anglePerCell
          let cellIndex = Math.round(adjustedMouseAngle / anglePerCell) - 1;
          cellIndex = (cellIndex + settings.divisions) % settings.divisions;
          
          // ØªØ³Ø¬ÙŠÙ„ ØªÙØµÙŠÙ„ÙŠ Ù„Ù„ØªØ·ÙˆÙŠØ±
          console.log(`ðŸ” Debug DoubleClick - MouseAngle: ${mouseAngleDeg.toFixed(1)}Â°, AdjustedAngle: ${adjustedMouseAngle.toFixed(1)}Â°, AnglePerCell: ${anglePerCell.toFixed(1)}Â°, CalculatedIndex: ${cellIndex}`);
          
          const cellKey = `${level}-${cellIndex}`;
          
          // Ø¥Ø±Ø¬Ø§Ø¹ Ù„Ù„ÙˆÙ† Ø§Ù„Ø£ØµÙ„ÙŠ (Ø­Ø°Ù Ù…Ù† state) Ù…Ø¹ ØªØ£ÙƒÙŠØ¯ ÙÙŠ ÙˆØ­Ø¯Ø© Ø§Ù„ØªØ­ÙƒÙ…
          console.log(`ðŸŽ¯ Cell double-clicked: Level ${level}, Index ${cellIndex}, Reset color, MouseAngle: ${mouseAngleDeg.toFixed(1)}Â°, CellAngle: ${((cellIndex + 1) * anglePerCell - 90 + settings.rotation + 360) % 360}Â°`);
          setCellClickCounts(prev => {
            const newState = { ...prev };
            delete newState[cellKey];
            return newState;
          });
          
          break;
        }
      }
    }
    
    // ØªØ³Ø¬ÙŠÙ„ Ù…Ø³ØªÙ…Ø¹Ø§Øª Ø§Ù„Ø£Ø­Ø¯Ø§Ø« Ù„Ù„Ù†Ù‚Ø± Ø¹Ù„Ù‰ Ø§Ù„Ø®Ù„Ø§ÙŠØ§ ÙÙ‚Ø·
    canvas.addEventListener("click", onCellClick);
    canvas.addEventListener("dblclick", onCellDoubleClick);
    
    // ØªÙ†Ø¸ÙŠÙ Ù…Ø³ØªÙ…Ø¹Ø§Øª Ø§Ù„Ø£Ø­Ø¯Ø§Ø« Ø¹Ù†Ø¯ Ø¥Ù„ØºØ§Ø¡ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…ÙƒÙˆÙ†
    return () => {
      canvas.removeEventListener("click", onCellClick);
      canvas.removeEventListener("dblclick", onCellDoubleClick);
    };
  },
  
  [
  settings,
  scale,
  showZodiacRing,
  showWeekDaysRing,
  showDegreeRing,
  showAngleWheel,
  angleWheelRotation,
  angleStepRad,
  rayColor,
  rayWidth,
  selectedShape,
  canvasSize,
  triangleRotation,
  customAngles,
  highlightTriangle,
  fillTriangle,
  hoveredPointIndex,
  showNestedCircles,
  nestedCircleCount,
  nestedCircleGap,
  nestedCircleColor,
  nestedStrokeWidth,
  nestedCircleLabels,
  // Square states
  squareRotation,
  customSquareAngles,
  fillSquare,
  highlightSquare,
  showSquareAngles,
  // Star 4 states
  star4Rotation,
  customStar4Angles,
  fillStar4,
  highlightStar4,
  showStar4Angles,
  // Star 3 states
  star3Rotation,
  customStar3Angles,
  fillStar3,
  highlightStar3,
  showStar3Angles,
  star3DrawMode,
  // Pentagon states
  pentagonRotation,
  customPentagonAngles,
  fillPentagon,
  highlightPentagon,
  showPentagonAngles,
  // Star 5 states
  star5Rotation,
  customPentagonAngles,
  fillStar5,
  highlightStar5,
  showStar5Angles,
  // Hexagon states
  hexagonRotation,
  customHexagonAngles,
  fillHexagon,
  highlightHexagon,
  showHexagonAngles,
  // Star 6 states
  star6Rotation,
  customHexagonAngles,
  fillStar6,
  highlightStar6,
  showStar6Angles,
  // Heptagon states
  heptagonRotation,
  fillHeptagon,
  highlightHeptagon,
  // Star 7 states
  star7Rotation,
  fillStar7,
  highlightStar7,
  showStar7Angles,
  // Octagon states
  octagonRotation,
  customOctagonAngles,
  fillOctagon,
  highlightOctagon,
  // Star 8 states
  star8Rotation,
  customOctagonAngles,
  fillStar8,
  highlightStar8,
  showStar8Angles,
  // Nonagon states
  nonagonRotation,
  fillNonagon,
  highlightNonagon,
  // Star 9 states
  star9Rotation,
  fillStar9,
  highlightStar9,
  showStar9Angles,
  // Decagon states
  decagonRotation,
  fillDecagon,
  highlightDecagon,
  // Star 10 states
  star10Rotation,
  fillStar10,
  highlightStar10,
  showStar10Angles,
  // Hendecagon states
  hendecagonRotation,
  fillHendecagon,
  highlightHendecagon,
  showHendecagonAngles,
  // Star 11 states
  star11Rotation,
  fillStar11,
  highlightStar11,
  showStar11Angles,
  // Dodecagon states
  dodecagonRotation,
  fillDodecagon,
  highlightDodecagon,
  showDodecagonAngles,
  // Star 12 states
  star12Rotation,
  fillStar12,
  highlightStar12,
  showStar12Angles,
  // Cell click states
  cellClickCounts,
  recentlyDragged,
  // Dragging states
  isDraggingTriangle,
  isDraggingSquare,
  isDraggingStar4,
  isDraggingPentagon,
  isDraggingStar3,
  isDraggingStar5,
  isDraggingHexagon,
  isDraggingStar6,
  isDraggingHeptagon,
  isDraggingStar7,
  isDraggingOctagon,
  isDraggingStar8,
  isDraggingNonagon,
  isDraggingStar9,
  isDraggingDecagon,
  isDraggingStar10,
  isDraggingHendecagon,
  isDraggingStar11,
  isDraggingDodecagon,
  isDraggingStar12,
  isDraggingAngleWheel,
  // Digital clock states
  currentTime,
  timeZone,
  showDigitalClock,
  ]);

  // --- JSX Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ ---
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#111",
      }}
    >
      {/* Ø§Ù„Ù‚Ø³Ù… Ø§Ù„Ø¹Ù„ÙˆÙŠ: Ø§Ù„Ø¹Ù†ÙˆØ§Ù† ÙˆØ§Ù„Ø£Ø²Ø±Ø§Ø± */}
      <div style={{ padding: 10, flexShrink: 0 }}>
        {showZoomControls && (
          <div
            style={{
              position: "fixed",
              top: "220px",
              right: "10px",
              backgroundColor: "#222",
              border: "1px solid #FFD700",
              borderRadius: "10px",
              padding: "10px",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <button
              onClick={() => setScale((prev) => Math.min(prev + 0.1, 2))}
              style={{ ...buttonStyle, padding: "6px 12px", fontSize: "13px" }}
            >
              âž• {settings.language === "ar" ? "ØªÙƒØ¨ÙŠØ±" : "Zoom In"}
            </button>
            <button
              onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.1))}
              style={{ ...buttonStyle, padding: "6px 12px", fontSize: "13px" }}
            >
              âž– {settings.language === "ar" ? "ØªØµØºÙŠØ±" : "Zoom Out"}
            </button>
            <div style={{ fontSize: "11px", color: "#FFD700", marginTop: "4px" }}>
              {(scale * 100).toFixed(0)}%
            </div>
          </div>
        )}

        <div style={{
          position: "absolute",
          top: "2px",
          right: "2px",
          display: "flex",
          alignItems: "center",


          padding: "8px 16px",
          borderRadius: "10px",
          zIndex: 10,
        }}>
          <span
            style={{
              color: "#FFD700",
              fontSize: 20,
              fontWeight: "bold",
              whiteSpace: "nowrap",
            }}
          >
            
          </span>
          <button onClick={toggleLang} style={{ ...buttonStyle, fontSize: 13 }}>
            ðŸŒ {settings.language === "ar" ? "English" : "Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©"}
          </button>
        </div>



        {/* Ø§Ù„Ø¨ÙˆÙƒØ³ Ø§Ù„Ø®Ø§Øµ Ø¨Ø§Ù„Ø§Ø¹Ø¯Ø§Ø¯Ø§Øª */}
        <div style={{
          position: "absolute",
          top: "160px",
          left: "0px",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          backgroundColor: "#222",
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid #FFD700",
          zIndex: 10,
        }}>
          <button
            onClick={() => setShowSettings((v) => !v)}
            style={{
              position: "fixed",
              top: "120px",
              left: "20px",
              width: "25px",
              height: "25px",
              borderRadius: "50%",
              backgroundColor: "#ffcc00",
              color: "#000",
              fontSize: "10px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 10px #000",
              zIndex: 9999
            }}
            title={showSettings ? "Ø¥Ø®ÙØ§Ø¡ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª" : "Ø¹Ø±Ø¶ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª"}
          >
            {showSettings ? "âŒ" : "âš™ï¸"}
          </button>

          <button
            onClick={() => setShowZoomControls((prev) => !prev)}
            style={{
              position: "fixed",
              top: "180px",
              right: "10px",
              zIndex: 10000,
              backgroundColor: "#222",
              color: "#FFD700",
              border: "1px solid #FFD700",
              borderRadius: "8px",
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            {showZoomControls
              ? (settings.language === "ar" ? "Ø¥Ø®ÙØ§Ø¡ ðŸ”½" : "Hide ðŸ”½")
              : (settings.language === "ar" ? "Ø§Ù„ØªÙƒØ¨ÙŠØ± ðŸ”" : "Zoom ðŸ”")}
          </button>

          {showSettings && (
            <>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <button onClick={handleExportPNG}>ðŸ“· Ø¬ÙØ¸ Ø§Ù„ØµÙˆØ±Ø©</button>
                <button onClick={handleExportPDF}>ðŸ“„ Ø·Ø¨Ø§Ø¹Ø© PDF</button>
                <button 
                  onClick={() => setTimeZone(timeZone === 'utc' ? 'riyadh' : 'utc')}
                  style={{ 
                    padding: "8px 12px", 
                    backgroundColor: timeZone === 'utc' ? '#2196F3' : '#FF9800', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ðŸ• {timeZone === 'utc' ? 'UTC' : 'KSA'}
                </button>
                <button 
                  onClick={() => setShowDigitalClock(!showDigitalClock)}
                  style={{ 
                    padding: "8px 12px", 
                    backgroundColor: showDigitalClock ? '#4CAF50' : '#f44336', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ðŸ•’ {showDigitalClock ? 'Ø¥Ø®ÙØ§Ø¡ Ø§Ù„Ø³Ø§Ø¹Ø©' : 'Ø¹Ø±Ø¶ Ø§Ù„Ø³Ø§Ø¹Ø©'}
                </button>
              </div>

              {/* Ù‚ÙˆØ§Ø¦Ù… Ø§Ù„Ø£Ø³ÙˆØ§Ù‚ Ø§Ù„Ù…Ø§Ù„ÙŠØ© - ØªØ¸Ù‡Ø± ØªØ­Øª Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ© */}
              <div className="gann-market-main-panel">
                <h3 className="gann-market-title">
                  ðŸ“Š Ø¯Ø§Ø¦Ø±Ø© Ø¬Ø§Ù† 360 + Ø§Ù„Ø£Ø³ÙˆØ§Ù‚ Ø§Ù„Ù…Ø§Ù„ÙŠØ©
                </h3>
                
                {/* Ø±Ø³Ø§Ù„Ø© ØªØ­Ù‚Ù‚ - Ù„Ù„ØªØ£ÙƒØ¯ Ù…Ù† Ø¹Ù…Ù„ Ø§Ù„ØµÙØ­Ø© */}
                <div style={{ 
                  marginBottom: '10px', 
                  padding: '8px', 
                  backgroundColor: 'rgba(0, 255, 0, 0.1)', 
                  border: '1px solid #00FF00', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  textAlign: 'center',
                  color: '#00FF00'
                }}>
                  âœ… Ø§Ù„Ù‚ÙˆØ§Ø¦Ù… Ø¬Ø§Ù‡Ø²Ø© - Ø¬Ø±Ø¨ Ø§Ù„Ù†Ù‚Ø± Ø¹Ù„Ù‰ Ø§Ù„Ø£Ø²Ø±Ø§Ø± Ø£Ø¯Ù†Ø§Ù‡
                </div>
                
                {/* Ø§Ù„Ù‚ÙˆØ§Ø¦Ù… Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© */}
                <div className="gann-market-buttons-grid">
                  <button 
                    onClick={() => {
                      console.log('Ø§Ù„Ø£Ø³ÙˆØ§Ù‚ Ø§Ù„Ù…Ø§Ù„ÙŠØ© ØªÙ… Ø§Ù„Ù†Ù‚Ø±'); // Ù„Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø¹Ù…Ù„ Ø§Ù„Ù†Ù‚Ø±
                      setShowMarketDataPanel(!showMarketDataPanel);
                    }}
                    className={`gann-market-button ${showMarketDataPanel ? 'active' : ''}`}
                    style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                  >
                    ðŸ“Š Ø§Ù„Ø£Ø³ÙˆØ§Ù‚ Ø§Ù„Ù…Ø§Ù„ÙŠØ©
                  </button>
                  
                  <button 
                    onClick={() => {
                      console.log('Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø§Ù„ÙÙ†ÙŠ ØªÙ… Ø§Ù„Ù†Ù‚Ø±');
                      setShowTechnicalAnalysis(!showTechnicalAnalysis);
                    }}
                    className={`gann-market-button ${showTechnicalAnalysis ? 'active' : ''}`}
                    style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                  >
                    ðŸ“ˆ Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø§Ù„ÙÙ†ÙŠ
                  </button>

                  <button 
                    onClick={() => {
                      console.log('Ø§Ù„ØªÙ„ÙˆÙŠÙ† ØªÙ… Ø§Ù„Ù†Ù‚Ø±');
                      setPriceBasedColoring(!priceBasedColoring);
                    }}
                    className={`gann-market-button ${priceBasedColoring ? 'danger' : ''}`}
                    style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                  >
                    ðŸŽ¨ {priceBasedColoring ? 'Ø¥Ù„ØºØ§Ø¡ Ø§Ù„ØªÙ„ÙˆÙŠÙ†' : 'ØªÙØ¹ÙŠÙ„ Ø§Ù„ØªÙ„ÙˆÙŠÙ†'}
                  </button>

                  <button 
                    onClick={() => {
                      console.log('Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ØªÙ… Ø§Ù„Ù†Ù‚Ø±');
                      setShowMarketOverlay(!showMarketOverlay);
                    }}
                    className={`gann-market-button ${showMarketOverlay ? 'danger' : ''}`}
                    style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                  >
                    ðŸ”— {showMarketOverlay ? 'Ø¥Ø®ÙØ§Ø¡ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª' : 'Ø¹Ø±Ø¶ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª'}
                  </button>

                  <button 
                    onClick={() => {
                      console.log('Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª ØªÙ… Ø§Ù„Ù†Ù‚Ø±');
                      setShowMarketSettings(!showMarketSettings);
                    }}
                    className={`gann-market-button ${showMarketSettings ? 'danger' : ''}`}
                    style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                  >
                    âš™ï¸ {showMarketSettings ? 'Ø¥Ø®ÙØ§Ø¡ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª' : 'Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø³ÙˆÙ‚'}
                  </button>
                </div>

                {/* Ø£Ø²Ø±Ø§Ø± Ø¨Ø¯ÙŠÙ„Ø© Ø¨Ø³ÙŠØ·Ø© - ÙÙŠ Ø­Ø§Ù„Ø© Ø¹Ø¯Ù… Ø¹Ù…Ù„ Ø§Ù„Ø£Ø²Ø±Ø§Ø± Ø£Ø¹Ù„Ø§Ù‡ */}
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Ø²Ø± Ø¨Ø¯ÙŠÙ„ - Ø§Ù„Ø£Ø³ÙˆØ§Ù‚ Ø§Ù„Ù…Ø§Ù„ÙŠØ©');
                      setShowMarketDataPanel(!showMarketDataPanel);
                    }}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: showMarketDataPanel ? '#4CAF50' : '#333',
                      color: showMarketDataPanel ? 'white' : '#FFD700',
                      border: '1px solid #FFD700',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ðŸ“Š Ø§Ù„Ø£Ø³ÙˆØ§Ù‚
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Ø²Ø± Ø¨Ø¯ÙŠÙ„ - Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø§Ù„ÙÙ†ÙŠ');
                      setShowTechnicalAnalysis(!showTechnicalAnalysis);
                    }}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: showTechnicalAnalysis ? '#4CAF50' : '#333',
                      color: showTechnicalAnalysis ? 'white' : '#FFD700',
                      border: '1px solid #FFD700',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ðŸ“ˆ Ø§Ù„ØªØ­Ù„ÙŠÙ„
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Ø²Ø± Ø¨Ø¯ÙŠÙ„ - Ø§Ù„ØªÙ„ÙˆÙŠÙ†');
                      setPriceBasedColoring(!priceBasedColoring);
                    }}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: priceBasedColoring ? '#f44336' : '#333',
                      color: priceBasedColoring ? 'white' : '#FFD700',
                      border: '1px solid #FFD700',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ðŸŽ¨ Ø§Ù„ØªÙ„ÙˆÙŠÙ†
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Ø²Ø± Ø¨Ø¯ÙŠÙ„ - Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª');
                      setShowMarketOverlay(!showMarketOverlay);
                    }}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: showMarketOverlay ? '#f44336' : '#333',
                      color: showMarketOverlay ? 'white' : '#FFD700',
                      border: '1px solid #FFD700',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ðŸ”— Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Ø²Ø± Ø¨Ø¯ÙŠÙ„ - Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª');
                      setShowMarketSettings(!showMarketSettings);
                    }}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: showMarketSettings ? '#f44336' : '#333',
                      color: showMarketSettings ? 'white' : '#FFD700',
                      border: '1px solid #FFD700',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    âš™ï¸ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª
                  </button>
                </div>

                {/* Ø§Ù„Ù‚ÙˆØ§Ø¦Ù… Ø§Ù„ÙØ±Ø¹ÙŠØ© - ØªØ¸Ù‡Ø± Ø­Ø³Ø¨ Ø§Ù„Ø§Ø®ØªÙŠØ§Ø± */}
                {showMarketDataPanel && (
                  <div className="gann-market-submenu success">
                    <h4 className="gann-market-submenu-title success">ðŸ“Š Ø®ØµØ§Ø¦Øµ Ø§Ù„Ø£Ø³ÙˆØ§Ù‚ Ø§Ù„Ù…Ø§Ù„ÙŠØ©:</h4>
                    <div className="gann-market-features">
                      <span className="gann-market-feature-tag success">ðŸ’° Ø§Ù„Ø¹Ù…Ù„Ø§Øª Ø§Ù„Ø±Ù‚Ù…ÙŠØ©</span>
                      <span className="gann-market-feature-tag success">ðŸ’± Ø§Ù„ÙÙˆØ±ÙƒØ³</span>
                      <span className="gann-market-feature-tag success">ðŸ‡ºðŸ‡¸ Ø§Ù„Ø³ÙˆÙ‚ Ø§Ù„Ø£Ù…Ø±ÙŠÙƒÙŠ</span>
                      <span className="gann-market-feature-tag success">ðŸ‡¸ðŸ‡¦ Ø§Ù„Ø³ÙˆÙ‚ Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠ</span>
                      <span className="gann-market-feature-tag success">ðŸ¥‡ Ø§Ù„Ø³Ù„Ø¹</span>
                      <span className="gann-market-feature-tag success">ðŸ“Š Ø§Ù„Ù…Ø¤Ø´Ø±Ø§Øª</span>
                    </div>
                  </div>
                )}

                {showTechnicalAnalysis && (
                  <div className="gann-market-submenu success">
                    <h4 className="gann-market-submenu-title success">ðŸ“ˆ Ø®ØµØ§Ø¦Øµ Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø§Ù„ÙÙ†ÙŠ:</h4>
                    <div className="gann-market-features">
                      <span className="gann-market-feature-tag success">ðŸ”„ ØªØ­Ù„ÙŠÙ„ Ø¬Ø§Ù† Ø§Ù„Ù…ØªÙ‚Ø¯Ù…</span>
                      <span className="gann-market-feature-tag success">ðŸŒ€ Ù†Ø³Ø¨ ÙÙŠØ¨ÙˆÙ†Ø§ØªØ´ÙŠ</span>
                      <span className="gann-market-feature-tag success">ðŸŒŠ Ù…ÙˆØ¬Ø§Øª Ø¥Ù„ÙŠÙˆØª</span>
                      <span className="gann-market-feature-tag success">ðŸ“ Ø§Ù„Ø£Ù†Ù…Ø§Ø· Ø§Ù„ÙƒÙ„Ø§Ø³ÙŠÙƒÙŠØ©</span>
                      <span className="gann-market-feature-tag success">ðŸŽ¯ Ø§Ù„Ø¯Ø¹Ù… ÙˆØ§Ù„Ù…Ù‚Ø§ÙˆÙ…Ø©</span>
                      <span className="gann-market-feature-tag success">ðŸ“Š Ø§Ù„Ù…Ø¤Ø´Ø±Ø§Øª Ø§Ù„ÙÙ†ÙŠØ©</span>
                    </div>
                  </div>
                )}

                {priceBasedColoring && (
                  <div className="gann-market-submenu danger">
                    <h4 className="gann-market-submenu-title danger">ðŸŽ¨ Ø®ØµØ§Ø¦Øµ Ø§Ù„ØªÙ„ÙˆÙŠÙ† Ø§Ù„Ø°ÙƒÙŠ:</h4>
                    <div className="gann-market-features">
                      <span className="gann-market-feature-tag color-green">ðŸŸ¢ Ø£Ø®Ø¶Ø± Ù„Ù„ØµØ¹ÙˆØ¯</span>
                      <span className="gann-market-feature-tag color-red">ðŸ”´ Ø£Ø­Ù…Ø± Ù„Ù„Ù‡Ø¨ÙˆØ·</span>
                      <span className="gann-market-feature-tag color-yellow">ðŸŸ¡ Ø£ØµÙØ± Ù„Ù„Ø§Ù†Ø¹ÙƒØ§Ø³</span>
                      <span className="gann-market-feature-tag color-blue">ðŸ”µ Ø£Ø²Ø±Ù‚ Ù„Ù„Ù…Ø³ØªÙˆÙŠØ§Øª</span>
                    </div>
                  </div>
                )}

                {showMarketOverlay && (
                  <div className="gann-market-submenu danger">
                    <h4 className="gann-market-submenu-title danger">ðŸ”— Ø®ØµØ§Ø¦Øµ Ø¹Ø±Ø¶ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª:</h4>
                    <div className="gann-market-features">
                      <span className="gann-market-feature-tag danger">ðŸ“ Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ø³Ø¹Ø± Ø¹Ù„Ù‰ Ø§Ù„Ø¯Ø§Ø¦Ø±Ø©</span>
                      <span className="gann-market-feature-tag danger">ðŸ“Š Ø¨ÙŠØ§Ù†Ø§Øª Ù„Ø­Ø¸ÙŠØ©</span>
                      <span className="gann-market-feature-tag danger">ðŸŽ¯ Ù†Ù‚Ø§Ø· Ø¬Ø§Ù† Ø§Ù„Ø­Ø³Ø§Ø³Ø©</span>
                      <span className="gann-market-feature-tag danger">ðŸ”„ ØªØ­Ø¯ÙŠØ« Ù…Ø¨Ø§Ø´Ø±</span>
                    </div>
                  </div>
                )}

                {showMarketSettings && (
                  <div className="gann-market-submenu danger">
                    <h4 className="gann-market-submenu-title danger">âš™ï¸ Ø®ØµØ§Ø¦Øµ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù…ØªÙ‚Ø¯Ù…Ø©:</h4>
                    <div className="gann-market-features">
                      <span className="gann-market-feature-tag danger">ðŸ”§ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø§ØªØµØ§Ù„</span>
                      <span className="gann-market-feature-tag danger">ðŸ•’ ÙØªØ±Ø§Øª Ø§Ù„ØªØ­Ø¯ÙŠØ«</span>
                      <span className="gann-market-feature-tag danger">ðŸ”” Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª</span>
                      <span className="gann-market-feature-tag danger">ðŸ’¾ Ø­ÙØ¸ Ø§Ù„ØªÙØ¶ÙŠÙ„Ø§Øª</span>
                      <span className="gann-market-feature-tag danger">ðŸŽ¨ Ø£Ù„ÙˆØ§Ù† Ù…Ø®ØµØµØ©</span>
                      <span className="gann-market-feature-tag danger">ðŸ“ˆ Ù…Ø¹Ø§ÙŠÙŠØ± Ø§Ù„ØªØ­Ù„ÙŠÙ„</span>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowDegreeRing((v) => !v)}
                style={buttonStyle}
              >
                ðŸ§­ {settings.language === "ar"
                  ? (showDegreeRing ? "Ø¥Ø®ÙØ§Ø¡ Ø­Ù„Ù‚Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§" : "Ø¥Ø¸Ù‡Ø§Ø± Ø­Ù„Ù‚Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§")
                  : (showDegreeRing ? "Hide Degree Ring" : "Show Degree Ring")}
              </button>
              <button
                onClick={() => setShowZodiacRing((v) => !v)}
                style={buttonStyle}
              >
                â™ˆ {settings.language === "ar"
                  ? (showZodiacRing ? "Ø¥Ø®ÙØ§Ø¡ Ø§Ù„Ø£Ø¨Ø±Ø§Ø¬" : "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø£Ø¨Ø±Ø§Ø¬")
                  : (showZodiacRing ? "Hide Zodiac" : "Show Zodiac")}
              </button>
              <button
                onClick={() => setShowWeekDaysRing((v) => !v)}
                style={buttonStyle}
              >
                ðŸ“… {settings.language === "ar"
                  ? (showWeekDaysRing ? "Ø¥Ø®ÙØ§Ø¡ Ø£ÙŠØ§Ù… Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹" : "Ø¥Ø¸Ù‡Ø§Ø± Ø£ÙŠØ§Ù… Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹")
                  : (showWeekDaysRing ? "Hide Week Days" : "Show Week Days")}
              </button>
              <div style={{ display: "flex", flexDirection: "column", color: "#FFD700" }}>
                <label style={{ marginBottom: "5px" }}>
                  {settings.language === "ar" ? "Ø¹Ø¯Ø¯ Ø§Ù„Ù‚Ø·Ø§Ø¹Ø§Øª" : "Divisions"}
                </label>
                <input
                  type="number"
                  min={0}
                  max={720}
                  value={settings.divisions}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      divisions: parseInt(e.target.value),
                    }))
                  }
                  style={inputStyle}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", color: "#FFD700" }}>
                <label style={{ marginBottom: "5px" }}>
                  {settings.language === "ar" ? "Ø¨Ø¯Ø§ÙŠØ© Ø§Ù„ØªØ±Ù‚ÙŠÙ…" : "Start From"}
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={settings.startValue}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      startValue: parseFloat(e.target.value) || 0,
                    }))
                  }
                  style={inputStyle}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", color: "#FFD700" }}>
                <label style={{ marginBottom: "5px" }}>
                  {settings.language === "ar" ? "Ø¹Ø¯Ø¯ Ø§Ù„Ø­Ù„Ù‚Ø§Øª" : "Levels"}
                </label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={settings.levels}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      levels: parseInt(e.target.value),
                    }))
                  }
                  style={inputStyle}
                />
              </div>

              {/* ðŸ§² Ø¹Ø¬Ù„Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§ */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
                <label>
                  <input type="checkbox" checked={showAngleWheel} onChange={() => setShowAngleWheel(!showAngleWheel)} />
                  ðŸ§² {settings.language === "ar" ? "Ø¥Ø¸Ù‡Ø§Ø± Ø¹Ø¬Ù„Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§" : "Show Angle Wheel"}
                </label>
                {showAngleWheel && (
                  <>
                    <label>
                      <input type="checkbox" checked={showAngleWheelAngles} onChange={() => setShowAngleWheelAngles(!showAngleWheelAngles)} />
                      ðŸ“Š {settings.language === "ar" ? "Ø¥Ø¸Ù‡Ø§Ø± Ø²ÙˆØ§ÙŠØ§ Ø¹Ø¬Ù„Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§" : "Show Angle Wheel Numbers"}
                    </label>
                    <label>â™»ï¸ ØªØ¯ÙˆÙŠØ±</label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={angleWheelRotation}
                      onChange={(e) => setAngleWheelRotation(parseFloat(e.target.value))}
                    />
                    <label>ðŸ§® ØªÙƒØ±Ø§Ø± ÙƒÙ„ ÙƒÙ… Ø¯Ø±Ø¬Ø©ØŸ</label>
                    <select
                      value={angleStepRad}
                      onChange={(e) => setAngleStep(parseInt(e.target.value))}
                      style={{ width: "100%", padding: "4px" }}
                    >
                      <option value={5}>ÙƒÙ„ 5Â° (72 Ø´Ø¹Ø§Ø¹)</option>
                      <option value={10}>ÙƒÙ„ 10Â° (36 Ø´Ø¹Ø§Ø¹)</option>
                      <option value={15}>ÙƒÙ„ 15Â° (24 Ø´Ø¹Ø§Ø¹)</option>
                      <option value={30}>ÙƒÙ„ 30Â° (12 Ø´Ø¹Ø§Ø¹)</option>
                      <option value={45}>ÙƒÙ„ 45Â° (8 Ø´Ø¹Ø§Ø¹)</option>
                      <option value={60}>ÙƒÙ„ 60Â° (6 Ø´Ø¹Ø§Ø¹)</option>
                    </select>
                    <label>ðŸŽ¨ Ù„ÙˆÙ† Ø§Ù„Ø´Ø¹Ø§Ø¹</label>
                    <input
                      type="color"
                      value={rayColor}
                      onChange={(e) => setRayColor(e.target.value)}
                      style={{ width: "60px", height: "25px" }}
                    />
                    <label>ðŸ“ Ø³Ù…Ø§ÙƒØ© Ø§Ù„Ø´Ø¹Ø§Ø¹</label>
                    <input
                      type="range"
                      min="0.5"
                      max="5"
                      step="0.5"
                      value={rayWidth}
                      onChange={(e) => setRayWidth(parseFloat(e.target.value))}
                    />
                    <span style={{ fontSize: "10px", color: "#aaa" }}>{rayWidth}px</span>
                  </>
                )}
              </div>
              {/* Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø£Ø´ÙƒØ§Ù„ Ø§Ù„Ù‡Ù†Ø¯Ø³ÙŠØ© */}
              <div style={{ margin: "0px", textAlign: "center", marginBottom: "2px", paddingBottom: "0px" }}>
                <label style={{ fontWeight: "bold", marginBottom: "2px", display: "block" }}>
                  Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø£Ø´ÙƒØ§Ù„ Ø§Ù„Ù‡Ù†Ø¯Ø³ÙŠØ©:
                </label>
                <select
                  value={selectedShape}
                  onChange={(e) => {
                    console.log("Shape selected:", e.target.value);
                    setSelectedShape(e.target.value);
                  }}
                  style={{
                    margin: "0px",
                    padding: "6px",
                    fontSize: "16px",
                    display: "block",
                    width: "100%",
                    maxWidth: "250px",
                    marginInline: "auto",
                  }}
                >
                  <option value="">-- Ø§Ø®ØªØ± --</option>
                  <option value="triangle">ðŸ”º Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ù…Ø«Ù„Ø«</option>
                  <option value="star3">â­ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù„Ø§Ø«ÙŠØ©</option>
                  <option value="square">â¬› Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ù…Ø±Ø¨Ø¹</option>
                  <option value="star4">â­ Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø±Ø¨Ø§Ø¹ÙŠØ©</option>
                  <option value="pentagon">ðŸ”· Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø®Ù…Ø§Ø³ÙŠ</option>
                  <option value="star5">â­  Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø®Ù…Ø§Ø³ÙŠØ©</option>
                  <option value="hexagon">ðŸ›‘ Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠ</option>
                  <option value="star6">â­ Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠØ©</option>
                  <option value="heptagon">ðŸ”· Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø³Ø¨Ø§Ø¹ÙŠ</option>
                  <option value="star7">â­ Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¨Ø§Ø¹ÙŠØ©</option>
                  <option value="octagon">ðŸ§¿ Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ù…Ø±Ø¨Ø¹ Ø§Ù„Ø«Ù…Ø§Ù†ÙŠ</option>
                  <option value="star8">â­ Ø¥Ø¸Ù‡Ø§Ø± Ù†Ø¬Ù…Ø© Ù…Ø«Ù…Ù†Ø©</option>
                  <option value="nonagon">ðŸ”· Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„ØªØ³Ø§Ø¹ÙŠ</option>
                  <option value="star9">â­ Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„ØªØ³Ø§Ø¹ÙŠØ©</option>
                  <option value="decagon">ðŸ”· Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø¹Ø´Ø§Ø±ÙŠ</option>
                  <option value="star10">â­ Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø¹Ø´Ø§Ø±ÙŠØ©</option>
                  <option value="eleven">ðŸ”· Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø­Ø§Ø¯ÙŠ Ø¹Ø´Ø±</option>
                  <option value="star11">â­ Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø­Ø§Ø¯ÙŠØ© Ø¹Ø´Ø±</option>
                  <option value="twelve">ðŸ”· Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø§Ø«Ù†ÙŠ Ø¹Ø´Ø±</option>
                  <option value="star12">â­ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø¥Ø«Ù†ÙŠ Ø¹Ø´Ø±ÙŠØ© </option>
                  <option value="anglewheel">ðŸ§² Ø¥Ø¸Ù‡Ø§Ø± Ø¹Ø¬Ù„Ø© Ø§Ù„Ø²ÙˆØ§ÙŠØ§</option>
                  <option value="circles">ðŸŸ¡ Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø¯ÙˆØ§Ø¦Ø± Ø§Ù„Ù…ØªØ¯Ø§Ø®Ù„Ø©</option>
                </select>
              </div>
              {/* âœ… Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ù…Ø«Ù„Ø« */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>

  {selectedShape === "triangle" && (
    <>
      <label>
        ðŸŽ› {settings.language === "ar" ? "Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ù…Ø«Ù„Ø«" : "Triangle Angles"}
      </label>
{customAngles.map((angle, idx) => {
  const rotated = (angle + triangleRotation + settings.rotation - 90) % 360;

  return (
    <input
      key={idx}
      type="number"
      value={rotated.toFixed(0)}
      onChange={(e) => {
        const newRotated = parseFloat(e.target.value) || 0;
        const newOriginal = (newRotated - triangleRotation - settings.rotation + 90 + 360) % 360;

        const newAngles = [...customAngles];
        newAngles[idx] = newOriginal;
        setCustomAngles(newAngles);
      }}
      style={{ ...inputStyle, marginBottom: "6px", direction: "ltr", textAlign: "center" }}
    />
  );
})}
      <label>
        â™»ï¸ {settings.language === "ar" ? "ØªØ¯ÙˆÙŠØ± Ø§Ù„Ù…Ø«Ù„Ø«" : "Rotate Triangle"}
      </label>
      <input
        type="range"
        min="0"
        max="360"
        value={triangleRotation}
        onChange={(e) => setTriangleRotation(parseFloat(e.target.value))}
      />

      <label>
        <input type="checkbox" checked={highlightTriangle} onChange={() => setHighlightTriangle(!highlightTriangle)} />
        {settings.language === "ar" ? "ØªÙ…ÙŠÙŠØ² Ø§Ù„Ø²ÙˆØ§ÙŠØ§" : "Show Highlight"}
      </label>

<label>
  <input
    type="checkbox"
    checked={fillTriangle}
    onChange={() => setFillTriangle(!fillTriangle)}
  />
  {settings.language === "ar" ? "ØªØ¹Ø¨Ø¦Ø© Ø§Ù„Ù…Ø«Ù„Ø«" : "Fill Triangle"}
</label>
    </>
  )}
</div>

{/* â­ Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù„Ø§Ø«ÙŠØ© */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
  {selectedShape === "star3" && (
    <>
      <label>
        ðŸŽ› {settings.language === "ar" ? "Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø«Ù„Ø§Ø«ÙŠØ©" : "Star3 Angles"}
      </label>
      {customStar3Angles.map((angle, idx) => {
        const rotated = (angle + star3Rotation + settings.rotation - 90) % 360;
        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - star3Rotation - settings.rotation + 90 + 360) % 360;
              const newAngles = [...customStar3Angles];
              newAngles[idx] = newOriginal;
              setCustomStar3Angles(newAngles);
            }}
            style={{ ...inputStyle, marginBottom: "6px", direction: "ltr", textAlign: "center" }}
          />
        );
      })}
      
      <label>â™»ï¸ ØªØ¯ÙˆÙŠØ±</label>
      <input
        type="range"
        min="0"
        max="360"
        value={star3Rotation}
        onChange={(e) => setStar3Rotation(parseFloat(e.target.value))}
      />

      <label>
        <input type="checkbox" checked={fillStar3} onChange={() => setFillStar3(!fillStar3)} />
        {settings.language === "ar" ? "ØªØ¹Ø¨Ø¦Ø© Ø§Ù„Ù†Ø¬Ù…Ø©" : "Fill Star"}
      </label>

      <label>
        <input type="checkbox" checked={highlightStar3} onChange={() => setHighlightStar3(!highlightStar3)} />
        {settings.language === "ar" ? "ØªÙ…ÙŠÙŠØ² Ø§Ù„Ø±Ø¤ÙˆØ³" : "Highlight"}
      </label>

      <label>
        <input type="checkbox" checked={showStar3Angles} onChange={() => setShowStar3Angles(!showStar3Angles)} />
        Ø¹Ø±Ø¶ Ø§Ù„Ø²ÙˆØ§ÙŠØ§
      </label>

      
    </>
  )}
</div>

{/* ðŸŸ¥ Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ù…Ø±Ø¨Ø¹ */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>

 {selectedShape === "square" && (
    <>
      <label>
        ðŸŽ› {settings.language === "ar" ? "Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ù…Ø±Ø¨Ø¹" : "Square Angles"}
      </label>
      {customSquareAngles.map((angle, idx) => {
        const rotated = (angle + squareRotation + settings.rotation) % 360;

        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - squareRotation - settings.rotation + 360) % 360;

              const newAngles = [...customSquareAngles];
              newAngles[idx] = newOriginal;
              setCustomSquareAngles(newAngles);
            }}
            style={{ ...inputStyle, marginBottom: "6px", direction: "ltr", textAlign: "center" }}
          />
        );
      })}

      <label>
        â™»ï¸ {settings.language === "ar" ? "ØªØ¯ÙˆÙŠØ± Ø§Ù„Ù…Ø±Ø¨Ø¹" : "Rotate Square"}
      </label>
      <input
        type="range"
        min="0"
        max="360"
        value={squareRotation}
        onChange={(e) => setSquareRotation(parseFloat(e.target.value))}
      />

      <label>
        <input type="checkbox" checked={highlightSquare} onChange={() => setHighlightSquare(!highlightSquare)} />
        {settings.language === "ar" ? "ØªÙ…ÙŠÙŠØ² Ø§Ù„Ø²ÙˆØ§ÙŠØ§" : "Show Highlight"}
      </label>

      <label>
        <input type="checkbox" checked={showSquareAngles} onChange={() => setShowSquareAngles(!showSquareAngles)} />
        {settings.language === "ar" ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²ÙˆØ§ÙŠØ§" : "Show Angles"}
      </label>

      <label>
        <input type="checkbox" checked={fillSquare} onChange={() => setFillSquare(!fillSquare)} />
        {settings.language === "ar" ? "ØªØ¹Ø¨Ø¦Ø© Ø§Ù„Ù…Ø±Ø¨Ø¹" : "Fill Square"}
      </label>
    </>
  )}
</div>

{/* â­ Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø±Ø¨Ø§Ø¹ÙŠØ© */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>

  {selectedShape === "star4" && (
    <>
      {customStar4Angles.map((angle, idx) => {
        const rotated = (angle + star4Rotation + settings.rotation) % 360;
        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - star4Rotation - settings.rotation + 360) % 360;
              const newAngles = [...customStar4Angles];
              newAngles[idx] = newOriginal;
              setCustomStar4Angles(newAngles);
            }}
            style={{ ...inputStyle, marginBottom: "6px" }}
          />
        );
      })}
      <label>â™»ï¸ ØªØ¯ÙˆÙŠØ±</label>
      <input type="range" min="0" max="360" value={star4Rotation}
        onChange={(e) => setStar4Rotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillStar4} onChange={() => setFillStar4(!fillStar4)} /> ØªØ¹Ø¨Ø¦Ø©</label>
      <label><input type="checkbox" checked={highlightStar4} onChange={() => setHighlightStar4(!highlightStar4)} /> ØªÙ…ÙŠÙŠØ²</label>
      <label>
        <input type="checkbox" checked={showStar4Angles} onChange={() => setShowStar4Angles(!showStar4Angles)} />
        {settings.language === "ar" ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²ÙˆØ§ÙŠØ§" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* ðŸ”· Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø®Ù…Ø§Ø³ÙŠ */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
  {selectedShape === "pentagon" && (
    <>
      {customPentagonAngles.map((angle, idx) => {
        const rotated = (angle + pentagonRotation + settings.rotation) % 360;
        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - pentagonRotation - settings.rotation + 360) % 360;
              const newAngles = [...customPentagonAngles];
              newAngles[idx] = newOriginal;
              setCustomPentagonAngles(newAngles);
            }}
            style={{ ...inputStyle, marginBottom: "6px" }}
          />
        );
      })}
      <label>â™»ï¸ ØªØ¯ÙˆÙŠØ±</label>
      <input type="range" min="0" max="360" value={pentagonRotation}
        onChange={(e) => setPentagonRotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillPentagon} onChange={() => setFillPentagon(!fillPentagon)} /> ØªØ¹Ø¨Ø¦Ø©</label>
      <label><input type="checkbox" checked={highlightPentagon} onChange={() => setHighlightPentagon(!highlightPentagon)} /> ØªÙ…ÙŠÙŠØ²</label>
      <label>
        <input type="checkbox" checked={showPentagonAngles} onChange={() => setShowPentagonAngles(!showPentagonAngles)} />
        {settings.language === "ar" ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²ÙˆØ§ÙŠØ§" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* â­ Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø®Ù…Ø§Ø³ÙŠØ© */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
  {selectedShape === "star5" && (
    <>
      {customPentagonAngles.map((angle, idx) => {
        const rotated = (angle + star5Rotation + settings.rotation) % 360;
        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - star5Rotation - settings.rotation + 360) % 360;
              const newAngles = [...customPentagonAngles];
              newAngles[idx] = newOriginal;
              setCustomPentagonAngles(newAngles);
            }}
            style={{ ...inputStyle, marginBottom: "6px" }}
          />
        );
      })}
      <label>â™»ï¸ ØªØ¯ÙˆÙŠØ±</label>
      <input type="range" min="0" max="360" value={star5Rotation}
        onChange={(e) => setStar5Rotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillStar5} onChange={() => setFillStar5(!fillStar5)} /> ØªØ¹Ø¨Ø¦Ø©</label>
      <label><input type="checkbox" checked={highlightStar5} onChange={() => setHighlightStar5(!highlightStar5)} /> ØªÙ…ÙŠÙŠØ²</label>
      <label><input type="checkbox" checked={showStar5Angles} onChange={() => setShowStar5Angles(!showStar5Angles)} /> Ø¹Ø±Ø¶ Ø§Ù„Ø²ÙˆØ§ÙŠØ§</label>
    </>
  )}
</div>

{/* ðŸ”· Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠ */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
  {selectedShape === "hexagon" && (
    <>
      {customHexagonAngles.map((angle, idx) => {
        const rotated = (angle + hexagonRotation + settings.rotation) % 360;
        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - hexagonRotation - settings.rotation + 360) % 360;
              const newAngles = [...customHexagonAngles];
              newAngles[idx] = newOriginal;
              setCustomHexagonAngles(newAngles);
            }}
            style={{ ...inputStyle, marginBottom: "6px" }}
          />
        );
      })}
      <label>â™»ï¸ ØªØ¯ÙˆÙŠØ±</label>
      <input type="range" min="0" max="360" value={hexagonRotation}
        onChange={(e) => setHexagonRotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillHexagon} onChange={() => setFillHexagon(!fillHexagon)} /> ØªØ¹Ø¨Ø¦Ø©</label>
      <label><input type="checkbox" checked={highlightHexagon} onChange={() => setHighlightHexagon(!highlightHexagon)} /> ØªÙ…ÙŠÙŠØ²</label>
    </>
  )}
</div>

{/* â­ Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠØ© */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
 {selectedShape === "star6" && (
    <>
      <label>
        ðŸŽ› {settings.language === "ar" ? "Ø²ÙˆØ§ÙŠØ§ Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠØ©" : "Hexagram Angles"}
      </label>
      {[0, 60, 120, 180, 240, 300].map((angle, idx) => {
        const rotated = (angle + star6Rotation + settings.rotation) % 360;
        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - star6Rotation - settings.rotation + 360) % 360;
              // Ù„Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠØ© Ù†Ø­ØªØ§Ø¬ Ø¥Ù„Ù‰ Ø­Ø³Ø§Ø¨ Ø§Ù„Ø¯ÙˆØ±Ø§Ù† Ø§Ù„Ù…Ù†Ø§Ø³Ø¨
              const angleDiff = newOriginal - angle;
              setStar6Rotation((star6Rotation + angleDiff + 360) % 360);
            }}
            style={{ ...inputStyle, marginBottom: "6px", direction: "ltr", textAlign: "center" }}
          />
        );
      })}
      <label>â™»ï¸ ØªØ¯ÙˆÙŠØ±</label>
      <input type="range" min="0" max="360" value={star6Rotation}
        onChange={(e) => setStar6Rotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillStar6} onChange={() => setFillStar6(!fillStar6)} /> ØªØ¹Ø¨Ø¦Ø©</label>
      <label><input type="checkbox" checked={highlightStar6} onChange={() => setHighlightStar6(!highlightStar6)} /> ØªÙ…ÙŠÙŠØ²</label>
      <label><input type="checkbox" checked={showStar6Angles} onChange={() => setShowStar6Angles(!showStar6Angles)} /> Ø¹Ø±Ø¶ Ø§Ù„Ø²ÙˆØ§ÙŠØ§</label>
    </>
  )}
</div>

{/* ðŸ”· Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø³Ø¨Ø§Ø¹ÙŠ */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
  {selectedShape === "heptagon" && (
    <>
      <label>â™»ï¸ ØªØ¯ÙˆÙŠØ±</label>
      <input type="range" min="0" max="360" value={heptagonRotation}
        onChange={(e) => setHeptagonRotation(parseFloat(e.target.value))} />

      <label>
        <input type="checkbox" checked={fillHeptagon} onChange={() => setFillHeptagon(!fillHeptagon)} />
        {settings.language === "ar" ? "ØªØ¹Ø¨Ø¦Ø© Ø§Ù„Ø´ÙƒÙ„" : "Fill"}
      </label>

      <label>
        <input type="checkbox" checked={highlightHeptagon} onChange={() => setHighlightHeptagon(!highlightHeptagon)} />
        {settings.language === "ar" ? "ØªÙ…ÙŠÙŠØ² Ø§Ù„Ø±Ø¤ÙˆØ³" : "Highlight"}
      </label>

      <label>
        <input type="checkbox" checked={showHeptagonAngles} onChange={() => setShowHeptagonAngles(!showHeptagonAngles)} />
        {settings.language === "ar" ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²ÙˆØ§ÙŠØ§" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* â­ Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¨Ø§Ø¹ÙŠØ© */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>

  {selectedShape === "star7" && (
    <>
      <label>â™»ï¸ ØªØ¯ÙˆÙŠØ±</label>
      <input type="range" min="0" max="360" value={star7Rotation}
        onChange={(e) => setStar7Rotation(parseFloat(e.target.value))} />

      <label>
        <input type="checkbox" checked={fillStar7} onChange={() => setFillStar7(!fillStar7)} />
        {settings.language === "ar" ? "ØªØ¹Ø¨Ø¦Ø©" : "Fill"}
      </label>

      <label>
        <input type="checkbox" checked={highlightStar7} onChange={() => setHighlightStar7(!highlightStar7)} />
        {settings.language === "ar" ? "ØªÙ…ÙŠÙŠØ² Ø§Ù„Ø±Ø¤ÙˆØ³" : "Highlight Points"}
      </label>

      <label>
        <input type="checkbox" checked={showStar7Angles} onChange={() => setShowStar7Angles(!showStar7Angles)} />
        {settings.language === "ar" ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²ÙˆØ§ÙŠØ§" : "Show Angles"}
      </label>
    </>
  )}
</div>


{/* ðŸ§¿ Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ù…Ø«Ù…Ù† */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
 {selectedShape === "octagon" && (
    <>
      {customOctagonAngles.map((angle, idx) => {
        const rotated = (angle + octagonRotation + settings.rotation) % 360;
        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - octagonRotation - settings.rotation + 360) % 360;
              const newAngles = [...customOctagonAngles];
              newAngles[idx] = newOriginal;
              setCustomOctagonAngles(newAngles);
            }}
            style={{ ...inputStyle, marginBottom: "6px" }}
          />
        );
      })}
      <label>â™»ï¸ ØªØ¯ÙˆÙŠØ±</label>
      <input type="range" min="0" max="360" value={octagonRotation}
        onChange={(e) => setOctagonRotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillOctagon} onChange={() => setFillOctagon(!fillOctagon)} /> ØªØ¹Ø¨Ø¦Ø©</label>
      <label><input type="checkbox" checked={highlightOctagon} onChange={() => setHighlightOctagon(!highlightOctagon)} /> ØªÙ…ÙŠÙŠØ²</label>
      <label>
        <input type="checkbox" checked={showOctagonAngles} onChange={() => setShowOctagonAngles(!showOctagonAngles)} />
        {settings.language === "ar" ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²ÙˆØ§ÙŠØ§" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* â­ Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ù…Ø«Ù…Ù†Ø© */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
 {selectedShape === "star8" && (
    <>
      {customOctagonAngles.map((angle, idx) => {
        const rotated = (angle + star8Rotation + settings.rotation) % 360;
        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - star8Rotation - settings.rotation + 360) % 360;
              const newAngles = [...customOctagonAngles];
              newAngles[idx] = newOriginal;
              setCustomOctagonAngles(newAngles);
            }}
            style={{ ...inputStyle, marginBottom: "6px" }}
          />
        );
      })}
      <label>â™»ï¸ ØªØ¯ÙˆÙŠØ±</label>
      <input type="range" min="0" max="360" value={star8Rotation}
        onChange={(e) => setStar8Rotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillStar8} onChange={() => setFillStar8(!fillStar8)} /> ØªØ¹Ø¨Ø¦Ø©</label>
      <label><input type="checkbox" checked={highlightStar8} onChange={() => setHighlightStar8(!highlightStar8)} /> ØªÙ…ÙŠÙŠØ²</label>
      <label>
        <input type="checkbox" checked={showStar8Angles} onChange={() => setShowStar8Angles(!showStar8Angles)} />
        {settings.language === "ar" ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²ÙˆØ§ÙŠØ§" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* ðŸ”· Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„ØªØ³Ø§Ø¹ÙŠ */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
  {selectedShape === "nonagon" && (
    <>
      <label>â™»ï¸ ØªØ¯ÙˆÙŠØ±</label>
      <input type="range" min="0" max="360" value={nonagonRotation}
        onChange={(e) => setNonagonRotation(parseFloat(e.target.value))} />

      <label>
        <input type="checkbox" checked={fillNonagon} onChange={() => setFillNonagon(!fillNonagon)} />
        {settings.language === "ar" ? "ØªØ¹Ø¨Ø¦Ø© Ø§Ù„Ø´ÙƒÙ„" : "Fill"}
      </label>

      <label>
        <input type="checkbox" checked={highlightNonagon} onChange={() => setHighlightNonagon(!highlightNonagon)} />
        {settings.language === "ar" ? "ØªÙ…ÙŠÙŠØ² Ø§Ù„Ø±Ø¤ÙˆØ³" : "Highlight"}
      </label>

      <label>
        <input type="checkbox" checked={showNonagonAngles} onChange={() => setShowNonagonAngles(!showNonagonAngles)} />
        {settings.language === "ar" ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²ÙˆØ§ÙŠØ§" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* â­ Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„ØªØ³Ø§Ø¹ÙŠØ© */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>

  {selectedShape === "star9" && (
    <>
      <label>â™»ï¸ ØªØ¯ÙˆÙŠØ±</label>
      <input type="range" min="0" max="360" value={star9Rotation}
        onChange={(e) => setStar9Rotation(parseFloat(e.target.value))} />

      <label>
        <input type="checkbox" checked={fillStar9} onChange={() => setFillStar9(!fillStar9)} />
        {settings.language === "ar" ? "ØªØ¹Ø¨Ø¦Ø©" : "Fill"}
      </label>

      <label>
        <input type="checkbox" checked={highlightStar9} onChange={() => setHighlightStar9(!highlightStar9)} />
        {settings.language === "ar" ? "ØªÙ…ÙŠÙŠØ² Ø§Ù„Ø±Ø¤ÙˆØ³" : "Highlight Points"}
      </label>

      <label>
        <input type="checkbox" checked={showStar9Angles} onChange={() => setShowStar9Angles(!showStar9Angles)} />
        {settings.language === "ar" ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²ÙˆØ§ÙŠØ§" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* ðŸ”· Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø¹Ø´Ø§Ø±ÙŠ */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
  {selectedShape === "decagon" && (
    <>
      <label>â™»ï¸ ØªØ¯ÙˆÙŠØ±</label>
      <input type="range" min="0" max="360" value={decagonRotation}
        onChange={(e) => setDecagonRotation(parseFloat(e.target.value))} />

      <label>
        <input type="checkbox" checked={fillDecagon} onChange={() => setFillDecagon(!fillDecagon)} />
        {settings.language === "ar" ? "ØªØ¹Ø¨Ø¦Ø© Ø§Ù„Ø´ÙƒÙ„" : "Fill"}
      </label>

      <label>
        <input type="checkbox" checked={highlightDecagon} onChange={() => setHighlightDecagon(!highlightDecagon)} />
        {settings.language === "ar" ? "ØªÙ…ÙŠÙŠØ² Ø§Ù„Ø±Ø¤ÙˆØ³" : "Highlight"}
      </label>

      <label>
        <input type="checkbox" checked={showDecagonAngles} onChange={() => setShowDecagonAngles(!showDecagonAngles)} />
        {settings.language === "ar" ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²ÙˆØ§ÙŠØ§" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* â­ Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø¹Ø´Ø§Ø±ÙŠØ© */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>

  {selectedShape === "star10" && (
    <>
      <label>â™»ï¸ ØªØ¯ÙˆÙŠØ±</label>
      <input type="range" min="0" max="360" value={star10Rotation}
        onChange={(e) => setStar10Rotation(parseFloat(e.target.value))} />

      <label>
        <input type="checkbox" checked={fillStar10} onChange={() => setFillStar10(!fillStar10)} />
        {settings.language === "ar" ? "ØªØ¹Ø¨Ø¦Ø©" : "Fill"}
      </label>

      <label>
        <input type="checkbox" checked={highlightStar10} onChange={() => setHighlightStar10(!highlightStar10)} />
        {settings.language === "ar" ? "ØªÙ…ÙŠÙŠØ² Ø§Ù„Ø±Ø¤ÙˆØ³" : "Highlight Points"}
      </label>

      <label>
        <input type="checkbox" checked={showStar10Angles} onChange={() => setShowStar10Angles(!showStar10Angles)} />
        {settings.language === "ar" ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²ÙˆØ§ÙŠØ§" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* ðŸ”· Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø­Ø§Ø¯ÙŠ Ø¹Ø´Ø± */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
  {selectedShape === "eleven" && (
    <>
      <label>â™»ï¸ ØªØ¯ÙˆÙŠØ±</label>
      <input type="range" min="0" max="360" value={hendecagonRotation}
        onChange={(e) => setHendecagonRotation(parseFloat(e.target.value))} />

      <label>
        <input type="checkbox" checked={fillHendecagon} onChange={() => setFillHendecagon(!fillHendecagon)} />
        {settings.language === "ar" ? "ØªØ¹Ø¨Ø¦Ø© Ø§Ù„Ø´ÙƒÙ„" : "Fill"}
      </label>

      <label>
        <input type="checkbox" checked={highlightHendecagon} onChange={() => setHighlightHendecagon(!highlightHendecagon)} />
        {settings.language === "ar" ? "ØªÙ…ÙŠÙŠØ² Ø§Ù„Ø±Ø¤ÙˆØ³" : "Highlight"}
      </label>

      <label>
        <input type="checkbox" checked={showHendecagonAngles} onChange={() => setShowHendecagonAngles(!showHendecagonAngles)} />
        {settings.language === "ar" ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²ÙˆØ§ÙŠØ§" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* â­ Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø­Ø§Ø¯ÙŠØ© Ø¹Ø´Ø± */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>

  {selectedShape === "star11" && (
    <>
      <label>â™»ï¸ ØªØ¯ÙˆÙŠØ±</label>
      <input type="range" min="0" max="360" value={star11Rotation}
        onChange={(e) => setStar11Rotation(parseFloat(e.target.value))} />

      <label>
        <input type="checkbox" checked={fillStar11} onChange={() => setFillStar11(!fillStar11)} />
        {settings.language === "ar" ? "ØªØ¹Ø¨Ø¦Ø©" : "Fill"}
      </label>

      <label>
        <input type="checkbox" checked={highlightStar11} onChange={() => setHighlightStar11(!highlightStar11)} />
        {settings.language === "ar" ? "ØªÙ…ÙŠÙŠØ² Ø§Ù„Ø±Ø¤ÙˆØ³" : "Highlight Points"}
      </label>

      <label>
        <input type="checkbox" checked={showStar11Angles} onChange={() => setShowStar11Angles(!showStar11Angles)} />
        {settings.language === "ar" ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²ÙˆØ§ÙŠØ§" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* ðŸ”· Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø§Ø«Ù†ÙŠ Ø¹Ø´Ø± */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
  {selectedShape === "twelve" && (
    <>
      <label>â™»ï¸ ØªØ¯ÙˆÙŠØ±</label>
      <input type="range" min="0" max="360" value={dodecagonRotation}
        onChange={(e) => setDodecagonRotation(parseFloat(e.target.value))} />

      <label>
        <input type="checkbox" checked={fillDodecagon} onChange={() => setFillDodecagon(!fillDodecagon)} />
        {settings.language === "ar" ? "ØªØ¹Ø¨Ø¦Ø© Ø§Ù„Ø´ÙƒÙ„" : "Fill"}
      </label>

      <label>
        <input type="checkbox" checked={highlightDodecagon} onChange={() => setHighlightDodecagon(!highlightDodecagon)} />
        {settings.language === "ar" ? "ØªÙ…ÙŠÙŠØ² Ø§Ù„Ø±Ø¤ÙˆØ³" : "Highlight"}
      </label>

      <label>
        <input type="checkbox" checked={showDodecagonAngles} onChange={() => setShowDodecagonAngles(!showDodecagonAngles)} />
        {settings.language === "ar" ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²ÙˆØ§ÙŠØ§" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* â­ Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø§Ø«Ù†ÙŠ Ø¹Ø´Ø±ÙŠØ© */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>

  {selectedShape === "star12" && (
    <>
      <label>â™»ï¸ ØªØ¯ÙˆÙŠØ±</label>
      <input type="range" min="0" max="360" value={star12Rotation}
        onChange={(e) => setStar12Rotation(parseFloat(e.target.value))} />

      <label>
        <input type="checkbox" checked={fillStar12} onChange={() => setFillStar12(!fillStar12)} />
        {settings.language === "ar" ? "ØªØ¹Ø¨Ø¦Ø©" : "Fill"}
      </label>

      <label>
        <input type="checkbox" checked={highlightStar12} onChange={() => setHighlightStar12(!highlightStar12)} />
        {settings.language === "ar" ? "ØªÙ…ÙŠÙŠØ² Ø§Ù„Ø±Ø¤ÙˆØ³" : "Highlight Points"}
      </label>

      <label>
        <input type="checkbox" checked={showStar12Angles} onChange={() => setShowStar12Angles(!showStar12Angles)} />
        {settings.language === "ar" ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²ÙˆØ§ÙŠØ§" : "Show Angles"}
      </label>
    </>
  )}
</div>

{/* â­ Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø®Ù…Ø§Ø³ÙŠÙ‡ */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
 {selectedShape === "star5" && (
    <>
      {customPentagonAngles.map((angle, idx) => {
        const rotated = (angle + star5Rotation + settings.rotation) % 360;
        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - star5Rotation - settings.rotation + 360) % 360;
              const newAngles = [...customPentagonAngles];
              newAngles[idx] = newOriginal;
              setCustomPentagonAngles(newAngles);
            }}
            style={{ ...inputStyle, marginBottom: "6px" }}
          />
        );
      })}
      <label>â™»ï¸ ØªØ¯ÙˆÙŠØ±</label>
      <input type="range" min="0" max="360" value={star5Rotation}
        onChange={(e) => setStar5Rotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillStar5} onChange={() => setFillStar5(!fillStar5)} /> ØªØ¹Ø¨Ø¦Ø©</label>
      <label><input type="checkbox" checked={highlightStar5} onChange={() => setHighlightStar5(!highlightStar5)} /> ØªÙ…ÙŠÙŠØ²</label>
      <label><input type="checkbox" checked={showStar5Angles} onChange={() => setShowStar5Angles(!showStar5Angles)} /> Ø¹Ø±Ø¶ Ø§Ù„Ø²ÙˆØ§ÙŠØ§</label>
    </>
  )}
</div>

{/* ðŸ”· Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠ */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
  {selectedShape === "hexagon" && (
    <>
      {customHexagonAngles.map((angle, idx) => {
        const rotated = (angle + hexagonRotation + settings.rotation) % 360;
        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - hexagonRotation - settings.rotation + 360) % 360;
              const newAngles = [...customHexagonAngles];
              newAngles[idx] = newOriginal;
              setCustomHexagonAngles(newAngles);
            }}
            style={{ ...inputStyle, marginBottom: "6px" }}
          />
        );
      })}
      <label>â™»ï¸ ØªØ¯ÙˆÙŠØ±</label>
      <input type="range" min="0" max="360" value={hexagonRotation}
        onChange={(e) => setHexagonRotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillHexagon} onChange={() => setFillHexagon(!fillHexagon)} /> ØªØ¹Ø¨Ø¦Ø©</label>
      <label><input type="checkbox" checked={highlightHexagon} onChange={() => setHighlightHexagon(!highlightHexagon)} /> ØªÙ…ÙŠÙŠØ²</label>
    </>
  )}
</div>

{/* â­ Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ù†Ø¬Ù…Ø© Ø§Ù„Ø³Ø¯Ø§Ø³ÙŠØ© */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
 {selectedShape === "star6" && (
    <>
      {customHexagonAngles.map((angle, idx) => {
        const rotated = (angle + star6Rotation + settings.rotation) % 360;
        return (
          <input
            key={idx}
            type="number"
            value={rotated.toFixed(0)}
            onChange={(e) => {
              const newRotated = parseFloat(e.target.value) || 0;
              const newOriginal = (newRotated - star6Rotation - settings.rotation + 360) % 360;
              const newAngles = [...customHexagonAngles];
              newAngles[idx] = newOriginal;
              setCustomHexagonAngles(newAngles);
            }}
            style={{ ...inputStyle, marginBottom: "6px" }}
          />
        );
      })}

      <label>â™»ï¸ ØªØ¯ÙˆÙŠØ±</label>
      <input type="range" min="0" max="360" value={star6Rotation}
        onChange={(e) => setStar6Rotation(parseFloat(e.target.value))} />

      <label><input type="checkbox" checked={fillStar6} onChange={() => setFillStar6(!fillStar6)} /> ØªØ¹Ø¨Ø¦Ø©</label>
      <label><input type="checkbox" checked={highlightStar6} onChange={() => setHighlightStar6(!highlightStar6)} /> ØªÙ…ÙŠÙŠØ²</label>
    </>
  )}
</div>


{/* ðŸ”· Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø­Ø§Ø¯ÙŠ Ø¹Ø´Ø± */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>

  {selectedShape === "hendecagon" && (
    <>
      <label>â™»ï¸ ØªØ¯ÙˆÙŠØ±</label>
      <input type="range" min="0" max="360" value={hendecagonRotation}
        onChange={(e) => setHendecagonRotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillHendecagon} onChange={() => setFillHendecagon(!fillHendecagon)} /> ØªØ¹Ø¨Ø¦Ø©</label>
      <label><input type="checkbox" checked={highlightHendecagon} onChange={() => setHighlightHendecagon(!highlightHendecagon)} /> ØªÙ…ÙŠÙŠØ²</label>
    </>
  )}
</div>

{/* ðŸ”· Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ø´ÙƒÙ„ Ø§Ù„Ø§Ø«Ù†ÙŠ Ø¹Ø´Ø± */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>

  {selectedShape === "dodecagon" && (
    <>
      <label>â™»ï¸ ØªØ¯ÙˆÙŠØ±</label>
      <input type="range" min="0" max="360" value={dodecagonRotation}
        onChange={(e) => setDodecagonRotation(parseFloat(e.target.value))} />
      <label><input type="checkbox" checked={fillDodecagon} onChange={() => setFillDodecagon(!fillDodecagon)} /> ØªØ¹Ø¨Ø¦Ø©</label>
      <label><input type="checkbox" checked={highlightDodecagon} onChange={() => setHighlightDodecagon(!highlightDodecagon)} /> ØªÙ…ÙŠÙŠØ²</label>
    </>
  )}
</div>

{/* ðŸŸ¡ Ø§Ù„Ø¯ÙˆØ§Ø¦Ø± Ø§Ù„Ù…ØªØ¯Ø§Ø®Ù„Ø© */}
<div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#FFD700", marginTop: "-2px" }}>
  <label>
    <input
      type="checkbox"
      checked={showNestedCircles}
      onChange={() => setShowNestedCircles(!showNestedCircles)}
    />
    {settings.language === "ar" ? "Ø¹Ø±Ø¶ Ø§Ù„Ø¯ÙˆØ§Ø¦Ø± Ø§Ù„Ù…ØªØ¯Ø§Ø®Ù„Ø©" : "Show Nested Circles"}
  </label>
  
  {selectedShape === "circles" && (
    <>
      <label>ðŸ”¢ {settings.language === "ar" ? "Ø¹Ø¯Ø¯ Ø§Ù„Ø¯ÙˆØ§Ø¦Ø±" : "Number of Circles"}
      <input
        type="range"
        min="1"
        max="20"
        value={nestedCircleCount} 
        onChange={(e) => setNestedCircleCount(parseInt(e.target.value))}
      />
      <span>{nestedCircleCount}</span>
</label>

<label>ðŸ“ {settings.language === "ar" ? "Ø§Ù„Ù…Ø³Ø§ÙØ© Ø¨ÙŠÙ† Ø§Ù„Ø¯ÙˆØ§Ø¦Ø±" : "Gap Between Circles"}</label>
<input
  type="range"
  min="5"
  max="100"
  step="1"
  value={nestedCircleGap}
  onChange={(e) => setNestedCircleGap(parseInt(e.target.value))}
/>

<label>{settings.language === "ar" ? "Ù†Ù…Ø· Ø§Ù„Ø®Ø·" : "Line Style"}</label>
<select
  value={nestedDashStyle}
  onChange={(e) => setNestedDashStyle(e.target.value)}
>
  <option value="solid">Ù…ØªØµÙ„</option>
  <option value="dashed">Ù…ØªÙ‚Ø·Ø¹</option>
</select>

<label>
  {settings.language === "ar" ? "Ø³Ù…Ø§ÙƒØ© Ø§Ù„Ø®Ø·" : "Stroke Width"}
</label>
<input
  type="range"
  min="0.5"
  max="5"
  step="0.1"
  value={nestedStrokeWidth}
  onChange={(e) => setNestedStrokeWidth(parseFloat(e.target.value))}
/>
<span style={{ fontSize: "10px", color: "#aaa" }}>
  {nestedStrokeWidth.toFixed(1)}px
</span>


<span style={{ fontSize: "10px", color: "#aaa" }}>
  {nestedCircleGap}px
</span>

{/* â± Ø§Ù„ØªØ­ÙƒÙ… Ø¨Ø¹Ø±Ø¶ Ø§Ù„Ø²Ù…Ù† Ø¹Ù„Ù‰ Ø§Ù„Ø¯ÙˆØ§Ø¦Ø± */}
<label>
  <input
    type="checkbox"
    checked={showTimeLabels}
    onChange={() => setShowTimeLabels(!showTimeLabels)}
  />
  â± {settings.language === "ar" ? "Ø¹Ø±Ø¶ Ø§Ù„Ø²Ù…Ù† Ø¹Ù„Ù‰ Ø§Ù„Ø¯ÙˆØ§Ø¦Ø±" : "Show Time Labels"}
</label>

{showTimeLabels && (
  <>
    <label>
      {settings.language === "ar" ? "Ø¹Ø¯Ø¯ Ø§Ù„Ø£ÙŠØ§Ù… Ù„ÙƒÙ„ Ø¯Ø§Ø¦Ø±Ø©" : "Days per Circle"}
    </label>
    <input
      type="number"
      min={1}
      value={timeStepDays}
      onChange={(e) => setTimeStepDays(parseInt(e.target.value))}
      style={inputStyle}
    />
  </>
)}

<label>ðŸŽ¨ {settings.language === "ar" ? "Ù„ÙˆÙ† Ø§Ù„Ø¯ÙˆØ§Ø¦Ø±" : "Circle Color"}</label>
<input
  type="color"
  value={nestedCircleColor}
  onChange={(e) => setNestedCircleColor(e.target.value)}
  style={{ width: "60px", height: "25px" }}
/>

<label>
  <input
    type="checkbox"
    checked={nestedCircleLabels}
    onChange={() => setNestedCircleLabels(!nestedCircleLabels)}
  />
  {settings.language === "ar" ? "Ø¹Ø±Ø¶ Ø£Ø³Ù…Ø§Ø¡ Ø§Ù„Ø¯ÙˆØ§Ø¦Ø±" : "Show Labels"}
</label>

<label>
  <input
    type="checkbox"
    checked={useGradientColor}
    onChange={() => setUseGradientColor(!useGradientColor)}
  />
  {settings.language === "ar" ? "Ø£Ù„ÙˆØ§Ù† ØªÙ„Ù‚Ø§Ø¦ÙŠØ©" : "Auto Gradient Colors"}
</label>

<label>
  {settings.language === "ar" ? "Ø§Ù„Ø´ÙØ§ÙÙŠØ©" : "Opacity"}
</label>

{/* ðŸ” ØªÙƒØ±Ø§Ø± Ø´ÙƒÙ„ Ù‡Ù†Ø¯Ø³ÙŠ Ø¯Ø§Ø®Ù„ ÙƒÙ„ Ø¯Ø§Ø¦Ø±Ø© */}
<label>
  <input
    type="checkbox"
    checked={showRepeatedPattern}
    onChange={() => setShowRepeatedPattern(!showRepeatedPattern)}
  />
  ðŸ” {settings.language === "ar" ? "ØªÙƒØ±Ø§Ø± Ø´ÙƒÙ„ Ù‡Ù†Ø¯Ø³ÙŠ Ø¯Ø§Ø®Ù„ ÙƒÙ„ Ø¯Ø§Ø¦Ø±Ø©" : "Repeat Shape per Circle"}
</label>

{showRepeatedPattern && (
  <>
    <label>ðŸŽ¨ {settings.language === "ar" ? "Ù„ÙˆÙ† Ø§Ù„Ø´ÙƒÙ„" : "Shape Color"}</label>
    <input
      type="color"
      value={patternColor}
      onChange={(e) => setPatternColor(e.target.value)}
    />

    <label>â™»ï¸ {settings.language === "ar" ? "ØªØ¯ÙˆÙŠØ± Ø§Ù„Ø´ÙƒÙ„" : "Rotation"}</label>
    <input
      type="range"
      min={0}
      max={360}
      value={patternRotation}
      onChange={(e) => setPatternRotation(parseFloat(e.target.value))}
    />

    <label>
      <input
        type="checkbox"
        checked={patternFill}
        onChange={() => setPatternFill(!patternFill)}
      />
      {settings.language === "ar" ? "ØªØ¹Ø¨Ø¦Ø© Ø§Ù„Ø´ÙƒÙ„" : "Fill Shape"}
    </label>

    <label>{settings.language === "ar" ? "Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø´ÙƒÙ„" : "Select Shape"}</label>
    <select
      value={patternShape}
      onChange={(e) => setPatternShape(e.target.value)}
    >
      <option value="triangle">ðŸ”º Ù…Ø«Ù„Ø«</option>
      <option value="square">â¬› Ù…Ø±Ø¨Ø¹</option>
      <option value="star">â­ Ù†Ø¬Ù…Ø©</option>
    </select>
  </>
)}
    </>
  )}
</div>
            </>
          )}
        </div>
      </div>
      {/* âœ… Canvas Ø§Ù„Ø¯Ø§Ø¦Ø±Ø© */}
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "auto",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative"
        }}
      >
        <div
          style={{
            position: "relative",
            width: `${canvasSize}px`,
            height: `${canvasSize}px`,
            maxWidth: "min(95vw, 95vh)",
            maxHeight: "min(95vw, 95vh)",
            aspectRatio: "1/1"
          }}
        >
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          style={{
            display: "block",
            background: "transparent",
            width: "100%",
            height: "100%",
            aspectRatio: "1/1"
          }}
        ></canvas>
        
        {/* Ø¹Ø±Ø¶ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø§Ù„ÙŠØ© Ø¹Ù„Ù‰ Ø§Ù„Ø¯Ø§Ø¦Ø±Ø© */}
        <MarketDataOverlay
          canvasRef={canvasRef}
          selectedMarkets={selectedMarkets}
          showOverlay={showMarketOverlay}
          circleCenter={canvasSize / 2}
          circleRadius={canvasSize / 2 - 100}
          sectors={settings.divisions}
        />
        </div>
      </div>

      {/* Ù„ÙˆØ­Ø© Ù…ÙˆØ­Ø¯Ø© Ø£Ù†ÙŠÙ‚Ø© Ù„Ù„Ø£Ø³ÙˆØ§Ù‚ Ø§Ù„Ù…Ø§Ù„ÙŠØ© */}
      {(showMarketDataPanel || showTechnicalAnalysis || showMarketSettings) && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          width: '320px',
          maxHeight: '80vh',
          zIndex: 1000,
          backgroundColor: 'rgba(26, 26, 26, 0.95)',
          border: '1px solid #FFD700',
          borderRadius: '12px',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          
          {/* Ø´Ø±ÙŠØ· Ø§Ù„ØªØ¨ÙˆÙŠØ¨Ø§Øª */}
          <div style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            borderBottom: '1px solid #FFD700'
          }}>
            {showMarketDataPanel && (
              <button 
                onClick={() => {
                  setShowTechnicalAnalysis(false);
                  setShowMarketSettings(false);
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: (!showTechnicalAnalysis && !showMarketSettings) ? '#FFD700' : 'transparent',
                  color: (!showTechnicalAnalysis && !showMarketSettings) ? '#000' : '#FFD700',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  borderRight: '1px solid #FFD700'
                }}
              >
                ðŸ“Š Ø§Ù„Ø£Ø³ÙˆØ§Ù‚
              </button>
            )}
            
            {showTechnicalAnalysis && selectedMarkets.length > 0 && (
              <button 
                onClick={() => {
                  setShowMarketDataPanel(false);
                  setShowMarketSettings(false);
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: (!showMarketDataPanel && !showMarketSettings) ? '#FFD700' : 'transparent',
                  color: (!showMarketDataPanel && !showMarketSettings) ? '#000' : '#FFD700',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  borderRight: '1px solid #FFD700'
                }}
              >
                ðŸ“ˆ Ø§Ù„ØªØ­Ù„ÙŠÙ„
              </button>
            )}
            
            {showMarketSettings && (
              <button 
                onClick={() => {
                  setShowMarketDataPanel(false);
                  setShowTechnicalAnalysis(false);
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: (!showMarketDataPanel && !showTechnicalAnalysis) ? '#FFD700' : 'transparent',
                  color: (!showMarketDataPanel && !showTechnicalAnalysis) ? '#000' : '#FFD700',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                âš™ï¸ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª
              </button>
            )}
            
            {/* Ø²Ø± Ø§Ù„Ø¥ØºÙ„Ø§Ù‚ */}
            <button 
              onClick={() => {
                setShowMarketDataPanel(false);
                setShowTechnicalAnalysis(false);
                setShowMarketSettings(false);
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: 'transparent',
                color: '#f44336',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                borderLeft: '1px solid #FFD700'
              }}
            >
              âœ•
            </button>
          </div>

          {/* Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ù„ÙˆØ­Ø© */}
          <div style={{ 
            padding: '15px', 
            maxHeight: 'calc(80vh - 50px)', 
            overflowY: 'auto',
            overflowX: 'hidden'
          }}>
            {showMarketDataPanel && !showTechnicalAnalysis && !showMarketSettings && (
              <div style={{ fontSize: '13px' }}>
                <MarketSelector 
                  onMarketSelect={setSelectedMarkets}
                  selectedMarkets={selectedMarkets}
                />
              </div>
            )}

            {showTechnicalAnalysis && !showMarketDataPanel && !showMarketSettings && selectedMarkets.length > 0 && (
              <div style={{ fontSize: '13px' }}>
                <TechnicalAnalysisPanel 
                  selectedMarkets={selectedMarkets}
                />
              </div>
            )}

            {showMarketSettings && !showMarketDataPanel && !showTechnicalAnalysis && (
              <div style={{ fontSize: '13px' }}>
                <MarketDataSettings 
                  priceBasedColoring={priceBasedColoring}
                  setPriceBasedColoring={setPriceBasedColoring}
                  showMarketOverlay={showMarketOverlay}
                  setShowMarketOverlay={setShowMarketOverlay}
                  gannIntegrationMode={gannIntegrationMode}
                  setGannIntegrationMode={setGannIntegrationMode}
                  autoUpdateAnalysis={autoUpdateAnalysis}
                  setAutoUpdateAnalysis={setAutoUpdateAnalysis}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ø´Ø±ÙŠØ· Ø§Ù„Ø­Ø§Ù„Ø© Ø§Ù„Ø´Ø§Ù…Ù„ Ù„Ù„Ø£Ø³ÙˆØ§Ù‚ Ø§Ù„Ù…Ø§Ù„ÙŠØ© - ÙŠØ¸Ù‡Ø± Ø¯Ø§Ø¦Ù…Ø§Ù‹ ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„ÙˆØ¶Ø¹ */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(26, 26, 26, 0.9)',
        border: '1px solid #FFD700',
        borderRadius: '25px',
        padding: '8px 16px',
        zIndex: 1000,
        color: '#FFD700',
        fontSize: '14px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 15px rgba(255, 215, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.3s ease'
      }}>
        <span style={{ color: selectedMarkets.length > 0 ? '#4CAF50' : '#888' }}>
          ðŸ“Š {selectedMarkets.length}
        </span>
        
        <span style={{ color: showTechnicalAnalysis ? '#4CAF50' : '#888' }}>
          ðŸ“ˆ
        </span>
        
        <span style={{ color: priceBasedColoring ? '#4CAF50' : '#888' }}>
          ðŸŽ¨
        </span>
        
        <span style={{ color: showMarketOverlay ? '#4CAF50' : '#888' }}>
          ðŸ”—
        </span>
        
        {selectedMarkets.length > 0 && (
          <>
            <span style={{ color: '#666' }}>|</span>
            <span style={{ color: '#4CAF50', fontSize: '12px' }}>
              âš¡ Ù…ØªØµÙ„
            </span>
