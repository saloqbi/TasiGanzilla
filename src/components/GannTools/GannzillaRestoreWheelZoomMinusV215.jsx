import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = 218;
const OVERLAY_ID = 'gannzilla-wheel-zoom-minus-overlay-v216';
const FINAL_TOOLBAR_ID = 'gannzilla-final-drawing-toolbar-v214';
const SOURCE_TOOLBAR_ID = 'gannzilla-exact-drawing-toolbar-v208';
const TWO_PI = Math.PI * 2;

function compactLabel(element) {
  return String(element?.textContent || '').replace(/\s+/g, '').trim();
}

function isTopElement(element) {
  const rect = element?.getBoundingClientRect?.();
  return Boolean(rect)
    && rect.width > 0
    && rect.height > 0
    && rect.top >= 0
    && rect.bottom <= 60;
}

function findZoomPercentageElement() {
  return Array.from(document.querySelectorAll('span, div, button'))
    .filter((element) => element.id !== OVERLAY_ID)
    .filter((element) => !element.closest?.(`#${FINAL_TOOLBAR_ID}, #${SOURCE_TOOLBAR_ID}`))
    .filter(isTopElement)
    .find((element) => /^\d{2,3}%$/.test(compactLabel(element))) || null;
}

function looksLikeZoomOut(button) {
  const label = compactLabel(button);
  const title = String(button?.getAttribute?.('title') || '').toLowerCase();
  const aria = String(button?.getAttribute?.('aria-label') || '').toLowerCase();
  const text = `${title} ${aria}`;

  return ['-', '−', '–', '—'].includes(label)
    || text.includes('zoom out')
    || text.includes('zoom-out')
    || text.includes('تصغير')
    || text.includes('تقليل التكبير');
}

function findNativeZoomOutButton(percentage) {
  if (!percentage) return null;
  const percentRect = percentage.getBoundingClientRect();

  return Array.from(document.querySelectorAll('button'))
    .filter((button) => button.id !== OVERLAY_ID)
    .filter((button) => !button.closest?.(`#${FINAL_TOOLBAR_ID}, #${SOURCE_TOOLBAR_ID}`))
    .filter(looksLikeZoomOut)
    .map((button) => {
      const rect = button.getBoundingClientRect();
      const verticalDistance = Math.abs((rect.top + rect.height / 2) - (percentRect.top + percentRect.height / 2));
      const horizontalGap = percentRect.left - rect.right;
      const isLeftNeighbour = horizontalGap >= -4 && horizontalGap <= 50;
      const score = (isLeftNeighbour ? 0 : 1000) + verticalDistance * 10 + Math.abs(horizontalGap);
      return { button, rect, score };
    })
    .sort((a, b) => a.score - b.score)[0] || null;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function numberParam(name, fallback, min, max) {
  try {
    const value = Number(new URLSearchParams(window.location.search).get(name));
    return Number.isFinite(value) ? clamp(value, min, max) : fallback;
  } catch (_) {
    return fallback;
  }
}

function boolParam(name, fallback) {
  try {
    const query = new URLSearchParams(window.location.search);
    if (!query.has(name)) return fallback;
    const value = String(query.get(name) || '').toLowerCase();
    return value === 'true' || value === '1' || value === 'yes' || value === 'on';
  } catch (_) {
    return fallback;
  }
}

function polar(cx, cy, radius, degrees) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function wedge(ctx, cx, cy, innerRadius, outerRadius, startDegrees, endDegrees) {
  const start = ((startDegrees - 90) * Math.PI) / 180;
  const end = ((endDegrees - 90) * Math.PI) / 180;
  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, start, end, false);
  ctx.arc(cx, cy, innerRadius, end, start, true);
  ctx.closePath();
}

function normalizeRotation(degrees) {
  let radians = ((degrees - 90) * Math.PI) / 180;
  while (radians > Math.PI) radians -= TWO_PI;
  while (radians < -Math.PI) radians += TWO_PI;
  if (radians > Math.PI / 2) radians -= Math.PI;
  if (radians < -Math.PI / 2) radians += Math.PI;
  return radians;
}

