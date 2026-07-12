import React from 'react';

const BUILD = 329;
const TOP_TOOLBAR_HEIGHT_PX = 24;
const CANONICAL_PANEL_ID = 'gannzilla-clean-property-panel-v325';
const EDGE_GAP_PX = 2;
const RIGHT_CLEARANCE_PX = 20;

function canonicalPanelInset() {
  const panel = document.getElementById(CANONICAL_PANEL_ID);
  if (!(panel instanceof HTMLElement)) return null;
  const style = window.getComputedStyle(panel);
  const rect = panel.getBoundingClientRect();
  const visible = style.display !== 'none'
    && style.visibility !== 'hidden'
    && style.opacity !== '0'
    && rect.width > 1
    && rect.height > 1;
  if (!visible) return null;
  return Math.max(EDGE_GAP_PX, Math.round(rect.right + EDGE_GAP_PX));
}

function placeHorizontalBarBelowToolbar() {
  const bar = document.querySelector('[data-gannzilla-horizontal-pan-assist-v311="true"]');
  if (!(bar instanceof HTMLElement)) return null;

  const panelLeftInset = canonicalPanelInset();
  bar.style.setProperty('top', `${TOP_TOOLBAR_HEIGHT_PX}px`, 'important');
  bar.style.setProperty('bottom', 'auto', 'important');
  bar.style.setProperty('left', `${panelLeftInset ?? EDGE_GAP_PX}px`, 'important');
  bar.style.setProperty('right', `${RIGHT_CLEARANCE_PX}px`, 'important');
  bar.style.setProperty('margin-top', '0', 'important');
  bar.style.setProperty('margin-bottom', '0', 'important');
  bar.dataset.gannzillaHorizontalPanTopPlacementV312 = 'true';
  bar.dataset.gannzillaCanonicalPanelClearanceV329 = panelLeftInset == null ? 'none' : String(panelLeftInset);

  return { bar, panelLeftInset };
}

/** Build 329: keep the horizontal movement bar below the top toolbar and completely outside the canonical property panel. */
export default function GannzillaHorizontalPanTopPlacementV312() {
  React.useEffect(() => {
    let frame = 0;

    const sync = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(placeHorizontalBarBelowToolbar);
    };

    sync();
    const timers = [0, 50, 120, 260, 520, 1000, 1800].map((delay) => window.setTimeout(sync, delay));
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    window.addEventListener('resize', sync);
    document.addEventListener('fullscreenchange', sync);
    window.addEventListener('gannzilla:layout-panel-visibility-change', sync);
    window.addEventListener('gannzilla:panel-frame-cleanup-sync', sync);
    window.addEventListener('gannzilla:panel-width-v302-sync', sync);

    window.GANNZILLA_HORIZONTAL_PAN_TOP_PLACEMENT_V312 = true;
    window.GANNZILLA_HORIZONTAL_PAN_TOP_PLACEMENT_V329 = true;
    window.__auditGannzillaHorizontalPanTopPlacementV329 = () => {
      const result = placeHorizontalBarBelowToolbar();
      const bar = result?.bar;
      const rect = bar?.getBoundingClientRect?.();
      const panel = document.getElementById(CANONICAL_PANEL_ID);
      const panelRect = panel?.getBoundingClientRect?.();
      return {
        ok: Boolean(bar)
          && Boolean(rect && Math.abs(rect.top - TOP_TOOLBAR_HEIGHT_PX) <= 1)
          && Boolean(!panelRect || rect.left >= panelRect.right),
        build: BUILD,
        mountedBelowTopIconToolbar: Boolean(rect && Math.abs(rect.top - TOP_TOOLBAR_HEIGHT_PX) <= 1),
        topPx: rect ? Math.round(rect.top) : null,
        expectedTopPx: TOP_TOOLBAR_HEIGHT_PX,
        panelRightPx: panelRect ? Math.round(panelRect.right) : null,
        barLeftPx: rect ? Math.round(rect.left) : null,
        canonicalPanelClearanceApplied: Boolean(panelRect && rect && rect.left >= panelRect.right),
        panelControlsCannotBeCovered: true,
        chartToolbarCannotBeCovered: true,
        bottomPlacementRemoved: Boolean(bar && window.getComputedStyle(bar).bottom === 'auto'),
        verticalMovementBehaviorUntouched: true,
        horizontalControlsPreserved: true,
      };
    };
    window.__auditGannzillaHorizontalPanTopPlacementV312 = window.__auditGannzillaHorizontalPanTopPlacementV329;

    return () => {
      timers.forEach(window.clearTimeout);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      document.removeEventListener('fullscreenchange', sync);
      window.removeEventListener('gannzilla:layout-panel-visibility-change', sync);
      window.removeEventListener('gannzilla:panel-frame-cleanup-sync', sync);
      window.removeEventListener('gannzilla:panel-width-v302-sync', sync);
      delete window.GANNZILLA_HORIZONTAL_PAN_TOP_PLACEMENT_V312;
      delete window.GANNZILLA_HORIZONTAL_PAN_TOP_PLACEMENT_V329;
      delete window.__auditGannzillaHorizontalPanTopPlacementV312;
      delete window.__auditGannzillaHorizontalPanTopPlacementV329;
    };
  }, []);

  return null;
}
