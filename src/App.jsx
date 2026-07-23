import React from 'react';
import { ToolProvider } from './context/ToolContext';
import { LanguageProvider } from './context/LanguageContext';
import Home from './pages/Home';
import HomeEnhanced from './pages/HomeEnhanced';
import TestPage from './pages/TestPage';
import GannzillaArabicAiWheelSystemV1 from './components/GannTools/GannzillaArabicAiWheelSystemV1';
import GannzillaBareWheelV224 from './components/GannTools/GannzillaBareWheelV224';

const PANEL_STORAGE_KEY = 'tasi-gannzilla-canonical-panel-v326';
const FULL_PROJECT_STORAGE_KEY = 'tasi-gannzilla-project-v318';

function safeJson(value, fallback = {}) {
  try {
    const parsed = JSON.parse(value || 'null');
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch (_) {
    return fallback;
  }
}

function applyForcedWheelQuery() {
  try {
    const query = new URLSearchParams(window.location.search || '');
    if (query.get('forceUrlNumbers') !== 'true') return;

    const levels = Number(query.get('levels') || 10);
    const divisions = Number(query.get('divisions') || 36);
    const startValue = Number(query.get('startValue') || 1);
    const increment = Number(query.get('increment') || 1);

    const safeLevels = Number.isFinite(levels) ? levels : 10;
    const safeDivisions = Number.isFinite(divisions) ? divisions : 36;
    const safeStartValue = Number.isFinite(startValue) ? startValue : 1;
    const safeIncrement = Number.isFinite(increment) ? increment : 1;

    const canonical = safeJson(window.localStorage.getItem(PANEL_STORAGE_KEY), {});
    const nextCanonical = {
      ...canonical,
      layout: {
        ...(canonical.layout || {}),
        visible: true,
        size: safeLevels,
        view: safeDivisions,
      },
      price: {
        ...(canonical.price || {}),
        value: safeStartValue,
        increment: safeIncrement,
      },
    };
    window.localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(nextCanonical));
    window.__gannzillaCanonicalPanelStateV326 = nextCanonical;

    const project = safeJson(window.localStorage.getItem(FULL_PROJECT_STORAGE_KEY), {});
    const nextProject = {
      ...project,
      layout: {
        ...(project.layout || {}),
        visible: true,
        size: safeLevels,
        view: `Circle of ${safeDivisions}`,
        price: {
          ...(project.layout?.price || {}),
          value: safeStartValue,
          increment: safeIncrement,
        },
      },
    };
    window.localStorage.setItem(FULL_PROJECT_STORAGE_KEY, JSON.stringify(nextProject));
    window.__gannzillaProjectV318 = nextProject;
  } catch (_) {
    // Fail safely and allow the wheel to render with its persisted state.
  }
}

// Build 419: the restored complete property-panel is the active panel authority.
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
        <div data-gannzilla-build="419">
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
