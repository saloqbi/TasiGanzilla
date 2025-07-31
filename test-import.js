// ملف اختبار بسيط للتأكد من عدم وجود أخطاء في الاستيراد
import React from 'react';

// محاولة استيراد المكون للتأكد من عدم وجود أخطاء JavaScript
try {
  const GannCircle360CanvasLifeTrading = require('./src/components/GannTools/GannCircle360CanvasLifeTrading.jsx');
  console.log('✅ تم استيراد المكون بنجاح - لا توجد أخطاء في JavaScript');
} catch (error) {
  console.error('❌ خطأ في استيراد المكون:', error.message);
}
