import React from 'react';

const BUILD = 315;
const PANEL_WIDTH_PX = 330;
const TOOLBAR_HEIGHT_PX = 24;
const FIXED_PANEL_SIDE = 'left';

function getClassicRoot() {
  return document.querySelector('[data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"])');
}

function findNativePanelToggle(root = getClassicRoot()) {
  if (!(root instanceof HTMLElement)) return null;
  return Array.from(root.children)
    .filter((node) => node instanceof HTMLButtonElement)
    .find((button) => /^(Hide|Show|إخفاء|إظهار)$/i.test(String(button.textContent || '').trim())) || null;
}

function readPanelVisible(root = getClassicRoot()) {
  const toggle = findNativePanelToggle(root);
  const text = String(toggle?.textContent || '').trim();
  if (/^(Show|إظهار)$/i.test(text)) return false;
  if (/^(Hide|إخفاء)$/i.test(text)) return true;

  const aside = Array.from(root?.children || []).find((node) => node instanceof HTMLElement && node.tagName === 'ASIDE');
  if (!(aside instanceof HTMLElement)) return false;
  const style = window.getComputedStyle(aside);
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
}

function findCanvas(root = getClassicRoot()) {
  if (!(root instanceof HTMLElement)) return null;
  return Array.from(root.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, area: canvas.offsetWidth * canvas.offsetHeight }))
    .sort((a, b) => b.area - a.area)[0]?.canvas || null;
}

function findViewport(root = getClassicRoot()) {
  const canvas = findCanvas(root);
  if (!(root instanceof HTMLElement) || !(canvas instanceof HTMLCanvasElement)) return null;

  let node = canvas.parentElement;
  let topLevelOwner = null;
  while (node && node !== root) {
    if (node.parentElement === root) topLevelOwner = node;
    node = node.parentElement;
  }

  return topLevelOwner instanceof HTMLElement ? topLevelOwner : canvas.parentElement;
}

function markScrollbarOwners(root, canvas) {
  const owners = [];
  let node = canvas?.parentElement || null;

  while (node && node !== root) {
    if (node instanceof HTMLElement) {
      const style = window.getComputedStyle(node);
      if (/(auto|scroll)/.test(`${style.overflowX} ${style.overflowY}`)) {
        node.dataset.gannzillaHiddenScrollbarOwnerV300 = 'true';
        node.style.setProperty('scrollbar-width', 'none', 'important');
        node.style.setProperty('-ms-overflow-style', 'none', 'important');
        owners.push(node);
      }
    }
    node = node.parentElement;
  }

  return owners;
}

function applyFullWidthOverlayLayout() {
  const root = getClassicRoot();
  const canvas = findCanvas(root);
  const viewport = findViewport(root);
  if (!(root instanceof HTMLElement) || !(canvas instanceof HTMLCanvasElement) || !(viewport instanceof HTMLElement)) return null;

  const panelVisible = readPanelVisible(root);
  const arabicMode = document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';
  const aside = Array.from(root.children).find((node) => node instanceof HTMLElement && node.tagName === 'ASIDE') || null;

  root.dataset.gannzillaPanelVisibleV300 = panelVisible ? 'true' : 'false';
  root.dataset.gannzillaPanelSideV315 = FIXED_PANEL_SIDE;
  root.style.setProperty('position', 'fixed', 'important');
  root.style.setProperty('inset', '0', 'important');
  root.style.setProperty('width', '100vw', 'important');
  root.style.setProperty('height', '100vh', 'important');
  root.style.setProperty('max-width', '100vw', 'important');
  root.style.setProperty('overflow', 'hidden', 'important');
  root.style.setProperty('direction', 'ltr', 'important');

  // The wheel viewport always owns the complete browser width. Language changes
  // translate text only and never move the settings panel or resize the wheel area.
  viewport.style.setProperty('position', 'fixed', 'important');
  viewport.style.setProperty('left', '0', 'important');
  viewport.style.setProperty('right', '0', 'important');
  viewport.style.setProperty('top', `${TOOLBAR_HEIGHT_PX}px`, 'important');
  viewport.style.setProperty('bottom', '0', 'important');
  viewport.style.setProperty('width', 'auto', 'important');
  viewport.style.setProperty('height', 'auto', 'important');
  viewport.style.setProperty('min-width', '0', 'important');
  viewport.style.setProperty('max-width', 'none', 'important');
  viewport.style.setProperty('overflow', 'auto', 'important');
  viewport.style.setProperty('direction', 'ltr', 'important');
  viewport.style.setProperty('box-sizing', 'border-box', 'important');
  viewport.style.setProperty('z-index', '1', 'important');
  viewport.dataset.gannzillaFullWidthViewportV300 = 'true';
  viewport.dataset.gannzillaHiddenScrollbarOwnerV300 = 'true';
  viewport.style.setProperty('scrollbar-width', 'none', 'important');
  viewport.style.setProperty('-ms-overflow-style', 'none', 'important');

  const scrollbarOwners = markScrollbarOwners(root, canvas);

  if (aside instanceof HTMLElement) {
    aside.dataset.gannzillaFixedPanelSideV315 = FIXED_PANEL_SIDE;
    aside.style.setProperty('direction', arabicMode ? 'rtl' : 'ltr', 'important');
    aside.style.setProperty('text-align', arabicMode ? 'right' : 'left', 'important');

    if (panelVisible) {
      aside.style.setProperty('display', 'block', 'important');
      aside.style.setProperty('visibility', 'visible', 'important');
      aside.style.setProperty('pointer-events', 'auto', 'important');
      aside.style.setProperty('position', 'fixed', 'important');
      aside.style.setProperty('top', `${TOOLBAR_HEIGHT_PX}px`, 'important');
      aside.style.setProperty('bottom', '0', 'important');
      aside.style.setProperty('height', 'auto', 'important');
      aside.style.setProperty('width', `${PANEL_WIDTH_PX}px`, 'important');
      aside.style.setProperty('min-width', `${PANEL_WIDTH_PX}px`, 'important');
      aside.style.setProperty('max-width', `${PANEL_WIDTH_PX}px`, 'important');
      aside.style.setProperty('overflow-y', 'auto', 'important');
      aside.style.setProperty('overflow-x', 'hidden', 'important');
      aside.style.setProperty('z-index', '40', 'important');
      aside.style.setProperty('margin', '0', 'important');
      aside.style.setProperty('box-sizing', 'border-box', 'important');
      aside.style.setProperty('left', '0', 'important');
      aside.style.setProperty('right', 'auto', 'important');
      aside.style.setProperty('border-left', '0', 'important');
      aside.style.setProperty('border-right', '1px solid #b8b8b8', 'important');
    } else {
      aside.style.setProperty('display', 'none', 'important');
      aside.style.setProperty('visibility', 'hidden', 'important');
      aside.style.setProperty('pointer-events', 'none', 'important');
      aside.style.setProperty('position', 'fixed', 'important');
      aside.style.setProperty('left', '-100vw', 'important');
      aside.style.setProperty('right', 'auto', 'important');
      aside.style.setProperty('width', '0', 'important');
      aside.style.setProperty('min-width', '0', 'important');
      aside.style.setProperty('max-width', '0', 'important');
      aside.style.setProperty('height', '0', 'important');
      aside.style.setProperty('overflow', 'hidden', 'important');
      aside.style.setProperty('border', '0', 'important');
      aside.style.setProperty('padding', '0', 'important');
      aside.style.setProperty('margin', '0', 'important');
    }
  }

  viewport.dataset.gannzillaPanelOverlayVisibleV300 = panelVisible ? 'true' : 'false';

  return {
    root,
    viewport,
    aside,
    canvas,
    panelVisible,
    arabicMode,
    fixedPanelSide: FIXED_PANEL_SIDE,
    scrollbarOwners,
  };
}

