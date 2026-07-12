import React from 'react';

const BUILD = 299;
const PANEL_WIDTH_PX = 330;
const TOOLBAR_HEIGHT_PX = 24;

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
  let bestScrollable = null;
  let topLevelOwner = null;

  while (node && node !== root) {
    if (node.parentElement === root) topLevelOwner = node;
    const style = window.getComputedStyle(node);
    if (/(auto|scroll)/.test(`${style.overflowX} ${style.overflowY}`)) bestScrollable = node;
    node = node.parentElement;
  }

  return topLevelOwner instanceof HTMLElement
    ? topLevelOwner
    : bestScrollable instanceof HTMLElement
      ? bestScrollable
      : canvas.parentElement;
}

function markScrollbarOwners(root, canvas) {
  const owners = [];
  let node = canvas?.parentElement || null;

  while (node && node !== root) {
    if (node instanceof HTMLElement) {
      const style = window.getComputedStyle(node);
      if (/(auto|scroll)/.test(`${style.overflowX} ${style.overflowY}`)) {
        node.dataset.gannzillaHiddenScrollbarOwnerV299 = 'true';
        node.style.setProperty('scrollbar-width', 'none', 'important');
        node.style.setProperty('-ms-overflow-style', 'none', 'important');
        owners.push(node);
      }
    }
    node = node.parentElement;
  }

  return owners;
}

function applyPanelFrameCleanup() {
  const root = getClassicRoot();
  const canvas = findCanvas(root);
  const viewport = findViewport(root);
  if (!(root instanceof HTMLElement) || !(canvas instanceof HTMLCanvasElement) || !(viewport instanceof HTMLElement)) return null;

  const panelVisible = readPanelVisible(root);
  const arabicMode = document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';
  const aside = Array.from(root.children).find((node) => node instanceof HTMLElement && node.tagName === 'ASIDE') || null;

  root.dataset.gannzillaPanelVisibleV299 = panelVisible ? 'true' : 'false';
  root.style.setProperty('position', 'fixed', 'important');
  root.style.setProperty('inset', '0', 'important');
  root.style.setProperty('width', '100vw', 'important');
  root.style.setProperty('max-width', '100vw', 'important');
  root.style.setProperty('overflow', 'hidden', 'important');

  viewport.style.setProperty('position', 'fixed', 'important');
  viewport.style.setProperty('top', `${TOOLBAR_HEIGHT_PX}px`, 'important');
  viewport.style.setProperty('bottom', '0', 'important');
  viewport.style.setProperty('height', 'auto', 'important');
  viewport.style.setProperty('width', 'auto', 'important');
  viewport.style.setProperty('max-width', 'none', 'important');
  viewport.style.setProperty('overflow', 'auto', 'important');
  viewport.style.setProperty('direction', 'ltr', 'important');
  viewport.style.setProperty('box-sizing', 'border-box', 'important');
  viewport.style.setProperty('z-index', '1', 'important');
  viewport.dataset.gannzillaHiddenScrollbarOwnerV299 = 'true';
  viewport.style.setProperty('scrollbar-width', 'none', 'important');
  viewport.style.setProperty('-ms-overflow-style', 'none', 'important');

  const scrollbarOwners = markScrollbarOwners(root, canvas);

  if (panelVisible) {
    if (arabicMode) {
      viewport.style.setProperty('left', '0', 'important');
      viewport.style.setProperty('right', `${PANEL_WIDTH_PX}px`, 'important');
    } else {
      viewport.style.setProperty('left', `${PANEL_WIDTH_PX}px`, 'important');
      viewport.style.setProperty('right', '0', 'important');
    }

    if (aside instanceof HTMLElement) {
      aside.style.removeProperty('display');
      aside.style.removeProperty('visibility');
      aside.style.removeProperty('pointer-events');
      aside.style.removeProperty('width');
      aside.style.removeProperty('min-width');
      aside.style.removeProperty('max-width');
      aside.style.removeProperty('overflow');
      aside.style.removeProperty('border');
      aside.style.removeProperty('padding');
      aside.style.removeProperty('margin');
    }
  } else {
    viewport.style.setProperty('left', '0', 'important');
    viewport.style.setProperty('right', '0', 'important');

    if (aside instanceof HTMLElement) {
      aside.style.setProperty('display', 'none', 'important');
      aside.style.setProperty('visibility', 'hidden', 'important');
      aside.style.setProperty('pointer-events', 'none', 'important');
      aside.style.setProperty('position', 'fixed', 'important');
      aside.style.setProperty('left', '100vw', 'important');
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

  viewport.dataset.gannzillaPanelFrameCleanupV299 = 'true';
  viewport.dataset.gannzillaPanelVisibleV299 = panelVisible ? 'true' : 'false';

  return { root, viewport, aside, panelVisible, arabicMode, scrollbarOwners };
}

/** Build 299: hidden settings panel uses the full browser width and no internal scrollbar is visible. */
export default function GannzillaPanelFrameCleanupV297() {
  React.useEffect(() => {
    let frame = 0;

    const sync = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const result = applyPanelFrameCleanup();
        if (!result) return;
        window.dispatchEvent(new CustomEvent('gannzilla:panel-frame-cleanup-sync', {
          detail: { panelVisible: result.panelVisible },
        }));
      });
    };

    sync();
    const timers = [0, 80, 220, 520, 1000, 1800].map((delay) => window.setTimeout(sync, delay));
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });

    window.addEventListener('resize', sync);
    document.addEventListener('fullscreenchange', sync);
    window.addEventListener('gannzilla:layout-panel-visibility-change', sync);

    window.GANNZILLA_PANEL_FRAME_CLEANUP_V299 = true;
    window.__auditGannzillaPanelFrameCleanupV299 = () => {
      const result = applyPanelFrameCleanup();
      const rect = result?.viewport?.getBoundingClientRect?.();
      return {
        ok: Boolean(result),
        build: BUILD,
        panelVisible: result?.panelVisible ?? null,
        hiddenPanelFrameRemoved: Boolean(result && (!result.panelVisible ? result.aside?.style?.display === 'none' || !result.aside : true)),
        wheelViewportUsesEntireBrowserWidth: Boolean(result && (!result.panelVisible ? rect && Math.abs(rect.left) <= 1 && Math.abs(window.innerWidth - rect.right) <= 1 : true)),
        internalScrollbarHidden: Boolean(result?.viewport?.dataset?.gannzillaHiddenScrollbarOwnerV299 === 'true'),
        hiddenScrollbarOwnerCount: result?.scrollbarOwners?.length ?? 0,
        browserPageWidthPx: window.innerWidth,
        viewportWidthPx: rect ? Math.round(rect.width) : null,
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      document.removeEventListener('fullscreenchange', sync);
      window.removeEventListener('gannzilla:layout-panel-visibility-change', sync);
      delete window.GANNZILLA_PANEL_FRAME_CLEANUP_V299;
      delete window.__auditGannzillaPanelFrameCleanupV299;
    };
  }, []);

  return (
    <style>{`
      [data-gannzilla-hidden-scrollbar-owner-v299="true"] {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }

      [data-gannzilla-hidden-scrollbar-owner-v299="true"]::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
        display: none !important;
      }
    `}</style>
  );
}
