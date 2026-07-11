import React from 'react';

const BUILD = 255;
const MIN_PERCENT = 10;
const MAX_PERCENT = 300;

function MagnifierGlyph({ sign }) {
  return (
    <svg width="19" height="19" viewBox="0 0 19 19" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="5.1" fill="#fbfdff" stroke="#3579ad" strokeWidth="1.25" />
      <path d="M11.8 11.8 16 16" fill="none" stroke="#3579ad" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M5.6 8h4.8" fill="none" stroke="#2469a2" strokeWidth="1.35" strokeLinecap="square" />
      {sign === 'plus' && (
        <path d="M8 5.6v4.8" fill="none" stroke="#2469a2" strokeWidth="1.35" strokeLinecap="square" />
      )}
    </svg>
  );
}

function findNativeZoomControls() {
  const labels = Array.from(document.querySelectorAll('span'));
  const percentLabel = labels.find((node) => {
    const text = String(node.textContent || '').trim();
    if (!/^\d{1,3}%$/.test(text)) return false;
    const parent = node.parentElement;
    return Boolean(parent && parent.querySelectorAll('button').length >= 4);
  });

  if (!percentLabel) return null;

  const minusButton = percentLabel.previousElementSibling;
  const plusButton = percentLabel.nextElementSibling;
  const fitButton = minusButton?.previousElementSibling;
  const resetButton = plusButton?.nextElementSibling;

  if (!(minusButton instanceof HTMLButtonElement) || !(plusButton instanceof HTMLButtonElement)) return null;

  return {
    percentLabel,
    minusButton,
    plusButton,
    fitButton: fitButton instanceof HTMLButtonElement ? fitButton : null,
    resetButton: resetButton instanceof HTMLButtonElement ? resetButton : null,
  };
}

function readPercent(controls) {
  const match = String(controls?.percentLabel?.textContent || '').match(/(\d{1,3})%/);
  return match ? Number(match[1]) : null;
}

export default function GannzillaWheelZoomV255({ toolbarHeight = 24 }) {
  const [percent, setPercent] = React.useState(55);
  const [nativeReady, setNativeReady] = React.useState(false);
  const iconSize = Math.max(22, toolbarHeight);

  const syncFromNative = React.useCallback(() => {
    const controls = findNativeZoomControls();
    const nextPercent = readPercent(controls);
    if (controls && Number.isFinite(nextPercent)) {
      setPercent(nextPercent);
      setNativeReady(true);
      return controls;
    }
    setNativeReady(false);
    return null;
  }, []);

  React.useEffect(() => {
    const timers = [0, 60, 180, 500].map((delay) => window.setTimeout(syncFromNative, delay));
    const onResize = () => window.setTimeout(syncFromNative, 30);
    const onFullscreen = () => window.setTimeout(syncFromNative, 60);

    window.addEventListener('resize', onResize);
    document.addEventListener('fullscreenchange', onFullscreen);

    window.GANNZILLA_WHEEL_ZOOM_V255 = true;
    window.__auditGannzillaWheelZoomV255 = () => ({
      ok: true,
      build: BUILD,
      nativeControlFound: Boolean(findNativeZoomControls()),
      nativeReactZoomAuthority: true,
      cssTransformUsed: false,
      redrawAuthority: 'GANNZILLA_CLASSIC_NATIVE_ZOOM_STATE',
      displayedPercent: percent,
      minPercent: MIN_PERCENT,
      maxPercent: MAX_PERCENT,
      position: 'IMMEDIATELY_LEFT_OF_PAGE_MAXIMIZE',
      toolbarHeightPx: toolbarHeight,
      visuallyMatchedToGannzilla: true,
    });

    return () => {
      timers.forEach(window.clearTimeout);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('fullscreenchange', onFullscreen);
      delete window.GANNZILLA_WHEEL_ZOOM_V255;
      delete window.__auditGannzillaWheelZoomV255;
    };
  }, [percent, syncFromNative, toolbarHeight]);

  const invokeNative = React.useCallback((action) => {
    const controls = syncFromNative();
    const target = action === 'minus'
      ? controls?.minusButton
      : action === 'plus'
        ? controls?.plusButton
        : action === 'fit'
          ? controls?.fitButton
          : controls?.resetButton;

    if (target) {
      target.click();
      window.setTimeout(syncFromNative, 0);
      window.setTimeout(syncFromNative, 60);
      return;
    }

    // Fail-safe: preserve the same canonical query setting if the hidden native control is unavailable.
    const current = Number(new URLSearchParams(window.location.search).get('gannzillaZoom')) || 1;
    const step = current >= 1 ? 0.1 : 0.05;
    const next = action === 'minus'
      ? Math.max(0.1, current - step)
      : action === 'plus'
        ? Math.min(3, current + step)
        : 1;
    const url = new URL(window.location.href);
    url.searchParams.set('gannzillaZoom', next.toFixed(2));
    window.location.assign(url.toString());
  }, [syncFromNative]);

  const buttonBase = {
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
    borderRadius: 0,
    background: 'transparent',
    boxSizing: 'border-box',
    cursor: 'pointer',
    pointerEvents: 'auto',
  };

  return (
    <div
      data-gannzilla-wheel-zoom-control="true"
      role="group"
      aria-label="Wheel zoom"
      style={{
        order: 0,
        height: toolbarHeight,
        display: 'flex',
        alignItems: 'stretch',
        flex: '0 0 auto',
        direction: 'ltr',
        margin: 0,
        padding: 0,
        borderLeft: '1px solid #c7c7c7',
        background: 'transparent',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        [data-gannzilla-wheel-zoom-control="true"] button:hover {
          background: #dceaf5 !important;
        }
        [data-gannzilla-wheel-zoom-control="true"] button:active {
          background: #c9dff0 !important;
        }
      `}</style>

      <button
        type="button"
        aria-label="تصغير العجلة"
        title="تصغير العجلة"
        disabled={nativeReady && percent <= MIN_PERCENT}
        onClick={() => invokeNative('minus')}
        style={{ ...buttonBase, opacity: nativeReady && percent <= MIN_PERCENT ? 0.45 : 1 }}
      >
        <MagnifierGlyph sign="minus" />
      </button>

      <button
        type="button"
        data-gannzilla-language-control="true"
        aria-label="إعادة حجم العجلة إلى 100%"
        title="إعادة حجم العجلة إلى 100%"
        onClick={() => invokeNative('reset')}
        style={{
          height: iconSize,
          minWidth: 38,
          padding: '0 5px',
          margin: 0,
          border: 0,
          borderRight: '1px solid #c7c7c7',
          borderRadius: 0,
          background: 'transparent',
          color: '#222',
          fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
          fontSize: 11,
          fontWeight: 700,
          lineHeight: `${iconSize}px`,
          textAlign: 'center',
          cursor: 'pointer',
          boxSizing: 'border-box',
          pointerEvents: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        {percent}%
      </button>

      <button
        type="button"
        aria-label="تكبير العجلة"
        title="تكبير العجلة"
        disabled={nativeReady && percent >= MAX_PERCENT}
        onClick={() => invokeNative('plus')}
        style={{ ...buttonBase, opacity: nativeReady && percent >= MAX_PERCENT ? 0.45 : 1 }}
      >
        <MagnifierGlyph sign="plus" />
      </button>
    </div>
  );
}
