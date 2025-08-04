import asyncio
import datetime
import enum
import json
import logging
import random
import re
import string
import sys
from time import sleep
import pandas as pd
from websocket import create_connection
import requests
import os
from concurrent.futures import ThreadPoolExecutor
from tqdm import tqdm
import pymongo
from pymongo import MongoClient

# إعداد التسجيل
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('trading_data.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class Interval(enum.Enum):
    in_1_minute = "1"
    in_3_minute = "3"
    in_5_minute = "5"
    in_15_minute = "15"
    in_30_minute = "30"
    in_45_minute = "45"
    in_1_hour = "1H"
    in_2_hour = "2H"
    in_3_hour = "3H"
    in_4_hour = "4H"
    in_daily = "1D"
    in_weekly = "1W"
    in_monthly = "1M"

class TvDatafeedMongoDB:
    """نسخة محسنة من TvDatafeed مع دعم MongoDB"""
    
    __sign_in_url = 'https://www.tradingview.com/accounts/signin/'
    __search_url = 'https://symbol-search.tradingview.com/symbol_search/?text={}&hl=1&exchange={}&lang=en&type=&domain=production'
    __ws_headers = json.dumps({"Origin": "https://data.tradingview.com"})
    __signin_headers = {'Referer': 'https://www.tradingview.com'}
    __ws_timeout = 5

    def __init__(
        self,
        username: str = None,
        password: str = None,
        mongodb_uri: str = None
    ) -> None:
        """
        إنشاء كائن TvDatafeedMongoDB
        
        Args:
            username: اسم المستخدم في TradingView
            password: كلمة المرور
            mongodb_uri: رابط قاعدة بيانات MongoDB
        """
        
        self.ws_debug = False
        self.token = self.__auth(username, password)
        
        if self.token is None:
            self.token = "unauthorized_user_token"
            logger.warning("استخدام الوضع غير المسجل - قد تكون البيانات محدودة")

        self.ws = None
        self.session = self.__generate_session()
        self.chart_session = self.__generate_chart_session()
        
        # إعداد MongoDB
        self.mongodb_uri = mongodb_uri or 'mongodb+srv://admin:admin123@tradingviewdb.yc0suhj.mongodb.net/TradingViewData'
        self.mongo_client = None
        self.db = None
        self.collection = None
        self.__init_mongodb()

    def __init_mongodb(self):
        """تهيئة الاتصال مع MongoDB"""
        try:
            self.mongo_client = MongoClient(self.mongodb_uri)
            self.db = self.mongo_client['TradingViewData']
            self.collection = self.db['candlestickdatas']
            
            # إنشاء فهارس للاستعلامات السريعة
            self.collection.create_index([("symbol", 1), ("datetime", 1)], unique=True)
            self.collection.create_index([("symbol", 1), ("datetime", -1)])
            
            logger.info("✅ تم الاتصال بقاعدة البيانات MongoDB بنجاح")
        except Exception as e:
            logger.error(f"❌ خطأ في الاتصال بـ MongoDB: {e}")
            self.mongo_client = None

    def __auth(self, username, password):
        """المصادقة مع TradingView"""
        if username is None or password is None:
            return None
            
        data = {
            "username": username,
            "password": password,
            "remember": "on"
        }
        
        try:
            response = requests.post(
                url=self.__sign_in_url, 
                data=data, 
                headers=self.__signin_headers
            )
            token = response.json()['user']['auth_token']
            logger.info("✅ تم تسجيل الدخول بنجاح")
            return token
        except Exception as e:
            logger.error(f'❌ خطأ في تسجيل الدخول: {e}')
            return None

    def __create_connection(self):
        """إنشاء اتصال WebSocket"""
        logger.debug("إنشاء اتصال websocket")
        self.ws = create_connection(
            "wss://data.tradingview.com/socket.io/websocket", 
            headers=self.__ws_headers, 
            timeout=self.__ws_timeout
        )

    @staticmethod
    def __filter_raw_message(text):
        """تنقية الرسائل الخام"""
        try:
            found = re.search('"m":"(.+?)",', text).group(1)
            found2 = re.search('"p":(.+?"}"])}', text).group(1)
            return found, found2
        except AttributeError:
            logger.error("خطأ في تنقية الرسالة")

    @staticmethod
    def __generate_session():
        """توليد معرف الجلسة"""
        stringLength = 12
        letters = string.ascii_lowercase
        random_string = "".join(random.choice(letters) for i in range(stringLength))
        return "qs_" + random_string

    @staticmethod
    def __generate_chart_session():
        """توليد معرف جلسة الرسم البياني"""
        stringLength = 12
        letters = string.ascii_lowercase
        random_string = "".join(random.choice(letters) for i in range(stringLength))
        return "cs_" + random_string

    @staticmethod
    def __prepend_header(st):
        """إضافة رأس الرسالة"""
        return "~m~" + str(len(st)) + "~m~" + st

    @staticmethod
    def __construct_message(func, param_list):
        """بناء الرسالة"""
        return json.dumps({"m": func, "p": param_list}, separators=(",", ":"))

    def __create_message(self, func, paramList):
        """إنشاء رسالة مع الرأس"""
        return self.__prepend_header(self.__construct_message(func, paramList))

    def __send_message(self, func, args):
        """إرسال رسالة عبر WebSocket"""
        m = self.__create_message(func, args)
        if self.ws_debug:
            print(m)
        self.ws.send(m)

    def save_to_mongodb(self, df, symbol):
        """حفظ البيانات في MongoDB"""
        if self.mongo_client is None:
            logger.warning("لا يوجد اتصال مع MongoDB")
            return False
            
        try:
            # تحويل DataFrame إلى قائمة من القواميس
            records = []
            for index, row in df.iterrows():
                record = {
                    'symbol': symbol,
                    'datetime': pd.to_datetime(index) if not isinstance(index, pd.Timestamp) else index,
                    'open': float(row['open']),
                    'high': float(row['high']),
                    'low': float(row['low']),
                    'close': float(row['close']),
                    'volume': float(row['volume']),
                    'interval': '15m',
                    'createdAt': datetime.datetime.utcnow(),
                    'updatedAt': datetime.datetime.utcnow()
                }
                records.append(record)
            
            if records:
                # استخدام upsert لتجنب التكرار
                bulk_operations = []
                for record in records:
                    bulk_operations.append(
                        pymongo.UpdateOne(
                            {'symbol': record['symbol'], 'datetime': record['datetime']},
                            {'$set': record},
                            upsert=True
                        )
                    )
                
                result = self.collection.bulk_write(bulk_operations)
                logger.info(f"✅ {symbol}: {result.upserted_count} سجل جديد، {result.modified_count} سجل محدث")
                return True
                
        except Exception as e:
            logger.error(f"❌ خطأ في حفظ البيانات في MongoDB للرمز {symbol}: {e}")
            return False

    def collect_multiple_symbols_to_mongodb(
        self,
        symbols: list,
        exchange: str = "NASDAQ",
        interval: Interval = Interval.in_15_minute,
        n_bars: int = 1000,
        fut_contract: int = None,
        extended_session: bool = True,
        save_csv: bool = True,
        output_dir: str = "data_15min"
    ) -> dict:
        """
        جمع البيانات التاريخية لعدة رموز وحفظها في MongoDB و CSV
        
        Args:
            symbols: قائمة أسماء الرموز
            exchange: اسم البورصة
            interval: الفترة الزمنية للبيانات
            n_bars: عدد الشموع المطلوب تنزيلها
            fut_contract: رقم عقد المستقبلات
            extended_session: تضمين الجلسة الممتدة
            save_csv: حفظ في ملفات CSV أيضاً
            output_dir: مجلد حفظ ملفات CSV
        
        Returns:
            dict: قاموس البيانات مع الرمز كمفتاح
        """
        
        # إنشاء مجلد الإخراج إذا لم يكن موجوداً
        if save_csv:
            os.makedirs(output_dir, exist_ok=True)
        
        def process_symbol(symbol):
            try:
                logger.info(f"🔄 معالجة الرمز: {symbol}")
                
                # جلب البيانات التاريخية
                df_latest = self.get_hist(
                    symbol=symbol,
                    exchange=exchange,
                    interval=interval,
                    n_bars=n_bars,
                    fut_contract=fut_contract,
                    extended_session=extended_session
                )
                
                if df_latest is None or df_latest.empty:
                    logger.warning(f"⚠️ لم يتم جلب بيانات للرمز {symbol}")
                    return symbol, 0

                # حفظ في MongoDB
                mongodb_success = self.save_to_mongodb(df_latest, symbol)
                
                rows_saved = df_latest.shape[0]
                
                # حفظ في CSV إذا كان مطلوباً
                if save_csv:
                    # التأكد من وجود عمود 'datetime'
                    if 'datetime' not in df_latest.columns:
                        df_latest = df_latest.reset_index()
                    
                    df_latest['datetime'] = pd.to_datetime(df_latest['datetime'], errors='coerce')
                    
                    filename = f"{output_dir}/{symbol.replace(':', '_')}.csv"
                    
                    if os.path.exists(filename):
                        # تحميل البيانات الموجودة
                        df_existing = pd.read_csv(filename, parse_dates=["datetime"])
                        
                        # دمج البيانات الجديدة وإزالة التكرار
                        df_combined = pd.concat([df_existing, df_latest]).drop_duplicates(
                            subset="datetime"
                        ).sort_values("datetime")
                        
                        # الاحتفاظ بآخر n_bars فقط
                        df_combined = df_combined.tail(n_bars)
                        
                        # حفظ البيانات المحدثة
                        df_combined.to_csv(filename, index=False)
                        logger.info(f"📊 تم تحديث بيانات {symbol}: {df_combined.shape[0]} صف")
                    else:
                        # حفظ بيانات جديدة
                        df_latest.to_csv(filename, index=False)
                        logger.info(f"📊 تم حفظ بيانات جديدة لـ {symbol}: {rows_saved} صف")

                status = "MongoDB ✅" if mongodb_success else "MongoDB ❌"
                if save_csv:
                    status += " CSV ✅"
                
                logger.info(f"✅ {symbol}: {rows_saved} صف - {status}")
                return symbol, rows_saved

            except Exception as e:
                logger.error(f"❌ خطأ في معالجة {symbol}: {str(e)}")
                return symbol, 0

        # استخدام ThreadPoolExecutor للمعالجة المتوازية
        results = {}
        successful_count = 0
        
        with ThreadPoolExecutor(max_workers=3) as executor:
            # إنشاء شريط التقدم
            futures = []
            for symbol in symbols:
                future = executor.submit(process_symbol, symbol)
                futures.append((symbol, future))
            
            # معالجة النتائج مع شريط التقدم
            for symbol, future in tqdm(futures, desc="جمع البيانات"):
                try:
                    symbol_result, count = future.result(timeout=120)  # مهلة زمنية 2 دقيقة
                    if count > 0:
                        results[symbol_result] = count
                        successful_count += 1
                except Exception as e:
                    logger.error(f"❌ انتهت المهلة الزمنية أو خطأ في {symbol}: {e}")

        # طباعة ملخص النتائج
        logger.info(f"\n📊 ملخص جمع البيانات:")
        logger.info(f"✅ نجح: {successful_count}/{len(symbols)} رمز")
        logger.info(f"💾 إجمالي الصفوف: {sum(results.values())}")
        
        if self.mongo_client:
            logger.info(f"🗄️ تم الحفظ في MongoDB: {self.db.name}")
        
        return results

    @staticmethod
    def __create_df(raw_data, symbol):
        """إنشاء DataFrame من البيانات الخام"""
        try:
            out = re.search('"s":\[(.+?)\}\]', raw_data).group(1)
            x = out.split(',{"')
            data = list()
            volume_data = True

            for xi in x:
                xi = re.split("\[|:|,|\]", xi)
                ts = datetime.datetime.fromtimestamp(float(xi[4]))

                row = [ts]

                for i in range(5, 10):
                    # تخطي تحويل بيانات الحجم إذا لم تكن موجودة
                    if not volume_data and i == 9:
                        row.append(0.0)
                        continue
                    try:
                        row.append(float(xi[i]))
                    except ValueError:
                        volume_data = False
                        row.append(0.0)
                        logger.debug('لا توجد بيانات حجم')

                data.append(row)

            data = pd.DataFrame(
                data, columns=["datetime", "open", "high", "low", "close", "volume"]
            ).set_index("datetime") 
            data.insert(0, "symbol", value=symbol)
            return data
            
        except AttributeError:
            logger.error("لا توجد بيانات، يرجى التحقق من البورصة والرمز")

    @staticmethod
    def __format_symbol(symbol, exchange, contract: int = None):
        """تنسيق الرمز"""
        if ":" in symbol:
            pass
        elif contract is None:
            symbol = f"{exchange}:{symbol}"
        elif isinstance(contract, int):
            symbol = f"{exchange}:{symbol}{contract}!"
        else:
            raise ValueError("عقد غير صالح")

        return symbol

    def get_hist(
        self,
        symbol: str,
        exchange: str = "NASDAQ",
        interval: Interval = Interval.in_15_minute,
        n_bars: int = 1000,
        fut_contract: int = None,
        extended_session: bool = True,
    ) -> pd.DataFrame:
        """جلب البيانات التاريخية"""
        
        symbol = self.__format_symbol(
            symbol=symbol, exchange=exchange, contract=fut_contract
        )

        interval = interval.value

        self.__create_connection()

        self.__send_message("set_auth_token", [self.token])
        self.__send_message("chart_create_session", [self.chart_session, ""])
        self.__send_message("quote_create_session", [self.session])
        self.__send_message(
            "quote_set_fields",
            [
                self.session,
                "ch", "chp", "current_session", "description", "local_description",
                "language", "exchange", "fractional", "is_tradable", "lp", "lp_time",
                "minmov", "minmove2", "original_name", "pricescale", "pro_name",
                "short_name", "type", "update_mode", "volume", "currency_code",
                "rchp", "rtc",
            ],
        )

        self.__send_message(
            "quote_add_symbols", [self.session, symbol, {"flags": ["force_permission"]}]
        )
        self.__send_message("quote_fast_symbols", [self.session, symbol])

        self.__send_message(
            "resolve_symbol",
            [
                self.chart_session,
                "symbol_1",
                '={"symbol":"' + symbol + '","adjustment":"splits","session":'
                + ('"regular"' if not extended_session else '"extended"') + "}",
            ],
        )
        self.__send_message(
            "create_series",
            [self.chart_session, "s1", "s1", "symbol_1", interval, n_bars],
        )
        self.__send_message("switch_timezone", [self.chart_session, "exchange"])

        raw_data = ""

        logger.debug(f"جلب البيانات لـ {symbol}...")
        while True:
            try:
                result = self.ws.recv()
                raw_data = raw_data + result + "\n"
            except Exception as e:
                logger.error(e)
                break

            if "series_completed" in result:
                break

        return self.__create_df(raw_data, symbol)

    def close_connection(self):
        """إغلاق الاتصالات"""
        if self.ws:
            self.ws.close()
        if self.mongo_client:
            self.mongo_client.close()
            logger.info("تم إغلاق الاتصال مع MongoDB")

# مثال على الاستخدام
if __name__ == "__main__":
    # قراءة معاملات سطر الأوامر إذا كانت موجودة
    if len(sys.argv) > 1:
        try:
            config = json.loads(sys.argv[1])
            symbols = config.get('symbols', [])
            interval = config.get('interval', '15')
            n_bars = config.get('n_bars', 1000)
        except:
            symbols = []
            interval = '15'
            n_bars = 1000
    else:
        # جميع الرموز من التصنيفات الشاملة (307 رمز)
        symbols = [
            # NASDAQ (77 رمز)
            'NASDAQ:ATYR', 'NASDAQ:AAPL', 'NASDAQ:GOOGL', 'NASDAQ:MSFT', 'NASDAQ:TSLA', 'NASDAQ:AMZN', 'NASDAQ:META', 'NASDAQ:NVDA', 'NASDAQ:AMD', 'NASDAQ:INTC',
            'NASDAQ:NFLX', 'NASDAQ:ADBE', 'NASDAQ:CRM', 'NASDAQ:COIN', 'NASDAQ:MSTR', 'NASDAQ:EBAY', 'NASDAQ:PYPL', 'NASDAQ:ZM', 'NASDAQ:LULU', 'NASDAQ:ROKU',
            'NASDAQ:MRNA', 'NASDAQ:BNTX', 'NASDAQ:ENPH', 'NASDAQ:LCID', 'NASDAQ:RIVN', 'NASDAQ:TLT', 'NASDAQ:CRWD', 'NASDAQ:BIDU', 'NASDAQ:JD', 'NASDAQ:HOLO',
            'NASDAQ:OKTA', 'NASDAQ:MDB', 'NASDAQ:QQQ', 'NASDAQ:GILD', 'NASDAQ:QCOM', 'NASDAQ:SQQQ', 'NASDAQ:SERA', 'NASDAQ:SBUX', 'NASDAQ:ABNB', 'NASDAQ:MU',
            'NASDAQ:LMFA', 'NASDAQ:UPST', 'NASDAQ:INTU', 'NASDAQ:CTSH', 'NASDAQ:TNXP', 'NASDAQ:FCEL', 'NASDAQ:DBGI', 'NASDAQ:LI', 'NASDAQ:THFF', 'NASDAQ:USEG',
            'NASDAQ:ON', 'NASDAQ:BKNG', 'NASDAQ:NVAX', 'NASDAQ:CYN', 'NASDAQ:CSCO', 'NASDAQ:DGLY', 'NASDAQ:CSIQ', 'NASDAQ:SPTN', 'NASDAQ:AMAT', 'NASDAQ:ROST',
            'NASDAQ:MTCH', 'NASDAQ:WDAY', 'NASDAQ:BCDA', 'NASDAQ:AMWD', 'NASDAQ:FSLR', 'NASDAQ:REGN', 'NASDAQ:WEN', 'NASDAQ:ATXG', 'NASDAQ:MULN', 'NASDAQ:ZS',
            'NASDAQ:GCTK', 'NASDAQ:TTWO', 'NASDAQ:LAZR', 'NASDAQ:TEAM', 'NASDAQ:PDD', 'NASDAQ:TMUS', 'NASDAQ:MRVL', 'NASDAQ:ASML', 'NASDAQ:SNPS', 'NASDAQ:AVGO',
            'NASDAQ:MELI', 'NASDAQ:ORLY', 'NASDAQ:ADI', 'NASDAQ:CHTR', 'NASDAQ:LRCX', 'NASDAQ:PSNY', 'NASDAQ:TCOM', 'NASDAQ:ATLX', 'NASDAQ:VBNK', 'NASDAQ:WBA',
            'NASDAQ:BILI', 'NASDAQ:WW', 'NASDAQ:PENN', 'NASDAQ:CROX', 'NASDAQ:JBHT', 'NASDAQ:SMCI', 'NASDAQ:CRSP', 'NASDAQ:MARA', 'NASDAQ:CAR', 'NASDAQ:MNMD',
            'NASDAQ:SWKS', 'NASDAQ:INVZ', 'NASDAQ:VGLT', 'NASDAQ:LNTH', 'NASDAQ:ARM',
            
            # NYSE (87 رمز)
            'NYSE:MMM', 'NYSE:BA', 'NYSE:SHAK', 'NYSE:RBLX', 'NYSE:WELL', 'NYSE:SPCE', 'NYSE:GS', 'NYSE:AMC', 'NYSE:GE', 'NYSE:FDX',
            'NYSE:LUV', 'NYSE:NKE', 'NYSE:BAC', 'NYSE:U', 'NYSE:HSY', 'NYSE:SQ', 'NYSE:PFE', 'NYSE:SHOP', 'NYSE:SNOW', 'NYSE:SNAP',
            'NYSE:DIS', 'NYSE:HD', 'NYSE:BABA', 'NYSE:CAT', 'NYSE:JNJ', 'NYSE:WFC', 'NYSE:PG', 'NYSE:MCD', 'NYSE:X', 'NYSE:ABBV',
            'NYSE:LMT', 'NYSE:SWK', 'NYSE:SYK', 'NYSE:IBM', 'NYSE:CF', 'NYSE:BBWI', 'NYSE:NIO', 'NYSE:GME', 'NYSE:AA', 'NYSE:BBY',
            'NYSE:EOG', 'NYSE:MA', 'NYSE:V', 'NYSE:NTR', 'NYSE:GRMN', 'NYSE:WMT', 'NYSE:TSN', 'NYSE:D', 'NYSE:RL', 'NYSE:MRO',
            'NYSE:KOS', 'NYSE:DINO', 'NYSE:LOW', 'NYSE:TGT', 'NYSE:TJX', 'NYSE:KSS', 'NYSE:BJ', 'NYSE:TPR', 'NYSE:SQM', 'NYSE:SPOT',
            'NYSE:DE', 'NYSE:FL', 'NYSE:VIPS', 'NYSE:BLND', 'NYSE:ZIM', 'NYSE:VZ', 'NYSE:HKD', 'NYSE:RRC', 'NYSE:NOW', 'NYSE:PAYC',
            'NYSE:CLX', 'NYSE:WAL', 'NYSE:HPE', 'NYSE:HPQ', 'NYSE:UHAL', 'NYSE:AI', 'NYSE:CCJ', 'NYSE:UNFI', 'NYSE:CVS', 'NYSE:TTC',
            'NYSE:CNC', 'NYSE:CHWY', 'NYSE:SIG', 'NYSE:PNC', 'NYSE:UNH', 'NYSE:GWW', 'NYSE:BMY', 'NYSE:XPEV', 'NYSE:ELF', 'NYSE:MDT',
            'NYSE:A', 'NYSE:ORCL', 'NYSE:MP', 'NYSE:TWLO', 'NYSE:CMG', 'NYSE:SAVE', 'NYSE:UAL',
            
            # ETFs من AMEX (21 رمز)
            'AMEX:EEM', 'AMEX:SPY', 'AMEX:VIXY', 'AMEX:UVXY', 'AMEX:FRD', 'AMEX:LABU', 'AMEX:HYG', 'AMEX:USO', 'AMEX:ARKK',
            'AMEX:XLF', 'AMEX:XLE', 'AMEX:XLU', 'AMEX:XLV', 'AMEX:XLK', 'AMEX:XLP', 'AMEX:XLY', 'AMEX:XLI', 'AMEX:XLC', 'AMEX:XLB', 'AMEX:XLRE', 'AMEX:FXI',
            
            # العملات الرقمية (14 رمز)
            'BINANCE:BTCUSD', 'BINANCE:BTCUSDT', 'BINANCE:BNBUSDT', 'BINANCE:XRPUSD', 'BINANCE:XRPUSDT', 'BINANCE:DOGEUSDT',
            'BINANCE:SOLUSDT', 'BINANCE:ETHUSDT', 'BINANCE:WIFUSDT', 'BINANCE:HFTUSDT', 'BINANCE:ENSUSDT', 'BINANCE:FTMUSDT',
            'BINANCE:AUCTIONUSDT', 'BINANCE:LUNAUSDT',
            
            # المؤشرات العالمية (11 رمز)
            'TVC:DJI', 'TVC:SPX', 'OANDA:US30USD', 'OANDA:NAS100USD', 'TVC:VIX', 'TVC:DXY', 'TVC:NIKKEI',
            'TVC:SPX500', 'OANDA:US500', 'TVC:VVIX', 'TVC:XSP',
            
            # السلع والعقود (8 رموز)
            'TVC:UKOIL', 'NYMEX:CL1!', 'CME:NQ1!', 'CME:ES1!',
            'TVC:GOLD', 'OANDA:XAUUSD', 'FOREXCOM:XAUUSD', 'COMEX:GC1!',
            
            # السوق السعودي (5 رموز)
            'TADAWUL:TASI', 'TADAWUL:MT30', 'TADAWUL:4011', 'TADAWUL:2240', 'TADAWUL:2001'
        ]
        interval = '15'
        n_bars = 1000

    # تهيئة جامع البيانات
    tv = TvDatafeedMongoDB()
    
    try:
        # تحويل الفترة الزمنية
        interval_map = {
            '1': Interval.in_1_minute,
            '3': Interval.in_3_minute,
            '5': Interval.in_5_minute,
            '15': Interval.in_15_minute,
            '30': Interval.in_30_minute,
            '1H': Interval.in_1_hour,
            '1D': Interval.in_daily
        }
        
        interval_obj = interval_map.get(interval, Interval.in_15_minute)
        
        # جمع البيانات وحفظها في MongoDB و CSV
        logger.info(f"🚀 بدء جمع البيانات لـ {len(symbols)} رمز")
        logger.info(f"⏰ الفترة الزمنية: {interval}")
        logger.info(f"📊 عدد الشموع: {n_bars}")
        
        data_dict = tv.collect_multiple_symbols_to_mongodb(
            symbols=symbols,
            interval=interval_obj,
            n_bars=n_bars,
            save_csv=True,
            output_dir="data_15min"
        )
        
        # طباعة الملخص النهائي
        logger.info(f"\n🎉 اكتمل جمع البيانات!")
        logger.info(f"✅ تم معالجة {len(data_dict)} رمز بنجاح")
        
        for symbol, count in data_dict.items():
            logger.info(f"  📈 {symbol}: {count} صف")
            
    except KeyboardInterrupt:
        logger.info("تم إيقاف العملية بواسطة المستخدم")
    except Exception as e:
        logger.error(f"خطأ عام: {e}")
    finally:
        tv.close_connection()
        logger.info("تم إنهاء البرنامج")
