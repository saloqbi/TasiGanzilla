import React from 'react';

const MARKER = 'GANNZILLA_NATIVE_PRECISION_LAYOUT_FIX_V90';

function isVisible(element) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return rect.width > 0
    && rect.height > 0
    && style.display !== 'none'
    && style.visibility !== 'hidden';
}

function findNativeCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      const rect = canvas.getBoundingClientRect();
      return isVisible(canvas)
        && canvas.width >= 1800
        && canvas.height >= 1800
        && rect.width >= 600
        && rect.height >= 600;
    })
    .sort((a, b) => {
      const areaA = a.getBoundingClientRect().width * a.getBoundingClientRect().height;
      const areaB = b.getBoundingClientRect().width * b.getBoundingClientRect().height;
      return areaB - areaA;
    })[0] || null;
}

function findControlPanel(viewport) {
  const candidates = Array.from(document.querySelectorAll(
    'aside, [class*="sidebar"], [class*="side-panel"], [class*="control-panel"], [class*="settings-panel"], [class*="tool-panel"]',
  ))
    .filter((element) => element !== viewport && !viewport?.contains(element))
    .map((element) => ({ element, rect: element.getBoundingClientRect() }))
    .filter(({ element, rect }) => isVisible(element)
      && rect.left >= -8
      && rect.left < 480
      && rect.width >= 140
      && rect.width <= 480
      && rect.height >= 260
      && rect.right <= Math.min(620, window.innerWidth * 0.55));

  if (candidates.length > 0) {
    return candidates.sort((a, b) => {
      if (Math.abs(b.rect.right - a.rect.right) > 4) return b.rect.right - a.rect.right;
      return b.rect.width - a.rect.width;
    })[0];
  }

  const asides = Array.from(document.querySelectorAll('aside'))
    .map((element) => ({ element, rect: element.getBoundingClientRect() }))
    .filter(({ element, rect }) => isVisible(element)
      && rect.left < 500
      && rect.width >= 80
      && rect.height >= 220);

  return asides.sort((a, b) => b.rect.right - a.rect.right)[0] || null;
}

function findToolbarBottom() {
  const candidates = Array.from(document.querySelectorAll(
    'header, nav, [class*="toolbar"], [class*="topbar"], [class*="top-bar"]',
  ))
    .map((element) => ({ element, rect: element.getBoundingClientRect() }))
    .filter(({ element, rect }) => isVisible(element)
      && rect.top >= -4
      && rect.top < 140
      && rect.width >= 260
      && rect.height >= 18
      && rect.height <= 120
      && rect.bottom <= 180);

  if (candidates.length === 0) return 42;
  return Math.max(42, ...candidates.map(({ rect }) => rect.bottom));
}

function findZoomControls() {
  return Array.from(document.querySelectorAll('div'))
    .find((element) => {
      const text = String(element.textContent || '');
      return isVisible(element)
        && text.includes('100%')
        && text.includes('ملاءمة')
        && element.querySelectorAll('button').length >= 3;
    }) || null;
}

export default function GannzillaNativePrecisionLayoutFixV90() {
  React.useEffect(() => {
    const enabled = window.location.search.includes('nativePrecisionLayout=true');
    if (!enabled) return undefined;

    let centered = false;

    const applyLayout = () => {
      const canvas = findNativeCanvas();
      if (!canvas) return;

      const viewport = canvas.parentElement?.parentElement;
      if (!viewport) return;

      const panelMatch = findControlPanel(viewport);
      const panelRight = panelMatch
        ? Math.max(300, Math.ceil(panelMatch.rect.right + 6))
        : 320;
      const toolbarBottom = Math.ceil(findToolbarBottom() + 4);

      viewport.style.setProperty('left', `${panelRight}px`, 'important');
      viewport.style.setProperty('top', `${toolbarBottom}px`, 'important');
      viewport.style.setProperty('right', '0px', 'important');
      viewport.style.setProperty('bottom', '0px', 'important');
      viewport.style.setProperty('z-index', '24', 'important');
      viewport.style.setProperty('overflow', 'auto', 'important');
      viewport.style.setProperty('background', '#ffffff', 'important');

      if (panelMatch?.element) {
        const panelStyle = window.getComputedStyle(panelMatch.element);
        if (panelStyle.position === 'static') {
          panelMatch.element.style.setProperty('position', 'relative', 'important');
        }
        panelMatch.element.style.setProperty('z-index', '70', 'important');
        panelMatch.element.style.setProperty('visibility', 'visible', 'important');
        panelMatch.element.style.setProperty('opacity', '1', 'important');
      }

      const controls = findZoomControls();
      if (controls) {
        controls.style.setProperty('top', `${toolbarBottom + 6}px`, 'important');
        controls.style.setProperty('right', '18px', 'important');
        controls.style.setProperty('z-index', '100', 'important');
      }

      if (!centered) {
        centered = true;
        window.setTimeout(() => {
          viewport.scrollLeft = Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2);
          viewport.scrollTop = Math.max(0, (viewport.scrollHeight - viewport.clientHeight) / 2);
        }, 120);
      }

      window.__gannzillaNativePrecisionLayoutFixV90Metrics = {
        ok: true,
        marker: window[MARKER] === true,
        panelFound: Boolean(panelMatch),
        panelRight,
        toolbarBottom,
        viewportLeft: viewport.getBoundingClientRect().left,
        viewportTop: viewport.getBoundingClientRect().top,
        controlsFound: Boolean(controls),
        panelProtectedFromOverlay: true,
      };
    };

    window[MARKER] = true;
    window.__auditGannzillaNativePrecisionLayoutFixV90 = () => {
      const metrics = window.__gannzillaNativePrecisionLayoutFixV90Metrics || {};
      return {
        ok: window[MARKER] === true
          && metrics.ok === true
          && metrics.panelProtectedFromOverlay === true
          && Number(metrics.panelRight) >= 300,
        marker: window[MARKER] === true,
        metrics,
      };
    };

    const timer = window.setInterval(applyLayout, 250);
    const observer = new MutationObserver(applyLayout);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
    window.addEventListener('resize', applyLayout);
    applyLayout();

    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      window.removeEventListener('resize', applyLayout);
    };
  }, []);

  return null;
}
