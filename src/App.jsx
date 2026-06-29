import React from 'react';
import { ToolProvider } from './context/ToolContext';
import { LanguageProvider } from './context/LanguageContext';
import Home from './pages/Home';
import HomeEnhanced from './pages/HomeEnhanced';
import TestPage from './pages/TestPage';
import SimpleTriangleTest from './components/GannTools/SimpleTriangleTest';
import InteractiveTriangle from './components/InteractiveTriangle';
import GannzillaProWheelExact from './components/GannTools/GannzillaProWheelExact';

const App = () => {
  // للتبديل بين الصفحة الرئيسية وصفحة الاختبار
  const search = window.location.search;
  const isTestMode = search.includes('test=true');
  const isGannzillaProWheelMode = search.includes('gannzillaPro=true') || search.includes('wheelPro=true');
  const isEnhancedMode = search.includes('enhanced=true') || true; // افتراضياً الإصدار المحسن
  
  return (
    <ToolProvider>
      <LanguageProvider>
        <div>
          {isGannzillaProWheelMode ? (
            <GannzillaProWheelExact />
          ) : isTestMode ? (
            <TestPage />
          ) : isEnhancedMode ? (
            <HomeEnhanced />
          ) : (
            <>
              {/* <InteractiveTriangle />
              <hr style={{ margin: "20px 0" }} />
              <SimpleTriangleTest />
              <hr style={{ margin: "20px 0" }} /> */}
              <Home />
            </>
          )}
        </div>
      </LanguageProvider>
    </ToolProvider>
  );
};

export default App;
