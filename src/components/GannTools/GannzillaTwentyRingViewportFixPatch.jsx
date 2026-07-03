import React from 'react';

const PATCH_MARKER = 'GANNZILLA_TWENTY_RING_VIEWPORT_FIX_V35';
const PANEL_ID = 'gannzilla-twenty-ring-no-overlap-panel-v1';
const CANVAS_ID = 'gannzilla-twenty-ring-no-overlap-canvas-v1';
const BADGE_ID = 'gannzilla-twenty-ring-viewport-status-v35';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getSidebarRight() {
  const candidates = Array.from(document.querySelectorAll('aside, [class*="sidebar"], [class*="panel"], [class*="control"]'));
  const visible = candidates
    .map((el) => el.getBoundingClientRect())
    .filter((rect) => rect.width > 120 && rect.height > 240 && rect.left < 420)
    .sort((a, b) => b.right - a.right)[0];
  return visible ? visible.right : 330;
}

function getTopOffset() {
  const headerCandidates = Array.from(document.querySelectorAll('header, nav, [class*="toolbar"], [class*="topbar"]'));
  const visible = headerCandidates
    .map((el) => el.getBoundingClientRect())
    .filter((rect) => rect.width > 300 && rect.height > 22 && rect.top < 120)
    .sort((a, b) => b.bottom - a.bottom)[0];
  return visible ? clamp(visible.bottom + 8, 68, 118) : 78;
}

function ensureStatusBadge(panel, canvas) {
  let badge = document.getElementById(BADGE_ID);
  if (!badge) {
    badge = document.createElement('div');
    badge.id = BADGE_ID;
    badge.dir = 'rtl';
    badge.style.position = 'fixed';
    badge.style.zIndex = '12000';
    badge.style.pointerEvents = 'none';
    badge.style.background = 'rgba(255,255,255,0.94)';
    badge.style.border = '1px solid rgba(160,160,160,0.55)';
    badge.style.borderRadius = '8px';
    badge.style.boxShadow = '0 2px 8px rgba(0,0,0,0.14)';
    badge.style.padding = '6px 10px';
    badge.style.font = '700 12px Tahoma, Arial, sans-serif';
    badge.style.color = '#222';
    document.body.appendChild(badge);
  }
  const rect = panel.getBoundingClientRect();
  badge.style.left = `${rect.left + 12}px`;
  badge.style.top = `${rect.top + 10}px`;
  const side = Math.round(canvas.getBoundingClientRect().width || 0);
  badge.textContent = `وضع ثابت — مساحة العجلة ${side}px — تحريك داخل الإطار فقط`;
}

function applyViewportFix() {
  const panel = document.getElementById(PANEL_ID);
  const canvas = document.getElementById(CANVAS_ID);
  if (!panel || !canvas) return false;

  const sidebarRight = getSidebarRight();
  const left = clamp(Math.ceil(sidebarRight + 14), 330, 420);
  const top = getTopOffset();
  const rightPadding = 14;
  const bottomPadding = 14;

  panel.style.position = 'fixed';
  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
  panel.style.width = `calc(100vw - ${left + rightPadding}px)`;
  panel.style.height = `calc(100vh - ${top + bottomPadding}px)`;
  panel.style.zIndex = '70';
  panel.style.background = '#fff';
  panel.style.overflow = 'auto';
  panel.style.boxSizing = 'border-box';
  panel.style.border = '1px solid rgba(190,190,190,0.55)';
  panel.style.boxShadow = '0 2px 12px rgba(0,0,0,0.10)';
  panel.style.direction = 'ltr';
  panel.style.contain = 'layout paint';
  panel.style.scrollbarGutter = 'stable both-edges';

  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';
  canvas.style.maxWidth = 'none';
  canvas.style.maxHeight = 'none';
  canvas.style.transformOrigin = 'top left';

  document.documentElement.style.overflowX = 'hidden';
  document.body.style.overflowX = 'hidden';
  document.body.style.minWidth = '100%';

  if (panel.dataset.gannzillaViewportCentered !== 'true') {
    const centerScrollLeft = Math.max(0, (canvas.offsetWidth - panel.clientWidth) / 2);
    const centerScrollTop = Math.max(0, (canvas.offsetHeight - panel.clientHeight) / 2);
    panel.scrollLeft = centerScrollLeft;
    panel.scrollTop = centerScrollTop;
    panel.dataset.gannzillaViewportCentered = 'true';
  }

  ensureStatusBadge(panel, canvas);
  window.__gannzillaTwentyRingViewportFixV35 = PATCH_MARKER;
  return true;
}

export default function GannzillaTwentyRingViewportFixPatch() {
  React.useEffect(() => {
    const isStable20Mode =
      window.location.search.includes('twentyRingNoOverlap') ||
      window.location.search.includes('stable20Rings') ||
      window.location.search.includes('noOverlap20') ||
      window.location.search.includes('adaptive20Rings');

    if (!isStable20Mode) return undefined;

    applyViewportFix();
    const timer = window.setInterval(applyViewportFix, 120);
    window.addEventListener('resize', applyViewportFix);
    window.addEventListener('orientationchange', applyViewportFix);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('resize', applyViewportFix);
      window.removeEventListener('orientationchange', applyViewportFix);
      document.getElementById(BADGE_ID)?.remove();
      document.documentElement.style.overflowX = '';
      document.body.style.overflowX = '';
      document.body.style.minWidth = '';
    };
  }, []);

  return null;
}
