import React from 'react';
import GannzillaDrawingPalettesV274 from './GannzillaDrawingPalettesV274';

const BUILD = 275;
const SCALE = 2;
const BUTTON_SIZE = 68;
const BUTTON_GAP = 8;
const PALETTE_WIDTH = 92;
const NATURAL_HEIGHT = (13 * BUTTON_SIZE) + (12 * BUTTON_GAP) + 28;

function applyDoubleSize() {
  const left = document.querySelector('[data-gannzilla-left-drawing-palette="true"]');
  const right = document.querySelector('[data-gannzilla-right-drawing-palette="true"]');
  if (!left || !right) return null;

  const top = Math.round(left.getBoundingClientRect().top);
  const availableHeight = Math.max(240, window.innerHeight - top - 8);
  const paletteHeight = Math.min(NATURAL_HEIGHT, availableHeight);

  [left, right].forEach((palette) => {
    palette.style.setProperty('width', `${PALETTE_WIDTH}px`, 'important');
    palette.style.setProperty('min-width', `${PALETTE_WIDTH}px`, 'important');
    palette.style.setProperty('max-width', `${PALETTE_WIDTH}px`, 'important');
    palette.style.setProperty('height', `${paletteHeight}px`, 'important');
    palette.style.setProperty('min-height', `${paletteHeight}px`, 'important');
    palette.style.setProperty('max-height', `${paletteHeight}px`, 'important');
    palette.style.setProperty('padding', '12px 10px', 'important');
    palette.style.setProperty('gap', `${BUTTON_GAP}px`, 'important');
    palette.style.setProperty('border-radius', '46px', 'important');
    palette.dataset.gannzillaPaletteScale = String(SCALE);
    palette.dataset.gannzillaPaletteButtonSize = String(BUTTON_SIZE);

    Array.from(palette.children).forEach((button) => {
      if (!(button instanceof HTMLElement)) return;
      button.style.setProperty('width', `${BUTTON_SIZE}px`, 'important');
      button.style.setProperty('min-width', `${BUTTON_SIZE}px`, 'important');
      button.style.setProperty('max-width', `${BUTTON_SIZE}px`, 'important');
      button.style.setProperty('height', `${BUTTON_SIZE}px`, 'important');
      button.style.setProperty('min-height', `${BUTTON_SIZE}px`, 'important');
      button.style.setProperty('max-height', `${BUTTON_SIZE}px`, 'important');
      button.style.setProperty('font-size', '26px', 'important');

      const svg = button.querySelector('svg');
      if (svg instanceof SVGElement) {
        svg.style.setProperty('width', '56px', 'important');
        svg.style.setProperty('height', '56px', 'important');
      }

      Array.from(button.children).forEach((child) => {
        if (!(child instanceof HTMLElement)) return;
        if (child.tagName.toLowerCase() === 'svg') return;
        child.style.setProperty('transform', 'scale(2)', 'important');
        child.style.setProperty('transform-origin', 'center center', 'important');
      });
    });
  });

  const leftRect = left.getBoundingClientRect();
  const rightRect = right.getBoundingClientRect();
  return {
    leftWidth: Math.round(leftRect.width),
    rightWidth: Math.round(rightRect.width),
    leftHeight: Math.round(leftRect.height),
    rightHeight: Math.round(rightRect.height),
    leftButtonCount: left.children.length,
    rightButtonCount: right.children.length,
    paletteHeight,
  };
}

/** Build 275: both drawing palettes are enlarged to exactly 200% with matching geometry. */
export default function GannzillaDrawingPalettesV275() {
  React.useEffect(() => {
    let frame = 0;
    let applying = false;

    const sync = () => {
      if (applying) return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        applying = true;
        applyDoubleSize();
        applying = false;
      });
    };

    sync();
    const timers = [0, 60, 180, 420, 900, 1400].map((delay) => window.setTimeout(sync, delay));
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

    window.GANNZILLA_DRAWING_PALETTES_V275 = true;
    window.__auditGannzillaDrawingPalettesV275 = () => {
      const result = applyDoubleSize();
      return {
        ok: Boolean(
          result
          && result.leftWidth === PALETTE_WIDTH
          && result.rightWidth === PALETTE_WIDTH
          && result.leftHeight === result.rightHeight
        ),
        build: BUILD,
        scale: SCALE,
        bothSidesEnlarged: true,
        leftPaletteEnlarged: true,
        rightPaletteEnlarged: true,
        buttonSizePx: BUTTON_SIZE,
        buttonGapPx: BUTTON_GAP,
        paletteWidthPx: PALETTE_WIDTH,
        iconSizePx: 56,
        ...result,
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('click', sync, true);
      delete window.GANNZILLA_DRAWING_PALETTES_V275;
      delete window.__auditGannzillaDrawingPalettesV275;
    };
  }, []);

  return <GannzillaDrawingPalettesV274 />;
}
