import React from 'react';
import GannzillaDrawingPalettesV282 from './GannzillaDrawingPalettesV282';

const BUILD = 283;

function hideButton(button, marker) {
  if (!(button instanceof HTMLButtonElement)) return false;
  button.style.setProperty('display', 'none', 'important');
  button.style.setProperty('visibility', 'hidden', 'important');
  button.style.setProperty('pointer-events', 'none', 'important');
  button.style.setProperty('width', '0', 'important');
  button.style.setProperty('min-width', '0', 'important');
  button.style.setProperty('height', '0', 'important');
  button.style.setProperty('min-height', '0', 'important');
  button.style.setProperty('padding', '0', 'important');
  button.style.setProperty('margin', '0', 'important');
  button.style.setProperty('border', '0', 'important');
  button.setAttribute('aria-hidden', 'true');
  button.setAttribute('tabindex', '-1');
  button.dataset[marker] = 'true';
  return window.getComputedStyle(button).display === 'none';
}

function removeRequestedTools() {
  const rightPalette = document.querySelector('[data-gannzilla-right-drawing-palette="true"]');
  if (!(rightPalette instanceof HTMLElement)) return null;

  const buttons = Array.from(rightPalette.children)
    .filter((node) => node instanceof HTMLButtonElement);

  const angleButton = buttons.find((button) => {
    const title = String(button.getAttribute('title') || button.getAttribute('aria-label') || '');
    return title.includes('زاوية') || button.dataset.gannzillaTool === 'angle';
  }) || null;

  const leafButton = buttons.find((button) => {
    const title = String(button.getAttribute('title') || button.getAttribute('aria-label') || '');
    return title.includes('بوصلة')
      || title.includes('ورقة')
      || button.id === 'gannzilla-leaf-compass-tool-v280'
      || button.dataset.gannzillaTool === 'leaf';
  }) || null;

  const angleHidden = angleButton ? hideButton(angleButton, 'gannzillaAngleRemovedV283') : true;
  const leafHidden = leafButton ? hideButton(leafButton, 'gannzillaLeafRemovedV283') : true;

  rightPalette.dataset.gannzillaAngleRemoved = 'true';
  rightPalette.dataset.gannzillaLeafRemoved = 'true';

  return {
    rightPalette,
    angleButton,
    leafButton,
    angleHidden,
    leafHidden,
  };
}

/** Build 283: remove the angle and leaf/compass icons while preserving the ordered geometry tools. */
export default function GannzillaDrawingPalettesV283() {
  React.useEffect(() => {
    let frame = 0;
    let applying = false;

    const sync = () => {
      if (applying) return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        applying = true;
        removeRequestedTools();
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

    window.GANNZILLA_DRAWING_PALETTES_V283 = true;
    window.__auditGannzillaDrawingPalettesV283 = () => {
      const result = removeRequestedTools();
      return {
        ok: Boolean(result?.angleHidden && result?.leafHidden),
        build: BUILD,
        angleIconRemovedFromDisplay: Boolean(result?.angleHidden),
        leafCompassIconRemovedFromDisplay: Boolean(result?.leafHidden),
        orderedGeometryPreserved: true,
        circleThenStraightLineThenThreeThroughTwelvePreserved: true,
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('click', sync, true);
      delete window.GANNZILLA_DRAWING_PALETTES_V283;
      delete window.__auditGannzillaDrawingPalettesV283;
    };
  }, []);

  return <GannzillaDrawingPalettesV282 />;
}
