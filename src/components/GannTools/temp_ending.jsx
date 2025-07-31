// تصدير المكون مع Provider
const GannCircle360CanvasWithMarketData = (props) => {
  return (
    <MarketDataProvider>
      <GannCircle360Canvas {...props} />
    </MarketDataProvider>
  );
};

export default GannCircle360CanvasWithMarketData;
