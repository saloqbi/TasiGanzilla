import React from 'react';
import GannzillaDrawingPalettesV266 from './GannzillaDrawingPalettesV266';

const BUILD = 274;
const FALLBACK_GAP_PX = 24;

function visibleSettingsPanelRect() {
  return Array.from(document.querySelectorAll('aside, [data-gannzilla-settings-panel="true"]'))
    .map((node) => ({ node, rect: node.getBoundingClientRect(), style: window.getComputedStyle(node) }))
    .filter(({ rect, style }) => (
      rect.width >= 180
      && rect.height >= 250
      && rect.left <= 12
      && style.display !== 'none'
      && style.visibility !== 'hidden'
      && style.opacity !== '0'
    ))
    .sort((a, b) => b.rect.height - a.rect.height)[0]?.rect || null;
}

function wheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((node) => ({ node, rect: node.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0] || null;
}

function rightVisibleControlBoundaryX() {
  let node = wheelCanvas()?.node?.parentElement || null;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    const overflowY = String(style.overflowY || style.overflow || '').toLowerCase();
    const overflowX = String(style.overflowX || style.overflow || '').toLowerCase();
    if (['auto', 'scroll'].includes(overflowY) || ['auto', 'scroll'].includes(overflowX)) {
      const rect = node.getBoundingClientRect();
      node.setAttribute('data-gannzilla-wheel-scroll-viewport', 'true');
      node.dataset.gannzillaVisibleRightControlBoundaryX = String(Math.round(rect.right));
      return Math.round(rect.right);
    }
    node = node.parentElement;
  }
  return window.innerWidth;
}

function configuredGap() {
  try {
    const value = Number(new URLSearchParams(window.location.search || '').get('drawingToolsSideGap'));
    return Number.isFinite(value) ? Math.max(12, Math.min(70, value)) : FALLBACK_GAP_PX;
  } catch {
    return FALLBACK_GAP_PX;
  }
}

function applyExactGeometry() {
  const left = document.querySelector('[data-gannzilla-left-drawing-palette="true"]');
  const right = document.querySelector('[data-gannzilla-right-drawing-palette="true"]');
  if (!left || !right) return null;

  const panel = visibleSettingsPanelRect();
  const leftRect = left.getBoundingClientRect();
  const boundaryX = rightVisibleControlBoundaryX();
  const measuredLeftGap = panel ? Math.round(leftRect.left - panel.right) : configuredGap();
  const sharedGap = Math.max(12, measuredLeftGap || configuredGap());
  const rightOffset = Math.max(sharedGap, Math.round(window.innerWidth - boundaryX + sharedGap));

  const height = Math.round(leftRect.height);
  const top = Math.round(leftRect.top);
  const width = Math.round(leftRect.width);

  right.style.setProperty('right', `${rightOffset}px`, 'important');
  right.style.setProperty('left', 'auto', 'important');
  right.style.setProperty('top', `${top}px`, 'important');
  right.style.setProperty('width', `${width}px`, 'important');
  right.style.setProperty('min-width', `${width}px`, 'important');
  right.style.setProperty('max-width', `${width}px`, 'important');
  right.style.setProperty('height', `${height}px`, 'important');
  right.style.setProperty('min-height', `${height}px`, 'important');
  right.style.setProperty('max-height', `${height}px`, 'important');
  right.style.setProperty('transform', 'none', 'important');

  right.dataset.gannzillaGeometryAuthority = 'V274';
  right.dataset.gannzillaSharedGapPx = String(sharedGap);
  right.dataset.gannzillaVisibleBoundaryX = String(boundaryX);

  const rightRect = right.getBoundingClientRect();
  return {
    leftGap: panel ? Math.round(leftRect.left - panel.right) : sharedGap,
    rightGap: Math.round(boundaryX - rightRect.right),
    leftTop: Math.round(leftRect.top),
    rightTop: Math.round(rightRect.top),
    leftWidth: Math.round(leftRect.width),
    rightWidth: Math.round(rightRect.width),
    leftHeight: Math.round(leftRect.height),
    rightHeight: Math.round(rightRect.height),
    sharedGap,
    rightOffset,
    boundaryX,
  };
}

/** Build 274: a single post-render geometry authority keeps both palettes visually identical. */
export default function GannzillaDrawingPalettesV274() {
  React.useEffect(() => {
    let frame = 0;
    let applying = false;
    let rightObserver = null;
    let leftObserver = null;

    const sync = () => {
      if (applying) return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        applying = true;
        applyExactGeometry();
        applying = false;
      });
    };

    const bindPaletteObservers = () => {
      const left = document.querySelector('[data-gannzilla-left-drawing-palette="true"]');
      const right = document.querySelector('[data-gannzilla-right-drawing-palette="true"]');
      if (left && !leftObserver) {
        leftObserver = new MutationObserver(sync);
        leftObserver.observe(left, { attributes: true, attributeFilter: ['style', 'class'] });
      }
      if (right && !rightObserver) {
        rightObserver = new MutationObserver(sync);
        rightObserver.observe(right, { attributes: true, attributeFilter: ['style', 'class'] });
      }
    };

    const boot = () => {
      bindPaletteObservers();
      sync();
    };

    boot();
    const timers = [0, 50, 150, 350, 700, 1200].map((delay) => window.setTimeout(boot, delay));
    const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(sync) : null;
    const canvas = wheelCanvas()?.node;
    const panel = document.querySelector('aside, [data-gannzilla-settings-panel="true"]');
    if (canvas) resizeObserver?.observe(canvas);
    if (panel) resizeObserver?.observe(panel);
    resizeObserver?.observe(document.documentElement);

    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('click', boot, true);

    window.GANNZILLA_DRAWING_PALETTES_V274 = true;
    window.__auditGannzillaDrawingPalettesV274 = () => {
      const result = applyExactGeometry();
      return {
        ok: Boolean(
          result
          && result.leftGap === result.rightGap
          && result.leftTop === result.rightTop
          && result.leftWidth === result.rightWidth
          && result.leftHeight === result.rightHeight
        ),
        build: BUILD,
        singlePostRenderGeometryAuthority: true,
        rightStyleMutationGuard: true,
        leftStyleMutationGuard: true,
        exactGapMirror: Boolean(result && result.leftGap === result.rightGap),
        exactTopMirror: Boolean(result && result.leftTop === result.rightTop),
        exactWidthMirror: Boolean(result && result.leftWidth === result.rightWidth),
        exactHeightMirror: Boolean(result && result.leftHeight === result.rightHeight),
        ...result,
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      rightObserver?.disconnect();
      leftObserver?.disconnect();
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('click', boot, true);
      delete window.GANNZILLA_DRAWING_PALETTES_V274;
      delete window.__auditGannzillaDrawingPalettesV274;
    };
  }, []);

  return <GannzillaDrawingPalettesV266 />;
}
