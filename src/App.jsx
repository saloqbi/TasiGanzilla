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
import GannzillaWheelLineDrawPatch from './components/GannTools/GannzillaWheelLineDrawPatch';
import GannzillaArabicAiWheelSystemV1 from './components/GannTools/GannzillaArabicAiWheelSystemV1';
import GannzillaDigitalNumberClarityPatch from './components/GannTools/GannzillaDigitalNumberClarityPatch';
import GannzillaLongNumberDigitalRenderer from './components/GannTools/GannzillaLongNumberDigitalRenderer';
import GannzillaLayerMarksVisiblePatch from './components/GannTools/GannzillaLayerMarksVisiblePatch';
import GannzillaTwentyRingNoOverlapPatch from './components/GannTools/GannzillaTwentyRingNoOverlapPatch';
import GannzillaTwentyRingViewportFixPatch from './components/GannTools/GannzillaTwentyRingViewportFixPatch';

const App = () => {
  // للتبديل بين الصفحة الرئيسية وصفحة الاختبار
  const search = window.location.search;
  const isTestMode = search.includes('test=true');
  const isArabicAiWheelMode = search.includes('gannzillaArabicAI=true') || search.includes('aiWheel=true');
  const isGannzillaProWheelMode = search.includes('gannzillaPro=true') || search.includes('wheelPro=true');
  const useNativeWheelLayout =
    search.includes('nativeWheelLayout') ||
    search.includes('nativeProgram') ||
    search.includes('originalLayout') ||
    search.includes('programLayout') ||
    search.includes('safeOpen');
  const isTwentyRingStableMode = !useNativeWheelLayout && (
    search.includes('twentyRingNoOverlap') ||
    search.includes('stable20Rings') ||
    search.includes('noOverlap20') ||
    search.includes('adaptive20Rings')
  );
  const isEnhancedMode = search.includes('enhanced=true') || true; // افتراضياً الإصدار المحسن
  
  return (
    <ToolProvider>
      <LanguageProvider>
        <div>
          {isArabicAiWheelMode ? (
            <GannzillaArabicAiWheelSystemV1 />
          ) : isGannzillaProWheelMode ? (
            <>
              <GannzillaDigitalNumberClarityPatch />
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
              {isTwentyRingStableMode ? (
                <>
                  <GannzillaTwentyRingNoOverlapPatch />
                  <GannzillaTwentyRingViewportFixPatch />
                </>
              ) : useNativeWheelLayout ? null : (
                <>
                  <GannzillaLongNumberDigitalRenderer />
                  <GannzillaLayerMarksVisiblePatch />
                </>
              )}
              <GannzillaOptionsBadgeHidePatch />
              <GannzillaPanelToggleTopbarPatch />
              <GannzillaWheelLineDrawPatch />
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
