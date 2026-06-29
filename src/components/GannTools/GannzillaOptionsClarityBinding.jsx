import React from 'react';

export default function GannzillaOptionsClarityBinding() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const STYLE_ID = 'gannzilla-options-clarity-binding-v1';
    const FONT_PATCH_FLAG = '__gannzillaCanvasFontBoostV1';

    const VIEW_OPTIONS = [
      { value: '12', label: 'Circle of 12', frame: null, divisions: 12 },
      { value: '24', label: 'Circle of 24', frame: null, divisions: 24 },
      { value: '36', label: 'Circle of 36', frame: null, divisions: 36 },
      { value: '4', label: 'Square of 4', frame: '◆', divisions: 4 },
      { value: '9', label: 'Square of 9', frame: '◆', divisions: 9 },
      { value: '99', label: 'Permanent square', frame: '◆', divisions: 9 },
      { value: '4', label: 'Tetragon', frame: '◆', divisions: 4 },
      { value: '5', label: 'Pentagon', frame: '⬟', divisions: 5 },
      { value: '6', label: 'Hexagon', frame: '⬢', divisions: 6 },
      { value: '7', label: 'Septagon', frame: '⬣', divisions: 7 },
      { value: '8', label: 'Octagon', frame: '✺', divisions: 8 }
    ];

    const DATA_TYPE_OPTIONS = ['Price', 'Date', 'Time', 'Price and date', 'Price and time'];
    const FILL_OPTIONS = ['Levels', 'Cell'];

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
      box._hideTimer = window.setTimeout(() => { box.remove(); }, 1400);
    };

    const injectStyles = () => {
      if (document.getElementById(STYLE_ID)) return;
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
        body:has(canvas) aside {
          font-size: 14px !important;
          line-height: 1.35 !important;
        }
        body:has(canvas) aside > div > div,
        body:has(canvas) aside div[style*="grid"] {
          min-height: 29px !important;
        }
        body:has(canvas) aside input,
        body:has(canvas) aside select {
          height: 28px !important;
          min-height: 28px !important;
          font-size: 14px !important;
          font-weight: 650 !important;
          padding: 2px 5px !important;
          color: #111 !important;
          background: #fff !important;
          border: 1px solid #9b9b9b !important;
          box-sizing: border-box !important;
        }
        body:has(canvas) aside select option {
          font-size: 14px !important;
          font-weight: 650 !important;
          padding: 5px 8px !important;
        }
        body:has(canvas) aside input[type="checkbox"] {
          width: 15px !important;
          height: 15px !important;
          min-height: 15px !important;
          accent-color: #2276bd !important;
        }
        body:has(canvas) aside span,
        body:has(canvas) aside label,
        body:has(canvas) aside div {
          text-rendering: geometricPrecision !important;
        }
        body:has(canvas) button {
          text-rendering: geometricPrecision !important;
        }
        body:has(canvas) [data-gannzilla-shortcut-bar="true"] button,
        body:has(canvas) [data-gannzilla-safe-shape-toolbar="true"] button,
        body:has(canvas) [data-gannzilla-right-shape-button="true"] {
          filter: contrast(1.06) !important;
        }
        body:has(canvas) div[style*="top: 0px"],
        body:has(canvas) div[style*="top:0px"] {
          font-size: 14px !important;
        }
      `;
      document.head.appendChild(style);
    };

    const isWheelCanvas = (canvas) => {
      const rect = canvas?.getBoundingClientRect?.();
      return rect && rect.width > 150 && rect.height > 150;
    };

    const boostCanvasFont = () => {
      const proto = window.CanvasRenderingContext2D?.prototype;
      if (!proto || proto[FONT_PATCH_FLAG]) return;
      const originalFillText = proto.fillText;
      proto[FONT_PATCH_FLAG] = { originalFillText };
      proto.fillText = function boostedFillText(text, x, y, maxWidth) {
        const str = String(text ?? '');
        const canvas = this.canvas;
        const shouldBoost = isWheelCanvas(canvas) && /[0-9]/.test(str);
        if (!shouldBoost) return originalFillText.call(this, text, x, y, maxWidth);

        const oldFont = this.font;
        const oldShadowColor = this.shadowColor;
        const oldShadowBlur = this.shadowBlur;
        const match = oldFont.match(/(\d+(?:\.\d+)?)px\s+(.+)/i);
        if (!match) return originalFillText.call(this, text, x, y, maxWidth);

        const oldSize = Number(match[1]);
        const family = match[2];
        const multiplier = str.length >= 6 ? 1.08 : str.length >= 4 ? 1.12 : 1.18;
        const nextSize = Math.min(oldSize * multiplier, oldSize + 3.2);
        this.font = `800 ${nextSize.toFixed(2)}px ${family}`;
        this.shadowColor = 'rgba(255,255,255,0.9)';
        this.shadowBlur = 0.35;
        const result = originalFillText.call(this, text, x, y, maxWidth);
        this.font = oldFont;
        this.shadowColor = oldShadowColor;
        this.shadowBlur = oldShadowBlur;
        return result;
      };
    };

    const getWheelCanvas = () => Array.from(document.querySelectorAll('canvas'))
      .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width > 120 && rect.height > 120)
      .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;

    const restoreCircleFrame = () => {
      localStorage.removeItem('tasi-gannzilla-frame-shape-v1');
      document.querySelector('[data-gannzilla-frame-shape-layer="true"]')?.remove();
      document.querySelector('[data-gannzilla-polygon-tool-overlay="true"]')?.remove();
      document.querySelector('[data-gannzilla-shape-guard-overlay="true"]')?.remove();
      const canvas = getWheelCanvas();
      if (canvas) canvas.style.opacity = '1';
    };

    const findViewSelect = () => Array.from(document.querySelectorAll('aside select')).find((select) => {
      const text = Array.from(select.options || []).map((option) => option.textContent || '').join(' ');
      return text.includes('Circle of 36') || text.includes('Square of 9') || text.includes('Permanent square');
    });

    const findDataTypeSelect = () => Array.from(document.querySelectorAll('aside select')).find((select) => {
      const text = Array.from(select.options || []).map((option) => option.textContent || '').join(' ');
      return text.includes('Price') && text.includes('Time') && !text.includes('Circle') && !text.includes('Levels');
    });

    const findFillSelect = () => Array.from(document.querySelectorAll('aside select')).find((select) => {
      const text = Array.from(select.options || []).map((option) => option.textContent || '').join(' ');
      return text.includes('Levels') && text.includes('Cell');
    });

    const resetSelectOptions = (select, options, selectedValue) => {
      if (!select) return;
      const currentSignature = Array.from(select.options || []).map((o) => `${o.value}:${o.textContent}`).join('|');
      const nextSignature = options.map((o) => `${o.value}:${o.label}`).join('|');
      if (select.dataset.gannzillaOptionsSignature !== nextSignature || currentSignature !== nextSignature) {
        select.innerHTML = '';
        options.forEach((item) => {
          const option = document.createElement('option');
          option.value = String(item.value);
          option.textContent = item.label;
          select.appendChild(option);
        });
        select.dataset.gannzillaOptionsSignature = nextSignature;
      }
      if (selectedValue != null && Array.from(select.options).some((o) => o.value === String(selectedValue))) {
        select.value = String(selectedValue);
      }
    };

    const selectedViewMeta = (select) => {
      const selectedText = select?.options?.[select.selectedIndex]?.textContent || '';
      return VIEW_OPTIONS.find((item) => item.label === selectedText) || VIEW_OPTIONS.find((item) => String(item.value) === String(select?.value));
    };

    const applyViewOption = (select) => {
      const item = selectedViewMeta(select);
      if (!item) return;
      localStorage.setItem('tasi-gannzilla-view-option-v1', item.label);
      localStorage.setItem('tasi-gannzilla-divisions-override-v1', String(item.divisions));
      if (item.frame) {
        localStorage.setItem('tasi-gannzilla-frame-shape-v1', item.frame);
      } else {
        restoreCircleFrame();
      }
      window.dispatchEvent(new CustomEvent('gannzilla:division-change', { detail: { divisions: item.divisions, frame: item.frame || 'circle', label: item.label } }));
      window.dispatchEvent(new Event('resize'));
    };

    const enhanceSelectOptions = () => {
      const viewSelect = findViewSelect();
      if (viewSelect) {
        const savedLabel = localStorage.getItem('tasi-gannzilla-view-option-v1');
        const saved = VIEW_OPTIONS.find((item) => item.label === savedLabel);
        const fallbackValue = localStorage.getItem('tasi-gannzilla-divisions-override-v1') || viewSelect.value || '36';
        resetSelectOptions(viewSelect, VIEW_OPTIONS, saved?.value || fallbackValue);
        viewSelect.dataset.gannzillaViewSelect = 'true';
      }

      const dataTypeSelect = findDataTypeSelect();
      if (dataTypeSelect) {
        const saved = localStorage.getItem('tasi-gannzilla-data-type-v1') || dataTypeSelect.value || 'Price';
        resetSelectOptions(dataTypeSelect, DATA_TYPE_OPTIONS.map((label) => ({ value: label, label })), saved);
        dataTypeSelect.dataset.gannzillaDataTypeSelect = 'true';
      }

      const fillSelect = findFillSelect();
      if (fillSelect) {
        const saved = localStorage.getItem('tasi-gannzilla-highlight-fill-v1') || fillSelect.value || 'Levels';
        resetSelectOptions(fillSelect, FILL_OPTIONS.map((label) => ({ value: label, label })), saved);
        fillSelect.dataset.gannzillaFillSelect = 'true';
      }
    };

    const readPanelOptions = () => {
      const aside = document.querySelector('aside');
      if (!aside) return {};
      const controls = Array.from(aside.querySelectorAll('input, select'));
      const options = {};
      controls.forEach((control, index) => {
        const row = control.closest('div[style*="grid"]') || control.parentElement?.parentElement;
        const label = (row?.textContent || control.name || `field-${index}`).trim().replace(/\s+/g, ' ').slice(0, 80);
        options[`${index}:${label}`] = control.type === 'checkbox' ? control.checked : control.value;
      });
      return options;
    };

    const saveAndBroadcastOptions = (reason = 'option-change') => {
      const options = readPanelOptions();
      localStorage.setItem('tasi-gannzilla-bound-options-v1', JSON.stringify({ options, savedAt: new Date().toISOString(), reason }));
      window.dispatchEvent(new CustomEvent('gannzilla:options-bound', { detail: { options, reason } }));
    };

    const bindPanelControls = () => {
      const aside = document.querySelector('aside');
      if (!aside) return;
      Array.from(aside.querySelectorAll('input, select')).forEach((control) => {
        if (control.dataset.gannzillaBoundOption === 'true') return;
        control.dataset.gannzillaBoundOption = 'true';

        const handler = () => {
          if (control.dataset.gannzillaViewSelect === 'true') {
            applyViewOption(control);
          }
          if (control.dataset.gannzillaDataTypeSelect === 'true') {
            localStorage.setItem('tasi-gannzilla-data-type-v1', control.value || 'Price');
          }
          if (control.dataset.gannzillaFillSelect === 'true') {
            localStorage.setItem('tasi-gannzilla-highlight-fill-v1', control.value || 'Levels');
          }
          saveAndBroadcastOptions('change');
        };

        control.addEventListener('input', handler);
        control.addEventListener('change', handler);
      });
    };

    const enforceCircleWhenNoFrame = () => {
      const saved = localStorage.getItem('tasi-gannzilla-frame-shape-v1');
      if (!saved) {
        document.querySelector('[data-gannzilla-frame-shape-layer="true"]')?.remove();
        const canvas = getWheelCanvas();
        if (canvas) canvas.style.opacity = '1';
      }
    };

    const addOptionsStatus = () => {
      if (document.querySelector('[data-gannzilla-options-status="true"]')) return;
      const badge = document.createElement('div');
      badge.dataset.gannzillaOptionsStatus = 'true';
      badge.textContent = 'Options Linked';
      Object.assign(badge.style, {
        position: 'fixed',
        left: '342px',
        top: '30px',
        zIndex: '60',
        background: '#f8f8f8',
        color: '#1f4f91',
        border: '1px solid #b9cce4',
        borderRadius: '4px',
        padding: '4px 8px',
        fontSize: '13px',
        fontWeight: '800',
        boxShadow: '0 1px 3px rgba(0,0,0,.08)',
        pointerEvents: 'none'
      });
      document.body.appendChild(badge);
    };

    const run = () => {
      injectStyles();
      boostCanvasFont();
      enhanceSelectOptions();
      bindPanelControls();
      enforceCircleWhenNoFrame();
      addOptionsStatus();
    };

    run();
    const timer = window.setInterval(run, 350);
    window.setTimeout(() => window.dispatchEvent(new Event('resize')), 80);
    window.setTimeout(() => window.dispatchEvent(new Event('resize')), 600);
    notify('تم إضافة خيارات جنزلا وربطها');

    return () => {
      window.clearInterval(timer);
      document.getElementById(STYLE_ID)?.remove();
      document.querySelector('[data-gannzilla-options-status="true"]')?.remove();
      const proto = window.CanvasRenderingContext2D?.prototype;
      const original = proto?.[FONT_PATCH_FLAG]?.originalFillText;
      if (proto && original) {
        proto.fillText = original;
        delete proto[FONT_PATCH_FLAG];
      }
    };
  }, []);

  return null;
}
