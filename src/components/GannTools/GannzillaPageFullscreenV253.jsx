import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const BUILD = 253;

function ExpandGlyph({ active = false }) {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" aria-hidden="true" focusable="false">
      <rect x="1.5" y="1.5" width="14" height="14" fill="#f8f8f8" stroke="#a8a8a8" strokeWidth="0.7" />
      {active ? (
        <>
          <path d="M6.4 3.7v2.7H3.7" fill="none" stroke="#286fa8" strokeWidth="1.25" strokeLinecap="square" />
          <path d="M10.6 3.7v2.7h2.7" fill="none" stroke="#286fa8" strokeWidth="1.25" strokeLinecap="square" />
          <path d="M6.4 13.3v-2.7H3.7" fill="none" stroke="#286fa8" strokeWidth="1.25" strokeLinecap="square" />
          <path d="M10.6 13.3v-2.7h2.7" fill="none" stroke="#286fa8" strokeWidth="1.25" strokeLinecap="square" />
        </>
      ) : (
        <>
          <path d="M6.3 6.3 3.6 3.6M3.6 3.6h2.5M3.6 3.6v2.5" fill="none" stroke="#286fa8" strokeWidth="1.2" strokeLinecap="square" />
          <path d="m10.7 6.3 2.7-2.7M13.4 3.6h-2.5M13.4 3.6v2.5" fill="none" stroke="#286fa8" strokeWidth="1.2" strokeLinecap="square" />
          <path d="m6.3 10.7-2.7 2.7M3.6 13.4h2.5M3.6 13.4v-2.5" fill="none" stroke="#286fa8" strokeWidth="1.2" strokeLinecap="square" />
          <path d="m10.7 10.7 2.7 2.7M13.4 13.4h-2.5M13.4 13.4v-2.5" fill="none" stroke="#286fa8" strokeWidth="1.2" strokeLinecap="square" />
        </>
      )}
    </svg>
  );
}

export default function GannzillaPageFullscreenV253({ toolbarHeight = 24 }) {
  const { lang } = useLanguage();
  const isArabic = lang === 'ar' || new URLSearchParams(window.location.search).get('lang') === 'ar';
  const [active, setActive] = React.useState(Boolean(document.fullscreenElement));
  const [fallbackActive, setFallbackActive] = React.useState(false);
  const iconSize = Math.max(22, toolbarHeight);

  const notifyResize = React.useCallback(() => {
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new CustomEvent('gannzilla:ring-two-numbering-refresh'));
  }, []);

  React.useEffect(() => {
    const onFullscreenChange = () => {
      setActive(Boolean(document.fullscreenElement));
      window.setTimeout(notifyResize, 30);
      window.setTimeout(notifyResize, 180);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    window.GANNZILLA_PAGE_FULLSCREEN_V253 = true;
    window.__auditGannzillaPageFullscreenV253 = () => ({
      ok: true,
      build: BUILD,
      iconMounted: true,
      visualReference: 'GANNZILLA_FOUR_CORNER_PAGE_EXPAND_ICON',
      fullscreenApiSupported: Boolean(document.documentElement.requestFullscreen && document.exitFullscreen),
      fullscreenActive: Boolean(document.fullscreenElement),
      fallbackActive,
      toolbarHeightPx: toolbarHeight,
      iconSizePx: iconSize,
    });

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.documentElement.removeAttribute('data-gannzilla-page-maximized');
      delete window.GANNZILLA_PAGE_FULLSCREEN_V253;
      delete window.__auditGannzillaPageFullscreenV253;
    };
  }, [fallbackActive, iconSize, notifyResize, toolbarHeight]);

  const applyFallback = React.useCallback((enabled) => {
    if (enabled) document.documentElement.setAttribute('data-gannzilla-page-maximized', 'true');
    else document.documentElement.removeAttribute('data-gannzilla-page-maximized');
    setFallbackActive(enabled);
    setActive(enabled);
    window.setTimeout(notifyResize, 30);
    window.setTimeout(notifyResize, 180);
  }, [notifyResize]);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    if (fallbackActive) {
      applyFallback(false);
      return;
    }

    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      } else {
        applyFallback(true);
      }
    } catch {
      applyFallback(true);
    }
  };

  const label = active
    ? (isArabic ? 'استعادة حجم الصفحة' : 'Restore page size')
    : (isArabic ? 'تكبير الصفحة' : 'Maximize page');

  return (
    <>
      <style>{`
        html[data-gannzilla-page-maximized="true"],
        html[data-gannzilla-page-maximized="true"] body,
        html[data-gannzilla-page-maximized="true"] #root {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          margin: 0 !important;
          overflow: hidden !important;
          background: #ffffff !important;
          z-index: 2147483000 !important;
        }
      `}</style>
      <button
        type="button"
        data-gannzilla-page-fullscreen-control="true"
        aria-label={label}
        title={label}
        aria-pressed={active}
        onClick={toggleFullscreen}
        style={{
          width: iconSize,
          height: iconSize,
          minWidth: iconSize,
          minHeight: iconSize,
          margin: 0,
          padding: 0,
          display: 'grid',
          placeItems: 'center',
          border: 0,
          borderRight: '1px solid #c7c7c7',
          background: active ? '#dceaf5' : 'transparent',
          boxSizing: 'border-box',
          cursor: 'pointer',
          pointerEvents: 'auto',
        }}
      >
        <ExpandGlyph active={active} />
      </button>
    </>
  );
}
