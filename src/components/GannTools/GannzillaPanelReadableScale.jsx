import React from 'react';

export default function GannzillaPanelReadableScale() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const panelWidth = 388;
    const styleId = 'gannzilla-panel-readable-scale-v1';

    const installStyle = () => {
      if (document.getElementById(styleId)) return;
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .gannzilla-readable-panel aside {
          width: 388px !important;
          font-size: 15px !important;
          line-height: 1.42 !important;
          font-family: "Segoe UI", Tahoma, Arial, sans-serif !important;
        }
        .gannzilla-readable-panel aside input,
        .gannzilla-readable-panel aside select {
          height: 29px !important;
          min-height: 29px !important;
          font-size: 15px !important;
          font-weight: 700 !important;
          color: #111 !important;
          background: #fff !important;
          border: 1px solid #9b9b9b !important;
          padding: 2px 6px !important;
          box-sizing: border-box !important;
        }
        .gannzilla-readable-panel aside input[type="checkbox"] {
          width: 16px !important;
          height: 16px !important;
          min-height: 16px !important;
          accent-color: #2c7fbd !important;
        }
        .gannzilla-readable-panel aside select option {
          font-size: 15px !important;
          font-weight: 650 !important;
        }
        .gannzilla-readable-panel button {
          font-size: 14px !important;
        }
      `;
      document.head.appendChild(style);
    };

    const fixPanel = () => {
      document.body.classList.add('gannzilla-readable-panel');
      const aside = document.querySelector('aside');
      if (!aside) return;
      aside.style.setProperty('width', `${panelWidth}px`, 'important');
      aside.style.setProperty('font-size', '15px', 'important');

      Array.from(aside.querySelectorAll('div')).forEach((div) => {
        const st = window.getComputedStyle(div);
        if (st.display === 'grid') {
          div.style.setProperty('grid-template-columns', '172px 1fr 22px', 'important');
          div.style.setProperty('min-height', '31px', 'important');
          div.style.setProperty('font-size', '15px', 'important');
        }
      });

      const viewport = Array.from(document.querySelectorAll('div')).find((div) => {
        const st = window.getComputedStyle(div);
        return st.position === 'absolute' && st.overflow.includes('auto') && st.top === '24px';
      });
      if (viewport) viewport.style.setProperty('left', `${panelWidth}px`, 'important');

      const hideButton = Array.from(document.querySelectorAll('button')).find((button) => ['Hide', 'Show'].includes((button.textContent || '').trim()));
      if (hideButton && (hideButton.textContent || '').trim() === 'Hide') {
        hideButton.style.setProperty('left', `${panelWidth + 8}px`, 'important');
        hideButton.style.setProperty('height', '28px', 'important');
      }

      const leftToolbar = document.querySelector('[data-gannzilla-shortcut-bar="true"]');
      if (leftToolbar) leftToolbar.style.setProperty('left', `${panelWidth + 16}px`, 'important');
    };

    installStyle();
    fixPanel();
    const timer = window.setInterval(fixPanel, 300);
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
