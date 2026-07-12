import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const BUILD = 313;
const STORAGE_KEY = 'gannzilla-full-page-selected-v313';

function readStoredSelected() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function persistSelected(selected) {
  try {
    sessionStorage.setItem(STORAGE_KEY, String(Boolean(selected)));
  } catch {
    // Runtime state remains authoritative when storage is unavailable.
  }
}

function applyPageLock(selected) {
  const html = document.documentElement;
  if (selected) {
    html.setAttribute('data-gannzilla-page-maximized', 'true');
    html.setAttribute('data-gannzilla-fullpage-selected-v313', 'true');
  } else {
    html.removeAttribute('data-gannzilla-page-maximized');
    html.removeAttribute('data-gannzilla-fullpage-selected-v313');
  }
  persistSelected(selected);
  return selected;
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

export default function GannzillaPageFullscreenV253({ toolbarHeight = 24 }) {
  const { lang } = useLanguage();
  const isArabic = lang === 'ar' || new URLSearchParams(window.location.search).get('lang') === 'ar';
  const initialStored = React.useMemo(readStoredSelected, []);
  const [active, setActive] = React.useState(Boolean(document.fullscreenElement) || initialStored);
  const [fallbackActive, setFallbackActive] = React.useState(initialStored && !document.fullscreenElement);
  const selectedRef = React.useRef(Boolean(document.fullscreenElement) || initialStored);
  const nativeWasActiveRef = React.useRef(Boolean(document.fullscreenElement));
  const iconSize = Math.max(22, toolbarHeight);

  const notifyResize = React.useCallback(() => {
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new CustomEvent('gannzilla:ring-two-numbering-refresh'));
    window.dispatchEvent(new CustomEvent('gannzilla:fullpage-layout-lock-v313', {
      detail: { selected: selectedRef.current },
    }));
  }, []);

  const setSelected = React.useCallback((selected, fallback = false) => {
    selectedRef.current = Boolean(selected);
    applyPageLock(selectedRef.current);
    setFallbackActive(Boolean(selected) && Boolean(fallback));
    setActive(Boolean(document.fullscreenElement) || selectedRef.current);
    window.setTimeout(notifyResize, 0);
    window.setTimeout(notifyResize, 80);
    window.setTimeout(notifyResize, 220);
  }, [notifyResize]);

  React.useEffect(() => {
    if (selectedRef.current) applyPageLock(true);

    const onFullscreenChange = () => {
      const nativeActive = Boolean(document.fullscreenElement);
      if (nativeActive) {
        nativeWasActiveRef.current = true;
        selectedRef.current = true;
        applyPageLock(true);
        setFallbackActive(false);
        setActive(true);
      } else if (nativeWasActiveRef.current) {
        nativeWasActiveRef.current = false;
        selectedRef.current = false;
        applyPageLock(false);
        setFallbackActive(false);
        setActive(false);
      } else {
        setActive(selectedRef.current);
      }
      window.setTimeout(notifyResize, 30);
      window.setTimeout(notifyResize, 180);
    };

    const reassertSelectedLayout = () => {
      if (!selectedRef.current) return;
      applyPageLock(true);
      window.setTimeout(notifyResize, 0);
      window.setTimeout(notifyResize, 70);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    window.addEventListener('gannzilla:wheel-size-change-start-v313', reassertSelectedLayout);
    window.addEventListener('gannzilla:wheel-size-change-end-v313', reassertSelectedLayout);
    window.addEventListener('gannzilla:panel-frame-cleanup-sync', reassertSelectedLayout);

    window.GANNZILLA_PAGE_FULLSCREEN_V313 = true;
    window.__auditGannzillaPageFullscreenV313 = () => ({
      ok: true,
      build: BUILD,
      iconMounted: true,
      visualReference: 'GANNZILLA_FOUR_CORNER_PAGE_EXPAND_ICON',
      fullscreenApiSupported: Boolean(document.documentElement.requestFullscreen && document.exitFullscreen),
      fullscreenActive: Boolean(document.fullscreenElement),
      fullPageSelected: selectedRef.current,
      fallbackActive,
      persistedAcrossWheelSizeChanges: true,
      pageFrameIndependentFromWheelZoom: true,
      wheelZoomCannotClearFullPageSelection: true,
      toolbarHeightPx: toolbarHeight,
      iconSizePx: iconSize,
    });

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      window.removeEventListener('gannzilla:wheel-size-change-start-v313', reassertSelectedLayout);
      window.removeEventListener('gannzilla:wheel-size-change-end-v313', reassertSelectedLayout);
      window.removeEventListener('gannzilla:panel-frame-cleanup-sync', reassertSelectedLayout);
      delete window.GANNZILLA_PAGE_FULLSCREEN_V313;
      delete window.__auditGannzillaPageFullscreenV313;
    };
  }, [fallbackActive, iconSize, notifyResize, toolbarHeight]);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    if (fallbackActive || selectedRef.current) {
      setSelected(false, false);
      return;
    }

    try {
      if (document.documentElement.requestFullscreen) {
        selectedRef.current = true;
        applyPageLock(true);
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      } else {
        setSelected(true, true);
      }
    } catch {
      setSelected(true, true);
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
          min-width: 100vw !important;
          max-width: 100vw !important;
          height: 100vh !important;
          min-height: 100vh !important;
          max-height: 100vh !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background: #ffffff !important;
          z-index: 2147483000 !important;
          transform: none !important;
        }

        html[data-gannzilla-fullpage-selected-v313="true"] [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          min-width: 100vw !important;
          max-width: 100vw !important;
          height: 100vh !important;
          min-height: 100vh !important;
          max-height: 100vh !important;
          margin: 0 !important;
          overflow: hidden !important;
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
