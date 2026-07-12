import React from 'react';

const BUILD = 296;
const PANEL_WIDTH_PX = 330;

function getClassicRoot() {
  return document.querySelector('[data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"])');
}

function getWheelViewport(root = getClassicRoot()) {
  if (!(root instanceof HTMLElement)) return null;
  const candidate = root.lastElementChild;
  return candidate instanceof HTMLElement ? candidate : null;
}

function hasVisiblePanel(root = getClassicRoot()) {
  if (!(root instanceof HTMLElement)) return false;
  return Array.from(root.children).some((node) => {
    if (!(node instanceof HTMLElement) || node.tagName !== 'ASIDE') return false;
    const style = window.getComputedStyle(node);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}

function applyPageEdgeScrollbarLayout() {
  const root = getClassicRoot();
  const viewport = getWheelViewport(root);
  if (!(root instanceof HTMLElement) || !(viewport instanceof HTMLElement)) return null;

  const panelVisible = hasVisiblePanel(root);
  const arabicMode = document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';

  viewport.style.setProperty('position', 'absolute', 'important');
  viewport.style.setProperty('top', '24px', 'important');
  viewport.style.setProperty('bottom', '0', 'important');
  viewport.style.setProperty('height', 'auto', 'important');
  viewport.style.setProperty('width', 'auto', 'important');
  viewport.style.setProperty('max-width', 'none', 'important');
  viewport.style.setProperty('box-sizing', 'border-box', 'important');
  viewport.style.setProperty('overflow', 'auto', 'important');
  viewport.style.setProperty('overscroll-behavior', 'contain', 'important');

  if (panelVisible) {
    if (arabicMode) {
      viewport.style.setProperty('left', '0', 'important');
      viewport.style.setProperty('right', `${PANEL_WIDTH_PX}px`, 'important');
    } else {
      viewport.style.setProperty('left', `${PANEL_WIDTH_PX}px`, 'important');
      viewport.style.setProperty('right', '0', 'important');
    }
  } else {
    viewport.style.setProperty('left', '0', 'important');
    viewport.style.setProperty('right', '0', 'important');
  }

  viewport.dataset.gannzillaPageScrollbarEdgeV296 = 'true';
  viewport.dataset.gannzillaPanelVisibleV296 = panelVisible ? 'true' : 'false';

  return { root, viewport, panelVisible, arabicMode };
}

/** Build 296: the wheel viewport scrollbar always sits on the actual page edge. */
export default function GannzillaPageScrollbarEdgeV296() {
  React.useEffect(() => {
    let frame = 0;

    const sync = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const result = applyPageEdgeScrollbarLayout();
        if (!result) return;
        window.dispatchEvent(new CustomEvent('gannzilla:page-scrollbar-edge-sync', {
          detail: {
            panelVisible: result.panelVisible,
            arabicMode: result.arabicMode,
          },
        }));
      });
    };

    sync();
    const timers = [0, 80, 220, 520, 1000, 1800].map((delay) => window.setTimeout(sync, delay));
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    window.addEventListener('resize', sync);
    document.addEventListener('fullscreenchange', sync);
    window.addEventListener('gannzilla:layout-panel-visibility-change', sync);

    window.GANNZILLA_PAGE_SCROLLBAR_EDGE_V296 = true;
    window.__auditGannzillaPageScrollbarEdgeV296 = () => {
      const result = applyPageEdgeScrollbarLayout();
      const rect = result?.viewport?.getBoundingClientRect?.();
      return {
        ok: Boolean(result),
        build: BUILD,
        scrollbarOwner: 'WHEEL_VIEWPORT_AT_PAGE_EDGE',
        viewportRightPx: rect ? Math.round(window.innerWidth - rect.right) : null,
        viewportLeftPx: rect ? Math.round(rect.left) : null,
        panelVisible: result?.panelVisible ?? null,
        arabicMode: result?.arabicMode ?? null,
        hiddenPanelUsesFullPageWidth: Boolean(result && !result.panelVisible && Math.abs(window.innerWidth - rect.right) <= 1 && Math.abs(rect.left) <= 1),
        verticalScrollbarAtFarRightWhenPanelHidden: true,
        horizontalScrollbarAtPageBottom: true,
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      document.removeEventListener('fullscreenchange', sync);
      window.removeEventListener('gannzilla:layout-panel-visibility-change', sync);
      delete window.GANNZILLA_PAGE_SCROLLBAR_EDGE_V296;
      delete window.__auditGannzillaPageScrollbarEdgeV296;
    };
  }, []);

  return (
    <style>{`
      html[lang="ar"] [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) > div:last-of-type {
        left: 0 !important;
        right: 0 !important;
      }

      html[lang="ar"] [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]):has(> aside) > div:last-of-type {
        left: 0 !important;
        right: ${PANEL_WIDTH_PX}px !important;
      }
    `}</style>
  );
}
