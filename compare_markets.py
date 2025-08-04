#!/usr/bin/env python3
"""
🔍 أداة مقارنة الأسواق وإضافة الرموز الناقصة
مقارنة بين ملف Tradinview_15min.py وقاعدة البيانات MongoDB الحالية
"""

import sys
import os
import json
import requests
from typing import List, Set, Dict

# رموز الملف الخارجي Tradinview_15min.py
EXTERNAL_FILE_SYMBOLS = [
    "TADAWUL:TASI", "NASDAQ:ATYR", "TADAWUL:MT30", "TADAWUL:4011", "TADAWUL:2240", "TADAWUL:2001",
    "NYSE:MMM", "NYSE:BA", "NYSE:SHAK", "BINANCE:FTMUSDT", "BINANCE:AUCTIONUSDT", "NYSE:RBLX",
    "NASDAQ:EBAY", "NYSE:WELL", "NYSE:SPCE", "NASDAQ:LULU", "NYSE:GS", "NYSE:AMC", "NYSE:GE",
    "NASDAQ:PYPL", "NYSE:FDX", "NASDAQ:ZM", "NYSE:LUV", "NYSE:NKE", "NYSE:BAC", "OANDA:US30USD",
    "TVC:DJI", "NASDAQ:COST", "NASDAQ:UAL", "NYSE:U", "NYSE:HSY", "NYSE:SQ", "NASDAQ:ROKU",
    "NASDAQ:NVDA", "NASDAQ:MRNA", "NYSE:PFE", "OANDA:NAS100USD", "AMEX:EEM", "NASDAQ:BNTX",
    "NYSE:CAT", "NYSE:JNJ", "NYSE:WFC", "NYSE:PG", "NYSE:MCD", "NASDAQ:ENPH", "NYSE:SHOP",
    "NASDAQ:AMD", "NYSE:SNOW", "NYSE:CRM", "NASDAQ:COIN", "NASDAQ:MSTR", "NASDAQ:GOOGL",
    "NASDAQ:AAPL", "NASDAQ:MSFT", "NYSE:SNAP", "NASDAQ:TSLA", "NASDAQ:LCID", "NASDAQ:RIVN",
    "NASDAQ:ADBE", "NASDAQ:META", "NASDAQ:INTC", "NYSE:DIS", "NYSE:HD", "NASDAQ:TLT",
    "NASDAQ:CRWD", "NYSE:BABA", "NASDAQ:BIDU", "NASDAQ:JD", "NYMEX:CL1!", "CME_MINI:NQ1!",
    "CME_MINI:ES1!", "NASDAQ:NFLX", "CRYPTO:BTCUSD", "TVC:DXY", "BINANCE:BTCUSDT",
    "BINANCE:BNBUSDT", "BINANCE:XRPUSD", "BINANCE:XRPUSDT", "BINANCE:DOGEUSDT", "BINANCE:SOLUSDT",
    "BINANCE:ETHUSDT", "BINANCE:WIFUSDT", "BINANCE:HFTUSDT", "SPREADEX:NIKKEI", "NASDAQ:HOLO",
    "TVC:VIX", "NASDAQ:OKTA", "BLACKBULL:SPX500", "NASDAQ:MDB", "NYSE:MRK", "CAPITALCOM:US500",
    "SP:SPX", "NASDAQ:QQQ", "AMEX:SPY", "CBOE:VVIX", "NASDAQ:GILD", "CBOE:XSP", "NASDAQ:QCOM",
    "NYSE:X", "NASDAQ:SQQQ", "NASDAQ:SERA", "NYSE:ABBV", "NASDAQ:SBUX", "TVC:UKOIL",
    "AMEX:VIXY", "AMEX:UVXY", "NASDAQ:ABNB", "NASDAQ:MU", "NASDAQ:LMFA", "NASDAQ:UPST",
    "NYSE:LMT", "NYSE:SWK", "NASDAQ:INTU", "NYSE:SYK", "NASDAQ:CTSH", "NASDAQ:TNXP",
    "NYSE:IBM", "BINANCE:ENSUSDT", "NYSE:CF", "NYSE:BBWI", "NYSE:NIO", "NASDAQ:FCEL",
    "KUCOIN:LUNAUSDT", "NYSE:GME", "NYSE:AA", "NYSE:BBY", "NASDAQ:DBGI", "NYSE:EOG",
    "NASDAQ:LI", "NASDAQ:THFF", "NASDAQ:USEG", "NYSE:MA", "NYSE:V", "NASDAQ:ON",
    "NYSE:NTR", "NYSE:GRMN", "NASDAQ:BKNG", "NYSE:WMT", "NYSE:TSN", "NYSE:D",
    "NASDAQ:NVAX", "NYSE:RL", "NYSE:MRO", "NYSE:KOS", "NYSE:DINO", "NASDAQ:CYN",
    "NYSE:LOW", "NYSE:TGT", "NYSE:TJX", "AMEX:FRD", "NASDAQ:CSCO", "NASDAQ:DGLY",
    "NYSE:KSS", "NYSE:BJ", "NASDAQ:CSIQ", "NASDAQ:SPTN", "NYSE:TPR", "NYSE:SQM",
    "NYSE:SPOT", "NASDAQ:AMAT", "NASDAQ:ROST", "NYSE:DE", "NYSE:FL", "NYSE:VIPS",
    "NASDAQ:MTCH", "NASDAQ:WDAY", "NASDAQ:BCDA", "NASDAQ:AMWD", "NASDAQ:FSLR",
    "NASDAQ:REGN", "NASDAQ:WEN", "NASDAQ:ATXG", "NYSE:BLND", "AMEX:LABU", "AMEX:HYG",
    "NASDAQ:MULN", "NYSE:ZIM", "NYSE:VZ", "AMEX:ARKK", "NASDAQ:ZS", "NYSE:HKD",
    "NASDAQ:GCTK", "NYSE:RRC", "AMEX:USO", "NYSE:NOW", "NASDAQ:TTWO", "NYSE:PAYC",
    "NYSE:CLX", "NASDAQ:LAZR", "NYSE:WAL", "NASDAQ:TEAM", "NASDAQ:PDD", "NASDAQ:TMUS",
    "NASDAQ:MRVL", "NASDAQ:ASML", "NASDAQ:SNPS", "NASDAQ:AVGO", "NASDAQ:MELI",
    "NASDAQ:ORLY", "NASDAQ:ADI", "NASDAQ:CHTR", "NASDAQ:LRCX", "NYSE:DPZ", "NYSE:APH",
    "NASDAQ:PSNY", "NYSE:HPE", "NYSE:HPQ", "NYSE:UHAL", "NYSE:AI", "NYSE:CCJ",
    "NYSE:UNFI", "NYSE:CVS", "NASDAQ:TCOM", "NASDAQ:ATLX", "NASDAQ:VBNK", "NYSE:TTC",
    "NYSE:CNC", "NYSE:CHWY", "NYSE:SIG", "NYSE:PNC", "NASDAQ:WBA", "NASDAQ:BILI",
    "NYSE:UNH", "NYSE:GWW", "NYSE:BMY", "NYSE:XPEV", "NYSE:ELF", "NASDAQ:WW",
    "NASDAQ:PENN", "NYSE:MDT", "NYSE:A", "NASDAQ:CROX", "AMEX:XLF", "AMEX:XLE",
    "AMEX:XLU", "AMEX:XLV", "AMEX:XLK", "AMEX:XLP", "AMEX:XLY", "AMEX:XLI",
    "AMEX:XLC", "AMEX:XLB", "AMEX:XLRE", "AMEX:FXI", "NASDAQ:JBHT", "NASDAQ:SMCI",
    "NYSE:ORCL", "NYSE:MP", "NASDAQ:CRSP", "NYSE:TWLO", "NASDAQ:MARA", "NASDAQ:CAR",
    "NASDAQ:MNMD", "NYSE:CMG", "NASDAQ:SWKS", "NYSE:SAVE", "NASDAQ:INVZ", "NASDAQ:VGLT",
    "NASDAQ:LNTH", "NASDAQ:AMZN", "NASDAQ:ARM"
]

