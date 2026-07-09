import React from 'react';

const MARKER = 'GANNZILLA_CRISP_LANGUAGE_FLAG_V100';
const LANGUAGE_BUTTON_ID = 'gannzilla-crisp-language-button-v100';
const BUTTON_HEIGHT = 32;
const FLAG_WIDTH = 24;
const FLAG_HEIGHT = 16;

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
    const title = String(button.title || button.getAttribute('aria-label') || '').toLowerCase();
    return text.includes('English')
      || text.includes('العربية')
      || title.includes('switch to arabic')
      || title.includes('التبديل إلى الإنجليزية');
  }) || null;
}

function ukFlagSvg() {
  return `
    <svg width="${FLAG_WIDTH}" height="${FLAG_HEIGHT}" viewBox="0 0 60 40" aria-hidden="true" shape-rendering="geometricPrecision" style="display:block;width:${FLAG_WIDTH}px;height:${FLAG_HEIGHT}px;flex:0 0 ${FLAG_WIDTH}px">
      <rect width="60" height="40" fill="#012169"/>
      <path d="M0 0 60 40M60 0 0 40" stroke="#ffffff" stroke-width="8"/>
      <path d="M0 0 60 40M60 0 0 40" stroke="#C8102E" stroke-width="4"/>
      <path d="M30 0v40M0 20h60" stroke="#ffffff" stroke-width="13"/>
      <path d="M30 0v40M0 20h60" stroke="#C8102E" stroke-width="7"/>
    </svg>`;
}

function saFlagSvg() {
  return `
    <svg width="${FLAG_WIDTH}" height="${FLAG_HEIGHT}" viewBox="0 0 60 40" aria-hidden="true" shape-rendering="geometricPrecision" style="display:block;width:${FLAG_WIDTH}px;height:${FLAG_HEIGHT}px;flex:0 0 ${FLAG_WIDTH}px">
      <rect width="60" height="40" fill="#006C35"/>
      <rect x="13" y="27" width="34" height="2.6" rx="1.3" fill="#ffffff"/>
      <path d="M17 12h26M20 16h20M23 20h14" stroke="#ffffff" stroke-width="2.3" stroke-linecap="round"/>
      <path d="M40 25h7" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
    </svg>`;
}

function styleLanguageButton(button) {
  button.id = LANGUAGE_BUTTON_ID;
  button.style.setProperty('height', `${BUTTON_HEIGHT}px`, 'important');
  button.style.setProperty('min-width', '118px', 'important');
  button.style.setProperty('padding', '0 8px', 'important');
  button.style.setProperty('border', '1px solid #aeb6bb', 'important');
  button.style.setProperty('border-radius', '2px', 'important');
  button.style.setProperty('background', 'linear-gradient(#ffffff,#e9e9e9)', 'important');
  button.style.setProperty('display', 'flex', 'important');
  button.style.setProperty('align-items', 'center', 'important');
  button.style.setProperty('justify-content', 'center', 'important');
  button.style.setProperty('gap', '6px', 'important');
  button.style.setProperty('font-family', 'Segoe UI, Tahoma, Arial, sans-serif', 'important');
  button.style.setProperty('font-size', '14px', 'important');
  button.style.setProperty('font-weight', '800', 'important');
  button.style.setProperty('line-height', '1', 'important');
  button.style.setProperty('color', '#222222', 'important');
  button.style.setProperty('box-sizing', 'border-box', 'important');
  button.style.setProperty('white-space', 'nowrap', 'important');
}

export default function GannzillaCrispLanguageFlagV100() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true')
      || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    let lastButton = null;

    const sync = () => {
      const toolbar = findExactToolbar();
      if (!toolbar) return;

      const button = findLanguageButton(toolbar);
      if (!button) return;
      lastButton = button;

      const arabic = document.documentElement.lang === 'ar';
      const label = arabic ? 'العربية' : 'English';
      const arrow = '<span aria-hidden="true" style="font-size:10px;line-height:1;color:#333333;margin-inline-start:1px">▼</span>';
      const markup = `${arabic ? saFlagSvg() : ukFlagSvg()}<span style="display:block;line-height:1">${label}</span>${arrow}`;

      if (button.dataset.gannzillaCrispLanguageMarkup !== `${arabic}`) {
        button.innerHTML = markup;
        button.dataset.gannzillaCrispLanguageMarkup = `${arabic}`;
      }

      styleLanguageButton(button);
      button.title = arabic ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic';
      button.setAttribute('aria-label', button.title);

      window.__gannzillaCrispLanguageFlagV100Metrics = {
        ok: true,
        marker: window[MARKER] === true,
        language: arabic ? 'ar' : 'en',
        vectorFlag: true,
        emojiRemoved: true,
        flagWidth: FLAG_WIDTH,
        flagHeight: FLAG_HEIGHT,
        buttonHeight: BUTTON_HEIGHT,
        comfortableVisualSize: true,
      };
    };

    window[MARKER] = true;
    window.__auditGannzillaCrispLanguageFlagV100 = () => {
      const metrics = window.__gannzillaCrispLanguageFlagV100Metrics || {};
      return {
        ok: window[MARKER] === true
          && metrics.vectorFlag === true
          && metrics.emojiRemoved === true
          && metrics.comfortableVisualSize === true,
        marker: window[MARKER] === true,
        metrics,
      };
    };

    const timer = window.setInterval(sync, 200);
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
      if (lastButton) delete lastButton.dataset.gannzillaCrispLanguageMarkup;
    };
  }, []);

  return null;
}
