import React from 'react';
import { ToolProvider } from './context/ToolContext';
import { LanguageProvider } from './context/LanguageContext';
import Home from './pages/Home';
import HomeEnhanced from './pages/HomeEnhanced';
import TestPage from './pages/TestPage';
import GannzillaClassicFixedFontV93 from './components/GannTools/GannzillaClassicFixedFontV93';
import GannzillaArabicAiWheelSystemV1 from './components/GannTools/GannzillaArabicAiWheelSystemV1';

const App = () => {
  const search = window.location.search;
  const isTestMode = search.includes('test=true');
  const isArabicAiWheelMode = search.includes('gannzillaArabicAI=true') || search.includes('aiWheel=true');
  const isGannzillaProWheelMode = search.includes('gannzillaPro=true') || search.includes('wheelPro=true');
  const isEnhancedMode = search.includes('enhanced=true') || true;

  return (
    <ToolProvider>
      <LanguageProvider>
        <div>
          {isArabicAiWheelMode ? (
            <GannzillaArabicAiWheelSystemV1 />
          ) : isGannzillaProWheelMode ? (
            <GannzillaClassicFixedFontV93 />
          ) : isTestMode ? (
            <TestPage />
          ) : isEnhancedMode ? (
            <HomeEnhanced />
          ) : (
            <Home />
          )}
        </div>
      </LanguageProvider>
    </ToolProvider>
  );
};

export default App;
