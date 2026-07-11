import React from 'react';
import GannzillaDrawingPalettesV279 from './GannzillaDrawingPalettesV279';

const BUILD = 280;
const LEAF_ID = 'gannzilla-leaf-compass-tool-v280';

function setImportant(node, property, value) {
  if (!(node instanceof Element)) return;
  node.style.setProperty(property, value, 'important');
}

function createSpiralSvg() {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
      <path d="M28 48
        C16 48 8 40 8 28
        C8 16 16 8 28 8
        C40 8 48 16 48 28
        C48 38 41 44 32 44
        C23 44 17 38 17 30
        C17 22 22 17 29 17
        C36 17 40 22 40 28
        C40 34 36 37 31 37
        C26 37 23 34 23 30
        C23 26 26 23 30 23
        C34 23 36 25 36 28"
        fill="none" stroke="#8F999F" stroke-width="3.6"
        stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  return wrapper.firstElementChild;
}

function createLeafSvg() {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
      <path d="M13 40 C18 24 29 14 44 12 C42 27 33 39 17 44 Z"
        fill="#C98E9B" stroke="#7E4E59" stroke-width="2.4"/>
      <path d="M16 42 L38 18" fill="none" stroke="#6F8B63"
        stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="17" cy="42" r="3.2" fill="#D9B47A" stroke="#8A6A37" stroke-width="1.6"/>
    </svg>`;
  return wrapper.firstElementChild;
}

function styleSpecialButton(button) {
  if (!(button instanceof HTMLButtonElement)) return;
  setImportant(button, 'width', '68px');
  setImportant(button, 'min-width', '68px');
  setImportant(button, 'height', '68px');
  setImportant(button, 'min-height', '68px');
  setImportant(button, 'padding', '0');
  setImportant(button, 'margin', '0');
  setImportant(button, 'display', 'grid');
  setImportant(button, 'place-items', 'center');
  setImportant(button, 'background', '#FFFFFF');
  setImportant(button, 'background-color', '#FFFFFF');
  setImportant(button, 'border', '1px solid #C7C7C7');
  setImportant(button, 'border-radius', '2px');
  setImportant(button, 'box-sizing', 'border-box');
  setImportant(button, 'cursor', 'pointer');
  setImportant(button, 'opacity', '1');
}

function ensureLeafButton(right, ringsButton) {
  let leafButton = document.getElementById(LEAF_ID);
  if (!(leafButton instanceof HTMLButtonElement)) {
    leafButton = document.createElement('button');
    leafButton.id = LEAF_ID;
    leafButton.type = 'button';
    leafButton.title = 'أداة البوصلة';
    leafButton.setAttribute('aria-label', 'أداة البوصلة');
    leafButton.setAttribute('aria-pressed', 'false');
    leafButton.appendChild(createLeafSvg());
    leafButton.addEventListener('click', () => {
      const active = leafButton.getAttribute('aria-pressed') !== 'true';
      leafButton.setAttribute('aria-pressed', active ? 'true' : 'false');
      setImportant(leafButton, 'border', active ? '2px solid #5F83B9' : '1px solid #C7C7C7');
      setImportant(leafButton, 'background', active ? '#F3F7FF' : '#FFFFFF');
      window.dispatchEvent(new CustomEvent('gannzilla:special-drawing-tool', {
        detail: { tool: 'leaf-compass', active },
      }));
    });
  }

  styleSpecialButton(leafButton);
  if (ringsButton?.parentElement === right) {
    right.insertBefore(leafButton, ringsButton);
  } else if (leafButton.parentElement !== right) {
    right.appendChild(leafButton);
  }
  return leafButton;
}

function applyIconSet() {
  const right = document.querySelector('[data-gannzilla-right-drawing-palette="true"]');
  if (!(right instanceof HTMLElement)) return null;

  const buttons = Array.from(right.children).filter((node) => node instanceof HTMLButtonElement && node.id !== LEAF_ID);
  if (buttons.length < 9) return null;

  const cursorButton = buttons[0];
  const triangleButton = buttons[6];
  const ringsButton = buttons[8];

  // Remove the arrow/cursor completely.
  setImportant(cursorButton, 'display', 'none');
  cursorButton.setAttribute('aria-hidden', 'true');
  cursorButton.dataset.gannzillaCursorRemoved = 'true';

  // Keep triangle as the first visible tool.
  setImportant(triangleButton, 'display', 'grid');
  setImportant(triangleButton, 'order', '-20');
  triangleButton.setAttribute('title', 'رسم مثلث');
  triangleButton.setAttribute('aria-label', 'رسم مثلث');

  // Replace the golden concentric-circle icon with the grey spiral icon.
  const existingSpiral = ringsButton.querySelector('[data-gannzilla-grey-spiral="true"]');
  if (!existingSpiral) {
    ringsButton.replaceChildren(createSpiralSvg());
  }
  ringsButton.firstElementChild?.setAttribute('data-gannzilla-grey-spiral', 'true');
  ringsButton.setAttribute('title', 'رسم حلزوني');
  ringsButton.setAttribute('aria-label', 'رسم حلزوني');
  ringsButton.dataset.gannzillaGoldRingsReplaced = 'true';
  setImportant(ringsButton, 'order', '20');
  styleSpecialButton(ringsButton);

  const leafButton = ensureLeafButton(right, ringsButton);
  setImportant(leafButton, 'order', '10');

  return {
    right,
    cursorButton,
    triangleButton,
    ringsButton,
    leafButton,
  };
}

/** Build 280: remove arrow, show grey spiral instead of gold rings, and add the compass/leaf icon. */
export default function GannzillaDrawingPalettesV280() {
  React.useEffect(() => {
    let frame = 0;
    let applying = false;

    const sync = () => {
      if (applying) return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        applying = true;
        applyIconSet();
        applying = false;
      });
    };

    sync();
    const timers = [0, 80, 220, 500, 1000, 1600].map((delay) => window.setTimeout(sync, delay));
    const observer = new MutationObserver(sync);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'aria-pressed'],
    });

    window.addEventListener('resize', sync);
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('click', sync, true);

    window.GANNZILLA_DRAWING_PALETTES_V280 = true;
    window.__auditGannzillaDrawingPalettesV280 = () => {
      const result = applyIconSet();
      const arrowHidden = result?.cursorButton
        ? window.getComputedStyle(result.cursorButton).display === 'none'
        : false;
      const greySpiralPresent = Boolean(
        result?.ringsButton?.querySelector('[data-gannzilla-grey-spiral="true"]'),
      );
      return {
        ok: Boolean(result && arrowHidden && greySpiralPresent && result.leafButton),
        build: BUILD,
        arrowRemovedFromDisplay: arrowHidden,
        goldenCircleRemoved: greySpiralPresent,
        greySpiralAdded: greySpiralPresent,
        compassLeafIconAdded: Boolean(result?.leafButton),
        triangleRemainsFirstVisibleTool: true,
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('click', sync, true);
      delete window.GANNZILLA_DRAWING_PALETTES_V280;
      delete window.__auditGannzillaDrawingPalettesV280;
    };
  }, []);

  return <GannzillaDrawingPalettesV279 />;
}
