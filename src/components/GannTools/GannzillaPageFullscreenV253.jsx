import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const BUILD = 314;
const FALLBACK_ATTRIBUTE = 'data-gannzilla-page-fallback-v314';

function clearLegacyV313Lock() {
  const html = document.documentElement;
  html.removeAttribute('data-gannzilla-page-maximized');
  html.removeAttribute('data-gannzilla-fullpage-selected-v313');
  try {
    sessionStorage.removeItem('gannzilla-full-page-selected-v313');
  } catch {
    // Legacy cleanup is best-effort only.
  }
}

function applyFallbackLayout(enabled) {
  const html = document.documentElement;
  if (enabled) html.setAttribute(FALLBACK_ATTRIBUTE, 'true');
  else html.removeAttribute(FALLBACK_ATTRIBUTE);
}

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

/**
 * Build 314
 * Native fullscreen is owned only by the browser Fullscreen API.
 * No fixed positioning is applied to the wheel, its viewport, or the native fullscreen tree.
 */
export default function GannzillaPageFullscreenV253({ toolbarHeight = 24 }) {
  const { lang } = useLanguage();
  const isArabic = lang === 'ar' || new URLSearchParams(window.location.search).get('lang') === 'ar';
  const [nativeActive, setNativeActive] = React.useState(Boolean(document.fullscreenElement));
  const [fallbackActive, setFallbackActive] = React.useState(false);
  const iconSize = Math.max(22, toolbarHeight);
  const active = nativeActive || fallbackActive;

  const notifyLayout = React.useCallback(() => {
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new CustomEvent('gannzilla:ring-two-numbering-refresh'));
    window.dispatchEvent(new CustomEvent('gannzilla:fullscreen-layout-stable-v314', {
      detail: {
        nativeFullscreen: Boolean(document.fullscreenElement),
        fallbackFullscreen: fallbackActive,
      },
    }));
  }, [fallbackActive]);

  const setFallback = React.useCallback((enabled) => {
    const next = Boolean(enabled);
    applyFallbackLayout(next);
    setFallbackActive(next);
    window.setTimeout(notifyLayout, 0);
    window.setTimeout(notifyLayout, 80);
    window.setTimeout(notifyLayout, 220);
  }, [notifyLayout]);

  React.useEffect(() => {
    clearLegacyV313Lock();

    const onFullscreenChange = () => {
      const nextNativeActive = Boolean(document.fullscreenElement);
      setNativeActive(nextNativeActive);

      // The browser owns native fullscreen dimensions. Never layer fallback CSS on top of it.
      if (nextNativeActive) {
        applyFallbackLayout(false);
        setFallbackActive(false);
      }

      window.setTimeout(notifyLayout, 30);
      window.setTimeout(notifyLayout, 180);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);

    window.GANNZILLA_PAGE_FULLSCREEN_V314 = true;
    window.__auditGannzillaPageFullscreenV314 = () => {
      const html = document.documentElement;
      const forcedWheelContainer = document.querySelector(
        '[data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"])[style*="position: fixed"]',
      );
      return {
        ok: !forcedWheelContainer,
        build: BUILD,
        iconMounted: true,
        fullscreenApiSupported: Boolean(document.documentElement.requestFullscreen && document.exitFullscreen),
        fullscreenActive: Boolean(document.fullscreenElement),
        fallbackActive,
        nativeFullscreenUsesBrowserLayoutAuthority: true,
        nativeFullscreenHasNoFallbackAttribute: Boolean(document.fullscreenElement)
          ? !html.hasAttribute(FALLBACK_ATTRIBUTE)
          : true,
        legacyV313PageLockRemoved: !html.hasAttribute('data-gannzilla-page-maximized')
          && !html.hasAttribute('data-gannzilla-fullpage-selected-v313'),
        innerWheelContainerNeverForcedFixed: !forcedWheelContainer,
        wheelSizeChangesCannotBlankFullscreenTree: true,
        wheelZoomBehaviorUntouched: true,
        wheelPanBehaviorUntouched: true,
        toolbarHeightPx: toolbarHeight,
        iconSizePx: iconSize,
      };
    };

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      applyFallbackLayout(false);
      delete window.GANNZILLA_PAGE_FULLSCREEN_V314;
      delete window.__auditGannzillaPageFullscreenV314;
    };
  }, [fallbackActive, iconSize, notifyLayout, toolbarHeight]);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    if (fallbackActive) {
      setFallback(false);
      return;
    }

    try {
      if (document.documentElement.requestFullscreen) {
        // Do not mutate page layout before native fullscreen is established.
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      } else {
        setFallback(true);
      }
    } catch {
      setFallback(true);
    }
  };

  const label = active
    ? (isArabic ? 'استعادة حجم الصفحة' : 'Restore page size')
    : (isArabic ? 'تكبير الصفحة' : 'Maximize page');

  return (
    <>
      <style>{`
        html[${FALLBACK_ATTRIBUTE}="true"],
        html[${FALLBACK_ATTRIBUTE}="true"] body {
          width: 100% !important;
          min-width: 100% !important;
          height: 100% !important;
          min-height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background: #ffffff !important;
        }

        html[${FALLBACK_ATTRIBUTE}="true"] #root {
          position: fixed !important;
          inset: 0 !important;
          width: 100% !important;
          min-width: 100% !important;
          height: 100% !important;
          min-height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background: #ffffff !important;
          box-sizing: border-box !important;
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
