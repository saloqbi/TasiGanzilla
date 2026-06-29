import React from 'react';

export default function GannzillaPanelReadableScale() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const panelWidth = 720;
    const styleId = 'gannzilla-panel-readable-scale-v2';

    const installStyle = () => {
      if (document.getElementById(styleId)) return;
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .gannzilla-readable-panel aside {
          width: 720px !important;
          font-size: 30px !important;
          line-height: 1.55 !important;
          font-family: "Segoe UI", Tahoma, Arial, sans-serif !important;
          color: #111 !important;
          background: #f2f2f2 !important;
        }
        .gannzilla-readable-panel aside * {
          text-rendering: geometricPrecision !important;
          -webkit-font-smoothing: antialiased !important;
        }
        .gannzilla-readable-panel aside input,
        .gannzilla-readable-panel aside select {
          height: 56px !important;
          min-height: 56px !important;
          font-size: 28px !important;
          font-weight: 750 !important;
          color: #111 !important;
          background: #fff !important;
          border: 2px solid #8f8f8f !important;
          padding: 5px 12px !important;
          box-sizing: border-box !important;
        }
        .gannzilla-readable-panel aside input[type="checkbox"] {
          width: 28px !important;
          height: 28px !important;
          min-height: 28px !important;
          transform: scale(1.18) !important;
          transform-origin: center !important;
          accent-color: #2c7fbd !important;
        }
        .gannzilla-readable-panel aside select option {
          font-size: 28px !important;
          font-weight: 700 !important;
          padding: 8px 12px !important;
        }
        .gannzilla-readable-panel button {
          font-size: 24px !important;
        }
        .gannzilla-readable-panel [data-gannzilla-options-status="true"] {
          left: 736px !important;
          top: 36px !important;
          font-size: 22px !important;
          padding: 8px 12px !important;
        }
      `;
      document.head.appendChild(style);
    };

    const fixPanel = () => {
      document.body.classList.add('gannzilla-readable-panel');
      const aside = document.querySelector('aside');
      if (!aside) return;
      aside.style.setProperty('width', `${panelWidth}px`, 'important');
      aside.style.setProperty('font-size', '30px', 'important');

      Array.from(aside.querySelectorAll('div')).forEach((div) => {
        const st = window.getComputedStyle(div);
        if (st.display === 'grid') {
          div.style.setProperty('grid-template-columns', '330px 1fr 38px', 'important');
          div.style.setProperty('min-height', '62px', 'important');
          div.style.setProperty('font-size', '30px', 'important');
        }
      });

      Array.from(aside.querySelectorAll('span, label, b')).forEach((el) => {
        el.style.setProperty('font-size', '30px', 'important');
        el.style.setProperty('font-weight', '800', 'important');
      });

      const viewport = Array.from(document.querySelectorAll('div')).find((div) => {
        const st = window.getComputedStyle(div);
        return st.position === 'absolute' && st.overflow.includes('auto') && st.top === '24px';
      });
      if (viewport) viewport.style.setProperty('left', `${panelWidth}px`, 'important');

      const hideButton = Array.from(document.querySelectorAll('button')).find((button) => ['Hide', 'Show'].includes((button.textContent || '').trim()));
      if (hideButton && (hideButton.textContent || '').trim() === 'Hide') {
        hideButton.style.setProperty('left', `${panelWidth + 10}px`, 'important');
        hideButton.style.setProperty('height', '52px', 'important');
        hideButton.style.setProperty('font-size', '24px', 'important');
      }

      const leftToolbar = document.querySelector('[data-gannzilla-shortcut-bar="true"]');
      if (leftToolbar) leftToolbar.style.setProperty('left', `${panelWidth + 18}px`, 'important');
    };

    installStyle();
    fixPanel();
    const timer = window.setInterval(fixPanel, 250);
    window.setTimeout(() => window.dispatchEvent(new Event('resize')), 120);
    window.setTimeout(() => window.dispatchEvent(new Event('resize')), 650);

    return () => {
      window.clearInterval(timer);
      document.body.classList.remove('gannzilla-readable-panel');
      document.getElementById(styleId)?.remove();
    };
  }, []);
  return null;
}
