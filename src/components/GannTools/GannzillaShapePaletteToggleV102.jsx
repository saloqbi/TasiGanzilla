import React from 'react';

const MARKER = 'GANNZILLA_SHAPE_PALETTE_TOGGLE_V102';
const BUTTON_ID = 'gannzilla-shape-palette-toggle-v102';
const BUTTON_SIZE = 46;
const ICON_SIZE = 38;

function isVisible(element) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return rect.width > 0
    && rect.height > 0
    && style.display !== 'none'
    && style.visibility !== 'hidden';
}

function findToolbar() {
  return Array.from(document.querySelectorAll('div'))
    .filter((element) => {
      if (!isVisible(element)) return false;
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      const text = String(element.textContent || '');
      return style.position === 'fixed'
        && rect.top <= 2
        && rect.left >= 300
        && rect.width > 500
        && rect.height >= 32
        && rect.height <= 60
        && element.querySelectorAll('button').length >= 8
        && text.includes('%')
        && (text.includes('English') || text.includes('العربية'));
    })
    .sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0] || null;
}

function findTextButton(toolbar) {
  return Array.from(toolbar.querySelectorAll('button')).find((button) => {
    const title = String(button.title || button.getAttribute('aria-label') || '').toLowerCase();
    const text = String(button.textContent || '').trim();
    return title.includes('text tool')
      || title.includes('إضافة نص')
      || text === 'T';
  }) || null;
}

function findLockButton(toolbar) {
  return Array.from(toolbar.querySelectorAll('button')).find((button) => {
    const title = String(button.title || button.getAttribute('aria-label') || '').toLowerCase();
    return title.includes('lock drawings') || title.includes('قفل أدوات الرسم');
  }) || null;
}

function findShapePalette(toolbar) {
  const candidates = Array.from(document.querySelectorAll('div'))
    .filter((element) => {
      if (toolbar.contains(element)) return false;
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      const buttons = Array.from(element.querySelectorAll(':scope > button'));
      return style.position === 'fixed'
        && rect.right >= window.innerWidth - 80
        && rect.top >= 80
        && rect.top <= window.innerHeight * 0.60
        && rect.width >= 35
        && rect.width <= 90
        && rect.height >= 220
        && buttons.length >= 7
        && buttons.every((button) => button.getBoundingClientRect().width <= 50);
    });

  return candidates.sort((a, b) => {
    const scoreA = a.querySelectorAll(':scope > button').length;
    const scoreB = b.querySelectorAll(':scope > button').length;
    return scoreB - scoreA;
  })[0] || null;
}

function iconMarkup(visible) {
  return `
    <svg width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 24 24" aria-hidden="true" style="display:block;width:${ICON_SIZE}px;height:${ICON_SIZE}px">
      <rect x="4" y="3" width="16" height="18" rx="1" fill="#f4f4f4" stroke="#7d8d99" stroke-width="1.35"/>
      <rect x="7" y="5" width="4" height="14" fill="#b9ddf4" stroke="#5f93b5" stroke-width="0.9"/>
      <rect x="12.5" y="5.5" width="5" height="3.2" fill="#ffffff" stroke="#9aa5ad" stroke-width="0.8"/>
      <rect x="12.5" y="10.4" width="5" height="3.2" fill="#ffffff" stroke="#9aa5ad" stroke-width="0.8"/>
      <rect x="12.5" y="15.3" width="5" height="3.2" fill="#ffffff" stroke="#9aa5ad" stroke-width="0.8"/>
      <path d="M5.8 12h3.4" stroke="#2d76a5" stroke-width="1.1"/>
      ${visible
        ? '<circle cx="18.6" cy="5.4" r="2.4" fill="#2d8b57"/><path d="m17.3 5.4 1 1 1.7-2" fill="none" stroke="#fff" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>'
        : '<circle cx="18.6" cy="5.4" r="2.4" fill="#a5a5a5"/><path d="M17.2 5.4h2.8" stroke="#fff" stroke-width="0.9" stroke-linecap="round"/>'}
    </svg>`;
}

