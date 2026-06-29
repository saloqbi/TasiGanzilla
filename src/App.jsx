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

    const setImportant = (el, prop, value) => el.style.setProperty(prop, value, 'important');

    const makeProjectButton = ({ text, title, color, bg = '#f7f7f7', width = '38px', onClick }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = text;
      button.title = title;
      button.dataset.gannzillaProjectControl = 'true';
      button.onclick = onClick || (() => {});
      setImportant(button, 'width', width);
      setImportant(button, 'height', '34px');
      setImportant(button, 'min-width', width);
      setImportant(button, 'min-height', '34px');
      setImportant(button, 'padding', '0 6px');
      setImportant(button, 'margin-right', '4px');
      setImportant(button, 'border', '1px solid #9b9b9b');
      setImportant(button, 'border-radius', '3px');
      setImportant(button, 'background', bg);
      setImportant(button, 'color', color || '#222');
      setImportant(button, 'font-size', text.includes('Add') ? '15px' : '19px');
      setImportant(button, 'font-weight', '800');
      setImportant(button, 'line-height', '28px');
      setImportant(button, 'cursor', 'pointer');
      setImportant(button, 'display', 'inline-flex');
      setImportant(button, 'align-items', 'center');
      setImportant(button, 'justify-content', 'center');
      return button;
    };

    const captureWheelSettings = () => {
      const inputs = Array.from(document.querySelectorAll('aside input, aside select'));
      const values = inputs.map((input) => ({
        tag: input.tagName,
        type: input.type || '',
        value: input.type === 'checkbox' ? input.checked : input.value
      }));
      localStorage.setItem('tasi-gannzilla-wheel-settings-v1', JSON.stringify({ values, savedAt: new Date().toISOString() }));
    };

    const clean = () => {
      const toolbar = Array.from(document.querySelectorAll('div')).find((el) => {
        const style = window.getComputedStyle(el);
        const text = el.textContent || '';
        return style.position === 'fixed' && style.top === '0px' && text.includes('Gannzilla Pro') && text.includes('English');
      });
      if (!toolbar) return;

      const extraLabels = new Set(['50%', '90%', '110%', '125%', '200%', 'Pro Small', 'Clockwise', 'Counter']);
      Array.from(toolbar.querySelectorAll('button')).forEach((button) => {
        const label = (button.textContent || '').trim();
        if (extraLabels.has(label)) button.remove();
      });

      // ضبط شريط الأدوات العام.
      setImportant(toolbar, 'height', '42px');
      setImportant(toolbar, 'min-height', '42px');
      setImportant(toolbar, 'font-size', '15px');
      toolbar.style.alignItems = 'center';
      toolbar.style.padding = '0 8px 0 0';

      const leftGroup = toolbar.firstElementChild;
      if (leftGroup && leftGroup.dataset.gannzillaProjectControlsReady !== 'true') {
        leftGroup.dataset.gannzillaProjectControlsReady = 'true';
        Array.from(leftGroup.querySelectorAll('button')).forEach((button) => button.remove());

        const defaultSpan = Array.from(leftGroup.querySelectorAll('span')).find((span) => (span.textContent || '').trim() === 'Default');
        if (defaultSpan) {
          defaultSpan.style.marginLeft = 'auto';
          defaultSpan.style.marginRight = '4px';
        }

        const menuButton = makeProjectButton({ text: '▾', title: 'Select project item', width: '28px' });
        const addButton = makeProjectButton({ text: '＋ Add', title: 'Add new wheel/layer', color: '#089b2c', width: '72px' });
        const deleteButton = makeProjectButton({ text: '−', title: 'Delete selected item', color: '#c42020', width: '34px' });
        const editButton = makeProjectButton({ text: '✎', title: 'Edit selected item', color: '#d48b00', width: '34px' });
        const saveButton = makeProjectButton({ text: '▣', title: 'Save current wheel settings', color: '#333', width: '34px', onClick: captureWheelSettings });

        leftGroup.appendChild(menuButton);
        leftGroup.appendChild(addButton);
        leftGroup.appendChild(deleteButton);
        leftGroup.appendChild(editButton);
        leftGroup.appendChild(saveButton);
      }

      Array.from(toolbar.querySelectorAll('button')).forEach((button) => {
        if (button.dataset.gannzillaProjectControl === 'true') return;
        const text = (button.textContent || '').trim();
        const isIconButton = text.length <= 2 || ['↖', '—', '▢', 'T', '🔒', '⌕', '⛶', '＋', '−'].includes(text);
        if (isIconButton) {
          setImportant(button, 'width', '36px');
          setImportant(button, 'height', '36px');
          setImportant(button, 'min-width', '36px');
          setImportant(button, 'min-height', '36px');
          setImportant(button, 'padding', '0');
          setImportant(button, 'margin-right', '4px');
          setImportant(button, 'font-size', '22px');
          setImportant(button, 'line-height', '32px');
          setImportant(button, 'border-radius', '3px');
        } else {
          setImportant(button, 'height', '34px');
          setImportant(button, 'min-height', '34px');
          setImportant(button, 'padding', '3px 10px');
          setImportant(button, 'font-size', '14px');
          setImportant(button, 'line-height', '24px');
          setImportant(button, 'border-radius', '3px');
        }
      });

      const zoomText = Array.from(toolbar.querySelectorAll('span')).find((span) => /^\d+%$/.test((span.textContent || '').trim()));
      if (zoomText) {
        setImportant(zoomText, 'min-width', '58px');
        setImportant(zoomText, 'font-size', '16px');
        zoomText.style.fontWeight = '900';
        zoomText.style.textAlign = 'center';
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
