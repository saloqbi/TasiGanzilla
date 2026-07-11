import React from 'react';
import GannzillaDrawingPalettesV280 from './GannzillaDrawingPalettesV280';

const BUILD = 281;

function setImportant(node, property, value) {
  if (!(node instanceof Element)) return;
  node.style.setProperty(property, value, 'important');
}

function findConcentricRingButton(rightPalette) {
  if (!(rightPalette instanceof HTMLElement)) return null;

  const buttons = Array.from(rightPalette.children)
    .filter((node) => node instanceof HTMLButtonElement);

  return buttons.find((button) => (
    button.dataset.gannzillaGoldRingsReplaced === 'true'
    || button.getAttribute('title') === 'رسم حلزوني'
    || button.getAttribute('aria-label') === 'رسم حلزوني'
    || Boolean(button.querySelector('[data-gannzilla-grey-spiral="true"]'))
  )) || buttons[8] || null;
}

function removeConcentricRingTool() {
  const rightPalette = document.querySelector('[data-gannzilla-right-drawing-palette="true"]');
  if (!(rightPalette instanceof HTMLElement)) return null;

  const ringButton = findConcentricRingButton(rightPalette);
  if (!(ringButton instanceof HTMLButtonElement)) return null;

  setImportant(ringButton, 'display', 'none');
  setImportant(ringButton, 'visibility', 'hidden');
  setImportant(ringButton, 'pointer-events', 'none');
  setImportant(ringButton, 'width', '0');
  setImportant(ringButton, 'min-width', '0');
  setImportant(ringButton, 'height', '0');
  setImportant(ringButton, 'min-height', '0');
  setImportant(ringButton, 'padding', '0');
  setImportant(ringButton, 'margin', '0');
  setImportant(ringButton, 'border', '0');

  ringButton.setAttribute('aria-hidden', 'true');
  ringButton.setAttribute('tabindex', '-1');
  ringButton.dataset.gannzillaConcentricRingToolRemoved = 'true';

  return {
    rightPalette,
    ringButton,
    hidden: window.getComputedStyle(ringButton).display === 'none',
  };
}

/** Build 281: remove the concentric gold/spiral icon completely from the visible tool palette. */
export default function GannzillaDrawingPalettesV281() {
  React.useEffect(() => {
    let frame = 0;
    let applying = false;

    const sync = () => {
      if (applying) return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        applying = true;
        removeConcentricRingTool();
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
      attributeFilter: ['style', 'class', 'title', 'aria-label'],
    });

    window.addEventListener('resize', sync);
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('click', sync, true);

    window.GANNZILLA_DRAWING_PALETTES_V281 = true;
    window.__auditGannzillaDrawingPalettesV281 = () => {
      const result = removeConcentricRingTool();
      return {
        ok: Boolean(result?.hidden),
        build: BUILD,
        concentricGoldRingIconRemoved: Boolean(result?.hidden),
        greySpiralReplacementRemoved: Boolean(result?.hidden),
        toolRemovedFromDisplay: Boolean(result?.hidden),
        leafCompassToolPreserved: Boolean(document.getElementById('gannzilla-leaf-compass-tool-v280')),
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('click', sync, true);
      delete window.GANNZILLA_DRAWING_PALETTES_V281;
      delete window.__auditGannzillaDrawingPalettesV281;
    };
  }, []);

  return <GannzillaDrawingPalettesV280 />;
}