function styleButton(button, active) {
  button.style.setProperty('width', `${BUTTON_SIZE}px`, 'important');
  button.style.setProperty('min-width', `${BUTTON_SIZE}px`, 'important');
  button.style.setProperty('height', `${BUTTON_SIZE}px`, 'important');
  button.style.setProperty('padding', '0', 'important');
  button.style.setProperty('border', '1px solid #aeb6bb', 'important');
  button.style.setProperty('border-radius', '3px', 'important');
  button.style.setProperty('background', active ? '#d7ebf9' : 'linear-gradient(#ffffff,#e9e9e9)', 'important');
  button.style.setProperty('box-shadow', active ? 'inset 0 0 0 1px #8cc3e8' : 'none', 'important');
  button.style.setProperty('display', 'flex', 'important');
  button.style.setProperty('align-items', 'center', 'important');
  button.style.setProperty('justify-content', 'center', 'important');
  button.style.setProperty('box-sizing', 'border-box', 'important');
  button.style.setProperty('cursor', 'pointer', 'important');
  button.style.setProperty('flex', `0 0 ${BUTTON_SIZE}px`, 'important');
}

export default function GannzillaShapePaletteToggleV102() {
  React.useEffect(() => {
    const enabled = window.location.search.includes('gannzillaPro=true')
      || window.location.search.includes('wheelPro=true');
    if (!enabled) return undefined;

    let paletteVisible = true;
    let palette = null;
    let toggleButton = null;

    const renderState = () => {
      if (!toggleButton) return;
      toggleButton.innerHTML = iconMarkup(paletteVisible);
      toggleButton.title = document.documentElement.lang === 'ar'
        ? (paletteVisible ? 'إخفاء لوحة الأشكال' : 'إظهار لوحة الأشكال')
        : (paletteVisible ? 'Hide shape palette' : 'Show shape palette');
      toggleButton.setAttribute('aria-label', toggleButton.title);
      toggleButton.setAttribute('aria-pressed', String(paletteVisible));
      styleButton(toggleButton, paletteVisible);
    };

    const applyVisibility = () => {
      if (!palette) return;
      palette.style.setProperty('display', paletteVisible ? 'flex' : 'none', 'important');
      palette.dataset.gannzillaShapePaletteVisibleV102 = String(paletteVisible);
      renderState();

      window.__gannzillaShapePaletteToggleV102Metrics = {
        ok: true,
        marker: window[MARKER] === true,
        buttonPresent: Boolean(toggleButton),
        paletteFound: Boolean(palette),
        paletteVisible,
        position: 'after-text-before-lock',
        buttonSize: BUTTON_SIZE,
        iconSize: ICON_SIZE,
        functionalToggle: true,
      };
    };

    const sync = () => {
      const toolbar = findToolbar();
      if (!toolbar) return;

      palette = palette && document.body.contains(palette)
        ? palette
        : findShapePalette(toolbar);

      const textButton = findTextButton(toolbar);
      const lockButton = findLockButton(toolbar);
      if (!textButton || !lockButton) return;

      toggleButton = document.getElementById(BUTTON_ID);
      if (!toggleButton) {
        toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.id = BUTTON_ID;
        lockButton.parentElement?.insertBefore(toggleButton, lockButton);
      } else if (toggleButton.nextElementSibling !== lockButton) {
        lockButton.parentElement?.insertBefore(toggleButton, lockButton);
      }

      toggleButton.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        paletteVisible = !paletteVisible;
        applyVisibility();
      };

      if (palette) {
        const currentlyHidden = window.getComputedStyle(palette).display === 'none';
        if (!palette.dataset.gannzillaShapePaletteVisibleV102) {
          paletteVisible = !currentlyHidden;
        }
      }

      applyVisibility();
    };

    window[MARKER] = true;
    window.__auditGannzillaShapePaletteToggleV102 = () => {
      const metrics = window.__gannzillaShapePaletteToggleV102Metrics || {};
      return {
        ok: window[MARKER] === true
          && metrics.buttonPresent === true
          && metrics.paletteFound === true
          && metrics.functionalToggle === true
          && metrics.buttonSize === BUTTON_SIZE,
        marker: window[MARKER] === true,
        metrics,
      };
    };

    const timer = window.setInterval(sync, 220);
    const observer = new MutationObserver(sync);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'lang'],
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    sync();

    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      if (toggleButton) toggleButton.onclick = null;
      if (palette) palette.style.removeProperty('display');
    };
  }, []);

  return null;
}
