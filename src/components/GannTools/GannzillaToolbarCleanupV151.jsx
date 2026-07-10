import React from 'react';

const BUILD = '156';
const HIDDEN_ATTR = 'data-gannzilla-toolbar-cleanup-v156';
const CANONICAL_ABOUT_ID = 'gannzilla-about-v156';
const LEGACY_ABOUT_ID = 'gannzilla-about-v141';

const AUXILIARY_LABELS = new Set([
  '100%',
  'Clockwise',
  'Counter',
  'Counterclockwise',
  'مع عقارب الساعة',
  'عكس عقارب الساعة',
  'غير عقارب الساعة',
]);

const AUXILIARY_TITLES = new Set([
  'إعادة إلى 100%',
  'إعادة الضبط إلى 100%',
  'Reset to 100%',
  'Clockwise',
  'Counter',
  'Counterclockwise',
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

const INFO_GLYPHS = new Set(['i', 'ⓘ', 'ℹ', 'ℹ️']);

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

function isTopRow(element) {
  const rect = element?.getBoundingClientRect?.();
  return Boolean(rect)
    && rect.width > 0
    && rect.height > 0
    && rect.top >= 0
    && rect.bottom <= 42;
}

function isCanonicalAbout(element) {
  if (!element) return false;
  return element.id === CANONICAL_ABOUT_ID
    || Boolean(element.closest?.(`#${CANONICAL_ABOUT_ID}`));
}

function isInformationElement(element) {
  if (!element || isCanonicalAbout(element)) return false;
  if (element.id === LEGACY_ABOUT_ID) return true;

  const title = String(element.getAttribute?.('title') || '').trim();
  const aria = String(element.getAttribute?.('aria-label') || '').trim();
  const label = normalizeLabel(element).toLowerCase();

  return INFO_TITLES.has(title)
    || INFO_TITLES.has(aria)
    || (isTopRow(element) && INFO_GLYPHS.has(label));
}

function removeInformationElement(element) {
  if (!element || isCanonicalAbout(element)) return false;
  const owner = element.closest?.('button, [role="button"]');
  const target = owner && isTopRow(owner) ? owner : element;
  if (isCanonicalAbout(target)) return false;
  if (!isTopRow(target) && target.id !== LEGACY_ABOUT_ID) return false;
  target.remove();
  return true;
}

function isAuxiliaryControl(element) {
  if (!element || !isTopRow(element)) return false;

  const label = normalizeLabel(element);
  const title = String(element.getAttribute?.('title') || '').trim();
  const aria = String(element.getAttribute?.('aria-label') || '').trim();

  return AUXILIARY_LABELS.has(label)
    || AUXILIARY_TITLES.has(title)
    || AUXILIARY_TITLES.has(aria)
    || label.includes('عقارب الساعة')
    || /^(clockwise|counter|counterclockwise)$/i.test(label);
}

function hideAuxiliaryControl(element) {
  if (!element) return false;
  const owner = element.closest?.('button, [role="button"]');
  const target = owner && isTopRow(owner) ? owner : element;
  if (!isAuxiliaryControl(target)) return false;
  if (target.getAttribute(HIDDEN_ATTR) !== 'true') {
    target.setAttribute(HIDDEN_ATTR, 'true');
  }
  return true;
}

export default function GannzillaToolbarCleanupV151() {
  React.useEffect(() => {
    let scheduled = false;
    let removedInformationIcons = 0;

    const apply = () => {
      scheduled = false;

      const candidates = document.querySelectorAll('button, [role="button"], span');
      candidates.forEach((element) => {
        if (isInformationElement(element) && removeInformationElement(element)) {
          removedInformationIcons += 1;
          return;
        }
        hideAuxiliaryControl(element);
      });

      const toolbar = findTopToolbar();
      const strip = toolbar?.children?.[1];
      if (strip) {
        Array.from(strip.children).forEach((element) => {
          if (isInformationElement(element)) {
            if (removeInformationElement(element)) removedInformationIcons += 1;
            return;
          }
          hideAuxiliaryControl(element);
        });
      }

      const canonicalAbout = document.getElementById(CANONICAL_ABOUT_ID);
      if (canonicalAbout) {
        canonicalAbout.removeAttribute(HIDDEN_ATTR);
        canonicalAbout.style.removeProperty('display');
        canonicalAbout.style.removeProperty('visibility');
        canonicalAbout.style.removeProperty('pointer-events');
      }

      window.GANNZILLA_TOOLBAR_CLEANUP_V156 = true;
      window.__auditGannzillaToolbarCleanupV156 = () => {
        const remainingDuplicateInformationIcons = Array.from(
          document.querySelectorAll('button, [role="button"], span'),
        ).filter(isInformationElement);
        const visibleCanonicalAbout = document.getElementById(CANONICAL_ABOUT_ID);
        const canonicalStyle = visibleCanonicalAbout ? window.getComputedStyle(visibleCanonicalAbout) : null;
        const remainingAuxiliaryControls = Array.from(
          document.querySelectorAll('button, [role="button"], span'),
        ).filter(isAuxiliaryControl)
          .filter((element) => {
            const owner = element.closest?.('button, [role="button"]');
            const target = owner && isTopRow(owner) ? owner : element;
            const style = window.getComputedStyle(target);
            return style.display !== 'none' && style.visibility !== 'hidden';
          });

        return {
          ok: Boolean(visibleCanonicalAbout)
            && canonicalStyle?.display !== 'none'
            && canonicalStyle?.visibility !== 'hidden'
            && remainingDuplicateInformationIcons.length === 0
            && remainingAuxiliaryControls.length === 0,
          build: BUILD,
          canonicalAboutVisible: Boolean(visibleCanonicalAbout)
            && canonicalStyle?.display !== 'none'
            && canonicalStyle?.visibility !== 'hidden',
          removedDuplicateInformationIcons: removedInformationIcons,
          remainingDuplicateInformationIcons: remainingDuplicateInformationIcons.length,
          visibleAuxiliaryControls: remainingAuxiliaryControls.map(normalizeLabel),
        };
      };
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
    const timer = window.setInterval(apply, 150);
    apply();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', schedule);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <style>{`
      #${LEGACY_ABOUT_ID},
      [${HIDDEN_ATTR}="true"] {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }

      #${CANONICAL_ABOUT_ID} {
        display: inline-flex !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }
    `}</style>
  );
}