def get_database_symbols() -> List[str]:
    """الحصول على رموز قاعدة البيانات الحالية"""
    try:
        response = requests.get("http://localhost:5000/api/symbols", timeout=10)
        if response.status_code == 200:
            data = response.json()
            return [symbol['symbol'] for symbol in data['symbols']]
        else:
            print(f"❌ فشل في الوصول لقاعدة البيانات: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ خطأ في الاتصال بقاعدة البيانات: {e}")
        return []

def categorize_symbol(symbol: str) -> str:
    """تصنيف الرمز حسب البورصة/السوق"""
    if symbol.startswith("NASDAQ:"):
        return "🔵 NASDAQ"
    elif symbol.startswith("NYSE:"):
        return "🔴 NYSE"
    elif symbol.startswith("AMEX:"):
        return "🟠 AMEX/ETFs"
    elif symbol.startswith("BINANCE:") or symbol.startswith("CRYPTO:") or symbol.startswith("KUCOIN:"):
        return "🪙 العملات الرقمية"
    elif symbol.startswith("TADAWUL:"):
        return "🇸🇦 السوق السعودي"
    elif symbol.startswith("TVC:") or symbol.startswith("OANDA:") or symbol.startswith("SP:"):
        return "📊 المؤشرات"
    elif symbol.startswith("NYMEX:") or symbol.startswith("CME") or symbol.startswith("COMEX:"):
        return "🛢️ السلع والعقود"
    elif symbol.startswith("CBOE:"):
        return "📈 CBOE"
    elif symbol.startswith("FOREXCOM:") or symbol.startswith("PEPPERSTONE:") or symbol.startswith("SAXO:"):
        return "💱 الفوركس"
    else:
        return "❓ أخرى"

