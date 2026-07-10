import React from 'react';

const TOOLBAR_ID = 'gannzilla-exact-drawing-toolbar-v208';
const LINE_MENU_ID = 'gannzilla-exact-line-menu-v208';
const HIDDEN_ATTR = 'data-gannzilla-line-icon-hidden-v209';

function compactLabel(element) {
  return String(element?.textContent || '').replace(/\s+/g, '').trim();
}

function isTopToolbarButton(button) {
  const rect = button?.getBoundingClientRect?.();
  return Boolean(rect)
    && rect.width > 0
    && rect.height > 0
    && rect.top >= 0
    && rect.bottom <= 50;
}

export default function GannzillaHideLineIconV209() {
  React.useEffect(() => {
    let disposed = false;

    const apply = () => {
      if (disposed) return;

      const toolbar = document.getElementById(TOOLBAR_ID);
      if (toolbar) {
        toolbar.style.setProperty('width', '74px', 'important');
        toolbar.style.setProperty('transform', 'translateX(30px)', 'important');

        const lineControl = toolbar.children?.[1];
        if (lineControl) {
          lineControl.setAttribute(HIDDEN_ATTR, 'true');
          lineControl.style.setProperty('display', 'none', 'important');
          lineControl.style.setProperty('visibility', 'hidden', 'important');
          lineControl.style.setProperty('pointer-events', 'none', 'important');
        }
      }

      const lineMenu = document.getElementById(LINE_MENU_ID);
      if (lineMenu) {
        lineMenu.setAttribute(HIDDEN_ATTR, 'true');
        lineMenu.style.setProperty('display', 'none', 'important');
        lineMenu.style.setProperty('visibility', 'hidden', 'important');
        lineMenu.style.setProperty('pointer-events', 'none', 'important');
      }

      Array.from(document.querySelectorAll('button')).forEach((button) => {
        if (button.closest?.(`#${TOOLBAR_ID}`)) return;
        if (!isTopToolbarButton(button)) return;
        if (!['—', '−', '-'].includes(compactLabel(button))) return;

        button.setAttribute(HIDDEN_ATTR, 'true');
        button.style.setProperty('display', 'none', 'important');
        button.style.setProperty('visibility', 'hidden', 'important');
        button.style.setProperty('pointer-events', 'none', 'important');
      });

      window.GANNZILLA_HIDE_LINE_ICON_V209 = true;
      window.__auditGannzillaHideLineIconV209 = () => ({
        ok: Boolean(toolbar)
          && toolbar?.children?.[1]?.getAttribute(HIDDEN_ATTR) === 'true'
          && window.getComputedStyle(toolbar.children[1]).display === 'none',
        build: 209,
        toolbarWidth: toolbar ? Math.round(toolbar.getBoundingClientRect().width) : null,
        hiddenNativeLineButtons: document.querySelectorAll(`button[${HIDDEN_ATTR}="true"]`).length,
      });
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = window.setInterval(apply, 300);
    window.addEventListener('resize', apply);
    window.addEventListener('scroll', apply, true);

    return () => {
      disposed = true;
      observer.disconnect();
      window.clearInterval(timer);
      window.removeEventListener('resize', apply);
      window.removeEventListener('scroll', apply, true);
    };
  }, []);

  return (
    <style>{`
      #${TOOLBAR_ID} {
        width: 74px !important;
        transform: translateX(30px) !important;
      }

      #${TOOLBAR_ID} > :nth-child(2),
      #${LINE_MENU_ID},
      [${HIDDEN_ATTR}="true"] {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `}</style>
  );
}
