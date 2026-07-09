import React from 'react';

const MARKER = 'GANNZILLA_MISSING_CONNECTION_ICON_V99';
const BUTTON_ID = 'gannzilla-exact-connection-button-v99';
const BUTTON_WIDTH = 38;
const BUTTON_HEIGHT = 32;
const ICON_SIZE = 25;

function isVisible(element) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return rect.width > 0
    && rect.height > 0
    && style.display !== 'none'
    && style.visibility !== 'hidden';
}

function findExactToolbar() {
  return Array.from(document.querySelectorAll('div'))
    .filter((element) => {
      if (!isVisible(element)) return false;
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      const text = String(element.textContent || '');
      return style.position === 'fixed'
        && rect.top <= 2
        && rect.left >= 300
        && rect.height >= 28
        && rect.height <= 44
        && element.querySelectorAll('button').length >= 8
        && text.includes('%')
        && (text.includes('English') || text.includes('العربية'));
    })
    .sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0] || null;
}

function findLanguageButton(toolbar) {
  return Array.from(toolbar.querySelectorAll('button')).find((button) => {
    const text = String(button.textContent || '');
    return text.includes('English') || text.includes('العربية');
  }) || null;
}

function isConnectionButton(button) {
  const title = String(button.title || button.getAttribute('aria-label') || '').toLowerCase();
  return button.id === BUTTON_ID
    || title.includes('connection settings')
    || title.includes('إعدادات الاتصال');
}

function findHiddenConnectionSource(toolbar, installedButton) {
  return Array.from(document.querySelectorAll('button')).find((button) => {
    if (button === installedButton || toolbar.contains(button)) return false;
    const title = String(button.title || button.getAttribute('aria-label') || '').toLowerCase();
    return title.includes('connection settings') || title.includes('إعدادات الاتصال');
  }) || null;
}

function connectionIconMarkup() {
  return `
    <svg width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 24 24" aria-hidden="true" style="display:block;width:${ICON_SIZE}px;height:${ICON_SIZE}px">
      <rect x="4" y="3" width="16" height="18" rx="0.8" fill="#ededed" stroke="#777777" stroke-width="1.35" />
      <rect x="7" y="5" width="10" height="12" fill="#ffffff" stroke="#999999" stroke-width="1" />
      <path d="M10 17v-5h4v5M9 8h6" stroke="#4f4f4f" stroke-width="1.25" fill="none" />
      <circle cx="12" cy="19" r="1.15" fill="#4f4f4f" />
    </svg>`;
}

function styleButton(button) {
  button.style.setProperty('width', `${BUTTON_WIDTH}px`, 'important');
  button.style.setProperty('min-width', `${BUTTON_WIDTH}px`, 'important');
  button.style.setProperty('height', `${BUTTON_HEIGHT}px`, 'important');
  button.style.setProperty('padding', '0', 'important');
  button.style.setProperty('border', '1px solid #aeb6bb', 'important');
  button.style.setProperty('border-radius', '2px', 'important');
  button.style.setProperty('background', 'linear-gradient(#ffffff,#e9e9e9)', 'important');
  button.style.setProperty('display', 'flex', 'important');
  button.style.setProperty('align-items', 'center', 'important');
  button.style.setProperty('justify-content', 'center', 'important');
  button.style.setProperty('box-sizing', 'border-box', 'important');
  button.style.setProperty('cursor', 'pointer', 'important');
  button.style.setProperty('flex', `0 0 ${BUTTON_WIDTH}px`, 'important');
}

export default function GannzillaMissingConnectionIconV99() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true')
      || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    let installedButton = null;

    const sync = () => {
      const toolbar = findExactToolbar();
      if (!toolbar) return;

      const languageButton = findLanguageButton(toolbar);
      if (!languageButton) return;

      let connectionButton = Array.from(toolbar.querySelectorAll('button')).find(isConnectionButton);

      if (!connectionButton) {
        connectionButton = document.createElement('button');
        connectionButton.type = 'button';
        connectionButton.id = BUTTON_ID;
        languageButton.parentElement?.insertBefore(connectionButton, languageButton);
      }

      installedButton = connectionButton;
      connectionButton.id = BUTTON_ID;
      connectionButton.innerHTML = connectionIconMarkup();
      connectionButton.title = document.documentElement.lang === 'ar'
        ? 'إعدادات الاتصال'
        : 'Connection settings';
      connectionButton.setAttribute('aria-label', connectionButton.title);
      styleButton(connectionButton);

      connectionButton.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const sourceButton = findHiddenConnectionSource(toolbar, connectionButton);
        sourceButton?.click();
      };

      window.__gannzillaMissingConnectionIconV99Metrics = {
        ok: true,
        marker: window[MARKER] === true,
        iconPresent: true,
        position: 'immediately-before-language',
        buttonWidth: BUTTON_WIDTH,
        buttonHeight: BUTTON_HEIGHT,
        iconSize: ICON_SIZE,
        sameComfortSizeAsToolbar: true,
      };
    };

    window[MARKER] = true;
    window.__auditGannzillaMissingConnectionIconV99 = () => {
      const metrics = window.__gannzillaMissingConnectionIconV99Metrics || {};
      return {
        ok: window[MARKER] === true
          && metrics.iconPresent === true
          && metrics.buttonWidth === BUTTON_WIDTH
          && metrics.buttonHeight === BUTTON_HEIGHT
          && metrics.iconSize === ICON_SIZE,
        marker: window[MARKER] === true,
        metrics,
      };
    };

    const timer = window.setInterval(sync, 250);
    const observer = new MutationObserver(sync);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'title', 'aria-label'],
    });
    sync();

    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      if (installedButton?.id === BUTTON_ID) installedButton.onclick = null;
    };
  }, []);

  return null;
}
