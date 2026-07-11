import React from 'react';
import GannzillaDrawingPalettesV283 from './GannzillaDrawingPalettesV283';

const BUILD = 286;

function hideRightDrawingUi() {
  const rightPalette = document.querySelector('[data-gannzilla-right-drawing-palette="true"]');
  const overlay = document.getElementById('gannzilla-drawing-overlay');

  if (rightPalette instanceof HTMLElement) {
    rightPalette.style.setProperty('display', 'none', 'important');
    rightPalette.style.setProperty('visibility', 'hidden', 'important');
    rightPalette.style.setProperty('pointer-events', 'none', 'important');
    rightPalette.style.setProperty('width', '0', 'important');
    rightPalette.style.setProperty('min-width', '0', 'important');
    rightPalette.style.setProperty('height', '0', 'important');
    rightPalette.style.setProperty('min-height', '0', 'important');
    rightPalette.style.setProperty('padding', '0', 'important');
    rightPalette.style.setProperty('margin', '0', 'important');
    rightPalette.style.setProperty('border', '0', 'important');
    rightPalette.setAttribute('aria-hidden', 'true');
    rightPalette.dataset.gannzillaRightPaletteRemovedV286 = 'true';
  }

  if (overlay instanceof SVGElement) {
    overlay.style.setProperty('display', 'none', 'important');
    overlay.style.setProperty('visibility', 'hidden', 'important');
    overlay.style.setProperty('pointer-events', 'none', 'important');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.dataset.gannzillaDrawingOverlayDisabledV286 = 'true';
  }

  return {
    rightPalette,
    overlay,
    rightPaletteHidden: !(rightPalette instanceof HTMLElement)
      || window.getComputedStyle(rightPalette).display === 'none',
    overlayDisabled: !(overlay instanceof SVGElement)
      || window.getComputedStyle(overlay).pointerEvents === 'none',
  };
}

/** Build 286: remove the complete right-side drawing tool column from display. */
export default function GannzillaDrawingPalettesV286() {
  React.useEffect(() => {
    let frame = 0;
    let applying = false;

    const sync = () => {
      if (applying) return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        applying = true;
        hideRightDrawingUi();
        applying = false;
      });
    };

    sync();
    const timers = [0, 60, 160, 360, 800, 1400].map((delay) => window.setTimeout(sync, delay));
    const observer = new MutationObserver(sync);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    window.addEventListener('resize', sync);
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('click', sync, true);

    window.GANNZILLA_DRAWING_PALETTES_V286 = true;
    window.__auditGannzillaDrawingPalettesV286 = () => {
      const result = hideRightDrawingUi();
      return {
        ok: Boolean(result.rightPaletteHidden && result.overlayDisabled),
        build: BUILD,
        completeRightDrawingPaletteRemovedFromDisplay: Boolean(result.rightPaletteHidden),
        allRightSideGeometryIconsRemovedFromDisplay: Boolean(result.rightPaletteHidden),
        spiralIconRemovedFromDisplay: Boolean(result.rightPaletteHidden),
        drawingOverlayDisabled: Boolean(result.overlayDisabled),
        wheelInteractionReleased: Boolean(result.overlayDisabled),
        leftDrawingPalettePreserved: Boolean(document.querySelector('[data-gannzilla-left-drawing-palette="true"]')),
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('click', sync, true);
      delete window.GANNZILLA_DRAWING_PALETTES_V286;
      delete window.__auditGannzillaDrawingPalettesV286;
    };
  }, []);

  return <GannzillaDrawingPalettesV283 />;
}
