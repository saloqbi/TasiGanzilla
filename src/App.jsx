import React from 'react';
import { ToolProvider } from './context/ToolContext';
import { LanguageProvider } from './context/LanguageContext';
import Home from './pages/Home';
import HomeEnhanced from './pages/HomeEnhanced';
import TestPage from './pages/TestPage';
import SimpleTriangleTest from './components/GannTools/SimpleTriangleTest';
import InteractiveTriangle from './components/InteractiveTriangle';
import GannzillaProWheelExact from './components/GannTools/GannzillaProWheelExact';

function GannzillaProToolbarPatch() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const readZoomPercent = (toolbar) => {
      const zoomSpan = Array.from(toolbar.querySelectorAll('span'))
        .map((span) => span.textContent?.trim() || '')
        .find((text) => /^\d+%$/.test(text));
      return zoomSpan ? Number(zoomSpan.replace('%', '')) : null;
    };

    const findToolbar = () => Array.from(document.querySelectorAll('div'))
      .find((el) => {
        const style = window.getComputedStyle(el);
        const text = el.textContent || '';
        return style.position === 'fixed' && style.top === '0px' && text.includes('Gannzilla Pro') && text.includes('English');
      });

    const clickToZoom = (toolbar, targetPercent) => {
      let tries = 0;
      const step = () => {
        const current = readZoomPercent(toolbar);
        if (!current || tries > 90 || Math.abs(current - targetPercent) <= 2) return;
        const exactButtons = Array.from(toolbar.querySelectorAll('button'))
          .filter((button) => ['＋', '−'].includes(button.textContent?.trim()));
        const plusButton = exactButtons.filter((button) => button.textContent.trim() === '＋').pop();
        const minusButton = exactButtons.filter((button) => button.textContent.trim() === '−').pop();
        if (current < targetPercent) plusButton?.click();
        else minusButton?.click();
        tries += 1;
        window.setTimeout(step, 35);
      };
      step();
    };

    const attachControls = () => {
      const toolbar = findToolbar();
      if (!toolbar || toolbar.dataset.gannzillaZoomPatchV2 === '1') return;
      toolbar.dataset.gannzillaZoomPatchV2 = '1';

      const makeButton = (label, target) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.title = `${label} zoom`;
        Object.assign(button.style, {
          height: '34px',
          minHeight: '34px',
          padding: '4px 12px',
          border: '1px solid #8f8f8f',
          borderRadius: '3px',
          background: '#f7f7f7',
          color: '#222',
          fontSize: '15px',
          fontWeight: '800',
          cursor: 'pointer',
          marginLeft: '5px',
          lineHeight: '22px'
        });
        button.onclick = () => clickToZoom(toolbar, target);
        return button;
      };

      const fiftyButton = makeButton('50%', 50);
      const twoHundredButton = makeButton('200%', 200);
      const englishNode = Array.from(toolbar.querySelectorAll('span')).find((span) => (span.textContent || '').includes('English'));
      toolbar.querySelector('div:last-child')?.insertBefore(fiftyButton, englishNode || null);
      toolbar.querySelector('div:last-child')?.insertBefore(twoHundredButton, englishNode || null);
    };

    const timer = window.setInterval(attachControls, 400);
    attachControls();
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
              <GannzillaProToolbarPatch />
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
