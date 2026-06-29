import React from 'react';
import { ToolProvider } from './context/ToolContext';
import { LanguageProvider } from './context/LanguageContext';
import Home from './pages/Home';
import HomeEnhanced from './pages/HomeEnhanced';
import TestPage from './pages/TestPage';
import SimpleTriangleTest from './components/GannTools/SimpleTriangleTest';
import InteractiveTriangle from './components/InteractiveTriangle';
import GannzillaProWheelExact from './components/GannTools/GannzillaProWheelExact';

function GannzillaProCleanToolbarPatch() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const clean = () => {
      const toolbar = Array.from(document.querySelectorAll('div')).find((el) => {
        const style = window.getComputedStyle(el);
        const text = el.textContent || '';
        return style.position === 'fixed' && style.top === '0px' && text.includes('Gannzilla Pro') && text.includes('English');
      });
      if (!toolbar) return;

      // حذف كل الأزرار الإضافية حتى يبقى شريط أدوات نظيف مثل Gannzilla.
      const extraLabels = new Set(['50%', '90%', '110%', '125%', '200%', 'Pro Small', 'Clockwise', 'Counter']);
      Array.from(toolbar.querySelectorAll('button')).forEach((button) => {
        const label = (button.textContent || '').trim();
        if (extraLabels.has(label)) button.remove();
      });

      // تكبير مريح بصريًا بدون ازدحام.
      toolbar.style.height = '42px';
      toolbar.style.minHeight = '42px';
      toolbar.style.fontSize = '15px';
      toolbar.style.alignItems = 'center';
      toolbar.style.padding = '0 8px 0 0';

      Array.from(toolbar.querySelectorAll('button')).forEach((button) => {
        const text = (button.textContent || '').trim();
        const isIconButton = text.length <= 2 || ['↖', '—', '▢', 'T', '🔒', '⌕', '⛶', '＋', '−'].includes(text);
        if (isIconButton) {
          Object.assign(button.style, {
            width: '36px',
            height: '36px',
            minWidth: '36px',
            minHeight: '36px',
            padding: '0',
            marginRight: '4px',
            fontSize: '22px',
            lineHeight: '32px',
            borderRadius: '3px'
          });
        } else {
          Object.assign(button.style, {
            height: '34px',
            minHeight: '34px',
            padding: '3px 10px',
            fontSize: '14px',
            lineHeight: '24px',
            borderRadius: '3px'
          });
        }
      });

      const zoomText = Array.from(toolbar.querySelectorAll('span')).find((span) => /^\d+%$/.test((span.textContent || '').trim()));
      if (zoomText) {
        Object.assign(zoomText.style, {
          minWidth: '58px',
          fontSize: '16px',
          fontWeight: '900',
          textAlign: 'center'
        });
      }
    };

    const timer = window.setInterval(clean, 250);
    clean();
    return () => window.clearInterval(timer);
  }, []);

  return null;
}

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
              <GannzillaProCleanToolbarPatch />
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
