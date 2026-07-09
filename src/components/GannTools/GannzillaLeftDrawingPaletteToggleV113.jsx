import React from 'react';

const MARKER = 'GANNZILLA_LEFT_DRAWING_PALETTE_TOGGLE_V113_FIXED';
const BUTTON_ID = 'gannzilla-left-drawing-palette-toggle-v113';
const PALETTE_ID = 'gannzilla-native-left-drawing-palette-v113';
const SET_EVENT = 'gannzilla:set-left-drawing-palette-v113';
const STATE_EVENT = 'gannzilla:left-drawing-palette-state-v113';
const STORAGE_KEY = 'gannzillaLeftDrawingPaletteVisibleV113';

function findToolbar() {
  return Array.from(document.querySelectorAll('div')).find((element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return style.position === 'fixed'
      && rect.top <= 2
      && rect.left <= 2
      && rect.right >= window.innerWidth - 2
      && rect.height >= 22
      && rect.height <= 30
      && element.querySelectorAll('button').length >= 8;
  }) || null;
}

function findLockButton(toolbar) {
  if (!toolbar) return null;
  return Array.from(toolbar.querySelectorAll('button')).find((button) => {
    const text = String(button.textContent || '').trim();
    const title = `${button.title || ''} ${button.getAttribute('aria-label') || ''}`.toLowerCase();
    return text.includes('🔒') || text.includes('🔐') || title.includes('lock') || title.includes('قفل');
  }) || null;
}

function readVisible() {
  if (typeof window.__gannzillaLeftDrawingPaletteVisibleV113 === 'boolean') {
    return window.__gannzillaLeftDrawingPaletteVisibleV113;
  }
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'false';
  } catch (_) {
    return true;
  }
}

function writeVisible(value) {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch (_) {
    // Storage may be blocked; the runtime event still controls the palette.
  }
}

function iconMarkup(visible) {
  return `
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" style="display:block;pointer-events:none">
      <rect x="4" y="3" width="16" height="18" rx="1" fill="#f7f7f7" stroke="#5f7f95" stroke-width="1.35"/>
      <rect x="6.5" y="5" width="4" height="14" fill="#b9ddf4" stroke="#4f8cb4" stroke-width="0.9"/>
      <path d="M12.5 6.5h4.6M12.5 11.8h4.6M12.5 17.1h4.6" stroke="#718895" stroke-width="1.25" stroke-linecap="round"/>
      <circle cx="18.5" cy="5.1" r="2.2" fill="${visible ? '#22884f' : '#969696'}"/>
      ${visible
        ? '<path d="m17.3 5.1.9 1 1.6-1.9" fill="none" stroke="#fff" stroke-width="0.85" stroke-linecap="round" stroke-linejoin="round"/>'
        : '<path d="M17.25 5.1h2.5" stroke="#fff" stroke-width="0.85" stroke-linecap="round"/>'}
    </svg>`;
}

function styleButton(button, visible) {
  button.style.width = '22px';
  button.style.minWidth = '22px';
  button.style.height = '21px';
  button.style.padding = '0';
  button.style.marginRight = '2px';
  button.style.border = '1px solid #8fa5b4';
  button.style.borderRadius = '2px';
  button.style.background = visible ? '#d9edf9' : '#f7f7f7';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.cursor = 'pointer';
  button.style.boxSizing = 'border-box';
  button.style.flex = '0 0 22px';
  button.style.pointerEvents = 'auto';
  button.style.position = 'static';
  button.style.zIndex = 'auto';
}

export default function GannzillaLeftDrawingPaletteToggleV113() {
  React.useEffect(() => {
    const enabled = window.location.search.includes('gannzillaPro=true')
      || window.location.search.includes('wheelPro=true');
    if (!enabled) return undefined;

    let button = null;
    let visible = readVisible();

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

    const applyVisibility = (nextVisible) => {
      visible = Boolean(nextVisible);
      writeVisible(visible);
      window.__gannzillaLeftDrawingPaletteVisibleV113 = visible;

      window.dispatchEvent(new CustomEvent(SET_EVENT, {
        detail: { visible },
      }));

      const palette = document.getElementById(PALETTE_ID);
      if (palette) {
        palette.style.setProperty('display', visible ? 'flex' : 'none', 'important');
        palette.setAttribute('aria-hidden', visible ? 'false' : 'true');
      }

      render();

      window.setTimeout(() => {
        const updatedPalette = document.getElementById(PALETTE_ID);
        if (updatedPalette) {
          updatedPalette.style.setProperty('display', visible ? 'flex' : 'none', 'important');
          updatedPalette.setAttribute('aria-hidden', visible ? 'false' : 'true');
        }
      }, 80);
    };

    const handleState = (event) => {
      visible = Boolean(event?.detail?.visible);
      writeVisible(visible);
      render();
    };

    const bind = () => {
      const toolbar = findToolbar();
      const lockButton = findLockButton(toolbar);
      if (!toolbar || !lockButton?.parentElement) return;

      button = document.getElementById(BUTTON_ID);
      if (!button) {
        button = document.createElement('button');
        button.type = 'button';
        button.id = BUTTON_ID;
      }

      const parent = lockButton.parentElement;
      if (lockButton.nextElementSibling !== button) {
        parent.insertBefore(button, lockButton.nextElementSibling);
      }

      button.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        applyVisibility(!readVisible());
      };

      visible = readVisible();
      render();

      window.__gannzillaLeftDrawingPaletteToggleV113Metrics = {
        ok: true,
        marker: window[MARKER] === true,
        buttonPresent: button.isConnected,
        position: lockButton.nextElementSibling === button ? 'immediately-after-lock' : 'incorrect',
        visible,
        directSetEvent: true,
        directDomFallback: true,
        functionalToggle: typeof button.onclick === 'function',
      };
    };

    window[MARKER] = true;
    window.__auditGannzillaLeftDrawingPaletteToggleV113 = () => {
      const metrics = window.__gannzillaLeftDrawingPaletteToggleV113Metrics || {};
      return {
        ok: window[MARKER] === true
          && metrics.buttonPresent === true
          && metrics.position === 'immediately-after-lock'
          && metrics.functionalToggle === true
          && metrics.directSetEvent === true,
        marker: window[MARKER] === true,
        metrics,
      };
    };

    window.addEventListener(STATE_EVENT, handleState);
    const timer = window.setInterval(bind, 250);
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
      if (button) {
        button.onclick = null;
        button.remove();
      }
    };
  }, []);

  return null;
}
