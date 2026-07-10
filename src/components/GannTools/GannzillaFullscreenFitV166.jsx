import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = '166';
const CONTROL_ID = 'gannzilla-fullscreen-fit-v166';

function textOf(element) {
  return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
}

function isTopRow(element) {
  const rect = element?.getBoundingClientRect?.();
  return Boolean(rect)
    && rect.width > 0
    && rect.height > 0
    && rect.top >= 0
    && rect.bottom <= 42;
}

function findFitButton() {
  return Array.from(document.querySelectorAll('button'))
    .filter(isTopRow)
    .find((button) => {
      const label = textOf(button);
      const title = String(button.getAttribute('title') || '');
      const aria = String(button.getAttribute('aria-label') || '');
      return label === '⛶'
        || label === '⤢'
        || label === '↗'
        || /fit|fullscreen|full screen|ملء الشاشة|تعبئة الشاشة/i.test(`${title} ${aria}`);
    }) || null;
}

function rectOf(button) {
  if (!button) return null;
  const rect = button.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  return {
    left: Math.round(rect.left),
    top: Math.round(rect.top),
    width: Math.max(22, Math.round(rect.width)),
    height: Math.max(21, Math.round(rect.height)),
  };
}

function settleFit(sourceButton) {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      sourceButton?.click?.();
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
  });
}

export default function GannzillaFullscreenFitV166() {
  const [rect, setRect] = React.useState(null);
  const [language, setLanguage] = React.useState(document.documentElement.lang === 'ar' ? 'ar' : 'en');
  const sourceRef = React.useRef(null);

  React.useEffect(() => {
    let disposed = false;

    const refresh = () => {
      if (disposed) return;
      setLanguage(document.documentElement.lang === 'ar' ? 'ar' : 'en');
      const source = findFitButton();
      sourceRef.current = source;
      const next = rectOf(source);
      setRect((current) => (
        current && next
        && current.left === next.left
        && current.top === next.top
        && current.width === next.width
        && current.height === next.height
          ? current
          : next
      ));
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'title', 'aria-label'],
    });
    const languageObserver = new MutationObserver(refresh);
    languageObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang'],
    });
    const timer = window.setInterval(refresh, 200);
    window.addEventListener('resize', refresh);
    window.addEventListener('scroll', refresh, true);
    document.addEventListener('fullscreenchange', refresh);

    window.GANNZILLA_FULLSCREEN_FIT_V166 = true;
    window.__auditGannzillaFullscreenFitV166 = () => {
      const control = document.getElementById(CONTROL_ID);
      const style = control ? window.getComputedStyle(control) : null;
      return {
        ok: Boolean(control)
          && Boolean(sourceRef.current)
          && style?.display !== 'none'
          && style?.visibility !== 'hidden'
          && style?.pointerEvents !== 'none',
        build: BUILD,
        visible: Boolean(control),
        sourceFound: Boolean(sourceRef.current),
        fullscreen: Boolean(document.fullscreenElement),
      };
    };

    return () => {
      disposed = true;
      observer.disconnect();
      languageObserver.disconnect();
      window.clearInterval(timer);
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', refresh, true);
      document.removeEventListener('fullscreenchange', refresh);
    };
  }, []);

  const toggleFullscreen = React.useCallback(async (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent?.stopImmediatePropagation?.();

    const source = sourceRef.current || findFitButton();
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      } else {
        await document.exitFullscreen();
      }
    } catch (_) {
      // Browser may refuse fullscreen; keep the original fit behavior as fallback.
    }

    window.setTimeout(() => settleFit(source), 80);
    window.setTimeout(() => settleFit(source), 260);
  }, []);

  if (!rect) return null;

  const title = language === 'ar'
    ? 'ملء الشاشة وتكبير العجلة'
    : 'Fullscreen and fit wheel';

  return createPortal(
    <button
      id={CONTROL_ID}
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={Boolean(document.fullscreenElement)}
      onClick={toggleFullscreen}
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
        border: '1px solid #a7a7a7',
        borderRadius: 2,
        background: '#f7f7f7',
        color: '#1c75bc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        visibility: 'visible',
        opacity: 1,
        pointerEvents: 'auto',
        cursor: 'pointer',
        boxSizing: 'border-box',
        touchAction: 'manipulation',
        fontFamily: 'Segoe UI Symbol, Segoe UI, Arial, sans-serif',
        fontSize: 16,
        fontWeight: 800,
        lineHeight: 1,
      }}
    >
      ⛶
    </button>,
    document.body,
  );
}
