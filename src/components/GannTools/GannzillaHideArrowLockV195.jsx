import React from 'react';

const HIDDEN_LABELS = new Set(['↖', '🔒', '🔐']);
const HIDDEN_ATTRIBUTE = 'data-gannzilla-v195-hidden';

function cleanLabel(element) {
  return String(element?.textContent || '').replace(/\s+/g, '').trim();
}

function isTopToolbarButton(button) {
  const rect = button?.getBoundingClientRect?.();
  return Boolean(rect)
    && rect.width > 0
    && rect.height > 0
    && rect.top >= 0
    && rect.bottom <= 48;
}

export default function GannzillaHideArrowLockV195() {
  React.useLayoutEffect(() => {
    const hidden = [];

    Array.from(document.querySelectorAll('button')).forEach((button) => {
      if (!isTopToolbarButton(button)) return;
      if (!HIDDEN_LABELS.has(cleanLabel(button))) return;

      button.setAttribute(HIDDEN_ATTRIBUTE, 'true');
      button.style.setProperty('display', 'none', 'important');
      button.style.setProperty('visibility', 'hidden', 'important');
      button.style.setProperty('pointer-events', 'none', 'important');
      hidden.push(button);
    });

    return () => {
      hidden.forEach((button) => {
        if (!button.hasAttribute(HIDDEN_ATTRIBUTE)) return;
        button.style.removeProperty('display');
        button.style.removeProperty('visibility');
        button.style.removeProperty('pointer-events');
        button.removeAttribute(HIDDEN_ATTRIBUTE);
      });
    };
  }, []);

  return null;
}
