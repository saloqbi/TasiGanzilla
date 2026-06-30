import React from 'react';

const ROTATION_DEG = 5;

function getWheelLayers() {
  const largeCanvas = Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 120 && rect.height > 120)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas;

  return [
    largeCanvas,
    document.querySelector('[data-gannzilla-frame-shape-layer="true"]'),
    document.querySelector('[data-gannzilla-drawing-overlay="true"]'),
    document.querySelector('[data-gannzilla-true-spiral-overlay="true"]'),
    document.querySelector('[data-gannzilla-shape-guard-overlay="true"]'),
    document.querySelector('[data-gannzilla-polygon-tool-overlay="true"]')
  ].filter(Boolean);
}

function centerViewportOnce() {
  const candidates = Array.from(document.querySelectorAll('div'))
    .map((node) => ({ node, rect: node.getBoundingClientRect?.(), style: window.getComputedStyle(node) }))
    .filter(({ node, rect, style }) => {
      if (!rect || rect.width < 300 || rect.height < 300) return false;
      const canScroll = node.scrollWidth > node.clientWidth || node.scrollHeight > node.clientHeight;
      return canScroll && (style.overflow.includes('auto') || style.overflow.includes('scroll'));
    })
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height));

  const viewport = candidates[0]?.node;
  if (!viewport) return;

  requestAnimationFrame(() => {
    viewport.scrollLeft = Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2);
    viewport.scrollTop = Math.max(0, (viewport.scrollHeight - viewport.clientHeight) / 2);
  });
}

export default function GannzillaCardinalBalancePatch() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const applyBalance = () => {
      getWheelLayers().forEach((layer) => {
        layer.dataset.gannzillaCardinalBalanced = 'true';
        layer.style.setProperty('transform-origin', 'center center', 'important');
        layer.style.setProperty('transform', `rotate(${ROTATION_DEG}deg)`, 'important');
      });
    };

    applyBalance();
    window.setTimeout(centerViewportOnce, 120);
    window.setTimeout(centerViewportOnce, 600);
    window.setTimeout(centerViewportOnce, 1400);

    const timer = window.setInterval(applyBalance, 350);
    window.addEventListener('resize', centerViewportOnce);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('resize', centerViewportOnce);
      document.querySelectorAll('[data-gannzilla-cardinal-balanced="true"]').forEach((layer) => {
        layer.style.removeProperty('transform');
        delete layer.dataset.gannzillaCardinalBalanced;
      });
    };
  }, []);

  return null;
}
