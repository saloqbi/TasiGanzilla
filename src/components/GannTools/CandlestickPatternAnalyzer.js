// Enhanced Candlestick Pattern Detection and Analysis Module
// نموذج متطور لاكتشاف وتحليل أنماط الشموع اليابانية

export class CandlestickPatternAnalyzer {
  constructor() {
    this.patterns = this.initializePatterns();
    this.marketConditions = {
      bullish: 'صاعد',
      bearish: 'هابط',
      sideways: 'جانبي',
      volatile: 'متقلب'
    };
  }

  // تهيئة قاعدة بيانات الأنماط
  initializePatterns() {
    return {
      // أنماط الانعكاس الصاعدة
      reversal_bullish: {
        hammer: {
          name: 'المطرقة',
          nameEn: 'Hammer',
          description: 'نمط انعكاس صاعد يظهر في أسفل الاتجاه الهابط',
          reliability: 0.75,
          strength: 'متوسط',
          requiredCandles: 1,
          category: 'reversal',
          signal: 'bullish',
          icon: '🔨'
        },
        inverted_hammer: {
          name: 'المطرقة المقلوبة',
          nameEn: 'Inverted Hammer',
          description: 'نمط انعكاس صاعد بفتيل علوي طويل',
          reliability: 0.65,
          strength: 'متوسط',
          requiredCandles: 1,
          category: 'reversal',
          signal: 'bullish',
          icon: '🔨'
        },
        bullish_engulfing: {
          name: 'الابتلاع الصاعد',
          nameEn: 'Bullish Engulfing',
          description: 'شمعة صاعدة كبيرة تبتلع الشمعة الهابطة السابقة',
          reliability: 0.85,
          strength: 'قوي',
          requiredCandles: 2,
          category: 'reversal',
          signal: 'bullish',
          icon: '🔥'
        },
        piercing_pattern: {
          name: 'نمط الثقب',
          nameEn: 'Piercing Pattern',
          description: 'شمعة صاعدة تخترق أكثر من نصف الشمعة الهابطة السابقة',
          reliability: 0.72,
          strength: 'متوسط',
          requiredCandles: 2,
          category: 'reversal',
          signal: 'bullish',
          icon: '⚡'
        },
        morning_star: {
          name: 'نجمة الصباح',
          nameEn: 'Morning Star',
          description: 'نمط ثلاثي يشير لانعكاس صاعد قوي',
          reliability: 0.88,
          strength: 'قوي جداً',
          requiredCandles: 3,
          category: 'reversal',
          signal: 'bullish',
          icon: '⭐'
        },
        three_white_soldiers: {
          name: 'الجنود البيض الثلاثة',
          nameEn: 'Three White Soldiers',
          description: 'ثلاث شموع صاعدة متتالية تؤكد القوة الصاعدة',
          reliability: 0.82,
          strength: 'قوي',
          requiredCandles: 3,
          category: 'continuation',
          signal: 'bullish',
          icon: '⬆️'
        }
      },

      // أنماط الانعكاس الهابطة
      reversal_bearish: {
        hanging_man: {
          name: 'الرجل المعلق',
          nameEn: 'Hanging Man',
          description: 'نمط انعكاس هابط يظهر في أعلى الاتجاه الصاعد',
          reliability: 0.68,
          strength: 'متوسط',
          requiredCandles: 1,
          category: 'reversal',
          signal: 'bearish',
          icon: '🎭'
        },
        shooting_star: {
          name: 'النجم الساقط',
          nameEn: 'Shooting Star',
          description: 'شمعة بفتيل علوي طويل تشير لانعكاس هابط',
          reliability: 0.72,
          strength: 'متوسط',
          requiredCandles: 1,
          category: 'reversal',
          signal: 'bearish',
          icon: '💫'
        },
        bearish_engulfing: {
          name: 'الابتلاع الهابط',
          nameEn: 'Bearish Engulfing',
          description: 'شمعة هابطة كبيرة تبتلع الشمعة الصاعدة السابقة',
          reliability: 0.85,
          strength: 'قوي',
          requiredCandles: 2,
          category: 'reversal',
          signal: 'bearish',
          icon: '🔥'
        },
        dark_cloud_cover: {
          name: 'غطاء السحابة المظلمة',
          nameEn: 'Dark Cloud Cover',
          description: 'شمعة هابطة تغطي أكثر من نصف الشمعة الصاعدة السابقة',
          reliability: 0.75,
          strength: 'متوسط',
          requiredCandles: 2,
          category: 'reversal',
          signal: 'bearish',
          icon: '☁️'
        },
        evening_star: {
          name: 'نجمة المساء',
          nameEn: 'Evening Star',
          description: 'نمط ثلاثي يشير لانعكاس هابط قوي',
          reliability: 0.88,
          strength: 'قوي جداً',
          requiredCandles: 3,
          category: 'reversal',
          signal: 'bearish',
          icon: '🌟'
        },
        three_black_crows: {
          name: 'الغربان السود الثلاثة',
          nameEn: 'Three Black Crows',
          description: 'ثلاث شموع هابطة متتالية تؤكد القوة الهابطة',
          reliability: 0.82,
          strength: 'قوي',
          requiredCandles: 3,
          category: 'continuation',
          signal: 'bearish',
          icon: '⬇️'
        }
      },

      // أنماط التردد والدوجي
      indecision: {
        doji: {
          name: 'دوجي',
          nameEn: 'Doji',
          description: 'عدم يقين في السوق، الافتتاح قريب من الإغلاق',
          reliability: 0.55,
          strength: 'ضعيف',
          requiredCandles: 1,
          category: 'indecision',
          signal: 'neutral',
          icon: '➕'
        },
        dragonfly_doji: {
          name: 'دوجي اليعسوب',
          nameEn: 'Dragonfly Doji',
          description: 'دوجي بفتيل سفلي طويل يشير لانعكاس صاعد محتمل',
          reliability: 0.68,
          strength: 'متوسط',
          requiredCandles: 1,
          category: 'reversal',
          signal: 'bullish',
          icon: '🌱'
        },
        gravestone_doji: {
          name: 'دوجي الشاهد',
          nameEn: 'Gravestone Doji',
          description: 'دوجي بفتيل علوي طويل يشير لانعكاس هابط محتمل',
          reliability: 0.68,
          strength: 'متوسط',
          requiredCandles: 1,
          category: 'reversal',
          signal: 'bearish',
          icon: '⚰️'
        },
        spinning_top: {
          name: 'القمة الدوارة',
          nameEn: 'Spinning Top',
          description: 'جسم صغير مع فتائل طويلة يشير لعدم اليقين',
          reliability: 0.45,
          strength: 'ضعيف',
          requiredCandles: 1,
          category: 'indecision',
          signal: 'neutral',
          icon: '🌪️'
        }
      },

      // أنماط الاستمرار
      continuation: {
        rising_three_methods: {
          name: 'الطرق الثلاث الصاعدة',
          nameEn: 'Rising Three Methods',
          description: 'نمط استمرار صاعد مع تصحيح مؤقت',
          reliability: 0.72,
          strength: 'متوسط',
          requiredCandles: 5,
          category: 'continuation',
          signal: 'bullish',
          icon: '📈'
        },
        falling_three_methods: {
          name: 'الطرق الثلاث الهابطة',
          nameEn: 'Falling Three Methods',
          description: 'نمط استمرار هابط مع ارتداد مؤقت',
          reliability: 0.72,
          strength: 'متوسط',
          requiredCandles: 5,
          category: 'continuation',
          signal: 'bearish',
          icon: '📉'
        },
        three_line_strike: {
          name: 'الضربة الثلاثية',
          nameEn: 'Three Line Strike',
          description: 'أربع شموع تؤكد استمرار الاتجاه',
          reliability: 0.78,
          strength: 'قوي',
          requiredCandles: 4,
          category: 'continuation',
          signal: 'trend',
          icon: '⚡'
        }
      }
    };
  }

