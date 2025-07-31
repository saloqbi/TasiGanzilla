// Advanced Gann-Candlestick Integration Module
// وحدة تكامل متقدمة بين تحليل جان والشموع اليابانية

import CandlestickPatternAnalyzer from './CandlestickPatternAnalyzer.js';

export class GannCandlestickIntegration {
  constructor() {
    this.candlestickAnalyzer = new CandlestickPatternAnalyzer();
    this.gannAngles = [15, 26.25, 45, 63.75, 75];
    this.gannTimePoints = this.calculateGannTimePoints();
    this.fibonacciLevels = [0.236, 0.382, 0.5, 0.618, 0.786];
  }

  // حساب نقاط جان الزمنية
  calculateGannTimePoints() {
    const basePoints = [1, 2, 3, 4, 5, 7, 9, 12, 15, 18, 21, 30, 45, 60, 90, 120, 144, 180];
    return basePoints.map(point => ({
      days: point,
      significance: point <= 7 ? 'قصير المدى' : 
                   point <= 30 ? 'متوسط المدى' : 'طويل المدى'
    }));
  }

  // التحليل المتكامل للشموع مع جان
  integratedAnalysis(candleData, currentPrice, startDate) {
    if (!candleData || candleData.length === 0) {
      return this.createEmptyAnalysis();
    }

    // اكتشاف أنماط الشموع
    const candlestickPatterns = this.candlestickAnalyzer.detectAllPatterns(candleData);
    
    // حساب مستويات جان
    const gannLevels = this.calculateGannLevels(currentPrice);
    
    // حساب مستويات فيبوناتشي
    const fibLevels = this.calculateFibonacciLevels(candleData);
    
    // تحليل النقاط الزمنية لجان
    const gannTimeAnalysis = this.analyzeGannTimePoints(candleData, startDate);
    
    // دمج التحليلات
    const integratedSignals = this.combineAnalyses(
      candlestickPatterns, 
      gannLevels, 
      fibLevels, 
      gannTimeAnalysis,
      currentPrice
    );

    return {
      candlestickPatterns,
      gannLevels,
      fibonacciLevels: fibLevels,
      gannTimeAnalysis,
      integratedSignals,
      marketAnalysis: this.generateMarketAnalysis(integratedSignals, currentPrice),
      recommendations: this.generateRecommendations(integratedSignals),
      riskAssessment: this.assessIntegratedRisk(integratedSignals),
      timestamp: new Date().toISOString()
    };
  }

