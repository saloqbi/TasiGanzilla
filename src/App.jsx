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

    const notify = (message) => {
      let box = document.querySelector('[data-gannzilla-toast="true"]');
      if (!box) {
        box = document.createElement('div');
        box.dataset.gannzillaToast = 'true';
        document.body.appendChild(box);
      }
      Object.assign(box.style, {
        position: 'fixed',
        right: '18px',
        bottom: '18px',
        zIndex: '9999',
        background: '#222',
        color: '#fff',
        border: '1px solid #999',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '14px',
        fontWeight: '800',
        boxShadow: '0 8px 24px rgba(0,0,0,.25)',
        direction: 'rtl'
      });
      box.textContent = message;
      window.clearTimeout(box._hideTimer);
      box._hideTimer = window.setTimeout(() => { box.remove(); }, 1800);
    };

    const dispatchNativeChange = (el) => {
      if (!el) return;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };

    const getPanel = () => document.querySelector('aside');

    const getViewSelect = () => Array.from(document.querySelectorAll('aside select')).find((select) =>
      Array.from(select.options || []).some((option) => (option.textContent || '').includes('Circle of 36'))
    );

    const setCircle = (value) => {
      const select = getViewSelect();
      if (!select) return notify('لم يتم العثور على خيار Circle');
      const text = `Circle of ${value}`;
      if (!Array.from(select.options).some((option) => option.value === String(value))) {
        const option = document.createElement('option');
        option.value = String(value);
        option.textContent = text;
        select.appendChild(option);
      }
      select.value = String(value);
      dispatchNativeChange(select);
      notify(`تم اختيار ${text}`);
    };

    const setSize = (value) => {
      const numberInputs = Array.from(document.querySelectorAll('aside input[type="number"]'));
      const sizeInput = numberInputs[0];
      if (!sizeInput) return notify('لم يتم العثور على Size');
      sizeInput.value = String(value);
      dispatchNativeChange(sizeInput);
      notify(`تم ضبط Size = ${value}`);
    };

    const toggleFirstClockwise = () => {
      const rows = Array.from(document.querySelectorAll('aside div'));
      const row = rows.find((el) => (el.textContent || '').trim().startsWith('Clockwise') && el.querySelector('input[type="checkbox"]'));
      const input = row?.querySelector('input[type="checkbox"]');
      if (!input) return notify('لم يتم العثور على Clockwise');
      input.click();
      notify(input.checked ? 'الاتجاه: مع عقارب الساعة' : 'الاتجاه: عكس عقارب الساعة');
    };

    const captureWheelSettings = () => {
      const inputs = Array.from(document.querySelectorAll('aside input, aside select'));
      const values = inputs.map((input) => ({
        tag: input.tagName,
        type: input.type || '',
        value: input.type === 'checkbox' ? input.checked : input.value
      }));
      localStorage.setItem('tasi-gannzilla-wheel-settings-v1', JSON.stringify({ values, savedAt: new Date().toISOString() }));
      notify('تم حفظ إعدادات العجلة');
    };

    const makeProjectButton = ({ text, title, color, bg = '#f7f7f7', width = '38px', onClick }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = text;
      button.title = title;
      button.dataset.gannzillaProjectControl = 'true';
      button.onclick = onClick || (() => notify('الأداة جاهزة بصريًا'));
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

    const makeShortcutButton = ({ label, title, action, round = true, muted = false }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.title = title;
      button.dataset.gannzillaShortcutButton = 'true';
      button.onclick = () => {
        Array.from(document.querySelectorAll('[data-gannzilla-shortcut-button="true"]')).forEach((b) => {
          b.style.background = '#fbfbfb';
          b.style.borderColor = '#cfcfcf';
          b.style.color = b.dataset.muted === 'true' ? '#9a9a9a' : '#555';
        });
        button.style.background = '#f1f7ff';
        button.style.borderColor = '#4d7fbd';
        button.style.color = '#1f4f91';
        action?.();
      };
      button.dataset.muted = muted ? 'true' : 'false';
      Object.assign(button.style, {
        width: '42px',
        height: '42px',
        minWidth: '42px',
        minHeight: '42px',
        border: '2px solid #cfcfcf',
        borderRadius: round ? '50%' : '5px',
        background: '#fbfbfb',
        color: muted ? '#9a9a9a' : '#555',
        fontSize: '18px',
        fontWeight: '900',
        lineHeight: '36px',
        textAlign: 'center',
        cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,.08)'
      });
      return button;
    };

    const ensureShortcutBar = () => {
      let bar = document.querySelector('[data-gannzilla-shortcut-bar="true"]');
      if (!bar) {
        bar = document.createElement('div');
        bar.dataset.gannzillaShortcutBar = 'true';
        Object.assign(bar.style, {
          position: 'fixed',
          top: '150px',
          zIndex: '44',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '9px 7px',
          background: 'rgba(255,255,255,.78)',
          border: '1px solid #e1e1e1',
          borderRadius: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,.12)',
          direction: 'ltr'
        });

        [
          { label: '12', title: 'Circle of 12', action: () => setCircle(12), muted: true },
          { label: '24', title: 'Circle of 24', action: () => setCircle(24), muted: true },
          { label: '36', title: 'Circle of 36', action: () => setCircle(36) },
          { label: '↙\n4', title: 'Size 4', action: () => setSize(4), round: false, muted: true },
          { label: '↖\n9', title: 'Size 9', action: () => setSize(9), round: false, muted: true },
          { label: 'N', title: 'Toggle clockwise/counter', action: toggleFirstClockwise, round: false, muted: true },
          { label: '◆', title: 'Diamond marker', action: () => notify('تم اختيار شكل Diamond') },
          { label: '⬟', title: 'Pentagon marker', action: () => notify('تم اختيار شكل Pentagon') },
          { label: '⬢', title: 'Hexagon marker', action: () => notify('تم اختيار شكل Hexagon') },
          { label: '⬣', title: 'Heptagon marker', action: () => notify('تم اختيار شكل Heptagon') },
          { label: '✺', title: 'Star marker', action: () => notify('تم اختيار شكل Star') }
        ].forEach((item) => bar.appendChild(makeShortcutButton(item)));

        document.body.appendChild(bar);
      }

      const panel = getPanel();
      const panelRect = panel?.getBoundingClientRect();
      const panelRight = panelRect && panelRect.width > 40 ? panelRect.right : 0;
      bar.style.left = `${Math.max(14, panelRight + 10)}px`;
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

        leftGroup.appendChild(makeProjectButton({ text: '▾', title: 'Select project item', width: '28px' }));
        leftGroup.appendChild(makeProjectButton({ text: '＋ Add', title: 'Add new wheel/layer', color: '#089b2c', width: '72px', onClick: () => notify('Add جاهز لإضافة عجلة/طبقة جديدة') }));
        leftGroup.appendChild(makeProjectButton({ text: '−', title: 'Delete selected item', color: '#c42020', width: '34px', onClick: () => notify('Delete جاهز لحذف العنصر المحدد') }));
        leftGroup.appendChild(makeProjectButton({ text: '✎', title: 'Edit selected item', color: '#d48b00', width: '34px', onClick: () => notify('Edit جاهز لتعديل العنصر المحدد') }));
        leftGroup.appendChild(makeProjectButton({ text: '▣', title: 'Save current wheel settings', color: '#333', width: '34px', onClick: captureWheelSettings }));
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

      ensureShortcutBar();
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
