import React from 'react';
import { ToolProvider } from './context/ToolContext';
import { LanguageProvider } from './context/LanguageContext';
import Home from './pages/Home';
import HomeEnhanced from './pages/HomeEnhanced';
import TestPage from './pages/TestPage';
import GannzillaArabicAiWheelSystemV1 from './components/GannTools/GannzillaArabicAiWheelSystemV1';
import GannzillaBareWheelV224 from './components/GannTools/GannzillaBareWheelV224';

const PANEL_STORAGE_KEY = 'tasi-gannzilla-canonical-panel-v326';

function applyForcedWheelQuery() {
  try {
    const query = new URLSearchParams(window.location.search || '');
    if (query.get('forceUrlNumbers') !== 'true') return;

    const levels = Number(query.get('levels') || 10);
    const divisions = Number(query.get('divisions') || 36);
    const startValue = Number(query.get('startValue') || 1);
    const increment = Number(query.get('increment') || 1);

    const saved = JSON.parse(window.localStorage.getItem(PANEL_STORAGE_KEY) || '{}');
    const next = {
      ...saved,
      layout: {
        ...(saved.layout || {}),
        visible: true,
        size: Number.isFinite(levels) ? levels : 10,
        view: Number.isFinite(divisions) ? divisions : 36,
      },
      price: {
        ...(saved.price || {}),
        value: Number.isFinite(startValue) ? startValue : 1,
        increment: Number.isFinite(increment) ? increment : 1,
      },
    };

    window.localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(next));
    window.__gannzillaCanonicalPanelStateV326 = next;
  } catch (_) {
    // Fail safely and allow the wheel to render with its normal state.
  }
}

// Build 388: URL-forced numbering without using the legacy northLastCell path.
const App = () => {
  applyForcedWheelQuery();

  const search = window.location.search;
  const isTestMode = search.includes('test=true');
  const isArabicAiWheelMode = search.includes('gannzillaArabicAI=true') || search.includes('aiWheel=true');
  const isGannzillaProWheelMode = search.includes('gannzillaPro=true') || search.includes('wheelPro=true');
  const isEnhancedMode = search.includes('enhanced=true') || true;

  return (
    <ToolProvider>
      <LanguageProvider>
        <div data-gannzilla-build="388">
          {isArabicAiWheelMode ? (
            <GannzillaArabicAiWheelSystemV1 />
          ) : isGannzillaProWheelMode ? (
            <GannzillaBareWheelV224 />
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
