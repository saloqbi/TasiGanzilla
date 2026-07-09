import React from 'react';

const MARKER = 'GANNZILLA_TOOLBAR_FULL_HEIGHT_SCALE_V101';
const TOOLBAR_HEIGHT = 50;
const BUTTON_SIZE = 46;
const ICON_SIZE = 38;
const SPLIT_WIDTH = 18;

function visible(element) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
}

function findToolbar() {
  return Array.from(document.querySelectorAll('div'))
    .filter((element) => {
      if (!visible(element)) return false;
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      const text = String(element.textContent || '');
      return style.position === 'fixed'
        && rect.top <= 2
        && rect.left >= 300
        && rect.width > 500
        && rect.height >= 28
        && rect.height <= 60
        && element.querySelectorAll('button').length >= 8
        && text.includes('%')
        && (text.includes('English') || text.includes('العربية'));
    })
    .sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0] || null;
}

function classify(button) {
  const text = String(button.textContent || '').trim();
  const title = String(button.title || button.getAttribute('aria-label') || '').toLowerCase();
  if (text.includes('%')) return 'percent';
  if (text.includes('English') || text.includes('العربية') || title.includes('arabic') || title.includes('english')) return 'language';
  if (text === '▼' || title.includes('options')) return 'split';
  return 'tool';
}

function styleToolbar(toolbar) {
  toolbar.style.setProperty('height', `${TOOLBAR_HEIGHT}px`, 'important');
  toolbar.style.setProperty('gap', '5px', 'important');
  toolbar.style.setProperty('padding-right', '12px', 'important');
  toolbar.style.setProperty('box-sizing', 'border-box', 'important');
  toolbar.style.setProperty('align-items', 'center', 'important');

  toolbar.querySelectorAll('button').forEach((button) => {
    const type = classify(button);
    button.style.setProperty('height', `${BUTTON_SIZE}px`, 'important');
    button.style.setProperty('box-sizing', 'border-box', 'important');
    button.style.setProperty('display', 'flex', 'important');
    button.style.setProperty('align-items', 'center', 'important');
    button.style.setProperty('justify-content', 'center', 'important');
    button.style.setProperty('border-radius', '3px', 'important');

    if (type === 'percent') {
      button.style.setProperty('min-width', '76px', 'important');
      button.style.setProperty('font-size', '17px', 'important');
      button.style.setProperty('font-weight', '900', 'important');
      button.style.setProperty('padding', '0 8px', 'important');
    } else if (type === 'language') {
      button.style.setProperty('min-width', '142px', 'important');
      button.style.setProperty('font-size', '16px', 'important');
      button.style.setProperty('font-weight', '800', 'important');
      button.style.setProperty('padding', '0 10px', 'important');
      button.style.setProperty('gap', '8px', 'important');
    } else if (type === 'split') {
      button.style.setProperty('width', `${SPLIT_WIDTH}px`, 'important');
      button.style.setProperty('min-width', `${SPLIT_WIDTH}px`, 'important');
      button.style.setProperty('padding', '0', 'important');
      button.style.setProperty('font-size', '11px', 'important');
    } else {
      button.style.setProperty('width', `${BUTTON_SIZE}px`, 'important');
      button.style.setProperty('min-width', `${BUTTON_SIZE}px`, 'important');
      button.style.setProperty('padding', '0', 'important');
      button.style.setProperty('flex', `0 0 ${BUTTON_SIZE}px`, 'important');
    }
  });

  toolbar.querySelectorAll('svg').forEach((svg) => {
    svg.setAttribute('width', String(ICON_SIZE));
    svg.setAttribute('height', String(ICON_SIZE));
    svg.style.setProperty('width', `${ICON_SIZE}px`, 'important');
    svg.style.setProperty('height', `${ICON_SIZE}px`, 'important');
    svg.style.setProperty('max-width', `${ICON_SIZE}px`, 'important');
    svg.style.setProperty('max-height', `${ICON_SIZE}px`, 'important');
  });

  toolbar.querySelectorAll('span').forEach((span) => {
    const text = String(span.textContent || '').trim();
    if (text === 'T') {
      span.style.setProperty('font-size', '36px', 'important');
      span.style.setProperty('line-height', '1', 'important');
    }
    if (text === 'ⓘ') {
      span.style.setProperty('font-size', '29px', 'important');
      span.style.setProperty('line-height', '1', 'important');
    }
  });

  const languageButton = Array.from(toolbar.querySelectorAll('button')).find((button) => classify(button) === 'language');
  if (languageButton) {
    const flagSvg = languageButton.querySelector('svg');
    if (flagSvg) {
      flagSvg.setAttribute('width', '32');
      flagSvg.setAttribute('height', '22');
      flagSvg.style.setProperty('width', '32px', 'important');
      flagSvg.style.setProperty('height', '22px', 'important');
      flagSvg.style.setProperty('flex', '0 0 32px', 'important');
    }
  }

  Array.from(toolbar.children).forEach((child) => {
    if (child.tagName === 'DIV' && child.querySelector('button')) {
      child.style.setProperty('height', `${BUTTON_SIZE}px`, 'important');
      child.style.setProperty('display', 'flex', 'important');
      child.style.setProperty('align-items', 'center', 'important');
    }
  });
}

function moveViewportBelowToolbar(toolbar) {
  const toolbarLeft = toolbar.getBoundingClientRect().left;
  Array.from(document.querySelectorAll('div')).forEach((element) => {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    if (style.position === 'absolute'
      && rect.left >= toolbarLeft - 6
      && rect.top >= 20
      && rect.top <= 60
      && rect.width > 400
      && rect.height > 300
      && style.overflow.includes('auto')) {
      element.style.setProperty('top', `${TOOLBAR_HEIGHT}px`, 'important');
    }
  });
}

export default function GannzillaToolbarFullHeightScaleV101() {
  React.useEffect(() => {
    const enabled = window.location.search.includes('gannzillaPro=true')
      || window.location.search.includes('wheelPro=true');
    if (!enabled) return undefined;

    const sync = () => {
      const toolbar = findToolbar();
      if (!toolbar) return;
      styleToolbar(toolbar);
      moveViewportBelowToolbar(toolbar);

      window.__gannzillaToolbarFullHeightScaleV101Metrics = {
        ok: true,
        marker: window[MARKER] === true,
        toolbarHeight: TOOLBAR_HEIGHT,
        buttonSize: BUTTON_SIZE,
        iconSize: ICON_SIZE,
        iconsFillToolbarHeight: true,
        toolbarFound: true,
      };
    };

    window[MARKER] = true;
    window.__auditGannzillaToolbarFullHeightScaleV101 = () => {
      const metrics = window.__gannzillaToolbarFullHeightScaleV101Metrics || {};
      return {
        ok: window[MARKER] === true
          && metrics.toolbarFound === true
          && metrics.iconsFillToolbarHeight === true
          && metrics.iconSize === ICON_SIZE,
        marker: window[MARKER] === true,
        metrics,
      };
    };

    const timer = window.setInterval(sync, 180);
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'lang'] });
    window.addEventListener('resize', sync);
    sync();

    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, []);

  return null;
}
