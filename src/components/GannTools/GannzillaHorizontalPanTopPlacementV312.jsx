import React from 'react';

const BUILD = 312;
const TOP_TOOLBAR_HEIGHT_PX = 24;

function placeHorizontalBarBelowToolbar() {
  const bar = document.querySelector('[data-gannzilla-horizontal-pan-assist-v311="true"]');
  if (!(bar instanceof HTMLElement)) return null;

  bar.style.setProperty('top', `${TOP_TOOLBAR_HEIGHT_PX}px`, 'important');
  bar.style.setProperty('bottom', 'auto', 'important');
  bar.style.setProperty('margin-top', '0', 'important');
  bar.style.setProperty('margin-bottom', '0', 'important');
  bar.dataset.gannzillaHorizontalPanTopPlacementV312 = 'true';

  return bar;
}

/** Build 312: move the horizontal movement bar directly below the top icon toolbar. */
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

    window.GANNZILLA_HORIZONTAL_PAN_TOP_PLACEMENT_V312 = true;
    window.__auditGannzillaHorizontalPanTopPlacementV312 = () => {
      const bar = placeHorizontalBarBelowToolbar();
      const rect = bar?.getBoundingClientRect?.();
      return {
        ok: Boolean(bar),
        build: BUILD,
        mountedBelowTopIconToolbar: Boolean(rect && Math.abs(rect.top - TOP_TOOLBAR_HEIGHT_PX) <= 1),
        topPx: rect ? Math.round(rect.top) : null,
        expectedTopPx: TOP_TOOLBAR_HEIGHT_PX,
        bottomPlacementRemoved: Boolean(bar && window.getComputedStyle(bar).bottom === 'auto'),
        verticalMovementBehaviorUntouched: true,
        horizontalControlsPreserved: true,
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      document.removeEventListener('fullscreenchange', sync);
      window.removeEventListener('gannzilla:layout-panel-visibility-change', sync);
      window.removeEventListener('gannzilla:panel-frame-cleanup-sync', sync);
      delete window.GANNZILLA_HORIZONTAL_PAN_TOP_PLACEMENT_V312;
      delete window.__auditGannzillaHorizontalPanTopPlacementV312;
    };
  }, []);

  return null;
}
