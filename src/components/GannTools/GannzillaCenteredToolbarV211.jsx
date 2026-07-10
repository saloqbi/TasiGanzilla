import React from 'react';

const TOOLBAR_ID = 'gannzilla-exact-drawing-toolbar-v208';
const LINE_MENU_ID = 'gannzilla-exact-line-menu-v208';
const HIDDEN_ATTR = 'data-gannzilla-line-icon-hidden-v211';

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

export default function GannzillaCenteredToolbarV211() {
  React.useEffect(() => {
    let disposed = false;

    const apply = () => {
      if (disposed) return;

      const toolbar = document.getElementById(TOOLBAR_ID);
      if (toolbar) {
        toolbar.style.setProperty('width', '94px', 'important');
        toolbar.style.setProperty('transform', 'translateX(5px)', 'important');
        toolbar.style.setProperty('padding', '0 4px', 'important');
        toolbar.style.setProperty('gap', '6px', 'important');
        toolbar.style.setProperty('justify-content', 'center', 'important');
        toolbar.style.setProperty('align-items', 'center', 'important');
        toolbar.style.setProperty('overflow', 'visible', 'important');

        const lineControl = toolbar.children?.[1];
        if (lineControl) {
          lineControl.setAttribute(HIDDEN_ATTR, 'true');
          lineControl.style.setProperty('display', 'none', 'important');
          lineControl.style.setProperty('visibility', 'hidden', 'important');
          lineControl.style.setProperty('pointer-events', 'none', 'important');
        }

        [toolbar.children?.[0], toolbar.children?.[2], toolbar.children?.[3]]
          .filter(Boolean)
          .forEach((control) => {
            control.style.setProperty('flex', '0 0 auto', 'important');
            control.style.setProperty('margin', '0', 'important');
            control.style.setProperty('align-self', 'center', 'important');
            control.style.setProperty('border-left', '1px solid #9da7ae', 'important');
          });
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

      window.GANNZILLA_CENTERED_TOOLBAR_V211 = true;
      window.__auditGannzillaCenteredToolbarV211 = () => ({
        ok: Boolean(toolbar)
          && toolbar?.children?.[1]?.getAttribute(HIDDEN_ATTR) === 'true'
          && Math.round(toolbar.getBoundingClientRect().width) === 94,
        build: 211,
        toolbarWidth: toolbar ? Math.round(toolbar.getBoundingClientRect().width) : null,
        gap: toolbar ? window.getComputedStyle(toolbar).gap : null,
      });
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = window.setInterval(apply, 250);
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
        width: 94px !important;
        transform: translateX(5px) !important;
        padding: 0 4px !important;
        gap: 6px !important;
        justify-content: center !important;
        align-items: center !important;
        overflow: visible !important;
      }

      #${TOOLBAR_ID} > :nth-child(2),
      #${LINE_MENU_ID},
      [${HIDDEN_ATTR}="true"] {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }

      #${TOOLBAR_ID} > :not(:nth-child(2)) {
        flex: 0 0 auto !important;
        margin: 0 !important;
        align-self: center !important;
        border-left: 1px solid #9da7ae !important;
      }
    `}</style>
  );
}
