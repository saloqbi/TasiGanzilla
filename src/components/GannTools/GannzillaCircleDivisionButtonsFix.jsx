import React from 'react';

export default function GannzillaCircleDivisionButtonsFix() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const VALUES = new Set(['12', '24', '36']);

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
      box._hideTimer = window.setTimeout(() => { box.remove(); }, 1300);
    };

    const findViewSelect = () => Array.from(document.querySelectorAll('aside select')).find((select) => {
      const optionText = Array.from(select.options || []).map((o) => o.textContent || '').join(' ');
      return optionText.includes('Circle of 36') || optionText.includes('Circle of 60') || optionText.includes('Circle of 360');
    });

    const setNativeValue = (element, value) => {
      const proto = Object.getPrototypeOf(element);
      const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
      if (descriptor?.set) descriptor.set.call(element, value);
      else element.value = value;
    };

    const ensureOptions = (select) => {
      if (!select) return;
      ['12', '24', '36', '60', '90', '360'].forEach((value) => {
        if (!Array.from(select.options || []).some((option) => option.value === value)) {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = `Circle of ${value}`;
          const before = Array.from(select.options || []).find((o) => Number(o.value) > Number(value));
          select.insertBefore(option, before || null);
        }
      });
    };

    const setDivisions = (value) => {
      const text = String(value);
      localStorage.setItem('tasi-gannzilla-divisions-override-v1', text);
      window.dispatchEvent(new CustomEvent('gannzilla:division-change', { detail: { divisions: Number(value) } }));

      const select = findViewSelect();
      if (select) {
        ensureOptions(select);
        setNativeValue(select, text);
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }

      markActive(text);
      notify(`تم اختيار Circle of ${text}`);
    };

    const getButtonLabel = (button) => {
      if (!button) return '';
      const explicit = button.dataset.gannzillaCircleValue || '';
      if (VALUES.has(explicit)) return explicit;
      const text = (button.textContent || '').trim();
      if (VALUES.has(text)) return text;
      const title = (button.title || '').trim();
      const m = title.match(/(?:Circle of\s*)?(12|24|36)\b/i);
      return m?.[1] || '';
    };

    function markActive(value = localStorage.getItem('tasi-gannzilla-divisions-override-v1') || '36') {
      Array.from(document.querySelectorAll('[data-gannzilla-shortcut-button="true"]')).forEach((button) => {
        const label = getButtonLabel(button);
        if (!VALUES.has(label)) return;
        button.dataset.gannzillaCircleValue = label;
        const active = label === value;
        Object.assign(button.style, {
          border: active ? '2px solid #3e6ea8' : '2px solid #cfcfcf',
          background: active ? '#f1f7ff' : '#fbfbfb',
          color: active ? '#1f4f91' : '#777',
          boxShadow: active ? '0 0 0 2px rgba(62,110,168,.16)' : '0 1px 2px rgba(0,0,0,.08)',
          fontWeight: '900',
          cursor: 'pointer',
          pointerEvents: 'auto'
        });
      });
    }

    const handleClick = (event) => {
      const button = event.target.closest('[data-gannzilla-shortcut-button="true"]');
      const label = getButtonLabel(button);
      if (!button || !VALUES.has(label)) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setDivisions(label);
    };

    const align = () => {
      const select = findViewSelect();
      if (select) ensureOptions(select);
      markActive();
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('gannzilla:division-change', align);
    const timer = window.setInterval(align, 350);
    align();

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('gannzilla:division-change', align);
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
