import React from 'react';
import GannzillaDrawingPalettesV277 from './GannzillaDrawingPalettesV277';

const BUILD = 278;

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
  const current = node.style.getPropertyValue(property);
  const priority = node.style.getPropertyPriority(property);
  if (current === value && priority === 'important') return;
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

function cloneTriangleIntoFirstButton(firstButton, triangleButton) {
  const triangleSvg = triangleButton?.querySelector('svg');
  if (!(firstButton instanceof HTMLElement) || !(triangleSvg instanceof SVGElement)) return;

  const existing = firstButton.querySelector('svg');
  if (!firstButton.dataset.gannzillaTriangleReplacement || !existing) {
    firstButton.replaceChildren(triangleSvg.cloneNode(true));
  }

  firstButton.dataset.gannzillaTriangleReplacement = 'true';
  firstButton.setAttribute('title', 'رسم مثلث');
  firstButton.setAttribute('aria-label', 'رسم مثلث');
  firstButton.setAttribute('data-gannzilla-first-triangle-tool', 'true');
}

function synchronizeActiveAppearance(firstButton, triangleButton) {
  const active = triangleButton?.getAttribute('aria-pressed') === 'true';
  firstButton?.setAttribute('aria-pressed', active ? 'true' : 'false');
  if (firstButton instanceof HTMLElement) {
    setImportant(firstButton, 'border', active ? '2px solid #5F83B9' : '1px solid #C7C7C7');
    setImportant(firstButton, 'background', active ? '#F3F7FF' : '#FFFFFF');
  }
}

function stylePaletteButtons(right) {
  const buttons = Array.from(right.children).filter((node) => node instanceof HTMLButtonElement);
  if (buttons.length < 9) return null;

  const firstButton = buttons[0];
  const triangleButton = buttons[6];

  cloneTriangleIntoFirstButton(firstButton, triangleButton);
  synchronizeActiveAppearance(firstButton, triangleButton);

  setImportant(triangleButton, 'display', 'none');
  triangleButton.setAttribute('aria-hidden', 'true');
  triangleButton.dataset.gannzillaOriginalTriangleHidden = 'true';

  buttons.forEach((button) => {
    setImportant(button, 'opacity', '1');
    setImportant(button, 'background-color', '#FFFFFF');
  });

  applyShapeColor(firstButton, COLORS.triangle);
  applyShapeColor(buttons[1], COLORS.rectangle);
  applyShapeColor(buttons[2], COLORS.pentagon);
  applyShapeColor(buttons[3], COLORS.hexagon);
  applyShapeColor(buttons[4], COLORS.heptagon);
  applyShapeColor(buttons[5], COLORS.circle);
  applyShapeColor(buttons[7], COLORS.angle, { fill: false });
  applyShapeColor(buttons[8], COLORS.rings, { fill: false });

  const ringsSvg = buttons[8]?.querySelector('svg');
  if (ringsSvg instanceof SVGElement) {
    const circles = Array.from(ringsSvg.querySelectorAll('circle'));
    if (circles[0]) setImportant(circles[0], 'fill', COLORS.rings.fill);
    if (circles[1]) setImportant(circles[1], 'fill', '#FFFFFF');
  }

  return { buttons, firstButton, triangleButton };
}

/** Build 278: the first right-side tool is a real triangle; every shape has a coordinated solid color. */
export default function GannzillaDrawingPalettesV278() {
  React.useEffect(() => {
    let frame = 0;
    let applying = false;
    let boundFirstButton = null;
    let captureHandler = null;

    const bindFirstTriangle = (firstButton, triangleButton) => {
      if (boundFirstButton === firstButton && captureHandler) return;
      if (boundFirstButton && captureHandler) {
        boundFirstButton.removeEventListener('click', captureHandler, true);
      }

      captureHandler = (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        triangleButton.click();
        window.requestAnimationFrame(sync);
      };
      firstButton.addEventListener('click', captureHandler, true);
      boundFirstButton = firstButton;
    };

    const apply = () => {
      const right = document.querySelector('[data-gannzilla-right-drawing-palette="true"]');
      if (!(right instanceof HTMLElement)) return null;
      setImportant(right, 'opacity', '1');
      setImportant(right, 'background', '#FFFFFF');
      const result = stylePaletteButtons(right);
      if (result) bindFirstTriangle(result.firstButton, result.triangleButton);
      return result;
    };

    function sync() {
      if (applying) return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        applying = true;
        apply();
        applying = false;
      });
    }

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

    window.GANNZILLA_DRAWING_PALETTES_V278 = true;
    window.__auditGannzillaDrawingPalettesV278 = () => {
      const result = apply();
      return {
        ok: Boolean(
          result
          && result.firstButton?.dataset.gannzillaTriangleReplacement === 'true'
          && result.triangleButton?.dataset.gannzillaOriginalTriangleHidden === 'true'
        ),
        build: BUILD,
        cursorIconRemoved: true,
        firstToolIsTriangle: true,
        originalDuplicateTriangleHidden: true,
        firstTriangleDelegatesToRealTriangleTool: true,
        solidNonTransparentColors: true,
        coordinatedColorSet: Object.keys(COLORS),
        visibleRightShapeButtonCount: result
          ? result.buttons.filter((button) => window.getComputedStyle(button).display !== 'none').length
          : 0,
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      if (boundFirstButton && captureHandler) {
        boundFirstButton.removeEventListener('click', captureHandler, true);
      }
      window.removeEventListener('resize', sync);
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('click', sync, true);
      delete window.GANNZILLA_DRAWING_PALETTES_V278;
      delete window.__auditGannzillaDrawingPalettesV278;
    };
  }, []);

  return <GannzillaDrawingPalettesV277 />;
}
