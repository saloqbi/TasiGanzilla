import React from 'react';
import { ToolProvider } from './context/ToolContext';
import { LanguageProvider } from './context/LanguageContext';
import Home from './pages/Home';
import HomeEnhanced from './pages/HomeEnhanced';
import TestPage from './pages/TestPage';
import GannzillaClassicFullOptionsV94 from './components/GannTools/GannzillaClassicFullOptionsV94';
import GannzillaBilingualToggleV95 from './components/GannTools/GannzillaBilingualToggleV95';
import GannzillaConnectionSettingsV96 from './components/GannTools/GannzillaConnectionSettingsV96';
import GannzillaExactToolbarV97 from './components/GannTools/GannzillaExactToolbarV97';
import GannzillaToolbarComfortScaleV98 from './components/GannTools/GannzillaToolbarComfortScaleV98';
import GannzillaMissingConnectionIconV99 from './components/GannTools/GannzillaMissingConnectionIconV99';
import GannzillaCrispLanguageFlagV100 from './components/GannTools/GannzillaCrispLanguageFlagV100';
import GannzillaToolbarFullHeightScaleV101 from './components/GannTools/GannzillaToolbarFullHeightScaleV101';
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
            <>
              <GannzillaClassicFullOptionsV94 />
              <GannzillaBilingualToggleV95 />
              <GannzillaConnectionSettingsV96 />
              <GannzillaExactToolbarV97 />
              <GannzillaToolbarComfortScaleV98 />
              <GannzillaMissingConnectionIconV99 />
              <GannzillaCrispLanguageFlagV100 />
              <GannzillaToolbarFullHeightScaleV101 />
            </>
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
