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

      // حذف كل الأزرار الإضافية التي أضفناها سابقًا حتى يصبح الشريط مثل Gannzilla فقط.
      const extraLabels = new Set(['50%', '90%', '110%', '125%', '200%', 'Pro Small', 'Clockwise', 'Counter']);
      Array.from(toolbar.querySelectorAll('button')).forEach((button) => {
        const label = (button.textContent || '').trim();
        if (extraLabels.has(label)) button.remove();
      });

      // ترتيب وتهذيب زر النسبة فقط بدون أزرار نصية إضافية.
      toolbar.style.height = '32px';
      toolbar.style.minHeight = '32px';
      toolbar.style.fontSize = '13px';
      toolbar.style.alignItems = 'center';

      Array.from(toolbar.querySelectorAll('button')).forEach((button) => {
        const text = (button.textContent || '').trim();
        const isIconButton = text.length <= 2 || ['↖', '—', '▢', 'T', '🔒', '⌕', '⛶', '＋', '−'].includes(text);
        if (isIconButton) {
          Object.assign(button.style, {
            width: '28px',
            height: '28px',
            minWidth: '28px',
            minHeight: '28px',
            padding: '0',
            marginRight: '2px',
            fontSize: '17px',
            lineHeight: '24px'
          });
        }
      });
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
