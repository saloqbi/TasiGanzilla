import React from 'react';

export default function GannzillaOptionsClarityBinding() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const STYLE_ID = 'gannzilla-options-clarity-binding-v1';
    const FONT_PATCH_FLAG = '__gannzillaCanvasFontBoostV1';

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
          height: 27px !important;
          min-height: 27px !important;
          font-size: 14px !important;
          font-weight: 650 !important;
          padding: 2px 5px !important;
          color: #111 !important;
          background: #fff !important;
          border: 1px solid #9b9b9b !important;
          box-sizing: border-box !important;
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
        if (!shouldBoost) {
          return originalFillText.call(this, text, x, y, maxWidth);
        }

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
        control.addEventListener('input', () => {
          const value = control.value;
          if (control.tagName === 'SELECT' && ['12', '24', '36', '60', '90', '360'].includes(String(value))) {
            localStorage.setItem('tasi-gannzilla-divisions-override-v1', String(value));
            window.dispatchEvent(new CustomEvent('gannzilla:division-change', { detail: { divisions: Number(value) } }));
          }
          saveAndBroadcastOptions('input');
        });
        control.addEventListener('change', () => {
          const value = control.value;
          if (control.tagName === 'SELECT' && ['12', '24', '36', '60', '90', '360'].includes(String(value))) {
            localStorage.setItem('tasi-gannzilla-divisions-override-v1', String(value));
            window.dispatchEvent(new CustomEvent('gannzilla:division-change', { detail: { divisions: Number(value) } }));
          }
          saveAndBroadcastOptions('change');
        });
      });
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
      bindPanelControls();
      addOptionsStatus();
    };

    run();
    const timer = window.setInterval(run, 500);
    window.setTimeout(() => window.dispatchEvent(new Event('resize')), 80);
    window.setTimeout(() => window.dispatchEvent(new Event('resize')), 600);
    notify('تم ربط الخيارات وتكبير الخط للوضوح');

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
