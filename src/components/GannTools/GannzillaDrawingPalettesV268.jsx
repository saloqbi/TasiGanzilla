import React from 'react';
import GannzillaDrawingPalettesV266 from './GannzillaDrawingPalettesV266';

const BUILD = 268;
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

function getWheelRect() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((node) => ({ node, rect: node.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.rect || null;
}

function applyPaletteSpacing() {
  const leftPalette = document.querySelector('[data-gannzilla-left-drawing-palette="true"]');
  const rightPalette = document.querySelector('[data-gannzilla-right-drawing-palette="true"]');
  const panel = getVisibleSettingsPanelRect();
  const wheel = getWheelRect();
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
  }

  if (rightPalette) {
    rightPalette.style.setProperty('right', `${SIDE_GAP_PX}px`, 'important');
    rightPalette.style.setProperty('left', 'auto', 'important');
    rightPalette.style.setProperty('top', `${top}px`, 'important');
    rightPalette.style.setProperty('margin-right', '0', 'important');
    rightPalette.dataset.gannzillaGapPx = String(SIDE_GAP_PX);
  }

  return {
    leftPalette,
    rightPalette,
    panelRight: panel ? Math.round(panel.right) : null,
    top,
  };
}

/** Build 268: keep both drawing palettes visually separated from their adjacent boundaries. */
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

    window.GANNZILLA_DRAWING_PALETTES_V268 = true;
    window.__auditGannzillaDrawingPalettesV268 = () => {
      const result = applyPaletteSpacing();
      const leftRect = result.leftPalette?.getBoundingClientRect?.() || null;
      const rightRect = result.rightPalette?.getBoundingClientRect?.() || null;
      return {
        ok: Boolean(result.leftPalette && result.rightPalette),
        build: BUILD,
        sideGapPx: SIDE_GAP_PX,
        leftPaletteMounted: Boolean(result.leftPalette),
        rightPaletteMounted: Boolean(result.rightPalette),
        settingsPanelRightPx: result.panelRight,
        leftPaletteLeftPx: leftRect ? Math.round(leftRect.left) : null,
        rightPaletteRightGapPx: rightRect ? Math.round(window.innerWidth - rightRect.right) : null,
        placement: 'LEFT_AFTER_SETTINGS_PANEL_WITH_GAP_AND_RIGHT_INSIDE_VIEWPORT_WITH_GAP',
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearInterval(interval);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
      document.removeEventListener('fullscreenchange', sync);
      delete window.GANNZILLA_DRAWING_PALETTES_V268;
      delete window.__auditGannzillaDrawingPalettesV268;
    };
  }, []);

  return <GannzillaDrawingPalettesV266 />;
}