def analyze_markets():
    """تحليل ومقارنة الأسواق"""
    
    print("🔍 بدء تحليل الأسواق...\n")
    
    # الحصول على البيانات
    external_symbols = set(EXTERNAL_FILE_SYMBOLS)
    db_symbols = set(get_database_symbols())
    
    if not db_symbols:
        print("❌ لا يمكن الوصول لقاعدة البيانات")
        return
    
    # المقارنة
    missing_in_db = external_symbols - db_symbols
    missing_in_external = db_symbols - external_symbols
    common_symbols = external_symbols & db_symbols
    
    # الإحصائيات العامة
    print("📊 الإحصائيات العامة:")
    print(f"   📄 رموز الملف الخارجي: {len(external_symbols)}")
    print(f"   💾 رموز قاعدة البيانات: {len(db_symbols)}")
    print(f"   ✅ رموز مشتركة: {len(common_symbols)}")
    print(f"   ❌ ناقصة في قاعدة البيانات: {len(missing_in_db)}")
    print(f"   ➕ إضافية في قاعدة البيانات: {len(missing_in_external)}")
    print(f"   📈 نسبة التطابق: {(len(common_symbols) / len(external_symbols) * 100):.1f}%\n")
    
    # تحليل الرموز الناقصة حسب الفئة
    if missing_in_db:
        print("❌ الرموز الناقصة في قاعدة البيانات:")
        categorized_missing = {}
        for symbol in missing_in_db:
            category = categorize_symbol(symbol)
            if category not in categorized_missing:
                categorized_missing[category] = []
            categorized_missing[category].append(symbol)
        
        for category, symbols in categorized_missing.items():
            print(f"\n   {category} ({len(symbols)} رموز):")
            for symbol in sorted(symbols):
                print(f"     • {symbol}")
    
    # تحليل الرموز الإضافية
    if missing_in_external:
        print(f"\n➕ الرموز الإضافية في قاعدة البيانات (غير موجودة في الملف الخارجي):")
        categorized_extra = {}
        for symbol in missing_in_external:
            category = categorize_symbol(symbol)
            if category not in categorized_extra:
                categorized_extra[category] = []
            categorized_extra[category].append(symbol)
        
        for category, symbols in categorized_extra.items():
            print(f"\n   {category} ({len(symbols)} رموز):")
            for symbol in sorted(symbols)[:10]:  # عرض أول 10 فقط
                print(f"     • {symbol}")
            if len(symbols) > 10:
                print(f"     ... و {len(symbols) - 10} رموز أخرى")
    
    return missing_in_db, missing_in_external, common_symbols

