import React from 'react';
import GannzillaDrawingPalettesV266 from './GannzillaDrawingPalettesV266';

const BUILD = 269;
const SIDE_GAP_PX = 12;
const TOP_MIN_GAP_PX = 6;

function getVisibleSettingsPanelRect() {
  const candidates = Array.from(document.querySelectorAll([
    'aside',
    '[data-gannzilla-settings-panel="true"]',
  ].join(',')))
    .map((node) => ({
      node,
      rect: node.getBoundingClientRect(),
      style: window.getComputedStyle(node),
    }))
    .filter(({ rect, style }) => (
      rect.width >= 180
      && rect.height >= 250
      && rect.left <= 12
      && style.display !== 'none'
      && style.visibility !== 'hidden'
      && style.opacity !== '0'
    ))
    .sort((a, b) => b.rect.height - a.rect.height);

  return candidates[0]?.rect || null;
}

function getWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((node) => ({ node, rect: node.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0] || null;
}

function getWheelViewportMetrics() {
  const wheel = getWheelCanvas();
  if (!wheel?.node) {
    return {
      wheelRect: null,
      viewportRect: null,
      verticalControlLineX: window.innerWidth,
      scrollbarWidth: 0,
    };
  }

  let node = wheel.node.parentElement;
  let viewport = null;

  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    const overflowY = String(style.overflowY || style.overflow || '').toLowerCase();
    const overflowX = String(style.overflowX || style.overflow || '').toLowerCase();
    const scrollable = ['auto', 'scroll'].includes(overflowY) || ['auto', 'scroll'].includes(overflowX);

    if (scrollable) {
      viewport = node;
      break;
    }
    node = node.parentElement;
  }

  if (!viewport) {
    return {
      wheelRect: wheel.rect,
      viewportRect: null,
      verticalControlLineX: window.innerWidth,
      scrollbarWidth: 0,
    };
  }

  const viewportRect = viewport.getBoundingClientRect();
  const verticalScrollbarWidth = Math.max(0, viewport.offsetWidth - viewport.clientWidth);
  const verticalControlLineX = Math.round(viewportRect.right - verticalScrollbarWidth);

  viewport.setAttribute('data-gannzilla-wheel-scroll-viewport', 'true');
  viewport.dataset.gannzillaVerticalControlLineX = String(verticalControlLineX);

  return {
    wheelRect: wheel.rect,
    viewportRect,
    verticalControlLineX,
    scrollbarWidth: verticalScrollbarWidth,
  };
}

function applyPaletteSpacing() {
  const leftPalette = document.querySelector('[data-gannzilla-left-drawing-palette="true"]');
  const rightPalette = document.querySelector('[data-gannzilla-right-drawing-palette="true"]');
  const panel = getVisibleSettingsPanelRect();
  const viewportMetrics = getWheelViewportMetrics();
  const wheel = viewportMetrics.wheelRect;
  const toolbarHeight = Number.parseFloat(
    window.getComputedStyle(document.documentElement).getPropertyValue('--gannzilla-toolbar-height'),
  ) || 24;
  const top = Math.max(toolbarHeight + TOP_MIN_GAP_PX, Math.round((wheel?.top || toolbarHeight) + TOP_MIN_GAP_PX));

  if (leftPalette) {
    const left = panel
      ? Math.round(panel.right + SIDE_GAP_PX)
      : Math.max(SIDE_GAP_PX, Math.round((wheel?.left || 0) + SIDE_GAP_PX));
    leftPalette.style.setProperty('left', `${left}px`, 'important');
    leftPalette.style.setProperty('right', 'auto', 'important');
    leftPalette.style.setProperty('top', `${top}px`, 'important');
    leftPalette.style.setProperty('margin-left', '0', 'important');
    leftPalette.dataset.gannzillaGapPx = String(SIDE_GAP_PX);
    leftPalette.dataset.gannzillaPlacement = 'AFTER_LEFT_SETTINGS_CONTROL_LINE';
  }

  if (rightPalette) {
    const rightControlLineX = Number.isFinite(viewportMetrics.verticalControlLineX)
      ? viewportMetrics.verticalControlLineX
      : window.innerWidth;
    const rightOffset = Math.max(
      SIDE_GAP_PX,
      Math.round(window.innerWidth - rightControlLineX + SIDE_GAP_PX),
    );

    rightPalette.style.setProperty('right', `${rightOffset}px`, 'important');
    rightPalette.style.setProperty('left', 'auto', 'important');
    rightPalette.style.setProperty('top', `${top}px`, 'important');
    rightPalette.style.setProperty('margin-right', '0', 'important');
    rightPalette.dataset.gannzillaGapPx = String(SIDE_GAP_PX);
    rightPalette.dataset.gannzillaPlacement = 'BEFORE_RIGHT_VIEWPORT_CONTROL_LINE';
    rightPalette.dataset.gannzillaRightControlLineX = String(rightControlLineX);
  }

  return {
    leftPalette,
    rightPalette,
    panelRight: panel ? Math.round(panel.right) : null,
    rightControlLineX: viewportMetrics.verticalControlLineX,
    verticalScrollbarWidth: viewportMetrics.scrollbarWidth,
    top,
  };
}

/** Build 269: mirror both palettes outside their adjacent control lines with equal spacing. */
export default function GannzillaDrawingPalettesV268() {
  React.useEffect(() => {
    const sync = () => applyPaletteSpacing();
    const timers = [0, 60, 180, 420, 900].map((delay) => window.setTimeout(sync, delay));
    const interval = window.setInterval(sync, 350);
    const observer = new MutationObserver(sync);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);
    document.addEventListener('fullscreenchange', sync);

    window.GANNZILLA_DRAWING_PALETTES_V269 = true;
    window.__auditGannzillaDrawingPalettesV269 = () => {
      const result = applyPaletteSpacing();
      const leftRect = result.leftPalette?.getBoundingClientRect?.() || null;
      const rightRect = result.rightPalette?.getBoundingClientRect?.() || null;
      const leftGap = leftRect && result.panelRight !== null
        ? Math.round(leftRect.left - result.panelRight)
        : null;
      const rightGap = rightRect && Number.isFinite(result.rightControlLineX)
        ? Math.round(result.rightControlLineX - rightRect.right)
        : null;

      return {
        ok: Boolean(result.leftPalette && result.rightPalette),
        build: BUILD,
        sideGapPx: SIDE_GAP_PX,
        leftPaletteMounted: Boolean(result.leftPalette),
        rightPaletteMounted: Boolean(result.rightPalette),
        settingsPanelRightPx: result.panelRight,
        leftPaletteLeftPx: leftRect ? Math.round(leftRect.left) : null,
        leftGapAfterControlLinePx: leftGap,
        rightViewportControlLineX: result.rightControlLineX,
        rightPaletteRightPx: rightRect ? Math.round(rightRect.right) : null,
        rightGapBeforeControlLinePx: rightGap,
        verticalScrollbarWidthPx: result.verticalScrollbarWidth,
        placement: 'LEFT_AFTER_SETTINGS_LINE_AND_RIGHT_BEFORE_VIEWPORT_CONTROL_LINE',
        mirroredControlLineSpacing: true,
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearInterval(interval);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
      document.removeEventListener('fullscreenchange', sync);
      delete window.GANNZILLA_DRAWING_PALETTES_V269;
      delete window.__auditGannzillaDrawingPalettesV269;
    };
  }, []);

  return <GannzillaDrawingPalettesV266 />;
}
