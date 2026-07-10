import React from 'react';
import { ToolProvider } from './context/ToolContext';
import { LanguageProvider } from './context/LanguageContext';
import Home from './pages/Home';
import HomeEnhanced from './pages/HomeEnhanced';
import TestPage from './pages/TestPage';
import GannzillaClassicFullOptionsV94 from './components/GannTools/GannzillaClassicFullOptionsV94';
import GannzillaBilingualToggleV95 from './components/GannTools/GannzillaBilingualToggleV95';
import GannzillaConnectionSettingsV96 from './components/GannTools/GannzillaConnectionSettingsV96';
import GannzillaUnifiedDrawingPalettesV122 from './components/GannTools/GannzillaUnifiedDrawingPalettesV122';
import GannzillaRightDrawingPaletteV126 from './components/GannTools/GannzillaRightDrawingPaletteV126';
import GannzillaLeftReferencePaletteV129 from './components/GannTools/GannzillaLeftReferencePaletteV129';
import GannzillaToolbarCleanupV151 from './components/GannTools/GannzillaToolbarCleanupV151';
import GannzillaAboutDialogScaleV157 from './components/GannTools/GannzillaAboutDialogScaleV157';
import GannzillaAboutArabicV158 from './components/GannTools/GannzillaAboutArabicV158';
import GannzillaAboutBrandV159 from './components/GannTools/GannzillaAboutBrandV159';
import GannzillaArabicAiWheelSystemV1 from './components/GannTools/GannzillaArabicAiWheelSystemV1';

// Build 159: apply the approved Kawkabat TASI artwork and black-gold bilingual About branding.
const App = () => {
  const search = window.location.search;
  const isTestMode = search.includes('test=true');
  const isArabicAiWheelMode = search.includes('gannzillaArabicAI=true') || search.includes('aiWheel=true');
  const isGannzillaProWheelMode = search.includes('gannzillaPro=true') || search.includes('wheelPro=true');
  const isEnhancedMode = search.includes('enhanced=true') || true;

  return (
    <ToolProvider>
      <LanguageProvider>
        <style>{`
          [id^="gannzilla-left-reference-palette-"] {
            top: 112px !important;
            max-height: calc(100vh - 128px) !important;
          }
        `}</style>
        <div data-gannzilla-build="159">
          {isArabicAiWheelMode ? (
            <GannzillaArabicAiWheelSystemV1 />
          ) : isGannzillaProWheelMode ? (
            <>
              <GannzillaClassicFullOptionsV94 />
              <GannzillaBilingualToggleV95 />
              <GannzillaConnectionSettingsV96 />
              <GannzillaToolbarCleanupV151 />
              <GannzillaAboutDialogScaleV157 />
              <GannzillaAboutArabicV158 />
              <GannzillaAboutBrandV159 />
              <GannzillaUnifiedDrawingPalettesV122 />
              <GannzillaRightDrawingPaletteV126 />
              <GannzillaLeftReferencePaletteV129 />
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
