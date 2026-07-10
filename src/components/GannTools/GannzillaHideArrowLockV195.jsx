import React from 'react';

const HIDDEN_LABELS = new Set(['↖', '🔒', '🔐']);
const HIDDEN_ATTRIBUTE = 'data-gannzilla-v196-hidden';
const MAX_ATTEMPTS = 50;
const RETRY_DELAY_MS = 100;

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

function hideButton(button) {
  if (!button || button.hasAttribute(HIDDEN_ATTRIBUTE)) return false;
  button.setAttribute(HIDDEN_ATTRIBUTE, 'true');
  button.style.setProperty('display', 'none', 'important');
  button.style.setProperty('visibility', 'hidden', 'important');
  button.style.setProperty('pointer-events', 'none', 'important');
  button.style.setProperty('width', '0', 'important');
  button.style.setProperty('min-width', '0', 'important');
  button.style.setProperty('padding', '0', 'important');
  button.style.setProperty('margin', '0', 'important');
  button.style.setProperty('border', '0', 'important');
  button.setAttribute('aria-hidden', 'true');
  return true;
}

export default function GannzillaHideArrowLockV195() {
  React.useLayoutEffect(() => {
    const hidden = new Set();
    let disposed = false;
    let timer = null;
    let attempts = 0;

    const apply = () => {
      if (disposed) return;
      attempts += 1;

      Array.from(document.querySelectorAll('button')).forEach((button) => {
        if (!isTopToolbarButton(button)) return;
        if (!HIDDEN_LABELS.has(cleanLabel(button))) return;
        if (hideButton(button)) hidden.add(button);
      });

      const arrowHidden = Array.from(hidden).some((button) => cleanLabel(button) === '↖');
      const lockHidden = Array.from(hidden).some((button) => ['🔒', '🔐'].includes(cleanLabel(button)));

      if ((!arrowHidden || !lockHidden) && attempts < MAX_ATTEMPTS) {
        timer = window.setTimeout(apply, RETRY_DELAY_MS);
      }
    };

    apply();

    return () => {
      disposed = true;
      if (timer) window.clearTimeout(timer);
      hidden.forEach((button) => {
        if (!button.hasAttribute(HIDDEN_ATTRIBUTE)) return;
        button.style.removeProperty('display');
        button.style.removeProperty('visibility');
        button.style.removeProperty('pointer-events');
        button.style.removeProperty('width');
        button.style.removeProperty('min-width');
        button.style.removeProperty('padding');
        button.style.removeProperty('margin');
        button.style.removeProperty('border');
        button.removeAttribute('aria-hidden');
        button.removeAttribute(HIDDEN_ATTRIBUTE);
      });
    };
  }, []);

  return null;
}
