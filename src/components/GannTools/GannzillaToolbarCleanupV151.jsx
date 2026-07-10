import React from 'react';

const BUILD = '151';
const HIDDEN_ATTR = 'data-gannzilla-toolbar-cleanup-v151';
const ABOUT_ID = 'gannzilla-about-v141';

const HIDDEN_BUTTON_LABELS = new Set([
  '100%',
  'Clockwise',
  'Counter',
  'مع عقارب الساعة',
  'عكس عقارب الساعة',
  'غير عقارب الساعة',
]);

function findTopToolbar() {
  return Array.from(document.querySelectorAll('div'))
    .filter((element) => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const text = String(element.textContent || '');
      return style.position === 'fixed'
        && rect.top <= 1
        && rect.height >= 20
        && rect.height <= 30
        && (text.includes('Gannzilla Pro') || text.includes('جانزيلا برو'));
    })
    .sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0] || null;
}

function normalizeLabel(element) {
  return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
}

export default function GannzillaToolbarCleanupV151() {
  React.useEffect(() => {
    let scheduled = false;

    const apply = () => {
      scheduled = false;

      const aboutButton = document.getElementById(ABOUT_ID);
      if (aboutButton) aboutButton.setAttribute(HIDDEN_ATTR, 'true');

      const toolbar = findTopToolbar();
      const strip = toolbar?.children?.[1];
      if (!strip) return;

      Array.from(strip.children).forEach((element) => {
        if (element.id === ABOUT_ID || HIDDEN_BUTTON_LABELS.has(normalizeLabel(element))) {
          element.setAttribute(HIDDEN_ATTR, 'true');
        }
      });

      window.GANNZILLA_TOOLBAR_CLEANUP_V151 = true;
      window.__auditGannzillaToolbarCleanupV151 = () => ({
        ok: document.getElementById(ABOUT_ID)?.getAttribute(HIDDEN_ATTR) === 'true'
          && Array.from(strip.children)
            .filter((element) => HIDDEN_BUTTON_LABELS.has(normalizeLabel(element)))
            .every((element) => element.getAttribute(HIDDEN_ATTR) === 'true'),
        build: BUILD,
        aboutHidden: document.getElementById(ABOUT_ID)?.getAttribute(HIDDEN_ATTR) === 'true',
        hiddenToolbarLabels: Array.from(strip.children)
          .filter((element) => element.getAttribute(HIDDEN_ATTR) === 'true')
          .map(normalizeLabel),
      });
    };

    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(apply);
    };

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener('resize', schedule);
    const timer = window.setInterval(apply, 250);
    apply();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', schedule);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <style>{`
      #${ABOUT_ID},
      [${HIDDEN_ATTR}="true"] {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `}</style>
  );
}
