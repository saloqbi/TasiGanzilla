import React from 'react';

export default function GannzillaOptionsBadgeHidePatch() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const STYLE_ID = 'gannzilla-options-badge-hide-patch-v1';
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
        [data-gannzilla-options-status="true"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          width: 0 !important;
          height: 0 !important;
          min-width: 0 !important;
          min-height: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          border: 0 !important;
          overflow: hidden !important;
          pointer-events: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    const hideBadge = () => {
      document.querySelectorAll('[data-gannzilla-options-status="true"]').forEach((node) => node.remove());
    };

    hideBadge();
    const timer = window.setInterval(hideBadge, 250);

    return () => {
      window.clearInterval(timer);
      document.getElementById(STYLE_ID)?.remove();
    };
  }, []);

  return null;
}
