#!/usr/bin/env python3
"""
محاولة إضافة رموز الذهب المتبقية بصيغ مختلفة
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

def try_symbol_variations():
    """محاولة إضافة رموز الذهب بصيغ مختلفة"""
    
    # صيغ مختلفة لرموز الذهب
    symbol_variations = [
        # TradingView Central variations
        "TVC:GOLD",
        "GOLD",
        "TVC:XAU",
        
        # OANDA variations  
        "OANDA:XAUUSD",
        "XAUUSD",
        "OANDA:GOLDEUR",
        "OANDA:GOLDGBP",
        "OANDA:GOLDCHF",
        
        # Other gold symbols
        "FX:XAUUSD",
        "PEPPERSTONE:XAUUSD",
        "IC:XAUUSD",
        "SAXO:XAUUSD"
    ]
    
    logger.info(f"🔍 اختبار {len(symbol_variations)} صيغة مختلفة لرموز الذهب")
    
    successful_symbols = []
    
    try:
        tv = TvDatafeedMongoDB()
        
        for symbol in symbol_variations:
            try:
                logger.info(f"🔍 اختبار الرمز: {symbol}")
                
                # محاولة جلب بيانات مصغرة للاختبار
                df = tv.get_hist(
                    symbol=symbol,
                    interval=Interval.in_15_minute,
                    n_bars=10
                )
                
                if df is not None and len(df) > 0:
                    logger.info(f"✅ نجح الرمز: {symbol} - {len(df)} سجل")
                    successful_symbols.append(symbol)
                else:
                    logger.warning(f"⚠️ لا توجد بيانات للرمز: {symbol}")
                    
            except Exception as e:
                logger.warning(f"❌ فشل الرمز {symbol}: {str(e)}")
                continue
        
        # إضافة الرموز الناجحة إلى قاعدة البيانات
        if successful_symbols:
            logger.info(f"🎯 إضافة الرموز الناجحة: {successful_symbols}")
            
            results = tv.collect_multiple_symbols_to_mongodb(
                symbols=successful_symbols,
                interval=Interval.in_15_minute,
                n_bars=1000,
                save_csv=True,
                output_dir="data_15min"
            )
            
            logger.info(f"✅ تم إضافة {len(results)} رمز ذهب جديد")
            for symbol, count in results.items():
                logger.info(f"  🥇 {symbol}: {count} سجل")
        else:
            logger.warning("⚠️ لم يتم العثور على رموز ذهب إضافية صالحة")
            
        tv.close_connection()
        
    except Exception as e:
        logger.error(f"❌ خطأ في العملية: {e}")
        return False
        
    return True

if __name__ == "__main__":
    success = try_symbol_variations()
    if success:
        logger.info("✅ تم إتمام البحث")
    else:
        logger.error("❌ فشل في البحث")