def add_missing_symbols(missing_symbols: Set[str]):
    """إضافة الرموز الناقصة إلى قاعدة البيانات"""
    if not missing_symbols:
        print("✅ جميع الرموز موجودة في قاعدة البيانات")
        return
    
    print(f"\n🔄 بدء إضافة {len(missing_symbols)} رمز ناقص...")
    
    # تحويل إلى قائمة مرتبة
    symbols_to_add = sorted(list(missing_symbols))
    
    # إنشاء ملف Python لإضافة الرموز
    script_content = f'''#!/usr/bin/env python3
"""
إضافة الرموز الناقصة إلى قاعدة البيانات
تم إنشاؤه تلقائياً بواسطة أداة المقارنة
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
    """إضافة الرموز الناقصة"""
    
    # الرموز المطلوب إضافتها
    missing_symbols = {symbols_to_add}
    
    logger.info(f"🔄 بدء إضافة {{len(missing_symbols)}} رمز ناقص")
    
    try:
        tv = TvDatafeedMongoDB()
        
        # تقسيم الرموز إلى مجموعات للمعالجة
        batch_size = 10
        batches = [missing_symbols[i:i + batch_size] for i in range(0, len(missing_symbols), batch_size)]
        
        successful_count = 0
        failed_symbols = []
        
        for i, batch in enumerate(batches, 1):
            logger.info(f"📦 معالجة المجموعة {{i}}/{{len(batches)}} ({{len(batch)}} رموز)")
            
            try:
                results = tv.collect_multiple_symbols_to_mongodb(
                    symbols=batch,
                    interval=Interval.in_15_minute,
                    n_bars=1000,
                    save_csv=True,
                    output_dir="data_15min"
                )
                
                for symbol, count in results.items():
                    if count > 0:
                        successful_count += 1
                        logger.info(f"  ✅ {{symbol}}: {{count}} سجل")
                    else:
                        failed_symbols.append(symbol)
                        logger.warning(f"  ⚠️ {{symbol}}: فشل")
                        
            except Exception as e:
                logger.error(f"❌ خطأ في المجموعة {{i}}: {{e}}")
                failed_symbols.extend(batch)
        
        # الملخص النهائي
        logger.info(f"\\n🎉 تم إتمام العملية!")
        logger.info(f"✅ تم إضافة {{successful_count}} رمز بنجاح")
        
        if failed_symbols:
            logger.info(f"❌ فشل في إضافة {{len(failed_symbols)}} رمز:")
            for symbol in failed_symbols:
                logger.info(f"  • {{symbol}}")
        
        tv.close_connection()
        
    except Exception as e:
        logger.error(f"❌ خطأ عام: {{e}}")
        return False
        
    return True

if __name__ == "__main__":
    success = main()
    if success:
        logger.info("✅ تم إتمام العملية بنجاح")
    else:
        logger.error("❌ فشلت العملية")
        sys.exit(1)
'''
    
    # حفظ السكريبت
    script_path = "add_missing_markets.py"
    with open(script_path, "w", encoding="utf-8") as f:
        f.write(script_content)
    
    print(f"✅ تم إنشاء ملف الإضافة: {script_path}")
    print(f"🔄 تشغيل السكريبت...")
    
    # تشغيل السكريبت
    import subprocess
    try:
        result = subprocess.run([sys.executable, script_path], 
                              capture_output=True, 
                              text=True, 
                              encoding='utf-8')
        
        if result.returncode == 0:
            print("✅ تم تشغيل سكريبت الإضافة بنجاح")
            print(result.stdout)
        else:
            print("❌ فشل في تشغيل سكريبت الإضافة")
            print(result.stderr)
            
    except Exception as e:
        print(f"❌ خطأ في تشغيل السكريبت: {e}")

def main():
    """الدالة الرئيسية"""
    print("🚀 أداة مقارنة الأسواق وإضافة الرموز الناقصة")
    print("=" * 60)
    
    # تحليل الأسواق
    missing_in_db, missing_in_external, common_symbols = analyze_markets()
    
    # عرض التوصيات
    print("\n💡 التوصيات:")
    if missing_in_db:
        print(f"   🔄 إضافة {len(missing_in_db)} رمز ناقص إلى قاعدة البيانات")
        
        # سؤال المستخدم
        response = input("\\nهل تريد إضافة الرموز الناقصة الآن؟ (y/n): ").lower().strip()
        if response in ['y', 'yes', 'نعم', 'ن']:
            add_missing_symbols(missing_in_db)
        else:
            print("⏭️ تم تخطي إضافة الرموز")
    else:
        print("   ✅ جميع رموز الملف الخارجي موجودة في قاعدة البيانات")
    
    if missing_in_external:
        print(f"   ℹ️ قاعدة البيانات تحتوي على {len(missing_in_external)} رمز إضافي غير موجود في الملف الخارجي")
    
    print("\\n🎉 تم إنهاء التحليل")

if __name__ == "__main__":
    main()