  // حساب مستويات جان السعرية
  calculateGannLevels(currentPrice) {
    const levels = [];
    const basePrice = Math.floor(currentPrice / 100) * 100;
    
    this.gannAngles.forEach(angle => {
      const radians = angle * Math.PI / 180;
      const factor = Math.tan(radians);
      
      // مستويات المقاومة
      for (let i = 1; i <= 5; i++) {
        levels.push({
          price: currentPrice + (currentPrice * factor * 0.1 * i),
          type: 'resistance',
          angle: angle,
          strength: angle === 45 ? 'قوي جداً' : angle === 26.25 || angle === 63.75 ? 'قوي' : 'متوسط',
          distance: Math.abs(currentPrice - (currentPrice + (currentPrice * factor * 0.1 * i))),
          significance: this.calculateLevelSignificance(angle, i)
        });
      }
      
      // مستويات الدعم
      for (let i = 1; i <= 5; i++) {
        levels.push({
          price: currentPrice - (currentPrice * factor * 0.1 * i),
          type: 'support',
          angle: angle,
          strength: angle === 45 ? 'قوي جداً' : angle === 26.25 || angle === 63.75 ? 'قوي' : 'متوسط',
          distance: Math.abs(currentPrice - (currentPrice - (currentPrice * factor * 0.1 * i))),
          significance: this.calculateLevelSignificance(angle, i)
        });
      }
    });

    return levels
      .filter(level => level.price > 0)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20);
  }

  // حساب مستويات فيبوناتشي
  calculateFibonacciLevels(candleData) {
    if (candleData.length < 10) return [];

    const recent = candleData.slice(-20);
    const high = Math.max(...recent.map(c => c.high));
    const low = Math.min(...recent.map(c => c.low));
    const range = high - low;

    const levels = [];
    
    this.fibonacciLevels.forEach(ratio => {
      // مستويات الارتداد
      levels.push({
        price: high - (range * ratio),
        type: 'fibonacci_retracement',
        ratio: ratio,
        percentage: (ratio * 100).toFixed(1),
        strength: ratio === 0.382 || ratio === 0.618 ? 'قوي' : 'متوسط'
      });
      
      // مستويات الامتداد
      levels.push({
        price: high + (range * ratio),
        type: 'fibonacci_extension',
        ratio: ratio,
        percentage: (ratio * 100).toFixed(1),
        strength: ratio === 0.618 || ratio === 1.618 ? 'قوي' : 'متوسط'
      });
    });

    return levels.filter(level => level.price > 0);
  }

  // تحليل النقاط الزمنية لجان
  analyzeGannTimePoints(candleData, startDate) {
    const analysis = [];
    const start = new Date(startDate);
    const now = new Date();
    const daysDiff = Math.floor((now - start) / (1000 * 60 * 60 * 24));

    this.gannTimePoints.forEach(timePoint => {
      const nextSignificantDate = new Date(start);
      nextSignificantDate.setDate(start.getDate() + timePoint.days);
      
      const daysUntilNext = Math.floor((nextSignificantDate - now) / (1000 * 60 * 60 * 24));
      
      analysis.push({
        days: timePoint.days,
        significance: timePoint.significance,
        nextDate: nextSignificantDate,
        daysUntilNext,
        isActive: Math.abs(daysUntilNext) <= 2, // نشط إذا كان خلال يومين
        cyclePosition: this.calculateCyclePosition(daysDiff, timePoint.days)
      });
    });

    return analysis.filter(point => point.daysUntilNext >= -7 && point.daysUntilNext <= 30);
  }

  // دمج التحليلات المختلفة
  combineAnalyses(candlestickPatterns, gannLevels, fibLevels, gannTimeAnalysis, currentPrice) {
    const signals = [];

    // تحليل تقارب الشموع مع مستويات جان
    candlestickPatterns.forEach(pattern => {
      const nearbyGannLevels = gannLevels.filter(level => 
        Math.abs(level.price - pattern.price) / pattern.price < 0.02
      );

      if (nearbyGannLevels.length > 0) {
        signals.push({
          type: 'gann_candlestick_confluence',
          strength: this.calculateConfluenceStrength(pattern, nearbyGannLevels),
          pattern,
          gannLevels: nearbyGannLevels,
          signal: this.determineSignal(pattern, nearbyGannLevels),
          confidence: Math.min(pattern.confidence * 1.2, 1.0),
          description: `تقارب ${pattern.name} مع مستوى جان ${nearbyGannLevels[0].angle}°`
        });
      }
    });

    // تحليل تقارب الشموع مع فيبوناتشي
    candlestickPatterns.forEach(pattern => {
      const nearbyFibLevels = fibLevels.filter(level => 
        Math.abs(level.price - pattern.price) / pattern.price < 0.015
      );

      if (nearbyFibLevels.length > 0) {
        signals.push({
          type: 'fibonacci_candlestick_confluence',
          strength: 'قوي',
          pattern,
          fibLevels: nearbyFibLevels,
          signal: pattern.signal,
          confidence: Math.min(pattern.confidence * 1.15, 1.0),
          description: `تقارب ${pattern.name} مع فيبوناتشي ${nearbyFibLevels[0].percentage}%`
        });
      }
    });

    // تحليل النقاط الزمنية النشطة
    const activeTimePoints = gannTimeAnalysis.filter(point => point.isActive);
    if (activeTimePoints.length > 0 && candlestickPatterns.length > 0) {
      const recentPatterns = candlestickPatterns.filter(p => 
        p.index >= candlestickPatterns.length - 5
      );

      recentPatterns.forEach(pattern => {
        signals.push({
          type: 'gann_time_confluence',
          strength: 'متوسط',
          pattern,
          timePoints: activeTimePoints,
          signal: pattern.signal,
          confidence: Math.min(pattern.confidence * 1.1, 1.0),
          description: `نمط ${pattern.name} عند نقطة جان زمنية حساسة`
        });
      });
    }

    // تحليل التجمعات الثلاثية (جان + فيبوناتشي + شموع)
    const tripleConfluences = this.findTripleConfluences(
      candlestickPatterns, gannLevels, fibLevels
    );

    signals.push(...tripleConfluences);

    return signals.sort((a, b) => b.confidence - a.confidence);
  }

  // البحث عن التجمعات الثلاثية
  findTripleConfluences(patterns, gannLevels, fibLevels) {
    const confluences = [];

    patterns.forEach(pattern => {
      const nearbyGann = gannLevels.filter(level => 
        Math.abs(level.price - pattern.price) / pattern.price < 0.02
      );
      
      const nearbyFib = fibLevels.filter(level => 
        Math.abs(level.price - pattern.price) / pattern.price < 0.02
      );

      if (nearbyGann.length > 0 && nearbyFib.length > 0) {
        confluences.push({
          type: 'triple_confluence',
          strength: 'قوي جداً',
          pattern,
          gannLevels: nearbyGann,
          fibLevels: nearbyFib,
          signal: pattern.signal,
          confidence: Math.min(pattern.confidence * 1.3, 1.0),
          description: `تجمع ثلاثي: ${pattern.name} + جان ${nearbyGann[0].angle}° + فيبوناتشي ${nearbyFib[0].percentage}%`,
          priority: 'عالي جداً'
        });
      }
    });

    return confluences;
  }

  // حساب قوة التقارب
  calculateConfluenceStrength(pattern, levels) {
    const patternStrengthMap = {
      'ضعيف': 1,
      'متوسط': 2,
      'قوي': 3,
      'قوي جداً': 4
    };

    const levelStrengthMap = {
      'متوسط': 1,
      'قوي': 2,
      'قوي جداً': 3
    };

    const patternScore = patternStrengthMap[pattern.strength] || 2;
    const levelScore = levels.reduce((sum, level) => 
      sum + (levelStrengthMap[level.strength] || 1), 0
    );

    const totalScore = patternScore + levelScore;
    
    if (totalScore >= 8) return 'قوي جداً';
    if (totalScore >= 6) return 'قوي';
    if (totalScore >= 4) return 'متوسط';
    return 'ضعيف';
  }

  // تحديد الإشارة المدمجة
  determineSignal(pattern, levels) {
    const supportLevels = levels.filter(l => l.type === 'support').length;
    const resistanceLevels = levels.filter(l => l.type === 'resistance').length;

    if (pattern.signal === 'bullish' && supportLevels > resistanceLevels) {
      return 'bullish_strong';
    } else if (pattern.signal === 'bearish' && resistanceLevels > supportLevels) {
      return 'bearish_strong';
    }
    
    return pattern.signal;
  }

  // حساب أهمية المستوى
  calculateLevelSignificance(angle, multiplier) {
    const angleWeight = angle === 45 ? 3 : angle === 26.25 || angle === 63.75 ? 2 : 1;
    const distanceWeight = multiplier <= 2 ? 3 : multiplier <= 3 ? 2 : 1;
    
    const significance = angleWeight + distanceWeight;
    
    if (significance >= 5) return 'عالي جداً';
    if (significance >= 4) return 'عالي';
    if (significance >= 3) return 'متوسط';
    return 'منخفض';
  }

  // حساب موضع الدورة
  calculateCyclePosition(currentDays, cycleDays) {
    const position = (currentDays % cycleDays) / cycleDays;
    
    if (position < 0.25) return 'بداية الدورة';
    if (position < 0.5) return 'ربع الدورة';
    if (position < 0.75) return 'منتصف الدورة';
    return 'نهاية الدورة';
  }

  // توليد تحليل السوق
  generateMarketAnalysis(signals, currentPrice) {
    const bullishSignals = signals.filter(s => 
      s.signal === 'bullish' || s.signal === 'bullish_strong'
    ).length;
    
    const bearishSignals = signals.filter(s => 
      s.signal === 'bearish' || s.signal === 'bearish_strong'
    ).length;

    const strongSignals = signals.filter(s => s.strength === 'قوي جداً').length;
    const avgConfidence = signals.length > 0 ? 
      signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length : 0;

    let trend = 'محايد';
    let strength = 'متوسط';
    
    if (bullishSignals > bearishSignals * 1.5) {
      trend = 'صاعد';
      strength = bullishSignals >= 3 ? 'قوي' : 'متوسط';
    } else if (bearishSignals > bullishSignals * 1.5) {
      trend = 'هابط';
      strength = bearishSignals >= 3 ? 'قوي' : 'متوسط';
    }

    return {
      trend,
      strength,
      confidence: Math.round(avgConfidence * 100),
      signalCount: signals.length,
      bullishCount: bullishSignals,
      bearishCount: bearishSignals,
      strongSignalCount: strongSignals,
      marketSentiment: this.calculateMarketSentiment(signals),
      volatilityAssessment: this.assessVolatility(signals),
      tradingOpportunity: this.assessTradingOpportunity(signals, avgConfidence)
    };
  }

  // توليد التوصيات
  generateRecommendations(signals) {
    const recommendations = [];
    
    const tripleConfluences = signals.filter(s => s.type === 'triple_confluence');
    if (tripleConfluences.length > 0) {
      recommendations.push({
        type: 'high_priority',
        action: 'إشارة قوية جداً',
        description: `تجمع ثلاثي مكتشف - فرصة تداول عالية الجودة`,
        confidence: 'عالي جداً',
        timeframe: 'قصير إلى متوسط المدى',
        icon: '🎯'
      });
    }

    const strongConfluences = signals.filter(s => 
      s.type === 'gann_candlestick_confluence' && s.strength === 'قوي جداً'
    );
    
    if (strongConfluences.length >= 2) {
      recommendations.push({
        type: 'medium_priority',
        action: 'إشارات متقاربة متعددة',
        description: 'عدة نقاط تقارب بين جان والشموع',
        confidence: 'عالي',
        timeframe: 'قصير المدى',
        icon: '📊'
      });
    }

    const avgConfidence = signals.length > 0 ? 
      signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length : 0;

    if (avgConfidence < 0.6) {
      recommendations.push({
        type: 'caution',
        action: 'توخي الحذر',
        description: 'الإشارات غير واضحة - انتظر تأكيد إضافي',
        confidence: 'متوسط',
        timeframe: 'انتظار',
        icon: '⚠️'
      });
    }

    return recommendations;
  }

  // تقييم المخاطر المتكاملة
  assessIntegratedRisk(signals) {
    let riskScore = 0;
    
    // إشارات متضاربة
    const bullishCount = signals.filter(s => s.signal.includes('bullish')).length;
    const bearishCount = signals.filter(s => s.signal.includes('bearish')).length;
    
    if (bullishCount > 0 && bearishCount > 0) {
      riskScore += 25;
    }

    // قلة الإشارات
    if (signals.length < 3) {
      riskScore += 20;
    }

    // انخفاض متوسط الثقة
    const avgConfidence = signals.length > 0 ? 
      signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length : 0;
    
    if (avgConfidence < 0.5) {
      riskScore += 30;
    }

    // عدم وجود تجمعات قوية
    const strongConfluences = signals.filter(s => 
      s.strength === 'قوي جداً' || s.type === 'triple_confluence'
    );
    
    if (strongConfluences.length === 0) {
      riskScore += 15;
    }

    return {
      score: riskScore,
      level: riskScore >= 60 ? 'عالي جداً' : 
             riskScore >= 40 ? 'عالي' : 
             riskScore >= 25 ? 'متوسط' : 'منخفض',
      factors: this.identifyRiskFactors(signals, avgConfidence),
      mitigation: this.suggestRiskMitigation(riskScore)
    };
  }

  // حساب المعنويات
  calculateMarketSentiment(signals) {
    const bullishWeight = signals.filter(s => s.signal.includes('bullish'))
      .reduce((sum, s) => sum + s.confidence, 0);
    const bearishWeight = signals.filter(s => s.signal.includes('bearish'))
      .reduce((sum, s) => sum + s.confidence, 0);

    if (bullishWeight > bearishWeight * 1.3) return 'متفائل';
    if (bearishWeight > bullishWeight * 1.3) return 'متشائم';
    return 'محايد';
  }

  // تقييم التقلبات
  assessVolatility(signals) {
    const reversalPatterns = signals.filter(s => 
      s.pattern && s.pattern.category === 'reversal'
    ).length;

    if (reversalPatterns >= 3) return 'عالي';
    if (reversalPatterns >= 1) return 'متوسط';
    return 'منخفض';
  }

  // تقييم فرصة التداول
  assessTradingOpportunity(signals, avgConfidence) {
    const strongSignals = signals.filter(s => s.strength === 'قوي جداً').length;
    
    if (strongSignals >= 2 && avgConfidence >= 0.7) return 'ممتاز';
    if (strongSignals >= 1 && avgConfidence >= 0.6) return 'جيد';
    if (avgConfidence >= 0.5) return 'متوسط';
    return 'ضعيف';
  }

  // تحديد عوامل المخاطر
  identifyRiskFactors(signals, avgConfidence) {
    const factors = [];
    
    if (signals.length < 3) factors.push('قلة الإشارات');
    if (avgConfidence < 0.5) factors.push('انخفاض مستوى الثقة');
    
    const conflicting = signals.filter(s => s.signal.includes('bullish')).length > 0 &&
                       signals.filter(s => s.signal.includes('bearish')).length > 0;
    if (conflicting) factors.push('إشارات متضاربة');
    
    return factors;
  }

  // اقتراح تخفيف المخاطر
  suggestRiskMitigation(riskScore) {
    const suggestions = [];
    
    if (riskScore >= 40) {
      suggestions.push('تقليل حجم المركز');
      suggestions.push('استخدام وقف خسارة محكم');
    }
    
    if (riskScore >= 25) {
      suggestions.push('انتظار تأكيد إضافي');
      suggestions.push('مراقبة المستويات الحرجة');
    }
    
    suggestions.push('تنويع المحفظة');
    
    return suggestions;
  }

  // إنشاء تحليل فارغ
  createEmptyAnalysis() {
    return {
      candlestickPatterns: [],
      gannLevels: [],
      fibonacciLevels: [],
      gannTimeAnalysis: [],
      integratedSignals: [],
      marketAnalysis: {
        trend: 'غير محدد',
        strength: 'غير محدد',
        confidence: 0,
        signalCount: 0
      },
      recommendations: [],
      riskAssessment: {
        level: 'غير محدد',
        score: 0,
        factors: [],
        mitigation: []
      }
    };
  }
}

export default GannCandlestickIntegration;
