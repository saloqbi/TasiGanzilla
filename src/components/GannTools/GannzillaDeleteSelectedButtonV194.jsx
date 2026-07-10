import React from 'react';
import { createPortal } from 'react-dom';

const CONTROL_ID = 'gannzilla-delete-selected-v194';

function cleanLabel(element) {
  return String(element?.textContent || '').replace(/\s+/g, '').trim();
}

function findLockAnchor() {
  return Array.from(document.querySelectorAll('button')).find((button) => {
    if (button.id === CONTROL_ID) return false;
    const rect = button.getBoundingClientRect();
    const label = cleanLabel(button);
    const name = `${button.getAttribute('title') || ''} ${button.getAttribute('aria-label') || ''}`;
    return rect.width > 0
      && rect.height > 0
      && rect.top >= 0
      && rect.bottom <= 48
      && (['🔒', '🔐'].includes(label) || /lock|قفل/i.test(name));
  }) || null;
}

export default function GannzillaDeleteSelectedButtonV194() {
  const [rect, setRect] = React.useState(null);
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    let disposed = false;
    let currentAnchor = null;

    const refresh = () => {
      if (disposed) return;
      const anchor = findLockAnchor();
      if (!anchor) {
        setRect(null);
        return;
      }

      currentAnchor = anchor;
      anchor.style.setProperty('opacity', '0', 'important');
      anchor.style.setProperty('pointer-events', 'none', 'important');

      const anchorRect = anchor.getBoundingClientRect();
      const next = {
        left: Math.round(anchorRect.left),
        top: Math.round(anchorRect.top),
        width: Math.max(22, Math.round(anchorRect.width)),
        height: Math.max(21, Math.round(anchorRect.height)),
      };

      setRect((current) => current
        && current.left === next.left
        && current.top === next.top
        && current.width === next.width
        && current.height === next.height
        ? current
        : next);
    };

    refresh();
    const timer = window.setInterval(refresh, 350);
    window.addEventListener('resize', refresh);
    window.addEventListener('scroll', refresh, true);

    return () => {
      disposed = true;
      window.clearInterval(timer);
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', refresh, true);
      if (currentAnchor) {
        currentAnchor.style.removeProperty('opacity');
        currentAnchor.style.removeProperty('pointer-events');
      }
    };
  }, []);

  const activate = React.useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent?.stopImmediatePropagation?.();
    setActive(true);
  }, []);

  if (!rect) return null;

  return createPortal(
    <button
      id={CONTROL_ID}
      type="button"
      title="مسح رسم محدد: اضغط ثم اختر الرسم"
      aria-label="مسح رسم محدد"
      aria-pressed={active}
      onPointerDown={activate}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      style={{
        position: 'fixed',
        left: rect.left,
        top: rect.top,
        width: rect.width,
        minWidth: rect.width,
        height: rect.height,
        padding: 0,
        margin: 0,
        zIndex: 2147483647,
        border: '1px solid #8fa5b4',
        borderRadius: 2,
        background: active ? '#d9edf9' : '#f7f7f7',
        color: '#b42318',
        boxShadow: active ? 'inset 0 0 0 1px #5f9fc5' : 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        pointerEvents: 'auto',
        touchAction: 'manipulation',
        userSelect: 'none',
        boxSizing: 'border-box',
      }}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block', pointerEvents: 'none' }}>
        <path d="M4 15.5 13.8 5.7a2 2 0 0 1 2.8 0l1.7 1.7a2 2 0 0 1 0 2.8L8.5 20H4v-4.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m11.5 8 4.5 4.5M8.5 20H20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>,
    document.body,
  );
}