  // اكتشاف جميع الأنماط في البيانات
  detectAllPatterns(candleData) {
    const detectedPatterns = [];
    
    if (!candleData || candleData.length < 3) return detectedPatterns;

    for (let i = 0; i < candleData.length; i++) {
      // اكتشاف الأنماط المختلفة
      const singleCandlePatterns = this.detectSingleCandlePatterns(candleData, i);
      const doubleCandlePatterns = this.detectDoubleCandlePatterns(candleData, i);
      const tripleCandlePatterns = this.detectTripleCandlePatterns(candleData, i);
      const complexPatterns = this.detectComplexPatterns(candleData, i);

      // دمج جميع الأنماط المكتشفة
      detectedPatterns.push(
        ...singleCandlePatterns,
        ...doubleCandlePatterns,
        ...tripleCandlePatterns,
        ...complexPatterns
      );
    }

    // ترتيب الأنماط حسب القوة والموثوقية
    return detectedPatterns
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 20); // الحد الأقصى 20 نمط
  }

  // اكتشاف أنماط الشمعة الواحدة
  detectSingleCandlePatterns(candleData, index) {
    const patterns = [];
    const candle = candleData[index];
    
    if (!candle) return patterns;

    const bodySize = Math.abs(candle.close - candle.open);
    const upperWick = candle.high - Math.max(candle.open, candle.close);
    const lowerWick = Math.min(candle.open, candle.close) - candle.low;
    const totalRange = candle.high - candle.low;
    const avgVolatility = this.calculateAverageVolatility(candleData, index, 14);

    // اكتشاف المطرقة
    if (this.isHammer(candle, bodySize, upperWick, lowerWick, totalRange)) {
      patterns.push(this.createPatternObject(
        'hammer', index, 0.75, candle,
        'نمط المطرقة - إشارة انعكاس صاعد محتملة'
      ));
    }

    // اكتشاف المطرقة المقلوبة
    if (this.isInvertedHammer(candle, bodySize, upperWick, lowerWick, totalRange)) {
      patterns.push(this.createPatternObject(
        'inverted_hammer', index, 0.65, candle,
        'المطرقة المقلوبة - انعكاس صاعد مع تأكيد'
      ));
    }

    // اكتشاف الرجل المعلق
    if (this.isHangingMan(candle, bodySize, upperWick, lowerWick, totalRange, candleData, index)) {
      patterns.push(this.createPatternObject(
        'hanging_man', index, 0.68, candle,
        'الرجل المعلق - إشارة انعكاس هابط'
      ));
    }

    // اكتشاف النجم الساقط
    if (this.isShootingStar(candle, bodySize, upperWick, lowerWick, totalRange, candleData, index)) {
      patterns.push(this.createPatternObject(
        'shooting_star', index, 0.72, candle,
        'النجم الساقط - انعكاس هابط قوي'
      ));
    }

    // اكتشاف الدوجي
    if (this.isDoji(candle, bodySize, totalRange)) {
      const dojiType = this.getDojiType(candle, upperWick, lowerWick);
      patterns.push(this.createPatternObject(
        dojiType, index, 0.55, candle,
        `${this.patterns.indecision[dojiType]?.name || 'دوجي'} - عدم يقين في السوق`
      ));
    }

    return patterns;
  }

  // اكتشاف أنماط الشمعتين
  detectDoubleCandlePatterns(candleData, index) {
    const patterns = [];
    
    if (index < 1) return patterns;

    const current = candleData[index];
    const previous = candleData[index - 1];

    if (!current || !previous) return patterns;

    // اكتشاف الابتلاع الصاعد
    if (this.isBullishEngulfing(current, previous)) {
      patterns.push(this.createPatternObject(
        'bullish_engulfing', index, 0.85, current,
        'الابتلاع الصاعد - انعكاس صاعد قوي',
        [previous, current]
      ));
    }

    // اكتشاف الابتلاع الهابط
    if (this.isBearishEngulfing(current, previous)) {
      patterns.push(this.createPatternObject(
        'bearish_engulfing', index, 0.85, current,
        'الابتلاع الهابط - انعكاس هابط قوي',
        [previous, current]
      ));
    }

    // اكتشاف نمط الثقب
    if (this.isPiercingPattern(current, previous)) {
      patterns.push(this.createPatternObject(
        'piercing_pattern', index, 0.72, current,
        'نمط الثقب - انعكاس صاعد',
        [previous, current]
      ));
    }

    // اكتشاف غطاء السحابة المظلمة
    if (this.isDarkCloudCover(current, previous)) {
      patterns.push(this.createPatternObject(
        'dark_cloud_cover', index, 0.75, current,
        'غطاء السحابة المظلمة - انعكاس هابط',
        [previous, current]
      ));
    }

    return patterns;
  }

  // اكتشاف أنماط الثلاث شموع
  detectTripleCandlePatterns(candleData, index) {
    const patterns = [];
    
    if (index < 2) return patterns;

    const current = candleData[index];
    const middle = candleData[index - 1];
    const first = candleData[index - 2];

    if (!current || !middle || !first) return patterns;

    // اكتشاف نجمة الصباح
    if (this.isMorningStar(first, middle, current)) {
      patterns.push(this.createPatternObject(
        'morning_star', index, 0.88, current,
        'نجمة الصباح - انعكاس صاعد قوي جداً',
        [first, middle, current]
      ));
    }

    // اكتشاف نجمة المساء
    if (this.isEveningStar(first, middle, current)) {
      patterns.push(this.createPatternObject(
        'evening_star', index, 0.88, current,
        'نجمة المساء - انعكاس هابط قوي جداً',
        [first, middle, current]
      ));
    }

    // اكتشاف الجنود البيض الثلاثة
    if (this.isThreeWhiteSoldiers(first, middle, current)) {
      patterns.push(this.createPatternObject(
        'three_white_soldiers', index, 0.82, current,
        'الجنود البيض الثلاثة - استمرار صاعد قوي',
        [first, middle, current]
      ));
    }

    // اكتشاف الغربان السود الثلاثة
    if (this.isThreeBlackCrows(first, middle, current)) {
      patterns.push(this.createPatternObject(
        'three_black_crows', index, 0.82, current,
        'الغربان السود الثلاثة - استمرار هابط قوي',
        [first, middle, current]
      ));
    }

    return patterns;
  }

  // اكتشاف الأنماط المعقدة
  detectComplexPatterns(candleData, index) {
    const patterns = [];
    
    if (index < 4) return patterns;

    // يمكن إضافة أنماط أكثر تعقيداً هنا
    // مثل الطرق الثلاث، الجزيرة المعكوسة، إلخ
    
    return patterns;
  }

  // دوال التحقق من الأنماط المحددة
  isHammer(candle, bodySize, upperWick, lowerWick, totalRange) {
    return (
      bodySize < totalRange * 0.3 &&
      lowerWick > bodySize * 2 &&
      upperWick < bodySize * 0.5 &&
      totalRange > 0
    );
  }

  isInvertedHammer(candle, bodySize, upperWick, lowerWick, totalRange) {
    return (
      bodySize < totalRange * 0.3 &&
      upperWick > bodySize * 2 &&
      lowerWick < bodySize * 0.5 &&
      totalRange > 0
    );
  }

  isHangingMan(candle, bodySize, upperWick, lowerWick, totalRange, candleData, index) {
    const isInUptrend = this.isUptrend(candleData, index, 5);
    return (
      isInUptrend &&
      bodySize < totalRange * 0.3 &&
      lowerWick > bodySize * 2 &&
      upperWick < bodySize * 0.5
    );
  }

  isShootingStar(candle, bodySize, upperWick, lowerWick, totalRange, candleData, index) {
    const isInUptrend = this.isUptrend(candleData, index, 5);
    return (
      isInUptrend &&
      bodySize < totalRange * 0.3 &&
      upperWick > bodySize * 2 &&
      lowerWick < bodySize * 0.5
    );
  }

  isDoji(candle, bodySize, totalRange) {
    return bodySize < totalRange * 0.1 && totalRange > 0;
  }

  getDojiType(candle, upperWick, lowerWick) {
    if (lowerWick > upperWick * 2) return 'dragonfly_doji';
    if (upperWick > lowerWick * 2) return 'gravestone_doji';
    return 'doji';
  }

  isBullishEngulfing(current, previous) {
    return (
      previous.close < previous.open && // الشمعة السابقة هابطة
      current.close > current.open && // الشمعة الحالية صاعدة
      current.open < previous.close && // الافتتاح أقل من إغلاق السابقة
      current.close > previous.open && // الإغلاق أعلى من افتتاح السابقة
      Math.abs(current.close - current.open) > Math.abs(previous.close - previous.open) // الجسم الحالي أكبر
    );
  }

  isBearishEngulfing(current, previous) {
    return (
      previous.close > previous.open && // الشمعة السابقة صاعدة
      current.close < current.open && // الشمعة الحالية هابطة
      current.open > previous.close && // الافتتاح أعلى من إغلاق السابقة
      current.close < previous.open && // الإغلاق أقل من افتتاح السابقة
      Math.abs(current.close - current.open) > Math.abs(previous.close - previous.open) // الجسم الحالي أكبر
    );
  }

  isPiercingPattern(current, previous) {
    return (
      previous.close < previous.open && // الشمعة السابقة هابطة
      current.close > current.open && // الشمعة الحالية صاعدة
      current.open < previous.close && // الافتتاح أقل من إغلاق السابقة
      current.close > (previous.open + previous.close) / 2 && // الإغلاق أعلى من منتصف السابقة
      current.close < previous.open // لكن أقل من افتتاح السابقة
    );
  }

  isDarkCloudCover(current, previous) {
    return (
      previous.close > previous.open && // الشمعة السابقة صاعدة
      current.close < current.open && // الشمعة الحالية هابطة
      current.open > previous.close && // الافتتاح أعلى من إغلاق السابقة
      current.close < (previous.open + previous.close) / 2 && // الإغلاق أقل من منتصف السابقة
      current.close > previous.open // لكن أعلى من افتتاح السابقة
    );
  }

  isMorningStar(first, middle, current) {
    const firstBodySize = Math.abs(first.close - first.open);
    const middleBodySize = Math.abs(middle.close - middle.open);
    const currentBodySize = Math.abs(current.close - current.open);
    const averageBodySize = (firstBodySize + currentBodySize) / 2;

    return (
      first.close < first.open && // الشمعة الأولى هابطة
      middleBodySize < averageBodySize * 0.3 && // الشمعة الوسطى صغيرة
      current.close > current.open && // الشمعة الأخيرة صاعدة
      current.close > (first.open + first.close) / 2 // الإغلاق أعلى من منتصف الأولى
    );
  }

  isEveningStar(first, middle, current) {
    const firstBodySize = Math.abs(first.close - first.open);
    const middleBodySize = Math.abs(middle.close - middle.open);
    const currentBodySize = Math.abs(current.close - current.open);
    const averageBodySize = (firstBodySize + currentBodySize) / 2;

    return (
      first.close > first.open && // الشمعة الأولى صاعدة
      middleBodySize < averageBodySize * 0.3 && // الشمعة الوسطى صغيرة
      current.close < current.open && // الشمعة الأخيرة هابطة
      current.close < (first.open + first.close) / 2 // الإغلاق أقل من منتصف الأولى
    );
  }

  isThreeWhiteSoldiers(first, middle, current) {
    return (
      first.close > first.open && // الأولى صاعدة
      middle.close > middle.open && // الثانية صاعدة
      current.close > current.open && // الثالثة صاعدة
      middle.close > first.close && // كل شمعة تغلق أعلى من السابقة
      current.close > middle.close &&
      middle.open > first.open * 0.5 && // الافتتاح ضمن جسم الشمعة السابقة
      current.open > middle.open * 0.5
    );
  }

  isThreeBlackCrows(first, middle, current) {
    return (
      first.close < first.open && // الأولى هابطة
      middle.close < middle.open && // الثانية هابطة
      current.close < current.open && // الثالثة هابطة
      middle.close < first.close && // كل شمعة تغلق أقل من السابقة
      current.close < middle.close &&
      middle.open < first.open * 0.5 && // الافتتاح ضمن جسم الشمعة السابقة
      current.open < middle.open * 0.5
    );
  }

  // دوال مساعدة
  isUptrend(candleData, index, period = 5) {
    if (index < period) return false;
    
    let upCount = 0;
    for (let i = index - period; i < index; i++) {
      if (candleData[i] && candleData[i].close > candleData[i].open) {
        upCount++;
      }
    }
    return upCount > period * 0.6;
  }

  isDowntrend(candleData, index, period = 5) {
    if (index < period) return false;
    
    let downCount = 0;
    for (let i = index - period; i < index; i++) {
      if (candleData[i] && candleData[i].close < candleData[i].open) {
        downCount++;
      }
    }
    return downCount > period * 0.6;
  }

  calculateAverageVolatility(candleData, index, period = 14) {
    if (index < period) return 0;
    
    let totalVolatility = 0;
    for (let i = index - period; i < index; i++) {
      if (candleData[i]) {
        totalVolatility += (candleData[i].high - candleData[i].low);
      }
    }
    return totalVolatility / period;
  }

  createPatternObject(patternType, index, confidence, candle, description, candles = [candle]) {
    const patternInfo = this.findPatternInfo(patternType);
    
    return {
      type: patternType,
      name: patternInfo?.name || 'نمط غير معروف',
      nameEn: patternInfo?.nameEn || 'Unknown Pattern',
      index,
      confidence: Math.min(confidence * this.calculateContextualConfidence(candle, index), 1),
      signal: patternInfo?.signal || 'neutral',
      category: patternInfo?.category || 'unknown',
      strength: patternInfo?.strength || 'متوسط',
      description,
      icon: patternInfo?.icon || '📊',
      timestamp: candle.timestamp,
      price: candle.close,
      candles,
      reliability: patternInfo?.reliability || 0.5,
      actionRequired: this.getActionRequired(patternInfo?.signal),
      riskLevel: this.calculateRiskLevel(confidence, patternInfo?.reliability || 0.5),
      timeHorizon: this.getTimeHorizon(patternInfo?.category),
      marketContext: this.getMarketContext(candle)
    };
  }

  findPatternInfo(patternType) {
    for (const category of Object.values(this.patterns)) {
      if (category[patternType]) {
        return category[patternType];
      }
    }
    return null;
  }

  calculateContextualConfidence(candle, index) {
    // تعديل الثقة بناءً على السياق
    let contextMultiplier = 1.0;
    
    // تعديل بناءً على الحجم
    if (candle.volume && candle.volume > 0) {
      contextMultiplier *= 1.1;
    }
    
    // تعديل بناءً على الوقت من اليوم
    const hour = new Date(candle.timestamp).getHours();
    if (hour >= 9 && hour <= 16) { // ساعات التداول النشطة
      contextMultiplier *= 1.05;
    }
    
    return Math.min(contextMultiplier, 1.2); // حد أقصى 20% زيادة
  }

  getActionRequired(signal) {
    switch (signal) {
      case 'bullish':
        return 'فكر في الشراء أو إغلاق المراكز الهابطة';
      case 'bearish':
        return 'فكر في البيع أو إغلاق المراكز الصاعدة';
      case 'neutral':
        return 'انتظر تأكيد إضافي قبل اتخاذ قرار';
      default:
        return 'راقب تطورات السوق';
    }
  }

  calculateRiskLevel(confidence, reliability) {
    const combinedScore = (confidence + reliability) / 2;
    
    if (combinedScore >= 0.8) return 'منخفض';
    if (combinedScore >= 0.6) return 'متوسط';
    if (combinedScore >= 0.4) return 'عالي';
    return 'عالي جداً';
  }

  getTimeHorizon(category) {
    switch (category) {
      case 'reversal':
        return 'قصير إلى متوسط المدى (1-7 أيام)';
      case 'continuation':
        return 'متوسط المدى (3-14 يوم)';
      case 'indecision':
        return 'قصير المدى (1-3 أيام)';
      default:
        return 'متغير حسب السياق';
    }
  }

  getMarketContext(candle) {
    const volatility = (candle.high - candle.low) / candle.close;
    
    if (volatility > 0.05) return 'عالي التقلب';
    if (volatility > 0.02) return 'متوسط التقلب';
    return 'منخفض التقلب';
  }

  // تحليل إحصائي للأنماط
  getPatternStatistics(detectedPatterns) {
    const stats = {
      total: detectedPatterns.length,
      bySignal: { bullish: 0, bearish: 0, neutral: 0 },
      byCategory: { reversal: 0, continuation: 0, indecision: 0 },
      byStrength: { 'ضعيف': 0, 'متوسط': 0, 'قوي': 0, 'قوي جداً': 0 },
      averageConfidence: 0,
      highConfidencePatterns: 0
    };

    detectedPatterns.forEach(pattern => {
      stats.bySignal[pattern.signal] = (stats.bySignal[pattern.signal] || 0) + 1;
      stats.byCategory[pattern.category] = (stats.byCategory[pattern.category] || 0) + 1;
      stats.byStrength[pattern.strength] = (stats.byStrength[pattern.strength] || 0) + 1;
      stats.averageConfidence += pattern.confidence;
      
      if (pattern.confidence >= 0.7) {
        stats.highConfidencePatterns++;
      }
    });

    if (stats.total > 0) {
      stats.averageConfidence /= stats.total;
    }

    return stats;
  }

  // توليد تقرير تحليلي شامل
  generateAnalysisReport(detectedPatterns, candleData) {
    const stats = this.getPatternStatistics(detectedPatterns);
    const recentPatterns = detectedPatterns
      .filter(p => p.index >= candleData.length - 10)
      .sort((a, b) => b.confidence - a.confidence);

    return {
      summary: {
        totalPatterns: stats.total,
        highConfidenceCount: stats.highConfidencePatterns,
        averageConfidence: Math.round(stats.averageConfidence * 100),
        dominantSignal: this.getDominantSignal(stats.bySignal),
        marketSentiment: this.calculateMarketSentiment(recentPatterns)
      },
      recentPatterns: recentPatterns.slice(0, 5),
      recommendations: this.generateRecommendations(recentPatterns, stats),
      riskAssessment: this.assessRisk(recentPatterns, stats),
      statistics: stats,
      timestamp: new Date().toISOString()
    };
  }

  getDominantSignal(signalStats) {
    let maxCount = 0;
    let dominantSignal = 'neutral';
    
    Object.entries(signalStats).forEach(([signal, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantSignal = signal;
      }
    });
    
    return dominantSignal;
  }

  calculateMarketSentiment(recentPatterns) {
    if (recentPatterns.length === 0) return 'غير محدد';
    
    const bullishCount = recentPatterns.filter(p => p.signal === 'bullish').length;
    const bearishCount = recentPatterns.filter(p => p.signal === 'bearish').length;
    
    if (bullishCount > bearishCount * 1.5) return 'متفائل';
    if (bearishCount > bullishCount * 1.5) return 'متشائم';
    return 'محايد';
  }

  generateRecommendations(recentPatterns, stats) {
    const recommendations = [];
    
    if (stats.highConfidencePatterns >= 3) {
      recommendations.push('🎯 توجد إشارات قوية متعددة - فكر في اتخاذ موقف');
    }
    
    if (stats.averageConfidence < 0.5) {
      recommendations.push('⚠️ الإشارات غير واضحة - انتظر تأكيد إضافي');
    }
    
    const reversalPatterns = recentPatterns.filter(p => p.category === 'reversal');
    if (reversalPatterns.length >= 2) {
      recommendations.push('🔄 أنماط انعكاس متعددة - توقع تغيير في الاتجاه');
    }
    
    return recommendations;
  }

  assessRisk(recentPatterns, stats) {
    let riskScore = 0;
    
    // تقييم المخاطر بناءً على تضارب الإشارات
    const conflictingSignals = stats.bySignal.bullish > 0 && stats.bySignal.bearish > 0;
    if (conflictingSignals) riskScore += 30;
    
    // تقييم بناءً على قوة الإشارات
    if (stats.averageConfidence < 0.6) riskScore += 25;
    
    // تقييم بناءً على عدد أنماط عدم اليقين
    if (stats.byCategory.indecision > stats.total * 0.3) riskScore += 20;
    
    if (riskScore >= 50) return 'عالي';
    if (riskScore >= 30) return 'متوسط';
    return 'منخفض';
  }
}

// تصدير الكلاس للاستخدام
export default CandlestickPatternAnalyzer;
