import React from 'react';
import GannzillaDrawingPalettesV266 from './GannzillaDrawingPalettesV266';

const BUILD = 273;
const DEFAULT_GAP_PX = 24;

function getWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((node) => ({ node, rect: node.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0] || null;
}

function getSettingsPanelRect() {
  return Array.from(document.querySelectorAll('aside, [data-gannzilla-settings-panel="true"]'))
    .map((node) => ({ rect: node.getBoundingClientRect(), style: window.getComputedStyle(node) }))
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

function getRightControlBoundaryX() {
  const wheelCanvas = getWheelCanvas();
  let node = wheelCanvas?.node?.parentElement || null;

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

function readConfiguredGap() {
  try {
    const value = Number(new URLSearchParams(window.location.search || '').get('drawingToolsSideGap'));
    return Number.isFinite(value) ? Math.max(12, Math.min(70, value)) : DEFAULT_GAP_PX;
  } catch {
    return DEFAULT_GAP_PX;
  }
}

function synchronizeMirroredGap() {
  const leftPalette = document.querySelector('[data-gannzilla-left-drawing-palette="true"]');
  const rightPalette = document.querySelector('[data-gannzilla-right-drawing-palette="true"]');
  if (!leftPalette || !rightPalette) return null;

  const settingsPanel = getSettingsPanelRect();
  const leftRect = leftPalette.getBoundingClientRect();
  const rightBoundaryX = getRightControlBoundaryX();
  const configuredGap = readConfiguredGap();
  const measuredLeftGap = settingsPanel
    ? Math.round(leftRect.left - settingsPanel.right)
    : configuredGap;
  const sharedGap = Math.max(12, measuredLeftGap || configuredGap);
  const rightOffset = Math.max(sharedGap, Math.round(window.innerWidth - rightBoundaryX + sharedGap));

  rightPalette.style.setProperty('right', `${rightOffset}px`, 'important');
  rightPalette.style.setProperty('left', 'auto', 'important');
  rightPalette.style.setProperty('transform', 'none', 'important');
  rightPalette.dataset.gannzillaExactMirroredGapPx = String(sharedGap);
  rightPalette.dataset.gannzillaVisibleRightBoundaryX = String(rightBoundaryX);

  const rightRect = rightPalette.getBoundingClientRect();
  return {
    leftPalette,
    rightPalette,
    leftGap: settingsPanel ? Math.round(leftRect.left - settingsPanel.right) : sharedGap,
    rightGap: Math.round(rightBoundaryX - rightRect.right),
    rightBoundaryX,
    rightOffset,
    sharedGap,
  };
}

/** Build 273: use the same visible control-line gap on both drawing palettes. */
export default function GannzillaDrawingPalettesV273() {
  React.useEffect(() => {
    let frame = 0;
    const sync = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(synchronizeMirroredGap);
    };

    sync();
    const timers = [60, 180, 420, 900].map((delay) => window.setTimeout(sync, delay));
    const resizeObserver = typeof ResizeObserver === 'function'
      ? new ResizeObserver(sync)
      : null;

    const wheelCanvas = getWheelCanvas();
    const panel = document.querySelector('aside, [data-gannzilla-settings-panel="true"]');
    if (wheelCanvas?.node) resizeObserver?.observe(wheelCanvas.node);
    if (panel) resizeObserver?.observe(panel);
    resizeObserver?.observe(document.documentElement);

    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('click', sync, true);

    window.GANNZILLA_DRAWING_PALETTES_V273 = true;
    window.__auditGannzillaDrawingPalettesV273 = () => {
      const result = synchronizeMirroredGap();
      return {
        ok: Boolean(result && result.leftGap === result.rightGap),
        build: BUILD,
        exactVisibleControlLineMirror: true,
        sharedGapPx: result?.sharedGap ?? null,
        actualLeftGapPx: result?.leftGap ?? null,
        actualRightGapPx: result?.rightGap ?? null,
        rightVisibleControlBoundaryX: result?.rightBoundaryX ?? null,
        rightCssOffsetPx: result?.rightOffset ?? null,
        previousScrollbarSubtractionRemoved: true,
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('click', sync, true);
      delete window.GANNZILLA_DRAWING_PALETTES_V273;
      delete window.__auditGannzillaDrawingPalettesV273;
    };
  }, []);

  return <GannzillaDrawingPalettesV266 />;
}
