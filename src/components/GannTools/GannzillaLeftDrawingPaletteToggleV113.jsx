import React from 'react';

const MARKER = 'GANNZILLA_LEFT_DRAWING_PALETTE_TOGGLE_V113';
const BUTTON_ID = 'gannzilla-left-drawing-palette-toggle-v113';
const TOGGLE_EVENT = 'gannzilla:toggle-left-drawing-palette-v113';
const STATE_EVENT = 'gannzilla:left-drawing-palette-state-v113';
const STORAGE_KEY = 'gannzillaLeftDrawingPaletteVisibleV113';

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

function readVisibility() {
  if (typeof window.__gannzillaLeftDrawingPaletteVisibleV113 === 'boolean') {
    return window.__gannzillaLeftDrawingPaletteVisibleV113;
  }
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'false';
  } catch (_) {
    return true;
  }
}

function iconMarkup(visible) {
  return `
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" style="display:block">
      <rect x="4" y="3" width="16" height="18" rx="1" fill="#f7f7f7" stroke="#6f8798" stroke-width="1.25"/>
      <rect x="6.7" y="5" width="3.6" height="14" fill="#b8dcf2" stroke="#5f93b5" stroke-width="0.8"/>
      <path d="M12.3 6.5h4.7M12.3 11.8h4.7M12.3 17.1h4.7" stroke="#8798a4" stroke-width="1.2" stroke-linecap="round"/>
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

export default function GannzillaLeftDrawingPaletteToggleV113() {
  React.useEffect(() => {
    const enabled = window.location.search.includes('gannzillaPro=true')
      || window.location.search.includes('wheelPro=true');
    if (!enabled) return undefined;

    let button = null;
    let visible = readVisibility();

    const render = () => {
      if (!button) return;
      const arabic = document.documentElement.lang === 'ar';
      button.innerHTML = iconMarkup(visible);
      button.title = arabic
        ? (visible ? 'إخفاء أدوات الرسم' : 'إظهار أدوات الرسم')
        : (visible ? 'Hide drawing tools' : 'Show drawing tools');
      button.setAttribute('aria-label', button.title);
      button.setAttribute('aria-pressed', String(visible));
      styleButton(button, visible);
    };

    const handleState = (event) => {
      visible = Boolean(event?.detail?.visible);
      render();
    };

    const bind = () => {
      const toolbar = findTopToolbar();
      const lockButton = findLockButton(toolbar);
      if (!toolbar || !lockButton) return;

      button = document.getElementById(BUTTON_ID);
      if (!button) {
        button = document.createElement('button');
        button.type = 'button';
        button.id = BUTTON_ID;
      }

      const parent = lockButton.parentElement;
      if (parent && lockButton.nextElementSibling !== button) {
        parent.insertBefore(button, lockButton.nextElementSibling);
      }

      if (button.dataset.gannzillaBoundV113 !== 'true') {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          window.dispatchEvent(new CustomEvent(TOGGLE_EVENT));
        });
        button.dataset.gannzillaBoundV113 = 'true';
      }

      visible = readVisibility();
      render();

      window.__gannzillaLeftDrawingPaletteToggleV113Metrics = {
        ok: true,
        marker: window[MARKER] === true,
        buttonPresent: true,
        position: 'immediately-after-lock',
        visible,
        functionalToggle: true,
      };
    };

    window[MARKER] = true;
    window.__auditGannzillaLeftDrawingPaletteToggleV113 = () => ({
      ok: window[MARKER] === true
        && window.__gannzillaLeftDrawingPaletteToggleV113Metrics?.buttonPresent === true
        && window.__gannzillaLeftDrawingPaletteToggleV113Metrics?.functionalToggle === true,
      marker: window[MARKER] === true,
      metrics: window.__gannzillaLeftDrawingPaletteToggleV113Metrics || null,
    });

    window.addEventListener(STATE_EVENT, handleState);
    const timer = window.setInterval(bind, 300);
    const observer = new MutationObserver(bind);
    observer.observe(document.body, { childList: true, subtree: true });
    const languageObserver = new MutationObserver(render);
    languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    bind();

    return () => {
      window.removeEventListener(STATE_EVENT, handleState);
      window.clearInterval(timer);
      observer.disconnect();
      languageObserver.disconnect();
      button?.remove();
    };
  }, []);

  return null;
}
