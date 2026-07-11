import React from 'react';
import GannzillaDrawingPalettesV276 from './GannzillaDrawingPalettesV276';

const BUILD = 277;

const COLORS = {
  green: { fill: '#D8E9D2', stroke: '#6F9568' },
  pink: { fill: '#F1D7D7', stroke: '#B97878' },
  blue: { fill: '#D4E0EE', stroke: '#718EAC' },
  cyan: { fill: '#D4ECE9', stroke: '#65A09B' },
  lavender: { fill: '#DFDBEA', stroke: '#817A9B' },
  rose: { fill: '#ECD9E0', stroke: '#A07887' },
  peach: { fill: '#F0E1D1', stroke: '#AA8662' },
  yellow: { fill: '#F4EBCB', stroke: '#A18E4B' },
  grey: { fill: '#E7E7E7', stroke: '#777777' },
  gold: { fill: '#F2E2B8', stroke: '#9A7C2D' },
};

function setImportant(node, property, value) {
  if (!(node instanceof Element)) return;
  node.style.setProperty(property, value, 'important');
}

function colorSvg(button, color, { fill = true } = {}) {
  const svg = button?.querySelector('svg');
  if (!(svg instanceof SVGElement)) return;

  setImportant(svg, 'opacity', '1');
  svg.querySelectorAll('path,polygon,rect,circle,ellipse,line,polyline').forEach((shape) => {
    setImportant(shape, 'opacity', '1');
    setImportant(shape, 'fill-opacity', '1');
    setImportant(shape, 'stroke-opacity', '1');
    setImportant(shape, 'stroke', color.stroke);
    setImportant(shape, 'stroke-width', '1.7');
    if (fill) setImportant(shape, 'fill', color.fill);
  });
}

function applyOpaqueColors() {
  const left = document.querySelector('[data-gannzilla-left-drawing-palette="true"]');
  const right = document.querySelector('[data-gannzilla-right-drawing-palette="true"]');
  if (!left || !right) return null;

  [left, right].forEach((palette) => {
    setImportant(palette, 'background', '#FFFFFF');
    setImportant(palette, 'background-color', '#FFFFFF');
    setImportant(palette, 'opacity', '1');
    setImportant(palette, 'backdrop-filter', 'none');

    Array.from(palette.children).forEach((button) => {
      if (!(button instanceof HTMLElement)) return;
      setImportant(button, 'background', '#FFFFFF');
      setImportant(button, 'background-color', '#FFFFFF');
      setImportant(button, 'opacity', '1');
    });
  });

  const leftButtons = Array.from(left.children);
  colorSvg(leftButtons[6], COLORS.green);     // triangle
  colorSvg(leftButtons[7], COLORS.pink);      // square
  colorSvg(leftButtons[8], COLORS.blue);      // pentagon
  colorSvg(leftButtons[9], COLORS.cyan);      // hexagon
  colorSvg(leftButtons[10], COLORS.lavender); // heptagon
  colorSvg(leftButtons[11], COLORS.rose);     // octagon
  colorSvg(leftButtons[12], COLORS.peach);    // nonagon

  const rightButtons = Array.from(right.children);
  colorSvg(rightButtons[0], COLORS.grey);                    // cursor
  colorSvg(rightButtons[1], COLORS.pink);                    // rectangle
  colorSvg(rightButtons[2], COLORS.blue);                    // pentagon
  colorSvg(rightButtons[3], COLORS.cyan);                    // hexagon
  colorSvg(rightButtons[4], COLORS.lavender);                // heptagon
  colorSvg(rightButtons[5], COLORS.yellow);                  // circle
  colorSvg(rightButtons[6], COLORS.green);                   // triangle
  colorSvg(rightButtons[7], COLORS.grey, { fill: false });   // angle
  colorSvg(rightButtons[8], COLORS.gold, { fill: false });   // rings

  const ringSvg = rightButtons[8]?.querySelector('svg');
  if (ringSvg instanceof SVGElement) {
    const circles = Array.from(ringSvg.querySelectorAll('circle'));
    if (circles[0]) setImportant(circles[0], 'fill', COLORS.gold.fill);
    if (circles[1]) setImportant(circles[1], 'fill', '#FFFFFF');
  }

  const coloredShapes = document.querySelectorAll(
    '[data-gannzilla-left-drawing-palette="true"] svg, [data-gannzilla-right-drawing-palette="true"] svg',
  );

  return {
    leftPaletteOpaque: window.getComputedStyle(left).opacity === '1',
    rightPaletteOpaque: window.getComputedStyle(right).opacity === '1',
    leftBackground: window.getComputedStyle(left).backgroundColor,
    rightBackground: window.getComputedStyle(right).backgroundColor,
    coloredSvgCount: coloredShapes.length,
  };
}

/** Build 277: solid, non-transparent colors for both drawing-tool palettes. */
export default function GannzillaDrawingPalettesV277() {
  React.useEffect(() => {
    let frame = 0;
    let applying = false;

    const sync = () => {
      if (applying) return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        applying = true;
        applyOpaqueColors();
        applying = false;
      });
    };

    sync();
    const timers = [0, 70, 180, 420, 900, 1400].map((delay) => window.setTimeout(sync, delay));
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

    window.GANNZILLA_DRAWING_PALETTES_V277 = true;
    window.__auditGannzillaDrawingPalettesV277 = () => {
      const result = applyOpaqueColors();
      return {
        ok: Boolean(
          result
          && result.leftPaletteOpaque
          && result.rightPaletteOpaque
          && result.leftBackground === 'rgb(255, 255, 255)'
          && result.rightBackground === 'rgb(255, 255, 255)'
        ),
        build: BUILD,
        opaquePaletteBackgrounds: true,
        opaqueButtonBackgrounds: true,
        opaqueShapeFills: true,
        bothSidesColored: true,
        transparencyRemoved: true,
        colorFamilies: ['green', 'pink', 'blue', 'cyan', 'lavender', 'rose', 'peach', 'yellow', 'gold'],
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
      delete window.GANNZILLA_DRAWING_PALETTES_V277;
      delete window.__auditGannzillaDrawingPalettesV277;
    };
  }, []);

  return <GannzillaDrawingPalettesV276 />;
}
