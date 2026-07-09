import React from 'react';

const MARKER = 'GANNZILLA_TOOLBAR_COMFORT_SCALE_V98';
const TOOLBAR_HEIGHT = 36;
const TOOL_BUTTON_WIDTH = 38;
const TOOL_BUTTON_HEIGHT = 32;
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
        && rect.height >= 20
        && rect.height <= 42
        && element.querySelectorAll(':scope > button, :scope > div > button').length >= 8
        && text.includes('%')
        && (text.includes('English') || text.includes('العربية'));
    })
    .sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0] || null;
}

function classifyButton(button) {
  const text = String(button.textContent || '').trim();
  const title = String(button.title || button.getAttribute('aria-label') || '').toLowerCase();

  if (text.includes('%')) return 'percent';
  if (text.includes('English') || text.includes('العربية') || title.includes('arabic') || title.includes('english')) return 'language';
  if (text === '▼' || title.includes('options')) return 'split';
  return 'tool';
}

function applyComfortScale(toolbar) {
  toolbar.dataset.gannzillaComfortScaleV98 = 'true';
  toolbar.style.setProperty('height', `${TOOLBAR_HEIGHT}px`, 'important');
  toolbar.style.setProperty('gap', '4px', 'important');
  toolbar.style.setProperty('padding-right', '10px', 'important');
  toolbar.style.setProperty('box-sizing', 'border-box', 'important');

  const directButtons = Array.from(toolbar.querySelectorAll('button'));
  directButtons.forEach((button) => {
    const type = classifyButton(button);
    button.style.setProperty('height', `${TOOL_BUTTON_HEIGHT}px`, 'important');
    button.style.setProperty('box-sizing', 'border-box', 'important');
    button.style.setProperty('display', 'flex', 'important');
    button.style.setProperty('align-items', 'center', 'important');
    button.style.setProperty('justify-content', 'center', 'important');

    if (type === 'percent') {
      button.style.setProperty('min-width', '66px', 'important');
      button.style.setProperty('font-size', '15px', 'important');
      button.style.setProperty('font-weight', '900', 'important');
      button.style.setProperty('padding', '0 7px', 'important');
    } else if (type === 'language') {
      button.style.setProperty('min-width', '124px', 'important');
      button.style.setProperty('font-size', '14px', 'important');
      button.style.setProperty('font-weight', '800', 'important');
      button.style.setProperty('padding', '0 9px', 'important');
    } else if (type === 'split') {
      button.style.setProperty('width', '17px', 'important');
      button.style.setProperty('min-width', '17px', 'important');
      button.style.setProperty('font-size', '10px', 'important');
      button.style.setProperty('padding', '0', 'important');
    } else {
      button.style.setProperty('width', `${TOOL_BUTTON_WIDTH}px`, 'important');
      button.style.setProperty('min-width', `${TOOL_BUTTON_WIDTH}px`, 'important');
      button.style.setProperty('padding', '0', 'important');
    }
  });

  toolbar.querySelectorAll('svg').forEach((svg) => {
    svg.setAttribute('width', String(ICON_SIZE));
    svg.setAttribute('height', String(ICON_SIZE));
    svg.style.setProperty('width', `${ICON_SIZE}px`, 'important');
    svg.style.setProperty('height', `${ICON_SIZE}px`, 'important');
  });

  toolbar.querySelectorAll('span').forEach((span) => {
    const text = String(span.textContent || '').trim();
    if (text === 'T') {
      span.style.setProperty('font-size', '28px', 'important');
      span.style.setProperty('line-height', '1', 'important');
    } else if (text === 'ⓘ') {
      span.style.setProperty('font-size', '21px', 'important');
      span.style.setProperty('line-height', '1', 'important');
    }
  });

  Array.from(toolbar.children).forEach((child) => {
    if (child.tagName === 'DIV' && child.querySelectorAll(':scope > button').length >= 1) {
      child.style.setProperty('height', `${TOOL_BUTTON_HEIGHT}px`, 'important');
      child.style.setProperty('align-items', 'center', 'important');
    }
  });
}

function adjustWheelViewport(toolbar) {
  const left = Math.round(toolbar.getBoundingClientRect().left);
  const candidates = Array.from(document.querySelectorAll('div'))
    .filter((element) => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.position === 'absolute'
        && rect.left >= left - 5
        && rect.top >= 20
        && rect.top <= 45
        && rect.width > 400
        && rect.height > 300
        && style.overflow.includes('auto');
    });

  candidates.forEach((viewport) => {
    viewport.style.setProperty('top', `${TOOLBAR_HEIGHT}px`, 'important');
  });
}

export default function GannzillaToolbarComfortScaleV98() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true')
      || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    let lastToolbar = null;

    const sync = () => {
      const toolbar = findExactToolbar();
      if (!toolbar) return;
      lastToolbar = toolbar;
      applyComfortScale(toolbar);
      adjustWheelViewport(toolbar);

      window.__gannzillaToolbarComfortScaleV98Metrics = {
        ok: true,
        marker: window[MARKER] === true,
        toolbarFound: true,
        toolbarHeight: TOOLBAR_HEIGHT,
        toolButtonWidth: TOOL_BUTTON_WIDTH,
        toolButtonHeight: TOOL_BUTTON_HEIGHT,
        iconSize: ICON_SIZE,
        buttonCount: toolbar.querySelectorAll('button').length,
      };
    };

    window[MARKER] = true;
    window.__auditGannzillaToolbarComfortScaleV98 = () => {
      const metrics = window.__gannzillaToolbarComfortScaleV98Metrics || {};
      return {
        ok: window[MARKER] === true
          && metrics.toolbarFound === true
          && metrics.toolbarHeight === TOOLBAR_HEIGHT
          && metrics.iconSize === ICON_SIZE,
        marker: window[MARKER] === true,
        metrics,
      };
    };

    const timer = window.setInterval(sync, 250);
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
    window.addEventListener('resize', sync);
    sync();

    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      if (lastToolbar) delete lastToolbar.dataset.gannzillaComfortScaleV98;
    };
  }, []);

  return null;
}
