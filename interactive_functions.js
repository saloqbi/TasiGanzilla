// هذا ملف مؤقت للدوال التفاعلية
const interactiveFunctions = `
  // 🖱️ وظائف التفاعل مع الماوس والشموع
  const handleCanvasClick = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas || !candleData.length) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const padding = 50;
    const chartWidth = canvas.width - 2 * padding;
    const candleWidth = chartWidth / candleData.length;
    const selectedIndex = Math.floor((x - padding) / candleWidth);
    
    if (selectedIndex >= 0 && selectedIndex < candleData.length) {
      const selectedCandle = candleData[selectedIndex];
      
      switch (interactiveMode) {
        case 'fibonacci':
          handleFibonacciTool(selectedCandle, selectedIndex, x, y);
          break;
        case 'gann_angles':
          handleGannAnglesTool(selectedCandle, selectedIndex, x, y);
          break;
        case 'support_resistance':
          handleSupportResistanceTool(selectedCandle, selectedIndex, x, y);
          break;
        case 'pattern_detection':
          handlePatternDetectionTool(selectedCandle, selectedIndex);
          break;
        default:
          setSelectedCandles(prev => {
            const exists = prev.find(c => c.index === selectedIndex);
            if (exists) {
              return prev.filter(c => c.index !== selectedIndex);
            } else {
              return [...prev, { ...selectedCandle, index: selectedIndex, x, y }];
            }
          });
      }
    }
  }, [candleData, interactiveMode]);
  
  // 📊 أداة مستويات فيبوناتشي
  const handleFibonacciTool = useCallback((candle, index, x, y) => {
    if (!isDrawing) {
      setIsDrawing(true);
      setDrawingStart({ candle, index, x, y });
    } else {
      const start = drawingStart;
      const end = { candle, index, x, y };
      
      const high = Math.max(start.candle.high, end.candle.high);
      const low = Math.min(start.candle.low, end.candle.low);
      const range = high - low;
      
      const fibLevels = ADVANCED_ANALYSIS_PATTERNS.LEVELS.fibonacci.map(ratio => ({
        ratio,
        price: low + (range * ratio / 100),
        y: y - ((ratio / 100) * (start.y - end.y)),
        startX: Math.min(start.x, end.x),
        endX: Math.max(start.x, end.x)
      }));
      
      setFibonacciLevels(prev => [...prev, {
        id: Date.now(),
        startPoint: start,
        endPoint: end,
        levels: fibLevels,
        color: INTERACTIVE_TOOLS.fibonacci.color
      }]);
      
      setIsDrawing(false);
      setDrawingStart(null);
    }
  }, [isDrawing, drawingStart]);`;
