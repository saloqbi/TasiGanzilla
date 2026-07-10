import React from 'react';
import { createPortal } from 'react-dom';

const ABOUT_ID = 'gannzilla-about-v156';
const HITBOX_ID = 'gannzilla-about-hitbox-v160';
const DIALOG_ID = 'gannzilla-about-dialog-v156';

function getRect() {
  const button = document.getElementById(ABOUT_ID);
  if (!button) return null;
  const rect = button.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  return {
    left: Math.round(rect.left),
    top: Math.round(rect.top),
    width: Math.max(27, Math.round(rect.width)),
    height: Math.max(24, Math.round(rect.height)),
  };
}

export default function GannzillaAboutClickFixV160() {
  const [rect, setRect] = React.useState(null);
  const [language, setLanguage] = React.useState(document.documentElement.lang === 'ar' ? 'ar' : 'en');

  React.useEffect(() => {
    let disposed = false;

    const refresh = () => {
      if (disposed) return;
      setLanguage(document.documentElement.lang === 'ar' ? 'ar' : 'en');
      const next = getRect();
      setRect((current) => (
        current
        && next
        && current.left === next.left
        && current.top === next.top
        && current.width === next.width
        && current.height === next.height
          ? current
          : next
      ));

      const source = document.getElementById(ABOUT_ID);
      if (source) {
        source.style.setProperty('position', 'relative', 'important');
        source.style.setProperty('z-index', '2147483646', 'important');
        source.style.setProperty('pointer-events', 'auto', 'important');
      }
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true });
    const languageObserver = new MutationObserver(refresh);
    languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    const timer = window.setInterval(refresh, 200);
    window.addEventListener('resize', refresh);
    window.addEventListener('scroll', refresh, true);

    window.GANNZILLA_ABOUT_CLICK_FIX_V160 = true;
    window.__auditGannzillaAboutClickFixV160 = () => {
      const hitbox = document.getElementById(HITBOX_ID);
      const style = hitbox ? window.getComputedStyle(hitbox) : null;
      return {
        ok: Boolean(hitbox)
          && style?.display !== 'none'
          && style?.visibility !== 'hidden'
          && style?.pointerEvents !== 'none',
        build: '160',
        hitboxVisible: Boolean(hitbox),
        dialogOpen: Boolean(document.getElementById(DIALOG_ID)),
      };
    };

    return () => {
      disposed = true;
      observer.disconnect();
      languageObserver.disconnect();
      window.clearInterval(timer);
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', refresh, true);
    };
  }, []);

  const openAbout = React.useCallback((event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.nativeEvent?.stopImmediatePropagation?.();

    if (typeof window.__openGannzillaAboutV156 === 'function') {
      window.__openGannzillaAboutV156();
      return;
    }

    const source = document.getElementById(ABOUT_ID);
    source?.click?.();
  }, []);

  if (!rect) return null;

  const title = language === 'ar' ? 'حول البرنامج' : 'About';

  return createPortal(
    <button
      id={HITBOX_ID}
      type="button"
      title={title}
      aria-label={title}
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onTouchStart={(event) => {
        event.preventDefault();
        event.stopPropagation();
        openAbout(event);
      }}
      onClick={openAbout}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') openAbout(event);
      }}
      style={{
        position: 'fixed',
        left: rect.left - 3,
        top: rect.top - 3,
        width: rect.width + 6,
        height: rect.height + 6,
        zIndex: 2147483647,
        padding: 0,
        margin: 0,
        border: '1px solid #9aa7b4',
        borderRadius: 2,
        background: 'linear-gradient(#ffffff,#e9eef3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        visibility: 'visible',
        opacity: 1,
        pointerEvents: 'auto',
        cursor: 'pointer',
        touchAction: 'manipulation',
        boxSizing: 'border-box',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: '1px solid #2d579d',
          background: '#416db8',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          font: '700 13px Georgia, Times New Roman, serif',
          lineHeight: '18px',
          pointerEvents: 'none',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,.45)',
        }}
      >
        i
      </span>
    </button>,
    document.body,
  );
}
