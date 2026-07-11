import React from 'react';

const BUILD = 215;
const RESTORED_ATTR = 'data-gannzilla-wheel-zoom-minus-v215';
const FINAL_TOOLBAR_ID = 'gannzilla-final-drawing-toolbar-v214';
const SOURCE_TOOLBAR_ID = 'gannzilla-exact-drawing-toolbar-v208';
const DRAWING_HIDDEN_ATTR = 'data-gannzilla-native-drawing-hidden-v214';
const LEGACY_HIDDEN_ATTR = 'data-gannzilla-line-icon-hidden-v211';

function compactLabel(element) {
  return String(element?.textContent || '').replace(/\s+/g, '').trim();
}

function isVisibleTopElement(element) {
  const rect = element?.getBoundingClientRect?.();
  return Boolean(rect)
    && rect.width > 0
    && rect.height > 0
    && rect.top >= 0
    && rect.bottom <= 60;
}

function findZoomPercentageElement() {
  return Array.from(document.querySelectorAll('button, span, div'))
    .filter((element) => !element.closest?.(`#${FINAL_TOOLBAR_ID}, #${SOURCE_TOOLBAR_ID}`))
    .filter(isVisibleTopElement)
    .find((element) => /^\d{2,3}%$/.test(compactLabel(element))) || null;
}

function looksLikeZoomOut(button) {
  const label = compactLabel(button);
  const title = String(button?.getAttribute?.('title') || '').toLowerCase();
  const aria = String(button?.getAttribute?.('aria-label') || '').toLowerCase();
  const text = `${title} ${aria}`;

  return ['-', '−', '–', '—'].includes(label)
    || text.includes('zoom out')
    || text.includes('zoom-out')
    || text.includes('تصغير')
    || text.includes('تقليل التكبير');
}

function findWheelZoomMinusButton() {
  const percentage = findZoomPercentageElement();
  const buttons = Array.from(document.querySelectorAll('button'))
    .filter((button) => !button.closest?.(`#${FINAL_TOOLBAR_ID}, #${SOURCE_TOOLBAR_ID}`))
    .filter(isVisibleTopElement)
    .filter(looksLikeZoomOut);

  if (!buttons.length) return null;

  if (!percentage) {
    return buttons.find((button) => {
      const title = String(button.getAttribute('title') || '').toLowerCase();
      const aria = String(button.getAttribute('aria-label') || '').toLowerCase();
      return `${title} ${aria}`.includes('zoom')
        || `${title} ${aria}`.includes('تصغير');
    }) || null;
  }

  const percentRect = percentage.getBoundingClientRect();
  return buttons
    .map((button) => {
      const rect = button.getBoundingClientRect();
      const verticalDistance = Math.abs((rect.top + rect.height / 2) - (percentRect.top + percentRect.height / 2));
      const horizontalGap = percentRect.left - rect.right;
      const isLeftNeighbour = horizontalGap >= -3 && horizontalGap <= 45;
      const score = (isLeftNeighbour ? 0 : 1000) + verticalDistance * 10 + Math.abs(horizontalGap);
      return { button, score };
    })
    .sort((a, b) => a.score - b.score)[0]?.button || null;
}

function setImportant(element, property, value) {
  if (!element) return;
  if (element.style.getPropertyValue(property) === value
    && element.style.getPropertyPriority(property) === 'important') return;
  element.style.setProperty(property, value, 'important');
}

function restoreZoomMinus(button) {
  if (!button) return false;

  button.setAttribute(RESTORED_ATTR, 'true');
  button.removeAttribute(DRAWING_HIDDEN_ATTR);
  button.removeAttribute(LEGACY_HIDDEN_ATTR);
  button.removeAttribute('hidden');
  button.setAttribute('aria-hidden', 'false');

  setImportant(button, 'display', 'inline-flex');
  setImportant(button, 'opacity', '1');
  setImportant(button, 'visibility', 'visible');
  setImportant(button, 'pointer-events', 'auto');

  return true;
}

export default function GannzillaRestoreWheelZoomMinusV215() {
  React.useEffect(() => {
    let disposed = false;
    let scheduled = false;

    const apply = () => {
      scheduled = false;
      if (disposed) return;

      const button = findWheelZoomMinusButton();
      const restored = restoreZoomMinus(button);

      window.GANNZILLA_RESTORE_WHEEL_ZOOM_MINUS_V215 = restored;
      window.__auditGannzillaRestoreWheelZoomMinusV215 = () => ({
        ok: Boolean(findWheelZoomMinusButton()?.getAttribute(RESTORED_ATTR) === 'true'),
        build: BUILD,
        label: compactLabel(findWheelZoomMinusButton()),
        percentageFound: Boolean(findZoomPercentageElement()),
      });
    };

    const schedule = () => {
      if (disposed || scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(apply);
    };

    apply();
    const timer = window.setInterval(apply, 50);
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'hidden', 'aria-hidden', DRAWING_HIDDEN_ATTR, LEGACY_HIDDEN_ATTR],
    });
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);

    return () => {
      disposed = true;
      window.clearInterval(timer);
      observer.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
    };
  }, []);

  return null;
}
