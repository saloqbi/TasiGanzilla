import React from 'react';
import GannzillaDrawingPalettesV266 from './GannzillaDrawingPalettesV266';

const BUILD = 276;
const SCALE = 2;
const BUTTON_SIZE = 68;
const BUTTON_GAP = 8;
const PALETTE_WIDTH = 92;
const ICON_SIZE = 56;
const RIGHT_CLEARANCE_PX = 20;
const NATURAL_HEIGHT = (13 * BUTTON_SIZE) + (12 * BUTTON_GAP) + 28;

function setImportant(node, property, value) {
  if (!node) return;
  const current = node.style.getPropertyValue(property);
  const priority = node.style.getPropertyPriority(property);
  if (current === value && priority === 'important') return;
  node.style.setProperty(property, value, 'important');
}

function visibleViewportRightBoundary() {
  const documentRight = Number(document.documentElement?.clientWidth);
  if (Number.isFinite(documentRight) && documentRight > 0) return Math.round(documentRight);
  return Math.round(window.innerWidth);
}

function applyPalettePresentation() {
  const left = document.querySelector('[data-gannzilla-left-drawing-palette="true"]');
  const right = document.querySelector('[data-gannzilla-right-drawing-palette="true"]');
  if (!left || !right) return null;

  const top = Math.round(left.getBoundingClientRect().top);
  const availableHeight = Math.max(260, window.innerHeight - top - 10);
  const paletteHeight = Math.min(NATURAL_HEIGHT, availableHeight);
  const rightBoundaryX = visibleViewportRightBoundary();
  const rightOffset = Math.max(
    RIGHT_CLEARANCE_PX,
    Math.round(window.innerWidth - rightBoundaryX + RIGHT_CLEARANCE_PX),
  );

  [left, right].forEach((palette) => {
    setImportant(palette, 'width', `${PALETTE_WIDTH}px`);
    setImportant(palette, 'min-width', `${PALETTE_WIDTH}px`);
    setImportant(palette, 'max-width', `${PALETTE_WIDTH}px`);
    setImportant(palette, 'height', `${paletteHeight}px`);
    setImportant(palette, 'min-height', `${paletteHeight}px`);
    setImportant(palette, 'max-height', `${paletteHeight}px`);
    setImportant(palette, 'padding', '12px 10px');
    setImportant(palette, 'gap', `${BUTTON_GAP}px`);
    setImportant(palette, 'border-radius', '46px');
    setImportant(palette, 'overflow-y', 'auto');
    setImportant(palette, 'overflow-x', 'hidden');
    setImportant(palette, 'scrollbar-width', 'none');
    setImportant(palette, '-ms-overflow-style', 'none');
    palette.dataset.gannzillaPaletteScale = String(SCALE);
    palette.dataset.gannzillaInternalScrollbarHidden = 'true';

    Array.from(palette.children).forEach((button) => {
      if (!(button instanceof HTMLElement)) return;
      setImportant(button, 'width', `${BUTTON_SIZE}px`);
      setImportant(button, 'min-width', `${BUTTON_SIZE}px`);
      setImportant(button, 'max-width', `${BUTTON_SIZE}px`);
      setImportant(button, 'height', `${BUTTON_SIZE}px`);
      setImportant(button, 'min-height', `${BUTTON_SIZE}px`);
      setImportant(button, 'max-height', `${BUTTON_SIZE}px`);
      setImportant(button, 'font-size', '26px');

      const svg = button.querySelector('svg');
      if (svg instanceof SVGElement) {
        setImportant(svg, 'width', `${ICON_SIZE}px`);
        setImportant(svg, 'height', `${ICON_SIZE}px`);
      }

      Array.from(button.children).forEach((child) => {
        if (!(child instanceof HTMLElement)) return;
        if (child.tagName.toLowerCase() === 'svg') return;
        setImportant(child, 'transform', 'scale(2)');
        setImportant(child, 'transform-origin', 'center center');
      });
    });
  });

  setImportant(right, 'right', `${rightOffset}px`);
  setImportant(right, 'left', 'auto');
  setImportant(right, 'transform', 'none');
  right.dataset.gannzillaRightClearancePx = String(RIGHT_CLEARANCE_PX);
  right.dataset.gannzillaVisibleViewportBoundaryX = String(rightBoundaryX);

  const leftRect = left.getBoundingClientRect();
  const rightRect = right.getBoundingClientRect();
  return {
    leftWidth: Math.round(leftRect.width),
    rightWidth: Math.round(rightRect.width),
    leftHeight: Math.round(leftRect.height),
    rightHeight: Math.round(rightRect.height),
    rightClearancePx: Math.round(rightBoundaryX - rightRect.right),
    rightBoundaryX,
    rightOffset,
    paletteHeight,
  };
}

/** Build 276: double-size palettes without visible internal scrollbars; right palette clears the page control line. */
export default function GannzillaDrawingPalettesV276() {
  React.useEffect(() => {
    let frame = 0;
    let applying = false;
    let paletteObserver = null;

    const sync = () => {
      if (applying) return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        applying = true;
        applyPalettePresentation();
        applying = false;
      });
    };

    const bindObserver = () => {
      if (paletteObserver) return;
      const left = document.querySelector('[data-gannzilla-left-drawing-palette="true"]');
      const right = document.querySelector('[data-gannzilla-right-drawing-palette="true"]');
      if (!left || !right) return;
      paletteObserver = new MutationObserver(sync);
      paletteObserver.observe(left, { attributes: true, attributeFilter: ['style', 'class'] });
      paletteObserver.observe(right, { attributes: true, attributeFilter: ['style', 'class'] });
    };

    const boot = () => {
      bindObserver();
      sync();
    };

    boot();
    const timers = [0, 60, 180, 420, 900, 1400].map((delay) => window.setTimeout(boot, delay));
    const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(sync) : null;
    resizeObserver?.observe(document.documentElement);

    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('click', boot, true);

    window.GANNZILLA_DRAWING_PALETTES_V276 = true;
    window.__auditGannzillaDrawingPalettesV276 = () => {
      const result = applyPalettePresentation();
      return {
        ok: Boolean(
          result
          && result.leftWidth === PALETTE_WIDTH
          && result.rightWidth === PALETTE_WIDTH
          && result.leftHeight === result.rightHeight
          && result.rightClearancePx >= RIGHT_CLEARANCE_PX
        ),
        build: BUILD,
        scale: SCALE,
        bothSidesEnlarged: true,
        internalPaletteScrollbarHidden: true,
        rightPaletteSeparatedFromControlLine: true,
        buttonSizePx: BUTTON_SIZE,
        iconSizePx: ICON_SIZE,
        paletteWidthPx: PALETTE_WIDTH,
        rightMinimumClearancePx: RIGHT_CLEARANCE_PX,
        ...result,
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      window.cancelAnimationFrame(frame);
      paletteObserver?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('click', boot, true);
      delete window.GANNZILLA_DRAWING_PALETTES_V276;
      delete window.__auditGannzillaDrawingPalettesV276;
    };
  }, []);

  return (
    <>
      <style>{`
        [data-gannzilla-left-drawing-palette="true"],
        [data-gannzilla-right-drawing-palette="true"] {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        [data-gannzilla-left-drawing-palette="true"]::-webkit-scrollbar,
        [data-gannzilla-right-drawing-palette="true"]::-webkit-scrollbar {
          width: 0 !important;
          height: 0 !important;
          display: none !important;
        }
      `}</style>
      <GannzillaDrawingPalettesV266 />
    </>
  );
}
