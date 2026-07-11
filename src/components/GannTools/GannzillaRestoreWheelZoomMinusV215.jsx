import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = 216;
const OVERLAY_ID = 'gannzilla-wheel-zoom-minus-overlay-v216';
const FINAL_TOOLBAR_ID = 'gannzilla-final-drawing-toolbar-v214';
const SOURCE_TOOLBAR_ID = 'gannzilla-exact-drawing-toolbar-v208';

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

export default function GannzillaRestoreWheelZoomMinusV215() {
  const [overlay, setOverlay] = React.useState(null);

  React.useEffect(() => {
    let disposed = false;

    const sync = () => {
      if (disposed) return;
      const percentage = findZoomPercentageElement();
      if (!percentage) {
        setOverlay(null);
        return;
      }

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

      window.GANNZILLA_WHEEL_ZOOM_MINUS_OVERLAY_V216 = true;
      window.__auditGannzillaWheelZoomMinusOverlayV216 = () => ({
        ok: Boolean(document.getElementById(OVERLAY_ID)),
        build: BUILD,
        percentage: compactLabel(findZoomPercentageElement()),
        nativeButtonFound: Boolean(findNativeZoomOutButton(findZoomPercentageElement())?.button),
      });
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'hidden', 'aria-hidden'] });
    const timer = window.setInterval(sync, 150);
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);

    return () => {
      disposed = true;
      observer.disconnect();
      window.clearInterval(timer);
      window.removeEventListener('resize', sync);
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
