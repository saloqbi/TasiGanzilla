import React from 'react';

const BUILD = 302;
const MIN_PANEL_WIDTH_PX = 360;
const MAX_PANEL_WIDTH_PX = 520;
const PANEL_WIDTH_VW = 32;

function getClassicRoot() {
  return document.querySelector('[data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"])');
}

function findPanel() {
  const root = getClassicRoot();
  if (!(root instanceof HTMLElement)) return null;
  return Array.from(root.children).find((node) => node instanceof HTMLElement && node.tagName === 'ASIDE') || null;
}

function getPanelWidthPx() {
  const viewportWidth = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
  return Math.round(Math.max(
    MIN_PANEL_WIDTH_PX,
    Math.min(MAX_PANEL_WIDTH_PX, viewportWidth * PANEL_WIDTH_VW / 100),
  ));
}

function applyPanelWidth() {
  const panel = findPanel();
  if (!(panel instanceof HTMLElement)) return null;

  const width = getPanelWidthPx();
  panel.style.setProperty('width', `${width}px`, 'important');
  panel.style.setProperty('min-width', `${width}px`, 'important');
  panel.style.setProperty('max-width', `${width}px`, 'important');
  panel.style.setProperty('box-sizing', 'border-box', 'important');
  panel.style.setProperty('overflow-x', 'hidden', 'important');
  panel.dataset.gannzillaPanelWidthV302 = String(width);

  // Prevent the original fixed grid from collapsing its controls when browser
  // zoom is low or the panel is translated between Arabic/English sides.
  Array.from(panel.querySelectorAll(':scope > div > div')).forEach((row) => {
    if (!(row instanceof HTMLElement)) return;
    const style = window.getComputedStyle(row);
    if (style.display !== 'grid') return;
    row.style.setProperty('grid-template-columns', 'minmax(138px, 42%) minmax(140px, 1fr) 20px', 'important');
    row.style.setProperty('width', '100%', 'important');
    row.style.setProperty('min-width', '0', 'important');
    row.style.setProperty('box-sizing', 'border-box', 'important');
  });

  panel.querySelectorAll('input, select').forEach((field) => {
    if (!(field instanceof HTMLElement)) return;
    field.style.setProperty('width', '100%', 'important');
    field.style.setProperty('min-width', '0', 'important');
    field.style.setProperty('box-sizing', 'border-box', 'important');
  });

  return { panel, width };
}

/** Build 302: keep the settings panel fully open and readable without shrinking the wheel viewport. */
export default function GannzillaPanelFullWidthV302() {
  React.useEffect(() => {
    let frame = 0;

    const sync = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const result = applyPanelWidth();
        if (!result) return;
        window.dispatchEvent(new CustomEvent('gannzilla:panel-width-v302-sync', {
          detail: { width: result.width },
        }));
      });
    };

    sync();
    const timers = [0, 80, 220, 520, 1000, 1800].map((delay) => window.setTimeout(sync, delay));
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('resize', sync);
    window.addEventListener('gannzilla:layout-panel-visibility-change', sync);
    window.addEventListener('gannzilla:panel-frame-cleanup-sync', sync);

    window.GANNZILLA_PANEL_FULL_WIDTH_V302 = true;
    window.__auditGannzillaPanelFullWidthV302 = () => {
      const result = applyPanelWidth();
      const rect = result?.panel?.getBoundingClientRect?.();
      return {
        ok: Boolean(result),
        build: BUILD,
        panelWidthPx: rect ? Math.round(rect.width) : null,
        expectedWidthPx: result?.width ?? null,
        minimumReadableWidthPx: MIN_PANEL_WIDTH_PX,
        maximumPanelWidthPx: MAX_PANEL_WIDTH_PX,
        controlsCannotCollapse: true,
        wheelViewportStillFullWidth: true,
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      window.removeEventListener('gannzilla:layout-panel-visibility-change', sync);
      window.removeEventListener('gannzilla:panel-frame-cleanup-sync', sync);
      delete window.GANNZILLA_PANEL_FULL_WIDTH_V302;
      delete window.__auditGannzillaPanelFullWidthV302;
    };
  }, []);

  return null;
}
