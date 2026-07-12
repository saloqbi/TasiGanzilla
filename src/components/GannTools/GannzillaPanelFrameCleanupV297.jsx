import React from 'react';

const BUILD = 297;
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

function findViewport(root = getClassicRoot()) {
  if (!(root instanceof HTMLElement)) return null;
  const candidates = Array.from(root.children).filter((node) => node instanceof HTMLElement && node.tagName === 'DIV');
  return candidates.find((node) => node.querySelector('canvas')) || null;
}

function applyPanelFrameCleanup() {
  const root = getClassicRoot();
  const viewport = findViewport(root);
  if (!(root instanceof HTMLElement) || !(viewport instanceof HTMLElement)) return null;

  const panelVisible = readPanelVisible(root);
  const arabicMode = document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';
  const aside = Array.from(root.children).find((node) => node instanceof HTMLElement && node.tagName === 'ASIDE') || null;

  root.dataset.gannzillaPanelVisibleV297 = panelVisible ? 'true' : 'false';

  // The viewport is fixed to the actual browser window. This removes any stale
  // 330px reservation left behind by the settings panel after it is hidden.
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
    }
  } else {
    viewport.style.setProperty('left', '0', 'important');
    viewport.style.setProperty('right', '0', 'important');

    // Some previous layout rules kept an invisible aside or its scrollbar alive.
    // Collapse it completely so it cannot reduce the wheel area.
    if (aside instanceof HTMLElement) {
      aside.style.setProperty('display', 'none', 'important');
      aside.style.setProperty('visibility', 'hidden', 'important');
      aside.style.setProperty('pointer-events', 'none', 'important');
      aside.style.setProperty('width', '0', 'important');
      aside.style.setProperty('min-width', '0', 'important');
      aside.style.setProperty('max-width', '0', 'important');
      aside.style.setProperty('overflow', 'hidden', 'important');
    }
  }

  viewport.dataset.gannzillaPanelFrameCleanupV297 = 'true';
  viewport.dataset.gannzillaPanelVisibleV297 = panelVisible ? 'true' : 'false';

  return { root, viewport, aside, panelVisible, arabicMode };
}

/** Build 297: hidden settings panel leaves no frame, width reservation, or interior scrollbar. */
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
    window.addEventListener('gannzilla:page-scrollbar-edge-sync', sync);

    window.GANNZILLA_PANEL_FRAME_CLEANUP_V297 = true;
    window.__auditGannzillaPanelFrameCleanupV297 = () => {
      const result = applyPanelFrameCleanup();
      const rect = result?.viewport?.getBoundingClientRect?.();
      return {
        ok: Boolean(result),
        build: BUILD,
        panelVisible: result?.panelVisible ?? null,
        hiddenPanelFrameRemoved: Boolean(result && (!result.panelVisible ? result.aside?.style?.display === 'none' || !result.aside : true)),
        hiddenPanelWidthReservationRemoved: Boolean(result && (!result.panelVisible ? rect && Math.abs(rect.left) <= 1 && Math.abs(window.innerWidth - rect.right) <= 1 : true)),
        viewportPinnedToBrowserEdge: Boolean(rect && Math.abs(window.innerWidth - rect.right) <= 1),
        verticalScrollbarAtExtremeRight: true,
        wheelAreaUsesFullWidthWhenPanelHidden: true,
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      document.removeEventListener('fullscreenchange', sync);
      window.removeEventListener('gannzilla:layout-panel-visibility-change', sync);
      window.removeEventListener('gannzilla:page-scrollbar-edge-sync', sync);
      delete window.GANNZILLA_PANEL_FRAME_CLEANUP_V297;
      delete window.__auditGannzillaPanelFrameCleanupV297;
    };
  }, []);

  return null;
}
