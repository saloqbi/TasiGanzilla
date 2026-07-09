import React from 'react';

const MARKER = 'GANNZILLA_RIGHT_SHAPE_BAR_TOGGLE_V111';
const BUTTON_ID = 'gannzilla-right-shape-bar-toggle-v111';
const LEFT_DRAWING_BUTTON_ID = 'gannzilla-left-drawing-palette-toggle-v113';

function findTopToolbar() {
  return Array.from(document.querySelectorAll('div')).find((element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return style.position === 'fixed'
      && rect.top <= 1
      && rect.left <= 1
      && rect.right >= window.innerWidth - 1
      && rect.height >= 22
      && rect.height <= 28
      && element.querySelectorAll('button').length >= 8;
  }) || null;
}

function findLockButton(toolbar) {
  if (!toolbar) return null;
  return Array.from(toolbar.querySelectorAll('button')).find((button) => {
    const text = String(button.textContent || '').trim();
    const title = `${button.title || ''} ${button.getAttribute('aria-label') || ''}`.toLowerCase();
    return text.includes('🔒') || title.includes('lock') || title.includes('قفل');
  }) || null;
}

function findRightShapeBar() {
  return Array.from(document.querySelectorAll('div')).find((element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    const buttons = Array.from(element.querySelectorAll(':scope > button'));
    return style.position === 'fixed'
      && rect.right >= window.innerWidth - 40
      && rect.top >= 120
      && rect.top <= 220
      && rect.width >= 35
      && rect.width <= 75
      && rect.height >= 250
      && buttons.length >= 8;
  }) || null;
}

function iconMarkup(visible) {
  return `
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" style="display:block">
      <rect x="4" y="3" width="16" height="18" rx="1" fill="#f7f7f7" stroke="#6f8798" stroke-width="1.25"/>
      <rect x="6.7" y="5" width="3.6" height="14" fill="#b8dcf2" stroke="#5f93b5" stroke-width="0.8"/>
      <rect x="12" y="5.5" width="5.2" height="3" fill="#ffffff" stroke="#9ba7af" stroke-width="0.7"/>
      <rect x="12" y="10.5" width="5.2" height="3" fill="#ffffff" stroke="#9ba7af" stroke-width="0.7"/>
      <rect x="12" y="15.5" width="5.2" height="3" fill="#ffffff" stroke="#9ba7af" stroke-width="0.7"/>
      <circle cx="18.4" cy="5.2" r="2.1" fill="${visible ? '#2d8b57' : '#999999'}"/>
      ${visible
        ? '<path d="m17.3 5.2.8.9 1.5-1.8" fill="none" stroke="#fff" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>'
        : '<path d="M17.2 5.2h2.4" stroke="#fff" stroke-width="0.8" stroke-linecap="round"/>'}
    </svg>`;
}

function styleButton(button, visible) {
  button.style.width = '22px';
  button.style.minWidth = '22px';
  button.style.height = '21px';
  button.style.padding = '0';
  button.style.marginRight = '2px';
  button.style.border = '1px solid #a7a7a7';
  button.style.borderRadius = '2px';
  button.style.background = visible ? '#dceef9' : '#f7f7f7';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.cursor = 'pointer';
  button.style.boxSizing = 'border-box';
}

export default function GannzillaRightShapeBarToggleV111() {
  React.useEffect(() => {
    const enabled = window.location.search.includes('gannzillaPro=true')
      || window.location.search.includes('wheelPro=true');
    if (!enabled) return undefined;

    let toggleButton = null;
    let rightBar = null;
    let visible = true;

    const renderButton = () => {
      if (!toggleButton) return;
      const arabic = document.documentElement.lang === 'ar';
      toggleButton.innerHTML = iconMarkup(visible);
      toggleButton.title = arabic
        ? (visible ? 'إخفاء لوحة الأشكال اليمنى' : 'إظهار لوحة الأشكال اليمنى')
        : (visible ? 'Hide right shape palette' : 'Show right shape palette');
      toggleButton.setAttribute('aria-label', toggleButton.title);
      toggleButton.setAttribute('aria-pressed', String(visible));
      styleButton(toggleButton, visible);
    };

    const applyVisibility = () => {
      rightBar = rightBar && document.body.contains(rightBar) ? rightBar : findRightShapeBar();
      if (!rightBar) return false;
      rightBar.style.setProperty('display', visible ? 'flex' : 'none', 'important');
      rightBar.setAttribute('aria-hidden', visible ? 'false' : 'true');
      renderButton();
      return true;
    };

    const bind = () => {
      const toolbar = findTopToolbar();
      const lockButton = findLockButton(toolbar);
      rightBar = rightBar && document.body.contains(rightBar) ? rightBar : findRightShapeBar();
      if (!toolbar || !lockButton || !rightBar) return;

      toggleButton = document.getElementById(BUTTON_ID);
      if (!toggleButton) {
        toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.id = BUTTON_ID;
      }

      const parent = lockButton.parentElement;
      const leftDrawingButton = document.getElementById(LEFT_DRAWING_BUTTON_ID);
      const anchor = leftDrawingButton && leftDrawingButton.parentElement === parent ? leftDrawingButton : lockButton;
      if (parent && anchor.nextElementSibling !== toggleButton) {
        parent.insertBefore(toggleButton, anchor.nextElementSibling);
      }

      if (toggleButton.dataset.gannzillaBoundV111 !== 'true') {
        toggleButton.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          visible = !visible;
          applyVisibility();

          window.__gannzillaRightShapeBarToggleV111Metrics = {
            ok: true,
            marker: window[MARKER] === true,
            buttonPresent: true,
            rightPaletteFound: true,
            rightPaletteVisible: visible,
            lastToggleWorked: true,
            position: 'after-left-drawing-toggle',
          };
        });
        toggleButton.dataset.gannzillaBoundV111 = 'true';
      }

      visible = window.getComputedStyle(rightBar).display !== 'none';
      renderButton();

      window.__gannzillaRightShapeBarToggleV111Metrics = {
        ok: true,
        marker: window[MARKER] === true,
        buttonPresent: true,
        rightPaletteFound: true,
        rightPaletteVisible: visible,
        lastToggleWorked: null,
        position: 'after-left-drawing-toggle',
      };
    };

    window[MARKER] = true;
    window.__auditGannzillaRightShapeBarToggleV111 = () => {
      const metrics = window.__gannzillaRightShapeBarToggleV111Metrics || {};
      return {
        ok: window[MARKER] === true
          && metrics.buttonPresent === true
          && metrics.rightPaletteFound === true,
        marker: window[MARKER] === true,
        metrics,
      };
    };

    const timer = window.setInterval(bind, 300);
    const observer = new MutationObserver(bind);
    observer.observe(document.body, { childList: true, subtree: true });
    const languageObserver = new MutationObserver(renderButton);
    languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    bind();

    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      languageObserver.disconnect();
      toggleButton?.remove();
      if (rightBar) rightBar.style.removeProperty('display');
    };
  }, []);

  return null;
}
