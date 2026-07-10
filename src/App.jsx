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
import GannzillaUnifiedDrawingPalettesV122 from './components/GannTools/GannzillaUnifiedDrawingPalettesV122';
import GannzillaRightDrawingPaletteV126 from './components/GannTools/GannzillaRightDrawingPaletteV126';
import GannzillaLeftReferencePaletteV129 from './components/GannTools/GannzillaLeftReferencePaletteV129';
import GannzillaToolbarCleanupV151 from './components/GannTools/GannzillaToolbarCleanupV151';
import GannzillaAboutDialogScaleV157 from './components/GannTools/GannzillaAboutDialogScaleV157';
import GannzillaAboutBrandV159 from './components/GannTools/GannzillaAboutBrandV159';
import GannzillaAboutClickFixV160 from './components/GannTools/GannzillaAboutClickFixV160';
import GannzillaWheelPanControlV180 from './components/GannTools/GannzillaWheelPanControlV180';
import GannzillaNativeToolbarBindingV178 from './components/GannTools/GannzillaNativeToolbarBindingV178';
import GannzillaLineStyleMenuV183 from './components/GannTools/GannzillaLineStyleMenuV183';
import GannzillaArabicAiWheelSystemV1 from './components/GannTools/GannzillaArabicAiWheelSystemV1';

const DRAWING_TOGGLE_ID = 'gannzilla-drawing-tools-url-toggle-v182';
const LEGACY_HITBOX_ID = 'gannzilla-drawing-tools-hitbox-v125';
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
    if (button.id === DRAWING_TOGGLE_ID || button.id === LEGACY_HITBOX_ID) return false;
    const rect = button.getBoundingClientRect();
    return rect.width > 0
      && rect.height > 0
      && rect.top >= 0
      && rect.bottom <= 48
      && ['⌕', '🔍', '🔎'].includes(cleanLabel(button));
  }) || null;
}

function GannzillaToolbarVisualFixV187() {
  React.useEffect(() => {
    let disposed = false;

    const apply = () => {
      if (disposed) return;

      document.querySelectorAll('button').forEach((button) => {
        const rect = button.getBoundingClientRect();
        const label = cleanLabel(button);
        if (rect.top >= 0 && rect.bottom <= 48 && ['🔒', '🔐'].includes(label)) {
          button.style.setProperty('display', 'none', 'important');
          button.style.setProperty('visibility', 'hidden', 'important');
          button.style.setProperty('width', '0', 'important');
          button.style.setProperty('min-width', '0', 'important');
          button.style.setProperty('padding', '0', 'important');
          button.style.setProperty('margin', '0', 'important');
          button.style.setProperty('border', '0', 'important');
          button.style.setProperty('pointer-events', 'none', 'important');
          button.setAttribute('aria-hidden', 'true');
          button.disabled = true;
        }
      });

      ['gannzilla-line-control-v185', 'gannzilla-shape-control-v185'].forEach((id) => {
        const control = document.getElementById(id);
        if (!control) return;
        control.style.setProperty('height', '23px', 'important');
        control.style.setProperty('min-height', '23px', 'important');
        control.style.setProperty('overflow', 'visible', 'important');

        const primary = control.querySelector('button:first-child');
        const arrow = control.querySelector('button:last-child');
        const svg = primary?.querySelector('svg');

        primary?.style.setProperty('padding', '0', 'important');
        primary?.style.setProperty('overflow', 'visible', 'important');
        arrow?.style.setProperty('width', '9px', 'important');
        arrow?.style.setProperty('min-width', '9px', 'important');
        arrow?.style.setProperty('font-size', '9px', 'important');

        svg?.style.setProperty('width', '24px', 'important');
        svg?.style.setProperty('height', '20px', 'important');
        svg?.style.setProperty('transform', 'scale(1.18)', 'important');
        svg?.style.setProperty('transform-origin', 'center', 'important');

        control.querySelectorAll('svg line, svg rect, svg ellipse, svg path').forEach((shape) => {
          shape.style.setProperty('stroke-width', '2.8', 'important');
        });
      });
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = window.setInterval(apply, 180);
    window.addEventListener('resize', apply);

    return () => {
      disposed = true;
      observer.disconnect();
      window.clearInterval(timer);
      window.removeEventListener('resize', apply);
    };
  }, []);

  return null;
}

function GannzillaDrawingToolsUrlToggleV182() {
  const [rect, setRect] = React.useState(null);
  const query = new URLSearchParams(window.location.search);
  const visible = query.get('drawingTools') !== 'false';

  React.useEffect(() => {
    let disposed = false;
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

    refresh();
    const timer = window.setInterval(refresh, 300);
    window.addEventListener('resize', refresh);
    window.addEventListener('scroll', refresh, true);
    return () => {
      disposed = true;
      window.clearInterval(timer);
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', refresh, true);
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
    url.searchParams.set('v', '187');
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

// Build 187: enlarge the two drawing icons and remove the lock icon from the toolbar.
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
        <div data-gannzilla-build="187">
          {isArabicAiWheelMode ? (
            <GannzillaArabicAiWheelSystemV1 />
          ) : isGannzillaProWheelMode ? (
            <>
              <GannzillaClassicFullOptionsV94 />
              <GannzillaBilingualToggleV95 />
              <GannzillaConnectionSettingsV96 />
              <GannzillaToolbarCleanupV151 />
              <GannzillaAboutDialogScaleV157 />
              <GannzillaAboutBrandV159 />
              <GannzillaAboutClickFixV160 />
              <GannzillaWheelPanControlV180 />
              <GannzillaUnifiedDrawingPalettesV122 />
              <GannzillaRightDrawingPaletteV126 />
              <GannzillaLeftReferencePaletteV129 />
              <GannzillaNativeToolbarBindingV178 />
              <GannzillaLineStyleMenuV183 />
              <GannzillaDrawingToolsUrlToggleV182 />
              <GannzillaToolbarVisualFixV187 />
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
