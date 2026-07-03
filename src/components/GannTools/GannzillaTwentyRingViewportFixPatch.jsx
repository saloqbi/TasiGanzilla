import React from 'react';

const PATCH_MARKER = 'GANNZILLA_TWENTY_RING_FIT_WIDTH_LAYOUT_FIX_V39';
const PANEL_ID = 'gannzilla-twenty-ring-no-overlap-panel-v1';
const CANVAS_ID = 'gannzilla-twenty-ring-no-overlap-canvas-v1';
const BADGE_ID = 'gannzilla-twenty-ring-viewport-status-v39';
const EXPORT_BAR_ID = 'gannzilla-twenty-ring-export-bar-v39';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getSidebarRight() {
  const candidates = Array.from(document.querySelectorAll('aside, [class*="sidebar"], [class*="control"]'))
    .filter((el) => ![PANEL_ID, BADGE_ID, EXPORT_BAR_ID].includes(el.id));
  const visible = candidates
    .map((el) => el.getBoundingClientRect())
    .filter((rect) => rect.width > 110 && rect.height > 220 && rect.left < 290)
    .sort((a, b) => b.right - a.right)[0];
  return visible ? visible.right : 188;
}

function getTopOffset() {
  const toolbar = Array.from(document.querySelectorAll('header, nav, [class*="toolbar"], [class*="topbar"]'))
    .map((el) => el.getBoundingClientRect())
    .filter((rect) => rect.width > 320 && rect.height > 18 && rect.top < 135)
    .sort((a, b) => b.bottom - a.bottom)[0];
  return toolbar ? clamp(toolbar.bottom + 6, 82, 128) : 92;
}

function makeButton(label, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.style.height = '30px';
  button.style.padding = '0 11px';
  button.style.border = '1px solid #8f969f';
  button.style.borderRadius = '5px';
  button.style.background = 'linear-gradient(#ffffff,#ededed)';
  button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.18)';
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
  document.getElementById('gannzilla-twenty-ring-export-bar-v36')?.remove();
  document.getElementById('gannzilla-twenty-ring-export-bar-v38')?.remove();
  let bar = document.getElementById(EXPORT_BAR_ID);
  if (!bar) {
    bar = document.createElement('div');
    bar.id = EXPORT_BAR_ID;
    bar.dir = 'rtl';
    bar.style.position = 'fixed';
    bar.style.zIndex = '2147483647';
    bar.style.display = 'flex';
    bar.style.gap = '7px';
    bar.style.alignItems = 'center';
    bar.style.background = 'rgba(255,255,255,0.97)';
    bar.style.border = '1px solid rgba(130,130,130,0.52)';
    bar.style.borderRadius = '7px';
    bar.style.padding = '4px 6px';
    bar.style.boxShadow = '0 2px 9px rgba(0,0,0,0.18)';
    document.body.appendChild(bar);
  }
  if (!bar.dataset.ready) {
    bar.appendChild(makeButton('نسخ الصورة ⧉', (event) => copyCanvas(canvas, event.currentTarget)));
    bar.appendChild(makeButton('PDF A4 🖨', () => printPdf(canvas)));
    bar.dataset.ready = 'true';
  }
  const rect = panel.getBoundingClientRect();
  bar.style.left = `${rect.left + 10}px`;
  bar.style.top = `${Math.max(8, rect.top + 8)}px`;
}

function ensureStatusBadge(panel, canvas, fitSide) {
  document.getElementById('gannzilla-twenty-ring-viewport-status-v36')?.remove();
  document.getElementById('gannzilla-twenty-ring-viewport-status-v38')?.remove();
  let badge = document.getElementById(BADGE_ID);
  if (!badge) {
    badge = document.createElement('div');
    badge.id = BADGE_ID;
    badge.dir = 'rtl';
    badge.style.position = 'fixed';
    badge.style.zIndex = '12000';
    badge.style.pointerEvents = 'none';
    badge.style.background = 'rgba(255,255,255,0.94)';
    badge.style.border = '1px solid rgba(160,160,160,0.50)';
    badge.style.borderRadius = '7px';
    badge.style.boxShadow = '0 2px 8px rgba(0,0,0,0.13)';
    badge.style.padding = '5px 9px';
    badge.style.font = '700 11px Tahoma, Arial, sans-serif';
    badge.style.color = '#222';
    document.body.appendChild(badge);
  }
  const rect = panel.getBoundingClientRect();
  badge.style.left = `${rect.left + 10}px`;
  badge.style.top = `${rect.top + 46}px`;
  const nativeSide = Math.round(canvas.width / (window.devicePixelRatio || 1) || 0);
  badge.textContent = `عرض مضبوط — ${Math.round(fitSide)}px — الأصل ${nativeSide}px`;
}

function applyLayoutFix() {
  const panel = document.getElementById(PANEL_ID);
  const canvas = document.getElementById(CANVAS_ID);
  if (!panel || !canvas) return false;

  const left = clamp(Math.ceil(getSidebarRight() + 6), 186, 246);
  const top = getTopOffset();
  const rightPadding = 10;
  const bottomPadding = 10;

  panel.style.position = 'fixed';
  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
  panel.style.width = `calc(100vw - ${left + rightPadding}px)`;
  panel.style.height = `calc(100vh - ${top + bottomPadding}px)`;
  panel.style.zIndex = '78';
  panel.style.background = '#fff';
  panel.style.overflowX = 'hidden';
  panel.style.overflowY = 'auto';
  panel.style.boxSizing = 'border-box';
  panel.style.border = '1px solid rgba(190,190,190,0.50)';
  panel.style.boxShadow = '0 2px 12px rgba(0,0,0,0.10)';
  panel.style.direction = 'ltr';
  panel.style.contain = 'layout paint';
  panel.style.display = 'block';
  panel.style.scrollbarGutter = 'stable';

  const panelW = Math.max(320, panel.clientWidth || 0);
  const nativeSide = Math.max(1, canvas.width / (window.devicePixelRatio || 1));
  const targetByWidth = panelW - 26;
  const readableMin = window.innerWidth >= 1100 ? 820 : 690;
  const fitSide = clamp(targetByWidth, readableMin, Math.min(nativeSide, 1380));

  canvas.style.display = 'block';
  canvas.style.width = `${fitSide}px`;
  canvas.style.height = `${fitSide}px`;
  canvas.style.margin = '54px auto 28px auto';
  canvas.style.maxWidth = 'none';
  canvas.style.maxHeight = 'none';
  canvas.style.transform = 'none';
  canvas.style.flex = '0 0 auto';

  document.documentElement.style.overflowX = 'hidden';
  document.body.style.overflowX = 'hidden';
  document.body.style.minWidth = '100%';
  document.body.style.minHeight = '100%';

  ensureExportBar(panel, canvas);
  ensureStatusBadge(panel, canvas, fitSide);
  window.__gannzillaTwentyRingFitWidthLayoutFixV39 = PATCH_MARKER;
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

    applyLayoutFix();
    const start = window.setInterval(() => {
      if (applyLayoutFix()) window.clearInterval(start);
    }, 160);
    const onResize = debounce(applyLayoutFix, 140);
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
