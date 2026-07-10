import React from 'react';

const BUILD = '152';
const HIDDEN_ATTR = 'data-gannzilla-toolbar-cleanup-v152';
const ABOUT_ID = 'gannzilla-about-v141';

const HIDDEN_BUTTON_LABELS = new Set([
  '100%',
  'Clockwise',
  'Counter',
  'مع عقارب الساعة',
  'عكس عقارب الساعة',
  'غير عقارب الساعة',
]);

const INFO_TITLES = new Set([
  'حول البرنامج',
  'About',
  'معلومات الأدوات',
  'Toolbar information',
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

function isInformationButton(element) {
  if (!element) return false;
  if (element.id === ABOUT_ID) return true;

  const title = String(element.getAttribute('title') || '').trim();
  const aria = String(element.getAttribute('aria-label') || '').trim();
  const label = normalizeLabel(element).toLowerCase();
  const rect = element.getBoundingClientRect();
  const isTopRow = rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= 42;

  return INFO_TITLES.has(title)
    || INFO_TITLES.has(aria)
    || (isTopRow && ['i', 'ⓘ', 'ℹ', 'ℹ️'].includes(label));
}

export default function GannzillaToolbarCleanupV151() {
  React.useEffect(() => {
    let scheduled = false;

    const apply = () => {
      scheduled = false;

      document.querySelectorAll('button, [role="button"]').forEach((element) => {
        if (isInformationButton(element)) element.setAttribute(HIDDEN_ATTR, 'true');
      });

      const toolbar = findTopToolbar();
      const strip = toolbar?.children?.[1];
      if (!strip) return;

      Array.from(strip.children).forEach((element) => {
        if (isInformationButton(element) || HIDDEN_BUTTON_LABELS.has(normalizeLabel(element))) {
          element.setAttribute(HIDDEN_ATTR, 'true');
        }
      });

      const hiddenInfoButtons = Array.from(document.querySelectorAll(`[${HIDDEN_ATTR}="true"]`))
        .filter(isInformationButton);

      window.GANNZILLA_TOOLBAR_CLEANUP_V152 = true;
      window.__auditGannzillaToolbarCleanupV152 = () => ({
        ok: hiddenInfoButtons.length > 0
          && hiddenInfoButtons.every((element) => {
            const style = window.getComputedStyle(element);
            return style.display === 'none' || style.visibility === 'hidden';
          })
          && Array.from(strip.children)
            .filter((element) => HIDDEN_BUTTON_LABELS.has(normalizeLabel(element)))
            .every((element) => element.getAttribute(HIDDEN_ATTR) === 'true'),
        build: BUILD,
        hiddenInformationButtons: hiddenInfoButtons.length,
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
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['id', 'title', 'aria-label', 'style', 'class'],
    });
    window.addEventListener('resize', schedule);
    const timer = window.setInterval(apply, 200);
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
      button[title="حول البرنامج"],
      button[title="About"],
      button[title="معلومات الأدوات"],
      button[title="Toolbar information"],
      button[aria-label="حول البرنامج"],
      button[aria-label="About"],
      button[aria-label="معلومات الأدوات"],
      button[aria-label="Toolbar information"],
      [${HIDDEN_ATTR}="true"] {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `}</style>
  );
}