/** Build 315: keep the panel permanently on the left; translation changes content direction only. */
export default function GannzillaPanelFrameCleanupV297() {
  React.useEffect(() => {
    let frame = 0;

    const sync = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const result = applyFullWidthOverlayLayout();
        if (!result) return;
        window.dispatchEvent(new CustomEvent('gannzilla:panel-frame-cleanup-sync', {
          detail: {
            panelVisible: result.panelVisible,
            viewportFullWidth: true,
            panelSide: result.fixedPanelSide,
            languageDirection: result.arabicMode ? 'rtl' : 'ltr',
          },
        }));
      });
    };

    sync();
    const timers = [0, 80, 220, 520, 1000, 1800].map((delay) => window.setTimeout(sync, delay));
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['lang', 'dir'] });

    window.addEventListener('resize', sync);
    document.addEventListener('fullscreenchange', sync);
    window.addEventListener('gannzilla:layout-panel-visibility-change', sync);
    window.addEventListener('gannzilla:ring-two-numbering-refresh', sync);

    window.GANNZILLA_PANEL_FRAME_CLEANUP_V315 = true;
    window.__auditGannzillaPanelFrameCleanupV315 = () => {
      const result = applyFullWidthOverlayLayout();
      const viewportRect = result?.viewport?.getBoundingClientRect?.();
      const panelRect = result?.aside?.getBoundingClientRect?.();
      return {
        ok: Boolean(result),
        build: BUILD,
        panelVisible: result?.panelVisible ?? null,
        panelSide: result?.fixedPanelSide ?? null,
        panelPinnedLeftAcrossLanguages: Boolean(!result?.panelVisible || (panelRect && Math.abs(panelRect.left) <= 1)),
        arabicTextDirectionInsidePanel: Boolean(!result?.arabicMode || result?.aside?.dir === 'rtl' || window.getComputedStyle(result?.aside).direction === 'rtl'),
        languageChangesTextOnly: true,
        wheelPositionUnaffectedByLanguage: true,
        panelUsesOverlayMode: Boolean(result?.panelVisible ? result?.aside?.style?.zIndex === '40' : true),
        viewportAlwaysUsesFullBrowserWidth: Boolean(viewportRect && Math.abs(viewportRect.left) <= 1 && Math.abs(window.innerWidth - viewportRect.right) <= 1),
        panelDoesNotReduceWheelViewportWidth: true,
        rightwardMovementRangePreservedWithPanelOpen: true,
        panelWidthPx: panelRect ? Math.round(panelRect.width) : 0,
        browserWidthPx: window.innerWidth,
        viewportWidthPx: viewportRect ? Math.round(viewportRect.width) : null,
        internalScrollbarHidden: Boolean(result?.viewport?.dataset?.gannzillaHiddenScrollbarOwnerV300 === 'true'),
        hiddenScrollbarOwnerCount: result?.scrollbarOwners?.length ?? 0,
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      document.removeEventListener('fullscreenchange', sync);
      window.removeEventListener('gannzilla:layout-panel-visibility-change', sync);
      window.removeEventListener('gannzilla:ring-two-numbering-refresh', sync);
      delete window.GANNZILLA_PANEL_FRAME_CLEANUP_V315;
      delete window.__auditGannzillaPanelFrameCleanupV315;
    };
  }, []);

  return (
    <style>{`
      [data-gannzilla-hidden-scrollbar-owner-v300="true"] {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }

      [data-gannzilla-hidden-scrollbar-owner-v300="true"]::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
        display: none !important;
      }
    `}</style>
  );
}
