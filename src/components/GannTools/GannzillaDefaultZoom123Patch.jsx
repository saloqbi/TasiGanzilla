import React from 'react';

const TARGET_ZOOM = 1.23;
const MARKER = '__gannzillaDefaultZoom123PatchV1';

function getMainWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => canvas.id !== 'gannzilla-long-number-digital-renderer-v1')
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 120 && rect.height > 120)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function getZoomSpan() {
  return Array.from(document.querySelectorAll('span'))
    .find((span) => /^\d+%$/.test((span.textContent || '').trim())) || null;
}

function getViewport() {
  return Array.from(document.querySelectorAll('div')).find((div) => {
    const st = window.getComputedStyle(div);
    return st.position === 'absolute' && st.overflow.includes('auto') && st.top === '24px';
  }) || null;
}

function applyZoom123() {
  const canvas = getMainWheelCanvas();
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const span = getZoomSpan();
  const zoomText = (span?.textContent || '').trim();
  const currentZoom = Number(zoomText.replace('%', '')) / 100;
  const safeZoom = Number.isFinite(currentZoom) && currentZoom > 0 ? currentZoom : 1;

  const baseWidth = rect.width / safeZoom;
  const baseHeight = rect.height / safeZoom;
  const targetWidth = Math.max(1, baseWidth * TARGET_ZOOM);
  const targetHeight = Math.max(1, baseHeight * TARGET_ZOOM);

  canvas.style.setProperty('width', `${targetWidth}px`, 'important');
  canvas.style.setProperty('height', `${targetHeight}px`, 'important');

  if (span) span.textContent = '123%';

  const viewport = getViewport();
  if (viewport) {
    requestAnimationFrame(() => {
      viewport.scrollLeft = Math.max(0, (targetWidth - viewport.clientWidth) / 2);
      viewport.scrollTop = Math.max(0, (targetHeight - viewport.clientHeight) / 2);
    });
  }
}

export default function GannzillaDefaultZoom123Patch() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    window[MARKER] = true;
    const timers = [120, 420, 900, 1500].map((delay) => window.setTimeout(applyZoom123, delay));
    const interval = window.setInterval(applyZoom123, 900);
    window.addEventListener('resize', applyZoom123);

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      window.clearInterval(interval);
      window.removeEventListener('resize', applyZoom123);
    };
  }, []);

  return null;
}
