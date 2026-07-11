import React from 'react';
import GannzillaDrawingPalettesV277 from './GannzillaDrawingPalettesV277';

const BUILD = 279;

const COLORS = {
  triangle: { fill: '#A8D59B', stroke: '#4F7F45' },
  rectangle: { fill: '#E53935', stroke: '#A91F1C' },
  pentagon: { fill: '#F39C3D', stroke: '#B9650C' },
  hexagon: { fill: '#3454D1', stroke: '#1B2D86' },
  heptagon: { fill: '#7E57C2', stroke: '#4E3287' },
  circle: { fill: '#F2D536', stroke: '#A88F00' },
  angle: { fill: 'none', stroke: '#666666' },
  rings: { fill: '#D5B34D', stroke: '#84691A' },
};

function setImportant(node, property, value) {
  if (!(node instanceof Element)) return;
  node.style.setProperty(property, value, 'important');
}

function applyShapeColor(button, color, { fill = true } = {}) {
  const svg = button?.querySelector('svg');
  if (!(svg instanceof SVGElement)) return;

  setImportant(svg, 'opacity', '1');
  svg.querySelectorAll('path,polygon,rect,circle,ellipse,line,polyline').forEach((shape) => {
    setImportant(shape, 'opacity', '1');
    setImportant(shape, 'fill-opacity', '1');
    setImportant(shape, 'stroke-opacity', '1');
    setImportant(shape, 'stroke', color.stroke);
    setImportant(shape, 'stroke-width', '1.8');
    setImportant(shape, 'fill', fill ? color.fill : 'none');
  });
}

function applyLayoutAndColors() {
  const right = document.querySelector('[data-gannzilla-right-drawing-palette="true"]');
  if (!(right instanceof HTMLElement)) return null;

  const buttons = Array.from(right.children).filter((node) => node instanceof HTMLButtonElement);
  if (buttons.length < 9) return null;

  const cursorButton = buttons[0];
  const rectangleButton = buttons[1];
  const pentagonButton = buttons[2];
  const hexagonButton = buttons[3];
  const heptagonButton = buttons[4];
  const circleButton = buttons[5];
  const triangleButton = buttons[6];
  const angleButton = buttons[7];
  const ringsButton = buttons[8];

  // Remove the cursor/arrow icon completely from the visible toolbar.
  setImportant(cursorButton, 'display', 'none');
  cursorButton.setAttribute('aria-hidden', 'true');
  cursorButton.dataset.gannzillaCursorRemoved = 'true';

  // Put the triangle in the first visible position.
  setImportant(triangleButton, 'display', 'grid');
  setImportant(triangleButton, 'order', '-10');
  triangleButton.removeAttribute('aria-hidden');
  triangleButton.setAttribute('title', 'رسم مثلث');
  triangleButton.setAttribute('aria-label', 'رسم مثلث');
  triangleButton.dataset.gannzillaFirstVisibleTool = 'triangle';

  [rectangleButton, pentagonButton, hexagonButton, heptagonButton, circleButton, angleButton, ringsButton]
    .forEach((button) => setImportant(button, 'order', '0'));

  buttons.forEach((button) => {
    setImportant(button, 'opacity', '1');
    setImportant(button, 'background', '#FFFFFF');
    setImportant(button, 'background-color', '#FFFFFF');
  });

  applyShapeColor(triangleButton, COLORS.triangle);
  applyShapeColor(rectangleButton, COLORS.rectangle);
  applyShapeColor(pentagonButton, COLORS.pentagon);
  applyShapeColor(hexagonButton, COLORS.hexagon);
  applyShapeColor(heptagonButton, COLORS.heptagon);
  applyShapeColor(circleButton, COLORS.circle);
  applyShapeColor(angleButton, COLORS.angle, { fill: false });
  applyShapeColor(ringsButton, COLORS.rings, { fill: false });

  const ringsSvg = ringsButton.querySelector('svg');
  if (ringsSvg instanceof SVGElement) {
    const circles = Array.from(ringsSvg.querySelectorAll('circle'));
    if (circles[0]) setImportant(circles[0], 'fill', COLORS.rings.fill);
    if (circles[1]) setImportant(circles[1], 'fill', '#FFFFFF');
  }

  const visibleButtons = buttons.filter((button) => window.getComputedStyle(button).display !== 'none');

  return {
    cursorButton,
    triangleButton,
    visibleButtons,
  };
}

/** Build 279: remove the arrow/cursor icon and keep triangle as the first visible drawing tool. */
export default function GannzillaDrawingPalettesV279() {
  React.useEffect(() => {
    let frame = 0;
    let applying = false;

    const sync = () => {
      if (applying) return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        applying = true;
        applyLayoutAndColors();
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
      attributeFilter: ['style', 'class', 'aria-pressed'],
    });

    window.addEventListener('resize', sync);
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('click', sync, true);

    window.GANNZILLA_DRAWING_PALETTES_V279 = true;
    window.__auditGannzillaDrawingPalettesV279 = () => {
      const result = applyLayoutAndColors();
      const cursorHidden = result?.cursorButton
        ? window.getComputedStyle(result.cursorButton).display === 'none'
        : false;
      const triangleVisible = result?.triangleButton
        ? window.getComputedStyle(result.triangleButton).display !== 'none'
        : false;

      return {
        ok: Boolean(result && cursorHidden && triangleVisible),
        build: BUILD,
        cursorArrowRemovedFromDisplay: cursorHidden,
        triangleIsFirstVisibleTool: triangleVisible,
        visibleToolCount: result?.visibleButtons?.length ?? 0,
        solidNonTransparentColors: true,
        coordinatedColorSet: Object.keys(COLORS),
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('click', sync, true);
      delete window.GANNZILLA_DRAWING_PALETTES_V279;
      delete window.__auditGannzillaDrawingPalettesV279;
    };
  }, []);

  return <GannzillaDrawingPalettesV277 />;
}
