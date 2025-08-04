export const ALL_SYMBOLS_CATEGORIES = {
  all: { 
    name: '🌍 جميع الأسواق', 
    symbols: [],
    description: 'عرض جميع الرموز المتاحة من كافة الأسواق (307 رمز)'
  },
  us_nasdaq: { 
    name: '📊 NASDAQ الأمريكي', 
    symbols: [
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
      'NASDAQ:SWKS', 'NASDAQ:INVZ', 'NASDAQ:VGLT', 'NASDAQ:LNTH', 'NASDAQ:ARM'
    ],
    description: 'جميع أسهم NASDAQ - الشركات التقنية والنمو (77 رمز)'
  },
  us_nyse: { 
    name: '🏛️ NYSE الأمريكي', 
    symbols: [
      'NYSE:MMM', 'NYSE:BA', 'NYSE:SHAK', 'NYSE:RBLX', 'NYSE:WELL', 'NYSE:SPCE', 'NYSE:GS', 'NYSE:AMC', 'NYSE:GE', 'NYSE:FDX', 
      'NYSE:LUV', 'NYSE:NKE', 'NYSE:BAC', 'NYSE:U', 'NYSE:HSY', 'NYSE:SQ', 'NYSE:PFE', 'NYSE:SHOP', 'NYSE:SNOW', 'NYSE:SNAP', 
      'NYSE:DIS', 'NYSE:HD', 'NYSE:BABA', 'NYSE:CAT', 'NYSE:JNJ', 'NYSE:WFC', 'NYSE:PG', 'NYSE:MCD', 'NYSE:X', 'NYSE:ABBV', 
      'NYSE:LMT', 'NYSE:SWK', 'NYSE:SYK', 'NYSE:IBM', 'NYSE:CF', 'NYSE:BBWI', 'NYSE:NIO', 'NYSE:GME', 'NYSE:AA', 'NYSE:BBY', 
      'NYSE:EOG', 'NYSE:MA', 'NYSE:V', 'NYSE:NTR', 'NYSE:GRMN', 'NYSE:WMT', 'NYSE:TSN', 'NYSE:D', 'NYSE:RL', 'NYSE:MRO', 
      'NYSE:KOS', 'NYSE:DINO', 'NYSE:LOW', 'NYSE:TGT', 'NYSE:TJX', 'NYSE:KSS', 'NYSE:BJ', 'NYSE:TPR', 'NYSE:SQM', 'NYSE:SPOT', 
      'NYSE:DE', 'NYSE:FL', 'NYSE:VIPS', 'NYSE:BLND', 'NYSE:ZIM', 'NYSE:VZ', 'NYSE:HKD', 'NYSE:RRC', 'NYSE:NOW', 'NYSE:PAYC', 
      'NYSE:CLX', 'NYSE:WAL', 'NYSE:HPE', 'NYSE:HPQ', 'NYSE:UHAL', 'NYSE:AI', 'NYSE:CCJ', 'NYSE:UNFI', 'NYSE:CVS', 'NYSE:TTC', 
      'NYSE:CNC', 'NYSE:CHWY', 'NYSE:SIG', 'NYSE:PNC', 'NYSE:UNH', 'NYSE:GWW', 'NYSE:BMY', 'NYSE:XPEV', 'NYSE:ELF', 'NYSE:MDT', 
      'NYSE:A', 'NYSE:ORCL', 'NYSE:MP', 'NYSE:TWLO', 'NYSE:CMG', 'NYSE:SAVE', 'NYSE:UAL'
    ],
    description: 'جميع أسهم NYSE - الشركات التقليدية والصناعية (87 رمز)'
  },
  us_etfs: { 
    name: '📈 صناديق الاستثمار', 
    symbols: [
      'AMEX:EEM', 'AMEX:SPY', 'AMEX:VIXY', 'AMEX:UVXY', 'AMEX:FRD', 'AMEX:LABU', 'AMEX:HYG', 'AMEX:USO', 'AMEX:ARKK', 
      'AMEX:XLF', 'AMEX:XLE', 'AMEX:XLU', 'AMEX:XLV', 'AMEX:XLK', 'AMEX:XLP', 'AMEX:XLY', 'AMEX:XLI', 'AMEX:XLC', 'AMEX:XLB', 'AMEX:XLRE', 'AMEX:FXI'
    ],
    description: 'جميع صناديق الاستثمار المتداولة من AMEX (21 رمز)'
  },
  crypto_all: { 
    name: '🪙 العملات الرقمية', 
    symbols: [
      'BINANCE:BTCUSD', 'BINANCE:BTCUSDT', 'BINANCE:BNBUSDT', 'BINANCE:XRPUSD', 'BINANCE:XRPUSDT', 'BINANCE:DOGEUSDT', 
      'BINANCE:SOLUSDT', 'BINANCE:ETHUSDT', 'BINANCE:WIFUSDT', 'BINANCE:HFTUSDT', 'BINANCE:ENSUSDT', 'BINANCE:FTMUSDT', 
      'BINANCE:AUCTIONUSDT', 'BINANCE:LUNAUSDT'
    ],
    description: 'جميع العملات المشفرة من Binance و Crypto و KuCoin (14 رمز)'
  },
  indices_global: { 
    name: '📊 المؤشرات العالمية', 
    symbols: [
      'TVC:DJI', 'TVC:SPX', 'OANDA:US30USD', 'OANDA:NAS100USD', 'TVC:VIX', 'TVC:DXY', 'TVC:NIKKEI', 
      'TVC:SPX500', 'OANDA:US500', 'TVC:VVIX', 'TVC:XSP'
    ],
    description: 'جميع المؤشرات العالمية ومقاييس التقلبات (11 رمز)'
  },
  commodities_futures: { 
    name: '🛢️ السلع والعقود', 
    symbols: ['NYMEX:CL1!', 'CME:NQ1!', 'CME:ES1!', 'TVC:UKOIL', 'TVC:GOLD', 'OANDA:XAUUSD', 'FOREXCOM:XAUUSD', 'COMEX:GC1!'],
    description: 'النفط الخام والذهب والعقود الآجلة للمؤشرات (8 رموز)'
  },
  saudi_market: { 
    name: '🇸🇦 السوق السعودي', 
    symbols: ['TADAWUL:TASI', 'TADAWUL:MT30', 'TADAWUL:4011', 'TADAWUL:2240', 'TADAWUL:2001'],
    description: 'جميع رموز السوق السعودي من تداول (5 رموز)'
  }
};
