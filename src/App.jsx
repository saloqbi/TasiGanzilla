import React from 'react';
import { createPortal } from 'react-dom';
import { ToolProvider } from './context/ToolContext';
import { LanguageProvider } from './context/LanguageContext';
import Home from './pages/Home';
import HomeEnhanced from './pages/HomeEnhanced';
import TestPage from './pages/TestPage';
import GannzillaClassicFullOptionsV94 from './components/GannTools/GannzillaClassicFullOptionsV94';
import GannzillaBilingualToggleV95 from './components/GannTools/GannzillaBilingualToggleV95';
import GannzillaConnectionSettingsV96 from './components/GannTools/GannzillaConnectionSettingsV96';
import GannzillaRightDrawingPaletteV126 from './components/GannTools/GannzillaRightDrawingPaletteV126';
import GannzillaLeftReferencePaletteV129 from './components/GannTools/GannzillaLeftReferencePaletteV129';
import GannzillaToolbarCleanupV151 from './components/GannTools/GannzillaToolbarCleanupV151';
import GannzillaAboutBrandV159 from './components/GannTools/GannzillaAboutBrandV159';
import GannzillaWheelNavigationV220 from './components/GannTools/GannzillaWheelNavigationV220';
import GannzillaExactDrawingToolbarV208 from './components/GannTools/GannzillaExactDrawingToolbarV208';
import GannzillaHideArrowLockV195 from './components/GannTools/GannzillaHideArrowLockV195';
import GannzillaArabicAiWheelSystemV1 from './components/GannTools/GannzillaArabicAiWheelSystemV1';
import GannzillaRingTwoNumberingV223 from './components/GannTools/GannzillaRingTwoNumberingV223';

const DRAWING_TOGGLE_ID = 'gannzilla-drawing-tools-url-toggle-v223';
const DRAWING_STORAGE_KEYS = [
  'gannzillaDrawingToolsVisibleV125',
  'gannzillaDrawingToolsVisibleV124',
  'gannzillaDrawingToolsVisibleV123',
  'gannzillaDrawingToolsVisibleV122',
];

function cleanLabel(element) {
  return String(element?.textContent || '').replace(/\s+/g, '').trim();
}

function findDrawingToggleAnchor() {
  return Array.from(document.querySelectorAll('button')).find((button) => {
    if (button.id === DRAWING_TOGGLE_ID) return false;
    const rect = button.getBoundingClientRect();
    return rect.width > 0
      && rect.height > 0
      && rect.top >= 0
      && rect.bottom <= 48
      && ['⌕', '🔍', '🔎'].includes(cleanLabel(button));
  }) || null;
}

function GannzillaDrawingToolsUrlToggleV223() {
  const [rect, setRect] = React.useState(null);
  const query = new URLSearchParams(window.location.search);
  const visible = query.get('drawingTools') !== 'false';

  React.useEffect(() => {
    let disposed = false;
    let frame = 0;

    const refresh = () => {
      if (disposed) return;
      const anchor = findDrawingToggleAnchor();
      if (!anchor) {
        setRect(null);
        return;
      }
      const nextRect = anchor.getBoundingClientRect();
      const next = {
        left: Math.round(nextRect.left),
        top: Math.round(nextRect.top),
        width: Math.max(22, Math.round(nextRect.width)),
        height: Math.max(21, Math.round(nextRect.height)),
      };
      setRect((current) => current
        && current.left === next.left
        && current.top === next.top
        && current.width === next.width
        && current.height === next.height
        ? current
        : next);
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        refresh();
      });
    };

    refresh();
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);
    return () => {
      disposed = true;
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
    };
  }, []);

  const toggle = React.useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent?.stopImmediatePropagation?.();

    const nextVisible = !visible;
    try {
      DRAWING_STORAGE_KEYS.forEach((key) => localStorage.setItem(key, String(nextVisible)));
    } catch (_) {}

    const url = new URL(window.location.href);
    url.searchParams.set('drawingTools', String(nextVisible));
    url.searchParams.set('v', '223');
    window.location.replace(url.toString());
  }, [visible]);

  if (!rect) return null;

  return createPortal(
    <button
      id={DRAWING_TOGGLE_ID}
      type="button"
      title={visible ? 'إخفاء أدوات الرسم اليمنى واليسرى' : 'إظهار أدوات الرسم اليمنى واليسرى'}
      aria-label={visible ? 'إخفاء أدوات الرسم اليمنى واليسرى' : 'إظهار أدوات الرسم اليمنى واليسرى'}
      aria-pressed={visible}
      onPointerDown={toggle}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      style={{
        position: 'fixed',
        left: rect.left,
        top: rect.top,
        width: rect.width,
        minWidth: rect.width,
        height: rect.height,
        padding: 0,
        margin: 0,
        zIndex: 2147483647,
        border: '1px solid #8fa5b4',
        borderRadius: 3,
        background: visible ? '#d9edf9' : '#f7f7f7',
        color: '#1c75bc',
        boxShadow: visible ? 'inset 0 0 0 1px #5f9fc5' : 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        pointerEvents: 'auto',
        touchAction: 'manipulation',
        userSelect: 'none',
        boxSizing: 'border-box',
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block', pointerEvents: 'none' }}>
        <circle cx="10" cy="10" r="5.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M14.2 14.2 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>,
    document.body,
  );
}

// Build 223: single-owner UI cleanup, event-driven ring numbering, no duplicate drawing toolbar.
const App = () => {
  const search = window.location.search;
  const query = new URLSearchParams(search);
  const isTestMode = search.includes('test=true');
  const isArabicAiWheelMode = search.includes('gannzillaArabicAI=true') || search.includes('aiWheel=true');
  const isGannzillaProWheelMode = search.includes('gannzillaPro=true') || search.includes('wheelPro=true');
  const isEnhancedMode = search.includes('enhanced=true') || true;
  const drawingToolsVisible = query.get('drawingTools') !== 'false';

  return (
    <ToolProvider>
      <LanguageProvider>
        <style>{`
          [id^="gannzilla-left-reference-palette-"] {
            top: 112px !important;
            max-height: calc(100vh - 128px) !important;
          }
          #gannzilla-right-drawing-palette-v127,
          [data-gannzilla-right-drawing-palette="true"] {
            display: ${drawingToolsVisible ? 'flex' : 'none'} !important;
            visibility: ${drawingToolsVisible ? 'visible' : 'hidden'} !important;
            pointer-events: ${drawingToolsVisible ? 'auto' : 'none'} !important;
          }
        `}</style>
        <div data-gannzilla-build="223">
          {isArabicAiWheelMode ? (
            <GannzillaArabicAiWheelSystemV1 />
          ) : isGannzillaProWheelMode ? (
            <>
              <GannzillaClassicFullOptionsV94 />
              <GannzillaBilingualToggleV95 />
              <GannzillaConnectionSettingsV96 />
              <GannzillaToolbarCleanupV151 />
              <GannzillaAboutBrandV159 />
              <GannzillaWheelNavigationV220 />
              <GannzillaRightDrawingPaletteV126 />
              <GannzillaLeftReferencePaletteV129 />
              <GannzillaExactDrawingToolbarV208 />
              <GannzillaRingTwoNumberingV223 />
              <GannzillaDrawingToolsUrlToggleV223 />
              <GannzillaHideArrowLockV195 />
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
