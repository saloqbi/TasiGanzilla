import React from 'react';

function isPanelToggleButton(button) {
  const text = (button?.textContent || '').replace(/\s+/g, ' ').trim();
  return text === 'Hide' || text === 'Show' || text === 'إخفاء' || text === 'إظهار';
}

export default function GannzillaPanelToggleTopbarPatch() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const STYLE_ID = 'gannzilla-panel-toggle-topbar-patch-v1';
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
        [data-gannzilla-panel-toggle-topbar="true"] {
          position: fixed !important;
          top: 1px !important;
          left: 336px !important;
          z-index: 120 !important;
          height: 22px !important;
          min-height: 22px !important;
          padding: 1px 9px !important;
          margin: 0 !important;
          border: 1px solid #9b9b9b !important;
          border-radius: 2px !important;
          background: #f7f7f7 !important;
          color: #222 !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          line-height: 16px !important;
          box-shadow: none !important;
          cursor: pointer !important;
        }
        [data-gannzilla-panel-toggle-topbar="true"]:hover {
          background: #dceeff !important;
          border-color: #6fa4ca !important;
        }
      `;
      document.head.appendChild(style);
    }

    const moveToggle = () => {
      const button = Array.from(document.querySelectorAll('button')).find(isPanelToggleButton);
      if (!button) return;
      button.dataset.gannzillaPanelToggleTopbar = 'true';
      button.title = 'إخفاء / إظهار لوحة الخيارات';
    };

    moveToggle();
    const timer = window.setInterval(moveToggle, 200);

    return () => {
      window.clearInterval(timer);
      document.getElementById(STYLE_ID)?.remove();
      document.querySelectorAll('[data-gannzilla-panel-toggle-topbar="true"]').forEach((button) => {
        delete button.dataset.gannzillaPanelToggleTopbar;
      });
    };
  }, []);

  return null;
}