function drawText(ctx, text, x, y, angleDegrees, fontSize, maxWidth, weight, color) {
  ctx.save();
  ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5);
  ctx.rotate(normalizeRotation(angleDegrees));
  ctx.font = `${weight} ${fontSize}px Segoe UI, Arial, Helvetica, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(text), 0, 0, Math.max(8, maxWidth));
  ctx.restore();
}

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)));
}

function findWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function redrawRingTwoNumbering() {
  const canvas = findWheelCanvas();
  if (!canvas) return false;

  const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
  const coordinateWidth = canvas.width / dpr;
  const coordinateHeight = canvas.height / dpr;
  if (!Number.isFinite(coordinateWidth) || coordinateWidth <= 0 || coordinateHeight <= 0) return false;

  const levels = Math.round(numberParam('levels', 10, 1, 12));
  const divisions = Math.round(numberParam('divisions', 36, 3, 360));
  const startValue = numberParam('startValue', 3600, -1000000000, 1000000000);
  const increment = numberParam('increment', 1, -1000000, 1000000);
  const innerRadius = numberParam('gannzillaInnerRadius', 170, 80, 500);
  const ringWidth = numberParam('gannzillaRingWidth', 60, 30, 150);
  const fontSize = numberParam('gannzillaFontSize', 13, 8, 30);
  const fontWeight = Math.round(numberParam('gannzillaFontWeight', 700, 500, 900));
  const clockwise = boolParam('clockwise', true);
  const direction = clockwise ? 1 : -1;
  const sector = 360 / divisions;
  const cx = coordinateWidth / 2;
  const cy = coordinateHeight / 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  for (let ring = 1; ring <= levels; ring += 1) {
    const inner = innerRadius + (ring - 1) * ringWidth;
    const outer = inner + ringWidth;
    const mid = (inner + outer) / 2;
    const fill = ring % 2 === 0 ? '#dededb' : '#ffffff';
    const arcWidth = (TWO_PI * mid) / divisions;
    const maxWidth = arcWidth * 0.78;

    for (let index = 0; index < divisions; index += 1) {
      const startDegrees = direction * index * sector;
      const endDegrees = direction * (index + 1) * sector;
      const centerDegrees = direction * (index + 0.5) * sector;

      wedge(ctx, cx, cy, inner, outer, startDegrees, endDegrees);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = '#c5c5c5';
      ctx.lineWidth = 0.82;
      ctx.stroke();

      const point = polar(cx, cy, mid, centerDegrees);
      if (ring === 1) {
        const angleValue = Math.round(index * sector);
        drawText(ctx, `${angleValue}°`, point.x, point.y, centerDegrees, Math.max(10, fontSize - 1), maxWidth, 700, '#526b7a');
      } else {
        const value = startValue + ((ring - 2) * divisions + index) * increment;
        drawText(ctx, formatNumber(value), point.x, point.y, centerDegrees, fontSize, maxWidth, fontWeight, '#111111');
      }
    }
  }

  ctx.restore();

  window.GANNZILLA_RING2_NUMBERING_V218 = true;
  window.__auditGannzillaRing2NumberingV218 = () => ({
    ok: true,
    build: BUILD,
    ring1Mode: 'ANGLES_ONLY',
    firstNumericRing: 2,
    firstNumericValue: startValue,
    divisions,
    levels,
  });
  return true;
}

export default function GannzillaRestoreWheelZoomMinusV215() {
  const [overlay, setOverlay] = React.useState(null);

  React.useEffect(() => {
    let disposed = false;

    const sync = () => {
      if (disposed) return;
      const percentage = findZoomPercentageElement();
      if (!percentage) {
        setOverlay(null);
      } else {
        const percentRect = percentage.getBoundingClientRect();
        const nativeMatch = findNativeZoomOutButton(percentage);
        const nativeRect = nativeMatch?.rect;
        const width = Math.max(22, Math.round(nativeRect?.width || 22));
        const height = Math.max(21, Math.round(nativeRect?.height || percentRect.height || 21));
        const next = {
          left: Math.round(nativeRect?.left ?? (percentRect.left - width - 2)),
          top: Math.round(nativeRect?.top ?? (percentRect.top + (percentRect.height - height) / 2)),
          width,
          height,
          nativeButton: nativeMatch?.button || null,
        };

        setOverlay((current) => current
          && current.left === next.left
          && current.top === next.top
          && current.width === next.width
          && current.height === next.height
          && current.nativeButton === next.nativeButton
          ? current
          : next);
      }

      window.GANNZILLA_WHEEL_ZOOM_MINUS_OVERLAY_V216 = true;
      window.__auditGannzillaWheelZoomMinusOverlayV216 = () => ({
        ok: Boolean(document.getElementById(OVERLAY_ID)),
        build: BUILD,
        percentage: compactLabel(findZoomPercentageElement()),
        nativeButtonFound: Boolean(findNativeZoomOutButton(findZoomPercentageElement())?.button),
      });
    };

    const redraw = () => {
      if (!disposed) redrawRingTwoNumbering();
    };

    sync();
    redraw();
    const initialTimers = [80, 220, 500, 1000].map((delay) => window.setTimeout(redraw, delay));
    const observer = new MutationObserver(() => {
      sync();
      window.requestAnimationFrame(redraw);
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'hidden', 'aria-hidden'] });
    const controlTimer = window.setInterval(sync, 350);
    const redrawTimer = window.setInterval(redraw, 900);
    window.addEventListener('resize', redraw);
    window.addEventListener('scroll', sync, true);

    return () => {
      disposed = true;
      initialTimers.forEach((timer) => window.clearTimeout(timer));
      observer.disconnect();
      window.clearInterval(controlTimer);
      window.clearInterval(redrawTimer);
      window.removeEventListener('resize', redraw);
      window.removeEventListener('scroll', sync, true);
    };
  }, []);

  if (!overlay) return null;

  const activateZoomOut = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const percentage = findZoomPercentageElement();
    const nativeButton = findNativeZoomOutButton(percentage)?.button || overlay.nativeButton;
    nativeButton?.click?.();
  };

  return createPortal(
    <button
      id={OVERLAY_ID}
      type="button"
      title="تصغير العجلة"
      aria-label="تصغير العجلة"
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={activateZoomOut}
      style={{
        position: 'fixed',
        left: overlay.left,
        top: overlay.top,
        width: overlay.width,
        minWidth: overlay.width,
        height: overlay.height,
        minHeight: overlay.height,
        padding: 0,
        margin: 0,
        zIndex: 2147483647,
        border: '1px solid #8fa5b4',
        borderRadius: 2,
        background: 'linear-gradient(#ffffff 0%, #f6f6f6 52%, #e8e8e8 100%)',
        color: '#1c75bc',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.9)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        pointerEvents: 'auto',
        userSelect: 'none',
        boxSizing: 'border-box',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style={{ display: 'block', pointerEvents: 'none' }}>
        <line x1="3" y1="7" x2="11" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
      </svg>
    </button>,
    document.body,
  );
}
