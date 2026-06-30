import React from 'react';
import { ToolProvider } from './context/ToolContext';
import { LanguageProvider } from './context/LanguageContext';
import Home from './pages/Home';
import HomeEnhanced from './pages/HomeEnhanced';
import TestPage from './pages/TestPage';
import SimpleTriangleTest from './components/GannTools/SimpleTriangleTest';
import InteractiveTriangle from './components/InteractiveTriangle';
import GannzillaProWheelExact from './components/GannTools/GannzillaProWheelExact';
import GannzillaCellHighlightFix from './components/GannTools/GannzillaCellHighlightFix';
import GannzillaFrameShapeMode from './components/GannTools/GannzillaFrameShapeMode';
import GannzillaShapeGuard from './components/GannTools/GannzillaShapeGuard';
import GannzillaSpiralDrawingFix from './components/GannTools/GannzillaSpiralDrawingFix';
import GannzillaProUiPatch from './components/GannTools/GannzillaProUiPatch';
import GannzillaOptionsClarityBinding from './components/GannTools/GannzillaOptionsClarityBinding';
import GannzillaPanelReadableScale from './components/GannTools/GannzillaPanelReadableScale';
import GannzillaAdvancedOptionSections from './components/GannTools/GannzillaAdvancedOptionSections';
import GannzillaAdvancedColorsPatch from './components/GannTools/GannzillaAdvancedColorsPatch';
import GannzillaExtraPanelsBinding from './components/GannTools/GannzillaExtraPanelsBinding';
import GannzillaLanguageSwitch from './components/GannTools/GannzillaLanguageSwitch';
import GannzillaWheelPanButtonsPatch from './components/GannTools/GannzillaWheelPanButtonsPatch';
import GannzillaCardinalBalancePatch from './components/GannTools/GannzillaCardinalBalancePatch';
import GannzillaOptionsBadgeHidePatch from './components/GannTools/GannzillaOptionsBadgeHidePatch';
import GannzillaPanelToggleTopbarPatch from './components/GannTools/GannzillaPanelToggleTopbarPatch';

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
            <>
              <GannzillaProWheelExact />
              <GannzillaCellHighlightFix />
              <GannzillaFrameShapeMode />
              <GannzillaShapeGuard />
              <GannzillaSpiralDrawingFix />
              <GannzillaProUiPatch />
              <GannzillaOptionsClarityBinding />
              <GannzillaPanelReadableScale />
              <GannzillaAdvancedOptionSections />
              <GannzillaAdvancedColorsPatch />
              <GannzillaExtraPanelsBinding />
              <GannzillaLanguageSwitch />
              <GannzillaWheelPanButtonsPatch />
              <GannzillaCardinalBalancePatch />
              <GannzillaOptionsBadgeHidePatch />
              <GannzillaPanelToggleTopbarPatch />
            </>
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
