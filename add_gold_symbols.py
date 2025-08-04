#!/usr/bin/env python3
"""
إضافة رموز الذهب إلى قاعدة البيانات
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from scripts.data_fetcher import TvDatafeedMongoDB, Interval
import logging

# إعداد التسجيل
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def main():
    """إضافة رموز الذهب إلى قاعدة البيانات"""
    
    # رموز الذهب المطلوب إضافتها
    gold_symbols = [
        "TVC:GOLD",
        "OANDA:XAUUSD", 
        "FOREXCOM:XAUUSD",
        "COMEX:GC1!"
    ]
    
    logger.info(f"🥇 بدء إضافة رموز الذهب: {gold_symbols}")
    
    try:
        # إنشاء اتصال TradingView مع MongoDB
        tv = TvDatafeedMongoDB()
        
        # جمع البيانات لرموز الذهب
        interval_obj = Interval.in_15_minute
        n_bars = 1000
        
        logger.info(f"⏰ الفترة الزمنية: 15 دقيقة")
        logger.info(f"📊 عدد الشموع: {n_bars}")
        
        results = tv.collect_multiple_symbols_to_mongodb(
            symbols=gold_symbols,
            interval=interval_obj,
            n_bars=n_bars,
            save_csv=True,
            output_dir="data_15min"
        )
        
        # طباعة النتائج
        logger.info(f"\n🎉 تم إتمام إضافة رموز الذهب!")
        logger.info(f"✅ تم معالجة {len(results)} رمز بنجاح")
        
        for symbol, count in results.items():
            logger.info(f"  🥇 {symbol}: {count} سجل")
            
        # إغلاق الاتصالات
        tv.close_connection()
        
    except Exception as e:
        logger.error(f"❌ خطأ في إضافة رموز الذهب: {e}")
        return False
        
    return True

if __name__ == "__main__":
    success = main()
    if success:
        logger.info("✅ تم إتمام العملية بنجاح")
    else:
        logger.error("❌ فشلت العملية")
        sys.exit(1)
