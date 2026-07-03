import React from 'react';

const PATCH_MARKER = 'GANNZILLA_TWENTY_RING_LAYOUT_STABILITY_FIX_V36';
const PANEL_ID = 'gannzilla-twenty-ring-no-overlap-panel-v1';
const CANVAS_ID = 'gannzilla-twenty-ring-no-overlap-canvas-v1';
const BADGE_ID = 'gannzilla-twenty-ring-viewport-status-v36';
const EXPORT_BAR_ID = 'gannzilla-twenty-ring-export-bar-v36';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getSidebarRight() {
  const candidates = Array.from(document.querySelectorAll('aside, [class*="sidebar"], [class*="control"]'))
    .filter((el) => ![PANEL_ID, BADGE_ID, EXPORT_BAR_ID].includes(el.id));
  const visible = candidates
    .map((el) => el.getBoundingClientRect())
    .filter((rect) => rect.width > 120 && rect.height > 240 && rect.left < 300)
    .sort((a, b) => b.right - a.right)[0];
  return visible ? visible.right : 238;
}

function getTopOffset() {
  const toolbar = Array.from(document.querySelectorAll('header, nav, [class*="toolbar"], [class*="topbar"]'))
    .map((el) => el.getBoundingClientRect())
    .filter((rect) => rect.width > 320 && rect.height > 20 && rect.top < 120)
    .sort((a, b) => b.bottom - a.bottom)[0];
  return toolbar ? clamp(toolbar.bottom + 8, 72, 112) : 82;
}

function makeButton(label, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.style.height = '32px';
  button.style.padding = '0 12px';
  button.style.border = '1px solid #9da3aa';
  button.style.borderRadius = '5px';
  button.style.background = 'linear-gradient(#fff,#eeeeee)';
  button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.16)';
  button.style.font = '700 12px Tahoma, Arial, sans-serif';
  button.style.color = '#111';
  button.style.cursor = 'pointer';
  button.style.whiteSpace = 'nowrap';
  button.addEventListener('click', onClick);
  return button;
}

async function copyCanvas(canvas, button) {
  if (!canvas) return;
  const original = button.textContent;
  try {
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
    if (blob && navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      button.textContent = 'تم النسخ ✓';
    } else {
      const link = document.createElement('a');
      link.download = 'gannzilla-20-rings.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      button.textContent = 'تم الحفظ ✓';
    }
  } catch (error) {
    const link = document.createElement('a');
    link.download = 'gannzilla-20-rings.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    button.textContent = 'تم الحفظ ✓';
  }
  window.setTimeout(() => {
    button.textContent = original;
  }, 1400);
}

function printPdf(canvas) {
  if (!canvas) return;
  const dataUrl = canvas.toDataURL('image/png');
  const popup = window.open('', '_blank');
  if (!popup) {
    window.print();
    return;
  }
  popup.document.write(`<!doctype html><html><head><title>Gannzilla PDF</title><style>@page{size:A4 landscape;margin:8mm;}html,body{margin:0;background:#fff;}img{display:block;width:100%;height:auto;}</style></head><body><img src="${dataUrl}" onload="setTimeout(()=>window.print(),250)" /></body></html>`);
  popup.document.close();
}

function ensureExportBar(panel, canvas) {
  let bar = document.getElementById(EXPORT_BAR_ID);
  if (!bar) {
    bar = document.createElement('div');
    bar.id = EXPORT_BAR_ID;
    bar.dir = 'rtl';
    bar.style.position = 'fixed';
    bar.style.zIndex = '2147483647';
    bar.style.display = 'flex';
    bar.style.gap = '8px';
    bar.style.alignItems = 'center';
    bar.style.background = 'rgba(255,255,255,0.96)';
    bar.style.border = '1px solid rgba(150,150,150,0.5)';
    bar.style.borderRadius = '7px';
    bar.style.padding = '5px 6px';
    bar.style.boxShadow = '0 2px 9px rgba(0,0,0,0.16)';
    document.body.appendChild(bar);
  }
  if (!bar.dataset.ready) {
    bar.appendChild(makeButton('نسخ الصورة ⧉', (event) => copyCanvas(canvas, event.currentTarget)));
    bar.appendChild(makeButton('PDF A4 🖨', () => printPdf(canvas)));
    bar.dataset.ready = 'true';
  }
  const rect = panel.getBoundingClientRect();
  bar.style.left = `${rect.left + 10}px`;
  bar.style.top = `${Math.max(10, rect.top - 42)}px`;
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
    badge.style.borderRadius = '7px';
    badge.style.boxShadow = '0 2px 8px rgba(0,0,0,0.14)';
    badge.style.padding = '5px 9px';
    badge.style.font = '700 11px Tahoma, Arial, sans-serif';
    badge.style.color = '#222';
    document.body.appendChild(badge);
  }
  const rect = panel.getBoundingClientRect();
  badge.style.left = `${rect.left + 10}px`;
  badge.style.top = `${rect.top + 8}px`;
  const side = Math.round(canvas.getBoundingClientRect().width || 0);
  badge.textContent = `وضع ثابت — ${side}px — اسحب داخل الإطار فقط`;
}

function applyLayoutFix(options = {}) {
  const panel = document.getElementById(PANEL_ID);
  const canvas = document.getElementById(CANVAS_ID);
  if (!panel || !canvas) return false;

  const left = clamp(Math.ceil(getSidebarRight() + 10), 235, 310);
  const top = getTopOffset();
  const rightPadding = 12;
  const bottomPadding = 14;

  panel.style.position = 'fixed';
  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
  panel.style.width = `calc(100vw - ${left + rightPadding}px)`;
  panel.style.height = `calc(100vh - ${top + bottomPadding}px)`;
  panel.style.zIndex = '78';
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
  canvas.style.transform = 'none';

  document.documentElement.style.overflowX = 'hidden';
  document.body.style.overflowX = 'hidden';
  document.body.style.minWidth = '100%';
  document.body.style.minHeight = '100%';

  if (options.center === true && panel.dataset.gannzillaV36Centered !== 'true') {
    panel.scrollLeft = Math.max(0, (canvas.offsetWidth - panel.clientWidth) / 2);
    panel.scrollTop = Math.max(0, (canvas.offsetHeight - panel.clientHeight) / 2);
    panel.dataset.gannzillaV36Centered = 'true';
  }

  ensureExportBar(panel, canvas);
  ensureStatusBadge(panel, canvas);
  window.__gannzillaTwentyRingLayoutStabilityFixV36 = PATCH_MARKER;
  return true;
}

function debounce(fn, wait = 120) {
  let timer;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), wait);
  };
}

export default function GannzillaTwentyRingViewportFixPatch() {
  React.useEffect(() => {
    const isStable20Mode =
      window.location.search.includes('twentyRingNoOverlap') ||
      window.location.search.includes('stable20Rings') ||
      window.location.search.includes('noOverlap20') ||
      window.location.search.includes('adaptive20Rings');

    if (!isStable20Mode) return undefined;

    const start = window.setInterval(() => {
      if (applyLayoutFix({ center: true })) window.clearInterval(start);
    }, 120);

    const onResize = debounce(() => applyLayoutFix({ center: false }), 160);
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    return () => {
      window.clearInterval(start);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      document.getElementById(BADGE_ID)?.remove();
      document.getElementById(EXPORT_BAR_ID)?.remove();
      document.documentElement.style.overflowX = '';
      document.body.style.overflowX = '';
      document.body.style.minWidth = '';
      document.body.style.minHeight = '';
    };
  }, []);

  return null;
}
